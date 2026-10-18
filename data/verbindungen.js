// Welche Requisiten zu einem Eintrag »Was es hier gibt« gehören, von Hand nach dem Spielleiterhandbuch.
// Schlüssel: Ort und Titel des Eintrags, Wert: ids aus requisiten.js.
// Ebenso Szene und Titel eines Fundes, der nicht im Grundriss steht: Dann hängt das Requisit am Fund.
// Die Nummern im Grundriss stehen in grundrisse.js (refs und zeigen).
window.LAHNREIT_VERBINDUNGEN = {
  'S8:Die Brandreste': ['notizbuch'],
  'S8:Der Vorvertrag': ['vorvertrag'],
  'S8:Traudls Gesprächszettel': ['zettel'],
  'S8:Die zwei Atelierbilder': ['atelier'],
  'S8:Die Ansichtskarte': ['ak-kudamm'],
  'S8:Das Revierbuch': ['revierbuch'],
  'S17:Das Hüttenbuch': ['huettenbuch'],
  'S20:Die zwei Atelierbilder': ['atelier'],
  'S20:Der entwickelte Film': ['film'],
  'S22:Traudls Gesprächszettel': ['zettel'],
  'D3:Lindner': ['leichenschau'],
  'D5:Das Fremdenbuch': ['fremdenbuch'],
  'D5:Lindners Zimmer': ['notizbuch', 'gesellschaft', 'briefe'],
  'D5:Die Sterbebilder': ['sterbebild'],
  'D6:Traudls Gesprächszettel': ['zettel'],
  'D6:Die Brandreste im Ofen': ['notizbuch'],
  'D6:Der Vorvertrag': ['vorvertrag'],
  'D6:Das Telefon': ['zettel2'],
  'D7:Ilses Sagenheft': ['sagenheft'],
  'D7:Die Aufsätze zum Thema Georgi': ['aufsatz'],
  'D9:Das Reparaturheft': ['schuster'],
  'D14:Das Revierbuch': ['revierbuch'],
  'B6:Das Hüttenbuch': ['huettenbuch'],
};

// Proben, die genau einen Fund aufdecken: Sie stehen im Fund und nicht noch einmal unter »Proben«.
// Schlüssel: Szene und Titel des Fundes, Wert: die Probe, wie sie in der Szene steht.
window.LAHNREIT_PROBEN_AM_FUND = {
  'S5:Die Larven': 'Verborgenes erkennen bei den Masken',
  'S7:Lenis Flüstern': 'Heimlichkeit, wer Leni in der Kirche anspricht',
  'S7:Der Knopf an der Joppe': 'Verborgenes erkennen mit Halbwert, die Joppe',
  'S11:Der Schatten zwischen den Stämmen (N6 Der Mann mit dem Gewehr)': 'Horchen, nachdem er weg ist',
  'S12:Die zweite Spur (N6)': 'Spurensuche im Wald',
  'S14:Das Haarband (zu H9)': 'Verborgenes erkennen, wer sich umsieht',
  'S14:Korbis Versteck': 'Verborgenes erkennen, wer gründlich sucht',
  'S14:Das Fernglas am Waldrand (N6 Der Mann mit dem Gewehr)': 'Verborgenes erkennen, wer zurückschaut',
  'S15:Die Tritte an der Felsstufe': 'Spurensuche am Fuß der Felsstufe',
  'S15:Die Kriechspur': 'Spurensuche zwischen Felsstufe und Mulde',
  'S15:Der Knopf in der Faust': 'Verborgenes erkennen, wer den Toten durchsucht',
  'S19:Lodenfasern unter den Nägeln (zu Schluss D)': 'Verborgenes erkennen, unter den Nägeln',
  'S20:Die Bergschuhe (zu Schluss D)': 'Verborgenes erkennen, die Schuhe im Flez',
  'S20:Die Kamera': 'Verborgenes erkennen, im Heustock, mit Halbwert',
};
