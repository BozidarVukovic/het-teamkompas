import React, { useMemo, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const C = {
  donker: "#0D1B2A",
  navy: "#1A2E4A",
  teal: "#0F766E",
  groen: "#2F8F3A",
  blauw: "#0F66D0",
  wit: "#FFFFFF",
  licht: "#F4F7F9",
  lijn: "#DDE4ED",
  sub: "#5F6B7A",
  rood: "#B91C1C",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 820);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.lijn}`,
  borderRadius: 12,
  padding: "13px 14px",
  fontSize: 15,
  outline: "none",
  background: C.wit,
  color: C.donker,
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
  color: C.donker,
};

function Field({ label, children, help }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {help ? <span style={{ display: "block", marginTop: 6, fontSize: 12, color: C.sub }}>{help}</span> : null}
    </label>
  );
}

export default function TeamscanDigitaal() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    bedrijf: "",
    afdeling: "",
    managerNaam: "",
    managerEmail: "",
    teamGrootte: "",
    toelichting: "",
  });

  const [collegaEmails, setCollegaEmails] = useState([""]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const teamGrootteNummer = Number(form.teamGrootte || 0);

  const ingevuldeEmails = useMemo(
    () => collegaEmails.map((email) => email.trim()).filter(Boolean),
    [collegaEmails]
  );

  const emailFouten = useMemo(
    () => collegaEmails
      .map((email, index) => ({ email: email.trim(), index }))
      .filter(({ email }) => email && !emailRegex.test(email)),
    [collegaEmails]
  );

  const missing = [];
  if (!form.bedrijf.trim()) missing.push("naam van het bedrijf");
  if (!form.afdeling.trim()) missing.push("afdeling of team");
  if (!form.managerNaam.trim()) missing.push("naam van de aanvrager");
  if (!form.managerEmail.trim()) missing.push("e-mailadres van de aanvrager");
  if (form.managerEmail.trim() && !emailRegex.test(form.managerEmail.trim())) missing.push("geldig e-mailadres van de aanvrager");
  if (!teamGrootteNummer || teamGrootteNummer < 1) missing.push("aantal teamleden");
  if (teamGrootteNummer > 0 && ingevuldeEmails.length !== teamGrootteNummer) missing.push(`e-mailadres van alle ${teamGrootteNummer} teamleden`);
  if (emailFouten.length > 0) missing.push("geldige e-mailadressen van teamleden");

  const isValid = missing.length === 0;

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTeamGrootte(value) {
    const cleaned = value.replace(/[^0-9]/g, "");
    const number = Number(cleaned || 0);
    updateForm("teamGrootte", cleaned);

    if (!number || number < 1) {
      setCollegaEmails([""]);
      return;
    }

    setCollegaEmails((current) => {
      const next = [...current];
      if (number > next.length) {
        while (next.length < number) next.push("");
      }
      return next.slice(0, number);
    });
  }

  function updateCollegaEmail(index, value) {
    setCollegaEmails((current) => current.map((email, i) => (i === index ? value : email)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    setError("");

    if (!isValid) {
      setError("Vul de ontbrekende gegevens aan voordat je de aanvraag verstuurt.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "teamscanSelfserviceAanvragen"), {
        type: "digitale_teamscan_selfservice",
        status: "nieuw",
        bron: "website_teamscan_digitaal",
        bedrijf: form.bedrijf.trim(),
        afdeling: form.afdeling.trim(),
        managerNaam: form.managerNaam.trim(),
        managerEmail: form.managerEmail.trim().toLowerCase(),
        teamGrootte: teamGrootteNummer,
        collegaEmails: ingevuldeEmails.map((email) => email.toLowerCase()),
        toelichting: form.toelichting.trim(),
        aangemaaktOp: serverTimestamp(),
      });

      setSuccess(true);
    } catch (submitError) {
      console.error("Aanvraag digitale teamscan mislukt", submitError);
      setError("Het versturen lukt nu niet. Probeer het later opnieuw of neem contact op via info@mijnteamkompas.nl.");
    } finally {
      setSubmitting(false);
    }
  }

  const stappen = [
    ["1", "Vul de aanvraag in", "Je geeft aan voor welk team de scan bedoeld is en wie de contactpersoon is."],
    ["2", "Voeg teamleden toe", "Je vult de e-mailadressen in van de collega’s die je wilt betrekken."],
    ["3", "Wij zetten de scan klaar", "De manager en teamleden ontvangen daarna duidelijke uitleg en de vragenlijst."],
    ["4", "Je ontvangt inzicht", "Na invullen worden de uitkomsten samengebracht in een helder overzicht met vervolgstappen."],
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitale teamscan aanvragen | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Vraag eenvoudig een digitale teamscan aan voor jouw team. Vul de teamgegevens in en Mijn Teamkompas zet de scan zorgvuldig klaar."
        />
      </Helmet>

      <div style={{ fontFamily: "Roboto, sans-serif", background: C.wit, color: C.donker, minHeight: "100vh" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.lijn}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div onClick={() => navigate("/")} style={{ fontWeight: 900, fontSize: 20, cursor: "pointer", color: C.donker }}>Mijn Teamkompas</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => navigate("/verkennen")} style={{ background: "transparent", border: `1px solid ${C.lijn}`, color: C.donker, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>Persoonlijk traject</button>
              <button onClick={() => navigate("/")} style={{ background: C.blauw, border: "none", color: C.wit, borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer" }}>Terug naar home</button>
            </div>
          </div>
        </header>

        <section style={{ background: "linear-gradient(135deg,#0D1B2A 0%, #143B68 100%)", color: C.wit, padding: isMobile ? "56px 22px" : "82px 60px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: 42, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7DB7FF", marginBottom: 14 }}>Digitale teamscan</div>
              <h1 style={{ fontSize: isMobile ? 36 : 58, lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.03em" }}>Start eenvoudig met inzicht in je team.</h1>
              <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", maxWidth: 680 }}>
                Vul de gegevens van je team in. Wij zetten de teamscan zorgvuldig klaar en zorgen dat de manager en teamleden duidelijke uitleg ontvangen.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 12, marginTop: 26 }}>
                {stappen.map(([nr, titel, tekst]) => (
                  <div key={titel} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blauw, color: C.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 10 }}>{nr}</div>
                    <div style={{ fontWeight: 900, marginBottom: 5 }}>{titel}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.72)" }}>{tekst}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.wit, color: C.donker, borderRadius: 24, padding: isMobile ? 22 : 30, boxShadow: "0 24px 70px rgba(0,0,0,0.25)" }}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Aanvraag digitale teamscan</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: C.sub, margin: "0 0 22px" }}>
                Dit kost ongeveer 3 minuten. De gegevens komen binnen in de beheeromgeving zodat de scan zorgvuldig kan worden klaargezet.
              </p>

              {success ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 16, padding: 22 }}>
                  <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>Aanvraag ontvangen</h2>
                  <p style={{ margin: 0, color: C.sub, lineHeight: 1.7 }}>
                    Dank je wel. We hebben de aanvraag ontvangen en zetten de vervolgstap klaar. De manager ontvangt bericht over het vervolg.
                  </p>
                  <button onClick={() => navigate("/")} style={{ marginTop: 18, background: C.teal, color: C.wit, border: "none", borderRadius: 12, padding: "13px 18px", fontWeight: 900, cursor: "pointer" }}>Terug naar home</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    <Field label="Naam organisatie">
                      <input style={inputStyle} value={form.bedrijf} onChange={(e) => updateForm("bedrijf", e.target.value)} placeholder="Bijvoorbeeld: Zorggroep Noord" />
                    </Field>

                    <Field label="Afdeling of team">
                      <input style={inputStyle} value={form.afdeling} onChange={(e) => updateForm("afdeling", e.target.value)} placeholder="Bijvoorbeeld: HR advies" />
                    </Field>

                    <Field label="Naam aanvrager / manager">
                      <input style={inputStyle} value={form.managerNaam} onChange={(e) => updateForm("managerNaam", e.target.value)} placeholder="Voor- en achternaam" />
                    </Field>

                    <Field label="E-mailadres aanvrager / manager">
                      <input style={inputStyle} type="email" value={form.managerEmail} onChange={(e) => updateForm("managerEmail", e.target.value)} placeholder="naam@organisatie.nl" />
                    </Field>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Field label="Hoeveel collega’s wil je betrekken in de teamscan?" help="Vul het aantal teamleden in. Daarna verschijnen automatisch de velden voor de e-mailadressen.">
                      <input style={inputStyle} inputMode="numeric" value={form.teamGrootte} onChange={(e) => updateTeamGrootte(e.target.value)} placeholder="Bijvoorbeeld: 8" />
                    </Field>
                  </div>

                  {teamGrootteNummer > 0 ? (
                    <div style={{ marginTop: 18, padding: 16, border: `1px solid ${C.lijn}`, borderRadius: 16, background: C.licht }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 12 }}>
                        <div style={{ fontWeight: 900 }}>E-mailadressen teamleden</div>
                        <div style={{ fontSize: 12, color: C.sub }}>{ingevuldeEmails.length} van {teamGrootteNummer} ingevuld</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                        {collegaEmails.map((email, index) => (
                          <Field key={index} label={`Teamlid ${index + 1}`}>
                            <input
                              style={{
                                ...inputStyle,
                                borderColor: touched && email.trim() && !emailRegex.test(email.trim()) ? C.rood : C.lijn,
                              }}
                              type="email"
                              value={email}
                              onChange={(e) => updateCollegaEmail(index, e.target.value)}
                              placeholder={`teamlid${index + 1}@organisatie.nl`}
                            />
                          </Field>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div style={{ marginTop: 16 }}>
                    <Field label="Korte toelichting (optioneel)" help="Bijvoorbeeld: waarom je de scan wilt inzetten of wat er speelt in het team.">
                      <textarea
                        style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
                        value={form.toelichting}
                        onChange={(e) => updateForm("toelichting", e.target.value)}
                        placeholder="Korte context of aanleiding"
                      />
                    </Field>
                  </div>

                  {touched && !isValid ? (
                    <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: "#FEF2F2", color: C.rood, fontSize: 13, lineHeight: 1.6 }}>
                      {error || "Vul de ontbrekende gegevens aan."}
                    </div>
                  ) : null}

                  {error && isValid ? (
                    <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: "#FEF2F2", color: C.rood, fontSize: 13, lineHeight: 1.6 }}>{error}</div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 18,
                      width: "100%",
                      background: submitting ? "#94A3B8" : C.blauw,
                      color: C.wit,
                      border: "none",
                      borderRadius: 12,
                      padding: "15px 20px",
                      fontWeight: 900,
                      cursor: submitting ? "not-allowed" : "pointer",
                      minHeight: 54,
                    }}
                  >
                    {submitting ? "Aanvraag wordt verstuurd..." : "Teamscan aanvragen"}
                  </button>

                  <p style={{ margin: "12px 0 0", fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                    We gebruiken deze gegevens alleen om de teamscan klaar te zetten en de juiste deelnemers te informeren.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </HelmetProvider>
  );
}
