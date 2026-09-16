import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useApp } from "../../lib/app/AppContext";
import { magBeheren } from "../../lib/app/teamrollen";
import { haalOmgeving, haalOmgevingPdf, richtOmgevingIn, bewaarOmgevingNotities, werkOmgevingBij } from "../../lib/app/teamomgevingOpslag";
import { valideerOmgeving, deelTekst, maakBronPakket, maakOnderdelenlijst, leesTijdlijn } from "../../lib/app/teamomgeving";
import "../../styles/teamomgeving.css";

// Geen HTML, afbeeldingen of externe links uit geïmporteerde inhoud uitvoeren.
// Ook binnen een tabelcel gaat de tekst door dezelfde poort; er wordt alleen
// bepaald waar een cel begint en eindigt, nooit wat erin mag.
function Markdown({ children }) {
  return <ReactMarkdown skipHtml disallowedElements={["img", "a"]} unwrapDisallowed>{children || ""}</ReactMarkdown>;
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

function Tekst({ children, tijdlijn }) {
  const delen = deelTekst(children);
  const haltes = tijdlijn || [];
  const heeftPlek = delen.some((deel) => deel.soort === "tijdlijn");
  return <>
    {!heeftPlek && haltes.length > 0 && <Tijdlijn haltes={haltes} />}
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
    <p>Heb je de gedownloade brontekst verbeterd? Kies hem hier om de teksten van alle onderdelen te vervangen. De documenten, de pdf&apos;s en de twee begeleiders blijven zoals ze zijn.</p>
    <label><span className="tk-label">Verbeterd pakket</span><input type="file" accept=".json,application/json" onChange={lees} disabled={bezig} /></label>
    {pakket && <div className="to-pakket"><strong>{pakket.inhoud.titel}</strong><span>{pakket.inhoud.onderdelen.length} onderdelen</span></div>}
    {pakket && <label className="tk-keuzevakje to-akkoord"><input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} disabled={bezig} />Ik vervang de teksten van {team.teamNaam || "dit team"} door de teksten uit dit bestand.</label>}
    {fout && <p role="alert">{fout}</p>}
    {klaar && <p role="status">{klaar}</p>}
    <button className="tk-knop tk-knop-rand" disabled={!pakket || !akkoord || bezig} onClick={bijwerken}>{bezig ? "Bijwerken…" : "Teksten bijwerken"}</button>
  </div>;
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
  const [omgeving, setOmgeving] = useState(null);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");
  const [versie, setVersie] = useState(0);
  const [tab, setTab] = useState("");
  const [notities, setNotities] = useState("");
  const [bezig, setBezig] = useState("");
  const [melding, setMelding] = useState("");
  useEffect(() => {
    let geldig = true;
    setLaden(true); setFout("");
    haalOmgeving(team, uid).then((data) => {
      if (!geldig) return;
      setOmgeving(data); setNotities(data?.beheer?.notities || "");
      setTab(data?.inhoud?.onderdelen?.[0]?.id || "");
    }).catch(() => { if (geldig) setFout("De teamomgeving kon niet worden geladen. Controleer je verbinding en teamtoegang en probeer opnieuw."); })
      .finally(() => { if (geldig) setLaden(false); });
    return () => { geldig = false; };
  }, [team.orgId, team.teamId, uid, versie]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const aanvullen = omgeving.magBeheer
    ? "Je kunt de brontekst bij Beheer downloaden, aanvullen en als nieuw pakket aanleveren."
    : "De twee begeleiders van dit team vullen dit aan.";

  return <>
    <header className="to-kop">
      <h1 className="to-titel">{omgeving.inhoud.titel}</h1>
      {omgeving.inhoud.intro && <p className="to-context">{omgeving.inhoud.intro}</p>}
    </header>

    <div className="to-werkblad">
      <Onderdelen groepen={groepen} actief={tab} kies={(id) => { setTab(id); setMelding(""); }} />

      <div className="to-werk">
        {deel && <article className="tk-kaart to-tekst">
          <h2>{deel.titel}</h2>
          {deel.tekst && deel.tekst.trim()
            ? <Tekst tijdlijn={leesTijdlijn(deel)}>{deel.tekst}</Tekst>
            : <Leeg titel="Hier staat nog niets" uitleg={`Dit onderdeel is ingericht maar heeft nog geen inhoud. ${aanvullen}`} />}
          {deel.id === "afspraken" && <Link className="tk-knop" to="/app/team">Gedeelde teamafspraken bekijken en bijwerken</Link>}
          {deel.id === "experimenten" && <Link className="tk-knop" to="/app/ik">Mijn experimenten in de app</Link>}
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
