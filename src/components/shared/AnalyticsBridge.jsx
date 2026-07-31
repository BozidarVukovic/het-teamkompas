import { useEffect } from "react";

/**
 * Verbindt de interne events van de site met Google Analytics 4.
 *
 * Overal in de code wordt `trackEvent(...)` of een `teamkompas:analytics`
 * CustomEvent gebruikt. Dit component luistert daarop en stuurt het door naar
 * gtag. Componenten weten daardoor niets van Analytics; wisselen we ooit van
 * meetoplossing, dan verandert alleen dit bestand.
 *
 * Over toestemming: gtag bestaat pas nadat de bezoeker cookies accepteert
 * (zie CookieBanner). Is er geen toestemming, dan is `window.gtag` afwezig en
 * verdwijnt het event stilletjes. Dat is de bedoeling. We bewaren ook niets om
 * later alsnog te versturen.
 *
 * Paginaweergaves worden hier bewust NIET gemeten. In de Analytics-instellingen
 * staat onder Verbeterde meting de optie "Paginawijzigingen op basis van
 * browsegeschiedenisgebeurtenissen" aan. Google meet de navigatie binnen deze
 * single page app daardoor al zelf, want react-router gebruikt precies die
 * browsergeschiedenis. Zouden we hier ook een page_view sturen, dan telt elke
 * paginaweergave dubbel.
 */

function stuur(naam, data = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", naam, data);
  } catch {
    // Meten mag nooit de gebruikerservaring verstoren.
  }
}

export default function AnalyticsBridge() {
  useEffect(() => {
    function onEvent(e) {
      const { name, ...rest } = e.detail || {};
      if (name) stuur(name, rest);
    }
    window.addEventListener("teamkompas:analytics", onEvent);
    return () => window.removeEventListener("teamkompas:analytics", onEvent);
  }, []);

  return null;
}
