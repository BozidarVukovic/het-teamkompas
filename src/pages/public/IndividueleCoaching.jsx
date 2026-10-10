/**
 * /individuele-coaching
 *
 * Aanbod voor leidinggevenden die zelf willen groeien zonder meteen het hele
 * team in een traject te trekken. Stond er nog niet: wie hierop zocht, kwam uit
 * bij /teamcoaching en las daar over een teamtraject dat niet bij zijn vraag
 * paste.
 *
 * Gebruikt de stijlbouwstenen die /sprekers exporteert, zodat kleuren, koppen
 * en knoppen vanzelf meebewegen met de rest van de site.
 */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ContactModal from "../../ContactModal";
import { useKennismaking } from "../../lib/kennismaking";
import { PUB } from "../../styles/tokens";
import { donkerVlak, binnen, kop, bovenregel, oranjeKnop, omlijndeKnop } from "./Sprekers";

const HERKENBAAR = [
  "Je team functioneert op zich goed, en jij loopt tegen je eigen manier van sturen aan.",
  "Je weet wat je zou moeten doen en in het moment doe je toch iets anders.",
  "Delegeren lukt, en daarna kijk je er alsnog overheen.",
  "Je bent doorgegroeid vanuit het team en zoekt een nieuwe verhouding tot oud-collega's.",
  "Je voert hetzelfde gesprek met iemand al maanden in je hoofd en nog niet in het echt.",
  "Je geeft leiding aan een grote groep en merkt dat wat vroeger werkte nu te weinig is.",
];

const ONDERWERPEN = [
  ["Situationeel leidinggeven", "Je stijl laten meebewegen met wat iemand op dit moment nodig heeft, in plaats van met wat jou het beste ligt."],
  ["Delegeren en loslaten", "Werk overdragen inclusief het oordeel dat erbij hoort, en uithouden dat een ander het anders doet."],
  ["Coachend leidinggeven", "Vragen stellen waar je gewend bent antwoorden te geven, en merken wat dat met het eigenaarschap van je mensen doet."],
  ["Het gesprek dat je uitstelt", "Voorbereiden, voeren en achteraf onderzoeken wat er werkelijk gebeurde."],
  ["Je gedrag onder druk", "Wat er met jouw leiderschap gebeurt zodra de werkdruk oploopt, en wat je daarin kunt kiezen."],
  ["Je positie in de organisatie", "Omgaan met de ruimte die je hebt, de ruimte die je denkt te hebben en het verschil daartussen."],
];

const FAQ = [
  ["Wat is het verschil met teamcoaching?", "Bij teamcoaching werken we met de groep en gaat het over wat er tussen mensen gebeurt. Bij individuele coaching werken we alleen met jou en gaat het over jouw eigen handelen. Functioneert je team op zich goed en loop je vooral tegen jezelf aan, dan is individuele coaching de kleinere en gerichtere stap."],
  ["Hoeveel gesprekken zijn er nodig?", "Meestal vijf tot acht gesprekken van ongeveer anderhalf uur, verspreid over een aantal maanden. Tussen de gesprekken zit tijd om in de praktijk iets uit te proberen; daar komt het werk vandaan."],
  ["Wat kost het?", "De prijs is op aanvraag, omdat het aantal gesprekken en de vorm per persoon verschillen. In de kennismaking hoor je waar je aan toe bent voordat je iets vastlegt."],
  ["Met wie heb ik de gesprekken?", "Met Bozidar Vukovic of Edmond Lam. Past jouw vraag beter bij iemand anders, dan kijken we in onze samenwerkingspool naar een coach die er wel bij past. Die keuze maken we samen in de kennismaking."],
  ["Waar vinden de gesprekken plaats?", "Op jullie locatie, bij ons, wandelend of online. Wat helpt verschilt per persoon en per gespreksonderwerp."],
  ["Hoort mijn leidinggevende erbij betrokken te zijn?", "Dat hoeft niet en het helpt vaak wel. Betaalt je werkgever mee, dan is een kort driegesprek over de richting gebruikelijk. Wat er in de gesprekken zelf wordt besproken, blijft tussen ons."],
  ["Blijft het vertrouwelijk?", "Ja. We koppelen niets inhoudelijks terug zonder dat jij weet wat er wordt gedeeld en ermee instemt."],
  ["Kan het later alsnog een teamtraject worden?", "Dat komt regelmatig voor. Soms blijkt onderweg dat een vraag breder ligt dan bij jou alleen. Dan bespreken we of een teamscan of teamdag een logische volgende stap is."],
];

