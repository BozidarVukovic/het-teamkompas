// Mijn profiel.
//
// Twee routes naar hetzelfde resultaat:
//   1. Snel — upload je Insights Discovery-profiel; alles wordt ingevuld en jij
//      controleert. Bedoeld voor wie er een minuut aan wil besteden.
//   2. Zelf — twaalf korte vragen, elk antwoord van jou. Voor wie het precies
//      wil hebben, of geen profiel heeft.
//
// Beide leiden tot dezelfde twaalf kenmerken, en in beide gevallen geldt: bij
// elk punt staat waar het vandaan komt, en jij bepaalt per punt of je het deelt.

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { BEVESTIGING, BRONNEN, CATEGORIEEN, KENMERKEN } from "../../data/app/kenmerken";
import { KLEUREN, insightsSamenvatting, kleur } from "../../lib/app/insights";
import InsightsUpload from "../../components/app/InsightsUpload";
import Voortgang from "../../components/app/Voortgang";
import { TE_DOEN, bepaalVoortgang, vraagtAandacht } from "../../lib/app/voortgang";
import { zichtbaarheidVan } from "../../lib/app/zichtbaarheid";
import { telKenmerken, sleutelVan } from "../../lib/app/telling";
import useActie from "../../components/app/useActie";
import Melding from "../../components/app/Melding";

function bronLabel(bron) {
  const b = BRONNEN.find((x) => x.id === bron);
  return b ? b.label : "Zelf ingevuld";
}

/* ------------------------------------------------------------- keuzescherm */

function Keuze({ onKies }) {
  return (
    <>
      <h1 className="tk-kop">Hoe wil je je profiel invullen?</h1>
      <p className="tk-onderkop">
        Je profiel bepaalt hoe gericht het advies is dat je teamgenoten over de samenwerking met jou
        krijgen. Beide routes leiden tot hetzelfde; kies wat bij je past.
      </p>

      <button type="button" className="tk-keuze" style={{ padding: 20, marginBottom: 12 }} onClick={() => onKies("insights")}>
        <span>
          <strong style={{ fontSize: "var(--tk-t-kop)" }}>Ik heb een Insights Discovery-profiel</strong>
          <small style={{ fontSize: "var(--tk-t-basis)", marginTop: 6 }}>
            Upload het PDF-bestand. Wat daarin over jouw manier van werken staat, gebruiken we om de
            twaalf punten alvast in te vullen. Daarna loop je ze na en pas je aan wat niet klopt.
            Ongeveer een minuut.
          </small>
        </span>
      </button>

      <button type="button" className="tk-keuze" style={{ padding: 20 }} onClick={() => onKies("zelf")}>
        <span>
          <strong style={{ fontSize: "var(--tk-t-kop)" }}>Zelf invullen</strong>
          <small style={{ fontSize: "var(--tk-t-basis)", marginTop: 6 }}>
            Twaalf korte vragen over hoe jij werkt en samenwerkt. Jij bepaalt elk antwoord. Ongeveer
            vijf minuten.
          </small>
        </span>
      </button>
    </>
  );
}

/* ------------------------------------------------------------- één kenmerk */

/**
 * Eén kenmerk als één regel, die je opendraait.
 *
 * Dit stond als twaalf blokken in vier volle kaarten onder elkaar: bij elk punt
 * de vraag, vier antwoordknoppen, drie bevestigingsknoppen en een deel-vinkje,
 * allemaal tegelijk in beeld. Je zag geen profiel, je zag een formulier.
 *
 * Dicht staat er wat je erover deelt — de zin zelf, in jouw woorden. Open staat
 * het formulier. Er staat er één tegelijk open.
 */
