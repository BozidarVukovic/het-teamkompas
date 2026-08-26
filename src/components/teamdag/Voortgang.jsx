// Voortgangsindicator: waar ben je in de acht fasen, en hoeveel vragen zijn er
// nog. De fasen geven overzicht, de teller geeft zekerheid over het einde.

import React from "react";
import { STAPPEN } from "../../data/teamdag/vragen.js";

export default function Voortgang({ fase, vraagNummer, totaalVragen }) {
  const huidige = STAPPEN.findIndex((s) => s.id === fase);
  const percentage = Math.round((vraagNummer / totaalVragen) * 100);

  return (
    <div className="td-voortgang">
      <ol className="td-fasen" aria-label="Onderdelen van de vragenlijst">
        {STAPPEN.map((s, i) => {
          const staat = i < huidige ? "af" : i === huidige ? "nu" : "komt";
          return (
            <li key={s.id} className={`td-fase td-fase--${staat}`} aria-current={staat === "nu" ? "step" : undefined}>
              <span className="td-fase-stip" aria-hidden="true" />
              <span className="td-fase-label">{s.kort}</span>
            </li>
          );
        })}
      </ol>

      <div
        className="td-balk"
        role="progressbar"
        aria-valuenow={vraagNummer}
        aria-valuemin={1}
        aria-valuemax={totaalVragen}
        aria-label={`Vraag ${vraagNummer} van ${totaalVragen}`}
      >
        <div className="td-balk-vulling" style={{ width: `${percentage}%` }} />
      </div>

      <p className="td-voortgang-tekst">
        Vraag {vraagNummer} van {totaalVragen}
        {STAPPEN[huidige] ? <span className="td-voortgang-fase"> · {STAPPEN[huidige].titel}</span> : null}
      </p>
    </div>
  );
}
