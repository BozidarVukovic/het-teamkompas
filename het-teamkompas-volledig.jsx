// ─────────────────────────────────────────────
// HET TEAMKOMPAS — Productie-klare versie
// Vul de credentials in bij "STAP 1 / 2 / 3"
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────
// STAP 1 — FIREBASE CREDENTIALS
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDgl6gj1LmOZ-1Mcin1jNfkkZg82c2Jtz0",
  authDomain: "mijn-teamkompas-6de84.firebaseapp.com",
  projectId: "mijn-teamkompas-6de84",
  storageBucket: "mijn-teamkompas-6de84.firebasestorage.app",
  messagingSenderId: "820620515571",
  appId: "1:820620515571:web:86a4e792eebe4c7cf03f86",
};

// ─────────────────────────────────────────────
// STAP 2 — EMAILJS CREDENTIALS
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_eytet3a";
const EMAILJS_TEMPLATE_ID = "pysvu9a";
const EMAILJS_PUBLIC_KEY = "aXtk48FJxZBI-fBNQ";

// ─────────────────────────────────────────────
// STAP 3 — ADMIN EMAILADRESSEN
// ─────────────────────────────────────────────
const ADMIN_EMAILS = [
  "bozidar@mijnteamkompas.nl",
  "edmond@mijnteamkompas.nl",
];

// Firebase initialiseren
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const PUB = {
  donker: "#0D1B2A",
  navy: "#1A2E4A",
  teal: "#00A896",
  tealDark: "#007d70",
  tealGlow: "rgba(0,168,150,0.15)",
  groen: "#5A8C3C",
  blauw: "#3A7DBF",
  paars: "#6B4E9E",
  oranje: "#E8821A",
  licht: "#F4F7F9",
  wit: "#FFFFFF",
  sub: "#6B7A8D",
  lijn: "#dde4ed",
};

const ADM = {
  navyDeep: "#0D1B2A",
  navy: "#1A2E4A",
  navyMid: "#223a5a",
  navyLight: "#2d4d73",
  teal: "#00A896",
  tealDark: "#007d70",
  tealGlow: "rgba(0,168,150,0.15)",
  tealGlow2: "rgba(0,168,150,0.08)",
  white: "#ffffff",
  text: "#e2eaf2",
  muted: "#8fa3bb",
  border: "rgba(255,255,255,0.07)",
  green: "#2ecc71",
  orange: "#f39c12",
  red: "#e74c3c",
};

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────
function useInView() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return [ref, vis];
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return mobile;
}

function Fade({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED SCAN DATA
// ─────────────────────────────────────────────
const PIJLERS = [
  { naam: "Veiligheid & Leiderschap", kleur: "#5A8C3C" },
  { naam: "Beleving van Verandering", kleur: "#3A7DBF" },
  { naam: "Energie & Motivatie", kleur: "#E8821A" },
  { naam: "Verbeteren & Leren", kleur: "#6B4E9E" },
];

const DEFAULT_STELLINGEN = [
  { id: 1, pijler: 0, tekst: "Ik voel me veilig om mijn mening te geven binnen het team.", type: "schaal" },
  { id: 2, pijler: 0, tekst: "De leidinggevende geeft ruimte voor eigen inbreng.", type: "schaal" },
  { id: 3, pijler: 0, tekst: "Fouten maken wordt gezien als leerkans.", type: "schaal" },
  { id: 4, pijler: 0, tekst: "Ik vertrouw erop dat collega's mij steunen als het nodig is.", type: "schaal" },
  { id: 5, pijler: 0, tekst: "Wat maakt dat je je wel of niet veilig voelt in dit team?", type: "open" },
  { id: 6, pijler: 1, tekst: "Ik begrijp waarom de huidige verandering nodig is.", type: "schaal" },
  { id: 7, pijler: 1, tekst: "Ik heb voldoende informatie om mee te kunnen bewegen.", type: "schaal" },
  { id: 8, pijler: 1, tekst: "Ik ervaar de verandering als haalbaar.", type: "schaal" },
  { id: 9, pijler: 1, tekst: "Ik word betrokken bij beslissingen die mij raken.", type: "schaal" },
  { id: 10, pijler: 1, tekst: "Wat helpt jou om de verandering te omarmen?", type: "open" },
  { id: 11, pijler: 2, tekst: "Ik heb genoeg energie om mijn werk goed te doen.", type: "schaal" },
  { id: 12, pijler: 2, tekst: "Mijn werk geeft mij voldoening.", type: "schaal" },
  { id: 13, pijler: 2, tekst: "De werkdruk is voor mij beheersbaar.", type: "schaal" },
  { id: 14, pijler: 2, tekst: "Ik heb voldoende herstelmomenten tijdens mijn werkdag.", type: "schaal" },
  { id: 15, pijler: 2, tekst: "Wat geeft jou de meeste energie in je werk?", type: "open" },
  { id: 16, pijler: 3, tekst: "We evalueren regelmatig hoe we samenwerken.", type: "schaal" },
  { id: 17, pijler: 3, tekst: "Er is ruimte om nieuwe werkwijzen uit te proberen.", type: "schaal" },
  { id: 18, pijler: 3, tekst: "Ik leer van mijn collega's.", type: "schaal" },
  { id: 19, pijler: 3, tekst: "Verbeterideeën worden serieus genomen.", type: "schaal" },
  { id: 20, pijler: 3, tekst: "Wat zou het team concreet kunnen verbeteren?", type: "open" },
];

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

function KompasDot({ size = 26 }) {
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`conic-gradient(${PUB.groen} 0 25%,${PUB.blauw} 25% 50%,${PUB.oranje} 50% 75%,${PUB.paars} 75%)` }} />
  );
}

function KompasAnim() {
  const isMobile = useIsMobile();
  const [r, setR] = useState(0);
  const size = isMobile ? 360 : 480;
  useEffect(() => {
    let f;
    const t = () => { setR(v => v + 0.014); f = requestAnimationFrame(t); };
    f = requestAnimationFrame(t);
    return () => cancelAnimationFrame(f);
  }, []);
  const kw = [
    [PUB.groen,"🛡","Veiligheid &\nLeiderschap"],
    [PUB.blauw,"🧠","Beleving van\nVerandering"],
    [PUB.oranje,"⚡","Energie &\nMotivatie"],
    [PUB.paars,"⚙","Verbeteren\n& Leren"],
  ];
  return (
    <div style={{ width:size,height:size,position:"relative",flexShrink:0 }}>
      {[0,14,28].map((ins,i) => (
        <div key={i} style={{ position:"absolute",inset:ins,borderRadius:"50%",
          border:`1px solid rgba(255,255,255,${0.07-i*0.02})`,
          transform:`rotate(${r*(i%2?-1:1)}deg)` }} />
      ))}
      <div style={{ position:"absolute",inset:46,borderRadius:"50%",overflow:"hidden",
        display:"grid",gridTemplateColumns:"1fr 1fr",boxShadow:"0 0 48px rgba(0,0,0,0.55)" }}>
        {kw.map(([c,ic,l],i) => (
          <div key={i} style={{ background:c,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:4,padding:8 }}>
            <span style={{fontSize:18}}>{ic}</span>
            <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.92)",
              textAlign:"center",lineHeight:1.3,whiteSpace:"pre-line"}}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",width:110,height:110,borderRadius:"50%",
        background:PUB.donker,border:"2px solid rgba(0,168,150,0.4)",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        zIndex:10,boxShadow:"0 0 28px rgba(0,0,0,0.65)" }}>
        <span style={{fontSize:19,fontWeight:700,color:PUB.teal}}>Gedrag</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.42)",textAlign:"center",
          padding:"0 8px",lineHeight:1.3}}>Inzicht in voorkeursgedrag & samenwerking</span>
      </div>
    </div>
  );
}

