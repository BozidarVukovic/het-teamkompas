// Stelt het volledige programma samen: advies, voorbereiding, blokken met
// tijden, aandachtspunten en borging.
//
// Alles wat hier gebeurt is deterministisch. Dezelfde antwoorden leveren altijd
// hetzelfde programma op.

import { blok, KADER_IDS } from "../../data/teamdag/blokken.js";
import { spoor } from "../../data/teamdag/sporen.js";
import {
  TIJDSOPTIES,
  TEAMGROOTTES,
  TEAMTYPES,
  AFHANKELIJKHEID,
  OPVOLGING,
  ROLLEN,
  AANLEIDINGEN,
  RESULTATEN,
  ERVARING,
  BESTAANSDUUR,
  SETTINGS,
  optie,
} from "../../data/teamdag/vragen.js";
import {
  ADVIESTEKSTEN,
  AANDACHTSPUNTEN_ALGEMEEN,
  VOORBEREIDING_ALGEMEEN,
  RUIMTE_ADVIES,
  VOORMETING,
  BORGING_VOORSTELLEN,
  PULSEMETING,
} from "../../data/teamdag/teksten.js";
import { beoordeelVeiligheid } from "./veiligheid.js";
import { bepaalSporen, kiesInhoudelijkeBlokken, isToegestaan, alternatievenVoor } from "./selectie.js";
import { pasDurenAan, zetTijden, totaleDuur, afronden } from "./tijd.js";

export const MAX_AANDACHTSPUNTEN = 5;

/**
 * Hoeveel inhoudelijke blokken passen er redelijkerwijs in de gekozen tijd?
 *
 * De bovengrens is drie, ook op een volledige dag: meer dan drie hoofdthema's
 * in één bijeenkomst levert een programma op dat nergens diep genoeg gaat. Bij
 * meer tijd worden de onderdelen langer, niet talrijker.
 */
export const MAX_INHOUDELIJKE_BLOKKEN = 3;

export function maxInhoudelijkeBlokken(minuten) {
  if (minuten <= 90) return 1;
  if (minuten <= 120) return 2;
  return MAX_INHOUDELIJKE_BLOKKEN;
}

/** Bouwt het kader: opening, check-in, werkafspraken, keuze, gedrag, afsluiting. */
function kaderVoor(antwoorden, ruimte, aantalInhoud) {
  const tijd = optie(TIJDSOPTIES, antwoorden.tijd);
  const minuten = tijd ? tijd.minuten : 240;
  const voor = [];
  const na = [];

  voor.push({ id: "kb-welkom-en-doel", vast: true });

  if (minuten >= 120) {
    const grote = optie(TEAMGROOTTES, antwoorden.teamgrootte);
    const groot = grote && grote.min >= 13;
    voor.push({ id: groot ? "kb-inchecken-groot" : "kb-inchecken-kort", vast: false });
  }

  // Bij beperkte veiligheidsruimte eerst afspreken hoe er vandaag gepraat wordt.
  if (ruimte <= 2 && minuten >= 210) {
    voor.push({ id: "kb-werkafspraken-dag", vast: false });
  }

  if (minuten >= 210 && aantalInhoud >= 2) {
    na.push({ id: "kb-keuze-maken", vast: false });
  }

  // Vertalen naar gedrag: bij weinig opvolging één klein experiment, anders
  // afspraken met eigenaar en datum.
  const opvolging = optie(OPVOLGING, antwoorden.opvolging);
  const wilExperiment = (antwoorden.resultaten || []).includes("experimenten");
  const weinigOpvolging = opvolging && opvolging.maxActies <= 1;
  na.push({ id: wilExperiment || weinigOpvolging ? "kb-experiment-kiezen" : "kb-afspraken-vastleggen", vast: true });

  if (minuten >= 360) {
    na.push({ id: "kb-terugkijken-op-de-dag", vast: false });
  }

  na.push({ id: "kb-check-uit", vast: true });

  return { voor, na };
}

/**
 * Voegt pauzes toe op een logische plek. Een lunch hoort alleen bij een
 * bijeenkomst op locatie; online wordt de dag in plaats daarvan met twee korte
 * pauzes onderbroken.
 */
