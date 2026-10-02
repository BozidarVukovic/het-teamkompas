// Waar iemand hulp bij kan gebruiken, en waaraan je ziet wie dat zou kunnen.
//
// De bestaande tool begint bij een collega: je kiest iemand, en krijgt advies
// over het samenwerken met die persoon. Deze lijst hoort bij de tweede ingang,
// die bij een taak begint: je beschrijft waar je vastloopt, en de app zoekt
// wie in het team daarbij zou kunnen helpen.
//
// Per hulpsoort staan drie dingen:
//
//   aanwijzingen   Kenmerkwaarden die een mogelijke bijdrage suggereren, met de
//                  zin die daarbij op het scherm komt. Een aanwijzing, geen
//                  bewijs: "deze collega gaf aan energie te krijgen van iets
//                  afronden" is iets anders dan "deze collega maakt alles af".
//
//   woorden        Woorden waarop de hand-in-handleiding wordt doorzocht. Wat
//                  iemand zélf heeft opgeschreven weegt zwaarder dan wat uit
//                  een profiel is afgeleid, want het is een uitspraak en geen
//                  interpretatie. De gevonden zin wordt geciteerd, zodat de
//                  gebruiker zelf kan zien waar het op gebaseerd is.
//
//   tegen          Kenmerkwaarden die de andere kant op wijzen. Komen die
//                  samen met een aanwijzing voor, dan spreekt de informatie
//                  zichzelf tegen en zegt de app dat -- in plaats van de
//                  tegenspraak weg te laten en stellig te klinken.
//
// Voltooide deelwoorden staan er apart bij ("afgerond" naast "afronden").
// De woordvergelijking kijkt naar het begin van een woord, en Nederlandse
// deelwoorden beginnen juist anders dan hun werkwoord. Dat met code willen
// oplossen levert een halve taalkundige op; een woord erbij zetten is
// eerlijker en te controleren.
//
// Wat hier met opzet niet staat: expertise, beschikbaarheid, ervaring of
// eigenschappen. Die velden bestaan niet in de teamomgeving en worden hier dus
// ook niet verzonnen. Wat er wél is -- de functie die iemand zelf invulde --
// wordt alleen gebruikt als de hulpvraag er woordelijk op aansluit.

