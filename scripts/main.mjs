/**
 * Chummer für Shadowrun 5e – Modul-Einstiegspunkt.
 */
import { MODULE_ID, ChummerData, SETTING_DISABLED_BOOKS } from './data.mjs';
import { SourceLinks, PdfSourcesConfig, SETTING_PDF_SOURCES } from './sources.mjs';
import { BooksConfig } from './books.mjs';
import { ChargenApp } from './chargen.mjs';
import { ShopApp } from './shop.mjs';
import { AdvancementApp } from './advancement.mjs';
import { PackTranslator } from './packs.mjs';
import { GruntImporter } from './grunts.mjs';
import { QuickNpcApp } from './quicknpc.mjs';
import { retrofitWorldItems, registerAutoEnrichment, EnrichMenu } from './enrich.mjs';

Hooks.once('init', () => {
    // Sicherheitsnetz: Modul nur im shadowrun5e-System initialisieren
    // (module.json beschränkt die Anzeige bereits über relationships.systems).
    if (game.system.id !== 'shadowrun5e') {
        console.warn(`${MODULE_ID} | Deaktiviert – benötigt das System shadowrun5e (aktiv: ${game.system.id}).`);
        return;
    }

    // Benanntes Partial für sortierbare Spaltenköpfe ({{> cvtt-listhead}}).
    foundry.applications.handlebars.loadTemplates({
        'cvtt-listhead': `modules/${MODULE_ID}/templates/listhead.hbs`,
    });

    // --------------------------------------------------------- Einstellungen
    game.settings.register(MODULE_ID, SETTING_PDF_SOURCES, {
        scope: 'world',
        config: false,
        type: Object,
        default: {},
    });

    game.settings.registerMenu(MODULE_ID, 'pdfConfigMenu', {
        name: 'CHUMMER.PdfConfig',
        label: 'CHUMMER.PdfConfig',
        hint: 'CHUMMER.PdfConfigHint',
        icon: 'fas fa-file-pdf',
        type: PdfSourcesConfig,
        restricted: true,
    });

    game.settings.register(MODULE_ID, SETTING_DISABLED_BOOKS, {
        scope: 'world',
        config: false,
        type: Array,
        default: [],
    });

    game.settings.registerMenu(MODULE_ID, 'enrichMenu', {
        name: 'CHUMMER.Enrich.Menu',
        label: 'CHUMMER.Enrich.MenuLabel',
        hint: 'CHUMMER.Enrich.MenuHint',
        icon: 'fas fa-wand-magic-sparkles',
        type: EnrichMenu,
        restricted: true,
    });

    game.settings.registerMenu(MODULE_ID, 'bookConfigMenu', {
        name: 'CHUMMER.BookConfig',
        label: 'CHUMMER.BookConfigLabel',
        hint: 'CHUMMER.BookConfigHint',
        icon: 'fas fa-book',
        type: BooksConfig,
        restricted: true,
    });

    game.settings.register(MODULE_ID, 'chargenKarma', {
        name: 'CHUMMER.Settings.ChargenKarma',
        hint: 'CHUMMER.Settings.ChargenKarmaHint',
        scope: 'world',
        config: true,
        type: Number,
        default: 25,
    });

    game.settings.register(MODULE_ID, 'availLimit', {
        name: 'CHUMMER.Settings.AvailLimit',
        hint: 'CHUMMER.Settings.AvailLimitHint',
        scope: 'world',
        config: true,
        type: Number,
        default: 12,
    });

    game.settings.register(MODULE_ID, 'useCompendium', {
        name: 'CHUMMER.Settings.UseCompendium',
        hint: 'CHUMMER.Settings.UseCompendiumHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    // ------------------------------------------------------------------ API
    const module = game.modules.get(MODULE_ID);
    module.api = {
        ChummerData,
        SourceLinks,
        PackTranslator,
        openChargen: () => new ChargenApp().render(true),
        openQuickNpc: () => new QuickNpcApp().render(true),
        openShop: actor => new ShopApp({ actor }).render(true),
        openAdvancement: actor => new AdvancementApp({ actor }).render(true),
        openPdfConfig: () => new PdfSourcesConfig().render(true),
        openBookConfig: () => new BooksConfig().render(true),
        translatePacks: () => PackTranslator.translateAll(),
        importGrunts: () => GruntImporter.import(),
        enrichItems: options => retrofitWorldItems(options),
    };

    registerHooks();
});

function registerHooks() {

Hooks.once('ready', async () => {
    // Klick-Delegation für Quellenverweise (funktioniert in allen Fenstern).
    document.body.addEventListener('click', SourceLinks.onClick);

    // Kategorie-Übersetzungen vorladen (synchroner Zugriff via ChummerData.catDe).
    await ChummerData.preloadTranslations();

    // GRW-Anreicherung: automatisch bei Item-/Charakterimporten.
    registerAutoEnrichment();

    if (game.user.isGM) {
        // PDF-Quellen beim ersten Start automatisch vorbelegen.
        await SourceLinks.applyDefaults();

        const hasPacks = game.packs.some(p => p.metadata.name === 'sr5gear');
        if (!hasPacks && game.settings.get(MODULE_ID, 'useCompendium')) {
            // Hinweis, falls die Bulkimporter-Kompendien noch fehlen.
            console.info(`${MODULE_ID} | ${game.i18n.localize('CHUMMER.MissingCompendiumHint')}`);
            ui.notifications.info(game.i18n.localize('CHUMMER.MissingCompendiumHint'), { permanent: false });
        } else if (hasPacks && ChummerData.isGerman && await PackTranslator.needsTranslation()) {
            // Kompendien automatisch eindeutschen (auch nach erneutem Bulkimport).
            // Läuft nur bei deutscher Foundry-Sprache – englische Welten behalten die Originalnamen.
            ui.notifications.info(game.i18n.localize('CHUMMER.PacksTranslating'), { permanent: false });
            await PackTranslator.translateAll();
        }
    }
});

// Buttons „Charakter erstellen (Chummer)“ und „Schnell-NSC“ in der Akteurs-Seitenleiste.
Hooks.on('renderActorDirectory', (app, html) => {
    if (!game.user.can('ACTOR_CREATE')) return;
    const el = html instanceof HTMLElement ? html : html[0];
    if (el.querySelector('.cvtt-chargen-button')) return;
    const footer = el.querySelector('.directory-footer') ?? el;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cvtt-chargen-button';
    btn.innerHTML = `<i class="fas fa-user-plus"></i> ${game.i18n.localize('CHUMMER.Chargen')}`;
    btn.addEventListener('click', () => new ChargenApp().render(true));
    footer.append(btn);

    // Schnell-NSC nur für die Spielleitung – Vorlagen sind Gegner-Werte.
    if (game.user.isGM) {
        const quick = document.createElement('button');
        quick.type = 'button';
        quick.className = 'cvtt-quicknpc-button';
        quick.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('CHUMMER.QuickNpc.Button')}`;
        quick.addEventListener('click', () => new QuickNpcApp().render(true));
        footer.append(quick);
    }
});

// Button „Schergen importieren (GRW)“ in der Kompendium-Seitenleiste.
Hooks.on('renderCompendiumDirectory', (app, html) => {
    if (!game.user.isGM) return;
    const el = html instanceof HTMLElement ? html : html[0];
    if (el.querySelector('.cvtt-grunts-button')) return;
    const footer = el.querySelector('.directory-footer') ?? el;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cvtt-grunts-button';
    btn.innerHTML = `<i class="fas fa-users"></i> ${game.i18n.localize('CHUMMER.Grunts.Button')}`;
    btn.addEventListener('click', () => GruntImporter.import());
    footer.append(btn);
});

// Header-Buttons auf dem Charakterbogen: Shop & Karma-Aufstieg.
Hooks.on('getHeaderControlsSR5CharacterSheet', (sheet, controls) => {
    const actor = sheet.document ?? sheet.actor;
    if (!actor?.isOwner) return;
    controls.push({
        icon: 'fas fa-shopping-cart',
        label: 'CHUMMER.Shop',
        action: 'cvttShop',
        onClick: () => new ShopApp({ actor }).render(true),
    });
    controls.push({
        icon: 'fas fa-arrow-trend-up',
        label: 'CHUMMER.Advancement',
        action: 'cvttAdvance',
        onClick: () => new AdvancementApp({ actor }).render(true),
    });
});

}
