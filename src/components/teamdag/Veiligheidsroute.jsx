// De veiligheidsroute: wat de website toont wanneer een gezamenlijke teamdag
// mogelijk niet de veiligste eerste stap is.
//
// Er wordt hier geen oordeel geveld en niet vastgesteld of er formeel sprake is
// van pesten, intimidatie of discriminatie. De gebruiker houdt zelf de keuze.

import React from "react";
import { Link } from "react-router-dom";
import { VEILIGHEIDSROUTE } from "../../data/teamdag/teksten.js";

export default function Veiligheidsroute({ oordeel, onToch, tochGekozen }) {
  return (
    <section className="td-veiligheid" aria-labelledby="td-veiligheid-kop">
      <h2 id="td-veiligheid-kop">{VEILIGHEIDSROUTE.kop}</h2>
      <p>{VEILIGHEIDSROUTE.tekst}</p>

      {oordeel.redenen && oordeel.redenen.length ? (
        <div className="td-redenen">
          <strong>Dit baseren we op wat je zelf aangaf:</strong>
          <ul>
            {oordeel.redenen.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p>{VEILIGHEIDSROUTE.toelichting}</p>

      <h3>Hoe een zorgvuldige intake eruitziet</h3>
      <ol>
        {VEILIGHEIDSROUTE.intakeStappen.map((s) => (
          <li key={s.titel}>
            <strong>{s.titel}.</strong> {s.tekst}
          </li>
        ))}
      </ol>

      <h3>Wat je nu kunt doen</h3>
      <ul className="td-lijst">
        {VEILIGHEIDSROUTE.vervolg.map((v) => (
          <li key={v.href}>
            <Link to={v.href}>{v.label}</Link> — {v.uitleg}
          </li>
        ))}
      </ul>
      <p>
        Betrek waar dat passend is ook HR, een vertrouwenspersoon of een andere bevoegde professional.
      </p>

      {!tochGekozen ? (
        <div className="td-knoprij">
          <button type="button" className="td-knop td-knop--secundair" onClick={onToch}>
            {VEILIGHEIDSROUTE.toch}
          </button>
        </div>
      ) : (
        <p className="td-melding">{VEILIGHEIDSROUTE.tochToelichting}</p>
      )}
    </section>
  );
}
