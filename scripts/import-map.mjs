/**
 * Mapping-Schicht des Chummer-Importers: überführt einen normalisierten
 * Charakter (scripts/chummer-parse.mjs) in shadowrun5e-Actor- und Item-Daten.
 *
 * Matching-Strategie pro Item: Chummer-sourceid → Katalogeintrag (data/*.json,
 * via ChummerData.findById) → items.mjs-Builder (inkl. Kompendium-Lookup und
 * GRW-Anreicherung). Ohne Katalogtreffer wird ein minimales, schemakompatibles
 * Fallback-Item aus den Exportdaten gebaut. Jedes erzeugte Item trägt
 * flags.sr5-chummer.sourceId für Re-Sync und ID-basierte Anreicherung.
 */
import { ChummerData, MODULE_ID } from './data.mjs';
import {
    purchasedItemData, qualityItemData, spellItemData, complexFormItemData,
    adeptPowerItemData, skillItemData, sourceString,
} from './items.mjs';

/** Dateiname des Katalogs → items.mjs-Einkaufsart. */
const KIND_BY_FILE = {
    weapons: 'weapon', armor: 'armor', gear: 'gear', cyberware: 'cyberware',
    bioware: 'bioware', vehicles: 'vehicle', lifestyles: 'lifestyle',
};

/** sourceId-/GUID-Flags an ein Item-Datenobjekt hängen. */
function tagSource(data, item) {
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, {
        [MODULE_ID]: {
            ...(item.sourceId ? { sourceId: item.sourceId } : {}),
            ...(item.guid ? { importGuid: item.guid } : {}),
        },
    });
    return data;
}

/** Zeile an die Item-Beschreibung anhängen (nach der Anreicherung). */
function appendDescription(data, html) {
    if (!html) return;
    data.system ??= {};
    data.system.description ??= {};
    data.system.description.value = `${data.system.description.value ?? ''}${html}`;
}

/** Anzeigename: Katalogname in Foundry-Sprache, sonst Exportname; extra anhängen. */
function displayName(item, entry) {
    let name = entry ? ChummerData.nameOf(entry) : item.name;
    if (item.extra && !name.includes(item.extra)) name += ` (${item.extra})`;
    return name;
}

export class ImportReport {
    items = [];       // { name, type, via: 'katalog' | 'fallback' }
    skipped = [];     // { name, reason }
    vehicles = 0;

    add(data, entry) {
        this.items.push({ name: data.name, type: data.type, via: entry ? 'katalog' : 'fallback' });
        return data;
    }

    skip(name, reason) {
        this.skipped.push({ name, reason });
    }
}

/** Katalog-Item bauen; ohne Katalogtreffer minimales Fallback. */
async function catalogItem(item, fallbackKind, report) {
    const hit = await ChummerData.findById(item.sourceId);
    const kind = hit ? KIND_BY_FILE[hit.kind] ?? fallbackKind : fallbackKind;
    const entry = hit?.entry ?? {
        name: item.name, en: item.nameEn, cost: 0,
        avail: '', source: item.source, page: item.page,
        rating: item.rating,
    };
    const data = await purchasedItemData(kind, entry, item.rating);
    data.name = displayName(item, hit?.entry);
    return report.add(tagSource(data, item), hit?.entry);
}

/**
 * Kompletten normalisierten Charakter in Erzeugungsdaten überführen.
 * Liefert { actorData, vehicles, report }; system.driver der Fahrzeuge
 * muss nach der Actor-Erzeugung vom Aufrufer gesetzt werden.
 */
