// De catalogus van samenwerkingskenmerken.
//
// Dit is de gemeenschappelijke taal van de app: een Insights Discovery-profiel,
// een hand-in-handleiding en wat iemand zelf bevestigt komen allemaal uit op
// deze kenmerken. De advieslogica kent alleen deze ids en weet niet waar een
// waarde vandaan komt — dat maakt het mogelijk om later andere bronnen toe te
// voegen zonder de regels te wijzigen.
//
// Bewust géén psychologische typering. Een kenmerk beschrijft een voorkeur in
// samenwerking, niet wie iemand is. Alle formuleringen zijn voorzichtig.

/** Waar een waarde vandaan komt, oplopend in gewicht. */
export const BRONNEN = [
  { id: "insights_discovery", label: "Uit je Insights Discovery-profiel", gewicht: 2, uitleg: "Afgeleid uit wat je bij je profiel hebt ingevuld." },
  { id: "manual", label: "Zelf ingevuld", gewicht: 3, uitleg: "Je hebt dit zelf opgeschreven." },
  { id: "hand_in_handleiding", label: "Uit je hand-in-handleiding", gewicht: 3, uitleg: "Overgenomen uit wat je in je handleiding hebt gezet." },
  { id: "user_confirmation", label: "Door jou bevestigd", gewicht: 4, uitleg: "Je hebt dit gelezen en bevestigd dat het klopt." },
];

export const BRON_GEWICHT = Object.fromEntries(BRONNEN.map((b) => [b.id, b.gewicht]));

/** Antwoord op de vraag of een afgeleid kenmerk klopt. */
export const BEVESTIGING = [
  { id: "sterk", label: "Ja, dat klopt", gewicht: 1 },
  { id: "soms", label: "Soms", gewicht: 0.6 },
  { id: "nee", label: "Nee, dat klopt niet", gewicht: 0 },
];

/**
 * De kenmerken zelf.
 *
 * `opties` zijn de mogelijke waarden. `vraag` is hoe we het aan de gebruiker
 * voorleggen wanneer we het willen laten bevestigen. `deelbaarAls` is de zin
 * die een teamgenoot te zien krijgt wanneer dit kenmerk gedeeld wordt — dus
 * nooit de ruwe waarde, altijd een zin in de eerste persoon.
 */
