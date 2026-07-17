import KompasDot from "../../components/shared/KompasDot";
import { PUB } from "../../styles/tokens";

const cards = [
  ["1", "Voorbereiden", "Alle deelnemers zien wat er vooraf nodig is: planning, context en praktische afspraken."],
  ["2", "Invullen", "Via de gedeelde scanlink vult iedere deelnemer de vragenlijst zelfstandig en veilig in."],
  ["3", "Terugkoppelen", "Na analyse bespreken we patronen, opvallende verschillen en concrete vervolgstappen."],
];

const links = [
  ["Scan invullen", "Gebruik de persoonlijke link die je van je begeleider of projectleider hebt ontvangen."],
  ["Documenten", "Privacyverklaring, voorwaarden en reflectiemateriaal staan overzichtelijk bij elkaar."],
  ["Hulp nodig?", "Neem contact op als je link niet werkt of als je vragen hebt over het traject."],
];

export default function Klantenportaal() {
  return (
    <main style={{ minHeight: "100vh", background: PUB.licht, color: PUB.donker }}>
      <section style={{ padding: "128px 24px 72px", background: PUB.donker, color: PUB.wit }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 36, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, color: PUB.teal, fontWeight: 800, fontSize: 13, marginBottom: 22 }}>
              <KompasDot size={18} /> Klantenportaal
            </div>
            <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)", lineHeight: 1.02, margin: "0 0 22px", letterSpacing: "-0.04em" }}>
              Alles voor jullie Teamkompas-traject op één plek.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 660, margin: "0 0 30px" }}>
              Hier vinden klanten en deelnemers de belangrijkste stappen, documenten en ingangen voor een lopend traject. Heb je een persoonlijke scanlink ontvangen? Gebruik dan altijd die link om je vragenlijst te openen.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a href="/reflectiekaart-mijn-teamkompas.pdf" style={{ background: PUB.oranje, color: PUB.donker, padding: "14px 22px", borderRadius: 999, fontWeight: 900, textDecoration: "none" }}>
                Download reflectiekaart
              </a>
              <a href="/verkennen" style={{ color: PUB.wit, padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,0.24)" }}>
                Stel een vraag
              </a>
            </div>
          </div>

          <aside style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 28, padding: 28, boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }}>
            <h2 style={{ fontSize: 24, margin: "0 0 18px" }}>Snelle toegang</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {links.map(([title, text]) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 18 }}>
                  <strong style={{ display: "block", color: PUB.teal, marginBottom: 6 }}>{title}</strong>
                  <span style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ maxWidth: 760, marginBottom: 32 }}>
            <div style={{ color: PUB.teal, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, fontWeight: 900, marginBottom: 10 }}>Werkwijze</div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.1, margin: "0 0 12px" }}>Wat kun je hier verwachten?</h2>
            <p style={{ color: PUB.sub, lineHeight: 1.8, fontSize: 17, margin: 0 }}>
              Het klantenportaal is bedoeld als rustige startplek voor deelnemers. De inhoud ondersteunt het traject zonder af te leiden van de persoonlijke begeleiding.
            </p>
          </div>

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
    </main>
  );
}
