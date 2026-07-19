# Gemeinsame Texte für Granaten/Raketen (gear "Ammunition" + weapons)
# Granaten, Raketen, Lenkraketen (GRW S. 435–437). Flash-Pack trägt einen
# targeted_actor-Blend-Marker (der Modifikator gilt nur auf Angriffsproben und
# ist daher bewusst NICHT als globaler Poolmodifikator hinterlegt).

BLEND = {'name': 'Geblendet: Flash-Pack (−4 Angriffe)', 'img': 'icons/svg/blind.svg',
         'disabled': False, 'system': {'applyTo': 'targeted_actor', 'changes': []}}

FLASH = ('<p><strong>Schaden:</strong> Speziell (Blendung) · <strong>Sprengwirkung:</strong> Speziell</p>'
         '<p>Kein Sprengkörper, sondern ein zigarettenschachtelgroßes Stroboskop mit vier Quarz-Halogen-Blitzern. '
         'Wer in seine Richtung schaut, erleidet <strong>−4 auf alle Angriffsproben</strong> '
         '(Blitzkompensation in Sichtgeräten: −2; in Cyberaugen/Retinamodifikation: −1). '
         '10 Ladungen, 1 Ladung pro Kampfrunde; lädt am Stromnetz 1 Ladung pro 10 Sekunden.</p>'
         '<p><strong>WiFi:</strong> Angemeldete Verbündete erleiden nur die halben Blendmodifikatoren; Induktionsladung 1/Stunde.</p>')
GAS = ('<p><strong>Schaden:</strong> wie Chemikalie · <strong>Sprengwirkung:</strong> 10 m Radius</p>'
       '<p>Setzt statt einer Explosion eine Gaswolke frei — üblicherweise CS-/Tränengas, aber jedes andere Toxin ist möglich '
       '(separat kaufen; dessen Effekt gilt für alle in der Wolke). Die Wolke hält etwa 4 Kampfrunden '
       '(kürzer bei Wind, länger in geschlossenen Räumen).</p>')
IRRAUCH = ('<p><strong>Sprengwirkung:</strong> 10 m Radius</p>'
           '<p>Wie die Rauchgranate, aber mit heißen Partikeln im Rauch, die auch Infrarotsicht behindern '
           '(Sichtbarkeitsmodifikatoren für IR-Rauch). Die Wolke hält etwa 4 Kampfrunden.</p>')
RAUCH = ('<p><strong>Sprengwirkung:</strong> 10 m Radius</p>'
         '<p>Erzeugt eine dichte Rauchwolke mit 10 m Radius, die die Sicht einschränkt '
         '(Sichtbarkeitsmodifikatoren für Rauch). Die Wolke hält etwa 4 Kampfrunden '
         '(kürzer bei Wind, länger in geschlossenen Räumen).</p>')
SCHOCK = ('<p><strong>Schaden:</strong> 10G(e) · <strong>DK:</strong> −4 · <strong>Sprengwirkung:</strong> 10 m Radius (gleichmäßig)</p>'
          '<p>„Betäubungsgranate": explodiert mit grellem Blitz und Druckwelle, die sich gleichmäßig über den ganzen Radius '
          'ausbreitet — der Schaden fällt nicht mit der Entfernung ab.</p>')
SPLITTER = ('<p><strong>Schaden:</strong> 18K(f) · <strong>DK:</strong> +5 · <strong>Sprengwirkung:</strong> −1/m</p>'
            '<p>Der klassische Tötungsapparat: eine Schrapnellwolke über einen großen Bereich, verheerend gegen weiche Ziele, '
            'wenig wirksam gegen Panzerung (Flechette-Regeln).</p>')
SPRENG = ('<p><strong>Schaden:</strong> 16K · <strong>DK:</strong> −2 · <strong>Sprengwirkung:</strong> −2/m</p>'
          '<p>Reine Druckwelle und konzentrierte Zerstörung rund um den Detonationspunkt.</p>')
MINI = ('<p>Minigranaten sind für Granatwerfer gebaut: Sie werden nach 5 Metern Flugbahn scharf und explodieren beim Aufprall '
        '(außer mit Airburst-Verbindung). Wirkung und Preis wie die Standardgranate.</p>')
AERO = '<p>Aerodynamische Bauform für größere Wurfreichweite (Reichweitenkategorie „Aerodynamische Granate").</p>'
WERFEN = '<p><em>Geworfen mit Wurfwaffen, verschossen mit Schwere Waffen (Granatwerfer); Streuregeln für Granaten beachten.</em></p>'

def g(text, extra='', effects=None):
    e = {'description': text + extra + WERFEN}
    if effects: e['effects'] = effects
    return e

RAK_AF = ('<p><strong>Schaden:</strong> 24K · <strong>DK:</strong> −10 gegen Fahrzeuge/Barrieren, −4 sonst · <strong>Sprengwirkung:</strong> −4/m</p>'
          '<p>Hohlladung, die sich durch Fahrzeuge und Barrieren brennt; die Sprengwirkung drumherum bleibt begrenzt.</p>')
RAK_SPLITTER = ('<p><strong>Schaden:</strong> 23K(f) · <strong>DK:</strong> +5 · <strong>Sprengwirkung:</strong> −1/m</p>'
                '<p>Antipersonen-Sprengkopf: Kunststoff- und Metallsplitter mit hoher Geschwindigkeit — hochwirksam gegen '
                'ungeschützte Personen, kaum gegen Barrieren und Fahrzeuge.</p>')
RAK_SPRENG = ('<p><strong>Schaden:</strong> 21K · <strong>DK:</strong> −2 · <strong>Sprengwirkung:</strong> −2/m</p>'
              '<p>Schwerer Flächenschaden wie eine große Sprenggranate; gegen gehärtete Ziele wenig effektiv.</p>')
RAKETE = '<p><em>Raketen werden nach 10 m Flug scharf und explodieren beim Aufprall; Abfeuern mit Schwere Waffen.</em></p>'
LENK = '<p><em>Lenkrakete mit internem Zielführungssystem (Werte wie die Rakete, Verfügbarkeit +4, Aufpreis nach Sensorstufe).</em></p>'

