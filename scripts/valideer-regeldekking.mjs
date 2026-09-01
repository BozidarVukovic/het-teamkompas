// Heeft elke collectie in firestore.rules ook een gedragstest?
//
// De securitytests draaien tegen de emulator en slaan zichzelf over als die
// niet draait. Een groene run ziet er daardoor hetzelfde uit met en zonder
// dekking. Erger nog: twee collecties — de profielen die een beheerder
// toevoegt en de voorstellen die hij klaarzet — hadden helemaal geen test,
// terwijl daar juist profielgegevens van iemand anders in staan. Dat viel niet
// op omdat niets erop lette.
//
// Deze controle draait bij elke build, heeft geen emulator nodig en kijkt maar
// naar één ding: komt elke collectie uit de regels ergens voor in het
// testbestand. Dat bewijst niet dat de test goed is, wel dat hij bestaat.

import fs from "node:fs";

const REGELS = "firestore.rules";
const TESTS = "tests/securityRules.test.mjs";

// Alleen het app-gedeelte. De backoffice-collecties erboven horen bij de
// publieke site en hebben hun eigen geschiedenis; die er nu bij trekken zou de
// controle meteen onbruikbaar maken.
const BEGIN = "Teamkompas app (/app): besloten samenwerkingsomgeving";

// Collecties die bewust geen gedragstest hebben, met de reden erbij.
const UITGEZONDERD = {
  "{document=**}": "de sluitregel die alles dichtzet; niet los te testen",
  databases: "het pad naar de database zelf, geen collectie",
};

const heleBestand = fs.readFileSync(REGELS, "utf8");
const tests = fs.readFileSync(TESTS, "utf8");

const vanaf = heleBestand.indexOf(BEGIN);
if (vanaf === -1) {
  console.error(`Kon het app-gedeelte niet vinden in ${REGELS}.`);
  console.error(`Verwachte markering: "${BEGIN}"`);
  process.exit(1);
}
const regels = heleBestand.slice(vanaf);

const collecties = [...regels.matchAll(/match \/([A-Za-z0-9_{}=*]+)\//g)]
  .map((m) => m[1])
  .filter((naam, i, alle) => alle.indexOf(naam) === i);

const ontbreekt = collecties.filter(
  (naam) => !UITGEZONDERD[naam] && !tests.includes(naam)
);

if (ontbreekt.length > 0) {
  console.error("Deze collecties staan in de regels maar in geen enkele gedragstest:");
  ontbreekt.forEach((naam) => console.error(`  ${naam}`));
  console.error(`\nVoeg een test toe in ${TESTS}, of zet de collectie met reden in UITGEZONDERD.`);
  process.exit(1);
}

console.log(
  `Regeldekking gecontroleerd: ${collecties.length} collecties, alle genoemd in ${TESTS}.`
);
