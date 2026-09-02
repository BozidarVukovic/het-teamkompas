// Profielvoorstellen: wat een facilitator klaarzet voor een teamlid.
//
// Een facilitator heeft vaak de Insights-profielen van een team al in huis. Die
// kan hij hier inlezen en als voorstel klaarzetten. Nadrukkelijk als voorstel:
// het staat los van het profiel van die persoon, en alleen die persoon kan het
// overnemen. Er wordt nooit iets in andermans profiel geschreven — dat kan ook
// technisch niet, want profielen zijn alleen leesbaar en schrijfbaar voor de
// eigenaar zelf.
//
// Zodra een voorstel is overgenomen of afgewezen, wordt het verwijderd. Er
// blijft dus geen kopie van iemands profielgegevens rondslingeren op een plek
// waar een beheerder bij kan.

import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { schoneSecties, schoonVoorstel } from "./voorstelOpschonen";

const voorstelRef = (orgId, teamId, uid) =>
  doc(db, "organisaties", orgId, "teams", teamId, "profielvoorstellen", uid);

const voorstellenCol = (orgId, teamId) =>
  collection(db, "organisaties", orgId, "teams", teamId, "profielvoorstellen");

const handleidingvoorstelRef = (orgId, teamId, uid) =>
  doc(db, "organisaties", orgId, "teams", teamId, "handleidingvoorstellen", uid);

const handleidingvoorstellenCol = (orgId, teamId) =>
  collection(db, "organisaties", orgId, "teams", teamId, "handleidingvoorstellen");


export async function bewaarVoorstel({ orgId, teamId, uid, vanUid, vanNaam, voorstel }) {
  const schoon = schoonVoorstel(voorstel);
  if (!schoon.voorkeurskleur) throw new Error("Een voorstel heeft in elk geval een voorkeurskleur nodig.");

  await setDoc(voorstelRef(orgId, teamId, uid), {
    ...schoon,
    vanUid,
    vanNaam: vanNaam || "",
    aangemaaktOp: serverTimestamp(),
  });
  return schoon;
}

export async function haalVoorstel({ orgId, teamId, uid }) {
  const snap = await getDoc(voorstelRef(orgId, teamId, uid));
  return snap.exists() ? { uid, orgId, teamId, ...snap.data() } : null;
}

/** Alle openstaande voorstellen in een team. Alleen voor de beheerder. */
export async function haalVoorstellen({ orgId, teamId }) {
  const snap = await getDocs(voorstellenCol(orgId, teamId));
  const uit = {};
  snap.docs.forEach((d) => {
    uit[d.id] = { uid: d.id, orgId, teamId, ...d.data() };
  });
  return uit;
}

export async function verwijderVoorstel({ orgId, teamId, uid }) {
  await deleteDoc(voorstelRef(orgId, teamId, uid));
}

/* ------------------------------------------- tekst voor de handleiding */

/**
 * Tekst die een facilitator uit een teamsessie voor iemand klaarzet.
 *
 * Een team dat samen een hand-in-handleiding heeft gemaakt, heeft die woorden
 * al geschreven — meestal in een presentatie die na de sessie in een map
 * verdwijnt. Ze opnieuw laten intypen is de zekerste manier om ze kwijt te
 * raken. Dus zet de facilitator ze klaar, en hoeft de eigenaar alleen nog te
 * lezen, bijstellen en bevestigen.
 *
 * Nadrukkelijk een voorstel. Het staat los van de handleiding van die persoon
 * en komt daar pas in als hij of zij het zelf bewaart. De app schrijft nooit
 * uit zichzelf in andermans woorden.
 */
export async function bewaarHandleidingvoorstel({ orgId, teamId, uid, vanUid, vanNaam, secties }) {
  const schoon = schoneSecties(secties);
  if (Object.keys(schoon).length === 0) {
    throw new Error("Er staat nog geen tekst in; vul minstens \u00e9\u00e9n stukje in.");
  }

  await setDoc(handleidingvoorstelRef(orgId, teamId, uid), {
    secties: schoon,
    vanUid,
    vanNaam: vanNaam || "",
    aangemaaktOp: serverTimestamp(),
  });
  return schoon;
}

export async function haalHandleidingvoorstel({ orgId, teamId, uid }) {
  const snap = await getDoc(handleidingvoorstelRef(orgId, teamId, uid));
  return snap.exists() ? { uid, orgId, teamId, ...snap.data() } : null;
}

/** Alle openstaande tekstvoorstellen in een team. Alleen voor de beheerder. */
export async function haalHandleidingvoorstellen({ orgId, teamId }) {
  const snap = await getDocs(handleidingvoorstellenCol(orgId, teamId));
  const uit = {};
  snap.docs.forEach((d) => {
    uit[d.id] = { uid: d.id, orgId, teamId, ...d.data() };
  });
  return uit;
}

export async function verwijderHandleidingvoorstel({ orgId, teamId, uid }) {
  await deleteDoc(handleidingvoorstelRef(orgId, teamId, uid));
}
