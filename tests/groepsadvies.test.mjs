// Tests voor het advies over een groep.
//
// Twee dingen moeten kloppen. Het advies moet ergens over gaan — anders is het
// een vriendelijke tekst zonder inhoud. En het mag nooit iemand aanwijzen: geen
// naam bij een voorkeur, geen meerderheid tegenover een enkeling, geen oordeel.
// Dat tweede is geen stijlkwestie. Zodra deze app iemand als "de afwijkende"
// neerzet, is hij onbruikbaar in een team.

import test from "node:test";
import assert from "node:assert/strict";

import { steltGroepsadviesSamen, bepaalSpreiding, MINIMUM_GROEP } from "../src/lib/app/advies/groepsregels.js";
import { SPREIDING, vraagtVan } from "../src/data/app/groepsblokken.js";
import { KENMERK_IDS, KENMERKEN } from "../src/data/app/kenmerken.js";
import { SITUATIES, situatiesPerGroep } from "../src/data/app/situaties.js";

const k = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "user_confirmation" });

const IK = [k("tempo", "snel"), k("denken", "hardop"), k("context", "kort")];
const NIKKI = [k("tempo", "snel"), k("denken", "hardop"), k("context", "kort")];
const EVA = [k("tempo", "bedachtzaam"), k("denken", "alleen"), k("context", "veel")];
const AAD = [k("tempo", "snel"), k("denken", "alleen"), k("context", "kort")];

const groep = (situatieId = "besluit-nemen") =>
  steltGroepsadviesSamen({
    mijnKenmerken: IK,
    deelnemers: [
      { naam: "Nikki", kenmerken: NIKKI },
      { naam: "Eva", kenmerken: EVA },
      { naam: "Aad", kenmerken: AAD },
    ],
    situatieId,
  });

/* ------------------------------------------------------- gaat het ergens over */

test("een verschil in de groep wordt gevonden, ook als maar één persoon afwijkt", () => {
  const { uiteen } = bepaalSpreiding([
    { waarden: { tempo: { waarde: "snel" } } },
    { waarden: { tempo: { waarde: "snel" } } },
    { waarden: { tempo: { waarde: "bedachtzaam" } } },
  ]);
  assert.deepEqual(uiteen.map((r) => r.kenmerkId), ["tempo"]);
});

test("waar iedereen hetzelfde kiest, is geen verschil", () => {
  const { uiteen, gedeeld } = bepaalSpreiding([
    { waarden: { tempo: { waarde: "snel" } } },
    { waarden: { tempo: { waarde: "snel" } } },
  ]);
  assert.deepEqual(uiteen, []);
  assert.deepEqual(gedeeld.map((r) => r.kenmerkId), ["tempo"]);
});

test("weet je het van maar één persoon, dan zeg je niets over de groep", () => {
  const { uiteen, gedeeld } = bepaalSpreiding([
    { waarden: { tempo: { waarde: "snel" } } },
    { waarden: {} },
  ]);
  assert.deepEqual(uiteen, []);
  assert.deepEqual(gedeeld, []);
});

test("de situatie bepaalt welk verschil bovenaan komt", () => {
  const besluit = groep("besluit-nemen").gebruikteKenmerken;
  const begrijpen = groep("elkaar-niet-begrijpen").gebruikteKenmerken;
  assert.equal(besluit[0], "tempo", "bij een besluit telt tempo het zwaarst");
  assert.equal(begrijpen[0], "context", "bij langs elkaar heen praten telt context het zwaarst");
});

test("de samenvatting noemt precies de onderwerpen die eronder worden uitgewerkt", () => {
  const a = groep();
  const genoemd = a.samenvatting.find((z) => z.includes("lopen de voorkeuren uiteen"));
  assert.ok(genoemd, "de samenvatting hoort de onderwerpen te noemen");

  a.uiteen.forEach((punt) => {
    assert.ok(
      genoemd.toLowerCase().includes(punt.onderwerp.toLowerCase()),
      `${punt.onderwerp} wordt uitgewerkt maar niet genoemd`
    );
  });

  // En andersom: er wordt niets genoemd dat niet wordt uitgewerkt.
  const uitgewerkt = a.uiteen.map((p) => p.onderwerp.toLowerCase());
  assert.equal(uitgewerkt.length, a.gebruikteKenmerken.length);
});

test("het advies noemt de onderwerpen en geeft er iets bij dat helpt", () => {
  const a = groep();
  assert.ok(a.samenvatting.join(" ").includes("lopen de voorkeuren uiteen"));
  assert.ok(a.helpt.length > 0, "er hoort iets te staan dat helpt");
  assert.ok(a.uiteen.length > 0, "er hoort te staan waar het uiteenloopt");
  assert.ok(a.vraag && a.actie, "een vraag en een kleine actie horen erbij");
});

