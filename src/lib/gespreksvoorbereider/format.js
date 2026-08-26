// ─────────────────────────────────────────────────────────────────────────────
// GESPREKSVOORBEREIDER — SAMENSTELLEN VAN HET GESPREKSFORMAT
//
// Volledig deterministisch. De tool herschrijft de woorden van de gebruiker
// niet: hij zet ze in vaste tekstblokken uit teksten.js. Er komt geen
// taalmodel en geen externe dienst aan te pas.
//
// Ontbreekt er een antwoord, dan valt de bijbehorende zin weg. Zo blijft er
// nooit een half ingevulde zin met een gat erin staan.
// ─────────────────────────────────────────────────────────────────────────────

import { situatie } from "../../data/gespreksvoorbereider/situaties.js";
import {
  EFFECT_ONDERDELEN, EFFECT_SCHAAL, RELATIES, RESULTAAT_OPTIES,
} from "../../data/gespreksvoorbereider/stappen.js";
import {
  FORMAT_BLOKKEN, FORMAT_INTRO, TIPS_TIJDENS,
} from "../../data/gespreksvoorbereider/teksten.js";
import { bevatAbsoluteWoorden, bevatSignaalwoorden, schoon } from "./validatie.js";

const ZWAARTE = { geen: 0, beperkt: 1, duidelijk: 2, ernstig: 3 };

/**
 * Welke stap een blok nodig heeft om te mogen verschijnen. Loopt een route niet
 * langs die stap, dan hoort het blok ook niet in het format thuis. De route bij
 * feedback vragen kent bijvoorbeeld geen effectvraag.
 */
const BLOK_VEREIST = {
  waarneming: ["waarneming", "feedbackvraag", "afspraak"],
  effect: ["effect"],
  perspectief: ["openvraag"],
  belang: ["belang"],
  verandering: ["resultaat"],
  afspraak: ["resultaat"],
};

/**
 * Zet een antwoord van de gebruiker om in een nette zin: witruimte weg en een
 * punt aan het eind. De hoofdletter blijft staan, want deze tekst komt in het
 * format altijd achter een dubbele punt te staan. We herschrijven de woorden
 * van de gebruiker nooit.
 */
export function zin(tekst = "") {
  const kaal = schoon(tekst);
  if (!kaal) return "";
  return /[.!?:]$/.test(kaal) ? kaal : kaal + ".";
}

/**
 * Voor korte woordgroepen die middenin een zin komen te staan, zoals een zelf
 * geformuleerd gezamenlijk belang. Alleen dan verlagen we de eerste letter.
 */
export function deelzin(tekst = "") {
  const kaal = schoon(tekst).replace(/[.]$/, "");
  if (!kaal) return "";
  return /^[A-Z][a-zà-ÿ]/.test(kaal) ? kaal[0].toLowerCase() + kaal.slice(1) : kaal;
}

export function opsomming(waarden = []) {
  // Eerst legen eruit: String(null) zou anders letterlijk "null" opleveren.
  const schoongemaakt = waarden.filter(Boolean).map((w) => schoon(w)).filter(Boolean);
  if (!schoongemaakt.length) return "";
  if (schoongemaakt.length === 1) return schoongemaakt[0];
  return schoongemaakt.slice(0, -1).join(", ") + " en " + schoongemaakt[schoongemaakt.length - 1];
}

/** Vult een sjabloon. Ontbreekt één van de waarden, dan vervalt de hele zin. */
export function vulSjabloon(sjabloon = "", waarden = {}) {
  if (!sjabloon) return null;
  let ontbreekt = false;
  const gevuld = sjabloon.replace(/\{(\w+)\}/g, (_, sleutel) => {
    const waarde = waarden[sleutel];
    if (!waarde) {
      ontbreekt = true;
      return "";
    }
    return waarde;
  });
  return ontbreekt ? null : schoon(gevuld);
}

/** Het onderdeel met het zwaarste effect dat ook is toegelicht. */
export function zwaarsteEffect(effect = {}) {
  return EFFECT_ONDERDELEN
    .map((onderdeel) => ({ onderdeel, deel: effect[onderdeel.id] || {} }))
    .filter(({ deel }) => deel.schaal && deel.schaal !== "nvt" && schoon(deel.tekst))
    .sort((a, b) => (ZWAARTE[b.deel.schaal] || 0) - (ZWAARTE[a.deel.schaal] || 0));
}

