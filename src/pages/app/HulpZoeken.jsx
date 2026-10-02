// "Wie helpt mij verder?" — de tweede ingang van de samenwerkingstool.
//
// Eén invoerscherm en één resultatenscherm. Je beschrijft je taak, vinkt
// eventueel aan waar je hulp bij kunt gebruiken, en krijgt hoogstens drie
// collega's uit je eigen team met een onderbouwing die je kunt nalezen.
//
// Het resultatenscherm begint bij de namen, niet bij de uitleg. Eerst de
// collega's op een rij, met per regel één reden; tik je op een regel, dan komt
// de volledige onderbouwing eronder tevoorschijn en klapt de vorige dicht. De
// eerste vraag van een deelnemer is "wie?", en pas daarna "waarom?" -- met drie
// volledig uitgeschreven kaarten onder elkaar moest je vier schermen scrollen
// voordat je het antwoord op de eerste vraag had.
//
// Is er maar één collega, dan staat die meteen open: er valt dan niets te
// kiezen, en een dichtgeklapte regel zou alleen een extra tik kosten.
//
// Wat er uit welke bron komt staat erbij: eigen woorden uit een
// hand-in-handleiding, een aanwijzing uit een Insights Discovery-profiel, of
// de functie die iemand zelf invulde. Geen score, geen percentage, geen
// rangorde van mensen -- de volgorde volgt uit het soort onderbouwing, en dat
// staat onderaan uitgelegd.
//
// De afscherming komt uit de bestaande teamomgeving: collegasVan geeft
// uitsluitend de mensen uit het actieve team, met uitsluitend wat zij met dít
// team hebben gedeeld. Er wordt hier niets extra's opgehaald.

import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { collegasVan } from "../../lib/app/collegas";
import { HULPSOORTEN } from "../../data/app/hulpsoorten";
import { stelHulpvraagOp, zoekHulp } from "../../lib/app/hulp/hulpregels";
import Bol from "../../components/app/Bol";
import IngangKeuze from "../../components/app/IngangKeuze";
import VolgendeStap from "../../components/app/VolgendeStap";

const BRONLABEL = {
  handleiding: "Hand-in-handleiding",
  profiel: "Insights Discovery-profiel",
  rol: "Rol",
};

