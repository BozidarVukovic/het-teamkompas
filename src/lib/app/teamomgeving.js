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
const LOS_NUMMER = /^\s{0,3}(\d{1,2})[.)]?\s*$/;
const BLOKGRENS = /^\s{0,3}(#{1,6}\s|[-*+]\s|\d{1,9}[.)]\s|>\s|---|___|\*\*\*|\|)/;

export function normaliseerTekst(tekst) {
  if (typeof tekst !== "string" || !tekst.trim()) return "";
  const blokken = tekst.replace(/\r\n?/g, "\n").split(/\n{2,}/);
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

export function splitsBestand(base64) {
  return Array.from({ length: Math.ceil(base64.length / DEEL_GROOTTE) }, (_, i) => base64.slice(i * DEEL_GROOTTE, (i + 1) * DEEL_GROOTTE));
}

export async function controleerPdf(bestand) {
  const bytes = Uint8Array.from(atob(bestand.base64), (c) => c.charCodeAt(0));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== bestand.sha256) throw new Error("De pdf is niet volledig of is gewijzigd. Er is niets geopend.");
  return bytes;
}
