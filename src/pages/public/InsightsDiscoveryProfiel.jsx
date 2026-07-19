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
  ["Is Insights Discovery hetzelfde als DISC?", "Nee. DISC en Insights Discovery zijn verschillende modellen, ook al werken beide met vier herkenbare stijlen of kleuren. DISC beschrijft vooral zichtbaar gedrag, zoals dominant, invloedrijk, stabiel of consciëntieus gedrag. Insights Discovery kijkt breder naar psychologische voorkeuren en is gebaseerd op het gedachtegoed van Carl Jung. Het gaat ook over voorkeuren in communicatie, besluitvorming, informatieverwerking en samenwerking. Iedereen heeft alle vier de kleurenergieën in zich; de waarde zit vooral in de kwaliteit van het gesprek en de manier waarop het profiel wordt toegepast."],
  ["Worden mensen met Insights Discovery in hokjes geplaatst?", "Dat is nadrukkelijk niet de bedoeling. Een profiel beschrijft voorkeuren, geen vaste identiteit. Mensen kunnen hun gedrag aanpassen en verschillende kleurenergieën inzetten afhankelijk van de situatie. Wij zeggen daarom niet: jij bent rood of jij bent blauw. We spreken over energieën die iemand meer of minder van nature inzet."],
  ["Is Insights Discovery wetenschappelijk bewezen?", "Insights Discovery is gebaseerd op het gedachtegoed van Carl Jung en wordt veel gebruikt binnen organisaties. Het is geen klinische test en ook geen diagnose-instrument. Zoals bij veel persoonlijkheidsmodellen is het belangrijk om het profiel niet als absolute waarheid te behandelen. De praktische waarde zit vooral in zelfinzicht, een gedeelde taal en een beter gesprek over communicatie en samenwerking."],
  ["Kan ik alleen een individueel profiel aanvragen?", "Ja. Een individueel profiel kan worden gebruikt voor persoonlijke ontwikkeling, leiderschap, communicatie of coaching. De meeste impact ontstaat wanneer het profiel ook wordt besproken en gekoppeld aan concrete situaties uit het werk."],
  ["Kunnen de profielen onderdeel zijn van een teamdag?", "Ja. Tijdens een teamdag kunnen teamleden hun eigen voorkeuren leren begrijpen en onderzoeken wat de verdeling van voorkeuren betekent voor besluitvorming, feedback, tempo, perspectieven en samenwerking onder druk."],
  ["Is een profiel geschikt voor selectie of beoordeling?", "Een Insights Discovery-profiel is volgens onze werkwijze niet bedoeld als zelfstandig selectie- of beoordelingsinstrument. Het profiel kan input geven voor ontwikkeling en samenwerking, maar mag niet worden gebruikt als enige basis voor beslissingen over geschiktheid, functioneren of loopbaan."],
  ["Wordt een persoonlijk profiel vertrouwelijk behandeld?", "Ja. Een persoonlijk profiel bevat persoonlijke informatie en wordt zorgvuldig behandeld. Vooraf spreken we af wie het profiel ontvangt, wat individueel blijft, wat iemand zelf met het team deelt en hoe informatie tijdens een teamsessie wordt gebruikt. Een teamoverzicht is nooit een vervanging voor het persoonlijke gesprek met de deelnemer."],
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
    ["Vurig rood", "Resultaat, tempo, duidelijkheid en actie.", ["snel schakelen", "knopen doorhakken", "resultaatgericht werken", "voortgang creëren"], ["ongeduldig worden", "te snel beslissen", "weinig ruimte laten voor nuance", "directheid die harder overkomt dan bedoeld"], PUB.oranje],
    ["Stralend geel", "Enthousiasme, mogelijkheden, contact en inspiratie.", ["anderen meenemen", "nieuwe ideeën genereren", "gemakkelijk contact maken", "energie creëren"], ["snel afgeleid raken", "details missen", "afspraken onvoldoende afronden", "te snel naar nieuwe mogelijkheden bewegen"], "#D99A1E"],
    ["Zacht groen", "Verbinding, harmonie, zorgvuldigheid en betrokkenheid.", ["goed luisteren", "vertrouwen opbouwen", "geduldig samenwerken", "aandacht hebben voor de groep"], ["conflicten uitstellen", "eigen grenzen onvoldoende aangeven", "lang blijven zoeken naar draagvlak", "terughoudend zijn met directe feedback"], PUB.groen],
    ["Helder blauw", "Kwaliteit, logica, structuur en nauwkeurigheid.", ["analytisch denken", "kwaliteit bewaken", "risico’s herkennen", "zorgvuldig voorbereiden"], ["te lang analyseren", "kritisch of afstandelijk overkomen", "moeite hebben met onduidelijkheid", "besluiten uitstellen totdat alle informatie beschikbaar is"], PUB.blauw],
  ];

  const fundamenten = [
    ["Psychologische veiligheid", "Een profiel kan helpen om verschillen minder persoonlijk te maken. Daardoor ontstaat meer ruimte om vragen te stellen, feedback te geven en onzekerheid uit te spreken.", "/psychologische-veiligheid"],
    ["Boven- en onderstroom", "De kleurenergieën maken zichtbaar wat boven tafel gebeurt, zoals communicatie en taakverdeling. Het gesprek over behoeften, irritaties, aannames en spanning helpt om ook de onderstroom beter te begrijpen.", "/boven-en-onderstroom"],
    ["Neuromanagement", "Voorkeuren hebben invloed op hoe mensen reageren op druk, onzekerheid, verandering, status en autonomie. Daarmee sluit het profiel aan bij inzichten over het brein en gedrag op het werk.", "/brein-en-samenwerking"],
    ["Kleine experimenten", "Het profiel krijgt pas waarde wanneer teams ermee oefenen, bijvoorbeeld door vergaderingen anders in te richten, feedback anders te formuleren of collega’s bewust eerder te betrekken.", "/kleine-experimenten"],
    ["Eigenaarschap", "Zelfinzicht helpt mensen om verantwoordelijkheid te nemen voor hun eigen gedrag, communicatie en invloed op het team.", "/teamontwikkeling"],
  ];

  return <PageShell>
    <Helmet>
      <title>Insights Discovery-profiel voor teams | Mijn Teamkompas</title>
      <meta name="description" content="Insights Discovery-profiel voor teams, teamdagen en teamontwikkeling. Lees over kleurenergieën, communicatieprofiel team en het verschil tussen DISC en Insights Discovery." />
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
        <ButtonLink href="/verkennen" variant="secondary" onClick={() => trackEvent("insights_hero_contact_click")}>Plan een verkennend gesprek</ButtonLink>
      </div>
    </Section>

    <Section>
      <div style={{ maxWidth: 880 }}>
        <Eyebrow>Wat is Insights Discovery?</Eyebrow>
        <h2 className="tk-heading-lg">Een model voor persoonlijke en professionele ontwikkeling.</h2>
        <p className="tk-lead" style={{ fontSize: 18 }}>Insights Discovery helpt mensen om beter te begrijpen welke gedrags- en communicatievoorkeuren zij van nature laten zien en hoe deze voorkeuren invloed hebben op samenwerking. Het model is gebaseerd op het werk van Carl Jung en vertaalt psychologische voorkeuren naar vier herkenbare kleurenergieën: vurig rood, stralend geel, zacht groen en helder blauw.</p>
        <p style={{ color: PUB.muted, lineHeight: 1.75, fontSize: 16 }}>Iedereen beschikt over alle vier de kleurenergieën. Het verschil zit in de mate waarin iemand deze voorkeuren van nature inzet. Ook context speelt mee: op het werk, thuis, onder druk of in een leidinggevende rol kunnen andere kanten zichtbaar worden. Een persoonlijk Insights Discovery-profiel geeft daarom geen vaststaand oordeel, maar biedt taal om te onderzoeken waar iemand energie van krijgt, hoe iemand besluiten neemt, communiceert, wat iemand nodig heeft van anderen en hoe iemand effectiever kan aansluiten bij collega’s.</p>
      </div>
    </Section>

    <Section style={{ background: PUB.licht }}>
      <Eyebrow>De vier kleurenergieën</Eyebrow>
      <h2 className="tk-heading-lg">Voorkeuren herkennen zonder mensen vast te zetten.</h2>
      <div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{energy.map(([name, text, strengths, risks, color]) => <Card key={name} accent={color}><h3>{name}</h3><p>{text}</p><strong style={{ display: "block", marginTop: 16 }}>Mogelijke kracht</strong><ul>{strengths.map((item) => <li key={item}>{item}</li>)}</ul><strong>Mogelijk risico</strong><ul>{risks.map((item) => <li key={item}>{item}</li>)}</ul></Card>)}</div>
      <p className="tk-lead" style={{ fontSize: 18, maxWidth: 760 }}>De kracht zit niet in één kleur, maar in het bewust kunnen inzetten van verschillende voorkeuren.</p>
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

    <Section>
      <div style={{ maxWidth: 900 }}>
        <Eyebrow>Hoe wij Insights Discovery inzetten</Eyebrow>
        <h2 className="tk-heading-lg">Niet als losse test, maar als hulpmiddel voor het echte gesprek.</h2>
        <p className="tk-lead" style={{ fontSize: 18 }}>Wij gebruiken Insights Discovery niet om mensen te beoordelen. Het profiel helpt om het gesprek over samenwerking concreter te maken en wordt altijd verbonden aan de praktijk van het team.</p>
        <div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{["als onderdeel van een teamdag", "binnen een teamontwikkelingstraject", "bij individuele coaching", "bij leiderschapsontwikkeling", "bij spanningen of misverstanden", "bij rollen, verantwoordelijkheden en teamafspraken"].map((item) => <Card key={item} accent={PUB.teal}><h3>{item}</h3></Card>)}</div>
        <p style={{ color: PUB.muted, lineHeight: 1.75, fontSize: 16, marginTop: 24 }}>Welke verschillen zien we terug in vergaderingen? Wie neemt snel het voortouw? Wie stelt kritische vragen? Wie bewaakt de relatie? Wie spreekt zich minder snel uit? Het doel is niet dat teamleden elkaars kleur onthouden. Het doel is dat zij beter leren waarnemen, luisteren, afstemmen en samenwerken.</p>
      </div>
    </Section>

    <Section style={{ background: PUB.sand }}>
      <Eyebrow>Verbonden met onze aanpak</Eyebrow>
      <h2 className="tk-heading-lg">Insights Discovery als onderdeel van het bredere kompas.</h2>
      <div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{fundamenten.map(([titel, tekst, href]) => <Card key={titel} accent={PUB.teal}><h3>{titel}</h3><p>{tekst}</p><a href={href} style={{ display: "inline-block", marginTop: 14, color: PUB.teal, fontWeight: 850, textDecoration: "none" }}>Lees verder →</a></Card>)}</div>
    </Section>

    <Section>
      <div style={{ maxWidth: 880 }}>
        <Eyebrow>DISC en Insights Discovery</Eyebrow>
        <h2 className="tk-heading-lg">Wat is het verschil tussen DISC en Insights Discovery?</h2>
        <p style={{ color: PUB.muted, lineHeight: 1.75, fontSize: 16 }}>DISC beschrijft vooral zichtbaar gedrag. Insights Discovery kijkt breder naar psychologische voorkeuren in communicatie, besluitvorming, informatieverwerking en samenwerking. Beide modellen kunnen nuttig zijn, maar geen van beide vertelt de volledige waarheid over een persoon. Bij Mijn Teamkompas gebruiken we Insights Discovery als communicatieprofiel voor teams en als gespreksinstrument binnen teamontwikkeling, teamcoaching of een Insights Discovery teamdag.</p>
      </div>
    </Section>

    <Section><Eyebrow>Hoe werkt het?</Eyebrow><h2 className="tk-heading-lg">Van aanvraag naar bespreking.</h2><div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>{[["01","Aanvraag en korte afstemming","We bespreken voor wie het profiel bedoeld is en welk doel centraal staat."],["02","Invullen van de vragenlijst","De deelnemer ontvangt een persoonlijke link en vult de vragenlijst online in."],["03","Persoonlijk profiel","De deelnemer ontvangt een uitgebreid persoonlijk profiel."],["04","Persoonlijke bespreking of teamsessie","Het profiel wordt besproken in een individueel gesprek, binnen een teamdag of als onderdeel van een teamontwikkelingstraject."]].map(([nr,titel,tekst])=><Card key={nr} accent={PUB.teal}><h3>{nr} · {titel}</h3><p>{tekst}</p></Card>)}</div></Section>

    <Section style={{ background: PUB.sand }}>
      <Eyebrow>Mogelijkheden</Eyebrow>
      <h2 className="tk-heading-lg">Kies de vorm die past bij je vraag.</h2>
      <div className="tk-grid tk-grid-3" style={{ marginTop: 28 }}>
        {[
          ["Individueel profiel", "Voor professionals en leidinggevenden die meer inzicht willen in hun eigen communicatie, kwaliteiten en ontwikkelpunten."],
          ["Profielen voor een team", "Voor teams die elkaars voorkeuren beter willen begrijpen en de samenwerking willen versterken."],
          ["Onderdeel van een teamdag", "Het profiel wordt gekoppeld aan oefeningen, teamvraagstukken, communicatie, eigenaarschap en concrete afspraken."],
        ].map(([titel, tekst]) => (
          <Card key={titel} accent={PUB.teal}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h3>{titel}</h3>
              <p>{tekst}</p>
              <button
                type="button"
                className="tk-button tk-button-primary"
                style={{ alignSelf: "flex-start", marginTop: "auto" }}
                onClick={scrollToForm}
              >
                Aanvragen
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Section>

    <Section id="aanvraagformulier"><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 34, alignItems: "start" }}><div><Eyebrow>Aanvraag</Eyebrow><h2 className="tk-heading-lg">Vraag een Insights Discovery-profiel aan</h2><p className="tk-lead" style={{ fontSize: 18 }}>Laat je gegevens achter. We nemen contact met je op om de vraag, het doel en de passende vorm kort te bespreken.</p>{status === "sent" && <Card accent={PUB.groen}><h3>Aanvraag ontvangen</h3><p>Bedankt. We nemen contact met je op om de passende vorm kort af te stemmen.</p></Card>}</div><form onSubmit={submit} noValidate style={{ background: "white", border: `1px solid ${PUB.border}`, borderRadius: 28, padding: 28, boxShadow: "0 18px 46px rgba(13,27,42,.09)" }} onFocus={() => { if (!formStarted) { setFormStarted(true); trackEvent("insights_formulier_start"); } }}><div style={{ position: "absolute", left: -9999 }}><label>Website<Field value={form.website} onChange={(e)=>update("website", e.target.value)} tabIndex="-1" autoComplete="off" /></label></div>{[["naam","Naam","text","name",true],["organisatie","Organisatie","text","organization",true],["email","E-mailadres","email","email",true],["telefoon","Telefoonnummer","tel","tel",false],["aantalPersonen","Aantal personen","number","off",false]].map(([key,label,type,auto])=><label key={key} style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>{label}{key !== "telefoon" && key !== "aantalPersonen" ? " *" : ""}<Field type={type} value={form[key]} onChange={(e)=>update(key,e.target.value)} autoComplete={auto} aria-invalid={Boolean(errors[key])} style={{ marginTop: 6 }} />{errors[key] && <span style={{ color: "#b42318", fontSize: 13 }}>{errors[key]}</span>}</label>)}<label style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>Interesse *<Field as="select" value={form.interesse} onChange={(e)=>update("interesse",e.target.value)} style={{ marginTop: 6 }}>{["individueel profiel","teamprofielen","onderdeel van een teamdag","ik wil eerst overleggen"].map((option)=><option key={option}>{option}</option>)}</Field></label><label style={{ display: "block", marginBottom: 14, fontWeight: 800 }}>Toelichting of vraag *<Field as="textarea" rows={5} value={form.toelichting} onChange={(e)=>update("toelichting",e.target.value)} aria-invalid={Boolean(errors.toelichting)} style={{ marginTop: 6, resize: "vertical" }} />{errors.toelichting && <span style={{ color: "#b42318", fontSize: 13 }}>{errors.toelichting}</span>}</label><label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}><input type="checkbox" checked={form.privacy} onChange={(e)=>update("privacy",e.target.checked)} style={{ marginTop: 4 }} /><span>Ik ga akkoord met zorgvuldig gebruik van mijn gegevens volgens de <a href="/privacyverklaring_mijnteamkompas.pdf" target="_blank" rel="noreferrer">privacyverklaring</a>. *</span></label>{errors.privacy && <div style={{ color: "#b42318", fontSize: 13, marginBottom: 12 }}>{errors.privacy}</div>}{status === "error" && <div style={{ color: "#b42318", fontSize: 14, marginBottom: 12 }}>Versturen lukte niet. Probeer opnieuw of neem contact op via de bestaande contactmogelijkheid.</div>}<button className="tk-button tk-button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Versturen..." : "Verstuur mijn aanvraag"}</button><p style={{ color: PUB.muted, fontSize: 13, lineHeight: 1.5 }}>We sturen geen namen, e-mails, telefoonnummers of vrije tekst naar analytics.</p></form></div></Section>

    <Section style={{ background: PUB.licht }}><Eyebrow>FAQ</Eyebrow><h2 className="tk-heading-lg">Veelgestelde vragen</h2><div style={{ display: "grid", gap: 14, marginTop: 26 }}>{faqItems.map(([vraag, antwoord])=><details key={vraag} style={{ background: "white", border: `1px solid ${PUB.border}`, borderRadius: 22, padding: "20px 22px" }}><summary style={{ cursor: "pointer", fontWeight: 900, fontSize: 18 }}>{vraag}</summary><p style={{ color: PUB.muted, lineHeight: 1.7 }}>{antwoord}</p></details>)}</div></Section>
  </PageShell>;
}
