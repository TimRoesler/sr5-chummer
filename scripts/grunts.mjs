/**
 * Schergen-Import: Erzeugt ein Welt-Kompendium mit den Beispiel-Schergen
 * des Grundregelwerks (PS 0–6, jeweils Scherge und Anführer) als
 * vollwertige shadowrun5e-Actors inklusive Fertigkeiten, Waffen,
 * Panzerung, Bodytech, Zaubern, Komplexen Formen und Adeptenkräften.
 */
import { MODULE_ID, ChummerData } from './data.mjs';
import {
    purchasedItemData, qualityItemData, spellItemData,
    complexFormItemData, adeptPowerItemData, skillItemData,
} from './items.mjs';

const PACK_NAME = 'sr5-schergen';

export class GruntImporter {
    static get pack() {
        return game.packs.get(`world.${PACK_NAME}`);
    }

    /**
     * Erzeugt (oder ersetzt nach Rückfrage) das Schergen-Kompendium.
     */
    static async import({ notify = true } = {}) {
        if (!game.user.isGM) return null;

        let pack = this.pack;
        if (pack) {
            const ok = await foundry.applications.api.DialogV2.confirm({
                window: { title: game.i18n.localize('CHUMMER.Grunts.Title') },
                content: `<p>${game.i18n.localize('CHUMMER.Grunts.ReplaceHint')}</p>`,
            });
            if (!ok) return null;
            await pack.configure({ locked: false });
            await pack.deleteCompendium();
        }

        pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
            name: PACK_NAME,
            label: game.i18n.localize('CHUMMER.Grunts.PackLabel'),
            type: 'Actor',
        });

        const [defs, skillData] = await Promise.all([
            ChummerData.load('grunts'),
            ChummerData.skills(),
        ]);

        // Ordner je Professionalitätsstufe.
        const folderIds = {};
        for (const f of defs.folders) {
            const folder = await Folder.create({ name: f.name, type: 'Actor' }, { pack: pack.collection });
            folderIds[f.id] = folder.id;
        }

        const actors = [];
        for (const g of defs.grunts) {
            actors.push(await this.actorData(g, skillData, folderIds));
        }
        await Actor.createDocuments(actors, { pack: pack.collection });

        if (notify) {
            ui.notifications.info(game.i18n.format('CHUMMER.Grunts.Done', { count: actors.length }));
        }
        pack.render(true);
        return pack;
    }

    // ------------------------------------------------------------ Actor-Daten

    /**
     * Vollständige Actor-Daten für eine Schergen-Vorlage aus grunts.json.
     * Wird vom Kompendium-Import und vom Schnell-NSC-Dialog genutzt.
     */
    static async actorData(g, skillData, folderIds = {}) {
        // ---------------------------------------------------------- Attribute
        const attributes = {};
        for (const [key, value] of Object.entries(g.attributes)) {
            attributes[key] = { base: value };
        }
        attributes.edge = { base: g.edge ?? g.pr ?? 0 };
        if (g.magic) attributes.magic = { base: g.magic };
        if (g.resonance) attributes.resonance = { base: g.resonance };

        const system = {
            metatype: 'human',
            is_npc: true,
            npc: { is_grunt: true },
            attributes,
            description: {
                value: `<p>${g.description ?? ''}</p><p><em>${game.i18n.format('CHUMMER.Grunts.ProfRating', { pr: g.pr })}</em></p>`,
                source: `SR5 ${g.page}`,
            },
        };
        if (g.special) system.special = g.special;
        if (g.initiateGrade) system.magic = { initiation: g.initiateGrade };
        if ((g.initiativeDice ?? 1) > 1) {
            system.initiative = { meatspace: { dice: { base: g.initiativeDice, text: `${g.initiativeDice}d6` } } };
        }

        // -------------------------------------------------------------- Items
        const items = [];

        // Fertigkeiten: Gruppen zuerst, Einzelwerte überschreiben, wenn höher.
        const ratings = {};
        const specs = {};
        const keyOf = def => def.en ?? def.name;
        for (const grp of g.skillGroups ?? []) {
            // Fliegen ist eine reine Critter-Fertigkeit und gehört bei
            // Metamenschen nicht zur Athletik-Gruppe.
            for (const def of skillData.skills.filter(x => x.groupEn === grp.en && x.en !== 'Flight')) {
                ratings[keyOf(def)] = Math.max(ratings[keyOf(def)] ?? 0, grp.rating);
            }
        }
        for (const sk of g.skills ?? []) {
            ratings[sk.en] = Math.max(ratings[sk.en] ?? 0, sk.rating);
            if (sk.specs?.length) specs[sk.en] = sk.specs;
        }
        for (const [en, rating] of Object.entries(ratings)) {
            const def = skillData.skills.find(x => keyOf(x) === en);
            if (!def) {
                console.warn(`${MODULE_ID} | Schergen-Import: unbekannte Fertigkeit "${en}" (${g.name})`);
                continue;
            }
            items.push(await skillItemData(def, rating, specs[en] ?? []));
        }

        // Wissensfertigkeiten.
        for (const k of g.knowledge ?? []) {
            items.push({
                name: k.name,
                type: 'skill',
                system: {
                    skill: {
                        category: 'knowledge',
                        knowledgeType: k.type ?? 'street',
                        attribute: k.attribute ?? 'intuition',
                        rating: k.rating,
                    },
                },
            });
        }

        // Gaben.
        for (const name of g.qualities ?? []) {
            const q = (await ChummerData.qualities()).find(x => x.name === name);
            if (q) items.push(await qualityItemData(q));
        }

        // Magie & Resonanz.
        for (const name of g.spells ?? []) {
            const sp = (await ChummerData.spells()).find(x => x.name === name);
            if (sp) items.push(await spellItemData(sp));
        }
        for (const cf of g.complexforms ?? []) {
            const def = (await ChummerData.complexforms()).find(x => x.name === (cf.base ?? cf.name));
            if (!def) continue;
            const data = await complexFormItemData({ ...def, name: cf.name, en: undefined });
            data.name = cf.name;
            items.push(data);
        }
        for (const pw of g.powers ?? []) {
            const def = (await ChummerData.powers()).find(x => x.name === (pw.base ?? pw.name));
            if (!def) continue;
            const data = await adeptPowerItemData({ ...def, name: pw.name, en: undefined }, pw.level ?? 0);
            data.name = pw.name;
            items.push(data);
        }

        // Ausrüstung: Bodytech, Panzerung, Waffen, Gegenstände.
        for (const w of g.ware ?? []) {
            items.push(await this.#gearItem(w.kind, w.name, { rating: w.rating, equipped: true, actor: g.name }));
        }
        for (const name of g.armor ?? []) {
            items.push(await this.#gearItem('armor', name, { equipped: true, actor: g.name }));
        }
        for (const w of g.weapons ?? []) {
            const { name, qty } = typeof w === 'string' ? { name: w, qty: 1 } : { qty: 1, ...w };
            items.push(await this.#gearItem('weapon', name, { qty, equipped: true, actor: g.name }));
        }
        for (const e of g.gear ?? []) {
            items.push(await this.#gearItem('gear', e.name, { rating: e.rating, qty: e.qty, actor: g.name }));
        }

        return {
            name: g.name,
            type: 'character',
            folder: folderIds[g.folder] ?? null,
            system,
            items: items.filter(Boolean),
            prototypeToken: {
                actorLink: false,
                disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            },
            flags: {
                [MODULE_ID]: { grunt: { pr: g.pr, leader: !!g.leader } },
            },
        };
    }

    /**
     * Katalogeintrag nachschlagen und Item-Daten erzeugen.
     * Bei mehrdeutigen Namen (2050er-Varianten) wird der SR5-Eintrag bevorzugt.
     */
    static async #gearItem(kind, name, { rating = 0, qty = 1, equipped = false, actor = '' } = {}) {
        const catalogName = { weapon: 'weapons', armor: 'armor', gear: 'gear', cyberware: 'cyberware', bioware: 'bioware' }[kind];
        const catalog = await ChummerData.catalog(catalogName);
        const candidates = catalog.filter(e => e.name === name);
        const entry = candidates.find(e => e.source === 'SR5') ?? candidates[0];
        if (!entry) {
            console.warn(`${MODULE_ID} | Schergen-Import: unbekannter Katalogeintrag "${name}" (${actor})`);
            return null;
        }
        const data = await purchasedItemData(kind, entry, rating);
        // Attribute sind in grunts.json bereits als Effektivwerte hinterlegt –
        // vom Kompendium mitkopierte Effekte würden Boni doppelt anrechnen.
        delete data.effects;
        data.system ??= {};
        data.system.technology = foundry.utils.mergeObject(data.system.technology ?? {}, {
            equipped,
            ...(qty > 1 ? { quantity: qty } : {}),
        }, { inplace: false });
        return data;
    }
}
