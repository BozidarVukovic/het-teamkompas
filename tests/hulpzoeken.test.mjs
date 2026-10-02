// "Wie helpt mij verder?" — de tweede ingang van de samenwerkingstool.
//
// Deze tests controleren de acht situaties die bij de opdracht horen, plus de
// grenzen die de app zichzelf stelt: geen score, geen rangorde, geen verzonnen
// expertise, en nooit een stellige uitspraak uit een profiel alleen.
//
// Alles is deterministisch: dezelfde hulpvraag geeft hetzelfde antwoord.

import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_SUGGESTIES,
  bepaalHulpsoorten,
  bewijsVoor,
  startTips,
  stelHulpvraagOp,
  woordenUit,
  zoekHulp,
} from "../src/lib/app/hulp/hulpregels.js";
import { HULPSOORTEN, HULPSOORT_IDS } from "../src/data/app/hulpsoorten.js";
import { KENMERK_IDS, optieVan } from "../src/data/app/kenmerken.js";

const k = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "user_confirmation" });

/* Drie collega's met verschillende soorten informatie. */

const NIKKI = {
  sleutel: "nikki",
  naam: "Nikki de Wit",
  functie: "Onboardingspecialist",
  kenmerken: [k("structuur", "structuur"), k("energie", "afronden"), k("contact", "beide")],
  handleiding: [
    {
      sectieId: "hoe-ik-werk",
      titel: "Hoe ik het liefst werk",
      tekst: "Ik breng graag overzicht aan in iets dat nog alle kanten op kan. Daarna werk ik het stap voor stap uit.",
    },
  ],
};

const EVA = {
  sleutel: "eva",
  naam: "Eva Bakker",
  // Geen functie en geen handleiding: alleen een profiel.
  kenmerken: [k("energie", "nieuw"), k("denken", "hardop"), k("structuur", "ruimte")],
  handleiding: [],
};

const AAD = {
  sleutel: "aad",
  naam: "Aad Jansen",
  // Alleen eigen woorden, geen profiel.
  kenmerken: [],
  handleiding: [
    {
      sectieId: "van-jou",
      titel: "Wat ik van jou nodig heb",
      tekst: "Vraag mij gerust om ergens kritisch naar te kijken. Ik zie snel waar iets nog niet klopt.",
    },
  ],
};

const IK = [k("contact", "taak"), k("tempo", "snel")];

const ALLEMAAL = [NIKKI, EVA, AAD];

const vraagOm = (vraag, soorten = [], collegas = ALLEMAAL) =>
  zoekHulp({ vraag, gekozenHulpsoorten: soorten, mijnKenmerken: IK, collegas });

/* ------------------------------------------------------- de catalogus zelf */

test("elke hulpsoort is compleet en verwijst naar bestaande kenmerken", () => {
  assert.equal(HULPSOORTEN.length, 7);
  HULPSOORTEN.forEach((h) => {
    assert.ok(h.label && h.bijdrage, `${h.id}: label en bijdrage horen erbij`);
    assert.ok(h.woorden.length > 0, `${h.id}: zonder woorden valt er in een handleiding niets te vinden`);
    [...h.aanwijzingen, ...(h.tegen || [])].forEach((a) => {
      assert.ok(KENMERK_IDS.includes(a.kenmerkId), `${h.id}: ${a.kenmerkId} bestaat niet`);
      assert.ok(optieVan(a.kenmerkId, a.waarde), `${h.id}: ${a.kenmerkId}=${a.waarde} bestaat niet`);
    });
    h.aanwijzingen.forEach((a) => {
      assert.ok(a.zin && a.zin.length > 10, `${h.id}: elke aanwijzing heeft een leesbare zin`);
    });
  });
});

