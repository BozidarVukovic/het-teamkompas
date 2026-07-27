const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const EMAILJS_SERVICE_ID = defineSecret("EMAILJS_SERVICE_ID");
const EMAILJS_FREE_SCAN_TEMPLATE_ID = defineSecret("EMAILJS_FREE_SCAN_TEMPLATE_ID");
const EMAILJS_PUBLIC_KEY = defineSecret("EMAILJS_PUBLIC_KEY");

const COLLECTION_VRAGENLIJSTEN = "vragenlijsten";
const COLLECTION_ANTWOORDEN = "antwoorden";
const COLLECTION_ADVIESRAPPORTEN = "adviesrapporten";
const COLLECTION_AANVRAGEN = "teamscanSelfserviceAanvragen";
const COLLECTION_TEAMWIELEN = "teamwielen";

const AI_MODEL = "gpt-4.1-mini";

// Gratis individuele teamscan: inhoud en scoremodel zijn bewust deterministisch.
const FREE_SCAN_VERSION = "1.0.0";
const FREE_SCORE_VERSION = "1.0.0";
const FREE_THEMES = [
  ["veiligheid","Psychologische veiligheid","Ruimte om zorgen, fouten en verschil uit te spreken.","Welk gesprek stel jij uit omdat de ruimte nog niet veilig genoeg voelt?","Vraag aan het einde van één overleg: welk belangrijk punt is nog niet uitgesproken?"],
  ["communicatie","Communicatie en luisteren","Elkaar begrijpen en misverstanden constructief bespreken.","Wanneer voelde jij je voor het laatst echt gehoord in je team?","Vat in één overleg eerst het standpunt van een ander samen voordat je reageert."],
  ["eigenaarschap","Eigenaarschap en duidelijkheid","Weten wat wordt verwacht en verbeteringen daadwerkelijk oppakken.","Bij welk besluit is nu niet helder wie de volgende stap zet?","Leg bij één besluit eigenaar, eerstvolgende stap en evaluatiedatum vast."],
  ["verbinding","Samenwerking en verbinding","Steun, respect voor verschillen en gezamenlijke betrokkenheid.","Welk verschil in stijl kan jullie samenwerking juist sterker maken?","Vraag één collega welke steun die deze week van jou nodig heeft."],
  ["energie","Energie en motivatie","Voldoening, haalbare belasting en ruimte voor herstel.","Wat is het kleinste terugkerende energielek dat je kunt beïnvloeden?","Benoem in een check-in één energiegever en één beïnvloedbaar energielek."],
  ["leiderschap","Leiderschap en beweging","Open dialoog, richting en ruimte om te leren en bewegen.","Waar helpt meer richting, en waar helpt juist meer ruimte?","Vraag bij één verandering expliciet wat mensen nodig hebben om mee te bewegen."],
].map(([id,label,description,reflection,experiment])=>({id,label,description,reflection,experiment}));
const FREE_QUESTION_THEMES = {v1:"veiligheid",v2:"veiligheid",v3:"veiligheid",v4:"veiligheid",c1:"communicatie",c2:"communicatie",c3:"communicatie",c4:"communicatie",e1:"eigenaarschap",e2:"eigenaarschap",e3:"eigenaarschap",e4:"eigenaarschap",s1:"verbinding",s2:"verbinding",s3:"verbinding",s4:"verbinding",n1:"energie",n2:"energie",n3:"energie",n4:"energie",l1:"leiderschap",l2:"leiderschap",l3:"leiderschap",l4:"leiderschap"};
const FREE_PATTERNS = [
  ["betrokken_lage_energie","verbinding","energie","Betrokkenheid vraagt energie","Je antwoorden kunnen wijzen op veel onderlinge betrokkenheid, terwijl de beschikbare energie onder druk staat."],
  ["veilig_weinig_eigenaarschap","veiligheid","eigenaarschap","Ruimte kan nog meer beweging krijgen","Er lijkt ruimte om je uit te spreken, maar die ruimte vertaalt zich mogelijk nog niet altijd naar eigenaarschap en opvolging."],
  ["steun_weinig_aanspreken","verbinding","communicatie","Steun en het echte gesprek","Onderlinge steun lijkt aanwezig, terwijl het constructief bespreken van verschil mogelijk extra aandacht verdient."],
  ["richting_lage_veiligheid","leiderschap","veiligheid","Richting zonder alle stemmen","Richting wordt mogelijk duidelijk ervaren, maar niet iedere zorg of afwijkende mening lijkt even gemakkelijk op tafel te komen."],
  ["veel_praten_weinig_bewegen","communicatie","eigenaarschap","Van gesprek naar opvolging","Er lijkt veel basis voor gesprek, terwijl besluiten en verbeteringen mogelijk niet steeds een duidelijke eigenaar krijgen."],
].map(([id,high,low,title,text])=>({id,high,low,title,text}));

