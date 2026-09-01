// Eén manier om een actie uit te voeren die kan mislukken.
//
// Het patroon dat overal in de app stond:
//
//   setBezig(true);
//   try { await iets(); } finally { setBezig(false); }
//
// De knop ging netjes weer aan, maar bij een fout gebeurde er niets zichtbaars.
// Je klikte, er veranderde niets, en je klikte nog een keer.
//
// Hiermee wordt dat:
//
//   const { bezig, melding, voerUit, wisMelding } = useActie();
//   voerUit("je naam bewaren", async () => { await zetNaam(naam); }, "Je naam is bijgewerkt.");
//
// De actienaam gaat over wat de gebruiker probeerde, niet over wat de code
// deed — die komt in de melding terecht als er verder niets bekend is.

import { useCallback, useState } from "react";
import { omschrijfFout } from "../../lib/app/meldingen";

export function useActie() {
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState(null);

  const wisMelding = useCallback(() => setMelding(null), []);

  /**
   * @param actie   wat de gebruiker probeert, in gewone woorden
   * @param doen    de functie die het werk doet
   * @param gelukt  optionele bevestiging; laat weg als het resultaat zichtbaar is
   * @returns       true als het lukte, zodat de aanroeper kan opruimen
   */
  const voerUit = useCallback(async (actie, doen, gelukt = null) => {
    setBezig(true);
    setMelding(null);
    try {
      await doen();
      if (gelukt) setMelding({ soort: "goed", tekst: gelukt });
      return true;
    } catch (fout) {
      setMelding({ soort: "fout", tekst: omschrijfFout(fout, actie) });
      return false;
    } finally {
      setBezig(false);
    }
  }, []);

  return { bezig, melding, setMelding, voerUit, wisMelding };
}

export default useActie;
