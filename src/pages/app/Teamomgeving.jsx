import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useApp } from "../../lib/app/AppContext";
import { magBeheren } from "../../lib/app/teamrollen";
import { haalOmgeving, haalOmgevingPdf, richtOmgevingIn, bewaarOmgevingNotities, werkOmgevingBij, werkTekstenBij, voegDocumentToe, verwijderDocument } from "../../lib/app/teamomgevingOpslag";
import { valideerOmgeving, deelTekst, maakBronPakket, maakOnderdelenlijst, leesTijdlijn, splitsInSecties, magInklappen, eersteSectieOpen, heeftTijdlijnplek, leesBijgewerkt, schrijfDatum, leesPdf } from "../../lib/app/teamomgeving";
import { maakSlak, sectieAdressen, leesHash, maakAdres } from "../../lib/app/teamomgevingAdres";
import { maakZoekindex, zoek as zoekInOmgeving } from "../../lib/app/teamomgevingZoek";
import { houdOpZijnPlek } from "../../lib/app/scrollbehoud";
import "../../styles/teamomgeving.css";

// Geen HTML, afbeeldingen of externe links uit geïmporteerde inhoud uitvoeren.
// Ook binnen een tabelcel gaat de tekst door dezelfde poort; er wordt alleen
// bepaald waar een cel begint en eindigt, nooit wat erin mag.
// Elke kop krijgt een adres.
//
// Zonder id kun je alleen naar een heel onderdeel wijzen. Met id kan een link
// -- of een zoektreffer -- de alinea aanwijzen waar het werkelijk over gaat.
// Het is dezelfde slak die het zoeken gebruikt, zodat beide op dezelfde plek
// uitkomen.
function tekstVan(kind) {
  if (kind === null || kind === undefined || typeof kind === "boolean") return "";
  if (typeof kind === "string" || typeof kind === "number") return String(kind);
  if (Array.isArray(kind)) return kind.map(tekstVan).join("");
  if (kind.props) return tekstVan(kind.props.children);
  return "";
}

const GEMERKT = {
  h2: ({ children }) => <h2 id={maakSlak(tekstVan(children)) || undefined}>{children}</h2>,
  h3: ({ children }) => <h3 id={maakSlak(tekstVan(children)) || undefined}>{children}</h3>,
  h4: ({ children }) => <h4 id={maakSlak(tekstVan(children)) || undefined}>{children}</h4>,
};

function Markdown({ children }) {
  return <ReactMarkdown skipHtml disallowedElements={["img", "a"]} unwrapDisallowed components={GEMERKT}>{children || ""}</ReactMarkdown>;
}

// Een schakel, want dat is wat de knop kopieert. Een hekje is het teken uit het
// adres zelf en zegt op een scherm niets; wie het niet herkent, ziet een typefout.
function Ketting({ gedaan }) {
  return <svg className="to-kettingicoon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {gedaan
      ? <path d="M4.5 10.5 8 14l7.5-8" />
      : <>
        <path d="M8.5 11.5a3.2 3.2 0 0 0 4.7.3l2.4-2.4a3.2 3.2 0 0 0-4.5-4.5l-1.3 1.3" />
        <path d="M11.5 8.5a3.2 3.2 0 0 0-4.7-.3l-2.4 2.4a3.2 3.2 0 0 0 4.5 4.5l1.3-1.3" />
      </>}
  </svg>;
}

