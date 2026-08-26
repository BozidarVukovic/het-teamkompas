#!/usr/bin/env node
// Validatie van de teamdag-generator. Draait mee in `npm run build` en breekt
// de build bij een fout. Waarschuwingen worden alleen gemeld.
//
// Gecontroleerd wordt onder meer: ontbrekende of onlogische tijdsduur,
// verwijzingen naar niet-bestaande werkvormen of downloads, blokken die bij
// geen enkele groepsgrootte werken, programma's die niet binnen de tijd passen,
// ontbrekende opening, afsluiting of borging, dubbele onderdelen en stellige
// formuleringen die we niet gebruiken.

import { BLOKKEN, FASE_VOLGORDE, KADER_IDS } from "../src/data/teamdag/blokken.js";
import { SPOREN } from "../src/data/teamdag/sporen.js";
import {
  AANLEIDINGEN,
  RESULTATEN,
  TEAMTYPES,
  TEAMGROOTTES,
  TIJDSOPTIES,
  SETTINGS,
  WERKWIJZEN,
  ERVARING,
  OPVOLGING,
  VEILIGHEIDSVRAGEN,
  ROLLEN,
  VRAGEN,
} from "../src/data/teamdag/vragen.js";
import { TAALREGELS_NIET } from "../src/data/teamdag/teksten.js";
import { steltProgrammaSamen, controleerAanpassing } from "../src/lib/teamdag/programma.js";
import { BASIS_ITEMS } from "../src/data/kennisbank/items.js";

const fouten = [];
const waarschuwingen = [];
const fout = (m) => fouten.push(m);
const waarschuw = (m) => waarschuwingen.push(m);

const blokIds = new Set(BLOKKEN.map((b) => b.id));
const aanleidingIds = new Set(AANLEIDINGEN.map((a) => a.id));
const doelIds = new Set(RESULTATEN.map((r) => r.blokDoel));
const teamtypeIds = new Set(TEAMTYPES.map((t) => t.id));
const werkwijzeIds = new Set(WERKWIJZEN.map((w) => w.id));
const settingIds = new Set(SETTINGS.map((s) => s.id));

// Alle interne paden die de kennisbank aanbiedt, plus de vaste pagina's van de site.
const kennisbankPaden = new Set();
BASIS_ITEMS.forEach((item) => {
  if (item.slug && item.type) kennisbankPaden.add(`/kennisbank/${item.type}/${item.slug}`);
  if (item.bestand) kennisbankPaden.add(item.bestand);
});
const VASTE_PAGINAS = new Set([
  "/teamscan",
  "/gratis-teamscan",
  "/teamdag",
  "/teamdag-generator",
  "/gespreksvoorbereider",
  "/kennisbank",
  "/kleine-experimenten",
  "/sociale-veiligheid",
  "/psychologische-veiligheid",
  "/boven-en-onderstroom",
  "/brein-en-samenwerking",
  "/contact",
  "/kennis/teamenergie",
  "/kennis/teamcultuur",
  "/kennis/eigenaarschap-in-teams",
  "/kennis/verandermanagement",
  "/kennis/impact-van-een-teamdag",
  "/kennis/bevlogenheid-in-het-werk",
]);

const padBestaat = (pad) => kennisbankPaden.has(pad) || VASTE_PAGINAS.has(pad);

