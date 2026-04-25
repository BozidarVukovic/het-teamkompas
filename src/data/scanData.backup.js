const PIJLERS = [
  { naam: "Veiligheid & Leiderschap", kleur: "#5A8C3C" },
  { naam: "Beleving van Verandering", kleur: "#3A7DBF" },
  { naam: "Energie & Motivatie", kleur: "#E8821A" },
  { naam: "Verbeteren & Leren", kleur: "#6B4E9E" },
];

const DEFAULT_STELLINGEN = [
  { id: 1, pijler: 0, tekst: "Ik voel me veilig om mijn mening te geven binnen het team.", type: "schaal" },
  { id: 2, pijler: 0, tekst: "De leidinggevende geeft ruimte voor eigen inbreng.", type: "schaal" },
  { id: 3, pijler: 0, tekst: "Fouten maken wordt gezien als leerkans.", type: "schaal" },
  { id: 4, pijler: 0, tekst: "Ik vertrouw erop dat collega's mij steunen als het nodig is.", type: "schaal" },
  { id: 5, pijler: 0, tekst: "Wat maakt dat je je wel of niet veilig voelt in dit team?", type: "open" },
  { id: 6, pijler: 1, tekst: "Ik begrijp waarom de huidige verandering nodig is.", type: "schaal" },
  { id: 7, pijler: 1, tekst: "Ik heb voldoende informatie om mee te kunnen bewegen.", type: "schaal" },
  { id: 8, pijler: 1, tekst: "Ik ervaar de verandering als haalbaar.", type: "schaal" },
  { id: 9, pijler: 1, tekst: "Ik word betrokken bij beslissingen die mij raken.", type: "schaal" },
  { id: 10, pijler: 1, tekst: "Wat helpt jou om de verandering te omarmen?", type: "open" },
  { id: 11, pijler: 2, tekst: "Ik heb genoeg energie om mijn werk goed te doen.", type: "schaal" },
  { id: 12, pijler: 2, tekst: "Mijn werk geeft mij voldoening.", type: "schaal" },
  { id: 13, pijler: 2, tekst: "De werkdruk is voor mij beheersbaar.", type: "schaal" },
  { id: 14, pijler: 2, tekst: "Ik heb voldoende herstelmomenten tijdens mijn werkdag.", type: "schaal" },
  { id: 15, pijler: 2, tekst: "Wat geeft jou de meeste energie in je werk?", type: "open" },
  { id: 16, pijler: 3, tekst: "We evalueren regelmatig hoe we samenwerken.", type: "schaal" },
  { id: 17, pijler: 3, tekst: "Er is ruimte om nieuwe werkwijzen uit te proberen.", type: "schaal" },
  { id: 18, pijler: 3, tekst: "Ik leer van mijn collega's.", type: "schaal" },
  { id: 19, pijler: 3, tekst: "Verbeterideeën worden serieus genomen.", type: "schaal" },
  { id: 20, pijler: 3, tekst: "Wat zou het team concreet kunnen verbeteren?", type: "open" },
];

const MEDEWERKERSSCAN_INTRO = "Deze vragenlijst helpt om beter te begrijpen hoe het werken binnen jouw team wordt ervaren. Er zijn geen goede of foute antwoorden. Jouw ervaring staat centraal. De uitkomsten worden gebruikt om samen te bepalen waar verbetering het meeste effect heeft.";

const MANAGEMENTSCAN_INTRO = "Deze vragenlijst helpt inzicht te krijgen in waar de belangrijkste uitdagingen en ontwikkelpunten binnen het team liggen. Er zijn geen goede of foute antwoorden. Het doel is richting bepalen.";

const MEDEWERKERSSCAN_STELLINGEN = [
  { id: 1001, pijler: 4, tekst: "Ik voel me begrepen door mijn collega's.", type: "schaal" },
  { id: 1002, pijler: 4, tekst: "Verschillen in werkstijl en communicatie worden gerespecteerd.", type: "schaal" },
  { id: 1003, pijler: 4, tekst: "Misverstanden worden meestal open en constructief besproken.", type: "schaal" },
  { id: 1004, pijler: 4, tekst: "Ik pas mijn manier van communiceren aan verschillende collega’s aan.", type: "schaal" },
  { id: 1005, pijler: 4, tekst: "Waar ontstaan volgens jou in de samenwerking de meeste misverstanden?", type: "open" },

  { id: 1006, pijler: 0, tekst: "Ik voel me veilig om mijn mening te geven.", type: "schaal" },
  { id: 1007, pijler: 0, tekst: "Ik durf fouten of twijfels te bespreken.", type: "schaal" },
  { id: 1008, pijler: 0, tekst: "Mijn leidinggevende nodigt uit tot openheid en dialoog.", type: "schaal" },
  { id: 1009, pijler: 0, tekst: "Initiatief nemen wordt aangemoedigd.", type: "schaal" },
  { id: 1010, pijler: 0, tekst: "In ons team wordt verschil in stijl en achtergrond gewaardeerd.", type: "schaal" },
  { id: 1011, pijler: 0, tekst: "Wat zou jou helpen om je nog vrijer uit te spreken?", type: "open" },

  { id: 1012, pijler: 1, tekst: "Veranderingen worden duidelijk en begrijpelijk uitgelegd.", type: "schaal" },
  { id: 1013, pijler: 1, tekst: "Het tempo van verandering voelt voor mij passend.", type: "schaal" },
  { id: 1014, pijler: 1, tekst: "Mijn zorgen of gevoelens bij verandering krijgen aandacht.", type: "schaal" },
  { id: 1015, pijler: 1, tekst: "Veranderingen voelen meestal als een verbetering van het bestaande.", type: "schaal" },
  { id: 1016, pijler: 1, tekst: "Wat roept verandering bij jou meestal op?", type: "open" },

  { id: 1017, pijler: 2, tekst: "Mijn werk kost mij niet structureel meer energie dan het oplevert.", type: "schaal" },
  { id: 1018, pijler: 2, tekst: "Ik haal voldoening uit mijn werk.", type: "schaal" },
  { id: 1019, pijler: 2, tekst: "Frustraties in het dagelijks werk worden serieus genomen.", type: "schaal" },
  { id: 1020, pijler: 2, tekst: "Ik ervaar voldoende autonomie en ondersteuning.", type: "schaal" },
  { id: 1021, pijler: 2, tekst: "Wat kost jou op dit moment het meeste energie in je werk?", type: "open" },

  { id: 1022, pijler: 3, tekst: "Verbeterideeën vanuit de werkvloer worden serieus genomen.", type: "schaal" },
  { id: 1023, pijler: 3, tekst: "Ik voel eigenaarschap over verbeteringen in mijn werk.", type: "schaal" },
  { id: 1024, pijler: 3, tekst: "Leren en experimenteren wordt aangemoedigd.", type: "schaal" },
  { id: 1025, pijler: 3, tekst: "Verbeteren voelt als onderdeel van mijn werk, niet als extra taak.", type: "schaal" },
  { id: 1026, pijler: 3, tekst: "Wat zou het verbeteren van je werk makkelijker maken?", type: "open" },

  { id: 1027, pijler: 4, tekst: "Ik voel me betrokken bij veranderingen binnen mijn team.", type: "schaal" },
  { id: 1028, pijler: 4, tekst: "Ik heb vertrouwen dat verbeteringen ook echt worden opgepakt.", type: "schaal" },
  { id: 1029, pijler: 4, tekst: "Wat is volgens jou de belangrijkste eerste stap om het werken binnen jouw team te verbeteren?", type: "open" },
];

