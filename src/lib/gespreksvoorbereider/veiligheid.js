// De veiligheidsroute bij het bespreken van onveilig gedrag.
//
// Deze module velt geen oordeel over de situatie en stelt niet vast of er
// formeel sprake is van pesten, intimidatie of discriminatie. Hij bepaalt
// alleen of de website meteen doorgaat met een gewone voorbereiding, of eerst
// laat zien dat er ondersteuning beschikbaar is.

import { VEILIGHEIDSVRAGEN } from "../../data/gespreksvoorbereider/teksten.js";

export const VEILIGHEID_VELDEN = VEILIGHEIDSVRAGEN.map((v) => v.id);

/** Zijn alle vier de vragen beantwoord? */
export function veiligheidCompleet(antwoorden = {}) {
  return VEILIGHEID_VELDEN.every((veld) => antwoorden[veld] === "ja" || antwoorden[veld] === "nee");
}

/**
 * Beoordeelt de antwoorden op de veiligheidscheck.
 *
 * `risico` betekent hier: hier hoort iemand bij betrokken te worden. Het
 * betekent niet dat de gebruiker het gesprek niet mag voeren; die keuze blijft
 * aan de gebruiker zelf.
 */
export function beoordeelVeiligheid(antwoorden = {}) {
  const redenen = [];
  if (antwoorden.veilig === "nee") redenen.push("Je gaf aan dat je je niet veilig voelt om dit gesprek zelf te voeren.");
  if (antwoorden.ernst === "ja") redenen.push("Je gaf aan dat er sprake kan zijn van dreiging, discriminatie, intimidatie, agressie of mogelijk strafbaar gedrag.");
  if (antwoorden.steun === "ja") redenen.push("Je gaf aan ondersteuning nodig te hebben.");

  const machtsverschil = antwoorden.macht === "ja";
  if (machtsverschil) {
    redenen.push("De ander heeft formele macht over jou. Dat maakt het gesprek ongelijk, ook wanneer de ander dat zelf niet zo ervaart.");
  }

  return {
    compleet: veiligheidCompleet(antwoorden),
    risico: redenen.length > 0 && (antwoorden.veilig === "nee" || antwoorden.ernst === "ja" || antwoorden.steun === "ja"),
    machtsverschil,
    redenen,
  };
}

/** Mag de gebruiker door naar de gewone voorbereiding? Bij risico alleen na een
 *  expliciete eigen keuze; de website gaat daar nooit ongevraagd overheen. */
export function magDoorgaan(antwoorden = {}, situatieId, doorgaanGekozen = false) {
  if (situatieId !== "onveilig-gedrag") return true;
  const oordeel = beoordeelVeiligheid(antwoorden);
  if (!oordeel.compleet) return false;
  return oordeel.risico ? Boolean(doorgaanGekozen) : true;
}
