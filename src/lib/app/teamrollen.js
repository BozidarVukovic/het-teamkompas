// Wie mag wat, en wie hoort er eigenlijk bij het team.
//
// Er zijn drie rollen:
//
//   lid         — je doet mee. Je deelt wat je wilt, en teamgenoten kunnen
//                 advies vragen over de samenwerking met jou.
//   beheerder   — je doet mee én je beheert het team: uitnodigen, profielen
//                 toevoegen, opruimen.
//   begeleider  — je beheert het team, maar je doet zelf niet mee. Dit is de
//                 facilitator: hij zet het team op, voegt de profielen toe en
//                 bereidt de sessie voor, maar hij is geen collega van dit
//                 team. Hij hoort niet in de lijst "samenwerken met", en de app
//                 vraagt hem niet zijn eigen profiel met deze klant te delen.
//
// De aanleiding voor die derde rol: wie een team aanmaakte, kwam er zelf in te
// staan. Op het startscherm stond dan "Deel het met je team" over een team
// waar hij alleen de begeleider van was.
//
// Twee dingen mogen nooit gebeuren:
//
//   1. Een team zonder iemand die het beheert. Dan kan niemand meer uitnodigen
//      of opruimen en is er geen weg terug.
//   2. Iemand die zichzelf beheer geeft. Dat is een securityvraag en die wordt
//      in firestore.rules beantwoord; wat hier staat is de uitleg op het
//      scherm, niet de beveiliging.
//
// Deze regels staan los van de database, zodat ze getest kunnen worden zonder
// Firebase erbij te halen. Elke functie geeft niet alleen "mag het", maar ook
// waarom niet — want een knop die uit staat zonder uitleg is een raadsel.

export const LID = "lid";
export const BEHEERDER = "beheerder";
export const BEGELEIDER = "begeleider";
export const ROLLEN = [LID, BEHEERDER, BEGELEIDER];

/** De rollen die het team mogen beheren. */
export const BEHEERROLLEN = [BEHEERDER, BEGELEIDER];

const rolVan = (lid) => (lid && ROLLEN.includes(lid.rol) ? lid.rol : LID);

/** Het lid met dit uid, of null. */
export function lidUit(leden = [], uid) {
  if (!uid) return null;
  return (leden || []).find((l) => l && l.uid === uid) || null;
}

/** Mag deze persoon het team beheren? Een begeleider mag dat ook. */
export function magBeheren(leden = [], uid) {
  return BEHEERROLLEN.includes(rolVan(lidUit(leden, uid)));
}

/** Begeleidt deze persoon het team in plaats van eraan mee te doen? */
export function isBegeleider(leden = [], uid) {
  return rolVan(lidUit(leden, uid)) === BEGELEIDER;
}

/** Doet dit lid mee als teamgenoot? Een begeleider niet. */
export function doetMee(lid) {
  return rolVan(lid) !== BEGELEIDER;
}

/** De mensen die echt in het team zitten. */
export function deelnemers(leden = []) {
  return (leden || []).filter(doetMee);
}

/** De mensen die het team begeleiden zonder eraan mee te doen. */
export function begeleiders(leden = []) {
  return (leden || []).filter((l) => rolVan(l) === BEGELEIDER);
}

/** Hoeveel mensen kunnen dit team beheren? */
export function aantalBeheerders(leden = []) {
  return (leden || []).filter((l) => BEHEERROLLEN.includes(rolVan(l))).length;
}

/**
 * Mag `doorUid` de rol van `doelUid` op `nieuweRol` zetten?
 *
 * Ja als: je mag het team beheren, het doel zit in dit team, de rol bestaat en
 * verandert echt, en er blijft iemand over die het team kan beheren.
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
  if (!magBeheren(leden, doorUid)) return nee("Alleen een beheerder kan rollen aanpassen.");

  const doel = lidUit(leden, doelUid);
  if (!doel) return nee("Deze persoon zit niet in dit team.");

  const huidige = rolVan(doel);
  if (huidige === nieuweRol) {
    if (nieuweRol === BEHEERDER) return nee("Deze persoon is al beheerder.");
    if (nieuweRol === BEGELEIDER) return nee("Deze persoon begeleidt dit team al.");
    return nee("Deze persoon is al gewoon lid.");
  }

  // Alleen jezelf kun je op begeleiden zetten. Iemand anders uit het team
  // schrijven is geen rolwijziging maar een oordeel over of hij erbij hoort.
  if (nieuweRol === BEGELEIDER && doelUid !== doorUid) {
    return nee("Iemand geeft zelf aan dat hij een team begeleidt.");
  }
  if (huidige === BEGELEIDER && doelUid !== doorUid && nieuweRol !== LID) {
    return nee("Wie een team begeleidt, bepaalt zelf wanneer hij weer meedoet.");
  }

  const verliestBeheer = BEHEERROLLEN.includes(huidige) && !BEHEERROLLEN.includes(nieuweRol);
  if (verliestBeheer && aantalBeheerders(leden) <= 1) {
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

  if (magBeheren(leden, uid) && aantalBeheerders(leden) <= 1) {
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

/**
 * De zin bij het aan- of uitzetten van begeleiden.
 *
 * `deeltAantal` is hoeveel punten je op dit moment met dit team deelt. Die
 * kopie verdwijnt als je gaat begeleiden, want je doet dan niet mee — dat mag
 * je niet pas achteraf ontdekken.
 */
export function begeleidingstekst(gaBegeleiden, teamNaam = "dit team", deeltAantal = 0) {
  if (!gaBegeleiden) {
    return `Je doet daarna gewoon mee in ${teamNaam}: je staat weer bij de teamgenoten, en de app vraagt je wat je wilt delen. Je blijft het team beheren.`;
  }

  const kern = `Je beheert ${teamNaam} dan wel — uitnodigen, profielen toevoegen — maar je doet er zelf niet aan mee. Je staat niet meer tussen de teamgenoten en niemand kan advies vragen over de samenwerking met jou.`;
  const delen =
    deeltAantal > 0
      ? ` Wat je nu met ${teamNaam} deelt (${deeltAantal} ${deeltAantal === 1 ? "punt" : "punten"}) wordt verwijderd.`
      : "";
  const terug = " Je kunt dit altijd weer omzetten.";
  return kern + delen + terug;
}