function freeZone(score){ return score>=75?{id:"strong",label:"Sterke basis"}:score>=55?{id:"attention",label:"Aandacht en verdieping"}:{id:"pattern",label:"Mogelijk belemmerend patroon"}; }
function calculateFreeResults(answers){
  const themeScores=FREE_THEMES.map(theme=>{const values=Object.entries(FREE_QUESTION_THEMES).filter(([,t])=>t===theme.id).map(([id])=>Number(answers[id])).filter(v=>Number.isFinite(v)&&v>=1&&v<=5);const score=values.length?Math.round(((values.reduce((a,b)=>a+b,0)/values.length)-1)*25):null;return {...theme,score,answered:values.length,zone:score===null?null:freeZone(score)};});
  if(themeScores.some(t=>t.answered!==4)) throw new HttpsError("invalid-argument","Beantwoord alle 24 vragen.");
  const ranked=[...themeScores].sort((a,b)=>b.score-a.score), strengths=ranked.slice(0,2), opportunities=[...ranked].reverse().slice(0,2);
  const patterns=FREE_PATTERNS.filter(p=>themeScores.find(t=>t.id===p.high).score>=75&&themeScores.find(t=>t.id===p.low).score<55).slice(0,3);
  return {themeScores,strengths,opportunities,patterns,reflections:opportunities.map(t=>t.reflection),experiments:opportunities.map(t=>t.experiment),scoreModelVersion:FREE_SCORE_VERSION};
}

