# Ordnet die Handbuchdaten in Ebenen für die App:
# Szenen in Vorlesen, Ablauf, Funde, Proben, Gespräche und Mehr; dazu die Orte des Dorfs
# und des Bergs und die Tabelle »Wo ist wer«.
import re
from pathlib import Path

SKILLS = ['Verborgenes erkennen', 'Heimlichkeit', 'Schließtechnik', 'Klettern', 'Horchen', 'Psychologie',
          'Stärke', 'Bibliotheksnutzung', 'Naturkunde', 'Medizin', 'Erste Hilfe', 'Spurensuche', 'Fotografie',
          'Orientierung', 'Überleben', 'Überzeugen', 'Überreden', 'Charme', 'Einschüchtern', 'Glück',
          'Rechtswesen', 'Geschichtskunde', 'Mechanische Reparaturen', 'Werfen', 'Springen', 'Schwimmen']

UHR = ['morgens', 'nachmittags', 'abends', 'nachts', 'georgi']

# Orte, die in »Wo ist wer« ohne Kürzel stehen
STICHWORTE = [
    (r'Messe|Orgel|ministriert|läutet|Rosenkranz', 'D2'),
    (r'Stammtisch|Kartentisch|Gaststube|Gasthof|Lahnwirt|bedient|Küche \(D5\)', 'D5'),
    (r'Kanzlei|Poststelle|Ferngespräche', 'D6'),
    (r'Laden', 'D8'),
    (r'Pfarrhof', 'D4'),
    (r'Maibaum|Dorfplatz|Umritt|Ritt|Fahne', 'D1'),
    (r'Jägerhaus', 'D14'),
    (r'Schule|Schulhaus', 'D7'),
    (r'Werkstatt', 'D9'),
    (r'Sägewerk|Sägegatter', 'D12'),
    (r'Friedhof', 'D3'),
    (r'Häusl', 'D13'),
    (r'Moar-Hof', 'D11'),
    (r'Bergwald', 'B1'),
]
# Einzelfälle, die kein Stichwort trägt
ZUSATZ = {('P3', 'morgens'): ['D10'], ('P9', 'morgens'): ['D10'], ('P3', 'georgi'): ['D1'],
          ('P7', 'abends'): ['D8'], ('P2', 'nachmittags'): ['D6']}
# Einzelfälle, bei denen ein Stichwort in die Irre führt
OHNE = {('P1', 'abends')}  # »daheim neben dem Pfarrhof«


def cells(line):
    return [c.strip() for c in re.split(r'(?<!\\)\|', line.strip())[1:-1]]


def table_after(md, start=0):
    """Erste Markdown-Tabelle ab start: (kopf, zeilen, ende)."""
    m = re.compile(r'((?:^\|.*\|[ \t]*\n?)+)', re.M).search(md, start)
    if not m:
        return None
    lines = m.group(1).strip().splitlines()
    head = cells(lines[0])
    body = [cells(l) for l in lines[1:] if not re.match(r'^\|\s*:?-{2,}', l)]
    return head, body, m.end()


def bold_items(md):
    """Absätze der Form **Titel.** Text -> [{titel, md}]. Text davor -> intro."""
    blocks = re.split(r'\n\s*\n', md.strip())
    items, intro = [], []
    for b in blocks:
        m = re.match(r'^\*\*(.+?)\*\*\s*(.*)$', b, re.S)
        if m and not b.startswith('|'):
            t = m.group(1).strip().rstrip('.:')
            items.append({'titel': t, 'md': m.group(2).strip()})
        elif items:
            items[-1]['md'] += '\n\n' + b
        else:
            intro.append(b)
    return '\n\n'.join(intro), items


def erster_satz(s, n=110):
    s = re.sub(r'\*+', '', s).strip()
    m = re.match(r'(.+?[.!?»«])(\s|$)', s)
    t = m.group(1) if m else s
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0] + ' …'


def probe_von(s):
    """Die Proben, die ein Fund nennt, in der Reihenfolge des Textes (höchstens zwei)."""
    s2 = re.sub(r'\*', '', s)
    s2 = s2.split('Was es heißt:')[0]
    treffer = []
    for m in re.finditer(r'[Oo]hne Probe|keine Probe', s2):
        treffer.append((m.start(), 'ohne Probe'))
    for sk in SKILLS:
        i = s2.find(sk)
        if i >= 0:
            name = sk + (', halb' if 'Halbwert' in s2[i:i + len(sk) + 20] else '')
            treffer.append((i, name))
    out = []
    for _, n in sorted(treffer):
        if n not in out:
            out.append(n)
    return out[:2]


def fund(item):
    t = item['titel']
    return {'titel': re.sub(r'\s*\((H\d+[^)]*)\)', '', t).strip(), 'handout': (re.findall(r'H\d+', t) or [None])[0],
            'wo': erster_satz(item['md']), 'probe': probe_von(item['md']), 'md': item['md']}


