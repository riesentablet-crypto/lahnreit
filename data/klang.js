// Klang je Szene und Ort. Eine Lage ist, was leise unter der Szene läuft; Knöpfe spielt die Spielleitung von Hand.
// Schicht: [Datei, Pegel in dB, { tief: Tiefpass in Hz }]. Die Schichten liegen alle bei -24 LUFS, der Pegel senkt sie.
// zufall: [Knopf, Pegel, frühestens, spätestens] in Sekunden: kommt von selbst, solange die Lage läuft.
// Knopf: Kennung oder [Kennung, eigener Name, Pegel]. Die Knöpfe liegen bei -20 LUFS, Ferne und Dämpfung sind eingerechnet.
// uhr: welche Lage bei welcher Tageszeit zuerst angeboten wird (Nummer in lagen).
(function () {
  // Der Bach liegt unten am Sägewerk (D12); im übrigen Dorf hört man ihn nur fern und dumpf (Daniel, 18.10.)
  const BACH_FERN = ['L-bach', -26, { tief: 1500 }];
  const DORF_TAG = [BACH_FERN, ['L-wind', -12], ['L-tauwasser', -16]];
  const DORF_NACHT = [BACH_FERN, ['L-wind', -10]];
  const FEUER = ['L-feuer', -10];
  const STUBE = [['L-ofen', -12]];
  const FERN = { tief: 900 };

  window.LAHNREIT_KLANG = {
    // Grundpegel einzelner Knöpfe, damit Fernes leiser bleibt als Nahes
    pegel: {
      'C-hund-fern': -8, 'C-kuh': -6, 'C-vieh': -4, 'C-hahn': -5, 'C-laeuten': -4, 'C-viertel': -6, 'C-vier': -4, 'C-sieben': -4,
      'C-sterbe-schlag': -4, 'C-sterbe-hand': -4, 'C-orgel-dumpf': -6, 'C-gesang-dumpf': -6, 'C-ottilie': -8, 'C-zug-draussen': -6,
      'C-ziehharmonika': -10, 'C-klopfen3': -6, 'C-bleistift': -10, 'C-kette': -8, 'C-kette-unten': -9, 'C-lahn-wald': -6,
      'C-schuss-tal': -3, 'C-hang': -4, 'C-heulen': -2, 'C-kratzen-22': -3, 'C-klopfen-20': -2, 'C-zischen': -8, 'C-stock': -4,
      'C-stock-dielen': -4, 'C-raben': -2, 'C-rabe': -4, 'C-kannen': -8, 'C-handwagen': -6, 'C-radio': -6, 'C-haeher': -4,
      'C-ast': -4, 'C-knacken': -4, 'C-rauch': -4, 'C-schindel': -4, 'C-balkontuer': -4, 'C-holzschuhe': -6, 'C-boeller': -2,
    },
    seiten: {
      // ---------- Teil 1 ----------
      S1: {
        lagen: [
          { name: 'Auf der Autobahn', s: [['L-autobahn', -4]] },
          { name: 'Die Bergstraße', s: [['L-schotter', -4]] },
          { name: 'Dorfplatz um sechs', s: [...DORF_NACHT, ['L-feuer', -8]] },
        ],
        knoepfe: ['C-kreuzer', ['C-radio', 'Das Autoradio'], 'C-autotuer', ['C-laeuten', 'Abendläuten'], ['C-hund-fern', 'Ein Hund bellt']],
      },
      S2: {
        lagen: [
          { name: 'Im Nebenzimmer', s: [['L-gaststube', -16, { tief: 700 }], ['L-ofen', -10]] },
          { name: 'Draußen am Platz', s: [...DORF_NACHT, ['L-feuer', -10]] },
        ],
        knoepfe: ['C-treppe'],
      },
      S3: {
        lagen: [{ name: 'Lindners Zimmer', s: [['L-uhr', -8], ['L-wind', -20, { tief: 600 }]], zufall: [['C-balkontuer', -6, 25, 70]] }],
        knoepfe: ['C-treppe', 'C-schluessel', 'C-balkontuer'],
      },
      S4: {
        lagen: [{ name: 'Die volle Stube', s: [['L-gaststube', -6], ['L-ofen', -14]], zufall: [['C-karten', -8, 10, 30], ['C-kruege', -8, 12, 35], ['C-lachen', -8, 15, 45]] }],
        knoepfe: [['C-stock-dielen', 'Der Moar-Kaspar klopft'], 'C-lachen', 'C-karten', ['C-zug-draussen', 'Gegen elf: Glocken draußen']],
      },
      S5: {
        lagen: [{ name: 'Der Platz in der Nacht', s: [...DORF_NACHT, ['L-feuer', -9]] }],
        knoepfe: [['C-zug', 'Der Zug mit den Glocken'], 'C-goassl', 'C-fenster'],
      },
      // ---------- Teil 2 ----------
      S6: {
        lagen: [],
        knoepfe: [['C-klopfen3', 'Es klopft dreimal'], 'C-holzschuhe'],
      },
      S7: {
        lagen: [
          { name: 'In der Kirche', s: [['L-kirche', -6], ['L-mauern', -20, FERN]] },
          { name: 'Auf dem Platz', s: [['L-leute', -8], ['L-roesser', -12], BACH_FERN] },
        ],
        knoepfe: ['C-orgel', 'C-motorrad', 'C-hufe', 'C-blasmusik', ['C-boeller', 'Ein Böller'], ['C-stute', 'Die Stute steigt'], ['C-laeuten', 'Die Glocken läuten']],
      },
      S8: {
        lagen: [
          { name: 'Das leere Dorf', s: [...DORF_TAG, ['L-roesser', -22]], zufall: [['C-kette', -10, 30, 80]] },
          { name: 'In einem Haus', s: [['L-ofen', -12], ['L-uhr', -14]] },
        ],
        knoepfe: [['C-orgel-dumpf', 'Orgel aus der Kirche'], 'C-gesang-dumpf', 'C-kirchentuer', ['C-viertel', 'Die Uhr schlägt Viertel'], 'C-kette', 'C-ottilie', 'C-hund-kette', 'C-balken', ['C-laeuten', 'Halb elf: die Glocken']],
      },
      S9: {
        lagen: [
          { name: 'Georginachmittag', s: [...DORF_TAG, ['L-feuer', -12], ['L-gaststube', -22, { tief: 600 }]], zufall: [['C-ziehharmonika', -12, 50, 120]] },
          { name: 'Werktag', s: [...DORF_TAG, ['L-saege', -22, { tief: 1500 }], ['L-kinder', -24]], zufall: [['C-kannen', -14, 40, 100]] },
          { name: 'Am Abend', s: [...DORF_NACHT, ['L-feuer', -10]] },
        ],
        uhr: { abends: 2, nachts: 2 },
        knoepfe: [['C-vier', 'Es schlägt vier'], 'C-kuh', ['C-laeuten', 'Um sechs: Rosenkranz'], 'C-viertel', 'C-ziehharmonika'],
      },
      // ---------- Teil 3: der Berg ----------
      S10: {
        lagen: [
          { name: 'In der Gaststube', s: [['L-ofen', -10]], zufall: [['C-zischen', -8, 15, 45]] },
          { name: 'Draußen am Platz', s: [...DORF_NACHT, ['L-feuer', -8]] },
        ],
        knoepfe: ['C-zischen', ['C-hahn', 'Ein Hahn kräht']],
      },
      S11: {
        lagen: [{ name: 'Im Bergwald', s: [['L-fichten', -8], ['L-pulver', -12], ['L-atem', -18]] }],
        knoepfe: [['C-hasso', 'Ein Hund hechelt'], 'C-ast', 'C-haeher'],
      },
      S12: {
        lagen: [{ name: 'Am Marterl', s: [['L-bacheis', -8], ['L-fichten', -12]] }],
        knoepfe: ['C-haeher', 'C-ast', 'C-ausrutschen'],
      },
      S13: {
        lagen: [{ name: 'Über die Lahn', s: [['L-harsch', -10], ['L-atem', -14], ['L-sattel', -20]] }],
        knoepfe: ['C-hang', 'C-lahn'],
      },
      S14: {
        lagen: [
          { name: 'Auf der Hochalm', s: [['L-sattel', -8], ['L-tauwasser', -14]] },
          { name: 'In der Kaser', s: [['L-ritzen', -10], ['L-sattel', -20, { tief: 700 }]] },
        ],
        knoepfe: ['C-riegel', 'C-rabe'],
      },
      S15: {
        lagen: [{ name: 'Am Sattel', s: [['L-sattel', -6]] }],
        knoepfe: ['C-raben', 'C-rabe'],
      },
      S16: {
        lagen: [
          { name: 'Der Wind dreht', s: [['L-sattel', -4]] },
          { name: 'Graupel', s: [['L-sattel', -6], ['L-graupel', -8]] },
          { name: 'Der Sturm', s: [['L-sturm', -2]] },
        ],
        knoepfe: ['C-boee', ['C-hund-fern', 'Weit unten bellt ein Hund']],
      },
      S17: {
        lagen: [
          { name: 'In der Hütte', s: [['L-sturm-innen', -4], ['L-herd', -6], ['L-ritzen', -14]], zufall: [['C-knacken', -6, 20, 55], ['C-schindel', -8, 30, 80], ['C-rauch', -8, 45, 110]] },
          { name: 'Die Tür ist offen', s: [['L-sturm', 0]] },
        ],
        knoepfe: [['C-heult-18', '18 Uhr: der Hund heult'], ['C-klopfen-20', '20 Uhr: Schritte, Klopfen'], ['C-kratzen-22', '22 Uhr: Kratzen an der Tür'], 'C-schuss-sturm', 'C-knacken', 'C-rauch', 'C-schindel'],
      },
      S18: {
        lagen: [
          { name: 'Stille nach dem Sturm', s: [['L-wind', -26, { tief: 1200 }]] },
          { name: 'Der Abstieg', s: [['L-schlitten', -8], ['L-pulver', -14], ['L-fichten', -18]] },
        ],
        knoepfe: ['C-tuer-schnee', 'C-schaufeln', ['C-kette-unten', 'Gegen acht: die Kette'], ['C-sterbe-hand', 'Das Sterbeglöckerl']],
      },
      // ---------- Teil 4 ----------
      S19: {
        lagen: [{ name: 'Im Leichenhaus', s: [['L-tropfen', -8], ['L-lampe', -14], ['L-mesner', -12]] }],
        knoepfe: [],
      },
      S20: {
        lagen: [{ name: 'Am Hof', s: [['L-brunnen', -12], ['L-stall', -18, FERN], ['L-axt', -8], BACH_FERN] }],
        knoepfe: ['C-hund-kette', ['C-scheibe', 'Anna Hübl klopft']],
      },
      S21: {
        lagen: [{ name: 'An der Haltestelle', s: [...DORF_TAG, ['L-postbus', -8]] }],
        knoepfe: ['C-dreiklang', 'C-bus-ab'],
      },
      S22: {
        lagen: [
          { name: 'In der Poststelle', s: [...STUBE] },
          { name: 'Das Ferngespräch', s: [['L-leitung', -6]] },
          { name: 'München am Apparat', s: [['L-leitung', -9], ['L-muenchen', -10]] },
        ],
        knoepfe: ['C-klappe', 'C-kurbel', 'C-bleistift'],
      },
      // ---------- Teil 5 ----------
      S23: {
        lagen: [{ name: 'Die Stube', s: [['L-uhr', -6], ['L-ofen', -14]] }],
        knoepfe: ['C-hund-kette'],
      },
      S24: {
        lagen: [
          { name: 'Am Hof', s: [BACH_FERN, ['L-wind', -14], ['L-stall', -20, FERN]] },
          { name: 'Im Hang', s: [['L-fichten', -12], ['L-waten', -8], ['L-keuchen', -12], ['L-schmelz', -18]] },
        ],
        knoepfe: [['C-scheibe', 'Anna Hübl klopft'], 'C-hang', 'C-lahn', ['C-lahn-wald', 'Die Lahn, vom Wald aus'], ['C-sterbe-hand', 'Am Abend: das Glöckerl']],
      },
      S25: {
        lagen: [{ name: 'Der Platz am Morgen', s: [...DORF_NACHT] }],
        knoepfe: ['C-motor', ['C-sieben', 'Es schlägt sieben'], 'C-autotuer', ['C-wagendach', 'Zwei Schläge aufs Dach'], 'C-bus-ab'],
      },

      // ---------- Orte im Dorf ----------
      D1: {
        lagen: [
          { name: 'Am Tag', s: [...DORF_TAG, ['L-kinder', -20], ['L-feuer', -14]] },
          { name: 'Am Abend', s: [...DORF_NACHT, FEUER] },
          { name: 'Georgimorgen', s: [['L-leute', -8], ['L-roesser', -12], BACH_FERN] },
        ],
        uhr: { abends: 1, nachts: 1, georgi: 2 },
        knoepfe: ['C-laeuten', 'C-viertel', 'C-hund-fern', 'C-bus-ab'],
      },
      D2: {
        lagen: [
          { name: 'Die leere Kirche', s: [['L-mauern', -10, FERN]] },
          { name: 'Um sechs: Rosenkranz', s: [['L-rosenkranz', -8], ['L-mauern', -20, FERN]] },
          { name: 'Die Messe', s: [['L-kirche', -6], ['L-mauern', -20, FERN]] },
        ],
        uhr: { abends: 1, georgi: 2 },
        knoepfe: ['C-kirchentuer', 'C-orgel', 'C-laeuten', 'C-viertel'],
      },
      D3: {
        lagen: [
          { name: 'Am Friedhof', s: [...DORF_TAG] },
          { name: 'Im Leichenhaus', s: [['L-tropfen', -8], ['L-lampe', -14]] },
          { name: 'Am Abend', s: [...DORF_NACHT] },
        ],
        uhr: { abends: 2, nachts: 2 },
        knoepfe: ['C-sterbe-hand', 'C-laeuten', 'C-rabe'],
      },
      D4: {
        lagen: [{ name: 'Im Pfarrhof', s: [['L-uhr', -8], ['L-ofen', -14], ['L-mauern', -24, FERN]] }],
        knoepfe: ['C-laeuten'],
      },
      D5: {
        lagen: [
          { name: 'Die Stube ruhig', s: [['L-ofen', -10]] },
          { name: 'Die Stube voll', s: [['L-gaststube', -6], ['L-ofen', -14]], zufall: [['C-karten', -8, 10, 30], ['C-kruege', -8, 12, 35], ['C-lachen', -8, 15, 45]] },
        ],
        uhr: { abends: 1 },
        knoepfe: ['C-treppe', 'C-schluessel', 'C-lachen', 'C-karten'],
      },
      D6: {
        lagen: [
          { name: 'In der Kanzlei', s: [...STUBE] },
          { name: 'Das Ferngespräch', s: [['L-leitung', -6]] },
        ],
        knoepfe: ['C-klappe', 'C-kurbel', 'C-bleistift', 'C-ottilie'],
      },
      D7: {
        lagen: [
          { name: 'Die Schulstube', s: [['L-schule', -8], ['L-ofen', -18]] },
          { name: 'Nach der Schule', s: [['L-ofen', -10]] },
        ],
        uhr: { nachmittags: 1, abends: 1, nachts: 1, georgi: 1 },
        knoepfe: [],
      },
      D8: {
        lagen: [{ name: 'Vor dem Laden', s: [...DORF_TAG] }],
        uhr: {},
        knoepfe: ['C-ladenglocke'],
      },
      D9: {
        lagen: [{ name: 'In der Werkstatt', s: [['L-ofen', -12]] }],
        knoepfe: ['C-schuster'],
      },
      D10: {
        lagen: [
          { name: 'Am Tag', s: [['L-brunnen', -12], ['L-stall', -18, FERN], ['L-axt', -8], BACH_FERN] },
          { name: 'Die Stube', s: [['L-uhr', -6], ['L-ofen', -14]] },
          { name: 'In der Nacht', s: [...DORF_NACHT, ['L-brunnen', -18]] },
        ],
        uhr: { abends: 2, nachts: 2 },
        knoepfe: ['C-hund-kette', 'C-scheibe', 'C-kuh'],
      },
      D11: {
        lagen: [
          { name: 'Die Stube', s: [['L-uhr', -8], ['L-ofen', -12]] },
          { name: 'Im Stall', s: [['L-stall', -8]] },
        ],
        knoepfe: ['C-stock', 'C-kuh'],
      },
      D12: {
        lagen: [
          { name: 'Die Säge läuft', s: [['L-saege', -6], ['L-bach', -12]] },
          { name: 'Die Säge steht', s: [['L-bach', -8], ['L-wind', -14]] },
          { name: 'Das E-Werk am Wehr', s: [['L-ewerk', -8], ['L-bach', -10]] },
        ],
        uhr: { abends: 1, nachts: 1, georgi: 1 },
        knoepfe: [],
      },
      D13: {
        lagen: [{ name: 'Am Häusl', s: [...DORF_NACHT] }],
        knoepfe: ['C-hund-fern'],
      },
      D14: {
        lagen: [{ name: 'Im Jägerhaus', s: [['L-uhr', -8], ['L-ofen', -16]] }],
        knoepfe: ['C-hund-kette'],
      },
      D15: {
        lagen: [{ name: 'An der Milchbank', s: [...DORF_TAG], zufall: [['C-kannen', -8, 15, 40]] }],
        knoepfe: ['C-kannen', 'C-handwagen'],
      },

      // ---------- Orte am Berg ----------
      B1: {
        lagen: [
          { name: 'Im Bergwald', s: [['L-fichten', -8]] },
          { name: 'Gehen', s: [['L-fichten', -10], ['L-pulver', -12], ['L-atem', -18]] },
        ],
        knoepfe: ['C-ast', 'C-haeher', 'C-hasso'],
      },
      B2: {
        lagen: [{ name: 'Am Marterl', s: [['L-bacheis', -8], ['L-fichten', -12]] }],
        knoepfe: ['C-haeher', 'C-ast', 'C-ausrutschen'],
      },
      B3: {
        lagen: [{ name: 'Auf der Alm', s: [['L-sattel', -10], ['L-tauwasser', -14]] }],
        knoepfe: ['C-rabe'],
      },
      B4: {
        lagen: [
          { name: 'Am Rand der Lahn', s: [['L-sattel', -10]] },
          { name: 'Über die Lahn', s: [['L-harsch', -10], ['L-atem', -14], ['L-sattel', -20]] },
          { name: 'Am Nachmittag', s: [['L-schmelz', -8], ['L-sattel', -16]] },
        ],
        knoepfe: ['C-hang', 'C-lahn'],
      },
      B5: {
        lagen: [
          { name: 'Draußen', s: [['L-sattel', -8], ['L-tauwasser', -14]] },
          { name: 'In der Kaser', s: [['L-ritzen', -10], ['L-sattel', -20, { tief: 700 }]] },
        ],
        knoepfe: ['C-riegel', 'C-rabe'],
      },
      B6: {
        lagen: [
          { name: 'In der Hütte', s: [['L-herd', -6], ['L-ritzen', -12]] },
          { name: 'Draußen', s: [['L-sattel', -8], ['L-fichten', -16]] },
        ],
        knoepfe: [],
      },
      B7: {
        lagen: [{ name: 'Am Sattel', s: [['L-sattel', -6]] }],
        knoepfe: ['C-raben', 'C-rabe', 'C-boee'],
      },
    },
    // Für die Dorfgeschichten, die keine eigene Seite haben
    erzaehlungen: [
      { id: 'G7', name: 'Die Föhnnacht', lagen: [{ name: 'Der Föhnsturm', s: [['L-foehn', -4]] }], knoepfe: ['C-vieh', 'C-heulen', ['C-sterbe-schlag', 'Um zwei: das Glöckerl']] },
      { id: 'G10', name: 'Der Schuss am Donnerstag', lagen: [], knoepfe: [['C-schuss-tal', 'Der Schuss um zehn nach vier']] },
    ],
  };
})();
