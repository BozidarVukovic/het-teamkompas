// scripts/bouw-juridische-pdfs.mjs
//
// Bouwt de algemene voorwaarden en de privacyverklaring als PDF uit de
// tekstbestanden in documenten/. Die tekstbestanden zijn vanaf nu de bron;
// de PDF's in public/ zijn het resultaat.
//
// Tot 16 oktober 2026 bestonden beide documenten alleen als PDF, zonder bron.
// Een wijziging betekende toen: tekst uit een PDF plukken en met de hand een
// nieuwe maken. Bij de omzetting naar een V.O.F. is de tekst eruit gehaald en
// als bron vastgelegd, zodat een volgende aanpassing één regel tekst is.
//
// Draaien met:  node scripts/bouw-juridische-pdfs.mjs
// Dit script draait NIET automatisch mee met de build: juridische documenten
// wijzig je bewust, niet als bijvangst van een deploy.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bronMap = path.join(__dirname, "../documenten");
const doelMap = path.join(__dirname, "../public");

const DOCUMENTEN = [
  { bron: "algemene-voorwaarden.txt", doel: "algemene_voorwaarden_mijnteamkompas.pdf" },
  { bron: "privacyverklaring.txt", doel: "privacyverklaring_mijnteamkompas.pdf" },
];

// Huisstijl, gelijk aan PUB in src/styles/tokens.js.
const DONKER = "#0D1B2A";
const GRIJS = "#4a5a6a";

// Een regel is een kop wanneer hij met "Artikel" begint, met een cijfer en een
// punt gevolgd door een hoofdletter (de genummerde kopjes in de
// privacyverklaring), of wanneer hij in de kopregels van het document staat.
function soortVan(regel, index) {
  const t = regel.trim();
  if (index === 0) return "merk";
  if (index === 1) return "titel";
  if (/^Versie:/.test(t)) return "versie";
  // Tussenkopjes staan in de brontekst gemarkeerd met "## ". Zonder die
  // markering zijn ze niet te onderscheiden van een gewone zin, en plakken ze
  // aan de vorige alinea vast.
  if (/^##\s/.test(t)) return "tussenkop";
  if (/^Artikel\s/.test(t)) return "kop";
  if (/^\d{1,2}\.\s+[A-Z]/.test(t)) return "kop";
  if (/^-\s/.test(t)) return "opsomming";
  if (/^(Handelsnaam|Statutaire naam|Rechtsvorm|KVK-nummer|BTW-identificatienummer|Gevestigd in|Website|E-mail)\s/.test(t)) return "gegeven";
  return "tekst";
}

function bouw({ bron, doel }) {
  const tekst = fs.readFileSync(path.join(bronMap, bron), "utf-8");
  // De brontekst komt uit een PDF, dus een alinea is daar over meerdere regels
  // afgebroken. Die afbrekingen halen we eruit; echte alineagrenzen herkennen
  // we aan een kop, een opsommingsteken of een gegevensregel.
  const ruwe = tekst.split(/\r?\n/).filter((r) => r.trim() !== "");
  const blokken = [];
  ruwe.forEach((regel, i) => {
    const soort = soortVan(regel, i);
    const vorige = blokken[blokken.length - 1];
    // Een gewone regel die volgt op lopende tekst of op een opsommingsteken is
    // een vervolgregel van datzelfde blok, geen nieuwe alinea. Zonder deze
    // samenvoeging valt elke opsomming uiteen in losse stukjes.
    // Een genummerde bepaling ("2.1 ...") begint altijd een eigen alinea, ook
    // al is het verder gewone tekst.
    const bepaling = /^\d{1,2}\.\d{1,2}\s/.test(regel.trim());
    const vervolg = soort === "tekst" && !bepaling && vorige && (vorige.soort === "tekst" || vorige.soort === "opsomming");
    if (vervolg) {
      vorige.tekst += " " + regel.trim();
    } else {
      blokken.push({ soort, tekst: regel.trim() });
    }
  });

  const pdf = new PDFDocument({ size: "A4", margins: { top: 64, bottom: 64, left: 64, right: 64 }, info: { Title: blokken[1]?.tekst || "Mijn Teamkompas", Author: "V.O.F. Mijn Teamkompas" } });
  pdf.pipe(fs.createWriteStream(path.join(doelMap, doel)));

  blokken.forEach((blok, i) => {
    // Het gegevensblok bovenaan (handelsnaam, KvK, btw) staat als een lijstje
    // onder elkaar. Daarna hoort witruimte, anders loopt de inleidende alinea
    // er direct tegenaan.
    if (blok.soort !== "gegeven" && blokken[i - 1]?.soort === "gegeven") pdf.moveDown(0.8);
    switch (blok.soort) {
      case "merk":
        pdf.font("Helvetica-Bold").fontSize(10).fillColor(GRIJS).text(blok.tekst.toUpperCase(), { characterSpacing: 1.2 });
        pdf.moveDown(0.4);
        break;
      case "titel":
        pdf.font("Helvetica-Bold").fontSize(22).fillColor(DONKER).text(blok.tekst);
        pdf.moveDown(0.3);
        break;
      case "versie":
        pdf.font("Helvetica").fontSize(10).fillColor(GRIJS).text(blok.tekst);
        pdf.moveDown(1);
        break;
      case "kop":
        pdf.moveDown(0.7);
        pdf.font("Helvetica-Bold").fontSize(12).fillColor(DONKER).text(blok.tekst);
        pdf.moveDown(0.3);
        break;
      case "tussenkop":
        pdf.moveDown(0.35);
        pdf.font("Helvetica-Bold").fontSize(10.5).fillColor(DONKER).text(blok.tekst.replace(/^##\s*/, ""));
        pdf.moveDown(0.2);
        break;
      case "gegeven":
        pdf.font("Helvetica").fontSize(10).fillColor(DONKER).text(blok.tekst, { lineGap: 2 });
        break;
      case "opsomming":
        pdf.font("Helvetica").fontSize(10).fillColor(DONKER).text(blok.tekst.replace(/^-\s*/, "•  "), { indent: 10, lineGap: 2, align: "justify" });
        pdf.moveDown(0.25);
        break;
      default:
        pdf.font("Helvetica").fontSize(10).fillColor(DONKER).text(blok.tekst, { lineGap: 2.5, align: "justify" });
        pdf.moveDown(0.45);
    }
  });

  pdf.end();
  return blokken.length;
}

DOCUMENTEN.forEach((d) => {
  const aantal = bouw(d);
  console.log(`✓ public/${d.doel}  (${aantal} blokken uit documenten/${d.bron})`);
});
