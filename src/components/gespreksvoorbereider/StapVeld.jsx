import {
  EFFECT_ONDERDELEN, EFFECT_SCHAAL, INTERPRETATIE_TIPS, WAARNEMING_VOORBEELDEN,
} from "../../data/gespreksvoorbereider/stappen";
import { PRIVACY_MELDING } from "../../data/gespreksvoorbereider/teksten";
import { MAX_TEKST } from "../../lib/gespreksvoorbereider/validatie";

/**
 * Rendert één stap van de gespreksvoorbereider op basis van de definitie uit
 * data/gespreksvoorbereider/stappen.js. Alle teksten komen daarvandaan; dit
 * component bepaalt alleen de vorm.
 *
 * Ingevoerde tekst wordt altijd als tekst weergegeven: React maakt er een
 * tekstknoop van en wij zetten nergens ruwe html in de pagina. Ingevoerde html
 * of scripts kunnen daardoor niet worden uitgevoerd.
 */

function PrivacyMelding() {
  return <p className="gv-privacy-melding"><span aria-hidden="true">🔒</span>{PRIVACY_MELDING}</p>;
}

function Fout({ melding, id }) {
  if (!melding) return null;
  return <p className="gv-fout" id={id}><span aria-hidden="true">⚠</span>{melding}</p>;
}

