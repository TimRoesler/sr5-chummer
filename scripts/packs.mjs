/**
 * Nachträgliche Übersetzung der vom System-Bulkimporter erzeugten
 * Kompendien (sr5weapon, sr5gear, …) ins Deutsche: Item-/Actor-Namen,
 * Quellenangaben (deutsche Seitenzahlen) und Ordnernamen (Kategorien).
 */
import { ChummerData, MODULE_ID } from './data.mjs';

/** Welche Übersetzungs-Abschnitte (translations.json → items) je Kompendium gelten. */
const PACK_SECTIONS = {
    sr5weapon: ['weapons'],
    sr5gear: ['armor', 'gear', 'programs'],
    sr5ware: ['cyberware', 'bioware'],
    sr5trait: ['qualities', 'powers', 'critterpowers', 'echoes', 'martialarts', 'mentors', 'metamagic'],
    sr5magic: ['spells', 'complexforms', 'traditions', 'streams'],
    sr5modification: ['weaponaccessories', 'armormods', 'vehiclemods'],
    sr5misc: ['skills', 'skillgroups'],
    sr5drone: ['vehicles'],
    sr5critter: ['critters', 'metatypes', 'traditions', 'streams'],
};

export class PackTranslator {
    /**
     * Prüft anhand der Kompendium-Indizes, ob noch englische Namen vorhanden
     * sind (z.B. direkt nach einem Bulkimport). Billig – lädt keine Dokumente.
     */
    static async needsTranslation() {
        const t = await ChummerData.translations();
        for (const [baseName, sections] of Object.entries(PACK_SECTIONS)) {
            const pack = game.packs.find(p => p.metadata.name === baseName);
            if (!pack) continue;
            const map = {};
            for (const s of sections) Object.assign(map, t.items?.[s] ?? {});
            const index = await pack.getIndex();
            if (index.some(e => map[e.name]?.de && map[e.name].de !== e.name)) return true;
        }
        return false;
    }

    /**
     * Übersetzt alle bekannten Kompendien. Liefert {renamed, sources, folders}.
     */
    static async translateAll({ notify = true } = {}) {
        if (!game.user.isGM) return null;
        const t = await ChummerData.translations();
        const codeMap = Object.fromEntries(
            Object.entries(t.books ?? {}).map(([en, cfg]) => [en, cfg.code || en]));

        // Kategorien aller Abschnitte zusammenfassen (für Ordnernamen).
        const folderMap = {};
        for (const cats of Object.values(t.categories ?? {})) {
            Object.assign(folderMap, cats);
        }

        const stats = { renamed: 0, sources: 0, folders: 0 };
        for (const [baseName, sections] of Object.entries(PACK_SECTIONS)) {
            const pack = game.packs.find(p => p.metadata.name === baseName);
            if (!pack) continue;

            // Namens-Map dieses Kompendiums aufbauen.
            const map = {};
            for (const s of sections) Object.assign(map, t.items?.[s] ?? {});

            const wasLocked = pack.locked;
            if (wasLocked) await pack.configure({ locked: false });
            try {
                await this.#translatePack(pack, map, codeMap, stats);
                await this.#translateFolders(pack, folderMap, stats);
            } finally {
                if (wasLocked) await pack.configure({ locked: true });
            }
        }

        if (notify) {
            ui.notifications.info(game.i18n.format('CHUMMER.PacksTranslated', stats));
        }
        return stats;
    }

    static async #translatePack(pack, map, codeMap, stats) {
        const docs = await pack.getDocuments();
        const updates = [];
        for (const doc of docs) {
            const entry = map[doc.name];
            const update = { _id: doc.id };
            let changed = false;

            if (entry?.de && entry.de !== doc.name) {
                update.name = entry.de;
                stats.renamed++;
                changed = true;
            }

            // Quellenangabe "SR5 282" → deutscher Code + deutsche Seite.
            const source = doc.system?.description?.source;
            if (source && entry) {
                const m = String(source).match(/^(\S+)\s*(\S*)$/);
                if (m) {
                    const deCode = codeMap[m[1]] ?? m[1];
                    const dePage = entry.page || m[2];
                    const newSource = dePage ? `${deCode} ${dePage}` : deCode;
                    if (newSource !== source) {
                        update['system.description.source'] = newSource;
                        stats.sources++;
                        changed = true;
                    }
                }
            }

            if (changed) updates.push(update);
        }
        if (updates.length) {
            await pack.documentClass.updateDocuments(updates, { pack: pack.collection });
        }
    }

    static async #translateFolders(pack, folderMap, stats) {
        const updates = [];
        for (const folder of pack.folders) {
            const de = folderMap[folder.name];
            if (de && de !== folder.name) {
                updates.push({ _id: folder.id, name: de });
                stats.folders++;
            }
        }
        if (updates.length) {
            await Folder.updateDocuments(updates, { pack: pack.collection });
        }
    }
}
