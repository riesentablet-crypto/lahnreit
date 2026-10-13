# Lahnreit 1956 · Spielleitung

Die App für die Spielleitung des Abenteuers »Lahnreit 1956« (Cthulhu, 7. Edition, drei Ermittler).

**Achtung: Hier steht die Lösung des Falls.** Spieler lesen hier nicht mit.

## Starten

`index.html` im Browser öffnen. Es braucht keinen Server und kein Internet; nur die Schriften kommen aus dem Netz, ohne Netz nimmt der Browser ähnliche.

## Was drin ist

- **Personen:** alle 22 Figuren aus dem Handbuch. Oben wählst du, wer fragt (Brandl, Hagedorn, Hias). Der Fragenkatalog zeigt fett, was die Figur diesem Ermittler gerade sagt.
- **Haltung:** fünf Stufen von feindselig bis freundlich. Eine Tat verschiebt die Haltung dauerhaft für alle drei, höchstens eine Stufe vom Start. Eine gelungene Probe gilt nur für das laufende Gespräch. Gespeichert wird im Browser.
- **Suche:** ein Stichwort, etwa »Föhn« oder »Knopf«, findet alle Antworten im Fragenkatalog und alle Szenen, in denen es vorkommt.
- **Szenen:** S1 bis S25 mit Vorlesetext, Proben und den Leuten vor Ort, deren Haltung live angezeigt wird.

## Ordner

- `bilder/szenen/` Szenenbilder, benannt nach dem Code aus dem Reiter Bildprompts, also `S7a.jpg` oder `S23.png`. Fehlt ein Bild, zeigt die App dessen Beschreibung.
- `modelle/` die 3D-Modelle der Figuren.
- `quellen/handbuch/` die Reiter des Spielleiterhandbuchs als Markdown.
- `data/lahnreit-daten.js` die Daten der App. Erzeugt mit `python3 tools/build_data.py`, nicht von Hand ändern.

Wenn sich das Handbuch ändert: die Reiter neu als Markdown nach `quellen/handbuch/` legen und `python3 tools/build_data.py` laufen lassen.