// 1. Blokken: velden, tijden, groepsgrootte, verwijzingen.
const gezien = new Set();
BLOKKEN.forEach((b) => {
  if (gezien.has(b.id)) fout(`Dubbel blok-id: ${b.id}`);
  gezien.add(b.id);

  ["titel", "doel", "fase", "begeleider", "valkuilen", "opbrengst"].forEach((veld) => {
    if (!b[veld] || String(b[veld]).trim() === "") fout(`${b.id}: veld "${veld}" ontbreekt.`);
  });

  if (!FASE_VOLGORDE.includes(b.fase) && b.fase !== "pauze") {
    fout(`${b.id}: onbekende fase "${b.fase}".`);
  }

  if (typeof b.duur !== "number" || b.duur <= 0) fout(`${b.id}: duur ontbreekt of is niet positief.`);
  if (typeof b.minDuur !== "number" || typeof b.maxDuur !== "number") {
    fout(`${b.id}: minDuur of maxDuur ontbreekt.`);
  } else {
    if (b.minDuur > b.duur) fout(`${b.id}: minDuur (${b.minDuur}) is groter dan de duur (${b.duur}).`);
    if (b.maxDuur < b.duur) fout(`${b.id}: maxDuur (${b.maxDuur}) is kleiner dan de duur (${b.duur}).`);
    if (b.duur % 5 !== 0 || b.minDuur % 5 !== 0 || b.maxDuur % 5 !== 0) {
      fout(`${b.id}: tijden moeten veelvouden van vijf minuten zijn.`);
    }
  }

  if (typeof b.minGroep !== "number" || typeof b.maxGroep !== "number" || b.minGroep > b.maxGroep) {
    fout(`${b.id}: groepsgrootte klopt niet (${b.minGroep}–${b.maxGroep}).`);
  }

  if (![1, 2, 3].includes(b.veiligheidMin)) fout(`${b.id}: veiligheidMin moet 1, 2 of 3 zijn.`);
  if (![1, 2, 3].includes(b.niveau)) fout(`${b.id}: niveau moet 1, 2 of 3 zijn.`);

  (b.aanleidingen || []).forEach((a) => {
    if (!aanleidingIds.has(a)) fout(`${b.id}: onbekende aanleiding "${a}".`);
  });
  (b.doelen || []).forEach((d) => {
    if (!doelIds.has(d)) fout(`${b.id}: onbekend doel "${d}".`);
  });
  (b.teamtypen || []).forEach((t) => {
    if (!teamtypeIds.has(t)) fout(`${b.id}: onbekend teamtype "${t}".`);
  });
  (b.werkwijzen || []).forEach((w) => {
    if (!werkwijzeIds.has(w)) fout(`${b.id}: onbekende werkwijze "${w}".`);
  });
  (b.settings || []).forEach((s) => {
    if (!settingIds.has(s)) fout(`${b.id}: onbekende setting "${s}".`);
  });

  if (!Array.isArray(b.stappen) || b.stappen.length === 0) {
    fout(`${b.id}: stapsgewijze instructie ontbreekt.`);
  } else {
    b.stappen.forEach((s, i) => {
      if (!s.titel || !s.tekst) fout(`${b.id}: stap ${i + 1} mist een titel of tekst.`);
    });
  }

  [b.kennisbank, b.download].filter(Boolean).forEach((pad) => {
    if (!padBestaat(pad)) fout(`${b.id}: verwijst naar "${pad}", dat bestaat niet.`);
  });

  // Een blok dat bij geen enkele groepsgrootte werkt, is onbruikbaar.
  const bruikbaar = TEAMGROOTTES.some((g) => b.minGroep <= (g.representatief || g.max) && b.maxGroep >= (g.representatief || g.max));
  if (!bruikbaar) fout(`${b.id}: past bij geen enkele groepsgrootte uit de vragenlijst.`);
});

// 2. Sporen: verwijzen ze naar bestaande blokken?
SPOREN.forEach((s) => {
  if (!s.advies || !s.titel) fout(`Spoor ${s.id}: titel of advies ontbreekt.`);
  const dubbel = s.voorkeur.filter((id, i) => s.voorkeur.indexOf(id) !== i);
  if (dubbel.length) fout(`Spoor ${s.id}: dubbele blokken in de voorkeurslijst: ${dubbel.join(", ")}.`);
  s.voorkeur.forEach((id) => {
    if (!blokIds.has(id)) fout(`Spoor ${s.id}: verwijst naar onbekend blok "${id}".`);
    if (KADER_IDS.includes(id)) {
      waarschuw(`Spoor ${s.id}: "${id}" is een kaderblok en wordt al automatisch geplaatst.`);
    }
  });
});

