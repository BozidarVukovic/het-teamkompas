// Wat het team met elkaar heeft afgesproken.
//
// Het enige onderdeel van de app dat van het team samen is. Iedereen kan er een
// opschrijven en iedereen kan hem bijstellen; er staat bij wie hem opschreef en
// wie hem het laatst aanpaste. Weghalen kan alleen de beheerder — zo verdwijnt
// er niets stilletjes van tafel. Zie afspraken.js.

import { useMemo, useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import { MAX_TEKST, herkomstVan, sorteerAfspraken } from "../../lib/app/afspraken";
import useActie from "./useActie";
import Melding from "./Melding";

function Formulier({ begin = null, onBewaar, onSluit, bezig }) {
  const [tekst, setTekst] = useState((begin && begin.tekst) || "");
  const [toelichting, setToelichting] = useState((begin && begin.toelichting) || "");

  const klaar = tekst.trim().length > 0;

  return (
    <div className="tk-kaart" style={{ marginTop: 12 }}>
      <label className="tk-label" htmlFor="tk-afspraak">De afspraak</label>
      <p className="tk-fijn" style={{ margin: "2px 0 6px" }}>
        Eén zin, in de wij-vorm. Schrijf op wat jullie doen, niet wat jullie vinden.
      </p>
      <input
        id="tk-afspraak"
        className="tk-invoer"
        value={tekst}
        maxLength={MAX_TEKST}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="We spreken af wie wat wanneer doet, en houden ons daaraan"
      />

      <label className="tk-label" htmlFor="tk-afspraak-uitleg" style={{ marginTop: 14 }}>
        Waarom deze afspraak <span style={{ fontWeight: 400, textTransform: "none" }}>— optioneel</span>
      </label>
      <textarea
        id="tk-afspraak-uitleg"
        className="tk-tekstvak"
        value={toelichting}
        onChange={(e) => setToelichting(e.target.value)}
        placeholder="Waar komt hij vandaan, of wat merk je als het niet gebeurt"
      />

      <div className="tk-knoppen" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="tk-knop tk-knop-klein"
          disabled={!klaar || bezig}
          onClick={() => onBewaar({ tekst, toelichting })}
        >
          {bezig ? "Bezig..." : begin ? "Bijstellen" : "Afspraak toevoegen"}
        </button>
        <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={onSluit}>
          Annuleren
        </button>
      </div>
    </div>
  );
}

export default function Teamafspraken({ magVerwijderen = false }) {
  const { teamOverzicht, bewaarAfspraak, verwijderAfspraak } = useApp();
  const { bezig, melding, voerUit, wisMelding } = useActie();
  const [open, setOpen] = useState(null); // "nieuw" | afspraakId | null

  const afspraken = useMemo(
    () => sorteerAfspraken(teamOverzicht.afspraken || []),
    [teamOverzicht.afspraken]
  );

  const bewaren = ({ id, tekst, toelichting }) =>
    voerUit(
      id ? "de afspraak bijstellen" : "de afspraak toevoegen",
      async () => {
        await bewaarAfspraak({ id, tekst, toelichting });
        setOpen(null);
      },
      id ? "De afspraak is bijgesteld." : "De afspraak staat erbij. Iedereen in het team ziet hem."
    );

  return (
    <section className="tk-groep">
      <h2 className="tk-groep-kop">Onze afspraken</h2>
      <p className="tk-fijn" style={{ marginTop: -6 }}>
        Wat jullie met elkaar hebben afgesproken over hoe je met elkaar omgaat. Iedereen kan er een
        opschrijven en bijstellen; er staat bij wie dat deed.
      </p>

      <Melding melding={melding} onSluiten={wisMelding} />

      {afspraken.length === 0 && open !== "nieuw" && (
        <p className="tk-fijn">
          Er staat er nog geen. Een goede eerste komt vaak uit wat mensen in hun handleiding hebben
          gezet bij wat ze níét helpt — daar zitten meestal een paar dingen bij die voor iedereen
          gelden.
        </p>
      )}

      <div className="tk-groep-lijst">
        {afspraken.map((a) => (
          <div className="tk-persoonrij" key={a.id}>
            {open === a.id ? (
              <Formulier
                begin={a}
                bezig={bezig}
                onSluit={() => setOpen(null)}
                onBewaar={({ tekst, toelichting }) => bewaren({ id: a.id, tekst, toelichting })}
              />
            ) : (
              <div className="tk-kaart" style={{ marginBottom: 0 }}>
                <p style={{ margin: 0, fontSize: "var(--tk-t-lead)", lineHeight: 1.55 }}>{a.tekst}</p>
                {a.toelichting && (
                  <p className="tk-fijn" style={{ marginTop: 8 }}>{a.toelichting}</p>
                )}
                <p className="tk-fijn" style={{ marginTop: 10, marginBottom: 0 }}>
                  {herkomstVan(a)}
                </p>
                <div className="tk-knoppen" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="tk-knop tk-knop-rand tk-knop-klein"
                    onClick={() => setOpen(a.id)}
                  >
                    Bijstellen
                  </button>
                  {magVerwijderen && (
                    <button
                      type="button"
                      className="tk-knop tk-knop-rand tk-knop-klein"
                      disabled={bezig}
                      onClick={() =>
                        voerUit(
                          "de afspraak weghalen",
                          () => verwijderAfspraak(a.id),
                          "De afspraak is weggehaald."
                        )
                      }
                    >
                      Weghalen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {open === "nieuw" ? (
          <Formulier
            bezig={bezig}
            onSluit={() => setOpen(null)}
            onBewaar={({ tekst, toelichting }) => bewaren({ tekst, toelichting })}
          />
        ) : (
          <button
            type="button"
            className="tk-optie tk-optie-toevoegen"
            onClick={() => setOpen("nieuw")}
          >
            <span className="tk-optie-plus" aria-hidden="true">+</span>
            <span>Een afspraak opschrijven</span>
            <span className="tk-optie-pijl" aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </section>
  );
}
