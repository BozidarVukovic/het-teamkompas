// Tests voor de kennisbank. Draaien met `npm run test:kennisbank`.
//
// De blogartikelen doen hier bewust niet mee: die worden via import.meta.glob
// ingelezen en dat werkt alleen in de Vite-bundel. Alles wat hier getest wordt
// is dezelfde code die de website gebruikt.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BASIS_ITEMS, INTERNE_ITEMS, normaliseerItem, zoekItem } from "../src/data/kennisbank/items.js";
import {
  CONTENTTYPE_IDS, DOEL_IDS, DOMEIN_IDS, MAX_DOELEN, MAX_PRIMAIR, MAX_SITUATIES,
  ROL_IDS, SITUATIE_IDS, TAG_IDS, TIJD_IDS, WERKWIJZE_IDS, contenttype, tijdBovengrens,
} from "../src/data/kennisbank/taxonomie.js";
import {
  DREMPELS, LEGE_KEUZE, PUNTEN, beveelAan, bouwReden, kiesMetDiversiteit,
  pasFiltersToe, pastBinnenTijd, samenvattingKeuze, scoorItem, vergelijk,
} from "../src/lib/kennisbank/scoring.js";
import { tagsVoorZoekterm, zoek } from "../src/lib/kennisbank/zoeken.js";
import { heeftFilters, heeftKeuze, leesUrl, schrijfUrl } from "../src/lib/kennisbank/urlState.js";
import { SNELLE_INGANGEN } from "../src/lib/kennisbank/snelleIngangen.js";
import { gerelateerdeItems } from "../src/lib/kennisbank/gerelateerd.js";

const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Taxonomie en metadata ──────────────────────────────────────────────────

test("elk contentitem heeft de verplichte metadata", () => {
  for (const item of BASIS_ITEMS) {
    assert.ok(item.id, "id ontbreekt");
    assert.ok(item.titel, `titel ontbreekt bij ${item.id}`);
    assert.ok(item.samenvatting, `samenvatting ontbreekt bij ${item.id}`);
    assert.ok(CONTENTTYPE_IDS.includes(item.type), `onbekend type bij ${item.id}`);
    assert.ok(item.domeinen.length > 0, `geen domein bij ${item.id}`);
    assert.notEqual(item.tijdMinuten, null, `geen tijdsindicatie bij ${item.id}`);
    assert.ok(item.rollen.length > 0, `geen doelgroep bij ${item.id}`);
    assert.ok(item.doelen.length > 0, `geen gewenst resultaat bij ${item.id}`);
    assert.ok(item.werkwijzen.length > 0, `geen manier van werken bij ${item.id}`);
    assert.ok(item.tags.length > 0, `geen tags bij ${item.id}`);
  }
});

test("er worden geen onbekende tags, domeinen, rollen of doelen gebruikt", () => {
  for (const item of BASIS_ITEMS) {
    item.tags.forEach((tag) => assert.ok(TAG_IDS.includes(tag), `onbekende tag ${tag} bij ${item.id}`));
    item.domeinen.forEach((d) => assert.ok(DOMEIN_IDS.includes(d), `onbekend domein ${d} bij ${item.id}`));
    item.rollen.forEach((r) => assert.ok(ROL_IDS.includes(r), `onbekende rol ${r} bij ${item.id}`));
    item.doelen.forEach((d) => assert.ok(DOEL_IDS.includes(d), `onbekend doel ${d} bij ${item.id}`));
    item.werkwijzen.forEach((w) => assert.ok(WERKWIJZE_IDS.includes(w), `onbekende werkwijze ${w} bij ${item.id}`));
    item.situaties.forEach((s) => assert.ok(SITUATIE_IDS.includes(s), `onbekende situatie ${s} bij ${item.id}`));
  }
});

test("ids en interne paden zijn uniek", () => {
  const ids = BASIS_ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "dubbel id gevonden");
  const paden = INTERNE_ITEMS.map((item) => item.href);
  assert.equal(new Set(paden).size, paden.length, "dubbel intern pad gevonden");
});

test("een item zonder tags valt niet om bij het normaliseren", () => {
  const kaal = normaliseerItem({ id: "test", slug: "test", titel: "Test", samenvatting: "" }, "werkvorm");
  assert.deepEqual(kaal.tags, []);
  assert.deepEqual(kaal.situaties, []);
  assert.equal(kaal.tijdMinuten, null);
  assert.equal(kaal.href, "/kennisbank/werkvorm/test");
});

