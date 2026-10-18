// Brandls geheimes Ziel: die drei Frauen. Nur Text aus dem Handbuch, gekürzt.
// Quellen: Einführung (Wer sie sind, Wo ihre Ziele aneinanderstoßen, Wie du die geheimen Ziele bedienst, Der Lohn),
// Personenkarten P9, P19, P4, Anhänge N2, S25 (Die geheimen Ziele, Wer noch kommt).
window.LAHNREIT_FRAUEN = {
  ziel: 'das Herz einer jungen Frau aus dem Dorf gewinnen, bevor er abfährt',
  lohn: 'Wer sein geheimes Ziel erreicht, bekommt am Ende des Abends 1W6 Stabilität zurück. Ob er es erreicht hat, entscheidest du in der letzten Szene (S25), und zwar großzügig.',
  mehrere: 'Wirbt er um mehrere und fliegt es auf, reagiert jede anders.',
  keine: 'Keine kommt. Ist aufgeflogen, dass er um mehrere geworben hat, winkt nicht einmal Rosl (S25).',
  frauen: [
    {
      pid: 'P9',
      name: 'Leni',
      preis: 'Mitten im Fall und hat Angst. Wählt Brandl Leni, ist er befangen. Gerät sie unter Verdacht oder muss sie gegen ihren Vater aussagen, zieht sein Ziel gegen seinen Auftrag.',
      auf: 'Sie verschließt sich.',
      donnerstag: 'Ist sie im Dorf, kommt sie von der Milch herüber und gibt ihm die Hand. Nur das.',
    },
    {
      pid: 'P19',
      name: 'Traudl',
      preis: 'Will nach München und hört jedes Telefongespräch mit.',
      auf: 'Sie fällt sofort und erzählt es dem Dorf. Beim nächsten Anruf des Kriminalrats hört sie besonders genau hin, und was sie hört, landet auch im Dorf (N2).',
      donnerstag: 'Hat er ihr die Fahrt versprochen (N2), steht sie mit einem Pappkoffer am Wagen und fragt, ob vorn noch Platz ist. Ihr Vater schaut vom Kanzleifenster aus zu.',
    },
    {
      pid: 'P4',
      name: 'Ilse',
      preis: 'Will ernst genommen werden und verliert ihre Stelle, wenn man sie mit ihm sieht.',
      auf: 'Sie wird höflich und kühl.',
      donnerstag: 'Sie kommt nicht an den Wagen, denn das Dorf schaut zu. Toni bringt einen Brief in ihrer genauen Schrift: Er darf ihr schreiben, postlagernd Miesbach.',
    },
  ],
};
