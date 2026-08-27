// Mijn hand-in-handleiding: tien korte stukjes in je eigen woorden.
//
// Volledig optioneel. Wie hem invult, krijgt per stukje een concept op basis
// van de kenmerken die al bekend zijn — als startpunt, nooit als eindtekst.

import { useMemo, useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import { SECTIES, conceptVoorSectie } from "../../data/app/handleiding";
import { bepaalWaarden } from "../../lib/app/advies/regels";

function Sectie({ sectie, opgeslagen, concept, lidmaatschappen, bewaar }) {
  const [tekst, setTekst] = useState((opgeslagen && opgeslagen.tekst) || "");
  const [bezig, setBezig] = useState(false);
  const [bewaardOp, setBewaardOp] = useState(false);

  const gedeeldMet = (opgeslagen && opgeslagen.gedeeldMet) || [];

  const opslaan = async (nieuweGedeeldMet) => {
    setBezig(true);
    try {
      await bewaar({
        sectieId: sectie.id,
        tekst,
        gedeeldMet: nieuweGedeeldMet || gedeeldMet,
      });
      setBewaardOp(true);
      setTimeout(() => setBewaardOp(false), 2200);
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="tk-kaart">
      <h2>{sectie.titel}</h2>
      <p>{sectie.uitleg}</p>

      <textarea
        className="tk-tekstvak"
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder={sectie.voorbeeld}
        aria-label={sectie.titel}
      />

      <div className="tk-knoppen" style={{ marginTop: 12 }}>
        <button type="button" className="tk-knop tk-knop-klein" onClick={() => opslaan()} disabled={bezig}>
          {bewaardOp ? "Bewaard" : "Bewaren"}
        </button>
        {concept && (
          <button
            type="button"
            className="tk-knop tk-knop-rand tk-knop-klein"
            onClick={() => setTekst(concept)}
          >
            Concept overnemen
          </button>
        )}
      </div>

      {concept && !tekst && (
        <p className="tk-fijn" style={{ marginTop: 10 }}>
          Concept op basis van je profiel: “{concept}”
        </p>
      )}

      {tekst && (
        <div style={{ marginTop: 12 }}>
          {lidmaatschappen.map((l) => {
            const s = `${l.orgId}/${l.teamId}`;
            const aan = gedeeldMet.includes(s);
            return (
              <label className="tk-schakelaar" key={s} style={{ marginRight: 16 }}>
                <input
                  type="checkbox"
                  checked={aan}
                  onChange={() =>
                    opslaan(aan ? gedeeldMet.filter((x) => x !== s) : [...gedeeldMet, s])
                  }
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

export default function MijnHandleiding() {
  const { handleiding, kenmerken, lidmaatschappen, bewaarSectie } = useApp();

  const waarden = useMemo(() => bepaalWaarden(kenmerken), [kenmerken]);

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn handleiding</h1>
      <p className="tk-onderkop">
        Een korte gebruiksaanwijzing bij jezelf. Je bepaalt zelf wat je opschrijft, wat je weglaat
        en wat je deelt. Alles overslaan mag ook; de app werkt gewoon zonder.
      </p>

      {SECTIES.map((s) => (
        <Sectie
          key={s.id}
          sectie={s}
          opgeslagen={handleiding[s.id]}
          concept={conceptVoorSectie(s.id, waarden)}
          lidmaatschappen={lidmaatschappen}
          bewaar={bewaarSectie}
        />
      ))}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Wat je hier deelt, komt woordelijk bij je teamgenoten terecht. Schrijf dus op wat je ook
        hardop zou zeggen.
      </p>
    </div>
  );
}
