// Tests voor het persoonlijke scanrapport. Draaien met `npm run test:free-scan`.
//
// Alles wat hier wordt getest is dezelfde code die de website gebruikt: de
// scoreberekening, de grenswaarden, de tekstselectie, de patroonherkenning en
// de keuze van reflectievragen, experimenten en content.

import test from "node:test";
import assert from "node:assert/strict";

import {
  afgerond, berekenDomeinScores, calculateFreeScanResults, kiesAanbeveling, kiesExperimenten,
  kiesPatronen, kiesReflectievragen, naDubbelePunt, naarHonderd, normaliseerDomeinScores,
  stelRapportSamen, toetsPatroon, zoneVoor, zoneFor, MAX_PATRONEN,
} from "../src/lib/freeScanScoring.js";
import {
  FREE_SCAN_QUESTIONS, FREE_SCAN_THEMES, MIN_BEANTWOORD_AANDEEL, REPORT_META, SCORE_MODEL_VERSION, SCORE_ZONES,
} from "../src/data/freeScanConfig.js";
import { COMBINATIEPATRONEN } from "../src/data/freeScanPatterns.js";
import { FREE_SCAN_EXPERIMENTEN } from "../src/data/freeScanAdvies.js";

/** Antwoorden waarmee elk domein exact op de gevraagde waarde uitkomt. */
function metScores(perDomein) {
  const antwoorden = {};
  for (const vraag of FREE_SCAN_QUESTIONS) {
    const waarde = perDomein[vraag.theme];
    if (waarde === undefined) continue;
    antwoorden[vraag.id] = vraag.reverse ? 6 - waarde : waarde;
  }
  return antwoorden;
}
const alleDomeinen = (waarde) => metScores(Object.fromEntries(FREE_SCAN_THEMES.map((t) => [t.id, waarde])));
const domein = (rapport, id) => rapport.themeScores.find((t) => t.id === id);

// ── Grenswaarden ───────────────────────────────────────────────────────────

test("de grenswaarden liggen exact op 2,5 en 3,5", () => {
  assert.equal(zoneVoor(2.49).id, "pattern", "2,49 hoort bij duidelijke ontwikkelbehoefte");
  assert.equal(zoneVoor(2.50).id, "attention", "2,50 hoort bij wisselend of kwetsbaar");
  assert.equal(zoneVoor(3.49).id, "attention", "3,49 hoort bij wisselend of kwetsbaar");
  assert.equal(zoneVoor(3.50).id, "strong", "3,50 hoort bij relatief sterke basis");
});

test("een score onder 2,5 levert de laagste categorie op", () => {
  const rapport = calculateFreeScanResults(alleDomeinen(2));
  assert.ok(rapport.themeScores.every((t) => t.zone.id === "pattern"));
  assert.ok(rapport.themeScores.every((t) => t.tekst === t.teksten.laag));
});

test("een score boven 3,5 levert de hoogste categorie op", () => {
  const rapport = calculateFreeScanResults(alleDomeinen(4));
  assert.ok(rapport.themeScores.every((t) => t.zone.id === "strong"));
  assert.ok(rapport.themeScores.every((t) => t.tekst === t.teksten.hoog));
});

test("de categorie wordt bepaald op de volledige waarde en niet op de afronding", () => {
  // Drie keer 3,5 en één keer 3,4 geeft 3,475: dat wordt getoond als 3,5 maar
  // hoort nog bij de middelste categorie.
  const antwoorden = alleDomeinen(3);
  const veiligheid = FREE_SCAN_QUESTIONS.filter((q) => q.theme === "veiligheid");
  [3.5, 3.5, 3.5, 3.4].forEach((waarde, index) => {
    const vraag = veiligheid[index];
    antwoorden[vraag.id] = vraag.reverse ? 6 - waarde : waarde;
  });
  const t = domein(calculateFreeScanResults(antwoorden), "veiligheid");
  assert.ok(t.gemiddelde < 3.5, "het echte gemiddelde ligt onder 3,5");
  assert.equal(t.getoond, 3.5, "de weergave rondt af naar 3,5");
  assert.equal(t.zone.id, "attention", "de categorie volgt de volledige waarde");
});

test("scores worden getoond op één decimaal", () => {
  assert.equal(afgerond(3.4499), 3.4);
  assert.equal(afgerond(3.45), 3.5);
  assert.equal(afgerond(null), null);
});

