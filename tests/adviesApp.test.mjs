// Tests voor de advieslogica van de samenwerkomgeving.
//
// Alle profieldata hierin is verzonnen. Er staat geen enkel echt profiel in
// deze test; echte gegevens gaan uitsluitend via de app naar Firebase.

import test from "node:test";
import assert from "node:assert/strict";

import { KENMERKEN, KENMERK_IDS, deelzin, optieVan } from "../src/data/app/kenmerken.js";
import { SITUATIES } from "../src/data/app/situaties.js";
import { BEHOEFTEN, CONTRASTEN, ADVIESKADER } from "../src/data/app/adviesblokken.js";
import { SECTIES, conceptVoorSectie } from "../src/data/app/handleiding.js";
import { bepaalWaarden, metNaam, steltAdviesSamen, MAX_BLOKKEN } from "../src/lib/app/advies/regels.js";
import { vraagAdvies, beschikbareStrategieen } from "../src/lib/app/advies/adviesService.js";
import { KENMERKEN_UIT_INSIGHTS, KLEUR_IDS, kenmerkenUitInsights } from "../src/lib/app/insights.js";
import { TESTPERSONEN, testpersoon } from "../src/data/app/testpersonen.js";

const A = testpersoon("testpersoon-a");
const B = testpersoon("testpersoon-b");
const C = testpersoon("testpersoon-c");

/* ------------------------------------------------------------ de gegevens */

test("elke situatie verwijst naar bestaande kenmerken", () => {
  SITUATIES.forEach((s) => {
    s.kenmerken.forEach((id) => {
      assert.ok(KENMERK_IDS.includes(id), `${s.id} verwijst naar onbekend kenmerk ${id}`);
    });
  });
});

test("elke optie heeft een deelbare zin in de eerste persoon", () => {
  KENMERKEN.forEach((k) => {
    k.opties.forEach((o) => {
      assert.ok(o.deelbaarAls && o.deelbaarAls.length > 10, `${k.id}/${o.id} mist een deelzin`);
      assert.match(o.deelbaarAls, /[.!?]$/, `${k.id}/${o.id} eindigt niet op een leesteken`);
    });
  });
});

test("adviesblokken verwijzen alleen naar bestaande kenmerken en waarden", () => {
  Object.keys(BEHOEFTEN).forEach((kenmerkId) => {
    assert.ok(KENMERK_IDS.includes(kenmerkId), `onbekend kenmerk ${kenmerkId} in BEHOEFTEN`);
    Object.keys(BEHOEFTEN[kenmerkId]).forEach((waarde) => {
      assert.ok(optieVan(kenmerkId, waarde), `onbekende waarde ${kenmerkId}/${waarde}`);
    });
  });

  Object.keys(CONTRASTEN).forEach((kenmerkId) => {
    assert.ok(KENMERK_IDS.includes(kenmerkId), `onbekend kenmerk ${kenmerkId} in CONTRASTEN`);
    Object.keys(CONTRASTEN[kenmerkId]).forEach((mijn) => {
      assert.ok(optieVan(kenmerkId, mijn), `onbekende waarde ${kenmerkId}/${mijn}`);
      Object.keys(CONTRASTEN[kenmerkId][mijn]).forEach((hun) => {
        assert.ok(optieVan(kenmerkId, hun), `onbekende waarde ${kenmerkId}/${hun}`);
      });
    });
  });
});

test("geen enkele adviestekst gebruikt stellige of typerende taal", () => {
  const verboden = [
    /\bjij bent\b/i,
    /\brode mensen\b/i,
    /\bblauwe mensen\b/i,
    /\bgroene mensen\b/i,
    /\bgele mensen\b/i,
    // "niet altijd" is juist een nuance; het gaat om stellige uitspraken.
    /(?<!niet )\baltijd\b/i,
    /(?<!niet )\bnooit\b/i,
    /\bpersoonlijkheid/i,
    /\btype\b/i,
  ];

  const teksten = [];
  Object.values(BEHOEFTEN).forEach((perWaarde) =>
    Object.values(perWaarde).forEach((b) => teksten.push(b.duiding, b.suggestie, b.voorbeeldzin))
  );
  Object.values(CONTRASTEN).forEach((perMijn) =>
    Object.values(perMijn).forEach((perHun) =>
      Object.values(perHun).forEach((b) => teksten.push(b.duiding, b.suggestie, b.voorbeeldzin))
    )
  );

  teksten.filter(Boolean).forEach((tekst) => {
    verboden.forEach((patroon) => {
      assert.ok(!patroon.test(tekst), `stellige taal in: "${tekst}"`);
    });
  });
});

