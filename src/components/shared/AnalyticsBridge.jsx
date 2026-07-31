import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Verbindt de interne events van de site met Google Analytics 4.
 *
 * Overal in de code wordt `trackEvent(...)` of een `teamkompas:analytics`
 * CustomEvent gebruikt. Dit component luistert daarop en stuurt het door naar
 * gtag. Componenten weten daardoor niets van Analytics; wisselen we ooit van
 * meetoplossing, dan verandert alleen dit bestand.
 *
 * Twee dingen die hier bewust geregeld zijn:
 *
 * 1. Toestemming. gtag bestaat pas nadat de bezoeker cookies accepteert
 *    (zie CookieBanner). Is er geen toestemming, dan is `window.gtag`
 *    afwezig en verdwijnt het event stilletjes. Dat is de bedoeling: zonder
 *    toestemming meten we niet, en we bewaren ook niets om later alsnog te
 *    versturen.
 *
 * 2. Paginaweergaves in een single page app. `gtag("config", ...)` meet alleen
 *    de eerste pagina. Bij navigatie binnen de site verandert de URL zonder
 *    herladen, dus die weergaves sturen we hier zelf.
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
  const location = useLocation();
  const eerstePagina = useRef(true);

  // Interne events doorsturen.
  useEffect(() => {
    function onEvent(e) {
      const { name, ...rest } = e.detail || {};
      if (name) stuur(name, rest);
    }
    window.addEventListener("teamkompas:analytics", onEvent);
    return () => window.removeEventListener("teamkompas:analytics", onEvent);
  }, []);

  // Paginaweergaves bij navigatie binnen de site.
  useEffect(() => {
    // De eerste weergave is al door gtag("config", ...) gemeld; anders telt
    // elke bezoeker zijn landingspagina dubbel.
    if (eerstePagina.current) {
      eerstePagina.current = false;
      return;
    }
    stuur("page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
