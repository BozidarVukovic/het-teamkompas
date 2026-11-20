// Secties voor /teamontwikkeling over het team dat blijft leren.
//
// November 2026. De pagina beantwoordde wanneer teamontwikkeling nodig is en
// hoe we werken, maar niet waar de begeleiding naartoe werkt. Deze secties
// voegen dat toe in de volgorde waarin een leidinggevende of HR-adviseur het
// wil weten: wat bedoelen jullie, wat vraagt het van mij en het team, hoe ziet
// oefenen eruit, wat draagt elk onderdeel bij, hoe ziet een traject eruit en
// hoe volgen we of het werkt.
//
// Inhoudelijke grenzen die hier bewust zijn aangehouden:
// - geen prijzen, geen vast aantal sessies, geen beloofde uitkomst;
// - geen digitale functies die niet bestaan (de besloten teamomgeving bestaat,
//   "waar het past");
// - geen score of benchmark voor growth mindset; de stellingen zijn voor het
//   gesprek;
// - werkdruk, bezetting en rollen worden niet teruggebracht tot houding.
import Fade from "../shared/Fade";
import { PUB } from "../../styles/tokens";

const kop = (isMobile) => ({ fontSize: isMobile ? 30 : 42, fontWeight: 800, lineHeight: 1.12, color: PUB.donker, margin: "0 0 16px" });
const label = { fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: PUB.teal, marginBottom: 12 };
const tekst = { fontSize: 16, lineHeight: 1.8, color: PUB.sub, margin: "0 0 16px" };
const kaart = { background: PUB.wit, border: `1px solid ${PUB.lijn}`, borderRadius: 16, padding: 22, height: "100%", boxSizing: "border-box" };
const sectie = (isMobile, achtergrond) => ({ background: achtergrond, padding: isMobile ? "54px 20px" : "82px 60px" });

function Lijst({ items }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
      {items.map((item) => (
        <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, lineHeight: 1.65, color: PUB.donker }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: PUB.teal, marginTop: 9, flexShrink: 0 }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LerendTeamSectie({ isMobile }) {
  const onderdelen = [
    ["Overtuigingen", "De verwachting dat mensen en samenwerking zich kunnen ontwikkelen, ook na een moeizame periode."],
    ["Gedrag", "Vragen stellen, om feedback vragen, iets nieuws uitproberen en samen terugkijken op wat er gebeurde."],
    ["Werkomstandigheden", "Tijd om terug te kijken, ruimte om te oefenen en duidelijkheid over wat er wordt verwacht."],
  ];
  return (
    <section id="team-dat-blijft-leren" style={{ ...sectie(isMobile, PUB.wit), scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Fade>
          <div style={{ maxWidth: 820 }}>
            <div style={label}>Waar we naartoe werken</div>
            <h2 style={kop(isMobile)}>Wat we verstaan onder een team dat blijft leren</h2>
            <p style={tekst}>
              Een team dat blijft leren, herkent steeds beter zelf wat er speelt, kan daarover het gesprek voeren en stuurt de samenwerking bij. Daaronder ligt een gedeelde overtuiging: dat mensen en teams hun vaardigheden en samenwerking kunnen ontwikkelen door feedback, oefening, passende ondersteuning en leren van ervaringen. Dat noemen we een growth mindset binnen een team.
            </p>
          </div>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, margin: "10px 0 34px" }}>
          {onderdelen.map(([titel, t], i) => (
            <Fade key={titel} delay={i * 0.05} style={{ height: "100%" }}>
              <div style={{ ...kaart, background: PUB.licht }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, margin: "0 0 8px" }}>{titel}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{t}</p>
              </div>
            </Fade>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
          <Fade>
            <div style={kaart}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: PUB.donker, margin: "0 0 14px" }}>Wat dit vraagt van teamleden</h3>
              <Lijst items={[
                "om feedback vragen, ook als dat ongemakkelijk is",
                "zeggen wat je nog niet weet of kunt",
                "een nieuwe werkwijze een paar weken echt uitproberen",
                "terugkomen op wat samen is afgesproken",
                "je eigen bijdrage verbinden aan het gezamenlijke resultaat",
              ]} />
            </div>
          </Fade>
          <Fade delay={0.06}>
            <div style={kaart}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: PUB.donker, margin: "0 0 14px" }}>Wat dit vraagt van de leidinggevende</h3>
              <Lijst items={[
                "richting geven: waar werken we naartoe en wat ligt vast",
                "zelf om feedback vragen en laten zien wat je leert",
                "leren bespreekbaar maken, ook na een tegenvaller",
                "ruimte geven om te oefenen binnen heldere kaders",
                "zorgen voor tijd en voorwaarden om terug te kijken",
              ]} />
            </div>
          </Fade>
        </div>
        <Fade delay={0.08}>
          <p style={{ ...tekst, maxWidth: 860, margin: "26px 0 0", fontSize: 15 }}>
            Niet alles is een kwestie van houding. Werkdruk, bezetting, rolverdeling en besluitvorming bepalen mee of een team kan leren, en daar dragen de organisatie en de leidinggevende verantwoordelijkheid voor. In werk waar veiligheid kritisch is, probeer je nieuwe werkwijzen uit binnen de geldende professionele kaders.{" "}
            <a href="/kennis/growth-mindset-in-teams" style={{ color: PUB.teal, fontWeight: 700 }}>Lees meer over growth mindset in teams</a>.
          </p>
        </Fade>
      </div>
    </section>
  );
}

