export const serviceLinks = [
  { label: "Teamscan", href: "/teamscan" },
  { label: "Teamontwikkeling", href: "/teamontwikkeling" },
  { label: "Insights Discovery", href: "/insights-discovery-profiel" },
  { label: "Teamcoaching", href: "/teamcoaching" },
  { label: "Teamdag", href: "/teamdag" },
  { label: "Sprekers", href: "/sprekers" },
];

export const knowledgeNavigation = {
  // Centrale hub: de kenniskaart bundelt alle kennisthema's op één pagina.
  overview: { label: "Bekijk alle kennis", href: "/kennis/kenniskaart-teamontwikkeling" },
  // De kenniswijzer helpt bezoekers via vijf vragen naar passende content.
  wijzer: { label: "Kenniswijzer: vind wat past", href: "/kennisbank" },
  // Interactief hulpmiddel om een lastig gesprek voor te bereiden.
  gesprek: { label: "Gespreksvoorbereider", href: "/gespreksvoorbereider" },
  featured: [
    { label: "Teamcultuur", href: "/kennis/teamcultuur" },
    { label: "Psychologische veiligheid", href: "/psychologische-veiligheid" },
    { label: "Eigenaarschap", href: "/kennis/eigenaarschap-in-teams" },
    { label: "Verandermanagement", href: "/kennis/verandermanagement" },
  ],
  groups: [
    {
      label: "Samenwerking en cultuur",
      links: [
        { label: "Sociale veiligheid", href: "/sociale-veiligheid" },
        { label: "Boven- en onderstroom", href: "/boven-en-onderstroom" },
        { label: "Brein en samenwerking", href: "/brein-en-samenwerking" },
      ],
    },
    {
      label: "Energie en motivatie",
      links: [
        { label: "Teamenergie", href: "/kennis/teamenergie" },
        { label: "Bevlogenheid in het werk", href: "/kennis/bevlogenheid-in-het-werk" },
      ],
    },
    {
      label: "Veranderen en verbeteren",
      links: [
        { label: "Kleine experimenten", href: "/kleine-experimenten" },
        { label: "Borging na een teamdag", href: "/kennis/impact-van-een-teamdag" },
      ],
    },
  ],
};

export const allKnowledgeLinks = [
  knowledgeNavigation.overview,
  knowledgeNavigation.wijzer,
  knowledgeNavigation.gesprek,
  ...knowledgeNavigation.featured,
  ...knowledgeNavigation.groups.flatMap((group) => group.links),
];
