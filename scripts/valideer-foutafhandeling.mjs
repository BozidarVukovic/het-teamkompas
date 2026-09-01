// Een controle die bij elke build meedraait: geen enkele knop in de app mag
// stil falen. Dit gat kostte negen plekken; een script is goedkoper dan het
// nog een keer ontdekken.
//
// De regel: elk `finally {` in de app-schermen hoort een `catch` boven zich te
// hebben binnen hetzelfde try-blok. Zo niet, dan verdwijnt de fout in de
// console en ziet de gebruiker alleen een knop die weer aangaat.

import fs from "node:fs";
import path from "node:path";

const MAPPEN = ["src/pages/app", "src/components/app"];
const fouten = [];

for (const map of MAPPEN) {
  for (const naam of fs.readdirSync(map)) {
    if (!naam.endsWith(".jsx") && !naam.endsWith(".js")) continue;
    const pad = path.join(map, naam);
    const regels = fs.readFileSync(pad, "utf8").split("\n");

    regels.forEach((regel, i) => {
      if (!/^\s*\}\s*finally\s*\{/.test(regel)) return;
      // Kijk terug tot het bijbehorende try; staat er geen catch tussen, dan
      // wordt de fout genegeerd.
      let heeftCatch = false;
      for (let j = i; j >= 0 && j > i - 60; j--) {
        if (/^\s*\}\s*catch\b/.test(regels[j])) heeftCatch = true;
        if (/\btry\s*\{/.test(regels[j])) break;
      }
      if (!heeftCatch) fouten.push(`${pad}:${i + 1}`);
    });
  }
}

if (fouten.length > 0) {
  console.error("Deze plekken vangen een fout op zonder er iets mee te doen:");
  fouten.forEach((f) => console.error("  " + f));
  console.error("\nGebruik useActie() of vang de fout op en toon een melding.");
  process.exit(1);
}

console.log(`Foutafhandeling gecontroleerd: geen stille mislukkingen in ${MAPPEN.join(" en ")}.`);
