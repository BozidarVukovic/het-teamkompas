// Tests van de teamdag-generator: beslisregels, veiligheidsroute,
// tijdsberekening, aanpassen en de deelbare link.

import test from "node:test";
import assert from "node:assert/strict";

import {
  STAPPEN,
  VRAGEN,
  vraagBeantwoord,
  AANLEIDINGEN,
  RESULTATEN,
  TEAMGROOTTES,
  TIJDSOPTIES,
  VEILIGHEIDSVRAGEN,
  MAX_AANLEIDINGEN,
  MAX_RESULTATEN,
} from "../src/data/teamdag/vragen.js";
import { BLOKKEN, KADER_IDS, blok } from "../src/data/teamdag/blokken.js";
import { SPOREN } from "../src/data/teamdag/sporen.js";
import { TAALREGELS_NIET } from "../src/data/teamdag/teksten.js";
import { beoordeelVeiligheid, magProgrammaTonen, veiligheidCompleet } from "../src/lib/teamdag/veiligheid.js";
import { bepaalSporen, kiesInhoudelijkeBlokken, alternatievenVoor, pastBijGroep } from "../src/lib/teamdag/selectie.js";
import { pasDurenAan, zetTijden, klok, naarMinuten, duurLabel } from "../src/lib/teamdag/tijd.js";
import { steltProgrammaSamen, controleerAanpassing, maxInhoudelijkeBlokken } from "../src/lib/teamdag/programma.js";
import { naarQuery, uitQuery, deelbareUrl } from "../src/lib/teamdag/deelbaar.js";
import { isLeeg } from "../src/lib/teamdag/opslag.js";

const veiligAlles = (waarde) => Object.fromEntries(VEILIGHEIDSVRAGEN.map((v) => [v.id, waarde]));

const VEILIG = {
  ...veiligAlles("nee"),
  "vrij-spreken": "ja",
  "afspraken-vertrouwen": "ja",
};

const BASIS = {
  rol: "teamleider",
  teamgrootte: "7-12",
  teamtype: "operationeel",
  bestaansduur: "lang",
  afhankelijkheid: "dagelijks",
  aanleidingen: ["samenwerking-vast"],
  resultaten: ["begrijpen"],
  veiligheid: VEILIG,
  tijd: "dagdeel-4",
  pauze: "ja",
  setting: "fysiek",
  ruimte: "ja",
  aanwezigheid: "iedereen",
  werkwijzen: ["geen"],
  ervaring: "enige",
  opvolging: "dertig-dagen",
};

const met = (extra) => ({ ...BASIS, ...extra });

// --- Structuur van de vragenlijst ---

test("de beslisboom heeft acht genummerde fasen", () => {
  assert.equal(STAPPEN.length, 8);
  STAPPEN.forEach((s, i) => assert.equal(s.nummer, i + 1));
});

test("iedere vraag staat op een eigen scherm en hoort bij een bestaande fase", () => {
  const fasen = new Set(STAPPEN.map((s) => s.id));
  const ids = new Set();
  VRAGEN.forEach((v) => {
    assert.ok(!ids.has(v.id), `dubbele vraag-id: ${v.id}`);
    ids.add(v.id);
    assert.ok(fasen.has(v.fase), `${v.id}: onbekende fase ${v.fase}`);
    assert.ok(v.kop && v.kop.length > 8, `${v.id}: geen bruikbare vraagtekst`);
    assert.ok(["enkel", "meer", "tekst"].includes(v.type), `${v.id}: onbekend type`);
    if (v.type !== "tekst") {
      assert.ok(Array.isArray(v.opties) && v.opties.length >= 2, `${v.id}: te weinig antwoordopties`);
    }
  });
});

test("de vragen volgen de fasen in volgorde", () => {
  const volgorde = STAPPEN.map((s) => s.id);
  const posities = VRAGEN.map((v) => volgorde.indexOf(v.fase));
  for (let i = 1; i < posities.length; i += 1) {
    assert.ok(posities[i] >= posities[i - 1], "de fasen lopen terug in de vragenlijst");
  }
});

test("iedere fase heeft minstens één vraag", () => {
  STAPPEN.forEach((s) => {
    assert.ok(VRAGEN.some((v) => v.fase === s.id), `fase ${s.id} heeft geen vragen`);
  });
});

