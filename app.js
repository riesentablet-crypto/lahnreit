// Lahnreit 1956 · Spielleitung
// Drei Ebenen: Szene oder Ort als Mitte, das Gespräch daneben, alles Weitere auf Klick.
// Liest window.LAHNREIT (data/lahnreit-daten.js) und window.LAHNREIT_PLAENE (data/grundrisse.js).
(function () {
  'use strict';

  const D = window.LAHNREIT;
  const PL = window.LAHNREIT_PLAENE || {};
  const STUFEN = ['feindselig', 'skeptisch', 'neutral', 'kooperativ', 'freundlich'];
  const ERM = [
    { k: 'B', name: 'Brandl' },
    { k: 'Hd', name: 'Hagedorn' },
    { k: 'Hs', name: 'Hias' },
  ];
  const THEMEN = ['Lindner', 'Donnerstag, der 19.', 'Die Föhnnacht', 'Kasermandl', 'Das Hotel',
    'Der Bürgermeister', 'Der Pfarrer', 'Leni', 'Der Gschwendtner', 'Martl und die Burschen', 'Der Korbi',
    'Der Wimmer-Sepp', 'Die Flüchtlinge', 'Der Jäger und der Direktor', 'Die Kaser', 'Der Stammtisch am 17.',
    'Rauch und die Polizei', 'Georgi und der Maibaum', 'Der Fremde mit dem Hammer', 'Die drei aus München'];
  const UHR = [
    { k: 'morgens', name: 'Morgen' },
    { k: 'nachmittags', name: 'Nachmittag' },
    { k: 'abends', name: 'Abend' },
    { k: 'nachts', name: 'Nacht' },
    { k: 'georgi', name: 'Georgi' },
  ];
  // Szenen mit fester Tageszeit stellen die Uhr, wenn man sie aufruft.
  const SZENEN_UHR = { S1: 'abends', S2: 'abends', S3: 'abends', S4: 'abends', S5: 'nachts', S6: 'morgens',
    S7: 'georgi', S8: 'georgi', S10: 'morgens', S19: 'nachmittags', S25: 'morgens' };
  const KEINE_PLAN_SZENE = new Set(['S25']);

  const PERSONEN = D.personen.personen;
  const P = Object.fromEntries(PERSONEN.map((p) => [p.id, p]));
  const SZENEN = D.szenen.szenen;
  const SZ = Object.fromEntries(SZENEN.map((s) => [s.id, s]));
  const TEILE = D.szenen.teile;
  const ORTE = D.dorf.orte;
  const WO = D.dorf.wo;
  const SONST = D.dorf.sonst;
  // Kurzfassungen (oberste Ebene) und 3D-Figuren
  const KZ = Object.assign({ personen: {}, szenen: {}, orte: {}, nebenfiguren: [] }, window.LAHNREIT_KURZ || {});
  const KP = (pid) => KZ.personen[pid] || null;
  const KS = (sid) => KZ.szenen[sid] || {};
  const KO = (code) => KZ.orte[code] || {};
  const MOD = window.LAHNREIT_MODELLE || {};
  const POR = window.LAHNREIT_PORTRAETS || {};
  const porName = (key) => (P[key] ? P[key].name : (POR[key] && POR[key].name) || (MOD[key] && MOD[key].name) || key);
  const kopfBild = (key, cls = '') => (POR[key] && !(typeof POR[key] === 'object' && !POR[key].kopf) ? `<img class="kopf ${cls}" src="bilder/app/${esc(key)}-kopf.webp" alt="" loading="lazy">` : '');
  const portraetKnopf = (key) => (POR[key] ? `<button type="button" class="g-portraet" data-portraet="${esc(key)}" title="Bild groß zeigen" aria-label="Bild von ${esc(porName(key))} groß zeigen">${kopfBild(key)}</button>` : '');
  // Requisiten: Karten, Ansichtskarten, Handouts
  const REQ_GRUPPEN = window.LAHNREIT_REQUISITEN || [];
  const RQ = Object.fromEntries(REQ_GRUPPEN.flatMap((g) => g.stuecke.map((r) => [r.id, Object.assign({ gruppe: g.titel }, r)])));
  const reqFuer = (art, code) => Object.values(RQ).filter((r) => (r[art] || []).includes(code));
  const reqId = (ort) => (/^R-/.test(ort || '') && RQ[ort.slice(2)] ? ort.slice(2) : null);
  const VB = window.LAHNREIT_VERBINDUNGEN || {};
  const PAF = window.LAHNREIT_PROBEN_AM_FUND || {};
  // Falsche Fährten G und Nebenstränge N aus dem Anhang, zum Antippen (data/anhang.js)
  const ANH = window.LAHNREIT_ANHANG || {};
  // Brandls geheimes Ziel: die drei Frauen (data/frauen.js)
  const FR = window.LAHNREIT_FRAUEN || null;
  const FRAU = FR ? Object.fromEntries(FR.frauen.map((f) => [f.pid, f])) : {};
  // Klang: Schleifen unter der Szene und Einzelklänge (klang.js)
  const KL = window.LahnreitKlang && window.LahnreitKlang.moeglich ? window.LahnreitKlang : null;
  // Spieluhr: Tageszeiten mit Richtzeit am Tisch (data/spieluhr.js)
  const SU = window.LAHNREIT_SPIELUHR && window.LAHNREIT_SPIELUHR.phasen ? window.LAHNREIT_SPIELUHR : null;

  // ---------- Zustand, nur in diesem Browser gespeichert ----------
  const KEY = 'lahnreit-spielleitung-v1';
  // zeit: gespielte Sekunden je Tageszeit, seit: wann die laufende zuletzt gezählt wurde, um: deren Zeit schon abgelaufen ist
  const suLeer = () => ({ an: false, laeuft: false, phase: null, weg: null, zeit: {}, seit: 0, plus: {}, min: {}, um: {} });
  const leer = () => ({ wer: 'B', tat: {}, probe: {}, schloss: {}, ausnahme: {}, treffen: {}, uhr: 'abends', ort: 'S1',
    gespraech: null, kontext: null, gefunden: {}, theme: 'dark', rail: 'szenen', geraet: null, klang: { laut: 0.8 },
    frauen: { wirbt: {}, auf: false }, su: suLeer() });
  let S = leer();
  try {
    const roh = localStorage.getItem(KEY);
    if (roh) S = Object.assign(leer(), JSON.parse(roh));
  } catch (e) { /* ohne Speicher geht es auch */ }
  // Die erste Fassung hat Proben als true gespeichert
  for (const [pid, v] of Object.entries(S.probe)) {
    if (!v || typeof v !== 'object') { delete S.probe[pid]; continue; }
    for (const k of Object.keys(v)) if (v[k] === true) v[k] = 'ue';
  }
  const sichern = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* egal */ } };
  // Tablet oder Laptop: ohne Wahl richtet es sich danach, ob der Bildschirm Finger oder Maus erwartet
  const FINGER = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
  const geraet = () => S.geraet || (FINGER && FINGER.matches ? 'tablet' : 'laptop');
  const tablet = () => geraet() === 'tablet';
  function setzeGeraet() {
    document.documentElement.dataset.geraet = geraet();
    const k = document.getElementById('geraet-knopf');
    if (k) k.setAttribute('aria-pressed', String(tablet()));
  }

  // Was nur für diesen Augenblick gilt
  const T = { frage: '', thema: null, alleThemen: false, medien: {}, plan: {}, s9: 2, oeffne: null, resetFrage: false, overlay: null, reqSl: {}, zeigen: null, treffenWahl: null, suHinweis: null, suReset: false };

  // ---------- Hilfen ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fold = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  const themaKey = (t) => (t === 'Das Kasermandl' ? 'Kasermandl' : t);
  const kurzName = (p) => p.name.replace(/^(Der|Die|Das) /, '');
  const feld = (p, re) => { const e = Object.entries(p.felder).find(([k]) => re.test(k)); return e ? e[1] : ''; };
  const feldName = (p, re) => { const e = Object.entries(p.felder).find(([k]) => re.test(k)); return e ? e[0] : ''; };
  const pron = (p) => (/^Wer sie/.test(feldName(p, /^Wer /)) ? 'sie' : 'er');
  const Pron = (p) => (pron(p) === 'sie' ? 'Sie' : 'Er');
  const akk = (p) => (pron(p) === 'sie' ? 'sie' : 'ihn');
  const uhrName = () => (UHR.find((u) => u.k === S.uhr) || UHR[2]).name;

  function saetze(s, n) {
    const teile = String(s || '').split(/(?<=[.!?«])\s+(?=[A-ZÄÖÜ»])/);
    return teile.slice(0, n).join(' ');
  }
  function verweise(html) {
    return html.replace(/\b([PSDB])(\d{1,2})([ab])?\b|\b([HGNM]\d{1,2}[ab]?)\b/g, (m, art, nr, buchst, tok) => {
      if (tok) return ANH[tok] ? `<span class="tok tok-anh" data-voll="a|${tok}" role="button" tabindex="0" title="${esc(ANH[tok].titel)}">${tok}</span>` : `<span class="tok">${tok}</span>`;
      const id = art + nr;
      if (art === 'P' && P[id]) return `<a class="ref" href="#${id}" data-pid="${id}">${m}</a>`;
      if (art === 'S' && SZ[id]) return `<a class="ref" href="#${id}">${m}</a>`;
      if ((art === 'D' || art === 'B') && ORTE[id]) return `<a class="ref ort" href="#${id}">${m}</a>`;
      return m;
    });
  }
  function inline(s) {
    let h = verweise(esc(s));
    h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    h = h.replace(/\*(.+?)\*/g, '<i>$1</i>');
    return h;
  }
  const flach = (s) => String(s || '').replace(/\*+/g, '').replace(/^>\s?/gm, '').replace(/\s+/g, ' ').trim();
  function zellen(zeile) {
    return zeile.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  }
  function tabelle(kopf, zeilen) {
    return `<div class="tabelle"><table><thead><tr>${kopf.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
      zeilen.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function md(src) {
    const L = String(src || '').split('\n');
    let out = '', i = 0;
    const special = (l) => /^(#{1,6} |\||>|- |\d+\. )/.test(l);
    while (i < L.length) {
      const l = L[i];
      if (!l.trim()) { i++; continue; }
      let m;
      if ((m = l.match(/^(#{1,6}) (.*)$/))) {
        const n = Math.min(Math.max(m[1].length + 1, 3), 4);
        out += `<h${n}>${inline(m[2])}</h${n}>`; i++; continue;
      }
      if (l.startsWith('|')) {
        const block = [];
        while (i < L.length && L[i].startsWith('|')) block.push(L[i++]);
        const kopf = zellen(block[0]);
        const zeilen = block.slice(1).filter((z) => !/^\|\s*:?-{2,}/.test(z)).map(zellen);
        out += tabelle(kopf, zeilen); continue;
      }
      if (l.startsWith('>')) {
        const block = [];
        while (i < L.length && L[i].startsWith('>')) block.push(L[i++].replace(/^>\s?/, ''));
        const absaetze = block.join('\n').split(/\n\s*\n/).filter((x) => x.trim());
        out += `<blockquote>${absaetze.map((a) => `<p>${inline(a.replace(/\n/g, ' '))}</p>`).join('')}</blockquote>`; continue;
      }
      if (/^- /.test(l)) {
        const items = [];
        while (i < L.length && /^- /.test(L[i])) items.push(L[i++].slice(2));
        out += `<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`; continue;
      }
      if ((m = l.match(/^(\d+)\. /))) {
        const start = m[1], items = [];
        while (i < L.length && /^\d+\. /.test(L[i])) items.push(L[i++].replace(/^\d+\. /, ''));
        out += `<ol start="${start}">${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`; continue;
      }
      const par = [];
      while (i < L.length && L[i].trim() && !special(L[i])) par.push(L[i++]);
      out += `<p>${inline(par.join(' '))}</p>`;
    }
    return `<div class="md">${out}</div>`;
  }
  // Fund-Text: Beschreibung, dann »Was es heißt« und »Wohin es führt« als eigene Zeilen
  function fundText(src) {
    const s = String(src || '');
    const a = s.split(/\*Was es heißt:\*/);
    if (a.length < 2) return md(s);
    const b = a[1].split(/\*Wohin es führt:\*/);
    let h = md(a[0]);
    h += `<p class="heisst"><span class="etikett">Was es heißt</span> ${inline(b[0].trim())}</p>`;
    if (b[1]) h += `<p class="fuehrt"><span class="etikett">Wohin es führt</span> ${inline(b[1].trim())}</p>`;
    return h;
  }
  // Kurzfassung zum Antippen: dann kommt der ganze Text als Kontextfenster
  const tipp = (key, html, cls = '') => `<div class="tippbar ${cls}" data-voll="${esc(key)}" role="button" tabindex="0" title="Antippen für den ganzen Text">${html}</div>`;
  const stich = (arr) => (arr && arr.length ? `<ul class="stich">${arr.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>` : '');
  const reihe = (arr) => (arr || []).map(inline).join(' <span class="trenner">·</span> ');
  const modellKnopf = (key) => (key && MOD[key] ? `<button type="button" class="knopf klein modell-knopf" data-modell="${esc(key)}" title="Figur in 3D zeigen">3D</button>` : '');
  const modellNeben = (wer) => Object.keys(MOD).find((k) => MOD[k].neben && wer.includes(MOD[k].neben));
  const klapp = (html, zeilen = 2) => `<div class="klapp z${zeilen}"><div class="kt">${html}</div><button type="button" class="kk" data-klapp>mehr</button></div>`;
  function markiere(el, q) {
    if (!q || !el) return;
    const nq = fold(q);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const t = n.nodeValue, ft = fold(t);
      if (ft.length !== t.length) continue;
      let pos = ft.indexOf(nq);
      if (pos < 0) continue;
      const frag = document.createDocumentFragment();
      let last = 0;
      while (pos >= 0) {
        frag.append(t.slice(last, pos));
        const mk = document.createElement('mark');
        mk.textContent = t.slice(pos, pos + nq.length);
        frag.append(mk);
        last = pos + nq.length;
        pos = ft.indexOf(nq, last);
      }
      frag.append(t.slice(last));
      n.replaceWith(frag);
    }
  }

  // ---------- Haltungen ----------
  const hatSchloss = (p) => Object.keys(p.felder).some((k) => /Schloss/.test(k));
  function grund(pid, k) {
    const p = P[pid];
    if (S.ausnahme[pid]) return 0;
    let base = STUFEN.indexOf(p.start[k]);
    if (base < 0) base = 2;
    return Math.max(0, Math.min(4, base + (S.tat[pid] || 0)));
  }
  const probeVon = (pid, k) => (S.probe[pid] && S.probe[pid][k]) || null;
  function stufe(pid, k) {
    const g = grund(pid, k);
    const pr = probeVon(pid, k);
    if (pr === 'ein') return Math.min(4, g + 1);
    if (pr === 'ue' && g > 0) return Math.min(4, g + 1);
    return g;
  }
  const punkte = (pid) => ERM.map((e) => { const i = stufe(pid, e.k); return `<span class="dot st-${i}" title="${e.name}: ${STUFEN[i]}"></span>`; }).join('');
  function wuerfel(i) {
    if (i === 4) return 'Bonuswürfel auf soziale Proben';
    if (i === 0) return 'Strafwürfel auf soziale Proben';
    return 'keine Würfeländerung';
  }

  function rang(p, r, k) {
    if (r.stufe) {
      const need = STUFEN.indexOf(r.stufe);
      return { offen: stufe(p.id, k) >= need, rang: need };
    }
    if (/^Schloss offen/.test(r.ab)) return { offen: !!S.schloss[p.id], rang: 6, bedingt: /kritisch/.test(r.ab) };
    if (/^Schloss zu/.test(r.ab)) return { offen: !S.schloss[p.id], rang: 5 };
    if (r.ab === 'immer') return { offen: true, rang: -1 };
    return { bedingt: true };
  }
  function themenGruppen(p) {
    const g = new Map();
    for (const r of p.katalog) {
      const key = themaKey(r.thema);
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(r);
    }
    const ordnung = (t) => { const i = THEMEN.indexOf(t); return i < 0 ? 100 : i; };
    return [...g.entries()].sort((a, b) => ordnung(a[0]) - ordnung(b[0]));
  }
  const STOP = new Set(['der', 'die', 'das', 'und', 'drei', 'aus', 'beim', 'dem', 'den']);
  // Stichwörter, die das Buch anders nennt: Wer nach der Kurve fragt, meint die Lahnkehre (G8)
  const STICH = [[/(^|\s)(kurve|kurven|kehre|lahnkehre|boschung|isabella|borgward|zirngibl|autounfall)(\s|$)/, /\bg8\b/]];
  function textPasst(text, nq) {
    const ft = fold(text);
    return ft.includes(nq) || STICH.some(([q, t]) => q.test(nq) && t.test(ft));
  }
  function themaPasst(t, nq) {
    const ft = fold(t);
    if (ft.includes(nq)) return true;
    return ft.split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOP.has(w)).some((w) => nq.includes(w));
  }
  function wissende(t, q, ohne) {
    const nq = q ? fold(q) : null;
    return PERSONEN.filter((x) => x.id !== ohne && x.katalog.some((r) => (t ? themaKey(r.thema) === t : (themaPasst(r.thema, nq) || textPasst(r.text, nq)))));
  }
  const andereHTML = (L) => (L.length ? `<div class="ak-andere">Etwas dazu wissen: ${L.slice(0, 8).map((x) => `<a href="#${x.id}" data-pid="${x.id}">${esc(kurzName(x))}</a>`).join(', ')}</div>` : '');

  // Antwort auf ein Stichwort, so wie sie der Fragende jetzt bekommt
  function antwortKarte(p, t, rows, k) {
    const er = pron(p), Er = Pron(p);
    const st = stufe(p.id, k);
    let h = `<div class="ak"><div class="ak-thema">${esc(t)}</div>`;
    if (!rows.length) {
      return h + `<div class="ak-nichts">${Er} weiß dazu nichts oder hat keine Meinung.</div>${andereHTML(wissende(t, null, p.id))}</div>`;
    }
    const info = rows.map((r) => ({ r, x: rang(p, r, k) }));
    const normal = info.filter((i) => !i.x.bedingt);
    const bedingt = info.filter((i) => i.x.bedingt);
    let best = null;
    for (const i of normal) if (i.x.offen && (!best || i.x.rang > best.x.rang)) best = i;
    if (best) {
      const ab = best.r.stufe ? `ab ${best.r.stufe}` : best.r.ab;
      h += `<div class="ak-jetzt">${inline(best.r.text)}</div><div class="ak-ab">${esc(ab)}</div>`;
    } else if (normal.length) {
      h += `<div class="ak-nichts">Bei ${STUFEN[st]} sagt ${er} dazu nichts.</div>`;
    }
    for (const { r } of bedingt) {
      h += `<div class="ak-bedingt"><span class="bed">nur ${esc(r.ab)}</span><div>${inline(r.text)}</div></div>`;
    }
    const hoeher = normal.filter((i) => !i.x.offen).sort((a, b) => a.x.rang - b.x.rang);
    if (hoeher.length) {
      const erste = hoeher[0].r.stufe ? `Ab ${hoeher[0].r.stufe}` : `Mit ${hoeher[0].r.ab.toLowerCase()}`;
      h += `<details class="ak-mehr"><summary>${esc(erste)} sagt ${er} mehr</summary>${hoeher.map(({ r }) =>
        `<div class="ak-zeile"><span class="bed">${esc(r.stufe ? 'ab ' + r.stufe : r.ab)}</span><div>${inline(r.text)}</div></div>`).join('')}</details>`;
    }
    return h + '</div>';
  }

  // ---------- Wo ist wer ----------
  // Verabredungen sind die Ausnahme: Die Spielleitung holt eine Person für diese Tageszeit an einen anderen Ort.
  // Sie gelten nur zur Tageszeit, zu der sie eingetragen wurden; danach ist die Person wieder nach Plan unterwegs.
  const treffenJetzt = () => (S.treffen && S.treffen[S.uhr]) || {};
  const ortKurz = (c) => (ORTE[c] ? ORTE[c].name.replace(/^(Der|Die|Das) /, '') : c);
  function leuteAmOrt(code) {
    const tr = treffenJetzt();
    const out = [];
    for (const p of PERSONEN) {
      if (tr[p.id]) { if (tr[p.id] === code) out.push({ pid: p.id, text: '', treffen: true }); continue; }
      const w = WO[p.id] && WO[p.id][S.uhr];
      if (w && w.orte.includes(code)) out.push({ pid: p.id, text: w.text });
    }
    return out;
  }
  // Wer laut Plan hier wäre, aber gerade woanders verabredet ist
  const wegVerabredet = (code) => Object.entries(treffenJetzt())
    .filter(([pid, ziel]) => ziel !== code && P[pid] && WO[pid] && WO[pid][S.uhr] && WO[pid][S.uhr].orte.includes(code));
  function treffenHTML(code) {
    const da = new Set(leuteAmOrt(code).map((l) => l.pid));
    let h = '';
    const weg = wegVerabredet(code);
    if (weg.length) h += `<p class="treffen-weg">Laut Plan auch hier, aber verabredet: ${weg.map(([pid, ziel]) => `${esc(kurzName(P[pid]))} (<a class="ref" href="#${ziel}">${ziel}</a>)`).join(', ')}</p>`;
    if (T.treffenWahl !== code) return h + `<button type="button" class="leise klein treffen-auf" data-treffen-auf="${code}">+ Verabredung hier</button>`;
    const tr = treffenJetzt();
    const wahl = PERSONEN.filter((p) => !da.has(p.id)).map((p) => {
      const w = WO[p.id] && WO[p.id][S.uhr];
      const jetzt = tr[p.id] ? `verabredet in ${ortKurz(tr[p.id])}` : (w && w.orte.length ? w.orte.map(ortKurz).join(' / ') : 'daheim');
      return `<option value="${p.id}">${esc(kurzName(p))} (jetzt: ${esc(jetzt)})</option>`;
    }).join('');
    return h + `<div class="treffen-wahl"><label for="treffen-wahl">Wer ist hier verabredet? Gilt nur am ${esc(uhrName())}.</label>
      <select id="treffen-wahl" data-ort="${code}"><option value="">Person wählen …</option>${wahl}</select>
      <button type="button" class="leise klein" data-treffen-zu>Abbrechen</button></div>`;
  }
  function treffenZeile(l) {
    const w = WO[l.pid] && WO[l.pid][S.uhr];
    const sonst = w && w.text ? `Sonst um diese Zeit: ${inline(w.text)}` : 'Sonst um diese Zeit daheim.';
    return `<li class="treffen-li" data-tut="Verabredet, nur am ${esc(uhrName())}.">${personKnopf(l.pid)}<div class="tut"><span class="treffen-marke">verabredet</span> ${sonst} <button type="button" class="leise klein treffen-loesen" data-treffen-weg="${l.pid}">Lösen</button></div></li>`;
  }
  const nebenAmOrt = (code) => SONST.filter((x) => x.orte.includes(code));
  const kurzNeben = (wer) => wer.split(',')[0].replace(/^(der|die) /, '');

  // ---------- Bilder ----------
  const ENDUNGEN = ['webp', 'png', 'jpg'];
  const BILDTEXT = {};
  const BILD_TITEL = Object.fromEntries((D.bilder || []).map((b) => [b.code, b.titel]));
  // Alle Bilder, die das Handbuch bei einem Ort nennt. »S15« steht für S15a und S15b.
  function ortBilder(o) {
    const codes = [];
    for (const c of (o.bild_md || '').match(/\b[SDB]\d+[ab]?\b/g) || []) {
      const teile = BILD_TITEL[c] ? [c] : [c + 'a', c + 'b'].filter((x) => BILD_TITEL[x]);
      for (const x of teile) if (!codes.includes(x)) codes.push(x);
    }
    if (!codes.length && o.bild) codes.push(o.bild);
    return codes.map((c) => ({ code: c, text: o.bild_md || `Siehe ${c}.`, titel: BILD_TITEL[c] || o.name }));
  }
  // Solange ein Bild fehlt: erster Satz und »Worauf du zeigst«, der Rest beim Antippen
  function bildKurz(text) {
    const t = flach(text || '');
    const erst = saetze(t, 1);
    const zeig = (t.match(/Worauf du zeigst:.*$/) || [''])[0];
    return zeig && !erst.includes(zeig) ? `${erst} ${zeig}` : erst;
  }
  function bildBox(code, text, titel) {
    BILDTEXT[code] = { text: text || '', titel: titel || '' };
    return `<figure class="bildbox">
      <img src="bilder/szenen/${esc(code)}.webp" alt="${esc(titel || 'Bild ' + code)}" data-code="${esc(code)}" data-versuch="0">
      <div class="bild-fehlt" hidden><div class="bf-kopf">Bild ${esc(code)} fehlt noch</div>${tipp(`b|${code}`, `<div class="bf-text">${inline(bildKurz(text))}</div>`, 'bf-tipp')}</div>
    </figure>`;
  }
  function bildFehler(img) {
    const n = Number(img.dataset.versuch) + 1;
    if (n < ENDUNGEN.length) { img.dataset.versuch = n; img.src = `bilder/szenen/${img.dataset.code}.${ENDUNGEN[n]}`; return; }
    img.hidden = true; img.nextElementSibling.hidden = false;
  }

  // ---------- Grundrisse ----------
  function planFuer(sid) {
    if (KEINE_PLAN_SZENE.has(sid)) return null;
    for (const [code, pl] of Object.entries(PL)) if ((pl.szenen || []).includes(sid)) return code;
    return null;
  }
  function raumFuer(pl, pid, text) {
    for (const [wer, muster, raum] of pl.regeln || []) {
      if (wer && wer !== pid) continue;
      if (new RegExp(muster).test(text || '')) return raum;
    }
    return pl.standard;
  }
  // Wer steht in welchem Raum: aus der Szene, sonst nach Tageszeit
  function planLeute(code, sid) {
    const pl = PL[code];
    const out = [];
    if (sid) {
      const fest = (pl.szenenRaum || {})[sid] || {};
      for (const l of SZ[sid].leute) {
        if (l.personen.length) {
          for (const pid of l.personen) out.push({ pid, raum: fest[pid] || raumFuer(pl, pid, l.tut), name: kurzName(P[pid]) });
        } else {
          const n = Object.keys(pl.neben || {}).find((x) => l.wer.includes(x));
          if (n) out.push({ name: kurzNeben(n), raum: pl.neben[n], neben: true });
        }
      }
    } else {
      for (const { pid, text } of leuteAmOrt(code)) out.push({ pid, raum: raumFuer(pl, pid, text), name: kurzName(P[pid]) });
      for (const x of nebenAmOrt(code)) {
        const n = Object.keys(pl.neben || {}).find((y) => x.wer.includes(y));
        if (n) out.push({ name: kurzNeben(x.wer), raum: pl.neben[n], neben: true });
      }
    }
    return out;
  }
  const inRaum = (r, m) => m.x >= r.x && m.x <= r.x + r.w && m.y >= r.y && m.y <= r.y + r.h;

  function planSVG(code, eb, leute, sel, vis) {
    const pl = PL[code];
    const E = pl.ebenen[eb];
    const H = E.h;
    let s = `<svg class="plan" viewBox="0 0 1000 ${H}" role="group" aria-label="Grundriss ${esc(pl.titel)}, ${esc(E.name)}">`;
    s += `<defs><pattern id="schraffur-${code}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" class="schraffur-linie"/></pattern></defs>`;
    for (const [x, y, w, h, n] of E.geist || []) {
      s += `<rect class="geist" x="${x}" y="${y}" width="${w}" height="${h}"/><text class="geist-text" x="${x + w / 2}" y="${y + h / 2}">${esc(n)}</text>`;
    }
    for (const r of E.raeume) {
      const aktiv = sel.raum === r.id;
      s += `<g class="raum r-${r.art}${r.zu ? ' zu' : ''}${aktiv ? ' aktiv' : ''}" data-raum="${r.id}" tabindex="0" role="button" aria-label="${esc(r.name)}">`;
      s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`;
      if (r.art === 'privat') s += `<rect class="schraffur" fill="url(#schraffur-${code})" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`;
      if (r.w < 90 && r.h > 120) {
        s += `<text class="rname" transform="translate(${r.x + 24},${r.y + r.h - 12}) rotate(-90)">${esc(r.name)}</text>`;
      } else if (r.h < 45) {
        s += `<text class="rname klein" x="${r.x + 10}" y="${r.y + r.h / 2 + 5}">${esc(r.name)}</text>`;
      } else {
        s += `<text class="rname" x="${r.x + 12}" y="${r.y + 26}">${esc(r.name)}${r.zu ? ' · zu' : ''}</text>`;
      }
      s += `</g>`;
    }
    for (const o of E.offen || []) {
      const [x1, y1, x2, y2] = o.dir === 'h' ? [o.x, o.y, o.x + o.l, o.y] : [o.x, o.y, o.x, o.y + o.l];
      s += `<line class="offen-weg" x1="${x1}" y1="${y1 + 2}" x2="${x2}" y2="${y2 - 2}"/><line class="offen-linie" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    for (const m of E.moebel || []) {
      if (m.rund) s += `<circle class="moebel" cx="${m.x + m.w / 2}" cy="${m.y + m.h / 2}" r="${Math.min(m.w, m.h) / 2}"/>`;
      else s += `<rect class="moebel" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="3"/>`;
      if (m.treppe) for (let yy = m.y + 12; yy < m.y + m.h; yy += 14) s += `<line class="stufe" x1="${m.x}" y1="${yy}" x2="${m.x + m.w}" y2="${yy}"/>`;
      if (m.baenke === 'v') for (let xx = m.x + 10; xx < m.x + m.w; xx += 16) s += `<line class="bank" x1="${xx}" y1="${m.y + 6}" x2="${xx}" y2="${m.y + m.h - 6}"/>`;
      else if (m.baenke) for (let yy = m.y + 10; yy < m.y + m.h; yy += 18) s += `<line class="bank" x1="${m.x + 6}" y1="${yy}" x2="${m.x + m.w - 6}" y2="${yy}"/>`;
      if (m.name) {
        if (m.h > m.w * 2.2) s += `<text class="mname" transform="translate(${m.x + m.w / 2 + 5},${m.y + m.h / 2}) rotate(-90)">${esc(m.name)}</text>`;
        else s += `<text class="mname" x="${m.x + m.w / 2}" y="${m.y + m.h / 2 + 5}">${esc(m.name)}</text>`;
      }
    }
    if (E.kette) s += `<circle class="kette" cx="${E.kette.x}" cy="${E.kette.y}" r="${E.kette.r}"/>`;
    for (const [a, b, c, dir] of E.fenster || []) {
      if (dir === 'h') s += `<line class="fenster" x1="${a}" y1="${b}" x2="${c}" y2="${b}"/>`;
      else s += `<line class="fenster" x1="${a}" y1="${b}" x2="${a}" y2="${c}"/>`;
    }
    for (const t of E.tueren || []) {
      const [x1, y1, x2, y2] = t.dir === 'h' ? [t.x, t.y, t.x + t.l, t.y] : [t.x, t.y, t.x, t.y + t.l];
      s += `<line class="tuer${t.zu ? ' zu' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      if (t.name) {
        const tx = t.dir === 'h' ? t.x + t.l / 2 : t.x + (t.x > 500 ? -10 : 10);
        const ty = t.dir === 'h' ? t.y + (t.y > H - 120 ? 24 : -10) : t.y + t.l / 2 + 5;
        const anchor = t.dir === 'h' ? 'middle' : (t.x > 500 ? 'end' : 'start');
        s += `<text class="tname" x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(t.name)}${t.zu ? ' · zu' : ''}</text>`;
      }
    }
    for (const t of E.durchreichen || []) {
      const [x1, y1, x2, y2] = t.dir === 'h' ? [t.x, t.y, t.x + t.l, t.y] : [t.x, t.y, t.x, t.y + t.l];
      s += `<line class="durchreiche" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      s += `<text class="tname" x="${t.dir === 'h' ? t.x + t.l / 2 : t.x + 8}" y="${t.dir === 'h' ? t.y - 8 : t.y + t.l / 2 + 5}" text-anchor="${t.dir === 'h' ? 'middle' : 'start'}">Durchreiche</text>`;
    }
    for (const a of E.aussen || []) {
      if (a.senkrecht) s += `<text class="aussen-text" transform="translate(${a.x},${a.y}) rotate(-90)">${esc(a.text)}</text>`;
      else s += `<text class="aussen-text" x="${a.x}" y="${a.y}">${esc(a.text)}</text>`;
    }
    for (const { m, i, nr } of vis) {
      s += `<g class="marke${sel.marke === i ? ' aktiv' : ''}" data-marke="${i}" tabindex="0" role="button" aria-label="${nr}: ${esc(m.name)}">
        <circle cx="${m.x}" cy="${m.y}" r="${tablet() ? 17 : 12}"/><text x="${m.x}" y="${m.y + (tablet() ? 6 : 5)}">${nr}</text></g>`;
    }
    // Personen als Schildchen unten im Raum
    const proRaum = {};
    for (const l of leute) (proRaum[l.raum] = proRaum[l.raum] || []).push(l);
    for (const r of E.raeume) {
      const L = proRaum[r.id];
      if (!L) continue;
      let x = r.x + 8, y = r.leuteY != null ? r.leuteY : r.y + r.h - 32;
      for (const l of L) {
        const w = Math.round(l.name.length * 8.2 + (l.pid ? 34 : 20));
        if (x + w > r.x + r.w - 6 && x > r.x + 8) { x = r.x + 8; y -= 30; }
        const dot = l.pid ? `<circle class="st-dot st-${stufe(l.pid, S.wer)}" cx="${x + 14}" cy="${y + 12}" r="6"/>` : '';
        s += `<g class="pschild${l.neben ? ' neben' : ''}"${l.pid ? ` data-pid="${l.pid}" tabindex="0" role="button" aria-label="Gespräch mit ${esc(P[l.pid].name)}"` : ''}>
          <rect x="${x}" y="${y}" width="${w}" height="24" rx="12"/>${dot}<text x="${x + (l.pid ? 26 : 10)}" y="${y + 17}">${esc(l.name)}</text></g>`;
        x += w + 6;
      }
    }
    return s + '</svg>';
  }
  const ARTNAME = { oeffentlich: 'öffentlich', gaeste: 'Gästezimmer', privat: 'privat', aussen: 'draußen' };
  // Nummern im Grundriss: in einer Szene nur, was in ihr zu finden ist, am Ort alles. Gezählt wird je Stockwerk.
  const gehoertZu = (ref, sid) => !sid || ref === sid || ref.startsWith(sid + ':');
  function sichtbareMarken(code, sid, eb) {
    const vis = PL[code].ebenen[eb].marken.map((m, i) => ({ m, i })).filter(({ m }) => m.refs.some((r) => gehoertZu(r, sid)));
    vis.forEach((x, k) => { x.nr = k + 1; });
    return vis;
  }
  // Eine Szene schlägt das Stockwerk auf, auf dem es in ihr etwas zu finden gibt, sonst das mit den meisten Leuten
  function startEbene(code, sid, leute) {
    let beste = 0, wert = -1;
    PL[code].ebenen.forEach((E, i) => {
      const w = sichtbareMarken(code, sid, i).length * 100 + leute.filter((l) => E.raeume.some((r) => r.id === l.raum)).length;
      if (w > wert) { wert = w; beste = i; }
    });
    return beste;
  }
  function planHTML(code, sid, mitLeuten = true) {
    const pl = PL[code];
    const key = code + (sid || '');
    const leute = mitLeuten ? planLeute(code, sid) : [];
    if (!T.plan[key]) T.plan[key] = { ebene: sid ? startEbene(code, sid, leute) : 0, raum: null, marke: null };
    const sel = T.plan[key];
    const E = pl.ebenen[sel.ebene];
    const vis = sichtbareMarken(code, sid, sel.ebene);
    let h = `<div class="planbox" data-plan="${key}" data-code="${code}" data-sid="${sid || ''}"${mitLeuten ? '' : ' data-ohne-leute="1"'}>`;
    if (pl.ebenen.length > 1) {
      h += `<div class="ebenen" role="group" aria-label="Stockwerk">${pl.ebenen.map((e, i) => {
        const n = sichtbareMarken(code, sid, i).length;
        return `<button type="button" data-ebene="${i}" aria-pressed="${i === sel.ebene}">${esc(e.name)}${n ? ` <span class="zahl" title="${n} Nummern">${n}</span>` : ''}</button>`;
      }).join('')}</div>`;
    }
    h += `<div class="plan-rahmen">${planSVG(code, sel.ebene, leute, sel, vis)}</div><div class="plan-seite">`;
    const r = E.raeume.find((x) => x.id === sel.raum);
    if (r) {
      const drin = leute.filter((l) => l.raum === r.id);
      h += `<div class="raum-info"><div class="ri-kopf"><b>${esc(r.name)}</b><span class="art a-${r.art}">${ARTNAME[r.art]}</span>${r.zu ? '<span class="art a-zu">abgesperrt</span>' : ''}<button type="button" class="leise klein" data-raum="" aria-label="Raum schließen">×</button></div>`;
      if (r.zuText) h += `<p class="ri-zu">${inline(r.zuText)}</p>`;
      if (r.notiz) h += `<p>${inline(r.notiz)}</p>`;
      if (drin.length) h += `<div class="ri-leute">${drin.map((l) => (l.pid ? personKnopf(l.pid) : `<span class="neben-name">${esc(l.name)}</span>`)).join('')}</div>`;
      h += `</div>`;
    }
    const sonst = pl.ebenen.some((x, i) => i !== sel.ebene && sichtbareMarken(code, sid, i).length);
    h += vis.length ? stellenListe(code, sid, E, vis, sel)
      : `<p class="klein-text plan-leer">${sonst ? 'Auf diesem Stockwerk gibt es nichts mit Nummer.' : sid ? 'In dieser Szene ist hier nichts versteckt. Der Grundriss zeigt, wer wo ist.' : 'Hier ist nichts verzeichnet.'}</p>`;
    h += `<div class="legende"><span class="lg lg-oeffentlich">öffentlich</span><span class="lg lg-gaeste">Gästezimmer</span><span class="lg lg-privat">privat</span><span class="lg lg-zu">abgesperrt</span><span class="lg-tipp">Raum antippen zeigt, was dort ist. Namen öffnen das Gespräch.</span></div>`;
    return h + '</div></div>';
  }
  // Was im Grundriss eine Nummer hat, nach Räumen geordnet. Das ist die einzige Liste dafür auf der Seite.
  function stellenListe(code, sid, E, vis, sel) {
    const gruppen = [];
    for (const x of vis) {
      const r = E.raeume.find((rr) => inRaum(rr, x.m));
      let g = gruppen.find((y) => y.r === r);
      if (!g) gruppen.push((g = { r, xs: [] }));
      g.xs.push(x);
    }
    return `<div class="stellen">${gruppen.map((g) => `<div class="st-gruppe"><div class="st-raum">${g.r ? esc(g.r.name) : 'Draußen'}${g.r && g.r.zu ? ' <span class="art a-zu">abgesperrt</span>' : ''}</div>${g.xs.map((x) => stelleHTML(code, sid, x, sel.marke === x.i)).join('')}</div>`).join('')}</div>`;
  }
  function stelleHTML(code, sid, x, aktiv) {
    const m = x.m;
    const refs = m.refs.filter((r) => gehoertZu(r, sid));
    // Am Ort steht der Ortseintrag; was eine Szene dort finden lässt, ist dann ein Sprung in die Szene
    const eigen = sid ? [] : refs.filter((r) => r.startsWith(code + ':'));
    const teile = eigen.length ? [...eigen.map((r) => teilHTML(r, sid)), szenenChips(refs.filter((r) => !eigen.includes(r)))] : refs.map((r) => teilHTML(r, sid));
    const zeigen = (m.zeigen || []).filter((id) => RQ[id]).map((id) => reqChip(RQ[id])).join('');
    return `<div class="stelle${aktiv ? ' aktiv' : ''}" data-stelle="${x.i}"><button type="button" class="st-kopf" data-marke="${x.i}" aria-pressed="${aktiv}" title="Im Grundriss zeigen"><span class="nr">${x.nr}</span><span class="st-name">${esc(m.name)}</span></button>${zeigen ? `<div class="st-zeigen">${zeigen}</div>` : ''}<div class="st-teile">${teile.join('')}</div></div>`;
  }
  function szenenChips(refs) {
    const ids = [...new Set(refs.map((r) => r.split(':')[0]))].filter((x) => SZ[x]);
    return ids.length ? `<div class="bezuege">${ids.map((x) => `<a class="vb-chip" href="#${x}" title="${esc(SZ[x].titel)}">${x} ${esc(SZ[x].titel)}</a>`).join('')}</div>` : '';
  }
  // Ein Verweis aus dem Grundriss als Zeile: Fund zum Abhaken, Ortseintrag, Gespräch oder Sprung in eine Szene
  function teilHTML(ref, sid) {
    const [ort, titel] = ref.split(':');
    if (SZ[ort]) {
      const e = SZ[ort].ebenen, ks = KS(ort);
      const vor = sid ? '' : `<span class="tok">${ort}</span> `;
      if (!titel) return szenenChips([ref]);
      const k = e.funde.findIndex((f) => f.titel === titel);
      if (k >= 0) return fundZeile(e.funde[k], `${ort}-f${k}`, ort, (ks.funde || [])[k], vor, false);
      for (let j = 0; j < e.haeuser.length; j++) {
        const kk = e.haeuser[j].funde.findIndex((f) => f.titel === titel);
        if (kk >= 0) return fundZeile(e.haeuser[j].funde[kk], `${ort}-hs${j}-f${kk}`, ort, (((ks.haeuser || [])[j] || {}).funde || [])[kk], vor, false);
      }
      const j = e.haeuser.findIndex((hs) => hs.titel === titel);
      if (j >= 0) return `<div class="bezuege"><a class="vb-chip" href="#${ort}" data-ziel="${ort}-hs${j}">${ort} ${esc(e.haeuser[j].titel)}</a></div>`;
      const g = e.gespraeche.findIndex((x) => x.code === titel);
      if (g >= 0) { const kk = (ks.gespraeche || [])[g]; return zeile(`${ort}-m${g}`, `${vor}<span class="tok">${titel}</span> ${esc(e.gespraeche[g].titel)}`, kk || saetze(flach(e.gespraeche[g].md), 1), md(e.gespraeche[g].md), kk ? 'mit-kurz' : ''); }
    }
    if (ORTE[ort]) {
      const k = ORTE[ort].gibt.findIndex((g) => g.titel === titel);
      if (k >= 0) { const g = ORTE[ort].gibt[k], kk = (KO(ort).gibt || [])[k]; return zeile(`${ort}-g${k}`, esc(g.titel), kk || saetze(flach(g.md), 1), md(g.md), kk ? 'mit-kurz' : ''); }
    }
    return '';
  }

  // ---------- Bausteine ----------
  function personKnopf(pid) {
    const p = P[pid];
    return `<button type="button" class="pknopf" data-pid="${pid}"><span class="pk-name">${kopfBild(pid, 'klein')}${esc(kurzName(p))}</span><span class="pk-punkte">${punkte(pid)}</span></button>`;
  }
  function tagsHTML(f) {
    let h = '<span class="tags">';
    for (const pr of f.probe || []) h += `<span class="tag ${pr === 'ohne Probe' ? 'tag-frei' : 'tag-probe'}">${esc(pr)}</span>`;
    if (f.handout) h += `<span class="tag tag-h">${esc(f.handout)}</span>`;
    return h + '</span>';
  }
  // mitZeigen: Requisiten am Fund (verbindungen.js). Im Grundriss trägt sie die Nummer, dann ohne.
  function fundZeile(f, id, sid, kurz, vor = '', mitZeigen = true) {
    const fid = `${sid}:${f.titel}`;
    const hat = !!S.gefunden[fid];
    const zz = mitZeigen ? (VB[fid] || []).filter((x) => RQ[x]).map((x) => reqChip(RQ[x])).join('') : '';
    return `<div class="fund${hat ? ' gefunden' : ''}"><details class="zeile" id="${id}"><summary><span class="zt">${vor}${esc(f.titel)}</span>${tagsHTML(f)}<span class="vorschau ganz">${esc(f.wo)}</span></summary>
      <div class="inhalt">${kurz ? `<p class="fund-kurz">${inline(kurz)}</p>` : ''}${fundText(f.md)}${probeAmFund(sid, f)}</div></details>${zz ? `<div class="fund-zeigen">${zz}</div>` : ''}
      <button type="button" class="haken" data-haken="${esc(fid)}" aria-pressed="${hat}" title="${hat ? 'gefunden' : 'als gefunden abhaken'}" aria-label="${esc(f.titel)} gefunden">✓</button></div>`;
  }
  // Die Probe, die genau diesen Fund aufdeckt (verbindungen.js), mit Erfolg, kritischem Erfolg und Patzer
  function probeAmFund(sid, f) {
    const e = SZ[sid] && SZ[sid].ebenen;
    const k = e ? e.proben.findIndex((p) => p.probe === PAF[`${sid}:${f.titel}`]) : -1;
    if (k < 0) return '';
    const p = e.proben[k], kp = (KS(sid).proben || [])[k];
    const inhalt = kp ? probeKurz(sid, k, kp) : `<dl class="probe"><div><dt>Erfolg</dt><dd>${inline(p.erfolg)}</dd></div><div><dt>Kritischer Erfolg</dt><dd>${inline(p.krit)}</dd></div><div><dt>Patzer</dt><dd>${inline(p.patzer)}</dd></div></dl>`;
    return `<div class="fund-probe"><div class="etikett">Probe · ${inline(p.probe)}</div>${inhalt}</div>`;
  }
  const zeile = (id, titel, vorschau, inhalt, cls = '') => `<details class="zeile ${cls}" id="${id}"><summary><span class="zt">${titel}</span>${vorschau ? `<span class="vorschau">${esc(vorschau)}</span>` : ''}</summary><div class="inhalt">${inhalt}</div></details>`;

  function medienHTML(viewId, bilder) {
    if (!bilder.length) return '';
    const tabs = bilder.map((b) => ({ k: 'bild:' + b.code, name: `Bild ${b.code}`, titel: BILD_TITEL[b.code] || '' }));
    let akt = T.medien[viewId];
    if (!akt || !tabs.some((t) => t.k === akt)) akt = tabs[0].k;
    let h = '<div class="medien">';
    if (tabs.length > 1) h += `<div class="medien-tabs" role="group" aria-label="Bild">${tabs.map((t) => `<button type="button" data-medien="${viewId}|${t.k}" aria-pressed="${t.k === akt}"${t.titel ? ` title="${esc(t.titel)}"` : ''}>${esc(t.name)}</button>`).join('')}</div>`;
    const b = bilder.find((x) => 'bild:' + x.code === akt);
    h += bildBox(b.code, b.text, b.titel);
    return h + '</div>';
  }

  // ---------- Seitenleiste ----------
  function rail() {
    let h = `<div class="rail-tabs" role="group" aria-label="Liste"><button type="button" data-rail="szenen" aria-pressed="${S.rail === 'szenen'}">Ablauf</button><button type="button" data-rail="orte" aria-pressed="${S.rail === 'orte'}">Orte</button><button type="button" data-rail="requisiten" aria-pressed="${S.rail === 'requisiten'}">Requisiten</button></div><nav class="rail-liste">`;
    if (S.rail === 'requisiten') {
      for (const g of REQ_GRUPPEN) {
        h += `<h3><span>${esc(g.titel)}</span></h3>`;
        for (const r of g.stuecke) {
          h += `<a class="item" href="#R-${r.id}" aria-current="${S.ort === 'R-' + r.id}"><span class="code">${r.seite ? esc(String(r.seite).split('–')[0]) : ''}</span><span class="nm">${esc(r.titel)}</span><span></span></a>`;
        }
      }
    } else if (S.rail === 'orte') {
      const gruppe = (titel, codes, zaehlen) => {
        h += `<h3><span>${titel}</span></h3>`;
        for (const c of codes) {
          const n = zaehlen ? leuteAmOrt(c).length : 0;
          h += `<a class="item" href="#${c}" aria-current="${S.ort === c}"><span class="code">${c}</span><span class="nm">${esc(ORTE[c].name.replace(/^(Der|Die|Das) /, ''))}${PL[c] ? ' <span class="plan-zeichen" title="mit Grundriss">▦</span>' : ''}</span>${n ? `<span class="zahl" title="${n} Leute um diese Zeit">${n}</span>` : '<span></span>'}</a>`;
        }
      };
      gruppe(`Im Dorf · ${uhrName()}`, Object.keys(ORTE).filter((c) => c[0] === 'D'), true);
      gruppe('Am Berg', Object.keys(ORTE).filter((c) => c[0] === 'B'), false);
    } else {
      for (const t of TEILE) {
        h += `<h3><span>${esc(t.titel.replace(/^Teil (\d) · /, '$1 · '))}</span><button type="button" class="info" data-teil="${t.nr}" title="Teil ${t.nr} auf einen Blick" aria-label="Teil ${t.nr} auf einen Blick">i</button></h3>`;
        for (const sid of t.szenen) {
          h += `<a class="item" href="#${sid}" aria-current="${S.ort === sid && !(sid === 'S9' && T.s9 === 4)}"${sid === 'S9' ? ' data-s9="2"' : ''}><span class="code">${sid}</span><span class="nm">${esc(SZ[sid].titel)}</span>${planFuer(sid) ? '<span class="plan-zeichen" title="mit Grundriss">▦</span>' : '<span></span>'}</a>`;
          if (sid === 'S9' && T.s9 !== 4) h += dorfUnterpunkte();
          // Nach der Leichenschau geht die Gruppe wieder frei durchs Dorf (Teil 4)
          if (sid === 'S19') {
            h += `<a class="item wieder" href="#S9" aria-current="${S.ort === 'S9' && T.s9 === 4}" data-s9="4"><span class="code">S9</span><span class="nm">Wieder das offene Dorf</span><span></span></a>`;
            if (T.s9 === 4) h += dorfUnterpunkte();
          }
        }
      }
    }
    return h + '</nav>';
  }

  // Die Orte des offenen Dorfs, eingerückt unter S9, solange man in S9 oder an einem Ort im Dorf ist
  function dorfUnterpunkte() {
    if (!(S.ort === 'S9' || (ORTE[S.ort] && !ORTE[S.ort].berg))) return '';
    return Object.keys(ORTE).filter((c) => c[0] === 'D').map((c) => {
      const n = leuteAmOrt(c).length;
      return `<a class="item unter" href="#${c}" aria-current="${S.ort === c}"><span class="code">${c}</span><span class="nm">${esc(ortKurz(c))}${PL[c] ? ' <span class="plan-zeichen" title="mit Grundriss">▦</span>' : ''}</span>${n ? `<span class="zahl" title="${n} Leute um diese Zeit">${n}</span>` : '<span></span>'}</a>`;
    }).join('');
  }

  // ---------- Verknüpfungen ----------
  // Nummern im Grundriss, die eine Bedingung erfüllen: [{ ebene, i, m }]
  function markenWo(code, pruef) {
    const pl = PL[code];
    if (!pl) return [];
    const out = [];
    pl.ebenen.forEach((E, ebene) => E.marken.forEach((m, i) => { if (pruef(m)) out.push({ ebene, i, m }); }));
    return out;
  }
  // Knopf, der im Grundriss diese Nummer aufschlägt
  function markeChip(code, key, x) {
    const pl = PL[code];
    const stock = pl.ebenen.length > 1 ? ` ${esc(pl.ebenen[x.ebene].name)}` : '';
    return `<button type="button" class="vb-chip vb-marke" data-zur-marke="${esc(key)}|${code}|${x.ebene}|${x.i}" title="${esc(x.m.name)}">Grundriss${stock} <span class="nr">${x.i + 1}</span></button>`;
  }
  const reqChip = (r) => `<button type="button" class="vb-chip vb-req" data-req="${r.id}" title="Zum Zeigen">▤ ${esc(r.titel)}</button>`;
  // Personen, die ein Text beim Namen nennt
  const RUFNAMEN = { P1: ['Benedikta'], P2: ['Bürgermeister', 'Daxenberger', 'Daxer'], P3: ['Gschwendtner'], P4: ['Ilse', 'Lehrerin'],
    P5: ['Jäger'], P6: ['Korbi'], P7: ['Kramerin'], P8: ['Lahnwirtin', 'Wirtin', 'Hallmaier'], P9: ['Leni'], P10: ['Martl'], P11: ['Maxi'],
    P12: ['Mesner-Michl', 'Mesner'], P13: ['Moar-Kaspar', 'Kaspar'], P14: ['Pfarrer'], P15: ['Rauch'], P16: ['Rosl'],
    P17: ['Schuster-Xare', 'Xare'], P18: ['Toni'], P19: ['Traudl'], P20: ['Wimmer-Sepp', 'Sepp'], P21: ['Wolff'], P22: ['Zenzi'] };
  const RUF_RE = Object.fromEntries(Object.entries(RUFNAMEN).map(([pid, l]) => [pid, new RegExp(`(^|[^\\wäöüÄÖÜß-])(${l.join('|')})(s|e?n)?(?![\\wäöüÄÖÜß-])`)]));
  const genannt = (text) => Object.keys(RUF_RE).filter((pid) => P[pid] && RUF_RE[pid].test(text));
  const personChip = (pid) => `<button type="button" class="vb-chip vb-person" data-pid="${pid}"><span class="dot st-${stufe(pid, S.wer)}"></span>${esc(kurzName(P[pid]))}</button>`;
  // Alles, was zu einem Eintrag »Was es hier gibt« gehört, als eine Zeile Knöpfe
  function bezuege(code, g, k) {
    const chips = [];
    for (const x of markenWo(code, (m) => m.refs.includes(`${code}:${g.titel}`))) chips.push(markeChip(code, code, x));
    for (const id of VB[`${code}:${g.titel}`] || []) if (RQ[id]) chips.push(reqChip(RQ[id]));
    const text = `${g.titel} ${g.md}`;
    for (const pid of genannt(text)) chips.push(personChip(pid));
    const codes = [...new Set((text.match(/\b[SDB]\d{1,2}\b/g) || []))].filter((c) => c !== code && (SZ[c] || ORTE[c]));
    for (const c of codes) chips.push(`<a class="vb-chip" href="#${c}" title="${esc(SZ[c] ? SZ[c].titel : ORTE[c].name)}">${c} ${esc(SZ[c] ? SZ[c].titel : ortKurz(c))}</a>`);
    return chips.length ? `<div class="bezuege" data-zu="${code}-g${k}">${chips.join('')}</div>` : '';
  }

  // ---------- Requisiten ----------
  // Zum Zeigen: der Knopf und der eine Satz, wann es auf den Tisch kommt
  const zeigenListe = (liste) => `<ul class="zz-liste">${liste.map((r) => `<li><button type="button" class="req-chip" data-req="${r.id}">${esc(r.titel)}</button><span class="zz-wann">${inline(r.wann || '')}</span></li>`).join('')}</ul>`;
  const teilKopf = (t) => `<div class="teil-kopf">${t}</div>`;
  function reqInhalt(r) {
    let h = tipp(`r|${r.id}`, `<span class="etikett">Wann</span> ${inline(r.wann)}`, 'anfang');
    const sl = !!(r.sl && T.reqSl[r.id]);
    h += `<div class="knopfzeile req-knoepfe"><button type="button" class="knopf haupt" data-zeigen="${r.id}|0|spieler">Den Spielern zeigen</button>${r.sl ? `<span class="req-fassung" role="group" aria-label="Fassung"><button type="button" data-req-sl="${r.id}|0" aria-pressed="${!sl}">Für die Spieler</button><button type="button" data-req-sl="${r.id}|1" aria-pressed="${sl}">Deine, ${esc(r.slName)}</button></span>` : ''}</div>`;
    const liste = sl ? r.sl : r.bilder;
    h += `<div class="req-bilder${liste.length > 1 ? ' mehrere' : ''}">${liste.map((src, i) => `<figure class="req-bild"><button type="button" class="req-zeig" data-zeigen="${r.id}|${i}" title="Groß zeigen"><img src="${esc(src)}" alt="${esc(r.titel)}" data-req-bild="${esc(src)}" data-versuch="0"></button><div class="bild-fehlt" hidden><div class="bf-kopf">Bild fehlt noch</div><div class="bf-text">Leg es als <code>${esc(src)}</code> ab, gern auch als .png oder .webp.</div></div>${r.unter && r.unter[i] && !sl ? `<figcaption>${inline(r.unter[i])}</figcaption>` : ''}</figure>`).join('')}</div>`;
    const wo = [...(r.szenen || []).filter((s) => SZ[s]).map((s) => `<a class="ref" href="#${s}" title="${esc(SZ[s].titel)}">${s}</a>`),
      ...(r.orte || []).filter((c) => ORTE[c]).map((c) => `<a class="ref ort" href="#${c}" title="${esc(ORTE[c].name)}">${c}</a>`)];
    const fuss = [wo.length ? `Kommt vor in ${wo.join(' ')}` : '', r.druck ? `Druck auf ${esc(r.druck)}` : '', r.seite ? `Handout-Seite ${esc(String(r.seite))}` : ''].filter(Boolean);
    if (fuss.length) h += `<p class="klein-text req-fuss">${fuss.join(' · ')}</p>`;
    return h;
  }
  const reqUeber = (r) => [r.gruppe, ...(r.codes || [])].map(esc).join(' · ');
  function reqSeite(id) {
    const r = RQ[id];
    return `<article class="seite" data-view="R-${id}"><header class="kopf"><div><div class="ueber">${reqUeber(r)}</div><h1>${esc(r.titel)}</h1></div></header>${reqInhalt(r)}</article>`;
  }
  function reqOverlay(id) {
    const r = RQ[id];
    return olKopf(reqUeber(r), esc(r.titel)) + `<div class="ol-inhalt">${reqInhalt(r)}</div>`;
  }
  const REQ_ENDUNGEN = ['jpg', 'png', 'webp'];
  function reqBildFehler(img) {
    const n = Number(img.dataset.versuch) + 1;
    const basis = img.dataset.reqBild.replace(/\.[a-z]+$/, '');
    const eigene = (img.dataset.reqBild.match(/\.([a-z]+)$/) || [])[1];
    const rest = REQ_ENDUNGEN.filter((e) => e !== eigene);
    if (n <= rest.length) { img.dataset.versuch = n; img.src = `${basis}.${rest[n - 1]}`; return; }
    const fig = img.closest('figure');
    img.closest('button').hidden = true;
    fig.querySelector('.bild-fehlt').hidden = false;
    fig.classList.add('fehlt');
    // Nichts da zum Zeigen: dann auch keinen Knopf dafür
    const box = fig.closest('.req-bilder');
    if (box && !box.querySelector('figure:not(.fehlt)')) box.parentElement.querySelectorAll('.knopf.haupt[data-zeigen]').forEach((k) => { k.hidden = true; });
  }
  // Vollbild für die Spieler: nur das Papier, antippen vergrößert
  function zeige(id, i, nurSpieler) {
    const r = RQ[id];
    const sl = !nurSpieler && !!(r.sl && T.reqSl[id]);
    const liste = sl ? r.sl : r.bilder;
    const img = $(`.req-bild img[data-req-bild="${CSS.escape(liste[i] || '')}"]`);
    if (img && img.closest('figure').classList.contains('fehlt')) return;
    zeigeBilder(r.titel, liste.map((src) => {
      const x = $(`.req-bild img[data-req-bild="${CSS.escape(src)}"]`);
      return x && x.getAttribute('src') ? x.getAttribute('src') : src;
    }), i, sl);
  }
  function zeigeBilder(titel, liste, i = 0, sl = false) {
    T.zeigen = { titel, liste, i: Math.max(0, Math.min(i, liste.length - 1)), sl };
    zeichneZeigen();
    const z = $('#zeigen');
    const f = z.requestFullscreen || z.webkitRequestFullscreen;
    if (f && !document.fullscreenElement) { try { const pr = f.call(z); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* Vollbild nicht erlaubt: bleibt als Ebene */ } }
  }
  function zeichneZeigen() {
    const z = $('#zeigen');
    if (!T.zeigen) { z.hidden = true; z.innerHTML = ''; document.body.classList.remove('mit-zeigen'); return; }
    const { titel, i, sl, liste } = T.zeigen;
    z.hidden = false;
    document.body.classList.add('mit-zeigen');
    z.innerHTML = `<div class="zg-buehne" data-zg-zoom><img src="${esc(liste[i])}" alt="${esc(titel)}"></div>
      <div class="zg-leiste">${sl ? '<span class="zg-warn">Deine Fassung, nicht für die Spieler</span>' : ''}${liste.length > 1 ? `<button type="button" class="zg-knopf" data-zg="-1" aria-label="Vorheriges">‹</button><span class="zg-n">${i + 1} / ${liste.length}</span><button type="button" class="zg-knopf" data-zg="1" aria-label="Nächstes">›</button>` : ''}<button type="button" class="zg-knopf" data-zg="zu" aria-label="Schließen">×</button></div>`;
  }
  function schliesseZeigen() {
    T.zeigen = null;
    if (document.fullscreenElement) { const pr = document.exitFullscreen(); if (pr && pr.catch) pr.catch(() => {}); }
    zeichneZeigen();
  }
  function zeigenBlaettern(d) {
    const z = T.zeigen;
    if (!z || z.liste.length < 2) return;
    z.i = (z.i + d + z.liste.length) % z.liste.length;
    zeichneZeigen();
  }

  // ---------- Szene ----------
  // ---------- Klang ----------
  function seitenName(id) {
    if (SZ[id]) return `${id} ${SZ[id].titel}`;
    if (ORTE[id]) return `${id} ${ORTE[id].name.replace(/^(Der|Die|Das) /, '')}`;
    const e = KL && KL.erzaehlungen().find((x) => x.id === id);
    return e ? `${id} ${e.name}` : id;
  }
  // Oben auf jeder Szene und jedem Ort: was darunter laufen kann (Lagen) und was man von Hand spielt (Knöpfe)
  function klangLeiste(id) {
    if (!KL) return '';
    const rz = KL.rezept(id);
    if (!rz || (!rz.lagen.length && !rz.knoepfe.length)) return '';
    return `<section class="klang" data-klang="${id}" aria-label="Klang">${klangInnen(id)}</section>`;
  }
  function klangInnen(id, ohneAnderswo) {
    const rz = KL.rezept(id), st = KL.status();
    const vor = KL.vorschlag(id, S.uhr);
    const etikett = ohneAnderswo ? '' : `<span class="etikett">Klang</span>`;
    const lagen = rz.lagen.map((L, i) => {
      const an = st.seite === id && st.nr === i;
      const zeichen = an ? (st.bereit ? '■' : '…') : '▶';
      return `<button type="button" class="kl-lage${an ? ' an' : ''}${i === vor && rz.lagen.length > 1 ? ' vorschlag' : ''}" data-kl-lage="${id}|${i}" aria-pressed="${an}" title="${an ? 'Ausblenden' : 'Leise darunter laufen lassen'}"><span class="kl-z" aria-hidden="true">${zeichen}</span>${esc(L.name)}</button>`;
    }).join('');
    const anderswo = !ohneAnderswo && st.seite && st.seite !== id ? `<span class="kl-anderswo">Es läuft: ${esc(seitenName(st.seite))} · ${esc(st.name)}<button type="button" class="kl-aus" data-kl-aus title="Ausblenden" aria-label="Ausblenden">■</button></span>` : '';
    const knoepfe = rz.knoepfe.map((k) => klangKnopf(KL.knopfId(k), Array.isArray(k) && k[1] ? k[1] : KL.titel(KL.knopfId(k)), (Array.isArray(k) && k[2]) || 0, st)).join('');
    // Ohne Lage stehen die Knöpfe gleich in der ersten Reihe
    let h = rz.lagen.length ? `<div class="kl-reihe">${etikett}${lagen}${anderswo}</div>${knoepfe ? `<div class="kl-knoepfe">${knoepfe}</div>` : ''}` : `<div class="kl-reihe">${etikett}${knoepfe}${anderswo}</div>`;
    if (st.fehler) h += `<p class="kl-fehler">${esc(st.fehler)}</p>`;
    return h;
  }
  function klangKnopf(id, name, pegel, st) {
    const an = st.knoepfe.includes(id);
    return `<button type="button" class="kl-knopf${an ? ' an' : ''}" data-kl-knopf="${id}|${pegel}" aria-pressed="${an}">${esc(name)}</button>`;
  }
  // Klang an der Stelle, an der das Buch ihn hören lässt: im Vorlesetext hinter dem Satz, im Ablauf unter dem Schritt
  const KW = (window.LAHNREIT_KLANG && window.LAHNREIT_KLANG.wann) || {};
  function wannKnopf(sid, x, st) {
    const rz = KL.rezept(sid);
    if (!rz) return '';
    if (/^L\d+$/.test(x)) {
      const i = Number(x.slice(1)), L = rz.lagen[i];
      if (!L) return '';
      const an = st.seite === sid && st.nr === i;
      return `<button type="button" class="kl-lage kl-mini${an ? ' an' : ''}" data-kl-lage="${sid}|${i}" aria-pressed="${an}" title="${an ? 'Ausblenden' : 'Leise darunter laufen lassen'}"><span class="kl-z" aria-hidden="true">${an ? (st.bereit ? '■' : '…') : '▶'}</span>${esc(L.name)}</button>`;
    }
    const k = rz.knoepfe.find((q) => KL.knopfId(q) === x);
    return klangKnopf(x, Array.isArray(k) && k[1] ? k[1] : KL.titel(x), (Array.isArray(k) && k[2]) || 0, st).replace('class="kl-knopf', 'class="kl-knopf kl-mini');
  }
  const wannInnen = (sid, ids, st = KL.status()) => ids.map((x) => wannKnopf(sid, x, st)).join('');
  const wannHTML = (sid, ids, tag = 'span', cls = 'kl-wann') => `<${tag} class="${cls}" data-kl-wann="${sid}|${ids.join(',')}">${wannInnen(sid, ids)}</${tag}>`;
  // An einer festen Stelle: Schritt nr im Ablauf (ab 1), '#haengt', '#anfang', '#haus:D6' oder '@P9' (hinter der Person unter »Jetzt hier«)
  function wannSchritt(sid, nr, tag = 'div', cls = 'kl-wann kl-schritt') {
    if (!KL || !KW[sid]) return '';
    const ids = KW[sid].filter((w) => w[0] === nr).flatMap((w) => w.slice(1));
    return ids.length ? wannHTML(sid, ids, tag, cls) : '';
  }
  // Im Text: hinter das Satzstück ('' heißt: vor den Text); was nicht gefunden wird, steht am Ende
  function wannImText(sid, html) {
    if (!KL || !KW[sid]) return html;
    let rest = [];
    for (const [bei, ...ids] of KW[sid]) {
      if (typeof bei !== 'string' || /^[#@]/.test(bei)) continue;
      const i = html.indexOf(bei);
      if (i < 0) { rest = rest.concat(ids); continue; }
      const j = i + bei.length;
      html = html.slice(0, j) + wannHTML(sid, ids) + html.slice(j);
    }
    return rest.length ? html + wannHTML(sid, rest, 'div', 'kl-wann kl-schritt') : html;
  }
  function klangKopf(st) {
    return `<div class="etikett">Klang</div><h2>${st.seite ? esc(st.name) : 'Es ist still'}</h2><div class="klein-text">${st.seite ? esc(seitenName(st.seite)) : 'Auf jeder Szene und jedem Ort oben: ▶ startet, was darunter läuft.'}</div>`;
  }
  function alleKnoepfe() {
    const st = KL.status();
    return KL.alleKnoepfe().map((k) => klangKnopf(k.id, k.titel, 0, st)).join('');
  }
  function klangOverlay() {
    const st = KL.status();
    let h = `<div class="ol-kopf"><div id="kl-ol-kopf">${klangKopf(st)}</div><button type="button" class="zu-knopf" data-ol-zu aria-label="Schließen">×</button></div><div class="ol-inhalt">`;
    h += `<div class="kl-steuer"><button type="button" class="knopf" data-kl-still>■ Alles ausblenden</button><label class="kl-laut">Lautstärke <input type="range" min="0" max="100" step="1" value="${Math.round(S.klang.laut * 100)}" data-kl-laut aria-label="Lautstärke"></label></div>`;
    h += `<h3>Dorfgeschichten</h3>${KL.erzaehlungen().map((e) => `<div class="kl-geschichte"><div class="kl-gtitel">${ANH[e.id] ? `<span class="tok tok-anh" data-voll="a|${e.id}" role="button" tabindex="0" title="Die Geschichte lesen, mit den Klängen an ihrer Stelle">${e.id}</span>` : `<span class="code">${e.id}</span>`} ${esc(e.name)}</div><section class="klang" data-klang="${e.id}" data-klang-ohne="1">${klangInnen(e.id, true)}</section></div>`).join('')}`;
    h += `<h3>Alle Einzelklänge</h3><div class="kl-knoepfe kl-alle" data-klang-alle>${alleKnoepfe()}</div>`;
    return h + '</div>';
  }
  function aktualisiereKlang() {
    const st = KL.status();
    $$('.klang[data-klang]').forEach((el) => { el.innerHTML = klangInnen(el.dataset.klang, el.dataset.klangOhne === '1'); });
    const k = $('#klang-knopf');
    if (k) k.classList.toggle('an', !!st.seite || st.knoepfe.length > 0);
    const kopf = $('#kl-ol-kopf');
    if (kopf) kopf.innerHTML = klangKopf(st);
    const alle = $('[data-klang-alle]');
    if (alle) alle.innerHTML = alleKnoepfe();
    $$('[data-kl-wann]').forEach((el) => { const [sid, ids] = el.dataset.klWann.split('|'); el.innerHTML = wannInnen(sid, ids.split(','), st); });
  }

  function szeneSeite(sid) {
    const s = SZ[sid], e = s.ebenen;
    const teil = TEILE.find((t) => t.nr === s.teil);
    const i = SZENEN.indexOf(s);
    const vor = SZENEN[i - 1], nach = SZENEN[i + 1];
    const eck = [s.meta['Wann'], s.meta['Wo'], s.meta['Wie lange']].filter(Boolean).map(inline).join(' · ');
    let h = `<article class="seite" data-view="${sid}">
      <header class="kopf"><div><div class="ueber">${sid} · ${esc(teil.titel)}</div><h1>${esc(s.titel)}</h1><div class="eck">${eck}</div></div>
      <div class="blaettern">${vor ? `<a class="knopf" href="#${vor.id}" title="${esc(vor.titel)}">‹ ${vor.id}</a>` : ''}${nach ? `<a class="knopf" href="#${nach.id}" title="${esc(nach.titel)}">${nach.id} ›</a>` : ''}</div></header>`;
    h += klangLeiste(sid);
    const ks = KS(sid);
    if (s.worum) h += ks.worum ? tipp(`s|${sid}|worum`, inline(ks.worum), 'worum') : `<div class="worum">${klapp(inline(s.worum), 2)}</div>`;

    const bilder = s.bilder.map((b) => ({ code: b.code, text: b.text }));
    const haupt = vorlesenHTML(sid) + medienHTML(sid, bilder);
    h += `<div class="buehne${haupt ? '' : ' ohne-bild'}">${haupt ? `<div class="buehne-haupt">${haupt}</div>` : ''}<aside class="leute-box"><h2>${sid === 'S9' ? `Im Dorf · ${uhrName()}` : 'Wer ist da'}</h2>${leuteBox(s)}</aside></div>`;
    if (e.ablauf.length || e.ablauf_md || e.hinweise.length) {
      h += `<section class="block"><h2>Ablauf</h2>`;
      // Gibt es Schritte, steht der freie Text danach: Er sagt, wie es weitergeht (S1).
      const text = e.ablauf_md ? (ks.ablauf_text && ks.ablauf_text.length ? tipp(`s|${sid}|ablauf`, stich(ks.ablauf_text), 'ablauf-text') : `<div class="ablauf-text">${klapp(md(e.ablauf_md), 3)}</div>`) : '';
      if (!e.ablauf.length) h += text;
      if (e.ablauf.length) {
        h += `<ol class="ablauf">${e.ablauf.map((a, k) => {
          const kk = (ks.ablauf || [])[k];
          const kurz = a.kurz || kk || saetze(flach(a.md), 1);
          const rest = a.kurz ? (kk || saetze(flach(a.md), 1)) : '';
          return `<li>${zeile(`${sid}-a${k}`, esc(kurz), rest, md(a.md), kk ? 'mit-kurz' : '')}${wannSchritt(sid, k + 1)}</li>`;
        }).join('')}</ol>${text}`;
      }
      if (e.hinweise.length) h += `<div class="hinweise">${e.hinweise.map((x, k) => { const kk = (ks.hinweise || [])[k]; return zeile(`${sid}-h${k}`, esc(x.titel), kk || saetze(flach(x.md), 1), md(x.md), kk ? 'hinweis mit-kurz' : 'hinweis'); }).join('')}</div>`;
      h += `</section>`;
    }
    if (sid === 'S9') h += dorfRaster();
    h += wasHierSzene(sid);
    const mehr = e.mehr.map((x, k) => ({ x, k })).filter(({ x }) => !(sid === 'S9' && x.titel === 'Wohin sie gehen können'));
    if (mehr.length || e.haengt) {
      h += `<section class="block"><h2>Mehr zur Szene</h2>${e.haengt ? zeile(`${sid}-haengt`, 'Wenn es hängt', ks.haengt || saetze(flach(e.haengt), 1), md(e.haengt), ks.haengt ? 'haengt mit-kurz' : 'haengt') + wannSchritt(sid, '#haengt') : ''}${mehr.map(({ x, k }) => { const kk = (ks.mehr || [])[k]; return zeile(`${sid}-x${k}`, esc(x.titel), kk || saetze(flach(x.md), 1), md(x.md), kk ? 'mit-kurz' : ''); }).join('')}</section>`;
    }
    if (e.weiter) h += ks.weiter ? tipp(`s|${sid}|weiter`, `<span class="etikett">Weiter</span> ${inline(ks.weiter)}`, 'weiter') : `<div class="weiter"><span class="etikett">Weiter</span> ${inline(e.weiter)}</div>`;
    return h + '</article>';
  }
  // Vorlesen steht offen oben. Weitere Vorlesetexte (Geständnis, Enden) klappen darunter auf.
  function vorlesenHTML(sid) {
    const v = SZ[sid].ebenen.vorlesen;
    if (!v.length) return '';
    const [erst, ...rest] = v;
    return `<section class="vorlesen-box" id="${sid}-v0"><div class="etikett">Vorlesen</div>${wannImText(sid, md(erst.md))}${rest.map((x, k) => zeile(`${sid}-v${k + 1}`, esc(x.titel), saetze(flach(x.md), 1), md(x.md), 'vorlesen')).join('')}</section>`;
  }
  // Alles, was die Spieler in einer Szene finden, prüfen, hören oder gezeigt bekommen, jedes nur einmal
  function wasHierSzene(sid) {
    const e = SZ[sid].ebenen, ks = KS(sid);
    const planCode = planFuer(sid);
    const imPlan = new Set(), zeigenImPlan = new Set();
    if (planCode) for (const E of PL[planCode].ebenen) for (const m of E.marken) {
      const eigen = m.refs.filter((r) => r.startsWith(sid + ':'));
      if (!eigen.length) continue;
      for (const r of eigen) imPlan.add(r.slice(sid.length + 1));
      for (const id of m.zeigen || []) zeigenImPlan.add(id);
    }
    const funde = e.funde.map((f, k) => ({ f, k })).filter(({ f }) => !imPlan.has(f.titel));
    // Requisiten, die an einem Fund hängen, stehen dort und nicht noch einmal unter »Zum Zeigen«
    const amFund = new Set([...funde.map(({ f }) => f), ...e.haeuser.flatMap((hs) => hs.funde)].flatMap((f) => VB[`${sid}:${f.titel}`] || []));
    const props = reqFuer('szenen', sid).filter((r) => !zeigenImPlan.has(r.id) && !amFund.has(r.id));
    let h = '';
    if (props.length) h += teilKopf('Zum Zeigen') + zeigenListe(props);
    if (planCode) h += teilKopf('Grundriss') + planHTML(planCode, sid);
    if (funde.length) h += teilKopf(imPlan.size ? 'Weitere Funde' : 'Funde') + funde.map(({ f, k }) => fundZeile(f, `${sid}-f${k}`, sid, (ks.funde || [])[k])).join('');
    if (e.haeuser.length) {
      h += teilKopf('Die Häuser') + e.haeuser.map((hs, j) => {
        const kh = (ks.haeuser || [])[j];
        const info = kh
          ? tipp(`s|${sid}|haus|${j}`, `<p class="haus-info"><span class="etikett">Hinein</span> ${inline(kh.hinein || '')}</p><p class="haus-info"><span class="etikett">Erwischt</span> ${inline(kh.erwischt || '')}</p>`, 'haus-kurz')
          : Object.entries(hs.info).map(([k, v]) => `<p class="haus-info"><span class="etikett">${esc(k)}</span> ${inline(v)}</p>`).join('');
        const funde = hs.funde.map((f, k) => fundZeile(f, `${sid}-hs${j}-f${k}`, sid, kh && (kh.funde || [])[k])).join('');
        const liegt = hs.liegt && !kh ? `<p class="haus-info"><span class="etikett">Was dort liegt</span> ${inline(hs.liegt)}</p>` : '';
        const planKnopf = PL[hs.ort] ? `<button type="button" class="knopf klein" data-planol="${hs.ort}|${sid}">Grundriss ${hs.ort} zeigen</button>` : '';
        return zeile(`${sid}-hs${j}`, `<span class="code">${hs.ort}</span> ${esc(hs.titel)}`, (kh && kh.wer) || flach(hs.info['Wer zurückgeblieben ist'] || ''), `${wannSchritt(sid, `#haus:${hs.ort}`)}${planKnopf}${info}${liegt}${funde}`, kh ? 'haus mit-kurz' : 'haus');
      }).join('');
    }
    const probenAmFund = new Set([...e.funde, ...e.haeuser.flatMap((hs) => hs.funde)].map((f) => PAF[`${sid}:${f.titel}`]).filter(Boolean));
    const proben = e.proben.map((p, k) => ({ p, k })).filter(({ p }) => !probenAmFund.has(p.probe));
    if (proben.length || e.proben_md) {
      h += teilKopf(probenAmFund.size ? 'Weitere Proben' : 'Proben') + proben.map(({ p, k }) => { const kp = (ks.proben || [])[k]; return kp ? zeile(`${sid}-p${k}`, inline(p.probe), kp.erfolg ? `Erfolg: ${kp.erfolg}` : '', probeKurz(sid, k, kp), 'probe-zeile mit-kurz') : zeile(`${sid}-p${k}`, inline(p.probe), '', `<dl class="probe">
        <div><dt>Erfolg</dt><dd>${inline(p.erfolg)}</dd></div><div><dt>Kritischer Erfolg</dt><dd>${inline(p.krit)}</dd></div><div><dt>Patzer</dt><dd>${inline(p.patzer)}</dd></div></dl>`, 'probe-zeile'); }).join('') + (e.proben_md ? `<div class="klein-text">${md(e.proben_md)}</div>` : '');
    }
    // Ein Gespräch, das im Grundriss eine Nummer hat, steht dort
    const mitschnitte = e.gespraeche.map((g, k) => ({ g, k })).filter(({ g }) => !imPlan.has(g.code));
    if (mitschnitte.length) {
      h += teilKopf('Zum Abspielen') + mitschnitte.map(({ g, k }) => { const kk = (ks.gespraeche || [])[k]; return zeile(`${sid}-m${k}`, `<span class="tok">${g.code}</span> ${esc(g.titel)}`, kk || saetze(flach(g.md), 1), md(g.md), kk ? 'mit-kurz' : ''); }).join('');
    }
    if (!h) return '';
    const n = e.funde.filter((f) => S.gefunden[`${sid}:${f.titel}`]).length;
    return `<section class="block was-hier"><h2>Was es hier gibt${e.funde.length ? ` <span class="zaehler">${n} von ${e.funde.length} gefunden</span>` : ''}</h2>${h}</section>`;
  }
  // Am Ort: Grundriss mit Nummern, die übrigen Einträge, und was es zu zeigen gibt, jedes nur einmal
  function wasHierOrt(code) {
    const o = ORTE[code];
    const planCode = PL[code] ? code : null;
    const imPlan = new Set(), zeigenImPlan = new Set();
    if (planCode) for (const E of PL[code].ebenen) for (const m of E.marken) {
      for (const r of m.refs) if (r.startsWith(code + ':')) imPlan.add(r.slice(code.length + 1));
      for (const id of m.zeigen || []) zeigenImPlan.add(id);
    }
    const gibt = o.gibt.map((g, k) => ({ g, k })).filter(({ g }) => !imPlan.has(g.titel));
    const inGibt = new Set(gibt.flatMap(({ g }) => VB[`${code}:${g.titel}`] || []));
    const props = reqFuer('orte', code).filter((r) => !zeigenImPlan.has(r.id) && !inGibt.has(r.id));
    let h = '';
    if (props.length) h += teilKopf('Zum Zeigen') + zeigenListe(props);
    if (planCode) h += teilKopf('Grundriss') + planHTML(code, null);
    if (gibt.length || o.gibt_md) {
      h += (planCode ? teilKopf('Außerdem') : '') + (o.gibt_md ? `<p>${inline(o.gibt_md)}</p>` : '') + gibt.map(({ g, k }) => { const kk = (KO(code).gibt || [])[k]; return `<div class="gibt">${zeile(`${code}-g${k}`, esc(g.titel), kk || saetze(flach(g.md), 1), md(g.md), kk ? 'mit-kurz' : '')}${bezuege(code, g, k)}</div>`; }).join('');
    }
    return h ? `<section class="block was-hier"><h2>Was es hier gibt</h2>${h}</section>` : '';
  }
  function leuteBox(s) {
    if (s.id === 'S9') {
      return `<p class="klein-text">Im offenen Dorf ist jeder dort, wo er um diese Zeit ist. Stell oben die Tageszeit ein. Wer wo ist, zeigt jede Karte unter »Wohin sie gehen können«.</p>`;
    }
    if (!s.leute.length) return `<p class="klein-text">Niemand außer den Ermittlern.</p>`;
    return `<ul class="leute">${s.leute.map((l, i) => {
      const kurz = (KS(s.id).leute || [])[i];
      const tut = kurz ? tipp(`s|${s.id}|leute|${i}`, inline(kurz), 'tut') : `<div class="tut">${klapp(inline(l.tut), 2)}</div>`;
      if (l.personen.length) return `<li data-tut="${esc(flach(kurz || l.tut))}">${l.personen.map((pid) => personKnopf(pid)).join('')}${tut}</li>`;
      return `<li class="neben"><span class="neben-name">${inline(l.wer)}</span>${tut}</li>`;
    }).join('')}</ul>`;
  }
  function dorfRaster() {
    const codes = Object.keys(ORTE).filter((c) => c[0] === 'D');
    return `<section class="block"><h2>Wohin sie gehen können <span class="zaehler">${uhrName()}</span></h2><div class="raster">${codes.map((c) => {
      const o = ORTE[c];
      const leute = leuteAmOrt(c);
      const anfang = (o.dorf && o.dorf.anfang) || o.anfang;
      return `<a class="ortkarte" href="#${c}"><span class="ok-kopf"><span class="code">${c}</span> ${esc(o.name.replace(/^(Der|Die|Das) /, ''))}${PL[c] ? ' <span class="plan-zeichen" title="mit Grundriss">▦</span>' : ''}</span>
        <span class="ok-leute">${leute.length ? leute.map((l) => `<span class="ok-p${l.treffen ? ' treffen' : ''}"${l.treffen ? ' title="verabredet"' : ''}><span class="dot st-${stufe(l.pid, S.wer)}"></span>${esc(kurzName(P[l.pid]))}</span>`).join('') : '<span class="leer">niemand von den 22</span>'}</span>
        <span class="ok-anfang">${esc(KO(c).anfang || flach(anfang))}</span></a>`;
    }).join('')}</div></section>`;
  }

  // ---------- Ort ----------
  function ortSeite(code) {
    const o = ORTE[code];
    const szenen = SZENEN.filter((s) => new RegExp(`\\b${code}\\b`).test(s.meta['Wo'] || '')).map((s) => `<a class="ref" href="#${s.id}" title="${esc(s.titel)}">${s.id}</a>`);
    const frei = o.berg ? '' : `${szenen.length ? ' · ' : ''}sonst frei im offenen Dorf, <a class="ref" href="#S9" title="${esc(SZ.S9.titel)}">S9</a>`;
    let h = `<article class="seite" data-view="${code}">
      <header class="kopf"><div><div class="ueber">${code} · ${o.berg ? 'Am Berg' : 'Im Dorf'}</div><h1>${esc(o.name)}</h1>
      <div class="eck">${szenen.length ? `Szenen hier: ${szenen.join(' ')}` : ''}${frei}</div>${KO(code).kurz ? `<div class="ort-kurz">${inline(KO(code).kurz)}</div>` : ''}</div></header>`;
    h += klangLeiste(code);
    // Was man den Spielern sagt, steht oben: wie es aussieht, und wie ein Besuch anfängt
    if (o.beschreibung) h += `<section class="aussehen"><div class="etikett">So sieht es aus</div>${wannImText(code, md(o.beschreibung))}</section>`;
    if (o.anfang) h += (KO(code).anfang ? tipp(`o|${code}|anfang`, `<span class="etikett">So fängt es an</span> ${inline(KO(code).anfang)}`, 'anfang') : `<div class="anfang"><span class="etikett">So fängt es an</span> ${inline(o.anfang)}</div>`) + wannSchritt(code, '#anfang');
    const bilder = ortBilder(o);
    const jetzt = leuteAmOrt(code), neben = nebenAmOrt(code);
    let box = '';
    if (o.berg) {
      box += `<div class="klein-text">${klapp(inline(o.felder['Wer hier ist'] || ''), 6)}</div>`;
      if (jetzt.length) box += `<ul class="leute">${jetzt.map((l) => (l.treffen ? treffenZeile(l) : `<li>${personKnopf(l.pid)}<div class="tut">${inline(l.text)}${wannSchritt(code, `@${l.pid}`, 'span', 'kl-wann')}</div></li>`)).join('')}</ul>`;
      box += treffenHTML(code);
    } else {
      box += jetzt.length ? `<ul class="leute">${jetzt.map((l) => (l.treffen ? treffenZeile(l) : `<li>${personKnopf(l.pid)}<div class="tut">${inline(l.text)}${wannSchritt(code, `@${l.pid}`, 'span', 'kl-wann')}</div></li>`)).join('')}</ul>` : `<p class="klein-text">Um diese Zeit ist hier niemand von den 22.</p>`;
      box += treffenHTML(code);
      if (neben.length) box += `<div class="nebenliste"><div class="etikett">Außerdem</div>${neben.map((x) => {
        const i = SONST.indexOf(x), kn = KZ.nebenfiguren[i], mk = modellKnopf(modellNeben(x.wer));
        const nk = kopfBild(modellNeben(x.wer), 'klein');
        return kn ? tipp(`n|${i}`, `${nk}<b>${esc(kurzNeben(x.wer))}</b> ${inline(kn)}${mk}`, 'nb') : `<div class="nb">${klapp(`<b>${esc(x.wer)}</b>, ${inline(x.wo)}. ${inline(x.wozu)}`, 1)}${mk}</div>`;
      }).join('')}</div>`;
    }
    const haupt = medienHTML(code, bilder);
    h += `<div class="buehne${haupt ? '' : ' ohne-bild'}">${haupt ? `<div class="buehne-haupt">${haupt}</div>` : ''}<aside class="leute-box"><h2>${o.berg ? 'Wer hier ist' : `Jetzt hier · ${uhrName()}`}</h2>${box}</aside></div>`;
    h += wasHierOrt(code);
    const mehr = [];
    if (o.dorf) mehr.push(['Was die Gruppe hier bekommen kann', `<p>${inline(o.dorf.bekommt)}</p><p><span class="etikett">Führt zu</span> ${inline(o.dorf.fuehrt)}</p>`, KO(code).bekommt]);
    for (const [k, v] of Object.entries(o.felder)) {
      if (k === 'Tabelle' || (k === 'Wer hier ist' && o.berg)) continue;
      mehr.push([k, md(v)]);
    }
    if (o.felder.Tabelle) mehr.push(['Tabelle', md(o.felder.Tabelle)]);
    if (mehr.length) h += `<section class="block"><h2>Mehr zum Ort</h2>${mehr.map(([t, v, kk], k) => zeile(`${code}-x${k}`, esc(t), kk || '', v, kk ? 'mit-kurz' : '')).join('')}</section>`;
    return h + '</article>';
  }

  // ---------- Gespräch ----------
  function gespraech() {
    const pid = S.gespraech;
    if (!pid || !P[pid]) return '';
    const p = P[pid], k = S.wer, st = stufe(pid, k), er = pron(p);
    const g = grund(pid, k);
    const pr = probeVon(pid, k);
    const leiter = p.leiter.find((z) => z.stufe === STUFEN[st]);
    const kontext = S.kontext && S.kontext.pid === pid ? S.kontext : null;
    const kp = KP(pid);
    const leiterText = leiter ? ((kp && kp.leiter && kp.leiter[leiter.stufe]) || leiter.text) : '';
    let h = `<div class="g-kopf">${portraetKnopf(pid)}<div class="g-titel"><div class="ueber">${pid} · Gespräch</div><h2>${esc(p.name)}${modellKnopf(pid)}</h2></div><button type="button" class="zu-knopf" data-schliessen aria-label="Gespräch schließen">×</button></div>`;
    if (kontext && kontext.tut) h += `<div class="g-hier"><span class="etikett">Hier</span> ${inline(kontext.tut)}</div>`;
    h += `<div class="g-wer" role="group" aria-label="Wer redet">${ERM.map((e) => {
      const i = stufe(pid, e.k);
      return `<button type="button" data-wer="${e.k}" aria-pressed="${k === e.k}"><span class="gw-name">${e.name}</span><span class="gw-stufe st-t-${i}">${STUFEN[i]}</span></button>`;
    }).join('')}</div>`;
    h += `<div class="g-haltung st-b-${st}"><div class="gh-zeile"><span class="gh-stufe">${STUFEN[st]}</span><span class="gh-wuerfel">${wuerfel(st)}</span></div>${leiterText ? `<p class="gh-leiter">${inline(leiterText)}</p>` : ''}</div>`;

    // Spielmechanik
    const tat = S.tat[pid] || 0;
    h += `<div class="g-steuer">
      <div class="gs-reihe"><span class="gs-was">Probe</span><span class="knopfreihe">
        <button type="button" data-probe="ue" aria-pressed="${pr === 'ue'}" ${g === 0 ? 'disabled title="Bei feindselig hilft Charme, Überreden oder Überzeugen nicht."' : ''}>Überredet +1</button>
        <button type="button" data-probe="ein" aria-pressed="${pr === 'ein'}">Eingeschüchtert +1</button></span></div>
      <div class="gs-reihe"><span class="gs-was">Tat</span><span class="knopfreihe">${[[-1, `gegen ${akk(p)} −1`], [0, 'keine'], [1, `für ${akk(p)} +1`]].map(([v, t]) =>
        `<button type="button" data-tat="${v}" aria-pressed="${tat === v}">${t}</button>`).join('')}</span></div>`;
    if (hatSchloss(p)) {
      h += `<div class="gs-reihe"><span class="gs-was">Schloss</span><span class="knopfreihe">${[[false, 'zu'], [true, 'offen']].map(([v, t]) =>
        `<button type="button" data-schloss="${v}" aria-pressed="${!!S.schloss[pid] === v}">${t}</button>`).join('')}</span></div>`;
    }
    if (pid === 'P5') h += `<label class="gs-check"><input type="checkbox" data-ausnahme ${S.ausnahme.P5 ? 'checked' : ''}> Maxi ist am Berg gestorben (S17)</label>`;
    if (FRAU[pid]) h += frauZeile(pid);
    if (pr === 'ein') h += `<p class="gs-hinweis">${Pron(p)} redet jetzt eine Stufe höher. Wenn das Gespräch endet, fällt ${er} dauerhaft eine Stufe${g === 0 ? `. ${Pron(p)} ist schon feindselig, also gilt »Wenn es kippt«` : ''}.</p>`;
    const steigt = feld(p, /steigt und fällt/);
    if (kp && (kp.steigt || kp.faellt)) {
      h += tipp(`p|${pid}|steigt`, `<div class="gb-z"><span class="gb-pf hoch" title="steigt">▲</span><span>${reihe(kp.steigt)}</span></div><div class="gb-z"><span class="gb-pf runter" title="fällt">▼</span><span>${reihe(kp.faellt)}</span></div>${kp.kippt ? `<div class="gb-z kippt"><span class="gb-pf" title="kippt">!</span><span>${inline(kp.kippt)}</span></div>` : ''}`, 'g-bewegt');
    } else if (steigt) h += `<details class="gs-mehr"><summary>Wodurch ${er} steigt und fällt</summary><p>${inline(steigt)}</p><p class="klein-text">Eine Tat gilt dauerhaft und für alle drei, höchstens eine Stufe weg vom Start. Eine gelungene Probe gilt nur für dieses Gespräch.</p></details>`;
    h += `</div>`;

    // Kurzüberblick
    if (kp) {
      const zeilen = [['Wer', 'wer', inline(kp.wer || '')], ['Will', 'will', inline(kp.will || '')], ['Redet', 'redet', inline(kp.redet || '')],
        ['Lügt', 'luegt', reihe(kp.luegt)], ['Schloss', 'schloss', kp.schloss ? inline(kp.schloss) : ''], ['Wichtig', 'wichtig', reihe(kp.wichtig)]];
      h += `<div class="g-kurz">${zeilen.filter(([, , v]) => v).map(([t, k, v]) => tipp(`p|${pid}|${k}`, `<span class="gk-t">${t}</span><span class="gk-v">${v}</span>`, 'gk')).join('')}</div>`;
    }
    const kurz = kp ? [] : [['Wer', saetze(feld(p, /^Wer /), 2)], ['Will', feld(p, /^Was .* will/)], ['Redet', feld(p, /^So redet/)], ['Lügt', feld(p, /^Worüber/)], ['Schloss', feld(p, /Schloss/)]];
    if (!kp) h += `<dl class="g-kurz">${kurz.filter(([, v]) => v).map(([t, v]) => `<div><dt>${t}</dt><dd>${klapp(inline(v), 2)}</dd></div>`).join('')}</dl>`;

    // Fragen
    const gruppen = themenGruppen(p);
    const hat = new Set(gruppen.map(([t]) => t));
    const bedingte = p.katalog.filter((r) => rang(p, r, k).bedingt);
    const ohne = THEMEN.filter((t) => !hat.has(t));
    h += `<div class="g-fragen"><h3>Die Spieler fragen nach …</h3>
      <input type="search" id="g-frage" placeholder="Stichwort, z. B. Hotel, Georgi, Leni" value="${esc(T.frage)}" aria-label="Wonach fragen die Spieler" autocomplete="off">
      <div class="g-themen" role="group" aria-label="Stichworte">${gruppen.map(([t]) => `<button type="button" class="chip" data-thema="${esc(t)}" aria-pressed="${T.thema === t}">${esc(t)}</button>`).join('')}
      ${bedingte.length ? `<button type="button" class="chip chip-vorhalt" data-thema="__vorhalt" aria-pressed="${T.thema === '__vorhalt'}">Vorhalte</button>` : ''}
      ${ohne.length ? `<button type="button" class="chip chip-leise" data-alle-themen aria-expanded="${T.alleThemen}">${T.alleThemen ? 'weniger' : `${ohne.length} weitere`}</button>` : ''}
      ${T.alleThemen ? ohne.map((t) => `<button type="button" class="chip chip-ohne" data-thema="${esc(t)}" aria-pressed="${T.thema === t}">${esc(t)}</button>`).join('') : ''}</div>
      <div class="g-antwort" id="g-antwort">${antwortBereich(p)}</div></div>`;
    h += `<div class="g-fuss"><button type="button" class="knopf" data-alles="${pid}">Alles über ${akk(p)}</button><button type="button" class="knopf" data-ende>Gespräch beenden</button></div>`;
    return h;
  }
  function antwortBereich(p) {
    const k = S.wer;
    const q = T.frage.trim();
    if (q.length >= 2) {
      const nq = fold(q);
      const treffer = themenGruppen(p).filter(([t, rows]) => themaPasst(t, nq) || rows.some((r) => textPasst(r.text, nq)));
      if (!treffer.length) {
        return `<div class="ak"><div class="ak-thema">»${esc(q)}«</div><div class="ak-nichts">${Pron(p)} weiß dazu nichts oder hat keine Meinung.</div>${andereHTML(wissende(null, q, p.id))}</div>`;
      }
      return treffer.slice(0, 4).map(([t, rows]) => antwortKarte(p, t, rows, k)).join('');
    }
    if (T.thema === '__vorhalt') {
      const rows = p.katalog.filter((r) => rang(p, r, k).bedingt);
      return `<div class="ak"><div class="ak-thema">Vorhalte und Bedingungen</div>${rows.map((r) => `<div class="ak-bedingt"><span class="bed">${esc(r.ab)}</span><span class="bed-thema">${esc(themaKey(r.thema))}</span><div>${inline(r.text)}</div></div>`).join('')}</div>`;
    }
    if (T.thema) {
      const g = themenGruppen(p).find(([t]) => t === T.thema);
      return antwortKarte(p, T.thema, g ? g[1] : [], k);
    }
    return `<p class="klein-text">Stichwort eintippen oder antippen. Gezeigt wird nur, was ${esc(p.name.replace(/^(Der|Die|Das) /, (m) => m.toLowerCase()))} jetzt zu ${ERM.find((e) => e.k === k).name} sagt.</p>`;
  }
  function oeffneGespraech(pid, tut) {
    if (S.gespraech && S.gespraech !== pid) beendeGespraech(S.gespraech);
    if (S.gespraech !== pid) { T.thema = null; T.frage = ''; T.alleThemen = false; }
    S.gespraech = pid;
    if (tut) S.kontext = { pid, tut };
    else if (!S.kontext || S.kontext.pid !== pid) S.kontext = null;
    sichern(); zeichneGespraech(); zeichneHaupt();
    const g = $('#gespraech');
    if (g) g.scrollTop = 0;
  }
  function beendeGespraech(pid) {
    const pr = S.probe[pid] || {};
    if (Object.values(pr).includes('ein')) S.tat[pid] = Math.max(-1, (S.tat[pid] || 0) - 1);
    delete S.probe[pid];
  }
  function schliesseGespraech() {
    if (!S.gespraech) return;
    beendeGespraech(S.gespraech); S.gespraech = null; S.kontext = null; sichern(); zeichneGespraech(); zeichneHaupt();
  }

  // ---------- Overlays ----------
  const olKopf = (ueber, titel) => `<div class="ol-kopf"><div><div class="ueber">${ueber}</div><h2>${titel}</h2></div><button type="button" class="zu-knopf" data-ol-zu aria-label="Schließen">×</button></div>`;
  function allesUeber(pid) {
    const p = P[pid], k = S.wer, er = pron(p);
    let h = olKopf(`${pid} · alles zur Person`, esc(p.name) + modellKnopf(pid)) + '<div class="ol-inhalt">';
    if (POR[pid]) h += `<button type="button" class="au-bild" data-portraet="${pid}" title="Bild groß zeigen"><img src="bilder/app/${pid}.webp" alt="${esc(p.name)}" loading="lazy"></button>`;
    const dazu = [...new Set([...Object.keys(MOD), ...Object.keys(POR)])].filter((key) => ((MOD[key] && MOD[key].zu) || (POR[key] && POR[key].zu)) === pid);
    if (dazu.length) h += `<p class="feld au-dazu"><b>Dazu.</b> ${dazu.map((key) => `<span class="au-figur">${kopfBild(key, 'klein')}${esc(porName(key))}${POR[key] ? ` <button type="button" class="knopf klein" data-portraet="${esc(key)}">Bild</button>` : ''}${modellKnopf(key)}</span>`).join(' ')}</p>`;
    for (const [kk, v] of Object.entries(p.felder)) {
      if (/^Haltung zu Beginn/.test(kk)) continue;
      h += `<p class="feld"><b>${esc(kk)}.</b> ${inline(v)}</p>`;
    }
    h += `<p class="feld"><b>Haltung zu Beginn.</b> ${ERM.map((e) => `${e.name} ${p.start[e.k]}`).join(' · ')}</p>`;
    if (p.leiter.length) {
      const jetzt = STUFEN[stufe(pid, k)];
      h += `<h3>Was ${er} auf jeder Stufe tut</h3><div class="leiter">${p.leiter.map((z) => `<div class="lz" data-jetzt="${z.stufe === jetzt}"><span class="st-t-${STUFEN.indexOf(z.stufe)}">${z.stufe}</span><div>${inline(z.text)}</div></div>`).join('')}</div>`;
    }
    h += `<h3>Der ganze Fragenkatalog <span class="klein-text">für ${ERM.find((e) => e.k === k).name}</span></h3>`;
    for (const [t, rows] of themenGruppen(p)) {
      h += `<div class="kat-thema"><div class="kt-t">${esc(t)}</div>${rows.map((r) => {
        const x = rang(p, r, k);
        const z = x.bedingt ? 'bedingt' : x.offen ? 'offen' : 'zu';
        return `<div class="kat-zeile" data-zustand="${z}"><span class="bed">${esc(r.stufe ? r.stufe : r.ab)}</span><div>${inline(r.text)}</div></div>`;
      }).join('')}</div>`;
    }
    for (const t of p.tabellen || []) h += tabelle(t.kopf, t.zeilen);
    return h + '</div>';
  }
  function personenListe() {
    let h = olKopf(`P1 bis P22 · ${uhrName()}`, 'Personen') + `<div class="ol-inhalt">
      <p class="klein-text">Die Punkte zeigen die Haltung zu Brandl, Hagedorn und Hias. Rechts steht, wo die Person um diese Zeit ist.</p>${FR ? '<div class="knopfzeile"><button type="button" class="knopf" data-frauen>Brandls Frauen</button></div>' : ''}<div class="pliste">`;
    const GRUPPEN = ['Der Täter und seine Tochter', 'Die Lauten', 'Helfer und Zeugen', 'Berg und Rand'];
    const gruppen = [...GRUPPEN, ...new Set(PERSONEN.map((p) => p.gruppe).filter((g) => !GRUPPEN.includes(g)))];
    for (const gname of gruppen) {
      const drin = PERSONEN.filter((x) => x.gruppe === gname);
      if (!drin.length) continue;
      h += `<h3>${esc(gname)}</h3>`;
      for (const p of drin) {
        const w = WO[p.id] && WO[p.id][S.uhr];
        const tr = treffenJetzt()[p.id];
        const wo = tr ? `<span class="treffen-marke">verabredet</span> ${esc(ortKurz(tr))} (${tr})` : (w && w.text ? esc(flach(w.text)) : '<span class="leer">daheim</span>');
        h += `<button type="button" class="pzeile" data-pid="${p.id}"><span class="code">${p.id}</span><span class="pz-name">${kopfBild(p.id, 'klein')}${esc(p.name)}</span><span class="pk-punkte">${punkte(p.id)}</span><span class="pz-wo">${wo}</span></button>`;
      }
    }
    h += `</div><h3>Neuer Abend</h3><p class="klein-text">Setzt alle Haltungen, Schlösser und Funde auf den Anfang.</p>
      <div class="knopfzeile"><button type="button" class="knopf gefahr" data-reset>${T.resetFrage ? 'Wirklich alles zurücksetzen?' : 'Alles auf den Anfang'}</button>${T.resetFrage ? '<button type="button" class="knopf" data-reset-nein>Lieber nicht</button>' : ''}</div></div>`;
    return h;
  }
  // Brandls Frauen: um wen er wirbt, was es kostet, was beim Auffliegen geschieht
  const wirbtUm = () => FR.frauen.filter((f) => S.frauen.wirbt[f.pid]);
  function frauZeile(pid) {
    const an = !!S.frauen.wirbt[pid];
    const andere = wirbtUm().filter((f) => f.pid !== pid).map((f) => f.name);
    let h = `<div class="gs-reihe"><span class="gs-was">Brandl</span><span class="knopfreihe"><button type="button" data-fr-wirbt="${pid}" aria-pressed="${an}">wirbt um ${akk(P[pid])}</button><button type="button" data-frauen>Brandls Frauen</button></span></div>`;
    if (an && andere.length) h += `<p class="gs-hinweis">Er wirbt auch um ${esc(andere.join(' und '))}. ${S.frauen.auf ? 'Es ist aufgeflogen' : 'Fliegt es auf'}: ${inline(FRAU[pid].auf)}</p>`;
    return h;
  }
  function frauenOverlay() {
    const n = wirbtUm().length;
    let h = olKopf('Brandls geheimes Ziel', 'Brandls Frauen') + `<div class="ol-inhalt">
      <p class="fr-ziel"><b>Ziel:</b> ${inline(FR.ziel)}. ${inline(FR.lohn)}</p><div class="fr-karten">`;
    for (const f of FR.frauen) {
      const p = P[f.pid], kp = KP(f.pid) || {}, an = !!S.frauen.wirbt[f.pid], st = stufe(f.pid, 'B');
      h += `<section class="fr-karte${an ? ' an' : ''}${an && S.frauen.auf ? ' auf' : ''}">
        <div class="fr-kopf">${kopfBild(f.pid, 'klein')}<div><div class="ueber">${f.pid}</div><h3>${esc(kurzName(p))}</h3></div><span class="fr-stufe">zu Brandl <b class="st-t-${st}">${STUFEN[st]}</b></span></div>
        <button type="button" class="fr-wirbt" data-fr-wirbt="${f.pid}" aria-pressed="${an}">${an ? '✓ ' : ''}Brandl wirbt um ${akk(p)}</button>
        <dl class="fr-liste">
          <div><dt>Preis</dt><dd>${inline(f.preis)}</dd></div>
          ${kp.steigt ? `<div><dt><span class="gb-pf hoch" title="steigt">▲</span></dt><dd>${reihe(kp.steigt)}</dd></div>` : ''}
          ${kp.faellt ? `<div><dt><span class="gb-pf runter" title="fällt">▼</span></dt><dd>${reihe(kp.faellt)}</dd></div>` : ''}
          <div class="fr-aufzeile"><dt>Fliegt es auf</dt><dd>${inline(f.auf)}</dd></div>
          <div><dt>Donnerstag</dt><dd>${inline(f.donnerstag)}</dd></div>
        </dl>
        <button type="button" class="knopf leise" data-pid="${f.pid}">Gespräch mit ${esc(f.name)}</button>
      </section>`;
    }
    h += `</div><div class="fr-unten">${n > 1 ? `<p class="fr-warn">Er wirbt um ${n === 3 ? 'alle drei' : 'zwei'}. ${inline(FR.mehrere)}</p>` : ''}
      <label class="gs-check"><input type="checkbox" data-fr-auf ${S.frauen.auf ? 'checked' : ''}> Es ist aufgeflogen, dass er um mehrere wirbt</label>
      <p class="klein-text">Wodurch es auffliegt, lässt das Buch dir. Wenn keine gewonnen ist: ${inline(FR.keine)}</p></div></div>`;
    return h;
  }
  function teilUeberblick(nr) {
    const t = TEILE.find((x) => x.nr === nr);
    return olKopf(`Teil ${nr} auf einen Blick`, esc(t.titel)) + `<div class="ol-inhalt">${md(t.intro.replace(/^## Teil \d auf einen Blick\s*/, ''))}</div>`;
  }
  function planOverlay(arg) {
    const [code, sid] = String(arg).split('|');
    return olKopf(`${code} · Grundriss${sid ? ` in ${sid}` : ''}`, esc(PL[code].titel)) + `<div class="ol-inhalt">${planHTML(code, sid || null, !sid)}${sid ? '' : `<p class="klein-text">Die Leute stehen dort, wo sie um diese Zeit sind (${uhrName()}). <a class="ref" href="#${code}">Zum Ort ${code}</a></p>`}</div>`;
  }
  function suchErgebnisse(q) {
    const nq = fold(q);
    const hits = [];
    const schnipsel = (txt) => {
      const f = flach(txt), ff = fold(f), i = ff.indexOf(nq);
      if (i < 0) return esc(f.slice(0, 120));
      const a = Math.max(0, i - 50);
      return (a ? '… ' : '') + esc(f.slice(a, i + nq.length + 70)) + ' …';
    };
    const pruefe = (txt, eintrag) => { if (fold(flach(txt)).includes(nq)) hits.push({ ...eintrag, sn: schnipsel(txt) }); };
    for (const s of SZENEN) {
      const e = s.ebenen;
      pruefe(s.titel + ' ' + (s.worum || ''), { href: '#' + s.id, titel: `${s.id} · ${s.titel}` });
      e.vorlesen.forEach((x, k) => pruefe(x.md, { href: '#' + s.id, ziel: `${s.id}-v${k}`, titel: `${s.id} · Vorlesen` }));
      e.ablauf.forEach((x, k) => pruefe((x.kurz || '') + ' ' + x.md, { href: '#' + s.id, ziel: `${s.id}-a${k}`, titel: `${s.id} · ${x.kurz || 'Ablauf'}` }));
      e.hinweise.forEach((x, k) => pruefe(x.titel + ' ' + x.md, { href: '#' + s.id, ziel: `${s.id}-h${k}`, titel: `${s.id} · ${x.titel}` }));
      e.funde.forEach((x, k) => pruefe(x.titel + ' ' + x.md, { href: '#' + s.id, ziel: `${s.id}-f${k}`, titel: `${s.id} · ${x.titel}` }));
      e.haeuser.forEach((hs, j) => hs.funde.forEach((x) => pruefe(x.titel + ' ' + x.md, { href: '#' + s.id, ziel: `${s.id}-hs${j}`, titel: `${s.id} · ${hs.titel} · ${x.titel}` })));
      // Eine Probe, die im Fund steht, führt zu diesem Fund
      const fundVon = (x) => {
        const k = e.funde.findIndex((f) => PAF[`${s.id}:${f.titel}`] === x.probe);
        if (k >= 0) return `${s.id}-f${k}`;
        const j = e.haeuser.findIndex((hs) => hs.funde.some((f) => PAF[`${s.id}:${f.titel}`] === x.probe));
        return j >= 0 ? `${s.id}-hs${j}` : null;
      };
      e.proben.forEach((x, k) => pruefe(Object.values(x).join(' '), { href: '#' + s.id, ziel: fundVon(x) || `${s.id}-p${k}`, titel: `${s.id} · Probe: ${flach(x.probe)}` }));
      e.gespraeche.forEach((x, k) => pruefe(x.md, { href: '#' + s.id, ziel: `${s.id}-m${k}`, titel: `${s.id} · ${x.code} ${x.titel}` }));
      e.mehr.forEach((x, k) => pruefe(x.titel + ' ' + x.md, { href: '#' + s.id, ziel: `${s.id}-x${k}`, titel: `${s.id} · ${x.titel}` }));
    }
    for (const [c, o] of Object.entries(ORTE)) {
      o.gibt.forEach((x, k) => pruefe(x.titel + ' ' + x.md, { href: '#' + c, ziel: `${c}-g${k}`, titel: `${c} · ${x.titel}` }));
      pruefe(o.name + ' ' + o.beschreibung, { href: '#' + c, titel: `${c} · ${o.name}` });
    }
    const pers = [];
    for (const p of PERSONEN) {
      const tr = themenGruppen(p).filter(([t, rows]) => themaPasst(t, nq) || rows.some((r) => fold(r.text).includes(nq)));
      if (tr.length || fold(p.name).includes(nq)) pers.push({ p, themen: tr.map(([t]) => t) });
    }
    let h = olKopf('Suche', `»${esc(q)}«`) + '<div class="ol-inhalt">';
    if (pers.length) {
      h += `<h3>Wer etwas dazu sagt</h3><div class="pliste">${pers.map(({ p, themen }) => `<button type="button" class="pzeile" data-pid="${p.id}" data-frage="${esc(q)}"><span class="code">${p.id}</span><span class="pz-name">${esc(p.name)}</span><span class="pk-punkte">${punkte(p.id)}</span><span class="pz-wo">${esc(themen.join(', '))}</span></button>`).join('')}</div>`;
    }
    if (hits.length) h += `<h3>In Szenen und Orten</h3><div class="such-liste">${hits.slice(0, 60).map((x) => `<a class="such-treffer" href="${x.href}" data-ziel="${x.ziel || ''}"><b>${esc(x.titel)}</b><span>${x.sn}</span></a>`).join('')}</div>`;
    if (!pers.length && !hits.length) h += `<p>Nichts gefunden.</p>`;
    return h + '</div>';
  }
  function modellOverlay(key) {
    const m = MOD[key] || { name: key };
    return olKopf(`3D · ${P[key] ? key : 'Nebenfigur'}`, esc(m.name)) + `<div class="ol-inhalt"><div class="modell-buehne"><div class="mb-status">Lädt die Figur …</div></div>
      <div class="knopfzeile modell-knoepfe"><button type="button" class="knopf" data-m="umdrehen">Umdrehen</button><button type="button" class="knopf" data-m="hinten">Von hinten</button><button type="button" class="knopf" data-m="langsam" aria-pressed="false">Langsam drehen</button><button type="button" class="knopf" data-m="voll">Vollbild</button></div>
      <p class="klein-text">Ziehen dreht die Figur, Mausrad oder zwei Finger zoomen. Im Vollbild kannst du sie den Spielern zeigen.</p></div>`;
  }
  function zeigeOverlay(art, arg) {
    if (window.LahnreitModell) window.LahnreitModell.stopp();
    T.overlay = { art, arg };
    zeichneOverlay();
  }
  function schliesseOverlay() { if (window.LahnreitModell) window.LahnreitModell.stopp(); T.overlay = null; T.resetFrage = false; T.suReset = false; zeichneOverlay(); }
  function zeichneOverlay() {
    const ol = $('#overlay');
    if (!T.overlay) { ol.hidden = true; ol.innerHTML = ''; document.body.classList.remove('mit-overlay'); return; }
    const { art, arg } = T.overlay;
    if (art === 'modell' && $('.modell-buehne', ol)) return;
    let inner = '';
    if (art === 'alles') inner = allesUeber(arg);
    else if (art === 'personen') inner = personenListe();
    else if (art === 'teil') inner = teilUeberblick(arg);
    else if (art === 'plan') inner = planOverlay(arg);
    else if (art === 'suche') inner = suchErgebnisse(arg);
    else if (art === 'modell') inner = modellOverlay(arg);
    else if (art === 'req') inner = reqOverlay(arg);
    else if (art === 'klang') inner = klangOverlay();
    else if (art === 'frauen' && FR) inner = frauenOverlay();
    else if (art === 'spieluhr' && SU) inner = spieluhrTafel();
    ol.innerHTML = `<div class="ol-box${art === 'plan' || art === 'req' || art === 'frauen' ? ' breit' : ''}" role="dialog" aria-modal="true">${inner}</div>`;
    ol.hidden = false;
    document.body.classList.add('mit-overlay');
    if (art === 'suche') markiere($('.ol-inhalt', ol), arg);
    if (art === 'modell' && window.LahnreitModell) window.LahnreitModell.zeige($('.modell-buehne', ol), arg);
    nachZeichnen(ol);
  }

  // ---------- Kontextfenster: der ganze Text hinter einer Kurzfassung ----------
  function vollText(key) {
    const [art, id, was, nr] = key.split('|');
    if (art === 'a') return ANH[id] ? { titel: ANH[id].titel, html: wannImText(id, md(ANH[id].md)) } : null;
    if (art === 'p') {
      const p = P[id];
      if (!p) return null;
      const name = kurzName(p);
      if (was === 'wichtig') {
        const std = /^(Wer |Haltung zu Beginn|So redet|Was .* will|Was .* weiß|Wie .* steigt|Worüber|Wo du|.*Schloss)/;
        const rest = Object.entries(p.felder).filter(([k]) => !std.test(k));
        return { titel: `${name} · Wichtig`, html: rest.map(([k, v]) => `<p><b>${esc(k)}.</b> ${inline(v)}</p>`).join('') };
      }
      const re = { wer: /^Wer /, will: /^Was .* will/, redet: /^So redet/, luegt: /^Worüber/, schloss: /Schloss/, steigt: /steigt und fällt/ }[was];
      if (!re) return null;
      let html = md(feld(p, re));
      if (was === 'steigt') html += `<p class="klein-text">Eine Tat gilt dauerhaft und für alle drei, höchstens eine Stufe weg vom Start. Eine gelungene Probe gilt nur für dieses Gespräch.</p>`;
      return { titel: `${name} · ${feldName(p, re)}`, html };
    }
    if (art === 's') {
      const s = SZ[id];
      if (!s) return null;
      const e = s.ebenen;
      if (was === 'worum') return { titel: `${id} · ${s.titel}`, html: md(s.worum) };
      if (was === 'leute') { const l = s.leute[Number(nr)]; return l ? { titel: `${id} · ${flach(l.wer)}`, html: md(l.tut) } : null; }
      if (was === 'ablauf') return { titel: `${id} · Ablauf`, html: md(e.ablauf_md) };
      if (was === 'weiter') return { titel: `${id} · Weiter`, html: md(e.weiter) };
      if (was === 'haus') {
        const hs = e.haeuser[Number(nr)];
        return hs ? { titel: `${hs.ort} · ${hs.titel}`, html: Object.entries(hs.info).map(([k, v]) => `<p><b>${esc(k)}.</b> ${inline(v)}</p>`).join('') + (hs.liegt ? `<p><b>Was dort liegt.</b> ${inline(hs.liegt)}</p>` : '') } : null;
      }
      if (was === 'probe') {
        const [i, f] = nr.split('.');
        const pr = e.proben[Number(i)];
        const N = { erfolg: 'Erfolg', krit: 'Kritischer Erfolg', patzer: 'Patzer' };
        return pr ? { titel: `${flach(pr.probe)} · ${N[f]}`, html: md(pr[f]) } : null;
      }
    }
    if (art === 'o') {
      const o = ORTE[id];
      if (!o) return null;
      if (was === 'kurz') return { titel: `${id} · ${o.name}`, html: md(o.beschreibung || '') };
      if (was === 'anfang') return { titel: `${id} · So fängt es an`, html: md(o.anfang) };
    }
    if (art === 'r') {
      const r = RQ[id];
      return r ? { titel: r.titel, html: md(r.hinweis) } : null;
    }
    if (art === 'b') {
      const b = BILDTEXT[id];
      return b ? { titel: `Bild ${id}${b.titel ? ' · ' + flach(b.titel) : ''}`, html: md(b.text) } : null;
    }
    if (art === 'n') {
      const x = SONST[Number(id)];
      return x ? { titel: flach(x.wer), html: `<p>${inline(x.wo)}.</p><p>${inline(x.wozu)}</p>` } : null;
    }
    return null;
  }
  function zeigeKontext(el) {
    const pop = $('#kontext');
    const key = el.dataset.voll;
    if (!pop.hidden && pop.dataset.key === key) { schliesseKontext(); return; }
    const v = vollText(key);
    if (!v) return;
    pop.dataset.key = key;
    pop.innerHTML = `<div class="kx-kopf"><b>${esc(v.titel)}</b><button type="button" class="zu-knopf klein" data-kontext-zu aria-label="Schließen">×</button></div><div class="kx-text">${v.html}</div>`;
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    const W = Math.min(460, window.innerWidth - 24);
    pop.style.width = W + 'px';
    pop.style.maxHeight = Math.round(window.innerHeight * 0.7) + 'px';
    let x = r.left;
    if (x + W > window.innerWidth - 12) x = window.innerWidth - 12 - W;
    pop.style.left = Math.max(12, x) + 'px';
    const hh = pop.offsetHeight;
    let y = r.bottom + 6;
    if (y + hh > window.innerHeight - 12) y = r.top - 6 - hh;
    pop.style.top = Math.max(12, y) + 'px';
  }
  function schliesseKontext() {
    const pop = $('#kontext');
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    pop.innerHTML = '';
    delete pop.dataset.key;
  }
  function probeKurz(sid, k, kp) {
    const N = [['erfolg', 'Erfolg'], ['krit', 'Kritisch'], ['patzer', 'Patzer']];
    return `<div class="probe-kurz">${N.filter(([f]) => kp[f]).map(([f, t]) => tipp(`s|${sid}|probe|${k}.${f}`, `<span class="pk-t">${t}</span><span>${inline(kp[f])}</span>`, 'pk-z')).join('')}</div>`;
  }

  // ---------- Spieluhr ----------
  // Zählt die Zeit am Tisch je Tageszeit. Läuft eine ab, geht es innerhalb des Tages von selbst weiter, mit Hinweis;
  // in die Nacht und aus ihr heraus erst, wenn die Spielleitung es bestätigt. Die Seite behält ihre Tageszeit,
  // bis man die Szene wechselt; dann stellt sie sich auf die Tageszeit der Spieluhr.
  const IKON = {
    zurueck: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2h2v12h-2zM14 2v12L5.5 8z"/></svg>',
    weiter: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11.5 2h2v12h-2zM2 2v12l8.5-6z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z"/></svg>',
    los: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z"/></svg>',
  };
  const suPh = (id) => (SU ? SU.phasen.find((p) => p.id === (id === undefined ? S.su.phase : id)) || null : null);
  const suPos = (p) => SU.phasen.indexOf(p);
  const suFolge = (weg = S.su.weg) => SU.phasen.filter((p) => !p.weg || p.weg === (weg || 'georgi'));
  const suNachbar = (d) => { const f = suFolge(), i = f.indexOf(suPh()); return i < 0 ? null : f[i + d] || null; };
  const suPlan = (p) => ((S.su.min[p.id] ?? p.min) + (S.su.plus[p.id] || 0)) * 60;
  const suZeit = (p) => (S.su.zeit[p.id] || 0) + (S.su.laeuft && S.su.phase === p.id ? (Date.now() - S.su.seit) / 1000 : 0);
  const suUhrName = (k) => (UHR.find((u) => u.k === k) || { name: k }).name;
  const suTag = (p, weg = S.su.weg) => { const t = SU.tage[p.tag]; return Array.isArray(t) ? t[weg === 'berg' ? 1 : 0] : t; };
  const suName = (p, weg) => `${suTag(p, weg)} · ${p.titel || suUhrName(p.uhr)}`;
  const suGrenze = (a, b) => a.tag !== b.tag || a.uhr === 'nachts' || b.uhr === 'nachts';
  const suJetzt = () => (SU && S.su.an && suPh() ? suPh().uhr : null);
  const uhrText = (s) => { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const dauer = (s) => { const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} Std. ${m % 60} Min.` : `${m} Min.`; };
  const suSzenen = (p) => (p.szenen || []).filter((s) => SZ[s]).map((s) => `<a class="ref" href="#${s}">${s}</a>`).join(' ');
  // Wer vor Georgi schon in den Bergtag springt, ist gleich auf den Berg gegangen
  function suWegNach(alt, neu) {
    if (neu.weg) return neu.weg;
    const g = SU.phasen.findIndex((p) => p.id === 'mo-georgi'), n = SU.phasen.findIndex((p) => p.id === 'mo-nacht');
    if (alt && suPos(alt) <= g && suPos(neu) > n) return 'berg';
    return S.su.weg;
  }
  function suFalten() {
    if (!S.su.laeuft || !S.su.phase) return;
    const jetzt = Date.now();
    S.su.zeit[S.su.phase] = (S.su.zeit[S.su.phase] || 0) + Math.max(0, jetzt - S.su.seit) / 1000;
    S.su.seit = jetzt;
  }
  function suWechsel(id, vonSelbst) {
    const alt = suPh(), neu = suPh(id);
    if (!neu) return;
    if (!S.su.an) Object.assign(S.su, { an: true, laeuft: true });
    suFalten();
    S.su.weg = suWegNach(alt, neu);
    S.su.phase = id;
    S.su.seit = Date.now();
    // Von Hand gilt die neue Tageszeit sofort; von selbst erst beim nächsten Szenenwechsel
    if (!vonSelbst) S.uhr = neu.uhr;
    T.suHinweis = { art: 'neu', id, vonSelbst: !!vonSelbst, bis: Date.now() + (vonSelbst || neu.schlaf ? 30000 : 9000) };
    sichern(); zeichne();
  }
  function suKnopf(was) {
    const p = suPh();
    if (was === 'start') { S.su = suLeer(); suWechsel(SU.phasen[0].id); return; }
    if (was === 'tafel') { zeigeOverlay('spieluhr'); return; }
    if (was === 'zurueck' || was === 'weiter') { const q = suNachbar(was === 'weiter' ? 1 : -1); if (q) suWechsel(q.id); return; }
    if (was === 'pause') {
      if (S.su.laeuft) { suFalten(); S.su.laeuft = false; } else { S.su.laeuft = true; S.su.seit = Date.now(); }
      if (T.suHinweis && T.suHinweis.art === 'info') T.suHinweis = null;
    } else if (was === 'plus5' && p) {
      // Noch fünf Minuten von jetzt an
      const drueber = Math.max(0, Math.ceil((suZeit(p) - suPlan(p)) / 60));
      S.su.plus[p.id] = (S.su.plus[p.id] || 0) + drueber + 5;
      S.su.um[p.id] = false;
      T.suHinweis = null;
    } else if (was === 'umstellen' && p) {
      S.uhr = p.uhr; T.suHinweis = null; sichern(); zeichne(); return;
    } else if (was === 'hinweis-zu') {
      T.suHinweis = null;
    } else if (was === 'reset') {
      if (!T.suReset) { T.suReset = true; zeichneOverlay(); return; }
      S.su = suLeer(); T.suReset = false; T.suHinweis = null; sichern(); schliesseOverlay(); zeichne(); return;
    } else if (was === 'reset-nein') {
      T.suReset = false;
    }
    sichern(); zeichneSpieluhr();
    if (T.overlay && T.overlay.art === 'spieluhr') zeichneOverlay();
  }
  // Ruft man eine Szene aus einer späteren Tageszeit auf, bietet der Hinweis an, die Uhr vorzustellen
  function suVorschlag(h) {
    if (!SU || !S.su.an) return;
    if (T.suHinweis && T.suHinweis.art !== 'um') T.suHinweis = null;
    const p = suPh();
    if (!SZ[h] || !p || T.suHinweis || (p.szenen || []).includes(h)) return;
    for (const q of SU.phasen.slice(suPos(p) + 1)) {
      if (q.weg && S.su.weg && q.weg !== S.su.weg) continue;
      if ((q.szenen || []).includes(h)) { T.suHinweis = { art: 'vor', id: q.id, sid: h, weg: suWegNach(p, q) }; return; }
    }
  }
  let suLetzter = Date.now(), suGesichert = Date.now();
  function suTick() {
    if (!S.su.an) return;
    const jetzt = Date.now(), p = suPh();
    if (!p) return;
    // Hat der Rechner geschlafen, zählt die Lücke nicht
    if (S.su.laeuft && jetzt - suLetzter > 5 * 60000) {
      S.su.zeit[p.id] = (S.su.zeit[p.id] || 0) + Math.max(0, suLetzter - S.su.seit) / 1000;
      S.su.laeuft = false;
      T.suHinweis = { art: 'info', text: 'Die Spieluhr hat angehalten, solange der Rechner geschlafen hat.' };
      suLetzter = jetzt; sichern(); zeichneSpieluhr(); return;
    }
    suLetzter = jetzt;
    if (S.su.laeuft && !S.su.um[p.id] && suZeit(p) >= suPlan(p)) {
      S.su.um[p.id] = true;
      const n = suNachbar(1);
      if (n && !suGrenze(p, n)) { suWechsel(n.id, true); return; }
      T.suHinweis = { art: 'um', id: p.id };
      suFalten(); sichern(); zeichneSpieluhr(); return;
    }
    if (T.suHinweis && T.suHinweis.bis && jetzt > T.suHinweis.bis) { T.suHinweis = null; zeichneSpieluhr(); }
    if (S.su.laeuft && jetzt - suGesichert > 15000) { suFalten(); sichern(); suGesichert = jetzt; }
    suZeitZeichnen();
  }
  function spieluhrHTML() {
    if (!S.su.an) return `<button type="button" class="su-start" data-su="start" title="Startet die Spieluhr mit Sonntag · Abend">${IKON.los}<span>Spiel beginnen</span></button>`;
    const p = suPh(), v = suNachbar(-1), n = suNachbar(1);
    const vT = v ? `Zurück zu ${suName(v)}` : 'Das ist die erste Tageszeit';
    const nT = n ? (p.schlaf ? `Nacht überspringen, weiter zu ${suName(n)}` : `Weiter zu ${suName(n)}`) : 'Das ist die letzte Tageszeit';
    const pT = S.su.laeuft ? 'Spieluhr anhalten' : 'Spieluhr weiterlaufen lassen';
    return `<button type="button" class="su-pfeil" data-su="zurueck" ${v ? '' : 'disabled'} title="${esc(vT)}" aria-label="${esc(vT)}">${IKON.zurueck}</button>`
      + `<button type="button" class="su-anzeige" data-su="tafel" title="Alle Tageszeiten und Zeiten"><span class="su-name">${esc(`${suTag(p)} · ${suUhrName(p.uhr)}`)}</span><span class="su-zeit"></span></button>`
      + `<button type="button" class="su-pause" data-su="pause" title="${pT}" aria-label="${pT}" aria-pressed="${!S.su.laeuft}">${S.su.laeuft ? IKON.pause : IKON.los}</button>`
      + `<button type="button" class="su-pfeil${p.schlaf && n ? ' su-schlaf' : ''}" data-su="weiter" ${n ? '' : 'disabled'} title="${esc(nT)}" aria-label="${esc(nT)}">${p.schlaf && n ? '<span>Nacht überspringen</span>' : ''}${IKON.weiter}</button>`;
  }
  function suHinweisHTML() {
    const h = T.suHinweis;
    if (!h || !S.su.an) return '';
    const kopf = (t) => `<div class="su-h-kopf"><b>${t}</b><button type="button" class="zu-knopf klein" data-su="hinweis-zu" aria-label="Hinweis schließen">×</button></div>`;
    if (h.art === 'info') return kopf('Spieluhr') + `<p>${esc(h.text)}</p><div class="knopfzeile"><button type="button" class="knopf klein" data-su="pause">Weiterlaufen lassen</button></div>`;
    const p = suPh(h.id);
    if (!p) return '';
    if (h.art === 'um') {
      const n = suNachbar(1);
      const wohin = n ? `<button type="button" class="knopf klein voll" data-su="weiter">${p.schlaf ? 'Nacht vorbei, weiter' : 'Weiter'} zu ${esc(suName(n))}</button>` : '';
      return kopf(`Die Zeit für ${esc(suName(p))} ist um.`) + `<p>Bring zu Ende, was gerade läuft. Dann:</p><div class="knopfzeile">${wohin}<button type="button" class="knopf klein" data-su="plus5">Noch 5 Minuten</button></div>`;
    }
    if (h.art === 'vor') {
      return kopf(`${esc(h.sid)} gehört zu ${esc(suName(p, h.weg))}.`) + `<div class="knopfzeile"><button type="button" class="knopf klein voll" data-su-zu="${p.id}">Uhr vorstellen</button><button type="button" class="knopf klein" data-su="hinweis-zu">Nein, so lassen</button></div>`;
    }
    // neu: eine neue Tageszeit hat begonnen
    let x = kopf(`Jetzt: ${esc(suName(p))}`);
    const sz = suSzenen(p);
    if (sz) x += `<p>Hierher gehört ${sz}.</p>`;
    const knoepfe = [];
    if (h.vonSelbst && S.uhr !== p.uhr) {
      x += `<p>Die Seite zeigt noch ${esc(suUhrName(S.uhr))}, bis du die Szene wechselst.</p>`;
      knoepfe.push(`<button type="button" class="knopf klein voll" data-su="umstellen">Jetzt auf ${esc(suUhrName(p.uhr))}</button>`);
    }
    const v = suNachbar(-1);
    if (h.vonSelbst && v) knoepfe.push(`<button type="button" class="knopf klein" data-su="zurueck">Noch ${esc(v.titel || suUhrName(v.uhr))}</button>`);
    if (p.schlaf && suNachbar(1)) {
      x += '<p>Schlafen alle, dann überspring die Nacht.</p>';
      knoepfe.push('<button type="button" class="knopf klein" data-su="weiter">Nacht überspringen</button>');
    }
    return x + (knoepfe.length ? `<div class="knopfzeile">${knoepfe.join('')}</div>` : '');
  }
  function suZeitZeichnen() {
    const box = $('#spieluhr');
    if (!box || !S.su.an) return;
    const p = suPh(), rest = suPlan(p) - suZeit(p);
    const el = $('.su-zeit', box);
    if (el) el.textContent = rest > -1 ? `noch ${uhrText(Math.max(0, rest))}` : `${uhrText(-rest)} drüber`;
    box.classList.toggle('ueber', rest <= -1);
    if (T.overlay && T.overlay.art === 'spieluhr') {
      const s = $('[data-su-lauf="summe"]'), z = $('[data-su-lauf="phase"]');
      if (s) s.textContent = dauer(SU.phasen.reduce((a, q) => a + suZeit(q), 0));
      if (z) z.textContent = uhrText(suZeit(p));
    }
  }
  function zeichneSpieluhr() {
    const box = $('#spieluhr'), hw = $('#su-hinweis');
    if (!box || !SU) return;
    box.innerHTML = spieluhrHTML();
    box.classList.toggle('an', S.su.an);
    box.classList.toggle('pause', S.su.an && !S.su.laeuft);
    document.body.classList.toggle('mit-spieluhr', S.su.an);
    const html = suHinweisHTML();
    hw.innerHTML = html;
    hw.hidden = !html;
    hw.className = `su-hinweis${T.suHinweis ? ' ' + T.suHinweis.art : ''}`;
    if (html) {
      // Unter die Spieluhr, aber nicht über den Rand
      const bar = $('.bar'), w = hw.offsetWidth;
      hw.style.left = Math.max(16, Math.min(box.offsetLeft, bar.clientWidth - w - 16)) + 'px';
    }
    const j = suJetzt();
    $$('.uhr [data-uhr]').forEach((b) => {
      b.classList.toggle('jetzt', b.dataset.uhr === j);
      b.title = b.dataset.uhr === j ? 'Tageszeit der Spieluhr' : '';
    });
    suZeitZeichnen();
  }
  function spieluhrTafel() {
    const f = suFolge(), jetzt = S.su.an ? suPh() : null;
    const gespielt = SU.phasen.reduce((a, p) => a + suZeit(p), 0), geplant = f.reduce((a, p) => a + suPlan(p), 0);
    let h = olKopf('Spieluhr', 'Der Abend in Tageszeiten') + '<div class="ol-inhalt">';
    h += `<p class="su-summe">Gespielt <b data-su-lauf="summe">${dauer(gespielt)}</b>, geplant ${dauer(geplant)} ohne Pausen. Das Handbuch rät zu einer Pause nach Teil 2 und einer nach Teil 3.</p>`;
    h += `<div class="su-weg"><span class="etikett">In S6 entscheidet die Gruppe</span><div class="knopfreihe"><button type="button" data-su-weg="georgi" aria-pressed="${S.su.weg !== 'berg'}">Erst Georgi</button><button type="button" data-su-weg="berg" aria-pressed="${S.su.weg === 'berg'}">Gleich auf den Berg</button></div></div>`;
    let tag = null;
    for (const p of f) {
      if (p.tag !== tag) {
        if (tag) h += '</div>';
        tag = p.tag;
        h += `<h3 class="su-tag">${esc(suTag(p))}${SU.zusatz[p.tag] ? ` <span>${esc(SU.zusatz[p.tag])}</span>` : ''}</h3><div class="su-liste">`;
      }
      const ist = jetzt === p, z = suZeit(p), plan = suPlan(p) / 60, vorbei = !ist && z >= 1;
      h += `<div class="su-zeile${ist ? ' jetzt' : ''}${vorbei ? ' vorbei' : ''}">`
        + `<button type="button" class="su-ph" data-su-phase="${p.id}" aria-current="${ist}" title="${ist ? 'Jetzt' : 'Die Spieluhr hierher stellen'}">${esc(p.titel || suUhrName(p.uhr))}${ist ? ' <span class="su-jetzt">jetzt</span>' : ''}</button>`
        + `<span class="su-sz">${suSzenen(p)}</span>`
        + `<span class="su-gebraucht"${ist ? ' data-su-lauf="phase"' : ''}>${ist || vorbei ? uhrText(z) : ''}</span>`
        + `<span class="su-plan"><button type="button" class="knopf klein" data-su-min="${p.id}|-5" aria-label="5 Minuten weniger">−</button><span>${plan} Min.</span><button type="button" class="knopf klein" data-su-min="${p.id}|5" aria-label="5 Minuten mehr">+</button></span>`
        + '</div>';
    }
    h += '</div>';
    if (S.su.an) {
      h += `<div class="knopfzeile su-tafel-knoepfe"><button type="button" class="knopf" data-su="zurueck" ${suNachbar(-1) ? '' : 'disabled'}>${IKON.zurueck} Zurück</button><button type="button" class="knopf" data-su="pause">${S.su.laeuft ? `${IKON.pause} Pause` : `${IKON.los} Weiterlaufen lassen`}</button><button type="button" class="knopf" data-su="weiter" ${suNachbar(1) ? '' : 'disabled'}>Weiter ${IKON.weiter}</button></div>`;
      h += T.suReset
        ? '<div class="knopfzeile su-reset"><span>Alle Zeiten löschen und von vorn?</span><button type="button" class="knopf klein gefahr" data-su="reset">Ja, zurücksetzen</button><button type="button" class="knopf klein" data-su="reset-nein">Nein</button></div>'
        : '<div class="knopfzeile su-reset"><button type="button" class="knopf klein" data-su="reset">Spieluhr zurücksetzen</button></div>';
    } else {
      h += `<div class="knopfzeile su-tafel-knoepfe"><button type="button" class="knopf" data-su="start">${IKON.los} Spiel beginnen</button></div>`;
    }
    h += '<p class="klein-text">Die Minuten sind die »Wie lange« der Szenen im Handbuch. Wie sich S9 auf Nachmittag und Abend verteilt, hat die App angenommen. Innerhalb eines Tages wechselt die Uhr von selbst und sagt es. In die Nacht und aus ihr heraus fragt sie erst. Eine Zeile antippen stellt die Uhr dorthin.</p>';
    return h + '</div>';
  }

  // ---------- Zeichnen ----------
  function nachZeichnen(root) {
    $$('img[data-req-bild]', root).forEach((img) => {
      img.addEventListener('error', () => reqBildFehler(img));
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) reqBildFehler(img);
    });
    $$('img[data-code]', root).forEach((img) => {
      img.addEventListener('error', () => bildFehler(img));
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) bildFehler(img);
    });
    requestAnimationFrame(() => {
      $$('.klapp', root).forEach((k) => {
        if (k.classList.contains('offen')) return;
        const t = $('.kt', k);
        k.classList.toggle('passt', t.scrollHeight <= t.clientHeight + 2);
      });
    });
  }
  function aktuelleAnsicht() {
    if (reqId(S.ort)) return reqSeite(reqId(S.ort));
    if (SZ[S.ort]) return szeneSeite(S.ort);
    if (ORTE[S.ort]) return ortSeite(S.ort);
    S.ort = 'S1';
    return szeneSeite('S1');
  }
  function zeichneHaupt() {
    const view = $('#view');
    const alt = view.firstElementChild && view.firstElementChild.dataset.view;
    const offen = $$('details[open]', view).map((d) => d.id).filter(Boolean);
    const klappOffen = $$('.klapp', view).map((k) => k.classList.contains('offen'));
    const scroll = document.scrollingElement.scrollTop;
    view.innerHTML = aktuelleAnsicht();
    if (KL && alt !== S.ort) KL.vorladen(S.ort, S.uhr);
    if (alt === S.ort) {
      offen.forEach((id) => { const d = document.getElementById(id); if (d) d.open = true; });
      $$('.klapp', view).forEach((k, i) => { if (klappOffen[i]) { k.classList.add('offen'); $('.kk', k).textContent = 'weniger'; } });
      document.scrollingElement.scrollTop = scroll;
    } else {
      window.scrollTo(0, 0);
    }
    nachZeichnen(view);
    if (T.oeffne) {
      const d = document.getElementById(T.oeffne);
      T.oeffne = null;
      if (d) {
        if (d.tagName === 'DETAILS') d.open = true;
        d.scrollIntoView({ block: 'center' });
        d.classList.add('blitz');
        setTimeout(() => d.classList.remove('blitz'), 1600);
      }
    }
    $('#rail').innerHTML = rail();
    $$('.uhr [data-uhr]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.uhr === S.uhr)));
  }
  function zeichneGespraech() {
    const g = $('#gespraech');
    const html = gespraech();
    document.body.classList.toggle('mit-gespraech', !!html);
    g.hidden = !html;
    const fokus = document.activeElement && document.activeElement.id === 'g-frage';
    const pos = fokus ? document.activeElement.selectionStart : 0;
    const offen = $$('details[open]', g).map((d) => d.className.split(' ')[0]);
    g.innerHTML = html;
    offen.forEach((c) => { const d = $(`details.${c}`, g); if (d) d.open = true; });
    if (fokus) { const i = $('#g-frage'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
    nachZeichnen(g);
  }
  function zeichne() {
    document.documentElement.dataset.theme = S.theme;
    zeichneHaupt();
    zeichneGespraech();
    zeichneSpieluhr();
    // Ein Sprung auf eine andere Seite schließt ein offenes Fenster
    if (T.overlay || !$('#overlay').hidden) zeichneOverlay();
  }

  // ---------- Wege ----------
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (/^P\d+$/.test(h) && P[h]) {
      history.replaceState(null, '', '#' + S.ort);
      oeffneGespraech(h);
      return;
    }
    if (SZ[h] || ORTE[h] || reqId(h)) {
      if (S.ort !== h) {
        // Aus dem offenen Dorf (S9 und seine Orte in der Liste) bleibt die Liste beim Ablauf
        const imDorf = (c) => c === 'S9' || (ORTE[c] && c.startsWith('D'));
        const bleib = S.rail === 'szenen' && imDorf(S.ort) && imDorf(h);
        S.ort = h;
        // Szenen mit fester Uhrzeit im Buch zeigen ihre Tageszeit, alles andere die der Spieluhr
        const jetzt = suJetzt();
        if (SZENEN_UHR[h]) S.uhr = SZENEN_UHR[h];
        else if (jetzt) S.uhr = jetzt;
        // Das offene Dorf ist nachmittags oder abends; kommt man aus dem Georgimorgen, stellt die Uhr auf Nachmittag
        if (h === 'S9' && S.uhr !== 'nachmittags' && S.uhr !== 'abends') S.uhr = 'nachmittags';
        S.rail = SZ[h] || bleib ? 'szenen' : ORTE[h] ? 'orte' : 'requisiten';
        suVorschlag(h);
      }
      T.overlay = null;
      sichern();
      document.body.classList.remove('rail-offen');
      zeichne();
      return;
    }
    history.replaceState(null, '', '#' + S.ort);
    zeichne();
  }

  // ---------- Bedienung ----------
  function neuPlan(box) {
    const neu = document.createElement('div');
    neu.innerHTML = planHTML(box.dataset.code, box.dataset.sid || null, !box.dataset.ohneLeute);
    box.replaceWith(neu.firstElementChild);
  }
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    let el;
    if (t.closest('[data-kontext-zu]')) { schliesseKontext(); return; }
    if ((el = t.closest('[data-su]'))) { suKnopf(el.dataset.su); return; }
    if ((el = t.closest('[data-su-zu]')) || (el = t.closest('[data-su-phase]'))) { suWechsel(el.dataset.suZu || el.dataset.suPhase); return; }
    if ((el = t.closest('[data-su-min]'))) {
      const [id, d] = el.dataset.suMin.split('|'), p = suPh(id);
      S.su.min[id] = Math.max(5, (S.su.min[id] ?? p.min) + (S.su.plus[id] || 0) + Number(d));
      delete S.su.plus[id];
      S.su.um[id] = suZeit(p) >= suPlan(p) && S.su.um[id];
      sichern(); zeichneOverlay(); zeichneSpieluhr(); return;
    }
    if ((el = t.closest('[data-su-weg]'))) {
      S.su.weg = el.dataset.suWeg;
      // Gilt die laufende Tageszeit auf dem anderen Weg nicht, geht es zur nächsten, die gilt
      const p = suPh();
      if (p && p.weg && p.weg !== S.su.weg) { const q = SU.phasen.slice(suPos(p)).find((x) => !x.weg || x.weg === S.su.weg); if (q) { suWechsel(q.id); return; } }
      sichern(); zeichneOverlay(); zeichneSpieluhr(); return;
    }
    if ((el = t.closest('[data-modell]'))) { schliesseKontext(); zeigeOverlay('modell', el.dataset.modell); return; }
    if ((el = t.closest('[data-m]'))) {
      const M = window.LahnreitModell;
      const was = el.dataset.m;
      if (!M) return;
      if (was === 'umdrehen') M.umdrehen();
      else if (was === 'hinten') M.vonHinten();
      else if (was === 'langsam') { const an = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', String(an)); M.langsam(an); }
      else if (was === 'voll') { const b = $('.modell-buehne'); const f = b && (b.requestFullscreen || b.webkitRequestFullscreen); if (f) f.call(b); }
      return;
    }
    if ((el = t.closest('[data-zg]'))) { const d = el.dataset.zg; if (d === 'zu') schliesseZeigen(); else zeigenBlaettern(Number(d)); return; }
    if ((el = t.closest('[data-zg-zoom]'))) {
      const img = $('img', el), r = img.getBoundingClientRect();
      const fx = (ev.clientX - r.left) / r.width, fy = (ev.clientY - r.top) / r.height;
      el.classList.toggle('gross');
      if (el.classList.contains('gross')) { el.scrollLeft = fx * img.offsetWidth - el.clientWidth / 2; el.scrollTop = fy * img.offsetHeight - el.clientHeight / 2; }
      return;
    }
    if ((el = t.closest('[data-portraet]'))) { const key = el.dataset.portraet; zeigeBilder(porName(key), [`bilder/app/${key}.webp`]); return; }
    if ((el = t.closest('[data-zeigen]'))) { const [id, i, nur] = el.dataset.zeigen.split('|'); zeige(id, Number(i), nur === 'spieler'); return; }
    if ((el = t.closest('[data-req-sl]'))) { const [id, v] = el.dataset.reqSl.split('|'); T.reqSl[id] = v === '1'; if (T.overlay) zeichneOverlay(); else zeichneHaupt(); return; }
    if ((el = t.closest('[data-req]'))) { zeigeOverlay('req', el.dataset.req); return; }
    if ((el = t.closest('[data-kl-lage]'))) {
      const [id, nr] = el.dataset.klLage.split('|');
      const st = KL.status();
      if (st.seite === id && st.nr === Number(nr)) KL.lageAus(); else KL.lageAn(id, Number(nr));
      return;
    }
    if ((el = t.closest('[data-kl-knopf]'))) { const [id, p] = el.dataset.klKnopf.split('|'); KL.knopf(id, Number(p) || 0); return; }
    if (t.closest('[data-kl-aus]')) { KL.lageAus(); return; }
    if (t.closest('[data-kl-still]')) { KL.allesAus(); return; }
    if ((el = t.closest('[data-voll]')) && !t.closest('a, [data-pid], button')) {
      // Ein Verweis in einer Zeile klappt sie nicht mit auf
      if (el.classList.contains('tok')) ev.preventDefault();
      zeigeKontext(el); return;
    }
    if (!t.closest('#kontext')) schliesseKontext();
    if ((el = t.closest('[data-klapp]'))) {
      const k = el.closest('.klapp'); k.classList.toggle('offen');
      el.textContent = k.classList.contains('offen') ? 'weniger' : 'mehr'; return;
    }
    if ((el = t.closest('[data-zur-marke]'))) {
      const [key, code, eb, i] = el.dataset.zurMarke.split('|');
      const sel = T.plan[key] = T.plan[key] || { ebene: 0, raum: null, marke: null };
      const E = PL[code].ebenen[Number(eb)];
      const rm = E.raeume.find((x) => inRaum(x, E.marken[Number(i)]));
      Object.assign(sel, { ebene: Number(eb), marke: Number(i), raum: rm ? rm.id : null });
      zeichneHaupt();
      const box = $(`.planbox[data-plan="${key}"]`);
      if (box) { const oben = $('.bar') ? $('.bar').offsetHeight : 0; window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - oben - 12, behavior: 'smooth' }); }
      return;
    }
    if ((el = t.closest('[data-zum-eintrag]'))) {
      const d = document.getElementById(el.dataset.zumEintrag);
      if (d) { d.open = true; d.scrollIntoView({ block: 'center', behavior: 'smooth' }); d.classList.add('blitz'); setTimeout(() => d.classList.remove('blitz'), 1600); }
      return;
    }
    if ((el = t.closest('[data-treffen-auf]'))) {
      T.treffenWahl = el.dataset.treffenAuf; zeichneHaupt();
      const sel = $('#treffen-wahl'); if (sel) sel.focus();
      return;
    }
    if (t.closest('[data-treffen-zu]')) { T.treffenWahl = null; zeichneHaupt(); return; }
    if ((el = t.closest('[data-treffen-weg]'))) {
      const tr = S.treffen[S.uhr]; if (tr) delete tr[el.dataset.treffenWeg];
      sichern(); zeichne(); return;
    }
    const pidEl = t.closest('[data-pid]');
    if (pidEl) {
      ev.preventDefault();
      const pid = pidEl.dataset.pid;
      const li = pidEl.closest('li[data-tut]');
      const frage = pidEl.dataset.frage;
      if (T.overlay) schliesseOverlay();
      oeffneGespraech(pid, li ? li.dataset.tut : null);
      if (frage) { T.frage = frage; T.thema = null; zeichneGespraech(); }
      document.body.classList.remove('rail-offen');
      return;
    }
    const a = t.closest('a[href^="#"]');
    if (a) {
      if (a.dataset.ziel) T.oeffne = a.dataset.ziel;
      if (a.dataset.s9) T.s9 = Number(a.dataset.s9);
      if (a.getAttribute('href') === '#' + S.ort) { ev.preventDefault(); schliesseOverlay(); zeichneHaupt(); }
      return;
    }
    if ((el = t.closest('[data-uhr]'))) { S.uhr = el.dataset.uhr; sichern(); zeichne(); return; }
    if ((el = t.closest('[data-rail]'))) { S.rail = el.dataset.rail; sichern(); $('#rail').innerHTML = rail(); return; }
    if ((el = t.closest('[data-teil]'))) { zeigeOverlay('teil', Number(el.dataset.teil)); return; }
    if ((el = t.closest('[data-medien]'))) { const [v, k] = el.dataset.medien.split('|'); T.medien[v] = k; zeichneHaupt(); return; }
    if ((el = t.closest('[data-planol]'))) { zeigeOverlay('plan', el.dataset.planol); return; }
    if ((el = t.closest('[data-ebene]'))) {
      const box = el.closest('.planbox'); const sel = T.plan[box.dataset.plan];
      sel.ebene = Number(el.dataset.ebene); sel.raum = null; sel.marke = null; neuPlan(box); return;
    }
    if ((el = t.closest('[data-marke]'))) {
      const box = el.closest('.planbox'); const key = box.dataset.plan; const sel = T.plan[key];
      const i = Number(el.dataset.marke);
      sel.marke = sel.marke === i ? null : i; sel.raum = null;
      neuPlan(box);
      const st = sel.marke == null ? null : $(`.planbox[data-plan="${key}"] .stelle[data-stelle="${i}"]`);
      if (st) {
        const d = $$('details.zeile', st);
        if (d.length === 1) d[0].open = true;
        if (!el.closest('.stelle')) st.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      return;
    }
    if ((el = t.closest('[data-raum]'))) {
      const box = el.closest('.planbox'); const sel = T.plan[box.dataset.plan];
      sel.raum = el.dataset.raum && sel.raum !== el.dataset.raum ? el.dataset.raum : null; sel.marke = null; neuPlan(box); return;
    }
    if ((el = t.closest('[data-haken]'))) { const f = el.dataset.haken; if (S.gefunden[f]) delete S.gefunden[f]; else S.gefunden[f] = true; sichern(); zeichneHaupt(); return; }
    // Gespräch
    if (t.closest('[data-schliessen]') || t.closest('[data-ende]')) { schliesseGespraech(); return; }
    if ((el = t.closest('[data-wer]'))) { S.wer = el.dataset.wer; sichern(); zeichneGespraech(); zeichneHaupt(); return; }
    if ((el = t.closest('[data-probe]'))) {
      const pid = S.gespraech; S.probe[pid] = S.probe[pid] || {};
      S.probe[pid][S.wer] = S.probe[pid][S.wer] === el.dataset.probe ? null : el.dataset.probe;
      sichern(); zeichneGespraech(); zeichneHaupt(); return;
    }
    if ((el = t.closest('[data-tat]'))) { S.tat[S.gespraech] = Number(el.dataset.tat); sichern(); zeichneGespraech(); zeichneHaupt(); return; }
    if ((el = t.closest('[data-schloss]'))) { S.schloss[S.gespraech] = el.dataset.schloss === 'true'; sichern(); zeichneGespraech(); return; }
    if ((el = t.closest('[data-thema]'))) {
      T.thema = T.thema === el.dataset.thema ? null : el.dataset.thema; T.frage = ''; zeichneGespraech();
      const ant = $('#g-antwort'); if (ant && T.thema) ant.scrollIntoView({ block: 'nearest' });
      return;
    }
    if ((el = t.closest('[data-alle-themen]'))) { T.alleThemen = !T.alleThemen; zeichneGespraech(); return; }
    if ((el = t.closest('[data-alles]'))) { zeigeOverlay('alles', el.dataset.alles); return; }
    if (t.closest('[data-frauen]')) { zeigeOverlay('frauen'); return; }
    if ((el = t.closest('[data-fr-wirbt]'))) {
      const w = S.frauen.wirbt, pid = el.dataset.frWirbt;
      if (w[pid]) delete w[pid]; else w[pid] = true;
      sichern(); zeichneGespraech(); if (T.overlay) zeichneOverlay(); return;
    }
    // Overlay
    if (t.closest('[data-ol-zu]') || t.id === 'overlay') { schliesseOverlay(); return; }
    if ((el = t.closest('[data-reset]'))) {
      if (!T.resetFrage) { T.resetFrage = true; zeichneOverlay(); return; }
      S = Object.assign(leer(), { theme: S.theme, ort: S.ort, rail: S.rail, uhr: S.uhr, geraet: S.geraet });
      T.resetFrage = false; sichern(); zeichne(); return;
    }
    if (t.closest('[data-reset-nein]')) { T.resetFrage = false; zeichneOverlay(); return; }
  });
  document.addEventListener('change', (ev) => {
    if (ev.target.matches('[data-ausnahme]')) { S.ausnahme.P5 = ev.target.checked; sichern(); zeichneGespraech(); zeichneHaupt(); }
    if (ev.target.matches('[data-fr-auf]')) { S.frauen.auf = ev.target.checked; sichern(); zeichneOverlay(); zeichneGespraech(); }
    if (ev.target.id === 'treffen-wahl' && ev.target.value) {
      S.treffen[S.uhr] = Object.assign({}, S.treffen[S.uhr], { [ev.target.value]: ev.target.dataset.ort });
      T.treffenWahl = null; sichern(); zeichne();
    }
  });
  document.addEventListener('input', (ev) => {
    if (KL && ev.target.matches('[data-kl-laut]')) { S.klang.laut = ev.target.value / 100; KL.laut(S.klang.laut); sichern(); return; }
    if (ev.target.id === 'g-frage') {
      T.frage = ev.target.value; T.thema = null;
      $('#g-antwort').innerHTML = antwortBereich(P[S.gespraech]);
      $$('.g-themen [data-thema]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    }
  });
  document.addEventListener('keydown', (ev) => {
    if (T.zeigen) {
      if (ev.key === 'Escape') { schliesseZeigen(); return; }
      if (ev.key === 'ArrowRight') { zeigenBlaettern(1); return; }
      if (ev.key === 'ArrowLeft') { zeigenBlaettern(-1); return; }
    }
    if (ev.key === 'Escape') {
      const pop = $('#kontext');
      if (pop && !pop.hidden) { schliesseKontext(); return; }
      if (T.overlay) { schliesseOverlay(); return; }
      if (document.body.classList.contains('rail-offen')) { document.body.classList.remove('rail-offen'); return; }
      if (S.gespraech) schliesseGespraech();
      return;
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[data-voll]')) { ev.preventDefault(); zeigeKontext(ev.target); return; }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('g[role="button"]')) {
      ev.preventDefault();
      ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  const suchen = () => { const q = $('#suche').value.trim(); if (q.length >= 2) zeigeOverlay('suche', q); else $('#suche').focus(); };
  $('#suche').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') suchen(); });
  $('#suche-knopf').addEventListener('click', suchen);
  $('#personen-knopf').addEventListener('click', () => zeigeOverlay('personen'));
  if (KL) {
    if (!S.klang || typeof S.klang.laut !== 'number') S.klang = { laut: 0.8 };
    KL.laut(S.klang.laut);
    KL.beiAenderung(aktualisiereKlang);
    $('#klang-knopf').addEventListener('click', () => zeigeOverlay('klang'));
  } else {
    $('#klang-knopf').hidden = true;
  }
  $('#thema-knopf').addEventListener('click', () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; sichern(); document.documentElement.dataset.theme = S.theme; });
  $('#rail-knopf').addEventListener('click', () => document.body.classList.toggle('rail-offen'));
  $('#geraet-knopf').addEventListener('click', () => { S.geraet = tablet() ? 'laptop' : 'tablet'; sichern(); setzeGeraet(); zeichne(); });
  if (FINGER && FINGER.addEventListener) FINGER.addEventListener('change', () => { if (!S.geraet) { setzeGeraet(); zeichne(); } });
  $('.uhr').innerHTML = UHR.map((u) => `<button type="button" data-uhr="${u.k}" aria-pressed="${S.uhr === u.k}">${u.name}</button>`).join('');
  if (SU) {
    S.su = Object.assign(suLeer(), S.su && typeof S.su === 'object' ? S.su : {});
    if (S.su.an && !suPh()) S.su = suLeer();
    // War die App länger zu, hat die Spieluhr Pause gemacht
    if (S.su.laeuft && Date.now() - S.su.seit > 5 * 60000) {
      S.su.laeuft = false;
      T.suHinweis = { art: 'info', text: 'Die Spieluhr hat angehalten, solange die App zu war.' };
    }
    setInterval(suTick, 1000);
    document.addEventListener('visibilitychange', () => { if (document.hidden && S.su.laeuft) { suFalten(); sichern(); } });
  } else {
    $('#spieluhr').hidden = true;
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && T.zeigen) schliesseZeigen(); });
  document.documentElement.dataset.theme = S.theme;
  setzeGeraet();
  route();
})();
