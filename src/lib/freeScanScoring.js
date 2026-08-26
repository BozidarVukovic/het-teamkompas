// ─────────────────────────────────────────────────────────────────────────────
// GRATIS TEAMSCAN — SCOREBEREKENING EN RAPPORTSAMENSTELLING
//
// Volledig deterministisch. Dezelfde antwoorden leveren altijd hetzelfde
// rapport op. Er komt geen taalmodel of externe dienst aan te pas: het rapport
// bestaat uit vooraf geschreven tekstblokken die met vaste regels worden
// gekozen.
//
// Rekenen gebeurt met volledige precisie op de schaal van 1 tot en met 5;
// afronden op één decimaal is alleen weergave.
// ─────────────────────────────────────────────────────────────────────────────

import {
  FREE_SCAN_QUESTIONS, FREE_SCAN_THEMES, MIN_BEANTWOORD_AANDEEL, SCORE_ZONES, SCORE_MODEL_VERSION,
} from "../data/freeScanConfig.js";
import { COMBINATIEPATRONEN } from "../data/freeScanPatterns.js";
import {
  AANBEVELING_REDENEN, DOMEIN_TAGS, EIGEN_BIJDRAGE_VRAGEN, EXPERIMENTENBIBLIOTHEEK,
  FREE_SCAN_EXPERIMENTEN,
} from "../data/freeScanAdvies.js";
import { BASIS_ITEMS } from "../data/kennisbank/items.js";

export const MAX_PATRONEN = 2;
export const STERKE_BASIS_GRENS = 3.5;

/** De scorecategorie bij een gemiddelde op de schaal van 1 tot en met 5. */
export function zoneVoor(gemiddelde) {
  if (gemiddelde === null || gemiddelde === undefined) return null;
  return SCORE_ZONES.find((zone) => gemiddelde >= zone.min) || SCORE_ZONES[SCORE_ZONES.length - 1];
}

/** Weergave op één decimaal. Rekenen gebeurt altijd met de volle waarde. */
export function afgerond(gemiddelde) {
  return gemiddelde === null || gemiddelde === undefined ? null : Math.round(gemiddelde * 10) / 10;
}

/** De oude weergave van 0 tot 100, zodat eerder opgeslagen rapporten en de
 *  e-mailsjabloon blijven werken. */
export function naarHonderd(gemiddelde) {
  return gemiddelde === null || gemiddelde === undefined ? null : Math.round((gemiddelde - 1) * 25);
}

/** Zet een zin achter een dubbele punt: het eerste woord met een kleine letter. */
export function naDubbelePunt(tekst = "") {
  const kaal = String(tekst).trim();
  if (!kaal) return "";
  return /^[A-Z][a-zà-ÿ]/.test(kaal) ? kaal[0].toLowerCase() + kaal.slice(1) : kaal;
}

/** Eén antwoord omzetten naar een bruikbare waarde. Ontbrekende en
 *  niet-van-toepassing-antwoorden leveren null op en tellen dus nooit als nul. */
function antwoordWaarde(vraag, ruw) {
  if (ruw === null || ruw === undefined || ruw === "" || ruw === "nvt") return null;
  const getal = Number(ruw);
  if (!Number.isFinite(getal) || getal < 1 || getal > 5) return null;
  return vraag.reverse ? 6 - getal : getal;
}

/**
 * Berekent per domein het gemiddelde van de beantwoorde vragen.
 * Een domeinscore ontstaat alleen wanneer minstens 75 procent van de vragen in
 * dat domein is beantwoord.
 */