const freeRate = new Map();
function enforceFreeRate(request, limit=12){const ip=request.rawRequest?.ip||"unknown", now=Date.now(), recent=(freeRate.get(ip)||[]).filter(t=>now-t<3600000);if(recent.length>=limit)throw new HttpsError("resource-exhausted","Te veel verzoeken. Probeer het later opnieuw.");recent.push(now);freeRate.set(ip,recent);}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function average(values) {
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function scoreStatus(score) {
  if (score === null) return "onvoldoende data";
  if (score >= 4.2) return "sterk ontwikkeld";
  if (score >= 3.5) return "stabiel met ontwikkelruimte";
  if (score >= 2.8) return "kwetsbaar";
  return "urgent aandachtspunt";
}

function domainAdvice(domainName, score) {
  if (score === null) {
    return `Voor ${domainName} is nog onvoldoende data beschikbaar om een betrouwbaar advies te geven.`;
  }

  if (score >= 4.2) {
    return `Het domein ${domainName} lijkt sterk ontwikkeld. Maak expliciet welk gedrag hieraan bijdraagt, zodat het team dit bewust kan vasthouden.`;
  }

  if (score >= 3.5) {
    return `Het domein ${domainName} is redelijk stabiel. Bespreek met het team welke kleine verbeteringen direct merkbaar zijn in het dagelijks werk.`;
  }

  if (score >= 2.8) {
    return `Het domein ${domainName} is kwetsbaar. Onderzoek waar spanning, onduidelijkheid of energieverlies ontstaat en kies één concreet gedragsexperiment.`;
  }

  return `Het domein ${domainName} vraagt urgent aandacht. Start met luisteren, veiligheid creëren en samen benoemen wat nu niet wordt uitgesproken.`;
}

const DOMAIN_CONFIG = {
  veiligheidLeiderschap: {
    label: "Veiligheid en leiderschap",
    fields: ["1001", "1002", "1003", "1004"],
  },
  belevingVerandering: {
    label: "Beleving van verandering",
    fields: ["1006", "1007", "1008", "1009"],
  },
  energieMotivatie: {
    label: "Energie en motivatie",
    fields: ["1010", "1011", "1012", "1013"],
  },
  verbeterenLeren: {
    label: "Verbeteren en leren",
    fields: ["1014", "1015", "1016", "1017"],
  },
};

function getAnswersObject(answerData) {
  if (!answerData) return {};
  return answerData.antwoorden || answerData.answers || answerData;
}

function calculateDomainScores(answerDocs) {
  const result = {};

  for (const [domainKey, domain] of Object.entries(DOMAIN_CONFIG)) {
    const values = [];

    for (const doc of answerDocs) {
      const answerData = doc.data() || {};
      const answers = getAnswersObject(answerData);

      for (const field of domain.fields) {
        const value = answers[field];

        if (isNumber(value)) {
          values.push(value);
        }
      }
    }

    const score = average(values);

    result[domainKey] = {
      label: domain.label,
      score,
      status: scoreStatus(score),
      aantalScores: values.length,
      advice: domainAdvice(domain.label, score),
    };
  }

  return result;
}

function getLowestDomain(domainScores) {
  const domains = Object.values(domainScores).filter(
    (domain) => domain.score !== null
  );

  if (!domains.length) return null;

  return domains.sort((a, b) => a.score - b.score)[0];
}

function getHighestDomain(domainScores) {
  const domains = Object.values(domainScores).filter(
    (domain) => domain.score !== null
  );

  if (!domains.length) return null;

  return domains.sort((a, b) => b.score - a.score)[0];
}

async function getVragenlijstDocs(vragenlijstIds) {
  const docs = [];

  for (const vragenlijstId of vragenlijstIds) {
    const ref = db.collection(COLLECTION_VRAGENLIJSTEN).doc(vragenlijstId);
    const doc = await ref.get();

    if (!doc.exists) {
      throw new HttpsError(
        "not-found",
        `Geen vragenlijst gevonden met id: ${vragenlijstId}.`
      );
    }

    docs.push(doc);
  }

  return docs;
}

async function getAntwoordenForVragenlijsten(vragenlijstIds) {
  const allAnswerDocs = [];

  for (const vragenlijstId of vragenlijstIds) {
    const snapshot = await db
      .collection(COLLECTION_ANTWOORDEN)
      .where("vragenlijstId", "==", vragenlijstId)
      .get();

    allAnswerDocs.push(...snapshot.docs);
  }

  return allAnswerDocs;
}

async function getTeamwielInsights(teamwielId) {
  if (!teamwielId) {
    return {
      beschikbaar: false,
      teamwielId: "",
      melding: "Er is geen teamwiel gekoppeld aan dit adviesrapport.",
    };
  }

  const teamwielRef = db.collection(COLLECTION_TEAMWIELEN).doc(teamwielId);
  const teamwielDoc = await teamwielRef.get();

  if (!teamwielDoc.exists) {
    throw new HttpsError(
      "not-found",
      `Geen teamwiel gevonden met id: ${teamwielId}.`
    );
  }

  const data = teamwielDoc.data() || {};

  return {
    beschikbaar: true,
    teamwielId,
    klantNaam: data.klantNaam || "",
    teamNaam: data.teamNaam || "",
    rapportageNaam: data.rapportageNaam || "",
    bron: data.bron || "",
    aantalTeamleden: data.aantalTeamleden || null,
    status: data.status || "",
    kleurGemiddelden: data.kleurGemiddelden || {},
    kleurVerdeling: data.kleurVerdeling || {},
    dominanteVoorkeuren: data.dominanteVoorkeuren || [],
    ondervertegenwoordigdeVoorkeuren:
      data.ondervertegenwoordigdeVoorkeuren || [],
    teamwielDuiding: data.teamwielDuiding || [],
    adviesVoorVervolgstappen: data.adviesVoorVervolgstappen || [],
  };
}

function buildTeamwielSummary(teamwielInsights) {
  if (!teamwielInsights || !teamwielInsights.beschikbaar) {
    return "Er is nog geen teamwiel gekoppeld. Het advies is daarom uitsluitend gebaseerd op de teamscanresultaten.";
  }

  const dominant = (teamwielInsights.dominanteVoorkeuren || []).join(" en ");
  const ondervertegenwoordigd = (
    teamwielInsights.ondervertegenwoordigdeVoorkeuren || []
  ).join(" en ");

  if (!dominant) {
    return "Er is teamwieldata gekoppeld, maar dominante voorkeuren zijn nog niet vastgelegd.";
  }

  return `Het gekoppelde teamwiel laat zien dat ${dominant} relatief dominant aanwezig zijn in het voorkeursgedrag van het team. Houd in de vervolgstappen bewust rekening met minder dominante voorkeuren${ondervertegenwoordigd ? `, zoals ${ondervertegenwoordigd}` : ""}, zodat tempo en actie worden gecombineerd met luisteren, reflectie en borging.`;
}

function buildExecutiveSummary({
  rapportageNaam,
  klantNaam,
  answerCount,
  domainScores,
}) {
  const lowestDomain = getLowestDomain(domainScores);
  const highestDomain = getHighestDomain(domainScores);

  if (!answerCount) {
    return `Voor ${rapportageNaam || "deze rapportage"} zijn nog geen gekoppelde antwoorden gevonden. Controleer eerst of de antwoorden correct gekoppeld zijn aan de meegegeven vragenlijst-id’s.`;
  }

  if (!lowestDomain || !highestDomain) {
    return `Voor ${rapportageNaam || "deze rapportage"} zijn ${answerCount} antwoorden gevonden, maar de beschikbare data is nog onvoldoende gestructureerd voor een volledige domeinanalyse.`;
  }

  return `Voor ${klantNaam || "de klant"}, ${rapportageNaam || "deze rapportage"}, zijn ${answerCount} antwoorden geanalyseerd. Het sterkste domein is ${highestDomain.label.toLowerCase()} met een score van ${highestDomain.score}. Het belangrijkste aandachtspunt is ${lowestDomain.label.toLowerCase()} met een score van ${lowestDomain.score}. Het advies is om de uitkomsten niet alleen als score te bespreken, maar vooral te vertalen naar herkenbare voorbeelden uit het dagelijks werk.`;
}

function buildRecommendedNextSteps(domainScores) {
  const lowestDomain = getLowestDomain(domainScores);

  if (!lowestDomain) {
    return [
      "Controleer of de juiste vragenlijst-id’s zijn meegegeven.",
      "Controleer of de antwoorden via vragenlijstId aan de juiste vragenlijsten gekoppeld zijn.",
      "Genereer daarna opnieuw een conceptadvies.",
    ];
  }

  return [
    `Bespreek eerst het domein ${lowestDomain.label.toLowerCase()} met de leidinggevende.`,
    "Start de teamsessie met herkenning: wat klopt, wat ontbreekt en wat vraagt toelichting?",
    "Kies één klein gedragsexperiment voor de komende twee weken.",
    "Maak expliciet welk gedrag de leidinggevende zelf gaat laten zien.",
    "Plan een kort borgmoment om te toetsen of het gedragsexperiment effect heeft.",
  ];
}

function collectOpenAnswers(answerDocs) {
  const openAnswers = [];

  for (const doc of answerDocs) {
    const data = doc.data() || {};
    const answers = getAnswersObject(data);

    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === "string" && value.trim().length > 0) {
        openAnswers.push({
          vraagId: key,
          antwoord: value.trim(),
        });
      }
    }
  }

  return openAnswers.slice(0, 30);
}

