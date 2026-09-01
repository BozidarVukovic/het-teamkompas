// Mijn team: wie er in het team zitten, wat zij hebben gedeeld, en de code om
// anderen uit te nodigen.
//
// Een team is zijn mensen, dus die staan bovenaan en de rest is ondergeschikt.
// Uitnodigen is iets wat je een paar keer doet en daarna nooit meer; dat is een
// regel in de lijst die opengaat als je hem nodig hebt, geen half scherm met
// uitleg. Het team verlaten staat onderaan, stil, waar zulke dingen horen.
//
// Wat je hier ziet is uitsluitend wat teamgenoten zelf hebben gedeeld. Ook een
// beheerder ziet niets meer dan dit; er bestaat geen weg naar de profielen van
// anderen — niet in de app en niet in de database.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { haalGedeeldVanTeam, haalTeam, haalTeamleden } from "../../lib/app/opslag";
import { bewaarVoorstel, haalVoorstellen } from "../../lib/app/voorstellen";
import { bewaarProfiellid, verwijderProfiellid } from "../../lib/app/opslag";
import { kenmerkenUitInsights } from "../../lib/app/insights";
import { deelzin } from "../../data/app/kenmerken";
import { initialen, voornaam } from "../../lib/app/naam";
import InsightsUpload from "../../components/app/InsightsUpload";
import VolgendeStap from "../../components/app/VolgendeStap";

/** Eén regel in de ledenlijst, met wat eronder tevoorschijn komt. */
function Persoon({ sleutel, naam: hunNaam, onder, uitgeklapt, onKlik, children }) {
  return (
    <div className="tk-persoonrij">
      <button
        type="button"
        className={`tk-optie tk-optie-persoon${uitgeklapt ? " open" : ""}`}
        onClick={onKlik}
        aria-expanded={uitgeklapt}
      >
        <span className="tk-bol">{initialen(hunNaam)}</span>
        <span className="tk-optie-tekst">
          <strong>{hunNaam}</strong>
          <small>{onder}</small>
        </span>
        <span className="tk-optie-pijl" aria-hidden="true">
          {uitgeklapt ? "⌄" : "›"}
        </span>
      </button>
      {uitgeklapt && <div className="tk-optie-uit" key={sleutel}>{children}</div>}
    </div>
  );
}

