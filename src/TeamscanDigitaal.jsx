import React, { useEffect, useMemo, useRef, useState } from "react";
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const buttonBase = {
  border: "none",
  borderRadius: 12,
  padding: "15px 18px",
  fontWeight: 900,
  cursor: "pointer",
  minHeight: 52,
};

function Field({ label, children, help }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {help ? (
        <span style={{ display: "block", marginTop: 6, fontSize: 12, color: C.sub }}>
          {help}
        </span>
      ) : null}
    </label>
  );
}

function StepBadge({ active, done, number, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          background: done ? C.groen : active ? C.blauw : C.lijn,
          color: done || active ? C.wit : C.sub,
        }}
      >
        {done ? "✓" : number}
      </div>
      <span style={{ fontSize: 14, fontWeight: 900, color: active ? C.donker : C.sub }}>{label}</span>
    </div>
  );
}

export default function TeamscanDigitaal() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const aanvraagRef = useRef(null);
  const pageViewTrackedRef = useRef(false);
  const formStartTrackedRef = useRef(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [skipTeamEmails, setSkipTeamEmails] = useState(false);

  const [form, setForm] = useState({
    bedrijf: "",
    afdeling: "",
    managerNaam: "",
    managerEmail: "",
    teamGrootte: "",
    toelichting: "",
  });

  const [collegaEmails, setCollegaEmails] = useState([""]);

  async function trackTeamscanEvent(event, extra = {}) {
    try {
      await addDoc(collection(db, "teamscanEvents"), {
        event,
        bron: "website_teamscan_digitaal",
        path: typeof window !== "undefined" ? window.location.pathname : "/teamscan",
        hash: typeof window !== "undefined" ? window.location.hash : "",
        teamSize: Number(form.teamGrootte || 0),
        bedrijf: form.bedrijf?.trim?.() || "",
        afdeling: form.afdeling?.trim?.() || "",
        timestamp: serverTimestamp(),
        ...extra,
      });
    } catch (trackError) {
      console.warn("Teamscan funnel-event kon niet worden opgeslagen", trackError);
    }
  }

  function trackFormStartOnce(extra = {}) {
    if (formStartTrackedRef.current) return;
    formStartTrackedRef.current = true;
    trackTeamscanEvent("start_form", extra);
  }

  useEffect(() => {
    if (pageViewTrackedRef.current) return;
    pageViewTrackedRef.current = true;
    trackTeamscanEvent("view_teamscan_page");
    // Deze effect mag maar één keer draaien bij het openen van de teamscanpagina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teamGrootteNummer = Number(form.teamGrootte || 0);

  const ingevuldeEmails = useMemo(
    () => collegaEmails.map((email) => email.trim()).filter(Boolean),
    [collegaEmails]
  );

  const emailFouten = useMemo(
    () =>
      collegaEmails
        .map((email, index) => ({ email: email.trim(), index }))
        .filter(({ email }) => email && !emailRegex.test(email)),
    [collegaEmails]
  );

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

  function validateStepOne() {
    const missing = [];
    if (!form.bedrijf.trim()) missing.push("naam van de organisatie");
    if (!form.afdeling.trim()) missing.push("afdeling of team");
    if (!form.managerNaam.trim()) missing.push("naam van de aanvrager");
    if (!form.managerEmail.trim()) missing.push("e-mailadres van de aanvrager");
    if (form.managerEmail.trim() && !emailRegex.test(form.managerEmail.trim())) missing.push("geldig e-mailadres van de aanvrager");
    if (!teamGrootteNummer || teamGrootteNummer < 1) missing.push("aantal collega’s");
    return missing;
  }

  function validateStepTwo() {
    if (skipTeamEmails) return [];
    const missing = [];
    if (teamGrootteNummer > 0 && ingevuldeEmails.length !== teamGrootteNummer) {
      missing.push(`e-mailadres van alle ${teamGrootteNummer} collega’s`);
    }
    if (emailFouten.length > 0) missing.push("geldige e-mailadressen van collega’s");
    return missing;
  }

  function scrollToAanvraag() {
    setTimeout(() => {
      aanvraagRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function goToStepTwo() {
    setError("");
    trackFormStartOnce({ trigger: "go_to_step_two" });
    const missing = validateStepOne();
    if (missing.length > 0) {
      setError(`Vul eerst deze gegevens aan: ${missing.join(", ")}.`);
      scrollToAanvraag();
      return;
    }
    trackTeamscanEvent("step1_completed", {
      teamSize: teamGrootteNummer,
      managerEmail: form.managerEmail.trim().toLowerCase(),
    });
    setStep(2);
    scrollToAanvraag();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const missing = [...validateStepOne(), ...validateStepTwo()];
    if (missing.length > 0) {
      setError(`Vul deze gegevens nog aan: ${missing.join(", ")}.`);
      return;
    }

    setSubmitting(true);

    try {
      const requestRef = await addDoc(collection(db, "teamscanSelfserviceAanvragen"), {
        type: "digitale_teamscan_selfservice",
        status: "nieuw",
        bron: "website_teamscan_digitaal",
        funnelFase: "lead_aanvraag",
        bedrijf: form.bedrijf.trim(),
        afdeling: form.afdeling.trim(),
        managerNaam: form.managerNaam.trim(),
        managerEmail: form.managerEmail.trim().toLowerCase(),
        teamGrootte: teamGrootteNummer,
        collegaEmailsLaterToevoegen: skipTeamEmails,
        collegaEmails: skipTeamEmails ? [] : ingevuldeEmails.map((email) => email.toLowerCase()),
        aantalCollegaEmailsIngevuld: skipTeamEmails ? 0 : ingevuldeEmails.length,
        toelichting: form.toelichting.trim(),
        opvolgingNodig: true,
        gewensteVervolgactie: skipTeamEmails ? "manager_benaderen_voor_teamleden" : "scan_klaarzetten_en_mailen",
        aangemaaktOp: serverTimestamp(),
      });

      await trackTeamscanEvent("step2_completed", {
        requestId: requestRef.id,
        teamSize: teamGrootteNummer,
        colleagueEmailsProvided: skipTeamEmails ? 0 : ingevuldeEmails.length,
        emailsLaterToevoegen: skipTeamEmails,
      });

      await trackTeamscanEvent("submit_teamscan", {
        requestId: requestRef.id,
        teamSize: teamGrootteNummer,
        managerEmail: form.managerEmail.trim().toLowerCase(),
        colleagueEmailsProvided: skipTeamEmails ? 0 : ingevuldeEmails.length,
        emailsLaterToevoegen: skipTeamEmails,
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      console.error("Aanvraag digitale teamscan mislukt", submitError);
      setError("Het versturen lukt nu niet. Probeer het later opnieuw of neem contact op via info@mijnteamkompas.nl.");
    } finally {
      setSubmitting(false);
    }
  }

  const benefits = [
    ["Veilig starten", "Heldere uitleg voor manager en teamleden."],
    ["Snel overzicht", "Je ziet waar samenwerking energie geeft en waar het schuurt."],
    ["Praktische vervolgstappen", "Geen lange rapporten, maar richting voor verbetering."],
  ];

  const process = [
    ["1", "Aanvraag", "Je vult de gegevens van organisatie, afdeling en aanvrager in."],
    ["2", "Teamleden", "Je voegt de e-mailadressen toe of doet dat later."],
    ["3", "Uitnodiging", "Manager en teamleden ontvangen uitleg en de vragenlijst."],
    ["4", "Inzicht", "De uitkomsten worden samengebracht in een helder overzicht."],
  ];

  if (success) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Teamscan aangevraagd | Mijn Teamkompas</title>
        </Helmet>
        <div style={{ fontFamily: "Roboto, sans-serif", background: C.licht, color: C.donker, minHeight: "100vh", padding: isMobile ? "36px 20px" : "70px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", background: C.wit, borderRadius: 28, padding: isMobile ? 26 : 44, boxShadow: "0 24px 70px rgba(13,27,42,0.12)", border: `1px solid ${C.lijn}` }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: C.groen, color: C.wit, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, marginBottom: 22 }}>✓</div>
            <h1 style={{ fontSize: isMobile ? 32 : 46, lineHeight: 1.08, margin: "0 0 12px" }}>Je aanvraag is ontvangen.</h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: C.sub, margin: "0 0 28px" }}>
              We nemen je aanvraag in behandeling. Je ontvangt een bevestiging en daarna zorgen we dat de teamscan zorgvuldig wordt klaargezet.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
              {[
                ["1", "Bevestiging", "Je ontvangt bericht op het opgegeven e-mailadres."],
                ["2", "Klaarzetten", "De teamscan wordt zorgvuldig voorbereid voor jouw team."],
                ["3", "Vervolg", "Na deelname ontvang je inzicht en praktische vervolgstappen."],
              ].map(([nr, titel, tekst]) => (
                <div key={titel} style={{ border: `1px solid ${C.lijn}`, borderRadius: 18, padding: 18, background: C.licht }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.blauw, color: C.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 10 }}>{nr}</div>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: C.sub }}>{tekst}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
              <button onClick={() => navigate("/verkennen")} style={{ ...buttonBase, background: C.teal, color: C.wit }}>Plan ook een verkennend gesprek</button>
              <button onClick={() => navigate("/")} style={{ ...buttonBase, background: C.wit, color: C.donker, border: `1px solid ${C.lijn}` }}>Terug naar home</button>
            </div>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitale teamscan aanvragen | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Vraag eenvoudig een digitale teamscan aan voor jouw team. Binnen enkele minuten geregeld, veilig voor teamleden en gericht op praktische vervolgstappen."
        />
      </Helmet>

      <div style={{ fontFamily: "Roboto, sans-serif", background: C.wit, color: C.donker, minHeight: "100vh" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.lijn}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div onClick={() => navigate("/")} style={{ fontWeight: 900, fontSize: 20, cursor: "pointer", color: C.donker }}>Mijn Teamkompas</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => navigate("/verkennen")} style={{ background: "transparent", border: `1px solid ${C.lijn}`, color: C.donker, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>Persoonlijk starten</button>
              <button onClick={() => navigate("/")} style={{ background: C.blauw, border: "none", color: C.wit, borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer" }}>Terug naar home</button>
            </div>
          </div>
        </header>

        <section style={{ background: "linear-gradient(135deg,#0D1B2A 0%, #143B68 100%)", color: C.wit, padding: isMobile ? "54px 22px" : "80px 60px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: 42, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7DB7FF", marginBottom: 14 }}>Digitale teamscan</div>
              <h1 style={{ fontSize: isMobile ? 36 : 58, lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.03em" }}>Start de teamscan voor jouw team.</h1>
              <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", maxWidth: 680 }}>
                Binnen 2 minuten geregeld. Jouw team ontvangt een korte vragenlijst en jij krijgt inzicht in wat er speelt, waar energie zit en welke vervolgstappen logisch zijn.
              </p>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 26 }}>
                <a
                  href="#aanvraag"
                  onClick={() => trackFormStartOnce({ trigger: "hero_button" })}
                  style={{ ...buttonBase, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", background: C.blauw, color: C.wit }}
                >
                  Start de aanvraag
                </a>
                <button onClick={() => navigate("/verkennen")} style={{ ...buttonBase, background: "rgba(255,255,255,0.06)", color: C.wit, border: "1px solid rgba(255,255,255,0.22)" }}>Liever persoonlijk starten</button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {benefits.map(([titel, tekst]) => (
                <div key={titel} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: 18 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.72)" }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "44px 22px" : "66px 60px", background: C.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: C.blauw, textTransform: "uppercase", marginBottom: 10 }}>Hoe het werkt</div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 12px" }}>Een eenvoudige route naar teaminzicht.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: C.sub }}>Geen ingewikkeld traject vooraf. Je start met een compacte aanvraag, daarna zorgen wij dat het proces zorgvuldig wordt ingericht.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 14 }}>
              {process.map(([nr, titel, tekst]) => (
                <div key={titel} style={{ background: C.wit, border: `1px solid ${C.lijn}`, borderRadius: 18, padding: 20, minHeight: 158, boxShadow: "0 14px 34px rgba(13,27,42,0.06)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.blauw, color: C.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 14 }}>{nr}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.65, color: C.sub }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="aanvraag" ref={aanvraagRef} style={{ padding: isMobile ? "48px 22px" : "76px 60px", background: C.wit, scrollMarginTop: 86 }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.8fr 1.2fr", gap: 34, alignItems: "start" }}>
            <aside style={{ background: C.licht, border: `1px solid ${C.lijn}`, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: C.teal, textTransform: "uppercase", marginBottom: 10 }}>Leadgenerator</div>
              <h2 style={{ fontSize: isMobile ? 28 : 36, lineHeight: 1.12, margin: "0 0 12px" }}>Start zonder verplichting.</h2>
              <p style={{ color: C.sub, lineHeight: 1.75, margin: "0 0 20px" }}>
                In deze fase gebruiken we de digitale teamscan om teams laagdrempelig te helpen en te leren waar de meeste behoefte zit. Er zijn nu geen kosten verbonden aan deze aanvraag.
              </p>
              <div style={{ display: "grid", gap: 14 }}>
                <StepBadge active={step === 1} done={step > 1} number="1" label="Teamgegevens" />
                <StepBadge active={step === 2} done={false} number="2" label="Teamleden" />
              </div>
            </aside>

            <form onSubmit={handleSubmit} style={{ background: C.wit, border: `1px solid ${C.lijn}`, borderRadius: 24, padding: isMobile ? 22 : 30, boxShadow: "0 20px 60px rgba(13,27,42,0.08)" }}>
              {step === 1 ? (
                <div>
                  <h2 style={{ fontSize: isMobile ? 26 : 34, margin: "0 0 8px" }}>Voor welk team wil je starten?</h2>
                  <p style={{ color: C.sub, lineHeight: 1.7, margin: "0 0 24px" }}>Vul eerst de basisgegevens in. Daarna kun je de collega’s toevoegen die je wilt betrekken.</p>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <Field label="Naam organisatie">
                      <input style={inputStyle} value={form.bedrijf} onChange={(e) => updateForm("bedrijf", e.target.value)} placeholder="Bijvoorbeeld: Zorggroep Nova" />
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
                    <Field label="Aantal collega’s in de teamscan" help="Vul alleen de collega’s in die je daadwerkelijk wilt uitnodigen.">
                      <input style={inputStyle} inputMode="numeric" value={form.teamGrootte} onChange={(e) => updateTeamGrootte(e.target.value)} placeholder="Bijvoorbeeld: 8" />
                    </Field>
                    <Field label="Korte toelichting (optioneel)">
                      <input style={inputStyle} value={form.toelichting} onChange={(e) => updateForm("toelichting", e.target.value)} placeholder="Bijvoorbeeld: nieuw team, samenwerking, energie" />
                    </Field>
                  </div>

                  {error ? <div style={{ marginTop: 18, color: C.rood, fontWeight: 800 }}>{error}</div> : null}

                  <button type="button" onClick={goToStepTwo} style={{ ...buttonBase, width: "100%", marginTop: 24, background: C.blauw, color: C.wit }}>Ga verder →</button>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontSize: isMobile ? 26 : 34, margin: "0 0 8px" }}>Wie wil je uitnodigen?</h2>
                  <p style={{ color: C.sub, lineHeight: 1.7, margin: "0 0 18px" }}>
                    Vul de e-mailadressen in van de collega’s die de vragenlijst mogen ontvangen. Heb je die nog niet compleet? Dan kun je ze later toevoegen.
                  </p>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 14, border: `1px solid ${C.lijn}`, borderRadius: 14, background: skipTeamEmails ? "#EEF7F3" : C.licht, marginBottom: 18, cursor: "pointer" }}>
                    <input type="checkbox" checked={skipTeamEmails} onChange={(e) => setSkipTeamEmails(e.target.checked)} style={{ marginTop: 3 }} />
                    <span>
                      <strong>Ik voeg de e-mailadressen later toe</strong>
                      <span style={{ display: "block", color: C.sub, fontSize: 13, lineHeight: 1.5, marginTop: 3 }}>Handig als je nu alvast wilt starten, maar de lijst nog moet controleren.</span>
                    </span>
                  </label>

                  {!skipTeamEmails ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      {Array.from({ length: Math.max(teamGrootteNummer, 1) }).map((_, index) => (
                        <Field key={index} label={`E-mailadres collega ${index + 1}`}>
                          <input
                            style={{ ...inputStyle, borderColor: collegaEmails[index] && !emailRegex.test(collegaEmails[index].trim()) ? C.rood : C.lijn }}
                            type="email"
                            value={collegaEmails[index] || ""}
                            onChange={(e) => updateCollegaEmail(index, e.target.value)}
                            placeholder={`collega${index + 1}@organisatie.nl`}
                          />
                        </Field>
                      ))}
                    </div>
                  ) : null}

                  {error ? <div style={{ marginTop: 18, color: C.rood, fontWeight: 800 }}>{error}</div> : null}

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 24 }}>
                    <button type="button" onClick={() => { setError(""); setStep(1); scrollToAanvraag(); }} style={{ ...buttonBase, flex: 1, background: C.wit, color: C.donker, border: `1px solid ${C.lijn}` }}>Terug</button>
                    <button type="submit" disabled={submitting} style={{ ...buttonBase, flex: 2, background: submitting ? C.sub : C.groen, color: C.wit, opacity: submitting ? 0.75 : 1 }}>
                      {submitting ? "Aanvraag versturen..." : "Start aanvraag teamscan"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </HelmetProvider>
  );
}
