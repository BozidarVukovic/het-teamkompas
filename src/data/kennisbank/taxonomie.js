// ─────────────────────────────────────────────────────────────────────────────
// KENNISBANK — TAXONOMIE
//
// Eén centrale plek voor alle vaste keuzelijsten van de kenniswijzer:
// domeinen, contenttypes, rollen, tijdsindicaties, werkwijzen, tags,
// synoniemen, teamsituaties en gewenste resultaten.
//
// Deze module is bewust vrij van React en van Vite-specifieke imports, zodat
// zowel de website als het validatiescript en de tests hem kunnen inlezen.
//
// Nieuwe content toevoegen? Gebruik uitsluitend de ids uit dit bestand.
// Het validatiescript (scripts/valideer-kennisbank.mjs) waarschuwt bij een
// onbekende tag, een ontbrekend domein of een ontbrekende tijdsindicatie.
// ─────────────────────────────────────────────────────────────────────────────

/** De vier domeinen van het Teamkompas. Gedrag is het centrale domein en loopt
 *  door alle vier heen; het is daarom geen apart filter. */
export const DOMEINEN = [
  { id: "veiligheid-leiderschap", label: "Veiligheid & Leiderschap", kort: "Veiligheid", kleur: "#5A8C3C" },
  { id: "beleving-verandering", label: "Beleving van Verandering", kort: "Verandering", kleur: "#3A7DBF" },
  { id: "energie-motivatie", label: "Energie & Motivatie", kort: "Energie", kleur: "#E8821A" },
  { id: "verbeteren-leren", label: "Verbeteren & Leren", kort: "Leren", kleur: "#6B4E9E" },
];

export const DOMEIN_IDS = DOMEINEN.map((d) => d.id);

/** Contenttypes. `bucket` bepaalt de diversiteit van de aanbevelingen:
 *  van elke bucket verschijnt bij voorkeur maximaal één item in de top zes. */
export const CONTENTTYPES = [
  { id: "artikel", label: "Artikel", meervoud: "Artikelen", icoon: "📖", bucket: "verdieping", uitleg: "Achtergrond en inzicht om te begrijpen wat er speelt." },
  { id: "reflectievraag", label: "Reflectievragen", meervoud: "Reflectievragen", icoon: "🪞", bucket: "reflectie", uitleg: "Korte vragen voor jezelf of voor het gesprek." },
  { id: "werkvorm", label: "Werkvorm", meervoud: "Werkvormen", icoon: "🧩", bucket: "werkvorm", uitleg: "Een uitgeschreven werkvorm die je zelf kunt begeleiden." },
  { id: "interventie", label: "Teaminterventie", meervoud: "Teaminterventies", icoon: "🎯", bucket: "beweging", uitleg: "Een kleine, afgebakende interventie op zichtbaar gedrag." },
  { id: "experiment", label: "Experiment", meervoud: "Experimenten", icoon: "🧪", bucket: "beweging", uitleg: "Een klein experiment om nieuw gedrag te testen." },
  { id: "download", label: "Download", meervoud: "Downloads", icoon: "⬇️", bucket: "hulpmiddel", uitleg: "Canvas, kaart of stappenplan om te gebruiken." },
  { id: "gespreksvoorbereider", label: "Gespreksvoorbereider", meervoud: "Gespreksvoorbereiders", icoon: "💬", bucket: "hulpmiddel", uitleg: "Stap voor stap een lastig gesprek voorbereiden." },
  { id: "scan", label: "Scanonderdeel", meervoud: "Scanonderdelen", icoon: "📊", bucket: "meten", uitleg: "Maak met een scan zichtbaar wat er speelt." },
];

export const CONTENTTYPE_IDS = CONTENTTYPES.map((t) => t.id);
export const BUCKET_VOLGORDE = ["verdieping", "reflectie", "werkvorm", "beweging", "hulpmiddel", "meten"];

export function contenttype(id) {
  return CONTENTTYPES.find((t) => t.id === id) || CONTENTTYPES[0];
}

/** Rollen. `prioriteit` beschrijft welke contenttypes voor deze rol als eerste
 *  aan bod komen. Andere content wordt niet uitgesloten, alleen lager gescoord. */
