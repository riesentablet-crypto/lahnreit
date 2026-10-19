// Spieluhr: der Abend in Tageszeiten, jede mit einer Richtzeit am Tisch.
// Die Minuten sind die »Wie lange« der Szenen im Handbuch (Kopfzeilen S1 bis S25, Einführung »Der Ablauf des Abends«).
// Wie sich S9 auf Nachmittag und Abend verteilt, nimmt die App an; in der Spieluhr lässt sich jede Zeit ändern.
// weg: 'georgi' gilt nur, wenn die Gruppe in S6 erst Georgi wählt; 'berg' nur, wenn sie am Montag gleich hinaufgeht.
//   Dann kommt nach dem Berg der Mittwoch als zweiter Tag im Dorf dazu (Teil 4, »Zwei Tage oder einer«),
//   mit den 45 Minuten, die Georgi gebraucht hätte.
// schlaf: eine Nacht, die man überspringen kann, wenn alle schlafen.
// szenen: die Szenen, die in diese Tageszeit gehören. Ruft man eine Szene aus einer späteren auf, bietet die App an, die Uhr vorzustellen.
window.LAHNREIT_SPIELUHR = {
  // Tag des Bergs und Tag danach hängen an der Entscheidung in S6: [erst Georgi, gleich auf den Berg]
  tage: { so: 'Sonntag', mo: 'Montag', berg: ['Dienstag', 'Montag'], nach: ['Mittwoch', 'Dienstag'], mi: 'Mittwoch', do: 'Donnerstag' },
  zusatz: { mo: 'Georgi', berg: 'Bergtag', nach: 'Tag nach dem Berg', mi: 'zweiter Tag im Dorf' },
  phasen: [
    // Teil 1 · 55 Minuten
    { id: 'so-abend', tag: 'so', uhr: 'abends', min: 50, szenen: ['S1', 'S2', 'S3', 'S4'] }, // 5 + 10 + 10 + 25
    { id: 'so-nacht', tag: 'so', uhr: 'nachts', min: 5, szenen: ['S5'], schlaf: true }, // gegen 23 Uhr
    // Teil 2 · 45 Minuten
    { id: 'mo-georgi', tag: 'mo', uhr: 'georgi', min: 32, szenen: ['S6', 'S7', 'S8'] }, // 2 + 20 + 10
    { id: 'mo-nachmittag', tag: 'mo', uhr: 'nachmittags', min: 10, szenen: ['S9'], weg: 'georgi' }, // S9 am Georgi: 15 Minuten
    { id: 'mo-abend', tag: 'mo', uhr: 'abends', min: 5, szenen: ['S9'], weg: 'georgi' },
    { id: 'mo-nacht', tag: 'mo', uhr: 'nachts', min: 5, schlaf: true, weg: 'georgi' },
    // Teil 3 · 80 Minuten
    { id: 'berg-morgen', tag: 'berg', uhr: 'morgens', min: 48, szenen: ['S10', 'S11', 'S12', 'S13', 'S14', 'S15'] }, // 3 + 7 + 3 + 5 + 5 + 25
    { id: 'berg-sturm', tag: 'berg', uhr: 'nachmittags', min: 5, szenen: ['S16'] }, // 12 bis 13.30 Uhr
    { id: 'berg-nacht', tag: 'berg', uhr: 'nachts', min: 25, szenen: ['S17'], titel: 'Nacht im Sturm' }, // 15 Uhr bis 6 Uhr früh
    // Teil 4 · 65 Minuten, dazu S23 aus Teil 5
    { id: 'nach-morgen', tag: 'nach', uhr: 'morgens', min: 5, szenen: ['S18'] }, // 6 bis 11 Uhr
    { id: 'nach-nachmittag', tag: 'nach', uhr: 'nachmittags', min: 45, szenen: ['S19', 'S9', 'S20', 'S21', 'S22', 'S23', 'S24'] }, // S19 10, S20 10, S21 5, S9 20 von 35
    { id: 'nach-abend', tag: 'nach', uhr: 'abends', min: 35, szenen: ['S9', 'S20', 'S22', 'S23', 'S24'] }, // S22 5, S9 15, S23 15
    { id: 'nach-nacht', tag: 'nach', uhr: 'nachts', min: 5, schlaf: true, szenen: ['S20'] }, // S20 nachts nur heimlich
    // Nur auf dem Weg »gleich auf den Berg«: S9 läuft am Mittwoch weiter
    { id: 'mi-morgen', tag: 'mi', uhr: 'morgens', min: 5, szenen: ['S9', 'S21'], weg: 'berg' }, // Milch und Postbus um sieben
    { id: 'mi-nachmittag', tag: 'mi', uhr: 'nachmittags', min: 20, szenen: ['S9', 'S20', 'S21', 'S22', 'S23', 'S24'], weg: 'berg' },
    { id: 'mi-abend', tag: 'mi', uhr: 'abends', min: 20, szenen: ['S9', 'S20', 'S22', 'S23', 'S24'], weg: 'berg' },
    { id: 'mi-nacht', tag: 'mi', uhr: 'nachts', min: 5, schlaf: true, szenen: ['S20'], weg: 'berg' },
    // Teil 5 · Donnerstag, 7 Uhr
    { id: 'do-morgen', tag: 'do', uhr: 'morgens', min: 5, szenen: ['S25'] },
  ],
};
