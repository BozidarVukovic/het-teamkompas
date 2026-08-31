// Alles over jezelf op één plek.
//
// Mijn profiel, mijn handleiding en mijn gegevens stonden los in het menu.
// Voor wie de app niet kent zijn dat drie namen voor hetzelfde onderwerp: ik.
// Hier staan ze onder elkaar, met per onderdeel in één zin waar je staat, zodat
// je niet drie schermen hoeft te openen om te zien wat er nog ligt.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVoortgang } from "../../lib/app/voortgang";

function Regel({ naar, titel, stand, uitleg, klaar }) {
  return (
    <Link
      to={naar}
      className="tk-regel"
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <strong>{titel}</strong>
        <span
          className="tk-fijn"
          style={{ marginLeft: "auto", whiteSpace: "nowrap", color: klaar ? "var(--tk-teal)" : undefined }}
        >
          {klaar ? `✓ ${stand}` : stand}
        </span>
        <span aria-hidden="true" style={{ color: "var(--tk-zacht)" }}>›</span>
      </div>
      <p className="tk-fijn" style={{ margin: "6px 0 0" }}>{uitleg}</p>
    </Link>
  );
}

export default function Ik() {
  const { naam, gebruiker, kenmerken, actiefTeam, handleiding } = useApp();
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding });
  const handleidingKlaar = voortgang.handleidingSecties >= voortgang.handleidingVan;

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Ik</h1>
      <p className="tk-onderkop">
        {naam ? `${naam} — ` : ""}
        {gebruiker && gebruiker.email}
      </p>

      <Voortgang variant="groot" />

      <div className="tk-kaart">
        <h2 style={{ marginTop: 0 }}>Onderdelen</h2>
        <Regel
          naar="/app/profiel"
          titel="Mijn profiel"
          stand={`${voortgang.gedeeld} van de ${voortgang.van} gedeeld`}
          klaar={voortgang.compleet}
          uitleg="De twaalf punten over hoe jij werkt: invullen, nalopen en delen met je team."
        />
        <Regel
          naar="/app/handleiding"
          titel="Mijn handleiding"
          stand={`${voortgang.handleidingSecties} van de ${voortgang.handleidingVan} geschreven`}
          klaar={handleidingKlaar}
          uitleg="In je eigen woorden: wat je nodig hebt en hoe je het liefst wordt benaderd. Optioneel."
        />
        <Regel
          naar="/app/gegevens"
          titel="Mijn gegevens"
          stand="Beheren"
          uitleg="Je naam, je teams, en wat er van je is opgeslagen. Hier kun je ook alles verwijderen."
        />
      </div>

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Je teamgenoten zien alleen wat je zelf hebt gedeeld. Wat je invult maar niet deelt, blijft van jou.
      </p>
    </div>
  );
}
