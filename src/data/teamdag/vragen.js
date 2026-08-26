// Teamdag-generator: alle vragen en antwoordopties op één plek.
//
// Deze module is bewust vrij van React en van Vite-specifieke imports, zodat het
// validatiescript en de tests hem met gewoon node kunnen laden.

export const GENERATOR_VERSIE = "1.0.0";

export const ROLLEN = [
  {
    id: "teamleider",
    label: "Teamleider of manager",
    aandachtspunt: "Jouw rol beïnvloedt hoeveel ruimte teamleden ervaren om vrijuit te spreken. Maak vooraf duidelijk wanneer je deelnemer bent en wanneer je een besluit neemt.",
  },
  {
    id: "teamlid",
    label: "Teamlid",
    aandachtspunt: "Je organiseert de dag zonder formele positie. Stem vooraf met je leidinggevende af welke ruimte er is om afspraken te maken, zodat de dag niet eindigt in voorstellen die blijven liggen.",
  },
  {
    id: "hr",
    label: "HR-professional of organisatieadviseur",
    aandachtspunt: "Je kijkt van een afstand mee. Onderzoek vooraf of het team de vraag herkent, anders kan de dag overkomen als iets wat over het team wordt besloten in plaats van met het team.",
  },
  {
    id: "teamcoach",
    label: "Teamcoach of facilitator",
    aandachtspunt: "Je begeleidt het gesprek en bent zelf geen partij. Spreek vooraf af wat je doet wanneer de leidinggevende het gesprek naar zich toetrekt.",
  },
  {
    id: "projectleider",
    label: "Projectleider",
    aandachtspunt: "In een projectteam is de opdracht meestal helder en de samenwerking nieuw. Besteed meer tijd aan werkafspraken en besluitvorming dan aan onderlinge kennismaking.",
  },
  {
    id: "directie-mt",
    label: "Directie- of managementteamlid",
    aandachtspunt: "In een managementteam is ieder lid ook eigenaar van een eigen onderdeel. Benoem vooraf welke besluiten deze dag genomen kunnen worden en welke niet.",
  },
  {
    id: "anders",
    label: "Anders",
    aandachtspunt: "Maak vooraf duidelijk vanuit welke positie je de dag organiseert. Deelnemers stemmen hun openheid daarop af.",
  },
];

// `representatief` is de groepsgrootte waarop werkvormen worden getoetst: het
// zwaarste geval binnen de bandbreedte dat nog realistisch is. Een werkvorm
// moet bij die grootte werken om in het programma te mogen komen.
export const TEAMGROOTTES = [
  { id: "3-6", label: "3 tot en met 6 deelnemers", min: 3, max: 6, representatief: 6 },
  { id: "7-12", label: "7 tot en met 12 deelnemers", min: 7, max: 12, representatief: 12 },
  { id: "13-20", label: "13 tot en met 20 deelnemers", min: 13, max: 20, representatief: 20 },
  { id: "20plus", label: "Meer dan 20 deelnemers", min: 21, max: 60, representatief: 25 },
];

export const TEAMTYPES = [
  { id: "operationeel", label: "Bestaand operationeel team" },
  { id: "nieuw", label: "Nieuw team" },
  { id: "samengevoegd", label: "Recent samengevoegd team" },
  { id: "mt", label: "Managementteam" },
  { id: "project", label: "Projectteam" },
  { id: "zelfstandigen", label: "Team van zelfstandige professionals" },
  { id: "multidisciplinair", label: "Multidisciplinair team" },
  { id: "anders", label: "Anders" },
];

export const BESTAANSDUUR = [
  { id: "kort", label: "Korter dan drie maanden" },
  { id: "jaar", label: "Drie tot twaalf maanden" },
  { id: "lang", label: "Langer dan één jaar" },
  { id: "verandering", label: "Team bestaat al langer, maar heeft recent een grote verandering doorgemaakt" },
];

export const AFHANKELIJKHEID = [
  { id: "dagelijks", label: "Teamleden hebben elkaar dagelijks nodig", niveau: 3 },
  { id: "regelmatig", label: "Teamleden werken regelmatig samen", niveau: 2 },
  { id: "manager", label: "Teamleden delen vooral een manager of afdeling", niveau: 1 },
  { id: "onduidelijk", label: "Het is nog onduidelijk waarvoor teamleden elkaar nodig hebben", niveau: 0 },
];