function KenmerkRij({
  kenmerk,
  nummer,
  huidig,
  lidmaatschappen,
  deelbareTeams,
  open,
  onOpen,
  onKies,
  onBevestig,
  onDelen,
}) {
  const gekozenOptie = huidig && huidig.waarde ? kenmerk.opties.find((o) => o.id === huidig.waarde) : null;
  const ingevuld = gekozenOptie && huidig.bevestigd !== "nee";

  // Bij elk punt staat wie het kan zien. "Privé" is geen tussenstand die je nog
  // moet afmaken; het is een geldige keuze, en die hoort er net zo duidelijk te
  // staan als het delen zelf.
  const zichtbaarheid = zichtbaarheidVan(huidig, lidmaatschappen);

  // Dicht is er ruimte voor één woord rechts. Wat je moet weten in volgorde:
  // is het ingevuld, klopt het volgens jou, en wie ziet het.
  const stand = !ingevuld ? "" : !huidig.bevestigd ? "Nog bevestigen" : zichtbaarheid.label;
  const standKlaar = Boolean(ingevuld && huidig.bevestigd && zichtbaarheid.gedeeld);

  return (
    <div className="tk-persoonrij">
      <button
        type="button"
        className={`tk-optie${open ? " open" : ""}`}
        onClick={onOpen}
        aria-expanded={open}
      >
        <span className="tk-nummer" aria-hidden="true">{nummer}</span>
        <span className="tk-optie-tekst">
          <strong>{kenmerk.label}</strong>
          <small>{ingevuld ? gekozenOptie.deelbaarAls : kenmerk.vraag}</small>
        </span>
        {stand && <span className={`tk-optie-stand${standKlaar ? " klaar" : ""}`}>{stand}</span>}
        <span className="tk-optie-pijl" aria-hidden="true">›</span>
      </button>

      {open && (
        <div className="tk-optie-uit">
          {ingevuld && (
            <p className="tk-fijn" style={{ margin: "0 0 10px" }}>
              <span className="tk-bron">{bronLabel(huidig.bron)}</span>{" "}
              <span className={`tk-privacy ${zichtbaarheid.gedeeld ? "tk-privacy-gedeeld" : "tk-privacy-prive"}`}>
                {zichtbaarheid.label}
              </span>
            </p>
          )}

          <p className="tk-fijn" style={{ margin: "0 0 10px" }}>{kenmerk.vraag}</p>
          <div className="tk-keuzes">
            {kenmerk.opties.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`tk-keuze${huidig && huidig.waarde === o.id && huidig.bevestigd !== "nee" ? " gekozen" : ""}`}
                onClick={() => onKies(kenmerk.id, o.id)}
              >
                <span>{o.label}</span>
              </button>
            ))}
          </div>

          {gekozenOptie && (
            <div className="tk-knoppen" style={{ marginTop: 12 }}>
              {BEVESTIGING.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`tk-knop tk-knop-klein ${huidig.bevestigd === b.id ? "" : "tk-knop-rand"}`}
                  onClick={() => onBevestig(kenmerk.id, b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {ingevuld && deelbareTeams.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {deelbareTeams.map((l) => {
                const s = `${l.orgId}/${l.teamId}`;
                return (
                  <label className="tk-schakelaar" key={s} style={{ marginRight: 16 }}>
                    <input
                      type="checkbox"
                      checked={(huidig.gedeeldMet || []).includes(s)}
                      onChange={() => onDelen(kenmerk.id, s)}
                    />
                    Delen met {l.teamNaam || "team"}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ pagina */

export default function MijnProfiel() {
  const {
    kenmerken,
    handleiding,
    profiel,
    actiefTeam,
    ikBegeleid,
    begeleideTeams,
    lidmaatschappen,
    bewaarKenmerk,
    bewaarMeerKenmerken,
    bewaarInsights,
    wisInsights,
    voorstellen,
    neemInsightsOver,
    neemVoorstelOver,
    wijsVoorstelAf,
  } = useApp();

  const [modus, setModus] = useState(null);

  // Eén punt tegelijk open, en het Insights-blok apart. Alles tegelijk open is
  // precies het formulier waar dit scherm vanaf moest.
  const [openPunt, setOpenPunt] = useState(null);
  const [toonInsights, setToonInsights] = useState(false);

  // Kom je hier via een knop als "nalopen wat nog open staat", dan tonen we
  // alleen de punten die dat aangaat. Zonder dat beland je boven aan een lijst
  // van twaalf en mag je zelf zoeken wat er nog moet.
  const [zoekParams, setZoekParams] = useSearchParams();
  const gevraagd = zoekParams.get("doen");
  const doen = TE_DOEN.includes(gevraagd) ? gevraagd : null;
  const { bezig, melding, setMelding, voerUit, wisMelding } = useActie();

  const perId = useMemo(() => {
    const uit = {};
    kenmerken.forEach((k) => {
      uit[k.kenmerkId] = k;
    });
    return uit;
  }, [kenmerken]);

  // Doorlopend nummer over alle categorieën heen, zodat "7 / 12" klopt met hoe
  // ver je bent en niet met waar je in een kopje zit.
  const nummerVan = useMemo(() => {
    const uit = {};
    let n = 0;
    CATEGORIEEN.forEach((c) => {
      KENMERKEN.filter((k) => k.categorie === c.id).forEach((k) => {
        n += 1;
        uit[k.id] = n;
      });
    });
    return uit;
  }, []);

  // Zelfde telling als de voortgangsbalk en de volgende stap; zie telling.js.
  const geteld = telKenmerken({ kenmerken, actiefTeam });
  const bruikbaar = geteld.bruikbaar;
  const sleutel = sleutelVan(actiefTeam);
  const gedeeld = geteld.aantalGedeeld;
  const insights = (profiel && profiel.insights) || null;

  // Met de echte handleiding, net als de <Voortgang> hieronder op ditzelfde
  // scherm. Stond hier een leeg object, dan berekenden twee dingen op één
  // pagina een andere voortgang — nu onzichtbaar, maar wachtend op de eerste
  // keer dat dit scherm iets over de handleiding toont.
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding, ikBegeleid });

  // Een team dat je begeleidt hoort niet in de deel-vinkjes: je doet er niet
  // aan mee, dus er valt niets met dat team te delen.
  const deelbareTeams = (lidmaatschappen || []).filter(
    (l) => !(begeleideTeams || []).includes(`${l.orgId}/${l.teamId}`)
  );
  const onderdeel = doen ? voortgang.onderdelen.find((o) => o.id === doen) : null;

  const vraagtNogAandacht = (kenmerkId) =>
    vraagtAandacht({ kenmerk: perId[kenmerkId], doen, sleutel });

  const openPunten = doen ? KENMERKEN.filter((k) => vraagtNogAandacht(k.id)) : KENMERKEN;

  // Er stonden tot zes gevulde knoppen tegelijk op dit scherm: bevestigen,
  // overnemen, delen, uploaden, de volgende stap, en per punt een "Klopt".
  // Alles even hard, dus je wist niet waar je moest klikken. Nu is er precies
  // één ding dat nu aan de beurt is; de rest blijft bereikbaar maar omlijnd.
  const nalopen = voortgang.onderdelen.find((o) => o.id === "nagelopen");
  const kanDelen = Boolean(
    !ikBegeleid && actiefTeam && bruikbaar.length > 0 && (!doen || doen === "gedeeld")
  );
  const watNu = doen && openPunten.length === 0
    ? null
    : voorstellen.length > 0
      ? "voorstel"
      : nalopen && nalopen.open > 0
        ? "nalopen"
        : kanDelen && gedeeld < bruikbaar.length
          ? "delen"
          : null;

  const toonAlles = () => {
    zoekParams.delete("doen");
    setZoekParams(zoekParams, { replace: true });
  };

  /* --------------------------------------------------------------- acties */

  const kiesWaarde = async (kenmerkId, waarde) => {
    setOpenPunt(null);
    const bestaand = perId[kenmerkId] || {};
    await bewaarKenmerk({
      kenmerkId,
      waarde,
      bron: "manual",
      bevestigd: "sterk",
      gedeeldMet: bestaand.gedeeldMet || [],
    });
  };

  const zetBevestiging = async (kenmerkId, bevestigd) => {
    const bestaand = perId[kenmerkId];
    if (!bestaand || !bestaand.waarde) return;
    await bewaarKenmerk({
      ...bestaand,
      bevestigd,
      gedeeldMet: bevestigd === "nee" ? [] : bestaand.gedeeldMet || [],
    });
  };

  const wisselDelen = async (kenmerkId, teamSleutel) => {
    const bestaand = perId[kenmerkId];
    if (!bestaand || !bestaand.waarde) return;
    const huidig = bestaand.gedeeldMet || [];
    await bewaarKenmerk({
      ...bestaand,
      gedeeldMet: huidig.includes(teamSleutel)
        ? huidig.filter((s) => s !== teamSleutel)
        : [...huidig, teamSleutel],
    });
  };

  // Alles in één keer bevestigen. Wie zijn profiel heeft ingelezen en het
  // herkent, hoeft niet twaalf keer op "Klopt" te drukken.
  const bevestigAlles = async () => {
    const open = KENMERKEN.map((k) => perId[k.id]).filter(
      (k) => k && k.waarde && !k.bevestigd && k.bevestigd !== "nee"
    );
    if (open.length === 0) return;
    await voerUit(
      "je punten bevestigen",
      () => bewaarMeerKenmerken(open.map((k) => ({ ...k, bevestigd: "sterk" }))),
      `${open.length} ${open.length === 1 ? "punt" : "punten"} bevestigd. Loop ze gerust nog een keer na; aanpassen kan altijd.`
    );
  };

  const deelAlles = async (aan) => {
    if (!sleutel || bruikbaar.length === 0) return;
    await voerUit(
      aan ? "alles delen met je team" : "het delen intrekken",
      () =>
        bewaarMeerKenmerken(
          bruikbaar.map((k) => ({
            ...k,
            gedeeldMet: aan
              ? [...new Set([...(k.gedeeldMet || []), sleutel])]
              : (k.gedeeldMet || []).filter((s) => s !== sleutel),
          }))
        ),
      aan
        ? `Alles gedeeld met ${actiefTeam.teamNaam || "je team"}. Je teamgenoten zien nu ${bruikbaar.length} punten over de samenwerking met jou.`
        : "Je deelt nu niets meer met dit team."
    );
  };

  const naUpload = async (gelezen) => {
    // InsightsUpload vangt een fout hier zelf op en laat het gelezen profiel
    // staan, zodat je het opnieuw kunt proberen zonder de PDF nog eens te
    // kiezen. Gooien mag dus, en hoort ook.
    const aantal = await neemInsightsOver(gelezen);
    setModus("zelf");
    setMelding({
      soort: "goed",
      tekst:
        aantal > 0
          ? `Klaar — ${aantal} punten ingevuld op basis van je profiel. Loop ze hieronder na en pas aan wat niet klopt.`
          : "Je profiel is bewaard. Je eigen antwoorden hebben we laten staan.",
    });
  };

  /* ------------------------------------------------------------- weergave */

  const toonKeuze = bruikbaar.length === 0 && modus === null && voorstellen.length === 0;

  if (toonKeuze) {
    return (
      <div className="tk-inhoud tk-smal">
        <Keuze onKies={setModus} />
      </div>
    );
  }

  if (modus === "insights") {
    return (
      <div className="tk-inhoud tk-smal">
        <h1 className="tk-kop">Je Insights-profiel</h1>
        <p className="tk-onderkop">
          Kies het PDF-bestand van je Insights Discovery-profiel. Wat daarin staat over jouw manier
          van werken, gebruiken we om de twaalf punten alvast in te vullen. Je bepaalt daarna zelf
          wat blijft staan.
        </p>
        <div className="tk-kaart">
          <InsightsUpload onBevestig={naUpload} knopLabel="Overnemen in mijn profiel" />
        </div>
        <button
          type="button"
          className="tk-knop tk-knop-rand tk-knop-klein"
          onClick={() => setModus(bruikbaar.length > 0 ? "zelf" : null)}
        >
          Terug
        </button>
      </div>
    );
  }

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn profiel</h1>
      <p className="tk-onderkop">
        Niets hiervan is zichtbaar voor anderen, behalve wat je zelf deelt.
      </p>

      <Melding melding={melding} onSluiten={wisMelding} />

      {doen && onderdeel ? (
        <div className="tk-kaart tk-kaart-klaar">
          <div className="tk-label" style={{ color: "var(--tk-teal)", marginBottom: 6 }}>
            {onderdeel.label}
          </div>
          <h2 style={{ margin: "0 0 6px" }}>
            {openPunten.length === 0
              ? "Niets meer te doen"
              : `Nog ${openPunten.length} ${openPunten.length === 1 ? "punt" : "punten"} te gaan`}
          </h2>
          <p>
            Je ziet alleen de punten die hier nog om vragen — {onderdeel.aantal} van de{" "}
            {onderdeel.van} zijn al {onderdeel.label.toLowerCase()}.
          </p>
          <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={toonAlles}>
            Alle twaalf punten tonen
          </button>
        </div>
      ) : (
        <Voortgang variant="klein" />
      )}

      {watNu === "nalopen" && (
        <div className="tk-kaart tk-kaart-klaar">
          <h2>Klopt dit allemaal?</h2>
          <p>
            Er staan {nalopen.open} {nalopen.open === 1 ? "punt" : "punten"} die je nog niet hebt
            bevestigd. Herken je jezelf erin, bevestig ze dan in één keer — aanpassen kan daarna
            nog steeds, punt voor punt.
          </p>
          <div className="tk-knoppen">
            <button type="button" className="tk-knop tk-knop-klein" disabled={bezig} onClick={bevestigAlles}>
              {bezig ? "Bezig..." : `Ja, alles klopt (${nalopen.open})`}
            </button>
            {!doen && (
              <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/profiel?doen=nagelopen">
                Eerst stuk voor stuk bekijken
              </Link>
            )}
          </div>
        </div>
      )}

      {voorstellen.map((v) => (
        <div className="tk-kaart tk-kaart-klaar" key={`${v.orgId}/${v.teamId}`}>
          <h2>Er staat een profielvoorstel voor je klaar</h2>
          <p>
            {v.vanNaam || "Iemand uit je team"} heeft jouw Insights-profiel ingelezen en een voorstel
            klaargezet. Er staat nog niets in je profiel: dat gebeurt pas als jij het overneemt, en
            daarna loop je elk punt zelf na.
          </p>
          <p className="tk-fijn">
            Voorstel: {(kleur(v.voorkeurskleur) || {}).label || v.voorkeurskleur}
            {v.tweedeKleur ? ` met ${kleur(v.tweedeKleur).label.toLowerCase()} daarnaast` : ""}.
          </p>
          <div className="tk-knoppen">
            <button
              type="button"
              className="tk-knop tk-knop-klein"
              disabled={bezig}
              onClick={async () => {
                let aantal = 0;
                await voerUit("het voorstel overnemen", async () => {
                  aantal = await neemVoorstelOver(v);
                });
                if (aantal) {
                  setMelding({
                    soort: "goed",
                    tekst: `Overgenomen — ${aantal} punten ingevuld. Loop ze hieronder na.`,
                  });
                }
              }}
            >
              Overnemen
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              disabled={bezig}
              onClick={() =>
                voerUit(
                  "het voorstel weggooien",
                  () => wijsVoorstelAf(v),
                  "Het voorstel is weggegooid. Er is niets van bewaard."
                )
              }
            >
              Nee, dank je
            </button>
          </div>
        </div>
      ))}

      {doen && openPunten.length === 0 && (
        <div className="tk-kaart tk-kaart-klaar">
          <h2>Dit deel is klaar</h2>
          <p>
            Er staat niets meer open bij "{onderdeel ? onderdeel.label.toLowerCase() : doen}".
            {voortgang.volgende
              ? " Er is nog wel iets anders te doen."
              : " Je profiel is compleet."}
          </p>
          <div className="tk-knoppen">
            {voortgang.volgende && (
              <Link className="tk-knop tk-knop-klein" to={voortgang.volgende.naar}>
                {voortgang.volgende.knop} ({voortgang.volgende.open})
              </Link>
            )}
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={toonAlles}>
              Alle twaalf punten tonen
            </button>
          </div>
        </div>
      )}

      {/* Vier lijsten van regels in plaats van vier volle kaarten met twaalf
          formulieren erin. Wat je ziet is je profiel; het invullen zit erachter. */}
      {CATEGORIEEN.map((categorie) => {
        const groep = openPunten.filter((k) => k.categorie === categorie.id);
        if (groep.length === 0) return null;
        return (
          <section className="tk-groep" key={categorie.id}>
            <h2 className="tk-groep-kop">{categorie.label}</h2>
            <div className="tk-groep-lijst">
              {groep.map((k) => (
                <KenmerkRij
                  key={k.id}
                  kenmerk={k}
                  huidig={perId[k.id]}
                  lidmaatschappen={lidmaatschappen}
                  deelbareTeams={deelbareTeams}
                  nummer={nummerVan[k.id]}
                  open={openPunt === k.id}
                  onOpen={() => setOpenPunt((h) => (h === k.id ? null : k.id))}
                  onKies={kiesWaarde}
                  onBevestig={zetBevestiging}
                  onDelen={wisselDelen}
                />
              ))}
            </div>
          </section>
        );
      })}

      {ikBegeleid && actiefTeam && (
        <div className="tk-kaart">
          <h2>Je begeleidt {actiefTeam.teamNaam || "dit team"}</h2>
          <p style={{ marginBottom: 0 }}>
            Je doet zelf niet mee in dit team, dus je deelt er niets mee. Je profiel blijft
            gewoon van jou — en in teams waar je wél aan meedoet, kun je het delen zoals altijd.
          </p>
        </div>
      )}

      {kanDelen && (
        <div className="tk-kaart">
          <h2>Klaar? Deel het met {actiefTeam.teamNaam || "je team"}</h2>
          <p>
            Dit is de laatste stap. Je teamgenoten zien alleen wat je deelt, en altijd als leesbare
            zin — nooit als score of etiket. Intrekken kan op elk moment.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>
              {gedeeld === 0
                ? "Je deelt op dit moment niets."
                : `Je deelt ${gedeeld} van ${bruikbaar.length} punten.`}
            </strong>
          </p>
          <div className="tk-knoppen">
            {gedeeld < bruikbaar.length && (
              <button
                type="button"
                className={`tk-knop tk-knop-klein${watNu === "delen" ? "" : " tk-knop-rand"}`}
                disabled={bezig}
                onClick={() => deelAlles(true)}
              >
                Alles delen
              </button>
            )}
            {gedeeld > 0 && (
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" disabled={bezig} onClick={() => deelAlles(false)}>
                Niets delen
              </button>
            )}
            {gedeeld > 0 && (
              <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/samenwerken">
                Advies vragen
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Insights is een route naar je profiel, niet je profiel zelf. Als volle
          kaart met vier kleurknoppen stond hij even hard te roepen als de punten
          zelf; als regel die je opendraait staat hij er voor wie hem zoekt. */}
      {!doen && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Insights Discovery</h2>
          <div className="tk-groep-lijst">
            <div className="tk-persoonrij">
              <button
                type="button"
                className={`tk-optie${toonInsights ? " open" : ""}`}
                onClick={() => setToonInsights((v) => !v)}
                aria-expanded={toonInsights}
              >
                <span className="tk-optie-tekst">
                  <strong>{insights ? "Je Insights-profiel" : "Een Insights-profiel gebruiken"}</strong>
                  <small>
                    {insights
                      ? insightsSamenvatting(insights)
                      : "Upload je PDF, of kies de kleur die je het meest in jezelf herkent."}
                  </small>
                </span>
                <span className="tk-optie-pijl" aria-hidden="true">›</span>
              </button>

              {toonInsights && (
                <div className="tk-optie-uit">
                  {insights ? (
                    <div className="tk-knoppen">
                      <button
                        type="button"
                        className="tk-knop tk-knop-rand tk-knop-klein"
                        onClick={() => setModus("insights")}
                      >
                        Ander profiel inlezen
                      </button>
                      <button
                        type="button"
                        className="tk-knop tk-knop-rand tk-knop-klein"
                        onClick={() =>
                          voerUit(
                            "je Insights-gegevens wissen",
                            () => wisInsights(),
                            "Je Insights-profiel is gewist. De punten die je hebt ingevuld, blijven staan."
                          )
                        }
                      >
                        Insights-gegevens wissen
                      </button>
                    </div>
                  ) : (
                    <>
                      <p style={{ marginTop: 0 }}>
                        Heb je ooit een Insights Discovery-profiel gemaakt? Upload het PDF-bestand, dan
                        vullen we de punten hierboven alvast in. Geen profiel, of niet bij de hand? Kies
                        dan zelf welke omschrijving het beste bij je past.
                      </p>
                      <div className="tk-knoppen" style={{ marginBottom: 16 }}>
                        <button
                          type="button"
                          className="tk-knop tk-knop-rand tk-knop-klein"
                          onClick={() => setModus("insights")}
                        >
                          Profiel-PDF uploaden
                        </button>
                      </div>

                      <div className="tk-label">Wat past het beste bij jou?</div>
                      <p className="tk-fijn" style={{ margin: "0 0 10px" }}>
                        Insights Discovery onderscheidt vier manieren van werken. Kies degene die je het
                        meest in jezelf herkent; we vullen daarmee de punten hierboven in en jij
                        corrigeert wat niet klopt.
                      </p>
                      <div className="tk-keuzes">
                        {KLEUREN.map((k) => (
                          <button
                            key={k.id}
                            type="button"
                            className="tk-keuze"
                            disabled={bezig}
                            onClick={async () => {
                              let aantal = 0;
                              await voerUit(`${k.label.toLowerCase()} kiezen`, async () => {
                                await bewaarInsights({ voorkeurskleur: k.id, tweedeKleur: null });
                                aantal = await neemInsightsOver({
                                  voorkeurskleur: k.id,
                                  tweedeKleur: null,
                                  teksten: {},
                                });
                              });
                              if (aantal) {
                                setMelding({
                                  soort: "goed",
                                  tekst: `${aantal} punten ingevuld op basis van ${k.label.toLowerCase()}. Loop ze hierboven na.`,
                                });
                              }
                            }}
                          >
                            <span aria-hidden="true" className="tk-kleurstip" style={{ background: k.kleur }} />
                            <span>
                              {k.label}
                              <small>{k.omschrijving}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <p className="tk-fijn tk-voetnoot">
        Wat je hier invult zijn voorkeuren in samenwerking, geen oordeel over wie je bent.
      </p>
    </div>
  );
}
