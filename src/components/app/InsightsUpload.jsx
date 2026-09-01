// Een Insights Discovery-profiel inlezen uit een PDF.
//
// Het bestand wordt in de browser gelezen en daarna weggegooid. Er gaat niets
// naar een server en er wordt niets opgeslagen totdat iemand op de knop drukt.
// Wat we eruit halen tonen we eerst, inclusief wat we níet konden vinden.

import { useRef, useState } from "react";
import { KLEUREN, kleur } from "../../lib/app/insights";
import { leesInsightsPdf } from "../../lib/app/insightsPdf";
import { sectie } from "../../data/app/handleiding";
import { omschrijfFout } from "../../lib/app/meldingen";

const ZEKERHEID = {
  hoog: {
    label: "Gelukt",
    tekst: "We hebben je profiel kunnen lezen. Hieronder staat wat eruit komt.",
    soort: "tk-melding-goed",
  },
  matig: {
    label: "Deels gelukt",
    tekst:
      "De precieze verdeling was niet te lezen, maar het type dat je profiel noemt wel. Dat geeft een ruwere inschatting — kijk er extra goed naar.",
    soort: "",
  },
  geen: {
    label: "Niet gelukt",
    tekst:
      "Uit dit bestand konden we niets bruikbaars halen. Kies hieronder zelf wat het beste bij je past; dat werkt net zo goed.",
    soort: "tk-melding-fout",
  },
};

/** Nederlandse notatie: 5,60 en niet 5.6. Percentages blijven heel. */
function getal(waarde, eenheid) {
  if (eenheid === "procent") return `${Math.round(waarde)}%`;
  return waarde.toFixed(2).replace(".", ",");
}

function Staaf({ kleurId, waarde, maximum, eenheid }) {
  const k = kleur(kleurId);
  if (!k) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ width: 96, fontSize: 13.5, flex: "0 0 auto" }}>{k.label}</span>
      <span style={{ flex: 1, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.07)" }}>
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: "100%",
            borderRadius: 5,
            background: k.kleur,
            width: `${Math.max(3, Math.round((waarde / maximum) * 100))}%`,
          }}
        />
      </span>
      <span className="tk-fijn" style={{ width: 52, textAlign: "right", flex: "0 0 auto" }}>
        {getal(waarde, eenheid)}
      </span>
    </div>
  );
}

