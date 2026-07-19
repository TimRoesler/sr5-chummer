# Programme, Cyberdecks, Kommlinks, Softs (GRW S. 241–243, 267, 442–446).
TARGET = 'gear'

def d(text): return {'description': text}
PROG = '<p><em>Cyberprogramm: läuft auf einem Deck; nur ein Programm desselben Typs gleichzeitig.</em></p>'
HACK = '<p><em>Hackingprogramm — Kauf, Besitz und Nutzung sind ohne Lizenz illegal.</em></p>' + PROG
DECK = lambda st, attr, prog: f'<p><strong>Gerätestufe:</strong> {st} · <strong>Attributsanordnung:</strong> {attr} · <strong>Programme:</strong> {prog}</p><p><em>Cyberdeck: Die Attributswerte werden frei auf Angriff/Schleicher/Datenverarbeitung/Firewall verteilt; serienmäßig mit illegalem Hot-Sim-Modul.</em></p>'
LINK = lambda st: f'<p><strong>Gerätestufe:</strong> {st} (Datenverarbeitung und Firewall = {st})</p><p><em>Kommlink: das digitale Schweizer Messer — AR, Telefon/Funk, Kamera, GPS, Credstickleser, Scanner und mehr in einem stoß- und wasserfesten Gehäuse.</em></p>'