// `spoor` verwijst naar een programmaspoor in sporen.js. Meerdere aanleidingen
// mogen naar hetzelfde spoor wijzen.
export const AANLEIDINGEN = [
  { id: "nieuw-team", label: "Het team is nieuw of opnieuw samengesteld", spoor: "nieuw-team" },
  { id: "samenwerking-vast", label: "De samenwerking loopt vast", spoor: "patroon-onderzoeken" },
  { id: "rollen-onduidelijk", label: "Rollen en verantwoordelijkheden zijn onduidelijk", spoor: "rolhelderheid" },
  { id: "niet-aanspreken", label: "We spreken elkaar onvoldoende aan", spoor: "aanspreekbaarheid" },
  { id: "spanning", label: "Er is spanning of conflict", spoor: "spanning" },
  { id: "niet-vrij", label: "Niet iedereen voelt zich vrij om zich uit te spreken", spoor: "veiligheid" },
  { id: "afspraken", label: "Afspraken worden onvoldoende nagekomen", spoor: "aanspreekbaarheid" },
  { id: "veel-overleg", label: "We overleggen veel, maar besluiten weinig", spoor: "besluitvorming" },
  { id: "geen-doel", label: "Het team mist een gezamenlijk doel", spoor: "gezamenlijk-doel" },
  { id: "verandering", label: "We staan voor een verandering", spoor: "verandering" },
  { id: "werkdruk", label: "Werkdruk en energie vragen aandacht", spoor: "energie" },
  { id: "eigenaarschap", label: "We willen meer eigenaarschap", spoor: "eigenaarschap" },
  { id: "kwaliteiten", label: "We benutten elkaars kwaliteiten onvoldoende", spoor: "kwaliteiten" },
  { id: "terugkijken", label: "We willen terugkijken en leren", spoor: "leren" },
  { id: "groeien", label: "De samenwerking gaat goed en we willen verder groeien", spoor: "groei" },
  { id: "verbinding", label: "We willen vooral verbinding en ontmoeting", spoor: "verbinding" },
  { id: "opdracht", label: "Er is een concrete opdracht van de organisatie", spoor: "gezamenlijk-doel" },
  { id: "anders", label: "Anders", spoor: "patroon-onderzoeken" },
];

export const MAX_AANLEIDINGEN = 3;
export const MAX_RESULTATEN = 2;

// `blokDoel` koppelt een gewenst resultaat aan het type blok dat minimaal in het
// programma hoort te zitten. De selectielogica gebruikt dat als harde eis.
export const RESULTATEN = [
  { id: "begrijpen", label: "We begrijpen beter wat er in de samenwerking speelt", spoor: "patroon-onderzoeken", blokDoel: "diagnose" },
  { id: "doel", label: "We hebben een gezamenlijk doel geformuleerd", spoor: "gezamenlijk-doel", blokDoel: "richting" },
  { id: "rollen", label: "Rollen en verantwoordelijkheden zijn duidelijker", spoor: "rolhelderheid", blokDoel: "rollen" },
  { id: "afspraken", label: "We hebben duidelijke teamafspraken gemaakt", spoor: "aanspreekbaarheid", blokDoel: "afspraken" },
  { id: "verschillen", label: "We kunnen verschillen beter bespreekbaar maken", spoor: "veiligheid", blokDoel: "bespreekbaar" },
  { id: "kwaliteiten", label: "We hebben meer inzicht in elkaars kwaliteiten", spoor: "kwaliteiten", blokDoel: "kwaliteiten" },
  { id: "verandering", label: "We begrijpen de verandering en onze invloed daarop", spoor: "verandering", blokDoel: "verandering" },
  { id: "experimenten", label: "We hebben één of twee concrete verbeterexperimenten gekozen", spoor: "leren", blokDoel: "experiment" },
  { id: "besluiten", label: "Onze overleg- en besluitvorming is duidelijker", spoor: "besluitvorming", blokDoel: "besluiten" },
  { id: "spanning", label: "We hebben spanning of frustratie zorgvuldig onderzocht", spoor: "spanning", blokDoel: "spanning" },
  { id: "lessen", label: "We hebben teruggekeken en belangrijke lessen bepaald", spoor: "leren", blokDoel: "terugblik" },
  { id: "kennen", label: "We hebben elkaar beter leren kennen", spoor: "verbinding", blokDoel: "kennismaking" },
  { id: "actieplan", label: "We hebben een concreet actieplan met eigenaren en data", spoor: "eigenaarschap", blokDoel: "afspraken" },
  { id: "wel-geen-team", label: "We hebben bepaald waarvoor we wel en geen team hoeven te zijn", spoor: "gezamenlijk-doel", blokDoel: "richting" },
];

