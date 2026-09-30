/**
 * /sprekers
 *
 * Was tot nu toe losse HTML in public/sprekers/index.html, met een eigen kopie
 * van de navigatie erin. Die kopie liep achter: er stond nog een menu-item
 * "Over ons" in dat twee weken geleden uit de echte navigatie is gehaald. Elke
 * toekomstige wijziging aan menu, kleuren of koppen zou deze pagina opnieuw
 * overslaan. Daarom nu een gewone route, met dezelfde bouwstenen als de rest.
 *
 * Eén spreker in plaats van twee dezelfde kaarten: in de losse HTML stond het
 * blok over Edmond twee keer op dezelfde pagina.
 */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ContactModal from "../../ContactModal";
import { useKennismaking } from "../../lib/kennismaking";
import { PUB } from "../../styles/tokens";

export const SPREKERS = [
  {
    slug: "edmond-lam",
    naam: "Edmond Lam",
    initialen: "EL",
    thema: "Storytelling · communicatie · verbinding",
    kort: "Vertaalt complexe ideeën naar verhalen die raken, richting geven en mensen in beweging brengen.",
    lang: "Edmond helpt leiders, teams en professionals om complexe ideeën te vertalen naar verhalen die raken, richting geven en mensen in beweging brengen.",
  },
];

export function SprekerKaart({ spreker, navigate, breed = false }) {
  return (
    <article
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        padding: breed ? 34 : 28,
        maxWidth: breed ? 720 : "none",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 62, height: 62, borderRadius: "50%", background: PUB.tealOpDonker,
          color: PUB.donker, fontWeight: 900, fontSize: 21, display: "flex",
          alignItems: "center", justifyContent: "center", marginBottom: 22,
        }}
      >
        {spreker.initialen}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, color: PUB.wit, margin: "0 0 8px" }}>{spreker.naam}</h2>
      <div style={{ fontSize: 15, fontWeight: 700, color: PUB.oranje, marginBottom: 14 }}>{spreker.thema}</div>
      <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", margin: "0 0 20px" }}>
        {breed ? spreker.lang : spreker.kort}
      </p>
      <a
        href={`/sprekers/${spreker.slug}`}
        onClick={(e) => { e.preventDefault(); navigate(`/sprekers/${spreker.slug}`); }}
        style={{ fontSize: 15, fontWeight: 800, color: PUB.wit, textDecoration: "none" }}
      >
        Bekijk het profiel <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export const donkerVlak = { background: `linear-gradient(135deg, ${PUB.donker}, ${PUB.navy})`, color: PUB.wit };
export const binnen = { maxWidth: 1180, margin: "0 auto", padding: "0 20px" };
export const kop = { fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 14px" };
export const bovenregel = { fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: PUB.tealOpDonker, marginBottom: 14 };
export const oranjeKnop = { display: "inline-block", background: PUB.oranje, color: PUB.donker, padding: "14px 22px", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", border: "none", boxShadow: "0 12px 28px rgba(232,130,26,0.28)", fontFamily: "inherit" };
export const omlijndeKnop = { display: "inline-block", background: "rgba(255,255,255,0.06)", color: PUB.wit, border: "1px solid rgba(255,255,255,0.55)", padding: "14px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", textDecoration: "none", fontFamily: "inherit" };

export default function Sprekers() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  useKennismaking(openModal);

  return (
    <>
      <Helmet>
        <title>Sprekers over storytelling en teamontwikkeling | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek de sprekers van Mijn Teamkompas over storytelling, samenwerking, leiderschap en organisatieontwikkeling." />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/sprekers" />
        <meta property="og:title" content="Sprekers die teams in beweging brengen | Mijn Teamkompas" />
        <meta property="og:description" content="Praktijkervaring, psychologische inzichten en verhalen die mensen helpen begrijpen, onthouden en bewegen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mijnteamkompas.nl/sprekers" />
      </Helmet>

      <div style={{ ...donkerVlak, paddingTop: 64 }}>
        <section style={{ padding: "clamp(56px, 8vw, 96px) 0" }}>
          <div style={{ ...binnen, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 46, alignItems: "center" }}>
            <div>
              <div style={bovenregel}>Sprekers</div>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
                Sprekers die teams in beweging brengen.
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", maxWidth: 620, margin: "0 0 30px" }}>
                Onze sprekers combineren praktijkervaring, psychologische inzichten en inspirerende verhalen. Niet om mensen alleen te motiveren, maar om een gesprek en beweging op gang te brengen die langer meegaan dan de bijeenkomst zelf.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
                <a href="#onze-sprekers" style={omlijndeKnop}>Bekijk onze sprekers</a>
              </div>
            </div>
            <SprekerKaart spreker={SPREKERS[0]} navigate={navigate} />
          </div>
        </section>

        <section id="onze-sprekers" style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={binnen}>
            <div style={{ maxWidth: 760, marginBottom: 34 }}>
              <div style={bovenregel}>Ontdek onze sprekers</div>
              <h2 style={kop}>Een verhaal dat past bij jullie vraagstuk.</h2>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", margin: 0 }}>
                Een lezing, workshop of bijdrage aan een teamdag wordt afgestemd op de context, de doelgroep en de beweging die jullie willen realiseren.
              </p>
            </div>
            <SprekerKaart spreker={SPREKERS[0]} navigate={navigate} breed />
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 820 }}>
            <div style={bovenregel}>Samen verkennen</div>
            <h2 style={kop}>Welke spreker past bij jullie moment?</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", margin: "0 0 26px" }}>
              Vertel ons wat er speelt en wat de bijeenkomst moet opleveren. Dan denken we mee over de vorm en inhoud die het beste aansluiten.
            </p>
            <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} bron="Sprekers pagina" interesse="Spreker" />
    </>
  );
}
