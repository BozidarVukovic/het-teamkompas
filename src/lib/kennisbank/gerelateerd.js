// Gerelateerde content bij een detailpagina.
//
// Volgorde is inhoudelijk: begrijpen, reflecteren, bespreken, oefenen, meten en
// evalueren. Een artikel verwijst dus eerder naar een reflectiekaart dan
// andersom. Handmatig vastgelegde relaties gaan altijd voor.

import { contenttype } from "../../data/kennisbank/taxonomie.js";

/** De inhoudelijke fase per contenttype. Lager getal is eerder in de route. */
export const FASE = {
  artikel: 1,
  reflectievraag: 2,
  gespreksvoorbereider: 3,
  werkvorm: 3,
  download: 3,
  interventie: 4,
  experiment: 4,
  scan: 5,
};

function overlap(a = [], b = []) {
  return a.filter((waarde) => b.includes(waarde)).length;
}

/**
 * Bepaalt maximaal `limiet` gerelateerde items. Het item verwijst nooit naar
 * zichzelf. Handmatige relaties komen eerst, daarna wordt aangevuld op basis
 * van gedeelde tags, domein en gewenst resultaat.
 */
export function gerelateerdeItems(item, alleItems, zoekVia, limiet = 3) {
  if (!item) return [];
  const handmatig = (item.gerelateerd || [])
    .map((referentie) => zoekVia(referentie))
    .filter((gevonden) => gevonden && gevonden.id !== item.id);

  const gekozen = [...new Map(handmatig.map((gevonden) => [gevonden.id, gevonden])).values()];
  if (gekozen.length >= limiet) return sorteerOpFase(gekozen.slice(0, limiet), item);

  const kandidaten = alleItems
    .filter((ander) => ander.id !== item.id && !gekozen.some((g) => g.id === ander.id))
    .map((ander) => ({
      item: ander,
      score: overlap(item.tags, ander.tags) * 3
        + overlap(item.domeinen, ander.domeinen) * 2
        + overlap(item.doelen, ander.doelen) * 2
        + overlap(item.situaties, ander.situaties)
        + (FASE[ander.type] > FASE[item.type] ? 2 : 0)
        + (ander.uitgelicht ? 1 : 0),
    }))
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score || a.item.titel.localeCompare(b.item.titel, "nl"));

  kandidaten.forEach(({ item: kandidaat }) => {
    if (gekozen.length < limiet) gekozen.push(kandidaat);
  });

  return sorteerOpFase(gekozen.slice(0, limiet), item);
}

function sorteerOpFase(items, bron) {
  return [...items].sort((a, b) => {
    const faseA = FASE[a.type] || 9;
    const faseB = FASE[b.type] || 9;
    const bronFase = FASE[bron.type] || 1;
    const naA = faseA >= bronFase ? 0 : 1;
    const naB = faseB >= bronFase ? 0 : 1;
    return naA - naB || faseA - faseB || a.titel.localeCompare(b.titel, "nl");
  });
}

export function bucketVan(item) {
  return contenttype(item.type).bucket;
}

export default gerelateerdeItems;
