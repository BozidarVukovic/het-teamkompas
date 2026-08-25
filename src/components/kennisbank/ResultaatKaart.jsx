import { Link } from "react-router-dom";
import { DOMEINEN, contenttype, tagLabel, tijdLabel } from "../../data/kennisbank/taxonomie";
import { trackEvent } from "../../lib/analytics";

const VORM_LABEL = { individueel: "Individueel", samen: "Met het team", beide: "Alleen of samen" };

function accentKleur(item) {
  const domein = DOMEINEN.find((d) => d.id === item.domeinen[0]);
  return domein ? domein.kleur : "var(--tk-color-teal)";
}

async function deel(item) {
  const url = window.location.origin + item.href;
  trackEvent("kennisbank_resultaat_gedeeld", { soort: item.type });
  const gegevens = { title: item.titel, text: item.samenvatting, url };
  try {
    if (navigator.share) {
      await navigator.share(gegevens);
      return "gedeeld";
    }
    await navigator.clipboard.writeText(url);
    return "gekopieerd";
  } catch {
    return "mislukt";
  }
}

/**
 * Eén resultaat in de kennisbank. Toont het contenttype, de titel, de reden
 * van aanbeveling, de tijdsindicatie en of het item individueel of samen is
 * bedoeld. De reden beschrijft alleen wat de bezoeker heeft aangeklikt.
 */
export default function ResultaatKaart({ resultaat, favoriet = false, onFavoriet, onTag, toonReden = true, deelMelding, onDeelMelding }) {
  const item = resultaat.item ? resultaat.item : resultaat;
  const reden = resultaat.reden;
  const soort = contenttype(item.type);
  const extern = !item.intern;

  const open = () => trackEvent("kennisbank_resultaat_geopend", { soort: item.type, id: item.id });

  return (
    <article className="kb-kaart" style={{ "--kb-accent": accentKleur(item) }} aria-labelledby={"kb-titel-" + item.id}>
      <div className="kb-kaart-kop">
        <span className="kb-type"><span aria-hidden="true">{soort.icoon}</span>{soort.label}</span>
      </div>
      <h3 id={"kb-titel-" + item.id}>
        {extern
          ? <a href={item.href} onClick={open}>{item.titel}</a>
          : <Link to={item.href} onClick={open}>{item.titel}</Link>}
      </h3>
      <p className="kb-kaart-samenvatting">{item.samenvatting}</p>

      <div className="kb-meta">
        <span><span aria-hidden="true">⏱</span>{tijdLabel(item.tijdMinuten)}</span>
        <span><span aria-hidden="true">👥</span>{VORM_LABEL[item.vorm] || VORM_LABEL.beide}</span>
      </div>

      {toonReden && reden && (
        <p className="kb-reden"><strong>Waarom dit past</strong>{reden}</p>
      )}

      {item.tags.length > 0 && (
        <ul className="kb-tags" aria-label="Onderwerpen">
          {item.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              {onTag
                ? <button type="button" onClick={() => onTag(tag)}>{tagLabel(tag)}</button>
                : <span>{tagLabel(tag)}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="kb-kaart-acties">
        {extern
          ? <a className="kb-knop kb-knop--secundair kb-knop--klein" href={item.href} onClick={open}>Bekijken</a>
          : <Link className="kb-knop kb-knop--secundair kb-knop--klein" to={item.href} onClick={open}>Bekijken</Link>}
        {onFavoriet && (
          <button
            type="button"
            className="kb-icoonknop"
            aria-pressed={favoriet}
            onClick={() => onFavoriet(item.id)}
          >
            <span aria-hidden="true">{favoriet ? "★" : "☆"}</span>
            {favoriet ? "Bewaard" : "Bewaar"}
          </button>
        )}
        <button
          type="button"
          className="kb-icoonknop"
          onClick={async () => {
            const uitkomst = await deel(item);
            if (onDeelMelding) onDeelMelding(item.id, uitkomst);
          }}
        >
          <span aria-hidden="true">↗</span>Delen
        </button>
      </div>
      <p className="kb-visueel-verborgen" aria-live="polite">
        {deelMelding === "gekopieerd" ? "Link gekopieerd naar het klembord." : deelMelding === "mislukt" ? "Delen is niet gelukt." : ""}
      </p>
    </article>
  );
}
