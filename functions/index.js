const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const COLLECTION_VRAGENLIJSTEN = "vragenlijsten";
const COLLECTION_ANTWOORDEN = "antwoorden";
const COLLECTION_ADVIESRAPPORTEN = "adviesrapporten";
const COLLECTION_AANVRAGEN = "teamscanSelfserviceAanvragen";

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
  const domains = Object.values(domainScores).filter((domain) => domain.score !== null);
  if (!domains.length) return null;
  return domains.sort((a, b) => a.score - b.score)[0];
}

function getHighestDomain(domainScores) {
  const domains = Object.values(domainScores).filter((domain) => domain.score !== null);
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

async function generateAdviceForVragenlijstIds({
  vragenlijstIds,
  rapportageNaam,
  klantNaam,
}) {
  if (!Array.isArray(vragenlijstIds) || vragenlijstIds.length < 2) {
    throw new HttpsError(
      "invalid-argument",
      "Geef minimaal twee vragenlijstIds mee: medewerkers en management."
    );
  }

  const vragenlijstDocs = await getVragenlijstDocs(vragenlijstIds);
  const answerDocs = await getAntwoordenForVragenlijsten(vragenlijstIds);

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

  const adviesRef = db.collection(COLLECTION_ADVIESRAPPORTEN).doc();

  await adviesRef.set({
    status: "concept",
    source: "firebase_function_vragenlijst_analysis_v1",
    generatedAt: FieldValue.serverTimestamp(),

    rapportageNaam: rapportageNaam || "",
    klantNaam: klantNaam || "",
    vragenlijstIds,

    dataQuality: {
      vragenlijstCount: vragenlijstDocs.length,
      answerCount: answerDocs.length,
      hasVragenlijsten: vragenlijstDocs.length > 0,
      hasAnswers: answerDocs.length > 0,
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

    reportSections: {
      opening:
        "Dit conceptadvies is automatisch opgesteld op basis van de gecombineerde teamscandata van medewerkers en management.",
      interpretation:
        "De scores geven een eerste beeld van hoe het team samenwerking, verandering, energie en verbeterkracht ervaart. De uitkomst moet altijd worden besproken met de leidinggevende en het team, zodat cijfers worden verbonden aan concrete voorbeelden uit de praktijk.",
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

exports.generateTeamAdvice = onCall(async (request) => {
  try {
    console.log("generateTeamAdvice aangeroepen", request.data);
    console.log("Firebase projectId:", process.env.GCLOUD_PROJECT);

    const { vragenlijstIds, rapportageNaam, klantNaam, scanId } =
      request.data || {};

    if (vragenlijstIds) {
      return await generateAdviceForVragenlijstIds({
        vragenlijstIds,
        rapportageNaam,
        klantNaam,
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
});