export const ROLLEN = [
  { id: "teamlid", label: "Teamlid", prioriteit: ["reflectievraag", "gespreksvoorbereider", "artikel", "experiment"] },
  { id: "teamleider", label: "Teamleider of manager", prioriteit: ["werkvorm", "interventie", "reflectievraag", "artikel"] },
  { id: "directie-mt", label: "Directie- of managementteamlid", prioriteit: ["artikel", "interventie", "scan", "werkvorm"] },
  { id: "hr", label: "HR-professional of organisatieadviseur", prioriteit: ["artikel", "scan", "download", "interventie"] },
  { id: "teamcoach", label: "Teamcoach of facilitator", prioriteit: ["werkvorm", "download", "interventie", "artikel"] },
  { id: "projectleider", label: "Projectleider", prioriteit: ["werkvorm", "gespreksvoorbereider", "experiment", "artikel"] },
  { id: "heel-team", label: "Ik zoek iets voor het hele team", prioriteit: ["werkvorm", "interventie", "experiment", "download"] },
  { id: "anders", label: "Anders", prioriteit: [] },
];

export const ROL_IDS = ROLLEN.map((r) => r.id);

export function rol(id) {
  return ROLLEN.find((r) => r.id === id) || null;
}

/** Tijdsindicaties. `minuten` is de bovengrens die als harde filterregel geldt.
 *  `null` betekent: tijd is niet doorslaggevend, geen bovengrens. */
export const TIJDEN = [
  { id: "5", label: "Ongeveer 5 minuten", kort: "5 min", minuten: 5 },
  { id: "15", label: "Ongeveer 15 minuten", kort: "15 min", minuten: 15 },
  { id: "30", label: "Ongeveer 30 minuten", kort: "30 min", minuten: 30 },
  { id: "60", label: "Ongeveer 60 minuten", kort: "60 min", minuten: 60 },
  { id: "dagdeel", label: "Een dagdeel", kort: "Dagdeel", minuten: 240 },
  { id: "teamdag", label: "Een volledige teamdag", kort: "Teamdag", minuten: 480 },
  { id: "vrij", label: "Tijd is nu niet doorslaggevend", kort: "Geen voorkeur", minuten: null },
];

export const TIJD_IDS = TIJDEN.map((t) => t.id);

export function tijdLabel(minuten) {
  if (minuten === null || minuten === undefined) return "Geen vaste tijd";
  if (minuten <= 60) return minuten + " minuten";
  if (minuten <= 240) return "Een dagdeel";
  return "Een teamdag";
}

export function tijdBovengrens(tijdId) {
  const gevonden = TIJDEN.find((t) => t.id === tijdId);
  return gevonden ? gevonden.minuten : null;
}

/** Manieren van werken. Elk contentitem geeft aan waar het bij past. */
export const WERKWIJZEN = [
  { id: "reflecteren", label: "Reflecteren", uitleg: "Ik wil eerst zelf nadenken en begrijpen." },
  { id: "lezen", label: "Lezen", uitleg: "Ik wil meer inzicht en achtergrond." },
  { id: "bespreken", label: "Bespreken", uitleg: "Ik wil het met iemand of het team bespreken." },
  { id: "oefenen", label: "Oefenen", uitleg: "Ik wil nieuw gedrag uitproberen." },
  { id: "meten", label: "Meten", uitleg: "Ik wil zichtbaar maken wat er speelt." },
  { id: "voorbereiden", label: "Voorbereiden", uitleg: "Ik wil een gesprek, overleg of teamdag voorbereiden." },
  { id: "verbeteren", label: "Verbeteren", uitleg: "Ik wil een klein experiment starten." },
  { id: "downloaden", label: "Downloaden", uitleg: "Ik zoek een praktisch hulpmiddel." },
];

export const WERKWIJZE_IDS = WERKWIJZEN.map((w) => w.id);

/** Individueel of samen. */
export const VORMEN = [
  { id: "individueel", label: "Individueel" },
  { id: "samen", label: "Met het team" },
  { id: "beide", label: "Individueel of samen" },
];

export const NIVEAUS = [
  { id: "laag", label: "Laagdrempelig" },
  { id: "midden", label: "Vraagt oefening" },
  { id: "hoog", label: "Vraagt ervaring in begeleiden" },
];