test("de oude weergave van 0 tot 100 blijft beschikbaar", () => {
  assert.equal(naarHonderd(1), 0);
  assert.equal(naarHonderd(3), 50);
  assert.equal(naarHonderd(5), 100);
});

// ── Rekenen ────────────────────────────────────────────────────────────────

test("berekent per domein het gemiddelde van de beantwoorde vragen", () => {
  const rapport = calculateFreeScanResults(alleDomeinen(3));
  assert.ok(rapport.themeScores.every((t) => t.gemiddelde === 3));
  assert.equal(rapport.scoreModelVersion, SCORE_MODEL_VERSION);
});

test("draait omgekeerde vragen om, zodat klakkeloos instemmen geen maximale score geeft", () => {
  const omgekeerd = FREE_SCAN_QUESTIONS.filter((q) => q.reverse);
  assert.ok(omgekeerd.length > 0, "er moet minstens één omgekeerde vraag zijn");
  const allesEens = Object.fromEntries(FREE_SCAN_QUESTIONS.map((q) => [q.id, 5]));
  const rapport = calculateFreeScanResults(allesEens);
  for (const thema of new Set(omgekeerd.map((q) => q.theme))) {
    assert.ok(domein(rapport, thema).gemiddelde < 5, `domein ${thema} zou onder 5 moeten blijven`);
  }
});

test("ontbrekende en niet-van-toepassing-antwoorden tellen nooit als nul mee", () => {
  const antwoorden = alleDomeinen(4);
  antwoorden.v1 = "nvt";
  const rapport = calculateFreeScanResults(antwoorden);
  const veiligheid = domein(rapport, "veiligheid");
  assert.equal(veiligheid.answered, 3);
  assert.equal(veiligheid.gemiddelde, 4, "het gemiddelde blijft 4 en zakt niet door een nul");
});

test("zonder driekwart van de antwoorden komt er geen domeinscore", () => {
  const antwoorden = alleDomeinen(4);
  delete antwoorden.v1;
  delete antwoorden.v2;
  const rapport = calculateFreeScanResults(antwoorden);
  const veiligheid = domein(rapport, "veiligheid");
  assert.equal(veiligheid.gemiddelde, null, "twee van de vier is minder dan 75 procent");
  assert.equal(veiligheid.voldoendeData, false);
  assert.ok(rapport.onvolledig.includes(veiligheid.label));
  assert.equal(MIN_BEANTWOORD_AANDEEL, 0.75);
});

test("precies driekwart beantwoord levert wel een score op", () => {
  const antwoorden = alleDomeinen(4);
  delete antwoorden.v1;
  assert.equal(domein(calculateFreeScanResults(antwoorden), "veiligheid").gemiddelde, 4);
});

test("een domein zonder score doet niet mee aan sterke punten of ontwikkelkans", () => {
  const antwoorden = alleDomeinen(3);
  ["v1", "v2", "v3", "v4"].forEach((id) => delete antwoorden[id]);
  const rapport = calculateFreeScanResults(antwoorden);
  assert.equal(rapport.meetbaar, FREE_SCAN_THEMES.length - 1);
  assert.ok(!rapport.strengths.some((t) => t.id === "veiligheid"));
  assert.notEqual(rapport.ontwikkelkans.id, "veiligheid");
});

// ── Sterke punten en ontwikkelkans ─────────────────────────────────────────

test("toont twee sterke punten en één ontwikkelkans", () => {
  const rapport = calculateFreeScanResults(metScores({
    veiligheid: 2, communicatie: 3, eigenaarschap: 3.5, verbinding: 5, energie: 3, leiderschap: 4,
  }));
  assert.equal(rapport.strengths.length, 2);
  assert.deepEqual(rapport.strengths.map((t) => t.id), ["verbinding", "leiderschap"]);
  assert.equal(rapport.ontwikkelkans.id, "veiligheid");
});

test("zonder score van 3,5 of hoger heet het geen sterke basis", () => {
  const laag = calculateFreeScanResults(alleDomeinen(3));
  assert.match(laag.sterkeKop, /relatief sterkste/i);
  const hoog = calculateFreeScanResults(alleDomeinen(4));
  assert.match(hoog.sterkeKop, /sterke basis/i);
});

