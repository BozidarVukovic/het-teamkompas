// "Samenwerken met..." — de kern van de omgeving.
//
// Kies een teamgenoot, kies wat er speelt, krijg een kort advies. Van de ander
// gebruiken we uitsluitend wat die persoon zelf met dit team heeft gedeeld;
// aan de brondata komen we niet, en dat kan technisch ook niet.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { LOOPTIJD_DAGEN } from "../../lib/app/experimenten";
import { beoordeelAdviessessie, logAdviessessie } from "../../lib/app/opslag";
import { vraagAdvies, vraagDuoadvies, vraagGroepsadvies } from "../../lib/app/advies/adviesService";
import { situatiesPerGroep } from "../../data/app/situaties";
import { collegasVan, collegaInEenZin } from "../../lib/app/collegas";
import { MINIMUM_GROEP } from "../../lib/app/advies/groepsregels";
import { voornaam } from "../../lib/app/naam";
import { initialen } from "../../lib/app/naam";
import VolgendeStap from "../../components/app/VolgendeStap";

/** "Nikki, Eva en Aad" — leesbaar, ook bij één of bij zeven. */
function namenLijst(collegas) {
  const namen = collegas.map((c) => voornaam(c.naam, "een collega"));
  if (namen.length === 0) return "";
  if (namen.length === 1) return namen[0];
  if (namen.length > 4) return `${namen.slice(0, 3).join(", ")} en ${namen.length - 3} anderen`;
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

/**
 * Advies over twee anderen: waar zij iets anders nodig hebben.
 *
 * Andere vorm dan het gewone advies, omdat het een andere vraag is. Er staat
 * geen "wat jij moet doen" in en geen oordeel over wie zich moet aanpassen —
 * alleen wat ze allebei zelf hebben gedeeld, naast elkaar, en wat elk daarvan
 * vraagt. Zie tweeanderen.js.
 */
function DuoInhoud({ advies }) {
  return (
    <>
      <div className="tk-stap">{advies.situatie ? advies.situatie.label : "Advies"}</div>
      <h2 style={{ margin: "0 0 10px", fontSize: "var(--tk-t-sectie)" }}>
        {advies.namen[0]} en {advies.namen[1]}
      </h2>
      {advies.situatie && (
        <p style={{ color: "var(--tk-zacht)", margin: "0 0 8px", lineHeight: 1.7 }}>
          {advies.situatie.opening}
        </p>
      )}

      {advies.opmerkingen.map((o) => (
        <div className="tk-melding" key={o} style={{ marginTop: 12 }}>
          {o}
        </div>
      ))}

      {advies.verschillen.length > 0 && (
        <div className="tk-advies-blok">
          <h3>Waar ze iets anders nodig hebben</h3>
          {advies.verschillen.map((rij) => (
            <div key={rij.kenmerkId} style={{ marginBottom: 20 }}>
              <div className="tk-label">{rij.label}</div>
              {rij.kanten.map((k) => (
                <div key={k.naam} style={{ marginTop: 10 }}>
                  <strong style={{ fontSize: "var(--tk-t-basis)" }}>{k.naam}</strong>
                  <p style={{ margin: "2px 0 0", lineHeight: 1.7, fontStyle: "italic" }}>
                    &ldquo;{k.deelt}&rdquo;
                  </p>
                  {k.vraagt && (
                    <p className="tk-fijn" style={{ margin: "4px 0 0" }}>{k.vraagt}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {advies.gelijk.length > 0 && (
        <div className="tk-advies-blok">
          <h3>Waar ze het eens zijn</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
            {advies.gelijk.map((rij) => (
              <li key={rij.kenmerkId} style={{ marginBottom: 6 }}>
                <strong>{rij.label}</strong> — allebei: &ldquo;{rij.kanten[0].deelt}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="tk-advies-blok">
        <h3>Wat je hiermee doet</h3>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{advies.afsluiter}</p>
      </div>
    </>
  );
}

export default function Samenwerken() {
  const { gebruiker, actiefTeam, kenmerken, teamOverzicht, ikBegeleid, startExperiment } = useApp();
  const [zoek] = useSearchParams();

  // De teamgegevens staan al in de context; die nog een keer ophalen leverde
  // een tweede kopie op die na een wijziging uit de pas ging lopen.
  const { leden, gedeeld, laden } = teamOverzicht;

  // Meerdere mensen tegelijk mag; kies je er één, dan verandert er niets aan
  // hoe het altijd al werkte.
  const [gekozenUids, setGekozenUids] = useState([]);
  const [situatieId, setSituatieId] = useState(null);
  const [advies, setAdvies] = useState(null);
  const [sessieId, setSessieId] = useState(null);
  const [beoordeeld, setBeoordeeld] = useState(null);
  const [toelichting, setToelichting] = useState("");
  const [toelichtingVerstuurd, setToelichtingVerstuurd] = useState(false);

  // Een advies lezen duurt een minuut; er iets mee doen duurt langer. Wie de
  // kleine actie wil vasthouden, zegt dat hier — en krijgt er over dertig
  // dagen één keer een vraag over terug.
  const [experimentGestart, setExperimentGestart] = useState(false);
  const [bezigMetExperiment, setBezigMetExperiment] = useState(false);


  // Echte teamgenoten en de profielen die een beheerder heeft toegevoegd staan
  // in één lijst: over allebei valt evengoed advies te vragen. Diezelfde lijst
  // staat op het startscherm; zie collegas.js.
  const anderen = useMemo(
    () =>
      collegasVan({
        leden,
        gedeeld,
        profielleden: teamOverzicht.profielleden,
        eigenUid: gebruiker && gebruiker.uid,
      }),
    [leden, gedeeld, gebruiker, teamOverzicht.profielleden]
  );

  // Vanaf de teampagina kom je hier binnen met een collega al gekozen
  // (/app/samenwerken?met=...). Dat gebeurt één keer: daarna bepaalt je eigen
  // keuze wat er staat, ook als het adres nog steeds die naam draagt.
  const gevolgd = useRef(false);
  const gevraagd = zoek.get("met");
  useEffect(() => {
    if (gevolgd.current || !gevraagd || anderen.length === 0) return;
    gevolgd.current = true;
    if (anderen.some((l) => l.sleutel === gevraagd)) setGekozenUids([gevraagd]);
  }, [gevraagd, anderen]);

  const geselecteerd = anderen.filter((l) => gekozenUids.includes(l.sleutel));
  const gekozen = geselecteerd.length === 1 ? geselecteerd[0] : null;
  // Bij precies twee anderen is er nog een derde vraag mogelijk: niet hoe jij
  // met hen werkt, maar hoe zij op elkaar landen. Dat is de vraag van wie een
  // team begeleidt of leidt.
  const [overHen, setOverHen] = useState(false);
  const kanOverHen = geselecteerd.length === 2;
  const isDuo = kanOverHen && overHen;
  const isGroep = !isDuo && geselecteerd.length + 1 >= MINIMUM_GROEP;

  const wisselPersoon = (sleutel) => {
    setGekozenUids((huidig) =>
      huidig.includes(sleutel) ? huidig.filter((s) => s !== sleutel) : [...huidig, sleutel]
    );
    opnieuw();
  };

  // Wat een teamgenoot deelt heeft die persoon zelf bevestigd; dat weegt het
  // zwaarst. Een profiel dat een beheerder toevoegde komt uit een PDF en is
  // door niemand bevestigd — dat stond ook zo op het scherm, maar in de
  // advieslogica woog het even zwaar. Nu staat er wat het is.
  const alsKenmerken = (lijst, doorBeheerder = false) =>
    (lijst || []).map((k) => ({
      kenmerkId: k.kenmerkId,
      waarde: k.waarde,
      bron: doorBeheerder ? "insights_discovery" : "user_confirmation",
    }));

  const maakAdvies = useCallback(
    async (situatie) => {
      if (geselecteerd.length === 0) return;

      // Eén collega: contrast tussen jullie twee. Meerdere: spreiding over de
      // groep. Dat zijn twee verschillende vragen, dus twee routes.
      const uitkomst = isDuo
        ? await vraagDuoadvies({
            eerste: {
              naam: geselecteerd[0].naam || "de een",
              kenmerken: alsKenmerken(geselecteerd[0].kenmerken, geselecteerd[0].doorBeheerder),
            },
            tweede: {
              naam: geselecteerd[1].naam || "de ander",
              kenmerken: alsKenmerken(geselecteerd[1].kenmerken, geselecteerd[1].doorBeheerder),
            },
            situatieId: situatie,
          })
        : isGroep
        ? await vraagGroepsadvies({
            mijnKenmerken: kenmerken,
            deelnemers: geselecteerd.map((c) => ({
              naam: c.naam || "een collega",
              kenmerken: alsKenmerken(c.kenmerken, c.doorBeheerder),
            })),
            situatieId: situatie,
            // Begeleid je dit team, dan hoor je niet bij de groep en telt jouw
            // voorkeur niet mee in de spreiding.
            ikDoeMee: !ikBegeleid,
          })
        : await vraagAdvies({
            mijnKenmerken: kenmerken,
            hunKenmerken: alsKenmerken(geselecteerd[0].kenmerken, geselecteerd[0].doorBeheerder),
            // Wat deze collega zelf schreef en met dit team deelde. Bij een
            // groep laten we dit weg: één iemand citeren wijst iemand aan.
            hunHandleiding: geselecteerd[0].handleiding,
            situatieId: situatie,
            naamAnder: geselecteerd[0].naam || "je collega",
          });

      setAdvies(uitkomst);
      setBeoordeeld(null);
      setExperimentGestart(false);
      try {
        const id = await logAdviessessie({
          uid: gebruiker.uid,
          situatieId: situatie,
          aantalBlokken: (uitkomst.blokken || uitkomst.uiteen || []).length,
        });
        setSessieId(id);
      } catch {
        setSessieId(null);
      }
    },
    [geselecteerd, isDuo, isGroep, kenmerken, gebruiker, ikBegeleid]
  );

  // Wat er wordt opgeslagen is de zin zelf, plus welke situatie het was. Niet
  // over wie het ging: dat is precies zo geregeld als bij een adviessessie.
  const houdVast = async () => {
    if (!advies || !advies.actie || bezigMetExperiment) return;
    setBezigMetExperiment(true);
    try {
      await startExperiment({
        actie: advies.actie,
        situatieId,
        situatieLabel: advies.situatie ? advies.situatie.label : "",
      });
      setExperimentGestart(true);
    } catch {
      /* niet kunnen opslaan mag het advies niet in de weg zitten */
    }
    setBezigMetExperiment(false);
  };

  const kiesSituatie = (id) => {
    setSituatieId(id);
    maakAdvies(id);
  };

  const opnieuw = () => {
    setSituatieId(null);
    setAdvies(null);
    setSessieId(null);
    setBeoordeeld(null);
    setToelichting("");
    setToelichtingVerstuurd(false);
  };

  const beoordeel = async (bruikbaar) => {
    setBeoordeeld(bruikbaar);
    try {
      await beoordeelAdviessessie(sessieId, bruikbaar);
    } catch {
      /* een oordeel is prettig om te weten, maar nooit blokkerend */
    }
  };

  const stuurToelichting = async () => {
    const tekst = toelichting.trim();
    if (!tekst) return;
    setToelichtingVerstuurd(true);
    try {
      await beoordeelAdviessessie(sessieId, false, tekst);
    } catch {
      /* ook dit mag nooit in de weg zitten */
    }
  };

  if (!actiefTeam) return <div className="tk-inhoud"><p className="tk-onderkop">Kies eerst een team.</p></div>;
  if (laden) return <div className="tk-inhoud"><p className="tk-onderkop">Even laden...</p></div>;

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Samenwerken met...</h1>
      {/* De uitleg gaat over de keuze die je nog moet maken. Heb je iemand
          gekozen, dan legt hij iets uit wat je al gedaan hebt. */}
      {!gekozen && (
        <p className="tk-onderkop">
          Kies met wie het speelt en wat er aan de hand is. Je krijgt een advies op basis van wat
          jullie allebei hebben gedeeld.
        </p>
      )}

      {anderen.length === 0 && (
        <div className="tk-kaart">
          <h2>Je bent voorlopig alleen in dit team</h2>
          <p>
            Nodig je collega's uit met de teamcode. Zodra iemand meedoet en iets deelt, kun je hier
            advies vragen.
          </p>
          <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/team">
            Naar de teamcode
          </Link>
        </div>
      )}

      {anderen.length > 0 && !advies && (
        <>
          <p className="tk-label">Met wie speelt het?</p>
          <div className="tk-lijst" style={{ marginBottom: 14 }}>
            {anderen.map((l) => {
              const aan = gekozenUids.includes(l.sleutel);
              return (
                <button
                  key={l.sleutel}
                  type="button"
                  className={`tk-persoon${aan ? " gekozen" : ""}`}
                  aria-pressed={aan}
                  onClick={() => wisselPersoon(l.sleutel)}
                >
                  <span className="tk-bol">{initialen(l.naam)}</span>
                  <span>
                    {l.naam || "Teamgenoot"}
                    <small style={{ display: "block", color: "var(--tk-zacht)", fontSize: "var(--tk-t-fijn)" }}>
                      {collegaInEenZin(l)}
                    </small>
                  </span>
                  <span className={`tk-vink${aan ? " aan" : ""}`} aria-hidden="true">
                    {aan ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="tk-fijn" style={{ marginBottom: 22 }}>
            {gekozenUids.length === 0
              ? "Kies één collega, of meerdere als je een overleg of sessie voorbereidt."
              : isDuo
                ? `Advies over ${geselecteerd[0].naam} en ${geselecteerd[1].naam} onderling: waar zij iets anders nodig hebben, in hun eigen woorden. Jij komt er niet in voor.`
                : isGroep
                  ? `Advies over jou en ${geselecteerd.length} collega's samen: waar jullie voorkeuren uiteenlopen en wat daarbij helpt. Er staat nergens wie wat koos.`
                  : "Vink er nog iemand aan als het over een groep gaat."}
          </p>
        </>
      )}

      {anderen.length === 0 && <VolgendeStap />}

      {advies && geselecteerd.length > 0 && (
        <div className="tk-gekozen">
          <span className="tk-bollen">
            {geselecteerd.slice(0, 3).map((c) => (
              <span className="tk-bol" key={c.sleutel}>{initialen(c.naam)}</span>
            ))}
            {geselecteerd.length > 3 && <span className="tk-bol">+{geselecteerd.length - 3}</span>}
          </span>
          <span className="tk-gekozen-tekst">
            <strong>{namenLijst(geselecteerd)}</strong>
            <small>{advies.situatie ? advies.situatie.label : "Advies"}</small>
          </span>
          <button
            type="button"
            className="tk-knop tk-knop-rand tk-knop-klein"
            onClick={() => {
              setGekozenUids([]);
              opnieuw();
            }}
          >
            Wijzigen
          </button>
        </div>
      )}

      {kanOverHen && !advies && (
        <div className="tk-keuzes" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={`tk-keuze${!overHen ? " gekozen" : ""}`}
            onClick={() => setOverHen(false)}
          >
            <span>
              Over mij en hen
              <small>Hoe jij met deze twee samenwerkt.</small>
            </span>
          </button>
          <button
            type="button"
            className={`tk-keuze${overHen ? " gekozen" : ""}`}
            onClick={() => setOverHen(true)}
          >
            <span>
              Over hen onderling
              <small>
                Waar {geselecteerd[0].naam} en {geselecteerd[1].naam} iets anders nodig hebben — in
                hun eigen woorden.
              </small>
            </span>
          </button>
        </div>
      )}

      {geselecteerd.length > 0 && !advies && (
        <>
          <p className="tk-label">Wat speelt er?</p>
          {situatiesPerGroep({ voorGroep: isGroep }).map((groep) => (
            <section key={groep.id} className="tk-groep">
              <h2 className="tk-groep-kop">{groep.label}</h2>
              <div className="tk-groep-lijst">
                {groep.situaties.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="tk-optie"
                    onClick={() => kiesSituatie(s.id)}
                  >
                    <span>{s.label}</span>
                    <span className="tk-optie-pijl" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {advies && (
        <>
          <div className="tk-advies">
            {advies.soort === "duo" ? <DuoInhoud advies={advies} /> : (<>
            <div className="tk-stap">{advies.situatie ? advies.situatie.label : "Advies"}</div>
            <h2 style={{ margin: "0 0 10px", fontSize: "var(--tk-t-sectie)" }}>
              Jullie samenwerking
            </h2>
            {advies.samenvatting.map((zin) => (
              <p key={zin} style={{ color: "var(--tk-zacht)", margin: "0 0 8px", lineHeight: 1.7 }}>
                {zin}
              </p>
            ))}

            {advies.opmerkingen.map((o) => (
              <div className="tk-melding" key={o} style={{ marginTop: 12 }}>
                {o}
              </div>
            ))}

            {advies.helpt.length > 0 && (
              <div className="tk-advies-blok">
                <h3>Wat waarschijnlijk helpt</h3>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                  {advies.helpt.map((h) => (
                    <li key={h} style={{ marginBottom: 6 }}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bij één collega gaat dit over het contrast tussen jullie twee. */}
            {advies.soort !== "groep" && (advies.letOp || []).length > 0 && (
              <div className="tk-advies-blok">
                <h3>Waar je op kunt letten</h3>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.75 }}>
                  {advies.letOp.map((l) => (
                    <li key={l} style={{ marginBottom: 6 }}>{l}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bij een groep: per punt wat er gebeurt, en welke voorkeuren er
                in deze groep zitten met wat elk daarvan vraagt. Zonder wie en
                zonder aantallen. */}
            {advies.soort === "groep" && (advies.uiteen || []).length > 0 && (
              <div className="tk-advies-blok">
                <h3>Waar de groep uiteenloopt</h3>
                {advies.uiteen.map((punt) => (
                  <div key={punt.kenmerkId} className="tk-punt">
                    <strong className="tk-punt-kop">{punt.onderwerp}</strong>
                    <p className="tk-punt-duiding">{punt.duiding}</p>
                    {punt.voorkeuren.length > 0 && (
                      <>
                        <div className="tk-punt-label">In deze groep zit</div>
                        <ul className="tk-voorkeuren">
                          {punt.voorkeuren.map((v) => (
                            <li key={v.label}>
                              <span className="tk-voorkeur">{v.label}</span>
                              <span className="tk-voorkeur-vraagt">{v.vraagt}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Wat deze collega er zelf over schreef. Staat vlak voor de vraag,
                want dit is het laatste dat je wilt lezen voordat je begint. */}
            {(advies.eigenWoorden || []).length > 0 && (
              <div className="tk-advies-blok">
                <h3>Wat {voornaam(gekozen && gekozen.naam, "je collega")} er zelf over schreef</h3>
                {advies.eigenWoorden.map((w) => (
                  <div key={w.sectieId} className="tk-sectie">
                    <strong>{w.titel}</strong>
                    <p>{w.tekst}</p>
                  </div>
                ))}
              </div>
            )}

            {advies.vraag && (
              <div className="tk-advies-blok">
                <h3>Probeer deze vraag</h3>
                <p className="tk-citaat" style={{ margin: 0 }}>“{advies.vraag}”</p>
              </div>
            )}

            {advies.actie && (
              <div className="tk-advies-blok">
                <h3>Kleine actie</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{advies.actie}</p>

                {/* Geen doel en geen teller: je zegt alleen dat je het gaat
                    proberen. Over dertig dagen vraagt de app er één keer naar. */}
                {experimentGestart ? (
                  <p className="tk-fijn" style={{ margin: "12px 0 0" }}>
                    <span aria-hidden="true">✓</span> Je houdt dit {LOOPTIJD_DAGEN} dagen vast. Het
                    staat bij Ik; alleen jij ziet het.
                  </p>
                ) : (
                  <button
                    type="button"
                    className="tk-knop tk-knop-rand tk-knop-klein"
                    style={{ marginTop: 12 }}
                    disabled={bezigMetExperiment}
                    onClick={houdVast}
                  >
                    {bezigMetExperiment ? "Bezig..." : `Dit ga ik ${LOOPTIJD_DAGEN} dagen proberen`}
                  </button>
                )}
              </div>
            )}

            {advies.soort !== "groep" && gekozen && gekozen.doorBeheerder && (
              <p className="tk-fijn" style={{ marginTop: 16 }}>
                Dit profiel is toegevoegd door {gekozen.toegevoegdDoorNaam || "een beheerder"} op
                basis van een Insights-profiel. {gekozen.naam} heeft het niet zelf ingevuld of
                bevestigd — houd daar rekening mee.
              </p>
            )}

            </>)}

            <p className="tk-fijn" style={{ marginTop: 16 }}>{advies.transparantie}</p>
          </div>

          <div className="tk-kaart">
            <h2>Heb je hier iets aan?</h2>
            {beoordeeld === null ? (
              <div className="tk-knoppen">
                <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => beoordeel(true)}>
                  Ja, hier kan ik mee verder
                </button>
                <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => beoordeel(false)}>
                  Nee, niet echt
                </button>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: 0 }}>
                  {beoordeeld
                    ? "Fijn. We bewaren alleen dát je het bruikbaar vond, niet waar het over ging."
                    : "Duidelijk. We bewaren alleen dát het niet paste, niet waar het over ging."}
                </p>

                {/* Dát iets niet paste zegt weinig; wat er miste zegt alles.
                    Optioneel, want niemand hoort een formulier in te vullen om
                    van een advies af te komen. */}
                {beoordeeld === false && !toelichtingVerstuurd && (
                  <div style={{ marginTop: 14 }}>
                    <label className="tk-label" htmlFor="tk-toelichting">
                      Wat miste er? <span className="tk-optioneel">(optioneel)</span>
                    </label>
                    <textarea
                      id="tk-toelichting"
                      className="tk-tekstvak"
                      rows={2}
                      maxLength={500}
                      value={toelichting}
                      onChange={(e) => setToelichting(e.target.value)}
                      placeholder="Bijvoorbeeld: te algemeen, of het ging over het verkeerde punt."
                    />
                    <p className="tk-fijn" style={{ margin: "8px 0 0" }}>
                      Dit lezen de makers van Mijn Teamkompas om het advies te verbeteren. Je
                      teamgenoten en je beheerder zien het niet. Schrijf er geen namen in.
                    </p>
                    <div className="tk-knoppen" style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="tk-knop tk-knop-klein"
                        disabled={toelichting.trim().length === 0}
                        onClick={stuurToelichting}
                      >
                        Versturen
                      </button>
                    </div>
                  </div>
                )}

                {toelichtingVerstuurd && (
                  <p className="tk-fijn" style={{ marginTop: 10, marginBottom: 0 }}>
                    Dank je. Daar kunnen we wat mee.
                  </p>
                )}
              </>
            )}
            <div className="tk-knoppen" style={{ marginTop: 14 }}>
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={opnieuw}>
                Andere situatie kiezen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