test("de vragen dekken alle velden die de programmalogica gebruikt", () => {
  const gedekt = new Set(VRAGEN.filter((v) => !v.groep).map((v) => v.veld));
  ["rol", "teamgrootte", "teamtype", "bestaansduur", "afhankelijkheid", "aanleidingen",
   "resultaten", "tijd", "pauze", "setting", "ruimte", "aanwezigheid", "werkwijzen",
   "ervaring", "opvolging"].forEach((veld) => {
    assert.ok(gedekt.has(veld), `veld ${veld} wordt nergens gevraagd`);
  });
  const veiligheidsvelden = new Set(VRAGEN.filter((v) => v.groep === "veiligheid").map((v) => v.veld));
  VEILIGHEIDSVRAGEN.forEach((v) => {
    assert.ok(veiligheidsvelden.has(v.id), `veiligheidsvraag ${v.id} wordt niet gesteld`);
  });
});

test("een optionele vraag mag worden overgeslagen, een verplichte niet", () => {
  const optioneel = VRAGEN.find((v) => v.optioneel);
  const verplicht = VRAGEN.find((v) => !v.optioneel && v.type === "enkel");
  assert.ok(optioneel && verplicht);
  assert.equal(vraagBeantwoord(optioneel, {}), true);
  assert.equal(vraagBeantwoord(verplicht, {}), false);
  assert.equal(vraagBeantwoord(verplicht, { [verplicht.veld]: verplicht.opties[0].id }), true);
});

test("een meerkeuzevraag is pas beantwoord met minstens één keuze", () => {
  const meer = VRAGEN.find((v) => v.type === "meer" && !v.optioneel);
  assert.equal(vraagBeantwoord(meer, { [meer.veld]: [] }), false);
  assert.equal(vraagBeantwoord(meer, { [meer.veld]: [meer.opties[0].id] }), true);
});

test("een veiligheidsvraag leest het antwoord uit het juiste subobject", () => {
  const v = VRAGEN.find((q) => q.groep === "veiligheid");
  assert.equal(vraagBeantwoord(v, {}), false);
  assert.equal(vraagBeantwoord(v, { veiligheid: { [v.veld]: "ja" } }), true);
});

test("maximaal drie aanleidingen en twee resultaten", () => {
  assert.equal(MAX_AANLEIDINGEN, 3);
  assert.equal(MAX_RESULTATEN, 2);
});

test("iedere aanleiding en ieder resultaat wijst naar een bestaand spoor", () => {
  const ids = new Set(SPOREN.map((s) => s.id));
  AANLEIDINGEN.forEach((a) => assert.ok(ids.has(a.spoor), `${a.id} → ${a.spoor}`));
  RESULTATEN.forEach((r) => assert.ok(ids.has(r.spoor), `${r.id} → ${r.spoor}`));
});

// --- Veiligheid ---

test("veiligheidscheck is pas compleet als alle vragen beantwoord zijn", () => {
  assert.equal(veiligheidCompleet({}), false);
  assert.equal(veiligheidCompleet(VEILIG), true);
});

test("signalen van onveilig gedrag leiden tot de intakeroute", () => {
  const o = beoordeelVeiligheid({ ...VEILIG, "onveilig-gedrag": "ja" });
  assert.equal(o.route, "intake");
  assert.equal(o.ruimte, 1);
});

test("ook een gedeeltelijk signaal leidt tot de intakeroute", () => {
  const o = beoordeelVeiligheid({ ...VEILIG, "onveilig-gedrag": "gedeeltelijk" });
  assert.equal(o.route, "intake");
});

test("een openlijk conflict leidt tot de intakeroute", () => {
  assert.equal(beoordeelVeiligheid({ ...VEILIG, conflict: "ja" }).route, "intake");
});

test("niet vrij kunnen spreken leidt tot de intakeroute", () => {
  assert.equal(beoordeelVeiligheid({ ...VEILIG, "vrij-spreken": "nee" }).route, "intake");
});

