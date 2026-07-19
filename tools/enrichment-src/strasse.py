# Überlebensausrüstung, Enterhaken/Seile, Verträge, BTLs, Holster
# (GRW S. 415, 435–436, 453–454, 466).
TARGET = 'gear'

def d(text): return {'description': text}
BTL = '<p><em>BTL: Geschwindigkeit Sofort · Dauer meist 10 × 1W6 Minuten · Abhängigkeit Psychisch. Chips löschen sich nach einmaliger Nutzung selbst (umgehbar mit Hardware + Logik [Geistig] (10, 1 Stunde)).</em></p>'
DOCWAGON = '<p><em>DocWagon: bewaffnetes Rettungsteam in unter zehn Minuten (sonst kostenlos); Vertrag erfordert Gewebeprobe und beinhaltet einen Vitalmonitor als Armband oder RFID-Implantat.</em></p>'

ENTRIES = {
 # Überlebensausrüstung
 '241e831d-230a-403b-a4a1-1e601b1afdc3': d('<p>Filtermaske über Mund und Nase: addiert ihre Stufe zu Toxinwiderstandsproben gegen Inhalations-Toxine.</p>'),
 '4a925049-5390-4394-8842-6cb46423cf00': d('<p>Undurchlässiger Ganzkörperanzug über Kleidung/Panzerung: Chemische Isolierung in Höhe der Stufe (nicht vakuumversiegelt — kein Hazmat-Ersatz). Nur die höchste Isolierungsstufe zählt.</p>'),
 '2633cf38-90a6-4843-b475-e3ee1132fb5f': d('<p>Vollgesichts-Atemgerät mit einer Stunde Sauerstoff: immun gegen Inhalations-Toxine; an größere Lufttanks anschließbar. <strong>WiFi:</strong> analysiert die nicht geatmete Umgebungsluft.</p>'),
 '8bed8fa9-b75e-44ad-8181-a9dcd1f110cd': d('<p>Set aus Handschuhen, Kniepolstern und Überziehsohlen mit Trockenklebstoff aus Millionen Mikrohärchen — hält selbst einen Troll kopfüber an der Decke (Regeln für Klettern mit Ausrüstung). Nass nutzlos. <strong>WiFi:</strong> Haftschicht zeitweise neutralisierbar.</p>'),
 'a39501ca-0df5-4fb7-8992-97b765383d17': d('<p>Ganzkörperanzug mit internem Lufttank (4 Stunden): unbeschädigt bietet er Chemische Versiegelung gegen Kontakt- und Inhalations-Toxine; oft mit Geigerzähler. <strong>WiFi:</strong> analysiert die Umgebung.</p>'),
 'a17cae86-4d6f-4e00-acb6-03f0ccfb2807': d('<p>Rucksack mit 400-kg-Seil, Klettergeschirr, Handschuhen, Karabinern, Steigeisen und allem fürs Klettern mit Ausrüstung.</p>'),
 '2bb6956f-c00e-452c-ab99-6b4613d7bb3e': d('<p>Spezialgewebe für besseren Griff: +2 Würfelpool auf Proben, sich am Seil festzuhalten. Pflicht für den Umgang mit Microwire.</p>'),
 'c658ec7e-48c1-4ead-8083-f3ee0eab92e4': d('<p>Knicken, schütteln, leuchten: drei Stunden sanftes Chemielicht mit zehn Metern Radius.</p>'),
 '08fb5b81-af99-4311-8588-f7d680d3fa5c': d('<p>Anzünden für fünf Minuten helles Fackellicht.</p>'),
 '78f71833-4104-4dfb-b811-9bcabff95ecf': d('<p>Schießt farbige Leuchtraketen bis 200 m hoch und erhellt minutenlang einen Häuserblock (eliminiert Teil-/Schwachbeleuchtungs-Modifikatoren). Als Waffe: Exotische Fernkampfwaffe, 5K Feuerschaden.</p>'),
 'f3d0d8f1-a2be-45d9-83a6-b5461afb62de': d('<p>Ersatz-Leuchtrakete für die Mini-Signalraketenkanone (5K Feuerschaden, wenn zweckentfremdet).</p>'),
 '27f9775d-cd14-4900-827f-ba00d26e0c67': d('<p>Widerstandsfähige Tasche mit Messer, Feuerzeug, Streichhölzern, Kompass, Isolationsdecke, Nahrungsriegeln, Wasserreinigung und mehr — die Notfalltasche.</p>'),
 'c49a893a-d445-4aac-bec0-c8501cba4c2c': d('<p>Superhelle, langlebige Taschenlampe; auch auf- oder unterlaufmontierbar an Waffen.</p>'),
 '44acc4c0-5795-47a4-84fb-bd2374276360': d('<p>Taschenlampe für Restlichtverstärkung — senkt die Sichtmodifikatoren für Restlichtsicht.</p>'),
 '58ae0574-bf03-45c3-9fee-0322069a3b18': d('<p>Infrarot-Taschenlampe — senkt die Sichtmodifikatoren für Infrarotsicht, für normale Augen unsichtbar.</p>'),
 '927c8a62-2c67-4121-abeb-235ebde7b90a': d('<p>Neoprenanzug, Maske mit Schnorchel, Atemregler, 2-Stunden-Lufttank und Auftriebsweste. Regler und Tank schützen wie eine Gasmaske gegen Inhalations-Toxine; der Anzug gibt 1 Punkt Resistenz gegen Kälteschaden.</p>'),
 # Enterhaken & Seile
 '59561c08-3269-470d-9d8b-3cde8a8ccbf8': d('<p>Verschießt Enterhaken samt Seil (Reichweiten wie Leichte Armbrust) und zieht ihn per interner Winde zurück. Abfeuern mit Exotische Fernkampfwaffe (7G, DK −2).</p>'),
 '8adaecd5-0c24-4982-8803-e4459e16589f': d('<p>Robustes Standardseil, trägt bis zu 400 kg.</p>'),
 '76890101-9f90-41db-a6f0-6f5fd4802896': d('<p>Trägt 400 kg — und zerfällt bei Berührung mit dem Katalysatorstab binnen Sekunden spurlos zu Staub.</p>'),
 'dff54f55-846d-4017-84e2-dd1f1c29861f': d('<p>Wiederverwendbarer Stab, der Camouflageseil per chemischer Reaktion zu Staub zerfallen lässt.</p>'),
 'fc0987f2-b3cf-4ba2-8777-0610ed97e90e': d('<p>Fast monofilamentdünne Hochleistungsfaser: trägt 100 kg, ist kaum zu sehen und passt in jede Tasche. Ohne Kletterhandschuhe schneidet sie in die Hände (8K, DK −8).</p>'),
 '14243f3e-8d05-480d-8e74-b90ee615e6ff': d('<p>Ferngesteuert bewegliches Myomerfaserseil (bis 30 m): windet sich um Hindernisse oder bindet sich selbst fest; 2 m pro Kampfrunde.</p>'),
 # Verträge
 '6b28b36a-416a-4041-9561-558083158d7c': d('<p>DocWagon Standard: Notfallversorgung rund um die Uhr; Reanimation und HTR-Einsatz kosten je 5.000 ¥ extra (plus Kompensation für verletzte/getötete Mitarbeiter).</p>'+DOCWAGON),
 'c985f952-df28-4b69-a7b7-b24a291cd651': d('<p>DocWagon Gold: eine kostenlose Reanimation pro Jahr, 50 % Rabatt auf HTR-Einsätze, 10 % auf stationäre Behandlung.</p>'+DOCWAGON),
 'aabed898-177f-413b-aeb6-5b862da67c6b': d('<p>DocWagon Platin: vier kostenlose Reanimationen pro Jahr, kostenlose HTR-Einsätze (Kompensationszahlungen bleiben), 50 % Rabatt auf stationäre Behandlung.</p>'+DOCWAGON),
 '7c8251b6-b195-4c8f-90f0-c036f8a9146f': d('<p>DocWagon Superplatin: fünf kostenlose Reanimationen pro Jahr, HTR-Einsätze und Mitarbeiter-Kompensation vollständig inklusive.</p>'+DOCWAGON),
 '2f40c4cd-7582-4358-8752-91c9f94f5b6e': d('<p>Monatliche Nährstoff- und Pflegekosten für Symbionten-Bioware — ohne Unterhalt leidet der Symbiont (und sein Wirt).</p>'),
 # BTLs
 '483ca04a-8522-4d12-96ab-4e21dd9a4300': d('<p>Handelsübliche SimSinn-Aufzeichnung mit deaktivierten Sicherheitsprotokollen: Heldenfantasien, aufgezeichnete Verbrechen, Pornografie — vom Studio bis zur Hinterhofproduktion.</p>'+BTL),
 'ea044b03-009c-4515-baef-d37b6b1138af': d('<p>Der häufigste BTL der Straße: pure, verstärkte Emotion von Euphorie bis Hass. Nach Ablauf folgt oft ein bis zwei Stunden die Gegenemotion; das RAS-Override ist meist deaktiviert.</p>'+BTL),
 '2e98e2af-6a0e-4b2f-a573-1766552b4ba4': d('<p>Der gefährlichste BTL: SimSinn plus Talentsoft überschreibt die Persönlichkeit und installiert Verhaltensmuster — vom Popstar-Imitat bis zur „Angestellten" im Bunraku-Salon.</p>'+BTL),
 'de2bd382-6339-479d-8120-59dd65bde6e6': d('<p>Sinnesrausch-Chip: ungewöhnliche und intensive Sinneseindrücke bis zur gewollten Synästhesie bei voll aufgedrehten Sinnesleveln.</p>'+BTL),
 # Holster (gear-Seite)
 '5977fb0b-b74e-4eb9-b433-9b7c9877b14f': d('<p>Standardholster für Pistolen und Taser — schnell erreichbar, aber sichtbar.</p>'),
 'f057b962-1439-4f8e-aa35-2e432a1c833d': d('<p>Leicht zugängliches Holster (bis Automatikpistole): senkt den Schwellenwert für das Schnellziehen der geholsterten Waffe um 1.</p>'),
 'e8e7b222-99da-4a4f-9c4e-8ffa61838017': d('<p>Kleines Holster für Knöchel, Unterarm oder Kreuz (nur Pistolen/Taser): −1 auf den Tarnmodifikator des Gegenstands. <strong>WiFi:</strong> smarte Beschichtung, zusätzlich −1.</p>'),
 'f77fc093-d5cf-4be6-bfeb-311653ecd64e': d('<p>Schießt farbige Leuchtraketen bis 200 m hoch und erhellt minutenlang einen Häuserblock. Als Waffe: Exotische Fernkampfwaffe, 5K Feuerschaden.</p>'),
}
