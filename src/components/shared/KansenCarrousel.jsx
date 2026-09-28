// Vier kansen, één tegelijk in beeld.
//
// Drie dingen bepalen hoe dit ding werkt.
//
// Het mag niet springen. Alle vier de kansen staan in dezelfde rastercel, dus
// het vak is altijd zo hoog als de langste tekst en de pagina verschuift niet
// onder je vinger vandaan terwijl je leest.
//
// Het mag niet doorlopen terwijl je bezig bent. De klok staat stil zodra je
// muis erin staat, zodra iets erin focus heeft, zodra je hem aanraakt, en
// zodra het tabblad naar de achtergrond gaat. Anders sta je halverwege een zin
// en is de zin weg.
//
// En wie in zijn systeem heeft aangezet dat animaties hem hinderen, krijgt
// geen automatische wisseling en geen overgang. De knoppen blijven werken; het
// scherm verspringt alleen meteen in plaats van te vervagen.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PUB } from "../../styles/tokens";
import { KANSEN, WISSELTIJD, verschuif } from "../../content/kansen";
import { magBewegen } from "../../lib/beweging";

/* Het kompas naast de kans. De naald wijst naar een ander kwart per kans, dus
   hij zegt hetzelfde als de bolletjes eronder -- maar dan als beeld. Puur
   versiering: een schermlezer hoort hem niet, en de bolletjes zijn de echte
   bediening. */
function Kompas({ index, aantal, beweegt }) {
  const hoek = (360 / aantal) * index;

  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <circle cx="60" cy="60" r="52" fill="none" stroke={PUB.lijn} strokeWidth="1.5" />
      <circle cx="60" cy="60" r="38" fill="none" stroke={PUB.lijn} strokeWidth="1" />
      {[0, 90, 180, 270].map((g) => (
        <line
          key={g}
          x1="60" y1="8" x2="60" y2="17"
          stroke={PUB.lijn} strokeWidth="1.5" strokeLinecap="round"
          transform={`rotate(${g} 60 60)`}
        />
      ))}
      <g
        style={{
          transformOrigin: "60px 60px",
          transform: `rotate(${hoek}deg)`,
          transition: beweegt ? "transform .9s cubic-bezier(.22,.61,.36,1)" : "none",
        }}
      >
        <path d="M60 18 L66 62 L60 56 L54 62 Z" fill={PUB.teal} />
        <path d="M60 102 L54 58 L60 64 L66 58 Z" fill={PUB.lijn} />
      </g>
      <circle cx="60" cy="60" r="4.5" fill={PUB.wit} stroke={PUB.teal} strokeWidth="2" />
    </svg>
  );
}

