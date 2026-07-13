# SR5 Chummer (FoundryVTT-Modul)

Bringt die Kernfunktionen von **Chummer5a** direkt nach FoundryVTT – aufsetzend auf dem
System **shadowrun5e** (≥ 0.36, Foundry v13/v14):

- **Charaktererschaffung** nach dem SR5-Prioritätensystem (Metatyp, Attribute,
  Magie/Resonanz inkl. freier Talent-Fertigkeiten, Fertigkeiten, Ressourcen) mit
  Karma-Bilanz, Validierung und Erklärtexten zu jedem Schritt – wahlweise als
  **Spielercharakter, NSC oder Scherge (Grunt)**
- **Karma-Aufstieg** (Career Mode) mit SR5-Kosten und Aufstiegs-Log
- **Ausrüstungs-Shop** mit Chummer-Katalog (Waffen, Rüstung, Gear, Cyber-/Bioware,
  Fahrzeuge, Lebensstile), Verfügbarkeits-Anzeige und Nuyen-Abzug
- **PDF-Quellenverweise**: Jedes Buchkürzel (SR5, RG, SL, …) kann auf eine PDF-Datei
  mit Seitenoffset gemappt werden; alle „SR5 282“-Angaben im Modul sind klickbar
- **Schnell-NSC**: NSC oder ganze Schergen-Trupps in Minuten aus den 14
  GRW-Vorlagen (PS 0–6) – Vorlage öffnen, Attribute/Fertigkeiten/Magie/
  Ausrüstung frei anpassen, speichern
- **Schergen-Import**: Erzeugt per Knopfdruck das Welt-Kompendium
  „SR5 Schergen (GRW)“ mit den 14 Beispiel-Schergen des Grundregelwerks
  (PS 0–6, jeweils Scherge und Anführer) als fertige Grunt-Actors

Alle Spieldaten stammen aus den mitgelieferten, aus `chummer5a/Chummer/data/*.xml`
konvertierten JSON-Dateien (`data/`, Konverter: `tools/convert.py`).

## Installation

1. In Foundry unter **Add-on-Module installieren** diese Manifest-URL einfügen:
   `https://raw.githubusercontent.com/TimRoesler/sr5-chummer/main/module.json`
2. System **shadowrun5e** installieren (bereits geschehen).
3. In der Welt das Modul **„Chummer für Shadowrun 5e“** aktivieren.
4. **Empfohlen:** Modul [PDF Pager](https://github.com/farling42/fvtt-pdf-pager)
   installieren – dann öffnen Quellenlinks die PDF direkt in Foundry.
   Ohne PDF Pager öffnet sich die PDF in einem Browser-Tab auf der richtigen Seite.
5. **Empfohlen:** Einmalig den Chummer-Datenimport des Systems ausführen
   (Einstellungen → *Import Chummer Data*). Der Shop und die Erschaffung übernehmen
   dann vollständige Items (Schaden, Modi, Essenz, …) aus den erzeugten Kompendien
   `sr5weapon`, `sr5gear`, `sr5ware`, … Ohne Import werden minimale, aber
   schema-kompatible Items mit Kosten/Verfügbarkeit/Quelle angelegt.

## Benutzung

- **Charakter erstellen:** Button unten in der Akteurs-Seitenleiste
  („Charakter erstellen (Chummer)“) – führt durch 8 Schritte und legt am Ende einen
  vollständigen `character`-Actor mit allen Items an. Im ersten Schritt wird der
  **Charaktertyp** gewählt: Spielercharakter (verknüpfter, freundlicher Token),
  NSC (unverknüpft, neutral) oder Scherge (unverknüpft, feindselig, mit
  Grunt-Markierung/gemeinsamem Zustandsmonitor). Jeder Schritt erklärt kurz,
  was zu tun ist; offene Punkte sind klickbar und springen in den passenden Schritt.
- **Schnell-NSC:** Button unten in der Akteurs-Seitenleiste („Schnell-NSC“,
  nur GM). Vorlage (GRW-Schergen PS 0–6) öffnen und vor dem Speichern frei
  anpassen: Attribute per Stepper, Fertigkeiten (ändern/entfernen/hinzufügen),
  Gaben, Zauber/Kräfte/Komplexe Formen sowie Ausrüstung per Katalogsuche.
  Name/Anzahl/Gesinnung festlegen – ab zwei Exemplaren landet der Trupp
  nummeriert in einem eigenen Actor-Ordner. Die Scherge-Option steuert den
  gemeinsamen Zustandsmonitor.
- **Shop / Karma-Aufstieg:** Buttons im Kopf des Charakterbogens (⋯-Menü).
- **Schergen importieren:** Button unten in der Kompendium-Seitenleiste
  („Schergen importieren (GRW)“, nur GM). Legt das Welt-Kompendium
  „SR5 Schergen (GRW)“ an – nach Professionalitätsstufe sortierte Ordner mit
  Schläger, Ganger, Konzernsicherheit, Streifenpolizei, Syndikat und Eliteeinheiten
  (GRW S. 381–385). Attribute sind Effektivwerte inklusive Bodytech; jeder Scherge
  ist als Grunt markiert (gemeinsamer Zustandsmonitor) und hat Gruppenedge in Höhe
  seiner Professionalitätsstufe als Edge-Attribut. Erneuter Klick baut das
  Kompendium nach Rückfrage neu auf.
- **PDF-Quellen:** Moduleinstellungen → „PDF-Quellen konfigurieren“ (nur GM).
  Pro Buchkürzel PDF-Datei wählen und ggf. Seitenoffset eintragen
  (Offset = PDF-Seite − aufgedruckte Seitenzahl).
- API für Makros: `game.modules.get('sr5-chummer').api`
  (`openChargen()`, `openQuickNpc()`, `openShop(actor)`, `openAdvancement(actor)`,
  `openPdfConfig()`, `importGrunts()`).

## Einstellungen

| Einstellung | Standard | Beschreibung |
|---|---|---|
| Start-Karma bei Erschaffung | 25 | Karma-Budget im Wizard |
| Verfügbarkeitslimit | 12 | Warnschwelle beim Einkauf während der Erschaffung |
| Kompendien des Systems nutzen | an | Items bevorzugt aus den Bulkimporter-Kompendien übernehmen |
| Regelwerke konfigurieren (GM) | alle aktiv | Legt fest, aus welchen Quellenbüchern Erschaffung, Shop, Schnell-NSC und Aufstieg Einträge anbieten. Das Grundregelwerk ist immer aktiv. |

## Karma-Kosten (Aufstieg)

Attribut: neue Stufe × 5 · Fertigkeit: neue Stufe × 2 · Neue Fertigkeit: 2 ·
Spezialisierung: 7 · Zauber: 5 · Komplexe Form: 4 · Positive Quality: 2 × Karma.

## Bekannte Grenzen

- Knowledge-Skills, Kontakte, Lifepath/Lifemodules und Metagenetik fehlen noch.
- Qualities mit Stufen („1,2,3“-Karma) werden mit der ersten Stufe angesetzt.
- Beim Fahrzeugkauf wird ohne Kompendium nur ein Platzhalter-Item angelegt
  (mit Kompendium: vollständiger Fahrzeug-Actor aus `sr5drone` als Item nicht möglich –
  Fahrzeug bitte aus dem Kompendium ziehen).
- Deutsche **Daten** (Item-/Zaubernamen) erfordern die deutschen Chummer-Datenpakete;
  die Modul-Oberfläche ist de/en lokalisiert.

## Daten aktualisieren

```bash
python3 tools/convert.py <chummer5a>/Chummer/data sr5-chummer/data
```