function buildAiInput({
  rapportageNaam,
  klantNaam,
  vragenlijstIds,
  vragenlijstDocs,
  answerDocs,
  domainScores,
  lowestDomain,
  highestDomain,
  teamwielInsights,
  teamwielSummary,
  openAnswersSample,
}) {
  return {
    rapportageNaam: rapportageNaam || "",
    klantNaam: klantNaam || "",
    vragenlijstIds,
    aantalVragenlijsten: vragenlijstDocs.length,
    aantalAntwoorden: answerDocs.length,
    hoogsteDomein: highestDomain || null,
    laagsteDomein: lowestDomain || null,
    domeinscores: domainScores,
    teamwielBeschikbaar: Boolean(teamwielInsights?.beschikbaar),
    teamwielSummary,
    teamwielInsights,
    openAnswersSample,
  };
}

function buildAiPrompt(aiInput) {
  return `
Je bent een senior organisatieadviseur, teamcoach en veranderkundige.

Je schrijft een professioneel adviesrapport voor Mijn Teamkompas. Het rapport is bedoeld voor de leidinggevende en het team. Gebruik ontwikkeltaal, geen beoordelende taal. Schrijf concreet, warm, scherp en toepasbaar.

Gebruik de volgende bronnen:
1. Teamscanresultaten van medewerkers en management.
2. Domeinscores op veiligheid en leiderschap, beleving van verandering, energie en motivatie, en verbeteren en leren.
3. Het laagste en hoogste domein.
4. Aantal respondenten.
5. Open antwoorden, als die beschikbaar zijn.
6. Teamwielinzichten vanuit Insights Discovery, als die beschikbaar zijn.

Belangrijke uitgangspunten:
- Gebruik het teamwiel als voorkeursgedrag, niet als diagnose.
- Vermijd labels zoals “het team is rood/geel”.
- Schrijf liever: “Het team lijkt relatief veel voorkeur te hebben voor tempo, interactie en resultaat.”
- Benoem dat minder dominante voorkeuren bewust georganiseerd moeten worden.
- Geef adviezen die passen bij het voorkeursgedrag van het team.
- Maak vervolgstappen klein, herkenbaar en uitvoerbaar.
- Gebruik geen medische, psychologische of beoordelende taal.
- Het advies is bedoeld voor ontwikkeling, teamreflectie en samenwerking.
- Schrijf in het Nederlands.

Geef je antwoord terug als geldige JSON met exact deze structuur:
{
  "kernobservatie": "",
  "belangrijkstePatroon": "",
  "perceptiegap": "",
  "teamwielDuiding": "",
  "risicoAlsNietsVerandert": "",
  "adviesVoorLeidinggevende": "",
  "adviesVoorTeam": "",
  "vervolgstappen": [
    ""
  ],
  "voorstelTeamsessie": {
    "doel": "",
    "duur": "",
    "opbouw": [
      {
        "onderdeel": "",
        "tijd": "",
        "werkvorm": "",
        "doel": ""
      }
    ]
  },
  "toonEnGebruik": ""
}

Data:
${JSON.stringify(aiInput, null, 2)}
`;
}

