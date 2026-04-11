// ─────────────────────────────────────────────
// HET TEAMKOMPAS — Productie-klare versie
// Vul de credentials in bij "STAP 1 / 2 / 3"
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────
// STAP 1 — FIREBASE CREDENTIALS
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDgl6gj1LmOZ-1Mcin1jNfkkZg82c2Jtz0",
  authDomain: "mijn-teamkompas-6de84.firebaseapp.com",
  projectId: "mijn-teamkompas-6de84",
  storageBucket: "mijn-teamkompas-6de84.firebasestorage.app",
  messagingSenderId: "820620515571",
  appId: "1:820620515571:web:86a4e792eebe4c7cf03f86",
};

// ─────────────────────────────────────────────
// STAP 2 — EMAILJS CREDENTIALS
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_eytet3a";
const EMAILJS_TEMPLATE_ID = "pysvu9a";
const EMAILJS_PUBLIC_KEY = "aXtk48FJxZBI-fBNQ";

// ─────────────────────────────────────────────
// STAP 3 — ADMIN EMAILADRESSEN
// ─────────────────────────────────────────────
const ADMIN_EMAILS = [
  "bozidar@mijnteamkompas.nl",
  "edmond@mijnteamkompas.nl",
];

// Firebase initialiseren
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const PUB = {
  donker: "#0D1B2A",
  navy: "#1A2E4A",
  teal: "#0F766E",
  tealDark: "#0B5F5A",
  tealGlow: "rgba(0,168,150,0.15)",
  groen: "#5A8C3C",
  blauw: "#3A7DBF",
  paars: "#6B4E9E",
  oranje: "#E8821A",
  licht: "#F4F7F9",
  wit: "#FFFFFF",
  sub: "#6B7A8D",
  lijn: "#dde4ed",
};

const ADM = {
  navyDeep: "#0D1B2A",
  navy: "#1A2E4A",
  navyMid: "#223a5a",
  navyLight: "#2d4d73",
  teal: "#0F766E",
  tealDark: "#0B5F5A",
  tealGlow: "rgba(0,168,150,0.15)",
  tealGlow2: "rgba(0,168,150,0.08)",
  white: "#ffffff",
  text: "#e2eaf2",
  muted: "#8fa3bb",
  border: "rgba(255,255,255,0.07)",
  green: "#2ecc71",
  orange: "#f39c12",
  red: "#e74c3c",
};

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────
function useInView() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return [ref, vis];
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return mobile;
}

function Fade({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED SCAN DATA
// ─────────────────────────────────────────────
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

function flattenVerdiepingStellingen(keys = []) {
  return keys.flatMap((k) => VERDIEPING_BLOKKEN[k]?.stellingen || []);
}

function gecombineerdeVerdiepingTitel(keys = []) {
  const labels = keys.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean);
  return labels.length ? `Verdieping: ${labels.join(" + ")}` : "Verdieping";
}

// ─────────────────────────────────────────────
// PUBLIC SITE COMPONENTS
// ─────────────────────────────────────────────
function Strepen() {
  return (
    <div style={{ position:"absolute",left:0,top:0,bottom:0,width:6,display:"flex",flexDirection:"column",zIndex:3 }}>
      {[PUB.groen,PUB.blauw,PUB.oranje,PUB.paars].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
    </div>
  );
}

function KompasDot({ size = 26 }) {
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`conic-gradient(${PUB.groen} 0 25%,${PUB.blauw} 25% 50%,${PUB.oranje} 50% 75%,${PUB.paars} 75%)` }} />
  );
}