export const ZICHTBAAR_VOORBEELDEN = [
  "In het overleg wordt minstens één keer een punt benoemd dat eerder op de gang bleef.",
  "Bij ieder besluit staat genoteerd wie het uitvoert en wanneer het af is.",
  "Twee mensen hebben een gesprek gevoerd dat ze eerder uitstelden.",
  "Er ligt één afspraak die iedereen kan navertellen zonder het document erbij.",
  "Het team weet van elkaar wie waarvoor eerste aanspreekpunt is.",
  "Er loopt één klein experiment waar het team elkaar aan herinnert.",
  "Nieuwe collega's krijgen hetzelfde antwoord op de vraag waar dit team voor is.",
  "Er is één taak, overleg of handeling geschrapt of vereenvoudigd.",
];

// De veiligheidsvragen wegen twee kanten op: `risicoBij` leidt tot de
// veiligheidsroute, `twijfelBij` alleen tot een aandachtspunt en een lagere
// beschikbare veiligheidsruimte voor werkvormen.
export const VEILIGHEIDSVRAGEN = [
  { id: "vrij-spreken", vraag: "Voelen teamleden zich doorgaans vrij om hun mening te geven?", risicoBij: ["nee"], twijfelBij: ["gedeeltelijk", "weet-niet"] },
  { id: "conflict", vraag: "Is er momenteel sprake van een openlijk conflict?", risicoBij: ["ja"], twijfelBij: ["gedeeltelijk"] },
  { id: "onveilig-gedrag", vraag: "Zijn er signalen van pesten, intimidatie, discriminatie of buitensluiten?", risicoBij: ["ja", "gedeeltelijk"], twijfelBij: ["weet-niet"] },
  { id: "gebeurtenissen", vraag: "Zijn er recente gebeurtenissen die veel emoties of onzekerheid oproepen?", risicoBij: [], twijfelBij: ["ja", "gedeeltelijk"] },
  { id: "afspraken-vertrouwen", vraag: "Vertrouwen teamleden erop dat gemaakte afspraken worden opgevolgd?", risicoBij: [], twijfelBij: ["nee", "gedeeltelijk"] },
  { id: "leidinggevende", vraag: "Is de leidinggevende zelf onderdeel van de spanning?", risicoBij: [], twijfelBij: ["ja", "gedeeltelijk", "weet-niet"] },
];

export const VEILIGHEID_OPTIES = [
  { id: "ja", label: "Ja" },
  { id: "gedeeltelijk", label: "Gedeeltelijk" },
  { id: "nee", label: "Nee" },
  { id: "weet-niet", label: "Weet ik niet" },
];

export const TIJDSOPTIES = [
  { id: "90m", label: "90 minuten", minuten: 90, buffer: 10, pauzeAdvies: false },
  { id: "2u", label: "2 uur", minuten: 120, buffer: 10, pauzeAdvies: false },
  { id: "dagdeel-3-5", label: "Een dagdeel van 3,5 uur", minuten: 210, buffer: 10, pauzeAdvies: true },
  { id: "dagdeel-4", label: "Een dagdeel van 4 uur", minuten: 240, buffer: 10, pauzeAdvies: true },
  { id: "dag-6", label: "Een volledige dag van ongeveer 6 uur exclusief lunch", minuten: 360, buffer: 20, pauzeAdvies: true },
  { id: "dag-7", label: "Een volledige dag van ongeveer 7 uur inclusief lunch", minuten: 420, buffer: 20, pauzeAdvies: true, lunch: 45 },
];

