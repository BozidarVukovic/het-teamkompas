// Wie mag wat met de beheerdersrol van een team.
//
// De aanleiding is de facilitator: iemand begeleidt een team, maakt het team
// aan, zet de profielen klaar, en is daarna klaar. Het team blijft achter met
// een beheerder die er niet meer bij hoort. Zonder overdracht is de enige
// uitweg het team opnieuw aanmaken.
//
// Twee dingen mogen daarbij nooit gebeuren:
//
// 1. Een team zonder beheerder. Dan kan niemand meer uitnodigen of opruimen en
//    is er geen weg terug — de teamcode is dan het enige wat er nog werkt.
// 2. Iemand die zichzelf beheerder maakt. Dat is een securityvraag en die
//    wordt in firestore.rules beantwoord; wat hier staat is de uitleg op het
//    scherm, niet de beveiliging.
//
// Deze regels staan los van de database, zodat ze getest kunnen worden zonder
// Firebase erbij te halen. Elke functie geeft niet alleen "mag het", maar ook
// waarom niet — want een knop die uit staat zonder uitleg is een raadsel.

export const BEHEERDER = "beheerder";
export const LID = "lid";
export const ROLLEN = [LID, BEHEERDER];

const rolVan = (lid) => (lid && lid.rol === BEHEERDER ? BEHEERDER : LID);

/** Het lid met dit uid, of null. */
export function lidUit(leden = [], uid) {
  if (!uid) return null;
  return (leden || []).find((l) => l && l.uid === uid) || null;
}

/** Is deze persoon beheerder van dit team? */
export function isBeheerder(leden = [], uid) {
  return rolVan(lidUit(leden, uid)) === BEHEERDER;
}

/** Hoeveel beheerders heeft dit team? */
export function aantalBeheerders(leden = []) {
  return (leden || []).filter((l) => rolVan(l) === BEHEERDER).length;
}

/**
 * Mag `doorUid` de rol van `doelUid` op `nieuweRol` zetten?
 *
 * Ja als: je bent zelf beheerder, het doel zit in dit team, de rol bestaat en
 * verandert echt, en er blijft minstens één beheerder over.
 *
 * Merk op dat een beheerder een andere beheerder mag terugzetten naar lid. Dat
 * is met opzet: de facilitator die het team aanmaakte stapt lang niet altijd
 * netjes zelf op, en dan moet de teamleider dat kunnen rechtzetten. Wat niet
 * kan, is de laatste beheerder wegnemen.
 *
 * @returns {{mag: boolean, reden: string|null}}
 */
export function magRolWijzigen({ leden = [], doorUid, doelUid, nieuweRol } = {}) {
  const nee = (reden) => ({ mag: false, reden });

  if (!ROLLEN.includes(nieuweRol)) return nee("Die rol bestaat niet.");
  if (!isBeheerder(leden, doorUid)) return nee("Alleen een beheerder kan rollen aanpassen.");

  const doel = lidUit(leden, doelUid);
  if (!doel) return nee("Deze persoon zit niet in dit team.");

  const huidige = rolVan(doel);
  if (huidige === nieuweRol) {
    return nee(
      nieuweRol === BEHEERDER
        ? "Deze persoon is al beheerder."
        : "Deze persoon is al gewoon lid."
    );
  }

  if (nieuweRol === LID && aantalBeheerders(leden) <= 1) {
    return nee(
      doelUid === doorUid
        ? "Je bent de enige beheerder. Maak eerst iemand anders beheerder."
        : "Dit is de enige beheerder van het team. Maak eerst iemand anders beheerder."
    );
  }

  return { mag: true, reden: null };
}

/**
 * Mag deze persoon het team verlaten?
 *
 * De laatste beheerder mag niet weglopen zolang er anderen achterblijven; dan
 * blijft er een team over dat niemand meer kan beheren. Ben je als enige over,
 * dan is vertrekken geen vertrekken maar opruimen — dat loopt via een andere
 * weg en mag wel.
 */
export function magVertrekken({ leden = [], uid } = {}) {
  const alleen = (leden || []).length <= 1;
  if (alleen) return { mag: true, reden: null };

  if (isBeheerder(leden, uid) && aantalBeheerders(leden) <= 1) {
    return {
      mag: false,
      reden:
        "Je bent de enige beheerder van dit team. Maak eerst iemand anders beheerder, daarna kun je vertrekken.",
    };
  }

  return { mag: true, reden: null };
}

/**
 * De zin die op het bevestigingsscherm hoort bij het maken van een beheerder.
 *
 * Staat hier omdat het geen opmaak is maar inhoud: wat je weggeeft is niet
 * niets, en wat je níét weggeeft is precies zo belangrijk.
 */
export function overdrachtstekst(hunNaam, geefIkOp = false) {
  const wie = hunNaam || "deze collega";
  const kern = `${wie} kan dan mensen uitnodigen, profielen toevoegen en de teamgegevens beheren — net als jij nu.`;
  const grens = "Het geeft geen inzage in de profielen van teamgenoten; die blijven privé, ook voor een beheerder.";
  const eind = geefIkOp
    ? "Daarna ben jij gewoon lid van dit team."
    : "Je blijft zelf ook beheerder; een team kan er meer dan één hebben.";
  return `${kern} ${grens} ${eind}`;
}
