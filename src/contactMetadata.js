export const CONTACT_INTERESTS = [
  { value: "Insights Discovery", label: "Insights Discovery", badge: "🟣", color: "#9b59b6" },
  { value: "Digitale Teamscan", label: "Digitale Teamscan", badge: "🔵", color: "#3498db" },
  { value: "Teamdag", label: "Teamdag", badge: "🟢", color: "#2ecc71" },
  { value: "Teamontwikkeling", label: "Teamontwikkeling", badge: "🟠", color: "#f39c12" },
  { value: "Teamcoaching", label: "Teamcoaching", badge: "🟢", color: "#27ae60" },
  { value: "Verkennend gesprek", label: "Verkennend gesprek", badge: "🟡", color: "#f1c40f" },
  { value: "Reflectiekaarten", label: "Reflectiekaarten", badge: "🟤", color: "#a66a2c" },
  { value: "Workshop", label: "Workshop", badge: "🟣", color: "#8e44ad" },
  { value: "Spreker", label: "Spreker", badge: "🔴", color: "#e74c3c" },
  { value: "Offerte", label: "Offerte", badge: "⚫", color: "#95a5a6" },
  { value: "Algemene vraag", label: "Algemene vraag", badge: "⚪", color: "#bdc3c7" },
  { value: "Anders", label: "Anders", badge: "⚪", color: "#95a5a6" },
];

export const CONTACT_INTEREST_FILTERS = [
  { value: "all", label: "Alle aanvragen" },
  ...CONTACT_INTERESTS.filter(({ value }) => [
    "Insights Discovery",
    "Digitale Teamscan",
    "Teamdag",
    "Teamontwikkeling",
    "Verkennend gesprek",
    "Workshop",
    "Algemene vraag",
  ].includes(value)),
];

export const PAGE_SOURCES = {
  "/": "Homepage",
  "/insights-discovery-profiel": "Insights Discovery pagina",
  "/teamscan": "Teamscan pagina",
  "/teamdag": "Teamdag pagina",
  "/teamontwikkeling": "Teamontwikkeling pagina",
  "/teamcoaching": "Teamcoaching pagina",
  "/verkennen": "Verkennend gesprek pagina",
  "/psychologische-veiligheid": "Psychologische veiligheid pagina",
  "/sociale-veiligheid": "Sociale veiligheid pagina",
  "/kleine-experimenten": "Kleine experimenten pagina",
  "/neuromanagement": "Neuromanagement pagina",
  "/blog": "Blog",
  "/contact": "Contactpagina",
};

export function getInterestConfig(value) {
  return CONTACT_INTERESTS.find((item) => item.value === value) || CONTACT_INTERESTS.find((item) => item.value === "Anders");
}

export function getCurrentPageInfo(pathname = typeof window !== "undefined" ? window.location.pathname : "") {
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const direct = PAGE_SOURCES[normalized];
  if (direct) return direct;
  if (normalized.startsWith("/blog")) return PAGE_SOURCES["/blog"];
  if (normalized.startsWith("/teamontwikkeling")) return PAGE_SOURCES["/teamontwikkeling"];
  return "Website";
}
