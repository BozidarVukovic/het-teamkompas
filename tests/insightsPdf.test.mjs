// Tests voor het uitlezen van een Insights Discovery-profiel.
//
// De profielteksten hieronder zijn verzonnen. Ze zijn nagebouwd naar de opbouw
// van een echt profiel — dezelfde kopregels, dezelfde volgorde, dezelfde manier
// van opsommen — maar de namen en de waarden bestaan niet. Er staat geen enkel
// echt profiel in dit bestand, en dat blijft zo.

import test from "node:test";
import assert from "node:assert/strict";

import {
  BASISTYPEN,
  diagnoseregels,
  kleurenUitTypenaam,
  leesInsightsTekst,
  leesKleurenergieen,
  leesProfielteksten,
  leesWielpositie,
  naarRegels,
} from "../src/lib/app/insightsParser.js";
import { kenmerkenUitInsights, KLEUR_IDS } from "../src/lib/app/insights.js";
import { optieVan } from "../src/data/app/kenmerken.js";
import { SECTIE_IDS } from "../src/data/app/handleiding.js";

/** Zoals het profiel van 2024 eruitziet: opsommingsteken op een eigen regel. */
const PROFIEL_2024 = `
Insights Discovery Profiel
Testpersoon A
Bewuste wielpositie
44: Directieve Motivator (Accommoderend)
Minder bewuste wielpositie
5: Inspirerende Motivator (Gefocust)
Insights Discovery Kleurendynamica
Persona (bewust) Voorkeursstroom Persona (minder bewust)
BLAUW GROEN GEEL ROOD BLAUW GROEN GEEL ROOD
100
6 6
50
0
3 3
50
100
0 0
1.28 4.28 4.40 4.68 1.60 1.32 4.72 1.72
56.4%
21% 71% 73% 78% 27% 22% 79% 29%
Bewust
Minder bewust
Waarde voor het team
Testpersoon A als teamlid:
●
Kan goed omgaan met diverse taken en activiteiten.
●
Is altijd bereid om hulp te verlenen aan collega's.
●
Is innovatief en heeft verbeeldingskracht.
Effectieve communicatie
Strategieen om te communiceren met Testpersoon A:
●
Praat over de onderwerpen waarin die persoon een uitdaging ziet.
●
Zorg voor data en tijdslimieten wanneer iets af moet.
Barrieres voor effectieve communicatie
●
Vaag zijn of ruimte voor eigen interpretatie laten.
●
Nadruk leggen op gevestigde processen.
Suggesties voor ontwikkeling
●
Vaker even stilstaan voordat de volgende stap wordt gezet.
Persoonlijke aantekeningen
`;

/** Zoals het profiel van 2021 eruitziet: teken en tekst op dezelfde regel. */
const PROFIEL_2021 = `
Personal Profile
Bewuste wielpositie
34: Coordinerende Observator (Klassiek)
BLAUW GROEN GEEL ROOD BLAUW GROEN GEEL ROOD
6 100 6
50
3 0 3
50
0 100 0
4,88 3,60 2,28 2,64 3,72 3,36 1,12 2,40
26,0%
81% 60% 38% 44% 62% 56% 19% 40%
Waarde voor het team
Testpersoon B als teamlid:
• Werkt nauwkeurig en denkt vooruit.
• Houdt overzicht wanneer het druk wordt.
Effectieve communicatie
• Geef vooraf aan waar het gesprek over gaat.
Barrieres voor effectieve communicatie
• Overvallen worden met een besluit.
Suggesties voor ontwikkeling
• Vaker hardop delen wat al is uitgedacht.
Persoonlijke aantekeningen
`;

const PROFIEL_ZONDER_ALLES = `
Een willekeurig document. Er staat wel tekst in, maar geen kleurendynamica en
geen wielpositie. Wel het woord blauw, om te controleren dat dat niet genoeg is.
`;

/* ---------------------------------------------------------- kleurendynamica */

test("de kleurenergieën van de bewuste persona worden gelezen (2024)", () => {
  const uit = leesKleurenergieen(PROFIEL_2024);
  assert.ok(uit, "er is niets gevonden");
  assert.deepEqual(uit.waarden, { blauw: 1.28, groen: 4.28, geel: 4.4, rood: 4.68 });
  assert.equal(uit.eenheid, "schaal");
});

