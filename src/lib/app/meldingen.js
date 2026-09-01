// Wat er op het scherm komt als een actie mislukt.
//
// Overal in de app stond `try { ... } finally { setBezig(false) }` zonder een
// vangnet ertussen. De knop ging netjes weer aan, er kwam geen melding, en de
// fout eindigde in de console. Je klikte, er gebeurde niets zichtbaars, en je
// klikte nog een keer.
//
// Hier staat de vertaling van een fout naar één zin die twee dingen doet:
// zeggen wat er misging, en zeggen wat je nu kunt doen. Geen excuses, geen
// foutcodes, geen "er is iets misgegaan".
//
// De actienaam komt van de aanroeper en gaat over wat de gebruiker probeerde,
// niet over wat de code deed: "je naam bewaren", niet "setDoc op gebruikers".

const PER_CODE = {
  // Firestore
  "permission-denied":
    "Je hebt hier geen toegang toe. Ververs de pagina als je net van team gewisseld bent, en log anders opnieuw in.",
  unauthenticated: "Je bent tussendoor uitgelogd. Log opnieuw in en probeer het nog eens.",
  unavailable: "Er is even geen verbinding met de server. Probeer het zo nog eens.",
  "deadline-exceeded": "Het duurde te lang. Probeer het zo nog eens.",
  "resource-exhausted": "Het is even te druk. Probeer het over een minuut nog eens.",
  "not-found": "Wat je wilde aanpassen bestaat niet meer. Ververs de pagina en kijk of het er nog staat.",
  "failed-precondition": "Dit kon niet worden opgeslagen omdat er iets veranderd is. Ververs de pagina en probeer het opnieuw.",
  aborted: "Er werd op hetzelfde moment iets anders gewijzigd. Probeer het nog een keer.",

  // Auth
  "auth/network-request-failed": "Er is even geen verbinding. Probeer het zo nog eens.",
  "auth/too-many-requests": "Er zijn te veel pogingen geweest. Wacht even en probeer het opnieuw.",
};

/** Een fout in één leesbare zin, met wat de gebruiker probeerde te doen erbij. */
export function omschrijfFout(fout, actie) {
  const code = (fout && fout.code) || "";
  const bekend = PER_CODE[code];
  if (bekend) return bekend;

  // Een netwerkfout van fetch heeft geen code, wel een herkenbare naam.
  if (fout && (fout.name === "TypeError" || /network|fetch/i.test(String(fout.message || "")))) {
    return "Er is even geen verbinding. Probeer het zo nog eens.";
  }

  return actie
    ? `${hoofdletter(actie)} is niet gelukt. Probeer het zo nog eens.`
    : "Dit is niet gelukt. Probeer het zo nog eens.";
}

function hoofdletter(tekst) {
  const t = String(tekst || "").trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}