function buildFallbackAiAdvice({
  executiveSummary,
  lowestDomain,
  highestDomain,
  teamwielSummary,
  recommendedNextSteps,
}) {
  return {
    beschikbaar: false,
    fallback: true,
    foutmelding: "",
    inhoud: {
      kernobservatie: executiveSummary,
      belangrijkstePatroon: lowestDomain
        ? `Het belangrijkste aandachtspunt ligt bij ${lowestDomain.label.toLowerCase()}, terwijl ${highestDomain ? highestDomain.label.toLowerCase() : "een ander domein"} relatief sterker naar voren komt.`
        : "Er is nog onvoldoende data beschikbaar voor een scherpe patroonduiding.",
      perceptiegap:
        "De perceptiegap tussen manager en medewerkers wordt in deze versie nog niet afzonderlijk berekend. Dit wordt in een volgende versie toegevoegd.",
      teamwielDuiding: teamwielSummary,
      risicoAlsNietsVerandert:
        "Als de uitkomsten niet worden besproken, bestaat het risico dat het team de scores als losse meting ziet in plaats van als startpunt voor eigenaarschap en verbetering.",
      adviesVoorLeidinggevende: lowestDomain
        ? `Begin met luisteren en onderzoeken wat er onder de score op ${lowestDomain.label.toLowerCase()} ligt. Maak daarna één concreet gedrag zichtbaar dat je zelf anders gaat doen.`
        : "Zorg eerst dat de datakoppeling compleet is voordat er conclusies worden getrokken.",
      adviesVoorTeam:
        "Gebruik de uitkomsten als gezamenlijke spiegel. Bespreek wat herkenbaar is, wat ontbreekt en welke kleine stap het team zelf wil zetten.",
      vervolgstappen: recommendedNextSteps,
      voorstelTeamsessie: {
        doel:
          "De teamscan en het teamwiel vertalen naar herkenbare patronen, gedeeld eigenaarschap en concrete vervolgafspraken.",
        duur: "2 tot 4 uur",
        opbouw: [
          {
            onderdeel: "Opening en bedoeling",
            tijd: "15 minuten",
            werkvorm: "leidinggevende deelt waarom deze teamscan belangrijk is",
            doel: "veiligheid en richting creëren",
          },
          {
            onderdeel: "Herkennen van de uitkomsten",
            tijd: "45 minuten",
            werkvorm: "teamgesprek in kleine groepen",
            doel: "scores verbinden aan voorbeelden uit het dagelijks werk",
          },
          {
            onderdeel: "Teamwiel en voorkeursgedrag",
            tijd: "45 minuten",
            werkvorm: "reflectie op sterke voorkeuren en blinde vlekken",
            doel: "vervolgstappen laten aansluiten bij het voorkeursgedrag",
          },
          {
            onderdeel: "Gedragsexperiment kiezen",
            tijd: "45 minuten",
            werkvorm: "gezamenlijk kiezen van één concrete vervolgstap",
            doel: "van inzicht naar actie gaan",
          },
        ],
      },
      toonEnGebruik:
        "Dit advies is bedoeld voor ontwikkeling, teamreflectie en samenwerking. Het is niet bedoeld voor beoordeling, selectie of psychologische diagnostiek.",
    },
  };
}

async function generateAiAdvice({
  executiveSummary,
  lowestDomain,
  highestDomain,
  teamwielSummary,
  recommendedNextSteps,
  aiInput,
}) {
  const fallback = buildFallbackAiAdvice({
    executiveSummary,
    lowestDomain,
    highestDomain,
    teamwielSummary,
    recommendedNextSteps,
  });

  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        ...fallback,
        foutmelding: "OPENAI_API_KEY ontbreekt.",
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Je bent een ervaren Nederlandse organisatieadviseur en teamcoach. Je schrijft veilig, concreet en ontwikkelingsgericht.",
        },
        {
          role: "user",
          content: buildAiPrompt(aiInput),
        },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);

    return {
      beschikbaar: true,
      fallback: false,
      inhoud: parsed,
    };
  } catch (error) {
    console.error("AI-advies genereren mislukt:", error);

    return {
      ...fallback,
      foutmelding: error.message || "AI-advies kon niet worden gegenereerd.",
    };
  }
}

