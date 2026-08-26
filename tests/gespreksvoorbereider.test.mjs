// Tests voor de gespreksvoorbereider. Draaien met `npm run test:gesprek`.
//
// Alles wat hier wordt getest is dezelfde code die de website gebruikt: de
// data, de beslisroutes, de samenstelling van het gespreksformat, de
// veiligheidsroute, de validatie en de lokale opslag.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITUATIES, SITUATIE_IDS, situatie, stappenVoor } from "../src/data/gespreksvoorbereider/situaties.js";
import {
  CONTROLELIJST, EFFECT_ONDERDELEN, EFFECT_SCHAAL, RELATIES, STAPPEN, stap,
} from "../src/data/gespreksvoorbereider/stappen.js";
import {
  FORMAT_BLOKKEN, REFLECTIE_AFSLUITING, REFLECTIE_VRAGEN, TIPS_TIJDENS, VEILIGHEIDSVRAGEN,
} from "../src/data/gespreksvoorbereider/teksten.js";
import {
  bouwWaarden, deelzin, opsomming, stelFormatSamen, vulSjabloon, zin, zwaarsteEffect,
} from "../src/lib/gespreksvoorbereider/format.js";
import {
  bevatAbsoluteWoorden, bevatSignaalwoorden, MAX_TEKST, valideerRoute, valideerStap,
} from "../src/lib/gespreksvoorbereider/validatie.js";
import { beoordeelVeiligheid, magDoorgaan, veiligheidCompleet } from "../src/lib/gespreksvoorbereider/veiligheid.js";

const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Een volledig ingevulde voorbereiding, als vertrekpunt voor de tests. */
function volledig(overschrijf = {}) {
  return {
    situatie: "collega-aanspreken",
    waarneming: "Tijdens mijn toelichting in het overleg van dinsdag onderbrak je mij drie keer.",
    waarnemingCheck: "concreet",
    patroon: "eenmalig",
    relatie: "collega",
    effect: {
      jou: { schaal: "duidelijk", tekst: "Ik raak mijn draad kwijt en breng mijn punt daarna niet meer in." },
      team: { schaal: "beperkt", tekst: "Anderen wachten af tot het overleg voorbij is." },
      werk: { schaal: "nvt", tekst: "" },
    },
    resultaat: ["perspectief", "nieuwe-afspraak"],
    verbetering: "We laten elkaar uitpraten voordat iemand reageert.",
    belang: ["duidelijkheid"],
    openvraag: ["Hoe heb jij deze situatie ervaren?"],
    ...overschrijf,
  };
}

// ── Beslisroutes ───────────────────────────────────────────────────────────

test("alle zes gesprekssituaties bestaan en hebben uitleg", () => {
  assert.equal(SITUATIES.length, 6);
  for (const s of SITUATIES) {
    assert.ok(s.label, "label ontbreekt bij " + s.id);
    assert.ok(s.uitleg && s.uitleg.length > 20, "uitleg te kort bij " + s.id);
    assert.ok(s.wanneer && s.wanneer.length > 20, "wanneer-tekst ontbreekt bij " + s.id);
    assert.ok(s.nadruk.length >= 4, "te weinig nadrukpunten bij " + s.id);
    assert.ok(s.stappen.length >= 5, "te korte route bij " + s.id);
  }
});

test("elke route eindigt met de controlestap en gebruikt bestaande stappen", () => {
  for (const s of SITUATIES) {
    assert.equal(s.stappen[s.stappen.length - 1], "controle", "route van " + s.id + " eindigt niet met controle");
    s.stappen.forEach((stapId) => {
      assert.ok(STAPPEN[stapId], "onbekende stap " + stapId + " in route van " + s.id);
    });
    assert.equal(new Set(s.stappen).size, s.stappen.length, "dubbele stap in route van " + s.id);
  }
});

