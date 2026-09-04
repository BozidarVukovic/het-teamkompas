// Welke onderdelen staan in de navigatie, en wanneer licht er één op.
//
// Losse module en geen React, zodat er een test op kan die bewaakt wat er op
// een telefoon misgaat: meer onderdelen dan er passen, of een onderdeel dat
// nergens oplicht zodat je niet ziet waar je bent.
//
// Vier is het maximum. Zes paste niet op een telefoon zonder horizontaal te
// schuiven, en wat je opzij moet schuiven bestaat voor de meeste mensen niet.
// Mijn profiel, mijn handleiding en mijn gegevens vielen daarom samen onder
// "Ik" — het zijn alle drie dingen over jezelf.

export const MAX_ONDERDELEN = 4;

// "paden" bepaalt wanneer een onderdeel oplicht. Wie op Mijn handleiding staat,
// is nog steeds bij zichzelf, dus dan hoort "Ik" actief te zijn.
export const ONDERDELEN = [
  { id: "start", pad: "/app", label: "Start", exact: true, paden: ["/app"] },
  // Het tabblad heet "Advies" en de pagina "Samenwerken". Dat is geen slordigheid:
  // "Samenwerken" heeft 93 pixels nodig en er is er in een vierdelige balk 89 op
  // een scherm van 393 -- op 375 en 360 nog minder. Een kortere naam lost dat op
  // elke telefoon op; een kleinere marge nergens. "Advies" is bovendien wat je
  // daar haalt.
  { id: "samenwerken", pad: "/app/samenwerken", label: "Advies", paden: ["/app/samenwerken"] },
  { id: "team", pad: "/app/team", label: "Team", paden: ["/app/team", "/app/teambeeld"] },
  {
    id: "ik",
    pad: "/app/ik",
    label: "Ik",
    paden: ["/app/ik", "/app/profiel", "/app/handleiding", "/app/gegevens"],
  },
];

/** Hoort dit onderdeel op te lichten bij dit adres? */
export function isActief(onderdeel, pad) {
  if (!onderdeel || typeof pad !== "string") return false;
  const schoon = pad.length > 1 && pad.endsWith("/") ? pad.slice(0, -1) : pad;
  if (onderdeel.exact) return schoon === onderdeel.pad;
  return (onderdeel.paden || []).some((p) => schoon === p || schoon.startsWith(`${p}/`));
}

/** Het onderdeel dat bij dit adres hoort, of niets. */
export function actiefOnderdeel(pad) {
  return ONDERDELEN.find((o) => isActief(o, pad)) || null;
}