async function generateAdviceForVragenlijstIds({
  vragenlijstIds,
  rapportageNaam,
  klantNaam,
  teamwielId,
}) {
  if (!Array.isArray(vragenlijstIds) || vragenlijstIds.length < 2) {
    throw new HttpsError(
      "invalid-argument",
      "Geef minimaal twee vragenlijstIds mee: medewerkers en management."
    );
  }

  const vragenlijstDocs = await getVragenlijstDocs(vragenlijstIds);
  const answerDocs = await getAntwoordenForVragenlijsten(vragenlijstIds);
  const teamwielInsights = await getTeamwielInsights(teamwielId);
  const teamwielSummary = buildTeamwielSummary(teamwielInsights);

  const domainScores = calculateDomainScores(answerDocs);
  const lowestDomain = getLowestDomain(domainScores);
  const highestDomain = getHighestDomain(domainScores);

  const executiveSummary = buildExecutiveSummary({
    rapportageNaam,
    klantNaam,
    answerCount: answerDocs.length,
    domainScores,
  });

  const recommendedNextSteps = buildRecommendedNextSteps(domainScores);

  if (teamwielInsights.beschikbaar) {
    recommendedNextSteps.push(
      ...((teamwielInsights.adviesVoorVervolgstappen || []).map(
        (stap) => `Teamwiel: ${stap}`
      ))
    );
  }

  const openAnswersSample = collectOpenAnswers(answerDocs);

  const aiInput = buildAiInput({
    rapportageNaam,
    klantNaam,
    vragenlijstIds,
    vragenlijstDocs,
    answerDocs,
    domainScores,
    lowestDomain,
    highestDomain,
    teamwielInsights,
    teamwielSummary,
    openAnswersSample,
  });

  const aiAdvice = await generateAiAdvice({
    executiveSummary,
    lowestDomain,
    highestDomain,
    teamwielSummary,
    recommendedNextSteps,
    aiInput,
  });

  const adviesRef = db.collection(COLLECTION_ADVIESRAPPORTEN).doc();

  await adviesRef.set({
    status: "concept",
    source: "firebase_function_vragenlijst_analysis_v2_ai",
    generatedAt: FieldValue.serverTimestamp(),

    rapportageNaam: rapportageNaam || "",
    klantNaam: klantNaam || "",
    vragenlijstIds,
    teamwielId: teamwielId || "",
    teamwielInsights,
    teamwielSummary,

    dataQuality: {
      vragenlijstCount: vragenlijstDocs.length,
      answerCount: answerDocs.length,
      hasVragenlijsten: vragenlijstDocs.length > 0,
      hasAnswers: answerDocs.length > 0,
      hasTeamwiel: Boolean(teamwielInsights.beschikbaar),
      openAnswersSampleCount: openAnswersSample.length,
      hasAiAdvice: Boolean(aiAdvice.beschikbaar),
    },

    vragenlijsten: vragenlijstDocs.map((doc) => {
      const data = doc.data() || {};

      return {
        id: doc.id,
        titel: data.titel || data.naam || "",
        type: data.type || data.scanType || "",
        doelgroep: data.doelgroep || "",
        metingId: data.metingId || "",
      };
    }),

    executiveSummary,
    highestDomain: highestDomain || null,
    lowestDomain: lowestDomain || null,
    domainScores,
    recommendedNextSteps,
    openAnswersSample,

    aiAdvice,
    aiModel: AI_MODEL,
    aiAdviceGeneratedAt: FieldValue.serverTimestamp(),

    reportSections: {
      opening:
        "Dit conceptadvies is automatisch opgesteld op basis van de gecombineerde teamscandata van medewerkers en management.",
      interpretation:
        "De scores geven een eerste beeld van hoe het team samenwerking, verandering, energie en verbeterkracht ervaart. De uitkomst moet altijd worden besproken met de leidinggevende en het team, zodat cijfers worden verbonden aan concrete voorbeelden uit de praktijk.",
      teamwielInterpretation: teamwielSummary,
      leadershipAdvice: lowestDomain
        ? `Voor de leidinggevende ligt de eerste opgave bij ${lowestDomain.label.toLowerCase()}. Begin met luisteren, ordenen en het expliciet maken van wat mensen nodig hebben om eigenaarschap te nemen.`
        : "Voor de leidinggevende is het advies om eerst te zorgen voor een complete datakoppeling.",
      teamAdvice: lowestDomain
        ? `Voor het team is het advies om samen te onderzoeken welk gedrag ${lowestDomain.label.toLowerCase()} versterkt of belemmert. Maak dit klein, concreet en bespreekbaar.`
        : "Voor het team is het advies om eerst voldoende input op te halen voordat conclusies worden getrokken.",
    },
  });

  return {
    success: true,
    route: "vragenlijstIds",
    message: `Conceptadvies is opgeslagen bij adviesrapporten/${adviesRef.id}.`,
    adviesrapportId: adviesRef.id,
    vragenlijstCount: vragenlijstDocs.length,
    answerCount: answerDocs.length,
    hasTeamwiel: Boolean(teamwielInsights.beschikbaar),
    hasAiAdvice: Boolean(aiAdvice.beschikbaar),
    teamwielId: teamwielId || "",
    lowestDomain: lowestDomain ? lowestDomain.label : null,
    highestDomain: highestDomain ? highestDomain.label : null,
  };
}

