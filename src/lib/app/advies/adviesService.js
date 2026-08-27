// De servicelaag tussen de advieslogica en de interface.
//
// Dit is het enige aanknopingspunt dat componenten kennen. Zij weten niet of
// een advies uit regels komt of ergens anders vandaan. Wil je later een
// taalmodel toevoegen, dan komt dat hier binnen als extra strategie — de
// componenten hoeven dan niet te veranderen en er ontstaat geen afhankelijkheid
// van één specifieke leverancier.
//
//   profieldata → advieslogica → servicelaag → interface

import { steltAdviesSamen } from "./regels.js";

/** De ingebouwde strategie: regels, geen AI. */
const regelStrategie = {
  id: "regels",
  naam: "Regelgebaseerd",
  beschrijving: "Vaste beslisregels en vooraf geschreven teksten. Geen taalmodel, geen externe dienst.",
  async advies(invoer) {
    return steltAdviesSamen(invoer);
  },
};

const strategieen = new Map([[regelStrategie.id, regelStrategie]]);
let actief = regelStrategie.id;

/**
 * Registreert een alternatieve manier om advies te maken.
 * Bedoeld voor later; nu is er alleen de regelgebaseerde variant.
 */
export function registreerStrategie(strategie) {
  if (!strategie || !strategie.id || typeof strategie.advies !== "function") {
    throw new Error("Een adviesstrategie heeft een id en een advies-functie nodig.");
  }
  strategieen.set(strategie.id, strategie);
}

export function kiesStrategie(id) {
  if (!strategieen.has(id)) throw new Error(`Onbekende adviesstrategie: ${id}`);
  actief = id;
}

export function actieveStrategie() {
  return strategieen.get(actief);
}

export function beschikbareStrategieen() {
  return [...strategieen.values()].map((s) => ({ id: s.id, naam: s.naam, beschrijving: s.beschrijving }));
}

/**
 * Vraagt een advies aan.
 *
 * `invoer` bevat uitsluitend gegevens die voor dit doel gebruikt mogen worden:
 * je eigen kenmerken en de kenmerken die de ander met dit team heeft gedeeld.
 * De service krijgt geen toegang tot brondata van de ander.
 */
export async function vraagAdvies(invoer) {
  const strategie = actieveStrategie();
  const uitkomst = await strategie.advies(invoer);
  return { ...uitkomst, strategie: strategie.id };
}

export default vraagAdvies;
