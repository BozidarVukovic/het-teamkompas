// Wat het betekent als de voorkeuren in een groep uiteenlopen.
//
// Bij twee mensen kijk je naar contrast: jij wilt dit, de ander dat. Bij vier
// mensen bestaat dat niet meer. Dan is de vraag niet wie er anders is, maar wat
// er gebeurt als de groep het niet expliciet maakt — en dat is bijna altijd
// hetzelfde: de sterkste voorkeur wordt vanzelf de norm, en wie iets anders
// nodig heeft, past zich stil aan.
//
// Daarom staat er per kenmerk één duiding en één ding dat helpt. Ze beschrijven
// wat er met de groep gebeurt, nooit wie de afwijkende is. Er staat geen naam
// in en er staat geen oordeel in: een voorkeur is geen tekortkoming, en een
// meerderheid heeft niet meer gelijk dan een enkeling.
//
// Onder `vraagt` staat per voorkeur wat die van de groep vraagt. Zo gaat het
// advies over wat er in dít gezelschap zit en niet over wat er in het algemeen
// weleens verschilt. Het staat er zonder aantallen en zonder volgorde van
// belangrijkheid: welke voorkeuren aanwezig zijn, niet hoeveel mensen ze
// hebben. Zodra je dat gaat tellen, ontstaat er een meerderheid en dus een
// afwijkende.

