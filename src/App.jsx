// ─────────────────────────────────────────────
// HET TEAMKOMPAS — Productie-klare versie
// Vul de credentials in bij "STAP 1 / 2 / 3"
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Routes, Route, useNavigate } from "react-router-dom";
import OnzeAanpak from "./OnzeAanpak";
import KlantreisKeuze from "./KlantreisKeuze";
import Verkennen from "./Verkennen";
import TeamscanDigitaal from "./TeamscanDigitaal";
import ContactModal from "./ContactModal";
import { auth, db, ADMIN_EMAILS } from "./firebase";
import FunnelDashboard from "./FunnelDashboard";
import { PUB, ADM } from "./styles/tokens";
import { useInView, useIsMobile } from "./components/shared/hooks";
import Fade from "./components/shared/Fade";
import LoginScreen from "./components/admin/LoginScreen";
import GenerateAdvicePanel from "./components/admin/GenerateAdvicePanel";
import KompasDot from "./components/shared/KompasDot";
import ScanInvullen from "./pages/public/ScanInvullen";
import PageScans from "./pages/admin/PageScans";
import {
  berekenScanScoresVoorMeting,
  isVeiligheidLeiderschapVerdieping,
  getVeiligheidLeiderschapDimensies,
  interpretVeiligheidLeiderschapScore,
  isBelevingVeranderingVerdieping,
  isEnergieMotivatieVerdieping,
  isVerbeterenLerenVerdieping,
  isGecombineerdeVerdieping,
} from "./lib/scanUtils";
import {
  PIJLERS,
  DEFAULT_STELLINGEN,
  MEDEWERKERSSCAN_INTRO,
  MANAGEMENTSCAN_INTRO,
  MEDEWERKERSSCAN_STELLINGEN,
  MANAGEMENTSCAN_STELLINGEN,
  getScanTemplate,
  VEILIGHEID_LEIDERSCHAP_STELLINGEN,
  VEILIGHEID_LEIDERSCHAP_INTERPRETATIE,
  VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN,
  VERBETEREN_LEREN_STELLINGEN,
  VERBETEREN_LEREN_INTERPRETATIE,
  VERBETEREN_LEREN_REFLECTIEVRAGEN,
  ENERGIE_MOTIVATIE_STELLINGEN,
  ENERGIE_MOTIVATIE_REFLECTIEVRAGEN,
  BELEVING_VERANDERING_STELLINGEN,
  BELEVING_VERANDERING_REFLECTIEVRAGEN,
  VERDIEPING_BLOKKEN,
} from "./data/scanData";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// SHARED SCAN DATA
// ─────────────────────────────────────────────


function flattenVerdiepingStellingen(keys = []) {
  return keys.flatMap((k) => VERDIEPING_BLOKKEN[k]?.stellingen || []);
}

function gecombineerdeVerdiepingTitel(keys = []) {
  const labels = keys.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean);
  return labels.length ? `Verdieping: ${labels.join(" + ")}` : "Verdieping";
}

// ─────────────────────────────────────────────
// PUBLIC SITE COMPONENTS
// ─────────────────────────────────────────────
function Strepen() {
  return (
    <div style={{ position:"absolute",left:0,top:0,bottom:0,width:6,display:"flex",flexDirection:"column",zIndex:3 }}>
      {[PUB.groen,PUB.blauw,PUB.oranje,PUB.paars].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
    </div>
  );
}


function KompasAnim() {
  const isMobile = useIsMobile();
  const size = isMobile ? 340 : 460;
  const cx = size / 2;
  const id = "kmp";

  // Ring animation via CSS injected once
  const css = `
    @keyframes ${id}Spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes ${id}SpinR { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
    @keyframes ${id}Pulse { 0%,100%{opacity:.55} 50%{opacity:.85} }
    .${id}-outerRing { transform-origin: ${cx}px ${cx}px; animation: ${id}Spin 28s linear infinite; }
    .${id}-midRing   { transform-origin: ${cx}px ${cx}px; animation: ${id}SpinR 18s linear infinite; }
    .${id}-glow      { animation: ${id}Pulse 4s ease-in-out infinite; }
  `;

  const R  = cx - 4;          // outer ring radius
  const R2 = R - 22;          // mid ring radius
  const R3 = R - 50;          // inner quad radius (edge of coloured segments)
  const Rc = isMobile ? 56 : 64; // centre circle radius

  // Compass points on outer ring
  const cardinals = [
    { label:"N", angle:-90 },
    { label:"O", angle:0   },
    { label:"Z", angle:90  },
    { label:"W", angle:180 },
  ];
  // Tick marks every 22.5 deg
  const ticks = Array.from({length:16},(_,i)=>i*22.5);

  // Quadrant arcs (each 90°), drawn as SVG paths
  // order: top-right=Veiligheid(groen), bottom-right=Energie(oranje), bottom-left=Leren(paars), top-left=Verandering(blauw)
  const quads = [
    { color: PUB.groen,  startDeg: -90, label:"Veiligheid",  lx: cx + R3*0.42, ly: cx - R3*0.42 },
    { color: PUB.oranje, startDeg:   0, label:"Energie",     lx: cx + R3*0.42, ly: cx + R3*0.42 },
    { color: PUB.paars,  startDeg:  90, label:"Leren",       lx: cx - R3*0.42, ly: cx + R3*0.42 },
    { color: PUB.blauw,  startDeg: 180, label:"Verandering", lx: cx - R3*0.42, ly: cx - R3*0.42 },
  ];

  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function quadPath(cx, cy, outerR, innerR, startDeg, endDeg, gap=2) {
    const s1 = startDeg + gap, e1 = endDeg - gap;
    const [x1,y1] = polar(cx,cy,outerR,s1);
    const [x2,y2] = polar(cx,cy,outerR,e1);
    const [x3,y3] = polar(cx,cy,innerR,e1);
    const [x4,y4] = polar(cx,cy,innerR,s1);
    return `M${x1},${y1} A${outerR},${outerR} 0 0,1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 0,0 ${x4},${y4} Z`;
  }

  return (
    <div style={{ width:size, height:size, position:"relative", flexShrink:0 }}>
      <style>{css}</style>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow:"visible"}}>
        <defs>
          {/* Radial gradient per quadrant for depth */}
          {quads.map((q,i)=>(
            <radialGradient key={i} id={`${id}qg${i}`} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={q.color} stopOpacity="1"/>
              <stop offset="100%" stopColor={q.color} stopOpacity="0.55"/>
            </radialGradient>
          ))}
          {/* Centre glow */}
          <radialGradient id={`${id}cg`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PUB.teal} stopOpacity="0.22"/>
            <stop offset="100%" stopColor={PUB.teal} stopOpacity="0"/>
          </radialGradient>
          {/* Outer ring gradient */}
          <linearGradient id={`${id}rg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)"/>
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id={`${id}shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#000" floodOpacity="0.45"/>
          </filter>
          {/* Inner bevel filter */}
          <filter id={`${id}bevel`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset dx="0" dy="3" result="offsetBlur"/>
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </filter>
        </defs>

        {/* Subtle outer glow halo */}
        <circle cx={cx} cy={cx} r={R+8} fill="none" stroke={PUB.teal} strokeWidth="18" strokeOpacity="0.06" className={`${id}-glow`}/>

        {/* === ROTATING OUTER RING (N/O/Z/W) === */}
        <g className={`${id}-outerRing`}>
          {/* Ring band */}
          <circle cx={cx} cy={cx} r={R} fill={`url(#${id}rg)`} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <circle cx={cx} cy={cx} r={R-18} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>

          {/* Tick marks */}
          {ticks.map((deg,i)=>{
            const isMajor = i % 4 === 0;
            const [x1,y1] = polar(cx,cx,R-1, deg);
            const [x2,y2] = polar(cx,cx,R-(isMajor?14:8), deg);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.25)"}
              strokeWidth={isMajor?1.5:0.8}/>;
          })}

          {/* Cardinal labels — each individually counter-rotated to stay upright */}
          {cardinals.map(({label,angle},i)=>{
            const [lx,ly] = polar(cx,cx, R-10, angle);
            const counterRot = -angle - 90; // cancel out the ring rotation offset
            return (
              <text key={i}
                x={lx} y={ly+1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isMobile?10:11} fontWeight="700" fontFamily="Roboto,sans-serif"
                fill={label==="N"?"#E8821A":"rgba(255,255,255,0.85)"}
                transform={`rotate(${counterRot + 90}, ${lx}, ${ly})`}>
                {label}
              </text>
            );
          })}
        </g>

        {/* === ROTATING MID RING (decorative, counter-direction) === */}
        <g className={`${id}-midRing`}>
          <circle cx={cx} cy={cx} r={R2} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeDasharray="4 8"/>
        </g>

        {/* === QUADRANT SEGMENTS with depth === */}
        {quads.map((q,i)=>(
          <g key={i} filter={`url(#${id}shadow)`}>
            <path d={quadPath(cx,cx, R3, Rc+4, q.startDeg, q.startDeg+90)}
              fill={`url(#${id}qg${i})`}/>
            {/* Highlight arc (top edge shine) */}
            <path d={quadPath(cx,cx, R3, R3-6, q.startDeg, q.startDeg+90, 3)}
              fill="rgba(255,255,255,0.10)"/>
          </g>
        ))}

        {/* Dividing lines between quadrants */}
        {[0,90,180,270].map((deg,i)=>{
          const [x1,y1] = polar(cx,cx,Rc+4,deg);
          const [x2,y2] = polar(cx,cx,R3,deg);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(13,27,42,0.6)" strokeWidth="1.5"/>;
        })}

        {/* Quadrant labels */}
        {quads.map((q,i)=>(
          <text key={i} x={q.lx} y={q.ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={isMobile?12:13} fontWeight="700" fontFamily="Roboto,sans-serif"
            fill="rgba(255,255,255,0.92)" letterSpacing="0.02em">
            {q.label}
          </text>
        ))}

        {/* === CENTRE CIRCLE === */}
        {/* Glow behind centre */}
        <circle cx={cx} cy={cx} r={Rc+12} fill={`url(#${id}cg)`}/>
        {/* Circle with 3D gradient */}
        <circle cx={cx} cy={cx} r={Rc}
          fill={PUB.donker}
          stroke={PUB.teal} strokeWidth="1.5" strokeOpacity="0.5"
          filter={`url(#${id}shadow)`}/>
        {/* Top highlight for 3D pop */}
        <ellipse cx={cx} cy={cx - Rc*0.28} rx={Rc*0.55} ry={Rc*0.22}
          fill="rgba(255,255,255,0.07)"/>
        {/* Label */}
        <text x={cx} y={cx+2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={isMobile?18:20} fontWeight="700" fontFamily="Roboto,sans-serif"
          fill={PUB.teal}>
          Gedrag
        </text>
      </svg>
    </div>
  );
}

function NavBar({ isMobile, onLoginClick, openModal }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    ["Voor wie", "voor-wie"],
    ["Eerste stap", "eerste-stap"],
    ["Traject", "traject"],
    ["Teamscan", "teamscan"],
    ["Contact", "contact"]
  ];
  const handleNavClick = (id) => {
    setMenuOpen(false);

    if (id === "contact") {
      openModal();
      return;
    }

    if (id === "teamscan") {
      navigate("/teamscan");
      return;
    }

    if (id === "teamdag") {
      navigate("/teamdag");
      return;
    }

    const scrollToTarget = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (window.location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(scrollToTarget, 300);
      return;
    }

    scrollToTarget();
  };
  useEffect(() => {
    const observers = [];
    const ids = ["voor-wie", "eerste-stap", "traject", "teamscan", "contact"];
    const updateActive = () => {
      const hero = document.getElementById("home");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          setActiveSection("home");
          return;
        }
      }

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          setActiveSection(id);
          return;
        }
      }
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const scrollTo = (id) => {
    const targetId = id === "home" ? "home" : id;
    document.getElementById(targetId)?.scrollIntoView({behavior:"smooth",block:"start"});
    setMenuOpen(false);
  };

  const navLinkStyle = (id) => ({
    position:"relative",
    color: activeSection===id ? "#ffffff" : "rgba(255,255,255,0.62)",
    fontSize:13,
    cursor:"pointer",
    transition:"color 0.2s",
    paddingBottom:12,
    display:"inline-flex",
    alignItems:"center",
  });

  const activeIndicator = {
    position:"absolute",
    left:0,
    right:0,
    bottom:0,
    height:3,
    background:PUB.teal,
    borderRadius:999,
  };

  return (
    <>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(13,27,42,0.97)",
        borderBottom:"1px solid rgba(0,168,150,0.2)",height:64,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:isMobile?"0 20px":"0 40px",backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <KompasDot size={22}/>
          <span style={{fontSize:18,fontWeight:600,color:"#ffffff"}}>Mijn Teamkompas</span>
        </div>

        {isMobile ? (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span onClick={openModal} style={{background:"#F4F7F9",color:"#0D1B2A",padding:"8px 12px",
              borderRadius:999,fontWeight:700,fontSize:12,cursor:"pointer",border:"1px solid rgba(0,168,150,0.18)"}}>
              Neem contact op
            </span>
            <div onClick={()=>setMenuOpen(!menuOpen)}
              style={{cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:22,lineHeight:1,padding:"4px"}}>
              {menuOpen ? "✕" : "☰"}
            </div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            <span
              onClick={() => handleNavClick("home")}
              aria-current={activeSection==="home" ? "page" : undefined}
              style={navLinkStyle("home")}
            >
              Home
              {activeSection==="home" && <span style={activeIndicator} />}
            </span>

            {navLinks.map(([l,id])=>(
              <span
                key={l}
                onClick={() => handleNavClick(id)}
                aria-current={activeSection===id ? "page" : undefined}
                style={navLinkStyle(id)}
                onMouseEnter={e=>{ if (activeSection!==id) e.target.style.color="#00A896"; }}
                onMouseLeave={e=>{ if (activeSection!==id) e.target.style.color="rgba(255,255,255,0.62)"; }}
              >
                {l}
                {activeSection===id && <span style={activeIndicator} />}
              </span>
            ))}

            <span
              onClick={() => navigate("/teamontwikkeling")}
              style={{...navLinkStyle("teamontwikkeling"), color:"rgba(255,255,255,0.72)"}}
              onMouseEnter={e=>{ e.currentTarget.style.color="#00A896"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.72)"; }}
            >
              Teamontwikkeling
            </span>

            <span
              onClick={() => navigate("/teamcoaching")}
              style={{...navLinkStyle("teamcoaching"), color:"rgba(255,255,255,0.72)"}}
              onMouseEnter={e=>{ e.currentTarget.style.color="#00A896"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.72)"; }}
            >
              Teamcoaching
            </span>

            <span
              onClick={() => navigate("/teamdag")}
              style={{...navLinkStyle("teamdag"), color:"rgba(255,255,255,0.78)"}}
              onMouseEnter={e=>{ e.currentTarget.style.color="#00A896"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.78)"; }}
            >
              Teamdag
            </span>

            <span
              onClick={() => navigate("/onze-aanpak")}
              style={{...navLinkStyle("onze-aanpak"), color:"rgba(255,255,255,0.72)"}}
              onMouseEnter={e=>{ e.currentTarget.style.color="#00A896"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,255,255,0.72)"; }}
            >
              Onze aanpak
            </span>

            <span
              onClick={openModal}
              style={{background:"#F4F7F9",color:"#0D1B2A",fontWeight:700,padding:"10px 18px",
                borderRadius:999,fontSize:12,cursor:"pointer",boxShadow:"0 8px 22px rgba(0,0,0,0.18)"}}
            >
              Neem contact op
            </span>

            <span onClick={onLoginClick} style={{background:"transparent",color:"rgba(255,255,255,0.55)",
              padding:"7px 14px",borderRadius:4,fontWeight:500,fontSize:12,cursor:"pointer",
              border:"1px solid rgba(255,255,255,0.15)"}}>Inloggen →</span>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <div style={{position:"fixed",top:64,left:0,right:0,zIndex:199,
          background:"rgba(13,27,42,0.98)",borderBottom:"1px solid rgba(0,168,150,0.2)",
          padding:"12px 0"}}>
          <div
            onClick={() => handleNavClick("home")}
            aria-current={activeSection==="home" ? "page" : undefined}
            style={{padding:"14px 24px",color:activeSection==="home" ? "#00A896" : "rgba(255,255,255,0.75)",
              fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Home
          </div>
          {navLinks.map(([l,id])=>(
            <div
              key={l}
              onClick={() => handleNavClick(id)}
              aria-current={activeSection===id ? "page" : undefined}
              style={{padding:"14px 24px",color:activeSection===id ? "#00A896" : "rgba(255,255,255,0.75)",
                fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
            >
              {l}
            </div>
          ))}
          <div
            onClick={()=>{navigate("/teamontwikkeling");setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"rgba(255,255,255,0.75)",fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Teamontwikkeling
          </div>
          <div
            onClick={()=>{navigate("/teamcoaching");setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"rgba(255,255,255,0.75)",fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Teamcoaching
          </div>
          <div
            onClick={()=>{navigate("/teamdag");setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"rgba(255,255,255,0.75)",fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Teamdag
          </div>
          <div
            onClick={()=>{navigate("/onze-aanpak");setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"rgba(255,255,255,0.75)",fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Onze aanpak
          </div>
          <div onClick={()=>{openModal();setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"#ffffff",fontSize:15,cursor:"pointer",fontWeight:700,
              borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            Neem contact op
          </div>
          <div onClick={()=>{onLoginClick();setMenuOpen(false);}}
            style={{padding:"14px 24px",color:"#00A896",fontSize:15,cursor:"pointer",fontWeight:600}}>
            Inloggen →
          </div>
        </div>
      )}
    </>
  );
}

function SeoFaqItem({ vraag, antwoord, isMobile }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: open ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${open ? "rgba(0,168,150,0.24)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "transparent",
          border: "none",
          color: PUB.wit,
          padding: isMobile ? "16px 18px" : "18px 22px",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, lineHeight: 1.45 }}>{vraag}</span>
        <span style={{ color: PUB.teal, fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: isMobile ? "0 18px 18px" : "0 22px 20px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
          {antwoord}
        </div>
      )}
    </div>
  );
}

function InsightDiscoveryLandingSection({ isMobile, openModal }) {
  const voordelen = [
    "Meer begrip voor verschillen in communicatiestijl en werkvoorkeur.",
    "betere samenwerking binnen teams",
    "Sterkere feedback en constructievere gesprekken.",
    "Meer psychologische veiligheid en openheid.",
    "Leiderschap dat beter aansluit op wat het team nodig heeft.",
    "Meer focus op kwaliteiten, complementariteit en teamdynamiek.",
  ];

  const toepassingen = [
    ["Samenwerking verbeteren", "Wanneer teams langs elkaar heen werken, helpen Insights Discovery profielen om verschillen in gedrag zichtbaar en bespreekbaar te maken."],
    ["Leiderschap versterken", "Leidinggevenden krijgen meer zicht op hun eigen stijl en leren beter aansluiten op wat verschillende teamleden nodig hebben."],
    ["Verandering begeleiden", "Inzicht in gedrag helpt teams om onder druk of in verandering constructiever te communiceren en sneller begrip op te bouwen."],
  ];

  const faqs = [
    ["Wat is de meerwaarde van Insights Discovery voor teamontwikkeling?", "Insights Discovery maakt gedragsverschillen herkenbaar en bespreekbaar. Daardoor verbeteren communicatie, samenwerking en wederzijds begrip binnen teams."],
    ["Is Insights Discovery alleen geschikt voor individuele ontwikkeling?", "Nee. Het individuele profiel is het vertrekpunt, maar de echte impact ontstaat wanneer gedragsinzicht wordt verbonden aan de teamdynamiek, samenwerking en het leiderschap."],
    ["Voor welke teams is deze aanpak geschikt?", "Voor managementteams, projectteams, zorgteams, stafteams en teams in verandering. Overal waar samenwerking, communicatie en onderlinge afstemming bepalend zijn, voegt gedragsinzicht waarde toe."],
    ["Wat maakt Mijn Teamkompas hierin anders?", "Wij gebruiken Insights Discovery niet als los profiel, maar als onderdeel van een bredere teamanalyse waarin ook veiligheid, motivatie, verandering en leren worden meegenomen."],
  ];

  return (
    <div id="insights-discovery" style={{ background: PUB.wit }}>
      <div style={{ padding: isMobile ? "52px 20px 28px" : "88px 60px 42px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: isMobile ? 28 : 42, alignItems: "center" }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Insights Discovery en teamontwikkeling</div>
              <h2 style={{ fontSize: isMobile ? 29 : 42, fontWeight: 700, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>
                Inzicht in gedrag versnelt teamontwikkeling
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: PUB.sub, marginBottom: 16, maxWidth: 620 }}>
                Veel teams lopen niet vast door een gebrek aan inzet of expertise, maar doordat verschillen in gedrag, communicatie en tempo onzichtbaar blijven.
                Met <strong style={{ color: PUB.donker }}>Insights Discovery profielen</strong> maakt Mijn Teamkompas die verschillen zichtbaar en praktisch toepasbaar.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: PUB.sub, marginBottom: 26, maxWidth: 620 }}>
                Zo ontstaat meer begrip, sterkere samenwerking, gerichter leiderschap en een stevigere basis voor duurzame <strong style={{ color: PUB.donker }}>teamontwikkeling</strong>.
                Niet als losse teamsessie, maar als onderdeel van een bredere aanpak om samenwerking daadwerkelijk te verbeteren.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <span onClick={openModal} style={{ background: PUB.teal, color: PUB.donker, padding: "13px 22px", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Plan een kennismaking
                </span>
                <span onClick={() => document.getElementById("insights-faq")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ border: `1px solid ${PUB.lijn}`, color: PUB.donker, padding: "13px 22px", borderRadius: 4, fontSize: 14, cursor: "pointer", background: PUB.wit }}>
                  Bekijk veelgestelde vragen
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["Insights Discovery profielen", "teamontwikkeling", "gedrag in teams", "samenwerking verbeteren"].map((label) => (
                  <span key={label} style={{ fontSize: 11, color: PUB.tealDark, background: "rgba(0,168,150,0.08)", border: "1px solid rgba(0,168,150,0.14)", padding: "6px 10px", borderRadius: 999, fontWeight: 600 }}>
                    {label}
                  </span>
                ))}
              </div>
            </Fade>

            <Fade delay={isMobile ? 0 : 0.1}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <img src="/teamkompas-workshop-hero.jpg" alt="Collega's in overleg over samenwerking en teamontwikkeling" style={{ width: "100%", height: isMobile ? 170 : 250, objectFit: "cover", borderRadius: 12, boxShadow: "0 18px 44px rgba(13,27,42,0.14)" }} />
                <img src="/teamkompas-intakegesprek.jpg" alt="Leidinggevende in gesprek over gedrag en communicatie in teams" style={{ width: "100%", height: isMobile ? 170 : 250, objectFit: "cover", borderRadius: 12, boxShadow: "0 18px 44px rgba(13,27,42,0.14)" }} />
                <div style={{ gridColumn: "1 / -1", background: PUB.donker, borderRadius: 14, padding: isMobile ? "18px 18px" : "22px 24px", boxShadow: "0 18px 44px rgba(13,27,42,0.18)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: PUB.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Waarom dit werkt</div>
                  <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: PUB.wit, lineHeight: 1.45, marginBottom: 8 }}>
                    Mensen hoeven niet hetzelfde te zijn om beter samen te werken. Ze moeten elkaar beter leren begrijpen.
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.64)", lineHeight: 1.7 }}>
                    Precies daar maken gedragsprofielen, teamanalyse en gerichte dialoog het verschil.
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "0 20px 52px" : "0 60px 78px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 18 : 22 }}>
          <Fade>
            <div style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 14, padding: isMobile ? "22px 18px" : "26px 24px", height: "100%" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PUB.teal, marginBottom: 12 }}>De toegevoegde waarde</div>
              <h3 style={{ fontSize: isMobile ? 23 : 30, lineHeight: 1.18, color: PUB.donker, marginBottom: 14 }}>Waarom inzicht in gedrag zoveel verschil maakt</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: PUB.sub, marginBottom: 20 }}>
                Wanneer teams beter begrijpen hoe mensen communiceren, reageren onder druk en samenwerken, ontstaan minder misverstanden en meer mogelijkheden om kwaliteiten slim te benutten.
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {voordelen.map((item, i) => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${PUB.lijn}` }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: PUB.teal, marginTop: 7, flexShrink: 0 }} />
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: PUB.donker }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </Fade>

          <Fade delay={isMobile ? 0 : 0.08}>
            <div style={{ background: PUB.donker, borderRadius: 14, padding: isMobile ? "22px 18px" : "26px 24px", height: "100%", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(0,168,150,0.18), transparent 40%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PUB.teal, marginBottom: 12 }}>Van profiel naar praktijk</div>
                <h3 style={{ fontSize: isMobile ? 23 : 30, lineHeight: 1.18, color: PUB.wit, marginBottom: 14 }}>Insights Discovery werkt pas echt wanneer je het vertaalt naar het team</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.66)", marginBottom: 22 }}>
                  Daarom gebruikt Mijn Teamkompas gedragsprofielen niet als los instrument, maar als onderdeel van een bredere analyse van teamdynamiek, leiderschap en samenwerking.
                </p>
                <div style={{ display: "grid", gap: 12 }}>
                  {toepassingen.map(([titel, tekst]) => (
                    <div key={titel} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 15px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: PUB.wit, marginBottom: 6 }}>{titel}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.66)", lineHeight: 1.7 }}>{tekst}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </div>

      <div style={{ background: PUB.licht, padding: isMobile ? "52px 20px" : "76px 60px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Fade>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Wat dit oplevert</div>
            <h3 style={{ fontSize: isMobile ? 27 : 38, fontWeight: 700, lineHeight: 1.12, color: PUB.donker, marginBottom: 14, maxWidth: 760 }}>
              Een gedeelde taal voor gedrag, communicatie en teamdynamiek
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: PUB.sub, maxWidth: 760, marginBottom: 30 }}>
              Dat helpt teams om eerlijker te praten over wat goed gaat, waar het schuurt en wat nodig is om samenwerking structureel te versterken.
            </p>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
            {[
              ["01", "Meer begrip", "Teamleden herkennen elkaars kwaliteiten, voorkeuren en reacties onder druk sneller en met minder oordeel."],
              ["02", "Betere afstemming", "Gesprekken over feedback, rolverdeling, tempo en samenwerking worden concreter en productiever."],
              ["03", "Duurzamere teamontwikkeling", "Inzichten worden gekoppeld aan de praktijk van het team en leiden tot gerichtere interventies en meer eigenaarschap."],
            ].map(([nr, titel, tekst], i) => (
              <Fade key={titel} delay={i * 0.08} style={{ height: "100%" }}>
                <div style={{ height: "100%", background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 14, padding: isMobile ? "22px 18px" : "24px 22px", boxShadow: "0 12px 30px rgba(13,27,42,0.05)" }}>
                  <div style={{ fontSize: 34, lineHeight: 1, fontWeight: 700, color: "rgba(0,168,150,0.16)", marginBottom: 10 }}>{nr}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: PUB.donker, marginBottom: 10 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub }}>{tekst}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </div>

      <div id="insights-faq" style={{ background: PUB.donker, padding: isMobile ? "52px 20px" : "76px 60px", position: "relative", overflow: "hidden" }}>
        <Strepen />
        <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Fade>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Veelgestelde vragen</div>
            <h3 style={{ fontSize: isMobile ? 27 : 38, fontWeight: 700, lineHeight: 1.12, color: PUB.wit, marginBottom: 14 }}>
              Insights Discovery, gedrag in teams en samenwerking verbeteren
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.66)", marginBottom: 28, maxWidth: 760 }}>
              Deze vragen leven vaak bij organisaties die gedragsprofielen willen inzetten voor teamontwikkeling, leiderschap en betere communicatie in teams.
            </p>
          </Fade>
          <div style={{ display: "grid", gap: 12 }}>
            {faqs.map(([vraag, antwoord]) => (
              <SeoFaqItem key={vraag} vraag={vraag} antwoord={antwoord} isMobile={isMobile} />
            ))}
          </div>
          <Fade delay={0.1}>
            <div style={{ marginTop: 30, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
              <span onClick={openModal} style={{ background: PUB.teal, color: PUB.donker, padding: "13px 22px", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Bespreek jouw teamvraag
              </span>
              <span onClick={() => document.getElementById("werkwijze")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ border: "1px solid rgba(255,255,255,0.28)", color: PUB.wit, padding: "13px 22px", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>
                Bekijk het traject
              </span>
            </div>
          </Fade>
        </div>
      </div>
    </div>
  );
}


function SeoHead({ page = "home" }) {
  const pages = {
    home: {
      title: "Mijn Teamkompas | teamscan, teamontwikkeling en teamcoaching",
      description: "Mijn Teamkompas helpt teams zichtbaar maken wat samenwerking belemmert. Met teamscan, analyse, Insights Discovery en begeleiding naar concrete vervolgstappen.",
      url: "https://www.mijnteamkompas.nl/",
      image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    },
    onzeAanpak: {
      title: "Onze aanpak | van teamscan naar teamontwikkeling",
      description: "Ontdek hoe Mijn Teamkompas teams begeleidt van eerste vraag naar teamscan, analyse, dialoog, teamdag en borging in het dagelijks werk.",
      url: "https://www.mijnteamkompas.nl/onze-aanpak",
      image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    },
    teamscan: {
      title: "Teamscan starten | inzicht in samenwerking, energie en veiligheid",
      description: "Start laagdrempelig een digitale teamscan. Krijg inzicht in samenwerking, psychologische veiligheid, energie, motivatie en verbeterkracht in je team.",
      url: "https://www.mijnteamkompas.nl/teamscan",
      image: "https://www.mijnteamkompas.nl/teamkompas-vier-domeinen.jpg",
    },
    teamontwikkeling: {
      title: "Teamontwikkeling en teamcoaching | samenwerking verbeteren",
      description: "Versterk teamontwikkeling met teamscan, teamcoaching en begeleiding op samenwerking, psychologische veiligheid, eigenaarschap, motivatie en teamdag.",
      url: "https://www.mijnteamkompas.nl/teamontwikkeling",
      image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    },
    verkennen: {
      title: "Verkennend gesprek | bespreek je teamvraag met Mijn Teamkompas",
      description: "Plan een vrijblijvend verkennend gesprek over teamontwikkeling, teamscan, samenwerking, psychologische veiligheid of leiderschapsbegeleiding.",
      url: "https://www.mijnteamkompas.nl/verkennen",
      image: "https://www.mijnteamkompas.nl/teamkompas-intakegesprek.jpg",
    },
    teamcoaching: {
      title: "Teamcoaching | begeleiding bij samenwerking en leiderschap",
      description: "Teamcoaching van Mijn Teamkompas: praktische begeleiding bij samenwerking, communicatie, psychologische veiligheid en eigenaarschap binnen het team.",
      url: "https://www.mijnteamkompas.nl/teamcoaching",
      image: "https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg",
    },
    teamdag: {
      title: "Teamdag organiseren | dialoog en concrete afspraken",
      description: "Een teamdag van Mijn Teamkompas: gestructureerde dialoog op basis van de teamscan, met heldere uitkomsten, gedeelde afspraken en concrete vervolgstappen.",
      url: "https://www.mijnteamkompas.nl/teamdag",
      image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
    },
    beheer: {
      title: "Beheeromgeving | Mijn Teamkompas",
      description: "Beheeromgeving van Mijn Teamkompas.",
      url: "https://www.mijnteamkompas.nl/beheer",
      image: "https://www.mijnteamkompas.nl/teamkompas-workshop-hero.jpg",
      noindex: true,
    },
  };

  const seo = pages[page] || pages.home;

  return (
    <Helmet>
      <html lang="nl" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content="Mijn Teamkompas" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:image" content={seo.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}

// ─────────────────────────────────────────────
// PUBLIC SITE
// ─────────────────────────────────────────────

function ThemeDeepDiveSection({ isMobile, openModal }) {
  const themaItems = [
    {
      id: 'veiligheid-leiderschap',
      kleur: PUB.groen,
      label: 'Veiligheid en leiderschap',
      titel: 'Teams groeien wanneer veiligheid en leiderschap elkaar versterken',
      intro: 'Samenwerking verbetert pas echt wanneer mensen zich vrij voelen om zich uit te spreken én leidinggevenden richting geven zonder de verbinding te verliezen.',
      herkenning: [
        'Mensen zeggen na het overleg iets anders dan tijdens het overleg.',
        'Fouten of spanningen worden laat of helemaal niet besproken.',
        'De leidinggevende blijft de belangrijkste bron van richting en initiatief.'
      ],
      opbrengst: 'Meer openheid, meer eigenaarschap en gesprekken die sneller tot beweging leiden.',
      image: '/teamkompas-intakegesprek.jpg',
      alt: 'Teamoverleg waarin collega\'s actief luisteren en samenwerken.'
    },
    {
      id: 'energie-motivatie',
      kleur: PUB.oranje,
      label: 'Energie en motivatie',
      titel: 'Motivatie groeit meestal niet door meer enthousiasme, maar door minder frustratie',
      intro: 'Veel teams zijn niet ongemotiveerd. Ze lopen leeg op onduidelijkheid, verstoringen, onhandige processen en een gebrek aan invloed op het eigen werk.',
      herkenning: [
        'Collega\'s doen wat nodig is, maar nemen weinig extra initiatief.',
        'Kleine irritaties kosten opvallend veel energie.',
        'Werkdruk is structureel gespreksonderwerp geworden.'
      ],
      opbrengst: 'Meer grip op energielekken, scherpere prioriteiten en meer duurzame bevlogenheid.',
      image: '/teamkompas-workshop-hero.jpg',
      alt: 'Collega\'s werken samen aan een tafel in een nuchtere werkomgeving.'
    },
    {
      id: 'beleving-verandering',
      kleur: PUB.blauw,
      label: 'Beleving van verandering',
      titel: 'Verandering stokt zelden op de inhoud, maar vaak op de beleving',
      intro: 'Wat op papier logisch is, kan in de praktijk voelen als verlies van grip, ritme of duidelijkheid. Daarom kijken wij niet alleen naar de veranderopgave, maar vooral naar hoe die binnenkomt.',
      herkenning: [
        'Er is formeel draagvlak, maar weinig echte beweging.',
        'Dezelfde vragen blijven terugkomen.',
        'Teams begrijpen de verandering rationeel, maar voelen nog geen houvast.'
      ],
      opbrengst: 'Meer draagvlak, kleinere haalbare stappen en verandering die beter landt in de dagelijkse praktijk.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&fit=crop&crop=center',
      alt: 'Groep mensen bespreekt verandering op een whiteboard.'
    },
    {
      id: 'verbeteren-leren',
      kleur: PUB.paars,
      label: 'Verbeteren en leren',
      titel: 'Duurzame verbetering ontstaat wanneer leren onderdeel wordt van het werk',
      intro: 'Verbeteren werkt pas wanneer teams ruimte ervaren om samen terug te kijken, kleine stappen te zetten en daarvan zichtbaar te leren.',
      herkenning: [
        'Er zijn genoeg ideeën, maar weinig opvolging.',
        'Verbeteren voelt als iets extra\'s naast het gewone werk.',
        'Teams bespreken knelpunten, maar veranderen hun routines nog onvoldoende.'
      ],
      opbrengst: 'Meer leervermogen, betere opvolging en een cultuur waarin verbeteren werkbaar blijft.',
      image: '/teamkompas-samen-richting.jpg',
      alt: 'Team bij een verbeterbord in gesprek over volgende stappen.'
    }
  ];

  return (
    <div id="themas" style={{ background: PUB.wit, padding: isMobile ? '52px 20px' : '80px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Fade>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', color: PUB.teal, textTransform: 'uppercase', marginBottom: 12 }}>Vier thema's</div>
          <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, lineHeight: 1.12, color: PUB.donker, marginBottom: 14 }}>
            Vier invalshoeken maken zichtbaar wat teams vooruithelpt
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.78, color: PUB.sub, maxWidth: 760, marginBottom: 34 }}>
            Elk thema belicht een belangrijk onderdeel van sterke samenwerking. Samen geven deze vier thema's richting aan gesprekken over leiderschap, motivatie, verandering en ontwikkeling binnen teams.
          </p>
        </Fade>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: isMobile ? 20 : 24 }}>
          {themaItems.map((item, i) => (
            <Fade key={item.id} delay={i * 0.06}>
              <div style={{ border: `1px solid ${PUB.lijn}`, borderRadius: 16, overflow: 'hidden', background: PUB.wit, boxShadow: '0 12px 34px rgba(13,27,42,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <img src={item.image} alt={item.alt} style={{ width: '100%', height: isMobile ? 200 : 240, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: isMobile ? '22px 18px' : '24px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: item.kleur, marginBottom: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.kleur, display: 'inline-block' }} />
                    {item.label}
                  </div>
                  <h3 style={{ fontSize: isMobile ? 22 : 26, lineHeight: 1.2, color: PUB.donker, marginBottom: 12 }}>{item.titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub, marginBottom: 16 }}>{item.intro}</p>
                  <div style={{ fontSize: 12, fontWeight: 700, color: PUB.donker, marginBottom: 10 }}>Herkenbare signalen:</div>
                  <div style={{ display: 'grid', gap: 9, marginBottom: 16 }}>
                    {item.herkenning.map((punt) => (
                      <div key={punt} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.kleur, marginTop: 7, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, lineHeight: 1.7, color: PUB.donker }}>{punt}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 15px', borderRadius: 12, background: PUB.licht, border: `1px solid ${PUB.lijn}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: PUB.donker, marginBottom: 6 }}>Wat dit oplevert</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: PUB.sub }}>{item.opbrengst}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
                    <span onClick={openModal} style={{ background: item.kleur, color: PUB.wit, padding: '11px 16px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Bespreek dit thema
                    </span>
                    <span onClick={() => document.getElementById('werkwijze')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ border: `1px solid ${PUB.lijn}`, color: PUB.donker, padding: '11px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: PUB.wit }}>
                      Bekijk de werkwijze
                    </span>
                  </div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiverseWorkplacesSection({ isMobile }) {
  const plekken = [
    {
      titel: 'Niet alleen voor kantooromgevingen',
      tekst: 'Onze aanpak werkt juist ook in organisaties waar het werk snel, praktisch en onder druk is. Denk aan zorg, publieke dienstverlening, onderwijs en uitvoerende teams.',
      image: '/teamkompas-intakegesprek.jpg',
      alt: 'Professionals in een zorgomgeving in overleg.'
    },
    {
      titel: 'Ook waar dagelijks werk leidend is',
      tekst: 'Samenwerking verbeteren moet aansluiten op hoe mensen echt werken. Daarom past Mijn Teamkompas net zo goed bij operationele teams en werkvloeren als bij managementteams.',
      image: '/teamkompas-samen-richting.jpg',
      alt: 'Collega\'s overleggen op een praktische werkvloer.'
    },
    {
      titel: 'Menselijk, nuchter en toepasbaar',
      tekst: 'Geen gelikte theorie voor alleen luxe boardrooms, maar begeleiding die werkt in echte organisaties met echte druk, echte verschillen en echte verantwoordelijkheden.',
      image: '/teamkompas-workshop-hero.jpg',
      alt: 'Divers team werkt samen aan een tafel in een alledaagse werkomgeving.'
    }
  ];

  return (
    <div style={{ background: PUB.licht, padding: isMobile ? '52px 20px' : '78px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Fade>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', color: PUB.teal, textTransform: 'uppercase', marginBottom: 12 }}>In diverse werkomgevingen</div>
          <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, lineHeight: 1.12, color: PUB.donker, marginBottom: 14 }}>
            Samenwerking vraagt overal iets anders, van zorg en uitvoering tot kantoor en projectteam
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.78, color: PUB.sub, maxWidth: 780, marginBottom: 30 }}>
            Niet iedereen werkt in een strak directiekantoor. Juist de dagelijkse context bepaalt hoe leiderschap, communicatie en teamontwikkeling vorm krijgen.
          </p>
        </Fade>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? 18 : 20 }}>
          {plekken.map((plek, i) => (
            <Fade key={plek.titel} delay={i * 0.08}>
              <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 30px rgba(13,27,42,0.08)' }}>
                <img src={plek.image} alt={plek.alt} style={{ width: '100%', height: isMobile ? 210 : 220, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '20px 18px 22px' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: PUB.donker, marginBottom: 8 }}>{plek.titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.72, color: PUB.sub }}>{plek.tekst}</div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicSite({ onLoginClick }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const openModal = () => setModalOpen(true);

  const closeModal = () => setModalOpen(false);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const funnelSteps = [
    ["1", "Contact via website", "Laagdrempelig een vraagstuk delen zonder verplichting."],
    ["2", "Kennismaking & intake", "Samen scherp krijgen wat er speelt en wat nodig is."],
    ["3", "Voorstel / trajectontwerp", "Een passende aanpak voor jullie team en context."],
    ["4", "Teamscan uitzetten", "Veilig en gestructureerd ophalen wat teamleden ervaren."],
    ["5", "Analyse teamscan", "Patronen, verschillen en signalen vertalen naar betekenis."],
    ["6", "Insights Discovery profielen", "Gedrag, communicatie en samenwerking concreet maken."],
    ["7", "Terugkoppeling & maatwerkadvies", "Duidelijke conclusies en haalbare vervolgstappen."],
    ["8", "Workshop of teamdag", "Gerichte interventie waarin inzicht wordt omgezet in gedrag."],
    ["9", "Borging / follow-up", "Zorgen dat inzichten blijven landen in het dagelijks werk."],
  ];

  const trustItems = [
    ["Menselijk", "we kijken naar gedrag, veiligheid, energie en samenwerking achter de cijfers."],
    ["Onderbouwd", "teamscan, Insights Discovery en bewezen veranderkundige principes versterken elkaar."],
    ["Praktisch", "geen standaardrapport, maar concrete stappen die passen bij jullie dagelijkse realiteit."],
  ];

  const vragen = [
    "Er wordt veel besproken, maar weinig echt uitgesproken.",
    "Samenwerking kost meer energie dan nodig is.",
    "Verandering roept twijfel, afwachten of weerstand op.",
    "Leidinggevenden zoeken taal en richting om het team verder te brengen.",
  ];

  const pijlerCards = [
    ["Samenwerking & communicatie", PUB.blauw, "hoe mensen elkaar begrijpen, aanvullen of juist mislopen."],
    ["Veiligheid & leiderschap", PUB.groen, "of mensen zich vrij voelen om eerlijk te zijn en initiatief te nemen."],
    ["Energie & motivatie", PUB.oranje, "waar werk energie geeft en waar het team structureel leegloopt."],
    ["Verbeteren & leren", PUB.paars, "of verbeterideeën zichtbaar worden, besproken worden en landen in gedrag."],
  ];

  const ctaStyle = { background: PUB.teal, color: PUB.wit, padding: "14px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center", boxShadow: "0 12px 28px rgba(15,118,110,0.24)" };
  const ghostStyle = { border: "1px solid rgba(255,255,255,0.30)", color: PUB.wit, padding: "14px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.04)" };

  return (
    <>
      <SeoHead page="home" />

      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, overflowX: "hidden", paddingTop: 64, background: PUB.wit }}>
        <NavBar isMobile={isMobile} onLoginClick={onLoginClick} openModal={openModal} />

        <section id="home" style={{ background: PUB.donker, minHeight: isMobile ? "auto" : "86vh", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr .95fr", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <Strepen />
          <div style={{ padding: isMobile ? "58px 24px 36px" : "72px 58px 72px 72px", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 16 }}>Teamontwikkeling met teamscan, analyse en begeleiding</div>
            <h1 style={{ fontSize: isMobile ? 34 : 56, fontWeight: 800, lineHeight: 1.05, color: PUB.wit, marginBottom: 20, letterSpacing: "-0.03em" }}>
              Waarom verandert er niets in je team, terwijl iedereen voelt dat het beter kan?
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 640, marginBottom: 16 }}>
              Mijn Teamkompas maakt zichtbaar wat er onder de oppervlakte speelt en vertaalt dat naar concrete begeleiding, een zorgvuldig trajectontwerp en een teamdag die past bij jullie dagelijkse werkelijkheid.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 30 }}>
              <span style={ctaStyle} onClick={openModal}>Plan een verkennende kennismaking</span>
              <span style={{ ...ghostStyle, background: "rgba(255,255,255,0.10)" }} onClick={() => navigate("/teamscan")}>Start teamscan</span>
              <span style={ghostStyle} onClick={() => navigate("/onze-aanpak")}>Bekijk onze aanpak</span>
            </div>
            <div style={{ marginTop: 24, color: "rgba(255,255,255,0.48)", fontSize: 13 }}>
              Kies voor persoonlijk contact of start laagdrempelig met de digitale teamscan.
            </div>
          </div>
          <div style={{ minHeight: isMobile ? 320 : "86vh", position: "relative", zIndex: 1 }}>
            <img src="/teamkompas-workshop-hero.jpg" alt="Teamworkshop van Mijn Teamkompas met kompaswerkvorm en gezamenlijke dialoog" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: .82 }} />
            <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to top, rgba(13,27,42,0.88), rgba(13,27,42,0.18))" : "linear-gradient(to right, rgba(13,27,42,0.92), rgba(13,27,42,0.10))" }} />
            <div style={{ position: "absolute", left: isMobile ? 22 : 44, right: isMobile ? 22 : 44, bottom: isMobile ? 24 : 44, background: "rgba(255,255,255,0.92)", borderRadius: 18, padding: 22, boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: PUB.teal, marginBottom: 8 }}>De eerste stap</div>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: PUB.donker, lineHeight: 1.2, marginBottom: 8 }}>Van losse signalen naar een gedeeld beeld.</div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: PUB.sub }}>Een kennismaking geeft rust, taal en richting voordat er een traject wordt gestart.</div>
            </div>
          </div>
        </section>

        <section style={{ background: PUB.wit, padding: isMobile ? "28px 20px" : "34px 60px", borderBottom: `1px solid ${PUB.lijn}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {trustItems.map(([titel, tekst]) => (
              <div key={titel} style={{ border: `1px solid ${PUB.lijn}`, borderRadius: 14, padding: 18, background: "#fff" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: PUB.donker, marginBottom: 6 }}>{titel}</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: PUB.sub }}>{tekst}</div>
              </div>
            ))}
          </div>
        </section>


        <section id="beelden-aanpak" style={{ background: PUB.wit, padding: isMobile ? "52px 20px" : "74px 60px", borderBottom: `1px solid ${PUB.lijn}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <Fade>
              <div style={{ maxWidth: 760, marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Van inzicht naar beweging</div>
                <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.donker, marginBottom: 14 }}>Teamontwikkeling begint met zien wat er echt speelt.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: 0 }}>
                  Mijn Teamkompas combineert een digitale teamscan met begeleide dialoog, zodat signalen niet blijven hangen in losse indrukken maar worden vertaald naar richting, eigenaarschap en concrete vervolgstappen.
                </p>
              </div>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 18 }}>
              {[
                ["Eerst begrijpen", "Een verkennend gesprek maakt helder wat zichtbaar is, wat onder de oppervlakte speelt en welke vraag echt centraal staat.", "/teamkompas-intakegesprek.jpg", "Verkennend gesprek over leiderschap, samenwerking en teamontwikkeling"],
                ["Samen betekenis geven", "De teamscan en gedragsinzichten helpen om patronen bespreekbaar te maken zonder oordeel of ingewikkelde taal.", "/teamkompas-workshop-hero.jpg", "Teamworkshop met kompaswerkvorm en dialoog over samenwerking"],
                ["Richting kiezen", "In een teamsessie vertalen we inzicht naar concrete afspraken, beter samenspel en haalbare vervolgstappen.", "/teamkompas-samen-richting.jpg", "Teamsessie waarin deelnemers samen richting geven aan verbetering"]
              ].map(([titel, tekst, image, alt], i) => (
                <Fade key={titel} delay={i * 0.06} style={{ height: "100%" }}>
                  <div style={{ height: "100%", background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 18px 44px rgba(13,27,42,0.08)" }}>
                    <img src={image} alt={alt} loading="lazy" style={{ width: "100%", height: isMobile ? 220 : 230, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 22 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, marginBottom: 8 }}>{titel}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub }}>{tekst}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
            <Fade delay={0.12}>
              <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 12 }}>
                <span style={{ ...ctaStyle, display: "inline-block" }} onClick={() => navigate("/teamscan")}>Start teamscan</span>
                <span style={{ border: `1px solid ${PUB.lijn}`, color: PUB.donker, padding: "14px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", background: PUB.wit }} onClick={() => navigate("/onze-aanpak")}>Bekijk onze aanpak</span>
              </div>
            </Fade>
          </div>
        </section>
        <KlantreisKeuze />

        <section id="voor-wie" style={{ padding: isMobile ? "54px 20px" : "82px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".9fr 1.1fr", gap: 42, alignItems: "center" }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Herkenbare aanleiding</div>
              <h2 style={{ fontSize: isMobile ? 30 : 44, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>Als het team wel wil, maar nog niet in beweging komt.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, marginBottom: 24 }}>Misschien loopt het in je team niet slecht, maar ook niet zoals je zou willen. Dingen blijven liggen, gesprekken worden niet gevoerd of verandering blijft hangen in goede intenties. Dan helpt het om eerst helder te krijgen wat er echt speelt.</p>
              <span style={{ ...ctaStyle, display: "inline-block" }} onClick={openModal}>Bespreek jullie situatie</span>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, alignItems: "stretch" }}>
              {vragen.map((v, i) => (
                <Fade key={v} delay={i * .05} style={{ height: "100%" }}>
                  <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 22, minHeight: 150, height: "100%", boxSizing: "border-box", boxShadow: "0 14px 34px rgba(13,27,42,0.06)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: PUB.tealGlow, color: PUB.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: 14 }}>{i + 1}</div>
                    <div style={{ fontSize: 16, lineHeight: 1.55, color: PUB.donker, fontWeight: 700 }}>{v}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        <section id="eerste-stap" style={{ padding: isMobile ? "54px 20px" : "82px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <Fade>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 36px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Na je aanvraag</div>
                <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.14, color: PUB.donker, marginBottom: 14 }}>Wat gebeurt er als je contact opneemt?</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>Je wilt eerst begrijpen wat er speelt, voordat je iets in gang zet. Daarom beginnen we altijd met een verkennend gesprek waarin we samen kijken wat er nodig is en of dit bij jullie past.</p>
              </div>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 18 }}>
              {[["1", "Korte kennismaking", "We plannen een verkennend gesprek van ongeveer 30 minuten."], ["2", "Vraagstuk verkennen", "We bespreken wat zichtbaar is, wat onderliggend speelt en wat het team nodig heeft."], ["3", "Eerste richting", "Je ontvangt een heldere inschatting van een passende vervolgstap."]].map(([nr, titel, tekst]) => (
                <div key={nr} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 26 }}>
                  <div style={{ color: PUB.teal, fontWeight: 900, fontSize: 28, marginBottom: 12 }}>{nr}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="traject" style={{ padding: isMobile ? "54px 20px" : "86px 60px", background: PUB.donker, color: PUB.wit }}>
          <div style={{ maxWidth: 1220, margin: "0 auto" }}>
            <Fade>
              <div style={{ maxWidth: 820, marginBottom: 34 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Begeleid traject met fysieke begeleiding</div>
                <h2 style={{ fontSize: isMobile ? 30 : 46, lineHeight: 1.1, color: PUB.wit, marginBottom: 14 }}>Van eerste contact tot inzicht, teamdag en borging.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.68)" }}>Geen enkel team is hetzelfde. Daarom kijken we altijd eerst naar jullie situatie en stemmen we de aanpak daarop af. Zo ontstaat een traject dat past bij jullie team, in plaats van een standaardoplossing.</p>
              </div>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {funnelSteps.map(([nr, titel, tekst], i) => (
                <Fade key={titel} delay={(i % 3) * .04}>
                  <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 22, minHeight: 150 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{nr}</div>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{titel}</div>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.62)" }}>{tekst}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        <section id="teamscan" style={{ padding: isMobile ? "54px 20px" : "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".95fr 1.05fr", gap: 44, alignItems: "center" }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>De teamscan</div>
              <h2 style={{ fontSize: isMobile ? 30 : 44, lineHeight: 1.12, marginBottom: 16 }}>Geen vragenlijstje, maar een startpunt voor betekenisvol gesprek.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, marginBottom: 22 }}>De teamscan helpt patronen zichtbaar maken in samenwerking, veiligheid, energie en verbeteren. Insights Discovery gebruiken we aanvullend als gedragslens om te begrijpen hoe dit specifieke team communiceert, reageert en verandert.</p>
              <span style={{ ...ctaStyle, display: "inline-block" }} onClick={openModal}>Verken de teamscan</span>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {pijlerCards.map(([titel, kleur, tekst]) => (
                <div key={titel} style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderTop: `5px solid ${kleur}`, borderRadius: 18, padding: 22, boxShadow: "0 14px 34px rgba(13,27,42,0.06)" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{titel}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub }}>{tekst}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="voorbeeldrapport" style={{ padding: isMobile ? "54px 20px" : "86px 60px", background: PUB.wit, borderTop: `1px solid ${PUB.lijn}`, borderBottom: `1px solid ${PUB.lijn}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <Fade>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".88fr 1.12fr", gap: 34, alignItems: "end", marginBottom: 30 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Voorbeeld van de opbrengst</div>
                  <h2 style={{ fontSize: isMobile ? 30 : 44, lineHeight: 1.12, color: PUB.donker, marginBottom: 14 }}>Wat zie je terug na een teamscan?</h2>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: 0 }}>
                    Een teamscan levert geen losse cijfers op, maar een helder beeld van wat het team ervaart, waar perceptieverschillen zitten en welke vervolgstappen logisch zijn. Hieronder zie je enkele fictieve voorbeeldpagina’s uit een rapport van Mijn Teamkompas.
                  </p>
                </div>
                <div style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: isMobile ? 20 : 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: PUB.donker, marginBottom: 8 }}>Bewust als preview getoond</div>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: PUB.sub }}>
                    We tonen alleen voorbeeld-output met fictieve data. De volledige vragenlijst, scoringslogica en methodische uitwerking blijven onderdeel van het begeleide traject.
                  </div>
                </div>
              </div>
            </Fade>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16, alignItems: "stretch" }}>
              {[
                ["1", "Overzicht", "Een compact totaalbeeld van het team, inclusief kernscores en eerste duiding.", "/teamkompas-voorbeeldrapport-overzicht.jpg", "Fictieve voorbeeldpagina van een Mijn Teamkompas adviesrapport met overzicht en inleiding"],
                ["2", "Leidende inzichten", "De belangrijkste patronen, sterke punten en perceptiegaps in één oogopslag.", "/teamkompas-voorbeeldrapport-inzichten.jpg", "Fictieve voorbeeldpagina met leidende inzichten en domeinoverzicht uit een teamscan"],
                ["3", "Domeinanalyse", "Per domein wordt zichtbaar wat de data zegt en wat dit betekent voor team en leidinggevende.", "/teamkompas-voorbeeldrapport-domeinanalyse.jpg", "Fictieve voorbeeldpagina met domeinanalyse veiligheid en leiderschap uit een teamscanrapport"],
                ["4", "Vervolgstappen", "De uitkomsten worden vertaald naar prioriteiten, eerste acties en een 90-dagen richting.", "/teamkompas-voorbeeldrapport-conclusie.jpg", "Fictieve voorbeeldpagina met conclusie prioriteiten en vervolgstappen na een teamscan"]
              ].map(([nr, titel, tekst, image, alt], i) => (
                <Fade key={titel} delay={i * 0.05} style={{ height: "100%" }}>
                  <div style={{ height: "100%", background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 18px 44px rgba(13,27,42,0.08)", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", background: PUB.licht }}>
                      <img src={image} alt={alt} loading="lazy" style={{ width: "100%", height: isMobile ? 340 : 300, objectFit: "cover", objectPosition: "top center", display: "block", filter: "saturate(0.96)" }} />
                      <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(255,255,255,0.92)", color: PUB.tealDark, border: `1px solid ${PUB.lijn}`, borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Fictief voorbeeld
                      </div>
                    </div>
                    <div style={{ padding: 20, flex: 1 }}>
                      <div style={{ color: PUB.teal, fontWeight: 900, fontSize: 14, marginBottom: 8 }}>0{nr}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, marginBottom: 8 }}>{titel}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub }}>{tekst}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>

            <Fade delay={0.12}>
              <div style={{ marginTop: 28, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 16, alignItems: isMobile ? "stretch" : "center", background: PUB.donker, color: PUB.wit, borderRadius: 18, padding: isMobile ? 22 : 26 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Wil je dit voor je eigen team zichtbaar maken?</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.66)" }}>Start laagdrempelig met de digitale teamscan of plan eerst een verkennende kennismaking.</div>
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, flexShrink: 0 }}>
                  <span style={{ ...ctaStyle, display: "inline-block", background: PUB.teal }} onClick={() => navigate("/teamscan")}>Start teamscan</span>
                  <span style={{ border: "1px solid rgba(255,255,255,0.28)", color: PUB.wit, padding: "14px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center" }} onClick={openModal}>Plan kennismaking</span>
                </div>
              </div>
            </Fade>
          </div>
        </section>

        <section style={{ padding: isMobile ? "46px 20px" : "70px 60px", background: PUB.teal }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center", color: PUB.wit }}>
            <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.14, marginBottom: 14 }}>Wil je weten wat er in jouw team onder de oppervlakte speelt?</h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, opacity: .9, maxWidth: 720, margin: "0 auto 26px" }}>Begin met een korte verkenning. Daarna bepalen we samen of een teamscan, analyse of teamdag logisch is.</p>
            <span onClick={openModal} style={{ display: "inline-block", background: PUB.wit, color: PUB.tealDark, padding: "14px 24px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Plan een verkennende kennismaking</span>
          </div>
        </section>

        <section id="contact" style={{ padding: isMobile ? "48px 20px" : "70px 60px", background: PUB.donker }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ height: 3, display: "flex", marginBottom: 18 }}>
              {[PUB.groen, PUB.blauw, PUB.oranje, PUB.paars].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: PUB.wit, marginBottom: 4 }}>Mijn Teamkompas</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Organisatie · groei · richting</div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", cursor: "pointer" }} onClick={() => window.open("/privacyverklaring_mijnteamkompas.pdf", "_blank")}>Privacyverklaring</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", cursor: "pointer" }} onClick={() => window.open("/algemene_voorwaarden_mijnteamkompas.pdf", "_blank")}>Algemene voorwaarden</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", cursor: "pointer" }} onClick={onLoginClick}>Beheer</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={closeModal} bron="Homepage" />
    </>
  );
}



// ─────────────────────────────────────────────
// SCAN INVULLEN — resultaten naar Firestore
// ─────────────────────────────────────────────









function scoreColorByLabel(label) {
  if (label === "Excellentie") return ADM.green;
  if (label === "Kracht") return "#86efac";
  if (label === "Ontwikkelpunt") return ADM.orange;
  if (label === "Aandachtspunt") return ADM.red;
  return ADM.muted;
}


function interpretVerbeterenLerenScore(score) {
  return VERBETEREN_LEREN_INTERPRETATIE.find((r) => score >= r.min && score <= r.max) || null;
}

function getVerbeterenLerenDimensies(stellingen = VERBETEREN_LEREN_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    const key = `${s.dimensieCode}_${s.doelgroep}`;
    if (!seen.has(key)) {
      seen.set(key, { key, code: s.dimensieCode, naam: s.dimensie, doelgroep: s.doelgroep, vragen: [] });
    }
    seen.get(key).vragen.push(s);
  });
  return Array.from(seen.values());
}


function getEnergieMotivatieDimensies(stellingen = ENERGIE_MOTIVATIE_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, deel: s.deel, vragen: [] });
    }
    seen.get(s.dimensieCode).vragen.push(s);
  });
  return Array.from(seen.values());
}

function interpretEnergieMotivatieScore(code, score) {
  const isTaakeisOfUitputting = code.startsWith("A") || code === "C2";

  if (score >= 3 && score <= 6) {
    return isTaakeisOfUitputting
      ? { label: "Laag", advies: "Gunstig: lage belasting of uitputting." }
      : { label: "Laag", advies: "Aandachtspunt: weinig ondersteuning of energie." };
  }
  if (score >= 7 && score <= 10) {
    return isTaakeisOfUitputting
      ? { label: "Matig", advies: "Lichte belasting: bewust blijven volgen." }
      : { label: "Matig", advies: "Ontwikkelzone: versterking gewenst." };
  }
  if (score >= 11 && score <= 13) {
    return isTaakeisOfUitputting
      ? { label: "Hoog", advies: "Aandachtspunt: hoge belasting, interventie overwegen." }
      : { label: "Hoog", advies: "Kracht: sterke hulpbron, borgen en benutten." };
  }
  if (score >= 14 && score <= 15) {
    return isTaakeisOfUitputting
      ? { label: "Zeer hoog", advies: "Urgent: direct actie vereist, risico op uitval." }
      : { label: "Zeer hoog", advies: "Excellent: uitmuntend niveau, inzetten als best practice." };
  }
  return null;
}


function getBelevingVeranderingDimensies(stellingen = BELEVING_VERANDERING_STELLINGEN) {
  const seen = new Map();
  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, vragen: [] });
    }
    seen.get(s.dimensieCode).vragen.push(s);
  });
  return Array.from(seen.values());
}

function interpretBelevingVeranderingScore(score) {
  if (score >= 3 && score <= 6) {
    return { label: "Rood — Stresszone", advies: "Het brein van medewerkers ervaart waarschijnlijk een dreigingsrespons op dit gebied. Direct aandacht vereist: maak het bespreekbaar en stel een concreet actieplan op." };
  }
  if (score >= 7 && score <= 10) {
    return { label: "Oranje — Ontwikkelzone", advies: "Er is ruimte voor verbetering. De basis is aanwezig, maar medewerkers ervaren nog onvoldoende de voordelen van breinvriendelijk leiderschap op dit punt." };
  }
  if (score >= 11 && score <= 13) {
    return { label: "Groen — Comfortzone", advies: "Het brein ervaart voldoende veiligheid en activatie op dit gebied. Borgen en bewust blijven inzetten." };
  }
  if (score >= 14 && score <= 15) {
    return { label: "Blauw — Excellentiezone", advies: "Optimaal breinvriendelijk leiderschap op dit vlak. Gebruik dit als voorbeeld en deel de werkwijze met andere leidinggevenden." };
  }
  return null;
}


function getGecombineerdeOnderdelen(lijst) {
  return Array.isArray(lijst?.verdiepingOnderdelen) ? lijst.verdiepingOnderdelen : [];
}

// ─────────────────────────────────────────────
// ADMIN: SCAN BEHEER — Firestore
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// ADMIN: SCAN RESULTATEN (gap-analyse)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CSV-EXPORT PER SCAN — volledige data per respondent
// ─────────────────────────────────────────────
function exporteerScanAlsCsv(lijst, antwoorden) {
  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;
  const nu = new Date();
  const datumLabel = nu.toLocaleDateString("nl-NL").replace(/\//g, "-");

  // Helper: bereken domeinscores per respondent op basis van schaalvragen
  const berekenRespondentScores = (respondent) => {
    const pijlerMap = {};
    stellingen.filter(s => s.type === "schaal").forEach(s => {
      const val = respondent.antwoorden?.[s.id];
      if (val === undefined || val === null || val === "") return;
      const num = parseFloat(val);
      if (Number.isNaN(num)) return;
      const pijler = s.pijler !== undefined ? s.pijler : (s.dimensieCode || "overig");
      if (!pijlerMap[pijler]) pijlerMap[pijler] = [];
      pijlerMap[pijler].push(num);
    });
    const avg = arr => arr && arr.length ? Math.round((arr.reduce((a,b)=>a+b,0) / arr.length) * 100) / 100 : null;
    const pijlerLabels = {
      0: "Veiligheid en leiderschap",
      1: "Beleving van verandering",
      2: "Energie en motivatie",
      3: "Verbeteren en leren",
      4: "Gedrag (centraal)",
    };
    const result = {};
    Object.keys(pijlerMap).forEach(k => {
      const label = pijlerLabels[k] !== undefined ? pijlerLabels[k] : `Dimensie ${k}`;
      result[label] = avg(pijlerMap[k]);
    });
    return result;
  };

  // Escape helper voor CSV-waarden
  const esc = (val) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes(";")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Haal alle unieke domeinlabels op over alle respondenten heen voor kolomkoppen
  const alleDomeinen = new Set();
  antwoorden.forEach(a => {
    const scores = berekenRespondentScores(a);
    Object.keys(scores).forEach(d => alleDomeinen.add(d));
  });
  const domeinKolommen = Array.from(alleDomeinen).sort();

  // Sorteer stellingen op id voor consistente kolomvolgorde
  const stellingenGesorteerd = [...stellingen].sort((a,b) => (a.id || 0) - (b.id || 0));

  // Bouw header
  const header = [
    "respondent_id",
    "klant",
    "vragenlijst_naam",
    "vragenlijst_id",
    "scan_type",
    "rol",
    "ingediend_op",
    ...domeinKolommen.map(d => `score_${d}`),
    ...stellingenGesorteerd.map(s => {
      const prefix = s.type === "open" ? "open" : "schaal";
      const dim = s.dimensie ? ` [${s.dimensie}]` : (s.pijler !== undefined ? ` [pijler_${s.pijler}]` : "");
      return `${prefix}_${s.id}${dim}: ${s.tekst || ""}`;
    }),
  ];

  // Bouw rijen
  const rijen = antwoorden.map(a => {
    const ts = a.ingediend_op?.seconds
      ? new Date(a.ingediend_op.seconds * 1000).toISOString()
      : (a.ingediend_op || "");
    const scores = berekenRespondentScores(a);
    return [
      a.id || "",
      lijst.klant || "",
      lijst.naam || "",
      lijst.id || "",
      lijst.type || "basisscan",
      a.rol || "",
      ts,
      ...domeinKolommen.map(d => scores[d] !== null && scores[d] !== undefined ? scores[d] : ""),
      ...stellingenGesorteerd.map(s => {
        const val = a.antwoorden?.[s.id];
        return val === undefined || val === null ? "" : val;
      }),
    ].map(esc).join(",");
  });

  const csv = [header.map(esc).join(","), ...rijen].join("\n");

  // UTF-8 BOM zodat Excel het correct opent met speciale tekens
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const klantSlug = (lijst.klant || "onbekend").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  const naamSlug = (lijst.naam || "scan").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  a.href = url;
  a.download = `scan-export-${klantSlug}-${naamSlug}-${datumLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ScanResultaten({ lijst, antwoorden, onBack }) {
  const [open,    setOpen]    = useState(null);
  const [tabBlad, setTabBlad] = useState("gap");
  const [verdiepingMaken, setVerdiepingMaken] = useState(false);
  const [verdiepingInfo, setVerdiepingInfo] = useState(null);

  const teamleden  = antwoorden.filter(a=>a.rol==="Teamlid");
  const management = antwoorden.filter(a=>a.rol==="Leidinggevende");
  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;

  // CSV-export: volledige data per respondent — antwoorden + vragen + scores + metadata
  const downloadCsvPerScan = () => {
    exporteerScanAlsCsv(lijst, antwoorden);
  };

  const gemPijler = (pijlerIdx, subset) => {
    const ids  = stellingen.filter(s=>s.pijler===pijlerIdx && s.type==="schaal").map(s=>s.id);
    const vals = subset.flatMap(a=>ids.map(id=>a.antwoorden?.[id]).filter(Boolean));
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : null;
  };

  const scoreKleur = s => !s||isNaN(s) ? ADM.muted : parseFloat(s)>=4 ? ADM.green : parseFloat(s)>=3 ? ADM.orange : ADM.red;
  const gapKleur   = g => { const a=Math.abs(parseFloat(g)); return a>=1.5?ADM.red:a>=0.8?ADM.orange:ADM.green; };
  const gapLabel   = g => {
    const a=Math.abs(parseFloat(g)), r=parseFloat(g)>0?"Management scoort hoger":"Team scoort hoger";
    return a>=1.5?`⚠️ Grote kloof — ${r}`:a>=0.8?`📍 Merkbaar verschil — ${r}`:`✓ Kleine kloof — ${r}`;
  };

  const tabStijl = (t) => ({
    padding:"10px 14px", fontSize:12, fontWeight:tabBlad===t?700:400, cursor:"pointer",
    border:"none", borderBottom:`3px solid ${tabBlad===t?ADM.teal:"transparent"}`,
    background:"transparent", color:tabBlad===t?ADM.teal:ADM.muted, whiteSpace:"nowrap",
  });

  const ScoresBalk = ({ subset, kleur }) => (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
      {PIJLERS.map((p,i)=>{
        const gem = gemPijler(i, subset);
        return (
          <div key={i} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:p.kleur,flexShrink:0}}/>
              <div style={{fontSize:11,color:ADM.text,fontWeight:600,lineHeight:1.3}}>{p.naam}</div>
            </div>
            <div style={{fontSize:26,fontWeight:700,color:kleur,marginBottom:6,lineHeight:1}}>{gem||"—"}</div>
            <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,width:gem?`${(parseFloat(gem)/5)*100}%`:"0%",background:kleur}}/>
            </div>
          </div>
        );
      })}
    </div>
  );


  const maakVerdiependeScan = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping veiligheid en leiderschap`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_veiligheid_leiderschap",
        parentVragenlijstId: lijst.id,
        stellingen: VEILIGHEID_LEIDERSCHAP_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), veiligheid: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const maakVerdiepingVerbeterenLeren = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping verbeteren en leren`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_verbeteren_leren",
        parentVragenlijstId: lijst.id,
        stellingen: VERBETEREN_LEREN_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), verbeterenLeren: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan verbeteren en leren aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const veiligheidScoreTeam = gemPijler(0, teamleden);
  const veiligheidScoreManagement = gemPijler(0, management);
  const verbeterenLerenScoreTeam = gemPijler(3, teamleden);
  const verbeterenLerenScoreManagement = gemPijler(3, management);

  const energieMotivatieScoreTeam = gemPijler(2, teamleden);
  const energieMotivatieScoreManagement = gemPijler(2, management);

  const belevingVeranderingScoreTeam = gemPijler(1, teamleden);
  const belevingVeranderingScoreManagement = gemPijler(1, management);

  const maakVerdiepingBelevingVerandering = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping beleving van verandering`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_beleving_verandering",
        parentVragenlijstId: lijst.id,
        stellingen: BELEVING_VERANDERING_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), belevingVerandering: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan beleving van verandering aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const maakVerdiepingEnergieMotivatie = async () => {
    setVerdiepingMaken(true);
    try {
      const data = {
        naam: `${lijst.klant} — Verdieping energie en motivatie`,
        klant: lijst.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status: "Actief",
        type: "verdieping_energie_motivatie",
        parentVragenlijstId: lijst.id,
        stellingen: ENERGIE_MOTIVATIE_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setVerdiepingInfo(prev => ({ ...(prev || {}), energieMotivatie: { id: ref.id, ...data } }));
    } catch (err) {
      console.error("Verdiepende scan energie en motivatie aanmaken mislukt:", err);
    } finally {
      setVerdiepingMaken(false);
    }
  };

  const veiligheidAandacht =
    (veiligheidScoreTeam && parseFloat(veiligheidScoreTeam) < 3.5) ||
    (veiligheidScoreManagement && parseFloat(veiligheidScoreManagement) < 3.5) ||
    (!veiligheidScoreManagement && veiligheidScoreTeam && parseFloat(veiligheidScoreTeam) < 3.5);

  const verbeterenLerenAandacht =
    (verbeterenLerenScoreTeam && parseFloat(verbeterenLerenScoreTeam) < 3.5) ||
    (verbeterenLerenScoreManagement && parseFloat(verbeterenLerenScoreManagement) < 3.5) ||
    (!verbeterenLerenScoreManagement && verbeterenLerenScoreTeam && parseFloat(verbeterenLerenScoreTeam) < 3.5);

  const energieMotivatieAandacht =
    (energieMotivatieScoreTeam && parseFloat(energieMotivatieScoreTeam) < 3.5) ||
    (energieMotivatieScoreManagement && parseFloat(energieMotivatieScoreManagement) < 3.5) ||
    (!energieMotivatieScoreManagement && energieMotivatieScoreTeam && parseFloat(energieMotivatieScoreTeam) < 3.5);

  const belevingVeranderingAandacht =
    (belevingVeranderingScoreTeam && parseFloat(belevingVeranderingScoreTeam) < 3.5) ||
    (belevingVeranderingScoreManagement && parseFloat(belevingVeranderingScoreManagement) < 3.5) ||
    (!belevingVeranderingScoreManagement && belevingVeranderingScoreTeam && parseFloat(belevingVeranderingScoreTeam) < 3.5);

  const VerdieningIntro = () => {
    const aanbevolenOnderdelen = [
      veiligheidAandacht ? "veiligheid_leiderschap" : null,
      verbeterenLerenAandacht ? "verbeteren_leren" : null,
      energieMotivatieAandacht ? "energie_motivatie" : null,
      belevingVeranderingAandacht ? "beleving_verandering" : null,
    ].filter(Boolean);

    const heeftMeerdereAanbevolen = aanbevolenOnderdelen.length > 1;

    const maakGecombineerdeVerdieping = async () => {
      setVerdiepingMaken(true);
      try {
        const data = {
          naam: `${lijst.klant} — ${gecombineerdeVerdiepingTitel(aanbevolenOnderdelen)}`,
          klant: lijst.klant,
          aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
          status: "Actief",
          type: "verdieping_gecombineerd",
          parentVragenlijstId: lijst.id,
          verdiepingOnderdelen: aanbevolenOnderdelen,
          stellingen: flattenVerdiepingStellingen(aanbevolenOnderdelen),
        };
        const ref = await addDoc(collection(db, "vragenlijsten"), data);
        setVerdiepingInfo(prev => ({ ...(prev || {}), gecombineerd: { id: ref.id, ...data } }));
      } catch (err) {
        console.error("Gecombineerde verdiepende scan aanmaken mislukt:", err);
      } finally {
        setVerdiepingMaken(false);
      }
    };

    const verdiepingKaart = (config) => {
      const { key, titel, beschrijving, infoKey, maakFn, score, kleur } = config;
      const isAanbevolen = aanbevolenOnderdelen.includes(key);
      const info = verdiepingInfo?.[infoKey];
      return (
        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${isAanbevolen ? kleur+"55" : ADM.border}`,borderRadius:10,padding:"12px 14px",position:"relative"}}>
          {isAanbevolen && (
            <span style={{position:"absolute",top:10,right:10,fontSize:10,fontWeight:700,
              padding:"3px 8px",borderRadius:20,background:kleur+"22",color:kleur}}>
              Aanbevolen
            </span>
          )}
          <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:4,paddingRight:90}}>{titel}</div>
          {score !== null && (
            <div style={{fontSize:11,color:isAanbevolen?"#f39c12":ADM.muted,marginBottom:6}}>
              Score: {parseFloat(score).toFixed(1)}{isAanbevolen ? " — vraagt extra aandacht" : " — voldoende, optionele verdieping"}
            </div>
          )}
          {score === null && (
            <div style={{fontSize:11,color:ADM.muted,marginBottom:6}}>Nog geen score beschikbaar</div>
          )}
          <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>{beschrijving}</div>
          {info ? (
            <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${info.id}`); } catch {} }}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              🔗 Kopieer deelnemerslink
            </button>
          ) : (
            <button onClick={maakFn} disabled={verdiepingMaken}
              style={{background:isAanbevolen?ADM.teal:"rgba(255,255,255,0.06)",
                color:isAanbevolen?ADM.navyDeep:ADM.white,
                border:isAanbevolen?"none":`1px solid ${ADM.border}`,
                borderRadius:8,padding:"9px 14px",fontWeight:700,fontSize:12,
                cursor:verdiepingMaken?"wait":"pointer"}}>
              {verdiepingMaken ? "Aanmaken..." : `Start verdiepende scan`}
            </button>
          )}
        </div>
      );
    };

    return (
      <div style={{background:"rgba(15,118,110,0.08)",border:`1px solid ${ADM.tealGlow}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
        <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
          Vervolgonderzoek
        </div>
        <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:8}}>
          Verdiepende scans
        </div>
        <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65,marginBottom:14}}>
          {aanbevolenOnderdelen.length > 0
            ? `Op ${aanbevolenOnderdelen.length === 1 ? "één domein" : aanbevolenOnderdelen.length + " domeinen"} is een verdiepende scan aanbevolen. Je kunt ook op elk ander domein een verdieping inzetten.`
            : "Alle scores liggen boven de aandachtsdrempel. Je kunt alsnog op elk domein een verdiepende scan inzetten naar keuze."}
        </div>

        {heeftMeerdereAanbevolen && (
          <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.teal}44`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:ADM.white,marginBottom:6}}>
              Gecombineerde verdiepingsscan <span style={{fontSize:11,fontWeight:400,color:ADM.teal}}>Aanbevolen</span>
            </div>
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginBottom:10}}>
              Combineert alle aanbevolen domeinen in één link: {aanbevolenOnderdelen.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean).join(" + ")}
            </div>
            {verdiepingInfo?.gecombineerd ? (
              <button onClick={async()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}?scan=${verdiepingInfo.gecombineerd.id}`); } catch {} }}
                style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                🔗 Kopieer gecombineerde deelnemerslink
              </button>
            ) : (
              <button onClick={maakGecombineerdeVerdieping} disabled={verdiepingMaken}
                style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verdiepingMaken?"wait":"pointer"}}>
                {verdiepingMaken ? "Aanmaken..." : "Maak gecombineerde verdiepingslink"}
              </button>
            )}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
          {verdiepingKaart({ key:"veiligheid_leiderschap", titel:"Veiligheid en leiderschap", beschrijving:"9 Secure Base Leadership-dimensies — beschikbaarheid, empathie, vertrouwen, uitdagen en meer.", infoKey:"veiligheid", maakFn:maakVerdiependeScan, score:veiligheidScoreTeam, kleur:"#5A8C3C" })}
          {verdiepingKaart({ key:"beleving_verandering",   titel:"Beleving van verandering", beschrijving:"Neuromanagement-verdieping op breinvriendelijk leiderschap en SCARF-dimensies.", infoKey:"belevingVerandering", maakFn:maakVerdiepingBelevingVerandering, score:belevingVeranderingScoreTeam, kleur:"#3A7DBF" })}
          {verdiepingKaart({ key:"energie_motivatie",      titel:"Energie en motivatie", beschrijving:"JD-R verdieping op taakeisen, hulpbronnen, bevlogenheid en uitputting.", infoKey:"energieMotivatie", maakFn:maakVerdiepingEnergieMotivatie, score:energieMotivatieScoreTeam, kleur:"#E8821A" })}
          {verdiepingKaart({ key:"verbeteren_leren",       titel:"Verbeteren en leren", beschrijving:"Lean- en Agile-volwassenheid vanuit twee perspectieven: leidinggevende en teamspiegel.", infoKey:"verbeterenLeren", maakFn:maakVerdiepingVerbeterenLeren, score:verbeterenLerenScoreTeam, kleur:"#6B4E9E" })}
        </div>
      </div>
    );
  };

  const DeelnemersLijst = ({ subset }) => (
    <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,overflow:"hidden"}}>
      {subset.map(a=>(
        <div key={a.id}>
          <div onClick={()=>setOpen(open===a.id?null:a.id)}
            style={{padding:"14px 20px",borderBottom:`1px solid rgba(255,255,255,0.04)`,cursor:"pointer",
              background:open===a.id?ADM.tealGlow:"transparent",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,color:ADM.white,fontSize:13}}>
                Anoniem
                <span style={{fontSize:11,color:a.rol==="Leidinggevende"?"#a78bfa":ADM.muted,fontWeight:400,marginLeft:6}}>({a.rol})</span>
              </div>
            </div>
            <span style={{color:ADM.teal,fontSize:13}}>{open===a.id?"▲":"▼"}</span>
          </div>
          {open===a.id && (
            <div style={{padding:"16px 20px",background:"rgba(0,0,0,0.15)",borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
              {stellingen.map(s=>(
                <div key={s.id} style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:ADM.muted,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:PIJLERS[s.pijler]?.kleur,flexShrink:0}}/>
                    {s.tekst}
                  </div>
                  {s.type==="schaal" ? (
                    <div style={{display:"flex",gap:5}}>
                      {[1,2,3,4,5].map(n=>(
                        <div key={n} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",
                          justifyContent:"center",fontSize:12,fontWeight:700,
                          background:a.antwoorden?.[s.id]===n?ADM.teal:"rgba(255,255,255,0.05)",
                          color:a.antwoorden?.[s.id]===n?ADM.navyDeep:ADM.muted}}>{n}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 14px",borderRadius:8}}>
                      {a.antwoorden?.[s.id]||<em style={{color:ADM.muted}}>Geen antwoord</em>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {subset.length === 0 && (
        <div style={{padding:24,color:ADM.muted,fontSize:13,textAlign:"center"}}>Nog geen deelnemers.</div>
      )}
    </div>
  );

  if (isGecombineerdeVerdieping(lijst)) {
    const onderdelen = getGecombineerdeOnderdelen(lijst);

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
            ← Terug naar vragenlijsten
          </button>
          <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
            style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
              color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
              border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
              borderRadius:8,padding:"8px 14px",fontSize:12,
              cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
            title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
            ⬇ Download CSV
          </button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · gecombineerde verdiepingsscan
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Gecombineerde scan
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Deze scan combineert meerdere verdiepende onderdelen in één deelnemerslink:
            <strong style={{color:ADM.white}}> {onderdelen.map((k) => VERDIEPING_BLOKKEN[k]?.titel).filter(Boolean).join(" + ")}</strong>.
            De inhoudelijke interpretatie gebeurt per onderdeel.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {onderdelen.map((k) => (
            <div key={k} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
              <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:6}}>
                {VERDIEPING_BLOKKEN[k]?.titel}
              </div>
              <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65}}>
                Gebruik dezelfde deelnemerslink om dit onderdeel mee te nemen. Open de resultaten later opnieuw om de scores en interpretatie per verdiepend onderdeel te bekijken.
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isBelevingVeranderingVerdieping(lijst)) {
    const dimensies = getBelevingVeranderingDimensies(stellingen);

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const gem = scoreGemiddelde(ids, antwoorden);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretBelevingVeranderingScore(totaal) : null;
      return { ...d, gem, totaal, interpretatie };
    });

    const kleurVanLabel = (label) => {
      if (label?.startsWith("Rood")) return ADM.red;
      if (label?.startsWith("Oranje")) return ADM.orange;
      if (label?.startsWith("Groen")) return ADM.green;
      if (label?.startsWith("Blauw")) return PUB.blauw;
      return ADM.muted;
    };

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
            ← Terug naar vragenlijsten
          </button>
          <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
            style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
              color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
              border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
              borderRadius:8,padding:"8px 14px",fontSize:12,
              cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
            title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
            ⬇ Download CSV
          </button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · neurowetenschappelijke verdieping op leiderschap en veranderbeleving
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = rood, 7–10 = oranje, 11–13 = groen, 14–15 = blauw.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur = kleurVanLabel(d.interpretatie?.label);
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>{d.interpretatie.label}</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Betekenis & aanbeveling:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {BELEVING_VERANDERING_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEnergieMotivatieVerdieping(lijst)) {
    const dimensies = getEnergieMotivatieDimensies(stellingen);

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const gem = scoreGemiddelde(ids, antwoorden);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
      return { ...d, gem, totaal, interpretatie };
    });

    const somDeel = (prefix) => dimensieScores.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
    const somTaakeisen = somDeel("A");
    const somHulpbronnen = somDeel("B");
    const balans = somTaakeisen - somHulpbronnen;

    let balansLabel = "In balans";
    let balansUitleg = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    let balansKleur = ADM.green;
    if (balans < -20) {
      balansLabel = "Sterk negatief";
      balansUitleg = "Hulpbronnen domineren: zeer gunstig. Kans op bevlogenheid is hoog.";
      balansKleur = ADM.green;
    } else if (balans >= -20 && balans <= 0) {
      balansLabel = "In balans";
      balansUitleg = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
      balansKleur = "#86efac";
    } else if (balans > 0 && balans <= 20) {
      balansLabel = "Lichte onbalans";
      balansUitleg = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
      balansKleur = ADM.orange;
    } else if (balans > 20) {
      balansLabel = "Taakeisen domineren";
      balansUitleg = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist.";
      balansKleur = ADM.red;
    }

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
            ← Terug naar vragenlijsten
          </button>
          <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
            style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
              color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
              border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
              borderRadius:8,padding:"8px 14px",fontSize:12,
              cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
            title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
            ⬇ Download CSV
          </button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · JD-R verdieping op belasting, hulpbronnen en uitkomsten
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Totaal taakeisen</div>
            <div style={{fontSize:28,fontWeight:700,color:ADM.orange}}>{somTaakeisen}</div>
          </div>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Totaal hulpbronnen</div>
            <div style={{fontSize:28,fontWeight:700,color:ADM.green}}>{somHulpbronnen}</div>
          </div>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Balans A − B</div>
            <div style={{fontSize:28,fontWeight:700,color:balansKleur}}>{balans > 0 ? `+${balans}` : balans}</div>
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Balansanalyse
          </div>
          <div style={{fontSize:14,fontWeight:700,color:balansKleur,marginBottom:6}}>{balansLabel}</div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>{balansUitleg}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur =
              d.code.startsWith("A") || d.code === "C2"
                ? (d.totaal >= 14 ? ADM.red : d.totaal >= 11 ? ADM.orange : "#86efac")
                : (d.totaal >= 14 ? ADM.green : d.totaal >= 11 ? "#86efac" : d.totaal >= 7 ? ADM.orange : ADM.red);

            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code} · {d.deel}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>{d.interpretatie.label}</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Betekenis:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ENERGIE_MOTIVATIE_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isVerbeterenLerenVerdieping(lijst)) {
    const dimensies = getVerbeterenLerenDimensies(stellingen);
    const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
    const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");

    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieGroepen = ["L1","L2","L3","L4","A1","A2","A3","A4"].map(code => {
      const leidinggevendeDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
      const teamDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
      const leidinggevendeGem = leidinggevendeDim ? scoreGemiddelde(leidinggevendeDim.vragen.map(v=>v.id), leidinggevendeAntwoorden) : null;
      const teamGem = teamDim ? scoreGemiddelde(teamDim.vragen.map(v=>v.id), teamAntwoorden) : null;
      const leidinggevendeTotaal = leidinggevendeGem !== null ? Math.round(leidinggevendeGem * 3) : null;
      const teamTotaal = teamGem !== null ? Math.round(teamGem * 3) : null;
      const verschil = leidinggevendeTotaal !== null && teamTotaal !== null ? leidinggevendeTotaal - teamTotaal : null;
      const interpretLeiding = leidinggevendeTotaal !== null ? interpretVerbeterenLerenScore(leidinggevendeTotaal) : null;
      const interpretTeam = teamTotaal !== null ? interpretVerbeterenLerenScore(teamTotaal) : null;
      return {
        code,
        naam: leidinggevendeDim?.naam || teamDim?.naam || code,
        leidinggevendeDim,
        teamDim,
        leidinggevendeTotaal,
        teamTotaal,
        verschil,
        interpretLeiding,
        interpretTeam,
      };
    });

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
            ← Terug naar vragenlijsten
          </button>
          <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
            style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
              color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
              border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
              borderRadius:8,padding:"8px 14px",fontSize:12,
              cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
            title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
            ⬇ Download CSV
          </button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · Lean- en Agile-volwassenheid vanuit leidinggevende en teamspiegel
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = beginner, 7–9 = lerend, 10–12 = ontwikkelend, 13–15 = volwassen.
            Een verschil groter dan 3 punten tussen leidinggevende en team is betekenisvol en verdient bespreking.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieGroepen.map((d)=> {
            const verschilBetekenisvol = d.verschil !== null && Math.abs(d.verschil) > 3;
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  {verschilBetekenisvol && (
                    <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${ADM.orange}22`,color:ADM.orange}}>
                      Verschil {d.verschil > 0 ? "+" : ""}{d.verschil}
                    </span>
                  )}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Leidinggevende</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{fontSize:24,fontWeight:700,color:scoreColorByLabel(d.interpretLeiding?.label)}}>{d.leidinggevendeTotaal ?? "—"}</div>
                      {d.interpretLeiding && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${scoreColorByLabel(d.interpretLeiding.label)}22`,color:scoreColorByLabel(d.interpretLeiding.label)}}>{d.interpretLeiding.label}</span>}
                    </div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                      {d.interpretLeiding?.advies || "Nog onvoldoende data voor interpretatie."}
                    </div>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Teamspiegel</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{fontSize:24,fontWeight:700,color:scoreColorByLabel(d.interpretTeam?.label)}}>{d.teamTotaal ?? "—"}</div>
                      {d.interpretTeam && <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${scoreColorByLabel(d.interpretTeam.label)}22`,color:scoreColorByLabel(d.interpretTeam.label)}}>{d.interpretTeam.label}</span>}
                    </div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                      {d.interpretTeam?.advies || "Nog onvoldoende data voor interpretatie."}
                    </div>
                  </div>
                </div>

                {verschilBetekenisvol && (
                  <div style={{fontSize:12,color:ADM.orange,lineHeight:1.65,background:"rgba(243,156,18,0.08)",padding:"10px 12px",borderRadius:8}}>
                    Deze dimensie laat een betekenisvol verschil zien tussen zelfreflectie van de leidinggevende en de teamspiegel. Gebruik dit als gespreksthema.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {VERBETEREN_LEREN_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isVeiligheidLeiderschapVerdieping(lijst)) {
    const dimensies = getVeiligheidLeiderschapDimensies(stellingen);
    const scoreGemiddelde = (vraagIds, subset) => {
      const vals = subset.flatMap(a => vraagIds.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0) / vals.length) : null;
    };

    const dimensieScores = dimensies.map((d) => {
      const ids = d.vragen.map(v => v.id);
      const totaalGem = scoreGemiddelde(ids, antwoorden);
      const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
      const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(
    totaal,
    VEILIGHEID_LEIDERSCHAP_INTERPRETATIE
  )
: null;
      return { ...d, totaalGem, totaal, interpretatie };
    });

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
            ← Terug naar vragenlijsten
          </button>
          <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
            style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
              color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
              border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
              borderRadius:8,padding:"8px 14px",fontSize:12,
              cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
            title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
            ⬇ Download CSV
          </button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
          <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
            {antwoorden.length} deelnemer(s) · verdiepende scan veiligheid en leiderschap
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
            Score-interpretatie
          </div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
            Per dimensie worden drie vragen samengenomen tot een totaalscore van 3–15.
            3–6 = aandachtspunt, 7–10 = ontwikkelpunt, 11–13 = kracht, 14–15 = excellentie.
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {dimensieScores.map((d)=> {
            const kleur = scoreColorByLabel(d.interpretatie?.label);
            return (
              <div key={d.code} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{d.code}</div>
                    <div style={{fontSize:15,fontWeight:700,color:ADM.white}}>{d.naam}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24,fontWeight:700,color:kleur}}>{d.totaal ?? "—"}</div>
                    {d.interpretatie && (
                      <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${kleur}22`,color:kleur}}>
                        {d.interpretatie.label}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:12}}>
                  {d.vragen.map(v => {
                    const avg = scoreGemiddelde([v.id], antwoorden);
                    return (
                      <div key={v.id} style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{fontSize:12,color:ADM.text,flex:1,lineHeight:1.5}}>{v.tekst}</div>
                        <div style={{width:42,textAlign:"right",fontSize:13,fontWeight:700,color:avg !== null ? ADM.white : ADM.muted}}>
                          {avg !== null ? avg.toFixed(1) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.65,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                  <strong style={{color:ADM.white}}>Aanbeveling:</strong> {d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
            Reflectievragen
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN.map((vraag, i)=>(
              <div key={i} style={{fontSize:13,color:ADM.text,lineHeight:1.6,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
                {i+1}. {vraag}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,fontSize:13,cursor:"pointer",padding:0,fontWeight:600}}>
          ← Terug naar vragenlijsten
        </button>
        <button onClick={downloadCsvPerScan} disabled={antwoorden.length === 0}
          style={{background:antwoorden.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
            color:antwoorden.length === 0 ? ADM.muted : ADM.teal,
            border:`1px solid ${antwoorden.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
            borderRadius:8,padding:"8px 14px",fontSize:12,
            cursor:antwoorden.length === 0 ? "not-allowed" : "pointer",fontWeight:700}}
          title={antwoorden.length === 0 ? "Nog geen respondenten" : "Download volledige data als CSV"}>
          ⬇ Download CSV
        </button>
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
        <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
          {antwoorden.length} deelnemers · {teamleden.length} teamleden · {management.length} leidinggevenden · {lijst.klant}
        </div>
        {<VerdieningIntro />}
        <div style={{display:"flex",borderBottom:`1px solid ${ADM.border}`,overflowX:"auto"}}>
          {[["gap","🔍 Gap-analyse"],["team","👥 Team"],["management","👔 Management"],["individueel","📋 Individueel"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTabBlad(v)} style={tabStijl(v)}>{l}</button>
          ))}
        </div>
      </div>

      {tabBlad==="gap" && (
        <div>
          <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7,marginBottom:20,
            background:"rgba(0,168,150,0.06)",padding:"12px 16px",borderRadius:10,
            borderLeft:`3px solid ${ADM.teal}`}}>
            De <strong style={{color:ADM.white}}>Gap-analyse</strong> toont het verschil tussen hoe het{" "}
            <strong style={{color:"#86efac"}}>team</strong> en het{" "}
            <strong style={{color:"#a78bfa"}}>management</strong> de situatie beleeft.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {PIJLERS.map((p,i)=>{
              const gT = parseFloat(gemPijler(i, teamleden));
              const gM = parseFloat(gemPijler(i, management));
              const gap = (!isNaN(gT)&&!isNaN(gM)) ? (gM-gT).toFixed(1) : null;
              return (
                <div key={i} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:p.kleur,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:ADM.white,fontSize:14}}>{p.naam}</span>
                    </div>
                    {gap && <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                      background:`${gapKleur(gap)}22`,color:gapKleur(gap)}}>
                      Gap: {parseFloat(gap)>0?"+":""}{gap}
                    </span>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                    {[["👥 Team","#86efac",gT],["👔 Management","#a78bfa",gM]].map(([label,kleur,score])=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:11,color:kleur,fontWeight:600,width:100,flexShrink:0}}>{label}</div>
                        <div style={{flex:1,height:9,background:"rgba(255,255,255,0.06)",borderRadius:5,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:5,background:kleur,width:isNaN(score)?"0%":`${(score/5)*100}%`}}/>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:kleur,width:28,textAlign:"right"}}>
                          {isNaN(score)?"—":score.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {gap && <div style={{fontSize:12,color:gapKleur(gap),background:`${gapKleur(gap)}11`,padding:"8px 12px",borderRadius:8}}>
                    {gapLabel(gap)}
                  </div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tabBlad==="team"        && <><ScoresBalk subset={teamleden}  kleur="#86efac"/><DeelnemersLijst subset={teamleden}/></>}
      {tabBlad==="management"  && <><ScoresBalk subset={management} kleur="#a78bfa"/><DeelnemersLijst subset={management}/></>}
      {tabBlad==="individueel" && <DeelnemersLijst subset={antwoorden}/>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN: CONTACTAANVRAGEN — echte Firestore-data
// ─────────────────────────────────────────────
function PageContactaanvragen() {
  const [aanvragen, setAanvragen] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const laadAanvragen = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "contactaanvragen"), orderBy("aangemaakt_op", "desc"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const datum = data.aangemaakt_op?.toDate?.().toLocaleDateString("nl-NL", {
            day: "numeric", month: "short", year: "numeric",
          }) || "-";
          return {
            id: d.id,
            naam: data.naam || "",
            org: data.organisatie || "",
            email: data.email || "",
            tel: data.telefoon || "",
            bericht: data.bericht || "",
            datum,
            status: data.status || "Nieuw",
          };
        });
        setAanvragen(rows);
      } catch (err) {
        console.error("Fout bij laden contactaanvragen:", err);
      } finally {
        setLoading(false);
      }
    };
    laadAanvragen();
  }, []);

  const updateStatus = async (id, nieuweStatus) => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, "contactaanvragen", id), { status: nieuweStatus });
      setAanvragen(prev => prev.map(a => a.id === id ? { ...a, status: nieuweStatus } : a));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: nieuweStatus }));
    } catch (err) {
      console.error("Status bijwerken mislukt:", err);
    } finally {
      setUpdating(null);
    }
  };

  const statusColor = (s) =>
    s === "Nieuw" ? ADM.teal : s === "In behandeling" ? ADM.orange : s === "Verwerkt" ? ADM.green : ADM.muted;

  const statusBg = (s) =>
    s === "Nieuw" ? "rgba(0,168,150,0.12)"
    : s === "In behandeling" ? "rgba(243,156,18,0.12)"
    : s === "Verwerkt" ? "rgba(46,204,113,0.12)"
    : "rgba(255,255,255,0.05)";

  if (loading) return <div style={{ color: ADM.muted, padding: 20 }}>Laden...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: ADM.muted, marginBottom: 20 }}>
          {aanvragen.filter(a => a.status === "Nieuw").length} nieuwe aanvragen ·{" "}
          {aanvragen.filter(a => a.status === "In behandeling").length} in behandeling ·{" "}
          {aanvragen.length} totaal
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aanvragen.map((a) => (
            <div key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              style={{
                background: a.status === "Verwerkt" ? "rgba(255,255,255,0.02)" : ADM.navy,
                border: `1px solid ${selected?.id === a.id ? ADM.teal : ADM.border}`,
                borderRadius: 12, padding: "18px 22px", cursor: "pointer",
                opacity: a.status === "Verwerkt" ? 0.65 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: ADM.white, fontSize: 15 }}>{a.naam}</div>
                  <div style={{ fontSize: 12, color: ADM.muted, marginTop: 2 }}>{a.org} · {a.datum}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: statusBg(a.status), color: statusColor(a.status), flexShrink: 0 }}>
                  {a.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {a.bericht}
              </div>
            </div>
          ))}
          {aanvragen.length === 0 && (
            <div style={{ color: ADM.muted, fontSize: 14, padding: 20, textAlign: "center" }}>
              Nog geen contactaanvragen ontvangen.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div style={{ background: ADM.navy, border: `1px solid ${ADM.border}`, borderRadius: 12, padding: "24px", height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: ADM.white, fontSize: 16 }}>Detail</div>
            <span onClick={() => setSelected(null)} style={{ cursor: "pointer", color: ADM.muted, fontSize: 20 }}>×</span>
          </div>

          {/* Status badge */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              background: statusBg(selected.status), color: statusColor(selected.status) }}>
              {selected.status}
            </span>
          </div>

          {[["Naam", selected.naam], ["Organisatie", selected.org], ["E-mail", selected.email], ["Telefoon", selected.tel || "-"]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: ADM.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, color: ADM.white }}>{v}</div>
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: ADM.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Bericht</div>
            <div style={{ fontSize: 13, color: ADM.text, lineHeight: 1.7, background: "rgba(255,255,255,0.04)", padding: "12px 14px", borderRadius: 8 }}>
              {selected.bericht}
            </div>
          </div>

          {/* Acties */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href={`mailto:${selected.email}`}
              style={{ display: "block", width: "100%", background: ADM.teal, color: ADM.navyDeep,
                border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
              Reageer via e-mail
            </a>

            {selected.status !== "In behandeling" && selected.status !== "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "In behandeling"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(243,156,18,0.15)", color: ADM.orange,
                  border: `1px solid rgba(243,156,18,0.3)`, borderRadius: 8, padding: "11px",
                  fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                📋 Markeer als in behandeling
              </button>
            )}

            {selected.status !== "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "Verwerkt"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(46,204,113,0.15)", color: ADM.green,
                  border: `1px solid rgba(46,204,113,0.3)`, borderRadius: 8, padding: "11px",
                  fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {updating === selected.id ? "Opslaan..." : "✓ Markeer als verwerkt"}
              </button>
            )}

            {selected.status === "Verwerkt" && (
              <button
                onClick={e => { e.stopPropagation(); updateStatus(selected.id, "Nieuw"); }}
                disabled={updating === selected.id}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", color: ADM.muted,
                  border: `1px solid ${ADM.border}`, borderRadius: 8, padding: "11px",
                  fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                ↩ Zet terug naar nieuw
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageKlanten() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [klanten, setKlanten] = useState([]);
  const [vragenlijsten, setVragenlijsten] = useState([]);
  const [metingen, setMetingen] = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [contactaanvragen, setContactaanvragen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTrajectForm, setShowTrajectForm] = useState(false);
  const [showMetingForm, setShowMetingForm] = useState(false);
  const [opslaan, setOpslaan] = useState(false);
  const [opslaanTraject, setOpslaanTraject] = useState(false);
  const [opslaanMeting, setOpslaanMeting] = useState(false);
  const [verwijderenKlant, setVerwijderenKlant] = useState(false);
  const [verwijderenSamengesteld, setVerwijderenSamengesteld] = useState(false);
  const [bewerkModus, setBewerkModus] = useState(false);
  const [bewerkData, setBewerkData] = useState({});
  const [opslaan_bewerk, setOpslaanBewerk] = useState(false);
  const [selectedKlant, setSelectedKlant] = useState(null);
  const [selectedTrajectId, setSelectedTrajectId] = useState(null);
  const [selectedMetingId, setSelectedMetingId] = useState(null);
  const [gekopieerd, setGekopieerd] = useState(null);
  const [nieuw, setNieuw] = useState({ naam:"", sector:"", contact:"", email:"", status:"Actief" });
  const [nieuwTraject, setNieuwTraject] = useState({ naam:"", status:"Actief", scanType:"medewerkers" });
  const [nieuweMeting, setNieuweMeting] = useState({
    trajectId:"",
    trajectNaam:"",
    type:"T1 Meting",
    datum:"",
    respondenten:"",
    scores:{}
  });

  const pijlerNamenMeting = ["Veiligheid en leiderschap","Beleving van verandering","Energie en motivatie","Verbeteren en leren","Gedrag (centraal)"];

  const parseDateFlexible = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      const d1 = new Date(val);
      if (!Number.isNaN(d1.getTime())) return d1;
      const m = val.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/) || val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const d2 = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        if (!Number.isNaN(d2.getTime())) return d2;
      }
    }
    if (val?.seconds) return new Date(val.seconds * 1000);
    return null;
  };

  const fmtDate = (val) => {
    const d = parseDateFlexible(val);
    return d ? d.toLocaleDateString("nl-NL") : (typeof val === "string" ? val : "—");
  };

  const laadData = async () => {
    setLoading(true);

    const veiligeGetDocs = async (collectieNaam) => {
      try {
        return await getDocs(collection(db, collectieNaam));
      } catch (err) {
        console.error(`Firestore laden mislukt: ${collectieNaam}`, err);
        return { docs: [] };
      }
    };

    try {
      const [klantenSnap, vragenlijstenSnap, metingenSnap, antwoordenSnap, contactSnap] = await Promise.all([
        veiligeGetDocs("klanten"),
        veiligeGetDocs("vragenlijsten"),
        veiligeGetDocs("metingen"),
        veiligeGetDocs("antwoorden"),
        veiligeGetDocs("contactaanvragen"),
      ]);

      console.log("Firestore aantallen PageKlanten", {
        klanten: klantenSnap.docs.length,
        vragenlijsten: vragenlijstenSnap.docs.length,
        metingen: metingenSnap.docs.length,
        antwoorden: antwoordenSnap.docs.length,
        contactaanvragen: contactSnap.docs.length,
      });

      const klantenDb = klantenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(k => !k.verwijderd && k.status !== "Verwijderd");
      const vragenlijstenDb = vragenlijstenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => !v.verwijderd && v.status !== "Verwijderd");
      const metingenDb  = metingenSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(m => !m.verwijderd && m.status !== "Verwijderd");
      const antwoordenDb = antwoordenSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => !a.verwijderd);
      const contactDb = contactSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(c => !c.verwijderd);

      const klantNamen = Array.from(new Set([
        ...klantenDb.map(k => k.naam).filter(Boolean),
        ...vragenlijstenDb.map(v => v.klant).filter(Boolean),
        ...metingenDb.map(m => m.klant).filter(Boolean),
        ...contactDb.map(c => c.organisatie || c.bedrijf || c.klant).filter(Boolean),
      ]));

      const opgebouwd = klantNamen.map((naam, idx) => {
        const basis = klantenDb.find(k => k.naam === naam) || {};
        const klantTrajecten = vragenlijstenDb.filter(v => v.klant === naam);
        const klantMetingen = metingenDb.filter(m => m.klant === naam);
        const klantContact = contactDb.filter(c => (c.organisatie || c.bedrijf || c.klant) === naam);
        const antwoordenCount = antwoordenDb.filter(a => klantTrajecten.some(v => v.id === a.vragenlijstId)).length;

        const gemTrajectScoreBron = antwoordenDb
          .filter(a => klantTrajecten.some(v => v.id === a.vragenlijstId))
          .map(a => {
            const vals = Object.values(a.antwoorden || {}).map(v => parseFloat(v)).filter(v => !Number.isNaN(v));
            return vals.length ? vals.reduce((s,v) => s + v, 0) / vals.length : null;
          })
          .filter(v => v !== null);

        const score = gemTrajectScoreBron.length
          ? (gemTrajectScoreBron.reduce((s,v) => s + v, 0) / gemTrajectScoreBron.length)
          : null;

        return {
          id: basis.id || `klant-${idx}`,
          naam,
          sector: basis.sector || "",
          contact: basis.contact || "",
          email: basis.email || "",
          status: basis.status || (klantTrajecten.length ? "Actief" : "In gesprek"),
          score,
          fase: klantTrajecten.length ? `${klantTrajecten.length} traject(en)` : "Intake",
          startdatum: basis.startdatum || (klantTrajecten[0]?.aangemaakt || "—"),
          team: antwoordenCount,
          trajecten: klantTrajecten,
          metingen: klantMetingen,
          contactmomenten: klantContact,
        };
      }).sort((a,b) => a.naam.localeCompare(b.naam, "nl"));

      setKlanten(opgebouwd);
      setVragenlijsten(vragenlijstenDb);
      setMetingen(metingenDb);
      setAntwoorden(antwoordenDb);
      setContactaanvragen(contactDb);

      setSelectedKlant(prev => {
        if (!opgebouwd.length) return null;
        if (!prev) return opgebouwd[0];
        return opgebouwd.find(k => k.naam === prev.naam) || opgebouwd[0];
      });
    } catch (err) {
      console.error("Laden klanten mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const voegToe = async () => {
    if (!nieuw.naam || !nieuw.contact) return;
    setOpslaan(true);
    try {
      await addDoc(collection(db, "klanten"), {
        ...nieuw,
        startdatum: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
      });
      setNieuw({ naam:"", sector:"", contact:"", email:"", status:"Actief" });
      setShowForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan klant mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const verwijderKlantNaarPrullenbak = async () => {
    if (!selectedKlant || String(selectedKlant.id).startsWith("klant-")) return;
    setVerwijderenKlant(true);
    try {
      await addDoc(collection(db, "prullenbak"), {
        original_id: selectedKlant.id,
        bron_collectie: "klanten",
        naam: selectedKlant.naam || "",
        klant: selectedKlant.naam || "",
        type: "klant",
        status: selectedKlant.status || "",
        sector: selectedKlant.sector || "",
        contact: selectedKlant.contact || "",
        email: selectedKlant.email || "",
        verwijderd_op: serverTimestamp(),
        verwijderd_op_ms: Date.now(),
      });

      await updateDoc(doc(db, "klanten", selectedKlant.id), {
        status: "Verwijderd",
        verwijderd: true,
      });

      setSelectedKlant(null);
      await laadData();
    } catch (err) {
      console.error("Verwijderen klant mislukt:", err);
    } finally {
      setVerwijderenKlant(false);
    }
  };

  // Verwijder samengestelde klant: alle vragenlijsten, metingen en antwoorden met deze naam
  const verwijderSamengesteldeKlant = async () => {
    if (!selectedKlant) return;
    setVerwijderenSamengesteld(true);
    const naam = selectedKlant.naam;
    const nu   = Date.now();
    try {
      let aantalVerwijderd = 0;

      // Vragenlijsten
      const vlSnap = await getDocs(collection(db, "vragenlijsten"));
      const teVerwijderenVl = vlSnap.docs.filter(d => {
        const data = d.data();
        return data.klant === naam && !data.verwijderd && data.status !== "Verwijderd";
      });
      console.log(`[Verwijder] Vragenlijsten gevonden: ${teVerwijderenVl.length}`);
      for (const d of teVerwijderenVl) {
        await addDoc(collection(db, "prullenbak"), {
          original_id: d.id, bron_collectie: "vragenlijsten",
          naam: d.data().naam || "", klant: naam,
          type: d.data().type || "basisscan", status: d.data().status || "",
          aangemaakt: d.data().aangemaakt || "",
          verwijderd_op: serverTimestamp(), verwijderd_op_ms: nu,
        });
        await updateDoc(doc(db, "vragenlijsten", d.id), { verwijderd: true, status: "Verwijderd" });
        aantalVerwijderd++;
      }

      // Metingen (ook al verwijderd gemarkeerde — voor de zekerheid)
      const metSnap = await getDocs(collection(db, "metingen"));
      const teVerwijderenMet = metSnap.docs.filter(d => d.data().klant === naam);
      console.log(`[Verwijder] Metingen gevonden: ${teVerwijderenMet.length}`);
      for (const d of teVerwijderenMet) {
        if (!d.data().verwijderd) {
          await addDoc(collection(db, "prullenbak"), {
            original_id: d.id, bron_collectie: "metingen",
            naam: `${naam} — ${d.data().type || "Meting"}`, klant: naam,
            type: "meting", datum: d.data().datum || "",
            scores: d.data().scores || {},
            verwijderd_op: serverTimestamp(), verwijderd_op_ms: nu,
          });
        }
        await updateDoc(doc(db, "metingen", d.id), { verwijderd: true, status: "Verwijderd" });
        aantalVerwijderd++;
      }

      // Antwoorden
      const antSnap = await getDocs(collection(db, "antwoorden"));
      const vlIds   = new Set(teVerwijderenVl.map(d => d.id));
      // Zoek ook op alle vragenlijst-ids, ook al verwijderde
      const alleVlIds = new Set(vlSnap.docs.filter(d => d.data().klant === naam).map(d => d.id));
      const teVerwijderenAnt = antSnap.docs.filter(d => {
        const data = d.data();
        return data.klant === naam || alleVlIds.has(data.vragenlijstId);
      });
      console.log(`[Verwijder] Antwoorden gevonden: ${teVerwijderenAnt.length}`);
      for (const d of teVerwijderenAnt) {
        await updateDoc(doc(db, "antwoorden", d.id), { verwijderd: true });
        aantalVerwijderd++;
      }

      // Contactaanvragen
      const contactSnap = await getDocs(collection(db, "contactaanvragen"));
      const teVerwijderenContact = contactSnap.docs.filter(d => {
        const data = d.data();
        return (data.organisatie === naam || data.bedrijf === naam || data.klant === naam) && !data.verwijderd;
      });
      console.log(`[Verwijder] Contactaanvragen gevonden: ${teVerwijderenContact.length}`);
      for (const d of teVerwijderenContact) {
        await addDoc(collection(db, "prullenbak"), {
          original_id: d.id, bron_collectie: "contactaanvragen",
          naam: d.data().naam || naam, klant: naam,
          type: "contact",
          verwijderd_op: serverTimestamp(), verwijderd_op_ms: nu,
        });
        await updateDoc(doc(db, "contactaanvragen", d.id), { verwijderd: true });
        aantalVerwijderd++;
      }

      console.log(`[Verwijder] Totaal verwijderd: ${aantalVerwijderd} records voor klant "${naam}"`);
      setSelectedKlant(null);
      await laadData();
    } catch (err) {
      console.error("Verwijderen samengestelde klant mislukt:", err);
    } finally {
      setVerwijderenSamengesteld(false);
    }
  };

  const startBewerken = () => {
    setBewerkData({
      naam:    selectedKlant.naam    || "",
      sector:  selectedKlant.sector  || "",
      contact: selectedKlant.contact || "",
      email:   selectedKlant.email   || "",
      status:  selectedKlant.status  || "Actief",
    });
    setBewerkModus(true);
  };

  const slaWijzigingenOp = async () => {
    if (!selectedKlant || !isEchteKlantRecord) return;
    setOpslaanBewerk(true);
    try {
      await updateDoc(doc(db, "klanten", selectedKlant.id), {
        naam:    bewerkData.naam    || selectedKlant.naam,
        sector:  bewerkData.sector  || "",
        contact: bewerkData.contact || "",
        email:   bewerkData.email   || "",
        status:  bewerkData.status  || "Actief",
      });
      setBewerkModus(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan wijzigingen mislukt:", err);
    } finally {
      setOpslaanBewerk(false);
    }
  };

  const startNieuwTraject = async () => {
    if (!selectedKlant || !nieuwTraject.naam) return;
    setOpslaanTraject(true);
    try {
      const mwTemplate  = getScanTemplate("medewerkers");
      const mgTemplate  = getScanTemplate("management");
      const aangemaakt  = new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"});
      const status      = nieuwTraject.status || "Actief";

      // Eerst managementscan aanmaken zodat we het id hebben
      const mgRef = await addDoc(collection(db, "vragenlijsten"), {
        naam:             nieuwTraject.naam,
        klant:            selectedKlant.naam,
        aangemaakt,
        status,
        type:             mgTemplate.type,
        doelgroep:        mgTemplate.doelgroep,
        introductietekst: mgTemplate.introductietekst,
        stellingen:       mgTemplate.stellingen,
        trajectRol:       "management",
      });

      // Dan medewerkerscan aanmaken met koppeling naar management-id
      const mwRef = await addDoc(collection(db, "vragenlijsten"), {
        naam:             nieuwTraject.naam,
        klant:            selectedKlant.naam,
        aangemaakt,
        status,
        type:             mwTemplate.type,
        doelgroep:        mwTemplate.doelgroep,
        introductietekst: mwTemplate.introductietekst,
        stellingen:       mwTemplate.stellingen,
        trajectRol:       "medewerkers",
        managementScanId: mgRef.id,
      });

      // Management-scan bijwerken met koppeling naar medewerkers-id
      await updateDoc(doc(db, "vragenlijsten", mgRef.id), {
        medewerkersScanId: mwRef.id,
      });

      setNieuwTraject({ naam:"", status:"Actief", scanType:"medewerkers" });
      setShowTrajectForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan traject mislukt:", err);
    } finally {
      setOpslaanTraject(false);
    }
  };

  const kiesMetingTraject = (trajectId) => {
    const traject = (selectedKlant?.trajecten || []).find(t => t.id === trajectId);
    setNieuweMeting(prev => ({
      ...prev,
      trajectId,
      trajectNaam: traject?.naam || "",
    }));
  };

  const voegMetingToe = async () => {
    if (!selectedKlant || !nieuweMeting.datum) return;
    setOpslaanMeting(true);
    try {
      await addDoc(collection(db, "metingen"), {
        klant: selectedKlant.naam,
        trajectId: nieuweMeting.trajectId || null,
        trajectNaam: nieuweMeting.trajectNaam || null,
        type: nieuweMeting.type || "T1 Meting",
        datum: nieuweMeting.datum,
        respondenten: parseInt(nieuweMeting.respondenten) || 0,
        scores: Object.fromEntries(
          pijlerNamenMeting.map(p => [p, nieuweMeting.scores[p] === undefined || nieuweMeting.scores[p] === "" ? null : parseFloat(nieuweMeting.scores[p])])
        ),
        status: "Compleet",
        aangemaakt_op: serverTimestamp(),
      });
      setNieuweMeting({ trajectId:"", trajectNaam:"", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
      setShowMetingForm(false);
      await laadData();
    } catch (err) {
      console.error("Opslaan meting mislukt:", err);
    } finally {
      setOpslaanMeting(false);
    }
  };

  const downloadBasisRapport = (traj, resp) => {
    const now = new Date();
    const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    const averages = [0,1,2,3,4].map(pi => {
      const ids = (traj.stellingen || DEFAULT_STELLINGEN).filter(s => s.pijler === pi && s.type === "schaal").map(s => s.id);
      const vals = resp.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
      return vals.length ? (vals.reduce((s,v)=>s+parseFloat(v),0) / vals.length) : null;
    });

    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${traj.naam}</title>${standaardRapportCss()}</head><body>
    ${standaardRapportHeader({ titel: traj.naam, klant: traj.klant, instrument: "Basisscan", respondenten: resp.length, datum })}
    <div class="content">
      <div class="section">
        <div class="section-title">Samenvatting per domein</div>
        ${["Veiligheid en leiderschap","Beleving van verandering","Energie en motivatie","Verbeteren en leren","Gedrag (centraal)"].map((naam, i) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <div style="font-size:16px;font-weight:700;color:#0D1B2A">${naam}</div>
              <div style="font-size:24px;font-weight:700;color:${averages[i] !== null ? (averages[i] >= 4 ? "#2ecc71" : averages[i] >= 3 ? "#f39c12" : "#e74c3c") : "#6B7A8D"}">
                ${averages[i] !== null ? averages[i].toFixed(1) : "—"}
              </div>
            </div>
          </div>`).join("")}
      </div>
    </div>
    <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;
    downloadHtmlRapport(`rapportage-basisscan-${traj.klant.toLowerCase().replace(/\s+/g, "-")}-${traj.naam.toLowerCase().replace(/\s+/g, "-")}.html`, html);
  };

  const openRapportageVoorTraject = (traj) => {
    const resp = antwoorden.filter(a => a.vragenlijstId === traj.id);
    if (!resp.length) return;
    if (isVeiligheidLeiderschapVerdieping(traj)) return genereerRapportVeiligheidLeiderschap(traj, resp);
    if (isVerbeterenLerenVerdieping(traj)) return genereerRapportVerbeterenLeren(traj, resp);
    if (isEnergieMotivatieVerdieping(traj)) return genereerRapportEnergieMotivatie(traj, resp);
    if (isBelevingVeranderingVerdieping(traj)) return genereerRapportBelevingVerandering(traj, resp);
    if (isGecombineerdeVerdieping(traj)) return genereerRapportGecombineerdeVerdieping(traj, resp);
    return downloadBasisRapport(traj, resp);
  };

  const openTraject = (trajId) => {
    setSelectedTrajectId(trajId);
    setSelectedMetingId(null);
  };

  const openMeting = (metingId) => {
    setSelectedMetingId(metingId);
    setSelectedTrajectId(null);
  };

  const statusColor = s => s==="Actief" ? ADM.green : s==="In gesprek" ? ADM.orange : ADM.muted;
  const scoreColor = s => s >= 4 ? ADM.green : s >= 3 ? ADM.orange : ADM.red;
  const formatScore = (value) => (typeof value === "number" && !Number.isNaN(value) ? value.toFixed(1) : "—");
  const geselecteerdeTrajecten = selectedKlant?.trajecten || [];
  const geselecteerdeMetingen = selectedKlant?.metingen || [];
  const geselecteerdTraject = geselecteerdeTrajecten.find(t => t.id === selectedTrajectId) || null;
  const geselecteerdeMeting = geselecteerdeMetingen.find(m => m.id === selectedMetingId) || null;
  const rapportagesCount = geselecteerdeTrajecten.filter(v => antwoorden.some(a => a.vragenlijstId === v.id)).length;
  const isEchteKlantRecord = selectedKlant && !String(selectedKlant.id).startsWith("klant-");
  const metingGem = (scores) => {
    const vals = Object.values(scores || {}).filter(v => v !== null && v !== undefined && v !== "");
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : "—";
  };

  const tijdlijnItems = (klant) => {
    if (!klant) return [];
    const trajectItems = (klant.trajecten || []).map(t => ({
      id: `traject_${t.id}`,
      linkedId: t.id,
      linkedType: "traject",
      datum: fmtDate(t.aangemaakt),
      sortDate: parseDateFlexible(t.aangemaakt),
      type: "traject",
      icon: "📝",
      titel: t.naam,
      subtitel: `Traject gestart · status ${t.status || "Actief"}`,
    }));
    const scanItems = (klant.trajecten || []).flatMap(t => {
      const count = antwoorden.filter(a => a.vragenlijstId === t.id).length;
      return count > 0 ? [{
        id: `scan_${t.id}`,
        linkedId: t.id,
        linkedType: "rapportage",
        datum: fmtDate(t.aangemaakt),
        sortDate: parseDateFlexible(t.aangemaakt),
        type: "scan",
        icon: "✅",
        titel: t.naam,
        subtitel: `${count} ingevulde scan(s) ontvangen`,
      }] : [];
    });
    const metingItems = (klant.metingen || []).map(m => ({
      id: `meting_${m.id}`,
      linkedId: m.id,
      linkedType: "meting",
      datum: fmtDate(m.datum || m.aangemaakt_op),
      sortDate: parseDateFlexible(m.datum) || parseDateFlexible(m.aangemaakt_op),
      type: "meting",
      icon: "📋",
      titel: m.type || "Meting",
      subtitel: m.trajectNaam ? `Meting toegevoegd · ${m.trajectNaam}` : "Meting toegevoegd",
    }));
    const rapportItems = (klant.trajecten || []).flatMap(t => {
      const count = antwoorden.filter(a => a.vragenlijstId === t.id).length;
      return count > 0 ? [{
        id: `rapport_${t.id}`,
        linkedId: t.id,
        linkedType: "rapportage",
        datum: fmtDate(t.aangemaakt),
        sortDate: parseDateFlexible(t.aangemaakt),
        type: "rapportage",
        icon: "📄",
        titel: t.naam,
        subtitel: "Rapportage beschikbaar",
      }] : [];
    });
    const contactItems = (klant.contactmomenten || []).map(c => ({
      id: `contact_${c.id}`,
      linkedId: c.id,
      linkedType: "contact",
      datum: fmtDate(c.datum || c.createdAt),
      sortDate: parseDateFlexible(c.datum) || parseDateFlexible(c.createdAt),
      type: "contact",
      icon: "📬",
      titel: c.organisatie || klant.naam,
      subtitel: "Contactaanvraag ontvangen",
    }));

    return [...contactItems, ...trajectItems, ...scanItems, ...metingItems, ...rapportItems]
      .sort((a,b) => (b.sortDate?.getTime() || 0) - (a.sortDate?.getTime() || 0));
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{klanten.length} klant(en)</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Klant toevoegen
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"22px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe klant toevoegen</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[["naam","Naam organisatie"],["sector","Sector"],["contact","Contactpersoon"],["email","E-mail"],["status","Status"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={voegToe} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:opslaan?"wait":"pointer"}}>
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "0.95fr 1.25fr",gap:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {klanten.map(k => (
            <div key={k.id}
              onClick={()=>{ setSelectedKlant(k); setSelectedTrajectId(null); setSelectedMetingId(null); setBewerkModus(false); }}
              style={{background:ADM.navy,border:`1px solid ${selectedKlant?.id===k.id?ADM.teal:ADM.border}`,borderRadius:12,padding:"18px 20px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div>
                  <div style={{fontWeight:700,color:ADM.white,fontSize:15,marginBottom:4}}>{k.naam}</div>
                  <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                    {k.sector || "Sector onbekend"} · {k.contact || "Geen contactpersoon"}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:`${statusColor(k.status)}22`,color:statusColor(k.status)}}>
                    {k.status}
                  </span>
                  <div style={{fontSize:20,fontWeight:700,color:k.score !== null ? scoreColor(k.score) : ADM.muted}}>
                    {formatScore(k.score)}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap",fontSize:12,color:ADM.muted}}>
                <span>📝 {k.trajecten.length} traject(en)</span>
                <span>📋 {k.metingen.length} meting(en)</span>
                <span>📈 {k.team || 0} antwoorden</span>
              </div>
            </div>
          ))}
          {klanten.length === 0 && (
            <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"24px",textAlign:"center",color:ADM.muted}}>
              Nog geen klanten beschikbaar.
            </div>
          )}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          {!selectedKlant ? (
            <div style={{color:ADM.muted}}>Selecteer een klant om details te bekijken.</div>
          ) : (
            <>
              {/* ── Klantinfo header ── */}
              {bewerkModus ? (
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>
                    Klant bewerken
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
                    {[
                      ["naam",    "Naam organisatie"],
                      ["sector",  "Sector"],
                      ["contact", "Contactpersoon"],
                      ["email",   "E-mailadres"],
                      ["status",  "Status"],
                    ].map(([k, l]) => (
                      <div key={k}>
                        <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                        <input
                          value={bewerkData[k] || ""}
                          onChange={e => setBewerkData(d => ({...d, [k]: e.target.value}))}
                          style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.teal}55`,
                            borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={slaWijzigingenOp} disabled={opslaan_bewerk}
                      style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,
                        padding:"9px 18px",fontWeight:700,fontSize:13,cursor:opslaan_bewerk?"wait":"pointer"}}>
                      {opslaan_bewerk ? "Opslaan..." : "Opslaan"}
                    </button>
                    <button onClick={()=>setBewerkModus(false)}
                      style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                        borderRadius:8,padding:"9px 18px",fontSize:13,cursor:"pointer"}}>
                      Annuleer
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:18,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:26,fontWeight:700,color:ADM.white,marginBottom:6}}>{selectedKlant.naam}</div>
                    <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
                      {selectedKlant.sector || "Sector onbekend"} · {selectedKlant.contact || "Geen contactpersoon"}{selectedKlant.email ? ` · ${selectedKlant.email}` : ""}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <span style={{fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:20,background:`${statusColor(selectedKlant?.status || "")}22`,color:statusColor(selectedKlant?.status || "")}}>
                      {selectedKlant.status}
                    </span>
                    {isEchteKlantRecord && (
                      <button
                        onClick={startBewerken}
                        style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,
                          borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                      >
                        ✏️ Bewerken
                      </button>
                    )}
                    {isEchteKlantRecord && (
                      <button
                        onClick={verwijderKlantNaarPrullenbak}
                        disabled={verwijderenKlant}
                        style={{background:"rgba(231,76,60,0.10)",color:ADM.red,border:`1px solid rgba(231,76,60,0.24)`,
                          borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:verwijderenKlant?"wait":"pointer"}}
                      >
                        {verwijderenKlant ? "Verplaatsen..." : "🗑️ Klant verwijderen"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
                <button
                  onClick={()=>setShowTrajectForm(v => !v)}
                  style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}
                >
                  + Nieuw traject
                </button>
                <button
                  onClick={()=>setShowMetingForm(v => !v)}
                  style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}
                >
                  + Nieuwe meting
                </button>
              </div>

              {showTrajectForm && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Nieuw traject</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 160px",gap:10,marginBottom:10}}>
                    <input
                      value={nieuwTraject.naam}
                      onChange={e=>setNieuwTraject(n=>({...n, naam:e.target.value}))}
                      placeholder="Naam van het traject"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <input
                      value={nieuwTraject.status}
                      onChange={e=>setNieuwTraject(n=>({...n, status:e.target.value}))}
                      placeholder="Status"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                  <div style={{fontSize:12,color:ADM.muted,marginBottom:10,lineHeight:1.6}}>
                    Er worden automatisch twee vragenlijsten aangemaakt: één voor medewerkers en één voor de manager, elk met de juiste vragen.
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={startNieuwTraject} disabled={opslaanTraject}
                      style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:opslaanTraject?"wait":"pointer"}}>
                      {opslaanTraject ? "Opslaan..." : "Traject opslaan"}
                    </button>
                    <button onClick={()=>setShowTrajectForm(false)}
                      style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>
                      Sluiten
                    </button>
                  </div>
                </div>
              )}

              {showMetingForm && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Nieuwe meting</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr 1fr",gap:10,marginBottom:10}}>
                    <select
                      value={nieuweMeting.trajectId}
                      onChange={e=>kiesMetingTraject(e.target.value)}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    >
                      <option value="" style={{color:"#111"}}>Geen traject geselecteerd</option>
                      {geselecteerdeTrajecten.map(t => (
                        <option key={t.id} value={t.id} style={{color:"#111"}}>{t.naam}</option>
                      ))}
                    </select>
                    <input
                      value={nieuweMeting.type}
                      onChange={e=>setNieuweMeting(n=>({...n, type:e.target.value}))}
                      placeholder="Type meting"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <input
                      value={nieuweMeting.datum}
                      onChange={e=>setNieuweMeting(n=>({...n, datum:e.target.value}))}
                      placeholder="Datum"
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "repeat(2,1fr)",gap:10,marginBottom:12}}>
                    {pijlerNamenMeting.map(p=>(
                      <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:12,color:ADM.text,flex:1}}>{p}</div>
                        <input
                          type="number" min="1" max="5" step="0.1"
                          value={nieuweMeting.scores[p] || ""}
                          onChange={e=>setNieuweMeting(n=>({...n,scores:{...n.scores,[p]:e.target.value}}))}
                          style={{width:64,background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"8px 10px",color:ADM.white,fontSize:13,outline:"none",textAlign:"center"}}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={voegMetingToe} disabled={opslaanMeting}
                      style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:opslaanMeting?"wait":"pointer"}}>
                      {opslaanMeting ? "Opslaan..." : "Meting opslaan"}
                    </button>
                    <button onClick={()=>setShowMetingForm(false)}
                      style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>
                      Sluiten
                    </button>
                  </div>
                </div>
              )}

              {!isEchteKlantRecord && (
                <div style={{marginBottom:14,background:"rgba(231,76,60,0.06)",border:`1px solid rgba(231,76,60,0.2)`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,flex:1}}>
                    Deze klant bestaat alleen in gekoppelde scans of metingen — er is geen los klantrecord.
                    Gebruik de knop om alle bijbehorende data te verwijderen.
                  </div>
                  <button
                    onClick={verwijderSamengesteldeKlant}
                    disabled={verwijderenSamengesteld}
                    style={{background:"rgba(231,76,60,0.12)",color:ADM.red,border:`1px solid rgba(231,76,60,0.3)`,
                      borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,
                      cursor:verwijderenSamengesteld?"wait":"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                    {verwijderenSamengesteld ? "Verwijderen..." : "🗑️ Alles verwijderen"}
                  </button>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr 1fr" : "repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  ["Trajecten", geselecteerdeTrajecten.length, "#3A7DBF"],
                  ["Metingen", geselecteerdeMetingen.length, "#E8821A"],
                  ["Rapportages", rapportagesCount, "#6B4E9E"],
                  ["Gem. score", formatScore(selectedKlant?.score), "#5A8C3C"],
                ].map(([label, value, color], i) => (
                  <div key={i} style={{background:`${color}18`,border:`1px solid ${color}33`,borderRadius:10,padding:"14px 14px"}}>
                    <div style={{fontSize:11,color:color,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{label}</div>
                    <div style={{fontSize:26,fontWeight:700,color:color}}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr",gap:16,marginBottom:16}}>
                <div>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                    Trajecten
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {geselecteerdeTrajecten.length === 0 ? (
                      <div style={{fontSize:13,color:ADM.muted}}>Nog geen trajecten gekoppeld.</div>
                    ) : (() => {
                      // Groepeer trajecten per naam: medewerkers + management bij elkaar
                      const groepen = [];
                      const gezien = new Set();
                      geselecteerdeTrajecten.forEach(t => {
                        if (gezien.has(t.id)) return;
                        gezien.add(t.id);
                        const mwT = t.trajectRol === "medewerkers" ? t
                          : geselecteerdeTrajecten.find(x => x.id === t.medewerkersScanId) || null;
                        const mgT = t.trajectRol === "management" ? t
                          : geselecteerdeTrajecten.find(x => x.id === t.managementScanId) || null;
                        if (mwT) gezien.add(mwT.id);
                        if (mgT) gezien.add(mgT.id);
                        // Fallback voor oude trajecten zonder trajectRol
                        const naam = t.naam;
                        groepen.push({ naam, mwT: mwT || t, mgT });
                      });

                      return groepen.map((g, gi) => {
                        const mwId = g.mwT?.id;
                        const mgId = g.mgT?.id;
                        const mwAntwoorden = mwId ? antwoorden.filter(a => a.vragenlijstId === mwId && a.rol === "Teamlid") : [];
                        const mgAntwoorden = mgId ? antwoorden.filter(a => a.vragenlijstId === mgId && a.rol === "Leidinggevende") : [];
                        // voor rapport: combineer alle antwoorden van beide scans
                        const alleAntwoorden = [
                          ...(mwId ? antwoorden.filter(a => a.vragenlijstId === mwId) : []),
                          ...(mgId ? antwoorden.filter(a => a.vragenlijstId === mgId) : []),
                        ];
                        const baseUrl = window.location.origin;
                        const medewerkersLink = mwId ? `${baseUrl}?scan=${mwId}` : null;
                        const managerLink     = mgId ? `${baseUrl}?scan=${mgId}` : null;
                        const kopieerId_mw = `mw_${mwId}`;
                        const kopieerId_mg = `mg_${mgId}`;
                        const trajectRef = g.mwT || g.mgT;

                        return (
                          <div key={gi} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 14px"}}>
                            {/* Header */}
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
                              <div style={{fontSize:14,fontWeight:700,color:ADM.white}}>{g.naam}</div>
                              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                                {trajectRef && (
                                  <button
                                    onClick={() => openTraject(trajectRef.id)}
                                    style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                                  >
                                    Open
                                  </button>
                                )}
                                {alleAntwoorden.length > 0 && trajectRef && (
                                  <button
                                    onClick={() => openRapportageVoorTraject(trajectRef)}
                                    style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.26)`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                                  >
                                    📄 Rapport
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Responsstatus */}
                            <div style={{display:"flex",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{width:8,height:8,borderRadius:"50%",background:mwAntwoorden.length>=5?ADM.green:mwAntwoorden.length>0?ADM.orange:ADM.border,flexShrink:0}}/>
                                <span style={{fontSize:12,color:ADM.muted}}>
                                  👥 Medewerkers: <strong style={{color:ADM.white}}>{mwAntwoorden.length}</strong>
                                  {mwAntwoorden.length<5 && <span style={{color:ADM.orange}}> (min. 5)</span>}
                                </span>
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{width:8,height:8,borderRadius:"50%",background:mgAntwoorden.length>=1?ADM.green:ADM.border,flexShrink:0}}/>
                                <span style={{fontSize:12,color:ADM.muted}}>
                                  👔 Manager: <strong style={{color:ADM.white}}>{mgAntwoorden.length}</strong>
                                  {mgAntwoorden.length===0 && <span style={{color:ADM.orange}}> (nog niet ingevuld)</span>}
                                </span>
                              </div>
                            </div>

                            {/* Scanlinks */}
                            <div style={{display:"flex",flexDirection:"column",gap:6}}>
                              {medewerkersLink && (
                                <div style={{background:"rgba(90,140,60,0.08)",border:"1px solid rgba(90,140,60,0.22)",borderRadius:8,padding:"8px 10px"}}>
                                  <div style={{fontSize:10,color:"#5A8C3C",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>
                                    Link medewerkers
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{fontSize:11,color:ADM.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>
                                      {medewerkersLink}
                                    </div>
                                    <button
                                      onClick={async()=>{try{await navigator.clipboard.writeText(medewerkersLink);setGekopieerd(kopieerId_mw);setTimeout(()=>setGekopieerd(null),2000);}catch{}}}
                                      style={{background:gekopieerd===kopieerId_mw?"rgba(46,204,113,0.2)":"rgba(255,255,255,0.08)",color:gekopieerd===kopieerId_mw?ADM.green:ADM.white,border:`1px solid ${gekopieerd===kopieerId_mw?"rgba(46,204,113,0.4)":ADM.border}`,borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}
                                    >
                                      {gekopieerd===kopieerId_mw?"✓ Gekopieerd":"Kopieer"}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {managerLink && (
                                <div style={{background:"rgba(107,78,158,0.08)",border:"1px solid rgba(107,78,158,0.22)",borderRadius:8,padding:"8px 10px"}}>
                                  <div style={{fontSize:10,color:"#6B4E9E",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>
                                    Link manager
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{fontSize:11,color:ADM.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>
                                      {managerLink}
                                    </div>
                                    <button
                                      onClick={async()=>{try{await navigator.clipboard.writeText(managerLink);setGekopieerd(kopieerId_mg);setTimeout(()=>setGekopieerd(null),2000);}catch{}}}
                                      style={{background:gekopieerd===kopieerId_mg?"rgba(46,204,113,0.2)":"rgba(255,255,255,0.08)",color:gekopieerd===kopieerId_mg?ADM.green:ADM.white,border:`1px solid ${gekopieerd===kopieerId_mg?"rgba(46,204,113,0.4)":ADM.border}`,borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}
                                    >
                                      {gekopieerd===kopieerId_mg?"✓ Gekopieerd":"Kopieer"}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {!mgId && (
                                <div style={{fontSize:11,color:ADM.muted,fontStyle:"italic"}}>
                                  Oud traject — manager-link niet beschikbaar. Maak een nieuw traject aan voor aparte links.
                                </div>
                              )}
                            </div>

                            {/* ── Verdiepende scans ── */}
                            {(() => {
                              const refId = mwId || (trajectRef?.id);
                              if (!refId) return null;

                              // Bestaande verdiepingen voor dit traject
                              const bestaandeVerdiepingen = vragenlijsten.filter(v =>
                                v.parentVragenlijstId === mwId ||
                                v.parentVragenlijstId === mgId
                              );

                              const VERDIEP_CONFIG = [
                                { key:"veiligheid_leiderschap", type:"verdieping_veiligheid_leiderschap", label:"Veiligheid en leiderschap", kleur:"#5A8C3C", stellingen: VEILIGHEID_LEIDERSCHAP_STELLINGEN },
                                { key:"beleving_verandering",   type:"verdieping_beleving_verandering",   label:"Beleving van verandering", kleur:"#3A7DBF", stellingen: BELEVING_VERANDERING_STELLINGEN },
                                { key:"energie_motivatie",      type:"verdieping_energie_motivatie",      label:"Energie en motivatie",      kleur:"#E8821A", stellingen: ENERGIE_MOTIVATIE_STELLINGEN },
                                { key:"verbeteren_leren",       type:"verdieping_verbeteren_leren",       label:"Verbeteren en leren",       kleur:"#6B4E9E", stellingen: VERBETEREN_LEREN_STELLINGEN },
                              ];

                              const maakVerdieping = async (config) => {
                                try {
                                  const ref = await addDoc(collection(db, "vragenlijsten"), {
                                    naam: `${selectedKlant.naam} — Verdieping ${config.label}`,
                                    klant: selectedKlant.naam,
                                    aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
                                    status: "Actief",
                                    type: config.type,
                                    parentVragenlijstId: refId,
                                    stellingen: config.stellingen,
                                  });
                                  await laadData();
                                } catch (err) {
                                  console.error("Verdiepende scan aanmaken mislukt:", err);
                                }
                              };

                              return (
                                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${ADM.border}`}}>
                                  <div style={{fontSize:10,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>
                                    Verdiepende scans
                                  </div>
                                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                    {VERDIEP_CONFIG.map(config => {
                                      const bestaand = bestaandeVerdiepingen.find(v => v.type === config.type);
                                      const vResp = bestaand ? antwoorden.filter(a => a.vragenlijstId === bestaand.id).length : 0;
                                      return (
                                        <div key={config.key} style={{display:"flex",alignItems:"center",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
                                          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                                            <div style={{width:6,height:6,borderRadius:"50%",background:config.kleur,flexShrink:0}}/>
                                            <span style={{fontSize:12,color:bestaand?ADM.white:ADM.muted}}>{config.label}</span>
                                            {bestaand && <span style={{fontSize:11,color:ADM.muted}}>· {vResp} respondent{vResp!==1?"en":""}</span>}
                                          </div>
                                          {bestaand ? (
                                            <button
                                              onClick={async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}?scan=${bestaand.id}`);}catch{}}}
                                              style={{background:`${config.kleur}18`,color:config.kleur,border:`1px solid ${config.kleur}33`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}
                                            >
                                              🔗 Kopieer link
                                            </button>
                                          ) : (
                                            <button
                                              onClick={()=>maakVerdieping(config)}
                                              style={{background:"rgba(255,255,255,0.05)",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}
                                            >
                                              + Inzetten
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div>
                  <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                    Metingen
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {geselecteerdeMetingen.length === 0 ? (
                      <div style={{fontSize:13,color:ADM.muted}}>Nog geen metingen gekoppeld.</div>
                    ) : geselecteerdeMetingen
                      .slice()
                      .sort((a,b) => (b.aangemaakt_op?.seconds || 0) - (a.aangemaakt_op?.seconds || 0))
                      .map(m => (
                        <div key={m.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${selectedMetingId===m.id?ADM.teal:ADM.border}`,borderRadius:10,overflow:"hidden"}}>
                          <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                            <div>
                              <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:4}}>{m.type || "Meting"}</div>
                              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                                {m.datum || "—"}{m.trajectNaam ? ` · ${m.trajectNaam}` : ""}
                              </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{fontSize:20,fontWeight:700,color:metingGem(m.scores)!=="—" ? scoreColor(parseFloat(metingGem(m.scores))) : ADM.muted}}>
                                {metingGem(m.scores)}
                              </div>
                              <button
                                onClick={() => setSelectedMetingId(selectedMetingId===m.id ? null : m.id)}
                                style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}
                              >
                                {selectedMetingId===m.id ? "Sluiten" : "Open meting"}
                              </button>
                            </div>
                          </div>
                          {selectedMetingId===m.id && (
                            <div style={{borderTop:`1px solid ${ADM.border}`,padding:"12px 14px"}}>
                              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                                {pijlerNamenMeting.map(p => (
                                  <div key={p} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10}}>
                                    <span style={{fontSize:12,color:ADM.text}}>{p}</span>
                                    <span style={{fontSize:12,fontWeight:700,color:(m.scores?.[p]||0)>0?scoreColor(m.scores?.[p]):ADM.muted}}>
                                      {m.scores?.[p]??("—")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {(geselecteerdTraject || geselecteerdeMeting) && (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${ADM.border}`,borderRadius:10,padding:"16px 16px",marginBottom:16}}>
                  {geselecteerdTraject && (
                    <>
                      <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Geopend traject</div>
                      <div style={{fontSize:16,fontWeight:700,color:ADM.white,marginBottom:6}}>{geselecteerdTraject.naam}</div>
                      <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7}}>
                        Status: {geselecteerdTraject.status || "Actief"} · Type: {geselecteerdTraject.type || "basisscan"} · Aangemaakt: {geselecteerdTraject.aangemaakt || "—"}
                      </div>
                    </>
                  )}
                  {geselecteerdeMeting && (
                    <>
                      <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Geopende meting</div>
                      <div style={{fontSize:16,fontWeight:700,color:ADM.white,marginBottom:6}}>{geselecteerdeMeting.type || "Meting"}</div>
                      <div style={{fontSize:13,color:ADM.muted,lineHeight:1.7,marginBottom:10}}>
                        Datum: {geselecteerdeMeting.datum || "—"}{geselecteerdeMeting.trajectNaam ? ` · ${geselecteerdeMeting.trajectNaam}` : ""}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr",gap:10}}>
                        {pijlerNamenMeting.map(p => (
                          <div key={p} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",gap:10}}>
                            <span style={{fontSize:12,color:ADM.text}}>{p}</span>
                            <span style={{fontSize:12,fontWeight:700,color:(geselecteerdeMeting.scores?.[p] || 0) > 0 ? scoreColor(geselecteerdeMeting.scores?.[p]) : ADM.muted}}>
                              {geselecteerdeMeting.scores?.[p] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>
                  Tijdlijn
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {tijdlijnItems(selectedKlant).length === 0 ? (
                    <div style={{fontSize:13,color:ADM.muted}}>Nog geen gebeurtenissen beschikbaar.</div>
                  ) : tijdlijnItems(selectedKlant).map((item, i) => (
                    <div key={item.id || i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:18,lineHeight:1}}>{item.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                          <div style={{fontSize:14,fontWeight:700,color:ADM.white}}>{item.titel}</div>
                          <div style={{fontSize:12,color:ADM.muted}}>{item.datum}</div>
                        </div>
                        <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:2,marginBottom:8}}>
                          {item.subtitel}
                        </div>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {item.linkedType === "traject" && (
                            <button onClick={() => openTraject(item.linkedId)}
                              style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              Open traject
                            </button>
                          )}
                          {item.linkedType === "meting" && (
                            <button onClick={() => openMeting(item.linkedId)}
                              style={{background:"rgba(255,255,255,0.06)",color:ADM.white,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              Open meting
                            </button>
                          )}
                          {item.linkedType === "rapportage" && (
                            <button onClick={() => {
                              const t = geselecteerdeTrajecten.find(x => x.id === item.linkedId);
                              if (t) openRapportageVoorTraject(t);
                            }}
                              style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.26)`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              📄 Open rapportage
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PageMetingen() {
  const pijlerNamen = ["Veiligheid en leiderschap","Beleving van verandering","Energie en motivatie","Verbeteren en leren","Gedrag (centraal)"];
  const [metingen, setMetingen] = useState([]);
  const [vragenlijsten, setVragenlijsten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [opslaan, setOpslaan] = useState(false);
  const [selected, setSelected] = useState(null);
  const [teVerwijderen, setTeVerwijderen] = useState(null);
  const [verwijderen, setVerwijderen] = useState(false);
  const [nieuw, setNieuw] = useState({
    klant: "",
    trajectId: "",
    trajectNaam: "",
    type: "T1 Meting",
    datum: "",
    respondenten: "",
    scores: {},
  });

  const scoreColor = s => s >= 4 ? ADM.green : s >= 3 ? ADM.orange : ADM.red;
  const gemScore = scores => {
    const vals = Object.values(scores || {}).filter(v => v !== null && v !== undefined && v !== "");
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : "—";
  };

  const laadData = async () => {
    setLoading(true);
    try {
      const [metingenSnap, vragenlijstenSnap] = await Promise.all([
        getDocs(collection(db, "metingen")),
        getDocs(collection(db, "vragenlijsten")),
      ]);

      const trajecten = vragenlijstenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => !v.verwijderd && v.status !== "Verwijderd")
        .sort((a,b) => (a.naam || "").localeCompare(b.naam || "", "nl"));

      const rows = metingenSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          klant: data.klant || "",
          trajectId: data.trajectId || "",
          trajectNaam: data.trajectNaam || "",
          type: data.type || "Meting",
          datum: data.datum || "",
          respondenten: data.respondenten || 0,
          scores: data.scores || {},
          status: data.status || "Compleet",
          aangemaakt_op: data.aangemaakt_op || null,
        };
      }).sort((a,b) => {
        const ad = a.aangemaakt_op?.seconds || 0;
        const bd = b.aangemaakt_op?.seconds || 0;
        return bd - ad;
      });

      setVragenlijsten(trajecten);
      setMetingen(rows);
    } catch (err) {
      console.error("Laden metingen mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const kiesTraject = (trajectId) => {
    const traject = vragenlijsten.find(v => v.id === trajectId);
    setNieuw(n => ({
      ...n,
      trajectId,
      trajectNaam: traject?.naam || "",
      klant: traject?.klant || n.klant,
    }));
  };

  const slaOp = async () => {
    if (!nieuw.klant || !nieuw.datum) return;
    setOpslaan(true);
    try {
      const payload = {
        klant: nieuw.klant,
        trajectId: nieuw.trajectId || null,
        trajectNaam: nieuw.trajectNaam || null,
        type: nieuw.type || "Meting",
        datum: nieuw.datum,
        respondenten: parseInt(nieuw.respondenten) || 0,
        scores: Object.fromEntries(
          pijlerNamen.map(p => [p, nieuw.scores[p] === undefined || nieuw.scores[p] === "" ? null : parseFloat(nieuw.scores[p])])
        ),
        status: "Compleet",
        aangemaakt_op: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "metingen"), payload);
      setMetingen(prev => [{ id: ref.id, ...payload }, ...prev]);
      setNieuw({ klant:"", trajectId:"", trajectNaam:"", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
      setShowForm(false);
    } catch (err) {
      console.error("Opslaan meting mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const verwijderMeting = async () => {
    if (!teVerwijderen) return;
    setVerwijderen(true);
    try {
      await addDoc(collection(db, "prullenbak"), {
        original_id: teVerwijderen.id,
        bron_collectie: "metingen",
        naam: `${teVerwijderen.klant || ""} — ${teVerwijderen.type || "Meting"}`,
        klant: teVerwijderen.klant || "",
        type: "meting",
        trajectId: teVerwijderen.trajectId || null,
        trajectNaam: teVerwijderen.trajectNaam || null,
        datum: teVerwijderen.datum || "",
        respondenten: teVerwijderen.respondenten || 0,
        scores: teVerwijderen.scores || {},
        status: teVerwijderen.status || "",
        verwijderd_op: serverTimestamp(),
        verwijderd_op_ms: Date.now(),
      });
      await updateDoc(doc(db, "metingen", teVerwijderen.id), {
        verwijderd: true,
        status: "Verwijderd",
      });
      setMetingen(prev => prev.filter(m => m.id !== teVerwijderen.id));
      if (selected?.id === teVerwijderen.id) setSelected(null);
      setTeVerwijderen(null);
    } catch (err) {
      console.error("Verwijderen meting mislukt:", err);
    } finally {
      setVerwijderen(false);
    }
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      {/* BEVESTIGINGSDIALOOG VERWIJDEREN */}
      {teVerwijderen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(13,27,42,0.85)",
          backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:16,
            padding:"32px",maxWidth:420,width:"100%",boxShadow:"0 40px 100px rgba(0,0,0,0.6)"}}>
            <div style={{fontSize:32,marginBottom:16,textAlign:"center"}}>🗑️</div>
            <div style={{fontSize:17,fontWeight:700,color:ADM.white,marginBottom:8,textAlign:"center"}}>
              Meting verwijderen?
            </div>
            <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65,marginBottom:16,textAlign:"center"}}>
              <strong style={{color:ADM.white}}>{teVerwijderen.klant} — {teVerwijderen.type}</strong>
              <br/>
              <span style={{fontSize:12}}>📅 {teVerwijderen.datum}</span>
            </div>
            <div style={{fontSize:12,color:ADM.orange,background:"rgba(243,156,18,0.1)",
              padding:"10px 14px",borderRadius:8,marginBottom:20,textAlign:"center"}}>
              De meting wordt naar de prullenbak verplaatst en kan daar worden hersteld.
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setTeVerwijderen(null)}
                style={{flex:1,background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                  borderRadius:8,padding:"11px",fontSize:13,cursor:"pointer"}}>
                Annuleer
              </button>
              <button onClick={verwijderMeting} disabled={verwijderen}
                style={{flex:1,background:ADM.red,color:"#ffffff",border:"none",
                  borderRadius:8,padding:"11px",fontWeight:700,fontSize:13,
                  cursor:verwijderen?"wait":"pointer"}}>
                {verwijderen ? "Verwijderen..." : "Ja, verwijder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{metingen.length} meting(en) · {vragenlijsten.length} traject(en) beschikbaar</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Nieuwe meting
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"24px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe meting invoeren</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Koppel aan traject</div>
              <select
                value={nieuw.trajectId}
                onChange={e=>kiesTraject(e.target.value)}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
              >
                <option value="" style={{color:"#111"}}>Geen traject geselecteerd</option>
                {vragenlijsten.map(v => (
                  <option key={v.id} value={v.id} style={{color:"#111"}}>
                    {v.naam} — {v.klant}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Klant</div>
              <input
                value={nieuw.klant}
                onChange={e=>setNieuw(n=>({...n, klant:e.target.value}))}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {[["type","Type meting"],["datum","Datum"],["respondenten","Respondenten"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>

          {nieuw.trajectNaam && (
            <div style={{fontSize:12,color:ADM.teal,marginBottom:16,background:"rgba(15,118,110,0.10)",padding:"10px 12px",borderRadius:8}}>
              Gekoppeld traject: <strong>{nieuw.trajectNaam}</strong>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Scores per pijler</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {pijlerNamen.map(p=>(
                <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:12,color:ADM.text,flex:1}}>{p}</div>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={nieuw.scores[p] || ""}
                    onChange={e=>setNieuw(n=>({...n,scores:{...n.scores,[p]:e.target.value}}))}
                    style={{width:64,background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"8px 10px",color:ADM.white,fontSize:13,outline:"none",textAlign:"center"}}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Type scan</div>
            <select
              value={nieuw.scanType || "algemeen"}
              onChange={e=>setNieuw(n=>({...n, scanType:e.target.value}))}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"10px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
            >
              <option value="medewerkers" style={{color:"#111"}}>Medewerkersscan</option>
              <option value="management" style={{color:"#111"}}>Managementscan</option>
            </select>
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:8}}>
              Kies hier of je de medewerkersscan of de managementscan wilt versturen.
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={slaOp} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:opslaan?"wait":"pointer"}}>
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {metingen.map(m=>(
          <div key={m.id} style={{background:ADM.navy,border:`1px solid ${selected?.id===m.id?ADM.teal:ADM.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setSelected(selected?.id===m.id?null:m)}>
                <div style={{fontWeight:600,color:ADM.white,fontSize:15}}>{m.klant} — {m.type}</div>
                <div style={{fontSize:12,color:ADM.muted,marginTop:3}}>
                  📅 {m.datum} · {m.respondenten} respondenten{m.trajectNaam ? ` · gekoppeld aan ${m.trajectNaam}` : ""}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <div style={{fontSize:24,fontWeight:700,color:gemScore(m.scores)!=="—" ? scoreColor(parseFloat(gemScore(m.scores))) : ADM.muted}}>
                  {gemScore(m.scores)}
                </div>
                <button
                  onClick={(e)=>{ e.stopPropagation(); setTeVerwijderen(m); }}
                  title="Verwijder meting"
                  style={{background:"rgba(231,76,60,0.10)",color:ADM.red,border:`1px solid rgba(231,76,60,0.24)`,
                    borderRadius:7,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  🗑️
                </button>
                <span style={{fontSize:12,color:ADM.teal,cursor:"pointer"}} onClick={()=>setSelected(selected?.id===m.id?null:m)}>
                  {selected?.id===m.id?"▲":"▼"}
                </span>
              </div>
            </div>
            {selected?.id===m.id && (
              <div style={{borderTop:`1px solid ${ADM.border}`,padding:"16px 22px"}}>
                {m.trajectNaam && (
                  <div style={{fontSize:12,color:ADM.teal,marginBottom:12,background:"rgba(15,118,110,0.10)",padding:"10px 12px",borderRadius:8}}>
                    Trajectkoppeling: <strong>{m.trajectNaam}</strong>
                  </div>
                )}
                {pijlerNamen.map(p=>(
                  <div key={p} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{fontSize:13,color:ADM.text,width:220,flexShrink:0}}>{p}</div>
                    <div style={{flex:1,height:8,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:`${(((m.scores||{})[p]||0)/5)*100}%`,background:((m.scores||{})[p]||0)>0?scoreColor((m.scores||{})[p]):ADM.border}}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:((m.scores||{})[p]||0)>0?scoreColor((m.scores||{})[p]):ADM.muted,width:30,textAlign:"right"}}>
                      {((m.scores||{})[p] ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {metingen.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center",lineHeight:1.7}}>
            Nog geen metingen opgeslagen. Na een eerste ingevulde scan wordt automatisch een T0-meting aangemaakt. Je kunt daarnaast ook handmatig een nieuw meetmoment toevoegen.
          </div>
        )}
      </div>
    </div>
  );
}


function downloadHtmlRapport(filename, html) {
  const pdfNaam = filename.replace(/\.html$/i, ".pdf");

  const printHtml = html.replace(
    "</body>",
    `
      <script>
        window.addEventListener("load", function () {
          document.title = ${JSON.stringify(pdfNaam)};
          setTimeout(function () {
            window.print();
          }, 500);
        });
      </script>
    </body>`
  );

  const blob = new Blob([printHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

function standaardRapportHeader({ titel, klant, instrument, respondenten, datum }) {
  return `
  <div class="header">
    <div class="header-bar">
      <div style="background:#5A8C3C;"></div>
      <div style="background:#3A7DBF;"></div>
      <div style="background:#E8821A;"></div>
      <div style="background:#6B4E9E;"></div>
    </div>
    <div style="font-size:11px;color:#0F766E;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Mijn Teamkompas — Rapportage</div>
    <h1>${titel}</h1>
    <p>${klant}</p>
    <div style="display:flex;gap:32px;margin-top:20px;flex-wrap:wrap;">
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Datum</div><div style="font-size:15px;font-weight:600">${datum}</div></div>
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Respondenten</div><div style="font-size:15px;font-weight:600">${respondenten}</div></div>
      <div><div class="label" style="color:rgba(255,255,255,0.5)">Instrument</div><div style="font-size:15px;font-weight:600">${instrument}</div></div>
    </div>
  </div>`;
}

function standaardRapportCss() {
  return `
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f7f9fc;color:#1a1a2e}
.header{background:#0D1B2A;color:white;padding:40px 60px}
.header-bar{display:flex;height:6px;margin-bottom:28px}
.header-bar div{flex:1}
.header h1{font-size:28px;font-weight:700;margin-bottom:6px}
.header p{font-size:14px;color:rgba(255,255,255,0.6)}
.content{max-width:920px;margin:0 auto;padding:40px}
.section{background:white;border-radius:12px;padding:28px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#0F766E;margin-bottom:18px}
.card{border:1px solid #e8edf3;border-radius:10px;padding:18px 20px;margin-bottom:12px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.kpi{border-radius:10px;padding:18px;text-align:center}
.kpi .value{font-size:34px;font-weight:700;line-height:1;margin-top:8px}
.label{font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:.75}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px}
.footer{text-align:center;padding:32px;color:#aaa;font-size:12px}
.split{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media print { body{background:white} .content{padding:20px} }
</style>`;
}

function scoreGemiddeldeVoorIds(antwoorden, ids) {
  const vals = antwoorden.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
  return vals.length ? (vals.reduce((x,y)=>x+parseFloat(y),0) / vals.length) : null;
}

function kleurVoorSecureBase(label) {
  if (label === "Excellentie") return "#2ecc71";
  if (label === "Kracht") return "#86efac";
  if (label === "Ontwikkelpunt") return "#f39c12";
  if (label === "Aandachtspunt") return "#e74c3c";
  return "#6B7A8D";
}

function kleurVoorVerbeterenLeren(label) {
  if (label === "Volwassen") return "#2ecc71";
  if (label === "Ontwikkelend") return "#86efac";
  if (label === "Lerend") return "#f39c12";
  if (label === "Beginner") return "#e74c3c";
  return "#6B7A8D";
}

function kleurVoorBeleving(label) {
  if (label?.startsWith("Blauw")) return "#3A7DBF";
  if (label?.startsWith("Groen")) return "#2ecc71";
  if (label?.startsWith("Oranje")) return "#f39c12";
  if (label?.startsWith("Rood")) return "#e74c3c";
  return "#6B7A8D";
}

function genereerRapportVeiligheidLeiderschap(lijst, antwoorden) {
  const stellingen = lijst.stellingen || VEILIGHEID_LEIDERSCHAP_STELLINGEN;
  const dimensies = getVeiligheidLeiderschapDimensies(stellingen).map((d) => {
    const totaalGem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v => v.id));
    const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
    const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(totaal) : null;
    return { ...d, totaal, interpretatie };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const gemiddelde = dimensies.filter(d=>d.totaal!==null).reduce((s,d)=>s+d.totaal,0) / Math.max(1, dimensies.filter(d=>d.totaal!==null).length);

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Veiligheid en leiderschap", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Samenvatting</div>
      <div class="kpi-grid">
        <div class="kpi" style="background:rgba(15,118,110,0.10);border:1px solid rgba(15,118,110,0.22)">
          <div class="label">Dimensies</div><div class="value" style="color:#0F766E">${dimensies.length}</div>
        </div>
        <div class="kpi" style="background:rgba(58,125,191,0.10);border:1px solid rgba(58,125,191,0.22)">
          <div class="label">Gem. dimensiescore</div><div class="value" style="color:#3A7DBF">${isFinite(gemiddelde)?gemiddelde.toFixed(1):"—"}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Respondenten</div><div class="value" style="color:#2ecc71">${antwoorden.length}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dimensiescores</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorSecureBase(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${VEILIGHEID_LEIDERSCHAP_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-veiligheid-en-leiderschap-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}

function genereerRapportVerbeterenLeren(lijst, antwoorden) {
  const stellingen = lijst.stellingen || VERBETEREN_LEREN_STELLINGEN;
  const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
  const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");
  const dimensies = getVerbeterenLerenDimensies(stellingen);

  const codes = ["L1","L2","L3","L4","A1","A2","A3","A4"];
  const groepen = codes.map((code) => {
    const lDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
    const tDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
    const lTotaal = lDim ? Math.round((scoreGemiddeldeVoorIds(leidinggevendeAntwoorden, lDim.vragen.map(v=>v.id)) || 0) * 3) : null
    const tTotaal = tDim ? Math.round((scoreGemiddeldeVoorIds(teamAntwoorden, tDim.vragen.map(v=>v.id)) || 0) * 3) : null
    return {
      code,
      naam: lDim?.naam || tDim?.naam || code,
      leidinggevende: lTotaal,
      team: tTotaal,
      interpretLeiding: lTotaal ? interpretVerbeterenLerenScore(lTotaal) : null,
      interpretTeam: tTotaal ? interpretVerbeterenLerenScore(tTotaal) : null,
      verschil: lTotaal !== null && tTotaal !== null ? lTotaal - tTotaal : null,
    };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Verbeteren en leren", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Vergelijking leidinggevende en team</div>
      ${groepen.map((g) => {
        const kleurL = kleurVoorVerbeterenLeren(g.interpretLeiding?.label);
        const kleurT = kleurVoorVerbeterenLeren(g.interpretTeam?.label);
        const verschilKleur = g.verschil !== null && Math.abs(g.verschil) > 3 ? "#f39c12" : "#86efac";
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
            <div><div class="label" style="margin-bottom:4px">${g.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${g.naam}</div></div>
            ${g.verschil !== null ? `<span class="badge" style="background:${verschilKleur}18;color:${verschilKleur}">Verschil ${g.verschil>0?"+":""}${g.verschil}</span>` : ""}
          </div>
          <div class="split">
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Leidinggevende</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurL}">${g.leidinggevende ?? "—"}</div>${g.interpretLeiding ? `<span class="badge" style="background:${kleurL}18;color:${kleurL}">${g.interpretLeiding.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretLeiding?.advies || "Nog onvoldoende data."}</div>
            </div>
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Teamspiegel</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurT}">${g.team ?? "—"}</div>${g.interpretTeam ? `<span class="badge" style="background:${kleurT}18;color:${kleurT}">${g.interpretTeam.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretTeam?.advies || "Nog onvoldoende data."}</div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${VERBETEREN_LEREN_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-verbeteren-en-leren-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}

function genereerRapportBelevingVerandering(lijst, antwoorden) {
  const stellingen = lijst.stellingen || BELEVING_VERANDERING_STELLINGEN;
  const dimensies = getBelevingVeranderingDimensies(stellingen).map((d) => {
    const totaal = Math.round((scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v=>v.id)) || 0) * 3);
    const interpretatie = interpretBelevingVeranderingScore(totaal);
    return { ...d, totaal, interpretatie };
  });

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Beleving van verandering", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Dimensies van breinvriendelijk leiderschap</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorBeleving(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal}</div><span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie?.label || ""}</span></div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis & aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>

    <div class="section">
      <div class="section-title">Reflectievragen</div>
      ${BELEVING_VERANDERING_REFLECTIEVRAGEN.map((q, i) => `<div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">${i+1}. ${q}</div>`).join("")}
    </div>
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-beleving-van-verandering-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}


function genereerRapportEnergieMotivatie(lijst, antwoorden) {
  const stellingen = lijst.stellingen || ENERGIE_MOTIVATIE_STELLINGEN;
  const dimensiesMap = new Map();

  stellingen.forEach((s) => {
    if (!dimensiesMap.has(s.dimensieCode)) {
      dimensiesMap.set(s.dimensieCode, {
        code: s.dimensieCode,
        naam: s.dimensie,
        deel: s.deel,
        ids: [],
      });
    }
    dimensiesMap.get(s.dimensieCode).ids.push(s.id);
  });

  const dimensies = Array.from(dimensiesMap.values());

  const gemiddeldeVoorIds = (ids) => {
    const vals = antwoorden.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
    return vals.length ? (vals.reduce((x,y)=>x+parseFloat(y),0) / vals.length) : null;
  };

  const scoreData = dimensies.map((d) => {
    const gem = gemiddeldeVoorIds(d.ids);
    const totaal = gem !== null ? Math.round(gem * 3) : null;
    const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
    return { ...d, gem, totaal, interpretatie };
  });

  const somDeel = (prefix) => scoreData.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
  const totaalTaakeisen = somDeel("A");
  const totaalHulpbronnen = somDeel("B");
  const balans = totaalTaakeisen - totaalHulpbronnen;

  let balansTitel = "In balans";
  let balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
  let balansKleur = "#2ecc71";
  if (balans < -20) {
    balansTitel = "Sterk negatief";
    balansTekst = "Hulpbronnen domineren. Zeer gunstig: medewerkers hebben ruime buffers om eisen op te vangen. Kans op bevlogenheid is hoog.";
    balansKleur = "#2ecc71";
  } else if (balans >= -20 && balans <= 0) {
    balansTitel = "In balans";
    balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    balansKleur = "#86efac";
  } else if (balans > 0 && balans <= 20) {
    balansTitel = "Lichte onbalans";
    balansTekst = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
    balansKleur = "#f39c12";
  } else if (balans > 20) {
    balansTitel = "Taakeisen domineren";
    balansTekst = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist voor vermindering van eisen of versterking van hulpbronnen.";
    balansKleur = "#e74c3c";
  }

  const kleurVoorDimensie = (d) => {
    const score = d.totaal || 0;
    const negatiefGedraaid = d.code.startsWith("A") || d.code === "C2";
    if (negatiefGedraaid) {
      if (score >= 14) return "#e74c3c";
      if (score >= 11) return "#f39c12";
      return "#2ecc71";
    }
    if (score >= 14) return "#2ecc71";
    if (score >= 11) return "#86efac";
    if (score >= 7) return "#f39c12";
    return "#e74c3c";
  };

  const groepen = [
    { titel: "Deel A — Taakeisen", key: "Taakeisen", intro: "Hoge score = hoge belasting" },
    { titel: "Deel B — Hulpbronnen", key: "Hulpbronnen", intro: "Hoge score = sterke hulpbron" },
    { titel: "Deel C — Uitkomstmaten", key: "Uitkomstmaten", intro: "Bevlogenheid hoog = positief, uitputting hoog = zorgelijk" },
  ];

  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Rapportage — ${lijst.naam}</title>
${standaardRapportCss()}
</head>
<body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Energie en motivatie", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Balansanalyse</div>
      <div class="kpi-grid">
        <div class="kpi" style="background:rgba(243,156,18,0.10);border:1px solid rgba(243,156,18,0.22)">
          <div class="label">Totaal taakeisen</div>
          <div class="value" style="color:#f39c12">${totaalTaakeisen}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Totaal hulpbronnen</div>
          <div class="value" style="color:#2ecc71">${totaalHulpbronnen}</div>
        </div>
        <div class="kpi" style="background:${balansKleur}18;border:1px solid ${balansKleur}33">
          <div class="label">Balans A − B</div>
          <div class="value" style="color:${balansKleur}">${balans > 0 ? "+" + balans : balans}</div>
        </div>
      </div>
      <div style="margin-top:18px;padding:14px 16px;border-radius:10px;background:${balansKleur}14;border-left:4px solid ${balansKleur}">
        <div style="font-size:14px;font-weight:700;color:${balansKleur};margin-bottom:6px">${balansTitel}</div>
        <div style="font-size:13px;line-height:1.7;color:#4a5568">${balansTekst}</div>
      </div>
    </div>

    ${groepen.map((groep) => {
      const dims = scoreData.filter(d => d.deel === groep.key);
      return `
      <div class="section">
        <div class="section-title">${groep.titel}</div>
        <div style="font-size:13px;color:#6B7A8D;line-height:1.7;margin-bottom:16px;">${groep.intro}</div>
        ${dims.map((d) => {
          const kleur = kleurVoorDimensie(d);
          return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
              <div>
                <div class="label" style="margin-bottom:4px">${d.code}</div>
                <div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>
                ${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}
              </div>
            </div>
            <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;">
              <strong style="color:#1a1a2e">Betekenis:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}
            </div>
          </div>`;
        }).join("")}
      </div>`;
    }).join("")}

    <div class="section">
      <div class="section-title">Reflectievragen voor het gesprek</div>
      ${ENERGIE_MOTIVATIE_REFLECTIEVRAGEN.map((q, i) => `
        <div style="background:#f7f9fc;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;line-height:1.65;color:#394150;">
          ${i+1}. ${q}
        </div>
      `).join("")}
    </div>
  </div>

  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div>
</body>
</html>`;

  downloadHtmlRapport(`rapportage-energie-en-motivatie-${lijst.klant.toLowerCase().replace(/\\s+/g, "-")}.html`, html);
}


function genereerRapportGecombineerdeVerdieping(lijst, antwoorden) {
  const onderdelen = getGecombineerdeOnderdelen(lijst);
  const mapping = {
    veiligheid_leiderschap: "Veiligheid en leiderschap",
    verbeteren_leren: "Verbeteren en leren",
    energie_motivatie: "Energie en motivatie",
    beleving_verandering: "Beleving van verandering",
  };
  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const sectionVeiligheid = () => {
    if (!onderdelen.includes("veiligheid_leiderschap")) return "";
    const dimensies = getVeiligheidLeiderschapDimensies(VEILIGHEID_LEIDERSCHAP_STELLINGEN).map((d) => {
      const totaalGem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v => v.id));
      const totaal = totaalGem !== null ? Math.round(totaalGem * 3) : null;
      const interpretatie = totaal !== null ? interpretVeiligheidLeiderschapScore(totaal) : null;
      return { ...d, totaal, interpretatie };
    });

    return `
    <div class="section">
      <div class="section-title">Veiligheid en leiderschap</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorSecureBase(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const sectionVerbeterenLeren = () => {
    if (!onderdelen.includes("verbeteren_leren")) return "";
    const dimensies = getVerbeterenLerenDimensies(VERBETEREN_LEREN_STELLINGEN);
    const leidinggevendeAntwoorden = antwoorden.filter(a => a.rol === "Leidinggevende");
    const teamAntwoorden = antwoorden.filter(a => a.rol === "Teamlid");
    const codes = ["L1","L2","L3","L4","A1","A2","A3","A4"];

    const groepen = codes.map((code) => {
      const lDim = dimensies.find(d => d.code === code && d.doelgroep === "Leidinggevende");
      const tDim = dimensies.find(d => d.code === code && d.doelgroep === "Teamlid");
      const lGem = lDim ? scoreGemiddeldeVoorIds(leidinggevendeAntwoorden, lDim.vragen.map(v=>v.id)) : null;
      const tGem = tDim ? scoreGemiddeldeVoorIds(teamAntwoorden, tDim.vragen.map(v=>v.id)) : null;
      const leidinggevende = lGem !== null ? Math.round(lGem * 3) : null;
      const team = tGem !== null ? Math.round(tGem * 3) : null;
      return {
        code,
        naam: lDim?.naam || tDim?.naam || code,
        leidinggevende,
        team,
        interpretLeiding: leidinggevende !== null ? interpretVerbeterenLerenScore(leidinggevende) : null,
        interpretTeam: team !== null ? interpretVerbeterenLerenScore(team) : null,
        verschil: leidinggevende !== null && team !== null ? leidinggevende - team : null,
      };
    });

    return `
    <div class="section">
      <div class="section-title">Verbeteren en leren</div>
      ${groepen.map((g) => {
        const kleurL = kleurVoorVerbeterenLeren(g.interpretLeiding?.label);
        const kleurT = kleurVoorVerbeterenLeren(g.interpretTeam?.label);
        const verschilKleur = g.verschil !== null && Math.abs(g.verschil) > 3 ? "#f39c12" : "#86efac";
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
            <div><div class="label" style="margin-bottom:4px">${g.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${g.naam}</div></div>
            ${g.verschil !== null ? `<span class="badge" style="background:${verschilKleur}18;color:${verschilKleur}">Verschil ${g.verschil>0?"+":""}${g.verschil}</span>` : ""}
          </div>
          <div class="split">
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Leidinggevende</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurL}">${g.leidinggevende ?? "—"}</div>${g.interpretLeiding ? `<span class="badge" style="background:${kleurL}18;color:${kleurL}">${g.interpretLeiding.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretLeiding?.advies || "Nog onvoldoende data."}</div>
            </div>
            <div style="background:#f7f9fc;border-radius:10px;padding:12px 14px;">
              <div class="label" style="margin-bottom:6px">Teamspiegel</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="font-size:24px;font-weight:700;color:${kleurT}">${g.team ?? "—"}</div>${g.interpretTeam ? `<span class="badge" style="background:${kleurT}18;color:${kleurT}">${g.interpretTeam.label}</span>` : ""}</div>
              <div style="font-size:12px;line-height:1.6;color:#5b6775">${g.interpretTeam?.advies || "Nog onvoldoende data."}</div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const scoreDataEnergie = (() => {
    if (!onderdelen.includes("energie_motivatie")) return [];
    const dimensiesMap = new Map();
    ENERGIE_MOTIVATIE_STELLINGEN.forEach((s) => {
      if (!dimensiesMap.has(s.dimensieCode)) {
        dimensiesMap.set(s.dimensieCode, { code: s.dimensieCode, naam: s.dimensie, deel: s.deel, ids: [] });
      }
      dimensiesMap.get(s.dimensieCode).ids.push(s.id);
    });
    return Array.from(dimensiesMap.values()).map((d) => {
      const gem = scoreGemiddeldeVoorIds(antwoorden, d.ids);
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretEnergieMotivatieScore(d.code, totaal) : null;
      return { ...d, totaal, interpretatie };
    });
  })();

  const sectionEnergie = () => {
    if (!onderdelen.includes("energie_motivatie")) return "";
    const somDeel = (prefix) => scoreDataEnergie.filter(d => d.code.startsWith(prefix)).reduce((sum, d) => sum + (d.totaal || 0), 0);
    const totaalTaakeisen = somDeel("A");
    const totaalHulpbronnen = somDeel("B");
    const balans = totaalTaakeisen - totaalHulpbronnen;

    let balansTitel = "In balans";
    let balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
    let balansKleur = "#2ecc71";
    if (balans < -20) {
      balansTitel = "Sterk negatief";
      balansTekst = "Hulpbronnen domineren. Zeer gunstig: medewerkers hebben ruime buffers om eisen op te vangen. Kans op bevlogenheid is hoog.";
      balansKleur = "#2ecc71";
    } else if (balans >= -20 && balans <= 0) {
      balansTitel = "In balans";
      balansTekst = "Gezonde situatie: eisen en hulpbronnen zijn in evenwicht. Bewaken en onderhouden.";
      balansKleur = "#86efac";
    } else if (balans > 0 && balans <= 20) {
      balansTitel = "Lichte onbalans";
      balansTekst = "Eisen beginnen hulpbronnen te overtreffen. Tijdig ingrijpen is raadzaam.";
      balansKleur = "#f39c12";
    } else if (balans > 20) {
      balansTitel = "Taakeisen domineren";
      balansTekst = "Risicosituatie: hoog risico op uitputting en uitval. Direct aandacht vereist.";
      balansKleur = "#e74c3c";
    }

    const kleurVoorDimensie = (d) => {
      const score = d.totaal || 0;
      const negatiefGedraaid = d.code.startsWith("A") || d.code === "C2";
      if (negatiefGedraaid) {
        if (score >= 14) return "#e74c3c";
        if (score >= 11) return "#f39c12";
        return "#2ecc71";
      }
      if (score >= 14) return "#2ecc71";
      if (score >= 11) return "#86efac";
      if (score >= 7) return "#f39c12";
      return "#e74c3c";
    };

    const groepen = [
      { titel: "Deel A — Taakeisen", key: "Taakeisen" },
      { titel: "Deel B — Hulpbronnen", key: "Hulpbronnen" },
      { titel: "Deel C — Uitkomstmaten", key: "Uitkomstmaten" },
    ];

    return `
    <div class="section">
      <div class="section-title">Energie en motivatie</div>
      <div class="kpi-grid" style="margin-bottom:18px">
        <div class="kpi" style="background:rgba(243,156,18,0.10);border:1px solid rgba(243,156,18,0.22)">
          <div class="label">Totaal taakeisen</div><div class="value" style="color:#f39c12">${totaalTaakeisen}</div>
        </div>
        <div class="kpi" style="background:rgba(46,204,113,0.10);border:1px solid rgba(46,204,113,0.22)">
          <div class="label">Totaal hulpbronnen</div><div class="value" style="color:#2ecc71">${totaalHulpbronnen}</div>
        </div>
        <div class="kpi" style="background:${balansKleur}18;border:1px solid ${balansKleur}33">
          <div class="label">Balans A − B</div><div class="value" style="color:${balansKleur}">${balans > 0 ? "+" + balans : balans}</div>
        </div>
      </div>
      <div style="margin-bottom:18px;padding:14px 16px;border-radius:10px;background:${balansKleur}14;border-left:4px solid ${balansKleur}">
        <div style="font-size:14px;font-weight:700;color:${balansKleur};margin-bottom:6px">${balansTitel}</div>
        <div style="font-size:13px;line-height:1.7;color:#4a5568">${balansTekst}</div>
      </div>
      ${groepen.map((groep) => {
        const dims = scoreDataEnergie.filter(d => d.deel === groep.key);
        return `
        <div style="margin-top:14px">
          <div class="label" style="margin-bottom:10px;color:#0F766E">${groep.titel}</div>
          ${dims.map((d) => {
            const kleur = kleurVoorDimensie(d);
            return `<div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
                <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
                <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
              </div>
              <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
            </div>`;
          }).join("")}
        </div>`;
      }).join("")}
    </div>`;
  };

  const sectionBeleving = () => {
    if (!onderdelen.includes("beleving_verandering")) return "";
    const dimensies = getBelevingVeranderingDimensies(BELEVING_VERANDERING_STELLINGEN).map((d) => {
      const gem = scoreGemiddeldeVoorIds(antwoorden, d.vragen.map(v=>v.id));
      const totaal = gem !== null ? Math.round(gem * 3) : null;
      const interpretatie = totaal !== null ? interpretBelevingVeranderingScore(totaal) : null;
      return { ...d, totaal, interpretatie };
    });

    return `
    <div class="section">
      <div class="section-title">Beleving van verandering</div>
      ${dimensies.map((d) => {
        const kleur = kleurVoorBeleving(d.interpretatie?.label);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
            <div><div class="label" style="margin-bottom:4px">${d.code}</div><div style="font-size:16px;font-weight:700;color:#0D1B2A">${d.naam}</div></div>
            <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;font-weight:700;color:${kleur}">${d.totaal ?? "—"}</div>${d.interpretatie ? `<span class="badge" style="background:${kleur}18;color:${kleur}">${d.interpretatie.label}</span>` : ""}</div>
          </div>
          <div style="font-size:12px;line-height:1.65;color:#5b6775;background:#f7f9fc;padding:10px 12px;border-radius:8px;"><strong style="color:#1a1a2e">Betekenis & aanbeveling:</strong> ${d.interpretatie?.advies || "Nog onvoldoende data voor interpretatie."}</div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapportage — ${lijst.naam}</title>${standaardRapportCss()}</head><body>
  ${standaardRapportHeader({ titel: lijst.naam, klant: lijst.klant, instrument: "Gecombineerde verdiepingsscan", respondenten: antwoorden.length, datum })}
  <div class="content">
    <div class="section">
      <div class="section-title">Onderdelen in deze verdiepingsscan</div>
      ${onderdelen.map((k) => `<div class="card"><div style="font-size:16px;font-weight:700;color:#0D1B2A;margin-bottom:6px">${mapping[k] || k}</div><div style="font-size:13px;line-height:1.65;color:#5b6775">Dit onderdeel is opgenomen in deze gecombineerde rapportage en wordt hieronder inhoudelijk uitgewerkt.</div></div>`).join("")}
    </div>

    ${sectionVeiligheid()}
    ${sectionVerbeterenLeren()}
    ${sectionEnergie()}
    ${sectionBeleving()}
  </div>
  <div class="footer">© ${now.getFullYear()} Mijn Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik</div></body></html>`;

  downloadHtmlRapport(`rapportage-gecombineerde-verdieping-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}.html`, html);
}


function PageRapportages() {
  const [lijsten,    setLijsten]    = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [genererend, setGenererend] = useState(null);
  const [rapportError, setRapportError] = useState("");
  const [verwijderenId, setVerwijderenId] = useState(null);

  useEffect(() => {
    const laadData = async () => {
      setLoading(true);
      try {
        const [vlSnap, antSnap] = await Promise.all([
          getDocs(collection(db, "vragenlijsten")),
          getDocs(collection(db, "antwoorden")),
        ]);
        setLijsten(
          vlSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(item => !item.verwijderd && item.status !== "Verwijderd")
        );
        setAntwoorden(antSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Laden mislukt:", err);
      } finally {
        setLoading(false);
      }
    };
    laadData();
  }, []);

  const antwoordenVoor = (id) => antwoorden.filter(a => a.vragenlijstId === id);

  const gemPijler = (pijlerIdx, subset, stellingen) => {
    const ids  = stellingen.filter(s => s.pijler === pijlerIdx && s.type === "schaal").map(s => s.id);
    const vals = subset.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null));
    return vals.length ? (vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length) : null;
  };

  const scoreKleurHex = (s) => {
    if (!s || isNaN(s)) return "#6B7A8D";
    if (parseFloat(s) >= 4) return "#2ecc71";
    if (parseFloat(s) >= 3) return "#f39c12";
    return "#e74c3c";
  };

  const pijlerKleuren = ["#5A8C3C", "#3A7DBF", "#E8821A", "#6B4E9E"];
  const pijlerNamen   = ["Veiligheid en leiderschap", "Beleving van verandering", "Energie en motivatie", "Verbeteren en leren"];


  const verplaatsNaarPrullenbak = async (lijst) => {
    setRapportError("");
    setVerwijderenId(lijst.id);
    try {
      const trashPayload = {
        original_id: lijst.id,
        bron_collectie: "vragenlijsten",
        naam: lijst.naam || "",
        klant: lijst.klant || "",
        type: lijst.type || "basisscan",
        status: lijst.status || "",
        aangemaakt: lijst.aangemaakt || "",
        parentVragenlijstId: lijst.parentVragenlijstId || null,
        verdiepingOnderdelen: lijst.verdiepingOnderdelen || [],
        verwijderd_op: serverTimestamp(),
        verwijderd_op_ms: Date.now(),
      };

      await addDoc(collection(db, "prullenbak"), trashPayload);

      await updateDoc(doc(db, "vragenlijsten", lijst.id), {
        status: "Verwijderd",
        verwijderd: true
      });

      setLijsten(prev => prev.filter(x => x.id !== lijst.id));
    } catch (err) {
      console.error("Naar prullenbak verplaatsen mislukt:", err);
      setRapportError("Het verwijderen is mislukt. Probeer het opnieuw.");
    } finally {
      setVerwijderenId(null);
    }
  };

  // ─── TOTAALRAPPORTAGE: medewerkers + management gecombineerd ──────────────
  const genereerTotaalrapport = async (mwLijst, mgLijst, verdiepingen = []) => {
    setRapportError("");
    setGenererend(`totaal_${mwLijst.id}`);

    // Altijd verse data ophalen op moment van genereren
    let mwResp, mgResp;
    try {
      const antSnap = await getDocs(collection(db, "antwoorden"));
      const alleAntwoorden = antSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => !a.verwijderd);
      mwResp = alleAntwoorden.filter(a => a.vragenlijstId === mwLijst.id);
      mgResp = alleAntwoorden.filter(a => a.vragenlijstId === mgLijst.id);
      // Update ook de lokale state zodat de responstellingen kloppen
      setAntwoorden(alleAntwoorden);
    } catch (err) {
      console.error("Antwoorden ophalen mislukt:", err);
      setGenererend(null);
      return;
    }

    const mwStellingen = mwLijst.stellingen || MEDEWERKERSSCAN_STELLINGEN;
    const mgStellingen = mgLijst.stellingen || MANAGEMENTSCAN_STELLINGEN;

    const now   = new Date();
    const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

    const DOMEINEN = [
      { naam: "Veiligheid en leiderschap", kleur: "#5A8C3C", pijler: 0, mwIds: null, mgIds: null },
      { naam: "Beleving van verandering", kleur: "#3A7DBF", pijler: 1, mwIds: null, mgIds: null },
      { naam: "Energie en motivatie",      kleur: "#E8821A", pijler: 2, mwIds: null, mgIds: null },
      { naam: "Verbeteren en leren",       kleur: "#6B4E9E", pijler: 3, mwIds: null, mgIds: null },
      // Pijler 4 opgesplitst in twee domeinen
      { naam: "Samenwerking en communicatie", kleur: "#0F766E", pijler: 4,
        mwIds: [1001,1002,1003,1004], mgIds: [2001,2002,2003,2004] },
      { naam: "Richting en betrokkenheid",    kleur: "#8B5CF6", pijler: 4,
        mwIds: [1027,1028], mgIds: [2027,2028] },
    ];

    // Score per pijler berekenen op basis van de juiste vragenlijst
    const gemPijlerLijst = (pijler, resp, stellingen, explicieteIds = null) => {
      const ids = explicieteIds
        ? explicieteIds
        : stellingen.filter(s => s.pijler === pijler && s.type === "schaal").map(s => s.id);
      const vals = resp.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null && v !== ""));
      return vals.length ? vals.reduce((s, v) => s + parseFloat(v), 0) / vals.length : null;
    };

    const scores = DOMEINEN.map(d => {
      const mw   = gemPijlerLijst(d.pijler, mwResp, mwStellingen, d.mwIds);
      const mg   = gemPijlerLijst(d.pijler, mgResp, mgStellingen, d.mgIds);
      const gap  = mw !== null && mg !== null ? mg - mw : null;
      return { ...d, mw, mg, gap };
    });

    // Open antwoorden per domein — medewerkers en manager apart
    // Expliciete open vraag-id mapping per domein
    const openIdsMap = {
      "Samenwerking en communicatie": { mw: [1005], mg: [2005] },
      "Richting en betrokkenheid":    { mw: [1029], mg: [2029, 2030] },
    };

    const openPerDomein = DOMEINEN.map(d => {
      const explicieteIds = openIdsMap[d.naam];
      let mwOpen, mgOpen;
      if (explicieteIds) {
        mwOpen = mwStellingen.filter(s => explicieteIds.mw.includes(s.id));
        mgOpen = mgStellingen.filter(s => explicieteIds.mg.includes(s.id));
      } else {
        mwOpen = mwStellingen.filter(s => s.pijler === d.pijler && s.type === "open");
        mgOpen = mgStellingen.filter(s => s.pijler === d.pijler && s.type === "open");
      }
      const mwAntw = mwOpen.flatMap(s => mwResp.map(a => a.antwoorden?.[s.id]).filter(v => v?.trim().length > 3));
      const mgAntw = mgOpen.flatMap(s => mgResp.map(a => a.antwoorden?.[s.id]).filter(v => v?.trim().length > 3));
      return { ...d, mwVraag: mwOpen[0]?.tekst || "", mgVraag: mgOpen[0]?.tekst || "", mwAntw, mgAntw };
    });

    const scoreKleur = s => !s || isNaN(s) ? "#aaa" : s >= 4 ? "#2ecc71" : s >= 3 ? "#f39c12" : "#e74c3c";

    const gapKleur = gap => {
      if (gap === null) return "#aaa";
      const abs = Math.abs(gap);
      return abs >= 1.0 ? "#e74c3c" : abs >= 0.5 ? "#f39c12" : "#2ecc71";
    };
    const gapLabel = gap => {
      if (gap === null) return "";
      const abs = Math.abs(gap);
      const richting = gap > 0 ? "Manager ziet het positiever" : "Medewerkers zien het positiever";
      if (abs >= 1.0) return `Grote kloof · ${richting}`;
      if (abs >= 0.5) return `Merkbaar verschil · ${richting}`;
      return "Kleine kloof";
    };

    const balk = (score, kleur, breedte = 200) =>
      score !== null
        ? `<div style="display:flex;align-items:center;gap:10px;">
            <div style="width:${breedte}px;height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden;flex-shrink:0;">
              <div style="height:100%;border-radius:5px;background:${kleur};width:${(score/5)*100}%;"></div>
            </div>
            <div style="font-size:15px;font-weight:700;color:${kleur};min-width:30px;">${score.toFixed(1)}</div>
           </div>`
        : `<span style="color:#aaa;font-size:13px;">Geen data</span>`;

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Totaalrapportage — ${mwLijst.naam}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f9; color: #1a1a2e; }

    .header { background: #0D1B2A; color: white; padding: 44px 60px 36px; }
    .header-bar { display: flex; height: 6px; margin-bottom: 28px; border-radius: 3px; overflow: hidden; }
    .header-bar div { flex: 1; }
    .koplabel { font-size: 11px; color: #0F766E; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .header h1 { font-size: 30px; font-weight: 700; margin-bottom: 6px; }
    .header .sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 24px; }
    .meta { display: flex; gap: 32px; flex-wrap: wrap; }
    .meta-item { font-size: 11px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 1px; }
    .meta-item span { display: block; font-size: 15px; color: white; font-weight: 600; margin-top: 3px; text-transform: none; letter-spacing: 0; }

    .content { max-width: 940px; margin: 0 auto; padding: 40px; }

    .section { background: white; border-radius: 14px; padding: 28px 32px; margin-bottom: 24px; box-shadow: 0 2px 14px rgba(0,0,0,0.06); }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0F766E; margin-bottom: 20px; }

    /* Samenvatting kompas-grid */
    .kompas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .kompas-card { border-radius: 10px; padding: 20px 22px; }
    .kompas-naam { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .kompas-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .kompas-rolabel { font-size: 12px; font-weight: 600; width: 110px; flex-shrink: 0; }

    /* Gap tabel */
    .gap-tabel { width: 100%; border-collapse: collapse; }
    .gap-tabel th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7A8D; font-weight: 700; padding: 0 16px 12px; text-align: left; border-bottom: 2px solid #eee; }
    .gap-tabel th.center { text-align: center; }
    .gap-tabel td { padding: 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    .gap-tabel tr:last-child td { border-bottom: none; }
    .domein-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
    .gap-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; white-space: nowrap; }
    .gap-arrow { font-size: 16px; }

    /* Open antwoorden */
    .open-blok { margin-bottom: 28px; }
    .open-domein { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
    .open-groep { margin-bottom: 16px; }
    .open-roltitel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B7A8D; margin-bottom: 8px; }
    .open-vraag { font-size: 12px; color: #888; font-style: italic; margin-bottom: 8px; }
    .open-item { background: #f7f9fc; border-radius: 8px; padding: 11px 15px; margin-bottom: 6px; font-size: 13px; line-height: 1.65; color: #444; border-left: 3px solid; }

    .toelichting { background: #0D1B2A; color: white; border-radius: 14px; padding: 24px 32px; margin-bottom: 24px; }
    .footer { text-align: center; padding: 32px; color: #aaa; font-size: 12px; }
    @media print { body { background: white; } .content { padding: 20px; } }
  </style>
</head>
<body>

<div class="header">
  <div class="header-bar">
    <div style="background:#5A8C3C;"></div>
    <div style="background:#3A7DBF;"></div>
    <div style="background:#E8821A;"></div>
    <div style="background:#6B4E9E;"></div>
  </div>
  <div class="koplabel">Het Teamkompas — Totaalrapportage</div>
  <h1>${mwLijst.naam}</h1>
  <div class="sub">${mwLijst.klant}</div>
  <div class="meta">
    <div class="meta-item">Datum<span>${datum}</span></div>
    <div class="meta-item">Medewerkers<span>${mwResp.length} respondenten</span></div>
    <div class="meta-item">Leidinggevende<span>${mgResp.length} respondent${mgResp.length !== 1 ? "en" : ""}</span></div>
    <div class="meta-item">Domeinen<span>4 domeinen gemeten</span></div>
  </div>
</div>

<div class="content">

  <!-- ═══ SECTIE 1: SCORES PER DOMEIN ═══ -->
  <div class="section">
    <div class="section-label">Scores per domein</div>
    <div class="kompas-grid">
      ${scores.map(s => `
      <div class="kompas-card" style="background:${s.kleur}0f;border:1px solid ${s.kleur}28;">
        <div class="kompas-naam" style="color:${s.kleur};">${s.naam}</div>
        <div class="kompas-row">
          <div class="kompas-rolabel" style="color:#5A8C3C;">👥 Medewerkers</div>
          ${balk(s.mw, scoreKleur(s.mw), 160)}
        </div>
        <div class="kompas-row">
          <div class="kompas-rolabel" style="color:#6B4E9E;">👔 Manager</div>
          ${balk(s.mg, scoreKleur(s.mg), 160)}
        </div>
      </div>`).join("")}
    </div>
  </div>

  <!-- ═══ SECTIE 2: GAP-ANALYSE ═══ -->
  <div class="section">
    <div class="section-label">Gap-analyse — verschil manager vs. medewerkers</div>
    <p style="font-size:13px;color:#6B7A8D;line-height:1.7;margin-bottom:20px;">
      Een positieve gap betekent dat de manager het domein hoger beoordeelt dan medewerkers.
      Een negatieve gap betekent dat medewerkers positiever zijn dan de manager.
      Een gap ≥ 0.5 verdient aandacht; ≥ 1.0 is een significante kloof.
    </p>
    <table class="gap-tabel">
      <thead>
        <tr>
          <th>Domein</th>
          <th class="center">👥 Medewerkers</th>
          <th class="center">👔 Manager</th>
          <th class="center">Gap</th>
          <th>Signaal</th>
        </tr>
      </thead>
      <tbody>
        ${scores.map(s => {
          const gc = gapKleur(s.gap);
          const gl = gapLabel(s.gap);
          const gapTekst = s.gap !== null ? `${s.gap > 0 ? "+" : ""}${s.gap.toFixed(2)}` : "—";
          return `<tr>
            <td><span class="domein-dot" style="background:${s.kleur};"></span><strong style="color:${s.kleur};">${s.naam}</strong></td>
            <td style="text-align:center;font-size:18px;font-weight:700;color:${scoreKleur(s.mw)};">${s.mw !== null ? s.mw.toFixed(1) : "—"}</td>
            <td style="text-align:center;font-size:18px;font-weight:700;color:${scoreKleur(s.mg)};">${s.mg !== null ? s.mg.toFixed(1) : "—"}</td>
            <td style="text-align:center;">
              <span class="gap-pill" style="background:${gc}18;color:${gc};">
                <span class="gap-arrow">${s.gap !== null && s.gap > 0 ? "▲" : s.gap !== null && s.gap < 0 ? "▼" : "●"}</span>
                ${gapTekst}
              </span>
            </td>
            <td style="font-size:12px;color:#5b6775;line-height:1.5;">${gl}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>

  <!-- ═══ SECTIE 3: OPEN ANTWOORDEN ═══ -->
  <div class="section">
    <div class="section-label">Open antwoorden per domein</div>
    ${openPerDomein.map(d => {
      const heeftData = d.mwAntw.length > 0 || d.mgAntw.length > 0;
      if (!heeftData) return "";
      return `
      <div class="open-blok">
        <div class="open-domein" style="color:${d.kleur};">${d.naam}</div>
        ${d.mwAntw.length > 0 ? `
        <div class="open-groep">
          <div class="open-roltitel">👥 Medewerkers</div>
          ${d.mwVraag ? `<div class="open-vraag">${d.mwVraag}</div>` : ""}
          ${d.mwAntw.map(a => `<div class="open-item" style="border-color:${d.kleur};">${a}</div>`).join("")}
        </div>` : ""}
        ${d.mgAntw.length > 0 ? `
        <div class="open-groep">
          <div class="open-roltitel">👔 Manager</div>
          ${d.mgVraag ? `<div class="open-vraag">${d.mgVraag}</div>` : ""}
          ${d.mgAntw.map(a => `<div class="open-item" style="border-color:${d.kleur};opacity:0.85;">${a}</div>`).join("")}
        </div>` : ""}
      </div>`;
    }).join("")}
    ${openPerDomein.every(d => d.mwAntw.length === 0 && d.mgAntw.length === 0)
      ? `<p style="color:#aaa;font-size:13px;">Nog geen open antwoorden beschikbaar.</p>`
      : ""}
  </div>

  <!-- ═══ TOELICHTING ═══ -->
  <div class="toelichting">
    <div style="font-size:11px;color:#0F766E;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Over deze rapportage</div>
    <p style="font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65);">
      Deze totaalrapportage combineert de medewerkersscan en de managementscan van Het Teamkompas.
      Scores lopen van 1 tot 5. Een score ≥ 4 duidt op een sterke positie; 3–4 vraagt aandacht; onder 3 is prioritaire actie gewenst.
      De gap-analyse toont het verschil in perceptie tussen de leidinggevende en het team per domein.
      Individuele antwoorden zijn anoniem verwerkt.
    </p>
  </div>

  ${verdiepingen.length > 0 ? `
  <!-- ═══ VERDIEPINGSRESULTATEN ═══ -->
  <div class="section">
    <div class="section-label">Verdiepende scans — aanvullende inzichten</div>
    <p style="font-size:13px;color:#6B7A8D;line-height:1.7;margin-bottom:20px;">
      Onderstaande verdiepende scans zijn aanvullend ingezet op de domeinen die extra aandacht vroegen.
      De resultaten zijn hieronder per scan samengevat.
    </p>
    ${verdiepingen.map(v => {
      const vResp = antwoordenVoor(v.id);
      const isJDR = v.type === "verdieping_energie_motivatie";
      const vLabel = {
        verdieping_veiligheid_leiderschap: "Veiligheid en leiderschap — Secure Base",
        verdieping_beleving_verandering:   "Beleving van verandering — SCARF",
        verdieping_energie_motivatie:      "Energie en motivatie — JD-R model",
        verdieping_verbeteren_leren:       "Verbeteren en leren — Lean/Agile",
        verdieping_gecombineerd:           "Gecombineerde verdieping",
      }[v.type] || v.naam;
      const vKleur = {
        verdieping_veiligheid_leiderschap: "#5A8C3C",
        verdieping_beleving_verandering:   "#3A7DBF",
        verdieping_energie_motivatie:      "#E8821A",
        verdieping_verbeteren_leren:       "#6B4E9E",
        verdieping_gecombineerd:           "#0F766E",
      }[v.type] || "#0F766E";
      return `
      <div style="border-radius:12px;padding:20px 24px;margin-bottom:14px;border:1px solid ${vKleur}30;background:${vKleur}08;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;color:${vKleur};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Verdiepende scan</div>
            <div style="font-size:16px;font-weight:700;color:#0D1B2A;">${vLabel}</div>
          </div>
          <div style="font-size:12px;color:#6B7A8D;">${vResp.length} respondent${vResp.length !== 1 ? "en" : ""} · ${v.aangemaakt || ""}</div>
        </div>
        ${isJDR ? `<div style="font-size:11px;color:#6B7A8D;font-style:italic;margin-bottom:10px;">⚠ Taakeisen & Uitputting: lager = gunstiger. Hulpbronnen & Bevlogenheid: hoger = gunstiger.</div>` : ""}
        ${vResp.length === 0
          ? `<p style="font-size:13px;color:#aaa;">Nog geen respondenten — resultaten beschikbaar zodra de scan ingevuld is.</p>`
          : (() => {
              const dimMap = new Map();
              (v.stellingen || []).filter(s => s.type === "schaal").forEach(s => {
                const key = s.dimensieCode || s.dimensie || `pijler_${s.pijler}`;
                const naam = s.dimensie || key;
                const code = s.dimensieCode || "";
                if (!dimMap.has(key)) dimMap.set(key, { naam, code, ids: [] });
                dimMap.get(key).ids.push(s.id);
              });
              const dims = Array.from(dimMap.values()).slice(0, 12);
              return dims.map(d => {
                const vals = vResp.flatMap(a => d.ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null && v !== ""));
                const gem  = vals.length ? vals.reduce((s,v) => s + parseFloat(v), 0) / vals.length : null;
                // JD-R: taakeisen (A) en uitputting (C2) zijn omgekeerd — laag is goed
                const isOmgekeerd = isJDR && (d.code.startsWith("A") || d.code === "C2");
                const kleur = gem === null ? "#aaa"
                  : isOmgekeerd
                    ? (gem <= 2 ? "#2ecc71" : gem <= 3 ? "#f39c12" : "#e74c3c")
                    : (gem >= 4 ? "#2ecc71" : gem >= 3 ? "#f39c12" : "#e74c3c");
                const label = isOmgekeerd ? (gem <= 2 ? "Laag ✓" : gem <= 3 ? "Matig" : "Hoog ⚠") : "";
                return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                  <div style="font-size:12px;color:#5b6775;width:220px;flex-shrink:0;">${d.naam}${isOmgekeerd ? " ↓" : ""}</div>
                  <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
                    <div style="height:100%;border-radius:4px;background:${kleur};width:${gem ? (gem/5)*100 : 0}%;"></div>
                  </div>
                  <div style="font-size:13px;font-weight:700;color:${kleur};min-width:28px;">${gem ? gem.toFixed(1) : "—"}</div>
                </div>`;
              }).join("");
            })()
        }
      </div>`;
    }).join("")}
  </div>` : ""}

</div>
<div class="footer">
  © ${now.getFullYear()} Het Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `totaalrapportage-${mwLijst.klant.toLowerCase().replace(/\s+/g, "-")}-${mwLijst.naam.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenererend(null);
  };

  // ─── ADVIESRAPPORT: uitgebreid consultancy rapport ────────────────────────
  const genereerAdviesrapport = async (mwLijst, mgLijst, verdiepingen = []) => {
    setRapportError("");
    setGenererend(`advies_${mwLijst.id}`);

    // Altijd verse data ophalen op moment van genereren
    let mwResp, mgResp;
    try {
      const antSnap = await getDocs(collection(db, "antwoorden"));
      const alleAntwoorden = antSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => !a.verwijderd);
      mwResp = alleAntwoorden.filter(a => a.vragenlijstId === mwLijst.id);
      mgResp = alleAntwoorden.filter(a => a.vragenlijstId === mgLijst.id);
      setAntwoorden(alleAntwoorden);
    } catch (err) {
      console.error("Antwoorden ophalen mislukt:", err);
      setGenererend(null);
      return;
    }

    const mwStellingen = mwLijst.stellingen || MEDEWERKERSSCAN_STELLINGEN;
    const mgStellingen = mgLijst.stellingen || MANAGEMENTSCAN_STELLINGEN;

    const now   = new Date();
    const datum = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

    const DOMEINEN = [
      {
        naam: "Veiligheid en leiderschap", kleur: "#5A8C3C", lichtKleur: "#f0f6ec", pijler: 0,
        icon: "🛡",
        theorie: "Psychologische veiligheid is de belangrijkste voorspeller van teamprestaties, zoals Amy Edmondson van Harvard aantoonde: teams die fouten durven benoemen leren sneller en presteren structureel beter. Het gaat niet om harmonie, maar om de bereidheid risico te nemen in interpersoonlijke situaties — een mening geven, een idee opperen, een zorg uitspreken. Wanneer deze veiligheid ontbreekt, trekken mensen zich terug in zelfbescherming. Initiatief droogt op. Innovatie stokt. De leidinggevende speelt hierin een cruciale rol: psychologische veiligheid wordt niet geïnstalleerd via een workshop, maar dagelijks opgebouwd of afgebroken door klein gedrag — hoe gereageerd wordt op een vraag, hoe omgegaan wordt met een fout, of ruimte werkelijk genomen mag worden.",
        gapDuiding: "De gap tussen uw waarneming en de beleving van het team wijst op een blinde vlek in het leiderschap. U ervaart de sfeer als opener dan medewerkers die doen. Dit is een veelvoorkomend patroon: leidinggevenden zien de deur als open; medewerkers ervaren drempels die voor de leidinggevende onzichtbaar zijn. Deze drempels zijn zelden bedoeld, maar altijd voelbaar.",
        geenGapDuiding: "De scores laten weinig verschil zien tussen uw perspectief en dat van het team. Dat is een goed teken van wederzijds begrip op dit domein.",
        acties_manager: [
          { titel: "Kwetsbaarheid als instrument", tekst: "Deel bewust eigen twijfels of fouten in teamoverleggen. Niet als show, maar als signaal: hier mag dat. Wanneer de leidinggevende zelf kwetsbaar is, daalt de drempel voor anderen significant." },
          { titel: "Reageer actief beloningend op tegenstemmen", tekst: "Wanneer iemand een afwijkende mening inbrengt, bedank expliciet: 'Fijn dat je dat zegt — dat hadden we anders gemist.' Dit gedrag, consistent herhaald, herprogrammeert de teamcultuur." },
          { titel: "Introduceer een vaste 'afwijkende mening' ronde", tekst: "Sluit vergaderingen af met de vraag: 'Wat hebben we vandaag niet gezegd dat we wel hadden moeten zeggen?' Dit maakt het structureel veilig om het oneens te zijn." },
          { titel: "Voer individuele check-ins in", tekst: "Plan maandelijks een korte 1-op-1 (15-20 min) zonder agenda. Niet over werk, maar over hoe het gáát. Dit is de meest directe investering in psychologische veiligheid." },
        ],
        acties_team: [
          { titel: "Oefen met kleine risico's", tekst: "Begin met kleine momenten van openheid: een vraag stellen die je normaliter niet stelt, een idee opperen waarvan je twijfelt. Veiligheid groeit door gebruik." },
          { titel: "Bespreek wat veiligheid in dit team betekent", tekst: "Maak dit onderwerp expliciet als team. Wat zijn situaties waarin iedereen zich vrij voelt? Wat zijn patronen die mensen doen zwijgen? Bewustwording is de eerste stap." },
          { titel: "Erken en waardeer bijdragen van anderen", tekst: "Wanneer een collega iets inbrengt dat lastig is, steun dat zichtbaar. Een team dat zijn eigen veiligheid bewaakt is weerbaarder dan een team dat dat van de manager verwacht." },
        ],
      },
      {
        naam: "Beleving van verandering", kleur: "#3A7DBF", lichtKleur: "#edf4fb", pijler: 1,
        icon: "🔄",
        theorie: "Mensen zijn van nature geen tegenstanders van verandering — ze zijn tegenstanders van onduidelijkheid, verlies van controle en het gevoel niet gehoord te worden. De neurowetenschapper David Rock beschrijft dit met het SCARF-model: Status, Certainty, Autonomy, Relatedness en Fairness zijn vijf domeinen die het brein actief monitort op dreiging. Verandering raakt al deze domeinen tegelijk. Zonder bewuste begeleiding activeert verandering een dreigingsrespons — het brein gaat in overlevingsmodus. Wat leidinggevenden daarin overschatten is de kracht van uitleggen. Begrijpen is niet hetzelfde als accepteren. Mensen hebben ruimte nodig om hun eigen betekenis te geven aan verandering, inclusief de weerstand en het verlies.",
        gapDuiding: "Dit is de grootste kloof in uw scan. U ervaart de veranderingen als helder en begrijpelijk; het team ervaart onduidelijkheid, onvoldoende tempo, en onvoldoende ruimte voor emoties en zorgen. Dit verschil is kenmerkend voor leidinggevenden die verandering inhoudelijk goed begeleiden maar de menselijke dimensie onderschatten. De boodschap is overgebracht — de betekenis is nog niet geland.",
        geenGapDuiding: "Team en manager beleven verandering op vergelijkbare wijze. Dit duidt op gezonde communicatie rondom verandertrajecten.",
        acties_manager: [
          { titel: "Onderscheid uitleggen van betekenis geven", tekst: "Informeer niet alleen over wát er verandert en waaróm — creëer ook ruimte voor wat dit met mensen doet. Plan een 'veranderconversatie' los van de informatiestroom: geen presentatie, maar een open gesprek over beleving." },
          { titel: "Maak de reisroute zichtbaar", tekst: "Teken samen met het team de verandering als een reis: waar staan we nu, wat zijn de volgende stappen, wanneer kunnen mensen invloed uitoefenen? Visualiseer dit en hang het op. Duidelijkheid reduceert angst." },
          { titel: "Erken het verlies expliciet", tekst: "Elke verandering betekent ook iets loslaten. Benoem dit: 'Ik begrijp dat dit vraagt dat jullie iets gewends loslaten. Dat is niet niks.' Dit klinkt klein, maar heeft groot effect op acceptatie." },
          { titel: "Betrek het team vroeg en substantieel", tekst: "Consulteer medewerkers niet na de beslissing, maar bij het bepalen van de aanpak. Autonomie in het hoe vergroot de acceptatie van het wat, zelfs als de richting vastligt." },
        ],
        acties_team: [
          { titel: "Benoem concreet wat onduidelijk is", tekst: "Formuleer de specifieke vragen die leven: niet 'dit voelt onzeker', maar 'ik weet niet wat dit betekent voor mijn takenpakket over zes maanden.' Concrete vragen kunnen beantwoord worden; vage zorgen niet." },
          { titel: "Onderscheid bezwaar van vraag", tekst: "Weerstand tegen verandering is vaak een vraag in vermomming. Oefen als team om bezwaren om te zetten in vragen: 'Wat heb ik nodig om dit te omarmen?' opent een gesprek dat 'dit werkt toch nooit' sluit." },
          { titel: "Deel ervaringen uit eerdere veranderingen", tekst: "Welke veranderingen hebben in dit team wél goed gewerkt? Wat maakte dat zo? Dit activeren van positieve veranderervaringen helpt het team zijn eigen verandervermogen te herkennen." },
        ],
      },
      {
        naam: "Energie en motivatie", kleur: "#E8821A", lichtKleur: "#fef5ec", pijler: 2,
        icon: "⚡",
        theorie: "Het Job Demands-Resources model (Bakker & Demerouti) toont aan dat bevlogenheid ontstaat op het snijvlak van betekenisvol werk en voldoende hulpbronnen om dat werk te doen. Wanneer taakeisen structureel de beschikbare hulpbronnen overtreffen, ontstaat uitputting. Wanneer hulpbronnen taakeisen overtreffen zonder voldoende uitdaging, ontstaat verveling. De zone van bevlogenheid is smal en vereist actief onderhoud. Motivatie is geen vaste eigenschap van een medewerker — het is de uitkomst van de relatie tussen de persoon, het werk, de context en het leiderschap. Leidinggevenden die motivatieproblemen individualiseren ('hij heeft geen drive') missen de systeemvraag: welke context produceren wij die dit gedrag oproept?",
        gapDuiding: "De gap op dit domein is kleiner dan op verandering en verbeteren, maar significant. U ziet meer energie en voldoening dan medewerkers rapporteren. Dit kan wijzen op een selectieve zichtbaarheid: u ziet de positieve momenten, medewerkers dragen ook de onderstroom van dagelijkse frustraties die niet altijd de weg naar boven vinden.",
        geenGapDuiding: "De energiebeleving wordt door beide partijen vergelijkbaar ingeschat. Dit is een gezonde basis voor verdere ontwikkeling.",
        acties_manager: [
          { titel: "Breng structurele energievreters in kaart", tekst: "Organiseer een 'energieaudit': vraag het team wat energie geeft en wat structureel energie kost. Niet als klaagmoment, maar als probleemanalyse. Focus vervolgens op het wegnemen van de grootste energielek — ook als dat systeem- of organisatievragen oproept." },
          { titel: "Geef betekenis terug aan het werk", tekst: "Verbind het dagelijkse werk expliciet aan de grotere impact: voor de klant, voor de organisatie, voor de samenleving. Mensen willen weten waarom hun bijdrage ertoe doet. Dit gesprek voeren — met regelmaat en oprechtheid — is een van de krachtigste motivatie-interventies." },
          { titel: "Differentieer in motivatiebehoeften", tekst: "Niet iedereen is gemotiveerd door hetzelfde. Voer individuele gesprekken over wat dit werk voor iemand betekenisvol maakt. Pas ondersteuning en uitdaging daarop aan. Dit vereist meer dan een functioneringsgesprek per jaar." },
          { titel: "Bescherm herstelruimte actief", tekst: "Herstel is geen luxe maar een prestatievereiste. Zorg dat pauzes genomen worden, overwerk de uitzondering blijft en vakantie volledig is. Dit begint bij het eigen gedrag van de leidinggevende." },
        ],
        acties_team: [
          { titel: "Signaleer energievreters vroeg en concreet", tekst: "Wacht niet tot uitputting. Benoem bij de leidinggevende of in teamoverleg wanneer iets structureel energie kost — met concrete voorbeelden. Vroege signalering maakt oplossingen mogelijk die later niet meer beschikbaar zijn." },
          { titel: "Investeer in onderlinge hulpbronnen", tekst: "Energie is besmettelijk. Zoek actief de collega's die je energie geven en investeer in die contacten. Help elkaar bij taken die de ander energie kosten maar jou relatief weinig. Wederzijdse hulpbronnen versterken het team als geheel." },
          { titel: "Definieer je eigen energiebronnen", tekst: "Wat maakt dat je 's ochtends met zin aan het werk begint? Zorg dat je werk minstens een deel van die bronnen bevat. Als dat niet het geval is, maak dat bespreekbaar — niet als klacht, maar als concrete vraag om herpositionering." },
        ],
      },
      {
        naam: "Verbeteren en leren", kleur: "#6B4E9E", lichtKleur: "#f3f0f9", pijler: 3,
        icon: "📈",
        theorie: "Organisaties die leren zijn niet organisaties die trainingen organiseren — het zijn organisaties waar leren ingebed is in de dagelijkse praktijk. Chris Argyris onderscheidde single-loop leren (problemen oplossen binnen bestaande aannames) van double-loop leren (het bevragen van de aannames zelf). De meeste teams zijn vaardig in het eerste, maar schieten tekort in het tweede. Eigenaarschap over verbetering — het gevoel dat ik invloed heb op hoe mijn werk beter kan — is de kern van een leercultuur. Wanneer medewerkers verbeterideeën inbrengen die niet worden opgepakt, of wanneer verbeteren als extra taak voelt bovenop de reguliere werkdruk, trekt dit eigenaarschap zich terug. Het resultaat is een team dat uitvoert maar niet evolueert.",
        gapDuiding: "Dit domein laat een van de grootste gaps zien. U ervaart een cultuur van verbeteren en leren; het team ervaart dat verbeterideeën niet landen en dat verbeteren als last voelt. Dit is een kritisch signaal: de infrastructuur van leren is mogelijk aanwezig, maar de cultuur nog niet. Ideeën worden wellicht ontvangen maar niet merkbaar opgepakt — wat het inbrengen ervan geleidelijk ontmoedigt.",
        geenGapDuiding: "De leercultuur wordt door beide partijen vergelijkbaar beleefd. Er is een gezonde basis voor verdere verdieping.",
        acties_manager: [
          { titel: "Sluit de feedbackloop structureel", tekst: "Elke keer dat een verbeteridee wordt ingebracht en niets mee gedaan wordt zonder uitleg, sterft een stuk eigenaarschap. Introduceer een zichtbaar systeem: idee → reactie binnen zeven dagen → besluit met onderbouwing. Maak dit transparant." },
          { titel: "Maak van fouten leermateriaal", tekst: "Voer maandelijks een 'leermoment' in: bespreek één ding dat niet goed ging en wat we er als team van leren. Zonder schuldvraag. Dit normaliseert falen als onderdeel van verbeteren." },
          { titel: "Experimenteerruimte als beleid", tekst: "Reserveer bewust tijd en ruimte voor kleine experimenten — een anders ingerichte werkprocedure, een nieuw hulpmiddel, een andere aanpak van een terugkerend probleem. Klein beginnen, snel leren, breed delen." },
          { titel: "Erken en vier verbeterinitiatieven", tekst: "Wanneer een medewerker een verbetering doorvoert, maak dit zichtbaar in het team. Niet als loftuiting, maar als signaal: dit is hoe we hier werken. Gedrag dat gezien en gewaardeerd wordt, herhaalt zich." },
        ],
        acties_team: [
          { titel: "Breng verbeterideeën gestructureerd in", tekst: "Een idee dat goed geframed is, maakt meer kans. Beschrijf het probleem, de voorgestelde oplossing, de verwachte impact en wat je nodig hebt. Dit vergroot de kans op opvolging en laat zien dat je verder denkt dan klagen." },
          { titel: "Eigenaardschap begint bij jezelf", tekst: "Wacht niet op toestemming voor kleine verbeteringen binnen je eigen werkplek of werkwijze. Begin klein, doe het, deel het. Dit bouwt een reputatie op als iemand die actief bijdraagt aan verbetering." },
          { titel: "Leer van elkaar, niet alleen van trainingen", tekst: "Plan informele kennisdeling: 'Wat heb jij deze week geleerd?' als vaste afsluiter van een teamoverleg. Dit versterkt het collectieve leren zonder extra belasting." },
        ],
      },
      {
        naam: "Samenwerking en communicatie", kleur: "#0F766E", lichtKleur: "#f0faf9", pijler: 4,
        icon: "🤝",
        mwIds: [1001,1002,1003,1004], mgIds: [2001,2002,2003,2004],
        mwOpenIds: [1005], mgOpenIds: [2005],
        theorie: "Effectieve samenwerking vraagt meer dan goede intenties — het vraagt bewuste afstemming op communicatiestijl, verwachtingen en de manier waarop mensen met misverstanden omgaan. Verschillen in werkstijl en communicatie zijn onvermijdelijk in elk divers team. De vraag is niet hóf die verschillen er zijn, maar of het team ze ziet als bron van kracht of als bron van wrijving. Teams die leren elkaars communicatiestijl te lezen en zich bewust aanpassen, zijn veerkrachtiger, innovatiever en prettiger om in te werken.",
        gapDuiding: "Er is een verschil in hoe de manager en het team de samenwerking en communicatie ervaren. Dit kan duiden op blinde vlekken aan managementkant over wat er werkelijk speelt in de onderlinge dynamiek, of op patronen die medewerkers als normaal zijn gaan beschouwen maar die de leidinggevende nog niet heeft opgemerkt.",
        geenGapDuiding: "Manager en team beoordelen de samenwerking en communicatie vergelijkbaar. Er is een gedeeld beeld van hoe de onderlinge afstemming verloopt.",
        acties_manager: [
          { titel: "Maak communicatiestijlen bespreekbaar", tekst: "Investeer in een gesprek over hoe mensen van nature communiceren. Niet als beoordeling, maar als wederzijds begrip. Dit verlaagt de drempel om stijlverschillen te benoemen als die tot wrijving leiden." },
          { titel: "Normaliseer het corrigeren van misverstanden", tekst: "Wanneer een misverstand ontstaat, maak het bespreekbaar zonder de schuldvraag. Introduceer een teamafspraak: 'Als het niet klopt wat ik hoor, zeg het dan.' Dit maakt het veilig om te corrigeren." },
        ],
        acties_team: [
          { titel: "Vraag door in plaats van aanvullen", tekst: "Wanneer iets onduidelijk is, vraag dan expliciet wat bedoeld wordt voordat je conclusies trekt. Dit voorkomt misverstanden die stilzwijgend escaleren." },
          { titel: "Benoem stijlverschillen als kracht", tekst: "Oefen in het benoemen wat een collega goed doet op een manier die jij anders aanpakt. Dit verschuift het frame van 'anders is lastig' naar 'anders is aanvullend'." },
        ],
      },
      {
        naam: "Richting en betrokkenheid", kleur: "#8B5CF6", lichtKleur: "#f5f3ff", pijler: 4,
        icon: "🧭",
        mwIds: [1027,1028], mgIds: [2027,2028],
        mwOpenIds: [1029], mgOpenIds: [2029, 2030],
        theorie: "Betrokkenheid bij de richting van een team is geen vanzelfsprekendheid — het ontstaat wanneer mensen het gevoel hebben dat ze er daadwerkelijk toe doen. Dat vraagt van de leidinggevende meer dan transparantie over plannen: het vraagt dat medewerkers zichzelf herkennen in de koers. Richting bepalen is geen eenrichtingsverkeer. De meest duurzame beweging ontstaat wanneer de leidinggevende zicht heeft op de menselijke uitdagingen in het team én wanneer medewerkers vertrouwen hebben dat hun inbreng ook echt iets verandert.",
        gapDuiding: "Er zit een verschil in hoe betrokken medewerkers zich voelen bij de richting van het team en hoe de manager dit inschat. Dit kan betekenen dat de leidinggevende meer zicht heeft op de koers dan het team ervaart — of dat medewerkers minder vertrouwen hebben dat hun inbreng echt wordt opgepakt dan de leidinggevende denkt.",
        geenGapDuiding: "De betrokkenheid bij richting en de verwachtingen daarover worden door beide partijen vergelijkbaar beleefd. Er is een gezonde basis van gedeeld perspectief op de koers van het team.",
        acties_manager: [
          { titel: "Maak de eerste stap concreet en zichtbaar", tekst: "Vraag het team expliciet: 'Wat is voor jullie de meest voelbare eerste stap?' en koppel dit terug als actie. Het nakomen van deze afspraak is de meest effectieve manier om vertrouwen op te bouwen." },
          { titel: "Benoem waar de hefboom zit", tekst: "Deel uw eigen beeld van waar de grootste winst te behalen is, en vraag het team daarna om reactie. Dit opent een gesprek over richting in plaats van een presentatie erover." },
        ],
        acties_team: [
          { titel: "Formuleer uw eerste stap als voorstel", tekst: "Schrijf individueel op wat voor jou de meest waardevolle eerste stap zou zijn. Deel dit in het team. Concrete voorstellen zijn krachtiger dan algemene wensen." },
          { titel: "Spreek uit wat vertrouwen geeft of ontbreekt", tekst: "Benoem als team wat nodig is om meer vertrouwen te hebben dat verbeteringen ook echt worden opgepakt. Dit maakt verwachtingen bespreekbaar." },
        ],
      },
    ];

    const gemPijlerLijst = (pijler, resp, stellingen, explicieteIds = null) => {
      const ids = explicieteIds
        ? explicieteIds
        : stellingen.filter(s => s.pijler === pijler && s.type === "schaal").map(s => s.id);
      const vals = resp.flatMap(a => ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null && v !== ""));
      return vals.length ? vals.reduce((s, v) => s + parseFloat(v), 0) / vals.length : null;
    };

    const scores = DOMEINEN.map(d => {
      const mw  = gemPijlerLijst(d.pijler, mwResp, mwStellingen, d.mwIds || null);
      const mg  = gemPijlerLijst(d.pijler, mgResp, mgStellingen, d.mgIds || null);
      const gap = mw !== null && mg !== null ? mg - mw : null;
      return { ...d, mw, mg, gap };
    });

    // Open antwoorden — met expliciete id-mapping voor samenwerking en richting
    const openPerDomein = DOMEINEN.map(d => {
      let mwOpen, mgOpen;
      if (d.mwOpenIds) {
        mwOpen = mwStellingen.filter(s => d.mwOpenIds.includes(s.id));
        mgOpen = mgStellingen.filter(s => d.mgOpenIds.includes(s.id));
      } else {
        mwOpen = mwStellingen.filter(s => s.pijler === d.pijler && s.type === "open");
        mgOpen = mgStellingen.filter(s => s.pijler === d.pijler && s.type === "open");
      }
      const mwAntw = mwOpen.flatMap(s => mwResp.map(a => a.antwoorden?.[s.id]).filter(v => v?.trim().length > 3));
      const mgAntw = mgOpen.flatMap(s => mgResp.map(a => a.antwoorden?.[s.id]).filter(v => v?.trim().length > 3));
      // Voor richting: meerdere open vragen per label
      const mwVragen = mwOpen.map(s => s.tekst).filter(Boolean);
      const mgVragen = mgOpen.map(s => s.tekst).filter(Boolean);
      return { ...d, mwVraag: mwOpen[0]?.tekst || "", mgVraag: mgOpen[0]?.tekst || "", mwVragen, mgVragen, mwAntw, mgAntw };
    });

    const scoreKleur  = s => !s || isNaN(s) ? "#999" : s >= 4 ? "#2ecc71" : s >= 3 ? "#f39c12" : "#e74c3c";
    const scoreLabel  = s => !s || isNaN(s) ? "—" : s >= 4 ? "Sterk" : s >= 3 ? "Aandacht nodig" : "Prioriteit";
    const gapKleur    = gap => gap === null ? "#999" : Math.abs(gap) >= 1.0 ? "#e74c3c" : Math.abs(gap) >= 0.5 ? "#f39c12" : "#2ecc71";
    const prioriteit  = scores.slice().sort((a,b) => (b.gap||0) - (a.gap||0));

    const minScore    = scores.reduce((min, s) => s.mw !== null && s.mw < (min?.mw ?? 99) ? s : min, null);
    const maxGap      = scores.reduce((max, s) => s.gap !== null && s.gap > (max?.gap ?? -99) ? s : max, null);

    const balk = (score, kleur, breedte = 180) => score !== null
      ? `<div style="display:flex;align-items:center;gap:10px;">
          <div style="width:${breedte}px;height:8px;background:#eee;border-radius:4px;overflow:hidden;flex-shrink:0;">
            <div style="height:100%;border-radius:4px;background:${kleur};width:${(score/5)*100}%;"></div>
          </div>
          <span style="font-size:15px;font-weight:700;color:${kleur};">${score.toFixed(1)}</span>
         </div>`
      : `<span style="color:#aaa;font-size:13px;">—</span>`;

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Adviesrapport — ${mwLijst.naam}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f4f6f9; color: #1a1a2e; font-size: 14px; line-height: 1.6; }

  /* ── Cover ── */
  .cover { background: #0D1B2A; min-height: 100vh; display: flex; flex-direction: column; padding: 0; page-break-after: always; position: relative; overflow: hidden; }
  .cover-accent { height: 6px; display: flex; }
  .cover-accent div { flex: 1; }
  .cover-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 80px 80px 60px; }
  .cover-tag { font-size: 11px; color: #0F766E; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 48px; }
  .cover-title { font-size: 52px; font-weight: 800; color: #ffffff; line-height: 1.1; margin-bottom: 20px; max-width: 700px; }
  .cover-subtitle { font-size: 20px; color: rgba(255,255,255,0.5); font-weight: 300; margin-bottom: 60px; }
  .cover-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 32px; }
  .cover-meta-item { padding-right: 32px; }
  .cover-meta-label { font-size: 10px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
  .cover-meta-value { font-size: 16px; font-weight: 600; color: #ffffff; }
  .cover-deco { position: absolute; right: -80px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; border-radius: 50%; background: rgba(15,118,110,0.06); border: 1px solid rgba(15,118,110,0.08); }
  .cover-deco2 { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); width: 340px; height: 340px; border-radius: 50%; background: rgba(15,118,110,0.05); border: 1px solid rgba(15,118,110,0.07); }

  /* ── Layout ── */
  .content { max-width: 980px; margin: 0 auto; padding: 60px 40px; }
  .page-break { page-break-before: always; }

  /* ── Secties ── */
  .chapter { margin-bottom: 64px; }
  .chapter-label { font-size: 10px; color: #0F766E; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
  .chapter-title { font-size: 28px; font-weight: 800; color: #0D1B2A; margin-bottom: 6px; line-height: 1.2; }
  .chapter-sub { font-size: 15px; color: #6B7A8D; margin-bottom: 32px; font-weight: 400; }
  .divider { height: 1px; background: #eaecf0; margin: 40px 0; }

  /* ── Leidende inzichten ── */
  .insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .insight-card { border-radius: 12px; padding: 24px; }
  .insight-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .insight-value { font-size: 40px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .insight-desc { font-size: 12px; color: #6B7A8D; line-height: 1.5; }

  /* ── Samenvatting scorekaarten ── */
  .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .score-card { background: white; border-radius: 14px; padding: 28px; box-shadow: 0 2px 16px rgba(0,0,0,0.05); border-left: 4px solid; }
  .score-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .score-card-naam { font-size: 13px; font-weight: 700; }
  .score-card-icon { font-size: 20px; }
  .score-rij { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .score-rolabel { font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; color: #6B7A8D; }
  .score-pill { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
  .gap-indicator { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f0f0; }
  .gap-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }

  /* ── Gap tabel ── */
  .gap-table { width: 100%; border-collapse: collapse; }
  .gap-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9aa3af; font-weight: 700; padding: 0 20px 14px; text-align: left; border-bottom: 2px solid #f0f0f0; }
  .gap-table th.c { text-align: center; }
  .gap-table td { padding: 18px 20px; border-bottom: 1px solid #f8f9fa; vertical-align: middle; font-size: 13px; }
  .gap-table tr:last-child td { border-bottom: none; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
  .gap-pil { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; }

  /* ── Domeinsectie ── */
  .domein-section { background: white; border-radius: 16px; padding: 40px; margin-bottom: 32px; box-shadow: 0 2px 20px rgba(0,0,0,0.05); page-break-inside: avoid; }
  .domein-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
  .domein-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .domein-titels { flex: 1; }
  .domein-naam { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .domein-scores-inline { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
  .score-inline { display: flex; align-items: center; gap: 6px; }
  .score-inline-label { font-size: 11px; color: #6B7A8D; font-weight: 600; }
  .score-inline-val { font-size: 18px; font-weight: 800; }

  .theorie-blok { background: #f8f9fb; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; border-left: 3px solid #dde1e9; }
  .theorie-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9aa3af; margin-bottom: 10px; }
  .theorie-tekst { font-size: 13px; color: #3d4555; line-height: 1.75; }

  .gap-duiding { border-radius: 10px; padding: 18px 22px; margin-bottom: 24px; }
  .gap-duiding-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .gap-duiding-tekst { font-size: 13px; line-height: 1.75; }

  .open-sectie { margin-bottom: 24px; }
  .open-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9aa3af; margin-bottom: 12px; }
  .open-item { background: #f8f9fb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 13px; line-height: 1.65; color: #444; border-left: 3px solid; }

  .acties-blok { margin-bottom: 0; }
  .acties-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9aa3af; margin-bottom: 14px; }
  .acties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .actie-kaart { border-radius: 10px; padding: 18px 20px; border: 1px solid #eee; }
  .actie-titel { font-size: 13px; font-weight: 700; color: #0D1B2A; margin-bottom: 6px; }
  .actie-tekst { font-size: 12px; color: #5b6775; line-height: 1.65; }
  .acties-roltitel { font-size: 12px; font-weight: 700; color: #0D1B2A; margin: 16px 0 10px; display: flex; align-items: center; gap: 6px; }

  /* ── Conclusie ── */
  .conclusie-box { background: #0D1B2A; color: white; border-radius: 16px; padding: 40px 44px; margin-bottom: 32px; }
  .conclusie-label { font-size: 10px; color: #0F766E; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
  .conclusie-title { font-size: 22px; font-weight: 700; margin-bottom: 16px; }
  .conclusie-tekst { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.8; }
  .prioriteit-rij { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .prioriteit-rij:last-child { border-bottom: none; }
  .prioriteit-nr { width: 28px; height: 28px; border-radius: 50%; background: rgba(15,118,110,0.25); color: #0F766E; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .prioriteit-naam { font-size: 14px; font-weight: 600; color: white; flex: 1; }
  .prioriteit-gap { font-size: 12px; color: rgba(255,255,255,0.45); }

  .vervolgstap-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 32px; }
  .vervolgstap-kaart { background: white; border-radius: 12px; padding: 22px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .vervolgstap-nr { font-size: 32px; font-weight: 800; color: #eee; margin-bottom: 8px; }
  .vervolgstap-titel { font-size: 13px; font-weight: 700; color: #0D1B2A; margin-bottom: 6px; }
  .vervolgstap-tekst { font-size: 12px; color: #6B7A8D; line-height: 1.6; }

  .footer { text-align: center; padding: 40px 20px; color: #b0b8c4; font-size: 11px; border-top: 1px solid #eaecf0; margin-top: 40px; }

  @media print {
    body { background: white; }
    .content { padding: 30px 20px; }
    .cover { min-height: unset; padding-bottom: 40px; }
    .page-break { page-break-before: always; }
    .domein-section { page-break-inside: avoid; box-shadow: none; border: 1px solid #eee; }
  }
</style>
</head>
<body>

<!-- ════════════════════════════════════════
     COVER
════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-accent">
    <div style="background:#5A8C3C;"></div>
    <div style="background:#3A7DBF;"></div>
    <div style="background:#E8821A;"></div>
    <div style="background:#6B4E9E;"></div>
  </div>
  <div class="cover-deco"></div>
  <div class="cover-deco2"></div>
  <div class="cover-body">
    <div>
      <div class="cover-tag">Het Teamkompas · Adviesrapport</div>
      <div class="cover-title">Teamanalyse &amp;<br/>Ontwikkeladvies</div>
      <div class="cover-subtitle">${mwLijst.naam} · ${mwLijst.klant}</div>
    </div>
    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Opgesteld op</div>
        <div class="cover-meta-value">${datum}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Medewerkers</div>
        <div class="cover-meta-value">${mwResp.length} respondenten</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Leidinggevende</div>
        <div class="cover-meta-value">${mgResp.length} respondent${mgResp.length !== 1 ? "en" : ""}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Instrument</div>
        <div class="cover-meta-value">Het Teamkompas</div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     INHOUD
════════════════════════════════════════ -->
<div class="content">

  <!-- ── Inleiding ── -->
  <div class="chapter">
    <div class="chapter-label">01 · Inleiding</div>
    <div class="chapter-title">Wat dit rapport u vertelt</div>
    <div class="chapter-sub">En hoe u er het meeste uit haalt</div>

    <p style="font-size:14px;color:#3d4555;line-height:1.85;margin-bottom:20px;">
      Voor u ligt het adviesrapport op basis van de Teamscan van Het Teamkompas. Dit rapport combineert de resultaten van de medewerkerscan en de managementscan tot één geïntegreerd beeld van hoe uw team functioneert — en waar de grootste kansen liggen voor ontwikkeling.
    </p>
    <p style="font-size:14px;color:#3d4555;line-height:1.85;margin-bottom:20px;">
      Het rapport is opgebouwd langs vier domeinen: <strong>Veiligheid &amp; Leiderschap</strong>, <strong>Beleving van verandering</strong>, <strong>Energie &amp; Motivatie</strong> en <strong>Verbeteren &amp; Leren</strong>. Deze domeinen vormen samen het fundament van een goed functionerend team. Ze zijn niet los van elkaar te zien — veiligheid beïnvloedt energie, energie beïnvloedt het vermogen tot verandering, en verandering vraagt om een cultuur van leren.
    </p>
    <p style="font-size:14px;color:#3d4555;line-height:1.85;">
      Bijzonder aan dit rapport is de <strong>perceptiegap</strong>: het verschil tussen hoe de leidinggevende het team ervaart en hoe het team zichzelf ervaart. Waar deze gap groot is, ligt niet een schuldvraag maar een ontwikkelkans. De adviezen in dit rapport zijn direct toepasbaar, zonder grote reorganisaties of extra budgetten.
    </p>
  </div>

  <div class="divider"></div>

  <!-- ── Leidende inzichten ── -->
  <div class="chapter">
    <div class="chapter-label">02 · Leidende inzichten</div>
    <div class="chapter-title">Wat direct opvalt</div>
    <div class="chapter-sub">De drie meest bepalende signalen uit de data</div>

    <div class="insight-grid">
      <div class="insight-card" style="background:${minScore?.lichtKleur||'#f0f6ec'};border:1px solid ${minScore?.kleur||'#5A8C3C'}22;">
        <div class="insight-label" style="color:${minScore?.kleur||'#5A8C3C'};">Domein met laagste teamscore</div>
        <div class="insight-value" style="color:${minScore?.kleur||'#5A8C3C'};">${minScore?.mw?.toFixed(1) || "—"}</div>
        <div style="font-size:14px;font-weight:600;color:#0D1B2A;margin-bottom:4px;">${minScore?.naam || "—"}</div>
        <div class="insight-desc">Dit domein verdient prioritaire aandacht vanuit het perspectief van het team.</div>
      </div>
      <div class="insight-card" style="background:${maxGap?.lichtKleur||'#edf4fb'};border:1px solid ${maxGap?.kleur||'#3A7DBF'}22;">
        <div class="insight-label" style="color:${maxGap?.kleur||'#3A7DBF'};">Grootste perceptiegap</div>
        <div class="insight-value" style="color:${maxGap?.kleur||'#3A7DBF'};">+${maxGap?.gap?.toFixed(2) || "—"}</div>
        <div style="font-size:14px;font-weight:600;color:#0D1B2A;margin-bottom:4px;">${maxGap?.naam || "—"}</div>
        <div class="insight-desc">Hier is het verschil in perceptie tussen leidinggevende en team het grootst.</div>
      </div>
    </div>

    <div style="background:white;border-radius:14px;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,0.05);margin-bottom:0;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9aa3af;margin-bottom:20px;">Domeinoverzicht — scores op schaal 1–5</div>
      <table class="gap-table">
        <thead>
          <tr>
            <th>Domein</th>
            <th class="c">👥 Team</th>
            <th class="c">👔 Manager</th>
            <th class="c">Gap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${scores.map(s => {
            const gc = gapKleur(s.gap);
            return `<tr>
              <td><span class="dot" style="background:${s.kleur};"></span><strong style="color:${s.kleur};">${s.naam}</strong></td>
              <td style="text-align:center;font-size:18px;font-weight:800;color:${scoreKleur(s.mw)};">${s.mw?.toFixed(1) || "—"}</td>
              <td style="text-align:center;font-size:18px;font-weight:800;color:${scoreKleur(s.mg)};">${s.mg?.toFixed(1) || "—"}</td>
              <td style="text-align:center;"><span class="gap-pil" style="background:${gc}15;color:${gc};">${s.gap !== null ? (s.gap > 0 ? "▲ +" : "▼ ") + s.gap.toFixed(2) : "—"}</span></td>
              <td><span class="score-pill" style="background:${scoreKleur(s.mw)}15;color:${scoreKleur(s.mw)};">${scoreLabel(s.mw)}</span></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  </div>

  <div class="divider page-break"></div>

  <!-- ── Per domein ── -->
  <div class="chapter">
    <div class="chapter-label">03 · Domeinanalyse</div>
    <div class="chapter-title">Diepteanalyse per domein</div>
    <div class="chapter-sub">Theorie, data, perceptie en concrete adviezen</div>

    ${scores.map((s, idx) => {
      const open = openPerDomein[idx];
      const heeftOpen = open.mwAntw.length > 0 || open.mgAntw.length > 0;
      const gapAbs = s.gap !== null ? Math.abs(s.gap) : 0;
      const gapTekst = s.gap !== null
        ? `${s.gap > 0 ? "+" : ""}${s.gap.toFixed(2)} — ${gapAbs >= 1.0 ? "Grote kloof" : gapAbs >= 0.5 ? "Merkbaar verschil" : "Kleine kloof"}`
        : "Geen gap-data";
      const gc = gapKleur(s.gap);
      const duidingTekst = gapAbs >= 0.5 ? s.gapDuiding : s.geenGapDuiding;

      return `
      <div class="domein-section" ${idx > 0 ? 'style="margin-top:32px;"' : ''}>

        <div class="domein-header">
          <div class="domein-icon" style="background:${s.lichtKleur};">${s.icon}</div>
          <div class="domein-titels">
            <div class="domein-naam" style="color:${s.kleur};">${s.naam}</div>
            <div class="domein-scores-inline">
              <div class="score-inline">
                <span class="score-inline-label">👥 Team</span>
                <span class="score-inline-val" style="color:${scoreKleur(s.mw)};">${s.mw?.toFixed(1) || "—"}</span>
              </div>
              <div style="width:1px;height:20px;background:#eee;"></div>
              <div class="score-inline">
                <span class="score-inline-label">👔 Manager</span>
                <span class="score-inline-val" style="color:${scoreKleur(s.mg)};">${s.mg?.toFixed(1) || "—"}</span>
              </div>
              <div style="width:1px;height:20px;background:#eee;"></div>
              <span class="gap-pil" style="background:${gc}15;color:${gc};">${s.gap !== null ? (s.gap > 0 ? "▲ +" : "▼ ") + s.gap.toFixed(2) : "—"} gap</span>
            </div>
          </div>
        </div>

        <div class="theorie-blok">
          <div class="theorie-label">Theoretische achtergrond</div>
          <div class="theorie-tekst">${s.theorie}</div>
        </div>

        <div class="gap-duiding" style="background:${gc}0d;border:1px solid ${gc}22;">
          <div class="gap-duiding-label" style="color:${gc};">Wat de data zegt</div>
          <div class="gap-duiding-tekst" style="color:#3d4555;">${duidingTekst}</div>
        </div>

        ${heeftOpen ? `
        <div class="open-sectie">
          <div class="open-label">Wat mensen zelf zeggen</div>
          ${open.mwAntw.length > 0 ? `
          <div style="font-size:11px;color:#6B7A8D;font-weight:600;margin-bottom:8px;">👥 MEDEWERKERS</div>
          ${open.mwVragen && open.mwVragen.length > 1
            ? open.mwVragen.map((vraag, vi) => {
                const vragAntw = (open.mwOpenIds || []).length > 1
                  ? mwResp.map(a => a.antwoorden?.[(mwStellingen.filter(s => s.type==="open" && open.mwOpenIds?.includes(s.id))[vi] || {}).id]).filter(v => v?.trim().length > 3)
                  : open.mwAntw;
                return vragAntw.length > 0 ? `<div style="font-size:11px;color:#9aa3af;font-style:italic;margin-bottom:6px;margin-top:8px;">${vraag}</div>${vragAntw.map(a => `<div class="open-item" style="border-color:${s.kleur};">${a}</div>`).join("")}` : "";
              }).join("")
            : (open.mwVraag ? `<div style="font-size:11px;color:#9aa3af;font-style:italic;margin-bottom:6px;">${open.mwVraag}</div>` : "") +
              open.mwAntw.map(a => `<div class="open-item" style="border-color:${s.kleur};">${a}</div>`).join("")
          }` : ""}
          ${open.mgAntw.length > 0 ? `
          <div style="font-size:11px;color:#6B7A8D;font-weight:600;margin-bottom:8px;margin-top:12px;">👔 MANAGER</div>
          ${open.mgVragen && open.mgVragen.length > 1
            ? open.mgVragen.map((vraag, vi) => {
                const stelling = mgStellingen.filter(s => s.type==="open" && (open.mgOpenIds||[]).includes(s.id))[vi];
                const vragAntw = stelling ? mgResp.map(a => a.antwoorden?.[stelling.id]).filter(v => v?.trim().length > 3) : [];
                return vragAntw.length > 0 ? `<div style="font-size:11px;color:#9aa3af;font-style:italic;margin-bottom:6px;margin-top:8px;">${vraag}</div>${vragAntw.map(a => `<div class="open-item" style="border-color:${s.kleur};opacity:0.85;">${a}</div>`).join("")}` : "";
              }).join("")
            : (open.mgVraag ? `<div style="font-size:11px;color:#9aa3af;font-style:italic;margin-bottom:6px;">${open.mgVraag}</div>` : "") +
              open.mgAntw.map(a => `<div class="open-item" style="border-color:${s.kleur};opacity:0.85;">${a}</div>`).join("")
          }` : ""}
        </div>` : ""}

        <div class="acties-blok">
          <div class="acties-label">Concrete adviezen</div>
          <div class="acties-roltitel" style="color:${s.kleur};">👔 Voor de leidinggevende</div>
          <div class="acties-grid">
            ${s.acties_manager.map(a => `
            <div class="actie-kaart" style="border-color:${s.kleur}22;background:${s.lichtKleur};">
              <div class="actie-titel">${a.titel}</div>
              <div class="actie-tekst">${a.tekst}</div>
            </div>`).join("")}
          </div>
          <div class="acties-roltitel">👥 Voor het team</div>
          <div class="acties-grid">
            ${s.acties_team.map(a => `
            <div class="actie-kaart">
              <div class="actie-titel">${a.titel}</div>
              <div class="actie-tekst">${a.tekst}</div>
            </div>`).join("")}
          </div>
        </div>

      </div>`;
    }).join("")}
  </div>

  <div class="divider page-break"></div>

  ${verdiepingen.length > 0 ? `
  <!-- ── Verdiepende scans ── -->
  <div class="chapter">
    <div class="chapter-label">04 · Verdiepende scans</div>
    <div class="chapter-title">Aanvullende inzichten per domein</div>
    <div class="chapter-sub">Resultaten van de ingezette verdiepende meting${verdiepingen.length > 1 ? "en" : ""}</div>

    ${verdiepingen.map(v => {
      const vResp = antwoordenVoor(v.id);
      const isJDR = v.type === "verdieping_energie_motivatie";
      const vLabelMap = {
        verdieping_veiligheid_leiderschap: { label: "Veiligheid en leiderschap", sub: "Gebaseerd op de 9 kenmerken van Secure Base Leadership (Kohlrieser, Goldsworthy & Cooke)", kleur: "#5A8C3C", licht: "#f0f6ec" },
        verdieping_beleving_verandering:   { label: "Beleving van verandering", sub: "Gebaseerd op het SCARF-model (Rock, 2008) — neurowetenschappelijke inzichten over breinvriendelijk leiderschap", kleur: "#3A7DBF", licht: "#edf4fb" },
        verdieping_energie_motivatie:      { label: "Energie en motivatie", sub: "Gebaseerd op het JD-R model (Bakker & Demerouti) — taakeisen (laag = gunstig), hulpbronnen & bevlogenheid (hoog = gunstig), uitputting (laag = gunstig)", kleur: "#E8821A", licht: "#fef5ec" },
        verdieping_verbeteren_leren:       { label: "Verbeteren en leren", sub: "Gebaseerd op Lean- en Agile-principes — zelfreflectie leidinggevende en teamspiegel", kleur: "#6B4E9E", licht: "#f3f0f9" },
        verdieping_gecombineerd:           { label: "Gecombineerde verdieping", sub: "Meerdere domeinen in één verdiepende meting gecombineerd", kleur: "#0F766E", licht: "#f0faf9" },
      };
      const meta = vLabelMap[v.type] || { label: v.naam, sub: "", kleur: "#0F766E", licht: "#f4f7f9" };

      const dimMap = new Map();
      (v.stellingen || []).filter(s => s.type === "schaal").forEach(s => {
        const key  = s.dimensieCode || s.dimensie || `pijler_${s.pijler}`;
        const naam = s.dimensie || key;
        const code = s.dimensieCode || "";
        if (!dimMap.has(key)) dimMap.set(key, { naam, code, ids: [] });
        dimMap.get(key).ids.push(s.id);
      });

      const dims = Array.from(dimMap.values());
      const dimScores = dims.map(d => {
        const vals = vResp.flatMap(a => d.ids.map(id => a.antwoorden?.[id]).filter(v => v !== undefined && v !== null && v !== ""));
        const gem  = vals.length ? vals.reduce((s,v) => s + parseFloat(v), 0) / vals.length : null;
        // JD-R: taakeisen (A) en uitputting (C2) zijn omgekeerd — laag is goed
        const isOmgekeerd = isJDR && (d.code.startsWith("A") || d.code === "C2");
        // Omreken naar "positieve richting" voor vergelijking sterkste/zwakste
        const gemPositief = gem !== null ? (isOmgekeerd ? 6 - gem : gem) : null;
        return { ...d, gem, isOmgekeerd, gemPositief };
      });

      // Sterkste = hoogste positieve score; zwakste = laagste positieve score
      const gesorteerd = dimScores.filter(d => d.gemPositief !== null).sort((a,b) => b.gemPositief - a.gemPositief);
      const sterkst = gesorteerd[0];
      const zwakst  = gesorteerd[gesorteerd.length - 1];

      return `
      <div class="domein-section" style="margin-bottom:24px;">
        <div class="domein-header">
          <div class="domein-icon" style="background:${meta.licht};">🔍</div>
          <div class="domein-titels">
            <div class="domein-naam" style="color:${meta.kleur};">${meta.label} — Verdieping</div>
            <div style="font-size:12px;color:#6B7A8D;margin-top:4px;">${meta.sub}</div>
          </div>
        </div>

        <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
          <div style="background:#f8f9fb;border-radius:10px;padding:14px 18px;flex:1;min-width:140px;">
            <div style="font-size:10px;color:#9aa3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Respondenten</div>
            <div style="font-size:24px;font-weight:800;color:${meta.kleur};">${vResp.length}</div>
          </div>
          <div style="background:#f8f9fb;border-radius:10px;padding:14px 18px;flex:1;min-width:140px;">
            <div style="font-size:10px;color:#9aa3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Dimensies gemeten</div>
            <div style="font-size:24px;font-weight:800;color:${meta.kleur};">${dims.length}</div>
          </div>
          ${sterkst ? `<div style="background:${meta.licht};border-radius:10px;padding:14px 18px;flex:2;min-width:200px;border:1px solid ${meta.kleur}22;">
            <div style="font-size:10px;color:${meta.kleur};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Sterkste dimensie${sterkst.isOmgekeerd ? " (laag = goed)" : ""}</div>
            <div style="font-size:14px;font-weight:700;color:#0D1B2A;">${sterkst.naam} — <span style="color:#2ecc71;">${sterkst.gem?.toFixed(1)}</span></div>
          </div>` : ""}
          ${zwakst && zwakst !== sterkst ? `<div style="background:#fff8f7;border-radius:10px;padding:14px 18px;flex:2;min-width:200px;border:1px solid #e74c3c22;">
            <div style="font-size:10px;color:#e74c3c;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Aandachtsdimensie${zwakst.isOmgekeerd ? " (hoog = belasting)" : ""}</div>
            <div style="font-size:14px;font-weight:700;color:#0D1B2A;">${zwakst.naam} — <span style="color:#e74c3c;">${zwakst.gem?.toFixed(1)}</span></div>
          </div>` : ""}
        </div>

        ${isJDR ? `<div style="background:#fff8f0;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#9a6800;border-left:3px solid #E8821A;">
          <strong>Leeswijzer JD-R model:</strong> Taakeisen (A1–A5) en Uitputting (C2): een <em>lage</em> score is gunstig — deze zijn gemarkeerd met ↓.
          Hulpbronnen (B1–B5) en Bevlogenheid (C1): een <em>hoge</em> score is gunstig.
        </div>` : ""}

        ${vResp.length === 0
          ? `<div style="background:#f8f9fb;border-radius:10px;padding:18px 22px;color:#aaa;font-size:13px;">Nog geen respondenten. Resultaten worden hier getoond zodra de verdiepende scan ingevuld is.</div>`
          : `<div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9aa3af;margin-bottom:14px;">Scores per dimensie</div>
              ${dimScores.map(d => {
                // Kleur op basis van richting: omgekeerde dimensies kleuren rood bij hoge score
                const kleur = d.gem === null ? "#aaa"
                  : d.isOmgekeerd
                    ? (d.gem <= 2 ? "#2ecc71" : d.gem <= 3.5 ? "#f39c12" : "#e74c3c")
                    : (d.gem >= 4 ? "#2ecc71" : d.gem >= 3 ? "#f39c12" : "#e74c3c");
                const richtingLabel = d.isOmgekeerd ? " ↓" : "";
                return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                  <div style="font-size:12px;color:#3d4555;width:220px;flex-shrink:0;line-height:1.3;">${d.naam}${richtingLabel}</div>
                  <div style="flex:1;height:10px;background:#eee;border-radius:5px;overflow:hidden;">
                    <div style="height:100%;border-radius:5px;background:${kleur};width:${d.gem ? (d.gem/5)*100 : 0}%;"></div>
                  </div>
                  <div style="font-size:15px;font-weight:700;color:${kleur};min-width:32px;text-align:right;">${d.gem ? d.gem.toFixed(1) : "—"}</div>
                </div>`;
              }).join("")}
            </div>`
        }
      </div>`;
    }).join("")}
  </div>

  <div class="divider page-break"></div>
  ` : ""}

  <!-- ── Conclusie & vervolgstappen ── -->
  <div class="chapter">
    <div class="chapter-label">${verdiepingen.length > 0 ? "05" : "04"} · Conclusie</div>
    <div class="chapter-title">Prioriteiten en vervolgstappen</div>
    <div class="chapter-sub">Waar te beginnen en hoe verder</div>

    <div class="conclusie-box">
      <div class="conclusie-label">Prioritering op basis van gap</div>
      <div class="conclusie-title">Aanbevolen volgorde van aanpak</div>
      <div class="conclusie-tekst" style="margin-bottom:24px;">
        Onderstaande prioritering is gebaseerd op de combinatie van teamscores en perceptiegaps.
        Domeinen met een lage teamscore én een grote gap vragen om de meeste aandacht,
        omdat ze zowel een prestatiekloof als een bewustzijnskloof vertegenwoordigen.
      </div>
      ${prioriteit.map((s, i) => `
      <div class="prioriteit-rij">
        <div class="prioriteit-nr">${i+1}</div>
        <div>
          <div class="prioriteit-naam">${s.naam}</div>
          <div class="prioriteit-gap">Teamscore ${s.mw?.toFixed(1)||"—"} · Gap ${s.gap !== null ? (s.gap>0?"+":"")+s.gap.toFixed(2) : "—"} · ${Math.abs(s.gap||0)>=1.0?"Grote kloof":Math.abs(s.gap||0)>=0.5?"Merkbaar verschil":"Kleine kloof"}</div>
        </div>
      </div>`).join("")}
    </div>

    <div class="vervolgstap-grid">
      <div class="vervolgstap-kaart">
        <div class="vervolgstap-nr">01</div>
        <div class="vervolgstap-titel">Bespreek dit rapport</div>
        <div class="vervolgstap-tekst">Plan een teamgesprek om de resultaten te bespreken. Niet als presentatie, maar als gesprek. Vraag: "Herkent u dit? Wat verrast u?" Maak de data van iedereen.</div>
      </div>
      <div class="vervolgstap-kaart">
        <div class="vervolgstap-nr">02</div>
        <div class="vervolgstap-titel">Kies één prioriteit</div>
        <div class="vervolgstap-tekst">Begin bij het domein met de grootste gap én de laagste teamscore. Formuleer samen drie concrete acties en wijs een eigenaar aan per actie. Doe minder, maar doe het goed.</div>
      </div>
      <div class="vervolgstap-kaart">
        <div class="vervolgstap-nr">03</div>
        <div class="vervolgstap-titel">Meet over 90 dagen</div>
        <div class="vervolgstap-tekst">Herhaal de scan over drie maanden. Niet als controle, maar als kompas. Kleine verschuivingen zijn betekenisvol. Vier wat beter gaat — dat bekrachtigt de beweging.</div>
      </div>
    </div>
  </div>

</div>

<div class="footer">
  © ${now.getFullYear()} Het Teamkompas · mijnteamkompas.nl · Vertrouwelijk — uitsluitend bestemd voor de leidinggevende van ${mwLijst.klant}
</div>

</body>
</html>`;

    downloadHtmlRapport(
      `adviesrapport-${mwLijst.klant.toLowerCase().replace(/\s+/g, "-")}-${mwLijst.naam.toLowerCase().replace(/\s+/g, "-")}.html`,
      html
    );
    setGenererend(null);
  };

  const genereerRapport = (lijst) => {
    setRapportError("");
    setGenererend(lijst.id);
    const resp       = antwoordenVoor(lijst.id);

    if (isVeiligheidLeiderschapVerdieping(lijst)) {
      try {
        genereerRapportVeiligheidLeiderschap(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isVerbeterenLerenVerdieping(lijst)) {
      try {
        genereerRapportVerbeterenLeren(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isBelevingVeranderingVerdieping(lijst)) {
      try {
        genereerRapportBelevingVerandering(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isGecombineerdeVerdieping(lijst)) {
      try {
        genereerRapportGecombineerdeVerdieping(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    if (isEnergieMotivatieVerdieping(lijst)) {
      try {
        genereerRapportEnergieMotivatie(lijst, resp);
      } finally {
        setGenererend(null);
      }
      return;
    }

    const teamleden  = resp.filter(a => a.rol === "Teamlid");
    const management = resp.filter(a => a.rol === "Leidinggevende");
    const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;

    // Bereken scores
    const scores = pijlerNamen.map((naam, i) => {
      const totaal = gemPijler(i, resp, stellingen);
      const team   = gemPijler(i, teamleden, stellingen);
      const mgmt   = gemPijler(i, management, stellingen);
      const gap    = (team !== null && mgmt !== null) ? (mgmt - team) : null;
      return { naam, kleur: pijlerKleuren[i], totaal, team, mgmt, gap };
    });

    // Open antwoorden per pijler
    const openAntwoorden = pijlerNamen.map((naam, pi) => {
      const openStellingen = stellingen.filter(s => s.pijler === pi && s.type === "open");
      const antw = openStellingen.flatMap(s =>
        resp.map(a => a.antwoorden?.[s.id]).filter(v => v && v.trim().length > 3)
      );
      return { naam, kleur: pijlerKleuren[pi], vraag: openStellingen[0]?.tekst || "", antwoorden: antw };
    });

    const now    = new Date();
    const datum  = now.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

    const scoreRij = (label, score, kleur) => score !== null ? `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
        <div style="font-size:12px;color:${kleur};font-weight:600;width:130px;flex-shrink:0;">${label}</div>
        <div style="flex:1;height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden;">
          <div style="height:100%;border-radius:5px;background:${kleur};width:${(score/5)*100}%;"></div>
        </div>
        <div style="font-size:14px;font-weight:700;color:${kleur};width:32px;text-align:right;">${score.toFixed(1)}</div>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Rapportage — ${lijst.naam}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f9fc; color: #1a1a2e; }
    .header { background: #0D1B2A; color: white; padding: 40px 60px; position: relative; overflow: hidden; }
    .header-bar { display: flex; height: 6px; margin-bottom: 32px; }
    .header-bar div { flex: 1; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .header p  { font-size: 14px; color: rgba(255,255,255,0.6); }
    .header .meta { display: flex; gap: 32px; margin-top: 20px; }
    .header .meta-item { font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
    .header .meta-item span { display: block; font-size: 15px; color: white; font-weight: 600; margin-top: 2px; text-transform: none; letter-spacing: 0; }
    .content { max-width: 900px; margin: 0 auto; padding: 40px 40px; }
    .section { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #00A896; margin-bottom: 18px; }
    .pijler-card { border-radius: 10px; padding: 22px; margin-bottom: 16px; border: 1px solid #eee; }
    .pijler-naam { font-size: 16px; font-weight: 700; margin-bottom: 14px; }
    .gap-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-left: 10px; }
    .open-item { background: #f7f9fc; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 13px; line-height: 1.6; color: #444; border-left: 3px solid; }
    .samenvatting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .sum-card { border-radius: 10px; padding: 20px; text-align: center; }
    .sum-score { font-size: 36px; font-weight: 700; margin: 8px 0 4px; }
    .sum-label { font-size: 12px; opacity: 0.75; }
    .footer { text-align: center; padding: 32px; color: #aaa; font-size: 12px; }
    @media print { body { background: white; } .content { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-bar">
      <div style="background:#5A8C3C;"></div>
      <div style="background:#3A7DBF;"></div>
      <div style="background:#E8821A;"></div>
      <div style="background:#6B4E9E;"></div>
    </div>
    <div style="font-size:11px;color:#00A896;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Het Teamkompas — Rapportage</div>
    <h1>${lijst.naam}</h1>
    <p>${lijst.klant}</p>
    <div class="meta">
      <div class="meta-item">Datum<span>${datum}</span></div>
      <div class="meta-item">Respondenten<span>${resp.length}</span></div>
      <div class="meta-item">Teamleden<span>${teamleden.length}</span></div>
      <div class="meta-item">Leidinggevenden<span>${management.length}</span></div>
    </div>
  </div>

  <div class="content">

    <!-- SAMENVATTING -->
    <div class="section">
      <div class="section-title">Samenvatting per domein</div>
      <div class="samenvatting-grid">
        ${scores.map(s => `
        <div class="sum-card" style="background:${s.kleur}18;border:1px solid ${s.kleur}33;">
          <div style="font-size:11px;font-weight:700;color:${s.kleur};letter-spacing:1px;text-transform:uppercase;">${s.naam}</div>
          <div class="sum-score" style="color:${s.totaal ? scoreKleurHex(s.totaal) : '#aaa'};">${s.totaal ? s.totaal.toFixed(1) : "—"}</div>
          <div class="sum-label" style="color:${s.kleur};">Gemiddeld (schaal 1–5)</div>
        </div>`).join("")}
      </div>
    </div>

    <!-- GAP ANALYSE -->
    ${teamleden.length > 0 && management.length > 0 ? `
    <div class="section">
      <div class="section-title">Gap-analyse: team vs. leidinggevenden</div>
      ${scores.map(s => {
        const gap = s.gap;
        const gapKleur = gap === null ? "#aaa" : Math.abs(gap) >= 1.5 ? "#e74c3c" : Math.abs(gap) >= 0.8 ? "#f39c12" : "#2ecc71";
        const gapLabel = gap === null ? "" : Math.abs(gap) >= 1.5 ? "Grote kloof" : Math.abs(gap) >= 0.8 ? "Merkbaar verschil" : "Kleine kloof";
        return `
        <div class="pijler-card">
          <div class="pijler-naam" style="color:${s.kleur};">
            ${s.naam}
            ${gap !== null ? `<span class="gap-badge" style="background:${gapKleur}22;color:${gapKleur};">
              ${gap > 0 ? "+" : ""}${gap.toFixed(1)} — ${gapLabel}
            </span>` : ""}
          </div>
          ${scoreRij("👥 Team", s.team, "#5A8C3C")}
          ${scoreRij("👔 Leidinggevenden", s.mgmt, "#6B4E9E")}
        </div>`;
      }).join("")}
    </div>` : ""}

    <!-- OPEN ANTWOORDEN -->
    <div class="section">
      <div class="section-title">Open antwoorden per domein</div>
      ${openAntwoorden.map(p => p.antwoorden.length > 0 ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:${p.kleur};margin-bottom:6px;">${p.naam}</div>
        <div style="font-size:12px;color:#888;margin-bottom:10px;font-style:italic;">${p.vraag}</div>
        ${p.antwoorden.map(a => `
        <div class="open-item" style="border-color:${p.kleur};">${a}</div>`).join("")}
      </div>` : "").join("")}
      ${openAntwoorden.every(p => p.antwoorden.length === 0) ?
        `<div style="color:#aaa;font-size:13px;">Nog geen open antwoorden beschikbaar.</div>` : ""}
    </div>

    <div class="section" style="background:#0D1B2A;color:white;">
      <div style="font-size:11px;color:#00A896;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Over deze rapportage</div>
      <p style="font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65);">
        Deze rapportage is gegenereerd op basis van de ingevulde teamscans via Het Teamkompas. 
        Individuele antwoorden zijn anoniem verwerkt. Scores zijn gebaseerd op een schaal van 1 tot 5. 
        Een score van 4 of hoger duidt op een sterke positie; tussen 3 en 4 is er ruimte voor verbetering; 
        onder de 3 verdient het domein prioritaire aandacht.
      </p>
    </div>

  </div>
  <div class="footer">
    © ${now.getFullYear()} Het Teamkompas · mijnteamkompas.nl · Vertrouwelijk — alleen voor intern gebruik
  </div>
</body>
</html>`;

    // Download als HTML-bestand
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `rapportage-${lijst.klant.toLowerCase().replace(/\s+/g, "-")}-${lijst.naam.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenererend(null);
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:12,flexWrap:"wrap"}}>
        <div style={{fontSize:13,color:ADM.muted}}>
          {lijsten.length} scan(s) beschikbaar · {antwoorden.length} antwoorden geladen
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const [vlSnap, antSnap] = await Promise.all([
                getDocs(collection(db, "vragenlijsten")),
                getDocs(collection(db, "antwoorden")),
              ]);
              setLijsten(vlSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => !item.verwijderd && item.status !== "Verwijderd"));
              setAntwoorden(antSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => !a.verwijderd));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
          }}
          style={{display:"flex",alignItems:"center",gap:6,background:ADM.tealGlow,color:ADM.teal,
            border:"1px solid rgba(15,118,110,0.3)",borderRadius:8,padding:"7px 14px",
            fontSize:12,fontWeight:700,cursor:"pointer"}}>
          ↻ Vernieuwen
        </button>
      </div>
      <div style={{fontSize:12,color:ADM.muted,marginBottom:20,lineHeight:1.6,
        background:"rgba(0,168,150,0.06)",padding:"12px 16px",borderRadius:10,
        borderLeft:`3px solid ${ADM.teal}`}}>
        Klik op <strong style={{color:ADM.white}}>Genereer rapport</strong> om een HTML-rapportage te downloaden. 
        Open het bestand in je browser en gebruik <strong style={{color:ADM.white}}>Ctrl+P / Cmd+P</strong> om het als PDF op te slaan.
      </div>

      <section
        style={{
          background: ADM.navy,
          border: `1px solid ${ADM.teal}33`,
          borderRadius: 14,
          padding: "22px 24px",
          marginBottom: 20,
          boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ fontSize: 11, color: ADM.teal, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>
          Stap 8
        </div>
        <h2 style={{ margin: "0 0 10px", color: ADM.white, fontSize: 24, lineHeight: 1.2 }}>
          AI stelt maatwerkadvies op
        </h2>
        <p style={{ margin: "0 0 18px", color: ADM.muted, fontSize: 13, lineHeight: 1.7, maxWidth: 820 }}>
          Genereer een conceptadvies op basis van de geselecteerde teamscanaanvraag. Deze testversie controleert de koppeling tussen de beheeromgeving, Firebase Functions en Firestore.
        </p>
        <GenerateAdvicePanel scanId="2DEinhO516khWktsuO2z" />
      </section>
      {rapportError && (
        <div style={{fontSize:12,color:ADM.red,marginBottom:20,lineHeight:1.6,
          background:"rgba(231,76,60,0.10)",padding:"12px 16px",borderRadius:10,
          borderLeft:`3px solid ${ADM.red}`}}>
          {rapportError}
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(() => {
          // Groepeer gekoppelde medewerkers+management paren
          const gepaard = new Set();
          const groepen = [];

          lijsten.forEach(lijst => {
            if (gepaard.has(lijst.id)) return;
            gepaard.add(lijst.id);

            if (lijst.trajectRol === "medewerkers" && lijst.managementScanId) {
              const mgLijst = lijsten.find(l => l.id === lijst.managementScanId);
              if (mgLijst) {
                gepaard.add(mgLijst.id);
                groepen.push({ type: "paar", mw: lijst, mg: mgLijst });
                return;
              }
            }
            if (lijst.trajectRol === "management" && lijst.medewerkersScanId) {
              const mwLijst = lijsten.find(l => l.id === lijst.medewerkersScanId);
              if (mwLijst) {
                gepaard.add(mwLijst.id);
                groepen.push({ type: "paar", mw: mwLijst, mg: lijst });
                return;
              }
            }
            // Losstaande of oude vragenlijsten
            groepen.push({ type: "enkel", lijst });
          });

          return groepen.map((groep, gi) => {
            if (groep.type === "paar") {
              const { mw, mg } = groep;
              const mwResp = antwoordenVoor(mw.id);
              const mgResp = antwoordenVoor(mg.id);
              const isBezig = genererend === `totaal_${mw.id}`;
              const heeftData = mwResp.length >= 1 && mgResp.length >= 1;
              const heeftMwData = mwResp.length >= 1;
              const heeftMgData = mgResp.length >= 1;

              // Verdiepende scans gekoppeld aan dit traject-paar
              const verdiepingen = lijsten.filter(l =>
                l.parentVragenlijstId === mw.id ||
                l.parentVragenlijstId === mg.id
              );
              const verdiepingTypes = {
                verdieping_veiligheid_leiderschap: { label: "Veiligheid en leiderschap", kleur: "#5A8C3C" },
                verdieping_beleving_verandering:   { label: "Beleving van verandering", kleur: "#3A7DBF" },
                verdieping_energie_motivatie:      { label: "Energie en motivatie",       kleur: "#E8821A" },
                verdieping_verbeteren_leren:       { label: "Verbeteren en leren",        kleur: "#6B4E9E" },
                verdieping_gecombineerd:           { label: "Gecombineerde verdieping",  kleur: "#0F766E" },
              };

              return (
                <div key={gi} style={{background:ADM.navy,border:`1px solid ${ADM.teal}33`,borderRadius:12,padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        <div style={{fontWeight:700,color:ADM.white,fontSize:15}}>{mw.naam}</div>
                        <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:"rgba(15,118,110,0.15)",color:ADM.teal}}>TEAMSCAN PAAR</span>
                      </div>
                      <div style={{fontSize:12,color:ADM.muted,marginBottom:14}}>
                        🏢 {mw.klant} · 📅 {mw.aangemaakt}
                      </div>

                      {/* Responsstatus */}
                      <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,color:ADM.muted,display:"flex",alignItems:"center",gap:6}}>
                          <span style={{width:7,height:7,borderRadius:"50%",background:mwResp.length>=5?ADM.green:mwResp.length>0?ADM.orange:"#444",display:"inline-block",flexShrink:0}}/>
                          👥 Medewerkers: <strong style={{color:ADM.white}}>{mwResp.length}</strong>
                          {mwResp.length < 5 && <span style={{color:ADM.orange}}> (min. 5)</span>}
                        </span>
                        <span style={{fontSize:12,color:ADM.muted,display:"flex",alignItems:"center",gap:6}}>
                          <span style={{width:7,height:7,borderRadius:"50%",background:mgResp.length>=1?ADM.green:"#444",display:"inline-block",flexShrink:0}}/>
                          👔 Manager: <strong style={{color:ADM.white}}>{mgResp.length}</strong>
                          {mgResp.length === 0 && <span style={{color:ADM.orange}}> (nog niet ingevuld)</span>}
                        </span>
                      </div>

                      {/* Verdiepende scans */}
                      {verdiepingen.length > 0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:10,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",fontWeight:700,marginBottom:8}}>
                            Verdiepende scans ({verdiepingen.length})
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            {verdiepingen.map(v => {
                              const vResp = antwoordenVoor(v.id);
                              const meta  = verdiepingTypes[v.type] || { label: v.naam, kleur: "#0F766E" };
                              const isVBezig = genererend === v.id;
                              return (
                                <div key={v.id} style={{background:`${meta.kleur}0c`,border:`1px solid ${meta.kleur}28`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                                  <div style={{flex:1,minWidth:0}}>
                                    <span style={{fontSize:12,fontWeight:700,color:meta.kleur}}>{meta.label}</span>
                                    <span style={{fontSize:11,color:ADM.muted,marginLeft:8}}>
                                      {vResp.length} respondent{vResp.length !== 1 ? "en" : ""}
                                      {vResp.length === 0 && <span style={{color:ADM.orange}}> · wacht op invulling</span>}
                                    </span>
                                  </div>
                                  {vResp.length >= 1 && (
                                    <button onClick={()=>genereerRapport(v)} disabled={isVBezig}
                                      style={{background:`${meta.kleur}18`,color:meta.kleur,border:`1px solid ${meta.kleur}33`,
                                        borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                                      {isVBezig ? "⏳" : "📄 Verdiepingsrapport"}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Hoofdknoppen */}
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {heeftData ? (
                          <>
                            <button onClick={()=>genereerTotaalrapport(mw, mg, verdiepingen)} disabled={isBezig}
                              style={{background:isBezig?"rgba(0,168,150,0.3)":ADM.teal,color:ADM.navyDeep,
                                border:"none",borderRadius:6,padding:"9px 18px",fontSize:12,
                                cursor:isBezig?"wait":"pointer",fontWeight:700}}>
                              {isBezig ? "⏳ Genereren..." : `📊 Totaalrapportage${verdiepingen.length>0?" + verdieping":""}`}
                            </button>
                            <button onClick={()=>genereerAdviesrapport(mw, mg, verdiepingen)} disabled={genererend===`advies_${mw.id}`}
                              style={{background:genererend===`advies_${mw.id}`?"rgba(107,78,158,0.3)":"rgba(107,78,158,0.15)",
                                color:"#6B4E9E",border:"1px solid rgba(107,78,158,0.35)",borderRadius:6,padding:"9px 18px",
                                fontSize:12,cursor:genererend===`advies_${mw.id}`?"wait":"pointer",fontWeight:700}}>
                              {genererend===`advies_${mw.id}` ? "⏳ Genereren..." : `📋 Adviesrapport${verdiepingen.length>0?" + verdieping":""}`}
                            </button>
                          </>
                        ) : (
                          <span style={{fontSize:12,color:ADM.muted,fontStyle:"italic",alignSelf:"center"}}>
                            {!heeftMwData && !heeftMgData ? "Nog geen data" : !heeftMwData ? "Wacht op medewerkers" : "Wacht op manager"}
                          </span>
                        )}
                        {heeftMwData && (
                          <button onClick={()=>genereerRapport(mw)} disabled={genererend===mw.id}
                            style={{background:"rgba(90,140,60,0.12)",color:"#5A8C3C",
                              border:"1px solid rgba(90,140,60,0.3)",borderRadius:6,padding:"9px 14px",
                              fontSize:12,cursor:"pointer",fontWeight:600}}>
                            📄 Medewerkers
                          </button>
                        )}
                        {heeftMgData && (
                          <button onClick={()=>genereerRapport(mg)} disabled={genererend===mg.id}
                            style={{background:"rgba(107,78,158,0.12)",color:"#6B4E9E",
                              border:"1px solid rgba(107,78,158,0.3)",borderRadius:6,padding:"9px 14px",
                              fontSize:12,cursor:"pointer",fontWeight:600}}>
                            📄 Manager
                          </button>
                        )}
                        <button onClick={()=>verplaatsNaarPrullenbak(mw)}
                          style={{background:"rgba(231,76,60,0.10)",color:ADM.red,
                            border:`1px solid rgba(231,76,60,0.24)`,borderRadius:6,
                            padding:"9px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Enkelvoudige (oude) vragenlijst
            const { lijst } = groep;
            const resp    = antwoordenVoor(lijst.id);
            const isBezig = genererend === lijst.id;
            const heeftData = resp.length >= 1;
            return (
              <div key={gi} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 24px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,color:ADM.white,fontSize:15,marginBottom:4}}>{lijst.naam}</div>
                    <div style={{fontSize:12,color:ADM.muted,marginBottom:12}}>
                      🏢 {lijst.klant} · 📅 {lijst.aangemaakt} · {resp.length} respondenten
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      {heeftData ? (
                        <button onClick={()=>genereerRapport(lijst)} disabled={isBezig}
                          style={{background:isBezig?"rgba(0,168,150,0.3)":ADM.teal,color:ADM.navyDeep,
                            border:"none",borderRadius:6,padding:"8px 16px",fontSize:12,
                            cursor:isBezig?"wait":"pointer",fontWeight:700}}>
                          {isBezig ? "⏳ Genereren..." : "📄 Genereer rapport"}
                        </button>
                      ) : (
                        <span style={{fontSize:12,color:ADM.muted,fontStyle:"italic"}}>
                          Nog geen respondenten
                        </span>
                      )}
                      <button onClick={()=>verplaatsNaarPrullenbak(lijst)} disabled={verwijderenId===lijst.id}
                        style={{background:"rgba(231,76,60,0.10)",color:ADM.red,
                          border:`1px solid rgba(231,76,60,0.24)`,borderRadius:6,
                          padding:"8px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                        {verwijderenId===lijst.id ? "Verplaatsen..." : "🗑️ Verwijderen"}
                      </button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,
                      background:"rgba(0,168,150,0.12)",color:ADM.teal}}>{lijst.status}</span>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        {lijsten.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center"}}>
            Nog geen scans beschikbaar om een rapport van te genereren.
          </div>
        )}
      </div>
    </div>
  );
}


function PagePrullenbak() {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verwijderenId, setVerwijderenId] = useState(null);
  const [herstellenId, setHerstellenId] = useState(null);

  const laadPrullenbak = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "prullenbak"));
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => {
          const ad = a.verwijderd_op?.seconds || a.verwijderd_op_ms || 0;
          const bd = b.verwijderd_op?.seconds || b.verwijderd_op_ms || 0;
          return bd - ad;
        });
      setTrashItems(rows);
    } catch (err) {
      console.error("Laden prullenbak mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadPrullenbak(); }, []);


  const herstellen = async (item) => {
    setHerstellenId(item.id);
    try {
      if (item.bron_collectie && item.original_id) {
        await updateDoc(doc(db, item.bron_collectie, item.original_id), {
          status: item.status || "Actief",
          verwijderd: false,
        });
      }
      await deleteDoc(doc(db, "prullenbak", item.id));
      setTrashItems(prev => prev.filter(x => x.id !== item.id));
    } catch (err) {
      console.error("Herstellen mislukt:", err);
    } finally {
      setHerstellenId(null);
    }
  };

  const definitiefVerwijderen = async (item) => {
    setVerwijderenId(item.id);
    try {
      if (item.bron_collectie && item.original_id) {
        try {
          await deleteDoc(doc(db, item.bron_collectie, item.original_id));
        } catch (err) {
          console.warn("Origineel item was al verwijderd of niet bereikbaar:", err);
        }
      }
      await deleteDoc(doc(db, "prullenbak", item.id));
      setTrashItems(prev => prev.filter(x => x.id !== item.id));
    } catch (err) {
      console.error("Definitief verwijderen mislukt:", err);
    } finally {
      setVerwijderenId(null);
    }
  };

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;

  return (
    <div>
      <div style={{fontSize:13,color:ADM.muted,marginBottom:20}}>
        {trashItems.length} item(s) in de prullenbak
      </div>

      {trashItems.length === 0 ? (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"24px",color:ADM.muted,textAlign:"center"}}>
          De prullenbak is leeg.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {trashItems.map((item) => (
            <div key={item.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <div style={{fontWeight:700,color:ADM.white,fontSize:15}}>{item.naam || "Onbekend item"}</div>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:"rgba(231,76,60,0.14)",color:ADM.red}}>
                      PRULLENBAK
                    </span>
                  </div>
                  <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
                    Type: {item.type || "Onbekend"} · Klant: {item.klant || "—"}{item.doelgroep ? ` · Doelgroep: ${item.doelgroep === "Teamlid" ? "medewerkers" : "management / leidinggevenden"}` : ""} · Bron: {item.bron_collectie || "—"}
                  </div>
                </div>

                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button
                    onClick={() => herstellen(item)}
                    disabled={herstellenId === item.id}
                    style={{background:"rgba(15,118,110,0.12)",color:ADM.teal,border:`1px solid rgba(15,118,110,0.28)`,
                      borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:herstellenId===item.id?"wait":"pointer"}}
                  >
                    {herstellenId === item.id ? "Herstellen..." : "↩️ Herstellen"}
                  </button>

                  <button
                    onClick={() => definitiefVerwijderen(item)}
                    disabled={verwijderenId === item.id}
                    style={{background:"rgba(231,76,60,0.12)",color:ADM.red,border:`1px solid rgba(231,76,60,0.28)`,
                      borderRadius:8,padding:"10px 14px",fontWeight:700,fontSize:13,cursor:verwijderenId===item.id?"wait":"pointer"}}
                  >
                    {verwijderenId === item.id ? "Verwijderen..." : "Definitief verwijderen"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD HOME
// ─────────────────────────────────────────────
function DashboardHome() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    actieveKlanten: 0,
    teamsActief: 0,
    respondenten: 0,
    gemiddeldeTeamscore: null,
  });
  const [activiteiten, setActiviteiten] = useState([]);
  const [metingenTotaal, setMetingenTotaal] = useState(0);

  const laadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [klantenSnap, vragenlijstenSnap, antwoordenSnap, trashSnap, contactSnap, metingenSnap] = await Promise.all([
        getDocs(collection(db, "klanten")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "vragenlijsten")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "antwoorden")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "prullenbak")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "contactaanvragen")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "metingen")).catch(() => ({ docs: [] })),
      ]);

      const klanten = klantenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const vragenlijsten = vragenlijstenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => !v.verwijderd && v.status !== "Verwijderd");
      const antwoorden = antwoordenSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const trash = trashSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const contacten = contactSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const metingen = metingenSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => !m.verwijderd && m.status !== "Verwijderd");

      const uniekeKlanten = new Set(
        [
          ...klanten.map(k => k.naam || k.klantnaam || "").filter(Boolean),
          ...vragenlijsten.map(v => v.klant || "").filter(Boolean),
        ]
      );

      const actieveVragenlijsten = vragenlijsten.filter(v => (v.status || "").toLowerCase() !== "afgerond");
      const teamsActief = actieveVragenlijsten.length;
      const respondenten = antwoorden.length;

      const gemiddelden = antwoorden
        .map(a => {
          const vals = Object.values(a.antwoorden || {})
            .map(v => parseFloat(v))
            .filter(v => !Number.isNaN(v));
          return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
        })
        .filter(v => v !== null);

      const gemiddeldeTeamscore = gemiddelden.length
        ? gemiddelden.reduce((s, v) => s + v, 0) / gemiddelden.length
        : null;

      const activiteitenRuw = [
        ...actieveVragenlijsten.slice(0, 6).map(v => ({
          type: "scan",
          titel: v.naam || "Nieuwe scan",
          subtitel: v.klant || "Onbekende klant",
          datum: v.aangemaakt || "",
          icon: "📝",
        })),
        ...contacten.slice(0, 4).map(c => ({
          type: "contact",
          titel: c.organisatie || c.naam || "Nieuwe contactaanvraag",
          subtitel: "Contactaanvraag ontvangen",
          datum: c.datum || c.createdAt || "",
          icon: "📬",
        })),
        ...metingen.slice(0, 4).map(m => ({
          type: "meting",
          titel: `${m.klant || "Onbekende klant"} — ${m.type || "Meting"}`,
          subtitel: m.trajectNaam ? `Nieuwe meting opgeslagen · ${m.trajectNaam}` : "Nieuwe meting opgeslagen",
          datum: m.datum || "",
          icon: "📋",
        })),
        ...trash.slice(0, 4).map(t => ({
          type: "trash",
          titel: t.naam || "Verwijderd item",
          subtitel: "Verplaatst naar prullenbak",
          datum: t.verwijderd_op?.seconds
            ? new Date(t.verwijderd_op.seconds * 1000).toLocaleDateString("nl-NL")
            : "",
          icon: "🗑️",
        })),
      ].slice(0, 8);

      setStats({
        actieveKlanten: uniekeKlanten.size,
        teamsActief,
        respondenten,
        gemiddeldeTeamscore,
      });
      setMetingenTotaal(metingen.length);
      setActiviteiten(activiteitenRuw);
    } catch (err) {
      console.error("Dashboard laden mislukt:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { laadDashboard(); }, []);

  const statCards = [
    {
      label: "Actieve klanten",
      value: stats.actieveKlanten,
      sub: "Unieke organisaties in trajecten",
      color: "#5A8C3C",
      bg: "rgba(90,140,60,0.10)",
      border: "rgba(90,140,60,0.22)",
    },
    {
      label: "Teams actief",
      value: stats.teamsActief,
      sub: "Open scans en trajecten",
      color: "#3A7DBF",
      bg: "rgba(58,125,191,0.10)",
      border: "rgba(58,125,191,0.22)",
    },
    {
      label: "Respondenten",
      value: stats.respondenten,
      sub: "Totaal aantal inzendingen",
      color: "#E8821A",
      bg: "rgba(232,130,26,0.10)",
      border: "rgba(232,130,26,0.22)",
    },
    {
      label: "Gem. teamscore",
      value: stats.gemiddeldeTeamscore !== null ? stats.gemiddeldeTeamscore.toFixed(1) : "—",
      sub: "Gemiddeld over alle antwoorden",
      color: "#6B4E9E",
      bg: "rgba(107,78,158,0.10)",
      border: "rgba(107,78,158,0.22)",
    },
  ];

  if (loading) {
    return <div style={{padding:"12px 2px",color:ADM.muted}}>Dashboard laden...</div>;
  }

  return (
    <div style={{display:"grid",gap:24}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:28,fontWeight:700,color:ADM.white,marginBottom:8}}>Dashboard</div>
          <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7,maxWidth:820}}>
            Live overzicht van klanten, trajecten, respondenten en recente activiteit vanuit de beheeromgeving.
          </div>
        </div>
        <button
          onClick={()=>laadDashboard(true)}
          disabled={refreshing}
          style={{
            display:"flex",alignItems:"center",gap:8,
            background:refreshing?"rgba(15,118,110,0.15)":ADM.tealGlow,
            color:refreshing?ADM.muted:ADM.teal,
            border:`1px solid ${refreshing?"rgba(255,255,255,0.07)":"rgba(15,118,110,0.3)"}`,
            borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,
            cursor:refreshing?"not-allowed":"pointer",
            transition:"all 0.2s",flexShrink:0,
          }}
        >
          <span style={{
            display:"inline-block",
            animation:refreshing?"spin 1s linear infinite":"none",
            fontSize:15,
          }}>↻</span>
          {refreshing ? "Vernieuwen..." : "Vernieuwen"}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "repeat(4,1fr)",gap:16}}>
        {statCards.map((card, i) => (
          <div key={i} style={{background:card.bg,border:`1px solid ${card.border}`,borderRadius:14,padding:"20px 18px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:card.color,marginBottom:10}}>
              {card.label}
            </div>
            <div style={{fontSize:34,fontWeight:700,color:card.color,lineHeight:1,marginBottom:8}}>
              {card.value}
            </div>
            <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "1.2fr 0.8fr",gap:18}}>
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>
            Recente activiteit
          </div>
          {activiteiten.length === 0 ? (
            <div style={{fontSize:13,color:ADM.muted}}>Nog geen recente activiteit gevonden.</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activiteiten.map((item, i) => (
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:18,lineHeight:1}}>{item.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:2}}>{item.titel}</div>
                    <div style={{fontSize:12,color:ADM.muted,lineHeight:1.5}}>
                      {item.subtitel}{item.datum ? ` · ${item.datum}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 20px"}}>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>
            Verbonden modules
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              ["Scans", `${stats.teamsActief} actief`],
              ["Metingen", `${metingenTotaal} opgeslagen meetmoment(en)`],
              ["Rapportages", "Gebaseerd op vragenlijsten en antwoorden"],
              ["Prullenbak", "Zacht verwijderde items"],
              ["Contactaanvragen", "Nieuwe leads en intake"],
              ["Teamscan aanvragen", "Selfservice aanvragen vanuit de website"],
            ].map(([titel, sub], i) => (
              <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:14,fontWeight:700,color:ADM.white,marginBottom:3}}>{titel}</div>
                <div style={{fontSize:12,color:ADM.muted,lineHeight:1.5}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD SHELL
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// INSTELLINGEN — Data-export en beheer
// ─────────────────────────────────────────────
function PageInstellingen() {
  const [exportBezig, setExportBezig] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // null | "ok" | "fout"
  const [exportInfo, setExportInfo] = useState(null);
  const isMobile = useIsMobile();

  const exporteerAlleData = async () => {
    setExportBezig(true);
    setExportStatus(null);
    setExportInfo(null);
    try {
      const [
        klantenSnap, vlSnap, antSnap, metSnap,
        contactSnap, prullenbakSnap,
      ] = await Promise.all([
        getDocs(collection(db, "klanten")),
        getDocs(collection(db, "vragenlijsten")),
        getDocs(collection(db, "antwoorden")),
        getDocs(collection(db, "metingen")),
        getDocs(collection(db, "contactaanvragen")),
        getDocs(collection(db, "prullenbak")),
      ]);

      const ts = (val) => {
        if (!val) return null;
        if (val?.seconds) return new Date(val.seconds * 1000).toISOString();
        return val;
      };

      const klanten      = klantenSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
      const vragenlijsten= vlSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
      const antwoorden   = antSnap.docs.map(d => {
        const data = d.data();
        return {
          _id: d.id,
          vragenlijstId: data.vragenlijstId || "",
          klant: data.klant || "",
          rol: data.rol || "",
          ingediend_op: ts(data.ingediend_op),
          antwoorden: data.antwoorden || {},
          verwijderd: data.verwijderd || false,
        };
      });
      const metingen     = metSnap.docs.map(d => {
        const data = d.data();
        return { _id: d.id, ...data, aangemaakt_op: ts(data.aangemaakt_op) };
      });
      const contacten    = contactSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
      const prullenbak   = prullenbakSnap.docs.map(d => {
        const data = d.data();
        return { _id: d.id, ...data, verwijderd_op: ts(data.verwijderd_op) };
      });

      const exportData = {
        _meta: {
          geexporteerd_op: new Date().toISOString(),
          versie: "1.0",
          omschrijving: "Het Teamkompas — volledige data-export",
          collecties: {
            klanten: klanten.length,
            vragenlijsten: vragenlijsten.length,
            antwoorden: antwoorden.length,
            metingen: metingen.length,
            contactaanvragen: contacten.length,
            prullenbak: prullenbak.length,
          },
        },
        klanten,
        vragenlijsten,
        antwoorden,
        metingen,
        contactaanvragen: contacten,
        prullenbak,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const datum = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `teamkompas-export-${datum}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExportInfo(exportData._meta.collecties);
      setExportStatus("ok");
    } catch (err) {
      console.error("Export mislukt:", err);
      setExportStatus("fout");
    } finally {
      setExportBezig(false);
    }
  };

  const exporteerAntwoordenCsv = async () => {
    setExportBezig(true);
    setExportStatus(null);
    try {
      const [vlSnap, antSnap] = await Promise.all([
        getDocs(collection(db, "vragenlijsten")),
        getDocs(collection(db, "antwoorden")),
      ]);

      const vl = {};
      vlSnap.docs.forEach(d => { vl[d.id] = d.data(); });

      const antwoorden = antSnap.docs
        .map(d => ({ _id: d.id, ...d.data() }))
        .filter(a => !a.verwijderd);

      if (antwoorden.length === 0) {
        setExportStatus("fout");
        setExportBezig(false);
        return;
      }

      // Verzamel alle unieke vraag-ids
      const alleVraagIds = new Set();
      antwoorden.forEach(a => Object.keys(a.antwoorden || {}).forEach(id => alleVraagIds.add(id)));
      const vraagIds = Array.from(alleVraagIds).sort((a,b) => Number(a)-Number(b));

      // Header
      const header = [
        "respondent_id", "klant", "vragenlijst_naam", "rol",
        "ingediend_op", ...vraagIds.map(id => `vraag_${id}`)
      ];

      const rijen = antwoorden.map(a => {
        const ts = a.ingediend_op?.seconds
          ? new Date(a.ingediend_op.seconds * 1000).toISOString()
          : (a.ingediend_op || "");
        const vlData = vl[a.vragenlijstId] || {};
        return [
          a._id,
          `"${(a.klant || "").replace(/"/g, '""')}"`,
          `"${(vlData.naam || "").replace(/"/g, '""')}"`,
          a.rol || "",
          ts,
          ...vraagIds.map(id => {
            const val = (a.antwoorden || {})[id];
            if (val === undefined || val === null) return "";
            if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
            return val;
          }),
        ].join(",");
      });

      const csv  = [header.join(","), ...rijen].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const datum = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `teamkompas-antwoorden-${datum}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("ok");
      setExportInfo({ antwoorden: antwoorden.length });
    } catch (err) {
      console.error("CSV export mislukt:", err);
      setExportStatus("fout");
    } finally {
      setExportBezig(false);
    }
  };

  return (
    <div style={{maxWidth:720}}>
      <div style={{fontSize:13,color:ADM.muted,marginBottom:28,lineHeight:1.7}}>
        Exporteer alle data uit Firestore als back-up. De exports bevatten alle klanten,
        trajecten, antwoorden, metingen en contactaanvragen — ook verwijderde items in de prullenbak.
      </div>

      {/* Status melding */}
      {exportStatus === "ok" && (
        <div style={{background:"rgba(46,204,113,0.10)",border:"1px solid rgba(46,204,113,0.3)",
          borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:ADM.green}}>
          ✓ Export geslaagd — het bestand is gedownload.
          {exportInfo && (
            <div style={{marginTop:8,fontSize:12,color:ADM.muted,lineHeight:1.7}}>
              {Object.entries(exportInfo).map(([k,v]) => (
                <span key={k} style={{marginRight:16}}><strong style={{color:ADM.white}}>{v}</strong> {k}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {exportStatus === "fout" && (
        <div style={{background:"rgba(231,76,60,0.10)",border:"1px solid rgba(231,76,60,0.3)",
          borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:ADM.red}}>
          ✗ Export mislukt. Controleer de verbinding en probeer opnieuw.
        </div>
      )}

      {/* Export kaarten */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginBottom:32}}>

        {/* Volledige JSON export */}
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:22,marginBottom:12}}>📦</div>
          <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:8}}>
            Volledige back-up
          </div>
          <div style={{fontSize:12,color:ADM.muted,lineHeight:1.7,marginBottom:20}}>
            Alle collecties in één JSON-bestand. Bevat klanten, vragenlijsten, alle antwoorden
            (inclusief open vragen), metingen, contactaanvragen en prullenbak.
            Geschikt als volledige veiligheidskopie.
          </div>
          <div style={{fontSize:11,color:ADM.muted,marginBottom:16,padding:"8px 12px",
            background:"rgba(255,255,255,0.04)",borderRadius:8}}>
            📄 Formaat: <strong style={{color:ADM.white}}>JSON</strong> · Leesbaar in elke teksteditor of importeerbaar in een nieuw systeem
          </div>
          <button
            onClick={exporteerAlleData}
            disabled={exportBezig}
            style={{width:"100%",background:exportBezig?"rgba(0,168,150,0.3)":ADM.teal,
              color:ADM.navyDeep,border:"none",borderRadius:8,padding:"11px",
              fontWeight:700,fontSize:13,cursor:exportBezig?"wait":"pointer"}}>
            {exportBezig ? "⏳ Exporteren..." : "⬇ Download JSON back-up"}
          </button>
        </div>

        {/* Antwoorden CSV export */}
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:22,marginBottom:12}}>📊</div>
          <div style={{fontSize:15,fontWeight:700,color:ADM.white,marginBottom:8}}>
            Antwoorden als spreadsheet
          </div>
          <div style={{fontSize:12,color:ADM.muted,lineHeight:1.7,marginBottom:20}}>
            Alle scanantwoorden per respondent in één CSV-bestand. Elke rij is één
            respondent, elke kolom één vraag. Direct te openen in Excel of Google Sheets
            voor eigen analyse.
          </div>
          <div style={{fontSize:11,color:ADM.muted,marginBottom:16,padding:"8px 12px",
            background:"rgba(255,255,255,0.04)",borderRadius:8}}>
            📄 Formaat: <strong style={{color:ADM.white}}>CSV</strong> · Direct te openen in Excel, Google Sheets of SPSS
          </div>
          <button
            onClick={exporteerAntwoordenCsv}
            disabled={exportBezig}
            style={{width:"100%",background:exportBezig?"rgba(107,78,158,0.3)":"rgba(107,78,158,0.15)",
              color:"#6B4E9E",border:"1px solid rgba(107,78,158,0.35)",borderRadius:8,padding:"11px",
              fontWeight:700,fontSize:13,cursor:exportBezig?"wait":"pointer"}}>
            {exportBezig ? "⏳ Exporteren..." : "⬇ Download CSV antwoorden"}
          </button>
        </div>
      </div>

      {/* Uitleg */}
      <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"24px"}}>
        <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",
          letterSpacing:"1px",marginBottom:14}}>Wat zit er in de export?</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
          {[
            ["📋 Klanten",         "Naam, sector, contactpersoon, e-mail en status van alle klantrecords."],
            ["📝 Vragenlijsten",    "Alle trajecten inclusief de volledige vragenset per traject."],
            ["💬 Antwoorden",      "Alle ingevulde scanantwoorden per respondent, inclusief open vragen en rol (medewerker/manager)."],
            ["📊 Metingen",        "Alle meetmomenten met scores per domein en respondentenaantal."],
            ["📬 Contactaanvragen","Alle binnengekomen contactformulieren van de website."],
            ["🧭 Teamscan aanvragen","Alle selfservice-aanvragen vanuit de digitale teamscan-funnel."],
            ["🗑️ Prullenbak",      "Eerder verwijderde items — volledigheidshalve meegenomen in de JSON back-up."],
          ].map(([titel, tekst]) => (
            <div key={titel} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:13,fontWeight:700,color:ADM.white,marginBottom:4}}>{titel}</div>
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6}}>{tekst}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,fontSize:12,color:ADM.muted,lineHeight:1.7,
          borderTop:`1px solid ${ADM.border}`,paddingTop:14}}>
          ⚠️ De export bevat persoonsgegevens. Sla het bestand op een beveiligde locatie op
          en deel het niet onbeveiligd. In lijn met de AVG-verklaring van Het Teamkompas.
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const isMobile = useIsMobile();

  const [nieuwAanvragenCount, setNieuwAanvragenCount] = useState(0);
  const [nieuwTeamscanCount, setNieuwTeamscanCount] = useState(0);

  useEffect(() => {
    const laadNieuwAantal = async () => {
      try {
        const [contactSnap, teamscanSnap] = await Promise.all([
          getDocs(collection(db, "contactaanvragen")).catch(() => ({ docs: [] })),
          getDocs(collection(db, "teamscanSelfserviceAanvragen")).catch(() => ({ docs: [] })),
        ]);

        const contactCount = contactSnap.docs.filter(d => (d.data().status || "Nieuw") === "Nieuw").length;
        const teamscanCount = teamscanSnap.docs.filter(d => (d.data().status || "nieuw").toLowerCase() === "nieuw").length;

        setNieuwAanvragenCount(contactCount);
        setNieuwTeamscanCount(teamscanCount);
      } catch (err) {
        console.error("Fout bij laden aantal aanvragen:", err);
      }
    };

    laadNieuwAantal();
  }, []);

  const navItems = [
    { label:"Dashboard",        icon:"📊", section:"Overzicht" },
    { label:"Contactaanvragen", icon:"📬", badge: nieuwAanvragenCount > 0 ? String(nieuwAanvragenCount) : null, section:null },
    { label:"Teamscan aanvragen", icon:"🧭", badge: nieuwTeamscanCount > 0 ? String(nieuwTeamscanCount) : null, section:null },
    { label:"Klanten",          icon:"🏢", section:null },
    { label:"Scans",            icon:"📝", section:"Trajecten" },
    { label:"Metingen",         icon:"📋", section:null },
    { label:"Rapportages",      icon:"📈", section:null },
    { label:"Prullenbak",       icon:"🗑️", section:null },
    { label:"Instellingen",     icon:"⚙",  section:"Systeem" },
  ];

  const renderPage = () => {
    if (activeNav === "Contactaanvragen") return <PageContactaanvragen />;
    if (activeNav === "Teamscan aanvragen") return <FunnelDashboard />;
    if (activeNav === "Klanten")          return <PageKlanten />;
    if (activeNav === "Scans")            return <PageScans
  ScanResultaten={ScanResultaten}
  exporteerScanAlsCsv={exporteerScanAlsCsv}
/>
    if (activeNav === "Metingen")         return <PageMetingen />;
    if (activeNav === "Rapportages")      return <PageRapportages />;
    if (activeNav === "Prullenbak")       return <PagePrullenbak />;
    if (activeNav === "Instellingen")     return <PageInstellingen />;
    return <DashboardHome />;
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    onLogout();
  };

  return (
    <div style={{fontFamily:"'Roboto', sans-serif",display:"flex",minHeight:"100vh",background:ADM.navyDeep,color:ADM.text}}>
      <aside style={{width:260,minHeight:"100vh",background:ADM.navy,
        borderRight:`1px solid ${ADM.border}`,display:isMobile?"none":"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,bottom:0,zIndex:100}}>
        <div style={{padding:"28px 24px 20px",borderBottom:`1px solid ${ADM.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:ADM.teal,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
              boxShadow:"0 0 20px rgba(0,168,150,0.4)",flexShrink:0}}>🧭</div>
            <div>
              <div style={{fontSize:14,color:ADM.white,fontWeight:600}}>Mijn Teamkompas</div>
              <div style={{fontSize:10,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1.5px"}}>Beheeromgeving</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"16px 0",overflowY:"auto"}}>
          {navItems.map(({label,icon,badge,section},i) => (
            <div key={i}>
              {section && <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.8px",color:ADM.muted,padding:"16px 24px 8px"}}>{section}</div>}
              <div onClick={()=>setActiveNav(label)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 24px",cursor:"pointer",
                  color:activeNav===label ? ADM.teal : ADM.muted,
                  background:activeNav===label ? ADM.tealGlow : "transparent",
                  borderLeft:`3px solid ${activeNav===label ? ADM.teal : "transparent"}`,
                  fontSize:14.5,transition:"all 0.2s"}}>
                <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{icon}</span>
                {label}
                {badge && <span style={{marginLeft:"auto",background:ADM.teal,color:ADM.navyDeep,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{badge}</span>}
              </div>
            </div>
          ))}
        </nav>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${ADM.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg, ${ADM.teal}, ${ADM.navyLight})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>BV</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:ADM.white}}>Beheerder</div>
            <div style={{fontSize:11,color:ADM.muted}}>Admin</div>
          </div>
          <div onClick={handleLogout} title="Uitloggen" style={{cursor:"pointer",color:ADM.muted,fontSize:16,padding:"4px"}}>↩</div>
        </div>
      </aside>

      <main style={{marginLeft:isMobile?0:260,flex:1,display:"flex",flexDirection:"column",paddingBottom:isMobile?64:0}}>
        <div style={{background:"rgba(13,27,42,0.9)",backdropFilter:"blur(12px)",
          borderBottom:`1px solid ${ADM.border}`,padding:isMobile?"0 16px":"0 32px",height:64,
          display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <div style={{fontSize:18,fontWeight:600,color:ADM.white}}>{activeNav}</div>
        </div>
        <div style={{padding:isMobile?16:32,flex:1}}>
          {renderPage()}
        </div>
      </main>

      {isMobile && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,
          background:ADM.navy,borderTop:`1px solid ${ADM.border}`,
          display:"flex",justifyContent:"space-around",padding:"8px 0"}}>
          {[["📊","Dashboard"],["📬","Contactaanvragen"],["🧭","Teamscan aanvragen"],["📝","Scans"],["📋","Metingen"],["📈","Rapportages"],["🗑️","Prullenbak"]].map(([icon,label])=>(
            <div key={label} onClick={()=>setActiveNav(label)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 8px",cursor:"pointer",
                color:activeNav===label?ADM.teal:ADM.muted,
                borderTop:`2px solid ${activeNav===label?ADM.teal:"transparent"}`,minWidth:52}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:activeNav===label?700:400,whiteSpace:"nowrap"}}>
                {label==="Contactaanvragen"?"Aanvragen":label==="Teamscan aanvragen"?"Teamscan":label==="Rapportages"?"Rapporten":label==="Prullenbak"?"Prullenbak":label}
              </span>
            </div>
          ))}
          <div onClick={handleLogout} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 8px",cursor:"pointer",color:ADM.muted,minWidth:40}}>
            <span style={{fontSize:18}}>↩</span>
            <span style={{fontSize:9}}>Uit</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT — ROUTING met Firebase Auth state
// ─────────────────────────────────────────────
function TeamontwikkelingSeoLandingspagina({ onLoginClick = () => {} }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const ctaStyle = {
    background: PUB.teal,
    color: PUB.wit,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 32px rgba(0,168,150,0.24)",
  };

  const ghostStyle = {
    border: "1px solid rgba(255,255,255,0.30)",
    color: PUB.wit,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
  };

  const signalen = [
    "Overleggen blijven netjes, maar echte zorgen worden niet uitgesproken.",
    "Teamleden werken hard, maar samenwerking kost meer energie dan nodig is.",
    "Eigenaarschap blijft hangen bij een kleine groep mensen.",
    "Veranderingen zijn logisch op papier, maar komen beperkt in beweging.",
    "Een teamdag wordt gepland, maar de onderliggende ontwikkelvraag is nog niet scherp.",
    "Leidinggevenden zoeken taal om gedrag, spanning en samenwerking bespreekbaar te maken.",
  ];

  const domeinen = [
    ["Veiligheid en leiderschap", "Durven mensen zich uit te spreken en geeft leiderschap genoeg richting, steun en begrenzing?"],
    ["Beleving van verandering", "Hoe komt verandering binnen en waar ontstaat verlies van grip, duidelijkheid of vertrouwen?"],
    ["Energie en motivatie", "Waar krijgt het team energie van en waar lopen motivatie, aandacht en initiatief weg?"],
    ["Verbeteren en leren", "Worden verbeterideeën zichtbaar, besproken en vertaald naar nieuw gedrag in het dagelijks werk?"],
  ];

  const aanpak = [
    ["1", "Zichtbaar maken", "Met een teamscan, intake of verkennend gesprek brengen we in kaart wat het team ervaart."],
    ["2", "Betekenis geven", "We vertalen scores, patronen en signalen naar een gedeeld beeld van wat er echt speelt."],
    ["3", "In beweging brengen", "Via teamcoaching, een teamdag of leiderschapsbegeleiding maken we de stap naar concreet gedrag."],
  ];

  const situaties = [
    "een teamdag voorbereiden met meer diepgang dan losse werkvormen",
    "samenwerking verbeteren in een bestaand of nieuw samengesteld team",
    "psychologische veiligheid bespreekbaar maken zonder schuld of oordeel",
    "eigenaarschap, motivatie en initiatief versterken",
    "een leidinggevende helpen om teamontwikkeling beter te begeleiden",
    "spanning tussen teams, functies of afdelingen constructief onderzoeken",
  ];

  return (
    <>
      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, overflowX: "hidden", paddingTop: 64, background: PUB.wit }}>
        <NavBar isMobile={isMobile} onLoginClick={onLoginClick} openModal={openModal} />

        <section style={{ background: PUB.donker, minHeight: isMobile ? "auto" : "78vh", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr .95fr", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <Strepen />
          <div style={{ padding: isMobile ? "54px 24px 34px" : "74px 58px 74px 72px", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 16 }}>Teamontwikkeling, teamcoaching en samenwerking</div>
            <h1 style={{ fontSize: isMobile ? 34 : 56, fontWeight: 850, lineHeight: 1.05, color: PUB.wit, marginBottom: 20, letterSpacing: "-0.035em" }}>
              Teamontwikkeling die begint bij wat er echt speelt.
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.74)", maxWidth: 660, marginBottom: 16 }}>
              Samenwerking verbeteren vraagt meer dan een losse teamdag. Mijn Teamkompas helpt teams zichtbaar maken waar veiligheid, energie, verandering en leren elkaar versterken of juist blokkeren.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 30 }}>
              <span style={ctaStyle} onClick={() => navigate("/teamscan")}>Start met de teamscan</span>
              <span style={ghostStyle} onClick={openModal}>Plan een kennismaking</span>
            </div>
            <div style={{ marginTop: 22, color: "rgba(255,255,255,0.50)", fontSize: 13 }}>
              Voor teams die willen werken aan vertrouwen, eigenaarschap, communicatie en duurzame verandering.
            </div>
          </div>
          <div style={{ minHeight: isMobile ? 310 : "78vh", position: "relative", zIndex: 1 }}>
            <img src="/teamkompas-samen-richting.jpg" alt="Teamontwikkeling met Mijn Teamkompas tijdens een begeleide teamsessie" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: .88 }} />
            <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to top, rgba(13,27,42,0.88), rgba(13,27,42,0.12))" : "linear-gradient(to right, rgba(13,27,42,0.92), rgba(13,27,42,0.08))" }} />
          </div>
        </section>

        <section style={{ background: PUB.licht, padding: isMobile ? "52px 20px" : "78px 60px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".9fr 1.1fr", gap: 38, alignItems: "start" }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Herkenbare signalen</div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>Wanneer teamontwikkeling nodig is.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, marginBottom: 22 }}>
                Teams lopen zelden vast op één incident. Vaak ontstaat er langzaam een patroon: gesprekken blijven aan de oppervlakte, initiatief neemt af of verandering voelt onduidelijk. Dan helpt het om eerst samen scherp te krijgen wat er onder de oppervlakte speelt.
              </p>
              <span style={{ ...ctaStyle, color: PUB.wit }} onClick={() => navigate("/teamscan")}>Onderzoek jullie teambeeld</span>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {signalen.map((tekst, i) => (
                <Fade key={tekst} delay={i * 0.04}>
                  <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 20, boxShadow: "0 14px 34px rgba(13,27,42,0.06)", minHeight: 126 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: PUB.tealGlow, color: PUB.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 850, marginBottom: 12 }}>{i + 1}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: PUB.donker }}>{tekst}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: PUB.wit, padding: isMobile ? "54px 20px" : "82px 60px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 40, alignItems: "center" }}>
            <Fade>
              <img src="/teamkompas-intakegesprek.jpg" alt="Verkennend gesprek over teamontwikkeling en samenwerking verbeteren" style={{ width: "100%", height: isMobile ? 280 : 440, objectFit: "cover", borderRadius: 20, boxShadow: "0 24px 60px rgba(13,27,42,0.14)" }} />
            </Fade>
            <Fade delay={0.08}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>De aanpak van Mijn Teamkompas</div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>Eerst begrijpen, dan begeleiden.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, marginBottom: 26 }}>
                Effectieve teamontwikkeling begint niet bij een standaardprogramma, maar bij een gedeeld beeld van de werkelijkheid. Daarom combineert Mijn Teamkompas teamscan, analyse, gedragsinzichten en begeleiding tot een aanpak die past bij het team.
              </p>
              <div style={{ display: "grid", gap: 14 }}>
                {aanpak.map(([nr, titel, tekst]) => (
                  <div key={titel} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 14, alignItems: "start" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 850 }}>{nr}</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 850, color: PUB.donker, marginBottom: 5 }}>{titel}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub }}>{tekst}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </section>

        <section style={{ background: PUB.donker, padding: isMobile ? "54px 20px" : "82px 60px", position: "relative", overflow: "hidden" }}>
          <Strepen />
          <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Vier ontwikkeldomeinen</div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.wit, marginBottom: 14, maxWidth: 820 }}>Teamontwikkeling wordt concreet als je weet waar je naar kijkt.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.68)", maxWidth: 820, marginBottom: 32 }}>
                Mijn Teamkompas kijkt naar vier domeinen die samen bepalen hoe een team functioneert, leert en verandert. Gedrag en communicatie vormen daarbij de verbindende laag.
              </p>
            </Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
              {domeinen.map(([titel, tekst], i) => (
                <Fade key={titel} delay={i * 0.05}>
                  <div style={{ height: "100%", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 850, color: PUB.teal, marginBottom: 10 }}>0{i + 1}</div>
                    <div style={{ fontSize: 18, fontWeight: 850, color: PUB.wit, marginBottom: 10 }}>{titel}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.66)" }}>{tekst}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: PUB.licht, padding: isMobile ? "54px 20px" : "82px 60px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 42, alignItems: "center" }}>
            <Fade>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Wanneer past dit?</div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>Voor teams die niet harder, maar gerichter willen samenwerken.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, marginBottom: 24 }}>
                Deze aanpak past bij teams die willen groeien, maar ook bij teams waar samenwerking schuurt. Het doel is niet om een team te beoordelen, maar om taal, richting en beweging te creëren.
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {situaties.map((tekst) => (
                  <div key={tekst} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 12, padding: "13px 15px" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: PUB.teal, marginTop: 7, flexShrink: 0 }} />
                    <div style={{ fontSize: 14, lineHeight: 1.65, color: PUB.donker }}>{tekst}</div>
                  </div>
                ))}
              </div>
            </Fade>
            <Fade delay={0.08}>
              <div style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 22, padding: isMobile ? 22 : 30, boxShadow: "0 24px 60px rgba(13,27,42,0.10)" }}>
                <img src="/teamkompas-workshop-hero.jpg" alt="Teamscan en teamcoaching als basis voor teamontwikkeling" style={{ width: "100%", height: isMobile ? 220 : 300, objectFit: "cover", borderRadius: 16, marginBottom: 22 }} />
                <h3 style={{ fontSize: isMobile ? 24 : 30, lineHeight: 1.18, color: PUB.donker, marginBottom: 12 }}>Van losse signalen naar een gedeelde ontwikkelagenda.</h3>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: PUB.sub, marginBottom: 22 }}>
                  De teamscan helpt om de juiste teamvraag scherp te maken. Daarna kan een teamdag, coachingsgesprek of begeleid traject veel gerichter worden ingericht.
                </p>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
                  <span style={{ ...ctaStyle, color: PUB.wit, flex: 1 }} onClick={() => navigate("/teamscan")}>Start teamscan</span>
                  <span style={{ ...ctaStyle, background: PUB.donker, color: PUB.wit, boxShadow: "none", flex: 1 }} onClick={openModal}>Plan kennismaking</span>
                </div>
              </div>
            </Fade>
          </div>
        </section>

        <section style={{ background: PUB.wit, padding: isMobile ? "50px 20px" : "72px 60px", borderTop: `1px solid ${PUB.lijn}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>Volgende stap</div>
            <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, color: PUB.donker, marginBottom: 16 }}>Wil je weten wat jouw team nodig heeft?</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub, maxWidth: 720, margin: "0 auto 28px" }}>
              Start laagdrempelig met de teamscan of plan een verkennend gesprek. Dan bepalen we samen welke stap past bij jullie teamvraag.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, justifyContent: "center" }}>
              <span style={{ ...ctaStyle, color: PUB.wit }} onClick={() => navigate("/teamscan")}>Start met de teamscan</span>
              <span style={{ ...ctaStyle, background: PUB.donker, color: PUB.wit, boxShadow: "none" }} onClick={openModal}>Plan een kennismaking</span>
            </div>
          </div>
        </section>
      </div>
      <ContactModal isOpen={modalOpen} onClose={closeModal} bron="Teamontwikkeling" />
    </>
  );
}

function TeamcoachingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const ctaStyle = {
    background: PUB.teal,
    color: PUB.wit,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 12px 28px rgba(15,118,110,0.24)",
    border: "none",
  };

  const ghostStyle = {
    background: PUB.wit,
    color: PUB.donker,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    border: `1px solid ${PUB.lijn}`,
  };

  const signalen = [
    "De samenwerking loopt niet slecht, maar kost meer energie dan nodig is.",
    "Het team spreekt elkaar nog onvoldoende aan op gedrag, afspraken of verwachtingen.",
    "Er zijn terugkerende patronen in communicatie, besluitvorming of eigenaarschap.",
    "De leidinggevende wil het team verder brengen, maar zoekt taal, structuur en begeleiding.",
  ];

  const aanpak = [
    ["1", "Teamvraag scherp maken", "We starten met de vraag achter de vraag: wat vraagt dit team nu echt van zichzelf en van de leidinggevende?"],
    ["2", "Inzicht ophalen", "We gebruiken intake, teamscan of bestaande inzichten om zichtbaar te maken waar samenwerking helpt of schuurt."],
    ["3", "Gedrag bespreekbaar maken", "We begeleiden gesprekken over communicatie, feedback, rolverdeling, vertrouwen en eigenaarschap."],
    ["4", "Oefenen in de praktijk", "Teamcoaching werkt pas als inzichten worden vertaald naar kleine gedragskeuzes in het dagelijks werk."],
    ["5", "Borgen en opvolgen", "We helpen het team ritme, afspraken en vervolgstappen vast te houden na de eerste interventie."],
  ];

  const themaCards = [
    ["Samenwerking verbeteren", "Teamleden leren scherper benoemen wat zij van elkaar nodig hebben om beter samen te werken."],
    ["Psychologische veiligheid", "We maken bespreekbaar wat mensen nodig hebben om zich uit te spreken, vragen te stellen en feedback te geven."],
    ["Eigenaarschap en motivatie", "We kijken waar verantwoordelijkheid blijft liggen en hoe het team meer beweging kan creëren."],
    ["Communicatie en feedback", "We oefenen met taal die duidelijk is zonder onnodig hard te worden en eerlijk zonder onveilig te worden."],
  ];

  const insights = [
    "Teamcoaching met Insights Discovery profielen.",
    "Communicatie en voorkeursgedrag zichtbaar maken.",
    "Samenwerking onder druk beter begrijpen.",
    "Verschillen in tempo, stijl en besluitvorming bespreekbaar maken.",
  ];

  return (
    <>
      <Helmet>
        <title>Teamcoaching | coaching van teams en samenwerking verbeteren | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Teamcoaching voor teams die samenwerking, communicatie, eigenaarschap en psychologische veiligheid willen verbeteren. Met teamscan en eventueel Insights Discovery."
        />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/teamcoaching" />
        <meta property="og:title" content="Teamcoaching voor betere samenwerking | Mijn Teamkompas" />
        <meta
          property="og:description"
          content="Mijn Teamkompas begeleidt teams met teamcoaching, teamscan en Insights Discovery om gedrag, samenwerking en eigenaarschap concreet te verbeteren."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mijnteamkompas.nl/teamcoaching" />
      </Helmet>

      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, background: PUB.wit }}>
        <NavBar isMobile={isMobile} onLoginClick={() => {}} openModal={openModal} />

        <section
          style={{
            background: PUB.donker,
            minHeight: isMobile ? "auto" : "74vh",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr .95fr",
            alignItems: "center",
            overflow: "hidden",
            paddingTop: 64,
          }}
        >
          <div style={{ padding: isMobile ? "54px 22px 34px" : "72px 58px 72px 72px", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 14 }}>
              Teamcoaching
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, lineHeight: 1.05, color: PUB.wit, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
              Teamcoaching voor teams die beter willen samenwerken.
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 700, marginBottom: 26 }}>
              Mijn Teamkompas begeleidt teams die willen groeien in samenwerking, communicatie, eigenaarschap en psychologische veiligheid. Niet met losse inspiratie, maar met gerichte teamcoaching die zichtbaar maakt wat er speelt en wat het team anders kan doen.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center" }}>
              <button type="button" onClick={openModal} style={ctaStyle}>
                Plan een kennismaking
              </button>
              <a href="/teamscan" style={{ ...ghostStyle, background: "rgba(255,255,255,0.08)", color: PUB.wit, border: "1px solid rgba(255,255,255,0.22)" }}>
                Start met de teamscan
              </a>
            </div>
          </div>

          <div style={{ minHeight: isMobile ? 320 : "74vh", position: "relative" }}>
            <img
              src="/teamkompas-intakegesprek.jpg"
              alt="Teamcoaching gesprek over samenwerking, communicatie en leiderschap"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.9 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,27,42,0.96), rgba(13,27,42,0.12))" }} />
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".9fr 1.1fr", gap: 42, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Wanneer teamcoaching helpt
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Teamcoaching helpt wanneer het team niet harder, maar anders moet leren samenwerken.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Veel teams hebben voldoende kennis en inzet. Toch blijft ontwikkeling soms hangen omdat gesprekken niet scherp genoeg worden gevoerd, afspraken niet worden nageleefd of verschillen in gedrag en communicatie onbesproken blijven.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {signalen.map((item, index) => (
                <div key={item} style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 20, boxShadow: "0 12px 30px rgba(13,27,42,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: PUB.teal, marginBottom: 6 }}>Signaal {index + 1}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: PUB.donker }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ maxWidth: 840, marginBottom: 34 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Onze aanpak voor teamcoaching
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Van inzicht naar gedrag in het dagelijks werk.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Teamcoaching is geen eenmalige reflectie, maar een begeleid proces waarin het team leert kijken naar patronen, keuzes en gedrag. De teamscan helpt om de juiste thema’s scherp te maken.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: 14 }}>
              {aanpak.map(([nr, titel, tekst]) => (
                <div key={nr} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 14 }}>
                    {nr}
                  </div>
                  <h3 style={{ fontSize: 18, margin: "0 0 8px", color: PUB.donker }}>{titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 42, alignItems: "center" }}>
            <img
              src="/teamkompas-workshop-hero.jpg"
              alt="Teamcoaching met Insights Discovery en teamscan voor betere samenwerking"
              style={{ width: "100%", borderRadius: 22, objectFit: "cover", minHeight: isMobile ? 280 : 460, boxShadow: "0 24px 70px rgba(13,27,42,0.16)" }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Teamcoaching met Insights Discovery
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Gedragsprofielen helpen om communicatie concreet te maken.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Wanneer passend gebruiken we Insights Discovery profielen binnen de teamcoaching. Daarmee ontstaat een herkenbare taal voor voorkeuren, communicatie, samenwerking onder druk en verschillen in tempo of besluitvorming.
              </p>
              <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
                {insights.map((item) => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: PUB.teal, marginTop: 7, flexShrink: 0 }} />
                    <div style={{ fontSize: 14, lineHeight: 1.65, color: PUB.donker }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ maxWidth: 840, marginBottom: 34 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Thema’s in teamcoaching
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                De inhoud volgt de ontwikkelvraag van het team.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
              {themaCards.map(([titel, tekst]) => (
                <div key={titel} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 22 }}>
                  <h3 style={{ fontSize: 18, margin: "0 0 8px", color: PUB.donker }}>{titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.donker, color: PUB.wit, textAlign: "center" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
              Klaar om samenwerking concreet te verbeteren?
            </div>
            <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px", color: PUB.wit }}>
              Begin met een scherp beeld van wat er in het team speelt.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.68)", marginBottom: 26 }}>
              Plan een verkennend gesprek of start laagdrempelig met de teamscan. Dan bepalen we samen of teamcoaching, een teamdag of een andere interventie passend is.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={openModal} style={ctaStyle}>
                Plan een kennismaking
              </button>
              <a href="/teamscan" style={{ ...ghostStyle, background: "rgba(255,255,255,0.08)", color: PUB.wit, border: "1px solid rgba(255,255,255,0.22)" }}>
                Start met de teamscan
              </a>
            </div>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={closeModal} bron="Teamcoaching" />
    </>
  );
}

function TeamdagPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const ctaStyle = {
    background: PUB.teal,
    color: PUB.wit,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 12px 28px rgba(15,118,110,0.24)",
    border: "none",
  };

  const ghostStyle = {
    background: PUB.wit,
    color: PUB.donker,
    padding: "14px 22px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    border: `1px solid ${PUB.lijn}`,
  };

  const signalen = [
    "Er is behoefte aan betere samenwerking, maar het echte gesprek komt niet goed op gang.",
    "Het team wil vooruit, maar mist richting, eigenaarschap of vertrouwen.",
    "Er zijn spanningen of patronen die in het dagelijks werk terug blijven komen.",
    "Een teamdag is gepland, maar de vraag is nog niet scherp genoeg.",
  ];

  const stappen = [
    ["1", "Vraag scherp maken", "We starten niet met werkvormen, maar met de vraag: waar moet deze teamdag echt aan bijdragen?"],
    ["2", "Teamscan of intake", "We halen gericht signalen op over veiligheid, samenwerking, energie, verandering en leren."],
    ["3", "Teamdag ontwerpen", "We vertalen de inzichten naar een programma dat past bij het team, de leidinggevende en de context."],
    ["4", "In beweging brengen", "Tijdens de teamdag werken we aan gesprek, inzicht, gedrag en concrete afspraken."],
    ["5", "Borgen", "Na de teamdag zorgen we dat inzichten terugkomen in werkafspraken, ritme en opvolging."],
  ];

  const programma = [
    ["Start en veiligheid", "Een duidelijke opening waarin doel, context en spelregels helder worden."],
    ["Inzicht in het team", "Bespreken wat uit de teamscan, intake of voorbereidende gesprekken naar voren komt."],
    ["Gedrag en samenwerking", "Werken met patronen in communicatie, feedback, rolverdeling en besluitvorming."],
    ["Insights Discovery", "Wanneer passend gebruiken we Insights Discovery profielen om gedragsvoorkeuren zichtbaar en bespreekbaar te maken."],
    ["Afspraken en vervolg", "Afronden met concrete keuzes, eerste acties en eigenaarschap voor de vervolgstappen."],
  ];

  return (
    <>
      <Helmet>
        <title>Teamdag organiseren | teamdag met impact en Insights Discovery | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Organiseer een teamdag die verder gaat dan een leuke sessie. Mijn Teamkompas helpt met teamscan, teamcoaching, Insights Discovery en concrete vervolgstappen."
        />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/teamdag" />
        <meta property="og:title" content="Teamdag organiseren met impact | Mijn Teamkompas" />
        <meta
          property="og:description"
          content="Een teamdag voor betere samenwerking, psychologische veiligheid, eigenaarschap en teamontwikkeling. Met teamscan en eventueel Insights Discovery."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mijnteamkompas.nl/teamdag" />
      </Helmet>

      <div style={{ fontFamily: "'Roboto', sans-serif", color: PUB.donker, background: PUB.wit }}>
        <NavBar isMobile={isMobile} onLoginClick={() => {}} openModal={openModal} />

        <section
          style={{
            background: PUB.donker,
            minHeight: isMobile ? "auto" : "74vh",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr .95fr",
            alignItems: "center",
            overflow: "hidden",
            paddingTop: 64,
          }}
        >
          <div style={{ padding: isMobile ? "54px 22px 34px" : "72px 58px 72px 72px", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 14 }}>
              Teamdag organiseren
            </div>
            <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, lineHeight: 1.05, color: PUB.wit, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
              Een teamdag die meer oplevert dan een leuke dag.
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 680, marginBottom: 26 }}>
              Mijn Teamkompas helpt teams een teamdag organiseren die begint bij wat er echt speelt. Met een teamscan, intake en eventueel Insights Discovery maken we zichtbaar waar samenwerking vastloopt en wat nodig is om in beweging te komen.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center" }}>
              <button type="button" onClick={openModal} style={ctaStyle}>
                Plan een kennismaking
              </button>
              <a href="/teamscan" style={{ ...ghostStyle, background: "rgba(255,255,255,0.08)", color: PUB.wit, border: "1px solid rgba(255,255,255,0.22)" }}>
                Start met de teamscan
              </a>
            </div>
          </div>

          <div style={{ minHeight: isMobile ? 320 : "74vh", position: "relative" }}>
            <img
              src="/teamkompas-samen-richting.jpg"
              alt="Teamdag waarin een team samen richting geeft aan samenwerking en ontwikkeling"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.9 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,27,42,0.96), rgba(13,27,42,0.12))" }} />
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : ".9fr 1.1fr", gap: 42, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Waarom veel teamdagen weinig veranderen
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Zonder scherpe vraag blijft een teamdag vaak bij goede energie.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Een teamdag kan energie geven, maar heeft pas blijvend effect als duidelijk is waar het team aan werkt. Gaat het om vertrouwen, communicatie, eigenaarschap, samenwerking onder druk of het verwerken van verandering? Daarom starten wij met scherp krijgen wat de echte ontwikkelvraag is.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {signalen.map((item, index) => (
                <div key={item} style={{ background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 20, boxShadow: "0 12px 30px rgba(13,27,42,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: PUB.teal, marginBottom: 6 }}>Signaal {index + 1}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: PUB.donker }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ maxWidth: 820, marginBottom: 34 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Onze aanpak voor een teamdag
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Van losse signalen naar een programma dat past bij het team.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                We ontwerpen een teamdag niet vanuit standaardwerkvormen, maar vanuit de ontwikkelvraag. De teamscan, intake of voorbereidende gesprekken bepalen wat nodig is.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: 14 }}>
              {stappen.map(([nr, titel, tekst]) => (
                <div key={nr} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: PUB.teal, color: PUB.wit, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, marginBottom: 14 }}>
                    {nr}
                  </div>
                  <h3 style={{ fontSize: 18, margin: "0 0 8px", color: PUB.donker }}>{titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.licht }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 42, alignItems: "center" }}>
            <img
              src="/teamkompas-workshop-hero.jpg"
              alt="Teamdag met teamcoaching en samenwerking rond de Mijn Teamkompas-aanpak"
              style={{ width: "100%", borderRadius: 22, objectFit: "cover", minHeight: isMobile ? 280 : 460, boxShadow: "0 24px 70px rgba(13,27,42,0.16)" }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Teamdag met Insights Discovery
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Gedragsvoorkeuren maken samenwerking concreet bespreekbaar.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Veel teams kennen Insights Discovery al. Tijdens een teamdag kan dit instrument helpen om communicatie, feedback, samenwerking en reacties onder druk concreet te maken. Mijn Teamkompas gebruikt Insights Discovery niet als losse profieltraining, maar als onderdeel van een bredere aanpak rond teamontwikkeling.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: PUB.sub }}>
                Zo ontstaat een teamdag waarin mensen niet alleen elkaar beter begrijpen, maar ook afspraken maken over hoe ze effectiever samenwerken in de praktijk.
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.wit }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ maxWidth: 820, marginBottom: 34 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Voorbeeldopbouw
              </div>
              <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px" }}>
                Een teamdag met structuur, veiligheid en duidelijke vervolgstappen.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: 14 }}>
              {programma.map(([titel, tekst]) => (
                <div key={titel} style={{ background: PUB.licht, border: `1px solid ${PUB.lijn}`, borderRadius: 18, padding: 22 }}>
                  <h3 style={{ fontSize: 18, margin: "0 0 8px", color: PUB.donker }}>{titel}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "52px 22px" : "86px 60px", background: PUB.donker, color: PUB.wit, textAlign: "center" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: PUB.teal, textTransform: "uppercase", marginBottom: 12 }}>
              Klaar voor een teamdag met meer effect?
            </div>
            <h2 style={{ fontSize: isMobile ? 30 : 42, lineHeight: 1.12, margin: "0 0 16px", color: PUB.wit }}>
              Begin met scherp krijgen wat jullie team echt nodig heeft.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.68)", marginBottom: 26 }}>
              Plan een verkennend gesprek of start laagdrempelig met de teamscan. Dan bepalen we samen welke teamdag of teamsessie passend is.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={openModal} style={ctaStyle}>
                Plan een kennismaking
              </button>
              <a href="/teamscan" style={{ ...ghostStyle, background: "rgba(255,255,255,0.08)", color: PUB.wit, border: "1px solid rgba(255,255,255,0.22)" }}>
                Start met de teamscan
              </a>
            </div>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={closeModal} bron="Teamdag" />
    </>
  );
}
export default function App() {
  const [view, setView] = useState("public");
  const [scanId, setScanId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const allowed = ADMIN_EMAILS.includes(user.email || "");

        if (!allowed) {
          await signOut(auth);
          setView("login");
          setAuthReady(true);
          return;
        }

        const isAdminPath = window.location.pathname.startsWith("/beheer") || window.location.pathname.startsWith("/admin");
        setView((v) => (v === "login" || isAdminPath ? "admin" : v));
      }

      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("scan");

    if (s) {
      setScanId(s);
      setView("scan");
    }
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400;1,700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      *, body {
        font-family: 'Roboto', sans-serif !important;
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
      button, input, textarea, select {
        font: inherit;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  const homeElement = (
    <HelmetProvider>
      {(() => {
        if (!authReady) {
          return (
            <div
              style={{
                minHeight: "100vh",
                background: "#0D1B2A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", color: "#8fa3bb" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
                <div style={{ fontSize: 15 }}>Laden...</div>
              </div>
            </div>
          );
        }

        if (view === "scan") {
          return <ScanInvullen scanId={scanId} />;
        }

        if (view === "login") {
          return <LoginScreen onLogin={() => setView("admin")} onBack={() => setView("public")} />;
        }

        if (view === "admin") {
          return <AdminDashboard onLogout={() => setView("public")} />;
        }

        return <PublicSite onLoginClick={() => setView("login")} />;
      })()}
    </HelmetProvider>
  );


  const beheerElement = (
    <HelmetProvider>
      {(() => {
        if (!authReady) {
          return (
            <div style={{ minHeight: "100vh", background: "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#8fa3bb" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
                <div style={{ fontSize: 15 }}>Laden...</div>
              </div>
            </div>
          );
        }

        if (view === "admin") {
          return <AdminDashboard onLogout={() => setView("public")} />;
        }

        return <LoginScreen onLogin={() => setView("admin")} onBack={() => setView("public")} />;
      })()}
    </HelmetProvider>
  );

  return (
    <HelmetProvider>
      <Routes>
        <Route path="/" element={homeElement} />
        <Route path="/onze-aanpak" element={<><SeoHead page="onzeAanpak" /><OnzeAanpak /></>} />
        <Route path="/verkennen" element={<><SeoHead page="verkennen" /><Verkennen /></>} />
        <Route path="/teamscan" element={<><SeoHead page="teamscan" /><TeamscanDigitaal /></>} />
        <Route path="/teamontwikkeling" element={<><SeoHead page="teamontwikkeling" /><TeamontwikkelingSeoLandingspagina onLoginClick={() => setView("login")} /></>} />
        <Route path="/admin/funnel" element={<><SeoHead page="beheer" />{beheerElement}</>} />
        <Route path="/teamcoaching" element={<><SeoHead page="teamcoaching" /><TeamcoachingPage /></>} />
        <Route path="/teamdag" element={<><SeoHead page="teamdag" /><TeamdagPage /></>} />
        <Route path="/beheer" element={<><SeoHead page="beheer" />{beheerElement}</>} />
      </Routes>
    </HelmetProvider>
  );
}