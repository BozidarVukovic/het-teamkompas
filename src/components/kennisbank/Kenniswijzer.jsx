import { useEffect, useRef } from "react";
import {
  DOELEN, MAX_DOELEN, MAX_SITUATIES, ROLLEN, SITUATIES, TIJDEN, WERKWIJZEN,
} from "../../data/kennisbank/taxonomie";

/**
 * De vijf stappen van de kenniswijzer.
 *
 * De volgorde en de vraagstelling staan hier, de antwoordopties komen uit de
 * taxonomie. Een optie toevoegen doe je dus in taxonomie.js en niet hier.
 */
export const STAPPEN = [
  {
    veld: "situaties", meervoud: true, max: MAX_SITUATIES,
    vraag: "Wat speelt er momenteel in jouw team?",
    uitleg: "Kies maximaal drie situaties die je herkent. Herken je niets precies, kies dan de laatste optie.",
    opties: SITUATIES.map((s) => ({ id: s.id, label: s.label })),
  },
  {
    veld: "rol", meervoud: false,
    vraag: "Vanuit welke rol zoek je ondersteuning?",
    uitleg: "We gebruiken je rol om te bepalen wat als eerste wordt getoond. Content voor andere rollen blijft gewoon zichtbaar.",
    opties: ROLLEN.map((r) => ({ id: r.id, label: r.label })),
  },
  {
    veld: "doelen", meervoud: true, max: MAX_DOELEN,
    vraag: "Wat wil je als eerste bereiken?",
    uitleg: "Kies maximaal twee doelen.",
    opties: DOELEN.map((d) => ({ id: d.id, label: d.label })),
  },
  {
    veld: "tijd", meervoud: false,
    vraag: "Hoeveel tijd heb je beschikbaar?",
    uitleg: "We tonen niets dat langer duurt dan de tijd die je kiest.",
    opties: TIJDEN.map((t) => ({ id: t.id, label: t.label })),
  },
  {
    veld: "werkwijzen", meervoud: true,
    vraag: "Hoe wil je met het onderwerp aan de slag?",
    uitleg: "Meerdere antwoorden mogen. Kies je niets, dan tonen we een evenwichtige mix.",
    opties: WERKWIJZEN.map((w) => ({ id: w.id, label: w.label, uitleg: w.uitleg })),
  },
];

function Optie({ stap, optie, keuze, onWissel }) {
  const huidig = keuze[stap.veld];
  const gekozen = stap.meervoud ? huidig.includes(optie.id) : huidig === optie.id;
  const vol = stap.meervoud && stap.max && huidig.length >= stap.max && !gekozen;
  return (
    <label className="kb-keuze">
      <input
        type={stap.meervoud ? "checkbox" : "radio"}
        name={"kenniswijzer-" + stap.veld}
        value={optie.id}
        checked={gekozen}
        disabled={vol}
        onChange={() => onWissel(stap, optie.id)}
      />
      <span>
        <span className="kb-keuze-tekst">{optie.label}<span className="kb-keuze-vink" aria-hidden="true">✓</span></span>
        {optie.uitleg && <span className="kb-keuze-uitleg">{optie.uitleg}</span>}
      </span>
    </label>
  );
}

/**
 * De kenniswijzer zelf. Alle keuzes staan in de URL, dus terug navigeren wist
 * nooit iets wat de bezoeker al had ingevuld.
 */
export default function Kenniswijzer({ stap, keuze, onWissel, onStap, onKlaar, onStoppen }) {
  const huidig = STAPPEN[stap - 1];
  const kop = useRef(null);
  const eersteRender = useRef(true);

  useEffect(() => {
    // Bij het wisselen van stap gaat de focus naar de vraag, zodat een
    // schermlezer de nieuwe vraag voorleest. Bij de eerste render laten we de
    // focus met rust om te voorkomen dat de pagina meteen wegspringt.
    if (eersteRender.current) {
      eersteRender.current = false;
      return;
    }
    kop.current?.focus();
  }, [stap]);

  if (!huidig) return null;
  const gekozen = keuze[huidig.veld];
  const aantal = huidig.meervoud ? gekozen.length : (gekozen ? 1 : 0);
  const vol = huidig.meervoud && huidig.max && gekozen.length >= huidig.max;
  const laatste = stap === STAPPEN.length;

  return (
    <div className="kb-wijzer">
      <div className="kb-voortgang">
        <p>Stap {stap} van {STAPPEN.length}</p>
        <div className="kb-voortgang-balk" role="progressbar" aria-valuenow={stap} aria-valuemin={1} aria-valuemax={STAPPEN.length} aria-label={"Stap " + stap + " van " + STAPPEN.length}>
          <i style={{ width: Math.round((stap / STAPPEN.length) * 100) + "%" }} />
        </div>
      </div>

      <fieldset>
        <legend tabIndex={-1} ref={kop}>{huidig.vraag}</legend>
        <p className="kb-wijzer-uitleg">{huidig.uitleg}</p>
        <div className="kb-keuzes">
          {huidig.opties.map((optie) => (
            <Optie key={optie.id} stap={huidig} optie={optie} keuze={keuze} onWissel={onWissel} />
          ))}
        </div>
        {huidig.meervoud && huidig.max && (
          <p className="kb-limiet" data-vol={String(Boolean(vol))} aria-live="polite">
            {vol
              ? "Je hebt het maximum van " + huidig.max + " gekozen. Haal er eerst een weg om iets anders te kiezen."
              : aantal + " van maximaal " + huidig.max + " gekozen."}
          </p>
        )}
      </fieldset>

      <div className="kb-wijzer-acties">
        {stap > 1
          ? <button type="button" className="kb-knop kb-knop--secundair" onClick={() => onStap(stap - 1)}>← Vorige vraag</button>
          : <button type="button" className="kb-knop kb-knop--secundair" onClick={onStoppen}>← Terug naar de kennisbank</button>}
        <span className="kb-spacer" />
        {!laatste && <button type="button" className="kb-knop kb-knop--stil kb-knop--klein" onClick={onKlaar}>Sla over en toon resultaten</button>}
        {laatste
          ? <button type="button" className="kb-knop kb-knop--primair" onClick={onKlaar}>Toon wat kan helpen</button>
          : <button type="button" className="kb-knop kb-knop--primair" onClick={() => onStap(stap + 1)}>Volgende vraag →</button>}
      </div>
    </div>
  );
}