test("de routes verschillen per situatie", () => {
  const routes = SITUATIES.map((s) => s.stappen.join(">"));
  assert.ok(new Set(routes).size >= 5, "de routes lijken te veel op elkaar");
  assert.ok(stappenVoor("teamafspraak-evalueren").includes("afspraak"));
  assert.ok(stappenVoor("rolonduidelijkheid").includes("rollen"));
  assert.ok(stappenVoor("verschil-van-inzicht").includes("verschil"));
  assert.ok(stappenVoor("onveilig-gedrag").includes("grenzen"));
  assert.ok(stappenVoor("feedback-vragen").includes("feedbackvraag"));
  assert.equal(stappenVoor("feedback-vragen").includes("effect"), false, "feedback vragen hoort geen effectvraag te hebben");
});

test("een onbekende situatie levert een lege route op in plaats van een fout", () => {
  assert.deepEqual(stappenVoor("bestaat-niet"), []);
  assert.equal(situatie("bestaat-niet"), null);
});

test("een stap kan per situatie een andere formulering krijgen", () => {
  const algemeen = stap("waarneming", "collega-aanspreken");
  const rollen = stap("waarneming", "rolonduidelijkheid");
  assert.notEqual(algemeen.vraag, rollen.vraag);
  assert.equal(algemeen.veld, rollen.veld, "het antwoord hoort in hetzelfde veld te landen");
});

test("de relatie levert een eigen aandachtspunt op", () => {
  assert.equal(RELATIES.length, 5);
  for (const relatie of RELATIES) {
    assert.ok(relatie.aandachtspunt.length > 40, "aandachtspunt te kort bij " + relatie.id);
  }
  const medewerker = RELATIES.find((r) => r.id === "medewerker");
  assert.match(medewerker.aandachtspunt, /leidinggevende/i);
  const leidinggevende = RELATIES.find((r) => r.id === "leidinggevende");
  assert.match(leidinggevende.aandachtspunt, /nodig hebt/i);
});

// ── Veiligheidsroute ───────────────────────────────────────────────────────

test("de veiligheidscheck stelt vier vragen en geldt alleen voor onveilig gedrag", () => {
  assert.equal(VEILIGHEIDSVRAGEN.length, 4);
  assert.equal(situatie("onveilig-gedrag").veiligheidscheck, true);
  assert.equal(Boolean(situatie("collega-aanspreken").veiligheidscheck), false);
});

test("een onveilige uitkomst leidt niet automatisch door naar het gespreksscript", () => {
  const onveilig = { veilig: "nee", ernst: "ja", macht: "ja", steun: "ja" };
  const oordeel = beoordeelVeiligheid(onveilig);
  assert.equal(oordeel.compleet, true);
  assert.equal(oordeel.risico, true);
  assert.ok(oordeel.redenen.length >= 3);
  assert.equal(magDoorgaan(onveilig, "onveilig-gedrag"), false, "de route gaat ongevraagd door");
  assert.equal(magDoorgaan(onveilig, "onveilig-gedrag", true), true, "de gebruiker mag zelf kiezen om door te gaan");
});

test("zonder risicosignalen loopt de route gewoon door", () => {
  const veilig = { veilig: "ja", ernst: "nee", macht: "nee", steun: "nee" };
  const oordeel = beoordeelVeiligheid(veilig);
  assert.equal(oordeel.risico, false);
  assert.deepEqual(oordeel.redenen, []);
  assert.equal(magDoorgaan(veilig, "onveilig-gedrag"), true);
});

test("een machtsverschil alleen is een aandachtspunt, geen blokkade", () => {
  const macht = { veilig: "ja", ernst: "nee", macht: "ja", steun: "nee" };
  const oordeel = beoordeelVeiligheid(macht);
  assert.equal(oordeel.machtsverschil, true);
  assert.equal(oordeel.risico, false);
  assert.equal(oordeel.redenen.length, 1);
});