test("de kleurenergieën worden ook met komma's gelezen (2021)", () => {
  const uit = leesKleurenergieen(PROFIEL_2021);
  assert.ok(uit);
  assert.deepEqual(uit.waarden, { blauw: 4.88, groen: 3.6, geel: 2.28, rood: 2.64 });
});

test("alleen de bewuste persona telt, niet de minder bewuste", () => {
  const uit = leesKleurenergieen(PROFIEL_2024);
  // De minder bewuste waarden staan op dezelfde regel; die van geel is 4.72.
  assert.notEqual(uit.waarden.geel, 4.72);
});

test("de volgorde van de kleuren komt uit de kopregel", () => {
  const omgedraaid = PROFIEL_2024
    .replace("BLAUW GROEN GEEL ROOD BLAUW GROEN GEEL ROOD", "ROOD GEEL GROEN BLAUW ROOD GEEL GROEN BLAUW");
  const uit = leesKleurenergieen(omgedraaid);
  assert.equal(uit.waarden.rood, 1.28);
  assert.equal(uit.waarden.blauw, 4.68);
});

test("de aslabels van de grafiek worden niet voor waarden aangezien", () => {
  const uit = leesKleurenergieen(PROFIEL_2021);
  assert.notEqual(uit.waarden.blauw, 6);
  assert.notEqual(uit.waarden.blauw, 0);
});

test("zonder kleurendynamica komt er niets terug", () => {
  assert.equal(leesKleurenergieen(PROFIEL_ZONDER_ALLES), null);
});

/* --------------------------------------------------------------- wielpositie */

test("de bewuste wielpositie wordt gelezen, niet de minder bewuste", () => {
  const uit = leesWielpositie(PROFIEL_2024);
  assert.equal(uit.positie, 44);
  assert.equal(uit.typenaam, "Directieve Motivator");
  assert.equal(uit.stijl, "Accommoderend");
});

test("een typenaam levert een voorkeurskleur en een tweede kleur op", () => {
  assert.deepEqual(
    { ...kleurenUitTypenaam("Directieve Motivator") },
    { hoofdtype: "motivator", leunt: "beslisser", voorkeurskleur: "rood", tweedeKleur: "geel" }
  );
  assert.deepEqual(
    { ...kleurenUitTypenaam("Coördinerende Observator") },
    { hoofdtype: "observator", leunt: "coordinator", voorkeurskleur: "blauw", tweedeKleur: "groen" }
  );
  assert.deepEqual(
    { ...kleurenUitTypenaam("Inspirerende Motivator") },
    { hoofdtype: "motivator", leunt: "inspirator", voorkeurskleur: "geel", tweedeKleur: "rood" }
  );
});

test("een typenaam zonder bijvoeglijk naamwoord werkt ook", () => {
  const uit = kleurenUitTypenaam("Observator");
  assert.equal(uit.voorkeurskleur, "blauw");
  assert.equal(uit.tweedeKleur, null);
});

test("elk basistype verwijst naar bestaande kleuren", () => {
  assert.equal(BASISTYPEN.length, 8);
  BASISTYPEN.forEach((t) => {
    assert.ok(t.kleuren.length >= 1 && t.kleuren.length <= 2, `${t.id} heeft een rare kleurenlijst`);
    t.kleuren.forEach((k) => assert.ok(KLEUR_IDS.includes(k), `${t.id} noemt onbekende kleur ${k}`));
  });
});

test("onzin levert geen type op", () => {
  assert.equal(kleurenUitTypenaam("Vrolijke Wandelaar"), null);
  assert.equal(leesWielpositie(PROFIEL_ZONDER_ALLES), null);
});

/* ------------------------------------------------------------ profielteksten */

test("de opsommingspunten per sectie worden gelezen (2024)", () => {
  const teksten = leesProfielteksten(PROFIEL_2024);
  assert.deepEqual(Object.keys(teksten).sort(), ["aanspreken", "bereiken", "energie", "van-jou"]);
  assert.equal(teksten.energie.length, 3);
  assert.match(teksten.bereiken[0], /^Praat over/);
});

