import { forwardRef, useImperativeHandle, useState, useEffect } from "react";

const GA_ID = "G-X2NTBTFQME";

function loadGA() {
  if (window.__ga_loaded) return;
  window.__ga_loaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

const CookieBanner = forwardRef(function CookieBanner(props, ref) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    } else if (consent === "accepted") {
      loadGA();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
  }));

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    loadGA();
    setVisible(false);
  }

  function reject() {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#0D1B2A",
      color: "#fff",
      padding: "20px 32px",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
      boxShadow: "0 -4px 24px rgba(0,0,0,0.30)",
      borderTop: "2px solid #00A896",
    }}>
      <p style={{
        margin: 0,
        fontSize: 14,
        lineHeight: 1.6,
        color: "rgba(255,255,255,0.85)",
        flex: 1,
        minWidth: 240,
      }}>
        Wij gebruiken cookies om het gebruik van onze website te analyseren (Google Analytics).
        Zie onze{" "}
        <span
          onClick={() => window.open("/privacyverklaring_mijnteamkompas.pdf", "_blank")}
          style={{ color: "#00A896", cursor: "pointer", textDecoration: "underline" }}
        >
          privacyverklaring
        </span>
        {" "}voor meer informatie.
      </p>
      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <button
          onClick={reject}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.30)",
            color: "rgba(255,255,255,0.75)",
            padding: "8px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "inherit",
          }}
        >
          Alleen noodzakelijk
        </button>
        <button
          onClick={accept}
          style={{
            background: "#00A896",
            border: "none",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
        >
          Accepteren
        </button>
      </div>
    </div>
  );
});

export default CookieBanner;
