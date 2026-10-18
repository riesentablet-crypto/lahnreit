# Baut aus Daniels Rohklängen (Sound.7z) die Klänge der Spielleiter-App:
#  - Schichten: nahtlose Schleifen, die unter einer Szene laufen (in der App live gemischt),
#  - Knöpfe: fertige Einzelklänge und Abfolgen (Hall, Ferne, Dämpfung schon eingerechnet).
# Ausgabe: <app>/klang/<id>.js (MP3 als base64, damit es auch per Doppelklick ohne Server läuft)
# und <app>/data/klang-dateien.js (Liste der Dateien mit Schleifenpunkten und Längen).
# Aufruf: KLANG_ROH=<ordner mit K01a.wav ...> python3 bau_klang.py <app-ordner> [nur-id ...]
# Die Rohklänge: Sound.7z im Projektordner, dazu klang/nachlieferung/K86a.wav und K86b.wav (K86 und K87 sind getauscht).
# Braucht ffmpeg, numpy und scipy.
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from dsp import *

APP = sys.argv[1]
NUR = set(sys.argv[2:])
HIER = os.path.dirname(os.path.abspath(__file__))
INV = {r['datei'][:-4]: r for r in json.load(open(os.path.join(HIER, 'inventar.json')))}
VORSCHAU = os.environ.get('KLANG_VORSCHAU') or os.path.join(HIER, 'vorschau')   # die MP3s zum Anhören
os.makedirs(VORSCHAU, exist_ok=True)
os.makedirs(os.path.join(APP, 'klang'), exist_ok=True)

_cache = {}


def roh(name):
    """Rohklang laden; übersteuerte Fassungen werden dabei geglättet."""
    if name not in _cache:
        r = INV[name]
        _cache[name] = lade(name, entklippen=r['clip'] > 10)
    return _cache[name].copy()


def kante(x, ms=8):
    return blende(x, ms / 1000, ms / 1000)


# ---------- Schichten ----------
def zwei(a, b, ueber=2.5):
    """Zwei Fassungen hintereinander zu einer langen Schleife."""
    return schleife(kette(a, b, ueber=ueber), ueber)


def eine(a, ueber=2.5):
    return schleife(a, ueber)


def takt_schleife(x, von, bis):
    """Für gleichmäßige Schläge (Pendeluhr): genau von einem Schlag bis zu einem späteren schneiden."""
    k = stueck(x, von - 0.05, bis - 0.05)
    n = int(0.004 * SR)
    k[:n] *= np.linspace(0, 1, n)[:, None]; k[-n:] *= np.linspace(1, 0, n)[:, None]
    return k


def falte(x, laenge):
    """Was über die Schleifenlänge hinausklingt, wird vorn wieder eingemischt: ergibt eine saubere Schleife."""
    n = int(laenge * SR)
    y = np.zeros((n, 2), np.float32)
    for i in range(0, len(x), n):
        t = x[i:i + n]; y[:len(t)] += t
    return y


def axt_takt():
    schlaege = []
    for name, spitze_s in [('K35a', 1.22), ('K35b', 0.05), ('K35c', 0.33), ('K35d', 0.2)]:
        schlaege.append(blende(stueck(roh(name), max(0, spitze_s - 0.08), spitze_s + 1.5), 0.004, 0.3))
    rng = np.random.default_rng(20)
    spuren, t = [], 0.4
    for i in range(12):
        spuren.append((t + rng.uniform(-0.05, 0.05), schlaege[i % 4], rng.uniform(-1.5, 0)))
        t += 2.6
    return falte(lege(31.2, *spuren), 31.2)


