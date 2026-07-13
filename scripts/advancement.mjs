/**
 * Karma-Aufstieg (Career Mode) nach SR5-Kosten:
 *   Attribut: neue Stufe × 5 · Fertigkeit: neue Stufe × 2 · Gruppe: neue Stufe × 5
 *   Neue Fertigkeit: 2 · Spezialisierung: 7 · Zauber: 5 · Komplexe Form: 4 · Quality: 2 × Karma
 */
import { ChummerData, MODULE_ID } from './data.mjs';
import { qualityItemData, spellItemData, complexFormItemData, skillItemData } from './items.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const ATTRS = ['body', 'agility', 'reaction', 'strength', 'charisma', 'intuition', 'logic', 'willpower', 'edge'];

/** Lokalisierter Attributsname für einen System-Attributsschlüssel. */
function attrLabel(key) {
    const loc = game.i18n.localize(`CHUMMER.Attr.${key}`);
    return loc === `CHUMMER.Attr.${key}` ? key : loc;
}

export class AdvancementApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-advance-{id}',
        tag: 'form',
        position: { width: 720, height: 640 },
        window: { title: 'CHUMMER.Advancement', icon: 'fas fa-arrow-trend-up', resizable: true },
        actions: {
            raiseAttr: AdvancementApp.#onRaiseAttr,
            raiseSkill: AdvancementApp.#onRaiseSkill,
            addSpec: AdvancementApp.#onAddSpec,
            newSkill: AdvancementApp.#onNewSkill,
            newSpell: AdvancementApp.#onNewSpell,
            newCF: AdvancementApp.#onNewCF,
            buyQuality: AdvancementApp.#onBuyQuality,
        },
    };

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/advancement.hbs`, scrollable: ['.cvtt-advance-body'] },
    };

    constructor(options = {}) {
        super(options);
        this.actor = options.actor;
    }

    get title() {
        return game.i18n.format('CHUMMER.Advance.Title', { name: this.actor?.name ?? '' });
    }

    get #karma() {
        return this.actor?.system?.karma?.value ?? 0;
    }

    async #spend(cost, note, updates) {
        if (cost > this.#karma) {
            ui.notifications.warn(game.i18n.format('CHUMMER.Advance.NotEnoughKarma', { cost, have: this.#karma }));
            return false;
        }
        await updates();
        await this.actor.update({ 'system.karma.value': this.#karma - cost });
        const log = this.actor.getFlag(MODULE_ID, 'karmaLog') ?? [];
        log.push({ date: Date.now(), note, karma: -cost });
        await this.actor.setFlag(MODULE_ID, 'karmaLog', log);
        this.render();
        return true;
    }

    async _prepareContext() {
        const actor = this.actor;
        const system = actor.system;
        const [skillData, spellData, cfData, qualityData] = await Promise.all([
            ChummerData.skills(), ChummerData.spells(), ChummerData.complexforms(), ChummerData.qualities(),
        ]);
        await ChummerData.preloadTranslations();

        const attrs = ATTRS
            .concat(system.special === 'magic' ? ['magic'] : system.special === 'resonance' ? ['resonance'] : [])
            .map(key => {
                const value = system.attributes?.[key]?.base ?? 0;
                return { key, label: attrLabel(key), value, next: value + 1, cost: (value + 1) * 5 };
            });

        const skills = actor.items
            .filter(i => i.type === 'skill' && i.system.skill?.category === 'active')
            .map(i => ({
                id: i.id, name: i.name,
                rating: i.system.skill.rating ?? 0,
                next: (i.system.skill.rating ?? 0) + 1,
                cost: ((i.system.skill.rating ?? 0) + 1) * 2,
                specs: (i.system.skill.specializations ?? []).map(sp => sp.name).join(', '),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Besitz per deutschem UND englischem Namen prüfen (Items tragen den Anzeigenamen).
        const owned = new Set(actor.items.map(i => i.name));
        const has = def => owned.has(def.name) || (def.en && owned.has(def.en));
        const pick = def => ({ name: def.name, label: ChummerData.nameOf(def) });
        const newSkills = skillData.skills.filter(sk => !has(sk)).map(pick);
        const newSpells = system.special === 'magic'
            ? spellData.filter(sp => !has(sp)).map(pick) : [];
        const newCFs = system.special === 'resonance'
            ? cfData.filter(cf => !has(cf)).map(pick) : [];
        const qualities = qualityData
            .filter(q => q.category === 'Positive' && !q.chargenonly && !has(q))
            .map(q => ({ ...pick(q), cost: (parseInt(q.karma) || 0) * 2 }));

        const log = (actor.getFlag(MODULE_ID, 'karmaLog') ?? [])
            .slice(-30).reverse()
            .map(e => ({
                ...e,
                dateDisplay: new Date(e.date).toLocaleDateString(game.i18n.lang),
                karmaDisplay: (e.karma > 0 ? '+' : '') + e.karma,
                positive: e.karma > 0,
            }));

        return { karma: this.#karma, attrs, skills, newSkills, newSpells, newCFs, qualities, log };
    }

    // ------------------------------------------------------------- Aktionen

    static async #onRaiseAttr(ev, target) {
        const key = target.dataset.key;
        const cur = this.actor.system.attributes?.[key]?.base ?? 0;
        const cost = (cur + 1) * 5;
        await this.#spend(cost, `${attrLabel(key)} ${cur} → ${cur + 1}`, async () => {
            await this.actor.update({ [`system.attributes.${key}.base`]: cur + 1 });
        });
    }

    static async #onRaiseSkill(ev, target) {
        const item = this.actor.items.get(target.dataset.id);
        if (!item) return;
        const cur = item.system.skill.rating ?? 0;
        const cost = (cur + 1) * 2;
        await this.#spend(cost, `${item.name} ${cur} → ${cur + 1}`, async () => {
            await item.update({ 'system.skill.rating': cur + 1 });
        });
    }

    static async #onAddSpec(ev, target) {
        const item = this.actor.items.get(target.dataset.id);
        const input = target.closest('.cvtt-row')?.querySelector('input[type="text"]');
        const name = input?.value?.trim();
        if (!item || !name) return;
        const specs = foundry.utils.deepClone(item.system.skill.specializations ?? []);
        specs.push({ name });
        await this.#spend(7, game.i18n.format('CHUMMER.Advance.NoteSpec', { skill: item.name, name }), async () => {
            await item.update({ 'system.skill.specializations': specs });
        });
    }

    static async #onNewSkill(ev, target) {
        const select = this.element.querySelector('select[data-pick="skill"]');
        const name = select?.value;
        if (!name) return;
        const skillData = await ChummerData.skills();
        const def = skillData.skills.find(sk => sk.name === name);
        if (!def) return;
        await this.#spend(2, game.i18n.format('CHUMMER.Advance.NoteNewSkill', { name: ChummerData.nameOf(def) }), async () => {
            await this.actor.createEmbeddedDocuments('Item', [await skillItemData(def, 1)]);
        });
    }

    static async #onNewSpell(ev, target) {
        const select = this.element.querySelector('select[data-pick="spell"]');
        const name = select?.value;
        if (!name) return;
        const def = (await ChummerData.spells()).find(sp => sp.name === name);
        if (!def) return;
        await this.#spend(5, game.i18n.format('CHUMMER.Advance.NoteNewSpell', { name: ChummerData.nameOf(def) }), async () => {
            await this.actor.createEmbeddedDocuments('Item', [await spellItemData(def)]);
        });
    }

    static async #onNewCF(ev, target) {
        const select = this.element.querySelector('select[data-pick="cf"]');
        const name = select?.value;
        if (!name) return;
        const def = (await ChummerData.complexforms()).find(cf => cf.name === name);
        if (!def) return;
        await this.#spend(4, game.i18n.format('CHUMMER.Advance.NoteNewCF', { name: ChummerData.nameOf(def) }), async () => {
            await this.actor.createEmbeddedDocuments('Item', [await complexFormItemData(def)]);
        });
    }

    static async #onBuyQuality(ev, target) {
        const select = this.element.querySelector('select[data-pick="quality"]');
        const name = select?.value;
        if (!name) return;
        const def = (await ChummerData.qualities()).find(q => q.name === name);
        if (!def) return;
        const cost = (parseInt(def.karma) || 0) * 2;
        await this.#spend(cost, game.i18n.format('CHUMMER.Advance.NoteQuality', { name: ChummerData.nameOf(def) }), async () => {
            await this.actor.createEmbeddedDocuments('Item', [await qualityItemData(def)]);
        });
    }
}
