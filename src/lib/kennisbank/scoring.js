// ─────────────────────────────────────────────────────────────────────────────
// KENNISBANK — AANBEVELINGSLOGICA
//
// Volledig deterministisch. Geen AI, geen externe dienst, geen willekeur:
// dezelfde keuzes leveren altijd dezelfde volgorde op.
//
// Wil je de weging aanpassen, verander dan alleen PUNTEN en DREMPELS hieronder.
// De rest van de code leest die waarden uit en hoeft niet mee te veranderen.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BUCKET_VOLGORDE, DOELEN, MAX_PRIMAIR, MAX_SECUNDAIR, SITUATIES,
  contenttype, doel as doelVia, rol as rolVia, situatie as situatieVia,
  tijdBovengrens, tijdLabel, tagLabel,
} from "../../data/kennisbank/taxonomie.js";

/** De puntentoekenning. Eén plek, zodat de weging later eenvoudig te wijzigen is. */
export const PUNTEN = {
  situatieTag: 5,        // per overeenkomende tag met een gekozen teamsituatie
  situatieDirect: 5,     // item is expliciet aan die teamsituatie gekoppeld
  doel: 4,               // per overeenkomend gewenst resultaat
  doelType: 2,           // contenttype past bij het gekozen resultaat
  werkwijze: 4,          // per overeenkomende manier van werken
  rol: 3,                // content is voor deze rol bedoeld
  rolPrioriteit: 2,      // contenttype heeft voorrang bij deze rol
  tijd: 3,               // past binnen de beschikbare tijd
  domein: 2,             // per overeenkomend domein
  uitgelicht: 1,         // handmatige redactionele prioriteit, maximaal 1 punt
};

/** Hoeveel tags per gekozen situatie meetellen. Voorkomt dat een item met heel
 *  veel tags alles wegdrukt. */
export const MAX_TAGS_PER_SITUATIE = 3;

export const DREMPELS = {
  primair: 9,     // vanaf deze score verschijnt een item bij "Dit kan je nu helpen"
  secundair: 4,   // vanaf deze score bij "Ook mogelijk interessant"
};

export const LEGE_KEUZE = { situaties: [], rol: "", doelen: [], tijd: "", werkwijzen: [] };

function overlap(a = [], b = []) {
  return a.filter((waarde) => b.includes(waarde));
}

function tijdInMinuten(item) {
  return item.tijdMinuten === null || item.tijdMinuten === undefined ? 0 : item.tijdMinuten;
}

/**
 * Past de beschikbare tijd toe als uitsluitingsregel.
 * `ruimte` verruimt de bovengrens; dat gebruiken we alleen in de terugvalroute
 * wanneer er anders te weinig te tonen valt, en dat wordt bij het resultaat
 * zichtbaar vermeld.
 */
export function pastBinnenTijd(item, tijdId, ruimte = 0) {
  const grens = tijdBovengrens(tijdId);
  if (grens === null || grens === undefined) return true;
  return tijdInMinuten(item) <= grens + ruimte;
}

/**
 * Berekent de relevantie van één contentitem bij de gemaakte keuzes.
 * Geeft de score terug plus de onderdelen waaruit die is opgebouwd, zodat de
 * uitleg bij het resultaat uit dezelfde bron komt als de score zelf.
 */
