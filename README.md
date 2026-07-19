# SR5 Chummer

Charaktererschaffung, Steigerung und Ausrüstung auf Basis der Chummer5a-Daten — direkt in
Foundry VTT für das Shadowrun-5e-System.

## Funktionen

- Charaktererschaffung mit Prioritätensystem
- Karma-basierte Steigerung/Aufstieg
- Ausrüstungs-Shop
- PDF-Quellenverweise
- Datenbasis: Chummer5a
- **GRW-Anreicherung**: Alle 490 Items des Grundregelwerks erhalten beim Kauf und Import
  eigene deutsche Beschreibungen; Wirk-Items (Drogen, Toxine, Slap-Patches, Granaten)
  zusätzlich ActiveEffects streng nach GRW-Werten (kompatibel mit sr5-dice-flow v2.4:
  Zieleffekte per Bestätigungs-Button, Drogen als Selbstanwendung)

## GRW-Anreicherung

Neue Käufe (Shop, Charaktererschaffung, Grunt-Import) werden automatisch angereichert.
Seit v0.7.1 gilt das auch für **alle Importe**: Der Chummer-Charakterimport des Systems
(neue Actors samt Items) und einzeln angelegte/importierte Items („Import Chummer Data",
Drag & Drop) werden über `createActor`-/`createItem`-Hooks automatisch nachgezogen.
Jeder Vorgang wird ausführlich in der Browser-Konsole protokolliert (F12, Filter
„sr5-chummer"): angereicherte Items mit Effektliste, übersprungene Items mit Grund und
Ausrüstungs-Items ohne GRW-Katalogtreffer.

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
| Modulversion | 0.6.0 |

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
