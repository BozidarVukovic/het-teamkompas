import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ContactModal from "./ContactModal";
import KompasDot from "./components/shared/KompasDot";

const C = { donker: "#0D1B2A", navy: "#1A2E4A", teal: "#0F766E", groen: "#2F8F3A", blauw: "#3A7DBF", oranje: "#E8821A", paars: "#6B4E9E", wit: "#FFFFFF", licht: "#F4F7F9", lijn: "#DDE4ED", sub: "#5F6B7A" };
function useIsMobile(){ const [m,setM]=React.useState(false); React.useEffect(()=>{const f=()=>setM(window.innerWidth<820); f(); window.addEventListener("resize",f); return()=>window.removeEventListener("resize",f);},[]); return m; }

export default function Verkennen(){
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const steps = [
    ["1", "Kennismaking", "We verkennen de situatie, de context en wat het team nodig heeft."],
    ["2", "Teamscan", "We halen veilig op wat teamleden ervaren in samenwerking, leiderschap, energie en leren."],
    ["3", "Analyse", "We vertalen patronen naar betekenis: wat speelt er echt en waar zit beweging?"],
    ["4", "Teamdag of interventie", "We maken de stap van inzicht naar gesprek, gedrag en concrete afspraken."],
    ["5", "Borging", "We zorgen dat de beweging niet stopt na één sessie."],
  ];
  const themes = ["wat wordt niet uitgesproken?", "waar lekt energie weg?", "welk leiderschap is nu nodig?", "welke kleine stap geeft direct beweging?"];
  return (
    <HelmetProvider>
      <Helmet>
        <title>Persoonlijk teamtraject | Mijn Teamkompas</title>
        <meta name="description" content="Bouw vertrouwen op met een persoonlijk teamtraject van Mijn Teamkompas: kennismaking, teamscan, analyse, teamdag en borging." />
      </Helmet>
      <div style={{fontFamily:"Roboto, sans-serif", background:C.wit, color:C.donker, minHeight:"100vh"}}>
        <header style={{position:"sticky", top:0, zIndex:10, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${C.lijn}`}}>
          <div style={{maxWidth:1180, margin:"0 auto", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16}}>
            <div onClick={()=>navigate("/")} style={{fontWeight:900, fontSize:20, cursor:"pointer", color:C.donker, display:"flex", alignItems:"center", gap:9}}><KompasDot size={22}/>Mijn Teamkompas</div>
            <div style={{display:"flex", gap:10, alignItems:"center"}}>
              <button onClick={()=>navigate("/teamscan")} style={{background:"transparent", border:`1px solid ${C.lijn}`, color:C.donker, borderRadius:10, padding:"10px 14px", fontWeight:800, cursor:"pointer"}}>Digitale teamscan</button>
              <button onClick={()=>setOpen(true)} style={{background:C.teal, border:"none", color:C.wit, borderRadius:10, padding:"10px 16px", fontWeight:900, cursor:"pointer"}}>Plan gesprek</button>
            </div>
          </div>
        </header>

        <section style={{background:C.donker, color:C.wit, padding:isMobile?"58px 22px":"88px 60px", position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"30px 30px"}} />
          <div style={{maxWidth:1180, margin:"0 auto", display:"grid", gridTemplateColumns:isMobile?"1fr":"1.02fr .98fr", gap:40, alignItems:"center", position:"relative"}}>
            <div>
              <div style={{fontSize:12, fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", color:"#5A8C3C", marginBottom:14}}>Klantreis 1: persoonlijk traject</div>
              <h1 style={{fontSize:isMobile?36:58, lineHeight:1.04, margin:"0 0 18px", letterSpacing:"-0.03em"}}>Bouw eerst vertrouwen op voordat je een team in beweging brengt.</h1>
              <p style={{fontSize:isMobile?16:18, lineHeight:1.75, color:"rgba(255,255,255,0.72)", maxWidth:680}}>Voor teams waar samenwerking schuurt, gesprekken blijven liggen of verandering niet goed landt. We starten niet met een standaardoplossing, maar met een zorgvuldige verkenning van wat er echt speelt.</p>
              <div style={{display:"flex", flexDirection:isMobile?"column":"row", gap:12, marginTop:28}}>
                <button onClick={()=>setOpen(true)} style={{background:C.groen, color:C.wit, border:"none", borderRadius:12, padding:"15px 20px", fontWeight:900, cursor:"pointer"}}>Plan een verkennend gesprek</button>
                <button onClick={()=>navigate("/")} style={{background:"rgba(255,255,255,0.06)", color:C.wit, border:"1px solid rgba(255,255,255,0.22)", borderRadius:12, padding:"15px 20px", fontWeight:800, cursor:"pointer"}}>Terug naar overzicht</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:24, padding:isMobile?22:30}}>
              <div style={{fontSize:20, fontWeight:900, marginBottom:16}}>Vooral passend als:</div>
              {themes.map((t,i)=><div key={t} style={{display:"flex", gap:12, alignItems:"flex-start", padding:"14px 0", borderTop:i?"1px solid rgba(255,255,255,0.10)":"none"}}><span style={{color:"#5A8C3C", fontWeight:900}}>✓</span><span style={{color:"rgba(255,255,255,0.78)", lineHeight:1.55}}>{t}</span></div>)}
            </div>
          </div>
        </section>

        <section style={{padding:isMobile?"54px 22px":"82px 60px", background:C.licht}}>
          <div style={{maxWidth:1180, margin:"0 auto"}}>
            <div style={{maxWidth:760, marginBottom:28}}>
              <div style={{fontSize:12, fontWeight:900, letterSpacing:"0.16em", color:C.groen, textTransform:"uppercase", marginBottom:10}}>Werkwijze</div>
              <h2 style={{fontSize:isMobile?30:44, lineHeight:1.12, margin:"0 0 12px"}}>Van eerste contact naar verdiepend teamtraject.</h2>
              <p style={{fontSize:16, lineHeight:1.75, color:C.sub}}>De route is bewust eenvoudig gehouden. De diepgang ontstaat in de analyse en begeleiding, niet in een ingewikkeld proces.</p>
            </div>
            <div style={{display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(5,1fr)", gap:14}}>
              {steps.map(([nr,titel,tekst])=><div key={titel} style={{background:C.wit, border:`1px solid ${C.lijn}`, borderRadius:18, padding:20, minHeight:190, boxShadow:"0 14px 34px rgba(13,27,42,0.06)"}}><div style={{width:36,height:36,borderRadius:"50%",background:C.groen,color:C.wit,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,marginBottom:14}}>{nr}</div><div style={{fontSize:18,fontWeight:900,marginBottom:8}}>{titel}</div><div style={{fontSize:14,lineHeight:1.65,color:C.sub}}>{tekst}</div></div>)}
            </div>
          </div>
        </section>

        <section style={{padding:isMobile?"50px 22px":"72px 60px", background:C.teal, color:C.wit, textAlign:"center"}}>
          <div style={{maxWidth:860, margin:"0 auto"}}>
            <h2 style={{fontSize:isMobile?30:42, lineHeight:1.14, margin:"0 0 12px"}}>Wil je eerst samen scherp krijgen wat er speelt?</h2>
            <p style={{fontSize:16, lineHeight:1.75, opacity:.9, margin:"0 auto 24px"}}>In 30 minuten verkennen we jullie situatie, zonder verplichting. Daarna weet je of een teamscan, teamdag of ander traject logisch is.</p>
            <button onClick={()=>setOpen(true)} style={{background:C.wit, color:C.teal, border:"none", borderRadius:12, padding:"15px 22px", fontWeight:900, cursor:"pointer"}}>Plan een verkennend gesprek</button>
          </div>
        </section>
        <ContactModal isOpen={open} onClose={()=>setOpen(false)} bron="Verkennend gesprek pagina" interesse="Verkennend gesprek" />
      </div>
    </HelmetProvider>
  );
}