const MANAGEMENTSCAN_STELLINGEN = [
  // Samenwerking & communicatie (pijler 4) — spiegel van 1001–1004
  { id: 2001, pijler: 4, tekst: "Medewerkers voelen zich begrepen door elkaar.", type: "schaal" },
  { id: 2002, pijler: 4, tekst: "Verschillen in werkstijl en communicatie worden binnen het team gerespecteerd.", type: "schaal" },
  { id: 2003, pijler: 4, tekst: "Misverstanden worden open en constructief besproken, niet persoonlijk gemaakt.", type: "schaal" },
  { id: 2004, pijler: 4, tekst: "Medewerkers passen hun manier van communiceren aan aan elkaar.", type: "schaal" },
  { id: 2005, pijler: 4, tekst: "Waar ontstaan in de samenwerking binnen het team fricties of misverstanden?", type: "open" },

  // Psychologische veiligheid (pijler 0) — spiegel van 1006–1010
  { id: 2006, pijler: 0, tekst: "Medewerkers voelen zich veilig om hun mening te geven.", type: "schaal" },
  { id: 2007, pijler: 0, tekst: "Medewerkers durven fouten of twijfels te bespreken.", type: "schaal" },
  { id: 2008, pijler: 0, tekst: "Ik nodig medewerkers actief uit tot openheid en dialoog.", type: "schaal" },
  { id: 2009, pijler: 0, tekst: "Initiatief komt vanuit meerdere mensen, niet steeds dezelfde.", type: "schaal" },
  { id: 2010, pijler: 0, tekst: "Verschillen in stijl en achtergrond worden in het team gezien als kracht.", type: "schaal" },
  { id: 2011, pijler: 0, tekst: "Waar zie je dat medewerkers zich (nog) inhouden of voorzichtig zijn?", type: "open" },

  // Beleving van verandering (pijler 1) — spiegel van 1012–1015
  { id: 2012, pijler: 1, tekst: "Ik communiceer veranderingen op een manier die medewerkers als duidelijk en begrijpelijk ervaren.", type: "schaal" },
  { id: 2013, pijler: 1, tekst: "Het tempo van verandering past bij wat het team aankan.", type: "schaal" },
  { id: 2014, pijler: 1, tekst: "Emoties en zorgen rondom verandering krijgen voldoende ruimte.", type: "schaal" },
  { id: 2015, pijler: 1, tekst: "Nieuwe initiatieven voelen voor medewerkers als een verbetering van het bestaande.", type: "schaal" },
  { id: 2016, pijler: 1, tekst: "Wat merk jij aan reacties van medewerkers wanneer er iets verandert?", type: "open" },

  // Energie & motivatie (pijler 2) — spiegel van 1017–1020
  { id: 2017, pijler: 2, tekst: "De balans tussen werkdruk en herstel is binnen het team gezond.", type: "schaal" },
  { id: 2018, pijler: 2, tekst: "Medewerkers halen voldoende energie en voldoening uit hun werk.", type: "schaal" },
  { id: 2019, pijler: 2, tekst: "Structurele frustraties worden actief besproken en aangepakt.", type: "schaal" },
  { id: 2020, pijler: 2, tekst: "Medewerkers ervaren voldoende autonomie en steun in hun werk.", type: "schaal" },
  { id: 2021, pijler: 2, tekst: "Wat kost medewerkers op dit moment structureel de meeste energie?", type: "open" },

  // Verbeteren & leren (pijler 3) — spiegel van 1022–1025
  { id: 2022, pijler: 3, tekst: "Verbeterideeën vanuit de werkvloer worden serieus opgepakt.", type: "schaal" },
  { id: 2023, pijler: 3, tekst: "Medewerkers voelen eigenaarschap over verbeteringen in het werk.", type: "schaal" },
  { id: 2024, pijler: 3, tekst: "Kleine experimenten en leren worden aangemoedigd.", type: "schaal" },
  { id: 2025, pijler: 3, tekst: "Verbeteren wordt door medewerkers ervaren als onderdeel van het werk, niet als extra taak.", type: "schaal" },
  { id: 2026, pijler: 3, tekst: "Wat gebeurt er nu met ideeën of signalen vanuit de werkvloer?", type: "open" },

  // Richting & betrokkenheid (pijler 4) — spiegel van 1027–1028
  { id: 2027, pijler: 4, tekst: "Medewerkers voelen zich betrokken bij veranderingen binnen het team.", type: "schaal" },
  { id: 2028, pijler: 4, tekst: "Ik heb goed zicht op waar de grootste uitdagingen liggen en pak die ook samen met medewerkers op.", type: "schaal" },
  { id: 2029, pijler: 4, tekst: "Wat is volgens jou de belangrijkste eerste stap om het werken binnen jouw team te verbeteren?", type: "open" },
  { id: 2030, pijler: 4, tekst: "Waar zie jij de grootste hefboom om beweging te creëren?", type: "open" },
];

function getScanTemplate(scanType = "algemeen") {
  if (scanType === "medewerkers") {
    return {
      type: "medewerkersscan",
      doelgroep: "Teamlid",
      introductietekst: MEDEWERKERSSCAN_INTRO,
      stellingen: MEDEWERKERSSCAN_STELLINGEN,
    };
  }
  if (scanType === "management") {
    return {
      type: "managementscan",
      doelgroep: "Leidinggevende",
      introductietekst: MANAGEMENTSCAN_INTRO,
      stellingen: MANAGEMENTSCAN_STELLINGEN,
    };
  }
  return {
    type: "basisscan",
    doelgroep: "",
    introductietekst: "",
    stellingen: DEFAULT_STELLINGEN,
  };
}


