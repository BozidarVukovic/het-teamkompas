// ─────────────────────────────────────────────────────────────────────────────
// GESPREKSVOORBEREIDER — STAPPEN
//
// Alle vragen, toelichtingen, antwoordopties en voorbeelden staan hier. De
// interface rendert wat in dit bestand staat en bevat zelf geen teksten.
//
// Een stap kan per situatie een andere vraag of toelichting krijgen via het
// veld `perSituatie`. Zo blijft één stap één stap, ook als de formulering
// verschilt.
// ─────────────────────────────────────────────────────────────────────────────

/** Het verschil tussen een interpretatie en een concrete waarneming. */
export const WAARNEMING_VOORBEELDEN = [
  { interpretatie: "Je neemt mij niet serieus.", waarneming: "Tijdens mijn toelichting onderbrak je mij drie keer." },
  { interpretatie: "Je bent niet betrokken.", waarneming: "Je was bij de laatste drie overleggen niet aanwezig." },
  { interpretatie: "Je komt je afspraken nooit na.", waarneming: "De twee afgesproken documenten waren niet gereed op de afgesproken datum." },
  { interpretatie: "Jullie sluiten anderen buiten.", waarneming: "Tijdens de pauze spraken jullie over een gezamenlijk plan zonder de andere betrokken collega's erbij te betrekken." },
  { interpretatie: "Je bent onduidelijk.", waarneming: "Na het overleg hadden drie teamleden een andere uitleg van het genomen besluit." },
];

/** Tips die verschijnen wanneer iemand aangeeft dat er nog een interpretatie in staat. */
export const INTERPRETATIE_TIPS = [
  "Streep elk woord weg dat iets zegt over karakter, houding of bedoeling.",
  "Vervang woorden als altijd, nooit, expres en duidelijk door wat je feitelijk zag of hoorde.",
  "Voeg toe wanneer het gebeurde en wie erbij waren, in rollen en niet in namen.",
  "Lees je zin hardop: zou een camera dit hebben kunnen vastleggen?",
];

/** Woorden die vrijwel altijd een interpretatie verraden. De controle hierop is
 *  een hulpmiddel, geen oordeel: de gebruiker beslist zelf. */
export const SIGNAALWOORDEN = [
  "altijd", "nooit", "expres", "met opzet", "bewust", "duidelijk niet",
  "wil niet", "kan niet", "weigert", "arrogant", "lui", "onverschillig",
  "respectloos", "onbeschoft", "boos", "geïrriteerd", "vindt mij",
  "neemt mij niet serieus", "geeft niets om", "interesseert",
];

export const EFFECT_SCHAAL = [
  { id: "geen", label: "Geen merkbaar effect" },
  { id: "beperkt", label: "Een beperkt effect" },
  { id: "duidelijk", label: "Een duidelijk effect" },
  { id: "ernstig", label: "Een ernstig effect" },
  { id: "nvt", label: "Niet van toepassing" },
];

export const EFFECT_ONDERDELEN = [
  { id: "jou", vraag: "Wat is het effect op jou?", label: "op mij" },
  { id: "team", vraag: "Wat is het effect op het team?", label: "op het team" },
  { id: "werk", vraag: "Wat is het effect op het werk, de samenwerking of het resultaat?", label: "op het werk" },
];

export const EFFECT_VOORBEELDEN = [
  "vertraging", "verwarring", "frustratie", "verminderde samenwerking", "fouten",
  "werkdruk", "terughoudendheid", "verlies van vertrouwen", "onduidelijke besluitvorming",
  "niet nagekomen afspraken",
];

export const RELATIES = [
  {
    id: "collega", label: "Een collega",
    aandachtspunt: "Jullie staan naast elkaar. Dat maakt het gesprek gelijkwaardig, en het betekent ook dat je niets kunt opleggen: je vraagt om iets.",
  },
  {
    id: "medewerker", label: "Een medewerker aan wie ik leidinggeef",
    aandachtspunt: "Bedenk dat jouw positie als leidinggevende invloed heeft op hoe vrij de ander zich voelt om te reageren. Zeg expliciet dat tegenspraak welkom is, en laat na je vraag een stilte vallen.",
  },
  {
    id: "leidinggevende", label: "Mijn leidinggevende",
    aandachtspunt: "Formuleer concreet wat je nodig hebt en welke invloed de situatie heeft op jouw werk. Zeg aan het begin of je informeert, meedenkt of om een besluit vraagt.",
  },
  {
    id: "team", label: "Een groep collega's of het hele team",
    aandachtspunt: "In een groep reageert bijna niemand als eerste. Kondig het onderwerp vooraf aan, geef mensen bedenktijd en begin met een ronde waarin iedereen kort aan het woord komt.",
  },
  {
    id: "buiten-team", label: "Iemand met wie ik samenwerk buiten mijn eigen team",
    aandachtspunt: "Jullie delen geen dagelijkse context en waarschijnlijk ook geen leidinggevende. Neem meer tijd voor de situatieschets en check of jullie hetzelfde beeld hebben van de opdracht.",
  },
];

