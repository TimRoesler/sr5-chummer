/**
 * Datenreparatur: ActiveEffects mit ungültigem tint ("" statt Farbe/null) lassen
 * die strikte v14-Validierung scheitern — besonders fatal in verschachtelten Items
 * (flags.shadowrun5e.embeddedItems), deren Rohdaten ohne Server-Bereinigung geladen
 * werden und dann die komplette Actor-Vorbereitung beim Weltstart abbrechen.
 * Läuft automatisch beim Weltstart (GM) und im Kompendiums-Durchlauf der Nachrüstung.
 */
import { MODULE_ID } from './data.mjs';

const TAG = `${MODULE_ID} | Reparatur`;
const log = (...args) => console.info(`${TAG} |`, ...args);
const VALID_TINT = '#ffffff';

/** Effekt-Rohdaten in place fixen; liefert Anzahl der Korrekturen. */
function fixEffectArray(effects, kontext, fixes) {
    let count = 0;
    for (const fx of effects ?? []) {
        if (fx && typeof fx === 'object' && fx.tint === '') {
            fx.tint = VALID_TINT;
            fixes.push(`${kontext} → Effekt "${fx.name ?? fx._id ?? '?'}"`);
            count++;
        }
    }
    return count;
}

/** Ein Item-Dokument prüfen: eigene Effekte + verschachtelte Items (rekursiv). */
async function repairItem(item) {
    const fixes = [];
    const kontext = `${item.parent?.name ?? 'Welt'} › ${item.name}`;

    // Eigene Effekte: Quelldaten prüfen, Korrektur per Document-Update.
    for (const fx of item.effects ?? []) {
        if (fx._source?.tint === '') {
            await fx.update({ tint: VALID_TINT });
            fixes.push(`${kontext} → Effekt "${fx.name}"`);
        }
    }

    // Verschachtelte Items: Rohdaten im Flag fixen und nur bei Treffern zurückschreiben.
    const nested = foundry.utils.deepClone(item.getFlag?.('shadowrun5e', 'embeddedItems'));
    if (Array.isArray(nested) && nested.length) {
        let count = 0;
        const walk = (list, pfad) => {
            for (const raw of list ?? []) {
                if (!raw || typeof raw !== 'object') continue;
                count += fixEffectArray(raw.effects, `${pfad} › ${raw.name ?? raw._id ?? '?'}`, fixes);
                const tiefer = raw.flags?.shadowrun5e?.embeddedItems;
                if (Array.isArray(tiefer)) walk(tiefer, `${pfad} › ${raw.name ?? '?'}`);
            }
        };
        walk(nested, kontext);
        if (count) await item.update({ 'flags.shadowrun5e.embeddedItems': nested });
    }

    return fixes;
}

/** Alle Welt- und Actor-Items reparieren; optional zusätzliche Dokumente (z. B. Kompendium). */
export async function repairEffectTints(extraDocuments = []) {
    if (!game.user.isGM) return { fixes: 0 };
    const documents = [
        ...game.items.contents,
        ...game.actors.contents.flatMap(actor => actor.items.contents),
        ...extraDocuments,
    ];
    const alleFixes = [];
    for (const item of documents) {
        try {
            alleFixes.push(...await repairItem(item));
        } catch (error) {
            console.error(`${TAG} | ✖ FEHLER bei "${item?.name}":`, error);
        }
    }
    if (alleFixes.length) {
        console.group(`${TAG} | ${alleFixes.length} ungültige Effekt-tints repariert ("" → ${VALID_TINT})`);
        for (const fix of alleFixes) log(`✔ ${fix}`);
        console.groupEnd();
        ui.notifications.info(game.i18n.format('CHUMMER.Repair.Summary', { count: alleFixes.length }));
    } else {
        log('Keine ungültigen Effekt-tints gefunden.');
    }
    return { fixes: alleFixes.length };
}
