// Een adres voor elke plek in de teamomgeving.
//
// De onderdelen stonden in de toestand van het scherm en nergens anders. Wie
// een collega wilde wijzen op de afspraak over terugkoppeling, kon alleen
// zeggen: ga naar Onze afspraken en scroll. In een omgeving die van een team
// samen is, is doorsturen juist de hoofdhandeling.
//
// Daarom: het onderdeel staat in het pad (/app/teamomgeving/afspraken) en de
// sectie in de hash (#verwachtingen-van-de-leidinggevende). Beide zijn leesbaar,
// beide overleven een herlaadbeurt, en een link die je plakt opent precies wat
// je bedoelde -- ook als die sectie dichtstaat.
//
// De slak wordt op één plek gemaakt, want hij moet op twee plekken hetzelfde
// zijn: de kop die het scherm rendert en de treffer die het zoeken teruggeeft.

export const OMGEVINGSPAD = "/app/teamomgeving";

// Diakrieten eruit, de rest naar streepjes. Niet omkeerbaar, en dat hoeft ook
// niet: de slak wijst iets aan, hij bewaart het niet.
export function maakSlak(tekst) {
  return (typeof tekst === "string" ? tekst : "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

// Twee secties met dezelfde kop leveren dezelfde slak op. Binnen één onderdeel
// mag dat niet, anders opent een link altijd de eerste van de twee.
export function sectieAdressen(secties) {
  const geteld = new Map();
  return (secties || []).map((sectie, i) => {
    const basis = maakSlak(sectie && sectie.kop) || "sectie-" + (i + 1);
    const beurt = (geteld.get(basis) || 0) + 1;
    geteld.set(basis, beurt);
    return beurt === 1 ? basis : basis + "-" + beurt;
  });
}

// Een hash uit de adresbalk kan percentgecodeerd zijn en kan stuk zijn.
export function leesHash(hash) {
  const kaal = (typeof hash === "string" ? hash : "").replace(/^#/, "");
  try {
    return decodeURIComponent(kaal);
  } catch {
    return kaal;
  }
}

export function maakAdres(onderdeelId, slak) {
  const pad = OMGEVINGSPAD + "/" + encodeURIComponent(onderdeelId || "");
  return slak ? pad + "#" + encodeURIComponent(slak) : pad;
}
