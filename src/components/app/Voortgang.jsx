// Hoe compleet is je profiel — als balk, met de drie onderdelen eronder.
//
// Dezelfde component op het startscherm en boven aan je profiel, zodat het
// getal overal gelijk is en je ziet dat je opschiet.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { bepaalVoortgang, voortgangInEenZin } from "../../lib/app/voortgang";

function Balk({ percentage, hoog = 10 }) {
  return (
    <div
      style={{
        height: hoog,
        borderRadius: 999,
        background: "rgba(255,255,255,0.09)",
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Hoe compleet je profiel is"
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(percentage === 0 ? 0 : 3, percentage)}%`,
          borderRadius: 999,
          background: "linear-gradient(90deg, var(--tk-teal), #4fd1c5)",
          transition: "width .35s ease",
        }}
      />
    </div>
  );
}

function Onderdeel({ onderdeel }) {
  const klaar = onderdeel.aantal >= onderdeel.van;
  const deel = onderdeel.van === 0 ? 0 : Math.round((onderdeel.aantal / onderdeel.van) * 100);

  return (
    <div style={{ padding: "12px 0", borderTop: "1px solid var(--tk-lijn)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span aria-hidden="true" style={{ color: klaar ? "var(--tk-teal)" : "var(--tk-zacht)", fontSize: 14 }}>
          {klaar ? "✓" : "○"}
        </span>
        <strong style={{ fontSize: 15 }}>{onderdeel.label}</strong>
        <span className="tk-fijn" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
          {onderdeel.aantal} van {onderdeel.van}
        </span>
      </div>
      <Balk percentage={deel} hoog={6} />
      <p className="tk-fijn" style={{ margin: "8px 0 0" }}>{onderdeel.uitleg}</p>
    </div>
  );
}

export default function Voortgang({ variant = "groot", toonOnderdelen = true }) {
  const { kenmerken, actiefTeam, handleiding } = useApp();
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding });

  return (
    <div className="tk-kaart">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Je profiel</h2>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 26,
            fontWeight: 800,
            color: voortgang.compleet ? "var(--tk-teal)" : "var(--tk-tekst)",
            lineHeight: 1,
          }}
        >
          {voortgang.percentage}%
        </span>
      </div>

      <Balk percentage={voortgang.percentage} />

      <p className="tk-fijn" style={{ margin: "10px 0 0" }}>{voortgangInEenZin(voortgang)}</p>

      {toonOnderdelen && (
        <div style={{ marginTop: 8 }}>
          {voortgang.onderdelen.map((o) => (
            <Onderdeel key={o.id} onderdeel={o} />
          ))}
        </div>
      )}

      {voortgang.volgende && variant === "groot" && (
        <div className="tk-knoppen" style={{ marginTop: 16 }}>
          <Link
            className="tk-knop tk-knop-klein"
            to={voortgang.volgende.naar}
            style={{ textDecoration: "none" }}
          >
            {voortgang.volgende.knop}
          </Link>
        </div>
      )}

      {voortgang.compleet && variant === "groot" && (
        <p className="tk-fijn" style={{ marginTop: 14, marginBottom: 0 }}>
          Wil je verder? Een hand-in-handleiding is optioneel, maar maakt het advies persoonlijker.
          Je hebt er {voortgang.handleidingSecties} van de {voortgang.handleidingVan} geschreven.{" "}
          <Link to="/app/handleiding" style={{ color: "var(--tk-teal)" }}>
            Naar mijn handleiding
          </Link>
        </p>
      )}
    </div>
  );
}
