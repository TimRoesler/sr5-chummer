# Drogen (GRW S. 413–415). Effekte sind DEAKTIVIERTE actor-Effekte:
# sr5-dice-flow legt beim "Einnehmen" eine aktivierte Kopie auf dem Actor an.
# Werte streng nach GRW; variable Wirkungsdauern stehen im Text, nicht im Effekt.
TARGET = 'gear'

def eff(name, changes, icon='icons/svg/pill.svg', seconds=None, applyTo='actor', disabled=True):
    data = {'name': name, 'img': icon, 'disabled': disabled,
            'system': {'applyTo': applyTo, 'changes': changes}}
    if seconds: data['duration'] = {'seconds': seconds}
    return data

def ch(key, value):
    return {'key': key, 'type': 'add', 'value': value}

ATTR = 'system.attributes.'
MOD = 'system.modifiers.'
INI_DICE = 'system.initiative.meatspace.dice'
PAIN = lambda n: [ch(MOD + 'pain_tolerance_stun', n), ch(MOD + 'pain_tolerance_physical', n)]

def drug(vektor, geschwindigkeit, dauer, sucht, wirkung, crash, fluff):
    teile = [f'<p><strong>Vektor:</strong> {vektor} · <strong>Geschwindigkeit:</strong> {geschwindigkeit} · '
             f'<strong>Dauer:</strong> {dauer} · <strong>Abhängigkeit:</strong> {sucht}</p>',
             f'<p><strong>Wirkung:</strong> {wirkung}</p>']
    if crash: teile.append(f'<p><strong>Nach dem Rausch:</strong> {crash}</p>')
    teile.append(f'<p>{fluff}</p>')
    return ''.join(teile)

