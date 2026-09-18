// De teamcheck: invullen, en voor de begeleiders het teambeeld.
//
// Eén vraag per scherm, en Volgende pas als je iets hebt gekozen. Dat laatste
// is geen strengheid maar eerlijkheid: als je vragen kunt overslaan, weet
// niemand achteraf of een lege plek "ik weet het niet" betekende of "ik heb
// hem niet gezien". Daarom is "Kan ik nog niet beoordelen" een echte keuze en
// geen weggelaten antwoord.
//
// Het overzicht eronder ziet alleen wie in deze omgeving begeleider is. Niet
// omdat dit onderdeel dat regelt -- de regels in Firestore doen dat, en de
// aanroep faalt gewoon voor een ander -- maar het scherm hoort niet te tonen
// wat het niet mag hebben.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STELLINGEN, OPEN_VRAAG, SCHAAL, RONDES, DREMPEL,
  gemiddelde, verdeling, magTonen, respons, sterkste, meestVerdeeld,
  isCompleet, maakEigenDownload, leesRonde,
} from "../../lib/app/teamcheck";
import {
  haalRondes, haalEigenAntwoord, bewaarAntwoord, trekAntwoordIn,
  haalAlleAntwoorden, zetRonde,
} from "../../lib/app/teamcheckOpslag";
import { schrijfDatum } from "../../lib/app/teamomgeving";

const RONDE_IDS = RONDES.map((r) => r.id);

/** De drie meetmomenten, als stappen waar je tussen kunt wisselen. */
function Rondekiezer({ rondes, gekozen, kies }) {
  return <div className="tc-rondes" role="tablist" aria-label="Meetmomenten">
    {RONDES.map((ronde) => {
      const stand = (rondes[ronde.id] || {}).status || "nietgeopend";
      return <button
        key={ronde.id}
        className="tc-ronde"
        type="button"
        role="tab"
        aria-selected={gekozen === ronde.id}
        data-actief={gekozen === ronde.id ? "ja" : undefined}
        onClick={() => kies(ronde.id)}
      >
        <span className="tc-ronde-bol">{ronde.dagen}</span>
        <span className="tc-ronde-tekst">
          <strong>{ronde.naam}</strong>
          <small>{stand === "open" ? ronde.vraag : stand === "gesloten" ? "Gesloten" : "Nog niet open"}</small>
        </span>
      </button>;
    })}
  </div>;
}

/** Eén stelling met de vijf kaarten en de losse keuze eronder. */
function Vraag({ stelling, waarde, kies }) {
  const gekozen = (w) => (waarde === w ? "ja" : undefined);
  return <>
    <p className="to-eyebrow">{stelling.thema}</p>
    <h3 className="tc-stelling">{stelling.tekst}</h3>
    <div className="tc-schaal" role="radiogroup" aria-label={stelling.tekst}>
      {SCHAAL.map((stap) => <button
        key={stap.waarde}
        className="tc-kaart"
        type="button"
        role="radio"
        aria-checked={waarde === stap.waarde}
        data-gekozen={gekozen(stap.waarde)}
        onClick={() => kies(stap.waarde)}
      >
        <span className="tc-cijfer">{stap.waarde}</span>
        <span className="tc-label">{stap.label}</span>
      </button>)}
    </div>
    <button
      className="tc-nietbeoordelen"
      type="button"
      role="radio"
      aria-checked={waarde === null}
      data-gekozen={gekozen(null)}
      onClick={() => kies(null)}
    >
      <span className="tc-rondje" aria-hidden="true" />
      Kan ik nog niet beoordelen
    </button>
  </>;
}