function Tekstveld({ id, label, waarde, placeholder, fout, onWijzig, rijen = 4, toonTeller = false }) {
  const foutId = fout ? id + "-fout" : undefined;
  return (
    <div className="gv-veld" data-fout={String(Boolean(fout))}>
      {label && <label htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        rows={rijen}
        value={waarde || ""}
        placeholder={placeholder}
        maxLength={MAX_TEKST}
        aria-invalid={fout ? "true" : undefined}
        aria-describedby={foutId}
        onChange={(event) => onWijzig(event.target.value)}
      />
      {toonTeller && (waarde || "").length > MAX_TEKST - 200 && (
        <p className="gv-teller">{(waarde || "").length} van {MAX_TEKST} tekens</p>
      )}
      <Fout melding={fout} id={foutId} />
    </div>
  );
}

function Voorbeeldtabel() {
  return (
    <div className="gv-tabel-wrap">
      <table className="gv-tabel">
        <caption>Het verschil tussen een interpretatie en een concrete waarneming</caption>
        <thead>
          <tr><th scope="col">Interpretatie</th><th scope="col">Concrete waarneming</th></tr>
        </thead>
        <tbody>
          {WAARNEMING_VOORBEELDEN.map((rij) => (
            <tr key={rij.interpretatie}>
              <td>{rij.interpretatie}</td>
              <td>{rij.waarneming}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StapVeld({ stapDef, antwoorden, fouten = {}, onWijzig }) {
  if (!stapDef) return null;
  const waarde = antwoorden[stapDef.veld];

  // ── Vrije tekst ──────────────────────────────────────────────────────────
  if (stapDef.type === "tekst") {
    const check = antwoorden.waarnemingCheck;
    return (
      <>
        {stapDef.voorbeeldtabel && <Voorbeeldtabel />}
        {stapDef.voorbeeldzin && (
          <details className="gv-details">
            <summary>Voorbeeld van een goede vraag</summary>
            <div><p>{stapDef.voorbeeldzin}</p></div>
          </details>
        )}
        <PrivacyMelding />
        <Tekstveld
          id={"gv-" + stapDef.veld}
          waarde={waarde}
          placeholder={stapDef.placeholder}
          fout={fouten[stapDef.veld]}
          onWijzig={(v) => onWijzig(stapDef.veld, v)}
          rijen={5}
          toonTeller
        />
        {stapDef.interpretatiecheck && (
          <fieldset className="gv-veld">
            <legend className="gv-veldlabel">Klopt je beschrijving?</legend>
            <div className="gv-opties">
              {[
                { id: "concreet", label: "Ik heb concreet gedrag beschreven." },
                { id: "interpretatie", label: "Mijn beschrijving bevat waarschijnlijk nog een interpretatie." },
              ].map((optie) => (
                <label className="gv-optie" key={optie.id}>
                  <input
                    type="radio"
                    name="waarnemingCheck"
                    checked={check === optie.id}
                    onChange={() => onWijzig("waarnemingCheck", optie.id)}
                  />
                  <span>{optie.label}</span>
                </label>
              ))}
            </div>
            {check === "interpretatie" && (
              <div className="gv-melding" role="status">
                <h3>Zo haal je de interpretatie eruit</h3>
                <ul>{INTERPRETATIE_TIPS.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                <p style={{ marginTop: 12, marginBottom: 0 }}>Pas je tekst hierboven gerust aan. Je kunt ook verder gaan; we zetten er dan een aandachtspunt bij.</p>
              </div>
            )}
          </fieldset>
        )}
      </>
    );
  }

  // ── Eén keuze ────────────────────────────────────────────────────────────
  if (stapDef.type === "keuze") {
    const vervolg = stapDef.vervolg && stapDef.vervolg[waarde];
    return (
      <>
        <fieldset className="gv-veld" data-fout={String(Boolean(fouten[stapDef.veld]))}>
          <legend className="gv-verborgen">{stapDef.vraag}</legend>
          <div className="gv-opties">
            {stapDef.opties.map((optie) => (
              <label className="gv-optie" key={optie.id}>
                <input
                  type="radio"
                  name={stapDef.veld}
                  checked={waarde === optie.id}
                  onChange={() => onWijzig(stapDef.veld, optie.id)}
                />
                <span>{optie.label}</span>
              </label>
            ))}
          </div>
          <Fout melding={fouten[stapDef.veld]} />
        </fieldset>
        {vervolg && (
          <div className="gv-effect">
            <h3>{vervolg.titel}</h3>
            <p className="gv-uitleg">{vervolg.uitleg}</p>
            <PrivacyMelding />
            {vervolg.velden.map((veld) => (
              <Tekstveld
                key={veld.id}
                id={"gv-" + vervolg.veld + "-" + veld.id}
                label={veld.label}
                waarde={(antwoorden[vervolg.veld] || {})[veld.id]}
                placeholder={veld.placeholder}
                rijen={2}
                onWijzig={(v) => onWijzig(vervolg.veld, { ...(antwoorden[vervolg.veld] || {}), [veld.id]: v })}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  // ── Meerdere keuzes, eventueel met een eigen formulering ─────────────────
  if (stapDef.type === "meerkeuze") {
    const gekozen = Array.isArray(waarde) ? waarde : [];
    const vol = stapDef.max && gekozen.length >= stapDef.max;
    const wissel = (id) => {
      if (gekozen.includes(id)) onWijzig(stapDef.veld, gekozen.filter((g) => g !== id));
      else if (!vol) onWijzig(stapDef.veld, [...gekozen, id]);
    };
    return (
      <>
        <fieldset className="gv-veld" data-fout={String(Boolean(fouten[stapDef.veld]))}>
          <legend className="gv-verborgen">{stapDef.vraag}</legend>
          <div className="gv-opties">
            {stapDef.opties.map((optie) => (
              <label className="gv-optie" key={optie.id}>
                <input
                  type="checkbox"
                  checked={gekozen.includes(optie.id)}
                  disabled={vol && !gekozen.includes(optie.id)}
                  onChange={() => wissel(optie.id)}
                />
                <span>{optie.label}</span>
              </label>
            ))}
          </div>
          {stapDef.max && (
            <p className="gv-limiet" aria-live="polite">
              {vol
                ? "Je hebt het maximum van " + stapDef.max + " gekozen. Haal er eerst een weg om iets anders te kiezen."
                : gekozen.length + " van maximaal " + stapDef.max + " gekozen."}
            </p>
          )}
          <Fout melding={fouten[stapDef.veld]} />
        </fieldset>

        {stapDef.vermijden && (
          <details className="gv-details">
            <summary>Vragen die je beter kunt vermijden</summary>
            <div>
              <ul>{stapDef.vermijden.map((vraag) => <li key={vraag}>{vraag}</li>)}</ul>
              <p style={{ marginBottom: 0 }}>Deze vragen klinken als een vraag, maar bevatten al een oordeel. De ander gaat zich dan verdedigen in plaats van vertellen.</p>
            </div>
          </details>
        )}

        {stapDef.eigenVeld && (
          <>
            <PrivacyMelding />
            <Tekstveld
              id={"gv-" + stapDef.eigenVeld.veld}
              label={stapDef.eigenVeld.label}
              waarde={antwoorden[stapDef.eigenVeld.veld]}
              placeholder={stapDef.eigenVeld.placeholder}
              rijen={2}
              onWijzig={(v) => onWijzig(stapDef.eigenVeld.veld, v)}
            />
          </>
        )}

        {stapDef.extraVraag && (
          <div className="gv-effect">
            <h3>{stapDef.extraVraag.vraag}</h3>
            <p className="gv-uitleg">{stapDef.extraVraag.uitleg}</p>
            <PrivacyMelding />
            <Tekstveld
              id={"gv-" + stapDef.extraVraag.veld}
              waarde={antwoorden[stapDef.extraVraag.veld]}
              placeholder={stapDef.extraVraag.placeholder}
              fout={fouten[stapDef.extraVraag.veld]}
              rijen={3}
              onWijzig={(v) => onWijzig(stapDef.extraVraag.veld, v)}
            />
          </div>
        )}
      </>
    );
  }

  // ── Effect op mij, het team en het werk ──────────────────────────────────
  if (stapDef.type === "effect") {
    const effect = waarde || {};
    const zet = (onderdeelId, deelWaarde) => onWijzig(stapDef.veld, {
      ...effect,
      [onderdeelId]: { ...(effect[onderdeelId] || {}), ...deelWaarde },
    });
    return (
      <>
        <ul className="gv-chips" aria-label="Voorbeelden van effecten">
          {stapDef.voorbeelden.map((voorbeeld) => <li key={voorbeeld}><span>{voorbeeld}</span></li>)}
        </ul>
        <PrivacyMelding />
        {EFFECT_ONDERDELEN.map((onderdeel) => {
          const deel = effect[onderdeel.id] || {};
          return (
            <fieldset className="gv-effect" key={onderdeel.id}>
              <legend><h3 style={{ margin: 0 }}>{onderdeel.vraag}</h3></legend>
              <div className="gv-schaal">
                {EFFECT_SCHAAL.map((schaal) => (
                  <label key={schaal.id}>
                    <input
                      type="radio"
                      name={"effect-" + onderdeel.id}
                      checked={deel.schaal === schaal.id}
                      onChange={() => zet(onderdeel.id, { schaal: schaal.id })}
                    />
                    {schaal.label}
                  </label>
                ))}
              </div>
              {deel.schaal && deel.schaal !== "nvt" && (
                <Tekstveld
                  id={"gv-effect-" + onderdeel.id}
                  label="Beschrijf in eigen woorden wat er gebeurt"
                  waarde={deel.tekst}
                  placeholder="Bijvoorbeeld: de planning schuift op en collega's moeten opnieuw afstemmen."
                  rijen={3}
                  onWijzig={(v) => zet(onderdeel.id, { tekst: v })}
                />
              )}
            </fieldset>
          );
        })}
        <Fout melding={fouten[stapDef.veld]} />
      </>
    );
  }

  // ── Meerdere korte velden ────────────────────────────────────────────────
  if (stapDef.type === "velden") {
    const huidig = waarde || {};
    return (
      <>
        <PrivacyMelding />
        {stapDef.velden.map((veld) => (
          <Tekstveld
            key={veld.id}
            id={"gv-" + stapDef.veld + "-" + veld.id}
            label={veld.label}
            waarde={huidig[veld.id]}
            placeholder={veld.placeholder}
            fout={fouten[stapDef.veld + "." + veld.id]}
            rijen={veld.verplicht ? 3 : 2}
            onWijzig={(v) => onWijzig(stapDef.veld, { ...huidig, [veld.id]: v })}
          />
        ))}
        {stapDef.extraKeuze && (
          <fieldset className="gv-veld" data-fout={String(Boolean(fouten[stapDef.extraKeuze.veld]))}>
            <legend className="gv-veldlabel">{stapDef.extraKeuze.vraag}</legend>
            <div className="gv-opties">
              {stapDef.extraKeuze.opties.map((optie) => (
                <label className="gv-optie" key={optie.id}>
                  <input
                    type="radio"
                    name={stapDef.extraKeuze.veld}
                    checked={antwoorden[stapDef.extraKeuze.veld] === optie.id}
                    onChange={() => onWijzig(stapDef.extraKeuze.veld, optie.id)}
                  />
                  <span>{optie.label}</span>
                </label>
              ))}
            </div>
            <Fout melding={fouten[stapDef.extraKeuze.veld]} />
          </fieldset>
        )}
      </>
    );
  }

  // ── Controlelijst ────────────────────────────────────────────────────────
  if (stapDef.type === "checklist") {
    const aangevinkt = Array.isArray(waarde) ? waarde : [];
    const wissel = (id) => onWijzig(
      stapDef.veld,
      aangevinkt.includes(id) ? aangevinkt.filter((a) => a !== id) : [...aangevinkt, id]
    );
    return (
      <fieldset className="gv-veld">
        <legend className="gv-verborgen">{stapDef.vraag}</legend>
        <div className="gv-opties" style={{ gridTemplateColumns: "1fr" }}>
          {stapDef.opties.map((optie) => (
            <label className="gv-optie" key={optie.id}>
              <input type="checkbox" checked={aangevinkt.includes(optie.id)} onChange={() => wissel(optie.id)} />
              <span>{optie.label}</span>
            </label>
          ))}
        </div>
        <p className="gv-limiet" aria-live="polite">{aangevinkt.length} van {stapDef.opties.length} afgevinkt.</p>
      </fieldset>
    );
  }

  return null;
}