test("een onvolledige veiligheidscheck houdt de route tegen", () => {
  assert.equal(veiligheidCompleet({ veilig: "ja" }), false);
  assert.equal(magDoorgaan({ veilig: "ja" }, "onveilig-gedrag", true), false);
});

test("andere situaties kennen geen veiligheidsblokkade", () => {
  assert.equal(magDoorgaan({}, "collega-aanspreken"), true);
});

// ── Samenstelling van het gespreksformat ───────────────────────────────────

test("het format bevat de zeven blokken in vaste volgorde", () => {
  const format = stelFormatSamen(volledig());
  const koppen = format.secties.map((s) => s.kop.replace(/^\d+\.\s*/, ""));
  assert.deepEqual(koppen, [
    "Opening", "Concrete waarneming", "Effect", "Perspectief van de ander",
    "Gezamenlijk belang", "Gewenste verandering", "Concrete afspraak",
  ]);
});

test("de eigen woorden van de gebruiker komen ongewijzigd in het format", () => {
  const tekst = "Tijdens mijn toelichting in het overleg van dinsdag onderbrak je mij drie keer.";
  const format = stelFormatSamen(volledig({ waarneming: tekst }));
  const waarneming = format.secties.find((s) => s.id === "waarneming");
  assert.ok(waarneming.zinnen[0].includes(tekst), "de tekst is onderweg veranderd");
});

test("alle zes situaties leveren een bruikbaar format op", () => {
  for (const id of SITUATIE_IDS) {
    const format = stelFormatSamen(volledig({
      situatie: id,
      feedbackvraag: "Hoe kwam mijn toelichting in het teamoverleg over?",
      afspraak: { oorspronkelijk: "Iedereen zet zijn punt vooraf op de agenda.", beoogd: "Kortere overleggen.", feitelijk: "Er stonden geen punten op." },
      rollen: { verantwoordelijk: "De projectleider.", beslist: "De teamleider.", duidelijkheid: "Wie het budget vrijgeeft." },
      verschil: { eens: "Dat de doorlooptijd korter moet.", eigenAanname: "Ik neem aan dat een pilot tijd bespaart.", criteria: "Haalbaar binnen dit kwartaal." },
      grenzen: { grens: "Opmerkingen over mijn achtergrond wil ik niet meer horen." },
    }));
    assert.ok(format.secties.length >= 5, "te weinig secties bij " + id);
    assert.ok(format.situatieLabel, "situatielabel ontbreekt bij " + id);
    format.secties.forEach((sectie) => {
      sectie.zinnen.forEach((regel) => {
        assert.equal(regel.includes("{"), false, "onvervulde plaatshouder bij " + id + ": " + regel);
        assert.equal(regel.includes("undefined"), false, "undefined in de tekst bij " + id);
      });
    });
  }
});

test("een blok dat niet bij de route hoort verschijnt niet", () => {
  const format = stelFormatSamen(volledig({
    situatie: "feedback-vragen",
    feedbackvraag: "Hoe kwam mijn toelichting over?",
  }));
  assert.equal(format.secties.some((s) => s.id === "effect"), false, "feedback vragen kent geen effectvraag");
});

test("de secties worden hernummerd zonder gaten", () => {
  const format = stelFormatSamen(volledig({ situatie: "feedback-vragen", feedbackvraag: "Hoe kwam ik over?" }));
  const nummers = format.secties.map((s) => Number(s.kop.split(".")[0]));
  assert.deepEqual(nummers, nummers.map((_, index) => index + 1));
});

test("ontbrekende antwoorden laten de zin weg in plaats van een gat achter", () => {
  const format = stelFormatSamen({ situatie: "collega-aanspreken", waarneming: "Je was er niet bij." });
  assert.ok(format.secties.length >= 1);
  format.secties.forEach((sectie) => sectie.zinnen.forEach((regel) => {
    assert.equal(regel.includes("{"), false);
  }));
  assert.equal(format.secties.some((s) => s.id === "belang"), false, "zonder belang hoort dat blok weg te vallen");
});

