// Deelbare link van de teamdag-generator.
//
// In de link staan uitsluitend de gekozen ids uit de vaste antwoordopties.
// Vrije tekst — de toelichting bij de aanleiding en de eigen formulering van
// wat er zichtbaar anders moet zijn — gaat er nooit in mee. Zo bevat een
// gedeelde link nooit iets wat over personen of een situatie gaat.

import {
  ROLLEN,
  TEAMGROOTTES,
  TEAMTYPES,
  BESTAANSDUUR,
  AFHANKELIJKHEID,
  AANLEIDINGEN,
  RESULTATEN,
  TIJDSOPTIES,
  SETTINGS,
  RUIMTEOPTIES,
  AANWEZIGHEID,
  WERKWIJZEN,
  ERVARING,
  OPVOLGING,
  VEILIGHEID_OPTIES,
  VEILIGHEIDSVRAGEN,
} from "../../data/teamdag/vragen.js";

// Korte sleutels houden de link leesbaar.
const ENKEL = {
  r: ["rol", ROLLEN],
  g: ["teamgrootte", TEAMGROOTTES],
  t: ["teamtype", TEAMTYPES],
  d: ["bestaansduur", BESTAANSDUUR],
  f: ["afhankelijkheid", AFHANKELIJKHEID],
  u: ["tijd", TIJDSOPTIES],
  s: ["setting", SETTINGS],
  m: ["ruimte", RUIMTEOPTIES],
  n: ["aanwezigheid", AANWEZIGHEID],
  e: ["ervaring", ERVARING],
  o: ["opvolging", OPVOLGING],
};

const MEERVOUD = {
  a: ["aanleidingen", AANLEIDINGEN],
  q: ["resultaten", RESULTATEN],
  w: ["werkwijzen", WERKWIJZEN],
};

const geldig = (lijst, id) => lijst.some((x) => x.id === id);

/** Zet antwoorden om in queryparameters. Vrije tekst blijft achterwege. */
export function naarQuery(antwoorden = {}) {
  const params = new URLSearchParams();

  Object.entries(ENKEL).forEach(([sleutel, [veld, lijst]]) => {
    const waarde = antwoorden[veld];
    if (waarde && geldig(lijst, waarde)) params.set(sleutel, waarde);
  });

  Object.entries(MEERVOUD).forEach(([sleutel, [veld, lijst]]) => {
    const waarden = (antwoorden[veld] || []).filter((id) => geldig(lijst, id));
    if (waarden.length) params.set(sleutel, waarden.join(","));
  });

  const v = antwoorden.veiligheid || {};
  const veiligheid = VEILIGHEIDSVRAGEN.map((vraag) => {
    const antwoord = v[vraag.id];
    return geldig(VEILIGHEID_OPTIES, antwoord) ? antwoord[0] : "-";
  }).join("");
  if (veiligheid.replace(/-/g, "").length) params.set("v", veiligheid);

  if (antwoorden.pauze === "nee") params.set("p", "n");

  return params.toString();
}

/** Leest antwoorden terug uit queryparameters. Onbekende waarden worden genegeerd. */
export function uitQuery(query) {
  const params = new URLSearchParams(query || "");
  const uit = {};

  Object.entries(ENKEL).forEach(([sleutel, [veld, lijst]]) => {
    const waarde = params.get(sleutel);
    if (waarde && geldig(lijst, waarde)) uit[veld] = waarde;
  });

  Object.entries(MEERVOUD).forEach(([sleutel, [veld, lijst]]) => {
    const rauw = params.get(sleutel);
    if (!rauw) return;
    const waarden = rauw.split(",").filter((id) => geldig(lijst, id));
    if (waarden.length) uit[veld] = waarden;
  });

  const v = params.get("v");
  if (v) {
    const veiligheid = {};
    VEILIGHEIDSVRAGEN.forEach((vraag, i) => {
      const letter = v[i];
      const optieMatch = VEILIGHEID_OPTIES.find((o) => o.id[0] === letter);
      if (optieMatch) veiligheid[vraag.id] = optieMatch.id;
    });
    if (Object.keys(veiligheid).length) uit.veiligheid = veiligheid;
  }

  if (params.get("p") === "n") uit.pauze = "nee";

  return uit;
}

/** Bouwt de volledige deelbare URL. */
export function deelbareUrl(antwoorden, basis = "https://www.mijnteamkompas.nl/teamdag-generator") {
  const query = naarQuery(antwoorden);
  return query ? `${basis}?${query}` : basis;
}
