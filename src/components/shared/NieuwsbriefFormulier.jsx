import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function NieuwsbriefFormulier({ variant = "blog" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const isFooter = variant === "footer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await addDoc(collection(db, "nieuwsbriefAanmeldingen"), {
        email,
        aangemeld_op: serverTimestamp(),
        bron: variant,
      });
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{
        background: isFooter ? "rgba(255,255,255,0.08)" : "#f0faf8",
        border: isFooter ? "1px solid rgba(255,255,255,0.12)" : "1px solid #b2e4d8",
        borderRadius: 12,
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
        <p style={{ margin: 0, fontWeight: 700, color: isFooter ? "#fff" : "#0F766E", fontSize: 15 }}>
          Aanmelding ontvangen
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: isFooter ? "rgba(255,255,255,0.6)" : "#5F6B7A" }}>
          Je ontvangt nieuwe inzichten zodra we publiceren.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: isFooter ? "rgba(255,255,255,0.06)" : "#f8fffe",
      border: isFooter ? "1px solid rgba(255,255,255,0.1)" : "1px solid #d1ede8",
      borderRadius: 12,
      padding: isFooter ? "20px 24px" : "24px 28px",
    }}>
      {!isFooter && (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0F766E", margin: "0 0 6px" }}>
            Nieuwsbrief
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", margin: "0 0 6px" }}>
            Nieuwe inzichten in je inbox
          </p>
          <p style={{ fontSize: 14, color: "#5F6B7A", margin: "0 0 16px", lineHeight: 1.6 }}>
            Ontvang nieuwe artikelen over teamontwikkeling, psychologische veiligheid en leiderschap.
          </p>
        </>
      )}
      {isFooter && (
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>
          Nieuwe inzichten in je inbox
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          placeholder="naam@organisatie.nl"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "10px 14px",
            borderRadius: 8,
            border: status === "error" ? "1.5px solid #DC2626" : isFooter ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #d1ede8",
            background: isFooter ? "rgba(255,255,255,0.08)" : "#fff",
            color: isFooter ? "#fff" : "#0D1B2A",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            background: "#0F766E",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: 14,
            cursor: status === "sending" ? "wait" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {status === "sending" ? "Aanmelden..." : "Aanmelden"}
        </button>
      </form>
      {status === "error" && (
        <p style={{ fontSize: 12, color: "#DC2626", margin: "6px 0 0" }}>
          Vul een geldig e-mailadres in.
        </p>
      )}
      <p style={{ fontSize: 11, color: isFooter ? "rgba(255,255,255,0.35)" : "#9aabb8", margin: "8px 0 0" }}>
        Geen spam. Afmelden kan altijd.
      </p>
    </div>
  );
}
