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
  const padTekst = (team, uid) => `organisaties/${ORG}/teams/${team}/handleidingvoorstellen/${uid}`;
  const padAfspraak = (team, id) => `organisaties/${ORG}/teams/${team}/afspraken/${id}`;
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

  test("31. een begeleider mag het team beheren", async () => {
    await zetKlaar();
    await assertSucceeds(updateDoc(doc(cato(), padLid(TEAM_A, "cato")), { rol: "begeleider" }));

    // Begeleiden is een andere plek in het team, geen minder recht: profielen
    // toevoegen en voorstellen klaarzetten blijft gewoon mogelijk.
    await assertSucceeds(
      setDoc(doc(cato(), padProfiellid(TEAM_A, "p7")), {
        naam: "Gast",
        kenmerken: [],
        toegevoegdDoor: "cato",
      })
    );
    await assertSucceeds(
      setDoc(doc(cato(), padVoorstel(TEAM_A, "anna")), { vanUid: "cato", teksten: {} })
    );
  });

  test("32. een begeleider komt nog steeds niet bij andermans profiel", async () => {
    await zetKlaar();
    await assertSucceeds(updateDoc(doc(cato(), padLid(TEAM_A, "cato")), { rol: "begeleider" }));
    await assertFails(getDoc(doc(cato(), "profielen/anna")));
    await assertFails(getDoc(doc(cato(), "profielen/anna/kenmerken/tempo")));
    await assertFails(getDoc(doc(cato(), "handleidingen/anna")));
  });

  test("33. een gewoon lid kan zichzelf ook geen begeleider maken", async () => {
    await zetKlaar();
    // Begeleider is een beheerrol; wie hem zelf kon pakken, kon het team
    // overnemen langs de achterdeur.
    await assertFails(updateDoc(doc(anna(), padLid(TEAM_A, "anna")), { rol: "begeleider" }));
  });

  test("34. met een teamcode treed je toe als lid, niet als beheerder", async () => {
    await zetKlaar();
    // De code is bedoeld om mee te doen. Wie hem heeft, hoort daarmee nog niet
    // het team te kunnen beheren.
    await assertFails(
      setDoc(doc(bram(), padLid(TEAM_A, "bram2")), {
        naam: "Bram",
        rol: "beheerder",
        code: "CODE-TEAM-A",
      })
    );
    // Toetreden met de code mag wel, als lid.
    await assertSucceeds(
      setDoc(doc(dana(), padLid(TEAM_A, "dana")), {
        naam: "Dana",
        rol: "lid",
        code: "CODE-TEAM-A",
      })
    );
  });

  test("35. je kunt jezelf niet tot beheerder van andermans team benoemen", async () => {
    await zetKlaar();
    // Dit was een gat, en een groot: de regel liet iedereen een ledendocument
    // met rol "beheerder" wegschrijven onder een willekeurig team, zonder code
    // en zonder uitnodiging. Daarmee kon je het beheer van een team van iemand
    // anders overnemen en alles lezen wat daar gedeeld is. Nu moet je het team
    // ook echt hebben aangemaakt.
    await assertFails(
      setDoc(doc(dana(), padLid(TEAM_A, "dana")), { naam: "Dana", rol: "beheerder" })
    );
    await assertFails(
      setDoc(doc(dana(), padLid(TEAM_A, "dana")), { naam: "Dana", rol: "begeleider" })
    );
    // En daarna nog steeds niets van dat team kunnen lezen.
    await assertFails(getDoc(doc(dana(), padGedeeld(TEAM_A, "anna"))));
  });

  test("36. wie het team aanmaakt, mag zichzelf wel beheerder of begeleider maken", async () => {
    await zetKlaar();
    await omgeving.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `organisaties/${ORG}/teams/teamC`), {
        naam: "Team C",
        aangemaaktDoor: "dana",
      });
    });

    const padC = `organisaties/${ORG}/teams/teamC/leden/dana`;
    await assertSucceeds(setDoc(doc(dana(), padC), { naam: "Dana", rol: "begeleider" }));
    // Maar iemand anders die het team niet aanmaakte, kan er niet in.
    await assertFails(
      setDoc(doc(bram(), `organisaties/${ORG}/teams/teamC/leden/bram`), {
        naam: "Bram",
        rol: "beheerder",
      })
    );
  });

  /* ------------------------------- tekst voor iemands handleiding */

  test("37. een beheerder kan handleidingtekst klaarzetten, de eigenaar leest hem", async () => {
    await zetKlaar();
    const tekst = { secties: { "hoe-ik-werk": "Ik werk het liefst met een duidelijk doel." }, vanUid: "cato" };
    await assertSucceeds(setDoc(doc(cato(), padTekst(TEAM_A, "anna")), tekst));

    // Anna en degene die het klaarzette mogen het zien.
    await assertSucceeds(getDoc(doc(anna(), padTekst(TEAM_A, "anna"))));
    await assertSucceeds(getDoc(doc(cato(), padTekst(TEAM_A, "anna"))));
    // Bram is teamgenoot, maar dit gaat over Anna.
    await assertFails(getDoc(doc(bram(), padTekst(TEAM_A, "anna"))));
  });

  test("38. een gewoon lid kan geen tekst op andermans naam klaarzetten", async () => {
    await zetKlaar();
    await assertFails(
      setDoc(doc(bram(), padTekst(TEAM_A, "anna")), { secties: { "hoe-ik-werk": "..." }, vanUid: "bram" })
    );
    // Ook niet door te doen alsof het van de beheerder komt.
    await assertFails(
      setDoc(doc(bram(), padTekst(TEAM_A, "anna")), { secties: { "hoe-ik-werk": "..." }, vanUid: "cato" })
    );
  });

  test("39. klaargezette tekst geeft geen weg naar de handleiding zelf", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(cato(), padTekst(TEAM_A, "anna")), { secties: { "hoe-ik-werk": "..." }, vanUid: "cato" })
    );
    // Klaarzetten mag; meekijken in wat Anna er zelf van maakt niet.
    await assertFails(getDoc(doc(cato(), "handleidingen/anna")));
    await assertFails(setDoc(doc(cato(), "handleidingen/anna"), { secties: {} }));
  });

  test("40. de eigenaar kan de klaargezette tekst zelf weghalen", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(cato(), padTekst(TEAM_A, "anna")), { secties: { "hoe-ik-werk": "..." }, vanUid: "cato" })
    );
    await assertFails(deleteDoc(doc(bram(), padTekst(TEAM_A, "anna"))));
    await assertSucceeds(deleteDoc(doc(anna(), padTekst(TEAM_A, "anna"))));
  });

  /* ------------------------------------------------- teamafspraken */

  test("41. iedereen in het team kan een afspraak opschrijven en bijstellen", async () => {
    await zetKlaar();
    // Van het team samen: een afspraak die alleen de beheerder kan opschrijven
    // is er een van bovenaf, en daar verliest hij zijn kracht op.
    await assertSucceeds(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a1")), {
        tekst: "We spreken af wie wat wanneer doet.",
        doorUid: "anna",
        doorNaam: "Anna",
      })
    );
    // En een teamgenoot mag hem bijstellen.
    await assertSucceeds(
      setDoc(
        doc(bram(), padAfspraak(TEAM_A, "a1")),
        { tekst: "We spreken af wie wat wanneer doet, en houden ons daaraan.", doorUid: "anna" },
        { merge: true }
      )
    );
  });

  test("42. wie de afspraak opschreef blijft staan, ook na bijstellen", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a2")), {
        tekst: "We laten elkaar uitpraten.",
        doorUid: "anna",
      })
    );
    // Een afspraak waarvan de herkomst kan veranderen is geen afspraak meer.
    await assertFails(
      setDoc(doc(bram(), padAfspraak(TEAM_A, "a2")), {
        tekst: "We laten elkaar uitpraten.",
        doorUid: "bram",
      })
    );
  });

  test("43. je schrijft een afspraak op je eigen naam, niet op die van een ander", async () => {
    await zetKlaar();
    await assertFails(
      setDoc(doc(bram(), padAfspraak(TEAM_A, "a3")), {
        tekst: "Dit heeft Anna vast gezegd.",
        doorUid: "anna",
      })
    );
  });

  test("44. een lege afspraak komt er niet in", async () => {
    await zetKlaar();
    await assertFails(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a4")), { tekst: "", doorUid: "anna" })
    );
    await assertFails(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a4")), { tekst: "x".repeat(201), doorUid: "anna" })
    );
  });

  test("45. alleen de beheerder haalt een afspraak weg", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a5")), { tekst: "We beginnen op tijd.", doorUid: "anna" })
    );
    // Ook niet wie hem zelf opschreef: er hoort niets stilletjes van tafel te
    // verdwijnen.
    await assertFails(deleteDoc(doc(anna(), padAfspraak(TEAM_A, "a5"))));
    await assertSucceeds(deleteDoc(doc(cato(), padAfspraak(TEAM_A, "a5"))));
  });

  test("46. afspraken blijven binnen het team", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), padAfspraak(TEAM_A, "a6")), { tekst: "We houden het kort.", doorUid: "anna" })
    );
    // Dana zit in team B en heeft hier niets te zoeken.
    await assertFails(getDoc(doc(dana(), padAfspraak(TEAM_A, "a6"))));
    await assertFails(
      setDoc(doc(dana(), padAfspraak(TEAM_A, "a7")), { tekst: "Van buiten.", doorUid: "dana" })
    );
    await assertFails(getDoc(doc(gast(), padAfspraak(TEAM_A, "a6"))));
  });

  /* ------------------------------------------------------------ experimenten */

  test("47. een experiment is van jou alleen, ook voor je teamgenoten", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), "experimenten/x1"), { uid: "anna", actie: "Vraag eerst wat de ander al probeerde." })
    );

    // Bram zit met Anna in hetzelfde team. Dat geeft geen weg naar wat zij met
    // zichzelf heeft afgesproken.
    await assertFails(getDoc(doc(bram(), "experimenten/x1")));
    await assertFails(setDoc(doc(bram(), "experimenten/x2"), { uid: "anna", actie: "iets" }));
    await assertFails(getDoc(doc(gast(), "experimenten/x1")));
  });

  test("48. ook een beheerder ziet niet wat iemand aan zichzelf probeert te veranderen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "experimenten/x3"), { uid: "anna", actie: "Wacht drie tellen." }));

    await assertFails(getDoc(doc(cato(), "experimenten/x3")));
    await assertFails(getDocs(collection(cato(), "experimenten")));
  });

  test("49. de makers mogen hier evenmin bij, anders dan bij adviessessies", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "experimenten/x4"), { uid: "anna", actie: "Zeg het hardop." }));

    // Bij een adviessessie staat alleen dát er advies is gevraagd. Hier staat
    // wat iemand aan zichzelf probeert te veranderen en wat daarvan terechtkwam.
    // Dat is niets voor een dashboard.
    await assertFails(getDoc(doc(maker(), "experimenten/x4")));
    await assertFails(getDocs(collection(maker(), "experimenten")));
  });

  test("50. een experiment zonder actie komt er niet in", async () => {
    await zetKlaar();
    await assertFails(setDoc(doc(anna(), "experimenten/x5"), { uid: "anna", actie: "" }));
    await assertFails(setDoc(doc(anna(), "experimenten/x6"), { uid: "anna" }));
    await assertFails(
      setDoc(doc(anna(), "experimenten/x7"), { uid: "anna", actie: "a".repeat(401) })
    );
  });

  test("51. je kunt je eigen experimenten opvragen, terugblikken en wissen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "experimenten/x8"), { uid: "anna", actie: "Stel één vraag meer." }));
    await assertSucceeds(setDoc(doc(bram(), "experimenten/x9"), { uid: "bram", actie: "Vat het samen." }));

    // Met een filter op je eigen uid mag het; zonder filter of met dat van een
    // ander niet.
    await assertSucceeds(getDocs(query(collection(anna(), "experimenten"), where("uid", "==", "anna"))));
    await assertFails(getDocs(collection(anna(), "experimenten")));
    await assertFails(getDocs(query(collection(anna(), "experimenten"), where("uid", "==", "bram"))));

    // Terugblikken op je eigen experiment kan; het aan een ander toeschrijven niet.
    await assertSucceeds(updateDoc(doc(anna(), "experimenten/x8"), { uitkomst: "hou-ik-vast", tekst: "Hielp." }));
    await assertFails(updateDoc(doc(anna(), "experimenten/x8"), { uid: "bram" }));
    await assertFails(updateDoc(doc(anna(), "experimenten/x9"), { uitkomst: "past-niet" }));

    await assertFails(deleteDoc(doc(anna(), "experimenten/x9")));
    await assertSucceeds(deleteDoc(doc(anna(), "experimenten/x8")));
  });

  /* --------------------------------------------------------- reflecties */

  test("52. een reflectie is van jou alleen", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(anna(), "reflecties/r1"), {
        uid: "anna",
        terugblik: "beter",
        tekst: "Het hielp om eerst te vragen of het uitkwam.",
      })
    );

    await assertFails(getDoc(doc(bram(), "reflecties/r1")));
    await assertFails(getDoc(doc(cato(), "reflecties/r1")));
    await assertFails(getDoc(doc(gast(), "reflecties/r1")));
    await assertFails(setDoc(doc(bram(), "reflecties/r2"), { uid: "anna", terugblik: "anders" }));
  });

  test("53. ook de makers kijken hier niet mee", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "reflecties/r3"), { uid: "anna", terugblik: "anders" }));

    // Hier staat hoe een gesprek ging, in iemands eigen woorden. Net als bij
    // een experiment: geen dashboard.
    await assertFails(getDoc(doc(maker(), "reflecties/r3")));
    await assertFails(getDocs(collection(maker(), "reflecties")));
  });

  test("54. een reflectie zonder antwoord komt er niet in", async () => {
    await zetKlaar();
    await assertFails(setDoc(doc(anna(), "reflecties/r4"), { uid: "anna", terugblik: "" }));
    await assertFails(setDoc(doc(anna(), "reflecties/r5"), { uid: "anna", tekst: "alleen woorden" }));
  });

  test("55. je kunt je eigen reflecties opvragen en wissen", async () => {
    await zetKlaar();
    await assertSucceeds(setDoc(doc(anna(), "reflecties/r6"), { uid: "anna", terugblik: "beter" }));
    await assertSucceeds(setDoc(doc(bram(), "reflecties/r7"), { uid: "bram", terugblik: "anders" }));

    await assertSucceeds(getDocs(query(collection(anna(), "reflecties"), where("uid", "==", "anna"))));
    await assertFails(getDocs(collection(anna(), "reflecties")));
    await assertFails(getDocs(query(collection(anna(), "reflecties"), where("uid", "==", "bram"))));

    // En je schrijft er die van een ander niet op je eigen naam bij.
    await assertFails(updateDoc(doc(anna(), "reflecties/r6"), { uid: "bram" }));
    await assertFails(deleteDoc(doc(anna(), "reflecties/r7")));
    await assertSucceeds(deleteDoc(doc(anna(), "reflecties/r6")));
  });

  // ── Teamcodes ────────────────────────────────────────────────────────────
  //
  // Een teamcode is de sleutel tot een team: wie er een heeft, schrijft zichzelf
  // als lid weg en ziet daarna alles wat dat team deelt. Zolang iedereen zelf
  // een code mocht aanmaken, was het genoeg om een orgId en teamId te kennen om
  // binnen te komen. Deze tests leggen die route vast.

  test("56. een buitenstaander kan geen teamcode maken voor het team van een ander", async () => {
    await zetKlaar();
    // Bram zit in team A en kent dus orgId en teamId, maar hij beheert het niet.
    await assertFails(
      setDoc(doc(bram(), "teamcodes/GESTOLEN"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "bram",
      })
    );
    // Dana zit in een heel ander team en probeert het bij team A.
    await assertFails(
      setDoc(doc(dana(), "teamcodes/GESTOLEN2"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "dana",
      })
    );
  });

  test("57. een verwijderd teamlid schrijft zichzelf niet terug naar binnen", async () => {
    await zetKlaar();
    // Bram wordt uit team A gehaald. Hij weet het orgId en het teamId nog.
    await assertSucceeds(deleteDoc(doc(bram(), padLid(TEAM_A, "bram"))));
    await assertFails(getDoc(doc(bram(), padGedeeld(TEAM_A, "anna"))));

    // De hele route in één keer: eigen code maken, daarmee weer lid worden.
    await assertFails(
      setDoc(doc(bram(), "teamcodes/TERUG"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "bram",
      })
    );
    await assertFails(
      setDoc(doc(bram(), padLid(TEAM_A, "bram")), { rol: "lid", naam: "Bram", code: "TERUG" })
    );
    await assertFails(getDoc(doc(bram(), padGedeeld(TEAM_A, "anna"))));
  });

  test("58. de beheerder van een team maakt en verwijdert er wél een code voor", async () => {
    await zetKlaar();
    await assertSucceeds(
      setDoc(doc(cato(), "teamcodes/NIEUW-A"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "cato",
      })
    );
    await assertSucceeds(deleteDoc(doc(cato(), "teamcodes/NIEUW-A")));
  });

  test("59. een beheerder maakt geen code voor een team dat hij niet beheert", async () => {
    await zetKlaar();
    // Cato beheert team A, maar heeft in team B niets te zoeken.
    await assertFails(
      setDoc(doc(cato(), "teamcodes/VOOR-B"), {
        orgId: ORG,
        teamId: TEAM_B,
        aangemaaktDoor: "cato",
      })
    );
    // En hij buigt zijn eigen code niet om naar dat andere team.
    await assertFails(
      updateDoc(doc(cato(), "teamcodes/CODE-TEAM-A"), { teamId: TEAM_B })
    );
  });

  test("60. een code op naam van iemand anders zetten mag evenmin", async () => {
    await zetKlaar();
    await assertFails(
      setDoc(doc(cato(), "teamcodes/OP-NAAM-VAN-ANNA"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "anna",
      })
    );
  });

  test("61. een gewoon teamlid trekt de code van het team niet in", async () => {
    await zetKlaar();
    // Anna zit in team A maar beheert het niet. Zij kan de code dus niet
    // weghalen en het team ook niet naar een nieuwe code laten wijzen.
    await assertFails(deleteDoc(doc(anna(), "teamcodes/CODE-TEAM-A")));
    await assertFails(
      setDoc(doc(anna(), `organisaties/${ORG}/teams/${TEAM_A}`), { code: "EIGEN" }, { merge: true })
    );
  });

  test("62. de beheerder vernieuwt de code: nieuwe erbij, team om, oude eruit", async () => {
    await zetKlaar();
    // Precies de drie stappen uit vernieuwTeamcode in opslag.js.
    await assertSucceeds(
      setDoc(doc(cato(), "teamcodes/VERS-A"), {
        orgId: ORG,
        teamId: TEAM_A,
        aangemaaktDoor: "cato",
      })
    );
    await assertSucceeds(
      setDoc(doc(cato(), `organisaties/${ORG}/teams/${TEAM_A}`), { code: "VERS-A" }, { merge: true })
    );
    await assertSucceeds(deleteDoc(doc(cato(), "teamcodes/CODE-TEAM-A")));

    // En de ingetrokken code brengt niemand meer binnen.
    await assertFails(
      setDoc(doc(dana(), padLid(TEAM_A, "dana")), {
        rol: "lid",
        naam: "Dana",
        code: "CODE-TEAM-A",
      })
    );
  });

  test.after(async () => {
    await omgeving.cleanup();
  });
}
