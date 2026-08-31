// Kleine acties, afgestemd op wat de ander nodig heeft.
//
// Een kleine actie beschrijft gedrag dat je vandaag nog kunt doen. Geen
// houding ("wees geduldiger"), geen inzicht ("besef dat..."), maar iets wat je
// in het eerstvolgende gesprek daadwerkelijk anders doet.
//
// De sleutel is het kenmerk van de ánder plus de waarde daarvan: dit is wat
// hem of haar helpt. Staat er niets, dan valt de app terug op de actie die bij
// de situatie hoort — die is altijd bruikbaar.

export const ACTIES = {
  tempo: {
    snel: "Kom binnen twee zinnen tot je punt en vertel daarna pas de aanloop.",
    gemiddeld: "Vraag aan het begin hoeveel tijd jullie hiervoor nemen.",
    bedachtzaam: "Stuur je vraag vooruit en vraag pas in het gesprek zelf om een reactie.",
  },
  context: {
    veel: "Begin met waar dit vandaan komt en waar het naartoe moet, voordat je de vraag stelt.",
    kort: "Zeg in één zin wat je nodig hebt; details alleen als erom gevraagd wordt.",
    detail: "Neem één concreet voorbeeld mee waar jullie samen naar kunnen kijken.",
  },
  structuur: {
    structuur: "Zet vooraf op een rij wat jullie gaan bespreken en in welke volgorde.",
    gemengd: "Spreek het doel af en laat de route open.",
    ruimte: "Leg het vraagstuk neer zonder al een aanpak voor te stellen.",
  },
  denken: {
    hardop: "Plan er tijd voor om samen te denken in plaats van een besluit voor te leggen.",
    wisselend: "Vraag of het handiger is om er nu over te praten of er eerst even over na te denken.",
    alleen: "Stuur je vraag vooraf en spreek af dat je later het antwoord hoort.",
  },
  contact: {
    taak: "Sla het bijpraten over en begin bij waar het over gaat.",
    beide: "Begin met één persoonlijke vraag en ga daarna over op de inhoud.",
    relatie: "Vraag eerst hoe het gaat en wacht het antwoord af voordat je verdergaat.",
  },
  feedback: {
    direct: "Zeg het in één zin, zonder inleiding en zonder verzachting.",
    voorbeeld: "Noem één moment: wat er gebeurde, en wat het bij jou deed.",
    rustig: "Zoek een moment onder vier ogen en kondig aan waar je het over wilt hebben.",
  },
  spanning: {
    sneller: "Blijf zelf rustig praten en vat samen wat er gezegd is voordat je reageert.",
    stiller: "Stel een open vraag en laat een stilte vallen zonder hem in te vullen.",
    uitleg: "Zeg dat je het begrijpt zodra je het begrijpt, zodat de uitleg kan stoppen.",
    terugtrekken: "Bied aan om het gesprek te pauzeren en spreek meteen af wanneer je verdergaat.",
  },
  besluitvorming: {
    meepraten: "Vraag om een mening voordat je je eigen voorkeur uitspreekt.",
    waarom: "Leg uit welke afweging je hebt gemaakt, ook als het besluit al vaststaat.",
    knoop: "Kom met een voorstel en vraag of het akkoord is, in plaats van de opties open te leggen.",
  },
  energie: {
    samen: "Pak het eerstvolgende stuk samen op in plaats van het te verdelen.",
    afronden: "Spreek af wat vandaag klaar is en benoem dat ook als het klaar is.",
    nieuw: "Vraag naar een andere manier om het aan te pakken voordat je de jouwe voorstelt.",
    verdieping: "Geef een stuk waar je echt even in kunt duiken, zonder tussentijdse onderbrekingen.",
  },
  energieverlies: {
    onduidelijk: "Sluit af met wie wat doet en wanneer, in één zin.",
    onderbreking: "Spreek een vast moment af in plaats van er tussendoor even iets te vragen.",
    langoverleg: "Zet er een eindtijd op en houd je eraan.",
    conflict: "Benoem wat je merkt zodra je het merkt, in plaats van het te laten liggen.",
  },
  aanspreken: {
    tempo: "Zeg het op het moment zelf als het te snel gaat, niet achteraf.",
    detail: "Vraag halverwege of jullie nog op het goede niveau zitten.",
    stil: "Vraag rechtstreeks wat iemand ervan vindt in plaats van te wachten tot het komt.",
    toezegging: "Herhaal aan het eind wie wat had toegezegd.",
  },
  misverstand: {
    kortaf: "Vraag na wat er bedoeld werd voordat je er iets van vindt.",
    twijfel: "Beantwoord de vraag zonder je verdedigen; het is nieuwsgierigheid, geen kritiek.",
    stilte: "Laat de stilte staan en vraag daarna wat er door iemand heen ging.",
    enthousiasme: "Vraag expliciet of dit een toezegging is of een idee.",
  },
};

/** De actie die bij dit kenmerk en deze waarde hoort, of niets. */
export function actieVoor(kenmerkId, waarde) {
  const perWaarde = ACTIES[kenmerkId];
  if (!perWaarde) return null;
  return perWaarde[waarde] || null;
}
