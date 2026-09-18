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
import { kleurenOmTeDelen } from "./vingerafdruk.js";
import { SECTIES, sectie } from "../../data/app/handleiding.js";

/**
 * @returns het document dat bij dit team hoort, of null als er niets te delen
 *          valt. Null betekent: verwijder de kopie.
 */
/**
 * Losse stukjes tekst omzetten naar de vorm die een teamgenoot te zien krijgt.
 *
 * Wordt gebruikt voor profielen die een beheerder zelf toevoegt: daar is geen
 * eigenaar die per sectie een vinkje zet, dus is er ook geen gedeeldMet om op
 * te filteren. Wat de beheerder erin zet, staat erin.
 *
 * Zelfde vorm en zelfde volgorde als bij een echte teamgenoot, zodat de
 * advieslogica geen onderscheid hoeft te maken tussen de twee.
 */
export function sectiesAlsLijst(secties = {}) {
  return SECTIES.map((s) => {
    const tekst = String((secties || {})[s.id] || "").trim();
    return tekst ? { sectieId: s.id, titel: s.titel, tekst } : null;
  }).filter(Boolean);
}

export function stelGedeeldeKopieSamen({
  naam = "",
  sleutel,
  kenmerken = [],
  handleiding = {},
  insights = null,
  kleurenDelen = true,
} = {}) {
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

  // De kleuren van je profiel, als je ze niet hebt uitgezet.
  //
  // Dit is het enige in deze kopie dat standaard aan staat in plaats van per
  // stuk aangevinkt. Dat is een bewuste keuze en geen vergissing: zonder
  // kleuren bij de namen valt het patroon weg waar de hele lijst op leunt, en
  // een vinkje dat niemand aanzet is hetzelfde als geen functie. De prijs is
  // dat iemand iets deelt zonder dat hij daar per keer ja tegen zei, en die
  // prijs hoort zichtbaar te zijn: op Mijn profiel staat wat er bij je naam
  // komt te staan, met de schakelaar ernaast.
  //
  // Wat meegaat is het minimum -- de vier getallen en de eerste twee kleuren.
  // Niet het wiel, niet het type, niet de tekst van het profiel.
  const kleuren = kleurenDelen === false ? null : kleurenOmTeDelen(insights);

  if (gedeeldeKenmerken.length === 0 && gedeeldeSecties.length === 0 && !kleuren) return null;

  return {
    naam: naam || "",
    kenmerken: gedeeldeKenmerken,
    handleiding: gedeeldeSecties,
    ...(kleuren ? { kleuren } : {}),
  };
}
