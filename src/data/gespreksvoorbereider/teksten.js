// ─────────────────────────────────────────────────────────────────────────────
// GESPREKSVOORBEREIDER — TEKSTBLOKKEN
//
// Alle vaste zinnen van het gespreksformat, de veiligheidsroute, de tips en de
// reflectie staan hier. De samenstelling gebeurt in lib/gespreksvoorbereider/
// format.js met vaste regels; er komt geen taalmodel aan te pas.
//
// In een sjabloon staan plaatshouders tussen accolades. Ontbreekt de waarde,
// dan valt de hele zin weg in plaats van dat er een gat blijft staan.
// ─────────────────────────────────────────────────────────────────────────────

export const FORMAT_BLOKKEN = [
  {
    id: "opening",
    kop: "1. Opening",
    // {belangOpening} bevat al de aanloop, zodat er geen dubbeling ontstaat
    // wanneer het gedeelde belang zelf over samenwerking gaat.
    sjabloon: "Ik wil graag een situatie met je bespreken, omdat {belangOpening} voor mij belangrijk {belangWerkwoord}. Is dit een goed moment?",
    perSituatie: {
      "feedback-vragen": "Ik wil je graag iets vragen over hoe ik overkom, omdat {belangOpening} voor mij belangrijk {belangWerkwoord}. Heb je daar tien minuten voor?",
      "teamafspraak-evalueren": "Ik wil graag onze afspraak met je bespreken, omdat {belangOpening} voor mij belangrijk {belangWerkwoord}. Is dit een goed moment?",
      "verschil-van-inzicht": "Ik wil graag met je uitkomen op dit punt, omdat {belangOpening} voor ons allebei belangrijk {belangWerkwoord}. Heb je daar nu ruimte voor?",
      "onveilig-gedrag": "Ik wil iets met je bespreken dat mij bezighoudt, omdat {belangOpening} voor mij belangrijk {belangWerkwoord}. Is dit een goed moment?",
    },
  },
  {
    id: "waarneming",
    kop: "2. Concrete waarneming",
    sjabloon: "Wat ik zag of hoorde: {waarneming}",
    patroonZin: "Dit gebeurde op meerdere momenten, bijvoorbeeld: {voorbeelden}",
    onbekendZin: "Of dit vaker gebeurt weet ik nog niet; daarom wil ik het nu bespreken.",
    perSituatie: {
      "feedback-vragen": "Ik wil graag begrijpen welk effect mijn gedrag heeft. Concreet gaat het mij om: {feedbackvraag}",
      "teamafspraak-evalueren": "We spraken af: {afspraakOorspronkelijk} Wat ik feitelijk zie gebeuren: {afspraakFeitelijk}",
      "verschil-van-inzicht": "Waar we verschillend over denken: {waarneming} Waar we het wel over eens zijn: {verschilEens}",
      rolonduidelijkheid: "Waar ik tegenaan liep: {waarneming} Wat voor mij nog onduidelijk is: {rollenDuidelijkheid}",
    },
  },
  {
    id: "effect",
    kop: "3. Effect",
    sjabloon: "Het effect {effectLabel}: {effect}",
    extraZin: "En {effectLabelExtra}: {effectExtra}",
    // Extra zin bovenop de hoofdzin, in plaats van een vervanging ervan.
    extraPerSituatie: {
      "teamafspraak-evalueren": "Wat hielp: {afspraakHielp} Wat het lastig maakte: {afspraakBelemmerde}",
    },
  },
  {
    id: "perspectief",
    kop: "4. Perspectief van de ander",
    sjabloon: "Ik wil graag begrijpen hoe jij hiernaar kijkt. {openvraag}",
    tweedeVraagZin: "En daarna misschien: {openvraagTwee}",
    perSituatie: {
      "verschil-van-inzicht": "Ik wil graag begrijpen hoe jij hiernaar kijkt. Zelf ga ik ervan uit: {verschilEigenAanname} {openvraag}",
      "feedback-vragen": "{openvraag}",
    },
  },
  {
    id: "belang",
    kop: "5. Gezamenlijk belang",
    sjabloon: "Voor mij is het belangrijk dat we samen werken aan {belang}.",
    perSituatie: {
      "verschil-van-inzicht": "Voor mij is het belangrijk dat we samen werken aan {belang}. Een goede oplossing zou wat mij betreft moeten voldoen aan: {verschilCriteria}",
      "onveilig-gedrag": "Voor mij is het belangrijk dat we samen werken aan {belang}. En ik wil eerlijk zijn over waar voor mij de grens ligt: {grens}",
    },
  },
  {
    id: "verandering",
    kop: "6. Gewenste verandering",
    sjabloon: "Wat ik graag anders zou zien: {verbetering}",
    perSituatie: {
      "feedback-vragen": "Wat ik hoop op te halen: {verbetering}",
    },
  },
  {
    id: "afspraak",
    kop: "7. Concrete afspraak",
    sjabloon: "Mijn voorstel voor een afspraak: {verbetering} Zullen we over een paar weken samen kijken of dit werkt?",
    perSituatie: {
      "feedback-vragen": "Zou ik hier over een paar weken bij je op terug mogen komen, om te horen of je verschil merkt?",
      "teamafspraak-evalueren": "Mijn voorstel: {verbetering} Zullen we samen bepalen of we hiermee stoppen, de afspraak aanpassen of doorgaan en beter borgen? En wanneer kijken we of dat werkt?",
      rolonduidelijkheid: "Mijn voorstel: {verbetering} Kunnen we vastleggen wie hierover beslist en wie wordt geraadpleegd, en over vier weken kijken of dat werkt?",
    },
  },
];

