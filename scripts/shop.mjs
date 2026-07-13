/**
 * Ausrüstungs-Shop: Katalog aus Chummer-Daten, Kauf mit Nuyen-Abzug.
 */
import { ChummerData, MODULE_ID } from './data.mjs';
import { purchasedItemData } from './items.mjs';
import {
    CATALOG_KINDS, catalogContext, fmt, gearHeaders, legalityOptions, resultCount, toggleSort,
} from './catalog.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ShopApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-shop-{id}',
        tag: 'form',
        position: { width: 820, height: 660 },
        window: { title: 'CHUMMER.Shop', icon: 'fas fa-shopping-cart', resizable: true },
        actions: {
            addCart: ShopApp.#onAddCart,
            removeCart: ShopApp.#onRemoveCart,
            buy: ShopApp.#onBuy,
            sortBy: ShopApp.#onSortBy,
        },
    };

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/shop.hbs`, scrollable: ['.cvtt-shop-list'] },
    };

    constructor(options = {}) {
        super(options);
        this.actor = options.actor;
        this.filters = { kind: 'weapons', cat: '', search: '', legality: '', maxAvail: '', affordable: false };
        this.sort = { key: 'name', dir: 'asc' };
        this.cart = [];
    }

    get title() {
        return `${game.i18n.localize('CHUMMER.Shop')}: ${this.actor?.name ?? ''}`;
    }

    #catalog = [];

    async _preFirstRender(context, options) {
        await super._preFirstRender?.(context, options);
        this.#catalog = await ChummerData.catalog(this.filters.kind);
        await ChummerData.preloadTranslations();
    }

    async _prepareContext() {
        const f = this.filters;
        const nuyen = this.actor?.system?.nuyen ?? 0;

        const { list, cats, total, shown } = catalogContext(
            this.#catalog, f.kind,
            { search: f.search, cat: f.cat, legality: f.legality, maxAvail: f.maxAvail, affordable: f.affordable },
            this.sort,
            { budget: nuyen },
        );

        const cartTotal = this.cart.reduce((sum, c) => sum + (ChummerData.evalCost(c.cost, c.rating) ?? 0), 0);

        return {
            kinds: CATALOG_KINDS.map(([id]) => ({
                id, label: game.i18n.localize(`CHUMMER.Kind.${id}`), selected: id === f.kind,
            })),
            cats,
            list,
            headers: gearHeaders('shop', this.sort),
            legalities: legalityOptions(f.legality),
            maxAvail: f.maxAvail,
            affordable: f.affordable,
            count: resultCount(shown, total),
            filter: f.search,
            cart: this.cart.map((c, i) => ({
                ...c, index: i,
                label: ChummerData.nameOf(c),
                costDisplay: fmt(ChummerData.evalCost(c.cost, c.rating) ?? 0) + '¥',
            })),
            cartTotal: fmt(cartTotal),
            nuyen: fmt(nuyen),
            canBuy: this.cart.length > 0 && cartTotal <= nuyen,
        };
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender?.(context, options);
        this.element.addEventListener('change', async ev => {
            const t = ev.target;
            switch (t.dataset.field) {
                case 'kind':
                    this.filters.kind = t.value;
                    this.filters.cat = '';
                    this.#catalog = await ChummerData.catalog(t.value);
                    break;
                case 'cat': this.filters.cat = t.value; break;
                case 'legality': this.filters.legality = t.value; break;
                case 'maxAvail': this.filters.maxAvail = t.value; break;
                case 'affordable': this.filters.affordable = t.checked; break;
                default: return;
            }
            this.render();
        });
    }

    async _onRender(context, options) {
        await super._onRender?.(context, options);
        const el = this.element;
        const search = el.querySelector('input[type="search"]');
        search?.addEventListener('input', foundry.utils.debounce(ev => {
            this.filters.search = ev.target.value;
            this.#refocus = true;
            this.render();
        }, 250));
        if (this.#refocus) {
            const inp = el.querySelector('input[type="search"]');
            if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
            this.#refocus = false;
        }
    }

    #refocus = false;

    static #onSortBy(ev, target) {
        toggleSort(this.sort, target.dataset.key);
        this.render();
    }

    static #onAddCart(ev, target) {
        const entry = this.#catalog.find(e => e.name === target.dataset.name);
        if (!entry) return;
        const row = target.closest('.cvtt-row');
        const ratingInput = row?.querySelector('input[data-rating]');
        const rating = ratingInput ? parseInt(ratingInput.value) || 1 : 0;
        this.cart.push({
            kind: this.filters.kind, name: entry.name, en: entry.en, rating,
            cost: entry.cost, avail: entry.avail, source: entry.source, page: entry.page,
        });
        this.render();
    }

    static #onRemoveCart(ev, target) {
        this.cart.splice(parseInt(target.dataset.index), 1);
        this.render();
    }

    static async #onBuy() {
        const actor = this.actor;
        if (!actor) return;
        const total = this.cart.reduce((sum, c) => sum + (ChummerData.evalCost(c.cost, c.rating) ?? 0), 0);
        const nuyen = actor.system.nuyen ?? 0;
        if (total > nuyen) {
            ui.notifications.warn(game.i18n.format('CHUMMER.NotEnoughNuyen', { cost: total, have: nuyen }));
            return;
        }

        const kindMap = Object.fromEntries(CATALOG_KINDS.map(([id, kind]) => [id, kind]));
        const items = [];
        for (const c of this.cart) {
            items.push(await purchasedItemData(kindMap[c.kind] ?? 'gear', c, c.rating));
        }

        await actor.createEmbeddedDocuments('Item', items);
        await actor.update({ 'system.nuyen': nuyen - total });

        // Kauf-Log
        const log = actor.getFlag(MODULE_ID, 'purchaseLog') ?? [];
        log.push({ date: Date.now(), items: this.cart.map(c => c.name), total });
        await actor.setFlag(MODULE_ID, 'purchaseLog', log);

        ui.notifications.info(game.i18n.format('CHUMMER.Bought', { count: this.cart.length, total: fmt(total) }));
        this.cart = [];
        this.render();
    }
}
