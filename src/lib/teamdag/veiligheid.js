// De veiligheidsroute van de teamdag-generator.
//
// Deze module velt geen oordeel over de situatie en stelt niet vast of er
// formeel sprake is van pesten, intimidatie of discriminatie. Hij bepaalt
// alleen of de website meteen een regulier programma samenstelt, of eerst laat
// zien dat een zorgvuldige intake een verstandiger eerste stap is.

import { VEILIGHEIDSVRAGEN } from "../../data/teamdag/vragen.js";

export const VEILIGHEID_VELDEN = VEILIGHEIDSVRAGEN.map((v) => v.id);

/** Zijn alle veiligheidsvragen beantwoord? */
export function veiligheidCompleet(antwoorden = {}) {
  return VEILIGHEID_VELDEN.every((veld) => typeof antwoorden[veld] === "string" && antwoorden[veld].length > 0);
}

/**
 * Beoordeelt de antwoorden op de veiligheidsvragen.
 *
 * `route` is "intake" wanneer een gezamenlijke dag mogelijk niet de veiligste
 * eerste stap is. Dat blokkeert de generator niet: de gebruiker kan altijd
 * kiezen om de opzet toch te bekijken, maar krijgt eerst te zien waarom een
 * intake hier verstandiger is.
 *
 * `ruimte` is de veiligheidsruimte die werkvormen mogen vragen:
 *   3 = het team kan een confronterende werkvorm aan
 *   2 = er is basisvertrouwen
 *   1 = werk in kleine, veilige stappen
 */
export function beoordeelVeiligheid(antwoorden = {}) {
  const redenen = [];
  const aandachtspunten = [];

  const a = (veld) => antwoorden[veld] || "";

  if (a("onveilig-gedrag") === "ja") {
    redenen.push("Je gaf aan dat er signalen zijn van pesten, intimidatie, discriminatie of buitensluiten.");
  } else if (a("onveilig-gedrag") === "gedeeltelijk") {
    redenen.push("Je gaf aan dat er mogelijk signalen zijn van pesten, intimidatie, discriminatie of buitensluiten.");
  }

  if (a("conflict") === "ja") {
    redenen.push("Je gaf aan dat er op dit moment een openlijk conflict speelt.");
  }

  if (a("vrij-spreken") === "nee") {
    redenen.push("Je gaf aan dat teamleden zich niet vrij voelen om hun mening te geven.");
  }

  // Een leidinggevende die zelf partij is, is op zichzelf geen reden voor de
  // intakeroute. In combinatie met een conflict is het dat wel: dan is degene
  // die de dag wil begeleiden ook onderdeel van wat er besproken moet worden.
  const leidinggevendePartij = a("leidinggevende") === "ja";
  if (leidinggevendePartij && (a("conflict") === "ja" || a("conflict") === "gedeeltelijk")) {
    redenen.push("Je gaf aan dat de leidinggevende zelf onderdeel is van de spanning, terwijl er ook een conflict speelt.");
  }

  if (leidinggevendePartij) aandachtspunten.push("leidinggevendeSpanning");
  if (a("gebeurtenissen") === "ja" || a("gebeurtenissen") === "gedeeltelijk") aandachtspunten.push("gebeurtenissen");
  if (a("afspraken-vertrouwen") === "nee" || a("afspraken-vertrouwen") === "gedeeltelijk") aandachtspunten.push("afsprakenVertrouwen");

  let ruimte = 3;
  if (a("vrij-spreken") === "gedeeltelijk" || a("vrij-spreken") === "weet-niet") ruimte = 2;
  if (a("vrij-spreken") === "nee") ruimte = 1;
  if (a("conflict") === "gedeeltelijk" && ruimte > 2) ruimte = 2;
  if (a("conflict") === "ja") ruimte = Math.min(ruimte, 2);
  if (a("onveilig-gedrag") === "ja" || a("onveilig-gedrag") === "gedeeltelijk") ruimte = 1;
  if (leidinggevendePartij && ruimte > 2) ruimte = 2;

  return {
    compleet: veiligheidCompleet(antwoorden),
    route: redenen.length > 0 ? "intake" : "regulier",
    redenen,
    aandachtspunten,
    ruimte,
    leidinggevendePartij,
  };
}

/**
 * Mag de generator een programma tonen? Bij de intakeroute alleen wanneer de
 * gebruiker daar zelf expliciet voor kiest. De website gaat daar nooit
 * ongevraagd overheen.
 */
export function magProgrammaTonen(oordeel, tochGekozen = false) {
  if (!oordeel || !oordeel.compleet) return false;
  if (oordeel.route === "intake") return tochGekozen === true;
  return true;
}
