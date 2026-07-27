// Versieerbare, deterministische inhoud voor de individuele perceptiescan.
export const FREE_SCAN_VERSION = "1.0.0";
export const SCORE_MODEL_VERSION = "1.0.0";

export const FREE_SCAN_SCALE = [
  { value: 1, label: "Helemaal oneens" }, { value: 2, label: "Oneens" },
  { value: 3, label: "Neutraal" }, { value: 4, label: "Eens" },
  { value: 5, label: "Helemaal eens" },
];

export const FREE_SCAN_THEMES = [
  { id: "veiligheid", label: "Psychologische veiligheid", color: "#5A8C3C", description: "Ruimte om zorgen, fouten en verschil uit te spreken.", reflection: "Welk gesprek stel jij uit omdat de ruimte nog niet veilig genoeg voelt?", experiment: "Vraag aan het einde van één overleg: welk belangrijk punt is nog niet uitgesproken?" },
  { id: "communicatie", label: "Communicatie en luisteren", color: "#0F766E", description: "Elkaar begrijpen en misverstanden constructief bespreken.", reflection: "Wanneer voelde jij je voor het laatst echt gehoord in je team?", experiment: "Vat in één overleg eerst het standpunt van een ander samen voordat je reageert." },
  { id: "eigenaarschap", label: "Eigenaarschap en duidelijkheid", color: "#3A7DBF", description: "Weten wat wordt verwacht en verbeteringen daadwerkelijk oppakken.", reflection: "Bij welk besluit is nu niet helder wie de volgende stap zet?", experiment: "Leg bij één besluit eigenaar, eerstvolgende stap en evaluatiedatum vast." },
  { id: "verbinding", label: "Samenwerking en verbinding", color: "#6B4E9E", description: "Steun, respect voor verschillen en gezamenlijke betrokkenheid.", reflection: "Welk verschil in stijl kan jullie samenwerking juist sterker maken?", experiment: "Vraag één collega welke steun die deze week van jou nodig heeft." },
  { id: "energie", label: "Energie en motivatie", color: "#E8821A", description: "Voldoening, haalbare belasting en ruimte voor herstel.", reflection: "Wat is het kleinste terugkerende energielek dat je kunt beïnvloeden?", experiment: "Benoem in een check-in één energiegever en één beïnvloedbaar energielek." },
  { id: "leiderschap", label: "Leiderschap en beweging", color: "#8B5CF6", description: "Open dialoog, richting en ruimte om te leren en bewegen.", reflection: "Waar helpt meer richting, en waar helpt juist meer ruimte?", experiment: "Vraag bij één verandering expliciet wat mensen nodig hebben om mee te bewegen." },
];

// Alle formuleringen zijn geselecteerd of persoonlijk afgeleid van de bestaande medewerkersscan.
const q = (id, theme, text, sourceId, reverse = false) => ({ id, theme, text, sourceId, reverse });
export const FREE_SCAN_QUESTIONS = [
  q("v1","veiligheid","Ik voel me veilig om mijn mening te geven.",1006), q("v2","veiligheid","Ik durf fouten of twijfels te bespreken.",1007), q("v3","veiligheid","In mijn team wordt verschil in stijl en achtergrond gewaardeerd.",1010), q("v4","veiligheid","Belangrijke zorgen worden in mijn team open besproken.",1003),
  q("c1","communicatie","Ik voel me begrepen door mijn collega’s.",1001), q("c2","communicatie","Verschillen in werkstijl en communicatie worden gerespecteerd.",1002), q("c3","communicatie","Misverstanden worden meestal open en constructief besproken.",1003), q("c4","communicatie","Ik pas mijn manier van communiceren aan verschillende collega’s aan.",1004),
  q("e1","eigenaarschap","Ik voel eigenaarschap over verbeteringen in mijn werk.",1023), q("e2","eigenaarschap","Ik heb vertrouwen dat verbeteringen ook echt worden opgepakt.",1028), q("e3","eigenaarschap","Verbeteren voelt als onderdeel van mijn werk, niet als extra taak.",1025), q("e4","eigenaarschap","Initiatief nemen wordt in mijn team aangemoedigd.",1009),
  q("s1","verbinding","Ik ervaar voldoende autonomie en ondersteuning.",1020), q("s2","verbinding","Ik voel me betrokken bij veranderingen binnen mijn team.",1027), q("s3","verbinding","Ik vertrouw erop dat collega’s mij steunen als het nodig is.",4), q("s4","verbinding","Ik leer van mijn collega’s.",18),
  q("n1","energie","Mijn werk kost mij niet structureel meer energie dan het oplevert.",1017), q("n2","energie","Ik haal voldoening uit mijn werk.",1018), q("n3","energie","Frustraties in het dagelijks werk worden serieus genomen.",1019), q("n4","energie","De werkdruk is voor mij beheersbaar.",13),
  q("l1","leiderschap","Mijn leidinggevende nodigt uit tot openheid en dialoog.",1008), q("l2","leiderschap","Veranderingen worden duidelijk en begrijpelijk uitgelegd.",1012), q("l3","leiderschap","Mijn zorgen of gevoelens bij verandering krijgen aandacht.",1014), q("l4","leiderschap","Leren en experimenteren wordt aangemoedigd.",1024),
];

export const SCORE_ZONES = [
  { min: 75, id: "strong", label: "Sterke basis" },
  { min: 55, id: "attention", label: "Aandacht en verdieping" },
  { min: 0, id: "pattern", label: "Mogelijk belemmerend patroon" },
];

export const PATTERN_RULES = [
  { id:"betrokken_lage_energie", when:{ high:"verbinding", low:"energie" }, title:"Betrokkenheid vraagt energie", text:"Je antwoorden kunnen wijzen op veel onderlinge betrokkenheid, terwijl de beschikbare energie onder druk staat." },
  { id:"veilig_weinig_eigenaarschap", when:{ high:"veiligheid", low:"eigenaarschap" }, title:"Ruimte kan nog meer beweging krijgen", text:"Er lijkt ruimte om je uit te spreken, maar die ruimte vertaalt zich mogelijk nog niet altijd naar eigenaarschap en opvolging." },
  { id:"steun_weinig_aanspreken", when:{ high:"verbinding", low:"communicatie" }, title:"Steun en het echte gesprek", text:"Onderlinge steun lijkt aanwezig, terwijl het constructief bespreken van verschil mogelijk extra aandacht verdient." },
  { id:"richting_lage_veiligheid", when:{ high:"leiderschap", low:"veiligheid" }, title:"Richting zonder alle stemmen", text:"Richting wordt mogelijk duidelijk ervaren, maar niet iedere zorg of afwijkende mening lijkt even gemakkelijk op tafel te komen." },
  { id:"veel_praten_weinig_bewegen", when:{ high:"communicatie", low:"eigenaarschap" }, title:"Van gesprek naar opvolging", text:"Er lijkt veel basis voor gesprek, terwijl besluiten en verbeteringen mogelijk niet steeds een duidelijke eigenaar krijgen." },
];
