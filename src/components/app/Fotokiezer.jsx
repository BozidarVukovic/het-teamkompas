// Wie je bent, bovenaan het ik-scherm -- met je foto erbij.
//
// Het hele kopblok staat hier en niet in Ik.jsx, omdat de foto en de naam in
// dezelfde twee kolommen staan: de bol links is de knop, de regel eronder
// rechts zegt in woorden wat die knop doet. Uit elkaar halen betekent dat de
// helft van de bediening in het ene bestand staat en de helft in het andere.

import { useRef } from "react";
import { useApp } from "../../lib/app/AppContext";
import useActie from "./useActie";
import Melding from "./Melding";
import Bol from "./Bol";
import { bestandsfout, maakFoto } from "../../lib/app/foto";

export default function Fotokiezer({ naam, functie, email }) {
  const { foto, zetProfielgegevens } = useApp();
  const invoer = useRef(null);
  const { bezig, melding, setMelding, voerUit, wisMelding } = useActie();

  const kiezen = () => {
    if (!bezig && invoer.current) invoer.current.click();
  };

  const gekozen = (gebeurtenis) => {
    const bestand = gebeurtenis.target.files && gebeurtenis.target.files[0];

    // Leegmaken vóór het werk begint. Zonder dit levert twee keer hetzelfde
    // bestand kiezen geen tweede change op, en lijkt de knop kapot nadat je
    // de foto eerst hebt weggehaald.
    gebeurtenis.target.value = "";
    if (!bestand) return;

    // De controle op soort en grootte gebeurt hier en niet in voerUit: dit is
    // geen mislukte actie maar een keuze die niet kan, en dan hoort er geen
    // zin te verschijnen over dat er iets misging.
    const probleem = bestandsfout(bestand);
    if (probleem) {
      setMelding({ soort: "fout", tekst: probleem });
      return;
    }

    voerUit("je foto bewaren", async () => {
      const vierkant = await maakFoto(bestand);
      await zetProfielgegevens({ foto: vierkant });
    });
  };

  const weghalen = () =>
    voerUit("je foto weghalen", () => zetProfielgegevens({ foto: "" }));

  return (
    <>
      <header className="tk-ikkop">
        <button
          type="button"
          className="tk-bolknop"
          onClick={kiezen}
          disabled={bezig}
          aria-label={foto ? "Je foto vervangen" : "Een foto toevoegen"}
        >
          <Bol naam={naam} foto={foto} klasse="tk-bol-groot" />
          <span className="tk-bolknop-teken" aria-hidden="true">{foto ? "✎" : "+"}</span>
        </button>

        <div style={{ minWidth: 0 }}>
          <h1 className="tk-kop" style={{ marginBottom: 2 }}>{naam || "Ik"}</h1>
          <p className="tk-onderkop" style={{ margin: 0 }}>
            {functie ? `${functie} · ` : ""}
            {email}
          </p>
          <p className="tk-fijn" style={{ margin: "6px 0 0" }}>
            <button type="button" className="tk-tekstknop" onClick={kiezen} disabled={bezig}>
              {bezig ? "Bezig…" : foto ? "Foto vervangen" : "Foto toevoegen"}
            </button>
            {foto && (
              <>
                {" · "}
                <button type="button" className="tk-tekstknop" onClick={weghalen} disabled={bezig}>
                  Weghalen
                </button>
              </>
            )}
          </p>
        </div>

        {/* Verborgen en toch de echte invoer: de knop hierboven klikt hem aan.
            Een bestandskiezer laat zich niet opmaken, en een bol met een foto
            erin is duidelijker dan een grijze knop met "Bladeren". */}
        <input
          ref={invoer}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={gekozen}
          style={{ display: "none" }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </header>

      <Melding melding={melding} onSluiten={wisMelding} />

      {!foto && (
        <p className="tk-fijn" style={{ margin: "-8px 0 18px" }}>
          Een foto is niet verplicht. Zet je er een op, dan staat hij bij je naam voor je
          teamgenoten, net als je functie. Hij wordt in je browser vierkant gesneden en
          verkleind; het origineel verlaat je apparaat niet.
        </p>
      )}
    </>
  );
}
