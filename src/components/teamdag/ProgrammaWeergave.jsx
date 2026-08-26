// De resultaatweergave: uitgangssituatie, advies, voorbereiding, programma,
// aandachtspunten en borging.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { duurLabel } from "../../lib/teamdag/tijd.js";
import { alternatievenVoor } from "../../lib/teamdag/selectie.js";
import { CONVERSIE, PRIVACYTEKST } from "../../data/teamdag/teksten.js";

function BlokKaart({ onderdeel, antwoorden, ruimte, gebruikteIds, aanpasbaar, onVervang, onDuur, onVerwijder }) {
  const [alternatievenOpen, setAlternatievenOpen] = useState(false);
  const b = onderdeel.blok;
  const alternatieven = alternatievenOpen ? alternatievenVoor(b.id, antwoorden, ruimte, gebruikteIds) : [];
  const korter = onderdeel.duur - 5 >= (b.minDuur || 5);
  const langer = onderdeel.duur + 5 <= (b.maxDuur || onderdeel.duur);

  return (
    <article className={`td-blok${onderdeel.pauze ? " td-blok--pauze" : ""}`}>
      <div className="td-blok-kop">
        <span className="td-blok-tijd">
          {onderdeel.start}–{onderdeel.eind}
        </span>
        <span className="td-blok-titel">{b.titel}</span>
        <span className="td-blok-duur">{onderdeel.duur} min</span>
      </div>
      <p className="td-blok-doel">{b.doel}</p>

      {!onderdeel.pauze ? (
        <details className="td-blok-details">
          <summary>Werkwijze, materialen en begeleiding</summary>
          <div className="td-blok-inhoud">
            <h4>Werkwijze</h4>
            <ol className="td-lijst">
              {(b.stappen || []).map((s) => (
                <li key={s.titel} className="td-blok-stap">
                  <strong>{s.titel}</strong>
                  {s.tekst}
                </li>
              ))}
            </ol>

            {b.materialen && b.materialen.length ? (
              <>
                <h4>Materialen</h4>
                <ul className="td-lijst">
                  {b.materialen.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <h4>Rol van de begeleider</h4>
            <p>{b.begeleider}</p>

            <h4>Let op</h4>
            <p>{b.valkuilen}</p>

            <h4>Verwachte opbrengst</h4>
            <p>{b.opbrengst}</p>

            {b.kennisbank ? (
              <p>
                <Link to={b.kennisbank}>Verdieping bij dit onderdeel</Link>
              </p>
            ) : null}
            {b.download && b.download !== b.kennisbank ? (
              <p>
                <Link to={b.download}>Download het bijbehorende canvas</Link>
              </p>
            ) : null}
          </div>
        </details>
      ) : null}

      {aanpasbaar ? (
        <div className="td-blok-acties">
          <button type="button" className={`td-mini${korter ? "" : " td-mini--uit"}`} disabled={!korter} onClick={() => onDuur(b.id, -5)}>
            5 minuten korter
          </button>
          <button type="button" className={`td-mini${langer ? "" : " td-mini--uit"}`} disabled={!langer} onClick={() => onDuur(b.id, 5)}>
            5 minuten langer
          </button>
          {!onderdeel.vast ? (
            <>
              <button type="button" className="td-mini" onClick={() => setAlternatievenOpen((v) => !v)}>
                {alternatievenOpen ? "Verberg alternatieven" : "Vervang dit onderdeel"}
              </button>
              <button type="button" className="td-mini" onClick={() => onVerwijder(b.id)}>
                Verwijder
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {alternatievenOpen ? (
        <div className="td-alternatieven">
          {alternatieven.length ? (
            <>
              <strong>Gelijkwaardige alternatieven</strong>
              <ul>
                {alternatieven.map((a) => (
                  <li key={a.id}>
                    <button type="button" className="td-mini" onClick={() => { onVervang(b.id, a.id); setAlternatievenOpen(false); }}>
                      {a.titel} · {a.duur} min
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Er is binnen jouw keuzes geen gelijkwaardig alternatief voor dit onderdeel.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function ProgrammaWeergave({
  programma,
  antwoorden,
  bezwaren = [],
  onVervang,
  onDuur,
  onVerwijder,
  onOpnieuw,
  onAndereKeuzes,
  deelUrl,
  onWis,
  melding,
}) {
  const u = programma.uitgangssituatie;
  const gebruikteIds = programma.onderdelen.map((o) => o.blok.id);
  const ruimte = programma.oordeel.ruimte;

  return (
    <div className="td-resultaat">
      <div className="td-binnen">
        <section className="td-sectie">
          <h2>Jullie uitgangssituatie</h2>
          <h3>{programma.hoofdthema || "Een eerste programmaopzet"}</h3>
          <dl className="td-def">
            <dt>Rol van de organisator</dt>
            <dd>{u.rol}</dd>
            <dt>Team</dt>
            <dd>
              {u.teamtype}, {u.teamgrootte && u.teamgrootte.toLowerCase()}
            </dd>
            <dt>Bestaansduur</dt>
            <dd>{u.bestaansduur}</dd>
            <dt>Onderlinge afhankelijkheid</dt>
            <dd>{u.afhankelijkheid}</dd>
            <dt>Aanleiding</dt>
            <dd>{u.aanleidingen.join(". ")}</dd>
            <dt>Gewenst resultaat</dt>
            <dd>{u.resultaten.join(". ")}</dd>
            <dt>Beschikbare tijd</dt>
            <dd>{u.tijd ? u.tijd.label : ""}</dd>
            <dt>Vorm</dt>
            <dd>{u.setting}</dd>
            <dt>Opvolging</dt>
            <dd>{u.opvolging}</dd>
          </dl>
          {u.toelichting ? (
            <div className="td-kaart">
              <strong>Jouw toelichting</strong>
              <p>{u.toelichting}</p>
            </div>
          ) : null}
          {u.zichtbaar || u.zichtbaarEigen ? (
            <div className="td-kaart">
              <strong>Twee weken later zichtbaar</strong>
              <p>{u.zichtbaarEigen || u.zichtbaar}</p>
            </div>
          ) : null}
          {u.rolAandachtspunt ? (
            <div className="td-kaart">
              <strong>Bij jouw rol hoort dit aandachtspunt</strong>
              <p>{u.rolAandachtspunt}</p>
            </div>
          ) : null}
        </section>

        <section className="td-sectie">
          <h2>Advies over de teamdag</h2>
          <h3>Is een teamdag hier de passende vorm?</h3>
          {programma.advies.map((regel) => (
            <p key={regel}>{regel}</p>
          ))}
          {programma.vraagtBegeleiding ? (
            <div className="td-kaart">
              <strong>Overweeg begeleiding</strong>
              <p>
                Bij dit onderwerp helpt het wanneer iemand het gesprek leidt die zelf geen partij is. Dat kan
                iemand uit de eigen organisatie zijn, of een externe begeleider.
              </p>
            </div>
          ) : null}
        </section>

        <section className="td-sectie">
          <h2>Beoogde opbrengst</h2>
          <h3>Wat er aan het einde van de dag anders is</h3>
          {programma.opbrengst.primair ? (
            <p>
              <strong>Primair:</strong> {programma.opbrengst.primair.charAt(0).toLowerCase() + programma.opbrengst.primair.slice(1)}
            </p>
          ) : null}
          {programma.opbrengst.secundair ? (
            <p>
              <strong>Secundair:</strong> {programma.opbrengst.secundair.charAt(0).toLowerCase() + programma.opbrengst.secundair.slice(1)}
            </p>
          ) : null}
        </section>

        <section className="td-sectie">
          <h2>Voorbereiding</h2>
          <h3>Wat er vóór de dag geregeld moet zijn</h3>
          {programma.voorbereiding.algemeen.map((groep) => (
            <div className="td-kaart" key={groep.titel}>
              <strong>{groep.titel}</strong>
              <ul className="td-lijst">
                {groep.punten.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}

          {programma.voorbereiding.perOnderdeel.length ? (
            <div className="td-kaart">
              <strong>Per onderdeel</strong>
              <ul className="td-lijst">
                {programma.voorbereiding.perOnderdeel.map((v) => (
                  <li key={v.titel}>
                    <strong>{v.titel}:</strong> {v.tekst.charAt(0).toLowerCase() + v.tekst.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {programma.voorbereiding.materialen.length ? (
            <div className="td-kaart">
              <strong>Materialen</strong>
              <ul className="td-lijst">
                {programma.voorbereiding.materialen.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="td-kaart">
            <strong>De ruimte</strong>
            <p>{programma.voorbereiding.ruimte}</p>
          </div>

          {programma.voorbereiding.voormeting ? (
            <div className="td-kaart">
              <strong>Een korte voormeting</strong>
              <p>{programma.voorbereiding.voormeting.aanraden}</p>
              <p>
                <Link to={programma.voorbereiding.voormeting.href}>{programma.voorbereiding.voormeting.label}</Link>
              </p>
            </div>
          ) : null}

          {programma.voorbereiding.apart.length ? (
            <div className="td-kaart">
              <strong>Bespreek dit vooraf afzonderlijk</strong>
              <ul className="td-lijst">
                {programma.voorbereiding.apart.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="td-sectie">
          <h2>Programma</h2>
          <h3>Een eerste opzet van {duurLabel(programma.beschikbaar)}</h3>

          {bezwaren.length ? (
            <div className="td-waarschuwing">
              <strong>Deze aanpassing kan zo niet:</strong>
              <ul>
                {bezwaren.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {programma.verwijderd.length ? (
            <div className="td-waarschuwing">
              <strong>Niet alles paste binnen de tijd.</strong>
              <p>
                Deze onderdelen zijn weggelaten: {programma.verwijderd.join(", ")}. Kies meer tijd of minder
                doelen wanneer je ze toch wilt opnemen.
              </p>
            </div>
          ) : null}

          <div className="td-programma">
            {programma.onderdelen.map((o) => (
              <BlokKaart
                key={o.sleutel || o.blok.id}
                onderdeel={o}
                antwoorden={antwoorden}
                ruimte={ruimte}
                gebruikteIds={gebruikteIds}
                aanpasbaar={Boolean(onVervang)}
                onVervang={onVervang}
                onDuur={onDuur}
                onVerwijder={onVerwijder}
              />
            ))}
          </div>

          <div className="td-totaal">
            <span>
              Programma {duurLabel(programma.totaal)} · buffer {programma.buffer} minuten
            </span>
            <span>Beschikbaar {duurLabel(programma.beschikbaar)}</span>
          </div>
        </section>

        <section className="td-sectie">
          <h2>Aandachtspunten</h2>
          <h3>Waar het bij deze keuzes mis kan gaan</h3>
          <ul className="td-lijst">
            {programma.aandachtspunten.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="td-sectie">
          <h2>Borging</h2>
          <h3>Wat er na de teamdag gebeurt</h3>
          <p>{programma.borging.tekst}</p>
          <div className="td-kaart">
            <strong>Concrete acties</strong>
            <ul className="td-lijst">
              {programma.borging.acties.map((a) => (
                <li key={a.actie}>
                  {a.actie} — <em>{a.eigenaar}</em>, {a.termijn}
                </li>
              ))}
            </ul>
          </div>
          <div className="td-kaart">
            <strong>Eerste evaluatiemoment</strong>
            <p>{programma.borging.evaluatie}</p>
          </div>
          <div className="td-kaart">
            <strong>Terugblik of pulsemeting</strong>
            <p>{programma.borging.pulsemeting.tekst}</p>
            <p>
              <Link to={programma.borging.pulsemeting.href}>{programma.borging.pulsemeting.label}</Link>
            </p>
          </div>
        </section>

        <section className="td-sectie">
          <h2>Aan de slag</h2>
          <h3>Opslaan, afdrukken of opnieuw beginnen</h3>
          <div className="td-knoprij">
            <button type="button" className="td-knop td-knop--secundair" onClick={() => window.print()}>
              Programma afdrukken
            </button>
            <button type="button" className="td-knop td-knop--secundair" onClick={onAndereKeuzes}>
              Keuzes aanpassen
            </button>
            <button type="button" className="td-knop td-knop--secundair" onClick={onOpnieuw}>
              Programma opnieuw samenstellen
            </button>
          </div>
          {deelUrl ? (
            <div className="td-kaart">
              <strong>Deelbare link</strong>
              <p>Deze link bevat alleen je gekozen antwoordopties. Je eigen toelichting gaat er niet in mee.</p>
              <input className="td-deel-veld" readOnly value={deelUrl} onFocus={(e) => e.target.select()} />
            </div>
          ) : null}
          {melding ? <p className="td-melding">{melding}</p> : null}
        </section>

        <section className="td-sectie">
          <div className="td-conversie">
            <p>{programma.vraagtBegeleiding ? CONVERSIE.intake.tekst : CONVERSIE.tekst}</p>
            <div className="td-knoprij">
              {(programma.vraagtBegeleiding ? [CONVERSIE.intake.knop, ...CONVERSIE.knoppen.slice(1)] : CONVERSIE.knoppen).map((k) => (
                <Link key={k.href + k.label} to={k.href} className={`td-knop ${k.primair ? "td-knop--primair" : "td-knop--secundair"}`}>
                  {k.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="td-beheer">
          <details>
            <summary>Wat er met je gegevens gebeurt</summary>
            <ul>
              {PRIVACYTEKST.lang.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
          <div className="td-knoprij">
            <button type="button" className="td-knop td-knop--secundair" onClick={onWis}>
              Verwijder mijn opgeslagen gegevens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
