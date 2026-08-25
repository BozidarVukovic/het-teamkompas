// Favorieten worden lokaal in de browser bewaard. Er gaat niets naar een server
// en er is geen account voor nodig. De bezoeker kan alles met één knop wissen.

export const OPSLAGSLEUTEL = "teamkompas:kennisbank:favorieten";
export const KEUZESLEUTEL = "teamkompas:kennisbank:laatste-keuze";

function opslag() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function leesFavorieten() {
  const bron = opslag();
  if (!bron) return [];
  try {
    const ruw = JSON.parse(bron.getItem(OPSLAGSLEUTEL) || "[]");
    return Array.isArray(ruw) ? ruw.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function schrijfFavorieten(ids) {
  const bron = opslag();
  if (!bron) return false;
  try {
    bron.setItem(OPSLAGSLEUTEL, JSON.stringify([...new Set(ids)]));
    return true;
  } catch {
    return false;
  }
}

export function wisselFavoriet(id, huidige = leesFavorieten()) {
  const nieuw = huidige.includes(id) ? huidige.filter((bestaand) => bestaand !== id) : [...huidige, id];
  schrijfFavorieten(nieuw);
  return nieuw;
}

/** Verwijdert alles wat de kennisbank lokaal heeft bewaard. */
export function wisAlles() {
  const bron = opslag();
  if (!bron) return false;
  try {
    bron.removeItem(OPSLAGSLEUTEL);
    bron.removeItem(KEUZESLEUTEL);
    return true;
  } catch {
    return false;
  }
}

export function bewaarKeuze(keuze) {
  const bron = opslag();
  if (!bron) return false;
  try {
    bron.setItem(KEUZESLEUTEL, JSON.stringify(keuze));
    return true;
  } catch {
    return false;
  }
}

export function leesKeuze() {
  const bron = opslag();
  if (!bron) return null;
  try {
    const ruw = JSON.parse(bron.getItem(KEUZESLEUTEL) || "null");
    return ruw && typeof ruw === "object" ? ruw : null;
  } catch {
    return null;
  }
}