export const RESULTAAT_OPTIES = [
  { id: "perspectief", label: "Ik wil het perspectief van de ander begrijpen" },
  { id: "effect-duidelijk", label: "Ik wil duidelijk maken welk effect het gedrag heeft" },
  { id: "afspraak-herstellen", label: "Ik wil een bestaande afspraak herstellen" },
  { id: "nieuwe-afspraak", label: "Ik wil een nieuwe concrete afspraak maken" },
  { id: "rolduidelijkheid", label: "Ik wil duidelijkheid over rollen of verantwoordelijkheden" },
  { id: "feedback", label: "Ik wil feedback ontvangen" },
  { id: "samen-oplossen", label: "Ik wil gezamenlijk een oplossing onderzoeken" },
  { id: "grens", label: "Ik wil aangeven waar voor mij een grens ligt" },
  { id: "combinatie", label: "Een combinatie van deze doelen" },
];

export const BELANG_SUGGESTIES = [
  "goede samenwerking", "een veilige werkomgeving", "betrouwbare dienstverlening",
  "duidelijkheid", "de kwaliteit van het werk", "werkplezier",
  "goede zorg voor patiënten of klanten", "tijdige besluitvorming",
  "wederzijds vertrouwen", "leren en verbeteren",
];

export const OPEN_VRAAG_SUGGESTIES = [
  "Hoe heb jij deze situatie ervaren?",
  "Wat maakte dat je op dat moment zo handelde?",
  "Wat heb jij van mij nodig om dit anders te kunnen doen?",
  "Hoe kijk jij naar het effect dat dit op het team heeft?",
  "Wat is volgens jou een werkbare afspraak?",
  "Wat zie ik mogelijk over het hoofd?",
  "Hoe kunnen we voorkomen dat dit opnieuw gebeurt?",
];

export const VERMIJD_VRAGEN = [
  "Waarom doe je altijd zo?",
  "Begrijp je dan niet wat je veroorzaakt?",
  "Waarom houd je je nooit aan afspraken?",
];

export const CONTROLELIJST = [
  { id: "gedrag", label: "Ik heb concreet gedrag beschreven." },
  { id: "geen-intentie", label: "Ik heb geen intenties of karaktereigenschappen ingevuld." },
  { id: "effect", label: "Ik kan het effect duidelijk uitleggen." },
  { id: "luisteren", label: "Ik ben bereid naar het perspectief van de ander te luisteren." },
  { id: "belang", label: "Ik weet welk gezamenlijk belang ik wil benoemen." },
  { id: "klein", label: "Mijn gewenste verandering is klein en concreet." },
  { id: "onveilig", label: "Ik weet wat ik doe als het gesprek onveilig wordt." },
  { id: "moment", label: "Ik heb een geschikt moment en een rustige omgeving gekozen." },
];

