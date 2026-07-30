// Versieerbare, deterministische inhoud voor de individuele perceptiescan.
//
// 1.1.0: vier omgekeerde vragen toegevoegd (tegen instemmingsneiging), dubbel
// ontkennende en dubbelloopse formuleringen herschreven, dubbel gebruikte
// bronvraag opgelost en twee items van individueel naar teamniveau gebracht.
// Let op: deze versie moet gelijk blijven aan FREE_SCAN_VERSION in
// functions/index.js, anders weigert de server inzendingen.
export const FREE_SCAN_VERSION = "1.1.0";
export const SCORE_MODEL_VERSION = "1.1.0";

export const FREE_SCAN_SCALE = [
  { value: 1, label: "Helemaal oneens" }, { value: 2, label: "Oneens" },
  { value: 3, label: "Neutraal" }, { value: 4, label: "Eens" },
  { value: 5, label: "Helemaal eens" },
];

// Per domein: korte omschrijving, inhoudelijke achtergrond, wat een hoge of lage
// score kan betekenen, een reflectievraag, een klein experiment en een verwijzing
// naar de bijbehorende kennispagina. Deze velden voeden het persoonlijke rapport.
// De server bewaart alleen score, zone, label, description, reflection en
// experiment; de rest wordt in het rapport uit dit bestand aangevuld.
export const FREE_SCAN_THEMES = [
  {
    id: "veiligheid", label: "Psychologische veiligheid", color: "#5A8C3C",
    description: "Ruimte om zorgen, fouten en verschil uit te spreken.",
    theory: "Onderzoek van Amy Edmondson laat zien dat teams beter presteren wanneer mensen het gevoel hebben dat ze een fout kunnen toegeven of een afwijkende mening kunnen geven zonder daarop afgerekend te worden. Veiligheid is daarbij geen kwestie van gezelligheid, maar van de vraag of het risico om je uit te spreken klein genoeg voelt.",
    whenHigh: "Je lijkt ruimte te ervaren om te zeggen wat je denkt. Dat is een sterke basis, en het is de moeite waard om te onderzoeken of collega's die ruimte ook zo ervaren.",
    whenLow: "Je antwoorden kunnen erop wijzen dat je inschat wat wel en niet gezegd kan worden. Dat kost aandacht die niet naar het werk gaat, en het houdt informatie uit gesprekken waar besluiten vallen.",
    reflection: "Welk gesprek stel jij uit omdat de ruimte nog niet veilig genoeg voelt?",
    experiment: "Vraag aan het einde van één overleg: welk belangrijk punt is nog niet uitgesproken?",
    knowledge: { label: "Psychologische veiligheid", href: "/psychologische-veiligheid" },
  },
  {
    id: "communicatie", label: "Communicatie en luisteren", color: "#0F766E",
    description: "Elkaar begrijpen en misverstanden constructief bespreken.",
    theory: "Veel wrijving in teams ontstaat niet door onwil, maar doordat mensen elkaars gedrag zelf van betekenis voorzien. Wat onduidelijk blijft, vullen we in. Zodra die aanname als feit gaat voelen, gaat het gesprek over de ander in plaats van over de zaak.",
    whenHigh: "Je lijkt te ervaren dat misverstanden bespreekbaar zijn. Dat maakt een team veerkrachtig, omdat verschil dan geen conflict hoeft te worden.",
    whenLow: "Je antwoorden kunnen wijzen op gesprekken die blijven hangen of informatie die je laat bereikt. Vaak zit de kern in wat wel gevoeld maar niet gezegd wordt.",
    reflection: "Wanneer voelde jij je voor het laatst echt gehoord in je team?",
    experiment: "Vat in één overleg eerst het standpunt van een ander samen voordat je reageert.",
    knowledge: { label: "Boven- en onderstroom", href: "/boven-en-onderstroom" },
  },
  {
    id: "eigenaarschap", label: "Eigenaarschap en duidelijkheid", color: "#3A7DBF",
    description: "Weten wat wordt verwacht en verbeteringen daadwerkelijk oppakken.",
    theory: "De zelfdeterminatietheorie beschrijft autonomie, competentie en verbondenheid als voorwaarden voor motivatie. Eigenaarschap komt zelden op gang door er vaker om te vragen; het ontstaat waar verantwoordelijkheid en invloed bij elkaar horen. Verantwoordelijkheid zonder invloed put mensen langzaam uit.",
    whenHigh: "Je lijkt ruimte te ervaren om verbeteringen op te pakken en er vertrouwen in te hebben dat het ergens landt.",
    whenLow: "Je antwoorden kunnen erop wijzen dat besluiten blijven liggen of dat onduidelijk is wie de volgende stap zet. Dat kost mentale energie, ook wanneer de hoeveelheid werk meevalt.",
    reflection: "Bij welk besluit is nu niet helder wie de volgende stap zet?",
    experiment: "Leg bij één besluit eigenaar, eerstvolgende stap en evaluatiedatum vast.",
    knowledge: { label: "Eigenaarschap in teams", href: "/kennis/eigenaarschap-in-teams" },
  },
  {
    id: "verbinding", label: "Samenwerking en verbinding", color: "#6B4E9E",
    description: "Steun, respect voor verschillen en gezamenlijke betrokkenheid.",
    theory: "Sociale steun is een van de sterkste hulpbronnen in het werk: het verzacht de belasting van hoge taakeisen. Wat een team draagt zit meestal in het gedrag dat mensen bij elkaar zien, en dat gedrag vormt op termijn de teamcultuur.",
    whenHigh: "Je lijkt te kunnen terugvallen op collega's. Dat maakt drukke periodes beter hanteerbaar.",
    whenLow: "Je antwoorden kunnen wijzen op samenwerking die vooral naast elkaar plaatsvindt in plaats van met elkaar, of op steun die wegvalt zodra het druk wordt.",
    reflection: "Welk verschil in stijl kan jullie samenwerking juist sterker maken?",
    experiment: "Vraag één collega welke steun die deze week van jou nodig heeft.",
    knowledge: { label: "Teamcultuur", href: "/kennis/teamcultuur" },
  },
  {
    id: "energie", label: "Energie en motivatie", color: "#E8821A",
    description: "Voldoening, haalbare belasting en ruimte voor herstel.",
    theory: "Het Job Demands-Resources-model laat zien dat mensen veel taakeisen aankunnen zolang daar voldoende hulpbronnen tegenover staan, zoals invloed, steun, duidelijkheid en herstel. Problemen ontstaan vooral wanneer de eisen lang hoog blijven terwijl die hulpbronnen achterblijven.",
    whenHigh: "Je lijkt voldoening uit je werk te halen en de belasting hanteerbaar te vinden.",
    whenLow: "Je antwoorden kunnen erop wijzen dat het werk meer kost dan het teruggeeft. Dat zegt zelden iets over motivatie, en vaker iets over hoe het werk is ingericht.",
    reflection: "Wat is het kleinste terugkerende energielek dat je kunt beïnvloeden?",
    experiment: "Benoem in een check-in één energiegever en één beïnvloedbaar energielek.",
    knowledge: { label: "Bevlogenheid en het JD-R-model", href: "/kennis/bevlogenheid-in-het-werk" },
  },
  {
    id: "leiderschap", label: "Leiderschap en beweging", color: "#8B5CF6",
    description: "Open dialoog, richting en ruimte om te leren en bewegen.",
    theory: "Gedrag verandert zelden doordat mensen een verandering begrijpen. Het verandert doordat ze zich veilig genoeg voelen om iets nieuws te proberen. Leiderschap dat beweging op gang brengt geeft daarom duidelijke kaders én ruimte daarbinnen, in plaats van precies voor te schrijven hoe het moet.",
    whenHigh: "Je lijkt richting te ervaren en ruimte om te leren. Dat is een gunstige combinatie voor verandering.",
    whenLow: "Je antwoorden kunnen wijzen op onduidelijkheid over het waarom van veranderingen, of op weinig aandacht voor wat die veranderingen met mensen doen.",
    reflection: "Waar helpt meer richting, en waar helpt juist meer ruimte?",
    experiment: "Vraag bij één verandering expliciet wat mensen nodig hebben om mee te bewegen.",
    knowledge: { label: "Verandermanagement", href: "/kennis/verandermanagement" },
  },
];