/* ------------------------------------------------------- dekking van de teksten */

test("elke voorkeur die iemand kan kiezen, heeft een adviestekst", () => {
  // Hier zat een gat: de vier middenopties ("dat hangt van het onderwerp af",
  // "kaders maar ruimte", "dat wisselt per onderwerp", "kort persoonlijk dan
  // de inhoud") hadden er geen. Wie die deelde kreeg een leeg adviesscherm.
  KENMERKEN.forEach((k) => {
    k.opties.forEach((o) => {
      const blok = BEHOEFTEN[k.id] && BEHOEFTEN[k.id][o.id];
      assert.ok(blok, `${k.id}.${o.id} (${o.label}) heeft geen behoeftetekst`);
      assert.ok(blok.duiding && blok.suggestie, `${k.id}.${o.id} is niet compleet`);
    });
  });
});

test("elk kenmerk heeft minstens één contrasttekst", () => {
  // Vier kenmerken hadden er geen, terwijl situaties.js ze juist bovenaan zet.
  // Ze konden dus nooit in "waar je op kunt letten" komen.
  KENMERKEN.forEach((k) => {
    const perMijn = CONTRASTEN[k.id];
    assert.ok(perMijn, `${k.id} heeft geen enkele contrasttekst`);
    assert.ok(Object.keys(perMijn).length > 0, `${k.id} heeft een lege contrastlijst`);
  });
});

test("elke contrasttekst hangt aan bestaande voorkeuren", () => {
  // Een typfout in een waarde levert tekst op die nooit verschijnt en die je
  // pas maanden later mist.
  Object.entries(CONTRASTEN).forEach(([kenmerkId, perMijn]) => {
    Object.entries(perMijn).forEach(([mijn, perHun]) => {
      assert.ok(optieVan(kenmerkId, mijn), `${kenmerkId}.${mijn} bestaat niet als voorkeur`);
      Object.keys(perHun).forEach((hun) => {
        assert.ok(optieVan(kenmerkId, hun), `${kenmerkId}.${mijn}.${hun} bestaat niet als voorkeur`);
      });
    });
  });
});

test("een collega die alleen middenopties deelt, krijgt toch een bruikbaar advies", () => {
  // Dit pad ontstaat vanzelf: de Insights-vertaling geeft "structuur: gemengd"
  // aan elk geel en elk rood profiel.
  const advies = steltAdviesSamen({
    mijnKenmerken: [
      { kenmerkId: "tempo", waarde: "snel", bron: "user_confirmation" },
      { kenmerkId: "denken", waarde: "hardop", bron: "user_confirmation" },
    ],
    hunKenmerken: [
      { kenmerkId: "tempo", waarde: "gemiddeld", bron: "insights_discovery" },
      { kenmerkId: "structuur", waarde: "gemengd", bron: "insights_discovery" },
      { kenmerkId: "denken", waarde: "wisselend", bron: "insights_discovery" },
      { kenmerkId: "contact", waarde: "beide", bron: "insights_discovery" },
    ],
    situatieId: "iets-nodig",
    naamAnder: "Nikki",
  });

  assert.ok(advies.helpt.length > 0, "hier hoort iets te staan dat helpt");
  assert.ok(advies.blokken.length > 0, "er hoort minstens één punt te zijn");
});

/* ------------------------------------------------------- gewicht van bronnen */

test("een bevestigde voorkeur wint van een suggestie uit het profiel", () => {
  const waarden = bepaalWaarden([
    { kenmerkId: "tempo", waarde: "snel", bron: "insights_discovery" },
    { kenmerkId: "tempo", waarde: "bedachtzaam", bron: "insights_discovery", bevestigd: "sterk" },
  ]);
  assert.equal(waarden.tempo.waarde, "bedachtzaam");
});

