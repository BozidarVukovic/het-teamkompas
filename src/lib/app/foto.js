// Een foto bij je naam.
//
// De bol in de app is 36 pixels breed, op het profielscherm 56. Een foto uit
// een telefoon is vierduizend pixels breed en een paar megabyte. Die gaat hier
// eerst door de browser: vierkant uit het midden gesneden, verkleind naar 160,
// opnieuw als jpeg weggeschreven. Wat overblijft is tien tot vijftien kilobyte,
// en dat past in het profieldocument zelf.
//
// Dat is een keuze. De foto komt daarmee op dezelfde plek als je naam, onder
// dezelfde regel over wie hem mag lezen, en hij verdwijnt in één handeling.
// Firebase Storage zou een tweede opslag zijn met een eigen set toegangsregels
// en een eigen plek waar een foto kan achterblijven nadat je hem hebt
// weggehaald. Voor een bol van 56 pixels is dat te veel apparaat.

import { Uitlegfout } from "./meldingen.js";

/** De zijde van het vierkant dat wordt bewaard. */
export const ZIJDE = 160;

/** Jpeg-kwaliteit. Lager dan 0,6 zie je op een scherm met dubbele pixels. */
export const KWALITEIT = 0.72;

/**
 * De bovengrens van wat er in het document terechtkomt.
 *
 * Een vierkant van 160 bij 160 komt op tien tot vijftien kilobyte uit, dus dit
 * is er ruim vier keer zoveel. Firestore laat een document van een megabyte
 * toe, maar de ledenlijst wordt bij elk bezoek in zijn geheel opgehaald: met
 * negen mensen in een team is elke kilobyte er negen.
 */
export const MAX_OPSLAG = 60 * 1024;

/** Wat er hooguit gekozen mag worden, vóór het verkleinen. */
export const MAX_BESTAND = 12 * 1024 * 1024;

/**
 * Wat een browser met zekerheid op een canvas kan tekenen.
 *
 * HEIC staat er niet bij en dat is geen vergissing: Safari toont zo'n bestand
 * wel, maar geen enkele browser tekent het betrouwbaar op een canvas. Beter
 * een duidelijke zin vooraf dan een mislukking halverwege.
 */
export const SOORTEN = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];

/**
 * Wat er mis is met dit bestand, in gewone woorden -- of null.
 *
 * Werkt op {type, size}, zodat het zonder browser te controleren is.
 */
export function bestandsfout(bestand) {
  if (!bestand) return "Er is geen bestand gekozen.";

  if (!SOORTEN.includes(String(bestand.type || "").toLowerCase())) {
    return "Kies een jpg, png of webp. Foto's van een iPhone zijn soms HEIC; die kun je in Foto's exporteren als jpg.";
  }

  if (Number(bestand.size) > MAX_BESTAND) {
    return "Deze foto is groter dan 12 MB. Kies er een die wat kleiner is.";
  }

  return null;
}

/**
 * Het grootste vierkant uit het midden van een beeld.
 *
 * Uit het midden en niet uit de linkerbovenhoek: op een staande portretfoto
 * staat het hoofd in het midden, en een vierkant uit de hoek levert een kin op.
 *
 * @returns {{x: number, y: number, zijde: number}} zijde 0 als er niets is
 */
export function snijvlak(breedte, hoogte) {
  const b = Math.max(0, Math.floor(Number(breedte) || 0));
  const h = Math.max(0, Math.floor(Number(hoogte) || 0));
  const zijde = Math.min(b, h);

  return { x: Math.round((b - zijde) / 2), y: Math.round((h - zijde) / 2), zijde };
}

/**
 * Of dit een waarde is die deze app zelf heeft weggeschreven.
 *
 * Wordt gebruikt vóór het tonen. Wat er in het ledendocument staat is door een
 * teamgenoot geschreven, niet door ons, en gaat rechtstreeks een src in -- dan
 * hoort er gecontroleerd te worden dat het een jpeg is en niets anders.
 */
export function isFoto(waarde) {
  if (typeof waarde !== "string" || waarde === "") return false;
  if (!waarde.startsWith("data:image/jpeg;base64,")) return false;
  if (waarde.length > MAX_OPSLAG) return false;

  return /^[A-Za-z0-9+/=]+$/.test(waarde.slice("data:image/jpeg;base64,".length));
}

/** Het bestand inlezen als beeld, met een zin die klopt als dat niet lukt. */
function laadBeeld(bestand) {
  return new Promise((klaar, mis) => {
    const url = URL.createObjectURL(bestand);
    const beeld = new Image();

    beeld.onload = () => {
      URL.revokeObjectURL(url);
      klaar(beeld);
    };
    beeld.onerror = () => {
      URL.revokeObjectURL(url);
      mis(new Uitlegfout("Deze foto kon niet worden geopend. Sla hem op als jpg en probeer het opnieuw."));
    };

    beeld.src = url;
  });
}

/**
 * Van een gekozen bestand naar het vierkantje dat wordt bewaard.
 *
 * Alles gebeurt in de browser. Er gaat geen origineel de leiding over: wat het
 * netwerk ziet is het vierkantje van 160 pixels en verder niets.
 */
export async function maakFoto(bestand) {
  const probleem = bestandsfout(bestand);
  if (probleem) throw new Uitlegfout(probleem);

  const beeld = await laadBeeld(bestand);
  const { x, y, zijde } = snijvlak(beeld.naturalWidth, beeld.naturalHeight);
  if (zijde === 0) throw new Uitlegfout("Deze foto kon niet worden geopend.");

  const doek = document.createElement("canvas");
  doek.width = ZIJDE;
  doek.height = ZIJDE;

  const pen = doek.getContext("2d");
  pen.imageSmoothingQuality = "high";
  pen.drawImage(beeld, x, y, zijde, zijde, 0, 0, ZIJDE, ZIJDE);

  // Een foto met heel veel detail kan ook op 160 pixels nog boven de grens
  // uitkomen. Dan gaat de kwaliteit een paar stappen omlaag, in plaats van dat
  // iemand een foutmelding krijgt over iets wat hij niet kan zien.
  for (const kwaliteit of [KWALITEIT, 0.6, 0.5, 0.4]) {
    const uit = doek.toDataURL("image/jpeg", kwaliteit);
    if (uit.length <= MAX_OPSLAG) return uit;
  }

  throw new Uitlegfout("Deze foto blijft te groot. Kies er een met wat minder detail.");
}
