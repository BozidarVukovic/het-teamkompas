// Advies voor een groep in plaats van voor één collega.
//
// Bij twee mensen kijk je naar contrast: jij wilt dit, de ander dat. Bij vier
// mensen bestaat dat niet meer, en het zou schadelijk zijn om het toch zo te
// brengen — dan wordt er iemand aangewezen als de afwijkende. Hier gaat het
// daarom over spreiding: op welke punten loopt deze groep uiteen, en wat helpt
// er dan.
//
// Wat hier met opzet niet uit komt:
//   - geen naam bij een voorkeur; er staat nergens wie wat koos
//   - geen meerderheid tegenover een enkeling; alleen dát het verschilt
//   - geen score, geen volgorde van mensen, geen oordeel over iemand
//
// Jij hoort bij de groep. Loopt jouw voorkeur als enige uit de pas, dan komt
// dat er net zo goed uit — en dat is precies de bedoeling.
//
// Volledig deterministisch, net als het advies voor één collega: dezelfde
// invoer geeft altijd hetzelfde advies. Geen taalmodel.

import { kenmerk } from "../../../data/app/kenmerken.js";
import { situatie, openingVan } from "../../../data/app/situaties.js";
import { ADVIESKADER } from "../../../data/app/adviesblokken.js";
import { spreidingVoor } from "../../../data/app/groepsblokken.js";
import { bepaalWaarden, MAX_BLOKKEN, MAX_LETOP } from "./regels.js";

/** Vanaf hoeveel mensen is dit een groep? Bij twee blijft het één-op-één. */
export const MINIMUM_GROEP = 3;

/**
 * Op welke kenmerken loopt deze groep uiteen?
 *
 * `profielen` is een lijst van { naam, waarden } waarbij waarden uit
 * bepaalWaarden komt. Geeft per kenmerk terug hoeveel verschillende voorkeuren
 * er zijn en hoeveel mensen er iets over deelden — nooit wie wat koos.
 */
export function bepaalSpreiding(profielen = [], situatieId = null) {
  const s = situatie(situatieId);
  const volgorde = s ? s.kenmerken : [];
  const positie = (id) => {
    const i = volgorde.indexOf(id);
    return i === -1 ? volgorde.length + 5 : i;
  };

  const perKenmerk = new Map();

  profielen.forEach((p) => {
    Object.keys(p.waarden || {}).forEach((kenmerkId) => {
      const waarde = p.waarden[kenmerkId].waarde;
      if (!waarde) return;
      if (!perKenmerk.has(kenmerkId)) perKenmerk.set(kenmerkId, { mensen: 0, waarden: new Set() });
      const rij = perKenmerk.get(kenmerkId);
      rij.mensen += 1;
      rij.waarden.add(waarde);
    });
  });

  const uiteen = [];
  const gedeeld = [];

  [...perKenmerk.entries()].forEach(([kenmerkId, rij]) => {
    // Weet je van maar één persoon iets, dan valt er niets te zeggen over de
    // groep. Dat is geen overeenkomst en geen verschil.
    if (rij.mensen < 2) return;

    const rijGegevens = {
      kenmerkId,
      label: (kenmerk(kenmerkId) || {}).label || kenmerkId,
      mensen: rij.mensen,
      verschillende: rij.waarden.size,
      positie: positie(kenmerkId),
    };

    if (rij.waarden.size > 1) uiteen.push(rijGegevens);
    else gedeeld.push(rijGegevens);
  });

  // Eerst wat bij de situatie hoort, dan waar het meeste verschil zit, dan op
  // naam zodat de volgorde niet wisselt tussen twee keer laden.
  const sorteer = (a, b) =>
    a.positie - b.positie ||
    b.verschillende - a.verschillende ||
    b.mensen - a.mensen ||
    a.kenmerkId.localeCompare(b.kenmerkId);

  return { uiteen: uiteen.sort(sorteer), gedeeld: gedeeld.sort(sorteer) };
}