function KompasAnim() {
  const isMobile = useIsMobile();
  const size = isMobile ? 360 : 480;

  const kw = [
    [PUB.groen, "Veiligheid"],
    [PUB.blauw, "Verandering"],
    [PUB.oranje, "Energie"],
    [PUB.paars, "Leren"],
  ];

  return (
    <div style={{ width:size, height:size, position:"relative", flexShrink:0 }}>
      {[0,16,32].map((ins,i) => (
        <div
          key={i}
          style={{
            position:"absolute",
            inset:ins,
            borderRadius:"50%",
            border:`1px solid rgba(255,255,255,${0.08 - i*0.02})`,
          }}
        />
      ))}

      <div
        style={{
          position:"absolute",
          inset:46,
          borderRadius:"50%",
          overflow:"hidden",
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          boxShadow:"0 0 48px rgba(0,0,0,0.42)",
        }}
      >
        {kw.map(([c,l],i) => (
          <div
            key={i}
            style={{
              background:c,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              padding:12,
            }}
          >
            <span
              style={{
                fontSize:isMobile ? 14 : 16,
                fontWeight:700,
                color:"rgba(255,255,255,0.95)",
                textAlign:"center",
                lineHeight:1.2,
                letterSpacing:"0.01em",
              }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          position:"absolute",
          top:"50%",
          left:"50%",
          transform:"translate(-50%,-50%)",
          width:isMobile ? 116 : 130,
          height:isMobile ? 116 : 130,
          borderRadius:"50%",
          background:PUB.donker,
          border:"2px solid rgba(15,118,110,0.38)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          zIndex:10,
          boxShadow:"0 0 28px rgba(0,0,0,0.38)",
        }}
      >
        <span style={{fontSize:isMobile ? 22 : 24, fontWeight:700, color:PUB.teal}}>
          Gedrag
        </span>
      </div>
    </div>
  );
}

function NavBar({ isMobile, onLoginClick, openModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    ["Aanpak","aanpak"],
    ["Voor wie","voor-wie"],
    ["Over ons","over-ons"],
    ["Werkwijze","werkwijze"]
  ];

  useEffect(() => {
    const ids = ["aanpak", "voor-wie", "over-ons", "werkwijze"];
    const observers = [];

    const updateActive = () => {
      const hero = document.getElementById("home");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          setActiveSection("home");
          return;
        }
      }

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          setActiveSection(id);
          return;
        }
      }
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const scrollTo = (id) => {
    const targetId = id === "home" ? "home" : id;
    document.getElementById(targetId)?.scrollIntoView({behavior:"smooth",block:"start"});
    setMenuOpen(false);
  };

  const navLinkStyle = (id) => ({
    position:"relative",
    color: activeSection===id ? "#ffffff" : "rgba(255,255,255,0.62)",
    fontSize:13,
    cursor:"pointer",
    transition:"color 0.2s",
    paddingBottom:12,
    display:"inline-flex",
    alignItems:"center",
  });

  const activeIndicator = {
    position:"absolute",
    left:0,
    right:0,
    bottom:0,
    height:3,
    background:PUB.teal,
    borderRadius:999,
  };

  return (
    <>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(13,27,42,0.97)",
        borderBottom:"1px solid rgba(0,168,150,0.2)",height:64,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:isMobile?"0 20px":"0 40px",backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <KompasDot size={22}/>
          <span style={{fontSize:18,fontWeight:600,color:"#ffffff"}}>Mijn Teamkompas</span>
        </div>

        {isMobile ? (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span onClick={openModal} style={{background:"#F4F7F9",color:"#0D1B2A",padding:"8px 12px",
              borderRadius:999,fontWeight:700,fontSize:12,cursor:"pointer",border:"1px solid rgba(0,168,150,0.18)"}}>
              Neem contact op
            </span>
            <div onClick={()=>setMenuOpen(!menuOpen)}
              style={{cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:22,lineHeight:1,padding:"4px"}}>
              {menuOpen ? "✕" : "☰"}
            </div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            <span
              onClick={()=>scrollTo("home")}
              aria-current={activeSection==="home" ? "page" : undefined}
              style={navLinkStyle("home")}
            >
              Home
              {activeSection==="home" && <span style={activeIndicator} />}
            </span>

            {navLinks.map(([l,id])=>(
              <span
                key={l}
                onClick={()=>scrollTo(id)}
                aria-current={activeSection===id ? "page" : undefined}
                style={navLinkStyle(id)}
                onMouseEnter={e=>{ if (activeSection!==id) e.target.style.color="#00A896"; }}
                onMouseLeave={e=>{ if (activeSection!==id) e.target.style.color="rgba(255,255,255,0.62)"; }}
              >
                {l}
                {activeSection===id && <span style={activeIndicator} />}
              </span>
            ))}

            <span
              onClick={openModal}
              style={{background:"#F4F7F9",color:"#0D1B2A",fontWeight:700,padding:"10px 18px",
                borderRadius:999,fontSize:12,cursor:"pointer",boxShadow:"0 8px 22px rgba(0,0,0,0.18)"}}
            >
              Neem contact op
            </span>

            <span onClick={onLoginClick} style={{background:"transparent",color:"rgba(255,255,255,0.55)",
              padding:"7px 14px",borderRadius:4,fontWeight:500,fontSize:12,cursor:"pointer",
              border:"1px solid rgba(255,255,255,0.15)"}}>Inloggen →</span>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <div style={{position:"fixed",top:64,left:0,right:0,zIndex:199,
          background:"rgba(13,27,42,0.98)",borderBottom:"1px solid rgba(0,168,150,0.2)",
          padding:"12px 0"}}>
          <div
            onClick={()=>scrollTo("home")}
            aria-current={activeSection==="home" ? "page" : undefined}
            style={{padding:"14px 24px",color:activeSection==="home" ? "#00A896" : "rgba(255,255,255,0.75)",
              fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Home
          </div>
          {navLinks.map(([l,id])=>(
            <div
              key={l}
              onClick={()=>scrollTo(id)}
              aria-current={activeSection===id ? "page" : undefined}
              style={{padding:"14px 24px",color:activeSection===id ? "#00A896" : "rgba(255,255,255,0.75)",
                fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
            >
              {l}
            </div>
          ))}
          <div onClick={()=>{openModal();setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"#ffffff",fontSize:15,cursor:"pointer",fontWeight:700,
              borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            Neem contact op
          </div>
          <div onClick={()=>{onLoginClick();setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"#00A896",fontSize:15,cursor:"pointer",fontWeight:600}}>
            Inloggen →
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// PUBLIC SITE
// ─────────────────────────────────────────────
function PublicSite({ onLoginClick }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    naam: "",
    organisatie: "",
    email: "",
    telefoon: "",
    bericht: "",
  });
  const [status, setStatus] = useState("idle");
  const isMobile = useIsMobile();

  const openModal = () => {
    setModalOpen(true);
    setStatus("idle");
    setForm({ naam: "", organisatie: "", email: "", telefoon: "", bericht: "" });
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    if (!form.naam || !form.email) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      await addDoc(collection(db, "contactaanvragen"), {
        naam: form.naam,
        organisatie: form.organisatie,
        email: form.email,
        telefoon: form.telefoon,
        bericht: form.bericht,
        status: "Nieuw",
        aangemaakt_op: serverTimestamp(),
      });

      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_naam: form.naam,
            from_organisatie: form.organisatie,
            from_email: form.email,
            from_telefoon: form.telefoon,
            bericht: form.bericht,
            to_email: "info@mijnteamkompas.nl",
          },
        }),
      });

      if (!res.ok) {
        console.warn("EmailJS gaf geen 200-response");
      }

      setStatus("sent");
    } catch (error) {
      console.error("Fout bij versturen:", error);
      setStatus("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>Mijn Teamkompas | Teamscan, teamcoaching en leiderschapsbegeleiding</title>
        <meta
          name="description"
          content="Mijn Teamkompas helpt teams te groeien met teamscan, teamcoaching en leiderschapsbegeleiding."
        />
        <meta property="og:title" content="Mijn Teamkompas | Teamscan, teamcoaching en leiderschapsbegeleiding" />
        <meta
          property="og:description"
          content="Mijn Teamkompas helpt teams te groeien met teamscan, teamcoaching en leiderschapsbegeleiding."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{fontFamily:"'Roboto', sans-serif",color:"#2D3748",overflowX:"hidden",paddingTop:64}}>
        <NavBar isMobile={isMobile} onLoginClick={onLoginClick} openModal={openModal} />

        {/* HERO */}
        <div id="home" style={{background:PUB.donker,display:"grid",
          gridTemplateColumns:isMobile?"1fr":"1fr 1fr",
          alignItems:"center",minHeight:isMobile?"auto":"86vh",
          position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,
            backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.033) 1px,transparent 1px)",
            backgroundSize:"30px 30px",pointerEvents:"none"}}/>
          <Strepen/>
          <div style={{padding:isMobile?"60px 24px 40px 32px":"60px 48px 60px 60px",position:"relative",zIndex:2}}>
            <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:PUB.teal,
              textTransform:"uppercase",marginBottom:16}}>Voor teams en leidinggevenden</div>
            <h1 style={{fontSize:isMobile?30:44,fontWeight:700,lineHeight:1.2,color:PUB.wit,marginBottom:16}}>
              Goede teams worden niet beter door harder te werken. Ze worden beter door anders te kijken.
            </h1>
            <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:"rgba(255,255,255,0.57)",maxWidth:520,marginBottom:14}}>
              Wij meten wat er speelt, begrijpen wat het betekent en bewegen wat vastloopt.
            </p>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.42)",marginBottom:32}}>
              Voor teams en organisaties in beweging.
            </div>
            <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:12}}>
              <span style={{background:PUB.teal,color:PUB.donker,padding:"13px 22px",borderRadius:4,
                fontWeight:600,fontSize:14,cursor:"pointer",textAlign:"center"}} onClick={openModal}>
                Plan een kennismakingsgesprek
              </span>
              <span onClick={()=>document.getElementById("aanpak")?.scrollIntoView({behavior:"smooth",block:"start"})}
                style={{border:"1px solid rgba(255,255,255,0.26)",color:"rgba(255,255,255,0.78)",
                padding:"13px 22px",borderRadius:4,fontSize:14,cursor:"pointer",textAlign:"center"}}>
                Bekijk onze aanpak
              </span>
            </div>
          </div>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",
              padding:"60px 40px",position:"relative",zIndex:2}}>
              <KompasAnim/>
            </div>
          )}
          {isMobile && (
            <div style={{display:"flex",justifyContent:"center",padding:"32px 24px",zIndex:2}}>
              <KompasAnim/>
            </div>
          )}
        </div>

        {/* FOTOSECTIE */}
        <div style={{position:"relative",width:"100%",height:isMobile?280:480,overflow:"hidden"}}>
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&fit=crop&crop=center"
            alt="Mensen in serieus overleg aan tafel"
            style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%",display:"block"}}
          />
          <div style={{
            position:"absolute",inset:0,
            background:"linear-gradient(to right, rgba(13,27,42,0.78) 0%, rgba(13,27,42,0.45) 55%, rgba(13,27,42,0.18) 100%)"
          }}/>
          <div style={{
            position:"absolute",inset:0,
            display:"flex",flexDirection:"column",justifyContent:"center",
            padding:isMobile?"28px 24px":"0 80px"
          }}>
            <Fade>
              <p style={{
                fontSize:isMobile?20:34,fontWeight:700,color:PUB.wit,
                lineHeight:1.3,maxWidth:620,marginBottom:16
              }}>
                Samenwerking verbeteren begint niet met een nieuw proces.<br/>
                <em style={{fontStyle:"italic",color:PUB.wit}}>Het begint met begrijpen wat er werkelijk tussen mensen speelt.</em>
              </p>
            </Fade>
          </div>
        </div>

        {/* AANPAK */}
        <div id="aanpak" style={{padding:isMobile?"48px 20px":"72px 60px",background:PUB.wit}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:52,alignItems:"start"}}>
            <Fade>
              <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Onze aanpak</div>
              <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
                Wat maakt samenwerking <br/><em style={{fontStyle:"italic",color:PUB.teal}}>sterk of kwetsbaar?</em>
              </h2>
              <p style={{fontSize:15,lineHeight:1.75,color:PUB.sub,marginBottom:28}}>
                Wij helpen teams en leidinggevenden zichtbaar te maken wat samenwerking belemmert en wat juist beweging geeft.
                Niet met losse inzichten, maar met een scherp beeld van wat er speelt in gedrag, vertrouwen, energie, verandering en dagelijks leiderschap.
              </p>
              {[["1","We maken zichtbaar wat er speelt","We brengen in kaart waar samenwerking vastloopt, waar onduidelijkheid ontstaat en waar energie of vertrouwen wegvalt."],
                ["2","We vertalen signalen naar richting","We maken patronen begrijpelijk voor team en leidinggevende, zodat duidelijk wordt waar de grootste kans op verbetering ligt."],
                ["3","We zetten inzicht om in beweging","We vertalen de uitkomsten naar concrete gesprekken, interventies en vervolgstappen die in de praktijk uitvoerbaar zijn."],
              ].map(([nr,t,b],i)=>(
                <Fade key={i} delay={i*0.1}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
                    <div style={{width:33,height:33,borderRadius:"50%",background:PUB.donker,
                      color:PUB.teal,display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:15,fontWeight:700,flexShrink:0}}>{nr}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:PUB.donker,marginBottom:2}}>{t}</div>
                      <div style={{fontSize:13,color:PUB.sub,lineHeight:1.6}}>{b}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </Fade>
            <Fade delay={isMobile?0:0.2}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,
                borderRadius:10,overflow:"hidden",boxShadow:"0 14px 44px rgba(0,0,0,0.13)"}}>
                {[[PUB.groen,"01","Vertrouwen & veiligheid","Kunnen mensen zich uitspreken, fouten bespreken en elkaar echt aanspreken?","Gebaseerd op Secure Base Leadership"],
                  [PUB.blauw,"02","Verandering & duidelijkheid","Begrijpen mensen wat er verandert, waarom dat nodig is en wat er van hen wordt gevraagd?","Gebaseerd op neuromanagement"],
                  [PUB.oranje,"03","Energie & motivatie","Waar geven werk en samenwerking energie, en waar ontstaan juist belasting, frustratie of uitputting?","Gebaseerd op het JD-R model"],
                  [PUB.paars,"04","Leren & verbeteren","Hoe leert een team van ervaringen en hoe worden verbeteringen ook echt vastgehouden?","Gebaseerd op lean en agile"],
                ].map(([c,nr,t,b,m],i)=>(
                  <div key={i} style={{background:c,padding:isMobile?"16px 12px":"24px 18px",display:"flex",flexDirection:"column",gap:5}}>
                    <div style={{fontSize:isMobile?20:30,fontWeight:700,color:"rgba(255,255,255,0.16)",lineHeight:1}}>{nr}</div>
                    <div style={{fontSize:isMobile?13:15,fontWeight:700,color:PUB.wit,lineHeight:1.2}}>{t}</div>
                    <div style={{fontSize:isMobile?11:12,color:"rgba(255,255,255,0.76)",lineHeight:1.55}}>{b}</div>
                    <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.08em",color:"rgba(255,255,255,0.42)",textTransform:"uppercase",marginTop:"auto",paddingTop:8}}>{m}</div>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </div>

        {/* WAT ORGANISATIES MOGEN VERWACHTEN */}
        <div style={{background:PUB.donker,padding:isMobile?"48px 24px":"72px 96px",position:"relative",overflow:"hidden"}}>
          <Strepen/>
          <Fade>
            <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>
              Wat organisaties van ons mogen verwachten
            </div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.15,color:PUB.wit,marginBottom:16,maxWidth:760}}>
              Wat jouw organisatie <em style={{fontStyle:"italic",color:PUB.teal}}>eraan heeft</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.62)",maxWidth:760,marginBottom:36}}>
              Geen stapel aanbevelingen die in een la verdwijnen. Wat we doen wordt zichtbaar in hoe mensen samenwerken, communiceren en eigenaarschap nemen.
            </p>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:isMobile?10:12,maxWidth:900,gridAutoRows:"1fr"}}>
              {[
                "Je weet sneller wat samenwerking belemmert en waar de echte ruimte zit",
                "Teams spreken zich opener uit omdat ze begrijpen wat er speelt",
                "Leidinggevenden krijgen concrete handvatten om anders te sturen",
                "Interventies zijn direct uitvoerbaar in de dagelijkse praktijk",
                "De aanpak is mensgericht én gericht op zichtbaar resultaat",
                "Gedrag, samenwerking en eigenaarschap veranderen merkbaar",
              ].map((item,i)=>(
                <Fade key={i} delay={i*0.05} style={{height:"100%"}}>
                  <div style={{height:"100%",boxSizing:"border-box",display:"flex",gap:12,alignItems:"center",padding:"16px 18px",
                    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:PUB.teal,flexShrink:0}}/>
                    <div style={{fontSize:14,color:"rgba(255,255,255,0.84)",lineHeight:1.6}}>{item}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </Fade>
        </div>

        {/* SECTOREN */}
        <div id="voor-wie" style={{padding:isMobile?"48px 20px":"72px 60px",background:PUB.licht}}>
          <Fade>
            <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Voor wie werken wij</div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
              Herkenbaar in elke sector.<br/><em style={{fontStyle:"italic",color:PUB.teal}}>Toepasbaar in jouw team.</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:PUB.sub,maxWidth:560,marginBottom:40}}>
              Wij werken met organisaties waar samenwerking onder druk staat door groei, verandering of complexiteit. Waar openheid en aanspreekbaarheid nodig zijn. En waar leidinggevenden meer grip willen zonder harder te trekken.
            </p>
          </Fade>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?12:16,alignItems:"stretch"}}>
            {[["Zakelijke dienstverlening","Groeiende organisaties waar cultuur en structuur achterlopen op de ambities en teams meer eigenaarschap nodig hebben."],
              ["Gemeenten","Verandering in een politieke omgeving waar draagvlak, psychologische veiligheid en duidelijkheid voortdurend onder druk staan."],
              ["Onderwijs","Schoolteams en hogescholen waar de werkdruk hoog is en het gesprek over samenwerking zelden gevoerd wordt."],
              ["Industrie","Teams op de werkvloer waar veiligheidscultuur en continu verbeteren hand in hand moeten gaan."],
            ].map(([t,b],i)=>(
              <Fade key={i} delay={i*0.1} style={{height:"100%"}}>
                <div style={{height:"100%",background:PUB.wit,border:`1px solid ${PUB.lijn}`,borderRadius:8,padding:"22px 18px",boxSizing:"border-box"}}>
                  <div style={{fontSize:17,fontWeight:700,color:PUB.donker,marginBottom:7}}>{t}</div>
                  <div style={{fontSize:13,color:PUB.sub,lineHeight:1.65}}>{b}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>

        {/* OVER ONS */}
        <div id="over-ons" style={{padding:isMobile?"48px 20px":"72px 60px",background:PUB.wit}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:52,alignItems:"start"}}>
            <Fade>
              <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Wie wij zijn</div>
              <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
                Ervaring die je herkent.<br/><em style={{fontStyle:"italic",color:PUB.teal}}>Aanpak die werkt.</em>
              </h2>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:16}}>
                Wij helpen organisaties zichtbaar te maken wat in samenwerking vaak onbesproken blijft, maar wel bepalend is voor vertrouwen, duidelijkheid en beweging.
              </p>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:16}}>
                We combineren jarenlange praktijkervaring in leiderschap en organisatieverandering met een aanpak die direct toepasbaar is. Geen theorie die blijft hangen in een presentatie maar inzichten die mensen de volgende dag al anders laten handelen.
              </p>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:0}}>
                We helpen niet alleen begrijpen wat er speelt. We helpen het gesprek en het gedrag ook echt veranderen.
              </p>
            </Fade>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Fade>
                <div style={{borderRadius:10,overflow:"hidden",marginBottom:6,boxShadow:"0 8px 32px rgba(0,0,0,0.10)"}}>
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&fit=crop&crop=faces,center"
                    alt="Één-op-één gesprek tussen begeleider en leidinggevende"
                    style={{width:"100%",height:220,objectFit:"cover",objectPosition:"center 20%",display:"block"}}
                  />
                </div>
              </Fade>
              {[
                ["Mensgericht én praktisch","Geen abstracte verandertaal, maar begeleiding die aansluit op de dagelijkse praktijk van teams en leidinggevenden."],
                ["Onderstroom zichtbaar maken","We helpen organisaties begrijpen wat niet wordt uitgesproken maar wel bepalend is voor samenwerking en beweging."],
                ["Richting geven aan vervolg","Inzichten worden vertaald naar gesprekken, interventies en vervolgstappen die uitvoerbaar en relevant zijn."],
              ].map(([titel,tekst],i)=>(
                <Fade key={i} delay={i*0.12}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",padding:18,
                    borderRadius:8,border:`1px solid ${PUB.lijn}`,background:PUB.licht}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:PUB.teal,marginTop:5,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:PUB.donker,marginBottom:5}}>{titel}</div>
                      <div style={{fontSize:13,color:PUB.sub,lineHeight:1.65}}>{tekst}</div>
                    </div>
                  </div>
                </Fade>
              ))}
              <Fade delay={0.35}>
                <div style={{padding:18,borderRadius:8,background:PUB.navy,border:`1px solid ${PUB.tealGlow}`}}>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.62)",marginBottom:11,lineHeight:1.6}}>
                    Benieuwd of onze aanpak past bij wat er in jouw organisatie speelt? Plan een vrijblijvend gesprek van 30 minuten. We luisteren eerst.
                  </p>
                  <span style={{background:PUB.teal,color:PUB.donker,padding:"10px 18px",borderRadius:4,
                    fontWeight:600,fontSize:13,cursor:"pointer",display:"block",textAlign:"center"}}
                    onClick={openModal}>Plan een vrijblijvend kennismakingsgesprek →</span>
                </div>
              </Fade>
            </div>
          </div>
        </div>

        {/* WERKWIJZE */}
        <div id="werkwijze" style={{padding:"72px 60px",background:PUB.donker,position:"relative",overflow:"hidden"}}>
          <Fade>
            <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"rgba(255,255,255,0.38)",textTransform:"uppercase",marginBottom:12}}>Hoe we werken</div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.wit,marginBottom:14}}>
              <em style={{fontStyle:"italic",color:PUB.teal}}>Drie stappen</em> naar beweging
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.48)",maxWidth:440,marginBottom:44}}>
              Elk traject begint met luisteren. Dan meten. Dan bewegen.
            </p>
          </Fade>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:isMobile?12:3,position:"relative",zIndex:1,alignItems:"stretch"}}>
            {[["01","Teamkompas Scan","We meten op alle vijf domeinen tegelijk.","4–6 weken"],
              ["02","Inzicht & Dialoog","We presenteren de resultaten en faciliteren het gesprek.","Workshop & sessies"],
              ["03","Gerichte Interventies","Concrete stappen op maat voor uw organisatie.","Op maat"],
            ].map(([nr,t,b,tag],i)=>(
              <Fade key={i} delay={i*0.12} style={{height:"100%"}}>
                <div style={{height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",
                  background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",padding:"28px 22px"}}>
                  <div style={{fontSize:42,fontWeight:700,color:"rgba(0,168,150,0.15)",lineHeight:1,marginBottom:13}}>{nr}</div>
                  <div style={{fontSize:18,fontWeight:700,color:PUB.wit,marginBottom:9}}>{t}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.46)",lineHeight:1.7,marginBottom:16,flex:1}}>{b}</div>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
                    color:PUB.teal,padding:"3px 9px",border:"1px solid rgba(0,168,150,0.25)",borderRadius:2,alignSelf:"flex-start"}}>{tag}</span>
                </div>
              </Fade>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{padding:isMobile?"48px 24px":"72px 80px",
          background:`linear-gradient(135deg, ${PUB.donker} 0%, ${PUB.navy} 60%, rgba(0,168,150,0.15) 100%)`,
          textAlign:"center",position:"relative",overflow:"hidden",borderTop:`1px solid ${PUB.tealGlow}`}}>
          <Fade>
            <h2 style={{fontSize:isMobile?28:42,fontWeight:700,lineHeight:1.15,color:PUB.wit,marginBottom:14}}>
              Benieuwd wat er in jouw team<br/>onder de oppervlakte speelt?
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.78)",maxWidth:480,margin:"0 auto 28px"}}>
              Plan een vrijblijvend kennismakingsgesprek van 30 minuten en verken waar de grootste kans op beweging zit.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <span style={{background:PUB.teal,color:PUB.donker,padding:"13px 26px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer"}} onClick={openModal}>
                Plan een kennismakingsgesprek
              </span>
              <span onClick={()=>document.getElementById("werkwijze")?.scrollIntoView({behavior:"smooth",block:"start"})}
                style={{border:"1px solid rgba(255,255,255,0.38)",color:PUB.wit,padding:"13px 26px",borderRadius:4,fontSize:14,cursor:"pointer"}}>
                Bekijk onze werkwijze
              </span>
            </div>
          </Fade>
        </div>

        {/* FOOTER */}
        <div style={{background:PUB.donker,padding:isMobile?"44px 24px 22px":"44px 60px 22px",borderTop:"1px solid rgba(0,168,150,0.12)"}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr 1fr",gap:isMobile?24:30,marginBottom:30}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                <KompasDot size={20}/>
                <span style={{fontSize:13,fontWeight:600,color:PUB.wit}}>Mijn Teamkompas</span>
              </div>
              <p style={{fontSize:14,fontStyle:"italic",color:PUB.teal,marginBottom:9}}>Mensen maken het verschil.</p>
            </div>
            {[
              ["Aanpak",[
                ["Teamkompas Scan",    ()=>document.getElementById("aanpak")?.scrollIntoView({behavior:"smooth",block:"start"})],
                ["De vier domeinen",   ()=>document.getElementById("aanpak")?.scrollIntoView({behavior:"smooth",block:"start"})],
                ["Werkwijze",          ()=>document.getElementById("werkwijze")?.scrollIntoView({behavior:"smooth",block:"start"})],
              ]],
              ["Voor wie",[
                ["Zakelijke dienstverlening", ()=>document.getElementById("voor-wie")?.scrollIntoView({behavior:"smooth",block:"start"})],
                ["Gemeenten",                 ()=>document.getElementById("voor-wie")?.scrollIntoView({behavior:"smooth",block:"start"})],
                ["Onderwijs",                 ()=>document.getElementById("voor-wie")?.scrollIntoView({behavior:"smooth",block:"start"})],
                ["Industrie",                 ()=>document.getElementById("voor-wie")?.scrollIntoView({behavior:"smooth",block:"start"})],
              ]],
              ["Contact",[
                ["Afspraak maken",         ()=>openModal()],
                ["info@mijnteamkompas.nl", ()=>window.location.href="mailto:info@mijnteamkompas.nl"],
              ]],
            ].map(([t,ls],i)=>(
              <div key={i}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",marginBottom:12}}>{t}</div>
                {ls.map(([l,fn])=>(
                  <div key={l} onClick={fn}
                    style={{fontSize:12,color:"rgba(255,255,255,0.52)",marginBottom:8,cursor:"pointer",
                      WebkitTapHighlightColor:"transparent",padding:"4px 0"}}
                    onMouseEnter={e=>e.currentTarget.style.color="rgba(0,168,150,0.9)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.52)"}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{height:3,display:"flex",marginBottom:16}}>
            {[PUB.groen,PUB.blauw,PUB.oranje,PUB.paars].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.22)"}}>© 2026 Mijn Teamkompas</span>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.22)",cursor:"pointer"}}
                onClick={()=>window.open("/privacyverklaring_mijnteamkompas.pdf","_blank")}>
                Privacyverklaring
              </span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.22)",cursor:"pointer"}}
                onClick={()=>window.open("/algemene_voorwaarden_mijnteamkompas.pdf","_blank")}>
                Algemene voorwaarden
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {modalOpen && (
        <div onClick={closeModal} style={{position:"fixed",inset:0,zIndex:1000,
          background:"rgba(13,27,42,0.85)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,
            background:"#1A2E4A",borderRadius:16,border:"1px solid rgba(0,168,150,0.2)",
            boxShadow:"0 40px 100px rgba(0,0,0,0.6)",overflow:"hidden"}}>
            <div style={{padding:"28px 32px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
              display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"#00A896",textTransform:"uppercase",marginBottom:6}}>Vrijblijvend kennismakingsgesprek</div>
                <div style={{fontSize:22,fontWeight:700,color:"#ffffff"}}>Plan een kennismakingsgesprek</div>
                <div style={{fontSize:13,color:"#8fa3bb",marginTop:4}}>We nemen binnen één werkdag contact op.</div>
              </div>
              <div onClick={closeModal} style={{cursor:"pointer",color:"#8fa3bb",fontSize:22,lineHeight:1,padding:"4px 8px",marginTop:-4}}>×</div>
            </div>
            {status === "sent" ? (
              <div style={{padding:"48px 32px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:16}}>✅</div>
                <div style={{fontSize:20,fontWeight:700,color:"#ffffff",marginBottom:10}}>Bericht ontvangen!</div>
                <div style={{fontSize:14,color:"#8fa3bb",lineHeight:1.7,marginBottom:24}}>
                  Bedankt voor uw interesse. We nemen zo snel mogelijk contact met u op.
                </div>
                <span onClick={closeModal} style={{background:"#00A896",color:"#0D1B2A",
                  padding:"10px 24px",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  Sluiten
                </span>
              </div>
            ) : (
              <div style={{padding:"24px 32px 32px"}}>
                {[["naam","Naam *","Uw volledige naam","text"],
                  ["organisatie","Organisatie","Naam van uw organisatie","text"],
                  ["email","E-mailadres *","uw@email.nl","email"],
                  ["telefoon","Telefoonnummer","+31 6 ...","tel"],
                ].map(([key,label,ph,type])=>(
                  <div key={key} style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:"#8fa3bb",marginBottom:5,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>{label}</div>
                    <input type={type} placeholder={ph} value={form[key]}
                      onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",
                        border:`1px solid ${status==="error" && !form[key] && (key==="naam"||key==="email") ? "#e74c3c" : "rgba(255,255,255,0.1)"}`,
                        borderRadius:8,padding:"10px 14px",color:"#ffffff",fontSize:14,
                        outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:"#8fa3bb",marginBottom:5,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>Bericht</div>
                  <textarea placeholder="Vertel ons kort waar u mee bezig bent..." value={form.bericht}
                    onChange={e=>setForm(f=>({...f,bericht:e.target.value}))} rows={4}
                    style={{width:"100%",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,
                      padding:"10px 14px",color:"#ffffff",fontSize:14,outline:"none",
                      boxSizing:"border-box",resize:"vertical"}}/>
                </div>
                {status === "error" && (
                  <div style={{fontSize:12,color:"#e74c3c",marginBottom:12}}>Vul minimaal naam en e-mailadres in.</div>
                )}
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <button onClick={handleSubmit} disabled={status==="sending"}
                    style={{flex:1,background:status==="sending"?"#007d70":"#00A896",
                      color:"#0D1B2A",border:"none",borderRadius:8,padding:"13px",
                      fontWeight:700,fontSize:15,cursor:status==="sending"?"wait":"pointer"}}>
                    {status === "sending" ? "Versturen..." : "Verstuur aanvraag →"}
                  </button>
                  <span onClick={closeModal} style={{fontSize:13,color:"#8fa3bb",cursor:"pointer"}}>Annuleer</span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:12,textAlign:"center"}}>
                  Uw gegevens worden uitsluitend gebruikt om contact met u op te nemen.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// LOGIN SCREEN — Firebase Auth + ADMIN_EMAILS check
// ─────────────────────────────────────────────
function LoginScreen({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Vul e-mailadres en wachtwoord in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      if (!ADMIN_EMAILS.includes(cred.user.email || "")) {
        await signOut(auth);
        setError("Je hebt geen toegang tot de beheeromgeving.");
        return;
      }

      onLogin();
    } catch (err) {
      const code = err?.code || "";

      setError(
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Onjuist e-mailadres of wachtwoord."
          : code === "auth/too-many-requests"
          ? "Te veel pogingen. Probeer later opnieuw."
          : "Inloggen mislukt. Probeer opnieuw."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ADM.navyDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle,rgba(0,168,150,0.04) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, display: "flex" }}>
        {[PUB.groen, ADM.teal, PUB.oranje, PUB.paars].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div
        style={{
          width: 400,
          background: ADM.navy,
          borderRadius: 16,
          padding: "40px 36px",
          border: `1px solid ${ADM.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: ADM.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 14px",
              boxShadow: "0 0 24px rgba(0,168,150,0.4)",
            }}
          >
            🧭
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: ADM.white, marginBottom: 4 }}>
            Mijn Teamkompas
          </div>
          <div style={{ fontSize: 12, color: ADM.muted }}>
            Beheeromgeving, alleen voor beheerders
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: ADM.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
            E-mailadres
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="bozidar@mijnteamkompas.nl"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${ADM.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: ADM.white,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: ADM.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
            Wachtwoord
          </div>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${ADM.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: ADM.white,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {error && (
          <div style={{ color: ADM.red, fontSize: 12, textAlign: "center", marginBottom: 14 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#007d70" : ADM.teal,
            color: ADM.navyDeep,
            border: "none",
            borderRadius: 8,
            padding: "12px",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? "wait" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "Inloggen..." : "Inloggen →"}
        </button>
        <div
          onClick={onBack}
          style={{ textAlign: "center", fontSize: 12, color: ADM.muted, cursor: "pointer" }}
        >
          ← Terug naar de website
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCAN INVULLEN — resultaten naar Firestore
// ─────────────────────────────────────────────
function ScanInvullen({ scanId }) {
  const [lijst, setLijst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stap, setStap] = useState(0);
  const [rol, setRol] = useState("");
  const [antwoorden, setAntwoorden] = useState({});
  const [ingediend, setIngediend] = useState(false);
  const [opslaan, setOpslaan] = useState(false);

  useEffect(() => {
    const laadLijst = async () => {
      try {
        const docRef = doc(db, "vragenlijsten", scanId);
        const snap = await getDoc(docRef);

        if (snap.exists() && snap.data().status === "Actief") {
          setLijst({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Fout bij laden scan:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    laadLijst();
  }, [scanId]);

  const slaAntwoordOp = (id, waarde) => {
    setAntwoorden((prev) => ({ ...prev, [id]: waarde }));
  };

  const indienen = async () => {
    setOpslaan(true);

    try {
      await addDoc(collection(db, "antwoorden"), {
        vragenlijstId: scanId,
        klant: lijst?.klant || "",
        rol: rol || "Onbekend",
        antwoorden,
        ingediend_op: serverTimestamp(),
      });

      setIngediend(true);
    } catch (err) {
      console.error("Fout bij opslaan:", err);
      // Toon toch bedankt-scherm zodat deelnemer niet vast zit
      setIngediend(true);
    } finally {
      setOpslaan(false);
    }
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:ADM.muted}}>
        <div style={{fontSize:32,marginBottom:12}}>🧭</div>
        <div style={{fontSize:16,color:ADM.white}}>Scan laden...</div>
      </div>
    </div>
  );

  if (notFound || !lijst) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:ADM.muted}}>
        <div style={{fontSize:32,marginBottom:12}}>🔍</div>
        <div style={{fontSize:18,color:ADM.white,marginBottom:8}}>Vragenlijst niet gevonden</div>
        <div style={{fontSize:14}}>Controleer de link en probeer opnieuw.</div>
      </div>
    </div>
  );

  const basisStellingen = lijst.stellingen || DEFAULT_STELLINGEN;
  const stellingen = basisStellingen.filter((s) => {
    if (!isGecombineerdeVerdieping(lijst) && !isVerbeterenLerenVerdieping(lijst)) return true;
    if ((isGecombineerdeVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst)) && s.doelgroep) {
      return !rol || s.doelgroep === rol;
    }
    return true;
  });
  const totaal = stellingen.length;
  const huidige = stellingen[stap - 1];
  const voortgang = stap === 0 ? 0 : Math.round((stap / totaal) * 100);

  if (ingediend) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{fontSize:48,marginBottom:20}}>✅</div>
        <div style={{fontSize:24,fontWeight:700,color:ADM.white,marginBottom:12}}>Bedankt!</div>
        <div style={{fontSize:15,color:ADM.muted,lineHeight:1.7,marginBottom:28}}>
          Jouw antwoorden zijn ontvangen. Mijn Teamkompas verwerkt de resultaten en bespreekt deze met het team.
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
          <KompasDot size={28}/>
          <span style={{fontSize:13,color:ADM.muted}}>Mijn Teamkompas</span>
        </div>
      </div>
    </div>
  );

  if (stap === 0) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:480,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:ADM.teal,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,
            margin:"0 auto 16px",boxShadow:"0 0 24px rgba(0,168,150,0.4)"}}>🧭</div>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Mijn Teamkompas</div>
          <div style={{fontSize:22,fontWeight:700,color:ADM.white,marginBottom:10}}>{lijst.naam}</div>
          <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7}}>
            {(isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) ? "Deze verdiepende scan bestaat uit" : "Deze scan bestaat uit"} {totaal} vragen en duurt ongeveer {(isGecombineerdeVerdieping(lijst) ? "10–18" : (isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) ? "6–10" : "5–8")} minuten. Je antwoorden zijn anoniem.
          </div>
        </div>
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Jouw rol</div>
          <div style={{display:"flex",gap:10}}>
            {["Teamlid","Leidinggevende"].map(r=>(
              <div key={r} onClick={()=>setRol(r)}
                style={{flex:1,padding:"10px",borderRadius:8,textAlign:"center",cursor:"pointer",fontSize:14,fontWeight:600,
                  border:`1px solid ${rol===r?ADM.teal:ADM.border}`,
                  background:rol===r?ADM.tealGlow:"transparent",
                  color:rol===r?ADM.teal:ADM.muted}}>
                {r}
              </div>
            ))}
          </div>
          {isGecombineerdeVerdieping(lijst) && (
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:12}}>
              Deze gecombineerde verdiepingsscan bevat meerdere onderdelen. Op basis van jouw rol worden alleen de relevante vragen meegenomen.
            </div>
          )}
        </div>
        <button onClick={()=>{ if(rol) setStap(1); }}
          style={{width:"100%",background:rol?ADM.teal:"rgba(0,168,150,0.3)",color:ADM.navyDeep,
            border:"none",borderRadius:10,padding:"14px",fontWeight:700,fontSize:16,
            cursor:rol?"pointer":"not-allowed"}}>
          Start de scan →
        </button>
      </div>
    </div>
  );

  const kanDoorgaan = huidige.type==="open" || antwoorden[huidige.id] !== undefined;

  return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",flexDirection:"column"}}>
      <div style={{height:4,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",background:ADM.teal,width:`${voortgang}%`,transition:"width .4s"}}/>
      </div>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${ADM.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:PIJLERS[huidige.pijler]?.kleur||ADM.teal,flexShrink:0}}/>
          <span style={{fontSize:12,color:ADM.muted}}>{PIJLERS[huidige.pijler]?.naam}</span>
        </div>
        <span style={{fontSize:12,color:ADM.muted}}>{stap} / {totaal}</span>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
        <div style={{maxWidth:540,width:"100%"}}>
          <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:14}}>
            {huidige.type==="schaal" ? "Geef een score van 1 tot 5" : "Open vraag"}
          </div>
          <div style={{fontSize:20,fontWeight:600,color:ADM.white,lineHeight:1.5,marginBottom:32}}>
            {huidige.tekst}
          </div>
          {huidige.type==="schaal" ? (
            <div>
              <div style={{display:"flex",gap:12,marginBottom:16,justifyContent:"center"}}>
                {[1,2,3,4,5].map(n=>(
                  <div key={n} onClick={()=>slaAntwoordOp(huidige.id,n)}
                    style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:20,fontWeight:700,cursor:"pointer",transition:"all .15s",
                      border:`2px solid ${antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.12)"}`,
                      background:antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.04)",
                      color:antwoorden[huidige.id]===n?ADM.navyDeep:ADM.muted,
                      transform:antwoorden[huidige.id]===n?"scale(1.15)":"scale(1)"}}>
                    {n}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:ADM.muted}}>
                <span>Helemaal mee oneens</span>
                <span>Helemaal mee eens</span>
              </div>
            </div>
          ) : (
            <textarea rows={5} value={antwoorden[huidige.id]||""}
              onChange={e=>slaAntwoordOp(huidige.id,e.target.value)}
              placeholder="Typ hier je antwoord..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",
                border:`1px solid ${ADM.border}`,borderRadius:10,padding:"14px 16px",
                color:ADM.white,fontSize:15,outline:"none",resize:"none",
                boxSizing:"border-box",lineHeight:1.6}}/>
          )}
        </div>
      </div>
      <div style={{padding:"20px 24px",borderTop:`1px solid ${ADM.border}`,
        display:"flex",gap:12,justifyContent:"space-between"}}>
        <button onClick={()=>setStap(s=>Math.max(0,s-1))}
          style={{background:"none",border:`1px solid ${ADM.border}`,color:ADM.muted,
            borderRadius:8,padding:"12px 20px",fontSize:14,cursor:"pointer"}}>
          ← Vorige
        </button>
        {stap < totaal ? (
          <button onClick={()=>{ if(kanDoorgaan) setStap(s=>s+1); }}
            style={{background:kanDoorgaan?ADM.teal:"rgba(0,168,150,0.3)",color:ADM.navyDeep,
              border:"none",borderRadius:8,padding:"12px 24px",fontWeight:700,fontSize:14,
              cursor:kanDoorgaan?"pointer":"not-allowed",flex:1,maxWidth:200}}>
            Volgende →
          </button>
        ) : (
          <button onClick={indienen} disabled={opslaan}
            style={{background:ADM.teal,color:ADM.navyDeep,border:"none",
              borderRadius:8,padding:"12px 24px",fontWeight:700,fontSize:14,
              cursor:opslaan?"wait":"pointer",flex:1,maxWidth:200}}>
            {opslaan ? "Opslaan..." : "Verstuur ✓"}
          </button>
        )}
      </div>
    </div>
  );
}


function isVeiligheidLeiderschapVerdieping(lijst) {
  return lijst?.type === "verdieping_veiligheid_leiderschap";
}

function getVeiligheidLeiderschapDimensies(stellingen = VEILIGHEID_LEIDERSCHAP_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, vragen: [] });
    }
    seen.get(s.dimensieCode).vragen.push(s);
  });
  return Array.from(seen.values());
}

