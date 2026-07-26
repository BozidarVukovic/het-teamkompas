export const serviceLinks = [
  { label: "Teamscan", href: "/teamscan" },
  { label: "Teamontwikkeling", href: "/teamontwikkeling" },
  { label: "Insights Discovery", href: "/insights-discovery-profiel" },
  { label: "Teamcoaching", href: "/teamcoaching" },
  { label: "Teamdag", href: "/teamdag" },
  { label: "Sprekers", href: "/sprekers" },
];

export const knowledgeNavigation = {
  overview: { label: "Teamcultuur", href: "/kennis/teamcultuur" },
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
        { label: "Bevlogenheid in het werk", href: "/kennis/bevlogenheid-in-het-werk" },
      ],
    },
    {
      label: "Veranderen en ontwikkelen",
      links: [
        { label: "Kleine experimenten", href: "/kleine-experimenten" },
        { label: "Kenniskaart teamontwikkeling", href: "/kennis/kenniskaart-teamontwikkeling" },
        { label: "Borging na een teamdag", href: "/kennis/impact-van-een-teamdag" },
      ],
    },
  ],
};

export const allKnowledgeLinks = [
  ...knowledgeNavigation.featured,
  ...knowledgeNavigation.groups.flatMap((group) => group.links),
];
