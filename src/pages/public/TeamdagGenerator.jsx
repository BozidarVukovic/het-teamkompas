// Teamdag-generator op /teamdag-generator.
//
// Een vaste beslisboom in acht stappen die uitkomt op een programmaopzet.
// Er wordt geen chatbot, taalmodel of externe AI-dienst gebruikt: het programma
// ontstaat uit de beslisregels in src/lib/teamdag/ en de blokken in
// src/data/teamdag/.
//
// De wizardstaat blijft bewust in React-state en niet in de URL: de
// ScrollManager van de site springt bij iedere URL-wijziging naar boven.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import { VRAGEN, vraagBeantwoord } from "../../data/teamdag/vragen.js";
import { INTRO, PRIVACYTEKST } from "../../data/teamdag/teksten.js";
import { steltProgrammaSamen, controleerAanpassing } from "../../lib/teamdag/programma.js";
import { magProgrammaTonen } from "../../lib/teamdag/veiligheid.js";
import { bewaar, lees, wis } from "../../lib/teamdag/opslag.js";
import { uitQuery, deelbareUrl } from "../../lib/teamdag/deelbaar.js";
import { trackEvent } from "../../lib/analytics.js";
import { EnkeleKeuze, MeervoudigeKeuze, Tekstveld } from "../../components/teamdag/Keuzes.jsx";
import Voortgang from "../../components/teamdag/Voortgang.jsx";
import Veiligheidsroute from "../../components/teamdag/Veiligheidsroute.jsx";
import ProgrammaWeergave from "../../components/teamdag/ProgrammaWeergave.jsx";
import "../../styles/teamdag.css";

const LEEG = {
  rol: "",
  teamgrootte: "",
  teamtype: "",
  bestaansduur: "",
  afhankelijkheid: "",
  aanleidingen: [],
  toelichting: "",
  resultaten: [],
  zichtbaar: "",
  zichtbaarEigen: "",
  veiligheid: {},
  tijd: "",
  pauze: "ja",
  setting: "",
  ruimte: "",
  aanwezigheid: "",
  werkwijzen: [],
  ervaring: "",
  opvolging: "",
};