/** De centrale taglijst. Eén hoofdtag per onderwerp; varianten staan als
 *  synoniem in SYNONIEMEN en worden nooit als aparte tag opgevoerd. */
export const TAGS = [
  { id: "aanspreekbaarheid", label: "Aanspreken" },
  { id: "psychologische-veiligheid", label: "Psychologische veiligheid" },
  { id: "vertrouwen", label: "Vertrouwen" },
  { id: "feedback", label: "Feedback" },
  { id: "rolhelderheid", label: "Rolhelderheid" },
  { id: "besluitvorming", label: "Besluitvorming" },
  { id: "overleg", label: "Overleg" },
  { id: "afspraken", label: "Afspraken" },
  { id: "werkdruk", label: "Werkdruk" },
  { id: "energie", label: "Energie" },
  { id: "bevlogenheid", label: "Bevlogenheid" },
  { id: "motivatie", label: "Motivatie" },
  { id: "eigenaarschap", label: "Eigenaarschap" },
  { id: "verandering", label: "Verandering" },
  { id: "betekenis", label: "Betekenis en zingeving" },
  { id: "teamdoel", label: "Teamdoel en richting" },
  { id: "samenwerking", label: "Samenwerking" },
  { id: "communicatie", label: "Communicatie" },
  { id: "conflict", label: "Spanning en conflict" },
  { id: "hulp-vragen", label: "Hulp vragen" },
  { id: "kwaliteiten", label: "Kwaliteiten en verschillen" },
  { id: "leren", label: "Leren en evalueren" },
  { id: "reflectie", label: "Reflectie" },
  { id: "teamvorming", label: "Teamvorming" },
  { id: "teamontwikkeling", label: "Teamontwikkeling" },
  { id: "teamdag", label: "Teamdag" },
  { id: "leiderschap", label: "Leiderschap" },
  { id: "gedrag", label: "Gedrag" },
];

export const TAG_IDS = TAGS.map((t) => t.id);

export function tagLabel(id) {
  const gevonden = TAGS.find((t) => t.id === id);
  return gevonden ? gevonden.label : id;
}

/** Handmatig woordenboek voor de zoekfunctie. Links staat wat bezoekers typen,
 *  rechts de hoofdtags waar dat woord naar verwijst. Alles in kleine letters. */
