/**
 * ReflectiekaartFormulier
 * ─────────────────────────────────────────────────────────────────────────────
 * Herbruikbaar leadgeneratie-formulier voor de gratis reflectiekaart.
 * Slaat leads op in Firestore (collectie: reflectiekaartLeads)
 * en verstuurt:
 *  - Bevestigingsmail naar aanvrager via EmailJS
 *  - Beheerdermelding naar info@mijnteamkompas.nl via EmailJS
 *
 * Props:
 *   bronPagina  – naam van de pagina/sectie (voor tracking), bijv. "Homepage"
 *   variant     – "block" (groot, inline) | "compact" (smal, boven footer)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_REFLECTIE_TEMPLATE_ID,
  EMAILJS_ADMIN_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  CONTACT_TO_EMAIL,
} from "./email";

/* ── Huisstijl ──────────────────────────────────────────────────────────────── */
const C = {
  donker:  "#0D1B2A",
  teal:    "#0F766E",
  tealDim: "#0e6460",
  groen:   "#5A8C3C",
  licht:   "#F4F7F9",
  wit:     "#FFFFFF",
  sub:     "#6B7A8D",
  lijn:    "#dde4ed",
  fout:    "#DC2626",
};

const THEMA_OPTIES = [
  "Psychologische veiligheid",
  "Betere samenwerking",
  "Eigenaarschap",
  "Teamenergie",
  "Leiderschap",
  "Onderstroom bespreekbaar maken",
];

const leeg = {
  voornaam: "",
  achternaam: "",
  email: "",
  organisatie: "",
  functie: "",
  thema: "",
  themaAnders: "",
  toestemming: false,
};

/* ── Hulpfunctie: haal UTM-params op uit de huidige URL ─────────────────────── */
function getUtmParams() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:   p.get("utm_source")   || "",
    utm_medium:   p.get("utm_medium")   || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content:  p.get("utm_content")  || "",
  };
}

/* ── Stijlhulpers ────────────────────────────────────────────────────────────── */
const inputStyle = (fout = false) => ({
  width: "100%",
  border: `1.5px solid ${fout ? C.fout : C.lijn}`,
  borderRadius: 8,
  padding: "11px 14px",
  fontSize: 14,
  color: C.donker,
  background: C.wit,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Roboto', sans-serif",
});

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.sub,
  marginBottom: 5,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