test("een terugkerend patroon krijgt een eigen zin met voorbeelden", () => {
  const format = stelFormatSamen(volledig({
    patroon: "patroon",
    voorbeelden: { voorbeeld1: "in het overleg van 4 maart", voorbeeld2: "tijdens de dagstart van 11 maart" },
  }));
  const waarneming = format.secties.find((s) => s.id === "waarneming");
  assert.equal(waarneming.zinnen.length, 2);
  assert.match(waarneming.zinnen[1], /meerdere momenten/);
  assert.match(waarneming.zinnen[1], /4 maart en tijdens de dagstart van 11 maart/);
});

test("bij een eenmalige gebeurtenis blijft de patroonzin weg", () => {
  const format = stelFormatSamen(volledig({ patroon: "eenmalig" }));
  const waarneming = format.secties.find((s) => s.id === "waarneming");
  assert.equal(waarneming.zinnen.length, 1);
});

test("het zwaarste effect komt eerst en nvt telt niet mee", () => {
  const gesorteerd = zwaarsteEffect(volledig().effect);
  assert.equal(gesorteerd.length, 2, "een onderdeel op niet van toepassing hoort weg te vallen");
  assert.equal(gesorteerd[0].onderdeel.id, "jou");
  assert.equal(gesorteerd[1].onderdeel.id, "team");
});

test("de opening herhaalt samenwerking niet dubbel en leest als een opsomming", () => {
  const metSamenwerking = bouwWaarden({ belang: ["goede samenwerking"] });
  assert.equal(metSamenwerking.belangOpening, "goede samenwerking");
  assert.equal(metSamenwerking.belangWerkwoord, "is");

  const zonder = bouwWaarden({ belang: ["duidelijkheid"] });
  assert.equal(zonder.belangOpening, "onze samenwerking en duidelijkheid");
  assert.equal(zonder.belangWerkwoord, "zijn");

  const meerdere = bouwWaarden({ belang: ["duidelijkheid", "werkplezier"] });
  assert.equal(meerdere.belangOpening, "onze samenwerking, duidelijkheid en werkplezier");
});

test("de openingszin klopt in enkelvoud en meervoud", () => {
  const een = stelFormatSamen({ situatie: "collega-aanspreken", belang: ["duidelijkheid"], waarneming: "Je onderbrak mij." });
  assert.match(een.secties[0].zinnen[0], /belangrijk zijn\./);
  const zelf = stelFormatSamen({ situatie: "collega-aanspreken", belang: ["goede samenwerking"], waarneming: "Je onderbrak mij." });
  assert.match(zelf.secties[0].zinnen[0], /belangrijk is\./);
});

test("aandachtspunten komen uit de relatie, de situatie en de antwoorden", () => {
  const format = stelFormatSamen(volledig({ relatie: "medewerker", patroon: "patroon" }));
  assert.ok(format.aandachtspunten.length >= 4);
  assert.ok(format.aandachtspunten.some((p) => /leidinggevende/i.test(p)), "het machtsverschil wordt niet benoemd");
  assert.ok(format.aandachtspunten.some((p) => /dossier/i.test(p)), "het patroon levert geen aandachtspunt op");
});

test("de tool waarschuwt bij woorden die een interpretatie verraden", () => {
  const format = stelFormatSamen(volledig({
    waarneming: "Je onderbreekt mij altijd expres omdat je mij niet serieus neemt.",
  }));
  assert.ok(format.waarschuwingen.length >= 2, "te weinig waarschuwingen");
  assert.ok(format.waarschuwingen.some((w) => /altijd/.test(w)));
  assert.ok(format.waarschuwingen.some((w) => /bedoeling of het karakter/.test(w)));
});

test("wie zelf aangeeft dat er nog een interpretatie in staat, krijgt daar een melding over", () => {
  const format = stelFormatSamen(volledig({ waarnemingCheck: "interpretatie" }));
  assert.ok(format.waarschuwingen.some((w) => /interpretatie/i.test(w)));
});