/** De wizard: vijf stellingen, dan de open vraag met de naamkeuze. */
function Formulier({ afspraken, bestaand, naam, bezig, bewaren }) {
  const [stap, setStap] = useState(0);
  const [scores, setScores] = useState(() => (bestaand && bestaand.scores) || {});
  const [open, setOpen] = useState(() => (bestaand && bestaand.open) || "");
  const [naamErbij, setNaamErbij] = useState(() => Boolean(bestaand && bestaand.naamErbij));

  const laatste = STELLINGEN.length; // de open vraag is stap 5 (nul-geteld)
  const stelling = STELLINGEN[stap] || null;
  const gekozen = stelling ? scores[stelling.id] : undefined;
  const heeftKeuze = stelling ? Object.prototype.hasOwnProperty.call(scores, stelling.id) : true;

  function kies(waarde) {
    setScores((oud) => ({ ...oud, [stelling.id]: waarde }));
  }

  return <div className="tc-blad">
    <div className="tc-vorderingkop">
      <span>Vraag {stap + 1} van {laatste + 1}</span>
      {afspraken.length > 0 && <span className="tc-periode">Vanuit de afgelopen twee weken</span>}
    </div>
    <div className="tc-vordering" aria-hidden="true">
      <span style={{ width: `${((stap + 1) / (laatste + 1)) * 100}%` }} />
    </div>

    {stelling
      ? <Vraag stelling={stelling} waarde={gekozen} kies={kies} />
      : <>
        <p className="to-eyebrow">Tot slot</p>
        <h3 className="tc-stelling">{OPEN_VRAAG}</h3>
        <textarea
          className="tk-tekstvak"
          value={open}
          maxLength={2000}
          onChange={(e) => setOpen(e.target.value)}
          placeholder="Wat je hier schrijft, lezen alleen de twee begeleiders."
        />
        <label className="tk-keuzevakje tc-naamkeuze">
          <input type="checkbox" checked={naamErbij} onChange={(e) => setNaamErbij(e.target.checked)} />
          <span>
            <strong>Mijn naam mag bij mijn antwoorden staan</strong>
            <small>
              Laat je dit uit, dan staat er geen naam bij je antwoorden in het overzicht.
              Zet je het aan, dan weten de begeleiders dat dit van jou komt — handig als je
              erover door wilt praten.
            </small>
          </span>
        </label>
      </>}

    <div className="tc-knoppen">
      <button className="tk-tekstknop tc-terug" type="button" disabled={stap === 0} onClick={() => setStap((s) => s - 1)}>
        ← Vorige
      </button>
      {stap < laatste
        ? <button className="tk-knop tc-volgende" type="button" disabled={!heeftKeuze} onClick={() => setStap((s) => s + 1)}>
          Volgende →
        </button>
        : <button className="tk-knop" type="button" disabled={bezig} onClick={() => bewaren({ scores, open, naamErbij, naam })}>
          {bezig ? "Opslaan…" : "Mijn antwoorden opslaan"}
        </button>}
    </div>
    {!heeftKeuze && stap < laatste && <p className="tk-fijn tc-hint">
      Kies een antwoord, of geef aan dat je het nog niet kunt beoordelen. Een vraag overslaan kan niet:
      dan weet later niemand of je hem niet kon beantwoorden of niet hebt gezien.
    </p>}
  </div>;
}

/** Wat je ziet als je klaar bent. */
function Klaar({ antwoord, ronde, magWijzigen, opnieuw, intrekken, download, bezig }) {
  return <div className="tc-blad tc-klaar">
    <span className="tc-vink" aria-hidden="true">✓</span>
    <p className="to-eyebrow">Even stilstaan helpt vooruit</p>
    <h3 className="tc-stelling">Dank je voor je reflectie.</h3>
    <p>
      Je antwoorden zijn opgeslagen. Ze tellen mee in het teambeeld dat de twee begeleiders
      gebruiken om het gesprek voor te bereiden. Je collega’s zien ze niet.
      {antwoord && antwoord.naamErbij
        ? " Je koos ervoor je naam erbij te zetten."
        : " Er staat geen naam bij."}
    </p>
    <div className="tk-knoppen">
      <button className="tk-knop tk-knop-rand tk-knop-klein" type="button" onClick={download}>
        Mijn antwoorden downloaden
      </button>
      {magWijzigen && <button className="tk-knop tk-knop-rand tk-knop-klein" type="button" onClick={opnieuw}>
        Antwoorden wijzigen
      </button>}
      {magWijzigen && <button className="tk-stille-knop tc-intrekken" type="button" disabled={bezig} onClick={intrekken}>
        Mijn inzending intrekken
      </button>}
    </div>
    {!magWijzigen && <p className="tk-fijn">
      Deze ronde is gesloten; wijzigen kan niet meer. Downloaden wel — je eigen antwoorden blijven van jou.
    </p>}
    {ronde && <p className="tk-fijn">Meetmoment: na {ronde.dagen} dagen — {ronde.naam}.</p>}
  </div>;
}

