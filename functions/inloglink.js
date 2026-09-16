// De inlogmail, in eigen beheer.
//
// Firebase verstuurt de inloglink standaard zelf. Dat werkt, maar drie dingen
// zijn niet in te stellen: de afzender is noreply@<project>.firebaseapp.com
// (waardoor de mail bij vrijwel iedereen in de spammap belandt), de datum is
// Engels, en de tekst spreekt met "u" terwijl de app "je" zegt. Het sjabloon
// van de inloglink zonder wachtwoord is als enige niet bewerkbaar in de
// console — en staat er zelfs niet in.
//
// Dus maken we de link hier met de Admin SDK en versturen we hem zelf. De
// inlog zelf verandert niet: het is dezelfde link, met dezelfde eenmalige
// code, die door dezelfde Firebase-controle heen gaat.
//
// Deze functie is met opzet niet ingelogd bereikbaar — je bent nog niet
// ingelogd, dat is het hele punt. Daarom staat er wel een rem op: per adres
// een handvol per uur, en een dagplafond over alles heen. Zonder dat is dit
// een knop waarmee iemand anders mail kan laten sturen naar willekeurige
// adressen, met jouw domein als afzender.

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const AFZENDER = "Mijn Teamkompas <inloggen@auth.mijnteamkompas.nl>";
const ANTWOORD_NAAR = "bozidar@mijnteamkompas.nl";
// Waar de link naartoe wijst na het klikken. Dit is het scherm dat het
// inloggen afmaakt, niet de startpagina — daar staat de code die de eenmalige
// link inwisselt.
//
// De browser mag deze waarde meegeven zodat je lokaal kunt testen, maar alleen
// uit deze lijst. Een adres uit een verzoek klakkeloos overnemen zou betekenen
// dat iemand een inloglink kan laten sturen die naar zijn eigen site wijst.
const TERUG_STANDAARD = "https://www.mijnteamkompas.nl/app/inloggen";
const TERUG_TOEGESTAAN = [
  TERUG_STANDAARD,
  "https://mijnteamkompas.nl/app/inloggen",
  "http://localhost:5173/app/inloggen",
];

// De rem. Ruim genoeg dat niemand er in de praktijk tegenaan loopt — je vraagt
// een inloglink één keer aan, hooguit twee keer als de eerste niet aankwam.
const PER_ADRES_PER_UUR = 5;

// Per herkomst, want alleen op adres remmen helpt niet: wie steeds een ander
// adres invult, komt telkens bij een verse teller uit. Twaalf per uur is meer
// dan een kantoor achter één verbinding ooit nodig heeft en zet meteen een rem
// op iemand die adressen zit af te lopen.
const PER_IP_PER_UUR = 12;

// Het dagplafond deed twee dingen tegelijk en dat ging mis. Het beschermde de
// mailrekening, en het was tegelijk de enige noodrem — waardoor iemand met
// driehonderd verzonnen adressen het inloggen voor iedereen kon platleggen.
//
// Nu zijn het twee getallen. Bij het eerste gaat er een melding naar de logs,
// zodat je ziet dat er iets ongewoons gebeurt terwijl gewone mensen gewoon
// kunnen inloggen. Pas bij het tweede stopt het echt, en dat getal staat er
// alleen om te voorkomen dat een lange aanval een rekening oplevert.
const PER_DAG_ALARM = 300;
const PER_DAG_HARD = 3000;

// Hoe lang een teller blijft staan. De documenten worden opgeruimd door een
// TTL-regel in Firestore die naar dit veld kijkt; zie docs bij verlooptOp.
const BEWAARDAGEN = 3;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// De app is op uitnodiging. Deze twee adressen komen er altijd in, ook als de
// begeleiderslijst leeg of stuk is; anders kun je jezelf buitensluiten uit je
// eigen omgeving en is er geen weg meer terug.
const ALTIJD_TOEGESTAAN = ["bozidar@mijnteamkompas.nl", "edmond@mijnteamkompas.nl"];

/**
 * Mag dit adres een inloglink krijgen?
 *
 * Drie manieren, en meer zijn er niet:
 *
 * 1. Er zit een geldige teamcode bij. Dan kom je binnen via een uitnodiging
 *    van iemand die het team beheert, en dat is precies de bedoelde route.
 * 2. Het adres heeft al een account. Wie eenmaal meedoet, moet terug kunnen
 *    inloggen zonder telkens een nieuwe uitnodiging nodig te hebben.
 * 3. Het adres staat op de begeleiderslijst: /begeleiders/{email} in Firestore.
 *    Dat zijn de mensen die zelf teams opzetten.
 *
 * Klopt geen van drieën, dan gaat er geen mail weg. De browser krijgt wel
 * hetzelfde antwoord als anders; zie de opmerking bij de functie hieronder.
 */
async function magInloggen(db, email, code, team) {
  if (ALTIJD_TOEGESTAAN.includes(email)) return true;

  // De code is al opgezocht; bestaat het team, dan is dit een uitnodiging.
  if (code && team) return true;

  const bestaand = await admin.auth().getUserByEmail(email).catch(() => null);
  if (bestaand) return true;

  const begeleider = await db.collection("begeleiders").doc(email).get().catch(() => null);
  return Boolean(begeleider && begeleider.exists);
}

