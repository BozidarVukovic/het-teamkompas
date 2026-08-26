// Herbruikbare keuzevelden voor de teamdag-generator.
//
// Alle door de gebruiker ingevoerde tekst wordt als tekst weergegeven, nooit
// als HTML. React ontsnapt dat standaard; er wordt hier bewust nergens
// dangerouslySetInnerHTML gebruikt.
//
// `kolommen` zet korte antwoorden naast elkaar in plaats van onder elkaar. Dat
// is bedoeld voor lijsten met korte labels, zoals ja, gedeeltelijk, nee.

import React from "react";

export function EnkeleKeuze({ naam, opties, waarde, onKies, kolommen = false, compact = false }) {
  return (
    <fieldset className={`td-opties${kolommen ? " td-opties--kolommen" : ""}${compact ? " td-opties--compact" : ""}`}>
      <legend className="td-verborgen">Kies één antwoord</legend>
      {opties.map((o) => {
        const gekozen = waarde === o.id;
        return (
          <label
            key={o.id}
            className={`td-optie${gekozen ? " td-optie--gekozen" : ""}`}
            // Klikken op het antwoord dat al gekozen is, vuurt geen onChange af.
            // Zonder deze regel lijkt de keuze dood bij een vooringevuld
            // antwoord of wanneer iemand via Terug terugkomt.
            onClick={() => { if (gekozen) onKies(o.id); }}
          >
            <input
              type="radio"
              name={naam}
              value={o.id}
              checked={gekozen}
              onChange={() => onKies(o.id)}
            />
            <span className="td-optie-tekst">
              <span className="td-optie-label">{o.label}</span>
              {o.uitleg ? <span className="td-optie-uitleg">{o.uitleg}</span> : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function MeervoudigeKeuze({ naam, opties, waarden = [], onWissel, max, kolommen = false, compact = false }) {
  const vol = typeof max === "number" && waarden.length >= max;
  return (
    <>
      <fieldset className={`td-opties${kolommen ? " td-opties--kolommen" : ""}${compact ? " td-opties--compact" : ""}`}>
        <legend className="td-verborgen">Kies wat van toepassing is</legend>
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
              <span className="td-optie-tekst">
                <span className="td-optie-label">{o.label}</span>
                {o.uitleg ? <span className="td-optie-uitleg">{o.uitleg}</span> : null}
              </span>
            </label>
          );
        })}
      </fieldset>
      {typeof max === "number" ? (
        <p className="td-teller">
          {waarden.length} van maximaal {max} gekozen
        </p>
      ) : null}
    </>
  );
}

export function Tekstveld({ id, kop, waarde, onWijzig, hint, plaatshouder, maxLengte = 400 }) {
  return (
    <div className="td-tekstblok">
      {kop ? (
        <label className="td-veld-kop" htmlFor={id}>
          {kop}
        </label>
      ) : null}
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
