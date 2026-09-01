// Wat er met de samenwerkomgeving gebeurt — voor de makers, niet voor een
// teambeheerder.
//
// Hier staat welke situaties mensen kiezen, hoe vaak, en of het advies raak
// was. Bewust nergens wie: van een adviessessie weten we alleen dát er advies
// is gevraagd, bij welke situatie, of het bruikbaar was en wat er miste. Zou
// een leidinggevende kunnen zien wie welk advies opvroeg, dan vraagt niemand
// nog advies over wat er echt speelt — en dan meten we niets meer.

import { useEffect, useMemo, useState } from "react";
import { haalAdviessessies } from "../../lib/app/opslag";
import { vatGebruikSamen } from "../../lib/app/gebruik";
import { situatie } from "../../data/app/situaties";
import { ADM } from "../../styles/tokens";

const kaart = { background: ADM.navy, padding: 18, borderRadius: 12, border: `1px solid ${ADM.border}` };
const cel = { padding: "11px 10px", borderBottom: `1px solid ${ADM.border}`, textAlign: "left", fontSize: 13 };

function Getal({ label, waarde, onder }) {
  return (
    <div style={kaart}>
      <small style={{ color: ADM.muted }}>{label}</small>
      <div style={{ fontSize: 26, fontWeight: 800, color: ADM.white, lineHeight: 1.2 }}>{waarde}</div>
      {onder && <small style={{ color: ADM.muted }}>{onder}</small>}
    </div>
  );
}

/** Een balkje dat laat zien hoe een aantal zich verhoudt tot het hoogste aantal. */
function Balk({ deel, kleur = ADM.teal }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.max(2, deel)}%`, background: kleur, borderRadius: 999 }} />
    </div>
  );
}

export default function PageAppgebruik() {
  const [sessies, setSessies] = useState(null);
  const [fout, setFout] = useState("");

  useEffect(() => {
    haalAdviessessies()
      .then(setSessies)
      .catch(() => setFout("De gebruiksgegevens konden niet worden geladen."));
  }, []);

  const samenvatting = useMemo(
    () => vatGebruikSamen(sessies || [], (id) => (situatie(id) || {}).label || id),
    [sessies]
  );

  if (fout) return <p style={{ color: ADM.red }}>{fout}</p>;
  if (!sessies) return <p style={{ color: ADM.muted }}>Laden...</p>;

  const maxSituatie = samenvatting.situaties[0] ? samenvatting.situaties[0].aantal : 0;
  const maxMaand = samenvatting.maanden.reduce((m, r) => Math.max(m, r.aantal), 0);

  return (
    <div>
      <p style={{ color: ADM.muted, fontSize: 13, maxWidth: 720, marginTop: 0 }}>
        Alles op deze pagina is opgeteld over alle teams. Er staat nergens wie welk advies opvroeg,
        en dat is met opzet: die weg bestaat niet in de app en niet in de database. Een
        teambeheerder kan hier niet bij.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <Getal label="Adviezen opgevraagd" waarde={samenvatting.totaal} />
        <Getal label="Verschillende mensen" waarde={samenvatting.mensen} />
        <Getal
          label="Bruikbaar gevonden"
          waarde={samenvatting.percentage === null ? "–" : `${samenvatting.percentage}%`}
          onder={`${samenvatting.beoordeeld} van de ${samenvatting.totaal} beoordeeld`}
        />
        <Getal label="Toelichtingen" waarde={samenvatting.toelichtingen.length} onder="Bij een advies dat niet paste" />
      </div>

      {samenvatting.totaal === 0 && (
        <p style={{ color: ADM.muted, marginTop: 24 }}>
          Er is nog geen advies opgevraagd. Zodra dat gebeurt, staat het hier.
        </p>
      )}

      {samenvatting.maanden.length > 0 && (
        <>
          <h3 style={{ color: ADM.white, marginTop: 34, marginBottom: 12 }}>Verloop per maand</h3>
          <div style={{ ...kaart, display: "grid", gap: 12 }}>
            {samenvatting.maanden.map((m) => (
              <div key={m.maand}>
                <div style={{ display: "flex", fontSize: 13, marginBottom: 5 }}>
                  <span>{m.label}</span>
                  <strong style={{ marginLeft: "auto", color: ADM.white }}>{m.aantal}</strong>
                </div>
                <Balk deel={maxMaand ? (m.aantal / maxMaand) * 100 : 0} />
              </div>
            ))}
          </div>
        </>
      )}

      {samenvatting.situaties.length > 0 && (
        <>
          <h3 style={{ color: ADM.white, marginTop: 34, marginBottom: 6 }}>Waar mensen advies over vragen</h3>
          <p style={{ color: ADM.muted, fontSize: 13, marginTop: 0 }}>
            Een laag percentage bij een situatie die vaak gekozen wordt, is het interessantst: daar
            valt de meeste winst te halen.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Situatie", "Gekozen", "", "Bruikbaar", "Beoordeeld"].map((h, i) => (
                    <th key={i} style={{ ...cel, color: ADM.muted, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {samenvatting.situaties.map((r) => (
                  <tr key={r.situatieId}>
                    <td style={cel}>{r.label}</td>
                    <td style={{ ...cel, width: 60 }}><strong style={{ color: ADM.white }}>{r.aantal}</strong></td>
                    <td style={{ ...cel, width: 160 }}>
                      <Balk deel={maxSituatie ? (r.aantal / maxSituatie) * 100 : 0} />
                    </td>
                    <td style={{ ...cel, width: 90 }}>
                      {r.percentage === null ? (
                        <span style={{ color: ADM.muted }}>–</span>
                      ) : (
                        <strong style={{ color: r.percentage >= 60 ? ADM.green : ADM.orange }}>
                          {r.percentage}%
                        </strong>
                      )}
                    </td>
                    <td style={{ ...cel, width: 90, color: ADM.muted }}>{r.beoordeeld}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {samenvatting.toelichtingen.length > 0 && (
        <>
          <h3 style={{ color: ADM.white, marginTop: 34, marginBottom: 6 }}>Wat er miste</h3>
          <p style={{ color: ADM.muted, fontSize: 13, marginTop: 0 }}>
            In de woorden van degene die het advies kreeg, bij een advies dat niet paste.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {samenvatting.toelichtingen.map((t, i) => (
              <div key={i} style={kaart}>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{t.tekst}</p>
                <small style={{ color: ADM.muted }}>
                  {t.situatie}
                  {t.op ? ` · ${t.op.toLocaleDateString("nl-NL")}` : ""}
                </small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