function metPauzes(onderdelen, antwoorden, duren = {}) {
  const tijd = optie(TIJDSOPTIES, antwoorden.tijd);
  if (!tijd) return onderdelen;
  const wilPauze = antwoorden.pauze !== "nee";
  const online = antwoorden.setting === "online";

  const uit = [...onderdelen];

  if (tijd.lunch && !online) {
    const midden = Math.max(1, Math.floor(uit.length / 2));
    uit.splice(midden, 0, { blok: blok("kb-lunch"), duur: afronden(duren["kb-lunch"] || tijd.lunch), vast: true, pauze: true, vastgezet: Boolean(duren["kb-lunch"]) });
    return uit;
  }

  if (!wilPauze) return uit;
  if (!tijd.pauzeAdvies && !tijd.lunch) return uit;

  // Bij een lange bijeenkomst twee korte pauzes, anders één.
  const posities = tijd.minuten >= 360
    ? [Math.max(1, Math.round(uit.length / 3)), Math.max(2, Math.round((uit.length * 2) / 3)) + 1]
    : [Math.max(1, Math.floor(uit.length / 2))];

  posities.forEach((pos, i) => {
    const index = Math.min(uit.length - 1, pos);
    uit.splice(index, 0, { blok: blok("kb-pauze-kort"), duur: afronden(duren["kb-pauze-kort"] || 15), vast: false, pauze: true, vastgezet: Boolean(duren["kb-pauze-kort"]), sleutel: `pauze-${i}` });
  });

  return uit;
}

/** Verzamelt de aandachtspunten, maximaal vijf. */
function aandachtspunten(antwoorden, oordeel, sporenIds, buffer = 0, minBuffer = 10) {
  const uit = [];

  (oordeel.aandachtspunten || []).forEach((sleutel) => {
    if (AANDACHTSPUNTEN_ALGEMEEN[sleutel]) uit.push(AANDACHTSPUNTEN_ALGEMEEN[sleutel]);
  });

  const hoofdspoor = spoor(sporenIds[0]);
  if (hoofdspoor) (hoofdspoor.aandachtspunten || []).forEach((p) => uit.push(p));

  const afh = optie(AFHANKELIJKHEID, antwoorden.afhankelijkheid);
  if (afh && afh.niveau <= 1) uit.push(ADVIESTEKSTEN.lageAfhankelijkheid);

  const grootte = optie(TEAMGROOTTES, antwoorden.teamgrootte);
  if (grootte && grootte.min >= 21) uit.push(ADVIESTEKSTEN.grootTeam);

  if (antwoorden.setting === "online") uit.push(ADVIESTEKSTEN.online);
  if (antwoorden.setting === "hybride") uit.push(ADVIESTEKSTEN.hybride);
  if (antwoorden.aanwezigheid === "wisselend") uit.push(ADVIESTEKSTEN.wisselend);

  const ervaring = optie(ERVARING, antwoorden.ervaring);
  if (ervaring && ervaring.id === "weinig") uit.push(AANDACHTSPUNTEN_ALGEMEEN.weinigErvaring);

  if ((antwoorden.resultaten || []).length >= 2) uit.push(AANDACHTSPUNTEN_ALGEMEEN.veelDoelen);

  const tijd = optie(TIJDSOPTIES, antwoorden.tijd);
  if (tijd && tijd.minuten <= 120 && (antwoorden.resultaten || []).length >= 2) {
    uit.push(AANDACHTSPUNTEN_ALGEMEEN.kortEnBreed);
  }

  const opvolging = optie(OPVOLGING, antwoorden.opvolging);
  if (opvolging && opvolging.id === "geen") uit.push(ADVIESTEKSTEN.geenOpvolging);

  if (antwoorden.ruimte === "nee") uit.push(AANDACHTSPUNTEN_ALGEMEEN.geenRuimte);

  // Blijft er veel tijd over, leg dan uit dat dat een keuze is en geen omissie.
  if (buffer >= minBuffer * 2) uit.push(AANDACHTSPUNTEN_ALGEMEEN.ruimteOver);

  // Ontdubbelen en begrenzen.
  return [...new Set(uit)].slice(0, MAX_AANDACHTSPUNTEN);
}

