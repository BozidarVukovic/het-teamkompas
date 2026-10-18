// De opslag van kwartaaldoelen.
//
// Zes collecties onder het team, en één regel die overal doorheen loopt: wat
// privé is, is privé in de databaseregels en niet alleen op het scherm.
//
//   kwartaaldoelen/{id}            het resultaat dat iemand wil bereiken
//   kwartaaldoelen/{id}/geschiedenis/{id}   wat er veranderde en door wie
//   kwartaalbijdragen/{id}         wat één persoon eraan doet, met uren
//   kwartaalruimte/{uid}           hoeveel ruimte iemand zichzelf geeft
//   kwartaalafhankelijkheden/{id}  wat waarop wacht
//   kwartaalverzoeken/{id}         nieuw werk dat binnenkomt
//   kwartaalbesluiten/{id}         wat er is besloten, met de wijzigingen erin
//
// Waarom bijdragen niet in het doel zitten: dan zou je schrijfrechten op
// iemands doel nodig hebben om je eigen uren bij te werken. Nu schrijft
// iedereen alleen zijn eigen bijdrage, en dat is ook wat de regels afdwingen.
//
// Over het ophalen van doelen
// ---------------------------
// Een concept is alleen van zijn eigenaar. Firestore kan een lijst niet per
// document filteren: een zoekopdracht slaagt alleen als álle gevonden
// documenten door de regels komen. Daarom zijn er precies twee zoekopdrachten
// en nooit een kale: één op `gedeeld == true` voor wat het team mag zien, en
// één op `eigenaarUid == ik` voor wat van jou is. Een kale zoekopdracht zou
// stuklopen zodra er één concept van een ander tussen zit -- en dat is precies
// de bedoeling: liever een fout dan een lek.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  isGedeeld,
  maakGeschiedenisregel,
  magNaarStatus,
  schoonBesluit,
  schoonBijdrage,
  schoonDoel,
  schoonRuimte,
  schoonVerzoek,
} from "./model";

const basis = ({ orgId, teamId }) => `organisaties/${orgId}/teams/${teamId}`;
const pad = (team, naam) => `${basis(team)}/${naam}`;

function klaagOver(uitkomst) {
  if (!uitkomst.ok) throw new Error(uitkomst.fouten.join(" "));
  return uitkomst.waarde;
}

function metId(snap) {
  return { id: snap.id, ...snap.data() };
}

/* ═══════════════════════════════════════════════════════════════ doelen */

/** Wat het team mag zien: alles wat bewust is gedeeld. */
export async function haalGedeeldeDoelen(team, kwartaal) {
  const q = query(
    collection(db, pad(team, "kwartaaldoelen")),
    where("gedeeld", "==", true),
    where("kwartaal", "==", kwartaal)
  );
  return (await getDocs(q)).docs.map(metId);
}

/** Wat van jou is: ook je concepten. */
export async function haalEigenDoelen(team, uid, kwartaal) {
  const q = query(
    collection(db, pad(team, "kwartaaldoelen")),
    where("eigenaarUid", "==", uid),
    where("kwartaal", "==", kwartaal)
  );
  return (await getDocs(q)).docs.map(metId);
}

