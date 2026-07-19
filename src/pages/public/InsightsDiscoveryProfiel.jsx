import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CONTACT_TO_EMAIL, EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from "../../email";
import { PUB } from "../../styles/tokens";
import { ButtonLink, Card, Eyebrow, Field, PageShell, Section } from "../../components/design-system";

const initialForm = {
  naam: "",
  organisatie: "",
  email: "",
  telefoon: "",
  interesse: "individueel profiel",
  aantalPersonen: "",
  toelichting: "",
  privacy: false,
  website: "",
};

const faqItems = [
  ["Is Insights Discovery hetzelfde als DISC?", "Nee. Het zijn verschillende modellen en werkwijzen. Beide kunnen helpen om gedrag en communicatie bespreekbaar te maken, maar wij gebruiken Insights Discovery vooral als praktische gespreksstarter binnen teamontwikkeling."],
  ["Worden mensen met dit profiel in hokjes geplaatst?", "Nee. Iedereen gebruikt alle kleurenergieën en gedrag verandert per context. Het profiel is geen oordeel, maar taal om voorkeuren, kwaliteiten en spanning zorgvuldig te bespreken."],
  ["Kan ik alleen een individueel profiel aanvragen?", "Ja. Een individueel profiel kan waardevol zijn voor professionals en leidinggevenden die hun communicatie, kwaliteiten en ontwikkelpunten beter willen begrijpen."],
  ["Kunnen de profielen onderdeel zijn van een teamdag?", "Ja. We kunnen profielen koppelen aan oefeningen, teamvraagstukken en concrete afspraken tijdens een teamdag of breder teamontwikkelingstraject."],
  ["Wordt een persoonlijk profiel vertrouwelijk behandeld?", "Ja. Een persoonlijk profiel vraagt om zorgvuldigheid. We spreken vooraf af wat individueel blijft en wat in een teamsetting gedeeld wordt, zodat het gesprek veilig en respectvol blijft."],
];

function trackEvent(event) {
  return addDoc(collection(db, "teamscanEvents"), {
    event,
    pagina: "insights-discovery-profiel",
    url: window.location.href,
    timestamp: serverTimestamp(),
  }).catch((error) => console.warn("Funnel-event niet opgeslagen", error));
}

