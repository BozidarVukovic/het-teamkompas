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
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { BEVESTIGING, BRONNEN, CATEGORIEEN, KENMERKEN } from "../../data/app/kenmerken";
import { KLEUREN, insightsSamenvatting, kleur } from "../../lib/app/insights";
import InsightsUpload from "../../components/app/InsightsUpload";

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
          <strong style={{ fontSize: 17 }}>Met mijn Insights Discovery-profiel</strong>
          <small style={{ fontSize: 14, marginTop: 6 }}>
            Upload de PDF. We lezen je kleurenergieën uit en vullen alle twaalf punten vast in. Daarna
            loop je ze na en pas je aan wat niet klopt. Ongeveer een minuut.
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

function KenmerkKaart({ kenmerk, huidig, lidmaatschappen, onKies, onBevestig, onDelen }) {
  const gekozenOptie = huidig && huidig.waarde ? kenmerk.opties.find((o) => o.id === huidig.waarde) : null;
  const [open, setOpen] = useState(!gekozenOptie);

  return (
    <div style={{ padding: "16px 0", borderTop: "1px solid var(--tk-lijn)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
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
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);

  const perId = useMemo(() => {
    const uit = {};
    kenmerken.forEach((k) => {
      uit[k.kenmerkId] = k;
    });
    return uit;
  }, [kenmerken]);

  const bruikbaar = kenmerken.filter((k) => k.waarde && k.bevestigd !== "nee");
  const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;
  const gedeeld = sleutel ? bruikbaar.filter((k) => (k.gedeeldMet || []).includes(sleutel)).length : 0;
  const insights = (profiel && profiel.insights) || null;

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
          Kies de PDF van je Insights Discovery-profiel. We lezen je kleurenergieën eruit en vullen
          daarmee alle twaalf punten in.
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
        {bruikbaar.length} van {KENMERKEN.length} punten ingevuld. Niets hiervan is zichtbaar voor
        anderen, behalve wat je zelf deelt.
      </p>

      {melding && <div className="tk-melding tk-melding-goed">{melding}</div>}

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

      {actiefTeam && bruikbaar.length > 0 && (
        <div className="tk-kaart">
          <h2>Delen met {actiefTeam.teamNaam || "je team"}</h2>
          <p>
            Je teamgenoten zien alleen wat je deelt, en altijd als leesbare zin — nooit als score of
            etiket. Intrekken kan op elk moment.
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
            <Link className="tk-knop tk-knop-rand tk-knop-klein" to="/app/samenwerken" style={{ textDecoration: "none" }}>
              Advies vragen
            </Link>
          </div>
        </div>
      )}

      {CATEGORIEEN.map((categorie) => {
        const groep = KENMERKEN.filter((k) => k.categorie === categorie.id);
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
                onKies={kiesWaarde}
                onBevestig={zetBevestiging}
                onDelen={wisselDelen}
              />
            ))}
          </div>
        );
      })}

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
              Heb je een Insights Discovery-profiel? Upload de PDF, dan vullen we de punten hierboven
              vast in. Je kunt de kleuren ook zonder PDF zelf kiezen.
            </p>
            <div className="tk-knoppen" style={{ marginBottom: 14 }}>
              <button type="button" className="tk-knop tk-knop-klein" onClick={() => setModus("insights")}>
                Profiel-PDF uploaden
              </button>
            </div>
            <div className="tk-label">Of kies je kleuren zelf</div>
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

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Wat je hier invult zijn voorkeuren in samenwerking, geen oordeel over wie je bent. Je kunt
        elk antwoord op elk moment aanpassen of intrekken.
      </p>
    </div>
  );
}
