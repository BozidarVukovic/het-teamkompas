// Verzamelpunt van alle kennisbankcontent voor de website.
// Draait alleen in de Vite-bundel, omdat de blogartikelen via import.meta.glob
// worden ingelezen. Node-scripts en tests gebruiken items.js.

import { BASIS_ITEMS, INTERNE_ITEMS, zoekItem } from "./items.js";
import { ARTIKEL_ITEMS } from "./artikelen.js";

export const ALLE_ITEMS = [...BASIS_ITEMS, ...ARTIKEL_ITEMS];

const opId = new Map(ALLE_ITEMS.map((item) => [item.id, item]));
const opHref = new Map(ALLE_ITEMS.map((item) => [item.href, item]));

/** Zoekt een item op id, op pad, of op een verwijzing met voorvoegsel art:. */
export function itemVia(referentie) {
  if (!referentie) return null;
  if (referentie.startsWith("art:")) return opHref.get(referentie.slice(4)) || null;
  return opId.get(referentie) || opHref.get(referentie) || null;
}

/** Het item achter /kennisbank/<type>/<slug>. */
export function itemViaPad(type, slug) {
  return opHref.get("/kennisbank/" + type + "/" + slug) || null;
}

export { BASIS_ITEMS, INTERNE_ITEMS, zoekItem };
export default ALLE_ITEMS;
