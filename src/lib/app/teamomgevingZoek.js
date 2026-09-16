// Zoeken in de eigen teamomgeving.
//
// Het inklappen maakte de onderdelen overzichtelijk en de inhoud onvindbaar:
// wat dichtstaat, staat ook niet meer op het scherm om te scannen. Een
// zoekveld geeft dat terug, en meer dan dat -- het is het enige onderdeel dat
// over alle onderdelen tegelijk kijkt.
//
// Alles gebeurt in de browser, op wat het scherm toch al geladen heeft. Er gaat
// geen zoekopdracht naar een server, dus er ontstaat ook geen logboek van
// waar een teamlid naar zoekt in zijn eigen teamomgeving.
//
// Wat er bewust niet in zit: de beheerinhoud en de bespreeknotities. Die zijn
// van de twee begeleiders en horen in geen enkele index.
import { normaliseerTekst, splitsInSecties, magInklappen } from "./teamomgeving.js";
import { maakSlak, sectieAdressen } from "./teamomgevingAdres.js";

// Markdown terug naar lopende tekst, zodat een fragment niet halverwege een
// sterretje begint.
export function vlak(tekst) {
  return normaliseerTekst(tekst)
    .split("\n")
    .map((regel) => regel
      .replace(/^\s{0,3}#{1,6}\s+/, "")
      .replace(/^\s{0,3}[-*+]\s+/, "")
      .replace(/^\s{0,3}>\s?/, ""))
    .join(" ")
    .replace(/\[tijdlijn\]/gi, " ")
    .replace(/[*_`|~]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Hoofdletters en accenten tellen niet mee bij het zoeken. "Stephanie" hoort
// "Stéphanie" te vinden.
export function sleutelbaar(tekst) {
  return (typeof tekst === "string" ? tekst : "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Eén regel per doorzoekbare plek. Een sectie van een inklapbaar onderdeel
// krijgt het adres dat het scherm er ook aan geeft; bij een doorlopend
// onderdeel is dat de slak van de kop zelf, want dat is het id dat daar in de
// pagina staat.
export function maakZoekindex(inhoud) {
  const uit = [];
  for (const deel of (inhoud && inhoud.onderdelen) || []) {
    if (!deel || typeof deel.id !== "string") continue;
    const { inleiding, secties } = splitsInSecties(deel.tekst || "");
    const adressen = magInklappen(deel) ? sectieAdressen(secties) : secties.map((s) => maakSlak(s.kop));
    const inleidend = vlak(inleiding);
    if (inleidend) uit.push({ onderdeelId: deel.id, onderdeelTitel: deel.titel || "", slak: "", kop: "", tekst: inleidend });
    secties.forEach((sectie, i) => {
      const tekst = vlak([sectie.bovenkopje, sectie.tekst].filter(Boolean).join("\n\n"));
      uit.push({ onderdeelId: deel.id, onderdeelTitel: deel.titel || "", slak: adressen[i] || "", kop: sectie.kop, tekst });
    });
  }
  return uit;
}

// Een fragment rond de eerste treffer, met genoeg eromheen om te zien waar het
// over gaat.
function knip(tekst, plek, lengte, rand) {
  if (plek < 0) return { voor: tekst.slice(0, 160), raak: "", na: tekst.length > 160 ? " …" : "" };
  const start = Math.max(0, plek - rand);
  const eind = Math.min(tekst.length, plek + lengte + rand * 2);
  return {
    voor: (start > 0 ? "… " : "") + tekst.slice(start, plek),
    raak: tekst.slice(plek, plek + lengte),
    na: tekst.slice(plek + lengte, eind) + (eind < tekst.length ? " …" : ""),
  };
}

// Alle woorden moeten voorkomen, ergens in de titel, de kop of de tekst. Dat is
// strenger dan "een van de woorden" en dat is hier goed: je zoekt iets terug
// waarvan je weet dat het bestaat, je bladert niet.
export function zoek(index, vraag, max = 24) {
  const woorden = sleutelbaar(vraag).split(/\s+/).filter((w) => w.length >= 2);
  if (!woorden.length) return [];
  const uit = [];
  for (const bron of index || []) {
    const kop = sleutelbaar(bron.kop || "");
    const titel = sleutelbaar(bron.onderdeelTitel || "");
    const tekst = bron.tekst || "";
    const kaal = sleutelbaar(tekst);
    if (!woorden.every((w) => kop.includes(w) || titel.includes(w) || kaal.includes(w))) continue;
    // Bij een accent verspringt de telling na het normaliseren niet, zolang de
    // lengte gelijk blijft. Blijft hij dat niet, dan markeren we niets -- liever
    // geen accent dan een accent op het verkeerde woord.
    const gelijk = kaal.length === tekst.length;
    let plek = -1;
    let lengte = 0;
    if (gelijk) {
      for (const woord of woorden) {
        const p = kaal.indexOf(woord);
        if (p >= 0 && (plek < 0 || p < plek)) { plek = p; lengte = woord.length; }
      }
    }
    const score = (kop.includes(woorden[0]) ? 100 : 0)
      + (titel.includes(woorden[0]) ? 40 : 0)
      + (kaal.includes(woorden[0]) ? 10 : 0);
    uit.push({ ...bron, score, fragment: knip(tekst, plek, lengte, 70) });
  }
  return uit.sort((a, b) => b.score - a.score).slice(0, max);
}
