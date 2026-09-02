// Tests voor het teambeeld.
//
// Dit scherm laat een heel team in één keer zien, en dat is precies waar deze
// app onbruikbaar kan worden. Zodra er een naam bij een voorkeur staat, of een
// aantal waaruit een meerderheid volgt, wijst het scherm iemand aan als de
// afwijkende. Daar staan hier tests op — niet op de opmaak.

import test from "node:test";
import assert from "node:assert/strict";

import {
  MINIMUM_TEAMBEELD,
  dekkingInEenZin,
  spreidingskaart,
  steltTeambeeldSamen,
} from "../src/lib/app/teambeeld.js";
import { KENMERKEN } from "../src/data/app/kenmerken.js";

const waardeVan = (id, n = 0) => KENMERKEN.find((k) => k.id === id).opties[n].id;
const k = (id, n = 0) => ({ kenmerkId: id, waarde: waardeVan(id, n), bron: "user_confirmation" });

const SNEL = [k("tempo", 0), k("structuur", 0), k("denken", 0)];
const ANDERS = [k("tempo", 1), k("structuur", 0), k("denken", 1)];

const deelnemer = (naam, kenmerken) => ({ naam, kenmerken });

/* ------------------------------------------------- wat er niet uit mag */

test("er staat nergens een naam in het beeld", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("Nikki", SNEL), deelnemer("Eva", ANDERS)],
    mijnKenmerken: SNEL,
  });

  const alles = JSON.stringify(beeld);
  ["Nikki", "Eva", "jij"].forEach((naam) => {
    assert.equal(alles.includes(naam), false, `${naam} hoort niet in het teambeeld te staan`);
  });
});

test("bij een voorkeur staat niet hoeveel mensen hem hebben", () => {
  // Drie keer dezelfde voorkeur en één keer een andere. Zou er een aantal bij
  // staan, dan is er een meerderheid en dus een afwijkende.
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("b", SNEL), deelnemer("c", ANDERS)],
    mijnKenmerken: SNEL,
  });

  const tempo = beeld.uiteen.find((r) => r.kenmerkId === "tempo");
  assert.ok(tempo, "tempo hoort uiteen te lopen");
  tempo.voorkeuren.forEach((v) => {
    assert.deepEqual(Object.keys(v).sort(), ["label", "vraagt"]);
  });
});

/* -------------------------------------------------------- de indeling */

test("een kenmerk waar iedereen hetzelfde wil staat bij gedeeld, niet bij uiteen", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("b", ANDERS)],
    mijnKenmerken: SNEL,
  });

  // structuur is bij alle drie dezelfde waarde.
  assert.ok(beeld.gedeeld.some((r) => r.kenmerkId === "structuur"));
  assert.ok(!beeld.uiteen.some((r) => r.kenmerkId === "structuur"));
  // tempo en denken lopen uiteen.
  assert.ok(beeld.uiteen.some((r) => r.kenmerkId === "tempo"));
});

test("een profiel zonder kenmerken telt niet mee, maar wordt wel geteld", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("stil", [])],
    mijnKenmerken: SNEL,
  });

  assert.equal(beeld.meegeteld, 2);
  assert.equal(beeld.stil, 1);
});

/* ------------------------------------------------------ de begeleider */

test("wie het team begeleidt zit niet in het beeld van dat team", () => {
  const deelnemers = [deelnemer("a", SNEL), deelnemer("b", SNEL)];

  const meedoen = steltTeambeeldSamen({ deelnemers, mijnKenmerken: ANDERS });
  const begeleiden = steltTeambeeldSamen({ deelnemers, mijnKenmerken: ANDERS, ikDoeMee: false });

  assert.ok(meedoen.uiteen.some((r) => r.kenmerkId === "tempo"));
  assert.ok(!begeleiden.uiteen.some((r) => r.kenmerkId === "tempo"));
  assert.equal(begeleiden.meegeteld, 2);
});

/* ---------------------------------------------------------- te weinig */