export const SYNONIEMEN = {
  aanspreken: ["aanspreekbaarheid", "feedback"],
  aanspreekcultuur: ["aanspreekbaarheid", "feedback"],
  aanspreekbaar: ["aanspreekbaarheid"],
  terugkoppeling: ["feedback"],
  kritiek: ["feedback", "aanspreekbaarheid"],
  complimenten: ["feedback"],
  taken: ["rolhelderheid", "afspraken"],
  taakverdeling: ["rolhelderheid"],
  rollen: ["rolhelderheid"],
  rolverdeling: ["rolhelderheid"],
  verantwoordelijkheden: ["rolhelderheid", "eigenaarschap"],
  raci: ["rolhelderheid", "besluitvorming"],
  conflict: ["conflict", "communicatie"],
  spanning: ["conflict"],
  ruzie: ["conflict"],
  wrijving: ["conflict"],
  meningsverschil: ["conflict", "communicatie"],
  "verschil van inzicht": ["conflict", "communicatie"],
  motivatie: ["motivatie", "energie", "bevlogenheid", "eigenaarschap"],
  demotivatie: ["motivatie", "energie"],
  bevlogenheid: ["bevlogenheid", "energie"],
  werkplezier: ["bevlogenheid", "energie"],
  vergaderen: ["overleg", "besluitvorming"],
  vergadering: ["overleg", "besluitvorming"],
  meeting: ["overleg", "besluitvorming"],
  overleggen: ["overleg", "besluitvorming"],
  besluiten: ["besluitvorming"],
  beslissen: ["besluitvorming"],
  knopen: ["besluitvorming"],
  onzekerheid: ["psychologische-veiligheid", "teamdoel", "verandering"],
  duidelijkheid: ["teamdoel", "rolhelderheid"],
  veiligheid: ["psychologische-veiligheid", "vertrouwen"],
  "sociale veiligheid": ["psychologische-veiligheid"],
  angst: ["psychologische-veiligheid", "vertrouwen"],
  zwijgen: ["psychologische-veiligheid", "aanspreekbaarheid"],
  uitspreken: ["psychologische-veiligheid", "aanspreekbaarheid"],
  vertrouwen: ["vertrouwen", "psychologische-veiligheid"],
  stress: ["werkdruk", "energie"],
  druk: ["werkdruk"],
  werkdruk: ["werkdruk", "energie"],
  burn: ["werkdruk", "energie"],
  overbelasting: ["werkdruk", "energie"],
  verzuim: ["werkdruk", "energie"],
  herstel: ["energie", "werkdruk"],
  eigenaarschap: ["eigenaarschap", "motivatie"],
  initiatief: ["eigenaarschap"],
  proactief: ["eigenaarschap"],
  verandering: ["verandering", "betekenis"],
  reorganisatie: ["verandering", "betekenis"],
  weerstand: ["verandering", "psychologische-veiligheid"],
  transitie: ["verandering"],
  fusie: ["verandering", "teamvorming"],
  visie: ["teamdoel", "betekenis"],
  richting: ["teamdoel"],
  doelen: ["teamdoel"],
  strategie: ["teamdoel", "betekenis"],
  ogsm: ["teamdoel", "besluitvorming"],
  kpi: ["teamdoel", "leren"],
  samenwerken: ["samenwerking"],
  samenwerking: ["samenwerking"],
  eilandjes: ["samenwerking", "teamdoel"],
  silo: ["samenwerking", "teamdoel"],
  communiceren: ["communicatie"],
  luisteren: ["communicatie"],
  misverstand: ["communicatie"],
  onderstroom: ["communicatie", "psychologische-veiligheid"],
  hulp: ["hulp-vragen"],
  "hulp vragen": ["hulp-vragen"],
  kwetsbaarheid: ["hulp-vragen", "psychologische-veiligheid"],
  talenten: ["kwaliteiten"],
  kwaliteiten: ["kwaliteiten"],
  sterktes: ["kwaliteiten"],
  insights: ["kwaliteiten", "communicatie"],
  diversiteit: ["kwaliteiten", "samenwerking"],
  verschillen: ["kwaliteiten", "communicatie"],
  leren: ["leren", "reflectie"],
  evalueren: ["leren", "reflectie"],
  retrospective: ["leren", "reflectie", "overleg"],
  fouten: ["leren", "psychologische-veiligheid"],
  experiment: ["leren", "teamontwikkeling"],
  experimenteren: ["leren", "teamontwikkeling"],
  reflectie: ["reflectie"],
  reflecteren: ["reflectie"],
  nieuw: ["teamvorming"],
  teambuilding: ["teamvorming", "teamdag"],
  teamvorming: ["teamvorming"],
  start: ["teamvorming"],
  teamdag: ["teamdag", "teamontwikkeling"],
  heidag: ["teamdag", "teamontwikkeling"],
  workshop: ["teamdag", "teamontwikkeling"],
  teamontwikkeling: ["teamontwikkeling"],
  leidinggeven: ["leiderschap"],
  leiderschap: ["leiderschap"],
  manager: ["leiderschap"],
  managen: ["leiderschap"],
  gedrag: ["gedrag"],
  afspraken: ["afspraken"],
  afspraak: ["afspraken"],
  nakomen: ["afspraken", "aanspreekbaarheid"],
  scan: ["teamontwikkeling", "leren"],
  meten: ["leren", "teamontwikkeling"],
  mto: ["leren", "teamontwikkeling"],
};