export async function maakDoel(team, uid, ruw) {
  const waarde = klaagOver(schoonDoel({ ...ruw, eigenaarUid: uid }));
  const ref = await addDoc(collection(db, pad(team, "kwartaaldoelen")), {
    ...waarde,
    doorUid: uid,
    gemaaktOp: serverTimestamp(),
    gewijzigdOp: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Een doel bijwerken, met een regel in de geschiedenis.
 *
 * De status gaat alleen langs de paden die de levensloop toestaat: van concept
 * rechtstreeks naar afgesproken kan niet, want delen is niet hetzelfde als
 * afspreken en daar zit het hele gesprek tussen.
 */
export async function werkDoelBij(team, uid, doelId, wijziging, reden = "") {
  const ref = doc(db, pad(team, "kwartaaldoelen"), doelId);
  const regels = [];

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Dit doel bestaat niet meer.");
    const oud = snap.data();
    if (oud.eigenaarUid !== uid) throw new Error("Alleen de eigenaar van een doel kan het bijwerken.");

    const nieuw = { ...oud, ...wijziging };
    if (nieuw.status !== oud.status && !magNaarStatus(oud.status, nieuw.status)) {
      throw new Error(`Van ${oud.status} naar ${nieuw.status} kan niet in één stap.`);
    }
    const waarde = klaagOver(schoonDoel(nieuw));

    for (const veld of ["status", "titel", "succes", "gewenstVan", "gewenstTot"]) {
      if (oud[veld] !== waarde[veld]) {
        const regel = maakGeschiedenisregel({ wat: veld, doorUid: uid, van: oud[veld] || "", naar: waarde[veld] || "", reden });
        if (regel) regels.push(regel);
      }
    }

    tx.update(ref, { ...waarde, doorUid: uid, gewijzigdOp: serverTimestamp() });
  });

  // De geschiedenis staat buiten de transactie: een mislukte regel mag een
  // geslaagde wijziging niet terugdraaien, en een wijziging zonder regel is
  // erger dan een regel zonder wijziging.
  await Promise.all(
    regels.map((regel) =>
      addDoc(collection(db, pad(team, "kwartaaldoelen"), doelId, "geschiedenis"), {
        ...regel,
        opMoment: serverTimestamp(),
      }).catch(() => null)
    )
  );
}

export async function haalGeschiedenis(team, doelId) {
  const snap = await getDocs(collection(db, pad(team, "kwartaaldoelen"), doelId, "geschiedenis"));
  return snap.docs.map(metId);
}

/**
 * Een doel verwijderen kan niet; stoppen wel.
 *
 * Wat er is afgesproken en waarom het niet doorging, is precies wat je een
 * kwartaal later wilt kunnen teruglezen. Alleen een concept dat nooit gedeeld
 * is geweest, mag echt weg -- dat heeft niemand ooit gezien.
 */
export async function verwijderConcept(team, uid, doelId) {
  const ref = doc(db, pad(team, "kwartaaldoelen"), doelId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.eigenaarUid !== uid) throw new Error("Alleen de eigenaar kan zijn eigen concept weggooien.");
  if (isGedeeld(data.status)) throw new Error("Dit doel is gedeeld geweest. Zet het op gestopt in plaats van het weg te gooien.");
  await deleteDoc(ref);
}

/* ════════════════════════════════════════════════════════════ bijdragen */

export async function haalGedeeldeBijdragen(team, kwartaal) {
  const q = query(
    collection(db, pad(team, "kwartaalbijdragen")),
    where("gedeeld", "==", true),
    where("kwartaal", "==", kwartaal)
  );
  return (await getDocs(q)).docs.map(metId);
}

export async function haalEigenBijdragen(team, uid, kwartaal) {
  const q = query(
    collection(db, pad(team, "kwartaalbijdragen")),
    where("uid", "==", uid),
    where("kwartaal", "==", kwartaal)
  );
  return (await getDocs(q)).docs.map(metId);
}

/** Je eigen bijdrage aan een doel. Ook aan het doel van iemand anders. */
export async function bewaarBijdrage(team, uid, { id = "", kwartaal, ...ruw }) {
  const waarde = klaagOver(schoonBijdrage({ ...ruw, uid }));
  const gegevens = { ...waarde, kwartaal, gewijzigdOp: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, pad(team, "kwartaalbijdragen"), id), gegevens);
    return id;
  }
  const ref = await addDoc(collection(db, pad(team, "kwartaalbijdragen")), {
    ...gegevens,
    gemaaktOp: serverTimestamp(),
  });
  return ref.id;
}

