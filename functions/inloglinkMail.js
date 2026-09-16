// De inlogmail.
//
// Apart bestand, en zonder iets uit firebase-functions, zodat de tekst te
// bekijken en te testen is zonder de hele functieomgeving op te tuigen. Wat
// negen mensen als eerste van dit product zien, hoort niet het enige stuk te
// zijn dat niemand ooit heeft nagekeken.

/** De mail zelf. Nederlands, "je", en één ding om te doen. */
function mailtekst({ link, teamNaam, code }) {
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
    ...(code
      ? [
        "",
        `Lukt het niet? Ga naar https://www.mijnteamkompas.nl/app en vul deze teamcode in: ${code}`,
      ]
      : []),
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
          ${code ? `<p class="tk-fijn" style="margin:14px 0 0;color:#5b6b7c;font-size:13.5px;line-height:1.5;">
            Lukt het niet? Ga naar
            <a href="https://www.mijnteamkompas.nl/app" class="tk-link" style="color:#0a7d70;">mijnteamkompas.nl/app</a>
            en vul deze teamcode in: <strong class="tk-tekst" style="color:#1c2b3a;">${code}</strong>
          </p>` : ""}
        </td></tr>
        <tr><td class="tk-fijn" style="padding:0 28px 26px;color:#8a97a5;font-size:12.5px;line-height:1.5;">
          ${teamNaam
            ? `Je ontvangt deze mail omdat je met dit adres bent uitgenodigd voor ${teamNaam} op mijnteamkompas.nl.`
            : "Je ontvangt deze mail omdat er met dit adres is ingelogd op mijnteamkompas.nl."}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { html, plat };
}

module.exports = { mailtekst };
