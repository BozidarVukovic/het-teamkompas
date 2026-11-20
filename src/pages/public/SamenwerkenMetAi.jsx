import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ContactModal from "../../ContactModal";
import Fade from "../../components/shared/Fade";
import { useIsMobile } from "../../components/shared/hooks";
import { SEO_PAGINAS } from "../../content/seoPaginas";
import { AI_INTERESSE } from "../../contactMetadata";
import { trackEvent } from "../../lib/analytics";
import { bepaalHerkomst, vorigeInternePagina } from "../../lib/herkomst";
import { useKennismaking } from "../../lib/kennismaking";
import { PUB } from "../../styles/tokens";

// Aanbodpagina /samenwerken-met-ai, november 2026.
//
// Een test: vinden managers, HR en veranderleiders met deze vraag ons, en
// vragen ze een kennismaking aan? Daarom vier meetpunten, alle vier zonder
// persoonsgegevens of vrije tekst:
//   home_ai_kaart_click            de kaart op de homepage (App.jsx)
//   ai_pagina_bekeken              met herkomst: zoekmachine, intern, extern...
//   ai_contact_click               de knop, met positie boven of onder
//   contact_aanvraag_verzonden     een afgeronde aanvraag (ContactModal),
//                                  met interesse "Samenwerken met AI"
// Aanvragen krijgen de interesse "Samenwerken met AI" en zijn in de
// beheeromgeving apart te filteren en als passend te beoordelen.
//
// Inhoudelijk: dit is een toepassing van het zesmaandentraject op één
// werkproces. We kiezen of bouwen geen AI-tools. Geen klantnamen, resultaten
// of testimonials tot die zijn goedgekeurd; het voorbeeld is als voorbeeld
// gemarkeerd.

const SEO = SEO_PAGINAS.samenwerkenMetAi;
const BRON = "Samenwerken met AI pagina";
const EXTRA_VRAAG = {
  veld: "werkproces",
  label: "Welk werkproces verandert bij jullie?",
  placeholder: "Bijvoorbeeld: klantvragen via de chatbot, beoordelen van AI-concepten",
};

const situaties = [
  ["Een klantvraag wisselt van kanaal", "De chatbot draagt over naar een medewerker, maar informatie ontbreekt of het is onduidelijk wie opvolgt."],
  ["AI maakt een voorstel en een collega moet beslissen", "Het team wil weten wanneer een korte controle volstaat en wanneer iemand nader onderzoek doet."],
  ["Een proces verandert over teamgrenzen heen", "Eén team wint tijd, terwijl een ander team meer uitzonderingen moet afhandelen."],
];

const stappen = [
  ["Breng één werkproces in beeld", "Kies samen waar het schuurt. Maak zichtbaar wie nu beslist, overdraagt en opvolgt, en waar mens en AI elkaars werk raken."],
  ["Test één nieuwe werkafspraak", "Spreek af wie aan zet is, wanneer een collega overneemt en hoe uitzonderingen worden opgepakt. Gebruik de bestaande teammomenten en korte terugblikken na 30, 60 en 90 dagen om bij te sturen."],
  ["Meet en borg wat werkt", "Volg één indicator, zoals het aantal teruggestuurde vragen, de tijd tot opvolging of de ervaren duidelijkheid over verantwoordelijkheden. Leg vast wie de werkwijze na het traject onderhoudt."],
];

const opbrengst = [
  ["Een duidelijke taakverdeling rond één proces", "Wie beslist, wie overneemt en wie terugkoppelt, ook bij een uitzondering."],
  ["Geteste werkafspraken", "Afspraken die het team in het eigen werk heeft uitgeprobeerd en bijgesteld, niet alleen op papier."],
  ["Inzicht in wat er verandert", "In het werk zelf, en voor de mensen die het doen: wat het oplevert en wat het kost."],
];

const faqs = [
  ["Moeten we al met AI zijn gestart?", "Nee. De aanpak past bij organisaties die AI op de werkvloer gaan invoeren en de taakverdeling vooraf willen doordenken, en bij organisaties die al zijn gestart en merken waar het schuurt."],
  ["Kiezen of bouwen jullie de AI-toepassing?", "Nee. We helpen het team met de samenwerking eromheen: wie wat doet, wie beslist en hoe het team leert van wat er in de praktijk gebeurt. De keuze en inrichting van de techniek blijft bij jullie en je leverancier."],
  ["Hoe lang duurt het en wat kost het?", "Het is een toepassing van ons traject Samen leren en verbeteren van zes maanden, gericht op één werkproces. Inhoud, intensiteit en kosten stemmen we af op jullie situatie; dat bespreken we in de kennismaking."],
];

