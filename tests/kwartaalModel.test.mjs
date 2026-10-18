// De vorm van wat er wordt opgeslagen.
//
// Deze tests bewaken vooral de grenzen: wat er níét in mag, wat er níét
// bestaat, en waar "concept" ophoudt privé te zijn als je niet oplet.

import test from "node:test";
import assert from "node:assert/strict";

import {
  STATUSSEN,
  geldigKwartaal,
  huidigKwartaal,
  isGedeeld,
  kwartaalPeriode,
  kwartaalPlus,
  lijktOpActiviteit,
  maakGeschiedenisregel,
  magNaarStatus,
  schoonBesluit,
  schoonBijdrage,
  schoonDoel,
  schoonRuimte,
  schoonVerzoek,
  volgendeStatussen,
  vraagtOpnieuwAfstemming,
} from "../src/lib/app/kwartaal/model.js";

/* ------------------------------------------------------------ kwartalen */

test("een kwartaal is een jaar en een cijfer van 1 tot 4", () => {
  assert.ok(geldigKwartaal("2027-K1"));
  assert.ok(geldigKwartaal("2027-K4"));
  ["2027-K0", "2027-K5", "2027-Q1", "2027", "", null].forEach((s) => {
    assert.equal(geldigKwartaal(s), false, `${JSON.stringify(s)} hoort ongeldig te zijn`);
  });
});

test("een kwartaal loopt van de week van zijn eerste dag tot die van zijn laatste", () => {
  // 1 januari 2027 is een vrijdag en valt nog in 2026-W53.
  assert.deepEqual(kwartaalPeriode("2027-K1"), { van: "2026-W53", tot: "2027-W13" });
  assert.deepEqual(kwartaalPeriode("2027-K4"), { van: "2027-W39", tot: "2027-W52" });
  assert.equal(kwartaalPeriode("onzin"), null);
});

test("het volgende kwartaal rolt netjes over het jaar", () => {
  assert.equal(kwartaalPlus("2027-K4", 1), "2028-K1");
  assert.equal(kwartaalPlus("2027-K1", -1), "2026-K4");
  assert.equal(kwartaalPlus("2027-K1", 0), "2027-K1");
});

test("het huidige kwartaal volgt uit de datum", () => {
  assert.equal(huidigKwartaal(new Date("2026-10-18T00:00:00Z")), "2026-K4");
  assert.equal(huidigKwartaal(new Date("2027-03-31T00:00:00Z")), "2027-K1");
});

/* ------------------------------------------------------------ levensloop */

test("een concept is niet gedeeld, al het andere wel", () => {
  assert.equal(isGedeeld("concept"), false);
  STATUSSEN.filter((s) => s !== "concept").forEach((s) => assert.ok(isGedeeld(s), `${s} hoort gedeeld te zijn`));
  assert.equal(isGedeeld("verzonnen"), false, "wat de app niet kent, is niet gedeeld");
});

test("gedeeld wordt afgeleid en is niet los in te vullen", () => {
  // Anders kan er een concept bestaan dat gedeeld staat, en dat is precies
  // het lek dat de regels moeten dichthouden.
  const uit = schoonDoel({ ...DOEL, status: "concept", gedeeld: true });
  assert.equal(uit.waarde.gedeeld, false);
});

test("van concept naar afgesproken ga je niet in één stap", () => {
  assert.equal(magNaarStatus("concept", "ter-afstemming"), true);
  assert.equal(magNaarStatus("concept", "afgesproken"), false, "delen is niet hetzelfde als afspreken");
  assert.equal(magNaarStatus("ter-afstemming", "afgesproken"), true);
});

test("een afgerond doel gaat nergens meer heen", () => {
  assert.deepEqual(volgendeStatussen("afgerond"), []);
  assert.deepEqual(volgendeStatussen("onbekend"), []);
});

test("een afgesproken doel dat verandert, vraagt opnieuw afstemming", () => {
  const oud = { status: "afgesproken", succes: "A", gewenstTot: "2027-W10" };
  assert.ok(vraagtOpnieuwAfstemming(oud, { succes: "B" }));
  assert.ok(vraagtOpnieuwAfstemming(oud, { gewenstTot: "2027-W20" }));
  assert.equal(vraagtOpnieuwAfstemming(oud, { stand: "dit loopt" }), false, "een stand van zaken is geen nieuwe afspraak");
  assert.equal(vraagtOpnieuwAfstemming({ ...oud, status: "concept" }, { succes: "B" }), false);
});

