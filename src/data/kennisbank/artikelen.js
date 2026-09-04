// Koppelt de bestaande blogartikelen aan de taxonomie van de kennisbank.
//
// De artikelen zelf blijven onaangeroerd: hun frontmatter, url en inhoud
// veranderen niet. Hier wordt alleen metadata afgeleid en aangevuld.
//
// Let op: deze module gebruikt blogData.js en daarmee import.meta.glob. Hij
// draait dus alleen in de Vite-bundel, niet in Node. Het validatiescript leest
// de frontmatter zelf met fs.

import { blogPosts } from "../../content/blogData";
import { normaliseerItem } from "./items.js";

/** Blogtag of categorie naar hoofdtag uit de centrale taglijst. */
export const BLOGTAG_NAAR_TAG = {
  leiderschap: ["leiderschap"],
  teamcultuur: ["gedrag", "samenwerking"],
  samenwerking: ["samenwerking"],
  eigenaarschap: ["eigenaarschap"],
  verandering: ["verandering"],
  doelen: ["teamdoel"],
  "psychologische veiligheid": ["psychologische-veiligheid", "vertrouwen"],
  gedrag: ["gedrag"],
  teamontwikkeling: ["teamontwikkeling"],
  bevlogenheid: ["bevlogenheid", "energie"],
  leren: ["leren"],
  teamenergie: ["energie"],
  werkplezier: ["bevlogenheid"],
  energie: ["energie"],
  aanspreken: ["aanspreekbaarheid", "feedback"],
  Leiderschap: ["leiderschap"],
  Samenwerking: ["samenwerking"],
  Verandering: ["verandering"],
  Teamcultuur: ["gedrag", "samenwerking"],
  "Bevlogenheid en werkplezier": ["bevlogenheid", "energie"],
};

/** Hoofdtag naar domein. Elk artikel krijgt zo altijd minstens één domein. */
export const TAG_NAAR_DOMEIN = {
  "psychologische-veiligheid": ["veiligheid-leiderschap"],
  vertrouwen: ["veiligheid-leiderschap"],
  aanspreekbaarheid: ["veiligheid-leiderschap"],
  feedback: ["veiligheid-leiderschap"],
  leiderschap: ["veiligheid-leiderschap"],
  conflict: ["veiligheid-leiderschap"],
  gedrag: ["veiligheid-leiderschap"],
  rolhelderheid: ["veiligheid-leiderschap", "verbeteren-leren"],
  "hulp-vragen": ["veiligheid-leiderschap", "energie-motivatie"],
  teamvorming: ["veiligheid-leiderschap", "verbeteren-leren"],
  verandering: ["beleving-verandering"],
  betekenis: ["beleving-verandering"],
  teamdoel: ["beleving-verandering"],
  energie: ["energie-motivatie"],
  bevlogenheid: ["energie-motivatie"],
  motivatie: ["energie-motivatie"],
  werkdruk: ["energie-motivatie"],
  eigenaarschap: ["energie-motivatie", "verbeteren-leren"],
  kwaliteiten: ["energie-motivatie"],
  leren: ["verbeteren-leren"],
  reflectie: ["verbeteren-leren"],
  besluitvorming: ["verbeteren-leren"],
  overleg: ["verbeteren-leren"],
  afspraken: ["verbeteren-leren"],
  samenwerking: ["verbeteren-leren", "veiligheid-leiderschap"],
  communicatie: ["veiligheid-leiderschap"],
  teamontwikkeling: ["verbeteren-leren"],
  teamdag: ["verbeteren-leren"],
};

