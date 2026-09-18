// De teamcheck: vijf stellingen, drie meetmomenten, en wat je erover mag zeggen.
//
// Alles hier is rekenwerk zonder Firebase en zonder scherm, zodat de regels die
// ertoe doen te testen zijn: wat telt mee in een gemiddelde, wanneer mag een
// teambeeld getoond worden, en wat krijgt iemand mee als hij zijn eigen
// antwoorden downloadt.
//
// De twee regels die het karakter van dit instrument bepalen staan allebei in
// dit bestand, en niet in de opmaak:
//
// 1. "Kan ik nog niet beoordelen" is geen 3. Wie een stelling niet kan
//    beoordelen, zegt niet "neutraal" -- die zegt "ik weet het niet". Dat als
//    middenwaarde meetellen trekt elk gemiddelde naar het midden en maakt een
//    team dat verdeeld is gemiddeld tevreden.
//
// 2. Onder de vier antwoorden tonen we geen cijfers. Bij drie van de negen is
//    elk gemiddelde terug te rekenen naar wie wat invulde, en dan is een
//    anonieme vragenlijst geen anonieme vragenlijst meer.

export const TEAMCHECK_VERSIE = 1;

/** Onder dit aantal antwoorden tonen we geen cijfers. Zie regel 2 hierboven. */
export const DREMPEL = 4;

export const STELLINGEN = [
  { id: "duidelijkheid", thema: "Duidelijkheid", tekst: "Ik weet wat onze teamafspraken van mij vragen in mijn dagelijkse werk." },
  { id: "toepassing", thema: "Toepassing", tekst: "In ons team handelen we naar de afspraken die we hebben gemaakt." },
  { id: "eigenaarschap", thema: "Eigenaarschap", tekst: "In ons team nemen we verantwoordelijkheid voor het nakomen van onze afspraken." },
  { id: "bespreekbaarheid", thema: "Bespreekbaarheid", tekst: "We bespreken het met elkaar wanneer het niet lukt om onze afspraken na te komen." },
  { id: "opbrengst", thema: "Opbrengst", tekst: "Onze teamafspraken helpen ons om beter samen te werken aan onze doelen." },
];

export const OPEN_VRAAG = "Wat helpt of belemmert ons bij het toepassen van de afspraken, en wat moeten we aanpassen?";

export const SCHAAL = [
  { waarde: 1, label: "Helemaal oneens" },
  { waarde: 2, label: "Oneens" },
  { waarde: 3, label: "Neutraal" },
  { waarde: 4, label: "Eens" },
  { waarde: 5, label: "Helemaal eens" },
];

export const RONDES = [
  { id: "d30", dagen: 30, naam: "Eerste stappen", vraag: "Wat lukt al?" },
  { id: "d60", dagen: 60, naam: "Samen bijsturen", vraag: "Wat merken we?" },
  { id: "d90", dagen: 90, naam: "Vasthouden", vraag: "Wat blijft werken?" },
];

const IDS = STELLINGEN.map((s) => s.id);
const OPEN_MAX = 2000;

/** De ronde bij een id, of null. */
export function leesRonde(id) {
  return RONDES.find((r) => r.id === id) || null;
}

/** De stelling bij een id, of null. */
export function leesStelling(id) {
  return STELLINGEN.find((s) => s.id === id) || null;
}

/**
 * Heeft deze persoon alle stellingen gezien?
 *
 * Een stelling die ontbreekt is overgeslagen; een stelling met null is bewust
 * op "kan ik nog niet beoordelen" gezet. Dat verschil verdwijnt als je ze
 * allebei als "leeg" behandelt, en dan weet je bij het overzicht niet of
 * iemand de vraag niet kon beantwoorden of hem niet heeft gezien.
 */
export function isCompleet(antwoord) {
  const scores = (antwoord && antwoord.scores) || {};
  return IDS.every((id) => Object.prototype.hasOwnProperty.call(scores, id));
}

