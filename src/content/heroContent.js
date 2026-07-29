/**
 * Centrale teksten voor de hero op de homepage.
 *
 * Alles wat de bezoeker in het openingsscherm leest staat hier, zodat de copy
 * aangepast kan worden zonder in de opmaak van App.jsx te hoeven zoeken.
 *
 * Wil je een andere hoofdboodschap testen? Vervang `eyebrow`, `title` en
 * `subtitle` door een van de varianten onderaan dit bestand. Toon er altijd
 * maar één tegelijk.
 */

export const heroContent = {
  eyebrow: "Voor teams en leiders die echt beweging willen",

  title: "Iedereen doet zijn best. Toch blijft de samenwerking vastlopen.",

  subtitle:
    "Wij maken zichtbaar wat verandering, samenwerking en eigenaarschap onbewust tegenhoudt. Daarna helpen we teams om met kleine, concrete stappen ander gedrag in de praktijk te brengen.",

  primaryCta: { label: "Plan een vrijblijvende kennismaking", event: "hero_primary_cta_click" },
  secondaryCta: { label: "Doe de gratis teamscan", href: "/gratis-teamscan", event: "hero_teamscan_click" },
  tertiaryCta: { label: "Bekijk onze aanpak", href: "/onze-aanpak", event: "hero_approach_click" },

  ctaNote:
    "De gratis teamscan is individueel, duurt 8 tot 10 minuten en geeft direct inzicht in de belangrijkste ontwikkelpunten van jouw team.",

  // Inhoudelijk vertrouwenselement. Er is nog geen geverifieerde kwantitatieve
  // bewijskracht (klantlogo's, aantallen, reviews) beschikbaar in de codebase of
  // beheeromgeving, dus staat hier bewust geen cijfer. Zodra die er is, kan deze
  // regel worden vervangen of aangevuld met `proofItems` hieronder.
  proofLine:
    "Praktisch, mensgericht en gebaseerd op inzichten uit teamontwikkeling en gedragspsychologie",

  // Plek voor toekomstige, aantoonbare bewijskracht: klantlogo's, aantallen
  // begeleide teams of reviews. Blijft leeg tot die feitelijk onderbouwd zijn.
  proofItems: [],

  // Het witte blok bij de foto. Verdiept de hero, herhaalt hem niet.
  infoCard: {
    label: "Wanneer schakel je ons in?",
    title:
      "Als dezelfde problemen blijven terugkomen, ondanks goede gesprekken en duidelijke afspraken",
    text:
      "We onderzoeken niet alleen wat er misgaat, maar vooral welk gedrag, welke patronen en welke onuitgesproken verwachtingen de beweging tegenhouden. Samen kiezen we een eerste stap die snel merkbaar is.",
  },

  // De werkwijze, als uitnodiging om verder te scrollen.
  approach: [
    ["Luisteren", "We halen boven tafel wat mensen ervaren, maar niet altijd uitspreken."],
    ["Meten", "We maken patronen, verschillen en ontwikkelpunten zichtbaar."],
    ["Bewegen", "We vertalen inzicht naar kleine gedragsstappen die in het werk toepasbaar zijn."],
  ],
};

/**
 * Alternatieve hoofdboodschappen. Niet actief; bewaard om later te testen.
 *
 * Variant 2 — vertrekt vanuit een verandering die niet landt:
 *   title:    "Verandering lijkt afgesproken. Toch verandert er in de praktijk weinig."
 *   subtitle: "Wij helpen teams en leiders begrijpen wat de beweging tegenhoudt en
 *              vertalen dat naar gedrag dat direct merkbaar wordt in het dagelijkse werk."
 *
 * Variant 3 — vertrekt vanuit het gewenste eindbeeld:
 *   title:    "Van losse professionals naar een team dat samen verantwoordelijkheid neemt"
 *   subtitle: "Met luisteren, meten en bewegen maken we zichtbaar wat er speelt en bouwen
 *              we stap voor stap aan betere samenwerking, eigenaarschap en teamenergie."
 */
export const heroVariants = {
  variant2: {
    title: "Verandering lijkt afgesproken. Toch verandert er in de praktijk weinig.",
    subtitle:
      "Wij helpen teams en leiders begrijpen wat de beweging tegenhoudt en vertalen dat naar gedrag dat direct merkbaar wordt in het dagelijkse werk.",
  },
  variant3: {
    title: "Van losse professionals naar een team dat samen verantwoordelijkheid neemt",
    subtitle:
      "Met luisteren, meten en bewegen maken we zichtbaar wat er speelt en bouwen we stap voor stap aan betere samenwerking, eigenaarschap en teamenergie.",
  },
};

export default heroContent;
