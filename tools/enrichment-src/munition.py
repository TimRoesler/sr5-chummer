# Munition, Pfeile/Bolzen, Wurfwaffen-Verbrauch + Granaten/Raketen-Spiegel
# (gear-Kategorie "Ammunition", GRW S. 426, 434–438).
TARGET = 'gear'
from _granaten import g, FLASH, GAS, IRRAUCH, RAUCH, SCHOCK, SPLITTER, SPRENG, MINI, AERO, BLEND, RAK_AF, RAK_SPLITTER, RAK_SPRENG, RAKETE, LENK

def d(text): return {'description': text}
MUNI = '<p><em>Schadens- und DK-Modifikator werden zum Schadenscode/DK der Waffe addiert; Munition gilt je Waffenklasse.</em></p>'

ENTRIES = {
 # Ersatzladestreifen
 '75ccb148-e774-429c-b854-a27816439626': d('<p>Ein zusätzliches Magazin für die eigene Waffe — leer geliefert, Munition wird separat gekauft. Wer nachladen will, sollte vorher gefüllte Streifen dabeihaben.</p>'),
 # Schnelllader
 'f87701a0-4ea2-47db-bcac-f5b8396c369e': d('<p>Ein Ring, der einen kompletten Satz Revolverpatronen hält: Damit lädt man einen Revolver mit einer Komplexen Handlung vollständig, statt Kugel für Kugel nachzuschieben. Jeder Schnelllader ist auf sein Waffenmodell angepasst.</p>'),
 # APDS
 'ef9c8aae-26df-4fe6-88b3-79fbb5eb77c5': d('<p><strong>Schaden:</strong> — · <strong>DK:</strong> −4</p><p>Militärische panzerbrechende Unterkalibergeschosse (Armor-Piercing Discarding Sabot), entwickelt für hohe Geschwindigkeit und das Durchschlagen von Körperpanzerung.</p>'+MUNI),
 # Sturmkanone
 '0bf4113c-dedb-411d-8981-7b6af169f056': d('<p>Spezialmunition für Sturmkanonen — die einzige Munitionsart, die diese Waffen verschießen können, und in nichts anderem verwendbar.</p>'+MUNI),
 # Explosivgeschosse
 '1315cecd-1c13-4d69-9828-a3ea535675da': d('<p><strong>Schaden:</strong> +1 · <strong>DK:</strong> −1</p><p>Hohlladungsgeschosse, die beim Aufprall explodieren und zersplittern. Bei einem Kritischen Patzer zündet die Munition fehl: Der Schütze muss dem Waffenschaden selbst widerstehen, der Angriff verfehlt und die Waffe wird zerstört.</p>'+MUNI),
 # Flechette
 '95bff6e2-d788-407b-9069-093250f89fcb': d('<p><strong>Schaden:</strong> +2 · <strong>DK:</strong> +5</p><p>Dicht gepackte Metallsplitter, die als Schrapnellhagel auf das Ziel zufliegen — vernichtend gegen Ungeschützte, schwach gegen gehärtete Panzerung.</p>'+MUNI),
 # Gel
 '0c8d16cb-6e96-4d95-8454-104a36091cf9': d('<p><strong>Schaden:</strong> +0, Geistig · <strong>DK:</strong> +1</p><p>Weniger tödliche Munition aus halbsteifem Gel für die Aufstandsbekämpfung: verursacht Geistigen Schaden und senkt das Körperliche Limit des Ziels um 2 bei Proben auf Niederschlag.</p>'+MUNI),
 # Hohlspitz
 'f486f414-ee2c-46db-92ea-c682861d8fe0': d('<p><strong>Schaden:</strong> +1 · <strong>DK:</strong> +2</p><p>Dum-Dum-Geschosse mit ausgehöhlter Spitze, die beim Aufprall aufpilzen — wirksam gegen Ungepanzerte, bleibt gern in Panzerung stecken.</p>'+MUNI),
 # Injektionspfeile (Munition)
 '638c81a2-328b-4e22-8fb0-ee37c5e2f6c9': d('<p>Pfeile für Pfeilwaffen wie die Parashield-Pfeilpistole, jeder mit einer Dosis Droge oder Toxin (separat kaufen). Verabreichung: mindestens 1 Nettoerfolg gegen ungepanzerte, 3 gegen gepanzerte Ziele (Toxinangriff mit Injektionsvektor).</p>'),
 # Taurus Omni-6 Schwer
 '63AA2CA3-E0B7-4193-8B15-290F6B5DD21E': d('<p>Munition für den Taurus Omni-6 im Schwere-Pistole-Kaliber. Der Revolver kann wahlweise leichte oder schwere Munition verwenden.</p>'+MUNI),
 # Standard
 'b2a0b340-c793-4322-8422-8b03d18a6fae': d('<p>Vollmantelgeschosse für alle üblichen Anwendungen — gewöhnlich zum Töten.</p>'+MUNI),
 # Schocker
 'd9f69780-93eb-41ff-9a9c-893f8c52794e': d('<p><strong>Schaden:</strong> −2, Geistig (Elektro) · <strong>DK:</strong> pauschal −5</p><p>Verursacht elektrischen Geistigen Schaden (Waffenschaden −2); die DK von −5 ersetzt die DK der Waffe, statt sie zu modifizieren.</p>'),
 # Leuchtspur
 'e0d7aea7-52ac-4670-bac3-b13ce144257c': d('<p>Brennende Leuchtspurgeschosse (jedes dritte Geschoss im Streifen) für vollautomatische Waffen: +1 Präzision, wenn mehr als eine Kugel pro Handlungsphase verschossen wird (kumulativ mit Lasermarkierer, nicht mit Smartgun).</p>'),
 # Taserpfeil
 '8afe5065-5815-4a98-b047-2a7fed85db55': d('<p>Ersatzpfeile mit Leitdrähten für Taser.</p>'),
 # DMSO-Gelpacks
 '9bb893c0-2cab-4f7f-a0cf-bdacc940254b': d('<p>Munition für die Ares S-III Super Squirt: Gelpacks mit CO₂-Treibladung, die je eine Dosis eines Kontakt-Toxins oder einer anderen Substanz aufnehmen (separat kaufen).</p>'),
 # Pfeil: Standard
 '9e7a685f-e612-4b6b-955c-a7bc42b23682': d('<p>Standardpfeile für Bögen, erhältlich in Stufen (Pfeilstufe muss der Bogenstufe entsprechen oder darunter liegen).</p>'),
 # Pfeil: Injektion
 '775d2fed-57ab-4e63-b2e4-638ccf4a21d0': d('<p>Bogenpfeil mit Injektionsreservoir für eine Dosis Droge oder Toxin (separat kaufen). Verabreichung: mindestens 1 Nettoerfolg gegen ungepanzerte, 3 gegen gepanzerte Ziele (Injektionsvektor).</p>'),
 # Bolzen: Standard
 'c3c2fa27-36a7-4296-aadd-627078e6e052': d('<p>Standardbolzen für Armbrüste.</p>'),
 # Bolzen: Injektion
 '7d697849-0a11-4a38-8f07-2e5becf8efe0': d('<p>Armbrustbolzen mit Injektionsreservoir für eine Dosis Droge oder Toxin (separat kaufen). Verabreichung wie Injektionspfeil (Injektionsvektor).</p>'),
 # Wurfmesser
 'd9bf2003-1911-4e65-b6a1-8babb761dd85': d('<p>Ausbalancierte Klingen zum Werfen — billig, lautlos und in Mengen tragbar. Geworfen mit der Fertigkeit Wurfwaffen; Schaden (STR+1)K, DK −1.</p>'),
 # Shuriken
 'b4bbdbd3-1f65-44e5-b196-6ccbee1cc182': d('<p>Flache Wurfsterne aus Metall — klein, leicht zu verbergen, lautlos. Geworfen mit der Fertigkeit Wurfwaffen; Schaden (STR+1)K, DK −1.</p>'),
 # Granaten (gear-Spiegel)
 'f4b92e14-fe1f-4be4-ad73-aed10e1f73b4': g(SCHOCK),
 '8e04c493-b04d-4511-ba68-7b2e0edbf3aa': g(FLASH, effects=[BLEND]),
 '7c5e7573-d75e-43e3-949c-cb4c9d70329b': g(SPLITTER),
 'e61c5487-2074-4fc8-8da0-9891b15482e7': g(SPRENG),
 '06798b15-40bb-4464-b6a8-a01466ee9b9e': g(GAS),
 '84c6921e-dfa0-42ca-a01f-87c459ffc000': g(RAUCH),
 'f3472dc1-4c7b-403a-8001-6441bb65a687': g(IRRAUCH),
 'f092fca8-46a9-4351-a06a-362846e6546a': g(SCHOCK, MINI),
 '7c00891f-6554-497d-9726-058d7c4a598e': g(FLASH, MINI, effects=[BLEND]),
 '8e1583bf-4cc5-4498-a800-36cb61d3fb27': g(SPLITTER, MINI),
 'daecdfc8-15d5-4864-9e20-13e4a0dca88e': g(SPRENG, MINI),
 '74284124-57a0-479b-9ab1-3433bdb9e3b7': g(GAS, MINI),
 'b6381691-1a96-4299-b9df-129ffee64c45': g(RAUCH, MINI),
 'e2252b3c-1bae-496e-adbb-f1c3d6e0b32b': g(IRRAUCH, MINI),
 '922c2a9b-88a8-47bf-a3ac-378a0e86be9c': g(SCHOCK, AERO),
 '4d27ebbf-02e8-45e7-9c0a-7151f1e4faae': g(FLASH, AERO, effects=[BLEND]),
 'afde3ea3-2db2-4049-b54a-f471e8c11102': g(SPLITTER, AERO),
 'e7a602bd-33f4-485b-8a18-a253b7e73a77': g(SPRENG, AERO),
 '1ceef439-32d7-4e1b-a13b-0223dfadf784': g(GAS, AERO),
 '13208e69-2cc6-43c4-98ff-e0295cdf3b68': g(RAUCH, AERO),
 '2b58af45-2097-4607-a0d4-e251b64332af': g(IRRAUCH, AERO),
 # Raketen/Lenkraketen (gear-Spiegel)
 '60d28c15-42dd-4837-bc5f-8d8a15393655': d(RAK_AF + RAKETE),
 '4c5be084-c975-42d2-962c-dc2add203b6b': d(RAK_SPLITTER + RAKETE),
 'd5136e8b-bf34-401d-967d-c52f8cc175c1': d(RAK_SPRENG + RAKETE),
 'a42b7377-5a2e-456d-b729-8783873465f0': d(RAK_AF + LENK),
 'bb40694a-59de-4fb8-9cee-697f37377a55': d(RAK_SPLITTER + LENK),
 '838a308e-a638-433e-b5bc-54222fb645c9': d(RAK_SPRENG + LENK),
}
