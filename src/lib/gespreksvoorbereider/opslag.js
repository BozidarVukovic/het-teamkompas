// Lokale opslag van de gespreksvoorbereiding.
//
// Alles blijft in de browser van de bezoeker. Er gaat niets naar een server en
// niets naar analytics. De gebruiker kan alles in één klik wissen.

export const OPSLAGSLEUTEL = "teamkompas:gespreksvoorbereider:v1";
export const REFLECTIESLEUTEL = "teamkompas:gespreksvoorbereider:reflectie:v1";

function opslag() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function lees(sleutel, terugval) {
  const bron = opslag();
  if (!bron) return terugval;
  try {
    const ruw = JSON.parse(bron.getItem(sleutel) || "null");
    return ruw && typeof ruw === "object" && !Array.isArray(ruw) ? ruw : terugval;
  } catch {
    return terugval;
  }
}

function schrijf(sleutel, waarde) {
  const bron = opslag();
  if (!bron) return false;
  try {
    bron.setItem(sleutel, JSON.stringify(waarde));
    return true;
  } catch {
    // Opslag kan vol of geblokkeerd zijn. De voorbereiding blijft dan gewoon
    // werken binnen deze sessie; alleen het onthouden vervalt.
    return false;
  }
}

export function leesAntwoorden() {
  return lees(OPSLAGSLEUTEL, {});
}

export function bewaarAntwoorden(antwoorden) {
  return schrijf(OPSLAGSLEUTEL, antwoorden || {});
}

export function leesReflectie() {
  return lees(REFLECTIESLEUTEL, {});
}

export function bewaarReflectie(reflectie) {
  return schrijf(REFLECTIESLEUTEL, reflectie || {});
}

/** Verwijdert alles wat de gespreksvoorbereider lokaal heeft bewaard. */
export function wisAlles() {
  const bron = opslag();
  if (!bron) return false;
  try {
    bron.removeItem(OPSLAGSLEUTEL);
    bron.removeItem(REFLECTIESLEUTEL);
    return true;
  } catch {
    return false;
  }
}

/** Is er iets bewaard? Bepaalt of we de knop om te wissen tonen. */
export function heeftOpslag() {
  const bron = opslag();
  if (!bron) return false;
  try {
    return Boolean(bron.getItem(OPSLAGSLEUTEL) || bron.getItem(REFLECTIESLEUTEL));
  } catch {
    return false;
  }
}