test("de opsommingspunten worden ook op één regel gelezen (2021)", () => {
  const teksten = leesProfielteksten(PROFIEL_2021);
  assert.equal(teksten.energie.length, 2);
  assert.equal(teksten.energie[0], "Werkt nauwkeurig en denkt vooruit.");
});

test("elke sectie hoort bij een bestaand stukje handleiding", () => {
  Object.keys(leesProfielteksten(PROFIEL_2024)).forEach((s) =>
    assert.ok(SECTIE_IDS.includes(s), `onbekende sectie ${s}`)
  );
});

test("een sectie loopt niet door in de volgende", () => {
  const teksten = leesProfielteksten(PROFIEL_2024);
  assert.ok(!teksten.energie.some((p) => /Praat over/.test(p)));
});

test("de inhoudsopgave levert geen secties op", () => {
  const metInhoudsopgave = `Waarde voor het team\nEffectieve communicatie\n${PROFIEL_2024}`;
  const teksten = leesProfielteksten(metInhoudsopgave);
  assert.equal(teksten.energie.length, 3);
});

/* ------------------------------------------------------------- alles samen */

test("een volledig profiel geeft hoge zekerheid en kloppende kleuren", () => {
  const uit = leesInsightsTekst(PROFIEL_2024);
  assert.equal(uit.zekerheid, "hoog");
  assert.equal(uit.voorkeurskleur, "rood");
  assert.equal(uit.tweedeKleur, "geel");
  assert.equal(uit.wiel.positie, 44);
  assert.equal(uit.gemist.length, 0);
});

test("de kleurendynamica en de wielpositie bevestigen elkaar", () => {
  [PROFIEL_2024, PROFIEL_2021].forEach((tekst) => {
    const uit = leesInsightsTekst(tekst);
    assert.equal(uit.voorkeurskleur, uit.wiel.voorkeurskleur, "voorkeurskleur wijkt af van het wieltype");
    assert.equal(uit.tweedeKleur, uit.wiel.tweedeKleur, "tweede kleur wijkt af van het wieltype");
  });
});

test("zonder waarden valt het terug op de wielpositie", () => {
  const zonderWaarden = PROFIEL_2024.replace("1.28 4.28 4.40 4.68 1.60 1.32 4.72 1.72", "")
    .replace("21% 71% 73% 78% 27% 22% 79% 29%", "");
  const uit = leesInsightsTekst(zonderWaarden);
  assert.equal(uit.zekerheid, "matig");
  assert.equal(uit.voorkeurskleur, "rood");
  assert.ok(uit.gemist.includes("de waarden van de kleurenergieën"));
});

test("zonder herkenbare inhoud wordt dat eerlijk gemeld", () => {
  const uit = leesInsightsTekst(PROFIEL_ZONDER_ALLES);
  assert.equal(uit.zekerheid, "geen");
  assert.equal(uit.voorkeurskleur, null);
  assert.ok(uit.gemist.length >= 2);
});

test("het uitlezen is deterministisch", () => {
  assert.deepEqual(leesInsightsTekst(PROFIEL_2024), leesInsightsTekst(PROFIEL_2024));
});

test("wat eruit komt past op de kenmerken van de app", () => {
  [PROFIEL_2024, PROFIEL_2021].forEach((tekst) => {
    const uit = leesInsightsTekst(tekst);
    const kenmerken = kenmerkenUitInsights(uit);
    assert.equal(kenmerken.length, 12);
    kenmerken.forEach((k) => {
      assert.equal(k.bron, "insights_discovery");
      assert.ok(optieVan(k.kenmerkId, k.waarde), `${k.kenmerkId}/${k.waarde} bestaat niet`);
    });
  });
});

/* ---------------------------------------------------------------- diagnose */

test("de diagnoseregels tonen alleen regels met een kleurnaam of wielpositie", () => {
  const regels = diagnoseregels(PROFIEL_2024);
  assert.ok(regels.length >= 2);
  regels.forEach((r) => assert.match(r, /blauw|groen|geel|rood|blue|green|yellow|red|wielpositie/i));
});

test("naarRegels haalt harde spaties, dubbele spaties en lege regels weg", () => {
  assert.deepEqual(naarRegels("BLAUW   GROEN\n\n  GEEL "), ["BLAUW GROEN", "GEEL"]);
});
