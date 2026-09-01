// De situaties waarvoor iemand advies kan vragen bij "Samenwerken met...".
//
// Elke situatie noemt welke kenmerken er het meest toe doen. De advieslogica
// gebruikt die volgorde om te bepalen welk verschil tussen twee mensen het
// eerst wordt besproken — zodat een advies over feedback geven niet begint bij
// een verschil in werkritme.
//
// Een situatie kan ook over meerdere mensen tegelijk gaan. Waar dat zo is,
// staat er een openingszin voor een groep bij — de gewone opening is geschreven
// voor twee mensen ("wanneer allebei duidelijk is") en dat klopt dan niet meer.
// Twee situaties zijn per definitie één-op-één: feedback geef je aan iemand, en
// "hoe kan ik deze persoon benaderen" gaat over één persoon. Die worden bij een
// groep niet aangeboden in plaats van dat we ze forceren.
//
// Bij elke situatie horen ook een vraag en een kleine actie. De vraag opent het
// gesprek zonder er een oordeel in te leggen; de actie is klein genoeg om
// vandaag nog te doen en beschrijft gedrag, geen houding. De advieslogica kan
// ze vervangen door iets dat specifieker past bij het verschil dat speelt.

export const SITUATIEGROEPEN = [
  { id: "bespreken", label: "Iets bespreken" },
  { id: "spanning", label: "Verschil of spanning" },
  { id: "vooruit", label: "Samen verder" },
];

