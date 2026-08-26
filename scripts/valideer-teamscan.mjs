// scripts/valideer-teamscan.mjs
//
// Controleert de inhoud en de regels van het persoonlijke scanrapport vóór elke
// build. Een dode link of een ontbrekend tekstblok is hier goedkoop te
// herstellen en in een verstuurd rapport duur.
//
// Fouten stoppen de build. Waarschuwingen niet.
//
// Draait automatisch mee met `npm run build`, of los met
// `npm run valideer:teamscan`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  FREE_SCAN_QUESTIONS, FREE_SCAN_THEMES, MIN_BEANTWOORD_AANDEEL, REPORT_META, SCORE_ZONES,
} from "../src/data/freeScanConfig.js";
import { COMBINATIEPATRONEN } from "../src/data/freeScanPatterns.js";
import { DOMEIN_TAGS, EIGEN_BIJDRAGE_VRAGEN, EXPERIMENTENBIBLIOTHEEK, FREE_SCAN_EXPERIMENTEN } from "../src/data/freeScanAdvies.js";
import { INTERNE_ITEMS } from "../src/data/kennisbank/items.js";
import { TAG_IDS } from "../src/data/kennisbank/taxonomie.js";
import { berekenDomeinScores, kiesAanbeveling, stelRapportSamen } from "../src/lib/freeScanScoring.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wortel = path.join(__dirname, "..");
const fouten = [];
const waarschuwingen = [];
const fout = (waar, tekst) => fouten.push(`${waar}: ${tekst}`);
const waarschuw = (waar, tekst) => waarschuwingen.push(`${waar}: ${tekst}`);

const themaIds = new Set(FREE_SCAN_THEMES.map((t) => t.id));
const experimentIds = new Set(FREE_SCAN_EXPERIMENTEN.map((e) => e.id));

// ── Bekende interne paden ──────────────────────────────────────────────────
const appBron = fs.readFileSync(path.join(wortel, "src/App.jsx"), "utf-8");
const routes = new Set([...appBron.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));
const kennisbankPaden = new Set(INTERNE_ITEMS.map((item) => item.href));

function bestaatPad(pad) {
  if (!pad || !pad.startsWith("/")) return true;
  const schoon = pad.split("?")[0].split("#")[0];
  if (kennisbankPaden.has(schoon) || routes.has(schoon)) return true;
  if (/\.(pdf|jpg|jpeg|png|svg|webp)$/i.test(schoon)) return fs.existsSync(path.join(wortel, "public", schoon));
  return false;
}

// ── Vragen en domeinkoppelingen ────────────────────────────────────────────
FREE_SCAN_QUESTIONS.forEach((vraag) => {
  if (!vraag.theme) fout(vraag.id, "heeft geen domeinkoppeling");
  else if (!themaIds.has(vraag.theme)) fout(vraag.id, `verwijst naar een onbekend domein: ${vraag.theme}`);
  if (!vraag.text) fout(vraag.id, "heeft geen vraagtekst");
});

const perThema = {};
FREE_SCAN_QUESTIONS.forEach((vraag) => { perThema[vraag.theme] = (perThema[vraag.theme] || 0) + 1; });
FREE_SCAN_THEMES.forEach((thema) => {
  const aantal = perThema[thema.id] || 0;
  if (aantal === 0) fout(thema.id, "heeft geen enkele vraag");
  else if (aantal < 3) waarschuw(thema.id, `heeft maar ${aantal} vragen; met zo weinig vragen is een gemiddelde kwetsbaar`);
});