/* ── EmailJS API-aanroep ─────────────────────────────────────────────────────── */
async function stuurEmail(templateId, params) {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:      EMAILJS_SERVICE_ID,
        template_id:     templateId,
        user_id:         EMAILJS_PUBLIC_KEY,
        template_params: params,
      }),
    });
    if (!res.ok) console.warn("EmailJS response:", res.status);
  } catch (e) {
    console.warn("EmailJS fout:", e);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOOFDCOMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function ReflectiekaartFormulier({ bronPagina = "Website", variant = "block" }) {
  const [form,   setForm]   = useState(leeg);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [fouten, setFouten] = useState({});

  const isCompact = variant === "compact";

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFouten(f => ({ ...f, [key]: false }));
  };

  const valideer = () => {
    const f = {};
    if (!form.voornaam.trim())   f.voornaam   = true;
    if (!form.achternaam.trim()) f.achternaam = true;
    if (!form.email.trim() || !form.email.includes("@")) f.email = true;
    if (!form.organisatie.trim()) f.organisatie = true;
    if (!form.functie.trim())     f.functie     = true;
    if (!form.toestemming)        f.toestemming = true;
    setFouten(f);
    return Object.keys(f).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valideer()) return;

    setStatus("sending");
    const utm = getUtmParams();
    const themaLabel = form.thema === "anders" ? (form.themaAnders || "Anders") : (form.thema || "Niet opgegeven");

    try {
      /* 1. Sla lead op in Firestore */
      await addDoc(collection(db, "reflectiekaartLeads"), {
        voornaam:     form.voornaam.trim(),
        achternaam:   form.achternaam.trim(),
        email:        form.email.trim().toLowerCase(),
        organisatie:  form.organisatie.trim(),
        functie:      form.functie.trim(),
        thema:        themaLabel,
        toestemming:  form.toestemming,
        bronPagina,
        status:       "nieuw",
        notities:     "",
        ...utm,
        aangemeldOp:  serverTimestamp(),
        laatsteContact: null,
      });

      /* 2. Bevestigingsmail naar aanvrager */
      await stuurEmail(EMAILJS_REFLECTIE_TEMPLATE_ID, {
        to_email:    form.email.trim(),
        to_name:     form.voornaam.trim(),
        voornaam:    form.voornaam.trim(),
        subject:     "Je reflectiekaart van Mijn Teamkompas",
        from_name:   "Mijn Teamkompas",
        reply_to:    CONTACT_TO_EMAIL,
        pdf_url:     "https://www.mijnteamkompas.nl/reflectiekaart-mijn-teamkompas.pdf",
        message: `Beste ${form.voornaam.trim()},\nDankjewel voor je aanvraag.\nVia onderstaande link vind je de reflectiekaart "Maak samenwerking bespreekbaar in je team":\nhttps://www.mijnteamkompas.nl/reflectiekaart-mijn-teamkompas.pdf\nDe kaart helpt je om op een laagdrempelige manier het gesprek te voeren over vertrouwen, eigenaarschap, energie en psychologische veiligheid. Gebruik de kaart bijvoorbeeld in een teamoverleg, bila, heidag of reflectiemoment.\nWil je naar aanleiding hiervan eens sparren over je team? Neem dan contact op via www.mijnteamkompas.nl.\nHartelijke groet,\nMijn Teamkompas\ninfo@mijnteamkompas.nl`,
      });

      /* 3. Melding naar beheerder */
      await stuurEmail(EMAILJS_ADMIN_TEMPLATE_ID, {
        to_email:   CONTACT_TO_EMAIL,
        from_name:  "Mijn Teamkompas website",
        subject:    `Nieuwe aanvraag reflectiekaart: ${form.voornaam.trim()} ${form.achternaam.trim()}`,
        message: `Nieuwe aanvraag reflectiekaart

Naam: ${form.voornaam.trim()} ${form.achternaam.trim()}
E-mail: ${form.email.trim()}
Organisatie: ${form.organisatie.trim()}
Functie: ${form.functie.trim()}
Thema: ${themaLabel}
Bronpagina: ${bronPagina}
UTM source: ${utm.utm_source || "-"}
UTM campaign: ${utm.utm_campaign || "-"}`,
      });

      setStatus("sent");
    } catch (err) {
      console.error("Formulier fout:", err);
      setStatus("error");
    }
  };

  /* ── Verzonden-staat ─────────────────────────────────────────────────────── */
  if (status === "sent") {
    return (
      <div style={{
        background:   C.licht,
        border:       `1.5px solid ${C.teal}`,
        borderRadius: 16,
        padding:      isCompact ? "28px 24px" : "40px 36px",
        textAlign:    "center",
        maxWidth:     isCompact ? "100%" : 680,
        margin:       "0 auto",
      }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
        <div style={{ fontSize: isCompact ? 18 : 22, fontWeight: 800, color: C.donker, marginBottom: 10 }}>
          Dankjewel voor je aanvraag
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: C.sub, margin: "0 auto", maxWidth: 480 }}>
          De reflectiekaart is naar je mailbox verstuurd. We hopen dat deze helpt om het goede gesprek in je team op gang te brengen.
        </p>
      </div>
    );
  }

  /* ── Formulier ─────────────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate style={{ fontFamily: "'Roboto', sans-serif" }}>
      <div style={{
        background:   C.wit,
        border:       `1.5px solid ${C.lijn}`,
        borderRadius: 16,
        padding:      isCompact ? "28px 24px" : "40px 40px",
        maxWidth:     isCompact ? "100%" : 680,
        margin:       "0 auto",
        boxShadow:    "0 8px 32px rgba(13,27,42,0.07)",
      }}>
        {/* Titel + intro */}
        {!isCompact && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
              Gratis download
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: C.donker, margin: "0 0 10px", lineHeight: 1.2 }}>
              Gratis reflectiekaart: maak samenwerking bespreekbaar in je team
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.sub, margin: 0 }}>
              Veel teams voelen dat samenwerking beter kan, maar vinden het lastig om het goede gesprek te voeren. Met deze praktische reflectiekaart krijg je concrete vragen om vertrouwen, eigenaarschap, energie en psychologische veiligheid bespreekbaar te maken.
            </p>
          </div>
        )}

        {isCompact && (
          <div style={{ fontSize: 16, fontWeight: 800, color: C.donker, marginBottom: 4 }}>
            Ontvang de gratis reflectiekaart
          </div>
        )}
        {isCompact && (
          <p style={{ fontSize: 13, color: C.sub, marginBottom: 18, lineHeight: 1.6 }}>
            Praktische reflectievragen over vertrouwen, eigenaarschap en samenwerking voor je team.
          </p>
        )}

        {/* Naam */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Voornaam *</label>
            <input
              type="text"
              placeholder="Je voornaam"
              value={form.voornaam}
              onChange={e => set("voornaam", e.target.value)}
              style={inputStyle(fouten.voornaam)}
              autoComplete="given-name"
            />
            {fouten.voornaam && <span style={{ fontSize: 11, color: C.fout }}>Vul je voornaam in</span>}
          </div>
          <div>
            <label style={labelStyle}>Achternaam *</label>
            <input
              type="text"
              placeholder="Je achternaam"
              value={form.achternaam}
              onChange={e => set("achternaam", e.target.value)}
              style={inputStyle(fouten.achternaam)}
              autoComplete="family-name"
            />
            {fouten.achternaam && <span style={{ fontSize: 11, color: C.fout }}>Vul je achternaam in</span>}
          </div>
        </div>

        {/* E-mail */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>E-mailadres *</label>
          <input
            type="email"
            placeholder="naam@organisatie.nl"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            style={inputStyle(fouten.email)}
            autoComplete="email"
          />
          {fouten.email && <span style={{ fontSize: 11, color: C.fout }}>Vul een geldig e-mailadres in</span>}
        </div>

        {/* Organisatie + functie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Organisatie *</label>
            <input
              type="text"
              placeholder="Naam van je organisatie"
              value={form.organisatie}
              onChange={e => set("organisatie", e.target.value)}
              style={inputStyle(fouten.organisatie)}
              autoComplete="organization"
            />
            {fouten.organisatie && <span style={{ fontSize: 11, color: C.fout }}>Vul je organisatie in</span>}
          </div>
          <div>
            <label style={labelStyle}>Functie of rol *</label>
            <input
              type="text"
              placeholder="Bijv. teamleider, HR-manager"
              value={form.functie}
              onChange={e => set("functie", e.target.value)}
              style={inputStyle(fouten.functie)}
              autoComplete="organization-title"
            />
            {fouten.functie && <span style={{ fontSize: 11, color: C.fout }}>Vul je functie in</span>}
          </div>
        </div>

        {/* Thema */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Waar wil je vooral mee aan de slag? (optioneel)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {THEMA_OPTIES.map(opt => (
              <label key={opt} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 13, color: C.donker, cursor: "pointer",
                background: form.thema === opt ? "#e6f7f5" : C.licht,
                border: `1.5px solid ${form.thema === opt ? C.teal : C.lijn}`,
                borderRadius: 8, padding: "9px 12px",
              }}>
                <input
                  type="radio"
                  name="thema"
                  value={opt}
                  checked={form.thema === opt}
                  onChange={() => set("thema", opt)}
                  style={{ accentColor: C.teal }}
                />
                {opt}
              </label>
            ))}
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: C.donker, cursor: "pointer",
              background: form.thema === "anders" ? "#e6f7f5" : C.licht,
              border: `1.5px solid ${form.thema === "anders" ? C.teal : C.lijn}`,
              borderRadius: 8, padding: "9px 12px",
            }}>
              <input
                type="radio"
                name="thema"
                value="anders"
                checked={form.thema === "anders"}
                onChange={() => set("thema", "anders")}
                style={{ accentColor: C.teal }}
              />
              Anders, namelijk
            </label>
          </div>
          {form.thema === "anders" && (
            <input
              type="text"
              placeholder="Omschrijf je thema"
              value={form.themaAnders}
              onChange={e => set("themaAnders", e.target.value)}
              style={{ ...inputStyle(), marginTop: 8 }}
            />
          )}
        </div>

        {/* Toestemming */}
        <div style={{ marginBottom: 22 }}>
          <label style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            fontSize: 12, color: C.sub, lineHeight: 1.6, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={form.toestemming}
              onChange={e => set("toestemming", e.target.checked)}
              style={{ marginTop: 2, accentColor: C.teal, flexShrink: 0 }}
            />
            <span>
              Ik ontvang graag de reflectiekaart en af en toe praktische inzichten van Mijn Teamkompas over teamontwikkeling, samenwerking en leiderschap. Ik kan mij op elk moment uitschrijven.{" "}
              <a href="/privacyverklaring_mijnteamkompas.pdf" style={{ color: C.teal }} target="_blank" rel="noopener noreferrer">
                Privacyverklaring
              </a>
            </span>
          </label>
          {fouten.toestemming && (
            <div style={{ fontSize: 11, color: C.fout, marginTop: 4 }}>
              Geef toestemming om door te gaan
            </div>
          )}
        </div>

        {/* Submit */}
        {status === "error" && (
          <div style={{ fontSize: 12, color: C.fout, marginBottom: 12 }}>
            Er ging iets mis. Probeer het opnieuw of stuur een e-mail naar info@mijnteamkompas.nl.
          </div>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            width: "100%",
            background: status === "sending" ? C.tealDim : C.teal,
            color: C.wit,
            border: "none",
            borderRadius: 10,
            padding: "14px",
            fontSize: 15,
            fontWeight: 800,
            cursor: status === "sending" ? "wait" : "pointer",
            fontFamily: "'Roboto', sans-serif",
            boxShadow: "0 8px 24px rgba(15,118,110,0.22)",
            transition: "background 0.2s",
          }}
        >
          {status === "sending" ? "Versturen..." : "Ontvang de reflectiekaart"}
        </button>

        <p style={{ fontSize: 11, color: C.sub, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
          Je gegevens worden veilig opgeslagen en alleen gebruikt voor de reflectiekaart en af en toe inhoudelijke inzichten van Mijn Teamkompas. Uitschrijven kan altijd.
        </p>
      </div>
    </form>
  );
}