/** Hoofdtag naar rollen waarvoor het onderwerp als eerste relevant is. */
const TAG_NAAR_ROLLEN = {
  leiderschap: ["teamleider", "directie-mt", "hr", "projectleider"],
  eigenaarschap: ["teamleider", "teamlid", "hr"],
  "psychologische-veiligheid": ["teamleider", "teamlid", "hr", "teamcoach"],
  vertrouwen: ["teamleider", "teamlid", "teamcoach"],
  aanspreekbaarheid: ["teamlid", "teamleider", "teamcoach"],
  feedback: ["teamlid", "teamleider", "hr"],
  verandering: ["teamleider", "directie-mt", "hr", "projectleider"],
  betekenis: ["teamleider", "directie-mt", "teamlid"],
  teamdoel: ["teamleider", "directie-mt", "projectleider"],
  samenwerking: ["teamlid", "teamleider", "teamcoach", "heel-team"],
  communicatie: ["teamlid", "teamleider", "teamcoach"],
  conflict: ["teamleider", "hr", "teamcoach"],
  energie: ["teamlid", "teamleider", "hr"],
  bevlogenheid: ["hr", "teamleider", "teamlid"],
  motivatie: ["teamleider", "hr", "teamlid"],
  werkdruk: ["teamlid", "teamleider", "hr"],
  kwaliteiten: ["teamleider", "hr", "teamcoach", "teamlid"],
  leren: ["teamcoach", "teamleider", "hr"],
  reflectie: ["teamlid", "teamleider", "teamcoach"],
  besluitvorming: ["teamleider", "directie-mt", "projectleider"],
  overleg: ["teamleider", "projectleider", "heel-team"],
  afspraken: ["teamleider", "heel-team", "projectleider"],
  rolhelderheid: ["teamleider", "projectleider", "hr"],
  "hulp-vragen": ["teamlid", "teamleider"],
  teamvorming: ["teamleider", "teamcoach", "hr"],
  teamontwikkeling: ["teamcoach", "teamleider", "hr"],
  teamdag: ["teamleider", "teamcoach", "hr"],
  gedrag: ["teamleider", "teamcoach", "hr"],
};

/** Hoofdtag naar gewenst resultaat. Elk artikel dient sowieso 'begrijpen'. */
const TAG_NAAR_DOELEN = {
  conflict: ["conflict-onderzoeken"],
  verandering: ["verandering-begeleiden"],
  betekenis: ["verandering-begeleiden"],
  eigenaarschap: ["eigenaarschap-stimuleren"],
  "psychologische-veiligheid": ["openheid-veiligheid"],
  vertrouwen: ["openheid-veiligheid"],
  aanspreekbaarheid: ["bespreekbaar-maken"],
  feedback: ["gesprek-voorbereiden", "gesprek-leidinggevende"],
  kwaliteiten: ["elkaar-begrijpen"],
  communicatie: ["elkaar-begrijpen"],
  leiderschap: ["eigen-rol-reflecteren"],
  besluitvorming: ["overleg-verbeteren"],
  overleg: ["overleg-verbeteren"],
  rolhelderheid: ["rollen-verduidelijken"],
  afspraken: ["afspraken-maken"],
  teamdag: ["teamdag-voorbereiden"],
  leren: ["experiment-starten"],
  teamvorming: ["afspraken-maken"],
};

/**
 * Handmatige verrijking per artikel. Links de slug, rechts de hoofdtags die
 * het artikel het beste beschrijven. Deze tags komen bovenop wat er uit de
 * frontmatter wordt afgeleid.
 *
 * Nieuw artikel geplaatst? Voeg hier een regel toe. Zonder regel werkt het
 * artikel gewoon mee op basis van zijn eigen tags en categorie; met een regel
 * komt het scherper naar boven in de kenniswijzer.
 */
