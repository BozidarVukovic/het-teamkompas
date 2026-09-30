/**
 * /sprekers/edmond-lam
 *
 * Zelfde verhaal als /sprekers: dit was losse HTML met een bevroren kopie van
 * de navigatie erin. De inhoud is ongewijzigd overgezet; alleen de vormgeving
 * komt nu uit dezelfde bouwstenen als de rest van de site, zodat een volgende
 * wijziging aan menu, koppen of kleuren deze pagina niet meer overslaat.
 */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ContactModal from "../../ContactModal";
import { useKennismaking } from "../../lib/kennismaking";
import { PUB } from "../../styles/tokens";
import { binnen, bovenregel, donkerVlak, kop, omlijndeKnop, oranjeKnop } from "./Sprekers";

const STAPPEN = [
  ["1", "De kern vinden", "Wat wil je dat mensen begrijpen, voelen en uiteindelijk anders gaan doen?"],
  ["2", "Spanning opbouwen", "Hoe maak je een boodschap herkenbaar zonder haar groter of mooier te maken dan zij is?"],
  ["3", "Menselijk vertellen", "Hoe geef je voorbeelden, ervaringen en emoties een plek zonder de inhoud te verliezen?"],
];

const VORMEN = [
  ["Inspirerende lezing", "Een energieke en herkenbare bijdrage over de kracht van verhalen in leiderschap, verandering en samenwerking."],
  ["Interactieve workshop", "Deelnemers onderzoeken hun eigen boodschap en oefenen met het ontwikkelen en vertellen van een krachtig verhaal."],
  ["Onderdeel van een teamdag", "Storytelling als middel om ervaringen te delen, de bedoeling scherper te maken en de verbinding in het team te versterken."],
  ["Bijdrage aan een training", "Een verdiepend blok waarin deelnemers leren hoe zij verhalen bewust inzetten in presentaties, leiderschap en verandering."],
];

const vlak = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 26,
};

export default function SprekerEdmondLam() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  useKennismaking(openModal);

  const zacht = { fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.76)" };

  return (
    <>
      <Helmet>
        <title>Edmond Lam als spreker over storytelling | Mijn Teamkompas</title>
        <meta name="description" content="Edmond Lam helpt leiders, teams en professionals om complexe ideeën te vertalen naar verhalen die raken, richting geven en mensen in beweging brengen." />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/sprekers/edmond-lam" />
        <meta property="og:title" content="Edmond Lam als spreker over storytelling | Mijn Teamkompas" />
        <meta property="og:description" content="Storytelling die niet alleen inspireert, maar mensen helpt begrijpen, onthouden en bewegen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mijnteamkompas.nl/sprekers/edmond-lam" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Edmond Lam als spreker over storytelling",
          url: "https://www.mijnteamkompas.nl/sprekers/edmond-lam",
          description: "Edmond Lam helpt leiders, teams en professionals om complexe ideeën te vertalen naar verhalen die raken, richting geven en mensen in beweging brengen.",
        })}</script>
      </Helmet>

      <div style={{ ...donkerVlak, paddingTop: 64 }}>
        <section style={{ padding: "clamp(56px, 8vw, 96px) 0" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Spreker en storyteller</div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
              Edmond Lam brengt verhalen tot leven.
            </h1>
            <p style={{ ...zacht, fontSize: 18, margin: "0 0 30px" }}>
              Een goed verhaal maakt ingewikkelde ideeën begrijpelijk, geeft betekenis aan verandering en helpt mensen om te onthouden wat er werkelijk toe doet. Edmond laat zien hoe je dat doet.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
              <a href="/sprekers" onClick={(e) => { e.preventDefault(); navigate("/sprekers"); }} style={omlijndeKnop}>Bekijk onze sprekers</a>
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Waarom storytelling werkt</div>
            <h2 style={kop}>Mensen onthouden zelden een opsomming. Ze onthouden wat hen raakte.</h2>
            <p style={{ ...zacht, margin: "0 0 28px" }}>
              In organisaties is veel informatie correct, maar nog niet betekenisvol. Strategieën, plannen en veranderingen blijven abstract zolang mensen niet voelen waar het werkelijk over gaat. Edmond helpt leiders en professionals om de kern te vinden en die te vertalen naar een verhaal dat helder, geloofwaardig en menselijk is.
            </p>
            <blockquote style={{ ...vlak, margin: 0, fontSize: 20, lineHeight: 1.6, color: PUB.wit, borderLeft: `4px solid ${PUB.tealOpDonker}` }}>
              Storytelling gaat niet over een mooier verhaal vertellen. Het gaat over zichtbaar maken waarom iets ertoe doet.
            </blockquote>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={binnen}>
            <div style={{ maxWidth: 760, marginBottom: 34 }}>
              <div style={bovenregel}>Wat deelnemers meenemen</div>
              <h2 style={kop}>Van losse informatie naar een verhaal dat richting geeft.</h2>
              <p style={{ ...zacht, margin: 0 }}>
                Edmond combineert inspiratie met praktische toepasbaarheid. Deelnemers ervaren wat een verhaal krachtig maakt en vertalen dit direct naar hun eigen werkpraktijk.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {STAPPEN.map(([nr, titel, tekst]) => (
                <div key={nr} style={vlak}>
                  <div style={{ color: PUB.tealOpDonker, fontWeight: 900, fontSize: 28, marginBottom: 12 }}>{nr}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: PUB.wit, marginBottom: 10 }}>{titel}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.76)" }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={binnen}>
            <div style={{ maxWidth: 760, marginBottom: 34 }}>
              <div style={bovenregel}>Mogelijke vormen</div>
              <h2 style={kop}>Een bijdrage die past bij het moment.</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
              {VORMEN.map(([titel, tekst]) => (
                <div key={titel} style={vlak}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: PUB.wit, marginBottom: 10 }}>{titel}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.76)" }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 820 }}>
            <div style={bovenregel}>Edmond uitnodigen</div>
            <h2 style={kop}>Benieuwd wat Edmond voor jullie bijeenkomst kan betekenen?</h2>
            <p style={{ ...zacht, margin: "0 0 26px" }}>
              We denken graag mee over het doel, de doelgroep en de vorm die het beste aansluit bij jullie organisatie of team.
            </p>
            <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} bron="Spreker Edmond Lam" interesse="Spreker" />
    </>
  );
}
