import { doc, getDoc, getDocs, collection, writeBatch, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { controleerPdf, splitsBestand, valideerOmgeving } from "./teamomgeving";

const basis = ({ orgId, teamId }) => `organisaties/${orgId}/teams/${teamId}`;
const ref = (team, id) => doc(db, `${basis(team)}/teamomgeving/${id}`);

export async function heeftOmgeving(team) {
  return (await getDoc(ref(team, "toegang"))).exists();
}

export async function haalOmgeving(team, uid) {
  const toegang = await getDoc(ref(team, "toegang"));
  if (!toegang.exists()) return null;
  const magBeheer = toegang.data().beheerders.includes(uid);
  const inhoud = await getDoc(ref(team, "inhoud"));
  if (!inhoud.exists()) throw new Error("De teamomgeving is nog niet volledig ingericht.");
  const beheer = magBeheer ? await getDoc(ref(team, "beheer")) : null;
  return { inhoud: inhoud.data(), magBeheer, beheer: beheer?.exists() ? beheer.data() : null };
}

// Eén atomische publicatie: geen zichtbare halve import en nooit overschrijven.
export async function richtOmgevingIn(team, uid, tweedeUid, pakket) {
  valideerOmgeving(pakket);
  if (!uid || !tweedeUid || uid === tweedeUid) throw new Error("Selecteer de tweede begeleider.");
  const controle = await getDoc(ref(team, "toegang"));
  if (controle.exists()) throw new Error("Dit team heeft al een omgeving. Er is niets overschreven.");
  await Promise.all(pakket.bestanden.map(controleerPdf));
  const batch = writeBatch(db);
  batch.set(ref(team, "toegang"), { beheerders: [uid, tweedeUid], aangemaaktDoor: uid, versie: 1 });
  const documenten = pakket.bestanden.map((bestand) => {
    const delen = splitsBestand(bestand.base64);
    delen.forEach((data, i) => batch.set(doc(db, `${basis(team)}/teamomgevingBestanden/${bestand.id}/delen/${String(i).padStart(3, "0")}`), { data }));
    return { id: bestand.id, titel: bestand.titel, naam: bestand.naam, sha256: bestand.sha256, delen: delen.length, beschrijving: bestand.beschrijving || "" };
  });
  batch.set(ref(team, "inhoud"), { ...pakket.inhoud, documenten, aangemaaktOp: serverTimestamp() });
  batch.set(ref(team, "beheer"), { tekst: pakket.beheer.tekst, notities: "", bijgewerktOp: serverTimestamp() });
  await batch.commit();
}

export async function haalOmgevingPdf(team, bestand) {
  const snapshot = await getDocs(collection(db, `${basis(team)}/teamomgevingBestanden/${bestand.id}/delen`));
  const delen = snapshot.docs.sort((a, b) => a.id.localeCompare(b.id));
  if (delen.length !== bestand.delen || delen.some((d, i) => d.id !== String(i).padStart(3, "0"))) throw new Error("De pdf is niet volledig opgeslagen.");
  return controleerPdf({ ...bestand, base64: delen.map((d) => d.data().data).join("") });
}

export async function bewaarOmgevingNotities(team, notities) {
  if (notities.length > 20000) throw new Error("De notities zijn te lang (maximaal 20.000 tekens).");
  await updateDoc(ref(team, "beheer"), { notities, bijgewerktOp: serverTimestamp() });
}
