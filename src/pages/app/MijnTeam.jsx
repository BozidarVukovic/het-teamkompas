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
import { bewaarVoorstel, haalVoorstellen } from "../../lib/app/voorstellen";
import InsightsUpload from "../../components/app/InsightsUpload";
import VolgendeStap from "../../components/app/VolgendeStap";

export default function MijnTeam() {
  const { gebruiker, naam, actiefTeam, lidmaatschappen, verlaatTeam } = useApp();

  const [team, setTeam] = useState(null);
  const [leden, setLeden] = useState([]);
  const [gedeeld, setGedeeld] = useState({});
  const [laden, setLaden] = useState(true);
  const [open, setOpen] = useState(null);
  const [bevestigVerlaten, setBevestigVerlaten] = useState(false);
  const [voorstellen, setVoorstellen] = useState({});
  const [uploadVoor, setUploadVoor] = useState(null);
  const [gekopieerd, setGekopieerd] = useState(null);

  // De link draagt de code mee, zodat de ontvanger niets hoeft over te typen.
  const uitnodigingslink = (code) => `https://www.mijnteamkompas.nl/app?code=${code}`;

  const uitnodigingstekst = (code, teamNaam) =>
    [
      `Ik gebruik Mijn Teamkompas om onze samenwerking wat makkelijker te maken. Doe je mee met ${teamNaam}?`,
      "",
      `1. Open ${uitnodigingslink(code)}`,
      "2. Vul je e-mailadres in — je ontvangt een e-mail met een inloglink",
      "   (die mail belandt de eerste keer nogal eens bij ongewenste berichten; kijk daar even)",
      `3. De teamcode ${code} staat dan al klaar`,
      "",
      "Je vult zelf in hoe jij samenwerkt, en bepaalt zelf wat je met het team deelt.",
    ].join("\n");

  const kopieer = async (tekst, welke) => {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(welke);
      setTimeout(() => setGekopieerd(null), 2200);
    } catch {
      /* kopiëren mag niet altijd; alles staat zichtbaar op het scherm */
    }
  };

  useEffect(() => {
    if (!actiefTeam) return;
    let actueel = true;
    setLaden(true);
    Promise.all([
      haalTeam(actiefTeam.orgId, actiefTeam.teamId),
      haalTeamleden(actiefTeam.orgId, actiefTeam.teamId),
      haalGedeeldVanTeam(actiefTeam.orgId, actiefTeam.teamId),
      // Alleen een beheerder mag deze lijst opvragen; voor een lid mislukt hij
      // en dat is precies de bedoeling.
      haalVoorstellen({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId }).catch(() => ({})),
    ])
      .then(([t, l, g, v]) => {
        if (!actueel) return;
        setTeam(t);
        setLeden(l);
        setGedeeld(g);
        setVoorstellen(v);
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
            Stuur de uitnodiging door via mail of een berichtje. Wie hem opent, hoeft niets over te
            typen: de code staat er dan al in.
          </p>

          <div className="tk-code" style={{ marginBottom: 14 }}>{team.code}</div>

          <div className="tk-knoppen" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="tk-knop tk-knop-klein"
              onClick={() => kopieer(uitnodigingstekst(team.code, actiefTeam.teamNaam || "ons team"), "uitnodiging")}
            >
              {gekopieerd === "uitnodiging" ? "Gekopieerd" : "Kopieer de uitnodiging"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => kopieer(uitnodigingslink(team.code), "link")}
            >
              {gekopieerd === "link" ? "Gekopieerd" : "Alleen de link"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => kopieer(team.code, "code")}
            >
              {gekopieerd === "code" ? "Gekopieerd" : "Alleen de code"}
            </button>
          </div>

          <div className="tk-label" style={{ marginBottom: 8 }}>Wat de ander doet</div>
          <ol className="tk-fijn" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>
              Gaat naar{" "}
              <span style={{ color: "var(--tk-teal)" }}>mijnteamkompas.nl/app</span> — via jouw link
              staat de code er meteen in
            </li>
            <li>
              Vult een e-mailadres in en klikt op de inloglink in de mail — die belandt de eerste
              keer vaak bij ongewenste berichten
            </li>
            <li>Vult een naam in en doet mee met de code</li>
          </ol>
          <p className="tk-fijn" style={{ marginTop: 12, marginBottom: 0 }}>
            Daarna vult diegene zijn eigen profiel in en bepaalt zelf wat er gedeeld wordt. Jij ziet
            alleen wat hij of zij deelt.
          </p>
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
                <div className="tk-knoppen">
                  {g && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => setOpen(uitgeklapt ? null : l.uid)}
                    >
                      {uitgeklapt ? "Inklappen" : "Bekijken"}
                    </button>
                  )}
                  {ikBenBeheerder && !eigen && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => setUploadVoor(uploadVoor === l.uid ? null : l.uid)}
                    >
                      {uploadVoor === l.uid ? "Sluiten" : "Insights-profiel klaarzetten"}
                    </button>
                  )}
                </div>
              </div>

              {ikBenBeheerder && !eigen && voorstellen[l.uid] && (
                <p className="tk-fijn" style={{ marginTop: 8 }}>
                  Er staat een voorstel klaar dat {l.naam || "deze persoon"} nog moet overnemen.
                </p>
              )}

              {uploadVoor === l.uid && (
                <div style={{ marginTop: 12 }}>
                  <InsightsUpload
                    voorWie={l.naam || "deze persoon"}
                    knopLabel="Als voorstel klaarzetten"
                    onBevestig={async (gelezen) => {
                      await bewaarVoorstel({
                        orgId: actiefTeam.orgId,
                        teamId: actiefTeam.teamId,
                        uid: l.uid,
                        vanUid: gebruiker.uid,
                        vanNaam: naam,
                        voorstel: gelezen,
                      });
                      setVoorstellen((v) => ({ ...v, [l.uid]: { uid: l.uid } }));
                      setUploadVoor(null);
                    }}
                  />
                </div>
              )}

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
            Zelf bij een ander team aansluiten
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

      <VolgendeStap verbergAls="uitnodigen" />
      <div style={{ height: 30 }} />
    </div>
  );
}
