import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  CONTACT_TO_EMAIL,
} from "./email";

const emptyForm = {
  naam: "",
  organisatie: "",
  email: "",
  telefoon: "",
  teamgrootte: "",
  gewensteStap: "Kennismaking",
  bericht: "",
};

export default function ContactModal({ isOpen, onClose, bron = "Website" }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setStatus("idle");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.naam || !form.email) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      await addDoc(collection(db, "contactaanvragen"), {
        ...form,
        status: "Nieuw",
        bron,
        aangemaakt_op: serverTimestamp(),
      });

      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_naam: form.naam,
            from_organisatie: form.organisatie,
            from_email: form.email,
            from_telefoon: form.telefoon,
            teamgrootte: form.teamgrootte,
            gewenste_stap: form.gewensteStap,
            bericht: form.bericht,
            to_email: CONTACT_TO_EMAIL,
          },
        }),
      });

      if (!res.ok) console.warn("EmailJS gaf geen 200-response");
      setStatus("sent");
    } catch (error) {
      console.error("Fout bij versturen:", error);
      setStatus("error");
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(13,27,42,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#1A2E4A", borderRadius: 16, border: "1px solid rgba(0,168,150,0.2)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "#00A896", textTransform: "uppercase", marginBottom: 6 }}>Verkennende kennismaking</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>Plan een verkennende kennismaking</div>
            <div style={{ fontSize: 13, color: "#8fa3bb", marginTop: 4 }}>Binnen 1 werkdag reactie. Vrijblijvend, concreet en zonder verkoopdruk.</div>
          </div>
          <div onClick={onClose} style={{ cursor: "pointer", color: "#8fa3bb", fontSize: 22, lineHeight: 1, padding: "4px 8px", marginTop: -4 }}>×</div>
        </div>
        {status === "sent" ? (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 10 }}>Bericht ontvangen</div>
            <div style={{ fontSize: 14, color: "#8fa3bb", lineHeight: 1.7, marginBottom: 24 }}>Bedankt voor je aanvraag. We nemen zo snel mogelijk contact met je op om de situatie kort te verkennen.</div>
            <span onClick={onClose} style={{ background: "#00A896", color: "#0D1B2A", padding: "10px 24px", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Sluiten</span>
          </div>
        ) : (
          <div style={{ padding: "24px 32px 32px" }}>
            {[["naam", "Naam *", "Je volledige naam", "text"], ["email", "E-mailadres *", "naam@organisatie.nl", "email"], ["organisatie", "Organisatie", "Naam van de organisatie", "text"], ["telefoon", "Telefoonnummer", "+31 6 ...", "tel"], ["teamgrootte", "Teamgrootte", "Bijvoorbeeld 8 of 25", "text"]].map(([key, label, ph, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{label}</div>
                <input type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${status === "error" && !form[key] && (key === "naam" || key === "email") ? "#e74c3c" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Gewenste eerste stap</div>
              <select value={form.gewensteStap} onChange={(e) => setForm((f) => ({ ...f, gewensteStap: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                {["Kennismaking", "Teamscan verkennen", "Advies over trajectopbouw", "Workshop of teamdag"].map((opt) => <option key={opt} value={opt} style={{ color: "#0D1B2A" }}>{opt}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#8fa3bb", marginBottom: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Wat speelt er nu?</div>
              <textarea placeholder="Beschrijf kort wat er in het team speelt of welke vraag jullie willen verkennen." value={form.bericht} onChange={(e) => setForm((f) => ({ ...f, bericht: e.target.value }))} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>
            {status === "error" && <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 12 }}>Vul minimaal naam en e-mailadres in.</div>}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" onClick={handleSubmit} disabled={status === "sending"} style={{ flex: 1, background: status === "sending" ? "#007d70" : "#00A896", color: "#0D1B2A", border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: status === "sending" ? "wait" : "pointer" }}>{status === "sending" ? "Versturen..." : "Plan mijn vrijblijvende kennismaking"}</button>
              <span onClick={onClose} style={{ fontSize: 13, color: "#8fa3bb", cursor: "pointer" }}>Annuleer</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>Je gegevens worden uitsluitend gebruikt om deze aanvraag zorgvuldig op te volgen.</div>
          </div>
        )}
      </div>
    </div>
  );
}