export const SPREIDING = {
  tempo: {
    vraagt: {
      snel: "Zeg wanneer het besluit valt, dan hoeft er niet geduwd te worden.",
      gemiddeld: "Maak per onderwerp duidelijk of het haast heeft of niet.",
      bedachtzaam: "Stuur de vraag vooruit, zodat nadenken niet hoeft te wachten op het overleg.",
    },
    duiding:
      "Jullie werken niet allemaal in hetzelfde tempo naar een besluit toe. Zonder afspraak wordt het tempo van de snelste vanzelf het tempo van de groep, en haakt de rest stil af.",
    suggestie:
      "Zeg aan het begin wanneer het besluit valt. Dan weet wie tijd nodig heeft hoeveel er is, en hoeft wie snel wil niet te duwen.",
  },
  context: {
    vraagt: {
      veel: "Vertel waar dit vandaan komt en waar het naartoe moet, voordat de vraag valt.",
      kort: "Begin bij de vraag; de achtergrond mag erachteraan of eronder.",
      detail: "Neem één concreet voorbeeld mee om samen naar te kijken.",
    },
    duiding:
      "De een wil eerst het hele plaatje, de ander heeft aan een paar zinnen genoeg. Wat voor de een een noodzakelijke inleiding is, is voor de ander uitstel.",
    suggestie:
      "Stuur de achtergrond vooraf en begin het gesprek bij de vraag. Dan kan wie context wil die lezen, zonder dat de rest erop zit te wachten.",
  },
  structuur: {
    vraagt: {
      structuur: "Zet op een rij wat jullie bespreken en in welke volgorde.",
      gemengd: "Spreek het doel af en laat de route open.",
      ruimte: "Leg het vraagstuk neer zonder er meteen een aanpak bij te leveren.",
    },
    duiding:
      "Over hoeveel er vastgelegd moet worden verschillen jullie. Wordt dat niet besproken, dan voelt het voor de een rommelig en voor de ander benauwd.",
    suggestie:
      "Spreek af wat vast ligt en waar de ruimte zit. Eén zin over allebei voorkomt het meeste gedoe achteraf.",
  },
  denken: {
    vraagt: {
      hardop: "Plan tijd om samen te denken, niet alleen om te besluiten.",
      wisselend: "Vraag of dit een onderwerp is om nu te bespreken of om over na te denken.",
      alleen: "Deel de vraag vooraf en spreek af wanneer je het antwoord hoort.",
    },
    duiding:
      "Een deel van jullie denkt hardop en komt al pratend tot iets; een ander deel wil er eerst alleen over nadenken. In hetzelfde gesprek hoor je van de eersten het meest.",
    suggestie:
      "Leg de vraag neer voordat je hem bespreekt, en laat een stilte vallen voordat je hem invult. Wie eerst wil nadenken, heeft dan ook iets gezegd.",
  },
  contact: {
    vraagt: {
      taak: "Houd het bijpraten kort en begin daarna bij waar het over gaat.",
      beide: "Eén persoonlijke vraag aan het begin, dan de inhoud.",
      relatie: "Vraag hoe het gaat en wacht het antwoord af voordat je verdergaat.",
    },
    duiding:
      "Niet iedereen begint even makkelijk bij de inhoud. Voor de een is bijpraten opwarmen, voor de ander is het tijd die van het onderwerp afgaat.",
    suggestie:
      "Houd het persoonlijke deel kort en expliciet, aan het begin. Dan weet iedereen dat het erbij hoort en wanneer het klaar is.",
  },
  feedback: {
    vraagt: {
      direct: "Zeg het in één zin, zonder inleiding en zonder verzachting.",
      voorbeeld: "Noem één moment: wat er gebeurde en wat het deed.",
      rustig: "Bewaar het voor onder vier ogen en kondig het onderwerp aan.",
    },
    duiding:
      "Wat jullie prettig vinden bij het ontvangen van feedback loopt uiteen. Dezelfde opmerking komt bij de een aan als duidelijkheid en bij de ander als een aanval.",
    suggestie:
      "Geef feedback één op één in plaats van in de groep, tenzij het over de groep zelf gaat. Vraag vooraf hoe iemand het het liefst hoort.",
  },
  spanning: {
    vraagt: {
      sneller: "Vat samen wat er gezegd is voordat er gereageerd wordt; dan hoeft tempo geen druk te zijn.",
      stiller: "Stel een open vraag en laat de stilte staan zonder hem in te vullen.",
      uitleg: "Zeg dat je het begrijpt zodra je het begrijpt, zodat de uitleg kan stoppen.",
      terugtrekken: "Bied een pauze aan met meteen een moment erbij om verder te gaan.",
    },
    duiding:
      "Als het spannend wordt, reageren jullie verschillend: de een gaat sneller praten, de ander valt stil of trekt zich even terug. Dat wordt makkelijk gelezen als onwil of als drammen, terwijl het geen van beide is.",
    suggestie:
      "Benoem het als je merkt dat het spanning wordt, en bied een pauze aan met een moment erbij om verder te gaan. Stilte is dan geen instemming en tempo geen druk.",
  },
  besluitvorming: {
    vraagt: {
      meepraten: "Vraag om een mening voordat er een voorkeur op tafel ligt.",
      waarom: "Leg de afweging uit, ook als het besluit al vaststaat.",
      knoop: "Kom met een voorstel en vraag of het akkoord is, in plaats van alle opties open te leggen.",
    },
    duiding:
      "Jullie hebben niet allemaal hetzelfde nodig om achter een besluit te staan: meegepraat hebben, de afweging begrijpen, of gewoon een knoop.",
    suggestie:
      "Maak vooraf duidelijk of dit een gesprek is of een mededeling, en wie beslist. Het meeste ongenoegen ontstaat doordat dat achteraf pas blijkt.",
  },
  energie: {
    vraagt: {
      samen: "Pak het eerstvolgende stuk samen op in plaats van het te verdelen.",
      afronden: "Spreek af wat vandaag klaar is, en benoem het ook als het klaar is.",
      nieuw: "Vraag naar een andere aanpak voordat de bekende wordt voorgesteld.",
      verdieping: "Geef een stuk om echt in te duiken, zonder tussentijdse onderbrekingen.",
    },
    duiding:
      "Jullie krijgen energie van verschillende dingen — afmaken, samen oppakken, iets nieuws bedenken, ergens in duiken. Dat is bruikbaar, zolang het werk niet vanzelf bij dezelfde persoon terechtkomt.",
    suggestie:
      "Verdeel het werk op basis van waar iemand energie van krijgt in plaats van op beschikbaarheid. Vraag het één keer expliciet.",
  },
  energieverlies: {
    vraagt: {
      onduidelijk: "Sluit af met wie wat doet en wanneer, in één zin.",
      onderbreking: "Spreek een vast moment af in plaats van er tussendoor iets te vragen.",
      langoverleg: "Zet een eindtijd op het overleg en houd je eraan.",
      conflict: "Benoem wat je merkt zodra je het merkt, in plaats van het te laten liggen.",
    },
    duiding:
      "Wat jullie energie kost verschilt. Een lang overleg dat voor de een grondig voelt, is voor de ander de reden dat er niets meer uit komt.",
    suggestie:
      "Zet een eindtijd op het overleg en sluit af met wie wat doet en wanneer. Dat helpt bij alle vier de vormen tegelijk.",
  },
  aanspreken: {
    vraagt: {
      tempo: "Zeg het op het moment zelf als het te snel gaat, niet achteraf.",
      detail: "Vraag halverwege of jullie nog op het goede niveau zitten.",
      stil: "Vraag rechtstreeks wat iemand ervan vindt in plaats van te wachten.",
      toezegging: "Herhaal aan het eind wie wat had toegezegd.",
    },
    duiding:
      "Jullie hebben ieder aangegeven waarop je aangesproken wilt worden, en dat is niet hetzelfde. Zonder dat te weten spreekt iedereen elkaar aan op wat hemzelf zou storen.",
    suggestie:
      "Zeg het op het moment zelf en gebruik waar diegene zelf om vroeg. Dat staat in ieders profiel; het is geen gok.",
  },
  misverstand: {
    vraagt: {
      kortaf: "Vraag na wat er bedoeld werd voordat je er iets van vindt.",
      twijfel: "Beantwoord de vraag zonder je te verdedigen; het is nieuwsgierigheid.",
      stilte: "Laat de stilte staan en vraag daarna wat er door iemand heen ging.",
      enthousiasme: "Vraag expliciet of iets een toezegging is of een idee.",
    },
    duiding:
      "Jullie worden op verschillende manieren verkeerd begrepen — kortaf, twijfelend, ongeïnteresseerd, of te snel toezeggend. In een groep stapelt dat: de een leest stilte als afwijzing terwijl de ander nog nadenkt.",
    suggestie:
      "Vraag na wat iemand bedoelde voordat je er iets van vindt. Eén verduidelijkende vraag scheelt vaak een heel gesprek.",
  },
};

/** De duiding en suggestie bij een kenmerk waarop de groep uiteenloopt. */
export function spreidingVoor(kenmerkId) {
  return SPREIDING[kenmerkId] || null;
}

/** Wat één voorkeur van de groep vraagt, of niets. */
export function vraagtVan(kenmerkId, waarde) {
  const blok = SPREIDING[kenmerkId];
  return (blok && blok.vraagt && blok.vraagt[waarde]) || null;
}
