/**
 * Charaktererschaffung nach dem SR5-Prioritätensystem (Chummer-Daten).
 * Erstellt Spielercharaktere, NSC und Schergen (Grunts).
 */
import { ChummerData, MODULE_ID } from './data.mjs';
import { SourceLinks } from './sources.mjs';
import {
    purchasedItemData, qualityItemData, spellItemData,
    complexFormItemData, adeptPowerItemData, mapAttribute, sourceString,
    contactItemData, knowledgeSkillItemData, focusBindingKarma,
} from './items.mjs';
import { buildSkillPlanEntry, applySkillPlan } from './import-map.mjs';
import {
    CATALOG_KINDS, catalogContext, fmt, gearHeaders, legalityOptions,
    listHeaders, resultCount, sortRows, toggleSort,
} from './catalog.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const PRIO_CATS = ['heritage', 'attributes', 'talent', 'skills', 'resources'];
const PRIO_ICONS = {
    heritage: 'fa-dna', attributes: 'fa-dumbbell', talent: 'fa-wand-sparkles',
    skills: 'fa-graduation-cap', resources: 'fa-coins',
};
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const PHYS_MENTAL = ['bod', 'agi', 'rea', 'str', 'cha', 'int', 'log', 'wil'];
const STEPS = ['Priorities', 'Metatype', 'Attributes', 'Qualities', 'Skills', 'Talent', 'Background', 'Gear', 'Summary'];
const STEP_ICONS = ['fa-list-ol', 'fa-dna', 'fa-dumbbell', 'fa-masks-theater', 'fa-graduation-cap', 'fa-wand-sparkles', 'fa-address-book', 'fa-cart-shopping', 'fa-flag-checkered'];

/** Wissensfertigkeits-Typen (GRW) mit zugehörigem Attribut. */
const KNOWLEDGE_TYPES = [
    { id: 'academic', attribute: 'logic' },
    { id: 'professional', attribute: 'logic' },
    { id: 'street', attribute: 'intuition' },
    { id: 'interests', attribute: 'intuition' },
    { id: 'language', attribute: 'intuition' },
];

/** GRW-Traditionen: bestimmen das zweite Entzugsattribut (neben Willenskraft). */
const TRADITIONS = [
    { id: 'hermetic', attribute: 'logic' },
    { id: 'shamanic', attribute: 'charisma' },
];
const GEAR_KINDS = CATALOG_KINDS;

/** Charaktertypen: Spielercharakter, NSC, Scherge (Grunt). */
const ACTOR_TYPES = [
    { id: 'pc', icon: 'fa-user' },
    { id: 'npc', icon: 'fa-user-tie' },
    { id: 'grunt', icon: 'fa-users' },
];

/** Auswahlfilter für freie Talent-Fertigkeiten (skilltype aus priorities.json). */
const FREE_SKILL_FILTERS = {
    magic: sk => sk.category === 'Magical Active' || sk.category === 'Pseudo-Magical Active',
    resonance: sk => sk.category === 'Resonance Active',
    matrix: sk => ['Computer', 'Cybercombat', 'Electronic Warfare', 'Hacking', 'Hardware', 'Software'].includes(sk.en ?? sk.name),
    // xpath (Adept: eine beliebige Aktionsfertigkeit) und specific: keine Einschränkung
};

/** Lokalisierter Attributsname ("Konstitution" / "Body") für ein Chummer-Kürzel. */
function attrLabel(key) {
    return game.i18n.localize(`CHUMMER.Attr.${mapAttribute(key)}`);
}