test("een leidinggevende als partij is alleen met conflict een intakereden", () => {
  const alleen = beoordeelVeiligheid({ ...VEILIG, leidinggevende: "ja" });
  assert.equal(alleen.route, "regulier");
  assert.equal(alleen.leidinggevendePartij, true);
  assert.ok(alleen.aandachtspunten.includes("leidinggevendeSpanning"));

  const samen = beoordeelVeiligheid({ ...VEILIG, leidinggevende: "ja", conflict: "ja" });
  assert.equal(samen.route, "intake");
});

test("een veilige situatie geeft de reguliere route en volledige ruimte", () => {
  const o = beoordeelVeiligheid(VEILIG);
  assert.equal(o.route, "regulier");
  assert.equal(o.ruimte, 3);
  assert.deepEqual(o.redenen, []);
});

test("de website toont bij de intakeroute geen programma zonder eigen keuze", () => {
  const o = beoordeelVeiligheid({ ...VEILIG, "onveilig-gedrag": "ja" });
  assert.equal(magProgrammaTonen(o, false), false);
  assert.equal(magProgrammaTonen(o, true), true);
});

test("bij lage veiligheidsruimte komt er geen confronterende werkvorm in het programma", () => {
  const p = steltProgrammaSamen(met({ veiligheid: { ...VEILIG, "onveilig-gedrag": "ja", "vrij-spreken": "nee" } }));
  p.onderdelen.forEach((o) => assert.ok(o.blok.veiligheidMin <= p.oordeel.ruimte, o.blok.id));
});

// --- Tijdsberekening ---

test("het programma past exact binnen de gekozen tijd", () => {
  TIJDSOPTIES.forEach((t) => {
    const p = steltProgrammaSamen(met({ tijd: t.id }));
    assert.equal(p.totaal + p.buffer, t.minuten, t.id);
  });
});

test("er blijft altijd minimaal de vereiste buffer over", () => {
  TIJDSOPTIES.forEach((t) => {
    const p = steltProgrammaSamen(met({ tijd: t.id }));
    assert.ok(p.buffer >= t.buffer, `${t.id}: buffer ${p.buffer}`);
  });
});

test("een volledige dag houdt minimaal twintig minuten buffer", () => {
  const p = steltProgrammaSamen(met({ tijd: "dag-6" }));
  assert.ok(p.buffer >= 20);
});

test("begintijden sluiten naadloos op elkaar aan", () => {
  const p = steltProgrammaSamen(met({ tijd: "dagdeel-4" }));
  for (let i = 1; i < p.onderdelen.length; i += 1) {
    assert.equal(p.onderdelen[i].start, p.onderdelen[i - 1].eind);
  }
});

test("inkorten gaat nooit onder het minimum van een onderdeel", () => {
  const lijst = [
    { blok: blok("kb-welkom-en-doel"), duur: 25, vast: true },
    { blok: blok("ob-orid"), duur: 60, vast: false },
    { blok: blok("kb-check-uit"), duur: 25, vast: true },
  ];
  const r = pasDurenAan(lijst, 90, 10);
  r.onderdelen.forEach((o) => assert.ok(o.duur >= o.blok.minDuur, o.blok.id));
});

test("klok en naarMinuten zijn elkaars omgekeerde", () => {
  assert.equal(klok(9 * 60 + 30), "09:30");
  assert.equal(naarMinuten("09:30"), 570);
  assert.equal(klok(naarMinuten("13:45")), "13:45");
});

test("duurLabel schrijft uren en minuten voluit", () => {
  assert.equal(duurLabel(90), "1 uur en 30 minuten");
  assert.equal(duurLabel(120), "2 uur");
  assert.equal(duurLabel(45), "45 minuten");
});

// --- Programmaopbouw ---

test("ieder programma heeft een opening, een afsluiting en borging", () => {
  SPOREN.forEach((s) => {
    const aanleiding = AANLEIDINGEN.find((a) => a.spoor === s.id);
    const p = steltProgrammaSamen(met({ aanleidingen: aanleiding ? [aanleiding.id] : [], resultaten: [] }));
    const ids = p.onderdelen.map((o) => o.blok.id);
    assert.equal(ids[0], "kb-welkom-en-doel", s.id);
    assert.equal(ids[ids.length - 1], "kb-check-uit", s.id);
    assert.ok(ids.includes("kb-afspraken-vastleggen") || ids.includes("kb-experiment-kiezen"), s.id);
  });
});

