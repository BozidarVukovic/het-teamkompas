import { Helmet } from "react-helmet-async";
import KompasDot from "../../components/shared/KompasDot";
import { PUB } from "../../styles/tokens";

export default function Teamontwikkeling() {
  return (
    <>
      <Helmet>
        <title>Teamontwikkeling voor betere samenwerking | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Mijn Teamkompas helpt teams om samenwerking, leiderschap en eigenaarschap te versterken met teamscan, teamcoaching en praktische teamontwikkeling."
        />
      </Helmet>

      <main
        style={{
          minHeight: "100vh",
          background: PUB.bg,
          color: PUB.navy,
          fontFamily:
            'Roboto, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <section
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "96px 24px 56px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              color: PUB.teal,
              fontWeight: 800,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              fontSize: 13,
            }}
          >
            <KompasDot size={22} />
            Teamontwikkeling
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 76px)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              margin: 0,
              maxWidth: 900,
            }}
          >
            Sterkere teams beginnen met beter begrijpen wat er speelt.
          </h1>

          <p
            style={{
              fontSize: 22,
              lineHeight: 1.55,
              color: PUB.muted,
              maxWidth: 820,
              marginTop: 28,
              marginBottom: 40,
            }}
          >
            Mijn Teamkompas helpt teams om samenwerking, leiderschap en
            eigenaarschap te versterken. Niet met losse heidagen, maar met
            inzicht in gedrag, veiligheid, motivatie en de dagelijkse praktijk.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a
              href="/teamscan"
              style={{
                background: PUB.teal,
                color: "white",
                padding: "15px 22px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 800,
                boxShadow: "0 14px 35px rgba(15,118,110,.22)",
              }}
            >
              Start met de teamscan
            </a>

            <a
              href="/"
              style={{
                background: "white",
                color: PUB.navy,
                padding: "15px 22px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 800,
                border: `1px solid ${PUB.border}`,
              }}
            >
              Terug naar home
            </a>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "24px 24px 96px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {[
            {
              titel: "Samenwerking zichtbaar maken",
              tekst:
                "Breng in kaart waar het team soepel samenwerkt en waar patronen, aannames of onuitgesproken verwachtingen de samenwerking vertragen.",
            },
            {
              titel: "Leiderschap versterken",
              tekst:
                "Onderzoek hoe veilig, duidelijk en verbindend leiderschap wordt ervaren en welke kleine interventies direct verschil kunnen maken.",
            },
            {
              titel: "Energie en motivatie begrijpen",
              tekst:
                "Kijk niet alleen naar werkdruk, maar ook naar energiebronnen, eigenaarschap en wat mensen nodig hebben om goed werk te doen.",
            },
            {
              titel: "Verbeteren en leren borgen",
              tekst:
                "Vertaal inzichten naar praktische afspraken, feedforward en een ritme waarin teams blijven leren in het dagelijks werk.",
            },
          ].map((blok) => (
            <article
              key={blok.titel}
              style={{
                background: "white",
                border: `1px solid ${PUB.border}`,
                borderRadius: 28,
                padding: 28,
                boxShadow: "0 18px 45px rgba(15,23,42,.06)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 12,
                  fontSize: 22,
                  letterSpacing: "-0.03em",
                }}
              >
                {blok.titel}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: PUB.muted,
                  lineHeight: 1.65,
                  fontSize: 16,
                }}
              >
                {blok.tekst}
              </p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}