export class ChargenApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-chargen',
        tag: 'form',
        position: { width: 920, height: 740 },
        window: { title: 'CHUMMER.Chargen', icon: 'fas fa-user-plus', resizable: true },
        actions: {
            gotoStep: ChargenApp.#onGotoStep,
            next: ChargenApp.#onNext,
            back: ChargenApp.#onBack,
            adjust: ChargenApp.#onAdjust,
            toggleQuality: ChargenApp.#onToggleQuality,
            toggleSpell: ChargenApp.#onToggleSpell,
            toggleCF: ChargenApp.#onToggleCF,
            togglePower: ChargenApp.#onTogglePower,
            addCart: ChargenApp.#onAddCart,
            removeCart: ChargenApp.#onRemoveCart,
            addContact: ChargenApp.#onAddContact,
            removeContact: ChargenApp.#onRemoveContact,
            addKnowledge: ChargenApp.#onAddKnowledge,
            removeKnowledge: ChargenApp.#onRemoveKnowledge,
            sortBy: ChargenApp.#onSortBy,
            create: ChargenApp.#onCreate,
            qualityPage: ChargenApp.#onQualityPage,
        },
    };

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/chargen.hbs`, scrollable: ['.cvtt-step-body'] },
    };

    state = {
        step: 0,
        name: '',
        actorType: 'pc',        // pc | npc | grunt
        prio: { heritage: '', attributes: '', talent: '', skills: '', resources: '' },
        metatype: '', metavariant: '',
        attrs: {},              // chummer-kürzel → gewählter Wert
        special: { edg: 0, mag: 0, res: 0 },
        talent: '',
        qualities: [],          // Namen
        skills: {},             // name → rating
        groups: {},             // gruppe → rating
        spells: [], complexforms: [], powers: {}, // powers: name → level
        freeSkills: [],         // freie Talent-Fertigkeiten (Namen, Länge ≤ skillqty)
        mysticPP: 0,
        karmaNuyen: 0,
        cart: [],               // {kind, name, rating}
        tradition: 'hermetic',  // GRW: hermetisch | schamanisch
        contacts: [],           // {name, role, connection, loyalty}
        knowledge: [],          // {name, type, rating}
        nativeLanguage: '',     // Muttersprache (gratis, GRW)
    };

    filters = {
        quality: '', skill: '', spell: '', power: '', gear: '',
        gearKind: 'weapons', gearCat: '', gearLegality: '', gearMaxAvail: '',
        qualityType: '', skillAttr: '', spellCat: '',
    };
    sorts = {
        gear: { key: 'name', dir: 'asc' },
        quality: { key: 'name', dir: 'asc' },
        skill: { key: 'name', dir: 'asc' },
        spell: { key: 'name', dir: 'asc' },
    };
    pages = { quality: 0 };
    #data = null;

    async #loadData() {
        if (this.#data) return this.#data;
        const [priorities, metatypes, skills, qualities, spells, powers, complexforms] = await Promise.all([
            ChummerData.priorities(), ChummerData.metatypes(), ChummerData.skills(),
            ChummerData.qualities(), ChummerData.spells(), ChummerData.powers(), ChummerData.complexforms(),
        ]);
        await ChummerData.preloadTranslations();
        this.#data = { priorities, metatypes, skills, qualities, spells, powers, complexforms };
        return this.#data;
    }

    // ------------------------------------------------------------ Ableitungen

    get #metatypeDef() {
        const meta = this.#data.metatypes.find(m => m.name === this.state.metatype);
        if (!meta) return null;
        if (this.state.metavariant) {
            const v = (meta.metavariants ?? []).find(v => v.name === this.state.metavariant);
            if (v) return { ...v, base: meta };
        }
        return meta;
    }

    get #heritageEntry() {
        const list = this.#data.priorities.heritage[this.state.prio.heritage] ?? [];
        const m = list.find(e => e.name === this.state.metatype);
        if (!m) return null;
        if (this.state.metavariant) {
            const v = (m.metavariants ?? []).find(v => v.name === this.state.metavariant);
            if (v) return v;
        }
        return m;
    }

    get #talentDef() {
        const list = this.#data.priorities.talent[this.state.prio.talent] ?? [];
        return list.find(t => t.value === this.state.talent || t.name === this.state.talent) ?? null;
    }

    /** Freie Fertigkeiten des gewählten Talents ({qty, val, type} oder null). */
    get #freeSkillCfg() {
        const t = this.#talentDef;
        if (!t?.skillqty || !t?.skillval) return null;
        return { qty: t.skillqty, val: t.skillval, type: t.skilltype ?? '' };
    }

    /** Attributwert (gewählt oder Metatyp-Minimum). */
    #attrValue(key) {
        const def = this.#metatypeDef;
        const range = def?.attrs?.[key] ?? [1, 6, 0];
        const v = this.state.attrs[key];
        return Math.min(Math.max(v ?? range[0], range[0]), range[1]);
    }

    #computeBudgets() {
        const s = this.state;
        const p = this.#data.priorities;

        const talent = this.#talentDef;
        const magic = talent?.magic ?? 0;
        const resonance = talent?.resonance ?? 0;
        const isAdept = /Adept/i.test(talent?.value ?? '') && !/Mystic/i.test(talent?.value ?? '');
        const isMystic = /Mystic/i.test(talent?.value ?? '');

        const attrPoints = p.attributes[s.prio.attributes] ?? 0;
        const attrSpent = PHYS_MENTAL.reduce((sum, k) => {
            const range = this.#metatypeDef?.attrs?.[k] ?? [1, 6, 0];
            return sum + (this.#attrValue(k) - range[0]);
        }, 0);

        const specialPoints = this.#heritageEntry?.specialPoints ?? 0;
        // Magie-/Resonanzpunkte zählen nur, wenn das Talent das Attribut besitzt.
        const specialSpent = s.special.edg + (magic ? s.special.mag : 0) + (resonance ? s.special.res : 0);

        const skillCfg = p.skills[s.prio.skills] ?? { points: 0, groups: 0 };
        const skillSpent = Object.values(s.skills).reduce((a, b) => a + (b || 0), 0);
        const groupSpent = Object.values(s.groups).reduce((a, b) => a + (b || 0), 0);

        // Karma
        const budget = game.settings.get(MODULE_ID, 'chargenKarma');
        const metaKarma = this.#heritageEntry?.karma ?? 0;
        let posKarma = 0, negKarma = 0;
        for (const name of s.qualities) {
            const q = this.#data.qualities.find(q => q.name === name);
            if (!q) continue;
            const k = parseInt(q.karma) || 0;
            if (q.category === 'Positive') posKarma += k;
            else negKarma += Math.abs(k);
        }
        // Foki im Warenkorb kosten zusätzlich Karma für die Bindung (GRW).
        const focusKarma = s.cart.reduce((sum, c) =>
            sum + focusBindingKarma(c.name, c.rating || 1), 0);

        const karmaSpent = metaKarma + posKarma - negKarma + s.mysticPP * 5 + s.karmaNuyen + focusKarma;
        const karmaLeft = budget - karmaSpent;

        // Hintergrund: Kontakte (Charisma × 3) und Wissen ((INT + LOG) × 2).
        const contactPoints = this.#attrValue('cha') * 3;
        const contactSpent = s.contacts.reduce((sum, c) => sum + (c.connection || 0) + (c.loyalty || 0), 0);
        const knowledgePoints = (this.#attrValue('int') + this.#attrValue('log')) * 2;
        const knowledgeSpent = s.knowledge.reduce((sum, k) => sum + (k.rating || 0), 0);

        // Ressourcen
        const baseNuyen = p.resources[s.prio.resources] ?? 0;
        const nuyen = baseNuyen + s.karmaNuyen * 2000;
        const cartCost = s.cart.reduce((sum, c) => sum + (ChummerData.evalCost(c.cost, c.rating) ?? 0), 0);

        const magicRating = magic ? Math.min(magic + s.special.mag, 6) : 0;
        const ppTotal = isAdept ? magicRating : (isMystic ? s.mysticPP : 0);
        const ppSpent = Object.entries(s.powers).reduce((sum, [name, level]) => {
            const pw = this.#data.powers.find(x => x.name === name);
            if (!pw) return sum;
            const per = parseFloat(pw.points) || 0;
            return sum + (pw.levels ? per * Math.max(level, 1) : per);
        }, 0);

        return {
            attrPoints, attrSpent, specialPoints, specialSpent,
            skillPoints: skillCfg.points, skillSpent, groupPoints: skillCfg.groups, groupSpent,
            karmaBudget: budget, karmaSpent, karmaLeft, posKarma, negKarma, metaKarma,
            nuyen, cartCost, nuyenLeft: nuyen - cartCost,
            focusKarma, contactPoints, contactSpent, knowledgePoints, knowledgeSpent,
            magic, resonance, magicRating, isAdept, isMystic,
            spellsMax: talent?.spells ?? 0, cfpMax: talent?.cfp ?? 0,
            ppTotal, ppSpent,
        };
    }

    /** Offene Punkte: [{step, msg}] – step verlinkt in den passenden Schritt. */
    #validate(b) {
        const errors = [];
        const err = (step, msg) => errors.push({ step, msg });
        const s = this.state;
        const L = k => game.i18n.localize(`CHUMMER.${k}`);
        const letters = PRIO_CATS.map(c => s.prio[c]);
        if (letters.some(l => !l) || new Set(letters).size !== 5)
            err(0, L('PriorityDuplicate'));
        if (!s.name) err(0, L('NameMissing'));
        if (!s.metatype) err(1, L('NoMetatype'));
        if (b.attrSpent > b.attrPoints) err(2, `${L('AttributePoints')}: ${b.attrSpent} / ${b.attrPoints}`);
        if (b.specialSpent > b.specialPoints) err(2, `${L('SpecialPoints')}: ${b.specialSpent} / ${b.specialPoints}`);
        if (b.posKarma > 25) err(3, game.i18n.format('CHUMMER.QualityLimit', { max: 25, type: '+' }));
        if (b.negKarma > 25) err(3, game.i18n.format('CHUMMER.QualityLimit', { max: 25, type: '−' }));
        if (b.karmaLeft < 0) err(3, `${L('KarmaBudget')}: ${b.karmaLeft}`);
        if (b.skillSpent > b.skillPoints) err(4, `${L('SkillPoints')}: ${b.skillSpent} / ${b.skillPoints}`);
        if (b.groupSpent > b.groupPoints) err(4, `${L('GroupPoints')}: ${b.groupSpent} / ${b.groupPoints}`);
        if (s.spells.length > b.spellsMax) err(5, `${L('Spells')}: ${s.spells.length} / ${b.spellsMax}`);
        if (s.complexforms.length > b.cfpMax) err(5, `${L('ComplexForms')}: ${s.complexforms.length} / ${b.cfpMax}`);
        if (b.ppSpent > b.ppTotal) err(5, `${L('PowerPoints')}: ${b.ppSpent} / ${b.ppTotal}`);
        if (b.contactSpent > b.contactPoints) err(6, `${L('ContactPoints')}: ${b.contactSpent} / ${b.contactPoints}`);
        if (b.knowledgeSpent > b.knowledgePoints) err(6, `${L('KnowledgePoints')}: ${b.knowledgeSpent} / ${b.knowledgePoints}`);
        if (b.nuyenLeft < 0) err(7, game.i18n.format('CHUMMER.NotEnoughNuyen', { cost: fmt(b.cartCost), have: fmt(b.nuyen) }));
        return errors;
    }

    /** Effektive Fertigkeitsstufen: Gruppen, Einzelpunkte und freie Talent-Fertigkeiten. */
    #effectiveSkills() {
        const s = this.state;
        const ratings = {};
        for (const [group, rating] of Object.entries(s.groups)) {
            for (const sk of this.#data.skills.skills.filter(x => x.group === group)) {
                ratings[sk.name] = Math.max(ratings[sk.name] ?? 0, rating);
            }
        }
        for (const [name, rating] of Object.entries(s.skills)) {
            ratings[name] = Math.max(ratings[name] ?? 0, rating);
        }
        const cfg = this.#freeSkillCfg;
        if (cfg) {
            for (const name of s.freeSkills.filter(Boolean)) {
                ratings[name] = Math.max(ratings[name] ?? 0, cfg.val);
            }
        }
        return ratings;
    }

    // -------------------------------------------------------------- Kontext

    async _prepareContext() {
        const data = await this.#loadData();
        const s = this.state;
        const b = this.#computeBudgets();
        const errors = this.#validate(b);

        const done = this.#stepStatus(b);
        const stepKey = STEPS[s.step];
        const ctx = {
            state: s, b, errors,
            steps: STEPS.map((key, i) => ({
                key, index: i, number: i + 1,
                label: game.i18n.localize(`CHUMMER.Step.${key}`),
                active: i === s.step,
                done: done[i] && i !== s.step,
            })),
            chips: this.#statusChips(b),
            stepKey,
            intro: {
                icon: STEP_ICONS[s.step],
                title: game.i18n.localize(`CHUMMER.Step.${stepKey}`),
                text: game.i18n.localize(`CHUMMER.Intro.${stepKey}`),
                number: s.step + 1,
                total: STEPS.length,
            },
            isFirst: s.step === 0,
            isLast: s.step === STEPS.length - 1,
        };

        switch (stepKey) {
            case 'Priorities': ctx.priorities = this.#ctxPriorities(); break;
            case 'Metatype': ctx.metatype = this.#ctxMetatype(); break;
            case 'Attributes': ctx.attributes = this.#ctxAttributes(b); break;
            case 'Qualities': ctx.qualities = this.#ctxQualities(); break;
            case 'Skills': ctx.skills = this.#ctxSkills(); break;
            case 'Talent': ctx.talent = this.#ctxTalent(b); break;
            case 'Background': ctx.background = this.#ctxBackground(b); break;
            case 'Gear': ctx.gear = this.#ctxGear(b); break;
            case 'Summary': ctx.summary = this.#ctxSummary(b, errors); break;
        }
        return ctx;
    }

    /** Pro Schritt: gilt er als abgeschlossen? (für die Häkchen in der Navigation) */
    #stepStatus(b) {
        const s = this.state;
        const letters = PRIO_CATS.map(c => s.prio[c]);
        const prioOk = letters.every(Boolean) && new Set(letters).size === 5;
        const talentNeeded = (this.#data.priorities.talent[s.prio.talent] ?? []).length > 0;
        const freeCfg = this.#freeSkillCfg;
        const freeOk = !freeCfg || s.freeSkills.filter(Boolean).length >= freeCfg.qty;
        return [
            prioOk && !!s.name,
            !!s.metatype,
            !!s.metatype && b.attrSpent === b.attrPoints && b.specialSpent === b.specialPoints,
            // Gaben & Handicaps sind optional – erledigt, solange das Karma stimmt.
            b.posKarma <= 25 && b.negKarma <= 25 && b.karmaLeft >= 0,
            b.skillSpent === b.skillPoints && b.groupSpent === b.groupPoints,
            !talentNeeded || (!!s.talent && freeOk
                && s.spells.length <= b.spellsMax && s.complexforms.length <= b.cfpMax
                && b.ppSpent <= b.ppTotal),
            b.contactSpent <= b.contactPoints && b.knowledgeSpent <= b.knowledgePoints,
            b.nuyenLeft >= 0,
            false,
        ];
    }

    /** Budget-Chips für die permanente Statusleiste. */
    #statusChips(b) {
        const state = (spent, total) => {
            if (spent > total) return 'over';
            if (spent === total && total > 0) return 'full';
            return '';
        };
        const chips = [
            { icon: 'fa-star', label: game.i18n.localize('CHUMMER.KarmaBudget'), value: `${b.karmaLeft} / ${b.karmaBudget}`, state: b.karmaLeft < 0 ? 'over' : '' },
            { icon: 'fa-dumbbell', label: game.i18n.localize('CHUMMER.AttributePoints'), value: `${b.attrSpent} / ${b.attrPoints}`, state: state(b.attrSpent, b.attrPoints) },
            { icon: 'fa-bolt', label: game.i18n.localize('CHUMMER.SpecialPoints'), value: `${b.specialSpent} / ${b.specialPoints}`, state: state(b.specialSpent, b.specialPoints) },
            { icon: 'fa-graduation-cap', label: game.i18n.localize('CHUMMER.SkillPoints'), value: `${b.skillSpent} / ${b.skillPoints}${b.groupPoints ? ` · ${b.groupSpent} / ${b.groupPoints} ${game.i18n.localize('CHUMMER.GroupsShort')}` : ''}`, state: state(b.skillSpent, b.skillPoints) === 'over' || b.groupSpent > b.groupPoints ? 'over' : state(b.skillSpent, b.skillPoints) },
            { icon: 'fa-coins', label: game.i18n.localize('CHUMMER.Nuyen'), value: `${fmt(b.nuyenLeft)}¥`, state: b.nuyenLeft < 0 ? 'over' : '' },
        ];
        if (b.spellsMax) chips.push({ icon: 'fa-wand-sparkles', label: game.i18n.localize('CHUMMER.Spells'), value: `${this.state.spells.length} / ${b.spellsMax}`, state: state(this.state.spells.length, b.spellsMax) });
        if (b.cfpMax) chips.push({ icon: 'fa-network-wired', label: game.i18n.localize('CHUMMER.ComplexForms'), value: `${this.state.complexforms.length} / ${b.cfpMax}`, state: state(this.state.complexforms.length, b.cfpMax) });
        if (b.ppTotal) chips.push({ icon: 'fa-hand-sparkles', label: game.i18n.localize('CHUMMER.PowerPoints'), value: `${b.ppSpent} / ${b.ppTotal}`, state: state(b.ppSpent, b.ppTotal) });
        return chips;
    }

    #ctxPriorities() {
        const s = this.state;
        return {
            types: ACTOR_TYPES.map(t => ({
                ...t,
                label: game.i18n.localize(`CHUMMER.ActorType.${t.id}`),
                desc: game.i18n.localize(`CHUMMER.ActorType.${t.id}Desc`),
                selected: s.actorType === t.id,
            })),
            cats: PRIO_CATS.map(cat => ({
                cat,
                icon: PRIO_ICONS[cat],
                label: game.i18n.localize(`CHUMMER.Priority.${cat.capitalize()}`),
                desc: game.i18n.localize(`CHUMMER.PriorityDesc.${cat.capitalize()}`),
                letters: LETTERS.map(l => ({
                    letter: l,
                    selected: s.prio[cat] === l,
                    taken: s.prio[cat] !== l && Object.values(s.prio).includes(l),
                    info: this.#prioInfo(cat, l),
                })),
            })),
        };
    }

    #prioInfo(cat, letter) {
        const p = this.#data.priorities;
        switch (cat) {
            case 'heritage': {
                const metas = p.heritage[letter] ?? [];
                return metas.slice(0, 6).map(m => ChummerData.nameOf(m)).join(', ') + (metas.length > 6 ? ', …' : '');
            }
            case 'attributes': return `${p.attributes[letter] ?? 0} ${game.i18n.localize('CHUMMER.Points')}`;
            case 'talent': {
                const t = p.talent[letter] ?? [];
                return t.slice(0, 3).map(x => ChummerData.nameOf(x).split(' - ')[0]).join(', ') + (t.length > 3 ? ', …' : '');
            }
            case 'skills': {
                const cfg = p.skills[letter] ?? {};
                return `${cfg.points ?? 0} / ${cfg.groups ?? 0} ${game.i18n.localize('CHUMMER.Groups')}`;
            }
            case 'resources': return `${fmt(p.resources[letter] ?? 0)}¥`;
        }
        return '';
    }

    /** Kompakte Attributs-Spannen eines Metatyps ("KON 1–6 · GES 2–7 · …"). */
    #attrRanges(def) {
        if (!def?.attrs) return [];
        return PHYS_MENTAL.map(k => {
            const r = def.attrs[k] ?? [1, 6, 0];
            return {
                label: game.i18n.localize(`CHUMMER.AttrShort.${k}`),
                range: `${r[0]}–${r[1]}`, boosted: r[1] > 6, reduced: r[1] < 6,
            };
        });
    }

    #ctxMetatype() {
        const s = this.state;
        if (!s.prio.heritage) return { noPrio: true };
        const list = this.#data.priorities.heritage[s.prio.heritage] ?? [];
        const metas = list.map(m => {
            const def = this.#data.metatypes.find(x => x.name === m.name);
            return {
                name: m.name,
                label: ChummerData.nameOf(def ?? m),
                specialPoints: m.specialPoints,
                karma: m.karma ?? 0,
                selected: s.metatype === m.name && !s.metavariant,
                sourceLink: def ? SourceLinks.linkHTML(def.source, def.page) : '',
                ranges: this.#attrRanges(def),
                qualities: (def?.qualities ?? []).slice(0, 4).map(q => ChummerData.nameOf(q)).join(', '),
                variants: (m.metavariants ?? []).map(v => {
                    const vdef = (def?.metavariants ?? []).find(x => x.name === v.name);
                    return {
                        name: v.name, label: ChummerData.nameOf(vdef ?? v),
                        specialPoints: v.specialPoints, karma: v.karma ?? 0,
                        selected: s.metatype === m.name && s.metavariant === v.name,
                        ranges: this.#attrRanges(vdef),
                    };
                }),
            };
        });
        return { metas };
    }

    #ctxAttributes(b) {
        if (!this.state.metatype) return { noMeta: true };
        const def = this.#metatypeDef;
        const rows = PHYS_MENTAL.map(k => {
            const range = def?.attrs?.[k] ?? [1, 6, 0];
            return {
                key: k, label: attrLabel(k),
                min: range[0], max: range[1],
                value: this.#attrValue(k),
                maxed: this.#attrValue(k) === range[1],
            };
        });
        // Extra-Punkte sind auf natürliches Maximum − Basis begrenzt.
        const edgRange = def?.attrs?.edg ?? [1, 6, 0];
        const specials = [
            { key: 'edg', label: attrLabel('edg'), base: edgRange[0], extra: this.state.special.edg, max: Math.max(0, edgRange[1] - edgRange[0]) },
        ];
        if (b.magic) {
            const magMax = def?.attrs?.mag?.[1] ?? 6;
            specials.push({ key: 'mag', label: attrLabel('mag'), base: b.magic, extra: this.state.special.mag, max: Math.max(0, magMax - b.magic) });
        }
        if (b.resonance) {
            const resMax = def?.attrs?.res?.[1] ?? 6;
            specials.push({ key: 'res', label: attrLabel('res'), base: b.resonance, extra: this.state.special.res, max: Math.max(0, resMax - b.resonance) });
        }
        return { rows, specials };
    }

    #ctxQualities() {
        const s = this.state;
        const f = this.filters.quality.toLowerCase();
        const type = this.filters.qualityType;
        const rows = this.#data.qualities
            .filter(q => !q.careeronly)
            .filter(q => !type || (q.category === 'Positive') === (type === 'positive'))
            .filter(q => !f || q.name.toLowerCase().includes(f) || (q.en ?? '').toLowerCase().includes(f))
            .map(q => ({
                name: q.name,
                label: ChummerData.nameOf(q),
                karma: q.karma,
                positive: q.category === 'Positive',
                selected: s.qualities.includes(q.name),
                sourceLink: SourceLinks.linkHTML(q.source, q.page),
            }));
        sortRows(rows, {
            name: r => r.label,
            karma: r => Math.abs(parseInt(r.karma) || 0),
        }, this.sorts.quality);
        const total = rows.length;
        const pageSize = 150;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        this.pages.quality = Math.min(Math.max(0, this.pages.quality), totalPages - 1);
        const page = this.pages.quality;
        const list = rows.slice(page * pageSize, page * pageSize + pageSize);
        const chosen = s.qualities.map(name => {
            const q = this.#data.qualities.find(x => x.name === name);
            return q
                ? { name: q.name, label: ChummerData.nameOf(q), karma: q.karma, positive: q.category === 'Positive' }
                : { name, label: name, karma: 0 };
        });
        return {
            list, chosen, filter: this.filters.quality,
            types: [
                { value: '', label: game.i18n.localize('CHUMMER.All'), selected: !type },
                { value: 'positive', label: game.i18n.localize('CHUMMER.Positive'), selected: type === 'positive' },
                { value: 'negative', label: game.i18n.localize('CHUMMER.Negative'), selected: type === 'negative' },
            ],
            headers: listHeaders('quality', this.sorts.quality, [
                {},
                { key: 'name', label: game.i18n.localize('CHUMMER.Quality') },
                { key: 'karma', label: game.i18n.localize('CHUMMER.KarmaBudget') },
                { label: game.i18n.localize('CHUMMER.Source'), cls: 'cvtt-src' },
            ]),
            count: resultCount(list.length, total),
            page: page + 1,
            totalPages,
            hasPrev: page > 0,
            hasNext: page < totalPages - 1,
        };
    }

    #ctxSkills() {
        const s = this.state;
        const f = this.filters.skill.toLowerCase();
        const fa = this.filters.skillAttr;
        const groups = this.#data.skills.groups.map(g => ({
            name: g,
            label: ChummerData.nameOf(g),
            rating: s.groups[g] || 0,
        }));
        const skills = this.#data.skills.skills
            .filter(sk => !fa || sk.attribute === fa)
            .filter(sk => !f || sk.name.toLowerCase().includes(f) || (sk.en ?? '').toLowerCase().includes(f)
                || (sk.group ?? '').toLowerCase().includes(f))
            .map(sk => ({
                name: sk.name,
                label: ChummerData.nameOf(sk),
                attribute: sk.attribute.toUpperCase(),
                group: sk.group ? ChummerData.nameOf(sk.group) : '',
                groupRating: sk.group ? (s.groups[sk.group] || 0) : 0,
                rating: s.skills[sk.name] || 0,
                sourceLink: SourceLinks.linkHTML(sk.source, sk.page),
            }));
        sortRows(skills, {
            name: r => r.label,
            attribute: r => r.attribute,
            rating: r => r.rating,
        }, this.sorts.skill);
        const attrs = [...new Set(this.#data.skills.skills.map(sk => sk.attribute))]
            .map(a => ({ value: a, label: attrLabel(a), selected: a === fa }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
        return {
            groups, skills, filter: this.filters.skill, attrs,
            headers: listHeaders('skill', this.sorts.skill, [
                { key: 'name', label: game.i18n.localize('CHUMMER.Skill') },
                { key: 'attribute', label: game.i18n.localize('CHUMMER.AttrHeader') },
                { label: game.i18n.localize('CHUMMER.Group') },
                { key: 'rating', label: game.i18n.localize('CHUMMER.Rating') },
                { label: game.i18n.localize('CHUMMER.Source'), cls: 'cvtt-src' },
            ]),
        };
    }

    /** Auswahl der freien Talent-Fertigkeiten (Dropdowns, Anzahl = skillqty). */
    #ctxFreeSkills() {
        const cfg = this.#freeSkillCfg;
        if (!cfg) return null;
        const s = this.state;
        const eligible = FREE_SKILL_FILTERS[cfg.type] ?? (() => true);
        const options = this.#data.skills.skills
            .filter(eligible)
            .map(sk => ({ name: sk.name, label: ChummerData.nameOf(sk) }))
            .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
        const picks = Array.from({ length: cfg.qty }, (_, i) => ({
            index: i,
            options: options.map(o => ({
                ...o,
                selected: s.freeSkills[i] === o.name,
                taken: s.freeSkills[i] !== o.name && s.freeSkills.includes(o.name),
            })),
        }));
        const typeKey = ['magic', 'resonance', 'matrix'].includes(cfg.type) ? cfg.type : 'any';
        return {
            qty: cfg.qty, val: cfg.val, picks,
            chosen: s.freeSkills.filter(Boolean).length,
            label: game.i18n.format('CHUMMER.FreeSkills', {
                qty: cfg.qty, val: cfg.val,
                type: game.i18n.localize(`CHUMMER.FreeSkillType.${typeKey}`),
            }),
        };
    }

    #ctxTalent(b) {
        const s = this.state;
        if (!s.prio.talent) return { noPrio: true };
        const talents = (this.#data.priorities.talent[s.prio.talent] ?? []).map(t => {
            const full = ChummerData.nameOf(t);
            const badges = [];
            if (t.magic) badges.push(`${attrLabel('mag')} ${t.magic}`);
            if (t.resonance) badges.push(`${attrLabel('res')} ${t.resonance}`);
            if (t.spells) badges.push(game.i18n.format('CHUMMER.TalentBadge.Spells', { n: t.spells }));
            if (t.cfp) badges.push(game.i18n.format('CHUMMER.TalentBadge.CF', { n: t.cfp }));
            if (t.skillqty && t.skillval) badges.push(game.i18n.format('CHUMMER.TalentBadge.FreeSkills', { qty: t.skillqty, val: t.skillval }));
            if (!badges.length) badges.push(game.i18n.localize('CHUMMER.TalentBadge.Mundane'));
            return {
                value: t.value,
                name: full.split(' - ')[0],
                badges,
                selected: s.talent === t.value,
            };
        });
        const ctx = { talents, b };

        // Talent gewählt, aber nichts weiter zu vergeben → „mundan“-Hinweis.
        ctx.nothingToPick = !!s.talent && !b.spellsMax && !b.cfpMax
            && !b.isAdept && !b.isMystic && !this.#freeSkillCfg;

        ctx.freeSkills = this.#ctxFreeSkills();

        // Tradition (nur Zauberer/Mystiker): bestimmt das Entzugsattribut.
        if (b.magic && !b.isAdept) {
            ctx.traditions = TRADITIONS.map(t => ({
                id: t.id,
                label: game.i18n.localize(`CHUMMER.Tradition.${t.id}`),
                attr: game.i18n.localize(`CHUMMER.Attr.${t.attribute}`),
                selected: s.tradition === t.id,
            }));
        }

        if (b.spellsMax > 0) {
            const f = this.filters.spell.toLowerCase();
            const cat = this.filters.spellCat;
            const rows = this.#data.spells
                .filter(sp => !cat || sp.category === cat)
                .filter(sp => !f || sp.name.toLowerCase().includes(f) || (sp.en ?? '').toLowerCase().includes(f)
                    || sp.category.toLowerCase().includes(f))
                .map(sp => ({
                    name: sp.name, label: ChummerData.nameOf(sp),
                    category: ChummerData.catDe('spells', sp.category), type: sp.type,
                    range: sp.range, duration: sp.duration, dv: sp.dv,
                    selected: s.spells.includes(sp.name),
                    sourceLink: SourceLinks.linkHTML(sp.source, sp.page),
                }));
            sortRows(rows, { name: r => r.label, category: r => r.category }, this.sorts.spell);
            const total = rows.length;
            ctx.spells = rows.slice(0, 120);
            ctx.spellFilter = this.filters.spell;
            ctx.spellCats = [...new Set(this.#data.spells.map(sp => sp.category))]
                .map(c => ({ name: c, label: ChummerData.catDe('spells', c), selected: c === cat }))
                .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
            ctx.spellCount = resultCount(ctx.spells.length, total);
            ctx.spellHeaders = listHeaders('spell', this.sorts.spell, [
                {},
                { key: 'name', label: game.i18n.localize('CHUMMER.Spell') },
                { key: 'category', label: game.i18n.localize('CHUMMER.Category') },
                { label: game.i18n.localize('CHUMMER.Type') },
                { label: game.i18n.localize('CHUMMER.RangeHeader') },
                { label: game.i18n.localize('CHUMMER.Duration') },
                { label: game.i18n.localize('CHUMMER.Drain') },
                { label: game.i18n.localize('CHUMMER.Source'), cls: 'cvtt-src' },
            ]);
        }
        if (b.cfpMax > 0) {
            ctx.complexforms = this.#data.complexforms.map(cf => ({
                name: cf.name, label: ChummerData.nameOf(cf),
                target: cf.target, duration: cf.duration, fv: cf.fv,
                selected: s.complexforms.includes(cf.name),
                sourceLink: SourceLinks.linkHTML(cf.source, cf.page),
            }));
        }
        if (b.isAdept || b.isMystic) {
            const fp = this.filters.power.toLowerCase();
            ctx.powers = this.#data.powers
                .filter(pw => !fp || pw.name.toLowerCase().includes(fp) || (pw.en ?? '').toLowerCase().includes(fp))
                .slice(0, 120)
                .map(pw => ({
                    name: pw.name, label: ChummerData.nameOf(pw), points: pw.points, levels: pw.levels,
                    level: s.powers[pw.name] ?? 0,
                    selected: pw.name in s.powers,
                    sourceLink: SourceLinks.linkHTML(pw.source, pw.page),
                }));
            ctx.powerFilter = this.filters.power;
            ctx.isMystic = b.isMystic;
            ctx.mysticPP = s.mysticPP;
            ctx.mysticPPMax = b.magicRating;
        }
        return ctx;
    }

    /** Hintergrund: Kontakte, Wissens- und Sprachfertigkeiten, Muttersprache. */
    #ctxBackground(b) {
        const s = this.state;
        return {
            b,
            contacts: s.contacts.map((c, index) => ({ ...c, index })),
            knowledge: s.knowledge.map((k, index) => ({
                ...k, index,
                types: KNOWLEDGE_TYPES.map(t => ({
                    id: t.id,
                    label: game.i18n.localize(`CHUMMER.Knowledge.${t.id}`),
                    selected: k.type === t.id,
                })),
            })),
            nativeLanguage: s.nativeLanguage,
        };
    }

    #ctxGear(b) {
        const s = this.state;
        const kind = this.filters.gearKind;
        const availLimit = game.settings.get(MODULE_ID, 'availLimit');

        const { list, cats, total, shown } = catalogContext(
            this.#gearCatalog ?? [], kind,
            {
                search: this.filters.gear, cat: this.filters.gearCat,
                legality: this.filters.gearLegality, maxAvail: this.filters.gearMaxAvail,
            },
            this.sorts.gear,
            { availLimit, limit: 150 },
        );

        const cart = s.cart.map((c, i) => ({
            ...c, index: i,
            label: ChummerData.nameOf(c),
            costDisplay: fmt(ChummerData.evalCost(c.cost, c.rating) ?? 0) + '¥',
        }));

        return {
            kinds: GEAR_KINDS.map(([id]) => ({
                id, label: game.i18n.localize(`CHUMMER.Kind.${id}`), selected: id === kind,
            })),
            cats, list, cart, filter: this.filters.gear, b,
            headers: gearHeaders('gear', this.sorts.gear),
            legalities: legalityOptions(this.filters.gearLegality),
            maxAvail: this.filters.gearMaxAvail,
            count: resultCount(shown, total),
            karmaNuyen: s.karmaNuyen,
            maxKarmaNuyen: 10,
            availLimit,
        };
    }

    #ctxSummary(b, errors) {
        const s = this.state;
        const def = this.#metatypeDef;
        const metaLabel = ChummerData.nameOf(this.#data.metatypes.find(m => m.name === s.metatype) ?? s.metatype);
        const type = ACTOR_TYPES.find(t => t.id === s.actorType) ?? ACTOR_TYPES[0];

        const skillLabels = Object.entries(this.#effectiveSkills())
            .map(([name, rating]) => {
                const skDef = this.#data.skills.skills.find(x => x.name === name);
                return { label: ChummerData.nameOf(skDef ?? name), rating };
            })
            .filter(x => x.rating > 0)
            .sort((a, b2) => b2.rating - a.rating || a.label.localeCompare(b2.label, game.i18n.lang));

        const qualities = s.qualities.map(name => {
            const q = this.#data.qualities.find(x => x.name === name);
            return q
                ? { label: ChummerData.nameOf(q), karma: q.karma, positive: q.category === 'Positive' }
                : { label: name, karma: 0, positive: true };
        });

        const magicList = [
            ...s.spells.map(n => ({ icon: 'fa-wand-sparkles', label: ChummerData.nameOf(this.#data.spells.find(x => x.name === n) ?? n) })),
            ...s.complexforms.map(n => ({ icon: 'fa-network-wired', label: ChummerData.nameOf(this.#data.complexforms.find(x => x.name === n) ?? n) })),
            ...Object.entries(s.powers).map(([n, lvl]) => {
                const pw = this.#data.powers.find(x => x.name === n);
                return { icon: 'fa-hand-sparkles', label: ChummerData.nameOf(pw ?? n) + (pw?.levels && lvl ? ` ${lvl}` : '') };
            }),
        ];

        const cart = s.cart.map(c => ({
            label: ChummerData.nameOf(c),
            rating: c.rating,
            costDisplay: fmt(ChummerData.evalCost(c.cost, c.rating) ?? 0) + '¥',
        }));

        const edgRange = def?.attrs?.edg ?? [1, 6, 0];
        return {
            b, errors,
            name: s.name,
            typeLabel: game.i18n.localize(`CHUMMER.ActorType.${type.id}`),
            typeIcon: type.icon,
            metatype: s.metavariant ? `${metaLabel} (${ChummerData.nameOf(s.metavariant)})` : metaLabel,
            talent: this.#talentDef ? ChummerData.nameOf(this.#talentDef).split(' - ')[0] : '—',
            attrs: PHYS_MENTAL.map(k => ({ label: attrLabel(k), value: this.#attrValue(k) })),
            edgeLabel: attrLabel('edg'),
            magicLabel: attrLabel('mag'),
            resonanceLabel: attrLabel('res'),
            edge: Math.min(edgRange[0] + s.special.edg, edgRange[1]),
            magic: b.magic ? b.magicRating : 0,
            resonance: b.resonance ? Math.min(b.resonance + s.special.res, 6) : 0,
            skills: skillLabels,
            qualities,
            magicList,
            cart,
            nuyenLeftDisplay: fmt(b.nuyenLeft),
            openPoints: errors.map(e => ({
                ...e,
                stepLabel: game.i18n.localize(`CHUMMER.Step.${STEPS[e.step]}`),
            })),
            canCreate: errors.length === 0,
        };
    }

    // ---------------------------------------------------------- Interaktion

    async _onFirstRender(context, options) {
        await super._onFirstRender?.(context, options);
        // Delegation auf dem persistenten Wurzelelement – nur einmal registrieren.
        this.element.addEventListener('change', ev => this.#onFieldChange(ev));
    }

    async _onRender(context, options) {
        await super._onRender?.(context, options);
        const el = this.element;

        // Suchfelder werden bei jedem Render neu erzeugt → Listener neu anbinden.
        el.querySelectorAll('input[type="search"], input[data-filter]').forEach(inp => {
            inp.addEventListener('input', foundry.utils.debounce(ev => {
                this.filters[ev.target.dataset.filter] = ev.target.value;
                if (ev.target.dataset.filter === 'quality') this.pages.quality = 0;
                this.#rerenderKeepFocus(ev.target);
            }, 250));
        });

        // Fokus wiederherstellen
        if (this.#refocus) {
            const inp = el.querySelector(`[data-filter="${this.#refocus}"]`);
            if (inp) {
                inp.focus();
                inp.setSelectionRange(inp.value.length, inp.value.length);
            }
            this.#refocus = null;
        }
    }

    #refocus = null;

    #rerenderKeepFocus(target) {
        this.#refocus = target.dataset.filter;
        this.render();
    }

    async #onFieldChange(ev) {
        await this.#applyField(ev.target);
    }

    /** Talent-abhängige Auswahl zurücksetzen (Talent- oder Prioritätswechsel). */
    #resetTalentChoices() {
        const s = this.state;
        s.spells = [];
        s.complexforms = [];
        s.powers = {};
        s.mysticPP = 0;
        s.freeSkills = [];
    }

    /** Übernimmt den Wert eines Eingabefelds in den State (Change-Event und Stepper). */
    async #applyField(t) {
        const s = this.state;
        const { field } = t.dataset;
        if (!field) return;

        switch (field) {
            case 'name': s.name = t.value; this.render(); return;
            case 'actorType': s.actorType = t.value; break;
            case 'prio': {
                s.prio[t.dataset.cat] = t.value;
                if (t.dataset.cat === 'heritage' && s.metatype && !this.#heritageEntry) {
                    // Gewählter Metatyp ist unter der neuen Priorität nicht verfügbar.
                    s.metatype = ''; s.metavariant = ''; s.attrs = {};
                }
                if (t.dataset.cat === 'talent') {
                    s.talent = '';
                    this.#resetTalentChoices();
                    s.special.mag = 0; s.special.res = 0;
                }
                break;
            }
            case 'metatype': {
                const [meta, variant] = t.value.split('||');
                s.metatype = meta; s.metavariant = variant ?? '';
                s.attrs = {}; // Bereiche ändern sich
                const edgRange = this.#metatypeDef?.attrs?.edg ?? [1, 6, 0];
                s.special.edg = Math.min(s.special.edg, Math.max(0, edgRange[1] - edgRange[0]));
                break;
            }
            case 'attr': s.attrs[t.dataset.key] = parseInt(t.value) || 0; break;
            case 'special': {
                const max = t.max !== '' ? parseInt(t.max) : Infinity;
                s.special[t.dataset.key] = Math.min(max, Math.max(0, parseInt(t.value) || 0));
                break;
            }
            case 'talent': {
                s.talent = t.value;
                this.#resetTalentChoices();
                const td = this.#talentDef;
                if (!td?.magic) s.special.mag = 0;
                if (!td?.resonance) s.special.res = 0;
                break;
            }
            case 'freeSkill': s.freeSkills[parseInt(t.dataset.index) || 0] = t.value; break;
            case 'skill': {
                const v = Math.min(6, Math.max(0, parseInt(t.value) || 0));
                if (v) s.skills[t.dataset.name] = v; else delete s.skills[t.dataset.name];
                break;
            }
            case 'group': {
                const v = Math.min(6, Math.max(0, parseInt(t.value) || 0));
                if (v) s.groups[t.dataset.name] = v; else delete s.groups[t.dataset.name];
                break;
            }
            case 'powerLevel': s.powers[t.dataset.name] = Math.max(1, parseInt(t.value) || 1); break;
            case 'mysticPP': {
                const max = t.max !== '' ? parseInt(t.max) : 6;
                s.mysticPP = Math.min(max, Math.max(0, parseInt(t.value) || 0));
                break;
            }
            case 'karmaNuyen': s.karmaNuyen = Math.min(10, Math.max(0, parseInt(t.value) || 0)); break;
            case 'tradition': s.tradition = t.value; break;
            case 'nativeLanguage': s.nativeLanguage = t.value; this.render(); return;
            case 'contact': {
                const c = s.contacts[parseInt(t.dataset.index)];
                if (!c) return;
                const key = t.dataset.key;
                if (key === 'connection' || key === 'loyalty') c[key] = Math.min(6, Math.max(1, parseInt(t.value) || 1));
                else { c[key] = t.value; this.render(); return; }
                break;
            }
            case 'knowledge': {
                const k = s.knowledge[parseInt(t.dataset.index)];
                if (!k) return;
                const key = t.dataset.key;
                if (key === 'rating') k.rating = Math.min(6, Math.max(1, parseInt(t.value) || 1));
                else if (key === 'type') k.type = t.value;
                else { k[key] = t.value; this.render(); return; }
                break;
            }
            case 'gearKind': {
                this.filters.gearKind = t.value;
                this.filters.gearCat = '';
                this.#gearCatalog = await ChummerData.catalog(t.value);
                break;
            }
            case 'gearCat': this.filters.gearCat = t.value; break;
            case 'gearLegality': this.filters.gearLegality = t.value; break;
            case 'gearMaxAvail': this.filters.gearMaxAvail = t.value; break;
            case 'qualityType': this.filters.qualityType = t.value; this.pages.quality = 0; break;
            case 'skillAttr': this.filters.skillAttr = t.value; break;
            case 'spellCat': this.filters.spellCat = t.value; break;
            default: return;
        }
        this.render();
    }

    #gearCatalog = null;

    async _preFirstRender(context, options) {
        await super._preFirstRender?.(context, options);
        this.#gearCatalog = await ChummerData.catalog(this.filters.gearKind);
    }

    /** Klick auf einen sortierbaren Spaltenkopf. */
    static #onSortBy(ev, target) {
        const sort = this.sorts[target.dataset.list];
        if (!sort) return;
        toggleSort(sort, target.dataset.key);
        if (target.dataset.list === 'quality') this.pages.quality = 0;
        this.render();
    }

    static #onQualityPage(ev, target) {
        const dir = parseInt(target.dataset.dir) || 0;
        this.pages.quality = Math.max(0, this.pages.quality + dir);
        this.render();
    }

    static #onGotoStep(ev, target) {
        this.state.step = parseInt(target.dataset.step) || 0;
        this.render();
    }

    static #onNext() { this.state.step = Math.min(STEPS.length - 1, this.state.step + 1); this.render(); }
    static #onBack() { this.state.step = Math.max(0, this.state.step - 1); this.render(); }

    /** Pfeil-Buttons (−/+) neben Zahlenfeldern: Wert schrittweise ändern. */
    static async #onAdjust(ev, target) {
        const input = target.closest('.cvtt-stepper')?.querySelector('input');
        if (!input) return;
        const delta = parseInt(target.dataset.delta) || 0;
        const min = input.min !== '' ? parseInt(input.min) : 0;
        const max = input.max !== '' ? parseInt(input.max) : Infinity;
        const value = Math.min(max, Math.max(min, (parseInt(input.value) || 0) + delta));
        if (value === parseInt(input.value)) return;
        input.value = value;
        await this.#applyField(input);
    }

    static #onToggleQuality(ev, target) {
        const name = target.dataset.name;
        const i = this.state.qualities.indexOf(name);
        if (i >= 0) this.state.qualities.splice(i, 1);
        else this.state.qualities.push(name);
        this.render();
    }

    static #onToggleSpell(ev, target) {
        const name = target.dataset.name;
        const i = this.state.spells.indexOf(name);
        if (i >= 0) this.state.spells.splice(i, 1);
        else this.state.spells.push(name);
        this.render();
    }

    static #onToggleCF(ev, target) {
        const name = target.dataset.name;
        const i = this.state.complexforms.indexOf(name);
        if (i >= 0) this.state.complexforms.splice(i, 1);
        else this.state.complexforms.push(name);
        this.render();
    }

    static #onTogglePower(ev, target) {
        const name = target.dataset.name;
        if (name in this.state.powers) delete this.state.powers[name];
        else {
            const pw = this.#data.powers.find(p => p.name === name);
            this.state.powers[name] = pw?.levels ? 1 : 0;
        }
        this.render();
    }

    static #onAddCart(ev, target) {
        const { name } = target.dataset;
        const entry = (this.#gearCatalog ?? []).find(e => e.name === name);
        if (!entry) return;
        const row = target.closest('.cvtt-row');
        const ratingInput = row?.querySelector('input[data-rating]');
        const rating = ratingInput ? parseInt(ratingInput.value) || 1 : 0;
        this.state.cart.push({
            kind: this.filters.gearKind, name: entry.name, en: entry.en, rating,
            cost: entry.cost, avail: entry.avail, source: entry.source, page: entry.page,
        });
        this.render();
    }

    static #onRemoveCart(ev, target) {
        this.state.cart.splice(parseInt(target.dataset.index), 1);
        this.render();
    }

    static #onAddContact() {
        this.state.contacts.push({ name: '', role: '', connection: 1, loyalty: 1 });
        this.render();
    }

    static #onRemoveContact(ev, target) {
        this.state.contacts.splice(parseInt(target.dataset.index), 1);
        this.render();
    }

    static #onAddKnowledge() {
        this.state.knowledge.push({ name: '', type: 'street', rating: 1 });
        this.render();
    }

    static #onRemoveKnowledge(ev, target) {
        this.state.knowledge.splice(parseInt(target.dataset.index), 1);
        this.render();
    }

    // ------------------------------------------------------------ Erstellung

    static async #onCreate() {
        const b = this.#computeBudgets();
        const errors = this.#validate(b);
        if (errors.length) {
            ui.notifications.warn(`${game.i18n.localize('CHUMMER.ValidationErrors')}: ${errors.map(e => e.msg).join(' · ')}`);
            return;
        }
        await this.#createActor(b);
    }

    async #createActor(b) {
        const s = this.state;
        const def = this.#metatypeDef;
        const isNpc = s.actorType !== 'pc';
        const isGrunt = s.actorType === 'grunt';

        // ---------------------------------------------------------- Attribute
        const attributes = {};
        for (const k of PHYS_MENTAL) attributes[mapAttribute(k)] = { base: this.#attrValue(k) };
        const edgRange = def?.attrs?.edg ?? [1, 6, 0];
        attributes.edge = { base: Math.min(edgRange[0] + s.special.edg, edgRange[1]) };
        if (b.magic) attributes.magic = { base: b.magicRating };
        if (b.resonance) attributes.resonance = { base: Math.min(b.resonance + s.special.res, 6) };

        // Das System erlaubt nur die fünf Grundmetatypen (StringField-choices);
        // Metavarianten und Exoten werden auf ihren Basistyp abgebildet,
        // der vollständige Name bleibt in flags.sr5-chummer.chargen erhalten.
        const baseEn = ((def?.base ?? def)?.en ?? '').toLowerCase();
        const metatype = ['human', 'elf', 'dwarf', 'ork', 'troll'].includes(baseEn) ? baseEn : 'human';

        const system = {
            attributes,
            karma: { value: Math.max(0, b.karmaLeft) },
            nuyen: Math.max(0, b.nuyenLeft),
            metatype,
        };
        if (b.magic) {
            system.special = 'magic';
            // Tradition → Entzugsattribut (Willenskraft + X).
            const trad = TRADITIONS.find(t => t.id === s.tradition) ?? TRADITIONS[0];
            if (!b.isAdept) system.magic = { attribute: trad.attribute };
        } else if (b.resonance) system.special = 'resonance';
        if (isNpc) {
            system.is_npc = true;
            system.npc = { is_grunt: isGrunt };
        }

        // -------------------------------------------------------------- Items
        const items = [];

        // Qualities (inkl. der vom Talent verliehenen, kostenlos)
        for (const name of s.qualities) {
            const q = this.#data.qualities.find(x => x.name === name);
            if (q) items.push(await qualityItemData(q));
        }
        for (const name of this.#talentDef?.qualities ?? []) {
            const q = this.#data.qualities.find(x => x.name === name);
            if (q && !s.qualities.includes(name)) {
                const data = await qualityItemData(q);
                data.system.karma = 0;
                items.push(data);
            }
        }

        // Skills: Gruppen + Einzel-Ratings + freie Talent-Fertigkeiten.
        // Nicht als Items mitgeben — das System injiziert bei der Erzeugung sein
        // Standard-Skillset; die Ratings werden danach per applySkillPlan gesetzt.
        const skillPlan = [];
        for (const [name, rating] of Object.entries(this.#effectiveSkills())) {
            const skDef = this.#data.skills.skills.find(x => x.name === name);
            if (skDef && rating > 0) skillPlan.push(await buildSkillPlanEntry(skDef, rating));
        }

        // Magie / Resonanz
        for (const name of s.spells) {
            const sp = this.#data.spells.find(x => x.name === name);
            if (sp) items.push(await spellItemData(sp));
        }
        for (const name of s.complexforms) {
            const cf = this.#data.complexforms.find(x => x.name === name);
            if (cf) items.push(await complexFormItemData(cf));
        }
        for (const [name, level] of Object.entries(s.powers)) {
            const pw = this.#data.powers.find(x => x.name === name);
            if (pw) items.push(await adeptPowerItemData(pw, level));
        }

        // Hintergrund: Kontakte, Wissens-/Sprachfertigkeiten, Muttersprache (gratis).
        for (const c of s.contacts) {
            if (c.name || c.role) items.push(contactItemData(c));
        }
        for (const k of s.knowledge) {
            if (!k.name) continue;
            const typeDef = KNOWLEDGE_TYPES.find(t => t.id === k.type) ?? KNOWLEDGE_TYPES[1];
            items.push(knowledgeSkillItemData({
                name: k.name, rating: k.rating, type: k.type,
                attribute: typeDef.attribute, isLanguage: k.type === 'language',
            }));
        }
        if (s.nativeLanguage) {
            items.push(knowledgeSkillItemData({
                name: s.nativeLanguage, rating: 1, isLanguage: true, isNative: true,
                attribute: 'intuition',
            }));
        }

        // Einkäufe (Foki werden als gebunden markiert — Karma ist schon verrechnet).
        const kindMap = Object.fromEntries(GEAR_KINDS.map(([id, kind]) => [id, kind]));
        for (const c of s.cart) {
            const data = await purchasedItemData(kindMap[c.kind] ?? 'gear', c, c.rating);
            const bindKarma = focusBindingKarma(c.name, c.rating || 1);
            if (bindKarma) {
                data.flags = foundry.utils.mergeObject(data.flags ?? {}, {
                    [MODULE_ID]: { focusBound: true, focusKarma: bindKarma },
                });
            }
            items.push(data);
        }

        // -------------------------------------------------------------- Actor
        const actor = await Actor.create({
            name: s.name,
            type: 'character',
            system,
            items,
            prototypeToken: {
                actorLink: !isNpc,
                disposition: isGrunt
                    ? CONST.TOKEN_DISPOSITIONS.HOSTILE
                    : (isNpc ? CONST.TOKEN_DISPOSITIONS.NEUTRAL : CONST.TOKEN_DISPOSITIONS.FRIENDLY),
            },
            flags: {
                [MODULE_ID]: {
                    chargen: foundry.utils.deepClone(s),
                    karmaLog: [{
                        date: Date.now(),
                        note: game.i18n.localize('CHUMMER.ChargenNote'),
                        karma: Math.max(0, b.karmaLeft),
                        nuyen: Math.max(0, b.nuyenLeft),
                    }],
                },
            },
        });

        await applySkillPlan(actor, skillPlan);

        ui.notifications.info(game.i18n.format('CHUMMER.Created', {
            name: s.name,
            type: game.i18n.localize(`CHUMMER.ActorType.${s.actorType}`),
        }));
        actor?.sheet?.render(true);
        this.close();
    }
}