test("een zorgvuldige beschrijving levert geen waarschuwingen op", () => {
  assert.deepEqual(stelFormatSamen(volledig()).waarschuwingen, []);
});

test("de zes tips staan altijd bij het resultaat", () => {
  assert.equal(TIPS_TIJDENS.length, 6);
  assert.deepEqual(stelFormatSamen(volledig()).tips, TIPS_TIJDENS);
});

// ── Hulpfuncties voor de tekstopbouw ───────────────────────────────────────

test("een sjabloon met een ontbrekende waarde vervalt volledig", () => {
  assert.equal(vulSjabloon("Het effect {effectLabel}: {effect}", { effectLabel: "op mij" }), null);
  assert.equal(vulSjabloon("Het effect {effectLabel}: {effect}", { effectLabel: "op mij", effect: "Vertraging." }), "Het effect op mij: Vertraging.");
});

test("zin en deelzin doen wat ze beloven", () => {
  assert.equal(zin("  Ik raak mijn draad kwijt  "), "Ik raak mijn draad kwijt.");
  assert.equal(zin("Klopt dat?"), "Klopt dat?");
  assert.equal(zin(""), "");
  assert.equal(deelzin("Goede samenwerking."), "goede samenwerking");
  assert.equal(deelzin("HR-beleid"), "HR-beleid", "een afkorting blijft in hoofdletters");
});

test("opsomming leest als lopende tekst", () => {
  assert.equal(opsomming(["a"]), "a");
  assert.equal(opsomming(["a", "b"]), "a en b");
  assert.equal(opsomming(["a", "b", "c"]), "a, b en c");
  assert.equal(opsomming(["a", "", null, "b"]), "a en b");
});

// ── Invoervalidatie ────────────────────────────────────────────────────────

test("een lege verplichte stap komt niet door de validatie", () => {
  const leeg = valideerStap("waarneming", {}, "collega-aanspreken");
  assert.equal(leeg.geldig, false);
  assert.ok(leeg.fouten.waarneming);

  const kort = valideerStap("waarneming", { waarneming: "Niks." }, "collega-aanspreken");
  assert.equal(kort.geldig, false, "een half woord telt niet als beschrijving");
});

test("een ingevulde stap komt wel door de validatie", () => {
  const uitkomst = valideerStap("waarneming", volledig(), "collega-aanspreken");
  assert.equal(uitkomst.geldig, true);
  assert.deepEqual(uitkomst.fouten, {});
});

test("meerkeuze bewaakt het maximum en de extra vraag", () => {
  const teveel = valideerStap("resultaat", { resultaat: ["perspectief", "feedback", "grens", "combinatie"], verbetering: "Iets kleins en concreets." }, "collega-aanspreken");
  assert.equal(teveel.geldig, false);
  assert.match(teveel.fouten.resultaat, /maximaal 3/);

  const zonderVerbetering = valideerStap("resultaat", { resultaat: ["perspectief"] }, "collega-aanspreken");
  assert.ok(zonderVerbetering.fouten.verbetering);
});

test("een eigen formulering telt mee als antwoord bij meerkeuze", () => {
  const eigen = valideerStap("belang", { belangEigen: "Dat nieuwe collega's zich hier thuis voelen." }, "collega-aanspreken");
  assert.equal(eigen.geldig, true);
});

test("de effectvraag vraagt om een schaal en een toelichting", () => {
  assert.equal(valideerStap("effect", {}, "collega-aanspreken").geldig, false);
  const alleenSchaal = valideerStap("effect", { effect: { jou: { schaal: "duidelijk" } } }, "collega-aanspreken");
  assert.equal(alleenSchaal.geldig, false);
  assert.match(alleenSchaal.fouten.effect, /eigen woorden/);
  const compleet = valideerStap("effect", volledig(), "collega-aanspreken");
  assert.equal(compleet.geldig, true);
});

