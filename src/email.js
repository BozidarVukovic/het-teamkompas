// Centrale EmailJS-configuratie voor contactaanvragen en teamscan-aanvragen.
import emailjs from "@emailjs/browser";

export const EMAILJS_SERVICE_ID = "service_eytet3a";
export const EMAILJS_TEMPLATE_ID = "template_4dt206k";   // Contact Us (beheerder ontvangt contactaanvragen)
export const EMAILJS_PUBLIC_KEY = "aXtk48FJxZBI-fBNQ";
export const CONTACT_TO_EMAIL = "info@mijnteamkompas.nl";

// Template-ID's voor de reflectiekaart
export const EMAILJS_REFLECTIE_TEMPLATE_ID = "template_h1umkgj"; // Auto-Reply: bevestiging naar aanvrager
export const EMAILJS_ADMIN_TEMPLATE_ID = "template_h1umkgj";     // zelfde template voor beheerdermelding

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
  managerEmail,
  managerName,
  organisatie,
  afdeling,
  teamGrootte,
  interesse = "Digitale Teamscan",
  bron = "Teamscan pagina",
  pagina = "",
}) {
  const safeName = managerName || "dank voor je aanvraag";

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail || managerEmail,
      reply_to: CONTACT_TO_EMAIL,

      subject: `Nieuwe aanvraag – ${interesse}`,

      from_name: "Mijn Teamkompas",
      to_name: safeName,

      message: `
Beste ${safeName},

Interesse: ${interesse}
Bron: ${bron}
Pagina: ${pagina || "-"}

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
      interesse,
      bron,
      pagina: pagina || "",
    },
    EMAILJS_PUBLIC_KEY
  );
}