function Loep() {
  return <svg className="to-loep" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="13.6" y1="13.6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

function Tabel({ kop, rijen }) {
  return <div className="to-tabelwikkel"><table className="to-tabel">
    <thead><tr>{kop.map((cel, i) => <th key={i} scope="col"><Markdown>{cel}</Markdown></th>)}</tr></thead>
    <tbody>{rijen.map((rij, r) => <tr key={r}>{rij.map((cel, i) => <td key={i} data-kop={kop[i]}><Markdown>{cel}</Markdown></td>)}</tr>)}</tbody>
  </table></div>;
}

// De haltes staan op een lijn, niet in een lijst: zo zie je in één oogopslag
// wat achter je ligt en wat er nog komt. Op een smal scherm kantelt dezelfde
// lijn naar verticaal — vijf haltes naast elkaar past daar niet.
function Tijdlijn({ haltes }) {
  return <ol className="to-lijn">
    {haltes.map((halte, i) => <li className="to-halte" key={i} data-gedaan={halte.gedaan ? "ja" : undefined}>
      <span className="to-halte-punt" aria-hidden="true" />
      <span className="to-halte-wanneer">{halte.wanneer}</span>
      {halte.wat && <span className="to-halte-wat">{halte.wat}</span>}
      {halte.stand && <span className="to-halte-stand">{halte.stand}</span>}
    </li>)}
  </ol>;
}

// plaatsBoven is er voor het geval de brontekst geen [tijdlijn] bevat: dan zet
// het scherm de lijn bovenaan. Binnen een inklapbaar onderdeel mag dat niet
// zomaar, want dan zou hij in elke sectie opnieuw verschijnen.
function Tekst({ children, tijdlijn, plaatsBoven }) {
  const delen = deelTekst(children);
  const haltes = tijdlijn || [];
  const heeftPlek = delen.some((deel) => deel.soort === "tijdlijn");
  return <>
    {plaatsBoven && !heeftPlek && haltes.length > 0 && <Tijdlijn haltes={haltes} />}
    {delen.map((deel, i) => {
      if (deel.soort === "tijdlijn") return haltes.length ? <Tijdlijn haltes={haltes} key={i} /> : null;
      if (deel.soort === "tabel") return <Tabel key={i} kop={deel.kop} rijen={deel.rijen} />;
      if (deel.soort === "bovenkopje") return <p className="to-eyebrow to-bovenkopje" key={i}>{deel.tekst}</p>;
      return <Markdown key={i}>{deel.tekst}</Markdown>;
    })}
  </>;
}

// Een leeg onderdeel is geen leeg scherm. Wie hier komt heeft ergens op geklikt
// en verdient te horen waarom er niets staat en wat er dan wél kan.
function Leeg({ titel, uitleg }) {
  return <div className="to-leeg"><p className="to-leeg-titel">{titel}</p><p>{uitleg}</p></div>;
}

// De navigatie binnen de teamomgeving.
//
// Acht onderdelen in twee rijen gelijkwaardige tabbladen laat zien dát er acht
// dingen zijn, niet hoe ze zich tot elkaar verhouden. Op een breed scherm staat
// de lijst daarom links en blijft hij staan; op een telefoon is het één knop
// die openklapt, want een rij van acht is daar geen keuze maar een zoekplaatje.
//
// Een groep waarin het geopende onderdeel zit, kan niet worden dichtgeklapt:
// de plek waar je staat hoort niet te kunnen verdwijnen.
function Onderdelen({ groepen, actief, kies }) {
  const [open, setOpen] = useState(false);
  const [dicht, setDicht] = useState(() => []);
  const alles = groepen.flatMap((groep) => groep.items);
  const huidig = alles.find((item) => item.id === actief);
  function wisselGroep(naam) {
    setDicht((oud) => (oud.includes(naam) ? oud.filter((n) => n !== naam) : [...oud, naam]));
  }
  return <nav className="to-nav" aria-label="Onderdelen" onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
    <button className="to-navknop" type="button" aria-expanded={open} aria-controls="to-onderdelen" onClick={() => setOpen((v) => !v)}>
      <span className="to-navknop-label">Onderdeel</span>
      <span className="to-navknop-titel">{huidig ? huidig.titel : "Kies een onderdeel"}</span>
      <span className="to-pijl" aria-hidden="true" />
    </button>
    <div className="to-navlijst" id="to-onderdelen" data-open={open ? "ja" : "nee"}>
      {groepen.map((groep, i) => {
        const bevatActief = groep.items.some((item) => item.id === actief);
        const ingeklapt = Boolean(groep.naam) && dicht.includes(groep.naam) && !bevatActief;
        return <div className="to-groep" key={groep.naam || `groep-${i}`} data-apart={groep.apart ? "ja" : undefined}>
          {groep.naam && <button className="to-groepkop" type="button" aria-expanded={!ingeklapt} onClick={() => wisselGroep(groep.naam)}>
            <span>{groep.naam}</span>
            <span className="to-pijl" aria-hidden="true" />
          </button>}
          {!ingeklapt && <ul>{groep.items.map((item) => <li key={item.id}>
            <button
              className="to-onderdeel"
              type="button"
              aria-current={item.id === actief ? "page" : undefined}
              onClick={() => { kies(item.id); setOpen(false); }}
            >{item.titel}</button>
          </li>)}</ul>}
        </div>;
      })}
    </div>
  </nav>;
}

// De brontekst terugzetten nadat hij buiten de app is verbeterd.
//
// Twee dingen bewust anders dan bij het inrichten: er is geen keuze meer over
// wie de begeleiders zijn -- dat ligt vast en blijft vastliggen -- en het
// vinkje benoemt wat er níét verandert. Wie hier iets terugzet moet weten dat
// de documenten en de toegang blijven zoals ze zijn.
function Bijwerken({ team, uid, herladen }) {
  const [pakket, setPakket] = useState(null);
  const [akkoord, setAkkoord] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [klaar, setKlaar] = useState("");
  async function lees(e) {
    setFout(""); setPakket(null); setAkkoord(false); setKlaar("");
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 8000000) throw new Error("Het pakket is te groot.");
      setPakket(valideerOmgeving(JSON.parse(await file.text())));
    } catch (err) { setFout(err.message || "Het pakket kon niet worden gelezen."); }
  }
  async function bijwerken() {
    setBezig(true); setFout("");
    try {
      await werkOmgevingBij(team, uid, pakket);
      setPakket(null); setAkkoord(false);
      setKlaar("De teksten zijn bijgewerkt. De documenten en de toegang zijn niet veranderd.");
      herladen();
    } catch (err) { setFout(err.message || "Bijwerken is niet gelukt. Er is niets veranderd."); }
    finally { setBezig(false); }
  }
  return <div className="to-bijwerken">
    <p className="tk-label">Brontekst terugzetten</p>
    <p>Voor een grote wijziging in één keer, of om een onderdeel toe te voegen. Losse teksten corrigeer je sneller met <strong>Tekst bewerken</strong> op het onderdeel zelf. De documenten, de pdf&apos;s en de twee begeleiders blijven zoals ze zijn.</p>
    <label><span className="tk-label">Verbeterd pakket</span><input type="file" accept=".json,application/json" onChange={lees} disabled={bezig} /></label>
    {pakket && <div className="to-pakket"><strong>{pakket.inhoud.titel}</strong><span>{pakket.inhoud.onderdelen.length} onderdelen</span></div>}
    {pakket && <label className="tk-keuzevakje to-akkoord"><input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} disabled={bezig} />Ik vervang de teksten van {team.teamNaam || "dit team"} door de teksten uit dit bestand.</label>}
    {fout && <p role="alert">{fout}</p>}
    {klaar && <p role="status">{klaar}</p>}
    <button className="tk-knop tk-knop-rand" disabled={!pakket || !akkoord || bezig} onClick={bijwerken}>{bezig ? "Bijwerken…" : "Teksten bijwerken"}</button>
  </div>;
}

