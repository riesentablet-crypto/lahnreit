// Requisiten für die App: Karten, Ansichtskarten und die Handouts aus requisiten/handouts.
// Die Hinweise stammen von den Handout-Seiten (Seite 1 und der graue Text unter jedem Papier).
window.LAHNREIT_REQUISITEN = [
 {
  "titel": "Karten",
  "stuecke": [
   {
    "id": "ortsplan",
    "titel": "Ortsplan Lahnreit",
    "wann": "Liegt für alle offen auf dem Tisch, in der Fassung für die Spieler.",
    "hinweis": "Der Ortsplan der Gemeinde von 1955 mit den Wanderwegen. Die Spielerfassung zeigt keine Schlüsselstellen und keine Namen, die im Dorf keiner kennt. Deine Fassung trägt die Hausnamen. Druck: A3 quer.",
    "bilder": [
     "requisiten/karten/ortsplan.webp"
    ],
    "sl": [
     "requisiten/karten/ortsplan-sl.webp"
    ],
    "slName": "mit Hausnamen",
    "szenen": [
     "S1"
    ],
    "orte": []
   },
   {
    "id": "wanderkarte",
    "titel": "Wanderkarte",
    "wann": "Rückseite des Ortsplans. Liegt für alle offen auf dem Tisch, spätestens am Bergtag.",
    "hinweis": "Die Umgebung von Lahnreit bis zum Mandlkopf, 1:25 000: Bergwald, Lahngraben, Untere Alm, Hochalm mit Kaser, Sattel und Grat. Ohne sie wissen die Spieler am Bergtag nicht, wo sie sind. Deine Fassung trägt die Orte B1 bis B8. Druck: A3 quer.",
    "bilder": [
     "requisiten/karten/wanderkarte.webp"
    ],
    "sl": [
     "requisiten/karten/wanderkarte-sl.webp"
    ],
    "slName": "mit B1 bis B8",
    "szenen": [
     "S10"
    ],
    "orte": []
   }
  ]
 },
 {
  "titel": "Ansichtskarten",
  "stuecke": [
   {
    "id": "ak-mandlkopf",
    "titel": "Lahnreit gegen Mandlkopf",
    "wann": "Liegt beim Kramer im Regal (D8). Gut als Stimmung, schon beim Ankommen auf dem Tisch.",
    "hinweis": "Eine farbige Ansichtskarte von 1955, wie sie der Kramer an die Sommerfrischler verkauft. Der Prompt steht im Dokument »Das Dorf«, Reiter »Bildprompts Dorf«, Abschnitt Ansichtskarten.",
    "bilder": [
     "requisiten/ansichtskarten/mandlkopf.jpg"
    ],
    "szenen": [],
    "orte": [
     "D8"
    ],
    "suche": true
   },
   {
    "id": "ak-dorf",
    "titel": "Sommerfrische Lahnreit",
    "wann": "Liegt beim Kramer im Regal (D8). Gut als Stimmung, schon beim Ankommen auf dem Tisch.",
    "hinweis": "Eine farbige Ansichtskarte von 1955, wie sie der Kramer an die Sommerfrischler verkauft. Der Prompt steht im Dokument »Das Dorf«, Reiter »Bildprompts Dorf«, Abschnitt Ansichtskarten.",
    "bilder": [
     "requisiten/ansichtskarten/dorf.jpg"
    ],
    "szenen": [],
    "orte": [
     "D8"
    ],
    "suche": true
   },
   {
    "id": "ak-lahnwirt",
    "titel": "Gasthof Beim Lahnwirt",
    "wann": "Liegt beim Kramer im Regal (D8). Gut als Stimmung, schon beim Ankommen auf dem Tisch.",
    "hinweis": "Eine farbige Ansichtskarte von 1955, wie sie der Kramer an die Sommerfrischler verkauft. Der Prompt steht im Dokument »Das Dorf«, Reiter »Bildprompts Dorf«, Abschnitt Ansichtskarten.",
    "bilder": [
     "requisiten/ansichtskarten/lahnwirt.jpg"
    ],
    "szenen": [],
    "orte": [
     "D8"
    ],
    "suche": true
   },
   {
    "id": "ak-kudamm",
    "titel": "Kurfürstendamm bei Nacht",
    "codes": [
     "S8"
    ],
    "wann": "In Lenis Kammer unter dem Kopfkissen, Verborgenes erkennen (S8).",
    "hinweis": "Eine Ansichtskarte vom Kurfürstendamm in Berlin, bei Nacht, mit Leuchtreklamen. Auf der Rückseite in Lindners kleiner Schrift: »Für L. Bald. R.« Keine Briefmarke, kein Stempel, er hat sie ihr in die Hand gegeben.",
    "bilder": [
     "requisiten/ansichtskarten/kudamm.jpg"
    ],
    "szenen": [
     "S8",
     "S20"
    ],
    "orte": [
     "D10"
    ],
    "suche": true
   }
  ]
 },
 {
  "titel": "Vor dem Spiel",
  "stuecke": [
   {
    "id": "wiesinger",
    "titel": "Wiesingers Zettel",
    "seite": 2,
    "codes": [
     "Brandl"
    ],
    "wann": "Vor dem Spiel, mit Brandls Charakterbogen.",
    "druck": "normal, weiß",
    "hinweis": "Wiesingers Zettel. Für Brandls Spieler, zusammen mit seinem Charakterbogen, vor dem Spiel. Der Kriminalrat hat am Sonntagmorgen angerufen und den Zettel am Nachmittag mit dem Wagenschlüssel beim Pförtner hinterlegt. Wer den Bergführer empfohlen hat, steht nicht darauf. Das weiß nur Hias. Dieselbe Handschrift steht im Hüttenbuch (H23) beim Gamsbock vom September 1955. Wer beides nebeneinanderlegt, sieht, dass der eigene Chef beim Direktor zur Jagd geht.Papier: normal, weiß. Ausschneiden und einmal quer falten.",
    "bilder": [
     "requisiten/handouts/wiesinger.webp"
    ],
    "szenen": [],
    "orte": []
   },
   {
    "id": "feldpost",
    "titel": "Joachims letzter Brief",
    "seite": 3,
    "codes": [
     "Hagedorn"
    ],
    "wann": "Vor dem Spiel, nur für Hagedorns Spieler.",
    "druck": "dünn, grau",
    "hinweis": "Joachims letzter Brief. Nur für Hagedorns Spieler, zusammen mit seinem Charakterbogen, vor dem Spiel. Vier Tage später begann die sowjetische Sommeroffensive, die die Heeresgruppe Mitte zerschlug. Danach kam kein Brief mehr, und seitdem gilt Joachim als vermisst (Bogen). Hagedorn trägt den Brief seit zwölf Jahren in der Brieftasche. Der Brief schreibt nichts vor, aber er liegt da, wenn nachts der Wimmer vor seinem Häusl steht (N4).Papier: dünn und grau, ruhig auch kariert. Ausschneiden, zweimal falten und die Knicke lange zwischen den Fingern reiben.",
    "bilder": [
     "requisiten/handouts/feldpost.webp"
    ],
    "szenen": [],
    "orte": []
   },
   {
    "id": "hias",
    "titel": "Was Hias in der Joppe hat",
    "seite": 4,
    "codes": [
     "Hias"
    ],
    "wann": "Vor dem Spiel, verdeckt für Hias’ Spieler.",
    "druck": "Karton, braunes Papier",
    "hinweis": "Was Hias in der Joppe hat. Nur für Hias’ Spieler, verdeckt, zusammen mit seinem Charakterbogen, vor dem Spiel. Die anderen sehen es nur, wenn er es zeigt. Alle drei Stücke stehen auf seinem Bogen: das Notizbuch mit den Abschriften von Lindners Trassenskizzen, der Umschlag mit dem Spesengeld der Gesellschaft, von dem keiner weiß, und die Nummer, unter der er jeden Abend den Direktor anruft. Es ist dieselbe Nummer wie bei Lindner und beim Jäger auf Traudls Gesprächszetteln (H24).Papier: die Visitenkarte auf festem Karton, die Lohntüte auf braunem Papier. Die Tüte falten, zukleben und zwei Zehner Spielgeld hineinlegen.",
    "bilder": [
     "requisiten/handouts/hias.webp"
    ],
    "szenen": [],
    "orte": []
   }
  ]
 },
 {
  "titel": "Im Spiel",
  "stuecke": [
   {
    "id": "meldung",
    "titel": "Rauchs Meldung",
    "seite": 5,
    "codes": [
     "S2"
    ],
    "wann": "Rauch legt die Durchschrift bei der Begrüßung auf den Tisch.",
    "druck": "dünn, gelblich",
    "hinweis": "Rauchs Meldung. Rauch hat die Durchschrift in seiner Mappe und legt sie bei der Begrüßung auf den Tisch. Der falsche Name »Lindtner« ist Absicht. Papier: am besten dünnes, gelbliches Durchschlag- oder Luftpostpapier, sonst normales Papier. Ausschneiden, zweimal falten und einen Tag in einer Jackentasche tragen.",
    "bilder": [
     "requisiten/handouts/meldung.webp"
    ],
    "szenen": [
     "S2"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "haeuser",
    "titel": "Rauchs Häuserliste",
    "seite": 6,
    "codes": [
     "S2"
    ],
    "wann": "Rauch legt sie zur Meldung.",
    "druck": "normal",
    "hinweis": "Rauchs Häuserliste. Rauch hat sie am Sonntag auf der Station getippt und legt sie bei der Begrüßung zur Meldung. Sie ist ein Namensregister für die Spieler, mehr nicht: Wer wo wohnt und wie man ihn im Dorf nennt. Die Bleistiftbemerkungen sind Rauchs Meinung, keine Hinweise. Sie lenken eher auf den Wimmer, den Korbi und die Flüchtlinge. Beim Gschwendtner steht absichtlich nichts. Papier: normal, weiß. Ausschneiden, zweimal falten.",
    "bilder": [
     "requisiten/handouts/haeuser.webp"
    ],
    "szenen": [
     "S2"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "georgi",
    "titel": "Das Georgiritt-Plakat",
    "seite": 8,
    "codes": [
     "S2"
    ],
    "wann": "Im Hausgang des Lahnwirts, beim Ankommen.",
    "druck": "hellgelb oder rosa",
    "hinweis": "Das Georgiritt-Plakat hängt im Hausgang des Lahnwirts neben der Stubentür. Die Spieler sehen es beim Ankommen. Es zeigt, wann am Montag das ganze Dorf auf dem Platz steht und die Häuser fast leer sind (Teil 2). Den Zettel hat die Wirtin am Sonntagmittag aufgeklebt, nach der Predigt (G2). Wer fragt, warum, hört am Kartentisch: »Koa Tanz am Georgi. Hat er’s doch durchgsetzt, der Pfarrer.« Papier: hellgelbes oder rosa Papier, sonst normales. Ausschneiden. Wer mag, klebt einen echten Papierstreifen mit »Tanz fällt aus!« darüber.",
    "bilder": [
     "requisiten/handouts/georgi.webp"
    ],
    "szenen": [
     "S2"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "fremdenbuch",
    "titel": "Das Fremdenbuch",
    "seite": 7,
    "codes": [
     "S3"
    ],
    "wann": "An der Theke, aufgeschlagen bei Lindners Eintrag.",
    "druck": "kräftig, gelblich",
    "hinweis": "Das Fremdenbuch liegt an der Theke, aufgeschlagen bei Lindners Eintrag. Jeder Gast schreibt selbst, die Wirtin trägt Nummer, Zimmer und Abreise ein. Bei Lindner fehlt die Abreise. Die Filmleute vom Juli 1955 hatten dasselbe Zimmer 3 (Gerücht G5). In die leeren Zeilen dürfen sich die Ermittler selbst eintragen.",
    "bilder": [
     "requisiten/handouts/fremdenbuch.webp"
    ],
    "szenen": [
     "S3"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "notizbuch",
    "titel": "Lindners Notizbuch",
    "seite": 9,
    "codes": [
     "S3",
     "H10",
     "H20"
    ],
    "wann": "Das Notizbuch liegt im Zimmer. Den Durchdruck erst nach dem Reiben mit Bleistift, den Fetzen erst aus dem Kanzleiofen (D6).",
    "druck": "normal, Fetzen ankokeln",
    "hinweis": "Lindners Notizbuch, die Doppelseite 14 und 17. Dazwischen fehlt ein Blatt, man sieht noch den Rest am Falz. Ausschneiden, in der Mitte falten und in ein kleines schwarzes Heft kleben, wenn du eines hast. Unten auf Seite 17 ist nichts zu sehen, bis jemand mit dem Bleistift darüber reibt. Dann gibst du den Streifen darunter aus.\n\nDer Durchdruck, unten auf Seite 17, nach dem Reiben mit dem Bleistift. Lesbar ist nur »…xer hat unterschr…«. Erst ausgeben, wenn jemand auf die Idee kommt oder die Probe gelingt.\n\nDer Brandfetzen aus dem Kanzleiofen (D6), dasselbe Papier wie das Notizbuch. Entlang der schwarzen Kante ausschneiden. Wer mag, hält die Ränder über der Spüle kurz an eine Kerze.",
    "bilder": [
     "requisiten/handouts/notizbuch-buch.webp",
     "requisiten/handouts/notizbuch-durchdruck.webp",
     "requisiten/handouts/notizbuch-fetzen.webp"
    ],
    "szenen": [
     "S3",
     "S8"
    ],
    "orte": [
     "D5",
     "D6"
    ],
    "unter": [
     "Doppelseite 14 und 17 (H10)",
     "Durchdruck, erst nach dem Reiben mit Bleistift",
     "Brandfetzen aus dem Kanzleiofen (H20)"
    ]
   },
   {
    "id": "gesellschaft",
    "titel": "Der Brief der Gesellschaft",
    "seite": 10,
    "codes": [
     "S3"
    ],
    "wann": "Innentasche im Kofferdeckel.",
    "druck": "dünn, weiß",
    "hinweis": "Der Brief der Gesellschaft steckt in der Innentasche im Deckel von Lindners Koffer, ohne Probe für jeden, der den Koffer öffnet. Er zeigt: Lindner war kein Kurgast, sondern hat für die Bergbahn-Gesellschaft gearbeitet, und er war im März schon einmal hier, in denselben Tagen wie die Skitour im Hüttenbuch (H23). Die Anschrift in Berlin-Steglitz ist die seiner Mutter (S22). Wer bei der Gesellschaft anruft, hört von einem Sekretär nur: »Herr Lindner war in Urlaub.« Papier: dünnes, weißes Schreibmaschinenpapier. Ausschneiden, einmal quer falten.",
    "bilder": [
     "requisiten/handouts/gesellschaft.webp"
    ],
    "szenen": [
     "S3"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "briefe",
    "titel": "Lenis zwei Briefe",
    "seite": 11,
    "codes": [
     "N1"
    ],
    "wann": "Hinter dem losen Futter im Kofferdeckel.",
    "druck": "normal",
    "hinweis": "Lenis erster Brief. Hinter dem losen Futter im Kofferdeckel, zusammen mit dem zweiten. Beide sind nur mit »L.« unterschrieben.\n\nLenis zweiter Brief. Ausschneiden, die obere Kante darf ausgefranst bleiben. Jeden Brief zweimal falten, so dass er in eine Jackentasche passt. Wer die Briefe hat, kann sie Leni zurückgeben, das öffnet sie (N1). Noch echter wirkt es, wenn du sie mit Füller auf eine herausgerissene Heftseite abschreibst.",
    "bilder": [
     "requisiten/handouts/briefe.webp"
    ],
    "szenen": [
     "S3"
    ],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "aufsatz",
    "titel": "Tonis Aufsatz",
    "seite": 12,
    "codes": [
     "H12"
    ],
    "wann": "Im Schulhaus (D7), Ilse zeigt ihn ab kooperativ.",
    "druck": "normal",
    "hinweis": "Tonis Aufsatz über die Föhnnacht, im Schulhaus (D7). Ilse zeigt ihn ab kooperativ, Toni erzählt es selbst, wenn ihm einer zuhört. Ausschneiden und in der Mitte falten. Am echtesten wirkt er, wenn du ihn mit Bleistift in ein liniertes Schulheft abschreibst und die Fehler stehen lässt.",
    "bilder": [
     "requisiten/handouts/aufsatz.webp"
    ],
    "szenen": [],
    "orte": [
     "D7"
    ]
   },
   {
    "id": "sagenheft",
    "titel": "Ilses Sagenheft",
    "seite": 13,
    "codes": [
     "D7"
    ],
    "wann": "Ilse liest daraus vor und gibt es ab kooperativ aus der Hand.",
    "druck": "normal",
    "hinweis": "Ilses Sagenheft, die Seiten über das Kasermandl. Ilse liest daraus vor, wenn jemand nach der Sage fragt (ab neutral), und gibt das Heft aus der Hand, wenn sie kooperativ ist. Die Milchschüssel und das Licht in der Föhnnacht hat das Dorf längst in die Sage eingebaut.",
    "bilder": [
     "requisiten/handouts/sagenheft.webp"
    ],
    "szenen": [],
    "orte": [
     "D7"
    ]
   },
   {
    "id": "schuster",
    "titel": "Das Schusterheft",
    "seite": 14,
    "codes": [
     "H13"
    ],
    "wann": "In der Werkstatt (D9), ohne Probe.",
    "druck": "dick, gelblich",
    "hinweis": "Das Schusterheft liegt in der Werkstatt (D9) auf der Werkbank. Der Xare zeigt es jedem, der fragt, ohne Probe. Der Eintrag vom Freitag um sieben ist der Satz, der den Fall aufmacht. Die Skizze daneben ist die alte Nagelung, dieselbe wie im Schnee an der Felsstufe (H2). Papier: etwas dickeres, gelbliches Papier. Ausschneiden, am Rand mit einem Finger voll Schuhcreme oder Butter anfassen. Echt wird es mit einem violetten Kopierstift.",
    "bilder": [
     "requisiten/handouts/schuster.webp"
    ],
    "szenen": [
     "S9"
    ],
    "orte": [
     "D9"
    ]
   },
   {
    "id": "revierbuch",
    "titel": "Das Revierbuch",
    "seite": 15,
    "codes": [
     "H21"
    ],
    "wann": "Im Jägerhaus (D14), ab kooperativ.",
    "druck": "normal",
    "hinweis": "Das Revierbuch liegt im Jägerhaus auf dem Schreibtisch. Der Jäger zeigt es, wenn man höflich fragt (ab kooperativ). Der Schuss um 16.10 Uhr an der Grubenwand entlastet den Korbi, denn der war um vier drüben auf der anderen Talseite und nicht am Sattel. Wann der Jäger wen angerufen hat, steht hier mit Absicht nicht: Das verrät erst Traudls Zettel (H24). Papier: normales Papier, am besten mit einem echten Kästchenheft daneben. Ausschneiden, die linke Kante leicht wellen.",
    "bilder": [
     "requisiten/handouts/revierbuch.webp"
    ],
    "szenen": [],
    "orte": [
     "D14"
    ]
   },
   {
    "id": "zettel",
    "titel": "Traudls Gesprächszettel",
    "seite": 16,
    "codes": [
     "H24"
    ],
    "wann": "Zigarrenkiste in der Poststelle (D6), über N2.",
    "druck": "dünn, grünlich",
    "hinweis": "Traudls Gesprächszettel liegen in einer Zigarrenkiste unter dem Klappenschrank in der Poststelle (D6). Sie zeigt sie, wenn ihr einer die Fahrt nach München versprochen hat (N2). Entscheidend sind die beiden Zettel vom Samstag: Der Jäger hat um 13.02 Uhr nach München telefoniert und erst um 13.10 Uhr die Landpolizei. München 2 47 31 ist der Privatanschluss von Direktor Seefried, und Lindner hat dieselbe Nummer am Mittwoch angerufen. Die beiden leeren Zettel und die zweite Seite sind für dich: Jedes Ferngespräch, das die Ermittler führen, trägt Traudl ein, mit Bleistift, und wenn einer nach München 2 47 31 telefoniert, steht das genauso da. Papier: dünnes, graugrünliches oder gelbliches Papier. Entlang der Ränder schneiden und als kleinen Stapel mit einer Büroklammer zusammenhalten.",
    "bilder": [
     "requisiten/handouts/zettel.webp"
    ],
    "szenen": [],
    "orte": [
     "D6"
    ]
   },
   {
    "id": "zettel2",
    "titel": "Leere Gesprächszettel",
    "seite": 17,
    "codes": [
     "H24"
    ],
    "wann": "Für die Telefonate am Tisch, mit Bleistift ausfüllen.",
    "druck": "dünn",
    "hinweis": "Leere Gesprächszettel für die Gespräche, die im Spiel geführt werden: zum Beispiel nach München, nach Berlin oder ins Institut. Fülle sie mit Bleistift aus, während am Tisch telefoniert wird, und leg sie zu Traudls Stapel. Wer am Donnerstag die ganze Kiste sieht, sieht dann auch sich selbst darin.",
    "bilder": [
     "requisiten/handouts/zettel2.webp"
    ],
    "szenen": [
     "S22"
    ],
    "orte": [
     "D6"
    ]
   },
   {
    "id": "huettenbuch",
    "titel": "Das Hüttenbuch",
    "seite": 18,
    "codes": [
     "H23"
    ],
    "wann": "Jagdhütte (B6), nur wenn die Gruppe dort übernachtet.",
    "druck": "kräftig, gelblich",
    "hinweis": "Das Hüttenbuch liegt in der Jagdhütte (B6) aufgeschlagen auf dem Tisch, nur wenn die Gruppe dort übernachtet. Zwei einzelne Blätter, denn dazwischen stehen drei Seiten Herbst. Links der Jagdgast vom September 1955, rechts die Skitour vom 15. bis 17. März 1956 mit Seefried, Lindner und Hias. Was Hias dazu sagt, entscheidet sein Spieler. In die leeren Zeilen darf sich die Gruppe selbst eintragen. Papier: kräftiges, gelbliches Papier. Die Blätter einzeln ausschneiden und an der Innenkante etwas abgreifen.",
    "bilder": [
     "requisiten/handouts/huettenbuch.webp"
    ],
    "szenen": [
     "S17"
    ],
    "orte": [
     "B6"
    ]
   },
   {
    "id": "zeitung",
    "titel": "Der Oberländer Heimatbote",
    "seite": 19,
    "codes": [
     "Teil 4"
    ],
    "wann": "Kommt Dienstag mit dem Postbus, dann im Zeitungshalter der Gaststube.",
    "druck": "dünn, grau",
    "hinweis": "Der Oberländer Heimatbote kommt am Dienstag mit dem Postbus um halb zwölf und steckt danach in der Gaststube im Zeitungshalter. Er zeigt, was draußen über den Fall geglaubt wird: ein Bergunfall, und der falsche Name aus Rauchs Meldung steht jetzt gedruckt da. Die Seilbahn-Meldung nennt weder Lahnreit noch die Gesellschaft. Die Suchanzeige ist ein stilles Angebot an Hagedorns Spieler, der Rest ist Zeitkolorit. Papier: dünnes, graues Papier, sonst normales. Ausschneiden, einmal quer falten.",
    "bilder": [
     "requisiten/handouts/zeitung.webp"
    ],
    "szenen": [],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "vorvertrag",
    "titel": "Der Vorvertrag mit Lageplan",
    "seite": "20–22",
    "codes": [
     "H20"
    ],
    "wann": "Abgesperrte Schreibtischlade in der Kanzlei (D6), nur mit Schließtechnik.",
    "druck": "Schreibmaschinenpapier",
    "hinweis": "Zwei Blätter mit der Schreibmaschine, oben links zusammengeheftet, dahinter der Lageplan als Anlage. Mit dem Vertrag in der Hand gibt der Bürgermeister die verbrannten Seiten zu und nennt sein Alibi (P2). Auf dem Lageplan hat Lindner die Talstation rot eingezeichnet, und unten stehen die Kürzel aller drei: Daxenberger, Seefried und Lindner. Ein Tippfehler in § 1 ist mit x überschrieben, wie man es 1956 eben machte.",
    "bilder": [
     "requisiten/handouts/vorvertrag1.webp",
     "requisiten/handouts/vorvertrag2.webp",
     "requisiten/handouts/lageplan.webp"
    ],
    "szenen": [
     "S8"
    ],
    "orte": [
     "D6"
    ],
    "unter": [
     "Blatt 1",
     "Blatt 2",
     "Anlage Lageplan"
    ]
   },
   {
    "id": "sterbebild",
    "titel": "Das Sterbebild des Josef Wimmer",
    "seite": 23,
    "codes": [
     "G11"
    ],
    "wann": "Hinter dem Kreuz beim Lahnwirt und in fast jedem Gebetbuch.",
    "druck": "fest, matt, 160 g",
    "hinweis": "Das Sterbebild. Agnes ließ es 1951 nach der Todeserklärung drucken. Fast jedes Haus hat eines im Gebetbuch, und beim Lahnwirt steckt eines hinter dem Kreuz im Herrgottswinkel, neben dem des gefallenen Wirts. Gib es heraus, sobald einer danach greift oder nach dem Mann fragt, der nachts am Waldrand sitzt. Dann hält die Gruppe den Totenzettel eines Mannes in der Hand, der draußen durchs Dorf geht. Die alte Wimmerin hat nie eines angenommen. Basteln: Den Streifen ausschneiden, an den gestrichelten Marken in der Mitte falten, Bilder nach außen, und innen flächig zusammenkleben. Am besten auf mattem, festem Papier um 160 g. Das Soldatenfoto von 1942 ist schon eingedruckt. Achte auf das Muttermal auf seiner linken Wange: Es ist dasselbe wie beim Mann am Waldrand. Das Andachtsbild ist ebenfalls eingedruckt. Bildprompt Andachtsbild (zum Nachmachen, für ChatGPT, ohne den Grundprompt): Ein katholisches Andachtsbildchen aus den fünfziger Jahren im Hochformat, Seitenverhältnis 2 zu 3, gedruckt im Vierfarb-Raster auf Karton, die Farben etwas verblasst. Es zeigt die Schmerzhafte Muttergottes nach Art eines Barockgemäldes: eine Frau mit blassem Gesicht in dunkelblauem Mantel über rotem Kleid, die Hände vor der Brust gefaltet, den Blick gesenkt, ein Schwert im Herzen, ein schmaler Goldschein um den Kopf, dunkler Hintergrund. Kein Text, keine Schrift, kein Rand. Fromm und ruhig, nicht kitschig.",
    "bilder": [
     "requisiten/handouts/sterbebild.webp"
    ],
    "szenen": [],
    "orte": [
     "D5"
    ]
   },
   {
    "id": "atelier",
    "titel": "Das Atelierbild",
    "seite": 24,
    "codes": [
     "H16"
    ],
    "wann": "In der Stube der Gschwendtners (S20).",
    "druck": "Fotopapier",
    "hinweis": "Das Atelierbild. In der Stube der Gschwendtners hängen über dem Tisch unter dem Herrgottswinkel zwei Atelierbilder: die Hochzeit von 1932 und dieses hier, Vater und Tochter zu Lenis Zwanzigstem im Frühjahr 1955. Gib es dem Spieler, dessen Figur sich die Bilder genauer ansieht. Der Hinweis sind die Knöpfe: Alle fünf sind gleich, flach und dunkel. Wer den Knopf aus der Faust kennt (H3), sieht ihn hier fünfmal, und an der Joppe am Zaunpfosten ist heute einer davon anders (H15). Basteln: Das Bild ist schon eingesetzt. Die Seite auf Fotopapier oder glänzendem Papier ausdrucken und den Abzug mit dem Rand ausschneiden. Wer eine Zackenschere hat, bekommt einen echten Büttenrand. Die Ecken ein wenig abgreifen. Bildprompt (für ChatGPT, ohne den Grundprompt): Eine Atelierfotografie aus dem Frühjahr 1955 in Schwarzweiß, Hochformat, Seitenverhältnis 2 zu 3, ein glänzender Abzug, der ein Jahr gerahmt in einer Bauernstube hing. Ein hagerer, sehniger Mann Anfang fünfzig in einer zugeknöpften dunkelgrünen Lodenjoppe steht steif vor einem gemalten Hintergrund mit Bergsee und Balustrade, die rechte Hand auf der Schulter einer jungen Frau von zwanzig mit dunkelblondem Haar, als Zopfkranz um den Kopf gesteckt, im dunklen Sonntagsdirndl mit Seidentuch, die vor ihm auf einem gedrechselten Stuhl sitzt. Die Joppe hat fünf Hirschhornknöpfe, alle gleich: flach, dunkel, mit rauem Rand und zwei Löchern. Die Knöpfe müssen deutlich und einzeln zu erkennen sein. Beide schauen in die Kamera, beide lächeln nicht. Kein Text, kein Rand.",
    "bilder": [
     "requisiten/handouts/atelier.webp"
    ],
    "szenen": [
     "S20"
    ],
    "orte": [
     "D10"
    ]
   },
   {
    "id": "film",
    "titel": "Der Film aus Lindners Kamera",
    "seite": 25,
    "codes": [
     "H19"
    ],
    "wann": "Erst wenn der Film entwickelt ist.",
    "druck": "Folie und Fotopapier",
    "hinweis": "Der Film aus Lindners Kamera. Erst aushändigen, wenn der Film entwickelt ist. Hagedorns Blatt nennt die Tageslichtdose, und wie das Entwickeln geht, steht in S20. Was die Gruppe dann in der Hand hat, ist der Negativstreifen links. Gegen das Fenster gehalten zeigt er sechs Bilder: Leni an der Milchsammelstelle, zweimal Leni in der Kaser mit offenem Haar, einmal lachend am Tisch, einmal ernst in der Tür, zweimal der Sattel mit dem Steinmann, und zuletzt verwackelt ein Mann in Lodenjoppe, der den Hang heraufkommt. Weil man auf einem Negativ Gesichter schlecht erkennt, gib die sechs Abzüge dazu, sobald einer den Streifen gegen das Licht hält. Sie zeigen, was die Figuren darauf erkennen. Wer den Gschwendtner kennt, erkennt ihn auf Bild 6. Mit diesem Film redet er (S23). Basteln: Die Bilder sind schon eingesetzt, im Streifen als Negativ. Den Streifen am besten auf Overheadfolie drucken, dann sieht man die Bilder wirklich gegen das Licht. Die Abzüge auf glänzendes Papier, gern mit der Zackenschere ausschneiden. Bildprompts (für ChatGPT, ohne den Grundprompt). Vor jeden diesen Satz: Ein Schwarzweißfoto im Querformat, Seitenverhältnis 3 zu 2, im April 1956 von einem Amateur mit einer kleinen Kleinbildkamera aufgenommen, als Abzug von einem körnigen Negativ: weiche Schärfe, sichtbares Korn, etwas flaue Töne, kein Rand, keine Schrift.1 Früher Morgen an der Milchsammelstelle eines Bergdorfs, Dampf über offenen Blechkannen, Schnee an den Rändern. Eine junge Frau von einundzwanzig, schmal, mit Kopftuch und dunkelblondem Zopf, hebt eine Milchkanne von einem Handwagen und schaut halb erschrocken, halb verlegen in die Kamera, fast ein Lächeln. Hinter ihr die Betonrampe eines kleinen Milchhäusls.2 Das Innere einer dunklen Almhütte, Licht nur durch die offene Tür. Dieselbe junge Frau, das dunkelblonde Haar offen über den Schultern, sitzt auf der Bank am groben Holztisch und lacht, eine Hand halb vor dem Gesicht. Vor ihr auf dem Tisch zwei Steingutbecher und ein dunkles Samtband. Unterbelichtet, nur das Gesicht im Türlicht.3 Dieselbe Almhütte und dieselbe junge Frau mit offenem Haar, jetzt in der offenen Tür stehend, und sie schaut ernst und still direkt in die Kamera. Hinter ihr die verschneite Alm im Gegenlicht, überstrahlt. Sie ist am Bildrand etwas angeschnitten, die Kamera hängt leicht schief.4 Ein breites, windgefegtes Joch im Hochgebirge. Im Vordergrund ein mannshoher, sorgfältig geschichteter Steinmann, daneben ein Holzpflock mit einem Band. Dahinter ein Felsgipfel mit Gipfelkreuz. Klarer Himmel, harte Schatten, Schnee in den Felsritzen. Gerade und sachlich aufgenommen, wie eine Vermessungsaufnahme.5 Derselbe Steinmann von der Seite, und dahinter der Blick hinunter: der Rand einer grauen Felsstufe, darunter eine verschneite Alm mit einer winzigen Hütte, Wald, und tief unten ein Dorf mit Kirchturm. Am Himmel lange, glatte, linsenförmige Föhnwolken. Der Horizont leicht schief.6 Ein unscharfer, verwackelter Abzug, zu dunkel, wie eine Aufnahme aus der Bewegung heraus. Zu erkennen ist ein steiler Hang, gut zur Hälfte unter grauem, verharschtem Altschnee, dazwischen apere Stellen mit Gras und Geröll, am Fuß der Felsstufe ein Schneefeld, am oberen Bildrand eine graue Felsstufe, und im unteren Drittel, halb verwischt, die Gestalt eines Mannes in einer dunklen Lodenjoppe, der sich auf den Betrachter zu bewegt. Das Gesicht ist nur halb zu erkennen. Links ein Stück Himmel, überbelichtet.",
    "bilder": [
     "requisiten/handouts/film.webp"
    ],
    "szenen": [
     "S20"
    ],
    "orte": []
   },
   {
    "id": "leichenschau",
    "titel": "Der Leichenschauschein",
    "seite": 26,
    "codes": [
     "S19"
    ],
    "wann": "Rauch bringt ihn ins Leichenhaus.",
    "druck": "normal, einmal falten",
    "hinweis": "Rauch hat oben mit Bleistift eingetragen, was er weiß, und dabei den falschen Namen aus seiner Meldung verbessert. Den ärztlichen Befund ab Nummer 9 trägt Hagedorns Spieler selbst ein, wenn seine Figur die Leichenschau macht. Das Blatt bleibt danach bei der Gruppe.",
    "bilder": [
     "requisiten/handouts/leichenschau.webp"
    ],
    "szenen": [
     "S19"
    ],
    "orte": [
     "D2"
    ]
   }
  ]
 }
];
