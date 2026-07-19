/**
 * Eigener Chummer-Charakterimport (Ersatz für den System-Import):
 * JSON-Export der Chummer5a-Desktop-App laden, Vorschau prüfen und als
 * neuen Charakter anlegen oder per Re-Sync in einen bestehenden Actor
 * übernehmen. Fahrzeuge werden als eigene vehicle-Actors mit
 * system.driver-Verknüpfung erzeugt, Portraits (Mugshots) hochgeladen.
 *
 * Re-Sync: Items werden über flags.sr5-chummer.sourceId abgeglichen —
 * vorhandene bleiben erhalten (Ratings/Mengen werden aktualisiert),
 * neue kommen hinzu, verwaiste können optional entfernt werden.
 * Zustandsdaten (Schaden, Edge-Verbrauch, Munition) werden nie angefasst.
 */
import { MODULE_ID } from './data.mjs';
import { parseChummerFile } from './chummer-parse.mjs';
import { buildImport } from './import-map.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const TAG = `${MODULE_ID} | Import`;
const log = (...args) => console.info(`${TAG} |`, ...args);

export class ChummerImportApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-importer',
        tag: 'form',
        position: { width: 640, height: 'auto' },
        window: { title: 'CHUMMER.Import.Title', icon: 'fas fa-file-import', resizable: true },
        actions: {
            import: ChummerImportApp.#onImport,
            reset: ChummerImportApp.#onReset,
        },
    };

    static PARTS = {
        content: {
            template: `modules/${MODULE_ID}/templates/importer.hbs`,
            scrollable: ['.cvtt-import-body'],
        },
    };

    /** Optional mit { actor } öffnen → Re-Sync auf diesen Actor vorbelegt. */
    constructor(options = {}) {
        super(options);
        if (options.actor) this.state.target = options.actor.id;
    }

    state = {
        fileName: '',
        selected: 0,            // Index bei Mehrcharakter-Dateien
        target: 'new',          // 'new' | Actor-ID
        options: {
            vehicles: true,     // Fahrzeuge als eigene Actors
            mugshot: true,      // Portrait übernehmen
            updateValues: true, // Attribute/Karma/Nuyen beim Sync aktualisieren
            deleteOrphans: false, // verwaiste Items beim Sync entfernen
        },
        busy: false,
    };
    #characters = [];           // normalisierte Charaktere aus der Datei
    #result = null;             // Import-Zusammenfassung fürs Template

    // -------------------------------------------------------------- Kontext

    async _prepareContext() {
        const s = this.state;
        const chars = this.#characters;
        const current = chars[s.selected] ?? null;

        const targets = game.actors
            .filter(a => a.type === 'character' && a.isOwner)
            .map(a => ({
                id: a.id, name: a.name,
                selected: s.target === a.id,
                imported: !!a.getFlag(MODULE_ID, 'chummerImport'),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang));

        return {
            state: s,
            hasFile: chars.length > 0,
            multi: chars.length > 1,
            characters: chars.map((c, index) => ({
                index,
                name: c.name,
                selected: index === s.selected,
            })),
            preview: current && {
                name: current.name,
                metatype: current.metatypeName + (current.metavariant && current.metavariant !== current.metatypeName ? ` (${current.metavariant})` : ''),
                special: current.magEnabled
                    ? game.i18n.localize('CHUMMER.Import.Awakened')
                    : (current.resEnabled ? game.i18n.localize('CHUMMER.Import.Emerged') : '—'),
                karma: current.karma,
                nuyen: current.nuyen.toLocaleString(game.i18n.lang),
                counts: [
                    { label: 'CHUMMER.Import.Skills', value: current.skills.length + current.knowledgeSkills.length },
                    { label: 'CHUMMER.Import.Qualities', value: current.qualities.length },
                    { label: 'CHUMMER.Import.Gear', value: current.weapons.length + current.armors.length + current.gears.length + current.ware.length },
                    { label: 'CHUMMER.Import.Magic', value: current.spells.length + current.powers.length + current.complexforms.length },
                    { label: 'CHUMMER.Import.Contacts', value: current.contacts.length },
                    { label: 'CHUMMER.Import.Vehicles', value: current.vehicles.length },
                ].map(x => ({ ...x, label: game.i18n.localize(x.label) })),
            },
            targets,
            targetNew: s.target === 'new',
            result: this.#result,
        };
    }

    // ---------------------------------------------------------- Interaktion

    async _onRender(context, options) {
        await super._onRender?.(context, options);
        const el = this.element;
        el.querySelector('input[type="file"]')?.addEventListener('change', ev => this.#onFile(ev));
        el.addEventListener('change', ev => this.#applyField(ev.target));
    }

    async #onFile(ev) {
        const file = ev.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            this.#characters = parseChummerFile(text);
            if (!this.#characters.length) throw new Error('keine Charaktere in der Datei');
            this.state.fileName = file.name;
            this.state.selected = 0;
            this.#result = null;
            // Ziel vorschlagen: bestehender Actor mit gleichem Namen.
            if (this.state.target === 'new') {
                const match = game.actors.find(a => a.type === 'character' && a.isOwner
                    && a.name === this.#characters[0].name);
                if (match) this.state.target = match.id;
            }
            log(`Datei "${file.name}" geladen: ${this.#characters.map(c => c.name).join(', ')}`);
        } catch (error) {
            console.error(`${TAG} | Datei konnte nicht gelesen werden:`, error);
            ui.notifications.error(game.i18n.format('CHUMMER.Import.ParseError', { error: error.message }));
            this.#characters = [];
            this.state.fileName = '';
        }
        this.render();
    }

    #applyField(t) {
        const s = this.state;
        switch (t.dataset.field) {
            case 'character': s.selected = parseInt(t.value) || 0; break;
            case 'target': s.target = t.value; break;
            case 'option': s.options[t.dataset.option] = t.checked; break;
            default: return;
        }
        this.render();
    }

    static #onReset() {
        this.#characters = [];
        this.#result = null;
        this.state.fileName = '';
        this.state.target = 'new';
        this.render();
    }

    // -------------------------------------------------------------- Import

    static async #onImport() {
        const s = this.state;
        const norm = this.#characters[s.selected];
        if (!norm || s.busy) return;
        s.busy = true;
        this.render();
        try {
            const existing = s.target !== 'new' ? game.actors.get(s.target) : null;
            const { actorData, vehicles, report } = await buildImport(norm, { vehicles: s.options.vehicles });

            let actor;
            let mode;
            if (existing) {
                actor = existing;
                mode = 'sync';
                await this.#syncActor(existing, actorData, report);
            } else {
                mode = 'create';
                actor = await Actor.create(actorData);
            }

            // Portrait aus dem Export übernehmen.
            if (s.options.mugshot && norm.mugshots.main) {
                const img = await uploadMugshot(norm.mugshots.main, actor.name);
                if (img) await actor.update({ img, 'prototypeToken.texture.src': img });
            }

            // Fahrzeuge als eigene Actors, mit dem Charakter als Fahrer.
            let createdVehicles = 0;
            for (const v of vehicles) {
                if (this.#vehicleExists(actor, v)) continue;
                v.system.driver = actor.id;
                v.folder = actor.folder?.id ?? null;
                await Actor.create(v);
                createdVehicles++;
            }

            this.#result = {
                mode,
                actorName: actor.name,
                items: report.items.length,
                catalog: report.items.filter(x => x.via === 'katalog').length,
                fallback: report.items.filter(x => x.via === 'fallback').length,
                vehicles: createdVehicles,
                skipped: report.skipped,
                synced: report.synced ?? null,
            };
            log('Import abgeschlossen:', this.#result);
            ui.notifications.info(game.i18n.format(
                mode === 'sync' ? 'CHUMMER.Import.DoneSync' : 'CHUMMER.Import.DoneCreate',
                { name: actor.name }));
            actor.sheet?.render(true);
        } catch (error) {
            console.error(`${TAG} | Import fehlgeschlagen:`, error);
            ui.notifications.error(game.i18n.format('CHUMMER.Import.Error', { error: error.message }));
        } finally {
            s.busy = false;
            this.render();
        }
    }

    /** Gibt es bereits ein Fahrzeug dieses Fahrers mit derselben sourceId? */
    #vehicleExists(actor, vehicleData) {
        const sourceId = vehicleData.flags?.[MODULE_ID]?.sourceId;
        return game.actors.some(a => a.type === 'vehicle'
            && a.system?.driver === actor.id
            && (sourceId
                ? a.getFlag(MODULE_ID, 'sourceId') === sourceId
                : a.name === vehicleData.name));
    }

    /**
     * Re-Sync: neue Item-Daten gegen die vorhandenen Actor-Items abgleichen.
     * Match-Schlüssel: Typ + sourceId-Flag, sonst Typ + Name. Mehrfach-Items
     * werden der Reihe nach konsumiert.
     */
    async #syncActor(actor, actorData, report) {
        const s = this.state;
        const pool = new Map();     // key → [Item, …] noch nicht konsumiert
        const keyOf = (type, sourceId, name) => sourceId ? `${type}::${sourceId}` : `${type}::name::${name}`;
        for (const item of actor.items) {
            const key = keyOf(item.type, item.getFlag(MODULE_ID, 'sourceId'), item.name);
            if (!pool.has(key)) pool.set(key, []);
            pool.get(key).push(item);
        }

        const toCreate = [];
        const updates = [];
        for (const data of actorData.items) {
            const key = keyOf(data.type, data.flags?.[MODULE_ID]?.sourceId, data.name);
            const match = pool.get(key)?.shift();
            if (!match) {
                toCreate.push(data);
                continue;
            }
            const patch = this.#syncPatch(match, data);
            if (patch) updates.push({ _id: match.id, ...patch });
        }

        // Verwaiste, einst importierte Items (nur mit unserem Flag) entfernen.
        let deleted = 0;
        if (s.options.deleteOrphans) {
            const orphanIds = [...pool.values()].flat()
                .filter(item => item.getFlag(MODULE_ID, 'sourceId') || item.getFlag(MODULE_ID, 'importGuid'))
                .map(item => item.id);
            if (orphanIds.length) {
                await actor.deleteEmbeddedDocuments('Item', orphanIds);
                deleted = orphanIds.length;
            }
        }

        if (updates.length) await actor.updateEmbeddedDocuments('Item', updates);
        if (toCreate.length) await actor.createEmbeddedDocuments('Item', toCreate);

        if (s.options.updateValues) {
            const sys = actorData.system;
            await actor.update({
                system: {
                    attributes: sys.attributes,
                    karma: { value: sys.karma.value },
                    nuyen: sys.nuyen,
                    street_cred: sys.street_cred,
                    notoriety: sys.notoriety,
                    public_awareness: sys.public_awareness,
                    ...(sys.magic ? { magic: sys.magic } : {}),
                    ...(sys.technomancer ? { technomancer: sys.technomancer } : {}),
                },
            });
        }

        report.synced = { created: toCreate.length, updated: updates.length, deleted };
        log(`Sync "${actor.name}": ${toCreate.length} neu, ${updates.length} aktualisiert, ${deleted} entfernt.`);
    }

    /** Update-Patch für ein gematchtes Item — nur unkritische Wertefelder. */
    #syncPatch(item, data) {
        const patch = {};
        if (item.type === 'skill') {
            const target = data.system?.skill ?? {};
            if (item.system?.skill?.rating !== target.rating) patch['system.skill.rating'] = target.rating;
            const specs = target.specializations ?? [];
            if (specs.length && (item.system?.skill?.specializations?.length ?? 0) !== specs.length) {
                patch['system.skill.specializations'] = specs;
            }
        } else if (item.type === 'contact') {
            const sys = data.system ?? {};
            if (item.system?.connection !== sys.connection) patch['system.connection'] = sys.connection;
            if (item.system?.loyalty !== sys.loyalty) patch['system.loyalty'] = sys.loyalty;
        } else {
            const tech = data.system?.technology;
            if (tech?.rating !== undefined && item.system?.technology?.rating !== tech.rating) {
                patch['system.technology.rating'] = tech.rating;
            }
            if (tech?.quantity !== undefined && item.system?.technology?.quantity !== tech.quantity) {
                patch['system.technology.quantity'] = tech.quantity;
            }
        }
        return Object.keys(patch).length ? patch : null;
    }
}

/** Base64-Mugshot in den Welt-Ordner hochladen; liefert den Bildpfad oder null. */
async function uploadMugshot(base64, actorName) {
    try {
        if (!game.user.can('FILES_UPLOAD')) return null;
        const FilePicker = foundry.applications.apps.FilePicker.implementation;
        const folder = `worlds/${game.world.id}/sr5-chummer-mugshots`;
        try {
            await FilePicker.createDirectory('data', folder);
        } catch (error) {
            if (!String(error).includes('EEXIST')) throw error;
        }
        const bytes = Uint8Array.from(atob(base64.replace(/\s/g, '')), ch => ch.charCodeAt(0));
        const slug = actorName.slugify?.() ?? actorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const file = new File([bytes], `${slug}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const response = await FilePicker.upload('data', folder, file, {}, { notify: false });
        return response?.path ?? null;
    } catch (error) {
        console.warn(`${TAG} | Mugshot konnte nicht hochgeladen werden:`, error);
        return null;
    }
}