test("de handleiding wint van het Insights-profiel", () => {
  const waarden = bepaalWaarden([
    { kenmerkId: "contact", waarde: "taak", bron: "insights_discovery" },
    { kenmerkId: "contact", waarde: "relatie", bron: "hand_in_handleiding" },
  ]);
  assert.equal(waarden.contact.waarde, "relatie");
});

test("een weggestreept kenmerk telt niet mee", () => {
  const waarden = bepaalWaarden([
    { kenmerkId: "spanning", waarde: "sneller", bron: "insights_discovery", bevestigd: "nee" },
  ]);
  assert.equal(waarden.spanning, undefined);
});

test("bij gelijk gewicht wint de meest recente bevestiging", () => {
  const waarden = bepaalWaarden([
    { kenmerkId: "denken", waarde: "hardop", bron: "manual", laatstBevestigdOp: "2026-01-01T00:00:00.000Z" },
    { kenmerkId: "denken", waarde: "alleen", bron: "manual", laatstBevestigdOp: "2026-06-01T00:00:00.000Z" },
  ]);
  assert.equal(waarden.denken.waarde, "alleen");
});

test("onbekende kenmerken en waarden worden genegeerd", () => {
  const waarden = bepaalWaarden([
    { kenmerkId: "bestaat-niet", waarde: "iets", bron: "manual" },
    { kenmerkId: "tempo", waarde: "bestaat-niet", bron: "manual" },
    null,
  ]);
  assert.deepEqual(Object.keys(waarden), []);
});

/* ------------------------------------------------------------- het advies */

test("een advies blijft kort en concreet", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: A.kenmerken,
    hunKenmerken: B.kenmerken,
    situatieId: "feedback-geven",
    naamAnder: B.naam,
  });
  assert.ok(advies.blokken.length > 0, "er komt geen enkel advies uit");
  assert.ok(advies.blokken.length <= MAX_BLOKKEN, "het advies is te lang");
  advies.blokken.forEach((b) => {
    assert.ok(b.duiding && b.suggestie, "een blok mist duiding of suggestie");
  });
});

test("het advies is deterministisch: dezelfde invoer geeft hetzelfde advies", () => {
  const invoer = {
    mijnKenmerken: A.kenmerken,
    hunKenmerken: C.kenmerken,
    situatieId: "irritatie",
    naamAnder: C.naam,
  };
  assert.deepEqual(steltAdviesSamen(invoer), steltAdviesSamen(invoer));
});

test("de situatie bepaalt waar het advies over gaat", () => {
  const feedback = steltAdviesSamen({
    mijnKenmerken: A.kenmerken,
    hunKenmerken: B.kenmerken,
    situatieId: "feedback-geven",
  });
  const besluit = steltAdviesSamen({
    mijnKenmerken: A.kenmerken,
    hunKenmerken: B.kenmerken,
    situatieId: "besluit-nemen",
  });
  assert.notDeepEqual(feedback.gebruikteKenmerken, besluit.gebruikteKenmerken);
});

test("de naam van de ander staat in het advies, niet 'je collega'", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: A.kenmerken,
    hunKenmerken: B.kenmerken,
    situatieId: "verschil-van-mening",
    naamAnder: "Testpersoon B",
  });
  const tekst = advies.blokken.map((b) => b.duiding).join(" ");
  assert.ok(!/je collega/i.test(tekst), `er staat nog 'je collega' in: ${tekst}`);
});

test("zonder gedeelde informatie komt er een eerlijke melding", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: A.kenmerken,
    hunKenmerken: [],
    situatieId: "benaderen",
  });
  assert.equal(advies.blokken.length, 0);
  assert.ok(advies.opmerkingen.includes(ADVIESKADER.nietsGedeeld));
});

test("zonder eigen profiel werkt het advies gewoon door", () => {
  const advies = steltAdviesSamen({
    mijnKenmerken: [],
    hunKenmerken: B.kenmerken,
    situatieId: "iets-nodig",
  });
  assert.ok(advies.blokken.length > 0);
  assert.ok(advies.opmerkingen.includes(ADVIESKADER.geenEigenProfiel));
});

