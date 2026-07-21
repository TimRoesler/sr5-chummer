/**
 * Zugriff auf die aus Chummer5a konvertierten JSON-Daten sowie
 * Hilfsfunktionen für Kosten-/Verfügbarkeitsformeln und Kompendium-Lookups.
 */
export const MODULE_ID = 'sr5-chummer';

/** World-Setting: Liste deaktivierter Buchcodes (siehe BooksConfig). */
export const SETTING_DISABLED_BOOKS = 'disabledBooks';

/** Das Grundregelwerk ist immer aktiv und nicht abwählbar. */
export const CORE_BOOK = 'SR5';

export class ChummerData {
    static #cache = new Map();

    /** Lädt eine JSON-Datei aus dem data/-Ordner des Moduls (mit Cache). */
    static async load(name) {
        if (this.#cache.has(name)) return this.#cache.get(name);
        const data = await foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/${name}.json`);
        this.#cache.set(name, data);
        return data;
    }

    static async books() { return this.load('books'); }
    static async translations() { return this.load('translations'); }

    static #translationsSync = null;
    static #reverseNames = null;

    /** Läuft Foundry auf Deutsch? Steuert die Anzeigesprache der Chummer-Daten. */
    static get isGerman() {
        return (game.i18n?.lang ?? 'en').startsWith('de');
    }

    /** Übersetzungen vorladen, damit catDe()/nameOf() synchron nutzbar sind. */
    static async preloadTranslations() {
        this.#translationsSync ??= await this.translations();
        // Rückwärts-Map (deutscher Name → englisches Original) für Einträge,
        // die kein eigenes en-Feld haben (Skillgruppen, Metavarianten, …).
        if (!this.isGerman && !this.#reverseNames) {
            const rev = {};
            for (const section of Object.values(this.#translationsSync.items ?? {})) {
                for (const [en, cfg] of Object.entries(section)) {
                    if (cfg?.de && cfg.de !== en) rev[cfg.de] = en;
                }
            }
            this.#reverseNames = rev;
        }
        return this.#translationsSync;
    }

    /**
     * Anzeigename eines Chummer-Eintrags in der Foundry-Sprache.
     * Die Datensätze tragen deutsche Namen (name) und das englische
     * Original (en); interne Schlüssel bleiben immer entry.name.
     */
    static nameOf(entry) {
        if (!entry) return '';
        if (typeof entry === 'string') entry = { name: entry };
        if (this.isGerman) return entry.name;
        return entry.en ?? this.#reverseNames?.[entry.name] ?? entry.name;
    }

    /**
     * Anzeige einer Kategorie in der Foundry-Sprache (Datenwerte sind englisch;
     * auf Deutsch wird via translations.json übersetzt).
     * section: weapons | armor | gear | cyberware | bioware | vehicles |
     *          spells | skills | qualities | lifestyles | …
     */
    static catDe(section, name) {
        if (!this.isGerman) return name;
        return this.#translationsSync?.categories?.[section]?.[name] ?? name;
    }
    static async priorities() { return this.load('priorities'); }
    static async skills() { return this.load('skills'); }
    static async qualities() { return this.filterBooks(await this.load('qualities')); }
    static async spells() { return this.filterBooks(await this.load('spells')); }
    static async powers() { return this.filterBooks(await this.load('powers')); }
    static async complexforms() { return this.filterBooks(await this.load('complexforms')); }
    static async metamagic() { return this.load('metamagic'); }
    static async echoes() { return this.load('echoes'); }

    /** Metatypen inkl. Metavarianten, gefiltert auf aktive Regelwerke. */
    static async metatypes() {
        const raw = await this.load('metatypes');
        if (!this.disabledBooks().size) return raw;
        return this.filterBooks(raw).map(m => ({
            ...m,
            metavariants: this.filterBooks(m.metavariants ?? []),
        }));
    }

    /** Katalogdaten für den Shop (nur Einträge aktiver Regelwerke). */
    static async catalog(kind) {
        // weapons | armor | gear | cyberware | bioware | vehicles | lifestyles
        return this.filterBooks(await this.load(kind));
    }

    // ---------------------------------------------------- Aktive Regelwerke

    /** Set der deaktivierten Buchcodes aus dem World-Setting (nie das GRW). */
    static disabledBooks() {
        const list = game.settings.get(MODULE_ID, SETTING_DISABLED_BOOKS) ?? [];
        return new Set(list.filter(code => code !== CORE_BOOK));
    }

    /** Ist ein Quellbuch aktiv? Einträge ohne Quelle gelten immer als aktiv. */
    static bookActive(code) {
        return !code || code === CORE_BOOK || !this.disabledBooks().has(code);
    }

    /** Filtert eine Datenliste auf Einträge aus aktiven Regelwerken. */
    static filterBooks(list) {
        const off = this.disabledBooks();
        if (!off.size) return list;
        return list.filter(e => !e.source || !off.has(e.source));
    }

    /**
     * Wertet eine Chummer-Kostenformel aus ("425", "Rating*2000", "Variable(20-100000)").
     * Liefert eine Zahl oder null, wenn nicht auswertbar.
     */
    static evalCost(cost, rating = 1) {
        if (cost === undefined || cost === null || cost === '') return 0;
        if (typeof cost === 'number') return cost;
        let s = String(cost).trim();
        if (s.startsWith('Variable')) return null;
        s = s.replace(/Rating/gi, String(rating));
        s = s.replace(/[^0-9+\-*/(). ]/g, '');
        if (!s) return null;
        try {
            // eslint-disable-next-line no-new-func
            const v = Function(`"use strict"; return (${s});`)();
            return Number.isFinite(v) ? Math.round(v) : null;
        } catch {
            return null;
        }
    }

    /**
     * Zerlegt eine Verfügbarkeitsangabe ("12F", "Rating*3R", "+4", "0").
     * Liefert { value, legality } – legality: '' | 'R' | 'F'.
     */
    static parseAvail(avail, rating = 1) {
        if (avail === undefined || avail === null) return { value: 0, legality: '' };
        let s = String(avail).trim();
        const legality = /F$/i.test(s) ? 'F' : (/R$/i.test(s) ? 'R' : '');
        s = s.replace(/[FR]$/i, '').replace(/^\+/, '');
        s = s.replace(/Rating/gi, String(rating)).replace(/[^0-9+\-*/(). ]/g, '');
        let value = 0;
        try {
            // eslint-disable-next-line no-new-func
            value = s ? Function(`"use strict"; return (${s});`)() : 0;
        } catch {
            value = 0;
        }
        return { value: Number.isFinite(value) ? value : 0, legality };
    }

    /** Anzeigeform einer Verfügbarkeit für eine konkrete Stufe. */
    static availDisplay(avail, rating = 1) {
        const { value, legality } = this.parseAvail(avail, rating);
        return `${value}${legality}`;
    }

    // ------------------------------------------------------- Katalog-Lookup

    static #idIndex = null;

    /**
     * Katalogeintrag per Chummer-GUID (sourceid) über alle Kataloge.
     * Liefert { kind, entry } oder null. kind entspricht dem Dateinamen
     * (weapons | armor | gear | cyberware | bioware | vehicles | lifestyles |
     * qualities | spells | powers | complexforms).
     */
    static async findById(sourceId) {
        if (!sourceId) return null;
        if (!this.#idIndex) {
            const index = new Map();
            for (const kind of ['weapons', 'armor', 'gear', 'cyberware', 'bioware',
                'vehicles', 'lifestyles', 'qualities', 'spells', 'powers', 'complexforms']) {
                for (const entry of await this.load(kind)) {
                    if (entry.id) index.set(entry.id.toLowerCase(), { kind, entry });
                }
            }
            this.#idIndex = index;
        }
        return this.#idIndex.get(sourceId.toLowerCase()) ?? null;
    }

    // ------------------------------------------------------------ Kompendien

    static #packIndices = new Map();

    /**
     * Sucht ein Dokument per Name in den vom System-Bulkimporter erzeugten
     * Kompendien (z.B. sr5weapon). Es werden alle übergebenen Namen probiert
     * (deutscher Name und englischer Originalname). Liefert das Dokument oder null.
     */
    static async findInPack(packBaseNames, ...names) {
        if (!game.settings.get(MODULE_ID, 'useCompendium')) return null;
        const candidates = names.filter(Boolean);
        for (const base of packBaseNames) {
            const pack = game.packs.find(p => p.metadata.name === base);
            if (!pack) continue;
            let index = this.#packIndices.get(pack.collection);
            if (!index) {
                index = await pack.getIndex();
                this.#packIndices.set(pack.collection, index);
            }
            const entry = index.find(e => candidates.includes(e.name));
            if (entry) return pack.getDocument(entry._id);
        }
        return null;
    }

    /** Bequemer Lookup für die Standard-Kompendien des Bulkimporters. */
    static async findItem(kind, ...names) {
        const packs = {
            weapon: ['sr5weapon'],
            armor: ['sr5gear'],
            gear: ['sr5gear'],
            ware: ['sr5ware'],
            quality: ['sr5trait'],
            magic: ['sr5magic'],
            vehicle: ['sr5drone'],
            skill: ['sr5e-skills'],
            modification: ['sr5modification'],
        }[kind] ?? [];
        return this.findInPack(packs, ...names);
    }
}