/**
 * Het team dat bij een uitnodigingscode hoort.
 *
 * De teamnaam kwam tot nu toe uit het verzoek van de browser. Dat betekende
 * twee dingen: hij werd nergens gecontroleerd, en de app stuurde hem helemaal
 * niet mee. Iemand die werd uitgenodigd voor HR Business & Beleid kreeg dus een
 * mail met "Je vroeg een inloglink aan voor Mijn Teamkompas" -- terwijl hij
 * niets had gevraagd en er een team op hem wachtte.
 *
 * Hier wordt hij opgezocht bij de code zelf. Deze functie draait met
 * beheerdersrechten, dus de leesregel die een teamnaam pas na toetreden vrijgeeft
 * geldt hier niet; dat is de bedoeling, want zonder de naam is de uitnodiging
 * niet te herkennen.
 */
async function teamViaCode(db, code) {
  if (!code) return null;
  const codeDoc = await db.collection("teamcodes").doc(code).get().catch(() => null);
  if (!codeDoc || !codeDoc.exists) return null;
  const { orgId, teamId } = codeDoc.data() || {};
  if (!orgId || !teamId) return null;
  const teamDoc = await db
    .collection("organisaties").doc(orgId)
    .collection("teams").doc(teamId)
    .get()
    .catch(() => null);
  const naam = teamDoc && teamDoc.exists ? String(teamDoc.data().naam || "").trim().slice(0, 80) : "";
  return { orgId, teamId, naam };
}

const sleutelVan = (email) => crypto.createHash("sha256").update(email).digest("hex");
const vandaag = () => new Date().toISOString().slice(0, 10);

/** Wanneer deze teller opgeruimd mag worden. De TTL-regel kijkt hiernaar. */
const verlooptOp = () =>
  admin.firestore.Timestamp.fromMillis(Date.now() + BEWAARDAGEN * 24 * 60 * 60 * 1000);

/**
 * Mag er nu een mail naar dit adres?
 *
 * Drie tellers in één transactie: per adres per uur, per herkomst per uur, en
 * een totaal per dag. Het adres en het IP-adres slaan we niet op, alleen een
 * hash. Een lijst van iedereen die ooit een inloglink vroeg, met de plek waar
 * hij vandaan kwam, is niets wat hier hoort te staan.
 *
 * Geeft terug wat er is opgehoogd, zodat de aanroeper het weer kan terugdraaien
 * als de mail alsnog niet weggaat.
 */
async function magVersturen(db, email, ip) {
  const nu = Date.now();
  const uur = 60 * 60 * 1000;
  const adresRef = db.collection("inlogverzoeken").doc(sleutelVan(email));
  const ipRef = ip ? db.collection("inlogverzoeken").doc(`ip-${sleutelVan(ip)}`) : null;
  const dagRef = db.collection("inlogverzoeken").doc(`dag-${vandaag()}`);

  return db.runTransaction(async (t) => {
    const [adres, herkomst, dag] = await Promise.all([
      t.get(adresRef),
      ipRef ? t.get(ipRef) : Promise.resolve(null),
      t.get(dagRef),
    ]);

    // Een uurteller die ouder is dan een uur begint gewoon opnieuw.
    const binnenUur = (snap) => {
      const data = snap && snap.exists ? snap.data() : {};
      const begonnenOp = data.begonnenOp || 0;
      const vers = nu - begonnenOp < uur;
      return { begonnenOp: vers ? begonnenOp : nu, aantal: vers ? data.aantal || 0 : 0 };
    };

    const a = binnenUur(adres);
    if (a.aantal >= PER_ADRES_PER_UUR) return null;

    const h = binnenUur(herkomst);
    if (ipRef && h.aantal >= PER_IP_PER_UUR) return null;

    const dagAantal = (dag.exists ? dag.data().aantal : 0) || 0;

    // Het harde plafond beschermt de rekening, niet de toegang. Wie hier tegenaan
    // loopt heeft het over duizenden verzoeken op één dag.
    if (dagAantal >= PER_DAG_HARD) {
      console.error(`Inloglinks gestopt: het harde dagplafond van ${PER_DAG_HARD} is bereikt.`);
      return null;
    }

    // Eén regel in de logs op het moment dat het ongewoon wordt. Geen blokkade,
    // wel iets waar een waarschuwing op te zetten valt.
    if (dagAantal + 1 === PER_DAG_ALARM) {
      console.warn(
        `Ongewoon veel inloglinkverzoeken vandaag: ${PER_DAG_ALARM}. Kijk of dit klopt.`
      );
    }

    t.set(adresRef, {
      aantal: a.aantal + 1,
      begonnenOp: a.begonnenOp,
      laatstOp: FieldValue.serverTimestamp(),
      verlooptOp: verlooptOp(),
    });
    if (ipRef) {
      t.set(ipRef, {
        aantal: h.aantal + 1,
        begonnenOp: h.begonnenOp,
        laatstOp: FieldValue.serverTimestamp(),
        verlooptOp: verlooptOp(),
      });
    }
    t.set(dagRef, {
      aantal: dagAantal + 1,
      laatstOp: FieldValue.serverTimestamp(),
      verlooptOp: verlooptOp(),
    });
    return { adresRef, ipRef, dagRef };
  });
}

