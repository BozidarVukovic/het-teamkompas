import { useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import KompasDot from "../../components/shared/KompasDot";
import { PUB } from "../../styles/tokens";
import app from "../../lib/firebase";
import { getFunctions } from "firebase/functions";

const functions = getFunctions(app, "us-central1");

const cards = [
  ["1", "Voorbereiden", "Alle deelnemers zien wat er vooraf nodig is: planning, context en praktische afspraken."],
  ["2", "Invullen", "Via de gedeelde scanlink vult iedere deelnemer de vragenlijst zelfstandig en veilig in."],
  ["3", "Terugkoppelen", "Na analyse bespreken we patronen, opvallende verschillen en concrete vervolgstappen."],
];

function PortalLogin({ tokenInput, setTokenInput, onOpen, loading, error }) {
  return (
    <aside style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 28, padding: 28, boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }}>
      <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Inloggen klantportaal</h2>
      <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginTop: 0 }}>
        Gebruik de persoonlijke portaal-link of plak de toegangscode die je hebt ontvangen.
      </p>
      <input
        value={tokenInput}
        onChange={(event) => setTokenInput(event.target.value)}
        placeholder="Toegangscode"
        autoComplete="off"
        style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.1)", color: PUB.wit, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
      />
      <button type="button" onClick={onOpen} disabled={loading} style={{ width: "100%", background: PUB.oranje, color: PUB.donker, padding: "14px 18px", borderRadius: 999, border: 0, fontWeight: 900, cursor: loading ? "wait" : "pointer" }}>
        {loading ? "Controleren..." : "Open mijn klantportaal"}
      </button>
      {error && <div style={{ color: "#ffb4a8", marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>{error}</div>}
    </aside>
  );
}

