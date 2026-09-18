// Lezen en schrijven van de teamcheck.
//
// Dun met opzet: het rekenwerk staat in teamcheck.js en de bevoegdheden staan
// in firestore.rules. Wat hier gebeurt is het heen en weer brengen, plus de
// controle op de vorm voordat er iets de deur uit gaat.
//
// Eén ding staat hier wel en nergens anders: haalAlleAntwoorden vraagt de
// antwoorden van het hele team op. Die aanroep faalt voor iedereen die geen
// aangewezen begeleider is -- niet omdat dit bestand dat tegenhoudt, maar
// omdat de regels dat doen. Dat is de bedoeling: een fout hier hoort geen
// gaatje te maken.

import { doc, collection, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { valideerAntwoord, leesRonde } from "./teamcheck";

const basis = ({ orgId, teamId }) => `organisaties/${orgId}/teams/${teamId}`;
const rondeRef = (team, ronde) => doc(db, `${basis(team)}/teamcheck/${ronde}`);
const antwoordRef = (team, ronde, uid) => doc(db, `${basis(team)}/teamcheck/${ronde}/antwoorden/${uid}`);

function controleerRonde(ronde) {
  if (!leesRonde(ronde)) throw new Error("Deze teamcheck bestaat niet.");
  return ronde;
}

/** De stand van alle drie de rondes in één keer. */
export async function haalRondes(team, rondeIds) {
  const uit = {};
  await Promise.all(rondeIds.map(async (id) => {
    const snap = await getDoc(rondeRef(team, controleerRonde(id)));
    uit[id] = snap.exists() ? { id, ...snap.data() } : { id, status: "nietgeopend" };
  }));
  return uit;
}

/** Wat jij zelf hebt ingevuld. Niemand anders kan dit voor jou opvragen. */
export async function haalEigenAntwoord(team, ronde, uid) {
  const snap = await getDoc(antwoordRef(team, controleerRonde(ronde), uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Je antwoord bewaren.
 *
 * Eén document per persoon per ronde, op je eigen uid: daardoor overschrijf je
 * je vorige antwoord in plaats van er een tweede naast te zetten. Bijstellen
 * kan dus zolang de ronde open is, en dubbel invullen kan niet.
 */
export async function bewaarAntwoord(team, ronde, uid, antwoord) {
  valideerAntwoord(antwoord);
  const naamErbij = antwoord.naamErbij === true;
  await setDoc(antwoordRef(team, controleerRonde(ronde), uid), {
    scores: antwoord.scores,
    open: (antwoord.open || "").trim().slice(0, 2000),
    naamErbij,
    // Geen naam meesturen als hij er niet bij mag. De regels weigeren het ook,
    // maar dat is de vangrail en niet de weg.
    ...(naamErbij && antwoord.naam ? { naam: String(antwoord.naam).slice(0, 80) } : {}),
    ingevuldOp: serverTimestamp(),
  });
}

/** Je eigen inzending intrekken. Een begeleider kan dit niet voor je doen. */
export async function trekAntwoordIn(team, ronde, uid) {
  await deleteDoc(antwoordRef(team, controleerRonde(ronde), uid));
}

/**
 * Alle antwoorden van een ronde. Alleen voor de twee aangewezen begeleiders.
 *
 * De uid komt hier bewust niet mee naar boven. Wie de gegevens toch nodig
 * heeft kan ze in de database vinden -- dat staat ook in de tekst boven het
 * formulier -- maar het overzicht hoort niet per ongeluk een sleutel te
 * hebben waarmee een antwoord aan een gezicht te koppelen is.
 */
export async function haalAlleAntwoorden(team, ronde) {
  const snap = await getDocs(collection(db, `${basis(team)}/teamcheck/${controleerRonde(ronde)}/antwoorden`));
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      scores: data.scores || {},
      open: data.open || "",
      naam: data.naamErbij === true ? data.naam || "" : "",
      ingevuldOp: data.ingevuldOp || null,
    };
  });
}

/** Een ronde openen of sluiten. Alleen de aangewezen begeleiders. */
export async function zetRonde(team, ronde, uid, status) {
  if (!["open", "gesloten"].includes(status)) throw new Error("Deze stand bestaat niet.");
  await setDoc(rondeRef(team, controleerRonde(ronde)), {
    status,
    versie: 1,
    geopendOp: serverTimestamp(),
    geopendDoor: uid,
  });
}
