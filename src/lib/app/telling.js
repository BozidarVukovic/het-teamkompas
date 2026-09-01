// Wat telt er mee, en wat deel je met wie.
//
// Deze vraag werd op vier plekken los beantwoord: in de voortgangsbalk, in de
// volgende-stap-logica, op het profielscherm en in de knop die alles deelt. Ze
// gaven hetzelfde antwoord, maar niet omdat ze hetzelfde deden — alleen omdat
// er nog geen kenmerk in de opslag stond dat niet meer bestaat. Zodra dat er
// wel is, zegt het ene scherm "12 van 12" en het andere "13 van 13".
//
// Op Mijn gegevens ging het al mis: daar werd geteld wat een vinkje had,
// terwijl de kopie die je teamgenoten écht zien nog extra filtert. Je kon dus
// lezen dat je twaalf punten deelt terwijl je collega er tien ziet.
//
// Hier staat één antwoord, en het is hetzelfde antwoord dat werkGedeeldBij()
// gebruikt om de gedeelde kopie weg te schrijven. Wijkt dat ooit uiteen, dan
// valt een test om.

import { KENMERK_IDS, deelzin } from "../../data/app/kenmerken.js";

export const sleutelVan = (team) => (team ? `${team.orgId}/${team.teamId}` : null);

/**
 * De kenmerken die ergens voor meetellen.
 *
 * Drie voorwaarden, en alle drie doen ze iets:
 *   - het kenmerk bestaat nog (een oud kenmerk in de opslag telt nergens mee)
 *   - er staat een waarde
 *   - je hebt het niet weggestreept met "nee, dat klopt niet"
 *   - er is een leesbare zin voor; zonder zin valt er niets te delen
 */
export function bruikbareKenmerken(kenmerken = []) {
  return (kenmerken || []).filter(
    (k) =>
      k &&
      KENMERK_IDS.includes(k.kenmerkId) &&
      k.waarde &&
      k.bevestigd !== "nee" &&
      Boolean(deelzin(k.kenmerkId, k.waarde))
  );
}

/** De bruikbare kenmerken die je met dit team deelt. */
export function gedeeldeKenmerken(kenmerken = [], team = null) {
  const sleutel = sleutelVan(team);
  if (!sleutel) return [];
  return bruikbareKenmerken(kenmerken).filter((k) => (k.gedeeldMet || []).includes(sleutel));
}

/**
 * Alles in één keer, voor wie een getal op het scherm wil zetten.
 *
 * `van` is het aantal kenmerken dat er te vullen valt — het vaste getal twaalf,
 * niet hoeveel er toevallig in de opslag staan.
 */
export function telKenmerken({ kenmerken = [], actiefTeam = null } = {}) {
  const bruikbaar = bruikbareKenmerken(kenmerken);
  const gedeeld = gedeeldeKenmerken(kenmerken, actiefTeam);

  return {
    bruikbaar,
    gedeeld,
    van: KENMERK_IDS.length,
    ingevuld: bruikbaar.length,
    nagelopen: bruikbaar.filter((k) => k.bevestigd).length,
    aantalGedeeld: gedeeld.length,
  };
}
