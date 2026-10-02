// "Wie helpt mij verder?" — van een hulpvraag naar hoogstens drie collega's.
//
// De bestaande tool begint bij een collega. Deze begint bij een taak: je
// beschrijft waar je vastloopt, en de app kijkt wie in jouw team daarbij zou
// kunnen helpen.
//
// Drie bronnen, in deze volgorde van gewicht:
//
//   1. De hand-in-handleiding. Wat iemand zelf heeft opgeschreven en met dit
//      team heeft gedeeld. Een uitspraak, geen interpretatie -- daarom weegt
//      die het zwaarst en wordt de zin geciteerd.
//   2. Het Insights Discovery-profiel, via de kenmerken die eruit zijn
//      afgeleid. Dat levert een aanwijzing voor een werkvoorkeur, meer niet.
//   3. De functie die iemand zelf heeft ingevuld. Alleen wanneer de hulpvraag
//      er woordelijk op aansluit; anders zegt een functietitel niets over deze
//      taak.
//
// Wat hier met opzet niet gebeurt:
//
//   - Geen score, geen percentage, geen ranglijst. De volgorde volgt uit het
//     soort onderbouwing (eigen woorden vóór een afgeleide aanwijzing) en dat
//     staat ook zo op het scherm.
//   - Geen verzonnen expertise, beschikbaarheid of eigenschappen. Bestaat het
//     veld niet in de teamomgeving, dan komt het hier niet voor.
//   - Geen stellige uitspraak uit een profiel alleen. "Deze collega maakt
//     alles af" staat er nooit; "gaf aan energie te krijgen van iets afronden"
//     wel.
//   - Geen taalmodel. Dezelfde hulpvraag geeft hetzelfde antwoord, en elke zin
//     is terug te voeren op een bron die de gebruiker zelf kan nalezen.
//
// Afscherming loopt via de aanroeper: deze functie krijgt alleen de collega's
// uit het eigen team mee, met uitsluitend wat die mensen met dít team hebben
// gedeeld. Zie collegas.js en gedeeldeKopie.js.
//
// Pure functies: geen React, geen database, wel te testen.

import { kenmerk, optieVan } from "../../../data/app/kenmerken.js";
import { HULPSOORTEN, START_KENMERKEN, VULWOORDEN, hulpsoort } from "../../../data/app/hulpsoorten.js";

/** Meer dan drie namen is geen hulp meer maar een lijst. */
export const MAX_SUGGESTIES = 3;

/** Onder deze lengte valt er uit een vrije tekst niets te halen. */
export const MIN_VRAAG = 10;

const klein = (t) => String(t || "").toLowerCase();

/* Hoeveel letters twee woorden aan het begin moeten delen om als hetzelfde te
   tellen. Zes vangt verbuigingen ("afronden" en "afgerond" niet, maar wel
   "afronden" en "afrondingen") en samenstellingen ("onboardingprogramma" en
   "onboardingspecialist"), en houdt "begroting" en "begrip" uit elkaar. */
const STAM = 6;

