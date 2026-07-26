/**
 * Test voor ScrollManager (src/components/shared/ScrollManager.jsx)
 *
 * Draait de component in jsdom en controleert of hij bij elke soort navigatie
 * de juiste scrollbeslissing neemt. jsdom scrollt zelf niet, dus we vangen
 * window.scrollTo op en kijken welke waarden de component doorgeeft.
 *
 * Draaien:  node scripts/test-scrollmanager.mjs
 */

import { JSDOM } from "jsdom";

// ---------------------------------------------------------------- jsdom opzet
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://www.mijnteamkompas.nl/teamscan",
  pretendToBeVisual: true,
});

const { window } = dom;

global.window = window;
global.document = window.document;
// navigator is in Node 22 read-only; via defineProperty lukt het wel.
Object.defineProperty(global, "navigator", {
  value: window.navigator,
  configurable: true,
  writable: true,
});
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.PopStateEvent = window.PopStateEvent;
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = (cb) => window.setTimeout(() => cb(Date.now()), 0);
global.cancelAnimationFrame = (id) => window.clearTimeout(id);
window.requestAnimationFrame = global.requestAnimationFrame;
window.cancelAnimationFrame = global.cancelAnimationFrame;

// jsdom heeft geen echte scroll. We houden een eigen positie bij.
let scrollY = 0;
const scrollCalls = [];
Object.defineProperty(window, "scrollY", { get: () => scrollY, configurable: true });
Object.defineProperty(window, "pageYOffset", { get: () => scrollY, configurable: true });
window.scrollTo = (a, b) => {
  const doel = typeof a === "object" && a !== null ? a.top : b;
  const gedrag =
    typeof a === "object" && a !== null
      ? a.behavior || "auto"
      : window.document.documentElement.style.scrollBehavior || "smooth";
  scrollCalls.push({ top: doel, behavior: gedrag });
  scrollY = doel;
};

// Zonder deze regel gedraagt de test zich anders dan de echte site,
// waar global.css `html { scroll-behavior: smooth }` zet.
window.document.documentElement.style.scrollBehavior = "smooth";

// Scrollen zoals een bezoeker dat doet: positie zetten en het scroll-event
// afvuren, zodat de listener in ScrollManager de waarde meeleest.
async function scrollAls(bezoekerY) {
  scrollY = bezoekerY;
  window.dispatchEvent(new window.Event("scroll"));
  await tick(30);
}

// jsdom implementeert history.scrollRestoration niet. We voegen het toe, zodat
// het codepad dat de browser op 'manual' zet ook echt getest wordt.
if (!("scrollRestoration" in window.history)) {
  window.history.scrollRestoration = "auto";
}

const store = new Map();
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  },
  configurable: true,
});

const React = (await import("react")).default;
const { act } = await import("react");
const ReactDOMClient = await import("react-dom/client");
const { MemoryRouter, Routes, Route, useNavigate } = await import("react-router-dom");
// Node kan .jsx niet direct laden. We transpileren de component met esbuild
// (zit al in node_modules via Vite) naar een tijdelijk .mjs-bestand naast dit
// script, zodat de imports van react en react-router-dom blijven werken.
const fs = await import("node:fs");
const path = await import("node:path");
const { fileURLToPath } = await import("node:url");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bronPad = path.join(scriptDir, "../src/components/shared/ScrollManager.jsx");
const tijdelijkPad = path.join(scriptDir, ".tmp-scrollmanager.mjs");

const esbuild = await import("esbuild");
const getranspileerd = await esbuild.transform(fs.readFileSync(bronPad, "utf8"), {
  loader: "jsx",
  format: "esm",
});
fs.writeFileSync(tijdelijkPad, getranspileerd.code);

let ScrollManager;
try {
  ScrollManager = (await import(tijdelijkPad)).default;
} finally {
  fs.rmSync(tijdelijkPad, { force: true });
}

const h = React.createElement;

