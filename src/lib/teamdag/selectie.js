// Kiest welke programmaonderdelen in het programma komen.
//
// De volgorde van prioriteit is vastgelegd in de opdracht: het primaire
// gewenste resultaat weegt het zwaarst, daarna de aanleiding, daarna het
// teamtype. Er wordt nooit een werkvorm toegevoegd om tijd op te vullen.

import { BLOKKEN, blok, KADER_IDS } from "../../data/teamdag/blokken.js";
import { SPOREN, spoor, TEAMTYPE_EXTRA, LAGE_AFHANKELIJKHEID_BLOK } from "../../data/teamdag/sporen.js";
import {
  AANLEIDINGEN,
  RESULTATEN,
  TEAMGROOTTES,
  AFHANKELIJKHEID,
  ERVARING,
  optie,
} from "../../data/teamdag/vragen.js";

export const MAX_HOOFDTHEMAS = 3;

/**
 * Bepaalt de sporen die dit programma dragen, op volgorde van gewicht.
 * Het eerste spoor is het hoofdthema.
 */
export function bepaalSporen(antwoorden = {}) {
  const uit = [];
  const voegToe = (id) => {
    if (id && !uit.includes(id) && spoor(id)) uit.push(id);
  };

  // 1. Het primaire gewenste resultaat.
  (antwoorden.resultaten || []).forEach((rid) => {
    const r = optie(RESULTATEN, rid);
    if (r) voegToe(r.spoor);
  });

  // 2. De aanleiding.
  (antwoorden.aanleidingen || []).forEach((aid) => {
    const a = optie(AANLEIDINGEN, aid);
    if (a) voegToe(a.spoor);
  });

  return uit.slice(0, MAX_HOOFDTHEMAS);
}

/**
 * Past dit blok bij de gekozen groepsgrootte? Getoetst wordt de representatieve
 * grootte van de bandbreedte: het zwaarste realistische geval. Een werkvorm die
 * daar niet werkt, komt niet in het programma.
 */
export function pastBijGroep(b, grootteId) {
  const g = optie(TEAMGROOTTES, grootteId);
  if (!g) return true;
  const maat = g.representatief || g.max;
  return b.minGroep <= maat && b.maxGroep >= maat;
}

/** Past dit blok bij de gekozen setting (fysiek, online of hybride)? */
export function pastBijSetting(b, setting) {
  if (!setting) return true;
  return !b.settings || b.settings.length === 0 || b.settings.includes(setting);
}

/** Vraagt dit blok niet meer veiligheid dan er volgens de antwoorden is? */
export function pastBijVeiligheid(b, ruimte) {
  return b.veiligheidMin <= (typeof ruimte === "number" ? ruimte : 3);
}

/** Past dit blok bij de ervaring van het team met teamdagen? */
export function pastBijErvaring(b, ervaringId) {
  const e = optie(ERVARING, ervaringId);
  if (!e) return true;
  return b.niveau <= e.maxNiveau;
}

/**
 * Alle harde randvoorwaarden bij elkaar. Een blok dat hier niet doorheen komt,
 * verschijnt niet in het programma en ook niet als alternatief.
 */
export function isToegestaan(b, antwoorden, ruimte) {
  return (
    pastBijGroep(b, antwoorden.teamgrootte) &&
    pastBijSetting(b, antwoorden.setting) &&
    pastBijVeiligheid(b, ruimte) &&
    pastBijErvaring(b, antwoorden.ervaring)
  );
}

/**
 * Weegt hoe goed een blok aansluit op de voorkeuren. Alleen gebruikt om binnen
 * de voorkeurslijst te ordenen, nooit om extra blokken toe te voegen.
 */
export function score(b, antwoorden, sporenIds) {
  let punten = 0;

  const voorkeuren = (antwoorden.werkwijzen || []).filter((w) => w !== "geen");
  if (voorkeuren.length) {
    const raak = (b.werkwijzen || []).filter((w) => voorkeuren.includes(w)).length;
    punten += raak * 3;
  }

  (antwoorden.aanleidingen || []).forEach((a) => {
    if ((b.aanleidingen || []).includes(a)) punten += 2;
  });

  (antwoorden.resultaten || []).forEach((rid) => {
    const r = optie(RESULTATEN, rid);
    if (r && (b.doelen || []).includes(r.blokDoel)) punten += 4;
  });

  if (b.teamtypen && b.teamtypen.length && b.teamtypen.includes(antwoorden.teamtype)) punten += 2;

  // Het eerste spoor weegt zwaarder dan het tweede, en binnen een spoor weegt
  // een blok dat vooraan in de voorkeurslijst staat zwaarder dan een blok
  // achteraan. Zo blijft de bedoelde opbouw van het spoor herkenbaar.
  sporenIds.forEach((sid, i) => {
    const s = spoor(sid);
    if (!s) return;
    const positie = s.voorkeur.indexOf(b.id);
    if (positie === -1) return;
    punten += (sporenIds.length - i) * 2;
    if (i === 0) punten += Math.max(0, 6 - positie);
  });

  return punten;
}