/** Stelt de voorbereiding samen. */
function voorbereiding(antwoorden, onderdelen) {
  const materialen = [...new Set(onderdelen.flatMap((o) => o.blok.materialen || []))];
  const vooraf = onderdelen
    .map((o) => ({ titel: o.blok.titel, tekst: o.blok.voorbereiding }))
    .filter((v) => v.tekst && v.tekst !== "Geen.");

  const ruimteTekst = RUIMTE_ADVIES[antwoorden.ruimte] || RUIMTE_ADVIES.ja;

  const voormeting =
    (antwoorden.resultaten || []).includes("begrijpen") ||
    (antwoorden.aanleidingen || []).includes("samenwerking-vast") ||
    onderdelen.some((o) => o.blok.id === "ob-scanresultaten-bespreken");

  return {
    algemeen: VOORBEREIDING_ALGEMEEN,
    perOnderdeel: vooraf,
    materialen,
    ruimte: ruimteTekst,
    voormeting: voormeting ? VOORMETING : null,
    apart: apartTeBespreken(antwoorden),
  };
}

/** Welke onderwerpen bespreek je beter vooraf afzonderlijk? */
function apartTeBespreken(antwoorden) {
  const uit = [];
  const v = antwoorden.veiligheid || {};
  if (v.conflict === "ja" || v.conflict === "gedeeltelijk") {
    uit.push("het conflict dat je aangaf: spreek met iedere betrokkene apart voordat het onderwerp op een gezamenlijke dag komt.");
  }
  if (v.leidinggevende === "ja") {
    uit.push("de rol van de leidinggevende in de spanning: bespreek dat vooraf met de leidinggevende zelf, niet voor het eerst in de groep.");
  }
  if (v["afspraken-vertrouwen"] === "nee") {
    uit.push("wat er met eerdere afspraken is gebeurd: haal dat op voordat je nieuwe afspraken maakt.");
  }
  if ((antwoorden.aanleidingen || []).includes("verandering")) {
    uit.push("de feitelijke stand van de verandering: zorg dat je weet wat er wel en niet vaststaat voordat je het team ernaar vraagt.");
  }
  return uit;
}

/** Borging: acties, evaluatiemoment, experiment en pulsemeting. */
function borging(antwoorden, onderdelen) {
  const opvolging = optie(OPVOLGING, antwoorden.opvolging) || OPVOLGING[5];
  const voorstel = BORGING_VOORSTELLEN[opvolging.id] || BORGING_VOORSTELLEN.onbekend;

  const acties = [];
  const heeftAfspraken = onderdelen.some((o) => o.blok.id === "kb-afspraken-vastleggen");
  const heeftExperiment = onderdelen.some((o) => o.blok.id === "kb-experiment-kiezen");

  if (heeftAfspraken) {
    acties.push({ actie: "de afspraken van vandaag rondsturen met eigenaar en datum", eigenaar: "de organisator van de dag", termijn: "binnen twee werkdagen" });
  }
  if (heeftExperiment) {
    acties.push({ actie: "het gekozen experiment starten en het team eraan herinneren", eigenaar: "één teamlid dat zich hiervoor meldt", termijn: "vanaf de eerstvolgende werkdag" });
  }
  acties.push({ actie: "het evaluatiemoment in ieders agenda zetten", eigenaar: "de organisator van de dag", termijn: "nog tijdens de teamdag" });

  return {
    tekst: voorstel.tekst,
    evaluatie: voorstel.evaluatie,
    acties: acties.slice(0, opvolging.maxActies),
    maxExperimenten: opvolging.maxExperimenten,
    pulsemeting: PULSEMETING,
  };
}

/** Advies over of een teamdag hier passend lijkt. */
function advies(antwoorden, oordeel, sporenIds) {
  const hoofdspoor = spoor(sporenIds[0]);
  const tijd = optie(TIJDSOPTIES, antwoorden.tijd);
  const regels = [];

  if (hoofdspoor) regels.push(hoofdspoor.advies);

  if (oordeel.route === "intake") {
    regels.push(ADVIESTEKSTEN.twijfel);
  } else if (oordeel.ruimte <= 2) {
    regels.push(ADVIESTEKSTEN.passendMits);
  } else {
    regels.push(ADVIESTEKSTEN.passend);
  }

  if (tijd && tijd.minuten <= 120) regels.push(ADVIESTEKSTEN.kort);

  return regels;
}