export const SITUATIES = [
  /* ------------------------------------------------------------ bespreken */
  {
    id: "bespreekbaar-maken",
    voorGroep: true,
    groepsopening:
      "Iets bespreekbaar maken in een groep begint bij het moment en de vorm, niet bij het argument.",
    groep: "bespreken",
    label: "Ik wil iets bespreekbaar maken",
    uitleg: "Er speelt iets dat nog niet op tafel ligt.",
    kenmerken: ["spanning", "contact", "energieverlies", "aanspreken"],
    opening: "Iets bespreekbaar maken begint bij het moment en de vorm, niet bij het argument.",
    vraag: "Heb je zin om ergens even bij stil te staan waar ik over loop te denken?",
    actie: "Vraag eerst of het nu uitkomt, voordat je begint over wat je wilt bespreken.",
  },
  {
    id: "iets-moeilijks",
    voorGroep: true,
    groepsopening:
      "Bij een moeilijk onderwerp helpt het om te weten wat de mensen om tafel nodig hebben om te kunnen luisteren.",
    groep: "bespreken",
    label: "Ik wil een lastig gesprek voorbereiden",
    uitleg: "Er is een onderwerp dat je liever niet uitstelt, maar dat spannend voelt.",
    kenmerken: ["spanning", "feedback", "contact", "energieverlies"],
    opening: "Bij een moeilijk gesprek helpt het om te weten wat de ander nodig heeft om te kunnen luisteren.",
    vraag: "Ik wil iets met je bespreken dat ik lastig vind. Hoe pak ik dat het beste bij jou aan?",
    actie: "Schrijf in één zin op wat je wilt bereiken, voordat je het gesprek begint.",
  },
  {
    id: "feedback-geven",
    voorGroep: false,
    groep: "bespreken",
    label: "Ik wil feedback geven",
    uitleg: "Je hebt iets gezien of gehoord dat je wilt bespreken.",
    kenmerken: ["feedback", "spanning", "contact", "misverstand"],
    opening: "Bij feedback bepaalt de vorm vaak of het aankomt.",
    vraag: "Hoe kijk jij hier zelf naar, voordat ik vertel hoe ik het zie?",
    actie: "Noem één concreet moment in plaats van een patroon. Zeg wat je zag, niet wat je eruit opmaakte.",
  },
  {
    id: "feedback-ontvangen",
    voorGroep: true,
    groepsopening:
      "Feedback vragen aan meerdere mensen levert meer op als je duidelijk maakt waar je het over wilt hebben.",
    groep: "bespreken",
    label: "Ik wil feedback ontvangen",
    uitleg: "Je wilt weten hoe de ander de samenwerking ervaart.",
    kenmerken: ["feedback", "denken", "contact", "aanspreken"],
    opening: "Feedback vragen levert meer op als je duidelijk maakt waar je het over wilt hebben.",
    vraag: "Wat zou ik anders kunnen doen waar jij last van hebt of profijt van zou hebben?",
    actie: "Vraag naar één ding, niet naar een algemene indruk. Zeg daarna niets terug behalve een vraag om verduidelijking.",
  },
  {
    id: "iets-nodig",
    voorGroep: true,
    groepsopening:
      "Wat je vraagt komt beter aan wanneer het aansluit bij hoe deze mensen werken.",
    groep: "bespreken",
    label: "Ik wil hulp of iets vragen",
    uitleg: "Je wacht op iets, of je hebt hulp of een besluit nodig.",
    kenmerken: ["context", "structuur", "tempo", "energieverlies"],
    opening: "Wat je vraagt komt beter aan wanneer het aansluit bij hoe de ander werkt.",
    vraag: "Wat heb je van mij nodig om dit te kunnen oppakken?",
    actie: "Zeg er meteen bij wanneer je het nodig hebt en hoeveel werk je denkt dat het is.",
  },

  /* ------------------------------------------------------------- spanning */
  {
    id: "irritatie",
    voorGroep: true,
    groepsopening:
      "Irritatie in een groep komt vaak voort uit een verschil in stijl dat niet is besproken.",
    groep: "spanning",
    label: "Ik merk irritatie",
    uitleg: "Er zit iets tussen dat je nog niet hebt uitgesproken.",
    kenmerken: ["misverstand", "spanning", "contact", "aanspreken"],
    opening: "Irritatie komt vaak voort uit een verschil in stijl dat niet is besproken.",
    vraag: "Er zit iets tussen ons dat ik niet goed kan plaatsen. Merk jij dat ook?",
    actie: "Benoem wat je bij jezelf merkt, niet wat de ander doet. Begin met “ik merk dat ik...”.",
  },
  {
    id: "elkaar-niet-begrijpen",
    voorGroep: true,
    groepsopening:
      "Langs elkaar heen praten gaat zelden over de inhoud en meestal over wat ieder vanzelfsprekend vindt.",
    groep: "spanning",
    label: "We begrijpen elkaar niet goed",
    uitleg: "Jullie praten langs elkaar heen zonder dat duidelijk is waarom.",
    kenmerken: ["misverstand", "context", "denken", "contact"],
    opening: "Langs elkaar heen praten gaat zelden over de inhoud en meestal over wat ieder vanzelfsprekend vindt.",
    vraag: "Kunnen we even teruggaan: wat versta jij precies onder wat we hier bespreken?",
    actie: "Vat samen wat je de ander hebt horen zeggen en vraag of dat klopt, voordat je je eigen punt maakt.",
  },
  {
    id: "verschil-van-mening",
    voorGroep: true,
    groepsopening:
      "Een verschil van mening in een groep loopt vaker vast op tempo dan op inhoud.",
    groep: "spanning",
    label: "We verschillen van mening",
    uitleg: "Jullie kijken anders naar hetzelfde onderwerp.",
    kenmerken: ["denken", "besluitvorming", "tempo", "context"],
    opening: "Een verschil van mening loopt vaker vast op tempo dan op inhoud.",
    vraag: "Waar zit voor jou het zwaarste punt in deze keuze?",
    actie: "Benoem eerst waar jullie het wél over eens zijn, voordat je het verschil aansnijdt.",
  },
  {
    id: "weerstand",
    voorGroep: true,
    groepsopening:
      "Weerstand is meestal geen onwil, maar een bezwaar dat nog niet is gehoord — en in een groep blijft dat makkelijker onuitgesproken.",
    groep: "spanning",
    label: "Ik merk weerstand",
    uitleg: "De ander lijkt niet mee te willen, en je weet niet goed waarom.",
    kenmerken: ["besluitvorming", "spanning", "energieverlies", "context"],
    opening: "Weerstand is meestal geen onwil, maar een bezwaar dat nog niet is gehoord.",
    vraag: "Wat zou er voor jou moeten kloppen voordat dit een goed idee is?",
    actie: "Vraag door tot je het bezwaar kunt navertellen zonder het te weerleggen.",
  },
  {
    id: "grens-aangeven",
    voorGroep: true,
    groepsopening:
      "Een grens landt beter als hij gaat over wat jij nodig hebt, niet over wat de groep fout doet.",
    groep: "spanning",
    label: "Ik wil een grens aangeven",
    uitleg: "Je wilt duidelijk maken wat voor jou niet werkt.",
    kenmerken: ["energieverlies", "aanspreken", "contact", "spanning"],
    opening: "Een grens landt beter als hij gaat over wat jij nodig hebt, niet over wat de ander fout doet.",
    vraag: "Ik wil je iets uitleggen over hoe ik werk. Mag ik dat even doen?",
    actie: "Zeg wat je wél kunt bieden naast wat je niet doet. Eén zin voor allebei.",
  },
  {
    id: "conflict-voorkomen",
    voorGroep: true,
    groepsopening:
      "Een conflict voorkomen lukt zelden door het onderwerp te vermijden; wel door het moment te kiezen.",
    groep: "spanning",
    label: "Ik wil een conflict voorkomen",
    uitleg: "Je voelt dat het de verkeerde kant op gaat en wilt dat keren.",
    kenmerken: ["spanning", "misverstand", "feedback", "contact"],
    opening: "Een conflict voorkomen lukt zelden door het onderwerp te vermijden; wel door het moment te kiezen.",
    vraag: "Zullen we hier later op terugkomen, als we er allebei rustiger in zitten?",
    actie: "Spreek een moment af om erop terug te komen en houd je daaraan. Uitstel zonder afspraak is ontwijken.",
  },

  /* -------------------------------------------------------------- vooruit */
  {
    id: "besluit-nemen",
    voorGroep: true,
    groepsopening:
      "Een besluit houdt stand wanneer voor iedereen duidelijk is wat er nodig was om erachter te staan.",
    groep: "vooruit",
    label: "We moeten samen een besluit nemen",
    uitleg: "Er ligt een keuze waar jullie allebei achter moeten staan.",
    kenmerken: ["besluitvorming", "tempo", "context", "denken"],
    opening: "Een besluit houdt stand wanneer allebei duidelijk is wat er nodig was om erachter te staan.",
    vraag: "Wat heb jij nodig om achter dit besluit te kunnen staan?",
    actie: "Maak expliciet wie beslist en wanneer, voordat jullie de inhoud in duiken.",
  },
  {
    id: "overtuigen",
    voorGroep: true,
    groepsopening:
      "Mensen gaan zelden mee op argumenten alleen; wel als hun bezwaar eerst serieus is genomen.",
    groepslabel: "Ik wil de groep meekrijgen",
    groep: "vooruit",
    label: "Ik wil de ander meekrijgen",
    uitleg: "Je hebt een voorstel en wilt dat de ander erin meegaat.",
    kenmerken: ["besluitvorming", "context", "denken", "tempo"],
    opening: "Mensen gaan zelden mee op argumenten alleen; wel als hun bezwaar eerst serieus is genomen.",
    vraag: "Wat zou jou hierin tegenhouden?",
    actie: "Stel twee vragen voordat je je voorstel doet, en gebruik het antwoord in hoe je het brengt.",
  },
  {
    id: "herhaling",
    voorGroep: true,
    groepsopening:
      "Wat blijft terugkomen is meestal niet onbesproken, maar onbesloten.",
    groep: "vooruit",
    label: "We blijven over hetzelfde praten",
    uitleg: "Hetzelfde onderwerp komt telkens terug zonder dat er iets verandert.",
    kenmerken: ["besluitvorming", "structuur", "denken", "energieverlies"],
    opening: "Wat blijft terugkomen is meestal niet onbesproken, maar onbesloten.",
    vraag: "Wat zou er moeten gebeuren zodat dit onderwerp klaar is?",
    actie: "Schrijf in één zin op wat er precies besloten moet worden, en leg die zin voor.",
  },
  {
    id: "benaderen",
    voorGroep: false,
    groep: "vooruit",
    label: "Ik wil weten hoe ik deze persoon kan benaderen",
    uitleg: "Je wilt weten wat wel en niet werkt voordat je iets aankaart.",
    kenmerken: ["contact", "denken", "feedback", "misverstand"],
    opening: "Hoe je iemand benadert, bepaalt vaak meer dan wat je zegt.",
    vraag: "Hoe wil jij het liefst dat ik iets bij je aankaart?",
    actie: "Vraag het gewoon een keer, buiten een lastig moment om. Dat kost een minuut en scheelt later veel.",
  },
  {
    id: "aanvullen",
    voorGroep: true,
    groepsopening:
      "Elkaar aanvullen werkt het best wanneer je benoemt waar je verschilt.",
    groepslabel: "Ik wil weten hoe we elkaar beter kunnen aanvullen",
    groep: "vooruit",
    label: "Ik wil weten hoe we elkaar beter kunnen aanvullen",
    uitleg: "Het gaat goed, en je wilt er meer uit halen.",
    kenmerken: ["energie", "structuur", "denken", "besluitvorming"],
    opening: "Elkaar aanvullen werkt het best wanneer je benoemt waar je verschilt.",
    vraag: "Waar zou jij mij het liefst voor inschakelen, en waarvoor liever niet?",
    actie: "Spreek voor één taak af wie wat oppakt, op basis van wat jullie het liefst doen.",
  },
];

export function situatie(id) {
  return SITUATIES.find((s) => s.id === id) || null;
}

export const SITUATIE_IDS = SITUATIES.map((s) => s.id);

/**
 * De situaties per groep.
 *
 * `voorGroep` laat alleen de situaties zien die over meerdere mensen kunnen
 * gaan, en zet dan het label dat daarbij hoort — "Ik wil de ander meekrijgen"
 * heet bij een groep anders.
 */
export function situatiesPerGroep({ voorGroep = false } = {}) {
  return SITUATIEGROEPEN.map((g) => ({
    ...g,
    situaties: SITUATIES
      .filter((s) => s.groep === g.id)
      .filter((s) => (voorGroep ? s.voorGroep !== false && Boolean(s.groepsopening) : true))
      .map((s) => (voorGroep && s.groepslabel ? { ...s, label: s.groepslabel } : s)),
  })).filter((g) => g.situaties.length > 0);
}

/** De openingszin die past bij één collega of bij een groep. */
export function openingVan(s, voorGroep = false) {
  if (!s) return null;
  return voorGroep && s.groepsopening ? s.groepsopening : s.opening;
}