async function generateAdviceForScanAanvraag(scanId) {
  const aanvraagRef = db.collection(COLLECTION_AANVRAGEN).doc(scanId);
  const aanvraagDoc = await aanvraagRef.get();

  if (!aanvraagDoc.exists) {
    throw new HttpsError(
      "not-found",
      `Geen teamscanaanvraag gevonden met id: ${scanId}.`
    );
  }

  const aanvraagData = aanvraagDoc.data() || {};

  await aanvraagRef.collection("aiAdvice").doc("latest").set({
    status: "concept",
    source: "firebase_function_scan_request_test",
    generatedAt: FieldValue.serverTimestamp(),
    scanId,
    aanvraag: {
      bedrijf: aanvraagData.bedrijf || "",
      afdeling: aanvraagData.afdeling || "",
      managerNaam: aanvraagData.managerNaam || "",
      managerEmail: aanvraagData.managerEmail || "",
    },
    executiveSummary:
      "Dit is de oude testroute op basis van een teamscanaanvraag. Voor echte rapportages wordt voortaan de gecombineerde vragenlijstIds-route gebruikt.",
  });

  await aanvraagRef.set(
    {
      status: "conceptadvies_test_gereed",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    success: true,
    route: "scanAanvraag",
    message: `Testadvies is opgeslagen bij ${COLLECTION_AANVRAGEN}/${scanId}/aiAdvice/latest.`,
    scanId,
  };
}

exports.generateTeamAdvice = onCall(
  { secrets: [OPENAI_API_KEY] },
  async (request) => {
    try {
      console.log("generateTeamAdvice aangeroepen", request.data);
      console.log("Firebase projectId:", process.env.GCLOUD_PROJECT);

      const { vragenlijstIds, rapportageNaam, klantNaam, teamwielId, scanId } =
        request.data || {};

      if (vragenlijstIds) {
        return await generateAdviceForVragenlijstIds({
          vragenlijstIds,
          rapportageNaam,
          klantNaam,
          teamwielId,
        });
      }

      if (scanId) {
        return await generateAdviceForScanAanvraag(scanId);
      }

      throw new HttpsError(
        "invalid-argument",
        "vragenlijstIds of scanId ontbreekt."
      );
    } catch (error) {
      console.error("generateTeamAdvice error:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error.message || "Er ging iets mis bij het maken van het advies."
      );
    }
  }
);
function isAdminRequest(request) {
  const email = request.auth && request.auth.token && request.auth.token.email;
  return ["bozidar@mijnteamkompas.nl", "edmond@mijnteamkompas.nl"].includes(email || "");
}

exports.getCustomerPortal = onCall(async (request) => {
  const token = String((request.data && request.data.token) || "").trim();
  const klantId = String((request.data && request.data.klantId) || "").trim();
  const rapportId = String((request.data && request.data.rapportId) || "").trim();

  let klantDoc = null;

  if (klantId && isAdminRequest(request)) {
    const byId = await db.collection("klanten").doc(klantId).get();
    if (byId.exists) klantDoc = byId;
  } else {
    if (!token || token.length < 32 || !/^[a-f0-9]+$/i.test(token)) {
      throw new HttpsError("permission-denied", "Ongeldige klantportaal-token.");
    }
    const snap = await db.collection("klanten").where("portalToken", "==", token).limit(1).get();
    if (!snap.empty) klantDoc = snap.docs[0];
  }

  if (!klantDoc || !klantDoc.exists) {
    throw new HttpsError("not-found", "Klantportaal niet gevonden.");
  }

  const klant = klantDoc.data() || {};
  if (klant.verwijderd || klant.status === "Verwijderd") {
    throw new HttpsError("permission-denied", "Dit klantportaal is niet actief.");
  }

  // Detailmodus: één specifieke rapportage ophalen (alleen van deze klant)
  if (rapportId) {
    const rapDoc = await db.collection("portalRapporten").doc(rapportId).get();
    const rap = rapDoc.exists ? rapDoc.data() || {} : null;
    if (!rap || (rap.klantNaam || "") !== (klant.naam || "")) {
      throw new HttpsError("not-found", "Rapportage niet gevonden.");
    }
    return { rapportHtml: rap.html || "", titel: rap.titel || "Rapportage" };
  }

  const vragenSnap = await db.collection("vragenlijsten").where("klant", "==", klant.naam || "").get();
  const trajecten = vragenSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    .filter((v) => !v.verwijderd && v.status !== "Verwijderd")
    .map((v) => ({
      id: v.id,
      naam: v.naam || "Teamkompas-traject",
      status: v.status || "Actief",
      doelgroep: v.doelgroep || v.trajectRol || "",
      scanLink: v.status === "Actief" ? `https://www.mijnteamkompas.nl/deelnemen/${v.id}` : "",
    }));

  let rapporten = [];
  try {
    const rapSnap = await db.collection("portalRapporten").where("klantNaam", "==", klant.naam || "").get();
    rapporten = rapSnap.docs
      .map((d) => {
        const r = d.data() || {};
        return {
          id: d.id,
          titel: r.titel || "Rapportage",
          rol: r.rol || "",
          trajectNaam: r.trajectNaam || "",
          datum: r.aangemaaktIso ? r.aangemaaktIso.slice(0, 10) : "",
        };
      })
      .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  } catch (err) {
    rapporten = [];
  }

  return {
    klant: {
      id: klantDoc.id,
      naam: klant.naam || "",
      contact: klant.contact || "",
      sector: klant.sector || "",
    },
    welkom: klant.portalWelkom || "",
    materialen: Array.isArray(klant.portalMaterialen) ? klant.portalMaterialen : [],
    trajecten,
    rapporten,
  };
});

exports.startFreeScan = onCall(async (request) => {
  enforceFreeRate(request);
  const data=request.data||{}, ref=db.collection("freeScanInstances").doc();
  const cleanUtm=Object.fromEntries(Object.entries(data.utm||{}).filter(([k,v])=>/^utm_(source|medium|campaign|content|term)$/.test(k)&&typeof v==="string").map(([k,v])=>[k,v.slice(0,120)]));
  await ref.set({sessionId:ref.id,status:"started",questionnaireVersion:FREE_SCAN_VERSION,scoreModelVersion:FREE_SCORE_VERSION,startedAt:FieldValue.serverTimestamp(),source:String(data.source||"direct").slice(0,200),utm:cleanUtm,retentionUntil:admin.firestore.Timestamp.fromMillis(Date.now()+365*86400000)});
  return {sessionId:ref.id,questionnaireVersion:FREE_SCAN_VERSION};
});

exports.completeFreeScan = onCall({ secrets: [EMAILJS_SERVICE_ID, EMAILJS_FREE_SCAN_TEMPLATE_ID, EMAILJS_PUBLIC_KEY] }, async (request) => {
  enforceFreeRate(request,8); const data=request.data||{}, participant=data.participant||{};
  if(participant.hp) throw new HttpsError("permission-denied","Inzending geweigerd.");
  const sessionId=String(data.sessionId||""); if(!/^[\w-]{10,80}$/.test(sessionId))throw new HttpsError("invalid-argument","Ongeldige scansessie.");
  const firstName=String(participant.firstName||"").trim().slice(0,80), email=String(participant.email||"").trim().toLowerCase().slice(0,254);
  if(!firstName||!/^\S+@\S+\.\S+$/.test(email)||participant.consentProcessing!==true)throw new HttpsError("invalid-argument","Naam, geldig e-mailadres en toestemming zijn verplicht.");
  if(data.questionnaireVersion!==FREE_SCAN_VERSION)throw new HttpsError("failed-precondition","De vragenlijst is gewijzigd. Vernieuw de pagina om veilig opnieuw te starten.");
  const result=calculateFreeResults(data.answers||{}), token=crypto.randomBytes(32).toString("hex"), ref=db.collection("freeScanInstances").doc(sessionId), existing=await ref.get();
  if(!existing.exists)throw new HttpsError("not-found","Scansessie niet gevonden.");
  if(existing.data().status!=="started"){const old=existing.data();return {result:old.result,reportUrl:`/gratis-teamscan/rapport/${old.reportToken}`,emailStatus:old.email?.status||"pending"};}
  const now=new Date(), reportExpiresAt=admin.firestore.Timestamp.fromMillis(Date.now()+90*86400000);
  await ref.update({status:"report_generated",completedAt:FieldValue.serverTimestamp(),participant:{firstName,email,role:String(participant.role||"").slice(0,100),organisation:String(participant.organisation||"").slice(0,120),teamSize:String(participant.teamSize||"").slice(0,30)},consents:{processing:{granted:true,at:now.toISOString(),version:"privacy-2026-07"},marketing:{granted:participant.consentMarketing===true,at:now.toISOString(),version:"marketing-2026-07"}},answers:data.answers,result,report:{version:"1.0.0",generatedAt:now.toISOString(),expiresAt:reportExpiresAt},reportToken:token,email:{status:"pending",attempts:0,templateVersion:"1.0.0"}});
  let emailStatus="pending", emailError="";
  try {
    const service=process.env.EMAILJS_SERVICE_ID, template=process.env.EMAILJS_FREE_SCAN_TEMPLATE_ID, publicKey=process.env.EMAILJS_PUBLIC_KEY;
    if(!service||!template||!publicKey) throw new Error("E-mailconfiguratie ontbreekt");
    const reportUrl=`https://www.mijnteamkompas.nl/gratis-teamscan/rapport/${token}`;
    const response=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({service_id:service,template_id:template,user_id:publicKey,template_params:{to_email:email,to_name:firstName,subject:"Jouw persoonlijke Teamkompas staat klaar",strength:result.strengths[0].label,opportunity:result.opportunities[0].label,reflection:result.reflections[0],experiment:result.experiments[0],report_url:reportUrl,reply_to:"info@mijnteamkompas.nl"}})});
    if(!response.ok)throw new Error(`Providerstatus ${response.status}`); emailStatus="sent";
  } catch(err){emailStatus="failed";emailError=String(err.message||"Verzenden mislukt").slice(0,200);}
  await ref.update({status:emailStatus==="sent"?"email_sent":"email_failed",email:{status:emailStatus,attempts:1,lastAttemptAt:new Date().toISOString(),error:emailError}});
  return {result,reportUrl:`/gratis-teamscan/rapport/${token}`,emailStatus};
});