/** De beoogde opbrengst: één primaire en eventueel één secundaire. */
function opbrengst(antwoorden) {
  const gekozen = (antwoorden.resultaten || []).map((rid) => optie(RESULTATEN, rid)).filter(Boolean);
  return {
    primair: gekozen[0] ? gekozen[0].label : null,
    secundair: gekozen[1] ? gekozen[1].label : null,
  };
}

/** Feitelijke samenvatting van de gemaakte keuzes. */
function uitgangssituatie(antwoorden) {
  const noem = (lijst, id) => {
    const o = optie(lijst, id);
    return o ? o.label : null;
  };
  return {
    rol: noem(ROLLEN, antwoorden.rol),
    rolAandachtspunt: (optie(ROLLEN, antwoorden.rol) || {}).aandachtspunt || null,
    teamgrootte: noem(TEAMGROOTTES, antwoorden.teamgrootte),
    teamtype: noem(TEAMTYPES, antwoorden.teamtype),
    bestaansduur: noem(BESTAANSDUUR, antwoorden.bestaansduur),
    afhankelijkheid: noem(AFHANKELIJKHEID, antwoorden.afhankelijkheid),
    aanleidingen: (antwoorden.aanleidingen || []).map((a) => noem(AANLEIDINGEN, a)).filter(Boolean),
    resultaten: (antwoorden.resultaten || []).map((r) => noem(RESULTATEN, r)).filter(Boolean),
    tijd: noem(TIJDSOPTIES, antwoorden.tijd),
    setting: noem(SETTINGS, antwoorden.setting),
    opvolging: noem(OPVOLGING, antwoorden.opvolging),
    zichtbaar: antwoorden.zichtbaar || null,
    toelichting: antwoorden.toelichting || "",
    zichtbaarEigen: antwoorden.zichtbaarEigen || "",
  };
}

/**
 * Stelt het volledige programma samen.
 *
 * `overschrijving` maakt het mogelijk om na het aanpassen door de gebruiker
 * opnieuw te bouwen met een eigen lijst blok-ids en eigen duren.
 */
export function steltProgrammaSamen(antwoorden = {}, overschrijving = null) {
  const oordeel = beoordeelVeiligheid(antwoorden.veiligheid || {});
  const sporenIds = bepaalSporen(antwoorden);
  const tijdOptie = optie(TIJDSOPTIES, antwoorden.tijd) || TIJDSOPTIES[3];
  const minBuffer = tijdOptie.buffer;

  const maxInhoud = maxInhoudelijkeBlokken(tijdOptie.minuten);

  const inhoud = overschrijving && overschrijving.blokIds
    ? overschrijving.blokIds.map((id) => blok(id)).filter(Boolean).filter((b) => !KADER_IDS.includes(b.id) && b.fase !== "landen" && b.fase !== "afsluiting" && b.fase !== "pauze")
    : kiesInhoudelijkeBlokken(antwoorden, oordeel.ruimte, maxInhoud);

  const kader = kaderVoor(antwoorden, oordeel.ruimte, inhoud.length);

  const rij = [
    ...kader.voor.map((k) => ({ blok: blok(k.id), vast: k.vast })),
    ...inhoud.map((b) => ({ blok: b, vast: false })),
    ...kader.na.map((k) => ({ blok: blok(k.id), vast: k.vast })),
  ]
    .filter((o) => o.blok)
    .map((o) => {
      const eigen = overschrijving && overschrijving.duren && overschrijving.duren[o.blok.id];
      return {
        ...o,
        duur: eigen ? afronden(eigen) : o.blok.duur,
        vastgezet: Boolean(eigen),
      };
    });

  const metPauze = metPauzes(rij, antwoorden, (overschrijving && overschrijving.duren) || {});
  // Heeft de gebruiker zelf duren aangepast, dan blijven de onderdelen staan
  // zoals hij ze zette en groeit de vrijgekomen tijd aan de buffer.
  const eigenDuren = Boolean(overschrijving && overschrijving.duren && Object.keys(overschrijving.duren).length);
  const aangepast = pasDurenAan(metPauze, tijdOptie.minuten, minBuffer, !eigenDuren);
  const onderdelen = zetTijden(aangepast.onderdelen, antwoorden.startTijd || "09:00");

  return {
    versie: 1,
    oordeel,
    sporen: sporenIds,
    hoofdthema: spoor(sporenIds[0]) ? spoor(sporenIds[0]).titel : null,
    uitgangssituatie: uitgangssituatie(antwoorden),
    advies: advies(antwoorden, oordeel, sporenIds),
    opbrengst: opbrengst(antwoorden),
    voorbereiding: voorbereiding(antwoorden, onderdelen),
    onderdelen,
    totaal: totaleDuur(onderdelen),
    beschikbaar: tijdOptie.minuten,
    buffer: aangepast.buffer,
    minBuffer,
    past: aangepast.past,
    verwijderd: aangepast.verwijderd.map((o) => o.blok.titel),
    aandachtspunten: aandachtspunten(antwoorden, oordeel, sporenIds, aangepast.buffer, minBuffer),
    borging: borging(antwoorden, onderdelen),
    vraagtBegeleiding:
      oordeel.route === "intake" ||
      onderdelen.some((o) => o.blok.vraagtBegeleiding) ||
      sporenIds.some((sid) => (spoor(sid) || {}).vraagtBegeleiding),
  };
}

