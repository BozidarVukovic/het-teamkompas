// ─────────────────────────────────────────────────────────────────────────────
// GRATIS TEAMSCAN — COMBINATIEPATRONEN
//
// Een patroon beschrijft wat de combinatie van twee domeinscores kan betekenen.
// Alles is vooraf geschreven en deterministisch: er komt geen taalmodel aan te
// pas en er wordt niets afgeleid dat de vragenlijst niet meet.
//
// De scan meet zes domeinen: veiligheid, communicatie, eigenaarschap,
// verbinding, energie en leiderschap. Onderwerpen die daar niet herkenbaar in
// zitten, zoals rolhelderheid of leergerichtheid als losse dimensie, worden
// bewust niet als patroon geformuleerd.
//
// Voorwaarden staan op de schaal van 1 tot en met 5:
//   `min` is inclusief, `max` is inclusief.
// `verschil` eist een minimaal scoreverschil tussen twee domeinen.
// `prioriteit` is de laatste tiebreak: hoger komt eerder.
// `sluitUit` voorkomt dat twee patronen naast elkaar hetzelfde zeggen.
// ─────────────────────────────────────────────────────────────────────────────

const HOOG = 3.5;
const LAAG = 2.49;
const MIDDEN_LAAG = 2.99;

export const COMBINATIEPATRONEN = [
  {
    id: "veiligheid-laag-eigenaarschap-laag",
    titel: "Onduidelijkheid die onbesproken blijft",
    voorwaarden: [{ domein: "veiligheid", max: MIDDEN_LAAG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    prioriteit: 10,
    duiding: "Wanneer zowel openheid als duidelijkheid kwetsbaar worden ervaren, kunnen onduidelijkheden langer onbesproken blijven. Onderzoek niet alleen wie waarvoor verantwoordelijk is, maar ook of mensen zich vrij genoeg voelen om daar vragen over te stellen.",
    reflectievraag: "Welke vraag over wie waarover gaat, heb je nog niet hardop gesteld?",
    experiment: "exp-onuitgesproken-punt",
    sluitUit: ["veiligheid-hoog-eigenaarschap-laag"],
  },
  {
    id: "energie-hoog-leiderschap-laag",
    titel: "Bereidheid zonder richting",
    voorwaarden: [{ domein: "energie", min: HOOG }, { domein: "leiderschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "energie", laag: "leiderschap", min: 0.8 },
    prioriteit: 8,
    duiding: "Je lijkt betrokken en gemotiveerd, terwijl richting of verwachtingen minder duidelijk kunnen zijn. Dat kan energie kosten, omdat bereidheid niet automatisch leidt tot gerichte actie.",
    reflectievraag: "Waaraan zou jij deze week werken als de richting helemaal helder was?",
    experiment: "exp-vraag-naar-het-waarom",
  },
  {
    id: "veiligheid-hoog-communicatie-laag",
    titel: "Prettig, en toch niet alles gezegd",
    voorwaarden: [{ domein: "veiligheid", min: HOOG }, { domein: "communicatie", max: MIDDEN_LAAG }],
    verschil: { hoog: "veiligheid", laag: "communicatie", min: 0.8 },
    prioriteit: 9,
    duiding: "Een prettige en open sfeer betekent niet automatisch dat mensen elkaar ook aanspreken. Onderzoek of er naast steun ook ruimte is voor een lastig verschil van inzicht.",
    reflectievraag: "Wat gebeurt er bij jullie nadat iemand een afwijkende mening uitspreekt?",
    experiment: "exp-verschil-benoemen",
  },
  {
    id: "leiderschap-hoog-eigenaarschap-laag",
    titel: "Meebewegen zonder invloed",
    voorwaarden: [{ domein: "leiderschap", min: HOOG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "leiderschap", laag: "eigenaarschap", min: 0.8 },
    prioriteit: 8,
    duiding: "Je lijkt bereid om mee te bewegen, maar ervaart mogelijk weinig invloed op de uitvoering. Onderzoek wat er met ideeën, zorgen en suggesties van medewerkers gebeurt.",
    reflectievraag: "Wat is er gebeurd met het laatste voorstel dat jij hebt ingebracht?",
    experiment: "exp-besluit-vastleggen",
  },
  {
    id: "energie-hoog-eigenaarschap-laag",
    titel: "Energie zonder ruimte",
    voorwaarden: [{ domein: "energie", min: HOOG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "energie", laag: "eigenaarschap", min: 0.8 },
    prioriteit: 7,
    duiding: "Je hebt mogelijk voldoende energie voor het werk, maar ervaart niet altijd de ruimte of verantwoordelijkheid om zelf initiatief te nemen.",
    reflectievraag: "Welke verbetering zou je oppakken als je wist dat er ruimte voor was?",
    experiment: "exp-kleine-verbetering",
  },
  {
    id: "energie-laag-eigenaarschap-hoog",
    titel: "Verantwoordelijkheid die zwaar weegt",
    voorwaarden: [{ domein: "energie", max: MIDDEN_LAAG }, { domein: "eigenaarschap", min: HOOG }],
    verschil: { hoog: "eigenaarschap", laag: "energie", min: 0.8 },
    prioriteit: 9,
    duiding: "Je voelt je mogelijk sterk verantwoordelijk, terwijl het werk of de samenwerking onvoldoende energie geeft. Onderzoek of je meer draagt dan op langere termijn haalbaar is.",
    reflectievraag: "Welke taak vraagt structureel meer dan zij oplevert?",
    experiment: "exp-energie-bijhouden",
  },
  {
    id: "verbinding-hoog-veiligheid-laag",
    titel: "Hecht, en daarom voorzichtig",
    voorwaarden: [{ domein: "verbinding", min: HOOG }, { domein: "veiligheid", max: MIDDEN_LAAG }],
    verschil: { hoog: "verbinding", laag: "veiligheid", min: 0.8 },
    prioriteit: 9,
    duiding: "Je kunt een sterke onderlinge verbondenheid ervaren en toch terughoudend zijn bij gevoelige onderwerpen. Een hechte sfeer kan ook de wens versterken om spanning te vermijden.",
    reflectievraag: "In welke situaties houd je een vraag, twijfel of bezwaar voor jezelf?",
    experiment: "exp-onuitgesproken-punt",
  },
  {
    id: "veiligheid-hoog-leiderschap-laag",
    titel: "Uitgesproken, maar wat gebeurt ermee?",
    voorwaarden: [{ domein: "veiligheid", min: HOOG }, { domein: "leiderschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "veiligheid", laag: "leiderschap", min: 0.8 },
    prioriteit: 8,
    duiding: "Je kunt je vrij voelen om iets te zeggen en tegelijkertijd ervaren dat jouw inbreng weinig verandert. Onderzoek wat er na het uitspreken van ideeën of zorgen daadwerkelijk gebeurt.",
    reflectievraag: "Wanneer merkte je voor het laatst dat jouw inbreng iets veranderde?",
    experiment: "exp-terugkoppeling-vragen",
  },
  {
    id: "leiderschap-hoog-energie-laag",
    titel: "Duidelijk, en toch zwaar",
    voorwaarden: [{ domein: "leiderschap", min: HOOG }, { domein: "energie", max: MIDDEN_LAAG }],
    verschil: { hoog: "leiderschap", laag: "energie", min: 0.8 },
    prioriteit: 8,
    duiding: "Het kan duidelijk zijn wat er moet gebeuren, zonder dat dit voldoende betekenis of energie geeft. Onderzoek naast de taak ook wat mensen nodig hebben om zich ermee te verbinden.",
    reflectievraag: "Welk deel van je werk zou je missen als het morgen wegviel?",
    experiment: "exp-energie-bijhouden",
  },
  {
    id: "communicatie-hoog-eigenaarschap-laag",
    titel: "Van gesprek naar opvolging",
    voorwaarden: [{ domein: "communicatie", min: HOOG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "communicatie", laag: "eigenaarschap", min: 0.8 },
    prioriteit: 8,
    duiding: "Het team kan goed terugkijken en verbeteringen bedenken, terwijl afspraken onvoldoende worden vastgehouden. De ontwikkelkans ligt dan waarschijnlijk bij eigenaarschap en opvolging.",
    reflectievraag: "Welke afspraak uit het laatste overleg is nog niet nagekomen, en wat hield dat tegen?",
    experiment: "exp-besluit-vastleggen",
  },
  {
    id: "verbinding-hoog-energie-laag",
    titel: "Betrokkenheid vraagt energie",
    voorwaarden: [{ domein: "verbinding", min: HOOG }, { domein: "energie", max: MIDDEN_LAAG }],
    verschil: { hoog: "verbinding", laag: "energie", min: 0.8 },
    prioriteit: 7,
    duiding: "Je antwoorden kunnen wijzen op veel onderlinge betrokkenheid, terwijl de beschikbare energie onder druk staat. Betrokken teams nemen vaak meer op zich dan verstandig is.",
    reflectievraag: "Wat neem jij op je omdat je collega's niet wilt teleurstellen?",
    experiment: "exp-hulp-vragen",
  },
  {
    id: "verbinding-hoog-communicatie-laag",
    titel: "Steun en het echte gesprek",
    voorwaarden: [{ domein: "verbinding", min: HOOG }, { domein: "communicatie", max: MIDDEN_LAAG }],
    verschil: { hoog: "verbinding", laag: "communicatie", min: 0.8 },
    prioriteit: 7,
    duiding: "Onderlinge steun lijkt aanwezig, terwijl het constructief bespreken van verschil mogelijk extra aandacht verdient. Steun en tegenspraak zijn twee verschillende dingen.",
    reflectievraag: "Wanneer heb je voor het laatst iemand tegengesproken, en hoe liep dat af?",
    experiment: "exp-verschil-benoemen",
  },
  {
    id: "veiligheid-hoog-eigenaarschap-laag",
    titel: "Ruimte die nog beweging kan worden",
    voorwaarden: [{ domein: "veiligheid", min: HOOG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "veiligheid", laag: "eigenaarschap", min: 0.8 },
    prioriteit: 7,
    duiding: "Er lijkt ruimte om je uit te spreken, maar die ruimte vertaalt zich mogelijk nog niet altijd naar eigenaarschap en opvolging.",
    reflectievraag: "Welke kleine bijdrage kun jij leveren zonder de verantwoordelijkheid van anderen over te nemen?",
    experiment: "exp-kleine-verbetering",
  },
  {
    id: "leiderschap-hoog-veiligheid-laag",
    titel: "Richting zonder alle stemmen",
    voorwaarden: [{ domein: "leiderschap", min: HOOG }, { domein: "veiligheid", max: MIDDEN_LAAG }],
    verschil: { hoog: "leiderschap", laag: "veiligheid", min: 0.8 },
    prioriteit: 9,
    duiding: "Richting wordt mogelijk duidelijk ervaren, terwijl niet iedere zorg of afwijkende mening even gemakkelijk op tafel komt. Een helder verhaal kan tegenspraak ongemerkt kleiner maken.",
    reflectievraag: "Welke zorg over de huidige richting heb je nog niet gedeeld?",
    experiment: "exp-onuitgesproken-punt",
  },
  {
    id: "eigenaarschap-hoog-communicatie-laag",
    titel: "Doen zonder afstemmen",
    voorwaarden: [{ domein: "eigenaarschap", min: HOOG }, { domein: "communicatie", max: MIDDEN_LAAG }],
    verschil: { hoog: "eigenaarschap", laag: "communicatie", min: 0.8 },
    prioriteit: 6,
    duiding: "Er lijkt initiatief te zijn, terwijl afstemming achterblijft. Dat kan tot dubbel werk leiden of tot verrassingen bij collega's die iets anders verwachtten.",
    reflectievraag: "Wie had bij jouw laatste initiatief eerder betrokken willen worden?",
    experiment: "exp-terugkoppeling-vragen",
  },
  {
    id: "verbinding-hoog-eigenaarschap-laag",
    titel: "Harmonie boven opvolging",
    voorwaarden: [{ domein: "verbinding", min: HOOG }, { domein: "eigenaarschap", max: MIDDEN_LAAG }],
    verschil: { hoog: "verbinding", laag: "eigenaarschap", min: 0.8 },
    prioriteit: 6,
    duiding: "De sfeer lijkt goed, terwijl afspraken en besluiten niet altijd een duidelijke eigenaar krijgen. In hechte teams voelt het aanwijzen van een eigenaar soms als wantrouwen.",
    reflectievraag: "Welk besluit blijft bij jullie liggen omdat niemand het claimt?",
    experiment: "exp-besluit-vastleggen",
  },
  {
    id: "energie-laag-verbinding-laag",
    titel: "Zwaar werk zonder vangnet",
    voorwaarden: [{ domein: "energie", max: LAAG }, { domein: "verbinding", max: MIDDEN_LAAG }],
    prioriteit: 10,
    duiding: "Je antwoorden kunnen erop wijzen dat het werk veel vraagt terwijl steun van collega's beperkt beschikbaar is. Die combinatie put sneller uit dan hoge werkdruk alleen.",
    reflectievraag: "Wie zou je om hulp kunnen vragen zonder dat het je iets kost?",
    experiment: "exp-hulp-vragen",
  },
  {
    id: "communicatie-laag-veiligheid-laag",
    titel: "Wat niet gezegd wordt",
    voorwaarden: [{ domein: "communicatie", max: MIDDEN_LAAG }, { domein: "veiligheid", max: MIDDEN_LAAG }],
    prioriteit: 10,
    duiding: "Wanneer zowel openheid als het uitpraten van misverstanden kwetsbaar wordt ervaren, blijven verschillen vaak onder de oppervlakte. Wat niet wordt uitgesproken, wordt zelden opgelost.",
    reflectievraag: "Welk misverstand van de afgelopen maand is nooit uitgepraat?",
    experiment: "exp-onuitgesproken-punt",
    sluitUit: ["veiligheid-hoog-communicatie-laag"],
  },
  {
    id: "gelijkmatig-middenbeeld",
    titel: "Een gelijkmatig beeld",
    voorwaarden: [
      { domein: "veiligheid", min: 2.5, max: 3.49 },
      { domein: "communicatie", min: 2.5, max: 3.49 },
      { domein: "eigenaarschap", min: 2.5, max: 3.49 },
      { domein: "verbinding", min: 2.5, max: 3.49 },
      { domein: "energie", min: 2.5, max: 3.49 },
      { domein: "leiderschap", min: 2.5, max: 3.49 },
    ],
    prioriteit: 3,
    duiding: "Je scores liggen op alle domeinen dicht bij elkaar, in het middengebied. Er springt geen enkel domein uit, in geen van beide richtingen. Dan is de vraag waar je begint minder belangrijk dan de vraag of je ergens begint.",
    reflectievraag: "Welk domein zou volgens jou het meeste veranderen als er één ding beter ging?",
    experiment: "exp-kleine-verbetering",
  },
  {
    id: "breed-sterk-beeld",
    titel: "Een sterke basis om op door te bouwen",
    voorwaarden: [
      { domein: "veiligheid", min: HOOG },
      { domein: "communicatie", min: HOOG },
      { domein: "eigenaarschap", min: HOOG },
      { domein: "verbinding", min: HOOG },
      { domein: "energie", min: HOOG },
      { domein: "leiderschap", min: HOOG },
    ],
    prioriteit: 3,
    duiding: "Je ervaart op alle domeinen een relatief sterke basis. Dat maakt de vraag interessanter wat jullie doen om dat vast te houden wanneer het druk wordt of het team verandert.",
    reflectievraag: "Wat doen jullie dat goed werkt en zelden wordt benoemd?",
    experiment: "exp-benoem-wat-werkt",
  },
];

export const PATROON_IDS = COMBINATIEPATRONEN.map((p) => p.id);

/** Alle domeinen die in de voorwaarden worden genoemd. Handig voor validatie. */
export function gebruikteDomeinen() {
  const gevonden = new Set();
  COMBINATIEPATRONEN.forEach((patroon) => {
    (patroon.voorwaarden || []).forEach((v) => gevonden.add(v.domein));
    if (patroon.verschil) {
      gevonden.add(patroon.verschil.hoog);
      gevonden.add(patroon.verschil.laag);
    }
  });
  return [...gevonden];
}

export default COMBINATIEPATRONEN;