test("jij telt mee als lid van de groep", () => {
  const a = groep();
  assert.equal(a.aantal, 4, "drie collega's plus jijzelf");
});

test("dezelfde invoer geeft altijd hetzelfde advies", () => {
  assert.deepEqual(groep(), groep());
});

/* ------------------------------------------------ wijst het niemand aan */

test("er staat geen naam bij een voorkeur", () => {
  const a = groep();
  const tekst = [
    ...a.samenvatting,
    ...a.helpt,
    ...a.uiteen.flatMap((p) => [p.onderwerp, p.duiding, ...p.voorkeuren.flatMap((v) => [v.label, v.vraagt])]),
    a.vraag,
    a.actie,
  ]
    .filter(Boolean)
    .join(" ");

  ["Nikki", "Eva", "Aad"].forEach((naam) => {
    assert.doesNotMatch(tekst, new RegExp(naam), `${naam} hoort niet in de advies­tekst te staan`);
  });
});

test("er wordt niet geteld hoeveel mensen wat kozen", () => {
  const a = groep();
  const tekst = [
    ...a.samenvatting,
    ...a.helpt,
    ...a.uiteen.flatMap((p) => [p.duiding, ...p.voorkeuren.map((v) => v.vraagt)]),
  ].join(" ");
  assert.doesNotMatch(
    tekst,
    /\b(meerderheid|minderheid|de meesten|iedereen behalve|als enige|één persoon)\b/i
  );

  // En nergens een aantal per voorkeur: dat zou hetzelfde doen zonder het woord.
  a.uiteen.forEach((punt) => {
    punt.voorkeuren.forEach((v) => {
      assert.equal(v.aantal, undefined, "een voorkeur hoort geen aantal te dragen");
      assert.deepEqual(Object.keys(v).sort(), ["label", "vraagt"]);
    });
  });
});

test("de uitkomst bevat geen lijst van wie welke voorkeur koos", () => {
  const a = groep();

  // Alleen deze velden mogen naar buiten. Komt er ooit iets bij, dan is dit de
  // plek om te bedenken of het iets over een persoon zegt.
  assert.deepEqual(Object.keys(a).sort(), [
    "aantal", "aantalBeschikbaar", "actie", "gebruikteKenmerken", "helpt",
    "namen", "opmerkingen", "samenvatting", "situatie", "soort",
    "transparantie", "uiteen", "vraag",
  ]);

  // De namen zijn een platte lijst zonder iets eraan vast.
  assert.ok(a.namen.every((n) => typeof n === "string"));

  // Nergens in de uitkomst staat een gekozen voorkeur als waarde. Labels als
  // "hardop denken of eerst zelf" mogen wel; dat is de naam van een onderwerp,
  // niet iemands antwoord.
  const gekozenWaarden = new Set(
    [...IK, ...NIKKI, ...EVA, ...AAD].map((k) => k.waarde)
  );

  const waarden = [];
  const loop = (x) => {
    if (typeof x === "string") waarden.push(x);
    else if (Array.isArray(x)) x.forEach(loop);
    else if (x && typeof x === "object") Object.values(x).forEach(loop);
  };
  loop(a);

  waarden.forEach((w) => {
    assert.ok(!gekozenWaarden.has(w), `"${w}" is iemands antwoord en hoort hier niet te staan`);
  });
});

test("de teksten oordelen niet over mensen", () => {
  const verdacht = /\b(moet leren|te traag|te langzaam|probleemgeval|lastig persoon|beter dan|slechter dan|zwakste|sterkste persoon)\b/i;
  Object.entries(SPREIDING).forEach(([id, blok]) => {
    assert.doesNotMatch(blok.duiding, verdacht, `${id}: duiding oordeelt`);
    assert.doesNotMatch(blok.suggestie, verdacht, `${id}: suggestie oordeelt`);
  });
});

test("bij elk verschil staat welke voorkeuren er in déze groep zitten", () => {
  const a = groep();
  const punt = a.uiteen[0];

  assert.ok(punt.onderwerp, "het onderwerp hoort erbij te staan");
  assert.ok(punt.duiding, "wat er gebeurt hoort erbij te staan");
  assert.ok(punt.voorkeuren.length >= 2, "bij een verschil zitten er minstens twee voorkeuren in");
  punt.voorkeuren.forEach((v) => {
    assert.ok(v.label, "een voorkeur zonder leesbaar label zegt niets");
    assert.ok(v.vraagt && v.vraagt.length > 20, `${v.label}: er hoort bij te staan wat het vraagt`);
  });
});

