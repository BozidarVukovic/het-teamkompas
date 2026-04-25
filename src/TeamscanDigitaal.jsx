import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ContactModal from "./ContactModal";

const C = { donker: "#0D1B2A", navy: "#1A2E4A", teal: "#0F766E", groen: "#2F8F3A", blauw: "#0F66D0", paars: "#6B4E9E", wit: "#FFFFFF", licht: "#F4F7F9", lijn: "#DDE4ED", sub: "#5F6B7A" };
function useIsMobile(){ const [m,setM]=React.useState(false); React.useEffect(()=>{const f=()=>setM(window.innerWidth<820); f(); window.addEventListener("resize",f); return()=>window.removeEventListener("resize",f);},[]); return m; }

export default function TeamscanDigitaal(){
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const steps = [
    ["1", "Self-service aanvraag", "De klant vraagt digitaal een teamscan aan."],
    ["2", "Onboarding", "De scan wordt klaargezet met teamnaam, context en planning."],
    ["3", "Scan invullen", "Respondenten vullen de vragenlijst veilig en gestructureerd in."],
    ["4", "AI analyse", "Slimme agents herkennen patronen, signalen en aandachtspunten."],
    ["5", "Rapport en dashboard", "De uitkomsten worden vertaald naar overzicht en advies."],
    ["6", "Support optioneel", "Mijn Teamkompas kan helpen bij duiding of vervolgstappen."],
  ];
  const agents = ["AI intake agent", "AI scan coordinator", "AI reminder agent", "AI analysis agent", "AI report agent"];
  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitale teamscan | Mijn Teamkompas</title>
        <meta name="description" content="Start zelfstandig met de digitale teamscan van Mijn Teamkompas: aanvraag, scan, automatische analyse, rapport en dashboard." />
      </Helmet>
      <div style={{fontFamily:"Roboto, sans-serif", background:C.wit, color:C.donker, minHeight:"100vh"}}>
        <header style={{position:"sticky", top:0, zIndex:10, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${C.lijn}`}}>
          <div style={{maxWidth:1180, margin:"0 auto", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16}}>
            <div onClick={()=>navigate("/")} style={{fontWeight:900, fontSize:20, cursor:"pointer", color:C.donker}}>Mijn Teamkompas</div>
            <div style={{display:"flex", gap:10, alignItems:"center"}}>
              <button onClick={()=>navigate("/verkennen")} style={{background:"transparent", border:`1px solid ${C.lijn}`, color:C.donker, borderRadius:10, padding:"10px 14px", fontWeight:800, cursor:"pointer"}}>Persoonlijk traject</button>
              <button onClick={()=>setOpen(true)} style={{background:C.blauw, border:"none", color:C.wit, borderRadius:10, padding:"10px 16px", fontWeight:900, cursor:"pointer"}}>Start teamscan</button>
            </div>
          </div>
        </header>

        <section style={{background:"linear-gradient(135deg,#0D1B2A 0%, #143B68 100%)", color:C.wit, padding:isMobile?"58px 22px":"88px 60px", position:"relative", overflow:"hidden"}}>
          <div style={{maxWidth:1180, margin:"0 auto", display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:40, alignItems:"center"}}>
            <div>
              <div style={{fontSize:12, fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", color:"#7DB7FF", marginBottom:14}}>Klantreis 2: digitale self-service</div>
              <h1 style={{fontSize:isMobile?36:58, lineHeight:1.04, margin:"0 0 18px", letterSpacing:"-0.03em"}}>Start zelfstandig met inzicht in je team.</h1>
              <p style={{fontSize:isMobile?16:18, lineHeight:1.75, color:"rgba(255,255,255,0.76)", maxWidth:680}}>De digitale teamscan helpt organisaties snel en schaalbaar zichtbaar maken waar samenwerking energie geeft, waar het schuurt en welke vervolgstappen logisch zijn.</p>
              <div style={{display:"flex", flexDirection:isMobile?"column":"row", gap:12, marginTop:28}}>
                <button onClick={()=>setOpen(true)} style={{background:C.blauw, color:C.wit, border:"none", borderRadius:12, padding:"15px 20px", fontWeight:900, cursor:"pointer"}}>Start digitale teamscan</button>
                <button onClick={()=>navigate("/verkennen")} style={{background:"rgba(255,255,255,0.06)", color:C.wit, border:"1px solid rgba(255,255,255,0.22)", borderRadius:12, padding:"15px 20px", fontWeight:800, cursor:"pointer"}}>Liever persoonlijk starten</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:24, padding:isMobile?22:30}}>
              <div style={{fontSize:20, fontWeight:900, marginBottom:16}}>AI-agentlaag op de achtergrond</div>
              <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.72)",margin:"0 0 18px"}}>Slimme ondersteuning helpt bij intake, voortgang, analyse en rapportage. De technologie ondersteunt het proces, maar het doel blijft menselijk: betere gesprekken en betere samenwerking.</p>
              <div style={{display:"grid", gap:10}}>{agents.map(a=><div key={a} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"11px 13px",fontWeight:800}}>🤖 {a}</div>)}</div>
            </div>
          </div>
        </section>

        <section style={{padding:isMobile?"54px 22px":"82px 60px", background:C.licht}}>
          <div style={{maxWidth:1180, margin:"0 auto"}}>
            <div style={{maxWidth:760, marginBottom:28}}>
              <div style={{fontSize:12, fontWeight:900, letterSpacing:"0.16em", color:C.blauw, textTransform:"uppercase", marginBottom:10}}>Digitale route</div>
              <h2 style={{fontSize:isMobile?30:44, lineHeight:1.12, margin:"0 0 12px"}}>Van aanvraag naar rapport en dashboard.</h2>
              <p style={{fontSize:16, lineHeight:1.75, color:C.sub}}>Deze route is bedoeld om snel waarde te leveren, met zo min mogelijk handmatig werk en duidelijke ondersteuning waar nodig.</p>
            </div>
            <div style={{display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)", gap:14}}>
              {steps.map(([nr,titel,tekst])=><div key={titel} style={{background:C.wit, border:`1px solid ${C.lijn}`, borderRadius:18, padding:20, minHeight:170, boxShadow:"0 14px 34px rgba(13,27,42,0.06)"}}><div style={{width:36,height:36,borderRadius:"50%",background:C.blauw,color:C.wit,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,marginBottom:14}}>{nr}</div><div style={{fontSize:18,fontWeight:900,marginBottom:8}}>{titel}</div><div style={{fontSize:14,lineHeight:1.65,color:C.sub}}>{tekst}</div></div>)}
            </div>
          </div>
        </section>

        <section style={{padding:isMobile?"50px 22px":"72px 60px", background:C.blauw, color:C.wit, textAlign:"center"}}>
          <div style={{maxWidth:860, margin:"0 auto"}}>
            <h2 style={{fontSize:isMobile?30:42, lineHeight:1.14, margin:"0 0 12px"}}>Wil je de digitale teamscan klaarzetten?</h2>
            <p style={{fontSize:16, lineHeight:1.75, opacity:.9, margin:"0 auto 24px"}}>Laat je gegevens achter. Dan zetten we de juiste route klaar en bepalen we welke ondersteuning nodig is.</p>
            <button onClick={()=>setOpen(true)} style={{background:C.wit, color:C.blauw, border:"none", borderRadius:12, padding:"15px 22px", fontWeight:900, cursor:"pointer"}}>Vraag digitale teamscan aan</button>
          </div>
        </section>
        <ContactModal isOpen={open} onClose={()=>setOpen(false)} bron="Klantreis digitale teamscan" />
      </div>
    </HelmetProvider>
  );
}
