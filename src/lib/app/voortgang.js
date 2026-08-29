// Hoe compleet is een profiel?
//
// Eén plek waar dat wordt uitgerekend, zodat het startscherm en de profielpagina
// hetzelfde getal laten zien. Pure functie: geen React, geen database.
//
// Een profiel is pas nuttig als er drie dingen zijn gebeurd, en die tellen alle
// drie even zwaar mee:
//
//   1. ingevuld  — er staat een antwoord
//   2. nagelopen — jij hebt bevestigd dat het klopt (of het zelf gekozen)
//   3. gedeeld   — je teamgenoten kunnen er rekening mee houden
//
// Twaalf kenmerken maal drie is zesendertig punten. Wie zijn Insights-profiel
// uploadt zit meteen op een derde; wie alles naloopt op twee derde; wie deelt op
// honderd procent. Die volgorde is precies de volgorde waarin het werkt.

import { KENMERK_IDS } from "../../data/app/kenmerken.js";
import { SECTIES } from "../../data/app/handleiding.js";

export const STAPPEN_PER_KENMERK = 3;

export const TE_DOEN = ["ingevuld", "nagelopen", "gedeeld"];

/**
 * Vraagt dit kenmerk nog aandacht voor een bepaalde stap?
 *
 * Dezelfde vraag die het percentage beantwoordt, maar dan per punt — zodat de
 * knop "nalopen wat nog open staat" precies de punten toont die meetellen in
 * dat balkje. Anders zeggen het getal en de lijst iets anders.
 */
export function vraagtAandacht({ kenmerk, doen, sleutel = null }) {
  const ingevuld = Boolean(kenmerk && kenmerk.waarde && kenmerk.bevestigd !== "nee");
  if (doen === "ingevuld") return !ingevuld;
  if (doen === "nagelopen") return ingevuld && !kenmerk.bevestigd;
  if (doen === "gedeeld") {
    return ingevuld && Boolean(sleutel) && !(kenmerk.gedeeldMet || []).includes(sleutel);
  }
  return false;
}

export function bepaalVoortgang({ kenmerken = [], actiefTeam = null, handleiding = {} } = {}) {
  const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;

  const perId = {};
  kenmerken.forEach((k) => {
    if (k && k.kenmerkId) perId[k.kenmerkId] = k;
  });

  let ingevuld = 0;
  let nagelopen = 0;
  let gedeeld = 0;

  KENMERK_IDS.forEach((id) => {
    const k = perId[id];
    if (!k || !k.waarde || k.bevestigd === "nee") return;
    ingevuld += 1;
    if (k.bevestigd) nagelopen += 1;
    if (sleutel && (k.gedeeldMet || []).includes(sleutel)) gedeeld += 1;
  });

  const van = KENMERK_IDS.length;
  const behaald = ingevuld + nagelopen + gedeeld;
  const totaal = van * STAPPEN_PER_KENMERK;
  const percentage = totaal === 0 ? 0 : Math.round((behaald / totaal) * 100);

  const secties = SECTIES.filter((s) => handleiding[s.id] && handleiding[s.id].tekst).length;

  const onderdelen = [
    {
      id: "ingevuld",
      label: "Ingevuld",
      aantal: ingevuld,
      van,
      uitleg: "Bij hoeveel van de twaalf punten staat een antwoord.",
      knop: "Invullen wat nog leeg is",
      naar: "/app/profiel?doen=ingevuld",
    },
    {
      id: "nagelopen",
      label: "Nagelopen",
      aantal: nagelopen,
      van,
      uitleg: "Hoeveel punten jij hebt bevestigd. Wat uit je Insights-profiel komt is een suggestie tot jij zegt dat het klopt.",
      knop: "Nalopen wat nog open staat",
      naar: "/app/profiel?doen=nagelopen",
    },
    {
      id: "gedeeld",
      label: "Gedeeld",
      aantal: gedeeld,
      van,
      uitleg: "Hoeveel punten je teamgenoten kunnen zien. Zonder delen kan niemand er rekening mee houden.",
      knop: "Delen wat nog niet gedeeld is",
      naar: "/app/profiel?doen=gedeeld",
    },
  ];

  // "Open" is wat je nú kunt doen, niet wat er rekenkundig nog ontbreekt. Je
  // kunt geen punt bevestigen dat nog niet is ingevuld; zou dat wel meetellen,
  // dan zou de knop twaalf beloven en de lijst er vier tonen.
  onderdelen.forEach((o) => {
    o.open = KENMERK_IDS.filter((id) =>
      vraagtAandacht({ kenmerk: perId[id], doen: o.id, sleutel })
    ).length;
    o.klaar = o.aantal >= o.van;
  });

  const volgende = onderdelen.find((o) => o.open > 0) || null;

  return {
    percentage,
    behaald,
    totaal,
    van,
    ingevuld,
    nagelopen,
    gedeeld,
    compleet: behaald === totaal,
    onderdelen,
    volgende,
    handleidingSecties: secties,
    handleidingVan: SECTIES.length,
  };
}

/** Eén korte zin over waar je staat. */
export function voortgangInEenZin(voortgang) {
  if (!voortgang || voortgang.percentage === 0) return "Je profiel is nog leeg.";
  if (voortgang.compleet) return "Je profiel is compleet en gedeeld met je team.";
  if (voortgang.ingevuld < voortgang.van) {
    return `Er staat bij ${voortgang.ingevuld} van de ${voortgang.van} punten een antwoord.`;
  }
  if (voortgang.nagelopen < voortgang.van) {
    return `Alles is ingevuld. Je hebt ${voortgang.nagelopen} van de ${voortgang.van} punten zelf bevestigd.`;
  }
  return `Alles is ingevuld en nagelopen. Je deelt er ${voortgang.gedeeld} van de ${voortgang.van}.`;
}