/** Een staafje voor een gemiddelde op de schaal 1–5. */
function Balk({ stelling, uit }) {
  const breedte = uit.gemiddelde === null ? 0 : ((uit.gemiddelde - 1) / 4) * 100;
  return <li className="tc-balkrij">
    <span className="tc-balklabel">{stelling.thema}</span>
    <span className="tc-balkspoor" aria-hidden="true">
      <span className="tc-balkvulling" style={{ width: `${breedte}%` }} />
    </span>
    <span className="tc-balkcijfer">
      <strong>{uit.gemiddelde === null ? "—" : uit.gemiddelde.toFixed(1).replace(".", ",")}</strong>
      <small>n = {uit.n}</small>
    </span>
  </li>;
}

/** Het teambeeld. Alleen voor de twee aangewezen begeleiders. */
function Overzicht({ antwoorden, aantalLeden }) {
  const [gekozen, setGekozen] = useState(STELLINGEN[0].id);
  const compleet = useMemo(() => antwoorden.filter(isCompleet), [antwoorden]);
  const telling = respons(antwoorden, aantalLeden);

  if (!magTonen(compleet.length)) {
    return <section className="tc-overzicht">
      <p className="to-eyebrow">Begeleidersoverzicht</p>
      <h3 className="tc-stelling">Nog te weinig antwoorden</h3>
      <p>
        {telling.ingevuld === 0
          ? "Er heeft nog niemand ingevuld."
          : `${telling.ingevuld} van de ${telling.totaal || "?"} teamleden heeft ingevuld.`}
        {" "}Vanaf {DREMPEL} antwoorden tonen we het teambeeld. Daaronder is elk gemiddelde
        terug te rekenen naar wie wat invulde, en dan is een anonieme vragenlijst er geen meer.
      </p>
    </section>;
  }

  const beste = sterkste(compleet);
  const verdeeld = meestVerdeeld(compleet);
  const detail = verdeling(compleet, gekozen);
  const stemmen = compleet.filter((a) => (a.open || "").trim());

  return <section className="tc-overzicht">
    <p className="to-eyebrow">Begeleidersoverzicht</p>
    <h3 className="tc-stelling">Wat het team laat zien</h3>

    <div className="tc-tegels">
      <div className="tc-tegel">
        <small>Respons</small>
        <strong>{telling.ingevuld} / {telling.totaal || "?"}</strong>
        <small>teamleden</small>
      </div>
      <div className="tc-tegel">
        <small>Wat gaat goed?</small>
        <strong>{beste ? beste.thema : "—"}</strong>
        <small>{beste ? `${beste.gemiddelde.toFixed(1).replace(".", ",")} van 5` : ""}</small>
      </div>
      <div className="tc-tegel tc-tegel-let">
        <small>Om samen te onderzoeken</small>
        <strong>{verdeeld ? verdeeld.thema : "—"}</strong>
        <small>{verdeeld ? "De ervaringen lopen hier het meest uiteen." : ""}</small>
      </div>
    </div>

    <h4 className="tc-kop">De ontwikkeling in beeld</h4>
    <p className="tk-fijn">Gemiddelde per stelling, op een schaal van 1 tot 5. Wie niet kon oordelen telt niet mee.</p>
    <ul className="tc-balken">
      {STELLINGEN.map((stelling) => <Balk key={stelling.id} stelling={stelling} uit={gemiddelde(compleet, stelling.id)} />)}
    </ul>

    <h4 className="tc-kop">Ervaren we hetzelfde?</h4>
    <p className="tk-fijn">
      Hier zie je of een gemiddelde van 3,0 betekent dat iedereen neutraal is, of dat de helft
      oneens is en de helft eens. Dat verschil is waar het gesprek over gaat.
    </p>
    <label className="tk-label" htmlFor="tc-verdeling">Bekijk de verdeling</label>
    <select id="tc-verdeling" className="tk-invoer tc-kiezer" value={gekozen} onChange={(e) => setGekozen(e.target.value)}>
      {STELLINGEN.map((s) => <option key={s.id} value={s.id}>{s.thema}</option>)}
    </select>
    <ul className="tc-verdeling">
      {SCHAAL.map((stap) => {
        const aantal = detail.tellingen[stap.waarde];
        const breedte = detail.n ? (aantal / Math.max(...Object.values(detail.tellingen), 1)) * 100 : 0;
        return <li key={stap.waarde}>
          <span className="tc-verdeling-cijfer">{stap.waarde}</span>
          <span className="tc-balkspoor" aria-hidden="true"><span className="tc-balkvulling tc-zacht" style={{ width: `${breedte}%` }} /></span>
          <span className="tc-verdeling-aantal">{aantal}×</span>
        </li>;
      })}
    </ul>
    <p className="tk-fijn">
      1 = helemaal oneens · 5 = helemaal eens. {detail.nietTeBeoordelen}× nog niet te beoordelen.
      {detail.n} geldige {detail.n === 1 ? "antwoord" : "antwoorden"}
      {detail.gemiddelde !== null ? `; gemiddelde ${detail.gemiddelde.toFixed(1).replace(".", ",")}` : ""}.
    </p>

    <h4 className="tc-kop">Wat mensen erbij schreven</h4>
    {stemmen.length === 0
      ? <p className="tk-fijn">Niemand heeft de open vraag ingevuld.</p>
      : <ul className="tc-stemmen">
        {stemmen.map((a, i) => <li key={i}>
          <blockquote>{a.open.trim()}</blockquote>
          {a.naam ? <cite>— {a.naam}</cite> : <cite className="tc-naamloos">— naamloos</cite>}
        </li>)}
      </ul>}
    <p className="tk-fijn">
      In een team van deze omvang is een open antwoord vaak herkenbaar aan de formulering, ook
      zonder naam. Ga er voorzichtig mee om in het gesprek.
    </p>
  </section>;
}