export default function InsightsDiscoveryProfiel() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [formStarted, setFormStarted] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const scrollToForm = () => {
    trackEvent("insights_hero_aanvraag_click");
    document.getElementById("aanvraagformulier")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const next = {};
    if (!form.naam.trim()) next.naam = "Vul je naam in.";
    if (!form.organisatie.trim()) next.organisatie = "Vul je organisatie in.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Vul een geldig e-mailadres in.";
    if (!form.toelichting.trim()) next.toelichting = "Beschrijf kort je vraag of doel.";
    if (!form.privacy) next.privacy = "Bevestig dat je de privacyverklaring hebt gelezen.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;
    if (form.website) return setStatus("sent");
    if (!validate()) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "contactaanvragen"), {
        naam: form.naam,
        organisatie: form.organisatie,
        email: form.email,
        telefoon: form.telefoon,
        interesse: form.interesse,
        aantalPersonen: form.aantalPersonen,
        bericht: form.toelichting,
        status: "Nieuw",
        bron: "Insights Discovery-profiel",
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
            teamgrootte: form.aantalPersonen,
            gewenste_stap: `Insights Discovery - ${form.interesse}`,
            bericht: form.toelichting,
            to_email: CONTACT_TO_EMAIL,
          },
        }),
      });
      if (!res.ok) console.warn("EmailJS gaf geen 200-response");
      await trackEvent("insights_aanvraag_succes");
      setStatus("sent");
      setForm(initialForm);
    } catch (error) {
      console.error("Fout bij versturen:", error);
      setStatus("error");
    }
  };

  const energy = [
    ["Vurig rood", "Richting", "Direct, doelgericht en besluitvaardig.", PUB.oranje],
    ["Stralend geel", "Ideeën", "Enthousiast, verbindend en gericht op mogelijkheden.", "#D99A1E"],
    ["Zacht groen", "Relatie", "Betrokken, rustig en gericht op harmonie.", PUB.groen],
    ["Helder blauw", "Zorgvuldigheid", "Analytisch, precies en gericht op kwaliteit.", PUB.blauw],
  ];

  return <PageShell>
    <Helmet>
      <title>Insights Discovery-profiel voor teams | Mijn Teamkompas</title>
      <meta name="description" content="Ontdek hoe een Insights Discovery-profiel helpt om communicatie, zelfinzicht en samenwerking binnen teams te versterken." />
      <link rel="canonical" href="https://www.mijnteamkompas.nl/insights-discovery-profiel" />
      <meta property="og:title" content="Insights Discovery-profiel voor betere samenwerking" />
      <meta property="og:description" content="Gebruik Insights Discovery als startpunt voor zelfinzicht, betere communicatie en teamontwikkeling." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.mijnteamkompas.nl/insights-discovery-profiel" />
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqItems.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))})}</script>
    </Helmet>

    <Section style={{ paddingTop: 96, paddingBottom: 72, background: `linear-gradient(135deg, ${PUB.donker}, ${PUB.navy})`, color: "white" }}>
      <Eyebrow withDot>Insights Discovery-profiel voor betere samenwerking</Eyebrow>
      <h1 className="tk-heading-xl">Begrijp jezelf. Begrijp elkaar. Werk beter samen.</h1>
      <p className="tk-lead" style={{ color: "rgba(255,255,255,.76)" }}>Goede samenwerking begint met inzicht in jezelf en nieuwsgierigheid naar de ander. Een Insights Discovery-profiel geeft taal aan voorkeuren, kwaliteiten, communicatie en gedrag onder druk.</p>
      <div className="tk-actions">
        <button type="button" className="tk-button tk-button-primary" onClick={scrollToForm}>Vraag een Insights Discovery-profiel aan</button>
        <ButtonLink href="/verkennen" variant="secondary" onClick={() => trackEvent("insights_hero_contact_click")}>Bespreek de mogelijkheden</ButtonLink>
      </div>
    </Section>

    <Section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
        <div><Eyebrow>Wat is Insights Discovery?</Eyebrow><h2 className="tk-heading-lg">Een herkenbare taal voor gedrag en communicatie.</h2><p className="tk-lead" style={{ fontSize: 18 }}>Het model gebruikt vier kleurenergieën. Iedereen heeft alle vier in zich, in een eigen verhouding en afhankelijk van de situatie. Wij zetten het niet los in, maar verbinden het aan luisteren, meten en bewegen binnen teamontwikkeling.</p></div>
        <div className="tk-grid tk-grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>{energy.map(([name,label,text,color]) => <Card key={name} accent={color}><h3>{name}</h3><strong>{label}</strong><p>{text}</p></Card>)}</div>
      </div>
    </Section>

    <Section style={{ background: PUB.sand }}>
      <Eyebrow>Opbrengst</Eyebrow><h2 className="tk-heading-lg">Wat levert een persoonlijk profiel op?</h2>
      <div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{["Inzicht in natuurlijke voorkeuren en kwaliteiten","Herkenning van mogelijke valkuilen","Beter begrijpen hoe je communiceert","Inzicht in gedrag en behoeften onder druk","Praktische tips voor samenwerking","Een persoonlijke basis voor verdere ontwikkeling"].map((item)=><Card key={item} accent={PUB.teal}><h3>{item}</h3></Card>)}</div>
    </Section>

    <Section>
      <div style={{ maxWidth: 860 }}><Eyebrow>Teamontwikkeling</Eyebrow><h2 className="tk-heading-lg">Wat levert het een team op?</h2><p className="tk-lead" style={{ fontSize: 18 }}>Teams werken aan beter begrip van onderlinge verschillen, minder aannames, communicatie die beter aansluit, evenwichtiger taak- en rolverdeling, constructiever omgaan met spanning, psychologische veiligheid en waardering voor verschillende kwaliteiten.</p></div>
      <div style={{ marginTop: 30, borderRadius: 30, padding: 32, background: PUB.navy, color: "white", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 900, letterSpacing: "-.04em" }}>Verschillen worden niet het probleem, maar een bron van informatie.</div>
    </Section>

    <Section style={{ background: PUB.licht }}>
      <Card accent={PUB.oranje}><Eyebrow>Geen hokjes</Eyebrow><h2 className="tk-heading-lg">Een startpunt voor het gesprek.</h2><p className="tk-lead" style={{ fontSize: 18 }}>Een profiel vertelt niet wie iemand definitief is. Gedrag wordt mede beïnvloed door context, rol, ervaring, veiligheid en druk. Daarom gebruiken wij Insights Discovery nooit als eindpunt, maar als startpunt voor een betekenisvol gesprek over <a href="/psychologische-veiligheid">psychologische veiligheid</a>, <a href="/sociale-veiligheid">sociale veiligheid</a>, <a href="/boven-en-onderstroom">boven- en onderstroom</a>, <a href="/brein-en-samenwerking">neuromanagement</a>, <a href="/kleine-experimenten">kleine experimenten</a>, eigenaarschap en samenwerking.</p></Card>
    </Section>

    <Section><Eyebrow>Hoe werkt het?</Eyebrow><h2 className="tk-heading-lg">Van aanvraag naar bespreking.</h2><div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{[["01","Aanvraag en korte afstemming","We bespreken voor wie het profiel bedoeld is en welk doel centraal staat."],["02","Invullen van de vragenlijst","De deelnemer ontvangt een persoonlijke link en vult de vragenlijst online in."],["03","Persoonlijk profiel","De deelnemer ontvangt een uitgebreid persoonlijk profiel."],["04","Persoonlijke bespreking of teamsessie","Het profiel wordt besproken in een individueel gesprek, binnen een teamdag of als onderdeel van een teamontwikkelingstraject."]].map(([nr,titel,tekst])=><Card key={nr} accent={PUB.teal}><h3>{nr} · {titel}</h3><p>{tekst}</p></Card>)}</div></Section>

    <Section style={{ background: PUB.sand }}><Eyebrow>Mogelijkheden</Eyebrow><h2 className="tk-heading-lg">Kies de vorm die past bij je vraag.</h2><div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{[["Individueel profiel","Voor professionals en leidinggevenden die meer inzicht willen in hun eigen communicatie, kwaliteiten en ontwikkelpunten."],["Profielen voor een team","Voor teams die elkaars voorkeuren beter willen begrijpen en de samenwerking willen versterken."],["Onderdeel van een teamdag","Het profiel wordt gekoppeld aan oefeningen, teamvraagstukken, communicatie, eigenaarschap en concrete afspraken."]].map(([titel,tekst])=><Card key={titel} accent={PUB.teal}><h3>{titel}</h3><p>{tekst}</p><button type="button" className="tk-button tk-button-primary" style={{ marginTop: 18 }} onClick={scrollToForm}>Aanvragen</button></Card>)}</div></Section>

    <Section id="aanvraagformulier"><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 34, alignItems: "start" }}><div><Eyebrow>Aanvraag</Eyebrow><h2 className="tk-heading-lg">Vraag een Insights Discovery-profiel aan</h2><p className="tk-lead" style={{ fontSize: 18 }}>Laat je gegevens achter. We nemen contact met je op om de vraag, het doel en de passende vorm kort te bespreken.</p>{status === "sent" && <Card accent={PUB.groen}><h3>Aanvraag ontvangen</h3><p>Bedankt. We nemen contact met je op om de passende vorm kort af te stemmen.</p></Card>}</div><form onSubmit={submit} noValidate style={{ background: "white", border: `1px solid ${PUB.border}`, borderRadius: 28, padding: 28, boxShadow: "0 18px 46px rgba(13,27,42,.09)" }} onFocus={() => { if (!formStarted) { setFormStarted(true); trackEvent("insights_formulier_start"); } }}><div style={{ position: "absolute", left: -9999 }}><label>Website<Field value={form.website} onChange={(e)=>update("website", e.target.value)} tabIndex="-1" autoComplete="off" /></label></div>{[["naam","Naam","text","name",true],["organisatie","Organisatie","text","organization",true],["email","E-mailadres","email","email",true],["telefoon","Telefoonnummer","tel","tel",false],["aantalPersonen","Aantal personen","number","off",false]].map(([key,label,type,auto])=><label key={key} style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>{label}{key !== "telefoon" && key !== "aantalPersonen" ? " *" : ""}<Field type={type} value={form[key]} onChange={(e)=>update(key,e.target.value)} autoComplete={auto} aria-invalid={Boolean(errors[key])} style={{ marginTop: 6 }} />{errors[key] && <span style={{ color: "#b42318", fontSize: 13 }}>{errors[key]}</span>}</label>)}<label style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>Interesse *<Field as="select" value={form.interesse} onChange={(e)=>update("interesse",e.target.value)} style={{ marginTop: 6 }}>{["individueel profiel","teamprofielen","onderdeel van een teamdag","ik wil eerst overleggen"].map((option)=><option key={option}>{option}</option>)}</Field></label><label style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>Toelichting of vraag *<Field as="textarea" rows={5} value={form.toelichting} onChange={(e)=>update("toelichting",e.target.value)} aria-invalid={Boolean(errors.toelichting)} style={{ marginTop: 6, resize: "vertical" }} />{errors.toelichting && <span style={{ color: "#b42318", fontSize: 13 }}>{errors.toelichting}</span>}</label><label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}><input type="checkbox" checked={form.privacy} onChange={(e)=>update("privacy",e.target.checked)} style={{ marginTop: 4 }} /><span>Ik ga akkoord met zorgvuldig gebruik van mijn gegevens volgens de <a href="/privacyverklaring_mijnteamkompas.pdf" target="_blank" rel="noreferrer">privacyverklaring</a>. *</span></label>{errors.privacy && <div style={{ color: "#b42318", fontSize: 13, marginBottom: 12 }}>{errors.privacy}</div>}{status === "error" && <div style={{ color: "#b42318", fontSize: 14, marginBottom: 12 }}>Versturen lukte niet. Probeer opnieuw of neem contact op via de bestaande contactmogelijkheid.</div>}<button className="tk-button tk-button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Versturen..." : "Verstuur mijn aanvraag"}</button><p style={{ color: PUB.muted, fontSize: 13, lineHeight: 1.5 }}>We sturen geen namen, e-mails, telefoonnummers of vrije tekst naar analytics.</p></form></div></Section>

    <Section style={{ background: PUB.licht }}><Eyebrow>FAQ</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen</h2><div style={{ display: "grid", gap: 14, marginTop: 26 }}>{faqItems.map(([vraag, antwoord])=><details key={vraag} style={{ background: "white", border: `1px solid ${PUB.border}`, borderRadius: 22, padding: "20px 22px" }}><summary style={{ cursor: "pointer", fontWeight: 900, fontSize: 18 }}>{vraag}</summary><p style={{ color: PUB.muted, lineHeight: 1.7 }}>{antwoord}</p></details>)}</div></Section>
  </PageShell>;
}