export const KENMERKEN = [
  {
    id: "tempo",
    categorie: "werkritme",
    label: "Tempo bij besluiten",
    vraag: "Je profiel suggereert dat je bij belangrijke besluiten graag eerst tijd hebt om na te denken. Herken je dit?",
    opties: [
      { id: "snel", label: "Ik werk graag snel naar een besluit toe", deelbaarAls: "Ik werk graag vlot naar een besluit toe." },
      { id: "gemiddeld", label: "Dat hangt van het onderwerp af", deelbaarAls: "Hoe snel ik wil beslissen hangt bij mij van het onderwerp af." },
      { id: "bedachtzaam", label: "Ik wil eerst tijd om na te denken", deelbaarAls: "Bij belangrijke besluiten heb ik graag eerst tijd om na te denken." },
    ],
  },
  {
    id: "context",
    categorie: "informatie",
    label: "Behoefte aan context",
    vraag: "Heb je bij een nieuw onderwerp graag eerst het grotere geheel voordat je de details in gaat?",
    opties: [
      { id: "veel", label: "Ik wil eerst het hele plaatje", deelbaarAls: "Ik begrijp iets pas goed als ik eerst het grotere geheel ken." },
      { id: "kort", label: "Een korte aanleiding is genoeg", deelbaarAls: "Een korte aanleiding is voor mij meestal genoeg om te beginnen." },
      { id: "detail", label: "Ik begin liever bij de details", deelbaarAls: "Ik begin liever bij de concrete details dan bij het grote geheel." },
    ],
  },
  {
    id: "structuur",
    categorie: "werkritme",
    label: "Structuur of ruimte",
    vraag: "Werk je prettiger met een duidelijke structuur, of juist met ruimte om onderweg te bepalen hoe iets gaat?",
    opties: [
      { id: "structuur", label: "Duidelijke afspraken en structuur", deelbaarAls: "Ik werk het prettigst met duidelijke afspraken en een heldere structuur." },
      { id: "gemengd", label: "Kaders, maar ruimte in de uitvoering", deelbaarAls: "Ik houd van duidelijke kaders met ruimte in de uitvoering." },
      { id: "ruimte", label: "Liefst ruimte om het onderweg te bepalen", deelbaarAls: "Ik houd ervan om onderweg te bepalen hoe iets het beste kan." },
    ],
  },
  {
    id: "denken",
    categorie: "communicatie",
    label: "Hardop denken of eerst zelf",
    vraag: "Denk je het liefst hardop met anderen, of wil je eerst voor jezelf nadenken?",
    opties: [
      { id: "hardop", label: "Ik denk hardop, in gesprek", deelbaarAls: "Ik denk het beste hardop, in gesprek met een ander." },
      { id: "wisselend", label: "Dat wisselt per onderwerp", deelbaarAls: "Of ik hardop of eerst voor mezelf denk, wisselt per onderwerp." },
      { id: "alleen", label: "Ik denk eerst voor mezelf", deelbaarAls: "Ik denk eerst voor mezelf na en kom daarna met een reactie." },
    ],
  },
  {
    id: "contact",
    categorie: "communicatie",
    label: "Taakgericht of persoonlijk",
    vraag: "Begin je een overleg liever meteen bij de inhoud, of eerst even bij hoe het gaat?",
    opties: [
      { id: "taak", label: "Meteen bij de inhoud", deelbaarAls: "Ik begin een overleg het liefst meteen bij de inhoud." },
      { id: "beide", label: "Kort persoonlijk, dan de inhoud", deelbaarAls: "Ik begin graag even persoonlijk en ga daarna naar de inhoud." },
      { id: "relatie", label: "Eerst even bij hoe het gaat", deelbaarAls: "Even bijpraten hoort voor mij bij goed samenwerken." },
    ],
  },
  {
    id: "feedback",
    categorie: "feedback",
    label: "Feedback ontvangen",
    vraag: "Hoe hoor je feedback het liefst?",
    opties: [
      { id: "direct", label: "Direct en zonder omhaal", deelbaarAls: "Zeg het gerust direct; van omtrekkende bewegingen word ik onrustig." },
      { id: "voorbeeld", label: "Met een concreet voorbeeld erbij", deelbaarAls: "Feedback landt bij mij het best met een concreet voorbeeld erbij." },
      { id: "rustig", label: "Rustig en onder vier ogen", deelbaarAls: "Ik hoor feedback het liefst rustig en onder vier ogen." },
    ],
  },
  {
    id: "spanning",
    categorie: "spanning",
    label: "Reactie bij spanning",
    vraag: "Wat gebeurt er meestal bij jou wanneer de spanning oploopt?",
    opties: [
      { id: "sneller", label: "Ik word directer en sneller", deelbaarAls: "Als de spanning oploopt word ik directer. Dat is bij mij geen boosheid." },
      { id: "stiller", label: "Ik word stiller", deelbaarAls: "Als de spanning oploopt word ik stiller. Vraag me gerust wat ik denk." },
      { id: "uitleg", label: "Ik ga meer uitleggen", deelbaarAls: "Als de spanning oploopt ga ik meer uitleggen dan nodig is." },
      { id: "terugtrekken", label: "Ik heb even ruimte nodig", deelbaarAls: "Bij spanning heb ik even ruimte nodig voordat ik verder kan praten." },
    ],
  },
  {
    id: "besluitvorming",
    categorie: "besluiten",
    label: "Meedoen aan besluiten",
    vraag: "Wat heb je nodig om achter een besluit te kunnen staan?",
    opties: [
      { id: "meepraten", label: "Ik wil erover meegepraat hebben", deelbaarAls: "Ik sta achter een besluit als ik erover heb kunnen meepraten." },
      { id: "waarom", label: "Ik wil begrijpen waarom", deelbaarAls: "Als ik begrijp waarom een besluit genomen is, kan ik er goed mee verder." },
      { id: "knoop", label: "Het liefst gewoon een knoop doorhakken", deelbaarAls: "Ik heb liever een besluit dan een lang gesprek over alle opties." },
    ],
  },
  {
    id: "energie",
    categorie: "energie",
    label: "Waar je energie van krijgt",
    vraag: "Waar krijg je in het samenwerken energie van?",
    opties: [
      { id: "samen", label: "Samen dingen aanpakken", deelbaarAls: "Ik krijg energie van dingen samen aanpakken." },
      { id: "afronden", label: "Dingen afmaken", deelbaarAls: "Ik krijg energie van iets echt afronden." },
      { id: "nieuw", label: "Nieuwe ideeën en mogelijkheden", deelbaarAls: "Ik krijg energie van nieuwe ideeën en mogelijkheden." },
      { id: "verdieping", label: "Ergens goed in duiken", deelbaarAls: "Ik krijg energie van ergens rustig goed in duiken." },
    ],
  },
  {
    id: "energieverlies",
    categorie: "energie",
    label: "Wat energie kost",
    vraag: "Wat kost jou in het samenwerken de meeste energie?",
    opties: [
      { id: "onduidelijk", label: "Onduidelijkheid", deelbaarAls: "Onduidelijkheid kost mij veel energie." },
      { id: "onderbreking", label: "Steeds onderbroken worden", deelbaarAls: "Steeds onderbroken worden kost mij veel energie." },
      { id: "langoverleg", label: "Lange overleggen zonder besluit", deelbaarAls: "Lange overleggen zonder besluit kosten mij veel energie." },
      { id: "conflict", label: "Onuitgesproken spanning", deelbaarAls: "Onuitgesproken spanning kost mij veel energie." },
    ],
  },
  {
    id: "aanspreken",
    categorie: "feedback",
    label: "Waarop je aangesproken mag worden",
    vraag: "Waar mogen anderen je op aanspreken?",
    opties: [
      { id: "tempo", label: "Als ik te snel ga", deelbaarAls: "Spreek me gerust aan als ik te snel ga voor de rest." },
      { id: "detail", label: "Als ik te lang in details blijf", deelbaarAls: "Spreek me gerust aan als ik te lang in de details blijf hangen." },
      { id: "stil", label: "Als ik niets zeg", deelbaarAls: "Spreek me gerust aan als ik in een overleg stil blijf." },
      { id: "toezegging", label: "Als ik iets niet nakom", deelbaarAls: "Spreek me gerust aan als ik een toezegging niet nakom." },
    ],
  },
  {
    id: "misverstand",
    categorie: "spanning",
    label: "Wat anderen soms verkeerd interpreteren",
    vraag: "Wat wordt er soms verkeerd begrepen aan hoe jij doet?",
    opties: [
      { id: "kortaf", label: "Dat ik kortaf overkom", deelbaarAls: "Ik kan kortaf overkomen. Meestal ben ik dan gewoon met de inhoud bezig." },
      { id: "twijfel", label: "Dat vragen stellen twijfel lijkt", deelbaarAls: "Als ik veel vraag, twijfel ik niet aan jou. Ik wil het goed begrijpen." },
      { id: "stilte", label: "Dat stilte desinteresse lijkt", deelbaarAls: "Als ik stil ben, ben ik meestal aan het nadenken en niet ongeïnteresseerd." },
      { id: "enthousiasme", label: "Dat enthousiasme een toezegging lijkt", deelbaarAls: "Mijn enthousiasme is niet altijd een toezegging. Vraag me gerust of ik het echt doe." },
    ],
  },
];

export const KENMERK_IDS = KENMERKEN.map((k) => k.id);

export function kenmerk(id) {
  return KENMERKEN.find((k) => k.id === id) || null;
}

export function optieVan(kenmerkId, optieId) {
  const k = kenmerk(kenmerkId);
  if (!k) return null;
  return k.opties.find((o) => o.id === optieId) || null;
}

/** De zin die een teamgenoot te zien krijgt bij een gedeeld kenmerk. */
export function deelzin(kenmerkId, optieId) {
  const o = optieVan(kenmerkId, optieId);
  return o ? o.deelbaarAls : null;
}

export const CATEGORIEEN = [
  { id: "werkritme", label: "Werkritme" },
  { id: "informatie", label: "Informatie" },
  { id: "communicatie", label: "Communicatie" },
  { id: "besluiten", label: "Besluiten" },
  { id: "feedback", label: "Feedback" },
  { id: "spanning", label: "Spanning" },
  { id: "energie", label: "Energie" },
];