/** Toelichting boven het samengestelde format. */
export const FORMAT_INTRO =
  "Dit is een voorbereiding en geen tekst om voor te lezen. Gebruik het als houvast: "
  + "de volgorde helpt om eerst te beschrijven, dan te luisteren en pas daarna iets af te spreken. "
  + "Zeg het vooral in je eigen woorden.";

/** De vragen van de veiligheidscheck bij onveilig gedrag. */
export const VEILIGHEIDSVRAGEN = [
  { id: "veilig", vraag: "Voel je je veilig om dit gesprek zelf te voeren?", risicoBij: "nee" },
  { id: "ernst", vraag: "Is er sprake van dreiging, discriminatie, intimidatie, agressie of mogelijk strafbaar gedrag?", risicoBij: "ja" },
  { id: "macht", vraag: "Heeft de ander formele macht over jou?", risicoBij: "ja" },
  { id: "steun", vraag: "Heb je ondersteuning nodig van een leidinggevende, HR-adviseur, vertrouwenspersoon of andere professional?", risicoBij: "ja" },
];

export const VEILIGHEID_INTRO =
  "Voordat we een voorbereiding maken, vier korte vragen. Ze bepalen of dit een gesprek is dat je "
  + "zelf kunt voeren, of dat het verstandiger is om er eerst iemand bij te betrekken.";

export const VEILIGHEID_UITKOMST = {
  veilig: {
    kop: "Je kunt dit gesprek zelf voorbereiden",
    tekst:
      "Op basis van je antwoorden lijkt dit een gesprek dat je zelf kunt aangaan. Neem de tijd voor de "
      + "voorbereiding en bedenk vooraf wat je doet als het gesprek toch onprettig verloopt.",
  },
  aandacht: {
    kop: "Betrek hier iemand bij",
    tekst:
      "Je hoeft dit gesprek niet alleen te voeren. Overweeg ondersteuning te vragen aan een leidinggevende, "
      + "HR-adviseur, vertrouwenspersoon, bedrijfsarts of een andere passende professional binnen jouw organisatie. "
      + "Je kunt hieronder wel een voorbereiding maken, en die ook gebruiken om het gesprek met die ondersteuner "
      + "te voeren.",
    vervolgstappen: [
      "Zoek uit wie binnen jouw organisatie vertrouwenspersoon is; die rol bestaat vrijwel overal.",
      "Zet de voorvallen voor jezelf op een rij met datum en context, ook als je nog niets doet.",
      "Bespreek met iemand die je vertrouwt wat je wilt bereiken, voordat je het gesprek aangaat.",
      "Vraag of iemand bij het gesprek aanwezig kan zijn.",
    ],
  },
};

export const VEILIGHEID_DISCLAIMER =
  "Deze tool geeft geen juridisch, psychologisch of arbeidsrechtelijk advies en stelt niet vast of er formeel "
  + "sprake is van pesten, intimidatie of discriminatie. Wat hier staat is een hulpmiddel bij het voorbereiden "
  + "van een gesprek, en geen oordeel over de situatie.";

export const TIPS_TIJDENS = [
  "Spreek vanuit je eigen waarneming en ervaring.",
  "Laat stiltes bestaan en vul het antwoord niet voor de ander in.",
  "Vraag door voordat je reageert.",
  "Maak onderscheid tussen bedoeling en effect.",
  "Probeer niet alles in één gesprek op te lossen.",
  "Leg een concrete afspraak en evaluatiedatum vast.",
];

export const REFLECTIE_VRAGEN = [
  { id: "waarneming", vraag: "Heb ik de concrete waarneming kunnen benoemen?" },
  { id: "geluisterd", vraag: "Heb ik werkelijk naar de ander geluisterd?" },
  { id: "nieuw", vraag: "Welk nieuw perspectief heb ik gehoord?" },
  { id: "bespreekbaar", vraag: "Wat werd wel bespreekbaar?" },
  { id: "onbesproken", vraag: "Wat bleef nog onbesproken?" },
  { id: "afspraak", vraag: "Welke afspraak hebben we gemaakt?" },
  { id: "terugkomen", vraag: "Wanneer komen we erop terug?" },
  { id: "ondersteuning", vraag: "Heb ik aanvullende ondersteuning nodig?" },
];

export const REFLECTIE_AFSLUITING = [
  { id: "voldoende", label: "Het gesprek heeft voldoende opgeleverd" },
  { id: "vervolg", label: "Er is een vervolgafspraak nodig" },
  { id: "aanpak", label: "Ik wil mijn aanpak aanpassen" },
  { id: "ondersteuning", label: "Ik heb ondersteuning nodig" },
];

export const PRIVACY_MELDING =
  "Gebruik geen namen of vertrouwelijke persoonsgegevens. Beschrijf alleen wat nodig is om het gesprek voor te bereiden.";

export const PRIVACY_UITLEG =
  "Wat je hier invult blijft op dit apparaat. Er gaat niets naar een server en er komt geen AI-dienst aan te pas: "
  + "de website zet jouw eigen woorden in een vast format. Gebruik geen namen, en ook geen medische, patiënt- of "
  + "andere bijzondere persoonsgegevens. Werk je op een gedeelde computer, wis je gegevens dan na afloop met de "
  + "knop onderaan.";

export const INTRO_UITLEG =
  "Een lastig gesprek verloopt zelden zoals je het bedacht. Wat wel helpt, is vooraf scherp krijgen wat je precies "
  + "hebt gezien, welk effect dat heeft en wat je wilt bereiken. Je beantwoordt hieronder een paar vragen, en de "
  + "website zet jouw antwoorden in een vast gespreksformat dat je kunt afdrukken of aanpassen.";

export default FORMAT_BLOKKEN;
