# Liest die Markdown-Exporte des Spielleiterhandbuchs und schreibt die Daten der App als JSON.
import re, json, sys, html
from pathlib import Path

HB = Path(sys.argv[1]); OUT = Path(sys.argv[2])
STUFEN = ['feindselig', 'skeptisch', 'neutral', 'kooperativ', 'freundlich']

def rows(block):
    """Markdown-Tabelle -> Liste von Zeilen (ohne Kopf- und Trennzeile)."""
    lines = [l for l in block.strip().splitlines() if l.startswith('|')]
    out = []
    for l in lines[2:]:
        cells = [c.strip() for c in re.split(r'(?<!\\)\|', l.strip())[1:-1]]
        out.append(cells)
    return out

def tables(text):
    """Alle Tabellen eines Abschnitts mit ihrer Kopfzeile."""
    res = []
    for m in re.finditer(r'((?:^\|.*\|[ \t]*\n?)+)', text, re.M):
        lines = m.group(1).strip().splitlines()
        if len(lines) < 2: continue
        head = [c.strip() for c in lines[0].strip().split('|')[1:-1]]
        res.append((head, rows(m.group(1)), m.start(), m.end()))
    return res

def split_h(text, level):
    """Text an Überschriften der Ebene level teilen: [(titel, inhalt)], Vorspann mit titel None."""
    pat = re.compile(r'^' + '#' * level + r' (.+)$', re.M)
    parts, last, title = [], 0, None
    for m in pat.finditer(text):
        parts.append((title, text[last:m.start()]))
        title, last = m.group(1).strip(), m.end()
    parts.append((title, text[last:]))
    return parts

def bold_paras(text):
    """Absätze der Form **Etikett.** Text -> {Etikett: Text}."""
    d = {}
    for m in re.finditer(r'^\*\*([^*]+?)[.:]\*\*:?\s*(.*)$', text, re.M):
        d[m.group(1).strip()] = m.group(2).strip()
    return d

def stufe_of(s):
    s = s.lower()
    for st in STUFEN:
        if s.startswith(st): return st
    return None

# ---------- Personen ----------
pers_md = (HB / 'personen.md').read_text()
personen, ueberblick = [], {}
for gtitle, gtext in split_h(pers_md, 2):
    if gtitle and 'auf einen Blick' in gtext[:0] : pass
    for ptitle, ptext in split_h(gtext, 3):
        if ptitle == 'Die zweiundzwanzig auf einen Blick':
            for r in tables(ptext)[0][1]:
                ueberblick[r[0]] = {'wer': r[1], 'wo': r[2], 'hergibt': r[3]}
            continue
        m = re.match(r'(P\d+) · (.+)', ptitle or '')
        if not m: continue
        pid, name = m.groups()
        fields = bold_paras(ptext)
        start = {}
        hz = fields.get('Haltung zu Beginn', '')
        for key, lab in (('B', 'Brandl'), ('Hd', 'Hagedorn'), ('Hs', 'Hias')):
            mm = re.search(lab + r' (\w+)', hz)
            if mm: start[key] = mm.group(1)
        leiter, katalog, extra = [], [], []
        for head, rs, *_ in tables(ptext):
            if head[:1] == ['Stufe']:
                leiter = [{'stufe': r[0], 'text': r[1]} for r in rs]
            elif head[:2] == ['Stichwort', 'ab']:
                katalog = [{'thema': r[0], 'ab': r[1], 'text': r[2], 'stufe': stufe_of(r[1])} for r in rs]
            else:
                extra.append({'kopf': head, 'zeilen': rs})
        personen.append({'id': pid, 'name': name, 'gruppe': gtitle, 'felder': fields,
                         'start': start, 'leiter': leiter, 'katalog': katalog, 'tabellen': extra,
                         'md': ptext.strip()})
for p in personen:
    p['ueberblick'] = ueberblick.get(p['id'])
# Nebenfiguren als Markdown
neben = ''
for gtitle, gtext in split_h(pers_md, 2):
    if gtitle == 'Nebenfiguren': neben = gtext.strip()
regeln = split_h(pers_md, 2)[1][1].strip() if len(split_h(pers_md, 2)) > 1 else ''
personen.sort(key=lambda p: int(p['id'][1:]))

