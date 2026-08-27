// De routes van de samenwerkomgeving onder /app.
//
// Alles wat hier hangt, staat los van de publieke site. Wie niet is ingelogd
// komt op het inlogscherm; wie nog geen team heeft, komt eerst langs het
// welkomscherm.

import { Helmet } from "react-helmet-async";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "../../lib/app/AppContext";
import Inloggen from "./Inloggen";
import Welkom from "./Welkom";
import Start from "./Start";
import Samenwerken from "./Samenwerken";
import MijnProfiel from "./MijnProfiel";
import MijnHandleiding from "./MijnHandleiding";
import MijnTeam from "./MijnTeam";
import MijnGegevens from "./MijnGegevens";
import "../../styles/app.css";

function Laden({ tekst = "Even laden..." }) {
  return (
    <div className="tk-inhoud" style={{ paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>🧭</div>
      <p className="tk-onderkop">{tekst}</p>
    </div>
  );
}

const MENU = [
  { pad: "/app", label: "Start", exact: true },
  { pad: "/app/samenwerken", label: "Samenwerken met..." },
  { pad: "/app/profiel", label: "Mijn profiel" },
  { pad: "/app/handleiding", label: "Mijn handleiding" },
  { pad: "/app/team", label: "Mijn team" },
  { pad: "/app/gegevens", label: "Mijn gegevens" },
];

function Schil({ children }) {
  const { lidmaatschappen, actiefTeam, kiesTeam, logUit } = useApp();

  return (
    <div className="tk-app">
      <header className="tk-balk">
        <a className="tk-merk" href="/app">
          🧭 Mijn <span>Teamkompas</span>
        </a>
        <div className="tk-balk-rechts">
          {lidmaatschappen.length > 1 && (
            <select
              className="tk-teamkiezer"
              aria-label="Kies team"
              value={actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : ""}
              onChange={(e) => kiesTeam(e.target.value)}
            >
              {lidmaatschappen.map((l) => (
                <option key={`${l.orgId}/${l.teamId}`} value={`${l.orgId}/${l.teamId}`}>
                  {l.teamNaam || "Team"}
                </option>
              ))}
            </select>
          )}
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={logUit}>
            Uitloggen
          </button>
        </div>
      </header>

      <nav className="tk-menu" aria-label="Onderdelen">
        {MENU.map((item) => (
          <NavLink
            key={item.pad}
            to={item.pad}
            end={item.exact}
            className={({ isActive }) => (isActive ? "actief" : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  );
}

function Poort() {
  const { authKlaar, gegevensKlaar, gebruiker, lidmaatschappen, isInloglink } = useApp();
  const locatie = useLocation();

  if (!authKlaar) return <div className="tk-app"><Laden /></div>;

  // Een inloglink mag altijd afgehandeld worden, ook als er al iemand is
  // ingelogd; de link kan voor een ander account bedoeld zijn.
  if (!gebruiker || isInloglink()) {
    return (
      <div className="tk-app">
        <Routes>
          <Route path="inloggen" element={<Inloggen />} />
          <Route
            path="*"
            element={<Navigate to="/app/inloggen" replace state={{ vandaan: locatie.pathname }} />}
          />
        </Routes>
      </div>
    );
  }

  if (!gegevensKlaar) return <div className="tk-app"><Laden tekst="Je gegevens ophalen..." /></div>;

  if (lidmaatschappen.length === 0) {
    return (
      <div className="tk-app">
        <Routes>
          <Route path="welkom" element={<Welkom />} />
          <Route path="*" element={<Navigate to="/app/welkom" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <Schil>
      <Routes>
        <Route index element={<Start />} />
        <Route path="samenwerken" element={<Samenwerken />} />
        <Route path="profiel" element={<MijnProfiel />} />
        <Route path="handleiding" element={<MijnHandleiding />} />
        <Route path="team" element={<MijnTeam />} />
        <Route path="gegevens" element={<MijnGegevens />} />
        <Route path="welkom" element={<Welkom />} />
        <Route path="inloggen" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </Schil>
  );
}

export default function AppRoutes() {
  return (
    <AppProvider>
      {/* Een besloten omgeving hoort niet in zoekmachines. */}
      <Helmet>
        <title>Mijn Teamkompas</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Poort />
    </AppProvider>
  );
}
