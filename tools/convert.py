#!/usr/bin/env python3
"""Konvertiert Chummer5a-Daten-XMLs in JSON-Dateien für das sr5-chummer Modul.

Merged die deutschen Übersetzungen aus lang/de-de_data.xml:
  - name      → deutscher Name (translate), 'en' behält den Originalnamen
  - page      → deutsche Seitenzahl (altpage)
  - source    → deutsches Buchkürzel (altcode)
Erzeugt zusätzlich translations.json für die nachträgliche Übersetzung
der System-Kompendien (Bulkimporter) und der Kategorien in der UI.

Aufruf:  python3 convert.py <pfad-zu-chummer-data-dir> <ausgabe-dir>
         (de-de_data.xml wird unter ../lang/ relativ zum Daten-Dir gesucht)
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else 'extracted/chummer5a/Chummer/data')
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'sr5-chummer/data')
LANG = SRC.parent / 'lang' / 'de-de_data.xml'
OUT.mkdir(parents=True, exist_ok=True)


def text(el, tag, default=''):
    v = el.findtext(tag)
    return v.strip() if v else default


def num(el, tag, default=0):
    v = el.findtext(tag)
    if v is None:
        return default
    try:
        return int(v)
    except ValueError:
        try:
            return float(v)
        except ValueError:
            return default


def clean(d):
    """Leere Werte entfernen, um die JSONs klein zu halten."""
    return {k: v for k, v in d.items() if v not in ('', None, [], {})}


def dump(name, data):
    p = OUT / name
    p.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    size = p.stat().st_size
    n = len(data) if isinstance(data, list) else len(data.keys())
    print(f'{name}: {n} Einträge, {size/1024:.0f} KiB')


def parse(fname):
    return ET.parse(SRC / fname)


# ---------------------------------------------------------------- Übersetzungen
class Translations:
    """Deutsche Übersetzungen aus de-de_data.xml, pro Datendatei."""

    def __init__(self, path):
        self.sections = {}
        if not path.exists():
            print(f'WARNUNG: {path} nicht gefunden – Ausgabe bleibt englisch.')
            return
        root = ET.parse(path).getroot()
        for chum in root.findall('chummer'):
            self.sections[chum.get('file')] = chum

    def _iter_items(self, fname, *paths):
        sec = self.sections.get(fname)
        if sec is None:
            return
        for path in paths:
            coll = sec.find(path)
            if coll is None:
                continue
            yield from coll

    def build(self, fname, *paths):
        """Maps (per id und per Name) → {'de': ..., 'page': ...}."""
        by_id, by_name = {}, {}
        for el in self._iter_items(fname, *paths):
            entry = clean({
                'de': text(el, 'translate'),
                'page': text(el, 'altpage'),
            })
            if not entry:
                continue
            if text(el, 'id'):
                by_id[text(el, 'id')] = entry
            if text(el, 'name'):
                by_name[text(el, 'name')] = entry
        return by_id, by_name

    def categories(self, fname, tag='categories'):
        """Kategorie-Übersetzungen: englischer Name → deutscher Name."""
        sec = self.sections.get(fname)
        out = {}
        if sec is None:
            return out
        coll = sec.find(tag)
        if coll is None:
            return out
        for c in coll:
            if c.text and c.get('translate') and c.get('translate') != c.text:
                out[c.text] = c.get('translate')
        return out


TR = Translations(LANG)

# Buch-Übersetzungen: engl. Code → {'code': altcode, 'de': deutscher Titel}
BOOK_BY_ID, _ = TR.build('books.xml', 'books')
BOOKS = {}
if 'books.xml' in TR.sections:
    for b in TR.sections['books.xml'].find('books'):
        code_el = b.find('altcode')
        BOOKS[text(b, 'name')] = clean({
            'de': text(b, 'translate'),
            'code': code_el.text.strip() if code_el is not None and code_el.text else '',
        })

# engl. Buchcode → deutscher Buchcode (aus books.xml der Daten + altcode)
CODE_MAP = {}


def build_code_map():
    for b in parse('books.xml').getroot().find('books').findall('book'):
        en_name, en_code = text(b, 'name'), text(b, 'code')
        alt = BOOKS.get(en_name, {}).get('code')
        if en_code:
            CODE_MAP[en_code] = alt or en_code


class Section:
    """Übersetzungshelfer für eine Datendatei."""

    def __init__(self, fname, *paths):
        self.by_id, self.by_name = TR.build(fname, *paths)

    def entry(self, el):
        return (self.by_id.get(text(el, 'id'))
                or self.by_name.get(text(el, 'name'))
                or {})

    def de(self, el):
        return self.entry(el).get('de') or text(el, 'name')

    def name_de(self, en_name):
        """Übersetzung für Querverweise (nur Name bekannt)."""
        e = self.by_name.get(en_name) or {}
        return e.get('de') or en_name

    def apply(self, el, d):
        """name/en/page/source eines konvertierten Eintrags eindeutschen."""
        t = self.entry(el)
        de = t.get('de')
        if de and de != d.get('name'):
            d['en'] = d.get('name', '')
            d['name'] = de
        if t.get('page') and d.get('page'):
            d['page'] = t['page']
        if d.get('source'):
            d['source'] = CODE_MAP.get(d['source'], d['source'])
        return d


# Querverweis-Maps (englischer Name → deutscher Name)
S_QUALITIES = Section('qualities.xml', 'qualities')
S_CRITTERPOWERS = Section('critterpowers.xml', 'powers')
S_METATYPES = Section('metatypes.xml', 'metatypes')


# ---------------------------------------------------------------- books
def books():
    out = []
    for b in parse('books.xml').getroot().find('books').findall('book'):
        en_name, en_code = text(b, 'name'), text(b, 'code')
        t = BOOKS.get(en_name, {})
        entry = clean({
            'id': text(b, 'id'),
            'name': t.get('de') or en_name,
            'en': en_name if t.get('de') and t['de'] != en_name else '',
            'code': t.get('code') or en_code,
            'codeEn': en_code if t.get('code') and t['code'] != en_code else '',
        })
        if b.find('hide') is None:
            out.append(entry)
    dump('books.json', out)


# ---------------------------------------------------------------- priorities
def priorities():
    # Übersetzungen: Prioritätseinträge + verschachtelte Talente
    prio_sec = TR.sections.get('priorities.xml')
    talent_tr = {}
    if prio_sec is not None:
        for p in prio_sec.iter('talent'):
            if text(p, 'name') and text(p, 'translate'):
                talent_tr[text(p, 'name')] = text(p, 'translate')

    out = {'heritage': {}, 'talent': {}, 'attributes': {}, 'skills': {}, 'resources': {}}
    for p in parse('priorities.xml').iter('priority'):
        cat = text(p, 'category')
        val = text(p, 'value')
        if cat == 'Heritage':
            metas = []
            for m in p.iter('metatype'):
                variants = [clean({
                    'name': S_METATYPES.name_de(text(v, 'name')),
                    'en': text(v, 'name') if S_METATYPES.name_de(text(v, 'name')) != text(v, 'name') else '',
                    'specialPoints': num(v, 'value'),
                    'karma': num(v, 'karma'),
                }) for v in m.iter('metavariant')]
                metas.append(clean({
                    'name': S_METATYPES.name_de(text(m, 'name')),
                    'en': text(m, 'name') if S_METATYPES.name_de(text(m, 'name')) != text(m, 'name') else '',
                    'specialPoints': num(m, 'value'),
                    'karma': num(m, 'karma'),
                    'metavariants': variants,
                }))
            out['heritage'][val] = metas
        elif cat == 'Talent':
            talents = []
            talents_el = p.find('talents')
            for t in talents_el if talents_el is not None else []:
                quals = [S_QUALITIES.name_de(q.text) for q in t.iter('quality')]
                en_name = text(t, 'name')
                talents.append(clean({
                    'name': talent_tr.get(en_name, en_name),
                    'en': en_name if talent_tr.get(en_name, en_name) != en_name else '',
                    'value': text(t, 'value'),
                    'qualities': quals,
                    'magic': num(t, 'magic'),
                    'resonance': num(t, 'resonance'),
                    'depth': num(t, 'depth'),
                    'spells': num(t, 'spells'),
                    'cfp': num(t, 'cfp'),
                    'skillqty': num(t, 'skillqty'),
                    'skillval': num(t, 'skillval'),
                    'skilltype': text(t, 'skilltype'),
                }))
            out['talent'][val] = talents
        elif cat == 'Attributes':
            out['attributes'][val] = num(p, 'attributes')
        elif cat == 'Skills':
            out['skills'][val] = {'points': num(p, 'skills'), 'groups': num(p, 'skillgroups')}
        elif cat == 'Resources':
            # nur Standard-Tabelle
            if text(p, 'prioritytable', 'Standard') == 'Standard':
                out['resources'][val] = num(p, 'resources')
    dump('priorities.json', out)


# ---------------------------------------------------------------- metatypes
ATTRS = ['bod', 'agi', 'rea', 'str', 'cha', 'int', 'log', 'wil', 'edg', 'mag', 'res', 'dep', 'ini']

def meta_entry(m):
    attrs = {}
    for a in ATTRS:
        mn, mx, aug = num(m, a + 'min'), num(m, a + 'max'), num(m, a + 'aug')
        if mx or mn:
            attrs[a] = [mn, mx, aug]
    quals = [S_QUALITIES.name_de(q.text) for q in m.iter('quality')] if m.find('qualities') is not None else []
    powers = [S_CRITTERPOWERS.name_de(q.text) for q in m.find('powers').iter('power')] if m.find('powers') is not None else []
    return S_METATYPES.apply(m, clean({
        'id': text(m, 'id'),
        'name': text(m, 'name'),
        'karma': num(m, 'karma'),
        'category': text(m, 'category'),
        'attrs': attrs,
        'qualities': quals,
        'powers': powers,
        'walk': text(m, 'walk'),
        'movement': text(m, 'movement'),
        'source': text(m, 'source'),
        'page': text(m, 'page'),
    }))

def metatypes():
    out = []
    for m in parse('metatypes.xml').getroot().find('metatypes').findall('metatype'):
        e = meta_entry(m)
        mv = m.find('metavariants')
        e['metavariants'] = [meta_entry(v) for v in mv.findall('metavariant')] if mv is not None else []
        if not e['metavariants']:
            del e['metavariants']
        out.append(e)
    dump('metatypes.json', out)


# ---------------------------------------------------------------- skills
def skills():
    sec = Section('skills.xml', 'skills')
    group_tr = TR.categories('skills.xml', 'skillgroups')
    # Spezialisierungen: engl. → deutsch (aus den skill-Einträgen der Übersetzung)
    spec_tr = {}
    if 'skills.xml' in TR.sections:
        for sp in TR.sections['skills.xml'].iter('spec'):
            if sp.text and sp.get('translate'):
                spec_tr[sp.text] = sp.get('translate')

    root = parse('skills.xml').getroot()
    groups = [group_tr.get(g.text, g.text) for g in root.find('skillgroups').iter('name')]
    out = []
    for s in root.find('skills').findall('skill'):
        specs = [spec_tr.get(sp.text, sp.text) for sp in s.iter('spec')]
        group = '' if text(s, 'skillgroup') == 'None' else text(s, 'skillgroup')
        d = clean({
            'id': text(s, 'id'),
            'name': text(s, 'name'),
            'attribute': text(s, 'attribute').lower(),
            'category': text(s, 'category'),
            'group': group_tr.get(group, group),
            'groupEn': group if group_tr.get(group, group) != group else '',
            'default': text(s, 'default') == 'True',
            'specs': specs,
            'source': text(s, 'source'),
            'page': text(s, 'page'),
        })
        out.append(sec.apply(s, d))
    dump('skills.json', {'groups': groups, 'skills': out})


# ---------------------------------------------------------------- qualities
def qualities():
    out = []
    for q in parse('qualities.xml').getroot().find('qualities').findall('quality'):
        if q.findtext('hide') is not None:
            continue
        out.append(S_QUALITIES.apply(q, clean({
            'id': text(q, 'id'),
            'name': text(q, 'name'),
            'karma': text(q, 'karma'),   # kann "1,2,3"-Staffeln enthalten
            'category': text(q, 'category'),  # Positive / Negative
            'limit': text(q, 'limit'),
            'chargenonly': q.find('chargenonly') is not None,
            'careeronly': q.find('careeronly') is not None,
            'source': text(q, 'source'),
            'page': text(q, 'page'),
        })))
    dump('qualities.json', out)


# ---------------------------------------------------------------- generic gear-likes
def tech_fields(el):
    return {
        'avail': text(el, 'avail'),
        'cost': text(el, 'cost'),
        'rating': num(el, 'rating'),
        'source': text(el, 'source'),
        'page': text(el, 'page'),
    }

def weapons():
    sec = Section('weapons.xml', 'weapons')
    out = []
    for w in parse('weapons.xml').getroot().find('weapons').findall('weapon'):
        if w.findtext('hide') is not None:
            continue
        out.append(sec.apply(w, clean({
            'id': text(w, 'id'),
            'name': text(w, 'name'),
            'category': text(w, 'category'),
            'type': text(w, 'type'),          # Ranged / Melee
            'accuracy': text(w, 'accuracy'),
            'damage': text(w, 'damage'),
            'ap': text(w, 'ap'),
            'mode': text(w, 'mode'),
            'rc': text(w, 'rc'),
            'ammo': text(w, 'ammo'),
            'reach': text(w, 'reach'),
            'conceal': text(w, 'conceal'),
            **tech_fields(w),
        })))
    dump('weapons.json', out)

def armor():
    sec = Section('armor.xml', 'armors')
    out = []
    for a in parse('armor.xml').getroot().find('armors').findall('armor'):
        if a.findtext('hide') is not None:
            continue
        out.append(sec.apply(a, clean({
            'id': text(a, 'id'),
            'name': text(a, 'name'),
            'category': text(a, 'category'),
            'armor': text(a, 'armor'),
            'armorcapacity': text(a, 'armorcapacity'),
            **tech_fields(a),
        })))
    dump('armor.json', out)

def gear():
    sec = Section('gear.xml', 'gears')
    out = []
    for g in parse('gear.xml').getroot().find('gears').findall('gear'):
        if g.findtext('hide') is not None:
            continue
        out.append(sec.apply(g, clean({
            'id': text(g, 'id'),
            'name': text(g, 'name'),
            'category': text(g, 'category'),
            'minrating': num(g, 'minrating'),
            'maxrating': num(g, 'rating'),
            **tech_fields(g),
        })))
    dump('gear.json', out)

def ware(fname, outname):
    sec = Section(fname, fname.replace('.xml', 's'))
    out = []
    root = parse(fname).getroot()
    items = list(root.iter('bioware' if 'bio' in fname else 'cyberware'))
    for c in items:
        if c.findtext('hide') is not None:
            continue
        name = text(c, 'name')
        if not name:
            continue
        out.append(sec.apply(c, clean({
            'id': text(c, 'id'),
            'name': name,
            'category': text(c, 'category'),
            'ess': text(c, 'ess'),
            'capacity': text(c, 'capacity'),
            'maxrating': num(c, 'rating'),
            **tech_fields(c),
        })))
    dump(outname, out)

def vehicles():
    sec = Section('vehicles.xml', 'vehicles')
    out = []
    for v in parse('vehicles.xml').getroot().find('vehicles').findall('vehicle'):
        if v.findtext('hide') is not None:
            continue
        out.append(sec.apply(v, clean({
            'id': text(v, 'id'),
            'name': text(v, 'name'),
            'category': text(v, 'category'),
            'handling': text(v, 'handling'),
            'speed': text(v, 'speed'),
            'accel': text(v, 'accel'),
            'body': text(v, 'body'),
            'armor': text(v, 'armor'),
            'pilot': text(v, 'pilot'),
            'sensor': text(v, 'sensor'),
            'seats': text(v, 'seats'),
            **tech_fields(v),
        })))
    dump('vehicles.json', out)

def lifestyles():
    sec = Section('lifestyles.xml', 'lifestyles')
    out = []
    for l in parse('lifestyles.xml').getroot().find('lifestyles').findall('lifestyle'):
        out.append(sec.apply(l, clean({
            'id': text(l, 'id'),
            'name': text(l, 'name'),
            'cost': text(l, 'cost'),
            'dice': num(l, 'dice'),
            'multiplier': num(l, 'multiplier'),
            'source': text(l, 'source'),
            'page': text(l, 'page'),
        })))
    dump('lifestyles.json', out)


# ---------------------------------------------------------------- magic/resonance
def spells():
    sec = Section('spells.xml', 'spells')
    out = []
    for s in parse('spells.xml').getroot().find('spells').findall('spell'):
        if s.findtext('hide') is not None:
            continue
        out.append(sec.apply(s, clean({
            'id': text(s, 'id'),
            'name': text(s, 'name'),
            'category': text(s, 'category'),
            'type': text(s, 'type'),
            'range': text(s, 'range'),
            'damage': text(s, 'damage'),
            'duration': text(s, 'duration'),
            'dv': text(s, 'dv'),
            'descriptor': text(s, 'descriptor'),
            'source': text(s, 'source'),
            'page': text(s, 'page'),
        })))
    dump('spells.json', out)

def powers():
    sec = Section('powers.xml', 'powers')
    out = []
    for p in parse('powers.xml').getroot().find('powers').findall('power'):
        if p.findtext('hide') is not None:
            continue
        out.append(sec.apply(p, clean({
            'id': text(p, 'id'),
            'name': text(p, 'name'),
            'points': text(p, 'points'),
            'levels': text(p, 'levels') == 'True',
            'maxlevels': num(p, 'maxlevels'),
            'adeptway': text(p, 'adeptway'),
            'source': text(p, 'source'),
            'page': text(p, 'page'),
        })))
    dump('powers.json', out)

def complexforms():
    sec = Section('complexforms.xml', 'complexforms')
    out = []
    for c in parse('complexforms.xml').getroot().find('complexforms').findall('complexform'):
        if c.findtext('hide') is not None:
            continue
        out.append(sec.apply(c, clean({
            'id': text(c, 'id'),
            'name': text(c, 'name'),
            'target': text(c, 'target'),
            'duration': text(c, 'duration'),
            'fv': text(c, 'fv'),
            'source': text(c, 'source'),
            'page': text(c, 'page'),
        })))
    dump('complexforms.json', out)


# ---------------------------------------------------------------- translations.json
# Für die nachträgliche Übersetzung der System-Kompendien (Bulkimporter)
# und die Kategorie-Anzeige in den Modul-Oberflächen.
TRANSLATION_SOURCES = {
    # Ausgabe-Schlüssel: (Datei, Sammlungs-Pfade)
    'weapons': ('weapons.xml', ['weapons']),
    'weaponaccessories': ('weapons.xml', ['accessories']),
    'armor': ('armor.xml', ['armors']),
    'armormods': ('armor.xml', ['mods']),
    'gear': ('gear.xml', ['gears']),
    'cyberware': ('cyberware.xml', ['cyberwares']),
    'bioware': ('bioware.xml', ['biowares']),
    'qualities': ('qualities.xml', ['qualities']),
    'spells': ('spells.xml', ['spells']),
    'powers': ('powers.xml', ['powers', 'enhancements']),
    'complexforms': ('complexforms.xml', ['complexforms']),
    'critterpowers': ('critterpowers.xml', ['powers']),
    'critters': ('critters.xml', ['metatypes']),
    'metatypes': ('metatypes.xml', ['metatypes']),
    'echoes': ('echoes.xml', ['echoes']),
    'metamagic': ('metamagic.xml', ['metamagics', 'arts']),
    'mentors': ('mentors.xml', ['mentors']),
    'martialarts': ('martialarts.xml', ['martialarts', 'techniques']),
    'programs': ('programs.xml', ['programs']),
    'skills': ('skills.xml', ['skills', 'knowledgeskills']),
    'vehicles': ('vehicles.xml', ['vehicles']),
    'vehiclemods': ('vehicles.xml', ['mods']),
    'lifestyles': ('lifestyles.xml', ['lifestyles']),
    'traditions': ('traditions.xml', ['traditions']),
    'streams': ('streams.xml', ['traditions']),
}

CATEGORY_FILES = ['weapons.xml', 'armor.xml', 'gear.xml', 'cyberware.xml', 'bioware.xml',
                  'qualities.xml', 'spells.xml', 'skills.xml', 'vehicles.xml',
                  'critterpowers.xml', 'critters.xml', 'metatypes.xml', 'programs.xml',
                  'lifestyles.xml']


def translations():
    items = {}
    for key, (fname, paths) in TRANSLATION_SOURCES.items():
        _, by_name = TR.build(fname, *paths)
        # nur echte Übersetzungen aufnehmen
        section = {}
        for en, t in by_name.items():
            entry = {}
            if t.get('de') and t['de'] != en:
                entry['de'] = t['de']
            if t.get('page'):
                entry['page'] = t['page']
            if entry:
                section[en] = entry
        if section:
            items[key] = section

    # Skill-Gruppen & Spezialisierungen zusätzlich (für sr5e-skills-Kompendien)
    skillgroups = TR.categories('skills.xml', 'skillgroups')
    if skillgroups:
        items['skillgroups'] = {en: {'de': de} for en, de in skillgroups.items()}

    categories = {}
    for fname in CATEGORY_FILES:
        cats = TR.categories(fname)
        if cats:
            categories[fname.replace('.xml', '')] = cats

    out = {
        'books': {en_code: {'code': de_code} for en_code, de_code in CODE_MAP.items()},
        'bookNames': BOOKS,
        'categories': categories,
        'items': items,
    }
    dump('translations.json', out)


if __name__ == '__main__':
    build_code_map()
    books()
    priorities()
    metatypes()
    skills()
    qualities()
    weapons()
    armor()
    gear()
    ware('cyberware.xml', 'cyberware.json')
    ware('bioware.xml', 'bioware.json')
    vehicles()
    lifestyles()
    spells()
    powers()
    complexforms()
    translations()
    print('Fertig.')