test("alleen niet van toepassing invullen is geen antwoord", () => {
  const nvt = valideerStap("effect", { effect: { jou: { schaal: "nvt" }, team: { schaal: "nvt" }, werk: { schaal: "nvt" } } }, "collega-aanspreken");
  assert.equal(nvt.geldig, false);
});

test("losse velden worden per veld gecontroleerd", () => {
  const uitkomst = valideerStap("rollen", { rollen: { verantwoordelijk: "De projectleider." } }, "rolonduidelijkheid");
  assert.equal(uitkomst.geldig, false);
  assert.ok(uitkomst.fouten["rollen.beslist"]);
  assert.ok(uitkomst.fouten["rollen.duidelijkheid"]);
  assert.equal(uitkomst.fouten["rollen.uitvoert"], undefined, "een optioneel veld hoort geen fout te geven");
});

test("de controlelijst houdt niemand tegen", () => {
  assert.equal(valideerStap("controle", {}, "collega-aanspreken").geldig, true);
  assert.equal(CONTROLELIJST.length, 8);
});

test("een te lange tekst wordt begrensd", () => {
  const lang = { waarneming: "a".repeat(MAX_TEKST + 50) };
  const uitkomst = valideerStap("waarneming", lang, "collega-aanspreken");
  assert.equal(uitkomst.geldig, false);
  assert.match(uitkomst.fouten.waarneming, /tekens/);
});

test("een volledig ingevulde route heeft geen openstaande fouten", () => {
  const fouten = valideerRoute(stappenVoor("collega-aanspreken"), volledig(), "collega-aanspreken");
  assert.deepEqual(fouten, {});
});

test("signaalwoorden en absolute woorden worden herkend", () => {
  assert.ok(bevatSignaalwoorden("Je doet dat expres.").includes("expres"));
  assert.deepEqual(bevatSignaalwoorden("Je was bij drie overleggen niet aanwezig."), []);
  assert.ok(bevatAbsoluteWoorden("Je bent nooit op tijd.").includes("nooit"));
  assert.deepEqual(bevatAbsoluteWoorden("Je was twee keer later dan afgesproken."), []);
});

// ── Veilige verwerking van vrije tekst ─────────────────────────────────────

test("ingevoerde html blijft gewone tekst en wordt nergens als opmaak gebruikt", () => {
  const kwaadaardig = "<script>alert('xss')</script><img src=x onerror=alert(1)>";
  const format = stelFormatSamen(volledig({ waarneming: kwaadaardig }));
  const regel = format.secties.find((s) => s.id === "waarneming").zinnen[0];
  assert.ok(regel.includes(kwaadaardig), "de invoer hoort letterlijk bewaard te blijven");
  assert.equal(typeof regel, "string", "het format levert tekst op, geen opmaak");
});

test("geen enkel onderdeel zet ruwe html in de pagina", () => {
  const mappen = [
    "src/components/gespreksvoorbereider",
    "src/pages/public",
  ];
  const bestanden = mappen.flatMap((map) =>
    fs.readdirSync(path.join(wortel, map))
      .filter((naam) => naam.endsWith(".jsx"))
      .map((naam) => path.join(wortel, map, naam))
  ).filter((pad) => /Gespreksvoorbereider|gespreksvoorbereider|StapVeld|Veiligheidscheck|Resultaat|Reflectie/.test(pad));

  assert.ok(bestanden.length >= 5, "de onderdelen van de gespreksvoorbereider zijn niet gevonden");
  for (const bestand of bestanden) {
    const inhoud = fs.readFileSync(bestand, "utf-8");
    assert.equal(/dangerouslySetInnerHTML\s*=/.test(inhoud), false, "ruwe html in " + path.basename(bestand));
    assert.equal(/innerHTML\s*=/.test(inhoud), false, "innerHTML in " + path.basename(bestand));
  }
});

