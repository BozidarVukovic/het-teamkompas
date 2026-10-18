// Kwartaaldoelen: wat de databaseregels wel en niet toestaan.
//
// Twee beloftes staan hier op het spel. Een concept is van jou alleen -- niet
// "wordt niet getoond" maar "kan niet worden opgehaald". En niemand verzet
// werk van een ander zonder diens akkoord, ook een beheerder niet.
//
// Draait met `npm run test:regels`. Zonder emulator slaat deze suite zichzelf
// over; dat staat dan in de uitvoer.

import test from "node:test";
import fs from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

let draait = false;
try {
  draait = (await fetch("http://127.0.0.1:8080/")).status < 500;
} catch {
  /* De losse suite meldt de overgeslagen beveiligingstest. */
}

test("kwartaaldoelen: concepten, eigendom en akkoord", { skip: !draait }, async (t) => {
  const env = await initializeTestEnvironment({
    projectId: "kwartaal-regeltest",
    firestore: { host: "127.0.0.1", port: 8080, rules: fs.readFileSync("firestore.rules", "utf8") },
  });

  const pad = "organisaties/organisatie/teams/evides";
  const db = (uid) => (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore());
  const doelen = (d) => collection(d, `${pad}/kwartaaldoelen`);
  const bijdragen = (d) => collection(d, `${pad}/kwartaalbijdragen`);

  const DOEL = {
    versie: 1,
    kwartaal: "2027-K1",
    titel: "Een bruikbare werkwijze voor instroom",
    succes: "Geslaagd als een proef is uitgevoerd.",
    eigenaarUid: "ada",
    status: "concept",
    gedeeld: false,
  };

  const BIJDRAGE = {
    versie: 1,
    doelId: "doel-gedeeld",
    uid: "ada",
    kwartaal: "2027-K1",
    status: "afgesproken",
    gedeeld: true,
    van: "2027-W02",
    tot: "2027-W09",
    urenPerWeek: 3,
  };

  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d = ctx.firestore();
      for (const [uid, rol] of [["ada", "lid"], ["bram", "lid"], ["baas", "beheerder"]]) {
        await setDoc(doc(d, `${pad}/leden/${uid}`), { rol });
      }
      await setDoc(doc(d, "organisaties/organisatie/teams/ander/leden/buiten"), { rol: "beheerder" });
      await setDoc(doc(d, `${pad}/kwartaaldoelen/doel-concept`), DOEL);
      await setDoc(doc(d, `${pad}/kwartaaldoelen/doel-gedeeld`), {
        ...DOEL,
        status: "afgesproken",
        gedeeld: true,
      });
      await setDoc(doc(d, `${pad}/kwartaalbijdragen/bij-ada`), BIJDRAGE);
      await setDoc(doc(d, `${pad}/kwartaalverzoeken/verzoek-1`), {
        kwartaal: "2027-K1",
        titel: "Nieuw werk",
        waarom: "Omdat het moet.",
        van: "2027-W02",
        tot: "2027-W09",
        bijdragen: [],
        doorUid: "baas",
      });
    });

    /* ──────────────────────────────────────────────── concepten zijn privé */

    await t.test("een concept is alleen voor zijn eigenaar", async () => {
      await assertSucceeds(getDoc(doc(db("ada"), `${pad}/kwartaaldoelen/doel-concept`)));
      await assertFails(getDoc(doc(db("bram"), `${pad}/kwartaaldoelen/doel-concept`)));
      // Ook niet voor een beheerder. Wat hier staat is nog van niemand anders.
      await assertFails(getDoc(doc(db("baas"), `${pad}/kwartaaldoelen/doel-concept`)));
    });

    await t.test("een kale zoekopdracht loopt stuk op het concept van een ander", async () => {
      await assertFails(getDocs(doelen(db("bram"))));
    });

    await t.test("de twee zoekopdrachten die de app gebruikt, werken wel", async () => {
      await assertSucceeds(getDocs(query(doelen(db("bram")), where("gedeeld", "==", true))));
      await assertSucceeds(getDocs(query(doelen(db("ada")), where("eigenaarUid", "==", "ada"))));
    });

    await t.test("zoeken op andermans naam levert niets op", async () => {
      await assertFails(getDocs(query(doelen(db("bram")), where("eigenaarUid", "==", "ada"))));
    });

    await t.test("een buitenstaander komt er helemaal niet in", async () => {
      for (const uid of ["buiten", null]) {
        await assertFails(getDoc(doc(db(uid), `${pad}/kwartaaldoelen/doel-gedeeld`)));
        await assertFails(getDocs(query(doelen(db(uid)), where("gedeeld", "==", true))));
      }
    });

    /* ───────────────────────────────────────────────── gedeeld is afgeleid */

    await t.test("een concept dat zegt dat het gedeeld is, komt er niet in", async () => {
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/leugen`), { ...DOEL, gedeeld: true }));
      await assertFails(
        setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/leugen`), { ...DOEL, status: "afgesproken", gedeeld: false })
      );
      await assertSucceeds(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/eigen`), DOEL));
    });

    await t.test("een doel met uren of een voortgangspercentage wordt geweigerd", async () => {
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/met-uren`), { ...DOEL, urenPerWeek: 8 }));
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/met-score`), { ...DOEL, voortgang: 60 }));
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/met-rang`), { ...DOEL, rang: 1 }));
    });

    await t.test("een doel zonder succescriterium of met een gek kwartaal mag niet", async () => {
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/leeg`), { ...DOEL, succes: "" }));
      await assertFails(setDoc(doc(db("ada"), `${pad}/kwartaaldoelen/gek`), { ...DOEL, kwartaal: "later" }));
    });

    /* ─────────────────────────────────────────────── een doel blijft van jou */

    await t.test("niemand schrijft in het doel van een ander", async () => {
      for (const uid of ["bram", "baas"]) {
        await assertFails(
          updateDoc(doc(db(uid), `${pad}/kwartaaldoelen/doel-gedeeld`), { ...DOEL, status: "afgesproken", gedeeld: true, titel: "Gekaapt" })
        );
      }
    });

    await t.test("de eigenaar van een doel kan niet worden overgezet", async () => {
      await assertFails(
        updateDoc(doc(db("ada"), `${pad}/kwartaaldoelen/doel-gedeeld`), {
          ...DOEL,
          status: "afgesproken",
          gedeeld: true,
          eigenaarUid: "bram",
        })
      );
    });

    await t.test("een gedeeld doel wordt gestopt en niet gewist", async () => {
      await assertFails(deleteDoc(doc(db("ada"), `${pad}/kwartaaldoelen/doel-gedeeld`)));
      await assertSucceeds(deleteDoc(doc(db("ada"), `${pad}/kwartaaldoelen/eigen`)));
    });

    /* ──────────────────────────────────────────────────────────── ruimte */

    await t.test("je eigen ruimte vul je zelf in", async () => {
      const mijn = { versie: 1, uid: "ada", kwartaal: "2027-K1", regels: [{ van: "2027-W02", tot: "2027-W09", urenPerWeek: 3 }] };
      await assertSucceeds(setDoc(doc(db("ada"), `${pad}/kwartaalruimte/ada`), mijn));
      // En niemand anders, ook een beheerder niet.
      await assertFails(setDoc(doc(db("baas"), `${pad}/kwartaalruimte/ada`), { ...mijn, regels: [] }));
      await assertFails(setDoc(doc(db("bram"), `${pad}/kwartaalruimte/ada`), { ...mijn, regels: [] }));
    });

    await t.test("de ruimte van het team is voor het team leesbaar", async () => {
      await assertSucceeds(getDoc(doc(db("bram"), `${pad}/kwartaalruimte/ada`)));
      await assertFails(getDoc(doc(db("buiten"), `${pad}/kwartaalruimte/ada`)));
    });

    await t.test("een reden voor afwezigheid past niet in het document", async () => {
      await assertFails(
        setDoc(doc(db("ada"), `${pad}/kwartaalruimte/ada`), {
          versie: 1,
          uid: "ada",
          kwartaal: "2027-K1",
          regels: [],
          reden: "ziek",
        })
      );
    });

    /* ─────────────────────────────────────────── bijdragen en het akkoord */

    await t.test("je eigen bijdrage werk je zelf bij", async () => {
      await assertSucceeds(updateDoc(doc(db("ada"), `${pad}/kwartaalbijdragen/bij-ada`), { ...BIJDRAGE, urenPerWeek: 4 }));
      await assertFails(updateDoc(doc(db("bram"), `${pad}/kwartaalbijdragen/bij-ada`), { ...BIJDRAGE, urenPerWeek: 1 }));
    });

    await t.test("een beheerder verzet het werk van een ander niet zomaar", async () => {
      await assertFails(
        updateDoc(doc(db("baas"), `${pad}/kwartaalbijdragen/bij-ada`), {
          ...BIJDRAGE,
          urenPerWeek: 4,
          status: "gepauzeerd",
          viaVerzoekId: "verzoek-1",
        })
      );
    });

    await t.test("met het akkoord van de eigenaar mag het wel", async () => {
      await assertSucceeds(
        setDoc(doc(db("ada"), `${pad}/kwartaalverzoeken/verzoek-1/akkoord/ada`), {
          uid: "ada",
          toelichting: "Prima, de evaluatie kan wachten.",
        })
      );
      await assertSucceeds(
        updateDoc(doc(db("baas"), `${pad}/kwartaalbijdragen/bij-ada`), {
          ...BIJDRAGE,
          urenPerWeek: 4,
          status: "gepauzeerd",
          viaVerzoekId: "verzoek-1",
        })
      );
    });

    await t.test("maar de uren blijven van de eigenaar", async () => {
      await assertFails(
        updateDoc(doc(db("baas"), `${pad}/kwartaalbijdragen/bij-ada`), {
          ...BIJDRAGE,
          urenPerWeek: 8,
          status: "gepauzeerd",
          viaVerzoekId: "verzoek-1",
        })
      );
    });

    await t.test("werk naar een ander verhuizen vraagt ook diens akkoord", async () => {
      const verhuis = {
        ...BIJDRAGE,
        urenPerWeek: 4,
        uid: "bram",
        viaVerzoekId: "verzoek-1",
      };
      await assertFails(updateDoc(doc(db("baas"), `${pad}/kwartaalbijdragen/bij-ada`), verhuis));
      await assertSucceeds(
        setDoc(doc(db("bram"), `${pad}/kwartaalverzoeken/verzoek-1/akkoord/bram`), { uid: "bram", toelichting: "" })
      );
      await assertSucceeds(updateDoc(doc(db("baas"), `${pad}/kwartaalbijdragen/bij-ada`), verhuis));
    });

    await t.test("niemand zet een akkoord namens een ander", async () => {
      await assertFails(
        setDoc(doc(db("baas"), `${pad}/kwartaalverzoeken/verzoek-1/akkoord/ada`), { uid: "ada", toelichting: "" })
      );
      await assertFails(
        setDoc(doc(db("baas"), `${pad}/kwartaalverzoeken/verzoek-1/akkoord/baas`), { uid: "ada", toelichting: "" })
      );
    });

    await t.test("een concept-bijdrage is ook alleen van zijn eigenaar", async () => {
      await env.withSecurityRulesDisabled((ctx) =>
        setDoc(doc(ctx.firestore(), `${pad}/kwartaalbijdragen/bij-geheim`), {
          ...BIJDRAGE,
          uid: "bram",
          status: "concept",
          gedeeld: false,
        })
      );
      await assertSucceeds(getDoc(doc(db("bram"), `${pad}/kwartaalbijdragen/bij-geheim`)));
      await assertFails(getDoc(doc(db("ada"), `${pad}/kwartaalbijdragen/bij-geheim`)));
      await assertFails(getDocs(bijdragen(db("ada"))));
    });

    /* ────────────────────────────────────────────────── afhankelijkheden */

    await t.test("een afhankelijkheid hoort bij het team en draagt je naam", async () => {
      const goed = {
        kwartaal: "2027-K1",
        doelId: "doel-gedeeld",
        wachtOp: "doel-ander",
        mijlpaal: "eerste versie",
        bevestigd: false,
        doorUid: "ada",
      };
      await assertFails(
        setDoc(doc(db("ada"), `${pad}/kwartaalafhankelijkheden/a1`), { ...goed, doorUid: "bram" })
      );
      await assertSucceeds(setDoc(doc(db("ada"), `${pad}/kwartaalafhankelijkheden/a1`), goed));
      await assertSucceeds(getDoc(doc(db("bram"), `${pad}/kwartaalafhankelijkheden/a1`)));
      await assertFails(getDoc(doc(db("buiten"), `${pad}/kwartaalafhankelijkheden/a1`)));
    });

    await t.test("een doel kan niet op zichzelf wachten", async () => {
      await assertFails(
        setDoc(doc(db("ada"), `${pad}/kwartaalafhankelijkheden/a2`), {
          kwartaal: "2027-K1",
          doelId: "doel-gedeeld",
          wachtOp: "doel-gedeeld",
          bevestigd: false,
          doorUid: "ada",
        })
      );
    });

    await t.test("bevestigen mag iedereen, de relatie herschrijven niet", async () => {
      // Een afhankelijkheid bevestigen is een vaststelling over het werk, niet
      // over een persoon -- daar hoeft niemand eigenaar van te zijn. Maar wát
      // er op wát wacht veranderen is iets anders dan bevestigen.
      await assertSucceeds(
        updateDoc(doc(db("bram"), `${pad}/kwartaalafhankelijkheden/a1`), {
          kwartaal: "2027-K1",
          doelId: "doel-gedeeld",
          wachtOp: "doel-ander",
          mijlpaal: "eerste versie",
          bevestigd: true,
          doorUid: "ada",
        })
      );
      await assertFails(
        updateDoc(doc(db("bram"), `${pad}/kwartaalafhankelijkheden/a1`), {
          kwartaal: "2027-K1",
          doelId: "doel-gedeeld",
          wachtOp: "iets-anders",
          bevestigd: true,
          doorUid: "ada",
        })
      );
    });

    /* ──────────────────────────────────────────────────────────── besluiten */

    await t.test("een besluit kan niet anoniem en niet zonder afweging", async () => {
      const goed = {
        kwartaal: "2027-K1",
        verzoekId: "verzoek-1",
        optie: "pauzeren",
        afweging: "De evaluatie kan een kwartaal wachten.",
        beslisserUid: "baas",
        mandaat: true,
        wijzigingen: [{ soort: "pauzeren", bijdrageId: "bij-ada" }],
        doorUid: "baas",
      };
      await assertFails(setDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b1`), { ...goed, doorUid: "ada" }));
      await assertFails(setDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b2`), { ...goed, afweging: "" }));
      await assertFails(setDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b3`), { ...goed, mandaat: false }));
      await assertFails(setDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b4`), { ...goed, wijzigingen: [] }));
      await assertSucceeds(setDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b5`), goed));
    });

    await t.test("een genomen besluit blijft staan zoals het is genomen", async () => {
      await assertFails(updateDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b5`), { afweging: "Toch anders" }));
      await assertFails(deleteDoc(doc(db("baas"), `${pad}/kwartaalbesluiten/b5`)));
    });

    /* ──────────────────────────────────────────────────────── geschiedenis */

    await t.test("de geschiedenis is alleen aan te vullen, niet bij te werken", async () => {
      const regel = doc(db("ada"), `${pad}/kwartaaldoelen/doel-gedeeld/geschiedenis/r1`);
      await assertSucceeds(setDoc(regel, { versie: 1, wat: "status", doorUid: "ada", van: "ter-afstemming", naar: "afgesproken" }));
      await assertFails(updateDoc(regel, { naar: "gestopt" }));
      await assertFails(deleteDoc(regel));
      await assertFails(
        setDoc(doc(db("bram"), `${pad}/kwartaaldoelen/doel-gedeeld/geschiedenis/r2`), { versie: 1, wat: "status", doorUid: "ada" })
      );
    });

    await t.test("de geschiedenis van een concept is niet leesbaar voor het team", async () => {
      await env.withSecurityRulesDisabled((ctx) =>
        setDoc(doc(ctx.firestore(), `${pad}/kwartaaldoelen/doel-concept/geschiedenis/r1`), {
          versie: 1,
          wat: "titel",
          doorUid: "ada",
          naar: "Een titel die nog geheim is",
        })
      );
      await assertFails(getDoc(doc(db("bram"), `${pad}/kwartaaldoelen/doel-concept/geschiedenis/r1`)));
    });
  } finally {
    await env.cleanup();
  }
});
