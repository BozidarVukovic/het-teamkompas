// De volgende stap, op elk scherm hetzelfde.
//
// Groot op het startscherm, klein onderaan de andere pagina's. Zo eindigt geen
// enkel scherm in het niets: ben je klaar met invullen, dan staat er onderaan
// wat er nu logisch is en hoe je daar komt.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { AANTAL_STAPPEN, bepaalVolgendeStap } from "../../lib/app/volgendeStap";
import useActie from "./useActie";
import Melding from "./Melding";

function Stippen({ nu }) {
  if (nu > AANTAL_STAPPEN) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {Array.from({ length: AANTAL_STAPPEN }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            width: i + 1 === nu ? 22 : 8,
            height: 8,
            borderRadius: 999,
            background: i + 1 <= nu ? "var(--tk-teal)" : "rgba(255,255,255,0.16)",
            transition: "width .2s",
          }}
        />
      ))}
      <span className="tk-fijn" style={{ marginLeft: 6 }}>
        Stap {nu} van {AANTAL_STAPPEN}
      </span>
    </div>
  );
}

export default function VolgendeStap({ variant = "klein", verbergAls = null }) {
  const {
    gebruiker,
    kenmerken,
    actiefTeam,
    teamOverzicht,
    bewaarMeerKenmerken,
  } = useApp();

  const { bezig, melding, voerUit, wisMelding } = useActie();
  const [gekopieerd, setGekopieerd] = useState(false);

  const stap = bepaalVolgendeStap({
    kenmerken,
    actiefTeam,
    leden: teamOverzicht.leden,
    gedeeldPerUid: teamOverzicht.gedeeld,
    eigenUid: gebruiker && gebruiker.uid,
    teamcode: teamOverzicht.team && teamOverzicht.team.code,
    extraProfielen: (teamOverzicht.profielleden || []).length,
  });

  // Op de pagina waar de stap toch al naartoe wijst, voegt hij niets toe.
  if (verbergAls && verbergAls === stap.id) return null;
  if (teamOverzicht.laden && variant === "groot") {
    return (
      <div className="tk-kaart">
        <p style={{ marginBottom: 0 }}>Even kijken waar je gebleven was...</p>
      </div>
    );
  }

  const deelAlles = async () => {
    const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;
    const bruikbaar = kenmerken.filter((k) => k.waarde && k.bevestigd !== "nee");
    if (!sleutel || bruikbaar.length === 0) return;
    await voerUit("alles delen met je team", () =>
      bewaarMeerKenmerken(
        bruikbaar.map((k) => ({
          ...k,
          gedeeldMet: [...new Set([...(k.gedeeldMet || []), sleutel])],
        }))
      )
    );
  };

  const kopieer = async () => {
    if (!stap.code) return;
    try {
      await navigator.clipboard.writeText(stap.code);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch {
      /* kopiëren mag niet altijd; de code staat er zichtbaar bij */
    }
  };

  const knop = stap.naar ? (
    <Link className="tk-knop" to={stap.naar} style={{ textDecoration: "none", display: "inline-block" }}>
      {stap.knop}
    </Link>
  ) : (
    <button type="button" className="tk-knop" onClick={deelAlles} disabled={bezig}>
      {bezig ? "Bezig..." : stap.knop}
    </button>
  );

  if (variant === "groot") {
    return (
      <div className="tk-advies" style={{ marginBottom: 26 }}>
        <Stippen nu={stap.nummer} />
        <h2 style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.25 }}>{stap.kop}</h2>
        <p style={{ color: "var(--tk-zacht)", lineHeight: 1.7, margin: "0 0 18px" }}>{stap.uitleg}</p>

        {stap.code && (
          <div style={{ marginBottom: 18 }}>
            <div className="tk-label" style={{ marginBottom: 6 }}>Teamcode</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span className="tk-code">{stap.code}</span>
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={kopieer}>
                {gekopieerd ? "Gekopieerd" : "Kopieer"}
              </button>
            </div>
          </div>
        )}

        {knop}

        {stap.tweede && (
          <div style={{ marginTop: 12 }}>
            <Link to={stap.tweede.naar} className="tk-fijn" style={{ color: "var(--tk-teal)" }}>
              {stap.tweede.label}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="tk-kaart"
      style={{ borderColor: "rgba(0,168,150,0.35)", background: "var(--tk-navy-3)", marginTop: 26 }}
    >
      <div className="tk-label" style={{ color: "var(--tk-teal)", marginBottom: 8 }}>
        {stap.klaar ? "Zo werkt het verder" : `Volgende stap · ${stap.nummer} van ${AANTAL_STAPPEN}`}
      </div>
      <h2 style={{ margin: "0 0 6px" }}>{stap.kop}</h2>
      <p>{stap.kort}</p>

      {stap.code && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
          <span className="tk-code">{stap.code}</span>
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={kopieer}>
            {gekopieerd ? "Gekopieerd" : "Kopieer"}
          </button>
        </div>
      )}

      <div className="tk-knoppen">{knop}</div>
      <Melding melding={melding} onSluiten={wisMelding} />
    </div>
  );
}
