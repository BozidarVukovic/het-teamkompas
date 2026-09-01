// "Samenwerken met..." — de kern van de omgeving.
//
// Kies een teamgenoot, kies wat er speelt, krijg een kort advies. Van de ander
// gebruiken we uitsluitend wat die persoon zelf met dit team heeft gedeeld;
// aan de brondata komen we niet, en dat kan technisch ook niet.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import {
  beoordeelAdviessessie,
  haalGedeeldVanTeam,
  haalTeamleden,
  logAdviessessie,
} from "../../lib/app/opslag";
import { vraagAdvies } from "../../lib/app/advies/adviesService";
import { situatiesPerGroep } from "../../data/app/situaties";
import { collegasVan, collegaInEenZin } from "../../lib/app/collegas";
import { initialen } from "../../lib/app/naam";
import VolgendeStap from "../../components/app/VolgendeStap";

export default function Samenwerken() {
  const { gebruiker, actiefTeam, kenmerken, teamOverzicht } = useApp();
  const [zoek] = useSearchParams();

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
  // in één lijst: over allebei valt evengoed advies te vragen. Diezelfde lijst
  // staat op het startscherm; zie collegas.js.
  const anderen = useMemo(
    () =>
      collegasVan({
        leden,
        gedeeld,
        profielleden: teamOverzicht.profielleden,
        eigenUid: gebruiker && gebruiker.uid,
      }),
    [leden, gedeeld, gebruiker, teamOverzicht.profielleden]
  );

  // Vanaf de teampagina kom je hier binnen met een collega al gekozen
  // (/app/samenwerken?met=...). Dat gebeurt één keer: daarna bepaalt je eigen
  // keuze wat er staat, ook als het adres nog steeds die naam draagt.
  const gevolgd = useRef(false);
  const gevraagd = zoek.get("met");
  useEffect(() => {
    if (gevolgd.current || !gevraagd || anderen.length === 0) return;
    gevolgd.current = true;
    if (anderen.some((l) => l.sleutel === gevraagd)) setGekozenUid(gevraagd);
  }, [gevraagd, anderen]);

  const gekozen = anderen.find((l) => l.sleutel === gekozenUid) || null;

  const maakAdvies = useCallback(
    async (situatie) => {
      if (!gekozen) return;
      const hunKenmerken = (gekozen.kenmerken || []).map((k) => ({
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
    [gekozen, kenmerken, gebruiker]
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
      {/* De uitleg gaat over de keuze die je nog moet maken. Heb je iemand
          gekozen, dan legt hij iets uit wat je al gedaan hebt. */}
      {!gekozen && (
        <p className="tk-onderkop">
          Kies met wie het speelt en wat er aan de hand is. Je krijgt een advies op basis van wat
          jullie allebei hebben gedeeld.
        </p>
      )}

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

      {anderen.length > 0 && !gekozen && (
        <>
          <p className="tk-label">Met wie speelt het?</p>
          <div className="tk-lijst" style={{ marginBottom: 22 }}>
            {anderen.map((l) => (
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
                    {collegaInEenZin(l)}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {anderen.length === 0 && <VolgendeStap />}

      {gekozen && (
        <div className="tk-gekozen">
          <span className="tk-bol">{initialen(gekozen.naam)}</span>
          <span className="tk-gekozen-tekst">
            <strong>{gekozen.naam || "Teamgenoot"}</strong>
            <small>{advies && advies.situatie ? advies.situatie.label : "Wat speelt er?"}</small>
          </span>
          <button
            type="button"
            className="tk-knop tk-knop-rand tk-knop-klein"
            onClick={() => {
              setGekozenUid(null);
              opnieuw();
            }}
          >
            Wijzigen
          </button>
        </div>
      )}

      {gekozen && !advies && (
        <>
          {situatiesPerGroep().map((groep) => (
            <section key={groep.id} className="tk-groep">
              <h2 className="tk-groep-kop">{groep.label}</h2>
              <div className="tk-groep-lijst">
                {groep.situaties.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="tk-optie"
                    onClick={() => kiesSituatie(s.id)}
                  >
                    <span>{s.label}</span>
                    <span className="tk-optie-pijl" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {advies && (
        <>
          <div className="tk-advies">
            <div className="tk-stap">{advies.situatie ? advies.situatie.label : "Advies"}</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>
              Jullie samenwerking
            </h2>
            {advies.samenvatting.map((zin) => (
              <p key={zin} style={{ color: "var(--tk-zacht)", margin: "0 0 8px", lineHeight: 1.7 }}>
                {zin}
              </p>
            ))}

            {advies.opmerkingen.map((o) => (
              <div className="tk-melding" key={o} style={{ marginTop: 12 }}>
                {o}
              </div>
            ))}

            {advies.helpt.length > 0 && (
              <div className="tk-advies-blok">
                <h3>Wat waarschijnlijk helpt</h3>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                  {advies.helpt.map((h) => (
                    <li key={h} style={{ marginBottom: 6 }}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {advies.letOp.length > 0 && (
              <div className="tk-advies-blok">
                <h3>Waar je op kunt letten</h3>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                  {advies.letOp.map((l) => (
                    <li key={l} style={{ marginBottom: 6 }}>{l}</li>
                  ))}
                </ul>
              </div>
            )}

            {advies.vraag && (
              <div className="tk-advies-blok">
                <h3>Probeer deze vraag</h3>
                <p className="tk-citaat" style={{ margin: 0 }}>“{advies.vraag}”</p>
              </div>
            )}

            {advies.actie && (
              <div className="tk-advies-blok">
                <h3>Kleine actie</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{advies.actie}</p>
              </div>
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
