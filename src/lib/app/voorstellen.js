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
import { SECTIE_IDS } from "../../data/app/handleiding";
import { KLEUR_IDS } from "./insights";

const voorstelRef = (orgId, teamId, uid) =>
  doc(db, "organisaties", orgId, "teams", teamId, "profielvoorstellen", uid);

const voorstellenCol = (orgId, teamId) =>
  collection(db, "organisaties", orgId, "teams", teamId, "profielvoorstellen");

/** Houdt alleen over wat we kennen; onbekende velden komen de database niet in. */
function schoonVoorstel({ voorkeurskleur, tweedeKleur, type, teksten }) {
  const schoneTeksten = {};
  Object.keys(teksten || {}).forEach((sectieId) => {
    if (!SECTIE_IDS.includes(sectieId)) return;
    const tekst = String(teksten[sectieId] || "").trim();
    if (tekst) schoneTeksten[sectieId] = tekst.slice(0, 1000);
  });

  return {
    voorkeurskleur: KLEUR_IDS.includes(voorkeurskleur) ? voorkeurskleur : null,
    tweedeKleur: KLEUR_IDS.includes(tweedeKleur) ? tweedeKleur : null,
    type: type || null,
    teksten: schoneTeksten,
  };
}

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