export const ARTIKEL_TAGS = {
  "aandacht-voor-de-verkeerde-mensen": ["leiderschap", "kwaliteiten", "motivatie"],
  "aanwezig-maar-niet-verbonden": ["samenwerking", "bevlogenheid", "energie"],
  "amerikaanse-daadkracht-botst-met-nederlandse-tegenspraak": ["besluitvorming", "communicatie", "kwaliteiten"],
  "collegas-meekrijgen-bij-verandering": ["verandering", "betekenis", "communicatie"],
  "complexe-situatie-als-manager-aanpakken": ["leiderschap", "besluitvorming", "reflectie"],
  "de-finishlijn-bestaat-niet": ["verandering", "teamdoel", "leren"],
  "de-impact-van-goedemorgen": ["gedrag", "vertrouwen", "samenwerking"],
  "de-laatste-twintig-minuten": ["overleg", "psychologische-veiligheid", "communicatie"],
  "discussieren-met-de-werkelijkheid": ["communicatie", "conflict", "leren"],
  "duidelijkheid-is-vriendelijker-dan-veel-ruimte": ["rolhelderheid", "leiderschap", "afspraken"],
  "formeel-een-team-maar-elkaar-niet-nodig": ["samenwerking", "teamdoel", "teamvorming"],
  "goede-vragen-veranderen-meer-dan-adviezen": ["communicatie", "leiderschap", "reflectie"],
  "het-echte-probleem-of-het-zichtbare": ["leren", "reflectie", "besluitvorming"],
  "hoe-ai-ons-werk-verandert": ["verandering", "leren", "betekenis"],
  "hoe-een-meningsverschil-een-teamconflict-wordt": ["conflict", "communicatie", "psychologische-veiligheid"],
  "hoe-kan-een-jaargesprek-echt-waarde-toevoegen": ["feedback", "leiderschap", "motivatie"],
  "houvast-tijdens-onzekerheid": ["verandering", "betekenis", "psychologische-veiligheid"],
  "innovatie-loopt-vast-op-gedrag": ["gedrag", "verandering", "leren"],
  "leiderschapslessen-van-oude-filosofen": ["leiderschap", "reflectie"],
  "leidinggeven-aan-een-groot-team": ["leiderschap", "rolhelderheid", "communicatie"],
  "maatwerk-in-werktijden": ["werkdruk", "motivatie", "afspraken"],
  "manager-worden-van-je-eigen-groep": ["leiderschap", "rolhelderheid", "vertrouwen"],
  "mannelijke-en-vrouwelijke-leiders": ["leiderschap", "kwaliteiten"],
  "niemand-verantwoordelijk-voor-het-geheel": ["eigenaarschap", "rolhelderheid", "teamdoel"],
  "niemand-wil-de-rekening-betalen": ["besluitvorming", "eigenaarschap", "teamdoel"],
  "onder-druk-wordt-leiderschap-smaller": ["leiderschap", "werkdruk", "gedrag"],
  "ondersteunen-is-iets-anders-dan-redden": ["leiderschap", "eigenaarschap", "hulp-vragen"],
  "onmisbare-medewerker-als-risico": ["rolhelderheid", "kwaliteiten", "werkdruk"],
  "oog-voor-vandaag-en-morgen-als-manager": ["leiderschap", "teamdoel", "besluitvorming"],
  "psychologische-veiligheid-team": ["psychologische-veiligheid", "vertrouwen", "aanspreekbaarheid"],
  "strategisch-leiderschap-in-de-praktijk": ["leiderschap", "teamdoel", "betekenis"],
  "teambuilding-werkt-niet-zonder-basis": ["teamvorming", "vertrouwen", "teamdag"],
  "thuiswerken-of-op-kantoor": ["samenwerking", "afspraken", "energie"],
  "van-functieomschrijving-naar-talent": ["kwaliteiten", "rolhelderheid", "motivatie"],
  "veel-afstemmen-en-toch-langs-elkaar-heen": ["samenwerking", "communicatie", "overleg"],
  "vergrijzing-en-samenwerken-met-robots": ["verandering", "leren", "kwaliteiten"],
  "verhalen-vertellen-als-managementvaardigheid": ["communicatie", "betekenis", "leiderschap"],
  "vragen-voor-de-dagstart-met-het-mt": ["overleg", "reflectie", "communicatie"],
  "waarom-collegas-verwachten-dat-de-manager-het-oplost": ["eigenaarschap", "leiderschap", "rolhelderheid"],
  "waarom-de-beste-kpis-niet-door-het-management-worden-bedacht": ["teamdoel", "eigenaarschap", "leren"],
  "waarom-diversiteit-positief-werkt-voor-het-teamresultaat": ["kwaliteiten", "samenwerking", "psychologische-veiligheid"],
  "waarom-een-onmogelijk-doel-soms-precies-is-wat-een-team-nodig-heeft": ["teamdoel", "motivatie", "leren"],
  "waarom-experimenteren-essentieel-is-voor-betere-samenwerking": ["leren", "teamontwikkeling", "gedrag"],
  "waarom-generaties-anders-met-verandering-omgaan": ["verandering", "kwaliteiten", "communicatie"],
  "waarom-informele-leiders-verandering-bepalen": ["verandering", "leiderschap", "gedrag"],
  "waarom-innovatie-en-creativiteit-belangrijker-worden": ["leren", "verandering", "psychologische-veiligheid"],
  "waarom-jonge-werknemers-nooit-helemaal-offline-zijn": ["energie", "werkdruk", "betekenis"],
  "waarom-kiezen-de-meeste-mensen-voor-de-roltrap": ["gedrag", "verandering", "motivatie"],
  "waarom-manager-worden-niet-meer-vanzelf-de-volgende-stap-is": ["leiderschap", "motivatie", "betekenis"],
  "waarom-missen-we-ons-werk-pas-als-het-er-niet-meer-is": ["betekenis", "bevlogenheid", "motivatie"],
  "waarom-niemand-de-uitkomsten-van-het-mto-herkent": ["leren", "communicatie", "teamontwikkeling"],
  "waarom-ogsm-vaak-niet-werkt": ["teamdoel", "besluitvorming", "eigenaarschap"],
  "waarom-teamleden-het-lastig-vinden-als-anderen-een-project-trekken": ["rolhelderheid", "vertrouwen", "samenwerking"],
  "waarom-vacatures-niet-ingevuld-raken": ["betekenis", "motivatie", "teamvorming"],
  "waarom-ziekteverzuim-zo-moeilijk-omlaag-te-houden-is": ["werkdruk", "energie", "leiderschap"],
  "wat-anderen-van-ons-denken": ["psychologische-veiligheid", "communicatie", "reflectie"],
  "weet-jouw-team-waar-het-naartoe-beweegt": ["teamdoel", "betekenis", "communicatie"],
  "werkdruk-of-onduidelijkheid": ["werkdruk", "rolhelderheid", "energie"],
};

