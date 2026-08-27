// De regels die van twee profielen en een situatie een advies maken.
//
// Volledig deterministisch: dezelfde invoer geeft altijd hetzelfde advies. Er
// komt geen taalmodel aan te pas. De uitkomst is opgebouwd uit de teksten in
// adviesblokken.js.
//
// Volgorde van gewicht, zoals vastgelegd in de opdracht:
//   1. wat de gebruiker expliciet heeft bevestigd
//   2. de hand-in-handleiding
//   3. het Insights Discovery-profiel
//   4. algemene samenwerkingslogica
//
// Spreken bronnen elkaar tegen, dan wint de meest expliciete en, bij gelijk
// gewicht, de meest recent bevestigde.

import { BRON_GEWICHT, kenmerk, optieVan } from "../../../data/app/kenmerken.js";
import { situatie } from "../../../data/app/situaties.js";
import { BEHOEFTEN, CONTRASTEN, ADVIESKADER } from "../../../data/app/adviesblokken.js";

export const MAX_BLOKKEN = 2;

/**
 * Zet de naam van de ander in de tekst. De blokken zijn geschreven met
 * "je collega"; is de naam bekend, dan leest het advies persoonlijker.
 */
export function metNaam(tekst, naam) {
  if (!tekst) return tekst;
  if (!naam || naam === "je collega") return tekst;
  return tekst.replace(/Je collega/g, naam).replace(/je collega/g, naam);
}

/**
 * Kiest per kenmerk de waarde die het zwaarst weegt.
 *
 * `kenmerken` is een lijst van { kenmerkId, waarde, bron, bevestigd, laatstBevestigdOp }.
 * Geeft terug: { kenmerkId: { waarde, bron, gewicht, laatstBevestigdOp } }
 */
export function bepaalWaarden(kenmerken = []) {
  const uit = {};
  kenmerken.forEach((k) => {
    if (!k || !k.kenmerkId || !k.waarde) return;
    if (!optieVan(k.kenmerkId, k.waarde)) return;

    // Een kenmerk dat de gebruiker met "nee" heeft weggestreept, telt niet mee.
    if (k.bevestigd === "nee") return;

    let gewicht = BRON_GEWICHT[k.bron] || 1;
    // Een bevestiging weegt zwaarder dan de bron waar de waarde vandaan kwam.
    if (k.bevestigd === "sterk") gewicht = Math.max(gewicht, BRON_GEWICHT.user_confirmation);
    if (k.bevestigd === "soms") gewicht = Math.max(gewicht, BRON_GEWICHT.manual);

    const huidig = uit[k.kenmerkId];
    const nieuwerDan = (a, b) => String(a || "") > String(b || "");

    if (
      !huidig ||
      gewicht > huidig.gewicht ||
      (gewicht === huidig.gewicht && nieuwerDan(k.laatstBevestigdOp, huidig.laatstBevestigdOp))
    ) {
      uit[k.kenmerkId] = {
        waarde: k.waarde,
        bron: k.bron,
        gewicht,
        bevestigd: k.bevestigd || null,
        laatstBevestigdOp: k.laatstBevestigdOp || null,
      };
    }
  });
  return uit;
}

/**
 * Stelt de kandidaat-adviesblokken samen.
 *
 * Een contrast weegt zwaarder dan een behoefte: waar twee mensen van elkaar
 * verschillen, valt meer te winnen dan bij een losse voorkeur.
 */
export function verzamelBlokken(mijn, hun, situatieId) {
  const s = situatie(situatieId);
  const volgorde = s ? s.kenmerken : [];
  const blokken = [];

  const positie = (kenmerkId) => {
    const i = volgorde.indexOf(kenmerkId);
    return i === -1 ? volgorde.length + 5 : i;
  };

  Object.keys(hun).forEach((kenmerkId) => {
    const hunWaarde = hun[kenmerkId].waarde;
    const mijnWaarde = mijn[kenmerkId] ? mijn[kenmerkId].waarde : null;

    const contrast =
      mijnWaarde &&
      CONTRASTEN[kenmerkId] &&
      CONTRASTEN[kenmerkId][mijnWaarde] &&
      CONTRASTEN[kenmerkId][mijnWaarde][hunWaarde];

    if (contrast) {
      blokken.push({
        soort: "contrast",
        kenmerkId,
        mijnWaarde,
        hunWaarde,
        positie: positie(kenmerkId),
        gewicht: hun[kenmerkId].gewicht + (mijn[kenmerkId] ? mijn[kenmerkId].gewicht : 0),
        ...contrast,
      });
      return;
    }

    const behoefte = BEHOEFTEN[kenmerkId] && BEHOEFTEN[kenmerkId][hunWaarde];
    if (behoefte) {
      blokken.push({
        soort: "behoefte",
        kenmerkId,
        hunWaarde,
        positie: positie(kenmerkId),
        gewicht: hun[kenmerkId].gewicht,
        ...behoefte,
      });
    }
  });

  // Eerst wat bij de situatie hoort, dan contrasten boven behoeften, dan de
  // zwaarst onderbouwde informatie. Het kenmerk-id breekt gelijke gevallen,
  // zodat de uitkomst voorspelbaar blijft.
  blokken.sort((a, b) =>
    a.positie - b.positie ||
    (a.soort === b.soort ? 0 : a.soort === "contrast" ? -1 : 1) ||
    b.gewicht - a.gewicht ||
    a.kenmerkId.localeCompare(b.kenmerkId));

  return blokken;
}

/**
 * Stelt het volledige advies samen.
 *
 * `mijnKenmerken` en `hunKenmerken` zijn lijsten zoals ze uit de opslag komen.
 * Van de ander gebruiken we uitsluitend wat met dit team is gedeeld — dat
 * filteren gebeurt in de laag erboven, niet hier.
 */
export function steltAdviesSamen({ mijnKenmerken = [], hunKenmerken = [], situatieId, naamAnder = "je collega" }) {
  const s = situatie(situatieId);
  const mijn = bepaalWaarden(mijnKenmerken);
  const hun = bepaalWaarden(hunKenmerken);

  const alleBlokken = verzamelBlokken(mijn, hun, situatieId);
  const gekozen = alleBlokken.slice(0, MAX_BLOKKEN);

  const opmerkingen = [];
  if (Object.keys(hun).length === 0) opmerkingen.push(ADVIESKADER.nietsGedeeld);
  else if (Object.keys(hun).length < 3) opmerkingen.push(ADVIESKADER.weinigInformatie);
  if (Object.keys(mijn).length === 0) opmerkingen.push(ADVIESKADER.geenEigenProfiel);

  // De afsluiter wisselt per situatie, maar blijft bij dezelfde situatie gelijk.
  const afsluiter = ADVIESKADER.afsluiters[
    (s ? s.id.length : 0) % ADVIESKADER.afsluiters.length
  ];

  return {
    situatie: s ? { id: s.id, label: s.label, opening: s.opening } : null,
    naamAnder,
    blokken: gekozen.map((b) => ({
      soort: b.soort,
      kenmerk: kenmerk(b.kenmerkId) ? kenmerk(b.kenmerkId).label : b.kenmerkId,
      kenmerkId: b.kenmerkId,
      duiding: metNaam(b.duiding, naamAnder),
      suggestie: b.suggestie,
      voorbeeldzin: b.voorbeeldzin,
    })),
    opmerkingen,
    afsluiter,
    transparantie: ADVIESKADER.transparantie,
    aantalBeschikbaar: alleBlokken.length,
    gebruikteKenmerken: gekozen.map((b) => b.kenmerkId),
  };
}