test("een aanwijzing is voorzichtig geformuleerd en nooit stellig", () => {
  const stellig = /\b(altijd|nooit faalt|is de beste|het beste voor|maakt alles af|kan dit het best)\b/i;
  HULPSOORTEN.forEach((h) => {
    h.aanwijzingen.forEach((a) => {
      assert.doesNotMatch(a.zin, stellig, `${h.id}: "${a.zin}" klinkt te stellig`);
    });
  });
});

/* ----------------------------------------------- 1. inhoudelijke expertise */

test("iemand zoekt inhoudelijke expertise: de rol telt mee als de vraag erop aansluit", () => {
  const a = vraagOm("Ik moet het onboardingprogramma opnieuw opzetten en zoek inhoudelijke hulp.", ["meedenken"]);
  const nikki = a.suggesties.find((s) => s.sleutel === "nikki");
  assert.ok(nikki, "Nikki hoort erbij: haar rol sluit woordelijk aan");
  assert.ok(nikki.waarom.some((b) => b.bron === "rol"), "en dat hoort als onderbouwing zichtbaar te zijn");
  assert.match(nikki.waarom.find((b) => b.bron === "rol").zin, /Onboardingspecialist/);
});

test("een rol telt niet mee als de hulpvraag er niets mee te maken heeft", () => {
  const bewijs = bewijsVoor({
    collega: { ...NIKKI, voornaam: "Nikki" },
    hulpsoortIds: [],
    vraagwoorden: woordenUit("Ik moet de begroting rondkrijgen"),
  });
  assert.equal(bewijs.filter((b) => b.bron === "rol").length, 0);
});

/* ------------------------------------------ 2. structuur en afronden */

test("iemand zoekt hulp bij structuur en afronden", () => {
  const a = vraagOm(
    "Ik heb veel ideeën voor een nieuw onboardingprogramma, maar krijg het plan niet afgerond.",
    ["structuur", "afronden"]
  );
  const nikki = a.suggesties.find((s) => s.sleutel === "nikki");
  assert.ok(nikki, "Nikki hoort hier bovenaan te staan");
  assert.equal(a.suggesties[0].sleutel, "nikki", "eigen woorden wegen zwaarder dan een afgeleide aanwijzing");

  const bronnen = nikki.waarom.map((b) => b.bron);
  assert.ok(bronnen.includes("handleiding"), "haar eigen woorden horen erbij te staan");
  assert.ok(bronnen.includes("profiel"), "en de aanwijzing uit het profiel ook");
  assert.match(nikki.waarom.find((b) => b.bron === "handleiding").zin, /overzicht aan te brengen|overzicht aan/);
  assert.ok(nikki.bijdrage.length > 0, "er hoort een concrete bijdrage bij te staan");
});

/* ------------------------------------- 3. een aanvullende werkvoorkeur */

test("iemand zoekt een aanvullende werkvoorkeur: ideeën ontwikkelen", () => {
  const a = vraagOm("Ik wil nieuwe invalshoeken voor ons introductieprogramma.", ["ideeen"]);
  const eva = a.suggesties.find((s) => s.sleutel === "eva");
  assert.ok(eva, "Eva's profiel bevat de aanwijzingen die hierbij horen");
  assert.ok(eva.waarom.every((b) => b.bron === "profiel"), "bij haar is alles afgeleid uit het profiel");
  eva.waarom.forEach((b) => assert.match(b.zin, /aanwijzing/, "en dat hoort er met zoveel woorden bij te staan"));
});

/* ------------------------ 4. alleen een profiel, of alleen een handleiding */

test("een collega met alleen een Insights-profiel komt eruit", () => {
  const a = zoekHulp({ vraag: "Ik zoek frisse ideeën.", gekozenHulpsoorten: ["ideeen"], mijnKenmerken: IK, collegas: [EVA] });
  assert.equal(a.suggesties.length, 1);
  assert.equal(a.suggesties[0].functie, null, "zonder functie staat er geen rol op de kaart");
});

