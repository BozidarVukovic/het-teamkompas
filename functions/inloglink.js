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
const PER_DAG_TOTAAL = 300;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const sleutelVan = (email) => crypto.createHash("sha256").update(email).digest("hex");
const vandaag = () => new Date().toISOString().slice(0, 10);

/**
 * Mag er nu een mail naar dit adres?
 *
 * Twee tellers in één transactie: één per adres per uur, één voor alles bij
 * elkaar per dag. Het adres zelf slaan we niet op — alleen een hash. Een lijst
 * van iedereen die ooit een inloglink vroeg is niets wat hier hoort te staan.
 */
async function magVersturen(db, email) {
  const nu = Date.now();
  const uur = 60 * 60 * 1000;
  const adresRef = db.collection("inlogverzoeken").doc(sleutelVan(email));
  const dagRef = db.collection("inlogverzoeken").doc(`dag-${vandaag()}`);

  return db.runTransaction(async (t) => {
    const [adres, dag] = await Promise.all([t.get(adresRef), t.get(dagRef)]);

    const adresData = adres.exists ? adres.data() : {};
    const begonnenOp = adresData.begonnenOp || 0;
    const binnenHetUur = nu - begonnenOp < uur;
    const aantal = binnenHetUur ? adresData.aantal || 0 : 0;
    if (aantal >= PER_ADRES_PER_UUR) return false;

    const dagAantal = (dag.exists ? dag.data().aantal : 0) || 0;
    if (dagAantal >= PER_DAG_TOTAAL) return false;

    t.set(adresRef, {
      aantal: aantal + 1,
      begonnenOp: binnenHetUur ? begonnenOp : nu,
      laatstOp: FieldValue.serverTimestamp(),
    });
    t.set(dagRef, { aantal: dagAantal + 1, laatstOp: FieldValue.serverTimestamp() });
    return true;
  });
}

/**
 * Zet de link op ons eigen domein.
 *
 * Firebase maakt een link naar mijn-teamkompas-6de84.firebaseapp.com. Die mail
 * komt dan van auth.mijnteamkompas.nl maar wijst naar een heel ander domein —
 * en firebaseapp.com is een gedeeld domein waar veel phishing vandaan komt. Dat
 * is precies het patroon waar spamfilters op letten: afzender en bestemming die
 * niet bij elkaar horen. Voor de ontvanger ziet het er ook niet uit als iets van
 * ons.
 *
 * De ontvangende kant heeft dat domein niet nodig. signInWithEmailLink() in de
 * browser leest alleen `mode` en `oobCode` uit de adresbalk en wisselt die bij
 * Firebase in; welke host ervoor staat doet er niet toe. Dus houden we de hele
 * queryreeks en zetten er ons eigen adres voor.
 */
function eigenLink(firebaseLink, terug) {
  const bron = new URL(firebaseLink);
  const doel = new URL(terug);
  doel.search = bron.search;
  return doel.toString();
}

