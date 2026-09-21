// Licht of donker, en wie dat bepaalt.
//
// Drie standen, en "systeem" is de standaard: dan volgt de app wat je op je
// telefoon of laptop al hebt ingesteld. Kies je zelf, dan blijft die keuze
// staan tot je hem verandert.
//
// De voorkeur staat per apparaat en niet op je account. Dat is met opzet: dit
// gaat over het scherm waar je naar kijkt, niet over wie je bent. Dezelfde
// persoon wil op een telefoon in een donkere vergaderzaal iets anders dan op
// een laptop bij het raam.
//
// Wat op <html> komt te staan is altijd "licht" of "donker", nooit "systeem".
// De vertaalslag gebeurt hier, zodat de stylesheet de donkere set een keer
// hoeft te beschrijven in plaats van twee keer.

export const SLEUTEL = "tk-thema";

export const STANDEN = [
  { id: "systeem", label: "Systeem", uitleg: "Volgt je telefoon of laptop" },
  { id: "licht", label: "Licht", uitleg: "Altijd licht" },
  { id: "donker", label: "Donker", uitleg: "Altijd donker" },
];

const IDS = STANDEN.map((s) => s.id);

/** Is dit een stand die we kennen? Alles wat we niet kennen wordt "systeem". */
export function leesStand(waarde) {
  return IDS.includes(waarde) ? waarde : "systeem";
}

/**
 * Wat er op het scherm komt: licht of donker.
 *
 * Pure functie met de systeemvoorkeur als argument, zodat hij te testen is
 * zonder browser.
 */
export function bepaalThema(stand, systeemIsDonker) {
  const gekozen = leesStand(stand);
  if (gekozen === "donker") return "donker";
  if (gekozen === "licht") return "licht";
  return systeemIsDonker ? "donker" : "licht";
}

/** Wat het apparaat zelf zegt. Buiten een browser: licht. */
export function systeemDonker() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function haalStand() {
  try {
    return leesStand(window.localStorage.getItem(SLEUTEL));
  } catch {
    // Privémodus, of opslag uitgezet. Geen reden om de app te laten struikelen.
    return "systeem";
  }
}

export function bewaarStand(stand) {
  try {
    window.localStorage.setItem(SLEUTEL, leesStand(stand));
  } catch {
    // Dan geldt de keuze alleen deze sessie. Beter dan een foutmelding.
  }
}

/** Zet het thema op <html>, waar de stylesheet het leest. */
export function pasToe(stand) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-tk-thema", bepaalThema(stand, systeemDonker()));
}

/**
 * Luister mee met het apparaat, zodat de app meedraait als de telefoon om
 * zes uur 's avonds naar donker gaat. Alleen zinvol zolang de stand "systeem"
 * is; wie zelf gekozen heeft, heeft gekozen.
 */
export function volgSysteem(opWijziging) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const vraag = window.matchMedia("(prefers-color-scheme: dark)");
  const luister = () => opWijziging();
  vraag.addEventListener("change", luister);
  return () => vraag.removeEventListener("change", luister);
}
