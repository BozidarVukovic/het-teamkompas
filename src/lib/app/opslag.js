// Alle communicatie met Firestore voor de samenwerkomgeving.
//
// Eén laag, zodat de rest van de app niet weet hoe de database is ingedeeld.
// De indeling zelf staat beschreven in docs/APP-ARCHITECTUUR.md; de kern is
// dat brondata (profielen, handleidingen) strikt privé is en dat wat je deelt
// als aparte kopie per team wordt weggeschreven. Delen is dus een schrijfactie,
// intrekken is een verwijderactie.

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { deelzin } from "../../data/app/kenmerken";
import { SECTIES, sectie } from "../../data/app/handleiding";
import { haalVoorstel, verwijderVoorstel } from "./voorstellen";
import { stelGedeeldeKopieSamen } from "./gedeeldeKopie";

/* ------------------------------------------------------------------ paden */

export const teamsleutel = (orgId, teamId) => `${orgId}/${teamId}`;

export function splitsTeamsleutel(sleutel) {
  const [orgId, teamId] = String(sleutel || "").split("/");
  return orgId && teamId ? { orgId, teamId } : null;
}

const gebruikerRef = (uid) => doc(db, "gebruikers", uid);
const organisatieRef = (orgId) => doc(db, "organisaties", orgId);
const teamRef = (orgId, teamId) => doc(db, "organisaties", orgId, "teams", teamId);
const ledenCol = (orgId, teamId) => collection(db, "organisaties", orgId, "teams", teamId, "leden");
const lidRef = (orgId, teamId, uid) => doc(db, "organisaties", orgId, "teams", teamId, "leden", uid);
const gedeeldCol = (orgId, teamId) => collection(db, "organisaties", orgId, "teams", teamId, "gedeeld");
const profielledenCol = (orgId, teamId) =>
  collection(db, "organisaties", orgId, "teams", teamId, "profielleden");
const profiellidRef = (orgId, teamId, id) =>
  doc(db, "organisaties", orgId, "teams", teamId, "profielleden", id);
const gedeeldRef = (orgId, teamId, uid) => doc(db, "organisaties", orgId, "teams", teamId, "gedeeld", uid);
const profielRef = (uid) => doc(db, "profielen", uid);
const kenmerkenCol = (uid) => collection(db, "profielen", uid, "kenmerken");
const kenmerkRef = (uid, kenmerkId) => doc(db, "profielen", uid, "kenmerken", kenmerkId);
const handleidingRef = (uid) => doc(db, "handleidingen", uid);
const sectiesCol = (uid) => collection(db, "handleidingen", uid, "secties");
const sectieRef = (uid, sectieId) => doc(db, "handleidingen", uid, "secties", sectieId);
const teamcodeRef = (code) => doc(db, "teamcodes", code);

/* ------------------------------------------------------------- gebruikers */

