// Experimenten: één kleine actie dertig dagen volgen.
//
// Elk advies eindigt met een kleine actie — één ding dat je vandaag anders kunt
// doen. Je leest hem, je knikt, en je sluit het scherm. Dat is waar deze app
// tot nu toe ophield: hij hielp je op een moment, en daarna niet meer.
//
// Een experiment is het kleinste dat daar iets aan doet. Je zegt: dit ga ik
// dertig dagen proberen. Daarna komt de app er één keer op terug.
//
// Drie dingen die het met opzet niet is:
//
//   - Geen doel dat je haalt of niet haalt. Er is geen streep, geen score en
//     geen "volgehouden". De terugblik vraagt wat je merkte, niet hoe vaak je
//     het deed.
//   - Niet zichtbaar voor je team. Een experiment is iets wat je met jezelf
//     afspreekt; zodra anderen meekijken wordt het een prestatie.
//   - Niet gekoppeld aan een persoon. Waar het advies over ging slaan we niet
//     op — net zomin als bij een adviessessie. Wat blijft staan is de actie.
//
// Pure functies: geen React, geen database, wel te testen.

/** Een experiment loopt dertig dagen. Lang genoeg om iets te merken, kort genoeg om te overzien. */
export const LOOPTIJD_DAGEN = 30;

/** De terugblik is een paar zinnen, geen verslag. */
export const MAX_TERUGBLIK = 600;

/**
 * Wat je na afloop met dit experiment doet.
 *
 * Geen "gelukt" of "mislukt": een experiment dat niet bij je past is net zo
 * bruikbaar als een die dat wel doet. Het enige wat telt is wat je ermee doet.
 */
export const UITKOMSTEN = [
  { id: "hou-ik-vast", label: "Dit hou ik vast" },
  { id: "past-niet", label: "Dit past niet bij mij" },
  { id: "weet-nog-niet", label: "Ik weet het nog niet" },
];

export const isUitkomst = (id) => UITKOMSTEN.some((u) => u.id === id);

const alsGetal = (waarde) => {
  if (!waarde) return 0;
  if (typeof waarde.toMillis === "function") return waarde.toMillis();
  if (waarde instanceof Date) return waarde.getTime();
  const n = Date.parse(waarde);
  return Number.isFinite(n) ? n : 0;
};

const DAG = 24 * 60 * 60 * 1000;

/** De hoeveelste dag ben je bezig? Dag 1 is de dag dat je begon. */
export function dagenBezig(experiment, nu = new Date()) {
  const start = alsGetal(experiment && experiment.gestartOp);
  if (!start) return 1;
  return Math.max(1, Math.floor((nu.getTime() - start) / DAG) + 1);
}

/** Zijn de dertig dagen om? */
export function isTerugblikKlaar(experiment, nu = new Date()) {
  if (!experiment || experiment.terugblikOp) return false;
  return dagenBezig(experiment, nu) > LOOPTIJD_DAGEN;
}

/** Loopt dit experiment nog? */
export function loopt(experiment, nu = new Date()) {
  if (!experiment || experiment.terugblikOp) return false;
  return !isTerugblikKlaar(experiment, nu);
}

/**
 * Waar sta je? Eén regel, zonder aansporing.
 *
 * Er staat nadrukkelijk niet hoeveel dagen je het "gehaald" hebt — dat weet de
 * app niet en het is ook niet de vraag. Alleen hoe lang het loopt.
 */
export function standInEenZin(experiment, nu = new Date()) {
  if (!experiment) return "";
  if (experiment.terugblikOp) return "Afgerond.";
  const dag = dagenBezig(experiment, nu);
  if (dag > LOOPTIJD_DAGEN) return `De ${LOOPTIJD_DAGEN} dagen zijn om. Hoe is het gegaan?`;
  return `Dag ${dag} van ${LOOPTIJD_DAGEN}.`;
}

/**
 * De volgorde: wat aandacht vraagt bovenaan.
 *
 * Eerst wat om een terugblik vraagt, dan wat nog loopt, dan wat af is. Binnen
 * elke groep het meest recente eerst.
 */
export function sorteerExperimenten(lijst = [], nu = new Date()) {
  const rang = (e) => {
    if (isTerugblikKlaar(e, nu)) return 0;
    if (!e.terugblikOp) return 1;
    return 2;
  };

  return [...(lijst || [])]
    .filter((e) => e && e.actie)
    .sort((a, b) => rang(a) - rang(b) || alsGetal(b.gestartOp) - alsGetal(a.gestartOp));
}

/** Het experiment dat nu je aandacht vraagt, of null. */
export function watNuSpeelt(lijst = [], nu = new Date()) {
  const gesorteerd = sorteerExperimenten(lijst, nu);
  const eerste = gesorteerd[0];
  if (!eerste || eerste.terugblikOp) return null;
  return eerste;
}

/** Wat er van een terugblik in de database mag komen. */
export function schoneTerugblik({ uitkomst, tekst } = {}) {
  return {
    uitkomst: isUitkomst(uitkomst) ? uitkomst : "weet-nog-niet",
    tekst: String(tekst || "").trim().slice(0, MAX_TERUGBLIK),
  };
}
