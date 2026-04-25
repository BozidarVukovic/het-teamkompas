export default function KlantreisKeuze() {
  return (
    <div style={{ padding: "80px 20px", background: "#F7F9FB" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p
            style={{
              color: "#0F766E",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            twee manieren om te starten
          </p>

          <h2
            style={{
              fontSize: "36px",
              lineHeight: 1.15,
              marginBottom: "12px",
              color: "#0D1B2A",
            }}
          >
            kies de route die past bij jouw team
          </h2>

          <p
            style={{
              color: "#5A6B7A",
              fontSize: "18px",
              lineHeight: 1.6,
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            sommige teams willen eerst samen scherp krijgen wat er speelt. andere teams willen direct inzicht krijgen en zelfstandig de eerste stap zetten.
          </p>
        </div>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "stretch" }}>
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              background: "white",
              padding: "32px",
              borderRadius: "18px",
              boxShadow: "0 18px 45px rgba(13, 27, 42, 0.08)",
              border: "1px solid rgba(13, 27, 42, 0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                padding: "7px 12px",
                borderRadius: "999px",
                background: "#EAF7EF",
                color: "#15803D",
                fontWeight: 700,
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              persoonlijke route
            </div>

            <h3 style={{ fontSize: "24px", lineHeight: 1.25, color: "#0D1B2A", marginBottom: "10px" }}>
              samen scherp krijgen wat er speelt
            </h3>

            <p style={{ color: "#5A6B7A", lineHeight: 1.6, marginBottom: "20px" }}>
              voor teams die willen starten met een goed gesprek, verdieping en begeleiding op maat.
            </p>

            <ul style={{ marginTop: "0", marginBottom: "30px", paddingLeft: "20px", color: "#334155", lineHeight: 1.8 }}>
              <li>teamscan en gezamenlijke duiding</li>
              <li>inzicht in gedrag, samenwerking en onderstroom</li>
              <li>gerichte teaminterventie of teamdag</li>
              <li>persoonlijke begeleiding naar concrete vervolgstappen</li>
            </ul>

            <button
              onClick={() => (window.location.href = "/verkennen")}
              style={{
                marginTop: "auto",
                width: "100%",
                background: "#16A34A",
                color: "white",
                border: "none",
                padding: "15px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "16px",
                minHeight: "54px",
              }}
            >
              plan een verkennend gesprek
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: "300px",
              background: "white",
              padding: "32px",
              borderRadius: "18px",
              boxShadow: "0 18px 45px rgba(13, 27, 42, 0.08)",
              border: "1px solid rgba(13, 27, 42, 0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                padding: "7px 12px",
                borderRadius: "999px",
                background: "#EEF4FF",
                color: "#1D4ED8",
                fontWeight: 700,
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              digitale route
            </div>

            <h3 style={{ fontSize: "24px", lineHeight: 1.25, color: "#0D1B2A", marginBottom: "10px" }}>
              direct inzicht met de teamscan
            </h3>

            <p style={{ color: "#5A6B7A", lineHeight: 1.6, marginBottom: "20px" }}>
              voor teams die zelfstandig willen starten en snel overzicht willen krijgen.
            </p>

            <ul style={{ marginTop: "0", marginBottom: "30px", paddingLeft: "20px", color: "#334155", lineHeight: 1.8 }}>
              <li>direct starten met de teamscan</li>
              <li>helder inzicht in wat er speelt</li>
              <li>concreet overzicht van kansen en risico&apos;s</li>
              <li>praktische handvatten voor verbetering</li>
            </ul>

            <p style={{ fontSize: "14px", color: "#7A8A99", lineHeight: 1.6, marginTop: "-12px", marginBottom: "24px" }}>
              je kunt later altijd kiezen voor persoonlijke begeleiding.
            </p>

            <button
              onClick={() => (window.location.href = "/teamscan")}
              style={{
                marginTop: "auto",
                width: "100%",
                background: "#2563EB",
                color: "white",
                border: "none",
                padding: "15px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "16px",
                minHeight: "54px",
              }}
            >
              start digitale teamscan
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "30px", color: "#5A6B7A", fontSize: "16px" }}>
          twijfel je wat past? begin dan met een verkennend gesprek.
        </div>
      </div>
    </div>
  );
}