export default function InsightsUpload({
  onBevestig,
  knopLabel = "Overnemen",
  voorWie = null,
}) {
  const invoer = useRef(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [uitkomst, setUitkomst] = useState(null);
  const [bestandsnaam, setBestandsnaam] = useState("");
  const [voorkeurskleur, setVoorkeurskleur] = useState("");
  const [tweedeKleur, setTweedeKleur] = useState("");
  const [nemenTeksten, setNemenTeksten] = useState(true);
  const [aanpassen, setAanpassen] = useState(false);
  const [toonDiagnose, setToonDiagnose] = useState(false);
  const [opslaan, setOpslaan] = useState(false);

  const verwerk = async (bestand) => {
    setFout("");
    setUitkomst(null);
    setAanpassen(false);
    setBezig(true);
    try {
      const gelezen = await leesInsightsPdf(bestand);
      setUitkomst(gelezen);
      setBestandsnaam(bestand.name || "profiel.pdf");
      setVoorkeurskleur(gelezen.voorkeurskleur || "");
      setTweedeKleur(gelezen.tweedeKleur || "");
      if (gelezen.zekerheid === "geen") setAanpassen(true);
    } catch (err) {
      setFout(err.message || "Het lezen van dit bestand lukte niet.");
    } finally {
      setBezig(false);
      if (invoer.current) invoer.current.value = "";
    }
  };

  const bevestig = async () => {
    if (!voorkeurskleur) return;
    setOpslaan(true);
    setFout("");
    try {
      await onBevestig({
        voorkeurskleur,
        tweedeKleur: tweedeKleur || null,
        wiel: uitkomst ? uitkomst.wiel : null,
        teksten: nemenTeksten && uitkomst ? uitkomst.teksten : {},
      });
      setUitkomst(null);
      setBestandsnaam("");
    } catch (err) {
      // Mislukt het opslaan, dan bleef het gelezen profiel gewoon staan en
      // gebeurde er verder niets. Je zag alleen een knop die weer aanging.
      // De uitkomst blijft nu staan, zodat je het opnieuw kunt proberen zonder
      // de PDF nog een keer te hoeven kiezen.
      setFout(omschrijfFout(err, "dit profiel opslaan"));
    } finally {
      setOpslaan(false);
    }
  };

  const stand = uitkomst ? ZEKERHEID[uitkomst.zekerheid] : null;
  const tekstsecties = uitkomst ? Object.keys(uitkomst.teksten) : [];
  const aantalPunten = uitkomst
    ? Object.values(uitkomst.teksten).reduce((som, lijst) => som + lijst.length, 0)
    : 0;
  const maximum = uitkomst && uitkomst.energieen ? Math.max(...Object.values(uitkomst.energieen)) : 1;

  return (
    <div>
      <input
        ref={invoer}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && verwerk(e.target.files[0])}
      />

      {!uitkomst && (
        <div className="tk-knoppen">
          <button
            type="button"
            className="tk-knop"
            onClick={() => invoer.current && invoer.current.click()}
            disabled={bezig}
          >
            {bezig ? "Bezig met lezen..." : "Kies je profiel-PDF"}
          </button>
          {bestandsnaam && !bezig && <span className="tk-fijn">{bestandsnaam}</span>}
        </div>
      )}

      {fout && (
        <div className="tk-melding tk-melding-fout" style={{ marginTop: 14 }}>
          {fout}
        </div>
      )}

      {uitkomst && (
        <div>
          <div className={`tk-melding ${stand.soort}`}>
            <strong>{stand.label}.</strong> {stand.tekst}
          </div>

          {uitkomst.wiel && (
            <p style={{ margin: "0 0 16px", lineHeight: 1.6 }}>
              Je profiel noemt je een <strong>{uitkomst.wiel.typenaam}</strong>
              {uitkomst.wiel.stijl ? ` (${uitkomst.wiel.stijl})` : ""}, plek{" "}
              {uitkomst.wiel.positie} op het Insights-wiel.
            </p>
          )}

          {uitkomst.energieen && (
            <div style={{ marginBottom: 16 }}>
              <div className="tk-label" style={{ marginBottom: 4 }}>Wat past het meest bij je</div>
              <p className="tk-fijn" style={{ margin: "0 0 12px" }}>
                Insights Discovery werkt met vier kleuren, elk met een eigen manier van werken. Hoe
                langer de balk, hoe sterker die manier in jouw profiel naar voren komt.
              </p>
              {["rood", "geel", "groen", "blauw"]
                .filter((id) => uitkomst.energieen[id] !== undefined)
                .sort((a, b) => uitkomst.energieen[b] - uitkomst.energieen[a])
                .map((id) => (
                  <Staaf
                    key={id}
                    kleurId={id}
                    waarde={uitkomst.energieen[id]}
                    maximum={maximum}
                    eenheid={uitkomst.eenheid}
                  />
                ))}
            </div>
          )}

          {voorkeurskleur && !aanpassen && (
            <p style={{ lineHeight: 1.7, marginTop: 0 }}>
              We gaan uit van <strong>{kleur(voorkeurskleur).label.toLowerCase()}</strong>
              {tweedeKleur ? ` met ${kleur(tweedeKleur).label.toLowerCase()} daarnaast` : ""}.{" "}
              <button
                type="button"
                onClick={() => setAanpassen(true)}
                style={{ background: "none", border: 0, color: "var(--tk-teal)", cursor: "pointer", padding: 0, font: "inherit" }}
              >
                Aanpassen
              </button>
            </p>
          )}

          {aanpassen && (
            <>
              <div className="tk-label">Voorkeurskleur</div>
              <div className="tk-keuzes" style={{ marginBottom: 14 }}>
                {KLEUREN.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`tk-keuze${voorkeurskleur === k.id ? " gekozen" : ""}`}
                    onClick={() => setVoorkeurskleur(k.id)}
                  >
                    <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 4, background: k.kleur, flex: "0 0 auto", marginTop: 4 }} />
                    <span>
                      {k.label}
                      <small>{k.omschrijving}</small>
                    </span>
                  </button>
                ))}
              </div>

              <div className="tk-label">Kleur daarnaast (mag leeg blijven)</div>
              <div className="tk-keuzes" style={{ marginBottom: 14 }}>
                {KLEUREN.filter((k) => k.id !== voorkeurskleur).map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`tk-keuze${tweedeKleur === k.id ? " gekozen" : ""}`}
                    onClick={() => setTweedeKleur(tweedeKleur === k.id ? "" : k.id)}
                  >
                    <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 4, background: k.kleur, flex: "0 0 auto", marginTop: 4 }} />
                    <span>{k.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {tekstsecties.length > 0 && (
            <div style={{ borderTop: "1px solid var(--tk-lijn)", paddingTop: 14, marginTop: 4 }}>
              <label className="tk-schakelaar" style={{ marginBottom: 8 }}>
                <input type="checkbox" checked={nemenTeksten} onChange={() => setNemenTeksten(!nemenTeksten)} />
                Bewaar ook {aantalPunten} punten uit je profieltekst
              </label>
              <p className="tk-fijn" style={{ margin: "0 0 8px" }}>
                Die komen terug bij {voorWie ? "de handleiding" : "Mijn handleiding"} als naslag bij{" "}
                {tekstsecties.map((s) => (sectie(s) || {}).titel || s).join(", ").toLowerCase()}. Ze
                staan er in de derde persoon, zoals in het profiel; je kunt er zelf uit overnemen wat
                je wilt. Ze blijven privé en worden nooit vanzelf gedeeld.
              </p>
            </div>
          )}

          {uitkomst.gemist.length > 0 && (
            <p className="tk-fijn">
              Niet gevonden: {uitkomst.gemist.join(", ")}.{" "}
              <button
                type="button"
                onClick={() => setToonDiagnose(!toonDiagnose)}
                style={{ background: "none", border: 0, color: "var(--tk-teal)", cursor: "pointer", padding: 0, font: "inherit" }}
              >
                {toonDiagnose ? "Verberg details" : "Waarom niet?"}
              </button>
            </p>
          )}

          {toonDiagnose && (
            <div className="tk-melding" style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>
              {uitkomst.diagnose.length > 0 ? (
                <>
                  <p className="tk-fijn" style={{ marginTop: 0 }}>
                    Dit zijn de regels uit de PDF waarin een kleurnaam of wielpositie voorkomt. Stuur
                    ze door als je vindt dat er wél iets in staat; dan breiden we het patroon uit.
                  </p>
                  {uitkomst.diagnose.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </>
              ) : (
                <span>In deze PDF komt geen enkele kleurnaam voor. Waarschijnlijk is dit geen Insights-profiel.</span>
              )}
            </div>
          )}

          <div className="tk-knoppen" style={{ marginTop: 18 }}>
            <button type="button" className="tk-knop" disabled={!voorkeurskleur || opslaan} onClick={bevestig}>
              {opslaan ? "Bezig..." : knopLabel}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => {
                setUitkomst(null);
                setBestandsnaam("");
              }}
            >
              Ander bestand
            </button>
          </div>

          {voorWie && voorkeurskleur && (
            <p className="tk-fijn" style={{ marginTop: 10 }}>
              {voorWie} krijgt dit als voorstel te zien en bepaalt zelf of het klopt. Er komt niets in
              het profiel van {voorWie} zonder die bevestiging.
            </p>
          )}
        </div>
      )}

      <p className="tk-fijn" style={{ marginTop: 14, marginBottom: 0 }}>
        De PDF wordt op dit apparaat gelezen en daarna weggegooid. Het bestand wordt nergens
        opgeslagen en verlaat je computer niet.
      </p>
    </div>
  );
}
