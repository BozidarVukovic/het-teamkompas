// Onderdelen die een team aan of uit kan zetten.
//
// Niet elk team wil alles tegelijk. Een onderdeel dat af is maar nog niet
// gewenst, hoort niet half verstopt te worden met een voorwaarde hier en een
// voorwaarde daar -- dan verschilt het per scherm of het er is, en dat merk je
// pas als een teamlid ergens op klikt.
//
// Daarom staat het op één plek: een lijst van onderdelen, een instelling per
// team, en één functie die zegt of iets aanstaat.
//
// Drie regels die erbij horen.
//
// Standaard uit. Een onderdeel dat niemand heeft aangezet, bestaat voor dat
// team niet -- ook niet voor een team dat na deze versie wordt aangemaakt.
//
// Uitzetten is verbergen en niet weggooien. Wat er is ingevuld blijft staan en
// komt terug zoals het was. Dat moet ook op het scherm staan, anders durft
// niemand de schakelaar nog aan te raken.
//
// En alleen een teambeheerder schakelt. Dat wordt in de databaseregels
// afgedwongen en niet alleen in de interface.

export const ONDERDELEN = [
  {
    id: "kwartaaldoelen",
    naam: "Kwartaaldoelen en keuzes",
    kort: "Wat ieder dit kwartaal wil bereiken, en hoeveel ruimte daarvoor is.",
    uitleg:
      "Teamleden schrijven op welk resultaat ze willen bereiken, wanneer het geslaagd is, en hoeveel uur per week ze ervoor hebben. Wat ze opschrijven is eerst een concept dat alleen zijzelf zien; delen met het team is een aparte stap.",
    staatBij: "Ik → Mijn kwartaaldoelen",
  },
];

export const ONDERDEEL_IDS = ONDERDELEN.map((o) => o.id);

export function onderdeel(id) {
  return ONDERDELEN.find((o) => o.id === id) || null;
}

/**
 * Staat dit onderdeel aan voor dit team?
 *
 * Alles wat geen uitdrukkelijke `true` is, is uit: een ontbrekend document,
 * een ontbrekend veld, een team dat nog nooit is ingesteld, of een waarde die
 * er per ongeluk anders uitziet. Bij twijfel uit -- de andere kant op raden
 * betekent dat een team ineens iets ziet waar het niet om heeft gevraagd.
 */
export function isAan(instellingen, id) {
  if (!instellingen || !ONDERDEEL_IDS.includes(id)) return false;
  return instellingen[id] === true;
}

/** De onderdelen die voor dit team aanstaan. */
export function aanstaand(instellingen) {
  return ONDERDELEN.filter((o) => isAan(instellingen, o.id));
}

/**
 * Een instellingendocument zoals het de opslag in gaat.
 *
 * Alleen bekende onderdelen, alleen booleans. Een onbekende sleutel verdwijnt
 * hier; de databaseregels weigeren hem daarna nog een keer.
 */
export function schoneInstellingen(ruw = {}) {
  const uit = { versie: 1 };
  for (const id of ONDERDEEL_IDS) uit[id] = ruw[id] === true;
  return uit;
}

/** Wat er bij de schakelaar staat, in woorden en niet alleen in een stand. */
export function standLabel(aan) {
  return aan ? "Staat aan voor het team" : "Staat uit";
}

/**
 * Wat er gebeurt als je hem omzet.
 *
 * Vóór de klik, niet erna: aanzetten maakt iets zichtbaar voor negen mensen
 * tegelijk, en dat wil je weten voordat je het doet.
 */
export function gevolgLabel(id, naarAan) {
  const o = onderdeel(id);
  if (!o) return "";
  return naarAan
    ? `Iedereen in dit team ziet ${o.naam} vanaf dat moment staan, bij ${o.staatBij}.`
    : `${o.naam} verdwijnt uit het menu van het team. Wat er is ingevuld blijft bewaard en komt terug als je het weer aanzet.`;
}
