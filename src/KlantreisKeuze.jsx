export default function KlantreisKeuze() {
  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#F7F9FB",
        marginTop: "40px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "36px", marginBottom: "12px" }}>
            kies de route die past bij jouw team
          </h2>
          <p style={{ color: "#5A6B7A", fontSize: "18px" }}>
            sommige teams starten met een gesprek, andere willen direct inzicht.
          </p>
        </div>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>

          {/* LINKER BLOK */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <h3>samen scherp krijgen wat er speelt</h3>
            <p style={{ color: "#5A6B7A" }}>
              voor teams die willen starten met inzicht en een goed gesprek
            </p>

            <ul style={{ marginTop: "20px", marginBottom: "30px" }}>
              <li>teamscan + analyse</li>
              <li>inzichten in gedrag en samenwerking</li>
              <li>gerichte interventies</li>
              <li>persoonlijke begeleiding</li>
            </ul>

            <button
              onClick={() => (window.location.href = "/verkennen")}
              style={{
                marginTop: "auto",
                background: "#16A34A",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                minHeight: "52px",
              }}
            >
              plan een verkennend gesprek
            </button>
          </div>

          {/* RECHTER BLOK */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <h3>direct inzicht met de teamscan</h3>
            <p style={{ color: "#5A6B7A" }}>
              voor teams die zelfstandig willen starten en snel overzicht willen krijgen
            </p>

            <ul style={{ marginTop: "20px", marginBottom: "30px" }}>
              <li>direct starten</li>
              <li>helder inzicht in wat er speelt</li>
              <li>overzicht van kansen en risico’s</li>
              <li>praktische vervolgstappen</li>
            </ul>

            <button
              onClick={() => (window.location.href = "/teamscan")}
              style={{
                marginTop: "auto",
                background: "#2563EB",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                minHeight: "52px",
              }}
            >
              start digitale teamscan
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}