/** De stapdefinities. `veld` is de sleutel waaronder het antwoord wordt bewaard. */
export const STAPPEN = {
  waarneming: {
    id: "waarneming",
    titel: "Concrete waarneming",
    vraag: "Wat heb je zelf concreet gezien of gehoord?",
    uitleg: "Beschrijf alleen wat een camera of geluidsopname zou kunnen vastleggen. Vermijd aannames over intenties, karakter of motivatie.",
    type: "tekst",
    veld: "waarneming",
    placeholder: "Bijvoorbeeld: tijdens het overleg van dinsdag onderbrak je mijn toelichting drie keer.",
    minLengte: 15,
    verplicht: true,
    voorbeeldtabel: true,
    interpretatiecheck: true,
    perSituatie: {
      "onveilig-gedrag": {
        vraag: "Wat heb je zelf concreet gezien of gehoord?",
        uitleg: "Beschrijf per voorval wat er letterlijk werd gezegd of gedaan, en wanneer. Feitelijke voorbeelden houden het gesprek bij de zaak, ook wanneer het onderwerp zwaar is.",
        placeholder: "Bijvoorbeeld: in het werkoverleg van 6 maart werd over mijn voorstel gezegd dat het van iemand als ik te verwachten was.",
      },
      rolonduidelijkheid: {
        vraag: "Bij welk concreet moment merkte je dat de rollen onduidelijk zijn?",
        uitleg: "Eén voorval is genoeg. Beschrijf wat er gebeurde of juist bleef liggen, zonder namen te noemen.",
        placeholder: "Bijvoorbeeld: het besluit over de planning bleef twee weken liggen omdat niemand het nam.",
      },
      "verschil-van-inzicht": {
        vraag: "Waarover verschillen jullie precies van inzicht?",
        uitleg: "Beschrijf het verschil zo feitelijk mogelijk. Wat wil jij, wat wil de ander, en waarover gaat het besluit?",
        placeholder: "Bijvoorbeeld: ik wil eerst een pilot van vier weken, de ander wil de nieuwe werkwijze meteen invoeren.",
      },
    },
  },

  feedbackvraag: {
    id: "feedbackvraag",
    titel: "Jouw feedbackvraag",
    vraag: "Op welk concreet gedrag van jezelf wil je feedback?",
    uitleg: "Een kleine vraag levert een bruikbaar antwoord op. Vraag naar wat mensen jou zien doen, en niet naar wat ze van je vinden.",
    type: "tekst",
    veld: "feedbackvraag",
    placeholder: "Bijvoorbeeld: hoe kwam mijn toelichting in het teamoverleg van vorige week over?",
    minLengte: 10,
    verplicht: true,
    voorbeeldzin: "Ik wil graag begrijpen welk effect mijn gedrag heeft. Wat zie je mij doen dat helpt en wat zou ik anders kunnen doen?",
  },

  patroon: {
    id: "patroon",
    titel: "Incident of patroon",
    vraag: "Gaat het om één gebeurtenis of om gedrag dat vaker voorkomt?",
    uitleg: "Een eenmalig voorval vraagt een ander gesprek dan een patroon. Bij een patroon helpen concrete voorbeelden om het bespreekbaar te houden.",
    type: "keuze",
    veld: "patroon",
    verplicht: true,
    opties: [
      { id: "eenmalig", label: "Een eenmalige gebeurtenis" },
      { id: "patroon", label: "Een terugkerend patroon" },
      { id: "onbekend", label: "Dat weet ik nog niet zeker" },
    ],
    vervolg: {
      patroon: {
        titel: "Voorbeelden",
        uitleg: "Noteer maximaal drie voorbeelden met datum of context. Woorden als altijd en nooit laten we weg, tenzij ze aantoonbaar kloppen.",
        veld: "voorbeelden",
        velden: [
          { id: "voorbeeld1", label: "Eerste voorbeeld", placeholder: "Bijvoorbeeld: in het overleg van 4 maart." },
          { id: "voorbeeld2", label: "Tweede voorbeeld (optioneel)", placeholder: "" },
          { id: "voorbeeld3", label: "Derde voorbeeld (optioneel)", placeholder: "" },
        ],
      },
    },
  },

  relatie: {
    id: "relatie",
    titel: "De ander",
    vraag: "Met wie wil je dit gesprek voeren?",
    uitleg: "De verhouding tussen jullie bepaalt mee hoe vrij het gesprek verloopt. We passen de aandachtspunten daarop aan.",
    type: "keuze",
    veld: "relatie",
    verplicht: true,
    opties: RELATIES.map((r) => ({ id: r.id, label: r.label })),
  },

  effect: {
    id: "effect",
    titel: "Het effect",
    vraag: "Welk effect heeft dit?",
    uitleg: "Beschrijf wat er in de praktijk gebeurt. Schrijf geen emoties of bedoelingen toe aan de ander; blijf bij wat jij merkt.",
    type: "effect",
    veld: "effect",
    verplicht: true,
    voorbeelden: EFFECT_VOORBEELDEN,
  },

  resultaat: {
    id: "resultaat",
    titel: "Gewenst resultaat",
    vraag: "Wat wil je met het gesprek bereiken?",
    uitleg: "Kies maximaal drie doelen. Hoe scherper je doel, hoe rustiger het gesprek verloopt.",
    type: "meerkeuze",
    veld: "resultaat",
    max: 3,
    verplicht: true,
    opties: RESULTAAT_OPTIES,
    extraVraag: {
      veld: "verbetering",
      vraag: "Wat zou na het gesprek een kleine, realistische verbetering zijn?",
      uitleg: "Klein en concreet werkt beter dan groot en algemeen.",
      placeholder: "Bijvoorbeeld: dat we bij het volgende overleg eerst de vraag afmaken voordat iemand reageert.",
      verplicht: true,
      minLengte: 10,
    },
  },

  belang: {
    id: "belang",
    titel: "Gezamenlijk belang",
    vraag: "Welk belang delen jij en de ander waarschijnlijk?",
    uitleg: "Bijna elk gesprek verloopt anders zodra duidelijk is wat jullie allebei willen. Kies een suggestie of schrijf je eigen formulering.",
    type: "meerkeuze",
    veld: "belang",
    max: 3,
    verplicht: true,
    opties: BELANG_SUGGESTIES.map((label) => ({ id: label, label })),
    eigenVeld: { veld: "belangEigen", label: "Of formuleer het zelf", placeholder: "Bijvoorbeeld: dat nieuwe collega's zich hier snel thuis voelen." },
  },

  openvraag: {
    id: "openvraag",
    titel: "Open vraag",
    vraag: "Welke open vraag stel je aan de ander?",
    uitleg: "Eén goede vraag verandert meer dan drie argumenten. Kies er een, of schrijf je eigen vraag.",
    type: "meerkeuze",
    veld: "openvraag",
    max: 2,
    verplicht: true,
    opties: OPEN_VRAAG_SUGGESTIES.map((label) => ({ id: label, label })),
    eigenVeld: { veld: "openvraagEigen", label: "Of stel je eigen vraag", placeholder: "Bijvoorbeeld: wat zou jou helpen om dit anders te doen?" },
    vermijden: VERMIJD_VRAGEN,
  },

  grenzen: {
    id: "grenzen",
    titel: "Grens en ondersteuning",
    vraag: "Waar ligt voor jou de grens, en wat heb je nodig?",
    uitleg: "Bij onveilig gedrag is het waardevol om vooraf te weten wat je wilt zeggen over je grens, en wie je erbij wilt betrekken.",
    type: "velden",
    veld: "grenzen",
    velden: [
      { id: "grens", label: "Waar ligt voor jou de grens?", placeholder: "Bijvoorbeeld: opmerkingen over mijn achtergrond wil ik niet meer horen, ook niet als grap.", verplicht: true, minLengte: 10 },
      { id: "ondersteuning", label: "Wie wil je hierbij betrekken of vooraf informeren?", placeholder: "Bijvoorbeeld: mijn leidinggevende vooraf informeren, en de vertrouwenspersoon om advies vragen.", verplicht: false },
      { id: "alsgesprek", label: "Wat doe je als het gesprek onveilig wordt?", placeholder: "Bijvoorbeeld: ik zeg dat ik het gesprek nu stop en er later op terugkom.", verplicht: false },
    ],
  },

  afspraak: {
    id: "afspraak",
    titel: "De afspraak",
    vraag: "Welke afspraak wil je evalueren?",
    uitleg: "Begin bij wat er ooit is afgesproken. Het verschil tussen de afspraak en de praktijk is meestal het gesprek waard.",
    type: "velden",
    veld: "afspraak",
    velden: [
      { id: "oorspronkelijk", label: "Wat spraken jullie precies af?", placeholder: "Bijvoorbeeld: iedereen zet zijn punt uiterlijk een dag vooraf op de agenda.", verplicht: true, minLengte: 10 },
      { id: "beoogd", label: "Wat wilden jullie daarmee bereiken?", placeholder: "Bijvoorbeeld: kortere overleggen en betere voorbereiding.", verplicht: true, minLengte: 5 },
      { id: "feitelijk", label: "Wat gebeurde er feitelijk?", placeholder: "Bijvoorbeeld: in de laatste vier overleggen stonden er vooraf geen punten op de agenda.", verplicht: true, minLengte: 10 },
      { id: "hielp", label: "Wat hielp wel?", placeholder: "Bijvoorbeeld: de weken dat iemand de agenda actief rondstuurde.", verplicht: false },
      { id: "belemmerde", label: "Wat belemmerde?", placeholder: "Bijvoorbeeld: het overleg staat op maandagochtend, vlak na het weekend.", verplicht: false },
    ],
    extraKeuze: {
      veld: "afspraakVervolg",
      vraag: "Wat lijkt jou de logische uitkomst?",
      verplicht: true,
      opties: [
        { id: "stoppen", label: "Stoppen met deze afspraak" },
        { id: "aanpassen", label: "De afspraak aanpassen" },
        { id: "doorgaan", label: "Doorgaan en beter borgen" },
        { id: "open", label: "Dat wil ik samen bepalen" },
      ],
    },
  },

  rollen: {
    id: "rollen",
    titel: "Rollen en verantwoordelijkheden",
    vraag: "Hoe zit de verdeling volgens jou in elkaar?",
    uitleg: "Beschrijf rollen of functies, geen namen. Het gaat om de vraag wie waarover gaat, en waar jullie beeld uit elkaar loopt.",
    type: "velden",
    veld: "rollen",
    velden: [
      { id: "verantwoordelijk", label: "Wie is verantwoordelijk voor het geheel?", placeholder: "Bijvoorbeeld: de projectleider.", verplicht: true, minLengte: 3 },
      { id: "beslist", label: "Wie mag hierover beslissen?", placeholder: "Bijvoorbeeld: de teamleider, in overleg met de opdrachtgever.", verplicht: true, minLengte: 3 },
      { id: "uitvoert", label: "Wie voert het uit?", placeholder: "", verplicht: false },
      { id: "geraadpleegd", label: "Wie moet worden geraadpleegd?", placeholder: "", verplicht: false },
      { id: "geinformeerd", label: "Wie moet worden geïnformeerd?", placeholder: "", verplicht: false },
      { id: "duidelijkheid", label: "Welke duidelijkheid heb jij nodig om verder te kunnen?", placeholder: "Bijvoorbeeld: wie het budget vrijgeeft.", verplicht: true, minLengte: 10 },
    ],
  },

  verschil: {
    id: "verschil",
    titel: "Standpunt en belang",
    vraag: "Wat ligt er onder het verschil?",
    uitleg: "Een standpunt is wat iemand wil. Een belang is waarom dat voor diegene belangrijk is. Zodra de belangen op tafel liggen, blijkt het verschil vaak kleiner.",
    type: "velden",
    veld: "verschil",
    velden: [
      { id: "eens", label: "Waarover zijn jullie het wel eens?", placeholder: "Bijvoorbeeld: dat de doorlooptijd korter moet.", verplicht: true, minLengte: 5 },
      { id: "eigenAanname", label: "Welke aanname ligt onder jouw standpunt?", placeholder: "Bijvoorbeeld: ik neem aan dat een pilot ons tijd bespaart.", verplicht: true, minLengte: 10 },
      { id: "andersAanname", label: "Welke aanname ligt mogelijk onder het standpunt van de ander?", placeholder: "Bijvoorbeeld: dat uitstel het momentum wegneemt.", verplicht: false },
      { id: "criteria", label: "Aan welke criteria moet een goede oplossing voldoen?", placeholder: "Bijvoorbeeld: haalbaar binnen dit kwartaal, en het team kan het uitvoeren.", verplicht: true, minLengte: 10 },
    ],
  },

  controle: {
    id: "controle",
    titel: "Controle",
    vraag: "Loop dit even na voordat je het gesprek voert",
    uitleg: "Deze lijst is een hulpmiddel. Vink af wat klopt; wat openblijft, kun je met de knop hierboven nog aanpassen.",
    type: "checklist",
    veld: "controle",
    opties: CONTROLELIJST,
  },
};

export const STAP_IDS = Object.keys(STAPPEN);

/** De stapdefinitie, met de situatiespecifieke formulering er al in verwerkt. */
export function stap(id, situatieId) {
  const basis = STAPPEN[id];
  if (!basis) return null;
  const afwijking = basis.perSituatie && basis.perSituatie[situatieId];
  return afwijking ? { ...basis, ...afwijking } : basis;
}

export default STAPPEN;