/**
 * Draait de tellers terug.
 *
 * De tellers gaan omhoog vóór het versturen en niet erna. Zou je pas tellen als
 * de mail eruit is, dan verdwijnt de rem precies op het moment dat de
 * mailleverancier hapert — en dat is het slechtste moment om hem kwijt te zijn.
 * Gaat de mail alsnog niet weg, dan geven we de poging hier terug, zodat een
 * storing bij ons niemand een uur buitensluit.
 */
async function geefTerug(tellers) {
  if (!tellers) return;
  const { adresRef, ipRef, dagRef } = tellers;
  const terug = [adresRef, ipRef, dagRef].filter(Boolean);
  await Promise.all(
    terug.map((ref) => ref.update({ aantal: FieldValue.increment(-1) }).catch(() => {}))
  );
}

// Het adres van de inloglink -- ons eigen domein, met de eenmalige code én de
// teamcode erin. De uitleg staat bij de functie zelf.
const { inlogAdres } = require("./inloglinkAdres");

// De mail zelf staat apart, met de uitleg erbij.
const { mailtekst } = require("./inloglinkMail");

/**
 * Maakt een inloglink en stuurt hem op.
 *
 * Geeft altijd hetzelfde antwoord terug, ook als er niets is verstuurd. Wie van
 * buitenaf probeert te achterhalen of een adres bestaat of tegen de rem loopt,
 * hoort dat hier niet aan te kunnen zien.
 */
exports.stuurInloglink = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const email = String((request.data && request.data.email) || "").trim().toLowerCase();
  const code = String((request.data && request.data.code) || "").trim().toUpperCase().slice(0, 20);

  if (!EMAIL.test(email) || email.length > 254) {
    throw new HttpsError("invalid-argument", "Dat lijkt geen geldig e-mailadres.");
  }

  const db = admin.firestore();
  const ip = (request.rawRequest && request.rawRequest.ip) || "";
  const tellers = await magVersturen(db, email, ip);
  if (!tellers) return { verstuurd: true };

  // Geen uitnodiging, geen account, niet op de lijst: dan gaat er niets weg.
  //
  // Het antwoord blijft hetzelfde als bij een geslaagde verzending. Zou hier
  // een foutmelding komen, dan kan iemand van buitenaf adressen langslopen en
  // uit het verschil afleiden wie er een account heeft. Dat iemand Mijn
  // Teamkompas gebruikt, is niets om aan een vreemde prijs te geven. Het
  // inlogscherm vertelt daarom vooraf dat de app op uitnodiging werkt.
  const team = await teamViaCode(db, code);
  const teamNaam = (team && team.naam) || "";

  if (!(await magInloggen(db, email, code, team))) {
    console.log("Inloglink geweigerd: geen uitnodiging, geen account, niet op de lijst.");
    // Een adres dat er toch niet in mag, hoort de rem voor de rest niet op te
    // eten. De poging telt dus niet mee.
    await geefTerug(tellers);
    return { verstuurd: true };
  }

  const gevraagd = String((request.data && request.data.terug) || "");
  const terug = TERUG_TOEGESTAAN.includes(gevraagd) ? gevraagd : TERUG_STANDAARD;

  let vanFirebase;
  try {
    vanFirebase = await admin.auth().generateSignInWithEmailLink(email, {
      url: terug,
      handleCodeInApp: true,
    });
  } catch (err) {
    // Lukt het maken van de link niet, dan is er ook niets verstuurd.
    console.error("Inloglink maken mislukt", err && err.message);
    await geefTerug(tellers);
    throw new HttpsError("internal", "Het versturen van de inloglink is niet gelukt.");
  }
  const link = inlogAdres(vanFirebase, terug, code);

  const { html, plat } = mailtekst({ link, teamNaam, code });

  const antwoord = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: AFZENDER,
      to: [email],
      reply_to: ANTWOORD_NAAR,
      subject: teamNaam ? `Je inloglink voor ${teamNaam}` : "Je inloglink voor Mijn Teamkompas",
      html,
      text: plat,
    }),
  });

  if (!antwoord.ok) {
    // Wat er misging staat in de logs, niet in het antwoord aan de browser:
    // een sleutel of een adres hoort daar niet in terecht te komen.
    const uitleg = await antwoord.text().catch(() => "");
    console.error("Resend weigerde de mail", antwoord.status, uitleg.slice(0, 500));
    // Er ging geen mail weg, dus de poging telt niet mee. Anders zit iemand na
    // vijf mislukte pogingen een uur vast aan een storing die niet van hem is.
    await geefTerug(tellers);
    throw new HttpsError("internal", "Het versturen van de inloglink is niet gelukt.");
  }

  return { verstuurd: true };
});
