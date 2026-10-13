"""Kurzfassungen (oberste Ebene der App) zusammenführen und prüfen.

Aufruf: python3 tools/kurz.py
Liest quellen/kurz/*.json, prüft, ob jede Liste noch zum Handbuch-Stand in data/lahnreit-daten.js passt
(gleiche Länge, gleiche Reihenfolge), und schreibt data/kurz.js. Weicht etwas ab, nennt es das Skript;
dann die betroffene Kurzfassung in quellen/kurz/ nachziehen.
"""
import json
import pathlib
import sys

WURZEL = pathlib.Path(__file__).resolve().parent.parent
QUELLE = WURZEL / 'quellen' / 'kurz'


def lade_daten():
    roh = (WURZEL / 'data' / 'lahnreit-daten.js').read_text()
    start = roh.index('window.LAHNREIT = ') + len('window.LAHNREIT = ')
    return json.loads(roh[start:].rstrip().rstrip(';'))


def lade(name):
    return json.loads((QUELLE / name).read_text())


def main():
    D = lade_daten()
    personen, szenen = {}, {}
    for n in ('personen-1.json', 'personen-2.json'):
        personen.update(lade(n))
    for n in ('szenen-1.json', 'szenen-2.json', 'szenen-3.json', 'szenen-4.json'):
        szenen.update(lade(n))
    orte = lade('orte.json')
    fehler = []

    pids = {p['id'] for p in D['personen']['personen']}
    for pid in sorted(pids - set(personen)):
        fehler.append(f'{pid}: keine Kurzfassung')

    for s in D['szenen']['szenen']:
        k = szenen.get(s['id'])
        if not k:
            fehler.append(f"{s['id']}: keine Kurzfassung")
            continue
        e = s['ebenen']
        paare = [('leute', s['leute'])] + [(f, e.get(f) or []) for f in ('ablauf', 'hinweise', 'funde', 'haeuser', 'proben', 'gespraeche', 'mehr')]
        for feld, liste in paare:
            if len(k.get(feld) or []) != len(liste):
                fehler.append(f"{s['id']}.{feld}: {len(k.get(feld) or [])} kurz, {len(liste)} im Handbuch")
        kurz_h = k.get('haeuser') or []
        for j, h in enumerate(e.get('haeuser') or []):
            if j < len(kurz_h) and len(kurz_h[j].get('funde') or []) != len(h.get('funde') or []):
                fehler.append(f"{s['id']}.haeuser[{j}].funde: Länge passt nicht")

    for code, o in D['dorf']['orte'].items():
        k = orte['orte'].get(code)
        if not k:
            fehler.append(f'{code}: keine Kurzfassung')
        elif len(k.get('gibt') or []) != len(o.get('gibt') or []):
            fehler.append(f"{code}.gibt: {len(k.get('gibt') or [])} kurz, {len(o.get('gibt') or [])} im Handbuch")
    if len(orte['nebenfiguren']) != len(D['dorf']['sonst']):
        fehler.append(f"nebenfiguren: {len(orte['nebenfiguren'])} kurz, {len(D['dorf']['sonst'])} im Handbuch")

    for f in fehler:
        print('passt nicht:', f)
    gesamt = {'personen': personen, 'szenen': szenen, 'orte': orte['orte'], 'nebenfiguren': orte['nebenfiguren']}
    text = json.dumps(gesamt, ensure_ascii=False, separators=(',', ':'))
    (WURZEL / 'data' / 'kurz.js').write_text(
        '// Erzeugt von tools/kurz.py aus quellen/kurz/*.json. Nicht von Hand ändern.\n'
        f'window.LAHNREIT_KURZ = {text};\n')
    print(f'data/kurz.js: {len(personen)} Personen, {len(szenen)} Szenen, {len(orte["orte"])} Orte, {len(fehler)} Abweichungen')
    return 1 if fehler else 0


sys.exit(main())
