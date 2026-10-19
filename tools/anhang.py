"""Falsche Fährten (G1 bis G12) und Nebenstränge (N1 bis N8) aus dem Anhang, damit man sie in der App antippen kann.

Aufruf: python3 tools/anhang.py
Liest quellen/handbuch/anhaenge.md und schreibt data/anhang.js.
"""
import json
import pathlib
import re

WURZEL = pathlib.Path(__file__).resolve().parent.parent


def main():
    zeilen = (WURZEL / 'quellen' / 'handbuch' / 'anhaenge.md').read_text().splitlines()
    eintraege, aktuell = {}, None
    for z in zeilen:
        m = re.match(r'^### ([GN]\d{1,2}) · (.+)$', z)
        if m:
            aktuell = m.group(1)
            eintraege[aktuell] = {'titel': f'{m.group(1)} · {m.group(2).strip()}', 'md': []}
            continue
        if z.startswith('## ') or z.startswith('### '):
            aktuell = None
            continue
        if aktuell:
            eintraege[aktuell]['md'].append(z)
    for e in eintraege.values():
        e['md'] = '\n'.join(e['md']).strip()
    ziel = WURZEL / 'data' / 'anhang.js'
    ziel.write_text('// Erzeugt von tools/anhang.py aus dem Reiter Anhänge des Handbuchs. Nicht von Hand ändern.\n'
                    'window.LAHNREIT_ANHANG = ' + json.dumps(eintraege, ensure_ascii=False, indent=1) + ';\n')
    print(len(eintraege), 'Einträge:', ' '.join(eintraege))


if __name__ == '__main__':
    main()