ENTRIES = {
 # Bliss
 '62bffcd7-4a43-45cd-9cf7-3067ba9688f6': {
  'description': drug('Inhalation, Injektion', '1 Kampfrunde', '(6 − Konstitution) Stunden, mindestens 1',
   'Körperlich und Psychisch',
   '−1 Reaktion, −1 auf alle Limits, +1 auf alle Schwellenwerte, Hohe Schmerztoleranz 3 (3 Kästchen werden bei Verletzungsmodifikatoren ignoriert).',
   None,
   'Ein aus Mohn gewonnenes Opiat: Die Welt wird weich und weit weg. Wer Bliss nimmt, sucht Weltflucht — Schmerzen und Sorgen verschwimmen, aber auch Reflexe und Urteilsvermögen.'),
  'effects': [eff('Bliss', [ch(ATTR+'reaction', -1), ch(MOD+'physical_limit', -1), ch(MOD+'mental_limit', -1), ch(MOD+'social_limit', -1), *PAIN(3)])]},
 # Cram
 '8dc829b9-8b94-4510-ab1a-2305cbad69c9': {
  'description': drug('Einnahme, Inhalation', '10 Minuten', '(12 − Konstitution) Stunden, mindestens 1', 'Psychisch',
   '+1 Reaktion, +1W6 Initiativewürfel.',
   'Zusammenbruch mit 6 Kästchen Geistigen Schadens, denen nicht widerstanden werden kann.',
   'Das Standard-Aufputschmittel der Straße. Cram macht hellwach bis zur Paranoia — schnelle Reaktionen, wenig Nachdenken, zittrige Finger.'),
  'effects': [eff('Cram', [ch(ATTR+'reaction', 1), ch(INI_DICE, 1)], 'icons/svg/upgrade.svg')]},
 # Deepweed
 '5f5bc907-ce31-4f34-b7cf-a48d9d5d10b3': {
  'description': drug('Einnahme, Inhalation', 'Sofort', '(6 − Konstitution) Stunden, mindestens 1', 'Körperlich',
   '+1 Willenskraft, +1 Geistiges Limit, −1 Körperliches Limit; Erwachte werden zu astraler Wahrnehmung gezwungen.',
   'Für die Dauer der Wirkung nochmals −1 auf alle Würfelpools und −1 auf alle Limits.',
   'Ein Narkotikum aus einer erwachten Seetang-Art, entwickelt von karibischen Houngans. Für Erwachte gefährlich verführerisch — und ein beliebtes Werkzeug, um Opfer auf Besessenheit vorzubereiten.'),
  'effects': [eff('Deepweed', [ch(ATTR+'willpower', 1), ch(MOD+'mental_limit', 1), ch(MOD+'physical_limit', -1)], 'icons/svg/eye.svg')]},
 # Jazz
 '929c4835-1754-4999-9215-9859e8ec5384': {
  'description': drug('Inhalation', 'Sofort', '10 × 1W6 Minuten', 'Körperlich und Psychisch',
   '+1 Reaktion, +1 Körperliches Limit, +2W6 Initiativewürfel.',
   'Zusammenbruch; für die Dauer der Wirkung zusätzlich Desorientierung (−2 auf alle Handlungen).',
   'Der Ausgleicher für Gesetzeshüter gegen verchromte Straßensamurai, meist als Einzeldosis-Popper. Jazz macht überdreht wie ein Zweijähriger auf Koffein.'),
  'effects': [eff('Jazz', [ch(ATTR+'reaction', 1), ch(MOD+'physical_limit', 1), ch(INI_DICE, 2)], 'icons/svg/lightning.svg')]},
 # Kamikaze
 '098bf489-bea9-4f17-b3d9-aead979fdc32': {
  'description': drug('Inhalation', 'Sofort', '10 × 1W6 Minuten', 'Körperlich',
   '+1 Konstitution, +1 Geschicklichkeit, +2 Stärke, +1 Willenskraft, +2 Körperliches Limit, +2W6 Initiativewürfel, Hohe Schmerztoleranz 3.',
   'Zusammenbruch: −1 Reaktion, −1 Willenskraft, −2 auf alle Limits für die Dauer der Wirkung sowie 6 Kästchen Geistiger Schaden, denen nicht widerstanden werden kann.',
   'Eine Designer-Kampfdroge. Kamikaze-Konsumenten fühlen sich unbesiegbar und ignorieren ihr eigenes Wohlergehen — unterhaltsam, solange man nicht in ihrer Angriffsrichtung steht.'),
  'effects': [eff('Kamikaze', [ch(ATTR+'body', 1), ch(ATTR+'agility', 1), ch(ATTR+'strength', 2), ch(ATTR+'willpower', 1), ch(MOD+'physical_limit', 2), ch(INI_DICE, 2), *PAIN(3)], 'icons/svg/explosion.svg')]},
 # Long Haul
 'd4cf626d-0af1-41f7-bec0-e53b4dba2eb1': {
  'description': drug('Injektion', '10 Minuten', '4 Tage', 'Psychisch',
   'Schaltet das Schlafbedürfnis aus: vier Tage wach ohne Müdigkeits- oder Erschöpfungsmodifikatoren.',
   'Danach 8W6 Stunden Tiefschlaf. Eine zweite Dosis direkt im Anschluss hält weitere 1W6÷2 Tage wach, kostet dann aber 10 Kästchen Geistigen Schaden (kein Widerstand) vor dem Tiefschlaf.',
   'Synthetisierte Hormone gegen den Schlaf — das Werkzeug für lange Nächte im Labor, am Deck oder auf Wache.'),
  'effects': [eff('Long Haul', [], 'icons/svg/sun.svg', seconds=345600)]},
 # Nitro
 'd7ec13fa-8601-4f9c-a59c-6a86573b40ee': {
  'description': drug('Inhalation', '1 Kampfrunde', '10 × 1W6 Minuten', 'Körperlich und Psychisch',
   '+2 Stärke, +2 Willenskraft, +2 auf Wahrnehmungsproben, +2 Körperliches Limit, Hohe Schmerztoleranz 6.',
   '−2 auf alle Limits für die Dauer der Wirkung sowie 9 Kästchen Geistiger Schaden, denen nicht widerstanden werden kann.',
   'Ein bei Trollgangs beliebter Hochleistungs-Cocktail, der einen Konsumenten leicht umbringen kann. Der Wahrnehmungsbonus (+2) gilt auf Proben und ist hier nicht als Attributsänderung hinterlegt.'),
  'effects': [eff('Nitro', [ch(ATTR+'strength', 2), ch(ATTR+'willpower', 2), ch(MOD+'physical_limit', 2), *PAIN(6)], 'icons/svg/fire.svg')]},
 # Novacoke
 '836f54d5-1e11-49ea-b115-34c14ed843c9': {
  'description': drug('Inhalation, Injektion', '1 Kampfrunde', '(10 − Konstitution) Stunden, mindestens 1', 'Körperlich und Psychisch',
   '+1 Reaktion, +1 Charisma, +1 auf Wahrnehmungsproben, +1 Soziales Limit, Hohe Schmerztoleranz 1.',
   'Charisma und Willenskraft sinken für die Dauer der Wirkung auf 1, alle Limits um 1.',
   'Das Partypulver der Sechsten Welt, gewonnen aus der Cocapflanze — charmant, wach, unbesiegbar. Bis der Absturz kommt.'),
  'effects': [eff('Novacoke', [ch(ATTR+'reaction', 1), ch(ATTR+'charisma', 1), ch(MOD+'social_limit', 1), *PAIN(1)], 'icons/svg/upgrade.svg')]},
 # Psyche
 '778eefae-94ad-4f8c-ad03-8b9039b5c48e': {
  'description': drug('Einnahme', '10 Minuten', '(12 − Konstitution) Stunden, mindestens 1', 'Psychisch',
   '+1 Intuition, +1 Logik, +1 Geistiges Limit; Erwachte erhalten nur −1 statt −2 pro aufrechterhaltenem Zauber.',
   None,
   'Die Denkdroge für Zauberer und Technomancer: hyperfokussiert und distanziert zugleich, gern in Details verloren.'),
  'effects': [eff('Psyche', [ch(ATTR+'intuition', 1), ch(ATTR+'logic', 1), ch(MOD+'mental_limit', 1)], 'icons/svg/daze.svg')]},
 # Zen
 '3a946800-be1e-4bbb-899a-c3d1c48a3a31': {
  'description': drug('Inhalation', '5 Minuten', '10 × 1W6 Minuten', 'Psychisch',
   '−2 Reaktion, +1 Willenskraft, −1 Würfelpool auf körperliche Handlungen.',
   None,
   'Ein psychedelisches Halluzinogen für Realitätsflüchtige und Trancesucher. Der Körper wird träge, der Geist weit.'),
  'effects': [eff('Zen', [ch(ATTR+'reaction', -2), ch(ATTR+'willpower', 1)], 'icons/svg/sleep.svg')]},
}
