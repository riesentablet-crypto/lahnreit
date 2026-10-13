// Lahnreit 1956 · Spielleitung
// Liest window.LAHNREIT (data/lahnreit-daten.js) und zeigt Personen, Szenen und Haltungen.
(function () {
  'use strict';

  const D = window.LAHNREIT;
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

  const PERSONEN = D.personen.personen;
  const P = Object.fromEntries(PERSONEN.map((p) => [p.id, p]));
  const SZENEN = D.szenen.szenen;
  const SZ = Object.fromEntries(SZENEN.map((s) => [s.id, s]));
  const TEILE = D.szenen.teile;

  // ---------- Zustand, nur in diesem Browser gespeichert ----------
  const KEY = 'lahnreit-spielleitung-v1';
  const leer = () => ({ wer: 'B', tat: {}, probe: {}, schloss: {}, ausnahme: {}, zuletzt: { P: 'P3', S: 'S1' } });
  let S = leer();
  try {
    const roh = localStorage.getItem(KEY);
    if (roh) S = Object.assign(leer(), JSON.parse(roh));
  } catch (e) { /* ohne Speicher geht es auch */ }
  const sichern = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* egal */ } };

  let thema = null;      // gewähltes Stichwort auf der Personenseite
  let suchtext = '';

  // ---------- Hilfen ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
  const themaKey = (t) => (t === 'Das Kasermandl' ? 'Kasermandl' : t);

  function verweise(html) {
    // Codes im Text: Personen und Szenen werden Links, Hinweise und Orte bleiben Schreibmaschine.
    return html.replace(/\b([PS])(\d{1,2})([ab])?\b|\b([HGNDBM]\d{1,2}[ab]?)\b/g, (m, art, nr, buchst, tok) => {
      if (tok) return `<span class="tok">${tok}</span>`;
      const id = art + nr;
      if ((art === 'P' && P[id]) || (art === 'S' && SZ[id])) return `<a class="ref" href="#${id}">${m}</a>`;
      return m;
    });
  }
  function inline(s) {
    let h = verweise(esc(s));
    h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    h = h.replace(/\*(.+?)\*/g, '<i>$1</i>');
    return h;
  }
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
        const n = Math.min(Math.max(m[1].length, 2), 4);
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
  function markiere(el, q) {
    if (!q) return;
    const nq = fold(q);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const t = n.nodeValue, ft = fold(t);
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
  function stufe(pid, k) {
    const p = P[pid];
    if (S.ausnahme[pid]) return 0;
    let base = STUFEN.indexOf(p.start[k]);
    if (base < 0) base = 2;
    const v = base + (S.tat[pid] || 0) + (S.probe[pid] && S.probe[pid][k] ? 1 : 0);
    return Math.max(0, Math.min(4, v));
  }
  const chip = (i) => `<span class="st st-${i}">${STUFEN[i]}</span>`;
  const punkte = (pid) => ERM.map((e) => `<span class="dot st-${stufe(pid, e.k)}" title="${e.name}: ${STUFEN[stufe(pid, e.k)]}"></span>`).join(' ');
  function wuerfel(i) {
    if (i === 4) return 'Bonuswürfel bei sozialen Proben';
    if (i === 0) return 'Strafwürfel bei sozialen Proben';
    return 'keine Würfeländerung';
  }

  // Wie eine Zeile des Fragenkatalogs für den fragenden Ermittler steht.
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
  function antwortenHTML(p, rows, k) {
    const info = rows.map((r) => ({ r, x: rang(p, r, k) }));
    let best = -99;
    for (const { x } of info) if (x.offen && !x.bedingt && x.rang > best) best = x.rang;
    return info.map(({ r, x }) => {
      let zustand = 'zu';
      if (x.bedingt && !x.offen) zustand = 'bedingt';
      else if (x.offen && x.rang === best && !x.bedingt) zustand = 'jetzt';
      else if (x.offen) zustand = 'offen';
      const ab = r.stufe ? chip(STUFEN.indexOf(r.stufe)) : `<span class="bed">${esc(r.ab)}</span>`;
      return `<div class="antwort" data-zustand="${zustand}"><div class="ab">${ab}</div><div class="text">${inline(r.text)}</div></div>`;
    }).join('');
  }

  // ---------- Seitenleiste ----------
  function seitenleiste(tab, aktiv) {
    const side = $('#side');
    let h = '';
    if (tab === 'szenen') {
      for (const t of TEILE) {
        h += `<h3><a class="teil-link" href="#teil${t.nr}">${esc(t.titel)}</a></h3>`;
        for (const sid of t.szenen) {
          const s = SZ[sid];
          h += `<a class="item" href="#${sid}" aria-current="${sid === aktiv}"><span class="code">${sid}</span><span>${esc(s.titel)}</span><span></span></a>`;
        }
      }
    } else {
      h += `<a class="item" href="#personen" aria-current="${aktiv === 'personen'}"><span class="code">·</span><span>Alle auf einen Blick</span><span></span></a>`;
      // Gruppen in der Reihenfolge des Handbuchs, darin nach Nummer
      const GRUPPEN = ['Der Täter und seine Tochter', 'Die Lauten', 'Helfer und Zeugen', 'Berg und Rand'];
      const gruppen = [...GRUPPEN, ...new Set(PERSONEN.map((p) => p.gruppe).filter((g) => !GRUPPEN.includes(g)))];
      for (const gname of gruppen) {
        const drin = PERSONEN.filter((x) => x.gruppe === gname);
        if (!drin.length) continue;
        h += `<h3>${esc(gname)}</h3>`;
        for (const p of drin) {
          h += `<a class="item" href="#${p.id}" aria-current="${p.id === aktiv}"><span class="code">${p.id}</span><span>${esc(p.name)}</span><span>${punkte(p.id)}</span></a>`;
        }
      }
      h += `<h3>Sonst</h3><a class="item" href="#neben" aria-current="${aktiv === 'neben'}"><span class="code">·</span><span>Nebenfiguren</span><span></span></a>`;
      h += `<a class="item" href="#haltungen" aria-current="${aktiv === 'haltungen'}"><span class="code">·</span><span>Haltungen aller Personen</span><span></span></a>`;
    }
    side.innerHTML = h;
  }

  // ---------- Personen ----------
  function personSeite(pid) {
    const p = P[pid];
    S.zuletzt.P = pid; sichern();
    const ue = p.ueberblick || {};
    const felder = Object.entries(p.felder);
    const wer = felder.find(([k]) => /^Wer /.test(k));
    const redet = felder.find(([k]) => /^So redet/.test(k));
    const steigt = felder.find(([k]) => /steigt und fällt/.test(k));
    const ladder = p.leiter;
    let h = `<div class="page">
      <div class="kopf"><span class="code">${p.id}</span><h1>${esc(p.name)}</h1>
        <div class="unter">${inline(ue.wer || '')}</div></div>`;
    if (wer) h += `<p>${inline(wer[1])}</p>`;
    if (redet) h += `<p><b>So redet ${/sie/.test(redet[0]) ? 'sie' : 'er'}.</b> ${inline(redet[1])}</p>`;
    if (ue.wo) h += `<p class="hinweis"><b>Wo:</b> ${inline(ue.wo)} · <b>Für den Fall:</b> ${inline(ue.hergibt)}</p>`;

    // Haltung
    h += `<h2 class="abschnitt">Haltung</h2><div class="haltung">`;
    for (const e of ERM) {
      const i = stufe(pid, e.k);
      const start = STUFEN.indexOf(p.start[e.k]);
      const probe = !!(S.probe[pid] && S.probe[pid][e.k]);
      h += `<div class="erm" data-aktiv="${S.wer === e.k}" data-erm="${e.k}">
        <span class="name">${e.name}</span>
        <span class="stufe st-${i}">${STUFEN[i]}</span>
        <span class="klein">Start: ${STUFEN[start] || 'neutral'} · ${wuerfel(i)}</span>
        <label><input type="checkbox" id="probe-${pid}-${e.k}" data-probe="${e.k}" ${probe ? 'checked' : ''}> Probe gelungen, +1 für dieses Gespräch</label>
      </div>`;
    }
    h += `</div><div class="steuer">
      <span class="was">Tat</span>
      <span class="knopfreihe" role="group" aria-label="Tat">${[[-1, 'senkt'], [0, 'keine'], [1, 'hebt']].map(([v, t]) =>
        `<button type="button" data-tat="${v}" aria-pressed="${(S.tat[pid] || 0) === v}">${t}</button>`).join('')}</span>`;
    if (hatSchloss(p)) {
      h += `<span class="was">Schloss</span><span class="knopfreihe" role="group" aria-label="Schloss">${[[false, 'zu'], [true, 'offen']].map(([v, t]) =>
        `<button type="button" data-schloss="${v}" aria-pressed="${!!S.schloss[pid] === v}">${t}</button>`).join('')}</span>`;
    }
    if (pid === 'P5') {
      h += `<label><input type="checkbox" id="ausnahme-P5" data-ausnahme ${S.ausnahme.P5 ? 'checked' : ''}> Maxi ist am Berg gestorben (S17)</label>`;
    }
    h += `<button type="button" class="leise" data-gespraech-ende>Gespräch beendet</button></div>`;
    h += `<p class="hinweis">Eine Tat gilt dauerhaft und für alle drei, höchstens eine Stufe weg vom Start. Eine gelungene Probe gilt nur für dieses Gespräch.</p>`;
    if (steigt) h += `<p class="hinweis"><b>${esc(steigt[0])}.</b> ${inline(steigt[1])}</p>`;

    // Fragen
    const gruppen = themenGruppen(p);
    const e = ERM.find((x) => x.k === S.wer);
    h += `<h2 class="abschnitt">Fragen von ${e.name}</h2>
      <div class="filter" role="group" aria-label="Stichwort">
        <button type="button" class="chip" data-thema="" aria-pressed="${!thema}">alle</button>
        ${gruppen.map(([t]) => `<button type="button" class="chip" data-thema="${esc(t)}" aria-pressed="${thema === t}">${esc(t)}</button>`).join('')}
      </div><div id="katalog">`;
    for (const [t, rows] of gruppen) {
      if (thema && thema !== t) continue;
      h += `<div class="thema"><div class="t">${esc(t)}</div><div class="antworten">${antwortenHTML(p, rows, S.wer)}</div></div>`;
    }
    h += `</div><p class="hinweis">Fett ist, was ${esc(p.name.replace(/^(Der|Die) /, ''))} ${e.name} jetzt sagt. Blasse Zeilen braucht eine höhere Stufe. Zeilen mit gestricheltem Rahmen gelten nur unter dieser Bedingung, etwa mit einem Vorhalt.</p>`;

    // Stufenleiter
    if (ladder.length) {
      const jetzt = STUFEN[stufe(pid, S.wer)];
      h += `<h2 class="abschnitt">Was ${/sie/.test((wer || [''])[0]) ? 'sie' : 'er'} auf jeder Stufe tut</h2><div class="leiter">${
        ladder.map((z) => `<div class="z" data-jetzt="${z.stufe === jetzt}"><div>${chip(STUFEN.indexOf(z.stufe))}</div><div>${inline(z.text)}</div></div>`).join('')}</div>`;
    }

    // Hintergrund
    const rest = felder.filter(([k]) => !/^Wer |^So redet|^Haltung zu Beginn|steigt und fällt/.test(k));
    if (rest.length || p.tabellen.length) {
      h += `<h2 class="abschnitt">Hintergrund</h2><div class="felder">${rest.map(([k, v]) => `<p class="feld"><b>${esc(k)}.</b> ${inline(v)}</p>`).join('')}</div>`;
      for (const t of p.tabellen) h += tabelle(t.kopf, t.zeilen);
    }
    h += `</div>`;
    return h;
  }
  function personEvents(view, pid) {
    view.querySelectorAll('[data-erm]').forEach((el) => el.addEventListener('click', (ev) => {
      if (ev.target.closest('label')) return;
      S.wer = el.dataset.erm; sichern(); zeichne();
    }));
    view.querySelectorAll('[data-probe]').forEach((el) => el.addEventListener('change', () => {
      S.probe[pid] = S.probe[pid] || {};
      S.probe[pid][el.dataset.probe] = el.checked; sichern(); zeichne();
    }));
    view.querySelectorAll('[data-tat]').forEach((el) => el.addEventListener('click', () => {
      S.tat[pid] = Number(el.dataset.tat); sichern(); zeichne();
    }));
    view.querySelectorAll('[data-schloss]').forEach((el) => el.addEventListener('click', () => {
      S.schloss[pid] = el.dataset.schloss === 'true'; sichern(); zeichne();
    }));
    view.querySelectorAll('[data-ausnahme]').forEach((el) => el.addEventListener('change', () => {
      S.ausnahme.P5 = el.checked; sichern(); zeichne();
    }));
    view.querySelectorAll('[data-gespraech-ende]').forEach((el) => el.addEventListener('click', () => {
      delete S.probe[pid]; sichern(); zeichne();
    }));
    view.querySelectorAll('[data-thema]').forEach((el) => el.addEventListener('click', () => {
      thema = el.dataset.thema || null; zeichne();
    }));
  }

  function personenUeberblick() {
    let h = `<div class="page"><div class="kopf"><span class="code">P1 bis P22</span><h1>Die zweiundzwanzig auf einen Blick</h1>
      <div class="unter">Punkte zeigen die Haltung jetzt, in der Reihenfolge Brandl, Hagedorn, Hias.</div></div>
      <div class="tabelle"><table><thead><tr><th>P</th><th>Wer</th><th>Haltung</th><th>Wo</th><th>Für den Fall</th></tr></thead><tbody>`;
    for (const p of PERSONEN) {
      const ue = p.ueberblick || {};
      h += `<tr><td><a class="ref" href="#${p.id}">${p.id}</a></td><td>${inline(ue.wer || p.name)}</td><td>${punkte(p.id)}</td><td>${inline(ue.wo || '')}</td><td>${inline(ue.hergibt || '')}</td></tr>`;
    }
    h += `</tbody></table></div><h2 class="abschnitt">Wie du die Leute spielst</h2>${md(D.personen.regeln_md.replace(/### Die zweiundzwanzig auf einen Blick[\s\S]*$/, ''))}</div>`;
    return h;
  }

  // ---------- Haltungen ----------
  let resetFrage = false;
  function haltungenSeite() {
    let h = `<div class="page"><div class="kopf"><h1>Haltungen</h1>
      <div class="unter">Wie jede Person gerade zu den drei Ermittlern steht. Gespeichert wird nur in diesem Browser.</div></div>
      <div class="steuer"><button type="button" class="leise" data-alle-gespraeche>Alle Gespräche beenden</button>
      <button type="button" class="leise gefahr" data-reset>${resetFrage ? 'Wirklich alles auf den Anfang setzen?' : 'Alles auf den Anfang'}</button>
      ${resetFrage ? '<button type="button" class="leise" data-reset-nein>Lieber nicht</button>' : ''}</div>
      <div class="tabelle"><table class="matrix"><thead><tr><th>P</th><th>Name</th>${ERM.map((e) => `<th>${e.name}</th>`).join('')}<th>Tat</th><th>Schloss</th></tr></thead><tbody>`;
    for (const p of PERSONEN) {
      const tat = S.tat[p.id] || 0;
      h += `<tr><td><a class="ref" href="#${p.id}">${p.id}</a></td><td>${esc(p.name)}</td>${ERM.map((e) => {
        const i = stufe(p.id, e.k), st = STUFEN.indexOf(p.start[e.k]);
        return `<td>${chip(i)}${i !== st ? ` <span class="klein code">war ${STUFEN[st]}</span>` : ''}</td>`;
      }).join('')}<td class="n">${tat > 0 ? '+1' : tat < 0 ? '−1' : '·'}</td><td>${hatSchloss(p) ? (S.schloss[p.id] ? 'offen' : 'zu') : '·'}</td></tr>`;
    }
    h += `</tbody></table></div></div>`;
    return h;
  }
  function haltungenEvents(view) {
    view.querySelector('[data-alle-gespraeche]').addEventListener('click', () => { S.probe = {}; sichern(); zeichne(); });
    view.querySelector('[data-reset]').addEventListener('click', () => {
      if (!resetFrage) { resetFrage = true; zeichne(); return; }
      const wer = S.wer; S = leer(); S.wer = wer; resetFrage = false; sichern(); zeichne();
    });
    const nein = view.querySelector('[data-reset-nein]');
    if (nein) nein.addEventListener('click', () => { resetFrage = false; zeichne(); });
  }

  // ---------- Szenen ----------
  function bildKarte(b) {
    return `<figure class="bild" style="margin:0">
      <img src="bilder/szenen/${b.code}.jpg" alt="Bild ${esc(b.code)}" data-code="${esc(b.code)}" data-versuch="jpg">
      <div class="fehlt" hidden>Bild ${esc(b.code)} fehlt noch.<br>Prompt im Handbuch, Reiter Bildprompts.</div>
      <figcaption class="unter"><details><summary>Was das Bild zeigt</summary>${inline(b.text)}</details></figcaption></figure>`;
  }
  function bildFehler(img) {
    if (img.dataset.versuch === 'jpg') { img.dataset.versuch = 'png'; img.src = `bilder/szenen/${img.dataset.code}.png`; return; }
    img.hidden = true; img.nextElementSibling.hidden = false;
  }
  function leuteHTML(sec) {
    const L = sec.md.split('\n');
    const rest = [];
    let inTab = false, tabFertig = false;
    for (const l of L) {
      if (l.startsWith('|') && !tabFertig) { inTab = true; continue; }
      if (inTab && !l.startsWith('|')) { inTab = false; tabFertig = true; }
      rest.push(l);
    }
    return { rest: rest.join('\n') };
  }
  function szeneSeite(sid) {
    const s = SZ[sid];
    S.zuletzt.S = sid; sichern();
    const teil = TEILE.find((t) => t.nr === s.teil);
    let h = `<div class="page"><div class="kopf"><span class="code">${s.id} · ${esc(teil.titel)}</span><h1>${esc(s.titel)}</h1></div>`;
    if (Object.keys(s.meta).length) {
      h += `<dl class="meta">${Object.entries(s.meta).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${inline(v)}</dd></div>`).join('')}</dl>`;
    }
    if (s.worum) h += `<p><b>Worum es geht.</b> ${inline(s.worum)}</p>`;
    if (s.bilder.length) h += `<div class="bilder">${s.bilder.map(bildKarte).join('')}</div>`;
    // Rest des Vorspanns ohne Kopf-Tabelle, Worum und Bildbeschreibungen
    const vor = s.vorspann_md.split('\n').filter((l) => !l.startsWith('|') && !/^\*\*Worum es geht/.test(l) && !/^\*\*Bild /.test(l)).join('\n');
    if (vor.trim()) h += md(vor);
    for (const sec of s.abschnitte) {
      h += `<h2 class="abschnitt">${esc(sec.titel)}</h2>`;
      if (/^Die Leute hier/.test(sec.titel) && s.leute.length) {
        h += `<div class="leute">${s.leute.map((x) => {
          const pid = x.personen.length === 1 ? x.personen[0] : null;
          const jetzt = pid ? ERM.map((e) => `<span title="${e.name}">${chip(stufe(pid, e.k))}</span>`).join('') : `<span class="klein">${inline(x.haltung)}</span>`;
          const name = pid ? `<a href="#${pid}">${inline(x.wer)}</a> <span class="code">${pid}</span>` : inline(x.wer);
          return `<div class="z"><div>${name}</div><div class="hs">${jetzt}</div><div>${inline(x.tut)}</div></div>`;
        }).join('')}</div>`;
        h += `<p class="hinweis">Die Haltungen sind die von jetzt, für Brandl, Hagedorn und Hias. Im Buch stehen die vom Anfang.</p>`;
        h += md(leuteHTML(sec).rest);
      } else {
        h += md(sec.md);
      }
    }
    h += `</div>`;
    return h;
  }
  function teilSeite(nr) {
    const t = TEILE.find((x) => x.nr === nr);
    return `<div class="page"><div class="kopf"><span class="code">Teil ${nr}</span><h1>${esc(t.titel)}</h1></div>${md(t.intro)}</div>`;
  }

  // ---------- Suche ----------
  function sucheSeite(q) {
    const nq = fold(q);
    const e = ERM.find((x) => x.k === S.wer);
    let h = `<div class="page"><div class="kopf"><span class="code">Suche</span><h1>»${esc(q)}«</h1>
      <div class="unter">Antworten so, wie sie ${e.name} jetzt bekommt.</div></div>`;
    let n = 0;
    let kat = '';
    for (const p of PERSONEN) {
      const name = fold(p.name).includes(nq);
      const gruppen = themenGruppen(p).filter(([t, rows]) => name || fold(t).includes(nq) || rows.some((r) => fold(r.text).includes(nq)));
      if (!gruppen.length) continue;
      kat += `<div class="treffer"><div class="kopfzeile"><a href="#${p.id}"><b>${esc(p.name)}</b></a> <span class="code">${p.id}</span> ${chip(stufe(p.id, S.wer))}</div>`;
      for (const [t, rows] of gruppen) {
        kat += `<div class="thema"><div class="t">${esc(t)}</div><div class="antworten">${antwortenHTML(p, rows, S.wer)}</div></div>`;
        n++;
      }
      kat += `</div>`;
    }
    h += `<h2 class="abschnitt">Im Fragenkatalog</h2>${kat || '<p class="hinweis">Keine Person sagt etwas dazu.</p>'}`;
    let sz = '';
    for (const s of SZENEN) {
      const quellen = [s.titel, s.vorspann_md, ...s.abschnitte.map((a) => a.titel + '\n' + a.md)];
      const voll = quellen.join('\n');
      const pos = fold(voll).indexOf(nq);
      if (pos < 0) continue;
      const a = Math.max(0, pos - 90), schnipsel = voll.slice(a, pos + nq.length + 120).replace(/[|*#>]/g, ' ').replace(/\s+/g, ' ');
      sz += `<div class="treffer"><div class="kopfzeile"><a href="#${s.id}"><b>${esc(s.titel)}</b></a> <span class="code">${s.id}</span></div><div class="hinweis">…${esc(schnipsel)}…</div></div>`;
    }
    h += `<h2 class="abschnitt">In den Szenen</h2>${sz || '<p class="hinweis">Keine Szene erwähnt das.</p>'}</div>`;
    return h;
  }

  // ---------- Steuerung ----------
  function ziel() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (P[h]) return { tab: 'personen', id: h };
    if (SZ[h]) return { tab: 'szenen', id: h };
    let m;
    if ((m = h.match(/^teil(\d)$/))) return { tab: 'szenen', teil: Number(m[1]) };
    if (h === 'haltungen') return { tab: 'personen', id: 'haltungen' };
    if (h === 'neben') return { tab: 'personen', id: 'neben' };
    if (h === 'szenen') return { tab: 'szenen', id: S.zuletzt.S };
    return { tab: 'personen', id: 'personen' };
  }
  function zeichne() {
    const z = ziel();
    const view = $('#view');
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === z.tab && !suchtext)));
    document.querySelectorAll('.wer button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wer === S.wer)));
    seitenleiste(z.tab, z.id || (z.teil ? 'teil' + z.teil : ''));
    if (suchtext.length >= 2) {
      view.innerHTML = sucheSeite(suchtext);
      markiere(view.querySelector('.page'), suchtext);
    } else if (z.teil) {
      view.innerHTML = teilSeite(z.teil);
    } else if (z.tab === 'szenen') {
      view.innerHTML = szeneSeite(z.id);
    } else if (z.id === 'haltungen') {
      view.innerHTML = haltungenSeite(); haltungenEvents(view);
    } else if (z.id === 'neben') {
      view.innerHTML = `<div class="page"><div class="kopf"><h1>Nebenfiguren</h1></div>${md(D.personen.nebenfiguren_md)}</div>`;
    } else if (P[z.id]) {
      view.innerHTML = personSeite(z.id); personEvents(view, z.id);
    } else {
      view.innerHTML = personenUeberblick();
    }
    view.querySelectorAll('img[data-code]').forEach((img) => {
      img.addEventListener('error', () => bildFehler(img));
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) bildFehler(img);
    });
  }

  function start() {
    document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
      suchtext = ''; $('#suche').value = '';
      const ziel = b.dataset.tab === 'szenen' ? S.zuletzt.S : 'personen';
      if (location.hash === '#' + ziel) zeichne(); else location.hash = ziel;
    }));
    document.querySelectorAll('.wer button').forEach((b) => b.addEventListener('click', () => {
      S.wer = b.dataset.wer; sichern(); zeichne();
    }));
    $('#suche').addEventListener('input', (e) => {
      suchtext = e.target.value.trim(); zeichne();
    });
    $('#side-toggle').addEventListener('click', () => {
      const side = $('#side');
      const zu = side.dataset.zu === 'true';
      side.dataset.zu = String(!zu);
      $('#side-toggle').setAttribute('aria-expanded', String(zu));
    });
    window.addEventListener('hashchange', () => {
      suchtext = ''; $('#suche').value = ''; thema = null; zeichne();
      $('#view').scrollTop = 0;
      if (window.matchMedia('(max-width: 760px)').matches) { $('#side').dataset.zu = 'true'; $('#side-toggle').setAttribute('aria-expanded', 'false'); }
    });
    if (window.matchMedia('(max-width: 760px)').matches) $('#side').dataset.zu = 'true';
    zeichne();
  }
  start();
})();
