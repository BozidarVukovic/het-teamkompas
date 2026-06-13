// Centrale EmailJS-configuratie voor contactaanvragen en teamscan-aanvragen.
import emailjs from "@emailjs/browser";

export const EMAILJS_SERVICE_ID = "service_eytet3a";
export const EMAILJS_TEMPLATE_ID = "pysvu9a";
export const EMAILJS_PUBLIC_KEY = "aXtk48FJxZBI-fBNQ";
export const CONTACT_TO_EMAIL = "info@mijnteamkompas.nl";

// Template-ID's voor de reflectiekaart (stel in via EmailJS-dashboard)
// Gebruik dezelfde template als contactaanvragen totdat aparte templates zijn aangemaakt.
export const EMAILJS_REFLECTIE_TEMPLATE_ID = "pysvu9a";
export const EMAILJS_ADMIN_TEMPLATE_ID = "pysvu9a";

export async function sendContactEmail(params) {
  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: CONTACT_TO_EMAIL,
      ...params,
    },
    EMAILJS_PUBLIC_KEY
  );
}

export async function sendTeamscanConfirmationEmail({
  toEmail,
  managerName,
  organisatie,
  afdeling,
  teamGrootte,
}) {
  const safeName = managerName || "dank voor je aanvraag";

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail,
      reply_to: CONTACT_TO_EMAIL,

      subject: "Bevestiging aanvraag digitale teamscan",

      from_name: "Mijn Teamkompas",
      to_name: safeName,

      message: `
Beste ${safeName},

Dank voor je aanvraag voor de digitale teamscan van Mijn Teamkompas.

We hebben je aanvraag ontvangen voor:
Organisatie: ${organisatie || "-"}
Afdeling/team: ${afdeling || "-"}
Aantal collega’s: ${teamGrootte || "-"}

We bekijken de gegevens en nemen contact met je op over de vervolgstap.

Hartelijke groet,

Mijn Teamkompas
info@mijnteamkompas.nl
www.mijnteamkompas.nl
      `.trim(),

      organisatie: organisatie || "",
      afdeling: afdeling || "",
      team_grootte: teamGrootte || "",
    },
    EMAILJS_PUBLIC_KEY
  );
}