/** De mail zelf. Nederlands, "je", en één ding om te doen. */
function mailtekst({ link, teamNaam }) {
  const over = teamNaam
    ? `Je bent uitgenodigd voor <strong>${teamNaam}</strong> in Mijn Teamkompas.`
    : "Je vroeg een inloglink aan voor Mijn Teamkompas.";

  const plat = [
    teamNaam
      ? `Je bent uitgenodigd voor ${teamNaam} in Mijn Teamkompas.`
      : "Je vroeg een inloglink aan voor Mijn Teamkompas.",
    "",
    "Klik op deze link om in te loggen:",
    link,
    "",
    "De link werkt één keer. Heb je hem niet aangevraagd, dan kun je deze mail negeren.",
    "",
    "Mijn Teamkompas",
  ].join("\n");

  // Over donkere modus.
  //
  // Mailprogramma's in donkere modus klappen achtergronden om als ze denken dat
  // een mail daar geen rekening mee houdt. Een donkere kopbalk met witte letters
  // werd zo een lichte kopbalk met witte letters — onleesbaar.
  //
  // Twee dingen houden dat tegen. De meta-regels color-scheme zeggen tegen het
  // programma: deze mail regelt zijn eigen kleuren, klap niets om. En het
  // style-blok geeft voor de donkere modus zelf de goede kleuren op, zodat het
  // er ook dan uitziet zoals het hoort in plaats van omgekeerd.
  //
  // De inline kleuren blijven staan voor programma's die style-blokken negeren
  // (Outlook op Windows); die krijgen gewoon de lichte versie.
  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .tk-buiten { background:#0a1420 !important; }
    .tk-kaart  { background:#152437 !important; }
    .tk-kop    { background:#0D1B2A !important; }
    .tk-tekst  { color:#E8EEF4 !important; }
    .tk-fijn   { color:#93a5b8 !important; }
    .tk-link   { color:#4fd6c4 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="tk-buiten"
         style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="tk-kaart"
             style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;
                    font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td class="tk-kop" style="background:#0D1B2A;padding:22px 28px;">
          <span style="color:#ffffff;font-size:19px;font-weight:600;">Mijn</span><span
                style="color:#00A896;font-size:19px;font-weight:600;"> Teamkompas</span>
        </td></tr>
        <tr><td class="tk-tekst" style="padding:28px;color:#1c2b3a;font-size:16px;line-height:1.6;">
          <p style="margin:0 0 18px;" class="tk-tekst">${over}</p>
          <p style="margin:0 0 24px;" class="tk-tekst">Klik op de knop om in te loggen. Je hebt geen wachtwoord nodig.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#00A896;border-radius:99px;">
              <a href="${link}" style="display:inline-block;padding:13px 30px;color:#062a26;
                 font-size:16px;font-weight:600;text-decoration:none;">Inloggen</a>
            </td></tr>
          </table>
          <p class="tk-fijn" style="margin:0 0 8px;color:#5b6b7c;font-size:13.5px;line-height:1.5;">
            Werkt de knop niet? Plak deze link in je browser:
          </p>
          <p style="margin:0 0 24px;word-break:break-all;">
            <a href="${link}" class="tk-link" style="color:#0a7d70;font-size:13px;">${link}</a>
          </p>
          <p class="tk-fijn" style="margin:0;color:#5b6b7c;font-size:13.5px;line-height:1.5;">
            De link werkt één keer. Heb je hem niet aangevraagd, dan kun je deze mail negeren.
          </p>
        </td></tr>
        <tr><td class="tk-fijn" style="padding:0 28px 26px;color:#8a97a5;font-size:12.5px;line-height:1.5;">
          Je ontvangt deze mail omdat er met dit adres is ingelogd op mijnteamkompas.nl.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { html, plat };
}

/**
 * Maakt een inloglink en stuurt hem op.
 *
 * Geeft altijd hetzelfde antwoord terug, ook als er niets is verstuurd. Wie van
 * buitenaf probeert te achterhalen of een adres bestaat of tegen de rem loopt,
 * hoort dat hier niet aan te kunnen zien.
 */
exports.stuurInloglink = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const email = String((request.data && request.data.email) || "").trim().toLowerCase();
  const teamNaam = String((request.data && request.data.teamNaam) || "").trim().slice(0, 80);

  if (!EMAIL.test(email) || email.length > 254) {
    throw new HttpsError("invalid-argument", "Dat lijkt geen geldig e-mailadres.");
  }

  const db = admin.firestore();
  if (!(await magVersturen(db, email))) return { verstuurd: true };

  const gevraagd = String((request.data && request.data.terug) || "");
  const terug = TERUG_TOEGESTAAN.includes(gevraagd) ? gevraagd : TERUG_STANDAARD;

  const vanFirebase = await admin.auth().generateSignInWithEmailLink(email, {
    url: terug,
    handleCodeInApp: true,
  });
  const link = eigenLink(vanFirebase, terug);

  const { html, plat } = mailtekst({ link, teamNaam });

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
    throw new HttpsError("internal", "Het versturen van de inloglink is niet gelukt.");
  }

  return { verstuurd: true };
});