export default function MijnTeam() {
  const { gebruiker, naam, actiefTeam, lidmaatschappen, verlaatTeam, verwijderTeam, teamOverzicht, herlaadTeam } =
    useApp();

  const [team, setTeam] = useState(null);
  const [leden, setLeden] = useState([]);
  const [gedeeld, setGedeeld] = useState({});
  const [laden, setLaden] = useState(true);
  const [open, setOpen] = useState(null);
  const [paneel, setPaneel] = useState(null); // "uitnodigen" | "profiel" | null
  const [bevestigVerlaten, setBevestigVerlaten] = useState(false);
  const [bezigOpruimen, setBezigOpruimen] = useState(false);
  const [toonStappen, setToonStappen] = useState(false);
  const [profielNaam, setProfielNaam] = useState("");
  const [profielMelding, setProfielMelding] = useState("");
  const [voorstellen, setVoorstellen] = useState({});
  const [uploadVoor, setUploadVoor] = useState(null);
  const [gekopieerd, setGekopieerd] = useState(null);

  // De link draagt de code mee, zodat de ontvanger niets hoeft over te typen.
  const uitnodigingslink = (code) => `https://www.mijnteamkompas.nl/app?code=${code}`;

  const uitnodigingstekst = (code, teamNaam) =>
    [
      `Ik gebruik Mijn Teamkompas om onze samenwerking wat makkelijker te maken. Doe je mee met ${teamNaam}?`,
      "",
      `1. Open ${uitnodigingslink(code)}`,
      "2. Vul je e-mailadres in — je ontvangt een e-mail met een inloglink",
      "   (die mail belandt de eerste keer nogal eens bij ongewenste berichten; kijk daar even)",
      `3. De teamcode ${code} staat dan al klaar`,
      "",
      "Je vult zelf in hoe jij samenwerkt, en bepaalt zelf wat je met het team deelt.",
    ].join("\n");

  const kopieer = async (tekst, welke) => {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(welke);
      setTimeout(() => setGekopieerd(null), 2200);
    } catch {
      /* kopiëren mag niet altijd; alles staat zichtbaar op het scherm */
    }
  };

  useEffect(() => {
    if (!actiefTeam) return;
    let actueel = true;
    setLaden(true);
    Promise.all([
      haalTeam(actiefTeam.orgId, actiefTeam.teamId),
      haalTeamleden(actiefTeam.orgId, actiefTeam.teamId),
      haalGedeeldVanTeam(actiefTeam.orgId, actiefTeam.teamId),
      // Alleen een beheerder mag deze lijst opvragen; voor een lid mislukt hij
      // en dat is precies de bedoeling.
      haalVoorstellen({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId }).catch(() => ({})),
    ])
      .then(([t, l, g, v]) => {
        if (!actueel) return;
        setTeam(t);
        setLeden(l);
        setGedeeld(g);
        setVoorstellen(v);
      })
      .finally(() => actueel && setLaden(false));
    return () => {
      actueel = false;
    };
  }, [actiefTeam]);

  const ikBenBeheerder = useMemo(() => {
    const ik = leden.find((l) => l.uid === (gebruiker && gebruiker.uid));
    return ik && ik.rol === "beheerder";
  }, [leden, gebruiker]);

  // Echt opruimen kan alleen wie het team beheert en er als enige in zit; een
  // team mag nooit onder de voeten van anderen weg kunnen verdwijnen.
  const kanVerwijderen = ikBenBeheerder && leden.length <= 1;

  const profielleden = teamOverzicht.profielleden || [];

  const wisselPaneel = (welke) => {
    setPaneel((p) => (p === welke ? null : welke));
    setOpen(null);
  };

  if (!actiefTeam) return <div className="tk-inhoud"><p className="tk-onderkop">Je hebt nog geen team.</p></div>;
  if (laden) return <div className="tk-inhoud"><p className="tk-onderkop">Even laden...</p></div>;

  const onderkop = [
    actiefTeam.orgNaam,
    `${leden.length} ${leden.length === 1 ? "lid" : "leden"}`,
    profielleden.length > 0
      ? `${profielleden.length} toegevoegd ${profielleden.length === 1 ? "profiel" : "profielen"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">{actiefTeam.teamNaam || "Mijn team"}</h1>
      <p className="tk-onderkop">{onderkop}</p>

      {profielMelding && <div className="tk-melding tk-melding-goed">{profielMelding}</div>}

      {/* ---------------------------------------------------------- de mensen */}
      <section className="tk-groep">
        <h2 className="tk-groep-kop">Wie doen er mee</h2>
        <div className="tk-groep-lijst">
          {leden.map((l) => {
            const eigen = l.uid === (gebruiker && gebruiker.uid);
            const g = gedeeld[l.uid];
            const sleutel = `lid-${l.uid}`;

            return (
              <Persoon
                key={sleutel}
                sleutel={sleutel}
                naam={`${l.naam || "Teamgenoot"}${eigen ? " (jij)" : ""}`}
                onder={[
                  l.rol === "beheerder" ? "Beheerder" : null,
                  g
                    ? `${g.kenmerken.length} punten gedeeld`
                    : "Heeft nog niets gedeeld",
                ]
                  .filter(Boolean)
                  .join(" · ")}
                uitgeklapt={open === sleutel}
                onKlik={() => {
                  setOpen(open === sleutel ? null : sleutel);
                  setPaneel(null);
                }}
              >
                {!g && (
                  <p className="tk-fijn" style={{ marginTop: 0 }}>
                    {eigen
                      ? "Je hebt zelf nog niets met dit team gedeeld."
                      : "Zodra deze collega iets deelt, staat het hier."}
                  </p>
                )}

                {g && (
                  <>
                    {g.kenmerken.map((k) => (
                      <p key={k.kenmerkId} className="tk-citaat" style={{ marginBottom: 10 }}>
                        {k.zin}
                      </p>
                    ))}
                    {g.handleiding.map((s) => (
                      <div key={s.sectieId} style={{ marginBottom: 12 }}>
                        <div className="tk-label" style={{ marginBottom: 4 }}>{s.titel}</div>
                        <p style={{ margin: 0, lineHeight: 1.65 }}>{s.tekst}</p>
                      </div>
                    ))}
                  </>
                )}

                {ikBenBeheerder && !eigen && voorstellen[l.uid] && (
                  <p className="tk-fijn">
                    Er staat een voorstel klaar dat {voornaam(l.naam, "deze collega")} nog moet
                    overnemen.
                  </p>
                )}

                <div className="tk-knoppen" style={{ marginTop: 4 }}>
                  {g && !eigen && (
                    <Link
                      className="tk-knop tk-knop-klein"
                      to={`/app/samenwerken?met=${encodeURIComponent(l.uid)}`}
                      style={{ textDecoration: "none" }}
                    >
                      Samenwerken met {voornaam(l.naam, "deze collega")}
                    </Link>
                  )}
                  {eigen && (
                    <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel" style={{ textDecoration: "none" }}>
                      Mijn profiel aanpassen
                    </Link>
                  )}
                  {ikBenBeheerder && !eigen && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={() => setUploadVoor(uploadVoor === l.uid ? null : l.uid)}
                    >
                      {uploadVoor === l.uid ? "Sluiten" : "Insights-profiel klaarzetten"}
                    </button>
                  )}
                </div>

                {uploadVoor === l.uid && (
                  <div style={{ marginTop: 14 }}>
                    <InsightsUpload
                      voorWie={l.naam || "deze persoon"}
                      knopLabel="Als voorstel klaarzetten"
                      onBevestig={async (gelezen) => {
                        await bewaarVoorstel({
                          orgId: actiefTeam.orgId,
                          teamId: actiefTeam.teamId,
                          uid: l.uid,
                          vanUid: gebruiker.uid,
                          vanNaam: naam,
                          voorstel: gelezen,
                        });
                        setVoorstellen((v) => ({ ...v, [l.uid]: { uid: l.uid } }));
                        setUploadVoor(null);
                      }}
                    />
                  </div>
                )}
              </Persoon>
            );
          })}

          {profielleden.map((pl) => {
            const sleutel = `profiel-${pl.id}`;
            return (
              <Persoon
                key={sleutel}
                sleutel={sleutel}
                naam={pl.naam}
                onder={`${(pl.kenmerken || []).length} punten · toegevoegd door ${
                  pl.toegevoegdDoorNaam || "een beheerder"
                }`}
                uitgeklapt={open === sleutel}
                onKlik={() => {
                  setOpen(open === sleutel ? null : sleutel);
                  setPaneel(null);
                }}
              >
                <p className="tk-fijn" style={{ marginTop: 0 }}>
                  Dit profiel komt uit een Insights-rapport dat een beheerder heeft geüpload.{" "}
                  {voornaam(pl.naam, "Deze persoon")} heeft het niet zelf ingevuld of bevestigd.
                </p>

                {(pl.kenmerken || []).map((k) => (
                  <p key={k.kenmerkId} className="tk-citaat" style={{ marginBottom: 10 }}>
                    {k.zin}
                  </p>
                ))}

                <div className="tk-knoppen" style={{ marginTop: 4 }}>
                  <Link
                    className="tk-knop tk-knop-klein"
                    to={`/app/samenwerken?met=${encodeURIComponent(pl.id)}`}
                    style={{ textDecoration: "none" }}
                  >
                    Samenwerken met {voornaam(pl.naam, "dit profiel")}
                  </Link>
                  {ikBenBeheerder && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      onClick={async () => {
                        await verwijderProfiellid({
                          orgId: actiefTeam.orgId,
                          teamId: actiefTeam.teamId,
                          id: pl.id,
                        });
                        await herlaadTeam();
                        setOpen(null);
                        setProfielMelding(`Het profiel van ${pl.naam} is verwijderd.`);
                      }}
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
              </Persoon>
            );
          })}

          {team && team.code && (
            <button
              type="button"
              className={`tk-optie tk-optie-toevoegen${paneel === "uitnodigen" ? " open" : ""}`}
              onClick={() => wisselPaneel("uitnodigen")}
              aria-expanded={paneel === "uitnodigen"}
            >
              <span className="tk-optie-plus" aria-hidden="true">+</span>
              <span>Iemand uitnodigen</span>
              <span className="tk-optie-pijl" aria-hidden="true">
                {paneel === "uitnodigen" ? "⌄" : "›"}
              </span>
            </button>
          )}

          {ikBenBeheerder && (
            <button
              type="button"
              className={`tk-optie tk-optie-toevoegen${paneel === "profiel" ? " open" : ""}`}
              onClick={() => wisselPaneel("profiel")}
              aria-expanded={paneel === "profiel"}
            >
              <span className="tk-optie-plus" aria-hidden="true">+</span>
              <span>Profiel toevoegen uit een Insights-rapport</span>
              <span className="tk-optie-pijl" aria-hidden="true">
                {paneel === "profiel" ? "⌄" : "›"}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------- uitnodigen */}
      {paneel === "uitnodigen" && team && team.code && (
        <div className="tk-kaart">
          <h2 style={{ marginTop: 0 }}>Iemand uitnodigen</h2>
          {lidmaatschappen.length > 1 && (
            <div className="tk-melding" style={{ marginBottom: 14 }}>
              Deze code hoort bij <strong>{actiefTeam.teamNaam || "dit team"}</strong>. Je hoort bij
              meer teams; wil je iemand voor een ander team uitnodigen, wissel dan eerst bovenin bij
              "Je werkt in".
            </div>
          )}

          <div className="tk-code" style={{ marginBottom: 14 }}>{team.code}</div>

          <div className="tk-knoppen">
            <button
              type="button"
              className="tk-knop tk-knop-klein"
              onClick={() => kopieer(uitnodigingstekst(team.code, actiefTeam.teamNaam || "ons team"), "uitnodiging")}
            >
              {gekopieerd === "uitnodiging" ? "Gekopieerd" : "Kopieer de uitnodiging"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => kopieer(uitnodigingslink(team.code), "link")}
            >
              {gekopieerd === "link" ? "Gekopieerd" : "Alleen de link"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => kopieer(team.code, "code")}
            >
              {gekopieerd === "code" ? "Gekopieerd" : "Alleen de code"}
            </button>
          </div>

          <p className="tk-fijn" style={{ marginTop: 14, marginBottom: 0 }}>
            De uitnodiging bevat een link met de code erin, dus de ander hoeft niets over te typen.
            Diegene vult daarna zijn eigen profiel in en bepaalt zelf wat er gedeeld wordt.
          </p>

          <button type="button" className="tk-uitklap" onClick={() => setToonStappen((t) => !t)}>
            {toonStappen ? "⌄" : "›"} Wat moet de ander doen?
          </button>

          {toonStappen && (
            <ol className="tk-fijn" style={{ margin: "6px 0 0", paddingLeft: 20, lineHeight: 1.8 }}>
              <li>
                Gaat naar <span style={{ color: "var(--tk-teal)" }}>mijnteamkompas.nl/app</span> —
                via jouw link staat de code er meteen in
              </li>
              <li>
                Vult een e-mailadres in en klikt op de inloglink in de mail — die belandt de eerste
                keer vaak bij ongewenste berichten
              </li>
              <li>Vult een naam in en doet mee met de code</li>
            </ol>
          )}
        </div>
      )}

      {/* -------------------------------------------- profiel zelf toevoegen */}
      {paneel === "profiel" && ikBenBeheerder && (
        <div className="tk-kaart">
          <h2 style={{ marginTop: 0 }}>Profiel toevoegen</h2>
          <p>
            Heeft iemand nog geen account, of wil je een team compleet maken voor een sessie? Vul een
            naam in en upload het Insights-rapport. Het profiel staat meteen in het team en je kunt
            er direct advies over vragen.
          </p>
          <p className="tk-fijn">
            Bij zo'n profiel staat altijd dat jij het hebt toegevoegd. Het is niet door die persoon
            zelf ingevuld of bevestigd, en het raakt zijn of haar eigen profiel niet — dat blijft van
            de eigenaar alleen, ook voor jou.
          </p>

          <label className="tk-label" htmlFor="tk-profielnaam">Naam van deze persoon</label>
          <input
            id="tk-profielnaam"
            className="tk-invoer"
            value={profielNaam}
            onChange={(e) => setProfielNaam(e.target.value)}
            placeholder="Voornaam"
          />

          <div style={{ marginTop: 14 }}>
            <InsightsUpload
              knopLabel="Toevoegen en meteen delen"
              onBevestig={async (gelezen) => {
                const kenmerken = kenmerkenUitInsights(gelezen)
                  .map((k) => ({
                    kenmerkId: k.kenmerkId,
                    waarde: k.waarde,
                    zin: deelzin(k.kenmerkId, k.waarde) || "",
                  }))
                  .filter((k) => k.zin);

                await bewaarProfiellid({
                  orgId: actiefTeam.orgId,
                  teamId: actiefTeam.teamId,
                  naam: profielNaam.trim() || "Naamloos profiel",
                  kenmerken,
                  insights: {
                    voorkeurskleur: gelezen.voorkeurskleur,
                    tweedeKleur: gelezen.tweedeKleur || null,
                  },
                  toegevoegdDoor: gebruiker.uid,
                  toegevoegdDoorNaam: naam,
                });

                await herlaadTeam();
                setProfielMelding(
                  `${profielNaam.trim() || "Het profiel"} staat in het team met ${kenmerken.length} punten. Je kunt er meteen advies over vragen.`
                );
                setProfielNaam("");
                setPaneel(null);
              }}
            />
          </div>
        </div>
      )}

      <VolgendeStap verbergAls="uitnodigen" />

      {/* ------------------------------------------------------- dit team zelf */}
      <section className="tk-stil">
        <h2 className="tk-groep-kop">Dit team</h2>
        <p className="tk-fijn">
          {ikBenBeheerder
            ? "Je bent beheerder. Dat gaat over de teamgegevens; het geeft je geen inzage in de profielen van anderen."
            : "Je bent lid van dit team."}{" "}
          <Link to="/app/welkom?extra=1" style={{ color: "var(--tk-teal)" }}>
            Bij een ander team aansluiten
          </Link>
          {lidmaatschappen.length > 1
            ? ` — je hoort bij ${lidmaatschappen.length} teams; wissel bovenin om een ander te zien.`
            : "."}
        </p>

        {bevestigVerlaten ? (
          <>
            <p className="tk-fijn">
              {kanVerwijderen
                ? "Je bent de enige in dit team, dus het wordt echt opgeruimd: het team, de organisatie en de teamcode verdwijnen. De code werkt daarna niet meer. Je eigen profiel blijft gewoon staan."
                : "Alles wat je met dit team deelde wordt direct verwijderd. Het team zelf blijft bestaan voor de anderen."}
            </p>
            <div className="tk-knoppen">
              <button
                type="button"
                className="tk-knop tk-knop-klein tk-knop-gevaar"
                disabled={bezigOpruimen}
                onClick={async () => {
                  setBezigOpruimen(true);
                  try {
                    if (kanVerwijderen) {
                      await verwijderTeam({
                        orgId: actiefTeam.orgId,
                        teamId: actiefTeam.teamId,
                        code: team && team.code,
                      });
                    } else {
                      await verlaatTeam({ orgId: actiefTeam.orgId, teamId: actiefTeam.teamId });
                    }
                  } finally {
                    setBezigOpruimen(false);
                  }
                }}
              >
                {bezigOpruimen ? "Bezig..." : kanVerwijderen ? "Ja, verwijder dit team" : "Ja, verlaat dit team"}
              </button>
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setBevestigVerlaten(false)}
              >
                Toch niet
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="tk-stille-knop" onClick={() => setBevestigVerlaten(true)}>
            {kanVerwijderen ? "Dit team verwijderen" : "Dit team verlaten"}
          </button>
        )}
      </section>

      <div style={{ height: 30 }} />
    </div>
  );
}
