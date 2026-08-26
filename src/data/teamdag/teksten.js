// Vaste teksten van de teamdag-generator. Alles wat de gebruiker leest en niet
// zelf invult, staat hier.

export const INTRO = {
  titel: "Bouw een teamdag die meer oplevert dan een leuke dag",
  inleiding:
    "Beantwoord enkele korte vragen over jouw team, de aanleiding en het gewenste resultaat. Je ontvangt een eerste programmaopzet met passende werkvormen, voorbereiding en ideeën voor borging.",
  knop: "Stel mijn teamdag samen",
  duur: "Invullen duurt ongeveer drie minuten.",
  uitleg: [
    "De generator werkt met vaste beslisregels en vooraf geschreven programmaonderdelen. Er komt geen chatbot of taalmodel aan te pas.",
    "De uitkomst is een eerste opzet. Bij een ingewikkelde situatie vervangt dit geen zorgvuldige intake.",
    "Je antwoorden blijven in je eigen browser. Wij slaan niets op.",
  ],
};

export const PRIVACYTEKST = {
  kort: "Je antwoorden blijven in je eigen browser en worden nergens naartoe gestuurd.",
  vrijeTekst:
    "Gebruik geen namen of vertrouwelijke persoonsgegevens. Beschrijf alleen wat nodig is om de teamdag voor te bereiden.",
  lang: [
    "Alles wat je invult blijft in de lokale opslag van je eigen browser. Er gaat niets naar een server van Mijn Teamkompas.",
    "Wij meten alleen of de generator gestart en afgerond wordt. De inhoud van je antwoorden, je toelichting en je programma worden nooit gemeten of verstuurd.",
    "Er wordt geen chatbot, taalmodel of externe AI-dienst gebruikt.",
    "Een deelbare link bevat alleen je gemaakte keuzes uit de vaste antwoordopties. Je eigen toelichting gaat er nooit in mee.",
    "Met de knop onderaan verwijder je alles wat lokaal is opgeslagen. Daarna is er niets meer van je bezoek terug te vinden.",
  ],
};

export const VEILIGHEIDSROUTE = {
  kop: "Een teamdag is misschien niet de eerste stap",
  tekst:
    "Een gezamenlijke teamdag is mogelijk niet de veiligste eerste stap. Begin met een zorgvuldige intake, afzonderlijke gesprekken en passende professionele ondersteuning. Bepaal daarna of en onder welke voorwaarden een gezamenlijke bijeenkomst verantwoord is.",
  toelichting:
    "We stellen op basis van jouw antwoorden niet vast wat er in jouw team aan de hand is, en al helemaal niet of er formeel sprake is van pesten, intimidatie of discriminatie. Dat is niet aan een website. Wat we wel kunnen zeggen: bij de signalen die je aangaf, begint zorgvuldig werk met afzonderlijke gesprekken.",
  intakeStappen: [
    {
      titel: "Voer eerst afzonderlijke gesprekken",
      tekst: "Spreek met iedere betrokkene apart, zonder anderen erbij. Vraag naar wat er gebeurt, wat het met iemand doet en wat diegene nodig heeft. Beloof in dat gesprek niets wat je niet kunt waarmaken.",
    },
    {
      titel: "Bepaal wat er speelt en wie ernaar moet kijken",
      tekst: "Gaat het om een verschil van inzicht, om een conflict tussen twee mensen, of om gedrag dat iemand beschadigt? Die drie vragen om verschillende routes en verschillende mensen.",
    },
    {
      titel: "Betrek de juiste professional",
      tekst: "Afhankelijk van wat er speelt is dat HR, een vertrouwenspersoon, een bedrijfsmaatschappelijk werker, een mediator of een externe begeleider. Bij mogelijk strafbaar gedrag hoort ook de vraag of er aangifte gedaan moet worden.",
    },
    {
      titel: "Bepaal daarna pas of een gezamenlijke bijeenkomst passend is",
      tekst: "En zo ja, onder welke voorwaarden: wie is erbij, wie begeleidt, wat is het doel, en wat gebeurt er wanneer het gesprek vastloopt.",
    },
  ],
  vervolg: [
    { label: "Bereid een afzonderlijk gesprek voor", href: "/gespreksvoorbereider", uitleg: "Een stapsgewijze voorbereiding voor een lastig gesprek, zonder dat je iets deelt met ons." },
    { label: "Plan een vrijblijvend gesprek", href: "/contact", uitleg: "We kijken mee naar wat in deze situatie een verantwoorde eerste stap is." },
    { label: "Lees over sociale veiligheid", href: "/sociale-veiligheid", uitleg: "Achtergrond bij wat sociale veiligheid in een team wel en niet is." },
  ],
  toch: "Ik begrijp dit en wil toch een eerste programmaopzet zien",
  tochToelichting:
    "Je kunt de opzet bekijken als voorbereiding op een gesprek met een professional. Gebruik hem niet als programma voor een dag die je zelf begeleidt zolang deze signalen spelen.",
};

