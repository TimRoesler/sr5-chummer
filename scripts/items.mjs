/**
 * Erzeugt shadowrun5e-kompatible Item-Daten aus Chummer-Katalogeinträgen.
 * Bevorzugt vollständige Items aus den Bulkimporter-Kompendien des Systems,
 * fällt sonst auf minimale, schema-kompatible Items zurück.
 */
import { ChummerData } from './data.mjs';
import { enrichItemData } from './enrich.mjs';

export function sourceString(entry) {
    if (!entry?.source) return '';
    return entry.page ? `${entry.source} ${entry.page}` : entry.source;
}

function baseDescription(entry) {
    return { description: { source: sourceString(entry) } };
}

function technology(entry, rating) {
    return {
        technology: {
            rating: rating || entry.rating || 0,
            availability: ChummerData.availDisplay(entry.avail ?? '', rating || 1),
            cost: ChummerData.evalCost(entry.cost, rating || 1) ?? 0,
        },
    };
}

/**
 * Kompendium-Item übernehmen und Stufe/Kosten anpassen.
 * Gesucht wird per deutschem Namen und englischem Originalnamen (entry.en);
 * das Ergebnis erhält den Namen in der Foundry-Sprache und die Quellenangabe.
 */
async function fromCompendium(kind, entry, rating) {
    const doc = await ChummerData.findItem(kind, entry.name, entry.en);
    if (!doc || doc.documentName !== 'Item') return null;
    const data = doc.toObject();
    delete data._id;
    delete data.folder;
    data.name = ChummerData.nameOf(entry);
    if (entry.source && data.system?.description) {
        data.system.description.source = sourceString(entry);
    }
    if (rating && data.system?.technology) {
        data.system.technology.rating = rating;
        const cost = ChummerData.evalCost(entry.cost, rating);
        if (cost !== null) data.system.technology.cost = cost;
        data.system.technology.availability = ChummerData.availDisplay(entry.avail ?? '', rating);
    }
    return data;
}

const FALLBACK_TYPES = {
    weapon: 'weapon',
    armor: 'armor',
    gear: 'equipment',
    cyberware: 'cyberware',
    bioware: 'bioware',
    vehicle: 'equipment',
    lifestyle: 'lifestyle',
};

const COMPENDIUM_KIND = {
    weapon: 'weapon',
    armor: 'gear',
    gear: 'gear',
    cyberware: 'ware',
    bioware: 'ware',
    vehicle: 'vehicle',
    lifestyle: 'gear',
};

/** Item-Daten für einen Katalogeintrag (Shop/Chargen-Kauf). */
export async function purchasedItemData(kind, entry, rating = 0) {
    const comp = await fromCompendium(COMPENDIUM_KIND[kind], entry, rating);
    if (comp) return enrichItemData(comp, entry);

    const type = FALLBACK_TYPES[kind] ?? 'equipment';
    const system = { ...baseDescription(entry), ...technology(entry, rating) };

    if (kind === 'lifestyle') {
        delete system.technology;
        system.cost = ChummerData.evalCost(entry.cost) ?? 0;
        system.type = ({
            Street: 'street', Squatter: 'squatter', Low: 'low',
            Middle: 'middle', High: 'high', Luxury: 'luxury',
        })[entry.en ?? entry.name] ?? 'other';
    }

    return enrichItemData({ name: ChummerData.nameOf(entry), type, system }, entry);
}

/**
 * Rüstungsmodifikation als eingebettetes `modification`-Item.
 * Wird nicht als eigenständiges Ausrüstungs-Item angelegt, sondern über
 * flags.shadowrun5e.embeddedItems in die Rüstung gehängt (system.type='armor',
 * aktiviert → getEquippedMods()/ArmorPrep greifen, Anzeige im Panzerungs-Tab).
 */
export async function armorModItemData(entry, rating = 0) {
    const comp = await fromCompendium('modification', entry, rating);
    if (comp) {
        comp.system ??= {};
        comp.system.type = 'armor';
        comp.system.technology = { ...(comp.system.technology ?? {}), equipped: true };
        return enrichItemData(comp, entry);
    }

    const system = {
        ...baseDescription(entry),
        ...technology(entry, rating),
        type: 'armor',
    };
    system.technology.equipped = true;
    return enrichItemData({ name: ChummerData.nameOf(entry), type: 'modification', system }, entry);
}

/** Quality-Item. */
export async function qualityItemData(q) {
    const comp = await fromCompendium('quality', q);
    if (comp) return enrichItemData(comp, q);
    return enrichItemData({
        name: ChummerData.nameOf(q),
        type: 'quality',
        system: {
            ...baseDescription(q),
            type: q.category === 'Positive' ? 'positive' : 'negative',
            karma: parseInt(q.karma) || 0,
        },
    }, q);
}

/** Zauber-Item (Fallback bildet die SpellParser-Logik des Systems nach). */
export async function spellItemData(s) {
    const comp = await fromCompendium('magic', s);
    if (comp) return comp;

    let category = (s.category ?? '').toLowerCase();
    if (category.endsWith('s')) category = category.slice(0, -1);
    const duration = { I: 'instant', S: 'sustained', P: 'permanent' }[s.duration] ?? 'instant';
    const range = { T: 'touch', 'LOS': 'los', 'LOS (A)': 'los_a' }[s.range] ?? 'los';
    const type = s.type === 'P' ? 'physical' : 'mana';
    const drain = /^F/.test(s.dv ?? '') ? (parseInt((s.dv ?? '').substring(1)) || 0) : 0;

    return {
        name: ChummerData.nameOf(s),
        type: 'spell',
        system: {
            ...baseDescription(s),
            category, type, range, duration, drain,
            action: { type: 'varies', attribute: 'magic', skill: 'spellcasting' },
        },
    };
}

