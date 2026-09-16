// Alleen de generieke vorm staat in de app. Klantinhoud komt uit beveiligde opslag.
export const OMGEVING_VERSIE = 1;
export const DEEL_GROOTTE = 600000;
const sleutel = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function valideerOmgeving(pakket) {
  if (!pakket || pakket.versie !== OMGEVING_VERSIE) throw new Error("Dit is geen geldig teamomgevingspakket.");
  const { inhoud, beheer, bestanden } = pakket;
  if (!inhoud || typeof inhoud.titel !== "string" || !inhoud.titel.trim() || inhoud.titel.length > 160) throw new Error("De titel ontbreekt of is te lang.");
  if (!Array.isArray(inhoud.onderdelen) || inhoud.onderdelen.length < 1 || inhoud.onderdelen.length > 12) throw new Error("De onderdelen ontbreken.");
  const ids = new Set();
  for (const deel of inhoud.onderdelen) {
    if (!sleutel.test(deel.id) || ["beheer", "documenten"].includes(deel.id) || ids.has(deel.id) || typeof deel.titel !== "string" || typeof deel.tekst !== "string" || deel.tekst.length > 60000) throw new Error("Een onderdeel is ongeldig of dubbel.");
    ids.add(deel.id);
  }
  if (!beheer || typeof beheer.tekst !== "string" || beheer.tekst.length > 60000) throw new Error("De afzonderlijke beheerinhoud ontbreekt.");
  if (!Array.isArray(bestanden) || bestanden.length > 10) throw new Error("Te veel documenten.");
  const files = new Set();
  let totaal = 0;
  for (const bestand of bestanden) {
    if (!sleutel.test(bestand.id) || files.has(bestand.id) || typeof bestand.titel !== "string" || !/^[^/\\]{1,160}\.pdf$/i.test(bestand.naam) || !/^[a-f0-9]{64}$/.test(bestand.sha256) || typeof bestand.base64 !== "string" || !/^JVBERi0[A-Za-z0-9+/=\r\n]*$/.test(bestand.base64)) throw new Error("Een pdf is ongeldig of dubbel.");
    totaal += bestand.base64.length;
    files.add(bestand.id);
  }
  if (totaal > 7000000 || JSON.stringify(inhoud).length > 200000) throw new Error("Dit pakket is te groot.");
  return pakket;
}