ENTRIES = {
 # Standardprogramme
 'fe598c15-fe7a-46f9-bc84-751cb32735e2': d('<p><strong>Editieren:</strong> Smartes Interface mit Vorschlägen — +2 auf das Limit Datenverarbeitung für alle Editierenproben, solange das Programm läuft.</p>'+PROG),
 '0e9a4de8-c78e-498e-8f3b-8e581bc73e43': d('<p><strong>Konfigurator:</strong> Speichert eine alternative Deck-Konfiguration; beim nächsten Umkonfigurieren kann sie komplett übernommen werden, statt nur zwei Attribute oder Programme zu tauschen.</p>'+PROG),
 'b3c0a6bd-e086-4971-be77-dc9a9cb2e174': d('<p><strong>Schmöker:</strong> Praktische Suchmaschine — halbiert den Grundzeitraum der Handlung Matrixsuche.</p>'+PROG),
 '1662e26b-7370-4ade-9d9d-c9b92b0d145b': d('<p><strong>Signalreiniger:</strong> Analysiert Hintergrundrauschen und eingehende Signale — Rauschunterdrückung 2.</p>'+PROG),
 'cffae49c-30d1-42df-b47c-a407f3a86e7a': d('<p><strong>Toolbox:</strong> Speicherverwaltung — +1 auf das Attribut Datenverarbeitung.</p>'+PROG),
 'd3bb1242-73b0-4b8a-89ab-27c272ebc900': d('<p><strong>Verschlüsselung:</strong> +1 auf das Firewallattribut.</p>'+PROG),
 '7b8f4a4e-0bdb-4e05-ade4-bf558daf60a6': d('<p><strong>Virtuelle Maschine:</strong> Zwei zusätzliche Programmplätze auf dem Deck — aber die Persona erleidet bei jedem Matrixschaden 1 Kästchen zusätzlich (kein Widerstand).</p>'+PROG),
 # Hackingprogramme
 '9bfce6cb-99ea-4b63-ad9f-e1bceb87bbd6': d('<p><strong>Aufspüren:</strong> +2 auf Datenverarbeitung bei der Handlung Icon Aufspüren. Gegen Tarnkappe heben sich beide Programme auf.</p>'+HACK),
 '67ea7c0c-1703-412b-80d3-9c23cc6d8291': d('<p><strong>Ausnutzen:</strong> Analysiert Firewall-Schwächen — +2 auf das Attribut Schleicher bei der Handlung Eiliges Hacken.</p>'+HACK),
 'a37b8000-495b-4ab8-a73b-16a36a6a410e': d('<p><strong>Babymonitor:</strong> Auf GOD-Algorithmen basierend — der Charakter kennt jederzeit seinen aktuellen Overwatch-Wert.</p>'+HACK),
 'e631585a-0cce-4c95-873d-74b278a661df': d('<p><strong>Biofeedback:</strong> Angriffe verursachen zusätzlich Biofeedback-Schaden in Höhe des Matrixschadens (Geistig bei kaltem, Körperlich bei heißem Sim; Widerstand Willenskraft + Firewall). Wirkt auch auf Angreifer, deren Matrixhandlung gegen den Charakter misslingt. Nur gegen biologische Ziele.</p>'+HACK),
 '7bc33fe3-96b0-4f3c-a459-7c85ede9f8c1': d('<p><strong>Biofeedback-Filter:</strong> Firewall fürs Sim-Modul — +2 Würfelpool zum Widerstand gegen Biofeedback-Schaden.</p>'+HACK),
 'f3134808-861c-41df-8bdf-2d2c855e78a4': d('<p><strong>Blackout:</strong> Wie Biofeedback, verursacht aber auch bei heißem Sim nur Geistigen Schaden.</p>'+HACK),
 '5217388a-e2ce-4add-bcc0-b0b1672f156c': d('<p><strong>Entschlüsselung:</strong> +1 auf das Attribut Angriff.</p>'+HACK),
 '70be200d-5b83-4842-83b5-725839330808': d('<p><strong>Fessel:</strong> Wer vom Charakter Matrixschaden erleidet, wird mit einer Linksperre belegt — bis das Programm endet oder das Opfer sich erfolgreich ausstöpselt.</p>'+HACK),
 '69a87be8-6f05-453d-a344-b02d9fab055c': d('<p><strong>Gabel:</strong> Eine Matrixhandlung gegen zwei Ziele gleichzeitig: eine Probe (Modifikatoren beider Ziele kumulativ), jedes Ziel verteidigt separat, Auswirkungen werden je Ziel bestimmt.</p>'+HACK),
 'a3851f14-3fdc-47d6-82b4-07caf00202ce': d('<p><strong>Hammer:</strong> +2 Matrixschaden bei allen schadenverursachenden Handlungen des Charakters (nicht beim Schaden, den Angreifer durch misslungene Angriffe erleiden).</p>'+HACK),
 '8920c83c-f4f2-4dfa-81a4-b150ba6ae1c0': d('<p><strong>Irreführung:</strong> Verschleierte Routen — +2 Würfelpool zur Verteidigung gegen Icon Aufspüren; ein fokussierender Halbgott erfährt den physischen Standort nicht.</p>'+HACK),
 'a1e4b783-0751-43eb-b5bd-ee00f84b7bb3': d('<p><strong>Panzerung:</strong> Zweite Firewall — +2 Würfelpool zum Widerstand gegen Matrixschaden.</p>'+HACK),
 'ea3178a2-535f-43b7-8555-deca95ac837d': d('<p><strong>Schild:</strong> Schützt Schwachstellen — Angreifer erhalten −1 Zusatzschaden pro Marke auf dem Charakter.</p>'+HACK),
 '84a3e0d5-ed40-4706-9b96-7f07567bcbef': d('<p><strong>Schutzschirm:</strong> Filter-Algorithmen — +1 Würfelpool zum Widerstand gegen Matrixschaden und Biofeedback (kumulativ mit ähnlichen Boni).</p>'+HACK),
 '168b8c61-9ea4-4816-8cf4-cb996067b6d6': d('<p><strong>Splitterschutz:</strong> Barrieren gegen Datenbomben — +4 Würfelpool zum Widerstand gegen Datenbomben-Schaden.</p>'+HACK),
 '3da01b93-3830-4211-b563-f41c7fcf4ab0': d('<p><strong>Superbombe:</strong> Vom Charakter gelegte Datenbomben erhalten +1 Stufe, solange das Programm läuft.</p>'+HACK),
 'd5877f46-03e0-4603-b77a-f27e278202ab': d('<p><strong>Tarnkappe:</strong> +1 auf das Attribut Schleicher.</p>'+HACK),
 '62d165f6-bc3f-4204-afb7-47b3485e25ad': d('<p><strong>Überfall:</strong> Verfolgt die eigenen Marken aktiv — +1 Zusatzschaden pro Marke auf dem Ziel.</p>'+HACK),
 '4a33f713-566b-4233-bdd2-985000097648': d('<p><strong>Verwandlung:</strong> Überbrückt die Icon-Protokolle — das eigene Icon kann per Icon Verändern beliebig gestaltet werden (eine Predator als Credstick, die Persona als Limousine). Durchschaubar nur per begründeter Matrixwahrnehmungsprobe.</p>'+HACK),
 # Cyberdecks
 'b6d1476d-a08c-43fc-be0e-68ca9330a43e': d(DECK(1,'4 3 2 1',1)+'<p>Das Einsteigerdeck von Erika — billig, verbreitet, und für erste Gehversuche im Hosting-Untergrund völlig ausreichend.</p>'),
 '540831fa-7866-443a-9187-112c5c5cbf7b': d(DECK(1,'4 3 3 1',1)+'<p>Microdecks kompakter Klassiker — kaum größer als ein Kommlink und bei Einsteigern beliebt.</p>'),
 'd0815d76-b7b7-4f50-b700-9eb873096408': d(DECK(2,'5 4 3 2',2)+'<p>Aztechnologys Volksdeck aus Tenochtitlán: solide Mittelklasse zum fairen Preis.</p>'),
 '785179f5-1500-46b6-b04f-063effa3a457': d(DECK(2,'5 4 4 2',2)+'<p>Der zuverlässige Kurierwagen unter den Decks — unauffällig, robust, weit verbreitet.</p>'),
 'ab0a7547-3cb4-4816-a65a-cb03dd2186ac': d(DECK(3,'6 5 4 3',3)+'<p>Der Nachfolger einer Legende: Novatechs Navigator ist das Arbeitspferd professioneller Decker.</p>'),
 '5f4c41eb-abaa-4725-86ce-62fe11eeee0b': d(DECK(3,'6 5 5 3',3)+'<p>Renrakus „Schwert" — japanische Präzision für Sicherheitsspinnen und Schattenprofis.</p>'),
 '79134070-7441-416a-8f14-922a5b7f490d': d(DECK(4,'7 6 5 4',4)+'<p>Sonys Oberklasse-Deck für alle, die Stil und Substanz verlangen.</p>'),
 'c3f15a4a-1987-4879-ba74-5b93d602ca8c': d(DECK(5,'8 7 6 5',5)+'<p>Shiawases Cyber-5 spielt in der Konzernliga — entsprechend selten außerhalb von Hochsicherheitsabteilungen.</p>'),
 '5d649de9-aa6f-450e-893b-63e5ad166388': d(DECK(6,'9 8 7 6',6)+'<p>Das Nonplusultra: Fairlights Excalibur ist das Deck, von dem jeder Decker träumt — und für das mancher töten würde.</p>'),
 # Kommlinks
 'd63eb841-7b15-4539-9026-b90a4924aeeb': d('<p>Ein individuell zusammengestelltes Kommlink (Werte nach Absprache mit dem Spielleiter).</p>'),
 '89a0f3c9-5ef6-41cd-981f-4ac690ee2ab3': d(LINK(1)+'<p>Das Wegwerf-Link der Straße: tut, was es muss, und nicht mehr — dafür kostet es fast nichts.</p>'),
 'd808ba12-db93-4a7b-85a1-9e9f6229087f': d(LINK(2)+'<p>Sonys Massenmodell mit ordentlicher Ausstattung für den Alltag im Sprawl.</p>'),
 '15a6c42b-12a4-494e-8ca5-e6c3a1052314': d(LINK(3)+'<p>Renrakus „Lehrer" — der solide Mittelklassestandard vieler Angestellter.</p>'),
 '72d1ca07-71b1-4085-8a4d-bd720a6b1908': d(LINK(4)+'<p>Erikas gehobene Klasse: elegant, schnell, zuverlässig.</p>'),
 '6de5a1b0-30e2-4c74-8646-971f698cb231': d(LINK(5)+'<p>Das Ikon ist bei Profis beliebt — hohe Leistung ohne Luxusaufschlag.</p>'),
 '01077e2d-4f67-428a-850d-250faad2007c': d(LINK(6)+'<p>Transys Avalon: Oberklasse mit allem Zubehör, das Statussymbol gehobener Konzernetagen.</p>'),
 '1522dd91-99d9-42f9-ab19-b43e8e3c7322': d(LINK(7)+'<p>Fairlights Caliban — das beste Kommlink, das man für Geld kaufen kann.</p>'),
 # Kommlink-Zubehör
 'd589142e-a71f-4cd9-b916-967168721eea': d('<p><strong>Sim-Modul:</strong> Übersetzt Computerdaten in neurale Signale — Voraussetzung für SimSinn und VR. Zugriff nur per Direktem Neuralinterface (Troden, Datenbuchse oder implantiertes Kommlink).</p>'),
 'b7da0596-da6e-4122-adc3-21d7f3f9e3f1': d('<p><strong>Sim-Modul (heißes Sim):</strong> Für heißes Sim modifiziertes Sim-Modul — eröffnet die volle (und gefährliche) Bandbreite der VR-Erfahrung. Illegal.</p>'),
 'd8960057-bd49-4ed0-8dc9-75cb7262c158': d('<p><strong>Hackpack:</strong> Cyberdeck-Bauform als robuster Rucksack/Tragepack — unauffälliger Formfaktor für Decks abseits des klassischen Quaders.</p>'),
 # Skillsofts
 'c4da5448-0069-447c-b3e4-4147e6bf4ca7': d('<p><strong>Aktionssoft:</strong> Ersetzt eine körperliche Aktionsfertigkeit (Talentsoftstufe statt Fertigkeit; kein Edge auf solche Proben). Benötigt Talentleitungen und eine Talentbuchse; die Stufe der Talentleitungen begrenzt die Anzahl gleichzeitig nutzbarer Aktionssofts.</p>'),
 'd9d017c4-b3b5-4d28-9c41-870d69287cfb': d('<p><strong>Wissenssoft:</strong> Repliziert eine Wissensfertigkeit und überschreibt aktiv das eigene Wissen (Talentsoftstufe statt Fertigkeit; kein Edge). Zugriff per Talentbuchse; deren Stufe begrenzt die Anzahl gleichzeitig nutzbarer Wissenssofts.</p>'),
 'c4599705-6b8c-45d0-8687-63a720043f7d': d('<p><strong>Linguasoft:</strong> Repliziert eine Sprachfertigkeit — automatische Übersetzung direkt aus dem Sprachkortex, wenn auch manchmal etwas gestelzt. Zugriff per Talentbuchse; deren Stufe begrenzt die Anzahl gleichzeitig nutzbarer Linguasofts.</p>'),
 # Autosofts
 '149a8dd2-dfef-473f-94a4-1bdd77e4f855': d('<p><strong>Clearsight:</strong> Autosoft — steht für die Fertigkeit Wahrnehmung der Drohne.</p>'),
 'f84179b8-34b2-4fb1-bb24-099b0b700b5b': d('<p><strong>Elektronische Kriegsführung:</strong> Autosoft — steht für die Fertigkeit Elektronische Kriegsführung der Drohne.</p>'),
 '80137629-41f0-41da-bfed-c8a1388b759e': d('<p><strong>Ausweichen [Modell]:</strong> Autosoft — lässt den Autopiloten der Zielverfolgung durch Sensoren entgehen. Modellgebunden.</p>'),
 '9d81218f-ee70-4304-9a09-ac865d84b8e0': d('<p><strong>Manövrieren [Modell]:</strong> Autosoft — wie die entsprechende Fahrzeugfertigkeit, aber auf ein Drohnen-/Fahrzeugmodell beschränkt.</p>'),
 'c29a96f9-25bf-4ebc-8c56-f4c8afc3c002': d('<p><strong>Stealth [Modell]:</strong> Autosoft — lässt die Drohne so unauffällig wie möglich agieren (vergleichbar Schleichen). Modellgebunden.</p>'),
 '0949997a-acb7-49d9-9905-5ae2cd35626f': d('<p><strong>Zielerfassung [Waffe]:</strong> Autosoft — wie die Fertigkeit Geschütze, aber auf ein bestimmtes Waffenmodell beschränkt.</p>'),
 # Software
 '2d8396ff-a4a9-4382-ab69-70d198856e7f': d('<p><strong>Agent:</strong> Autonomes Programm (Stufe 1–6) mit eigener Persona: Fertigkeiten Computer/Hacking/Matrixkampf = Stufe, Matrixattribute des Trägergeräts. Belegt einen Programmplatz; Schaden trifft das Gerät.</p>'),
 '1a55fbe3-b3c1-4568-882f-abe4dedb8572': d('<p><strong>Datensoft:</strong> Informationsdatei/Datenbank zu einem beliebigen Thema — passende Datensofts geben +1 auf das Geistige Limit bei entsprechenden Wissensproben.</p>'),
 '2f30c3cc-a62e-4ac1-8e1f-5fa217cadae4': d('<p><strong>Kartensoft:</strong> Detaildaten eines Gebiets (Straßen, Topographie, GPS, GridGuide-Updates) — nach Maßgabe des SL +1 auf das Limit bei Navigationsproben im abgedeckten Gebiet. Vorsicht: kann zur Ortung genutzt werden.</p>'),
 'fc8da0ad-bbfd-4961-a311-71db32f86130': d('<p><strong>Shopsoft:</strong> Shopping-App mit Preisvergleichen und Bewertungen (legal wie schwarz) — +1 auf das Soziale Limit bei Verfügbarkeits- und Verhandlungsproben für die passende Produktart.</p>'),
 '21afa914-713e-45a2-9018-9640ab75ae2d': d('<p><strong>Lehrsoft:</strong> Virtueller Privatlehrer für eine Fertigkeit — legt Unterrichtsproben mit Pool = Stufe × 2 ab. Lehrt nichts, was auf Magie oder Resonanz basiert.</p>'),
 # Sonstiges
 '45b1f2c4-99a3-421b-8c83-a7f574ecd39f': d('<p>Nuyen (¥) — die Weltleitwährung des Jahres 2075, praktisch nur noch elektronisch auf Credsticks und Konten.</p>'),
 '0025f1c7-45a4-4ec5-a692-e18aab2f97a9': d('<p>Ein frei definierter Gegenstand — Werte und Beschreibung nach Absprache mit dem Spielleiter.</p>'),
}