/** Komplexe Form. */
export async function complexFormItemData(cf) {
    const comp = await fromCompendium('magic', cf);
    if (comp) return comp;
    const duration = { I: 'instant', S: 'sustained', P: 'permanent' }[cf.duration] ?? 'instant';
    const target = { Persona: 'persona', Device: 'device', File: 'file', Self: 'self', Sprite: 'sprite', Host: 'host' }[cf.target] ?? 'other';
    const fade = parseInt((cf.fv ?? '').replace(/^L/, '')) || 0;
    return {
        name: ChummerData.nameOf(cf),
        type: 'complex_form',
        system: { ...baseDescription(cf), duration, target, fade },
    };
}

/** Adeptenkraft. */
export async function adeptPowerItemData(p, level = 0) {
    const comp = await fromCompendium('quality', p) ?? await fromCompendium('magic', p);
    if (comp) {
        if (level && comp.system) comp.system.level = level;
        return comp;
    }
    const ppPerLevel = parseFloat(p.points) || 0;
    return {
        name: ChummerData.nameOf(p),
        type: 'adept_power',
        system: {
            ...baseDescription(p),
            pp: p.levels ? ppPerLevel * Math.max(level, 1) : ppPerLevel,
            level: p.levels ? Math.max(level, 1) : 0,
            type: 'active',
        },
    };
}

/** Skill-Item: aus dem System-Kompendium sr5e-skills, sonst neu. */
export async function skillItemData(skillDef, rating, specs = []) {
    const doc = await ChummerData.findInPack(['sr5e-skills'], skillDef.name, skillDef.en);
    let data;
    if (doc && doc.documentName === 'Item') {
        data = doc.toObject();
        delete data._id;
        delete data.folder;
        data.name = ChummerData.nameOf(skillDef);
        if (skillDef.source && data.system?.description) {
            data.system.description.source = sourceString(skillDef);
        }
    } else {
        data = {
            name: ChummerData.nameOf(skillDef),
            type: 'skill',
            system: {
                description: { source: sourceString(skillDef) },
                skill: {
                    category: 'active',
                    attribute: mapAttribute(skillDef.attribute),
                    group: skillDef.group ?? '',
                    defaulting: !!skillDef.default,
                },
            },
        };
    }
    data.system = foundry.utils.mergeObject(data.system ?? {}, {
        skill: {
            rating,
            specializations: specs.map(name => ({ name })),
        },
    }, { inplace: false });
    return data;
}

/** Kontakt-Item (Connection/Loyalität nach GRW). */
export function contactItemData({ name, role = '', location = '', connection = 1, loyalty = 1, family = false, blackmail = false, group = false } = {}) {
    const bits = [role, location].filter(Boolean).join(' · ');
    return {
        name: name || role || game.i18n.localize('CHUMMER.Contact'),
        type: 'contact',
        system: {
            type: role,
            connection, loyalty, family, blackmail, group,
            ...(bits ? { description: { value: `<p>${bits}</p>` } } : {}),
        },
    };
}

/** Metamagie- bzw. Echo-Item (def aus data/metamagic.json / data/echoes.json). */
export function metamagicItemData(def, { echo = false } = {}) {
    return {
        name: ChummerData.nameOf(def),
        type: echo ? 'echo' : 'metamagic',
        system: { description: { source: sourceString(def) } },
    };
}

/**
 * Karma-Bindungskosten eines Fokus nach GRW (Kraftstufe × Multiplikator).
 * Erkennung über den Katalognamen (deutsch); liefert 0 für Nicht-Foki.
 */
export function focusBindingKarma(name, rating = 1) {
    const n = (name ?? '').toLowerCase();
    const mult =
        n.startsWith('kraftfokus') ? 6
        : /^(alchemiefokus|entzauberungsfokus|zentrierungsfokus|maskierungsfokus|signaturschleier|formungsfokus|waffenfokus)/.test(n) ? 3
        : /^(bindungsfokus|herbeirufungsfokus|verbannungsfokus|qi-fokus|antimagiefokus|ritualfokus|zauberspruchfokus|zauberspeicher)/.test(n) ? 2
        : 0;
    return mult * Math.max(1, rating);
}

/** Wissens-/Sprachfertigkeits-Item. */
export function knowledgeSkillItemData({ name, rating = 1, type = 'professional', attribute = 'logic', isLanguage = false, isNative = false, specs = [] } = {}) {
    return {
        name,
        type: 'skill',
        system: {
            skill: {
                category: isLanguage ? 'language' : 'knowledge',
                knowledgeType: isLanguage ? 'language' : type,
                attribute,
                rating: isNative ? Math.max(rating, 1) : rating,
                specializations: specs.map(n => ({ name: n })),
                ...(isLanguage ? { language: { isNative } } : {}),
            },
        },
    };
}

/** Chummer-Attributskürzel → Systemnamen. */
export function mapAttribute(abbr) {
    return ({
        bod: 'body', agi: 'agility', rea: 'reaction', str: 'strength',
        cha: 'charisma', int: 'intuition', log: 'logic', wil: 'willpower',
        edg: 'edge', mag: 'magic', res: 'resonance', dep: 'depth',
    })[(abbr ?? '').toLowerCase()] ?? (abbr ?? '').toLowerCase();
}