export function scoorItem(item, keuze = LEGE_KEUZE) {
  const gekozenSituaties = (keuze.situaties || []).map(situatieVia).filter(Boolean);
  const gekozenDoelen = (keuze.doelen || []).map(doelVia).filter(Boolean);
  const gekozenRol = rolVia(keuze.rol);
  const werkwijzen = keuze.werkwijzen || [];

  let score = 0;
  const criteria = new Set();
  const treffers = { tags: [], situaties: [], doelen: [], werkwijzen: [], domeinen: [] };

  gekozenSituaties.forEach((situatie) => {
    const gedeeldeTags = overlap(situatie.tags, item.tags).slice(0, MAX_TAGS_PER_SITUATIE);
    if (gedeeldeTags.length) {
      score += gedeeldeTags.length * PUNTEN.situatieTag;
      criteria.add("situatie");
      treffers.tags.push(...gedeeldeTags);
    }
    if (item.situaties.includes(situatie.id)) {
      score += PUNTEN.situatieDirect;
      criteria.add("situatie");
      treffers.situaties.push(situatie.id);
    }
    const gedeeldeDomeinen = overlap(situatie.domeinen, item.domeinen);
    if (gedeeldeDomeinen.length) {
      score += Math.min(gedeeldeDomeinen.length, 2) * PUNTEN.domein;
      criteria.add("domein");
      treffers.domeinen.push(...gedeeldeDomeinen);
    }
  });

  gekozenDoelen.forEach((doel) => {
    if (item.doelen.includes(doel.id)) {
      score += PUNTEN.doel;
      criteria.add("doel");
      treffers.doelen.push(doel.id);
    }
    if (doel.types.includes(item.type)) {
      score += PUNTEN.doelType;
      criteria.add("doel");
    }
    const gedeeldeTags = overlap(doel.tags, item.tags);
    if (gedeeldeTags.length) {
      score += PUNTEN.situatieTag;
      treffers.tags.push(...gedeeldeTags);
    }
  });

  const gedeeldeWerkwijzen = overlap(werkwijzen, item.werkwijzen);
  if (gedeeldeWerkwijzen.length) {
    score += Math.min(gedeeldeWerkwijzen.length, 2) * PUNTEN.werkwijze;
    criteria.add("werkwijze");
    treffers.werkwijzen.push(...gedeeldeWerkwijzen);
  }

  if (gekozenRol) {
    if (item.rollen.includes(gekozenRol.id)) {
      score += PUNTEN.rol;
      criteria.add("rol");
    }
    const positie = gekozenRol.prioriteit.indexOf(item.type);
    if (positie === 0) score += PUNTEN.rolPrioriteit;
    else if (positie > 0) score += 1;
  }

  if (keuze.tijd && tijdBovengrens(keuze.tijd) !== null && pastBinnenTijd(item, keuze.tijd)) {
    score += PUNTEN.tijd;
    criteria.add("tijd");
  }

  if (item.uitgelicht) score += PUNTEN.uitgelicht;

  return {
    item,
    score,
    criteria: [...criteria],
    treffers: {
      tags: [...new Set(treffers.tags)],
      situaties: [...new Set(treffers.situaties)],
      doelen: [...new Set(treffers.doelen)],
      werkwijzen: [...new Set(treffers.werkwijzen)],
      domeinen: [...new Set(treffers.domeinen)],
    },
  };
}

function datumWaarde(item) {
  const tijd = Date.parse(item.datum || "");
  return Number.isNaN(tijd) ? 0 : tijd;
}

/** Sorteervolgorde: score, aantal hoofdcriteria, redactionele prioriteit, actualiteit. */
export function vergelijk(a, b) {
  return (
    b.score - a.score
    || b.criteria.length - a.criteria.length
    || Number(b.item.uitgelicht) - Number(a.item.uitgelicht)
    || datumWaarde(b.item) - datumWaarde(a.item)
    || a.item.titel.localeCompare(b.item.titel, "nl")
  );
}

/**
 * Kiest maximaal `max` resultaten en zorgt daarbij voor inhoudelijke
 * diversiteit: eerst het best scorende item per soort, daarna aanvullen op
 * score. Vraagt de bezoeker duidelijk om één soort content, dan slaan we de
 * diversiteitsronde over.
 */
export function kiesMetDiversiteit(gescoord, max = MAX_PRIMAIR, diversiteit = true) {
  if (!diversiteit) return gescoord.slice(0, max);
  const gekozen = [];
  const gebruikteBuckets = new Set();
  BUCKET_VOLGORDE.forEach((bucket) => {
    if (gekozen.length >= max) return;
    const kandidaat = gescoord.find((r) => !gekozen.includes(r) && contenttype(r.item.type).bucket === bucket);
    if (kandidaat) {
      gekozen.push(kandidaat);
      gebruikteBuckets.add(bucket);
    }
  });
  gescoord.forEach((resultaat) => {
    if (gekozen.length < max && !gekozen.includes(resultaat)) gekozen.push(resultaat);
  });
  return gekozen.sort(vergelijk).slice(0, max);
}

