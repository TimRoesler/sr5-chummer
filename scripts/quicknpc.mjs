/**
 * Schnell-NSC: GRW-Vorlage (grunts.json, PS 0–6) öffnen, anpassen
 * (Attribute, Fertigkeiten, Magie/Resonanz, Ausrüstung) und als
 * NSC/Schergen speichern – ohne den vollen Chargen-Wizard.
 */
import { MODULE_ID, ChummerData } from './data.mjs';
import { GruntImporter } from './grunts.mjs';
import { applySkillPlan } from './import-map.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Systemattribut → Kurzlabel-Schlüssel (CHUMMER.AttrShort.*). */
const ATTR_SHORT = {
    body: 'bod', agility: 'agi', reaction: 'rea', strength: 'str',
    charisma: 'cha', intuition: 'int', logic: 'log', willpower: 'wil',
};

const DISPOSITIONS = ['hostile', 'neutral', 'friendly'];
const GEAR_KINDS = ['weapons', 'armor', 'gear', 'cyberware', 'bioware'];
const GEAR_ICONS = { weapons: 'fa-gun', armor: 'fa-shield-halved', gear: 'fa-box', cyberware: 'fa-microchip', bioware: 'fa-dna' };

export class QuickNpcApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-quicknpc',
        tag: 'form',
        position: { width: 840, height: 700 },
        window: { title: 'CHUMMER.QuickNpc.Title', icon: 'fas fa-bolt', resizable: true },
        actions: {
            pick: QuickNpcApp.#onPick,
            back: QuickNpcApp.#onBack,
            adjust: QuickNpcApp.#onAdjust,
            removeEntry: QuickNpcApp.#onRemoveEntry,
            addGear: QuickNpcApp.#onAddGear,
            create: QuickNpcApp.#onCreate,
        },
    };

    static PARTS = {
        content: {
            template: `modules/${MODULE_ID}/templates/quicknpc.hbs`,
            scrollable: ['.cvtt-quicknpc-list', '.cvtt-quicknpc-body'],
        },
    };

    state = {
        view: 'pick',           // pick | edit
        name: '',               // leer = Vorlagenname
        count: 1,
        grunt: true,            // gemeinsamer Zustandsmonitor
        disposition: 'hostile',
    };
    filter = '';                // Vorlagensuche
    gearKind = 'weapons';
    gearSearch = '';
    #defs = null;
    #skills = null;
    #def = null;                // editierbare Kopie der gewählten Vorlage
    #gearCatalogs = new Map();

    async #loadData() {
        this.#defs ??= await ChummerData.load('grunts');
        this.#skills ??= await ChummerData.skills();
        await ChummerData.preloadTranslations();
        return this.#defs;
    }

    async #catalog(kind) {
        if (!this.#gearCatalogs.has(kind)) this.#gearCatalogs.set(kind, await ChummerData.catalog(kind));
        return this.#gearCatalogs.get(kind);
    }

    /** Vorlage in eine editierbare Kopie überführen (Skillgruppen expandiert). */
    #pickTemplate(name) {
        const src = this.#defs.grunts.find(g => g.name === name);
        if (!src) return;
        const def = foundry.utils.deepClone(src);
        const ratings = {};
        const specs = {};
        for (const grp of def.skillGroups ?? []) {
            for (const sk of this.#skills.skills.filter(x => x.groupEn === grp.en && x.en !== 'Flight')) {
                ratings[sk.en] = Math.max(ratings[sk.en] ?? 0, grp.rating);
            }
        }
        for (const sk of def.skills ?? []) {
            ratings[sk.en] = Math.max(ratings[sk.en] ?? 0, sk.rating);
            if (sk.specs?.length) specs[sk.en] = sk.specs;
        }
        delete def.skillGroups;
        def.skills = Object.entries(ratings).map(([en, rating]) => ({ en, rating, specs: specs[en] }));
        def.qualities ??= [];
        def.spells ??= [];
        def.powers ??= [];
        def.complexforms ??= [];
        def.weapons ??= [];
        def.armor ??= [];
        def.gear ??= [];
        def.ware ??= [];
        this.#def = def;
        this.state.view = 'edit';
        this.state.name = '';
        this.gearSearch = '';
    }

    #skillLabel(en) {
        const def = this.#skills.skills.find(x => (x.en ?? x.name) === en);
        return def ? ChummerData.nameOf(def) : en;
    }

    // -------------------------------------------------------------- Kontext

    async _prepareContext() {
        await this.#loadData();
        return this.state.view === 'edit' && this.#def
            ? this.#ctxEdit()
            : this.#ctxPick();
    }

    #ctxPick() {
        const f = this.filter.toLowerCase();
        const prName = Object.fromEntries(this.#defs.folders.map(x => [x.id, x.name]));
        return {
            pick: true,
            filter: this.filter,
            cards: this.#defs.grunts
                .filter(g => !f || g.name.toLowerCase().includes(f) || (prName[g.folder] ?? '').toLowerCase().includes(f))
                .map(g => ({
                    name: g.name,
                    pr: g.pr,
                    leader: !!g.leader,
                    group: prName[g.folder] ?? `PS ${g.pr}`,
                    magic: !!(g.spells?.length || g.powers?.length),
                    matrix: !!g.complexforms?.length,
                    attrs: Object.entries(g.attributes).map(([k, v]) => ({
                        label: game.i18n.localize(`CHUMMER.AttrShort.${ATTR_SHORT[k] ?? k}`),
                        value: v,
                    })),
                    loadout: [
                        ...(g.weapons ?? []).map(w => typeof w === 'string' ? w : w.name),
                        ...(g.armor ?? []),
                    ].join(', '),
                })),
        };
    }

    async #ctxEdit() {
        const d = this.#def;
        const s = this.state;

        const attrs = Object.entries(d.attributes).map(([k, v]) => ({
            key: k,
            label: game.i18n.localize(`CHUMMER.Attr.${k}`),
            value: v,
        }));
        const specials = [{ key: 'edge', label: game.i18n.localize('CHUMMER.Attr.edge'), value: d.edge ?? d.pr ?? 0 }];
        if (d.magic !== undefined) specials.push({ key: 'magic', label: game.i18n.localize('CHUMMER.Attr.magic'), value: d.magic });
        if (d.resonance !== undefined) specials.push({ key: 'resonance', label: game.i18n.localize('CHUMMER.Attr.resonance'), value: d.resonance });

        const skills = d.skills
            .map((sk, index) => ({
                index,
                label: this.#skillLabel(sk.en),
                rating: sk.rating,
                specs: (sk.specs ?? []).join(', '),
            }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
        const skillOptions = this.#skills.skills
            .filter(sk => !d.skills.some(x => x.en === (sk.en ?? sk.name)))
            .map(sk => ({ value: sk.en ?? sk.name, label: ChummerData.nameOf(sk) }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));

        // Magie/Resonanz: Abschnitte nur zeigen, wenn das Attribut vorhanden ist.
        const magicUser = d.magic !== undefined;
        const resonanceUser = d.resonance !== undefined;
        const nameSort = (a, b) => a.label.localeCompare(b.label, game.i18n.lang);
        const magic = {
            show: magicUser || resonanceUser || d.qualities.length > 0,
            spells: d.spells.map((n, index) => ({ index, label: ChummerData.nameOf(n) })),
            powers: d.powers.map((p, index) => ({ index, label: p.name + (p.level ? ` ${p.level}` : '') })),
            complexforms: d.complexforms.map((cf, index) => ({ index, label: cf.name })),
            qualities: d.qualities.map((n, index) => ({ index, label: ChummerData.nameOf(n) })),
            magicUser, resonanceUser,
        };
        if (magicUser) {
            magic.spellOptions = (await ChummerData.spells())
                .filter(sp => !d.spells.includes(sp.name))
                .map(sp => ({ value: sp.name, label: ChummerData.nameOf(sp) })).sort(nameSort);
            magic.powerOptions = (await ChummerData.powers())
                .filter(pw => !d.powers.some(x => (x.base ?? x.name) === pw.name))
                .map(pw => ({ value: pw.name, label: ChummerData.nameOf(pw) })).sort(nameSort);
        }
        if (resonanceUser) {
            magic.cfOptions = (await ChummerData.complexforms())
                .filter(cf => !d.complexforms.some(x => (x.base ?? x.name) === cf.name))
                .map(cf => ({ value: cf.name, label: ChummerData.nameOf(cf) })).sort(nameSort);
        }
        magic.qualityOptions = (await ChummerData.qualities())
            .filter(q => !d.qualities.includes(q.name))
            .map(q => ({ value: q.name, label: ChummerData.nameOf(q) })).sort(nameSort);

        // Ausrüstung: vereinheitlichte Chip-Liste mit Herkunfts-Icons.
        const gearItems = [
            ...d.weapons.map((w, index) => ({ list: 'weapons', index, icon: GEAR_ICONS.weapons, label: typeof w === 'string' ? w : w.name })),
            ...d.armor.map((n, index) => ({ list: 'armor', index, icon: GEAR_ICONS.armor, label: n })),
            ...d.gear.map((e, index) => ({ list: 'gear', index, icon: GEAR_ICONS.gear, label: e.name + (e.rating ? ` ${e.rating}` : '') })),
            ...d.ware.map((e, index) => ({ list: 'ware', index, icon: GEAR_ICONS[e.kind] ?? 'fa-microchip', label: e.name + (e.rating ? ` ${e.rating}` : '') })),
        ];

        // Katalog-Vorschläge für die Ausrüstungssuche.
        let gearSuggestions = [];
        const q = this.gearSearch.toLowerCase();
        if (q.length >= 2) {
            const catalog = await this.#catalog(this.gearKind);
            gearSuggestions = catalog
                .filter(e => e.name.toLowerCase().includes(q) || (e.en ?? '').toLowerCase().includes(q))
                .slice(0, 8)
                .map(e => ({
                    name: e.name,
                    label: ChummerData.nameOf(e),
                    category: ChummerData.catDe(this.gearKind, e.category ?? ''),
                    cost: e.cost,
                    avail: e.avail ?? '',
                }));
        }

        return {
            edit: true,
            state: s,
            templateName: this.#def.name,
            pr: d.pr,
            attrs, specials, skills, skillOptions,
            magic,
            gearItems,
            gearKinds: GEAR_KINDS.map(id => ({
                id, label: game.i18n.localize(`CHUMMER.Kind.${id}`), selected: id === this.gearKind,
            })),
            gearSearch: this.gearSearch,
            gearSuggestions,
            nameValue: s.name,
            namePlaceholder: this.#def.name,
            dispositions: DISPOSITIONS.map(dsp => ({
                value: dsp,
                label: game.i18n.localize(`CHUMMER.QuickNpc.${dsp.capitalize()}`),
                selected: s.disposition === dsp,
            })),
        };
    }

    // ---------------------------------------------------------- Interaktion

    async _onFirstRender(context, options) {
        await super._onFirstRender?.(context, options);
        this.element.addEventListener('change', ev => this.#applyField(ev.target));
    }

    async _onRender(context, options) {
        await super._onRender?.(context, options);
        const el = this.element;
        el.querySelectorAll('input[data-filter]').forEach(inp => {
            inp.addEventListener('input', foundry.utils.debounce(ev => {
                if (ev.target.dataset.filter === 'tpl') this.filter = ev.target.value;
                else this.gearSearch = ev.target.value;
                this.#refocus = ev.target.dataset.filter;
                this.render();
            }, 250));
        });
        if (this.#refocus) {
            const inp = el.querySelector(`input[data-filter="${this.#refocus}"]`);
            if (inp) {
                inp.focus();
                inp.setSelectionRange(inp.value.length, inp.value.length);
            }
            this.#refocus = null;
        }
    }

    #refocus = null;

    #applyField(t) {
        const s = this.state;
        const d = this.#def;
        switch (t.dataset.field) {
            case 'name': s.name = t.value; return;
            case 'count': s.count = Math.min(20, Math.max(1, parseInt(t.value) || 1)); break;
            case 'grunt': s.grunt = t.checked; break;
            case 'disposition': s.disposition = t.value; break;
            case 'npcAttr': d.attributes[t.dataset.key] = Math.min(30, Math.max(0, parseInt(t.value) || 0)); break;
            case 'npcSpecial': {
                const v = Math.min(30, Math.max(0, parseInt(t.value) || 0));
                if (t.dataset.key === 'edge') d.edge = v; else d[t.dataset.key] = v;
                break;
            }
            case 'skillRating': {
                const sk = d.skills[parseInt(t.dataset.index)];
                if (sk) sk.rating = Math.min(13, Math.max(1, parseInt(t.value) || 1));
                break;
            }
            case 'addSkill': if (t.value) d.skills.push({ en: t.value, rating: 3 }); break;
            case 'addSpell': if (t.value) d.spells.push(t.value); break;
            case 'addPower': if (t.value) d.powers.push({ name: t.value }); break;
            case 'addCF': if (t.value) d.complexforms.push({ name: t.value }); break;
            case 'addQuality': if (t.value) d.qualities.push(t.value); break;
            case 'gearKind': this.gearKind = t.value; this.gearSearch = ''; break;
            default: return;
        }
        this.render();
    }

    /** −/+-Stepper (gleiches Muster wie im Chargen). */
    static #onAdjust(ev, target) {
        const input = target.closest('.cvtt-stepper')?.querySelector('input');
        if (!input) return;
        const delta = parseInt(target.dataset.delta) || 0;
        const min = input.min !== '' ? parseInt(input.min) : 0;
        const max = input.max !== '' ? parseInt(input.max) : Infinity;
        input.value = Math.min(max, Math.max(min, (parseInt(input.value) || 0) + delta));
        this.#applyField(input);
    }

    static #onPick(ev, target) {
        this.#pickTemplate(target.dataset.name);
        this.render();
    }

    static #onBack() {
        this.state.view = 'pick';
        this.render();
    }

    /** Eintrag aus einer Vorlagen-Liste entfernen (Skills, Zauber, Ausrüstung, …). */
    static #onRemoveEntry(ev, target) {
        const list = this.#def?.[target.dataset.list];
        if (!Array.isArray(list)) return;
        list.splice(parseInt(target.dataset.index), 1);
        this.render();
    }

    static async #onAddGear(ev, target) {
        const d = this.#def;
        const name = target.dataset.name;
        switch (this.gearKind) {
            case 'weapons': d.weapons.push(name); break;
            case 'armor': d.armor.push(name); break;
            case 'gear': d.gear.push({ name }); break;
            case 'cyberware':
            case 'bioware': d.ware.push({ kind: this.gearKind, name }); break;
        }
        this.gearSearch = '';
        this.render();
    }

    // ------------------------------------------------------------ Speichern

    static async #onCreate() {
        const s = this.state;
        const d = this.#def;
        if (!d) return;

        const name = s.name.trim() || d.name;
        const base = await GruntImporter.actorData(d, this.#skills);
        const skillPlan = base.skillPlan ?? [];
        delete base.skillPlan;
        const dispo = {
            hostile: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            neutral: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            friendly: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        }[s.disposition] ?? CONST.TOKEN_DISPOSITIONS.HOSTILE;

        // Trupps landen in einem eigenen Actor-Ordner.
        let folderId = null;
        if (s.count > 1) {
            const folder = game.folders.find(x => x.type === 'Actor' && x.name === name)
                ?? await Folder.create({ name, type: 'Actor' });
            folderId = folder.id;
        }

        const docs = [];
        for (let i = 0; i < s.count; i++) {
            const data = foundry.utils.deepClone(base);
            data.name = s.count > 1 ? `${name} ${i + 1}` : name;
            data.folder = folderId;
            data.system.npc.is_grunt = s.grunt;
            data.prototypeToken.actorLink = false;
            data.prototypeToken.disposition = dispo;
            docs.push(data);
        }
        const actors = await Actor.createDocuments(docs);
        for (const actor of actors) await applySkillPlan(actor, skillPlan);

        ui.notifications.info(game.i18n.format('CHUMMER.QuickNpc.Created', { count: s.count, name }));
        if (actors.length === 1) actors[0].sheet?.render(true);
        this.close();
    }
}
