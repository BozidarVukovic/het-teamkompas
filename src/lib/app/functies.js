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
 * Staat sinds 30 september aan. Tot dan hoorde het niet bij de eerste release.
 * Wat er nu bij komt:
 *
 *   - Meerdere collega's tegelijk aanvinken.
 *   - Vanaf drie mensen (jij plus twee) het groepsadvies: waar de voorkeuren
 *     uiteenlopen, wat de groep deelt, een voorgestelde afspraak per punt, en
 *     het advies om af te drukken.
 *   - Bij precies twee anderen de derde vraag: niet hoe jij met hen werkt,
 *     maar hoe zij op elkaar landen. Dat is de vraag van wie een team
 *     begeleidt.
 *
 * Alles wat hieraan hangt staat er al en wordt getest. Op false zetten schakelt
 * het in één keer weer uit, zonder dat er verder iets hoeft te veranderen.
 */
export const MEERDERE_COLLEGAS = true;

export default { MEERDERE_COLLEGAS };