export default function TeamdagGenerator() {
  const location = useLocation();
  const [fase, setFase] = useState("intro"); // intro | vragen | resultaat
  const [stap, setStap] = useState(0);
  const [antwoorden, setAntwoorden] = useState(LEEG);
  const [tochGekozen, setTochGekozen] = useState(false);
  const [overschrijving, setOverschrijving] = useState(null);
  const [bezwaren, setBezwaren] = useState([]);
  const [melding, setMelding] = useState("");
  const [autoDoor, setAutoDoor] = useState(true);
  const geladen = useRef(false);
  const bovenkant = useRef(null);

  // Bij binnenkomst: eerst een gedeelde link, anders de lokaal bewaarde staat.
  useEffect(() => {
    if (geladen.current) return;
    geladen.current = true;
    const uitLink = uitQuery(location.search);
    if (Object.keys(uitLink).length) {
      setAntwoorden({ ...LEEG, ...uitLink });
      setFase("vragen");
      setStap(VRAGEN.length - 1);
      return;
    }
    const bewaard = lees();
    if (bewaard) setAntwoorden({ ...LEEG, ...bewaard });
  }, [location.search]);

  // Automatisch lokaal bewaren. Een lege staat overschrijft nooit een bewaarde.
  useEffect(() => {
    if (!geladen.current) return;
    bewaar(antwoorden);
  }, [antwoorden]);

  const vraag = VRAGEN[stap] || null;

  const waardeVan = (v) => {
    if (!v) return "";
    return v.groep ? (antwoorden[v.groep] || {})[v.veld] : antwoorden[v.veld];
  };

  const zetAntwoord = (v, waarde) => {
    setAntwoorden((huidig) => {
      if (v.groep) {
        return { ...huidig, [v.groep]: { ...(huidig[v.groep] || {}), [v.veld]: waarde } };
      }
      return { ...huidig, [v.veld]: waarde };
    });
  };

  const wisselAntwoord = (v, id) => {
    setAntwoorden((huidig) => {
      const lijst = huidig[v.veld] || [];
      if (lijst.includes(id)) return { ...huidig, [v.veld]: lijst.filter((x) => x !== id) };
      if (typeof v.max === "number" && lijst.length >= v.max) return huidig;
      return { ...huidig, [v.veld]: [...lijst, id] };
    });
  };

  const programma = useMemo(() => steltProgrammaSamen(antwoorden, overschrijving), [antwoorden, overschrijving]);

  const mag = magProgrammaTonen(programma.oordeel, tochGekozen);

  useEffect(() => {
    if (fase === "resultaat" && programma.oordeel.route === "intake" && !tochGekozen) {
      trackEvent("teamdag_veiligheidsroute_getoond");
    }
  }, [fase, programma.oordeel.route, tochGekozen]);

  // Naar de bovenkant van de vraag, met ruimte voor de vaste kopbalk van de
  // site. Zonder die correctie valt de voortgangsindicator eronder weg.
  const naarBoven = () => {
    if (!bovenkant.current || typeof window === "undefined") return;
    const top = bovenkant.current.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const start = () => {
    trackEvent("teamdag_generator_gestart");
    setFase("vragen");
    setStap(0);
    naarBoven();
  };

  const afronden = () => {
    trackEvent("teamdag_generator_afgerond");
    setOverschrijving(null);
    setBezwaren([]);
    setFase("resultaat");
    naarBoven();
  };

  const volgende = () => {
    if (stap < VRAGEN.length - 1) {
      setStap((s) => s + 1);
      naarBoven();
      return;
    }
    afronden();
  };

  const vorige = () => {
    if (stap === 0) {
      setFase("intro");
      naarBoven();
      return;
    }
    setStap((s) => s - 1);
    naarBoven();
  };

  // Bij één keuze schuift de wizard vanzelf door. Dat scheelt de helft van de
  // klikken; de korte vertraging laat de gekozen optie nog even oplichten,
  // zodat het niet voelt alsof het scherm onder je vandaan springt.
  const doorschuifTimer = useRef(null);
  useEffect(() => () => clearTimeout(doorschuifTimer.current), []);

  const kiesEnkel = (v, waarde) => {
    zetAntwoord(v, waarde);
    if (autoDoor) {
      clearTimeout(doorschuifTimer.current);
      doorschuifTimer.current = setTimeout(() => volgende(), 260);
    }
  };

  const compleet = vraagBeantwoord(vraag, antwoorden);

  // Aanpassen van het programma. Iedere aanpassing wordt getoetst; komt er een
  // bezwaar uit, dan blijft het oude programma staan.
  const pasToe = (nieuweOverschrijving, gebeurtenis) => {
    const kandidaat = steltProgrammaSamen(antwoorden, nieuweOverschrijving);
    const problemen = controleerAanpassing(kandidaat, antwoorden);
    if (problemen.length) {
      setBezwaren(problemen);
      return;
    }
    setBezwaren([]);
    setOverschrijving(nieuweOverschrijving);
    if (gebeurtenis) trackEvent(gebeurtenis);
  };

  const huidigeInhoud = () =>
    programma.onderdelen
      .filter((o) => !o.pauze)
      .map((o) => o.blok.id);

  // Alle huidige duren, inclusief die van de pauze: past de gebruiker één
  // onderdeel aan, dan blijft de rest van het programma staan zoals het stond.
  const huidigeDuren = () => {
    const uit = {};
    programma.onderdelen.forEach((o) => {
      uit[o.blok.id] = o.duur;
    });
    return uit;
  };

  const vervang = (oudId, nieuwId) => {
    const ids = huidigeInhoud().map((id) => (id === oudId ? nieuwId : id));
    const duren = { ...huidigeDuren() };
    delete duren[oudId];
    pasToe({ blokIds: ids, duren }, "teamdag_onderdeel_vervangen");
  };

  const verwijder = (id) => {
    const ids = huidigeInhoud().filter((x) => x !== id);
    const duren = { ...huidigeDuren() };
    delete duren[id];
    pasToe({ blokIds: ids, duren }, "teamdag_onderdeel_verwijderd");
  };

  const wijzigDuur = (id, delta) => {
    const duren = { ...huidigeDuren() };
    duren[id] = (duren[id] || 0) + delta;
    pasToe({ blokIds: huidigeInhoud(), duren }, null);
  };

  const wisAlles = () => {
    wis();
    setAntwoorden(LEEG);
    setOverschrijving(null);
    setTochGekozen(false);
    setFase("intro");
    setMelding("Je gegevens zijn uit deze browser verwijderd.");
    naarBoven();
  };

  const deelUrl = useMemo(() => {
    if (typeof window === "undefined") return deelbareUrl(antwoorden);
    return deelbareUrl(antwoorden, `${window.location.origin}/teamdag-generator`);
  }, [antwoorden]);

  return (
    <div className="td-pagina" ref={bovenkant}>
      <Helmet>
        <title>Teamdag-generator | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Stel in drie minuten een eerste programmaopzet voor je teamdag samen: passende werkvormen, voorbereiding en borging. Zonder AI, op basis van vaste beslisregels."
        />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/teamdag-generator" />
      </Helmet>

      {fase === "intro" ? (
        <>
          <section className="td-intro">
            <div className="td-binnen">
              <h1>{INTRO.titel}</h1>
              <p>{INTRO.inleiding}</p>
              <p className="td-intro-duur">{INTRO.duur}</p>
              <ul className="td-uitleg">
                {INTRO.uitleg.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="td-knoprij">
                <button type="button" className="td-knop td-knop--primair" onClick={start}>
                  {INTRO.knop}
                </button>
              </div>
              {melding ? <p className="td-melding">{melding}</p> : null}
            </div>
          </section>
        </>
      ) : null}

      {fase === "vragen" && vraag ? (
        <section className="td-wizard">
          <div className={`td-binnen ${vraag.breed ? "td-binnen--breed" : "td-binnen--smal"}`}>
            <Voortgang fase={vraag.fase} vraagNummer={stap + 1} totaalVragen={VRAGEN.length} />

            <div className="td-vraag" key={vraag.id}>
              <h2>{vraag.kop}</h2>
              {vraag.uitleg ? <p className="td-vraag-uitleg">{vraag.uitleg}</p> : null}

              {vraag.type === "enkel" ? (
                <EnkeleKeuze
                  naam={vraag.id}
                  opties={vraag.opties}
                  waarde={waardeVan(vraag)}
                  onKies={(waarde) => kiesEnkel(vraag, waarde)}
                  kolommen={vraag.kolommen}
                  compact={vraag.compact}
                />
              ) : null}

              {vraag.type === "meer" ? (
                <MeervoudigeKeuze
                  naam={vraag.id}
                  opties={vraag.opties}
                  waarden={antwoorden[vraag.veld] || []}
                  onWissel={(id) => wisselAntwoord(vraag, id)}
                  max={vraag.max}
                  kolommen={vraag.kolommen || vraag.breed}
                  compact={vraag.compact || vraag.breed}
                />
              ) : null}

              {vraag.type === "tekst" ? (
                <Tekstveld
                  id={`td-${vraag.id}`}
                  waarde={antwoorden[vraag.veld]}
                  onWijzig={(waarde) => zetAntwoord(vraag, waarde)}
                  hint={PRIVACYTEKST.vrijeTekst}
                  plaatshouder={vraag.plaatshouder}
                  maxLengte={vraag.maxLengte}
                />
              ) : null}
            </div>

            <div className="td-navigatie">
              <button type="button" className="td-knop td-knop--secundair" onClick={vorige}>
                Terug
              </button>
              <div className="td-navigatie-rechts">
                {vraag.type === "enkel" ? (
                  <label className="td-autodoor">
                    <input
                      type="checkbox"
                      checked={autoDoor}
                      onChange={() => setAutoDoor((v) => !v)}
                    />
                    Automatisch doorgaan
                  </label>
                ) : null}
                <button type="button" className="td-knop td-knop--primair" onClick={volgende} disabled={!compleet}>
                  {stap === VRAGEN.length - 1
                    ? "Stel mijn teamdag samen"
                    : vraag.optioneel && !waardeVan(vraag)
                      ? "Overslaan"
                      : "Volgende"}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {fase === "resultaat" ? (
        <>
          {programma.oordeel.route === "intake" ? (
            <div className="td-binnen">
              <Veiligheidsroute
                oordeel={programma.oordeel}
                tochGekozen={tochGekozen}
                onToch={() => setTochGekozen(true)}
              />
            </div>
          ) : null}

          {mag ? (
            <ProgrammaWeergave
              programma={programma}
              antwoorden={antwoorden}
              bezwaren={bezwaren}
              onVervang={vervang}
              onDuur={wijzigDuur}
              onVerwijder={verwijder}
              onOpnieuw={() => {
                setOverschrijving(null);
                setBezwaren([]);
              }}
              onAndereKeuzes={() => {
                setFase("vragen");
                setStap(0);
                naarBoven();
              }}
              deelUrl={deelUrl}
              onWis={wisAlles}
              melding={melding}
            />
          ) : (
            <div className="td-binnen" style={{ paddingBottom: 60 }}>
              <div className="td-knoprij">
                <button
                  type="button"
                  className="td-knop td-knop--secundair"
                  onClick={() => {
                    setFase("vragen");
                    setStap(VRAGEN.findIndex((v) => v.fase === "veiligheid"));
                    naarBoven();
                  }}
                >
                  Antwoorden aanpassen
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
