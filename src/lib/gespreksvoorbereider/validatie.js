// Invoervalidatie en het herkennen van interpretaties.
//
// De controle op signaalwoorden is een hulpmiddel en geen oordeel: de tool
// blokkeert nooit op basis hiervan, hij wijst er alleen op.

import { SIGNAALWOORDEN, stap } from "../../data/gespreksvoorbereider/stappen.js";

export const MAX_TEKST = 1500;

export function schoon(tekst = "") {
  if (tekst === null || tekst === undefined) return "";
  return String(tekst).replace(/\s+/g, " ").trim();
}

/** Signaalwoorden die op een interpretatie kunnen wijzen. */
export function bevatSignaalwoorden(tekst = "") {
  const laag = " " + schoon(tekst).toLowerCase() + " ";
  return SIGNAALWOORDEN.filter((woord) => laag.includes(" " + woord) || laag.includes(woord + " "));
}

/** Absolute woorden die we in het eindformat liever vermijden. */
export function bevatAbsoluteWoorden(tekst = "") {
  const laag = " " + schoon(tekst).toLowerCase() + " ";
  return ["altijd", "nooit", "iedereen", "niemand"].filter((woord) => laag.includes(" " + woord + " "));
}

function teKort(waarde, minimum) {
  return schoon(waarde).length < (minimum || 1);
}

/**
 * Valideert één stap. Geeft per veld een begrijpelijke melding terug, zodat de
 * interface precies kan tonen wat er ontbreekt.
 */
export function valideerStap(stapId, antwoorden = {}, situatieId = "") {
  const definitie = stap(stapId, situatieId);
  const fouten = {};
  if (!definitie) return { geldig: true, fouten };

  const waarde = antwoorden[definitie.veld];

  if (definitie.type === "tekst") {
    if (definitie.verplicht && teKort(waarde, definitie.minLengte)) {
      fouten[definitie.veld] = "Schrijf hier minstens één volledige zin, zodat je het gesprek er straks op kunt bouwen.";
    } else if (schoon(waarde).length > MAX_TEKST) {
      fouten[definitie.veld] = "Dit is langer dan " + MAX_TEKST + " tekens. Kort het in tot de kern.";
    }
  }

  if (definitie.type === "keuze" && definitie.verplicht && !waarde) {
    fouten[definitie.veld] = "Kies één van de opties om verder te gaan.";
  }

  if (definitie.type === "meerkeuze") {
    const gekozen = Array.isArray(waarde) ? waarde : [];
    const eigen = definitie.eigenVeld ? schoon(antwoorden[definitie.eigenVeld.veld]) : "";
    if (definitie.verplicht && !gekozen.length && !eigen) {
      fouten[definitie.veld] = "Kies minstens één optie, of schrijf je eigen formulering.";
    }
    if (definitie.max && gekozen.length > definitie.max) {
      fouten[definitie.veld] = "Kies er maximaal " + definitie.max + ".";
    }
    if (definitie.extraVraag && definitie.extraVraag.verplicht && teKort(antwoorden[definitie.extraVraag.veld], definitie.extraVraag.minLengte)) {
      fouten[definitie.extraVraag.veld] = "Beschrijf in één zin wat een kleine, realistische verbetering zou zijn.";
    }
  }

  if (definitie.type === "effect") {
    const effect = waarde || {};
    const ingevuld = Object.values(effect).some((deel) => deel && deel.schaal && deel.schaal !== "nvt" && schoon(deel.tekst));
    const gekozen = Object.values(effect).some((deel) => deel && deel.schaal);
    if (!gekozen) fouten[definitie.veld] = "Geef bij minstens één onderdeel aan hoe groot het effect is.";
    else if (!ingevuld) fouten[definitie.veld] = "Beschrijf bij minstens één onderdeel in eigen woorden wat er gebeurt.";
  }

  if (definitie.type === "velden") {
    (definitie.velden || []).forEach((veld) => {
      if (veld.verplicht && teKort((waarde || {})[veld.id], veld.minLengte)) {
        fouten[definitie.veld + "." + veld.id] = "Dit veld hebben we nodig voor de voorbereiding.";
      }
    });
    if (definitie.extraKeuze && definitie.extraKeuze.verplicht && !antwoorden[definitie.extraKeuze.veld]) {
      fouten[definitie.extraKeuze.veld] = "Kies één van de opties om verder te gaan.";
    }
  }

  // De controlelijst is een hulpmiddel: openstaande vinkjes houden niemand tegen.
  return { geldig: Object.keys(fouten).length === 0, fouten };
}

/** Alle stappen van een route in één keer nalopen. */
export function valideerRoute(stapIds = [], antwoorden = {}, situatieId = "") {
  return stapIds.reduce((verzameld, stapId) => {
    const { fouten } = valideerStap(stapId, antwoorden, situatieId);
    return Object.keys(fouten).length ? { ...verzameld, [stapId]: fouten } : verzameld;
  }, {});
}