export default function HulpZoeken() {
  const { gebruiker, actiefTeam, kenmerken, teamOverzicht, ikBegeleid } = useApp();
  const { leden, gedeeld, profielleden, laden } = teamOverzicht;
  const basis = useId();

  const [vraag, setVraag] = useState("");
  const [gekozenSoorten, setGekozenSoorten] = useState([]);
  const [uitkomst, setUitkomst] = useState(null);
  const [bezig, setBezig] = useState(false);
  // Eén sleutel, geen lijst: daardoor klapt de vorige automatisch dicht zodra
  // je een andere opent. Met <details> kan dat niet -- die weten niets van
  // elkaar en zouden allemaal open kunnen staan.
  const [open, setOpen] = useState(null);
  const [uitnodigingVoor, setUitnodigingVoor] = useState(null);
  const [uitnodiging, setUitnodiging] = useState("");
  const [gekopieerd, setGekopieerd] = useState(false);

  const collegas = useMemo(
    () =>
      collegasVan({
        leden,
        gedeeld,
        profielleden,
        eigenUid: gebruiker ? gebruiker.uid : null,
      }),
    [leden, gedeeld, profielleden, gebruiker]
  );

  const wissel = (id) =>
    setGekozenSoorten((huidig) => (huidig.includes(id) ? huidig.filter((x) => x !== id) : [...huidig, id]));

  const zoek = () => {
    setBezig(true);
    setUitnodigingVoor(null);
    setGekopieerd(false);
    // Puur rekenwerk, geen netwerk: toch even een staat, zodat de knop niet
    // twee keer tegelijk ingedrukt kan worden en er iets gebeurt op het scherm.
    const antwoord = zoekHulp({
      vraag,
      gekozenHulpsoorten: gekozenSoorten,
      mijnKenmerken: kenmerken || [],
      collegas,
    });
    setUitkomst(antwoord);
    setOpen(antwoord.suggesties.length === 1 ? antwoord.suggesties[0].sleutel : null);
    setBezig(false);
  };

  const opnieuw = () => {
    setUitkomst(null);
    setOpen(null);
    setUitnodigingVoor(null);
    setGekopieerd(false);
  };

  const klapUit = (sleutel) => setOpen((huidig) => (huidig === sleutel ? null : sleutel));

  const maakUitnodiging = (suggestie) => {
    setUitnodigingVoor(suggestie.sleutel);
    setUitnodiging(
      stelHulpvraagOp({ vraag, suggestie, hulpsoorten: (uitkomst && uitkomst.hulpsoorten) || [] })
    );
    setGekopieerd(false);
  };

  const kopieer = async () => {
    try {
      await navigator.clipboard.writeText(uitnodiging);
      setGekopieerd(true);
    } catch {
      // Zonder klembordrechten blijft de tekst gewoon staan om te selecteren.
      setGekopieerd(false);
    }
  };

  if (!actiefTeam) {
    return (
      <div className="tk-inhoud">
        <h1 className="tk-kop">Wie helpt mij verder?</h1>
        <IngangKeuze />
        <div className="tk-kaart">
          <h2>Je hebt nog geen team</h2>
          <p>Deze vraag gaat over je eigen team. Zodra je in een team zit, kun je hier zoeken.</p>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team">Naar mijn team</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Wie helpt mij verder?</h1>
      <p className="tk-onderkop">
        Beschrijf waar je vastloopt. De app kijkt wie in jouw team daarbij zou kunnen helpen, op
        basis van wat die mensen zelf met dit team hebben gedeeld.
      </p>

      <IngangKeuze />

      {ikBegeleid && (
        <div className="tk-melding">
          Je begeleidt dit team. Je ziet wat de leden met het team hebben gedeeld, maar deze vraag
          gaat over hulp binnen het team zelf.
        </div>
      )}

      {laden && <p className="tk-fijn">Je team wordt opgehaald…</p>}

      {!laden && collegas.length === 0 && (
        <div className="tk-kaart">
          <h2>Je bent voorlopig alleen in dit team</h2>
          <p>
            Nodig je collega's uit met de teamcode. Zodra iemand meedoet en iets deelt, kan de app
            hier meekijken.
          </p>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team">Naar de teamcode</Link>
        </div>
      )}

      {!laden && collegas.length > 0 && !uitkomst && (
        <>
          <div className="tk-kaart">
            <label className="tk-label" htmlFor="tk-hulpvraag">Wat wil je voor elkaar krijgen?</label>
            <textarea
              id="tk-hulpvraag"
              className="tk-tekstvak"
              rows={4}
              value={vraag}
              maxLength={600}
              onChange={(e) => setVraag(e.target.value)}
              placeholder="Beschrijf kort je taak of uitdaging en waar je vastloopt."
            />
          </div>

          <div className="tk-kaart">
            <div className="tk-label">Waar kun je hulp bij gebruiken?</div>
            <p className="tk-fijn" style={{ margin: "2px 0 12px" }}>
              Mag je overslaan. Vink je niets aan, dan kijkt de app naar je eigen woorden hierboven.
            </p>
            <div className="tk-hulpsoorten">
              {HULPSOORTEN.map((h) => {
                const aan = gekozenSoorten.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={aan ? "tk-hulpsoort gekozen" : "tk-hulpsoort"}
                    aria-pressed={aan}
                    onClick={() => wissel(h.id)}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className="tk-knop" disabled={bezig} onClick={zoek}>
            {bezig ? "Bezig…" : "Wie kan mij helpen?"}
          </button>
        </>
      )}

      {uitkomst && (
        <>
          <div className="tk-gekozen">
            <span className="tk-gekozen-tekst">
              {vraag.trim() ? `“${vraag.trim().slice(0, 120)}${vraag.trim().length > 120 ? "…" : ""}”` : "Je hulpvraag"}
            </span>
            <button type="button" className="tk-tekstknop" onClick={opnieuw}>
              Hulpvraag aanpassen
            </button>
          </div>

          {uitkomst.opmerkingen.map((o) => (
            <div className="tk-melding" key={o}>{o}</div>
          ))}

          {uitkomst.suggesties.length === 0 && (
            <div className="tk-kaart">
              <h2>Nog geen onderbouwd voorstel</h2>
              <p>
                Probeer je taak concreter te beschrijven, of vink aan waar je hulp bij kunt
                gebruiken. Helpt dat niet, dan is er over je collega's nog te weinig gedeeld om hier
                iets zinnigs over te zeggen.
              </p>
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={opnieuw}>
                Hulpvraag verduidelijken
              </button>
            </div>
          )}

          {uitkomst.suggesties.length > 0 && (
            <>
              <h2 className="tk-collega-titel">
                {uitkomst.suggesties.length === 1
                  ? "Deze collega zou je hierbij kunnen helpen"
                  : "Deze collega's zouden je hierbij kunnen helpen"}
              </h2>
              <p className="tk-fijn" style={{ margin: "0 0 14px" }}>
                Tik op een naam om te zien waarop dat is gebaseerd.
              </p>

              <div className="tk-collegalijst">
                {uitkomst.suggesties.map((s) => {
                  const staatOpen = open === s.sleutel;
                  const kopId = `${basis}-kop-${s.sleutel}`;
                  const paneelId = `${basis}-paneel-${s.sleutel}`;

                  return (
                    <article className={staatOpen ? "tk-collega open" : "tk-collega"} key={s.sleutel}>
                      {/* Een echte knop: daarmee werken Enter, spatie en focus
                          zonder dat we toetsen zelf hoeven af te handelen. */}
                      <h3 className="tk-collega-kop">
                        <button
                          type="button"
                          className="tk-collega-knop"
                          id={kopId}
                          aria-expanded={staatOpen}
                          aria-controls={paneelId}
                          onClick={() => klapUit(s.sleutel)}
                        >
                          <Bol naam={s.naam} />
                          <span className="tk-collega-tekst">
                            <span className="tk-collega-naam">{s.naam}</span>
                            {s.functie && <span className="tk-collega-functie">{s.functie}</span>}
                            {s.kortom && <span className="tk-collega-reden">{s.kortom}</span>}
                          </span>
                          <svg
                            className="tk-collega-pijl"
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M4 6l3.5 3.5L11 6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </h3>

                      <div
                        className="tk-collega-paneel"
                        id={paneelId}
                        role="region"
                        aria-labelledby={kopId}
                        hidden={!staatOpen}
                      >
                        {s.doorBeheerder && (
                          <p className="tk-fijn" style={{ margin: "0 0 4px" }}>
                            Profiel toegevoegd door een beheerder, niet door deze persoon zelf.
                          </p>
                        )}

                        <div className="tk-advies-blok">
                          <h4>Waarom deze collega?</h4>
                          <ul className="tk-zinnen">
                            {s.waarom.map((b) => (
                              <li key={b.zin}>
                                <span className="tk-bron">{BRONLABEL[b.bron] || b.bron}</span>
                                {b.zin}
                              </li>
                            ))}
                          </ul>
                          {/* Het voorbehoud bij een profiel staat één keer onder
                              het blok. Het stond eerst vóór elke regel, waardoor
                              dezelfde zin drie keer op één kaart terugkwam -- en
                              het label bij de regel zegt al dat het uit een
                              profiel komt. */}
                          {s.voorbehoud && <p className="tk-fijn" style={{ margin: "10px 0 0" }}>{s.voorbehoud}</p>}
                        </div>

                        {s.bijdrage.length > 0 && (
                          <div className="tk-advies-blok">
                            <h4>Waarbij kan {s.voornaam} mogelijk helpen?</h4>
                            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                              {s.bijdrage.map((b) => (
                                <li key={b}>Om {b}.</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {s.tegenspraak && (
                          <div className="tk-melding" style={{ marginTop: 18 }}>
                            {s.tegenspraak.zinnen.map((z) => <div key={z}>{z}</div>)}
                            <div style={{ marginTop: 6 }}>{s.tegenspraak.uitleg}</div>
                          </div>
                        )}

                        {s.startTips.length > 0 && (
                          <div className="tk-advies-blok">
                            <h4>Zo start je prettig samen</h4>
                            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                              {s.startTips.map((t) => (
                                <li key={t.kenmerkId} style={{ marginBottom: 6 }}>
                                  {t.zin}
                                  {t.verschil && <div className="tk-fijn">{t.verschil}</div>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {uitnodigingVoor === s.sleutel ? (
                          <div className="tk-advies-blok">
                            <h4>Je hulpvraag</h4>
                            <p className="tk-fijn" style={{ margin: "0 0 8px" }}>
                              Pas hem aan zoals je wilt. Er wordt niets verstuurd; je kopieert hem zelf.
                            </p>
                            <textarea
                              className="tk-tekstvak"
                              rows={9}
                              value={uitnodiging}
                              onChange={(e) => { setUitnodiging(e.target.value); setGekopieerd(false); }}
                              aria-label={`Hulpvraag aan ${s.voornaam}`}
                            />
                            <div className="tk-knoppen" style={{ marginTop: 10 }}>
                              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={kopieer}>
                                {gekopieerd ? "Gekopieerd" : "Kopieer de tekst"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="tk-knop tk-knop-rand tk-knop-klein"
                            style={{ marginTop: 16 }}
                            onClick={() => maakUitnodiging(s)}
                          >
                            Maak een hulpvraag
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <p className="tk-voetnoot">{uitkomst.transparantie}</p>
        </>
      )}

      <VolgendeStap />
    </div>
  );
}