test("scoort alles goed, dan heet de laagste score een volgende ontwikkelkans", () => {
  const hoog = calculateFreeScanResults(alleDomeinen(4));
  assert.match(hoog.ontwikkelkansKop, /volgende ontwikkelkans/i);
  const gemengd = calculateFreeScanResults(metScores({
    veiligheid: 2, communicatie: 4, eigenaarschap: 4, verbinding: 4, energie: 4, leiderschap: 4,
  }));
  assert.match(gemengd.ontwikkelkansKop, /belangrijkste ontwikkelkans/i);
});

test("bij gelijke hoogste en laagste scores is de ontwikkelkans nooit ook een sterk punt", () => {
  const rapport = calculateFreeScanResults(alleDomeinen(3));
  assert.equal(rapport.gelijkmatig, true);
  assert.equal(rapport.spreiding, 0);
  assert.ok(
    !rapport.strengths.some((t) => t.id === rapport.ontwikkelkans.id),
    "hetzelfde domein zou niet tegelijk sterk punt en ontwikkelkans mogen zijn"
  );
});

// ── Combinatiepatronen ─────────────────────────────────────────────────────

test("er zijn tussen de vijftien en vijfentwintig patronen, allemaal met unieke id", () => {
  assert.ok(COMBINATIEPATRONEN.length >= 15 && COMBINATIEPATRONEN.length <= 25);
  assert.equal(new Set(COMBINATIEPATRONEN.map((p) => p.id)).size, COMBINATIEPATRONEN.length);
});

test("elk patroon heeft de volledige vastlegging", () => {
  const themaIds = new Set(FREE_SCAN_THEMES.map((t) => t.id));
  const experimentIds = new Set(FREE_SCAN_EXPERIMENTEN.map((e) => e.id));
  for (const patroon of COMBINATIEPATRONEN) {
    assert.ok(patroon.titel, `titel ontbreekt bij ${patroon.id}`);
    assert.ok(patroon.duiding && patroon.duiding.length > 60, `duiding te kort bij ${patroon.id}`);
    assert.ok(patroon.reflectievraag, `reflectievraag ontbreekt bij ${patroon.id}`);
    assert.equal(typeof patroon.prioriteit, "number", `prioriteit ontbreekt bij ${patroon.id}`);
    assert.ok(patroon.voorwaarden.length > 0, `scorevoorwaarden ontbreken bij ${patroon.id}`);
    patroon.voorwaarden.forEach((v) => assert.ok(themaIds.has(v.domein), `onbekende patroonvariabele ${v.domein} bij ${patroon.id}`));
    if (patroon.experiment) assert.ok(experimentIds.has(patroon.experiment), `onbekend experiment bij ${patroon.id}`);
    (patroon.sluitUit || []).forEach((id) => {
      assert.ok(COMBINATIEPATRONEN.some((p) => p.id === id), `${patroon.id} sluit een onbekend patroon uit: ${id}`);
    });
  }
});

test("elk patroon kan daadwerkelijk vuren bij een passende invoer", () => {
  for (const patroon of COMBINATIEPATRONEN) {
    const perDomein = Object.fromEntries(FREE_SCAN_THEMES.map((t) => [t.id, 3]));
    patroon.voorwaarden.forEach((v) => {
      if (v.min !== undefined && v.max !== undefined) perDomein[v.domein] = (v.min + v.max) / 2;
      else if (v.min !== undefined) perDomein[v.domein] = Math.max(v.min, 4.5);
      else perDomein[v.domein] = Math.min(v.max, 1.5);
    });
    const domeinen = berekenDomeinScores(metScores(perDomein));
    assert.ok(toetsPatroon(patroon, domeinen), `${patroon.id} vuurt niet bij een passende invoer`);
  }
});

test("een patroon vuurt niet wanneer een benodigde score ontbreekt", () => {
  const patroon = COMBINATIEPATRONEN.find((p) => p.voorwaarden.length === 2);
  const domeinen = berekenDomeinScores(metScores({ [patroon.voorwaarden[0].domein]: 5 }));
  assert.equal(toetsPatroon(patroon, domeinen), null);
});

test("er worden nooit meer dan twee patronen getoond", () => {
  const veelPatronen = calculateFreeScanResults(metScores({
    veiligheid: 5, communicatie: 1, eigenaarschap: 1, verbinding: 5, energie: 1, leiderschap: 5,
  }));
  const kandidaten = COMBINATIEPATRONEN
    .map((p) => toetsPatroon(p, veelPatronen.themeScores))
    .filter(Boolean);
  assert.ok(kandidaten.length > 2, "voor deze test moeten er meer dan twee patronen passen");
  assert.equal(veelPatronen.patterns.length, MAX_PATRONEN);
});

