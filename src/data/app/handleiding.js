// De hand-in-handleiding: tien secties waarin iemand in eigen woorden opschrijft
// hoe er met hem of haar samengewerkt kan worden.
//
// De handleiding is optioneel. De app werkt volledig zonder. Wie hem wel
// invult, krijgt per sectie een concept op basis van de kenmerken die al
// bekend zijn — als startpunt, nooit als eindtekst. De gebruiker herschrijft
// alles wat hij wil en bepaalt zelf wat gedeeld wordt.

import { KENMERKEN, optieVan } from "./kenmerken.js";

export const SECTIES = [
  {
    id: "hoe-ik-werk",
    titel: "Hoe ik het liefst werk",
    uitleg: "Je werkritme: tempo, structuur, en hoeveel context je nodig hebt.",
    kenmerken: ["tempo", "structuur", "context"],
    voorbeeld: "Ik werk het prettigst als ik weet waar we naartoe gaan en zelf mag bepalen hoe ik er kom.",
  },
  {
    id: "bereiken",
    titel: "Hoe je me het beste bereikt",
    uitleg: "Wanneer en op welke manier een vraag of overleg het beste landt.",
    kenmerken: ["contact", "denken"],
    voorbeeld: "Een kort bericht werkt bij mij beter dan een spontaan telefoontje.",
  },
  {
    id: "besluiten",
    titel: "Wat ik nodig heb bij besluiten",
    uitleg: "Waardoor je achter een besluit kunt staan, ook als het niet jouw keuze was.",
    kenmerken: ["besluitvorming", "tempo"],
    voorbeeld: "Als ik begrijp waarom iets besloten is, ga ik er zonder mopperen in mee.",
  },
  {
    id: "feedback",
    titel: "Hoe ik feedback het liefst krijg",
    uitleg: "Vorm, moment en toon waardoor feedback bij jou aankomt.",
    kenmerken: ["feedback"],
    voorbeeld: "Zeg het gerust meteen, liefst met een voorbeeld erbij.",
  },
  {
    id: "spanning",
    titel: "Wat er bij mij gebeurt onder spanning",
    uitleg: "Wat anderen aan je merken als het druk of ongemakkelijk wordt.",
    kenmerken: ["spanning"],
    voorbeeld: "Ik word stiller. Dat betekent niet dat ik afhaak; vraag me gerust wat ik denk.",
  },
  {
    id: "energie",
    titel: "Waar ik energie van krijg",
    uitleg: "Het soort werk en samenwerken waar je vrolijk van wordt.",
    kenmerken: ["energie"],
    voorbeeld: "Ik krijg energie van iets echt afmaken en er samen naar kijken.",
  },
  {
    id: "energieverlies",
    titel: "Wat mij energie kost",
    uitleg: "Wat je uitput, ook als je er niets van laat merken.",
    kenmerken: ["energieverlies"],
    voorbeeld: "Lange overleggen zonder besluit kosten mij veel energie.",
  },
  {
    id: "misverstand",
    titel: "Wat er soms verkeerd begrepen wordt",
    uitleg: "Het misverstand dat je het vaakst moet rechtzetten.",
    kenmerken: ["misverstand"],
    voorbeeld: "Ik kan kortaf overkomen terwijl ik gewoon met de inhoud bezig ben.",
  },
  {
    id: "aanspreken",
    titel: "Waar je me op mag aanspreken",
    uitleg: "De uitnodiging die je aan je collega's geeft.",
    kenmerken: ["aanspreken"],
    voorbeeld: "Spreek me gerust aan als ik te snel ga voor de rest.",
  },
  {
    id: "van-jou",
    titel: "Wat ik van jou nodig heb",
    uitleg: "Wat de samenwerking voor jou beter maakt, concreet gemaakt.",
    kenmerken: ["context", "feedback", "besluitvorming"],
    voorbeeld: "Zeg het als iets niet lukt, dan kan ik meedenken in plaats van wachten.",
  },
];

export const SECTIE_IDS = SECTIES.map((s) => s.id);

export function sectie(id) {
  return SECTIES.find((s) => s.id === id) || null;
}

/**
 * Stelt een conceptzin samen uit de kenmerken die al bekend zijn.
 *
 * `waarden` is { kenmerkId: { waarde } } zoals bepaalWaarden() dat teruggeeft.
 * Zijn er voor deze sectie geen kenmerken bekend, dan komt er niets terug en
 * blijft het veld gewoon leeg.
 */
export function conceptVoorSectie(sectieId, waarden = {}) {
  const s = sectie(sectieId);
  if (!s) return "";

  const zinnen = s.kenmerken
    .map((kenmerkId) => {
      const gekozen = waarden[kenmerkId];
      if (!gekozen || !gekozen.waarde) return null;
      const optie = optieVan(kenmerkId, gekozen.waarde);
      return optie ? optie.deelbaarAls : null;
    })
    .filter(Boolean);

  return zinnen.join(" ");
}

/** Welke kenmerken de handleiding kan raken; gebruikt in de uitleg. */
export const KENMERKEN_IN_HANDLEIDING = [
  ...new Set(SECTIES.flatMap((s) => s.kenmerken)),
].filter((id) => KENMERKEN.some((k) => k.id === id));
