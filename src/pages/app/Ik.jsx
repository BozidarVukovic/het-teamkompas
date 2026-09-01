// Alles over jezelf op één plek.
//
// Mijn profiel, mijn handleiding en mijn gegevens stonden los in het menu. Voor
// wie de app niet kent zijn dat drie namen voor hetzelfde onderwerp: ik.
//
// Bovenaan staat wie je bent. Daaronder, alleen zolang er iets te doen is, hoe
// ver je bent — is alles af, dan verdwijnt die hele machinerie en blijft er één
// regel over. Onderaan de drie onderdelen als lijst, met per onderdeel in één
// oogopslag waar je staat.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVoortgang } from "../../lib/app/voortgang";
import { initialen } from "../../lib/app/naam";

function Regel({ naar, titel, uitleg, stand = null, klaar = false }) {
  return (
    <Link to={naar} className="tk-optie">
      <span className="tk-optie-tekst">
        <strong>{titel}</strong>
        <small>{uitleg}</small>
      </span>
      {stand && (
        <span className={`tk-optie-stand${klaar ? " klaar" : ""}`}>
          {klaar && <span aria-hidden="true">✓ </span>}
          {stand}
        </span>
      )}
      <span className="tk-optie-pijl" aria-hidden="true">›</span>
    </Link>
  );
}

export default function Ik() {
  const { naam, gebruiker, kenmerken, actiefTeam, handleiding } = useApp();
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding });
  const handleidingKlaar = voortgang.handleidingSecties >= voortgang.handleidingVan;

  return (
    <div className="tk-inhoud">
      <header className="tk-ikkop">
        <span className="tk-bol tk-bol-groot">{initialen(naam)}</span>
        <div style={{ minWidth: 0 }}>
          <h1 className="tk-kop" style={{ marginBottom: 2 }}>{naam || "Ik"}</h1>
          <p className="tk-onderkop" style={{ margin: 0 }}>{gebruiker && gebruiker.email}</p>
        </div>
      </header>

      {/* De uitsplitsing in ingevuld, nagelopen en gedeeld helpt zolang er iets
          te doen is. Staat alles op honderd procent, dan is het een uitleg van
          werk dat al gedaan is. */}
      {voortgang.compleet ? (
        <p className="tk-af">
          <span aria-hidden="true">✓</span> Je profiel is compleet en gedeeld met je team.
        </p>
      ) : (
        <Voortgang variant="groot" />
      )}

      <section className="tk-groep">
        <h2 className="tk-groep-kop">Over mij</h2>
        <div className="tk-groep-lijst">
          <Regel
            naar="/app/profiel"
            titel="Mijn profiel"
            uitleg="Twaalf punten over hoe jij werkt, gedeeld met je team."
            stand={`${voortgang.gedeeld} van ${voortgang.van}`}
            klaar={voortgang.compleet}
          />
          <Regel
            naar="/app/handleiding"
            titel="Mijn handleiding"
            uitleg="In je eigen woorden. Optioneel, maar het maakt het advies persoonlijker."
            stand={`${voortgang.handleidingSecties} van ${voortgang.handleidingVan}`}
            klaar={handleidingKlaar}
          />
          <Regel
            naar="/app/gegevens"
            titel="Mijn gegevens"
            uitleg="Je naam, je teams, en alles wat er van je is opgeslagen."
          />
        </div>
      </section>

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Je teamgenoten zien alleen wat je zelf hebt gedeeld. Wat je invult maar niet deelt, blijft
        van jou.
      </p>
    </div>
  );
}