export const ADVIESTEKSTEN = {
  passend: "Op basis van jouw keuzes lijkt een teamdag hier een passende vorm.",
  passendMits: "Een teamdag kan hier passend zijn, mits je vooraf een aantal dingen regelt.",
  twijfel: "Een teamdag kan dit gesprek ondersteunen, maar lost het vraagstuk niet automatisch op. Onderzoek vooraf of er ook een andere route past.",
  kort: "De gekozen tijd is kort. Dat kan prima, maar kies dan één onderwerp en verwacht geen brede opbrengst.",
  lageAfhankelijkheid:
    "Je gaf aan dat teamleden elkaar niet dagelijks nodig hebben. Bouw de dag dan niet op onderlinge binding, maar op de vraag waarvoor jullie elkaar wél nodig hebben. Anders voelt het programma al snel kunstmatig.",
  grootTeam:
    "Bij meer dan twintig deelnemers verandert het karakter van de dag. Plenaire gesprekken werken niet meer; werk in subgroepen en accepteer dat niet iedereen alles hoort.",
  online:
    "Online is de aandachtsspanne korter. Houd blokken van maximaal 45 minuten aan, plan vaker een korte pauze en gebruik werkvormen die in kleine kamers werken.",
  hybride:
    "Hybride is de moeilijkste vorm. Kies er bij voorkeur voor om iedereen online of iedereen op locatie te laten deelnemen. Lukt dat niet, geef de online deelnemers dan een eigen begeleider die hun inbreng bewaakt.",
  wisselend:
    "Bij wisselende aanwezigheid is een programma dat op elkaar voortbouwt kwetsbaar. Maak van ieder onderdeel een afgerond geheel, zodat wie later aanschuift toch mee kan doen.",
  geenOpvolging:
    "Je gaf aan dat er geen structurele opvolging is. Beperk je dan tot één afspraak of één klein experiment. Meer dan dat overleeft de terugkeer naar de dagelijkse drukte niet.",
};

export const VOORBEREIDING_ALGEMEEN = [
  {
    titel: "Wat je vooraf communiceert",
    punten: [
      "Waarom deze dag er is, in gewone taal en niet in beleidstaal.",
      "Wat er wel en niet besloten wordt, en door wie.",
      "Wat er met de opbrengst gebeurt en wanneer het team daar iets van hoort.",
      "Wat er van deelnemers verwacht wordt: voorbereiden, meedenken, of alleen aanwezig zijn.",
    ],
  },
  {
    titel: "Wat deelnemers nodig hebben",
    punten: [
      "Het programma op hoofdlijnen, minstens een week van tevoren.",
      "De gelegenheid om vooraf een onderwerp aan te dragen.",
      "Duidelijkheid over de tijd: begintijd, eindtijd en of er gelunched wordt.",
    ],
  },
];

export const RUIMTE_ADVIES = {
  ja: "Controleer of de stoelen los staan en of er wandruimte is om te plakken. Een vergaderzaal met een vaste tafel in het midden maakt de meeste werkvormen moeilijker.",
  beperkt: "Zonder wanden of flip-overs werk je met tafels: leg de vellen plat neer en laat mensen eromheen staan. Neem plakband mee waarmee je zonder schade aan de muur kunt werken.",
  nee: "Regel de ruimte vroeg. Een ruimte zonder daglicht of met een vaste opstelling beperkt het programma meer dan de meeste organisatoren verwachten.",
};

export const VOORMETING = {
  aanraden:
    "Een korte voormeting helpt: laat het team vooraf de gratis teamscan invullen. Je begint de dag dan met een gedeeld beeld in plaats van met een inventarisatie.",
  href: "/gratis-teamscan",
  label: "Bekijk de gratis teamscan",
};