test("verwijzingen in vervolgstappen en downloads bestaan", () => {
  const appBron = fs.readFileSync(path.join(wortel, "src/App.jsx"), "utf-8");
  const routes = new Set([...appBron.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));
  const blogSlugs = new Set(
    fs.readdirSync(path.join(wortel, "src/content/blog"))
      .filter((naam) => naam.endsWith(".md"))
      .map((naam) => naam.replace(/\.md$/, ""))
  );
  const eigenPaden = new Set(INTERNE_ITEMS.map((item) => item.href));

  const bestaat = (pad) => {
    if (!pad || !pad.startsWith("/")) return true;
    const schoon = pad.split("?")[0];
    if (eigenPaden.has(schoon) || routes.has(schoon)) return true;
    if (schoon.startsWith("/blog/")) return blogSlugs.has(schoon.slice(6));
    if (/\.(pdf|jpg|jpeg|png|svg|webp)$/i.test(schoon)) return fs.existsSync(path.join(wortel, "public", schoon));
    return false;
  };

  for (const item of BASIS_ITEMS) {
    if (item.url) assert.ok(bestaat(item.url), `dode url bij ${item.id}: ${item.url}`);
    if (item.bestand) assert.ok(bestaat(item.bestand), `dood bestand bij ${item.id}: ${item.bestand}`);
    if (item.vervolgstap) assert.ok(bestaat(item.vervolgstap.href), `dode vervolgstap bij ${item.id}: ${item.vervolgstap.href}`);
  }
});

test("gerelateerde content verwijst naar bestaande items en nooit naar zichzelf", () => {
  for (const item of BASIS_ITEMS) {
    for (const referentie of item.gerelateerd || []) {
      const gevonden = zoekItem(referentie);
      assert.ok(gevonden, `onbekende verwijzing ${referentie} bij ${item.id}`);
      assert.notEqual(gevonden.id, item.id, `${item.id} verwijst naar zichzelf`);
    }
  }
});

// ── Relevantiescores ───────────────────────────────────────────────────────

test("een passend item scoort hoger dan een niet passend item", () => {
  const keuze = { ...LEGE_KEUZE, situaties: ["rollen-onduidelijk"], doelen: ["rollen-verduidelijken"] };
  const rollen = BASIS_ITEMS.find((item) => item.id === "wv-rollen-en-verwachtingen");
  const energie = BASIS_ITEMS.find((item) => item.id === "wv-energiegevers-en-energievreters");
  assert.ok(scoorItem(rollen, keuze).score > scoorItem(energie, keuze).score);
});

test("de score is deterministisch: dezelfde keuze levert dezelfde uitkomst", () => {
  const keuze = { situaties: ["niet-aanspreken"], rol: "teamleider", doelen: ["bespreekbaar-maken"], tijd: "30", werkwijzen: ["bespreken"] };
  const eerste = beveelAan(BASIS_ITEMS, keuze).primair.map((r) => r.item.id + ":" + r.score);
  const tweede = beveelAan(BASIS_ITEMS, keuze).primair.map((r) => r.item.id + ":" + r.score);
  assert.deepEqual(eerste, tweede);
});

test("elk punt uit de puntentelling telt daadwerkelijk mee", () => {
  const item = BASIS_ITEMS.find((i) => i.id === "wv-laatste-ronde");
  const zonder = scoorItem(item, LEGE_KEUZE).score;
  const metRol = scoorItem(item, { ...LEGE_KEUZE, rol: "teamleider" }).score;
  const metWerkwijze = scoorItem(item, { ...LEGE_KEUZE, werkwijzen: ["bespreken"] }).score;
  assert.ok(metRol > zonder, "rol levert geen punten op");
  assert.ok(metWerkwijze >= zonder + PUNTEN.werkwijze, "werkwijze levert te weinig punten op");
});

test("de sortering volgt score, aantal criteria en daarna actualiteit", () => {
  const a = { score: 20, criteria: ["situatie"], item: { uitgelicht: false, datum: "2026-01-01", titel: "A" } };
  const b = { score: 20, criteria: ["situatie", "doel"], item: { uitgelicht: false, datum: "2026-01-01", titel: "B" } };
  const c = { score: 30, criteria: [], item: { uitgelicht: false, datum: "2020-01-01", titel: "C" } };
  assert.deepEqual([a, b, c].sort(vergelijk).map((r) => r.item.titel), ["C", "B", "A"]);
});