export default function SamenwerkenMetAi() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const openVenster = (positie) => {
    trackEvent("ai_contact_click", { positie });
    setOpen(true);
  };
  // De knop in de menubalk opent hetzelfde venster, met hetzelfde onderwerp.
  useKennismaking(() => openVenster("menubalk"));

  useEffect(() => {
    trackEvent("ai_pagina_bekeken", bepaalHerkomst(document.referrer, window.location.hostname, vorigeInternePagina()));
  }, []);

  const knop = {
    background: PUB.oranje, color: PUB.donker, border: 0, padding: "14px 22px", borderRadius: 8,
    fontWeight: 800, fontSize: 15, cursor: "pointer", minHeight: 48, boxShadow: "0 12px 28px rgba(232,130,26,0.28)",
  };
  const sectie = (achtergrond) => ({ background: achtergrond, padding: isMobile ? "54px 20px" : "82px 60px" });
  const kop = { fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.12, color: PUB.donker, margin: "0 0 16px" };
  const label = { fontSize: 15, fontWeight: 700, color: PUB.teal, marginBottom: 12 };
  const kaart = { background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 22, height: "100%", boxSizing: "border-box" };

  return (
    <>
      <Helmet>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <link rel="canonical" href={SEO.url} />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SEO.url} />
        <meta property="og:image" content={SEO.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Service", name: "Samenwerken als AI het werk verandert", serviceType: "Teambegeleiding bij AI en automatisering", url: SEO.url, description: SEO.description, provider: { "@type": "ProfessionalService", name: "Mijn Teamkompas", url: "https://www.mijnteamkompas.nl" }, areaServed: { "@type": "Country", name: "Nederland" } },
            { "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
          ],
        })}</script>
      </Helmet>

      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, overflowX: "hidden", paddingTop: 64, background: PUB.wit }}>
        <section style={{ background: PUB.donker, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr .9fr", alignItems: "center", overflow: "hidden" }}>
          <div style={{ padding: isMobile ? "54px 22px 34px" : "76px 58px 76px 72px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: PUB.tealOpDonker, marginBottom: 14 }}>Aanbod · veranderend werk</div>
            <h1 style={{ fontSize: isMobile ? 34 : 52, fontWeight: 800, lineHeight: 1.06, color: PUB.wit, margin: "0 0 22px", letterSpacing: "-0.03em" }}>
              Samenwerken als AI het werk verandert
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", maxWidth: 640, margin: "0 0 14px" }}>
              Een chatbot draagt een klantvraag over. Een AI-tool maakt een concept dat iemand moet beoordelen. Een nieuw proces bespaart tijd in het ene team, terwijl een ander team extra controlewerk krijgt. Zodra het werk verandert, moeten collega's opnieuw afspreken wie beslist, wie het overneemt en wanneer ze terugkoppelen.
            </p>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", maxWidth: 640, margin: "0 0 28px" }}>
              Mijn Teamkompas helpt jullie om één concreet werkproces samen onder de loep te nemen. Jullie maken werkafspraken, testen ze in de praktijk en kijken wat er verandert in het werk én voor de mensen die het doen.
            </p>
            <button type="button" onClick={() => openVenster("boven")} style={{ ...knop, width: isMobile ? "100%" : "auto" }}>Bespreek jullie werkproces</button>
          </div>
          <div style={{ minHeight: isMobile ? 240 : 520, height: "100%", position: "relative" }}>
            <img src="/blog/images/ai-en-organisatieproces.jpg" alt="Illustratie van een werkproces waarin mensen en AI samenwerken" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to top, rgba(13,27,42,0.6), rgba(13,27,42,0.05))" : "linear-gradient(to right, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.15) 22%, rgba(13,27,42,0) 60%)" }} />
          </div>
        </section>

        <section style={sectie(PUB.licht)}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <Fade>
              <div style={{ maxWidth: 820 }}>
                <div style={label}>Wanneer dit helpt</div>
                <h2 style={kop}>Herkenbaar als AI het werk tussen collega's verandert</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: "0 0 26px" }}>
                  Bij AI invoeren op de werkvloer gaat de aandacht vaak naar de techniek. De vragen die blijven liggen gaan over de taakverdeling tussen mens en AI, en tussen collega's onderling. Dat geldt voor organisaties die zich voorbereiden op een verandering, en voor organisaties die al zijn gestart en merken waar het schuurt.
                </p>
              </div>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {situaties.map(([titel, tekst], i) => (
                <Fade key={titel} delay={i * 0.05} style={{ height: "100%" }}>
                  <div style={kaart}>
                    <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3 }}>{titel}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        <section style={sectie(PUB.wit)}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <Fade>
              <div style={{ maxWidth: 840 }}>
                <div style={label}>Zo begeleiden we jullie</div>
                <h2 style={kop}>Werkafspraken bij automatisering, getest in het eigen werk</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: "0 0 26px" }}>
                  Dit is een toepassing van ons traject <a href="/teamontwikkeling#samen-leren-en-verbeteren" style={{ color: PUB.teal, fontWeight: 700 }}>Samen leren en verbeteren</a> van zes maanden, gericht op één werkproces. Inhoud en intensiteit stemmen we af op jullie situatie.
                </p>
              </div>
            </Fade>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
              {stappen.map(([titel, tekst], i) => (
                <Fade key={titel} delay={i * 0.05}>
                  <li style={{ ...kaart, display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "start", background: PUB.licht }}>
                    <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>{i + 1}</span>
                    <div>
                      <h3 style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 8px" }}>{titel}</h3>
                      <p style={{ fontSize: 15, lineHeight: 1.75, color: PUB.sub, margin: 0 }}>{tekst}</p>
                    </div>
                  </li>
                </Fade>
              ))}
            </ol>
          </div>
        </section>

        <section style={sectie(PUB.licht)}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 26 : 48, alignItems: "start" }}>
            <div>
              <Fade>
                <div style={label}>Wat het oplevert</div>
                <h2 style={kop}>Tastbaar, rond één proces</h2>
              </Fade>
              <div style={{ display: "grid", gap: 12 }}>
                {opbrengst.map(([titel, tekst], i) => (
                  <Fade key={titel} delay={i * 0.05}>
                    <div style={{ ...kaart, padding: "18px 20px" }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>{titel}</h3>
                      <p style={{ fontSize: 15, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                    </div>
                  </Fade>
                ))}
              </div>
            </div>
            <Fade delay={0.06}>
              <div style={{ ...kaart, background: PUB.wit, borderLeft: `5px solid ${PUB.teal}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: PUB.teal, marginBottom: 8 }}>Voorbeeld ter illustratie</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 10px" }}>Een overdracht van chatbot naar medewerker</h3>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: PUB.sub, margin: "0 0 12px" }}>
                  Een klantenservice merkt dat vragen van de chatbot binnenkomen zonder de informatie die een medewerker nodig heeft. Het team spreekt af welke gegevens de overdracht minimaal bevat en wie een onvolledige vraag binnen een uur oppakt.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: PUB.sub, margin: 0 }}>
                  Vier weken lang houdt het team bij hoeveel vragen terug moeten naar de klant. Na dertig dagen kijkt het samen terug en stelt de afspraak bij.
                </p>
              </div>
            </Fade>
          </div>
        </section>

        <section style={sectie(PUB.wit)}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={label}>Veelgestelde vragen</div>
            <h2 style={kop}>Vragen over samenwerken met AI</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {faqs.map(([vraag, antwoord]) => (
                <details key={vraag} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 14, padding: "16px 20px" }}>
                  <summary style={{ cursor: "pointer", fontSize: 17, fontWeight: 800, minHeight: 28 }}>{vraag}</summary>
                  <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.75, color: PUB.sub }}>{antwoord}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: PUB.donker, padding: isMobile ? "58px 22px" : "88px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: PUB.tealOpDonker, marginBottom: 12 }}>Kennismaken</div>
            <h2 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.12, color: PUB.wit, margin: "0 0 16px" }}>Bespreek jullie werkproces</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "0 0 28px" }}>
              Welk werkproces verandert bij jullie? In een kennismaking brengen we samen in beeld waar de samenwerking vastloopt en welke eerste werkafspraak je zou kunnen testen.
            </p>
            <button type="button" onClick={() => openVenster("onder")} style={{ ...knop, width: isMobile ? "100%" : "auto" }}>Bespreek jullie werkproces</button>
          </div>
        </section>
      </div>

      <ContactModal isOpen={open} onClose={() => setOpen(false)} bron={BRON} interesse={AI_INTERESSE} extraVraag={EXTRA_VRAAG} />
    </>
  );
}