export async function buildImport(norm, options = {}) {
    const report = new ImportReport();
    const items = [];

    // -------------------------------------------------------------- Skills
    const skillData = await ChummerData.skills();
    for (const sk of norm.skills) {
        const def = skillData.skills.find(x => x.id?.toLowerCase() === sk.sourceId)
            ?? skillData.skills.find(x => x.en === sk.nameEn || x.name === sk.name);
        if (!def) {
            report.skip(sk.name, 'Fertigkeit nicht im GRW-Katalog');
            continue;
        }
        const data = await skillItemData(def, sk.rating, sk.specs);
        report.add(tagSource(data, { sourceId: def.id?.toLowerCase() }), def);
        items.push(data);
    }
    for (const ks of norm.knowledgeSkills) {
        const data = {
            name: ks.name,
            type: 'skill',
            system: {
                skill: {
                    category: ks.isLanguage ? 'language' : 'knowledge',
                    knowledgeType: ks.isLanguage ? 'language' : ks.knowledgeType,
                    attribute: ks.attribute,
                    rating: ks.isNative ? Math.max(ks.rating, 1) : ks.rating,
                    specializations: ks.specs.map(name => ({ name })),
                    ...(ks.isLanguage ? { language: { isNative: ks.isNative } } : {}),
                },
            },
        };
        items.push(report.add(data, null));
    }

    // ---------------------------------------------------------- Qualitäten
    for (const q of norm.qualities) {
        const hit = await ChummerData.findById(q.sourceId);
        const entry = hit?.entry ?? {
            name: q.name, en: q.nameEn,
            category: q.positive ? 'Positive' : 'Negative',
            karma: q.karma, source: q.source, page: q.page,
        };
        const data = await qualityItemData(entry);
        data.name = displayName(q, hit?.entry);
        if (q.fromMetatype && data.system) data.system.karma = 0;
        items.push(report.add(tagSource(data, q), hit?.entry));
    }

    // ------------------------------------------------------ Magie/Resonanz
    for (const sp of norm.spells) {
        const hit = await ChummerData.findById(sp.sourceId);
        const data = await spellItemData(hit?.entry ?? {
            name: sp.name, en: sp.nameEn, category: sp.category,
            source: sp.source, page: sp.page,
        });
        data.name = displayName(sp, hit?.entry);
        items.push(report.add(tagSource(data, sp), hit?.entry));
    }
    for (const pw of norm.powers) {
        const hit = await ChummerData.findById(pw.sourceId);
        const data = await adeptPowerItemData(hit?.entry ?? {
            name: pw.name, en: pw.nameEn, points: pw.points,
            source: pw.source, page: pw.page,
        }, pw.rating);
        data.name = displayName(pw, hit?.entry);
        items.push(report.add(tagSource(data, pw), hit?.entry));
    }
    for (const cf of norm.complexforms) {
        const hit = await ChummerData.findById(cf.sourceId);
        const data = await complexFormItemData(hit?.entry ?? {
            name: cf.name, en: cf.nameEn, source: cf.source, page: cf.page,
        });
        data.name = displayName(cf, hit?.entry);
        items.push(report.add(tagSource(data, cf), hit?.entry));
    }
    for (const mm of norm.metamagics) {
        const data = {
            name: displayName(mm, null),
            type: norm.isTechnomancer ? 'echo' : 'metamagic',
            system: { description: { source: sourceString(mm) } },
        };
        items.push(report.add(tagSource(data, mm), null));
    }
    for (const cp of norm.critterpowers) report.skip(cp.name, 'Critter-Kraft (nicht unterstützt)');

    // -------------------------------------------------------------- Waffen
    for (const w of norm.weapons) {
        const data = await catalogItem(w, 'weapon', report);
        const extras = [
            ...w.accessories,
            ...w.underbarrel.map(u => u.name),
        ].filter(Boolean);
        if (extras.length) appendDescription(data, `<p><strong>Zubehör:</strong> ${extras.join(', ')}</p>`);
        items.push(data);
    }

    // ----------------------------------------------------------- Panzerung
    for (const a of norm.armors) {
        items.push(await catalogItem(a, 'armor', report));
        for (const mod of a.mods) items.push(await catalogItem(mod, 'gear', report));
    }

    // ---------------------------------------------------------------- Gear
    for (const g of norm.gears) {
        const hit = await ChummerData.findById(g.sourceId);
        if (!hit && g.depth > 0) {
            // Chummer-interne Kind-Einträge (Kommlink-Funktionalität usw.)
            report.skip(g.name, 'integriertes Zubehör ohne Katalogeintrag');
            continue;
        }
        const data = await catalogItem(g, 'gear', report);
        if (g.qty > 1) {
            data.system ??= {};
            data.system.technology = foundry.utils.mergeObject(
                data.system.technology ?? {}, { quantity: g.qty }, { inplace: false });
        }
        items.push(data);
    }

    // ---------------------------------------------------------------- Ware
    for (const w of norm.ware) {
        const data = await catalogItem(w, w.kind, report);
        data.system ??= {};
        data.system.essence = w.essence;
        data.system.grade = w.grade;
        items.push(data);
    }

    // ------------------------------------------------------------ Kontakte
    for (const ct of norm.contacts) {
        const bits = [ct.role, ct.location].filter(Boolean).join(' · ');
        const data = {
            name: ct.name,
            type: 'contact',
            system: {
                type: ct.role,
                connection: ct.connection,
                loyalty: ct.loyalty,
                family: ct.family,
                blackmail: ct.blackmail,
                group: ct.group,
                ...(bits ? { description: { value: `<p>${bits}</p>` } } : {}),
            },
        };
        items.push(report.add(data, null));
    }

    // ----------------------------------------------------------- Lifestyle
    for (const l of norm.lifestyles) {
        const hit = await ChummerData.findById(l.sourceId);
        const data = await purchasedItemData('lifestyle', hit?.entry ?? {
            name: l.baseEn || l.name, en: l.baseEn, cost: l.cost,
            source: l.source, page: l.page,
        });
        if (l.name && l.name !== l.baseEn) data.name = l.name;
        items.push(report.add(tagSource(data, l), hit?.entry));
    }

    // ------------------------------------------------------------ Actor
    const system = {
        metatype: norm.metatype,
        attributes: Object.fromEntries(
            Object.entries(norm.attributes)
                .filter(([key]) => key !== 'magic' && key !== 'resonance')
                .map(([key, base]) => [key, { base }])),
        karma: { value: norm.karma },
        nuyen: norm.nuyen,
        street_cred: norm.streetCred,
        notoriety: norm.notoriety,
        public_awareness: norm.publicAwareness,
    };
    if (norm.magEnabled) {
        system.special = 'magic';
        system.attributes.magic = { base: norm.attributes.magic ?? 1 };
        system.magic = { initiation: norm.initiationGrade };
        if (norm.tradition?.drainAttribute) system.magic.attribute = norm.tradition.drainAttribute;
    } else if (norm.resEnabled) {
        system.special = 'resonance';
        system.attributes.resonance = { base: norm.attributes.resonance ?? 1 };
        system.technomancer = { submersion: norm.submersionGrade };
    }
    const bio = [
        norm.realName && norm.realName !== norm.name ? `<p><strong>Name:</strong> ${norm.realName}</p>` : '',
        norm.metavariant && norm.metavariant !== norm.metatypeName
            ? `<p><strong>Metatyp:</strong> ${norm.metatypeName} (${norm.metavariant})</p>` : '',
        norm.tradition ? `<p><strong>Tradition:</strong> ${norm.tradition.name}</p>` : '',
        norm.concept ? `<p><strong>Konzept:</strong> ${norm.concept}</p>` : '',
        norm.background ? `<p>${norm.background}</p>` : '',
        norm.notes ? `<p>${norm.notes}</p>` : '',
    ].filter(Boolean).join('');
    if (bio) system.description = { value: bio };

    const actorData = {
        name: norm.name,
        type: 'character',
        system,
        items,
        prototypeToken: { actorLink: true, disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY },
        flags: { [MODULE_ID]: { chummerImport: { name: norm.name, date: Date.now() } } },
    };

    // ----------------------------------------------------------- Fahrzeuge
    const vehicles = [];
    if (options.vehicles !== false) {
        for (const v of norm.vehicles) vehicles.push(await buildVehicle(v, report));
        report.vehicles = vehicles.length;
    }

    return { actorData, vehicles, report };
}