// ── Tijd als harde bovengrens ──────────────────────────────────────────────

test("de beschikbare tijd sluit langere content uit", () => {
  const keuze = { ...LEGE_KEUZE, situaties: ["nieuw-team"], tijd: "5" };
  const { primair, secundair } = beveelAan(BASIS_ITEMS, keuze);
  for (const resultaat of [...primair, ...secundair]) {
    if (resultaat.tijdOverschrijding) continue;
    assert.ok(resultaat.item.tijdMinuten <= 5, `${resultaat.item.id} duurt ${resultaat.item.tijdMinuten} minuten bij een keuze van 5`);
  }
});

test("een werkvorm van een dagdeel verschijnt niet bij vijf minuten", () => {
  const teamstart = BASIS_ITEMS.find((item) => item.id === "wv-teamstart-vier-rondes");
  assert.equal(pastBinnenTijd(teamstart, "5"), false);
  assert.equal(pastBinnenTijd(teamstart, "dagdeel"), true);
  assert.equal(pastBinnenTijd(teamstart, "vrij"), true);
});

test("geen voorkeur voor tijd sluit niets uit", () => {
  assert.equal(tijdBovengrens("vrij"), null);
  for (const item of BASIS_ITEMS) assert.equal(pastBinnenTijd(item, "vrij"), true);
});

test("wie langer overschrijdt wordt als zodanig vermeld", () => {
  const resultaat = { item: BASIS_ITEMS[0], treffers: { tags: [], doelen: [], domeinen: [] }, tijdOverschrijding: true };
  assert.match(bouwReden(resultaat, LEGE_KEUZE), /duurt iets langer/);
});

// ── Diversiteit ────────────────────────────────────────────────────────────

test("er verschijnen nooit meer dan zes primaire aanbevelingen", () => {
  for (const ingang of SNELLE_INGANGEN) {
    const { primair } = beveelAan(BASIS_ITEMS, ingang.keuze);
    assert.ok(primair.length <= MAX_PRIMAIR, `${ingang.id} gaf ${primair.length} resultaten`);
  }
});

test("de resultaten bevatten verschillende soorten content", () => {
  const keuze = { situaties: ["niet-aanspreken", "afspraken-niet-nagekomen"], rol: "teamleider", doelen: ["bespreekbaar-maken"], tijd: "vrij", werkwijzen: [] };
  const { primair } = beveelAan(BASIS_ITEMS, keuze);
  const soorten = new Set(primair.map((r) => r.item.type));
  assert.ok(soorten.size >= 4, `slechts ${soorten.size} verschillende soorten: ${[...soorten].join(", ")}`);
});

test("de diversiteitsronde vult geen lege categorie met zwak passende content", () => {
  const gescoord = [
    { score: 30, criteria: ["situatie"], item: { id: "a", type: "artikel", uitgelicht: false, datum: "2026-01-01", titel: "A" } },
    { score: 28, criteria: ["situatie"], item: { id: "b", type: "werkvorm", uitgelicht: false, datum: "2026-01-01", titel: "B" } },
  ];
  const gekozen = kiesMetDiversiteit(gescoord, 6);
  assert.equal(gekozen.length, 2, "er mag niets worden bijverzonnen");
});

test("vraagt de bezoeker om één soort, dan wordt de diversiteitsronde overgeslagen", () => {
  const gescoord = [
    { score: 30, criteria: [], item: { id: "a", type: "download", uitgelicht: false, datum: "2026-01-01", titel: "A" } },
    { score: 29, criteria: [], item: { id: "b", type: "download", uitgelicht: false, datum: "2026-01-01", titel: "B" } },
    { score: 5, criteria: [], item: { id: "c", type: "artikel", uitgelicht: false, datum: "2026-01-01", titel: "C" } },
  ];
  const gekozen = kiesMetDiversiteit(gescoord, 2, false);
  assert.deepEqual(gekozen.map((r) => r.item.id), ["a", "b"]);
});

