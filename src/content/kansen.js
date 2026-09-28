// De vier kansen die op de homepage om de beurt in beeld komen.
//
// Losse data, zodat de tekst te wijzigen is zonder de carrousel aan te raken,
// en zodat een test kan controleren dat elke kans naar een pagina wijst die
// echt bestaat.
//
// Elke kans verwijst naar de bestaande pagina die er het diepst op ingaat.
// Er is bewust geen nieuwe pagina bij verzonnen en geen enkele link wijst naar
// iets wat nog gemaakt moet worden.

export const KANSEN = [
  {
    id: "kwaliteiten",
    titel: "Elkaars kwaliteiten benutten",
    tekst:
      "Wanneer professionals weten waar zij elkaar aanvullen, wordt samenwerking gerichter en krijgt ieders bijdrage meer waarde.",
    // Deze pagina gaat precies hierover: je eigen voorkeuren kennen, die van een
    // ander herkennen, en zien waar ze elkaar aanvullen.
    href: "/insights-discovery-profiel",
  },
  {
    id: "uitspreken",
    titel: "Uitspreken wat speelt",
    tekst:
      "Een gesprek dat een team steeds uitstelt, kan precies het gesprek zijn dat nieuwe beweging mogelijk maakt.",
    // Waarom een gesprek uitgesteld wordt, is een vraag over veiligheid:
    // durf ik dit te zeggen zonder dat het me iets kost.
    href: "/psychologische-veiligheid",
  },
  {
    id: "eigenaarschap",
    titel: "Eigenaarschap versterken",
    tekst:
      "Eigenaarschap groeit wanneer duidelijk is waar iemand zelf over beslist en waar het team elkaar nodig heeft.",
    href: "/kennis/eigenaarschap-in-teams",
  },
  {
    id: "kleine-stappen",
    titel: "Leren van kleine stappen",
    tekst:
      "Een kleine verandering die een team samen volhoudt, kan meer opleveren dan een groot plan dat op papier blijft.",
    href: "/kleine-experimenten",
  },
];

/** Hoe lang één kans blijft staan voordat de volgende verschijnt. */
export const WISSELTIJD = 7000;

/**
 * De volgende positie in een lijst die rondloopt.
 *
 * Pure functie, los van React, zodat het omslaan van vier naar één getest kan
 * worden zonder een browser. `stap` is +1 of -1.
 */
export function verschuif(index, stap, aantal) {
  if (!Number.isFinite(aantal) || aantal <= 0) return 0;
  const i = Number.isFinite(index) ? index : 0;
  const s = Number.isFinite(stap) ? stap : 0;
  return ((i + s) % aantal + aantal) % aantal;
}