// ── Lokale opslag ──────────────────────────────────────────────────────────

function nepOpslag() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    _data: data,
  };
}

test("antwoorden worden lokaal bewaard, teruggelezen en gewist", async () => {
  globalThis.window = { localStorage: nepOpslag() };
  const opslag = await import("../src/lib/gespreksvoorbereider/opslag.js");

  assert.deepEqual(opslag.leesAntwoorden(), {});
  assert.equal(opslag.heeftOpslag(), false);

  opslag.bewaarAntwoorden(volledig());
  assert.equal(opslag.leesAntwoorden().waarneming, volledig().waarneming);
  assert.equal(opslag.heeftOpslag(), true);

  opslag.bewaarReflectie({ afspraak: "We evalueren over twee weken." });
  assert.equal(opslag.leesReflectie().afspraak, "We evalueren over twee weken.");

  opslag.wisAlles();
  assert.deepEqual(opslag.leesAntwoorden(), {});
  assert.deepEqual(opslag.leesReflectie(), {});
  assert.equal(opslag.heeftOpslag(), false, "na wissen mag er niets meer staan");
  delete globalThis.window;
});

test("beschadigde opslag levert geen fout op", async () => {
  const nep = nepOpslag();
  nep.setItem("teamkompas:gespreksvoorbereider:v1", "{geen json");
  globalThis.window = { localStorage: nep };
  const opslag = await import("../src/lib/gespreksvoorbereider/opslag.js?stuk");
  assert.deepEqual(opslag.leesAntwoorden(), {});
  delete globalThis.window;
});

test("geblokkeerde opslag laat de tool gewoon werken", async () => {
  globalThis.window = { get localStorage() { throw new Error("geblokkeerd"); } };
  const opslag = await import("../src/lib/gespreksvoorbereider/opslag.js?blok");
  assert.deepEqual(opslag.leesAntwoorden(), {});
  assert.equal(opslag.bewaarAntwoorden({ situatie: "collega-aanspreken" }), false);
  assert.equal(opslag.wisAlles(), false);
  delete globalThis.window;
});

// ── Navigatie tussen de stappen ────────────────────────────────────────────

test("terugbladeren verandert de antwoorden niet", () => {
  const antwoorden = volledig();
  const route = stappenVoor("collega-aanspreken");
  const kopie = JSON.parse(JSON.stringify(antwoorden));
  route.forEach((stapId) => valideerStap(stapId, antwoorden, "collega-aanspreken"));
  [...route].reverse().forEach((stapId) => valideerStap(stapId, antwoorden, "collega-aanspreken"));
  assert.deepEqual(antwoorden, kopie, "de validatie hoort niets aan te passen");
});

test("de voortgang telt precies de stappen van de gekozen route", () => {
  for (const s of SITUATIES) {
    const route = stappenVoor(s.id);
    assert.ok(route.length >= 5 && route.length <= 10, "onwaarschijnlijke routelengte bij " + s.id);
    assert.equal(route.indexOf("controle"), route.length - 1);
  }
});

// ── Reflectie na het gesprek ───────────────────────────────────────────────

test("de reflectie bevat de acht vragen en vier afsluitingen", () => {
  assert.equal(REFLECTIE_VRAGEN.length, 8);
  assert.equal(REFLECTIE_AFSLUITING.length, 4);
  assert.ok(REFLECTIE_AFSLUITING.some((a) => a.id === "ondersteuning"));
});

// ── Datastructuur ──────────────────────────────────────────────────────────

test("alle teksten staan centraal en niet verspreid over de onderdelen", () => {
  assert.equal(FORMAT_BLOKKEN.length, 7);
  assert.equal(EFFECT_ONDERDELEN.length, 3);
  assert.equal(EFFECT_SCHAAL.length, 5);
  for (const blok of FORMAT_BLOKKEN) {
    assert.ok(blok.kop && blok.sjabloon, "onvolledig blok " + blok.id);
  }
});