test("de fasen staan in de logische volgorde", () => {
  const volgorde = ["landen", "ophalen", "betekenis", "verdieping", "keuzes", "gedrag", "afsluiting"];
  const p = steltProgrammaSamen(met({ tijd: "dag-6" }));
  const posities = p.onderdelen.filter((o) => !o.pauze).map((o) => volgorde.indexOf(o.blok.fase));
  for (let i = 1; i < posities.length; i += 1) {
    assert.ok(posities[i] >= posities[i - 1], "fasen lopen niet terug");
  }
});

test("geen enkel onderdeel komt twee keer voor", () => {
  TIJDSOPTIES.forEach((t) => {
    const p = steltProgrammaSamen(met({ tijd: t.id }));
    const ids = p.onderdelen.filter((o) => !o.pauze).map((o) => o.blok.id);
    assert.equal(new Set(ids).size, ids.length, t.id);
  });
});

test("er zitten nooit meer dan drie hoofdthema's in een programma", () => {
  const p = steltProgrammaSamen(met({ tijd: "dag-7", aanleidingen: ["samenwerking-vast", "veel-overleg", "werkdruk"], resultaten: ["begrijpen", "besluiten"] }));
  const themas = new Set(
    p.onderdelen.filter((o) => !KADER_IDS.includes(o.blok.id)).flatMap((o) => (o.blok.doelen || []).slice(0, 1)),
  );
  assert.ok(themas.size <= 3, `${themas.size} thema's`);
});

test("maximaal drie inhoudelijke onderdelen, ook op een volledige dag", () => {
  assert.equal(maxInhoudelijkeBlokken(90), 1);
  assert.equal(maxInhoudelijkeBlokken(120), 2);
  assert.equal(maxInhoudelijkeBlokken(420), 3);
});

test("het primaire resultaat weegt zwaarder dan de aanleiding", () => {
  const sporen = bepaalSporen({ aanleidingen: ["werkdruk"], resultaten: ["rollen"] });
  assert.equal(sporen[0], "rolhelderheid");
  assert.ok(sporen.includes("energie"));
});

test("het gekozen resultaat komt terug in het programma", () => {
  const p = steltProgrammaSamen(met({ aanleidingen: ["rollen-onduidelijk"], resultaten: ["rollen"] }));
  const doelen = p.onderdelen.flatMap((o) => o.blok.doelen || []);
  assert.ok(doelen.includes("rollen"));
});

test("werkvormen passen bij de gekozen groepsgrootte", () => {
  TEAMGROOTTES.forEach((g) => {
    const p = steltProgrammaSamen(met({ teamgrootte: g.id }));
    const maat = g.representatief || g.max;
    p.onderdelen.forEach((o) => {
      assert.ok(o.blok.minGroep <= maat && o.blok.maxGroep >= maat, `${g.id}: ${o.blok.id}`);
    });
  });
});

test("een groot team krijgt de check-in in tweetallen", () => {
  const p = steltProgrammaSamen(met({ teamgrootte: "20plus" }));
  const ids = p.onderdelen.map((o) => o.blok.id);
  assert.ok(ids.includes("kb-inchecken-groot"));
  assert.ok(!ids.includes("kb-inchecken-kort"));
});

test("online levert geen lunch en geen werkvorm die alleen fysiek kan", () => {
  const p = steltProgrammaSamen(met({ tijd: "dag-7", setting: "online" }));
  p.onderdelen.forEach((o) => assert.ok(o.blok.settings.includes("online"), o.blok.id));
});

test("weinig ervaring levert alleen laagdrempelige werkvormen", () => {
  const p = steltProgrammaSamen(met({ ervaring: "weinig" }));
  p.onderdelen.forEach((o) => assert.equal(o.blok.niveau, 1, o.blok.id));
});

test("zonder opvolging blijft het bij één actie en een experiment", () => {
  const p = steltProgrammaSamen(met({ opvolging: "geen" }));
  assert.ok(p.borging.acties.length <= 1);
  assert.equal(p.borging.maxExperimenten, 1);
  assert.ok(p.onderdelen.some((o) => o.blok.id === "kb-experiment-kiezen"));
});

