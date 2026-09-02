// Tekst uit een teamsessie klaarzetten voor iemand anders.
//
// Een team dat samen een hand-in-handleiding heeft gemaakt, heeft die woorden
// al geschreven. Meestal staan ze in een presentatie die na de sessie in een
// map verdwijnt. Ze opnieuw laten intypen door negen mensen is de zekerste
// manier om ze kwijt te raken.
//
// Dus plakt de facilitator ze hier, per stukje. Het is en blijft een voorstel:
// het komt pas in iemands handleiding als die persoon het zelf bewaart, en
// erboven staat wie het heeft klaargezet. De app schrijft nooit uit zichzelf in
// andermans woorden.

import { useState } from "react";
import { SECTIES } from "../../data/app/handleiding";
import { MAX_TEKENS } from "../../lib/app/voorstelOpschonen";
import useActie from "./useActie";
import Melding from "./Melding";

export default function HandleidingKlaarzetten({
  voorWie,
  bestaand = null,
  directBijProfiel = false,
  onBewaar,
  onSluit,
}) {
  const [secties, setSecties] = useState(() => ({ ...((bestaand && bestaand.secties) || {}) }));
  const { bezig, melding, voerUit, wisMelding } = useActie();

  const zet = (id, waarde) => setSecties((s) => ({ ...s, [id]: waarde.slice(0, MAX_TEKENS) }));
  const gevuld = SECTIES.filter((s) => (secties[s.id] || "").trim()).length;

  const bewaren = () => {
    // De knop staat uit zolang er niets staat, dus hier komen we alleen als er
    // echt iets is. Deze controle blijft staan voor het geval dat verandert.
    if (gevuld === 0) return;
    voerUit(
      `de tekst voor ${voorWie} klaarzetten`,
      () => onBewaar(secties),
      directBijProfiel
        ? `De tekst staat bij het profiel van ${voorWie}. Het team ziet het meteen, en het advies citeert eruit.`
        : `De tekst staat klaar voor ${voorWie}. ${
            gevuld === 1 ? "Eén stukje" : `${gevuld} stukjes`
          } — ${voorWie} ziet het bij Mijn handleiding en bepaalt zelf wat ervan blijft staan.`
    );
  };

  return (
    <div className="tk-kaart" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>
        {directBijProfiel
          ? `Eigen woorden van ${voorWie}`
          : `Handleidingtekst klaarzetten voor ${voorWie}`}
      </h3>
      <p className="tk-fijn">
        Heeft het team in een sessie een hand-in-handleiding gemaakt? Plak hier per stukje wat{" "}
        {voorWie} zelf heeft opgeschreven. Laat leeg wat je niet hebt.
      </p>
      {directBijProfiel ? (
        <p className="tk-fijn">
          Dit is een toegevoegd profiel, dus er is niemand die het kan bevestigen: {voorWie} heeft
          nog geen account. Wat je hier neerzet, ziet het team meteen — met erbij dat jij het hebt
          toegevoegd en dat {voorWie} het niet zelf heeft bevestigd. Zet er dus alleen in wat{" "}
          {voorWie} zelf heeft opgeschreven en met dit team heeft gedeeld.
        </p>
      ) : (
        <p className="tk-fijn">
          Het gaat niet meteen in het profiel van {voorWie}: het staat klaar als voorstel, met jouw
          naam erbij. {voorWie} leest het na, past aan wat niet meer klopt, en bepaalt zelf wat er
          blijft staan en wat gedeeld wordt.
        </p>
      )}

      <Melding melding={melding} onSluiten={wisMelding} />

      {SECTIES.map((s) => (
        <div key={s.id} style={{ marginTop: 14 }}>
          <label className="tk-label" htmlFor={`tk-voorstel-${s.id}`}>
            {s.titel}
          </label>
          <p className="tk-fijn" style={{ margin: "2px 0 6px" }}>{s.uitleg}</p>
          <textarea
            id={`tk-voorstel-${s.id}`}
            className="tk-tekstvak"
            value={secties[s.id] || ""}
            onChange={(e) => zet(s.id, e.target.value)}
            placeholder={`Plak hier wat ${voorWie} hierover heeft opgeschreven — of laat leeg`}
          />
        </div>
      ))}

      <div className="tk-knoppen" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="tk-knop tk-knop-klein"
          disabled={bezig || gevuld === 0}
          onClick={bewaren}
        >
          {bezig ? "Bezig..." : directBijProfiel ? "Bewaren bij dit profiel" : `Klaarzetten voor ${voorWie}`}
        </button>
        <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={onSluit}>
          Sluiten
        </button>
        <span className="tk-fijn" style={{ alignSelf: "center" }}>
          {gevuld === 0
            ? "Nog niets ingevuld — de grijze zinnen zijn voorbeelden."
            : `${gevuld} van ${SECTIES.length} ingevuld`}
        </span>
      </div>
    </div>
  );
}