def fernleitung():
    """Das Rauschen einer alten Fernleitung, nachgebaut: Rauschen im Telefonband, leises Brummen, Knackser."""
    rng = np.random.default_rng(43)
    n = 30 * SR
    r = rng.standard_normal((n, 1)).astype(np.float32)
    r = bandpass(np.repeat(r, 2, 1), 300, 3400, 2) * 0.05
    t = np.arange(n) / SR
    brumm = (0.006 * np.sin(2 * np.pi * 50 * t) + 0.004 * np.sin(2 * np.pi * 150 * t) + 0.002 * np.sin(2 * np.pi * 250 * t)).astype(np.float32)
    # Schwankung der Leitung: das Rauschen atmet langsam
    welle = (1 + 0.35 * np.sin(2 * np.pi * t / 7.3) + 0.2 * np.sin(2 * np.pi * t / 2.9)).astype(np.float32)
    y = r * welle[:, None] + brumm[:, None]
    for _ in range(70):
        a = rng.integers(0, n - 400); lang = rng.integers(20, 300)
        y[a:a + lang] += (rng.standard_normal((lang, 1)) * rng.uniform(0.02, 0.15)).astype(np.float32)
    y = bandpass(y, 250, 3600, 2)
    return eine(y, 2.0)


def telefon(x):
    """Wie durch einen alten Hörer: nur das mittlere Band, etwas Zerrung, mono."""
    m = x.mean(1, keepdims=True).repeat(2, 1)
    m = bandpass(m, 350, 3200, 3)
    m = np.tanh(m * 3) / 3
    return m.astype(np.float32)


SCHICHTEN = {
    # id: (Titel für Menschen, Quelle als Funktion)
    'L-bach': ('Bergbach', lambda: zwei(roh('K01a'), roh('K01b'))),
    'L-wind': ('Wind in kahlen Bäumen', lambda: zwei(roh('K02a'), roh('K02b'))),
    'L-tauwasser': ('Tauwasser tropft', lambda: eine(roh('K03a'))),
    'L-feuer': ('Feuer in der Blechtonne', lambda: zwei(roh('K04a'), roh('K04b'))),
    'L-kinder': ('Kinder auf dem Platz', lambda: zwei(roh('K05a'), roh('K05b'))),
    'L-foehn': ('Föhnsturm', lambda: zwei(roh('K06a'), roh('K06b'))),
    'L-gaststube': ('Gaststube', lambda: zwei(roh('K12a'), roh('K12b'))),
    'L-ofen': ('Stubenofen', lambda: zwei(roh('K13a'), roh('K13b'))),
    'L-kirche': ('volle Kirche, still', lambda: zwei(roh('K28a'), roh('K28b'))),
    'L-mauern': ('Wind um die Mauern', lambda: zwei(roh('K29a'), roh('K29b'))),
    'L-rosenkranz': ('Rosenkranz', lambda: eine(stueck(roh('K32'), 0, 28.0), 2.0)),
    'L-stall': ('Stall', lambda: zwei(roh('K36a'), roh('K36b'))),
    'L-brunnen': ('Brunnentrog', lambda: zwei(roh('K37a'), roh('K37b'))),
    'L-uhr': ('Pendeluhr', lambda: takt_schleife(roh('K38a'), 2.02, 27.02)),
    'L-leitung': ('Fernleitung', fernleitung),
    'L-muenchen': ('Wirtshaus in München, durchs Telefon', lambda: zwei(telefon(roh('K45')), telefon(roh('K45b')))),
    'L-schule': ('Schulstube', lambda: zwei(roh('K50a'), roh('K50b'))),
    'L-saege': ('Sägegatter', lambda: eine(stueck(roh('K51'), 4.3, 30.0), 0.4)),
    'L-ewerk': ('E-Werk', lambda: zwei(roh('K52a'), roh('K52b'))),
    'L-axt': ('Axt im Takt', axt_takt),
    'L-autobahn': ('Im Wagen auf der Autobahn', lambda: eine(roh('K55'))),
    'L-schotter': ('Schotterstraße', lambda: zwei(roh('K56a'), roh('K56b'))),
    'L-postbus': ('Postbus im Leerlauf', lambda: eine(roh('K63'))),
    'L-leute': ('Leute auf dem Platz', lambda: zwei(roh('K68a'), roh('K68b'))),
    'L-roesser': ('Rösser warten', lambda: eine(stueck(roh('K69'), 1.5, 28.5))),
    'L-schlitten': ('Schlittenkufen', lambda: zwei(roh('K75a'), roh('K75b'))),
    'L-fichten': ('Wind in den Fichten', lambda: zwei(roh('K76a'), roh('K76b'))),
    'L-pulver': ('Schritte im Pulverschnee', lambda: zwei(roh('K77a'), roh('K77b'))),
    'L-atem': ('Atem beim Aufstieg', lambda: zwei(roh('K78a'), roh('K78b'))),
    'L-bacheis': ('Bach unter dem Eis', lambda: zwei(roh('K81a'), roh('K81b'))),
    'L-harsch': ('Harsch', lambda: zwei(roh('K84a'), roh('K84b'))),
    # Daniel hat K86 und K87 vertauscht erzeugt: K87a/b sind das Schmelzwasser, K86a/b das Waten (18.10.)
    'L-schmelz': ('Wasser unter dem Schnee', lambda: zwei(roh('K87a'), roh('K87b'))),
    'L-waten': ('Waten im nassen Schnee', lambda: zwei(roh('K86a'), roh('K86b'))),
    'L-keuchen': ('Der Atem pfeift', lambda: zwei(stueck(roh('K88a'), 0, 27.5), roh('K88b'))),
    'L-ritzen': ('Wind durch die Ritzen', lambda: zwei(roh('K92a'), roh('K92b'))),
    'L-sattel': ('Wind am Sattel', lambda: zwei(roh('K93a'), roh('K93b'))),
    'L-graupel': ('Graupel', lambda: eine(roh('K96'))),
    'L-sturm': ('Schneesturm', lambda: zwei(roh('K98a'), roh('K98b'))),
    'L-sturm-innen': ('Sturm, von drinnen', lambda: zwei(roh('K99a'), roh('K99b'))),
    'L-herd': ('Herdfeuer', lambda: zwei(roh('K100a'), roh('K100b'))),
    'L-tropfen': ('Tropfen im Leichenhaus', lambda: zwei(roh('K112a'), roh('K112b'))),
    'L-lampe': ('Lampe zischt', lambda: eine(roh('K113'))),
    'L-mesner': ('Mesner betet', lambda: eine(roh('K114'))),
}