/* ------------------------------------------------- resultaat of activiteit */

test("een activiteit krijgt een duwtje, geen slot", () => {
  const hint = lijktOpActiviteit("Een workshop organiseren");
  assert.ok(hint);
  assert.equal(hint.woord, "organiseren");
  assert.match(hint.vraag, /opleveren/);
  // En het doel mag gewoon zo worden opgeslagen.
  assert.equal(schoonDoel({ ...DOEL, titel: "Een workshop organiseren" }).ok, true);
});

test("een resultaat krijgt geen duwtje", () => {
  assert.equal(lijktOpActiviteit("Een bruikbare werkwijze voor instroom die het team zelf kan draaien"), null);
  assert.equal(lijktOpActiviteit(""), null);
});

/* ----------------------------------------------------------------- doel */

const DOEL = {
  kwartaal: "2027-K1",
  titel: "Een bruikbare werkwijze voor instroom",
  succes: "Geslaagd als een proef is uitgevoerd en het team de vervolgkeuze heeft gemaakt.",
  eigenaarUid: "u1",
  status: "concept",
};

test("een doel heeft een resultaat, een succescriterium en een kwartaal nodig", () => {
  assert.ok(schoonDoel(DOEL).ok);
  assert.equal(schoonDoel({ ...DOEL, titel: "" }).ok, false);
  assert.equal(schoonDoel({ ...DOEL, succes: "   " }).ok, false);
  assert.equal(schoonDoel({ ...DOEL, kwartaal: "later" }).ok, false);
  assert.equal(schoonDoel({ ...DOEL, status: "bezig" }).ok, false);
});

test("een doel heeft geen urenveld en geen voortgangspercentage", () => {
  // Uren zitten in de bijdragen van de mensen die het werk doen. Een
  // urenveld op het doel zou hetzelfde werk twee keer tellen zodra iemand er
  // één van bijwerkt.
  const uit = schoonDoel({ ...DOEL, urenPerWeek: 8, voortgang: 60, score: 3 });
  assert.equal(uit.waarde.urenPerWeek, undefined);
  assert.equal(uit.waarde.voortgang, undefined);
  assert.equal(uit.waarde.score, undefined);
});

test("de stand van zaken is tekst van de eigenaar, geen getal", () => {
  const uit = schoonDoel({ ...DOEL, stand: "hier loop ik vast" });
  assert.equal(uit.waarde.stand, "hier loop ik vast");
});

test("een omgedraaide gewenste periode wordt geweigerd", () => {
  assert.equal(schoonDoel({ ...DOEL, gewenstVan: "2027-W10", gewenstTot: "2027-W02" }).ok, false);
  assert.ok(schoonDoel({ ...DOEL, gewenstVan: "2027-W02", gewenstTot: "2027-W10" }).ok);
});

test("witruimte wordt opgeruimd, niet bewaard", () => {
  const uit = schoonDoel({ ...DOEL, titel: "  Twee   spaties  " });
  assert.equal(uit.waarde.titel, "Twee spaties");
});

/* ------------------------------------------------------------- bijdrage */

const BIJDRAGE = { doelId: "d1", uid: "u1", status: "afgesproken", van: "2027-W02", tot: "2027-W09", urenPerWeek: 3 };

test("een bijdrage heeft een doel, een persoon en een periode", () => {
  assert.ok(schoonBijdrage(BIJDRAGE).ok);
  assert.equal(schoonBijdrage({ ...BIJDRAGE, doelId: "" }).ok, false);
  assert.equal(schoonBijdrage({ ...BIJDRAGE, van: "2027-W09", tot: "2027-W02" }).ok, false);
});

test("onbekende uren mogen, onzin niet", () => {
  assert.equal(schoonBijdrage({ ...BIJDRAGE, urenPerWeek: null }).waarde.urenPerWeek, null);
  assert.equal(schoonBijdrage({ ...BIJDRAGE, urenPerWeek: 0 }).waarde.urenPerWeek, 0, "nul is iets anders dan onbekend");
  [-1, 61, 2.1, "3", NaN].forEach((u) => {
    assert.equal(schoonBijdrage({ ...BIJDRAGE, urenPerWeek: u }).ok, false, `${u} hoort geweigerd te worden`);
  });
  assert.ok(schoonBijdrage({ ...BIJDRAGE, urenPerWeek: 2.25 }).ok, "kwartieren mogen wel");
});

/* --------------------------------------------------------------- ruimte */