exports.getFreeScanReport = onCall(async (request) => {
  enforceFreeRate(request,30); const token=String(request.data?.token||"");
  if(!/^[a-f0-9]{64}$/.test(token))throw new HttpsError("permission-denied","Ongeldige rapporttoken.");
  const snap=await db.collection("freeScanInstances").where("reportToken","==",token).limit(1).get(); if(snap.empty)throw new HttpsError("not-found","Rapport niet gevonden.");
  const item=snap.docs[0].data(); if(item.anonymized||item.report?.expiresAt?.toMillis()<Date.now())throw new HttpsError("permission-denied","Rapport is verlopen.");
  return {participant:{firstName:item.participant?.firstName||""},result:item.result,completedAt:item.completedAt?.toDate().toISOString()||new Date().toISOString(),questionnaireVersion:item.questionnaireVersion};
});

exports.manageFreeScan = onCall(async (request) => {
  if(!isAdminRequest(request))throw new HttpsError("permission-denied","Alleen beheerders.");
  const {id,action}=request.data||{}, ref=db.collection("freeScanInstances").doc(String(id||"")), snap=await ref.get(); if(!snap.exists)throw new HttpsError("not-found","Inzending niet gevonden.");
  if(action==="delete"){await ref.delete();return {ok:true};}
  if(action==="anonymize"){await ref.update({participant:{firstName:"Geanonimiseerd",email:"",role:"",organisation:"",teamSize:""},answers:{},reportToken:FieldValue.delete(),anonymized:true,anonymizedAt:FieldValue.serverTimestamp(),status:"anonymized"});return {ok:true};}
  throw new HttpsError("invalid-argument","Onbekende beheeractie.");
});
