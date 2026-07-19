# Vor- und Nachteile (GRW S. 71 f., 83–96, 398 f.).
# Qualities wirken permanent → Effekte sind AKTIVIERTE actor-Effekte, aber nur dort,
# wo der GRW-Wert statisch ist (stufenlose Boni). Stufen-/situationsabhängige Werte
# stehen vollständig im Beschreibungstext.
TARGET = 'qualities'

def d(text): return {'description': text}
def de(text, name, changes, icon):
    return {'description': text,
            'effects': [{'name': name, 'img': icon, 'disabled': False,
                         'system': {'applyTo': 'actor', 'changes': changes}}]}
def ch(key, value): return {'key': key, 'type': 'add', 'value': value}
MOD = 'system.modifiers.'
K = lambda n: f'<p><strong>Kosten:</strong> {n} Karma</p>'
B = lambda n: f'<p><strong>Bonus:</strong> {n} Karma</p>'
RUF_PLUS = '<p><em>Erhöht den Schlechten Ruf um 1.</em></p>'
RUF_MINUS = '<p><em>Senkt den Schlechten Ruf um 1.</em></p>'

ENTRIES = {
 # ============================== VORTEILE ==============================
 # Analytischer Geist
 '5b19dbcd-fb69-4a02-a25a-7ac5342ca576': d(K(5)+'<p>Begabung für logische Analyse: <strong>+2 Würfel</strong> auf alle Logik-Proben rund um Mustererkennung, Analyse, Hinweissuche und Rätsel; die benötigte Zeit für solche Aufgaben halbiert sich (aufgerundet).</p>'),
 # Astrales Chamäleon
 '7d81f676-e523-4ec6-ae98-8d801f90b031': d(K(10)+'<p>Die astrale Signatur verschwimmt vor dem Hintergrund: Hinterlassene Spuren halten nur halb so lange, und Askennenproben auf die Signatur erleiden <strong>−2 Würfel</strong>. Nur für Charaktere mit Magieattribut.</p>'),
 # Außergewöhnliches Attribut
 '2ac8a95a-a4d0-4bef-a2f2-dcde020258cf': d(K(14)+'<p>Ein gewähltes Attribut (auch Magie/Resonanz, nicht Edge) darf 1 Punkt über dem natürlichen Metatyp-Maximum liegen. Nur einmal wählbar, nur mit SL-Zustimmung, nicht mit dem Vorteil Glück kombinierbar.</p>'),
 # Beidhändigkeit
 '68cfe94a-fa7e-4129-a9b9-b5d73e3ced99': d(K(4)+'<p>Beide Hände sind gleich geschickt: Der übliche Malus von <strong>−2 Würfeln</strong> für Handlungen mit der Nebenhand entfällt.</p>'),
 # Bewegungstalent
 '225f0d31-8c03-4283-9a22-558ab01a6c47': d(K(7)+'<p>Angeborene Fitness, Balance und Athletik: <strong>+2 Würfel</strong> auf alle Laufen- und Akrobatikproben.</p>'),
 # Durchsetzungskraft
 '0f3a0971-1cc5-47d6-a32d-d098ecdfb4d9': d(K('8 pro Stufe (max. 3)')+'<p>Eiserner Wille sprengt Grenzen: <strong>+1 Geistiges Limit pro Stufe</strong>. Bis zu drei Stufen, frei auf die Limits verteilbar.</p>'),
 '58e6a651-cdd7-4144-a2cc-4cee24526e92': d(K('8 pro Stufe (max. 3)')+'<p>Eiserner Wille sprengt Grenzen: <strong>+1 Körperliches Limit pro Stufe</strong>. Bis zu drei Stufen, frei auf die Limits verteilbar.</p>'),
 'b9f1dbeb-1728-4250-a066-4773f758fe6a': d(K('8 pro Stufe (max. 3)')+'<p>Eiserner Wille sprengt Grenzen: <strong>+1 Soziales Limit pro Stufe</strong>. Bis zu drei Stufen, frei auf die Limits verteilbar.</p>'),
 # Erhöhte Konzentrationsfähigkeit
 '4d5c22b9-4908-493d-a6f7-4ccc3066888c': d(K('4 pro Stufe (max. 6)')+'<p>Präzise Mana-/Resonanzkontrolle: Ein Zauber oder eine Komplexe Form mit Kraftstufe ≤ Vorteilsstufe kann <strong>ohne Aufrechterhaltungs-Malus</strong> gehalten werden (weitere kosten normal −2). Nur für Zauberwirker und Technomancer.</p>'),
 # Fotografisches Gedächtnis
 '9d3be1d9-1309-45e7-8bd9-1f5a3ede3522': de(K(6)+'<p>Zahlen, Daten, Gesichter — nichts geht verloren: <strong>+2 Würfel auf alle Erinnerungsproben</strong>.</p>',
    'Fotografisches Gedächtnis (+2 Erinnern)', [ch(MOD+'memory', 2)], 'icons/svg/book.svg'),
 # Freundliche Geister
 'c067baa6-0dfa-4783-a0c8-0873564f0308': d(K(7)+'<p>Eine gewählte Geisterart mag den Charakter: <strong>1 zusätzlicher Dienst</strong> von jedem herbeigerufenen Geist dieser Art und <strong>+1 Würfel auf Bindenproben</strong>. Nur für Magieanwender; wirkt nicht auf Watcher/Diener.</p>'),
 # Glück
 '78f7456d-78b8-461e-a2b2-bd0d63c48712': d(K(12)+'<p>Das Schicksal meint es gut: Edge darf 1 Punkt über dem Metatyp-Maximum gesteigert werden (Steigerung kostet normal Karma). Nur einmal, mit SL-Zustimmung; nicht mit Außergewöhnlichem Attribut kombinierbar.</p>'+RUF_MINUS),
 # Gummigelenke
 'db579224-99c7-48e0-84ab-77a987a84f4a': d(K(6)+'<p>Extreme Gelenkigkeit: <strong>+2 Würfel auf Entfesselnproben</strong>; nach SL-Maßgabe passt der Charakter durch Öffnungen, die anderen verschlossen bleiben.</p>'),
 # Hohe Schmerztoleranz
 'b7866fb4-3747-4caf-9240-69cbdd79ce78': d(K('7 pro Stufe (max. 3)')+'<p>Pro Stufe wird <strong>1 Kästchen Schaden bei der Berechnung von Verletzungsmodifikatoren ignoriert</strong>. Nicht kombinierbar mit Schmerzresistenz (Adeptenkraft), Schmerzeditor oder Schadenskompensatoren.</p>'),
 # Katzenhaft
 '84305e09-f8d5-4a82-8257-0119b8c3f926': d(K(7)+'<p>Lautlose Eleganz: <strong>+2 Würfel auf Schleichenproben</strong>.</p>'),
 # Magieresistenz
 'f80ef6fc-e844-441c-81e3-b1264b34a4e7': d(K('6 pro Stufe (max. 4)')+'<p><strong>+1 Würfel pro Stufe auf Zauberwiderstandsproben</strong> — dauerhaft aktiv, behindert also auch hilfreiche Zauber wie Heilen; „Freiwilliges Ziel" ist unmöglich. Nicht für Charaktere mit Magieattribut.</p>'),
 # Menschliches Aussehen
 '2844e64e-f271-4ca7-bd58-0860b2db56c9': d(K(6)+'<p>Der Metamensch geht meist als Mensch durch: Menschliche NSCs reagieren bei Sozialen Proben neutral, selbst mit Vorurteilen gegen Metamenschen. Nur für Elfen, Zwerge und Orks.</p>'),
 # Mut
 '0d0cb0fc-c79d-418e-9216-8a197369e52d': d(K(10)+'<p>Nerven aus Stahl: <strong>+2 Würfel</strong> auf Proben zum Widerstand gegen Angst und Einschüchterung — auch gegen magisch erzeugte Furcht (Zauber, Critterkräfte).</p>'),
 # Natürliche Härte
 '52648a83-1d2a-4b04-b7fc-ee5a62bce4f7': d(K(10)+'<p>Unempfindliche Neuralbahnen: <strong>1 Punkt natürlicher Biofeedback-Filter</strong>, kumulativ mit dem Programm Biofeedback-Filter bzw. der Technomancer-Firewall.</p>'),
 # Natürliche Immunität
 '8d558134-210d-4c96-b487-021a44409075': d(K(4)+'<p>Immunität gegen <strong>ein natürliches Toxin oder eine natürliche Krankheit</strong> (mit SL abstimmen): eine Dosis/Exposition alle 6 Stunden bleibt folgenlos, weitere wirken normal, Genesung in halber Zeit. Wirkt nicht gegen magische Toxine/Krankheiten; Trägerschaft bleibt möglich.</p>'),
 'ce7634aa-0729-423d-bc38-d6f56416b904': d(K(10)+'<p>Immunität gegen <strong>ein synthetisches Gift oder eine Designerkrankheit</strong> (mit SL abstimmen): eine Dosis/Exposition alle 6 Stunden bleibt folgenlos, weitere wirken normal, Genesung in halber Zeit. Wirkt nicht gegen magische Toxine/Krankheiten.</p>'),
 # Pathogen-/Toxinresistenz
 'e160111a-5fe3-4154-9d5a-82330c9b32fc': d(K(4)+'<p><strong>+1 Würfel auf Widerstandsproben gegen Pathogene</strong> (Krankheiten).</p>'),
 'c74c9ed8-a917-4809-9e8a-5717dd16619b': d(K(4)+'<p><strong>+1 Würfel auf Widerstandsproben gegen Toxine</strong>.</p>'),
 '5c022754-f7cf-479f-80b2-de8454fd76e4': d(K(8)+'<p><strong>+1 Würfel auf Widerstandsproben gegen Pathogene UND Toxine</strong>.</p>'),
 # Programmier-Genie
 '41cc3e26-ae55-4e28-bd6a-b08866c21424': d(K(10)+'<p>Eine beim Erwerb festgelegte Matrixhandlung (mit Probe) beherrscht der Charakter meisterhaft: <strong>+2 Würfel</strong> auf diese Handlung.</p>'),
 # Rennpilot
 '5c18a150-8e38-4f6d-b4f5-b1b674a3581e': d(K(11)+'<p>Der geborene Fahrer: In Kämpfen/Verfolgungen für 1W6 Minuten <strong>+20 % Geschwindigkeit oder +1 Handling</strong> des Fahrzeugs, plus <strong>+2 Würfel auf Schwierige Manöver und Stunts</strong>. Verlängerung um weitere 1W6 Minuten möglich — kostet das Fahrzeug 1 Kästchen Schaden pro Minute.</p>'),
 # Schnellheilung
 '291efdb6-a8b8-49ce-b2be-72f9d3f8a243': d(K(3)+'<p><strong>+2 Würfel auf alle Genesungs- und Heilungsproben</strong>, die vom oder für den Charakter abgelegt werden (auch magische Heilung).</p>'),
 # Schutzgeist
 'ced3fecf-2277-4b20-b1e0-894162ca9ae2': d(K(5)+'<p>Der Charakter folgt einem Schutzgeist (Totem/Ideal), der Vorteile und Einschränkungen gemäß seines Archetyps verleiht (GRW S. 320 ff.). Nur einer gleichzeitig; Wechsel kostet Karma. Nur für Charaktere mit Magieattribut.</p>'),
 # Soziales Chamäleon
 '9f25cc0a-c47c-49dd-953c-8fe60628bae8': d(K(11)+'<p>Fügt sich mühelos in neue Gruppen ein: <strong>+2 Würfel auf Soziale Proben beim ersten Zusammentreffen</strong> mit einer neuen sozialen Umgebung (danach nicht mehr).</p>'+RUF_MINUS),
 # Talentiert
 '58e3d62a-2073-4af5-b8e0-00c446b3a5ab': d(K(14)+'<p>Besser als die Besten: <strong>Eine</strong> Fertigkeit darf bei der Erschaffung auf 7 gelernt und später bis 13 gesteigert werden. Nur einmal wählbar.</p>'),
 # Technisches Improvisationstalent
 '27c7ea84-bfe4-47e1-8382-38d9a5c8e680': d(K(10)+'<p>Intuitives Technikverständnis: <strong>+2 Würfel auf Proben der Fertigkeitsgruppe Mechanik</strong>; Schwellenwerte für Bauen/Reparieren sinken um 1. Erlaubt improvisierte Kunststücke (kaputte Geräte kurz reaktivieren, Gerätestufe für 1W6 Kampfrunden +1, Einmal-Basteleien …).</p>'),
 # Überlebenswille
 '18d2a522-6460-4654-916b-a96631f11323': d(K('3 pro Stufe (max. 3)')+'<p><strong>+1 Kästchen Überzähliger Schaden pro Stufe</strong> — der Charakter hält mehr aus, bevor er stirbt (Zustandsmonitor und Verletzungsmodifikatoren bleiben unverändert).</p>'),
 # Unauffälligkeit
 '9cffd452-8489-48d5-888c-ac35459d9174': d(K(8)+'<p>Gesicht in der Menge: Schwellenwert für Erinnerungsproben über den Charakter <strong>+1</strong>; Verfolgen/Finden in belebter Umgebung und Herumfragen nach Beschreibung <strong>−2 Würfel</strong> (nicht gegen magische oder Matrixsuchen). Auffällige Merkmale heben den Vorteil auf.</p>'+RUF_MINUS),
 # Vertrautes Terrain
 '823eb204-c155-45a9-bb9a-98dcbe17a707': d(K(10)+'<p>Ein Gebiet, das der Charakter besser kennt als jeder andere. Beim Erwerb einen Effekt wählen: Astrale Akklimatisierung (2 Punkte Hintergrundstrahlung ignorieren), Digitales Territorium (+2 auf Matrixproben im vertrauten Host), Gute Bekannte (+2 Straßenruf bei Verhandlungen), Straßenpolitik (+2 auf Gang-Wissensproben), Transporter (+2 auf Aufholen/Abhängen) oder Unauffindbar (+2 auf Verstecksuche). Mehrfach wählbar.</p>'),
 # Zähigkeit
 '00cc6499-db13-447e-8116-278d317a9e31': de(K(9)+'<p>Steckt mehr weg als andere: <strong>+1 Würfel auf Schadenswiderstandsproben</strong>.</p>',
    'Zähigkeit (+1 Schadenswiderstand)', [ch(MOD+'soak', 1)], 'icons/svg/regen.svg'),
 # Zweisprachig
 'c734e46a-d391-45a6-b022-6f18db5019f1': d(K(5)+'<p>Der Charakter beherrscht eine <strong>zweite Sprache als Muttersprache</strong> (lesen, schreiben, sprechen). Nur bei der Charaktererschaffung wählbar.</p>'),
 # Magieanwender-/Technomancer-Typen
 '0e741331-d776-4be8-abc5-4101228abdef': d(K(30)+'<p><strong>Zauberer:</strong> voller Zugang zur Magie — astrale Wahrnehmung UND Projektion, freie Wahl aus Hexerei, Beschwören und Verzaubern, Zauber wirken, Geister beschwören, Gegenstände verzaubern; kann Schutzgeistern folgen.</p>'),
 '55247bdc-c313-4614-ae15-5012308096ff': d(K(20)+'<p><strong>Adept:</strong> kanalisiert Mana in den eigenen Körper — erhält Kraftpunkte in Höhe des Magieattributs für Adeptenkräfte. Keine astrale Projektion, keine Hexerei/Beschwören/Verzaubern; astrale Wahrnehmung nur über die gleichnamige Kraft.</p>'),
 '9d53e1e4-3f31-40cb-bfbe-4b94f5ba757e': d(K(35)+'<p><strong>Magieradept:</strong> Zauberer und Adept zugleich — Zauber/Rituale/Alchemie wie ein Zauberer, Kraftpunkte müssen mit Karma gekauft werden (max. = Magieattribut). Keine astrale Projektion; astrale Wahrnehmung nur per Adeptenkraft.</p>'),
 'c4b35412-bd91-45b4-b428-29da7edd5ff4': d(K(15)+'<p><strong>Technomancer:</strong> lebende Schnittstelle zur Matrix — Resonanzattribut, Komplexe Formen weben, Sprites kompilieren, die Matrix ohne Deck erleben. Schwund statt Entzug; gefürchtet und begehrt zugleich.</p>'),
 '4adeb2d4-e42e-4b7a-9a5d-3df325ae59a5': d(K(15)+'<p><strong>Aspektzauberer:</strong> auf einen Aspekt der Magie beschränkt — genau EINE Gruppe aus Hexerei, Beschwören oder Verzaubern (unwiderruflich); astrale Wahrnehmung ja, Projektion nein; Antimagie nur mit Hexerei. Gilt in der magischen Gemeinde oft als „unfertig".</p>'),
 # Infizierten-Kräfte
 '59d9baa1-6705-49e8-940b-ea42ffc02692': d(K(9)+'<p><strong>Mimikry</strong> (Infizierten-Kraft): Geräusche exakt imitieren, inklusive Sprache und Tierrufen. Aus dem Gedächtnis erfordert eine Erinnerungsprobe; Durchschauen erfordert eine Wahrnehmungsprobe gegen die Erfolge einer Probe auf Charisma + Magie.</p>'),
 '8dbc6b92-18a7-4007-b37f-295d21f8ab82': d(K(9)+'<p><strong>Psychokinese</strong> (Infizierten-Kraft): Objekte per Geisteskraft bewegen wie mit dem Zauber Zauberfinger — die „magische Hand" hat Stärke und Geschicklichkeit in Höhe der Erfolge einer Probe auf Magie + Willenskraft. Komplexe Handlung, aufrechterhalten.</p>'),
 # ============================== NACHTEILE ==============================
 # Abhängigkeit
 'ea7cced4-a201-44a2-9a1b-e10180b1df81': d(B(4)+'<p><strong>Leichte Abhängigkeit:</strong> monatliches Verlangen (1 Dosis/1 Stunde). Bei gescheiterter Entzugsprobe: Entzugserscheinungen mit <strong>−2 Würfeln</strong> auf Proben mit Geistigen (psychisch) bzw. Körperlichen (körperlich) Attributen, bis das Verlangen gestillt ist.</p>'+RUF_PLUS),
 '9a52a300-4d90-4b1f-a113-d0e40a410063': d(B(9)+'<p><strong>Mittlere Abhängigkeit:</strong> Verlangen alle zwei Wochen (1 Dosis/1 Stunde). Bei Entzug <strong>−4 Würfel</strong> auf Proben mit Geistigen (psychisch) bzw. Körperlichen (körperlich) Attributen.</p>'+RUF_PLUS),
 'b5fa94e6-03fb-4d00-b368-86c318f79c09': d(B(20)+'<p><strong>Schwere Abhängigkeit:</strong> wöchentliches Verlangen (2 Dosen/2 Stunden). Bei Entzug <strong>−4 Würfel</strong> auf Geistige bzw. Körperliche Proben; zusätzlich <strong>dauerhaft −2 auf alle Sozialen Proben</strong> — die Sucht ist kaum zu verbergen.</p>'+RUF_PLUS),
 '0886bbb3-f5a9-4583-bcea-d6723889c80d': d(B(25)+'<p><strong>Ausgebrannt:</strong> tägliches Verlangen (mind. 3 Dosen/3 Stunden). Bei Entzug <strong>−6 Würfel</strong> auf Geistige bzw. Körperliche Proben; zusätzlich <strong>dauerhaft −3 auf alle Sozialen Proben</strong> — jeder sieht die Sucht.</p>'+RUF_PLUS),
 # Allergien
 'b7841930-0c7b-4be4-b1cf-86debc41aa95': d(B(5)+'<p><strong>Allergie (Selten, Leicht):</strong> gegen eine seltene Substanz/Bedingung (z. B. Silber, Gold). Bei Exposition <strong>−2 Würfel auf Proben mit Körperlichen Attributen</strong>; Widerstandsproben gegen Angriffe mit dem Allergen −1.</p>'),
 'f3ad08be-a7a4-4965-bb38-f8db9016c94e': d(B(10)+'<p><strong>Allergie (Selten, Mittel):</strong> starke Schmerzen bei Kontakt — <strong>−4 Würfel auf Körperliche Proben</strong> bei Exposition; Widerstandsproben gegen das Allergen −2.</p>'),
 '84a43000-9ae4-4391-b156-d5fbc9a092de': d(B(15)+'<p><strong>Allergie (Selten, Schwer):</strong> bei Exposition <strong>−4 Würfel auf ALLE Proben</strong> und <strong>1 Kästchen Körperschaden pro Minute</strong> (kein Widerstand); Widerstandsproben gegen das Allergen −3.</p>'),
 'cfdc255a-bb46-4d9c-8960-e4181455f4e3': d(B(20)+'<p><strong>Allergie (Selten, Extrem):</strong> anaphylaktischer Schock — <strong>−6 Würfel auf alle Proben</strong>, <strong>1 Kästchen Körperschaden pro 30 Sekunden</strong> (kein Widerstand; Erste Hilfe/Medizin/magische Heilung stoppt weiteren Schaden); Widerstandsproben gegen das Allergen −4.</p>'),
 'e89db285-8db9-4a9c-80cb-94d87b86a80b': d(B(10)+'<p><strong>Allergie (Häufig, Leicht):</strong> gegen eine häufige Substanz/Bedingung (z. B. Sonnenlicht, Pollen, Soja). Bei Exposition <strong>−2 Würfel auf Körperliche Proben</strong>; Widerstandsproben gegen das Allergen −1.</p>'),
 '90188ca7-0ccb-4198-b199-dcf33e029d74': d(B(15)+'<p><strong>Allergie (Häufig, Mittel):</strong> starke Schmerzen bei Kontakt — <strong>−4 Würfel auf Körperliche Proben</strong> bei Exposition; Widerstandsproben gegen das Allergen −2.</p>'),
 'df14fb6e-456d-4d24-83e8-b1c97576dce2': d(B(20)+'<p><strong>Allergie (Häufig, Schwer):</strong> bei Exposition <strong>−4 Würfel auf ALLE Proben</strong> und <strong>1 Kästchen Körperschaden pro Minute</strong> (kein Widerstand); Widerstandsproben gegen das Allergen −3.</p>'),
 '8a40007a-9876-4998-a7c9-047248cfbc52': d(B(25)+'<p><strong>Allergie (Häufig, Extrem):</strong> anaphylaktischer Schock — <strong>−6 Würfel auf alle Proben</strong>, <strong>1 Kästchen Körperschaden pro 30 Sekunden</strong> (kein Widerstand); Widerstandsproben gegen das Allergen −4.</p>'),
 # Astrales Leuchtfeuer
 '94a09a8d-d582-44f0-9f2c-71f7ba94e767': d(B(10)+'<p>Die astrale Signatur leuchtet weithin: Spuren halten <strong>doppelt so lange</strong>, und der Schwellenwert, sie zu askennen, sinkt um 1. Nur für Charaktere mit Magieattribut.</p>'),
 # Auffälliger Stil
 'a030d7e2-755b-4f71-b848-ad9772fba242': d(B(5)+'<p>Unverwechselbares Merkmal (Tattoos, Akzent, auffällige Ware …): Wer den Charakter identifizieren, verfolgen oder finden will, erhält <strong>+2 Würfel</strong>; Erinnerungsproben über ihn haben Schwellenwert −1. Nicht mit Unauffälligkeit kombinierbar; gilt nicht astral.</p>'),
 # Berüchtigt
 '25356bae-efcc-46c6-9c4f-66909b9b7233': d(B(7)+'<p>Ein dunkler Fleck auf dem Ruf, ob verdient oder nicht: Start mit <strong>3 Punkten Schlechtem Ruf</strong>, die erst nach Beseitigung der Ursache (und Karmazahlung) verschwinden.</p>'),
 # Ehrenkodex
 'dda02333-10e3-4295-9392-691ff3a7bd4a': d(B(15)+'<p>Der Charakter tötet keine Angehörigen einer gewählten Gruppe (z. B. Frauen, Kinder, bestimmte Metatypen) und lässt ihr Töten nicht zu (Charisma + Willenskraft (4), sonst sofort einschreiten; nur nichttödliche Mittel). Jeder überlebende Zeuge erhöht die Prominenz um 1; jeder Tote aus der Gruppe kostet 1 Karma. Varianten: Credo des Assassinen, Kriegerkodex.</p>'),
 # Elfenposer
 '7036225b-d0f0-4c86-85b7-cc4d46943113': d(B(6)+'<p>Ein Mensch, der per Kosmetik-OP als Elf durchgeht. Fliegt es auf, reagieren Elfen feindselig und angeekelt; vorurteilsbehaftete Menschen sehen einen „Rassenverräter". Nur für Menschen.</p>'+RUF_PLUS),
 # Feindliche Geister
 '40c06974-a85b-4f2b-9558-51c140c16d87': d(B(7)+'<p>Eine Geisterart verabscheut den Charakter: <strong>−2 Würfel auf Herbeirufen/Binden</strong> dieser Art, Geister erhalten <strong>+2 auf Widerstand gegen Verbannen</strong>; im Kampf greifen sie ihn zuerst und tödlich an. Nur für Magieanwender.</p>'+RUF_PLUS),
 # Gezeichnet
 '69984296-4057-4a0f-964e-a0efb4bfc7ce': d(B(10)+'<p>Neurologische Schäden durch Schwarzes IC, Psychotropes IC oder BTLs (Auswirkung wählen: Gedächtnisschäden, Blackout, Migräne, Paranoia). Bei jedem VR-Eintauchen/BTL-Konsum Probe auf Konstitution + Willenskraft (4), sonst 6 Stunden (Patzer: 24 h) die gewählte Auswirkung; plus Panikprobe und −2 Schadenswiderstand gegen das auslösende IC.</p>'+RUF_PLUS),
 # Gremlins
 'de12b672-f60a-486d-85f6-b94a80a058da': d(B('4 pro Stufe (max. 4)')+'<p>Technik spinnt in seiner Nähe: Pro Stufe wird <strong>1 Eins weniger für einen Patzer benötigt</strong>, wenn der Charakter ein halbwegs kompliziertes Gerät benutzt. Betrifft nur externe Ausrüstung, keine Bodytech; absichtliche „Sabotage" funktioniert nie.</p>'+RUF_PLUS),
 # Händezittern
 'e96c7280-b9b0-4112-8b65-a3568c7ca13e': d(B(7)+'<p>Tremor: Nach belastenden Situationen Probe auf Geschicklichkeit + Konstitution (4) — scheitert sie, gilt bis zum Ende des Runs <strong>−2 Würfel auf alle Geschicklichkeitsproben</strong>.</p>'),
 # Immunabstoßung
 '13fd45c3-e031-4452-8bf8-31829d2401f9': d(B(12)+'<p>Der Körper wehrt sich gegen Implantate: <strong>Essenzverlust durch Cyberware verdoppelt</strong>, Bioware unmöglich. Erwachte/Technomancer: vor Entzugs-/Schwundproben Probe auf Willenskraft (2), sonst steigt der Entzug/Schwund um +2.</p>'),
 # Inkompetenz
 '216290b9-053d-4f6d-81c9-d1fe8ae346be': d(B(5)+'<p>In einer gewählten Fertigkeitsgruppe (keine Sprach-/Wissensfertigkeiten) gilt der Charakter dauerhaft als <strong>Ahnungslos</strong> — die Gruppe kann nie besessen werden, Ausrüstungsboni greifen nicht. Nur einmal wählbar.</p>'+RUF_PLUS),
 # Kampflähmung
 '62c7ed8f-b534-41e3-84ac-29534826d476': d(B(12)+'<p>Wie eingefroren, wenn es losgeht: <strong>Initiativeergebnis der ersten Kampfrunde halbiert</strong> (abgerundet), <strong>−3 auf Überraschungsproben</strong>, Selbstbeherrschungsproben im Kampf mit Schwellenwert +1. Gilt auch im Astral- und Matrixkampf.</p>'+RUF_PLUS),
 # Niedrige Schmerztoleranz
 '9ba327d2-38c5-4a25-ae44-25e98f0bbf03': de(B(9)+'<p>Besonders schmerzempfindlich: <strong>Verletzungsmodifikator −1 pro 2 Kästchen</strong> Schaden (statt pro 3), körperlich wie geistig.</p>',
    'Niedrige Schmerztoleranz (Verletzungsmod. je 2 Kästchen)', [ch(MOD+'wound_tolerance', -1)], 'icons/svg/downgrade.svg'),
 # Orkposer
 '075447a2-5730-4750-a19f-1a5c6086903d': d(B(6)+'<p>Ein Elf oder Mensch, der sich per OP und Hormonen als Ork ausgibt. Auffliegen bedeutet Feindseligkeit oder eine „Aufnahmeprüfung" bei Orks — und Stigma bei Menschen und Elfen. Nur für Menschen und Elfen.</p>'+RUF_PLUS),
 # Programmier-Niete
 '86b259fd-17c8-4ae5-b246-49782e7c5047': d(B(10)+'<p>Eine bestimmte Matrixhandlung (mit Probe) misslingt notorisch: <strong>−2 Würfel</strong> auf jede Durchführung. Keine Handlungen wählbar, die der Charakter ohnehin nie nutzen würde.</p>'),
 # Schlaflosigkeit
 '0cf25fda-725b-49fd-a8cf-de589e938065': d(B(10)+'<p><strong>Schlaflosigkeit (einfach):</strong> Vor Genesungsproben für Geistigen Schaden Probe auf Willenskraft + Intuition (4). Misslingt sie, <strong>verdoppelt sich die Genesungszeit</strong> und 24 Stunden lang gibt es kein Edge zurück; gelingt sie, gibt es nach 8 Stunden Schlaf 1 Edge zurück.</p>'),
 '149e6bf7-a6b4-4893-b755-4d983372079c': d(B(15)+'<p><strong>Schlaflosigkeit (voll):</strong> Misslingt die Probe auf Willenskraft + Intuition (4), findet <strong>gar keine Genesung Geistigen Schadens</strong> statt (späterer Versuch nötig) und 24 Stunden lang gibt es kein Edge zurück.</p>'),
 # Schwaches Immunsystem
 '0a7bcb95-dd9c-4e3e-ab0a-291a352ac1d4': d(B(10)+'<p>Krankheiten greifen leichter: <strong>Kraft von Krankheiten +2</strong> bei Widerstandsproben. Natürliche Immunität und Pathogen-/Toxinresistenz sind nicht erwerbbar.</p>'+RUF_PLUS),
 # SimSinn-Desorientierung
 'b2210e9a-ab8a-45f9-b5db-13f6923c2d22': d(B(5)+'<p>AR, VR und SimSinn (auch Smartlinks, Simrigs, Bildverbindungen) verursachen Schwindel: <strong>−2 Würfel auf alle Proben</strong> im Zusammenhang damit.</p>'),
 # SIN-Mensch
 '9ac85feb-ae1e-4996-8514-3570d411e1d5': d(B(5)+'<p><strong>Staatliche SIN:</strong> legaler Bürger mit Wahlrecht und Papieren — aber biometrisch registriert, über die Globale SIN-Registratur verfolgbar und mit <strong>15 % Steuern</strong> auf das Bruttoeinkommen.</p>'),
 'd9479e5c-d44a-45b9-8fb4-d1e08a9487b2': d(B(10)+'<p><strong>Kriminelle SIN:</strong> als Verurteilter gebrandmarkt und sendepflichtig — gesellschaftlich geächtet, jederzeit 48 Stunden festhaltbar, bevorzugtes Ziel für untergeschobene Fälle; Magieanwender werden zusätzlich engmaschig überwacht. 15 % Steuern.</p>'+RUF_PLUS),
 '318d2edd-833b-48c5-a3e1-343bf03848a5': d(B(15)+'<p><strong>Eingeschränkte Konzern-SIN:</strong> registrierter Konzernangestellter ohne Aufstiegschancen — global registriert (inkl. Erwachten-Status), Ziel für Extraktionen, angefeindet von SINlosen; <strong>20 % Steuern</strong> an den Konzern.</p>'),
 'e00623e1-54b0-4a91-b234-3c7e141deef4': d(B(25)+'<p><strong>Konzernbürger-SIN:</strong> im Konzern geboren und sozialisiert — in den Schatten ein tödlicher Makel: tiefes Misstrauen bis offene Gewalt, ewige Loyalitätszweifel. 10 % Steuern an den Konzern.</p>'),
 # Sozialstress
 '8ba2830a-3f10-4877-9752-93be051b205b': d(B(8)+'<p>Belastende Emotionen mit definiertem Auslöser stören den Umgang mit anderen: Bei Führung und Gebräuchen wird <strong>1 Eins weniger für einen Patzer benötigt</strong>; der SL verlangt in Auslöser-Situationen zusätzliche Soziale Proben.</p>'),
 # Ungebildet
 'd8362a78-54e9-4dbe-8388-6ba0a7b9df31': d(B(8)+'<p>Nie eine Chance auf Bildung gehabt: Bei Technischen, Akademischen und Berufswissens-Fertigkeiten ohne Punkte gilt <strong>Ahnungslos</strong> (kein Improvisieren); <strong>Lernkosten dieser Kategorien verdoppelt</strong>, Fertigkeitsgruppen daraus womöglich nie erlernbar.</p>'+RUF_PLUS),
 # Ungehobelt
 'f0873c37-4f09-41cd-be81-88e8df5b42ae': d(B(14)+'<p>Impulsiv und taktlos: <strong>−2 Würfel</strong> auf Soziale Proben gegen unangebrachtes Verhalten; <strong>Soziale Fertigkeiten kosten doppelt</strong>, Soziale Fertigkeitsgruppen sind nie erlernbar; ohne Punkte gilt Ahnungslos.</p>'+RUF_PLUS),
 # Unglück
 'bc5f41ca-1549-4367-9c12-afa403182f8c': d(B(12)+'<p>Verflucht: Einmal pro Spielsitzung droht beim Edge-Einsatz (W6: bei 1) der <strong>gegenteilige Effekt</strong> — Bonuswürfel werden zu Abzügen, „Zuerst handeln" wird zu „zuletzt", ein ausgebügelter Patzer wird kritisch.</p>'+RUF_PLUS),
 # Verpflichtungen
 '2b9a495d-b735-416b-a000-f648c3b4191a': d(B(3)+'<p><strong>Verpflichtung (störend):</strong> Nahestehende brauchen gelegentlich Zeit, Geld oder Zuwendung. Lernzeiten und Langzeitprojekte <strong>+50 %</strong>; Lebensstilkosten <strong>+10 %</strong>.</p>'),
 'cc857826-3bb2-466d-987b-7d56a337bc08': d(B(6)+'<p><strong>Verpflichtung (unangenehm):</strong> regelmäßige Fürsorge (z. B. Angehörige im Haushalt). Lernzeiten und Langzeitprojekte <strong>+50 %</strong>; Lebensstilkosten <strong>+20 %</strong>.</p>'),
 '066a2de9-1717-44ca-a8c6-90366890574a': d(B(9)+'<p><strong>Verpflichtung (anspruchsvoll):</strong> intensive Betreuung nahestehender Personen. Lernzeiten und Langzeitprojekte <strong>+50 %</strong>; Lebensstilkosten <strong>+30 %</strong>.</p>'),
 # Verunsichert
 'c9cd05ad-cd3c-451e-8285-e0fb1d95ebc1': d(B(10)+'<p>Vertrauensverlust in eine wichtige Fertigkeit (Stufe 4+): <strong>−2 Würfel</strong> auf Proben damit, Spezialisierungen unbrauchbar, <strong>kein Edge</strong> auf diese Proben.</p>'),
 # Vorurteile
 'd6843e67-0837-4353-a5db-f4c320560ddb': d(B(5)+'<p><strong>Vorurteil (weit verbreitete Gruppe, Voreingenommen):</strong> heimliche Abneigung — <strong>−2 Würfel</strong> auf Soziale Proben mit der Zielgruppe; bei Verhandlungen erhält das Gegenüber +2.</p>'),
 '9a76f104-a472-4b6a-b5b7-a8f5248f65a9': d(B(7)+'<p><strong>Vorurteil (weit verbreitete Gruppe, Offen):</strong> lautstarke Intoleranz — <strong>−4 Würfel</strong> auf Soziale Proben mit der Zielgruppe; das Gegenüber erhält +4 bei Verhandlungen.</p>'),
 '1dc88694-8519-4fb0-b8c9-c5a823084730': d(B(10)+'<p><strong>Vorurteil (weit verbreitete Gruppe, Radikal):</strong> aktiver Hass — <strong>−6 Würfel</strong> auf Soziale Proben mit der Zielgruppe; das Gegenüber erhält +6 bei Verhandlungen.</p>'),
 'b0640207-7965-4f1a-a28c-0dd5e24d2d8c': d(B(3)+'<p><strong>Vorurteil (besondere Zielgruppe, Voreingenommen):</strong> heimliche Abneigung (z. B. gegen Erwachte) — <strong>−2 Würfel</strong> auf Soziale Proben mit der Zielgruppe; das Gegenüber erhält +2 bei Verhandlungen.</p>'),
 '53ddd66b-ad89-43eb-9174-cbff6ed2a9c3': d(B(5)+'<p><strong>Vorurteil (besondere Zielgruppe, Offen):</strong> lautstarke Intoleranz — <strong>−4 Würfel</strong> auf Soziale Proben mit der Zielgruppe; das Gegenüber erhält +4 bei Verhandlungen.</p>'),
 '100cf04a-51e5-477a-a57c-2dae699f7f04': d(B(8)+'<p><strong>Vorurteil (besondere Zielgruppe, Radikal):</strong> aktiver Hass — <strong>−6 Würfel</strong> auf Soziale Proben mit der Zielgruppe; das Gegenüber erhält +6 bei Verhandlungen.</p>'),
}
