/**
 * Lichte analytics-helper.
 *
 * Vuurt een `teamkompas:analytics` CustomEvent af op window. Dat is hetzelfde
 * patroon dat de gratis teamscan al gebruikt, zodat er één plek is waar een
 * meetoplossing (Vercel Analytics, GA, Plausible) later op kan luisteren
 * zonder dat er in componenten iets hoeft te veranderen.
 *
 * Gebruik: trackEvent("hero_primary_cta_click")
 */
export function trackEvent(name, data = {}) {
  if (typeof window === "undefined" || !name) return;
  try {
    window.dispatchEvent(new CustomEvent("teamkompas:analytics", { detail: { name, ...data } }));
  } catch {
    // Meten mag nooit de gebruikersinteractie blokkeren.
  }
}

export default trackEvent;