test("elke bucket uit de taxonomie komt in de content voor", () => {
  const buckets = new Set(BASIS_ITEMS.map((item) => contenttype(item.type).bucket));
  assert.ok(buckets.size >= 6, `slechts ${buckets.size} buckets gevuld`);
});

// ── Uitleg bij de aanbeveling ──────────────────────────────────────────────

test("elke aanbeveling krijgt een begrijpelijke reden zonder diagnose", () => {
  const keuze = { situaties: ["niet-uitspreken"], rol: "teamlid", doelen: ["begrijpen"], tijd: "15", werkwijzen: ["reflecteren"] };
  const { primair } = beveelAan(BASIS_ITEMS, keuze);
  assert.ok(primair.length > 0);
  for (const resultaat of primair) {
    assert.ok(resultaat.reden.length > 20, `reden te kort bij ${resultaat.item.id}`);
    assert.doesNotMatch(resultaat.reden, /jouw team (heeft|is|scoort)/i, "reden bevat een uitspraak over het team");
  }
});

test("de samenvatting beschrijft de gemaakte keuzes", () => {
  const zin = samenvattingKeuze({ situaties: ["rollen-onduidelijk"], rol: "teamleider", doelen: ["bespreekbaar-maken"], tijd: "30", werkwijzen: [] });
  assert.match(zin, /teamleider/i);
  assert.match(zin, /rolduidelijkheid/i);
  assert.match(zin, /30 minuten/);
});

// ── Filters ────────────────────────────────────────────────────────────────

test("filters halen resultaten weg en veranderen de scores niet", () => {
  const alleenWerkvormen = pasFiltersToe(BASIS_ITEMS, { type: "werkvorm" });
  assert.ok(alleenWerkvormen.length > 0);
  assert.ok(alleenWerkvormen.every((item) => item.type === "werkvorm"));

  const samen = pasFiltersToe(BASIS_ITEMS, { vorm: "samen" });
  assert.ok(samen.every((item) => item.vorm === "samen" || item.vorm === "beide"));

  const kort = pasFiltersToe(BASIS_ITEMS, { tijd: "15" });
  assert.ok(kort.every((item) => item.tijdMinuten <= 15));
});

test("filters werken zowel op ruwe items als op gescoorde resultaten", () => {
  const gescoord = BASIS_ITEMS.map((item) => ({ item, score: 1 }));
  assert.equal(
    pasFiltersToe(gescoord, { domein: "energie-motivatie" }).length,
    pasFiltersToe(BASIS_ITEMS, { domein: "energie-motivatie" }).length
  );
});

// ── Zoeken en synoniemen ───────────────────────────────────────────────────

test("het synoniemenwoordenboek vertaalt zoekwoorden naar hoofdtags", () => {
  assert.ok(tagsVoorZoekterm("aanspreken").includes("aanspreekbaarheid"));
  assert.ok(tagsVoorZoekterm("vergaderen").includes("overleg"));
  assert.ok(tagsVoorZoekterm("taken").includes("rolhelderheid"));
  assert.ok(tagsVoorZoekterm("motivatie").includes("energie"));
  assert.ok(tagsVoorZoekterm("onzekerheid").includes("psychologische-veiligheid"));
  assert.ok(tagsVoorZoekterm("conflict").includes("conflict"));
});

test("zoeken vindt content via een synoniem dat niet in de titel staat", () => {
  const resultaten = zoek(BASIS_ITEMS, "vergaderen");
  assert.ok(resultaten.length > 0, "geen resultaten voor vergaderen");
  assert.ok(resultaten.some((r) => r.item.tags.includes("overleg")));
});

test("zoeken doorzoekt titel, samenvatting en tags", () => {
  assert.ok(zoek(BASIS_ITEMS, "besluit").length > 0);
  assert.ok(zoek(BASIS_ITEMS, "werkdruk").length > 0);
  assert.equal(zoek(BASIS_ITEMS, "").length, 0);
  assert.equal(zoek(BASIS_ITEMS, "xyzq").length, 0);
});

test("zoeken is ongevoelig voor hoofdletters en accenten", () => {
  const gewoon = zoek(BASIS_ITEMS, "reflectie").length;
  assert.equal(zoek(BASIS_ITEMS, "REFLECTIE").length, gewoon);
});

// ── Lege of zwakke uitkomst ────────────────────────────────────────────────

