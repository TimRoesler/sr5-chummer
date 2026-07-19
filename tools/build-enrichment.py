#!/usr/bin/env python3
"""Baut data/enrichment-*.json aus den Quelldateien tools/enrichment-src/*.py.

Jede Quelldatei definiert ENTRIES: dict[id] -> {"description": html, "effects": [...]}.
Effekte nutzen das SR5-Systemschema (system.applyTo, system.changes[{key,type,value}]).
Beschreibungen sind eigene Paraphrasen (keine GRW-Regeltexte), Werte streng nach GRW.
"""
import json, sys, importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(__file__).resolve().parent / 'enrichment-src'

TARGETS = {'gear': [], 'weapons': [], 'armor': [], 'qualities': []}

def load_entries(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.TARGET, mod.ENTRIES

def main():
    catalogs = {name: {e['id']: e for e in json.load(open(ROOT / 'data' / f'{name}.json'))}
                for name in TARGETS}
    merged = {name: {} for name in TARGETS}
    sys.path.insert(0, str(SRC))
    for path in sorted(SRC.glob('*.py')):
        if path.name.startswith('_'): continue
        target, entries = load_entries(path)
        for item_id, data in entries.items():
            if item_id not in catalogs[target]:
                sys.exit(f'{path.name}: unbekannte ID {item_id}')
            if item_id in merged[target]:
                sys.exit(f'{path.name}: doppelte ID {item_id}')
            merged[target][item_id] = data
    for name, data in merged.items():
        out = ROOT / 'data' / f'enrichment-{name}.json'
        json.dump(data, open(out, 'w'), ensure_ascii=False, indent=1)
        covered = sum(1 for i, e in catalogs[name].items() if e.get('source') == 'SR5' and i in data)
        total = sum(1 for e in catalogs[name].values() if e.get('source') == 'SR5')
        print(f'{out.name}: {len(data)} Einträge; GRW-Abdeckung {covered}/{total}')

if __name__ == '__main__':
    main()