export function berekenDomeinScores(answers = {}) {
  return FREE_SCAN_THEMES.map((theme) => {
    const vragen = FREE_SCAN_QUESTIONS.filter((item) => item.theme === theme.id);
    const waarden = vragen.map((vraag) => antwoordWaarde(vraag, answers[vraag.id])).filter((w) => w !== null);
    const voldoendeData = vragen.length > 0 && waarden.length / vragen.length >= MIN_BEANTWOORD_AANDEEL;
    const gemiddelde = voldoendeData ? waarden.reduce((a, b) => a + b, 0) / waarden.length : null;
    const zone = zoneVoor(gemiddelde);
    return {
      ...theme,
      gemiddelde,
      getoond: afgerond(gemiddelde),
      score: naarHonderd(gemiddelde),
      answered: waarden.length,
      gevraagd: vragen.length,
      voldoendeData,
      zone,
      tekst: zone && theme.teksten ? theme.teksten[zone.tekstSleutel] : null,
    };
  });
}

/** Vult een domeinlijst aan die van de server komt, of uit een ouder rapport. */
export function normaliseerDomeinScores(themeScores = []) {
  return themeScores.map((bestaand) => {
    const basis = FREE_SCAN_THEMES.find((t) => t.id === bestaand.id) || {};
    const gemiddelde = bestaand.gemiddelde !== undefined && bestaand.gemiddelde !== null
      ? bestaand.gemiddelde
      : (bestaand.score === null || bestaand.score === undefined ? null : bestaand.score / 25 + 1);
    const zone = zoneVoor(gemiddelde);
    return {
      ...basis,
      ...bestaand,
      gemiddelde,
      getoond: afgerond(gemiddelde),
      score: bestaand.score !== undefined && bestaand.score !== null ? bestaand.score : naarHonderd(gemiddelde),
      voldoendeData: gemiddelde !== null,
      zone,
      tekst: zone && basis.teksten ? basis.teksten[zone.tekstSleutel] : null,
    };
  });
}

function scoreVan(domeinen, id) {
  const gevonden = domeinen.find((d) => d.id === id);
  return gevonden && gevonden.gemiddelde !== null ? gevonden.gemiddelde : null;
}

/**
 * Beoordeelt één patroon. Geeft null terug wanneer een benodigde score
 * ontbreekt of niet aan een voorwaarde wordt voldaan.
 */
export function toetsPatroon(patroon, domeinen) {
  let sterkte = 0;
  for (const voorwaarde of patroon.voorwaarden || []) {
    const waarde = scoreVan(domeinen, voorwaarde.domein);
    if (waarde === null) return null;
    if (voorwaarde.min !== undefined) {
      if (waarde < voorwaarde.min) return null;
      sterkte += waarde - voorwaarde.min;
    }
    if (voorwaarde.max !== undefined) {
      if (waarde > voorwaarde.max) return null;
      sterkte += voorwaarde.max - waarde;
    }
  }

  let verschil = 0;
  if (patroon.verschil) {
    const hoog = scoreVan(domeinen, patroon.verschil.hoog);
    const laag = scoreVan(domeinen, patroon.verschil.laag);
    if (hoog === null || laag === null) return null;
    verschil = hoog - laag;
    if (verschil < patroon.verschil.min) return null;
  } else {
    const waarden = (patroon.voorwaarden || []).map((v) => scoreVan(domeinen, v.domein)).filter((w) => w !== null);
    verschil = waarden.length ? Math.max(...waarden) - Math.min(...waarden) : 0;
  }

  return { ...patroon, sterkte, verschil };
}

/**
 * Kiest maximaal twee patronen. Volgorde volgens de vaste regel: sterkte van de
 * combinatie, dan relevantie voor het laagst scorende domein, dan het onderlinge
 * scoreverschil, dan de vooraf vastgelegde prioriteit.
 */