# ---------- Knöpfe ----------
def r(name, a=0.0, b=None):
    return stueck(roh(name), a, b)


def zug_naht():
    """S5: Der Zug kommt näher, hält, die Goaßl knallt, das Echo kommt vom Berg, dann Stille."""
    g = roh('K66')
    n = len(g)
    t = np.arange(n) / SR
    nah = np.clip((t - 2) / 18, 0, 1)[:, None]          # nach 20 s ist er da
    weit = tiefpass(hochpass(g, 150), 900, 2)
    y = (weit * (1 - nah) + g * nah) * db(-22 * (1 - nah) ** 1.5)
    y = blende(stueck(y, 0, 27.0), 1.0, 1.6)          # der Zug bleibt stehen
    knall = hall(roh('K67a'), 'tal', 0.5)
    return lege(36, (0, y, 0), (28.2, knall, -2))


def zug_von_draussen():
    """S4 gegen elf: Glocken und Goaßl von draußen, durch Wand und Fenster."""
    g = blende(roh('K66'), 4, 6)
    k1, k2 = roh('K67a'), roh('K67b')
    y = lege(30, (0, g, 0), (9.0, k1, -4), (15.5, k2, -6), (21.0, k1, -5))
    return dumpf(y, 520, 0.2)


def hund_heult_18():
    """S17, 18 Uhr: ein Hund heult, ganz nah, dann weiter weg, dann wieder nah."""
    nah1 = hall(tiefpass(roh('K103a'), 3000), 'hof', 0.2)
    weg = fern(roh('K103b'), 1200, 'tal', 0.6)
    nah2 = hall(tiefpass(r('K103a', 1.2), 3000), 'hof', 0.2)
    return lege(28, (0, nah1, 0), (9.5, weg, -9), (19.5, nah2, -1))


