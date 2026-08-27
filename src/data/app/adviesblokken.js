// De vooraf geschreven adviesteksten.
//
// Twee soorten blokken:
//
// - `BEHOEFTEN` beschrijven wat één persoon nodig heeft. Bruikbaar zodra die
//   persoon het kenmerk heeft gedeeld, ook als jij het jouwe niet kent.
// - `CONTRASTEN` beschrijven wat er tussen twee mensen kan wringen. Die komen
//   pas in beeld wanneer van allebei iets bekend is.
//
// Alle teksten zijn voorzichtig geformuleerd. Ze beschrijven gedrag en
// voorkeuren, nooit persoonlijkheid, en ze eindigen nooit met een oordeel.

/** Wat iemand met deze voorkeur doorgaans nodig heeft. */
export const BEHOEFTEN = {
  tempo: {
    bedachtzaam: {
      duiding: "Je collega heeft aangegeven bij belangrijke besluiten eerst tijd te willen om na te denken.",
      suggestie: "Deel het onderwerp kort vooraf en vraag niet meteen om een definitief antwoord.",
      voorbeeldzin: "Ik wil hier graag met je over nadenken. Zullen we het morgen bespreken, dan heb je even tijd om erover na te denken?",
    },
    snel: {
      duiding: "Je collega werkt graag vlot naar een besluit toe.",
      suggestie: "Kom met een voorstel in plaats van een open vraag, en zeg erbij wat je van hem of haar nodig hebt.",
      voorbeeldzin: "Mijn voorstel is dit. Kun jij zeggen of je daarin meegaat, of wat er dan nog moet gebeuren?",
    },
  },
  context: {
    veel: {
      duiding: "Je collega heeft aangegeven eerst het grotere geheel te willen begrijpen.",
      suggestie: "Begin bij het waarom en de samenhang, en ga daarna pas naar wat je concreet vraagt.",
      voorbeeldzin: "Ik schets eerst even waar dit vandaan komt, dan snap je beter waarom ik het vraag.",
    },
    detail: {
      duiding: "Je collega begint liever bij de concrete details dan bij het grote geheel.",
      suggestie: "Maak meteen duidelijk wat er praktisch verandert, en houd de achtergrond kort.",
      voorbeeldzin: "Concreet betekent dit voor jouw werk het volgende. Als je meer achtergrond wilt, vertel ik dat er graag bij.",
    },
    kort: {
      duiding: "Je collega heeft aangegeven aan een korte aanleiding meestal genoeg te hebben.",
      suggestie: "Houd de inleiding kort en kom snel bij je vraag.",
      voorbeeldzin: "In het kort: dit speelt er, en dit wil ik je vragen.",
    },
  },
  structuur: {
    structuur: {
      duiding: "Je collega werkt het prettigst met duidelijke afspraken.",
      suggestie: "Sluit af met wie wat doet en wanneer, ook als het gesprek informeel was.",
      voorbeeldzin: "Zullen we even vastleggen wie wat oppakt, zodat we er allebei van uit kunnen gaan?",
    },
    ruimte: {
      duiding: "Je collega bepaalt graag onderweg hoe iets het beste kan.",
      suggestie: "Spreek het doel af en laat de invulling open, in plaats van de aanpak voor te schrijven.",
      voorbeeldzin: "Dit is wat er moet gebeuren. Hoe je het aanpakt, laat ik aan jou.",
    },
  },
  denken: {
    alleen: {
      duiding: "Je collega denkt eerst voor zichzelf na en komt daarna met een reactie.",
      suggestie: "Stel je vraag en laat een stilte vallen, of geef hem of haar bedenktijd tot een volgend moment.",
      voorbeeldzin: "Denk er gerust even over. Ik hoor het graag als je zover bent.",
    },
    hardop: {
      duiding: "Je collega denkt het beste hardop, in gesprek.",
      suggestie: "Ga het gesprek in zonder afgerond voorstel; laat ruimte om samen te denken.",
      voorbeeldzin: "Ik heb het nog niet helemaal scherp. Zullen we er samen even doorheen lopen?",
    },
  },
  contact: {
    relatie: {
      duiding: "Voor je collega hoort even bijpraten bij goed samenwerken.",
      suggestie: "Begin niet meteen bij het onderwerp; neem een minuut voor hoe het gaat.",
      voorbeeldzin: "Voordat we de inhoud in duiken: hoe gaat het eigenlijk met je?",
    },
    taak: {
      duiding: "Je collega begint een overleg het liefst meteen bij de inhoud.",
      suggestie: "Kom snel ter zake. Dat is geen afstandelijkheid, dat is hoe het prettig werkt.",
      voorbeeldzin: "Ik val meteen met de deur in huis: dit wil ik met je bespreken.",
    },
  },
  feedback: {
    direct: {
      duiding: "Je collega hoort feedback het liefst direct en zonder omhaal.",
      suggestie: "Zeg waar het over gaat in de eerste zin. Omtrekkende bewegingen maken het onrustiger, niet zachter.",
      voorbeeldzin: "Ik wil iets met je bespreken over het overleg van dinsdag.",
    },
    voorbeeld: {
      duiding: "Bij je collega landt feedback het best met een concreet voorbeeld erbij.",
      suggestie: "Kies één situatie en beschrijf wat je zag, niet wat je ervan vond.",
      voorbeeldzin: "Dinsdag in het overleg gebeurde er iets waar ik het met je over wil hebben.",
    },
    rustig: {
      duiding: "Je collega hoort feedback het liefst rustig en onder vier ogen.",
      suggestie: "Kies een moment zonder anderen erbij en zonder tijdsdruk.",
      voorbeeldzin: "Heb je straks een half uur? Ik wil iets met je bespreken, niets ernstigs.",
    },
  },
  spanning: {
    stiller: {
      duiding: "Je collega heeft aangegeven stiller te worden wanneer de spanning oploopt.",
      suggestie: "Vat samen wat je hebt gehoord en vraag expliciet wat hij of zij denkt. Stilte is hier geen instemming.",
      voorbeeldzin: "Ik merk dat je stil bent geworden. Wat gaat er door je heen?",
    },
    sneller: {
      duiding: "Je collega heeft aangegeven directer te worden wanneer de spanning oploopt.",
      suggestie: "Lees dat niet als boosheid. Vertraag zelf en benoem wat je ziet gebeuren.",
      voorbeeldzin: "Ik merk dat het gesprek versnelt. Zullen we even een stap terug doen?",
    },
    terugtrekken: {
      duiding: "Je collega heeft aangegeven bij spanning even ruimte nodig te hebben.",
      suggestie: "Bied een pauze aan in plaats van door te praten, en maak meteen een afspraak wanneer je verdergaat.",
      voorbeeldzin: "Zullen we hier even mee stoppen en er morgen op terugkomen?",
    },
    uitleg: {
      duiding: "Je collega heeft aangegeven bij spanning meer te gaan uitleggen dan nodig is.",
      suggestie: "Laat merken dat je het begrepen hebt; dan hoeft de uitleg niet door te gaan.",
      voorbeeldzin: "Ik denk dat ik snap wat je bedoelt. Klopt het dat het je vooral hierom gaat?",
    },
  },
  besluitvorming: {
    meepraten: {
      duiding: "Je collega staat achter een besluit wanneer hij of zij erover heeft kunnen meepraten.",
      suggestie: "Betrek hem of haar voordat het besluit vastligt, ook kort.",
      voorbeeldzin: "Voordat ik hierover besluit: hoe kijk jij ernaar?",
    },
    waarom: {
      duiding: "Je collega kan goed verder met een besluit als duidelijk is waarom het genomen is.",
      suggestie: "Leg de afweging uit, ook wanneer het besluit al vaststaat.",
      voorbeeldzin: "Het besluit is genomen. Ik vertel je graag welke afweging eronder zit.",
    },
    knoop: {
      duiding: "Je collega heeft liever een besluit dan een lang gesprek over alle opties.",
      suggestie: "Beperk het aantal opties tot twee en vraag om een keuze.",
      voorbeeldzin: "Er zijn twee routes. Welke heeft jouw voorkeur?",
    },
  },
  energieverlies: {
    onduidelijk: {
      duiding: "Onduidelijkheid kost je collega veel energie.",
      suggestie: "Zeg erbij wat je van hem of haar verwacht en wanneer, ook als dat vanzelfsprekend lijkt.",
      voorbeeldzin: "Wat ik van je nodig heb is dit, en het liefst voor vrijdag.",
    },
    onderbreking: {
      duiding: "Steeds onderbroken worden kost je collega veel energie.",
      suggestie: "Bundel je vragen en plan een moment in plaats van tussendoor binnen te lopen.",
      voorbeeldzin: "Ik heb een paar dingen. Zullen we daar één moment voor pakken?",
    },
    langoverleg: {
      duiding: "Lange overleggen zonder besluit kosten je collega veel energie.",
      suggestie: "Zeg vooraf wat er aan het einde van het gesprek besloten moet zijn.",
      voorbeeldzin: "Ik wil dat we hier uitkomen op één keuze. Dat is wat mij betreft het doel van dit gesprek.",
    },
    conflict: {
      duiding: "Onuitgesproken spanning kost je collega veel energie.",
      suggestie: "Benoem wat je merkt, ook als je het nog niet precies kunt duiden.",
      voorbeeldzin: "Ik heb het gevoel dat er iets tussen zit. Klopt dat, of zie ik het verkeerd?",
    },
  },
  misverstand: {
    kortaf: {
      duiding: "Je collega heeft aangegeven soms kortaf over te komen terwijl hij of zij met de inhoud bezig is.",
      suggestie: "Vat het niet persoonlijk op en vraag door wanneer je twijfelt.",
      voorbeeldzin: "Ik merk dat je kort reageert. Zit er iets, of ben je gewoon in de inhoud?",
    },
    twijfel: {
      duiding: "Je collega heeft aangegeven dat veel vragen stellen bij hem of haar geen twijfel aan jou betekent.",
      suggestie: "Lees de vragen als betrokkenheid en geef ruimte om ze te stellen.",
      voorbeeldzin: "Vraag gerust door, ik leg het graag uit.",
    },
    stilte: {
      duiding: "Je collega heeft aangegeven dat stilte bij hem of haar nadenken betekent, geen desinteresse.",
      suggestie: "Vul de stilte niet in. Vraag na een moment wat er speelt.",
      voorbeeldzin: "Ik laat het even stil. Zeg het maar wanneer je zover bent.",
    },
    enthousiasme: {
      duiding: "Je collega heeft aangegeven dat enthousiasme bij hem of haar niet altijd een toezegging is.",
      suggestie: "Vraag expliciet of iets is afgesproken voordat je ervan uitgaat.",
      voorbeeldzin: "Even scherp: doe jij dit, of denken we er nog over na?",
    },
  },
  aanspreken: {
    tempo: { duiding: "Je collega vindt het prima om aangesproken te worden als hij of zij te snel gaat.", suggestie: "Zeg het gerust op het moment zelf.", voorbeeldzin: "Je gaat me nu te snel. Kunnen we een stap terug?" },
    detail: { duiding: "Je collega vindt het prima om aangesproken te worden op te lang in de details blijven.", suggestie: "Benoem het en stel voor om uit te zoomen.", voorbeeldzin: "Ik verlies het overzicht. Kunnen we even naar de hoofdlijn?" },
    stil: { duiding: "Je collega vindt het prima om aangesproken te worden wanneer hij of zij stil blijft.", suggestie: "Nodig hem of haar rechtstreeks uit.", voorbeeldzin: "Ik hoor jou nog niet. Hoe kijk jij hiernaar?" },
    toezegging: { duiding: "Je collega vindt het prima om aangesproken te worden op een toezegging die niet is nagekomen.", suggestie: "Verwijs naar de afspraak, niet naar de persoon.", voorbeeldzin: "We hadden afgesproken dat dit vrijdag klaar zou zijn. Wat is er nodig?" },
  },
  energie: {
    samen: { duiding: "Je collega krijgt energie van dingen samen aanpakken.", suggestie: "Doe het samen in plaats van te verdelen, als dat kan.", voorbeeldzin: "Zullen we hier samen een uur voor gaan zitten?" },
    afronden: { duiding: "Je collega krijgt energie van iets echt afronden.", suggestie: "Werk naar een duidelijk eindpunt toe en benoem dat ook.", voorbeeldzin: "Als dit klaar is, is het ook echt af. Dat lijkt me een mooi moment." },
    nieuw: { duiding: "Je collega krijgt energie van nieuwe ideeën en mogelijkheden.", suggestie: "Laat ruimte om te verkennen voordat je naar de uitvoering gaat.", voorbeeldzin: "Voordat we kiezen: welke mogelijkheden zie jij nog?" },
    verdieping: { duiding: "Je collega krijgt energie van ergens rustig goed in duiken.", suggestie: "Geef aaneengesloten tijd in plaats van losse momenten.", voorbeeldzin: "Neem er gerust een dagdeel voor, dan hoef je niet te haasten." },
  },
};

