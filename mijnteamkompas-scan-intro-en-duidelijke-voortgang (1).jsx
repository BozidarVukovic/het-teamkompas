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

  const normaliseerRol = (waarde) => {
    const v = String(waarde || "").toLowerCase();
    if (!v) return "";
    if (v.includes("leiding") || v.includes("manager") || v.includes("management")) return "Leidinggevende";
    if (v.includes("teamlid") || v.includes("medewerker") || v.includes("werknemer")) return "Teamlid";
    return "";
  };

  const bepaalVasteRol = (scan) => {
    if (!scan) return "";
    const expliciet =
      normaliseerRol(scan.doelgroep) ||
      normaliseerRol(scan.intendedRole) ||
      normaliseerRol(scan.rol) ||
      normaliseerRol(scan.scanDoelgroep);
    if (expliciet) return expliciet;

    const naam = String(scan.naam || "").toLowerCase();
    if (naam.includes("managementscan") || naam.includes("leidinggevende") || naam.includes("manager")) return "Leidinggevende";
    if (naam.includes("medewerkersscan") || naam.includes("medewerker") || naam.includes("teamlid")) return "Teamlid";

    const alleTekst = (scan.stellingen || [])
      .map(s => String(s.tekst || ""))
      .join(" ")
      .toLowerCase();

    const scoreManagement =
      (alleTekst.includes("medewerkers durven") ? 2 : 0) +
      (alleTekst.includes("richting mij") ? 2 : 0) +
      (alleTekst.includes("binnen mijn team") ? 1 : 0) +
      (alleTekst.includes("wat merk jij") ? 2 : 0) +
      (alleTekst.includes("wat gebeurt er nu met ideeën of signalen vanuit de werkvloer") ? 2 : 0) +
      (alleTekst.includes("ik heb goed zicht") ? 2 : 0) +
      (alleTekst.includes("waar zie je dat medewerkers zich") ? 2 : 0);

    const scoreMedewerkers =
      (alleTekst.includes("ik voel me begrepen door mijn collega's") ? 2 : 0) +
      (alleTekst.includes("ik voel me veilig om mijn mening te geven") ? 2 : 0) +
      (alleTekst.includes("mijn leidinggevende nodigt uit") ? 2 : 0) +
      (alleTekst.includes("wat zou jou helpen") ? 1 : 0) +
      (alleTekst.includes("wat kost jou op dit moment het meeste energie") ? 2 : 0) +
      (alleTekst.includes("ik voel me betrokken bij veranderingen binnen mijn team") ? 2 : 0);

    if (scoreManagement > scoreMedewerkers && scoreManagement >= 3) return "Leidinggevende";
    if (scoreMedewerkers > scoreManagement && scoreMedewerkers >= 3) return "Teamlid";

    return "";
  };

  const vasteRol = bepaalVasteRol(lijst);

  const introTekst = (() => {
    const explicieteIntro = String(lijst?.introductietekst || lijst?.intro || "").trim();
    if (explicieteIntro) return explicieteIntro;

    if (vasteRol === "Teamlid") {
      return "Deze vragenlijst helpt om beter te begrijpen hoe het werken binnen jouw team wordt ervaren. Er zijn geen goede of foute antwoorden. Jouw ervaring staat centraal. De uitkomsten worden gebruikt om samen te bepalen waar verbetering het meeste effect heeft.";
    }

    if (vasteRol === "Leidinggevende") {
      return "Deze vragenlijst helpt inzicht te krijgen in waar de belangrijkste uitdagingen en ontwikkelpunten binnen het team liggen. Er zijn geen goede of foute antwoorden. Het doel is richting bepalen.";
    }

    return "Deze vragenlijst helpt om zicht te krijgen op hoe samenwerking, veiligheid, verandering, energie en verbeteren binnen het team worden ervaren.";
  })();

  useEffect(() => {
    if (vasteRol) setRol(vasteRol);
  }, [vasteRol]);

  const slaAntwoordOp = (id, waarde) => {
    setAntwoorden((prev) => ({ ...prev, [id]: waarde }));
  };

  const indienen = async () => {
    setOpslaan(true);

    try {
      await addDoc(collection(db, "antwoorden"), {
        vragenlijstId: scanId,
        klant: lijst?.klant || "",
        rol: vasteRol || rol || "Onbekend",
        antwoorden,
        ingediend_op: serverTimestamp(),
      });

      setIngediend(true);
    } catch (err) {
      console.error("Fout bij opslaan:", err);
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
      return !(vasteRol || rol) || s.doelgroep === (vasteRol || rol);
    }
    return true;
  });
  const totaal = stellingen.length;
  const huidige = stellingen[stap - 1];
  const voortgang = stap === 0 ? 0 : Math.round((stap / totaal) * 100);
  const resterend = Math.max(totaal - stap, 0);
  const actieveRol = vasteRol || rol;

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
          <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7,marginBottom:16}}>
            {(isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) ? "Deze verdiepende scan bestaat uit" : "Deze scan bestaat uit"} {totaal} vragen en duurt ongeveer {(isGecombineerdeVerdieping(lijst) ? "10–18" : (isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) ? "6–10" : "5–8")} minuten. Je antwoorden zijn anoniem.
          </div>

          <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",textAlign:"left"}}>
            <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Introductie</div>
            <div style={{fontSize:14,color:ADM.text,lineHeight:1.8}}>
              {introTekst}
            </div>
          </div>
        </div>

        {vasteRol ? (
          <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Deze vragenlijst is bedoeld voor</div>
            <div style={{fontSize:18,fontWeight:700,color:ADM.white,marginBottom:8}}>
              {vasteRol === "Teamlid" ? "Medewerkers" : "Managers / leidinggevenden"}
            </div>
            <div style={{fontSize:13,color:ADM.muted,lineHeight:1.6}}>
              Om te voorkomen dat deelnemers de verkeerde vragenlijst invullen, staat de doelgroep van deze scan vast. Je kunt hier dus niet wisselen naar de andere vragenlijst.
            </div>
          </div>
        ) : (
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
        )}

        <button onClick={()=>{ if(actieveRol || vasteRol) setStap(1); }}
          style={{width:"100%",background:(actieveRol || vasteRol)?ADM.teal:"rgba(0,168,150,0.3)",color:(actieveRol || vasteRol)?"#FFFFFF":"rgba(255,255,255,0.75)",
            border:"none",borderRadius:12,padding:"16px 18px",fontWeight:800,fontSize:17,letterSpacing:"0.2px",
            boxShadow:(actieveRol || vasteRol)?"0 10px 24px rgba(0,168,150,0.28)":"none",
            cursor:(actieveRol || vasteRol)?"pointer":"not-allowed"}}>
          Start de teamscan →
        </button>
      </div>
    </div>
  );

  const kanDoorgaan = huidige.type==="open" || antwoorden[huidige.id] !== undefined;

  return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",flexDirection:"column"}}>
      <div style={{height:8,background:"rgba(255,255,255,0.08)"}}>
        <div style={{height:"100%",background:ADM.teal,width:`${voortgang}%`,transition:"width .4s",boxShadow:"0 0 16px rgba(0,168,150,0.35)"}}/>
      </div>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${ADM.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:PIJLERS[huidige.pijler]?.kleur||ADM.teal,flexShrink:0}}/>
          <span style={{fontSize:12,color:ADM.muted}}>{PIJLERS[huidige.pijler]?.naam}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{fontSize:13,color:ADM.white,fontWeight:700}}>Vraag {stap} van {totaal}</span>
          <span style={{fontSize:12,color:ADM.muted}}>{voortgang}% voltooid · nog {resterend} te gaan</span>
        </div>
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
                      transform:antwoorden[huidige.id]===n?"scale(1.06)":"scale(1)"}}>
                    {n}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:ADM.muted,padding:"0 2px"}}>
                <span>Helemaal oneens</span>
                <span>Helemaal eens</span>
              </div>
            </div>
          ) : (
            <textarea
              value={antwoorden[huidige.id] || ""}
              onChange={(e)=>slaAntwoordOp(huidige.id,e.target.value)}
              rows={6}
              placeholder="Typ hier je antwoord..."
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,
                padding:"16px 18px",fontSize:15,color:ADM.white,resize:"vertical",outline:"none",lineHeight:1.6}}
            />
          )}
        </div>
      </div>
      <div style={{padding:"20px 24px",borderTop:`1px solid ${ADM.border}`,display:"flex",justifyContent:"space-between",gap:12}}>
        <button onClick={()=>setStap(stap-1)}
          style={{background:"transparent",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 20px",
            fontWeight:600,fontSize:14,cursor:"pointer"}}>
          ← Vorige
        </button>

        {stap < totaal ? (
          <button onClick={()=>kanDoorgaan && setStap(stap+1)}
            style={{background:kanDoorgaan?ADM.teal:"rgba(0,168,150,0.3)",color:kanDoorgaan?"#FFFFFF":"rgba(255,255,255,0.75)",border:"none",borderRadius:10,
              padding:"12px 20px",fontWeight:800,fontSize:14,cursor:kanDoorgaan?"pointer":"not-allowed"}}>
            Volgende →
          </button>
        ) : (
          <button onClick={indienen} disabled={opslaan}
            style={{background:ADM.teal,color:"#FFFFFF",border:"none",borderRadius:10,padding:"12px 20px",
              fontWeight:800,fontSize:14,cursor:opslaan?"wait":"pointer",opacity:opslaan?0.8:1,boxShadow:"0 10px 24px rgba(0,168,150,0.22)"}}>
            {opslaan ? "Versturen..." : "Scan indienen"}
          </button>
        )}
      </div>
    </div>
  );
}

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
