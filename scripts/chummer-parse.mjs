/**
 * Chummer5a-JSON-Export lesen und in eine normalisierte, flache Struktur
 * überführen. Bewusst ohne Foundry-Abhängigkeiten gehalten, damit die
 * Parselogik per Node gegen echte Exportdateien testbar ist
 * (tools/test-import.mjs).
 *
 * Eigenheiten des Exports:
 * - UTF-8-BOM am Dateianfang.
 * - XML-Konvertierung: einzelne Kindknoten sind Objekte, mehrere ein Array.
 * - Deutsch lokalisierte Werte ("450.000", "0,30", "9K"); wo vorhanden werden
 *   die *_english-/raw-Felder bzw. Zahlen im deutschen Format geparst.
 */

/** BOM entfernen und JSON parsen. Liefert immer ein Array von Charakteren. */
export function parseChummerFile(text) {
    const clean = text.replace(/^\uFEFF/, '');
    const doc = JSON.parse(clean);
    const chars = doc?.characters?.character;
    return asList(chars).map(normalizeCharacter);
}

/** XML-Konvertierungs-Knoten: null → [], Objekt → [Objekt], Array → Array. */
export function asList(node) {
    if (node === null || node === undefined) return [];
    return Array.isArray(node) ? node : [node];
}

/** Zahl im deutschen Exportformat ("24.000", "0,30", "-2") → Number. */
export function num(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    const s = String(value).trim().replace(/\./g, '').replace(',', '.');
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : 0;
}

/** Ganzzahl (Ratings, Stufen). */
export function int(value) {
    return Math.round(num(value));
}

/** Chummer-Bool ("True"/"False", auch echte Booleans). */
export function bool(value) {
    return value === true || value === 'True' || value === 'true';
}

const ATTR_MAP = {
    BOD: 'body', AGI: 'agility', REA: 'reaction', STR: 'strength',
    CHA: 'charisma', INT: 'intuition', LOG: 'logic', WIL: 'willpower',
    EDG: 'edge', MAG: 'magic', RES: 'resonance', DEP: 'depth',
};

const METATYPE_MAP = {
    human: 'human', mensch: 'human',
    elf: 'elf',
    dwarf: 'dwarf', zwerg: 'dwarf',
    ork: 'ork', orc: 'ork',
    troll: 'troll',
};

const KNOWLEDGE_TYPE_MAP = {
    academic: 'academic',
    interests: 'interests', interest: 'interests',
    professional: 'professional',
    street: 'street',
    language: 'language',
};

const GRADE_MAP = {
    standard: 'standard', alpha: 'alpha', alphaware: 'alpha',
    beta: 'beta', betaware: 'beta', delta: 'delta', deltaware: 'delta',
    gamma: 'gamma', grey: 'grey', used: 'used', gebraucht: 'used',
};

/** Gemeinsame Felder aller Export-Items. */
function baseItem(node) {
    return {
        sourceId: (node.sourceid ?? '').toLowerCase() || null,
        guid: (node.guid ?? '').toLowerCase() || null,
        name: node.name ?? '',
        nameEn: node.name_english ?? node.name ?? '',
        fullName: node.fullname ?? node.name ?? '',
        category: node.category_english ?? node.category ?? '',
        rating: int(node.rating),
        source: node.source ?? '',
        page: node.page ?? '',
        extra: node.extra ?? null,
        equipped: bool(node.equipped ?? 'True'),
    };
}

/** Gear-Knoten rekursiv einsammeln (children werden flachgezogen). */
function collectGear(node, out, depth = 0) {
    for (const g of asList(node)) {
        out.push({
            ...baseItem(g),
            qty: Math.max(1, int(g.qty ?? 1)),
            isAmmo: bool(g.isammo),
            isSin: bool(g.issin),
            isCommlink: bool(g.iscommlink),
            isProgram: bool(g.isprogram),
            depth,
        });
        if (g.children?.gear && depth < 6) collectGear(g.children.gear, out, depth + 1);
    }
}