export default function Teamcheck({ team, uid, naam, magBeheer, aantalLeden }) {
  const [rondes, setRondes] = useState(null);
  const [ronde, setRonde] = useState(RONDE_IDS[0]);
  const [eigen, setEigen] = useState(null);
  const [alles, setAlles] = useState([]);
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [wijzigen, setWijzigen] = useState(false);
  const [melding, setMelding] = useState("");
  const [fout, setFout] = useState("");
  const [versie, setVersie] = useState(0);

  const stand = (rondes && rondes[ronde] && rondes[ronde].status) || "nietgeopend";
  const open = stand === "open";

  const laad = useCallback(async () => {
    setLaden(true); setFout("");
    try {
      const standen = await haalRondes(team, RONDE_IDS);
      setRondes(standen);
      const bestaat = standen[ronde] && standen[ronde].status !== "nietgeopend";
      setEigen(bestaat ? await haalEigenAntwoord(team, ronde, uid) : null);
      setAlles(magBeheer && bestaat ? await haalAlleAntwoorden(team, ronde) : []);
    } catch {
      setFout("De teamcheck kon niet worden geladen. Controleer je verbinding en probeer het opnieuw.");
    } finally { setLaden(false); }
  }, [team, uid, ronde, magBeheer]);

  useEffect(() => { laad(); }, [laad, versie]);

  async function bewaren(antwoord) {
    setBezig(true); setMelding("");
    try {
      await bewaarAntwoord(team, ronde, uid, antwoord);
      setWijzigen(false);
      setMelding("Je antwoorden zijn opgeslagen.");
      setVersie((v) => v + 1);
    } catch (err) {
      setMelding(err.message || "Opslaan is niet gelukt. Je antwoorden staan nog op het scherm.");
    } finally { setBezig(false); }
  }

  async function intrekken() {
    setBezig(true); setMelding("");
    try {
      await trekAntwoordIn(team, ronde, uid);
      setMelding("Je inzending is ingetrokken. Je kunt opnieuw invullen zolang deze ronde openstaat.");
      setVersie((v) => v + 1);
    } catch (err) {
      setMelding(err.message || "Intrekken is niet gelukt.");
    } finally { setBezig(false); }
  }

  async function wisselRonde(status) {
    setBezig(true); setMelding("");
    try {
      await zetRonde(team, ronde, uid, status);
      setMelding(status === "open" ? "Deze ronde staat open; het team kan invullen." : "Deze ronde is gesloten.");
      setVersie((v) => v + 1);
    } catch (err) {
      setMelding(err.message || "Dat is niet gelukt.");
    } finally { setBezig(false); }
  }

  function download() {
    const datum = eigen && eigen.ingevuldOp && eigen.ingevuldOp.toDate ? schrijfDatum(eigen.ingevuldOp.toDate()) : "";
    const tekst = maakEigenDownload(eigen, ronde, datum);
    const url = URL.createObjectURL(new Blob([tekst], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `mijn-teamcheck-${ronde}.txt`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  if (laden) return <p role="status">Teamcheck laden…</p>;
  if (fout) return <div role="alert"><p>{fout}</p><button className="tk-knop" type="button" onClick={() => setVersie((v) => v + 1)}>Opnieuw proberen</button></div>;

  const rondeInfo = leesRonde(ronde);
  const klaar = eigen && !wijzigen;

  return <section className="tc">
    <Rondekiezer rondes={rondes} gekozen={ronde} kies={(id) => { setRonde(id); setWijzigen(false); setMelding(""); }} />

    {magBeheer && <div className="tc-beheer">
      <span className="tk-fijn">
        {stand === "open" ? "Deze ronde staat open." : stand === "gesloten" ? "Deze ronde is gesloten." : "Deze ronde is nog niet geopend."}
      </span>
      <button className="tk-knop tk-knop-rand tk-knop-klein" type="button" disabled={bezig}
        onClick={() => wisselRonde(open ? "gesloten" : "open")}>
        {open ? "Ronde sluiten" : "Ronde openen"}
      </button>
    </div>}

    {melding && <p className="tk-melding" role="status">{melding}</p>}

    {stand === "nietgeopend" && <p className="tc-wacht">
      Dit meetmoment staat nog niet open. De begeleiders zetten hem open als het zover is.
    </p>}

    {stand !== "nietgeopend" && (klaar
      ? <Klaar
        antwoord={eigen}
        ronde={rondeInfo}
        magWijzigen={open}
        opnieuw={() => setWijzigen(true)}
        intrekken={intrekken}
        download={download}
        bezig={bezig}
      />
      : open
        ? <>
          <p className="tc-uitleg">
            <strong>Wat er met je antwoorden gebeurt.</strong> Je collega’s zien ze niet — alleen de twee
            begeleiders van deze omgeving. Er staat geen naam bij, tenzij je daar zelf voor kiest.
            Je antwoorden worden wel op jouw account bewaard, zodat je ze kunt bijstellen en downloaden;
            dat betekent ook dat de begeleiders, als beheerders, technisch bij de gegevens kunnen.
            Het teambeeld verschijnt pas vanaf {DREMPEL} antwoorden.
          </p>
          <Formulier afspraken={[]} bestaand={eigen} naam={naam} bezig={bezig} bewaren={bewaren} />
        </>
        : <p className="tc-wacht">Deze ronde is gesloten en je hebt hem niet ingevuld.</p>)}

    {magBeheer && stand !== "nietgeopend" && <Overzicht antwoorden={alles} aantalLeden={aantalLeden} />}
  </section>;
}
