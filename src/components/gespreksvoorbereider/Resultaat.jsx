import { PRIVACY_UITLEG } from "../../data/gespreksvoorbereider/teksten";

/**
 * Het samengestelde gespreksformat.
 *
 * De zinnen komen uit format.js: vaste tekstblokken gecombineerd met de eigen
 * woorden van de gebruiker. Er wordt niets herschreven en er gaat niets naar
 * een externe dienst.
 */
export default function Resultaat({ format, situatie, onAanpassen, onOpnieuw, onWissen, onAfdrukken, onReflectie }) {
  if (!format) return null;
  const accent = situatie ? situatie.kleur : "var(--tk-color-teal)";

  return (
    <div className="gv-resultaat" style={{ "--gv-accent": accent }}>
      <div className="gv-resultaat-kop">
        {situatie && <span className="gv-label"><span aria-hidden="true">{situatie.icoon}</span>{situatie.label}</span>}
      </div>
      <h2>Jouw voorbereiding</h2>
      <p className="gv-uitleg">{format.intro}</p>

      {format.waarschuwingen.length > 0 && (
        <div className="gv-melding gv-geenprint" role="status">
          <h3>Even nalopen</h3>
          <ul>{format.waarschuwingen.map((melding) => <li key={melding}>{melding}</li>)}</ul>
        </div>
      )}

      {format.secties.map((sectie) => (
        <section className="gv-sectie-blok" key={sectie.id}>
          <h3>{sectie.kop}</h3>
          {sectie.zinnen.map((regel) => <p key={regel}>{regel}</p>)}
        </section>
      ))}

      {format.samenvatting.doelen.length > 0 && (
        <div className="gv-blok">
          <h3>Wat je wilt bereiken</h3>
          <ul className="gv-lijst">
            {format.samenvatting.doelen.map((doel) => <li key={doel}>{doel}</li>)}
          </ul>
        </div>
      )}

      {format.aandachtspunten.length > 0 && (
        <div className="gv-blok">
          <h3>Persoonlijke aandachtspunten</h3>
          <ul className="gv-lijst">
            {format.aandachtspunten.map((punt) => <li key={punt}>{punt}</li>)}
          </ul>
        </div>
      )}

      <div className="gv-blok">
        <h3>Tijdens het gesprek</h3>
        <ol className="gv-tips">
          {format.tips.map((tip) => <li key={tip}>{tip}</li>)}
        </ol>
      </div>

      <div className="gv-acties gv-geenprint">
        <button type="button" className="gv-knop gv-knop--primair" onClick={onAfdrukken}>
          <span aria-hidden="true">🖨</span>Afdrukken of bewaren als pdf
        </button>
        <button type="button" className="gv-knop gv-knop--secundair" onClick={onAanpassen}>Voorbereiding aanpassen</button>
        <span className="gv-spacer" />
        <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={onReflectie}>Na het gesprek terugkijken</button>
      </div>

      <div className="gv-opslag gv-geenprint">
        <h3>Wat er met je antwoorden gebeurt</h3>
        <p>{PRIVACY_UITLEG}</p>
        <div className="gv-opslag-acties">
          <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={onOpnieuw}>Opnieuw beginnen</button>
          <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={onWissen}>Alles op dit apparaat wissen</button>
        </div>
      </div>
    </div>
  );
}
