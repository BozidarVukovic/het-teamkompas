// Het eerste scherm na inloggen: je naam, en daarna een team.
//
// Een gebruiker hoort altijd bij minstens één team. Je kunt met een teamcode
// meedoen aan een bestaand team, of zelf een organisatie met een eerste team
// aanmaken. De structuur is vanaf het begin meervoudig: meerdere organisaties,
// meerdere teams, en iemand kan bij meer dan één team horen.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";

export default function Welkom() {
  const { naam, zetNaam, maakTeam, doeMee, gebruiker, logUit, uitnodigingscode, vergeetUitnodiging, lidmaatschappen } =
    useApp();

  // Ditzelfde scherm doet twee dingen: het is de laatste stap van het aanmelden
  // én de plek om later bij een extra team aan te sluiten. Wie al ergens bij
  // hoort, hoort geen "stap 2 van 2" te zien — die is allang klaar.
  const heeftAlEenTeam = (lidmaatschappen || []).length > 0;
  const navigeer = useNavigate();

  const [mijnNaam, setMijnNaam] = useState(naam || "");
  const [keuze, setKeuze] = useState(uitnodigingscode ? "code" : null);
  const [code, setCode] = useState(uitnodigingscode || "");
  const [organisatieNaam, setOrganisatieNaam] = useState("");
  const [teamNaam, setTeamNaam] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  const naamKlaar = mijnNaam.trim().length >= 2;

  const bewaarNaam = async (e) => {
    e.preventDefault();
    setBezig(true);
    try {
      await zetNaam(mijnNaam.trim());
    } finally {
      setBezig(false);
    }
  };

  const meedoen = async (e) => {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      const uitkomst = await doeMee({ code: code.trim().toUpperCase(), mijnNaam: mijnNaam.trim() });
      if (!uitkomst) setFout("Deze teamcode kennen we niet. Controleer of hij precies zo is overgenomen.");
      else {
        vergeetUitnodiging();
        navigeer("/app", { replace: true });
      }
    } catch {
      setFout("Meedoen lukte niet. Controleer de code en probeer het opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  const aanmaken = async (e) => {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      await maakTeam({
        organisatieNaam: organisatieNaam.trim(),
        teamNaam: teamNaam.trim(),
        mijnNaam: mijnNaam.trim(),
      });
      navigeer("/app", { replace: true });
    } catch {
      setFout("Aanmaken lukte niet. Probeer het zo nog eens.");
    } finally {
      setBezig(false);
    }
  };

  if (!naam) {
    return (
      <div className="tk-inhoud tk-smal" style={{ paddingTop: 56 }}>
        <div className="tk-stap">Stap 1 van 2</div>
        <h1 className="tk-kop">Welkom</h1>
        <p className="tk-onderkop">
          Je bent ingelogd als {gebruiker && gebruiker.email}. Hoe mogen je teamgenoten je noemen?
        </p>
        <form className="tk-kaart" onSubmit={bewaarNaam}>
          <label className="tk-label" htmlFor="tk-naam">Je naam</label>
          <input
            id="tk-naam"
            className="tk-invoer"
            value={mijnNaam}
            onChange={(e) => setMijnNaam(e.target.value)}
            placeholder="Voornaam"
            required
          />
          <p className="tk-fijn" style={{ marginTop: 10 }}>
            Alleen je naam is zichtbaar voor je teamgenoten. Alles wat je verder invult, blijft
            privé tot jij zelf besluit het te delen.
          </p>
          <div className="tk-knoppen" style={{ marginTop: 14 }}>
            <button className="tk-knop" type="submit" disabled={!naamKlaar || bezig}>
              Verder
            </button>
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={logUit}>
              Uitloggen
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="tk-inhoud tk-smal" style={{ paddingTop: 56 }}>
      <div className="tk-stap">{heeftAlEenTeam ? "Nog een team" : "Stap 2 van 2"}</div>
      <h1 className="tk-kop">
        {heeftAlEenTeam ? "Bij een ander team aansluiten" : "Bij welk team hoor je?"}
      </h1>
      <p className="tk-onderkop">
        {heeftAlEenTeam
          ? "Je hoort al bij een team. Hier sluit je aan bij nóg een team, bijvoorbeeld bij een andere klant of afdeling. Wil je juist iemand uitnodigen voor je huidige team? Dat doe je bij Mijn team."
          : "Teams staan technisch los van elkaar. Wat je met het ene team deelt, is voor een ander team niet zichtbaar."}
      </p>

      {heeftAlEenTeam && (
        <div className="tk-knoppen" style={{ marginBottom: 20 }}>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team" style={{ textDecoration: "none" }}>
            Terug naar mijn team
          </Link>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app" style={{ textDecoration: "none" }}>
            Naar start
          </Link>
        </div>
      )}

      {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}

      {uitnodigingscode && (
        <div className="tk-melding tk-melding-goed">
          Je bent uitgenodigd voor een team. De code staat al ingevuld; je hoeft alleen op Meedoen te
          klikken.
        </div>
      )}

      <div className="tk-keuzes" style={{ marginBottom: 18 }}>
        <button
          type="button"
          className={`tk-keuze${keuze === "code" ? " gekozen" : ""}`}
          onClick={() => setKeuze("code")}
        >
          <span>
            Ik heb een teamcode
            <small>Iemand uit je team heeft je een code van acht tekens gestuurd.</small>
          </span>
        </button>
        <button
          type="button"
          className={`tk-keuze${keuze === "nieuw" ? " gekozen" : ""}`}
          onClick={() => setKeuze("nieuw")}
        >
          <span>
            Ik maak een nieuw team aan
            <small>Je wordt beheerder en krijgt een code om anderen uit te nodigen.</small>
          </span>
        </button>
      </div>

      {keuze === "code" && (
        <form className="tk-kaart" onSubmit={meedoen}>
          <label className="tk-label" htmlFor="tk-code">Teamcode</label>
          <input
            id="tk-code"
            className="tk-invoer"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            autoCapitalize="characters"
            required
          />
          <div className="tk-knoppen" style={{ marginTop: 14 }}>
            <button className="tk-knop" type="submit" disabled={bezig || code.trim().length < 4}>
              {bezig ? "Bezig..." : "Meedoen"}
            </button>
          </div>
        </form>
      )}

      {keuze === "nieuw" && (
        <form className="tk-kaart" onSubmit={aanmaken}>
          <label className="tk-label" htmlFor="tk-org">Organisatie</label>
          <input
            id="tk-org"
            className="tk-invoer"
            value={organisatieNaam}
            onChange={(e) => setOrganisatieNaam(e.target.value)}
            placeholder="Naam van je organisatie"
            required
          />
          <label className="tk-label" htmlFor="tk-team" style={{ marginTop: 14 }}>Team</label>
          <input
            id="tk-team"
            className="tk-invoer"
            value={teamNaam}
            onChange={(e) => setTeamNaam(e.target.value)}
            placeholder="Naam van je team"
            required
          />
          <div className="tk-knoppen" style={{ marginTop: 14 }}>
            <button
              className="tk-knop"
              type="submit"
              disabled={bezig || !organisatieNaam.trim() || !teamNaam.trim()}
            >
              {bezig ? "Bezig..." : "Team aanmaken"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
