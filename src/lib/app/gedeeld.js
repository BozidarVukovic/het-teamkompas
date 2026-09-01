// Wat iemand deelde, klaargemaakt om te lezen.
//
// De twaalf punten en de hand-in-handleiding overlappen elkaar. Dat is geen
// fout: de handleiding wordt als concept uit het profiel opgebouwd, en wie dat
// concept laat staan, heeft daar twee keer dezelfde zin staan. Op je eigen
// profiel is dat prima — je ziet waar het vandaan komt. Op het teamscherm werd
// het een muur waarin dezelfde zin er twee keer stond, één keer los en één keer
// onder een kopje.
//
// Hier valt weg wat niets toevoegt: een stukje handleiding waarvan élke zin al
// bij de punten staat. Blijft er ook maar één eigen zin over, dan blijft het
// hele stukje staan — iemands eigen woorden knippen we niet bij.

function normaliseer(tekst) {
  return String(tekst || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function zinnenIn(tekst) {
  return String(tekst || "")
    .split(/(?<=[.!?])\s+/)
    .map((z) => z.trim())
    .filter(Boolean);
}

/**
 * @param gedeeld  { kenmerken: [{ zin }], handleiding: [{ sectieId, titel, tekst }] }
 * @returns        { zinnen: string[], secties: [...] }
 */
export function gedeeldSamengevat(gedeeld) {
  const zinnen = ((gedeeld && gedeeld.kenmerken) || [])
    .map((k) => k && k.zin)
    .filter(Boolean);

  // Een punt kan zelf uit twee zinnen bestaan ("Als de spanning oploopt word ik
  // directer. Dat is bij mij geen boosheid."), dus onthouden we het geheel én
  // de losse zinnen. Anders herkennen we een letterlijke herhaling niet.
  const gezien = new Set();
  zinnen.forEach((zin) => {
    [zin, ...zinnenIn(zin)].map(normaliseer).filter(Boolean).forEach((z) => gezien.add(z));
  });

  const secties = ((gedeeld && gedeeld.handleiding) || []).filter((s) => {
    if (!s || !s.tekst) return false;
    const delen = zinnenIn(s.tekst).map(normaliseer).filter(Boolean);
    if (delen.length === 0) return false;
    return !delen.every((d) => gezien.has(d));
  });

  return { zinnen, secties };
}