// Iedere aanleiding en ieder resultaat moet naar een bestaand spoor wijzen.
const spoorIds = new Set(SPOREN.map((s) => s.id));
AANLEIDINGEN.forEach((a) => {
  if (!spoorIds.has(a.spoor)) fout(`Aanleiding ${a.id}: onbekend spoor "${a.spoor}".`);
});
RESULTATEN.forEach((r) => {
  if (!spoorIds.has(r.spoor)) fout(`Resultaat ${r.id}: onbekend spoor "${r.spoor}".`);
});

// 3. Taalgebruik: geen stellige beloften.
const alleTeksten = BLOKKEN.flatMap((b) => [
  b.doel,
  b.begeleider,
  b.valkuilen,
  b.opbrengst,
  ...(b.stappen || []).map((s) => s.tekst),
]).concat(SPOREN.flatMap((s) => [s.advies, ...(s.aandachtspunten || [])]));

alleTeksten.filter(Boolean).forEach((tekst) => {
  const laag = tekst.toLowerCase();
  TAALREGELS_NIET.forEach((verboden) => {
    if (laag.includes(verboden.toLowerCase())) {
      fout(`Verboden formulering gevonden: "${verboden}" in "${tekst.slice(0, 60)}…"`);
    }
  });
});

// 4. Dekking: is er voor iedere combinatie van veiligheidsruimte en
//    groepsgrootte tenminste iets bruikbaars?
[1, 2, 3].forEach((ruimte) => {
  TEAMGROOTTES.forEach((g) => {
    const maat = g.representatief || g.max;
    const aantal = BLOKKEN.filter(
      (b) => !KADER_IDS.includes(b.id) && b.veiligheidMin <= ruimte && b.minGroep <= maat && b.maxGroep >= maat,
    ).length;
    if (aantal === 0) fout(`Geen enkel inhoudelijk blok bij veiligheidsruimte ${ruimte} en groepsgrootte ${g.id}.`);
    else if (aantal < 3) waarschuw(`Weinig keuze (${aantal} blokken) bij veiligheidsruimte ${ruimte} en groepsgrootte ${g.id}.`);
  });
});

// 5. Proefprogramma's: past de tijd, zit er een opening, afsluiting en borging in?
const veiligheidAlles = (waarde) =>
  Object.fromEntries(VEILIGHEIDSVRAGEN.map((v) => [v.id, waarde]));

const veiligBasis = {
  ...veiligheidAlles("nee"),
  "vrij-spreken": "ja",
  "afspraken-vertrouwen": "ja",
};

