// Van een Insights Discovery-profiel naar samenwerkingskenmerken.
//
// Belangrijk: dit is een vertaling, geen typering. De uitkomst is altijd een
// suggestie die de gebruiker zelf bevestigt, corrigeert of wegstreept. Er komt
// nooit een label als "jij bent rood" uit; wat we bewaren zijn losse
// voorkeuren met de bron erbij.
//
// De vertaling is bewust eenvoudig en volledig deterministisch: de voorkeurs-
// kleur telt dubbel, de tweede kleur telt enkel, en per kenmerk wint de waarde
// met de meeste punten. Bij gelijke stand wint de voorkeurskleur.

export const KLEUREN = [
  {
    id: "blauw",
    label: "Koel blauw",
    omschrijving: "Nauwkeurig, doordacht, eerst de feiten.",
    kleur: "#3A7DBF",
  },
  {
    id: "groen",
    label: "Zacht groen",
    omschrijving: "Betrokken, rustig, eerst de mensen.",
    kleur: "#5A8C3C",
  },
  {
    id: "geel",
    label: "Stralend geel",
    omschrijving: "Enthousiast, associatief, eerst de mogelijkheden.",
    kleur: "#E8821A",
  },
  {
    id: "rood",
    label: "Vurig rood",
    omschrijving: "Doelgericht, direct, eerst de uitkomst.",
    kleur: "#C0392B",
  },
];

export const KLEUR_IDS = KLEUREN.map((k) => k.id);

export function kleur(id) {
  return KLEUREN.find((k) => k.id === id) || null;
}

/**
 * Wat elke kleurvoorkeur suggereert per kenmerk.
 * De ids verwijzen naar KENMERKEN en hun opties in kenmerken.js.
 */
const SUGGESTIES = {
  rood: {
    tempo: "snel",
    context: "kort",
    structuur: "gemengd",
    denken: "hardop",
    contact: "taak",
    feedback: "direct",
    spanning: "sneller",
    besluitvorming: "knoop",
    energie: "afronden",
    energieverlies: "langoverleg",
    aanspreken: "tempo",
    misverstand: "kortaf",
  },
  geel: {
    tempo: "snel",
    context: "kort",
    structuur: "ruimte",
    denken: "hardop",
    contact: "relatie",
    feedback: "voorbeeld",
    spanning: "uitleg",
    besluitvorming: "meepraten",
    energie: "nieuw",
    energieverlies: "langoverleg",
    aanspreken: "toezegging",
    misverstand: "enthousiasme",
  },
  groen: {
    tempo: "bedachtzaam",
    context: "veel",
    structuur: "structuur",
    denken: "alleen",
    contact: "relatie",
    feedback: "rustig",
    spanning: "stiller",
    besluitvorming: "meepraten",
    energie: "samen",
    energieverlies: "conflict",
    aanspreken: "stil",
    misverstand: "stilte",
  },
  blauw: {
    tempo: "bedachtzaam",
    context: "veel",
    structuur: "structuur",
    denken: "alleen",
    contact: "taak",
    feedback: "voorbeeld",
    spanning: "terugtrekken",
    besluitvorming: "waarom",
    energie: "verdieping",
    energieverlies: "onduidelijk",
    aanspreken: "detail",
    misverstand: "twijfel",
  },
};

export const KENMERKEN_UIT_INSIGHTS = Object.keys(SUGGESTIES.rood);

/**
 * Leidt kenmerken af uit een ingevuld Insights-profiel.
 *
 * `profiel` is { voorkeurskleur, tweedeKleur }. Beide mogen leeg zijn; dan
 * komt er niets uit en werkt de app gewoon door op wat de gebruiker zelf
 * invult. De app is nadrukkelijk niet afhankelijk van dit profiel.
 *
 * Geeft terug: [{ kenmerkId, waarde, bron: "insights_discovery" }]
 */
export function kenmerkenUitInsights(profiel = {}) {
  const eerste = profiel.voorkeurskleur;
  const tweede = profiel.tweedeKleur;
  if (!SUGGESTIES[eerste]) return [];

  const uit = [];
  KENMERKEN_UIT_INSIGHTS.forEach((kenmerkId) => {
    const punten = {};
    const tel = (waarde, aantal) => {
      if (!waarde) return;
      punten[waarde] = (punten[waarde] || 0) + aantal;
    };

    tel(SUGGESTIES[eerste][kenmerkId], 2);
    if (SUGGESTIES[tweede] && tweede !== eerste) tel(SUGGESTIES[tweede][kenmerkId], 1);

    // Bij gelijke stand wint de voorkeurskleur; die staat als eerste geteld
    // en heeft altijd minstens 2 punten, dus een gelijkspel kan alleen tussen
    // de voorkeurskleur en zichzelf ontstaan. De sortering blijft toch
    // expliciet, zodat de uitkomst voorspelbaar is.
    const beste = Object.keys(punten).sort(
      (a, b) => punten[b] - punten[a] || a.localeCompare(b)
    )[0];

    if (beste) uit.push({ kenmerkId, waarde: beste, bron: "insights_discovery" });
  });

  return uit;
}

/** Een korte, voorzichtige samenvatting van het ingevulde profiel. */
export function insightsSamenvatting(profiel = {}) {
  const eerste = kleur(profiel.voorkeurskleur);
  const tweede = kleur(profiel.tweedeKleur);
  if (!eerste) return null;
  if (!tweede || tweede.id === eerste.id) {
    return `Je profiel heeft ${eerste.label.toLowerCase()} als voorkeurskleur. Dat suggereert een aantal voorkeuren in samenwerking; hieronder kun je per punt aangeven of het klopt.`;
  }
  return `Je profiel heeft ${eerste.label.toLowerCase()} als voorkeurskleur, met ${tweede.label.toLowerCase()} daarnaast. Dat suggereert een aantal voorkeuren in samenwerking; hieronder kun je per punt aangeven of het klopt.`;
}
