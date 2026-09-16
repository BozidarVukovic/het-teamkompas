// Wat het adres al zegt voordat er iets geladen is.
//
// Twee vragen die de eerste weergave bepalen en die geen netwerk nodig hebben:
// staan we op een beheerpagina, en wordt er een scan ingevuld? Ze staan hier
// apart omdat ze dan te testen zijn zonder browser.

const BEHEERPAD = /^\/(beheer|admin)(\/|$)/;

export function isBeheerpad(pad) {
  return BEHEERPAD.test(typeof pad === "string" ? pad : "");
}

// Nieuw: /deelnemen/:scanId (firewall-vriendelijk). Oud: ?scan=xxx.
export function scanUitAdres(pad, zoek) {
  const viaPad = (typeof pad === "string" ? pad : "").match(/^\/deelnemen\/([^/]+)/);
  if (viaPad) return decodeURIComponent(viaPad[1]);
  try {
    return new URLSearchParams(typeof zoek === "string" ? zoek : "").get("scan") || null;
  } catch { return null; }
}