def ablauf(md):
    out, rest = [], []
    for block in re.split(r'\n\s*\n', md.strip()):
        if re.match(r'^\d+\. ', block):
            for li in re.split(r'\n(?=\d+\. )', block):
                txt = re.sub(r'^\d+\. ', '', li).strip()
                m = re.match(r'^\*\*(.+?)\*\*\s*(.*)$', txt, re.S)
                if m:
                    out.append({'kurz': m.group(1).strip().rstrip('.:'), 'md': m.group(2).strip()})
                else:
                    out.append({'kurz': None, 'md': txt})
        else:
            rest.append(block)
    _, extra = bold_items('\n\n'.join(rest)) if rest else ('', [])
    intro = '\n\n'.join(b for b in rest if not b.startswith('**'))
    if not out and not extra:
        return [], [], md.strip()
    return out, extra, intro


def proben(md):
    t = table_after(md)
    if not t:
        return [], md.strip()
    head, body, end = t
    rows = []
    for r in body:
        d = dict(zip([h.lower() for h in head], r))
        rows.append({'probe': r[0], 'erfolg': d.get('erfolg', ''), 'krit': d.get('kritischer erfolg', ''),
                     'patzer': d.get('patzer', '')})
    rest = (md[:md.find('|')] + md[end:]).strip()
    return rows, rest


def szene_ebenen(s):
    e = {'vorlesen': [], 'ablauf': [], 'hinweise': [], 'funde': [], 'haeuser': [], 'proben': [],
         'proben_md': '', 'gespraeche': [], 'mehr': [], 'haengt': '', 'weiter': '', 'ablauf_md': ''}
    for a in s['abschnitte']:
        t, md = a['titel'], a['md']
        if t == 'Was das Bild nicht zeigt' or 'Vorlesen' in t:
            e['vorlesen'].append({'titel': t, 'md': md})
        elif t == 'Was hier geschieht':
            e['ablauf'], e['hinweise'], e['ablauf_md'] = ablauf(md)
        elif t == 'Was man finden kann':
            intro, items = bold_items(md)
            e['funde'] += [fund(i) for i in items]
            if intro:
                e['mehr'].append({'titel': 'Zu den Funden', 'md': intro})
        elif re.search(r'\((D\d+)\)$', t) and s['id'] == 'S8':
            intro, items = bold_items(md)
            info = {i['titel']: i['md'] for i in items if i['titel'] in ('Wer zurückgeblieben ist', 'Hinein', 'Wer euch erwischt')}
            rest = [i for i in items if i['titel'] not in info]
            e['haeuser'].append({'titel': re.sub(r'\s*\(D\d+\)$', '', t), 'ort': re.search(r'D\d+', t).group(0),
                                 'info': info, 'funde': [fund(i) for i in rest if i['titel'] != 'Was dort liegt'],
                                 'liegt': next((i['md'] for i in rest if i['titel'] == 'Was dort liegt'), '')})
        elif t == 'Proben':
            e['proben'], e['proben_md'] = proben(md)
        elif re.match(r'^M\d', t):
            e['gespraeche'].append({'code': t.split(' ')[0], 'titel': t.split('·', 1)[-1].strip(), 'md': md})
        elif t.startswith('Die Leute hier'):
            t1 = table_after(md)
            rest = md[t1[2]:] if t1 else md
            intro = md[:md.find('|')].strip() if t1 else ''
            if intro:
                e['mehr'].append({'titel': 'Wer hier sein kann', 'md': intro})
            m = re.search(r'\*\*Wenn es hängt\.\*\*(.*?)(?=\n\*\*Weiter\.\*\*|\Z)', rest, re.S)
            if m:
                e['haengt'] = m.group(1).strip()
            m = re.search(r'\*\*Weiter\.\*\*(.*)$', rest, re.S)
            if m:
                e['weiter'] = m.group(1).strip()
            sonst = re.sub(r'\*\*(Wenn es hängt|Weiter)\.\*\*.*', '', rest, flags=re.S).strip()
            if sonst:
                e['mehr'].append({'titel': 'Zu den Leuten', 'md': sonst})
        elif t == 'Wohin sie gehen können':
            e['mehr'].append({'titel': t, 'md': md})
        else:
            e['mehr'].append({'titel': t, 'md': md})
    if not e['weiter'] and s.get('weiter'):
        e['weiter'] = s['weiter']
    if not e['haengt'] and s.get('haengt'):
        e['haengt'] = s['haengt']
    return e


