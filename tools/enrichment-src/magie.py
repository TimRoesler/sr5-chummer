# Foki, Fokus-/Zauberformeln, Magische Vorräte (GRW S. 316–319, 326).
# Foki-Boni hängen von der Kraftstufe ab → reine Beschreibungen, keine Auto-Effekte.
TARGET = 'gear'

def d(text): return {'description': text}
BINDUNG = lambda mult: f'<p><em>Bindungskosten: Kraftstufe × {mult} Karma. Ein Fokus wirkt nur gebunden und aktiviert; die Summe aktivierter Kraftstufen über dem Magieattribut riskiert Fokusabhängigkeit.</em></p>'
GEIST = '<p>Geisterfokus: Wird bei der Herstellung auf eine Geisterart eingestimmt (unveränderlich) und wirkt nur gegen bzw. für Geister dieser Art.</p>'
ZAUBER = lambda kat: f'<p>Zauberfokus der Kategorie <strong>{kat}</strong>: Wird bei der Herstellung auf diese Zauberkategorie eingestimmt (unveränderlich).</p>'

def spellfoci(kat, ids):
    anti, ritual, spruch, speicher = ids
    return {
     anti: d(ZAUBER(kat)+f'<p><strong>Antimagiefokus:</strong> +Kraftstufe auf Proben zum Bannen von {kat}-Zaubern und auf Zauberwiderstandsproben gegen {kat}-Zauber.</p>'+BINDUNG(2)),
     ritual: d(ZAUBER(kat)+f'<p><strong>Ritualfokus:</strong> +Kraftstufe auf Ritualzaubereiproben (als Leiter oder Teilnehmer), solange kein Zauber einer fremden Kategorie beteiligt ist.</p>'+BINDUNG(2)),
     spruch: d(ZAUBER(kat)+f'<p><strong>Zauberspruchfokus:</strong> +Kraftstufe auf Spruchzaubereiproben mit {kat}-Zaubern.</p>'+BINDUNG(2)),
     speicher: d(ZAUBER(kat)+f'<p><strong>Zauberspeicher:</strong> Hält einen durch ihn gewirkten {kat}-Zauber (Kraftstufe ≤ Fokusstufe) aufrecht — ohne Würfelpoolmalus für den Zauberer. Keine Ritualzauber.</p>'+BINDUNG(2)),
    }

