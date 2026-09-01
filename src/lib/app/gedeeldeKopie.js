// Wat er precies bij je teamgenoten terechtkomt.
//
// Dit is de privacybelofte van de app, uitgevoerd in code. Firestore-regels
// kunnen niet op veldniveau filteren — een document komt heel terug of
// helemaal niet — dus is wat je deelt een aparte kopie per team. Delen is een
// schrijfactie, intrekken is een verwijderactie.
//
// Wat er in die kopie komt, werd bepaald in dezelfde functie die hem ook
// wegschreef. Daardoor was het enige wat er echt toe doet niet te testen zonder
// database, en was het dus ook niet getest. Hier staat het los: een pure
// functie die alleen zegt wat de kopie zou moeten zijn. werkGedeeldBij() doet
// er niets anders mee dan hem wegschrijven of, als er niets in staat,
// verwijderen.
//
// Drie dingen liggen hier vast:
//   - alleen wat is aangevinkt voor dít team gaat mee, nooit voor een ander
//   - alleen als leesbare zin, nooit als ruwe waarde met bron erbij
//   - is er niets aangevinkt, dan is er geen kopie in plaats van een lege

import { deelzin } from "../../data/app/kenmerken.js";
import { SECTIES, sectie } from "../../data/app/handleiding.js";

/**
 * @returns het document dat bij dit team hoort, of null als er niets te delen
 *          valt. Null betekent: verwijder de kopie.
 */
export function stelGedeeldeKopieSamen({ naam = "", sleutel, kenmerken = [], handleiding = {} } = {}) {
  if (!sleutel) return null;

  const gedeeldeKenmerken = (kenmerken || [])
    .filter((k) => k && k.waarde && (k.gedeeldMet || []).includes(sleutel) && k.bevestigd !== "nee")
    .map((k) => ({
      kenmerkId: k.kenmerkId,
      waarde: k.waarde,
      zin: deelzin(k.kenmerkId, k.waarde) || "",
    }))
    // Zonder leesbare zin valt er niets te delen. Een waarde die niet bij het
    // kenmerk hoort, of een kenmerk dat niet meer bestaat, valt hier weg.
    .filter((k) => k.zin);

  // De volgorde volgt de secties zoals ze in de app staan, niet de volgorde
  // waarin iemand ze toevallig heeft ingevuld.
  const gedeeldeSecties = SECTIES.map((s) => handleiding && handleiding[s.id])
    .filter((s) => s && s.tekst && (s.gedeeldMet || []).includes(sleutel))
    .map((s) => ({
      sectieId: s.sectieId,
      titel: (sectie(s.sectieId) || {}).titel || s.sectieId,
      tekst: s.tekst,
    }));

  if (gedeeldeKenmerken.length === 0 && gedeeldeSecties.length === 0) return null;

  return {
    naam: naam || "",
    kenmerken: gedeeldeKenmerken,
    handleiding: gedeeldeSecties,
  };
}
