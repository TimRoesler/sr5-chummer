# Waffen (GRW S. 424–434) — Beschreibungen; Werte stehen im Item selbst.
TARGET = 'weapons'

def d(text): return {'description': text}
BOGEN = lambda st: d(f'<p>Traditioneller Lang- oder moderner Compoundbogen der Stufe {st} (Mindeststärke {st}; pro fehlendem Punkt Stärke −3 Würfel). Schaden und Reichweite richten sich nach dem niedrigsten Wert aus Stärke, Bogen- und Pfeilstufe. Archaisch, selten — und komplett hackingsicher. Pfeil einlegen: Einfache Handlung.</p>')

ENTRIES = {
 # Klingenwaffen
 '7c59cf2f-87ea-4dca-95e7-ad17008386a0': d('<p>Zweihändiges Monster aus Wolframlegierung mit ein oder zwei Klingen und optional gefederter Stoßspitze im Griff. Wirkt barbarisch — ist aber mit der Bodytech von 2075 in den richtigen Händen tödlicher als eine Feuerwaffe.</p>'),
 '656906d8-b6a4-47a2-9554-de365097eba0': d('<p>Langes Kampfmesser im KA-BAR-Stil mit geschwärzter Klinge, konstruiert zum Durchstoßen von Panzerung.</p>'),
 '8f266b4c-4035-4ba3-aa89-3289d0f42ce1': d('<p>Das legendäre Zweihandschwert der Samurai — in den Trids trägt es jeder Runner vom Decker bis zum Magier. Ein Klischee, ja. Aber deswegen nicht weniger tödlich.</p>'),
 'eb16de72-e646-4880-aa5b-21a5a0a2b342': d('<p>Das Allzweckschneidwerkzeug in endlosen Stilen und Formen — Waffe der Armen, der Verzweifelten und der Vorsichtigen mit Reserve.</p>'),
 '95fd2fb9-f174-4f03-add9-80e1d947bd5b': d('<p>Scharf, schwer, einhändig — als Wakizashi, Machete, Scimitar oder Jian erhältlich. Weniger beeindruckend als ein Katana, aber besser zu verstecken.</p>'),
 '60f52b1f-6376-49fc-a746-b811c54197e7': d('<p>Eine Klinge am Ende eines langen Stabes — Axtkopf, Gleve oder Speerspitze. Unmöglich zu verbergen, aber beliebt bei Trollen und bei allen, die Trolle auf Distanz halten wollen.</p>'),
 'e5e5e025-8622-406c-a2bb-030ad5392d79': d('<p>Hochwertige Klinge (glatt/gezahnt) mit GPS, Mini-Multitool, Mikrofeuerzeug und Geheimfach im Griff; die geschwärzte Beschichtung kann zwei Stunden phosphoreszieren. <strong>WiFi:</strong> Karten-ARO, GPS-Position, Telefon.</p>'),
 '4ca64aa3-f172-4f0b-8c6d-954ddd1133b1': d('<p>Externe „Sporne": Eine Unterarmscheide verbirgt drei Klingen, ausfahrbar per Muskelbewegung oder WiFi. <strong>WiFi:</strong> Bereitmachen als Freie statt Einfache Handlung.</p>'),
 '16fe95d3-9c66-4ac6-b4e3-562de5e5619e': d('<p>Messerscharfe künstliche Nägel — unauffällig, stilvoll und im Ernstfall eine Klinge, die niemand erwartet.</p>'),
 # Knüppel
 '5af85697-7d67-4bf7-b539-dbd4e63a34d1': d('<p>Die Waffe, nach der die Fertigkeit benannt ist: Axtgriff, Baseballschläger, Montiereisen oder Latte mit Nagel. Notfalls kostenlos am Straßenrand zu finden.</p>'),
 '73c71350-fafe-4f9e-af22-198727241a4d': d('<p>Großer, schwerer Stock aus Hartholz, Stahl oder Komposit — beliebt bei Zauberern mit Hang zum traditionellen Look.</p>'),
 '2eccd04e-e85c-402e-8c3a-80686e9ec217': d('<p>Ausfahrbarer Schlagstock (Handgelenkschwung oder WiFi-Signal); eingezogen deutlich leichter zu verbergen. <strong>WiFi:</strong> Bereitmachen als Freie Handlung.</p>'),
 'b4b3a872-1532-4477-9bf3-76db34dc7bbf': d('<p>Zusammenschiebbarer Metall-/Kompositstab, per Schwung oder WiFi-Befehl ausgefahren und eingerastet — eingezogen so tarnbar wie ein Schwert. <strong>WiFi:</strong> Bereitmachen als Freie Handlung.</p>'),
 'e6d9f23b-f4a4-4ba8-86ea-b3811f87fc82': d('<p>Kleiner federnder Knüppel bzw. flaches Eisen im Lederüberzug — auf Tarnbarkeit gezüchtet (Tarnmodifikator −2).</p>'),
 'c0011883-a35b-4d32-94fd-dbb21e25882f': d('<p>Die Standard-Aufruhrwaffe der Konzern- und Regierungsordnungshüter: Elektrizitätsschaden, 10 Ladungen, Aufladung 1/10 s am Netz. <strong>WiFi:</strong> Induktionsladung 1/Stunde.</p>'),
 # Exotische Nahkampfwaffen
 'c3ea1ed4-b117-4ba7-99eb-7d7b4b130b55': d('<p>Kaum eine Waffe wird auf der Straße mehr gefürchtet: Zwei Meter Monofilamentschnur mit beschwerter Spitze, die Knochen und Panzerung wie Butter schneidet. Bei einem Patzer verfängt sie sich, bei einem Kritischen Patzer trifft man sich selbst. <strong>WiFi:</strong> Freies Bereitmachen, automatischer Rückzug bei Patzern, Präzision +2. (Exotische Nahkampfwaffe)</p>'),
 'fb814f8e-7284-4ae8-b362-63958d6a1921': d('<p>Motorsäge mit monofilamentbeschichteter Kette — gegen Barrieren verdoppelt sich der Schadenscode. Als Waffe unhandlich (Exotische Nahkampfwaffe).</p>'),
 # Waffenlos
 '168c2aa5-c4d9-4fd7-a629-fc70c6720d03': d('<p>Klassischer Schlagring oder moderner „Hardliner-Handschuh" mit Densiplast-Schicht: macht jeden Schlag deutlich härter — und potenziell tödlich (Waffenloser Kampf).</p>'),
 'e789ce47-f1bf-4c08-88b8-3295dddd03b1': d('<p>Isolierte Handschuhe mit Drahtgeflecht: Elektrizitätsschaden bei Schlag oder Berührung (wahlweise normaler waffenloser Schaden). 10 Ladungen, Netzladung 1/10 s. <strong>WiFi:</strong> Induktionsladung 1/Stunde.</p>'),
 # Bögen & Armbrüste
 '2d4e1dae-eedd-426c-84c2-2aba387d98d0': BOGEN(1), 'ad373842-3031-4ecf-a985-d27f67f096d6': BOGEN(2),
 '9c17f382-b1c9-45e1-abe6-9644d477d258': BOGEN(3), 'b6bf94d9-3513-409f-b5aa-29f415fe9fd7': BOGEN(4),
 '47d48423-4042-416d-a9e8-f9b69b2dfa4f': BOGEN(5), '48e0644a-9cdb-4dc6-8cca-c5ef08433177': BOGEN(6),
 'a2445838-ebba-46f7-95a6-ed7e02f8373f': BOGEN(7), 'c28934c2-b82c-4a81-9964-999dc2a66ddd': BOGEN(8),
 '82953b59-7e08-4abb-afe7-7b568d9a07d1': BOGEN(9), '01c3880f-d0a7-4cd5-8460-ba69fc36ae63': BOGEN(10),
 'bc9db3ec-6fa2-407d-ad76-e49daac3c06f': d('<p>Leichte Armbrust mit automatischer Nachladevorrichtung und internem 4-Bolzen-Magazin — präzise, leise, hackingsicher.</p>'),
 '0df17331-7631-4f78-b857-0f3929678db2': d('<p>Mittlere Armbrust mit automatischer Nachladevorrichtung und internem 4-Bolzen-Magazin — der Kompromiss aus Wucht und Handlichkeit.</p>'),
 'db213a06-0430-4711-81a3-5790d5152ba3': d('<p>Schwere Armbrust mit automatischer Nachladevorrichtung und internem 4-Bolzen-Magazin — bringt fast Gewehrwucht, völlig lautlos.</p>'),
 # Taser
 '7d5bcc0b-9ec2-4c87-aaa7-a4d531d7974e': d('<p>Hochbelastbarer Taser mit bis zu 4 drahtgebundenen Pfeilen (20 m): Die Kabelverbindung liefert den stärkeren Schock, Kontakte erlauben den Nahkampfeinsatz (Präz. 3, 8G(e)). <strong>WiFi:</strong> Treffer melden den Zustand des Ziels.</p>'),
 '21628e04-95d0-4ba4-bc66-fcbed5a1bf8e': d('<p>Moderner Taser mit drahtlosen Kondensatorpfeilen: etwas schwächer als der EX-Shocker, dafür schneller im Halbautomatikmodus. <strong>WiFi:</strong> Treffer melden den Zustand des Ziels.</p>'),
 # Holdouts
 '71655ecf-6cb5-4adb-ac96-583b57fa6e9a': d('<p>Die Pistole für Aufsteiger und Debütantinnen: farbwechselnde Beschichtung passend zu Schuhen oder Handtasche, verschießt ausschließlich Flechettemunition. <strong>WiFi:</strong> Farbwechsel als Einfache Handlung.</p>'),
 'f5497ad2-f4aa-4b84-9d1d-a9d2dfe90bfc': d('<p>Kleine, leichte Kompositwaffe für den Bodensatz der Gesellschaft — MAD-Scanner erleiden −2, sie zu entdecken. Die perfekte Wegwerfwaffe.</p>'),
 '0b4c00be-d7bb-4480-b9f4-6300abde27c4': d('<p>Klassischer zweiläufiger Derringer mit übereinanderliegenden Läufen: viel Kraft für die Größe, aber nur eine Kugel pro Lauf. Beide Läufe können als kurze Salve gleichzeitig feuern.</p>'),
 # Leichte Pistolen
 '67474de7-d29b-4b31-a6ae-1e2e981fa5d2': d('<p>Eine der verbreitetsten Pistolen überhaupt; für sie gibt es einen exklusiven Schalldämpfer (750 ¥) mit zusätzlichem −1 auf Entdeckung (gesamt −5).</p>'),
 '93722378-dcb6-4988-ba4e-54ce545644fe': d('<p>Die Spezialkräfte-Version der Light Fire: serienmäßiger Exklusiv-Schalldämpfer (zusätzlich −1) plus integriertes Smartgunsystem — über legale Kanäle kaum zu bekommen.</p>'),
 'cbff618e-6a12-4bab-aaeb-2453706bf42e': d('<p>Leichte Seitenwaffe mit Salvenmodus und abnehmbarer Schulterstütze — beliebt bei Sicherheitsbehörden, wo Schwere und Automatikpistolen schwer erhältlich sind.</p>'),
 '676660a2-3320-4b4a-acaf-f645f2ba6cd7': d('<p>Ehrwürdige Anfängerpistole mit sehr gutem Ruf: billig, leicht zu verbergen, allgegenwärtig — die perfekte Wegwerfwaffe.</p>'),
 '7dff8ab0-c659-4901-ac3b-cb8b4f3839bf': d('<p>Sicherheits-Seitenwaffe mit hocheffizientem Lademechanismus (30 Schuss), abnehmbarer Schulterstütze und Lasermarkierer.</p>'),
 '66955e6e-0b77-4ce0-9e24-6bb637a36541': d('<p>Robuster Revolver mit Wechseltrommeln für leichte (HM, 6K) oder schwere Pistolenmunition (EM, 7K, DK −1) und integriertem Lasermarkierer — der Liebling der Handlader.</p>'),
 # Schwere Pistolen
 '971c711b-db32-4339-9203-865ef38f350e': d('<p>Die neueste Generation der beliebtesten Handfeuerwaffe der Welt: verbesserte Ergonomie plus integriertes Smartgunsystem. Vielleicht nicht besser als die Konkurrenz — aber mit unschlagbarer Markenwiedererkennung.</p>'),
 'b6078372-786c-4aa0-9d16-38541b403730': d('<p>Geschmeidige Flechette-Pistole mit Salvenmodus, integriertem Schalldämpfer und großem Magazin — verschießt Metallsplitter (bereits im Schadenscode eingerechnet).</p>'),
 '6fb39402-3ae3-4a21-9ed1-50b2c2e1b2c8': d('<p>Der ewige Konkurrent der Predator um den Titel der härtesten schweren Pistole — mit eingebautem Lasermarkierer und etwas günstigerem Preis.</p>'),
 '6366691e-c1e0-4d5e-b7a6-1c0371708714': d('<p>Dem legendären M1911A1 nachempfunden, mit elektrischem Zündmechanismus statt beweglicher Teile — der Ruf: außerordentlich zuverlässig.</p>'),
 'c6c02391-12b5-4361-bc24-e1b5afc1ec6e': d('<p>Eher kurzläufige Schrotflinte als Pistole: mit Flechettemunition gelten die Reichweiten Schwerer Pistolen, aber die Schrotflintenregeln (9K(f), DK +4).</p>'),
 '61c59a89-3c51-46b7-880a-933b29394315': d('<p>Laut wie ein Linienflugzeug und doppelt so glänzend — einer der furchterregendsten Revolver der Welt. Die Hülsenversion lebt vom Nervenkitzel des Trommelaufklappens.</p>'),
 # Automatikpistolen
 'cb2afbcc-a1bf-465b-9fc2-c91e1ddfb100': d('<p>Große Magazine, leichte Handhabung: mit integriertem Gasventilsystem 2 und Smartgunsystem eine der beliebtesten Waffen ihrer Klasse.</p>'),
 '0c8076a9-97e3-4583-8385-c32266c25190': d('<p>Klassische Automatikpistole mit tarnbarer Salvenfeuerfähigkeit und ausklappbarer Schulterstütze.</p>'),
 'c8e3d921-45df-4850-8619-7fcca279d774': d('<p>Leichtbau-Polymerpistole mit Vollautomatikmodus — dann aber durch das geringe Gewicht schwer zu kontrollieren. Mit aufmontiertem Lasermarkierer.</p>'),
 # Maschinenpistolen
 'b2eefb04-0e33-4faa-8e92-5c4bcbfc3f16': d('<p>Colts Trideo-Star unter den MPs: ausklappbare Schulterstütze, Lasermarkierer, Gasventilsystem 2 — beliebt bei Sicherheitskräften weltweit.</p>'),
 'de333a81-b997-4b17-ae0d-c221d22a28c7': d('<p>Bullpup-MP der Interpol-Eingreifteams: Spezialkammer (1 RK), feste Schulterstütze und Lampe (Dunkelheitsmodifikatoren −1 Stufe). Besitz ohne Konzerngerichtshof-Mandat ist fast überall ein Verbrechen.</p>'),
 'f9ff7bf6-3ed4-41bd-b934-34e751ecf266': d('<p>Die MP der Wahl vieler Konzern- und Militärsicherheitskräfte: einziehbare Schulterstütze, Smartgunsystem, integrierter Schalldämpfer.</p>'),
 '017d8327-3bce-420a-af24-a2bed3ab0e83': d('<p>Seit den 2050ern die Knarre legendärer Straßensamurai: Gasventilsystem 2, Smartgunsystem, ausziehbare Schulterstütze und integrierter Schalldämpfer.</p>'),
 'be17251c-109c-4fbb-93e6-b59226592536': d('<p>Shin Chou Kyogo — Synonym für japanische Konzernsicherheit: internes Smartgunsystem, ausklappbare Schulterstütze; Standard bei Renrakus Roten Samurai.</p>'),
 'e80cca4e-3210-4e38-b333-6c1cd42d6b54': d('<p>Der in Würde gealterte Nachkomme der israelischen Legende: Salvenmodus, ausklappbare Schulterstütze, aufmontierter Lasermarkierer.</p>'),
 # Sturmgewehre
 'b625833a-88bc-4047-b3fc-bc432d96744b': d('<p>Legendär zuverlässig: zehn Jahre vergraben, ausgraben, losschießen. Als die nanofaxproduzierten AK-147er zu Schlacke schmolzen, feuerten die 97er einfach weiter.</p>'),
 '3a7a90ce-fbb5-4599-a857-b9849eb9769c': d('<p>Entwickelt für Ares Firewatch, heute ein Welt-Bestseller: Unterlauf-Granatwerfer, Smartgunsystem und ein Kammerdesign mit 2 Punkten Rückstoßkompensation.</p>'),
 'e27e14ac-01bb-46e0-8d63-62994052d92c': d('<p>Billig, massenproduziert, ohne Schnickschnack — geliebt von Gangern, Piraten und Profis, die eine Basis zum Modifizieren suchen.</p>'),
 'e39c445a-9657-4e71-949e-a1ea093c3504': d('<p>Äußerst beliebt bei privaten Sicherheitskräften und Konzern-Spezialeinheiten: Lasermarkierer und Gasventilsystem 2 ab Werk.</p>'),
 '01e0eee7-452b-4fd5-abe1-29145da4a5e6': d('<p>Stand der Technik mit elektronischem Feuermechanismus (1 RK), integriertem Schalldämpfer und Smartgunsystem — Standard bei Japanokon-Sicherheit und den Marines des Kaiserreichs.</p>'),
 # Scharfschützengewehre
 '50cec60d-a421-4edd-9baa-d10bfbc08e70': d('<p>Robustes Langstreckengewehr für raue Umgebungen — verzichtet auf alles Versagensanfällige. Feste Schulterstütze mit Schockpolster, abnehmbares Zielfernrohr.</p>'),
 '8c22582e-56ff-4a44-9358-487d8a594833': d('<p>Wandert auf der Grenze zwischen Sturm- und Scharfschützengewehr: Salvenmodus, vielseitig, mit Schockpolster-Schulterstütze und abnehmbarem Zielfernrohr.</p>'),
 'e2649ef2-c9a8-43ac-9f6c-9279e7be2f67': d('<p>Die legendäre Assassinenwaffe: Schalldämpfer, Zielfernrohr, Schockpolster — zerlegbar in Aktenkoffergröße (Gewehre + Logik (6)). Tödlich, aber empfindlich: hektischer Einsatz senkt die Präzision bis zur Rekalibrierung (1 Stunde).</p>'),
 '01d7b203-e57e-4cbd-9f68-a2134683e178': d('<p>Hochleistungs-Jagdgewehr mit Geradzugverschluss, klassischem Holzschaft und aufmontiertem Zielfernrohr — seit Jahrzehnten der Liebling der Jäger. Kein Unterlaufzubehör.</p>'),
 '6098fea5-3069-42b8-9405-80d07578b660': d('<p>Futuristisches, gasbetriebenes Sportgewehr mit eingebautem Zielfernrohr und Schockpolster-Schulterstütze — bevorzugt von Profijägern und Hobbyschützen.</p>'),
 # Schrotflinten
 'c2c0e756-a099-4f9d-b6bb-18f412d670a3': d('<p>Die halbautomatische Straßenflinte für eskalierte Lagen: gasbetrieben mit sekundärem Vorderschaftrepetierer gegen Ladehemmungen.</p>'),
 '5011b79e-8594-4dbe-9768-0db4d11ead2b': d('<p>Die kurzläufige T-250: Tarnmodifikator +4, Reichweiten einer Schweren Pistole, 9K — die Flinte für unter den Mantel.</p>'),
 '622bd915-0e0c-431b-9da5-e0c0c31e2122': d('<p>Militärische Sturmschrotflinte mit gewaltiger Feuerkraft — universell gefürchtet in beengten Umgebungen. 10-Schuss-Streifen oder 24-Schuss-Trommel, aufmontierter Lasermarkierer.</p>'),
 '62221199-7958-4a76-a538-0c8e0a516608': d('<p>Klassische Doppelflinte für den klassischen Sport, in kleiner Stückzahl gebaut: präzise, prestigeträchtig, mit Schockpolster; beide Läufe als kurze Salve gleichzeitig abfeuerbar.</p>'),
 # Spezielle Waffen
 '15ec7fbb-4c22-4cae-a7cd-d2c580a6b447': d('<p>Nichttödliche Chemikalienwaffe: verschießt DMSO-Gelpacks, deren Ladung als Kontakt-Toxin direkt in den Blutkreislauf geht. Abgefeuert mit Pistolen, Reichweiten Leichter Pistolen.</p>'),
 'c884cf55-9a96-459d-a764-f223e1853149': d('<p>Mikrowellen-Schmerzstrahler: wie ein Toxinangriff (Kraft 8, Sofort; Widerstand KON + WIL). Übertrifft die Kraft das Geistige Limit, flieht das Ziel; im Strahl gehaltene Ziele sind außer Gefecht (−Kraft auf alles). 10 Ladungen. <strong>WiFi:</strong> Induktionsladung.</p>'),
 '9c3d9b2e-336e-4c37-b05d-07bea9ae9c3f': d('<p>Die industrielle Standard-Pfeilpistole für Injektionspfeile mit Narcoject oder anderer Ladung. Abgefeuert mit Pistolen, Reichweiten Schwerer Pistolen. <strong>WiFi:</strong> Pfeil meldet Treffer und Injektion.</p>'),
 '8432b006-0496-4930-b966-25ab56feb7e2': d('<p>Druckluft-Pfeilgewehr, entwickelt für nichttödliche Großwildjagd auf Distanz; aufmontiertes Zielfernrohr. Abgefeuert mit Gewehre, Reichweiten Sturmgewehr. <strong>WiFi:</strong> Pfeil meldet Treffer und Injektion.</p>'),
 # Maschinengewehre
 'cb04b4c1-97ff-4984-9bc8-943e5f3ac557': d('<p>Das legendäre LMG der Söldnereinheiten: feste Schulterstütze mit Schockpolster, Lasermarkierer, Gasventilsystem 2. Doppelte Modifikatoren aus unkompensiertem Rückstoß.</p>'),
 'a95df82f-4c48-43b1-8cfe-58d9aedb0b07': d('<p>Gewaltige Feuerkraft im relativ leichten Verbundstoffrahmen — beliebte Sekundärwaffe schwerer Militärfahrzeuge und Statussymbol subtilitätsbefreiter Trolle.</p>'),
 'bcaa065e-3a38-4c14-9839-a24d3aef2cc3': d('<p>Schweres russisches MG der osteuropäischen und nahöstlichen Streitkräfte, primär fahrzeugmontiert; mit abnehmbarem Dreibein (6 RK) für den Bodeneinsatz.</p>'),
 # Kanonen/Werfer
 '504cba24-2141-4879-8062-782332e83386': d('<p>Der klassische Granatwerfer mit integriertem Smartgunsystem — einer der erschwinglichsten seiner Art. <strong>WiFi:</strong> Granaten-WiFi-Zünder auch ohne DNI.</p>'),
 '5b98b55d-c87c-453a-ad87-9b34c8cbf04b': d('<p>Bullpup-Granatwerfer mit Halbautomatikmodus und deutlich mehr Minigranaten im Magazin als die Konkurrenz. <strong>WiFi:</strong> Granaten-WiFi-Zünder auch ohne DNI.</p>'),
 'c6410d5f-def3-4dc6-b5d6-68fff704f7f2': d('<p>Extrem leichter Wegwerf-Raketenwerfer — kurz zuschlagen, Rohr fallen lassen, verschwinden. <strong>WiFi:</strong> Raketen-WiFi-Zünder auch ohne DNI.</p>'),
 '6753f5f1-72c5-41fb-beb6-6c1a37b82f5e': d('<p>Saeder-Krupps militärischer Doppelrohr-Lenkraketenwerfer: zwei Raketen beliebigen Typs gleichzeitig geladen (nie gleichzeitig abgefeuert), internes Smartgunsystem.</p>'),
 '3320c670-23ae-4cce-9c2c-e59d2554ddd7': d('<p>Krimes billige Sturmkanone mit einer großen Portion Attitüde — ab Werk mit Trollmodifikation: die erste Waffe der Sechsten Welt für größere Kunden.</p>'),
 '8b7cce7a-6e85-4e37-b953-9f79a0ae77fe': d('<p>Die verdammt riesige Sturmkanone: verschießt Munition, die sonst in den Hauptgeschützen kleiner Panzer steckt; internes Smartgunsystem.</p>'),
 # Wurfwaffen (weapons-Seite)
 'f096953c-1418-4dd3-887b-71c6a4436583': d('<p>Ausbalancierte Klingen zum Werfen — billig, lautlos und in Mengen tragbar (GES ÷ 2 pro Handlung Bereitmachen). <strong>WiFi:</strong> Mit Smartlink +1 kumulativ je weiterem Wurf aufs selbe Ziel in der Kampfrunde.</p>'),
 'e3b33b2b-3cd4-408d-b579-3a9d73d387f7': d('<p>Flache Wurfsterne aus Metall — klein, verborgen tragbar, lautlos (GES ÷ 2 pro Handlung Bereitmachen). <strong>WiFi:</strong> Mit Smartlink +1 kumulativ je weiterem Wurf aufs selbe Ziel in der Kampfrunde.</p>'),
 # Unterlaufwaffen
 '5df8388e-9ca9-4455-9ac0-3d83ffd77d0d': d('<p>Granatwerfer zur Unterlaufmontage an einem Sturmgewehr — verschießt Minigranaten (Fertigkeit Schwere Waffen).</p>'),
 '7d711605-e6a9-42f9-846b-95ef80e8c575': d('<p>Enterhakenkanone zur Unterlaufmontage: verschießt Enterhaken samt Seil und zieht ihn per interner Winde zurück (Exotische Fernkampfwaffe).</p>'),
}
