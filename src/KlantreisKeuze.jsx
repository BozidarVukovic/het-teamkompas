export default function KlantreisKeuze() {
  const routes = [
    {
      title: "samen scherp krijgen wat er speelt",
      description: "voor teams die willen starten met inzicht en een goed gesprek",
      items: [
        "teamscan + analyse",
        "inzichten in gedrag en samenwerking",
        "gerichte interventies",
        "persoonlijke begeleiding",
      ],
      href: "/verkennen",
      button: "plan een verdiepend gesprek",
      variant: "primary",
    },
    {
      title: "direct inzicht met de teamscan",
      description: "voor teams die zelfstandig willen starten en snel overzicht willen krijgen",
      items: [
        "direct starten",
        "helder inzicht in wat er speelt",
        "overzicht van kansen en risico’s",
        "praktische vervolgstappen",
      ],
      href: "/teamscan",
      button: "start de digitale teamscan",
      variant: "secondary",
    },
  ];

  const buttonStyles = {
    primary: {
      background: "#E8821A",
      color: "#0D1B2A",
      boxShadow: "0 16px 34px rgba(232, 130, 26, 0.22)",
    },
    secondary: {
      background: "#0D1B2A",
      color: "#FFFFFF",
      boxShadow: "0 16px 34px rgba(13, 27, 42, 0.18)",
    },
  };

  return (
    <section
      aria-labelledby="klantreis-keuze-title"
      style={{
        padding: "72px 20px 88px",
        background: "#F7F9FB",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", margin: "0 auto 40px", maxWidth: "760px" }}>
          <h2
            id="klantreis-keuze-title"
            style={{
              color: "#0D1B2A",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              margin: "0 0 14px",
            }}
          >
            kies de route die past bij jouw team
          </h2>
          <p style={{ color: "#5A6B7A", fontSize: "18px", lineHeight: 1.7, margin: 0 }}>
            sommige teams starten met een gesprek, andere willen direct inzicht.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          {routes.map((route) => (
            <article
              key={route.title}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8EEF3",
                padding: "34px",
                borderRadius: "18px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 22px 55px rgba(13, 27, 42, 0.08)",
                minHeight: "360px",
              }}
            >
              <h3 style={{ color: "#0D1B2A", fontSize: "24px", lineHeight: 1.2, margin: "0 0 18px" }}>
                {route.title}
              </h3>
              <p style={{ color: "#5A6B7A", fontSize: "17px", lineHeight: 1.65, margin: 0 }}>
                {route.description}
              </p>

              <ul style={{ color: "#0D1B2A", margin: "28px 0 34px", paddingLeft: "22px", lineHeight: 1.7, fontSize: "16px" }}>
                {route.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <a
                href={route.href}
                style={{
                  ...buttonStyles[route.variant],
                  marginTop: "auto",
                  border: "none",
                  padding: "16px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 850,
                  minHeight: "56px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                {route.button}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