// ── Tekstcategorieën per domein ────────────────────────────────────────────
const sleutels = SCORE_ZONES.map((z) => z.tekstSleutel);
FREE_SCAN_THEMES.forEach((thema) => {
  if (!thema.teksten) {
    fout(thema.id, "heeft geen tekstblokken");
    return;
  }
  sleutels.forEach((sleutel) => {
    if (!thema.teksten[sleutel]) fout(thema.id, `mist het tekstblok voor de categorie ${sleutel}`);
    else if (thema.teksten[sleutel].length < 60) waarschuw(thema.id, `het tekstblok ${sleutel} is erg kort`);
  });
  if (!thema.reflection) fout(thema.id, "heeft geen reflectievraag");
  if (thema.knowledge && !bestaatPad(thema.knowledge.href)) fout(thema.id, `verwijst naar een niet-bestaande pagina: ${thema.knowledge.href}`);
  if (!EIGEN_BIJDRAGE_VRAGEN[thema.id]) fout(thema.id, "heeft geen vraag over de eigen bijdrage");
  if (!DOMEIN_TAGS[thema.id] || !DOMEIN_TAGS[thema.id].length) fout(thema.id, "heeft geen onderwerpen om content bij te zoeken");
  (DOMEIN_TAGS[thema.id] || []).forEach((tag) => {
    if (!TAG_IDS.includes(tag)) fout(thema.id, `gebruikt een tag die de kennisbank niet kent: ${tag}`);
  });
});

// ── Scorebereiken: geen gaten, geen overlap ────────────────────────────────
const oplopend = [...SCORE_ZONES].sort((a, b) => a.min - b.min);
if (oplopend[0].min > 1) fout("SCORE_ZONES", `de laagste categorie begint bij ${oplopend[0].min}; de schaal begint bij 1`);
const idsGezien = new Set();
oplopend.forEach((zone, index) => {
  if (idsGezien.has(zone.id)) fout("SCORE_ZONES", `de categorie ${zone.id} komt dubbel voor`);
  idsGezien.add(zone.id);
  if (!zone.tekstSleutel) fout("SCORE_ZONES", `de categorie ${zone.id} heeft geen tekstsleutel`);
  const volgende = oplopend[index + 1];
  if (volgende && volgende.min <= zone.min) {
    fout("SCORE_ZONES", `de categorieën ${zone.id} en ${volgende.id} overlappen elkaar`);
  }
});
// Elke waarde tussen 1 en 5 moet in precies één categorie vallen.
for (let waarde = 1; waarde <= 5.0001; waarde += 0.01) {
  const passend = SCORE_ZONES.filter((z) => waarde >= z.min);
  if (!passend.length) fout("SCORE_ZONES", `voor de waarde ${waarde.toFixed(2)} is geen categorie gedefinieerd`);
}
if (MIN_BEANTWOORD_AANDEEL <= 0 || MIN_BEANTWOORD_AANDEEL > 1) {
  fout("MIN_BEANTWOORD_AANDEEL", "moet tussen 0 en 1 liggen");
}

