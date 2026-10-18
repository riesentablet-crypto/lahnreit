# Werkzeuge zum Mischen der Lahnreit-Klänge: laden, entzerren, filtern, Hall, Schleifen, MP3.
# Alles in 48 kHz Stereo als float32-Array der Form (n, 2).
import subprocess, base64, os
import numpy as np
from scipy import signal

SR = 48000
ROH = os.environ.get('KLANG_ROH', '')


def lade(name, entklippen=False):
    """Lädt K01a o. ä. aus dem Rohordner; mit entklippen glättet ffmpeg übersteuerte Spitzen."""
    pfad = os.path.join(ROH, name + '.wav')
    filt = ['-af', 'volume=-3dB,adeclip=w=55:o=75:a=8:t=10:n=1000'] if entklippen else []
    roh = subprocess.run(['ffmpeg', '-v', 'error', '-i', pfad] + filt + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(roh, dtype=np.float32).reshape(-1, 2).copy()
    return x


def sek(x):
    return len(x) / SR


def stueck(x, a=0.0, b=None):
    return x[int(a * SR): (None if b is None else int(b * SR))].copy()


def stille(s):
    return np.zeros((int(s * SR), 2), np.float32)


def db(g):
    return 10 ** (g / 20)


# ---------- Lautheit nach ITU-R BS.1770 (K-Bewertung, Gating) ----------
_KB1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_KB2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def lufs(x):
    y = signal.lfilter(*_KB1, x, axis=0)
    y = signal.lfilter(*_KB2, y, axis=0)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if len(y) < blk:
        ms = (y ** 2).mean(0).sum()
        return -0.691 + 10 * np.log10(ms + 1e-12)
    n = 1 + (len(y) - blk) // hop
    ms = np.array([(y[i * hop:i * hop + blk] ** 2).mean(0).sum() for i in range(n)])
    l = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[l > -70]
    if not len(g):
        return -70.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ms[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean()))


def spitze(x):
    return float(20 * np.log10(np.abs(x).max() + 1e-12))


