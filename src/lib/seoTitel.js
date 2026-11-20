/**
 * De titel van een artikel zoals die in Google en in het browsertabblad staat.
 *
 * Een artikel kan in de frontmatter een `seoTitle` hebben naast `title`. De
 * gewone titel blijft de kop op de pagina; de seoTitle is wat iemand in de
 * zoekresultaten leest. Dat verschil is nodig bij de reeks over filosofen:
 * "Adam Smith, de onpartijdige toeschouwer" is een goede kop voor wie het
 * artikel al leest, maar wordt in Google vooral getoond aan mensen die iets
 * over Adam Smith zoeken. Die klikken niet, en de leidinggevende met precies
 * deze vraag herkent zijn situatie er niet in.
 *
 * De merknaam komt erachter zolang het geheel binnen 65 tekens blijft. Daarna
 * kort Google de titel af, en dan valt liever de merknaam weg dan de vraag.
 */
export const MERK = "Mijn Teamkompas";
const MAX = 65;

export function artikelPaginaTitel({ title, seoTitle } = {}) {
  const kop = (seoTitle || title || "Artikel").trim();
  const met = `${kop} | ${MERK}`;
  return met.length <= MAX ? met : kop;
}

export default artikelPaginaTitel;