/** Bepaalt of de bezoeker duidelijk om één specifiek soort content vraagt. */
export function vraagtEenSoort(keuze = LEGE_KEUZE) {
  const werkwijzen = keuze.werkwijzen || [];
  if (werkwijzen.length === 1 && (werkwijzen[0] === "downloaden" || werkwijzen[0] === "meten")) return true;
  const doelen = (keuze.doelen || []).map(doelVia).filter(Boolean);
  if (doelen.length === 1 && doelen[0].types.length === 1) return true;
  return false;
}

/**
 * Bouwt de volledige aanbeveling: primaire resultaten, aanvullende resultaten
 * en de melding wanneer er is teruggevallen op een ruimere zoekopdracht.
 */
export function beveelAan(items, keuze = LEGE_KEUZE, opties = {}) {
  const max = opties.max || MAX_PRIMAIR;
  const publiek = items.filter((item) => item.status !== "concept");
  const diversiteit = opties.diversiteit !== undefined ? opties.diversiteit : !vraagtEenSoort(keuze);

  const scoor = (ruimte) => publiek
    .filter((item) => pastBinnenTijd(item, keuze.tijd, ruimte))
    .map((item) => ({ ...scoorItem(item, keuze), tijdOverschrijding: ruimte > 0 && !pastBinnenTijd(item, keuze.tijd) }))
    .sort(vergelijk);

  let gescoord = scoor(0);
  let primair = kiesMetDiversiteit(gescoord.filter((r) => r.score >= DREMPELS.primair), max, diversiteit);
  let tijdVerruimd = false;

  // Terugvalroute: te weinig sterke treffers. We verruimen de tijd met één stap
  // en vermelden dat bij de resultaten, zodat de bezoeker weet wat er gebeurde.
  if (primair.length < 3 && keuze.tijd && tijdBovengrens(keuze.tijd) !== null) {
    const ruimer = scoor(30);
    const ruimerPrimair = kiesMetDiversiteit(ruimer.filter((r) => r.score >= DREMPELS.primair), max, diversiteit);
    if (ruimerPrimair.length > primair.length) {
      gescoord = ruimer;
      primair = ruimerPrimair;
      tijdVerruimd = true;
    }
  }

  // Nog steeds niets: val terug op het belangrijkste onderwerp, dus alleen de
  // eerste gekozen teamsituatie, zonder de overige filters.
  let terugvalOpHoofdonderwerp = false;
  if (!primair.length && (keuze.situaties || []).length) {
    const smal = { ...LEGE_KEUZE, situaties: [keuze.situaties[0]] };
    gescoord = publiek.map((item) => ({ ...scoorItem(item, smal), tijdOverschrijding: !pastBinnenTijd(item, keuze.tijd) })).sort(vergelijk);
    primair = kiesMetDiversiteit(gescoord.filter((r) => r.score >= DREMPELS.secundair), max, diversiteit);
    terugvalOpHoofdonderwerp = true;
  }

  const secundair = gescoord
    .filter((r) => !primair.includes(r) && r.score >= DREMPELS.secundair)
    .slice(0, MAX_SECUNDAIR);

  return {
    primair: primair.map((resultaat) => ({ ...resultaat, reden: bouwReden(resultaat, keuze) })),
    secundair: secundair.map((resultaat) => ({ ...resultaat, reden: bouwReden(resultaat, keuze) })),
    tijdVerruimd,
    terugvalOpHoofdonderwerp,
    leeg: primair.length === 0,
    aantalBeoordeeld: publiek.length,
  };
}

