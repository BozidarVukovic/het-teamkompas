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
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where,
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
  // Overslaan mag, stil overslaan niet. Zonder deze regels ziet een run zonder
  // dekking er hetzelfde uit als een run mét, en dat is precies hoe twee
  // collecties maandenlang ongetest konden blijven.
  console.error("");
  console.error("  ┌──────────────────────────────────────────────────────────────┐");
  console.error("  │  LET OP: de securityregels zijn NIET getest.                 │");
  console.error("  │  De Firestore-emulator draait niet, dus de gedragstests op   │");
  console.error("  │  firestore.rules zijn overgeslagen. Draai `npm run           │");
  console.error("  │  test:regels` voordat je nieuwe regels uitrolt.              │");
  console.error("  └──────────────────────────────────────────────────────────────┘");
  console.error("");
  test("securityregels (OVERGESLAGEN — emulator draait niet)", { skip: true }, () => {});
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
  // De makers van de app; isAdmin() in de regels kijkt naar het e-mailadres.
  const maker = () =>
    omgeving.authenticatedContext("maker", { email: "bozidar@mijnteamkompas.nl" }).firestore();

  const padGedeeld = (team, uid) => `organisaties/${ORG}/teams/${team}/gedeeld/${uid}`;
  const padProfiellid = (team, id) => `organisaties/${ORG}/teams/${team}/profielleden/${id}`;
  const padVoorstel = (team, uid) => `organisaties/${ORG}/teams/${team}/profielvoorstellen/${uid}`;
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

  test("14. een teambeheerder kan niet zien wie welk advies opvroeg", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "adviessessies/s3"), { uid: "anna", situatie: "irritatie" }));

    // Cato beheert team A, waar Anna in zit. Dat geeft geen enkele weg naar
    // Anna's adviessessies — niet naar één, en niet naar de hele lijst.
    await assertFails(getDoc(doc(cato(), "adviessessies/s3")));
    await assertFails(getDocs(collection(cato(), "adviessessies")));
  });

  test("15. de makers mogen de sessies wel doorzoeken, want anders meten ze niets", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "adviessessies/s4"), { uid: "anna", situatie: "weerstand" }));
    await assertSucceeds(getDocs(collection(maker(), "adviessessies")));
    await assertSucceeds(getDoc(doc(maker(), "adviessessies/s4")));
  });

  test("16. je kunt je eigen adviessessies opvragen om ze te kunnen wissen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "adviessessies/s6"), { uid: "anna", situatie: "irritatie" }));
    await assertSucceeds(setDoc(doc(bram(), "adviessessies/s7"), { uid: "bram", situatie: "weerstand" }));

    // Met een filter op je eigen uid mag het.
    await assertSucceeds(
      getDocs(query(collection(anna(), "adviessessies"), where("uid", "==", "anna")))
    );
    // Zonder filter, of met dat van een ander, niet.
    await assertFails(getDocs(collection(anna(), "adviessessies")));
    await assertFails(
      getDocs(query(collection(anna(), "adviessessies"), where("uid", "==", "bram")))
    );

    // En wissen kan alleen je eigen sessie.
    await assertFails(deleteDoc(doc(anna(), "adviessessies/s7")));
    await assertSucceeds(deleteDoc(doc(anna(), "adviessessies/s6")));
  });

  /* --------- profielen die een beheerder zelf toevoegt en klaarzet --------- */

  test("17. alleen een beheerder kan een profiel aan het team toevoegen", async () => {
    await zetKlaar();
    const profiel = { naam: "Eva", kenmerken: [], toegevoegdDoor: "cato" };

    // Cato beheert team A.
    await assertSucceeds(setDoc(doc(cato(), padProfiellid(TEAM_A, "p1")), profiel));
    // Anna is gewoon lid en kan dat niet.
    await assertFails(setDoc(doc(anna(), padProfiellid(TEAM_A, "p2")), { ...profiel, toegevoegdDoor: "anna" }));
    // Dana zit in een ander team en kan er helemaal niet bij.
    await assertFails(setDoc(doc(dana(), padProfiellid(TEAM_A, "p3")), { ...profiel, toegevoegdDoor: "dana" }));
  });

  test("18. een beheerder kan een profiel niet op andermans naam zetten", async () => {
    await zetKlaar();
    // "toegevoegd door" moet degene zijn die het toevoegt; anders staat er bij
    // een profiel een naam die het er niet heeft neergezet.
    await assertFails(
      setDoc(doc(cato(), padProfiellid(TEAM_A, "p4")), { naam: "Eva", toegevoegdDoor: "anna" })
    );
  });

  test("19. teamgenoten kunnen een toegevoegd profiel lezen, buitenstaanders niet", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(cato(), padProfiellid(TEAM_A, "p5")), { naam: "Eva", toegevoegdDoor: "cato" }));

    await assertSucceeds(getDoc(doc(anna(), padProfiellid(TEAM_A, "p5"))));
    await assertFails(getDoc(doc(dana(), padProfiellid(TEAM_A, "p5"))));
    await assertFails(getDoc(doc(gast(), padProfiellid(TEAM_A, "p5"))));
  });

  test("20. een lid kan een toegevoegd profiel niet weggooien", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(cato(), padProfiellid(TEAM_A, "p6")), { naam: "Eva", toegevoegdDoor: "cato" }));
    await assertFails(deleteDoc(doc(anna(), padProfiellid(TEAM_A, "p6"))));
    await assertSucceeds(deleteDoc(doc(cato(), padProfiellid(TEAM_A, "p6"))));
  });

  test("21. een beheerder kan een voorstel klaarzetten, maar alleen voor een teamgenoot", async () => {
    await zetKlaar();
    const voorstel = { vanUid: "cato", vanNaam: "Cato", voorkeurskleur: "blauw", teksten: {} };

    await assertSucceeds(setDoc(doc(cato(), padVoorstel(TEAM_A, "anna")), voorstel));
    // Dana zit niet in team A; er hoort geen voorstel voor haar te kunnen staan.
    await assertFails(setDoc(doc(cato(), padVoorstel(TEAM_A, "dana")), voorstel));
    // En een gewoon lid kan sowieso niets klaarzetten.
    await assertFails(
      setDoc(doc(anna(), padVoorstel(TEAM_A, "bram")), { ...voorstel, vanUid: "anna" })
    );
  });

  test("22. een voorstel is voor degene over wie het gaat, niet voor de rest van het team", async () => {
    await zetKlaar();
    const voorstel = { vanUid: "cato", vanNaam: "Cato", voorkeurskleur: "blauw", teksten: {} };
    await assertSucceeds(setDoc(doc(cato(), padVoorstel(TEAM_A, "anna")), voorstel));

    // Anna zelf en de beheerder die het neerzette mogen het zien.
    await assertSucceeds(getDoc(doc(anna(), padVoorstel(TEAM_A, "anna"))));
    await assertSucceeds(getDoc(doc(cato(), padVoorstel(TEAM_A, "anna"))));
    // Bram is teamgenoot, maar dit gaat over Anna.
    await assertFails(getDoc(doc(bram(), padVoorstel(TEAM_A, "anna"))));
  });

  test("23. een voorstel geeft de beheerder geen weg naar het profiel zelf", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(cato(), padVoorstel(TEAM_A, "anna")), {
        vanUid: "cato",
        vanNaam: "Cato",
        voorkeurskleur: "blauw",
        teksten: {},
      })
    );

    // Dit is de kern: klaarzetten mag, meekijken niet. Er wordt nooit iets in
    // andermans profiel geschreven en er is geen weg naartoe.
    await assertFails(getDoc(doc(cato(), "profielen/anna")));
    await assertFails(getDoc(doc(cato(), "profielen/anna/kenmerken/tempo")));
    await assertFails(getDoc(doc(cato(), "handleidingen/anna")));
    await assertFails(setDoc(doc(cato(), "profielen/anna/kenmerken/tempo"), { waarde: "snel" }));
  });

  test("24. degene over wie een voorstel gaat, kan het zelf weggooien", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(cato(), padVoorstel(TEAM_A, "anna")), { vanUid: "cato", voorkeurskleur: "blauw", teksten: {} })
    );
    await assertFails(deleteDoc(doc(bram(), padVoorstel(TEAM_A, "anna"))));
    await assertSucceeds(deleteDoc(doc(anna(), padVoorstel(TEAM_A, "anna"))));
  });

  test("25. de makers mogen wel meelezen, maar niets van iemand veranderen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "adviessessies/s5"), { uid: "anna", situatie: "herhaling" }));
    await assertFails(setDoc(doc(maker(), "adviessessies/s5"), { uid: "anna", bruikbaar: true }));
    await assertFails(deleteDoc(doc(maker(), "adviessessies/s5")));

    // En nergens bij het profiel of de handleiding van een gebruiker.
    await assertFails(getDoc(doc(maker(), "profielen/anna/kenmerken/tempo")));
    await assertFails(getDoc(doc(maker(), "handleidingen/anna/secties/werk")));
  });

  /* ------------------------------------------------------- de beheerdersrol */

  test("26. een teamlid kan zichzelf geen beheerder maken", async () => {
    await zetKlaar();
    // Dit was een echt gat: de regel liet elk lid zijn eigen ledendocument
    // bijwerken, dus ook het veld waar "beheerder" in staat. Wie de app-code
    // omzeilde, kon zichzelf het beheer van een team geven.
    await assertFails(updateDoc(doc(anna(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));
    await assertFails(
      setDoc(doc(anna(), padLid(TEAM_A, "anna")), { naam: "Anna", rol: "beheerder" })
    );
  });

  test("27. een teamlid mag wel de eigen naam en functie bijwerken", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), padLid(TEAM_A, "anna")), { naam: "Anna B", functie: "Adviseur" }, { merge: true })
    );
  });

  test("28. een beheerder kan de rol van een teamgenoot zetten en weer weghalen", async () => {
    await zetKlaar();
    await assertSucceeds(updateDoc(doc(cato(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));
    // En terugdraaien kan ook, anders is overdragen een eenrichtingsweg.
    await assertSucceeds(updateDoc(doc(cato(), padLid(TEAM_A, "anna")), { rol: "lid" }));
  });

  test("29. alleen een beheerder van dít team kan rollen aanpassen", async () => {
    await zetKlaar();
    // Bram is teamgenoot, maar geen beheerder.
    await assertFails(updateDoc(doc(bram(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));
    // Dana zit in een ander team.
    await assertFails(updateDoc(doc(dana(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));
    // En een gast al helemaal niet.
    await assertFails(updateDoc(doc(gast(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));
  });

  test("30. wie beheerder is geworden, kan daarna ook echt beheren", async () => {
    await zetKlaar();
    await assertSucceeds(updateDoc(doc(cato(), padLid(TEAM_A, "anna")), { rol: "beheerder" }));

    // De rol betekent iets: profielen toevoegen mag nu. Maar hij geeft nog
    // steeds geen weg naar het profiel van een teamgenoot.
    await assertSucceeds(
      setDoc(doc(anna(), padProfiellid(TEAM_A, "p9")), {
        naam: "Gast",
        kenmerken: [],
        toegevoegdDoor: "anna",
      })
    );
    await assertFails(getDoc(doc(anna(), "profielen/bram")));
  });

  test.after(async () => {
    await omgeving.cleanup();
  });
}