function uniek(lijst) {
  return [...new Set(lijst.filter(Boolean))];
}

function vertaalTags(waarden = []) {
  return waarden.flatMap((waarde) => BLOGTAG_NAAR_TAG[waarde] || BLOGTAG_NAAR_TAG[String(waarde).toLowerCase()] || []);
}

/** Leestijd in hele minuten, afgerond op 5, 10 of 15. */
export function leestijd(tekst = "") {
  return leestijdUitWoorden(tekst.split(/\s+/).filter(Boolean).length);
}

/**
 * Dezelfde staffel, maar vanuit een woordental.
 *
 * De tekst van een artikel zit niet meer in de bundel, dus op het moment dat
 * een lijst wordt opgebouwd is die er niet. Het woordental wordt bij het bouwen
 * één keer geteld en staat in blogIndex.json.
 */
export function leestijdUitWoorden(woorden = 0) {
  const minuten = Math.ceil(woorden / 220);
  if (minuten <= 5) return 5;
  if (minuten <= 10) return 10;
  return 15;
}

/**
 * Bouwt uit een blogartikel een contentitem voor de kennisbank.
 * De verrijking uit ARTIKEL_TAGS gaat voor; wat daar niet staat wordt uit de
 * frontmatter afgeleid, zodat een nieuw artikel altijd meedoet.
 */
export function artikelNaarItem(post) {
  const tags = uniek([
    ...(ARTIKEL_TAGS[post.slug] || []),
    ...vertaalTags(post.tags),
    ...vertaalTags([post.category]),
  ]);
  const domeinen = uniek(tags.flatMap((tag) => TAG_NAAR_DOMEIN[tag] || []));
  const rollen = uniek(tags.flatMap((tag) => TAG_NAAR_ROLLEN[tag] || []));
  const doelen = uniek(["begrijpen", ...tags.flatMap((tag) => TAG_NAAR_DOELEN[tag] || [])]);

  return {
    id: "blog-" + post.slug,
    url: "/blog/" + post.slug,
    titel: post.title,
    samenvatting: post.excerpt,
    type: "artikel",
    domeinen: domeinen.length ? domeinen : ["verbeteren-leren"],
    rollen: rollen.length ? rollen : ["teamleider", "teamlid", "hr"],
    doelen,
    werkwijzen: ["lezen", "reflecteren"],
    tijdMinuten: leestijdUitWoorden(post.woorden),
    vorm: "individueel",
    niveau: "laag",
    voorbereiding: "Geen",
    tags,
    afbeelding: post.image,
    afbeeldingAlt: post.imageAlt,
    categorie: post.category,
    uitgelicht: false,
    datum: post.publishDate,
    vervolgstap: { label: "Start de gratis persoonlijke teamscan", href: "/gratis-teamscan" },
    gerelateerd: [],
  };
}

export const ARTIKEL_ITEMS = blogPosts.map((post) => normaliseerItem(artikelNaarItem(post), "artikel"));

export default ARTIKEL_ITEMS;
