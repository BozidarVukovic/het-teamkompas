// Onderdelen aan en uit: wie mag schakelen.
//
// De belofte is dat een onderdeel dat uitstaat niet alleen onzichtbaar is maar
// ook niet aan te zetten door wie daar niet over gaat. Dat moet in de
// databaseregels staan; een scherm verbergen is geen slot.
//
// Draait met `npm run test:regels`. Zonder emulator slaat deze suite zichzelf
// over; dat staat dan in de uitvoer.

import test from "node:test";
import fs from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

let draait = false;
try {
  draait = (await fetch("http://127.0.0.1:8080/")).status < 500;
} catch {
  /* De losse suite meldt de overgeslagen beveiligingstest. */
}

test("instellingen: alleen een beheerder zet onderdelen aan", { skip: !draait }, async (t) => {
  const env = await initializeTestEnvironment({
    projectId: "onderdelen-regeltest",
    firestore: { host: "127.0.0.1", port: 8080, rules: fs.readFileSync("firestore.rules", "utf8") },
  });

  const pad = "organisaties/organisatie/teams/evides";
  const db = (uid) => (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());
  const ref = (d) => doc(d, `${pad}/instellingen/onderdelen`);
  const stand = (uid, aan) => ({ versie: 1, kwartaaldoelen: aan, doorUid: uid });

  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d = ctx.firestore();
      for (const [uid, rol] of [["ada", "lid"], ["baas", "beheerder"], ["gids", "begeleider"]]) {
        await setDoc(doc(d, `${pad}/leden/${uid}`), { rol });
      }
      await setDoc(doc(d, "organisaties/organisatie/teams/ander/leden/buiten"), { rol: "beheerder" });
    });

    await t.test("een gewoon teamlid zet niets aan", async () => {
      await assertFails(setDoc(ref(db("ada")), stand("ada", true)));
    });

    await t.test("een beheerder en een begeleider wel", async () => {
      await assertSucceeds(setDoc(ref(db("baas")), stand("baas", true)));
      await assertSucceeds(setDoc(ref(db("gids")), stand("gids", false)));
    });

    await t.test("niemand schakelt onder andermans naam", async () => {
      await assertFails(setDoc(ref(db("baas")), stand("ada", true)));
    });

    await t.test("het hele team mag lezen wat er aanstaat", async () => {
      // Zonder deze leesrechten weet de app van een gewoon teamlid niet wat ze
      // mag tonen, en dan valt alles terug op uit.
      await assertSucceeds(getDoc(ref(db("ada"))));
      await assertSucceeds(getDocs(collection(db("ada"), `${pad}/instellingen`)));
    });

    await t.test("een buitenstaander leest niets en schrijft niets", async () => {
      for (const uid of ["buiten", null]) {
        await assertFails(getDoc(ref(db(uid))));
        await assertFails(setDoc(ref(db(uid)), stand(uid || "niemand", true)));
      }
    });

    await t.test("alleen bekende sleutels, en alleen waar of onwaar", async () => {
      await assertFails(setDoc(ref(db("baas")), { ...stand("baas", true), verzonnen: true }));
      await assertFails(setDoc(ref(db("baas")), { versie: 1, kwartaaldoelen: "ja", doorUid: "baas" }));
      await assertFails(setDoc(ref(db("baas")), { versie: 1, doorUid: "baas" }));
    });

    await t.test("er komt geen tweede instellingendocument naast", async () => {
      // Twee documenten zouden twee waarheden zijn over wat er aanstaat.
      await assertFails(setDoc(doc(db("baas"), `${pad}/instellingen/stiekem`), stand("baas", true)));
    });

    await t.test("weggooien kan niet; uitzetten gaat met de schakelaar", async () => {
      await assertFails(deleteDoc(ref(db("baas"))));
      await assertSucceeds(updateDoc(ref(db("baas")), stand("baas", false)));
    });
  } finally {
    await env.cleanup();
  }
});