test("uitsluitingsregels voorkomen dat twee patronen hetzelfde zeggen", () => {
  const domeinen = berekenDomeinScores(metScores({
    veiligheid: 1.5, communicatie: 1.5, eigenaarschap: 1.5, verbinding: 3, energie: 3, leiderschap: 3,
  }));
  const gekozen = kiesPatronen(domeinen, domeinen.find((d) => d.id === "veiligheid"), 5);
  for (const patroon of gekozen) {
    for (const ander of gekozen) {
      if (patroon.id === ander.id) continue;
      assert.ok(!(patroon.sluitUit || []).includes(ander.id), `${patroon.id} en ${ander.id} sluiten elkaar uit`);
    }
  }
});

test("de patroonselectie is deterministisch", () => {
  const antwoorden = metScores({ veiligheid: 5, communicatie: 2, eigenaarschap: 2, verbinding: 5, energie: 2, leiderschap: 4 });
  const eerste = calculateFreeScanResults(antwoorden).patterns.map((p) => p.id);
  const tweede = calculateFreeScanResults(antwoorden).patterns.map((p) => p.id);
  assert.deepEqual(eerste, tweede);
});

// ── Reflectievragen, experimenten en content ───────────────────────────────

test("elk rapport toont drie verschillende reflectievragen", () => {
  for (const waarde of [1, 2, 3, 4, 5]) {
    const rapport = calculateFreeScanResults(alleDomeinen(waarde));
    assert.equal(rapport.reflections.length, 3, `bij score ${waarde}`);
    assert.equal(new Set(rapport.reflections).size, 3, `dubbele vraag bij score ${waarde}`);
  }
});

test("de derde reflectievraag gaat over de eigen bijdrage", () => {
  const rapport = calculateFreeScanResults(metScores({
    veiligheid: 2, communicatie: 4, eigenaarschap: 4, verbinding: 4, energie: 4, leiderschap: 4,
  }));
  assert.match(rapport.reflections[2], /jij|jou|je zelf|jezelf/i);
});

test("elk rapport toont één persoonlijk en één gezamenlijk experiment", () => {
  for (const thema of FREE_SCAN_THEMES) {
    const perDomein = Object.fromEntries(FREE_SCAN_THEMES.map((t) => [t.id, 4]));
    perDomein[thema.id] = 1.5;
    const rapport = calculateFreeScanResults(metScores(perDomein));
    assert.equal(rapport.experiments.length, 2, `bij laagste domein ${thema.id}`);
    assert.deepEqual(rapport.experiments.map((e) => e.soort).sort(), ["gesprek", "persoonlijk"]);
    rapport.experiments.forEach((exp) => {
      assert.ok(exp.themas.includes(thema.id), `${exp.id} past niet bij ${thema.id}`);
      ["titel", "uitleg", "tijd", "looptijd", "eersteStap", "href"].forEach((veld) => {
        assert.ok(exp[veld], `${exp.id} mist ${veld}`);
      });
    });
  }
});

test("een patroonexperiment krijgt voorrang boven het standaardexperiment", () => {
  const rapport = calculateFreeScanResults(metScores({
    veiligheid: 1.5, communicatie: 3, eigenaarschap: 3, verbinding: 5, energie: 3, leiderschap: 3,
  }));
  const patroonExperimenten = rapport.patterns.map((p) => p.experiment);
  assert.ok(patroonExperimenten.length > 0, "voor deze test moet er een patroon vuren");
  assert.ok(
    rapport.experiments.some((e) => patroonExperimenten.includes(e.id)),
    "het experiment bij het patroon hoort te worden gekozen"
  );
});

test("elk rapport verwijst naar een bestaand artikel of hulpmiddel met een reden", () => {
  for (const thema of FREE_SCAN_THEMES) {
    const aanbeveling = kiesAanbeveling({ id: thema.id, label: thema.label }, []);
    assert.ok(aanbeveling, `geen aanbeveling voor ${thema.id}`);
    assert.ok(aanbeveling.href.startsWith("/"), `aanbeveling voor ${thema.id} heeft geen intern pad`);
    assert.ok(aanbeveling.reden.length > 30, `reden te kort bij ${thema.id}`);
  }
});

