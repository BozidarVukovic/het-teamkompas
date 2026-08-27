// Het startscherm. Eén ding staat voorop: binnen een minuut bij een bruikbaar
// advies zijn. Al het andere is aanvullend.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { KENMERKEN } from "../../data/app/kenmerken";
import { SECTIES } from "../../data/app/handleiding";

export default function Start() {
  const { naam, actiefTeam, kenmerken, handleiding, profiel } = useApp();

  const ingevuld = kenmerken.filter((k) => k.waarde && k.bevestigd !== "nee").length;
  const gedeeld = actiefTeam
    ? kenmerken.filter((k) =>
        (k.gedeeldMet || []).includes(`${actiefTeam.orgId}/${actiefTeam.teamId}`)
      ).length
    : 0;
  const sectiesIngevuld = SECTIES.filter(
    (s) => handleiding[s.id] && handleiding[s.id].tekst
  ).length;

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Hallo {naam || "daar"}</h1>
      <p className="tk-onderkop">
        {actiefTeam
          ? `Je werkt nu in ${actiefTeam.teamNaam || "je team"}${
              actiefTeam.orgNaam ? ` van ${actiefTeam.orgNaam}` : ""
            }.`
          : "Je hebt nog geen team gekozen."}
      </p>

      <div className="tk-advies" style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Loop je ergens tegenaan?</h2>
        <p style={{ color: "var(--tk-zacht)", lineHeight: 1.65, marginTop: 0 }}>
          Kies met wie het speelt en wat er aan de hand is. Je krijgt een kort advies dat je
          meteen kunt gebruiken in het gesprek.
        </p>
        <Link className="tk-knop" to="/app/samenwerken" style={{ textDecoration: "none", display: "inline-block" }}>
          Samenwerken met...
        </Link>
      </div>

      <div className="tk-kaart">
        <h2>Hoe compleet is je profiel?</h2>
        <div className="tk-rij">
          <div>
            <strong>{ingevuld} van {KENMERKEN.length} kenmerken ingevuld</strong>
            <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
              Hoe meer je invult, hoe gerichter het advies dat anderen over de samenwerking met
              jou krijgen.
            </p>
          </div>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel" style={{ textDecoration: "none" }}>
            {profiel && profiel.insights ? "Bijwerken" : "Invullen"}
          </Link>
        </div>
        <div className="tk-rij">
          <div>
            <strong>{gedeeld} kenmerken gedeeld met dit team</strong>
            <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
              Alleen wat je zelf aanvinkt is voor je teamgenoten zichtbaar. Intrekken kan altijd.
            </p>
          </div>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel" style={{ textDecoration: "none" }}>
            Beheren
          </Link>
        </div>
        <div className="tk-rij">
          <div>
            <strong>{sectiesIngevuld} van {SECTIES.length} stukjes handleiding geschreven</strong>
            <p className="tk-fijn" style={{ margin: "4px 0 0" }}>
              Je hand-in-handleiding is optioneel. Zonder werkt de app gewoon.
            </p>
          </div>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/handleiding" style={{ textDecoration: "none" }}>
            Schrijven
          </Link>
        </div>
      </div>

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze
        zijn bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