/** De negentien herkenbare teamsituaties uit stap 1 van de kenniswijzer. */
export const SITUATIES = [
  { id: "niet-aanspreken", kort: "elkaar aanspreken", label: "We spreken elkaar onvoldoende aan", domeinen: ["veiligheid-leiderschap"], tags: ["aanspreekbaarheid", "feedback", "afspraken"] },
  { id: "niet-uitspreken", kort: "je durven uitspreken", label: "Niet iedereen voelt zich vrij om zich uit te spreken", domeinen: ["veiligheid-leiderschap"], tags: ["psychologische-veiligheid", "vertrouwen", "aanspreekbaarheid"] },
  { id: "rollen-onduidelijk", kort: "rolduidelijkheid", label: "Rollen en verantwoordelijkheden zijn onduidelijk", domeinen: ["veiligheid-leiderschap", "verbeteren-leren"], tags: ["rolhelderheid", "eigenaarschap", "afspraken"] },
  { id: "veel-overleg-weinig-besluit", kort: "besluiten nemen", label: "We overleggen veel, maar besluiten weinig", domeinen: ["verbeteren-leren"], tags: ["besluitvorming", "overleg", "rolhelderheid"] },
  { id: "afspraken-niet-nagekomen", kort: "afspraken nakomen", label: "Afspraken worden onvoldoende nagekomen", domeinen: ["verbeteren-leren", "veiligheid-leiderschap"], tags: ["afspraken", "aanspreekbaarheid", "eigenaarschap"] },
  { id: "samenwerking-kost-energie", kort: "energie in de samenwerking", label: "De samenwerking kost veel energie", domeinen: ["energie-motivatie"], tags: ["samenwerking", "energie", "conflict"] },
  { id: "hoge-werkdruk", kort: "werkdruk", label: "De werkdruk is hoog", domeinen: ["energie-motivatie"], tags: ["werkdruk", "energie", "hulp-vragen"] },
  { id: "weinig-eigenaarschap", kort: "eigenaarschap", label: "Mensen nemen onvoldoende eigenaarschap", domeinen: ["energie-motivatie", "verbeteren-leren"], tags: ["eigenaarschap", "motivatie", "rolhelderheid"] },
  { id: "weerstand-verandering", kort: "weerstand bij verandering", label: "Er is weerstand tegen verandering", domeinen: ["beleving-verandering"], tags: ["verandering", "betekenis", "communicatie"] },
  { id: "richting-onduidelijk", kort: "richting en doel", label: "Het doel of de richting is onduidelijk", domeinen: ["beleving-verandering"], tags: ["teamdoel", "verandering", "communicatie"] },
  { id: "langs-elkaar-heen", kort: "afstemming", label: "We werken langs elkaar heen", domeinen: ["verbeteren-leren", "veiligheid-leiderschap"], tags: ["samenwerking", "communicatie", "teamdoel"] },
  { id: "weinig-vertrouwen", kort: "onderling vertrouwen", label: "Er is weinig onderling vertrouwen", domeinen: ["veiligheid-leiderschap"], tags: ["vertrouwen", "psychologische-veiligheid", "samenwerking"] },
  { id: "spanning-bij-verschil", kort: "spanning bij verschil van inzicht", label: "Verschillen van inzicht leiden tot spanning", domeinen: ["veiligheid-leiderschap"], tags: ["conflict", "communicatie", "feedback"] },
  { id: "weinig-hulp-vragen", kort: "hulp vragen", label: "Mensen vragen onvoldoende om hulp", domeinen: ["energie-motivatie", "veiligheid-leiderschap"], tags: ["hulp-vragen", "psychologische-veiligheid", "werkdruk"] },
  { id: "kwaliteiten-onbenut", kort: "kwaliteiten benutten", label: "We benutten elkaars kwaliteiten onvoldoende", domeinen: ["energie-motivatie", "verbeteren-leren"], tags: ["kwaliteiten", "motivatie", "samenwerking"] },
  { id: "leren-van-fouten", kort: "leren van ervaringen", label: "We willen beter leren van fouten en ervaringen", domeinen: ["verbeteren-leren"], tags: ["leren", "reflectie", "psychologische-veiligheid"] },
  { id: "nieuw-team", kort: "de start van een nieuw team", label: "We zijn een nieuw of opnieuw samengesteld team", domeinen: ["veiligheid-leiderschap", "verbeteren-leren"], tags: ["teamvorming", "afspraken", "kwaliteiten"] },
  { id: "groeien-vanuit-goed", kort: "verder groeien", label: "De samenwerking gaat goed en we willen verder groeien", domeinen: ["verbeteren-leren"], tags: ["teamontwikkeling", "leren", "reflectie"] },
  { id: "weet-niet", kort: "een eerste beeld", label: "Ik weet nog niet precies wat er speelt", breed: true, domeinen: DOMEIN_IDS, tags: ["reflectie", "teamontwikkeling"] },
];

export const SITUATIE_IDS = SITUATIES.map((s) => s.id);

