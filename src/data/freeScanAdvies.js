// ─────────────────────────────────────────────────────────────────────────────
// GRATIS TEAMSCAN — EXPERIMENTEN, REFLECTIEVRAGEN EN CONTENTKOPPELING
//
// Alles vooraf geschreven en met vaste tags gekoppeld aan domeinen en patronen.
//
// De verwijzingen wijzen naar bestaande pagina's in de kennisbank. Het
// validatiescript controleert of elke `href` daadwerkelijk bestaat, zodat een
// rapport nooit naar een dode pagina stuurt.
// ─────────────────────────────────────────────────────────────────────────────

export const EXPERIMENTENBIBLIOTHEEK = { label: "Bekijk alle experimenten", href: "/kennisbank?type=experiment" };

/**
 * Elk experiment heeft een soort: `persoonlijk` doe je alleen, `gesprek` doe je
 * met een collega of in een overleg. Een rapport toont er altijd één van elk.
 */
export const FREE_SCAN_EXPERIMENTEN = [
  {
    id: "exp-onuitgesproken-punt", soort: "persoonlijk", themas: ["veiligheid", "communicatie"],
    titel: "Schrijf je onuitgesproken punt op",
    uitleg: "Voordat je iets kunt zeggen, moet je weten wat je wilt zeggen. Dit experiment maakt zichtbaar wat je normaal inslikt.",
    tijd: "10 minuten", looptijd: "Twee weken",
    eersteStap: "Schrijf vóór het volgende overleg één punt op dat je normaal niet snel zou inbrengen, en formuleer het als open vraag.",
    href: "/kennisbank/reflectievraag/hoe-veilig-is-het-hier-werkelijk",
  },
  {
    id: "exp-laatste-ronde", soort: "gesprek", themas: ["veiligheid", "communicatie"],
    titel: "Sluit een overleg af met één vraag",
    uitleg: "Het echte punt valt vaak pas op de gang. Deze ronde haalt dat moment naar binnen.",
    tijd: "10 minuten per overleg", looptijd: "Vier overleggen",
    eersteStap: "Vraag aan het einde van het volgende overleg: welk punt is vandaag nog niet uitgesproken?",
    href: "/kennisbank/werkvorm/de-laatste-ronde",
  },
  {
    id: "exp-verschil-benoemen", soort: "gesprek", themas: ["communicatie", "veiligheid"],
    titel: "Benoem het verschil hardop",
    uitleg: "Een verschil van inzicht dat niet wordt benoemd, gaat ondergronds verder. Hardop benoemen houdt het bij de zaak.",
    tijd: "15 minuten", looptijd: "Eén gesprek",
    eersteStap: "Zeg bij het eerstvolgende meningsverschil: we denken hier verschillend over, zullen we eerst uitzoeken waarover precies?",
    href: "/kennisbank/werkvorm/spanning-op-tafel",
  },
  {
    id: "exp-luister-eerst", soort: "persoonlijk", themas: ["communicatie", "verbinding"],
    titel: "Vat eerst samen voordat je reageert",
    uitleg: "Wie eerst samenvat, hoort beter wat er werkelijk wordt bedoeld. En de ander merkt dat ook.",
    tijd: "Geen extra tijd", looptijd: "Twee weken",
    eersteStap: "Vat in één overleg eerst het standpunt van een ander samen, en vraag of je het goed hebt begrepen.",
    href: "/kennisbank/reflectievraag/mijn-aandeel-in-het-patroon",
  },
  {
    id: "exp-besluit-vastleggen", soort: "gesprek", themas: ["eigenaarschap", "communicatie"],
    titel: "Leg één besluit vast met naam en datum",
    uitleg: "Afspraken in de wij-vorm horen bij niemand. Eén naam en één datum maken het verschil.",
    tijd: "5 minuten per overleg", looptijd: "Vier weken",
    eersteStap: "Noteer bij het eerstvolgende besluit wie de eerstvolgende stap zet en wanneer jullie evalueren.",
    href: "/kennisbank/interventie/geen-afspraak-zonder-naam-en-datum",
  },
  {
    id: "exp-kleine-verbetering", soort: "persoonlijk", themas: ["eigenaarschap", "leiderschap"],
    titel: "Pak één kleine verbetering op",
    uitleg: "Eigenaarschap groeit door iets af te maken, niet door erover te praten. Klein en zichtbaar werkt het best.",
    tijd: "30 minuten", looptijd: "Vier weken",
    eersteStap: "Kies één ergernis die jij zelf kunt oplossen zonder toestemming, en los hem deze week op.",
    href: "/kennisbank/experiment/vier-weken-een-afspraak",
  },
  {
    id: "exp-terugkoppeling-vragen", soort: "gesprek", themas: ["leiderschap", "eigenaarschap"],
    titel: "Vraag wat er met inbreng gebeurt",
    uitleg: "Ideeën die verdwijnen kosten meer vertrouwen dan ideeën die worden afgewezen. Vragen naar de uitkomst maakt dat zichtbaar.",
    tijd: "10 minuten", looptijd: "Eén gesprek",
    eersteStap: "Vraag bij je leidinggevende of in het overleg wat er is gebeurd met het laatste voorstel dat jij hebt ingebracht.",
    href: "/kennisbank/experiment/de-leidinggevende-spreekt-als-laatste",
  },
  {
    id: "exp-vraag-naar-het-waarom", soort: "persoonlijk", themas: ["leiderschap"],
    titel: "Vraag naar het waarom",
    uitleg: "Wat weerstand heet, is vaak een informatieprobleem. Eén vraag naar de reden verandert vaak meer dan een discussie over de aanpak.",
    tijd: "5 minuten", looptijd: "Twee weken",
    eersteStap: "Vraag bij de eerstvolgende verandering wat er precies verandert, waarom nu, en wat er hetzelfde blijft.",
    href: "/kennisbank/werkvorm/verandering-in-drie-vragen",
  },
  {
    id: "exp-energie-bijhouden", soort: "persoonlijk", themas: ["energie"],
    titel: "Houd een week je energie bij",
    uitleg: "Drukte en uitputting zijn twee verschillende dingen. Een week bijhouden laat zien waar het verschil zit.",
    tijd: "2 minuten per dag", looptijd: "Eén week",
    eersteStap: "Noteer aan het eind van elke werkdag één moment dat energie gaf en één moment dat energie kostte.",
    href: "/kennisbank/reflectievraag/waar-gaat-mijn-energie-heen",
  },
  {
    id: "exp-energiegevers-rondje", soort: "gesprek", themas: ["energie", "verbinding"],
    titel: "Eén energiegever en één energielek",
    uitleg: "Werkdruk wordt vaak besproken als hoeveelheid werk. Dit rondje brengt ook de hulpbronnen in beeld.",
    tijd: "15 minuten", looptijd: "Eén overleg",
    eersteStap: "Benoem in de volgende check-in één energiegever en één energielek dat je zelf kunt beïnvloeden.",
    href: "/kennisbank/werkvorm/energiegevers-en-energievreters",
  },
  {
    id: "exp-hulp-vragen", soort: "persoonlijk", themas: ["verbinding", "energie"],
    titel: "Vraag deze week één keer hardop om hulp",
    uitleg: "Hulp vragen kost status zolang niemand het doet. Iemand moet beginnen.",
    tijd: "5 minuten", looptijd: "Vier weken",
    eersteStap: "Vraag deze week in het overleg of in het teamkanaal zichtbaar om hulp bij iets waar je vastloopt.",
    href: "/kennisbank/experiment/hardop-hulp-vragen",
  },
  {
    id: "exp-steun-vragen-overleg", soort: "gesprek", themas: ["verbinding"],
    titel: "Vraag in de dagstart waar hulp nodig is",
    uitleg: "Eén vaste vraag in een bestaand ritme haalt vastgelopen werk eerder boven tafel.",
    tijd: "5 minuten", looptijd: "Vier weken",
    eersteStap: "Voeg aan het volgende startmoment de vraag toe: waar heb jij deze week hulp bij nodig?",
    href: "/kennisbank/interventie/de-hulpvraag-in-de-dagstart",
  },
  {
    id: "exp-eigen-aandeel", soort: "persoonlijk", themas: ["veiligheid", "communicatie", "eigenaarschap", "verbinding", "energie", "leiderschap"],
    titel: "Onderzoek je eigen aandeel",
    uitleg: "Wie last heeft van het gedrag van een ander, ziet zijn eigen bijdrage meestal als reactie. Deze vragen zetten dat even om.",
    tijd: "5 minuten", looptijd: "Eenmalig",
    eersteStap: "Beschrijf één terugkerende situatie feitelijk, en schrijf op welke reactie van jou het patroon in stand houdt.",
    href: "/kennisbank/reflectievraag/mijn-aandeel-in-het-patroon",
  },
  {
    id: "exp-benoem-wat-werkt", soort: "gesprek", themas: ["verbinding", "veiligheid", "eigenaarschap", "energie", "communicatie", "leiderschap"],
    titel: "Benoem wat goed gaat en door wie",
    uitleg: "Wat goed werkt blijft vaak onbesproken en verdwijnt daardoor ongemerkt. Benoemen houdt het in stand.",
    tijd: "10 minuten", looptijd: "Vier weken",
    eersteStap: "Vraag aan het eind van de week: wie heeft jou deze week geholpen, en waarmee precies?",
    href: "/kennisbank/interventie/wat-ging-er-goed-en-door-wie",
  },
];

