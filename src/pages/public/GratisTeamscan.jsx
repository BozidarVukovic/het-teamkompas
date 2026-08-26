import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import { FREE_SCAN_QUESTIONS, FREE_SCAN_SCALE, FREE_SCAN_THEMES, FREE_SCAN_VERSION, REPORT_META } from "../../data/freeScanConfig";
import { calculateFreeScanResults, naDubbelePunt, stelRapportSamen } from "../../lib/freeScanScoring";
import "../../styles/free-scan.css";

const STORAGE_KEY = `teamkompas-gratis-scan-${FREE_SCAN_VERSION}`;
const emit = (name, data={}) => window.dispatchEvent(new CustomEvent("teamkompas:analytics", { detail:{ name, ...data } }));

// De server rekent de scores en is daarin leidend. De duiding eromheen stelt de
// website zelf samen uit vaste tekstblokken, zodat het rapport op de site en in
// de e-mail dezelfde regels volgt en er nergens een taalmodel aan te pas komt.
const themeColor = (id) => FREE_SCAN_THEMES.find((t) => t.id === id)?.color || "var(--tk-color-teal)";

/** Een gemiddelde zoals we het in Nederland schrijven: 3,4 en niet 3.4. */
const toon = (waarde) => (waarde === null || waarde === undefined ? "–" : waarde.toFixed(1).replace(".", ","));

function ScoreOverview({ result }) {
  return <div className="free-score-list" aria-label="Domeinscores">
    {result.themeScores.map((theme) => (
      <div className="free-score" key={theme.id}>
        <div><strong>{theme.label}</strong><span>{theme.zone?.label || "Geen score"}</span></div>
        <div className="free-score-track">
          <i
            role="img"
            aria-label={`${theme.label}: ${toon(theme.getoond)} van 5`}
            style={{ width: `${theme.gemiddelde === null || theme.gemiddelde === undefined ? 0 : (theme.gemiddelde / 5) * 100}%`, background: themeColor(theme.id) }}
          />
        </div>
        <b>{toon(theme.getoond)}</b>
      </div>
    ))}
  </div>;
}

