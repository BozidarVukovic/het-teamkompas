// Wat er van een profielvoorstel in de database mag komen.
//
// Een facilitator leest het Insights-profiel van iemand anders in en zet dat
// voor die persoon klaar. Wat hier doorheen komt, komt te staan op naam van
// diegene, op een plek waar de beheerder bij kan tot het wordt overgenomen of
// weggegooid. Alles wat we niet kennen hoort dus te verdwijnen.
//
// Losse module zonder database-import, zodat er een test op kan draaien zonder
// Firebase op te starten. Dat was de reden dat deze opschoning ongetest was.

import { SECTIE_IDS } from "../../data/app/handleiding.js";
import { KLEUR_IDS } from "./insights.js";

/** Maximaal aantal tekens per sectie. Een voorstel is een startpunt, geen boek. */
export const MAX_TEKENS = 1000;

/**
 * De secties die een facilitator voor iemand klaarzet.
 *
 * Zelfde opschoning als bij een profielvoorstel: alleen secties die bestaan,
 * alleen tekst die er echt is, en niet langer dan een startpunt hoeft te zijn.
 * Wat hier doorheen komt, komt te staan op naam van iemand anders, op een plek
 * waar de beheerder bij kan tot die persoon het overneemt of weggooit.
 */
export function schoneSecties(secties = {}) {
  const uit = {};
  Object.keys(secties || {}).forEach((sectieId) => {
    if (!SECTIE_IDS.includes(sectieId)) return;
    const tekst = String(secties[sectieId] || "").trim();
    if (tekst) uit[sectieId] = tekst.slice(0, MAX_TEKENS);
  });
  return uit;
}

export function schoonVoorstel({ voorkeurskleur, tweedeKleur, type, teksten } = {}) {
  const schoneTeksten = {};
  Object.keys(teksten || {}).forEach((sectieId) => {
    if (!SECTIE_IDS.includes(sectieId)) return;
    const tekst = String(teksten[sectieId] || "").trim();
    if (tekst) schoneTeksten[sectieId] = tekst.slice(0, MAX_TEKENS);
  });

  return {
    voorkeurskleur: KLEUR_IDS.includes(voorkeurskleur) ? voorkeurskleur : null,
    tweedeKleur: KLEUR_IDS.includes(tweedeKleur) ? tweedeKleur : null,
    type: type || null,
    teksten: schoneTeksten,
  };
}