/** "tempo, context en denken" — een leesbare opsomming. */
function opsomming(woorden = []) {
  if (woorden.length === 0) return "";
  if (woorden.length === 1) return woorden[0];
  return `${woorden.slice(0, -1).join(", ")} en ${woorden[woorden.length - 1]}`;
}

/**
 * Stelt het advies voor een groep samen.
 *
 * `mijnKenmerken` zijn die van jou; `deelnemers` is [{ naam, kenmerken }] van
 * de anderen, met uitsluitend wat zij met dit team hebben gedeeld. Jij telt mee
 * als lid van de groep — dit gaat over jullie, niet over hen.
 */
export function steltGroepsadviesSamen({ mijnKenmerken = [], deelnemers = [], situatieId } = {}) {
  const s = situatie(situatieId);

  const anderen = (deelnemers || []).map((d) => ({
    naam: d.naam || "een collega",
    waarden: bepaalWaarden(d.kenmerken || []),
  }));

  const mijn = { naam: "jij", waarden: bepaalWaarden(mijnKenmerken) };
  const profielen = [mijn, ...anderen];

  const { uiteen, gedeeld } = bepaalSpreiding(profielen, situatieId);

  const gekozen = uiteen.slice(0, MAX_BLOKKEN);

  /* --- opmerkingen ------------------------------------------------------ */

  const opmerkingen = [];
  const stil = anderen.filter((a) => Object.keys(a.waarden).length === 0);
  if (stil.length === anderen.length && anderen.length > 0) {
    opmerkingen.push(
      "Niemand van deze groep heeft al iets met dit team gedeeld. Er valt daardoor nog niets te zeggen over waar jullie verschillen."
    );
  } else if (stil.length > 0) {
    opmerkingen.push(
      `${stil.length} van de ${anderen.length} mensen in deze selectie deelde nog niets met dit team. Dit advies gaat over de rest.`
    );
  }
  if (Object.keys(mijn.waarden).length === 0) opmerkingen.push(ADVIESKADER.geenEigenProfiel);

  /* --- het gesprek in vijf stukken -------------------------------------- */

  const themas = gekozen.map((r) => r.label.toLowerCase());

  const samenvatting = [];
  // De gewone openingszin is geschreven voor twee mensen ("wanneer allebei
  // duidelijk is"). Voor een groep staat er een eigen zin klaar.
  if (s) samenvatting.push(openingVan(s, true));

  if (themas.length > 0) {
    samenvatting.push(
      `In deze groep lopen de voorkeuren uiteen op ${opsomming(themas)}.`
    );
    samenvatting.push(
      "Dat is geen probleem om op te lossen; het wordt er pas een als niemand het benoemt."
    );
  } else if (gedeeld.length > 0) {
    samenvatting.push(
      "Op wat jullie hierover hebben gedeeld, zitten jullie voorkeuren dicht bij elkaar. Let dan vooral op wat er niet is gedeeld."
    );
  }

  const blokken = gekozen
    .map((r) => ({ ...r, ...(spreidingVoor(r.kenmerkId) || {}) }))
    .filter((r) => r.duiding && r.suggestie);

  const helpt = blokken.map((b) => b.suggestie);
  const uiteenlopend = blokken.slice(0, MAX_LETOP).map((b) => b.duiding);

  return {
    soort: "groep",
    situatie: s ? { id: s.id, label: s.groepslabel || s.label, opening: openingVan(s, true) } : null,
    aantal: profielen.length,
    namen: anderen.map((a) => a.naam),
    samenvatting,
    helpt,
    uiteen: uiteenlopend,
    vraag: s ? s.vraag : null,
    // Een actie die op één collega is afgestemd slaat hier nergens op; die van
    // de situatie is voor een groep even bruikbaar.
    actie: s ? s.actie : null,
    opmerkingen,
    transparantie:
      "Dit advies is gebaseerd op wat de mensen in deze groep zelf met dit team hebben gedeeld. Er staat nergens wie wat koos, en het is geen beoordeling van iemand.",
    aantalBeschikbaar: uiteen.length,
    gebruikteKenmerken: blokken.map((b) => b.kenmerkId),
  };
}
