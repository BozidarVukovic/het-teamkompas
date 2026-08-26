// ─────────────────────────────────────────────────────────────────────────────
// GESPREKSVOORBEREIDER — SITUATIES
//
// De zes gesprekssituaties, elk met een eigen route door de stappen. De
// stapdefinities zelf staan in stappen.js; hier staat alleen welke stappen in
// welke volgorde aan bod komen en waar per situatie de nadruk op ligt.
//
// Een situatie toevoegen? Zet hem hier neer met een bestaande stapvolgorde, of
// voeg eerst een nieuwe stap toe in stappen.js.
// ─────────────────────────────────────────────────────────────────────────────

export const SITUATIES = [
  {
    id: "collega-aanspreken",
    label: "Ik wil een collega aanspreken",
    icoon: "🗣️",
    kleur: "#5A8C3C",
    uitleg: "Voor het bespreken van concreet gedrag van een collega en het effect dat dit heeft.",
    wanneer: "Gebruik deze route wanneer je concreet gedrag van een collega wilt bespreken en het effect daarvan zichtbaar wilt maken.",
    nadruk: [
      "Beschrijf gedrag, geen karakter.",
      "Ga uit van gelijkwaardigheid: je vraagt iets, je legt niets op.",
      "Benoem het effect op de samenwerking.",
      "Blijf nieuwsgierig naar wat jij nog niet weet.",
      "Sluit af met een afspraak van twee kanten.",
    ],
    stappen: ["waarneming", "patroon", "relatie", "effect", "resultaat", "belang", "openvraag", "controle"],
    kennisbank: "/kennisbank/gespreksvoorbereider/een-collega-aanspreken",
  },
  {
    id: "onveilig-gedrag",
    label: "Ik wil onveilig gedrag bespreken",
    icoon: "🛡️",
    kleur: "#E8821A",
    uitleg: "Voor gedrag dat buitensluitend, intimiderend, respectloos, kleinerend of discriminerend wordt ervaren.",
    wanneer: "Gebruik deze route wanneer gedrag als buitensluitend, intimiderend, respectloos, kleinerend, discriminerend of anderszins onveilig wordt ervaren.",
    nadruk: [
      "Jouw veiligheid gaat voor het gesprek.",
      "Houd voorbeelden feitelijk en noteer datum of context.",
      "Benoem waar voor jou een grens ligt.",
      "Weeg mee of de ander formele macht over je heeft.",
      "Je hoeft dit gesprek niet alleen te voeren.",
      "Binnen elke organisatie bestaan formele routes; die staan altijd open.",
    ],
    veiligheidscheck: true,
    stappen: ["waarneming", "patroon", "relatie", "grenzen", "effect", "resultaat", "belang", "openvraag", "controle"],
  },
  {
    id: "teamafspraak-evalueren",
    label: "Ik wil een teamafspraak evalueren",
    icoon: "📋",
    kleur: "#6B4E9E",
    uitleg: "Voor een gezamenlijke afspraak die niet werkt, niet wordt nageleefd of opnieuw besproken moet worden.",
    wanneer: "Gebruik deze route wanneer een gezamenlijke afspraak niet werkt, niet wordt nageleefd of opnieuw besproken moet worden.",
    nadruk: [
      "Begin bij de afspraak zoals die ooit is gemaakt.",
      "Onderscheid wat er is afgesproken van wat er is gebeurd.",
      "Kijk naar wat hielp en wat belemmerde, en niet naar wie in gebreke bleef.",
      "Eindig met een keuze: stoppen, aanpassen of doorgaan.",
    ],
    stappen: ["afspraak", "patroon", "relatie", "effect", "resultaat", "belang", "openvraag", "controle"],
  },
  {
    id: "rolonduidelijkheid",
    label: "Ik wil rolonduidelijkheid bespreken",
    icoon: "🧭",
    kleur: "#3A7DBF",
    uitleg: "Voor taken, bevoegdheden, verwachtingen of verantwoordelijkheden die onvoldoende duidelijk zijn.",
    wanneer: "Gebruik deze route wanneer taken, bevoegdheden, verwachtingen of verantwoordelijkheden onvoldoende duidelijk zijn.",
    nadruk: [
      "Maak onderscheid tussen uitvoeren, beslissen en geraadpleegd worden.",
      "Beschrijf één concreet moment waarop het misging.",
      "Benoem welke duidelijkheid je zelf nodig hebt.",
      "Houd er rekening mee dat het besluit soms elders ligt.",
    ],
    stappen: ["waarneming", "rollen", "relatie", "effect", "resultaat", "belang", "openvraag", "controle"],
    kennisbank: "/kennisbank/gespreksvoorbereider/rolonduidelijkheid-bespreken",
  },
  {
    id: "feedback-vragen",
    label: "Ik wil feedback vragen",
    icoon: "🪞",
    kleur: "#0F766E",
    uitleg: "Voor het onderzoeken hoe jouw eigen gedrag, communicatie of leiderschap door anderen wordt ervaren.",
    wanneer: "Gebruik deze route wanneer je actief wilt onderzoeken hoe jouw gedrag, communicatie of leiderschap door anderen wordt ervaren.",
    nadruk: [
      "Maak je vraag klein en concreet; een brede vraag levert een beleefd antwoord op.",
      "Vraag naar waarneembaar gedrag, niet naar een oordeel over jou.",
      "Luister zonder te verdedigen en vraag door.",
      "Bedank voor het antwoord, ook als het schuurt.",
      "Jij bepaalt zelf wat je met de feedback doet.",
    ],
    stappen: ["feedbackvraag", "relatie", "resultaat", "belang", "openvraag", "controle"],
    kennisbank: "/kennisbank/gespreksvoorbereider/feedback-vragen-aan-je-team",
  },
  {
    id: "verschil-van-inzicht",
    label: "Ik wil een verschil van inzicht bespreekbaar maken",
    icoon: "⚖️",
    kleur: "#5A8C3C",
    uitleg: "Voor situaties waarin jullie verschillend denken over een aanpak, beslissing, prioriteit of interpretatie.",
    wanneer: "Gebruik deze route wanneer twee mensen verschillend denken over een aanpak, beslissing, prioriteit of interpretatie.",
    nadruk: [
      "Onder een standpunt ligt meestal een belang; zoek dat eerst op.",
      "Scheid wat je weet van wat je aanneemt.",
      "Benoem waarover jullie het wel eens zijn.",
      "Spreek samen criteria af waaraan een goede oplossing voldoet.",
      "Eindig met een werkbare vervolgstap en geen definitief gelijk.",
    ],
    stappen: ["waarneming", "verschil", "relatie", "effect", "resultaat", "belang", "openvraag", "controle"],
    kennisbank: "/kennisbank/gespreksvoorbereider/verschil-van-inzicht",
  },
];

export const SITUATIE_IDS = SITUATIES.map((s) => s.id);

export function situatie(id) {
  return SITUATIES.find((s) => s.id === id) || null;
}

/** De stapvolgorde voor een situatie. Onbekende situatie geeft een lege route,
 *  zodat de interface terugvalt op de keuzepagina in plaats van te breken. */
export function stappenVoor(situatieId) {
  const gevonden = situatie(situatieId);
  return gevonden ? gevonden.stappen : [];
}

export default SITUATIES;