export const PAUZEKEUZE = [
  { id: "ja", label: "Ja, plan een pauze in" },
  { id: "nee", label: "Nee, dat is niet nodig" },
];

export const SETTINGS = [
  { id: "fysiek", label: "Fysiek op één locatie" },
  { id: "online", label: "Online" },
  { id: "hybride", label: "Hybride: een deel op locatie, een deel online" },
];

export const RUIMTEOPTIES = [
  { id: "ja", label: "Ja, er is een geschikte ruimte" },
  { id: "beperkt", label: "Er is een ruimte, maar zonder wanden of flip-overs" },
  { id: "nee", label: "Nog niet geregeld" },
];

export const AANWEZIGHEID = [
  { id: "iedereen", label: "Iedereen kan de hele tijd aanwezig zijn" },
  { id: "wisselend", label: "Er is ploegendienst of wisselende aanwezigheid" },
];

export const WERKWIJZEN = [
  { id: "individueel", label: "Individueel reflecteren" },
  { id: "tweetallen", label: "Gesprekken in tweetallen" },
  { id: "subgroepen", label: "Kleine groepen" },
  { id: "plenair", label: "Plenair gesprek" },
  { id: "oefening", label: "Praktische oefening" },
  { id: "canvas", label: "Visueel werken met een canvas" },
  { id: "scan", label: "Werken met teamscanresultaten" },
  { id: "casus", label: "Werken met een concrete casus" },
  { id: "acties", label: "Afspraken en acties formuleren" },
  { id: "actief", label: "Energieke of actieve werkvorm" },
  { id: "rustig", label: "Rustige en verdiepende werkvorm" },
  { id: "geen", label: "Geen voorkeur" },
];

export const ERVARING = [
  { id: "weinig", label: "Weinig of geen ervaring", maxNiveau: 1 },
  { id: "enige", label: "Enige ervaring", maxNiveau: 2 },
  { id: "veel", label: "Veel ervaring", maxNiveau: 3 },
];

export const OPVOLGING = [
  { id: "geen", label: "Geen structurele opvolging", maxActies: 1, maxExperimenten: 1 },
  { id: "een-moment", label: "Eén evaluatiemoment", maxActies: 2, maxExperimenten: 1 },
  { id: "dertig-dagen", label: "Korte opvolging gedurende dertig dagen", maxActies: 3, maxExperimenten: 2 },
  { id: "maandelijks", label: "Maandelijkse opvolging", maxActies: 3, maxExperimenten: 2 },
  { id: "coach", label: "Begeleiding door een coach of facilitator", maxActies: 3, maxExperimenten: 2 },
  { id: "onbekend", label: "Nog onbekend", maxActies: 2, maxExperimenten: 1 },
];

// De acht fasen van de beslisboom. Ze bepalen de indeling van de
// voortgangsindicator; de gebruiker beantwoordt binnen een fase één vraag per
// scherm.
export const STAPPEN = [
  { id: "rol", nummer: 1, titel: "Jouw rol", kort: "Rol" },
  { id: "team", nummer: 2, titel: "Het team", kort: "Team" },
  { id: "aanleiding", nummer: 3, titel: "De aanleiding", kort: "Aanleiding" },
  { id: "resultaat", nummer: 4, titel: "Het gewenste resultaat", kort: "Resultaat" },
  { id: "veiligheid", nummer: 5, titel: "Veiligheid en spanning", kort: "Veiligheid" },
  { id: "tijd", nummer: 6, titel: "Tijd en vorm", kort: "Tijd" },
  { id: "werkwijze", nummer: 7, titel: "Manier van werken", kort: "Werkwijze" },
  { id: "borging", nummer: 8, titel: "Borging", kort: "Borging" },
];

