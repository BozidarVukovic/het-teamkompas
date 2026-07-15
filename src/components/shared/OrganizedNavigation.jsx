import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KompasDot from "./KompasDot";

const NAVY = "#0D1B2A";
const TEAL = "#00A896";

const diensten = [
  ["Teamscan", "/teamscan"],
  ["Teamontwikkeling", "/teamontwikkeling"],
  ["Teamcoaching", "/teamcoaching"],
  ["Teamdag", "/teamdag"],
  ["Sprekers", "/sprekers"],
];

const kennis = [
  ["Blog", "/blog"],
  ["Psychologische veiligheid", "/psychologische-veiligheid"],
];

function isStaticPage(path) {
  return path === "/sprekers" || path.startsWith("/sprekers/");
}

function Dropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const closeMenu = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div style={{ position: "relative" }} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{
          border: 0,
          background: "transparent",
          color: open ? TEAL : "rgba(255,255,255,0.76)",
          fontSize: 14,
          fontWeight: 600,
          padding: "21px 4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {label}
        <span style={{ fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 55,
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 235,
            padding: 8,
            background: "rgba(13,27,42,0.99)",
            border: "1px solid rgba(0,168,150,0.24)",
            borderRadius: 12,
            boxShadow: "0 18px 45px rgba(0,0,0,0.34)",
          }}
        >
          {items.map(([itemLabel, path]) => (
            <a
              key={path}
              href={path}
              onClick={(event) => {
                event.preventDefault();
                setOpen(false);
                if (isStaticPage(path)) {
                  window.location.assign(path);
                } else {
                  navigate(path);
                }
              }}
              style={{
                display: "block",
                padding: "11px 13px",
                color: "rgba(255,255,255,0.78)",
                textDecoration: "none",
                fontSize: 14,
                borderRadius: 8,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(0,168,150,0.12)";
                event.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
                event.currentTarget.style.color = "rgba(255,255,255,0.78)";
              }}
            >
              {itemLabel}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileGroup({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "15px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: 0,
          background: "transparent",
          color: "rgba(255,255,255,0.85)",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {label}<span style={{ color: TEAL }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 12px 10px" }}>
          {items.map(([itemLabel, path]) => (
            <a
              key={path}
              href={path}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(path);
              }}
              style={{ display: "block", padding: "11px 18px", color: "rgba(255,255,255,0.68)", textDecoration: "none", fontSize: 14 }}
            >
              {itemLabel}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizedNavigation() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 960);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const go = (path) => {
    setMenuOpen(false);
    if (isStaticPage(path)) {
      window.location.assign(path);
    } else {
      navigate(path);
    }
  };

  const simpleLink = {
    color: "rgba(255,255,255,0.76)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <>
      <header style={{ position: "fixed", inset: "0 0 auto 0", height: 64, zIndex: 1000, background: "rgba(13,27,42,0.985)", borderBottom: "1px solid rgba(0,168,150,0.2)", backdropFilter: "blur(12px)" }}>
        <nav style={{ height: "100%", padding: mobile ? "0 20px" : "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 22 }} aria-label="Hoofdnavigatie">
          <a href="/" onClick={(event) => { event.preventDefault(); go("/"); }} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "#fff", fontSize: 18, fontWeight: 650, whiteSpace: "nowrap" }}>
            <KompasDot size={22} />
            Mijn Teamkompas
          </a>

          {mobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/verkennen" onClick={(event) => { event.preventDefault(); go("/verkennen"); }} style={{ background: "#F4F7F9", color: NAVY, padding: "8px 12px", borderRadius: 999, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Kennismaken</a>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu openen" style={{ border: 0, background: "transparent", color: "rgba(255,255,255,0.8)", fontSize: 23, cursor: "pointer", padding: 4 }}>{menuOpen ? "✕" : "☰"}</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Dropdown label="Diensten" items={diensten} />
              <a href="/onze-aanpak" onClick={(event) => { event.preventDefault(); go("/onze-aanpak"); }} style={simpleLink}>Onze aanpak</a>
              <Dropdown label="Kennis" items={kennis} />
              <a href="/#over-ons" onClick={(event) => { event.preventDefault(); if (window.location.pathname === "/") { const el = document.getElementById("over-ons"); if (el) { el.scrollIntoView({ behavior: "smooth" }); } else { window.location.href = "/#over-ons"; } } else { window.location.href = "/#over-ons"; } }} style={simpleLink}>Over ons</a>
              <a href="/verkennen" onClick={(event) => { event.preventDefault(); go("/verkennen"); }} style={{ background: "#F4F7F9", color: NAVY, fontWeight: 800, padding: "10px 17px", borderRadius: 999, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>Plan een kennismaking</a>
              <a href="/beheer" onClick={(event) => { event.preventDefault(); go("/beheer"); }} style={{ ...simpleLink, color: "rgba(255,255,255,0.48)", fontSize: 12 }}>Inloggen</a>
            </div>
          )}
        </nav>
      </header>

      {mobile && menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 999, background: "rgba(13,27,42,0.995)", borderBottom: "1px solid rgba(0,168,150,0.2)", boxShadow: "0 18px 35px rgba(0,0,0,0.3)", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          <MobileGroup label="Diensten" items={diensten} onNavigate={go} />
          <a href="/onze-aanpak" onClick={(event) => { event.preventDefault(); go("/onze-aanpak"); }} style={{ display: "block", padding: "15px 22px", color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Onze aanpak</a>
          <MobileGroup label="Kennis" items={kennis} onNavigate={go} />
          <a href="/#over-ons" style={{ display: "block", padding: "15px 22px", color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Over ons</a>
          <a href="/verkennen" onClick={(event) => { event.preventDefault(); go("/verkennen"); }} style={{ display: "block", margin: "16px 20px 8px", padding: "13px 18px", textAlign: "center", background: "#F4F7F9", color: NAVY, borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>Plan een kennismaking</a>
          <a href="/beheer" onClick={(event) => { event.preventDefault(); go("/beheer"); }} style={{ display: "block", padding: "12px 22px 18px", color: TEAL, textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Inloggen →</a>
        </div>
      )}
    </>
  );
}