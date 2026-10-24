// Wat dit team te zien krijgt.
//
// Een onderdeel kan af zijn en toch niet gewenst. Dan hoort het niet half
// verstopt te worden met een voorwaarde hier en een voorwaarde daar, maar op
// één plek uit te staan -- en op diezelfde plek weer aan te gaan wanneer het
// team er wel aan toe is.
//
// Alleen een beheerder van dit team komt hier. Dat staat ook in de
// databaseregels; dit scherm verbergen zou anders betekenen dat het alleen
// onzichtbaar is en niet onmogelijk.

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { magBeheren } from "../../lib/app/teamrollen";
import useActie from "../../components/app/useActie";
import Melding from "../../components/app/Melding";
import { ONDERDELEN, gevolgLabel, isAan, standLabel } from "../../lib/app/onderdelen";
import "../../styles/beheer.css";

/**
 * De schakelaar.
 *
 * Een knop met role="switch", dus bedienbaar met spatie en enter en te volgen
 * met een schermlezer. De stand staat er ook in woorden naast: wie het
 * kleurverschil of het schuifje niet ziet, leest "Staat uit".
 */
function Schakelaar({ aan, bezig, label, opWissel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aan}
      aria-label={label}
      className="tk-schakelaar"
      disabled={bezig}
      onClick={() => opWissel(!aan)}
    >
      <span className="tk-schakelaar-spoor" aria-hidden="true">
        <span className="tk-schakelaar-knop" />
      </span>
      <span className="tk-schakelaar-tekst">{standLabel(aan)}</span>
    </button>
  );
}

function Onderdeelkaart({ onderdeel, aan, bezig, opWissel }) {
  return (
    <article className="tk-kaart bh-onderdeel">
      <div className="bh-rij">
        <div className="bh-tekst">
          <strong className="bh-naam" id={`bh-${onderdeel.id}`}>{onderdeel.naam}</strong>
          <span className="bh-kort">{onderdeel.kort}</span>
        </div>
        <Schakelaar
          aan={aan}
          bezig={bezig}
          label={`${onderdeel.naam} aan of uit`}
          opWissel={opWissel}
        />
      </div>

      {/* Wat er gebeurt als je hem omzet, vóór de klik. Aanzetten maakt iets
          zichtbaar voor het hele team tegelijk; dat wil je weten voordat je
          het doet, niet erna. */}
      <p className="bh-gevolg">{gevolgLabel(onderdeel.id, !aan)}</p>

      <details className="tk-verdieping">
        <summary>Wat zit erin?</summary>
        <p style={{ lineHeight: 1.7 }}>{onderdeel.uitleg}</p>
        <p className="tk-fijn" style={{ marginTop: 10 }}>
          Te vinden bij <strong>{onderdeel.staatBij}</strong>.
        </p>
      </details>
    </article>
  );
}

export default function Beheer() {
  const { actiefTeam, gebruiker, teamOverzicht, onderdeelInstellingen, zetOnderdeelAan } = useApp();
  const [bezigMet, setBezigMet] = useState("");
  const { melding, voerUit, wisMelding } = useActie();

  const mijnUid = gebruiker && gebruiker.uid;
  const ikBenBeheerder = useMemo(
    () => magBeheren(teamOverzicht.leden, mijnUid),
    [teamOverzicht.leden, mijnUid]
  );

  useEffect(() => {
    wisMelding();
  }, [actiefTeam, wisMelding]);

  if (!actiefTeam || !gebruiker) {
    return <div className="tk-inhoud"><p>Selecteer eerst een team.</p></div>;
  }

  // Zolang de leden nog laden weten we niet wie je bent; dan niets beweren.
  if (teamOverzicht.laden) {
    return <div className="tk-inhoud"><p role="status">Even laden…</p></div>;
  }

  if (!ikBenBeheerder) return <Navigate to="/app/team" replace />;

  function wissel(id, naar) {
    setBezigMet(id);
    voerUit(
      naar ? "het onderdeel aanzetten" : "het onderdeel uitzetten",
      () => zetOnderdeelAan(id, naar),
      naar
        ? "Het staat aan. Je team ziet het vanaf nu."
        : "Het staat uit. Wat er is ingevuld blijft bewaard."
    ).finally(() => setBezigMet(""));
  }

  return (
    <div className="tk-inhoud">
      <nav className="bh-kruimel" aria-label="Kruimelpad">
        <Link to="/app/team"><span aria-hidden="true">←</span> Mijn team</Link>
      </nav>

      <h1 className="tk-kop">Onderdelen voor dit team</h1>
      <p className="tk-onderkop">
        Wat {actiefTeam.teamNaam || "dit team"} in de app te zien krijgt.
      </p>

      <Melding melding={melding} onSluiten={wisMelding} />

      <p className="bh-uitleg">
        Een onderdeel dat uitstaat is niet zichtbaar voor je team en ook niet te
        openen via een bewaarde link. Uitzetten gooit niets weg: wat er is ingevuld
        blijft bewaard en komt terug zoals het was.
      </p>

      {ONDERDELEN.map((o) => (
        <Onderdeelkaart
          key={o.id}
          onderdeel={o}
          aan={isAan(onderdeelInstellingen, o.id)}
          bezig={bezigMet === o.id}
          opWissel={(naar) => wissel(o.id, naar)}
        />
      ))}

      <p className="tk-voetnoot">
        Alleen beheerders van dit team zien deze pagina en kunnen hier schakelen.
        Dat ligt vast in de databaseregels, niet alleen in dit scherm.
      </p>
    </div>
  );
}
