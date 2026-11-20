/**
 * Titels en omschrijvingen van de belangrijkste pagina's, zoals ze in Google
 * staan.
 *
 * Waarom één bestand. Deze teksten stonden op drie plekken: in SeoHead
 * (App.jsx), in de eigen Helmet van een pagina en in
 * scripts/generate-seo-pages.js. Die liepen uit elkaar. De homepage had in
 * index.html een andere titel dan in SeoHead, en /teamontwikkeling had er drie.
 * Google ziet eerst de statische HTML en daarna de gerenderde pagina; bij twee
 * verschillende titels kiest het zelf iets, en dat is zelden de beste.
 *
 * Nu lezen SeoHead, de pagina's en het generatiescript hier. index.html kan
 * niet importeren; tests/seoPaginas.test.mjs controleert dat de titel en
 * omschrijving daar gelijk zijn aan `home`.
 *
 * Schrijfregels voor een titel in de zoekresultaten:
 * - zet de vraag of de opbrengst van de bezoeker vooraan, de merknaam achteraan;
 * - houd hem rond de 60 tekens, daarna kort Google hem af;
 * - beloof niets wat de pagina niet waarmaakt.
 * Een omschrijving: rond de 150 tekens, herkenbare situatie eerst, dan wat je
 * er vindt.
 */

export const SEO_PAGINAS = {
  home: {
    title: "High performing team ontwikkelen | Mijn Teamkompas",
    description:
      "Een team dat presteert, feedback benut en zelf bijstuurt. Teamscan, teamdagen en coaching voor leidinggevenden en HR. Start met de gratis scan van 10 minuten.",
    url: "https://www.mijnteamkompas.nl/",
    image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
  },
  teamontwikkeling: {
    title: "Teamontwikkeling: een team dat blijft leren | Mijn Teamkompas",
    description:
      "Steeds dezelfde discussie, uitgestelde feedback, afspraken zonder opvolging? Wij helpen teams beter samenwerken en samen blijven leren en verbeteren.",
    url: "https://www.mijnteamkompas.nl/teamontwikkeling",
    image: "https://www.mijnteamkompas.nl/blog/images/ogsm.jpg",
  },
  teamcoaching: {
    title: "Teamcoaching voor samenwerking en feedback | Mijn Teamkompas",
    description:
      "Teamcoaching bij terugkerende spanning, moeizame feedback of onduidelijke rollen. Het team oefent in het echte werk, kijkt samen terug en stuurt zelf bij.",
    url: "https://www.mijnteamkompas.nl/teamcoaching",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
  },
  teamdag: {
    title: "Teamdag organiseren die echt iets verandert | Mijn Teamkompas",
    description:
      "Een teamdag met een gezamenlijk ontwikkeldoel, concrete afspraken en één of twee kleine experimenten. Met opvolging, zodat het niet bij een goede dag blijft.",
    url: "https://www.mijnteamkompas.nl/teamdag",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
  },
  onzeAanpak: {
    title: "Onze aanpak: luisteren, meten en bewegen | Mijn Teamkompas",
    description:
      "Hoe Mijn Teamkompas teams begeleidt: van eerste vraag naar teamscan, gesprek, teamdag of coaching, en kleine verbeteringen die het team zelf vasthoudt.",
    url: "https://www.mijnteamkompas.nl/onze-aanpak",
    image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
  },
  growthMindset: {
    title: "Growth mindset in teams: van idee naar gewoonte | Mijn Teamkompas",
    description:
      "Wat een growth mindset in een team betekent, hoe je het terugziet in dagelijks gedrag en wat het vraagt van leidinggevenden en werkomstandigheden.",
    url: "https://www.mijnteamkompas.nl/kennis/growth-mindset-in-teams",
    image: "https://www.mijnteamkompas.nl/blog/images/experimenteren.jpg",
  },
};

export default SEO_PAGINAS;
