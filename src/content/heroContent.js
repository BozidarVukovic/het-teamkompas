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

  // Let op: deze kop staat ook in het statische SEO-blok in index.html.
  // Wijzig ze samen, anders leest Google iets anders dan de bezoeker ziet.
  title: "Teams die goed samenwerken presteren merkbaar beter. Wij maken zichtbaar wat dat nu tegenhoudt.",

  subtitle:
    "Iedereen doet zijn best en toch loopt de samenwerking vast. Wij brengen in beeld wat verandering, eigenaarschap en onderling vertrouwen in de weg zit, en helpen teams met kleine concrete stappen naar ander gedrag in de praktijk.",

  // De gratis teamscan is de laagdrempeligste eerste stap en staat daarom
  // vooraan in het oranje. De kennismaking blijft duidelijk zichtbaar als
  // tweede route. Eventnamen beschrijven de actie, niet de plek op de pagina.
  scanCta: { label: "Doe de gratis teamscan", href: "/gratis-teamscan", event: "hero_teamscan_click" },
  contactCta: { label: "Plan een vrijblijvende kennismaking", event: "hero_primary_cta_click" },
  tertiaryCta: { label: "Bekijk onze aanpak", href: "/onze-aanpak", event: "hero_approach_click" },

  ctaNote: "Individueel, 8 tot 10 minuten, direct inzicht.",

  // Plek voor toekomstige, aantoonbare bewijskracht: klantlogo's, aantallen
  // begeleide teams of reviews. Blijft leeg tot die feitelijk onderbouwd zijn.
  // Bewust geen algemene claim over de eigen werkwijze; dat is geen bewijs.
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
