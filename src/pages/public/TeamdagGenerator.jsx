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

import {
  STAPPEN,
  ROLLEN,
  TEAMGROOTTES,
  TEAMTYPES,
  BESTAANSDUUR,
  AFHANKELIJKHEID,
  AANLEIDINGEN,
  RESULTATEN,
  MAX_AANLEIDINGEN,
  MAX_RESULTATEN,
  ZICHTBAAR_VOORBEELDEN,
  VEILIGHEIDSVRAGEN,
  VEILIGHEID_OPTIES,
  TIJDSOPTIES,
  PAUZEKEUZE,
  SETTINGS,
  RUIMTEOPTIES,
  AANWEZIGHEID,
  WERKWIJZEN,
  ERVARING,
  OPVOLGING,
} from "../../data/teamdag/vragen.js";
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
      setStap(STAPPEN.length - 1);
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

  const zet = (veld, waarde) => setAntwoorden((v) => ({ ...v, [veld]: waarde }));

  const wissel = (veld, id, max) =>
    setAntwoorden((v) => {
      const huidig = v[veld] || [];
      if (huidig.includes(id)) return { ...v, [veld]: huidig.filter((x) => x !== id) };
      if (typeof max === "number" && huidig.length >= max) return v;
      return { ...v, [veld]: [...huidig, id] };
    });

  const zetVeiligheid = (vraagId, waarde) =>
    setAntwoorden((v) => ({ ...v, veiligheid: { ...(v.veiligheid || {}), [vraagId]: waarde } }));

  const programma = useMemo(() => steltProgrammaSamen(antwoorden, overschrijving), [antwoorden, overschrijving]);

  const mag = magProgrammaTonen(programma.oordeel, tochGekozen);

  useEffect(() => {
    if (fase === "resultaat" && programma.oordeel.route === "intake" && !tochGekozen) {
      trackEvent("teamdag_veiligheidsroute_getoond");
    }
  }, [fase, programma.oordeel.route, tochGekozen]);

  const naarBoven = () => {
    if (bovenkant.current) bovenkant.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const start = () => {
    trackEvent("teamdag_generator_gestart");
    setFase("vragen");
    setStap(0);
    naarBoven();
  };

  const volgende = () => {
    if (stap < STAPPEN.length - 1) {
      setStap((s) => s + 1);
      naarBoven();
      return;
    }
    trackEvent("teamdag_generator_afgerond");
    setOverschrijving(null);
    setBezwaren([]);
    setFase("resultaat");
    naarBoven();
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

  const huidigeStap = STAPPEN[stap];

  const compleet = (() => {
    switch (huidigeStap && huidigeStap.id) {
      case "rol":
        return Boolean(antwoorden.rol);
      case "team":
        return Boolean(antwoorden.teamgrootte && antwoorden.teamtype && antwoorden.bestaansduur && antwoorden.afhankelijkheid);
      case "aanleiding":
        return (antwoorden.aanleidingen || []).length > 0;
      case "resultaat":
        return (antwoorden.resultaten || []).length > 0;
      case "veiligheid":
        return VEILIGHEIDSVRAGEN.every((v) => Boolean((antwoorden.veiligheid || {})[v.id]));
      case "tijd":
        return Boolean(antwoorden.tijd && antwoorden.setting && antwoorden.ruimte && antwoorden.aanwezigheid);
      case "werkwijze":
        return (antwoorden.werkwijzen || []).length > 0 && Boolean(antwoorden.ervaring);
      case "borging":
        return Boolean(antwoorden.opvolging);
      default:
        return false;
    }
  })();

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

      {fase === "vragen" && huidigeStap ? (
        <section className="td-wizard">
          <div className="td-binnen">
            <Voortgang nummer={huidigeStap.nummer} totaal={STAPPEN.length} titel={huidigeStap.kort} />

            <div className="td-vraag">
              <h2>{huidigeStap.titel}</h2>

              {huidigeStap.id === "rol" ? (
                <>
                  <p className="td-vraag-uitleg">
                    We gebruiken je rol om de aandachtspunten bij het programma aan te passen.
                  </p>
                  <EnkeleKeuze naam="rol" opties={ROLLEN} waarde={antwoorden.rol} onKies={(v) => zet("rol", v)} />
                </>
              ) : null}

              {huidigeStap.id === "team" ? (
                <>
                  <EnkeleKeuze kop="Hoeveel deelnemers?" naam="teamgrootte" opties={TEAMGROOTTES} waarde={antwoorden.teamgrootte} onKies={(v) => zet("teamgrootte", v)} />
                  <EnkeleKeuze kop="Wat voor team is het?" naam="teamtype" opties={TEAMTYPES} waarde={antwoorden.teamtype} onKies={(v) => zet("teamtype", v)} />
                  <EnkeleKeuze kop="Hoe lang bestaat het team?" naam="bestaansduur" opties={BESTAANSDUUR} waarde={antwoorden.bestaansduur} onKies={(v) => zet("bestaansduur", v)} />
                  <EnkeleKeuze
                    kop="Hoe afhankelijk zijn teamleden van elkaar?"
                    naam="afhankelijkheid"
                    opties={AFHANKELIJKHEID}
                    waarde={antwoorden.afhankelijkheid}
                    onKies={(v) => zet("afhankelijkheid", v)}
                  />
                </>
              ) : null}

              {huidigeStap.id === "aanleiding" ? (
                <>
                  <MeervoudigeKeuze
                    naam="aanleidingen"
                    opties={AANLEIDINGEN}
                    waarden={antwoorden.aanleidingen}
                    onWissel={(id) => wissel("aanleidingen", id, MAX_AANLEIDINGEN)}
                    max={MAX_AANLEIDINGEN}
                    uitleg="Kies er maximaal drie. De eerste keuze weegt het zwaarst."
                  />
                  <Tekstveld
                    id="td-toelichting"
                    kop="Korte toelichting (optioneel)"
                    waarde={antwoorden.toelichting}
                    onWijzig={(v) => zet("toelichting", v)}
                    hint={PRIVACYTEKST.vrijeTekst}
                    plaatshouder="Bijvoorbeeld: sinds de reorganisatie zijn de overleggen korter en stiller geworden."
                  />
                  <p className="td-max">
                    Deze tekst wordt niet gebruikt om het programma te bepalen. Hij komt alleen terug in je eigen
                    overzicht.
                  </p>
                </>
              ) : null}

              {huidigeStap.id === "resultaat" ? (
                <>
                  <MeervoudigeKeuze
                    naam="resultaten"
                    opties={RESULTATEN}
                    waarden={antwoorden.resultaten}
                    onWissel={(id) => wissel("resultaten", id, MAX_RESULTATEN)}
                    max={MAX_RESULTATEN}
                    uitleg="Kies er maximaal twee. Het eerste doel bepaalt de opbouw van het programma."
                  />
                  <EnkeleKeuze
                    kop="Wat zou twee weken na de teamdag zichtbaar anders moeten zijn?"
                    naam="zichtbaar"
                    opties={ZICHTBAAR_VOORBEELDEN.map((z) => ({ id: z, label: z }))}
                    waarde={antwoorden.zichtbaar}
                    onKies={(v) => zet("zichtbaar", v)}
                  />
                  <Tekstveld
                    id="td-zichtbaar-eigen"
                    kop="Of formuleer het in je eigen woorden (optioneel)"
                    waarde={antwoorden.zichtbaarEigen}
                    onWijzig={(v) => zet("zichtbaarEigen", v)}
                    hint={PRIVACYTEKST.vrijeTekst}
                    maxLengte={240}
                  />
                </>
              ) : null}

              {huidigeStap.id === "veiligheid" ? (
                <>
                  <p className="td-vraag-uitleg">
                    Deze vragen bepalen welke werkvormen passen. We stellen niets vast over jouw team; we kijken
                    alleen of een gezamenlijke dag nu een verstandige eerste stap is.
                  </p>
                  {VEILIGHEIDSVRAGEN.map((v) => (
                    <EnkeleKeuze
                      key={v.id}
                      kop={v.vraag}
                      naam={`veiligheid-${v.id}`}
                      opties={VEILIGHEID_OPTIES}
                      waarde={(antwoorden.veiligheid || {})[v.id]}
                      onKies={(waarde) => zetVeiligheid(v.id, waarde)}
                    />
                  ))}
                </>
              ) : null}

              {huidigeStap.id === "tijd" ? (
                <>
                  <EnkeleKeuze naam="tijd" kop="Beschikbare tijd" opties={TIJDSOPTIES} waarde={antwoorden.tijd} onKies={(v) => zet("tijd", v)} />
                  <EnkeleKeuze naam="pauze" kop="Is een pauze nodig?" opties={PAUZEKEUZE} waarde={antwoorden.pauze} onKies={(v) => zet("pauze", v)} />
                  <EnkeleKeuze naam="setting" kop="Waar vindt de bijeenkomst plaats?" opties={SETTINGS} waarde={antwoorden.setting} onKies={(v) => zet("setting", v)} />
                  <EnkeleKeuze naam="ruimte" kop="Is er een geschikte ruimte?" opties={RUIMTEOPTIES} waarde={antwoorden.ruimte} onKies={(v) => zet("ruimte", v)} />
                  <EnkeleKeuze
                    naam="aanwezigheid"
                    kop="Moet je rekening houden met wisselende aanwezigheid?"
                    opties={AANWEZIGHEID}
                    waarde={antwoorden.aanwezigheid}
                    onKies={(v) => zet("aanwezigheid", v)}
                  />
                </>
              ) : null}

              {huidigeStap.id === "werkwijze" ? (
                <>
                  <MeervoudigeKeuze
                    naam="werkwijzen"
                    opties={WERKWIJZEN}
                    waarden={antwoorden.werkwijzen}
                    onWissel={(id) => wissel("werkwijzen", id)}
                    uitleg="Meerdere keuzes zijn mogelijk."
                  />
                  <EnkeleKeuze
                    naam="ervaring"
                    kop="Hoeveel ervaring heeft het team met teamdagen?"
                    opties={ERVARING}
                    waarde={antwoorden.ervaring}
                    onKies={(v) => zet("ervaring", v)}
                  />
                </>
              ) : null}

              {huidigeStap.id === "borging" ? (
                <EnkeleKeuze naam="opvolging" opties={OPVOLGING} waarde={antwoorden.opvolging} onKies={(v) => zet("opvolging", v)} />
              ) : null}
            </div>

            <div className="td-navigatie">
              <button type="button" className="td-knop td-knop--secundair" onClick={vorige}>
                Terug
              </button>
              <button type="button" className="td-knop td-knop--primair" onClick={volgende} disabled={!compleet}>
                {stap === STAPPEN.length - 1 ? "Stel mijn teamdag samen" : "Volgende"}
              </button>
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
                    setStap(4);
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
