// "Wie helpt mij verder?" — de tweede ingang van de samenwerkingstool.
//
// Eén invoerscherm en één resultatenscherm. Je beschrijft je taak, vinkt
// eventueel aan waar je hulp bij kunt gebruiken, en krijgt hoogstens drie
// collega's uit je eigen team met een onderbouwing die je kunt nalezen.
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

import { useMemo, useState } from "react";
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

  const [vraag, setVraag] = useState("");
  const [gekozenSoorten, setGekozenSoorten] = useState([]);
  const [uitkomst, setUitkomst] = useState(null);
  const [bezig, setBezig] = useState(false);
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
    setBezig(false);
  };

  const opnieuw = () => {
    setUitkomst(null);
    setUitnodigingVoor(null);
    setGekopieerd(false);
  };

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

          {uitkomst.suggesties.map((s) => (
            <article className="tk-kaart" key={s.sleutel}>
              <div className="tk-persoonrij">
                <Bol naam={s.naam} />
                <div>
                  <h2 style={{ margin: 0 }}>{s.naam}</h2>
                  {s.functie && <div className="tk-fijn">{s.functie}</div>}
                  {s.doorBeheerder && (
                    <div className="tk-fijn">Profiel toegevoegd door een beheerder, niet door deze persoon zelf.</div>
                  )}
                </div>
              </div>

              <div className="tk-advies-blok">
                <h3>Waarom deze collega?</h3>
                <ul className="tk-zinnen">
                  {s.waarom.map((b) => (
                    <li key={b.zin}>
                      <span className="tk-bron">{BRONLABEL[b.bron] || b.bron}</span>
                      {b.zin}
                    </li>
                  ))}
                </ul>
              </div>

              {s.bijdrage.length > 0 && (
                <div className="tk-advies-blok">
                  <h3>Waarbij kan {s.voornaam} mogelijk helpen?</h3>
                  <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                    {s.bijdrage.map((b) => (
                      <li key={b}>Om {b}.</li>
                    ))}
                  </ul>
                </div>
              )}

              {s.tegenspraak && (
                <div className="tk-melding">
                  {s.tegenspraak.zinnen.map((z) => <div key={z}>{z}</div>)}
                  <div style={{ marginTop: 6 }}>{s.tegenspraak.uitleg}</div>
                </div>
              )}

              {s.startTips.length > 0 && (
                <div className="tk-advies-blok">
                  <h3>Zo start je prettig samen</h3>
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
                  <h3>Je hulpvraag</h3>
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
                  style={{ marginTop: 14 }}
                  onClick={() => maakUitnodiging(s)}
                >
                  Maak een hulpvraag
                </button>
              )}
            </article>
          ))}

          <p className="tk-voetnoot">{uitkomst.transparantie}</p>
        </>
      )}

      <VolgendeStap />
    </div>
  );
}