ENTRIES = {
 # Verzauberungsfoki
 '93d81bd8-52bf-4461-b2da-394aca4ce262': d('<p><strong>Alchemiefokus:</strong> +Kraftstufe als Würfelpoolbonus auf Alchemieproben.</p>'+BINDUNG(3)),
 '1efc3ad3-c5d7-4534-ab97-a059f08f1b74': d('<p><strong>Entzauberungsfokus:</strong> In Kontakt mit dem zu entzaubernden Gegenstand +Kraftstufe als Würfelpoolbonus auf die Entzaubernprobe.</p>'+BINDUNG(3)),
 # Metamagiefoki
 '12e54f08-070f-421c-a523-c0088cbafcfc': d('<p><strong>Zentrierungsfokus</strong> (Metamagiefokus, nur Initiaten): +Kraftstufe zum Initiatengrad, wenn die Metamagie Zentrierung für Entzugswiderstandsproben eingesetzt wird.</p>'+BINDUNG(3)),
 'e946041a-0c16-49a5-811f-dfd2fba0ae8f': d('<p><strong>Signaturschleier</strong> (Metamagiefokus, nur Initiaten): +Kraftstufe zum Initiatengrad beim Erhöhen des Schwellenwerts gegen Askennenproben durch Flexible Signatur.</p>'+BINDUNG(3)),
 '62df3c6c-d080-4db9-98c0-24fc5e9a0604': d('<p><strong>Maskierungsfokus</strong> (Metamagiefokus, nur Initiaten): +Kraftstufe als Würfelpoolbonus beim Widerstand gegen Askennenproben durch Maskierung (erhöht nicht die Zahl maskierbarer Foki).</p>'+BINDUNG(3)),
 'ff779a68-a360-4a68-9e57-9a363b5de0d0': d('<p><strong>Formungsfokus</strong> (Metamagiefokus, nur Initiaten): +Kraftstufe zum Magieattribut, wenn bestimmt wird, wie stark Zauber geformt werden können.</p>'+BINDUNG(3)),
 # Kraftfokus
 '62bfb38d-5515-440b-83ed-289ed926d27e': d('<p><strong>Kraftfokus:</strong> Das mächtigste Artefakt seiner Art — addiert seine Kraftstufe zu Hexerei-, Beschwörungs- und Verzauberungswürfelpools sowie zu allen Proben mit dem Attribut Magie. Beliebt als Ring oder Amulett.</p>'+BINDUNG(6)),
 # Qi-Fokus
 'a64c073c-8aa9-4383-b885-267f8ce1ea99': d('<p><strong>Qi-Fokus</strong> (nur Adepten): Auf eine bestimmte Adeptenkraft mit fester Stufe ausgelegt — aktiviert verleiht er die Kraft bzw. erhöht ihre Stufe (bis zum Maximum). Die Kraftstufe des Fokus muss dem Vierfachen der Kraftpunktkosten entsprechen. Auch als Tätowierung, Piercing oder Schmucknarbe ausführbar.</p>'+BINDUNG(2)),
 # Geisterfoki
 '469f16ea-fe25-4f01-b663-166442850018': d(GEIST+'<p><strong>Herbeirufungsfokus:</strong> +Kraftstufe als Würfelpoolbonus auf Herbeirufenproben für die passende Geisterart.</p>'+BINDUNG(2)),
 '5fae16cf-c68c-46e8-91b2-ca5220824ba5': d(GEIST+'<p><strong>Verbannungsfokus:</strong> +Kraftstufe als Würfelpoolbonus auf Verbannenproben gegen die passende Geisterart.</p>'+BINDUNG(2)),
 '082b52f1-9109-40aa-bf0e-8cb364fa2f8c': d(GEIST+'<p><strong>Bindungsfokus:</strong> +Kraftstufe als Würfelpoolbonus auf Bindenproben für die passende Geisterart.</p>'+BINDUNG(2)),
 # Waffenfokus
 '25b0168d-7052-4f76-b8e5-162d67b8ab6e': d('<p><strong>Waffenfokus:</strong> Immer eine Nahkampfwaffe. +Kraftstufe als Würfelpoolbonus auf Nahkampfangriffe; wirkt auch gegen astrale Gestalten und kann aktiviert auf die Astralebene mitgenommen werden (Astralkampf mit Charisma statt Stärke, Schadensart wählbar).</p>'+BINDUNG(3)),
 # Zauberfoki je Kategorie
 **spellfoci('Kampf', ['30bdbf30-929a-4221-9982-f9de8574f87b','e1b66500-1c39-4747-87a6-071b8b1966cc','2f485376-54c1-41be-8678-79cc98e04ebc','39f2f34b-14e2-47f3-8e24-a401015a645a']),
 **spellfoci('Wahrnehmung', ['a56807b8-e430-479d-847d-e0e294b5e937','2c465730-38cb-41d4-9d19-366435fb71bb','90885434-a40c-416d-8eb3-2d93b96414c2','724d1b39-72e9-4df3-aba1-b4ccbe56f32c']),
 **spellfoci('Heilung', ['49e7fc11-d3c6-4021-9162-cdf217a4579a','41842bc7-e48b-446c-b5ce-73f8399f64c0','630114f3-b538-4a4f-ad02-36df0e577d9c','1e024c0b-d43b-49b1-87e0-c4e4474645fe']),
 **spellfoci('Illusion', ['8f69fd55-e5ff-404f-99ec-45a9c8498657','db0e5016-8ae3-4190-ad94-fe3f318f3f3f','aa849313-adf9-4134-b86b-1f6a15f6620f','e491973f-0bb0-4297-9c32-f02a483ecc8e']),
 **spellfoci('Manipulation', ['2f4f52bb-a198-4d7a-ab4c-d82de4f80cbf','7057c240-d998-4b45-a119-de8a3ffaa717','8783e50c-f80b-4efe-b440-d2963b55c54e','d6cae23b-0d69-4505-a98c-a75876b457ed']),
 # Magische Vorräte
 'f8151303-b838-4af1-ba9d-d43ff0892b40': d('<p>Traditionsgemäße Materialien zum Errichten eines dauerhaften Magischen Refugiums der entsprechenden Kraftstufe — vom hermetischen Bibliothekszirkel bis zur schamanischen Medizinhütte. Das Refugium bietet einen geschützten Arbeitsraum für Rituale, Alchemie und Lehre.</p>'),
 'ef37af30-1204-4918-af66-dfbdd33cd045': d('<p>Traditionsgebundene magische Materialien (Kräuter, Talismane, Kristalle …), gemessen in Dram. Reagenzien setzen u. a. Limits bei Spruchzauberei-, Herbeirufen- und Antimagieproben (1 Dram pro Punkt) und speisen Alchemie und temporäre Refugien. Fremde Traditionen nutzen sie nur mit halber Wirkung.</p>'),
 'a1c4884b-b9b2-471e-99fd-6fb31a62ad52': d('<p>Das legendäre magische Metall — der reinste bekannte Manaleiter. Ein Dram Orichalkum entspricht mehreren Dram gewöhnlicher Reagenzien und ist der Standard, in dem magische Macht gemessen wird. Entsprechend begehrt und teuer.</p>'),
}

