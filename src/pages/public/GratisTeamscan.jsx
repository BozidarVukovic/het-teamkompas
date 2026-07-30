import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import { FREE_SCAN_QUESTIONS, FREE_SCAN_SCALE, FREE_SCAN_THEMES, FREE_SCAN_VERSION, REPORT_META } from "../../data/freeScanConfig";
import { calculateFreeScanResults } from "../../lib/freeScanScoring";
import "../../styles/free-scan.css";

const STORAGE_KEY = `teamkompas-gratis-scan-${FREE_SCAN_VERSION}`;
const emit = (name, data={}) => window.dispatchEvent(new CustomEvent("teamkompas:analytics", { detail:{ name, ...data } }));

// De server rekent de scores en is daarin leidend, maar stuurt geen kleuren mee.
// We halen de themakleur daarom hier uit de lokale configuratie, anders blijven
// de balken onzichtbaar (background: undefined).
const themeColor = (id) => FREE_SCAN_THEMES.find((t) => t.id === id)?.color || "var(--tk-color-teal)";

// Vult de door de server berekende scores aan met de inhoudelijke velden uit de
// lokale configuratie (kleur, achtergrond, duiding, kennispagina). De server
// blijft leidend voor de score zelf.
const verrijk = (result) => {
  if (!result?.themeScores) return result;
  const bij = (t) => ({ ...(FREE_SCAN_THEMES.find((x) => x.id === t.id) || {}), ...t });
  return {
    ...result,
    themeScores: result.themeScores.map(bij),
    strengths: (result.strengths || []).map(bij),
    opportunities: (result.opportunities || []).map(bij),
  };
};

function ScoreOverview({ result }) {
  return <div className="free-score-list" aria-label="Themascores">{result.themeScores.map(theme=><div className="free-score" key={theme.id}><div><strong>{theme.label}</strong><span>{theme.zone?.label || "Geen score"}</span></div><div className="free-score-track"><i role="img" aria-label={`${theme.label}: ${theme.score ?? "geen"} van 100`} style={{width:`${theme.score || 0}%`,background:themeColor(theme.id)}} /></div><b>{theme.score ?? "–"}</b></div>)}</div>;
}

