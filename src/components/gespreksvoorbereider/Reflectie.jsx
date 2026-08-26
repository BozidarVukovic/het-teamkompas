import { PRIVACY_MELDING, REFLECTIE_AFSLUITING, REFLECTIE_VRAGEN } from "../../data/gespreksvoorbereider/teksten";
import { MAX_TEKST } from "../../lib/gespreksvoorbereider/validatie";

/** Korte terugblik na het gesprek. Optioneel, en net als de rest alleen lokaal. */
export default function Reflectie({ reflectie = {}, onWijzig, onTerug, onAfdrukken }) {
  return (
    <div className="gv-kaart">
      <h2>Terugkijken op het gesprek</h2>
      <p className="gv-uitleg">
        Een gesprek zakt snel weg. Deze vragen duren twee minuten en helpen je te zien wat er werkelijk
        is gebeurd, en wat je een volgende keer anders wilt doen.
      </p>
      <p className="gv-privacy-melding"><span aria-hidden="true">🔒</span>{PRIVACY_MELDING}</p>

      {REFLECTIE_VRAGEN.map((vraag) => (
        <div className="gv-veld" key={vraag.id}>
          <label htmlFor={"gv-reflectie-" + vraag.id}>{vraag.vraag}</label>
          <textarea
            id={"gv-reflectie-" + vraag.id}
            rows={2}
            maxLength={MAX_TEKST}
            value={reflectie[vraag.id] || ""}
            onChange={(event) => onWijzig(vraag.id, event.target.value)}
          />
        </div>
      ))}

      <fieldset className="gv-veld">
        <legend className="gv-veldlabel">Hoe sluit je dit af?</legend>
        <div className="gv-opties" style={{ gridTemplateColumns: "1fr" }}>
          {REFLECTIE_AFSLUITING.map((optie) => (
            <label className="gv-optie" key={optie.id}>
              <input
                type="radio"
                name="reflectie-afsluiting"
                checked={reflectie.afsluiting === optie.id}
                onChange={() => onWijzig("afsluiting", optie.id)}
              />
              <span>{optie.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {reflectie.afsluiting === "ondersteuning" && (
        <div className="gv-melding" role="status">
          <h3>Je hoeft dit niet alleen op te lossen</h3>
          <p style={{ margin: 0 }}>
            Overweeg ondersteuning te vragen aan een leidinggevende, HR-adviseur, vertrouwenspersoon,
            bedrijfsarts of een andere passende professional binnen jouw organisatie. Je terugblik hierboven
            is een goed startpunt voor dat gesprek.
          </p>
        </div>
      )}

      <div className="gv-acties gv-geenprint">
        <button type="button" className="gv-knop gv-knop--secundair" onClick={onTerug}>← Terug naar de voorbereiding</button>
        <span className="gv-spacer" />
        <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={onAfdrukken}>Afdrukken</button>
      </div>
    </div>
  );
}
