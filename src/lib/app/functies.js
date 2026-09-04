// Functies die af kunnen staan.
//
// Sommige onderdelen zijn af, maar horen nog niet bij de eerste release. Ze
// verwijderen zou betekenen dat ze later opnieuw gebouwd moeten worden, dus
// staan ze hier uit met één schakelaar. Zet de waarde op true en het onderdeel
// is er weer, zonder dat er verder iets hoeft te veranderen.

/**
 * Meerdere collega's tegelijk kiezen bij Samenwerken.
 *
 * Staat dit uit, dan werkt het scherm zoals bij één collega: je kiest iemand,
 * en kies je daarna iemand anders, dan vervangt die de eerste. Het advies over
 * twee anderen onderling en het groepsadvies zijn dan onbereikbaar.
 *
 * De code eronder (vraagDuoadvies, vraagGroepsadvies, de bijbehorende
 * schermen) blijft gewoon bestaan en wordt getest. Zet deze waarde op true om
 * alles in één keer weer aan te zetten.
 */
export const MEERDERE_COLLEGAS = false;

export default { MEERDERE_COLLEGAS };