test("de reden verwijst naar het patroon zodra er een patroon is", () => {
  const laagste = { id: "veiligheid", label: "Psychologische veiligheid" };
  const zonder = kiesAanbeveling(laagste, []);
  const met = kiesAanbeveling(laagste, [COMBINATIEPATRONEN[0]]);
  assert.match(zonder.reden, /domein/i);
  assert.match(met.reden, /patroon/i);
});

// ── Taal en weergave ───────────────────────────────────────────────────────

test("na een dubbele punt begint het eerste woord met een kleine letter", () => {
  assert.equal(naDubbelePunt("Je antwoorden suggereren dat…"), "je antwoorden suggereren dat…");
  assert.equal(naDubbelePunt("HR-beleid blijft staan"), "HR-beleid blijft staan");
  assert.equal(naDubbelePunt(""), "");
});

test("de teksten vermijden stellige uitspraken over het team", () => {
  const verboden = [/jouw team is onveilig/i, /jij hebt te weinig/i, /dit is de oorzaak/i, /de scan bewijst/i];
  const teksten = [
    ...FREE_SCAN_THEMES.flatMap((t) => Object.values(t.teksten)),
    ...COMBINATIEPATRONEN.map((p) => p.duiding),
  ];
  for (const tekst of teksten) {
    for (const patroon of verboden) {
      assert.equal(patroon.test(tekst), false, `stellige formulering: ${tekst.slice(0, 60)}`);
    }
  }
});

test("elk domein heeft drie tekstblokken, één per scorecategorie", () => {
  for (const thema of FREE_SCAN_THEMES) {
    assert.ok(thema.teksten, `tekstblokken ontbreken bij ${thema.id}`);
    for (const zone of SCORE_ZONES) {
      assert.ok(thema.teksten[zone.tekstSleutel], `${thema.id} mist het blok voor ${zone.tekstSleutel}`);
    }
  }
});

test("de methodische toelichting benoemt schaal, afronding en ontbrekende antwoorden", () => {
  const alles = REPORT_META.methode.map(([titel, tekst]) => titel + " " + tekst).join(" ").toLowerCase();
  ["schaal", "gemiddelde", "categorie", "afgerond", "overgeslagen", "patroon"].forEach((woord) => {
    assert.ok(alles.includes(woord), `de toelichting mist iets over ${woord}`);
  });
});

// ── Ouder opgeslagen rapport ───────────────────────────────────────────────

test("een ouder rapport zonder gemiddelde blijft leesbaar", () => {
  const oud = FREE_SCAN_THEMES.map((t, index) => ({ id: t.id, label: t.label, score: index === 0 ? 25 : 75, answered: 4 }));
  const rapport = stelRapportSamen(oud);
  assert.equal(domein(rapport, oud[0].id).gemiddelde, 2, "score 25 komt neer op een gemiddelde van 2");
  assert.equal(domein(rapport, oud[0].id).zone.id, "pattern");
  assert.ok(rapport.reflections.length === 3 && rapport.experiments.length === 2);
});

test("normaliseren vult ontbrekende velden aan zonder de score te veranderen", () => {
  const genormaliseerd = normaliseerDomeinScores([{ id: "veiligheid", gemiddelde: 3.5, answered: 4 }]);
  assert.equal(genormaliseerd[0].zone.id, "strong");
  assert.equal(genormaliseerd[0].getoond, 3.5);
  assert.equal(genormaliseerd[0].score, 63, "een gemiddelde van 3,5 komt neer op 63 op de oude schaal");
  assert.ok(genormaliseerd[0].tekst, "het tekstblok hoort te worden aangevuld");
});

test("de oude naam zoneFor blijft werken", () => {
  assert.equal(zoneFor(4).id, "strong");
});

// ── Hulpfuncties los ───────────────────────────────────────────────────────

test("kiesReflectievragen valt terug wanneer er geen patroon is", () => {
  const domeinen = berekenDomeinScores(alleDomeinen(3));
  const vragen = kiesReflectievragen(domeinen[0], [], domeinen);
  assert.equal(vragen.length, 3);
});

test("kiesExperimenten levert altijd twee soorten, ook zonder ontwikkelkans", () => {
  const experimenten = kiesExperimenten(null, []);
  assert.deepEqual(experimenten.map((e) => e.soort).sort(), ["gesprek", "persoonlijk"]);
});
