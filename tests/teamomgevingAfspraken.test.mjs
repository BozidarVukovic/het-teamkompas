// De afspraken en de volgende stap van een teamomgeving.
//
// Beide worden afgeleid uit wat er al staat: de afspraken uit de genummerde
// lijst die de brontekst met [afspraken] aanwijst, de volgende stap uit de
// eerste halte van de tijdlijn die niet is afgerond. Deze tests gaan vooral
// over wat er NIET mag gebeuren -- een tweede genummerde lijst die ook kaarten
// wordt, of een trekker die uit het niets verschijnt.

import test from "node:test";
import assert from "node:assert/strict";

import {
  heeftAfsprakenplek,
  leesAfspraken,
  leesVolgendeStap,
  onderdeelMetAfspraken,
  volgendeStapUit,
} from "../src/lib/app/teamomgeving.js";

const TEKST = `Vier acties uit juni, afgerond. Drie afspraken uit oktober, als voorstel.

### Werkoverleg nieuwe stijl

Een overlegvorm ontwerpen die energie geeft.

Actieteam: Jacqueline O., Dennis en Irene

### Drie afspraken uit oktober

Bevestig ze in het teamoverleg en zet er per afspraak een eigenaar bij.

[afspraken]

1. Focus en prioriteiten

   Eén zichtbaar overzicht van het belangrijkste werk, met de keuze: nu, later of niet.

   Trekker: nog af te spreken

   We kijken er in het eerstvolgende werkoverleg op terug.

2. Besluiten en escaleren

   Bij nieuw werk bespreken we of het past, wat moet wijken en wie besluit.

3. Afbakening en afstemming

   We verduidelijken welk werk bij B&B hoort.

### Nieuw werk: een korte toets

Vijf vragen voordat we toezeggen.

1. Wat is de vraag en wanneer moet het klaar zijn?

2. Hoort het werk bij ons en past het binnen ons mandaat?

3. Wat verschuift als we dit oppakken?`;

/* ------------------------------------------------------ de markering zelf */

test("zonder markering verandert er niets aan het onderdeel", () => {
  const zonder = TEKST.replace("[afspraken]\n\n", "");
  assert.equal(heeftAfsprakenplek(zonder), false);
  const uit = leesAfspraken(zonder);
  assert.equal(uit.kaarten.length, 0);
  assert.equal(uit.rest, zonder);
});

test("een onderdeel zonder tekst levert geen kaarten op", () => {
  assert.deepEqual(leesAfspraken(undefined), { kaarten: [], rest: "" });
  assert.equal(heeftAfsprakenplek(null), false);
});

/* ------------------------------------------------------------ de kaarten */

test("alleen de lijst achter de markering wordt een kaart", () => {
  const { kaarten } = leesAfspraken(TEKST);
  assert.equal(kaarten.length, 3, "de vijf vragen van de toets horen er niet bij");
  assert.deepEqual(kaarten.map((k) => k.titel), [
    "Focus en prioriteiten",
    "Besluiten en escaleren",
    "Afbakening en afstemming",
  ]);
});

test("elke kaart heeft één zin over wat het team doet", () => {
  const { kaarten } = leesAfspraken(TEKST);
  kaarten.forEach((k) => {
    assert.ok(k.samenvatting, `${k.titel}: geen samenvatting`);
    assert.doesNotMatch(k.samenvatting, /^\d/, `${k.titel}: het nummer hoort er niet in`);
  });
  assert.match(kaarten[1].samenvatting, /^Bij nieuw werk/);
});

test("een trekker komt alleen op de kaart als hij is opgeschreven", () => {
  const { kaarten } = leesAfspraken(TEKST);
  assert.equal(kaarten[0].trekker, "nog af te spreken");
  assert.equal(kaarten[1].trekker, "", "hier staat niets, dus hoort er niets te staan");
  assert.equal(kaarten[2].trekker, "");
});