let proeven = 0;
SPOREN.forEach((s) => {
  const aanleiding = AANLEIDINGEN.find((a) => a.spoor === s.id);
  const resultaat = RESULTATEN.find((r) => r.spoor === s.id);
  TIJDSOPTIES.forEach((t) => {
    TEAMGROOTTES.forEach((g) => {
      SETTINGS.forEach((setting) => {
        const antwoorden = {
          rol: "teamleider",
          teamgrootte: g.id,
          teamtype: "operationeel",
          bestaansduur: "lang",
          afhankelijkheid: "dagelijks",
          aanleidingen: aanleiding ? [aanleiding.id] : [],
          resultaten: resultaat ? [resultaat.id] : [],
          veiligheid: veiligBasis,
          tijd: t.id,
          pauze: "ja",
          setting: setting.id,
          ruimte: "ja",
          aanwezigheid: "iedereen",
          werkwijzen: ["geen"],
          ervaring: "enige",
          opvolging: "dertig-dagen",
        };
        const p = steltProgrammaSamen(antwoorden);
        proeven += 1;

        const som = p.totaal + p.buffer;
        if (som !== t.minuten) {
          fout(`Spoor ${s.id} / ${t.id} / ${g.id} / ${setting.id}: totaal ${som} minuten in plaats van ${t.minuten}.`);
        }
        if (p.buffer < p.minBuffer) {
          fout(`Spoor ${s.id} / ${t.id} / ${g.id} / ${setting.id}: te weinig buffer (${p.buffer}).`);
        }

        const ids = p.onderdelen.map((o) => o.blok.id);
        if (ids[0] !== "kb-welkom-en-doel") fout(`Spoor ${s.id} / ${t.id}: programma begint niet met de opening.`);
        if (ids[ids.length - 1] !== "kb-check-uit") fout(`Spoor ${s.id} / ${t.id}: programma eindigt niet met de afsluiting.`);
        if (!ids.some((id) => id === "kb-afspraken-vastleggen" || id === "kb-experiment-kiezen")) {
          fout(`Spoor ${s.id} / ${t.id}: programma bevat geen borging.`);
        }

        const zonderPauze = p.onderdelen.filter((o) => !o.pauze).map((o) => o.blok.id);
        const dubbel = zonderPauze.filter((id, i) => zonderPauze.indexOf(id) !== i);
        if (dubbel.length) fout(`Spoor ${s.id} / ${t.id} / ${g.id}: dubbel onderdeel ${[...new Set(dubbel)].join(", ")}.`);

        p.onderdelen.forEach((o) => {
          if (o.blok.veiligheidMin > p.oordeel.ruimte) {
            fout(`Spoor ${s.id} / ${t.id}: ${o.blok.id} vraagt meer veiligheid dan beschikbaar.`);
          }
          const maat = g.representatief || g.max;
          if (o.blok.minGroep > maat || o.blok.maxGroep < maat) {
            fout(`Spoor ${s.id} / ${t.id} / ${g.id}: ${o.blok.id} past niet bij de groepsgrootte.`);
          }
          if (!o.blok.settings.includes(setting.id)) {
            fout(`Spoor ${s.id} / ${t.id} / ${setting.id}: ${o.blok.id} past niet bij deze vorm.`);
          }
        });

        if (p.aandachtspunten.length > 5) fout(`Spoor ${s.id} / ${t.id}: meer dan vijf aandachtspunten.`);
        if (p.borging.acties.length > 3) fout(`Spoor ${s.id} / ${t.id}: meer dan drie vervolgacties.`);

        const problemen = controleerAanpassing(p, antwoorden);
        if (problemen.length) {
          fout(`Spoor ${s.id} / ${t.id} / ${g.id} / ${setting.id}: eigen controle geeft bezwaren: ${problemen.join(" ")}`);
        }
      });
    });
  });
});

// 6. Opvolging: leveren alle opvolgingsniveaus een geldig aantal acties op?
OPVOLGING.forEach((o) => {
  if (o.maxActies < 1 || o.maxActies > 3) fout(`Opvolging ${o.id}: maxActies moet tussen 1 en 3 liggen.`);
});
ERVARING.forEach((e) => {
  const bruikbaar = BLOKKEN.filter((b) => !KADER_IDS.includes(b.id) && b.niveau <= e.maxNiveau).length;
  if (bruikbaar === 0) fout(`Ervaring ${e.id}: geen enkel blok op dit niveau.`);
});

console.log(
  `Teamdag-generator gecontroleerd: ${BLOKKEN.length} programmaonderdelen, ${SPOREN.length} sporen, ${proeven} proefprogramma's.`,
);

if (waarschuwingen.length) {
  console.log("\nWaarschuwingen:");
  waarschuwingen.forEach((w) => console.log(`  - ${w}`));
}

if (fouten.length) {
  console.error(`\n${fouten.length} fout${fouten.length === 1 ? "" : "en"} gevonden:`);
  fouten.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log("\nGeen fouten gevonden.");
