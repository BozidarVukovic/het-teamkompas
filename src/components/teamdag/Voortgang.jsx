// Voortgangsindicator van de beslisboom: "stap 4 van 8".

import React from "react";

export default function Voortgang({ nummer, totaal, titel }) {
  const percentage = Math.round((nummer / totaal) * 100);
  return (
    <div className="td-voortgang">
      <div className="td-voortgang-tekst">
        <span>
          Stap {nummer} van {totaal}
        </span>
        {titel ? <span>{titel}</span> : null}
      </div>
      <div
        className="td-balk"
        role="progressbar"
        aria-valuenow={nummer}
        aria-valuemin={1}
        aria-valuemax={totaal}
        aria-label={`Stap ${nummer} van ${totaal}`}
      >
        <div className="td-balk-vulling" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
