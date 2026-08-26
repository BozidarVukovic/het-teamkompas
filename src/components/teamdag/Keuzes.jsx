// Herbruikbare keuzevelden voor de teamdag-generator.
//
// Alle door de gebruiker ingevoerde tekst wordt als tekst weergegeven, nooit
// als HTML. React ontsnapt dat standaard; er wordt hier bewust nergens
// dangerouslySetInnerHTML gebruikt.

import React from "react";

export function EnkeleKeuze({ naam, opties, waarde, onKies, kop, uitleg }) {
  return (
    <fieldset className="td-veld td-opties">
      {kop ? <legend>{kop}</legend> : null}
      {uitleg ? <p className="td-vraag-uitleg">{uitleg}</p> : null}
      {opties.map((o) => {
        const gekozen = waarde === o.id;
        return (
          <label key={o.id} className={`td-optie${gekozen ? " td-optie--gekozen" : ""}`}>
            <input
              type="radio"
              name={naam}
              value={o.id}
              checked={gekozen}
              onChange={() => onKies(o.id)}
            />
            <span>
              <span className="td-optie-label">{o.label}</span>
              {o.uitleg ? <span className="td-optie-uitleg">{o.uitleg}</span> : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function MeervoudigeKeuze({ naam, opties, waarden = [], onWissel, kop, max, uitleg }) {
  const vol = typeof max === "number" && waarden.length >= max;
  return (
    <fieldset className="td-veld td-opties">
      {kop ? <legend>{kop}</legend> : null}
      {uitleg ? <p className="td-vraag-uitleg">{uitleg}</p> : null}
      {opties.map((o) => {
        const gekozen = waarden.includes(o.id);
        const uit = vol && !gekozen;
        return (
          <label
            key={o.id}
            className={`td-optie${gekozen ? " td-optie--gekozen" : ""}${uit ? " td-optie--uit" : ""}`}
          >
            <input
              type="checkbox"
              name={naam}
              value={o.id}
              checked={gekozen}
              disabled={uit}
              onChange={() => onWissel(o.id)}
            />
            <span>
              <span className="td-optie-label">{o.label}</span>
              {o.uitleg ? <span className="td-optie-uitleg">{o.uitleg}</span> : null}
            </span>
          </label>
        );
      })}
      {typeof max === "number" ? (
        <p className="td-max">
          {waarden.length} van maximaal {max} gekozen.
        </p>
      ) : null}
    </fieldset>
  );
}

export function Tekstveld({ id, kop, waarde, onWijzig, hint, plaatshouder, maxLengte = 400 }) {
  return (
    <div className="td-veld">
      <label className="td-veld-kop" htmlFor={id}>
        {kop}
      </label>
      <textarea
        id={id}
        className="td-tekstveld"
        value={waarde || ""}
        maxLength={maxLengte}
        placeholder={plaatshouder}
        onChange={(e) => onWijzig(e.target.value)}
      />
      {hint ? <p className="td-privacy-hint">{hint}</p> : null}
    </div>
  );
}

export default EnkeleKeuze;