export default function IndividueleCoaching() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  useKennismaking(openModal);

  const ga = (pad) => (e) => { e.preventDefault(); navigate(pad); };

  return (
    <>
      <Helmet>
        <title>Individuele coaching voor leidinggevenden | Mijn Teamkompas</title>
        <meta
          name="description"
          content="Individuele management- en leiderschapscoaching voor leidinggevenden die zelf willen groeien, zonder meteen het hele team in een traject te trekken."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.mijnteamkompas.nl/individuele-coaching" />
        <meta property="og:title" content="Individuele coaching voor leidinggevenden | Mijn Teamkompas" />
        <meta property="og:description" content="Werken aan situationeel leidinggeven, delegeren en coachend leiderschap. Eén op één, met ruimte om het in de praktijk uit te proberen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mijnteamkompas.nl/individuele-coaching" />
        <meta property="og:image" content="https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Individuele coaching voor leidinggevenden | Mijn Teamkompas" />
        <meta name="twitter:description" content="Eén op één werken aan je eigen manier van leidinggeven, met ruimte om het tussen de gesprekken door uit te proberen." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: "Individuele coaching voor leidinggevenden",
              serviceType: "Managementcoaching, leiderschapscoaching, executive coaching",
              description:
                "Individuele begeleiding voor leidinggevenden die willen werken aan situationeel leidinggeven, delegeren, coachend leiderschap en hun eigen gedrag onder druk.",
              url: "https://www.mijnteamkompas.nl/individuele-coaching",
              areaServed: "NL",
              provider: {
                "@type": "LocalBusiness",
                name: "Mijn Teamkompas",
                url: "https://www.mijnteamkompas.nl",
                email: "info@mijnteamkompas.nl",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map(([v, a]) => ({
                "@type": "Question",
                name: v,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mijnteamkompas.nl/" },
                { "@type": "ListItem", position: 2, name: "Individuele coaching", item: "https://www.mijnteamkompas.nl/individuele-coaching" },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <div style={{ ...donkerVlak, paddingTop: 64 }}>
        <section style={{ padding: "clamp(56px, 8vw, 96px) 0" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Individuele coaching</div>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
              Soms zit de vraag niet bij het team, maar bij jou.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "0 0 18px" }}>
              Je team draait op zich goed. Wat je zoekt is iets anders: grip op je eigen manier van leidinggeven. Hoe je stuurt zonder over te nemen, hoe je delegeert zonder erover te blijven hangen, hoe je een gesprek voert dat je liever uitstelt.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "0 0 30px" }}>
              Daarvoor hoeft je hele team niet mee. Individuele coaching is de kleinere stap: alleen jij, jouw situaties en jouw gedrag. Je werkt met Bozidar of Edmond, of met een coach uit onze samenwerkingspool wanneer die beter bij je vraag past.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
              <a href="#onderwerpen" style={omlijndeKnop}>Waar werken we aan?</a>
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Herkenbaar?</div>
            <h2 style={kop}>Wanneer individuele coaching past</h2>
            <ul style={{ margin: "22px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
              {HERKENBAAR.map((regel) => (
                <li key={regel} style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", paddingLeft: 26, position: "relative" }}>
                  <span aria-hidden="true" style={{ position: "absolute", left: 0, color: PUB.oranje, fontWeight: 800 }}>—</span>
                  {regel}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="onderwerpen" style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={binnen}>
            <div style={{ maxWidth: 760, marginBottom: 34 }}>
              <div style={bovenregel}>Onderwerpen</div>
              <h2 style={kop}>Waar we meestal aan werken</h2>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", margin: 0 }}>
                Het vertrekpunt is jouw praktijk. Deze onderwerpen komen het vaakst langs.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {ONDERWERPEN.map(([titel, uitleg]) => (
                <article key={titel} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 26 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: PUB.wit, margin: "0 0 10px" }}>{titel}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.74)", margin: 0 }}>{uitleg}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Hoe het werkt</div>
            <h2 style={kop}>Luisteren, meten, bewegen — nu voor één persoon</h2>
            <ol style={{ margin: "22px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 22, counterReset: "stap" }}>
              {[
                ["Kennismaking", "Een vrijblijvend gesprek over wat er speelt en wat je wilt veranderen. Daarna weet je of dit past en wie de logische gesprekspartner is: Bozidar, Edmond, of een coach uit onze samenwerkingspool."],
                ["Scherp krijgen waar het om gaat", "Wat je wilt veranderen is zelden hetzelfde als waar je mee binnenkomt. De eerste gesprekken gaan daarom over situaties: wat gebeurde er precies, wat deed jij, wat gebeurde er daarna."],
                ["Uitproberen in je eigen werk", "Tussen de gesprekken kies je iets kleins om anders te doen. Eén gesprek, één overleg, één besluit. Daar komt het leren vandaan, niet uit de theorie."],
                ["Terugkijken en bijstellen", "Wat werkte, wat niet, en wat zegt dat? Soms blijkt onderweg dat de vraag breder ligt dan bij jou alleen. Dan benoemen we dat."],
              ].map(([titel, uitleg], i) => (
                <li key={titel} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "start" }}>
                  <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: "50%", background: PUB.tealOpDonker, color: PUB.donker, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <div>
                    <h3 style={{ fontSize: 19, fontWeight: 800, color: PUB.wit, margin: "6px 0 8px" }}>{titel}</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.72, color: "rgba(255,255,255,0.76)", margin: 0 }}>{uitleg}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", margin: "30px 0 0" }}>
              Meestal vijf tot acht gesprekken van ongeveer anderhalf uur, verspreid over een aantal maanden. Op jullie locatie, bij ons, wandelend of online. De prijs is op aanvraag, omdat vorm en aantal per persoon verschillen.
            </p>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Of toch het team?</div>
            <h2 style={kop}>Wanneer iets anders beter past</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "0 0 16px" }}>
              Merk je dat het vraagstuk eerder tussen mensen zit dan bij jou, dan is een traject met het team logischer. Wil je eerst weten hoe je team de samenwerking ervaart, dan is de{" "}
              <a href="/teamscan" onClick={ga("/teamscan")} style={{ color: PUB.tealOpDonker, fontWeight: 700 }}>online teamscan</a>{" "}
              een goed startpunt. Gaat het om een gezamenlijk gesprek met de hele groep, kijk dan naar een{" "}
              <a href="/teamdag" onClick={ga("/teamdag")} style={{ color: PUB.tealOpDonker, fontWeight: 700 }}>teamdag</a>{" "}
              of naar{" "}
              <a href="/teamcoaching" onClick={ga("/teamcoaching")} style={{ color: PUB.tealOpDonker, fontWeight: 700 }}>teamcoaching</a>.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: 0 }}>
              In de kennismaking helpen we die keuze maken. Blijkt onderweg dat een andere vorm beter past, dan zeggen we dat.
            </p>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 860 }}>
            <div style={bovenregel}>Veelgestelde vragen</div>
            <h2 style={{ ...kop, marginBottom: 26 }}>Praktische vragen over individuele coaching</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {FAQ.map(([vraag, antwoord]) => (
                <details key={vraag} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "18px 22px" }}>
                  <summary style={{ fontSize: 17, fontWeight: 700, color: PUB.wit, cursor: "pointer", listStyle: "revert" }}>{vraag}</summary>
                  <p style={{ fontSize: 16, lineHeight: 1.72, color: "rgba(255,255,255,0.76)", margin: "12px 0 0" }}>{antwoord}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "clamp(56px, 8vw, 96px) 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...binnen, maxWidth: 820 }}>
            <div style={bovenregel}>Samen verkennen</div>
            <h2 style={kop}>Waar loop jij zelf tegenaan?</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.76)", margin: "0 0 26px" }}>
              Vertel wat er speelt. We kijken samen of individuele coaching de logische stap is, of dat iets anders beter past. Vrijblijvend en zonder vast programma.
            </p>
            <button type="button" onClick={openModal} style={oranjeKnop}>Plan een vrijblijvende kennismaking</button>
          </div>
        </section>
      </div>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} bron="Individuele coaching pagina" interesse="Individuele coaching" />
    </>
  );
}
