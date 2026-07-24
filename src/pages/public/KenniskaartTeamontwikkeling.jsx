import { Helmet } from "react-helmet-async";
import { ButtonLink, Card, Eyebrow, PageShell, Section } from "../../components/design-system";
import KompasDot from "../../components/shared/KompasDot";

const ROUTE = "/kennis/kenniskaart-teamontwikkeling";

const steps = [
  {
    nr: "1", title: "Kijken", question: "Wat gebeurt er werkelijk in het team?", color: "var(--tk-color-blue)",
    text: "Voordat een team kan veranderen, moet zichtbaar worden wat er werkelijk speelt. Niet alleen in afspraken, processen en structuren, maar ook in gedrag, relaties, aannames en onuitgesproken verwachtingen.",
    topics: [
      ["teamscan", "/teamscan"], ["teamcultuur", "/kennis/teamcultuur"], ["boven- en onderstroom", "/boven-en-onderstroom"], ["teamdynamiek", "/teamontwikkeling"], ["dagelijkse observaties"], ["patronen in samenwerking"],
    ],
  },
  {
    nr: "2", title: "Begrijpen", question: "Waarom reageren mensen zoals ze reageren?", color: "var(--tk-color-purple)",
    text: "Gedrag wordt begrijpelijker wanneer teamleden leren kijken naar menselijke behoeften, stressreacties, voorkeuren en verschillen. Begrip voorkomt snelle oordelen en maakt samenwerking beter bespreekbaar.",
    topics: [["neuromanagement", "/brein-en-samenwerking"], ["bevlogenheid", "/kennis/bevlogenheid-in-het-werk"], ["Insights Discovery", "/insights-discovery-profiel"], ["verschillen tussen mensen"], ["gedrag onder druk", "/brein-en-samenwerking"], ["groepsdynamiek", "/teamontwikkeling"]],
  },
  {
    nr: "3", title: "Verbinden", question: "Wat is nodig om het echte gesprek te kunnen voeren?", color: "var(--tk-color-green)",
    text: "Teams groeien wanneer mensen zich veilig genoeg voelen om vragen te stellen, fouten te erkennen, feedback te geven en afwijkende perspectieven in te brengen. Veiligheid is geen einddoel, maar een voorwaarde om samen te leren.",
    topics: [["psychologische veiligheid", "/psychologische-veiligheid"], ["bevlogenheid", "/kennis/bevlogenheid-in-het-werk"], ["sociale veiligheid", "/sociale-veiligheid"], ["vertrouwen", "/psychologische-veiligheid"], ["feedback"], ["inclusie en verschillen benutten"]],
  },
  {
    nr: "4", title: "Bewegen", question: "Welke kleine stap kunnen we nu zetten?", color: "var(--tk-color-orange)",
    text: "Verandering hoeft niet direct groot of volledig uitgewerkt te zijn. Teams kunnen nieuwe werkwijzen en nieuw gedrag eerst op kleine schaal uitproberen, evalueren en verbeteren.",
    topics: [["kleine experimenten", "/kleine-experimenten"], ["energiebalans", "/kennis/bevlogenheid-in-het-werk"], ["lean en agile werken", "/kleine-experimenten"], ["growth mindset", "/kleine-experimenten"], ["eigenaarschap", "/teamontwikkeling"], ["leren door te doen"]],
  },
  {
    nr: "5", title: "Borgen", question: "Hoe zorgen we dat de ontwikkeling doorgaat?", color: "var(--tk-color-teal)",
    text: "Een teamdag of interventie krijgt pas blijvende waarde wanneer teams regelmatig terugkijken, afspraken opvolgen en verantwoordelijkheid nemen voor hun eigen ontwikkeling.",
    topics: [["teamrituelen"], ["reflectie", "/kleine-experimenten"], ["teamafspraken", "/teamdag"], ["evalueren"], ["leiderschap", "/teamcoaching"], ["duurzame inzetbaarheid", "/kennis/bevlogenheid-in-het-werk"], ["eigenaarschap", "/teamontwikkeling"], ["continu leren", "/kleine-experimenten"]],
  },
];

const situations = [
  ["We praten vooral over taken, maar niet over wat er echt speelt.", "Kijken"],
  ["We begrijpen elkaar onvoldoende en botsen regelmatig.", "Begrijpen"],
  ["Mensen houden zich in of spreken zich niet uit.", "Verbinden"],
  ["We weten wat beter kan, maar komen niet in beweging.", "Bewegen"],
  ["We starten acties, maar houden ze niet vol.", "Borgen"],
];

function Topic({ topic }) {
  const [label, href] = topic;
  if (!href) return <span className="tk-knowledge-topic">{label}</span>;
  return <a className="tk-knowledge-topic tk-knowledge-topic-link" href={href}>{label}</a>;
}

function KnowledgeMapStep({ step, index }) {
  return (
    <article className="tk-knowledge-step" style={{ "--step-color": step.color }} aria-labelledby={`kenniskaart-stap-${step.nr}`}>
      <div className="tk-knowledge-step-node" aria-hidden="true">{step.nr}</div>
      <div className="tk-knowledge-step-card">
        <p className="tk-knowledge-step-label">Stap {step.nr}</p>
        <h3 id={`kenniskaart-stap-${step.nr}`}>{step.title}</h3>
        <p className="tk-knowledge-question">{step.question}</p>
        <p>{step.text}</p>
        <div className="tk-knowledge-topics" aria-label={`Kennisthema's bij ${step.title}`}>
          {step.topics.map((topic) => <Topic key={topic[0]} topic={topic} />)}
        </div>
      </div>
      {index < steps.length - 1 && <span className="tk-knowledge-connector" aria-hidden="true" />}
    </article>
  );
}

