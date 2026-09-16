// De aangeklikte kop blijft staan waar hij staat.
//
// Eén sectie tegelijk open betekent dat er bij elke klik ook iets dichtgaat.
// Zit dat boven de kop die je net aanraakte, dan zakt de hele pagina omhoog en
// staat de kop die je wilde lezen ineens ergens anders -- soms boven de rand.
// Dat leest als "hij doet raar", en het is precies het verschil tussen een
// scherm dat af voelt en een scherm dat werkt.
//
// De oplossing is meeschuiven: onthoud waar de kop stond, en corrigeer de
// scrollpositie zolang de overgang loopt. De pagina beweegt dan wel, de kop
// niet.
//
// De browserfuncties komen als argument binnen, zodat dit zonder browser te
// testen is.
export function houdOpZijnPlek(meet, doel, opties = {}) {
  const nu = opties.nu || (() => Date.now());
  const plan = opties.plan || ((fn) => requestAnimationFrame(fn));
  const verschuif = opties.verschuif || ((dy) => window.scrollBy(0, dy));
  const duur = typeof opties.duur === "number" ? opties.duur : 380;
  const start = nu();
  const stap = () => {
    const dy = meet() - doel;
    if (Math.abs(dy) > 0.5) verschuif(dy);
    if (nu() - start < duur) plan(stap);
  };
  plan(stap);
}