export async function verwijderBijdrage(team, uid, id) {
  const ref = doc(db, pad(team, "kwartaalbijdragen"), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().uid !== uid) throw new Error("Alleen je eigen bijdrage kun je weghalen.");
  await deleteDoc(ref);
}

/* ═══════════════════════════════════════════════════════════════ ruimte */

/**
 * De ruimte van het hele team.
 *
 * Leesbaar voor iedereen in het team: zonder die cijfers is er geen teambeeld,
 * en het zijn uren per week, geen reden waarom iemand er minder heeft.
 */
export async function haalRuimte(team, kwartaal) {
  const q = query(collection(db, pad(team, "kwartaalruimte")), where("kwartaal", "==", kwartaal));
  return (await getDocs(q)).docs.map(metId);
}

/** Je eigen ruimte. Niemand anders schrijft hierin, ook een beheerder niet. */
export async function bewaarRuimte(team, uid, kwartaal, regels) {
  const waarde = klaagOver(schoonRuimte({ uid, kwartaal, regels }));
  await setDoc(doc(db, pad(team, "kwartaalruimte"), uid), {
    ...waarde,
    bijgewerktOp: serverTimestamp(),
  });
}

/* ══════════════════════════════════════════════════════ afhankelijkheden */

export async function haalAfhankelijkheden(team, kwartaal) {
  const q = query(collection(db, pad(team, "kwartaalafhankelijkheden")), where("kwartaal", "==", kwartaal));
  return (await getDocs(q)).docs.map(metId);
}

export async function bewaarAfhankelijkheid(team, uid, { kwartaal, doelId, wachtOp, mijlpaal = "", bevestigd = false }) {
  if (!doelId || !wachtOp || doelId === wachtOp) throw new Error("Een doel kan niet op zichzelf wachten.");
  const ref = await addDoc(collection(db, pad(team, "kwartaalafhankelijkheden")), {
    kwartaal,
    doelId,
    wachtOp,
    mijlpaal: String(mijlpaal || "").slice(0, 200),
    bevestigd: bevestigd === true,
    doorUid: uid,
    gemaaktOp: serverTimestamp(),
  });
  return ref.id;
}

export async function verwijderAfhankelijkheid(team, id) {
  await deleteDoc(doc(db, pad(team, "kwartaalafhankelijkheden"), id));
}

/* ════════════════════════════════════════════════════════════ verzoeken */

export async function haalVerzoeken(team, kwartaal) {
  const q = query(collection(db, pad(team, "kwartaalverzoeken")), where("kwartaal", "==", kwartaal));
  return (await getDocs(q)).docs.map(metId);
}

