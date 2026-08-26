// Programmasporen: per aanleiding of gewenst resultaat een voorkeursvolgorde
// van blokken.
//
// Een spoor is geen vast programma. De selectielogica in
// src/lib/teamdag/selectie.js loopt de voorkeurslijst af en houdt daarbij
// rekening met groepsgrootte, veiligheid, beschikbare tijd, ervaring en de
// gekozen manieren van werken. Wat niet past, wordt overgeslagen.

export const SPOREN = [
  {
    id: "nieuw-team",
    titel: "Een goede start maken",
    advies: "Een teamdag is hier meestal een passende eerste stap: een nieuw team heeft een moment nodig waarop het afspreekt hoe het gaat samenwerken, in plaats van dat gaandeweg te ontdekken.",
    voorkeur: ["ob-kennismaken-samenwerking", "rb-belanghebbenden", "rb-gezamenlijke-opdracht", "rb-onderlinge-afhankelijkheden", "rb-rollencanvas", "rb-eerste-werkafspraken"],
    aandachtspunten: [
      "Een nieuw team wil vaak meteen inhoudelijk aan de slag. Reserveer bewust tijd voor de vraag hoe jullie gaan samenwerken, anders komt die vraag over drie maanden alsnog terug in de vorm van irritatie.",
      "Spreek af wanneer jullie deze afspraken opnieuw bekijken. Wat je in week één afspreekt, klopt in maand drie meestal niet meer.",
    ],
  },
  {
    id: "patroon-onderzoeken",
    titel: "Begrijpen wat er speelt",
    advies: "Wanneer nog niet scherp is waar het precies op vastloopt, is een teamdag vooral zinvol als onderzoek. Kies een programma dat begint bij begrijpen en pas laat op de dag bij oplossingen uitkomt.",
    voorkeur: ["kb-individuele-reflectie", "ob-1-2-4-alle", "ob-symptoom-naar-patroon", "ob-orid", "ob-stoppen-houden-starten", "rb-teamafspraken-canvas"],
    aandachtspunten: [
      "De neiging om snel naar oplossingen te gaan is groot. Een oplossing voor een verkeerd begrepen probleem kost meer tijd dan het onderzoek dat je oversloeg.",
      "Spreek vooraf af dat het een geldige uitkomst is wanneer de dag eindigt met een scherpere vraag in plaats van een oplossing.",
    ],
  },
  {
    id: "rolhelderheid",
    titel: "Rollen en verantwoordelijkheden verhelderen",
    advies: "Rolonduidelijkheid is een van de dankbaarste onderwerpen voor een teamdag: het is concreet, het raakt iedereen, en er valt op één dag echt iets vast te leggen.",
    voorkeur: ["rb-takeninventarisatie", "rb-rollencanvas", "rb-bevoegdheden", "rb-onderlinge-afhankelijkheden", "rb-besluitvormingsladder"],
    aandachtspunten: [
      "Onderzoek vooraf of de onduidelijkheid bij het team ligt of bij de opdracht van de organisatie. In het tweede geval kan een teamdag de vraag scherpen, maar niet oplossen.",
      "Wanneer de leidinggevende geen mandaat heeft om rollen daadwerkelijk vast te leggen, wordt de dag een inventarisatie. Zeg dat dan vooraf.",
    ],
  },
  {
    id: "aanspreekbaarheid",
    titel: "Elkaar aanspreken en afspraken nakomen",
    advies: "Dit onderwerp vraagt voldoende onderling vertrouwen. Is dat er, dan levert een teamdag hier veel op. Is dat er nog niet, begin dan bij veiligheid en niet bij feedbackoefeningen.",
    voorkeur: ["kb-individuele-reflectie", "ob-waarneming-interpretatie", "ob-sbi", "rb-afspraak-over-aanspreken", "rb-teamafspraken-canvas"],
    aandachtspunten: [
      "Een feedbackoefening in een team waar spanning onder de oppervlakte zit, wordt vaak gebruikt om alsnog een verwijt te maken. Onderzoek dat vooraf.",
      "Afspraken over aanspreken houden alleen stand wanneer de leidinggevende zich er zichtbaar aan houdt.",
    ],
  },
  {
    id: "spanning",
    titel: "Spanning zorgvuldig onderzoeken",
    advies: "Wanneer er spanning of conflict speelt, is een gezamenlijke dag zelden de eerste stap. Voer eerst afzonderlijke gesprekken, bepaal daarna of en onder welke voorwaarden een gezamenlijke bijeenkomst verantwoord is.",
    voorkeur: ["kb-individuele-reflectie", "ob-spanning-op-tafel", "ob-waarneming-interpretatie", "rb-afspraak-over-aanspreken"],
    aandachtspunten: [
      "Spreek vooraf met iedere betrokkene afzonderlijk. Zonder die gesprekken weet je niet wat je op de dag opent.",
      "Overweeg externe begeleiding. Wie zelf onderdeel is van de spanning, kan het gesprek erover niet neutraal leiden.",
      "Spreek vooraf af wat je doet wanneer het gesprek vastloopt. Doorgaan omdat het programma dat zegt, is dan de verkeerde keuze.",
    ],
    vraagtBegeleiding: true,
  },
  {
    id: "veiligheid",
    titel: "Ruimte maken om je uit te spreken",
    advies: "Wanneer niet iedereen zich vrij voelt, is de opzet van de dag belangrijker dan de inhoud. Werk in kleine stappen, van individueel naar tweetallen naar de groep, zodat niemand meteen plenair het woord hoeft te nemen.",
    voorkeur: ["kb-individuele-reflectie", "ob-1-2-4-alle", "ob-waarneming-interpretatie", "rb-hulp-vragen", "rb-afspraak-over-aanspreken"],
    aandachtspunten: [
      "Let op de rol van de leidinggevende. Aanwezigheid is niet het probleem; onduidelijkheid over wat er met wat gezegd wordt gebeurt, is dat wel.",
      "Werk anoniem waar dat kan. Een kaartje schrijven is een veel kleinere stap dan hardop iets zeggen.",
      "Beloof geen veiligheid. Laat zien hoe je met de eerste kwetsbare inbreng omgaat; dat bepaalt of er een tweede komt.",
    ],
  },
  {
    id: "besluitvorming",
    titel: "Beter overleggen en besluiten",
    advies: "Veel overleg en weinig besluiten is een concreet en oplosbaar vraagstuk. Werk met een echt overleg als casus, niet met theorie over vergaderen.",
    voorkeur: ["rb-overleg-onder-de-loep", "rb-besluitvormingsladder", "rb-bevoegdheden", "ob-deep-democracy-light"],
    aandachtspunten: [
      "De winst zit meestal in het onderscheid tussen informeren, overleggen en besluiten. Dat onderscheid ontbreekt in de meeste agenda's.",
      "Een nieuwe overlegvorm afspreken werkt alleen wanneer iemand zich eigenaar maakt van de agenda.",
    ],
  },
  {
    id: "gezamenlijk-doel",
    titel: "Een gezamenlijke opdracht formuleren",
    advies: "Een teamdag is geschikt om een gezamenlijke opdracht te formuleren, mits duidelijk is welke ruimte het team daarin heeft. Onderzoek dat vooraf bij degene die de opdracht geeft.",
    voorkeur: ["rb-belanghebbenden", "rb-gezamenlijke-opdracht", "rb-wel-en-niet-team", "rb-succescriteria", "rb-betekenis-voor-rollen"],
    aandachtspunten: [
      "Een doel formuleren zonder te bepalen wat er dan níet meer bij hoort, verandert weinig aan de dagelijkse keuzes.",
      "Wanneer de opdracht van bovenaf vastligt, is de vraag niet wat ons doel is, maar hoe wij daar onze bijdrage aan vormgeven. Dat is een ander gesprek.",
    ],
  },
  {
    id: "verandering",
    titel: "Omgaan met een verandering",
    advies: "Een teamdag kan helpen om een verandering te begrijpen en er invloed op te nemen. De verandering zelf verdwijnt er niet mee, en het is eerlijker om dat vooraf te zeggen.",
    voorkeur: ["rb-wat-verandert-wat-blijft", "rb-zorgen-en-verwachtingen", "rb-invloedscirkel", "rb-betekenis-voor-rollen", "ob-wat-nemen-we-mee"],
    aandachtspunten: [
      "Zorg dat je feitelijke informatie hebt over de verandering, inclusief wat nog niet bekend is. Onduidelijkheid vullen deelnemers zelf in, meestal ongunstiger dan de werkelijkheid.",
      "Haal geen zorgen op wanneer je niet van plan bent er iets mee te doen.",
      "Wanneer de verandering banen of posities raakt, hoort daar een apart traject bij en niet alleen een teamdag.",
    ],
  },
  {
    id: "energie",
    titel: "Werkdruk en energie",
    advies: "Een teamdag kan zichtbaar maken waar energie weglekt en één concrete verbetering opleveren. Bij structureel te hoge werkdruk is dat een begin en geen oplossing.",
    voorkeur: ["rb-energie-inventarisatie", "rb-belasting-en-hulpbronnen", "rb-handeling-vereenvoudigen", "rb-hulp-vragen", "rb-wel-en-niet-team"],
    aandachtspunten: [
      "Wanneer de oorzaak buiten het team ligt, kan een dag over energie overkomen als: los het zelf maar op. Benoem dat verschil expliciet.",
      "Één opgeloste ergernis doet meer voor de energie dan een lange lijst voornemens.",
    ],
  },
  {
    id: "eigenaarschap",
    titel: "Meer eigenaarschap",
    advies: "Eigenaarschap groeit zelden door erover te praten. Werk met concrete besluiten, echte ruimte en duidelijke afspraken, dan wordt het vanzelf zichtbaar.",
    voorkeur: ["rb-besluitvormingsladder", "rb-bevoegdheden", "rb-invloedscirkel", "rb-handeling-vereenvoudigen"],
    aandachtspunten: [
      "Onderzoek eerst waar het team wél ruimte heeft. Vaak is er meer mandaat dan gebruikt wordt, en soms minder dan verondersteld.",
      "Eigenaarschap vragen zonder ruimte te geven, levert cynisme op. Wees eerlijk over de grenzen.",
    ],
  },
  {
    id: "kwaliteiten",
    titel: "Kwaliteiten beter benutten",
    advies: "Een teamdag is geschikt om zichtbaar te maken wat er aan kwaliteiten in het team zit. De winst zit in de koppeling aan het werk dat er ligt.",
    voorkeur: ["rb-kwaliteiten-inventarisatie", "ob-kennismaken-samenwerking", "rb-kwaliteiten-inzetten", "rb-takeninventarisatie"],
    aandachtspunten: [
      "Kwaliteiten benoemen zonder er iets mee te doen, wordt ervaren als een prettig maar vrijblijvend moment.",
      "Let op dat een kwaliteit geen verplichting wordt. Wie ergens goed in is, wil het niet altijd doen.",
    ],
  },
  {
    id: "leren",
    titel: "Terugkijken en leren",
    advies: "Terugkijken werkt het best wanneer het over één afgebakende periode of opdracht gaat en wanneer duidelijk is dat het niet over schuld gaat.",
    voorkeur: ["ob-after-action-review", "ob-stoppen-houden-starten", "ob-orid"],
    aandachtspunten: [
      "Bepaal vooraf welke periode je bespreekt. Zonder afbakening wordt het een gesprek over alles.",
      "De eerste keer dat een fout besproken kan worden zonder gevolgen, bepaalt of er een tweede keer komt.",
    ],
  },
  {
    id: "groei",
    titel: "Verder groeien",
    advies: "Een team dat goed draait heeft geen probleem nodig om een dag te verdienen. Kies dan voor waarderend onderzoek en een ambitie die net buiten het gewone ligt.",
    voorkeur: ["ob-waarderend-terugkijken", "rb-toekomstige-uitdaging", "rb-kwaliteiten-inventarisatie", "ob-stoppen-houden-starten"],
    aandachtspunten: [
      "De valkuil van een goed team is een gezellige dag zonder scherpte. Kies één onderwerp waar het team zich ongemakkelijk bij voelt.",
      "Vraag wat er zou gebeuren wanneer de omstandigheden veranderen. Dat houdt het gesprek eerlijk.",
    ],
  },
  {
    id: "verbinding",
    titel: "Verbinding en ontmoeting",
    advies: "Verbinding als doel is legitiem, zeker na een drukke of ingewikkelde periode. Zorg wel dat er iets van het werk in zit, anders wordt de dag als los ervaren.",
    voorkeur: ["ob-kennismaken-samenwerking", "rb-kwaliteiten-inventarisatie", "ob-waarderend-terugkijken", "rb-hulp-vragen"],
    aandachtspunten: [
      "Een dag die alleen uit ontmoeting bestaat, wordt door een deel van het team gewaardeerd en door een ander deel als tijdverlies gezien. Benoem het doel dus expliciet.",
      "Wanneer er onderhuids iets speelt, maakt een dag over verbinding dat zichtbaarder in plaats van kleiner. Onderzoek dat vooraf.",
    ],
  },
];

export const SPOOR_IDS = SPOREN.map((s) => s.id);

export function spoor(id) {
  return SPOREN.find((s) => s.id === id) || null;
}

// Extra blokken die worden voorgesteld op basis van het teamtype, ongeacht het
// gekozen spoor. Ze komen achteraan de voorkeurslijst.
export const TEAMTYPE_EXTRA = {
  samengevoegd: ["ob-wat-nemen-we-mee", "rb-eerste-werkafspraken"],
  nieuw: ["ob-kennismaken-samenwerking", "rb-eerste-werkafspraken"],
  project: ["rb-bevoegdheden", "rb-eerste-werkafspraken"],
  mt: ["rb-besluitvormingsladder", "rb-bevoegdheden"],
  zelfstandigen: ["rb-wel-en-niet-team"],
  multidisciplinair: ["rb-onderlinge-afhankelijkheden"],
  operationeel: [],
  anders: [],
};

// Wanneer teamleden nauwelijks van elkaar afhankelijk zijn, is dit blok bijna
// altijd zinvoller dan een werkvorm gericht op onderlinge binding.
export const LAGE_AFHANKELIJKHEID_BLOK = "rb-wel-en-niet-team";
