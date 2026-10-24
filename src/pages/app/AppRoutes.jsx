// De routes van de samenwerkomgeving onder /app.
//
// Alles wat hier hangt, staat los van de publieke site. Wie niet is ingelogd
// komt op het inlogscherm; wie nog geen team heeft, komt eerst langs het
// welkomscherm.

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { AppProvider, useApp } from "../../lib/app/AppContext";
import Inloggen from "./Inloggen";
import Welkom from "./Welkom";
import Start from "./Start";
import Samenwerken from "./Samenwerken";
import HulpZoeken from "./HulpZoeken";
import MijnProfiel from "./MijnProfiel";
import MijnHandleiding from "./MijnHandleiding";
import MijnTeam from "./MijnTeam";
import MijnDoelen from "./MijnDoelen";
import Beheer from "./Beheer";
import { isAan } from "../../lib/app/onderdelen";
import Teamomgeving from "./Teamomgeving";
import Teambeeld from "./Teambeeld";
import MijnGegevens from "./MijnGegevens";
import Ik from "./Ik";
import Navigatie from "../../components/app/Navigatie";
import Accountmenu from "../../components/app/Accountmenu";
import Balktitel from "../../components/app/Balktitel";
import KompasDot from "../../components/shared/KompasDot";
import { welkombestemming } from "../../lib/app/welkom";
import { haalStand, pasToe, volgSysteem } from "../../lib/app/thema";
import "../../styles/app.css";

function Laden({ tekst = "Even laden..." }) {
  return (
    <div className="tk-inhoud" style={{ paddingTop: 80, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <KompasDot size={30} />
      </div>
      <p className="tk-onderkop">{tekst}</p>
    </div>
  );
}


// Een onderdeel dat uitstaat is niet alleen onzichtbaar in het menu: het adres
// doet ook niets. Zonder dit opent een bewaarde link het scherm alsnog, en dan
// is "uitgezet" alleen een belofte aan wie niet doorklikt.
//
// Tijdens het laden wordt er niets geconcludeerd. Meteen wegsturen zou
// betekenen dat een beheerder die het net aanzette er toch uit vliegt.
function AlsOnderdeelAan({ id, children }) {
  const { onderdelenKlaar, onderdeelInstellingen } = useApp();
  if (!onderdelenKlaar) return <Laden />;
  return isAan(onderdeelInstellingen, id) ? children : <Navigate to="/app/ik" replace />;
}

function Schil({ children }) {
  return (
    <div className="tk-app">
      <header className="tk-balk">
        <a className="tk-merk" href="/app" aria-label="Mijn Teamkompas — naar het startscherm">
          <KompasDot size={22} />
          <span className="tk-merk-woorden" aria-hidden="true">Mijn Teamkompas</span>
        </a>
        <Balktitel />
        <div className="tk-balk-rechts">
          <Accountmenu />
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
        {/* De tweede ingang van dezelfde tool: beginnen bij een taak in
            plaats van bij een collega. Geen eigen menu-item -- in de balk
            staat "Samenwerken", en dit zijn twee manieren om daaraan te
            beginnen. Zie IngangKeuze.jsx. */}
        <Route path="hulp" element={<HulpZoeken />} />
        <Route path="profiel" element={<MijnProfiel />} />
        <Route path="handleiding" element={<MijnHandleiding />} />
        <Route path="doelen" element={<AlsOnderdeelAan id="kwartaaldoelen"><MijnDoelen /></AlsOnderdeelAan>} />
        <Route path="beheer" element={<Beheer />} />
        <Route path="team" element={<MijnTeam />} />
        <Route path="teamomgeving" element={<Teamomgeving />} />
        <Route path="teamomgeving/:onderdeelId" element={<Teamomgeving />} />
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

/**
 * Houdt het thema gelijk met het apparaat.
 *
 * Het script in index.html zet het thema al voordat de pagina tekent; dit
 * houdt het bij als de telefoon onderweg naar donker gaat. Wie zelf licht of
 * donker koos merkt er niets van -- bepaalThema negeert het apparaat dan.
 */
function useThema() {
  useEffect(() => {
    pasToe(haalStand());
    return volgSysteem(() => pasToe(haalStand()));
  }, []);
}

export default function AppRoutes() {
  useThema();

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
