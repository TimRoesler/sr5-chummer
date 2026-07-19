/**
 * GRW-Anreicherung: eigene Beschreibungstexte und ActiveEffects (streng nach GRW)
 * für Katalog-Items. Greift beim Kauf/Import (purchasedItemData), automatisch bei
 * jedem Item-/Charakterimport (createItem-/createActor-Hooks) und per
 * Nachrüst-Button bzw. api.enrichItems() für bereits existierende Welt-Items.
 *
 * Datenformat (data/enrichment-*.json): { "<katalog-id>": { description, effects[] } }
 * Effekte nutzen das SR5-Systemschema (system.applyTo, system.changes[{key,type,value}]).
 *
 * Alle Vorgänge loggen ausführlich in die Browser-Konsole (Filter: "sr5-chummer").
 */
import { ChummerData, MODULE_ID } from './data.mjs';
import { repairEffectTints } from './repair.mjs';

const ENRICHMENT_FILES = ['enrichment-gear', 'enrichment-weapons', 'enrichment-armor', 'enrichment-qualities'];
/** Item-Typen, bei denen ein fehlender Katalogtreffer auffällig geloggt wird. */
const GEAR_TYPES = ['weapon', 'armor', 'equipment', 'ammo', 'quality'];

const TAG = `${MODULE_ID} | Anreicherung`;
const log = (...args) => console.info(`${TAG} |`, ...args);
const logDebug = (...args) => console.debug(`${TAG} |`, ...args);
const logWarn = (...args) => console.warn(`${TAG} |`, ...args);

let merged = null;

export async function enrichmentData() {
    if (merged) return merged;
    const parts = await Promise.all(ENRICHMENT_FILES.map(name =>
        ChummerData.load(name).catch(error => {
            logWarn(`Datendatei ${name}.json konnte nicht geladen werden:`, error);
            return {};
        })));
    merged = Object.assign({}, ...parts);
    log(`${Object.keys(merged).length} Katalogeinträge mit Anreicherungsdaten geladen.`);
    return merged;
}

function effectCreateData(fx, entryId) {
    const data = foundry.utils.deepClone(fx);
    data._id ??= foundry.utils.randomID();
    if (!data.tint) data.tint = '#ffffff';
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, { [MODULE_ID]: { enriched: entryId } });
    return data;
}

/** Item-Erzeugungsdaten anreichern (mutiert und liefert `data`). */
export async function enrichItemData(data, entry) {
    if (!entry?.id) return data;
    const info = (await enrichmentData())[entry.id];
    if (!info) return data;
    data.system ??= {};
    data.system.description ??= {};
    const parts = [];
    if (info.description && !data.system.description.value) {
        data.system.description.value = info.description;
        parts.push('Beschreibung');
    }
    const alreadyEnriched = (data.effects ?? []).some(fx => fx.flags?.[MODULE_ID]?.enriched);
    if (info.effects?.length && !alreadyEnriched) {
        data.effects = [...(data.effects ?? []), ...info.effects.map(fx => effectCreateData(fx, entry.id))];
        parts.push(`${info.effects.length} Effekt(e)`);
    }
    if (parts.length) logDebug(`Kaufdaten angereichert: "${data.name ?? entry.name}" (+${parts.join(', +')})`);
    return data;
}

/** Name → Katalogeintrag über alle drei Kataloge (deutscher Name und en-Original). */
let byNameCache = null;
async function catalogByName() {
    if (byNameCache) return byNameCache;
    const byName = new Map();
    for (const file of ['gear', 'weapons', 'armor', 'qualities']) {
        for (const entry of await ChummerData.load(file)) {
            if (entry.name) byName.set(entry.name, entry);
            if (entry.en) byName.set(entry.en, entry);
        }
    }
    byNameCache = byName;
    return byName;
}

/**
 * Ein existierendes Item-Dokument anreichern.
 * Liefert einen Status für das Log: enriched | partial | skipped | nomatch | error.
 */
