// Tests voor advies over twee anderen.
//
// Dit is het enige advies dat over mensen gaat in plaats van met mensen. Daar
// zit het risico: het kan een instrument worden om over iemand te praten in
// plaats van met iemand. De tests bewaken daarom niet de opmaak maar de grens —
// geen oordeel over wie zich moet aanpassen, geen nieuwe interpretatie, en
// alleen wat ze allebei zelf hebben gedeeld.

import test from "node:test";
import assert from "node:assert/strict";

import { steltDuoadviesSamen } from "../src/lib/app/advies/tweeanderen.js";
import { KENMERKEN, deelzin } from "../src/data/app/kenmerken.js";

const w = (id, n) => ({
  kenmerkId: id,
  waarde: KENMERKEN.find((k) => k.id === id).opties[n].id,
  bron: "user_confirmation",
});

const ANOUK = { naam: "Anouk", kenmerken: [w("tempo", 0), w("structuur", 0), w("contact", 0)] };
const YVON = { naam: "Yvon", kenmerken: [w("tempo", 2), w("structuur", 0), w("contact", 1)] };

const duo = (over = {}) =>
  steltDuoadviesSamen({ eerste: ANOUK, tweede: YVON, situatieId: "besluit-nemen", ...over });

/* ------------------------------------------------------------- inhoud */

test("een verschil laat beide kanten zien, allebei met naam", () => {
  const a = duo();
  const tempo = a.verschillen.find((r) => r.kenmerkId === "tempo");
  assert.ok(tempo, "tempo hoort een verschil te zijn");
  assert.deepEqual(tempo.kanten.map((k) => k.naam), ["Anouk", "Yvon"]);
});

test("wat er staat is letterlijk wat ze zelf delen", () => {
  const a = duo();
  const tempo = a.verschillen.find((r) => r.kenmerkId === "tempo");
  assert.equal(tempo.kanten[0].deelt, deelzin("tempo", ANOUK.kenmerken[0].waarde));
  assert.equal(tempo.kanten[1].deelt, deelzin("tempo", YVON.kenmerken[0].waarde));
});

test("een punt waar ze hetzelfde willen staat bij eens, niet bij verschillen", () => {
  const a = duo();
  assert.ok(a.gelijk.some((r) => r.kenmerkId === "structuur"));
  assert.ok(!a.verschillen.some((r) => r.kenmerkId === "structuur"));
});

test("een kenmerk dat maar één van beiden deelde valt weg", () => {
  const a = steltDuoadviesSamen({
    eerste: { naam: "Anouk", kenmerken: [w("tempo", 0), w("feedback", 0)] },
    tweede: { naam: "Yvon", kenmerken: [w("tempo", 2)] },
    situatieId: "besluit-nemen",
  });
  const alles = [...a.verschillen, ...a.gelijk].map((r) => r.kenmerkId);
  assert.ok(!alles.includes("feedback"), "zonder de tweede kant valt er niets te zeggen");
});

/* -------------------------------------------------------------- grens */

test("er staat nergens wie zich moet aanpassen", () => {
  const a = duo();
  const tekst = JSON.stringify(a);
  assert.doesNotMatch(
    tekst,
    /\b(moet zich aanpassen|heeft gelijk|zit fout|zou moeten leren|het probleem is|de lastigste)\b/i
  );
});

test("het advies is aan de vrager, niet aan hen", () => {
  const a = duo();
  assert.match(a.afsluiter, /zelf met dit team hebben gedeeld/);
  assert.match(a.afsluiter, /zegt niet wie er gelijk heeft/);
  assert.match(a.afsluiter, /aan hen allebei voorlegt/);
});

test("beide namen staan er even hard bij", () => {
  const a = duo();
  assert.deepEqual(a.namen, ["Anouk", "Yvon"]);
  a.verschillen.forEach((rij) => {
    assert.equal(rij.kanten.length, 2);
    assert.ok(rij.kanten.every((k) => k.naam));
  });
});

/* ----------------------------------------------------- lege gevallen */

test("delen ze niets over hetzelfde, dan zegt het advies dat", () => {
  const a = steltDuoadviesSamen({
    eerste: { naam: "Anouk", kenmerken: [w("tempo", 0)] },
    tweede: { naam: "Yvon", kenmerken: [w("feedback", 0)] },
    situatieId: "besluit-nemen",
  });
  assert.equal(a.verschillen.length, 0);
  assert.match(a.opmerkingen.join(" "), /nog geen punten gedeeld die over hetzelfde gaan/);
});

test("willen ze overal hetzelfde, dan wijst het advies ergens anders heen", () => {
  const a = steltDuoadviesSamen({
    eerste: { naam: "Anouk", kenmerken: [w("tempo", 0), w("structuur", 0)] },
    tweede: { naam: "Yvon", kenmerken: [w("tempo", 0), w("structuur", 0)] },
    situatieId: "besluit-nemen",
  });
  assert.equal(a.verschillen.length, 0);
  assert.match(a.opmerkingen.join(" "), /ergens anders vandaan/);
});

test("zonder namen blijft het leesbaar", () => {
  const a = steltDuoadviesSamen({
    eerste: { kenmerken: [w("tempo", 0)] },
    tweede: { kenmerken: [w("tempo", 2)] },
    situatieId: "besluit-nemen",
  });
  assert.deepEqual(a.namen, ["de een", "de ander"]);
});

test("zonder invoer klapt het niet om", () => {
  const a = steltDuoadviesSamen();
  assert.equal(a.soort, "duo");
  assert.deepEqual(a.verschillen, []);
});
