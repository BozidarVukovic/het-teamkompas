// Een scherm ophalen dat apart wordt geladen.
//
// Elke nieuwe versie geeft de bestanden nieuwe namen. Een tabblad dat al open
// stond vraagt bij doorklikken dus om een bestand dat er niet meer is. De
// import mislukt, React blijft in Suspense hangen, en de bezoeker kijkt naar
// "Even laden..." tot hij het opgeeft. Dat overkomt iedereen die de site open
// heeft staan op het moment dat wij uitrollen -- en dat is meerdere keren per
// dag.
//
// Eén keer verversen haalt de nieuwe namen op en is klaar. Eén keer, want een
// import die om een andere reden mislukt (geen netwerk, een echte fout) mag
// geen eindeloze lus worden: de tweede keer laten we de fout gewoon vallen,
// zodat het opvangnet van React hem te zien krijgt.
//
// Het merkteken staat in sessionStorage: het hoort bij dit tabblad en deze
// poging, niet bij de bezoeker. In een privévenster kan opslaan gooien; dan
// gebeurt er niets bijzonders en blijft het gedrag zoals het was.
const SLEUTEL = "tk-nieuwe-versie-herladen";

function onthoud(actie) {
  try { return actie(window.sessionStorage); } catch { return null; }
}

export function maakPaginaLader({ opslag, herlaad } = {}) {
  const lees = opslag ? (fn) => { try { return fn(opslag); } catch { return null; } } : onthoud;
  const verversen = herlaad || (() => window.location.reload());
  return function laadPagina(haalOp) {
    return haalOp().then((module) => {
      lees((o) => o.removeItem(SLEUTEL));
      return module;
    }).catch((fout) => {
      if (lees((o) => o.getItem(SLEUTEL))) throw fout;
      lees((o) => o.setItem(SLEUTEL, "1"));
      verversen();
      // De pagina gaat weg. Niets teruggeven is hier het rustigste: een
      // afgewezen belofte zou nog een foutscherm laten zien in de milliseconden
      // voordat de nieuwe versie er is.
      return new Promise(() => {});
    });
  };
}

export const laadPagina = maakPaginaLader();
