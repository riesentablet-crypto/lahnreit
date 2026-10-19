// Hanni statt Hias: die dritte Figur als Frau, wenn eine Spielerin das lieber spielt (Daniel, 19.10.).
// Gleicher Nachname, gleiche Werte, gleiches Geheimnis. Johanna Schwaighofer, die Hanni, 37, aus Krün,
// Skilehrerin, die ohne Patent Touren führt: Ein Bergführerpatent hat in der Bundesrepublik erst 1988 eine Frau bekommen.
// Die Wahl steht unter »Spiel beginnen« und unter »Personen«; die App lädt dann neu und liest jeden Text mit Hanni.
window.LAHNREIT_HANNI = {
  name: 'Hanni',
  voll: 'Johanna Schwaighofer',
  // Zehn Figuren begegnen ihr anders als Hias: fünf eine Stufe wärmer, fünf eine Stufe kälter, in der Summe gleich.
  start: {
    P1: ['kooperativ', 'Eine Frau, die allein mit ihrer Arbeit unterwegs ist wie sie selbst. Das achtet sie.'],
    P8: ['kooperativ', 'Sie führt das Haus allein, seit ihr Mann gefallen ist. Eine Frau, die sich nichts sagen lässt, ist ihr recht.'],
    P9: ['neutral', 'Einer Frau gegenüber ist sie weniger auf der Hut. Ihr Schloss bleibt trotzdem zu.'],
    P16: ['freundlich', 'Eine Frau in Kniebundhosen, die mit Männern auf den Berg geht: So wäre sie gern.'],
    P19: ['neutral', 'Sie will selbst fort und in München arbeiten. Eine, die von daheim weg ist und davon lebt, interessiert sie.'],
    P2: ['feindselig', 'Gemeindesachen bespricht er nicht mit einem Weiberleut, auch nicht mit einer aus Werdenfels.'],
    P7: ['neutral', 'Eine Frau in Hosen gibt im Laden zu reden, und sie redet mit.'],
    P10: ['skeptisch', 'Für die Burschen gehört eine Frau nicht auf den Berg und nicht in Männersachen.'],
    P13: ['feindselig', 'Ein Weiberleut am Berg bringt Unglück. Das war schon so, als er jung war.'],
    P14: ['feindselig', 'In der Fastenzeit hat er über Frauenzimmer in Mannsbildhosen gepredigt. Eine ledige, die mit zwei fremden Männern im Wirtshaus wohnt, ist für ihn die nächste.'],
  },
  // Sätze, die mit Hanni anders lauten. Erst diese, dann die Regeln unten, dann wird aus Hias überall Hanni.
  // Was nur im Handbuch steht (Einführung, Dorf), steht im Abschnitt »Hanni statt Hias« der Anhänge.
  saetze: [
    ['Vor Hias nimmt er den Hut ab und redet wie zu einem Kollegen', 'Vor Hanni nimmt er den Hut ab und redet wie zu einer Kollegin'],
    ['wie mit einem, den er kennt und achtet', 'wie mit einer, die er kennt und achtet'],
    ['Er schaut dabei zu Hias, als wüsste der es.', 'Er schaut dabei zu Hanni, als wüsste die es.'],
    ['mit zwoa Herrn da, zum Skifahrn. Der Lindner und der Hias.', 'mit am Herrn und oaner Frau da, zum Skifahrn. Der Lindner und d\'Hanni.'],
    ['Der Lindner und der Hias.', 'Der Lindner und d\'Hanni.'],
    ['mit zwei Herren zum Skifahren oben war, drei Tage in der Jagdhütte: Lindner und Hias', 'mit einem Herrn und einer Frau zum Skifahren oben war, drei Tage in der Jagdhütte: Lindner und Hanni'],
    ['»Der Hias kennt si aus.«', '»D\'Hanni kennt si aus.«'],
    ['Zu Hias: »Du bist der Bergführer?', 'Zu Hanni: »Du bist d\'Hanni?'],
    ['»A Werdenfelser. Na,', '»A Werdenfelserin. Na,'],
    ['dass er Seefried kennt. Was er damit tut, entscheidet sein Spieler', 'dass sie Seefried kennt. Was sie damit tut, entscheidet ihre Spielerin'],
    ['Hias braucht keine Probe, ihn kennt Maxi vom Vater.', 'Hanni braucht keine Probe, sie kennt Maxi vom Vater.'],
    ['**Hias.** Er kennt den Jäger, und Maxi kennt ihn. In der Jagdhütte steht sein Name im Hüttenbuch. Wie er damit umgeht, entscheidet sein Spieler.', '**Hanni.** Sie kennt den Jäger, und Maxi kennt sie. In der Jagdhütte steht ihr Name im Hüttenbuch. Wie sie damit umgeht, entscheidet ihre Spielerin.'],
    ['Hias war laut seinem Blatt', 'Hanni war laut ihrem Blatt'],
    ['Blatt legt ihm nahe, jeden Abend den Direktor in München anzurufen. Ob er es tut, entscheidet sein Spieler. Tut er es, steht unten, was Seefried sagt. Tut er es vor den anderen, hören die mit, was er sagt,', 'Blatt legt ihr nahe, jeden Abend den Direktor in München anzurufen. Ob sie es tut, entscheidet ihre Spielerin. Tut sie es, steht unten, was Seefried sagt. Tut sie es vor den anderen, hören die mit, was sie sagt,'],
    ['steht auf Hias\' Blatt. Ob er ihn holt, entscheidet sein Spieler.', 'steht auf Hannis Blatt. Ob sie ihn holt, entscheidet ihre Spielerin.'],
    ['wer im Dorf weiß, mit wem er telefoniert', 'wer im Dorf weiß, mit wem sie telefoniert'],
    ['Telefoniert Hias jeden Abend nach München, steht auch sein Gespräch', 'Telefoniert Hanni jeden Abend nach München, steht auch ihr Gespräch'],
    ['zusammen mit seinem Charakterbogen, vor dem Spiel. Die anderen sehen es nur, wenn er es zeigt. Alle drei Stücke stehen auf seinem Bogen', 'zusammen mit ihrem Charakterbogen, vor dem Spiel. Die anderen sehen es nur, wenn sie es zeigt. Alle drei Stücke stehen auf ihrem Bogen'],
    ['die Nummer, unter der er jeden Abend den Direktor anruft', 'die Nummer, unter der sie jeden Abend den Direktor anruft'],
    ['Wer den Bergführer empfohlen hat', 'Wer die Skilehrerin empfohlen hat'],
    ['»Schwaighofer. Gut, dass Sie anrufen. Und?«', '»Fräulein Schwaighofer. Gut, dass Sie anrufen. Und?«'],
    ['Die Stelle als Betriebsleiter nennt er nicht.', 'Die Stelle als Betriebsleiterin nennt er nicht.'],
    ['Seefried ruft im Mai bei ihm an und hat keinen Auftrag mehr für ihn. Die Stelle als Betriebsleiter bekommt ein anderer.', 'Seefried ruft im Mai bei ihr an und hat keinen Auftrag mehr für sie. Betriebsleiter wird ein Mann.'],
    ['Ein Bergführer weiß ohne Probe', 'Eine Bergführerin weiß ohne Probe'],
    // Mit einer Frau in der Gruppe sagt man nicht mehr »die Herren«. Der Bürgermeister grüßt nur die Männer.
    ['»Grüß Gott, die Herren. Rauch,', '»Grüß Gott, die Dame, die Herren. Rauch,'],
    ['Und, meine Herren: Die Leute reden', 'Und, meine Herrschaften: Die Leute reden'],
    ['A Unglück is a Unglück.« Er setzt sich,', 'A Unglück is a Unglück.« Hanni schaut er dabei nicht an. Er setzt sich,'],
    ['»Rosl. Wenn die Herren fragen', '»Rosl. Wenn d\'Herrschaften fragen'],
    ['»Gehen die Herren heut auf den Berg?', '»Gehen die Herrschaften heut auf den Berg?'],
    ['denn sie glaubt, die Herren suchen', 'denn sie glaubt, die Herrschaften suchen'],
    ['wenn die Herren droben fertig san', 'wenn d\'Herrschaften droben fertig san'],
    ['heimlich hinter den Herren her sein', 'heimlich hinter den Herrschaften her sein'],
    ['was die Herren machen', 'was die Herrschaften machen'],
    ['Angst vor den Herren aus München', 'Angst vor den Herrschaften aus München'],
    ['hinter drei fremden Herren herschickt', 'hinter drei Fremden herschickt'],
    ['er hat den Herren die Ski getragen', 'er hat den Herrschaften die Ski getragen'],
  ],
  // Was Hias tut oder sagt, entscheidet jetzt ihre Spielerin
  regeln: [
    ['(Hias[^.!?»]*?)entscheidet sein Spieler', '$1entscheidet ihre Spielerin'],
    ['Hias[’\']s? Spieler\\b', 'Hannis Spielerin'],
    ['Hias[’\']', 'Hannis'],
    ['\\bHias\\b', 'Hanni'],
  ],
  // Handouts, auf denen ihr Name steht: Wiesingers Zettel und das Hüttenbuch
  bilder: {
    'requisiten/handouts/wiesinger.webp': 'requisiten/handouts/wiesinger-hanni.webp',
    'requisiten/handouts/huettenbuch.webp': 'requisiten/handouts/huettenbuch-hanni.webp',
  },
};
