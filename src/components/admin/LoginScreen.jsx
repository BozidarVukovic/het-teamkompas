import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { ADM } from "../../styles/tokens";
export default function LoginScreen({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Vul e-mailadres en wachtwoord in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      if (!ADMIN_EMAILS.includes(cred.user.email || "")) {
        await signOut(auth);
        setError("Je hebt geen toegang tot de beheeromgeving.");
        return;
      }

      onLogin();
    } catch (err) {
      const code = err?.code || "";

      setError(
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Onjuist e-mailadres of wachtwoord."
          : code === "auth/too-many-requests"
          ? "Te veel pogingen. Probeer later opnieuw."
          : "Inloggen mislukt. Probeer opnieuw."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ADM.navyDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle,rgba(0,168,150,0.04) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, display: "flex" }}>
        {[PUB.groen, ADM.teal, PUB.oranje, PUB.paars].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div
        style={{
          width: 400,
          background: ADM.navy,
          borderRadius: 16,
          padding: "40px 36px",
          border: `1px solid ${ADM.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: ADM.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 14px",
              boxShadow: "0 0 24px rgba(0,168,150,0.4)",
            }}
          >
            🧭
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: ADM.white, marginBottom: 4 }}>
            Mijn Teamkompas
          </div>
          <div style={{ fontSize: 12, color: ADM.muted }}>
            Beheeromgeving, alleen voor beheerders
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: ADM.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
            E-mailadres
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="bozidar@mijnteamkompas.nl"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${ADM.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: ADM.white,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: ADM.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
            Wachtwoord
          </div>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${ADM.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: ADM.white,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {error && (
          <div style={{ color: ADM.red, fontSize: 12, textAlign: "center", marginBottom: 14 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#007d70" : ADM.teal,
            color: ADM.navyDeep,
            border: "none",
            borderRadius: 8,
            padding: "12px",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? "wait" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "Inloggen..." : "Inloggen →"}
        </button>
        <div
          onClick={onBack}
          style={{ textAlign: "center", fontSize: 12, color: ADM.muted, cursor: "pointer" }}
        >
          ← Terug naar de website
        </div>
      </div>
    </div>
  );
}