function opsomming(waarden = []) {
  if (waarden.length <= 1) return waarden[0] || "";
  return waarden.slice(0, -1).join(", ") + " en " + waarden[waarden.length - 1];
}

/**
 * Zet de gevonden overeenkomsten om in een uitleg voor de bezoeker.
 * De formuleringen zijn vast en beschrijven alleen wat er is aangeklikt.
 * Er staat nadrukkelijk geen conclusie over het team in.
 */
export function bouwReden(resultaat, keuze = LEGE_KEUZE) {
  const { item, treffers } = resultaat;
  const delen = [];

  const onderwerpen = treffers.tags.slice(0, 2).map(tagLabel).map((label) => label.toLowerCase());
  if (onderwerpen.length) {
    delen.push("Sluit aan bij wat je aangaf over " + opsomming(onderwerpen));
  } else if (treffers.domeinen.length) {
    delen.push("Sluit aan bij het domein dat je koos");
  } else {
    delen.push("Past bij de richting die je hebt gekozen");
  }

  let zin = delen.join(" ") + ".";

  const doelLabels = treffers.doelen
    .map((id) => DOELEN.find((d) => d.id === id))
    .filter(Boolean)
    .slice(0, 1)
    .map((d) => d.label.toLowerCase());
  if (doelLabels.length) zin += " Past bij je doel: " + doelLabels[0] + ".";

  if (item.tijdMinuten) {
    zin += " Reken op " + tijdLabel(item.tijdMinuten).toLowerCase() + ".";
  }
  if (resultaat.tijdOverschrijding) {
    zin += " Dit duurt iets langer dan je aangaf; je kunt het gebruiken als voorbereiding op een later moment.";
  }

  const rol = rolVia(keuze.rol);
  if (rol && rol.id !== "anders" && item.rollen.includes(rol.id)) {
    zin += " Geschikt voor de rol die je koos.";
  }

  return zin;
}

/** Korte samenvatting van de gemaakte keuzes, voor boven de resultaten. */
export function samenvattingKeuze(keuze = LEGE_KEUZE) {
  const rol = rolVia(keuze.rol);
  const situaties = (keuze.situaties || []).map(situatieVia).filter(Boolean);
  const doelen = (keuze.doelen || []).map(doelVia).filter(Boolean);
  const tijd = keuze.tijd ? tijdBovengrens(keuze.tijd) : null;

  const delen = [];
  if (rol && rol.id !== "anders") delen.push("Je zoekt als " + rol.label.toLowerCase() + " ondersteuning");
  else delen.push("Je zoekt ondersteuning");
  if (situaties.length) delen.push("bij " + opsomming(situaties.map((s) => s.kort || s.label.toLowerCase())));
  let zin = delen.join(" ") + ".";
  if (doelen.length) zin += " Je wilt vooral " + opsomming(doelen.map((d) => d.label.toLowerCase())) + ".";
  if (keuze.tijd && tijd !== null) zin += " Je hebt daar ongeveer " + tijdLabel(tijd).toLowerCase() + " voor.";
  else if (keuze.tijd) zin += " Tijd is nu niet doorslaggevend.";
  return zin;
}

/**
 * Losse filters op de resultatenpagina, los van de kenniswijzer.
 * Werkt zowel op ruwe contentitems als op gescoorde resultaten, zodat we
 * dezelfde regel op beide plekken kunnen gebruiken.
 */
export function pasFiltersToe(resultaten, filters = {}) {
  return resultaten.filter((rij) => {
    const item = rij.item || rij;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.domein && !item.domeinen.includes(filters.domein)) return false;
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    if (filters.rol && !item.rollen.includes(filters.rol)) return false;
    if (filters.werkwijze && !item.werkwijzen.includes(filters.werkwijze)) return false;
    if (filters.vorm && item.vorm !== filters.vorm && item.vorm !== "beide") return false;
    if (filters.tijd && !pastBinnenTijd(item, filters.tijd)) return false;
    return true;
  });
}

export const ALLE_SITUATIE_IDS = SITUATIES.map((s) => s.id);