test("een onmogelijke combinatie valt terug op het hoofdonderwerp", () => {
  // Alleen lange content in de vijver, maar de bezoeker heeft vijf minuten.
  const alleenLang = BASIS_ITEMS.filter((item) => item.tijdMinuten >= 60);
  const keuze = { situaties: ["nieuw-team"], rol: "teamcoach", doelen: ["teamdag-voorbereiden"], tijd: "5", werkwijzen: ["voorbereiden"] };
  const uitkomst = beveelAan(alleenLang, keuze);
  assert.ok(uitkomst.terugvalOpHoofdonderwerp, "er wordt niet gemeld dat er is teruggevallen");
  assert.ok(uitkomst.primair.length > 0, "de terugvalroute levert niets op");
  assert.ok(uitkomst.primair.every((r) => r.tijdOverschrijding), "de overschrijding wordt niet gemarkeerd");
});

test("zonder passende content blijft de uitkomst netjes leeg", () => {
  const uitkomst = beveelAan([], { ...LEGE_KEUZE, situaties: ["nieuw-team"] });
  assert.equal(uitkomst.leeg, true);
  assert.deepEqual(uitkomst.primair, []);
  assert.deepEqual(uitkomst.secundair, []);
});

test("zonder enige keuze wordt er niets aanbevolen", () => {
  assert.equal(heeftKeuze(LEGE_KEUZE), false);
  assert.equal(heeftKeuze({ ...LEGE_KEUZE, tijd: "30" }), true);
});

test("de drempels laten zwakke treffers buiten de primaire lijst", () => {
  assert.ok(DREMPELS.primair > DREMPELS.secundair);
  const keuze = { ...LEGE_KEUZE, situaties: ["hoge-werkdruk"] };
  const { primair } = beveelAan(BASIS_ITEMS, keuze);
  assert.ok(primair.every((r) => r.score >= DREMPELS.secundair));
});

// ── Deelbare URL ───────────────────────────────────────────────────────────

test("keuzes overleven een rondje door de url", () => {
  const keuze = { situaties: ["niet-aanspreken", "weinig-vertrouwen"], rol: "hr", doelen: ["openheid-veiligheid"], tijd: "30", werkwijzen: ["bespreken", "oefenen"] };
  const filters = { type: "werkvorm", domein: "veiligheid-leiderschap", tag: "vertrouwen" };
  const params = new URLSearchParams(schrijfUrl({ keuze, filters, zoekterm: "aanspreken" }));
  const terug = leesUrl(params);
  assert.deepEqual(terug.keuze, keuze);
  assert.equal(terug.filters.type, "werkvorm");
  assert.equal(terug.filters.domein, "veiligheid-leiderschap");
  assert.equal(terug.zoekterm, "aanspreken");
});

test("de url bevat leesbare parameters en geen persoonsgegevens", () => {
  const params = schrijfUrl({ keuze: { ...LEGE_KEUZE, situaties: ["hoge-werkdruk"], tijd: "15" } });
  assert.equal(params.situatie, "hoge-werkdruk");
  assert.equal(params.tijd, "15");
  assert.equal(Object.keys(params).includes("naam"), false);
});

test("onbekende of verminkte parameters worden genegeerd", () => {
  const terug = leesUrl(new URLSearchParams("situatie=bestaat-niet,niet-aanspreken&rol=koning&tijd=999&type=onzin"));
  assert.deepEqual(terug.keuze.situaties, ["niet-aanspreken"]);
  assert.equal(terug.keuze.rol, "");
  assert.equal(terug.keuze.tijd, "");
  assert.equal(terug.filters.type, "");
});

test("de url respecteert het maximum aantal situaties en doelen", () => {
  const teveel = SITUATIE_IDS.slice(0, 6).join(",");
  assert.equal(leesUrl(new URLSearchParams("situatie=" + teveel)).keuze.situaties.length, MAX_SITUATIES);
  const doelen = DOEL_IDS.slice(0, 5).join(",");
  assert.equal(leesUrl(new URLSearchParams("doel=" + doelen)).keuze.doelen.length, MAX_DOELEN);
});