export default function Klantenportaal() {
  const { portalToken } = useParams();
  const [tokenInput, setTokenInput] = useState(portalToken || "");
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(Boolean(portalToken));
  const [error, setError] = useState("");
  const [actieveToken, setActieveToken] = useState("");
  const [rapportLaden, setRapportLaden] = useState(null);

  const openPortal = async (token = tokenInput) => {
    const cleanToken = String(token || "").trim();
    if (!cleanToken) {
      setError("Vul je persoonlijke toegangscode in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const getCustomerPortal = httpsCallable(functions, "getCustomerPortal");
      const result = await getCustomerPortal({ token: cleanToken });
      setPortal(result.data);
      setActieveToken(cleanToken);
    } catch (err) {
      console.error("Klantportaal laden mislukt:", err);
      setPortal(null);
      setError("Deze link is ongeldig of verlopen. Vraag je begeleider om een nieuwe klantportaal-link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (portalToken) openPortal(portalToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalToken]);

  const trajecten = useMemo(() => portal?.trajecten || [], [portal]);
  const materialen = useMemo(() => portal?.materialen || [], [portal]);
  const rapporten = useMemo(() => portal?.rapporten || [], [portal]);

  const bekijkRapport = async (rapportId) => {
    if (!actieveToken) return;
    setRapportLaden(rapportId);
    try {
      const getCustomerPortal = httpsCallable(functions, "getCustomerPortal");
      const result = await getCustomerPortal({ token: actieveToken, rapportId });
      const blob = new Blob([result.data?.rapportHtml || ""], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Rapportage openen mislukt:", err);
    } finally {
      setRapportLaden(null);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: PUB.licht, color: PUB.donker }}>
      <section style={{ padding: "128px 24px 72px", background: PUB.donker, color: PUB.wit }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 36, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, color: PUB.teal, fontWeight: 800, fontSize: 13, marginBottom: 22 }}>
              <KompasDot size={18} /> Klantportaal
            </div>
            <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)", lineHeight: 1.02, margin: "0 0 22px", letterSpacing: "-0.04em" }}>
              {portal ? `Welkom, ${portal.klant.naam}` : "Alles voor jullie Teamkompas-traject op één veilige plek."}
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 660, margin: "0 0 30px" }}>
              {portal?.welkom || "Log in met je persoonlijke link voor trajectinformatie, scanlinks en aanvullende materialen. Iedere klantomgeving is afgeschermd met een unieke toegangscode."}
            </p>
          </div>
          {!portal ? <PortalLogin tokenInput={tokenInput} setTokenInput={setTokenInput} onOpen={() => openPortal()} loading={loading} error={error} /> : (
            <aside style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 28, padding: 28 }}>
              <h2 style={{ fontSize: 24, margin: "0 0 18px" }}>Jullie omgeving</h2>
              <div style={{ display: "grid", gap: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
                <div><strong style={{ color: PUB.teal }}>Contactpersoon:</strong> {portal.klant.contact || "—"}</div>
                <div><strong style={{ color: PUB.teal }}>Trajecten:</strong> {trajecten.length}</div>
                <div><strong style={{ color: PUB.teal }}>Materialen:</strong> {materialen.length}</div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {portal ? (
        <section style={{ padding: "64px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", margin: 0 }}>Beschikbaar voor jullie</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {trajecten.map((traject) => (
                <article key={traject.id} style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 24, padding: 24 }}>
                  <h3 style={{ margin: "0 0 8px" }}>{traject.naam}</h3>
                  <p style={{ color: PUB.sub, lineHeight: 1.7 }}>{traject.doelgroep || "Teamtraject"} · {traject.status || "Actief"}</p>
                  {traject.scanLink && <a href={traject.scanLink} style={{ color: PUB.donker, fontWeight: 900 }}>Open scan →</a>}
                </article>
              ))}
              <article style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 24, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px" }}>Reflectiekaart</h3>
                <p style={{ color: PUB.sub, lineHeight: 1.7 }}>Aanvullend materiaal voor na de teamdag of coaching.</p>
                <a href="/reflectiekaart-mijn-teamkompas.pdf" style={{ color: PUB.donker, fontWeight: 900 }}>Download PDF →</a>
              </article>
            </div>
            {rapporten.length > 0 && <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 24, padding: 26 }}>
              <h3 style={{ marginTop: 0 }}>Rapportages</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {rapporten.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: "14px 18px", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: PUB.teal, background: "rgba(15,118,110,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                          Rapportage
                        </span>
                        {r.rol && (
                          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: PUB.paars, background: "rgba(107,78,158,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                            {r.rol === "management" ? "Leidinggevende" : "Medewerkers"}
                          </span>
                        )}
                        {r.datum && <span style={{ fontSize: 13, color: PUB.sub }}>{r.datum}</span>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: PUB.donker, lineHeight: 1.5 }}>{r.titel}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => bekijkRapport(r.id)}
                      disabled={rapportLaden === r.id}
                      style={{ background: PUB.oranje, color: PUB.donker, padding: "10px 16px", borderRadius: 10, fontWeight: 800, fontSize: 14, border: 0, cursor: rapportLaden === r.id ? "wait" : "pointer", flexShrink: 0 }}
                    >
                      {rapportLaden === r.id ? "Openen..." : "Bekijk rapportage"}
                    </button>
                  </div>
                ))}
              </div>
            </div>}

            {materialen.length > 0 && <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 24, padding: 26 }}>
              <h3 style={{ marginTop: 0 }}>Documenten en materialen</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {materialen.map((item, index) => (
                  <div key={`${item.titel}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: "14px 18px", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: PUB.teal, background: "rgba(15,118,110,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                          {item.url ? (item.categorie || "Document") : "Notitie"}
                        </span>
                        {item.doelgroep && (
                          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: PUB.paars, background: "rgba(107,78,158,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                            {item.doelgroep}
                          </span>
                        )}
                        {item.datum && <span style={{ fontSize: 13, color: PUB.sub }}>{item.datum}</span>}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: PUB.donker, lineHeight: 1.5 }}>{item.titel}</div>
                    </div>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ background: PUB.oranje, color: PUB.donker, padding: "10px 16px", borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>
                        Openen
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>}
          </div>
        </section>
      ) : (
        <section style={{ padding: "64px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
              {cards.map(([step, title, text]) => (
                <article key={step} style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 24, padding: 26 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "grid", placeItems: "center", fontWeight: 900, marginBottom: 18 }}>{step}</div>
                  <h3 style={{ fontSize: 21, margin: "0 0 10px" }}>{title}</h3>
                  <p style={{ color: PUB.sub, lineHeight: 1.7, margin: 0 }}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
