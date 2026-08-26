// Lokale opslag van de teamdag-generator.
//
// Alles blijft in de browser van de gebruiker. Er gaat niets naar een server.
// De vrije toelichting wordt wel lokaal bewaard, maar komt nooit in een
// deelbare link en nooit in analytics.

const SLEUTEL = "teamkompas.teamdag.v1";

function opslagRuimte() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Is dit antwoordobject leeg? Voorkomt dat een lege staat een bewaarde staat overschrijft. */
export function isLeeg(antwoorden) {
  if (!antwoorden || typeof antwoorden !== "object") return true;
  return Object.entries(antwoorden).every(([, waarde]) => {
    if (waarde == null) return true;
    if (typeof waarde === "string") return waarde.trim() === "";
    if (Array.isArray(waarde)) return waarde.length === 0;
    if (typeof waarde === "object") return Object.keys(waarde).length === 0;
    return false;
  });
}

export function bewaar(antwoorden) {
  const ruimte = opslagRuimte();
  if (!ruimte) return false;
  if (isLeeg(antwoorden)) return false;
  try {
    ruimte.setItem(SLEUTEL, JSON.stringify({ opgeslagen: new Date().toISOString(), antwoorden }));
    return true;
  } catch {
    return false;
  }
}

export function lees() {
  const ruimte = opslagRuimte();
  if (!ruimte) return null;
  try {
    const rauw = ruimte.getItem(SLEUTEL);
    if (!rauw) return null;
    const data = JSON.parse(rauw);
    return data && typeof data === "object" ? data.antwoorden || null : null;
  } catch {
    return null;
  }
}

export function wis() {
  const ruimte = opslagRuimte();
  if (!ruimte) return false;
  try {
    ruimte.removeItem(SLEUTEL);
    return true;
  } catch {
    return false;
  }
}
