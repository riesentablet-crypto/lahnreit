# Lahnreit 1956 · Spielleitung

Die App für die Spielleitung des Abenteuers »Lahnreit 1956« (Cthulhu, 7. Edition, drei Ermittler).

**Achtung: Hier steht die Lösung des Falls.** Spieler lesen hier nicht mit.

## Starten

`index.html` im Browser öffnen. Es braucht keinen Server und kein Internet; nur die Schriften kommen aus dem Netz, ohne Netz nimmt der Browser ähnliche.

## So ist die App aufgebaut

Die Spieler gehen zu Orten, nicht zu Personen. Darum sind Szenen und Orte der Einstieg, und alles Tiefere liegt eine Ebene darunter.

- **Oben die Uhr:** Morgen, Nachmittag, Abend, Nacht, Georgi. Danach richtet sich, wer wo ist. Szenen mit fester Zeit stellen die Uhr selbst.
- **Links die Liste:** »Ablauf« zeigt S1 bis S25 nach Teilen, »Orte« zeigt D1 bis D15 und B1 bis B7 mit der Zahl der Leute, die gerade dort sind.
- **Eine Szene** zeigt zuerst Bild (oder Grundriss) und wer da ist, darunter Vorlesen, Ablauf, was man finden kann (abhakbar), Proben und Gespräche. Längeres klappt erst auf, wenn man es braucht.
- **Gespräch:** Eine Person anklicken, oben wählen, wer redet (Brandl, Hagedorn, Hias). Man sieht Haltung, Würfel, wer sie ist und was sie will. Dann ein Thema antippen oder ein Stichwort eingeben: Die App zeigt nur die Antwort, die dieser Ermittler gerade bekommt, oder sagt, dass die Person dazu nichts weiß. Proben und Taten verschieben die Haltung, »Gespräch beenden« rechnet Einschüchtern ab.
- **Grundrisse** für Lahnwirt, Kanzlei, Gschwendtner-Hof und Kirche: Räume öffentlich oder privat, abgesperrt oder offen, nummerierte Fundstellen, und die Leute im Raum, in dem sie gerade sind.
- **Alles über eine Person**, die Teilübersichten und die Suche liegen als Fenster darüber.

## Ordner

- `bilder/szenen/` Szenenbilder, benannt nach dem Code aus dem Reiter Bildprompts, also `S7a.jpg` oder `S23.png`. Fehlt ein Bild, zeigt die App dessen Beschreibung.
- `modelle/` die 3D-Modelle der Figuren.
- `quellen/handbuch/` die Reiter des Spielleiterhandbuchs als Markdown.
- `data/lahnreit-daten.js` die Daten der App. Erzeugt mit `python3 tools/build_data.py` (zusammen mit `tools/ebenen.py`), nicht von Hand ändern.
- `data/grundrisse.js` die Grundrisse, von Hand gezeichnet: Räume, Möbel, Türen, Fundstellen und wer in welchem Raum steht.

Wenn sich das Handbuch ändert: die Reiter neu als Markdown nach `quellen/handbuch/` legen und `python3 tools/build_data.py` laufen lassen.