test("alleen de voorkeuren die er echt zijn, staan erbij", () => {
  // Niemand in deze groep koos "dat hangt van het onderwerp af" bij tempo.
  const a = groep("besluit-nemen");
  const tempo = a.uiteen.find((p) => p.kenmerkId === "tempo");
  const labels = tempo.voorkeuren.map((v) => v.label);

  assert.ok(labels.includes("Ik werk graag snel naar een besluit toe"));
  assert.ok(labels.includes("Ik wil eerst tijd om na te denken"));
  assert.ok(!labels.includes("Dat hangt van het onderwerp af"), "een voorkeur die niemand koos hoort er niet te staan");
});

test("de voorkeuren staan in de volgorde van het profiel, niet op aantal", () => {
  // Drie mensen kiezen "snel", één "bedachtzaam". Zou er op aantal gesorteerd
  // worden, dan wordt zichtbaar wie in de minderheid is.
  const a = steltGroepsadviesSamen({
    mijnKenmerken: [k("tempo", "bedachtzaam")],
    deelnemers: [
      { naam: "A", kenmerken: [k("tempo", "snel")] },
      { naam: "B", kenmerken: [k("tempo", "snel")] },
      { naam: "C", kenmerken: [k("tempo", "snel")] },
    ],
    situatieId: "besluit-nemen",
  });
  const labels = a.uiteen[0].voorkeuren.map((v) => v.label);
  assert.deepEqual(labels, ["Ik werk graag snel naar een besluit toe", "Ik wil eerst tijd om na te denken"]);
});

/* ------------------------------------------------------------ volledigheid */

test("elk kenmerk heeft een tekst voor als de groep erop uiteenloopt", () => {
  KENMERK_IDS.forEach((id) => {
    assert.ok(SPREIDING[id], `${id} mist een spreidingstekst`);
    assert.ok(SPREIDING[id].duiding.length > 40, `${id}: duiding is te kort om iets te zeggen`);
    assert.ok(SPREIDING[id].suggestie.length > 30, `${id}: suggestie is te kort om iets te doen`);
  });
});

test("elke voorkeur die iemand kan kiezen, heeft een zin over wat die vraagt", () => {
  KENMERKEN.forEach((k) => {
    k.opties.forEach((o) => {
      const zin = vraagtVan(k.id, o.id);
      assert.ok(zin, `${k.id}.${o.id} mist een zin`);
      assert.ok(zin.length > 20, `${k.id}.${o.id}: te kort om iets mee te kunnen`);
    });
  });
});

test("elke situatie die je bij een groep kunt kiezen, levert een bruikbaar advies op", () => {
  const aangeboden = situatiesPerGroep({ voorGroep: true }).flatMap((g) => g.situaties);
  assert.ok(aangeboden.length >= 10, "er blijft genoeg over om uit te kiezen");

  aangeboden.forEach((s) => {
    const a = groep(s.id);
    assert.ok(a.situatie, `${s.id} geeft geen situatie terug`);
    assert.ok(a.samenvatting.length > 0, `${s.id} geeft geen samenvatting`);
    assert.ok(a.vraag, `${s.id} geeft geen vraag`);
    assert.ok(a.actie, `${s.id} geeft geen actie`);
  });
});

test("situaties die over één persoon gaan, worden bij een groep niet aangeboden", () => {
  const ids = situatiesPerGroep({ voorGroep: true }).flatMap((g) => g.situaties.map((s) => s.id));
  assert.ok(!ids.includes("feedback-geven"), "feedback geef je aan iemand, niet aan een groep");
  assert.ok(!ids.includes("benaderen"), "'hoe benader ik deze persoon' gaat over één persoon");

  // En bij één collega staan ze er gewoon wel.
  const alle = situatiesPerGroep().flatMap((g) => g.situaties.map((s) => s.id));
  assert.ok(alle.includes("feedback-geven"));
  assert.ok(alle.includes("benaderen"));
});

test("de openingszin voor een groep spreekt niet over twee mensen", () => {
  const tweetal = /\b(allebei|jullie twee|de ander|jij en)\b/i;
  SITUATIES.filter((s) => s.groepsopening).forEach((s) => {
    assert.doesNotMatch(s.groepsopening, tweetal, `${s.id}: de groepsopening is voor twee mensen geschreven`);
  });
});

test("elke situatie die een groep aankan, heeft ook een eigen openingszin", () => {
  SITUATIES.forEach((s) => {
    if (s.voorGroep === false) {
      assert.ok(!s.groepsopening, `${s.id} hoort geen groepsopening te hebben`);
    } else {
      assert.ok(s.groepsopening, `${s.id} mist een openingszin voor een groep`);
    }
  });
});

