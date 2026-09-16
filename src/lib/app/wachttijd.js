// Wachten op de aanmeldstatus, met een bodem eronder.
//
// onAuthStateChanged is de enige bron voor "weten we al wie dit is". Firebase
// bewaart die status in de opslag van de browser, en die opslag kan blijven
// hangen in plaats van te falen -- in Safari gebeurt dat, onder meer met
// meerdere tabbladen van dezelfde site open. Dan komt er geen antwoord en ook
// geen fout: het scherm blijft op "Even laden..." staan.
//
// Blijft het antwoord uit, dan gaan we verder alsof er niemand is ingelogd. Dat
// is niet perfect -- wie wél is ingelogd ziet even het inlogscherm -- maar het
// is te herstellen met één klik, en een scherm dat eeuwig laadt is dat niet.
// Komt het echte antwoord alsnog, dan wint dat gewoon.
export const WACHTTIJD_MS = 8000;

export function wachtOpAanmelding(luister, ontvang, { wachttijd = WACHTTIJD_MS, plan = setTimeout, stopPlan = clearTimeout } = {}) {
  let beantwoord = false;
  const noodrem = plan(() => {
    if (beantwoord) return;
    beantwoord = true;
    ontvang(null, { viaNoodrem: true });
  }, wachttijd);

  const stop = luister((gebruiker) => {
    beantwoord = true;
    stopPlan(noodrem);
    ontvang(gebruiker || null, { viaNoodrem: false });
  });

  return () => {
    stopPlan(noodrem);
    if (typeof stop === "function") stop();
  };
}
