import React from "react";
import { useNavigate } from "react-router-dom";

const C = {
  donker: "#0D1B2A",
  navy: "#1A2E4A",
  teal: "#0F766E",
  groen: "#2F8F3A",
  blauw: "#0F66D0",
  paars: "#6B4E9E",
  wit: "#FFFFFF",
  licht: "#F4F7F9",
  lijn: "#DDE4ED",
  sub: "#5F6B7A",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function KlantreisKeuze() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const cards = [
    {
      label: "Persoonlijk traject",
      title: "Eerst vertrouwen opbouwen",
      text: "Voor leiders en teams die willen begrijpen wat er onder de oppervlakte speelt voordat ze een traject starten.",
      button: "Verken persoonlijk traject",
      route: "/verkennen",
      color: C.groen,
      icon: "🤝",
      bullets: ["kennismaking", "teamscan", "analyse", "teamdag of begeleiding"],
    },
    {
      label: "Digitale teamscan",
      title: "Direct zelfstandig starten",
      text: "Voor organisaties die snel en schaalbaar inzicht willen krijgen via een digitale scan, analyse en adviesrapport.",
      button: "Start digitale teamscan",
      route: "/teamscan",
      color: C.blauw,
      icon: "📊",
      bullets: ["aanvraag", "scan uitzetten", "automatische analyse", "dashboard en advies"],
    },
  ];

  return (
    <section style={{ background: C.wit, padding: isMobile ? "54px 20px" : "78px 60px", borderBottom: `1px solid ${C.lijn}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 34px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>
            Twee klantreizen
          </div>
          <h2 style={{ fontSize: isMobile ? 30 : 44, lineHeight: 1.12, color: C.donker, margin: "0 0 14px" }}>
            Kies de manier van starten die past bij jouw team.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.sub, margin: 0 }}>
            Sommige teams hebben eerst vertrouwen, taal en begeleiding nodig. Andere teams willen digitaal en zelfstandig starten met een teamscan. Beide routes leiden naar inzicht, richting en concrete vervolgstappen.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 22 }}>
          {cards.map((card) => (
            <div key={card.title} style={{ background: C.licht, border: `1px solid ${C.lijn}`, borderRadius: 22, padding: isMobile ? 24 : 30, boxShadow: "0 18px 50px rgba(13,27,42,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: card.color }} />
              <div style={{ width: 56, height: 56, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 18, border: `1px solid ${C.lijn}` }}>
                {card.icon}
              </div>
              <div style={{ color: card.color, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900, marginBottom: 10 }}>{card.label}</div>
              <h3 style={{ fontSize: isMobile ? 25 : 30, lineHeight: 1.15, color: C.donker, margin: "0 0 12px" }}>{card.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: C.sub, margin: "0 0 20px" }}>{card.text}</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {card.bullets.map((b) => (
                  <div key={b} style={{ background: C.wit, border: `1px solid ${C.lijn}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, color: C.donker, fontWeight: 700 }}>
                    ✓ {b}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(card.route)} style={{ width: "100%", border: "none", background: card.color, color: C.wit, borderRadius: 12, padding: "14px 18px", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 14px 34px rgba(13,27,42,0.16)" }}>
                {card.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
