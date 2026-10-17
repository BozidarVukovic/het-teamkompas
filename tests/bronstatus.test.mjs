// De bronvermelding in het samenwerkingsadvies.
//
// Het advies zei twee dingen tegelijk: onderaan dat een profiel door een
// beheerder was toegevoegd en niet bevestigd, en in dezelfde tekst dat de
// collega het zelf had aangegeven. Deze tests houden die twee uit elkaar.

import test from "node:test";
import assert from "node:assert/strict";

import { isZelfGedeeld, steltAdviesSamen, transparantieVoor } from "../src/lib/app/advies/regels.js";
import { BEHOEFTEN, CONTRASTEN, ADVIESKADER } from "../src/data/app/adviesblokken.js";

/* Een zin die zegt dat de collega zélf iets heeft verteld. */
const ZELFCLAIM = /\b(heeft aangegeven|gaf aan|geeft aan|naar eigen zeggen|zegt zelf)\b/i;

const alleBlokken = () => {
  const uit = [];
  for (const opties of Object.values(BEHOEFTEN)) {
    for (const [waarde, blok] of Object.entries(opties)) uit.push([waarde, blok]);
  }
  for (const opties of Object.values(CONTRASTEN || {})) {
    for (const [waarde, blok] of Object.entries(opties)) if (blok && blok.duiding) uit.push([waarde, blok]);
  }
  return uit;
};

const uitProfiel = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "insights_discovery" });
const zelfGedeeld = (kenmerkId, waarde) => ({ kenmerkId, waarde, bron: "user_confirmation" });

/* --------------------------------------------------- de teksten zelf */

test("elke duiding die een uitspraak claimt, heeft ook een afgeleide formulering", () => {
  alleBlokken().forEach(([waarde, blok]) => {
    if (!ZELFCLAIM.test(blok.duiding)) return;
    assert.ok(
      blok.duidingAfgeleid,
      `"${blok.duiding}" zegt dat de collega dit zelf aangaf, maar er is geen tekst voor een toegevoegd profiel (${waarde})`
    );
  });
});

test("een afgeleide formulering claimt zelf geen uitspraak", () => {
  alleBlokken().forEach(([waarde, blok]) => {
    if (!blok.duidingAfgeleid) return;
    assert.doesNotMatch(blok.duidingAfgeleid, ZELFCLAIM, `${waarde}: de afgeleide tekst claimt alsnog een uitspraak`);
    assert.match(blok.duidingAfgeleid, /profiel/i, `${waarde}: de afgeleide tekst noemt de bron niet`);
  });
});

/* --------------------------------------------------- de bron per kenmerk */

test("een waarde uit een toegevoegd profiel geldt niet als zelf gedeeld", () => {
  assert.equal(isZelfGedeeld({ bron: "insights_discovery" }), false);
  assert.equal(isZelfGedeeld({ bron: "user_confirmation" }), true);
  // Bevestigen weegt zwaarder dan waar de waarde vandaan kwam.
  assert.equal(isZelfGedeeld({ bron: "insights_discovery", bevestigd: "sterk" }), true);
  assert.equal(isZelfGedeeld(null), false);
});

/* --------------------------------------------------- het hele advies */

test("een advies uit een toegevoegd profiel zegt nergens dat de collega het zelf aangaf", () => {
  const a = steltAdviesSamen({
    mijnKenmerken: [zelfGedeeld("tempo", "snel")],
    hunKenmerken: [uitProfiel("tempo", "bedachtzaam"), uitProfiel("context", "veel")],
    situatieId: "bespreekbaar-maken",
    naamAnder: "Anouk",
  });
  a.blokken.forEach((b) => assert.doesNotMatch(b.duiding, ZELFCLAIM, `"${b.duiding}"`));
  assert.equal(a.bronnen.zelfGedeeld, 0);
  assert.ok(a.bronnen.afgeleid > 0);
  assert.equal(a.transparantie, ADVIESKADER.transparantieAfgeleid);
});

test("een advies uit wat de collega zelf deelde, houdt de gewone formulering", () => {
  const a = steltAdviesSamen({
    mijnKenmerken: [zelfGedeeld("tempo", "snel")],
    hunKenmerken: [zelfGedeeld("tempo", "bedachtzaam"), zelfGedeeld("context", "veel")],
    situatieId: "bespreekbaar-maken",
    naamAnder: "Anouk",
  });
  assert.equal(a.bronnen.afgeleid, 0);
  assert.equal(a.transparantie, ADVIESKADER.transparantie);
  assert.ok(a.blokken.length > 0);
});

test("deels zelf gedeeld en deels afgeleid levert de gemengde slotzin", () => {
  const a = steltAdviesSamen({
    mijnKenmerken: [zelfGedeeld("tempo", "snel")],
    hunKenmerken: [zelfGedeeld("tempo", "bedachtzaam"), uitProfiel("context", "veel")],
    situatieId: "bespreekbaar-maken",
    naamAnder: "Anouk",
  });
  if (a.bronnen.zelfGedeeld > 0 && a.bronnen.afgeleid > 0) {
    assert.equal(a.transparantie, ADVIESKADER.transparantieGemengd);
  }
});

test("de slotzin volgt het bewijs en niet een vaste tekst", () => {
  assert.equal(transparantieVoor([]), ADVIESKADER.transparantie);
  assert.equal(transparantieVoor([{ zelfGedeeld: true }]), ADVIESKADER.transparantie);
  assert.equal(transparantieVoor([{ zelfGedeeld: false }]), ADVIESKADER.transparantieAfgeleid);
  assert.equal(
    transparantieVoor([{ zelfGedeeld: true }, { zelfGedeeld: false }]),
    ADVIESKADER.transparantieGemengd
  );
});

test("elk blok draagt zijn eigen bron, want die kan per kenmerk verschillen", () => {
  const a = steltAdviesSamen({
    mijnKenmerken: [],
    hunKenmerken: [zelfGedeeld("tempo", "bedachtzaam"), uitProfiel("structuur", "structuur")],
    situatieId: "benaderen",
    naamAnder: "Anouk",
  });
  a.blokken.forEach((b) => assert.equal(typeof b.zelfGedeeld, "boolean", `${b.kenmerkId} mist zijn bron`));
});
