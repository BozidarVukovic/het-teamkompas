// Hoe dit team in elkaar zit.
//
// Het advies gaat altijd over een moment: jij en die ene collega, bij dit ene
// wat er speelt. Nuttig, maar het verdwijnt zodra je het scherm sluit. Waar dit
// team als geheel uiteenloopt — dat de een eerst wil doordenken terwijl de ander
// al in beweging is — verklaart vaak meer van de dagelijkse wrijving dan welk
// los advies ook, en dat staat nergens.
//
// Dit is dezelfde berekening als bij een groepsadvies, maar dan zonder situatie
// en als staand beeld. Wat er met opzet niet uit komt is hetzelfde:
//
//   - geen naam bij een voorkeur; er staat nergens wie wat koos
//   - geen meerderheid tegenover een enkeling; alleen dát het verschilt
//   - geen score, geen volgorde van mensen, geen oordeel over iemand
//
// Waar jullie het eens zijn staat er ook bij. Dat is geen vulling: een team dat
// op een punt allemaal hetzelfde wil, heeft daar veel vanzelfsprekend — en merkt
// het daardoor het laatst als het een keer anders moet.

import { bepaalSpreiding } from "./advies/groepsregels.js";
import { bepaalWaarden } from "./advies/regels.js";

/**
 * Onder de twee profielen valt er niets te zeggen over spreiding.
 *
 * Bij één iemand is er geen verschil om te zien, en bij nul al helemaal niet.
 * Dan is een leeg scherm met uitleg eerlijker dan een beeld dat niets betekent.
 */
export const MINIMUM_TEAMBEELD = 2;

/**
 * @param {object}  gegevens
 * @param {Array}   gegevens.deelnemers    [{ naam, kenmerken }] van de anderen
 * @param {Array}   gegevens.mijnKenmerken jouw eigen kenmerken
 * @param {boolean} gegevens.ikDoeMee      hoor jij bij dit team? een begeleider niet
 */
export function steltTeambeeldSamen({
  deelnemers = [],
  mijnKenmerken = [],
  ikDoeMee = true,
} = {}) {
  const anderen = (deelnemers || []).map((d) => ({
    naam: d.naam || "een collega",
    waarden: bepaalWaarden(d.kenmerken || []),
  }));

  const mijn = { naam: "jij", waarden: bepaalWaarden(mijnKenmerken) };
  const profielen = ikDoeMee ? [mijn, ...anderen] : anderen;

  const gevuld = profielen.filter((p) => Object.keys(p.waarden || {}).length > 0);
  const stil = profielen.length - gevuld.length;

  const { uiteen, gedeeld } = bepaalSpreiding(gevuld, null);

  return {
    meegeteld: gevuld.length,
    stil,
    genoeg: gevuld.length >= MINIMUM_TEAMBEELD,
    uiteen,
    gedeeld,
  };
}

/**
 * Eén zin over hoeveel dit beeld waard is.
 *
 * Een beeld op basis van drie van de negen mensen is iets anders dan een beeld
 * op basis van alle negen, en dat hoort erbij te staan. Anders leest een
 * halfvol beeld als een volledig beeld.
 */
export function dekkingInEenZin({ meegeteld = 0, stil = 0 } = {}) {
  if (meegeteld === 0) return "Nog niemand heeft iets gedeeld, dus er valt nog niets te zien.";
  if (meegeteld === 1) return "Er is er één die iets deelde. Verschil zie je pas vanaf twee.";
  if (stil === 0) return `Dit beeld gaat over alle ${meegeteld} mensen in dit team.`;
  return `Dit beeld gaat over ${meegeteld} van de ${meegeteld + stil} mensen; de rest deelde nog niets.`;
}