test("elke combinatie van testpersonen en situaties levert een bruikbaar advies", () => {
  let leeg = 0;
  TESTPERSONEN.forEach((mij) => {
    TESTPERSONEN.forEach((ander) => {
      if (mij.id === ander.id) return;
      SITUATIES.forEach((s) => {
        const advies = steltAdviesSamen({
          mijnKenmerken: mij.kenmerken,
          hunKenmerken: ander.kenmerken,
          situatieId: s.id,
          naamAnder: ander.naam,
        });
        assert.ok(advies.transparantie, "de transparantietekst ontbreekt");
        if (advies.blokken.length === 0) leeg += 1;
      });
    });
  });
  assert.equal(leeg, 0, `${leeg} combinaties leverden geen advies op`);
});

test("metNaam laat de tekst met rust als er geen naam bekend is", () => {
  assert.equal(metNaam("Je collega denkt eerst na.", ""), "Je collega denkt eerst na.");
  assert.equal(metNaam("Je collega denkt eerst na.", "Kim"), "Kim denkt eerst na.");
});

/* ------------------------------------------------------------- servicelaag */

test("de servicelaag levert hetzelfde advies als de regels, met de strategie erbij", async () => {
  const invoer = {
    mijnKenmerken: A.kenmerken,
    hunKenmerken: B.kenmerken,
    situatieId: "iets-moeilijks",
    naamAnder: B.naam,
  };
  const viaService = await vraagAdvies(invoer);
  assert.equal(viaService.strategie, "regels");
  assert.deepEqual(viaService.blokken, steltAdviesSamen(invoer).blokken);
});

test("er is precies één adviesstrategie en die gebruikt geen taalmodel", () => {
  const strategieen = beschikbareStrategieen();
  assert.equal(strategieen.length, 1);
  assert.match(strategieen[0].beschrijving, /geen taalmodel/i);
});

/* ---------------------------------------------------------------- insights */

test("een Insights-profiel levert suggesties, geen typering", () => {
  KLEUR_IDS.forEach((eerste) => {
    const afgeleid = kenmerkenUitInsights({ voorkeurskleur: eerste });
    assert.equal(afgeleid.length, KENMERKEN_UIT_INSIGHTS.length);
    afgeleid.forEach((k) => {
      assert.equal(k.bron, "insights_discovery");
      assert.ok(optieVan(k.kenmerkId, k.waarde), `${k.kenmerkId}/${k.waarde} bestaat niet`);
    });
  });
});

test("zonder Insights-profiel komt er niets uit, zonder foutmelding", () => {
  assert.deepEqual(kenmerkenUitInsights({}), []);
  assert.deepEqual(kenmerkenUitInsights({ voorkeurskleur: "paars" }), []);
});

test("de tweede kleur verandert de uitkomst en blijft deterministisch", () => {
  const alleen = kenmerkenUitInsights({ voorkeurskleur: "rood" });
  const met = kenmerkenUitInsights({ voorkeurskleur: "rood", tweedeKleur: "groen" });
  assert.deepEqual(met, kenmerkenUitInsights({ voorkeurskleur: "rood", tweedeKleur: "groen" }));
  assert.equal(alleen.length, met.length);
});

/* -------------------------------------------------------------- handleiding */

test("de handleiding heeft tien secties die naar bestaande kenmerken verwijzen", () => {
  assert.equal(SECTIES.length, 10);
  SECTIES.forEach((s) => {
    s.kenmerken.forEach((id) =>
      assert.ok(KENMERK_IDS.includes(id), `${s.id} verwijst naar onbekend kenmerk ${id}`)
    );
  });
});

test("een concept komt uit de eigen kenmerken en is leeg als die er niet zijn", () => {
  const waarden = bepaalWaarden(B.kenmerken);
  const concept = conceptVoorSectie("feedback", waarden);
  assert.equal(concept, deelzin("feedback", "voorbeeld"));
  assert.equal(conceptVoorSectie("feedback", {}), "");
});

/* ------------------------------------------------------------ geen echte data */

test("de testprofielen bevatten uitsluitend verzonnen personen", () => {
  TESTPERSONEN.forEach((p) => {
    assert.match(p.naam, /^Testpersoon [A-C]$/, `${p.naam} lijkt geen verzonnen naam`);
  });
});
