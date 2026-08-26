import {
  VEILIGHEIDSVRAGEN, VEILIGHEID_DISCLAIMER, VEILIGHEID_INTRO, VEILIGHEID_UITKOMST,
} from "../../data/gespreksvoorbereider/teksten";
import { beoordeelVeiligheid } from "../../lib/gespreksvoorbereider/veiligheid";

/**
 * De veiligheidscheck bij het bespreken van onveilig gedrag.
 *
 * Bij een verhoogd risico gaat de website niet uit zichzelf verder met een
 * gewoon gespreksscript. De gebruiker ziet eerst waar ondersteuning te vinden
 * is, en kiest daarna zelf of hij toch een voorbereiding wil maken.
 *
 * We vellen hier geen juridisch oordeel en stellen niet vast of er formeel
 * sprake is van pesten, intimidatie of discriminatie.
 */
export default function Veiligheidscheck({ antwoorden = {}, onWijzig, onDoorgaan, onTerug }) {
  const oordeel = beoordeelVeiligheid(antwoorden);
  const uitkomst = oordeel.risico ? VEILIGHEID_UITKOMST.aandacht : VEILIGHEID_UITKOMST.veilig;

  return (
    <div className="gv-kaart gv-veiligheid">
      <h2>Eerst even dit</h2>
      <p className="gv-uitleg">{VEILIGHEID_INTRO}</p>

      {VEILIGHEIDSVRAGEN.map((vraag) => (
        <fieldset className="gv-veld" key={vraag.id}>
          <legend className="gv-veldlabel">{vraag.vraag}</legend>
          <div className="gv-opties">
            {[{ id: "ja", label: "Ja" }, { id: "nee", label: "Nee" }].map((optie) => (
              <label className="gv-optie" key={optie.id}>
                <input
                  type="radio"
                  name={"veiligheid-" + vraag.id}
                  checked={antwoorden[vraag.id] === optie.id}
                  onChange={() => onWijzig(vraag.id, optie.id)}
                />
                <span>{optie.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {oordeel.compleet && (
        <div className={"gv-melding" + (oordeel.risico ? "" : " gv-melding--rustig")} role="status">
          <h3>{uitkomst.kop}</h3>
          <p style={{ margin: 0 }}>{uitkomst.tekst}</p>
          {oordeel.redenen.length > 0 && (
            <ul>{oordeel.redenen.map((reden) => <li key={reden}>{reden}</li>)}</ul>
          )}
          {uitkomst.vervolgstappen && (
            <>
              <p style={{ marginBottom: 0 }}><strong>Wat je nu kunt doen</strong></p>
              <ul>{uitkomst.vervolgstappen.map((stap) => <li key={stap}>{stap}</li>)}</ul>
            </>
          )}
        </div>
      )}

      <p className="gv-disclaimer">{VEILIGHEID_DISCLAIMER}</p>

      <div className="gv-acties">
        <button type="button" className="gv-knop gv-knop--secundair" onClick={onTerug}>← Andere situatie kiezen</button>
        <span className="gv-spacer" />
        <button
          type="button"
          className={"gv-knop " + (oordeel.risico ? "gv-knop--secundair" : "gv-knop--primair")}
          disabled={!oordeel.compleet}
          onClick={onDoorgaan}
        >
          {oordeel.risico ? "Toch een voorbereiding maken" : "Verder met de voorbereiding →"}
        </button>
      </div>
      {!oordeel.compleet && (
        <p className="gv-limiet" aria-live="polite">Beantwoord alle vier de vragen om verder te kunnen.</p>
      )}
    </div>
  );
}
