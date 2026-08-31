// Het startscherm.
//
// Twee vragen moeten hier binnen een seconde beantwoord zijn: waar ben ik, en
// wat kan ik hier doen. Daaronder pas de rest.
//
// Zolang je profiel nog niet af is, is er precies één ding dat logisch is om nu
// te doen, en dat staat groot in beeld. Welke stap dat is, wordt bepaald in
// volgendeStap.js — dezelfde logica die onderaan de andere pagina's meeloopt,
// zodat de app overal hetzelfde zegt. Is je profiel wel af, dan verdwijnt die
// hele blokkade en blijft er één regel over: compleet.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import VolgendeStap from "../../components/app/VolgendeStap";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVolgendeStap } from "../../lib/app/volgendeStap";
import { bepaalVoortgang } from "../../lib/app/voortgang";

// De drie dingen waarvoor je de app opent. Meer keuzes maken het startscherm
// niet rijker, alleen trager.
const ACTIES = [
  {
    naar: "/app/samenwerken",
    titel: "Samenwerken met een collega",
    uitleg: "Kies een collega en een situatie. Je krijgt een gesprekssuggestie en één kleine actie.",
    primair: true,
  },
  {
    naar: "/app/team",
    titel: "Mijn team bekijken",
    uitleg: "Wie doen er mee, en wat hebben zij over zichzelf gedeeld?",
  },
  {
    naar: "/app/ik",
    titel: "Mijn profiel bijwerken",
    uitleg: "Je punten nalopen, je handleiding schrijven of je gegevens beheren.",
  },
];

function Actie({ actie }) {
  return (
    <Link
      to={actie.naar}
      className={actie.primair ? "tk-regel tk-regel-primair" : "tk-regel"}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <strong>{actie.titel}</strong>
        <span aria-hidden="true" style={{ marginLeft: "auto", color: "var(--tk-zacht)" }}>›</span>
      </div>
      <p className="tk-fijn" style={{ margin: "6px 0 0" }}>{actie.uitleg}</p>
    </Link>
  );
}

export default function Start() {
  const { gebruiker, naam, actiefTeam, kenmerken, handleiding, teamOverzicht, uitnodigingscode, vergeetUitnodiging } =
    useApp();

  const voornaam = (naam || "").trim().split(/\s+/)[0];

  const stap = bepaalVolgendeStap({
    kenmerken,
    actiefTeam,
    leden: teamOverzicht.leden,
    gedeeldPerUid: teamOverzicht.gedeeld,
    eigenUid: gebruiker && gebruiker.uid,
    teamcode: teamOverzicht.team && teamOverzicht.team.code,
    extraProfielen: (teamOverzicht.profielleden || []).length,
  });

  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding });

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Hallo {voornaam || "daar"}</h1>
      <p className="tk-onderkop">Waarmee kunnen we je vandaag helpen?</p>

      {actiefTeam && (
        <p className="tk-fijn" style={{ marginTop: -4 }}>
          Huidig team: {actiefTeam.teamNaam || "je team"}
          {actiefTeam.orgNaam ? ` (${actiefTeam.orgNaam})` : ""}
        </p>
      )}

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

      <div className="tk-kaart">
        {ACTIES.map((a) => (
          <Actie key={a.naar} actie={a} />
        ))}
      </div>

      {voortgang.compleet ? (
        <p className="tk-af">
          <span aria-hidden="true">✓</span> Je profiel is compleet en gedeeld met je team.{" "}
          <Link to="/app/ik">Bekijken</Link>
        </p>
      ) : (
        <>
          <VolgendeStap variant="groot" />
          {!teamOverzicht.laden && stap.nummer > 1 && (
            <Voortgang variant="klein" toonOnderdelen={false} />
          )}
        </>
      )}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze zijn
        bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
