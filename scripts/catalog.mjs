/**
 * Gemeinsame Katalog-Aufbereitung (Filtern, Sortieren, Spaltenköpfe)
 * für den Shop und den Ausrüstungsschritt der Charaktererschaffung.
 */
import { ChummerData } from './data.mjs';
import { SourceLinks } from './sources.mjs';

export const CATALOG_KINDS = [
    ['weapons', 'weapon'],
    ['armor', 'armor'],
    ['gear', 'gear'],
    ['cyberware', 'cyberware'],
    ['bioware', 'bioware'],
    ['vehicles', 'vehicle'],
    ['lifestyles', 'lifestyle'],
];

/** Zahlenformat in der Foundry-Sprache. */
export function fmt(n) {
    return Number(n ?? 0).toLocaleString(game.i18n.lang);
}

/** Sortierstatus umschalten: gleiche Spalte → Richtung wechseln, sonst neue Spalte aufsteigend. */
export function toggleSort(sort, key) {
    if (sort.key === key) sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
    else {
        sort.key = key;
        sort.dir = 'asc';
    }
}

/**
 * Kontext für sortierbare Spaltenköpfe (Partial cvtt-listhead).
 * cols: [{ key?, label?, cls? }] – ohne key ist die Spalte nicht sortierbar.
 */
export function listHeaders(list, sort, cols) {
    return cols.map(c => ({
        ...c,
        list,
        active: !!c.key && sort.key === c.key,
        icon: c.key
            ? (sort.key === c.key
                ? (sort.dir === 'desc' ? 'fa-arrow-down-wide-short' : 'fa-arrow-up-short-wide')
                : 'fa-sort')
            : '',
    }));
}

/** Sortiert Zeilen in-place nach benannten Schlüsselfunktionen (Strings locale-bewusst). */
export function sortRows(rows, keyFns, sort) {
    const fn = keyFns[sort.key] ?? keyFns.name;
    const dir = sort.dir === 'desc' ? -1 : 1;
    return rows.sort((a, b) => {
        const x = fn(a), y = fn(b);
        if (typeof x === 'string' || typeof y === 'string')
            return String(x).localeCompare(String(y), game.i18n.lang) * dir;
        return ((x ?? 0) - (y ?? 0)) * dir;
    });
}

/**
 * Filtert, sortiert und mappt einen Ausrüstungskatalog für die Anzeige.
 * filters: { search, cat, legality ('' | 'legal' | 'R' | 'F'), maxAvail, affordable? }
 * options: { availLimit: Warnschwelle (Chargen) | null, budget: Nuyen für affordable | null, limit }
 */
export function catalogContext(catalog, kind, filters, sort, { availLimit = null, budget = null, limit = 200 } = {}) {
    const search = (filters.search ?? '').toLowerCase();
    const maxAvail = parseInt(filters.maxAvail);

    const rows = [];
    for (const e of catalog) {
        if (filters.cat && e.category !== filters.cat) continue;
        if (search && !e.name.toLowerCase().includes(search) && !(e.en ?? '').toLowerCase().includes(search)) continue;
        const minR = e.minrating || 1;
        const costNum = ChummerData.evalCost(e.cost, minR);
        const av = ChummerData.parseAvail(e.avail, minR);
        if (filters.legality === 'legal' && av.legality) continue;
        if ((filters.legality === 'R' || filters.legality === 'F') && av.legality !== filters.legality) continue;
        if (Number.isFinite(maxAvail) && av.value > maxAvail) continue;
        if (filters.affordable && budget !== null && (costNum === null || costNum > budget)) continue;
        rows.push({
            e, costNum, av,
            label: ChummerData.nameOf(e),
            catLabel: ChummerData.catDe(kind, e.category ?? ''),
        });
    }

    sortRows(rows, {
        name: r => r.label,
        category: r => r.catLabel,
        cost: r => r.costNum ?? Number.POSITIVE_INFINITY,
        // Legalität bricht Gleichstände: legal < R < F
        avail: r => r.av.value + (r.av.legality === 'F' ? 0.6 : r.av.legality === 'R' ? 0.3 : 0),
    }, sort);

    const total = rows.length;
    const list = rows.slice(0, limit).map(({ e, costNum, av, label, catLabel }) => {
        const rating = e.maxrating || e.rating || 0;
        return {
            name: e.name,
            label,
            category: catLabel,
            cost: costNum === null ? String(e.cost) : fmt(costNum) + '¥',
            avail: ChummerData.availDisplay(e.avail, e.minrating || 1),
            legality: av.legality,
            availTooHigh: availLimit !== null && (av.value > availLimit || av.legality === 'F'),
            maxRating: rating,
            minRating: e.minrating || (rating ? 1 : 0),
            sourceLink: SourceLinks.linkHTML(e.source, e.page),
        };
    });

    const cats = [...new Set(catalog.map(e => e.category).filter(Boolean))]
        .map(c => ({ name: c, label: ChummerData.catDe(kind, c), selected: c === filters.cat }))
        .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));

    return { list, cats, total, shown: list.length };
}

/** Standard-Spaltenköpfe des Ausrüstungskatalogs (Shop und Chargen). */
export function gearHeaders(listName, sort) {
    const L = k => game.i18n.localize(`CHUMMER.${k}`);
    return listHeaders(listName, sort, [
        { key: 'name', label: L('Name') },
        { key: 'category', label: L('Category') },
        { key: 'cost', label: L('Cost'), cls: 'cvtt-num' },
        { key: 'avail', label: L('AvailShort'), cls: 'cvtt-num' },
        { label: L('Rating') },
        { label: L('Source'), cls: 'cvtt-src' },
        {},
    ]);
}

/** Auswahloptionen für den Legalitätsfilter. */
export function legalityOptions(current) {
    return [
        { value: '', label: game.i18n.localize('CHUMMER.All') },
        { value: 'legal', label: game.i18n.localize('CHUMMER.Legal') },
        { value: 'R', label: game.i18n.localize('CHUMMER.Restricted') },
        { value: 'F', label: game.i18n.localize('CHUMMER.Forbidden') },
    ].map(o => ({ ...o, selected: o.value === current }));
}

/** Formatierter Treffer-Zähler ("12 von 480"). */
export function resultCount(shown, total) {
    return game.i18n.format('CHUMMER.ResultCount', { shown, total });
}