// ── Combinatiepatronen ─────────────────────────────────────────────────────
const patroonIds = new Set();
COMBINATIEPATRONEN.forEach((patroon) => {
  if (patroonIds.has(patroon.id)) fout(patroon.id, "is dubbel geregistreerd");
  patroonIds.add(patroon.id);
  if (!patroon.titel) fout(patroon.id, "heeft geen titel");
  if (!patroon.duiding) fout(patroon.id, "heeft geen duiding");
  if (!patroon.reflectievraag) fout(patroon.id, "heeft geen reflectievraag");
  if (typeof patroon.prioriteit !== "number") fout(patroon.id, "heeft geen prioriteit");
  if (!patroon.voorwaarden || !patroon.voorwaarden.length) fout(patroon.id, "heeft geen scorevoorwaarden");

  const perDomein = {};
  (patroon.voorwaarden || []).forEach((voorwaarde) => {
    if (!themaIds.has(voorwaarde.domein)) {
      fout(patroon.id, `gebruikt een onbekende patroonvariabele: ${voorwaarde.domein}`);
      return;
    }
    if (voorwaarde.min === undefined && voorwaarde.max === undefined) {
      fout(patroon.id, `de voorwaarde op ${voorwaarde.domein} heeft geen grens`);
    }
    if (voorwaarde.min !== undefined && voorwaarde.max !== undefined && voorwaarde.min > voorwaarde.max) {
      fout(patroon.id, `de voorwaarde op ${voorwaarde.domein} kan nooit waar zijn`);
    }
    if (perDomein[voorwaarde.domein]) {
      fout(patroon.id, `stelt twee voorwaarden aan hetzelfde domein: ${voorwaarde.domein}`);
    }
    perDomein[voorwaarde.domein] = voorwaarde;
  });

  if (patroon.verschil) {
    ["hoog", "laag"].forEach((kant) => {
      if (!themaIds.has(patroon.verschil[kant])) {
        fout(patroon.id, `het scoreverschil verwijst naar een onbekend domein: ${patroon.verschil[kant]}`);
      }
    });
    if (patroon.verschil.hoog === patroon.verschil.laag) {
      fout(patroon.id, "het scoreverschil vergelijkt een domein met zichzelf");
    }
    if (typeof patroon.verschil.min !== "number") fout(patroon.id, "het scoreverschil heeft geen minimum");
  }

  if (patroon.experiment && !experimentIds.has(patroon.experiment)) {
    fout(patroon.id, `verwijst naar een niet-bestaand experiment: ${patroon.experiment}`);
  }
  (patroon.sluitUit || []).forEach((ander) => {
    if (!COMBINATIEPATRONEN.some((p) => p.id === ander)) {
      fout(patroon.id, `sluit een patroon uit dat niet bestaat: ${ander}`);
    }
  });
});

if (COMBINATIEPATRONEN.length < 15) {
  waarschuw("patronen", `er zijn er ${COMBINATIEPATRONEN.length}; de richtlijn is vijftien tot vijfentwintig`);
}

// Tegenstrijdige of dubbele patronen. Voorwaarden die elkaar uitsluiten kunnen
// nooit samen vuren en zijn dus ongevaarlijk. Het probleem is een patroon dat
// precies dezelfde voorwaarden stelt als een ander: dan verschijnen er twee
// duidingen over exact hetzelfde beeld.
const vingerafdruk = (patroon) => [...(patroon.voorwaarden || [])]
  .map((v) => `${v.domein}:${v.min === undefined ? "" : v.min}-${v.max === undefined ? "" : v.max}`)
  .sort()
  .join("|");

const gezien = new Map();
COMBINATIEPATRONEN.forEach((patroon) => {
  const sleutel = vingerafdruk(patroon);
  const eerder = gezien.get(sleutel);
  const uitgesloten = eerder
    && ((patroon.sluitUit || []).includes(eerder) || (COMBINATIEPATRONEN.find((p) => p.id === eerder).sluitUit || []).includes(patroon.id));
  if (eerder && !uitgesloten) {
    fout(patroon.id, `stelt precies dezelfde voorwaarden als ${eerder}; die twee zouden altijd samen verschijnen`);
  }
  if (!eerder) gezien.set(sleutel, patroon.id);
});

// ── Experimenten ───────────────────────────────────────────────────────────
FREE_SCAN_EXPERIMENTEN.forEach((exp) => {
  if (!["persoonlijk", "gesprek"].includes(exp.soort)) fout(exp.id, `heeft een onbekende soort: ${exp.soort}`);
  ["titel", "uitleg", "tijd", "looptijd", "eersteStap", "href"].forEach((veld) => {
    if (!exp[veld]) fout(exp.id, `mist het veld ${veld}`);
  });
  if (!exp.themas || !exp.themas.length) fout(exp.id, "is aan geen enkel domein gekoppeld");
  (exp.themas || []).forEach((thema) => {
    if (!themaIds.has(thema)) fout(exp.id, `verwijst naar een onbekend domein: ${thema}`);
  });
  if (exp.href && !bestaatPad(exp.href)) fout(exp.id, `verwijst naar een niet-bestaande pagina: ${exp.href}`);
});