export function situatie(id) {
  return SITUATIES.find((s) => s.id === id) || null;
}

/** De zestien gewenste resultaten uit stap 3 van de kenniswijzer. */
export const DOELEN = [
  { id: "begrijpen", label: "Beter begrijpen wat er speelt", types: ["artikel", "reflectievraag"], werkwijzen: ["lezen", "reflecteren"], tags: ["reflectie"] },
  { id: "gesprek-voorbereiden", label: "Een gesprek voorbereiden", types: ["gespreksvoorbereider", "werkvorm"], werkwijzen: ["voorbereiden"], tags: ["communicatie", "feedback"] },
  { id: "bespreekbaar-maken", label: "Een onderwerp bespreekbaar maken", types: ["werkvorm", "gespreksvoorbereider", "reflectievraag"], werkwijzen: ["bespreken"], tags: ["aanspreekbaarheid", "psychologische-veiligheid"] },
  { id: "afspraken-maken", label: "Duidelijke afspraken maken", types: ["werkvorm", "download", "interventie"], werkwijzen: ["bespreken", "voorbereiden"], tags: ["afspraken", "besluitvorming"] },
  { id: "rollen-verduidelijken", label: "Rollen en verantwoordelijkheden verduidelijken", types: ["werkvorm", "download"], werkwijzen: ["bespreken"], tags: ["rolhelderheid"] },
  { id: "openheid-veiligheid", label: "Meer openheid en veiligheid creëren", types: ["werkvorm", "interventie", "artikel"], werkwijzen: ["bespreken", "oefenen"], tags: ["psychologische-veiligheid", "vertrouwen"] },
  { id: "elkaar-begrijpen", label: "Elkaar beter leren begrijpen", types: ["werkvorm", "artikel"], werkwijzen: ["bespreken", "lezen"], tags: ["kwaliteiten", "communicatie"] },
  { id: "eigenaarschap-stimuleren", label: "Meer eigenaarschap stimuleren", types: ["interventie", "experiment", "artikel"], werkwijzen: ["oefenen", "verbeteren"], tags: ["eigenaarschap"] },
  { id: "verandering-begeleiden", label: "Een verandering beter begeleiden", types: ["artikel", "werkvorm", "interventie"], werkwijzen: ["lezen", "bespreken"], tags: ["verandering", "betekenis"] },
  { id: "conflict-onderzoeken", label: "Een conflict of spanning onderzoeken", types: ["gespreksvoorbereider", "artikel", "werkvorm"], werkwijzen: ["voorbereiden", "bespreken"], tags: ["conflict"] },
  { id: "overleg-verbeteren", label: "Een overleg verbeteren", types: ["experiment", "interventie", "werkvorm"], werkwijzen: ["verbeteren", "oefenen"], tags: ["overleg", "besluitvorming"] },
  { id: "experiment-starten", label: "Een klein experiment starten", types: ["experiment"], werkwijzen: ["verbeteren", "oefenen"], tags: ["leren"] },
  { id: "teamdag-voorbereiden", label: "Een teamdag voorbereiden", types: ["werkvorm", "download", "scan"], werkwijzen: ["voorbereiden"], tags: ["teamdag", "teamontwikkeling"] },
  { id: "gesprek-leidinggevende", label: "Een situatie met mijn leidinggevende bespreken", types: ["gespreksvoorbereider", "reflectievraag"], werkwijzen: ["voorbereiden", "reflecteren"], tags: ["feedback", "communicatie"] },
  { id: "eigen-rol-reflecteren", label: "Reflecteren op mijn eigen rol", types: ["reflectievraag", "artikel"], werkwijzen: ["reflecteren"], tags: ["reflectie", "leiderschap"] },
  { id: "werkvorm-vinden", label: "Een concrete werkvorm vinden", types: ["werkvorm"], werkwijzen: ["bespreken", "oefenen"], tags: [] },
];

export const DOEL_IDS = DOELEN.map((d) => d.id);

export function doel(id) {
  return DOELEN.find((d) => d.id === id) || null;
}

/** Maximale aantallen in de kenniswijzer. */
export const MAX_SITUATIES = 3;
export const MAX_DOELEN = 2;
export const MAX_PRIMAIR = 6;
export const MAX_SECUNDAIR = 6;
