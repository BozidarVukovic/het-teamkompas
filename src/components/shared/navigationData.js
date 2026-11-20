export const serviceLinks = [
  { label: "Teamscan", href: "/teamscan" },
  { label: "Teamontwikkeling", href: "/teamontwikkeling" },
  { label: "Insights Discovery", href: "/insights-discovery-profiel" },
  { label: "Teamcoaching", href: "/teamcoaching" },
  { label: "Individuele coaching", href: "/individuele-coaching" },
  { label: "Teamdag", href: "/teamdag" },
  { label: "Samenwerken met AI", href: "/samenwerken-met-ai" },
  { label: "Sprekers", href: "/sprekers" },
];

export const knowledgeNavigation = {
  // Centrale hub: de kenniskaart bundelt alle kennisthema's op één pagina.
  overview: { label: "Bekijk alle kennis", href: "/kennis/kenniskaart-teamontwikkeling" },
  // Interactieve hulpmiddelen: iets dóen, geen thema om te lezen. Daarom een
  // eigen kolom en niet onder een themakop.
  tools: [
    // De kenniswijzer helpt bezoekers via vijf vragen naar passende content.
    { label: "Kenniswijzer: vind wat past", href: "/kennisbank" },
    // Om een lastig gesprek voor te bereiden.
    { label: "Gespreksvoorbereider", href: "/gespreksvoorbereider" },
    // Opzet voor een teamdag, samengesteld uit vaste beslisregels.
    { label: "Teamdag-generator", href: "/teamdag-generator" },
  ],
  // Eén indeling voor alle thema's. Elk thema staat op precies één plek;
  // verwante pagina's (psychologische en sociale veiligheid) staan naast elkaar.
  groups: [
    {
      label: "Veiligheid en samenwerking",
      links: [
        { label: "Psychologische veiligheid", href: "/psychologische-veiligheid" },
        { label: "Sociale veiligheid", href: "/sociale-veiligheid" },
        { label: "Teamcultuur", href: "/kennis/teamcultuur" },
        { label: "Boven- en onderstroom", href: "/boven-en-onderstroom" },
        { label: "Brein en samenwerking", href: "/brein-en-samenwerking" },
      ],
    },
    {
      label: "Energie en eigenaarschap",
      links: [
        { label: "Teamenergie", href: "/kennis/teamenergie" },
        { label: "Bevlogenheid in het werk", href: "/kennis/bevlogenheid-in-het-werk" },
        { label: "Eigenaarschap", href: "/kennis/eigenaarschap-in-teams" },
      ],
    },
    {
      label: "Veranderen en verbeteren",
      links: [
        { label: "Verandermanagement", href: "/kennis/verandermanagement" },
        { label: "High performing team", href: "/high-performing-team" },
        { label: "Growth mindset in teams", href: "/kennis/growth-mindset-in-teams" },
        { label: "Kleine experimenten", href: "/kleine-experimenten" },
        { label: "Borging na een teamdag", href: "/kennis/impact-van-een-teamdag" },
      ],
    },
  ],
};

export const allKnowledgeLinks = [
  knowledgeNavigation.overview,
  ...knowledgeNavigation.tools,
  ...knowledgeNavigation.groups.flatMap((group) => group.links),
];
