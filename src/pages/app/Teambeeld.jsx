// Ons teambeeld: waar dit team uiteenloopt en waar niet.
//
// Geen namen, geen aantallen per voorkeur, geen volgorde van mensen. Zodra je
// telt ontstaat er een meerderheid en dus een afwijkende, en dan is dit scherm
// onbruikbaar in een team. Zie teambeeld.js.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { collegasVan } from "../../lib/app/collegas";
import { dekkingInEenZin, spreidingskaart, steltTeambeeldSamen } from "../../lib/app/teambeeld";
import { spreidingVoor } from "../../data/app/groepsblokken";

/**
 * Het hele beeld in één plaatje: per kenmerk hoeveel van de mogelijke
 * voorkeuren er in dit team zitten. Breed bovenaan.
 *
 * Een gevuld vakje betekent "deze voorkeur zit in dit team", niet "zoveel
 * mensen". Elk vakje heeft een titel met de voorkeur erin, zodat het verschil
 * niet alleen aan kleur hangt — en de blokken hieronder schrijven dezelfde
 * gegevens voluit.
 */
function Kaart({ rijen }) {
  if (rijen.length === 0) return null;

  return (
    <div className="tk-kaart">
      <div className="tk-label">Waar dit team breed is en waar smal</div>
      <p className="tk-fijn" style={{ margin: "6px 0 14px" }}>
        Elk vakje is een manier waarop je het kunt willen. Gevuld betekent dat die in dit team
        voorkomt — niet hoeveel mensen hem hebben.
      </p>

      {rijen.map((rij) => (
        <div className="tk-kaart-rij" key={rij.kenmerkId}>
          <span className="tk-kaart-naam">{rij.label}</span>
          <span
            className="tk-kaart-vakjes"
            role="img"
            aria-label={`${rij.label}: ${rij.aanwezig} van de ${rij.van} voorkeuren komen voor in dit team`}
          >
            {rij.opties.map((o) => (
              <span
                key={o.waarde}
                className={`tk-kaart-vakje${o.aanwezig ? " aan" : ""}`}
                title={`${o.aanwezig ? "Komt voor" : "Komt niet voor"}: ${o.label}`}
              />
            ))}
          </span>
          <span className="tk-kaart-stand">
            {rij.aanwezig === 1
              ? "iedereen wil hier ongeveer hetzelfde"
              : `${rij.aanwezig} van de ${rij.van} manieren zitten in dit team`}
          </span>
        </div>
      ))}
    </div>
  );
}

function Kenmerk({ rij, uiteen }) {
  const blok = spreidingVoor(rij.kenmerkId) || {};

  return (
    <div className="tk-kaart">
      <div className="tk-label">{rij.label}</div>
      <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.6 }}>
        {uiteen
          ? blok.duiding || "Hierin verschillen jullie van elkaar."
          : "Hierin zitten jullie dicht bij elkaar."}
      </p>

      <div className="tk-label" style={{ marginTop: 16 }}>
        {uiteen ? "Wat er in dit team zit" : "Wat jullie delen"}
      </div>
      <ul className="tk-zinnen">
        {rij.voorkeuren.map((v) => (
          <li key={v.label}>
            <strong>{v.label}</strong>
            {v.vraagt ? ` — ${v.vraagt}` : ""}
          </li>
        ))}
      </ul>

      {uiteen && blok.suggestie && (
        <>
          <div className="tk-label" style={{ marginTop: 16 }}>Wat helpt</div>
          <p style={{ margin: "6px 0 0", lineHeight: 1.6 }}>{blok.suggestie}</p>
        </>
      )}
    </div>
  );
}

export default function Teambeeld() {
  const { actiefTeam, kenmerken, teamOverzicht, ikBegeleid, gebruiker } = useApp();

  const collegas = useMemo(
    () =>
      collegasVan({
        leden: teamOverzicht.leden,
        gedeeld: teamOverzicht.gedeeld,
        profielleden: teamOverzicht.profielleden,
        eigenUid: gebruiker && gebruiker.uid,
      }),
    [teamOverzicht, gebruiker]
  );

  const beeld = useMemo(
    () =>
      steltTeambeeldSamen({
        deelnemers: collegas.map((c) => ({ naam: c.naam, kenmerken: c.kenmerken })),
        mijnKenmerken: kenmerken,
        ikDoeMee: !ikBegeleid,
      }),
    [collegas, kenmerken, ikBegeleid]
  );

  const kaart = useMemo(() => spreidingskaart(beeld), [beeld]);
  const toegevoegd = collegas.filter((c) => c.doorBeheerder).length;

  if (!actiefTeam) {
    return (
      <div className="tk-inhoud">
        <p className="tk-onderkop">Je hebt nog geen team.</p>
      </div>
    );
  }

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Ons teambeeld</h1>
      <p className="tk-onderkop">
        Waar dit team uiteenloopt en waar niet. Er staat nergens wie wat koos — alleen dát het
        verschilt, want zodra je telt is er een meerderheid en dus een afwijkende.
      </p>

      {teamOverzicht.laden ? (
        <p className="tk-onderkop">Even laden...</p>
      ) : !beeld.genoeg ? (
        <div className="tk-kaart">
          <h2 style={{ marginTop: 0 }}>Nog te weinig om iets te zien</h2>
          <p style={{ marginBottom: 0 }}>
            {dekkingInEenZin(beeld)} Verschil bestaat pas tussen twee mensen; met minder is elk beeld
            hier misleidend.{" "}
            <Link to="/app/team" style={{ color: "var(--tk-teal)" }}>Naar het team</Link>.
          </p>
        </div>
      ) : (
        <>
          <p className="tk-fijn">
            {dekkingInEenZin(beeld)}
            {toegevoegd > 0
              ? ` ${toegevoegd} ${toegevoegd === 1 ? "profiel is" : "profielen zijn"} toegevoegd uit een Insights-rapport en niet door die ${toegevoegd === 1 ? "persoon" : "personen"} zelf bevestigd.`
              : ""}
          </p>

          <Kaart rijen={kaart} />

          {beeld.uiteen.length > 0 && (
            <section className="tk-groep">
              <h2 className="tk-groep-kop">Waar jullie uiteenlopen</h2>
              <p className="tk-fijn" style={{ marginTop: -6 }}>
                Hier zit meer dan één voorkeur in het team. Dat is geen probleem om op te lossen,
                maar iets om te benoemen als het schuurt.
              </p>
              {beeld.uiteen.map((rij) => (
                <Kenmerk key={rij.kenmerkId} rij={rij} uiteen />
              ))}
            </section>
          )}

          {beeld.gedeeld.length > 0 && (
            <section className="tk-groep">
              <h2 className="tk-groep-kop">Waar jullie op één lijn zitten</h2>
              <p className="tk-fijn" style={{ marginTop: -6 }}>
                Hier wil iedereen ongeveer hetzelfde. Dat maakt veel vanzelfsprekend — en het
                betekent dat jullie het als laatste merken wanneer het een keer anders moet.
              </p>
              {beeld.gedeeld.map((rij) => (
                <Kenmerk key={rij.kenmerkId} rij={rij} uiteen={false} />
              ))}
            </section>
          )}
        </>
      )}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Dit beeld verandert mee zodra iemand zijn profiel bijstelt of iets anders gaat delen. Het is
        een momentopname, geen typering van dit team.
      </p>
    </div>
  );
}
