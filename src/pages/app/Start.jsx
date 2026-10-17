// Het startscherm.
//
// Hier stond een rij bollen met de voornamen van je collega's: één tik en je
// was bij het advies. Dat werkte, maar het was de enige route die zichtbaar
// was. De app heeft er twee -- beginnen bij een collega, of beginnen bij een
// klus -- en de tweede stond nergens op dit scherm. Wie met een vraag in zijn
// hoofd binnenkwam, zag alleen gezichten.
//
// Nu staan de twee vragen vooraan, in hun eigen woorden, elk met de knop die
// erbij hoort. De bollenlijst is weg: die bracht je naar hetzelfde scherm als
// de eerste knop, en twee ingangen naar dezelfde plek maken een scherm niet
// sneller maar voller. Wie een specifieke collega zoekt, vindt die een scherm
// verder -- en daar staan ze met een regel erbij in plaats van alleen een naam.
//
// Zolang je profiel niet af is, staat de ene stap die dan logisch is direct
// onder de twee routes. Welke dat is bepaalt volgendeStap.js, dezelfde logica
// die onderaan de andere pagina's meeloopt.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import VolgendeStap from "../../components/app/VolgendeStap";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVolgendeStap } from "../../lib/app/volgendeStap";
import { bepaalVoortgang } from "../../lib/app/voortgang";
import { collegasVan } from "../../lib/app/collegas";
import { uitgelichteAfspraak } from "../../lib/app/afspraken";
import { voornaam } from "../../lib/app/naam";
import TeamomgevingLink from "../../components/app/TeamomgevingLink";

/**
 * Eén van de twee dagelijkse vragen.
 *
 * De vraag staat er in de eerste persoon ("ik wil...") omdat je hem zo ook in
 * je hoofd stelt. De knop zegt wat er gebeurt als je hem indrukt, niet wat het
 * onderdeel heet.
 */
function Route({ titel, uitleg, knop, naar, uit }) {
  if (uit) return null;
  return (
    <article className="tk-kaart tk-route">
      <h3 className="tk-route-kop">{titel}</h3>
      <p className="tk-route-uitleg">{uitleg}</p>
      <Link className="tk-knop tk-knop-klein" to={naar}>{knop}</Link>
    </article>
  );
}

