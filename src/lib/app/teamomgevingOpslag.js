import { doc, getDoc, getDocs, collection, writeBatch, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { controleerPdf, splitsBestand, valideerOmgeving, pasWijzigingToe, maakDocumentregel, verwijderUitLijst, OMGEVING_VERSIE } from "./teamomgeving";

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

// De teksten bijwerken, en niets anders.
//
// Een teamomgeving werd één keer ingericht en was daarna niet meer te
// corrigeren: een kop die als alinea was geschreven, twee cellen die aan elkaar
// plakten. Dat kan nu, door de twee begeleiders, met hetzelfde pakketformaat
// waarin de omgeving ook is aangeleverd.
//
// De documenten blijven buiten schot. Hun metadata hoort bij de pdf's in de
// aparte collectie -- titel en sha256 horen bij elkaar, en losse titels
// bijwerken zou betekenen dat een download iets anders kan gaan heten dan wat
// er is gecontroleerd. Komt de lijst niet overeen, dan gaat er niets door: dan
// hoort dit pakket bij een andere omgeving.
export async function werkOmgevingBij(team, uid, pakket) {
  valideerOmgeving(pakket);
  const huidig = await getDoc(ref(team, "inhoud"));
  if (!huidig.exists()) throw new Error("Deze teamomgeving is nog niet ingericht.");
  const sleutels = (lijst) => (lijst || []).map((d) => d.id).join("|");
  if (sleutels(pakket.inhoud.documenten) !== sleutels(huidig.data().documenten)) {
    throw new Error("De documenten in dit pakket komen niet overeen met wat er is opgeslagen. Er is niets bijgewerkt.");
  }
  await updateDoc(ref(team, "inhoud"), {
    titel: pakket.inhoud.titel,
    intro: pakket.inhoud.intro || "",
    documentContext: pakket.inhoud.documentContext || "",
    onderdelen: pakket.inhoud.onderdelen,
    bijgewerktOp: serverTimestamp(),
    bijgewerktDoor: uid,
  });
}

// Eén tekst bijwerken, vanuit het scherm.
//
// Twee dingen zitten hier met opzet in.
//
// De inhoud wordt eerst opnieuw gelezen en de wijziging gaat daar bovenop, niet
// bovenop wat het scherm uren geleden laadde. Er zijn twee begeleiders per
// omgeving; corrigeert de een een teamdag terwijl de ander aan de afspraken
// werkt, dan hoort dat niet te betekenen dat er één van de twee verdwijnt.
//
// En de uitkomst gaat door dezelfde controle als een aangeleverd pakket. Eén
// poort, geen tweede route met eigen regels -- want een tweede route is een
// tweede plek waar iets doorheen kan glippen dat het scherm niet aankan.
/**
 * Een onderdeel tonen of verbergen voor het team.
 *
 * Loopt langs dezelfde weg als het bewerken van een tekst -- dezelfde regel in
 * Firestore, dezelfde controle in valideerOmgeving -- maar met een eigen naam,
 * omdat het een ander besluit is dan een tekst verbeteren.
 */
export async function werkZichtbaarheidBij(team, uid, id, verborgen) {
  await werkTekstenBij(team, uid, { zichtbaarheid: { id, verborgen: verborgen === true } });
}

export async function werkTekstenBij(team, uid, wijziging) {
  const huidig = await getDoc(ref(team, "inhoud"));
  if (!huidig.exists()) throw new Error("Deze teamomgeving is nog niet ingericht.");

  const nieuw = pasWijzigingToe(huidig.data(), wijziging);
  valideerOmgeving({ versie: OMGEVING_VERSIE, inhoud: nieuw, beheer: { tekst: "" }, bestanden: [] });

  await updateDoc(ref(team, "inhoud"), {
    titel: nieuw.titel,
    intro: nieuw.intro || "",
    documentContext: nieuw.documentContext || "",
    onderdelen: nieuw.onderdelen,
    bijgewerktOp: serverTimestamp(),
    bijgewerktDoor: uid,
  });
}

// Eén document toevoegen aan een omgeving die al staat.
//
// De pdf gaat eerst, de lijst daarna. Andersom zou er even een regel in de
// lijst staan die wijst naar een bestand dat er nog niet is -- en dan krijgt
// een teamlid dat op dat moment klikt een foutmelding over iets wat hij niet
// heeft gedaan. Blijft het bij de pdf steken, dan staan er losse delen in de
// opslag die niemand ziet; dat is de goedkope kant van het misgaan.
//
// Verwijderen kan hiermee niet, en de regels laten het ook niet toe. Dat is een
// aparte beslissing: de delen van een verwijderd document blijven anders als
// wees achter, en een lijst die krimpt is een lijst die herschreven kan worden.
export async function voegDocumentToe(team, uid, document) {
  const huidig = await getDoc(ref(team, "inhoud"));
  if (!huidig.exists()) throw new Error("Deze teamomgeving is nog niet ingericht.");
  const documenten = huidig.data().documenten;
  if (!Array.isArray(documenten)) throw new Error("Deze omgeving heeft nog geen documentenlijst. Lever hem opnieuw aan als pakket.");

  const delen = splitsBestand(document.base64);
  const regel = maakDocumentregel(documenten, { ...document, delen: delen.length });

  // Dezelfde controle als bij het downloaden: klopt de vingerafdruk niet met de
  // bytes, dan gaat er niets de opslag in.
  await controleerPdf({ base64: document.base64, sha256: regel.sha256 });

  const batch = writeBatch(db);
  delen.forEach((data, i) => batch.set(
    doc(db, `${basis(team)}/teamomgevingBestanden/${regel.id}/delen/${String(i).padStart(3, "0")}`),
    { data }
  ));
  await batch.commit();

  await updateDoc(ref(team, "inhoud"), {
    documenten: [...documenten, regel],
    bijgewerktOp: serverTimestamp(),
    bijgewerktDoor: uid,
  });
  return regel;
}

// Eén document weghalen.
//
// Eerst uit de lijst, dan het bestand. In die volgorde, want zo kan niemand
// meer op een download klikken die er niet meer is. Andersom zou een teamlid
// die op dat moment klikt een foutmelding krijgen over iets wat hij niet heeft
// gedaan.
//
// Blijft het opruimen steken, dan liggen er delen in de opslag waar geen enkele
// lijst meer naar wijst. Dat wordt niet stilletjes weggeslikt: de aanroeper
// hoort te weten dat het bestand er nog is, ook al is het uit de omgeving.
export async function verwijderDocument(team, uid, id) {
  const huidig = await getDoc(ref(team, "inhoud"));
  if (!huidig.exists()) throw new Error("Deze teamomgeving is nog niet ingericht.");
  const { over, weg } = verwijderUitLijst(huidig.data().documenten, id);

  await updateDoc(ref(team, "inhoud"), {
    documenten: over,
    bijgewerktOp: serverTimestamp(),
    bijgewerktDoor: uid,
  });

  try {
    const batch = writeBatch(db);
    for (let i = 0; i < (Number(weg.delen) || 0); i += 1) {
      batch.delete(doc(db, `${basis(team)}/teamomgevingBestanden/${weg.id}/delen/${String(i).padStart(3, "0")}`));
    }
    await batch.commit();
    return { weg, opgeruimd: true };
  } catch {
    return { weg, opgeruimd: false };
  }
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
