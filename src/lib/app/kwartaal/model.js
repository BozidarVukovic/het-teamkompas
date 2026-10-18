// De vorm van wat er wordt opgeslagen.
//
// Elk record gaat hier langs voordat het de opslag in gaat, en de regels in
// firestore.rules controleren dezelfde dingen nog een keer aan de serverkant.
// Twee keer hetzelfde controleren klinkt dubbel, maar het is het niet: deze
// laag levert een bruikbare foutmelding op, en de regels zorgen dat het ook
// klopt als iemand de app overslaat. Alleen het tweede is een belofte.
//
// Wat hier níét staat is net zo belangrijk als wat er wel staat. Er is geen
// voortgangspercentage, geen score, geen urenveld op een doel en geen
// rangorde. Die velden bestaan niet, dus kunnen ze ook niet per ongeluk
// ingevuld raken.

import { geldigeWeek, weekAfstand, weekSleutel } from "./periode.js";

export const MODEL_VERSIE = 1;

/* ══════════════════════════════════════════════════════════════ kwartalen */

const KWARTAAL = /^(\d{4})-K([1-4])$/;

export function geldigKwartaal(sleutel) {
  return KWARTAAL.test(String(sleutel || ""));
}

/**
 * De weken van een kwartaal.
 *
 * Van de week waarin de eerste dag valt tot en met de week waarin de laatste
 * dag valt. Een week die over de kwartaalgrens loopt hoort dus bij allebei.
 * Dat is met opzet: de planning gaat per week, en een week half meetellen
 * levert alleen maar halve uren op die nergens kloppen.
 */
export function kwartaalPeriode(sleutel) {
  const m = KWARTAAL.exec(String(sleutel || ""));
  if (!m) return null;
  const jaar = Number(m[1]);
  const k = Number(m[2]);
  const eerste = new Date(Date.UTC(jaar, (k - 1) * 3, 1));
  const laatste = new Date(Date.UTC(jaar, k * 3, 0));
  return { van: weekSleutel(eerste), tot: weekSleutel(laatste) };
}

