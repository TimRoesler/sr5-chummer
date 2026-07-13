/**
 * PDF-Quellen: Konfiguration (Buchkürzel → PDF-Datei + Seitenoffset) und
 * klickbare Quellenverweise ("SR5 282") in allen Modul-Oberflächen.
 */
import { ChummerData, MODULE_ID } from './data.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export const SETTING_PDF_SOURCES = 'pdfSources';

export class SourceLinks {
    /** HTML für einen klickbaren Quellenverweis. */
    static linkHTML(source, page) {
        if (!source) return '';
        const p = page ?? '';
        return `<a class="cvtt-source" data-code="${source}" data-page="${p}" `
            + `data-tooltip="${game.i18n.format('CHUMMER.SourceTooltip', { source, page: p })}">`
            + `${source}${p ? ' ' + p : ''}</a>`;
    }

    /** Globale Klick-Delegation – einmal in main.mjs registriert. */
    static onClick(event) {
        const a = event.target.closest('a.cvtt-source');
        if (!a) return;
        event.preventDefault();
        event.stopPropagation();
        SourceLinks.open(a.dataset.code, parseInt(a.dataset.page) || 1);
    }

    /**
     * Öffnet ein Quellbuch auf einer Seite:
     * 1. eigene PDF-Konfiguration (+ Offset), per PDF-Pager falls aktiv, sonst Browser-Tab
     * 2. Fallback: PDF-Pager-eigene Codes
     */
    static open(code, page = 1) {
        const sources = game.settings.get(MODULE_ID, SETTING_PDF_SOURCES) ?? {};
        const cfg = sources[code];
        const target = page + (cfg?.offset ?? 0);

        if (cfg?.file) {
            if (ui.pdfpager?.openPDFByCode) {
                // Journal-Seite wird beim Speichern der Konfiguration synchronisiert.
                ui.pdfpager.openPDFByCode(code, { page: target });
                return;
            }
            window.open(`${foundry.utils.getRoute(cfg.file)}#page=${target}`, '_blank');
            return;
        }

        if (ui.pdfpager?.openPDFByCode) {
            ui.pdfpager.openPDFByCode(code, { page: target });
            return;
        }

        ui.notifications.warn(game.i18n.format('CHUMMER.PdfOpenError', { code }));
    }

    /**
     * Befüllt die PDF-Quellen beim ersten Start automatisch mit den
     * mitgelieferten Vorgaben (data/pdf-defaults.json), sofern die dort
     * genannten Dateien im Foundry-Datenverzeichnis existieren.
     */
    static async applyDefaults() {
        if (!game.user.isGM) return;
        const current = game.settings.get(MODULE_ID, SETTING_PDF_SOURCES) ?? {};
        if (Object.keys(current).length) return; // schon konfiguriert

        let defaults;
        try {
            defaults = await foundry.utils.fetchJsonWithTimeout(`modules/${MODULE_ID}/data/pdf-defaults.json`);
        } catch {
            return;
        }

        // Nur Bücher übernehmen, deren PDF wirklich vorhanden ist.
        let existing = new Set();
        try {
            const browse = await foundry.applications.apps.FilePicker.implementation.browse('data', 'pdfs');
            existing = new Set(browse.files.map(decodeURIComponent));
        } catch {
            return; // pdfs/-Ordner fehlt
        }

        const sources = {};
        for (const [code, cfg] of Object.entries(defaults)) {
            if (existing.has(cfg.file)) sources[code] = cfg;
        }
        if (!Object.keys(sources).length) return;

        await game.settings.set(MODULE_ID, SETTING_PDF_SOURCES, sources);
        await this.syncJournal();
        ui.notifications.info(game.i18n.format('CHUMMER.PdfDefaultsApplied', { count: Object.keys(sources).length }));
    }

    /**
     * Synchronisiert für PDF-Pager je konfiguriertem Buch eine Journal-PDF-Seite
     * mit dem Buchcode, damit openPDFByCode() sie findet.
     */
    static async syncJournal() {
        if (!game.user.isGM) return;
        if (!game.modules.get('pdf-pager')?.active) return;

        const sources = game.settings.get(MODULE_ID, SETTING_PDF_SOURCES) ?? {};
        const books = await ChummerData.books();
        const journalName = game.i18n.localize('CHUMMER.PdfConfigName');

        let journal = game.journal.getName(journalName);
        if (!journal) {
            journal = await JournalEntry.create({ name: journalName });
        }

        for (const [code, cfg] of Object.entries(sources)) {
            if (!cfg?.file) continue;
            const book = books.find(b => b.code === code);
            const pageName = book ? `${code} – ${book.name}` : code;
            const existing = journal.pages.find(p => p.getFlag('pdf-pager', 'code') === code);
            const data = {
                name: pageName,
                type: 'pdf',
                src: cfg.file,
                flags: { 'pdf-pager': { code } },
            };
            if (existing) {
                if (existing.src !== cfg.file || existing.name !== pageName) {
                    await existing.update(data);
                }
            } else {
                await journal.createEmbeddedDocuments('JournalEntryPage', [data]);
            }
        }
    }
}

/** Einstellungs-App: Buchkürzel → PDF + Offset. */
export class PdfSourcesConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'cvtt-pdf-config',
        tag: 'form',
        position: { width: 640, height: 600 },
        window: { title: 'CHUMMER.PdfConfig', icon: 'fas fa-file-pdf', resizable: true },
        form: {
            handler: PdfSourcesConfig.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        actions: {
            pickFile: PdfSourcesConfig.#onPickFile,
        },
    };

    static PARTS = {
        content: { template: `modules/${MODULE_ID}/templates/pdf-config.hbs`, scrollable: [''] },
    };

    async _prepareContext() {
        const books = await ChummerData.books();
        const sources = game.settings.get(MODULE_ID, SETTING_PDF_SOURCES) ?? {};
        return {
            hint: game.i18n.localize('CHUMMER.PdfConfigHint'),
            books: books
                .map(b => ({
                    ...b,
                    file: sources[b.code]?.file ?? '',
                    offset: sources[b.code]?.offset ?? 0,
                }))
                .sort((a, b) => a.code.localeCompare(b.code)),
            buttons: [{ type: 'submit', icon: 'fas fa-save', label: 'SETTINGS.Save' }],
        };
    }

    static async #onPickFile(event, target) {
        const input = target.closest('.cvtt-row').querySelector('input[type="text"]');
        const fp = new foundry.applications.apps.FilePicker.implementation({
            type: 'any',
            current: input.value,
            callback: path => { input.value = path; },
        });
        fp.render(true);
    }

    static async #onSubmit(event, form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        const sources = {};
        for (const [code, cfg] of Object.entries(data.book ?? {})) {
            if (cfg.file) sources[code] = { file: cfg.file, offset: parseInt(cfg.offset) || 0 };
        }
        await game.settings.set(MODULE_ID, SETTING_PDF_SOURCES, sources);
        await SourceLinks.syncJournal();
        ui.notifications.info(game.i18n.localize('CHUMMER.Saved'));
    }
}
