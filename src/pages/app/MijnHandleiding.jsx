// Mijn hand-in-handleiding: tien korte stukjes in je eigen woorden.
//
// Volledig optioneel. Wie hem invult, krijgt per stukje een concept op basis
// van de kenmerken die al bekend zijn — als startpunt, nooit als eindtekst.

import { useMemo, useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import VolgendeStap from "../../components/app/VolgendeStap";
import useActie from "../../components/app/useActie";
import Melding from "../../components/app/Melding";
import { SECTIES, conceptVoorSectie } from "../../data/app/handleiding";
import { bepaalWaarden } from "../../lib/app/advies/regels";

function Sectie({ sectie, opgeslagen, concept, uitProfiel, klaargezet, lidmaatschappen, bewaar }) {
  const [tekst, setTekst] = useState((opgeslagen && opgeslagen.tekst) || "");
  const { bezig, melding, voerUit, wisMelding } = useActie();
  const [bewaardOp, setBewaardOp] = useState(false);
  const [toonProfiel, setToonProfiel] = useState(false);

  const gedeeldMet = (opgeslagen && opgeslagen.gedeeldMet) || [];

  const opslaan = async (nieuweGedeeldMet) => {
    const gelukt = await voerUit(`"${sectie.titel}" bewaren`, () =>
      bewaar({
        sectieId: sectie.id,
        tekst,
        gedeeldMet: nieuweGedeeldMet || gedeeldMet,
      })
    );
    if (!gelukt) return;
    setBewaardOp(true);
    setTimeout(() => setBewaardOp(false), 2200);
  };

  return (
    <div className="tk-kaart">
      <h2>{sectie.titel}</h2>
      <p>{sectie.uitleg}</p>

      <Melding melding={melding} onSluiten={wisMelding} />

      {/* Tekst die iemand uit een teamsessie voor je heeft klaargezet. Hij
          staat bewust bóven het tekstvak en gaat er niet vanzelf in: het zijn
          jouw woorden, maar je moet ze kunnen nalezen en bijstellen voordat ze
          ergens staan. */}
      {klaargezet && (
        <div className="tk-melding" style={{ marginBottom: 12 }}>
          <p className="tk-fijn" style={{ marginTop: 0 }}>
            {klaargezet.vanNaam ? `${klaargezet.vanNaam} heeft` : "Iemand uit je team heeft"} dit
            voor je klaargezet uit een teamsessie. Er staat nog niets: het komt pas in je
            handleiding als jij het bewaart.
          </p>
          <p style={{ margin: "0 0 10px" }}>{klaargezet.tekst}</p>
          <div className="tk-knoppen">
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => setTekst(klaargezet.tekst)}
            >
              In het tekstvak zetten
            </button>
            {tekst && tekst !== klaargezet.tekst && (
              <button
                type="button"
                className="tk-knop tk-knop-rand tk-knop-klein"
                onClick={() => setTekst(`${tekst.trim()} ${klaargezet.tekst}`)}
              >
                Eronder plakken
              </button>
            )}
          </div>
        </div>
      )}

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

      {uitProfiel && uitProfiel.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setToonProfiel(!toonProfiel)}
            className="tk-tekstknop"
          >
            {toonProfiel ? "Verberg" : "Bekijk"} wat je Insights-profiel hierover zegt ({uitProfiel.length})
          </button>
          {toonProfiel && (
            <div className="tk-melding" style={{ marginTop: 10 }}>
              <p className="tk-fijn" style={{ marginTop: 0 }}>
                Letterlijk uit je profiel, in de derde persoon. Neem eruit over wat je herkent en maak
                er je eigen zin van.
              </p>
              {uitProfiel.map((punt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <button
                    type="button"
                    className="tk-knop tk-knop-rand tk-knop-klein"
                    style={{ flex: "0 0 auto", padding: "3px 10px", fontSize: "var(--tk-t-fijn)" }}
                    onClick={() => setTekst(tekst ? `${tekst.trim()} ${punt}` : punt)}
                  >
                    Neem over
                  </button>
                  <span style={{ lineHeight: 1.55 }}>{punt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
  const {
    handleiding, kenmerken, lidmaatschappen, begeleideTeams, bewaarSectie, profiel,
    tekstvoorstellen, wijsTekstvoorstelAf, actiefTeam,
  } = useApp();
  const { bezig: bezigVoorstel, melding: voorstelMelding, voerUit: voerVoorstelUit, wisMelding: wisVoorstelMelding } =
    useActie();

  // Er kan uit meer dan één team tekst voor je klaarstaan. We tonen die van het
  // team waar je nu in werkt; anders zou je bij twee klanten twee versies van
  // dezelfde sectie naast elkaar zien zonder te weten welke waarbij hoort.
  const klaargezet = (tekstvoorstellen || []).find(
    (v) => actiefTeam && v.orgId === actiefTeam.orgId && v.teamId === actiefTeam.teamId
  );
  const klaargezetteSecties = (klaargezet && klaargezet.secties) || {};

  // Een team dat je begeleidt hoort niet bij de teams waarmee je iets deelt:
  // je doet er zelf niet aan mee.
  const deelbareTeams = (lidmaatschappen || []).filter(
    (l) => !(begeleideTeams || []).includes(`${l.orgId}/${l.teamId}`)
  );
  const uitProfiel = (profiel && profiel.insightsTeksten) || {};

  const waarden = useMemo(() => bepaalWaarden(kenmerken), [kenmerken]);

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn handleiding</h1>
      <p className="tk-onderkop">
        Een korte gebruiksaanwijzing bij jezelf. Je bepaalt zelf wat je opschrijft, wat je weglaat
        en wat je deelt. Alles overslaan mag ook; de app werkt gewoon zonder.
      </p>

      {klaargezet && (
        <div className="tk-kaart tk-kaart-klaar">
          <h2 style={{ marginTop: 0 }}>Er staat tekst voor je klaar</h2>
          <p>
            {klaargezet.vanNaam || "Iemand uit je team"} heeft bij{" "}
            {Object.keys(klaargezetteSecties).length}{" "}
            {Object.keys(klaargezetteSecties).length === 1 ? "stukje" : "stukjes"} neergezet wat jij
            zelf in een teamsessie hebt opgeschreven. Het staat hieronder bij het stukje waar het
            hoort. Lees het na, pas aan wat niet meer klopt, en bewaar wat je wilt houden.
          </p>
          <p className="tk-fijn">
            Er staat nog niets in je handleiding. Dat gebeurt pas als jij op Bewaren klikt, en delen
            is daarna nog een aparte keuze.
          </p>
          <Melding melding={voorstelMelding} onSluiten={wisVoorstelMelding} />
          <button
            type="button"
            className="tk-knop tk-knop-rand tk-knop-klein"
            disabled={bezigVoorstel}
            onClick={() =>
              voerVoorstelUit(
                "de klaargezette tekst weghalen",
                () => wijsTekstvoorstelAf(klaargezet),
                "Weggehaald. Wat je zelf hebt bewaard, blijft gewoon staan."
              )
            }
          >
            Ik ben ze langsgelopen — weghalen
          </button>
        </div>
      )}

      {SECTIES.map((s) => (
        <Sectie
          key={s.id}
          sectie={s}
          opgeslagen={handleiding[s.id]}
          concept={conceptVoorSectie(s.id, waarden)}
          uitProfiel={uitProfiel[s.id]}
          klaargezet={
            klaargezetteSecties[s.id]
              ? { tekst: klaargezetteSecties[s.id], vanNaam: klaargezet.vanNaam }
              : null
          }
          lidmaatschappen={deelbareTeams}
          bewaar={bewaarSectie}
        />
      ))}

      <VolgendeStap />

      <p className="tk-fijn tk-voetnoot">
        Wat je hier deelt, komt woordelijk bij je teamgenoten terecht. Schrijf dus op wat je ook
        hardop zou zeggen.
      </p>
    </div>
  );
}
