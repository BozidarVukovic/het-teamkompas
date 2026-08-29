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
import VolgendeStap from "../../components/app/VolgendeStap";
import { BEVESTIGING, BRONNEN, CATEGORIEEN, KENMERKEN } from "../../data/app/kenmerken";
import { KLEUREN, insightsSamenvatting, kleur } from "../../lib/app/insights";
import InsightsUpload from "../../components/app/InsightsUpload";
import Voortgang from "../../components/app/Voortgang";
import { TE_DOEN, bepaalVoortgang, vraagtAandacht } from "../../lib/app/voortgang";

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
          <strong style={{ fontSize: 17 }}>Ik heb een Insights Discovery-profiel</strong>
          <small style={{ fontSize: 14, marginTop: 6 }}>
            Upload het PDF-bestand. Wat daarin over jouw manier van werken staat, gebruiken we om de
            twaalf punten alvast in te vullen. Daarna loop je ze na en pas je aan wat niet klopt.
            Ongeveer een minuut.
          </small>
        </span>
      </button>

      <button type="button" className="tk-keuze" style={{ padding: 20 }} onClick={() => onKies("zelf")}>
        <span>
          <strong style={{ fontSize: 17 }}>Zelf invullen</strong>
          <small style={{ fontSize: 14, marginTop: 6 }}>
            Twaalf korte vragen over hoe jij werkt en samenwerkt. Jij bepaalt elk antwoord. Ongeveer
            vijf minuten.
          </small>
        </span>
      </button>

      <p className="tk-fijn" style={{ marginTop: 18 }}>
        Je kunt altijd wisselen. Ook na een upload blijft elk punt aanpasbaar, en zonder profiel werkt
        alles net zo goed.
      </p>
    </>
  );
}

/* ------------------------------------------------------------- één kenmerk */