function interpretVeiligheidLeiderschapScore(score) {
  return VEILIGHEID_LEIDERSCHAP_INTERPRETATIE.find((r) => score >= r.min && score <= r.max) || null;
}

function scoreColorByLabel(label) {
  if (label === "Excellentie") return ADM.green;
  if (label === "Kracht") return "#86efac";
  if (label === "Ontwikkelpunt") return ADM.orange;
  if (label === "Aandachtspunt") return ADM.red;
  return ADM.muted;
}

function isVerbeterenLerenVerdieping(lijst) {
  return lijst?.type === "verdieping_verbeteren_leren";
}

function interpretVerbeterenLerenScore(score) {
  return VERBETEREN_LEREN_INTERPRETATIE.find((r) => score >= r.min && score <= r.max) || null;
}

function getVerbeterenLerenDimensies(stellingen = VERBETEREN_LEREN_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    const key = `${s.dimensieCode}_${s.doelgroep}`;
    if (!seen.has(key)) {
      seen.set(key, { key, code: s.dimensieCode, naam: s.dimensie, doelgroep: s.doelgroep, vragen: [] });
    }
    seen.get(key).vragen.push(s);
  });
  return Array.from(seen.values());
}

function isEnergieMotivatieVerdieping(lijst) {
  return lijst?.type === "verdieping_energie_motivatie";
}

function getEnergieMotivatieDimensies(stellingen = ENERGIE_MOTIVATIE_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, deel: s.deel, vragen: [] });
    }
    seen.get(s.dimensieCode).vragen.push(s);
  });
  return Array.from(seen.values());
}

function interpretEnergieMotivatieScore(code, score) {
  const isTaakeisOfUitputting = code.startsWith("A") || code === "C2";

  if (score >= 3 && score <= 6) {
    return isTaakeisOfUitputting
      ? { label: "Laag", advies: "Gunstig: lage belasting of uitputting." }
      : { label: "Laag", advies: "Aandachtspunt: weinig ondersteuning of energie." };
  }
  if (score >= 7 && score <= 10) {
    return isTaakeisOfUitputting
      ? { label: "Matig", advies: "Lichte belasting: bewust blijven volgen." }
      : { label: "Matig", advies: "Ontwikkelzone: versterking gewenst." };
  }
  if (score >= 11 && score <= 13) {
    return isTaakeisOfUitputting
      ? { label: "Hoog", advies: "Aandachtspunt: hoge belasting, interventie overwegen." }
      : { label: "Hoog", advies: "Kracht: sterke hulpbron, borgen en benutten." };
  }
  if (score >= 14 && score <= 15) {
    return isTaakeisOfUitputting
      ? { label: "Zeer hoog", advies: "Urgent: direct actie vereist, risico op uitval." }
      : { label: "Zeer hoog", advies: "Excellent: uitmuntend niveau, inzetten als best practice." };
  }
  return null;
}

function isBelevingVeranderingVerdieping(lijst) {
  return lijst?.type === "verdieping_beleving_verandering";
}

function getBelevingVeranderingDimensies(stellingen = BELEVING_VERANDERING_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, vragen: [] });
    }
    seen.get(s.dimensieCode).vragen.push(s);
  });
  return Array.from(seen.values());
}

function interpretBelevingVeranderingScore(score) {
  if (score >= 3 && score <= 6) {
    return { label: "Rood — Stresszone", advies: "Het brein van medewerkers ervaart waarschijnlijk een dreigingsrespons op dit gebied. Direct aandacht vereist: maak het bespreekbaar en stel een concreet actieplan op." };
  }
  if (score >= 7 && score <= 10) {
    return { label: "Oranje — Ontwikkelzone", advies: "Er is ruimte voor verbetering. De basis is aanwezig, maar medewerkers ervaren nog onvoldoende de voordelen van breinvriendelijk leiderschap op dit punt." };
  }
  if (score >= 11 && score <= 13) {
    return { label: "Groen — Comfortzone", advies: "Het brein ervaart voldoende veiligheid en activatie op dit gebied. Borgen en bewust blijven inzetten." };
  }
  if (score >= 14 && score <= 15) {
    return { label: "Blauw — Excellentiezone", advies: "Optimaal breinvriendelijk leiderschap op dit vlak. Gebruik dit als voorbeeld en deel de werkwijze met andere leidinggevenden." };
  }
  return null;
}

function isGecombineerdeVerdieping(lijst) {
  return lijst?.type === "verdieping_gecombineerd";
}

function getGecombineerdeOnderdelen(lijst) {
  return Array.isArray(lijst?.verdiepingOnderdelen) ? lijst.verdiepingOnderdelen : [];
}