// Genummerde opsommingen die als losse alinea's zijn geschreven.
//
// In de brontekst van een teamomgeving staat het volgnummer soms in een eigen
// alinea, met de actie en de stand van zaken daaronder:
//
//     1
//
//     Verwachtingen van de leidinggevende
//
//     Stand van zaken nog te bespreken
//
// Markdown maakt daar drie losse alinea's van. Het scherm toont dan drie regels
// met precies dezelfde opmaak, waarin het nummer los boven zijn eigen actie
// zweeft en niet te zien is wat de actie is en wat de stand van zaken.
//
// Hieronder wordt dat patroon herkend en omgezet naar de lijst die het al was.
// Er verandert niets aan de woorden: alleen de blokindeling. Herkent de functie
// het patroon niet, dan gaat de tekst ongewijzigd door -- een brontekst die al
// een echte genummerde lijst gebruikt, raakt dit dus niet aan.
const REGELEINDE = /<br\s*\/?>/gi;
const HTML_LABEL = /<\/?(?:a|abbr|b|big|br|cite|code|dd|div|dl|dt|em|h[1-6]|hr|i|li|ol|p|pre|q|s|small|span|strong|sub|sup|table|tbody|td|tfoot|th|thead|tr|u|ul)\b[^>]*>/gi;
const CODEHEK = /^\s{0,3}(```|~~~)/;
const LOS_NUMMER = /^\s{0,3}(\d{1,2})[.)]?\s*$/;
const BLOKGRENS = /^\s{0,3}(#{1,6}\s|[-*+]\s|\d{1,9}[.)]\s|>\s|---|___|\*\*\*|\|)/;

// De spaties die overblijven waar een label stond, worden er weer één. Wat aan
// het begin van een regel staat blijft staan: in markdown is inspringing geen
// witruimte maar betekenis -- het zegt dat een regel bij het lijstitem erboven
// hoort. Die weghalen brak elke actie los van zijn eigen stand van zaken.
function zonderHtml(regel) {
  return regel.replace(REGELEINDE, "  \n").replace(HTML_LABEL, " ").replace(/(\S)[ \t]{2,}(?!\n)/g, "$1 ");
}

export function normaliseerTekst(tekst) {
  if (typeof tekst !== "string" || !tekst.trim()) return "";
  let inCode = false;
  const schoon = tekst.replace(/\r\n?/g, "\n").split("\n").map((regel) => {
    if (CODEHEK.test(regel)) { inCode = !inCode; return regel; }
    return inCode ? regel : zonderHtml(regel);
  }).join("\n");
  const blokken = schoon.split(/\n{2,}/);
  const uit = [];
  for (let i = 0; i < blokken.length; i += 1) {
    const nummer = LOS_NUMMER.exec(blokken[i]);
    const inhoud = [];
    if (nummer) {
      let j = i + 1;
      while (j < blokken.length && blokken[j].trim() && !LOS_NUMMER.test(blokken[j]) && !BLOKGRENS.test(blokken[j])) {
        inhoud.push(blokken[j].trim());
        j += 1;
      }
      if (inhoud.length) i = j - 1;
    }
    if (!inhoud.length) { uit.push(blokken[i]); continue; }
    const streep = "".padStart(nummer[1].length + 2, " ");
    const vervolg = inhoud.slice(1).map((b) => b.split("\n").map((r) => streep + r).join("\n"));
    uit.push([nummer[1] + ". " + inhoud[0], ...vervolg].join("\n\n"));
  }
  return uit.join("\n\n");
}

// Tabellen die als gewone regels zijn opgeschreven.
//
// In de brontekst staat een programma of een tijdlijn soms als losse alinea's
// met een punt ertussen, inclusief een punt aan het eind van de regel:
//
//     Tijd · Onderdeel · Inhoud ·
//     08.45-09.15 · Opening en terugblik · Wat hebben we geleerd? ·
//
// Op het scherm is dat geen tabel maar een rij zinnen: de kopregel ziet er
// precies zo uit als de gegevens eronder, en wie iets zoekt moet elke regel
// helemaal lezen. De woorden kloppen; alleen de vorm ontbreekt.
//
// deelTekst() haalt die blokken eruit en geeft ze terug als kop en rijen, zodat
// het scherm er een echte tabel van kan maken. De voorwaarden zijn streng: twee
// of meer opeenvolgende alinea's, elk met minstens twee scheidingstekens en
// allemaal met evenveel kolommen. Een gewone zin met één punt erin -- "Volgende
// teamdag · 8 oktober 2026" -- blijft dus gewoon een zin.
const SCHEIDING = /\s*[·|]\s*/;
const STREEPRIJ = /^[\s:|-]+$/;

// Met een liggend streepje als scheiding is twee kolommen al duidelijk genoeg;
// met een punt vraagt dat om verwarring met een gewone zin ("Volgende teamdag ·
// 8 oktober 2026"), dus daar zijn er minstens drie nodig.
function alsRij(blok) {
  if (blok.includes("\n") || /^\s{0,3}([#>*+-]|\d{1,9}[.)])\s/.test(blok)) return null;
  const pijp = blok.includes("|");
  const kaal = blok.trim().replace(/^[·|]\s*/, "").replace(/\s*[·|]$/, "");
  if (STREEPRIJ.test(kaal)) return "streep";
  const cellen = kaal.split(SCHEIDING).map((c) => c.trim());
  return cellen.length >= (pijp ? 2 : 3) && cellen.every(Boolean) ? cellen : null;
}

// Een korte regel zonder eindpunt, vlak boven een kop, is geen alinea maar het
// bovenkopje van die kop -- "Onze aandacht" boven "Vier acties uit juni". Als
// gewone alinea ziet dat eruit als een zin die halverwege is afgebroken.
const TIJDLIJNPLEK = /^\[tijdlijn\]$/i;
const KOPJE = /^[^\s#>*+|·-][^\n]{0,46}$/;
const EINDPUNT = /[.!?:;,]$/;

function alsBovenkopje(blok, volgende) {
  // Een ingesprongen regel hoort bij het lijstitem erboven. Zonder deze
  // controle werd de stand van zaken van de laatste actie het bovenkopje van
  // de kop erna -- en verloor die actie zijn eigen regel.
  if (/^\s/.test(blok)) return null;
  if (!volgende || !/^\s{0,3}#{2,4}\s/.test(volgende)) return null;
  const regel = blok.trim();
  return KOPJE.test(regel) && !EINDPUNT.test(regel) && regel.split(/\s+/).length <= 6 ? regel : null;
}

export function deelTekst(tekst) {
  const blokken = normaliseerTekst(tekst).split(/\n{2,}/);
  const delen = [];
  const tekstBlok = (blok) => {
    const vorige = delen[delen.length - 1];
    if (vorige && vorige.soort === "tekst") vorige.tekst += "\n\n" + blok;
    else delen.push({ soort: "tekst", tekst: blok });
  };
  for (let i = 0; i < blokken.length; i += 1) {
    // Een regel [tijdlijn] is geen tekst maar een plek: hier hoort de lijn.
    if (TIJDLIJNPLEK.test(blokken[i].trim())) { delen.push({ soort: "tijdlijn" }); continue; }
    const eerste = alsRij(blokken[i]);
    const rijen = Array.isArray(eerste) ? [eerste] : [];
    let j = i + 1;
    while (rijen.length && j < blokken.length) {
      const volgende = alsRij(blokken[j]);
      if (volgende === "streep") { j += 1; continue; }
      if (!volgende || volgende.length !== rijen[0].length) break;
      rijen.push(volgende);
      j += 1;
    }
    if (rijen.length >= 2) {
      delen.push({ soort: "tabel", kop: rijen[0], rijen: rijen.slice(1) });
      i = j - 1;
      continue;
    }
    const bovenkopje = alsBovenkopje(blokken[i], blokken[i + 1]);
    if (bovenkopje) delen.push({ soort: "bovenkopje", tekst: bovenkopje });
    else tekstBlok(blokken[i]);
  }
  return delen;
}

// De brontekst terug uit de opslag.
//
// Na de import leeft de tekst van een teamomgeving alleen nog in Firestore.
// Wie hem wil corrigeren -- een kop die als alinea is geschreven, een tabel die
// als losse regels is getypt -- kan er niet meer bij. Deze functie zet wat het
// scherm al heeft geladen terug in de vorm van een pakket, zodat de begeleider
// het kan nalezen, verbeteren en als nieuw pakket aanleveren.
//
// Wat er bewust niet in gaat: de bespreeknotities (die zijn van de begeleiders
// zelf en horen niet in een inhoudsbestand) en de pdf's (die staan al apart en
// zijn met hun sha256 te herkennen). Het resultaat is verder een geldig pakket.
export function maakBronPakket(omgeving) {
  const inhoud = omgeving && omgeving.inhoud;
  if (!inhoud || !Array.isArray(inhoud.onderdelen)) throw new Error("Er is geen teamomgeving om te exporteren.");
  return {
    versie: OMGEVING_VERSIE,
    inhoud: {
      titel: inhoud.titel || "",
      intro: inhoud.intro || "",
      onderdelen: inhoud.onderdelen.map((d) => {
        const deel = { id: d.id, titel: d.titel, tekst: d.tekst };
        if (d.groep) deel.groep = d.groep;
        if (Array.isArray(d.tijdlijn) && d.tijdlijn.length) deel.tijdlijn = d.tijdlijn;
        return deel;
      }),
      documentContext: inhoud.documentContext || "",
      documenten: (inhoud.documenten || []).map((d) => ({ id: d.id, titel: d.titel, naam: d.naam, beschrijving: d.beschrijving || "" })),
    },
    beheer: { tekst: (omgeving.beheer && omgeving.beheer.tekst) || "" },
    bestanden: [],
  };
}

// De onderdelen zoals ze in de navigatie staan.
//
// Acht onderdelen in twee rijen gelijkwaardige tabbladen laten zien dát er acht
// dingen zijn, niet hoe ze zich tot elkaar verhouden. Groeperen helpt daarbij,
// maar alleen als de groep uit het pakket komt: welke onderdelen er zijn
// verschilt per team, en een indeling die hier op namen of volgorde gokt, klopt
// bij de volgende klant niet meer.
//
// Een onderdeel mag daarom een veld `groep` hebben. Staat het er niet, dan komt
// het onderdeel gewoon in de lopende lijst -- geen verzonnen kopjes. Documenten
// sluit daarbij aan; Beheer staat apart, want dat is van de begeleiders.
export function maakOnderdelenlijst(inhoud, magBeheer) {
  const groepen = [];
  const opNaam = new Map();
  // Een groep staat op de plek van zijn eerste onderdeel en verzamelt de rest,
  // ook als die er in het pakket niet direct achter staan. Wie het pakket
  // schrijft hoeft dan niet ook nog op de volgorde te letten.
  const voegToe = (naam, item) => {
    if (naam) {
      let groep = opNaam.get(naam);
      if (!groep) { groep = { naam, items: [] }; opNaam.set(naam, groep); groepen.push(groep); }
      groep.items.push(item);
      return;
    }
    const laatste = groepen[groepen.length - 1];
    if (laatste && !laatste.apart && !laatste.naam) laatste.items.push(item);
    else groepen.push({ naam: "", items: [item] });
  };
  for (const deel of (inhoud && inhoud.onderdelen) || []) {
    voegToe(typeof deel.groep === "string" ? deel.groep.trim() : "", { id: deel.id, titel: deel.titel });
  }
  voegToe("", { id: "documenten", titel: "Documenten" });
  if (magBeheer) groepen.push({ naam: "", apart: true, items: [{ id: "beheer", titel: "Beheer" }] });
  return groepen;
}

// Het traject als tijdlijn.
//
// Een traject is geen alinea. "4 juni eerste teamdag afgerond, 8 oktober tweede
// teamdag voorstel" is een rij zinnen waarin je moet tellen hoe ver het is; een
// lijn met haltes laat dat in één oogopslag zien -- wat achter je ligt, waar je
// staat, wat er nog komt.
//
// De haltes komen uit het pakket, niet uit de lopende tekst. Data en standen uit
// een alinea vissen zou raden zijn, en bij de volgende klant anders raden.
//
// Of een halte achter je ligt mag het pakket zeggen met `gedaan`. Staat dat er
// niet, dan wordt het uit de stand afgeleid -- "Afgerond" betekent afgerond.
// Dat is een leeshulp voor de vorm van de lijn, geen oordeel over inhoud: wat
// er staat blijft precies wat de begeleiders hebben opgeschreven.
const GEDAAN = /\b(afgerond|afgesloten|gedaan|klaar|geweest)\b/i;

export function leesTijdlijn(deel) {
  const haltes = deel && Array.isArray(deel.tijdlijn) ? deel.tijdlijn : [];
  return haltes
    .filter((h) => h && typeof h.wanneer === "string" && h.wanneer.trim())
    .slice(0, 12)
    .map((h) => ({
      wanneer: h.wanneer.trim(),
      wat: typeof h.wat === "string" ? h.wat.trim() : "",
      stand: typeof h.stand === "string" ? h.stand.trim() : "",
      gedaan: typeof h.gedaan === "boolean" ? h.gedaan : GEDAAN.test(typeof h.stand === "string" ? h.stand : ""),
    }));
}

export function splitsBestand(base64) {
  return Array.from({ length: Math.ceil(base64.length / DEEL_GROOTTE) }, (_, i) => base64.slice(i * DEEL_GROOTTE, (i + 1) * DEEL_GROOTTE));
}

export async function controleerPdf(bestand) {
  const bytes = Uint8Array.from(atob(bestand.base64), (c) => c.charCodeAt(0));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== bestand.sha256) throw new Error("De pdf is niet volledig of is gewijzigd. Er is niets geopend.");
  return bytes;
}