function KenmerkKaart({ kenmerk, nummer, totaal, huidig, lidmaatschappen, onKies, onBevestig, onDelen }) {
  const gekozenOptie = huidig && huidig.waarde ? kenmerk.opties.find((o) => o.id === huidig.waarde) : null;
  const [open, setOpen] = useState(!gekozenOptie);

  return (
    <div style={{ padding: "16px 0", borderTop: "1px solid var(--tk-lijn)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <span
          className="tk-fijn"
          style={{ fontVariantNumeric: "tabular-nums", minWidth: 42, flex: "0 0 auto" }}
        >
          {nummer} / {totaal}
        </span>
        <strong style={{ fontSize: 15.5 }}>{kenmerk.label}</strong>
        {gekozenOptie && <span className="tk-bron">{bronLabel(huidig.bron)}</span>}
      </div>

      {gekozenOptie && !open ? (
        <div style={{ marginTop: 8 }}>
          <p className="tk-citaat" style={{ margin: "0 0 10px" }}>{gekozenOptie.deelbaarAls}</p>
          <div className="tk-knoppen">
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => setOpen(true)}>
              Aanpassen
            </button>
            {huidig.bevestigd !== "sterk" && (
              <button type="button" className="tk-knop tk-knop-klein" onClick={() => onBevestig(kenmerk.id, "sterk")}>
                Klopt
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="tk-fijn" style={{ margin: "6px 0 10px" }}>{kenmerk.vraag}</p>
          <div className="tk-keuzes">
            {kenmerk.opties.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`tk-keuze${huidig && huidig.waarde === o.id && huidig.bevestigd !== "nee" ? " gekozen" : ""}`}
                onClick={() => {
                  onKies(kenmerk.id, o.id);
                  setOpen(false);
                }}
              >
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          {gekozenOptie && (
            <div className="tk-knoppen" style={{ marginTop: 10 }}>
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
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => setOpen(false)}>
                Klaar
              </button>
            </div>
          )}
        </>
      )}

      {gekozenOptie && huidig.bevestigd !== "nee" && lidmaatschappen.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {lidmaatschappen.map((l) => {
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
  );
}

/* ------------------------------------------------------------------ pagina */

export default function MijnProfiel() {
  const {
    kenmerken,
    profiel,
    actiefTeam,
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

  // Kom je hier via een knop als "nalopen wat nog open staat", dan tonen we
  // alleen de punten die dat aangaat. Zonder dat beland je boven aan een lijst
  // van twaalf en mag je zelf zoeken wat er nog moet.
  const [zoekParams, setZoekParams] = useSearchParams();
  const gevraagd = zoekParams.get("doen");
  const doen = TE_DOEN.includes(gevraagd) ? gevraagd : null;
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);

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

  const bruikbaar = kenmerken.filter((k) => k.waarde && k.bevestigd !== "nee");
  const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;
  const gedeeld = sleutel ? bruikbaar.filter((k) => (k.gedeeldMet || []).includes(sleutel)).length : 0;
  const insights = (profiel && profiel.insights) || null;

  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding: {} });
  const onderdeel = doen ? voortgang.onderdelen.find((o) => o.id === doen) : null;

  const vraagtNogAandacht = (kenmerkId) =>
    vraagtAandacht({ kenmerk: perId[kenmerkId], doen, sleutel });

  const openPunten = doen ? KENMERKEN.filter((k) => vraagtNogAandacht(k.id)) : KENMERKEN;

  const toonAlles = () => {
    zoekParams.delete("doen");
    setZoekParams(zoekParams, { replace: true });
  };

  /* --------------------------------------------------------------- acties */

  const kiesWaarde = async (kenmerkId, waarde) => {
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
    setBezig(true);
    try {
      await bewaarMeerKenmerken(open.map((k) => ({ ...k, bevestigd: "sterk" })));
      setMelding(
        `${open.length} ${open.length === 1 ? "punt" : "punten"} bevestigd. Loop ze gerust nog een keer na; aanpassen kan altijd.`
      );
    } finally {
      setBezig(false);
    }
  };

  const deelAlles = async (aan) => {
    if (!sleutel || bruikbaar.length === 0) return;
    setBezig(true);
    try {
      await bewaarMeerKenmerken(
        bruikbaar.map((k) => ({
          ...k,
          gedeeldMet: aan
            ? [...new Set([...(k.gedeeldMet || []), sleutel])]
            : (k.gedeeldMet || []).filter((s) => s !== sleutel),
        }))
      );
      setMelding(
        aan
          ? `Alles gedeeld met ${actiefTeam.teamNaam || "je team"}. Je teamgenoten zien nu ${bruikbaar.length} punten over de samenwerking met jou.`
          : "Je deelt nu niets meer met dit team."
      );
    } finally {
      setBezig(false);
    }
  };

  const naUpload = async (gelezen) => {
    const aantal = await neemInsightsOver(gelezen);
    setModus("zelf");
    setMelding(
      aantal > 0
        ? `Klaar — ${aantal} punten ingevuld op basis van je profiel. Loop ze hieronder na en pas aan wat niet klopt.`
        : "Je profiel is bewaard. Je eigen antwoorden hebben we laten staan."
    );
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

      {melding && <div className="tk-melding tk-melding-goed">{melding}</div>}

      {doen && onderdeel ? (
        <div className="tk-kaart" style={{ borderColor: "rgba(0,168,150,0.45)" }}>
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

      {(() => {
        const nalopen = voortgang.onderdelen.find((o) => o.id === "nagelopen");
        if (!nalopen || nalopen.open === 0) return null;
        return (
          <div className="tk-kaart">
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
                <Link
                  className="tk-knop tk-knop-rand tk-knop-klein"
                  to="/app/profiel?doen=nagelopen"
                  style={{ textDecoration: "none" }}
                >
                  Eerst stuk voor stuk bekijken
                </Link>
              )}
            </div>
          </div>
        );
      })()}

      {voorstellen.map((v) => (
        <div className="tk-kaart" key={`${v.orgId}/${v.teamId}`} style={{ borderColor: "rgba(0,168,150,0.45)" }}>
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
                setBezig(true);
                try {
                  const aantal = await neemVoorstelOver(v);
                  setMelding(`Overgenomen — ${aantal} punten ingevuld. Loop ze hieronder na.`);
                } finally {
                  setBezig(false);
                }
              }}
            >
              Overnemen
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              disabled={bezig}
              onClick={async () => {
                setBezig(true);
                try {
                  await wijsVoorstelAf(v);
                  setMelding("Het voorstel is weggegooid. Er is niets van bewaard.");
                } finally {
                  setBezig(false);
                }
              }}
            >
              Nee, dank je
            </button>
          </div>
        </div>
      ))}

      {doen && openPunten.length === 0 && (
        <div className="tk-kaart" style={{ borderColor: "rgba(0,168,150,0.45)" }}>
          <h2>Dit deel is klaar</h2>
          <p>
            Er staat niets meer open bij "{onderdeel ? onderdeel.label.toLowerCase() : doen}".
            {voortgang.volgende
              ? " Er is nog wel iets anders te doen."
              : " Je profiel is compleet."}
          </p>
          <div className="tk-knoppen">
            {voortgang.volgende && (
              <Link className="tk-knop tk-knop-klein" to={voortgang.volgende.naar} style={{ textDecoration: "none" }}>
                {voortgang.volgende.knop} ({voortgang.volgende.open})
              </Link>
            )}
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={toonAlles}>
              Alle twaalf punten tonen
            </button>
          </div>
        </div>
      )}

      {CATEGORIEEN.map((categorie) => {
        const groep = openPunten.filter((k) => k.categorie === categorie.id);
        if (groep.length === 0) return null;
        return (
          <div className="tk-kaart" key={categorie.id}>
            <h2>{categorie.label}</h2>
            {groep.map((k) => (
              <KenmerkKaart
                key={k.id}
                kenmerk={k}
                huidig={perId[k.id]}
                lidmaatschappen={lidmaatschappen}
                nummer={nummerVan[k.id]}
                totaal={KENMERKEN.length}
                onKies={kiesWaarde}
                onBevestig={zetBevestiging}
                onDelen={wisselDelen}
              />
            ))}
          </div>
        );
      })}

      {(!doen || doen === "gedeeld") && actiefTeam && bruikbaar.length > 0 && (
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
              <button type="button" className="tk-knop tk-knop-klein" disabled={bezig} onClick={() => deelAlles(true)}>
                Alles delen
              </button>
            )}
            {gedeeld > 0 && (
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" disabled={bezig} onClick={() => deelAlles(false)}>
                Niets delen
              </button>
            )}
            {gedeeld > 0 && (
              <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/samenwerken" style={{ textDecoration: "none" }}>
                Advies vragen
              </Link>
            )}
          </div>
        </div>
      )}

      {!doen && (
      <div className="tk-kaart">
        <h2>Insights Discovery</h2>
        {insights ? (
          <>
            <p>{insightsSamenvatting(insights)}</p>
            <div className="tk-knoppen">
              <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={() => setModus("insights")}>
                Ander profiel inlezen
              </button>
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={async () => {
                  await wisInsights();
                  setMelding("Je Insights-profiel is gewist. De punten die je hebt ingevuld, blijven staan.");
                }}
              >
                Insights-gegevens wissen
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              Heb je ooit een Insights Discovery-profiel gemaakt? Upload het PDF-bestand, dan vullen
              we de punten hierboven alvast in. Geen profiel, of niet bij de hand? Kies dan zelf
              welke omschrijving het beste bij je past.
            </p>
            <div className="tk-knoppen" style={{ marginBottom: 14 }}>
              <button type="button" className="tk-knop tk-knop-klein" onClick={() => setModus("insights")}>
                Profiel-PDF uploaden
              </button>
            </div>
            <div className="tk-label">Wat past het beste bij jou?</div>
            <p className="tk-fijn" style={{ margin: "0 0 10px" }}>
              Insights Discovery onderscheidt vier manieren van werken. Kies degene die je het meest
              in jezelf herkent; we vullen daarmee de punten hierboven in en jij corrigeert wat niet
              klopt.
            </p>
            <div className="tk-keuzes">
              {KLEUREN.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="tk-keuze"
                  disabled={bezig}
                  onClick={async () => {
                    setBezig(true);
                    try {
                      await bewaarInsights({ voorkeurskleur: k.id, tweedeKleur: null });
                      const aantal = await neemInsightsOver({ voorkeurskleur: k.id, tweedeKleur: null, teksten: {} });
                      setMelding(`${aantal} punten ingevuld op basis van ${k.label.toLowerCase()}. Loop ze hierboven na.`);
                    } finally {
                      setBezig(false);
                    }
                  }}
                >
                  <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 4, background: k.kleur, flex: "0 0 auto", marginTop: 4 }} />
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

      <VolgendeStap />

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Wat je hier invult zijn voorkeuren in samenwerking, geen oordeel over wie je bent. Je kunt
        elk antwoord op elk moment aanpassen of intrekken.
      </p>
    </div>
  );
}
