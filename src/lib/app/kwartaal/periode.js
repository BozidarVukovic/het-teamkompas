// Rekenen met weken.
//
// Alles in de kwartaaldoelen wordt per week vergeleken: hoeveel ruimte iemand
// die week heeft, en hoeveel uur er die week op hem staat. Dat is de enige
// manier waarop "past dit erbij" een eerlijk antwoord kan opleveren. Twee
// klussen van drie uur per week passen prima náást elkaar in de tijd en
// helemaal niet in dezelfde week, en een optelling over een heel kwartaal ziet
// dat verschil niet.
//
// Een week is een ISO-week: "2027-W05". Die telling gebruikt Nederland, en de
// weeknummers die mensen op hun agenda zien komen ermee overeen. Week 1 is de
// week waarin de eerste donderdag van het jaar valt, een jaar heeft 52 of 53
// weken, en een week kan over de jaargrens lopen. Dat zijn precies de drie
// dingen waar zelfbedacht weekrekenen op stukloopt, dus staat het hier op één
// plek met tests eromheen.

const DAG = 86400000;
const WEEK = 7 * DAG;
const SLEUTEL = /^(\d{4})-W(\d{2})$/;

// Een reeks weken is bedoeld voor een kwartaal of een jaar, niet voor een
// eeuw. Deze grens vangt een omgedraaide of vertypte periode af voordat er een
// lijst van honderdduizend weken ontstaat.
export const MAX_WEKEN = 260;

/** De maandag van een ISO-week, of null als de sleutel niet deugt. */
export function weekBegin(sleutel) {
  const m = SLEUTEL.exec(String(sleutel || ""));
  if (!m) return null;
  const jaar = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;

  // 4 januari zit per definitie in week 1, in welk jaar dan ook.
  const vier = Date.UTC(jaar, 0, 4);
  const dag = (new Date(vier).getUTCDay() + 6) % 7; // maandag = 0
  const maandagVanWeek1 = vier - dag * DAG;
  const maandag = new Date(maandagVanWeek1 + (week - 1) * WEEK);

  // Week 53 bestaat niet in elk jaar. Bestaat hij niet, dan wijst de rekensom
  // naar week 1 van het jaar erna, en dat is een andere week dan gevraagd.
  return weekSleutel(maandag) === sleutel ? maandag : null;
}

/** De ISO-week waarin een datum valt. */
export function weekSleutel(datum) {
  const d = datum instanceof Date ? datum : new Date(datum);
  if (Number.isNaN(d.getTime())) return "";

  // De donderdag van deze week bepaalt bij welk jaar de week hoort.
  const donderdag = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  donderdag.setUTCDate(donderdag.getUTCDate() - ((donderdag.getUTCDay() + 6) % 7) + 3);

  const jaar = donderdag.getUTCFullYear();
  const eerste = new Date(Date.UTC(jaar, 0, 4));
  eerste.setUTCDate(eerste.getUTCDate() - ((eerste.getUTCDay() + 6) % 7) + 3);

  const week = 1 + Math.round((donderdag.getTime() - eerste.getTime()) / WEEK);
  return `${jaar}-W${String(week).padStart(2, "0")}`;
}

/** Bestaat deze week echt? */
export function geldigeWeek(sleutel) {
  return weekBegin(sleutel) !== null;
}

/** Hoeveel weken ligt b na a? Negatief als b eerder is. */
export function weekAfstand(a, b) {
  const va = weekBegin(a);
  const vb = weekBegin(b);
  if (!va || !vb) return null;
  return Math.round((vb.getTime() - va.getTime()) / WEEK);
}

/** De week n weken na deze. */
export function weekPlus(sleutel, n) {
  const van = weekBegin(sleutel);
  if (!van || !Number.isInteger(n)) return "";
  return weekSleutel(new Date(van.getTime() + n * WEEK));
}