// Vaste rapportteksten: uitleg over de schaal, de zones en de grenzen van deze scan.
export const REPORT_META = {
  version: "2.0.0",
  scale: "Elke vraag is beantwoord op een vijfpuntsschaal. Per domein is het gemiddelde omgerekend naar een score van 0 tot 100. Vier vragen staan omgekeerd geformuleerd; daar is een hoge instemming juist ongunstig en wordt de score gespiegeld.",
  zones: [
    { id: "strong", label: "Sterke basis", range: "75 tot 100", text: "Je ervaart dit domein overwegend positief. Benoem het expliciet, want wat goed werkt blijft vaak onbesproken." },
    { id: "attention", label: "Aandacht en verdieping", range: "55 tot 74", text: "Er is een redelijke basis met ruimte voor verbetering. Dit domein is meestal het meest beïnvloedbaar op korte termijn." },
    { id: "pattern", label: "Mogelijk belemmerend patroon", range: "0 tot 54", text: "Dit domein vraagt aandacht. Eén lage score is geen diagnose, maar wel een goede reden voor een gesprek." },
  ],
  limits: [
    ["Dit is één perspectief", "De uitkomst beschrijft hoe jij de samenwerking ervaart. Collega's kunnen dezelfde situatie anders zien, en dat verschil is vaak de meest waardevolle informatie."],
    ["Geen diagnose of beoordeling", "De scores zijn een gespreksinstrument, geen meting van de kwaliteit van je team en geen beoordeling van personen."],
    ["Gebaseerd op inzichten, niet genormeerd", "De domeinen sluiten aan op onderzoek naar teamfunctioneren. Er zijn geen normgroepen of benchmarkcijfers, dus vergelijk je score niet met een gemiddelde."],
  ],
  horizon: [
    ["Eerste twee weken", "Bespreek dit beeld met één collega of je leidinggevende. Kies samen één domein waar je mee begint."],
    ["Dertig dagen", "Voer het kleine experiment uit bij het domein met de laagste score. Houd bij wat je merkt."],
    ["Negentig dagen", "Kijk terug: wat is er veranderd, wat bleef hetzelfde? Overweeg de scan opnieuw te doen of met het hele team te meten."],
  ],
};