export default function Start() {
  const {
    gebruiker, naam, actiefTeam, kenmerken, handleiding, teamOverzicht, ikBegeleid,
    uitnodigingscode, vergeetUitnodiging,
  } = useApp();

  const eigenUid = gebruiker && gebruiker.uid;

  const stap = bepaalVolgendeStap({
    kenmerken,
    actiefTeam,
    leden: teamOverzicht.leden,
    gedeeldPerUid: teamOverzicht.gedeeld,
    eigenUid,
    teamcode: teamOverzicht.team && teamOverzicht.team.code,
    extraProfielen: (teamOverzicht.profielleden || []).length,
    ikBegeleid,
  });

  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding, ikBegeleid });

  const collegas = collegasVan({
    leden: teamOverzicht.leden,
    gedeeld: teamOverzicht.gedeeld,
    profielleden: teamOverzicht.profielleden,
    eigenUid,
  });

  // Jezelf meetellen klopt alleen als je meedoet. Begeleid je dit team, dan
  // ben je de tiende persoon niet — je staat er buiten.
  const mensen = collegas.length + (ikBegeleid ? 0 : 1);

  // Zonder collega's leiden de twee routes allebei naar een leeg scherm. Dan
  // is er precies één ding te doen, en dat zegt VolgendeStap al.
  const alleen = collegas.length === 0;

  // Afspraken verdwijnen niet doordat mensen het oneens zijn, maar doordat
  // niemand ze meer ziet. Er staat er daarom elke dag één op de plek waar
  // iedereen binnenkomt — welke het is hangt aan de datum, zodat ze langs
  // iedereen rouleren in plaats van bij elke verversing te verspringen.
  const afspraken = teamOverzicht.afspraken || [];
  const afspraakVandaag = uitgelichteAfspraak(afspraken);

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Hallo {voornaam(naam, "daar")}</h1>

      {uitnodigingscode && (
        <div className="tk-kaart tk-kaart-klaar">
          <h2>Je hebt een uitnodiging</h2>
          <p>
            Er staat een uitnodiging voor je klaar met de code{" "}
            <strong style={{ color: "var(--tk-teal)" }}>{uitnodigingscode}</strong>. Je kunt bij meer
            dan één team horen; teams zien niets van elkaar.
          </p>
          <div className="tk-knoppen">
            <Link className="tk-knop tk-knop-klein" to="/app/welkom?extra=1">
              Meedoen met dit team
            </Link>
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={vergeetUitnodiging}>
              Negeren
            </button>
          </div>
        </div>
      )}

      {!alleen && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Waarmee wil je verder?</h2>
          <p className="tk-fijn" style={{ margin: "0 0 14px" }}>Kies wat je nu nodig hebt.</p>
          <div className="tk-routes">
            <Route
              titel="Ik wil samenwerken met een collega"
              uitleg="Bereid een gesprek voor of ontdek wat jullie samenwerking helpt."
              knop="Kies een collega"
              naar="/app/samenwerken"
            />
            <Route
              titel="Ik zoek hulp bij een klus"
              uitleg="Beschrijf je vraag en verken wie kan meedenken."
              knop="Beschrijf je klus"
              naar="/app/hulp"
            />
          </div>
        </section>
      )}

      {/* Is je profiel nog niet af, dan is er precies één ding dat logisch is om
          nu te doen. Dat staat direct onder de twee routes — en bij een leeg
          team bovenaan, want dan zijn die routes er nog niet. */}
      {!voortgang.compleet && (
        <>
          <VolgendeStap variant="groot" />
          {/* De voortgangsbalk gaat over jouw profiel in dit team. Begeleid je
              het, dan hoort je profiel er niet bij en zegt een percentage hier
              niets. */}
          {!ikBegeleid && !teamOverzicht.laden && stap.nummer > 1 && (
            <Voortgang variant="klein" toonOnderdelen={false} />
          )}
        </>
      )}

      <TeamomgevingLink />

      {afspraakVandaag && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Onze afspraak</h2>
          <Link to="/app/team" className="tk-optie" style={{ alignItems: "flex-start" }}>
            <span className="tk-optie-tekst">
              <strong style={{ fontSize: "var(--tk-t-lead)", lineHeight: 1.55 }}>{afspraakVandaag.tekst}</strong>
              <small>
                {afspraken.length === 1
                  ? "Jullie enige afspraak."
                  : `Een van jullie ${afspraken.length} afspraken.`}
              </small>
            </span>
            <span className="tk-optie-pijl" aria-hidden="true">›</span>
          </Link>
        </section>
      )}

      <section className="tk-groep">
        <h2 className="tk-groep-kop">Meer</h2>
        <div className="tk-groep-lijst">
          <Link to="/app/team" className="tk-optie">
            <span className="tk-optie-tekst">
              <strong>Mijn team</strong>
              <small>{actiefTeam ? actiefTeam.teamNaam || "Je team" : "Je hebt nog geen team"}</small>
            </span>
            <span className="tk-optie-stand">
              {mensen} {mensen === 1 ? "persoon" : "mensen"}
            </span>
            <span className="tk-optie-pijl" aria-hidden="true">›</span>
          </Link>

          {/* Bij een team dat je begeleidt hoort deze regel niet. Hij gaat
              over wat je met dít team deelt, en dat doe je niet — dan is "0 van
              12" geen stand maar een vraag die niet gesteld hoort te worden.
              Je profiel blijft bereikbaar via Ik. */}
          {!ikBegeleid && (
            <Link to="/app/ik" className="tk-optie">
              <span className="tk-optie-tekst">
                <strong>Mijn profiel</strong>
                <small>Wat jij over jezelf deelt met je team.</small>
              </span>
              <span className={`tk-optie-stand${voortgang.compleet ? " klaar" : ""}`}>
                {voortgang.compleet && <span aria-hidden="true">✓ </span>}
                {voortgang.gedeeld} van {voortgang.van}
              </span>
              <span className="tk-optie-pijl" aria-hidden="true">›</span>
            </Link>
          )}
        </div>
      </section>

      <p className="tk-fijn tk-voetnoot">
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze zijn
        bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