/** Delen deze twee woorden hun begin? */
export function zelfdeStam(a = "", b = "") {
  const x = klein(a);
  const y = klein(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const kort = Math.min(x.length, y.length);
  if (kort < STAM) return false;
  let i = 0;
  while (i < kort && x[i] === y[i]) i += 1;
  return i >= STAM;
}

/**
 * Komt dit zoekwoord voor in deze tekst?
 *
 * Een zoekwoord met een spatie erin ("op een rij") wordt letterlijk gezocht;
 * daar valt niets aan te verbuigen. Een los woord wordt op stam vergeleken,
 * zodat "afgerond" ook gevonden wordt met het woord "afronden".
 */
export function bevatWoord(tekst = "", zoekwoord = "") {
  const t = klein(tekst);
  if (zoekwoord.includes(" ")) return t.includes(klein(zoekwoord));
  return t.split(/[^a-zà-ÿ]+/).some((w) => zelfdeStam(w, zoekwoord));
}

/** De betekenisvolle woorden uit een hulpvraag. */
export function woordenUit(tekst = "") {
  return [...new Set(
    klein(tekst)
      .replace(/[^a-zà-ÿ\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !VULWOORDEN.has(w))
  )];
}

/**
 * Welke hulpsoorten spelen er?
 *
 * Wat de gebruiker aanvinkt telt altijd. Vinkt hij niets aan, dan leiden we
 * het af uit zijn eigen woorden -- de knoppen zijn immers optioneel. Levert
 * ook dat niets op, dan is er geen hulpsoort en zegt het scherm dat.
 */
export function bepaalHulpsoorten({ vraag = "", gekozen = [] } = {}) {
  const geldig = (gekozen || []).filter((id) => hulpsoort(id));
  if (geldig.length > 0) return { ids: geldig, afgeleid: false };

  const gevonden = HULPSOORTEN.filter((h) => h.woorden.some((w) => bevatWoord(vraag, w))).map((h) => h.id);
  return { ids: gevonden, afgeleid: gevonden.length > 0 };
}

/** De zin waarin een woord voorkomt, als citaat. */
function zinMet(tekst, woorden) {
  const zinnen = String(tekst || "").split(/(?<=[.!?])\s+/).filter((z) => z.trim());
  const raak = zinnen.find((z) => woorden.some((w) => bevatWoord(z, w)));
  if (!raak) return null;
  const schoon = raak.trim();
  return schoon.length > 180 ? schoon.slice(0, 177).trimEnd() + "…" : schoon;
}

/** De waarde die deze collega op een kenmerk deelde, of niets. */
function waardeVan(collega, kenmerkId) {
  const gevonden = (collega.kenmerken || []).find((k) => k && k.kenmerkId === kenmerkId && k.waarde);
  return gevonden ? gevonden.waarde : null;
}

/**
 * Het bewijs dat deze collega bij deze hulpvraag zou kunnen helpen.
 *
 * Elk stuk bewijs noemt zijn bron, zodat op het scherm te zien is of iets uit
 * iemands eigen woorden komt of uit een afgeleid profiel.
 */
export function bewijsVoor({ collega, hulpsoortIds = [], vraagwoorden = [] } = {}) {
  const bewijs = [];
  const gezieneSecties = new Set();

  hulpsoortIds.forEach((id) => {
    const h = hulpsoort(id);
    if (!h) return;

    // 1. Eigen woorden. Zwaarst, en als citaat.
    (collega.handleiding || []).forEach((s) => {
      if (!s || !s.tekst || gezieneSecties.has(s.sectieId)) return;
      const citaat = zinMet(s.tekst, h.woorden);
      if (!citaat) return;
      gezieneSecties.add(s.sectieId);
      bewijs.push({
        bron: "handleiding",
        hulpsoortId: id,
        titel: s.titel || s.sectieId,
        zin: `In de hand-in-handleiding schrijft ${collega.voornaam}: “${citaat}”`,
      });
    });

    // 2. Afgeleid uit het profiel. Een aanwijzing, geen uitspraak.
    h.aanwijzingen.forEach((a) => {
      if (waardeVan(collega, a.kenmerkId) !== a.waarde) return;
      bewijs.push({
        bron: "profiel",
        hulpsoortId: id,
        titel: (kenmerk(a.kenmerkId) || {}).label || a.kenmerkId,
        // Zonder het voorbehoud erin: dat staat één keer onder het blok,
        // en het bronlabel bij deze regel zegt al waar hij vandaan komt.
        zin: `${collega.voornaam} ${a.zin}.`,
      });
    });
  });

  // 3. De functie, alleen bij een woordelijke aansluiting op de hulpvraag.
  const functie = String(collega.functie || "").trim();
  if (functie) {
    const raak = woordenUit(functie).filter((w) => vraagwoorden.some((v) => zelfdeStam(v, w)));
    if (raak.length > 0) {
      bewijs.push({
        bron: "rol",
        hulpsoortId: null,
        titel: "Rol",
        zin: `De rol van ${collega.voornaam} is ${functie}, en dat sluit aan op wat je beschrijft.`,
      });
    }
  }

  return bewijs;
}

/**
 * Het voorbehoud bij wat uit een profiel is afgeleid.
 *
 * Stond eerst vóór elke regel die uit een profiel kwam, waardoor dezelfde zin
 * drie keer op één kaart terugkwam. Het bronlabel bij de regel zegt al waar
 * die vandaan komt; het voorbehoud hoort bij het blok, niet bij elke regel.
 */
export const VOORBEHOUD_PROFIEL =
  "Wat uit een profiel komt is een aanwijzing voor een werkvoorkeur, geen uitspraak van deze collega zelf. Vraag het na.";

/**
 * De reden in één regel, voor de dichtgeklapte regel in de lijst.
 *
 * Zegt wát voor onderbouwing er is -- eigen woorden, een rol die aansluit, of
 * een aanwijzing uit een profiel -- en niet hoe goed iemand past. Geen aantal
 * en geen score: de volgorde van de regels volgt al uit het soort onderbouwing
 * en dat staat onderaan het scherm uitgelegd.
 */
export function kortomVoor(bewijs = []) {
  const label = (b) => String((hulpsoort(b.hulpsoortId) || {}).label || "").toLowerCase();

  const eigen = bewijs.find((b) => b.bron === "handleiding");
  if (eigen) return label(eigen) ? `Schreef zelf over ${label(eigen)}` : "Schreef hier zelf over";

  const rol = bewijs.find((b) => b.bron === "rol");
  if (rol) return "De rol sluit aan op wat je beschrijft";

  const profiel = bewijs.find((b) => b.bron === "profiel");
  if (profiel) return label(profiel) ? `Profiel wijst op ${label(profiel)}` : "Aanwijzing uit het profiel";

  return "";
}

/** Spreekt de informatie over deze collega zichzelf tegen? */
export function tegenspraakBij({ collega, hulpsoortIds = [], bewijs = [] } = {}) {
  const uitProfiel = bewijs.filter((b) => b.bron === "profiel").map((b) => b.hulpsoortId);
  const uitEigenWoorden = bewijs.some((b) => b.bron === "handleiding");

  const botst = [];
  hulpsoortIds.forEach((id) => {
    if (!uitProfiel.includes(id)) return;
    const h = hulpsoort(id);
    (h.tegen || []).forEach((t) => {
      if (waardeVan(collega, t.kenmerkId) !== t.waarde) return;
      const label = (optieVan(t.kenmerkId, t.waarde) || {}).deelbaarAls || "";
      botst.push(`${h.label}: het profiel wijst twee kanten op${label ? ` — er staat ook “${label}”` : ""}.`);
    });
  });

  if (botst.length === 0) return null;
  return {
    zinnen: botst,
    uitleg: uitEigenWoorden
      ? "Wat deze collega zelf opschreef weegt zwaarder dan wat uit het profiel is afgeleid, maar zeker is het niet. Vraag het na."
      : "Er is hier geen uitspraak van de collega zelf om op terug te vallen. Behandel dit als een vraag, niet als een conclusie.",
  };
}

/**
 * Twee tips om prettig te beginnen, uit wat deze collega zelf deelde.
 *
 * Verschilt jouw eigen voorkeur op hetzelfde punt, dan staat dat erbij -- want
 * dát is waar het bij een eerste gesprek misgaat.
 */
export function startTips({ collega, mijnKenmerken = [] } = {}) {
  const mijn = (kenmerkId) => {
    const g = (mijnKenmerken || []).find((k) => k && k.kenmerkId === kenmerkId && k.waarde);
    return g ? g.waarde : null;
  };

  const tips = [];
  START_KENMERKEN.forEach((kenmerkId) => {
    if (tips.length >= 2) return;
    const hun = waardeVan(collega, kenmerkId);
    if (!hun) return;
    const optie = optieVan(kenmerkId, hun);
    if (!optie || !optie.deelbaarAls) return;

    const mijnWaarde = mijn(kenmerkId);
    const anders = mijnWaarde && mijnWaarde !== hun ? (optieVan(kenmerkId, mijnWaarde) || {}).deelbaarAls : null;

    // Als citaat, niet vervoegd. "Ik begin graag even persoonlijk" omzetten
    // naar een derde persoon levert in code vroeg of laat "Nikki begin graag"
    // op; zo staat er precies wat deze collega zelf deelde.
    tips.push({
      kenmerkId,
      zin: `${collega.voornaam} gaf aan: “${optie.deelbaarAls}”`,
      verschil: anders ? `Jij gaf aan: “${anders}”` : null,
    });
  });

  return tips;
}

/** De eerste naam, zonder de rest. */
function voornaamVan(naam = "") {
  const schoon = String(naam || "").trim();
  if (!schoon) return "deze collega";
  return schoon.split(/\s+/)[0];
}

/**
 * De hulpvraag beantwoorden.
 *
 * `collegas` zijn uitsluitend de mensen uit het eigen team, met uitsluitend
 * wat zij met dit team hebben gedeeld. Jijzelf zit er niet bij: de aanroeper
 * laat je eruit, net als bij "Samenwerken met...".
 */
export function zoekHulp({ vraag = "", gekozenHulpsoorten = [], mijnKenmerken = [], collegas = [] } = {}) {
  const opmerkingen = [];
  const tekst = String(vraag || "").trim();

  const { ids: hulpsoortIds, afgeleid } = bepaalHulpsoorten({ vraag: tekst, gekozen: gekozenHulpsoorten });
  const vraagwoorden = woordenUit(tekst);

  if (tekst.length < MIN_VRAAG && hulpsoortIds.length === 0) {
    return {
      suggesties: [],
      hulpsoorten: [],
      afgeleid: false,
      opmerkingen: ["Beschrijf kort je taak of kies waar je hulp bij kunt gebruiken, dan kan de app meekijken."],
      transparantie: TRANSPARANTIE,
    };
  }

  if (afgeleid) {
    opmerkingen.push(
      `Je hebt niets aangevinkt, dus is er gekeken naar je eigen woorden: ${hulpsoortIds
        .map((id) => (hulpsoort(id) || {}).label)
        .join(", ")
        .toLowerCase()}.`
    );
  }

  const beoordeeld = (collegas || [])
    .filter((c) => c && c.naam)
    .map((c) => {
      const collega = { ...c, voornaam: voornaamVan(c.naam) };
      const bewijs = bewijsVoor({ collega, hulpsoortIds, vraagwoorden });
      return { collega, bewijs };
    })
    .filter((r) => r.bewijs.length > 0);

  // Eigen woorden eerst, dan meer onderbouwing, dan op naam zodat de volgorde
  // niet wisselt tussen twee keer zoeken. Geen score: dit is de volgorde van
  // het soort bewijs, en die staat ook op het scherm.
  const sterkte = (r) => (r.bewijs.some((b) => b.bron === "handleiding") ? 2 : 0) + (r.bewijs.some((b) => b.bron === "rol") ? 1 : 0);
  beoordeeld.sort(
    (a, b) =>
      sterkte(b) - sterkte(a) ||
      b.bewijs.length - a.bewijs.length ||
      String(a.collega.naam).localeCompare(String(b.collega.naam))
  );

  const suggesties = beoordeeld.slice(0, MAX_SUGGESTIES).map(({ collega, bewijs }) => {
    const soorten = [...new Set(bewijs.map((b) => b.hulpsoortId).filter(Boolean))];
    // Wat er op de kaart komt te staan. Het voorbehoud hangt daaraan en niet
    // aan al het bewijs: staat er geen afgeleide regel op de kaart, dan hoort
    // het voorbehoud erover er ook niet te staan.
    const zichtbaar = bewijs.slice(0, 3);
    return {
      sleutel: collega.sleutel || collega.uid || collega.naam,
      naam: collega.naam,
      voornaam: collega.voornaam,
      // Alleen tonen wat er is; een lege functie is geen reden voor een streepje.
      functie: String(collega.functie || "").trim() || null,
      doorBeheerder: Boolean(collega.doorBeheerder),
      waarom: zichtbaar,
      // De regel die in de dichtgeklapte lijst te zien is.
      kortom: kortomVoor(bewijs),
      voorbehoud: zichtbaar.some((b) => b.bron === "profiel") ? VOORBEHOUD_PROFIEL : null,
      bijdrage: soorten.map((id) => (hulpsoort(id) || {}).bijdrage).filter(Boolean).slice(0, 2),
      startTips: startTips({ collega, mijnKenmerken }),
      tegenspraak: tegenspraakBij({ collega, hulpsoortIds, bewijs }),
    };
  });

  if (suggesties.length === 0) {
    opmerkingen.push(
      "Er is in dit team niemand over wie genoeg is gedeeld om hier een onderbouwd voorstel te doen. Dat zegt niets over je collega's: het betekent dat de informatie ontbreekt."
    );
  } else if (suggesties.length < MAX_SUGGESTIES) {
    opmerkingen.push(
      `Er ${suggesties.length === 1 ? "is er één" : `zijn er ${suggesties.length}`} met genoeg onderbouwing. De rest staat er niet bij omdat er over hen te weinig is gedeeld.`
    );
  }

  return {
    suggesties,
    hulpsoorten: hulpsoortIds.map((id) => ({ id, label: (hulpsoort(id) || {}).label })),
    afgeleid,
    opmerkingen,
    transparantie: TRANSPARANTIE,
  };
}

export const TRANSPARANTIE =
  "Deze voorstellen komen uit wat je collega's zelf met dit team hebben gedeeld: hun hand-in-handleiding, de kenmerken uit hun Insights Discovery-profiel en de functie die ze invulden. Eigen woorden wegen zwaarder dan een afgeleide aanwijzing, en in die volgorde staan ze hieronder. Er is geen score en geen rangorde van mensen.";

/**
 * De uitnodiging die je kunt kopiëren.
 *
 * Alleen wat de gebruiker zelf heeft ingevuld plus de bijdrage die uit de
 * onderbouwing volgt. Geen verzonnen deadline, geen geschatte tijdsinvestering
 * en geen belofte namens de ander.
 */
export function stelHulpvraagOp({ vraag = "", suggestie = null, hulpsoorten = [] } = {}) {
  if (!suggestie) return "";
  const naam = suggestie.voornaam || "collega";
  const waarbij = (hulpsoorten || []).map((h) => String(h.label || h).toLowerCase()).join(" en ");
  const bijdrage = (suggestie.bijdrage || [])[0];

  const regels = [
    `Hoi ${naam},`,
    "",
    String(vraag || "").trim() || "Ik loop vast op iets en zoek er hulp bij.",
    "",
    waarbij
      ? `Ik zoek vooral hulp bij ${waarbij}.`
      : "Ik zoek iemand om hier samen naar te kijken.",
  ];

  if (bijdrage) regels.push(`Ik dacht aan jou omdat je zou kunnen helpen om ${bijdrage}.`);

  regels.push("", "Zou je een keer met me mee willen kijken? Laat maar weten wat jou schikt.");
  return regels.join("\n");
}