export const EXPERIMENT_IDS = FREE_SCAN_EXPERIMENTEN.map((e) => e.id);

/**
 * De derde reflectievraag gaat altijd over de eigen invloed of bijdrage.
 * Welke vraag verschijnt, hangt af van het domein met de laagste score, zodat
 * de vraag aansluit bij de rest van het rapport.
 */
export const EIGEN_BIJDRAGE_VRAGEN = {
  veiligheid: "Wat doe jij zelf waardoor het voor een ander makkelijker of moeilijker wordt om zich uit te spreken?",
  communicatie: "Wanneer vul jij het antwoord van een ander alvast in, in plaats van door te vragen?",
  eigenaarschap: "Welke kleine bijdrage kun jij leveren zonder de verantwoordelijkheid van anderen over te nemen?",
  verbinding: "Aan welke collega heb jij de afgelopen maand niets gevraagd, terwijl dat wel had geholpen?",
  energie: "Welke taak geeft je energie en welke taak vraagt structureel meer dan zij oplevert?",
  leiderschap: "Welke vraag over richting of verwachtingen heb jij nog niet hardop gesteld?",
  standaard: "Wat zou jij deze week anders doen als je wist dat niemand het je kwalijk zou nemen?",
};

/**
 * Onderwerpen waarop we in de kennisbank zoeken naar een passend artikel of
 * hulpmiddel. De volgorde bepaalt de voorkeur: de eerste tag weegt het zwaarst.
 */
export const DOMEIN_TAGS = {
  veiligheid: ["psychologische-veiligheid", "vertrouwen", "aanspreekbaarheid"],
  communicatie: ["communicatie", "conflict", "feedback"],
  eigenaarschap: ["eigenaarschap", "besluitvorming", "afspraken"],
  verbinding: ["samenwerking", "kwaliteiten", "hulp-vragen"],
  energie: ["energie", "werkdruk", "bevlogenheid"],
  leiderschap: ["leiderschap", "verandering", "betekenis"],
};

/**
 * Vaste zinnen die uitleggen waarom een aanbeveling past. `{titel}` wordt
 * vervangen door de titel van het gevonden item.
 */
export const AANBEVELING_REDENEN = {
  patroon: "Dit sluit aan bij het patroon dat in jouw antwoorden opvalt.",
  domein: "Dit sluit aan bij het domein waar volgens jouw antwoorden de meeste ruimte zit.",
};

export default FREE_SCAN_EXPERIMENTEN;
