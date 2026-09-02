// Reflecties: één keer terugkijken op een gesprek dat je hebt gevoerd.
//
// De app helpt je vóór een gesprek. Daarna hoorde je er niets meer van, terwijl
// dat precies het moment is waarop je iets leert: je hebt het geprobeerd, en nu
// weet je of het werkte. Een reflectie is de vraag die daarbij hoort, en niet
// meer dan dat.
//
// Wat het met opzet niet is:
//
//   - Geen verslag van het gesprek. Vier antwoorden, waarvan drie een tik zijn.
//     Wie er meer over kwijt wil kan dat, maar het hoeft niet.
//   - Geen oordeel over de ander. De vraag gaat over hoe jij erop terugkijkt,
//     niet over hoe de ander het deed. In de app staat nergens iets over een
//     collega dat die collega niet zelf heeft opgeschreven, en dat blijft zo.
//   - Niet gekoppeld aan een persoon. Net als bij een adviessessie slaan we
//     op bij welke situatie het was, nooit over wie het ging.
//   - Geen herinnering die blijft zeuren. De vraag komt één keer op en vervalt
//     vanzelf; "ik heb het gesprek niet gevoerd" is een gewoon antwoord.
//
// Pure functies: geen React, geen database, wel te testen.

/** Pas de volgende dag vragen. Vlak na het advies is er nog geen gesprek geweest. */
export const WACHT_UREN = 20;

/** Daarna vervalt de vraag. Terugkijken op iets van drie weken terug is verzinnen. */
export const VERVALT_NA_DAGEN = 14;

/** Wat je erover kwijt wilt is een paar zinnen, geen verslag. */
export const MAX_TEKST = 600;

/**
 * Hoe je erop terugkijkt.
 *
 * Vier antwoorden en geen daarvan is goed of fout. "Ik heb het gesprek niet
 * gevoerd" hoort er nadrukkelijk bij: dat gebeurt, en het is geen mislukking
 * die je moet wegklikken.
 */
export const TERUGBLIKKEN = [
  { id: "beter", label: "Beter dan ik had verwacht" },
  { id: "zoals-verwacht", label: "Ongeveer zoals ik verwachtte" },
  { id: "anders", label: "Anders dan ik hoopte" },
  { id: "niet-gevoerd", label: "Ik heb dit gesprek niet gevoerd" },
];

export const isTerugblik = (id) => TERUGBLIKKEN.some((t) => t.id === id);

/** Het label bij een terugblik, of een lege tekst als hij niet bestaat. */
export function terugblikLabel(id) {
  const gevonden = TERUGBLIKKEN.find((t) => t.id === id);
  return gevonden ? gevonden.label : "";
}

const alsGetal = (waarde) => {
  if (!waarde) return 0;
  if (typeof waarde.toMillis === "function") return waarde.toMillis();
  if (waarde instanceof Date) return waarde.getTime();
  const n = Date.parse(waarde);
  return Number.isFinite(n) ? n : 0;
};

const UUR = 60 * 60 * 1000;
const DAG = 24 * UUR;

/** Hoeveel hele dagen geleden was dit? Vandaag is 0. */
export function dagenGeleden(moment, nu = new Date()) {
  const t = alsGetal(moment);
  if (!t) return 0;
  return Math.max(0, Math.floor((nu.getTime() - t) / DAG));
}

/**
 * De adviessessie waar een terugblik bij past, of null.
 *
 * Voorwaarden: er is een situatie bij bekend, hij is oud genoeg dat het gesprek
 * geweest kan zijn, hij is niet zo oud dat terugkijken verzinnen wordt, en je
 * hebt er nog niet op teruggekeken. Van wat overblijft de meest recente — er
 * staat er dus nooit meer dan één tegelijk.
 */
export function openstaandeSessie({ sessies = [], reflecties = [], nu = new Date() } = {}) {
  const gedaan = new Set((reflecties || []).map((r) => r && r.sessieId).filter(Boolean));

  const rijp = (s) => {
    const t = alsGetal(s.opgevraagdOp);
    if (!t) return false;
    const uren = (nu.getTime() - t) / UUR;
    return uren >= WACHT_UREN && uren <= VERVALT_NA_DAGEN * 24;
  };

  return (
    [...(sessies || [])]
      .filter((s) => s && s.id && s.situatieId && !gedaan.has(s.id) && rijp(s))
      .sort((a, b) => alsGetal(b.opgevraagdOp) - alsGetal(a.opgevraagdOp))[0] || null
  );
}

/**
 * Waar de vraag over gaat, in één regel.
 *
 * Het label van een situatie is een zin in de ik-vorm ("Ik wil feedback
 * geven"), dus hij staat tussen aanhalingstekens en niet middenin een zin.
 */
export function waaroverInEenZin(sessie, label, nu = new Date()) {
  if (!sessie) return "";
  const dagen = dagenGeleden(sessie.opgevraagdOp, nu);
  const wanneer = dagen <= 1 ? "gisteren" : `${dagen} dagen geleden`;
  const waarover = label ? `: “${label}”` : "";
  return `Je vroeg hier ${wanneer} advies over${waarover}.`;
}

/** Wat er van een reflectie in de database mag komen. */
export function schoneReflectie({ terugblik, tekst } = {}) {
  if (!isTerugblik(terugblik)) return null;
  return {
    terugblik,
    tekst: String(tekst || "").trim().slice(0, MAX_TEKST),
  };
}

/** De nieuwste bovenaan; terugkijken leest van recent naar oud. */
export function sorteerReflecties(lijst = []) {
  return [...(lijst || [])]
    .filter((r) => r && isTerugblik(r.terugblik))
    .sort((a, b) => alsGetal(b.gemaaktOp) - alsGetal(a.gemaaktOp));
}
