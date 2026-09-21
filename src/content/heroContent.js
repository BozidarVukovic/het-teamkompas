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
  // Kort en op de uitkomst. De vorige kop (bewaard als variant1 onderaan) legde
  // eerst uit waarom samenwerking ertoe doet en kwam pas in de tweede zin bij
  // wat wij doen -- dat is te veel leeswerk voor een openingsscherm. Deze noemt
  // meteen de uitkomst en hoe klein de eerste stap is, en sluit daarmee aan op
  // de gratis scan eronder.
  title: "Zie in tien minuten wat jullie samenwerking tegenhoudt.",

  // Twee regels, geen drie. De kop zegt wat je krijgt; hier staat alleen nog
  // waarmee en wat het oplevert. Een algemene opening ("iedereen doet zijn
  // best") kost een halve alinea voordat er iets staat dat alleen van ons is.
  subtitle:
    "Het Teamkompas meet jullie samenwerking op vijf domeinen en geeft één concrete stap voor volgende week.",

  // De gratis teamscan is de laagdrempeligste eerste stap en staat daarom
  // vooraan in het oranje. De kennismaking blijft duidelijk zichtbaar als
  // tweede route. Eventnamen beschrijven de actie, niet de plek op de pagina.
  scanCta: { label: "Doe de gratis teamscan", href: "/gratis-teamscan", event: "hero_teamscan_click" },
  contactCta: { label: "Plan een vrijblijvende kennismaking", event: "hero_primary_cta_click" },
  // Staat niet meer in de hero: naast de knoppen trok deze link de aandacht
  // weg van de scan. De route loopt via het menu en via de knop halverwege de
  // pagina. Bewaard, zodat hij zo terug te zetten is.
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
  // De kop die tot september 2026 op de homepage stond.
  variant1: {
    title:
      "Teams die goed samenwerken presteren merkbaar beter. Wij maken zichtbaar wat dat nu tegenhoudt.",
    subtitle:
      "Iedereen doet zijn best en toch loopt de samenwerking vast. Wij brengen in beeld wat verandering, eigenaarschap en onderling vertrouwen in de weg zit, en helpen teams met kleine concrete stappen naar ander gedrag in de praktijk.",
  },
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
