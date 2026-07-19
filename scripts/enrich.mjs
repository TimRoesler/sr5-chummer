/**
 * GRW-Anreicherung: eigene Beschreibungstexte und ActiveEffects (streng nach GRW)
 * für Katalog-Items. Greift beim Kauf/Import (purchasedItemData) und per
 * Nachrüst-Tool für bereits existierende Welt-Items.
 *
 * Datenformat (data/enrichment-*.json): { "<katalog-id>": { description, effects[] } }
 * Effekte nutzen das SR5-Systemschema (system.applyTo, system.changes[{key,type,value}]).
 */
import { ChummerData, MODULE_ID } from './data.mjs';

const ENRICHMENT_FILES = ['enrichment-gear', 'enrichment-weapons', 'enrichment-armor'];

let merged = null;

export async function enrichmentData() {
    if (merged) return merged;
    const parts = await Promise.all(ENRICHMENT_FILES.map(name =>
        ChummerData.load(name).catch(() => ({}))));
    merged = Object.assign({}, ...parts);
    return merged;
}

function effectCreateData(fx, entryId) {
    const data = foundry.utils.deepClone(fx);
    data._id ??= foundry.utils.randomID();
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
    if (info.description && !data.system.description.value) {
        data.system.description.value = info.description;
    }
    const alreadyEnriched = (data.effects ?? []).some(fx => fx.flags?.[MODULE_ID]?.enriched);
    if (info.effects?.length && !alreadyEnriched) {
        data.effects = [...(data.effects ?? []), ...info.effects.map(fx => effectCreateData(fx, entry.id))];
    }
    return data;
}

/** Name → Katalogeintrag über alle drei Kataloge (deutscher Name und en-Original). */
async function catalogByName() {
    const byName = new Map();
    for (const file of ['gear', 'weapons', 'armor']) {
        for (const entry of await ChummerData.load(file)) {
            if (entry.name) byName.set(entry.name, entry);
            if (entry.en) byName.set(entry.en, entry);
        }
    }
    return byName;
}

/**
 * Bestehende Welt-Items nachrüsten (GM): Beschreibung nur, wenn leer;
 * Effekte nur, wenn noch keine angereicherten vorhanden sind.
 */
export async function retrofitWorldItems({ dryRun = false } = {}) {
    if (!game.user.isGM) {
        ui.notifications.warn(game.i18n.localize('CHUMMER.Enrich.GmOnly'));
        return null;
    }
    const info = await enrichmentData();
    const byName = await catalogByName();
    const documents = [
        ...game.items.contents,
        ...game.actors.contents.flatMap(actor => actor.items.contents),
    ];
    const summary = { scanned: documents.length, matched: 0, descriptions: 0, effects: 0 };
    for (const item of documents) {
        const entry = byName.get(item.name);
        const enrichment = entry ? info[entry.id] : null;
        if (!enrichment) continue;
        summary.matched++;
        const wantsDescription = enrichment.description && !item.system?.description?.value;
        const hasEnriched = item.effects.some(fx => fx.getFlag?.(MODULE_ID, 'enriched'));
        const wantsEffects = enrichment.effects?.length && !hasEnriched;
        if (dryRun) {
            if (wantsDescription) summary.descriptions++;
            if (wantsEffects) summary.effects += enrichment.effects.length;
            continue;
        }
        if (wantsDescription) {
            await item.update({ 'system.description.value': enrichment.description });
            summary.descriptions++;
        }
        if (wantsEffects) {
            await item.createEmbeddedDocuments('ActiveEffect',
                enrichment.effects.map(fx => effectCreateData(fx, entry.id)));
            summary.effects += enrichment.effects.length;
        }
    }
    const message = game.i18n.format('CHUMMER.Enrich.Summary', summary);
    ui.notifications.info(message);
    console.info(`${MODULE_ID} | ${message}`, summary);
    return summary;
}
