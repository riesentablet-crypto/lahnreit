// Lahnreit 1956 · Klang
// Unter einer Szene laufen leise Schleifen (eine »Lage«), dazu spielt die Spielleitung Einzelklänge auf Knopfdruck.
// Läuft ohne Server: jede MP3 steckt als base64 in klang/<id>.js und meldet sich über window.LAHNREIT_TON.
// Liest window.LAHNREIT_KLANG_DATEIEN (Dateien, Schleifenpunkte) und window.LAHNREIT_KLANG (Rezepte je Seite).
(function () {
  'use strict';

  const F = window.LAHNREIT_KLANG_DATEIEN || { schichten: {}, knoepfe: {} };
  const R = window.LAHNREIT_KLANG || { seiten: {}, erzaehlungen: [], pegel: {} };
  const AC = window.AudioContext || window.webkitAudioContext;
  const db = (g) => Math.pow(10, g / 20);
  const jetzt = () => (window.performance ? performance.now() : Date.now());

  // ---------- Dateien laden ----------
  const roh = {};            // Kennung -> base64, bis es dekodiert ist
  const wartende = {};       // Kennung -> Rückrufe, die auf das Skript warten
  const puffer = new Map();  // Kennung -> { buf, zeit, bytes }
  const unterwegs = {};      // Kennung -> Promise
  const BUDGET = 240e6;      // so viel dekodierter Klang bleibt im Speicher (Bytes)
  let belegt = 0;

  window.LAHNREIT_TON = (key, b64) => {
    roh[key] = b64;
    const w = wartende[key];
    if (w) { delete wartende[key]; w.forEach((f) => f.ok()); }
  };

  function skript(key) {
    if (roh[key]) return Promise.resolve();
    return new Promise((ok, fehler) => {
      const schon = !!wartende[key];
      (wartende[key] = wartende[key] || []).push({ ok, fehler });
      if (schon) return;
      const s = document.createElement('script');
      s.src = `klang/${key}.js`;
      s.onload = () => s.remove();
      s.onerror = () => {
        s.remove();
        const w = wartende[key] || [];
        delete wartende[key];
        w.forEach((f) => f.fehler(new Error(`Klangdatei fehlt: klang/${key}.js`)));
      };
      document.head.appendChild(s);
    });
  }
  function dekodiere(ab) {
    return new Promise((ok, fehler) => {
      // ältere Safari kennen nur die Rückruf-Form
      const r = ctx.decodeAudioData(ab, ok, fehler);
      if (r && r.then) r.then(ok, fehler);
    });
  }
  function lade(key) {
    const p = puffer.get(key);
    if (p) { p.zeit = jetzt(); return Promise.resolve(p.buf); }
    if (unterwegs[key]) return unterwegs[key];
    unterwegs[key] = skript(key).then(() => {
      const bin = atob(roh[key]);
      delete roh[key];
      const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return dekodiere(u.buffer);
    }).then((buf) => {
      delete unterwegs[key];
      const bytes = buf.length * buf.numberOfChannels * 4;
      puffer.set(key, { buf, zeit: jetzt(), bytes });
      belegt += bytes;
      aufraeumen();
      return buf;
    }, (e) => { delete unterwegs[key]; throw e; });
    return unterwegs[key];
  }
  // Das Tablet hat wenig Speicher: was am längsten nicht gebraucht wurde und gerade nicht klingt, fliegt raus.
  function aufraeumen() {
    if (belegt <= BUDGET) return;
    const inGebrauch = new Set();
    if (aktiv) aktiv.dateien.forEach((k) => inGebrauch.add(k));
    klingend.forEach((l) => l.dateien.forEach((k) => inGebrauch.add(k)));
    Object.values(spielend).forEach((e) => e.quellen.forEach((q) => inGebrauch.add(q.key)));
    const alt = [...puffer.entries()].filter(([k]) => !inGebrauch.has(k)).sort((a, b) => a[1].zeit - b[1].zeit);
    for (const [k, p] of alt) {
      if (belegt <= BUDGET) break;
      puffer.delete(k);
      belegt -= p.bytes;
    }
  }

  // ---------- Tonweg ----------
  let ctx = null, laut = null;
  let lautWert = 0.8;
  const VOR = db(4);          // die Dateien sind leise gemischt; der Begrenzer fängt die Spitzen
  function bereit() {
    if (!AC) return false;
    if (!ctx) {
      // iPad: sonst schweigt der Klang, wenn der Stummschalter an ist
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* älteres Safari */ }
      ctx = new AC();
      const grenze = ctx.createDynamicsCompressor();
      grenze.threshold.value = -4; grenze.knee.value = 0; grenze.ratio.value = 20;
      grenze.attack.value = 0.003; grenze.release.value = 0.25;
      laut = ctx.createGain();
      laut.gain.value = lautWert * lautWert * VOR;
      laut.connect(grenze);
      grenze.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function rampe(param, ziel, sek) {
    const t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(ziel, t + sek);
  }

  // ---------- Rezepte ----------
  function rezept(id) {
    return R.seiten[id] || (R.erzaehlungen || []).find((e) => e.id === id) || null;
  }
  const knopfId = (k) => (Array.isArray(k) ? k[0] : k);
  function vorschlag(id, uhr) {
    const rz = rezept(id);
    if (!rz || !rz.lagen.length) return -1;
    const n = rz.uhr && rz.uhr[uhr];
    return typeof n === 'number' && rz.lagen[n] ? n : 0;
  }
  function titel(id) {
    const k = F.knoepfe[id] || F.schichten[id];
    return k ? k.titel : id;
  }

  // ---------- Lagen ----------
  let aktiv = null;     // die gewählte Lage: { seite, nr, name, bus, quellen, timer, dateien, bereit }
  const klingend = new Set();  // alle Lagen, die gerade hörbar sind (beim Überblenden zwei)
  let fehlerText = '';

  function lageAn(seite, nr) {
    const rz = rezept(seite), L = rz && rz.lagen[nr];
    if (!L || !bereit()) return;
    const vorher = aktiv;
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(laut);
    const neu = { seite, nr, name: L.name, bus, quellen: [], timer: [], dateien: L.s.map((s) => s[0]), bereit: false };
    aktiv = neu;
    fehlerText = '';
    melde();
    Promise.all(L.s.map(([key]) => lade(key))).then((bufs) => {
      if (aktiv !== neu) { bus.disconnect(); return; }
      const t = ctx.currentTime + 0.05;
      L.s.forEach(([key, g, opt], i) => {
        const info = F.schichten[key], buf = bufs[i];
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.loopStart = info.start;
        src.loopEnd = Math.min(info.ende, buf.duration);
        const gain = ctx.createGain();
        gain.gain.value = db(g);
        let kette = src;
        if (opt && opt.tief) {
          const f = ctx.createBiquadFilter();
          f.type = 'lowpass'; f.frequency.value = opt.tief; f.Q.value = 0.5;
          src.connect(f); kette = f;
        }
        kette.connect(gain);
        gain.connect(bus);
        // jede Schicht beginnt an einer anderen Stelle, damit es nie gleich klingt
        src.start(t, info.start + Math.random() * (src.loopEnd - info.start));
        neu.quellen.push(src);
      });
      bus.gain.setValueAtTime(0, t);
      bus.gain.linearRampToValueAtTime(1, t + 3);
      neu.bereit = true;
      (L.zufall || []).forEach((z) => planeZufall(neu, z, true));
      klingend.forEach((l) => ausblenden(l, 3));
      klingend.add(neu);
      melde();
    }).catch((e) => {
      if (aktiv === neu) { aktiv = vorher; fehlerText = e.message; }
      bus.disconnect();
      melde();
    });
  }
  function ausblenden(l, sek) {
    l.timer.forEach((t) => clearTimeout(t));
    l.timer = [];
    klingend.delete(l);
    if (!l.bereit) { l.bus.disconnect(); return; }
    rampe(l.bus.gain, 0, sek);
    setTimeout(() => {
      l.quellen.forEach((s) => { try { s.stop(); } catch (e) { /* schon aus */ } });
      l.bus.disconnect();
    }, sek * 1000 + 150);
  }
  function lageAus(sek = 2) {
    aktiv = null;
    [...klingend].forEach((l) => ausblenden(l, sek));
    melde();
  }
  // Zufallsklänge: kommen von selbst, in unregelmäßigem Abstand, und gehen mit der Lage leiser
  function planeZufall(l, z, erstes) {
    const [id, g, von, bis] = z;
    const warte = (erstes ? von / 2 : von) + Math.random() * (bis - von);
    l.timer.push(setTimeout(() => {
      if (aktiv !== l) return;
      spiele(id, g, l.bus, false);
      planeZufall(l, z, false);
    }, warte * 1000));
  }

  // ---------- Knöpfe ----------
  const spielend = {};  // Knopf -> { laden, quellen: Set({ src, gain, key }) }
  const zuletzt = {};
  // Lange Klänge (Glocken, Musik) stoppt ein zweiter Druck; kurze (Böller, Klopfen) spielt er noch einmal.
  const istLang = (id) => F.knoepfe[id] && Math.max(...F.knoepfe[id].fassungen.map((f) => f.dauer)) > 12;

  function knopf(id, extra = 0) {
    if (!F.knoepfe[id] || !bereit()) return;
    fehlerText = '';
    if (spielend[id] && istLang(id)) { knopfAus(id, 0.6); return; }
    spiele(id, extra, laut, true);
  }
  function spiele(id, extra, ziel, sichtbar) {
    const info = F.knoepfe[id];
    const n = info.fassungen.length;
    let i = Math.floor(Math.random() * n);
    if (n > 1 && i === zuletzt[id]) i = (i + 1) % n;
    zuletzt[id] = i;
    const key = info.fassungen[i].datei;
    const pegel = (R.pegel[id] || 0) + extra;
    let e = null;
    if (sichtbar) {
      e = spielend[id] = spielend[id] || { laden: 0, quellen: new Set() };
      e.laden++;
      melde();
    }
    lade(key).then((buf) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = db(pegel);
      src.connect(gain);
      gain.connect(ziel);
      src.start();
      if (!e) return;
      e.laden--;
      if (spielend[id] !== e) { try { src.stop(); } catch (x) { /* egal */ } return; }
      const q = { src, gain, key };
      e.quellen.add(q);
      src.onended = () => {
        e.quellen.delete(q);
        if (!e.quellen.size && !e.laden && spielend[id] === e) { delete spielend[id]; melde(); }
      };
      melde();
    }).catch((x) => {
      fehlerText = x.message;
      if (e) { e.laden--; if (!e.quellen.size && !e.laden && spielend[id] === e) delete spielend[id]; }
      melde();
    });
  }
  function knopfAus(id, sek = 0.4) {
    const e = spielend[id];
    if (!e) return;
    delete spielend[id];
    e.quellen.forEach((q) => {
      rampe(q.gain.gain, 0, sek);
      try { q.src.stop(ctx.currentTime + sek + 0.05); } catch (x) { /* egal */ }
    });
    melde();
  }
  function allesAus() {
    lageAus(1.5);
    Object.keys(spielend).forEach((id) => knopfAus(id, 1));
  }
  function setzeLaut(v) {
    lautWert = Math.max(0, Math.min(1, v));
    if (ctx) rampe(laut.gain, lautWert * lautWert * VOR, 0.1);
  }

  // Die Klänge einer Seite schon einmal holen, sobald der Klang einmal lief, damit der erste Druck sofort klingt
  function vorladen(id, uhr) {
    if (!ctx) return;
    const rz = rezept(id);
    if (!rz) return;
    const keys = [];
    const n = vorschlag(id, uhr);
    if (n >= 0) rz.lagen[n].s.forEach((s) => keys.push(s[0]));
    rz.knoepfe.forEach((k) => (F.knoepfe[knopfId(k)] || { fassungen: [] }).fassungen.forEach((f) => keys.push(f.datei)));
    let i = 0;
    const weiter = () => { if (i < keys.length) lade(keys[i++]).catch(() => {}).then(() => setTimeout(weiter, 30)); };
    setTimeout(weiter, 400);
  }

  // ---------- Melden ----------
  const hoerer = [];
  let gemeldet = false;
  function melde() {
    if (gemeldet) return;
    gemeldet = true;
    requestAnimationFrame(() => { gemeldet = false; hoerer.forEach((f) => f()); });
  }
  function status() {
    return {
      seite: aktiv ? aktiv.seite : null,
      nr: aktiv ? aktiv.nr : -1,
      name: aktiv ? aktiv.name : '',
      bereit: aktiv ? aktiv.bereit : false,
      knoepfe: Object.keys(spielend),
      laut: lautWert,
      fehler: fehlerText,
    };
  }

  window.LahnreitKlang = {
    moeglich: !!AC && Object.keys(F.schichten).length > 0,
    rezept, vorschlag, titel, knopfId, status, vorladen,
    lageAn, lageAus, knopf, knopfAus, allesAus,
    laut: setzeLaut,
    beiAenderung: (f) => hoerer.push(f),
    erzaehlungen: () => R.erzaehlungen || [],
    alleKnoepfe: () => {
      const ohne = (t) => t.replace(/^(Der|Die|Das|Ein|Eine) /, '');
      return Object.entries(F.knoepfe).map(([id, k]) => ({ id, titel: k.titel })).sort((a, b) => ohne(a.titel).localeCompare(ohne(b.titel), 'de'));
    },
  };
})();
