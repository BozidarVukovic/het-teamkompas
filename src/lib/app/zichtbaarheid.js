// Wie kan dit punt zien?
//
// Bij elk punt in je profiel hoort te staan wie het kan zien — niet in de
// kleine lettertjes onderaan, maar naast het punt zelf, want daar wordt de
// keuze gemaakt. "Privé" is daarbij geen tussenstand die je nog moet afmaken:
// het is een geldige keuze, en die hoort er net zo duidelijk te staan als het
// delen zelf.
//
// Losse module en geen React, zodat er een test op kan. Een label dat "Gedeeld"
// zegt terwijl er niets gedeeld is — of andersom — is een vertrouwensfout, geen
// opmaakfoutje.

/**
 * @param huidig          het opgeslagen kenmerk ({ gedeeldMet: [...] })
 * @param lidmaatschappen de teams waar je bij hoort
 */
export function zichtbaarheidVan(huidig, lidmaatschappen = []) {
  const met = (huidig && huidig.gedeeldMet) || [];
  const teams = (lidmaatschappen || []).filter((l) => met.includes(`${l.orgId}/${l.teamId}`));

  if (teams.length === 0) return { gedeeld: false, aantal: 0, label: "Privé" };
  if (teams.length === 1) {
    return { gedeeld: true, aantal: 1, label: `Gedeeld met ${teams[0].teamNaam || "je team"}` };
  }
  return { gedeeld: true, aantal: teams.length, label: `Gedeeld met ${teams.length} teams` };
}