export async function maakVerzoek(team, uid, ruw) {
  const waarde = klaagOver(schoonVerzoek(ruw));
  const ref = await addDoc(collection(db, pad(team, "kwartaalverzoeken")), {
    ...waarde,
    doorUid: uid,
    gemaaktOp: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Je akkoord op een verzoek.
 *
 * Een los document dat alleen jij kunt schrijven. Daarmee is het iets om op te
 * controleren in plaats van een vinkje dat de app voor je zet: zonder dit
 * document weigeren de databaseregels een besluit dat jouw werk verzet.
 */
export async function bewaarAkkoord(team, uid, verzoekId, toelichting = "") {
  await setDoc(doc(db, pad(team, "kwartaalverzoeken"), verzoekId, "akkoord", uid), {
    uid,
    toelichting: String(toelichting || "").slice(0, 200),
    opMoment: serverTimestamp(),
  });
}

export async function trekAkkoordIn(team, uid, verzoekId) {
  await deleteDoc(doc(db, pad(team, "kwartaalverzoeken"), verzoekId, "akkoord", uid));
}

export async function haalAkkoorden(team, verzoekId) {
  const snap = await getDocs(collection(db, pad(team, "kwartaalverzoeken"), verzoekId, "akkoord"));
  return snap.docs.map(metId);
}

/* ════════════════════════════════════════════════════════════ besluiten */

export async function haalBesluiten(team, kwartaal) {
  const q = query(collection(db, pad(team, "kwartaalbesluiten")), where("kwartaal", "==", kwartaal));
  return (await getDocs(q)).docs.map(metId);
}

/**
 * Een besluit vastleggen en meteen toepassen.
 *
 * Alles of niets. Een half toegepast besluit is erger dan geen besluit: dan
 * staat de ene bijdrage wel gepauzeerd en de andere niet, en niemand weet nog
 * wat er is afgesproken.
 *
 * Voor het toepassen wordt gecontroleerd of de planning sinds het voorstel is
 * veranderd. Is dat zo, dan gaat het niet door en moet het scenario opnieuw
 * worden doorgerekend -- een besluit dat op verouderde cijfers rust, is geen
 * besluit maar een gok.
 */
export async function legBesluitVast(team, uid, ruw) {
  const waarde = klaagOver(schoonBesluit(ruw));
  const raakt = [...new Set(waarde.wijzigingen.map((w) => w.bijdrageId).filter(Boolean))];

  // Wie raakt het, en heeft die persoon akkoord gegeven? De databaseregels
  // controleren dit ook, maar daar is het antwoord "toegang geweigerd". Hier
  // kan er een bruikbare zin uit: welke collega nog moet reageren.
  const akkoorden = new Set(
    (await getDocs(collection(db, pad(team, "kwartaalverzoeken"), waarde.verzoekId, "akkoord"))).docs.map((d) => d.id)
  );

  return runTransaction(db, async (tx) => {
    const refs = raakt.map((id) => doc(db, pad(team, "kwartaalbijdragen"), id));
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));

    const verdwenen = snaps.filter((s) => !s.exists());
    if (verdwenen.length > 0) throw new Error("Een deel van de planning bestaat niet meer. Reken het scenario opnieuw door.");

    if (waarde.gebaseerdOp) {
      const nieuwste = snaps
        .map((s) => s.data().gewijzigdOp)
        .filter(Boolean)
        .map((t) => (t.toMillis ? t.toMillis() : Number(t)))
        .sort((a, b) => b - a)[0];
      if (nieuwste && String(nieuwste) > waarde.gebaseerdOp) {
        throw new Error("De planning is veranderd sinds dit voorstel is gemaakt. Reken het scenario opnieuw door.");
      }
    }

    // Eigen werk mag je altijd zelf veranderen; dat van een ander alleen met
    // zijn akkoord. Voor herverdelen geldt het voor allebei: een collega is
    // geen oplossing die je kunt inplannen.
    const eigenaars = new Map(snaps.map((s) => [s.id, s.data().uid]));
    const ontbreekt = new Set();
    for (const w of waarde.wijzigingen) {
      const van = w.bijdrageId ? eigenaars.get(w.bijdrageId) : null;
      for (const wie of [van, w.soort === "herverdelen" ? w.naar : null]) {
        if (wie && wie !== uid && !akkoorden.has(wie)) ontbreekt.add(wie);
      }
    }
    if (ontbreekt.size > 0) {
      throw new Error(
        `Dit besluit verandert werk van ${ontbreekt.size === 1 ? "een collega die" : "collega's die"} nog geen akkoord heeft gegeven. Vraag dat eerst.`
      );
    }

    const stempel = { viaVerzoekId: waarde.verzoekId, gewijzigdOp: serverTimestamp() };
    for (const w of waarde.wijzigingen) {
      const ref = w.bijdrageId ? doc(db, pad(team, "kwartaalbijdragen"), w.bijdrageId) : null;
      if (w.soort === "pauzeren" && ref) tx.update(ref, { ...stempel, status: "gepauzeerd", gedeeld: true });
      else if (w.soort === "inkorten" && ref) tx.update(ref, { ...stempel, tot: w.tot });
      else if (w.soort === "verschuiven" && ref) tx.update(ref, { ...stempel, van: w.van, tot: w.tot });
      else if (w.soort === "herverdelen" && ref) tx.update(ref, { ...stempel, uid: w.naar });
      else if (w.soort === "toevoegen") {
        const nieuw = doc(collection(db, pad(team, "kwartaalbijdragen")));
        tx.set(nieuw, {
          versie: 1,
          doelId: w.doelId,
          uid: w.uid || "",
          kwartaal: ruw.kwartaal,
          status: "afgesproken",
          gedeeld: true,
          van: w.van,
          tot: w.tot,
          urenPerWeek: typeof w.urenPerWeek === "number" ? w.urenPerWeek : null,
          expertise: "",
          hulpvraag: "",
          viaVerzoekId: waarde.verzoekId,
          gemaaktOp: serverTimestamp(),
          gewijzigdOp: serverTimestamp(),
        });
      }
    }

    const besluit = doc(collection(db, pad(team, "kwartaalbesluiten")));
    tx.set(besluit, {
      ...waarde,
      kwartaal: ruw.kwartaal,
      doorUid: uid,
      genomenOp: serverTimestamp(),
      status: "vastgelegd",
    });
    return besluit.id;
  });
}

/* ═══════════════════════════════════════════════════════ alles in één keer */

/**
 * Wat het teamoverzicht nodig heeft.
 *
 * Eén functie, zodat er niet drie schermen zijn die elk hun eigen deel ophalen
 * en op een ander moment verversen -- dat is hoe twee overzichten iets anders
 * gaan zeggen over hetzelfde kwartaal.
 */
export async function haalKwartaal(team, uid, kwartaal) {
  const [gedeeldeDoelen, eigenDoelen, gedeeldeBijdragen, eigenBijdragen, ruimte, afhankelijkheden, verzoeken, besluiten] =
    await Promise.all([
      haalGedeeldeDoelen(team, kwartaal),
      haalEigenDoelen(team, uid, kwartaal),
      haalGedeeldeBijdragen(team, kwartaal),
      haalEigenBijdragen(team, uid, kwartaal),
      haalRuimte(team, kwartaal),
      haalAfhankelijkheden(team, kwartaal),
      haalVerzoeken(team, kwartaal),
      haalBesluiten(team, kwartaal),
    ]);

  // Een eigen doel kan ook gedeeld zijn; dan staat het in beide lijsten.
  const samen = (a, b) => {
    const op = new Map();
    [...a, ...b].forEach((x) => op.set(x.id, x));
    return [...op.values()];
  };

  return {
    kwartaal,
    doelen: samen(gedeeldeDoelen, eigenDoelen),
    gedeeldeDoelen,
    bijdragen: samen(gedeeldeBijdragen, eigenBijdragen),
    gedeeldeBijdragen,
    ruimte,
    afhankelijkheden,
    verzoeken,
    besluiten,
  };
}

/** Een doel en alles wat eraan hangt in één keer op gestopt zetten. */
export async function stopDoel(team, uid, doelId, reden = "") {
  const bijdragen = (await getDocs(
    query(collection(db, pad(team, "kwartaalbijdragen")), where("doelId", "==", doelId), where("uid", "==", uid))
  )).docs;
  const batch = writeBatch(db);
  batch.update(doc(db, pad(team, "kwartaaldoelen"), doelId), {
    status: "gestopt",
    gedeeld: true,
    doorUid: uid,
    gewijzigdOp: serverTimestamp(),
  });
  bijdragen.forEach((b) => batch.update(b.ref, { status: "gestopt", gewijzigdOp: serverTimestamp() }));
  await batch.commit();
  const regel = maakGeschiedenisregel({ wat: "status", doorUid: uid, van: "", naar: "gestopt", reden });
  if (regel) {
    await addDoc(collection(db, pad(team, "kwartaaldoelen"), doelId, "geschiedenis"), {
      ...regel,
      opMoment: serverTimestamp(),
    }).catch(() => null);
  }
}