/** Waffe normalisieren (inkl. Zubehör-/Unterlauf-Namen für die Beschreibung). */
function normalizeWeapon(w) {
    const accessories = asList(w.accessories?.accessory).map(a => a.name ?? '');
    const under = asList(w.underbarrel?.weapon).map(normalizeWeapon);
    return {
        ...baseItem(w),
        type: w.type ?? '',                       // Ranged | Melee
        skillEn: w.skill ?? '',
        damage: w.rawdamage ?? w.damage_english ?? '',
        ap: w.rawap ?? w.ap_english ?? '',
        mode: w.mode_english ?? '',
        rc: int(w.rawrc ?? w.rc_english),
        accuracy: w.rawaccuracy ?? w.accuracy_english ?? '',
        reach: int(w.rawreach ?? w.reach),
        ammo: w.maxammo ?? w.ammo_english ?? '',
        conceal: int(w.rawconceal ?? w.conceal),
        accessories,
        underbarrel: under,
    };
}

/** Fahrzeug normalisieren: Statistiken, Ausrüstung, Mods, montierte Waffen. */
function normalizeVehicle(v) {
    const gears = [];
    collectGear(v.gears?.gear, gears);
    const mods = [];
    const weapons = asList(v.weapons?.weapon).map(normalizeWeapon);
    for (const m of asList(v.mods?.mod)) {
        mods.push({
            ...baseItem(m),
            slots: int(m.slots),
        });
        for (const w of asList(m.weapons?.weapon)) weapons.push(normalizeWeapon(w));
    }
    return {
        ...baseItem(v),
        isDrone: bool(v.isdrone),
        handling: v.handling ?? '0',
        speed: v.speed ?? '0',
        accel: v.accel ?? '0',
        pilot: int(v.pilot),
        body: int(v.body),
        armor: int(v.armor),
        sensor: int(v.sensor),
        seats: int(v.seats),
        cost: num(v.owncost ?? v.cost),
        avail: v.avail_english ?? v.avail ?? '',
        gears, mods, weapons,
    };
}

