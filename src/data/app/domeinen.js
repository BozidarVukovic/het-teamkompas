// Welk domein van het kompas raakt een samenwerkingskenmerk?
//
// De app praat over tempo, context, feedback en spanning. De methodologie
// praat over vier domeinen. Zonder koppeling zijn dat negen losse
// eigenaardigheden; mét koppeling is het het kompas waar dit bedrijf om
// draait, en weet iemand waar hij verder kan lezen.
//
// Wat dit uitdrukkelijk niet is:
//
//   - Geen score. Er staat nergens hoe een team op een domein "staat". Een
//     label zegt waar een punt bij hoort, niet hoe goed of slecht iets gaat.
//   - Geen diagnose. Dat een verschil in feedback bij Veiligheid & Leiderschap
//     hoort, betekent niet dat de veiligheid in dit team te wensen overlaat.
//   - Geen volgorde. De domeinen staan niet op belangrijkheid.
//
// De indeling hieronder is een eerste voorstel en hoort bij de methodologie,
// niet bij de techniek. Wie hem wil bijstellen verandert deze ene tabel; de
// advieslogica en de schermen hoeven er niet voor open.
//
// De domeinen zelf komen uit de kennisbank, zodat er één lijst is in plaats
// van twee die uit elkaar kunnen gaan lopen.

import { DOMEINEN } from "../kennisbank/taxonomie.js";

export { DOMEINEN };

/**
 * Kenmerk → domein.
 *
 *   veiligheid-leiderschap  of mensen zich vrij voelen om eerlijk te zijn:
 *                           feedback, spanning, aanspreken, misverstand
 *   beleving-verandering    hoe iemand informatie en besluiten opneemt:
 *                           tempo, context, besluitvorming
 *   energie-motivatie       waar werk energie geeft en waar het leegloopt:
 *                           energie, energieverlies, contact
 *   verbeteren-leren        hoe een team samen denkt en vastlegt:
 *                           structuur, denken
 */
export const KENMERK_DOMEIN = {
  feedback: "veiligheid-leiderschap",
  spanning: "veiligheid-leiderschap",
  aanspreken: "veiligheid-leiderschap",
  misverstand: "veiligheid-leiderschap",

  tempo: "beleving-verandering",
  context: "beleving-verandering",
  besluitvorming: "beleving-verandering",

  energie: "energie-motivatie",
  energieverlies: "energie-motivatie",
  contact: "energie-motivatie",

  structuur: "verbeteren-leren",
  denken: "verbeteren-leren",
};

/** Het domein bij een kenmerk: { id, label, kleur, kennisbank } of niets. */
export function domeinVan(kenmerkId) {
  const id = KENMERK_DOMEIN[kenmerkId];
  if (!id) return null;
  const d = DOMEINEN.find((x) => x.id === id);
  if (!d) return null;
  return {
    id: d.id,
    label: d.label,
    kleur: d.kleur,
    // De kenniswijzer filtert hierop; zie lib/kennisbank/urlState.js.
    kennisbank: `/kennisbank?domein=${d.id}`,
  };
}
