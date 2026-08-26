// Alle contentitems van de kennisbank die niet uit de blog komen.
//
// Dit bestand is bewust vrij van Vite-specifieke imports, zodat het
// validatiescript en de tests hem met gewone Node kunnen inlezen. De
// blogartikelen worden er in artikelen.js bij gevoegd; die module draait
// alleen in de browserbundel.

import { WERKVORMEN } from "./items-werkvormen.js";
import { TEAMDAG_WERKVORMEN } from "./items-werkvormen-teamdag.js";
import { REFLECTIEVRAGEN } from "./items-reflectie.js";
import { INTERVENTIES, EXPERIMENTEN } from "./items-beweging.js";
import { DOWNLOADS, GESPREKSVOORBEREIDERS } from "./items-hulpmiddelen.js";
import { SCANONDERDELEN, KENNISPAGINAS } from "./items-kennis.js";
import { SITUATIES } from "./taxonomie.js";

const STANDAARD = {
  vorm: "beide",
  niveau: "laag",
  voorbereiding: "Geen",
  status: "gepubliceerd",
  uitgelicht: false,
  domeinen: [],
  situaties: [],
  rollen: [],
  doelen: [],
  werkwijzen: [],
  tags: [],
  gerelateerd: [],
};

function uniek(lijst) {
  return [...new Set(lijst.filter(Boolean))];
}

/** Situaties die bij de tags van dit item passen. Zo hoeft niet elk item alle
 *  situaties handmatig op te sommen; wat er staat wordt aangevuld, nooit
 *  overschreven. */
export function situatiesUitTags(tags = []) {
  return SITUATIES.filter((s) => !s.breed && s.tags.some((tag) => tags.includes(tag))).map((s) => s.id);
}

/**
 * Vult ontbrekende velden aan en berekent de afgeleide velden. Gebruikt door
 * deze module en door de blogadapter, zodat elk item dezelfde vorm heeft.
 */
export function normaliseerItem(ruw, type) {
  const item = { ...STANDAARD, ...ruw, type: ruw.type || type };
  item.tags = uniek(item.tags);
  item.situaties = uniek([...item.situaties, ...situatiesUitTags(item.tags)]);
  item.domeinen = uniek(item.domeinen);
  item.rollen = uniek(item.rollen);
  item.doelen = uniek(item.doelen);
  item.werkwijzen = uniek(item.werkwijzen);
  item.intern = !item.url;
  item.href = item.url || "/kennisbank/" + item.type + "/" + item.slug;
  item.bron = item.url ? (item.url.startsWith("/blog/") ? "blog" : "website") : "kennisbank";
  if (item.tijdMinuten === undefined) item.tijdMinuten = null;
  return item;
}

function bundel(lijst, type) {
  return lijst.map((ruw) => normaliseerItem(ruw, type));
}

/** Alle handgeschreven items, in de volgorde waarin ze in de bestanden staan. */
export const BASIS_ITEMS = [
  ...bundel(KENNISPAGINAS, "artikel"),
  ...bundel(REFLECTIEVRAGEN, "reflectievraag"),
  ...bundel(WERKVORMEN, "werkvorm"),
  ...bundel(TEAMDAG_WERKVORMEN, "werkvorm"),
  ...bundel(INTERVENTIES, "interventie"),
  ...bundel(EXPERIMENTEN, "experiment"),
  ...bundel(DOWNLOADS, "download"),
  ...bundel(GESPREKSVOORBEREIDERS, "gespreksvoorbereider"),
  ...bundel(SCANONDERDELEN, "scan"),
];

/** Items met een eigen detailpagina binnen de kennisbank. */
export const INTERNE_ITEMS = BASIS_ITEMS.filter((item) => item.intern);

/**
 * Zoekt een item op via een verwijzing uit het veld `gerelateerd`.
 * Toegestaan zijn een id ("wv-laatste-ronde") of een pad met voorvoegsel
 * ("art:/psychologische-veiligheid").
 */
export function zoekItem(referentie, items = BASIS_ITEMS) {
  if (!referentie) return null;
  if (referentie.startsWith("art:")) {
    const pad = referentie.slice(4);
    return items.find((item) => item.url === pad) || null;
  }
  return items.find((item) => item.id === referentie) || null;
}

export default BASIS_ITEMS;