export function huidigKwartaal(datum = new Date()) {
  const d = datum instanceof Date ? datum : new Date(datum);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-K${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

/** Het kwartaal n kwartalen verder. Gebruikt voor de kwartaalkeuze. */
export function kwartaalPlus(sleutel, n) {
  const m = KWARTAAL.exec(String(sleutel || ""));
  if (!m || !Number.isInteger(n)) return "";
  const totaal = Number(m[1]) * 4 + (Number(m[2]) - 1) + n;
  return `${Math.floor(totaal / 4)}-K${(totaal % 4) + 1}`;
}

/* ═════════════════════════════════════════════════════════ de levensloop

   concept        van jou alleen; het team ziet hem niet
   ter-afstemming gedeeld, maar nog niet afgesproken
   afgesproken    het team heeft ja gezegd
   gepauzeerd     ligt stil, de nog geplande uren vallen weg
   afgerond       klaar
   gestopt        gaat niet door

   Delen is niet hetzelfde als afspreken. Dat onderscheid is de hele reden dat
   deze tool bestaat: iets op het scherm zetten is geen toezegging van
   capaciteit, medewerking of voorrang. */

export const STATUSSEN = ["concept", "ter-afstemming", "afgesproken", "gepauzeerd", "afgerond", "gestopt"];

export const STATUSLABELS = {
  concept: "Concept",
  "ter-afstemming": "Ter afstemming",
  afgesproken: "Afgesproken",
  gepauzeerd: "Gepauzeerd",
  afgerond: "Afgerond",
  gestopt: "Gestopt",
};

const OVERGANGEN = {
  concept: ["ter-afstemming", "gestopt"],
  "ter-afstemming": ["concept", "afgesproken", "gestopt"],
  afgesproken: ["gepauzeerd", "afgerond", "gestopt", "ter-afstemming"],
  gepauzeerd: ["afgesproken", "gestopt", "afgerond"],
  afgerond: [],
  gestopt: ["concept"],
};

export function volgendeStatussen(status) {
  return OVERGANGEN[status] ? [...OVERGANGEN[status]] : [];
}

export function magNaarStatus(van, naar) {
  return volgendeStatussen(van).includes(naar);
}

/** Alles behalve een concept is voor het team zichtbaar. */
export function isGedeeld(status) {
  return STATUSSEN.includes(status) && status !== "concept";
}

/**
 * Vraagt deze wijziging opnieuw afstemming?
 *
 * Een afgesproken doel waarvan de uren, de periode of het succescriterium
 * veranderen, is geen afgesproken doel meer -- dan is er iets anders afgesproken
 * dan waar het team ja tegen zei. De app zet de status niet zelf terug; ze
 * zegt alleen dát het opnieuw besproken hoort te worden.
 */
export function vraagtOpnieuwAfstemming(oud, nieuw) {
  if (!oud || !nieuw) return false;
  if (oud.status !== "afgesproken") return false;
  const velden = ["succes", "gewenstVan", "gewenstTot", "van", "tot", "urenPerWeek"];
  return velden.some((v) => v in nieuw && v in oud && nieuw[v] !== oud[v]);
}

/* ══════════════════════════════════════════════ resultaat of activiteit

   "Een workshop organiseren" is iets wat je doet, niet iets wat je bereikt.
   Daar is niets mis mee, maar als het als doel in het overzicht staat, kan
   niemand zien waarvoor die workshop er is -- en dus ook niet of hij nog nodig
   is als de tijd krap wordt.

   Dit is een duwtje en geen slot: wie zijn doel zo wil opschrijven, mag dat.
   De app kan niet weten of "het jaarplan schrijven" hier het resultaat is of
   de weg ernaartoe. */

const ACTIVITEITEN = /\b(organiseren|houden|plannen|inplannen|opzetten|uitvoeren|maken|schrijven|voorbereiden|regelen|opstellen|bijwonen|starten)\b/i;

export function lijktOpActiviteit(titel) {
  const tekst = String(titel || "").trim();
  if (!tekst) return null;
  const m = ACTIVITEITEN.exec(tekst);
  if (!m) return null;
  return {
    woord: m[0].toLowerCase(),
    vraag: `"${m[0].toLowerCase()}" is iets wat je doet. Wat moet dat opleveren?`,
  };
}

/* ═══════════════════════════════════════════════════════ de controles zelf */

export const MAX = {
  titel: 160,
  succes: 400,
  tekst: 1000,
  kort: 200,
  regels: 20,
  bijdragenPerVerzoek: 12,
  urenPerWeek: 60,
  wijzigingen: 60,
};

function tekst(waarde, max) {
  return typeof waarde === "string" && waarde.trim().length > 0 && waarde.trim().length <= max;
}

function optioneleTekst(waarde, max) {
  return waarde === undefined || waarde === null || waarde === "" || tekst(waarde, max);
}

function uren(waarde) {
  // Kwartieren, en niet meer dan een werkweek. Een negatief getal of een
  // kommagetal met vier decimalen is geen urenschatting maar een vergissing.
  return (
    typeof waarde === "number" &&
    Number.isFinite(waarde) &&
    waarde >= 0 &&
    waarde <= MAX.urenPerWeek &&
    Math.abs(waarde * 4 - Math.round(waarde * 4)) < 1e-9
  );
}

function periodeKlopt(van, tot) {
  return geldigeWeek(van) && geldigeWeek(tot) && weekAfstand(van, tot) >= 0;
}

function schoon(waarde) {
  return typeof waarde === "string" ? waarde.replace(/\s+/g, " ").trim() : "";
}

function uitkomst(fouten, waarde) {
  return fouten.length > 0 ? { ok: false, fouten, waarde: null } : { ok: true, fouten: [], waarde };
}

/* ───────────────────────────────────────────────────────────────── doel */

export function schoonDoel(ruw = {}) {
  const fouten = [];
  if (!tekst(ruw.titel, MAX.titel)) fouten.push("Schrijf op welk resultaat je wilt bereiken.");
  if (!tekst(ruw.succes, MAX.succes)) fouten.push("Schrijf op wanneer het geslaagd is.");
  if (!geldigKwartaal(ruw.kwartaal)) fouten.push("Kies een kwartaal.");
  if (!tekst(ruw.eigenaarUid, 128)) fouten.push("Een doel heeft een eigenaar.");
  if (!STATUSSEN.includes(ruw.status)) fouten.push("Onbekende status.");
  if (!optioneleTekst(ruw.teamdoel, MAX.kort)) fouten.push("De verwijzing naar een teamdoel is te lang.");
  if (!optioneleTekst(ruw.stand, MAX.kort)) fouten.push("De stand van zaken is te lang.");
  if (!optioneleTekst(ruw.hulpvraag, MAX.tekst)) fouten.push("De hulpvraag is te lang.");
  if (!optioneleTekst(ruw.knelpunt, MAX.tekst)) fouten.push("Het knelpunt is te lang.");
  if (!optioneleTekst(ruw.toelichting, MAX.tekst)) fouten.push("De toelichting is te lang.");
  if (ruw.gewenstVan || ruw.gewenstTot) {
    if (!periodeKlopt(ruw.gewenstVan, ruw.gewenstTot)) fouten.push("De gewenste periode loopt van een week naar een latere week.");
  }

  return uitkomst(fouten, {
    versie: MODEL_VERSIE,
    kwartaal: ruw.kwartaal,
    titel: schoon(ruw.titel),
    succes: schoon(ruw.succes),
    eigenaarUid: ruw.eigenaarUid,
    status: ruw.status,
    // Afgeleid en niet los in te vullen: anders kan er een concept bestaan dat
    // gedeeld staat, en dat is precies het lek dat we niet willen.
    gedeeld: isGedeeld(ruw.status),
    teamdoel: schoon(ruw.teamdoel),
    gewenstVan: geldigeWeek(ruw.gewenstVan) ? ruw.gewenstVan : "",
    gewenstTot: geldigeWeek(ruw.gewenstTot) ? ruw.gewenstTot : "",
    stand: schoon(ruw.stand),
    hulpvraag: schoon(ruw.hulpvraag),
    knelpunt: schoon(ruw.knelpunt),
    toelichting: schoon(ruw.toelichting),
  });
}

/* ────────────────────────────────────────────────────────────── bijdrage */

export function schoonBijdrage(ruw = {}) {
  const fouten = [];
  if (!tekst(ruw.doelId, 128)) fouten.push("Een bijdrage hoort bij een doel.");
  if (!tekst(ruw.uid, 128)) fouten.push("Een bijdrage hoort bij een persoon.");
  if (!STATUSSEN.includes(ruw.status)) fouten.push("Onbekende status.");
  if (!periodeKlopt(ruw.van, ruw.tot)) fouten.push("Kies een periode van een week tot en met een latere week.");
  // Onbekend mag. Nul is iets anders dan onbekend, en allebei mogen.
  if (ruw.urenPerWeek !== null && ruw.urenPerWeek !== undefined && !uren(ruw.urenPerWeek)) {
    fouten.push("Vul de inzet in hele kwartieren in, of laat hem leeg als je het nog niet weet.");
  }
  if (!optioneleTekst(ruw.expertise, MAX.kort)) fouten.push("De gevraagde expertise is te lang.");
  if (!optioneleTekst(ruw.hulpvraag, MAX.tekst)) fouten.push("De hulpvraag is te lang.");

  return uitkomst(fouten, {
    versie: MODEL_VERSIE,
    doelId: ruw.doelId,
    uid: ruw.uid,
    status: ruw.status,
    gedeeld: isGedeeld(ruw.status),
    van: ruw.van,
    tot: ruw.tot,
    urenPerWeek: uren(ruw.urenPerWeek) ? ruw.urenPerWeek : null,
    expertise: schoon(ruw.expertise),
    hulpvraag: schoon(ruw.hulpvraag),
  });
}

/* ──────────────────────────────────────────────── de ruimte van één persoon */

export function schoonRuimte(ruw = {}) {
  const fouten = [];
  if (!tekst(ruw.uid, 128)) fouten.push("De ruimte hoort bij een persoon.");
  if (!geldigKwartaal(ruw.kwartaal)) fouten.push("Kies een kwartaal.");
  const regels = Array.isArray(ruw.regels) ? ruw.regels : [];
  if (regels.length > MAX.regels) fouten.push(`Meer dan ${MAX.regels} regels is te veel om nog te overzien.`);
  regels.forEach((r, i) => {
    if (!r || !periodeKlopt(r.van, r.tot)) fouten.push(`Regel ${i + 1}: kies een periode van een week tot en met een latere week.`);
    else if (!uren(r.urenPerWeek)) fouten.push(`Regel ${i + 1}: vul de uren per week in hele kwartieren in.`);
  });

  return uitkomst(fouten, {
    versie: MODEL_VERSIE,
    uid: ruw.uid,
    kwartaal: ruw.kwartaal,
    regels: regels.map((r) => ({ van: r.van, tot: r.tot, urenPerWeek: r.urenPerWeek })),
  });
}

/* ──────────────────────────────────────────────────────────────── verzoek */

export function schoonVerzoek(ruw = {}) {
  const fouten = [];
  if (!tekst(ruw.titel, MAX.titel)) fouten.push("Schrijf op welk resultaat er wordt gevraagd.");
  if (!tekst(ruw.aanvrager, MAX.kort)) fouten.push("Schrijf op wie het vraagt.");
  if (!tekst(ruw.waarom, MAX.tekst)) fouten.push("Schrijf op waarom dit nu nodig is.");
  if (!geldigKwartaal(ruw.kwartaal)) fouten.push("Kies een kwartaal.");
  if (!periodeKlopt(ruw.van, ruw.tot)) fouten.push("Kies een gewenste periode van een week tot en met een latere week.");
  if (!optioneleTekst(ruw.deadline, MAX.kort)) fouten.push("De deadline is te lang.");
  if (!optioneleTekst(ruw.hardeVerplichting, MAX.tekst)) fouten.push("De toelichting bij de verplichting is te lang.");
  if (!optioneleTekst(ruw.gevolgenNietDoen, MAX.tekst)) fouten.push("De gevolgen zijn te lang beschreven.");

  const gevraagd = Array.isArray(ruw.bijdragen) ? ruw.bijdragen : [];
  if (gevraagd.length === 0) fouten.push("Schrijf op welke bijdragen er nodig zijn.");
  if (gevraagd.length > MAX.bijdragenPerVerzoek) fouten.push("Zoveel losse bijdragen worden onleesbaar.");
  gevraagd.forEach((b, i) => {
    if (!b) return fouten.push(`Bijdrage ${i + 1}: onvolledig.`);
    if (!b.uid && !tekst(b.expertise, MAX.kort)) {
      fouten.push(`Bijdrage ${i + 1}: noem een collega of de expertise die nodig is.`);
    }
    if (b.urenPerWeek !== null && b.urenPerWeek !== undefined && !uren(b.urenPerWeek)) {
      fouten.push(`Bijdrage ${i + 1}: vul de inzet in hele kwartieren in, of laat hem leeg.`);
    }
    return null;
  });

  return uitkomst(fouten, {
    versie: MODEL_VERSIE,
    kwartaal: ruw.kwartaal,
    titel: schoon(ruw.titel),
    aanvrager: schoon(ruw.aanvrager),
    waarom: schoon(ruw.waarom),
    van: ruw.van,
    tot: ruw.tot,
    deadline: schoon(ruw.deadline),
    hardeVerplichting: schoon(ruw.hardeVerplichting),
    gevolgenNietDoen: schoon(ruw.gevolgenNietDoen),
    bijdragen: gevraagd.map((b) => ({
      uid: b.uid || "",
      expertise: schoon(b.expertise),
      urenPerWeek: uren(b.urenPerWeek) ? b.urenPerWeek : null,
    })),
  });
}

/* ──────────────────────────────────────────────────────────────── besluit */

export function schoonBesluit(ruw = {}) {
  const fouten = [];
  if (!tekst(ruw.verzoekId, 128)) fouten.push("Een besluit hoort bij een verzoek.");
  if (!tekst(ruw.optie, 40)) fouten.push("Een besluit hoort bij een gekozen optie.");
  if (!tekst(ruw.afweging, MAX.tekst)) fouten.push("Schrijf op waarom dit de keuze is.");
  if (!tekst(ruw.beslisserUid, 128)) fouten.push("Leg vast wie het besluit neemt.");
  if (!optioneleTekst(ruw.heroverwegenOp, MAX.kort)) fouten.push("Het moment van heroverwegen is te lang beschreven.");
  const wijzigingen = Array.isArray(ruw.wijzigingen) ? ruw.wijzigingen : [];
  if (wijzigingen.length === 0) fouten.push("Een besluit zonder wijzigingen verandert niets.");
  if (wijzigingen.length > MAX.wijzigingen) fouten.push("Zoveel wijzigingen tegelijk zijn niet meer te overzien.");
  // Wie het voorstel maakte en wie het vastlegt mogen dezelfde zijn, maar het
  // mandaat moet met zoveel woorden bevestigd zijn -- technisch beheer is geen
  // inhoudelijke beslissingsbevoegdheid.
  if (ruw.mandaat !== true) fouten.push("Bevestig dat deze beslisser hierover mag besluiten.");

  return uitkomst(fouten, {
    versie: MODEL_VERSIE,
    verzoekId: ruw.verzoekId,
    optie: ruw.optie,
    afweging: schoon(ruw.afweging),
    beslisserUid: ruw.beslisserUid,
    mandaat: true,
    heroverwegenOp: schoon(ruw.heroverwegenOp),
    wijzigingen,
    // Waar de planning op stond toen het voorstel werd gemaakt. Bij het
    // vastleggen wordt hiermee gecontroleerd of er sindsdien iets is veranderd;
    // zo niet, dan zou een besluit stilletjes op verouderde cijfers rusten.
    gebaseerdOp: schoon(ruw.gebaseerdOp),
  });
}

/* ═══════════════════════════════════════════════════════════ de geschiedenis

   Elke wijziging aan een gedeeld doel of een gedeelde bijdrage levert een
   regel op. Die regels worden alleen toegevoegd, nooit gewijzigd of verwijderd
   -- een geschiedenis die je kunt bijwerken is geen geschiedenis. */

export function maakGeschiedenisregel({ wat, doorUid, van = null, naar = null, reden = "" } = {}) {
  if (!tekst(wat, 80) || !tekst(doorUid, 128)) return null;
  return {
    versie: MODEL_VERSIE,
    wat,
    doorUid,
    van: van === null ? null : String(van).slice(0, MAX.kort),
    naar: naar === null ? null : String(naar).slice(0, MAX.kort),
    reden: schoon(reden).slice(0, MAX.kort),
  };
}