def orte(dorf_md, teil2_md):
    res = {}
    for m in re.finditer(r'^### ([DB]\d+) · ([^\n]+)\n(.*?)(?=^##|\Z)', dorf_md, re.M | re.S):
        code, name, body = m.group(1), m.group(2).strip(), m.group(3).strip()
        o = {'code': code, 'name': name, 'bild': None, 'bild_md': '', 'beschreibung': '', 'felder': {}, 'gibt': [],
             'gibt_md': '', 'anfang': '', 'berg': code.startswith('B')}
        blocks = re.split(r'\n\s*\n', body)
        besch, last = [], None
        for b in blocks:
            mb = re.match(r'^\*\*Bild:?\*\*:?\s*(.*)$', b, re.S)
            mb2 = re.match(r'^\*\*Bild ([A-Z]\d+[ab]?)\*\* · (.*)$', b, re.S)
            mf = re.match(r'^\*\*(.+?)[.:]\*\*:?\s*(.*)$', b, re.S)
            if mb2:
                o['bild'], o['bild_md'] = mb2.group(1), mb2.group(2).strip()
            elif mb:
                o['bild_md'] = mb.group(1).strip()
                c = re.findall(r'\b([SDB]\d+[ab]?)\b', mb.group(1))
                o['bild'] = c[0] if c else None
            elif b.startswith('- ') and last == 'Was es hier gibt':
                for li in re.split(r'\n(?=- )', b):
                    li = li[2:].strip()
                    mi = re.match(r'^\*\*(.+?)\*\*[.,:]?\s*(.*)$', li, re.S)
                    if mi:
                        o['gibt'].append({'titel': mi.group(1).strip().rstrip('.,:'), 'md': mi.group(2).strip()})
                    else:
                        o['gibt'].append({'titel': erster_satz(li, 60), 'md': li})
            elif mf:
                k, v = mf.group(1).strip(), mf.group(2).strip()
                last = k
                if k == 'So fängt es an':
                    o['anfang'] = v
                elif k == 'Was es hier gibt':
                    o['gibt_md'] = v
                else:
                    o['felder'][k] = v
            elif b.startswith('|'):
                o['felder'].setdefault('Tabelle', '')
                o['felder']['Tabelle'] += b
            else:
                besch.append(b)
        o['beschreibung'] = '\n\n'.join(besch)
        res[code] = o
    # Die Tabelle aus S9 »Wohin sie gehen können«
    i = teil2_md.find('### Wohin sie gehen können')
    t = table_after(teil2_md, i) if i >= 0 else None
    if t:
        for r in t[1]:
            c = re.search(r'([DB]\d+)', r[0])
            if c and c.group(1) in res:
                res[c.group(1)]['dorf'] = {'wer': r[1], 'bekommt': r[2], 'fuehrt': r[3], 'anfang': r[4]}
    return res


def wo_ist_wer(dorf_md):
    i = dorf_md.find('## Wo ist wer')
    t = table_after(dorf_md, i)
    wo = {}
    for r in t[1]:
        pid = re.search(r'P\d+', r[0]).group(0)
        d = {}
        for k, cell in zip(UHR, r[1:6]):
            codes = re.findall(r'\b([DB]\d+)\b', cell)
            for pat, c in STICHWORTE:
                if re.search(pat, cell) and c not in codes:
                    codes.append(c)
            for c in ZUSATZ.get((pid, k), []):
                if c not in codes:
                    codes.append(c)
            if (pid, k) in OHNE or (pid == 'P15' and k == 'morgens'):
                codes = []
            d[k] = {'text': cell, 'orte': codes}
        wo[pid] = d
    j = dorf_md.find('### Wer sonst wo ist')
    t2 = table_after(dorf_md, j)
    sonst = []
    for r in t2[1]:
        codes = re.findall(r'\b([DB]\d+)\b', r[1])
        if 'Gasthof' in r[1] and 'D5' not in codes:
            codes.append('D5')
        if 'Gschwendtner' in r[1] and 'D10' not in codes:
            codes.append('D10')
        if 'Maibaum' in r[1] and 'D1' not in codes:
            codes.append('D1')
        sonst.append({'wer': r[0], 'wo': r[1], 'wozu': r[2], 'orte': codes})
    k = dorf_md.find('### Nachts im Dorf')
    nachts = dorf_md[k:dorf_md.find('## Die Orte im Dorf')].split('\n', 1)[1].strip() if k >= 0 else ''
    return wo, sonst, nachts


def baue(hb_dir, szenen):
    hb = Path(hb_dir)
    dorf_md = (hb / 'dorf.md').read_text()
    teil2_md = (hb / 'teil2.md').read_text()
    for s in szenen['szenen']:
        s['ebenen'] = szene_ebenen(s)
    wo, sonst, nachts = wo_ist_wer(dorf_md)
    return {'orte': orte(dorf_md, teil2_md), 'wo': wo, 'sonst': sonst, 'nachts': nachts}
