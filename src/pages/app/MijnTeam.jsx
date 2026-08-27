// Mijn team: wie er in het team zitten, wat zij hebben gedeeld, en de code om
// anderen uit te nodigen.
//
// Wat je hier ziet is uitsluitend wat teamgenoten zelf hebben gedeeld. Ook een
// beheerder ziet niets meer dan dit; er bestaat geen weg naar de profielen van
// anderen — niet in de app en niet in de database.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { haalGedeeldVanTeam, haalTeam, haalTeamleden } from "../../lib/app/opslag";

export default function MijnTeam() {
  const { gebruiker, actiefTeam, lidmaatschappen, verlaatTeam } = useApp();

  const [team, setTeam] = useState(null);
  const [leden, setLeden] = useState([]);
  const [gedeeld, setGedeeld] = useState({});
  const [laden, setLaden] = useState(true);
  const [open, setOpen] = useState(null);
  const [bevestigVerlaten, setBevestigVerlaten] = useState(false);

  useEffect(() => {
    if (!actiefTeam) return;
    let actueel = true;
    setLaden(true);
    Promise.all([
      haalTeam(actiefTeam.orgId, actiefTeam.teamId),
      haalTeamleden(actiefTeam.orgId, actiefTeam.teamId),
      haalGedeeldVanTeam(actiefTeam.orgId, actiefTeam.teamId),
    ])
      .then(([t, l, g]) => {
        if (!actueel) return;
        setTeam(t);
        setLeden(l);
        setGedeeld(g);
      })
      .finally(() => actueel && setLaden(false));
    return () => {
      actueel = false;
    };
  }, [actiefTeam]);

  const ikBenBeheerder = useMemo(() => {
    const ik = leden.find((l) => l.uid === (gebruiker && gebruiker.uid));
    return ik && ik.rol === "beheerder";
  }, [leden, gebruiker]);

  if (!actiefTeam) return <div className="tk-inhoud"><p className="tk-onderkop">Je hebt nog geen team.</p></div>;
  if (laden) return <div className="tk-inhoud"><p className="tk-onderkop">Even laden...</p></div>;

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">{actiefTeam.teamNaam || "Mijn team"}</h1>
      <p className="tk-onderkop">
        {actiefTeam.orgNaam ? `${actiefTeam.orgNaam} · ` : ""}
        {leden.length} {leden.length === 1 ? "lid" : "leden"}
      </p>

      {team && team.code && (
        <div className="tk-kaart">
          <h2>Iemand uitnodigen</h2>
          <p>
            Geef deze code door aan wie je erbij wilt hebben. Wie de code heeft, kan meedoen aan dit
            team.
          </p>
          <div className="tk-code">{team.code}</div>
        </div>
      )}

      <div className="tk-kaart">
        <h2>Teamgenoten</h2>
        <p>
          Je ziet hier alleen wat iemand zelf met dit team heeft gedeeld. Wat niet gedeeld is,
          bestaat voor jou niet.
        </p>
        {leden.map((l) => {
          const eigen = l.uid === (gebruiker && gebruiker.uid);
          const g = gedeeld[l.uid];
          const uitgeklapt = open === l.uid;
          return (
            <div key={l.uid} style={{ borderTop: "1px solid var(--tk-lijn)", padding: "14px 0" }}>
              <div className="tk-rij" style={{ border: 0, padding: 0 }}>
                <div>
                  <strong>{l.naam || "Teamgenoot"}{eigen ? " (jij)" : ""}</strong>
                  <p className="tk-fijn" style={{ margin: "3px 0 0" }}>
                    {l.rol === "beheerder" ? "Beheerder · " : ""}
                    {g
                      ? `${g.kenmerken.length} punten en ${g.handleiding.length} stukjes handleiding gedeeld`
                      : "Heeft nog niets gedeeld"}
                  </p>
                </div>
                {g && (
                  <button
                    type="button"
                    className="tk-knop tk-knop-rand tk-knop-klein"
                    onClick={() => setOpen(uitgeklapt ? null : l.uid)}
                  >
                    {uitgeklapt ? "Inklappen" : "Bekijken"}
                  </button>
                )}
              </div>

              {uitgeklapt && g && (
                <div style={{ marginTop: 12 }}>
                  {g.kenmerken.map((k) => (
                    <p key={k.kenmerkId} className="tk-citaat" style={{ marginBottom: 10 }}>
                      {k.zin}
                    </p>
                  ))}
                  {g.handleiding.map((s) => (
                    <div key={s.sectieId} style={{ marginBottom: 12 }}>
                      <div className="tk-label" style={{ marginBottom: 4 }}>{s.titel}</div>
                      <p style={{ margin: 0, lineHeight: 1.65 }}>{s.tekst}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tk-kaart">
        <h2>Mijn plek in dit team</h2>
        <p>
          {ikBenBeheerder
            ? "Je bent beheerder van dit team. Dat gaat over de teamgegevens; het geeft je geen inzage in de profielen van anderen."
            : "Je bent lid van dit team."}
        </p>
        <p className="tk-fijn">
          <Link to="/app/welkom" style={{ color: "var(--tk-teal)" }}>
            Bij nog een team aansluiten
          </Link>
        </p>
        {lidmaatschappen.length > 1 && (
          <p className="tk-fijn">
            Je hoort bij {lidmaatschappen.length} teams. Wissel bovenin om een ander team te zien.
          </p>
        )}
        {bevestigVerlaten ? (
          <div className="tk-knoppen">
            <button
              type="button"
              className="tk-knop tk-knop-klein tk-knop-gevaar"
              onClick={() => verlaatTeam({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId })}
            >
              Ja, verlaat dit team
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => setBevestigVerlaten(false)}
            >
              Toch niet
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="tk-knop tk-knop-klein tk-knop-gevaar"
            onClick={() => setBevestigVerlaten(true)}
          >
            Dit team verlaten
          </button>
        )}
        <p className="tk-fijn" style={{ marginTop: 10, marginBottom: 0 }}>
          Bij het verlaten van een team wordt alles wat je met dit team deelde direct verwijderd.
        </p>
      </div>
    </div>
  );
}
