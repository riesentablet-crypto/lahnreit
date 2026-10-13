// Figuren mit Bild und 3D-Modell.
// 3D: jede Figur liegt als modelle/<Schlüssel>.glb und, für den Browser ohne Server, als modelle/<Schlüssel>.js.
// Porträts: bilder/app/<Schlüssel>.webp (ganze Figur) und bilder/app/<Schlüssel>-kopf.webp (Kopf), verkleinert aus bilder/.
// Schlüssel ist die Personennummer; Nebenfiguren bekommen einen Namen und »neben« (ein Wort, das in ihrer Zeile im Handbuch vorkommt).
window.LAHNREIT_MODELLE = {
  P1: { name: 'Schwester Benedikta' },
  P2: { name: 'Georg Daxenberger, der Bürgermeister' },
  P3: { name: 'Sebastian Gschwendtner' },
  P4: { name: 'Ilse Reichl' },
  P5: { name: 'Ludwig Haslberger, der Jäger' },
  P6: { name: 'Korbinian Strasser, der Korbi' },
  P7: { name: 'Theres Mayr, die Kramerin' },
  P8: { name: 'Maria Hallmaier, die Lahnwirtin' },
  P9: { name: 'Magdalena Gschwendtner, die Leni' },
  P10: { name: 'Martin Obermüller, der Martl' },
  P11: { name: 'Max Haslberger, der Maxi' },
  P12: { name: 'Michael Gruber, der Mesner-Michl' },
  P13: { name: 'Kaspar Eisenreich, der Moar-Kaspar' },
  P14: { name: 'Alois Kreitmair, der Pfarrer' },
  P15: { name: 'Anton Rauch' },
  P16: { name: 'Rosalia Brandstätter, die Rosl' },
  P17: { name: 'Franz Xaver Lechner, der Schuster-Xare' },
  P18: { name: 'Anton Mayr, der Toni' },
  P19: { name: 'Gertraud Daxenberger, die Traudl' },
  P20: { name: 'Josef Wimmer, der Wimmer-Sepp' },
  P21: { name: 'Gerhard Wolff' },
  P22: { name: 'Kreszenz Huber, die Zenzi' },
  pfisterer: { name: 'Johann Pfisterer, der Säger', neben: 'Pfisterer' },
  daxerin: { name: 'Anna Daxenberger, die Daxerin', zu: 'P2' },
};
// Porträts: wer eins hat. Das Bild von Josef Wimmer ist die Fassung mit dem Muttermal links.
window.LAHNREIT_PORTRAETS = {
  P1: 1, P2: 1, P3: 1, P4: 1, P5: 1, P6: 1, P7: 1, P8: 1, P9: 1, P10: 1, P11: 1, P12: 1, P13: 1, P14: 1, P15: 1,
  P16: 1, P17: 1, P18: 1, P19: 1, P20: 1, P21: 1, P22: 1, pfisterer: 1, daxerin: 1,
  'daxer-paar': { name: 'Georg und Anna Daxenberger', zu: 'P2' },
};
