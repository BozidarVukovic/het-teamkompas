const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const COLLECTION_VRAGENLIJSTEN = "vragenlijsten";
const COLLECTION_ANTWOORDEN = "antwoorden";
const COLLECTION_ADVIESRAPPORTEN = "adviesrapporten";
const COLLECTION_AANVRAGEN = "teamscanSelfserviceAanvragen";
const COLLECTION_TEAMWIELEN = "teamwielen";

const AI_MODEL = "gpt-4.1-mini";

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