/**
 * Controleert of een aangepast programma nog voldoet aan de vaste regels.
 * Geeft een lijst met bezwaren; een lege lijst betekent dat de aanpassing mag.
 */
export function controleerAanpassing(programma, antwoorden = {}) {
  const bezwaren = [];
  if (!programma) return ["Er is geen programma om te controleren."];

  const ids = programma.onderdelen.map((o) => o.blok.id);

  if (programma.buffer < 0) bezwaren.push("Het programma past niet meer binnen de beschikbare tijd.");
  if (programma.buffer < programma.minBuffer) {
    bezwaren.push(`Er blijft te weinig ruimte over. Houd minimaal ${programma.minBuffer} minuten buffer aan.`);
  }
  if (!ids.includes("kb-welkom-en-doel")) bezwaren.push("Een programma zonder opening werkt niet: begin met welkom en doel.");
  if (!ids.includes("kb-check-uit")) bezwaren.push("Een programma zonder afsluiting laat de opbrengst los hangen.");
  if (!ids.some((id) => id === "kb-afspraken-vastleggen" || id === "kb-experiment-kiezen")) {
    bezwaren.push("Er staat niets in over borging. Voeg afspraken of een klein experiment toe.");
  }

  const ruimte = (programma.oordeel || {}).ruimte ?? 3;
  const onveilig = programma.onderdelen.filter((o) => o.blok.veiligheidMin > ruimte);
  onveilig.forEach((o) => {
    bezwaren.push(`${o.blok.titel} vraagt meer veiligheid dan er volgens jouw antwoorden nu is.`);
  });

  const buitenGroep = programma.onderdelen.filter((o) => !isToegestaan(o.blok, antwoorden, ruimte));
  buitenGroep.forEach((o) => {
    if (onveilig.includes(o)) return;
    bezwaren.push(`${o.blok.titel} past niet bij de gekozen groepsgrootte, setting of ervaring.`);
  });

  // Niet meer dan drie hoofdthema's in één dag. Kaderblokken tellen niet mee:
  // die dragen geen eigen thema maar dragen het programma.
  const hoofdthemas = new Set(
    programma.onderdelen
      .filter((o) => !KADER_IDS.includes(o.blok.id))
      .flatMap((o) => (o.blok.doelen || []).slice(0, 1)),
  );
  if (hoofdthemas.size > 3) {
    bezwaren.push("Er zitten meer dan drie hoofdthema's in dit programma. Kies er hooguit drie.");
  }

  return bezwaren;
}

export { alternatievenVoor };
