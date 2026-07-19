# Toxine (GRW S. 410–412). Effekte sind targeted_actor-Effekte: Sie werden über
# die sr5-dice-flow-Karte per Bestätigung auf das Opfer angewendet (Status-Marker;
# messbare Modifikatoren wie Desorientierung −2 sind hinterlegt). Schaden und
# Toxinwiderstand (KON + WIL + Schutz) werden regulär ausgewürfelt.
TARGET = 'gear'

def eff(name, changes, icon='icons/svg/poison.svg', seconds=None):
    data = {'name': name, 'img': icon, 'disabled': False,
            'system': {'applyTo': 'targeted_actor', 'changes': changes}}
    if seconds: data['duration'] = {'seconds': seconds}
    return data

def ch(key, value):
    return {'key': key, 'type': 'add', 'value': value}

GLOBAL = 'system.modifiers.global'
DESORIENTIERUNG = [ch(GLOBAL, -2)]

def toxin(vektor, geschwindigkeit, durchdringung, kraft, wirkung, fluff):
    return (f'<p><strong>Vektor:</strong> {vektor} · <strong>Geschwindigkeit:</strong> {geschwindigkeit} · '
            f'<strong>Durchdringung:</strong> {durchdringung} · <strong>Kraft:</strong> {kraft}</p>'
            f'<p><strong>Wirkung:</strong> {wirkung}</p><p>{fluff}</p>'
            '<p><em>Toxinwiderstand: Konstitution + Willenskraft (+ Schutz); jeder Erfolg senkt die Kraft um 1.</em></p>')

UEBELKEIT = 'Übelkeit (Verletzungsmodifikatoren 10 Minuten lang verdoppelt; ist die Kraft nach dem Widerstand höher als die Willenskraft, 3 Kampfrunden handlungsunfähig)'
DESO_TEXT = 'Desorientierung (−2 auf alle Handlungen für 10 Minuten)'

ENTRIES = {
 # Brechreiz-Gas
 'ee90d254-cb65-4a03-92e5-abe7037ff5e3': {
  'description': toxin('Inhalation', '3 Kampfrunden', '0', '9', f'{DESO_TEXT}, {UEBELKEIT}.',
   'Der Klassiker der Aufruhrbekämpfung: ein Gas, das Magen und Gleichgewichtssinn rebellieren lässt. Verliert nach 2 Minuten Luftkontakt die Wirkung.'),
  'effects': [eff('Brechreiz-Gas (Desorientierung/Übelkeit)', DESORIENTIERUNG, seconds=600)]},
 # CS-/Tränengas
 '1445f60b-49e1-45c9-98e4-054a79ca80f8': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '0', '8', f'Geistiger Schaden, {DESO_TEXT}, {UEBELKEIT}.',
   'Ein Reizstoff für Augen, Haut und Schleimhäute samt Panikreaktion. Waschen mit Wasser und Seife beendet die Übelkeit vorzeitig; an der Luft nach 2 Minuten wirkungslos.'),
  'effects': [eff('CS-/Tränengas (Desorientierung/Übelkeit)', DESORIENTIERUNG, seconds=600)]},
 # Gamma-Skopolamin
 'e90016cf-cf44-4cd2-9343-c0f2a58e1aa2': {
  'description': toxin('Injektion', 'Sofort', '0', '12',
   'Lähmung (ist die Kraft nach dem Widerstand höher als die Reaktion, 1 Stunde gelähmt; sonst −2 auf alle Handlungen für 1 Stunde). Danach 1 Stunde „Wahrheitsserum": Willenskraft −3 (Minimum 1).',
   'Ein neuromuskulärer Blocker aus der Tollkirsche: Schwindel, Delirium, Lähmung — und anschließend eine gesprächige Stunde.'),
  'effects': [eff('Gamma-Skopolamin (Lähmung)', [], 'icons/svg/paralysis.svg', seconds=3600),
              eff('Gamma-Skopolamin (Wahrheitsserum)', [ch('system.attributes.willpower', -3)], 'icons/svg/daze.svg', seconds=3600)]},
 # Narcoject
 '875bf273-1a0d-4a42-80ab-6547d7a1235a': {
  'description': toxin('Injektion', 'Sofort', '0', '15', 'Geistiger Schaden.',
   'Das beliebte Betäubungsmittel für Pfeilpistolen — wirkt schnell, sauber und ohne Nebenwirkungen.'),
  'effects': [eff('Narcoject', [], 'icons/svg/sleep.svg')]},
 # Neuro-Stun VIII
 '24e87c73-22be-480d-bb79-978277672a1d': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '0', '15', f'Geistiger Schaden, {DESO_TEXT}.',
   'Farb- und geruchloses Standard-Betäubungsgas für Notfalleinsätze. Neuro-Stun VIII wird nach 10 Minuten Luftkontakt unwirksam.'),
  'effects': [eff('Neuro-Stun VIII (Desorientierung)', DESORIENTIERUNG, seconds=600)]},
 # Neuro-Stun IX
 'f81d9a2e-5c2d-49ad-93b4-1a7a71439bf3': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '0', '15', f'Geistiger Schaden, {DESO_TEXT}.',
   'Die stärker flüchtige Variante des Standard-Betäubungsgases: wird schon nach 1 Minute Luftkontakt unwirksam.'),
  'effects': [eff('Neuro-Stun IX (Desorientierung)', DESORIENTIERUNG, seconds=600)]},
 # Neuro-Stun X
 '4ad3f9ea-4ee0-45f8-a57b-ed40c660d0b0': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '−2', '15', f'Geistiger Schaden, {DESO_TEXT}.',
   'Die militärische Ausbaustufe: Durchdringung −2 gegen Schutzsysteme, nach 1 Minute Luftkontakt unwirksam.'),
  'effects': [eff('Neuro-Stun X (Desorientierung)', DESORIENTIERUNG, seconds=600)]},
 # Pepper Punch
 'a79225da-7507-4b40-8cc1-867213a3c7d8': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '0', '11', f'Geistiger Schaden, {UEBELKEIT}.',
   'CS plus Capsaicin als Flüssigspray zur Selbstverteidigung, oft mit RFID-Chips oder Farbstoff zur späteren Identifizierung versetzt. Brennt höllisch in Augen, Nase und Mund.'),
  'effects': [eff('Pepper Punch (Übelkeit)', [], 'icons/svg/fire.svg', seconds=600)]},
 # Seven-7
 '189c3bb8-357b-412a-afc4-ce931ea8871d': {
  'description': toxin('Kontakt, Inhalation', '1 Kampfrunde', '−2', '12', f'Körperlicher Schaden, {DESO_TEXT}, {UEBELKEIT}.',
   'Ein farb- und geruchloses Kampfgas, entwickelt, um chemische Schutzmaßnahmen zu umgehen. Oxidiert nach 10 Minuten Luftkontakt.'),
  'effects': [eff('Seven-7 (Desorientierung/Übelkeit)', DESORIENTIERUNG, 'icons/svg/biohazard.svg', seconds=600)]},
}
