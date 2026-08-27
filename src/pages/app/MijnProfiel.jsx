// Mijn profiel: de drie lagen bij elkaar.
//
// 1. Wat een Insights Discovery-profiel suggereert.
// 2. Wat je zelf invult of aanpast.
// 3. Wat je bevestigt — dat weegt het zwaarst.
//
// Bij elk punt staat waar het vandaan komt, en jij bepaalt per punt of je het
// met je team deelt. Delen is een bewuste handeling; intrekken kan altijd.

import { useMemo, useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import { BEVESTIGING, BRONNEN, CATEGORIEEN, KENMERKEN } from "../../data/app/kenmerken";
import { KLEUREN, insightsSamenvatting, kenmerkenUitInsights } from "../../lib/app/insights";

function bronLabel(bron) {
  const b = BRONNEN.find((x) => x.id === bron);
  return b ? b.label : "Zelf ingevuld";
}

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
  } = useApp();

  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const insights = (profiel && profiel.insights) || null;
  const [voorkeurskleur, setVoorkeurskleur] = useState(insights ? insights.voorkeurskleur : "");
  const [tweedeKleur, setTweedeKleur] = useState(insights ? insights.tweedeKleur : "");

  const sleutel = actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : null;

  const perId = useMemo(() => {
    const uit = {};
    kenmerken.forEach((k) => {
      uit[k.kenmerkId] = k;
    });
    return uit;
  }, [kenmerken]);

  const bewaarInsightsProfiel = async () => {
    setBezig(true);
    setMelding("");
    try {
      await bewaarInsights({ voorkeurskleur, tweedeKleur: tweedeKleur || null });
      const afgeleid = kenmerkenUitInsights({ voorkeurskleur, tweedeKleur });
      // Wat je zelf hebt ingevuld of bevestigd, blijft staan. Suggesties vullen
      // alleen de gaten; ze overschrijven nooit jouw eigen antwoord.
      const nieuw = afgeleid
        .filter((a) => {
          const bestaand = perId[a.kenmerkId];
          return !bestaand || (!bestaand.bevestigd && bestaand.bron === "insights_discovery");
        })
        .map((a) => ({
          ...a,
          gedeeldMet: (perId[a.kenmerkId] && perId[a.kenmerkId].gedeeldMet) || [],
        }));
      await bewaarMeerKenmerken(nieuw);
      setMelding(
        nieuw.length > 0
          ? `We hebben ${nieuw.length} suggesties klaargezet. Loop ze hieronder langs en geef aan wat klopt.`
          : "Je profiel is bewaard. Je eigen antwoorden hebben we laten staan."
      );
    } finally {
      setBezig(false);
    }
  };

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
      kenmerkId,
      waarde: bestaand.waarde,
      bron: bestaand.bron === "insights_discovery" ? "insights_discovery" : bestaand.bron,
      bevestigd,
      gedeeldMet: bevestigd === "nee" ? [] : bestaand.gedeeldMet || [],
    });
  };

  const wisselDelen = async (kenmerkId, teamSleutel) => {
    const bestaand = perId[kenmerkId];
    if (!bestaand || !bestaand.waarde) return;
    const huidig = bestaand.gedeeldMet || [];
    const nieuw = huidig.includes(teamSleutel)
      ? huidig.filter((s) => s !== teamSleutel)
      : [...huidig, teamSleutel];
    await bewaarKenmerk({ ...bestaand, gedeeldMet: nieuw });
  };

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn profiel</h1>
      <p className="tk-onderkop">
        Hier staat wat er over de samenwerking met jou bekend is. Niets hiervan is zichtbaar voor
        anderen, behalve wat je zelf per punt deelt.
      </p>

      {melding && <div className="tk-melding tk-melding-goed">{melding}</div>}

      <div className="tk-kaart">
        <h2>Insights Discovery (optioneel)</h2>
        <p>
          Heb je een Insights Discovery-profiel? Vul dan je kleurvoorkeuren in. We zetten daar een
          aantal suggesties bij die je zelf bevestigt of corrigeert. Zonder profiel werkt alles
          gewoon; je vult de punten dan zelf in.
        </p>

        <label className="tk-label">Voorkeurskleur</label>
        <div className="tk-keuzes" style={{ marginBottom: 14 }}>
          {KLEUREN.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`tk-keuze${voorkeurskleur === k.id ? " gekozen" : ""}`}
              onClick={() => setVoorkeurskleur(k.id)}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 14, height: 14, borderRadius: 4, background: k.kleur,
                  flex: "0 0 auto", marginTop: 4,
                }}
              />
              <span>
                {k.label}
                <small>{k.omschrijving}</small>
              </span>
            </button>
          ))}
        </div>

        <label className="tk-label">Kleur daarnaast (mag je overslaan)</label>
        <div className="tk-keuzes" style={{ marginBottom: 14 }}>
          {KLEUREN.filter((k) => k.id !== voorkeurskleur).map((k) => (
            <button
              key={k.id}
              type="button"
              className={`tk-keuze${tweedeKleur === k.id ? " gekozen" : ""}`}
              onClick={() => setTweedeKleur(tweedeKleur === k.id ? "" : k.id)}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 14, height: 14, borderRadius: 4, background: k.kleur,
                  flex: "0 0 auto", marginTop: 4,
                }}
              />
              <span>{k.label}</span>
            </button>
          ))}
        </div>

        {insights && insightsSamenvatting(insights) && (
          <p className="tk-fijn">{insightsSamenvatting(insights)}</p>
        )}

        <div className="tk-knoppen">
          <button
            type="button"
            className="tk-knop"
            disabled={!voorkeurskleur || bezig}
            onClick={bewaarInsightsProfiel}
          >
            {bezig ? "Bezig..." : "Bewaren en suggesties klaarzetten"}
          </button>
          {insights && (
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={async () => {
                await wisInsights();
                setVoorkeurskleur("");
                setTweedeKleur("");
                setMelding("Je Insights-profiel is gewist. De punten die je zelf hebt ingevuld, blijven staan.");
              }}
            >
              Insights-profiel wissen
            </button>
          )}
        </div>
      </div>

      {CATEGORIEEN.map((categorie) => {
        const groep = KENMERKEN.filter((k) => k.categorie === categorie.id);
        if (groep.length === 0) return null;

        return (
          <div className="tk-kaart" key={categorie.id}>
            <h2>{categorie.label}</h2>
            {groep.map((k) => {
              const huidig = perId[k.id];
              return (
                <div key={k.id} style={{ padding: "16px 0", borderTop: "1px solid var(--tk-lijn)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15.5 }}>{k.label}</strong>
                    {huidig && huidig.waarde && (
                      <span className="tk-bron">{bronLabel(huidig.bron)}</span>
                    )}
                  </div>
                  <p className="tk-fijn" style={{ margin: "6px 0 10px" }}>{k.vraag}</p>

                  <div className="tk-keuzes">
                    {k.opties.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`tk-keuze${
                          huidig && huidig.waarde === o.id && huidig.bevestigd !== "nee" ? " gekozen" : ""
                        }`}
                        onClick={() => kiesWaarde(k.id, o.id)}
                      >
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>

                  {huidig && huidig.waarde && (
                    <>
                      <div className="tk-knoppen" style={{ marginTop: 12 }}>
                        {BEVESTIGING.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            className={`tk-knop tk-knop-klein ${
                              huidig.bevestigd === b.id ? "" : "tk-knop-rand"
                            }`}
                            onClick={() => zetBevestiging(k.id, b.id)}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      {huidig.bevestigd !== "nee" && (
                        <div style={{ marginTop: 12 }}>
                          <p className="tk-fijn" style={{ margin: "0 0 8px" }}>
                            Je teamgenoten zien dan: “
                            {(k.opties.find((o) => o.id === huidig.waarde) || {}).deelbaarAls}”
                          </p>
                          {lidmaatschappen.map((l) => {
                            const s = `${l.orgId}/${l.teamId}`;
                            const aan = (huidig.gedeeldMet || []).includes(s);
                            return (
                              <label className="tk-schakelaar" key={s} style={{ marginRight: 16 }}>
                                <input
                                  type="checkbox"
                                  checked={aan}
                                  onChange={() => wisselDelen(k.id, s)}
                                />
                                Delen met {l.teamNaam || "team"}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {!sleutel && (
        <p className="tk-fijn">Je hebt nog geen team gekozen, dus delen kan nog niet.</p>
      )}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Wat je hier invult zijn voorkeuren in samenwerking, geen oordeel over wie je bent. Je kunt
        elk antwoord op elk moment aanpassen of intrekken.
      </p>
    </div>
  );
}