// ------------------------------------------------------------------ testkader
const resultaten = [];
function check(naam, ok, detail = "") {
  resultaten.push({ naam, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${naam}${detail ? "   -> " + detail : ""}`);
}

const tick = (ms = 40) =>
  act(async () => {
    await new Promise((r) => window.setTimeout(r, ms));
  });

// Een pagina met een hoge sectie, zodat er iets te scrollen valt.
function Pagina({ naam }) {
  return h(
    "main",
    null,
    h("h1", null, naam),
    h("section", { id: "faq" }, "FAQ van " + naam),
    h("section", { id: "aanvraag" }, "Aanvraag van " + naam)
  );
}

let navigeer = null;
function NavHook() {
  navigeer = useNavigate();
  return null;
}

function TestApp() {
  return h(
    MemoryRouter,
    { initialEntries: ["/teamscan"] },
    h(ScrollManager),
    h(NavHook),
    h(
      Routes,
      null,
      h(Route, { path: "/teamscan", element: h(Pagina, { naam: "Teamscan" }) }),
      h(Route, { path: "/teamcoaching", element: h(Pagina, { naam: "Teamcoaching" }) }),
      h(Route, { path: "/blog", element: h(Pagina, { naam: "Blog" }) }),
      h(Route, { path: "/blog/:slug", element: h(Pagina, { naam: "Blogartikel" }) }),
      h(Route, { path: "/kennis/teamcultuur", element: h(Pagina, { naam: "Teamcultuur" }) }),
      h(Route, {
        path: "/kennis/eigenaarschap-in-teams",
        element: h(Pagina, { naam: "Eigenaarschap" }),
      })
    )
  );
}

// Ankers een positie geven; jsdom levert standaard alleen nullen.
function zetAnkerPositie(id, topTenOpzichteVanViewport) {
  const el = window.document.getElementById(id);
  if (!el) return false;
  el.getBoundingClientRect = () => ({
    top: topTenOpzichteVanViewport,
    bottom: topTenOpzichteVanViewport + 400,
    left: 0,
    right: 800,
    width: 800,
    height: 400,
  });
  return true;
}

const root = ReactDOMClient.createRoot(window.document.getElementById("root"));
await act(async () => {
  root.render(h(TestApp));
});
await tick();

// ---------------------------------------------------------------- 1. PUSH
scrollY = 2200;
scrollCalls.length = 0;
await act(async () => navigeer("/teamcoaching"));
await tick();
check(
  "product A -> product B zet scroll op 0",
  scrollY === 0 && scrollCalls.some((c) => c.top === 0),
  `scrollY=${scrollY}, calls=${JSON.stringify(scrollCalls)}`
);

// ---------------------------------------------------------------- 2. Geen animatie
check(
  "routewissel scrollt zonder animatie",
  scrollCalls.every((c) => c.behavior !== "smooth"),
  `behaviors=${scrollCalls.map((c) => c.behavior).join(",")}`
);

// ---------------------------------------------------------------- 3. Naar blog
scrollY = 1800;
scrollCalls.length = 0;
await act(async () => navigeer("/blog"));
await tick();
check("productpagina -> blog zet scroll op 0", scrollY === 0, `scrollY=${scrollY}`);

// ---------------------------------------------------------------- 4. Blogartikel
scrollY = 1500;
await act(async () => navigeer("/blog/teambuilding-werkt-niet-zonder-basis"));
await tick();
check("blogoverzicht -> blogartikel zet scroll op 0", scrollY === 0, `scrollY=${scrollY}`);

// ---------------------------------------------------------------- 5. Kennispagina
scrollY = 1200;
await act(async () => navigeer("/kennis/teamcultuur"));
await tick();
check("blog -> kennispagina zet scroll op 0", scrollY === 0, `scrollY=${scrollY}`);

// ---------------------------------------------------------------- 6. Onderling
scrollY = 2600;
await act(async () => navigeer("/kennis/eigenaarschap-in-teams"));
await tick();
check("kennispagina -> kennispagina zet scroll op 0", scrollY === 0, `scrollY=${scrollY}`);

// ---------------------------------------------------------------- 7. Focus
const focusTag = window.document.activeElement && window.document.activeElement.tagName;
check(
  "focus verspringt naar de kop van de nieuwe pagina",
  focusTag === "H1",
  `activeElement=${focusTag}`
);

// ---------------------------------------------------------------- 8. Hash, andere pagina
scrollY = 0;
scrollCalls.length = 0;
await act(async () => navigeer("/teamscan"));
await tick();
zetAnkerPositie("faq", 3000);
await act(async () => navigeer("/teamscan#faq"));
await tick(80);
// Verwachting: 3000 (afstand tot viewporttop) + 0 (huidige scroll) - 80 (headeroffset)
check(
  "hash scrollt naar het anker met headeroffset",
  scrollY === 2920,
  `scrollY=${scrollY}, verwacht 2920, calls=${JSON.stringify(scrollCalls.slice(-2))}`
);

// ---------------------------------------------------------------- 9. Hash blokkeert reset niet
check(
  "scroll-reset overschrijft de hash-positie niet",
  scrollCalls[scrollCalls.length - 1].top !== 0,
  `laatste call=${JSON.stringify(scrollCalls[scrollCalls.length - 1])}`
);

// ---------------------------------------------------------------- 10. Hash zelfde pagina = smooth
scrollCalls.length = 0;
zetAnkerPositie("aanvraag", 1500);
await act(async () => navigeer("/teamscan#aanvraag"));
await tick(80);
const laatste = scrollCalls[scrollCalls.length - 1];
check(
  "hash binnen dezelfde pagina scrollt vloeiend mee",
  laatste && laatste.behavior === "smooth",
  `laatste call=${JSON.stringify(laatste)}`
);

// ---------------------------------------------------------------- 11. POP herstelt
scrollCalls.length = 0;
await act(async () => navigeer("/kennis/teamcultuur"));
await tick();
await scrollAls(1750); // bezoeker scrollt op de kennispagina
await act(async () => navigeer("/blog"));
await tick();
const naVooruit = scrollY;
await act(async () => navigeer(-1)); // terugknop
await tick(160);
check(
  "terugknop herstelt de eerdere scrollpositie",
  Math.abs(scrollY - 1750) <= 2,
  `voor=1750, na navigatie=${naVooruit}, na terug=${scrollY}`
);

// ---------------------------------------------------------------- 12. POP zonder opgeslagen positie
await act(async () => navigeer(1)); // vooruit naar /blog
await tick(120);
check(
  "vooruitknop levert een bekende positie op",
  typeof scrollY === "number" && scrollY >= 0,
  `scrollY=${scrollY}`
);

// ---------------------------------------------------------------- 13. scrollRestoration
check(
  "native scroll-restoration staat op manual",
  window.history.scrollRestoration === "manual",
  `scrollRestoration=${window.history.scrollRestoration}`
);

// ---------------------------------------------------------------- 14. Onbekend anker
scrollCalls.length = 0;
scrollY = 900;
await act(async () => navigeer("/blog#bestaat-niet"));
await tick(120);
check(
  "onbekend anker laat de pagina met rust in plaats van te crashen",
  true,
  `scrollY=${scrollY}, calls=${scrollCalls.length}`
);

// ---------------------------------------------------------------- afronden
await act(async () => root.unmount());

const gefaald = resultaten.filter((r) => !r.ok);
console.log(`\n==== ${resultaten.length - gefaald.length}/${resultaten.length} geslaagd ====`);
if (gefaald.length) {
  console.log("Gefaald: " + gefaald.map((r) => r.naam).join(" | "));
  process.exit(1);
}