/** Alle plaatshouderwaarden, afgeleid uit de antwoorden. */
export function bouwWaarden(antwoorden = {}) {
  const belangen = [...(antwoorden.belang || []), antwoorden.belangEigen].filter(Boolean);
  const vragen = [...(antwoorden.openvraag || []), antwoorden.openvraagEigen].map((v) => schoon(v)).filter(Boolean);
  const voorbeelden = Object.values(antwoorden.voorbeelden || {}).map((v) => schoon(v)).filter(Boolean);
  const effecten = zwaarsteEffect(antwoorden.effect);
  const afspraak = antwoorden.afspraak || {};
  const verschil = antwoorden.verschil || {};
  const rollen = antwoorden.rollen || {};
  const grenzen = antwoorden.grenzen || {};

  const belangLijst = belangen.map((b) => deelzin(b)).filter(Boolean);
  const belang = opsomming(belangLijst);
  // Gaat het gedeelde belang zelf al over samenwerking, dan laten we de aanloop
  // "onze samenwerking" weg. Anders staat er twee keer hetzelfde.
  const belangOpening = belangLijst.length
    ? (/samenwerk/i.test(belang) ? belang : opsomming(["onze samenwerking", ...belangLijst]))
    : "";

  return {
    belang,
    belangOpening,
    // Eén belang krijgt "is", een opsomming krijgt "zijn".
    belangWerkwoord: belangOpening ? (belangOpening.includes(" en ") ? "zijn" : "is") : "",
    waarneming: zin(antwoorden.waarneming),
    feedbackvraag: zin(antwoorden.feedbackvraag),
    voorbeelden: voorbeelden.length ? opsomming(voorbeelden) + "." : "",
    effectLabel: effecten.length ? effecten[0].onderdeel.label : "",
    effect: effecten.length ? zin(effecten[0].deel.tekst) : "",
    effectLabelExtra: effecten.length > 1 ? effecten[1].onderdeel.label : "",
    effectExtra: effecten.length > 1 ? zin(effecten[1].deel.tekst) : "",
    openvraag: vragen[0] || "",
    openvraagTwee: vragen[1] || "",
    verbetering: zin(antwoorden.verbetering),
    afspraakOorspronkelijk: zin(afspraak.oorspronkelijk),
    afspraakFeitelijk: zin(afspraak.feitelijk),
    afspraakHielp: zin(afspraak.hielp),
    afspraakBelemmerde: zin(afspraak.belemmerde),
    verschilEens: zin(verschil.eens),
    verschilEigenAanname: zin(verschil.eigenAanname),
    verschilCriteria: zin(verschil.criteria),
    rollenDuidelijkheid: zin(rollen.duidelijkheid),
    grens: zin(grenzen.grens),
  };
}

/** Aandachtspunten: uit de gekozen relatie, de situatie en de gegeven antwoorden. */
export function bouwAandachtspunten(antwoorden = {}, situatieGegevens) {
  const punten = [];
  const relatie = RELATIES.find((r) => r.id === antwoorden.relatie);
  if (relatie) punten.push(relatie.aandachtspunt);
  if (situatieGegevens) punten.push(...(situatieGegevens.nadruk || []).slice(0, 3));
  if (antwoorden.patroon === "patroon") {
    punten.push("Je hebt voorbeelden bij de hand. Gebruik ze pas wanneer de ander erom vraagt of het beeld betwist; een opsomming vooraf voelt als een dossier.");
  }
  if (antwoorden.patroon === "onbekend") {
    punten.push("Je weet nog niet of dit vaker gebeurt. Zeg dat ook: het maakt het gesprek open in plaats van beladen.");
  }
  const grenzen = antwoorden.grenzen || {};
  if (schoon(grenzen.alsgesprek)) {
    punten.push("Als het gesprek onprettig wordt: " + zin(grenzen.alsgesprek));
  }
  if (schoon(grenzen.ondersteuning)) {
    punten.push("Je wilde hierbij betrekken: " + zin(grenzen.ondersteuning));
  }
  return punten;
}