# Formeln: Bauanleitungen für Foki bzw. Lernvorlagen für Zauber.
FOKUSFORMEL = lambda name: d(f'<p>Die vollständige Konstruktionsformel für einen <strong>{name}</strong>: Materialliste, astrale Muster und Herstellungsschritte für die Verzauberung. Preis: 25 % der Fokuskosten.</p>')
ZFORMEL = lambda kat: d(f'<p>Die schriftliche Formel eines Zaubers der Kategorie <strong>{kat}</strong> — Grundlage, um den Zauber zu erlernen oder alchemistisch aufzubereiten. In Traditionen unterschiedlich notiert, vom hermetischen Traktat bis zum schamanischen Liedzeichen.</p>')
ENTRIES.update({
 '4d620cf5-8443-448a-9e3e-0e887d889789': FOKUSFORMEL('Alchemiefokus'),
 '7676d897-ac6e-40ed-abd1-378ecf2ed36e': FOKUSFORMEL('Entzauberungsfokus'),
 'd597f728-596a-4304-9ea4-e457d6d708f7': FOKUSFORMEL('Zentrierungsfokus'),
 '9b4244d8-621c-4a04-b3a2-74b6181b9d27': FOKUSFORMEL('Signaturschleier'),
 'd19ba087-be20-4d0b-8b73-b8c09ecccfef': FOKUSFORMEL('Maskierungsfokus'),
 '6d512bcd-685f-44c8-bd1b-f17b45354294': FOKUSFORMEL('Formungsfokus'),
 '6afdcc4f-416b-4171-b04a-f202c9736d59': FOKUSFORMEL('Kraftfokus'),
 'd817509a-49fd-41ae-a99d-6501161ee3a2': FOKUSFORMEL('Qi-Fokus'),
 '2003dcde-a778-4447-be67-eabdab02e243': FOKUSFORMEL('Antimagiefokus (Kampf)'),
 '8d589212-a086-4fbf-908a-e3818c75721d': FOKUSFORMEL('Ritualfokus (Kampf)'),
 '4f2b39f9-f219-4735-b69d-786043e249fd': FOKUSFORMEL('Zauberspruchfokus (Kampf)'),
 'ba8fa866-ab50-45d8-b9c3-375d688d9d5f': FOKUSFORMEL('Zauberspeicher (Kampf)'),
 '913f2412-ee15-4a04-a120-ace6346a5221': FOKUSFORMEL('Antimagiefokus (Wahrnehmung)'),
 '65eee2b5-6b25-4f59-9ae5-c5506f3957fe': FOKUSFORMEL('Ritualfokus (Wahrnehmung)'),
 '291da6dd-0791-43e9-8df7-885711f86159': FOKUSFORMEL('Zauberspruchfokus (Wahrnehmung)'),
 '3039945f-bd0c-46e0-8136-2bf5e6b3d4d6': FOKUSFORMEL('Zauberspeicher (Wahrnehmung)'),
 '63066d38-fc93-4696-824a-e1fc146a6a8e': FOKUSFORMEL('Antimagiefokus (Heilung)'),
 '338412ce-1e32-4513-8f37-bd649264b699': FOKUSFORMEL('Ritualfokus (Heilung)'),
 '125316e5-227b-431b-b84d-3f698951ed7a': FOKUSFORMEL('Zauberspruchfokus (Heilung)'),
 '53e90b06-8b7a-4de5-ad00-1f0658219992': FOKUSFORMEL('Zauberspeicher (Heilung)'),
 'aca6fc75-c330-420a-b7e6-2d7c9e41d7c4': FOKUSFORMEL('Antimagiefokus (Illusion)'),
 '78e1ad22-b0cc-415e-acb7-69e6ada79f55': FOKUSFORMEL('Ritualfokus (Illusion)'),
 'b3608901-2f35-4e09-b5b4-d91265a60439': FOKUSFORMEL('Zauberspruchfokus (Illusion)'),
 '890daab7-7e6d-480c-b638-1f208cc10036': FOKUSFORMEL('Zauberspeicher (Illusion)'),
 'fe57e4c5-a6c2-47b9-9444-2099742383f8': FOKUSFORMEL('Antimagiefokus (Manipulation)'),
 '2856260d-e53c-4c99-8d1b-f248d8cf88cd': FOKUSFORMEL('Ritualfokus (Manipulation)'),
 'ef5d5ebe-62f8-4d0a-9e54-fed48629b156': FOKUSFORMEL('Zauberspruchfokus (Manipulation)'),
 '0d308699-7e57-442f-897e-d9f005d14bcd': FOKUSFORMEL('Zauberspeicher (Manipulation)'),
 '59206083-9102-4961-82b0-ebff82e5b7fd': FOKUSFORMEL('Herbeirufungsfokus'),
 'b6d50e0c-8c72-458c-8985-3088300fca1a': FOKUSFORMEL('Verbannungsfokus'),
 '70ce43e0-2182-4f24-bdfd-9bc57c510edb': FOKUSFORMEL('Bindungsfokus'),
 'ead947af-b88b-4b0e-9736-c04d6b21024c': FOKUSFORMEL('Waffenfokus'),
 '6006ea2c-55b2-44cd-88ea-1b2184716485': ZFORMEL('Kampf'),
 'eb5f507b-bc3c-4d51-b140-80a0098a1e8b': ZFORMEL('Wahrnehmung'),
 'ddd25c4d-c165-4840-8525-70197a0fbb3c': ZFORMEL('Heilung'),
 '369de39c-e1e0-4357-ac63-a23a3765f21a': ZFORMEL('Illusion'),
 'c5b7dddf-8e33-401d-998f-fe89956aa75f': ZFORMEL('Manipulation'),
})