test("een collega met alleen een hand-in-handleiding komt eruit", () => {
  const a = zoekHulp({ vraag: "Wil iemand hier kritisch naar kijken?", gekozenHulpsoorten: ["toetsen"], mijnKenmerken: IK, collegas: [AAD] });
  assert.equal(a.suggesties.length, 1);
  assert.equal(a.suggesties[0].waarom[0].bron, "handleiding");
  assert.equal(a.suggesties[0].startTips.length, 0, "zonder gedeelde kenmerken zijn er geen starttips");
});

/* ------------------------------------- 5. te weinig onderbouwing */

test("zonder onderbouwing komt er geen suggestie, met uitleg", () => {
  const stil = { sleutel: "stil", naam: "Stille Collega", kenmerken: [], handleiding: [] };
  const a = zoekHulp({ vraag: "Ik moet de begroting rondkrijgen en zoek hulp.", gekozenHulpsoorten: ["structuur"], mijnKenmerken: IK, collegas: [stil] });
  assert.equal(a.suggesties.length, 0);
  assert.ok(a.opmerkingen.some((o) => o.includes("informatie ontbreekt")), "er hoort uitgelegd te worden waaróm");
});

test("een lege hulpvraag levert een vraag om verduidelijking op", () => {
  const a = zoekHulp({ vraag: "", gekozenHulpsoorten: [], mijnKenmerken: IK, collegas: ALLEMAAL });
  assert.equal(a.suggesties.length, 0);
  assert.equal(a.opmerkingen.length, 1);
});

/* ------------------------------------- 6. afscherming en uitsluiting */

test("alleen de meegegeven collega's doen mee; er wordt nergens anders gekeken", () => {
  const anderTeam = { sleutel: "extern", naam: "Iemand Anders", kenmerken: [k("energie", "afronden")], handleiding: [] };
  const a = zoekHulp({ vraag: "Ik moet dit afronden.", gekozenHulpsoorten: ["afronden"], mijnKenmerken: IK, collegas: [NIKKI] });
  assert.ok(!JSON.stringify(a).includes(anderTeam.naam), "iemand buiten de lijst hoort er niet in te staan");
  assert.ok(a.suggesties.every((s) => s.sleutel === "nikki"));
});

test("er komen nooit meer dan drie suggesties", () => {
  const velen = Array.from({ length: 8 }, (_, i) => ({
    sleutel: "p" + i,
    naam: `Persoon ${String.fromCharCode(65 + i)}`,
    kenmerken: [k("energie", "afronden")],
    handleiding: [],
  }));
  const a = zoekHulp({ vraag: "Ik moet dit afronden.", gekozenHulpsoorten: ["afronden"], mijnKenmerken: IK, collegas: velen });
  assert.equal(a.suggesties.length, MAX_SUGGESTIES);
});

/* ------------------------------------- 7. geen score en geen rangorde */

test("er staat nergens een score, een percentage of een plaats in een rij", () => {
  const a = vraagOm("Ik krijg mijn plan niet af en zoek structuur.", ["structuur", "afronden"]);
  // Alleen de kaarten: de zin eronder legt juist uit dát er geen score is, en
  // dan is het woord er wél op zijn plek.
  const tekst = JSON.stringify(a.suggesties);
  assert.doesNotMatch(tekst, /\b(score|punten|percentage|\d+%|match|geschiktheid|rangorde|nummer 1|beste keuze)\b/i);
  a.suggesties.forEach((s) => {
    assert.equal(s.punten, undefined, "een kaart draagt geen score mee");
    assert.equal(s.plaats, undefined);
  });
});

test("er wordt geen expertise, beschikbaarheid of eigenschap verzonnen", () => {
  const a = vraagOm("Ik krijg mijn plan niet af.", ["afronden"]);
  const tekst = JSON.stringify(a).toLowerCase();
  ["beschikbaar", "ervaring met", "expert in", "specialist in afronden", "jaar ervaring"].forEach((z) => {
    assert.ok(!tekst.includes(z), `"${z}" hoort hier niet te staan`);
  });
});

