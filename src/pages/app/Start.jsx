// Het startscherm.
//
// Een startscherm dat alleen doorverwijst naar dezelfde plekken als het menu,
// voegt niets toe. Dus staat hier wat het menu niet kan geven: je collega's bij
// naam. Eén tik brengt je bij het advies over die persoon — de tussenstap waar
// je diegene nog een keer moest aanwijzen, is weg.
//
// Zolang je profiel niet af is, staat daarboven de ene stap die dan logisch is.
// Welke dat is, wordt bepaald in volgendeStap.js — dezelfde logica die onderaan
// de andere pagina's meeloopt, zodat de app overal hetzelfde zegt.

import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import VolgendeStap from "../../components/app/VolgendeStap";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVolgendeStap } from "../../lib/app/volgendeStap";
import { bepaalVoortgang } from "../../lib/app/voortgang";
import { collegasVan, collegaInEenZin } from "../../lib/app/collegas";
import { uitgelichteAfspraak } from "../../lib/app/afspraken";
import { initialen, voornaam } from "../../lib/app/naam";

/** Een collega als bol met een naam eronder. Eén tik en je bent bij het advies. */
function Mens({ naar, ini, label, onder, gestippeld = false }) {
  return (
    <Link to={naar} className="tk-mens" title={onder || undefined}>
      <span className={`tk-bol tk-bol-mens${gestippeld ? " tk-bol-leeg" : ""}`}>{ini}</span>
      <span className="tk-mens-naam">{label}</span>
    </Link>
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

  // Afspraken verdwijnen niet doordat mensen het oneens zijn, maar doordat
  // niemand ze meer ziet. Er staat er daarom elke dag één op de plek waar
  // iedereen binnenkomt — welke het is hangt aan de datum, zodat ze langs
  // iedereen rouleren in plaats van bij elke verversing te verspringen.
  const afspraken = teamOverzicht.afspraken || [];
  const afspraakVandaag = uitgelichteAfspraak(afspraken);

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Hallo {voornaam(naam, "daar")}</h1>
      <p className="tk-onderkop">Waarmee kunnen we je vandaag helpen?</p>

      {uitnodigingscode && (
        <div className="tk-kaart" style={{ borderColor: "rgba(0,168,150,0.45)" }}>
          <h2>Je hebt een uitnodiging</h2>
          <p>
            Er staat een uitnodiging voor je klaar met de code{" "}
            <strong style={{ color: "var(--tk-teal)" }}>{uitnodigingscode}</strong>. Je kunt bij meer
            dan één team horen; teams zien niets van elkaar.
          </p>
          <div className="tk-knoppen">
            <Link className="tk-knop tk-knop-klein" to="/app/welkom?extra=1" style={{ textDecoration: "none" }}>
              Meedoen met dit team
            </Link>
            <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={vergeetUitnodiging}>
              Negeren
            </button>
          </div>
        </div>
      )}

      {/* Is je profiel nog niet af, dan is er precies één ding dat logisch is om
          nu te doen. Dat staat vóór alles wat je daarna kunt. */}
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

      <section className="tk-groep">
        <h2 className="tk-groep-kop">Samenwerken met</h2>
        <div className="tk-mensen">
          {collegas.map((c) => (
            <Mens
              key={c.sleutel}
              naar={`/app/samenwerken?met=${encodeURIComponent(c.sleutel)}`}
              ini={initialen(c.naam)}
              label={voornaam(c.naam, "Collega")}
              onder={collegaInEenZin(c)}
            />
          ))}
          <Mens naar="/app/team" ini="+" label="Uitnodigen" gestippeld />
        </div>
        <p className="tk-fijn" style={{ margin: "12px 0 0" }}>
          {collegas.length === 0
            ? "Zodra een collega meedoet en iets deelt, staat diegene hier."
            : "Kies een collega en wat er speelt. Je krijgt een gesprekssuggestie en één kleine actie."}
        </p>
      </section>

      {afspraakVandaag && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Onze afspraak</h2>
          <Link to="/app/team" className="tk-optie" style={{ alignItems: "flex-start" }}>
            <span className="tk-optie-tekst">
              <strong style={{ fontSize: 16.5, lineHeight: 1.55 }}>{afspraakVandaag.tekst}</strong>
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

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Adviezen komen uit vaste regels en vooraf geschreven teksten, niet uit een taalmodel. Ze zijn
        bedoeld als startpunt voor een gesprek, niet als oordeel over iemand.
      </p>
    </div>
  );
}