/* ------------------------------------------------------------- randgevallen */

test("deelt niemand iets, dan zegt het advies dat in plaats van te gokken", () => {
  const a = steltGroepsadviesSamen({
    mijnKenmerken: IK,
    deelnemers: [{ naam: "Nikki", kenmerken: [] }, { naam: "Eva", kenmerken: [] }],
    situatieId: "besluit-nemen",
  });
  assert.equal(a.uiteen.length, 0);
  assert.match(a.opmerkingen.join(" "), /Niemand van deze groep heeft al iets met dit team gedeeld/);
});

test("deelt een deel van de groep niets, dan staat erbij over wie het gaat", () => {
  const a = steltGroepsadviesSamen({
    mijnKenmerken: IK,
    deelnemers: [
      { naam: "Nikki", kenmerken: NIKKI },
      { naam: "Eva", kenmerken: EVA },
      { naam: "Aad", kenmerken: [] },
    ],
    situatieId: "besluit-nemen",
  });
  assert.match(a.opmerkingen.join(" "), /1 van de 3/);
});

test("zonder eigen profiel gaat het advies alleen over de anderen, en dat staat erbij", () => {
  const a = steltGroepsadviesSamen({
    mijnKenmerken: [],
    deelnemers: [
      { naam: "Nikki", kenmerken: NIKKI },
      { naam: "Eva", kenmerken: EVA },
    ],
    situatieId: "besluit-nemen",
  });
  assert.match(a.opmerkingen.join(" "), /nog geen voorkeuren vastgelegd/);
  assert.ok(a.uiteen.length > 0, "tussen de anderen valt nog steeds iets te zien");
});

test("zonder gegevens komt er een leeg advies in plaats van een fout", () => {
  const a = steltGroepsadviesSamen();
  assert.equal(a.aantal, 1);
  assert.deepEqual(a.helpt, []);
  assert.deepEqual(a.uiteen, []);
});

test("drie is het minimum voor een groep; daaronder blijft het één-op-één", () => {
  assert.equal(MINIMUM_GROEP, 3);
});

/* ------------------------------------------------- de begeleider telt niet mee */

// Wie een team begeleidt, hoort er niet bij. Zijn eigen voorkeur mag dus niet
// in de spreiding van dat team terechtkomen: anders kijkt een facilitator naar
// een beeld van zijn klant waar hijzelf in verwerkt zit.
test("de voorkeur van een begeleider zit niet in de spreiding van het team", () => {
  const deelnemers = [
    { naam: "Nikki", kenmerken: NIKKI },
    { naam: "Aad", kenmerken: AAD },
    { naam: "Bo", kenmerken: [k("tempo", "snel"), k("denken", "hardop"), k("context", "kort")] },
  ];

  // Iedereen in het team wil hetzelfde tempo; alleen de begeleider wijkt af.
  const begeleider = [k("tempo", "bedachtzaam")];

  const meedoen = steltGroepsadviesSamen({
    mijnKenmerken: begeleider,
    deelnemers,
    situatieId: "besluit-nemen",
  });
  const begeleiden = steltGroepsadviesSamen({
    mijnKenmerken: begeleider,
    deelnemers,
    situatieId: "besluit-nemen",
    ikDoeMee: false,
  });

  const tempoIn = (advies) => (advies.uiteen || []).some((u) => u.kenmerkId === "tempo");

  // Doe je mee, dan loopt tempo uiteen — dat is precies de bedoeling.
  assert.equal(tempoIn(meedoen), true);
  // Begeleid je, dan is het een team dat het over tempo eens is.
  assert.equal(tempoIn(begeleiden), false);
});

test("zonder de begeleider blijft het advies verder gewoon werken", () => {
  const advies = steltGroepsadviesSamen({
    mijnKenmerken: [],
    deelnemers: [
      { naam: "Nikki", kenmerken: NIKKI },
      { naam: "Eva", kenmerken: EVA },
      { naam: "Aad", kenmerken: AAD },
    ],
    situatieId: "besluit-nemen",
    ikDoeMee: false,
  });

  assert.ok((advies.uiteen || []).length > 0);
  // En nog steeds geen naam bij een voorkeur. (Wie je hebt geselecteerd mag het
  // scherm wel noemen; het gaat erom dat een voorkeur nooit aan iemand hangt.)
  const bijVoorkeuren = JSON.stringify(advies.uiteen);
  ["Nikki", "Eva", "Aad"].forEach((naam) => {
    assert.equal(bijVoorkeuren.includes(naam), false, `${naam} hoort niet bij een voorkeur te staan`);
  });
});
