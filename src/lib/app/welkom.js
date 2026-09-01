// Wanneer hoort iemand het welkomscherm te zien?
//
// Dat scherm doet twee dingen: het is de laatste stap van het aanmelden, én de
// plek om later bij een extra team aan te sluiten. Precies daardoor kan het
// opduiken bij iemand die er niets te zoeken heeft — na opnieuw inloggen, of
// omdat het adres nog in een tabblad stond. Wie al een team heeft en er niet
// zelf om vroeg, hoort gewoon op Start uit te komen.
//
// Losse module en geen React, zodat er een test op kan. Dit is de regel die
// bepaalt waar iemand belandt na het inloggen; die hoort niet in een component
// te staan waar je hem alleen met de hand kunt controleren.

/**
 * @returns het adres waar iemand naartoe moet, of null als het welkomscherm
 *          zelf de juiste plek is.
 */
export function welkombestemming({ lidmaatschappen = [], uitnodigingscode = null, extra = false } = {}) {
  // Zonder team is het welkomscherm de enige weg vooruit.
  if ((lidmaatschappen || []).length === 0) return null;

  // Hij vroeg er zelf om, via "Bij een ander team aansluiten".
  if (extra) return null;

  // Er staat een uitnodiging klaar; die wil je kunnen aannemen.
  if (uitnodigingscode) return null;

  return "/app";
}
