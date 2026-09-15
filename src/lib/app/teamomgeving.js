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

export function splitsBestand(base64) {
  return Array.from({ length: Math.ceil(base64.length / DEEL_GROOTTE) }, (_, i) => base64.slice(i * DEEL_GROOTTE, (i + 1) * DEEL_GROOTTE));
}

export async function controleerPdf(bestand) {
  const bytes = Uint8Array.from(atob(bestand.base64), (c) => c.charCodeAt(0));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== bestand.sha256) throw new Error("De pdf is niet volledig of is gewijzigd. Er is niets geopend.");
  return bytes;
}