// Een dichte sectie blijft vindbaar met Cmd-F.
//
// Inklappen maakte de onderdelen overzichtelijk en de inhoud onvindbaar. Wat
// dicht stond, stond ook niet meer in het zoeken van de browser: visibility:
// hidden slaat die tekst over. Dat was de stille prijs van de vorige stap.
//
// hidden="until-found" draait dat om. De browser vindt de tekst, meldt dat met
// beforematch, en dan klapt het scherm de sectie zelf open en springt de
// browser erheen. Kan een browser dat nog niet, dan blijft content-visibility
// het verbergen doen -- er gaat niets stuk, er valt alleen niets te vinden.
//
// Het kenmerk gaat er pas op als de overgang klaar is, anders klapt de sectie
// dicht zonder animatie. Bij de eerste weergave mag dat wel meteen: daar is
// nog geen overgang om te bewaren.
function Vouwvak({ id, open, onVinden, children }) {
  const vak = useRef(null);
  const eerder = useRef(false);
  const melden = useRef(onVinden);
  melden.current = onVinden;
  useEffect(() => {
    const el = vak.current;
    if (!el) return undefined;
    if (open) { eerder.current = true; el.removeAttribute("hidden"); return undefined; }
    const verberg = () => el.setAttribute("hidden", "until-found");
    if (!eerder.current) { verberg(); return undefined; }
    const wacht = setTimeout(verberg, 320);
    return () => clearTimeout(wacht);
  }, [open]);
  useEffect(() => {
    const el = vak.current;
    if (!el) return undefined;
    const gevonden = () => { if (melden.current) melden.current(); };
    el.addEventListener("beforematch", gevonden);
    return () => el.removeEventListener("beforematch", gevonden);
  }, []);
  return <div className="to-vouwvak" id={id} ref={vak} data-open={open ? "ja" : undefined}>
    <div>{children}</div>
  </div>;
}

// Eén sectie tegelijk open, en elke sectie heeft een eigen adres.
//
// Twee tegelijk mag ook, en dan moet je zelf bijhouden wat er nog openstaat.
// Bij een naslagwerk als dit werkt het beter als het scherm dat doet: je opent
// een werkvorm, de vorige klapt dicht, en de lijst blijft even lang als toen je
// binnenkwam. Nog een keer klikken op dezelfde sluit hem weer.
//
// Welke sectie openstaat, staat in de hash van het adres. Daardoor is een
// sectie te delen, overleeft ze een herlaadbeurt, en kan het zoeken er
// rechtstreeks naartoe wijzen. De knop met het hekje kopieert dat adres.
//
// Bij het openen klapt er ook iets dicht. Zit dat erboven, dan zakt de pagina
// omhoog en staat de kop die je aanraakte ineens ergens anders. houdOpZijnPlek
// corrigeert dat: de pagina beweegt, de kop niet.
//
// De kop is een knop binnen een h3, zodat de opbouw van de pagina klopt voor
// wie met een schermlezer of met het toetsenbord werkt.
function Secties({ deel, tijdlijn, hash }) {
  const navigeer = useNavigate();
  const { inleiding, secties } = useMemo(() => splitsInSecties(deel.tekst), [deel.tekst]);
  const adressen = useMemo(() => sectieAdressen(secties), [secties]);
  const uitAdres = adressen.indexOf(leesHash(hash));
  const standaard = eersteSectieOpen(deel) && secties.length ? 0 : -1;
  const [keuze, setKeuze] = useState(() => (uitAdres >= 0 ? uitAdres : standaard));
  const [gekopieerd, setGekopieerd] = useState("");
  const koppen = useRef([]);
  // Wijst het adres een sectie aan, dan wint dat. Wijst het niets aan -- omdat
  // de lezer zojuist iets dichtklapte -- dan blijft staan wat er stond.
  useEffect(() => { if (uitAdres >= 0) setKeuze(uitAdres); }, [uitAdres]);
  const inSectie = secties.some((sectie) => heeftTijdlijnplek(sectie.tekst));

  function zet(i, dicht) {
    setKeuze(dicht ? -1 : i);
    navigeer(maakAdres(deel.id, dicht ? "" : adressen[i]), { replace: true });
  }
  function wissel(i) {
    const dicht = keuze === i;
    const knop = koppen.current[i];
    const voor = knop ? knop.getBoundingClientRect().top : null;
    zet(i, dicht);
    if (knop && voor !== null) houdOpZijnPlek(() => knop.getBoundingClientRect().top, voor);
  }
  async function kopieer(i) {
    const adres = window.location.origin + maakAdres(deel.id, adressen[i]);
    try {
      await navigator.clipboard.writeText(adres);
      setGekopieerd(adressen[i]);
      setTimeout(() => setGekopieerd((h) => (h === adressen[i] ? "" : h)), 2000);
    } catch {
      // Geen klembord (oudere browser, of geen beveiligde verbinding): dan zet
      // het adres tenminste in de adresbalk, zodat het te kopiëren blijft.
      navigeer(maakAdres(deel.id, adressen[i]), { replace: true });
    }
  }

  return <>
    {inleiding && <Tekst tijdlijn={tijdlijn} plaatsBoven={!inSectie}>{inleiding}</Tekst>}
    <div className="to-vouw">
      {secties.map((sectie, i) => {
        const id = `${deel.id}-sectie-${i}`;
        const uit = keuze === i;
        return <section className="to-vouwdeel" id={adressen[i]} key={id}>
          <h3 className="to-vouwrij">
            <button
              className="to-vouwkop"
              type="button"
              ref={(el) => { koppen.current[i] = el; }}
              aria-expanded={uit}
              aria-controls={id}
              onClick={() => wissel(i)}
            >
              <span className="to-vouwtitel">
                {sectie.kop}
                {sectie.bovenkopje && <span className="to-vouwmeta">{sectie.bovenkopje}</span>}
              </span>
              <span className="to-pijl" aria-hidden="true" />
            </button>
            <button className="to-vouwlink" type="button" onClick={() => kopieer(i)}>
              <span className="to-verborgen">
                {gekopieerd === adressen[i] ? `Link naar ${sectie.kop} gekopieerd` : `Link naar ${sectie.kop} kopiëren`}
              </span>
              <Ketting gedaan={gekopieerd === adressen[i]} />
            </button>
          </h3>
          <Vouwvak id={id} open={uit} onVinden={() => zet(i, false)}>
            <Tekst tijdlijn={tijdlijn}>{sectie.tekst}</Tekst>
          </Vouwvak>
        </section>;
      })}
    </div>
  </>;
}

// Zoeken over alle onderdelen tegelijk.
//
// Dit is het enige onderdeel van het scherm dat niet één ding laat zien maar
// alles doorzoekt. Het werkt op wat de browser toch al geladen heeft: er gaat
// geen zoekopdracht naar een server, en er ontstaat dus ook geen logboek van
// waar een teamlid in zijn eigen teamomgeving naar zoekt.
//
// De beheerinhoud en de bespreeknotities zitten er bewust niet in. Die zijn van
// de twee begeleiders en horen in geen enkele index.
const MACTOETS = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");