/**
 * Stelt de lijst met inhoudelijke blokken samen: de kern van het programma,
 * zonder opening, pauze en afsluiting. Die worden in programma.js toegevoegd.
 *
 * `ruimte` komt uit de veiligheidsbeoordeling.
 */
export function kiesInhoudelijkeBlokken(antwoorden = {}, ruimte = 3, maxAantal = 4) {
  const sporenIds = bepaalSporen(antwoorden);

  // Voorkeurslijst opbouwen: eerst het hoofdspoor, dan de volgende sporen, dan
  // wat bij het teamtype hoort.
  const volgorde = [];
  sporenIds.forEach((sid) => {
    const s = spoor(sid);
    if (s) s.voorkeur.forEach((bid) => { if (!volgorde.includes(bid)) volgorde.push(bid); });
  });
  (TEAMTYPE_EXTRA[antwoorden.teamtype] || []).forEach((bid) => {
    if (!volgorde.includes(bid)) volgorde.push(bid);
  });

  // Bij lage onderlinge afhankelijkheid hoort de vraag waarvoor het team elkaar
  // nodig heeft vooraan, niet achteraan.
  const afh = optie(AFHANKELIJKHEID, antwoorden.afhankelijkheid);
  if (afh && afh.niveau <= 1) {
    const i = volgorde.indexOf(LAGE_AFHANKELIJKHEID_BLOK);
    if (i > -1) volgorde.splice(i, 1);
    volgorde.unshift(LAGE_AFHANKELIJKHEID_BLOK);
  }

  const kandidaten = volgorde
    .map((id) => blok(id))
    .filter(Boolean)
    .filter((b) => b.fase !== "landen" && b.fase !== "afsluiting" && b.fase !== "pauze")
    .filter((b) => !KADER_IDS.includes(b.id))
    .filter((b) => isToegestaan(b, antwoorden, ruimte));

  // Binnen de voorkeursvolgorde sorteren op aansluiting. De volgorde uit het
  // spoor blijft leidend; de score breekt gelijke gevallen open.
  const metScore = kandidaten.map((b, i) => ({ b, i, s: score(b, antwoorden, sporenIds) }));
  metScore.sort((x, y) => (y.s - x.s) || (x.i - y.i));

  // Maximaal één onderdeel per hoofddoel, zodat er geen twee blokken hetzelfde
  // doen. Het eerste doel van een blok geldt als hoofddoel; een gedeeld tweede
  // doel is geen reden om een blok te laten vallen.
  const gekozen = [];
  const gedekteDoelen = new Set();
  for (const { b } of metScore) {
    if (gekozen.length >= maxAantal) break;
    const hoofddoel = (b.doelen || [])[0];
    if (hoofddoel && gedekteDoelen.has(hoofddoel)) continue;
    gekozen.push(b);
    if (hoofddoel) gedekteDoelen.add(hoofddoel);
  }

  // Controleren of ieder gekozen resultaat gedekt is. Zo niet, ruil het laagst
  // scorende blok in voor een blok dat het ontbrekende doel wel dient.
  const vereisteDoelen = (antwoorden.resultaten || [])
    .map((rid) => optie(RESULTATEN, rid))
    .filter(Boolean)
    .map((r) => r.blokDoel);

  vereisteDoelen.forEach((doel) => {
    if (gekozen.some((b) => (b.doelen || []).includes(doel))) return;
    const vervanger = metScore
      .map(({ b }) => b)
      .find((b) => (b.doelen || []).includes(doel) && !gekozen.includes(b));
    if (!vervanger) return;
    if (gekozen.length < maxAantal) {
      gekozen.push(vervanger);
    } else {
      gekozen[gekozen.length - 1] = vervanger;
    }
  });

  return sorteerOpFase(gekozen);
}

const FASE_INDEX = { ophalen: 1, betekenis: 2, verdieping: 3, keuzes: 4, gedrag: 5 };

/** Zet blokken in de logische volgorde van het programma. */
export function sorteerOpFase(blokken) {
  return [...blokken].sort((a, b) => (FASE_INDEX[a.fase] || 9) - (FASE_INDEX[b.fase] || 9));
}

/**
 * Zoekt gelijkwaardige alternatieven voor één blok: zelfde fase, vergelijkbaar
 * doel, en toegestaan binnen dezelfde randvoorwaarden.
 */
export function alternatievenVoor(blokId, antwoorden = {}, ruimte = 3, alGebruikt = []) {
  const huidig = blok(blokId);
  if (!huidig) return [];
  return BLOKKEN.filter((b) => {
    if (b.id === blokId) return false;
    if (alGebruikt.includes(b.id)) return false;
    if (KADER_IDS.includes(b.id)) return false;
    if (b.fase !== huidig.fase) return false;
    if (!isToegestaan(b, antwoorden, ruimte)) return false;
    if ((huidig.doelen || []).length === 0) return true;
    return (b.doelen || []).some((d) => (huidig.doelen || []).includes(d));
  });
}