# ---------- Szenen ----------
szenen, teile = [], []
for i in range(1, 6):
    md = (HB / f'teil{i}.md').read_text()
    h1 = re.search(r'^# (.+)$', md, re.M).group(1)
    teil = {'nr': i, 'titel': h1, 'intro': '', 'szenen': []}
    for title, body in split_h(md, 2):
        if title is None: continue
        m = re.match(r'(S\d+[a-z]?) · (.+)', title)
        if not m:
            teil['intro'] += f'## {title}\n{body}'
            continue
        sid, stitle = m.groups()
        secs = split_h(body, 3)
        vorspann = secs[0][1]
        meta = {}
        t = tables(vorspann)
        if t and t[0][0][:2] == ['Wann', 'Wo']:
            meta = dict(zip(t[0][0], t[0][1][0]))
        fields = bold_paras(vorspann)
        bilder_sz = [{'code': mb.group(1), 'text': mb.group(2).strip()}
                     for mb in re.finditer(r'^\*\*Bild (\S+)\*\* · (.+)$', body, re.M)]
        bild = bilder_sz[0] if bilder_sz else None
        sections, leute = [], []
        for st, sb in secs[1:]:
            sections.append({'titel': st, 'md': sb.strip()})
            if st.startswith('Die Leute hier'):
                for head, rs, *_ in tables(sb):
                    if head[:1] == ['Wer']:
                        for r in rs:
                            refs = re.findall(r'P\d+', r[-1])
                            leute.append({'wer': r[0], 'haltung': r[1], 'tut': r[2], 'personen': refs})
        # Text nach der letzten Unterüberschrift kann »Wenn es hängt« und »Weiter« enthalten
        alltext = body
        tail = bold_paras(alltext)
        sz = {'id': sid, 'titel': stitle, 'teil': i, 'meta': meta,
              'worum': fields.get('Worum es geht'), 'bild': bild, 'bilder': bilder_sz,
              'haengt': tail.get('Wenn es hängt'), 'weiter': tail.get('Weiter'),
              'vorspann_md': vorspann.strip(), 'abschnitte': sections, 'leute': leute}
        szenen.append(sz); teil['szenen'].append(sid)
    teil['intro'] = teil['intro'].strip()
    teile.append(teil)

# ---------- Bilder ----------
bp = (HB / 'bildprompts.html').read_text()
bilder = []
for m in re.finditer(r'<p><strong>Bild ([^<]+?) · ([^<]+)</strong>(.*?)</p>', bp, re.S):
    code, titel, rest = m.group(1).strip(), m.group(2).strip(), m.group(3)
    bilder.append({'code': code, 'titel': html.unescape(titel)})

# ---------- Töne ----------
tp = (HB / 'tonprompts.html').read_text()
toene = []
sect = None
for m in re.finditer(r'<h2[^>]*>([^<]+)</h2>|<p><strong>([^<]+)</strong> · ([^<]+)</p>', tp):
    if m.group(1): sect = html.unescape(m.group(1)); continue
    toene.append({'art': 'Hintergrund' if 'Hintergr' in (sect or '') else 'Einzelklang',
                  'name': html.unescape(m.group(2)).strip(), 'wann': html.unescape(m.group(3)).strip()})

OUT.mkdir(parents=True, exist_ok=True)
def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1))
dump('personen.json', {'regeln_md': regeln, 'nebenfiguren_md': neben, 'personen': personen})
dump('szenen.json', {'teile': teile, 'szenen': szenen})
dump('bilder.json', bilder)
dump('toene.json', toene)
print(len(personen), 'Personen,', sum(len(p['katalog']) for p in personen), 'Katalogzeilen')
print(len(szenen), 'Szenen:', ' '.join(s['id'] for s in szenen))
print(len(bilder), 'Bilder,', len(toene), 'Töne')
for p in personen:
    if len(p['start']) < 3 or not p['katalog'] or not p['leiter']: print('LÜCKE', p['id'], p['start'], len(p['katalog']), len(p['leiter']))
for s in szenen:
    if not s['meta']: print('Szene ohne Kopf-Tabelle:', s['id'])
