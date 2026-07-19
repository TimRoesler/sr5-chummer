# SR5 Chummer

Charaktererschaffung, Steigerung und Ausrüstung auf Basis der Chummer5a-Daten — direkt in
Foundry VTT für das Shadowrun-5e-System.

## Funktionen

- **Chummer-Import** (seit v0.9.0): JSON-Exporte der Chummer5a-Desktop-App direkt
  importieren — als neuer Charakter oder Re-Sync in einen bestehenden
- Charaktererschaffung mit Prioritätensystem (inkl. Kontakte, Wissens-/Sprachfertigkeiten,
  Tradition und Foki-Bindung seit v0.10.0)
- Karma-basierte Steigerung/Aufstieg (inkl. Initiation/Wandlung mit Metamagien/Echos,
  Foki binden, Wissensfertigkeiten seit v0.10.0)
- Ausrüstungs-Shop
- PDF-Quellenverweise
- Datenbasis: Chummer5a
- **GRW-Anreicherung**: Alle 490 Items und 92 Vor-/Nachteile des Grundregelwerks erhalten beim Kauf und Import
  eigene deutsche Beschreibungen; Wirk-Items (Drogen, Toxine, Slap-Patches, Granaten)
  zusätzlich ActiveEffects streng nach GRW-Werten (kompatibel mit sr5-dice-flow v2.4:
  Zieleffekte per Bestätigungs-Button, Drogen als Selbstanwendung)

## Chummer-Import (eigener Importer)

Button **„Chummer-Import"** in der Akteurs-Seitenleiste (oder Header-Button
**„Chummer-Sync"** auf dem Charakterbogen, API: `api.openImporter(actor)`).
Ersetzt den Charakterimport des Systems:

- Liest die JSON-Exporte der Chummer5a-Desktop-App (BOM-tolerant, deutsche und
  englische Exporte, Mehrcharakter-Dateien).
- Items werden per Chummer-GUID (`sourceid`) gegen den GRW-Katalog in `data/`
  gematcht und laufen durch dieselben Builder wie Shop/Chargen — inklusive
  Kompendium-Lookup und GRW-Anreicherung. Ohne Katalogtreffer entsteht ein
  minimales Fallback-Item; integriertes Chummer-Zubehör wird übersprungen.
- Importiert auch, was der System-Import nicht kann: Kontakte, Wissens- und
  Sprachfertigkeiten, Initiationsgrad/Metamagien, Tradition (Entzugsattribut),
  Straßenruf/Schlechter Ruf/Prominenz.
- **Fahrzeuge** werden als eigene `vehicle`-Actors mit dem Charakter als Fahrer
  angelegt (inkl. Sensoren, Autosofts, montierter Waffen und Mods).
- **Portraits** (Mugshots) werden nach `worlds/<welt>/sr5-chummer-mugshots/`
  hochgeladen und als Actor-/Token-Bild gesetzt.
- **Re-Sync**: Erneuter Import auf denselben Actor gleicht per
  `flags.sr5-chummer.sourceId` ab — vorhandene Items bleiben erhalten (Ratings
  und Mengen werden aktualisiert), neue kommen hinzu, verwaiste können optional
  entfernt werden. Schaden, Edge-Verbrauch und Munition werden nie angefasst.

Die Parselogik ist Foundry-frei (`scripts/chummer-parse.mjs`) und per Node
testbar: `node tools/test-import.mjs <ordner-mit-exporten>`.

## GRW-Anreicherung

Neue Käufe (Shop, Charaktererschaffung, Grunt-Import) werden automatisch angereichert.
Seit v0.7.1 gilt das auch für **alle Importe**: Der Chummer-Charakterimport des Systems
(neue Actors samt Items) und einzeln angelegte/importierte Items („Import Chummer Data",
Drag & Drop) werden über `createActor`-/`createItem`-Hooks automatisch nachgezogen.
Jeder Vorgang wird ausführlich in der Browser-Konsole protokolliert (F12, Filter
„sr5-chummer"): angereicherte Items mit Effektliste, übersprungene Items mit Grund und
Ausrüstungs-Items ohne GRW-Katalogtreffer.

Der Nachrüst-Button erfasst auch die Welt-Kompendien des System-Bulkimporters
(world.sr5gear u. a.): gesperrte Packs werden temporär entsperrt, angereichert und
wieder gesperrt — danach tragen auch die Kompendiums-Einträge Beschreibungen und Effekte.

Bereits existierende Welt-Items rüstet der Spielleiter über
**Moduleinstellungen → GRW-Anreicherung → „Jetzt nachrüsten"** nach — oder per Konsole:

```js
game.modules.get('sr5-chummer').api.enrichItems()          // anwenden
game.modules.get('sr5-chummer').api.enrichItems({dryRun: true})  // nur zählen
```

Beschreibungen werden nur gesetzt, wenn sie leer sind; Effekte nur, wenn noch keine
angereicherten vorhanden sind (Flag `sr5-chummer.enriched`). Die Datenquellen liegen in
`tools/enrichment-src/` und werden mit `python3 tools/build-enrichment.py` nach
`data/enrichment-*.json` gebaut.

## Installation

Manifest-URL in Foundry unter *Add-on-Module → Modul installieren* eintragen:

```text
https://github.com/TimRoesler/sr5-chummer/releases/latest/download/module.json
```

Voraussetzungen: das System **Shadowrun 5th Edition** (ab 0.36.0).

## Kompatibilität

| Komponente | Anforderung |
|---|---|
| Foundry VTT | v13–v14 (verifiziert: 14.364) |
| Spielsystem | shadowrun5e (ab 0.36.0) |
| Modulversion | 1.0.0 |

## Entwicklung

Reines JavaScript-Modul ohne Build-Schritt. Zum Mitwirken das Repository klonen und den
Ordner nach `Data/modules/sr5-chummer` verlinken oder kopieren.

## Herkunft & Credits

Entwickelt von TRO für den Eigenbetrieb. Datenbasis und Regelreferenzen aus dem
Chummer5a-Projekt.

## Lizenz & Markenhinweis

Dieses Repository enthält keine gesonderte Lizenzdatei; alle Rechte liegen beim Autor.
**Shadowrun** ist eine eingetragene Marke von The Topps Company, Inc. Dieses
nichtkommerzielle Fanprojekt steht in keiner Verbindung zu The Topps Company, Inc. oder
Catalyst Game Labs.
