#!/usr/bin/env node
// Statische controle van firestore.rules.
//
// De volledige gedragstests staan in tests/securityRules.test.mjs en draaien
// tegen de Firestore-emulator (`npm run test:regels`). Dit script vervangt die
// niet, maar bewaakt de invarianten die je met lezen alleen al kunt afdwingen:
// staat elke gevoelige collectie er expliciet in, is er een sluitende
// eindregel, en is nergens per ongeluk een pad opengezet.

import fs from "node:fs";

const regels = fs.readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const fouten = [];
const fout = (m) => fouten.push(m);

// 1. Alles wat niet expliciet is toegestaan, moet dicht staan.
if (!/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(regels)) {
  fout("De sluitende eindregel ontbreekt: zonder `match /{document=**} { allow read, write: if false; }` staat onbekende data open.");
}

// 2. Iedere collectie die de app gebruikt, heeft een eigen regel.
const vereist = [
  "/gebruikers/{uid}",
  "/teamcodes/{code}",
  "/organisaties/{orgId}",
  "/teams/{teamId}",
  "/leden/{uid}",
  "/gedeeld/{uid}",
  "/profielen/{uid}",
  "/kenmerken/{kenmerkId}",
  "/handleidingen/{uid}",
  "/profielvoorstellen/{uid}",
  "/adviessessies/{sessieId}",
];
vereist.forEach((pad) => {
  if (!regels.includes(`match ${pad}`)) fout(`Er is geen regel voor ${pad}.`);
});

// 3. Brondata is uitsluitend voor de eigenaar. Geen enkele regel binnen
//    profielen of handleidingen mag naar teamlidmaatschap kijken.
const blok = (naam) => {
  const start = regels.indexOf(`match /${naam}/{uid}`);
  if (start === -1) return "";
  let diepte = 0;
  const i = regels.indexOf("{", start);
  for (let j = i; j < regels.length; j += 1) {
    if (regels[j] === "{") diepte += 1;
    else if (regels[j] === "}") {
      diepte -= 1;
      if (diepte === 0) return regels.slice(i, j);
    }
  }
  return "";
};

["profielen", "handleidingen"].forEach((naam) => {
  const inhoud = blok(naam);
  if (!inhoud) {
    fout(`Het blok voor ${naam} is niet te lezen.`);
    return;
  }
  if (/isTeamlid|isTeambeheerder|isAdmin/.test(inhoud)) {
    fout(`${naam} verwijst naar teamlidmaatschap of beheer. Brondata hoort uitsluitend voor de eigenaar leesbaar te zijn.`);
  }
  const toestemmingen = inhoud.match(/allow [^;]+;/g) || [];
  toestemmingen.forEach((t) => {
    if (!/ikBen\(uid\)/.test(t)) {
      fout(`${naam}: "${t.trim()}" staat toegang toe zonder de controle ikBen(uid).`);
    }
  });
});

// 4. Nergens een regel die zonder voorwaarde toegang geeft tot leesbare data.
const losseWaar = regels.match(/allow (read|get|list)[^;]*: if true;/g) || [];
if (losseWaar.length) {
  fout(`Er staat leestoegang zonder voorwaarde in de regels: ${losseWaar.join(" ")}`);
}

// 5. Teamcodes mogen wel opvraagbaar zijn, maar niet doorzoekbaar.
if (!/match \/teamcodes\/\{code\} \{[\s\S]*?allow list: if false;/.test(regels)) {
  fout("Teamcodes moeten `allow list: if false;` hebben, anders zijn alle codes op te vragen.");
}

console.log(`Securityregels gecontroleerd: ${(regels.match(/match \//g) || []).length} paden, ${(regels.match(/allow /g) || []).length} toestemmingen.`);

if (fouten.length) {
  console.error(`\n${fouten.length} fout${fouten.length === 1 ? "" : "en"} gevonden:`);
  fouten.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log("\nGeen fouten gevonden. Draai `npm run test:regels` voor de volledige gedragstests tegen de emulator.");
