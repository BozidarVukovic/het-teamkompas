// De tekst die in de balk komt te staan.
//
// Apart van het onderdeel dat hem toont, omdat dit het stuk is waar het stil
// mis kan gaan: een kop die uit meerdere elementen bestaat levert tekst op met
// regeleinden en dubbele spaties erin, en dan staat er in de balk een titel met
// een gat in het midden. En een lange teamnaam mag de balk niet uit elkaar
// duwen, maar ook niet middenin een woord worden afgekapt.

/**
 * De leesbare tekst van een kop.
 *
 * textContent plakt alles aan elkaar wat er in de kop staat -- ook een
 * bijschrift in een eigen span, en de witruimte die de JSX ertussen zet. Alles
 * op een spatie zetten maakt er een regel van.
 */
export function titelTekst(kop) {
  if (!kop) return "";
  return String(kop.textContent || "").replace(/\s+/g, " ").trim();
}

/**
 * Een titel die in een balk past.
 *
 * Afkappen op een woordgrens, niet middenin een woord: "Samen verder in het
 * we…" leest als een fout, "Samen verder…" als een keuze. Valt die grens heel
 * vroeg -- bij een titel van één lang woord -- dan is afkappen op de maat zelf
 * beter dan bijna niets overhouden.
 */
export function kortTitel(tekst, max = 48) {
  const schoon = String(tekst || "").replace(/\s+/g, " ").trim();
  if (schoon.length <= max) return schoon;
  const geknipt = schoon.slice(0, max);
  const spatie = geknipt.lastIndexOf(" ");
  const kern = spatie > max * 0.6 ? geknipt.slice(0, spatie) : geknipt;
  return `${kern.replace(/[\s,;:.-]+$/, "")}…`;
}

/**
 * Hoe hoog de vaste bovenkant van het scherm is.
 *
 * Niet een getal in de code: op een breed scherm plakken er twee balken
 * (het merk en het menu), op een telefoon alleen de bovenste, en het menu is
 * daar helemaal weg. Wat we willen weten is waar de inhoud onder vandaan komt,
 * en dat is de onderkant van de laagste balk die er staat.
 */
export function chroomHoogte(balk, menu) {
  const onderkant = (el) => {
    if (!el || typeof el.getBoundingClientRect !== "function") return 0;
    if (el.offsetParent === null) return 0;
    const { bottom } = el.getBoundingClientRect();
    return Number.isFinite(bottom) ? Math.max(0, Math.round(bottom)) : 0;
  };
  return Math.max(onderkant(balk), onderkant(menu));
}
