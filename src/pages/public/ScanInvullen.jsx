import KompasDot from "../../components/shared/KompasDot";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { ADM } from "../../styles/tokens";

import {
  PIJLERS,
  DEFAULT_STELLINGEN,
} from "../../data/scanData";

import {
  berekenScanScoresVoorMeting,
  isVeiligheidLeiderschapVerdieping,
  isBelevingVeranderingVerdieping,
  isEnergieMotivatieVerdieping,
  isVerbeterenLerenVerdieping,
  isGecombineerdeVerdieping,
} from "../../lib/scanUtils";

export default function ScanInvullen({ scanId }) {
  const [lijst, setLijst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stap, setStap] = useState(0);
  const [rol, setRol] = useState("");
  const [antwoorden, setAntwoorden] = useState({});
  const [ingediend, setIngediend] = useState(false);
  const [opslaan, setOpslaan] = useState(false);

  // Rol uit URL-parameter lezen (?scan=id&rol=medewerker of &rol=manager)
  const rolUitUrl = (() => {
    const params = new URLSearchParams(window.location.search);
    const r = (params.get("rol") || "").toLowerCase();
    if (r.includes("manager") || r.includes("leiding") || r.includes("management")) return "Leidinggevende";
    if (r.includes("medewerker") || r.includes("teamlid") || r.includes("werknemer")) return "Teamlid";
    return "";
  })();

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

  const normaliseerRol = (waarde) => {
    const v = String(waarde || "").toLowerCase();
    if (!v) return "";
    if (v.includes("leiding") || v.includes("manager") || v.includes("management")) return "Leidinggevende";
    if (v.includes("teamlid") || v.includes("medewerker") || v.includes("werknemer")) return "Teamlid";
    return "";
  };

  const bepaalVasteRol = (scan) => {
    if (!scan) return "";
    const expliciet =
      normaliseerRol(scan.doelgroep) ||
      normaliseerRol(scan.intendedRole) ||
      normaliseerRol(scan.rol) ||
      normaliseerRol(scan.scanDoelgroep);
    if (expliciet) return expliciet;

    const naam = String(scan.naam || "").toLowerCase();
    if (naam.includes("managementscan") || naam.includes("leidinggevende") || naam.includes("manager")) return "Leidinggevende";
    if (naam.includes("medewerkersscan") || naam.includes("medewerker") || naam.includes("teamlid")) return "Teamlid";

    const alleTekst = (scan.stellingen || [])
      .map(s => String(s.tekst || ""))
      .join(" ")
      .toLowerCase();

    const scoreManagement =
  (alleTekst.includes("medewerkers durven") ? 2 : 0) +
  (alleTekst.includes("richting mij") ? 2 : 0) +
  (alleTekst.includes("binnen mijn team") ? 1 : 0) +
  (alleTekst.includes("wat merk jij") ? 2 : 0) +
  (alleTekst.includes("wat gebeurt er nu met ideeën of signalen vanuit de werkvloer") ? 2 : 0) +
  (alleTekst.includes("ik heb goed zicht") ? 2 : 0) +
  (alleTekst.includes("waar zie je dat medewerkers zich") ? 2 : 0);

const scoreMedewerkers =
  (alleTekst.includes("ik voel me begrepen door mijn collega's") ? 2 : 0) +
  (alleTekst.includes("ik voel me veilig om mijn mening te geven") ? 2 : 0) +
  (alleTekst.includes("mijn leidinggevende nodigt uit") ? 2 : 0) +
  (alleTekst.includes("wat zou jou helpen") ? 1 : 0) +
  (alleTekst.includes("wat kost jou op dit moment het meeste energie") ? 2 : 0) +
  (alleTekst.includes("ik voel me betrokken bij veranderingen binnen mijn team") ? 2 : 0);

if (scoreManagement > scoreMedewerkers && scoreManagement >= 3) return "Leidinggevende";
if (scoreMedewerkers > scoreManagement && scoreMedewerkers >= 3) return "Teamlid";

return "";
  };

  const vasteRol = (() => {
    // Verdiepende scans: rol op basis van type — niet heuristisch bepalen
    if (isVeiligheidLeiderschapVerdieping(lijst)) return "Teamlid";
    if (isBelevingVeranderingVerdieping(lijst))   return "Teamlid";
    if (isEnergieMotivatieVerdieping(lijst))      return "Teamlid";
    // Verbeteren & Leren: heeft zowel medewerkers- als leidinggevende-vragen → rolkeuze
    if (isVerbeterenLerenVerdieping(lijst))        return "";
    // Gecombineerde verdieping: rolkeuze (kan beide bevatten)
    if (isGecombineerdeVerdieping(lijst))          return "";
    // Basisscan: gebruik url-parameter of heuristiek
    return rolUitUrl || bepaalVasteRol(lijst);
  })();

  const introTekst = (() => {
    const explicieteIntro = String(lijst?.introductietekst || lijst?.intro || "").trim();
    if (explicieteIntro) return explicieteIntro;

    // Domeinspecifieke intro per verdiepende scan
    if (isVeiligheidLeiderschapVerdieping(lijst)) {
      return "Deze verdiepende scan gaat over de mate waarin jij je leidinggevende ervaart als een veilige basis — iemand die beschikbaar is, je aanvaardt zoals je bent, empathie toont en je uitdaagt om te groeien. De scan is gebaseerd op de negen kenmerken van Secure Base Leadership. Er zijn geen goede of foute antwoorden. Jouw eerlijke beleving geeft de meeste inzicht.";
    }
    if (isBelevingVeranderingVerdieping(lijst)) {
      return "Deze verdiepende scan brengt in kaart hoe jij het leiderschap van jouw leidinggevende ervaart in relatie tot verandering. De vragen zijn gebaseerd op neurowetenschappelijke inzichten over hoe het menselijk brein optimaal functioneert — het SCARF-model. Er wordt geen naam of e-mailadres vastgelegd; de uitkomsten worden alleen op teamniveau besproken.";
    }
    if (isEnergieMotivatieVerdieping(lijst)) {
      return "Deze verdiepende scan gaat over de balans tussen wat jouw werk van je vraagt en wat het je geeft. We meten taakeisen (aspecten die energie kosten), hulpbronnen (aspecten die energie geven) en uitkomsten zoals bevlogenheid en uitputting. Dit is gebaseerd op het JD-R model. Let op: bij de taakeisen betekent een hogere score een hogere belasting. Er zijn geen goede of foute antwoorden.";
    }
    if (isVerbeterenLerenVerdieping(lijst)) {
      if (vasteRol === "Leidinggevende" || rol === "Leidinggevende") {
        return "Dit deel van de scan is bedoeld voor jou als leidinggevende. Je beoordeelt je eigen gedrag op Lean- en Agile-dimensies: klantgerichtheid, continu verbeteren, verspilling elimineren en zelforganisatie. Eerlijkheid tegenover jezelf geeft de meeste inzicht.";
      }
      return "Dit deel van de scan is bedoeld voor teamleden. Je beoordeelt hoe het team als geheel werkt op het gebied van klantfocus, continu verbeteren, procesbeheersing en samenwerking. De resultaten worden op teamniveau besproken — niet individueel.";
    }
    if (isGecombineerdeVerdieping(lijst)) {
      return "Deze gecombineerde verdiepingsscan bevat meerdere onderdelen. Op basis van jouw rol worden de relevante vragen voor jou geselecteerd. Er zijn geen goede of foute antwoorden — jouw eerlijke beleving staat centraal.";
    }

    // Basisscan
    if (vasteRol === "Teamlid") {
      return "Deze vragenlijst helpt om beter te begrijpen hoe het werken binnen jouw team wordt ervaren. Er zijn geen goede of foute antwoorden. Jouw ervaring staat centraal. De uitkomsten worden gebruikt om samen te bepalen waar verbetering het meeste effect heeft.";
    }
    if (vasteRol === "Leidinggevende") {
      return "Deze vragenlijst helpt inzicht te krijgen in waar de belangrijkste uitdagingen en ontwikkelpunten binnen het team liggen. Er zijn geen goede of foute antwoorden. Het doel is richting bepalen.";
    }
    return "Deze vragenlijst helpt om zicht te krijgen op hoe samenwerking, veiligheid, verandering, energie en verbeteren binnen het team worden ervaren.";
  })();

  useEffect(() => {
    if (vasteRol) setRol(vasteRol);
  }, [vasteRol]);

  const slaAntwoordOp = (id, waarde) => {
    setAntwoorden((prev) => ({ ...prev, [id]: waarde }));
  };

  const indienen = async () => {
    setOpslaan(true);

    try {
      await addDoc(collection(db, "antwoorden"), {
        vragenlijstId: scanId,
        klant: lijst?.klant || "",
        rol: rolUitUrl || vasteRol || rol || "Onbekend",
        antwoorden,
        ingediend_op: serverTimestamp(),
      });

      try {
        const bestaandeMetingenSnap = await getDocs(collection(db, "metingen"));
        const bestaandeMeting = bestaandeMetingenSnap.docs.find((d) => {
          const data = d.data() || {};
          return data.trajectId === scanId && (data.type === "T0 Meting" || data.type === "Nulmeting");
        });

        if (!bestaandeMeting) {
          // Eerste respondent — meting aanmaken
          const scoresVoorMeting = berekenScanScoresVoorMeting(lijst?.stellingen || DEFAULT_STELLINGEN, antwoorden);
          await addDoc(collection(db, "metingen"), {
            klant: lijst?.klant || "",
            trajectId: scanId,
            trajectNaam: lijst?.naam || "",
            type: "T0 Meting",
            datum: new Date().toLocaleDateString("nl-NL"),
            respondenten: 1,
            scores: scoresVoorMeting,
            status: "Compleet",
            bron: "Automatisch uit scan",
            aangemaakt_op: serverTimestamp(),
          });
        } else {
          // Volgende respondenten — teller ophogen en scores herberekenen over alle antwoorden
          const alleAntwoordenSnap = await getDocs(collection(db, "antwoorden"));
          const alleAntwoorden = alleAntwoordenSnap.docs
            .map(d => d.data())
            .filter(a => a.vragenlijstId === scanId);
          const stellingen = lijst?.stellingen || DEFAULT_STELLINGEN;
          // Herbereken scores gemiddeld over alle respondenten
          const pijlerMap = {};
          stellingen.filter(s => s.type === "schaal").forEach(s => {
            if (!pijlerMap[s.pijler]) pijlerMap[s.pijler] = [];
            alleAntwoorden.forEach(a => {
              const val = a.antwoorden?.[s.id];
              if (val !== undefined && val !== null && val !== "") {
                pijlerMap[s.pijler].push(parseFloat(val));
              }
            });
          });
          const avg = arr => arr.length ? Math.round((arr.reduce((a,b) => a+b, 0) / arr.length) * 10) / 10 : null;
          const herberekendScores = {
            "Veiligheid & Leiderschap": avg(pijlerMap[0] || []),
            "Beleving van Verandering":  avg(pijlerMap[1] || []),
            "Energie & Motivatie":       avg(pijlerMap[2] || []),
            "Verbeteren & Leren":        avg(pijlerMap[3] || []),
            "Gedrag (centraal)":         avg(pijlerMap[4] || []),
          };
          await updateDoc(doc(db, "metingen", bestaandeMeting.id), {
            respondenten: alleAntwoorden.length,
            scores: herberekendScores,
            datum: new Date().toLocaleDateString("nl-NL"),
          });
        }
      } catch (metingErr) {
        console.error("Automatische nulmeting opslaan mislukt:", metingErr);
      }

      setIngediend(true);
    } catch (err) {
      console.error("Fout bij opslaan:", err);
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

  const basisStellingen = lijst.stellingen || DEFAULT_STELLINGEN;
  const stellingen = basisStellingen.filter((s) => {
    if (!isGecombineerdeVerdieping(lijst) && !isVerbeterenLerenVerdieping(lijst)) return true;
    if ((isGecombineerdeVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst)) && s.doelgroep) {
      return !(vasteRol || rol) || s.doelgroep === (vasteRol || rol);
    }
    return true;
  });
  const totaal = stellingen.length;
  const huidige = stellingen[stap - 1];
  const voortgang = stap === 0 ? 0 : Math.round((stap / totaal) * 100);
  const resterend = Math.max(totaal - stap, 0);
  const actieveRol = vasteRol || rol;

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
          <div style={{fontSize:14,color:ADM.muted,lineHeight:1.7,marginBottom:16}}>
            {isVeiligheidLeiderschapVerdieping(lijst)
              ? `Verdiepende scan · ${totaal} vragen · ca. 8–12 minuten · zonder naam of e-mailadres`
              : isBelevingVeranderingVerdieping(lijst)
              ? `Verdiepende scan · ${totaal} vragen · ca. 8–12 minuten · zonder naam of e-mailadres`
              : isEnergieMotivatieVerdieping(lijst)
              ? `Verdiepende scan · ${totaal} vragen · ca. 8–12 minuten · zonder naam of e-mailadres`
              : isVerbeterenLerenVerdieping(lijst)
              ? `Verdiepende scan · ${totaal} vragen · ca. 10–15 minuten · zonder naam of e-mailadres`
              : isGecombineerdeVerdieping(lijst)
              ? `Gecombineerde verdiepende scan · ${totaal} vragen · ca. 10–18 minuten · zonder naam of e-mailadres`
              : `Deze scan bestaat uit ${totaal} vragen en duurt ongeveer 5–8 minuten. Er wordt geen naam of e-mailadres vastgelegd; de uitkomsten worden op teamniveau besproken.`}
          </div>

          <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,padding:"16px 18px",textAlign:"left"}}>
            <div style={{fontSize:11,color:ADM.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Introductie</div>
            <div style={{fontSize:14,color:ADM.text,lineHeight:1.8}}>
              {introTekst}
            </div>
          </div>
        </div>

        {vasteRol ? (
          <div style={{background:ADM.navy,border:`1px solid ${ADM.teal}`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Deze vragenlijst is bedoeld voor</div>
            <div style={{fontSize:18,fontWeight:700,color:ADM.white}}>
              {vasteRol === "Teamlid" ? "👥 Medewerkers / teamleden" : "👔 Managers / leidinggevenden"}
            </div>
          </div>
        ) : (
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 22px",marginBottom:20}}>
            <div style={{fontSize:11,color:ADM.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Wat is jouw rol?</div>
            <div style={{display:"flex",gap:10}}>
              {["Teamlid","Leidinggevende"].map(r=>(
                <div key={r} onClick={()=>setRol(r)}
                  style={{flex:1,padding:"10px",borderRadius:8,textAlign:"center",cursor:"pointer",fontSize:14,fontWeight:600,
                    border:`1px solid ${rol===r?ADM.teal:ADM.border}`,
                    background:rol===r?ADM.tealGlow:"transparent",
                    color:rol===r?ADM.teal:ADM.muted}}>
                  {r === "Teamlid" ? "👥 Teamlid" : "👔 Leidinggevende"}
                </div>
              ))}
            </div>
            {isVerbeterenLerenVerdieping(lijst) && (
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:12,padding:"10px 12px",background:"rgba(107,78,158,0.08)",borderRadius:8,borderLeft:"3px solid #6B4E9E"}}>
                <strong style={{color:"#a78bfa"}}>Teamlid:</strong> jij beantwoordt de teamspiegel-vragen over hoe het team samenwerkt en verbetert.<br/>
                <strong style={{color:"#a78bfa"}}>Leidinggevende:</strong> jij beantwoordt de zelfreflectievragen over jouw eigen Lean- en Agile-gedrag.
              </div>
            )}
            {isGecombineerdeVerdieping(lijst) && (
              <div style={{fontSize:12,color:ADM.muted,lineHeight:1.6,marginTop:12}}>
                Op basis van jouw rol worden de relevante vragen geselecteerd.
              </div>
            )}
          </div>
        )}

        <button onClick={()=>{ if(actieveRol || vasteRol) setStap(1); }}
          style={{width:"100%",background:(actieveRol || vasteRol)?ADM.teal:"rgba(0,168,150,0.3)",color:(actieveRol || vasteRol)?"#FFFFFF":"rgba(255,255,255,0.75)",
            border:"none",borderRadius:12,padding:"16px 18px",fontWeight:800,fontSize:17,letterSpacing:"0.2px",
            boxShadow:(actieveRol || vasteRol)?"0 10px 24px rgba(0,168,150,0.28)":"none",
            cursor:(actieveRol || vasteRol)?"pointer":"not-allowed"}}>
          {isVerbeterenLerenVerdieping(lijst) || isGecombineerdeVerdieping(lijst)
            ? "Start de verdiepende scan →"
            : isVeiligheidLeiderschapVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst)
              ? "Start de scan →"
              : "Start de teamscan →"}
        </button>
      </div>
    </div>
  );

  const kanDoorgaan = huidige.type==="open" || antwoorden[huidige.id] !== undefined;

  return (
    <div style={{minHeight:"100vh",background:ADM.navyDeep,display:"flex",flexDirection:"column"}}>
      <div style={{height:8,background:"rgba(255,255,255,0.08)"}}>
        <div style={{height:"100%",background:ADM.teal,width:`${voortgang}%`,transition:"width .4s",boxShadow:"0 0 16px rgba(0,168,150,0.35)"}}/>
      </div>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${ADM.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:PIJLERS[huidige.pijler]?.kleur||ADM.teal,flexShrink:0}}/>
          <span style={{fontSize:12,color:ADM.muted}}>{PIJLERS[huidige.pijler]?.naam}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{fontSize:13,color:ADM.white,fontWeight:700}}>Vraag {stap} van {totaal}</span>
          <span style={{fontSize:12,color:ADM.muted}}>{voortgang}% voltooid · nog {resterend} te gaan</span>
        </div>
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
              <div style={{display:"flex",gap:20,marginBottom:0,justifyContent:"center",alignItems:"center"}}>
                {[1,2,3,4,5].map(n=>(
                  <div key={n} onClick={()=>slaAntwoordOp(huidige.id,n)}
                    style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:20,fontWeight:700,cursor:"pointer",transition:"all .15s",
                      border:`2px solid ${antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.12)"}`,
                      background:antwoorden[huidige.id]===n?ADM.teal:"rgba(255,255,255,0.04)",
                      color:antwoorden[huidige.id]===n?ADM.navyDeep:ADM.muted,
                      transform:antwoorden[huidige.id]===n?"scale(1.06)":"scale(1)"}}>
                    {n}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:8}}>
                {[1,2,3,4,5].map(n=>(
                  <div key={n} style={{width:56,display:"flex",justifyContent:"center"}}>
                    {n===1 && <span style={{fontSize:10,color:ADM.muted,textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap"}}>Helemaal<br/>oneens</span>}
                    {n===2 && <span style={{fontSize:10,color:ADM.muted,textAlign:"center",lineHeight:1.3}}>Oneens</span>}
                    {n===3 && <span style={{fontSize:10,color:ADM.muted,textAlign:"center",lineHeight:1.3}}>Neutraal /<br/>wisselend</span>}
                    {n===4 && <span style={{fontSize:10,color:ADM.muted,textAlign:"center",lineHeight:1.3}}>Eens</span>}
                    {n===5 && <span style={{fontSize:10,color:ADM.muted,textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap"}}>Helemaal<br/>eens</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              value={antwoorden[huidige.id] || ""}
              onChange={(e)=>slaAntwoordOp(huidige.id,e.target.value)}
              rows={6}
              placeholder="Typ hier je antwoord..."
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${ADM.border}`,borderRadius:12,
                padding:"16px 18px",fontSize:15,color:ADM.white,resize:"vertical",outline:"none",lineHeight:1.6}}
            />
          )}
        </div>
      </div>
      <div style={{padding:"20px 24px",borderTop:`1px solid ${ADM.border}`,display:"flex",justifyContent:"space-between",gap:12}}>
        <button onClick={()=>setStap(stap-1)}
          style={{background:"transparent",color:ADM.muted,border:`1px solid ${ADM.border}`,borderRadius:10,padding:"12px 20px",
            fontWeight:600,fontSize:14,cursor:"pointer"}}>
          ← Vorige
        </button>

        {stap < totaal ? (
          <button onClick={()=>kanDoorgaan && setStap(stap+1)}
            style={{background:kanDoorgaan?ADM.teal:"rgba(0,168,150,0.3)",color:kanDoorgaan?"#FFFFFF":"rgba(255,255,255,0.75)",border:"none",borderRadius:10,
              padding:"12px 20px",fontWeight:800,fontSize:14,cursor:kanDoorgaan?"pointer":"not-allowed"}}>
            Volgende →
          </button>
        ) : (
          <button onClick={indienen} disabled={opslaan}
            style={{background:ADM.teal,color:"#FFFFFF",border:"none",borderRadius:10,padding:"12px 20px",
              fontWeight:800,fontSize:14,cursor:opslaan?"wait":"pointer",opacity:opslaan?0.8:1,boxShadow:"0 10px 24px rgba(0,168,150,0.22)"}}>
            {opslaan ? "Versturen..." : "Scan indienen"}
          </button>
        )}
      </div>
    </div>
  );
}