/**
 * Een periode als lijst weken, van en tot allebei meegerekend.
 *
 * Een onvolledige of omgedraaide periode levert een lege lijst op en geen
 * gok: "van week 10 tot week 2" is geen periode van 41 weken, het is een
 * invoerfout, en die hoort zichtbaar te blijven in plaats van stilletjes
 * rechtgezet te worden.
 */
export function wekenIn(periode) {
  if (!periode) return [];
  const { van, tot } = periode;
  if (!geldigeWeek(van) || !geldigeWeek(tot)) return [];
  const lengte = weekAfstand(van, tot);
  if (lengte === null || lengte < 0 || lengte + 1 > MAX_WEKEN) return [];

  const uit = [];
  for (let i = 0; i <= lengte; i += 1) uit.push(weekPlus(van, i));
  return uit;
}

/** Hoeveel weken een periode telt. Nul bij een periode die niet deugt. */
export function aantalWeken(periode) {
  return wekenIn(periode).length;
}

/** Valt deze week binnen de periode? */
export function inPeriode(periode, week) {
  if (!periode || !geldigeWeek(week)) return false;
  const { van, tot } = periode;
  if (!geldigeWeek(van) || !geldigeWeek(tot)) return false;
  return weekAfstand(van, week) >= 0 && weekAfstand(week, tot) >= 0;
}

/**
 * De weken die twee perioden delen.
 *
 * Dit is de kern van "tel uitsluitend daadwerkelijk overlappende perioden bij
 * elkaar op". Twee klussen die elkaar niet raken leveren hier een lege lijst
 * op, en dus nul uur gedeelde belasting.
 */
export function gedeeldeWeken(a, b) {
  const eerste = wekenIn(a);
  if (eerste.length === 0) return [];
  const tweede = new Set(wekenIn(b));
  return eerste.filter((w) => tweede.has(w));
}

/** Overlappen deze twee perioden elkaar? */
export function overlapt(a, b) {
  return gedeeldeWeken(a, b).length > 0;
}

/**
 * De kleinste periode die beide omvat, of null als er niets te omvatten valt.
 * Gebruikt om te bepalen over welke weken een overzicht moet lopen.
 */
export function omspannendePeriode(perioden = []) {
  const geldig = perioden.filter((p) => p && geldigeWeek(p.van) && geldigeWeek(p.tot) && weekAfstand(p.van, p.tot) >= 0);
  if (geldig.length === 0) return null;

  let van = geldig[0].van;
  let tot = geldig[0].tot;
  for (const p of geldig) {
    if (weekAfstand(p.van, van) > 0) van = p.van;
    if (weekAfstand(tot, p.tot) > 0) tot = p.tot;
  }
  return { van, tot };
}

/**
 * De periode die overblijft als je vanaf een week stopt.
 *
 * Pauzeren gaat over de nog geplande inzet, niet over wat er al in zit. Wie in
 * week 6 pauzeert, houdt de weken tot en met 5 en laat de rest vallen. Pauzeer
 * je vóór de startweek, dan blijft er niets over.
 */
export function totVoor(periode, week) {
  if (!periode || !geldigeWeek(week)) return null;
  const weken = wekenIn(periode);
  if (weken.length === 0) return null;
  const behouden = weken.filter((w) => weekAfstand(w, week) > 0);
  if (behouden.length === 0) return null;
  return { van: behouden[0], tot: behouden[behouden.length - 1] };
}

/**
 * Dezelfde periode, n weken later.
 *
 * Verschuiven is verplaatsen en niet verlengen: de duur blijft gelijk. Wat er
 * in de nieuwe weken gebeurt moet opnieuw beoordeeld worden -- daarom levert
 * deze functie alleen de periode op en geen oordeel erover.
 */
export function verschoven(periode, weken) {
  if (!periode || !Number.isInteger(weken)) return null;
  if (!geldigeWeek(periode.van) || !geldigeWeek(periode.tot)) return null;
  const van = weekPlus(periode.van, weken);
  const tot = weekPlus(periode.tot, weken);
  return van && tot ? { van, tot } : null;
}
