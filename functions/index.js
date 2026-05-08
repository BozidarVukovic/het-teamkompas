const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

exports.generateTeamAdvice = onCall(async (request) => {
  try {
    console.log("generateTeamAdvice aangeroepen", request.data);

    const { scanId } = request.data || {};

    if (!scanId) {
      throw new HttpsError("invalid-argument", "scanId ontbreekt.");
    }

    const scanRef = db
      .collection("teamscanZelfserviceAanvragen")
      .doc(scanId);

    const scanDoc = await scanRef.get();

    if (!scanDoc.exists) {
      throw new HttpsError(
        "not-found",
        `Geen teamscanaanvraag gevonden met id: ${scanId}`
      );
    }

    await scanRef.collection("aiAdvice").doc("latest").set({
      status: "concept",
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      summary: "Dit is een eerste testadvies vanuit Firebase Functions.",
      mainPattern:
        "De technische koppeling werkt als dit bericht zichtbaar wordt in Firestore.",
      firstAdvice:
        "De volgende stap is om deze functie te koppelen aan echte teamscandata en daarna aan AI.",
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
      message: "Testadvies is opgeslagen in Firestore.",
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