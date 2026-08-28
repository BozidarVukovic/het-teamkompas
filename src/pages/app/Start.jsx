// Het startscherm.
//
// Er is op elk moment precies één ding dat logisch is om nu te doen, en dat
// staat groot in beeld. Welke stap dat is, wordt bepaald in volgendeStap.js —
// dezelfde logica die onderaan de andere pagina's meeloopt, zodat de app overal
// hetzelfde zegt.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import VolgendeStap from "../../components/app/VolgendeStap";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVolgendeStap } from "../../lib/app/volgendeStap";

export default function Start() {
  const { gebruiker, naam, actiefTeam, kenmerken, handleiding, teamOverzicht, uitnodigingscode, vergeetUitnodiging } =
    useApp();


  const stap = bepaalVolgendeStap({
    kenmerken,
    actiefTeam,
    leden: teamOverzicht.leden,
    gedeeldPerUid: teamOverzicht.gedeeld,
    eigenUid: gebruiker && gebruiker.uid,
    teamcode: teamOverzicht.team && teamOverzicht.team.code,
  });

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

      {uitnodigingscode && (
        <div className="tk-kaart" style={{ borderColor: "rgba(0,168,150,0.45)" }}>
          <h2>Je hebt een uitnodiging</h2>
          <p>
            Er staat een uitnodiging voor je klaar met de code{" "}
            <strong style={{ color: "var(--tk-teal)" }}>{uitnodigingscode}</strong>. Je kunt bij meer
            dan één team horen; teams zien niets van elkaar.
          </p>
          <div className="tk-knoppen">
            <Link className="tk-knop tk-knop-klein" to="/app/welkom" style={{ textDecoration: "none" }}>
              Meedoen met dit team
            </Link>
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={vergeetUitnodiging}>
              Negeren
            </button>
          </div>
        </div>
      )}

      <VolgendeStap variant="groot" />

      {!teamOverzicht.laden && stap.nummer > 1 && <Voortgang variant="groot" />}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze zijn
        bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