// Eén vraag per scherm. Iedere vraag staat hier los, zodat de wizard er
// doorheen loopt zonder dat er ergens een scherm met vier vragen tegelijk
// ontstaat.
//
// Velden per vraag:
//   id          uniek
//   fase        id uit STAPPEN, bepaalt waar je in de voortgang staat
//   veld        sleutel in het antwoordobject
//   groep       optioneel: antwoord komt in een subobject (alleen veiligheid)
//   type        enkel | meer | tekst
//   kop         de vraag zelf
//   uitleg      optionele toelichting onder de vraag
//   opties      lijst met antwoordopties (bij enkel en meer)
//   max         maximumaantal keuzes (bij meer)
//   optioneel   deze vraag mag worden overgeslagen
//   kolommen    true: korte opties naast elkaar in twee kolommen
//   breed       true: bredere kolom met twee kolommen antwoorden, voor lange lijsten
//   compact     true: minder ruimte per antwoord, voor lijsten met lange zinnen
export const VRAGEN = [
  {
    id: "rol",
    fase: "rol",
    veld: "rol",
    type: "enkel",
    kop: "Vanuit welke rol organiseer je deze teamdag?",
    uitleg: "We gebruiken je rol om de aandachtspunten bij het programma aan te passen.",
    opties: ROLLEN,
  },
  {
    id: "teamgrootte",
    fase: "team",
    veld: "teamgrootte",
    type: "enkel",
    kop: "Hoeveel mensen doen er mee?",
    uitleg: "De groepsgrootte bepaalt welke werkvormen werken. Wat plenair kan bij acht mensen, werkt bij vijfentwintig niet meer.",
    opties: TEAMGROOTTES,
    kolommen: true,
  },
  {
    id: "teamtype",
    fase: "team",
    veld: "teamtype",
    type: "enkel",
    kop: "Wat voor team is het?",
    opties: TEAMTYPES,
    kolommen: true,
  },
  {
    id: "bestaansduur",
    fase: "team",
    veld: "bestaansduur",
    type: "enkel",
    kop: "Hoe lang bestaat het team in deze samenstelling?",
    opties: BESTAANSDUUR,
  },
  {
    id: "afhankelijkheid",
    fase: "team",
    veld: "afhankelijkheid",
    type: "enkel",
    kop: "Hoe afhankelijk zijn teamleden van elkaar?",
    uitleg: "Hier valt of staat de opzet mee. Een groep die vooral een manager deelt, heeft een ander programma nodig dan een team dat elkaar dagelijks nodig heeft.",
    opties: AFHANKELIJKHEID,
  },
  {
    id: "aanleidingen",
    fase: "aanleiding",
    veld: "aanleidingen",
    type: "meer",
    kop: "Waarom wil je juist nu een teamdag organiseren?",
    uitleg: "Kies er maximaal drie. Je eerste keuze weegt het zwaarst.",
    opties: AANLEIDINGEN,
    max: MAX_AANLEIDINGEN,
    breed: true,
  },
  {
    id: "toelichting",
    fase: "aanleiding",
    veld: "toelichting",
    type: "tekst",
    kop: "Wil je dat kort toelichten?",
    uitleg: "Deze tekst bepaalt het programma niet. Hij komt alleen terug in je eigen overzicht, zodat je later weet waar het om ging.",
    plaatshouder: "Bijvoorbeeld: sinds de reorganisatie zijn de overleggen korter en stiller geworden.",
    optioneel: true,
    maxLengte: 400,
  },
  {
    id: "resultaten",
    fase: "resultaat",
    veld: "resultaten",
    type: "meer",
    kop: "Wat moet aan het einde van de dag anders of duidelijker zijn?",
    uitleg: "Kies er maximaal twee. Het eerste doel bepaalt de opbouw van het programma.",
    opties: RESULTATEN,
    max: MAX_RESULTATEN,
    breed: true,
  },
  {
    id: "zichtbaar",
    fase: "resultaat",
    veld: "zichtbaar",
    type: "enkel",
    kop: "Wat zou twee weken later zichtbaar anders moeten zijn?",
    uitleg: "Kies wat het dichtst in de buurt komt. Hierdoor wordt het doel toetsbaar in plaats van een voornemen.",
    opties: ZICHTBAAR_VOORBEELDEN.map((z) => ({ id: z, label: z })),
    compact: true,
  },
  {
    id: "zichtbaar-eigen",
    fase: "resultaat",
    veld: "zichtbaarEigen",
    type: "tekst",
    kop: "Of formuleer het in je eigen woorden",
    plaatshouder: "Waaraan zou een buitenstaander merken dat de dag iets heeft opgeleverd?",
    optioneel: true,
    maxLengte: 240,
  },
  ...VEILIGHEIDSVRAGEN.map((v, i) => ({
    id: `veiligheid-${v.id}`,
    fase: "veiligheid",
    veld: v.id,
    groep: "veiligheid",
    type: "enkel",
    kop: v.vraag,
    uitleg: i === 0
      ? "Deze vragen bepalen welke werkvormen passen. We stellen niets vast over jouw team; we kijken alleen of een gezamenlijke dag nu een verstandige eerste stap is."
      : undefined,
    opties: VEILIGHEID_OPTIES,
    kolommen: true,
  })),
  {
    id: "tijd",
    fase: "tijd",
    veld: "tijd",
    type: "enkel",
    kop: "Hoeveel tijd is er beschikbaar?",
    uitleg: "Het programma vult precies deze tijd, met ruimte voor uitloop.",
    opties: TIJDSOPTIES,
  },
  {
    id: "pauze",
    fase: "tijd",
    veld: "pauze",
    type: "enkel",
    kop: "Wil je een pauze in het programma?",
    opties: PAUZEKEUZE,
    kolommen: true,
  },
  {
    id: "setting",
    fase: "tijd",
    veld: "setting",
    type: "enkel",
    kop: "Waar vindt de bijeenkomst plaats?",
    opties: SETTINGS,
  },
  {
    id: "ruimte",
    fase: "tijd",
    veld: "ruimte",
    type: "enkel",
    kop: "Is er een geschikte ruimte?",
    uitleg: "De indeling van de zaal bepaalt meer van het programma dan de meeste organisatoren verwachten.",
    opties: RUIMTEOPTIES,
  },
  {
    id: "aanwezigheid",
    fase: "tijd",
    veld: "aanwezigheid",
    type: "enkel",
    kop: "Kan iedereen de hele tijd aanwezig zijn?",
    opties: AANWEZIGHEID,
  },
  {
    id: "werkwijzen",
    fase: "werkwijze",
    veld: "werkwijzen",
    type: "meer",
    kop: "Hoe wil je tijdens de teamdag werken?",
    uitleg: "Meerdere keuzes zijn mogelijk. Weet je het nog niet, kies dan geen voorkeur.",
    opties: WERKWIJZEN,
    breed: true,
  },
  {
    id: "ervaring",
    fase: "werkwijze",
    veld: "ervaring",
    type: "enkel",
    kop: "Hoeveel ervaring heeft het team met teamdagen?",
    uitleg: "Bij weinig ervaring kiezen we laagdrempelige werkvormen die weinig uitleg vragen.",
    opties: ERVARING,
  },
  {
    id: "opvolging",
    fase: "borging",
    veld: "opvolging",
    type: "enkel",
    kop: "Hoeveel ruimte is er na de teamdag voor opvolging?",
    uitleg: "Is er weinig ruimte, dan houden we het bij één afspraak of één klein experiment. Meer overleeft de terugkeer naar de dagelijkse drukte niet.",
    opties: OPVOLGING,
  },
];

/** Het volgnummer van een fase, gebruikt door de voortgangsindicator. */
export function faseVan(vraag) {
  return STAPPEN.find((s) => s.id === (vraag && vraag.fase)) || STAPPEN[0];
}

/** Is deze vraag beantwoord? */
export function vraagBeantwoord(vraag, antwoorden = {}) {
  if (!vraag) return false;
  if (vraag.optioneel) return true;
  const waarde = vraag.groep
    ? (antwoorden[vraag.groep] || {})[vraag.veld]
    : antwoorden[vraag.veld];
  if (vraag.type === "meer") return Array.isArray(waarde) && waarde.length > 0;
  return typeof waarde === "string" && waarde.length > 0;
}

/** Kleine hulpfunctie: zoek een optie op id binnen een lijst. */
export function optie(lijst, id) {
  return lijst.find((o) => o.id === id) || null;
}