/* ------------------------------------- 8. tegenspraak en voorzichtigheid */

test("spreekt het profiel zichzelf tegen, dan staat dat erbij", () => {
  // Energie uit afronden, maar ook uit nieuwe ideeën: dat wijst twee kanten op.
  const twijfel = {
    sleutel: "twijfel",
    naam: "Twijfel Persoon",
    kenmerken: [k("energie", "afronden"), k("structuur", "ruimte")],
    handleiding: [],
  };
  const a = zoekHulp({ vraag: "Ik moet dit afronden.", gekozenHulpsoorten: ["afronden"], mijnKenmerken: IK, collegas: [twijfel] });
  assert.equal(a.suggesties.length, 1);
  assert.ok(a.suggesties[0].tegenspraak, "de tegenspraak hoort benoemd te worden");
  assert.match(a.suggesties[0].tegenspraak.uitleg, /geen uitspraak van de collega zelf/);
});

/* ------------------------------------- de knoppen zijn optioneel */

test("zonder aangevinkte hulpsoort wordt er naar de eigen woorden gekeken", () => {
  const { ids, afgeleid } = bepaalHulpsoorten({ vraag: "Ik krijg het plan niet afgerond en mis overzicht." });
  assert.ok(afgeleid);
  assert.ok(ids.includes("afronden") && ids.includes("structuur"));
});

test("wat de gebruiker aanvinkt gaat vóór wat de app uit de tekst leest", () => {
  const { ids, afgeleid } = bepaalHulpsoorten({ vraag: "Ik mis overzicht.", gekozen: ["toetsen"] });
  assert.deepEqual(ids, ["toetsen"]);
  assert.equal(afgeleid, false);
});

test("een onbekende hulpsoort wordt genegeerd", () => {
  const { ids } = bepaalHulpsoorten({ vraag: "Ik mis overzicht.", gekozen: ["verzonnen", "structuur"] });
  assert.deepEqual(ids, ["structuur"]);
  assert.ok(HULPSOORT_IDS.includes(ids[0]));
});

/* ------------------------------------- starttips en de hulpvraag */

test("starttips komen uit wat de collega zelf deelde, met het verschil erbij", () => {
  const tips = startTips({ collega: { ...NIKKI, voornaam: "Nikki" }, mijnKenmerken: IK });
  assert.ok(tips.length > 0 && tips.length <= 2, "hoogstens twee tips");
  const contact = tips.find((t) => t.kenmerkId === "contact");
  assert.ok(contact, "contact is de eerste voorkeur waar je bij een eerste gesprek iets aan hebt");
  assert.ok(contact.verschil, "mijn eigen voorkeur verschilt, dus dat hoort erbij te staan");
});

test("de hulpvraag bevat geen verzonnen deadline of tijdsinvestering", () => {
  const a = vraagOm("Ik krijg mijn onboardingplan niet af.", ["afronden"]);
  const tekst = stelHulpvraagOp({ vraag: "Ik krijg mijn onboardingplan niet af.", suggestie: a.suggesties[0], hulpsoorten: a.hulpsoorten });
  assert.match(tekst, /^Hoi /);
  assert.ok(tekst.includes("onboardingplan"), "de eigen woorden van de gebruiker horen erin");
  assert.doesNotMatch(tekst, /\b(uur|uurtje|deadline|voor vrijdag|volgende week|half uur|dagdeel)\b/i);
});

test("zonder suggestie is er geen hulpvraag", () => {
  assert.equal(stelHulpvraagOp({ vraag: "iets", suggestie: null }), "");
});

/* ------------------------------------- dezelfde vraag, hetzelfde antwoord */

test("dezelfde hulpvraag geeft altijd hetzelfde antwoord", () => {
  const een = vraagOm("Ik krijg mijn plan niet af.", ["afronden", "structuur"]);
  const twee = vraagOm("Ik krijg mijn plan niet af.", ["afronden", "structuur"]);
  assert.deepEqual(een, twee);
});