// Formuleringen zijn afgeleid van de bestaande medewerkersscan (sourceId) of
// nieuw geformuleerd voor deze scan (sourceId null).
//
// `reverse: true` betekent dat een hoge score juist ongunstig is; de scoring
// draait de waarde om (6 - antwoord). Vier van de 24 vragen staan omgekeerd,
// zodat iemand die alles klakkeloos op "eens" zet geen vals positief beeld
// krijgt. Deze omkering gebeurt óók server-side; houd beide in sync.
const q = (id, theme, text, sourceId, reverse = false) => ({ id, theme, text, sourceId, reverse });

export const FREE_SCAN_QUESTIONS = [
  q("v1","veiligheid","Ik voel me veilig om mijn mening te geven.",1006),
  q("v2","veiligheid","Ik durf fouten of twijfels te bespreken.",1007),
  q("v3","veiligheid","Ik houd mijn mening weleens voor me om gedoe te voorkomen.",null,true),
  q("v4","veiligheid","Belangrijke zorgen worden in mijn team open besproken.",1003),

  q("c1","communicatie","Ik voel me begrepen door mijn collega’s.",1001),
  q("c2","communicatie","Verschillen in werkstijl en communicatie worden gerespecteerd.",1002),
  q("c3","communicatie","Als er een misverstand ontstaat, praten we het uit.",null),
  q("c4","communicatie","Belangrijke informatie bereikt mij vaak te laat.",null,true),

  q("e1","eigenaarschap","Ik voel eigenaarschap over verbeteringen in mijn werk.",1023),
  q("e2","eigenaarschap","Ik heb vertrouwen dat verbeteringen ook echt worden opgepakt.",1028),
  q("e3","eigenaarschap","Besluiten blijven bij ons vaak liggen zonder duidelijke eigenaar.",null,true),
  q("e4","eigenaarschap","Initiatief nemen wordt in mijn team aangemoedigd.",1009),

  q("s1","verbinding","Ik ervaar voldoende ruimte om mijn werk op mijn eigen manier te doen.",1020),
  q("s2","verbinding","Ik voel me betrokken bij veranderingen binnen mijn team.",1027),
  q("s3","verbinding","Ik vertrouw erop dat collega’s mij steunen als het nodig is.",4),
  q("s4","verbinding","In ons team helpen mensen elkaar ook wanneer het druk is.",18),

  q("n1","energie","Mijn werk geeft mij meer energie dan het kost.",1017),
  q("n2","energie","Ik haal voldoening uit mijn werk.",1018),
  q("n3","energie","Frustraties in het dagelijks werk worden serieus genomen.",1019),
  q("n4","energie","Aan het einde van de werkweek ben ik vaak leeg.",13,true),

  q("l1","leiderschap","Mijn leidinggevende nodigt uit tot openheid en dialoog.",1008),
  q("l2","leiderschap","Veranderingen worden duidelijk en begrijpelijk uitgelegd.",1012),
  q("l3","leiderschap","Mijn zorgen of gevoelens bij verandering krijgen aandacht.",1014),
  q("l4","leiderschap","Leren en experimenteren wordt aangemoedigd.",1024),
];