export function kiesPatronen(domeinen, laagste, max = MAX_PATRONEN) {
  const kandidaten = COMBINATIEPATRONEN
    .map((patroon) => toetsPatroon(patroon, domeinen))
    .filter(Boolean)
    .map((patroon) => ({
      ...patroon,
      raaktLaagste: Boolean(laagste && (patroon.voorwaarden || []).some((v) => v.domein === laagste.id)),
    }))
    .sort((a, b) =>
      b.sterkte - a.sterkte
      || Number(b.raaktLaagste) - Number(a.raaktLaagste)
      || b.verschil - a.verschil
      || b.prioriteit - a.prioriteit
      || a.id.localeCompare(b.id, "nl")
    );

  const gekozen = [];
  for (const kandidaat of kandidaten) {
    if (gekozen.length >= max) break;
    const botst = gekozen.some((eerder) =>
      (eerder.sluitUit || []).includes(kandidaat.id) || (kandidaat.sluitUit || []).includes(eerder.id)
    );
    if (!botst) gekozen.push(kandidaat);
  }
  return gekozen;
}

/** Twee experimenten: één om alleen te doen en één voor een gesprek. */
export function kiesExperimenten(laagste, patronen = []) {
  const voorkeur = patronen.map((p) => p.experiment).filter(Boolean);
  const kies = (soort) => {
    const passend = FREE_SCAN_EXPERIMENTEN.filter(
      (exp) => exp.soort === soort && (!laagste || exp.themas.includes(laagste.id))
    );
    const lijst = passend.length ? passend : FREE_SCAN_EXPERIMENTEN.filter((exp) => exp.soort === soort);
    return [...lijst].sort((a, b) => {
      const aVoorkeur = voorkeur.indexOf(a.id);
      const bVoorkeur = voorkeur.indexOf(b.id);
      const aRang = aVoorkeur === -1 ? 99 : aVoorkeur;
      const bRang = bVoorkeur === -1 ? 99 : bVoorkeur;
      // Een experiment dat bij weinig domeinen hoort is specifieker, en dus
      // passender, dan een experiment dat overal bij kan.
      return aRang - bRang || a.themas.length - b.themas.length || a.id.localeCompare(b.id, "nl");
    })[0] || null;
  };
  return [kies("persoonlijk"), kies("gesprek")].filter(Boolean);
}

/** Drie reflectievragen: bij de ontwikkelkans, bij het patroon en over de eigen bijdrage. */
export function kiesReflectievragen(laagste, patronen = [], domeinen = []) {
  const vragen = [];
  if (laagste && laagste.reflection) vragen.push(laagste.reflection);
  if (patronen[0] && patronen[0].reflectievraag) vragen.push(patronen[0].reflectievraag);
  else {
    const tweede = domeinen.filter((d) => d.gemiddelde !== null && d.id !== (laagste || {}).id)[0];
    if (tweede && tweede.reflection) vragen.push(tweede.reflection);
  }
  vragen.push(EIGEN_BIJDRAGE_VRAGEN[(laagste || {}).id] || EIGEN_BIJDRAGE_VRAGEN.standaard);
  return [...new Set(vragen)].slice(0, 3);
}

/**
 * Zoekt in de kennisbank een bestaand artikel of hulpmiddel dat aansluit bij de
 * ontwikkelkans. Omdat we uit de kennisbank kiezen, bestaat de pagina altijd.
 */
export function kiesAanbeveling(laagste, patronen = []) {
  if (!laagste) return null;
  const tags = DOMEIN_TAGS[laagste.id] || [];
  if (!tags.length) return null;
  const gewicht = (item) => tags.reduce((som, tag, index) => som + (item.tags.includes(tag) ? tags.length - index : 0), 0);
  const voorkeurTypes = ["artikel", "download", "werkvorm", "reflectievraag"];

  const beste = BASIS_ITEMS
    .filter((item) => item.status !== "concept" && gewicht(item) > 0 && voorkeurTypes.includes(item.type))
    .map((item) => ({ item, gewicht: gewicht(item), typeRang: voorkeurTypes.indexOf(item.type) }))
    .sort((a, b) =>
      b.gewicht - a.gewicht
      || a.typeRang - b.typeRang
      || Number(b.item.uitgelicht) - Number(a.item.uitgelicht)
      || a.item.titel.localeCompare(b.item.titel, "nl")
    )[0];

  if (!beste) return null;
  // Geen dubbele punt in de zin zelf: die staat er in de weergave al voor.
  const reden = patronen[0]
    ? "Dit sluit aan bij het patroon \u201c" + patronen[0].titel + "\u201d dat in jouw antwoorden opvalt."
    : "Dit sluit aan bij " + naDubbelePunt(laagste.label) + ", het domein waar volgens jouw antwoorden nu de meeste ruimte zit.";
  return { ...beste.item, reden };
}

