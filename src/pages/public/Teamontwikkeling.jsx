import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import KompasDot from "../../components/shared/KompasDot";
import { db } from "../../lib/firebase";
import { PUB } from "../../styles/tokens";

export default function Teamontwikkeling() {
    const registreerEvent = async (event) => {
  try {
    await addDoc(collection(db, "teamscanEvents"), {
      event,
      pagina: "teamontwikkeling",
      url: window.location.href,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Funnel-event niet opgeslagen", error);
  }
  };

  useEffect(() => {
    registreerEvent("teamontwikkeling_bekeken");
  }, []);
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
              onClick={() => registreerEvent("teamontwikkeling_teamscan_click")}
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
              onClick={() => registreerEvent("teamontwikkeling_home_click")}
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
        <section
  style={{
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 24px 96px",
  }}
>
  <div
    style={{
      background: PUB.navy,
      color: "white",
      borderRadius: 34,
      padding: "42px 36px",
      boxShadow: "0 24px 70px rgba(15,23,42,.18)",
    }}
  >
    <p
      style={{
        margin: "0 0 14px",
        color: PUB.teal,
        fontWeight: 800,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        fontSize: 13,
      }}
    >
      Voor wie
    </p>

    <h2
      style={{
        margin: 0,
        fontSize: "clamp(30px, 4vw, 48px)",
        lineHeight: 1.05,
        letterSpacing: "-0.05em",
        maxWidth: 820,
      }}
    >
      Voor teams die voelen dat er meer mogelijk is, maar nog niet precies weten waar te beginnen.
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 18,
        marginTop: 34,
      }}
    >
      {[
        "Teams waarin samenwerking stroever loopt dan nodig is.",
        "Leidinggevenden die meer eigenaarschap en openheid willen stimuleren.",
        "Teams die veel veranderen en behoefte hebben aan rust, richting en duidelijkheid.",
        "Organisaties die een teamdag willen die niet losstaat van de dagelijkse praktijk.",
      ].map((item) => (
        <div
          key={item}
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 22,
            padding: 22,
            color: "rgba(255,255,255,.86)",
            lineHeight: 1.55,
            fontSize: 16,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>
</section>
<section
  style={{
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 24px 96px",
  }}
>
  <div
    style={{
      background: "white",
      border: `1px solid ${PUB.border}`,
      borderRadius: 34,
      padding: "42px 36px",
      boxShadow: "0 22px 60px rgba(15,23,42,.07)",
      display: "grid",
      gridTemplateColumns: "minmax(260px, .9fr) minmax(280px, 1.1fr)",
      gap: 34,
      alignItems: "center",
    }}
  >
    <div>
      <p
        style={{
          margin: "0 0 14px",
          color: PUB.teal,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          fontSize: 13,
        }}
      >
        Eerste stap
      </p>

      <h2
        style={{
          margin: 0,
          fontSize: "clamp(30px, 4vw, 48px)",
          lineHeight: 1.05,
          letterSpacing: "-0.05em",
        }}
      >
        De teamscan maakt zichtbaar waar het gesprek echt over moet gaan.
      </h2>

      <p
        style={{
          color: PUB.muted,
          lineHeight: 1.65,
          fontSize: 17,
          marginTop: 18,
        }}
      >
        Veel teams weten dat er iets schuurt, maar vinden het lastig om scherp te
        maken wat dat precies is. De teamscan brengt signalen samen tot een
        gedeeld beeld, zodat een vervolgstap niet op gevoel maar op inzicht wordt
        gekozen.
      </p>

      <a
        href="/teamscan"
        onClick={() => registreerEvent("teamontwikkeling_teamscan_click")}
        style={{
          display: "inline-flex",
          marginTop: 22,
          background: PUB.teal,
          color: "white",
          padding: "14px 20px",
          borderRadius: 999,
          textDecoration: "none",
          fontWeight: 900,
          boxShadow: "0 14px 35px rgba(15,118,110,.20)",
        }}
      >
        Start met de teamscan
      </a>
    </div>

    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      {[
        {
          label: "Samenwerking",
          tekst: "Waar loopt het soepel en waar ontstaan misverstanden?",
        },
        {
          label: "Veiligheid en leiderschap",
          tekst: "Wordt er open gesproken en ervaren mensen voldoende richting?",
        },
        {
          label: "Energie en motivatie",
          tekst: "Wat geeft energie en wat kost op dit moment het meeste?",
        },
        {
          label: "Leren en verbeteren",
          tekst: "Hoe goed lukt het om samen te leren van de dagelijkse praktijk?",
        },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            border: `1px solid ${PUB.border}`,
            borderRadius: 22,
            padding: 20,
            background: "rgba(248,250,252,.9)",
          }}
        >
          <div
            style={{
              fontWeight: 900,
              color: PUB.navy,
              marginBottom: 6,
              fontSize: 17,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              color: PUB.muted,
              lineHeight: 1.55,
              fontSize: 15,
            }}
          >
            {item.tekst}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
<section
  style={{
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 24px 96px",
  }}
>
  <p
    style={{
      margin: "0 0 14px",
      color: PUB.teal,
      fontWeight: 800,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      fontSize: 13,
    }}
  >
    Onze aanpak
  </p>

  <h2
    style={{
      margin: 0,
      fontSize: "clamp(32px, 5vw, 56px)",
      lineHeight: 1.05,
      letterSpacing: "-0.05em",
      maxWidth: 850,
    }}
  >
    Van losse signalen naar een gedeeld beeld en concrete beweging.
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: 18,
      marginTop: 34,
    }}
  >
    {[
      {
        stap: "01",
        titel: "Meten wat er speelt",
        tekst:
          "We starten met de teamscan. Die maakt zichtbaar hoe het team kijkt naar veiligheid, leiderschap, motivatie, verandering en leren.",
      },
      {
        stap: "02",
        titel: "Betekenis geven",
        tekst:
          "We vertalen de uitkomsten naar herkenbare patronen. Niet om te oordelen, maar om samen taal te geven aan wat vaak onder de oppervlakte blijft.",
      },
      {
        stap: "03",
        titel: "Beweging ontwerpen",
        tekst:
          "Daarna ontwerpen we een teamsessie, workshop of traject dat past bij de situatie, het team en de veranderopgave.",
      },
      {
        stap: "04",
        titel: "Borgen in gedrag",
        tekst:
          "De opbrengst wordt vertaald naar kleine afspraken, feedforward en ritme in het dagelijks werk. Zo blijft teamontwikkeling geen losse interventie.",
      },
    ].map((item) => (
      <article
        key={item.stap}
        style={{
          background: "white",
          border: `1px solid ${PUB.border}`,
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 18px 45px rgba(15,23,42,.06)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "rgba(15,118,110,.10)",
            color: PUB.teal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            marginBottom: 18,
          }}
        >
          {item.stap}
        </div>

        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 22,
            letterSpacing: "-0.03em",
          }}
        >
          {item.titel}
        </h3>

        <p
          style={{
            margin: 0,
            color: PUB.muted,
            lineHeight: 1.65,
            fontSize: 16,
          }}
        >
          {item.tekst}
        </p>
      </article>
    ))}
  </div>