def schritte_klopfen_20():
    """S17, 20 Uhr: Schritte im Schnee ums Haus, dann ein Klopfen an der Wand, dreimal, dumpf."""
    s = roh('K104')
    teile = [blende(stueck(s, a, b), 0.05, 0.25) for a, b in [(0.1, 3.0), (3.0, 5.9), (5.9, 9.3)]]
    k = blende(r('K105', 0, 2.5), 0.002, 0.4)
    y = lege(24, (0, teile[0], 0), (5.4, teile[1], -1), (11.3, teile[2], 0),
             (16.6, k, 5), (18.5, k, 5), (20.4, k, 5))
    return dumpf(y, 480, 0.3)


def kratzen_22():
    return dumpf(roh('K106'), 1400, 0.2)


def schlaege(name, n, abstand, art='hof', nass=0.35):
    x = roh(name)
    y = lege(abstand * n + sek(x), *[(i * abstand, x, 0) for i in range(n)])
    return hall(tiefpass(y, 6000), art, nass)


def sterbe_hand():
    x = roh('K24')
    # Daniels Aufnahme hat Lücken und schwache Stellen (3,5–8,6 s und 12,1–14,8 s); die bleiben draußen
    y = kette(stueck(x, 0, 3.4), stueck(x, 8.6, 12.1), stueck(x, 14.8, 23.5), ueber=0.3)
    return hall(blende(y, 0.02, 2.5), 'hof', 0.3)


def motor_dreimal():
    """S25: Der Motor springt im Frost erst beim dritten Mal an. Daniels Aufnahme orgelt 0,8 s und springt
    dann an; die zwei vergeblichen Versuche davor sind derselbe Anlasser, abgebrochen und etwas langsamer."""
    x = roh('K60')
    anlasser = stueck(x, 0.12, 0.86)
    def versuch(rate, aus):
        y = anlasser
        if rate != 1.0:
            n = int(len(y) / rate)
            y = np.stack([np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y[:, c]) for c in range(2)], 1).astype(np.float32)
        return blende(y, 0.01, aus)
    y = lege(0, (0, versuch(0.92, 0.25), -1), (1.55, versuch(0.96, 0.2), 0), (3.0, stueck(x, 0.12), 0))
    return hall(y, 'hof', 0.2)


def zweimal_ab(name, ab, abstand):
    x = r(name, ab)
    return lege(abstand + sek(x), (0, x, 0), (abstand, x, -1))


