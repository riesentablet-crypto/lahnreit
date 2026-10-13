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

## Ordner

- `bilder/szenen/` Szenenbilder, benannt nach dem Code aus dem Reiter Bildprompts, also `S7a.jpg` oder `S23.png`. Fehlt ein Bild, zeigt die App dessen Beschreibung.
- `modelle/` die 3D-Figuren: die ZIPs mit dem Original (OBJ), daraus verkleinert je eine `.glb` und eine `.js` mit demselben Inhalt, damit die App sie auch ohne Server laden kann. `data/modelle.js` sagt, welche Figur zu wem gehört. `lib/` enthält three.js (r147) zum Anzeigen.
- `requisiten/karten/`, `requisiten/handouts/` die Bilder für den Bereich Requisiten. Die Handouts sind aus den Druckvorlagen geschnitten, ohne die grauen Hinweise für die Spielleitung.
- `requisiten/ansichtskarten/` hier kommen die fertigen Ansichtskarten hin: `mandlkopf.jpg`, `dorf.jpg`, `lahnwirt.jpg` und `kudamm.jpg` (auch `.png` oder `.webp`). Bis dahin zeigt die App, dass sie fehlen.
- `data/requisiten.js` welche Requisiten es gibt, wann man sie herausgibt und in welchen Szenen und Orten sie vorkommen.
- `quellen/kurz/` die Stichpunkte der obersten Ebene, eine Datei pro Teil. `python3 tools/kurz.py` prüft, ob sie noch zum Handbuch passen, und schreibt `data/kurz.js`.
- `quellen/handbuch/` die Reiter des Spielleiterhandbuchs als Markdown.
- `data/lahnreit-daten.js` die Daten der App. Erzeugt mit `python3 tools/build_data.py` (zusammen mit `tools/ebenen.py`), nicht von Hand ändern.
- `data/grundrisse.js` die Grundrisse, von Hand gezeichnet: Räume, Möbel, Türen, Fundstellen und wer in welchem Raum steht.

Wenn sich das Handbuch ändert: die Reiter neu als Markdown nach `quellen/handbuch/` legen, `python3 tools/build_data.py` laufen lassen und danach `python3 tools/kurz.py`. Meldet das zweite Skript Abweichungen, die betroffenen Stichpunkte in `quellen/kurz/` nachziehen.
