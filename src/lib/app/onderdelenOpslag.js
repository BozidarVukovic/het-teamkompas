// De instellingen van een team: welke onderdelen aanstaan.
//
// Eén document per team, met één boolean per onderdeel. Leesbaar voor iedereen
// in het team -- de app moet weten wat ze mag tonen -- en alleen te schrijven
// door een teambeheerder.
//
// Bestaat het document niet, dan staat alles uit. Dat is geen foutgeval maar
// de normale beginstand: een team dat nooit iets heeft aangezet, heeft niets
// aanstaan.

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ONDERDEEL_IDS, schoneInstellingen } from "./onderdelen";

const ref = ({ orgId, teamId }) =>
  doc(db, `organisaties/${orgId}/teams/${teamId}/instellingen/onderdelen`);

export async function haalInstellingen(team) {
  if (!team || !team.orgId || !team.teamId) return null;
  const snap = await getDoc(ref(team));
  return snap.exists() ? snap.data() : null;
}

/**
 * Eén onderdeel aan- of uitzetten.
 *
 * De hele stand gaat mee en niet alleen de wijziging: zo staat er na afloop
 * precies wat er op het scherm stond, ook als er ondertussen een onderdeel aan
 * de lijst is toegevoegd dat dit team nog nooit heeft gezien.
 */
export async function zetOnderdeel(team, uid, id, aan) {
  if (!ONDERDEEL_IDS.includes(id)) throw new Error("Onbekend onderdeel.");
  const huidig = (await haalInstellingen(team)) || {};
  const nieuw = schoneInstellingen({ ...huidig, [id]: aan === true });
  await setDoc(ref(team), {
    ...nieuw,
    bijgewerktOp: serverTimestamp(),
    doorUid: uid,
  });
  return nieuw;
}