// Ids van omgekeerd gescoorde vragen. Gespiegeld in functions/index.js.
export const FREE_SCAN_REVERSED = FREE_SCAN_QUESTIONS.filter((item) => item.reverse).map((item) => item.id);

export const SCORE_ZONES = [
  { min: 75, id: "strong", label: "Sterke basis" },
  { min: 55, id: "attention", label: "Aandacht en verdieping" },
  { min: 0, id: "pattern", label: "Mogelijk belemmerend patroon" },
];

export const PATTERN_RULES = [
  { id:"betrokken_lage_energie", when:{ high:"verbinding", low:"energie" }, title:"Betrokkenheid vraagt energie", text:"Je antwoorden kunnen wijzen op veel onderlinge betrokkenheid, terwijl de beschikbare energie onder druk staat." },
  { id:"veilig_weinig_eigenaarschap", when:{ high:"veiligheid", low:"eigenaarschap" }, title:"Ruimte kan nog meer beweging krijgen", text:"Er lijkt ruimte om je uit te spreken, maar die ruimte vertaalt zich mogelijk nog niet altijd naar eigenaarschap en opvolging." },
  { id:"steun_weinig_aanspreken", when:{ high:"verbinding", low:"communicatie" }, title:"Steun en het echte gesprek", text:"Onderlinge steun lijkt aanwezig, terwijl het constructief bespreken van verschil mogelijk extra aandacht verdient." },
  { id:"richting_lage_veiligheid", when:{ high:"leiderschap", low:"veiligheid" }, title:"Richting zonder alle stemmen", text:"Richting wordt mogelijk duidelijk ervaren, maar niet iedere zorg of afwijkende mening lijkt even gemakkelijk op tafel te komen." },
  { id:"veel_praten_weinig_bewegen", when:{ high:"communicatie", low:"eigenaarschap" }, title:"Van gesprek naar opvolging", text:"Er lijkt veel basis voor gesprek, terwijl besluiten en verbeteringen mogelijk niet steeds een duidelijke eigenaar krijgen." },
];