export async function enrichExistingItem(item, { quelle = 'manuell', imKompendium = false } = {}) {
    try {
        // Kompendiums-Dokumente nur im expliziten Kompendiums-Durchlauf anfassen: bei
        // Auto-Hooks (z. B. Bulkimporter → gesperrtes world.sr5gear) werden sie übersprungen.
        if (item.pack && !imKompendium) {
            logDebug(`— Kompendium übersprungen: "${item.name}" (${item.pack}) [${quelle}]`);
            return 'skipped';
        }
        const entry = (await catalogByName()).get(item.name);
        const info = entry ? (await enrichmentData())[entry.id] : null;
        if (!info) {
            if (GEAR_TYPES.includes(item.type)) {
                log(`✖ kein GRW-Katalogeintrag: "${item.name}" (Typ ${item.type}, ${item.parent?.name ?? 'Welt-Item'}) [${quelle}]`);
                return 'nomatch';
            }
            logDebug(`— ignoriert (Typ ${item.type}): "${item.name}" [${quelle}]`);
            return 'nomatch';
        }
        const done = [];
        const skipped = [];
        let addedDescription = false;
        let addedEffects = 0;
        if (info.description) {
            if (item.system?.description?.value) skipped.push('Beschreibung vorhanden');
            else { await item.update({ 'system.description.value': info.description }); done.push('Beschreibung'); addedDescription = true; }
        }
        if (info.effects?.length) {
            const hasEnriched = item.effects.some(fx => fx.getFlag?.(MODULE_ID, 'enriched'));
            if (hasEnriched) skipped.push('Effekte bereits angereichert');
            else if (!(item.parent instanceof Actor) && !imKompendium) {
                // Effekte erst auf Actor-Items anlegen: auf Welt-Items sind sie wirkungslos und
                // bringen Fremdmodule (z. B. autoanimations) zum Absturz. Beim Verschieben auf
                // einen Charakter feuert createItem erneut und reicht die Effekte nach.
                skipped.push('Effekte folgen beim Anlegen auf einem Charakter');
            }
            else {
                await item.createEmbeddedDocuments('ActiveEffect',
                    info.effects.map(fx => effectCreateData(fx, entry.id)));
                done.push(`${info.effects.length} Effekt(e): ${info.effects.map(fx => fx.name).join(', ')}`);
                addedEffects = info.effects.length;
            }
        }
        if (done.length) {
            log(`✔ angereichert: "${item.name}" (${item.parent?.name ?? 'Welt-Item'}) → +${done.join(', +')}${skipped.length ? ` (übersprungen: ${skipped.join('; ')})` : ''} [${quelle}]`);
            return { status: 'enriched', addedDescription, addedEffects };
        }
        logDebug(`• unverändert: "${item.name}" — ${skipped.join('; ') || 'nichts zu tun'} [${quelle}]`);
        return 'skipped';
    } catch (error) {
        console.error(`${TAG} | ✖ FEHLER bei "${item?.name}" (${item?.parent?.name ?? 'Welt-Item'}):`, error);
        return 'error';
    }
}

/** Eine Item-Sammlung anreichern, mit Konsolen-Gruppe und Zusammenfassung. */
async function enrichBatch(items, { titel, quelle, imKompendium = false }) {
    const summary = { scanned: items.length, matched: 0, descriptions: 0, effects: 0, errors: 0 };
    console.group(`${TAG} | ${titel} (${items.length} Items)`);
    try {
        for (const item of items) {
            const result = await enrichExistingItem(item, { quelle, imKompendium });
            if (result === 'error') summary.errors++;
            else if (typeof result === 'object') {
                summary.matched++;
                if (result.addedDescription) summary.descriptions++;
                summary.effects += result.addedEffects;
            } else if (result === 'skipped') summary.matched++;
        }
    } finally {
        log(`Zusammenfassung: ${summary.matched} erkannt, ${summary.descriptions} Beschreibungen, ${summary.effects} Effekte, ${summary.errors} Fehler (${summary.scanned} geprüft).`);
        console.groupEnd();
    }
    return summary;
}