</section>

<section
  style={{
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 24px 110px",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(260px, .8fr) minmax(280px, 1.2fr)",
      gap: 28,
      alignItems: "start",
    }}
  >
    <div>
      <p
        style={{
          margin: "0 0 14px",
          color: PUB.teal,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          fontSize: 13,
        }}
      >
        Veelgestelde vragen
      </p>

      <h2
        style={{
          margin: 0,
          fontSize: "clamp(30px, 4vw, 48px)",
          lineHeight: 1.05,
          letterSpacing: "-0.05em",
        }}
      >
        Eerst begrijpen, dan pas bewegen.
      </h2>

      <p
        style={{
          color: PUB.muted,
          lineHeight: 1.65,
          fontSize: 17,
          marginTop: 18,
        }}
      >
        Teamontwikkeling werkt beter als een team zichzelf herkent in de analyse.
        Daarom starten we klein, concreet en dicht bij het dagelijks werk.
      </p>
    </div>

    <div style={{ display: "grid", gap: 14 }}>
      {[
        {
          vraag: "Is dit hetzelfde als een teamdag?",
          antwoord:
            "Nee. Een teamdag kan onderdeel zijn van de aanpak, maar we starten eerst met inzicht. Daardoor wordt een teamdag gerichter en concreter.",
        },
        {
          vraag: "Moet iedereen in het team meedoen?",
          antwoord:
            "Bij voorkeur wel. Teamontwikkeling wordt sterker als verschillende perspectieven zichtbaar worden, inclusief die van de leidinggevende.",
        },
        {
          vraag: "Wat levert de teamscan op?",
          antwoord:
            "De teamscan geeft een gedeeld beeld van samenwerking, veiligheid, motivatie, veranderbeleving en leren. Dat vormt de basis voor een passende vervolgstap.",
        },
        {
          vraag: "Kunnen we klein beginnen?",
          antwoord:
            "Ja. Juist klein beginnen werkt vaak het beste. Een eerste scan of verkennend gesprek kan al veel richting geven.",
        },
      ].map((item) => (
        <details
          key={item.vraag}
          style={{
            background: "white",
            border: `1px solid ${PUB.border}`,
            borderRadius: 22,
            padding: "20px 22px",
            boxShadow: "0 14px 35px rgba(15,23,42,.05)",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 18,
              color: PUB.navy,
            }}
          >
            {item.vraag}
          </summary>
          <p
            style={{
              margin: "14px 0 0",
              color: PUB.muted,
              lineHeight: 1.65,
              fontSize: 16,
            }}
          >
            {item.antwoord}
          </p>
        </details>
      ))}
    </div>
  </div>

  <div
    style={{
      marginTop: 42,
      background: "white",
      border: `1px solid ${PUB.border}`,
      borderRadius: 30,
      padding: 34,
      display: "flex",
      justifyContent: "space-between",
      gap: 24,
      alignItems: "center",
      flexWrap: "wrap",
      boxShadow: "0 20px 50px rgba(15,23,42,.07)",
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: 30,
          letterSpacing: "-0.04em",
        }}
      >
        Wil je weten waar jouw team kan groeien?
      </h2>
      <p
        style={{
          margin: "10px 0 0",
          color: PUB.muted,
          fontSize: 17,
          lineHeight: 1.55,
        }}
      >
        Start met de teamscan of plan eerst een verkennend gesprek.
      </p>
    </div>

    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <a
        href="/teamscan"
        onClick={() => registreerEvent("teamontwikkeling_teamscan_click")}
        style={{
          background: PUB.teal,
          color: "white",
          padding: "14px 20px",
          borderRadius: 999,
          textDecoration: "none",
          fontWeight: 900,
        }}
      >
        Start met de teamscan
      </a>

      <a
        href="/"
        onClick={() => registreerEvent("teamontwikkeling_home_click")}
        style={{
          background: "white",
          color: PUB.navy,
          padding: "14px 20px",
          borderRadius: 999,
          textDecoration: "none",
          fontWeight: 900,
          border: `1px solid ${PUB.border}`,
        }}
      >
        Naar de homepage
      </a>
    </div>
  </div>
</section>
      </main>
    </>
  );
}