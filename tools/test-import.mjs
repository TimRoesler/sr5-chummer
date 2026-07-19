#!/usr/bin/env node
/**
 * Testet scripts/chummer-parse.mjs gegen echte Chummer-Exportdateien.
 * Aufruf: node tools/test-import.mjs [ordner-mit-json-exporten]
 * Standardordner: die Kampagnen-Exporte unter 10_FOUNDRYVTT (read-only).
 *
 * Prüft zusätzlich die sourceId-Trefferquote gegen die Katalogdaten in data/.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChummerFile } from '../scripts/chummer-parse.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDir = process.argv[2]
    ?? '/home/foundryvtt/10_FOUNDRYVTT/data/Data/assets/_charaktere_json';

// Katalog-IDs einsammeln (wie ChummerData.byId, nur ohne Foundry).
const catalogIds = new Map();
for (const file of ['weapons', 'armor', 'gear', 'cyberware', 'bioware', 'vehicles',
    'lifestyles', 'qualities', 'spells', 'powers', 'complexforms']) {
    for (const entry of JSON.parse(readFileSync(join(root, 'data', `${file}.json`), 'utf8'))) {
        if (entry.id) catalogIds.set(entry.id.toLowerCase(), file);
    }
}
const skillIds = new Set(JSON.parse(readFileSync(join(root, 'data', 'skills.json'), 'utf8'))
    .skills.map(s => s.id.toLowerCase()));

let failures = 0;
const check = (cond, msg) => {
    if (!cond) { failures++; console.error(`  ✖ ${msg}`); }
};

for (const file of readdirSync(fixtureDir).filter(f => f.endsWith('.json')).sort()) {
    const text = readFileSync(join(fixtureDir, file), 'utf8');
    const chars = parseChummerFile(text);
    check(chars.length >= 1, `${file}: kein Charakter geparst`);
    for (const c of chars) {
        console.log(`\n${file} → "${c.name}" (${c.metatypeName}${c.metavariant ? `/${c.metavariant}` : ''})`);
        check(c.name.length > 0, 'Name fehlt');
        check(['human', 'elf', 'dwarf', 'ork', 'troll'].includes(c.metatype), `Metatyp unbekannt: ${c.metatype}`);
        const attrKeys = Object.keys(c.attributes);
        check(attrKeys.length >= 8, `nur ${attrKeys.length} Attribute geparst`);
        for (const k of ['body', 'agility', 'reaction', 'strength', 'charisma', 'intuition', 'logic', 'willpower']) {
            check(Number.isInteger(c.attributes[k]) && c.attributes[k] >= 1,
                `Attribut ${k} fehlt/ungültig: ${c.attributes[k]}`);
        }
        check(Number.isFinite(c.nuyen), `Nuyen ungültig: ${c.nuyen}`);

        // sourceId-Trefferquoten
        const rate = (list, label, idSet = catalogIds) => {
            const withId = list.filter(x => x.sourceId);
            const hits = withId.filter(x => idSet.has ? idSet.has(x.sourceId) : idSet.get(x.sourceId));
            const miss = list.filter(x => !x.sourceId || !hits.includes(x));
            console.log(`  ${label}: ${list.length} gesamt, ${hits.length} Katalogtreffer`
                + (miss.length ? ` — ohne Treffer: ${miss.map(x => x.name).join(', ')}` : ''));
            return hits.length;
        };
        rate(c.skills, 'Skills', skillIds);
        rate(c.weapons, 'Waffen');
        rate(c.armors, 'Panzerung');
        rate(c.gears, 'Gear');
        rate(c.ware, 'Ware');
        rate(c.qualities, 'Qualitäten');
        rate(c.spells, 'Zauber');
        rate(c.vehicles, 'Fahrzeuge');
        console.log(`  Kontakte: ${c.contacts.length}, Wissens-/Sprachskills: ${c.knowledgeSkills.length},`
            + ` Lifestyles: ${c.lifestyles.length}, Kräfte: ${c.powers.length}, KF: ${c.complexforms.length}`);
        for (const s of c.skills) check(s.rating >= 1 && s.rating <= 13, `Skillrating ungültig: ${s.name}=${s.rating}`);
        for (const v of c.vehicles) check(v.body >= 0, `Fahrzeug mit ungültigem Rumpf: ${v.name}`);
        for (const ct of c.contacts) check(ct.connection >= 1 || ct.loyalty >= 1, `Kontakt ohne Werte: ${ct.name}`);
    }
}

console.log(failures ? `\n${failures} Prüfungen fehlgeschlagen.` : '\nAlle Prüfungen bestanden.');
process.exit(failures ? 1 : 0);