// ─────────────────────────────────────────────
// ADMIN: SCAN BEHEER — Firestore
// ─────────────────────────────────────────────
function PageScans() {
  const [lijsten,    setLijsten]    = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [nieuw,      setNieuw]      = useState({ naam:"", klant:"" });
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [gekopieerd,   setGekopieerd]   = useState(null);
  const [opslaan,      setOpslaan]      = useState(false);
  const [teVerwijderen, setTeVerwijderen] = useState(null);
  const [verwijderen,   setVerwijderen]   = useState(false);

  const laadData = async () => {
    setLoading(true);
    try {
      const [vlSnap, antSnap] = await Promise.all([
        getDocs(collection(db, "vragenlijsten")),
        getDocs(collection(db, "antwoorden")),
      ]);
      setLijsten(vlSnap.docs.map(d=>({ id:d.id, ...d.data() })));
      setAntwoorden(antSnap.docs.map(d=>({ id:d.id, ...d.data() })));
    } catch (err) {
      console.error("Laden mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const maakAan = async () => {
    if (!nieuw.naam || !nieuw.klant) return;
    setOpslaan(true);
    try {
      const data = {
        naam:       nieuw.naam,
        klant:      nieuw.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status:     "Actief",
        stellingen: DEFAULT_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setLijsten(prev => [...prev, { id:ref.id, ...data }]);
      setNieuw({ naam:"", klant:"" });
      setShowForm(false);
    } catch (err) {
      console.error("Aanmaken mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const verwijderScan = async () => {
    if (!teVerwijderen) return;
    setVerwijderen(true);
    try {
      await deleteDoc(doc(db, "vragenlijsten", teVerwijderen.id));
      setLijsten(prev => prev.filter(l => l.id !== teVerwijderen.id));
      setTeVerwijderen(null);
    } catch (err) {
      console.error("Verwijderen mislukt:", err);
    } finally {
      setVerwijderen(false);
    }
  };

  const kopieerLink = async (id) => {
    const url = `${window.location.origin}?scan=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setGekopieerd(id);
      setTimeout(() => setGekopieerd(null), 2000);
    } catch (err) {
      console.error("Kopiëren mislukt:", err);
    }
  };

  const antwoordenVoor = (id) => antwoorden.filter(a=>a.vragenlijstId===id);

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;
  if (geselecteerd) return (
    <ScanResultaten
      lijst={geselecteerd}
      antwoorden={antwoordenVoor(geselecteerd.id)}
      onBack={()=>setGeselecteerd(null)}
    />
  );

  return (
    <div>
      {/* BEVESTIGINGSDIALOOG */}
      {teVerwijderen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(13,27,42,0.85)",
          backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:16,
            padding:"32px",maxWidth:420,width:"100%",boxShadow:"0 40px 100px rgba(0,0,0,0.6)"}}>
            <div style={{fontSize:32,marginBottom:16,textAlign:"center"}}>🗑️</div>
            <div style={{fontSize:17,fontWeight:700,color:ADM.white,marginBottom:8,textAlign:"center"}}>
              Scan verwijderen?
            </div>
            <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65,marginBottom:8,textAlign:"center"}}>
              <strong style={{color:ADM.white}}>{teVerwijderen.naam}</strong>
            </div>
            {antwoordenVoor(teVerwijderen.id).length > 0 && (
              <div style={{fontSize:12,color:ADM.orange,background:"rgba(243,156,18,0.1)",
                padding:"10px 14px",borderRadius:8,marginBottom:16,textAlign:"center"}}>
                ⚠️ Deze scan heeft {antwoordenVoor(teVerwijderen.id).length} ingevulde antwoorden. Die blijven bewaard in Firestore.
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setTeVerwijderen(null)}
                style={{flex:1,background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                  borderRadius:8,padding:"11px",fontSize:13,cursor:"pointer"}}>
                Annuleer
              </button>
              <button onClick={verwijderScan} disabled={verwijderen}
                style={{flex:1,background:ADM.red,color:"#ffffff",border:"none",
                  borderRadius:8,padding:"11px",fontWeight:700,fontSize:13,
                  cursor:verwijderen?"wait":"pointer"}}>
                {verwijderen ? "Verwijderen..." : "Ja, verwijder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{lijsten.length} vragenlijst(en) actief</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,
            padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Nieuwe vragenlijst
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"22px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe vragenlijst aanmaken</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["naam","Naam vragenlijst","bijv. Evides — T1 Meting"],
              ["klant","Klant","bijv. Evides"]
            ].map(([k,l,p])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))} placeholder={p}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,
                    borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={maakAan} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",
                borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {opslaan ? "Aanmaken..." : "Aanmaken"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>Annuleer</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {lijsten.map(lijst => {
          const resp = antwoordenVoor(lijst.id);
          return (
            <div key={lijst.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <div style={{fontWeight:600,color:ADM.white,fontSize:15}}>{lijst.naam}</div>
                    {(isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) && (
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:"rgba(15,118,110,0.14)",color:ADM.teal}}>
                        VERDIEPING
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:12,color:ADM.muted,marginBottom:12}}>
                    🏢 {lijst.klant} · 📅 {lijst.aangemaakt} · {(lijst.stellingen||[]).length} stellingen · {resp.length} ingevuld
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={()=>kopieerLink(lijst.id)}
                      style={{background:gekopieerd===lijst.id?"rgba(46,204,113,0.15)":ADM.tealGlow,
                        color:gekopieerd===lijst.id?ADM.green:ADM.teal,border:"none",borderRadius:6,
                        padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      {gekopieerd===lijst.id ? "✓ Gekopieerd!" : "🔗 Kopieer deelnemerslink"}
                    </button>
                    <button onClick={()=>setGeselecteerd(lijst)}
                      style={{background:"rgba(255,255,255,0.05)",color:ADM.muted,border:`1px solid ${ADM.border}`,
                        borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
                      📊 Bekijk resultaten ({resp.length})
                    </button>
                    <button onClick={()=>setTeVerwijderen(lijst)}
                      style={{background:"rgba(231,76,60,0.1)",color:ADM.red,border:`1px solid rgba(231,76,60,0.25)`,
                        borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      🗑️ Verwijderen
                    </button>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,flexShrink:0,
                  background:"rgba(0,168,150,0.12)",color:ADM.teal}}>{lijst.status}</span>
              </div>
            </div>
          );
        })}
        {lijsten.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center"}}>
            Nog geen vragenlijsten. Maak de eerste aan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN: SCAN RESULTATEN (gap-analyse)
// ─────────────────────────────────────────────
function ScanResultaten({ lijst, antwoorden, onBack }) {
  const [open,    setOpen]    = useState(null);
  const [tabBlad, setTabBlad] = useState("gap");
  const [verdiepingMaken, setVerdiepingMaken] = useState(false);
  const [verdiepingInfo, setVerdiepingInfo] = useState(null);

  const teamleden  = antwoorden.filter(a=>a.rol==="Teamlid");
  const management = antwoorden.filter(a=>a.rol==="Leidinggevende");
  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;

  const gemPijler = (pijlerIdx, subset) => {
    const ids  = stellingen.filter(s=>s.pijler===pijlerIdx && s.type==="schaal").map(s=>s.id);
    const vals = subset.flatMap(a=>ids.map(id=>a.antwoorden?.[id]).filter(Boolean));
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : null;
  };

  const scoreKleur = s => !s||isNaN(s) ? ADM.muted : parseFloat(s)>=4 ? ADM.green : parseFloat(s)>=3 ? ADM.orange : ADM.red;
  const gapKleur   = g => { const a=Math.abs(parseFloat(g)); return a>=1.5?ADM.red:a>=0.8?ADM.orange:ADM.green; };
  const gapLabel   = g => {
    const a=Math.abs(parseFloat(g)), r=parseFloat(g)>0?"Management scoort hoger":"Team scoort hoger";
    return a>=1.5?`⚠️ Grote kloof — ${r}`:a>=0.8?`📍 Merkbaar verschil — ${r}`:`✓ Kleine kloof — ${r}`;
  };

  const tabStijl = (t) => ({
    padding:"10px 14px", fontSize:12, fontWeight:tabBlad===t?700:400, cursor:"pointer",
    border:"none", borderBottom:`3px solid ${tabBlad===t?ADM.teal:"transparent"}`,
    background:"transparent", color:tabBlad===t?ADM.teal:ADM.muted, whiteSpace:"nowrap",
  });

  const ScoresBalk = ({ subset, kleur }) => (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
      {PIJLERS.map((p,i)=>{
        const gem = gemPijler(i, subset);
        return (
          <div key={i} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:p.kleur,flexShrink:0}}/>
              <div style={{fontSize:11,color:ADM.text,fontWeight:600,lineHeight:1.3}}>{p.naam}</div>
            </div>
            <div style={{fontSize:26,fontWeight:700,color:kleur,marginBottom:6,lineHeight:1}}>{gem||"—"}</div>
            <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,width:gem?`${(parseFloat(gem)/5)*100}%`:"0%",background:kleur}}/>
            </div>
          </div>
        );
      })}
    </div>
  );


  const maakVerdiependeScan = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping veiligheid en leiderschap`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_veiligheid_leiderschap",
        parentVragenlijstId: lijst.id,
        stellingen: VEILIGHEID_LEIDERSCHAP_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), veiligheid: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const maakVerdiepingVerbeterenLeren = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping verbeteren en leren`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_verbeteren_leren",
        parentVragenlijstId: lijst.id,
        stellingen: VERBETEREN_LEREN_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), verbeterenLeren: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan verbeteren en leren aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const veiligheidScoreTeam = gemPijler(0, teamleden);
  const veiligheidScoreManagement = gemPijler(0, management);
  const verbeterenLerenScoreTeam = gemPijler(3, teamleden);
  const verbeterenLerenScoreManagement = gemPijler(3, management);

  const energieMotivatieScoreTeam = gemPijler(2, teamleden);
  const energieMotivatieScoreManagement = gemPijler(2, management);

  const belevingVeranderingScoreTeam = gemPijler(1, teamleden);
  const belevingVeranderingScoreManagement = gemPijler(1, management);

  const maakVerdiepingBelevingVerandering = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping beleving van verandering`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_beleving_verandering",
        parentVragenlijstId: lijst.id,
        stellingen: BELEVING_VERANDERING_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), belevingVerandering: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan beleving van verandering aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const maakVerdiepingEnergieMotivatie = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping energie en motivatie`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_energie_motivatie",
        parentVragenlijstId: lijst.id,
        stellingen: ENERGIE_MOTIVATIE_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), energieMotivatie: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan energie en motivatie aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const veiligheidAandacht =
    (veiligheidScoreTeam && parseFloat(veiligheidScoreTeam) < 3.5) ||
    (veiligheidScoreManagement && parseFloat(veiligheidScoreManagement) < 3.5) ||
    (!veiligheidScoreManagement && veiligheidScoreTeam && parseFloat(veiligheidScoreTeam) < 3.5);

  const verbeterenLerenAandacht =
    (verbeterenLerenScoreTeam && parseFloat(verbeterenLerenScoreTeam) < 3.5) ||
    (verbeterenLerenScoreManagement && parseFloat(verbeterenLerenScoreManagement) < 3.5) ||
    (!verbeterenLerenScoreManagement && verbeterenLerenScoreTeam && parseFloat(verbeterenLerenScoreTeam) < 3.5);

  const energieMotivatieAandacht =
    (energieMotivatieScoreTeam && parseFloat(energieMotivatieScoreTeam) < 3.5) ||
    (energieMotivatieScoreManagement && parseFloat(energieMotivatieScoreManagement) < 3.5) ||
    (!energieMotivatieScoreManagement && energieMotivatieScoreTeam && parseFloat(energieMotivatieScoreTeam) < 3.5);

  const belevingVeranderingAandacht =
    (belevingVeranderingScoreTeam && parseFloat(belevingVeranderingScoreTeam) < 3.5) ||
    (belevingVeranderingScoreManagement && parseFloat(belevingVeranderingScoreManagement) < 3.5) ||
    (!belevingVeranderingScoreManagement && belevingVeranderingScoreTeam && parseFloat(belevingVeranderingScoreTeam) < 3.5);

  const VerdieningIntro = () => {
    const onderdelen = [
      veiligheidAandacht ? "veiligheid_leiderschap" : null,
      verbeterenLerenAandacht ? "verbeteren_leren" : null,
      energieMotivatieAandacht ? "energie_motivatie" : null,
      belevingVeranderingAandacht ? "beleving_verandering" : null,
    ].filter(Boolean);

    const heeftMeerdere = onderdelen.length > 1;

    const maakGecombineerdeVerdieping = async () => {
      setVerdiepingMaken(true);
      try {
        const data = {
          naam: `${lijst.klant} — ${gecombineerdeVerdiepingTitel(onderdelen)}`,
          klant: lijst.klant,
          aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
          status: "Actief",
          type: "verdieping_gecombineerd",
          parentVragenlijstId: lijst.id,
          verdiepingOnderdelen: onderdelen,
          stellingen: flattenVerdiepingStellingen(onderdelen),
        };
        const ref = await addDoc(collection(db, "vragenlijsten"), data);
        setVerdiepingInfo(prev => ({ ...(prev || {}), gecombineerd: { id: ref.id, ...data } }));
      } catch (err) {
        console.error("Gecombineerde verdiepende scan aanmaken mislukt:", err);
      } finally {
        setVerdiepingMaken(false);
      }
    };

    return (
      <div style={{background:"rgba(15,118,110,0.08)",border:`1px solid ${ADM.tealGlow}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
        <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
          Vervolgonderzoek
        </div>
        <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:8}}>
          Verdiepende scans beschikbaar
        </div>
        <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65,marginBottom:14}}>
          Start vanuit de basisscan een verdiepende meting op het domein dat extra aandacht vraagt.
          {heeftMeerdere && " Omdat meerdere domeinen aandacht vragen, kun je ook één gecombineerde verdiepingslink maken."}
        </div>

        {heeftMeerdere && (
          <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:ADM.white,marginBottom:8}}>
              Gecombineerde verdiepingsscan
            </div>
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
              Combineert: {onderdelen.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean).join(" + ")}
            </div>
            {verdiepingInfo?.gecombineerd ? (
              <button
                onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.gecombineerd.id}`); } catch {} }}
                style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}
              >
                🔗 Kopieer gecombineerde deelnemerslink
              </button>
            ) : (
              <button
                onClick={maakGecombineerdeVerdieping}
                disabled={verdiepingMaken}
                style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}
              >
                {verdiepingMaken ? "Aanmaken..." : "Maak één gecombineerde verdiepingslink"}
              </button>
            )}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
          {veiligheidAandacht && (
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:6}}>Veiligheid en leiderschap</div>
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
                Gebaseerd op de 9 Secure Base Leadership-dimensies.
              </div>
              {verdiepingInfo?.veiligheid ? (
                <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.veiligheid.id}`); } catch {} }}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  🔗 Kopieer deelnemerslink
                </button>
              ) : (
                <button onClick={maakVerdiependeScan} disabled={verdiepingMaken}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}>
                  {verdiepingMaken ? "Aanmaken..." : "Start verdiepende scan veiligheid en leiderschap"}
                </button>
              )}
            </div>
          )}

          {verbeterenLerenAandacht && (
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:6}}>Verbeteren en leren</div>
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
                Lean- en Agile-volwassenheid vanuit twee perspectieven: leidinggevende en teamspiegel.
              </div>
              {verdiepingInfo?.verbeterenLeren ? (
                <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.verbeterenLeren.id}`); } catch {} }}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  🔗 Kopieer deelnemerslink
                </button>
              ) : (
                <button onClick={maakVerdiepingVerbeterenLeren} disabled={verdiepingMaken}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}>
                  {verdiepingMaken ? "Aanmaken..." : "Start verdiepende scan verbeteren en leren"}
                </button>
              )}
            </div>
          )}

          {energieMotivatieAandacht && (
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:6}}>Energie en motivatie</div>
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
                JD-R verdieping op taakeisen, hulpbronnen, bevlogenheid en uitputting.
              </div>
              {verdiepingInfo?.energieMotivatie ? (
                <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.energieMotivatie.id}`); } catch {} }}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  🔗 Kopieer deelnemerslink
                </button>
              ) : (
                <button onClick={maakVerdiepingEnergieMotivatie} disabled={verdiepingMaken}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}>
                  {verdiepingMaken ? "Aanmaken..." : "Start verdiepende scan energie en motivatie"}
                </button>
              )}
            </div>
          )}

          {belevingVeranderingAandacht && (
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:6}}>Beleving van verandering</div>
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
                Neuromanagement-verdieping op breinvriendelijk leiderschap en SCARF-gerelateerde dimensies.
              </div>
              {verdiepingInfo?.belevingVerandering ? (
                <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.belevingVerandering.id}`); } catch {} }}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  🔗 Kopieer deelnemerslink
                </button>
              ) : (
                <button onClick={maakVerdiepingBelevingVerandering} disabled={verdiepingMaken}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}>
                  {verdiepingMaken ? "Aanmaken..." : "Start verdiepende scan beleving van verandering"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const DeelnemersLijst = ({ subset }) => (
    <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,overflow:"hidden"}}>
      {subset.map(a=>(
        <div key={a.id}>
          <div onClick={()=>setOpen(open===a.id?null:a.id)}
            style={{padding:"14px 20px",borderBottom:`1px solid rgba(255,255,255,0.04)`,cursor:"pointer",
              background:open===a.id?ADM.tealGlow:"transparent",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,color:ADM.white,fontSize:13}}>
                Anoniem
                <span style={{fontSize:11,color:a.rol==="Leidinggevende"?"#a78bfa":ADM.muted,fontWeight:400,marginLeft:6}}>({a.rol})</span>
              </div>
            </div>
            <span style={{color:ADM.teal,fontSize:13}}>{open===a.id?"▲":"▼"}</span>
          </div>
          {open===a.id && (
            <div style={{padding:"16px 20px",background:"rgba(0,0,0,0.15)",borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
              {stellingen.map(s=>(
                <div key={s.id} style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:ADM.muted,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:PIJLERS[s.pijler]?.kleur,flexShrink:0}}/>
                    {s.tekst}
                  </div>
                  {s.type==="schaal" ? (
                    <div style={{display:"flex",gap:5}}>
                      {[1,2,3,4,5].map(n=>(
                        <div key={n} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",
                          justifyContent:"center",fontSize:12,fontWeight:700,
                          background:a.antwoorden?.[s.id]===n?ADM.teal:"rgba(255,255,255,0.05)",
                          color:a.antwoorden?.[s.id]===n?ADM.navyDeep:ADM.muted}}>{n}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 14px",borderRadius:8}}>
                      {a.antwoorden?.[s.id]||<em style={{color:ADM.muted}}>Geen antwoord</em>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {subset.length === 0 && (
        <div style={{padding:24,color:ADM.muted,fontSize:13,textAlign:"center"}}>Nog geen deelnemers.</div>
      )}
    </div>
  );

  if (isGecombineerdeVerdieping(lijst)) {
    const onderdelen = getGecombineerdeOnderdelen(lijst);

    return (
      <div>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · gecombineerde verdiepingsscan
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Gecombineerde scan
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Deze scan combineert meerdere verdiepende onderdelen in één deelnemerslink:
            <strong style={{color:ADM.white}}> {onderdelen.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean).join(" + ")}</strong>.
            De inhoudelijke interpretatie gebeurt per onderdeel.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {onderdelen.map((k) => (
            <div key={k} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
              <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:6}}>
                {VERDIEPING_BLOKKEN[k]?.titel}
              </div>
              <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65}}>
                Gebruik dezelfde deelnemerslink om dit onderdeel mee te nemen. Open de resultaten later opnieuw om de scores en interpretatie per verdiepend onderdeel te bekijken.
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isBelevingVeranderingVerdieping(lijst)) {
    const dimensies = getBelevingVeranderingDimensies(stellingen);

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const gem = scoreGemiddelde(ids, antwoorden);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretBelevingVeranderingScore(totaal) : null;
      return { ...d, gem, totaal, interpretatie };
    });

    const kleurVanLabel = (label) => {
      if (label?.startsWith("Rood")) return ADM.red;
      if (label?.startsWith("Oranje")) return ADM.orange;
      if (label?.startsWith("Groen")) return ADM.green;
      if (label?.startsWith("Blauw")) return PUB.blauw;
      return ADM.muted;
    };

    return (
      <div>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · neurowetenschappelijke verdieping op leiderschap en veranderbeleving
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = rood, 7–10 = oranje, 11–13 = groen, 14–15 = blauw.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur = kleurVanLabel(d.interpretatie?.label);
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>{d.interpretatie.label}</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Betekenis & aanbeveling:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {BELEVING_VERANDERING_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEnergieMotivatieVerdieping(lijst)) {
    const dimensies = getEnergieMotivatieDimensies(stellingen);

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const gem = scoreGemiddelde(ids, antwoorden);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
      return { ...d, gem, totaal, interpretatie };
    });

    const somDeel = (prefix) => dimensieScores.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
    const somTaakeisen = somDeel("A");
    const somHulpbronnen = somDeel("B");
    const balans = somTaakeisen - somHulpbronnen;

    let balansLabel = "In balans";
    let balansUitleg = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    let balansKleur = ADM.green;
    if (balans < -20) {
      balansLabel = "Sterk negatief";
      balansUitleg = "Hulpbronnen domineren: zeer gunstig. Kans op bevlogenheid is hoog.";
      balansKleur = ADM.green;
    } else if (balans >= -20 && balans <= 0) {
      balansLabel = "In balans";
      balansUitleg = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
      balansKleur = "#86efac";
    } else if (balans > 0 && balans <= 20) {
      balansLabel = "Lichte onbalans";
      balansUitleg = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
      balansKleur = ADM.orange;
    } else if (balans > 20) {
      balansLabel = "Taakeisen domineren";
      balansUitleg = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist.";
      balansKleur = ADM.red;
    }

    return (
      <div>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · JD-R verdieping op belasting, hulpbronnen en uitkomsten
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Totaal taakeisen</div>
            <div style={{fontSize:28,fontWeight:700,color:ADM.orange}}>{somTaakeisen}</div>
          </div>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Totaal hulpbronnen</div>
            <div style={{fontSize:28,fontWeight:700,color:ADM.green}}>{somHulpbronnen}</div>
          </div>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Balans A − B</div>
            <div style={{fontSize:28,fontWeight:700,color:balansKleur}}>{balans > 0 ? `+${balans}` : balans}</div>
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Balansanalyse
          </div>
          <div style={{fontSize:14,fontWeight:700,color:balansKleur,marginBottom:6}}>{balansLabel}</div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>{balansUitleg}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur =
              d.code.startsWith("A") || d.code === "C2"
                ? (d.totaal >= 14 ? ADM.red : d.totaal >= 11 ? ADM.orange : "#86efac")
                : (d.totaal >= 14 ? ADM.green : d.totaal >= 11 ? "#86efac" : d.totaal >= 7 ? ADM.orange : ADM.red);

            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code} · {d.deel}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>{d.interpretatie.label}</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Betekenis:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ENERGIE_MOTIVATIE_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isVerbeterenLerenVerdieping(lijst)) {
    const dimensies = getVerbeterenLerenDimensies(stellingen);
    const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
    const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieGroepen = ["L1","L2","L3","L4","A1","A2","A3","A4"].map(code => {
      const leidinggevendeDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
      const teamDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
      const leidinggevendeGem = leidinggevendeDim ? scoreGemiddelde(leidinggevendeDim.vragen.map(v=>v.id), leidinggevendeAntwoorden) : null;
      const teamGem = teamDim ? scoreGemiddelde(teamDim.vragen.map(v=>v.id), teamAntwoorden) : null;
      const leidinggevendeTotaal = leidinggevendeGem !== null ? Math.round(leidinggevendeGem * 3) : null;
      const teamTotaal = teamGem !== null ? Math.round(teamGem * 3) : null;
      const verschil = leidinggevendeTotaal !== null && teamTotaal !== null ? leidinggevendeTotaal - teamTotaal : null;
      const interpretLeiding = leidinggevendeTotaal !== null ? interpretVerbeterenLerenScore(leidinggevendeTotaal) : null;
      const interpretTeam = teamTotaal !== null ? interpretVerbeterenLerenScore(teamTotaal) : null;
      return {
        code,
        naam: leidinggevendeDim?.naam || teamDim?.naam || code,
        leidinggevendeDim,
        teamDim,
        leidinggevendeTotaal,
        teamTotaal,
        verschil,
        interpretLeiding,
        interpretTeam,
      };
    });

    return (
      <div>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · Lean- en Agile-volwassenheid vanuit leidinggevende en teamspiegel
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = beginner, 7–9 = lerend, 10–12 = ontwikkelend, 13–15 = volwassen.
            Een verschil groter dan 3 punten tussen leidinggevende en team is betekenisvol en verdient bespreking.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieGroepen.map((d)=> {
            const verschilBetekenisvol = d.verschil !== null && Math.abs(d.verschil) > 3;
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  {verschilBetekenisvol && (
                    <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${ADM.orange}22`,color:ADM.orange}}>
                      Verschil {d.verschil > 0 ? "+" : ""}{d.verschil}
                    </span>
                  )}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Leidinggevende</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{fontSize:24,fontWeight:700,color:scoreColorByLabel(d.interpretLeiding?.label)}}>{d.leidinggevendeTotaal ?? "—"}</div>
                      {d.interpretLeiding && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${scoreColorByLabel(d.interpretLeiding.label)}22`,color:scoreColorByLabel(d.interpretLeiding.label)}}>{d.interpretLeiding.label}</span>}
                    </div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                      {d.interpretLeiding?.advies || "Nog onvoldoende data voor interpretatie."}
                    </div>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Teamspiegel</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{fontSize:24,fontWeight:700,color:scoreColorByLabel(d.interpretTeam?.label)}}>{d.teamTotaal ?? "—"}</div>
                      {d.interpretTeam && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${scoreColorByLabel(d.interpretTeam.label)}22`,color:scoreColorByLabel(d.interpretTeam.label)}}>{d.interpretTeam.label}</span>}
                    </div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                      {d.interpretTeam?.advies || "Nog onvoldoende data voor interpretatie."}
                    </div>
                  </div>
                </div>

                {verschilBetekenisvol && (
                  <div style={{fontSize:12,color:ADM.orange,lineHeight:1.65,background:"rgba(243,156,18,0.08)",padding:"10px 12px",borderRadius:8}}>
                    Deze dimensie laat een betekenisvol verschil zien tussen zelfreflectie van de leidinggevende en de teamspiegel. Gebruik dit als gespreksthema.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {VERBETEREN_LEREN_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isVeiligheidLeiderschapVerdieping(lijst)) {
    const dimensies = getVeiligheidLeiderschapDimensies(stellingen);
    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const totaalGem = scoreGemiddelde(ids, antwoorden);
      const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
      const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(totaal) : null;
      return { ...d, totaalGem, totaal, interpretatie };
    });

    return (
      <div>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · verdiepende scan veiligheid en leiderschap
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = aandachtspunt, 7–10 = ontwikkelpunt, 11–13 = kracht, 14–15 = excellentie.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur = scoreColorByLabel(d.interpretatie?.label);
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && (
                      <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>
                        {d.interpretatie.label}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:12}}>
                  {d.vragen.map(v => {
                    const avg = scoreGemiddelde([v.id], antwoorden);
                    return (
                      <div key={v.id} style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{fontSize:12,color:ADM.text,flex:1,lineHeight:1.5}}>{v.tekst}</div>
                        <div style={{width:42,textAlign:"right",fontSize:13,fontWeight:700,color:avg !== null ? ADM.white : ADM.muted}}>
                          {avg !== null ? avg.toFixed(1) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Aanbeveling:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,
        fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
        ← Terug naar vragenlijsten
      </button>
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
        <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
          {antwoorden.length} deelnemers · {teamleden.length} teamleden · {management.length} leidinggevenden · {lijst.klant}
        </div>
        {(veiligheidAandacht || verbeterenLerenAandacht || energieMotivatieAandacht || belevingVeranderingAandacht) && <VerdieningIntro /> }
        <div style={{display:"flex",borderBottom:`1px solid ${ADM.border}`,overflowX:"auto"}}>
          {[["gap","🔍 Gap-analyse"],["team","👥 Team"],["management","👔 Management"],["individueel","📋 Individueel"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTabBlad(v)} style={tabStijl(v)}>{l}</button>
          ))}
        </div>
      </div>

      {tabBlad==="gap" && (
        <div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7,marginBottom:20,
            background:"rgba(0,168,150,0.06)",padding:"12px 16px",borderRadius:10,
            borderLeft:`3px solid ${ADM.teal}`}}>
            De <strong style={{color:ADM.white}}>gap-analyse</strong> toont het verschil tussen hoe het{" "}
            <strong style={{color:"#86efac"}}>team</strong> en het{" "}
            <strong style={{color:"#a78bfa"}}>management</strong> de situatie beleeft.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {PIJLERS.map((p,i)=>{
              const gT = parseFloat(gemPijler(i, teamleden));
              const gM = parseFloat(gemPijler(i, management));
              const gap = (!isNaN(gT)&&!isNaN(gM)) ? (gM-gT).toFixed(1) : null;
              return (
                <div key={i} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:p.kleur,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:ADM.white,fontSize:14}}>{p.naam}</span>
                    </div>
                    {gap && <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                      background:`${gapKleur(gap)}22`,color:gapKleur(gap)}}>
                      Gap: {parseFloat(gap)>0?"+":""}{gap}
                    </span>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                    {[["👥 Team","#86efac",gT],["👔 Management","#a78bfa",gM]].map(([label,kleur,score])=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:11,color:kleur,fontWeight:600,width:100,flexShrink:0}}>{label}</div>
                        <div style={{flex:1,height:9,background:"rgba(255,255,255,0.06)",borderRadius:5,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:5,background:kleur,width:isNaN(score)?"0%":`${(score/5)*100}%`}}/>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:kleur,width:28,textAlign:"right"}}>
                          {isNaN(score)?"—":score.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {gap && <div style={{fontSize:12,color:gapKleur(gap),background:`${gapKleur(gap)}11`,padding:"8px 12px",borderRadius:8}}>
                    {gapLabel(gap)}
                  </div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tabBlad==="team"        && <><ScoresBalk subset={teamleden}  kleur="#86efac"/><DeelnemersLijst subset={teamleden}/></>}
      {tabBlad==="management"  && <><ScoresBalk subset={management} kleur="#a78bfa"/><DeelnemersLijst subset={management}/></>}
      {tabBlad==="individueel" && <DeelnemersLijst subset={antwoorden}/>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN: CONTACTAANVRAGEN — echte Firestore-data
// ─────────────────────────────────────────────
function PageContactaanvragen() {
  const [aanvragen, setAanvragen] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const laadAanvragen = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "contactaanvragen"), orderBy("aangemaakt_op", "desc"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const datum = data.aangemaakt_op?.toDate?.().toLocaleDateString("nl-NL", {
            day: "numeric", month: "short", year: "numeric",
          }) || "-";
          return {
            id: d.id,
            naam: data.naam || "",
            org: data.organisatie || "",
            email: data.email || "",
            tel: data.telefoon || "",
            bericht: data.bericht || "",
            datum,
            status: data.status || "Nieuw",
          };
        });
        setAanvragen(rows);
      } catch (err) {
        console.error("Fout bij laden contactaanvragen:", err);
      } finally {
        setLoading(false);
      }
    };
    laadAanvragen();
  }, []);

  const updateStatus = async (id, nieuweStatus) => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, "contactaanvragen", id), { status: nieuweStatus });
      setAanvragen(prev => prev.map(a => a.id === id ? { ...a, status: nieuweStatus } : a));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: nieuweStatus }));
    } catch (err) {
      console.error("Status bijwerken mislukt:", err);
    } finally {
      setUpdating(null);
    }
  };

  const statusColor = (s) =>
    s === "Nieuw" ? ADM.teal : s === "In behandeling" ? ADM.orange : s === "Verwerkt" ? ADM.green : ADM.muted;

  const statusBg = (s) =>
    s === "Nieuw" ? "rgba(0,168,150,0.12)"
    : s === "In behandeling" ? "rgba(243,156,18,0.12)"
    : s === "Verwerkt" ? "rgba(46,204,113,0.12)"
    : "rgba(255,255,255,0.05)";

  if (loading) return <div style={{ color: ADM.muted, padding: 20 }}>Laden...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: ADM.muted, marginBottom: 20 }}>
          {aanvragen.filter(a => a.status === "Nieuw").length} nieuwe aanvragen ·{" "}
          {aanvragen.filter(a => a.status === "In behandeling").length} in behandeling ·{" "}
          {aanvragen.length} totaal
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aanvragen.map((a) => (
            <div key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              style={{
                background: a.status === "Verwerkt" ? "rgba(255,255,255,0.02)" : ADM.navy,
                border: `1px solid ${selected?.id === a.id ? ADM.teal : ADM.border}`,
                borderRadius: 12, padding: "18px 22px", cursor: "pointer",
                opacity: a.status === "Verwerkt" ? 0.65 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: ADM.white, fontSize: 15 }}>{a.naam}</div>
                  <div style={{ fontSize: 12, color: ADM.muted, marginTop: 2 }}>{a.org} · {a.datum}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: statusBg(a.status), color: statusColor(a.status), flexShrink: 0 }}>
                  {a.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {a.bericht}
              </div>
            </div>
          ))}
          {aanvragen.length === 0 && (
            <div style={{ color: ADM.muted, fontSize: 14, padding: 20, textAlign: "center" }}>
              Nog geen contactaanvragen ontvangen.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div style={{ background: ADM.navy, border: `1px solid ${ADM.border}`, borderRadius: 12, padding: "24px", height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: ADM.white, fontSize: 16 }}>Detail</div>
            <span onClick={() => setSelected(null)} style={{ cursor: "pointer", color: ADM.muted, fontSize: 20 }}>×</span>
          </div>

          {/* Status badge */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              background: statusBg(selected.status), color: statusColor(selected.status) }}>
              {selected.status}
            </span>
          </div>

          {[["Naam", selected.naam], ["Organisatie", selected.org], ["E-mail", selected.email], ["Telefoon", selected.tel || "-"]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: ADM.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, color: ADM.white }}>{v}</div>
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: ADM.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Bericht</div>
            <div style={{ fontSize: 13, color: ADM.text, lineHeight: 1.7, background: "rgba(255,255,255,0.04)", padding: "12px 14px", borderRadius: 8 }}>
              {selected.bericht}
            </div>
          </div>

          {/* Acties */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href={`mailto:${selected.email}`}
              style={{ display: "block", width: "100%", background: ADM.teal, color: ADM.navyDeep,
                border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
              Reageer via e-mail
            </a>

            {selected.status !== "In behandeling" && selected.status !== "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "In behandeling"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(243,156,18,0.15)", color: ADM.orange,
                  border: `1px solid rgba(243,156,18,0.3)`, borderRadius: 8, padding: "11px",
                  fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                📋 Markeer als in behandeling
              </button>
            )}

            {selected.status !== "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "Verwerkt"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(46,204,113,0.15)", color: ADM.green,
                  border: `1px solid rgba(46,204,113,0.3)`, borderRadius: 8, padding: "11px",
                  fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {updating === selected.id ? "Opslaan..." : "✓ Markeer als verwerkt"}
              </button>
            )}

            {selected.status === "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "Nieuw"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", color: ADM.muted,
                  border: `1px solid ${ADM.border}`, borderRadius: 8, padding: "11px",
                  fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                ↩ Zet terug naar nieuw
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageKlanten() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [klanten, setKlanten] = useState([]);
  const [vragenlijsten, setVragenlijsten] = useState([]);
  const [metingen, setMetingen] = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [contactaanvragen, setContactaanvragen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTrajectForm, setShowTrajectForm] = useState(false);
  const [showMetingForm, setShowMetingForm] = useState(false);
  const [opslaan, setOpslaan] = useState(false);
  const [opslaanTraject, setOpslaanTraject] = useState(false);
  const [opslaanMeting, setOpslaanMeting] = useState(false);
  const [selectedKlant, setSelectedKlant] = useState(null);
  const [selectedTrajectId, setSelectedTrajectId] = useState(null);
  const [selectedMetingId, setSelectedMetingId] = useState(null);
  const [nieuw, setNieuw] = useState({ naam:"", sector:"", contact:"", email:"", status:"Actief" });
  const [nieuwTraject, setNieuwTraject] = useState({ naam:"", status:"Actief" });
  const [nieuweMeting, setNieuweMeting] = useState({
    trajectId:"",
    trajectNaam:"",
    type:"T1 Meting",
    datum:"",
    respondenten:"",
    scores:{}
  });

  const pijlerNamenMeting = ["Veiligheid & Leiderschap","Beleving van Verandering","Energie & Motivatie","Verbeteren & Leren","Gedrag (centraal)"];

  const parseDateFlexible = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      const d1 = new Date(val);
      if (!Number.isNaN(d1.getTime())) return d1;
      const m = val.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/) || val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const d2 = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        if (!Number.isNaN(d2.getTime())) return d2;
      }
    }
    if (val?.seconds) return new Date(val.seconds * 1000);
    return null;
  };

  const fmtDate = (val) => {
    const d = parseDateFlexible(val);
    return d ? d.toLocaleDateString("nl-NL") : (typeof val === "string" ? val : "—");
  };

  const laadData = async () => {
    setLoading(true);
    try {
      const [klantenSnap, vragenlijstenSnap, metingenSnap, antwoordenSnap, contactSnap] = await Promise.all([
        getDocs(collection(db, "klanten")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "vragenlijsten")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "metingen")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "antwoorden")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "contactaanvragen")).catch(() => ({ docs: [] })),
      ]);

      const klantenDb = klantenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const vragenlijstenDb = vragenlijstenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => !v.verwijderd && v.status !== "Verwijderd");
      const metingenDb = metingenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const antwoordenDb = antwoordenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const contactDb = contactSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const klantNamen = Array.from(new Set([
        ...klantenDb.map(k => k.naam).filter(Boolean),
        ...vragenlijstenDb.map(v => v.klant).filter(Boolean),
        ...metingenDb.map(m => m.klant).filter(Boolean),
        ...contactDb.map(c => c.organisatie || c.bedrijf || c.klant).filter(Boolean),
      ]));

      const opgebouwd = klantNamen.map((naam, idx) => {
        const basis = klantenDb.find(k => k.naam === naam) || {};
        const klantTrajecten = vragenlijstenDb.filter(v => v.klant === naam);
        const klantMetingen = metingenDb.filter(m => m.klant === naam);
        const klantContact = contactDb.filter(c => (c.organisatie || c.bedrijf || c.klant) === naam);
        const antwoordenCount = antwoordenDb.filter(a => klantTrajecten.some(v => v.id === a.vragenlijstId)).length;

        const gemTrajectScoreBron = antwoordenDb
          .filter(a => klantTrajecten.some(v => v.id === a.vragenlijstId))
          .map(a => {
            const vals = Object.values(a.antwoorden || {}).map(v => parseFloat(v)).filter(v => !Number.isNaN(v));
            return vals.length ? vals.reduce((s,v) => s + v, 0) / vals.length : null;
          })
          .filter(v => v !== null);

        const score = gemTrajectScoreBron.length
          ? (gemTrajectScoreBron.reduce((s,v) => s + v, 0) / gemTrajectScoreBron.length)
          : null;

        return {
          id: basis.id || `klant-${idx}`,
          naam,
          sector: basis.sector || "",
          contact: basis.contact || "",
          email: basis.email || "",
          status: basis.status || (klantTrajecten.length ? "Actief" : "In gesprek"),
          score,
          fase: klantTrajecten.length ? `${klantTrajecten.length} traject(en)` : "Intake",
          startdatum: basis.startdatum || (klantTrajecten[0]?.aangemaakt || "—"),
          team: antwoordenCount,
          trajecten: klantTrajecten,
          metingen: klantMetingen,
          contactmomenten: klantContact,
        };
      }).sort((a,b) => a.naam.localeCompare(b.naam, "nl"));

      setKlanten(opgebouwd);
      setVragenlijsten(vragenlijstenDb);
      setMetingen(metingenDb);
      setAntwoorden(antwoordenDb);
      setContactaanvragen(contactDb);

      setSelectedKlant(prev => {
        if (!opgebouwd.length) return null;
        if (!prev) return opgebouwd[0];
        return opgebouwd.find(k => k.naam === prev.naam) || opgebouwd[0];
      });
    } catch (err) {
      console.error("Laden klanten mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const voegToe = async () => {
    if (!nieuw.naam || !nieuw.contact) return;
    setOpslaan(true);
    try {
      await addDoc(collection(db, "klanten"), {
        ...nieuw,
        startdatum: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
      });
      setNieuw({ naam:"", sector:"", contact:"", email:"", status:"Actief" });
      setShowForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan klant mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const startNieuwTraject = async () => {
    if (!selectedKlant || !nieuwTraject.naam) return;
    setOpslaanTraject(true);
    try {
      await addDoc(collection(db, "vragenlijsten"), {
        naam: nieuwTraject.naam,
        klant: selectedKlant.naam,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: nieuwTraject.status || "Actief",
        type: "basisscan",
        stellingen: DEFAULT_STELLINGEN,
      });
      setNieuwTraject({ naam:"", status:"Actief" });
      setShowTrajectForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan traject mislukt:", err);
    } finally {
      setOpslaanTraject(false);
    }
  };

  const kiesMetingTraject = (trajectId) => {
    const traject = (selectedKlant?.trajecten || []).find(t => t.id === trajectId);
    setNieuweMeting(prev => ({
      ...prev,
      trajectId,
      trajectNaam: traject?.naam || "",
    }));
  };

  const voegMetingToe = async () => {
    if (!selectedKlant || !nieuweMeting.datum) return;
    setOpslaanMeting(true);
    try {
      await addDoc(collection(db, "metingen"), {
        klant: selectedKlant.naam,
        trajectId: nieuweMeting.trajectId || null,
        trajectNaam: nieuweMeting.trajectNaam || null,
        type: nieuweMeting.type || "T1 Meting",
        datum: nieuweMeting.datum,
        respondenten: parseInt(nieuweMeting.respondenten) || 0,
        scores: Object.fromEntries(
          pijlerNamenMeting.map(p => [p, nieuweMeting.scores[p] === undefined || nieuweMeting.scores[p] === "" ? null : parseFloat(nieuweMeting.scores[p])])
        ),
        status: "Compleet",
        aangemaakt_op: serverTimestamp(),
      });
      setNieuweMeting({ trajectId:"", trajectNaam:"", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
      setShowMetingForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan meting mislukt:", err);
    } finally {
      setOpslaanMeting(false);
    }
  };

  const downloadBasisRapport = (traj, resp) => {
    const now = new Date();
    const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    const averages = [0,1,2,3,4].map(pi => {
      const ids = (traj.stellingen || DEFAULT_STELLINGEN).filter(s => s.pijler === pi && s.type === "schaal").map(s => s.id);
      const vals = resp.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((s,v)=>s+parseFloat(v),0) / vals.length) : null;
    });

    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${traj.naam}</title>${standaardRapportCss()}</head><body>
    ${standaardRapportHeader({ titel: traj.naam, klant: traj.klant, instrument: "Basisscan", respondenten: resp.length, datum })}
    <div class="content">
      <div class="section">
        <div class="section-title">Samenvatting per domein</div>
        ${["Veiligheid & Leiderschap","Beleving van Verandering","Energie & Motivatie","Verbeteren & Leren","Gedrag (centraal)"].map((naam, i) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <div style="font-size:16px;font-weight:700;color:#0D1B2A">${naam}</div>
              <div style="font-size:24px;font-weight:700;color:${averages[i] !== null ? (averages[i] >= 4 ? "#2ecc71" : averages[i] >= 3 ? "#f39c12" : "#e74c3c") : "#6B7A8D"}">
                ${averages[i] !== null ? averages[i].toFixed(1) : "—"}
              </div>
            </div>
          </div>`).join("")}
      </div>
    </div>
    <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;
    downloadHtmlRapport(`rapportage-basisscan-${traj.klant.toLowerCase().replace(/\s+/g, "-")}-${traj.naam.toLowerCase().replace(/\s+/g, "-")}.html`, html);
  };

  const openRapportageVoorTraject = (traj) => {
    const resp = antwoorden.filter(a => a.vragenlijstId === traj.id);
    if (!resp.length) return;
    if (isVeiligheidLeiderschapVerdieping(traj)) return genereerRapportVeiligheidLeiderschap(traj, resp);
    if (isVerbeterenLerenVerdieping(traj)) return genereerRapportVerbeterenLeren(traj, resp);
    if (isEnergieMotivatieVerdieping(traj)) return genereerRapportEnergieMotivatie(traj, resp);
    if (isBelevingVeranderingVerdieping(traj)) return genereerRapportBelevingVerandering(traj, resp);
    if (isGecombineerdeVerdieping(traj)) return genereerRapportGecombineerdeVerdieping(traj, resp);
    return downloadBasisRapport(traj, resp);
  };

  const openTraject = (trajId) => {
    setSelectedTrajectId(trajId);
    setSelectedMetingId(null);
  };

  const openMeting = (metingId) => {
    setSelectedMetingId(metingId);
    setSelectedTrajectId(null);
  };

  const statusColor = s => s==="Actief" ? ADM.green : s==="In gesprek" ? ADM.orange : ADM.muted;
  const scoreColor = s => s >= 4 ? ADM.green : s >= 3 ? ADM.orange : ADM.red;
  const geselecteerdeTrajecten = selectedKlant?.trajecten || [];
  const geselecteerdeMetingen = selectedKlant?.metingen || [];
  const geselecteerdTraject = geselecteerdeTrajecten.find(t => t.id === selectedTrajectId) || null;
  const geselecteerdeMeting = geselecteerdeMetingen.find(m => m.id === selectedMetingId) || null;
  const rapportagesCount = geselecteerdeTrajecten.filter(v => antwoorden.some(a => a.vragenlijstId === v.id)).length;
  const metingGem = (scores) => {
    const vals = Object.values(scores || {}).filter(v => v !== null && v !== undefined && v !== "");
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : "—";
  };

  const tijdlijnItems = (klant) => {
    if (!klant) return [];
    const trajectItems = (klant.trajecten || []).map(t => ({
      id: `traject_${t.id}`,
      linkedId: t.id,
      linkedType: "traject",
      datum: fmtDate(t.aangemaakt),
      sortDate: parseDateFlexible(t.aangemaakt),
      type: "traject",
      icon: "📝",
      titel: t.naam,
      subtitel: `Traject gestart · status ${t.status || "Actief"}`,
    }));
    const scanItems = (klant.trajecten || []).flatMap(t => {
      const count = antwoorden.filter(a => a.vragenlijstId === t.id).length;
      return count > 0 ? [{
        id: `scan_${t.id}`,
        linkedId: t.id,
        linkedType: "rapportage",
        datum: fmtDate(t.aangemaakt),
        sortDate: parseDateFlexible(t.aangemaakt),
        type: "scan",
        icon: "✅",
        titel: t.naam,
        subtitel: `${count} ingevulde scan(s) ontvangen`,
      }] : [];
    });
    const metingItems = (klant.metingen || []).map(m => ({
      id: `meting_${m.id}`,
      linkedId: m.id,
      linkedType: "meting",
      datum: fmtDate(m.datum || m.aangemaakt_op),
      sortDate: parseDateFlexible(m.datum) || parseDateFlexible(m.aangemaakt_op),
      type: "meting",
      icon: "📋",
      titel: m.type || "Meting",
      subtitel: m.trajectNaam ? `Meting toegevoegd · ${m.trajectNaam}` : "Meting toegevoegd",
    }));
    const rapportItems = (klant.trajecten || []).flatMap(t => {
      const count = antwoorden.filter(a => a.vragenlijstId === t.id).length;
      return count > 0 ? [{
        id: `rapport_${t.id}`,
        linkedId: t.id,
        linkedType: "rapportage",
        datum: fmtDate(t.aangemaakt),
        sortDate: parseDateFlexible(t.aangemaakt),
        type: "rapportage",
        icon: "📄",
        titel: t.naam,
        subtitel: "Rapportage beschikbaar",
      }] : [];
    });
    const contactItems = (klant.contactmomenten || []).map(c => ({
      id: `contact_${c.id}`,
      linkedId: c.id,
      linkedType: "contact",
      datum: fmtDate(c.datum || c.createdAt),
      sortDate: parseDateFlexible(c.datum) || parseDateFlexible(c.createdAt),
      type: "contact",
      icon: "📬",
      titel: c.organisatie || klant.naam,
      subtitel: "Contactaanvraag ontvangen",
    }));

    return [...contactItems, ...trajectItems, ...scanItems, ...metingItems, ...rapportItems]
      .sort((a,b) => (b.sortDate?.getTime() || 0) - (a.sortDate?.getTime() || 0));
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{klanten.length} klant(en)</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Klant toevoegen
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"22px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe klant toevoegen</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[["naam","Naam organisatie"],["sector","Sector"],["contact","Contactpersoon"],["email","E-mail"],["status","Status"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={voegToe} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:opslaan?"wait":"pointer"}}>
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "0.95fr 1.25fr",gap:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {klanten.map(k => (
            <div key={k.id}
              onClick={()=>{ setSelectedKlant(k); setSelectedTrajectId(null); setSelectedMetingId(null); }}
              style={{background:ADM.navy,border:`1px solid ${selectedKlant?.id===k.id?ADM.teal:ADM.border}`,borderRadius:12,padding:"18px 20px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div>
                  <div style={{fontWeight:700,color:ADM.white,fontSize:15,marginBottom:4}}>{k.naam}</div>
                  <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                    {k.sector || "Sector onbekend"} · {k.contact || "Geen contactpersoon"}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:`${statusColor(k.status)}22`,color:statusColor(k.status)}}>
                    {k.status}
                  </span>
                  <div style={{fontSize:20,fontWeight:700,color:k.score !== null ? scoreColor(k.score) : ADM.muted}}>
                    {k.score !== null ? k.score.toFixed(1) : "—"}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap",fontSize:12,color:ADM.muted}}>
                <span>📝 {k.trajecten.length} traject(en)</span>
                <span>📋 {k.metingen.length} meting(en)</span>
                <span>📈 {k.team || 0} antwoorden</span>
              </div>
            </div>
          ))}
          {klanten.length === 0 && (
            <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"24px",textAlign:"center",color:ADM.muted}}>
              Nog geen klanten beschikbaar.
            </div>
          )}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          {!selectedKlant ? (
            <div style={{color:ADM.muted}}>Selecteer een klant om details te bekijken.</div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:18,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:26,fontWeight:700,color:ADM.white,marginBottom:6}}>{selectedKlant.naam}</div>
                  <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
                    {selectedKlant.sector || "Sector onbekend"} · {selectedKlant.contact || "Geen contactpersoon"}{selectedKlant.email ? ` · ${selectedKlant.email}` : ""}
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:20,background:`${statusColor(selectedKlant.status)}22`,color:statusColor(selectedKlant.status)}}>
                  {selectedKlant.status}
                </span>
              </div>

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
                <button
                  onClick={()=>setShowTrajectForm(v => !v)}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}
                >
                  + Nieuw traject
                </button>
                <button
                  onClick={()=>setShowMetingForm(v => !v)}
                  style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}
                >
                  + Nieuwe meting
                </button>
              </div>

              {showTrajectForm && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Nieuw traject</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 160px",gap:10,marginBottom:10}}>
                    <input
                      value={nieuwTraject.naam}
                      onChange={e=>setNieuwTraject(n=>({...n, naam:e.target.value}))}
                      placeholder="Naam van het traject"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <input
                      value={nieuwTraject.status}
                      onChange={e=>setNieuwTraject(n=>({...n, status:e.target.value}))}
                      placeholder="Status"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={startNieuwTraject} disabled={opslaanTraject}
                      style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:opslaanTraject?"wait":"pointer"}}>
                      {opslaanTraject ? "Opslaan..." : "Traject opslaan"}
                    </button>
                    <button onClick={()=>setShowTrajectForm(false)}
                      style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>
                      Sluiten
                    </button>
                  </div>
                </div>
              )}

              {showMetingForm && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Nieuwe meting</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr 1fr",gap:10,marginBottom:10}}>
                    <select
                      value={nieuweMeting.trajectId}
                      onChange={e=>kiesMetingTraject(e.target.value)}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    >
                      <option value="" style={{color:"#111"}}>Geen traject geselecteerd</option>
                      {geselecteerdeTrajecten.map(t => (
                        <option key={t.id} value={t.id} style={{color:"#111"}}>{t.naam}</option>
                      ))}
                    </select>
                    <input
                      value={nieuweMeting.type}
                      onChange={e=>setNieuweMeting(n=>({...n, type:e.target.value}))}
                      placeholder="Type meting"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <input
                      value={nieuweMeting.datum}
                      onChange={e=>setNieuweMeting(n=>({...n, datum:e.target.value}))}
                      placeholder="Datum"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "repeat(2,1fr)",gap:10,marginBottom:12}}>
                    {pijlerNamenMeting.map(p=>(
                      <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:12,color:ADM.text,flex:1}}>{p}</div>
                        <input
                          type="number" min="1" max="5" step="0.1"
                          value={nieuweMeting.scores[p] || ""}
                          onChange={e=>setNieuweMeting(n=>({...n,scores:{...n.scores,[p]:e.target.value}}))}
                          style={{width:64,background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"8px 10px",color:ADM.white,fontSize:13,outline:"none",textAlign:"center"}}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={voegMetingToe} disabled={opslaanMeting}
                      style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:opslaanMeting?"wait":"pointer"}}>
                      {opslaanMeting ? "Opslaan..." : "Meting opslaan"}
                    </button>
                    <button onClick={()=>setShowMetingForm(false)}
                      style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>
                      Sluiten
                    </button>
                  </div>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr 1fr" : "repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  ["Trajecten", geselecteerdeTrajecten.length, "#3A7DBF"],
                  ["Metingen", geselecteerdeMetingen.length, "#E8821A"],
                  ["Rapportages", rapportagesCount, "#6B4E9E"],
                  ["Gem. score", selectedKlant.score !== null ? selectedKlant.score.toFixed(1) : "—", "#5A8C3C"],
                ].map(([label, value, color], i) => (
                  <div key={i} style={{background:`${color}18`,border:`1px solid ${color}33`,borderRadius:10,padding:"14px 14px"}}>
                    <div style={{fontSize:11,color:color,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{label}</div>
                    <div style={{fontSize:26,fontWeight:700,color:color}}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr",gap:16,marginBottom:16}}>
                <div>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                    Trajecten
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {geselecteerdeTrajecten.length === 0 ? (
                      <div style={{fontSize:13,color:ADM.muted}}>Nog geen trajecten gekoppeld.</div>
                    ) : geselecteerdeTrajecten.map(t => {
                      const antwoordenCount = antwoorden.filter(a => a.vragenlijstId === t.id).length;
                      return (
                        <div key={t.id} style={{background:selectedTrajectId===t.id?"rgba(15,118,110,0.10)":"rgba(255,255,255,0.03)",border:selectedTrajectId===t.id?`1px solid ${ADM.teal}`:"1px solid transparent",borderRadius:10,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
                            <div style={{fontSize:14,fontWeight:700,color:ADM.white}}>{t.naam}</div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                              <button
                                onClick={() => openTraject(t.id)}
                                style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"7px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                              >
                                Open traject
                              </button>
                              {antwoordenCount > 0 && (
                                <button
                                  onClick={() => openRapportageVoorTraject(t)}
                                  style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.26)`,borderRadius:8,padding:"7px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                                >
                                  📄 Rapportage
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                            Status: {t.status || "Actief"} · Antwoorden: {antwoordenCount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                    Metingen
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {geselecteerdeMetingen.length === 0 ? (
                      <div style={{fontSize:13,color:ADM.muted}}>Nog geen metingen gekoppeld.</div>
                    ) : geselecteerdeMetingen
                      .slice()
                      .sort((a,b) => (b.aangemaakt_op?.seconds || 0) - (a.aangemaakt_op?.seconds || 0))
                      .map(m => (
                        <div key={m.id} style={{background:selectedMetingId===m.id?"rgba(15,118,110,0.10)":"rgba(255,255,255,0.03)",border:selectedMetingId===m.id?`1px solid ${ADM.teal}`:"1px solid transparent",borderRadius:10,padding:"12px 14px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                            <div>
                              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:4}}>{m.type || "Meting"}</div>
                              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                                {m.datum || "—"}{m.trajectNaam ? ` · ${m.trajectNaam}` : ""}
                              </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <button
                                onClick={() => openMeting(m.id)}
                                style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"7px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                              >
                                Open meting
                              </button>
                              <div style={{fontSize:20,fontWeight:700,color:metingGem(m.scores)!=="—" ? scoreColor(parseFloat(metingGem(m.scores))) : ADM.muted}}>
                                {metingGem(m.scores)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {(geselecteerdTraject || geselecteerdeMeting) && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  {geselecteerdTraject && (
                    <>
                      <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Geopend traject</div>
                      <div style={{fontSize:16,fontWeight:700,color:ADM.white,marginBottom:6}}>{geselecteerdTraject.naam}</div>
                      <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
                        Status: {geselecteerdTraject.status || "Actief"} · Type: {geselecteerdTraject.type || "basisscan"} · Aangemaakt: {geselecteerdTraject.aangemaakt || "—"}
                      </div>
                    </>
                  )}
                  {geselecteerdeMeting && (
                    <>
                      <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Geopende meting</div>
                      <div style={{fontSize:16,fontWeight:700,color:ADM.white,marginBottom:6}}>{geselecteerdeMeting.type || "Meting"}</div>
                      <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7,marginBottom:10}}>
                        Datum: {geselecteerdeMeting.datum || "—"}{geselecteerdeMeting.trajectNaam ? ` · ${geselecteerdeMeting.trajectNaam}` : ""}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr",gap:10}}>
                        {pijlerNamenMeting.map(p => (
                          <div key={p} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10}}>
                            <span style={{fontSize:12,color:ADM.text}}>{p}</span>
                            <span style={{fontSize:12,fontWeight:700,color:(geselecteerdeMeting.scores?.[p] || 0) > 0 ? scoreColor(geselecteerdeMeting.scores?.[p]) : ADM.muted}}>
                              {geselecteerdeMeting.scores?.[p] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                  Tijdlijn
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {tijdlijnItems(selectedKlant).length === 0 ? (
                    <div style={{fontSize:13,color:ADM.muted}}>Nog geen gebeurtenissen beschikbaar.</div>
                  ) : tijdlijnItems(selectedKlant).map((item, i) => (
                    <div key={item.id || i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:18,lineHeight:1}}>{item.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                          <div style={{fontSize:14,fontWeight:700,color:ADM.white}}>{item.titel}</div>
                          <div style={{fontSize:12,color:ADM.muted}}>{item.datum}</div>
                        </div>
                        <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:2,marginBottom:8}}>
                          {item.subtitel}
                        </div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {item.linkedType === "traject" && (
                            <button onClick={() => openTraject(item.linkedId)}
                              style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              Open traject
                            </button>
                          )}
                          {item.linkedType === "meting" && (
                            <button onClick={() => openMeting(item.linkedId)}
                              style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              Open meting
                            </button>
                          )}
                          {item.linkedType === "rapportage" && (
                            <button onClick={() => {
                              const t = geselecteerdeTrajecten.find(x => x.id === item.linkedId);
                              if (t) openRapportageVoorTraject(t);
                            }}
                              style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.26)`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              📄 Open rapportage
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PageMetingen() {
  const pijlerNamen = ["Veiligheid & Leiderschap","Beleving van Verandering","Energie & Motivatie","Verbeteren & Leren","Gedrag (centraal)"];
  const [metingen, setMetingen] = useState([]);
  const [vragenlijsten, setVragenlijsten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [opslaan, setOpslaan] = useState(false);
  const [selected, setSelected] = useState(null);
  const [nieuw, setNieuw] = useState({
    klant: "",
    trajectId: "",
    trajectNaam: "",
    type: "T1 Meting",
    datum: "",
    respondenten: "",
    scores: {},
  });

  const scoreColor = s => s >= 4 ? ADM.green : s >= 3 ? ADM.orange : ADM.red;
  const gemScore = scores => {
    const vals = Object.values(scores || {}).filter(v => v !== null && v !== undefined && v !== "");
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : "—";
  };

  const laadData = async () => {
    setLoading(true);
    try {
      const [metingenSnap, vragenlijstenSnap] = await Promise.all([
        getDocs(collection(db, "metingen")),
        getDocs(collection(db, "vragenlijsten")),
      ]);

      const trajecten = vragenlijstenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => !v.verwijderd && v.status !== "Verwijderd")
        .sort((a,b) => (a.naam || "").localeCompare(b.naam || "", "nl"));

      const rows = metingenSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          klant: data.klant || "",
          trajectId: data.trajectId || "",
          trajectNaam: data.trajectNaam || "",
          type: data.type || "Meting",
          datum: data.datum || "",
          respondenten: data.respondenten || 0,
          scores: data.scores || {},
          status: data.status || "Compleet",
          aangemaakt_op: data.aangemaakt_op || null,
        };
      }).sort((a,b) => {
        const ad = a.aangemaakt_op?.seconds || 0;
        const bd = b.aangemaakt_op?.seconds || 0;
        return bd - ad;
      });

      setVragenlijsten(trajecten);
      setMetingen(rows);
    } catch (err) {
      console.error("Laden metingen mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const kiesTraject = (trajectId) => {
    const traject = vragenlijsten.find(v => v.id === trajectId);
    setNieuw(n => ({
      ...n,
      trajectId,
      trajectNaam: traject?.naam || "",
      klant: traject?.klant || n.klant,
    }));
  };

  const slaOp = async () => {
    if (!nieuw.klant || !nieuw.datum) return;
    setOpslaan(true);
    try {
      const payload = {
        klant: nieuw.klant,
        trajectId: nieuw.trajectId || null,
        trajectNaam: nieuw.trajectNaam || null,
        type: nieuw.type || "Meting",
        datum: nieuw.datum,
        respondenten: parseInt(nieuw.respondenten) || 0,
        scores: Object.fromEntries(
          pijlerNamen.map(p => [p, nieuw.scores[p] === undefined || nieuw.scores[p] === "" ? null : parseFloat(nieuw.scores[p])])
        ),
        status: "Compleet",
        aangemaakt_op: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "metingen"), payload);
      setMetingen(prev => [{ id: ref.id, ...payload }, ...prev]);
      setNieuw({ klant:"", trajectId:"", trajectNaam:"", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
      setShowForm(false);
    } catch (err) {
      console.error("Opslaan meting mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{metingen.length} meting(en) · {vragenlijsten.length} traject(en) beschikbaar</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Nieuwe meting
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"24px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe meting invoeren</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Koppel aan traject</div>
              <select
                value={nieuw.trajectId}
                onChange={e=>kiesTraject(e.target.value)}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
              >
                <option value="" style={{color:"#111"}}>Geen traject geselecteerd</option>
                {vragenlijsten.map(v => (
                  <option key={v.id} value={v.id} style={{color:"#111"}}>
                    {v.naam} — {v.klant}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Klant</div>
              <input
                value={nieuw.klant}
                onChange={e=>setNieuw(n=>({...n, klant:e.target.value}))}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {[["type","Type meting"],["datum","Datum"],["respondenten","Respondenten"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>

          {nieuw.trajectNaam && (
            <div style={{fontSize:12,color:ADM.teal,marginBottom:16,background:"rgba(15,118,110,0.10)",padding:"10px 12px",borderRadius:8}}>
              Gekoppeld traject: <strong>{nieuw.trajectNaam}</strong>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Scores per pijler</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {pijlerNamen.map(p=>(
                <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:12,color:ADM.text,flex:1}}>{p}</div>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={nieuw.scores[p] || ""}
                    onChange={e=>setNieuw(n=>({...n,scores:{...n.scores,[p]:e.target.value}}))}
                    style={{width:64,background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"8px 10px",color:ADM.white,fontSize:13,outline:"none",textAlign:"center"}}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={slaOp} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:opslaan?"wait":"pointer"}}>
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {metingen.map(m=>(
          <div key={m.id} style={{background:ADM.navy,border:`1px solid ${selected?.id===m.id?ADM.teal:ADM.border}`,borderRadius:12,overflow:"hidden"}}>
            <div onClick={()=>setSelected(selected?.id===m.id?null:m)}
              style={{padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
              <div>
                <div style={{fontWeight:600,color:ADM.white,fontSize:15}}>{m.klant} — {m.type}</div>
                <div style={{fontSize:12,color:ADM.muted,marginTop:3}}>
                  📅 {m.datum} · {m.respondenten} respondenten{m.trajectNaam ? ` · gekoppeld aan ${m.trajectNaam}` : ""}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:24,fontWeight:700,color:gemScore(m.scores)!=="—" ? scoreColor(parseFloat(gemScore(m.scores))) : ADM.muted}}>
                  {gemScore(m.scores)}
                </div>
                <span style={{fontSize:12,color:ADM.teal}}>{selected?.id===m.id?"▲":"▼"}</span>
              </div>
            </div>
            {selected?.id===m.id && (
              <div style={{borderTop:`1px solid ${ADM.border}`,padding:"16px 22px"}}>
                {m.trajectNaam && (
                  <div style={{fontSize:12,color:ADM.teal,marginBottom:12,background:"rgba(15,118,110,0.10)",padding:"10px 12px",borderRadius:8}}>
                    Trajectkoppeling: <strong>{m.trajectNaam}</strong>
                  </div>
                )}
                {pijlerNamen.map(p=>(
                  <div key={p} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{fontSize:13,color:ADM.text,width:220,flexShrink:0}}>{p}</div>
                    <div style={{flex:1,height:8,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:`${(((m.scores||{})[p]||0)/5)*100}%`,background:((m.scores||{})[p]||0)>0?scoreColor((m.scores||{})[p]):ADM.border}}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:((m.scores||{})[p]||0)>0?scoreColor((m.scores||{})[p]):ADM.muted,width:30,textAlign:"right"}}>
                      {((m.scores||{})[p] ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {metingen.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center"}}>
            Nog geen metingen opgeslagen.
          </div>
        )}
      </div>
    </div>
  );
}


function downloadHtmlRapport(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function standaardRapportHeader({ titel, klant, instrument, respondenten, datum }) {
  return `
  <div class="header">
    <div class="header-bar">
      <div style="background:#5A8C3C;"></div>
      <div style="background:#3A7DBF;"></div>
      <div style="background:#E8821A;"></div>
      <div style="background:#6B4E9E;"></div>
    </div>
    <div style="font-size:11px;color:#0F766E;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Mijn Teamkompas — Rapportage</div>
    <h1>${titel}</h1>
    <p>${klant}</p>
    <div style="display:flex;gap:32px;margin-top:20px;flex-wrap:wrap;">
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Datum</div><div style="font-size:15px;font-weight:600">${datum}</div></div>
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Respondenten</div><div style="font-size:15px;font-weight:600">${respondenten}</div></div>
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Instrument</div><div style="font-size:15px;font-weight:600">${instrument}</div></div>
    </div>
  </div>`;
}

function standaardRapportCss() {
  return `
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f7f9fc;color:#1a1a2e}
.header{background:#0D1B2A;color:white;padding:40px 60px}
.header-bar{display:flex;height:6px;margin-bottom:28px}
.header-bar div{flex:1}
.header h1{font-size:28px;font-weight:700;margin-bottom:6px}
.header p{font-size:14px;color:rgba(255,255,255,0.6)}
.content{max-width:920px;margin:0 auto;padding:40px}
.section{background:white;border-radius:12px;padding:28px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#0F766E;margin-bottom:18px}
.card{border:1px solid #e8edf3;border-radius:10px;padding:18px 20px;margin-bottom:12px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.kpi{border-radius:10px;padding:18px;text-align:center}
.kpi .value{font-size:34px;font-weight:700;line-height:1;margin-top:8px}
.label{font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:.75}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px}
.footer{text-align:center;padding:32px;color:#aaa;font-size:12px}
.split{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media print { body{background:white} .content{padding:20px} }
</style>`;
}

function scoreGemiddeldeVoorIds(antwoorden, ids) {
  const vals = antwoorden.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
  return vals.length ? (vals.reduce((x,y)=>x+parseFloat(y),0) / vals.length) : null;
}

function kleurVoorSecureBase(label) {
  if (label === "Excellentie") return "#2ecc71";
  if (label === "Kracht") return "#86efac";
  if (label === "Ontwikkelpunt") return "#f39c12";
  if (label === "Aandachtspunt") return "#e74c3c";
  return "#6B7A8D";
}

function kleurVoorVerbeterenLeren(label) {
  if (label === "Volwassen") return "#2ecc71";
  if (label === "Ontwikkelend") return "#86efac";
  if (label === "Lerend") return "#f39c12";
  if (label === "Beginner") return "#e74c3c";
  return "#6B7A8D";
}

function kleurVoorBeleving(label) {
  if (label?.startsWith("Blauw")) return "#3A7DBF";
  if (label?.startsWith("Groen")) return "#2ecc71";
  if (label?.startsWith("Oranje")) return "#f39c12";
  if (label?.startsWith("Rood")) return "#e74c3c";
  return "#6B7A8D";
}

function genereerRapportVeiligheidLeiderschap(lijst, antwoorden) {
  const stellingen = lijst.stellingen || VEILIGHEID_LEIDERSCHAP_STELLINGEN;
  const dimensies = getVeiligheidLeiderschapDimensies(stellingen).map((d) => {
    const totaalGem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v => v.id));
    const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
    const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(totaal) : null;
    return { ...d, totaal, interpretatie };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const gemiddelde = dimensies.filter(d=>d.totaal!==null).reduce((s,d)=>s+d.totaal,0) / Math.max(1, dimensies.filter(d=>d.totaal!==null).length);

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Veiligheid en leiderschap", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Samenvatting</div>
      <div class="kpi-grid">
        <div class="kpi" style="background:rgba(15,118,110,0.10);border:1px solid rgba(15,118,110,0.22)">
          <div class="label">Dimensies</div><div class="value" style="color:#0F766E">${dimensies.length}</div>
        </div>
        <div class="kpi" style="background:rgba(58,125,191,0.10);border:1px solid rgba(58,125,191,0.22)">
          <div class="label">Gem. dimensiescore</div><div class="value" style="color:#3A7DBF">${isFinite(gemiddelde)?gemiddelde.toFixed(1):"—"}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Respondenten</div><div class="value" style="color:#2ecc71">${antwoorden.length}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dimensiescores</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorSecureBase(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-veiligheid-en-leiderschap-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}

function genereerRapportVerbeterenLeren(lijst, antwoorden) {
  const stellingen = lijst.stellingen || VERBETEREN_LEREN_STELLINGEN;
  const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
  const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");
  const dimensies = getVerbeterenLerenDimensies(stellingen);

  const codes = ["L1","L2","L3","L4","A1","A2","A3","A4"];
  const groepen = codes.map((code) => {
    const lDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
    const tDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
    const lTotaal = lDim ? Math.round((scoreGemiddeldeVoorIds(leidinggevendeAntwoorden, lDim.vragen.map(v=>v.id)) || 0) * 3) : null
    const tTotaal = tDim ? Math.round((scoreGemiddeldeVoorIds(teamAntwoorden, tDim.vragen.map(v=>v.id)) || 0) * 3) : null
    return {
      code,
      naam: lDim?.naam || tDim?.naam || code,
      leidinggevende: lTotaal,
      team: tTotaal,
      interpretLeiding: lTotaal ? interpretVerbeterenLerenScore(lTotaal) : null,
      interpretTeam: tTotaal ? interpretVerbeterenLerenScore(tTotaal) : null,
      verschil: lTotaal !== null && tTotaal !== null ? lTotaal - tTotaal : null,
    };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Verbeteren en leren", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Vergelijking leidinggevende en team</div>
      ${groepen.map((g) => {
        const kleurL = kleurVoorVerbeterenLeren(g.interpretLeiding?.label);
        const kleurT = kleurVoorVerbeterenLeren(g.interpretTeam?.label);
        const verschilKleur = g.verschil !== null && Math.abs(g.verschil) > 3 ? "#f39c12" : "#86efac";
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
            <div><div class="label" style="margin-bottom:4px">${g.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${g.naam}</div></div>
            ${g.verschil !== null ? `<span class="badge" style="background:${verschilKleur}18;color:${verschilKleur}">Verschil ${g.verschil>0?"+":""}${g.verschil}</span>` : ""}
          </div>
          <div class="split">
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Leidinggevende</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurL}">${g.leidinggevende ?? "—"}</div>${g.interpretLeiding ? `<span class="badge" style="background:${kleurL}18;color:${kleurL}">${g.interpretLeiding.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretLeiding?.advies || "Nog onvoldoende data."}</div>
            </div>
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Teamspiegel</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurT}">${g.team ?? "—"}</div>${g.interpretTeam ? `<span class="badge" style="background:${kleurT}18;color:${kleurT}">${g.interpretTeam.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretTeam?.advies || "Nog onvoldoende data."}</div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${VERBETEREN_LEREN_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-verbeteren-en-leren-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}

function genereerRapportBelevingVerandering(lijst, antwoorden) {
  const stellingen = lijst.stellingen || BELEVING_VERANDERING_STELLINGEN;
  const dimensies = getBelevingVeranderingDimensies(stellingen).map((d) => {
    const totaal = Math.round((scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v=>v.id)) || 0) * 3);
    const interpretatie = interpretBelevingVeranderingScore(totaal);
    return { ...d, totaal, interpretatie };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Beleving van verandering", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Dimensies van breinvriendelijk leiderschap</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorBeleving(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal}</div><span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie?.label || ""}</span></div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis & aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${BELEVING_VERANDERING_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-beleving-van-verandering-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}


function genereerRapportEnergieMotivatie(lijst, antwoorden) {
  const stellingen = lijst.stellingen || ENERGIE_MOTIVATIE_STELLINGEN;
  const dimensiesMap = new Map();

  stellingen.forEach((s) => {
    if (!dimensiesMap.has(s.dimensieCode)) {
      dimensiesMap.set(s.dimensieCode, {
        code: s.dimensieCode,
        naam: s.dimensie,
        deel: s.deel,
        ids: [],
      });
    }
    dimensiesMap.get(s.dimensieCode).ids.push(s.id);
  });

  const dimensies = Array.from(dimensiesMap.values());

  const gemiddeldeVoorIds = (ids) => {
    const vals = antwoorden.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
    return vals.length ? (vals.reduce((x,y)=>x+parseFloat(y),0) / vals.length) : null;
  };

  const scoreData = dimensies.map((d) => {
    const gem = gemiddeldeVoorIds(d.ids);
    const totaal = gem !== null ? Math.round(gem * 3) : null;
    const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
    return { ...d, gem, totaal, interpretatie };
  });

  const somDeel = (prefix) => scoreData.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
  const totaalTaakeisen = somDeel("A");
  const totaalHulpbronnen = somDeel("B");
  const balans = totaalTaakeisen - totaalHulpbronnen;

  let balansTitel = "In balans";
  let balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
  let balansKleur = "#2ecc71";
  if (balans < -20) {
    balansTitel = "Sterk negatief";
    balansTekst = "Hulpbronnen domineren. Zeer gunstig: medewerkers hebben ruime buffers om eisen op te vangen. Kans op bevlogenheid is hoog.";
    balansKleur = "#2ecc71";
  } else if (balans >= -20 && balans <= 0) {
    balansTitel = "In balans";
    balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    balansKleur = "#86efac";
  } else if (balans > 0 && balans <= 20) {
    balansTitel = "Lichte onbalans";
    balansTekst = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
    balansKleur = "#f39c12";
  } else if (balans > 20) {
    balansTitel = "Taakeisen domineren";
    balansTekst = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist voor vermindering van eisen of versterking van hulpbronnen.";
    balansKleur = "#e74c3c";
  }

  const kleurVoorDimensie = (d) => {
    const score = d.totaal || 0;
    const negatiefGedraaid = d.code.startsWith("A") || d.code === "C2";
    if (negatiefGedraaid) {
      if (score >= 14) return "#e74c3c";
      if (score >= 11) return "#f39c12";
      return "#2ecc71";
    }
    if (score >= 14) return "#2ecc71";
    if (score >= 11) return "#86efac";
    if (score >= 7) return "#f39c12";
    return "#e74c3c";
  };

  const groepen = [
    { titel: "Deel A — Taakeisen", key: "Taakeisen", intro: "Hoge score = hoge belasting" },
    { titel: "Deel B — Hulpbronnen", key: "Hulpbronnen", intro: "Hoge score = sterke hulpbron" },
    { titel: "Deel C — Uitkomstmaten", key: "Uitkomstmaten", intro: "Bevlogenheid hoog = positief, uitputting hoog = zorgelijk" },
  ];

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Rapportage — ${lijst.naam}</title>
${standaardRapportCss()}
</head>
<body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Energie en motivatie", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Balansanalyse</div>
      <div class="kpi-grid">
        <div class="kpi" style="background:rgba(243,156,18,0.10);border:1px solid rgba(243,156,18,0.22)">
          <div class="label">Totaal taakeisen</div>
          <div class="value" style="color:#f39c12">${totaalTaakeisen}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Totaal hulpbronnen</div>
          <div class="value" style="color:#2ecc71">${totaalHulpbronnen}</div>
        </div>
        <div class="kpi" style="background:${balansKleur}18;border:1px solid ${balansKleur}33">
          <div class="label">Balans A − B</div>
          <div class="value" style="color:${balansKleur}">${balans > 0 ? "+" + balans : balans}</div>
        </div>
      </div>
      <div style="margin-top:18px;padding:14px 16px;border-radius:10px;background:${balansKleur}14;border-left:4px solid ${balansKleur}">
        <div style="font-size:14px;font-weight:700;color:${balansKleur};margin-bottom:6px">${balansTitel}</div>
        <div style="font-size:13px;line-height:1.7;color:#4a5568">${balansTekst}</div>
      </div>
    </div>

    ${groepen.map((groep) => {
      const dims = scoreData.filter(d => d.deel === groep.key);
      return `
      <div class="section">
        <div class="section-title">${groep.titel}</div>
        <div style="font-size:13px;color:#6B7A8D;line-height:1.7;margin-bottom:16px;">${groep.intro}</div>
        ${dims.map((d) => {
          const kleur = kleurVoorDimensie(d);
          return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
              <div>
                <div class="label" style="margin-bottom:4px">${d.code}</div>
                <div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>
                ${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}
              </div>
            </div>
            <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;">
              <strong style="color:#1a1a2e">Betekenis:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
            </div>
          </div>`;
        }).join("")}
      </div>`;
    }).join("")}

    <div class="section">
      <div class="section-title">Reflectievragen voor het gesprek</div>
      ${ENERGIE_MOTIVATIE_REFLECTIEVRAGEN.map((q, i) => `
        <div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">
          ${i+1}. ${q}
        </div>
      `).join("")}
    </div>
  </div>

  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div>
</body>
</html>`;

  downloadHtmlRapport(`rapportage-energie-en-motivatie-${lijst.klant.toLowerCase().replace(/\\s+/g, "-")}.html`, html);
}


function genereerRapportGecombineerdeVerdieping(lijst, antwoorden) {
  const onderdelen = getGecombineerdeOnderdelen(lijst);
  const mapping = {
    veiligheid_leiderschap: "Veiligheid en leiderschap",
    verbeteren_leren: "Verbeteren en leren",
    energie_motivatie: "Energie en motivatie",
    beleving_verandering: "Beleving van verandering",
  };
  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const sectionVeiligheid = () => {
    if (!onderdelen.includes("veiligheid_leiderschap")) return "";
    const dimensies = getVeiligheidLeiderschapDimensies(VEILIGHEID_LEIDERSCHAP_STELLINGEN).map((d) => {
      const totaalGem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v => v.id));
      const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
      const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(totaal) : null;
      return { ...d, totaal, interpretatie };
    });

    return `
    <div class="section">
      <div class="section-title">Veiligheid en leiderschap</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorSecureBase(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const sectionVerbeterenLeren = () => {
    if (!onderdelen.includes("verbeteren_leren")) return "";
    const dimensies = getVerbeterenLerenDimensies(VERBETEREN_LEREN_STELLINGEN);
    const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
    const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");
    const codes = ["L1","L2","L3","L4","A1","A2","A3","A4"];

    const groepen = codes.map((code) => {
      const lDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
      const tDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
      const lGem = lDim ? scoreGemiddeldeVoorIds(leidinggevendeAntwoorden, lDim.vragen.map(v=>v.id)) : null;
      const tGem = tDim ? scoreGemiddeldeVoorIds(teamAntwoorden, tDim.vragen.map(v=>v.id)) : null;
      const leidinggevende = lGem !== null ? Math.round(lGem * 3) : null;
      const team = tGem !== null ? Math.round(tGem * 3) : null;
      return {
        code,
        naam: lDim?.naam || tDim?.naam || code,
        leidinggevende,
        team,
        interpretLeiding: leidinggevende !== null ? interpretVerbeterenLerenScore(leidinggevende) : null,
        interpretTeam: team !== null ? interpretVerbeterenLerenScore(team) : null,
        verschil: leidinggevende !== null && team !== null ? leidinggevende - team : null,
      };
    });

    return `
    <div class="section">
      <div class="section-title">Verbeteren en leren</div>
      ${groepen.map((g) => {
        const kleurL = kleurVoorVerbeterenLeren(g.interpretLeiding?.label);
        const kleurT = kleurVoorVerbeterenLeren(g.interpretTeam?.label);
        const verschilKleur = g.verschil !== null && Math.abs(g.verschil) > 3 ? "#f39c12" : "#86efac";
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
            <div><div class="label" style="margin-bottom:4px">${g.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${g.naam}</div></div>
            ${g.verschil !== null ? `<span class="badge" style="background:${verschilKleur}18;color:${verschilKleur}">Verschil ${g.verschil>0?"+":""}${g.verschil}</span>` : ""}
          </div>
          <div class="split">
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Leidinggevende</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurL}">${g.leidinggevende ?? "—"}</div>${g.interpretLeiding ? `<span class="badge" style="background:${kleurL}18;color:${kleurL}">${g.interpretLeiding.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretLeiding?.advies || "Nog onvoldoende data."}</div>
            </div>
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Teamspiegel</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurT}">${g.team ?? "—"}</div>${g.interpretTeam ? `<span class="badge" style="background:${kleurT}18;color:${kleurT}">${g.interpretTeam.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretTeam?.advies || "Nog onvoldoende data."}</div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const scoreDataEnergie = (() => {
    if (!onderdelen.includes("energie_motivatie")) return [];
    const dimensiesMap = new Map();
    ENERGIE_MOTIVATIE_STELLINGEN.forEach((s) => {
      if (!dimensiesMap.has(s.dimensieCode)) {
        dimensiesMap.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, deel: s.deel, ids: [] });
      }
      dimensiesMap.get(s.dimensieCode).ids.push(s.id);
    });
    return Array.from(dimensiesMap.values()).map((d) => {
      const gem = scoreGemiddeldeVoorIds(antwoorden, d.ids);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
      return { ...d, totaal, interpretatie };
    });
  })();

  const sectionEnergie = () => {
    if (!onderdelen.includes("energie_motivatie")) return "";
    const somDeel = (prefix) => scoreDataEnergie.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
    const totaalTaakeisen = somDeel("A");
    const totaalHulpbronnen = somDeel("B");
    const balans = totaalTaakeisen - totaalHulpbronnen;

    let balansTitel = "In balans";
    let balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    let balansKleur = "#2ecc71";
    if (balans < -20) {
      balansTitel = "Sterk negatief";
      balansTekst = "Hulpbronnen domineren. Zeer gunstig: medewerkers hebben ruime buffers om eisen op te vangen. Kans op bevlogenheid is hoog.";
      balansKleur = "#2ecc71";
    } else if (balans >= -20 && balans <= 0) {
      balansTitel = "In balans";
      balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
      balansKleur = "#86efac";
    } else if (balans > 0 && balans <= 20) {
      balansTitel = "Lichte onbalans";
      balansTekst = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
      balansKleur = "#f39c12";
    } else if (balans > 20) {
      balansTitel = "Taakeisen domineren";
      balansTekst = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist.";
      balansKleur = "#e74c3c";
    }

    const kleurVoorDimensie = (d) => {
      const score = d.totaal || 0;
      const negatiefGedraaid = d.code.startsWith("A") || d.code === "C2";
      if (negatiefGedraaid) {
        if (score >= 14) return "#e74c3c";
        if (score >= 11) return "#f39c12";
        return "#2ecc71";
      }
      if (score >= 14) return "#2ecc71";
      if (score >= 11) return "#86efac";
      if (score >= 7) return "#f39c12";
      return "#e74c3c";
    };

    const groepen = [
      { titel: "Deel A — Taakeisen", key: "Taakeisen" },
      { titel: "Deel B — Hulpbronnen", key: "Hulpbronnen" },
      { titel: "Deel C — Uitkomstmaten", key: "Uitkomstmaten" },
    ];

    return `
    <div class="section">
      <div class="section-title">Energie en motivatie</div>
      <div class="kpi-grid" style="margin-bottom:18px">
        <div class="kpi" style="background:rgba(243,156,18,0.10);border:1px solid rgba(243,156,18,0.22)">
          <div class="label">Totaal taakeisen</div><div class="value" style="color:#f39c12">${totaalTaakeisen}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Totaal hulpbronnen</div><div class="value" style="color:#2ecc71">${totaalHulpbronnen}</div>
        </div>
        <div class="kpi" style="background:${balansKleur}18;border:1px solid ${balansKleur}33">
          <div class="label">Balans A − B</div><div class="value" style="color:${balansKleur}">${balans > 0 ? "+" + balans : balans}</div>
        </div>
      </div>
      <div style="margin-bottom:18px;padding:14px 16px;border-radius:10px;background:${balansKleur}14;border-left:4px solid ${balansKleur}">
        <div style="font-size:14px;font-weight:700;color:${balansKleur};margin-bottom:6px">${balansTitel}</div>
        <div style="font-size:13px;line-height:1.7;color:#4a5568">${balansTekst}</div>
      </div>
      ${groepen.map((groep) => {
        const dims = scoreDataEnergie.filter(d => d.deel === groep.key);
        return `
        <div style="margin-top:14px">
          <div class="label" style="margin-bottom:10px;color:#0F766E">${groep.titel}</div>
          ${dims.map((d) => {
            const kleur = kleurVoorDimensie(d);
            return `<div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
                <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
              </div>
              <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
            </div>`;
          }).join("")}
        </div>`;
      }).join("")}
    </div>`;
  };

  const sectionBeleving = () => {
    if (!onderdelen.includes("beleving_verandering")) return "";
    const dimensies = getBelevingVeranderingDimensies(BELEVING_VERANDERING_STELLINGEN).map((d) => {
      const gem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v=>v.id));
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretBelevingVeranderingScore(totaal) : null;
      return { ...d, totaal, interpretatie };
    });

    return `
    <div class="section">
      <div class="section-title">Beleving van verandering</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorBeleving(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis & aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Gecombineerde verdiepingsscan", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Onderdelen in deze verdiepingsscan</div>
      ${onderdelen.map((k) => `<div class="card"><div style="font-size:16px;font-weight:700;color:#0D1B2A;margin-bottom:6px">${mapping[k] || k}</div><div style="font-size:13px;line-height:1.65;color:#5b6775">Dit onderdeel is opgenomen in deze gecombineerde rapportage en wordt hieronder inhoudelijk uitgewerkt.</div></div>`).join("")}
    </div>

    ${sectionVeiligheid()}
    ${sectionVerbeterenLeren()}
    ${sectionEnergie()}
    ${sectionBeleving()}
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-gecombineerde-verdieping-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}


function PageRapportages() {
  const [lijsten,    setLijsten]    = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [genererend, setGenererend] = useState(null);
  const [rapportError, setRapportError] = useState("");
  const [verwijderenId, setVerwijderenId] = useState(null);

  useEffect(() => {
    const laadData = async () => {
      setLoading(true);
      try {
        const [vlSnap, antSnap] = await Promise.all([
          getDocs(collection(db, "vragenlijsten")),
          getDocs(collection(db, "antwoorden")),
        ]);
        setLijsten(
          vlSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(item => !item.verwijderd && item.status !== "Verwijderd")
        );
        setAntwoorden(antSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Laden mislukt:", err);
      } finally {
        setLoading(false);
      }
    };
    laadData();
  }, []);

  const antwoordenVoor = (id) => antwoorden.filter(a => a.vragenlijstId === id);

  const gemPijler = (pijlerIdx, subset, stellingen) => {
    const ids  = stellingen.filter(s => s.pijler === pijlerIdx && s.type === "schaal").map(s => s.id);
    const vals = subset.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
    return vals.length ? (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length) : null;
  };

  const scoreKleurHex = (s) => {
    if (!s || isNaN(s)) return "#6B7A8D";
    if (parseFloat(s) >= 4) return "#2ecc71";
    if (parseFloat(s) >= 3) return "#f39c12";
    return "#e74c3c";
  };

  const pijlerKleuren = ["#5A8C3C", "#3A7DBF", "#E8821A", "#6B4E9E"];
  const pijlerNamen   = ["Veiligheid & Leiderschap", "Beleving van Verandering", "Energie & Motivatie", "Verbeteren & Leren"];


  const verplaatsNaarPrullenbak = async (lijst) => {
    setRapportError("");
    setVerwijderenId(lijst.id);
    try {
      const trashPayload = {
        original_id: lijst.id,
        bron_collectie: "vragenlijsten",
        naam: lijst.naam || "",
        klant: lijst.klant || "",
        type: lijst.type || "basisscan",
        status: lijst.status || "",
        aangemaakt: lijst.aangemaakt || "",
        parentVragenlijstId: lijst.parentVragenlijstId || null,
        verdiepingOnderdelen: lijst.verdiepingOnderdelen || [],
        verwijderd_op: serverTimestamp(),
        verwijderd_op_ms: Date.now(),
      };

      await addDoc(collection(db, "prullenbak"), trashPayload);

      await updateDoc(doc(db, "vragenlijsten", lijst.id), {
        status: "Verwijderd",
        verwijderd: true
      });

      setLijsten(prev => prev.filter(x => x.id !== lijst.id));
    } catch (err) {
      console.error("Naar prullenbak verplaatsen mislukt:", err);
      setRapportError("Het verwijderen is mislukt. Probeer het opnieuw.");
    } finally {
      setVerwijderenId(null);
    }
  };

  const genereerRapport = (lijst) => {
    setRapportError("");
    setGenererend(lijst.id);
    const resp       = antwoordenVoor(lijst.id);

    if (isVeiligheidLeiderschapVerdieping(lijst)) {
      try {
        genereerRapportVeiligheidLeiderschap(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isVerbeterenLerenVerdieping(lijst)) {
      try {
        genereerRapportVerbeterenLeren(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isBelevingVeranderingVerdieping(lijst)) {
      try {
        genereerRapportBelevingVerandering(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isGecombineerdeVerdieping(lijst)) {
      try {
        genereerRapportGecombineerdeVerdieping(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isEnergieMotivatieVerdieping(lijst)) {
      try {
        genereerRapportEnergieMotivatie(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    const teamleden  = resp.filter(a => a.rol === "Teamlid");
    const management = resp.filter(a => a.rol === "Leidinggevende");
    const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;

    // Bereken scores
    const scores = pijlerNamen.map((naam, i) => {
      const totaal = gemPijler(i, resp, stellingen);
      const team   = gemPijler(i, teamleden, stellingen);
      const mgmt   = gemPijler(i, management, stellingen);
      const gap    = (team !== null && mgmt !== null) ? (mgmt - team) : null;
      return { naam, kleur: pijlerKleuren[i], totaal, team, mgmt, gap };
    });

    // Open antwoorden per pijler
    const openAntwoorden = pijlerNamen.map((naam, pi) => {
      const openStellingen = stellingen.filter(s => s.pijler === pi && s.type === "open");
      const antw = openStellingen.flatMap(s =>
        resp.map(a => a.antwoorden?.[s.id]).filter(v => v && v.trim().length > 3)
      );
      return { naam, kleur: pijlerKleuren[pi], vraag: openStellingen[0]?.tekst || "", antwoorden: antw };
    });

    const now    = new Date();
    const datum  = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

    const scoreRij = (label, score, kleur) => score !== null ? `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
        <div style="font-size:12px;color:${kleur};font-weight:600;width:130px;flex-shrink:0;">${label}</div>
        <div style="flex:1;height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden;">
          <div style="height:100%;border-radius:5px;background:${kleur};width:${(score/5)*100}%;"></div>
        </div>
        <div style="font-size:14px;font-weight:700;color:${kleur};width:32px;text-align:right;">${score.toFixed(1)}</div>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Rapportage — ${lijst.naam}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f9fc; color: #1a1a2e; }
    .header { background: #0D1B2A; color: white; padding: 40px 60px; position: relative; overflow: hidden; }
    .header-bar { display: flex; height: 6px; margin-bottom: 32px; }
    .header-bar div { flex: 1; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .header p  { font-size: 14px; color: rgba(255,255,255,0.6); }
    .header .meta { display: flex; gap: 32px; margin-top: 20px; }
    .header .meta-item { font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
    .header .meta-item span { display: block; font-size: 15px; color: white; font-weight: 600; margin-top: 2px; text-transform: none; letter-spacing: 0; }
    .content { max-width: 900px; margin: 0 auto; padding: 40px 40px; }
    .section { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #00A896; margin-bottom: 18px; }
    .pijler-card { border-radius: 10px; padding: 22px; margin-bottom: 16px; border: 1px solid #eee; }
    .pijler-naam { font-size: 16px; font-weight: 700; margin-bottom: 14px; }
    .gap-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-left: 10px; }
    .open-item { background: #f7f9fc; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 13px; line-height: 1.6; color: #444; border-left: 3px solid; }
    .samenvatting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .sum-card { border-radius: 10px; padding: 20px; text-align: center; }
    .sum-score { font-size: 36px; font-weight: 700; margin: 8px 0 4px; }
    .sum-label { font-size: 12px; opacity: 0.75; }
    .footer { text-align: center; padding: 32px; color: #aaa; font-size: 12px; }
    @media print { body { background: white; } .content { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-bar">
      <div style="background:#5A8C3C;"></div>
      <div style="background:#3A7DBF;"></div>
      <div style="background:#E8821A;"></div>
      <div style="background:#6B4E9E;"></div>
    </div>
    <div style="font-size:11px;color:#00A896;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Het Teamkompas — Rapportage</div>
    <h1>${lijst.naam}</h1>
    <p>${lijst.klant}</p>
    <div class="meta">
      <div class="meta-item">Datum<span>${datum}</span></div>
      <div class="meta-item">Respondenten<span>${resp.length}</span></div>
      <div class="meta-item">Teamleden<span>${teamleden.length}</span></div>
      <div class="meta-item">Leidinggevenden<span>${management.length}</span></div>
    </div>
  </div>

  <div class="content">

    <!-- SAMENVATTING -->
    <div class="section">
      <div class="section-title">Samenvatting per domein</div>
      <div class="samenvatting-grid">
        ${scores.map(s => `
        <div class="sum-card" style="background:${s.kleur}18;border:1px solid ${s.kleur}33;">
          <div style="font-size:11px;font-weight:700;color:${s.kleur};letter-spacing:1px;text-transform:uppercase;">${s.naam}</div>
          <div class="sum-score" style="color:${s.totaal ? scoreKleurHex(s.totaal) : '#aaa'};">${s.totaal ? s.totaal.toFixed(1) : "—"}</div>
          <div class="sum-label" style="color:${s.kleur};">gemiddeld (schaal 1–5)</div>
        </div>`).join("")}
      </div>
    </div>

    <!-- GAP ANALYSE -->
    ${teamleden.length > 0 && management.length > 0 ? `
    <div class="section">
      <div class="section-title">Gap-analyse: team vs. leidinggevenden</div>
      ${scores.map(s => {
        const gap = s.gap;
        const gapKleur = gap === null ? "#aaa" : Math.abs(gap) >= 1.5 ? "#e74c3c" : Math.abs(gap) >= 0.8 ? "#f39c12" : "#2ecc71";
        const gapLabel = gap === null ? "" : Math.abs(gap) >= 1.5 ? "Grote kloof" : Math.abs(gap) >= 0.8 ? "Merkbaar verschil" : "Kleine kloof";
        return `
        <div class="pijler-card">
          <div class="pijler-naam" style="color:${s.kleur};">
            ${s.naam}
            ${gap !== null ? `<span class="gap-badge" style="background:${gapKleur}22;color:${gapKleur};">
              ${gap > 0 ? "+" : ""}${gap.toFixed(1)} — ${gapLabel}
            </span>` : ""}
          </div>
          ${scoreRij("👥 Team", s.team, "#5A8C3C")}
          ${scoreRij("👔 Leidinggevenden", s.mgmt, "#6B4E9E")}
        </div>`;
      }).join("")}
    </div>` : ""}

    <!-- OPEN ANTWOORDEN -->
    <div class="section">
      <div class="section-title">Open antwoorden per domein</div>
      ${openAntwoorden.map(p => p.antwoorden.length > 0 ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:${p.kleur};margin-bottom:6px;">${p.naam}</div>
        <div style="font-size:12px;color:#888;margin-bottom:10px;font-style:italic;">${p.vraag}</div>
        ${p.antwoorden.map(a => `
        <div class="open-item" style="border-color:${p.kleur};">${a}</div>`).join("")}
      </div>` : "").join("")}
      ${openAntwoorden.every(p => p.antwoorden.length === 0) ?
        `<div style="color:#aaa;font-size:13px;">Nog geen open antwoorden beschikbaar.</div>` : ""}
    </div>

    <div class="section" style="background:#0D1B2A;color:white;">
      <div style="font-size:11px;color:#00A896;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Over deze rapportage</div>
      <p style="font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65);">
        Deze rapportage is gegenereerd op basis van de ingevulde teamscans via Het Teamkompas. 
        Individuele antwoorden zijn anoniem verwerkt. Scores zijn gebaseerd op een schaal van 1 tot 5. 
        Een score van 4 of hoger duidt op een sterke positie; tussen 3 en 4 is er ruimte voor verbetering; 
        onder de 3 verdient het domein prioritaire aandacht.
      </p>
    </div>

  </div>
  <div class="footer">
    © ${now.getFullYear()} Het Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik
  </div>
</body>
</html>`;

    // Download als HTML-bestand
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `rapportage-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}-${lijst.naam.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenererend(null);
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{fontSize:13,color:ADM.muted,marginBottom:8}}>
        {lijsten.length} scan(s) beschikbaar · Rapportages worden gegenereerd op basis van ingevoerde scandata
      </div>
      <div style={{fontSize:12,color:ADM.muted,marginBottom:20,lineHeight:1.6,
        background:"rgba(0,168,150,0.06)",padding:"12px 16px",borderRadius:10,
        borderLeft:`3px solid ${ADM.teal}`}}>
        Klik op <strong style={{color:ADM.white}}>Genereer rapport</strong> om een HTML-rapportage te downloaden. 
        Open het bestand in je browser en gebruik <strong style={{color:ADM.white}}>Ctrl+P / Cmd+P</strong> om het als PDF op te slaan.
      </div>
      {rapportError && (
        <div style={{fontSize:12,color:ADM.red,marginBottom:20,lineHeight:1.6,
          background:"rgba(231,76,60,0.10)",padding:"12px 16px",borderRadius:10,
          borderLeft:`3px solid ${ADM.red}`}}>
          {rapportError}
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {lijsten.map(lijst => {
          const resp      = antwoordenVoor(lijst.id);
          const isBezig   = genererend === lijst.id;
          const heeftData = resp.length >= 1;

          return (
            <div key={lijst.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,
              borderRadius:12,padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,color:ADM.white,fontSize:15,marginBottom:4}}>{lijst.naam}</div>
                  <div style={{fontSize:12,color:ADM.muted,marginBottom:12}}>
                    🏢 {lijst.klant} · 📅 {lijst.aangemaakt} · {resp.length} respondenten
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    {heeftData ? (
                      <button onClick={()=>genereerRapport(lijst)} disabled={isBezig}
                        style={{background:isBezig?"rgba(0,168,150,0.3)":ADM.teal,
                          color:ADM.navyDeep,border:"none",borderRadius:6,
                          padding:"8px 16px",fontSize:12,cursor:isBezig?"wait":"pointer",
                          fontWeight:700}}>
                        {isBezig ? "⏳ Genereren..." : "📄 Genereer rapport"}
                      </button>
                    ) : (
                      <span style={{fontSize:12,color:ADM.muted,fontStyle:"italic"}}>
                        Nog geen respondenten — rapport beschikbaar zodra er data is
                      </span>
                    )}

                    <button
                      onClick={()=>verplaatsNaarPrullenbak(lijst)}
                      disabled={verwijderenId===lijst.id}
                      style={{background:"rgba(231,76,60,0.10)",color:ADM.red,border:`1px solid rgba(231,76,60,0.24)`,
                        borderRadius:6,padding:"8px 14px",fontSize:12,cursor:verwijderenId===lijst.id?"wait":"pointer",
                        fontWeight:700}}
                    >
                      {verwijderenId===lijst.id ? "Verplaatsen..." : "🗑️ Verwijderen"}
                    </button>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,
                    background:"rgba(0,168,150,0.12)",color:ADM.teal}}>{lijst.status}</span>
                  {resp.length > 0 && (
                    <div style={{display:"flex",gap:6}}>
                      {[["👥",resp.filter(a=>a.rol==="Teamlid").length,"Teamleden"],
                        ["👔",resp.filter(a=>a.rol==="Leidinggevende").length,"Leidinggevenden"]
                      ].map(([ic,n,l])=>(
                        <span key={l} style={{fontSize:11,color:ADM.muted}}>{ic} {n}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {lijsten.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center"}}>
            Nog geen scans beschikbaar om een rapport van te genereren.
          </div>
        )}
      </div>
    </div>
  );
}


function PagePrullenbak() {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verwijderenId, setVerwijderenId] = useState(null);
  const [herstellenId, setHerstellenId] = useState(null);

  const laadPrullenbak = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "prullenbak"));
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => {
          const ad = a.verwijderd_op?.seconds || a.verwijderd_op_ms || 0;
          const bd = b.verwijderd_op?.seconds || b.verwijderd_op_ms || 0;
          return bd - ad;
        });
      setTrashItems(rows);
    } catch (err) {
      console.error("Laden prullenbak mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadPrullenbak(); }, []);


  const herstellen = async (item) => {
    setHerstellenId(item.id);
    try {
      if (item.bron_collectie && item.original_id) {
        await updateDoc(doc(db, item.bron_collectie, item.original_id), {
          status: item.status || "Actief",
          verwijderd: false,
        });
      }
      await deleteDoc(doc(db, "prullenbak", item.id));
      setTrashItems(prev => prev.filter(x => x.id !== item.id));
    } catch (err) {
      console.error("Herstellen mislukt:", err);
    } finally {
      setHerstellenId(null);
    }
  };

  const definitiefVerwijderen = async (item) => {
    setVerwijderenId(item.id);
    try {
      if (item.bron_collectie && item.original_id) {
        try {
          await deleteDoc(doc(db, item.bron_collectie, item.original_id));
        } catch (err) {
          console.warn("Origineel item was al verwijderd of niet bereikbaar:", err);
        }
      }
      await deleteDoc(doc(db, "prullenbak", item.id));
      setTrashItems(prev => prev.filter(x => x.id !== item.id));
    } catch (err) {
      console.error("Definitief verwijderen mislukt:", err);
    } finally {
      setVerwijderenId(null);
    }
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{fontSize:13,color:ADM.muted,marginBottom:20}}>
        {trashItems.length} item(s) in de prullenbak
      </div>

      {trashItems.length === 0 ? (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"24px",color:ADM.muted,textAlign:"center"}}>
          De prullenbak is leeg.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {trashItems.map((item) => (
            <div key={item.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <div style={{fontWeight:700,color:ADM.white,fontSize:15}}>{item.naam || "Onbekend item"}</div>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:"rgba(231,76,60,0.14)",color:ADM.red}}>
                      PRULLENBAK
                    </span>
                  </div>
                  <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                    Type: {item.type || "Onbekend"} · Klant: {item.klant || "—"} · Bron: {item.bron_collectie || "—"}
                  </div>
                </div>

                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button
                    onClick={() => herstellen(item)}
                    disabled={herstellenId === item.id}
                    style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.28)`,
                      borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:herstellenId===item.id?"wait":"pointer"}}
                  >
                    {herstellenId === item.id ? "Herstellen..." : "↩️ Herstellen"}
                  </button>

                  <button
                    onClick={() => definitiefVerwijderen(item)}
                    disabled={verwijderenId === item.id}
                    style={{background:"rgba(231,76,60,0.12)",color:ADM.red,border:`1px solid rgba(231,76,60,0.28)`,
                      borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verwijderenId===item.id?"wait":"pointer"}}
                  >
                    {verwijderenId === item.id ? "Verwijderen..." : "Definitief verwijderen"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD HOME
// ─────────────────────────────────────────────
function DashboardHome() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    actieveKlanten: 0,
    teamsActief: 0,
    respondenten: 0,
    gemiddeldeTeamscore: null,
  });
  const [activiteiten, setActiviteiten] = useState([]);
  const [metingenTotaal, setMetingenTotaal] = useState(0);

  useEffect(() => {
    const laadDashboard = async () => {
      setLoading(true);
      try {
        const [klantenSnap, vragenlijstenSnap, antwoordenSnap, trashSnap, contactSnap, metingenSnap] = await Promise.all([
          getDocs(collection(db, "klanten")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "vragenlijsten")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "antwoorden")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "prullenbak")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "contactaanvragen")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "metingen")).catch(() => ({ docs: [] })),
        ]);

        const klanten = klantenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const vragenlijsten = vragenlijstenSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(v => !v.verwijderd && v.status !== "Verwijderd");
        const antwoorden = antwoordenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const trash = trashSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const contacten = contactSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const metingen = metingenSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const uniekeKlanten = new Set(
          [
            ...klanten.map(k => k.naam || k.klantnaam || "").filter(Boolean),
            ...vragenlijsten.map(v => v.klant || "").filter(Boolean),
          ]
        );

        const actieveVragenlijsten = vragenlijsten.filter(v => (v.status || "").toLowerCase() !== "afgerond");
        const teamsActief = actieveVragenlijsten.length;
        const respondenten = antwoorden.length;

        const gemiddelden = antwoorden
          .map(a => {
            const vals = Object.values(a.antwoorden || {})
              .map(v => parseFloat(v))
              .filter(v => !Number.isNaN(v));
            return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
          })
          .filter(v => v !== null);

        const gemiddeldeTeamscore = gemiddelden.length
          ? gemiddelden.reduce((s, v) => s + v, 0) / gemiddelden.length
          : null;

        const activiteitenRuw = [
          ...actieveVragenlijsten.slice(0, 6).map(v => ({
            type: "scan",
            titel: v.naam || "Nieuwe scan",
            subtitel: v.klant || "Onbekende klant",
            datum: v.aangemaakt || "",
            icon: "📝",
          })),
          ...contacten.slice(0, 4).map(c => ({
            type: "contact",
            titel: c.organisatie || c.naam || "Nieuwe contactaanvraag",
            subtitel: "Contactaanvraag ontvangen",
            datum: c.datum || c.createdAt || "",
            icon: "📬",
          })),
          ...metingen.slice(0, 4).map(m => ({
            type: "meting",
            titel: `${m.klant || "Onbekende klant"} — ${m.type || "Meting"}`,
            subtitel: m.trajectNaam ? `Nieuwe meting opgeslagen · ${m.trajectNaam}` : "Nieuwe meting opgeslagen",
            datum: m.datum || "",
            icon: "📋",
          })),
          ...trash.slice(0, 4).map(t => ({
            type: "trash",
            titel: t.naam || "Verwijderd item",
            subtitel: "Verplaatst naar prullenbak",
            datum: t.verwijderd_op?.seconds
              ? new Date(t.verwijderd_op.seconds * 1000).toLocaleDateString("nl-NL")
              : "",
            icon: "🗑️",
          })),
        ].slice(0, 8);

        setStats({
          actieveKlanten: uniekeKlanten.size,
          teamsActief,
          respondenten,
          gemiddeldeTeamscore,
        });
        setMetingenTotaal(metingen.length);
        setActiviteiten(activiteitenRuw);
      } catch (err) {
        console.error("Dashboard laden mislukt:", err);
      } finally {
        setLoading(false);
      }
    };

    laadDashboard();
  }, []);

  const statCards = [
    {
      label: "Actieve klanten",
      value: stats.actieveKlanten,
      sub: "Unieke organisaties in trajecten",
      color: "#5A8C3C",
      bg: "rgba(90,140,60,0.10)",
      border: "rgba(90,140,60,0.22)",
    },
    {
      label: "Teams actief",
      value: stats.teamsActief,
      sub: "Open scans en trajecten",
      color: "#3A7DBF",
      bg: "rgba(58,125,191,0.10)",
      border: "rgba(58,125,191,0.22)",
    },
    {
      label: "Respondenten",
      value: stats.respondenten,
      sub: "Totaal aantal inzendingen",
      color: "#E8821A",
      bg: "rgba(232,130,26,0.10)",
      border: "rgba(232,130,26,0.22)",
    },
    {
      label: "Gem. teamscore",
      value: stats.gemiddeldeTeamscore !== null ? stats.gemiddeldeTeamscore.toFixed(1) : "—",
      sub: "Gemiddeld over alle antwoorden",
      color: "#6B4E9E",
      bg: "rgba(107,78,158,0.10)",
      border: "rgba(107,78,158,0.22)",
    },
  ];

  if (loading) {
    return <div style={{padding:"12px 2px",color:ADM.muted}}>Dashboard laden...</div>;
  }

  return (
    <div style={{display:"grid",gap:24}}>
      <div>
        <div style={{fontSize:28,fontWeight:700,color:ADM.white,marginBottom:8}}>Dashboard</div>
        <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7,maxWidth:820}}>
          Live overzicht van klanten, trajecten, respondenten en recente activiteit vanuit de beheeromgeving.
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "repeat(4,1fr)",gap:16}}>
        {statCards.map((card, i) => (
          <div key={i} style={{background:card.bg,border:`1px solid ${card.border}`,borderRadius:14,padding:"20px 18px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:card.color,marginBottom:10}}>
              {card.label}
            </div>
            <div style={{fontSize:34,fontWeight:700,color:card.color,lineHeight:1,marginBottom:8}}>
              {card.value}
            </div>
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1.2fr 0.8fr",gap:18}}>
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>
            Recente activiteit
          </div>
          {activiteiten.length === 0 ? (
            <div style={{fontSize:13,color:ADM.muted}}>Nog geen recente activiteit gevonden.</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activiteiten.map((item, i) => (
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:18,lineHeight:1}}>{item.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:2}}>{item.titel}</div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.5}}>
                      {item.subtitel}{item.datum ? ` · ${item.datum}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>
            Verbonden modules
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              ["Scans", `${stats.teamsActief} actief`],
              ["Metingen", `${metingenTotaal} opgeslagen meetmoment(en)`],
              ["Rapportages", "Gebaseerd op vragenlijsten en antwoorden"],
              ["Prullenbak", "Zacht verwijderde items"],
              ["Contactaanvragen", "Nieuwe leads en intake"],
            ].map(([titel, sub], i) => (
              <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:3}}>{titel}</div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.5}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD SHELL
// ─────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const isMobile = useIsMobile();

  const [nieuwAanvragenCount, setNieuwAanvragenCount] = useState(0);

  useEffect(() => {
    const laadNieuwAantal = async () => {
      try {
        const snap = await getDocs(collection(db, "contactaanvragen"));
        const count = snap.docs.filter(d => (d.data().status || "Nieuw") === "Nieuw").length;
        setNieuwAanvragenCount(count);
      } catch (err) {
        console.error("Fout bij laden aantal contactaanvragen:", err);
      }
    };

    laadNieuwAantal();
  }, []);

  const navItems = [
    { label:"Dashboard",        icon:"📊", section:"Overzicht" },
    { label:"Contactaanvragen", icon:"📬", badge: nieuwAanvragenCount > 0 ? String(nieuwAanvragenCount) : null, section:null },
    { label:"Klanten",          icon:"🏢", section:null },
    { label:"Scans",            icon:"📝", section:"Trajecten" },
    { label:"Metingen",         icon:"📋", section:null },
    { label:"Rapportages",      icon:"📈", section:null },
    { label:"Prullenbak",       icon:"🗑️", section:null },
    { label:"Instellingen",     icon:"⚙",  section:"Systeem" },
  ];

  const renderPage = () => {
    if (activeNav === "Contactaanvragen") return <PageContactaanvragen />;
    if (activeNav === "Klanten")          return <PageKlanten />;
    if (activeNav === "Scans")            return <PageScans />;
    if (activeNav === "Metingen")         return <PageMetingen />;
    if (activeNav === "Rapportages")      return <PageRapportages />;
    if (activeNav === "Prullenbak")       return <PagePrullenbak />;
    return <DashboardHome />;
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    onLogout();
  };

  return (
    <div style={{fontFamily:"'Roboto', sans-serif",display:"flex",minHeight:"100vh",background:ADM.navyDeep,color:ADM.text}}>
      <aside style={{width:260,minHeight:"100vh",background:ADM.navy,
        borderRight:`1px solid ${ADM.border}`,display:isMobile?"none":"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,bottom:0,zIndex:100}}>
        <div style={{padding:"28px 24px 20px",borderBottom:`1px solid ${ADM.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:ADM.teal,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
              boxShadow:"0 0 20px rgba(0,168,150,0.4)",flexShrink:0}}>🧭</div>
            <div>
              <div style={{fontSize:14,color:ADM.white,fontWeight:600}}>Mijn Teamkompas</div>
              <div style={{fontSize:10,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1.5px"}}>Beheeromgeving</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"16px 0",overflowY:"auto"}}>
          {navItems.map(({label,icon,badge,section},i) => (
            <div key={i}>
              {section && <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.8px",color:ADM.muted,padding:"16px 24px 8px"}}>{section}</div>}
              <div onClick={()=>setActiveNav(label)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 24px",cursor:"pointer",
                  color:activeNav===label ? ADM.teal : ADM.muted,
                  background:activeNav===label ? ADM.tealGlow : "transparent",
                  borderLeft:`3px solid ${activeNav===label ? ADM.teal : "transparent"}`,
                  fontSize:14.5,transition:"all 0.2s"}}>
                <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{icon}</span>
                {label}
                {badge && <span style={{marginLeft:"auto",background:ADM.teal,color:ADM.navyDeep,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{badge}</span>}
              </div>
            </div>
          ))}
        </nav>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${ADM.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg, ${ADM.teal}, ${ADM.navyLight})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>BV</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:ADM.white}}>Beheerder</div>
            <div style={{fontSize:11,color:ADM.muted}}>Admin</div>
          </div>
          <div onClick={handleLogout} title="Uitloggen" style={{cursor:"pointer",color:ADM.muted,fontSize:16,padding:"4px"}}>↩</div>
        </div>
      </aside>

      <main style={{marginLeft:isMobile?0:260,flex:1,display:"flex",flexDirection:"column",paddingBottom:isMobile?64:0}}>
        <div style={{background:"rgba(13,27,42,0.9)",backdropFilter:"blur(12px)",
          borderBottom:`1px solid ${ADM.border}`,padding:isMobile?"0 16px":"0 32px",height:64,
          display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <div style={{fontSize:18,fontWeight:600,color:ADM.white}}>{activeNav}</div>
        </div>
        <div style={{padding:isMobile?16:32,flex:1}}>
          {renderPage()}
        </div>
      </main>

      {isMobile && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,
          background:ADM.navy,borderTop:`1px solid ${ADM.border}`,
          display:"flex",justifyContent:"space-around",padding:"8px 0"}}>
          {[["📊","Dashboard"],["📬","Contactaanvragen"],["📝","Scans"],["📋","Metingen"],["📈","Rapportages"],["🗑️","Prullenbak"]].map(([icon,label])=>(
            <div key={label} onClick={()=>setActiveNav(label)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 8px",cursor:"pointer",
                color:activeNav===label?ADM.teal:ADM.muted,
                borderTop:`2px solid ${activeNav===label?ADM.teal:"transparent"}`,minWidth:52}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:activeNav===label?700:400,whiteSpace:"nowrap"}}>
                {label==="Contactaanvragen"?"Aanvragen":label==="Rapportages"?"Rapporten":label==="Prullenbak"?"Prullenbak":label}
              </span>
            </div>
          ))}
          <div onClick={handleLogout} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 8px",cursor:"pointer",color:ADM.muted,minWidth:40}}>
            <span style={{fontSize:18}}>↩</span>
            <span style={{fontSize:9}}>Uit</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT — ROUTING met Firebase Auth state
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("public");
  const [scanId, setScanId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const allowed = ADMIN_EMAILS.includes(user.email || "");

        if (!allowed) {
          await signOut(auth);
          setView("login");
          setAuthReady(true);
          return;
        }

        setView((v) => (v === "login" ? "admin" : v));
      }

      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("scan");

    if (s) {
      setScanId(s);
      setView("scan");
    }
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400;1,700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      *, body {
        font-family: 'Roboto', sans-serif !important;
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
      button, input, textarea, select {
        font: inherit;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <HelmetProvider>
      {(() => {
  if (!authReady) {
        return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0D1B2A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#8fa3bb" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
          <div style={{ fontSize: 15 }}>Laden...</div>
        </div>
      </div>
    );
  }

  if (view === "scan") {
        return <ScanInvullen scanId={scanId} />;
  }

  if (view === "login") {
        return <LoginScreen onLogin={() => setView("admin")} onBack={() => setView("public")} />;
  }

  if (view === "admin") {
        return <AdminDashboard onLogout={() => setView("public")} />;
  }

        return <PublicSite onLoginClick={() => setView("login")} />;
      })()}
    </HelmetProvider>
  );
}