export const BORGING_VOORSTELLEN = {
  geen: {
    tekst: "Er is geen structurele opvolging. Kies daarom één afspraak, en zet nu meteen een moment in de agenda waarop iemand ernaar vraagt.",
    evaluatie: "Twee weken na de teamdag, als agendapunt van vijf minuten in een bestaand overleg.",
  },
  "een-moment": {
    tekst: "Er is één evaluatiemoment. Gebruik dat om te toetsen of de afspraken zichtbaar zijn geworden, niet om nieuwe plannen te maken.",
    evaluatie: "Vier tot zes weken na de teamdag, dertig minuten.",
  },
  "dertig-dagen": {
    tekst: "Dertig dagen opvolging is genoeg voor één experiment met twee tussenmomenten. Zet die momenten nu in de agenda.",
    evaluatie: "Na twee weken kort, na dertig dagen uitgebreider.",
  },
  maandelijks: {
    tekst: "Met een maandelijks ritme kun je twee onderwerpen volhouden. Zet de afspraken vast op de agenda van het teamoverleg.",
    evaluatie: "Iedere maand een vast agendapunt van vijftien minuten.",
  },
  coach: {
    tekst: "Met begeleiding kun je verder gaan dan één experiment. Spreek af wat de coach doet en wat het team zelf oppakt; anders wordt opvolging het werk van de coach.",
    evaluatie: "Volgens het ritme dat je met de begeleider afspreekt, met een eerste moment binnen een maand.",
  },
  onbekend: {
    tekst: "De opvolging is nog onbekend. Ga uit van weinig: kies één afspraak en één experiment, en regel het evaluatiemoment voordat de dag begint.",
    evaluatie: "Binnen een maand na de teamdag.",
  },
};

export const PULSEMETING = {
  tekst: "Overweeg een korte terugblik na een maand: laat iedereen twee vragen beantwoorden over wat er zichtbaar is veranderd. Dat kost vijf minuten en houdt het onderwerp levend.",
  href: "/gratis-teamscan",
  label: "Gebruik de gratis teamscan als nulmeting",
};

export const CONVERSIE = {
  tekst:
    "Een programma is pas echt passend wanneer het aansluit bij wat er onder de zichtbare vraag speelt. Wil je samen onderzoeken welke aanpak bij jouw team past? Plan dan een vrijblijvend gesprek met Mijn Teamkompas.",
  knoppen: [
    { label: "Plan een vrijblijvend gesprek", href: "/contact", primair: true },
    { label: "Ontdek begeleiding voor jullie teamdag", href: "/teamdag" },
    { label: "Start de Teamscan", href: "/gratis-teamscan" },
  ],
  intake: {
    tekst:
      "Op basis van jouw antwoorden is dit een situatie waarin een intake meer oplevert dan een kant-en-klaar programma. We kijken dan eerst samen wat er speelt en welke vorm daarbij past.",
    knop: { label: "Plan een vrijblijvende intake", href: "/contact", primair: true },
  },
};

export const AANDACHTSPUNTEN_ALGEMEEN = {
  leidinggevendeSpanning:
    "Je gaf aan dat de leidinggevende zelf onderdeel is van de spanning. Overweeg externe begeleiding: wie partij is, kan het gesprek erover moeilijk neutraal leiden.",
  weinigErvaring:
    "Het team heeft weinig ervaring met teamdagen. Kies laagdrempelige werkvormen, leg iedere stap kort uit en verwacht dat het eerste uur voorzichtig verloopt.",
  veelDoelen:
    "Je koos twee doelen. Dat past, maar het betekent dat beide onderwerpen minder diep gaan. Wanneer er één belangrijker is, geef die dan meer tijd.",
  kortEnBreed:
    "De beschikbare tijd is kort voor het gekozen doel. Kies liever één onderwerp dat af komt dan drie die blijven hangen.",
  gebeurtenissen:
    "Je gaf aan dat er recente gebeurtenissen spelen die emoties oproepen. Maak daar aan het begin van de dag kort ruimte voor, ook als het niet het onderwerp is. Zonder die ruimte praat het team er de hele dag omheen.",
  afsprakenVertrouwen:
    "Je gaf aan dat er twijfel is of afspraken worden nagekomen. Begin dan niet met nieuwe afspraken. Kijk eerst wat er met de vorige is gebeurd.",
  ruimteOver:
    "Er blijft bewust tijd over. Dat is geen gat in het programma: uitloop, een gesprek dat langer duurt en een pauze die iets uitloopt hebben die ruimte nodig. Vul hem niet op met een extra werkvorm.",
  geenRuimte:
    "De ruimte is nog niet geregeld. Doe dat vroeg: de indeling van de zaal bepaalt meer van het programma dan de meeste organisatoren verwachten.",
};

export const TAALREGELS_NIET = [
  "dit programma lost jullie probleem op",
  "jouw team is onveilig",
  "deze werkvorm garandeert resultaat",
  "na deze dag is het team weer verbonden",
];