def auf_lufs(x, ziel, spitze_max=-1.0, ring=False):
    """Bringt x auf die Ziel-Lautheit; begrenzt sanft, wenn die Spitze sonst zu hoch wäre.
    ring: x ist eine Schleife; der Begrenzer sieht dann über die Naht hinweg."""
    y = x * db(ziel - lufs(x))
    if not ring:
        return begrenze(y, spitze_max)
    n = min(len(y) // 2, SR)
    z = begrenze(np.concatenate([y[-n:], y, y[:n]]), spitze_max)
    return z[n:-n].copy()


def begrenze(x, spitze_max=-1.0):
    """Weicher Begrenzer mit Vorausschau: senkt nur die Spitzen, nicht das Ganze."""
    grenze = db(spitze_max)
    hull = np.abs(x).max(1)
    if hull.max() <= grenze:
        return x
    # Verstärkung je Probe, geglättet mit 5 ms Vorlauf und 80 ms Rücklauf
    g = np.minimum(1.0, grenze / np.maximum(hull, 1e-9))
    w = int(0.005 * SR)
    g = _min_filter(g, w)
    a = np.exp(-1 / (0.08 * SR))
    # Startzustand = erste Verstärkung, sonst blendet der Glätter jeden Klang am Anfang ein
    gl, _ = signal.lfilter([1 - a], [1, -a], g, zi=[a * g[0]])
    gl = np.minimum(gl, g)
    return (x * gl[:, None]).astype(np.float32)


def _min_filter(g, w):
    from scipy.ndimage import minimum_filter1d
    return minimum_filter1d(g, size=2 * w + 1, origin=0)


# ---------- Filter ----------
def tiefpass(x, hz, ordnung=2):
    sos = signal.butter(ordnung, hz, 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def hochpass(x, hz, ordnung=2):
    sos = signal.butter(ordnung, hz, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def bandpass(x, lo, hi, ordnung=2):
    sos = signal.butter(ordnung, [lo, hi], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def blende(x, ein=0.0, aus=0.0):
    y = x.copy()
    if ein > 0:
        n = min(len(y), int(ein * SR)); y[:n] *= np.sin(np.linspace(0, np.pi / 2, n))[:, None] ** 2
    if aus > 0:
        n = min(len(y), int(aus * SR)); y[-n:] *= np.cos(np.linspace(0, np.pi / 2, n))[:, None] ** 2
    return y


def mono_breit(x, breite=1.0):
    m = x.mean(1, keepdims=True); s = (x[:, :1] - x[:, 1:]) / 2
    return np.concatenate([m + s * breite, m - s * breite], 1).astype(np.float32)


# ---------- Hall ----------
_rng = np.random.default_rng(1956)


def _ir(art):
    if art == 'raum':        # kleine Stube, Holz
        t60, laenge, vor, tief = 0.45, 0.7, 0.006, 6000
    elif art == 'kirche':    # Barockkirche aus Stein
        t60, laenge, vor, tief = 3.0, 4.0, 0.03, 4500
    elif art == 'stein':     # kleiner Steinraum, Leichenhaus
        t60, laenge, vor, tief = 0.9, 1.3, 0.004, 7000
    elif art == 'hof':       # zwischen Häusern draußen
        t60, laenge, vor, tief = 0.7, 1.2, 0.02, 5000
    elif art == 'tal':       # Echo von den Berghängen
        t60, laenge, vor, tief = 3.5, 5.0, 0.0, 2500
    else:
        raise ValueError(art)
    n = int(laenge * SR)
    t = np.arange(n) / SR
    ir = _rng.standard_normal((n, 2)) * np.exp(-6.91 * t / t60)[:, None]
    ir = tiefpass(ir, tief)
    if art == 'tal':
        # einzelne Rückwürfe von den Hängen, jeder dumpfer und leiser
        ir *= 0.25
        for i, (d, g) in enumerate([(0.42, 0.55), (0.95, 0.4), (1.6, 0.28), (2.35, 0.18), (3.2, 0.1)]):
            k = int(d * SR)
            ir[k:k + 1, i % 2] += g
            ir[k:k + 1, 1 - i % 2] += g * 0.6
        ir = tiefpass(ir, 2200)
    ir[:int(vor * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(0).mean())
    return ir.astype(np.float32)


_IR = {}


def hall(x, art, nass=0.3, trocken=1.0, ausklang=None):
    if art not in _IR:
        _IR[art] = _ir(art)
    ir = _IR[art]
    pad = len(ir) if ausklang is None else int(ausklang * SR)
    xp = np.concatenate([x, np.zeros((pad, 2), np.float32)])
    w = np.stack([signal.fftconvolve(xp[:, c], ir[:, c])[:len(xp)] for c in range(2)], 1)
    w *= np.sqrt((x ** 2).mean()) / (np.sqrt((w[:len(x)] ** 2).mean()) + 1e-12)
    return (xp * trocken + w * nass).astype(np.float32)


def dumpf(x, hz=650, raum=0.25):
    """Wie durch eine Wand oder Tür: hohe Töne weg, etwas Raum dazu."""
    y = tiefpass(hochpass(x, 70), hz, 4)
    return hall(y, 'raum', raum)


def fern(x, hz=3000, art='hof', nass=0.6):
    """Weit weg im Freien: weniger Höhen, mehr Hall als direkter Klang."""
    y = tiefpass(hochpass(x, 120), hz, 2)
    return hall(y, art, nass, trocken=0.6)


# ---------- Mischen ----------
def lege(ziel_s, *spuren):
    """spuren: (zeit_s, klang, gain_db). Legt alles auf eine Spur der Länge ziel_s (oder länger)."""
    ende = max([ziel_s] + [t + sek(k) for t, k, _ in spuren])
    y = np.zeros((int(ende * SR) + 1, 2), np.float32)
    for t, k, g in spuren:
        a = int(t * SR); y[a:a + len(k)] += k * db(g)
    return y


def kette(*teile, ueber=0.0):
    """Hängt Teile aneinander, mit Überblendung in Sekunden."""
    y = teile[0]
    n = int(ueber * SR)
    for t in teile[1:]:
        if n and len(y) > n and len(t) > n:
            f = np.linspace(0, 1, n)[:, None]
            mitte = y[-n:] * np.cos(f * np.pi / 2) + t[:n] * np.sin(f * np.pi / 2)
            y = np.concatenate([y[:-n], mitte, t[n:]])
        else:
            y = np.concatenate([y, t])
    return y.astype(np.float32)


# ---------- Schleifen ----------
def schleife(x, ueber=2.0):
    """Macht aus x eine nahtlose Schleife: das Ende wird gleichmäßig über den Anfang geblendet.
    Gibt den Schleifenkörper zurück (Länge = len(x) - ueber)."""
    n = int(ueber * SR)
    k = x[:-n].copy()
    f = np.linspace(0, 1, n)[:, None]
    # gleichleistend überblenden: Schwanz läuft aus, Anfang läuft ein
    k[:n] = x[-n:] * np.cos(f * np.pi / 2) + x[:n] * np.sin(f * np.pi / 2)
    return k.astype(np.float32)


def mit_vorlauf(koerper, vor=0.5):
    """Schreibt die Schleife mit je 0,5 s Wiederholung davor und danach. In der App läuft die Schleife
    von loopStart = vor bis loopEnd = vor + Länge. Weil die Datei periodisch ist, bleibt die Naht sauber,
    auch wenn der MP3-Dekoder am Anfang ein paar Millisekunden verschiebt."""
    n = int(vor * SR)
    return np.concatenate([koerper[-n:], koerper, koerper[:n]]).astype(np.float32)


# ---------- Ausgabe ----------
def schreibe_mp3(x, pfad, kbps=96):
    roh = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                    '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', pfad], input=roh, check=True)


def schreibe_wav(x, pfad):
    roh = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', pfad], input=roh, check=True)


def als_js(mp3_pfad, js_pfad, schluessel):
    b = base64.b64encode(open(mp3_pfad, 'rb').read()).decode('ascii')
    with open(js_pfad, 'w') as f:
        f.write(f"window.LAHNREIT_TON&&window.LAHNREIT_TON({schluessel!r},'{b}');\n")


def huelle(x, fenster=0.05):
    """Pegelverlauf in dB je Fenster, zum Finden von Schlägen und Pausen."""
    m = x.mean(1); w = int(fenster * SR); n = len(m) // w
    return 20 * np.log10(np.sqrt((m[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)


def einsaetze(x, schwelle=12, abstand=0.15):
    """Zeitpunkte, an denen der Pegel sprunghaft steigt (Schläge, Tritte)."""
    h = huelle(x, 0.01)
    d = np.diff(h, prepend=h[0])
    t, letzte = [], -9
    for i, v in enumerate(d):
        if v > schwelle and h[i] > h.max() - 35 and (i - letzte) * 0.01 > abstand:
            t.append(round(i * 0.01, 2)); letzte = i
    return t