export async function haalGebruiker(uid) {
  const snap = await getDoc(gebruikerRef(uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function maakGebruiker(uid, { naam, email }) {
  const gegevens = {
    naam: naam || "",
    email: email || "",
    lidmaatschappen: [],
    aangemaaktOp: serverTimestamp(),
  };
  await setDoc(gebruikerRef(uid), gegevens, { merge: true });
  return { uid, ...gegevens, lidmaatschappen: [] };
}

export async function werkGebruikerBij(uid, velden) {
  await updateDoc(gebruikerRef(uid), velden);
}

/* ------------------------------------------------- organisaties en teams */

/** Een leesbare code die niet te raden is, maar wel over te typen. */
export function nieuweTeamcode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const cijfers = "23456789";
  const trek = (bron, n) =>
    Array.from({ length: n }, () => bron[Math.floor(Math.random() * bron.length)]).join("");
  return `${trek(letters, 4)}-${trek(cijfers, 4)}`;
}

/**
 * Maakt een organisatie met een eerste team. De maker wordt beheerder van dat
 * team. Beheerder zijn geeft geen enkel inzicht in profielen van anderen; het
 * gaat alleen over de teamgegevens zelf.
 */
export async function maakOrganisatieMetTeam({
  uid,
  naam,
  organisatieNaam,
  teamNaam,
  begeleid = false,
}) {
  const orgId = doc(collection(db, "organisaties")).id;
  const teamId = doc(collection(db, "organisaties", orgId, "teams")).id;
  const code = nieuweTeamcode();

  await setDoc(organisatieRef(orgId), {
    naam: organisatieNaam,
    eigenaar: uid,
    aangemaaktOp: serverTimestamp(),
  });

  await setDoc(teamRef(orgId, teamId), {
    naam: teamNaam,
    code,
    aangemaaktDoor: uid,
    aangemaaktOp: serverTimestamp(),
  });

  await setDoc(teamcodeRef(code), {
    orgId,
    teamId,
    aangemaaktDoor: uid,
    aangemaaktOp: serverTimestamp(),
  });

  // Wie een team begeleidt, beheert het wel maar doet er niet aan mee. Dat is
  // meteen bij het aanmaken de juiste rol: anders komt de facilitator eerst
  // tussen de mensen van zijn klant te staan en moet hij zich daar daarna weer
  // uit halen.
  await setDoc(lidRef(orgId, teamId, uid), {
    naam,
    rol: begeleid ? "begeleider" : "beheerder",
    code,
    sindsOp: serverTimestamp(),
  });

  const lidmaatschap = { orgId, teamId, orgNaam: organisatieNaam, teamNaam };
  await voegLidmaatschapToe(uid, lidmaatschap);
  return lidmaatschap;
}

/** Zoekt het team dat bij een teamcode hoort. */
export async function zoekTeamViaCode(code) {
  const schoon = String(code || "").trim().toUpperCase();
  if (!schoon) return null;

  const codeSnap = await getDoc(teamcodeRef(schoon));
  if (!codeSnap.exists()) return null;

  const { orgId, teamId } = codeSnap.data();
  // Het teamdocument mag je pas lezen als je lid bent. Vóór toetreden geeft
  // Firestore hier dus een weigering; dat is de bedoeling en geen fout.
  const [orgSnap, teamSnap] = await Promise.all([
    getDoc(organisatieRef(orgId)).catch(() => null),
    getDoc(teamRef(orgId, teamId)).catch(() => null),
  ]);

  return {
    code: schoon,
    orgId,
    teamId,
    orgNaam: orgSnap && orgSnap.exists() ? orgSnap.data().naam : "",
    // Het teamdocument is pas leesbaar als je lid bent; vóór toetreden blijft
    // de naam daarom leeg. Dat is geen fout, maar het gevolg van de regels.
    teamNaam: teamSnap && teamSnap.exists() ? teamSnap.data().naam : "",
  };
}

export async function treedToeMetCode({ uid, naam, code }) {
  const gevonden = await zoekTeamViaCode(code);
  if (!gevonden) return null;

  await setDoc(lidRef(gevonden.orgId, gevonden.teamId, uid), {
    naam,
    rol: "lid",
    code: gevonden.code,
    sindsOp: serverTimestamp(),
  });

  // Nu we lid zijn, is het teamdocument wél leesbaar.
  const teamSnap = await getDoc(teamRef(gevonden.orgId, gevonden.teamId));
  const teamNaam = teamSnap.exists() ? teamSnap.data().naam : gevonden.teamNaam;

  const lidmaatschap = {
    orgId: gevonden.orgId,
    teamId: gevonden.teamId,
    orgNaam: gevonden.orgNaam,
    teamNaam,
  };
  await voegLidmaatschapToe(uid, lidmaatschap);
  return lidmaatschap;
}

async function voegLidmaatschapToe(uid, lidmaatschap) {
  const gebruiker = await haalGebruiker(uid);
  const bestaand = (gebruiker && gebruiker.lidmaatschappen) || [];
  const zonderDubbel = bestaand.filter(
    (l) => !(l.orgId === lidmaatschap.orgId && l.teamId === lidmaatschap.teamId)
  );
  await setDoc(
    gebruikerRef(uid),
    { lidmaatschappen: [...zonderDubbel, lidmaatschap] },
    { merge: true }
  );
}

export async function verlaatTeam({ uid, orgId, teamId }) {
  // Eerst weghalen wat gedeeld is, daarna het lidmaatschap zelf.
  await deleteDoc(gedeeldRef(orgId, teamId, uid)).catch(() => {});
  await deleteDoc(lidRef(orgId, teamId, uid));

  const gebruiker = await haalGebruiker(uid);
  const over = ((gebruiker && gebruiker.lidmaatschappen) || []).filter(
    (l) => !(l.orgId === orgId && l.teamId === teamId)
  );
  await setDoc(gebruikerRef(uid), { lidmaatschappen: over }, { merge: true });
}

/**
 * Verwijdert een team echt, inclusief de organisatie en de teamcode.
 *
 * Alleen zinvol voor de beheerder die als enige over is: zolang er anderen in
 * zitten, hoort een team niet onder hun voeten weg te kunnen verdwijnen.
 *
 * De volgorde is niet vrijblijvend. De securityregels leiden "ben ik beheerder"
 * af uit het ledendocument, dus dat moet als laatste weg — haal je het er eerst
 * uit, dan mag je het team daarna niet meer verwijderen en blijft het achter.
 */
export async function verwijderTeam({ uid, orgId, teamId, code }) {
  await deleteDoc(gedeeldRef(orgId, teamId, uid)).catch(() => {});
  await deleteDoc(teamRef(orgId, teamId));
  if (code) await deleteDoc(teamcodeRef(code)).catch(() => {});
  await deleteDoc(organisatieRef(orgId)).catch(() => {});
  await deleteDoc(lidRef(orgId, teamId, uid)).catch(() => {});

  const gebruiker = await haalGebruiker(uid);
  const over = ((gebruiker && gebruiker.lidmaatschappen) || []).filter(
    (l) => !(l.orgId === orgId && l.teamId === teamId)
  );
  await setDoc(gebruikerRef(uid), { lidmaatschappen: over }, { merge: true });
}

/**
 * Zet je naam en functie in elk team waar je lid van bent.
 *
 * Je naam staat op drie plekken: in je eigen gebruikersdocument, in het
 * lid-document per team, en in de kopie die je met een team deelt. Alleen de
 * eerste bijwerken is niet genoeg — dan blijven je teamgenoten de oude naam
 * zien tot je toevallig iets aan je profiel verandert.
 *
 * Je functie is optioneel en gaat mee naar je teams, want daar is hij voor.
 * Leeg laten betekent leeg wegschrijven, zodat weghalen ook echt weghalen is.
 */
export async function werkLidgegevensBij({ uid, lidmaatschappen = [], naam = "", functie = "" }) {
  const velden = { naam, functie };

  await Promise.all(
    (lidmaatschappen || []).map((l) =>
      setDoc(lidRef(l.orgId, l.teamId, uid), velden, { merge: true }).catch(() => {})
    )
  );

  // De gedeelde kopie bestaat alleen als je iets deelt. Bestaat hij niet, dan
  // valt er niets bij te werken en is dat geen fout.
  await Promise.all(
    (lidmaatschappen || []).map((l) =>
      updateDoc(gedeeldRef(l.orgId, l.teamId, uid), { naam }).catch(() => {})
    )
  );
}

/**
 * Zet de rol van iemand in dit team op "lid" of "beheerder".
 *
 * Alleen een beheerder mag dit; firestore.rules houdt de rest tegen. De vraag
 * of het in dít geval verstandig is — je mag nooit de laatste beheerder
 * wegnemen — wordt beantwoord in teamrollen.js, voordat we hier komen.
 *
 * De rol staat uitsluitend in het ledendocument. Hij stond ook in het
 * lidmaatschap in je eigen gebruikersdocument, en dat kon niet kloppen: als een
 * beheerder jou promoveert, kan hij jouw gebruikersdocument niet schrijven, dus
 * bleef daar "lid" staan. Niets las het gelukkig, maar een veld dat structureel
 * kan liegen hoort er niet te zijn. Nu is er één plek, en dat is dezelfde plek
 * waar de securityregels naar kijken.
 */
export async function zetTeamrol({ orgId, teamId, uid, rol }) {
  await updateDoc(lidRef(orgId, teamId, uid), { rol });
}

/**
 * Je eigen rol per team.
 *
 * De rol staat in het ledendocument — dezelfde plek waar de securityregels naar
 * kijken — en dus per team apart. Hij stond ooit ook in het lidmaatschap in je
 * eigen gebruikersdocument, maar dat kon niet kloppen: een beheerder die jou
 * promoveert kan jouw gebruikersdocument niet schrijven.
 *
 * Mislukt het ophalen voor een team, dan blijft dat team hier weg. De app leest
 * dat als "gewoon lid", en dat is de veilige kant: iemand ten onrechte als
 * begeleider behandelen zou zijn gedeelde punten verbergen.
 */
export async function haalEigenRollen(uid, lidmaatschappen = []) {
  const paren = await Promise.all(
    (lidmaatschappen || []).map(async (l) => {
      try {
        const snap = await getDoc(lidRef(l.orgId, l.teamId, uid));
        if (!snap.exists()) return null;
        return [teamsleutel(l.orgId, l.teamId), snap.data().rol || "lid"];
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(paren.filter(Boolean));
}

export async function haalTeamleden(orgId, teamId) {
  const snap = await getDocs(ledenCol(orgId, teamId));
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .sort((a, b) => String(a.naam || "").localeCompare(String(b.naam || "")));
}

export async function haalTeam(orgId, teamId) {
  const snap = await getDoc(teamRef(orgId, teamId));
  return snap.exists() ? { orgId, teamId, ...snap.data() } : null;
}

/* ---------------------------------------------------------- eigen profiel */

export async function haalProfiel(uid) {
  const snap = await getDoc(profielRef(uid));
  return snap.exists() ? snap.data() : null;
}

export async function bewaarInsights(uid, insights) {
  await setDoc(
    profielRef(uid),
    { insights, bijgewerktOp: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Bewaart de punten die uit een Insights-profiel zijn gehaald.
 *
 * Strikt privé, net als de rest van het profiel. Ze dienen als naslag bij het
 * schrijven van de handleiding; ze worden nooit vanzelf gedeeld en ook nooit
 * vanzelf in een handleidingtekst gezet.
 */
export async function bewaarProfielteksten(uid, teksten) {
  await setDoc(
    profielRef(uid),
    { insightsTeksten: teksten || {}, bijgewerktOp: serverTimestamp() },
    { merge: true }
  );
}

export async function wisInsights(uid) {
  await setDoc(
    profielRef(uid),
    { insights: null, insightsTeksten: {}, bijgewerktOp: serverTimestamp() },
    { merge: true }
  );
}

export async function haalKenmerken(uid) {
  const snap = await getDocs(kenmerkenCol(uid));
  return snap.docs.map((d) => ({ kenmerkId: d.id, ...d.data() }));
}

/**
 * Bewaart één kenmerk. `gedeeldMet` bepaalt met welke teams dit kenmerk
 * gedeeld wordt; die lijst is leidend bij het bijwerken van de gedeelde kopie.
 */
export async function bewaarKenmerk(uid, kenmerk) {
  const gegevens = {
    kenmerkId: kenmerk.kenmerkId,
    waarde: kenmerk.waarde || null,
    bron: kenmerk.bron || "manual",
    bevestigd: kenmerk.bevestigd || null,
    gedeeldMet: kenmerk.gedeeldMet || [],
    laatstBevestigdOp: new Date().toISOString(),
  };
  await setDoc(kenmerkRef(uid, kenmerk.kenmerkId), gegevens, { merge: true });
  return gegevens;
}

export async function bewaarKenmerken(uid, kenmerken) {
  const batch = writeBatch(db);
  const nu = new Date().toISOString();
  const uit = [];
  kenmerken.forEach((k) => {
    const gegevens = {
      kenmerkId: k.kenmerkId,
      waarde: k.waarde || null,
      bron: k.bron || "manual",
      bevestigd: k.bevestigd || null,
      gedeeldMet: k.gedeeldMet || [],
      laatstBevestigdOp: nu,
    };
    batch.set(kenmerkRef(uid, k.kenmerkId), gegevens, { merge: true });
    uit.push(gegevens);
  });
  await batch.commit();
  return uit;
}

export async function verwijderKenmerk(uid, kenmerkId) {
  await deleteDoc(kenmerkRef(uid, kenmerkId));
}

/* ------------------------------------------------------------ handleiding */

export async function haalHandleiding(uid) {
  const snap = await getDocs(sectiesCol(uid));
  const uit = {};
  snap.docs.forEach((d) => {
    uit[d.id] = { sectieId: d.id, ...d.data() };
  });
  return uit;
}

export async function bewaarSectie(uid, { sectieId, tekst, gedeeldMet, bron }) {
  await setDoc(handleidingRef(uid), { bijgewerktOp: serverTimestamp() }, { merge: true });
  const gegevens = {
    sectieId,
    tekst: tekst || "",
    gedeeldMet: gedeeldMet || [],
    bron: bron || null,
    bijgewerktOp: new Date().toISOString(),
  };
  await setDoc(sectieRef(uid, sectieId), gegevens, { merge: true });
  return gegevens;
}

export async function verwijderSectie(uid, sectieId) {
  await deleteDoc(sectieRef(uid, sectieId));
}

/* ----------------------------------------------------------- delen per team */

/**
 * Schrijft de gedeelde kopie voor één team opnieuw weg.
 *
 * Alleen wat de gebruiker voor dit team heeft aangevinkt komt erin, en altijd
 * als leesbare zin — nooit als ruwe waarde met bron erbij. Is er niets
 * aangevinkt, dan wordt de kopie verwijderd. Zo bestaat er geen document met
 * restanten van eerder delen.
 */
export async function werkGedeeldBij({ uid, naam, orgId, teamId, kenmerken, handleiding }) {
  // Wát er in de kopie komt, staat in gedeeldeKopie.js — een pure functie, met
  // tests. Hier wordt er alleen nog mee geschreven of verwijderd.
  const kopie = stelGedeeldeKopieSamen({
    naam,
    sleutel: teamsleutel(orgId, teamId),
    kenmerken,
    handleiding,
  });

  if (!kopie) {
    // Niets aangevinkt betekent geen kopie, niet een lege kopie. Zo blijven er
    // geen restanten van eerder delen achter.
    await deleteDoc(gedeeldRef(orgId, teamId, uid)).catch(() => {});
    return null;
  }

  const gegevens = { ...kopie, bijgewerktOp: serverTimestamp() };
  await setDoc(gedeeldRef(orgId, teamId, uid), gegevens);
  return gegevens;
}

/** Werkt de gedeelde kopie bij voor elk team waar de gebruiker lid van is. */
export async function werkAlleGedeeldBij({ uid, naam, lidmaatschappen, kenmerken, handleiding }) {
  await Promise.all(
    (lidmaatschappen || []).map((l) =>
      werkGedeeldBij({ uid, naam, orgId: l.orgId, teamId: l.teamId, kenmerken, handleiding })
    )
  );
}

export async function haalGedeeldVanTeam(orgId, teamId) {
  const snap = await getDocs(gedeeldCol(orgId, teamId));
  const uit = {};
  snap.docs.forEach((d) => {
    uit[d.id] = { uid: d.id, ...d.data() };
  });
  return uit;
}

export async function haalGedeeldVanPersoon(orgId, teamId, uid) {
  const snap = await getDoc(gedeeldRef(orgId, teamId, uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/* ------------------------------------------------------- profielen van de beheerder */

/**
 * Een profiel dat een beheerder zelf toevoegt.
 *
 * Bedoeld voor mensen die nog geen account hebben, of om een team compleet te
 * maken bij een sessie. Het staat los van de profielen van echte gebruikers en
 * is voor het hele team leesbaar, want het is per definitie gedeelde informatie:
 * de beheerder zet het er neer om ermee te werken.
 *
 * Bij zo'n profiel hoort altijd wie het heeft toegevoegd. De app laat dat zien,
 * zodat niemand denkt dat de persoon zelf dit heeft ingevuld en bevestigd.
 */
export async function bewaarProfiellid({ orgId, teamId, id, naam, kenmerken, insights, toegevoegdDoor, toegevoegdDoorNaam }) {
  const profielId = id || doc(profielledenCol(orgId, teamId)).id;
  const gegevens = {
    naam: naam || "",
    kenmerken: (kenmerken || []).filter((k) => k && k.kenmerkId && k.waarde && k.zin),
    insights: insights || null,
    toegevoegdDoor,
    toegevoegdDoorNaam: toegevoegdDoorNaam || "",
    bijgewerktOp: serverTimestamp(),
  };
  await setDoc(profiellidRef(orgId, teamId, profielId), gegevens, { merge: true });
  return { id: profielId, ...gegevens };
}

export async function haalProfielleden(orgId, teamId) {
  const snap = await getDocs(profielledenCol(orgId, teamId));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data(), doorBeheerder: true }))
    .sort((a, b) => String(a.naam || "").localeCompare(String(b.naam || "")));
}

export async function verwijderProfiellid({ orgId, teamId, id }) {
  await deleteDoc(profiellidRef(orgId, teamId, id));
}

/* ------------------------------------------------------------- adviessessies */

/**
 * Legt vast dát er advies is gevraagd, nooit wát er geadviseerd is en over wie.
 * Bedoeld om te leren of de app werkt, niet om gedrag te volgen.
 */
export async function logAdviessessie({ uid, situatieId, aantalBlokken }) {
  const ref = doc(collection(db, "adviessessies"));
  await setDoc(ref, {
    uid,
    situatieId,
    aantalBlokken: aantalBlokken || 0,
    opgevraagdOp: serverTimestamp(),
  });
  return ref.id;
}

export async function beoordeelAdviessessie(sessieId, bruikbaar, toelichting) {
  if (!sessieId) return;
  const velden = { bruikbaar };
  // Alleen wat iemand echt heeft ingetypt slaan we op; een leeg veld is geen
  // antwoord en hoort niet als lege string in de database te belanden.
  const tekst = String(toelichting || "").trim();
  if (tekst) velden.toelichting = tekst.slice(0, 500);
  await updateDoc(doc(db, "adviessessies", sessieId), velden);
}

/** De adviessessies van één persoon. Nodig om ze te kunnen meenemen en wissen. */
export async function haalEigenAdviessessies(uid) {
  const snap = await getDocs(query(collection(db, "adviessessies"), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Alle adviessessies, voor de makers van de app.
 *
 * Alleen de velden die iets zeggen over het gebruik van de app. De uid gaat
 * mee om verschillende mensen te kunnen tellen, maar wordt nergens getoond en
 * is met opzet niet naar een naam te herleiden — daar bestaat geen weg voor.
 */
export async function haalAdviessessies() {
  const snap = await getDocs(collection(db, "adviessessies"));
  return snap.docs.map((d) => {
    const g = d.data();
    return {
      id: d.id,
      uid: g.uid || null,
      situatieId: g.situatieId || null,
      bruikbaar: typeof g.bruikbaar === "boolean" ? g.bruikbaar : null,
      toelichting: g.toelichting || "",
      opgevraagdOp: g.opgevraagdOp || null,
    };
  });
}

/* -------------------------------------------------- eigen gegevens beheren */

/** Alles wat van deze gebruiker is opgeslagen, als leesbaar object. */
export async function exporteerEigenGegevens(uid) {
  const [gebruiker, profiel, kenmerken, handleiding, adviessessies] = await Promise.all([
    haalGebruiker(uid),
    haalProfiel(uid),
    haalKenmerken(uid),
    haalHandleiding(uid),
    // Hier staat je uid in, dus het hoort in je export. Zonder dit klopte de
    // zin "hieronder staat precies wat er van je bewaard wordt" niet.
    haalEigenAdviessessies(uid).catch(() => []),
  ]);

  const gedeeld = {};
  const voorstellen = {};
  for (const l of (gebruiker && gebruiker.lidmaatschappen) || []) {
    const naam = `${l.orgNaam || l.orgId} – ${l.teamNaam || l.teamId}`;
    const eigen = await haalGedeeldVanPersoon(l.orgId, l.teamId, uid);
    if (eigen) gedeeld[naam] = eigen;

    // Een voorstel dat een facilitator voor je klaarzette, staat op jouw naam
    // en gaat over jou. Dus ook dat is van jou.
    const voorstel = await haalVoorstel({ orgId: l.orgId, teamId: l.teamId, uid }).catch(() => null);
    if (voorstel) voorstellen[naam] = voorstel;
  }

  return {
    geexporteerdOp: new Date().toISOString(),
    gebruiker,
    profiel,
    kenmerken,
    handleiding,
    gedeeldMetTeams: gedeeld,
    profielvoorstellen: voorstellen,
    adviessessies,
  };
}

/** Verwijdert werkelijk alles: eerst het gedeelde, dan de brondata. */
export async function verwijderEigenGegevens(uid) {
  const gebruiker = await haalGebruiker(uid);
  const lidmaatschappen = (gebruiker && gebruiker.lidmaatschappen) || [];

  for (const l of lidmaatschappen) {
    await deleteDoc(gedeeldRef(l.orgId, l.teamId, uid)).catch(() => {});
    await deleteDoc(lidRef(l.orgId, l.teamId, uid)).catch(() => {});
    // Een voorstel dat iemand voor je klaarzette gaat over jou en staat op
    // jouw naam. Bleef het staan, dan bleef er profielinformatie over jou
    // achter op een plek waar een beheerder bij kan.
    await verwijderVoorstel({ orgId: l.orgId, teamId: l.teamId, uid }).catch(() => {});
  }

  const [kenmerkenSnap, sectiesSnap, sessies] = await Promise.all([
    getDocs(kenmerkenCol(uid)),
    getDocs(sectiesCol(uid)),
    // Hier staat je uid in. Lieten we ze staan, dan bleef er na "alles
    // verwijderen" een spoor achter dat je zelf niet kunt vinden.
    haalEigenAdviessessies(uid).catch(() => []),
  ]);

  const batch = writeBatch(db);
  kenmerkenSnap.docs.forEach((d) => batch.delete(d.ref));
  sectiesSnap.docs.forEach((d) => batch.delete(d.ref));
  sessies.forEach((s) => batch.delete(doc(db, "adviessessies", s.id)));
  batch.delete(profielRef(uid));
  batch.delete(handleidingRef(uid));
  batch.delete(gebruikerRef(uid));
  await batch.commit();
}