export function GratisTeamscanReport() {
  const { token } = useParams(); const [state,setState]=useState({loading:true});
  useEffect(()=>{ httpsCallable(getFunctions(),"getFreeScanReport")({token}).then(r=>setState({report:r.data})).catch(()=>setState({error:"Deze rapportlink is ongeldig of verlopen."})); },[token]);
  if(state.loading) return <main className="free-shell"><p>Rapport laden…</p></main>;
  if(state.error) return <main className="free-shell"><Helmet><meta name="robots" content="noindex,nofollow" /></Helmet><h1>Rapport niet beschikbaar</h1><p>{state.error}</p></main>;

  const { participant, completedAt, questionnaireVersion } = state.report;
  // De opgeslagen domeinscores zijn leidend; de duiding wordt hier opnieuw
  // samengesteld. Zo krijgt ook een ouder rapport de huidige teksten te zien.
  const rapport = stelRapportSamen(state.report.result.themeScores || []);
  const datum = new Date(completedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const prioriteit = rapport.themeScores.filter((t) => t.gemiddelde !== null).sort((a, b) => a.gemiddelde - b.gemiddelde);
  const kans = rapport.ontwikkelkans;

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
          <p className="free-report__lead">Een beeld van hoe jij de samenwerking in jouw team ervaart, met per domein een duiding, reflectievragen en een eerste stap.</p>
        </div>
        <dl className="free-report__meta">
          <div><dt>Opgesteld voor</dt><dd>{participant.firstName}</dd></div>
          <div><dt>Datum</dt><dd>{datum}</dd></div>
          <div><dt>Instrument</dt><dd>Gratis individuele teamscan</dd></div>
          <div><dt>Versie</dt><dd>Vragenlijst {questionnaireVersion} · rapport {REPORT_META.version}</dd></div>
        </dl>
        <button type="button" className="free-report__print" onClick={() => { emit("free_scan_report_print"); window.print(); }}>Rapport printen of opslaan als pdf</button>
      </header>

      {/* 01 · Persoonlijke introductie ------------------------------------- */}
      <section>
        <p className="free-report__num">01</p>
        <h2>Wat dit rapport is</h2>
        <p>Dit rapport laat zien hoe jij de samenwerking binnen jouw team op dit moment ervaart. De uitkomst helpt je patronen te herkennen en een passende volgende stap te kiezen. Het rapport geeft geen oordeel over jou of het volledige team.</p>
        <ul className="free-bullets">
          <li>Het gaat om een momentopname: over drie maanden kan het beeld anders zijn.</li>
          <li>Teamleden kunnen dezelfde situatie heel anders ervaren, en dat verschil is vaak de meest waardevolle informatie.</li>
          <li>Een individuele scan levert geen volledig teambeeld op.</li>
          <li>De uitkomsten zijn bedoeld voor reflectie en ontwikkeling, niet voor beoordeling.</li>
        </ul>
      </section>

      {/* 02 · Domeinscores ------------------------------------------------- */}
      <section>
        <p className="free-report__num">02</p>
        <h2>Je scores per domein</h2>
        <p>Hieronder staan je scores op de zes domeinen, op een schaal van 1 tot en met 5. De score beschrijft jouw eigen beleving en niet de prestatie van het team.</p>
        <ScoreOverview result={rapport} />

        {rapport.onvolledig.length > 0 && (
          <p className="free-report__note">Voor {rapport.onvolledig.join(" en ")} zijn te weinig vragen beantwoord om een score te berekenen. Overgeslagen vragen tellen nooit als nul mee.</p>
        )}

        <article className="free-theme">
          <h3>Hoe je deze scores leest</h3>
          <p>{REPORT_META.scale}</p>
          <ul className="free-zone-list">
            {REPORT_META.zones.map((z) => (
              <li key={z.id}><span className={`free-zone free-zone--${z.id}`}>{z.label}</span><b>{z.range}</b><p>{z.text}</p></li>
            ))}
          </ul>
        </article>

        <h3 className="free-report__sub">Wat je score per domein kan betekenen</h3>
        {rapport.themeScores.map((t) => (
          <article className="free-theme free-theme--domain" key={t.id}>
            <div className="free-theme__head">
              <span className="free-theme__dot" style={{ background: themeColor(t.id) }} aria-hidden="true" />
              <h4>{t.label}</h4>
              <span className={`free-zone free-zone--${t.zone?.id || "attention"}`}>{t.zone?.label || "Geen score"}</span>
              <b>{toon(t.getoond)}<small>/5</small></b>
            </div>
            <p className="free-theme__desc">{t.description}</p>
            {t.tekst && <p><strong>Wat jouw score kan betekenen:</strong> {naDubbelePunt(t.tekst)}</p>}
            {t.theory && <p><strong>Achtergrond.</strong> {t.theory}</p>}
            {t.knowledge && <p className="free-theme__link"><a href={t.knowledge.href}>Meer over {t.knowledge.label.toLowerCase()} →</a></p>}
          </article>
        ))}
      </section>

      {/* 03 · Wat opvalt ---------------------------------------------------- */}
      <section>
        <p className="free-report__num">03</p>
        <h2>Wat opvalt in jouw antwoorden</h2>
        {rapport.gelijkmatig && (
          <p>Je scores liggen op alle domeinen dicht bij elkaar. Er springt niets uit, in geen van beide richtingen. De volgorde hieronder zegt dan minder dan bij een beeld met grotere verschillen.</p>
        )}
        <div className="free-report__grid">
          <article className="free-theme">
            <h3>{rapport.sterkeKop}</h3>
            <ul className="free-theme-list">{rapport.strengths.map((t) => <li key={t.id}><span style={{ background: themeColor(t.id) }} aria-hidden="true" />{t.label}<b>{toon(t.getoond)}</b></li>)}</ul>
            <p>Benoem dit expliciet in je team. Wat goed werkt blijft vaak onbesproken, waardoor het ook makkelijk verdwijnt.</p>
          </article>
          {kans && (
            <article className="free-theme">
              <h3>{rapport.ontwikkelkansKop}</h3>
              <ul className="free-theme-list"><li><span style={{ background: themeColor(kans.id) }} aria-hidden="true" />{kans.label}<b>{toon(kans.getoond)}</b></li></ul>
              <p>Begin hier. Eén domein tegelijk levert meestal meer op dan een plan voor alles.</p>
            </article>
          )}
        </div>

        {rapport.patterns.length > 0 && (
          <>
            <h3 className="free-report__sub">Mogelijke samenhang</h3>
            <p>Deze combinaties vallen op in jouw antwoorden. Een patroon is een mogelijke samenhang en geen verklaring.</p>
            {rapport.patterns.map((p) => (
              <article className="free-theme free-theme--pattern" key={p.id}>
                <h4>{p.titel}</h4>
                <p>{p.duiding}</p>
              </article>
            ))}
          </>
        )}
      </section>

      {/* 04 · Wat je hiermee kunt ------------------------------------------- */}
      <section>
        <p className="free-report__num">04</p>
        <h2>Wat je hiermee kunt</h2>

        <h3 className="free-report__sub">Drie vragen om mee te beginnen</h3>
        <ol className="free-bullets">
          {rapport.reflections.map((vraag) => <li key={vraag}>{vraag}</li>)}
        </ol>

        <h3 className="free-report__sub">Twee kleine experimenten</h3>
        <div className="free-report__grid">
          {rapport.experiments.map((exp) => (
            <article className="free-theme" key={exp.id}>
              <h4>{exp.titel}</h4>
              <p className="free-theme__desc">{exp.soort === "persoonlijk" ? "Voor jezelf" : "Voor een gesprek of overleg"} · {exp.tijd} · {exp.looptijd}</p>
              <p>{exp.uitleg}</p>
              <p><strong>Eerste stap:</strong> {naDubbelePunt(exp.eersteStap)}</p>
              <p className="free-theme__link"><a href={exp.href} onClick={() => emit("free_scan_report_experiment_click")}>Zo pak je dit aan →</a></p>
            </article>
          ))}
        </div>
        <p className="free-report__note"><a href={rapport.experimentenbibliotheek.href}>{rapport.experimentenbibliotheek.label}</a> in de kennisbank.</p>

        {rapport.aanbeveling && (
          <>
            <h3 className="free-report__sub">Om verder te lezen</h3>
            <article className="free-theme">
              <h4>{rapport.aanbeveling.titel}</h4>
              <p>{rapport.aanbeveling.samenvatting}</p>
              <p><strong>Waarom dit past:</strong> {naDubbelePunt(rapport.aanbeveling.reden)}</p>
              <p className="free-theme__link"><a href={rapport.aanbeveling.href} onClick={() => emit("free_scan_report_content_click")}>Bekijken →</a></p>
            </article>
          </>
        )}

        <h3 className="free-report__sub">Prioritering op basis van jouw scores</h3>
        <table className="free-table">
          <thead><tr><th>#</th><th>Domein</th><th>Score</th><th>Categorie</th></tr></thead>
          <tbody>
            {prioriteit.map((t, i) => (
              <tr key={t.id}><td>{i + 1}</td><td><span className="free-theme__dot" style={{ background: themeColor(t.id) }} aria-hidden="true" />{t.label}</td><td>{toon(t.getoond)}</td><td>{t.zone?.label}</td></tr>
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
          <li>"Wat heb je van mij nodig om {kans ? kans.label.toLowerCase() : "dit onderwerp"} makkelijker te maken?"</li>
        </ul>
      </section>

      {/* 05 · Uitnodiging --------------------------------------------------- */}
      <section className="free-cta">
        <h2>Van één perspectief naar een teambeeld</h2>
        <p>Dit rapport laat jouw persoonlijke perspectief zien. Wil je onderzoeken hoe verschillende teamleden de samenwerking ervaren en waar beelden overeenkomen of verschillen? Met de volledige Teamscan ontstaat een gezamenlijk teambeeld dat als basis kan dienen voor dialoog en concrete vervolgstappen.</p>
        <div className="free-actions">
          <a className="tk-button tk-button-primary" href="/teamscan" onClick={() => emit("free_scan_report_full_scan_click")}>Ontdek de volledige Teamscan</a>
          <a className="tk-button tk-button-secondary" href="/verkennen" onClick={() => emit("free_scan_report_contact_click")}>Plan een vrijblijvend gesprek</a>
        </div>
      </section>

      {/* 06 · Methodische toelichting --------------------------------------- */}
      <section className="free-report__small">
        <h2>Verantwoording en grenzen</h2>
        <p>De persoonlijke teamscan is gebaseerd op inzichten uit onderzoek naar teamfunctioneren. De uitkomst is een ontwikkelgerichte indicatie van jouw persoonlijke beleving. De scan is geen formeel gevalideerd diagnostisch instrument en geeft geen volledig of representatief oordeel over het team.</p>
        {REPORT_META.limits.map(([titel, tekst]) => (
          <p key={titel}><strong>{titel}.</strong> {tekst}</p>
        ))}
        <p><strong>Bewaartermijn.</strong> Deze rapportlink is tijdelijk beschikbaar. Bewaar het rapport zelf als je het langer wilt kunnen inzien, bijvoorbeeld via de printknop bovenaan. Wil je dat je gegevens eerder worden verwijderd, mail dan naar <a href="mailto:info@mijnteamkompas.nl">info@mijnteamkompas.nl</a>.</p>

        <details className="free-details">
          <summary>Hoe deze scores precies zijn berekend</summary>
          <div>
            {REPORT_META.methode.map(([titel, tekst]) => (
              <p key={titel}><strong>{titel}.</strong> {tekst}</p>
            ))}
          </div>
        </details>
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
  async function finish(e){e.preventDefault();setError("");if(!person.consentProcessing)return setError("Toestemming voor het rapport is nodig om af te ronden.");setBusy(true);try{const lokaal=calculateFreeScanResults(answers);const r=await httpsCallable(getFunctions(),"completeFreeScan")({sessionId,answers,participant:person,questionnaireVersion:FREE_SCAN_VERSION});const serverScores=r.data.result&&r.data.result.themeScores;const rapport=serverScores&&serverScores.length?stelRapportSamen(serverScores):lokaal;setOutcome({...rapport,reportUrl:r.data.reportUrl,emailStatus:r.data.emailStatus});localStorage.removeItem(STORAGE_KEY);setPhase("result");emit("free_scan_completed")}catch(err){setError(err?.message||"Opslaan of verzenden is niet gelukt. Je antwoorden blijven op dit apparaat bewaard.")}finally{setBusy(false)}}
  const meta=<Helmet><title>Gratis teamscan | Mijn Teamkompas</title><meta name="description" content="Ontdek in 8 tot 10 minuten hoe jij de samenwerking in jouw team ervaart en ontvang direct jouw persoonlijke Teamkompas."/><link rel="canonical" href="https://www.mijnteamkompas.nl/gratis-teamscan"/><meta property="og:title" content="Gratis persoonlijke teamscan | Mijn Teamkompas"/></Helmet>;
  if(phase==="landing")return <main className="free-page">{meta}<section className="free-hero"><div><span className="free-eyebrow">Gratis individuele teamscan</span><h1>Ontdek hoe jij de samenwerking binnen jouw team ervaart</h1><p>Beantwoord 24 vragen over veiligheid, communicatie, eigenaarschap, verbinding, energie en leiderschap. Je krijgt direct inzicht en een persoonlijk rapport.</p><ul><li>Gratis deelname</li><li>8–10 minuten</li><li>Persoonlijk en vertrouwelijk</li><li>Direct inzicht</li></ul><button className="tk-button tk-button-primary" disabled={busy} onClick={start}>{busy?"Even geduld…":"Start de gratis teamscan"}</button>{error&&<p role="alert" className="free-error">{error}</p>}</div><aside><b>Jouw perspectief staat centraal</b><p>De uitkomst is geen oordeel over het hele team. Je herkent sterke punten, mogelijke patronen en een concrete eerste beweging.</p></aside></section><section className="free-content"><h2>Luisteren. Meten. Bewegen.</h2><div className="free-cards">{FREE_SCAN_THEMES.map(t=><article key={t.id}><i style={{background:t.color}}/><h3>{t.label}</h3><p>{t.description}</p></article>)}</div><div className="free-info"><article><h2>Wat ontvang je?</h2><p>Een directe samenvatting, een beveiligd persoonlijk webrapport, reflectievragen en kleine experimenten die je binnen één of twee weken kunt proberen.</p></article><article><h2>Hoe gaan we met gegevens om?</h2><p>We vragen pas na de vragen om je voornaam en e-mailadres. Verwerking voor het rapport en commerciële communicatie hebben aparte, niet vooraf aangevinkte toestemmingen. Lees onze <a href="/privacyverklaring_mijnteamkompas.pdf">privacyverklaring</a>.</p></article></div><details><summary>Wat is het verschil met de volledige Teamscan?</summary><p>Deze gratis scan toont één persoonlijke beleving. De volledige scan vergelijkt veilig de perspectieven van meerdere teamleden en vormt een basis voor het teamgesprek.</p></details><button className="tk-button tk-button-primary" onClick={start}>Start mijn scan</button></section></main>;
  if(phase==="scan"){const question=FREE_SCAN_QUESTIONS[index];return <main className="free-shell">{meta}<Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><div className="free-progress"><span>Vraag {index+1} van {FREE_SCAN_QUESTIONS.length}</span><progress max={FREE_SCAN_QUESTIONS.length} value={index+1}/></div><section className="free-question"><span>{FREE_SCAN_THEMES.find(t=>t.id===question.theme).label}</span><h1>{question.text}</h1><fieldset><legend className="sr-only">Kies één antwoord</legend>{FREE_SCAN_SCALE.map(o=><label key={o.value} className={answers[question.id]===o.value?"selected":""}><input type="radio" name={question.id} checked={answers[question.id]===o.value} onChange={()=>choose(o.value)}/><b>{o.value}</b>{o.label}</label>)}</fieldset>{error&&<p role="alert" className="free-error">{error}</p>}<div className="free-actions"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Terug</button><button className="tk-button tk-button-primary" onClick={next}>{index===23?"Naar jouw rapport":"Volgende"}</button></div></section></main>}
  if(phase==="details")return <main className="free-shell"><Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><form className="free-form" onSubmit={finish}><span className="free-eyebrow">Je bent er bijna</span><h1>Nog een paar gegevens en je uitslag staat klaar</h1><p>We vragen alleen wat nodig is. Organisatie, rol en teamgrootte zijn optioneel.</p><label>Voornaam *<input required value={person.firstName} onChange={e=>setPerson({...person,firstName:e.target.value})}/></label><label>E-mailadres *<input required type="email" value={person.email} onChange={e=>setPerson({...person,email:e.target.value})}/></label><div className="free-form-grid"><label>Organisatie<input value={person.organisation} onChange={e=>setPerson({...person,organisation:e.target.value})}/></label><label>Functierol<input value={person.role} onChange={e=>setPerson({...person,role:e.target.value})}/></label></div><input className="free-hp" tabIndex="-1" autoComplete="off" value={person.hp} onChange={e=>setPerson({...person,hp:e.target.value})}/><label className="free-check"><input type="checkbox" checked={person.consentProcessing} onChange={e=>setPerson({...person,consentProcessing:e.target.checked})}/> Ik geef toestemming om mijn antwoorden te verwerken, mijn rapport tijdelijk op te slaan zodat ik het kan bekijken. *</label><label className="free-check"><input type="checkbox" checked={person.consentMarketing} onChange={e=>setPerson({...person,consentMarketing:e.target.checked})}/> Ik ontvang graag af en toe inspiratie van Mijn Teamkompas (optioneel).</label>{error&&<p role="alert" className="free-error">{error}</p>}<div className="free-actions"><button type="button" onClick={()=>setPhase("scan")}>Terug</button><button className="tk-button tk-button-primary" disabled={busy}>{busy?"Rapport wordt gemaakt…":"Bekijk mijn uitslag"}</button></div></form></main>;
  return <main className="free-shell free-result"><Helmet><meta name="robots" content="noindex,nofollow"/></Helmet><span className="free-eyebrow">Dank je wel</span><h1>Dit is jouw persoonlijke Teamkompas</h1><p>Dit beeld weerspiegelt jouw beleving en is geen oordeel over het hele team.</p><ScoreOverview result={outcome}/><div className="free-cards"><article><h2>{outcome.sterkeKop}</h2><ul className="free-theme-list">{outcome.strengths.map(x=><li key={x.id}><span style={{background:themeColor(x.id)}} aria-hidden="true" />{x.label}<b>{toon(x.getoond)}</b></li>)}</ul></article><article><h2>{outcome.ontwikkelkansKop}</h2><ul className="free-theme-list">{outcome.ontwikkelkans&&<li><span style={{background:themeColor(outcome.ontwikkelkans.id)}} aria-hidden="true" />{outcome.ontwikkelkans.label}<b>{toon(outcome.ontwikkelkans.getoond)}</b></li>}</ul></article></div><blockquote>{outcome.reflections[0]}</blockquote>{outcome.experiments[0]&&<p><strong>Probeer deze week:</strong> {naDubbelePunt(outcome.experiments[0].eersteStap)}</p>}<p className="free-notice">{outcome.emailStatus==="sent"?"Je uitgebreide rapport is per e-mail verzonden.":"Je rapport staat klaar. Open het via onderstaande knop en bewaar de link goed."}</p><div className="free-actions"><a className="tk-button tk-button-primary" href={outcome.reportUrl}>Open volledig rapport</a><a className="tk-button tk-button-secondary" href="/teamscan" onClick={()=>emit("free_scan_result_full_scan_click")}>Ontdek de volledige Teamscan</a></div></main>;
}