/**
 * Klopt de vorm van een antwoord?
 *
 * Draait in de client voordat er iets naar Firestore gaat. De regels in
 * Firestore bewaken wie er mag schrijven; dit bewaakt wat er in staat.
 */
export function valideerAntwoord(antwoord) {
  if (!antwoord || typeof antwoord !== "object") throw new Error("Dit antwoord is niet geldig.");
  const scores = antwoord.scores;
  if (!scores || typeof scores !== "object") throw new Error("Er zijn geen antwoorden ingevuld.");
  for (const id of Object.keys(scores)) {
    if (!IDS.includes(id)) throw new Error("Dit antwoord hoort niet bij deze teamcheck.");
    const waarde = scores[id];
    if (waarde === null) continue;
    if (!Number.isInteger(waarde) || waarde < 1 || waarde > 5) throw new Error("Een antwoord valt buiten de schaal.");
  }
  const open = antwoord.open === undefined ? "" : antwoord.open;
  if (typeof open !== "string" || open.length > OPEN_MAX) throw new Error("Het open antwoord is te lang.");
  if (antwoord.naamErbij !== undefined && typeof antwoord.naamErbij !== "boolean") throw new Error("Dit antwoord is niet geldig.");
  // Een naam zonder toestemming hoort er niet in te staan: dan zou hij later
  // alsnog kunnen opduiken in een overzicht dat naamloos hoort te zijn.
  if (!antwoord.naamErbij && antwoord.naam) throw new Error("Er staat een naam bij een antwoord dat naamloos hoort te zijn.");
  return antwoord;
}

/** De geldige scores voor een stelling: zonder de mensen die niet konden oordelen. */
function geldige(antwoorden, stellingId) {
  return (antwoorden || [])
    .map((a) => (a && a.scores ? a.scores[stellingId] : undefined))
    .filter((w) => Number.isInteger(w) && w >= 1 && w <= 5);
}

/**
 * Het gemiddelde van een stelling, met het aantal waarop het berust.
 *
 * n hoort altijd naast een gemiddelde te staan. Een 4,0 uit acht antwoorden en
 * een 4,0 uit twee antwoorden zijn niet hetzelfde getal.
 */
export function gemiddelde(antwoorden, stellingId) {
  const lijst = geldige(antwoorden, stellingId);
  if (!lijst.length) return { gemiddelde: null, n: 0 };
  const som = lijst.reduce((t, w) => t + w, 0);
  return { gemiddelde: Math.round((som / lijst.length) * 10) / 10, n: lijst.length };
}

/**
 * Hoe vaak elk cijfer gekozen is.
 *
 * Dit is waar je ziet of een 3,0 betekent "iedereen neutraal" of "de helft
 * oneens, de helft eens". Het gemiddelde alleen kan die twee niet uit elkaar
 * houden, en het verschil is precies waar een teamgesprek over gaat.
 */
export function verdeling(antwoorden, stellingId) {
  const tellingen = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let nietTeBeoordelen = 0;
  for (const antwoord of antwoorden || []) {
    const scores = (antwoord && antwoord.scores) || {};
    if (!Object.prototype.hasOwnProperty.call(scores, stellingId)) continue;
    const waarde = scores[stellingId];
    if (waarde === null) { nietTeBeoordelen += 1; continue; }
    if (Number.isInteger(waarde) && waarde >= 1 && waarde <= 5) tellingen[waarde] += 1;
  }
  return { tellingen, nietTeBeoordelen, ...gemiddelde(antwoorden, stellingId) };
}

/**
 * Hoe ver de antwoorden uit elkaar liggen (standaardafwijking).
 *
 * Gebruikt om "hier lopen de ervaringen uiteen" te bepalen. Dat is een
 * interessanter signaal dan het laagste gemiddelde: een stelling waar iedereen
 * een 3 geeft vraagt iets anders dan een stelling waar de helft 1 en de helft 5
 * geeft, terwijl beide op 3,0 uitkomen.
 */
