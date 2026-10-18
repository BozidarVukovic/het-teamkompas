// Mijn kwartaaldoelen.
//
// Het eerste scherm op de kwartaalkern. Hier schrijf je op wat je dit kwartaal
// wilt bereiken, hoeveel ruimte je ervoor hebt, en wat je daarvan met je team
// deelt.
//
// Drie dingen die dit scherm met opzet niet doet.
//
// Het toont geen voortgangspercentage. Wat er loopt, zeg je zelf in één regel;
// de app weet niet hoe ver je bent en gaat daar niet naar raden.
//
// Het telt je doelen niet. Vier doelen is niet beter dan twee, en een teller
// nodigt uit om te scoren op een getal dat niets zegt.
//
// En delen is niet afspreken. Een doel delen betekent dat je team het kan
// lezen; het is geen toezegging van capaciteit, medewerking of voorrang. Die
// twee staan daarom als twee aparte stappen op de kaart.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import useActie from "../../components/app/useActie";
import Melding from "../../components/app/Melding";
import {
  bewaarBijdrage,
  bewaarRuimte,
  haalEigenBijdragen,
  haalEigenDoelen,
  haalGedeeldeDoelen,
  haalRuimte,
  maakDoel,
  verwijderBijdrage,
  verwijderConcept,
  werkDoelBij,
} from "../../lib/app/kwartaal/opslag";
import { huidigKwartaal, kwartaalPeriode, lijktOpActiviteit } from "../../lib/app/kwartaal/model";
import {
  STATUSLABELS,
  datumVanWeek,
  duurLabel,
  kaartregels,
  kwartaalLabel,
  kwartaalOpties,
  periodeLabel,
  sorteerDoelen,
  urenLabel,
  volgendeStap,
  weekVanDatum,
  zichtbaarVoor,
} from "../../lib/app/kwartaal/weergave";
import "../../styles/kwartaal.css";

/* ════════════════════════════════════════════════════════ kleine bouwstenen */

function Weekveld({ id, label, waarde, zet }) {
  // Een datumveld en geen weekveld: Safari kent input[type=week] niet en maakt
  // er stilletjes een tekstvak van. Je kiest een dag, de app rekent er de week
  // bij -- en laat die er ook bij zien, zodat duidelijk is wat er wordt
  // opgeslagen.
  return (
    <label className="kd-veld">
      <span className="tk-label">{label}</span>
      <input
        id={id}
        type="date"
        className="tk-invoer"
        value={datumVanWeek(waarde)}
        onChange={(e) => zet(weekVanDatum(e.target.value))}
      />
      {waarde && <span className="tk-fijn">{periodeLabel({ van: waarde, tot: waarde })}</span>}
    </label>
  );
}

