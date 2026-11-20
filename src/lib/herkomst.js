/**
 * Waar een bezoeker vandaan kwam, grof ingedeeld, voor analytics.
 *
 * Alleen een categorie en bij interne herkomst het pad. Geen volledige URL,
 * geen querystring: daar kan iets persoonlijks in staan.
 */
const ZOEKMACHINES = ["google.", "bing.", "duckduckgo.", "ecosia.", "yahoo.", "startpage."];

// Binnen de site verandert document.referrer niet: react-router wisselt van
// pagina zonder dat de browser een nieuwe pagina laadt. AnalyticsBridge houdt
// daarom het vorige pad bij; is dat er, dan kwam de bezoeker van binnen.
let vorigPad = "";
let huidigPad = "";
export function onthoudPad(pad) {
  if (!pad || pad === huidigPad) return;
  vorigPad = huidigPad;
  huidigPad = pad;
}
export function vorigeInternePagina() {
  return vorigPad;
}

export function bepaalHerkomst(referrer = "", eigenHost = "", internVorigPad = "") {
  if (internVorigPad) return { herkomst: "intern", vorige_pagina: internVorigPad };
  if (!referrer) return { herkomst: "direct" };
  let url;
  try { url = new URL(referrer); } catch { return { herkomst: "onbekend" }; }
  const host = url.hostname.replace(/^www\./, "");
  const eigen = (eigenHost || "").replace(/^www\./, "");
  if (eigen && host === eigen) return { herkomst: "intern", vorige_pagina: url.pathname };
  if (ZOEKMACHINES.some((z) => host.includes(z))) return { herkomst: "zoekmachine", bron_site: host };
  if (host.includes("linkedin.")) return { herkomst: "linkedin", bron_site: host };
  return { herkomst: "extern", bron_site: host };
}

export default bepaalHerkomst;