test("er staan nooit meer dan drie vervolgacties en vijf aandachtspunten", () => {
  const p = steltProgrammaSamen(met({ setting: "hybride", aanwezigheid: "wisselend", ervaring: "weinig", resultaten: ["begrijpen", "afspraken"] }));
  assert.ok(p.borging.acties.length <= 3);
  assert.ok(p.aandachtspunten.length <= 5);
});

test("lage onderlinge afhankelijkheid levert de vraag op waarvoor je een team bent", () => {
  const p = steltProgrammaSamen(met({ afhankelijkheid: "onduidelijk" }));
  const ids = p.onderdelen.map((o) => o.blok.id);
  assert.ok(ids.includes("rb-wel-en-niet-team"));
  assert.ok(p.aandachtspunten.some((a) => a.includes("niet dagelijks nodig")));
});

test("dezelfde antwoorden leveren altijd hetzelfde programma op", () => {
  const a = steltProgrammaSamen(met({}));
  const b = steltProgrammaSamen(met({}));
  assert.deepEqual(
    a.onderdelen.map((o) => [o.blok.id, o.duur, o.start]),
    b.onderdelen.map((o) => [o.blok.id, o.duur, o.start]),
  );
});

// --- Aanpassen ---

test("een geldig programma geeft geen bezwaren", () => {
  const p = steltProgrammaSamen(met({}));
  assert.deepEqual(controleerAanpassing(p, met({})), []);
});

test("een programma zonder afsluiting wordt afgekeurd", () => {
  const p = steltProgrammaSamen(met({}));
  const zonder = { ...p, onderdelen: p.onderdelen.filter((o) => o.blok.id !== "kb-check-uit") };
  assert.ok(controleerAanpassing(zonder, met({})).some((b) => b.includes("afsluiting")));
});

test("een programma zonder borging wordt afgekeurd", () => {
  const p = steltProgrammaSamen(met({}));
  const zonder = {
    ...p,
    onderdelen: p.onderdelen.filter((o) => o.blok.id !== "kb-afspraken-vastleggen" && o.blok.id !== "kb-experiment-kiezen"),
  };
  assert.ok(controleerAanpassing(zonder, met({})).some((b) => b.includes("borging")));
});

test("een negatieve resterende tijd wordt afgekeurd", () => {
  const p = steltProgrammaSamen(met({}));
  assert.ok(controleerAanpassing({ ...p, buffer: -5 }, met({})).length > 0);
});

test("een onveilige werkvorm in een aangepast programma wordt afgekeurd", () => {
  const antwoorden = met({ veiligheid: { ...VEILIG, "vrij-spreken": "nee" } });
  const p = steltProgrammaSamen(antwoorden);
  const gewijzigd = {
    ...p,
    onderdelen: [...p.onderdelen, { blok: blok("ob-spanning-op-tafel"), duur: 60, vast: false }],
  };
  assert.ok(controleerAanpassing(gewijzigd, antwoorden).some((b) => b.includes("veiligheid")));
});

test("alternatieven zitten in dezelfde fase en zijn toegestaan", () => {
  const antwoorden = met({});
  const p = steltProgrammaSamen(antwoorden);
  const inhoud = p.onderdelen.find((o) => !KADER_IDS.includes(o.blok.id) && !o.pauze);
  assert.ok(inhoud, "er is een inhoudelijk onderdeel");
  const alternatieven = alternatievenVoor(inhoud.blok.id, antwoorden, 3, [inhoud.blok.id]);
  alternatieven.forEach((a) => {
    assert.equal(a.fase, inhoud.blok.fase);
    assert.ok(!KADER_IDS.includes(a.id));
    assert.ok(pastBijGroep(a, antwoorden.teamgrootte));
  });
});

test("een vervangen onderdeel levert opnieuw een kloppend programma", () => {
  const antwoorden = met({});
  const p = steltProgrammaSamen(antwoorden);
  const inhoud = p.onderdelen.filter((o) => !KADER_IDS.includes(o.blok.id) && !o.pauze).map((o) => o.blok.id);
  const alternatieven = alternatievenVoor(inhoud[0], antwoorden, 3, inhoud);
  if (!alternatieven.length) return;
  const nieuw = steltProgrammaSamen(antwoorden, {
    blokIds: inhoud.map((id, i) => (i === 0 ? alternatieven[0].id : id)),
    duren: {},
  });
  assert.equal(nieuw.totaal + nieuw.buffer, nieuw.beschikbaar);
  assert.deepEqual(controleerAanpassing(nieuw, antwoorden), []);
});