export function spreiding(antwoorden, stellingId) {
  const lijst = geldige(antwoorden, stellingId);
  if (lijst.length < 2) return null;
  const gem = lijst.reduce((t, w) => t + w, 0) / lijst.length;
  const variantie = lijst.reduce((t, w) => t + (w - gem) ** 2, 0) / lijst.length;
  return Math.round(Math.sqrt(variantie) * 100) / 100;
}

/** Mag er iets over het team gezegd worden, of zijn het er nog te weinig? */
export function magTonen(aantal) {
  return Number.isInteger(aantal) && aantal >= DREMPEL;
}

/** Hoeveel van de teamleden hebben ingevuld. */
export function respons(antwoorden, aantalLeden) {
  const ingevuld = (antwoorden || []).filter((a) => isCompleet(a)).length;
  const totaal = Number.isInteger(aantalLeden) && aantalLeden > 0 ? aantalLeden : 0;
  return { ingevuld, totaal };
}

/** De stelling die er het beste uit komt. Null als er te weinig antwoorden zijn. */
export function sterkste(antwoorden) {
  if (!magTonen((antwoorden || []).length)) return null;
  let beste = null;
  for (const stelling of STELLINGEN) {
    const { gemiddelde: gem, n } = gemiddelde(antwoorden, stelling.id);
    if (gem === null) continue;
    if (!beste || gem > beste.gemiddelde) beste = { ...stelling, gemiddelde: gem, n };
  }
  return beste;
}

/**
 * De stelling waar de ervaringen het meest uiteenlopen.
 *
 * Met opzet niet "de laagste score". Waar een team het onderling oneens is,
 * valt meer te bespreken dan waar iedereen hetzelfde matige cijfer geeft.
 */
export function meestVerdeeld(antwoorden) {
  if (!magTonen((antwoorden || []).length)) return null;
  let raakste = null;
  for (const stelling of STELLINGEN) {
    const sp = spreiding(antwoorden, stelling.id);
    if (sp === null) continue;
    if (!raakste || sp > raakste.spreiding) raakste = { ...stelling, spreiding: sp, ...gemiddelde(antwoorden, stelling.id) };
  }
  return raakste;
}

/**
 * Wat iemand meekrijgt als hij zijn eigen antwoorden downloadt.
 *
 * Alleen je eigen invoer, in gewone taal, zonder cijfers van anderen. Platte
 * tekst en geen pdf: dit hoort iets te zijn dat je kunt teruglezen en bewaren,
 * niet iets dat eruitziet als een rapport over jou.
 */
export function maakEigenDownload(antwoord, rondeId, datum) {
  const ronde = leesRonde(rondeId);
  const scores = (antwoord && antwoord.scores) || {};
  const regels = [
    "Mijn teamcheck",
    ronde ? `Na ${ronde.dagen} dagen — ${ronde.naam}` : "",
    datum ? `Ingevuld op ${datum}` : "",
    "",
    "Dit zijn alleen jouw eigen antwoorden. Wat anderen invulden staat er niet in.",
    "",
  ];
  for (const stelling of STELLINGEN) {
    const waarde = scores[stelling.id];
    const gekozen = waarde === null || waarde === undefined
      ? (Object.prototype.hasOwnProperty.call(scores, stelling.id) ? "Kan ik nog niet beoordelen" : "Niet ingevuld")
      : `${waarde} — ${(SCHAAL.find((s) => s.waarde === waarde) || {}).label || ""}`;
    regels.push(`${stelling.thema}`, stelling.tekst, `Jouw antwoord: ${gekozen}`, "");
  }
  const open = ((antwoord && antwoord.open) || "").trim();
  regels.push(OPEN_VRAAG, open || "(niet ingevuld)", "");
  return regels.filter((r, i) => !(r === "" && regels[i - 1] === "")).join("\n");
}