export function OefenVoorbeelden({ isMobile }) {
  const voorbeelden = [
    ["Steeds dezelfde discussie", "Hetzelfde onderwerp komt elk overleg terug, zonder besluit.", "Het team benoemt voortaan eerst de criteria voor een besluit en wie beslist. Na vier weken kijkt het terug: komen we sneller tot een besluit?"],
    ["Feedback wordt uitgesteld", "Irritaties worden pas uitgesproken als ze groot zijn geworden.", "Elk overleg eindigt met één korte feedbackvraag aan elkaar. De leidinggevende begint, door zelf om feedback te vragen."],
    ["Verbeterafspraken lopen dood", "Er worden goede afspraken gemaakt, maar niemand komt erop terug.", "Eén afspraak tegelijk, met een trekker en een datum om te evalueren. In het overleg staan er vijf minuten voor: wat merken we ervan?"],
  ];
  return (
    <section style={sectie(isMobile, PUB.licht)}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Fade>
          <div style={{ maxWidth: 820 }}>
            <div style={label}>Zo ziet oefenen eruit</div>
            <h2 style={kop(isMobile)}>Van terugkerend patroon naar iets wat het team oefent</h2>
            <p style={tekst}>Drie situaties die we vaak tegenkomen. De oefening is steeds klein; het samen terugkijken maakt het verschil.</p>
          </div>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginTop: 10 }}>
          {voorbeelden.map(([titel, patroon, oefening], i) => (
            <Fade key={titel} delay={i * 0.05} style={{ height: "100%" }}>
              <div style={kaart}>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: PUB.donker, margin: "0 0 12px" }}>{titel}</h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: PUB.sub, marginBottom: 4 }}>Wat er gebeurt</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.donker, margin: "0 0 14px" }}>{patroon}</p>
                <div style={{ fontSize: 13, fontWeight: 700, color: PUB.teal, marginBottom: 4 }}>Wat het team oefent</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.donker, margin: 0 }}>{oefening}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BijdragePerOnderdeel({ isMobile }) {
  const onderdelen = [
    ["Teamscan", "Onderzoekt hoe teamleden de voorwaarden voor samenwerking en leren ervaren. De uitkomsten zijn het begin van een gesprek, met een haalbare volgende stap.", "/teamscan"],
    ["Insights Discovery", "Geeft taal voor communicatievoorkeuren en gedrag. De vraag is niet wie je bent, maar welk gedrag een situatie vraagt en wat je wilt oefenen.", "/insights-discovery-profiel"],
    ["Teamdag", "Vertaalt inzicht naar een gezamenlijk ontwikkeldoel, concrete afspraken en één of twee kleine experimenten.", "/teamdag"],
    ["Teamcoaching", "Helpt om tijdens het oefenen te reflecteren op echte gebeurtenissen, spanning en terugkerende patronen.", "/teamcoaching"],
    ["Coaching voor leidinggevenden", "Helpt de leidinggevende richting te geven, feedback te vragen, leren bespreekbaar te maken en ruimte te bieden binnen heldere kaders.", "/individuele-coaching"],
    ["Borging", "Korte reflectiemomenten, kleine experimenten en vaste evaluaties maken ontwikkeling onderdeel van het werk. Waar het past, staan afspraken en materialen in een besloten online teamomgeving.", "/kennis/impact-van-een-teamdag"],
  ];
  return (
    <section style={{ ...sectie(isMobile, PUB.wit), borderTop: `1px solid ${PUB.lijn}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Fade>
          <div style={{ maxWidth: 820 }}>
            <div style={label}>Hoe de onderdelen samenhangen</div>
            <h2 style={kop(isMobile)}>Wat elk onderdeel bijdraagt aan een team dat blijft leren</h2>
            <p style={tekst}>Inhoud en intensiteit stemmen we af op de situatie van het team. Niet elk team heeft alle onderdelen nodig.</p>
          </div>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginTop: 10 }}>
          {onderdelen.map(([titel, t, href], i) => (
            <Fade key={titel} delay={i * 0.04} style={{ height: "100%" }}>
              <a href={href} style={{ ...kaart, display: "block", background: PUB.licht, textDecoration: "none" }}>
                <h3 style={{ fontSize: 20, lineHeight: 1.25, color: PUB.donker, margin: "0 0 10px" }}>{titel}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{t}</p>
                <span style={{ display: "inline-block", marginTop: 14, fontSize: 13.5, fontWeight: 800, color: PUB.teal }}>Lees verder →</span>
              </a>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrajectSamenLeren({ isMobile, onGesprek }) {
  const fasen = [
    ["Maand 1", "Luisteren en onderzoeken", "Gesprekken en een teamscan leveren een startbeeld op. Samen kiezen we één gezamenlijk ontwikkeldoel."],
    ["Maand 2", "Begrijpen en kiezen", "In een teamsessie vertaalt het team het doel naar concrete gedragsafspraken en één of twee experimenten."],
    ["Maand 3 en 4", "Oefenen in het dagelijks werk", "Het team oefent in het eigen werk, met korte reflecties en gerichte coaching op wat er gebeurt."],
    ["Maand 5", "Verdiepen en bijsturen", "Aandacht voor patronen die terugkomen en voor de rol van leiderschap daarin."],
    ["Maand 6", "Evalueren en voortzetten", "Samen evalueren wat er is veranderd en een leerwerkwijze vastleggen die het team zelf voortzet."],
  ];
  return (
    <section id="samen-leren-en-verbeteren" style={{ ...sectie(isMobile, PUB.licht), scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Fade>
          <div style={{ maxWidth: 840 }}>
            <div style={label}>Begeleid traject</div>
            <h2 style={kop(isMobile)}>Samen leren en verbeteren: een traject van zes maanden</h2>
            <p style={tekst}>
              Voor teams die niet alleen een actuele samenwerkingsvraag willen oplossen, maar ook een manier van werken willen opbouwen waarmee ze de volgende vraag zelf beter aankunnen. Het traject bouwt voort op onderdelen die we al inzetten: teamscan, teamsessies, coaching en opvolging.
            </p>
          </div>
        </Fade>
        <ol style={{ listStyle: "none", margin: "12px 0 30px", padding: 0, display: "grid", gap: 12 }}>
          {fasen.map(([periode, focus, opbrengst], i) => (
            <Fade key={periode} delay={i * 0.04}>
              <li style={{ ...kaart, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "150px 260px 1fr", gap: isMobile ? 6 : 20, alignItems: "baseline", padding: isMobile ? "16px 18px" : "18px 22px" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: PUB.teal }}>{periode}</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: PUB.donker }}>{focus}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub }}>{opbrengst}</span>
              </li>
            </Fade>
          ))}
        </ol>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
          <Fade style={{ height: "100%" }}>
            <div style={kaart}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, margin: "0 0 12px" }}>Voor wie</h3>
              <Lijst items={[
                "teams met een samenwerkingsvraag die steeds terugkomt",
                "teams na een reorganisatie, samenvoeging of nieuwe leidinggevende",
                "leidinggevenden die minder willen trekken en meer bij het team willen leggen",
              ]} />
            </div>
          </Fade>
          <Fade delay={0.05} style={{ height: "100%" }}>
            <div style={kaart}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, margin: "0 0 12px" }}>Wat het van het team vraagt</h3>
              <Lijst items={[
                "tijd voor de sessies en voor korte reflecties tussendoor",
                "een leidinggevende die actief meedoet",
                "bereidheid om afspraken uit te proberen en eerlijk terug te kijken",
              ]} />
            </div>
          </Fade>
          <Fade delay={0.1} style={{ height: "100%" }}>
            <div style={kaart}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, margin: "0 0 12px" }}>Afgestemd op jullie team</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>
                Het aantal sessies, de vorm en de intensiteit stemmen we af op de situatie van het team. Dat bespreken we in een kennismakingsgesprek en leggen we vast in een voorstel op maat.
              </p>
            </div>
          </Fade>
        </div>
        <Fade delay={0.1}>
          <div style={{ marginTop: 28, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 18, alignItems: isMobile ? "stretch" : "center" }}>
            <button
              type="button"
              onClick={onGesprek}
              style={{ border: 0, background: PUB.oranje, color: PUB.donker, padding: "14px 22px", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", minHeight: 44 }}
            >
              Bespreek of dit traject bij jullie past
            </button>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: PUB.sub, margin: 0, maxWidth: 620 }}>
              Zes maanden is geen afgeronde cultuurverandering. Het is ruimte om te oefenen, voortgang te onderzoeken en gewoontes op te bouwen die het team daarna zelf vasthoudt.
            </p>
          </div>
        </Fade>
      </div>
    </section>
  );
}

export function VoortgangVolgen({ isMobile }) {
  const bronnen = [
    ["Ervaringen", "Hoe ervaren teamleden de samenwerking en de ruimte om te leren? Korte reflecties en, waar passend, een herhaalde teamscan."],
    ["Zichtbaar gedrag", "Wat gebeurt er anders? Worden afspraken opgevolgd, vragen mensen om feedback, komt het team terug op een tegenvaller?"],
    ["Werkresultaat", "Een resultaat dat bij het team past en dat we per klant afspreken. Bijvoorbeeld betere opvolging van besluiten, minder herstelwerk of duidelijkere overdrachten."],
  ];
  const stellingen = [
    "In ons team vragen we actief om feedback.",
    "We kunnen aangeven dat we iets nog niet weten of kunnen.",
    "Na een tegenvaller onderzoeken we wat we kunnen aanpassen.",
    "We komen terug op eerder afgesproken verbeteringen.",
    "Onze leidinggevende laat zien hoe hij of zij zelf leert.",
  ];
  return (
    <section style={sectie(isMobile, PUB.wit)}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr .9fr", gap: isMobile ? 26 : 48, alignItems: "start" }}>
        <div>
          <Fade>
            <div style={label}>Voortgang</div>
            <h2 style={kop(isMobile)}>Hoe we de ontwikkeling volgen</h2>
            <p style={tekst}>We kijken op drie manieren, omdat één bron te weinig zegt.</p>
          </Fade>
          <div style={{ display: "grid", gap: 12 }}>
            {bronnen.map(([titel, t], i) => (
              <Fade key={titel} delay={i * 0.04}>
                <div style={{ ...kaart, padding: "18px 20px" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: PUB.donker, margin: "0 0 6px" }}>{titel}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub, margin: 0 }}>{t}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
        <Fade delay={0.06}>
          <div style={{ ...kaart, background: PUB.licht }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: PUB.donker, margin: "0 0 10px" }}>Stellingen om samen te bespreken</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: PUB.sub, margin: "0 0 14px" }}>Hoe herkenbaar is dit voor jullie, nu en over drie maanden?</p>
            <ol style={{ margin: "0 0 14px", paddingLeft: 20, display: "grid", gap: 8, fontSize: 15, lineHeight: 1.6, color: PUB.donker }}>
              {stellingen.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: PUB.sub, margin: 0 }}>Deze stellingen zijn bedoeld voor reflectie en gesprek. Er hoort geen score of benchmark bij.</p>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/**
 * Een korte band op een dienstpagina: wat deze dienst bijdraagt aan een team
 * dat blijft leren. Bewust compact en per dienst een eigen tekst; dezelfde
 * alinea op vijf pagina's zou als herhaling lezen.
 */
export function LerendTeamBijdrage({ isMobile, tekst, donker = false }) {
  const kleuren = donker
    ? { vlak: "transparent", rand: "rgba(255,255,255,0.08)", label: PUB.tealOpDonker, kop: PUB.wit, tekst: "rgba(255,255,255,0.78)", link: PUB.tealOpDonker }
    : { vlak: PUB.licht, rand: PUB.lijn, label: PUB.teal, kop: PUB.donker, tekst: PUB.sub, link: PUB.teal };
  return (
    <section aria-label="Bijdrage aan een team dat blijft leren" style={{ background: kleuren.vlak, padding: isMobile ? "40px 20px" : "56px 60px", borderTop: `1px solid ${kleuren.rand}` }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 300px) minmax(0, 1fr)", gap: isMobile ? 10 : 44, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: kleuren.label, marginBottom: 8 }}>Een team dat blijft leren</div>
          <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, lineHeight: 1.2, color: kleuren.kop, margin: 0 }}>Wat dit bijdraagt na vandaag</h2>
        </div>
        <div>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: kleuren.tekst, margin: "0 0 12px", maxWidth: "66ch" }}>{tekst}</p>
          <a href="/teamontwikkeling#team-dat-blijft-leren" style={{ color: kleuren.link, fontWeight: 700, fontSize: 14.5, textDecoration: "none", display: "inline-block", padding: "10px 0" }}>
            Zo hangen onze onderdelen samen →
          </a>
        </div>
      </div>
    </section>
  );
}
