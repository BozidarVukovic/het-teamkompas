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

export const SPREIDING = {
  tempo: {
    duiding:
      "Jullie werken niet allemaal in hetzelfde tempo naar een besluit toe. Zonder afspraak wordt het tempo van de snelste vanzelf het tempo van de groep, en haakt de rest stil af.",
    suggestie:
      "Zeg aan het begin wanneer het besluit valt. Dan weet wie tijd nodig heeft hoeveel er is, en hoeft wie snel wil niet te duwen.",
  },
  context: {
    duiding:
      "De een wil eerst het hele plaatje, de ander heeft aan een paar zinnen genoeg. Wat voor de een een noodzakelijke inleiding is, is voor de ander uitstel.",
    suggestie:
      "Stuur de achtergrond vooraf en begin het gesprek bij de vraag. Dan kan wie context wil die lezen, zonder dat de rest erop zit te wachten.",
  },
  structuur: {
    duiding:
      "Over hoeveel er vastgelegd moet worden verschillen jullie. Wordt dat niet besproken, dan voelt het voor de een rommelig en voor de ander benauwd.",
    suggestie:
      "Spreek af wat vast ligt en waar de ruimte zit. Eén zin over allebei voorkomt het meeste gedoe achteraf.",
  },
  denken: {
    duiding:
      "Een deel van jullie denkt hardop en komt al pratend tot iets; een ander deel wil er eerst alleen over nadenken. In hetzelfde gesprek hoor je van de eersten het meest.",
    suggestie:
      "Leg de vraag neer voordat je hem bespreekt, en laat een stilte vallen voordat je hem invult. Wie eerst wil nadenken, heeft dan ook iets gezegd.",
  },
  contact: {
    duiding:
      "Niet iedereen begint even makkelijk bij de inhoud. Voor de een is bijpraten opwarmen, voor de ander is het tijd die van het onderwerp afgaat.",
    suggestie:
      "Houd het persoonlijke deel kort en expliciet, aan het begin. Dan weet iedereen dat het erbij hoort en wanneer het klaar is.",
  },
  feedback: {
    duiding:
      "Wat jullie prettig vinden bij het ontvangen van feedback loopt uiteen. Dezelfde opmerking komt bij de een aan als duidelijkheid en bij de ander als een aanval.",
    suggestie:
      "Geef feedback één op één in plaats van in de groep, tenzij het over de groep zelf gaat. Vraag vooraf hoe iemand het het liefst hoort.",
  },
  spanning: {
    duiding:
      "Als het spannend wordt, reageren jullie verschillend: de een gaat sneller praten, de ander valt stil of trekt zich even terug. Dat wordt makkelijk gelezen als onwil of als drammen, terwijl het geen van beide is.",
    suggestie:
      "Benoem het als je merkt dat het spanning wordt, en bied een pauze aan met een moment erbij om verder te gaan. Stilte is dan geen instemming en tempo geen druk.",
  },
  besluitvorming: {
    duiding:
      "Jullie hebben niet allemaal hetzelfde nodig om achter een besluit te staan: meegepraat hebben, de afweging begrijpen, of gewoon een knoop.",
    suggestie:
      "Maak vooraf duidelijk of dit een gesprek is of een mededeling, en wie beslist. Het meeste ongenoegen ontstaat doordat dat achteraf pas blijkt.",
  },
  energie: {
    duiding:
      "Jullie krijgen energie van verschillende dingen — afmaken, samen oppakken, iets nieuws bedenken, ergens in duiken. Dat is bruikbaar, zolang het werk niet vanzelf bij dezelfde persoon terechtkomt.",
    suggestie:
      "Verdeel het werk op basis van waar iemand energie van krijgt in plaats van op beschikbaarheid. Vraag het één keer expliciet.",
  },
  energieverlies: {
    duiding:
      "Wat jullie energie kost verschilt. Een lang overleg dat voor de een grondig voelt, is voor de ander de reden dat er niets meer uit komt.",
    suggestie:
      "Zet een eindtijd op het overleg en sluit af met wie wat doet en wanneer. Dat helpt bij alle vier de vormen tegelijk.",
  },
  aanspreken: {
    duiding:
      "Jullie hebben ieder aangegeven waarop je aangesproken wilt worden, en dat is niet hetzelfde. Zonder dat te weten spreekt iedereen elkaar aan op wat hemzelf zou storen.",
    suggestie:
      "Zeg het op het moment zelf en gebruik waar diegene zelf om vroeg. Dat staat in ieders profiel; het is geen gok.",
  },
  misverstand: {
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