/**
 * Waar het tussen twee voorkeuren kan wringen.
 *
 * De sleutel is `kenmerk` → `jouwWaarde` → `waardeVanDeAnder`. Alleen
 * combinaties die er werkelijk toe doen staan hier; gelijke voorkeuren krijgen
 * een eigen blok wanneer ook dat een valkuil heeft.
 */
export const CONTRASTEN = {
  tempo: {
    snel: {
      bedachtzaam: {
        duiding: "Jij werkt graag vlot naar een besluit toe; je collega wil eerst tijd om na te denken. Dat verschil zorgt er vaak voor dat de een aandringt en de ander afhaakt.",
        suggestie: "Deel het onderwerp vooraf en vraag in het gesprek niet om een definitief antwoord.",
        voorbeeldzin: "Ik wil dit graag met je bespreken. Je hoeft er nu niet uit te zijn.",
      },
    },
    bedachtzaam: {
      snel: {
        duiding: "Jij wilt eerst nadenken; je collega werkt graag vlot naar een besluit. Zonder afspraak daarover voelt het voor de een gejaagd en voor de ander traag.",
        suggestie: "Zeg wanneer je erop terugkomt, dan hoeft de ander niet aan te dringen.",
        voorbeeldzin: "Ik wil hier even over nadenken. Morgen laat ik je weten wat ik ervan vind.",
      },
      bedachtzaam: {
        duiding: "Jullie willen allebei eerst nadenken. Dat gaat zelden mis, maar besluiten kunnen wel blijven liggen.",
        suggestie: "Spreek een datum af waarop de knoop hoe dan ook doorgehakt wordt.",
        voorbeeldzin: "Zullen we afspreken dat we er vrijdag uit zijn, wat de uitkomst ook is?",
      },
    },
  },
  context: {
    kort: {
      veel: {
        duiding: "Jij hebt aan een korte aanleiding genoeg; je collega wil eerst het grotere geheel. Wat voor jou volledig voelt, kan voor de ander te dun zijn.",
        suggestie: "Neem twee minuten extra voor het waarom voordat je je vraag stelt.",
        voorbeeldzin: "Ik schets eerst even de aanleiding, dan komt mijn vraag beter aan.",
      },
    },
    veel: {
      kort: {
        duiding: "Jij geeft graag het hele plaatje; je collega heeft aan een korte aanleiding genoeg. Je uitleg kan dan overkomen als omslachtig.",
        suggestie: "Begin bij je vraag en bied de achtergrond aan in plaats van hem te geven.",
        voorbeeldzin: "Mijn vraag is dit. Wil je weten waar het vandaan komt, dan vertel ik dat erbij.",
      },
    },
  },
  denken: {
    hardop: {
      alleen: {
        duiding: "Jij denkt hardop; je collega denkt eerst voor zichzelf. In een gesprek betekent dat vaak dat jij het woord hebt en de ander later pas met een reactie komt.",
        suggestie: "Stel je vraag en laat daarna een stilte vallen, ook als die ongemakkelijk voelt.",
        voorbeeldzin: "Ik heb hardop gedacht. Neem gerust even de tijd voordat je reageert.",
      },
    },
    alleen: {
      hardop: {
        duiding: "Jij denkt eerst voor jezelf; je collega denkt hardop. Wat hij of zij zegt is dan niet altijd een standpunt, maar denkwerk.",
        suggestie: "Vraag of iets een gedachte of een conclusie is voordat je erop reageert.",
        voorbeeldzin: "Is dit al je conclusie, of ben je nog aan het verkennen?",
      },
    },
  },
  contact: {
    taak: {
      relatie: {
        duiding: "Jij begint graag meteen bij de inhoud; voor je collega hoort even bijpraten bij goed samenwerken. Meteen ter zake komen kan dan afstandelijk overkomen.",
        suggestie: "Neem de eerste minuut voor hoe het gaat. Dat kost weinig en verandert de rest van het gesprek.",
        voorbeeldzin: "Voordat we beginnen: hoe gaat het met je?",
      },
    },
    relatie: {
      taak: {
        duiding: "Jij begint graag persoonlijk; je collega wil meteen bij de inhoud. Je opening kan dan aanvoelen als uitstel.",
        suggestie: "Benoem kort waar het gesprek over gaat en houd het bijpraten voor daarna.",
        voorbeeldzin: "Ik val meteen met de deur in huis, dan hebben we daarna tijd om bij te praten.",
      },
    },
  },
  spanning: {
    sneller: {
      stiller: {
        duiding: "Jij wordt directer als de spanning oploopt; je collega wordt stiller. Dat versterkt elkaar: hoe directer jij wordt, hoe stiller de ander.",
        suggestie: "Vertraag bewust en stel een vraag in plaats van je punt te herhalen.",
        voorbeeldzin: "Ik merk dat ik snel ga. Wat denk jij hiervan?",
      },
      terugtrekken: {
        duiding: "Jij wordt directer bij spanning; je collega heeft dan juist even ruimte nodig. Doorpraten helpt hier niet.",
        suggestie: "Stel een pauze voor voordat het gesprek vastloopt, en spreek af wanneer je verdergaat.",
        voorbeeldzin: "Zullen we hier even mee stoppen en morgen verder praten?",
      },
    },
    stiller: {
      sneller: {
        duiding: "Jij wordt stiller als de spanning oploopt; je collega wordt directer. Jouw stilte wordt dan makkelijk gelezen als instemming.",
        suggestie: "Zeg hardop dat je even nodig hebt, in plaats van te zwijgen.",
        voorbeeldzin: "Ik heb even een moment nodig om dit te laten landen.",
      },
    },
  },
  besluitvorming: {
    knoop: {
      meepraten: {
        duiding: "Jij hakt liever een knoop door; je collega wil erover meegepraat hebben. Een snel besluit kan dan later alsnog terugkomen.",
        suggestie: "Vraag om een reactie voordat je besluit, ook als het maar vijf minuten kost.",
        voorbeeldzin: "Ik neig hiernaar. Voordat ik het vastleg: mis ik iets?",
      },
    },
    meepraten: {
      knoop: {
        duiding: "Jij wilt meepraten over besluiten; je collega hakt liever door. Je inbreng komt dan soms te laat.",
        suggestie: "Zeg vooraf dat je wilt meedenken en wanneer je dat doet.",
        voorbeeldzin: "Ik wil hier graag over meedenken. Kan ik je morgenochtend laten weten wat ik ervan vind?",
      },
    },
  },
  structuur: {
    structuur: {
      ruimte: {
        duiding: "Jij werkt graag met duidelijke afspraken; je collega bepaalt liever onderweg hoe iets gaat. Je afspraken kunnen dan als inperking voelen.",
        suggestie: "Leg het resultaat vast en laat de aanpak open.",
        voorbeeldzin: "Dit is wat er moet liggen en wanneer. Hoe je het doet, is aan jou.",
      },
    },
    ruimte: {
      structuur: {
        duiding: "Jij bepaalt graag onderweg; je collega wil duidelijke afspraken. Ruimte laten kan bij hem of haar als onduidelijkheid aankomen.",
        suggestie: "Spreek in ieder geval één ijkpunt af, ook als de rest open blijft.",
        voorbeeldzin: "Laten we afspreken dat we volgende week donderdag kijken waar we staan.",
      },
    },
  },
  feedback: {
    direct: {
      rustig: {
        duiding: "Jij zegt het graag direct; je collega hoort feedback liever rustig en onder vier ogen. Dezelfde boodschap komt dan heel anders aan.",
        suggestie: "Kies het moment zorgvuldiger dan de woorden.",
        voorbeeldzin: "Heb je straks even? Ik wil iets met je bespreken.",
      },
    },
    rustig: {
      direct: {
        duiding: "Jij brengt feedback graag rustig; je collega hoort het liever zonder omhaal. Je zorgvuldige aanloop kan dan spannender maken dan nodig.",
        suggestie: "Zeg in de eerste zin waar het over gaat.",
        voorbeeldzin: "Ik wil iets met je bespreken over gisteren. Niets ernstigs, wel belangrijk.",
      },
    },
  },
};

/** Vaste teksten rond het advies. */
export const ADVIESKADER = {
  transparantie:
    "Dit advies is gebaseerd op informatie die jij en je collega zelf hebben gedeeld of bevestigd. Het is bedoeld als hulpmiddel voor samenwerking en is geen beoordeling van jullie persoonlijkheid of relatie.",
  afsluiters: [
    "Vraag vooral of dit voor de ander herkenbaar is.",
    "Gebruik dit als startpunt voor het gesprek, niet als waarheid over de ander.",
  ],
  weinigInformatie:
    "Je collega heeft nog weinig met dit team gedeeld. Daardoor blijft dit advies algemeen. Het helpt om er samen naar te kijken en te vragen wat voor hem of haar werkt.",
  nietsGedeeld:
    "Je collega heeft nog niets met dit team gedeeld. We kunnen daarom niets zeggen over wat voor hem of haar prettig werkt. Vraag het gerust rechtstreeks; dat is vaak een goed begin van het gesprek.",
  geenEigenProfiel:
    "Je hebt zelf nog geen voorkeuren vastgelegd. Het advies gaat daardoor alleen over je collega. Vul je profiel aan om te zien waar jullie van elkaar verschillen.",
};
