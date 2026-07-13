#!/usr/bin/env python3
"""Erzeugt ein ZIP für den Bulkimporter des shadowrun5e-Systems ("Import Chummer Data",
Kompendium-Tab) mit eingemergten deutschen Übersetzungen.

Der Importer unterstützt das Chummer-Übersetzungsformat nativ:
  - <translate>   neben <name>  → deutscher Anzeigename (interne Referenzen wie
                                  Waffen-Zubehör laufen weiter über den englischen <name>)
  - <altpage>     neben <page>  → deutsche Seitenzahl (system.description.source)
  - translate=""  an <category> → deutsche Kompendium-Ordnernamen
Die Parser-Logik (Kategorie→Skill-Mapping, Spell-Typen, Drohnen-Erkennung) matcht auf
die englischen Texte, deshalb werden name/category/page selbst NICHT ersetzt, sondern
nur die Übersetzungselemente ergänzt — genau wie Chummer selbst es zur Laufzeit tut.

Aufruf:  python3 make_bulk_zip.py <chummer-data-dir> <ausgabe-zip>
         (de-de_data.xml wird unter ../lang/ relativ zum Daten-Dir gesucht)
"""
import io
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else 'extracted/chummer5a/Chummer/data')
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'chummer-data-de.zip')
LANG = SRC.parent / 'lang' / 'de-de_data.xml'

# Die XML-Dateien, die BulkImporter.Importers tatsächlich laden (ZIP-Root!).
FILES = [
    'actions.xml', 'armor.xml', 'bioware.xml', 'complexforms.xml',
    'critterpowers.xml', 'critters.xml', 'cyberware.xml', 'echoes.xml',
    'gear.xml', 'powers.xml', 'qualities.xml', 'skills.xml',
    'spells.xml', 'vehicles.xml', 'weapons.xml',
]


def merge(data_root, trans_root):
    """Fügt translate/altpage aus dem Übersetzungs-Chunk in den Datenbaum ein."""
    by_id, by_name, by_text = {}, {}, {}
    for el in data_root.iter():
        eid = el.findtext('id')
        name = el.findtext('name')
        if eid and eid.strip():
            by_id.setdefault((el.tag, eid.strip()), el)
        if name and name.strip():
            by_name.setdefault((el.tag, name.strip()), el)
        if len(el) == 0 and el.text and el.text.strip():
            by_text.setdefault((el.tag, el.text.strip()), []).append(el)

    stats = {'translate': 0, 'altpage': 0, 'attr': 0, 'miss': 0}
    for el in trans_root.iter():
        tr, ap = el.find('translate'), el.find('altpage')
        if tr is not None or ap is not None:
            eid = el.findtext('id')
            name = el.findtext('name')
            target = by_id.get((el.tag, eid.strip())) if eid and eid.strip() else None
            if target is None and name and name.strip():
                target = by_name.get((el.tag, name.strip()))
            if target is None:
                stats['miss'] += 1
            else:
                if tr is not None and tr.text and target.find('translate') is None:
                    ET.SubElement(target, 'translate').text = tr.text
                    stats['translate'] += 1
                if ap is not None and ap.text and target.find('altpage') is None:
                    ET.SubElement(target, 'altpage').text = ap.text
                    stats['altpage'] += 1
        # translate-Attribut an Blattelementen (Kategorien, Spezialisierungen)
        attr = el.get('translate')
        if attr and len(el) == 0 and el.text and el.text.strip():
            for target in by_text.get((el.tag, el.text.strip()), []):
                if target.get('translate') is None:
                    target.set('translate', attr)
                    stats['attr'] += 1
    return stats


def main():
    chunks = {}
    for chunk in ET.parse(LANG).getroot().findall('chummer'):
        chunks[chunk.get('file')] = chunk

    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in FILES:
            tree = ET.parse(SRC / fname)
            chunk = chunks.get(fname)
            if chunk is not None:
                stats = merge(tree.getroot(), chunk)
                print(f'{fname}: {stats["translate"]} Namen, {stats["altpage"]} Seiten, '
                      f'{stats["attr"]} Kategorien/Attribute, {stats["miss"]} ohne Treffer')
            else:
                print(f'{fname}: keine Übersetzung vorhanden, unverändert übernommen')
            buf = io.BytesIO()
            tree.write(buf, encoding='utf-8', xml_declaration=True)
            zf.writestr(fname, buf.getvalue())

    print(f'\nGeschrieben: {OUT} ({OUT.stat().st_size // 1024} KiB)')


if __name__ == '__main__':
    main()
