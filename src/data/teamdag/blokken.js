// Centrale bibliotheek met programmaonderdelen voor de teamdag-generator.
//
// Alle blokken staan hier bij elkaar. Er staan nergens hardgecodeerde
// programma's in componenten: een programma ontstaat door blokken te kiezen
// volgens de regels in sporen.js en src/lib/teamdag/.
//
// Velden per blok:
//   id             uniek, met voorvoegsel kb- (kader), ob- (onderzoek), rb- (richting)
//   titel          zoals het in het programma komt te staan
//   fase           landen | ophalen | betekenis | verdieping | keuzes | gedrag | afsluiting | pauze
//   doel           één zin: wat levert dit onderdeel op
//   aanleidingen   ids uit AANLEIDINGEN; leeg betekent: past bij iedere aanleiding
//   doelen         blokDoel-ids uit RESULTATEN; leeg betekent: dient geen specifiek resultaat
//   teamtypen      ids uit TEAMTYPES; leeg betekent: past bij ieder teamtype
//   minGroep       kleinste groep waarbij dit werkt
//   maxGroep       grootste groep waarbij dit werkt
//   veiligheidMin  1 = kan altijd, 2 = vraagt basisvertrouwen, 3 = vraagt een veilig team
//   niveau         1 = laagdrempelig, 2 = vraagt oefening, 3 = vraagt ervaring
//   duur           voorkeursduur in minuten
//   minDuur        ondergrens bij het aanpassen
//   maxDuur        bovengrens bij het aanpassen
//   settings       fysiek | online | hybride
//   werkwijzen     ids uit WERKWIJZEN, gebruikt om voorkeuren te wegen
//   voorbereiding  wat de organisator vooraf doet
//   materialen     lijst met wat er nodig is
//   stappen        [{ titel, tekst }] de begeleidingsinstructie
//   begeleider     rol en houding van degene die begeleidt
//   valkuilen      wat er mis kan gaan
//   opbrengst      wat het onderdeel oplevert
//   tags           vrije trefwoorden
//   kennisbank     optioneel: pad naar een bestaande pagina met verdieping
//   download       optioneel: pad naar een canvas of download
//   verplicht      optioneel: dit blok hoort altijd in het programma
//   vraagtBegeleiding  optioneel: adviseer hierbij externe begeleiding

import { KADERBLOKKEN } from "./blokken-kader.js";
import { ONDERZOEKSBLOKKEN } from "./blokken-onderzoek.js";
import { RICHTINGSBLOKKEN } from "./blokken-richting.js";

export const BLOKKEN = [...KADERBLOKKEN, ...ONDERZOEKSBLOKKEN, ...RICHTINGSBLOKKEN];

export const BLOK_IDS = BLOKKEN.map((b) => b.id);

/** Volgorde van de fasen in een programma. Bepaalt hoe blokken op elkaar volgen. */
export const FASE_VOLGORDE = [
  "landen",
  "ophalen",
  "betekenis",
  "verdieping",
  "keuzes",
  "gedrag",
  "afsluiting",
];

export const FASE_LABELS = {
  landen: "Landen en doel verduidelijken",
  ophalen: "Ervaringen en perspectieven ophalen",
  betekenis: "Betekenis geven aan wat zichtbaar wordt",
  verdieping: "Verdiepen met een passende werkvorm",
  keuzes: "Keuzes en afspraken maken",
  gedrag: "Vertalen naar concreet gedrag",
  afsluiting: "Afsluiten en opvolging vastleggen",
  pauze: "Pauze",
};

/** Zoek een blok op id. Geeft null wanneer het niet bestaat. */
export function blok(id) {
  return BLOKKEN.find((b) => b.id === id) || null;
}

/** Alle blokken in een bepaalde fase. */
export function blokkenInFase(fase) {
  return BLOKKEN.filter((b) => b.fase === fase);
}

/** De blokken die altijd in een programma horen. */
export const VERPLICHTE_BLOKKEN = BLOKKEN.filter((b) => b.verplicht).map((b) => b.id);

/**
 * Blokken die het kader van de dag vormen. Ze worden door programma.js op een
 * vaste plek gezet en mogen daarom niet ook als inhoudelijk onderdeel gekozen
 * worden, anders staat hetzelfde blok twee keer in het programma.
 */
export const KADER_IDS = [
  "kb-welkom-en-doel",
  "kb-inchecken-kort",
  "kb-inchecken-groot",
  "kb-werkafspraken-dag",
  "kb-keuze-maken",
  "kb-afspraken-vastleggen",
  "kb-experiment-kiezen",
  "kb-terugkijken-op-de-dag",
  "kb-check-uit",
  "kb-pauze-kort",
  "kb-lunch",
];