export const HULPSOORTEN = [
  {
    id: "ideeen",
    label: "Ideeën ontwikkelen",
    bijdrage: "samen opties verkennen voordat je kiest",
    aanwijzingen: [
      { kenmerkId: "energie", waarde: "nieuw", zin: "gaf aan energie te krijgen van nieuwe ideeën en mogelijkheden" },
      { kenmerkId: "denken", waarde: "hardop", zin: "denkt naar eigen zeggen het beste hardop, in gesprek" },
      { kenmerkId: "structuur", waarde: "ruimte", zin: "bepaalt graag onderweg hoe iets het beste kan" },
    ],
    tegen: [{ kenmerkId: "denken", waarde: "alleen" }],
    woorden: ["idee", "ideeën", "ideeen", "brainstorm", "bedenken", "bedacht", "creatief", "mogelijkheden", "verkennen"],
  },
  {
    id: "meedenken",
    label: "Inhoudelijk meedenken",
    bijdrage: "met je meedenken over de inhoud",
    aanwijzingen: [
      { kenmerkId: "denken", waarde: "hardop", zin: "denkt naar eigen zeggen het beste hardop, in gesprek" },
      { kenmerkId: "context", waarde: "veel", zin: "wil eerst het grotere geheel kennen voordat de details komen" },
      { kenmerkId: "energie", waarde: "samen", zin: "gaf aan energie te krijgen van dingen samen aanpakken" },
    ],
    tegen: [],
    woorden: ["meedenken", "meegedacht", "sparren", "klankbord", "overleggen", "samen kijken", "tweede paar ogen"],
  },
  {
    id: "toetsen",
    label: "Kritisch toetsen",
    bijdrage: "je voorstel tegen het licht houden voordat het de deur uit gaat",
    aanwijzingen: [
      { kenmerkId: "context", waarde: "detail", zin: "begint naar eigen zeggen liever bij de concrete details" },
      { kenmerkId: "feedback", waarde: "direct", zin: "zegt het liever direct, zonder omtrekkende bewegingen" },
      { kenmerkId: "aanspreken", waarde: "detail", zin: "vroeg zelf om aangesproken te worden als het detailniveau niet klopt" },
      { kenmerkId: "energie", waarde: "verdieping", zin: "gaf aan energie te krijgen van ergens rustig goed in duiken" },
    ],
    tegen: [],
    woorden: ["kritisch", "toetsen", "getoetst", "scherp", "nauwkeurig", "controleren", "gecontroleerd", "risico", "checken", "detail"],
  },
  {
    id: "structuur",
    label: "Structuur en overzicht",
    bijdrage: "je ideeën ordenen en er een plan van maken",
    aanwijzingen: [
      { kenmerkId: "structuur", waarde: "structuur", zin: "werkt naar eigen zeggen het prettigst met duidelijke afspraken en een heldere structuur" },
      { kenmerkId: "energieverlies", waarde: "onduidelijk", zin: "gaf aan dat onduidelijkheid veel energie kost" },
      { kenmerkId: "aanspreken", waarde: "tempo", zin: "vroeg zelf om aangesproken te worden bij te hoog tempo" },
    ],
    tegen: [{ kenmerkId: "structuur", waarde: "ruimte" }],
    woorden: ["overzicht", "structuur", "ordenen", "geordend", "planning", "op een rij", "kaders", "stappen", "plan"],
  },
  {
    id: "besluiten",
    label: "Kiezen en besluiten",
    bijdrage: "met jou de knoop doorhakken",
    aanwijzingen: [
      { kenmerkId: "besluitvorming", waarde: "knoop", zin: "heeft naar eigen zeggen liever een besluit dan een lang gesprek over alle opties" },
      { kenmerkId: "tempo", waarde: "snel", zin: "werkt graag vlot naar een besluit toe" },
      { kenmerkId: "energieverlies", waarde: "langoverleg", zin: "gaf aan dat lange overleggen zonder besluit veel energie kosten" },
    ],
    tegen: [{ kenmerkId: "tempo", waarde: "bedachtzaam" }],
    woorden: ["kiezen", "gekozen", "besluit", "besloten", "beslissen", "knoop", "doorhakken", "prioriteit", "prioriteiten"],
  },
  {
    id: "afronden",
    label: "Uitvoeren en afronden",
    bijdrage: "de laatste stappen met je bepalen en vasthouden",
    aanwijzingen: [
      { kenmerkId: "energie", waarde: "afronden", zin: "gaf aan energie te krijgen van iets echt afronden" },
      { kenmerkId: "aanspreken", waarde: "toezegging", zin: "vroeg zelf om aangesproken te worden op toezeggingen" },
      { kenmerkId: "structuur", waarde: "structuur", zin: "werkt naar eigen zeggen het prettigst met duidelijke afspraken en een heldere structuur" },
    ],
    tegen: [{ kenmerkId: "energie", waarde: "nieuw" }, { kenmerkId: "structuur", waarde: "ruimte" }],
    woorden: ["afronden", "afgerond", "afmaken", "afgemaakt", "opleveren", "opgeleverd", "opvolgen", "opvolging", "laatste", "deadline", "klaar", "uitvoeren"],
  },
  {
    id: "draagvlak",
    label: "Afstemmen en draagvlak",
    bijdrage: "helpen om anderen mee te nemen in je voorstel",
    aanwijzingen: [
      { kenmerkId: "contact", waarde: "relatie", zin: "gaf aan dat even bijpraten bij goed samenwerken hoort" },
      { kenmerkId: "besluitvorming", waarde: "meepraten", zin: "staat achter een besluit als erover is meegepraat" },
      { kenmerkId: "energie", waarde: "samen", zin: "gaf aan energie te krijgen van dingen samen aanpakken" },
    ],
    tegen: [{ kenmerkId: "contact", waarde: "taak" }],
    woorden: ["draagvlak", "afstemmen", "afgestemd", "meenemen", "betrekken", "betrokken", "communicatie", "achterban", "stakeholder"],
  },
];

export const HULPSOORT_IDS = HULPSOORTEN.map((h) => h.id);

export function hulpsoort(id) {
  return HULPSOORTEN.find((h) => h.id === id) || null;
}

/**
 * Welke kenmerken worden gebruikt om startadvies te geven, en in welke
 * volgorde.
 *
 * Dit zijn de voorkeuren waar je bij een eerste gesprek iets aan hebt: hoe
 * iemand benaderd wil worden, hoe die denkt, hoe feedback het beste landt en
 * in welk tempo. Niet alles wat er is -- twee tips is genoeg, en de rest staat
 * al bij "Samenwerken met...".
 */
export const START_KENMERKEN = ["contact", "denken", "feedback", "tempo"];

/* Woorden die in elke zin staan en dus niets zeggen over de hulpvraag. Zonder
   deze lijst zou "een plan voor het team" aansluiten op elke functie waarin
   het woord "team" voorkomt. */
export const VULWOORDEN = new Set([
  "een", "het", "de", "van", "voor", "met", "aan", "bij", "dat", "die", "deze",
  "maar", "want", "omdat", "niet", "geen", "ook", "nog", "wel", "zijn", "heeft",
  "hebben", "worden", "wordt", "kunnen", "moeten", "willen", "gaan", "komen",
  "zoek", "zoeken", "hulp", "iemand", "collega", "team", "werk", "werken",
  "mijn", "ik", "je", "we", "ze", "er", "op", "in", "om", "te", "en", "of",
]);