export function GratisTeamscanReport() {
  const { token } = useParams(); const [state,setState]=useState({loading:true});
  useEffect(()=>{ httpsCallable(getFunctions(),"getFreeScanReport")({token}).then(r=>setState({report:r.data})).catch(()=>setState({error:"Deze rapportlink is ongeldig of verlopen."})); },[token]);
  if(state.loading) return <main className="free-shell"><p>Rapport laden…</p></main>;
  if(state.error) return <main className="free-shell"><Helmet><meta name="robots" content="noindex,nofollow" /></Helmet><h1>Rapport niet beschikbaar</h1><p>{state.error}</p></main>;
  const { participant, completedAt, questionnaireVersion } = state.report;
  const result = verrijk(state.report.result);
  const datum = new Date(completedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  // Laagste score eerst: dat is de meest logische plek om te beginnen.
  const prioriteit = [...result.themeScores].filter((t) => t.score !== null).sort((a, b) => a.score - b.score);
  const laagste = prioriteit[0];

  return (
    <main className="free-shell free-report">
      <Helmet>
        <title>Jouw persoonlijke Teamkompas</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="free-report__cover">
        <div>
          <span className="free-eyebrow">Luisteren · Meten · Bewegen</span>
          <h1>Persoonlijk Teamkompas</h1>
          <p className="free-report__lead">Een beeld van hoe jij de samenwerking in jouw team ervaart, met per domein een duiding, een reflectievraag en een eerste stap.</p>
        </div>
        <dl className="free-report__meta">
          <div><dt>Opgesteld voor</dt><dd>{participant.firstName}</dd></div>
          <div><dt>Datum</dt><dd>{datum}</dd></div>
          <div><dt>Instrument</dt><dd>Gratis individuele teamscan</dd></div>
          <div><dt>Versie</dt><dd>Vragenlijst {questionnaireVersion} · rapport {REPORT_META.version}</dd></div>
        </dl>
        <button type="button" className="free-report__print" onClick={() => window.print()}>Rapport printen of opslaan als pdf</button>
      </header>

      {/* 01 ---------------------------------------------------------------- */}
      <section>
        <p className="free-report__num">01</p>
        <h2>Overzicht</h2>
        <p>Hieronder staan je scores op de zes domeinen. De score loopt van 0 tot 100 en beschrijft jouw eigen beleving, niet de prestatie van het team.</p>
        <ScoreOverview result={result} />

        <div className="free-report__grid">
          <article className="free-theme">
            <h3>Hoe je deze scores leest</h3>
            <p>{REPORT_META.scale}</p>
            <ul className="free-zone-list">
              {REPORT_META.zones.map((z) => (
                <li key={z.id}><span className={`free-zone free-zone--${z.id}`}>{z.label}</span><b>{z.range}</b><p>{z.text}</p></li>
              ))}
            </ul>
          </article>
          <article className="free-theme">
            <h3>Eerste duiding</h3>
            <p>Je sterkste domein is <strong>{result.strengths[0]?.label}</strong> met een score van {result.strengths[0]?.score}. De grootste ontwikkelkans zit bij <strong>{laagste?.label}</strong> met {laagste?.score}.</p>
            <p>Het verschil tussen die twee is {Math.abs((result.strengths[0]?.score ?? 0) - (laagste?.score ?? 0))} punten. Een groot verschil wijst er vaak op dat één domein de rest afremt. Liggen de scores dicht bij elkaar, dan is het beeld gelijkmatiger en kun je kiezen waar je begint.</p>
          </article>
        </div>
      </section>

      {/* 02 ---------------------------------------------------------------- */}
      <section>
        <p className="free-report__num">02</p>
        <h2>Leidende inzichten</h2>
        <div className="free-report__grid">
          <article className="free-theme">
            <h3>Je sterke basis</h3>
            <ul className="free-theme-list">{result.strengths.map((t) => <li key={t.id}><span style={{ background: themeColor(t.id) }} aria-hidden="true" />{t.label}<b>{t.score}</b></li>)}</ul>
            <p>Benoem dit expliciet in je team. Wat goed werkt blijft vaak onbesproken, waardoor het ook makkelijk verdwijnt.</p>
          </article>
          <article className="free-theme">
            <h3>Je ontwikkelkansen</h3>
            <ul className="free-theme-list">{result.opportunities.map((t) => <li key={t.id}><span style={{ background: themeColor(t.id) }} aria-hidden="true" />{t.label}<b>{t.score}</b></li>)}</ul>
            <p>Begin bij één van deze twee. Twee domeinen tegelijk aanpakken levert meestal minder op dan één stap die je echt volhoudt.</p>
          </article>
        </div>

        {result.patterns?.length > 0 && (
          <>
            <h3 className="free-report__sub">Patronen in jouw antwoorden</h3>
            <p>Deze combinaties vallen op omdat een hoge en een lage score elkaar hier beïnvloeden.</p>
            {result.patterns.map((p) => (
              <article className="free-theme free-theme--pattern" key={p.id}><h4>{p.title}</h4><p>{p.text}</p></article>
            ))}
          </>
        )}
      </section>

      {/* 03 ---------------------------------------------------------------- */}
      <section>
        <p className="free-report__num">03</p>
        <h2>Domeinanalyse</h2>
        <p>Per domein: wat het betekent, waar het inhoudelijk op rust, wat jouw score kan suggereren en welke stap je kunt zetten.</p>
        {result.themeScores.map((t) => (
          <article className="free-theme free-theme--domain" key={t.id}>
            <div className="free-theme__head">
              <span className="free-theme__dot" style={{ background: themeColor(t.id) }} aria-hidden="true" />
              <h3>{t.label}</h3>
              <span className={`free-zone free-zone--${t.zone?.id || "attention"}`}>{t.zone?.label}</span>
              <b>{t.score ?? "–"}<small>/100</small></b>
            </div>
            <p className="free-theme__desc">{t.description}</p>
            {t.theory && <p><strong>Achtergrond.</strong> {t.theory}</p>}
            {(t.score >= 75 ? t.whenHigh : t.whenLow) && (
              <p><strong>Wat jouw score kan betekenen.</strong> {t.score >= 75 ? t.whenHigh : t.whenLow}</p>
            )}
            <div className="free-theme__actions">
              <div><span>Reflectievraag</span><p>{t.reflection}</p></div>
              <div><span>Klein experiment</span><p>{t.experiment}</p></div>
            </div>
            {t.knowledge && <p className="free-theme__link"><a href={t.knowledge.href}>Meer over {t.knowledge.label.toLowerCase()} →</a></p>}
          </article>
        ))}
      </section>

      {/* 04 ---------------------------------------------------------------- */}
      <section>
        <p className="free-report__num">04</p>
        <h2>Vervolgstappen</h2>
        <h3 className="free-report__sub">Prioritering op basis van jouw scores</h3>
        <table className="free-table">
          <thead><tr><th>#</th><th>Domein</th><th>Score</th><th>Zone</th></tr></thead>
          <tbody>
            {prioriteit.map((t, i) => (
              <tr key={t.id}><td>{i + 1}</td><td><span className="free-theme__dot" style={{ background: themeColor(t.id) }} aria-hidden="true" />{t.label}</td><td>{t.score}</td><td>{t.zone?.label}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="free-report__note">Deze volgorde is een suggestie op basis van je scores. Wat werkelijk het meeste oplevert, hangt af van wat er in jouw team speelt.</p>

        <h3 className="free-report__sub">Een ritme voor de komende negentig dagen</h3>
        <ol className="free-horizon">
          {REPORT_META.horizon.map(([wanneer, wat]) => (
            <li key={wanneer}><span>{wanneer}</span><p>{wat}</p></li>
          ))}
        </ol>

        <h3 className="free-report__sub">Het gesprek aangaan</h3>
        <p>Deze scan krijgt pas waarde wanneer je erover praat. Je hoeft de scores niet te delen om het gesprek te openen. Een vraag werkt vaak beter dan een cijfer.</p>
        <ul className="free-bullets">
          <li>"Ik heb nagedacht over onze samenwerking. Mag ik één ding met je bespreken dat me opviel?"</li>
          <li>"Wat zou jij noemen als het domein waar wij als team het meeste te winnen hebben?"</li>
          <li>"Wat heb je van mij nodig om {laagste ? laagste.label.toLowerCase() : "dit onderwerp"} makkelijker te maken?"</li>
        </ul>
      </section>

      {/* Verantwoording ---------------------------------------------------- */}
      <section className="free-report__small">
        <h2>Verantwoording en grenzen</h2>
        {REPORT_META.limits.map(([titel, tekst]) => (
          <p key={titel}><strong>{titel}.</strong> {tekst}</p>
        ))}
        <p><strong>Bewaartermijn.</strong> Deze rapportlink is tijdelijk beschikbaar. Bewaar het rapport zelf als je het langer wilt kunnen inzien, bijvoorbeeld via de printknop bovenaan.</p>
      </section>

      <section className="free-cta">
        <h2>Van één perspectief naar een teambeeld</h2>
        <p>Dit rapport laat zien hoe jij het ervaart. De volledige Teamscan brengt de beleving van alle teamleden samen en maakt het verschil tussen team en leidinggevende zichtbaar. Dat verschil is meestal het meest waardevolle gespreksonderwerp.</p>
        <a className="tk-button tk-button-primary" href="/teamscan" onClick={() => emit("free_scan_report_full_scan_click")}>Ontdek de volledige Teamscan</a>
      </section>
    </main>
  );
}

export default function GratisTeamscan() {
  const saved=useMemo(()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return{}}},[]);
  const [phase,setPhase]=useState(saved.phase||"landing"), [index,setIndex]=useState(saved.index||0), [answers,setAnswers]=useState(saved.answers||{}), [sessionId,setSessionId]=useState(saved.sessionId||"");
  const [person,setPerson]=useState({firstName:"",email:"",role:"",organisation:"",teamSize:"",consentProcessing:false,consentMarketing:false,hp:""}); const [busy,setBusy]=useState(false),[error,setError]=useState(""),[outcome,setOutcome]=useState(null);
  useEffect(()=>{if(phase==="scan") localStorage.setItem(STORAGE_KEY,JSON.stringify({phase,index,answers,sessionId}));},[phase,index,answers,sessionId]);
  useEffect(()=>{emit("free_scan_page_view")},[]);
  async function start(){setError("");setBusy(true);try{const r=await httpsCallable(getFunctions(),"startFreeScan")({source:document.referrer||"direct",utm:Object.fromEntries(new URLSearchParams(location.search))});setSessionId(r.data.sessionId);setPhase("scan");emit("free_scan_started")}catch{setError("Starten lukt nu niet. Probeer het over een moment opnieuw.")}finally{setBusy(false)}}
  function choose(value){setAnswers(a=>({...a,[FREE_SCAN_QUESTIONS[index].id]:value}));}
  function next(){if(!answers[FREE_SCAN_QUESTIONS[index].id])return setError("Kies eerst het antwoord dat het beste past.");setError("");if(index===FREE_SCAN_QUESTIONS.length-1)setPhase("details");else{const ni=index+1;setIndex(ni);[6,12,18].includes(ni)&&emit("free_scan_progress",{percent:Math.round(ni/24*100)})}}
  async function finish(e){e.preventDefault();setError("");if(!person.consentProcessing)return setError("Toestemming voor het rapport is nodig om af te ronden.");setBusy(true);try{const local=calculateFreeScanResults(answers);const r=await httpsCallable(getFunctions(),"completeFreeScan")({sessionId,answers,participant:person,questionnaireVersion:FREE_SCAN_VERSION});setOutcome({...local,...r.data.result,reportUrl:r.data.reportUrl,emailStatus:r.data.emailStatus});localStorage.removeItem(STORAGE_KEY);setPhase("result");emit("free_scan_completed")}catch(err){setError(err?.message||"Opslaan of verzenden is niet gelukt. Je antwoorden blijven op dit apparaat bewaard.")}finally{setBusy(false)}}
  const meta=<Helmet><title>Gratis teamscan | Mijn Teamkompas</title><meta name="description" content="Ontdek in 8 tot 10 minuten hoe jij de samenwerking in jouw team ervaart en ontvang direct jouw persoonlijke Teamkompas."/><link rel="canonical" href="https://www.mijnteamkompas.nl/gratis-teamscan"/><meta property="og:title" content="Gratis persoonlijke teamscan | Mijn Teamkompas"/></Helmet>;
  if(phase==="landing")return <main className="free-page">{meta}<section className="free-hero"><div><span className="free-eyebrow">Gratis individuele teamscan</span><h1>Ontdek hoe jij de samenwerking binnen jouw team ervaart</h1><p>Beantwoord 24 vragen over veiligheid, communicatie, eigenaarschap, verbinding, energie en leiderschap. Je krijgt direct inzicht en een persoonlijk rapport.</p><ul><li>Gratis deelname</li><li>8–10 minuten</li><li>Persoonlijk en vertrouwelijk</li><li>Direct inzicht</li></ul><button className="tk-button tk-button-primary" disabled={busy} onClick={start}>{busy?"Even geduld…":"Start de gratis teamscan"}</button>{error&&<p role="alert" className="free-error">{error}</p>}</div><aside><b>Jouw perspectief staat centraal</b><p>De uitkomst is geen oordeel over het hele team. Je herkent sterke punten, mogelijke patronen en een concrete eerste beweging.</p></aside></section><section className="free-content"><h2>Luisteren. Meten. Bewegen.</h2><div className="free-cards">{FREE_SCAN_THEMES.map(t=><article key={t.id}><i style={{background:t.color}}/><h3>{t.label}</h3><p>{t.description}</p></article>)}</div><div className="free-info"><article><h2>Wat ontvang je?</h2><p>Een directe samenvatting, een beveiligd persoonlijk webrapport, reflectievragen en kleine experimenten die je binnen één of twee weken kunt proberen.</p></article><article><h2>Hoe gaan we met gegevens om?</h2><p>We vragen pas na de vragen om je voornaam en e-mailadres. Verwerking voor het rapport en commerciële communicatie hebben aparte, niet vooraf aangevinkte toestemmingen. Lees onze <a href="/privacyverklaring_mijnteamkompas.pdf">privacyverklaring</a>.</p></article></div><details><summary>Wat is het verschil met de volledige Teamscan?</summary><p>Deze gratis scan toont één persoonlijke beleving. De volledige scan vergelijkt veilig de perspectieven van meerdere teamleden en vormt een basis voor het teamgesprek.</p></details><button className="tk-button tk-button-primary" onClick={start}>Start mijn scan</button></section></main>;
  if(phase==="scan"){const question=FREE_SCAN_QUESTIONS[index];return <main className="free-shell">{meta}<Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><div className="free-progress"><span>Vraag {index+1} van {FREE_SCAN_QUESTIONS.length}</span><progress max={FREE_SCAN_QUESTIONS.length} value={index+1}/></div><section className="free-question"><span>{FREE_SCAN_THEMES.find(t=>t.id===question.theme).label}</span><h1>{question.text}</h1><fieldset><legend className="sr-only">Kies één antwoord</legend>{FREE_SCAN_SCALE.map(o=><label key={o.value} className={answers[question.id]===o.value?"selected":""}><input type="radio" name={question.id} checked={answers[question.id]===o.value} onChange={()=>choose(o.value)}/><b>{o.value}</b>{o.label}</label>)}</fieldset>{error&&<p role="alert" className="free-error">{error}</p>}<div className="free-actions"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Terug</button><button className="tk-button tk-button-primary" onClick={next}>{index===23?"Naar jouw rapport":"Volgende"}</button></div></section></main>}
  if(phase==="details")return <main className="free-shell"><Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><form className="free-form" onSubmit={finish}><span className="free-eyebrow">Je bent er bijna</span><h1>Nog een paar gegevens en je uitslag staat klaar</h1><p>We vragen alleen wat nodig is. Organisatie, rol en teamgrootte zijn optioneel.</p><label>Voornaam *<input required value={person.firstName} onChange={e=>setPerson({...person,firstName:e.target.value})}/></label><label>E-mailadres *<input required type="email" value={person.email} onChange={e=>setPerson({...person,email:e.target.value})}/></label><div className="free-form-grid"><label>Organisatie<input value={person.organisation} onChange={e=>setPerson({...person,organisation:e.target.value})}/></label><label>Functierol<input value={person.role} onChange={e=>setPerson({...person,role:e.target.value})}/></label></div><input className="free-hp" tabIndex="-1" autoComplete="off" value={person.hp} onChange={e=>setPerson({...person,hp:e.target.value})}/><label className="free-check"><input type="checkbox" checked={person.consentProcessing} onChange={e=>setPerson({...person,consentProcessing:e.target.checked})}/> Ik geef toestemming om mijn antwoorden te verwerken, mijn rapport tijdelijk op te slaan zodat ik het kan bekijken. *</label><label className="free-check"><input type="checkbox" checked={person.consentMarketing} onChange={e=>setPerson({...person,consentMarketing:e.target.checked})}/> Ik ontvang graag af en toe inspiratie van Mijn Teamkompas (optioneel).</label>{error&&<p role="alert" className="free-error">{error}</p>}<div className="free-actions"><button type="button" onClick={()=>setPhase("scan")}>Terug</button><button className="tk-button tk-button-primary" disabled={busy}>{busy?"Rapport wordt gemaakt…":"Bekijk mijn uitslag"}</button></div></form></main>;
  return <main className="free-shell free-result"><Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><span className="free-eyebrow">Dank je wel</span><h1>Dit is jouw persoonlijke Teamkompas</h1><p>Dit beeld weerspiegelt jouw beleving en is geen oordeel over het hele team.</p><ScoreOverview result={outcome}/><div className="free-cards"><article><h2>Jouw sterke basis</h2><ul className="free-theme-list">{outcome.strengths.map(x=><li key={x.id}><span style={{background:themeColor(x.id)}} aria-hidden="true" />{x.label}<b>{x.score}</b></li>)}</ul></article><article><h2>Ontwikkelkans</h2><ul className="free-theme-list">{outcome.opportunities.map(x=><li key={x.id}><span style={{background:themeColor(x.id)}} aria-hidden="true" />{x.label}<b>{x.score}</b></li>)}</ul></article></div><blockquote>{outcome.reflections[0]}</blockquote><p><strong>Probeer deze week:</strong> {outcome.experiments[0]}</p><p className="free-notice">{outcome.emailStatus==="sent"?"Je uitgebreide rapport is per e-mail verzonden.":"Je rapport staat klaar. Open het via onderstaande knop en bewaar de link goed."}</p><div className="free-actions"><a className="tk-button tk-button-primary" href={outcome.reportUrl}>Open volledig rapport</a><a className="tk-button tk-button-secondary" href="/teamscan" onClick={()=>emit("free_scan_result_full_scan_click")}>Ontdek de volledige Teamscan</a></div></main>;
}
