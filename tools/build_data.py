# Baut data/lahnreit-daten.js aus den Markdown-Exporten des Handbuchs.
# Aufruf aus dem Repo-Ordner: python3 tools/build_data.py
import json, subprocess, sys, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ebenen

root = Path(__file__).resolve().parent.parent
tmp = Path(tempfile.mkdtemp())
subprocess.run([sys.executable, str(root / 'tools' / 'parse_hb.py'), str(root / 'quellen' / 'handbuch'), str(tmp)], check=True)

personen = json.loads((tmp / 'personen.json').read_text())
for p in personen['personen']:
    p.pop('md', None)
szenen = json.loads((tmp / 'szenen.json').read_text())
dorf = ebenen.baue(root / 'quellen' / 'handbuch', szenen)
for s in szenen['szenen']:
    s.pop('vorspann_md', None)
    s.pop('abschnitte', None)
daten = {
    'personen': personen,
    'szenen': szenen,
    'dorf': dorf,
    'bilder': json.loads((tmp / 'bilder.json').read_text()),
    'toene': json.loads((tmp / 'toene.json').read_text()),
}
js = '// Erzeugt von tools/build_data.py aus dem Spielleiterhandbuch. Nicht von Hand ändern.\n'
js += 'window.LAHNREIT = ' + json.dumps(daten, ensure_ascii=False, separators=(',', ':')) + ';\n'
(root / 'data' / 'lahnreit-daten.js').write_text(js)
print('data/lahnreit-daten.js', len(js.encode()) // 1024, 'KB')