KNOEPFE = {
    # id: (Titel, [Fassungen als Funktionen])
    'C-kreuzer': ('Straßenkreuzer überholt', [lambda n=n: tiefpass(roh(n), 5000) for n in ['K58a', 'K58b', 'K58d']]),
    'C-radio': ('Autoradio, AFN', [lambda: blende(roh('K57'), 0.5, 4)]),
    'C-autotuer': ('Autotür', [lambda: roh('K59')]),
    'C-laeuten': ('Die Glocken läuten', [lambda: hall(blende(roh('K25'), 0.3, 5), 'hof', 0.3)]),
    'C-viertel': ('Viertelschlag', [lambda: hall(roh('K26'), 'hof', 0.35)]),
    'C-vier': ('Es schlägt vier', [lambda: schlaege('K27', 4, 2.1)]),
    'C-sieben': ('Es schlägt sieben', [lambda: schlaege('K27', 7, 2.1)]),
    'C-sterbe-schlag': ('Sterbeglöckerl, ein Schlag', [lambda: hall(tiefpass(roh('K23'), 4500), 'tal', 0.5)]),
    'C-sterbe-hand': ('Sterbeglöckerl, von Hand', [sterbe_hand]),
    'C-hund-fern': ('Hund bellt in der Ferne', [lambda n=n: fern(roh(n), 2500, 'tal', 0.55) for n in ['K07a', 'K07b', 'K07c', 'K07d']]),
    'C-hahn': ('Hahn kräht', [lambda n=n: fern(roh(n), 5000, 'hof', 0.4) for n in ['K08a', 'K08b', 'K08c', 'K08d']]),
    'C-kuh': ('Kuh muht im Stall', [lambda n=n: dumpf(roh(n), 900, 0.25) for n in ['K09a', 'K09b', 'K09c', 'K09d']]),
    'C-vieh': ('Das Vieh brüllt', [lambda n=n: dumpf(roh(n), 1300, 0.3) for n in ['K10a', 'K10b', 'K10c', 'K10d']]),
    'C-fenster': ('Fenster quietscht', [lambda n=n: roh(n) for n in ['K11a', 'K11b', 'K11c', 'K11d']]),
    'C-karten': ('Karten klatschen', [lambda n=n: hall(roh(n), 'raum', 0.2) for n in ['K14a', 'K14b', 'K14c', 'K14d']]),
    'C-kruege': ('Steinkrüge', [lambda n=n: hall(roh(n), 'raum', 0.2) for n in ['K15a', 'K15b', 'K15c', 'K15d']]),
    'C-lachen': ('Männer lachen', [lambda n=n: hall(roh(n), 'raum', 0.2) for n in ['K16a', 'K16b', 'K16c', 'K16d']]),
    'C-treppe': ('Die Treppe knarrt', [lambda n=n: roh(n) for n in ['K17a', 'K17b', 'K17c', 'K17d']]),
    'C-schluessel': ('Der Schlüssel klemmt', [lambda n=n: roh(n) for n in ['K18a', 'K18b', 'K18c', 'K18d']]),
    'C-balkontuer': ('Wind rüttelt an der Balkontür', [lambda n=n: roh(n) for n in ['K19a', 'K19b', 'K19c', 'K19d']]),
    'C-klopfen3': ('Es klopft dreimal', [lambda: roh('K20b'), lambda: r('K20a', 0.6)]),
    'C-holzschuhe': ('Holzschuhe im Gang', [lambda n=n: roh(n) for n in ['K21a', 'K21b', 'K21c', 'K21d']]),
    'C-zischen': ('Wasser zischt auf dem Herd', [lambda n=n: blende(roh(n), 0.05, 1.0) for n in ['K22a', 'K22b', 'K22c', 'K22d']]),
    'C-orgel': ('Die Orgel', [lambda: hall(blende(roh('K30'), 0.5, 4), 'kirche', 0.2)]),
    'C-orgel-dumpf': ('Orgel aus der Kirche', [lambda: dumpf(blende(roh('K30'), 2, 4), 450, 0.4)]),
    'C-gesang-dumpf': ('Gesang aus der Kirche', [lambda: dumpf(blende(roh('K31'), 2, 4), 500, 0.4)]),
    'C-kirchentuer': ('Die Kirchentür', [lambda: hall(roh('K33'), 'kirche', 0.25)]),
    'C-hund-kette': ('Hund an der Kette', [lambda n=n: hall(roh(n), 'hof', 0.2) for n in ['K34a', 'K34b']]),
    'C-scheibe': ('Klopfen an die Scheibe', [lambda: roh('K39')]),
    'C-balken': ('Der Balken fällt in den Schnee', [lambda n=n: hall(roh(n), 'hof', 0.25) for n in ['K40a', 'K40b', 'K40c', 'K40d']]),
    'C-klappe': ('Klappe und Stöpsel', [lambda n=n: roh(n) for n in ['K41a', 'K41b']]),
    'C-kurbel': ('Die Kurbel', [lambda n=n: roh(n) for n in ['K42a', 'K42b']]),
    'C-bleistift': ('Traudls Bleistift', [lambda: roh('K44')]),
    'C-ottilie': ('Ottilie singt in der Küche', [lambda: dumpf(blende(roh('K46'), 0.5, 2), 800, 0.25)]),
    'C-ladenglocke': ('Die Ladenglocke', [lambda: roh('K47')]),
    'C-schuster': ('Der Schusterhammer', [lambda n=n: roh(n) for n in ['K48a', 'K48b']]),
    'C-stock': ('Zwei Schläge mit dem Stock', [lambda: blende(r('K49', 0, 0.68), 0, 0.12)]),
    'C-stock-dielen': ('Der Stock auf die Dielen', [lambda: hall(roh('K49'), 'raum', 0.25)]),
    'C-kannen': ('Milchkannen', [lambda n=n: hall(roh(n), 'hof', 0.2) for n in ['K53a', 'K53b', 'K53c']]),
    'C-handwagen': ('Der Handwagen', [lambda n=n: roh(n) for n in ['K54a', 'K54b']]),
    'C-motor': ('Der Motor springt beim dritten Mal an', [motor_dreimal]),
    'C-wagendach': ('Zwei Schläge aufs Wagendach', [lambda: zweimal_ab('K61', 0.7, 0.38)]),
    'C-dreiklang': ('Das Dreiklanghorn', [lambda: hall(roh('K62'), 'hof', 0.35)]),
    'C-bus-ab': ('Der Postbus fährt ab', [lambda: roh('K64')]),
    'C-motorrad': ('Rauchs Motorrad', [lambda: roh('K65')]),
    'C-zug': ('Der Zug mit den Kuhglocken', [zug_naht]),
    'C-zug-draussen': ('Glocken und Goaßl von draußen', [zug_von_draussen]),
    'C-goassl': ('Die Goaßl knallt', [lambda n=n: hall(roh(n), 'tal', 0.45) for n in ['K67a', 'K67b']]),
    'C-blasmusik': ('Die Blasmusik', [lambda: hall(blende(roh('K70'), 0.3, 3), 'hof', 0.25)]),
    'C-boeller': ('Der Böller', [lambda: hall(roh('K71'), 'tal', 0.5)]),
    'C-stute': ('Die Stute scheut', [lambda: roh('K72')]),
    'C-hufe': ('Hufe auf festem Schnee', [lambda n=n: roh(n) for n in ['K73a', 'K73b']]),
    'C-ziehharmonika': ('Die Ziehharmonika', [lambda: fern(blende(roh('K74'), 1, 3), 2500, 'hof', 0.5)]),
    'C-ast': ('Schnee staubt vom Ast', [lambda n=n: roh(n) for n in ['K79a', 'K79b', 'K79c', 'K79d']]),
    'C-hasso': ('Hasso hechelt', [lambda: roh('K80')]),
    'C-haeher': ('Der Eichelhäher', [lambda n=n: roh(n) for n in ['K82a', 'K82b', 'K82c']]),
    'C-ausrutschen': ('Ausrutschen im Bach', [lambda: roh('K83')]),
    'C-hang': ('Der Hang knackt', [lambda n=n: fern(roh(n), 2500, 'tal', 0.3) for n in ['K85a', 'K85b']]),
    'C-lahn': ('Die Lahn geht ab', [lambda n=n: roh(n) for n in ['K89a', 'K89b']]),
    'C-lahn-wald': ('Die Lahn, aus dem Wald', [lambda n=n: fern(roh(n), 1200, 'tal', 0.4) for n in ['K89a', 'K89b']]),
    'C-schuss-tal': ('Der Schuss im Tal', [lambda: roh('K90')]),
    'C-riegel': ('Der Holzriegel der Kaser', [lambda: roh('K91')]),
    'C-raben': ('Die zwei Raben', [lambda n=n: roh(n) for n in ['K94a', 'K94b']]),
    'C-rabe': ('Ein Rabe fliegt vorbei', [lambda: roh('K95')]),
    'C-boee': ('Die erste Böe', [lambda n=n: roh(n) for n in ['K97a', 'K97b']]),
    'C-knacken': ('Die Balken knacken', [lambda n=n: roh(n) for n in ['K101a', 'K101b', 'K101c']]),
    'C-rauch': ('Der Rauch schlägt zurück', [lambda n=n: roh(n) for n in ['K102a', 'K102b', 'K102c']]),
    'C-heult-18': ('18 Uhr: ein Hund heult', [hund_heult_18]),
    'C-heulen': ('Hunde heulen', [lambda: lege(13, (0, fern(roh('K103a'), 2000, 'tal', 0.5), 0), (2.6, fern(roh('K103b'), 1500, 'tal', 0.6), -5))]),
    'C-klopfen-20': ('20 Uhr: Schritte, dreimal Klopfen', [schritte_klopfen_20]),
    'C-kratzen-22': ('22 Uhr: der Hund kratzt', [kratzen_22]),
    'C-schuss-sturm': ('Der Schuss im Sturm', [lambda: tiefpass(roh('K107'), 3500)]),
    'C-schindel': ('Die lose Schindel', [lambda n=n: roh(n) for n in ['K108a', 'K108b']]),
    'C-tuer-schnee': ('Die Tür gegen den Schnee', [lambda: roh('K109')]),
    'C-schaufeln': ('Schneeschaufeln', [lambda: roh('K110')]),
    'C-kette': ('Eine Kette rasselt', [lambda n=n: fern(roh(n), 5000, 'hof', 0.4) for n in ['K111a', 'K111b']]),
    'C-kette-unten': ('Die Kette von unten', [lambda n=n: fern(roh(n), 2500, 'tal', 0.5) for n in ['K111a', 'K111b']]),
}

