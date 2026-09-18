// De kleurvingerafdruk: hoe de vier kleuren bij iemand verdeeld zijn.
//
// Een balk met de verhouding en bolletjes met de volgorde. Bij elkaar herken je
// iemand aan zijn streep voordat je zijn naam leest -- dat is het hele idee.
//
// Twee dingen die dit bestand bewaakt:
//
// 1. Een verhouding tonen die we niet hebben, doen we niet. Een Insights-
//    profiel geeft soms vier gemeten waarden en soms alleen een wielpositie
//    waaruit de eerste twee kleuren volgen. In het tweede geval is er wel een
//    volgorde maar geen verhouding, en dan komt er geen balk. Een balk
//    verzinnen uit "blauw voor groen" suggereert een precisie die er niet is.
//
// 2. Wat er gedeeld wordt is het minimum. Niet het wiel, niet het type, niet de
//    tekst van het profiel -- alleen de vier getallen en de volgorde die
//    daaruit volgt. Wat iemand met zijn team deelt hoort niet meer te zijn dan
//    wat het scherm laat zien.

import { KLEUREN, KLEUR_IDS } from "./insights.js";

/** Alleen dit gaat mee naar het team. De rest van het profiel blijft thuis. */
export function kleurenOmTeDelen(insights) {
  if (!insights || typeof insights !== "object") return null;
  const { voorkeurskleur, tweedeKleur, energieen } = insights;
  if (!KLEUR_IDS.includes(voorkeurskleur)) return null;
  const uit = { voorkeurskleur };
  if (KLEUR_IDS.includes(tweedeKleur) && tweedeKleur !== voorkeurskleur) uit.tweedeKleur = tweedeKleur;
  if (energieen && KLEUR_IDS.every((id) => Number.isFinite(energieen[id]))) {
    uit.energieen = Object.fromEntries(KLEUR_IDS.map((id) => [id, energieen[id]]));
  }
  return uit;
}

/**
 * De vingerafdruk zoals het scherm hem tekent.
 *
 * @returns { balk, volgorde, nauwkeurig } of null.
 *   balk       — [{ id, kleur, deel }] op volgorde van groot naar klein, of []
 *                als er geen gemeten verhouding is
 *   volgorde   — de kleur-ids van meest naar minst aanwezig
 *   nauwkeurig — of de verhouding gemeten is of alleen afgeleid
 */
export function maakVingerafdruk(kleuren) {
  if (!kleuren || typeof kleuren !== "object") return null;
  const { voorkeurskleur, tweedeKleur, energieen } = kleuren;
  if (!KLEUR_IDS.includes(voorkeurskleur)) return null;

  const tint = (id) => (KLEUREN.find((k) => k.id === id) || {}).kleur || "";

  if (energieen && KLEUR_IDS.every((id) => Number.isFinite(energieen[id]))) {
    const waarde = (id) => Math.max(0, energieen[id]);
    const totaal = KLEUR_IDS.reduce((som, id) => som + waarde(id), 0);
    if (totaal > 0) {
      // Bij gelijke waarden beslist de vaste kleurvolgorde, zodat dezelfde
      // gegevens altijd dezelfde afdruk opleveren.
      const volgorde = [...KLEUR_IDS].sort(
        (a, b) => waarde(b) - waarde(a) || KLEUR_IDS.indexOf(a) - KLEUR_IDS.indexOf(b),
      );
      return {
        balk: volgorde.map((id) => ({ id, kleur: tint(id), deel: waarde(id) / totaal })),
        volgorde,
        nauwkeurig: true,
      };
    }
  }

  // Geen gemeten waarden: wel de volgorde die we kennen, geen balk.
  const eerst = [voorkeurskleur, tweedeKleur].filter(
    (id, i, lijst) => KLEUR_IDS.includes(id) && lijst.indexOf(id) === i,
  );
  const rest = KLEUR_IDS.filter((id) => !eerst.includes(id));
  return { balk: [], volgorde: [...eerst, ...rest], nauwkeurig: false };
}

/** De bolletjes: elke kleur één, op volgorde, met zijn tint erbij. */
export function bolletjes(afdruk) {
  if (!afdruk) return [];
  const tint = (id) => (KLEUREN.find((k) => k.id === id) || {}).kleur || "";
  return afdruk.volgorde.map((id) => ({ id, kleur: tint(id) }));
}

/**
 * Wat een schermlezer hoort.
 *
 * Een rij gekleurde blokjes zegt niets zonder ogen. De volgorde uitgeschreven
 * wel -- en dat is precies de informatie die de afdruk draagt.
 */
export function omschrijf(afdruk, naam = "") {
  if (!afdruk) return "";
  const namen = afdruk.volgorde.map((id) => {
    const k = KLEUREN.find((x) => x.id === id);
    return k ? k.label.toLowerCase() : id;
  });
  const wie = naam ? `${naam}: ` : "";
  const hoe = afdruk.nauwkeurig ? "van sterkst naar zwakst" : "eerste twee kleuren";
  return `${wie}kleuren ${hoe} — ${namen.join(", ")}.`;
}