/** Zachte waarschuwingen. Ze houden niemand tegen; ze wijzen alleen op iets. */
export function bouwWaarschuwingen(antwoorden = {}) {
  const waarschuwingen = [];
  const teksten = [
    antwoorden.waarneming,
    ...Object.values(antwoorden.effect || {}).map((deel) => (deel || {}).tekst),
  ].filter(Boolean);

  if (antwoorden.waarnemingCheck === "interpretatie") {
    waarschuwingen.push("Je gaf zelf aan dat er waarschijnlijk nog een interpretatie in je beschrijving zit. Loop de tweede stap nog een keer na voordat je het gesprek voert.");
  }

  const signalen = [...new Set(teksten.flatMap((tekst) => bevatSignaalwoorden(tekst)))];
  if (signalen.length) {
    waarschuwingen.push(
      "In je tekst staan woorden die iets zeggen over de bedoeling of het karakter van de ander: "
      + opsomming(signalen) + ". Overweeg om die te vervangen door wat je hebt gezien of gehoord."
    );
  }

  const absoluut = [...new Set(teksten.flatMap((tekst) => bevatAbsoluteWoorden(tekst)))];
  if (absoluut.length) {
    waarschuwingen.push(
      "Je gebruikt " + opsomming(absoluut) + ". Zulke woorden nodigen uit tot tegenspraak over de uitzondering "
      + "in plaats van tot een gesprek over het patroon. Bijvoorbeeld: ik heb dit in de afgelopen maand drie keer waargenomen."
    );
  }

  return waarschuwingen;
}

/**
 * Stelt de volledige voorbereiding samen.
 * Geeft altijd een bruikbaar object terug, ook wanneer er nog weinig is ingevuld.
 */
export function stelFormatSamen(antwoorden = {}) {
  const situatieGegevens = situatie(antwoorden.situatie);
  const situatieId = antwoorden.situatie || "";
  const waarden = bouwWaarden(antwoorden);

  const route = situatieGegevens ? situatieGegevens.stappen : [];

  const secties = FORMAT_BLOKKEN.map((blok) => {
    const vereist = BLOK_VEREIST[blok.id];
    if (vereist && route.length && !vereist.some((stapId) => route.includes(stapId))) {
      return { id: blok.id, kop: blok.kop, zinnen: [] };
    }
    const zinnen = [];
    const variant = blok.perSituatie && blok.perSituatie[situatieId];
    const hoofdzin = (variant && vulSjabloon(variant, waarden)) || vulSjabloon(blok.sjabloon, waarden);
    if (hoofdzin) zinnen.push(hoofdzin);

    if (blok.id === "waarneming") {
      if (antwoorden.patroon === "patroon") {
        const patroonzin = vulSjabloon(blok.patroonZin, waarden);
        if (patroonzin) zinnen.push(patroonzin);
      } else if (antwoorden.patroon === "onbekend" && zinnen.length) {
        zinnen.push(blok.onbekendZin);
      }
    }

    if (blok.id === "effect") {
      const extra = vulSjabloon(blok.extraZin, waarden);
      if (extra) zinnen.push(extra);
    }

    if (blok.id === "perspectief") {
      const tweede = vulSjabloon(blok.tweedeVraagZin, waarden);
      if (tweede) zinnen.push(tweede);
    }

    const extraVariant = blok.extraPerSituatie && blok.extraPerSituatie[situatieId];
    if (extraVariant) {
      const extra = vulSjabloon(extraVariant, waarden);
      if (extra) zinnen.push(extra);
    }

    return { id: blok.id, kop: blok.kop, zinnen };
  })
    .filter((sectie) => sectie.zinnen.length > 0)
    // Hernummeren, zodat er geen gat in de telling valt wanneer een blok is
    // overgeslagen omdat de route die stap niet kent.
    .map((sectie, index) => ({ ...sectie, kop: index + 1 + ". " + sectie.kop.replace(/^\d+\.\s*/, "") }));

  return {
    situatieId,
    situatieLabel: situatieGegevens ? situatieGegevens.label : "",
    intro: FORMAT_INTRO,
    secties,
    aandachtspunten: bouwAandachtspunten(antwoorden, situatieGegevens),
    waarschuwingen: bouwWaarschuwingen(antwoorden),
    tips: TIPS_TIJDENS,
    samenvatting: {
      relatie: (RELATIES.find((r) => r.id === antwoorden.relatie) || {}).label || "",
      doelen: (antwoorden.resultaat || [])
        .map((id) => (RESULTAAT_OPTIES.find((o) => o.id === id) || {}).label)
        .filter(Boolean),
      effect: EFFECT_ONDERDELEN
        .map((onderdeel) => {
          const deel = (antwoorden.effect || {})[onderdeel.id] || {};
          const schaal = EFFECT_SCHAAL.find((s) => s.id === deel.schaal);
          return schaal ? { label: onderdeel.label, schaal: schaal.label, tekst: schoon(deel.tekst) } : null;
        })
        .filter(Boolean),
    },
  };
}

export default stelFormatSamen;