ZIEL_SCHICHT = -24.0   # LUFS; in der App wird jede Schicht noch leiser gemischt
ZIEL_KNOPF = -20.0


def ausgeben(key, x, kbps, schleife_s=None):
    pfad_mp3 = os.path.join(VORSCHAU, key + '.mp3')
    schreibe_mp3(x, pfad_mp3, kbps)
    als_js(pfad_mp3, os.path.join(APP, 'klang', key + '.js'), key)
    return os.path.getsize(pfad_mp3)


def main():
    # Was schon gebaut ist, steht in der App; ein Teilbau ergänzt es nur
    liste_js = os.path.join(APP, 'data', 'klang-dateien.js')
    alt = {'schichten': {}, 'knoepfe': {}}
    if os.path.exists(liste_js):
        t = open(liste_js).read()
        alt = json.loads(t[t.index('=', t.index('LAHNREIT_KLANG_DATEIEN')) + 1:].strip().rstrip(';'))
    erg = {'schichten': dict(alt['schichten']), 'knoepfe': dict(alt['knoepfe'])}
    groesse = 0
    for key, (titel, f) in SCHICHTEN.items():
        if NUR and key not in NUR:
            continue
        k = f()
        k = auf_lufs(k, ZIEL_SCHICHT, -3, ring=True)
        datei = mit_vorlauf(k, 0.5)
        groesse += ausgeben(key, datei, 96)
        erg['schichten'][key] = dict(titel=titel, start=0.5, ende=round(0.5 + sek(k), 4), lufs=round(lufs(k), 1))
        print(f'{key:16s} {sek(k):5.1f} s  {lufs(k):6.1f} LUFS  Spitze {spitze(k):5.1f}')
    for key, (titel, fs) in KNOEPFE.items():
        if NUR and key not in NUR:
            continue
        vs = []
        for i, f in enumerate(fs):
            x = kante(f())
            # Stille am Ende kürzen, damit der Knopf nicht ewig »läuft«
            h = huelle(x, 0.05)
            letzte = np.where(h > h.max() - 60)[0]
            if len(letzte):
                x = blende(x[:min(len(x), int((letzte[-1] + 1) * 0.05 * SR) + int(0.1 * SR))], 0, 0.08)
            # Stille am Anfang kürzen, damit der Knopf sofort klingt
            h = huelle(x, 0.01)
            erste = np.where(h > h.max() - 45)[0]
            if len(erste) and erste[0] * 0.01 > 0.05:
                x = blende(x[int(erste[0] * 0.01 * SR) - int(0.03 * SR):], 0.02, 0)
            x = auf_lufs(x, ZIEL_KNOPF, -1)
            vkey = f'{key}-{i + 1}'
            groesse += ausgeben(vkey, x, 112)
            vs.append(dict(datei=vkey, dauer=round(sek(x), 2)))
        erg['knoepfe'][key] = dict(titel=titel, fassungen=vs)
        print(f'{key:16s} {len(vs)} Fassung(en), {", ".join(str(v["dauer"]) for v in vs)} s')
    with open(os.path.join(APP, 'data', 'klang-dateien.js'), 'w') as f:
        f.write('// Klangdateien der App, erzeugt von bau_klang.py. Schleifen laufen von start bis ende (Sekunden).\n')
        f.write('window.LAHNREIT_KLANG_DATEIEN = ' + json.dumps(erg, ensure_ascii=False, indent=1) + ';\n')
    print('MP3 zusammen', round(groesse / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