/** Fahrzeug-Actor-Daten (system.driver setzt der Aufrufer nach Erzeugung). */
async function buildVehicle(v, report) {
    const split = value => {
        const [base, offRoad] = String(value).split('/').map(x => parseInt(x) || 0);
        return { base, offRoad: offRoad ?? base };
    };
    const handling = split(v.handling);
    const speed = split(v.speed);
    const accel = split(v.accel);

    const items = [];
    for (const w of v.weapons) items.push(await catalogItem(w, 'weapon', report));
    for (const g of v.gears) {
        const hit = await ChummerData.findById(g.sourceId);
        if (!hit && g.depth > 0) continue;
        items.push(await catalogItem(g, 'gear', report));
    }
    for (const mod of v.mods) {
        const data = {
            name: displayName(mod, null),
            type: 'modification',
            system: { description: { source: sourceString(mod) } },
        };
        items.push(report.add(tagSource(data, mod), null));
    }

    const hit = await ChummerData.findById(v.sourceId);
    const category = v.category ?? '';
    return {
        name: displayName(v, hit?.entry),
        type: 'vehicle',
        items,
        system: {
            isDrone: v.isDrone,
            ...(v.isDrone ? { category: category.replace('Drones: ', '').toLowerCase() } : {}),
            vehicle_stats: {
                pilot: { base: v.pilot },
                handling: { base: handling.base },
                off_road_handling: { base: handling.offRoad },
                speed: { base: speed.base },
                off_road_speed: { base: speed.offRoad },
                acceleration: { base: accel.base },
                off_road_acceleration: { base: accel.offRoad },
                sensor: { base: v.sensor },
                seats: { base: v.seats },
            },
            attributes: { body: { base: v.body } },
            armor: { rating: { base: v.armor } },
            cost: v.cost,
            availability: v.avail,
        },
        prototypeToken: { disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY },
        flags: { [MODULE_ID]: { ...(v.sourceId ? { sourceId: v.sourceId } : {}) } },
    };
}