const VEILIGHEID_LEIDERSCHAP_STELLINGEN = [
  { id: 101, dimensieCode:"D1", dimensie:"Beschikbaar zijn", tekst:"Mijn leidinggevende is fysiek en mentaal aanwezig in gesprekken met mij.", type:"schaal" },
  { id: 102, dimensieCode:"D1", dimensie:"Beschikbaar zijn", tekst:"Ik kan mijn leidinggevende bereiken wanneer ik dat nodig heb.", type:"schaal" },
  { id: 103, dimensieCode:"D1", dimensie:"Beschikbaar zijn", tekst:"Mijn leidinggevende luistert echt naar wat ik zeg, zonder snel af te leiden.", type:"schaal" },

  { id: 104, dimensieCode:"D2", dimensie:"Onvoorwaardelijk aanvaarden", tekst:"Mijn leidinggevende accepteert mij als persoon, ook als ik fouten maak.", type:"schaal" },
  { id: 105, dimensieCode:"D2", dimensie:"Onvoorwaardelijk aanvaarden", tekst:"Ik voel me vrij om mezelf te zijn bij mijn leidinggevende.", type:"schaal" },
  { id: 106, dimensieCode:"D2", dimensie:"Onvoorwaardelijk aanvaarden", tekst:"Mijn leidinggevende maakt onderscheid tussen mijn gedrag en wie ik ben als persoon.", type:"schaal" },

  { id: 107, dimensieCode:"D3", dimensie:"Empathie tonen", tekst:"Mijn leidinggevende begrijpt hoe situaties op mij overkomen, ook al ziet hij of zij het anders.", type:"schaal" },
  { id: 108, dimensieCode:"D3", dimensie:"Empathie tonen", tekst:"Als ik gestrest ben, reageert mijn leidinggevende met begrip.", type:"schaal" },
  { id: 109, dimensieCode:"D3", dimensie:"Empathie tonen", tekst:"Mijn leidinggevende vraagt naar hoe ik mij voel, niet alleen naar wat ik doe.", type:"schaal" },

  { id: 110, dimensieCode:"D4", dimensie:"Vertrouwen hebben in potentieel", tekst:"Mijn leidinggevende gelooft dat ik meer kan dan ik soms zelf denk.", type:"schaal" },
  { id: 111, dimensieCode:"D4", dimensie:"Vertrouwen hebben in potentieel", tekst:"Mijn leidinggevende stimuleert mij om te groeien en nieuwe uitdagingen aan te gaan.", type:"schaal" },
  { id: 112, dimensieCode:"D4", dimensie:"Vertrouwen hebben in potentieel", tekst:"Mijn leidinggevende investeert tijd in mijn persoonlijke en professionele ontwikkeling.", type:"schaal" },

  { id: 113, dimensieCode:"D5", dimensie:"Geruststellen", tekst:"Mijn leidinggevende helpt mij om kalm te blijven in stressvolle situaties.", type:"schaal" },
  { id: 114, dimensieCode:"D5", dimensie:"Geruststellen", tekst:"Ik voel me veilig om zorgen en angsten te delen met mijn leidinggevende.", type:"schaal" },
  { id: 115, dimensieCode:"D5", dimensie:"Geruststellen", tekst:"Mijn leidinggevende reageert rustig en constructief wanneer er iets mis gaat.", type:"schaal" },

  { id: 116, dimensieCode:"D6", dimensie:"Inspireren", tekst:"Mijn leidinggevende geeft mij het gevoel dat ons werk er echt toe doet.", type:"schaal" },
  { id: 117, dimensieCode:"D6", dimensie:"Inspireren", tekst:"Mijn leidinggevende deelt een duidelijke en motiverende visie op de toekomst.", type:"schaal" },
  { id: 118, dimensieCode:"D6", dimensie:"Inspireren", tekst:"Ik word geïnspireerd door de manier waarop mijn leidinggevende leiding geeft.", type:"schaal" },

  { id: 119, dimensieCode:"D7", dimensie:"Leiden door resultaten", tekst:"Mijn leidinggevende stelt duidelijke doelen en verwachtingen.", type:"schaal" },
  { id: 120, dimensieCode:"D7", dimensie:"Leiden door resultaten", tekst:"Mijn leidinggevende geeft constructieve feedback op mijn werk.", type:"schaal" },
  { id: 121, dimensieCode:"D7", dimensie:"Leiden door resultaten", tekst:"Mijn leidinggevende erkent succes en prestaties binnen het team.", type:"schaal" },

  { id: 122, dimensieCode:"D8", dimensie:"Uitdagen", tekst:"Mijn leidinggevende daagt mij uit om buiten mijn comfortzone te treden.", type:"schaal" },
  { id: 123, dimensieCode:"D8", dimensie:"Uitdagen", tekst:"Mijn leidinggevende stelt kritische vragen die mij aan het denken zetten.", type:"schaal" },
  { id: 124, dimensieCode:"D8", dimensie:"Uitdagen", tekst:"Ik word gestimuleerd om nieuwe ideeën en aanpakken uit te proberen, ook al is er een kans op falen.", type:"schaal" },

  { id: 125, dimensieCode:"D9", dimensie:"Veiligheid bieden om te exploreren", tekst:"In ons team is het veilig om fouten te benoemen zonder angst voor negatieve gevolgen.", type:"schaal" },
  { id: 126, dimensieCode:"D9", dimensie:"Veiligheid bieden om te exploreren", tekst:"Ik durf risico's te nemen omdat ik weet dat mijn leidinggevende mij ondersteunt.", type:"schaal" },
  { id: 127, dimensieCode:"D9", dimensie:"Veiligheid bieden om te exploreren", tekst:"Ons team bespreekt open wat beter kan, ook als het gaat om moeilijke onderwerpen.", type:"schaal" },
];

const VEILIGHEID_LEIDERSCHAP_INTERPRETATIE = [
  { min:3, max:6, label:"Aandachtspunt", advies:"Direct inzetten op verbetering. Bespreek met de leidinggevende en stel een concreet ontwikkelplan op." },
  { min:7, max:10, label:"Ontwikkelpunt", advies:"Er is ruimte voor groei. Maak dit onderdeel van coachgesprekken en leiderschapsontwikkeling." },
  { min:11, max:13, label:"Kracht", advies:"Goed functionerend. Borgen en bewust inzetten als voorbeeld voor andere dimensies." },
  { min:14, max:15, label:"Excellentie", advies:"Uitmuntend. Deel kennis en gedrag met andere leidinggevenden als best practice." },
];

const VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN = [
  "Op welke dimensie scoort de leidinggevende het sterkst? Wat maakt dat zo?",
  "Welke dimensie vraagt de meeste aandacht? Wat is daar de impact van op het team?",
  "Wat heeft de leidinggevende nodig om zich op de aandachtspunten te ontwikkelen?",
  "Wat kan het team zelf bijdragen aan een veilige basis?",
  "Wanneer voelt u zich het meest gesteund door uw leidinggevende? Wat doet hij of zij dan?",
];


const VERBETEREN_LEREN_STELLINGEN = [
  // Leidinggevende — Lean
  { id: 201, dimensieCode:"L1", dimensie:"Klantwaarde & doelgerichtheid", doelgroep:"Leidinggevende", tekst:"Ik stel regelmatig de vraag welke activiteiten binnen mijn afdeling werkelijk waarde toevoegen voor de klant.", type:"schaal" },
  { id: 202, dimensieCode:"L1", dimensie:"Klantwaarde & doelgerichtheid", doelgroep:"Leidinggevende", tekst:"Ik help mijn team onderscheid te maken tussen waardevolle activiteiten en verspilling.", type:"schaal" },
  { id: 203, dimensieCode:"L1", dimensie:"Klantwaarde & doelgerichtheid", doelgroep:"Leidinggevende", tekst:"Ik vertaal de behoeften van de klant actief naar concrete prioriteiten voor mijn team.", type:"schaal" },

  { id: 204, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Leidinggevende", tekst:"Ik stimuleer mijn team om voortdurend na te denken over hoe processen eenvoudiger, sneller of beter kunnen.", type:"schaal" },
  { id: 205, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Leidinggevende", tekst:"Ik geef ruimte en tijd voor verbeterinitiatieven, ook als dat op korte termijn extra inspanning vraagt.", type:"schaal" },
  { id: 206, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Leidinggevende", tekst:"Ik geef het goede voorbeeld door zelf actief verbetermogelijkheden te signaleren en te benoemen.", type:"schaal" },

  { id: 207, dimensieCode:"L3", dimensie:"Flow & verspilling elimineren", doelgroep:"Leidinggevende", tekst:"Ik signaleer actief wachttijden, overbodige stappen of duplicatie in het werk van mijn team.", type:"schaal" },
  { id: 208, dimensieCode:"L3", dimensie:"Flow & verspilling elimineren", doelgroep:"Leidinggevende", tekst:"Ik neem maatregelen om knelpunten in het werkproces weg te nemen zodra ik ze zie.", type:"schaal" },
  { id: 209, dimensieCode:"L3", dimensie:"Flow & verspilling elimineren", doelgroep:"Leidinggevende", tekst:"Ik houd rekening met de capaciteit van mijn team om overbelasting te voorkomen.", type:"schaal" },

  { id: 210, dimensieCode:"L4", dimensie:"Respect voor mensen & teamontwikkeling", doelgroep:"Leidinggevende", tekst:"Ik investeer actief in de vakkennis en het probleemoplossend vermogen van mijn teamleden.", type:"schaal" },
  { id: 211, dimensieCode:"L4", dimensie:"Respect voor mensen & teamontwikkeling", doelgroep:"Leidinggevende", tekst:"Ik betrek medewerkers bij het analyseren van problemen in plaats van zelf direct oplossingen aan te dragen.", type:"schaal" },
  { id: 212, dimensieCode:"L4", dimensie:"Respect voor mensen & teamontwikkeling", doelgroep:"Leidinggevende", tekst:"Ik creëer een omgeving waarin medewerkers zich verantwoordelijk voelen voor kwaliteit en resultaat.", type:"schaal" },

  // Leidinggevende — Agile
  { id: 213, dimensieCode:"A1", dimensie:"Iteratief werken & korte feedbackcycli", doelgroep:"Leidinggevende", tekst:"Ik moedig mijn team aan om in korte cycli te werken en regelmatig te evalueren wat werkt.", type:"schaal" },
  { id: 214, dimensieCode:"A1", dimensie:"Iteratief werken & korte feedbackcycli", doelgroep:"Leidinggevende", tekst:"Ik zorg ervoor dat er frequente momenten zijn waarop we voortgang bespreken en bijsturen.", type:"schaal" },
  { id: 215, dimensieCode:"A1", dimensie:"Iteratief werken & korte feedbackcycli", doelgroep:"Leidinggevende", tekst:"Ik help mijn team om grote opdrachten op te splitsen in behapbare, afrondbare stukken.", type:"schaal" },

  { id: 216, dimensieCode:"A2", dimensie:"Aanpassingsvermogen & wendbaarheid", doelgroep:"Leidinggevende", tekst:"Ik reageer constructief als plannen veranderen en help mijn team daarin mee te bewegen.", type:"schaal" },
  { id: 217, dimensieCode:"A2", dimensie:"Aanpassingsvermogen & wendbaarheid", doelgroep:"Leidinggevende", tekst:"Ik stimuleer mijn team om verandering te zien als kans in plaats van als bedreiging.", type:"schaal" },
  { id: 218, dimensieCode:"A2", dimensie:"Aanpassingsvermogen & wendbaarheid", doelgroep:"Leidinggevende", tekst:"Ik durf als leidinggevende bestaande aanpakken los te laten als de situatie daarom vraagt.", type:"schaal" },

  { id: 219, dimensieCode:"A3", dimensie:"Zelforganisatie & gedelegeerde verantwoordelijkheid", doelgroep:"Leidinggevende", tekst:"Ik geef mijn team de ruimte om zelf beslissingen te nemen over de uitvoering van hun werk.", type:"schaal" },
  { id: 220, dimensieCode:"A3", dimensie:"Zelforganisatie & gedelegeerde verantwoordelijkheid", doelgroep:"Leidinggevende", tekst:"Ik stuur op doelen en resultaten, in plaats van op methodes en controle.", type:"schaal" },
  { id: 221, dimensieCode:"A3", dimensie:"Zelforganisatie & gedelegeerde verantwoordelijkheid", doelgroep:"Leidinggevende", tekst:"Ik stimuleer mijn team om problemen zelf op te lossen voordat ze naar mij toekomen.", type:"schaal" },

  { id: 222, dimensieCode:"A4", dimensie:"Transparantie & open samenwerking", doelgroep:"Leidinggevende", tekst:"Ik deel informatie over voortgang, prioriteiten en obstakels open met mijn team.", type:"schaal" },
  { id: 223, dimensieCode:"A4", dimensie:"Transparantie & open samenwerking", doelgroep:"Leidinggevende", tekst:"Ik faciliteer een cultuur waarin teamleden elkaar aanspreken en samenwerken zonder schotten.", type:"schaal" },
  { id: 224, dimensieCode:"A4", dimensie:"Transparantie & open samenwerking", doelgroep:"Leidinggevende", tekst:"Ik maak de werkstroom zichtbaar zodat iedereen weet wat er speelt.", type:"schaal" },

  // Teamspiegel — Lean
  { id: 225, dimensieCode:"L1", dimensie:"Klantfocus & waardebewustzijn", doelgroep:"Teamlid", tekst:"Als team weten wij voor wie we ons werk doen en wat onze klant of opdrachtgever werkelijk waardeert.", type:"schaal" },
  { id: 226, dimensieCode:"L1", dimensie:"Klantfocus & waardebewustzijn", doelgroep:"Teamlid", tekst:"Wij stellen ons regelmatig de vraag of onze activiteiten daadwerkelijk bijdragen aan het eindresultaat.", type:"schaal" },
  { id: 227, dimensieCode:"L1", dimensie:"Klantfocus & waardebewustzijn", doelgroep:"Teamlid", tekst:"Wij zijn ons bewust van handelingen in ons werk die geen waarde toevoegen en proberen die te verminderen.", type:"schaal" },

  { id: 228, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Teamlid", tekst:"Als team bespreken wij regelmatig wat beter kan in onze werkwijze.", type:"schaal" },
  { id: 229, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Teamlid", tekst:"Wij voeren daadwerkelijk verbeteringen door en evalueren of ze het gewenste effect hebben.", type:"schaal" },
  { id: 230, dimensieCode:"L2", dimensie:"Continu verbeteren", doelgroep:"Teamlid", tekst:"Wij leren van fouten en gebruiken die als input voor verbetering, zonder dat er een schuldige wordt aangewezen.", type:"schaal" },

  { id: 231, dimensieCode:"L3", dimensie:"Procesbeheersing & kwaliteitsbewustzijn", doelgroep:"Teamlid", tekst:"Wij leveren ons werk op het afgesproken kwaliteitsniveau zonder dat daar constant controle voor nodig is.", type:"schaal" },
  { id: 232, dimensieCode:"L3", dimensie:"Procesbeheersing & kwaliteitsbewustzijn", doelgroep:"Teamlid", tekst:"Als er iets fout gaat, lossen wij dat zo dicht mogelijk bij de bron op.", type:"schaal" },
  { id: 233, dimensieCode:"L3", dimensie:"Procesbeheersing & kwaliteitsbewustzijn", doelgroep:"Teamlid", tekst:"Wij signaleren knelpunten of verstoringen in ons werkproces en brengen die actief onder de aandacht.", type:"schaal" },

  { id: 234, dimensieCode:"L4", dimensie:"Eigenaarschap & betrokkenheid", doelgroep:"Teamlid", tekst:"Wij voelen ons als team gezamenlijk verantwoordelijk voor het resultaat.", type:"schaal" },
  { id: 235, dimensieCode:"L4", dimensie:"Eigenaarschap & betrokkenheid", doelgroep:"Teamlid", tekst:"Teamleden nemen initiatief om problemen op te lossen zonder daarvoor altijd goedkeuring af te wachten.", type:"schaal" },
  { id: 236, dimensieCode:"L4", dimensie:"Eigenaarschap & betrokkenheid", doelgroep:"Teamlid", tekst:"Wij spreken elkaar aan op gedrag en afspraken op een respectvolle en constructieve manier.", type:"schaal" },

  // Teamspiegel — Agile
  { id: 237, dimensieCode:"A1", dimensie:"Iteratief & resultaatgericht werken", doelgroep:"Teamlid", tekst:"Wij werken in herkenbare cycli en evalueren aan het einde wat we bereikt hebben en wat we kunnen verbeteren.", type:"schaal" },
  { id: 238, dimensieCode:"A1", dimensie:"Iteratief & resultaatgericht werken", doelgroep:"Teamlid", tekst:"Wij stellen prioriteiten op basis van waarde en passen onze focus aan als omstandigheden veranderen.", type:"schaal" },
  { id: 239, dimensieCode:"A1", dimensie:"Iteratief & resultaatgericht werken", doelgroep:"Teamlid", tekst:"Wij leveren regelmatig aantoonbare resultaten op in plaats van lang door te werken zonder tussentijdse output.", type:"schaal" },

  { id: 240, dimensieCode:"A2", dimensie:"Flexibiliteit & omgaan met verandering", doelgroep:"Teamlid", tekst:"Als prioriteiten of plannen veranderen, passen wij ons als team snel aan zonder dat dit tot grote frustratie leidt.", type:"schaal" },
  { id: 241, dimensieCode:"A2", dimensie:"Flexibiliteit & omgaan met verandering", doelgroep:"Teamlid", tekst:"Wij zien onverwachte situaties als kans om te leren en te improviseren.", type:"schaal" },
  { id: 242, dimensieCode:"A2", dimensie:"Flexibiliteit & omgaan met verandering", doelgroep:"Teamlid", tekst:"Wij zijn bereid bestaande gewoontes of werkwijzen los te laten als iets beters beschikbaar is.", type:"schaal" },

  { id: 243, dimensieCode:"A3", dimensie:"Samenwerking & gezamenlijk eigenaarschap", doelgroep:"Teamlid", tekst:"Wij werken nauw samen en helpen elkaar actief, ook als iets buiten iemands directe taakomschrijving valt.", type:"schaal" },
  { id: 244, dimensieCode:"A3", dimensie:"Samenwerking & gezamenlijk eigenaarschap", doelgroep:"Teamlid", tekst:"Beslissingen over de uitvoering van ons werk nemen wij zoveel mogelijk zelf als team.", type:"schaal" },
  { id: 245, dimensieCode:"A3", dimensie:"Samenwerking & gezamenlijk eigenaarschap", doelgroep:"Teamlid", tekst:"Wij hebben een gedeeld begrip van onze doelen en werken daar als een eenheid naartoe.", type:"schaal" },

  { id: 246, dimensieCode:"A4", dimensie:"Reflectie & lerend vermogen", doelgroep:"Teamlid", tekst:"Wij nemen regelmatig de tijd om als team te reflecteren op onze samenwerking en werkwijze.", type:"schaal" },
  { id: 247, dimensieCode:"A4", dimensie:"Reflectie & lerend vermogen", doelgroep:"Teamlid", tekst:"Wij durven kwetsbaar te zijn over wat niet goed gaat en spreken dat openlijk uit.", type:"schaal" },
  { id: 248, dimensieCode:"A4", dimensie:"Reflectie & lerend vermogen", doelgroep:"Teamlid", tekst:"Verbeterpunten uit onze reflecties worden ook daadwerkelijk omgezet in aanpassingen.", type:"schaal" },
];

const VERBETEREN_LEREN_INTERPRETATIE = [
  { min:3, max:6, label:"Beginner", advies:"Dit principe is nog nauwelijks aanwezig. Bewustwording is de eerste stap: bespreek wat het principe inhoudt en waarom het relevant is." },
  { min:7, max:9, label:"Lerend", advies:"Er is een begin gemaakt maar de toepassing is nog onsystematisch. Kies een concrete gewoonte of praktijk om verder te ontwikkelen." },
  { min:10, max:12, label:"Ontwikkelend", advies:"Dit principe is herkenbaar aanwezig maar nog niet volledig ingebed. Zoek naar mogelijkheden om het verder te borgen in de dagelijkse routines." },
  { min:13, max:15, label:"Volwassen", advies:"Dit principe is structureel verankerd in de werkwijze. Gebruik dit als kracht en deel de aanpak met andere afdelingen of teams." },
];

const VERBETEREN_LEREN_REFLECTIEVRAGEN = [
  "Op welke Lean- of Agile-dimensie scoort de afdeling het sterkst? Wat doen we concreet waardoor dit werkt?",
  "Welke dimensie heeft de meeste aandacht nodig? Wat is het effect op het team als we hier niets aan doen?",
  "Waar zit het grootste verschil tussen de zelfscore van de leidinggevende en de teamscore? Wat verklaart dat verschil?",
  "Welke kleine, concrete gewoonte kunnen we morgen al invoeren om een stap verder te komen?",
  "Welke Lean-principes en Agile-principes versterken elkaar in onze afdeling? Hoe benutten we dat?",
  "Wat hebben wij als team nodig van de leidinggevende om verder te groeien in Lean-Agile werken?",
];


const ENERGIE_MOTIVATIE_STELLINGEN = [
  // Deel A — taakeisen
  { id: 301, dimensieCode:"A1", dimensie:"Kwantitatieve werkdruk", deel:"Taakeisen", tekst:"Ik heb meer werk dan ik binnen de beschikbare tijd kan afkrijgen.", type:"schaal" },
  { id: 302, dimensieCode:"A1", dimensie:"Kwantitatieve werkdruk", deel:"Taakeisen", tekst:"Ik moet mijn werk haastig uitvoeren om alles op tijd af te ronden.", type:"schaal" },
  { id: 303, dimensieCode:"A1", dimensie:"Kwantitatieve werkdruk", deel:"Taakeisen", tekst:"Ik ervaar de hoeveelheid werk die van mij wordt verwacht als te hoog.", type:"schaal" },

  { id: 304, dimensieCode:"A2", dimensie:"Emotionele belasting", deel:"Taakeisen", tekst:"Mijn werk vraagt veel van mij op emotioneel vlak.", type:"schaal" },
  { id: 305, dimensieCode:"A2", dimensie:"Emotionele belasting", deel:"Taakeisen", tekst:"Ik kom in situaties die mij emotioneel raken of uitputten.", type:"schaal" },
  { id: 306, dimensieCode:"A2", dimensie:"Emotionele belasting", deel:"Taakeisen", tekst:"Ik moet in mijn werk regelmatig omgaan met moeilijke of belastende situaties van anderen.", type:"schaal" },

  { id: 307, dimensieCode:"A3", dimensie:"Cognitieve complexiteit & mentale belasting", deel:"Taakeisen", tekst:"Mijn werk vereist een hoge mate van concentratie en mentale inspanning.", type:"schaal" },
  { id: 308, dimensieCode:"A3", dimensie:"Cognitieve complexiteit & mentale belasting", deel:"Taakeisen", tekst:"Ik word in mijn werk geconfronteerd met ingewikkelde problemen waarvoor geen eenvoudige oplossing is.", type:"schaal" },
  { id: 309, dimensieCode:"A3", dimensie:"Cognitieve complexiteit & mentale belasting", deel:"Taakeisen", tekst:"Ik moet veel informatie tegelijk verwerken en in samenhang beoordelen.", type:"schaal" },

  { id: 310, dimensieCode:"A4", dimensie:"Rolonduidelijkheid & conflicterende eisen", deel:"Taakeisen", tekst:"Het is mij niet altijd duidelijk wat er precies van mij wordt verwacht in mijn werk.", type:"schaal" },
  { id: 311, dimensieCode:"A4", dimensie:"Rolonduidelijkheid & conflicterende eisen", deel:"Taakeisen", tekst:"Ik ontvang tegenstrijdige opdrachten of verwachtingen vanuit verschillende kanten.", type:"schaal" },
  { id: 312, dimensieCode:"A4", dimensie:"Rolonduidelijkheid & conflicterende eisen", deel:"Taakeisen", tekst:"Ik weet niet goed welke prioriteiten ik moet stellen in mijn dagelijks werk.", type:"schaal" },

  { id: 313, dimensieCode:"A5", dimensie:"Werk-privéconflict", deel:"Taakeisen", tekst:"Mijn werk maakt het moeilijk om voldoende tijd en energie te hebben voor mijn privéleven.", type:"schaal" },
  { id: 314, dimensieCode:"A5", dimensie:"Werk-privéconflict", deel:"Taakeisen", tekst:"Ik neem zorgen of gedachten over mijn werk mee naar huis.", type:"schaal" },
  { id: 315, dimensieCode:"A5", dimensie:"Werk-privéconflict", deel:"Taakeisen", tekst:"Door mijn werk lukt het mij niet altijd om te ontspannen buiten werktijd.", type:"schaal" },

  // Deel B — hulpbronnen
  { id: 316, dimensieCode:"B1", dimensie:"Autonomie & regelmogelijkheden", deel:"Hulpbronnen", tekst:"Ik kan mijn werk grotendeels op mijn eigen manier inrichten.", type:"schaal" },
  { id: 317, dimensieCode:"B1", dimensie:"Autonomie & regelmogelijkheden", deel:"Hulpbronnen", tekst:"Ik heb invloed op de planning en volgorde van mijn werkzaamheden.", type:"schaal" },
  { id: 318, dimensieCode:"B1", dimensie:"Autonomie & regelmogelijkheden", deel:"Hulpbronnen", tekst:"Ik kan zelf beslissingen nemen over hoe ik mijn taken uitvoer.", type:"schaal" },

  { id: 319, dimensieCode:"B2", dimensie:"Sociale steun van collega's", deel:"Hulpbronnen", tekst:"Mijn collega's staan voor mij klaar als ik hulp nodig heb.", type:"schaal" },
  { id: 320, dimensieCode:"B2", dimensie:"Sociale steun van collega's", deel:"Hulpbronnen", tekst:"Ik ervaar een prettige samenwerking met mijn directe collega's.", type:"schaal" },
  { id: 321, dimensieCode:"B2", dimensie:"Sociale steun van collega's", deel:"Hulpbronnen", tekst:"Ik kan bij mijn collega's terecht als ik ergens mee zit, ook als het niet puur over werk gaat.", type:"schaal" },

  { id: 322, dimensieCode:"B3", dimensie:"Steun en coaching van de leidinggevende", deel:"Hulpbronnen", tekst:"Mijn leidinggevende ondersteunt mij actief in mijn werk en ontwikkeling.", type:"schaal" },
  { id: 323, dimensieCode:"B3", dimensie:"Steun en coaching van de leidinggevende", deel:"Hulpbronnen", tekst:"Mijn leidinggevende geeft mij bruikbare feedback op mijn functioneren.", type:"schaal" },
  { id: 324, dimensieCode:"B3", dimensie:"Steun en coaching van de leidinggevende", deel:"Hulpbronnen", tekst:"Ik voel mij gesteund door mijn leidinggevende als ik voor uitdagende situaties sta.", type:"schaal" },

  { id: 325, dimensieCode:"B4", dimensie:"Groeimogelijkheden & ontwikkeling", deel:"Hulpbronnen", tekst:"Mijn werk biedt mij voldoende mogelijkheden om nieuwe dingen te leren.", type:"schaal" },
  { id: 326, dimensieCode:"B4", dimensie:"Groeimogelijkheden & ontwikkeling", deel:"Hulpbronnen", tekst:"Ik krijg de kans om mij professioneel te ontwikkelen binnen mijn functie.", type:"schaal" },
  { id: 327, dimensieCode:"B4", dimensie:"Groeimogelijkheden & ontwikkeling", deel:"Hulpbronnen", tekst:"Er is binnen de organisatie ruimte voor mijn persoonlijke groei en loopbaanontwikkeling.", type:"schaal" },

  { id: 328, dimensieCode:"B5", dimensie:"Zingeving & betekenis van het werk", deel:"Hulpbronnen", tekst:"Ik begrijp hoe mijn werk bijdraagt aan het grotere geheel van de organisatie.", type:"schaal" },
  { id: 329, dimensieCode:"B5", dimensie:"Zingeving & betekenis van het werk", deel:"Hulpbronnen", tekst:"Mijn werk voelt zinvol en waardevol aan.", type:"schaal" },
  { id: 330, dimensieCode:"B5", dimensie:"Zingeving & betekenis van het werk", deel:"Hulpbronnen", tekst:"Ik haal voldoening uit de resultaten die ik boek in mijn werk.", type:"schaal" },

  // Deel C — uitkomstmaten
  { id: 331, dimensieCode:"C1", dimensie:"Bevlogenheid", deel:"Uitkomstmaten", tekst:"Ik ga met energie en enthousiasme aan het werk.", type:"schaal" },
  { id: 332, dimensieCode:"C1", dimensie:"Bevlogenheid", deel:"Uitkomstmaten", tekst:"Als ik werk, verlies ik de tijd uit het oog, ik ben er volledig in opgegaan.", type:"schaal" },
  { id: 333, dimensieCode:"C1", dimensie:"Bevlogenheid", deel:"Uitkomstmaten", tekst:"Mijn werk inspireert mij en geeft mij een gevoel van trots.", type:"schaal" },

  { id: 334, dimensieCode:"C2", dimensie:"Uitputting", deel:"Uitkomstmaten", tekst:"Aan het einde van een werkdag voel ik mij leeg en uitgeput.", type:"schaal" },
  { id: 335, dimensieCode:"C2", dimensie:"Uitputting", deel:"Uitkomstmaten", tekst:"Ik voel mij emotioneel uitgeput door mijn werk.", type:"schaal" },
  { id: 336, dimensieCode:"C2", dimensie:"Uitputting", deel:"Uitkomstmaten", tekst:"Ik heb moeite om aan het begin van een nieuwe werkdag energie op te brengen.", type:"schaal" },
];

const ENERGIE_MOTIVATIE_REFLECTIEVRAGEN = [
  "Welke taakeis wordt het zwaarst ervaren? Wat maakt die eis zo belastend in de dagelijkse praktijk?",
  "Welke hulpbron is op dit moment het meest waardevol voor het team? Hoe kunnen we die verder versterken?",
  "Zijn er hulpbronnen die nu onvoldoende aanwezig zijn maar die een groot verschil zouden maken?",
  "In hoeverre is de huidige balans tussen taakeisen en hulpbronnen houdbaar op de langere termijn?",
  "Wat kan de leidinggevende concreet doen om de balans te verbeteren? Wat kan het team zelf doen?",
  "Zijn er medewerkers bij wie de signalen van uitputting al zichtbaar zijn? Welke stap wordt als eerste gezet?",
];


const BELEVING_VERANDERING_STELLINGEN = [
  { id: 401, dimensieCode:"D1", dimensie:"Veiligheid & Vertrouwen", tekst:"Mijn leidinggevende creëert een omgeving waarin ik me veilig voel om mijn mening te geven.", type:"schaal" },
  { id: 402, dimensieCode:"D1", dimensie:"Veiligheid & Vertrouwen", tekst:"Ik ervaar geen angst voor negatieve consequenties wanneer ik fouten toegeef bij mijn leidinggevende.", type:"schaal" },
  { id: 403, dimensieCode:"D1", dimensie:"Veiligheid & Vertrouwen", tekst:"Mijn leidinggevende reageert voorspelbaar en consistent, zodat ik weet wat ik kan verwachten.", type:"schaal" },

  { id: 404, dimensieCode:"D2", dimensie:"Autonomie & Controle", tekst:"Mijn leidinggevende geeft mij voldoende ruimte om mijn werk op mijn eigen manier in te richten.", type:"schaal" },
  { id: 405, dimensieCode:"D2", dimensie:"Autonomie & Controle", tekst:"Ik word betrokken bij beslissingen die mijn werk direct raken.", type:"schaal" },
  { id: 406, dimensieCode:"D2", dimensie:"Autonomie & Controle", tekst:"Mijn leidinggevende vertrouwt erop dat ik mijn taken zelfstandig kan uitvoeren.", type:"schaal" },

  { id: 407, dimensieCode:"D3", dimensie:"Sociale Verbinding", tekst:"Mijn leidinggevende zorgt voor een gevoel van saamhorigheid en verbondenheid binnen het team.", type:"schaal" },
  { id: 408, dimensieCode:"D3", dimensie:"Sociale Verbinding", tekst:"Ik voel me als persoon gezien en gewaardeerd door mijn leidinggevende, niet alleen als werknemer.", type:"schaal" },
  { id: 409, dimensieCode:"D3", dimensie:"Sociale Verbinding", tekst:"Mijn leidinggevende moedigt samenwerking en onderling contact actief aan.", type:"schaal" },

  { id: 410, dimensieCode:"D4", dimensie:"Eerlijkheid & Rechtvaardigheid", tekst:"Mijn leidinggevende behandelt alle teamleden eerlijk en consequent.", type:"schaal" },
  { id: 411, dimensieCode:"D4", dimensie:"Eerlijkheid & Rechtvaardigheid", tekst:"Besluiten worden op een transparante manier genomen en toegelicht.", type:"schaal" },
  { id: 412, dimensieCode:"D4", dimensie:"Eerlijkheid & Rechtvaardigheid", tekst:"Als er iets misgaat, zoekt mijn leidinggevende naar een eerlijke oplossing in plaats van een schuldige.", type:"schaal" },

  { id: 413, dimensieCode:"D5", dimensie:"Erkenning & Status", tekst:"Mijn leidinggevende erkent mijn bijdragen en prestaties openlijk.", type:"schaal" },
  { id: 414, dimensieCode:"D5", dimensie:"Erkenning & Status", tekst:"Ik voel dat mijn expertise en inbreng serieus worden genomen.", type:"schaal" },
  { id: 415, dimensieCode:"D5", dimensie:"Erkenning & Status", tekst:"Mijn leidinggevende geeft feedback op een manier die mijn gevoel van competentie vergroot.", type:"schaal" },

  { id: 416, dimensieCode:"D6", dimensie:"Stressregulatie & Herstel", tekst:"Mijn leidinggevende houdt actief rekening met de werkdruk en belastbaarheid van teamleden.", type:"schaal" },
  { id: 417, dimensieCode:"D6", dimensie:"Stressregulatie & Herstel", tekst:"Er is binnen ons team ruimte voor herstel en ontspanning, ook in drukke periodes.", type:"schaal" },
  { id: 418, dimensieCode:"D6", dimensie:"Stressregulatie & Herstel", tekst:"Mijn leidinggevende signaleert tijdig wanneer iemand onder te grote druk staat en grijpt dan in.", type:"schaal" },

  { id: 419, dimensieCode:"D7", dimensie:"Zingeving & Motivatie", tekst:"Mijn leidinggevende verbindt ons dagelijks werk aan een groter doel of een bredere betekenis.", type:"schaal" },
  { id: 420, dimensieCode:"D7", dimensie:"Zingeving & Motivatie", tekst:"Ik begrijp waarom mijn werk ertoe doet voor het team en de organisatie.", type:"schaal" },
  { id: 421, dimensieCode:"D7", dimensie:"Zingeving & Motivatie", tekst:"Mijn leidinggevende stimuleert mij om werk te doen dat aansluit bij mijn persoonlijke drijfveren.", type:"schaal" },

  { id: 422, dimensieCode:"D8", dimensie:"Leren, Groei & Neuroplasticiteit", tekst:"Mijn leidinggevende moedigt mij aan om te experimenteren, ook als dat betekent dat ik soms misluk.", type:"schaal" },
  { id: 423, dimensieCode:"D8", dimensie:"Leren, Groei & Neuroplasticiteit", tekst:"Er is binnen het team ruimte om te leren van fouten zonder dat dit negatieve gevolgen heeft.", type:"schaal" },
  { id: 424, dimensieCode:"D8", dimensie:"Leren, Groei & Neuroplasticiteit", tekst:"Mijn leidinggevende investeert actief in mijn ontwikkeling en groei.", type:"schaal" },
];

const BELEVING_VERANDERING_REFLECTIEVRAGEN = [
  "Op welke dimensie ervaart het team de meeste veiligheid en activatie? Wat doet de leidinggevende concreet om dat te bereiken?",
  "Welke dimensie vraagt de meeste aandacht? Wat is het effect hiervan op het dagelijks functioneren van het team?",
  "Zijn er situaties waarin de dreigingsrespons van medewerkers getriggerd wordt? Hoe herkent u dat als leidinggevende?",
  "Wat zou er veranderen in het team als de leidinggevende op de laagst scorende dimensie een concrete stap zou zetten?",
  "Welke gewoonte of aanpak van de leidinggevende draagt het meest bij aan een breinvriendelijke werkomgeving?",
];


const VERDIEPING_BLOKKEN = {
  veiligheid_leiderschap: {
    key: "veiligheid_leiderschap",
    titel: "Veiligheid en leiderschap",
    type: "verdieping_veiligheid_leiderschap",
    stellingen: VEILIGHEID_LEIDERSCHAP_STELLINGEN,
  },
  verbeteren_leren: {
    key: "verbeteren_leren",
    titel: "Verbeteren en leren",
    type: "verdieping_verbeteren_leren",
    stellingen: VERBETEREN_LEREN_STELLINGEN,
  },
  energie_motivatie: {
    key: "energie_motivatie",
    titel: "Energie en motivatie",
    type: "verdieping_energie_motivatie",
    stellingen: ENERGIE_MOTIVATIE_STELLINGEN,
  },
  beleving_verandering: {
    key: "beleving_verandering",
    titel: "Beleving van verandering",
    type: "verdieping_beleving_verandering",
    stellingen: BELEVING_VERANDERING_STELLINGEN,
  },
};