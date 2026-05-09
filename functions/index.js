const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

exports.generateTeamAdvice = onCall(async (request) => {
  try {
    console.log("generateTeamAdvice aangeroepen", request.data);
    console.log("Firebase projectId:", process.env.GCLOUD_PROJECT);

    const { scanId } = request.data || {};

    if (!scanId) {
      throw new HttpsError("invalid-argument", "scanId ontbreekt.");
    }

    const collectionName = "teamscanSelfserviceAanvragen";
    const scanRef = db.collection(collectionName).doc(scanId);
    const scanDoc = await scanRef.get();

    if (!scanDoc.exists) {
      throw new HttpsError(
        "not-found",
        `Geen teamscanaanvraag gevonden met id: ${scanId}.`
      );
    }

    const scanData = scanDoc.data() || {};

    await scanRef.collection("aiAdvice").doc("latest").set({
      status: "concept",
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "firebase_function_test",
      scanId,
      bedrijf: scanData.bedrijf || "",
      afdeling: scanData.afdeling || "",
      managerNaam: scanData.managerNaam || "",
      managerEmail: scanData.managerEmail || "",
      summary: "Dit is een eerste testadvies vanuit Firebase Functions.",
      mainPattern:
        "De technische koppeling werkt. Het advies wordt nu opgeslagen onder de juiste teamscanaanvraag.",
      firstAdvice:
        "De volgende stap is om deze functie te koppelen aan echte teamscandata, antwoorden en AI-analyse.",
    });

    await scanRef.set(
      {
        status: "conceptadvies_test_gereed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      message: `Testadvies is opgeslagen bij ${collectionName}/${scanId}.`,
    };
  } catch (error) {
    console.error("generateTeamAdvice error:", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      "internal",
      error.message || "Er ging iets mis bij het maken van het testadvies."
    );
  }
});