function NavBar({ isMobile, onLoginClick, openModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    ["Aanpak","aanpak"],
    ["Voor wie","voor-wie"],
    ["Over ons","over-ons"],
    ["Werkwijze","werkwijze"]
  ];

  useEffect(() => {
    const ids = ["aanpak", "voor-wie", "over-ons", "werkwijze"];
    const observers = [];

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
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(13,27,42,0.97)",
        borderBottom:"1px solid rgba(0,168,150,0.2)",height:64,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:isMobile?"0 20px":"0 40px",backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <KompasDot size={22}/>
          <span style={{fontSize:15,fontWeight:600,color:"#ffffff"}}>Mijn Teamkompas</span>
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
              onClick={()=>scrollTo("home")}
              aria-current={activeSection==="home" ? "page" : undefined}
              style={navLinkStyle("home")}
            >
              Home
              {activeSection==="home" && <span style={activeIndicator} />}
            </span>

            {navLinks.map(([l,id])=>(
              <span
                key={l}
                onClick={()=>scrollTo(id)}
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
            onClick={()=>scrollTo("home")}
            aria-current={activeSection==="home" ? "page" : undefined}
            style={{padding:"14px 24px",color:activeSection==="home" ? "#00A896" : "rgba(255,255,255,0.75)",
              fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
          >
            Home
          </div>
          {navLinks.map(([l,id])=>(
            <div
              key={l}
              onClick={()=>scrollTo(id)}
              aria-current={activeSection===id ? "page" : undefined}
              style={{padding:"14px 24px",color:activeSection===id ? "#00A896" : "rgba(255,255,255,0.75)",
                fontSize:15,cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.05)"}}
            >
              {l}
            </div>
          ))}
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

// ─────────────────────────────────────────────
// PUBLIC SITE
// ─────────────────────────────────────────────
function PublicSite({ onLoginClick }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    naam: "",
    organisatie: "",
    email: "",
    telefoon: "",
    bericht: "",
  });
  const [status, setStatus] = useState("idle");
  const isMobile = useIsMobile();

  const openModal = () => {
    setModalOpen(true);
    setStatus("idle");
    setForm({ naam: "", organisatie: "", email: "", telefoon: "", bericht: "" });
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    if (!form.naam || !form.email) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      await addDoc(collection(db, "contactaanvragen"), {
        naam: form.naam,
        organisatie: form.organisatie,
        email: form.email,
        telefoon: form.telefoon,
        bericht: form.bericht,
        status: "Nieuw",
        aangemaakt_op: serverTimestamp(),
      });

      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_naam: form.naam,
            from_organisatie: form.organisatie,
            from_email: form.email,
            from_telefoon: form.telefoon,
            bericht: form.bericht,
            to_email: "info@mijnteamkompas.nl",
          },
        }),
      });

      if (!res.ok) {
        console.warn("EmailJS gaf geen 200-response");
      }

      setStatus("sent");
    } catch (error) {
      console.error("Fout bij versturen:", error);
      setStatus("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>Mijn Teamkompas | Teamscan, teamcoaching en leiderschapsbegeleiding</title>
        <meta
          name="description"
          content="Mijn Teamkompas helpt teams te groeien met teamscan, teamcoaching en leiderschapsbegeleiding."
        />
        <meta property="og:title" content="Mijn Teamkompas | Teamscan, teamcoaching en leiderschapsbegeleiding" />
        <meta
          property="og:description"
          content="Mijn Teamkompas helpt teams te groeien met teamscan, teamcoaching en leiderschapsbegeleiding."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{fontFamily:"'Roboto', sans-serif",color:"#2D3748",overflowX:"hidden"}}>
        <NavBar isMobile={isMobile} onLoginClick={onLoginClick} openModal={openModal} />

        {/* HERO */}
        <div id="home" style={{background:PUB.donker,display:"grid",
          gridTemplateColumns:isMobile?"1fr":"1fr 1fr",
          alignItems:"center",minHeight:isMobile?"auto":"86vh",
          position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,
            backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.033) 1px,transparent 1px)",
            backgroundSize:"30px 30px",pointerEvents:"none"}}/>
          <Strepen/>
          <div style={{padding:isMobile?"60px 24px 40px 32px":"60px 48px 60px 60px",position:"relative",zIndex:2}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:PUB.teal,
              textTransform:"uppercase",marginBottom:16}}>Voor teams en leidinggevenden</div>
            <h1 style={{fontSize:isMobile?30:44,fontWeight:700,lineHeight:1.2,color:PUB.wit,marginBottom:16}}>
              Goede teams worden niet beter door harder te werken. Ze worden beter door anders te kijken.
            </h1>
            <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:"rgba(255,255,255,0.57)",maxWidth:520,marginBottom:14}}>
              Wij meten wat er speelt, begrijpen wat het betekent en bewegen wat vastloopt.
            </p>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.42)",marginBottom:32}}>
              Voor teams en organisaties in beweging.
            </div>
            <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:12}}>
              <span style={{background:PUB.teal,color:PUB.donker,padding:"13px 22px",borderRadius:4,
                fontWeight:600,fontSize:14,cursor:"pointer",textAlign:"center"}} onClick={openModal}>
                Plan een kennismaking
              </span>
              <span onClick={()=>document.getElementById("aanpak")?.scrollIntoView({behavior:"smooth",block:"start"})}
                style={{border:"1px solid rgba(255,255,255,0.26)",color:"rgba(255,255,255,0.78)",
                padding:"13px 22px",borderRadius:4,fontSize:14,cursor:"pointer",textAlign:"center"}}>
                Bekijk onze aanpak
              </span>
            </div>
          </div>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",
              padding:"60px 40px",position:"relative",zIndex:2}}>
              <KompasAnim/>
            </div>
          )}
          {isMobile && (
            <div style={{display:"flex",justifyContent:"center",padding:"32px 24px",zIndex:2}}>
              <KompasAnim/>
            </div>
          )}
        </div>

        {/* SECTORBALK */}
        <div style={{background:PUB.licht,padding:isMobile?"17px 20px":"17px 60px",display:"flex",
          alignItems:"center",gap:28,borderBottom:`1px solid ${PUB.lijn}`,overflowX:"auto"}}>
          <span style={{fontSize:9.5,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",
            color:PUB.sub,whiteSpace:"nowrap",flexShrink:0,opacity:0.65}}>Actief in</span>
          {["Zakelijke dienstverlening","Gemeenten","Onderwijs","Energie","Industrie","Financiën"].map(i=>(
            <span key={i} style={{fontSize:13,color:PUB.sub,opacity:0.62,whiteSpace:"nowrap"}}>{i}</span>
          ))}
        </div>

        {/* FOTOSECTIE */}
        <div style={{position:"relative",width:"100%",height:isMobile?280:480,overflow:"hidden"}}>
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&fit=crop&crop=center"
            alt="Mensen in serieus overleg aan tafel"
            style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%",display:"block"}}
          />
          <div style={{
            position:"absolute",inset:0,
            background:"linear-gradient(to right, rgba(13,27,42,0.78) 0%, rgba(13,27,42,0.45) 55%, rgba(13,27,42,0.18) 100%)"
          }}/>
          <div style={{
            position:"absolute",inset:0,
            display:"flex",flexDirection:"column",justifyContent:"center",
            padding:isMobile?"28px 24px":"0 80px"
          }}>
            <Fade>
              <p style={{
                fontSize:isMobile?20:34,fontWeight:700,color:PUB.wit,
                lineHeight:1.3,maxWidth:620,marginBottom:16
              }}>
                Samenwerking verbeteren begint niet met een nieuw proces.<br/>
                <em style={{fontStyle:"italic",color:PUB.teal}}>Het begint met begrijpen wat er werkelijk tussen mensen speelt.</em>
              </p>
            </Fade>
          </div>
        </div>

        {/* AANPAK */}
        <div id="aanpak" style={{padding:isMobile?"48px 20px":"72px 60px",background:PUB.wit}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:52,alignItems:"start"}}>
            <Fade>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Onze aanpak</div>
              <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
                Wat maakt samenwerking <br/><em style={{fontStyle:"italic",color:PUB.teal}}>sterk of kwetsbaar?</em>
              </h2>
              <p style={{fontSize:15,lineHeight:1.75,color:PUB.sub,marginBottom:28}}>
                Wij helpen teams en leidinggevenden zichtbaar te maken wat samenwerking belemmert en wat juist beweging geeft.
                Niet met losse inzichten, maar met een scherp beeld van wat er speelt in gedrag, vertrouwen, energie, verandering en dagelijks leiderschap.
              </p>
              {[["1","We maken zichtbaar wat er speelt","We brengen in kaart waar samenwerking vastloopt, waar onduidelijkheid ontstaat en waar energie of vertrouwen wegvalt."],
                ["2","We vertalen signalen naar richting","We maken patronen begrijpelijk voor team en leidinggevende, zodat duidelijk wordt waar de grootste kans op verbetering ligt."],
                ["3","We zetten inzicht om in beweging","We vertalen de uitkomsten naar concrete gesprekken, interventies en vervolgstappen die in de praktijk uitvoerbaar zijn."],
              ].map(([nr,t,b],i)=>(
                <Fade key={i} delay={i*0.1}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
                    <div style={{width:33,height:33,borderRadius:"50%",background:PUB.donker,
                      color:PUB.teal,display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:15,fontWeight:700,flexShrink:0}}>{nr}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:PUB.donker,marginBottom:2}}>{t}</div>
                      <div style={{fontSize:13,color:PUB.sub,lineHeight:1.6}}>{b}</div>
                    </div>
                  </div>
                </Fade>
              ))}
            </Fade>
            <Fade delay={isMobile?0:0.2}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,
                borderRadius:10,overflow:"hidden",boxShadow:"0 14px 44px rgba(0,0,0,0.13)"}}>
                {[[PUB.groen,"01","Vertrouwen & veiligheid","Kunnen mensen zich uitspreken, fouten bespreken en elkaar echt aanspreken?","Gebaseerd op Secure Base Leadership"],
                  [PUB.blauw,"02","Verandering & duidelijkheid","Begrijpen mensen wat er verandert, waarom dat nodig is en wat er van hen wordt gevraagd?","Gebaseerd op neuromanagement"],
                  [PUB.oranje,"03","Energie & motivatie","Waar geven werk en samenwerking energie, en waar ontstaan juist belasting, frustratie of uitputting?","Gebaseerd op het JD-R model"],
                  [PUB.paars,"04","Leren & verbeteren","Hoe leert een team van ervaringen en hoe worden verbeteringen ook echt vastgehouden?","Gebaseerd op lean en agile"],
                ].map(([c,nr,t,b,m],i)=>(
                  <div key={i} style={{background:c,padding:isMobile?"16px 12px":"24px 18px",display:"flex",flexDirection:"column",gap:5}}>
                    <div style={{fontSize:isMobile?20:30,fontWeight:700,color:"rgba(255,255,255,0.16)",lineHeight:1}}>{nr}</div>
                    <div style={{fontSize:isMobile?13:15,fontWeight:700,color:PUB.wit,lineHeight:1.2}}>{t}</div>
                    <div style={{fontSize:isMobile?11:12,color:"rgba(255,255,255,0.76)",lineHeight:1.55}}>{b}</div>
                    <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.08em",color:"rgba(255,255,255,0.42)",textTransform:"uppercase",marginTop:"auto",paddingTop:8}}>{m}</div>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </div>

        {/* WAT ORGANISATIES MOGEN VERWACHTEN */}
        <div style={{background:PUB.donker,padding:isMobile?"48px 24px":"72px 96px",position:"relative",overflow:"hidden"}}>
          <Strepen/>
          <Fade>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>
              Wat organisaties van ons mogen verwachten
            </div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.15,color:PUB.wit,marginBottom:16,maxWidth:760}}>
              Wat jouw organisatie <em style={{fontStyle:"italic",color:PUB.teal}}>eraan heeft</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.62)",maxWidth:760,marginBottom:36}}>
              Geen stapel aanbevelingen die in een la verdwijnen. Wat we doen wordt zichtbaar in hoe mensen samenwerken, communiceren en eigenaarschap nemen.
            </p>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:isMobile?10:12,maxWidth:900,gridAutoRows:"1fr"}}>
              {[
                "Je weet sneller wat samenwerking belemmert en waar de echte ruimte zit",
                "Teams spreken zich opener uit omdat ze begrijpen wat er speelt",
                "Leidinggevenden krijgen concrete handvatten om anders te sturen",
                "Interventies zijn direct uitvoerbaar in de dagelijkse praktijk",
                "De aanpak is mensgericht én gericht op zichtbaar resultaat",
                "Gedrag, samenwerking en eigenaarschap veranderen merkbaar",
              ].map((item,i)=>(
                <Fade key={i} delay={i*0.05} style={{height:"100%"}}>
                  <div style={{height:"100%",boxSizing:"border-box",display:"flex",gap:12,alignItems:"center",padding:"16px 18px",
                    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:PUB.teal,flexShrink:0}}/>
                    <div style={{fontSize:14,color:"rgba(255,255,255,0.84)",lineHeight:1.6}}>{item}</div>
                  </div>
                </Fade>
              ))}
            </div>
          </Fade>
        </div>

        {/* SECTOREN */}
        <div id="voor-wie" style={{padding:"72px 60px",background:PUB.licht}}>
          <Fade>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Voor wie werken wij</div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
              Van overheid tot <em style={{fontStyle:"italic",color:PUB.teal}}>zakelijke dienstverlening</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:PUB.sub,maxWidth:460,marginBottom:40}}>
              Onze methodiek is sectoronafhankelijk — want mensen zijn overal mensen.
            </p>
          </Fade>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?12:16,alignItems:"stretch"}}>
            {[["Zakelijke dienstverlening","Groeiende organisaties en scale-ups die structuur en cultuur willen versterken."],
              ["Gemeenten","Verandering in een politieke omgeving vraagt extra aandacht voor psychologische veiligheid."],
              ["Onderwijs","Van schoolteams tot hogescholen — het gesprek over gedrag concreet en constructief maken."],
              ["Industrie","Veiligheidscultuur, lean-transformaties en teamontwikkeling op de werkvloer."],
            ].map(([t,b],i)=>(
              <Fade key={i} delay={i*0.1} style={{height:"100%"}}>
                <div style={{height:"100%",background:PUB.wit,border:`1px solid ${PUB.lijn}`,borderRadius:8,padding:"22px 18px",boxSizing:"border-box"}}>
                  <div style={{fontSize:17,fontWeight:700,color:PUB.donker,marginBottom:7}}>{t}</div>
                  <div style={{fontSize:13,color:PUB.sub,lineHeight:1.65}}>{b}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>

        {/* OVER ONS */}
        <div id="over-ons" style={{padding:isMobile?"48px 20px":"72px 60px",background:PUB.wit}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:52,alignItems:"start"}}>
            <Fade>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:PUB.teal,textTransform:"uppercase",marginBottom:12}}>Wie wij zijn</div>
              <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.donker,marginBottom:14}}>
                Ervaring die je herkent.<br/><em style={{fontStyle:"italic",color:PUB.teal}}>Aanpak die werkt.</em>
              </h2>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:16}}>
                Wij begeleiden teams en leidinggevenden in organisaties waar samenwerking onder druk staat. Door groei, verandering, of simpelweg doordat er nooit écht over het samenwerken zelf is gesproken.
              </p>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:16}}>
                We combineren jarenlange praktijkervaring in leiderschap en organisatieverandering met een aanpak die direct toepasbaar is. Geen theorie die blijft hangen in een presentatie maar inzichten die mensen de volgende dag al anders laten handelen.
              </p>
              <p style={{fontSize:isMobile?14:15,lineHeight:1.75,color:PUB.sub,marginBottom:0}}>
                We helpen niet alleen begrijpen wat er speelt. We helpen het gesprek en het gedrag ook echt veranderen.
              </p>
            </Fade>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[
                ["Mensgericht én praktisch","Geen abstracte verandertaal, maar begeleiding die aansluit op de dagelijkse praktijk van teams en leidinggevenden."],
                ["Onderstroom zichtbaar maken","We helpen organisaties begrijpen wat niet wordt uitgesproken maar wel bepalend is voor samenwerking en beweging."],
                ["Richting geven aan vervolg","Inzichten worden vertaald naar gesprekken, interventies en vervolgstappen die uitvoerbaar en relevant zijn."],
              ].map(([titel,tekst],i)=>(
                <Fade key={i} delay={i*0.12}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",padding:18,
                    borderRadius:8,border:`1px solid ${PUB.lijn}`,background:PUB.licht}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:PUB.teal,marginTop:5,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:PUB.donker,marginBottom:5}}>{titel}</div>
                      <div style={{fontSize:13,color:PUB.sub,lineHeight:1.65}}>{tekst}</div>
                    </div>
                  </div>
                </Fade>
              ))}
              <Fade delay={0.35}>
                <div style={{padding:18,borderRadius:8,background:PUB.navy,border:`1px solid ${PUB.tealGlow}`}}>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.62)",marginBottom:11,lineHeight:1.6}}>
                    Benieuwd of onze aanpak past bij wat er in jouw organisatie speelt? Plan een vrijblijvend gesprek van 30 minuten. We luisteren eerst.
                  </p>
                  <span style={{background:PUB.teal,color:PUB.donker,padding:"10px 18px",borderRadius:4,
                    fontWeight:600,fontSize:13,cursor:"pointer",display:"block",textAlign:"center"}}
                    onClick={openModal}>Plan een vrijblijvend kennismakingsgesprek →</span>
                </div>
              </Fade>
            </div>
          </div>
        </div>

        {/* WERKWIJZE */}
        <div id="werkwijze" style={{padding:"72px 60px",background:PUB.donker,position:"relative",overflow:"hidden"}}>
          <Fade>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:"rgba(255,255,255,0.38)",textTransform:"uppercase",marginBottom:12}}>Hoe we werken</div>
            <h2 style={{fontSize:isMobile?26:38,fontWeight:700,lineHeight:1.1,color:PUB.wit,marginBottom:14}}>
              <em style={{fontStyle:"italic",color:PUB.teal}}>Drie stappen</em> naar beweging
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.48)",maxWidth:440,marginBottom:44}}>
              Elk traject begint met luisteren. Dan meten. Dan bewegen.
            </p>
          </Fade>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:isMobile?12:3,position:"relative",zIndex:1,alignItems:"stretch"}}>
            {[["01","Teamkompas Scan","We meten op alle vijf domeinen tegelijk.","4–6 weken"],
              ["02","Inzicht & Dialoog","We presenteren de resultaten en faciliteren het gesprek.","Workshop & sessies"],
              ["03","Gerichte Interventies","Concrete stappen op maat voor uw organisatie.","Op maat"],
            ].map(([nr,t,b,tag],i)=>(
              <Fade key={i} delay={i*0.12} style={{height:"100%"}}>
                <div style={{height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",
                  background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",padding:"28px 22px"}}>
                  <div style={{fontSize:42,fontWeight:700,color:"rgba(0,168,150,0.15)",lineHeight:1,marginBottom:13}}>{nr}</div>
                  <div style={{fontSize:18,fontWeight:700,color:PUB.wit,marginBottom:9}}>{t}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.46)",lineHeight:1.7,marginBottom:16,flex:1}}>{b}</div>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
                    color:PUB.teal,padding:"3px 9px",border:"1px solid rgba(0,168,150,0.25)",borderRadius:2,alignSelf:"flex-start"}}>{tag}</span>
                </div>
              </Fade>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{padding:isMobile?"48px 24px":"72px 80px",
          background:`linear-gradient(135deg, ${PUB.donker} 0%, ${PUB.navy} 60%, rgba(0,168,150,0.15) 100%)`,
          textAlign:"center",position:"relative",overflow:"hidden",borderTop:`1px solid ${PUB.tealGlow}`}}>
          <Fade>
            <h2 style={{fontSize:isMobile?34:46,fontWeight:700,lineHeight:1.08,color:PUB.wit,marginBottom:14}}>
              Mensen maken<br/>het verschil
            </h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.78)",maxWidth:440,margin:"0 auto 28px"}}>
              Plan een vrijblijvend kennismakingsgesprek van 30 minuten. We luisteren eerst.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <span style={{background:PUB.donker,color:PUB.teal,padding:"11px 22px",borderRadius:4,fontWeight:600,fontSize:14,cursor:"pointer"}} onClick={openModal}>Stuur ons een bericht</span>
              <span onClick={()=>document.getElementById("werkwijze")?.scrollIntoView({behavior:"smooth",block:"start"})}
                style={{border:"1px solid rgba(255,255,255,0.38)",color:PUB.wit,padding:"11px 22px",borderRadius:4,fontSize:14,cursor:"pointer"}}>
                Bekijk onze werkwijze
              </span>
            </div>
          </Fade>
        </div>

        {/* FOOTER */}
        <div style={{background:PUB.donker,padding:"44px 60px 22px",borderTop:"1px solid rgba(0,168,150,0.12)"}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr 1fr",gap:30,marginBottom:30}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
                <KompasDot size={20}/>
                <span style={{fontSize:13,fontWeight:600,color:PUB.wit}}>Mijn Teamkompas</span>
              </div>
              <p style={{fontSize:14,fontStyle:"italic",color:PUB.teal,marginBottom:9}}>Mensen maken het verschil.</p>
            </div>
            {[["Aanpak",["Teamkompas Scan","De vier domeinen","Werkwijze"]],
              ["Voor wie",["Zakelijke dienstverlening","Gemeenten","Onderwijs","Industrie"]],
              ["Contact",["Afspraak maken","info@mijnteamkompas.nl","LinkedIn"]],
            ].map(([t,ls],i)=>(
              <div key={i}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.28)",marginBottom:12}}>{t}</div>
                {ls.map(l=><div key={l} style={{fontSize:12,color:"rgba(255,255,255,0.52)",marginBottom:8,cursor:"pointer"}}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{height:3,display:"flex",marginBottom:16}}>
            {[PUB.groen,PUB.blauw,PUB.oranje,PUB.paars].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.22)"}}>© 2026 Mijn Teamkompas</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.22)"}}>Privacybeleid · Algemene voorwaarden</span>
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {modalOpen && (
        <div onClick={closeModal} style={{position:"fixed",inset:0,zIndex:1000,
          background:"rgba(13,27,42,0.85)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,
            background:"#1A2E4A",borderRadius:16,border:"1px solid rgba(0,168,150,0.2)",
            boxShadow:"0 40px 100px rgba(0,0,0,0.6)",overflow:"hidden"}}>
            <div style={{padding:"28px 32px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
              display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",color:"#00A896",textTransform:"uppercase",marginBottom:6}}>Vrijblijvend kennismakingsgesprek</div>
                <div style={{fontSize:22,fontWeight:700,color:"#ffffff"}}>Plan een gesprek</div>
                <div style={{fontSize:13,color:"#8fa3bb",marginTop:4}}>We nemen binnen één werkdag contact op.</div>
              </div>
              <div onClick={closeModal} style={{cursor:"pointer",color:"#8fa3bb",fontSize:22,lineHeight:1,padding:"4px 8px",marginTop:-4}}>×</div>
            </div>
            {status === "sent" ? (
              <div style={{padding:"48px 32px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:16}}>✅</div>
                <div style={{fontSize:20,fontWeight:700,color:"#ffffff",marginBottom:10}}>Bericht ontvangen!</div>
                <div style={{fontSize:14,color:"#8fa3bb",lineHeight:1.7,marginBottom:24}}>
                  Bedankt voor uw interesse. We nemen zo snel mogelijk contact met u op.
                </div>
                <span onClick={closeModal} style={{background:"#00A896",color:"#0D1B2A",
                  padding:"10px 24px",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  Sluiten
                </span>
              </div>
            ) : (
              <div style={{padding:"24px 32px 32px"}}>
                {[["naam","Naam *","Uw volledige naam","text"],
                  ["organisatie","Organisatie","Naam van uw organisatie","text"],
                  ["email","E-mailadres *","uw@email.nl","email"],
                  ["telefoon","Telefoonnummer","+31 6 ...","tel"],
                ].map(([key,label,ph,type])=>(
                  <div key={key} style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:"#8fa3bb",marginBottom:5,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>{label}</div>
                    <input type={type} placeholder={ph} value={form[key]}
                      onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                      style={{width:"100%",background:"rgba(255,255,255,0.05)",
                        border:`1px solid ${status==="error" && !form[key] && (key==="naam"||key==="email") ? "#e74c3c" : "rgba(255,255,255,0.1)"}`,
                        borderRadius:8,padding:"10px 14px",color:"#ffffff",fontSize:14,
                        outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:"#8fa3bb",marginBottom:5,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>Bericht</div>
                  <textarea placeholder="Vertel ons kort waar u mee bezig bent..." value={form.bericht}
                    onChange={e=>setForm(f=>({...f,bericht:e.target.value}))} rows={4}
                    style={{width:"100%",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,
                      padding:"10px 14px",color:"#ffffff",fontSize:14,outline:"none",
                      boxSizing:"border-box",resize:"vertical"}}/>
                </div>
                {status === "error" && (
                  <div style={{fontSize:12,color:"#e74c3c",marginBottom:12}}>Vul minimaal naam en e-mailadres in.</div>
                )}
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <button onClick={handleSubmit} disabled={status==="sending"}
                    style={{flex:1,background:status==="sending"?"#007d70":"#00A896",
                      color:"#0D1B2A",border:"none",borderRadius:8,padding:"13px",
                      fontWeight:700,fontSize:15,cursor:status==="sending"?"wait":"pointer"}}>
                    {status === "sending" ? "Versturen..." : "Verstuur aanvraag →"}
                  </button>
                  <span onClick={closeModal} style={{fontSize:13,color:"#8fa3bb",cursor:"pointer"}}>Annuleer</span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:12,textAlign:"center"}}>
                  Uw gegevens worden uitsluitend gebruikt om contact met u op te nemen.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// LOGIN SCREEN — Firebase Auth + ADMIN_EMAILS check
// ─────────────────────────────────────────────
function LoginScreen({ onLogin, onBack }) {
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

// ─────────────────────────────────────────────
// SCAN INVULLEN — resultaten naar Firestore
// ─────────────────────────────────────────────
function ScanInvullen({ scanId }) {
  const [lijst, setLijst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stap, setStap] = useState(0);
  const [rol, setRol] = useState("");
  const [antwoorden, setAntwoorden] = useState({});
  const [ingediend, setIngediend] = useState(false);
  const [opslaan, setOpslaan] = useState(false);

  useEffect(() => {
    const laadLijst = async () => {
      try {
        const docRef = doc(db, "vragenlijsten", scanId);
        const snap = await getDoc(docRef);

        if (snap.exists() && snap.data().status === "Actief") {
          setLijst({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Fout bij laden scan:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    laadLijst();
  }, [scanId]);

  const slaAntwoordOp = (id, waarde) => {
    setAntwoorden((prev) => ({ ...prev, [id]: waarde }));
  };

  const indienen = async () => {
    setOpslaan(true);

    try {
      await addDoc(collection(db, "antwoorden"), {
        vragenlijstId: scanId,
        klant: lijst?.klant || "",
        rol: rol || "Onbekend",
        antwoorden,
        ingediend_op: serverTimestamp(),
      });

      setIngediend(true);
    } catch (err) {
      console.error("Fout bij opslaan:", err);
      // Toon toch bedankt-scherm zodat deelnemer niet vast zit
      setIngediend(true);
    } finally {
      setOpslaan(false);
    }
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:ADM.muted}}>
        <div style={{fontSize:32,marginBottom:12}}>🧭</div>
        <div style={{fontSize:16,color:ADM.white}}>Scan laden...</div>
      </div>
    </div>
  );

  if (notFound || !lijst) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:ADM.muted}}>
        <div style={{fontSize:32,marginBottom:12}}>🔍</div>
        <div style={{fontSize:18,color:ADM.white,marginBottom:8}}>Vragenlijst niet gevonden</div>
        <div style={{fontSize:14}}>Controleer de link en probeer opnieuw.</div>
      </div>
    </div>
  );

  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;
  const totaal = stellingen.length;
  const huidige = stellingen[stap - 1];
  const voortgang = stap === 0 ? 0 : Math.round((stap / totaal) * 100);

  if (ingediend) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{fontSize:48,marginBottom:20}}>✅</div>
        <div style={{fontSize:24,fontWeight:700,color:ADM.white,marginBottom:12}}>Bedankt!</div>
        <div style={{fontSize:15,color:ADM.muted,lineHeight:1.7,marginBottom:28}}>
          Jouw antwoorden zijn ontvangen. Mijn Teamkompas verwerkt de resultaten en bespreekt deze met het team.
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
          <KompasDot size={28}/>
          <span style={{fontSize:13,color:ADM.muted}}>Mijn Teamkompas</span>
        </div>
      </div>
    </div>
  );

  if (stap === 0) return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:480,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:ADM.teal,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,
            margin:"0 auto 16px",boxShadow:"0 0 24px rgba(0,168,150,0.4)"}}>🧭</div>
          <div style={{fontSize:11,color:ADM.teal,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Mijn Teamkompas</div>
          <div style={{fontSize:22,fontWeight:700,color:ADM.white,marginBottom:10}}>{lijst.naam}</div>
          <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7}}>
            Deze scan bestaat uit {totaal} vragen en duurt ongeveer 5–8 minuten. Je antwoorden zijn anoniem.
          </div>
        </div>
        <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
          <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Jouw rol</div>
          <div style={{display:"flex",gap:10}}>
            {["Teamlid","Leidinggevende"].map(r=>(
              <div key={r} onClick={()=>setRol(r)}
                style={{flex:1,padding:"10px",borderRadius:8,textAlign:"center",cursor:"pointer",fontSize:14,fontWeight:600,
                  border:`1px solid ${rol===r?ADM.teal:ADM.border}`,
                  background:rol===r?ADM.tealGlow:"transparent",
                  color:rol===r?ADM.teal:ADM.muted}}>
                {r}
              </div>
            ))}
          </div>
        </div>
        <button onClick={()=>{ if(rol) setStap(1); }}
          style={{width:"100%",background:rol?ADM.teal:"rgba(0,168,150,0.3)",color:ADM.navyDeep,
            border:"none",borderRadius:10,padding:"14px",fontWeight:700,fontSize:16,
            cursor:rol?"pointer":"not-allowed"}}>
          Start de scan →
        </button>
      </div>
    </div>
  );

  const kanDoorgaan = huidige.type==="open" || antwoorden[huidige.id] !== undefined;

  return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",flexDirection:"column"}}>
      <div style={{height:4,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",background:ADM.teal,width:`${voortgang}%`,transition:"width .4s"}}/>
      </div>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${ADM.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:PIJLERS[huidige.pijler]?.kleur||ADM.teal,flexShrink:0}}/>
          <span style={{fontSize:12,color:ADM.muted}}>{PIJLERS[huidige.pijler]?.naam}</span>
        </div>
        <span style={{fontSize:12,color:ADM.muted}}>{stap} / {totaal}</span>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
        <div style={{maxWidth:540,width:"100%"}}>
          <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:14}}>
            {huidige.type==="schaal" ? "Geef een score van 1 tot 5" : "Open vraag"}
          </div>
          <div style={{fontSize:20,fontWeight:600,color:ADM.white,lineHeight:1.5,marginBottom:32}}>
            {huidige.tekst}
          </div>
          {huidige.type==="schaal" ? (
            <div>
              <div style={{display:"flex",gap:12,marginBottom:16,justifyContent:"center"}}>
                {[1,2,3,4,5].map(n=>(
                  <div key={n} onClick={()=>slaAntwoordOp(huidige.id,n)}
                    style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:20,fontWeight:700,cursor:"pointer",transition:"all .15s",
                      border:`2px solid ${antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.12)"}`,
                      background:antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.04)",
                      color:antwoorden[huidige.id]===n?ADM.navyDeep:ADM.muted,
                      transform:antwoorden[huidige.id]===n?"scale(1.15)":"scale(1)"}}>
                    {n}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:ADM.muted}}>
                <span>Helemaal mee oneens</span>
                <span>Helemaal mee eens</span>
              </div>
            </div>
          ) : (
            <textarea rows={5} value={antwoorden[huidige.id]||""}
              onChange={e=>slaAntwoordOp(huidige.id,e.target.value)}
              placeholder="Typ hier je antwoord..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",
                border:`1px solid ${ADM.border}`,borderRadius:10,padding:"14px 16px",
                color:ADM.white,fontSize:15,outline:"none",resize:"none",
                boxSizing:"border-box",lineHeight:1.6}}/>
          )}
        </div>
      </div>
      <div style={{padding:"20px 24px",borderTop:`1px solid ${ADM.border}`,
        display:"flex",gap:12,justifyContent:"space-between"}}>
        <button onClick={()=>setStap(s=>Math.max(0,s-1))}
          style={{background:"none",border:`1px solid ${ADM.border}`,color:ADM.muted,
            borderRadius:8,padding:"12px 20px",fontSize:14,cursor:"pointer"}}>
          ← Vorige
        </button>
        {stap < totaal ? (
          <button onClick={()=>{ if(kanDoorgaan) setStap(s=>s+1); }}
            style={{background:kanDoorgaan?ADM.teal:"rgba(0,168,150,0.3)",color:ADM.navyDeep,
              border:"none",borderRadius:8,padding:"12px 24px",fontWeight:700,fontSize:14,
              cursor:kanDoorgaan?"pointer":"not-allowed",flex:1,maxWidth:200}}>
            Volgende →
          </button>
        ) : (
          <button onClick={indienen} disabled={opslaan}
            style={{background:ADM.teal,color:ADM.navyDeep,border:"none",
              borderRadius:8,padding:"12px 24px",fontWeight:700,fontSize:14,
              cursor:opslaan?"wait":"pointer",flex:1,maxWidth:200}}>
            {opslaan ? "Opslaan..." : "Verstuur ✓"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN: SCAN BEHEER — Firestore
// ─────────────────────────────────────────────
function PageScans() {
  const [lijsten,    setLijsten]    = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [nieuw,      setNieuw]      = useState({ naam:"", klant:"" });
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [gekopieerd,   setGekopieerd]   = useState(null);
  const [opslaan,      setOpslaan]      = useState(false);

  const laadData = async () => {
    setLoading(true);
    try {
      const [vlSnap, antSnap] = await Promise.all([
        getDocs(collection(db, "vragenlijsten")),
        getDocs(collection(db, "antwoorden")),
      ]);
      setLijsten(vlSnap.docs.map(d=>({ id:d.id, ...d.data() })));
      setAntwoorden(antSnap.docs.map(d=>({ id:d.id, ...d.data() })));
    } catch (err) {
      console.error("Laden mislukt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { laadData(); }, []);

  const maakAan = async () => {
    if (!nieuw.naam || !nieuw.klant) return;
    setOpslaan(true);
    try {
      const data = {
        naam:       nieuw.naam,
        klant:      nieuw.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status:     "Actief",
        stellingen: DEFAULT_STELLINGEN,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setLijsten(prev => [...prev, { id:ref.id, ...data }]);
      setNieuw({ naam:"", klant:"" });
      setShowForm(false);
    } catch (err) {
      console.error("Aanmaken mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const kopieerLink = async (id) => {
    const url = `${window.location.origin}?scan=${id}`;

    try {
      await navigator.clipboard.writeText(url);
      setGekopieerd(id);
      setTimeout(() => setGekopieerd(null), 2000);
    } catch (err) {
      console.error("Kopiëren mislukt:", err);
    }
  };

  const antwoordenVoor = (id) => antwoorden.filter(a=>a.vragenlijstId===id);

  if (loading) return <div style={{color:ADM.muted,padding:20}}>Laden...</div>;
  if (geselecteerd) return (
    <ScanResultaten
      lijst={geselecteerd}
      antwoorden={antwoordenVoor(geselecteerd.id)}
      onBack={()=>setGeselecteerd(null)}
    />
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{lijsten.length} vragenlijst(en) actief</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,
            padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Nieuwe vragenlijst
        </button>
      </div>

      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"22px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe vragenlijst aanmaken</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["naam","Naam vragenlijst","bijv. Evides — T1 Meting"],
              ["klant","Klant","bijv. Evides"]
            ].map(([k,l,p])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))} placeholder={p}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,
                    borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={maakAan} disabled={opslaan}
              style={{background:ADM.teal,color:ADM.navyDeep,border:"none",
                borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {opslaan ? "Aanmaken..." : "Aanmaken"}
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>Annuleer</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {lijsten.map(lijst => {
          const resp = antwoordenVoor(lijst.id);
          return (
            <div key={lijst.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,color:ADM.white,fontSize:15,marginBottom:4}}>{lijst.naam}</div>
                  <div style={{fontSize:12,color:ADM.muted,marginBottom:12}}>
                    🏢 {lijst.klant} · 📅 {lijst.aangemaakt} · {(lijst.stellingen||[]).length} stellingen · {resp.length} ingevuld
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={()=>kopieerLink(lijst.id)}
                      style={{background:gekopieerd===lijst.id?"rgba(46,204,113,0.15)":ADM.tealGlow,
                        color:gekopieerd===lijst.id?ADM.green:ADM.teal,border:"none",borderRadius:6,
                        padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      {gekopieerd===lijst.id ? "✓ Gekopieerd!" : "🔗 Kopieer deelnemerslink"}
                    </button>
                    <button onClick={()=>setGeselecteerd(lijst)}
                      style={{background:"rgba(255,255,255,0.05)",color:ADM.muted,border:`1px solid ${ADM.border}`,
                        borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
                      📊 Bekijk resultaten ({resp.length})
                    </button>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,flexShrink:0,
                  background:"rgba(0,168,150,0.12)",color:ADM.teal}}>{lijst.status}</span>
              </div>
            </div>
          );
        })}
        {lijsten.length === 0 && (
          <div style={{color:ADM.muted,fontSize:14,padding:20,textAlign:"center"}}>
            Nog geen vragenlijsten. Maak de eerste aan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN: SCAN RESULTATEN (gap-analyse)
// ─────────────────────────────────────────────
function ScanResultaten({ lijst, antwoorden, onBack }) {
  const [open,    setOpen]    = useState(null);
  const [tabBlad, setTabBlad] = useState("gap");

  const teamleden  = antwoorden.filter(a=>a.rol==="Teamlid");
  const management = antwoorden.filter(a=>a.rol==="Leidinggevende");
  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;

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

  return (
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",color:ADM.teal,
        fontSize:13,cursor:"pointer",marginBottom:20,padding:0,fontWeight:600}}>
        ← Terug naar vragenlijsten
      </button>
      <div style={{marginBottom:20}}>
        <div style={{fontWeight:700,color:ADM.white,fontSize:18,marginBottom:4}}>{lijst.naam}</div>
        <div style={{fontSize:13,color:ADM.muted,marginBottom:16}}>
          {antwoorden.length} deelnemers · {teamleden.length} teamleden · {management.length} leidinggevenden · {lijst.klant}
        </div>
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
            De <strong style={{color:ADM.white}}>gap-analyse</strong> toont het verschil tussen hoe het{" "}
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

  useEffect(() => {
    const laadAanvragen = async () => {
      setLoading(true);

      try {
        const q = query(collection(db, "contactaanvragen"), orderBy("aangemaakt_op", "desc"));
        const snap = await getDocs(q);

        const rows = snap.docs.map((d) => {
          const data = d.data();
          const datum =
            data.aangemaakt_op?.toDate?.().toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
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

  const statusColor = (s) =>
    s === "Nieuw" ? ADM.teal : s === "In behandeling" ? ADM.orange : ADM.muted;

  const statusBg = (s) =>
    s === "Nieuw"
      ? "rgba(0,168,150,0.12)"
      : s === "In behandeling"
      ? "rgba(243,156,18,0.12)"
      : "rgba(255,255,255,0.05)";

  if (loading) {
    return <div style={{ color: ADM.muted, padding: 20 }}>Laden...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: ADM.muted, marginBottom: 20 }}>
          {aanvragen.filter((a) => a.status === "Nieuw").length} nieuwe aanvragen · {aanvragen.length} totaal
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aanvragen.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              style={{
                background: ADM.navy,
                border: `1px solid ${selected?.id === a.id ? ADM.teal : ADM.border}`,
                borderRadius: 12,
                padding: "18px 22px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: ADM.white, fontSize: 15 }}>{a.naam}</div>
                  <div style={{ fontSize: 12, color: ADM.muted, marginTop: 2 }}>{a.org} · {a.datum}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: statusBg(a.status), color: statusColor(a.status) }}>
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
          {[
            ["Naam", selected.naam],
            ["Organisatie", selected.org],
            ["E-mail", selected.email],
            ["Telefoon", selected.tel || "-"],
          ].map(([l, v]) => (
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
          <a
            href={`mailto:${selected.email}`}
            style={{ display: "block", width: "100%", background: ADM.teal, color: ADM.navyDeep, border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
          >
            Reageer via e-mail
          </a>
        </div>
      )}
    </div>
  );
}

function PageKlanten() {
  const [klanten, setKlanten] = useState([
    { id:1, naam:"Evides", sector:"Energie", contact:"Mark Janssen", email:"m.janssen@evides.nl", status:"Actief", score:3.6, fase:"T0 → T1", startdatum:"Jan 2025", team:9 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [nieuw,    setNieuw]    = useState({ naam:"", sector:"", contact:"", email:"", status:"Actief" });

  const voegToe = () => {
    if (!nieuw.naam || !nieuw.contact) return;
    setKlanten(prev => [...prev, { ...nieuw, id:Date.now(), score:null, fase:"Intake", startdatum:"Nu", team:0 }]);
    setNieuw({ naam:"", sector:"", contact:"", email:"", status:"Actief" });
    setShowForm(false);
  };

  const statusColor = s => s==="Actief" ? ADM.green : s==="In gesprek" ? ADM.orange : ADM.muted;

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
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe klant</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {[["naam","Organisatienaam *"],["sector","Sector"],["contact","Contactpersoon *"],["email","E-mail"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,
                    borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={voegToe} style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Opslaan</button>
            <button onClick={()=>setShowForm(false)} style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>Annuleer</button>
          </div>
        </div>
      )}
      <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>{["Organisatie","Sector","Contactpersoon","Status","Score","Fase"].map(h=>(
              <th key={h} style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:ADM.muted,padding:"12px 20px",textAlign:"left",fontWeight:600,borderBottom:`1px solid ${ADM.border}`}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {klanten.map(k=>(
              <tr key={k.id} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                <td style={{padding:"14px 20px",fontWeight:600,color:ADM.white}}>{k.naam}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.muted}}>{k.sector||"—"}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.text}}>{k.contact}</td>
                <td style={{padding:"14px 20px"}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                    background:`${statusColor(k.status)}22`,color:statusColor(k.status)}}>{k.status}</span>
                </td>
                <td style={{padding:"14px 20px",fontWeight:700,fontSize:15,
                  color:k.score>=4?ADM.green:k.score>=3?ADM.orange:k.score?ADM.red:ADM.muted}}>
                  {k.score||"—"}
                </td>
                <td style={{padding:"14px 20px",fontSize:12,color:ADM.muted}}>{k.fase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageMetingen() {
  const pijlerNamen = ["Veiligheid & Leiderschap","Beleving van Verandering","Energie & Motivatie","Verbeteren & Leren","Gedrag (centraal)"];
  const [metingen,  setMetingen]  = useState([
    { id:1, klant:"Evides", type:"T0 Nulmeting", datum:"Februari 2025", respondenten:9,
      scores:{ "Veiligheid & Leiderschap":2.8, "Beleving van Verandering":3.7, "Energie & Motivatie":3.5, "Verbeteren & Leren":4.0, "Gedrag (centraal)":3.4 }, status:"Compleet" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [nieuw,    setNieuw]    = useState({ klant:"Evides", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
  const [selected, setSelected] = useState(null);

  const scoreColor = s => s>=4 ? ADM.green : s>=3 ? ADM.orange : ADM.red;
  const gemScore   = scores => {
    const vals = Object.values(scores).filter(Boolean);
    return vals.length ? (vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1) : "—";
  };

  const slaOp = () => {
    if (!nieuw.klant || !nieuw.datum) return;
    setMetingen(prev => [...prev, { ...nieuw, id:Date.now(), status:"Compleet",
      respondenten:parseInt(nieuw.respondenten)||0,
      scores:Object.fromEntries(pijlerNamen.map(p=>[p,parseFloat(nieuw.scores[p])||null])) }]);
    setShowForm(false);
    setNieuw({ klant:"Evides", type:"T1 Meting", datum:"", respondenten:"", scores:{} });
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{metingen.length} meting(en)</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Nieuwe meting
        </button>
      </div>
      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"24px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuwe meting invoeren</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[["klant","Klant"],["type","Type meting"],["datum","Datum"],["respondenten","Respondenten"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Scores per pijler</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {pijlerNamen.map(p=>(
                <div key={p} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:12,color:ADM.text,flex:1}}>{p}</div>
                  <input type="number" min="1" max="5" step="0.1" value={nieuw.scores[p]||""}
                    onChange={e=>setNieuw(n=>({...n,scores:{...n.scores,[p]:e.target.value}}))}
                    style={{width:64,background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"8px 10px",color:ADM.white,fontSize:13,outline:"none",textAlign:"center"}}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={slaOp} style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Opslaan</button>
            <button onClick={()=>setShowForm(false)} style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>Annuleer</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {metingen.map(m=>(
          <div key={m.id} style={{background:ADM.navy,border:`1px solid ${selected?.id===m.id?ADM.teal:ADM.border}`,borderRadius:12,overflow:"hidden"}}>
            <div onClick={()=>setSelected(selected?.id===m.id?null:m)}
              style={{padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
              <div>
                <div style={{fontWeight:600,color:ADM.white,fontSize:15}}>{m.klant} — {m.type}</div>
                <div style={{fontSize:12,color:ADM.muted,marginTop:3}}>📅 {m.datum} · {m.respondenten} respondenten</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:24,fontWeight:700,color:scoreColor(gemScore(m.scores))}}>{gemScore(m.scores)}</div>
                <span style={{fontSize:12,color:ADM.teal}}>{selected?.id===m.id?"▲":"▼"}</span>
              </div>
            </div>
            {selected?.id===m.id && (
              <div style={{borderTop:`1px solid ${ADM.border}`,padding:"16px 22px"}}>
                {pijlerNamen.map(p=>(
                  <div key={p} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{fontSize:13,color:ADM.text,width:220,flexShrink:0}}>{p}</div>
                    <div style={{flex:1,height:8,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:`${((m.scores[p]||0)/5)*100}%`,background:scoreColor(m.scores[p])}}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:scoreColor(m.scores[p]),width:30,textAlign:"right"}}>{m.scores[p]||"—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageRapportages() {
  const [rapporten, setRapporten] = useState([
    { id:1, titel:"Evides — T0 Nulmeting Rapportage", klant:"Evides", type:"Teamscan", datum:"10 mrt 2026", status:"Gereed", formaat:"PDF" },
    { id:2, titel:"Evides — Managementsamenvatting",   klant:"Evides", type:"Samenvatting", datum:"12 mrt 2026", status:"Gereed", formaat:"PPTX" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [nieuw,    setNieuw]    = useState({ titel:"", klant:"Evides", type:"Teamscan", formaat:"PDF" });

  const maakAan = () => {
    if (!nieuw.titel) return;
    const now   = new Date();
    const datum = `${now.getDate()} ${["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"][now.getMonth()]} ${now.getFullYear()}`;
    setRapporten(prev => [...prev, { ...nieuw, id:Date.now(), datum, status:"In aanmaak" }]);
    setNieuw({ titel:"", klant:"Evides", type:"Teamscan", formaat:"PDF" });
    setShowForm(false);
  };

  const statusColor = s => s==="Gereed" ? ADM.green : s==="In aanmaak" ? ADM.orange : ADM.muted;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:13,color:ADM.muted}}>{rapporten.length} rapport(en)</div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Rapport aanmaken
        </button>
      </div>
      {showForm && (
        <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"24px",marginBottom:20}}>
          <div style={{fontWeight:600,color:ADM.white,marginBottom:16}}>Nieuw rapport aanmaken</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[["titel","Rapporttitel *"],["klant","Klant"]].map(([k,l])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <input value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            {[["type","Type",["Teamscan","Samenvatting","Voortgangsrapport","Eindrapport"]],
              ["formaat","Formaat",["PDF","PPTX","Word"]]
            ].map(([k,l,opts])=>(
              <div key={k}>
                <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{l}</div>
                <select value={nieuw[k]} onChange={e=>setNieuw(n=>({...n,[k]:e.target.value}))}
                  style={{width:"100%",background:"#1A2E4A",border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 12px",color:ADM.white,fontSize:13,outline:"none"}}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={maakAan} style={{background:ADM.teal,color:ADM.navyDeep,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Aanmaken</button>
            <button onClick={()=>setShowForm(false)} style={{background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer"}}>Annuleer</button>
          </div>
        </div>
      )}
      <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>{["Rapport","Klant","Type","Datum","Formaat","Status",""].map(h=>(
              <th key={h} style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:ADM.muted,padding:"12px 20px",textAlign:"left",fontWeight:600,borderBottom:`1px solid ${ADM.border}`}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rapporten.map(r=>(
              <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td style={{padding:"14px 20px",fontWeight:600,color:ADM.white}}>{r.titel}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.muted}}>{r.klant}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.muted}}>{r.type}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.muted}}>{r.datum}</td>
                <td style={{padding:"14px 20px",fontSize:13,color:ADM.muted}}>{r.formaat}</td>
                <td style={{padding:"14px 20px"}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                    background:`${statusColor(r.status)}22`,color:statusColor(r.status)}}>{r.status}</span>
                </td>
                <td style={{padding:"14px 20px"}}>
                  {r.status==="Gereed" && <span style={{fontSize:12,color:ADM.teal,cursor:"pointer",fontWeight:600}}>↓ Download</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD HOME
// ─────────────────────────────────────────────
function DashboardHome() {
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
        {[
          ["Actieve klanten","1","🏢","🎯 Doel: 5 in 2026",ADM.teal],
          ["Teams actief","1","👥","↑ Evides traject loopt",ADM.teal],
          ["Respondenten","9","📋","✓ T0 nulmeting compleet",ADM.teal],
          ["Gem. teamscore","3.6","📊","● Oranje zone",ADM.orange],
        ].map(([label,val,icon,sub,subColor],i) => (
          <div key={i} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,padding:"22px 24px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:ADM.teal,borderRadius:"14px 14px 0 0"}}/>
            <div style={{position:"absolute",top:20,right:20,fontSize:24,opacity:0.15}}>{icon}</div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1.5px",color:ADM.muted,marginBottom:10}}>{label}</div>
            <div style={{fontSize:34,fontWeight:700,color:i===3?ADM.orange:ADM.white,lineHeight:1,marginBottom:8}}>{val}</div>
            <div style={{fontSize:12,color:subColor}}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"18px 24px 14px",borderBottom:`1px solid ${ADM.border}`}}>
          <div style={{fontSize:15,fontWeight:600,color:ADM.white}}>Recente activiteit</div>
        </div>
        {[
          ["✓",ADM.green,"Evides","T0 nulmeting afgerond (9/9 ingevuld)","2 dagen geleden"],
          ["📄",ADM.teal,"Evides","Rapportage gegenereerd","3 dagen geleden"],
          ["📅",ADM.orange,"Prospect A","Intake-afspraak ingepland","5 dagen geleden"],
          ["🏢",ADM.green,"Evides","Toegevoegd als klant","3 weken geleden"],
        ].map(([icon,color,org,text,time],i) => (
          <div key={i} style={{padding:"13px 24px",display:"flex",gap:14,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,background:`${color}22`,color}}>{icon}</div>
            <div>
              <div style={{fontSize:13.5,color:ADM.text,lineHeight:1.4}}>
                {org && <strong style={{color:ADM.white}}>{org} — </strong>}{text}
              </div>
              <div style={{fontSize:11,color:ADM.muted,marginTop:3}}>{time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD SHELL
// ─────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const isMobile = useIsMobile();

  const [nieuwAanvragenCount, setNieuwAanvragenCount] = useState(0);

  useEffect(() => {
    const laadNieuwAantal = async () => {
      try {
        const snap = await getDocs(collection(db, "contactaanvragen"));
        const count = snap.docs.filter(d => (d.data().status || "Nieuw") === "Nieuw").length;
        setNieuwAanvragenCount(count);
      } catch (err) {
        console.error("Fout bij laden aantal contactaanvragen:", err);
      }
    };

    laadNieuwAantal();
  }, []);

  const navItems = [
    { label:"Dashboard",        icon:"📊", section:"Overzicht" },
    { label:"Contactaanvragen", icon:"📬", badge: nieuwAanvragenCount > 0 ? String(nieuwAanvragenCount) : null, section:null },
    { label:"Klanten",          icon:"🏢", section:null },
    { label:"Scans",            icon:"📝", section:"Trajecten" },
    { label:"Metingen",         icon:"📋", section:null },
    { label:"Rapportages",      icon:"📈", section:null },
    { label:"Instellingen",     icon:"⚙",  section:"Systeem" },
  ];

  const renderPage = () => {
    if (activeNav === "Contactaanvragen") return <PageContactaanvragen />;
    if (activeNav === "Klanten")          return <PageKlanten />;
    if (activeNav === "Scans")            return <PageScans />;
    if (activeNav === "Metingen")         return <PageMetingen />;
    if (activeNav === "Rapportages")      return <PageRapportages />;
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
          {[["📊","Dashboard"],["📬","Contactaanvragen"],["📝","Scans"],["📋","Metingen"],["📈","Rapportages"]].map(([icon,label])=>(
            <div key={label} onClick={()=>setActiveNav(label)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 8px",cursor:"pointer",
                color:activeNav===label?ADM.teal:ADM.muted,
                borderTop:`2px solid ${activeNav===label?ADM.teal:"transparent"}`,minWidth:52}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:activeNav===label?700:400,whiteSpace:"nowrap"}}>
                {label==="Contactaanvragen"?"Aanvragen":label==="Rapportages"?"Rapporten":label}
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

        setView((v) => (v === "login" ? "admin" : v));
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

  return (
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
}