// --- Deelbare link ---

test("de deelbare link bevat geen vrije tekst", () => {
  const antwoorden = met({ toelichting: "Piet en Marieke botsen sinds maart", zichtbaarEigen: "Iets met Jan" });
  const query = naarQuery(antwoorden);
  assert.ok(!query.toLowerCase().includes("piet"));
  assert.ok(!query.toLowerCase().includes("marieke"));
  assert.ok(!query.toLowerCase().includes("jan"));
  assert.ok(!query.toLowerCase().includes("botsen"));
});

test("de deelbare link is terug te lezen", () => {
  const antwoorden = met({ aanleidingen: ["veel-overleg", "werkdruk"], resultaten: ["besluiten"] });
  const terug = uitQuery(naarQuery(antwoorden));
  assert.equal(terug.rol, antwoorden.rol);
  assert.deepEqual(terug.aanleidingen, antwoorden.aanleidingen);
  assert.deepEqual(terug.resultaten, antwoorden.resultaten);
  assert.equal(terug.tijd, antwoorden.tijd);
  assert.deepEqual(terug.veiligheid, antwoorden.veiligheid);
});

test("onbekende waarden in een link worden genegeerd", () => {
  const terug = uitQuery("r=hacker&u=eeuwig&a=onzin");
  assert.equal(terug.rol, undefined);
  assert.equal(terug.tijd, undefined);
  assert.equal(terug.aanleidingen, undefined);
});

test("de deelbare url wijst naar de generator", () => {
  assert.ok(deelbareUrl(met({})).startsWith("https://www.mijnteamkompas.nl/teamdag-generator?"));
});

// --- Opslag ---

test("een lege staat wordt herkend en overschrijft niets", () => {
  assert.equal(isLeeg({ rol: "", aanleidingen: [], veiligheid: {} }), true);
  assert.equal(isLeeg({ rol: "teamleider", aanleidingen: [], veiligheid: {} }), false);
});

// --- Taal en inhoud ---

test("geen enkel blok gebruikt een verboden formulering", () => {
  const teksten = BLOKKEN.flatMap((b) => [b.doel, b.begeleider, b.valkuilen, b.opbrengst, ...(b.stappen || []).map((s) => s.tekst)]);
  teksten.filter(Boolean).forEach((tekst) => {
    TAALREGELS_NIET.forEach((verboden) => {
      assert.ok(!tekst.toLowerCase().includes(verboden.toLowerCase()), `"${verboden}" in "${tekst.slice(0, 50)}"`);
    });
  });
});

test("ieder blok heeft een instructie, een valkuil en een opbrengst", () => {
  BLOKKEN.forEach((b) => {
    assert.ok(Array.isArray(b.stappen) && b.stappen.length > 0, b.id);
    assert.ok(b.valkuilen && b.valkuilen.length > 10, b.id);
    assert.ok(b.opbrengst && b.opbrengst.length > 10, b.id);
    assert.ok(b.begeleider && b.begeleider.length > 10, b.id);
  });
});

test("ieder spoor heeft aandachtspunten en een advies", () => {
  SPOREN.forEach((s) => {
    assert.ok(s.advies.length > 30, s.id);
    assert.ok((s.aandachtspunten || []).length >= 2, s.id);
  });
});

test("de selectie kiest nooit een kaderblok als inhoudelijk onderdeel", () => {
  const gekozen = kiesInhoudelijkeBlokken(met({}), 3, 3);
  gekozen.forEach((b) => assert.ok(!KADER_IDS.includes(b.id), b.id));
});

test("zetTijden geeft ieder onderdeel een eigen sleutel", () => {
  const p = steltProgrammaSamen(met({ tijd: "dag-6" }));
  const sleutels = p.onderdelen.map((o) => o.sleutel);
  assert.equal(new Set(sleutels).size, sleutels.length);
});
