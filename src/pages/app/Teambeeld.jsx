// Ons teambeeld: waar dit team uiteenloopt en waar niet.
//
// Geen namen, geen aantallen per voorkeur, geen volgorde van mensen. Zodra je
// telt ontstaat er een meerderheid en dus een afwijkende, en dan is dit scherm
// onbruikbaar in een team. Zie teambeeld.js.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { collegasVan } from "../../lib/app/collegas";
import { dekkingInEenZin, steltTeambeeldSamen } from "../../lib/app/teambeeld";
import { spreidingVoor } from "../../data/app/groepsblokken";

/**
 * Eén kenmerk als één regel, die je opendraait.
 *
 * Twaalf kenmerken als twaalf volle kaarten onder elkaar is een muur: alles
 * roept even hard en daardoor lees je niets. Dicht zie je waar het over gaat en
 * hoe breed het ligt; open zie je wat erin zit en wat helpt. Er staat er één
 * tegelijk open, zodat het scherm kort blijft.
 */
function Kenmerk({ rij, uiteen, open, onKlik }) {
  const blok = spreidingVoor(rij.kenmerkId) || {};

  // Dicht is er ruimte voor één korte regel. Loopt het uiteen, dan is dat hoe
  // breed het ligt; zitten jullie op één lijn, dan is het gewoon de voorkeur
  // zelf — dat zegt meer dan "1 manier".
  const onder = uiteen
    ? `${rij.voorkeuren.length} manieren in dit team`
    : (rij.voorkeuren[0] && rij.voorkeuren[0].label) || "Hierin zitten jullie dicht bij elkaar";

  return (
    <div className="tk-persoonrij">
      <button
        type="button"
        className={`tk-optie${open ? " open" : ""}`}
        onClick={onKlik}
        aria-expanded={open}
      >
        <span className="tk-optie-tekst">
          <strong>{rij.label}</strong>
          <small>{onder}</small>
        </span>
        <span className="tk-optie-pijl" aria-hidden="true">›</span>
      </button>

      {open && (
        <div className="tk-optie-uit">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {uiteen
              ? blok.duiding || "Hierin verschillen jullie van elkaar."
              : "Hierin zitten jullie dicht bij elkaar."}
          </p>

          <div className="tk-label" style={{ marginTop: 14 }}>
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
              <div className="tk-label" style={{ marginTop: 14 }}>Wat helpt</div>
              <p style={{ margin: "6px 0 0", lineHeight: 1.6 }}>{blok.suggestie}</p>
            </>
          )}
        </div>
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

  const toegevoegd = collegas.filter((c) => c.doorBeheerder).length;

  // Eén kenmerk tegelijk open. Alles tegelijk open is precies de muur waar dit
  // scherm vanaf moest.
  const [openKenmerk, setOpenKenmerk] = useState(null);
  const draai = (id) => setOpenKenmerk((huidig) => (huidig === id ? null : id));

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

          {beeld.uiteen.length > 0 && (
            <section className="tk-groep">
              <h2 className="tk-groep-kop">Waar jullie uiteenlopen</h2>
              <p className="tk-fijn" style={{ margin: "-6px 0 12px" }}>
                Hier zit meer dan één voorkeur in het team. Dat is geen probleem om op te lossen,
                maar iets om te benoemen als het schuurt.
              </p>
              <div className="tk-groep-lijst">
                {beeld.uiteen.map((rij) => (
                  <Kenmerk
                    key={rij.kenmerkId}
                    rij={rij}
                    uiteen
                    open={openKenmerk === rij.kenmerkId}
                    onKlik={() => draai(rij.kenmerkId)}
                  />
                ))}
              </div>
            </section>
          )}

          {beeld.gedeeld.length > 0 && (
            <section className="tk-groep">
              <h2 className="tk-groep-kop">Waar jullie op één lijn zitten</h2>
              <p className="tk-fijn" style={{ margin: "-6px 0 12px" }}>
                Hier wil iedereen ongeveer hetzelfde. Dat maakt veel vanzelfsprekend — en het
                betekent dat jullie het als laatste merken wanneer het een keer anders moet.
              </p>
              <div className="tk-groep-lijst">
                {beeld.gedeeld.map((rij) => (
                  <Kenmerk
                    key={rij.kenmerkId}
                    rij={rij}
                    uiteen={false}
                    open={openKenmerk === rij.kenmerkId}
                    onKlik={() => draai(rij.kenmerkId)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="tk-fijn tk-voetnoot">
        Dit beeld verandert mee zodra iemand zijn profiel bijstelt of iets anders gaat delen. Het is
        een momentopname, geen typering van dit team.
      </p>
    </div>
  );
}