test("ruimte is een lijst periodes met uren per week", () => {
  const uit = schoonRuimte({ uid: "u1", kwartaal: "2027-K1", regels: [{ van: "2027-W02", tot: "2027-W09", urenPerWeek: 3 }] });
  assert.ok(uit.ok);
  assert.equal(uit.waarde.regels.length, 1);
});

test("ruimte zonder uren is geen ruimte", () => {
  const uit = schoonRuimte({ uid: "u1", kwartaal: "2027-K1", regels: [{ van: "2027-W02", tot: "2027-W09" }] });
  assert.equal(uit.ok, false);
  assert.match(uit.fouten[0], /uren per week/);
});

test("een lege ruimte is geldig: niets ingevuld is een eerlijk antwoord", () => {
  assert.ok(schoonRuimte({ uid: "u1", kwartaal: "2027-K1", regels: [] }).ok);
});

test("er wordt geen reden voor afwezigheid gevraagd of bewaard", () => {
  const uit = schoonRuimte({
    uid: "u1",
    kwartaal: "2027-K1",
    regels: [{ van: "2027-W02", tot: "2027-W09", urenPerWeek: 0, reden: "ziek" }],
  });
  assert.equal(uit.waarde.regels[0].reden, undefined, "waarom iemand minder ruimte heeft, hoort hier niet");
});

/* -------------------------------------------------------------- verzoek */

const VERZOEK = {
  kwartaal: "2027-K1",
  titel: "Een vraag van een andere afdeling",
  aanvrager: "Afdeling Inkoop",
  waarom: "Hun leverancier stopt per 1 maart.",
  van: "2027-W02",
  tot: "2027-W09",
  bijdragen: [{ uid: "u1", urenPerWeek: 2 }],
};

test("een verzoek zegt wat, van wie, waarom en wanneer", () => {
  assert.ok(schoonVerzoek(VERZOEK).ok);
  ["titel", "aanvrager", "waarom"].forEach((veld) => {
    assert.equal(schoonVerzoek({ ...VERZOEK, [veld]: "" }).ok, false, `${veld} hoort verplicht te zijn`);
  });
});

test("een gevraagde bijdrage noemt een collega of de expertise", () => {
  assert.ok(schoonVerzoek({ ...VERZOEK, bijdragen: [{ expertise: "arbeidsrecht", urenPerWeek: 2 }] }).ok);
  const uit = schoonVerzoek({ ...VERZOEK, bijdragen: [{ urenPerWeek: 2 }] });
  assert.equal(uit.ok, false);
  assert.match(uit.fouten[0], /expertise/);
});

test("een verzoek zonder bijdragen is geen verzoek", () => {
  assert.equal(schoonVerzoek({ ...VERZOEK, bijdragen: [] }).ok, false);
});

/* -------------------------------------------------------------- besluit */

const BESLUIT = {
  verzoekId: "v1",
  optie: "pauzeren",
  afweging: "De evaluatie kan een kwartaal wachten.",
  beslisserUid: "u9",
  mandaat: true,
  wijzigingen: [{ soort: "pauzeren", bijdrageId: "b1" }],
};

test("een besluit legt vast wie besliste en waarom", () => {
  assert.ok(schoonBesluit(BESLUIT).ok);
  assert.equal(schoonBesluit({ ...BESLUIT, afweging: "" }).ok, false);
  assert.equal(schoonBesluit({ ...BESLUIT, beslisserUid: "" }).ok, false);
});

test("zonder bevestigd mandaat wordt er niets vastgelegd", () => {
  const uit = schoonBesluit({ ...BESLUIT, mandaat: false });
  assert.equal(uit.ok, false);
  assert.match(uit.fouten[0], /mag besluiten/);
});

test("een besluit zonder wijzigingen verandert niets en wordt geweigerd", () => {
  assert.equal(schoonBesluit({ ...BESLUIT, wijzigingen: [] }).ok, false);
});

/* --------------------------------------------------------- geschiedenis */

test("een geschiedenisregel zegt wat er veranderde en door wie", () => {
  const regel = maakGeschiedenisregel({ wat: "status", doorUid: "u1", van: "ter-afstemming", naar: "afgesproken" });
  assert.equal(regel.wat, "status");
  assert.equal(regel.naar, "afgesproken");
});

test("een regel zonder wat of door wie is geen regel", () => {
  assert.equal(maakGeschiedenisregel({ wat: "status" }), null);
  assert.equal(maakGeschiedenisregel({ doorUid: "u1" }), null);
});
