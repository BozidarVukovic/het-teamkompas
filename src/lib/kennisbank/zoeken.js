// Lokale zoekfunctie. Geen externe zoekdienst: de hoeveelheid content past
// ruim in het geheugen en doorzoeken kost minder dan een milliseconde.

import { SYNONIEMEN, SITUATIES, DOELEN, DOMEINEN, tagLabel } from "../../data/kennisbank/taxonomie.js";

function normaliseer(tekst = "") {
  return tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Splitst de zoekopdracht in losse woorden en houdt de hele zin apart, zodat
 *  ook synoniemen van twee woorden ("hulp vragen") gevonden worden. */
export function woorden(zoekterm = "") {
  const schoon = normaliseer(zoekterm);
  if (!schoon) return [];
  return [...new Set(schoon.split(" ").filter((woord) => woord.length > 2))];
}

/** Zoekt de hoofdtags die bij een zoekterm horen, via het synoniemenwoordenboek. */
export function tagsVoorZoekterm(zoekterm = "") {
  const schoon = normaliseer(zoekterm);
  // Een lege of heel korte zoekterm zit per definitie in elk woord. Zonder deze
  // grens zou een leeg zoekveld alle tags opleveren, en dus alle content.
  if (schoon.length < 3) return [];
  const gevonden = [];
  Object.entries(SYNONIEMEN).forEach(([woord, tags]) => {
    const genormaliseerd = normaliseer(woord);
    if (genormaliseerd.length < 3) return;
    if (schoon === genormaliseerd || schoon.includes(genormaliseerd) || genormaliseerd.includes(schoon)) {
      gevonden.push(...tags);
    }
  });
  woorden(zoekterm).forEach((woord) => {
    Object.entries(SYNONIEMEN).forEach(([sleutel, tags]) => {
      const genormaliseerd = normaliseer(sleutel);
      if (genormaliseerd === woord || genormaliseerd.startsWith(woord) || woord.startsWith(genormaliseerd)) {
        gevonden.push(...tags);
      }
    });
  });
  return [...new Set(gevonden)];
}

function zoekvelden(item) {
  const situatieLabels = item.situaties.map((id) => (SITUATIES.find((s) => s.id === id) || {}).label || "");
  const doelLabels = item.doelen.map((id) => (DOELEN.find((d) => d.id === id) || {}).label || "");
  const domeinLabels = item.domeinen.map((id) => (DOMEINEN.find((d) => d.id === id) || {}).label || "");
  return {
    titel: normaliseer(item.titel),
    samenvatting: normaliseer(item.samenvatting || ""),
    tags: normaliseer(item.tags.map(tagLabel).join(" ") + " " + item.tags.join(" ")),
    context: normaliseer([...situatieLabels, ...doelLabels, ...domeinLabels].join(" ")),
  };
}

/**
 * Doorzoekt titel, samenvatting, tags, domeinen, teamsituaties en gewenste
 * resultaten. Synoniemen tellen mee, maar wegen minder zwaar dan een letterlijke
 * treffer in de titel.
 */
export function zoek(items, zoekterm = "") {
  const termen = woorden(zoekterm);
  const synoniemTags = tagsVoorZoekterm(zoekterm);
  if (!termen.length && !synoniemTags.length) return [];

  return items
    .map((item) => {
      const velden = zoekvelden(item);
      let score = 0;
      termen.forEach((term) => {
        if (velden.titel.includes(term)) score += 10;
        if (velden.tags.includes(term)) score += 6;
        if (velden.samenvatting.includes(term)) score += 4;
        if (velden.context.includes(term)) score += 2;
      });
      const viaSynoniem = synoniemTags.filter((tag) => item.tags.includes(tag));
      score += viaSynoniem.length * 3;
      return { item, score, viaSynoniem };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.item.uitgelicht) - Number(a.item.uitgelicht) || a.item.titel.localeCompare(b.item.titel, "nl"));
}

export default zoek;
