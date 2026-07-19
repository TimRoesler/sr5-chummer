# Biotech & Slap-Patches (GRW S. 454–455). Patches, die an anderen angewendet
# werden, tragen targeted_actor-Status-Effekte (Marker; stufenabhängige Werte
# stehen im Text, da die Effektdaten die gekaufte Stufe nicht kennen).
TARGET = 'gear'

def eff(name, icon, seconds=None):
    data = {'name': name, 'img': icon, 'disabled': False,
            'system': {'applyTo': 'targeted_actor', 'changes': []}}
    if seconds: data['duration'] = {'seconds': seconds}
    return data

ENTRIES = {
 # Vitalmonitor
 'e97c478c-f10a-494e-98ba-0d9c3076cd73': {
  'description': '<p>Misst kontinuierlich Lebenszeichen — Herzfrequenz, Blutdruck, Temperatur — und analysiert Blut-, Schweiß- und Hautproben. Als Armband tragbar oder in Kleidung/Kommlink integrierbar.</p><p><strong>WiFi:</strong> Teilt die Daten mit festgelegten Geräten und kann DocWagon oder einen anderen Notfalldienst alarmieren, wenn die Lebenszeichen einen Schwellenwert unterschreiten.</p>'},
 # Einweg-Spritze
 '6cf42a40-a0cf-4815-82b1-ca30adcbabad': {
  'description': '<p>Kunststoffspritze mit Metallnadel für den Einmalgebrauch. Dient dem Verabreichen von Toxinen mit Injektionsvektor — unkooperative Opfer müssen vorher immobilisiert oder festgehalten werden.</p>'},
 # Medkit
 'ae9c37df-6d82-44c1-aa21-6c87e45e2dc1': {
  'description': '<p>Medikamente, Verbände, Werkzeuge und ein (redseliges) Arzt-Expertensystem für die gängigen Notfälle von Schusswunden bis Vergiftung.</p><p><strong>Regeln:</strong> Die Stufe des Medkits wird zum Limit von Erste-Hilfe-Proben addiert. Stufe 1–3 passt in eine Tasche, Stufe 4+ ist aktenkoffergroß. Muss nach (Stufe) Verwendungen aufgefüllt werden.</p><p><strong>WiFi:</strong> +Stufe Würfelpoolbonus auf Erste Hilfe + Logik, oder das Medkit handelt selbst mit Pool = Stufe × 2 und Limit = Stufe.</p>'},
 # Medkit-Nachfüllpack
 '76aca45d-0d4f-45a3-a532-c47ac0b26b89': {
  'description': '<p>Ersatzbestückung für ein verbrauchtes Medkit: Medikamente, Verbände und Verbrauchsmaterial für (Stufe) weitere Anwendungen.</p>'},
 # Slap-Patch, Antidot-Patch
 '47e12d78-cb99-4e20-aff5-11cbed1e715e': {
  'description': '<p>Selbstklebendes Pflaster. Addiert seine Stufe zu jeder Toxinwiderstandsprobe, die innerhalb von 20 Minuten nach dem Aufkleben abgelegt wird. Das Zeitfenster vor Wirkungseintritt des Toxins ist oft sehr eng.</p><p>Anwendung an Unfreiwilligen erfordert einen erfolgreichen Nahkampfangriff (ohne Schaden) auf nackte Haut.</p>',
  'effects': [eff('Antidot-Patch (+Stufe auf Toxinwiderstand)', 'icons/svg/heal.svg', seconds=1200)]},
 # Slap-Patch, Chem-Patch
 'd1c0cab8-b4ea-4f08-b462-75b18246e1d8': {
  'description': '<p>Ein leeres Slap-Patch, das mit einer Dosis einer Chemikalie oder eines Toxins gefüllt werden kann — zur späteren Anwendung an einem Patienten oder an sich selbst.</p>'},
 # Slap-Patch, Stim-Patch
 '320bd9e3-e261-4a45-aa03-c740b6855e73': {
  'description': '<p>Entfernt (Stufe) Kästchen Geistigen Schaden für (Stufe × 10) Minuten. Danach erleidet der Patient (Stufe + 1) Kästchen Geistigen Schaden, denen nicht widerstanden werden kann. Während der Wirkung ist keine Erholung möglich.</p><p>Häufige Nutzung kann Abhängigkeitsproben erfordern (Abhängigkeitswert 2, Schwellenwert 1).</p>',
  'effects': [eff('Stim-Patch (Geistiger Schaden unterdrückt)', 'icons/svg/upgrade.svg')]},
 # Slap-Patch, Tranq-Patch
 '5e4f9fdf-cf51-4ea1-9de0-8ca4f33af8b1': {
  'description': '<p>Verursacht Geistigen Schaden in Höhe seiner Stufe, dem nur mit Konstitution widerstanden wird. Anwendung an Unfreiwilligen erfordert einen erfolgreichen Nahkampfangriff (ohne Schaden) auf nackte Haut.</p>',
  'effects': [eff('Tranq-Patch', 'icons/svg/sleep.svg')]},
 # Slap-Patch, Trauma-Patch
 '5de1956f-0ec3-4fad-9e9a-d8b90ac1e3f4': {
  'description': '<p>Erlaubt einem sterbenden Patienten sofort eine Stabilisierungsprobe mit Konstitution statt Erste Hilfe oder Medizin.</p><p><strong>WiFi:</strong> Keine Probe nötig — der Patient wird automatisch stabilisiert.</p>',
  'effects': [eff('Trauma-Patch (stabilisiert)', 'icons/svg/regen.svg')]},
}
