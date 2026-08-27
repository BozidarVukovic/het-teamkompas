// Securitytests tegen de Firestore-emulator.
//
// Deze tests bewijzen dat de privacybeloften van de app technisch worden
// afgedwongen en niet alleen in de interface bestaan. Ze draaien met
// `npm run test:regels`, dat de emulator start.
//
// Wordt de emulator niet gevonden, dan slaan de tests zichzelf over met een
// duidelijke melding in plaats van te falen. Zo blijft `npm test` bruikbaar op
// een machine zonder Java.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, deleteDoc, collection, getDocs, query,
} from "firebase/firestore";

const HOST = "127.0.0.1";
const POORT = 8080;

async function emulatorDraait() {
  try {
    const res = await fetch(`http://${HOST}:${POORT}/`);
    return res.status < 500;
  } catch {
    return false;
  }
}

const draait = await emulatorDraait();

if (!draait) {
  test("securityregels (overgeslagen: emulator draait niet)", { skip: true }, () => {});
} else {
  const omgeving = await initializeTestEnvironment({
    projectId: "teamkompas-regeltest",
    firestore: {
      host: HOST,
      port: POORT,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });

  const ORG = "org1";
  const TEAM_A = "teamA";
  const TEAM_B = "teamB";

  const anna = () => omgeving.authenticatedContext("anna").firestore();
  const bram = () => omgeving.authenticatedContext("bram").firestore();
  const cato = () => omgeving.authenticatedContext("cato").firestore();   // beheerder van team A
  const dana = () => omgeving.authenticatedContext("dana").firestore();   // lid van team B
  const gast = () => omgeving.unauthenticatedContext().firestore();

  const padGedeeld = (team, uid) => `organisaties/${ORG}/teams/${team}/gedeeld/${uid}`;
  const padLid = (team, uid) => `organisaties/${ORG}/teams/${team}/leden/${uid}`;

  // Uitgangssituatie: twee teams, Anna en Bram in team A, Cato beheerder van
  // team A, Dana in team B. Anna deelt iets met team A.
  async function zetKlaar() {
    await omgeving.clearFirestore();
    await omgeving.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `organisaties/${ORG}`), { naam: "Testorganisatie", eigenaar: "cato" });
      await setDoc(doc(db, `organisaties/${ORG}/teams/${TEAM_A}`), { naam: "Team A", aangemaaktDoor: "cato" });
      await setDoc(doc(db, `organisaties/${ORG}/teams/${TEAM_B}`), { naam: "Team B", aangemaaktDoor: "dana" });
      await setDoc(doc(db, padLid(TEAM_A, "anna")), { rol: "lid", naam: "Anna" });
      await setDoc(doc(db, padLid(TEAM_A, "bram")), { rol: "lid", naam: "Bram" });
      await setDoc(doc(db, padLid(TEAM_A, "cato")), { rol: "beheerder", naam: "Cato" });
      await setDoc(doc(db, padLid(TEAM_B, "dana")), { rol: "lid", naam: "Dana" });
      await setDoc(doc(db, `profielen/anna`), { naam: "Anna" });
      await setDoc(doc(db, `profielen/anna/kenmerken/tempo`), { waarde: "rustig", bron: "insights_discovery" });
      await setDoc(doc(db, `handleidingen/anna`), { secties: {} });
      await setDoc(doc(db, padGedeeld(TEAM_A, "anna")), { naam: "Anna", onderdelen: [{ titel: "Zo communiceer ik", tekst: "Graag vooraf context." }] });
      await setDoc(doc(db, padGedeeld(TEAM_B, "dana")), { naam: "Dana", onderdelen: [] });
      await setDoc(doc(db, "teamcodes/CODE-TEAM-A"), { orgId: ORG, teamId: TEAM_A, aangemaaktDoor: "cato" });
    });
  }

  test("1. een gebruiker kan het eigen profiel lezen", async () => {
    await zetKlaar();
    await assertSucceeds(getDoc(doc(anna(), "profielen/anna")));
    await assertSucceeds(getDoc(doc(anna(), "profielen/anna/kenmerken/tempo")));
  });

  test("2. een gebruiker kan het eigen profiel aanpassen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "profielen/anna"), { naam: "Anna B" }, { merge: true }));
    await assertSucceeds(setDoc(doc(anna(), "profielen/anna/kenmerken/tempo"), { waarde: "snel" }, { merge: true }));
  });

  test("3. een gebruiker kan het privéprofiel van een ander niet lezen", async () => {
    await zetKlaar();
    await assertFails(getDoc(doc(bram(), "profielen/anna")));
    await assertFails(getDoc(doc(bram(), "profielen/anna/kenmerken/tempo")));
    await assertFails(getDoc(doc(bram(), "handleidingen/anna")));
    await assertFails(setDoc(doc(bram(), "profielen/anna"), { naam: "gekaapt" }));
  });

  test("4. een gebruiker kan gedeelde informatie van een teamgenoot lezen", async () => {
    await zetKlaar();
    await assertSucceeds(getDoc(doc(bram(), padGedeeld(TEAM_A, "anna"))));
    await assertSucceeds(getDocs(collection(bram(), `organisaties/${ORG}/teams/${TEAM_A}/gedeeld`)));
  });

  test("5. een gebruiker kan geen data uit een ander team lezen", async () => {
    await zetKlaar();
    await assertFails(getDoc(doc(anna(), padGedeeld(TEAM_B, "dana"))));
    await assertFails(getDocs(collection(anna(), `organisaties/${ORG}/teams/${TEAM_B}/gedeeld`)));
    await assertFails(getDoc(doc(anna(), `organisaties/${ORG}/teams/${TEAM_B}`)));
    await assertFails(getDocs(collection(anna(), `organisaties/${ORG}/teams/${TEAM_B}/leden`)));
  });

  test("6. een teambeheerder kan geen privéprofieldata van een teamlid lezen", async () => {
    await zetKlaar();
    await assertFails(getDoc(doc(cato(), "profielen/anna")));
    await assertFails(getDoc(doc(cato(), "profielen/anna/kenmerken/tempo")));
    await assertFails(getDoc(doc(cato(), "handleidingen/anna")));
    await assertFails(getDoc(doc(cato(), "gebruikers/anna")));
    // Wat Anna wél deelt, mag de beheerder net als iedere teamgenoot zien.
    await assertSucceeds(getDoc(doc(cato(), padGedeeld(TEAM_A, "anna"))));
  });

  test("7. een niet-ingelogde bezoeker kan geen besloten data lezen", async () => {
    await zetKlaar();
    await assertFails(getDoc(doc(gast(), "profielen/anna")));
    await assertFails(getDoc(doc(gast(), padGedeeld(TEAM_A, "anna"))));
    await assertFails(getDoc(doc(gast(), `organisaties/${ORG}/teams/${TEAM_A}`)));
    await assertFails(getDoc(doc(gast(), "gebruikers/anna")));
    await assertFails(getDoc(doc(gast(), "teamcodes/CODE-TEAM-A")));
  });

  test("8. ingetrokken gedeelde informatie is niet langer toegankelijk", async () => {
    await zetKlaar();
    await assertSucceeds(getDoc(doc(bram(), padGedeeld(TEAM_A, "anna"))));
    await assertSucceeds(deleteDoc(doc(anna(), padGedeeld(TEAM_A, "anna"))));
    const na = await getDoc(doc(bram(), padGedeeld(TEAM_A, "anna")));
    assert.equal(na.exists(), false, "het gedeelde document bestaat nog na intrekken");
  });

  test("9. een verwijderde gebruiker laat geen persoonlijke gegevens achter", async () => {
    await zetKlaar();
    await assertSucceeds(deleteDoc(doc(anna(), "profielen/anna/kenmerken/tempo")));
    await assertSucceeds(deleteDoc(doc(anna(), "profielen/anna")));
    await assertSucceeds(deleteDoc(doc(anna(), "handleidingen/anna")));
    await assertSucceeds(deleteDoc(doc(anna(), padGedeeld(TEAM_A, "anna"))));
    await assertSucceeds(deleteDoc(doc(anna(), padLid(TEAM_A, "anna"))));
    await assertSucceeds(deleteDoc(doc(anna(), "gebruikers/anna")));

    await omgeving.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      for (const pad of ["profielen/anna", "handleidingen/anna", padGedeeld(TEAM_A, "anna"), padLid(TEAM_A, "anna"), "gebruikers/anna"]) {
        const snap = await getDoc(doc(db, pad));
        assert.equal(snap.exists(), false, `${pad} bestaat nog na verwijderen`);
      }
      const kenmerken = await getDocs(collection(db, "profielen/anna/kenmerken"));
      assert.equal(kenmerken.size, 0, "er staan nog kenmerken van een verwijderde gebruiker");
    });
  });

  test("10. queries kunnen niet buiten de toegestane scope uitlezen", async () => {
    await zetKlaar();
    // Alle profielen doorzoeken mag niet, ook niet als je er zelf één hebt.
    await assertFails(getDocs(query(collection(anna(), "profielen"))));
    await assertFails(getDocs(query(collection(anna(), "gebruikers"))));
    await assertFails(getDocs(query(collection(anna(), "organisaties"))));
    // Teamcodes zijn opvraagbaar maar niet doorzoekbaar.
    await assertSucceeds(getDoc(doc(anna(), "teamcodes/CODE-TEAM-A")));
    await assertFails(getDocs(query(collection(anna(), "teamcodes"))));
    // Leden van het eigen team mogen wel.
    await assertSucceeds(getDocs(collection(anna(), `organisaties/${ORG}/teams/${TEAM_A}/leden`)));
  });

  test("11. je kunt jezelf niet zomaar aan een team toevoegen", async () => {
    await zetKlaar();
    // Zonder kloppende code lukt toetreden niet.
    await assertFails(setDoc(doc(dana(), padLid(TEAM_A, "dana")), { rol: "lid", naam: "Dana", code: "BESTAAT-NIET" }));
    // Met de juiste code wel.
    await assertSucceeds(setDoc(doc(dana(), padLid(TEAM_A, "dana")), { rol: "lid", naam: "Dana", code: "CODE-TEAM-A" }));
    // En niet namens een ander.
    await assertFails(setDoc(doc(dana(), padLid(TEAM_A, "eddy")), { rol: "lid", naam: "Eddy", code: "CODE-TEAM-A" }));
  });

  test("12. gedeelde informatie schrijven kan alleen voor jezelf", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), padGedeeld(TEAM_A, "anna")), { naam: "Anna", onderdelen: [] }));
    await assertFails(setDoc(doc(bram(), padGedeeld(TEAM_A, "anna")), { naam: "Anna", onderdelen: [] }));
    await assertFails(deleteDoc(doc(bram(), padGedeeld(TEAM_A, "anna"))));
  });

  test("13. adviessessies zijn persoonlijk", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "adviessessies/s1"), { uid: "anna", situatie: "feedback-geven" }));
    await assertFails(getDoc(doc(bram(), "adviessessies/s1")));
    await assertFails(setDoc(doc(bram(), "adviessessies/s2"), { uid: "anna", situatie: "x" }));
  });

  test.after(async () => {
    await omgeving.cleanup();
  });
}
