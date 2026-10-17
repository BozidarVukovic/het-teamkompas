// "Wie helpt mij verder?" — de tweede ingang van de samenwerkingstool.
//
// Eén invoerscherm en één resultatenscherm. Je beschrijft je klus, vinkt
// eventueel aan waar je hulp bij kunt gebruiken, en krijgt hoogstens drie
// collega's uit je eigen team met een onderbouwing die je kunt nalezen.
//
// Op de kaart staat meteen wat je ermee kunt: de naam, waar diegene bij zou
// kunnen helpen, één onderbouwing, waar die vandaan komt, en de knop. De rest
// -- het volledige bewijs, de starttips, een eventuele tegenspraak -- staat
// onder "Waarom deze suggestie?" en klapt open als je het wilt.
//
// Dit was eerder een harmonica: alleen de naam zichtbaar, en de knop pas na
// uitklappen. Dat maakte het overzicht rustig maar de actie onvindbaar -- je
// moest eerst opendoen om te zien dat je iets kon doen. De knop hoort op de
// kaart; de onderbouwing hoort eronder.
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

/**
 * Waar deze suggestie op rust, in één regel op de kaart.
 *
 * Niet wat de app ervan vindt, maar waar het vandaan komt. Een profiel dat een
 * beheerder heeft toegevoegd is iets anders dan een zin die iemand zelf heeft
 * opgeschreven, en dat verschil hoort te zien te zijn zonder uitklappen.
 */
function bronstatusVan(suggestie) {
  const bronnen = (suggestie.waarom || []).map((b) => b.bron);
  if (bronnen.includes("handleiding")) return "Zelf opgeschreven in de hand-in-handleiding";
  if (suggestie.doorBeheerder) return "Insights-profiel · nog niet zelf bevestigd";
  if (bronnen.includes("profiel")) return "Uit het gedeelde Insights-profiel";
  if (bronnen.includes("rol")) return "Functie, zelf ingevuld";
  return "";
}

