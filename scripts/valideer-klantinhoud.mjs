// Klantinhoud hoort niet in versiebeheer.
//
// Een omgevingspakket en een geexporteerde brontekst bevatten echte teaminhoud:
// namen, afspraken, wat er in een team speelt. Die bestanden moeten in de
// werkmap kunnen staan, want daar wordt eraan gewerkt, maar ze mogen nooit
// meegaan in een commit. Een regel in .gitignore is daarvoor het begin; deze
// controle maakt er een voorwaarde van.
//
// Er wordt twee dingen nagegaan:
//   1. staan de negeerregels er nog? Iemand kan ze weghalen zonder het te zien
//   2. wordt er op dit moment zo'n bestand bijgehouden? Dat kan met `git add -f`
//      of doordat het bestand er al was voordat de regel bestond
//
// Zonder git -- een export van de map, een omgeving zonder geschiedenis -- kan
// stap 2 niets vaststellen. Dan wordt dat gemeld en niet stilzwijgend gemist.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REGELS = ["omgevingspakketten/", "*teamomgeving-brontekst*.json"];
const PATRONEN = [/(^|\/)omgevingspakketten\//, /teamomgeving-brontekst[^/]*\.json$/i];

const fouten = [];

let negeer = "";
try { negeer = readFileSync(".gitignore", "utf8"); }
catch { fouten.push(".gitignore ontbreekt, dus klantinhoud wordt nergens buitengehouden."); }

for (const regel of REGELS) {
  if (negeer && !negeer.split("\n").some((r) => r.trim() === regel)) {
    fouten.push(`De negeerregel "${regel}" staat niet meer in .gitignore.`);
  }
}

let bijgehouden = null;
try {
  bijgehouden = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\0").filter(Boolean);
} catch {
  console.log("valideer-klantinhoud: geen git beschikbaar, alleen .gitignore is gecontroleerd.");
}

for (const pad of bijgehouden || []) {
  if (PATRONEN.some((p) => p.test(pad))) fouten.push(`${pad} wordt bijgehouden in git en bevat waarschijnlijk klantinhoud.`);
}

if (fouten.length) {
  console.error("\nKlantinhoud in versiebeheer:\n");
  for (const fout of fouten) console.error(`  - ${fout}`);
  console.error("\nHaal het bestand uit de index met `git rm --cached <pad>` en zet de negeerregel terug.\n");
  process.exit(1);
}

console.log(`valideer-klantinhoud: in orde (${bijgehouden ? bijgehouden.length : 0} bestanden bekeken).`);
