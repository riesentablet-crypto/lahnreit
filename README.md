# Lahnreit 1956 · Spielleitung

Die App für die Spielleitung des Abenteuers »Lahnreit 1956« (Cthulhu, 7. Edition, drei Ermittler).

**Achtung: Hier steht die Lösung des Falls.** Spieler lesen hier nicht mit.

## Starten

`index.html` im Browser öffnen. Es braucht keinen Server und kein Internet; nur die Schriften kommen aus dem Netz, ohne Netz nimmt der Browser ähnliche.

## So ist die App aufgebaut

Die Spieler gehen zu Orten, nicht zu Personen. Darum sind Szenen und Orte der Einstieg, und alles Tiefere liegt eine Ebene darunter.

Oben stehen nur Stichpunkte. Wer den ganzen Text braucht, tippt den Stichpunkt an: Dann geht ein kleines Fenster mit dem Wortlaut aus dem Handbuch auf.

- **Oben die Uhr:** Morgen, Nachmittag, Abend, Nacht, Georgi. Danach richtet sich, wer wo ist. Szenen mit fester Zeit stellen die Uhr selbst.
- **Links die Liste:** »Ablauf« zeigt S1 bis S25 nach Teilen, »Orte« zeigt D1 bis D15 und B1 bis B7 mit der Zahl der Leute, die gerade dort sind, »Requisiten« zeigt Karten, Ansichtskarten und Handouts.
- **Eine Szene** zeigt zuerst Bild (oder Grundriss) und wer da ist, darunter Vorlesen, Ablauf, was man finden kann (abhakbar), Proben und Gespräche. Längeres klappt erst auf, wenn man es braucht.
- **Gespräch:** Eine Person anklicken, oben wählen, wer redet (Brandl, Hagedorn, Hias). Man sieht Haltung, Würfel, wer sie ist und was sie will. Dann ein Thema antippen oder ein Stichwort eingeben: Die App zeigt nur die Antwort, die dieser Ermittler gerade bekommt, oder sagt, dass die Person dazu nichts weiß. Proben und Taten verschieben die Haltung, »Gespräch beenden« rechnet Einschüchtern ab.
- **Grundrisse** für Lahnwirt, Kanzlei, Gschwendtner-Hof und Kirche: Räume öffentlich oder privat, abgesperrt oder offen, nummerierte Fundstellen, und die Leute im Raum, in dem sie gerade sind.
- **Alles über eine Person**, die Teilübersichten und die Suche liegen als Fenster darüber.
- **Requisiten:** Ortsplan und Wanderkarte (je für die Spieler und für dich), die Ansichtskarten und alle Handouts, jeweils mit »Wann« und »Den Spielern zeigen« im Vollbild. Antippen vergrößert. Szenen und Orte zeigen unter »Zum Zeigen«, welche Papiere dort auftauchen.
- **3D-Figuren:** Wo es ein Modell gibt, steht neben dem Namen »3D«. Die Figur lässt sich drehen, umdrehen und im Vollbild zeigen.
- **Klang:** Oben auf jeder Szene und jedem Ort steht eine Klangleiste. ▶ startet, was leise darunter läuft (zum Beispiel »Die volle Stube«); hat ein Ort mehrere Lagen, ist die zur Tageszeit passende umrandet. Ein zweiter Druck blendet aus, eine andere Lage blendet über. Die Knöpfe darunter spielen einzelne Klänge, so wie sie im Buch vorkommen (»Gegen elf: Glocken draußen«, »20 Uhr: Schritte, Klopfen«). Der Klang läuft weiter, wenn man in der App blättert. Das ♪ oben öffnet Lautstärke, »Alles ausblenden«, die Klänge für die Dorfgeschichten G7 und G10 und alle Einzelklänge.

## Ordner