/** Einen Chummer-Charakterknoten in die normalisierte Form überführen. */
export function normalizeCharacter(c) {
    // ------------------------------------------------------------ Attribute
    // Der attributes-Knoten ist ein Array aus Zählstring + Kategorie-Objekten.
    const attributes = {};
    for (const part of asList(c.attributes)) {
        if (typeof part !== 'object' || part === null) continue;
        for (const a of asList(part.attribute)) {
            const key = ATTR_MAP[(a.name_english ?? a.name ?? '').toUpperCase()];
            if (key && !(key in attributes)) attributes[key] = int(a.base);
        }
    }

    // ------------------------------------------------------- Fertigkeiten
    const skills = [];
    const knowledgeSkills = [];
    for (const s of asList(c.skills?.skill)) {
        const specs = asList(s.skillspecializations?.skillspecialization)
            .map(x => x.name ?? '').filter(Boolean);
        if (s.spec && !specs.includes(s.spec)) specs.push(s.spec);
        const rating = int(s.rating);
        if (bool(s.knowledge)) {
            if (rating <= 0 && !bool(s.isnativelanguage)) continue;
            knowledgeSkills.push({
                name: s.name ?? '',
                nameEn: s.name_english ?? s.name ?? '',
                rating,
                specs,
                attribute: ATTR_MAP[(s.attribute ?? '').toUpperCase()] ?? 'logic',
                knowledgeType: KNOWLEDGE_TYPE_MAP[(s.skillcategory_english ?? '').toLowerCase()] ?? 'professional',
                isLanguage: bool(s.islanguage),
                isNative: bool(s.isnativelanguage),
            });
        } else {
            if (rating <= 0) continue;
            skills.push({
                sourceId: (s.suid ?? '').toLowerCase() || null,
                name: s.name ?? '',
                nameEn: s.name_english ?? s.name ?? '',
                rating,
                specs,
            });
        }
    }

    // ----------------------------------------------------- Item-Sektionen
    const qualities = asList(c.qualities?.quality).map(q => ({
        ...baseItem(q),
        karma: int(q.bp),
        positive: (q.qualitytype_english ?? q.qualitytype) === 'Positive'
            || q.qualitytype === 'Vorteile',
        fromMetatype: (q.qualitysource ?? '') !== 'Selected',
    }));

    const spells = asList(c.spells?.spell).map(s => ({
        ...baseItem(s),
        alchemical: bool(s.alchemy),
    }));

    const powers = asList(c.powers?.power).map(p => ({
        ...baseItem(p),
        rating: int(p.rating ?? p.extra),
        points: num(p.totalpoints ?? p.points),
    }));

    const complexforms = asList(c.complexforms?.complexform).map(baseItem);
    const metamagics = asList(c.metamagics?.metamagic).map(baseItem);
    const critterpowers = asList(c.critterpowers?.critterpower).map(baseItem);

    const contacts = asList(c.contacts?.contact).map(ct => ({
        name: ct.name || ct.role || 'Kontakt',
        role: ct.role ?? '',
        location: ct.location ?? '',
        connection: int(ct.connection),
        loyalty: int(ct.loyalty),
        family: bool(ct.family),
        blackmail: bool(ct.blackmail),
        group: (ct.type ?? '') === 'Group',
        metatype: ct.metatype ?? '',
    }));

    const weapons = asList(c.weapons?.weapon)
        .map(normalizeWeapon)
        .filter(w => w.nameEn !== 'Unarmed Attack');

    const armors = asList(c.armors?.armor).map(a => ({
        ...baseItem(a),
        armor: int(a.armor),
        mods: asList(a.armormods?.armormod).map(m => ({ ...baseItem(m) })),
    }));

    const gears = [];
    collectGear(c.gears?.gear, gears);

    const ware = asList(c.cyberwares?.cyberware).map(w => ({
        ...baseItem(w),
        kind: (w.improvementsource ?? '') === 'Bioware' ? 'bioware' : 'cyberware',
        grade: GRADE_MAP[(w.grade ?? '').toLowerCase()] ?? 'standard',
        essence: num(w.ess),
    }));

    const lifestyles = asList(c.lifestyles?.lifestyle).map(l => ({
        ...baseItem(l),
        baseEn: l.baselifestyle_english ?? l.baselifestyle ?? '',
        months: int(l.months),
        cost: num(l.totalmonthlycost ?? l.cost),
    }));

    const vehicles = asList(c.vehicles?.vehicle).map(normalizeVehicle);

    // -------------------------------------------------- Magie / Resonanz
    const traditionNode = c.tradition && typeof c.tradition === 'object' ? c.tradition : null;
    const drainAttrs = traditionNode?.drainattributes_english ?? traditionNode?.drainattributes ?? '';
    const drainMatch = drainAttrs.split('+').map(x => x.trim().toUpperCase());
    const tradition = traditionNode?.name ? {
        name: traditionNode.name,
        nameEn: traditionNode.name_english ?? traditionNode.name,
        drainAttribute: ATTR_MAP[drainMatch[1] ?? ''] ?? null,
    } : null;

    // ------------------------------------------------------------ Bilder
    const mugshots = {
        main: (c.mainmugshotbase64 ?? '').trim() || null,
        extra: asList(c.othermugshots?.mugshot)
            .map(m => (m?.stringbase64 ?? '').trim()).filter(Boolean),
    };

    return {
        name: c.alias || c.name || 'Chummer-Import',
        realName: c.name ?? '',
        metatype: METATYPE_MAP[(c.metatype_english ?? c.metatype ?? '').toLowerCase()] ?? 'human',
        metatypeName: c.metatype ?? '',
        metavariant: c.metavariant ?? '',
        magEnabled: bool(c.magenabled),
        resEnabled: bool(c.resenabled),
        isAdept: bool(c.adept),
        isMagician: bool(c.magician),
        isTechnomancer: bool(c.technomancer),
        attributes,
        karma: int(c.karma),
        totalKarma: int(c.totalkarma),
        nuyen: num(c.nuyen),
        streetCred: int(c.calculatedstreetcred ?? c.streetcred),
        notoriety: int(c.calculatednotoriety ?? c.notoriety),
        publicAwareness: int(c.calculatedpublicawareness ?? c.publicawareness),
        initiationGrade: int(c.initiategrade),
        submersionGrade: int(c.submersiongrade),
        tradition,
        description: c.description ?? '',
        background: c.background ?? '',
        concept: c.concept ?? '',
        notes: c.gamenotes ?? '',
        skills, knowledgeSkills, qualities, spells, powers, complexforms,
        metamagics, critterpowers, contacts, weapons, armors, gears, ware,
        lifestyles, vehicles, mugshots,
    };
}