/**
 * Stelt het volledige rapport samen uit de domeinscores. Wordt zowel direct na
 * de scan gebruikt als op de rapportpagina, zodat beide hetzelfde tonen.
 */
export function stelRapportSamen(ruweDomeinen = []) {
  const domeinen = normaliseerDomeinScores(ruweDomeinen);
  const meetbaar = domeinen.filter((d) => d.gemiddelde !== null);
  const oplopend = [...meetbaar].sort((a, b) => a.gemiddelde - b.gemiddelde || a.label.localeCompare(b.label, "nl"));
  const aflopend = [...meetbaar].sort((a, b) => b.gemiddelde - a.gemiddelde || a.label.localeCompare(b.label, "nl"));

  const sterkePunten = aflopend.slice(0, 2);
  // Bij gelijke scores zou hetzelfde domein zowel sterk punt als ontwikkelkans
  // kunnen worden. Dat leest als een tegenstrijdigheid, dus kiezen we dan het
  // laagste domein dat niet al als sterk punt is genoemd.
  const laagste = oplopend.find((d) => !sterkePunten.some((s) => s.id === d.id)) || oplopend[0] || null;
  const spreiding = meetbaar.length
    ? Math.max(...meetbaar.map((d) => d.gemiddelde)) - Math.min(...meetbaar.map((d) => d.gemiddelde))
    : 0;
  const allesSterk = meetbaar.length > 0 && meetbaar.every((d) => d.gemiddelde >= STERKE_BASIS_GRENS);
  const geenSterk = meetbaar.length > 0 && meetbaar.every((d) => d.gemiddelde < STERKE_BASIS_GRENS);

  const patronen = kiesPatronen(domeinen, laagste);
  const reflecties = kiesReflectievragen(laagste, patronen, oplopend);
  const experimenten = kiesExperimenten(laagste, patronen);
  const aanbeveling = kiesAanbeveling(laagste, patronen);

  return {
    themeScores: domeinen,
    meetbaar: meetbaar.length,
    spreiding,
    // Liggen alle scores dicht bij elkaar, dan zegt de volgorde weinig.
    gelijkmatig: meetbaar.length > 1 && spreiding < 0.25,
    strengths: sterkePunten,
    // Zonder een score van 3,5 of hoger noemen we het geen sterke basis.
    sterkeKop: geenSterk ? "Je relatief sterkste aspecten" : "Je sterke basis",
    // Scoort alles goed, dan is de laagste score een volgende stap en geen probleem.
    ontwikkelkans: laagste,
    ontwikkelkansKop: allesSterk ? "Je volgende ontwikkelkans" : "Je belangrijkste ontwikkelkans",
    // Twee ontwikkelkansen blijven beschikbaar voor eerdere weergaven en de e-mail.
    opportunities: oplopend.slice(0, 2),
    patterns: patronen,
    reflections: reflecties,
    experiments: experimenten,
    experimentenbibliotheek: EXPERIMENTENBIBLIOTHEEK,
    aanbeveling,
    aanbevelingRedenen: AANBEVELING_REDENEN,
    onvolledig: domeinen.filter((d) => d.gemiddelde === null).map((d) => d.label),
    scoreModelVersion: SCORE_MODEL_VERSION,
  };
}

export function calculateFreeScanResults(answers = {}) {
  return stelRapportSamen(berekenDomeinScores(answers));
}

/** Behouden onder de oude naam, zodat bestaande aanroepen blijven werken. */
export const zoneFor = zoneVoor;

export default calculateFreeScanResults;