/** Bestehende Welt-Items nachrüsten (GM). */
export async function retrofitWorldItems({ dryRun = false } = {}) {
    if (!game.user.isGM) {
        ui.notifications.warn(game.i18n.localize('CHUMMER.Enrich.GmOnly'));
        return null;
    }
    const documents = [
        ...game.items.contents,
        ...game.actors.contents.flatMap(actor => actor.items.contents),
    ];
    if (dryRun) {
        const info = await enrichmentData();
        const byName = await catalogByName();
        const summary = { scanned: documents.length, matched: 0, descriptions: 0, effects: 0 };
        for (const item of documents) {
            const entry = byName.get(item.name);
            const enrichment = entry ? info[entry.id] : null;
            if (!enrichment) continue;
            summary.matched++;
            if (enrichment.description && !item.system?.description?.value) summary.descriptions++;
            if (enrichment.effects?.length && !item.effects.some(fx => fx.getFlag?.(MODULE_ID, 'enriched'))) summary.effects += enrichment.effects.length;
        }
        log('Probelauf:', summary);
        ui.notifications.info(game.i18n.format('CHUMMER.Enrich.Summary', summary));
        return summary;
    }
    const summary = await enrichBatch(documents, { titel: 'Welt-Items nachrüsten', quelle: 'Nachrüstung' });
    const packSummary = await retrofitCompendiums();
    summary.matched += packSummary.matched;
    summary.descriptions += packSummary.descriptions;
    summary.effects += packSummary.effects;
    ui.notifications.info(game.i18n.format('CHUMMER.Enrich.Summary', summary));
    return summary;
}

/**
 * Welt-Kompendien (Bulkimporter-Packs wie world.sr5gear) nachrüsten:
 * gesperrte Packs werden temporär entsperrt und danach wieder gesperrt.
 * Effekte werden hier auch ohne Actor angelegt — sie wandern beim
 * Drag & Drop bzw. Kauf mit auf den Charakter.
 */
export async function retrofitCompendiums() {
    const total = { matched: 0, descriptions: 0, effects: 0, errors: 0 };
    const packs = game.packs.filter(pack =>
        pack.metadata.packageType === 'world' && pack.documentName === 'Item');
    for (const pack of packs) {
        const warGesperrt = pack.locked;
        try {
            if (warGesperrt) {
                log(`Kompendium "${pack.metadata.label}" (${pack.collection}) wird temporär entsperrt.`);
                await pack.configure({ locked: false });
            }
            const documents = await pack.getDocuments();
            await repairEffectTints(documents);
            const summary = await enrichBatch(documents, {
                titel: `Kompendium "${pack.metadata.label}" nachrüsten`,
                quelle: `Kompendium ${pack.collection}`,
                imKompendium: true,
            });
            total.matched += summary.matched;
            total.descriptions += summary.descriptions;
            total.effects += summary.effects;
            total.errors += summary.errors;
        } catch (error) {
            console.error(`${TAG} | ✖ FEHLER im Kompendium "${pack.collection}":`, error);
            total.errors++;
        } finally {
            if (warGesperrt) await pack.configure({ locked: true }).catch(error =>
                logWarn(`Kompendium "${pack.collection}" konnte nicht wieder gesperrt werden:`, error));
        }
    }
    if (!packs.length) log('Keine Welt-Item-Kompendien gefunden — Kompendiums-Nachrüstung übersprungen.');
    return total;
}

/**
 * Automatische Anreicherung bei Importen:
 * - createActor: Chummer-Charakterimport des Systems legt den Actor samt
 *   eingebetteter Items an — einzelne createItem-Hooks feuern dabei nicht.
 * - createItem: Items, die auf bestehenden Actors landen (Drag & Drop,
 *   "Import Chummer Data", Shop legt bereits angereichert an → wird übersprungen).
 * Läuft nur auf dem Client, der den Import ausgelöst hat.
 */
export function registerAutoEnrichment() {
    Hooks.on('createActor', (actor, _options, userId) => {
        if (userId !== game.user.id || !actor.isOwner || actor.pack) return;
        if (!actor.items?.size) return;
        void enrichBatch([...actor.items], {
            titel: `Neuer Actor "${actor.name}" (Charakterimport?)`,
            quelle: 'createActor',
        });
    });
    Hooks.on('createItem', (item, _options, userId) => {
        if (userId !== game.user.id || !item.isOwner) return;
        if (item.getFlag?.(MODULE_ID, 'enriched')) return;
        void enrichExistingItem(item, { quelle: 'createItem' });
    });
    log('Auto-Anreicherung aktiv (createActor/createItem).');
}

/** Einstellungs-"Menü", das statt eines Fensters direkt die Nachrüstung startet. */
export class EnrichMenu extends foundry.applications.api.ApplicationV2 {
    render() {
        void retrofitWorldItems();
        return this;
    }
}
