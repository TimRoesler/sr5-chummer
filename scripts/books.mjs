/**
 * Aktive Regelwerke: Einstellungs-App, mit der die Spielleitung festlegt,
 * welche Quellenbücher in Chargen, Shop, Schnell-NSC und Aufstieg angeboten
 * werden. Das Grundregelwerk (SR5) ist immer aktiv.
 */
import { ChummerData, MODULE_ID, SETTING_DISABLED_BOOKS, CORE_BOOK } from './data.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Datendateien, deren Einträge ein source-Feld tragen. */
const DATA_FILES = [
    'weapons', 'armor', 'gear', 'cyberware', 'bioware', 'vehicles', 'lifestyles',
    'spells', 'powers', 'complexforms', 'qualities', 'metatypes',
];

export class BooksConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-book-config',
        tag: 'form',
        position: { width: 560, height: 640 },
        window: { title: 'CHUMMER.BookConfig', icon: 'fas fa-book', resizable: true },
        form: {
            handler: BooksConfig.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        actions: {
            enableAll: BooksConfig.#onEnableAll,
            coreOnly: BooksConfig.#onCoreOnly,
        },
    };

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/book-config.hbs`, scrollable: [''] },
    };

    /** Anzahl Dateneinträge je Buchcode (einmal je Sitzung ermittelt). */
    static #counts = null;

    static async #countEntries() {
        if (this.#counts) return this.#counts;
        const counts = {};
        const add = code => { if (code) counts[code] = (counts[code] ?? 0) + 1; };
        for (const file of DATA_FILES) {
            let list;
            try {
                list = await ChummerData.load(file);
            } catch {
                continue;
            }
            if (!Array.isArray(list)) continue;
            for (const entry of list) {
                add(entry.source);
                for (const v of entry.metavariants ?? []) add(v.source);
            }
        }
        this.#counts = counts;
        return counts;
    }

    async _prepareContext() {
        const [books, counts] = await Promise.all([ChummerData.books(), BooksConfig.#countEntries()]);
        const disabled = ChummerData.disabledBooks();
        const byCode = Object.fromEntries(books.map(b => [b.code, b]));
        const rows = Object.entries(counts)
            .map(([code, count]) => ({
                code,
                count,
                name: ChummerData.nameOf(byCode[code]) || code,
                core: code === CORE_BOOK,
                active: code === CORE_BOOK || !disabled.has(code),
            }))
            .sort((a, b) => (b.core - a.core) || a.name.localeCompare(b.name, game.i18n.lang));
        return {
            hint: game.i18n.localize('CHUMMER.BookConfigHint'),
            books: rows,
            buttons: [{ type: 'submit', icon: 'fas fa-save', label: 'SETTINGS.Save' }],
        };
    }

    _onRender(context, options) {
        super._onRender?.(context, options);
        // Zeilen-Hervorhebung folgt dem Häkchen ohne Neu-Rendern.
        this.element.addEventListener('change', ev => {
            const box = ev.target.closest('input[type="checkbox"]');
            box?.closest('.cvtt-row')?.classList.toggle('selected', box.checked);
        });
    }

    static #setAll(app, active) {
        for (const box of app.element.querySelectorAll('input[type="checkbox"]:not(:disabled)')) {
            box.checked = active;
            box.closest('.cvtt-row')?.classList.toggle('selected', active);
        }
    }

    static #onEnableAll() { BooksConfig.#setAll(this, true); }
    static #onCoreOnly() { BooksConfig.#setAll(this, false); }

    static async #onSubmit(event, form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        const disabled = Object.entries(data.book ?? {})
            .filter(([code, active]) => !active && code !== CORE_BOOK)
            .map(([code]) => code);
        await game.settings.set(MODULE_ID, SETTING_DISABLED_BOOKS, disabled);
        ui.notifications.info(game.i18n.localize('CHUMMER.BookConfigSaved'));
    }
}
