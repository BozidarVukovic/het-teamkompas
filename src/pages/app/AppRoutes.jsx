// De routes van de samenwerkomgeving onder /app.
//
// Alles wat hier hangt, staat los van de publieke site. Wie niet is ingelogd
// komt op het inlogscherm; wie nog geen team heeft, komt eerst langs het
// welkomscherm.

import { Helmet } from "react-helmet-async";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { AppProvider, useApp } from "../../lib/app/AppContext";
import Inloggen from "./Inloggen";
import Welkom from "./Welkom";
import Start from "./Start";
import Samenwerken from "./Samenwerken";
import MijnProfiel from "./MijnProfiel";
import MijnHandleiding from "./MijnHandleiding";
import MijnTeam from "./MijnTeam";
import Teambeeld from "./Teambeeld";
import MijnGegevens from "./MijnGegevens";
import Ik from "./Ik";
import Navigatie from "../../components/app/Navigatie";
import { welkombestemming } from "../../lib/app/welkom";
import "../../styles/app.css";

function Laden({ tekst = "Even laden..." }) {
  return (
    <div className="tk-inhoud" style={{ paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: "var(--tk-t-titel)", marginBottom: 10 }}>🧭</div>
      <p className="tk-onderkop">{tekst}</p>
    </div>
  );
}


function Schil({ children }) {
  const { lidmaatschappen, actiefTeam, kiesTeam, logUit } = useApp();

  return (
    <div className="tk-app">
      <header className="tk-balk">
        <a className="tk-merk" href="/app" aria-label="Mijn Teamkompas — naar het startscherm">
          <span aria-hidden="true">🧭</span>
          <span className="tk-merk-woorden" aria-hidden="true">
            Mijn <span className="tk-merk-naam">Teamkompas</span>
          </span>
        </a>
        <div className="tk-balk-rechts">
          {lidmaatschappen.length > 1 && (
            <label className="tk-teamwissel">
              <span>Je werkt in</span>
              <select
                className="tk-teamkiezer"
                value={actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : ""}
                onChange={(e) => kiesTeam(e.target.value)}
              >
                {lidmaatschappen.map((l) => (
                  <option key={`${l.orgId}/${l.teamId}`} value={`${l.orgId}/${l.teamId}`}>
                    {l.teamNaam || "Team"}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={logUit}>
            Uitloggen
          </button>
        </div>
      </header>

      <Navigatie />

      {children}
    </div>
  );
}

// Het welkomscherm hoort niet op te duiken bij wie al een team heeft en er
// niet zelf om vroeg. Zie welkom.js voor de regel.
function WelkomOfStart() {
  const { lidmaatschappen, uitnodigingscode } = useApp();
  const [zoek] = useSearchParams();

  const naar = welkombestemming({
    lidmaatschappen,
    uitnodigingscode,
    extra: zoek.get("extra") === "1",
  });

  return naar ? <Navigate to={naar} replace /> : <Welkom />;
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
        <Route path="teambeeld" element={<Teambeeld />} />
        <Route path="gegevens" element={<MijnGegevens />} />
        <Route path="ik" element={<Ik />} />
        <Route path="welkom" element={<WelkomOfStart />} />
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