test("elke snelle ingang levert direct resultaten op", () => {
  for (const ingang of SNELLE_INGANGEN) {
    const { primair } = beveelAan(BASIS_ITEMS, ingang.keuze);
    assert.ok(primair.length >= 3, `${ingang.id} gaf maar ${primair.length} resultaten`);
    const params = schrijfUrl({ keuze: ingang.keuze });
    assert.deepEqual(leesUrl(new URLSearchParams(params)).keuze, { ...LEGE_KEUZE, ...ingang.keuze });
  }
});

test("actieve filters zijn herkenbaar", () => {
  assert.equal(heeftFilters({}), false);
  assert.equal(heeftFilters({ type: "" }), false);
  assert.equal(heeftFilters({ type: "werkvorm" }), true);
});

// ── Lokale favorieten ──────────────────────────────────────────────────────

function nepOpslag() {
  const data = new Map();
  return {
    getItem: (sleutel) => (data.has(sleutel) ? data.get(sleutel) : null),
    setItem: (sleutel, waarde) => data.set(sleutel, String(waarde)),
    removeItem: (sleutel) => data.delete(sleutel),
    _data: data,
  };
}

test("favorieten worden lokaal bewaard, gewisseld en gewist", async () => {
  globalThis.window = { localStorage: nepOpslag() };
  const { leesFavorieten, wisselFavoriet, wisAlles, bewaarKeuze, leesKeuze } =
    await import("../src/lib/kennisbank/favorieten.js");

  assert.deepEqual(leesFavorieten(), []);
  wisselFavoriet("wv-laatste-ronde");
  assert.deepEqual(leesFavorieten(), ["wv-laatste-ronde"]);
  wisselFavoriet("wv-laatste-ronde");
  assert.deepEqual(leesFavorieten(), [], "nogmaals klikken haalt de favoriet weg");

  wisselFavoriet("dl-teamafspraken-canvas");
  bewaarKeuze({ situaties: ["hoge-werkdruk"] });
  assert.deepEqual(leesKeuze().situaties, ["hoge-werkdruk"]);

  wisAlles();
  assert.deepEqual(leesFavorieten(), []);
  assert.equal(leesKeuze(), null);
  delete globalThis.window;
});

test("favorieten vallen stil terug wanneer opslag niet beschikbaar is", async () => {
  globalThis.window = {
    get localStorage() { throw new Error("opslag geblokkeerd"); },
  };
  const { leesFavorieten, schrijfFavorieten } = await import("../src/lib/kennisbank/favorieten.js?blok");
  assert.deepEqual(leesFavorieten(), []);
  assert.equal(schrijfFavorieten(["a"]), false);
  delete globalThis.window;
});

test("beschadigde opslag levert geen fout op", async () => {
  const opslag = nepOpslag();
  opslag.setItem("teamkompas:kennisbank:favorieten", "{geen json");
  globalThis.window = { localStorage: opslag };
  const { leesFavorieten } = await import("../src/lib/kennisbank/favorieten.js?stuk");
  assert.deepEqual(leesFavorieten(), []);
  delete globalThis.window;
});

// ── Gerelateerde content ───────────────────────────────────────────────────

test("gerelateerde content bevat maximaal drie items en nooit de pagina zelf", () => {
  for (const item of INTERNE_ITEMS) {
    const gerelateerd = gerelateerdeItems(item, BASIS_ITEMS, zoekItem, 3);
    assert.ok(gerelateerd.length <= 3, `${item.id} kreeg ${gerelateerd.length} gerelateerde items`);
    assert.ok(gerelateerd.every((ander) => ander.id !== item.id), `${item.id} verwijst naar zichzelf`);
    assert.equal(new Set(gerelateerd.map((a) => a.id)).size, gerelateerd.length, `${item.id} heeft dubbele verwijzingen`);
  }
});

test("elke interne pagina heeft minstens één vervolgroute", () => {
  for (const item of INTERNE_ITEMS) {
    const gerelateerd = gerelateerdeItems(item, BASIS_ITEMS, zoekItem, 3);
    assert.ok(item.vervolgstap || gerelateerd.length > 0, `${item.id} loopt dood`);
  }
});

// ── Tijdlabels in de taxonomie ─────────────────────────────────────────────

test("alle tijdopties zijn geldig en oplopend", () => {
  const grenzen = TIJD_IDS.map(tijdBovengrens).filter((waarde) => waarde !== null);
  assert.deepEqual(grenzen, [...grenzen].sort((a, b) => a - b));
});
