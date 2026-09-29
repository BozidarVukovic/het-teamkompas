// Eén vraag, één label, één manier.
//
// Er stonden twee mechanismen naast elkaar voor precies dezelfde handeling. De
// knop in de menubalk ging naar /verkennen; de knoppen op de pagina openden een
// venster met het contactformulier. Wie op de menubalk klikte verloor zijn plek
// op de pagina, kreeg een landingspagina, en moest daar nóg een keer klikken om
// bij hetzelfde formulier te komen. Op /verkennen wees die knop bovendien naar
// de pagina waar je al stond.
//
// Nu roept elke knop dezelfde functie aan. Staat er op deze pagina een venster
// klaar, dan gaat dat open en blijft de bezoeker waar hij was. Zo niet, dan is
// /verkennen nog steeds de bestemming -- dat is ook waar advertenties, e-mails
// en de kennisbank naartoe wijzen, dus die route moet blijven werken.
//
// De koppeling loopt via een gebeurtenis op window en niet via een context,
// omdat de menubalk in main.jsx buiten de routes om wordt gerenderd: er staat
// geen provider omheen die zowel de balk als de pagina zou bereiken.

import { useEffect, useRef } from "react";

export const KENNISMAKING = "tk:kennismaking";

/** Vraag om een kennismaking. Opent het venster van deze pagina, en stuurt
 *  anders door naar /verkennen. Geeft terug of een venster het overnam. */
export function vraagKennismaking(navigate) {
  if (typeof window === "undefined") return false;
  // dispatchEvent geeft false zodra een luisteraar preventDefault aanroept.
  // Dat is hier het teken dat een venster de vraag heeft opgepakt.
  const opgepakt = !window.dispatchEvent(new CustomEvent(KENNISMAKING, { cancelable: true }));
  if (!opgepakt && typeof navigate === "function") navigate("/verkennen");
  return opgepakt;
}

/** Laat deze pagina de vraag oppakken met haar eigen venster. */
export function useKennismaking(open) {
  // Via een ref, anders meldt de luisteraar zich bij elke render opnieuw aan:
  // openModal is meestal een pijlfunctie die per render nieuw is.
  const vast = useRef(open);
  vast.current = open;

  useEffect(() => {
    const luister = (e) => {
      if (typeof vast.current !== "function") return;
      e.preventDefault();
      vast.current();
    };
    window.addEventListener(KENNISMAKING, luister);
    return () => window.removeEventListener(KENNISMAKING, luister);
  }, []);
}