export default function KenniskaartTeamontwikkeling() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "name": "Kenniskaart voor teamontwikkeling", "url": `https://www.mijnteamkompas.nl${ROUTE}`, "description": "Ontdek hoe psychologische veiligheid, onderstroom, neuromanagement, kleine experimenten en eigenaarschap samen bijdragen aan duurzame teamontwikkeling." },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mijnteamkompas.nl/" },
        { "@type": "ListItem", "position": 2, "name": "Kennis", "item": "https://www.mijnteamkompas.nl/blog" },
        { "@type": "ListItem", "position": 3, "name": "Kenniskaart voor teamontwikkeling", "item": `https://www.mijnteamkompas.nl${ROUTE}` }
      ]}
    ]
  };

  return (
    <PageShell>
      <Helmet>
        <title>Kenniskaart teamontwikkeling | Mijn Teamkompas</title>
        <meta name="description" content="Ontdek hoe psychologische veiligheid, onderstroom, neuromanagement, kleine experimenten en eigenaarschap samen bijdragen aan duurzame teamontwikkeling." />
        <link rel="canonical" href={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <meta property="og:title" content="Kenniskaart teamontwikkeling | Mijn Teamkompas" />
        <meta property="og:description" content="Ontdek hoe kennisgebieden van Mijn Teamkompas samen bijdragen aan duurzame teamontwikkeling." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.mijnteamkompas.nl${ROUTE}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Section className="tk-knowledge-hero">
        <Eyebrow withDot>Kennis · teamontwikkeling</Eyebrow>
        <h1 className="tk-heading-xl">Kenniskaart voor teamontwikkeling</h1>
        <p className="tk-lead">Een team ontwikkelt zich zelden door één training, model of gesprek. Duurzame groei ontstaat wanneer teams leren kijken naar wat er werkelijk speelt, begrijpen waar gedrag vandaan komt, werken aan veiligheid en verbinding, kleine stappen durven zetten en hun ontwikkeling blijven vasthouden.</p>
        <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek waar jouw team staat</ButtonLink><ButtonLink href="/blog" variant="secondary">Naar kennisoverzicht</ButtonLink></div>
      </Section>

      <Section className="tk-knowledge-map-section">
        <div className="tk-section-heading">
          <Eyebrow>Visuele kenniskaart</Eyebrow>
          <h2 className="tk-heading-lg">Van kijken naar borgen: één ontwikkelroute voor samenwerking verbeteren.</h2>
        </div>
        <div className="tk-knowledge-map" aria-label="Ontwikkelroute met vijf stappen voor duurzame teamontwikkeling">
          {steps.map((step, index) => <KnowledgeMapStep key={step.title} step={step} index={index} />)}
        </div>
      </Section>

      <Section>
        <div className="tk-knowledge-two-column">
          <div>
            <Eyebrow>Waarom samenhang</Eyebrow>
            <h2 className="tk-heading-lg">Waarom deze onderwerpen samenhangen</h2>
          </div>
          <div className="tk-rich-text">
            <p>Problemen in teams ontstaan zelden door één oorzaak. Een gebrek aan eigenaarschap kan samenhangen met onduidelijke verwachtingen, onvoldoende psychologische veiligheid of sociale veiligheid, stress, onderlinge verschillen, teamdynamiek of eerdere ervaringen.</p>
            <p>Daarom begint Mijn Teamkompas niet met een standaardoplossing. We onderzoeken eerst wat het team nodig heeft: wat is zichtbaar in de bovenstroom, wat speelt in de onderstroom en welke kleine experimenten helpen om duurzame beweging te maken?</p>
          </div>
        </div>
      </Section>

      <Section className="tk-knowledge-start-section">
        <Eyebrow>Keuzehulp</Eyebrow>
        <h2 className="tk-heading-lg">Waar begint jouw team?</h2>
        <div className="tk-starting-grid">
          {situations.map(([text, step]) => <Card key={text} accent="var(--tk-color-teal)"><h3>{step}</h3><p>{text}</p></Card>)}
        </div>
        <div className="tk-actions"><ButtonLink href="/teamscan">Ontdek het startpunt van jouw team</ButtonLink></div>
      </Section>

      <Section className="tk-knowledge-final-cta">
        <div className="tk-knowledge-cta-card">
          <KompasDot size={34} />
          <div>
            <Eyebrow>Van kennis naar beweging</Eyebrow>
            <h2 className="tk-heading-lg">Kennis krijgt waarde wanneer teams ermee gaan werken.</h2>
            <p>Kennis over teamontwikkeling, neuromanagement, veiligheid en eigenaarschap wordt pas merkbaar wanneer teams deze vertalen naar gesprekken, afspraken en kleine experimenten in het dagelijks werk.</p>
            <div className="tk-actions"><ButtonLink href="/teamscan">Start met de teamscan</ButtonLink><ButtonLink href="/verkennen" variant="secondary">Plan een kennismakingsgesprek</ButtonLink><ButtonLink href="/teamontwikkeling" variant="secondary">Bekijk teamontwikkeling</ButtonLink><ButtonLink href="/teamdag" variant="secondary">Ontdek teamdagen</ButtonLink></div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
