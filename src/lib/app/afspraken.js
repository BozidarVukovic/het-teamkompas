// Teamafspraken: wat jullie met elkaar hebben afgesproken over hoe je omgaat.
//
// Dit is het enige onderdeel van de app dat van het team samen is in plaats van
// van één persoon. Een profiel is van jou, een handleiding is van jou, en wat je
// deelt bepaal je zelf. Een afspraak is van niemand alleen.
//
// Dat heeft gevolgen voor wie wat mag. Iedereen kan er een opschrijven en
// iedereen kan hem bijstellen — anders wordt het iets wat van bovenaf komt, en
// daar verliest een afspraak precies zijn kracht op. Er staat wel bij wie hem
// heeft opgeschreven en wie hem het laatst heeft aangepast, want een afspraak
// die stilletjes verandert is geen afspraak meer. Weghalen kan alleen de
// beheerder; zo verdwijnt er niets zonder dat iemand het merkt.
//
// Pure functies: geen React, geen database, wel te testen.

/** Een afspraak is een zin, geen alinea. */
export const MAX_TEKST = 200;
export const MAX_TOELICHTING = 500;

/**
 * Wat er van een afspraak in de database mag komen.
 *
 * Iedereen in het team kan dit schrijven en iedereen leest het, dus hier hoort
 * niets doorheen te komen wat er niet in past — geen lege afspraak, geen boek.
 */
export function schoneAfspraak({ tekst, toelichting } = {}) {
  const schoon = String(tekst || "").trim().slice(0, MAX_TEKST);
  const erbij = String(toelichting || "").trim().slice(0, MAX_TOELICHTING);
  if (!schoon) return null;
  return erbij ? { tekst: schoon, toelichting: erbij } : { tekst: schoon };
}

const alsGetal = (waarde) => {
  if (!waarde) return 0;
  if (typeof waarde.toMillis === "function") return waarde.toMillis();
  if (waarde instanceof Date) return waarde.getTime();
  const n = Date.parse(waarde);
  return Number.isFinite(n) ? n : 0;
};

/**
 * De volgorde waarin ze zijn afgesproken, oudste eerst.
 *
 * Niet op belangrijkheid: afspraken staan naast elkaar, niet boven elkaar.
 * Zodra je ze rangschikt, doet de onderste er minder toe.
 *
 * Een afspraak die net is weggeschreven heeft nog geen tijdstempel van de
 * server. Die komt achteraan te staan in plaats van vooraan, want hij is ook de
 * nieuwste.
 */
export function sorteerAfspraken(afspraken = []) {
  return [...(afspraken || [])]
    .filter((a) => a && a.tekst)
    .sort((a, b) => {
      const links = alsGetal(a.aangemaaktOp) || Number.MAX_SAFE_INTEGER;
      const rechts = alsGetal(b.aangemaaktOp) || Number.MAX_SAFE_INTEGER;
      if (links !== rechts) return links - rechts;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
}

/**
 * Eén afspraak om vandaag uit te lichten op het startscherm.
 *
 * Afspraken verdwijnen niet doordat mensen het oneens zijn, maar doordat
 * niemand ze meer ziet. Er staat er daarom elke dag één op de plek waar
 * iedereen binnenkomt.
 *
 * Welke het is hangt aan de datum, niet aan toeval: bij elke keer verversen een
 * andere zien is onrustig, en dan valt niet op dat het er elke dag een andere
 * is. Zo rouleren ze langs iedereen in dezelfde volgorde.
 */
export function uitgelichteAfspraak(afspraken = [], datum = new Date()) {
  const lijst = sorteerAfspraken(afspraken);
  if (lijst.length === 0) return null;
  const dag = Math.floor(datum.getTime() / 86400000);
  return lijst[((dag % lijst.length) + lijst.length) % lijst.length];
}

/** Eén regel onder een afspraak: wie hem opschreef, en of iemand hem bijstelde. */
export function herkomstVan(afspraak) {
  if (!afspraak) return "";
  const door = afspraak.doorNaam || "iemand uit het team";
  const bij = afspraak.bijgewerktDoorNaam;
  if (bij && bij !== afspraak.doorNaam) return `Opgeschreven door ${door} · bijgesteld door ${bij}`;
  return `Opgeschreven door ${door}`;
}