export default function HulpZoeken() {
  const { gebruiker, actiefTeam, kenmerken, teamOverzicht, ikBegeleid } = useApp();
  const { leden, gedeeld, profielleden, laden } = teamOverzicht;
  const basis = useId();

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
        <h1 className="tk-kop">Waar zoek je hulp bij?</h1>
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
      <h1 className="tk-kop">{uitkomst ? "Met wie kun je beginnen?" : "Waar zoek je hulp bij?"}</h1>
      {!uitkomst && <p className="tk-onderkop">Een paar zinnen zijn genoeg.</p>}

      <IngangKeuze />

      {/* Een begeleider zoekt hier geen hulp voor zichzelf; die kijkt mee. Dat
          hoort er zo te staan, en niet als een uitleg die doet alsof hij een
          teamlid is dat zelf iets kan vragen. */}
      {ikBegeleid && (
        <div className="tk-melding">
          Je begeleidt dit team en doet er zelf niet aan mee. Je kunt hier zien welke suggesties de
          app aan teamleden zou geven; de hulpvraag die eruit komt is bedoeld voor hen.
        </div>
      )}

      {laden && <p className="tk-fijn">Je team wordt opgehaald…</p>}

      {!laden && collegas.length === 0 && (
        <div className="tk-kaart">
          <h2>Je bent voorlopig alleen in dit team</h2>
          <p>
            Nodig je collega&apos;s uit met de teamcode. Zodra iemand meedoet en iets deelt, kan de
            app hier meekijken.
          </p>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team">Naar de teamcode</Link>
        </div>
      )}

      {!laden && collegas.length > 0 && !uitkomst && (
        <>
          <div className="tk-kaart">
            <label className="tk-label" htmlFor="tk-hulpvraag">Wat wil je bereiken?</label>
            <textarea
              id="tk-hulpvraag"
              className="tk-tekstvak"
              rows={4}
              value={vraag}
              maxLength={600}
              onChange={(e) => setVraag(e.target.value)}
              placeholder="Ik zoek iemand om samen nieuwe ideeën te verkennen."
            />

            <div className="tk-veld" style={{ margin: "20px 0 0" }}>
              <div className="tk-label">Geef je hulpvraag meer richting</div>
              <p className="tk-fijn" style={{ margin: "2px 0 12px" }}>
                Mag je overslaan. Vink je niets aan, dan kijkt de app naar je eigen woorden
                hierboven.
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
                Probeer je klus concreter te beschrijven, of geef je hulpvraag meer richting. Helpt
                dat niet, dan is er over je collega&apos;s nog te weinig gedeeld om hier iets
                zinnigs over te zeggen.
              </p>
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={opnieuw}>
                Hulpvraag verduidelijken
              </button>
            </div>
          )}

          {uitkomst.suggesties.map((s) => {
            const paneelId = `${basis}-waarom-${s.sleutel}`;
            const bron = bronstatusVan(s);
            const eerste = (s.waarom || [])[0];
            const bijdrage = (s.bijdrageLabels || [])[0];

            return (
              <article className="tk-kaart tk-suggestie" key={s.sleutel}>
                <div className="tk-suggestie-rij">
                  <Bol naam={s.naam} />
                  <div className="tk-suggestie-tekst">
                    <strong className="tk-suggestie-naam">{s.naam}</strong>
                    {bijdrage && <span className="tk-suggestie-bijdrage">{bijdrage}</span>}
                    {bron && <span className="tk-bronstatus"><span aria-hidden="true">○</span>{bron}</span>}
                  </div>
                </div>

                {/* Eén onderbouwing op de kaart. De rest staat eronder. */}
                {eerste && <p className="tk-suggestie-reden">{eerste.zin}</p>}

                {/* De knop staat op de kaart, niet achter een uitklap: anders
                    moet je eerst opendoen om te zien dat je iets kunt doen. */}
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
                    onClick={() => maakUitnodiging(s)}
                  >
                    Maak een hulpvraag
                  </button>
                )}

                <details className="tk-verdieping" id={paneelId}>
                  <summary>Waarom deze suggestie?</summary>

                  {s.doorBeheerder && (
                    <p className="tk-fijn" style={{ margin: "10px 0 0" }}>
                      Dit profiel is toegevoegd door een beheerder, niet door {s.voornaam} zelf.
                    </p>
                  )}

                  <ul className="tk-zinnen" style={{ marginTop: 10 }}>
                    {s.waarom.map((b) => (
                      <li key={b.zin}>
                        <span className="tk-bron">{BRONLABEL[b.bron] || b.bron}</span>
                        {b.zin}
                      </li>
                    ))}
                  </ul>
                  {s.voorbehoud && <p className="tk-fijn" style={{ margin: "10px 0 0" }}>{s.voorbehoud}</p>}

                  {s.bijdrage.length > 0 && (
                    <>
                      <p className="tk-label" style={{ marginTop: 16 }}>
                        Waarbij kan {s.voornaam} mogelijk helpen?
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                        {s.bijdrage.map((b) => (
                          <li key={b}>Om {b}.</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {s.tegenspraak && (
                    <div className="tk-melding" style={{ marginTop: 16 }}>
                      {s.tegenspraak.zinnen.map((z) => <div key={z}>{z}</div>)}
                      <div style={{ marginTop: 6 }}>{s.tegenspraak.uitleg}</div>
                    </div>
                  )}

                  {s.startTips.length > 0 && (
                    <>
                      <p className="tk-label" style={{ marginTop: 16 }}>Zo start je prettig samen</p>
                      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                        {s.startTips.map((t) => (
                          <li key={t.kenmerkId} style={{ marginBottom: 6 }}>
                            {t.zin}
                            {t.verschil && <div className="tk-fijn">{t.verschil}</div>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </details>
              </article>
            );
          })}

          <p className="tk-voetnoot">{uitkomst.transparantie}</p>
        </>
      )}

      <VolgendeStap />
    </div>
  );
}