test("wat na de samenvatting staat gaat naar de toelichting", () => {
  const { kaarten } = leesAfspraken(TEKST);
  assert.match(kaarten[0].toelichting, /eerstvolgende werkoverleg/);
  assert.equal(kaarten[1].toelichting, "", "zonder extra alinea blijft de uitklap leeg");
});

test("de rest van het onderdeel blijft volledig bewaard", () => {
  const { rest } = leesAfspraken(TEKST);
  assert.match(rest, /Werkoverleg nieuwe stijl/, "de geschiedenis hoort niet te verdwijnen");
  assert.match(rest, /Nieuw werk: een korte toets/);
  assert.match(rest, /Vijf vragen voordat we toezeggen/);
  assert.doesNotMatch(rest, /\[afspraken\]/, "de markering zelf hoort niet op het scherm");
  assert.doesNotMatch(rest, /Focus en prioriteiten/, "die staat nu op een kaart en niet dubbel");
});

test("een markering zonder lijst erachter laat de tekst met rust", () => {
  const tekst = "Hier komen de afspraken.\n\n[afspraken]\n\n### Iets anders\n\nTekst.";
  const uit = leesAfspraken(tekst);
  assert.equal(uit.kaarten.length, 0);
  assert.equal(uit.rest, tekst, "liever niets dan een halve kaart");
});

test("het juiste onderdeel wordt gevonden", () => {
  const inhoud = {
    onderdelen: [
      { id: "overzicht", titel: "Overzicht", tekst: "Geen markering hier." },
      { id: "afspraken", titel: "Onze afspraken", tekst: TEKST },
    ],
  };
  assert.equal(onderdeelMetAfspraken(inhoud, false).id, "afspraken");
  assert.equal(onderdeelMetAfspraken({ onderdelen: [] }, false), null);
});

test("een verborgen onderdeel levert voor het team geen afspraken op", () => {
  const inhoud = { onderdelen: [{ id: "afspraken", titel: "Onze afspraken", tekst: TEKST, verborgen: true }] };
  assert.equal(onderdeelMetAfspraken(inhoud, false), null);
  assert.equal(onderdeelMetAfspraken(inhoud, true).id, "afspraken", "een begeleider ziet hem wel");
});

/* ------------------------------------------------------- de volgende stap */

const HALTES = [
  { wanneer: "4 juni", wat: "Eerste teamdag", stand: "Afgerond", gedaan: true },
  { wanneer: "8 oktober", wat: "Tweede teamdag", stand: "Afgerond", gedaan: true },
  { wanneer: "Begin november", wat: "Eerste pulse", stand: "Gepland", gedaan: false },
  { wanneer: "Begin december", wat: "Bijstellen", stand: "Gepland", gedaan: false },
];

test("de volgende stap is de eerste halte die niet is afgerond", () => {
  const stap = volgendeStapUit(HALTES);
  assert.equal(stap.wanneer, "Begin november");
  assert.equal(stap.wat, "Eerste pulse");
});

test("alles afgerond betekent dat er niets is vastgelegd", () => {
  assert.equal(volgendeStapUit(HALTES.map((h) => ({ ...h, gedaan: true }))), null);
  assert.equal(volgendeStapUit([]), null);
  assert.equal(volgendeStapUit(undefined), null);
});

test("de stap wijst terug naar het onderdeel waar de tijdlijn staat", () => {
  const inhoud = {
    onderdelen: [
      { id: "afspraken", titel: "Onze afspraken", tekst: "Geen tijdlijn." },
      { id: "overzicht", titel: "Overzicht", tekst: "Met lijn.", tijdlijn: HALTES },
    ],
  };
  const stap = leesVolgendeStap(inhoud, false);
  assert.equal(stap.onderdeelId, "overzicht");
  assert.equal(stap.wat, "Eerste pulse");
});

test("zonder tijdlijn is er geen volgende stap", () => {
  assert.equal(leesVolgendeStap({ onderdelen: [{ id: "a", titel: "A", tekst: "x" }] }, false), null);
});
