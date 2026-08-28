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
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { deelzin } from "../../data/app/kenmerken";
import { SECTIES, sectie } from "../../data/app/handleiding";

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
export async function maakOrganisatieMetTeam({ uid, naam, organisatieNaam, teamNaam }) {
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

  await setDoc(lidRef(orgId, teamId, uid), {
    naam,
    rol: "beheerder",
    code,
    sindsOp: serverTimestamp(),
  });

  const lidmaatschap = { orgId, teamId, orgNaam: organisatieNaam, teamNaam, rol: "beheerder" };
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
    rol: "lid",
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
  const sleutel = teamsleutel(orgId, teamId);

  const gedeeldeKenmerken = (kenmerken || [])
    .filter((k) => k.waarde && (k.gedeeldMet || []).includes(sleutel) && k.bevestigd !== "nee")
    .map((k) => ({
      kenmerkId: k.kenmerkId,
      waarde: k.waarde,
      zin: deelzin(k.kenmerkId, k.waarde) || "",
    }))
    .filter((k) => k.zin);

  const gedeeldeSecties = SECTIES.map((s) => handleiding && handleiding[s.id])
    .filter((s) => s && s.tekst && (s.gedeeldMet || []).includes(sleutel))
    .map((s) => ({
      sectieId: s.sectieId,
      titel: (sectie(s.sectieId) || {}).titel || s.sectieId,
      tekst: s.tekst,
    }));

  if (gedeeldeKenmerken.length === 0 && gedeeldeSecties.length === 0) {
    await deleteDoc(gedeeldRef(orgId, teamId, uid)).catch(() => {});
    return null;
  }

  const gegevens = {
    naam: naam || "",
    kenmerken: gedeeldeKenmerken,
    handleiding: gedeeldeSecties,
    bijgewerktOp: serverTimestamp(),
  };
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

export async function beoordeelAdviessessie(sessieId, bruikbaar) {
  if (!sessieId) return;
  await updateDoc(doc(db, "adviessessies", sessieId), { bruikbaar });
}

/* -------------------------------------------------- eigen gegevens beheren */

/** Alles wat van deze gebruiker is opgeslagen, als leesbaar object. */
export async function exporteerEigenGegevens(uid) {
  const [gebruiker, profiel, kenmerken, handleiding] = await Promise.all([
    haalGebruiker(uid),
    haalProfiel(uid),
    haalKenmerken(uid),
    haalHandleiding(uid),
  ]);

  const gedeeld = {};
  for (const l of (gebruiker && gebruiker.lidmaatschappen) || []) {
    const eigen = await haalGedeeldVanPersoon(l.orgId, l.teamId, uid);
    if (eigen) gedeeld[`${l.orgNaam || l.orgId} – ${l.teamNaam || l.teamId}`] = eigen;
  }

  return {
    geexporteerdOp: new Date().toISOString(),
    gebruiker,
    profiel,
    kenmerken,
    handleiding,
    gedeeldMetTeams: gedeeld,
  };
}

/** Verwijdert werkelijk alles: eerst het gedeelde, dan de brondata. */
export async function verwijderEigenGegevens(uid) {
  const gebruiker = await haalGebruiker(uid);
  const lidmaatschappen = (gebruiker && gebruiker.lidmaatschappen) || [];

  for (const l of lidmaatschappen) {
    await deleteDoc(gedeeldRef(l.orgId, l.teamId, uid)).catch(() => {});
    await deleteDoc(lidRef(l.orgId, l.teamId, uid)).catch(() => {});
  }

  const [kenmerkenSnap, sectiesSnap] = await Promise.all([
    getDocs(kenmerkenCol(uid)),
    getDocs(sectiesCol(uid)),
  ]);

  const batch = writeBatch(db);
  kenmerkenSnap.docs.forEach((d) => batch.delete(d.ref));
  sectiesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(profielRef(uid));
  batch.delete(handleidingRef(uid));
  batch.delete(gebruikerRef(uid));
  await batch.commit();
}