export default function KansenCarrousel({ isMobile = false }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [beweegt, setBeweegt] = useState(true);
  const [stil, setStil] = useState(false);
  const raak = useRef(null);
  const aantal = KANSEN.length;

  useEffect(() => setBeweegt(magBewegen()), []);

  const ga = useCallback((stap) => setIndex((i) => verschuif(i, stap, aantal)), [aantal]);

  // De automatische wisseling. Staat uit bij verminderde beweging, en zodra
  // iemand met de sectie bezig is.
  useEffect(() => {
    if (!beweegt || stil) return undefined;
    const klok = setTimeout(() => ga(1), WISSELTIJD);
    return () => clearTimeout(klok);
  }, [beweegt, stil, index, ga]);

  // Een tabblad op de achtergrond telt ook als niet kijken.
  useEffect(() => {
    const kijk = () => setStil(document.hidden);
    document.addEventListener("visibilitychange", kijk);
    return () => document.removeEventListener("visibilitychange", kijk);
  }, []);

  const toets = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); ga(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); ga(-1); }
  };

  const raakStart = (e) => {
    const t = e.touches[0];
    raak.current = { x: t.clientX, y: t.clientY };
    setStil(true);
  };
  const raakEind = (e) => {
    const start = raak.current;
    raak.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Alleen een duidelijke horizontale veeg telt, anders pakt hij het
    // verticaal scrollen van de pagina af.
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) ga(dx < 0 ? 1 : -1);
  };

  const knopRand = {
    width: 46, height: 46, borderRadius: "50%", display: "inline-flex",
    alignItems: "center", justifyContent: "center", background: PUB.wit,
    border: `1px solid ${PUB.lijn}`, color: PUB.donker, cursor: "pointer",
    padding: 0, transition: "border-color .18s ease, background .18s ease",
  };

  return (
    <section
      id="kansen"
      style={{ background: PUB.wit, padding: isMobile ? "58px 20px" : "96px 60px", borderTop: `1px solid ${PUB.lijn}` }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ maxWidth: "62ch", marginBottom: isMobile ? 28 : 44 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: PUB.teal, marginBottom: 12 }}>Kansen</div>
          <h2 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.12, color: PUB.donker, margin: "0 0 14px" }}>
            Kansen die wij voor teams zien
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: 0 }}>
            In teams zien we vaak mogelijkheden die onder de drukte van het werk verborgen blijven.
            Deze kansen helpen professionals om elkaar beter te vinden en samen meer te bereiken.
          </p>
        </div>

        {/* De carrousel zelf. aria-roledescription vertelt een schermlezer wat
            voor ding dit is; de bolletjes en pijlen eronder zijn de bediening.
            aria-live staat op off zolang hij vanzelf doorloopt -- anders leest
            een schermlezer elke zeven seconden ongevraagd een nieuwe kans voor. */}
        <div
          role="group"
          aria-roledescription="carrousel"
          aria-label="Kansen die wij voor teams zien"
          onKeyDown={toets}
          onMouseEnter={() => setStil(true)}
          onMouseLeave={() => setStil(false)}
          onFocus={() => setStil(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setStil(false); }}
          onTouchStart={raakStart}
          onTouchEnd={raakEind}
        >
          <div
            aria-live={stil ? "polite" : "off"}
            style={{
              display: "grid",
              background: PUB.licht,
              border: `1px solid ${PUB.lijn}`,
              borderRadius: 20,
              padding: isMobile ? "28px 22px" : "48px 56px",
            }}
          >
            {KANSEN.map((kans, i) => {
              const actief = i === index;
              return (
                <div
                  key={kans.id}
                  role="group"
                  aria-roledescription="kans"
                  aria-label={`${i + 1} van ${aantal}`}
                  aria-hidden={actief ? undefined : "true"}
                  style={{
                    gridArea: "1 / 1",
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 168px",
                    gap: isMobile ? 26 : 56,
                    alignItems: "center",
                    opacity: actief ? 1 : 0,
                    visibility: actief ? "visible" : "hidden",
                    transition: beweegt ? "opacity .5s ease" : "none",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                          background: `conic-gradient(${PUB.groen} 0 25%,${PUB.blauw} 25% 50%,${PUB.oranje} 50% 75%,${PUB.paars} 75% 100%)`,
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", color: PUB.teal }}>
                        Inzicht van Mijn Teamkompas
                      </span>
                    </div>

                    <h3 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, lineHeight: 1.2, color: PUB.donker, margin: "0 0 14px" }}>
                      {kans.titel}
                    </h3>
                    <p style={{ fontSize: isMobile ? 16 : 17.5, lineHeight: 1.8, color: PUB.sub, margin: "0 0 24px", maxWidth: "54ch" }}>
                      {kans.tekst}
                    </p>

                    <a
                      href={kans.href}
                      onClick={(e) => { e.preventDefault(); navigate(kans.href); }}
                      tabIndex={actief ? 0 : -1}
                      style={{ fontSize: 15, fontWeight: 700, color: PUB.teal, textDecoration: "none" }}
                    >
                      Bekijk de kans →
                    </a>
                  </div>

                  {!isMobile && (
                    <div style={{ width: 168, height: 168, justifySelf: "end" }}>
                      <Kompas index={index} aantal={aantal} beweegt={beweegt} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bediening. De bolletjes zeggen waar je bent én brengen je ergens
              heen; de pijlen zijn voor wie liever doorklikt. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 22, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {KANSEN.map((kans, i) => (
                <button
                  key={kans.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Kans ${i + 1} van ${aantal}: ${kans.titel}`}
                  aria-current={i === index ? "true" : undefined}
                  style={{
                    width: i === index ? 30 : 10, height: 10, borderRadius: 999,
                    border: 0, padding: 0, cursor: "pointer",
                    background: i === index ? PUB.teal : PUB.lijn,
                    transition: beweegt ? "width .35s ease, background .35s ease" : "none",
                  }}
                />
              ))}
              <span style={{ marginLeft: 8, fontSize: 14, color: PUB.sub }}>
                {index + 1} van {aantal}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => ga(-1)} aria-label="Vorige kans" style={knopRand}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 3 L5 8 L10 13" />
                </svg>
              </button>
              <button type="button" onClick={() => ga(1)} aria-label="Volgende kans" style={knopRand}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 3 L11 8 L6 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