function Zoeken({ inhoud, ga }) {
  const [open, setOpen] = useState(false);
  const [vraag, setVraag] = useState("");
  const [wijzer, setWijzer] = useState(0);
  const venster = useRef(null);
  const veld = useRef(null);
  const index = useMemo(() => maakZoekindex(inhoud), [inhoud]);
  const raak = useMemo(() => zoekInOmgeving(index, vraag), [index, vraag]);

  useEffect(() => {
    function toets(e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  }, []);

  // Een echte dialog: de browser regelt dan zelf de focus, Escape en het feit
  // dat de rest van de pagina even niet meedoet.
  useEffect(() => {
    const el = venster.current;
    if (!el) return;
    if (open && !el.open) { el.showModal(); if (veld.current) veld.current.focus(); }
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => { setWijzer(0); }, [vraag]);
  useEffect(() => {
    const el = venster.current && venster.current.querySelector('[data-wijzer="ja"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [wijzer]);

  function kies(treffer) {
    setOpen(false);
    setVraag("");
    ga(treffer.onderdeelId, treffer.slak);
  }
  function veldToets(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setWijzer((w) => Math.min(w + 1, raak.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setWijzer((w) => Math.max(w - 1, 0)); }
    else if (e.key === "Enter" && raak[wijzer]) { e.preventDefault(); kies(raak[wijzer]); }
  }
  // Naast het venster klikken sluit het. Een klik op de dialog zelf telt als
  // buiten, want de inhoud vult hem helemaal.
  function buiten(e) {
    const el = venster.current;
    if (!el) return;
    const rand = el.getBoundingClientRect();
    if (e.clientX < rand.left || e.clientX > rand.right || e.clientY < rand.top || e.clientY > rand.bottom) setOpen(false);
  }

  return <>
    <button className="to-zoekknop" type="button" onClick={() => setOpen(true)}>
      <Loep />
      <span>Zoeken</span>
      <kbd aria-hidden="true">{MACTOETS ? "⌘K" : "Ctrl K"}</kbd>
    </button>
    <dialog className="to-zoek" ref={venster} onClose={() => setOpen(false)} onClick={buiten}>
      <div className="to-zoekbalk">
        <Loep />
        <input
          ref={veld}
          className="to-zoekveld"
          type="search"
          value={vraag}
          placeholder="Zoek in jullie teamomgeving"
          aria-label="Zoek in jullie teamomgeving"
          onChange={(e) => setVraag(e.target.value)}
          onKeyDown={veldToets}
        />
        <button className="to-zoeksluit" type="button" onClick={() => setOpen(false)}>Sluiten</button>
      </div>
      {vraag.trim().length >= 2 && <p className="to-zoekstand" role="status">
        {raak.length === 0 ? "Niets gevonden. Probeer een ander woord." : `${raak.length} ${raak.length === 1 ? "plek" : "plekken"} gevonden`}
      </p>}
      <ul className="to-zoeklijst">
        {raak.map((treffer, i) => <li key={`${treffer.onderdeelId}-${treffer.slak}-${i}`}>
          <button
            className="to-zoekraak"
            type="button"
            data-wijzer={i === wijzer ? "ja" : undefined}
            onMouseEnter={() => setWijzer(i)}
            onClick={() => kies(treffer)}
          >
            <span className="to-zoekplek">
              {treffer.onderdeelTitel}
              {treffer.kop && <span className="to-zoekkop"><span aria-hidden="true"> › </span>{treffer.kop}</span>}
            </span>
            <span className="to-zoekfragment">
              {treffer.fragment.voor}
              {treffer.fragment.raak && <mark>{treffer.fragment.raak}</mark>}
              {treffer.fragment.na}
            </span>
          </button>
        </li>)}
      </ul>
    </dialog>
  </>;
}

// Tekst bewerken waar je hem leest.
//
// Naast het invoerveld staat het scherm zelf. Wat je typt gaat door precies
// dezelfde molen als de gepubliceerde tekst -- dezelfde tabellen, dezelfde
// tijdlijn, dezelfde koppen. Dat is het hele punt: de vorige route liep via een
// JSON-bestand waarin je pas na het terugzetten zag of een kop een kop was
// geworden.
//
// Eén ding staat er met opzet anders bij dan op het scherm: bij een inklapbaar
// onderdeel staat in het voorbeeld alles open. Je bent hier aan het nalezen, en
// een proefdruk waarin driekwart van de tekst achter een dichte kop zit, is
// geen proefdruk. Dat staat erbij, zodat je het niet voor de echte weergave
// aanziet.
function Bewerker({ label, uitleg, waarde, tijdlijn, inklapbaar, opslaan, klaar }) {
  const [tekst, setTekst] = useState(waarde);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const gewijzigd = tekst !== waarde;

  // Een halfafgemaakte correctie is zo weg met een tik op de terugknop of het
  // kruisje. De browser vraagt het dan tenminste na.
  useEffect(() => {
    if (!gewijzigd) return undefined;
    const vraag = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", vraag);
    return () => window.removeEventListener("beforeunload", vraag);
  }, [gewijzigd]);

  async function bewaar() {
    setBezig(true);
    setFout("");
    try {
      await opslaan(tekst);
      klaar(true);
    } catch (err) {
      // De tekst blijft staan. Een foutmelding die je werk meeneemt is geen
      // foutmelding maar een tweede fout.
      setFout(err.message || "Opslaan is niet gelukt. Je tekst staat nog in het veld.");
    } finally {
      setBezig(false);
    }
  }

  function afbreken() {
    if (gewijzigd && !window.confirm("Je wijzigingen zijn nog niet opgeslagen. Weggooien?")) return;
    klaar(false);
  }

  return <div className="to-bewerk">
    <p className="tk-label">{label}</p>
    {uitleg && <p className="to-bewerk-uitleg">{uitleg}</p>}
    <div className="to-bewerk-blad">
      <textarea
        className="tk-tekstvak to-bewerk-veld"
        rows={20}
        maxLength={60000}
        spellCheck
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        aria-label={label}
      />
      <div className="to-bewerk-voorbeeld">
        <p className="to-bewerk-merk">
        Zo komt het op het scherm
        {inklapbaar && <span className="to-bewerk-kanttekening">Hier staat alles open; op het scherm klappen de ### -koppen in.</span>}
      </p>
        <div className="to-bewerk-blik">
          {tekst.trim()
            ? <Tekst tijdlijn={tijdlijn} plaatsBoven>{tekst}</Tekst>
            : <p className="to-bewerk-uitleg">Nog niets ingevuld.</p>}
        </div>
      </div>
    </div>
    {fout && <p role="alert">{fout}</p>}
    <div className="tk-knoppen to-bewerk-knoppen">
      <button className="tk-knop" type="button" disabled={!gewijzigd || bezig} onClick={bewaar}>
        {bezig ? "Opslaan…" : "Opslaan"}
      </button>
      <button className="tk-knop tk-knop-rand tk-knop-klein" type="button" disabled={bezig} onClick={afbreken}>
        Annuleren
      </button>
      <span className="to-bewerk-stand">{tekst.length.toLocaleString("nl-NL")} van 60.000 tekens</span>
    </div>
  </div>;
}

// De titel en de intro staan boven elk onderdeel en horen daarom niet bij één
// onderdeel thuis. Ze zijn kort, dus hier hoeft geen voorbeeld naast: je ziet
// het resultaat zodra je opslaat.
function KopBewerker({ inhoud, opslaan, herladen }) {
  const [titel, setTitel] = useState(inhoud.titel || "");
  const [intro, setIntro] = useState(inhoud.intro || "");
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const gewijzigd = titel !== (inhoud.titel || "") || intro !== (inhoud.intro || "");
  async function bewaar() {
    setBezig(true);
    setMelding("");
    try {
      await opslaan({ titel, intro });
      setMelding("De kop is bijgewerkt.");
      herladen();
    } catch (err) {
      setMelding(err.message || "Opslaan is niet gelukt.");
    } finally {
      setBezig(false);
    }
  }
  return <div className="to-beheer-invoer">
    <label className="tk-label" htmlFor="to-titel">Titel van de omgeving</label>
    <input className="tk-invoer" id="to-titel" maxLength={160} value={titel} onChange={(e) => setTitel(e.target.value)} />
    <label className="tk-label" htmlFor="to-intro">Intro onder de titel</label>
    <textarea className="tk-tekstvak" id="to-intro" rows={3} maxLength={600} value={intro} onChange={(e) => setIntro(e.target.value)} />
    {melding && <p role="status">{melding}</p>}
    <button className="tk-knop" type="button" disabled={!gewijzigd || bezig || !titel.trim()} onClick={bewaar}>
      {bezig ? "Opslaan…" : "Kop bijwerken"}
    </button>
  </div>;
}

// De documenten die er staan, met de mogelijkheid er een weg te halen.
//
// Weghalen is onomkeerbaar en het gaat om iets van het team, niet van de
// begeleider. Daarom in twee stappen, met de titel van het document uitgeschreven
// in de bevestiging: zo staat er tussen jou en de daad een zin die je moet lezen.
//
// En er staat bij wat verwijderen níét doet. Wie het al heeft gedownload houdt
// zijn kopie; dat is geen terugtrekking maar het weghalen van een ingang.
function DocumentenLijst({ team, uid, documenten, herladen }) {
  const [vraag, setVraag] = useState("");
  const [akkoord, setAkkoord] = useState(false);
  const [bezig, setBezig] = useState("");
  const [melding, setMelding] = useState("");
  const lijst = documenten || [];

  function begin(id) {
    setVraag(id === vraag ? "" : id);
    setAkkoord(false);
    setMelding("");
  }
  async function haalWeg(document) {
    setBezig(document.id);
    setMelding("");
    try {
      const uitkomst = await verwijderDocument(team, uid, document.id);
      setVraag(""); setAkkoord(false);
      setMelding(uitkomst.opgeruimd
        ? `"${uitkomst.weg.titel}" staat niet meer in de omgeving.`
        : `"${uitkomst.weg.titel}" staat niet meer in de omgeving, maar het bestand zelf kon niet worden opgeruimd. Niemand kan er nog bij; laat het weten als het weg moet uit de opslag.`);
      herladen();
    } catch (err) {
      setMelding(err.message || "Weghalen is niet gelukt. Er is niets veranderd.");
    } finally {
      setBezig("");
    }
  }

  if (!lijst.length) return null;
  return <div className="to-bijwerken">
    <p className="tk-label">Documenten in deze omgeving</p>
    <ul className="to-weglijst">
      {lijst.map((document) => <li className="to-wegdeel" key={document.id}>
        <div className="to-wegrij">
          <span className="to-wegtekst">
            <strong>{document.titel}</strong>
            <span>{document.naam}</span>
          </span>
          <button className="to-wegknop" type="button" aria-expanded={vraag === document.id} disabled={!!bezig} onClick={() => begin(document.id)}>
            {vraag === document.id ? "Toch niet" : "Weghalen"}
          </button>
        </div>
        {vraag === document.id && <div className="to-wegvraag">
          <label className="tk-keuzevakje">
            <input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} disabled={!!bezig} />
            Ik haal &ldquo;{document.titel}&rdquo; weg uit de omgeving van {team.teamNaam || "dit team"}. Dat kan niet ongedaan worden gemaakt, en wie hem al heeft gedownload houdt zijn kopie.
          </label>
          <button className="tk-knop to-knop-weg" type="button" disabled={!akkoord || !!bezig} onClick={() => haalWeg(document)}>
            {bezig === document.id ? "Weghalen…" : "Definitief weghalen"}
          </button>
        </div>}
      </li>)}
    </ul>
    {melding && <p role="status">{melding}</p>}
  </div>;
}

// Een document toevoegen aan een omgeving die al staat.
//
// Toevoegen kan, vervangen en verwijderen niet -- dat laatste staat ook zo in
// de regels. Daarom staat er bij de knop wat er gaat gebeuren en voor wie het
// zichtbaar wordt: dit is het enige onderdeel van Beheer waarmee je in één klik
// iets aan negen mensen laat zien.
function DocumentToevoegen({ team, uid, documenten, herladen }) {
  const [bestand, setBestand] = useState(null);
  const [titel, setTitel] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [akkoord, setAkkoord] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [klaar, setKlaar] = useState("");

  async function kies(e) {
    setFout(""); setKlaar(""); setBestand(null); setAkkoord(false);
    const gekozen = e.target.files?.[0];
    if (!gekozen) return;
    setBezig(true);
    try {
      const gelezen = await leesPdf(await gekozen.arrayBuffer(), gekozen.name);
      setBestand(gelezen);
      // De bestandsnaam is een bruikbaar voorstel, geen titel. "Hand-in-
      // Handleiding team HR BB 07-juli-2026" is wat er staat; wat het team
      // ervan maakt, bepaalt de begeleider.
      if (!titel.trim()) setTitel(gelezen.naam.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim());
    } catch (err) {
      setFout(err.message || "Dit bestand kon niet worden gelezen.");
    } finally {
      setBezig(false);
    }
  }

  async function voegToe() {
    setBezig(true); setFout(""); setKlaar("");
    try {
      const regel = await voegDocumentToe(team, uid, { ...bestand, titel, beschrijving });
      setBestand(null); setTitel(""); setBeschrijving(""); setAkkoord(false);
      setKlaar(`"${regel.titel}" staat nu bij Documenten. Iedereen in het team kan hem downloaden.`);
      herladen();
    } catch (err) {
      setFout(err.message || "Toevoegen is niet gelukt. Er is niets gepubliceerd.");
    } finally {
      setBezig(false);
    }
  }

  const vol = (documenten || []).length >= 10;
  return <div className="to-bijwerken">
    <p className="tk-label">Document toevoegen</p>
    <p>Een pdf die bij dit team hoort: een terugkoppeling, een handleiding, de uitkomst van een teamdag. Vervangen kan niet — haal de oude weg en voeg de nieuwe toe. {(documenten || []).length} van 10 gebruikt.</p>
    {vol
      ? <p role="alert">Er passen maximaal tien documenten in een teamomgeving.</p>
      : <>
        <label><span className="tk-label">Pdf</span><input type="file" accept=".pdf,application/pdf" onChange={kies} disabled={bezig} /></label>
        {bestand && <div className="to-pakket">
          <strong>{bestand.naam}</strong>
          <span>{Math.round(bestand.base64.length * 0.75 / 1024).toLocaleString("nl-NL")} kB · vingerafdruk {bestand.sha256.slice(0, 12)}…</span>
        </div>}
        {bestand && <label><span className="tk-label">Titel in de lijst</span><input className="tk-invoer" maxLength={160} value={titel} onChange={(e) => setTitel(e.target.value)} disabled={bezig} /></label>}
        {bestand && <label><span className="tk-label">Korte toelichting (mag leeg)</span><input className="tk-invoer" maxLength={300} value={beschrijving} onChange={(e) => setBeschrijving(e.target.value)} disabled={bezig} /></label>}
        {bestand && <label className="tk-keuzevakje to-akkoord">
          <input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} disabled={bezig} />
          Ik voeg dit document toe aan de omgeving van {team.teamNaam || "dit team"}. Iedereen in het team kan het vanaf dat moment downloaden.
        </label>}
        {fout && <p role="alert">{fout}</p>}
        {klaar && <p role="status">{klaar}</p>}
        <button className="tk-knop" type="button" disabled={!bestand || !titel.trim() || !akkoord || bezig} onClick={voegToe}>
          {bezig ? "Bezig…" : "Document toevoegen"}
        </button>
      </>}
  </div>;
}

// De groep waar een onderdeel in zit. Komt uit dezelfde lijst als de navigatie,
// zodat er nooit een label boven de kop staat dat de zijbalk niet kent.
function groepVan(groepen, id) {
  const groep = (groepen || []).find((g) => g.items.some((item) => item.id === id));
  return groep && !groep.apart ? groep.naam : "";
}

function Inrichten({ team, uid, leden, herladen }) {
  const [pakket, setPakket] = useState(null);
  const [tweede, setTweede] = useState("");
  const [akkoord, setAkkoord] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  async function lees(e) {
    setFout(""); setPakket(null); setAkkoord(false);
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 8000000) throw new Error("Het pakket is te groot.");
      setPakket(valideerOmgeving(JSON.parse(await file.text())));
    } catch (err) { setFout(err.message || "Het pakket kon niet worden gelezen."); }
  }
  async function importeer() {
    setBezig(true); setFout("");
    try { await richtOmgevingIn(team, uid, tweede, pakket); herladen(); }
    catch (err) { setFout(err.message || "Inrichten is niet gelukt. Er is niets gepubliceerd."); }
    finally { setBezig(false); }
  }
  return <section className="tk-kaart to-inrichten">
    <h2>Teamomgeving inrichten</h2>
    <p>Dit team heeft nog geen ingerichte omgeving. Kies het voorbereide pakket en controleer de bestemming en de twee begeleiders.</p>
    <label><span className="tk-label">Omgevingspakket</span><input type="file" accept=".json,application/json" onChange={lees} disabled={bezig} /></label>
    {pakket && <div className="to-pakket"><strong>{pakket.inhoud.titel}</strong><span>{pakket.inhoud.onderdelen.length} onderdelen en {pakket.bestanden.length} documenten</span></div>}
    <label><span className="tk-label">Tweede begeleider (naast jou)</span><select className="tk-invoer" value={tweede} onChange={(e) => { setTweede(e.target.value); setAkkoord(false); }} disabled={bezig}><option value="">Kies een bestaand teamlid</option>{leden.filter((l) => l.uid !== uid).map((l) => <option key={l.uid} value={l.uid}>{l.naam || "Teamlid"}</option>)}</select></label>
    <label className="tk-keuzevakje to-akkoord"><input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} disabled={bezig} />Ik publiceer de teamonderdelen en documenten voor {team.teamNaam || "dit team"}. Alleen ik en de gekozen begeleider krijgen toegang tot Beheer.</label>
    {fout && <p role="alert">{fout}</p>}
    <button className="tk-knop" disabled={!pakket || !tweede || !akkoord || bezig} onClick={importeer}>{bezig ? "Omgeving inrichten…" : "Inrichten voor dit team"}</button>
  </section>;
}

function Omgeving({ team, uid, leden, magInrichten }) {
  const { onderdeelId } = useParams();
  const { hash } = useLocation();
  const navigeer = useNavigate();
  const [omgeving, setOmgeving] = useState(null);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");
  const [versie, setVersie] = useState(0);
  const [notities, setNotities] = useState("");
  const [bewerkt, setBewerkt] = useState("");
  const [bezig, setBezig] = useState("");
  const [melding, setMelding] = useState("");
  useEffect(() => {
    let geldig = true;
    setLaden(true); setFout("");
    haalOmgeving(team, uid).then((data) => {
      if (!geldig) return;
      setOmgeving(data); setNotities(data?.beheer?.notities || "");
    }).catch(() => { if (geldig) setFout("De teamomgeving kon niet worden geladen. Controleer je verbinding en teamtoegang en probeer opnieuw."); })
      .finally(() => { if (geldig) setLaden(false); });
    return () => { geldig = false; };
  }, [team.orgId, team.teamId, uid, versie]); // eslint-disable-line react-hooks/exhaustive-deps

  // Welk onderdeel je leest, staat in het adres en niet in de toestand van het
  // scherm. Daardoor werkt de terugknop, overleeft je plek een herlaadbeurt, en
  // kun je een collega wijzen op precies het onderdeel dat je bedoelt.
  const ids = omgeving
    ? [...(omgeving.inhoud.onderdelen || []).map((d) => d.id), "documenten", ...(omgeving.magBeheer ? ["beheer"] : [])]
    : [];
  const tab = ids.includes(onderdeelId) ? onderdeelId : (ids[0] || "");

  // Wie zonder onderdeel binnenkomt -- of met een onderdeel dat niet bestaat --
  // krijgt het eerste, met het adres erbij. Vervangend, zodat de terugknop niet
  // in een lus blijft hangen.
  useEffect(() => {
    if (tab && onderdeelId !== tab) navigeer(maakAdres(tab), { replace: true });
  }, [tab, onderdeelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Naar de aangewezen plek springen. Staat die al in beeld -- bijvoorbeeld
  // omdat je er net zelf op klikte -- dan hoort de pagina niet alsnog te
  // verspringen.
  useEffect(() => {
    const slak = leesHash(hash);
    if (!slak) return undefined;
    const beeld = requestAnimationFrame(() => {
      const el = document.getElementById(slak);
      if (!el || !el.scrollIntoView) return;
      const rand = el.getBoundingClientRect();
      if (rand.top >= 96 && rand.top <= window.innerHeight - 96) return;
      const rustig = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: rustig ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(beeld);
  }, [hash, tab]);

  async function download(bestand) {
    setBezig(bestand.id); setMelding("");
    try {
      const bytes = await haalOmgevingPdf(team, bestand);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = bestand.naam; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMelding("De gecontroleerde pdf is klaar voor downloaden.");
    } catch (err) { setMelding(err.message || "Downloaden is niet gelukt. Probeer opnieuw."); }
    finally { setBezig(""); }
  }
  // Alleen de twee begeleiders komen op dit onderdeel, en het bestand wordt in
  // de browser zelf gemaakt: er gaat niets naar een server.
  function exporteerBron() {
    setMelding("");
    try {
      const tekst = JSON.stringify(maakBronPakket(omgeving), null, 2);
      const url = URL.createObjectURL(new Blob([tekst], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = "teamomgeving-brontekst.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMelding("De brontekst is gedownload.");
    } catch (err) { setMelding(err.message || "De brontekst kon niet worden klaargezet."); }
  }

  async function bewaar() {
    setBezig("notities"); setMelding("");
    try { await bewaarOmgevingNotities(team, notities); setMelding("Bespreeknotities opgeslagen. Alleen de twee aangewezen begeleiders kunnen ze lezen."); }
    catch (err) { setMelding(err.message || "Opslaan is niet gelukt. Je tekst staat nog in het invoerveld."); }
    finally { setBezig(""); }
  }
  if (laden) return <p role="status">Teamomgeving laden…</p>;
  if (fout) return <div role="alert"><p>{fout}</p><button className="tk-knop" onClick={() => setVersie((v) => v + 1)}>Opnieuw proberen</button></div>;
  if (!omgeving) return magInrichten ? <Inrichten team={team} uid={uid} leden={leden} herladen={() => setVersie((v) => v + 1)} /> : <p>Voor dit team is nog geen teamomgeving ingericht.</p>;

  const deel = omgeving.inhoud.onderdelen.find((d) => d.id === tab);
  const documenten = omgeving.inhoud.documenten || [];
  const groepen = maakOnderdelenlijst(omgeving.inhoud, omgeving.magBeheer);
  const bijgewerkt = leesBijgewerkt(omgeving.inhoud);
  const aanvullen = omgeving.magBeheer
    ? "Gebruik hierboven Tekst bewerken om hem te vullen."
    : "De twee begeleiders van dit team vullen dit aan.";

  return <>
    <header className="to-kop">
      <div className="to-koptekst">
        <h1 className="to-titel">{omgeving.inhoud.titel}</h1>
        {omgeving.inhoud.intro && <p className="to-context">{omgeving.inhoud.intro}</p>}
        {bijgewerkt && <p className="to-versheid">Bijgewerkt op {schrijfDatum(bijgewerkt)}</p>}
      </div>
      <Zoeken inhoud={omgeving.inhoud} ga={(id, slak) => { setMelding(""); navigeer(maakAdres(id, slak)); }} />
    </header>

    <div className="to-werkblad">
      <Onderdelen groepen={groepen} actief={tab} kies={(id) => { setMelding(""); navigeer(maakAdres(id)); }} />

      <div className="to-werk">
        {deel && <article className="tk-kaart to-tekst">
          <div className="to-tekstkop">
            <div>
              {groepVan(groepen, deel.id) && <p className="to-eyebrow to-groeplabel">{groepVan(groepen, deel.id)}</p>}
              <h2>{deel.titel}</h2>
            </div>
            {omgeving.magBeheer && bewerkt !== deel.id && (
              <button className="to-bewerkknop" type="button" onClick={() => setBewerkt(deel.id)}>
                <span aria-hidden="true">✎</span> Tekst bewerken
              </button>
            )}
          </div>
          {bewerkt === deel.id
            ? <Bewerker
              label={`Tekst van ${deel.titel}`}
              uitleg="Markdown. ## is een kop, ### maakt een inklapbare sectie, - een opsomming, ** ** vet. Een regel [tijdlijn] zet de lijn op die plek."
              waarde={deel.tekst || ""}
              tijdlijn={leesTijdlijn(deel)}
              inklapbaar={magInklappen(deel)}
              opslaan={(tekst) => werkTekstenBij(team, uid, { onderdeel: { id: deel.id, tekst } })}
              klaar={(bewaard) => { setBewerkt(""); if (bewaard) setVersie((v) => v + 1); }}
            />
            : (!deel.tekst || !deel.tekst.trim()
              ? <Leeg titel="Hier staat nog niets" uitleg={`Dit onderdeel is ingericht maar heeft nog geen inhoud. ${aanvullen}`} />
              : magInklappen(deel)
                ? <Secties deel={deel} tijdlijn={leesTijdlijn(deel)} hash={hash} key={deel.id} />
                : <Tekst tijdlijn={leesTijdlijn(deel)} plaatsBoven>{deel.tekst}</Tekst>)}
          {bewerkt !== deel.id && deel.id === "afspraken" && <Link className="tk-knop to-verder" to="/app/team">Gedeelde teamafspraken bekijken en bijwerken</Link>}
          {bewerkt !== deel.id && deel.id === "experimenten" && <Link className="tk-knop to-verder" to="/app/ik">Mijn experimenten in de app</Link>}
        </article>}

        {tab === "documenten" && <section className="tk-kaart to-tekst">
          <h2>Documenten</h2>
          {documenten.length
            ? <ul className="to-docs">{documenten.map((d) => <li className="to-doc" key={d.id}>
              <span className="to-doc-soort" aria-hidden="true">PDF</span>
              <span className="to-doc-tekst">
                <strong>{d.titel}</strong>
                {d.beschrijving && <span>{d.beschrijving}</span>}
              </span>
              <button className="tk-knop tk-knop-rand tk-knop-klein" disabled={!!bezig} onClick={() => download(d)}>
                {bezig === d.id ? "Controleren…" : "Downloaden"}
              </button>
            </li>)}</ul>
            : <Leeg titel="Nog geen documenten" uitleg={`Hier komen de pdf's van dit team te staan: presentaties, terugkoppelingen en wat er verder is gedeeld. ${aanvullen}`} />}
          {omgeving.inhoud.documentContext && <div className="to-docuitleg"><Tekst>{omgeving.inhoud.documentContext}</Tekst></div>}
        </section>}

        {tab === "beheer" && omgeving.magBeheer && <section className="tk-kaart to-tekst">
          <h2>Beheer</h2>
          <p className="to-privacy">Alleen zichtbaar voor de twee aangewezen begeleiders. Andere teamleden kunnen deze inhoud ook niet rechtstreeks opvragen.</p>
          <Tekst>{omgeving.beheer?.tekst}</Tekst>
          <div className="to-bronexport">
            <button className="tk-knop tk-knop-rand" onClick={exporteerBron}>Brontekst downloaden</button>
            <p>De teksten van alle onderdelen zoals ze in het pakket staan, om na te lezen of te verbeteren. Zonder de bespreeknotities en zonder de pdf&apos;s. Dit bestand bevat teaminhoud: bewaar het net zo zorgvuldig als de rest.</p>
          </div>
          <DocumentenLijst
            team={team}
            uid={uid}
            documenten={omgeving.inhoud.documenten}
            herladen={() => setVersie((v) => v + 1)}
          />
          <DocumentToevoegen
            team={team}
            uid={uid}
            documenten={omgeving.inhoud.documenten}
            herladen={() => setVersie((v) => v + 1)}
          />
          <KopBewerker
            inhoud={omgeving.inhoud}
            opslaan={(wijziging) => werkTekstenBij(team, uid, wijziging)}
            herladen={() => setVersie((v) => v + 1)}
          />
          <Bijwerken team={team} uid={uid} herladen={() => setVersie((v) => v + 1)} />
          <div className="to-beheer-invoer">
            <label className="tk-label" htmlFor="bespreeknotities">Bespreeknotities</label>
            <textarea className="tk-tekstvak" id="bespreeknotities" maxLength={20000} rows={8} value={notities} onChange={(e) => setNotities(e.target.value)} />
            <button className="tk-knop" disabled={!!bezig} onClick={bewaar}>{bezig === "notities" ? "Opslaan…" : "Notities opslaan"}</button>
          </div>
        </section>}

        {melding && <p role="status">{melding}</p>}
      </div>
    </div>
  </>;
}

export default function Teamomgeving() {
  const { actiefTeam, gebruiker, teamOverzicht } = useApp();
  return <div className="tk-inhoud to-omgeving">
    <nav className="to-kruimel" aria-label="Kruimelpad">
      <Link to="/app"><span aria-hidden="true">←</span> Samenwerken</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Teamomgeving</span>
    </nav>
    {actiefTeam && gebruiker
      ? <Omgeving
        key={`${gebruiker.uid}/${actiefTeam.orgId}/${actiefTeam.teamId}`}
        team={actiefTeam}
        uid={gebruiker.uid}
        leden={teamOverzicht.leden}
        magInrichten={!teamOverzicht.laden && magBeheren(teamOverzicht.leden, gebruiker.uid)}
      />
      : <p>Selecteer eerst een team.</p>}
  </div>;
}