if (!bestaatPad(EXPERIMENTENBIBLIOTHEEK.href)) {
  fout("experimentenbibliotheek", `verwijst naar een niet-bestaande pagina: ${EXPERIMENTENBIBLIOTHEEK.href}`);
}

// Elk domein moet zowel een persoonlijk als een gespreksexperiment hebben.
FREE_SCAN_THEMES.forEach((thema) => {
  ["persoonlijk", "gesprek"].forEach((soort) => {
    const aantal = FREE_SCAN_EXPERIMENTEN.filter((e) => e.soort === soort && e.themas.includes(thema.id)).length;
    if (aantal === 0) fout(thema.id, `heeft geen experiment van de soort ${soort}`);
  });
});

// ── Elke uitkomst levert een compleet rapport op ───────────────────────────
const proefwaarden = [1, 2, 2.5, 3, 3.5, 4, 5];
FREE_SCAN_THEMES.forEach((thema) => {
  const aanbeveling = kiesAanbeveling({ id: thema.id, label: thema.label }, []);
  if (!aanbeveling) fout(thema.id, "levert geen enkele aanbeveling uit de kennisbank op");
  else if (!bestaatPad(aanbeveling.href)) fout(thema.id, `de aanbeveling verwijst naar een dode pagina: ${aanbeveling.href}`);
});

proefwaarden.forEach((waarde) => {
  const antwoorden = Object.fromEntries(FREE_SCAN_QUESTIONS.map((q) => [q.id, q.reverse ? 6 - waarde : waarde]));
  const rapport = stelRapportSamen(berekenDomeinScores(antwoorden));
  if (rapport.reflections.length !== 3) fout(`proefscore ${waarde}`, `levert ${rapport.reflections.length} reflectievragen op in plaats van drie`);
  if (rapport.experiments.length !== 2) fout(`proefscore ${waarde}`, `levert ${rapport.experiments.length} experimenten op in plaats van twee`);
  if (rapport.patterns.length > 2) fout(`proefscore ${waarde}`, "toont meer dan twee patronen");
  if (!rapport.aanbeveling) fout(`proefscore ${waarde}`, "levert geen aanbeveling op");
  rapport.themeScores.forEach((t) => {
    if (!t.tekst) fout(`proefscore ${waarde}`, `domein ${t.id} krijgt geen tekstblok`);
  });
});

// ── Taalgebruik ────────────────────────────────────────────────────────────
const verboden = [
  /jouw team is onveilig/i,
  /jij hebt te weinig/i,
  /dit is de oorzaak/i,
  /de scan bewijst/i,
];
const teToetsen = [
  ...FREE_SCAN_THEMES.flatMap((t) => Object.values(t.teksten || {})),
  ...COMBINATIEPATRONEN.map((p) => p.duiding),
  ...FREE_SCAN_EXPERIMENTEN.map((e) => e.uitleg),
  ...REPORT_META.zones.map((z) => z.text),
];
teToetsen.forEach((tekst) => {
  verboden.forEach((patroon) => {
    if (patroon.test(tekst)) fout("taalgebruik", `een tekst gebruikt een stellige formulering: ${tekst.slice(0, 60)}`);
  });
});

// ── Uitkomst ───────────────────────────────────────────────────────────────
console.log(
  `Scanrapport gecontroleerd: ${FREE_SCAN_QUESTIONS.length} vragen, ${FREE_SCAN_THEMES.length} domeinen, `
  + `${COMBINATIEPATRONEN.length} patronen en ${FREE_SCAN_EXPERIMENTEN.length} experimenten.`
);
if (waarschuwingen.length) {
  console.log(`\n${waarschuwingen.length} waarschuwing(en):`);
  waarschuwingen.forEach((regel) => console.log(`  · ${regel}`));
}
if (fouten.length) {
  console.error(`\n${fouten.length} fout(en):`);
  fouten.forEach((regel) => console.error(`  ✗ ${regel}`));
  process.exit(1);
}
console.log("\nGeen fouten gevonden.");