function Urenveld({ id, label, waarde, zet }) {
  return (
    <label className="kd-veld">
      <span className="tk-label">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        max="60"
        step="0.25"
        className="tk-invoer"
        value={waarde === null || waarde === undefined ? "" : waarde}
        onChange={(e) => zet(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="bijvoorbeeld 3"
      />
      <span className="tk-fijn">Laat leeg als je het nog niet weet. Leeg is iets anders dan nul.</span>
    </label>
  );
}

/* ═══════════════════════════════════════════════════ je beschikbare ruimte */

function Ruimte({ team, uid, kwartaal, regels, opnieuw }) {
  const [open, setOpen] = useState(false);
  const [lijst, setLijst] = useState([]);
  const { bezig, melding, voerUit, wisMelding } = useActie();
  const venster = kwartaalPeriode(kwartaal);

  useEffect(() => {
    setLijst(regels.length > 0 ? regels : [{ ...venster, urenPerWeek: null }]);
    setOpen(false);
  }, [kwartaal, regels]); // eslint-disable-line react-hooks/exhaustive-deps

  const zet = (i, veld, waarde) =>
    setLijst((oud) => oud.map((r, n) => (n === i ? { ...r, [veld]: waarde } : r)));

  const bewaar = () =>
    voerUit(
      "je beschikbare ruimte bewaren",
      async () => {
        await bewaarRuimte(team, uid, kwartaal, lijst.filter((r) => r.van && r.tot));
        await opnieuw();
      },
      "Je ruimte is bijgewerkt."
    );

  return (
    <section className="tk-kaart kd-ruimte">
      <h2>Mijn beschikbare ruimte</h2>
      <p className="tk-fijn" style={{ margin: "0 0 14px" }}>
        Niet je contracturen: wat er overblijft naast je reguliere werk, je andere verplichtingen,
        je vrije dagen en de lucht die je zelf wilt houden. Je team ziet deze uren. Waaróm je er
        minder hebt, wordt niet gevraagd en niet bewaard.
      </p>

      <Melding melding={melding} onSluiten={wisMelding} />

      {!open && regels.length === 0 && (
        <>
          <p className="kd-leeg">Nog niet ingevuld. Zonder deze uren kan het teamoverzicht niet
            zeggen of iets erbij past — het zegt dan dat het dat niet weet.</p>
          <button type="button" className="tk-knop" onClick={() => setOpen(true)}>
            Mijn ruimte invullen
          </button>
        </>
      )}

      {!open && regels.length > 0 && (
        <>
          <ul className="kd-ruimtelijst">
            {regels.map((r) => (
              <li key={`${r.van}-${r.tot}`}>
                <strong>{urenLabel(r.urenPerWeek)}</strong>
                <span>{periodeLabel(r)} · {duurLabel(r)}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => setOpen(true)}>
            Aanpassen
          </button>
        </>
      )}

      {open && (
        <>
          {lijst.map((r, i) => (
            <div className="kd-ruimterij" key={i}>
              <Weekveld id={`ruimte-van-${i}`} label="Van" waarde={r.van} zet={(w) => zet(i, "van", w)} />
              <Weekveld id={`ruimte-tot-${i}`} label="Tot en met" waarde={r.tot} zet={(w) => zet(i, "tot", w)} />
              <Urenveld id={`ruimte-uren-${i}`} label="Uren per week" waarde={r.urenPerWeek} zet={(u) => zet(i, "urenPerWeek", u)} />
              {lijst.length > 1 && (
                <button type="button" className="tk-tekstknop" onClick={() => setLijst((o) => o.filter((_, n) => n !== i))}>
                  Deze regel weghalen
                </button>
              )}
            </div>
          ))}
          <div className="tk-knoppen">
            <button type="button" className="tk-knop" disabled={bezig} onClick={bewaar}>
              {bezig ? "Bewaren…" : "Bewaren"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => setLijst((o) => [...o, { van: "", tot: "", urenPerWeek: null }])}
            >
              Een periode erbij
            </button>
            <button type="button" className="tk-tekstknop" onClick={() => setOpen(false)}>Annuleren</button>
          </div>
          <p className="tk-fijn" style={{ marginTop: 10 }}>
            Een tweede regel is voor een periode die afwijkt — een week met een cursus of een
            vakantie. De laatste regel die op een week past, telt.
          </p>
        </>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════ een doel aanmaken */

const LEEG = {
  titel: "",
  succes: "",
  teamdoel: "",
  gewenstVan: "",
  gewenstTot: "",
  hulpvraag: "",
  toelichting: "",
  urenPerWeek: null,
  van: "",
  tot: "",
};

function Formulier({ kwartaal, gedeeld, opBewaren, opSluiten, bezig }) {
  const [soort, setSoort] = useState("eigen");
  const [aanDoelId, setAanDoelId] = useState("");
  const [veld, setVeld] = useState(() => ({ ...LEEG, ...kwartaalPeriode(kwartaal) }));
  const zet = (naam, waarde) => setVeld((o) => ({ ...o, [naam]: waarde }));
  const hint = soort === "eigen" ? lijktOpActiviteit(veld.titel) : null;

  return (
    <div className="tk-kaart kd-formulier">
      <h3>{soort === "eigen" ? "Een nieuw doel" : "Een bijdrage aan een bestaand doel"}</h3>

      <div className="kd-soort" role="group" aria-label="Wat voeg je toe?">
        <button type="button" className={soort === "eigen" ? "gekozen" : ""} aria-pressed={soort === "eigen"} onClick={() => setSoort("eigen")}>
          Ik start een nieuw doel
        </button>
        <button type="button" className={soort === "bijdrage" ? "gekozen" : ""} aria-pressed={soort === "bijdrage"} onClick={() => setSoort("bijdrage")} disabled={gedeeld.length === 0}>
          Ik draag bij aan een bestaand doel
        </button>
      </div>
      {gedeeld.length === 0 && (
        <p className="tk-fijn">Er zijn nog geen gedeelde doelen van je team om aan bij te dragen.</p>
      )}

      {soort === "bijdrage" ? (
        <label className="kd-veld">
          <span className="tk-label">Aan welk doel?</span>
          <select className="tk-keuzeveld" value={aanDoelId} onChange={(e) => setAanDoelId(e.target.value)}>
            <option value="">Kies een doel…</option>
            {gedeeld.map((d) => (
              <option key={d.id} value={d.id}>{d.titel}</option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <label className="kd-veld">
            <span className="tk-label">Welk resultaat wil je bereiken?</span>
            <textarea
              className="tk-tekstvak"
              rows={2}
              maxLength={160}
              value={veld.titel}
              onChange={(e) => zet("titel", e.target.value)}
              placeholder="Een bruikbare werkwijze voor instroom die het team zelf kan draaien"
            />
            {/* Een duwtje, geen slot: wie zijn doel zo wil opschrijven, mag dat. */}
            {hint && <span className="kd-hint">{hint.vraag}</span>}
          </label>

          <label className="kd-veld">
            <span className="tk-label">Wanneer is het geslaagd?</span>
            <textarea
              className="tk-tekstvak"
              rows={2}
              maxLength={400}
              value={veld.succes}
              onChange={(e) => zet("succes", e.target.value)}
              placeholder="Als er een proef is uitgevoerd en het team de vervolgkeuze heeft gemaakt"
            />
          </label>
        </>
      )}

      <div className="kd-twee">
        <Weekveld id="inzet-van" label="Mijn inzet loopt van" waarde={veld.van} zet={(w) => zet("van", w)} />
        <Weekveld id="inzet-tot" label="Tot en met" waarde={veld.tot} zet={(w) => zet("tot", w)} />
      </div>
      <Urenveld id="inzet-uren" label="Hoeveel uur per week kost het je?" waarde={veld.urenPerWeek} zet={(u) => zet("urenPerWeek", u)} />

      {soort === "eigen" && (
        <details className="tk-verdieping">
          <summary>Meer invullen</summary>
          <div className="kd-meer">
            <label className="kd-veld">
              <span className="tk-label">Hoort bij welk teamdoel of jaarplan?</span>
              <input className="tk-invoer" maxLength={200} value={veld.teamdoel} onChange={(e) => zet("teamdoel", e.target.value)} />
            </label>
            <div className="kd-twee">
              <Weekveld id="gewenst-van" label="Gewenste start" waarde={veld.gewenstVan} zet={(w) => zet("gewenstVan", w)} />
              <Weekveld id="gewenst-tot" label="Gewenst klaar" waarde={veld.gewenstTot} zet={(w) => zet("gewenstTot", w)} />
            </div>
            <label className="kd-veld">
              <span className="tk-label">Waar heb je hulp bij nodig?</span>
              <textarea className="tk-tekstvak" rows={2} maxLength={1000} value={veld.hulpvraag} onChange={(e) => zet("hulpvraag", e.target.value)} />
            </label>
            <label className="kd-veld">
              <span className="tk-label">Wat is er verder van belang?</span>
              <textarea className="tk-tekstvak" rows={3} maxLength={1000} value={veld.toelichting} onChange={(e) => zet("toelichting", e.target.value)} />
            </label>
          </div>
        </details>
      )}

      <p className="tk-fijn">
        Wat je nu bewaart is een concept: alleen jij ziet het. Delen met je team doe je daarna, met
        een eigen knop.
      </p>

      <div className="tk-knoppen">
        <button
          type="button"
          className="tk-knop"
          disabled={bezig || (soort === "bijdrage" && !aanDoelId)}
          onClick={() => opBewaren({ soort, aanDoelId, veld })}
        >
          {bezig ? "Bewaren…" : "Bewaren als concept"}
        </button>
        <button type="button" className="tk-tekstknop" onClick={opSluiten}>Annuleren</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ één doelkaart */

function Doelkaart({ doel, bijdragen, opStatus, opWeg, bezig }) {
  const stap = volgendeStap(doel);
  const regels = kaartregels(doel, bijdragen);
  const eigen = bijdragen.filter((b) => b.doelId === doel.id);

  return (
    <article className="tk-kaart kd-doel" id={doel.id}>
      <div className="kd-doel-kop">
        <strong className="kd-doel-titel">{doel.titel}</strong>
        <span className={`kd-status kd-status-${doel.status}`}>{STATUSLABELS[doel.status]}</span>
      </div>

      <p className="kd-doel-succes"><span className="kd-doel-wat">Geslaagd als</span> {doel.succes}</p>

      {regels.map((r) => (
        <p className="kd-doel-regel" key={r.wat}><span className="kd-doel-wat">{r.wat}</span> {r.tekst}</p>
      ))}

      {doel.stand && <p className="kd-doel-stand">{doel.stand}</p>}
      {doel.hulpvraag && <p className="kd-doel-hulp">{doel.hulpvraag}</p>}

      <p className="kd-zichtbaar"><span aria-hidden="true">○</span> {zichtbaarVoor(doel)}</p>

      <div className="tk-knoppen">
        {stap && (
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" disabled={bezig} onClick={() => opStatus(doel, stap.naar)}>
            {stap.label}
          </button>
        )}
        {doel.hulpvraag && (
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to={`/app/hulp?vraag=${encodeURIComponent(doel.hulpvraag)}`}>
            Hulp verkennen
          </Link>
        )}
        {doel.status === "concept" && (
          <button type="button" className="tk-tekstknop" disabled={bezig} onClick={() => opWeg(doel)}>Weggooien</button>
        )}
      </div>

      {stap && <p className="tk-fijn" style={{ margin: "8px 0 0" }}>{stap.uitleg}</p>}

      {(doel.toelichting || eigen.length > 0 || doel.teamdoel) && (
        <details className="tk-verdieping">
          <summary>Meer over dit doel</summary>
          {doel.toelichting && <p style={{ lineHeight: 1.7 }}>{doel.toelichting}</p>}
          {eigen.length > 0 && (
            <>
              <p className="tk-label" style={{ marginTop: 14 }}>Mijn bijdragen</p>
              <ul className="kd-bijdragen">
                {eigen.map((b) => (
                  <li key={b.id}>
                    {urenLabel(b.urenPerWeek)} · {periodeLabel(b)} · {STATUSLABELS[b.status]}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="tk-fijn" style={{ marginTop: 14 }}>
            De uren staan bij de bijdragen van de mensen die het werk doen, en niet bij het doel
            zelf. Zo kan hetzelfde werk nooit twee keer meetellen.
          </p>
        </details>
      )}
    </article>
  );
}

/* ═════════════════════════════════════════════════════════════ het scherm */

export default function MijnDoelen() {
  const { actiefTeam, gebruiker } = useApp();
  const [kwartaal, setKwartaal] = useState(() => huidigKwartaal());
  const [doelen, setDoelen] = useState([]);
  const [gedeeld, setGedeeld] = useState([]);
  const [bijdragen, setBijdragen] = useState([]);
  const [ruimte, setRuimte] = useState([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");
  const [nieuw, setNieuw] = useState(false);
  const { bezig, melding, voerUit, wisMelding } = useActie();

  const team = actiefTeam;
  const uid = gebruiker && gebruiker.uid;

  const laad = useCallback(async () => {
    if (!team || !uid) return;
    setLaden(true);
    setFout("");
    try {
      const [eigen, teamDoelen, eigenBijdragen, alleRuimte] = await Promise.all([
        haalEigenDoelen(team, uid, kwartaal),
        haalGedeeldeDoelen(team, kwartaal),
        haalEigenBijdragen(team, uid, kwartaal),
        haalRuimte(team, kwartaal),
      ]);
      setDoelen(eigen);
      setGedeeld(teamDoelen.filter((d) => d.eigenaarUid !== uid));
      setBijdragen(eigenBijdragen);
      setRuimte(((alleRuimte.find((r) => r.id === uid) || {}).regels) || []);
    } catch {
      setFout("Je kwartaaldoelen konden niet worden geladen. Controleer je verbinding en probeer opnieuw.");
    } finally {
      setLaden(false);
    }
  }, [team, uid, kwartaal]);

  useEffect(() => {
    laad();
  }, [laad]);

  const opties = useMemo(() => kwartaalOpties(huidigKwartaal()), []);
  const lijst = useMemo(() => sorteerDoelen(doelen), [doelen]);

  async function bewaarNieuw({ soort, aanDoelId, veld }) {
    const gelukt = await voerUit("je doel bewaren", async () => {
      const doelId =
        soort === "eigen"
          ? await maakDoel(team, uid, {
              kwartaal,
              titel: veld.titel,
              succes: veld.succes,
              status: "concept",
              teamdoel: veld.teamdoel,
              gewenstVan: veld.gewenstVan,
              gewenstTot: veld.gewenstTot,
              hulpvraag: veld.hulpvraag,
              toelichting: veld.toelichting,
            })
          : aanDoelId;

      if (veld.van && veld.tot) {
        await bewaarBijdrage(team, uid, {
          kwartaal,
          doelId,
          status: "concept",
          van: veld.van,
          tot: veld.tot,
          urenPerWeek: veld.urenPerWeek,
        });
      }
      await laad();
    }, "Je concept is bewaard. Alleen jij ziet het.");
    if (gelukt) setNieuw(false);
  }

  function zetStatus(doel, naar) {
    voerUit(
      naar === "ter-afstemming" ? "je doel delen" : "de status bijwerken",
      async () => {
        await werkDoelBij(team, uid, doel.id, { status: naar });
        const mee = bijdragen.filter((b) => b.doelId === doel.id);
        await Promise.all(
          mee.map((b) => bewaarBijdrage(team, uid, { ...b, kwartaal, status: naar }))
        );
        await laad();
      },
      naar === "ter-afstemming" ? "Je team kan dit doel nu lezen." : null
    );
  }

  function gooiWeg(doel) {
    voerUit("je concept weggooien", async () => {
      await Promise.all(
        bijdragen.filter((b) => b.doelId === doel.id).map((b) => verwijderBijdrage(team, uid, b.id))
      );
      await verwijderConcept(team, uid, doel.id);
      await laad();
    });
  }

  if (!team || !gebruiker) {
    return <div className="tk-inhoud"><p>Selecteer eerst een team.</p></div>;
  }

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn kwartaaldoelen</h1>
      <p className="tk-onderkop">Wat je wilt bereiken, wat het aan tijd vraagt, en wat je deelt.</p>

      <label className="kd-kwartaal">
        <span className="tk-label">Kwartaal</span>
        <select className="tk-keuzeveld" value={kwartaal} onChange={(e) => setKwartaal(e.target.value)}>
          {opties.map((o) => (
            <option key={o.sleutel} value={o.sleutel}>
              {o.label}{o.nu ? " — nu" : ""}
            </option>
          ))}
        </select>
      </label>

      <Melding melding={melding} onSluiten={wisMelding} />
      {fout && (
        <div role="alert" className="tk-melding">
          <p>{fout}</p>
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={laad}>Opnieuw proberen</button>
        </div>
      )}

      {laden ? (
        <p role="status">Even laden…</p>
      ) : (
        <>
          <Ruimte team={team} uid={uid} kwartaal={kwartaal} regels={ruimte} opnieuw={laad} />

          <section className="kd-blok">
            <div className="kd-blokkop">
              <h2>Mijn doelen in {kwartaalLabel(kwartaal)}</h2>
              {!nieuw && (
                <button type="button" className="tk-knop" onClick={() => setNieuw(true)}>Doel toevoegen</button>
              )}
            </div>

            {nieuw && (
              <Formulier
                kwartaal={kwartaal}
                gedeeld={gedeeld}
                bezig={bezig}
                opBewaren={bewaarNieuw}
                opSluiten={() => setNieuw(false)}
              />
            )}

            {lijst.length === 0 && !nieuw && (
              <div className="tk-kaart">
                <h3>Nog geen doelen voor dit kwartaal</h3>
                <p>
                  Begin bij het resultaat dat je wilt bereiken, niet bij wat je gaat doen. De
                  activiteiten komen daaronder, als bijdragen met uren.
                </p>
              </div>
            )}

            {lijst.map((doel) => (
              <Doelkaart
                key={doel.id}
                doel={doel}
                bijdragen={bijdragen}
                bezig={bezig}
                opStatus={zetStatus}
                opWeg={gooiWeg}
              />
            ))}
          </section>

          <p className="tk-voetnoot">
            Je concepten zijn van jou alleen — ook je begeleiders kunnen ze niet opvragen. Wat je
            deelt, kan iedereen in dit team lezen.
          </p>
        </>
      )}
    </div>
  );
}
