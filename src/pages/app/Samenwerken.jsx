// "Samenwerken met..." — de kern van de omgeving.
//
// Kies een teamgenoot, kies wat er speelt, krijg een kort advies. Van de ander
// gebruiken we uitsluitend wat die persoon zelf met dit team heeft gedeeld;
// aan de brondata komen we niet, en dat kan technisch ook niet.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import {
  beoordeelAdviessessie,
  haalGedeeldVanTeam,
  haalTeamleden,
  logAdviessessie,
} from "../../lib/app/opslag";
import { vraagAdvies } from "../../lib/app/advies/adviesService";
import { SITUATIES } from "../../data/app/situaties";
import VolgendeStap from "../../components/app/VolgendeStap";

function initialen(naam) {
  return String(naam || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((d) => d[0])
    .join("")
    .toUpperCase();
}

export default function Samenwerken() {
  const { gebruiker, actiefTeam, kenmerken, teamOverzicht } = useApp();

  const [leden, setLeden] = useState([]);
  const [gedeeld, setGedeeld] = useState({});
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");

  const [gekozenUid, setGekozenUid] = useState(null);
  const [situatieId, setSituatieId] = useState(null);
  const [advies, setAdvies] = useState(null);
  const [sessieId, setSessieId] = useState(null);
  const [beoordeeld, setBeoordeeld] = useState(null);

  useEffect(() => {
    if (!actiefTeam) return;
    let actueel = true;
    setLaden(true);
    Promise.all([
      haalTeamleden(actiefTeam.orgId, actiefTeam.teamId),
      haalGedeeldVanTeam(actiefTeam.orgId, actiefTeam.teamId),
    ])
      .then(([l, g]) => {
        if (!actueel) return;
        setLeden(l);
        setGedeeld(g);
      })
      .catch(() => actueel && setFout("De teamgegevens konden niet worden opgehaald."))
      .finally(() => actueel && setLaden(false));
    return () => {
      actueel = false;
    };
  }, [actiefTeam]);

  // Echte teamgenoten en de profielen die een beheerder heeft toegevoegd staan
  // in één lijst: over allebei valt evengoed advies te vragen. Bij een
  // toegevoegd profiel staat er wel bij door wie het is neergezet.
  const anderen = useMemo(() => {
    const echt = leden
      .filter((l) => l.uid !== (gebruiker && gebruiker.uid))
      .map((l) => ({ ...l, sleutel: l.uid }));

    const toegevoegd = (teamOverzicht.profielleden || []).map((pl) => ({
      uid: pl.id,
      sleutel: pl.id,
      naam: pl.naam,
      doorBeheerder: true,
      toegevoegdDoorNaam: pl.toegevoegdDoorNaam,
      kenmerken: pl.kenmerken || [],
    }));

    return [...echt, ...toegevoegd].sort((a, b) =>
      String(a.naam || "").localeCompare(String(b.naam || ""))
    );
  }, [leden, gebruiker, teamOverzicht.profielleden]);

  const gekozen = anderen.find((l) => l.sleutel === gekozenUid) || null;
  const gekozenGedeeld = gekozen
    ? gekozen.doorBeheerder
      ? { kenmerken: gekozen.kenmerken }
      : gedeeld[gekozen.uid]
    : null;

  const maakAdvies = useCallback(
    async (situatie) => {
      if (!gekozen) return;
      const hunKenmerken = ((gekozenGedeeld && gekozenGedeeld.kenmerken) || []).map((k) => ({
        kenmerkId: k.kenmerkId,
        waarde: k.waarde,
        bron: "user_confirmation",
      }));

      const uitkomst = await vraagAdvies({
        mijnKenmerken: kenmerken,
        hunKenmerken,
        situatieId: situatie,
        naamAnder: gekozen.naam || "je collega",
      });

      setAdvies(uitkomst);
      setBeoordeeld(null);
      try {
        const id = await logAdviessessie({
          uid: gebruiker.uid,
          situatieId: situatie,
          aantalBlokken: uitkomst.blokken.length,
        });
        setSessieId(id);
      } catch {
        setSessieId(null);
      }
    },
    [gekozen, gekozenGedeeld, kenmerken, gebruiker]
  );

  const kiesSituatie = (id) => {
    setSituatieId(id);
    maakAdvies(id);
  };

  const opnieuw = () => {
    setSituatieId(null);
    setAdvies(null);
    setSessieId(null);
    setBeoordeeld(null);
  };

  const beoordeel = async (bruikbaar) => {
    setBeoordeeld(bruikbaar);
    try {
      await beoordeelAdviessessie(sessieId, bruikbaar);
    } catch {
      /* een oordeel is prettig om te weten, maar nooit blokkerend */
    }
  };

  if (!actiefTeam) return <div className="tk-inhoud"><p className="tk-onderkop">Kies eerst een team.</p></div>;
  if (laden) return <div className="tk-inhoud"><p className="tk-onderkop">Even laden...</p></div>;

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Samenwerken met...</h1>
      <p className="tk-onderkop">
        Kies met wie het speelt en wat er aan de hand is. Je krijgt een advies op basis van wat
        jullie allebei hebben gedeeld.
      </p>

      {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}

      {anderen.length === 0 && (
        <div className="tk-kaart">
          <h2>Je bent voorlopig alleen in dit team</h2>
          <p>
            Nodig je collega's uit met de teamcode. Zodra iemand meedoet en iets deelt, kun je hier
            advies vragen.
          </p>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team" style={{ textDecoration: "none" }}>
            Naar de teamcode
          </Link>
        </div>
      )}

      {anderen.length > 0 && (
        <>
          <p className="tk-label">1. Met wie speelt het?</p>
          <div className="tk-lijst" style={{ marginBottom: 22 }}>
            {anderen.map((l) => {
              const punten = l.doorBeheerder
                ? (l.kenmerken || []).length
                : (gedeeld[l.uid] && gedeeld[l.uid].kenmerken.length) || 0;
              return (
                <button
                  key={l.sleutel}
                  type="button"
                  className={`tk-persoon${gekozenUid === l.sleutel ? " gekozen" : ""}`}
                  onClick={() => {
                    setGekozenUid(l.sleutel);
                    opnieuw();
                  }}
                >
                  <span className="tk-bol">{initialen(l.naam)}</span>
                  <span>
                    {l.naam || "Teamgenoot"}
                    <small style={{ display: "block", color: "var(--tk-zacht)", fontSize: 12.5 }}>
                      {punten === 0
                        ? "Heeft nog niets gedeeld"
                        : l.doorBeheerder
                          ? `${punten} punten · toegevoegd door ${l.toegevoegdDoorNaam || "een beheerder"}`
                          : `${punten} punten gedeeld`}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {anderen.length === 0 && <VolgendeStap />}

      {gekozen && !advies && (
        <>
          <p className="tk-label">2. Wat speelt er?</p>
          <div className="tk-keuzes" style={{ marginBottom: 22 }}>
            {SITUATIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`tk-keuze${situatieId === s.id ? " gekozen" : ""}`}
                onClick={() => kiesSituatie(s.id)}
              >
                <span>
                  {s.label}
                  <small>{s.uitleg}</small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {advies && (
        <>
          <div className="tk-advies">
            <div className="tk-stap">{advies.situatie ? advies.situatie.label : "Advies"}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>
              In het gesprek met {advies.naamAnder}
            </h2>
            {advies.situatie && (
              <p style={{ color: "var(--tk-zacht)", marginTop: 0, lineHeight: 1.65 }}>
                {advies.situatie.opening}
              </p>
            )}

            {advies.opmerkingen.map((o) => (
              <div className="tk-melding" key={o} style={{ marginTop: 12 }}>
                {o}
              </div>
            ))}

            {advies.blokken.map((b) => (
              <div className="tk-advies-blok" key={`${b.soort}-${b.kenmerkId}`}>
                <h3>{b.kenmerk}</h3>
                <p>{b.duiding}</p>
                <p>{b.suggestie}</p>
                {b.voorbeeldzin && <p className="tk-citaat">“{b.voorbeeldzin}”</p>}
              </div>
            ))}

            {advies.blokken.length > 0 && (
              <p style={{ marginTop: 16, lineHeight: 1.7 }}>{advies.afsluiter}</p>
            )}

            {gekozen && gekozen.doorBeheerder && (
              <p className="tk-fijn" style={{ marginTop: 16 }}>
                Dit profiel is toegevoegd door {gekozen.toegevoegdDoorNaam || "een beheerder"} op
                basis van een Insights-profiel. {gekozen.naam} heeft het niet zelf ingevuld of
                bevestigd — houd daar rekening mee.
              </p>
            )}

            <p className="tk-fijn" style={{ marginTop: 16 }}>{advies.transparantie}</p>
          </div>

          <div className="tk-kaart">
            <h2>Heb je hier iets aan?</h2>
            {beoordeeld === null ? (
              <div className="tk-knoppen">
                <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => beoordeel(true)}>
                  Ja, hier kan ik mee verder
                </button>
                <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => beoordeel(false)}>
                  Nee, niet echt
                </button>
              </div>
            ) : (
              <p style={{ marginBottom: 0 }}>
                {beoordeeld
                  ? "Fijn. We bewaren alleen dát je het bruikbaar vond, niet waar het over ging."
                  : "Duidelijk. We bewaren alleen dát het niet paste, niet waar het over ging."}
              </p>
            )}
            <div className="tk-knoppen" style={{ marginTop: 14 }}>
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={opnieuw}>
                Andere situatie kiezen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