test("onder de twee profielen is er niets te zien", () => {
  const alleen = steltTeambeeldSamen({ deelnemers: [], mijnKenmerken: SNEL });
  assert.equal(alleen.genoeg, false);
  assert.equal(alleen.meegeteld, 1);

  const leeg = steltTeambeeldSamen({});
  assert.equal(leeg.genoeg, false);
  assert.equal(leeg.meegeteld, 0);

  const twee = steltTeambeeldSamen({ deelnemers: [deelnemer("a", SNEL)], mijnKenmerken: ANDERS });
  assert.equal(twee.genoeg, true);
  assert.equal(MINIMUM_TEAMBEELD, 2);
});

/* ------------------------------------------------------------ dekking */

test("de dekkingszin zegt eerlijk hoeveel het beeld waard is", () => {
  assert.match(dekkingInEenZin({ meegeteld: 0, stil: 3 }), /nog niets te zien/);
  assert.match(dekkingInEenZin({ meegeteld: 1, stil: 2 }), /pas vanaf twee/);
  assert.match(dekkingInEenZin({ meegeteld: 9, stil: 0 }), /alle 9 mensen/);
  assert.match(dekkingInEenZin({ meegeteld: 3, stil: 6 }), /3 van de 9/);
});

/* --------------------------------------------------- de spreidingskaart */

// Het plaatje is de plek waar één verkeerd getal het hele scherm onbruikbaar
// maakt. Een gevuld vakje betekent "deze voorkeur zit in dit team" — nooit
// hoeveel mensen hem hebben, want dan lees je in één oogopslag wie de
// afwijkende is.

test("de kaart toont alle voorkeuren van een kenmerk, aanwezig én afwezig", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("b", ANDERS)],
    mijnKenmerken: SNEL,
  });
  const kaart = spreidingskaart(beeld);

  const tempo = kaart.find((r) => r.kenmerkId === "tempo");
  const alleOpties = KENMERKEN.find((k) => k.id === "tempo").opties;
  assert.equal(tempo.opties.length, alleOpties.length);
  assert.equal(tempo.van, alleOpties.length);
  assert.equal(tempo.aanwezig, 2);
  assert.equal(tempo.opties.filter((o) => o.aanwezig).length, 2);
});

test("een vakje zegt of een voorkeur voorkomt, niet hoe vaak", () => {
  // Drie mensen met dezelfde voorkeur en één met een andere. Zou er ergens een
  // aantal staan, dan is er een meerderheid en dus een afwijkende.
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("b", SNEL), deelnemer("c", ANDERS)],
    mijnKenmerken: SNEL,
  });
  const tempo = spreidingskaart(beeld).find((r) => r.kenmerkId === "tempo");

  tempo.opties.forEach((o) => {
    assert.deepEqual(Object.keys(o).sort(), ["aanwezig", "label", "waarde"]);
    assert.equal(typeof o.aanwezig, "boolean");
  });
  // Twee voorkeuren aanwezig, ongeacht dat er drie mensen op de ene zitten.
  assert.equal(tempo.aanwezig, 2);
});

test("de kaart staat van breed naar smal", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("a", SNEL), deelnemer("b", ANDERS)],
    mijnKenmerken: SNEL,
  });
  const kaart = spreidingskaart(beeld);

  for (let i = 1; i < kaart.length; i += 1) {
    assert.ok(
      kaart[i - 1].aanwezig >= kaart[i].aanwezig,
      "een bredere rij hoort niet onder een smallere te staan"
    );
  }
});

test("in de kaart staat geen naam", () => {
  const beeld = steltTeambeeldSamen({
    deelnemers: [deelnemer("Nikki", SNEL), deelnemer("Eva", ANDERS)],
    mijnKenmerken: SNEL,
  });
  const alles = JSON.stringify(spreidingskaart(beeld));
  ["Nikki", "Eva", "jij"].forEach((naam) => {
    assert.equal(alles.includes(naam), false, `${naam} hoort niet in de kaart te staan`);
  });
});

test("zonder beeld is er geen kaart", () => {
  assert.deepEqual(spreidingskaart({}), []);
  assert.deepEqual(spreidingskaart(), []);
});