- `bilder/` die Porträts der Figuren, benannt nach ihrem Namen. Für die App liegen verkleinerte Fassungen in `bilder/app/` (ganze Figur und Kopf, nach Personennummer); welche es gibt, steht in `data/modelle.js`. Das Porträt erscheint im Gespräch, in »Wer ist da«, in der Personenliste und in »Alles über«; antippen zeigt es groß.
- `bilder/ortsvorlagen/` Ortsvorlagen für die Szenenprompts: die drei Dorfansichtskarten ohne Rand und Schrift, fünf Bilder aus Lindners Film und das Atelierbild. Welcher Prompt welche Vorlage nimmt, steht im Reiter Bildprompts.
- `bilder/szenen/` die 39 Szenenbilder als WebP (1536 × 1024), benannt nach dem Code aus dem Reiter Bildprompts, also `S7a.webp`. Die Originale liegen als PNG in `Szenen.7z` im Projektordner. Ein Ort zeigt alle Bilder, die das Handbuch bei ihm nennt. Fehlt ein Bild, zeigt die App dessen Beschreibung; `.png` und `.jpg` gehen auch.
- `modelle/` die 3D-Figuren: die ZIPs mit dem Original (OBJ), daraus verkleinert je eine `.glb` und eine `.js` mit demselben Inhalt, damit die App sie auch ohne Server laden kann. `data/modelle.js` sagt, welche Figur und welches Porträt zu wem gehört. `lib/` enthält three.js (r147) zum Anzeigen.
- `requisiten/karten/`, `requisiten/handouts/` die Bilder für den Bereich Requisiten. Die Handouts sind aus den Druckvorlagen geschnitten, ohne die grauen Hinweise für die Spielleitung.
- `requisiten/ansichtskarten/` die vier Ansichtskarten als `.webp`: `mandlkopf`, `dorf`, `lahnwirt`, `kudamm`, jede mit ihrer Rückseite (`…-rueckseite`). Die Rückseiten tragen den gespiegelten Umriss ihrer Vorderseite. Auf der Kurfürstendamm-Karte steht Lindners »Für L. Bald. R.«.
- `data/requisiten.js` welche Requisiten es gibt, wann man sie herausgibt und in welchen Szenen und Orten sie vorkommen.
- `quellen/kurz/` die Stichpunkte der obersten Ebene, eine Datei pro Teil. `python3 tools/kurz.py` prüft, ob sie noch zum Handbuch passen, und schreibt `data/kurz.js`.
- `quellen/handbuch/` die Reiter des Spielleiterhandbuchs als Markdown.
- `data/lahnreit-daten.js` die Daten der App. Erzeugt mit `python3 tools/build_data.py` (zusammen mit `tools/ebenen.py`), nicht von Hand ändern.
- `data/grundrisse.js` die Grundrisse, von Hand gezeichnet: Räume, Möbel, Türen, Fundstellen und wer in welchem Raum steht.
- `klang/` die Klänge als MP3, jede in einer `.js`-Datei (base64), damit sie auch ohne Server laden. `L-…` sind Schleifen, `C-…` Einzelklänge. Gemischt aus Daniels ElevenLabs-Aufnahmen K01 bis K114 (Klangliste im Projekt; K86 und K87 sind gegenüber der ersten Liste getauscht). `klang.js` spielt sie ab.
- `data/klang.js` welche Schleifen auf welcher Seite laufen, wie laut, welche Klänge von selbst kommen und welche Knöpfe es gibt. Hier ändert man die Mischung.
- `data/klang-dateien.js` Liste der Klangdateien mit Schleifenpunkten. Erzeugt mit `tools/klang/bau_klang.py`, nicht von Hand ändern.

Wenn sich das Handbuch ändert: die Reiter neu als Markdown nach `quellen/handbuch/` legen, `python3 tools/build_data.py` laufen lassen und danach `python3 tools/kurz.py`. Meldet das zweite Skript Abweichungen, die betroffenen Stichpunkte in `quellen/kurz/` nachziehen.
