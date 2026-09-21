// Hoe lang een antwoord mag blijven staan voordat het scherm doorschuift.
//
// Twee tegengestelde eisen. Te snel en je ziet je eigen keuze niet meer: je
// klikt, het scherm is weg, en je weet niet zeker of je wel het goede hebt
// aangeraakt. Te langzaam en je zit te wachten op een scherm waar je klaar mee
// bent -- vierentwintig keer achter elkaar.
//
// 260 milliseconden is lang genoeg om de rand te zien oplichten en kort genoeg
// om niet als wachten te voelen. Bewust iets meer dan de 240 van een gewone
// overgang: je moet de bevestiging áf zien komen, niet net.

export const NA_ANTWOORD = 260;

/**
 * Wil deze bezoeker beweging zien?
 *
 * Wie in zijn systeem heeft aangezet dat animaties hem misselijk maken of
 * afleiden, hoort hier geen uitzondering op te krijgen. Dan schuift het scherm
 * meteen door, zonder tussenstap: hetzelfde gedrag, alleen zonder de beweging.
 */
export function magBewegen() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pure tegenhanger, zodat de regel te testen is zonder browser. */
export function wachttijd(beweegt) {
  return beweegt ? NA_ANTWOORD : 0;
}
