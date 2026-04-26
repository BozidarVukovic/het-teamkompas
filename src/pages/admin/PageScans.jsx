import {
  isVeiligheidLeiderschapVerdieping,
  isBelevingVeranderingVerdieping,
  isEnergieMotivatieVerdieping,
  isVerbeterenLerenVerdieping,
  isGecombineerdeVerdieping,
} from "../../lib/scanUtils";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { ADM } from "../../styles/tokens";
import { getScanTemplate } from "../../data/scanData";

export default function PageScans({ ScanResultaten }) {
  const [lijsten,    setLijsten]    = useState([]);
  const [antwoorden, setAntwoorden] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [nieuw,      setNieuw]      = useState({ naam:"", klant:"", scanType:"medewerkers" });
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [gekopieerd,   setGekopieerd]   = useState(null);
  const [opslaan,      setOpslaan]      = useState(false);
  const [teVerwijderen, setTeVerwijderen] = useState(null);
  const [verwijderen,   setVerwijderen]   = useState(false);

  const laadData = async () => {
    setLoading(true);
    try {
      const [vlSnap, antSnap] = await Promise.all([
        getDocs(collection(db, "vragenlijsten")),
        getDocs(collection(db, "antwoorden")),
      ]);
      setLijsten(
        vlSnap.docs
          .map(d=>({ id:d.id, ...d.data() }))
          .filter(item => !item.verwijderd && item.status !== "Verwijderd")
      );
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
      const template = getScanTemplate(nieuw.scanType);
      const data = {
        naam:       nieuw.naam,
        klant:      nieuw.klant,
        aangemaakt: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}),
        status:     "Actief",
        type:       template.type,
        doelgroep:  template.doelgroep,
        introductietekst: template.introductietekst,
        stellingen: template.stellingen,
      };
      const ref = await addDoc(collection(db, "vragenlijsten"), data);
      setLijsten(prev => [...prev, { id:ref.id, ...data }]);
      setNieuw({ naam:"", klant:"", scanType:"medewerkers" });
      setShowForm(false);
    } catch (err) {
      console.error("Aanmaken mislukt:", err);
    } finally {
      setOpslaan(false);
    }
  };

  const verwijderScan = async () => {
    if (!teVerwijderen) return;
    setVerwijderen(true);
    try {
      await addDoc(collection(db, "prullenbak"), {
        original_id: teVerwijderen.id,
        bron_collectie: "vragenlijsten",
        naam: teVerwijderen.naam || "",
        klant: teVerwijderen.klant || "",
        type: teVerwijderen.type || "basisscan",
        status: teVerwijderen.status || "",
        aangemaakt: teVerwijderen.aangemaakt || "",
        doelgroep: teVerwijderen.doelgroep || "",
        parentVragenlijstId: teVerwijderen.parentVragenlijstId || null,
        verdiepingOnderdelen: teVerwijderen.verdiepingOnderdelen || [],
        verwijderd_op: serverTimestamp(),
        verwijderd_op_ms: Date.now(),
      });

      await updateDoc(doc(db, "vragenlijsten", teVerwijderen.id), {
        status: "Verwijderd",
        verwijderd: true,
      });

      setLijsten(prev => prev.filter(l => l.id !== teVerwijderen.id));
      setTeVerwijderen(null);
    } catch (err) {
      console.error("Verplaatsen naar prullenbak mislukt:", err);
    } finally {
      setVerwijderen(false);
    }
  };

  const kopieerLink = async (id, rolParam) => {
    const url = `${window.location.origin}?scan=${id}&rol=${rolParam}`;
    try {
      await navigator.clipboard.writeText(url);
      setGekopieerd(`${id}_${rolParam}`);
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
      {/* BEVESTIGINGSDIALOOG */}
      {teVerwijderen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(13,27,42,0.85)",
          backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:16,
            padding:"32px",maxWidth:420,width:"100%",boxShadow:"0 40px 100px rgba(0,0,0,0.6)"}}>
            <div style={{fontSize:32,marginBottom:16,textAlign:"center"}}>🗑️</div>
            <div style={{fontSize:17,fontWeight:700,color:ADM.white,marginBottom:8,textAlign:"center"}}>
              Scan verwijderen?
            </div>
            <div style={{fontSize:13,color:ADM.muted,lineHeight:1.65,marginBottom:8,textAlign:"center"}}>
              <strong style={{color:ADM.white}}>{teVerwijderen.naam}</strong>
            </div>
            {antwoordenVoor(teVerwijderen.id).length > 0 && (
              <div style={{fontSize:12,color:ADM.orange,background:"rgba(243,156,18,0.1)",
                padding:"10px 14px",borderRadius:8,marginBottom:16,textAlign:"center"}}>
                ⚠️ Deze scan heeft {antwoordenVoor(teVerwijderen.id).length} ingevulde antwoorden. Die blijven bewaard in Firestore.
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setTeVerwijderen(null)}
                style={{flex:1,background:"none",color:ADM.muted,border:`1px solid ${ADM.border}`,
                  borderRadius:8,padding:"11px",fontSize:13,cursor:"pointer"}}>
                Annuleer
              </button>
              <button onClick={verwijderScan} disabled={verwijderen}
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
          const mwResp = resp.filter(a => a.rol === "Teamlid");
          const mgResp = resp.filter(a => a.rol === "Leidinggevende");
          return (
            <div key={lijst.id} style={{background:ADM.navy,border:`1px solid ${ADM.border}`,borderRadius:12,padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <div style={{fontWeight:600,color:ADM.white,fontSize:15}}>{lijst.naam}</div>
                    {(isVeiligheidLeiderschapVerdieping(lijst) || isVerbeterenLerenVerdieping(lijst) || isEnergieMotivatieVerdieping(lijst) || isBelevingVeranderingVerdieping(lijst) || isGecombineerdeVerdieping(lijst)) && (
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,background:"rgba(15,118,110,0.14)",color:ADM.teal}}>
                        VERDIEPING
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:12,color:ADM.muted,marginBottom:10}}>
                    🏢 {lijst.klant} · 📅 {lijst.aangemaakt} · {(lijst.stellingen||[]).length} stellingen
                  </div>

                  {/* Responsstatus */}
                  <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:ADM.muted}}>
                      <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:mwResp.length>=5?ADM.green:mwResp.length>0?ADM.orange:ADM.border,marginRight:5}}/>
                      👥 Medewerkers: <strong style={{color:ADM.white}}>{mwResp.length}</strong>{mwResp.length<5?<span style={{color:ADM.orange}}> (min. 5)</span>:null}
                    </span>
                    <span style={{fontSize:12,color:ADM.muted}}>
                      <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:mgResp.length>=1?ADM.green:ADM.border,marginRight:5}}/>
                      👔 Manager: <strong style={{color:ADM.white}}>{mgResp.length}</strong>{mgResp.length===0?<span style={{color:ADM.orange}}> (nog niet)</span>:null}
                    </span>
                  </div>

                  {/* Scanlinks */}
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    <button onClick={()=>kopieerLink(lijst.id,"medewerker")}
                      style={{background:gekopieerd===`${lijst.id}_medewerker`?"rgba(46,204,113,0.15)":"rgba(90,140,60,0.12)",
                        color:gekopieerd===`${lijst.id}_medewerker`?ADM.green:"#5A8C3C",
                        border:`1px solid ${gekopieerd===`${lijst.id}_medewerker`?"rgba(46,204,113,0.4)":"rgba(90,140,60,0.3)"}`,
                        borderRadius:6,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      {gekopieerd===`${lijst.id}_medewerker` ? "✓ Gekopieerd!" : "🔗 Link medewerkers"}
                    </button>
                    <button onClick={()=>kopieerLink(lijst.id,"manager")}
                      style={{background:gekopieerd===`${lijst.id}_manager`?"rgba(46,204,113,0.15)":"rgba(107,78,158,0.12)",
                        color:gekopieerd===`${lijst.id}_manager`?ADM.green:"#6B4E9E",
                        border:`1px solid ${gekopieerd===`${lijst.id}_manager`?"rgba(46,204,113,0.4)":"rgba(107,78,158,0.3)"}`,
                        borderRadius:6,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      {gekopieerd===`${lijst.id}_manager` ? "✓ Gekopieerd!" : "🔗 Link manager"}
                    </button>
                    <button onClick={()=>setGeselecteerd(lijst)}
                      style={{background:"rgba(255,255,255,0.05)",color:ADM.muted,border:`1px solid ${ADM.border}`,
                        borderRadius:6,padding:"7px 12px",fontSize:12,cursor:"pointer"}}>
                      📊 Resultaten ({resp.length})
                    </button>
                    <button onClick={()=>exporteerScanAlsCsv(lijst, resp)} disabled={resp.length === 0}
                      style={{background:resp.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,168,150,0.12)",
                        color:resp.length === 0 ? ADM.muted : ADM.teal,
                        border:`1px solid ${resp.length === 0 ? ADM.border : "rgba(0,168,150,0.3)"}`,
                        borderRadius:6,padding:"7px 12px",fontSize:12,
                        cursor:resp.length === 0 ? "not-allowed" : "pointer",fontWeight:600}}
                      title={resp.length === 0 ? "Nog geen respondenten" : "Download alle antwoorden als CSV"}>
                      ⬇ CSV-export
                    </button>
                    <button onClick={()=>setTeVerwijderen(lijst)}
                      style={{background:"rgba(231,76,60,0.1)",color:ADM.red,border:`1px solid rgba(231,76,60,0.25)`,
                        borderRadius:6,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      🗑️ Verwijderen
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
