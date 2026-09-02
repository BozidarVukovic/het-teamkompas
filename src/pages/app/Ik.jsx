// Alles over jezelf op één plek.
//
// Mijn profiel, mijn handleiding en mijn gegevens stonden los in het menu. Voor
// wie de app niet kent zijn dat drie namen voor hetzelfde onderwerp: ik.
//
// Bovenaan staat wie je bent. Daaronder, alleen zolang er iets te doen is, hoe
// ver je bent — is alles af, dan verdwijnt die hele machinerie en blijft er één
// regel over. Onderaan de drie onderdelen als lijst, met per onderdeel in één
// oogopslag waar je staat.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import Voortgang from "../../components/app/Voortgang";
import { bepaalVoortgang } from "../../lib/app/voortgang";
import { initialen } from "../../lib/app/naam";
import {
  LOOPTIJD_DAGEN,
  MAX_TERUGBLIK,
  UITKOMSTEN,
  isTerugblikKlaar,
  sorteerExperimenten,
  standInEenZin,
} from "../../lib/app/experimenten";
import {
  MAX_TEKST,
  TERUGBLIKKEN,
  openstaandeSessie,
  sorteerReflecties,
  terugblikLabel,
  waaroverInEenZin,
} from "../../lib/app/reflecties";
import { situatie } from "../../data/app/situaties";

function Regel({ naar, titel, uitleg, stand = null, klaar = false }) {
  return (
    <Link to={naar} className="tk-optie">
      <span className="tk-optie-tekst">
        <strong>{titel}</strong>
        <small>{uitleg}</small>
      </span>
      {stand && (
        <span className={`tk-optie-stand${klaar ? " klaar" : ""}`}>
          {klaar && <span aria-hidden="true">✓ </span>}
          {stand}
        </span>
      )}
      <span className="tk-optie-pijl" aria-hidden="true">›</span>
    </Link>
  );
}

/**
 * Eén experiment: wat je gaat proberen, hoe lang het loopt, en na afloop de
 * ene vraag die erbij hoort.
 *
 * Er staat met opzet geen teller bij en geen "je bent er nog niet". De app
 * weet niet wat je gedaan hebt, en gaat daar ook niet naar raden.
 */
function Experiment({ experiment, opTerugblik }) {
  const [open, setOpen] = useState(false);
  const [uitkomst, setUitkomst] = useState(null);
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);

  const klaar = isTerugblikKlaar(experiment);
  const uitkomstLabel = (UITKOMSTEN.find((u) => u.id === experiment.uitkomst) || {}).label;

  const bewaar = async () => {
    if (!uitkomst || bezig) return;
    setBezig(true);
    try {
      await opTerugblik({ id: experiment.id, uitkomst, tekst });
    } catch {
      /* lukt het niet, dan blijft het experiment gewoon staan */
    }
    setBezig(false);
  };

  return (
    <div className="tk-kaart">
      <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6 }}>{experiment.actie}</p>
      <p className="tk-fijn" style={{ margin: "8px 0 0" }}>
        {standInEenZin(experiment)}
        {experiment.situatieLabel ? ` · ${experiment.situatieLabel}` : ""}
      </p>

      {experiment.terugblikOp && uitkomstLabel && (
        <p style={{ marginBottom: 0 }}>
          <strong>{uitkomstLabel}</strong>
          {experiment.tekst ? ` — ${experiment.tekst}` : ""}
        </p>
      )}

      {klaar && !open && (
        <button
          type="button"
          className="tk-knop tk-knop-klein"
          style={{ marginTop: 12 }}
          onClick={() => setOpen(true)}
        >
          Terugblikken
        </button>
      )}

      {klaar && open && (
        <div style={{ marginTop: 14 }}>
          <p className="tk-label">Wat doe je hiermee?</p>
          <div className="tk-keuzes">
            {UITKOMSTEN.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`tk-keuze${uitkomst === u.id ? " gekozen" : ""}`}
                aria-pressed={uitkomst === u.id}
                onClick={() => setUitkomst(u.id)}
              >
                <span>{u.label}</span>
              </button>
            ))}
          </div>

          <label className="tk-label" htmlFor="tk-terugblik" style={{ marginTop: 14, display: "block" }}>
            Wat merkte je?{" "}
            <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optioneel)</span>
          </label>
          <textarea
            id="tk-terugblik"
            className="tk-tekstvak"
            rows={3}
            maxLength={MAX_TERUGBLIK}
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="Bijvoorbeeld: het werkte vooral als ik het aan het begin van een overleg deed."
          />

          <div className="tk-knoppen" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="tk-knop tk-knop-klein"
              disabled={!uitkomst || bezig}
              onClick={bewaar}
            >
              {bezig ? "Bezig..." : "Bewaren"}
            </button>
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => setOpen(false)}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * De ene vraag na een gesprek: hoe kijk je erop terug?
 *
 * Vier antwoorden waarvan er één "ik heb het niet gevoerd" is, en een veld dat
 * leeg mag blijven. Er staat nergens een vraag over de ander — wat hier komt te
 * staan gaat over jou.
 */
function Terugkijken({ sessie, label, opBewaren }) {
  const [terugblik, setTerugblik] = useState(null);
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);

  const bewaar = async () => {
    if (!terugblik || bezig) return;
    setBezig(true);
    try {
      await opBewaren({
        sessieId: sessie.id,
        situatieId: sessie.situatieId,
        situatieLabel: label,
        terugblik,
        tekst,
      });
    } catch {
      /* lukt het niet, dan blijft de vraag gewoon staan */
    }
    setBezig(false);
  };

  return (
    <div className="tk-kaart">
      <h2 style={{ marginTop: 0 }}>Hoe kijk je erop terug?</h2>
      <p className="tk-fijn" style={{ marginTop: -4 }}>{waaroverInEenZin(sessie, label)}</p>

      <div className="tk-keuzes">
        {TERUGBLIKKEN.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`tk-keuze${terugblik === k.id ? " gekozen" : ""}`}
            aria-pressed={terugblik === k.id}
            onClick={() => setTerugblik(k.id)}
          >
            <span>{k.label}</span>
          </button>
        ))}
      </div>

      <label className="tk-label" htmlFor="tk-reflectie" style={{ marginTop: 16, display: "block" }}>
        Wat viel je op?{" "}
        <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optioneel)</span>
      </label>
      <textarea
        id="tk-reflectie"
        className="tk-tekstvak"
        rows={3}
        maxLength={MAX_TEKST}
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Schrijf op wat je opviel aan het gesprek en aan jezelf."
      />

      <div className="tk-knoppen" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="tk-knop tk-knop-klein"
          disabled={!terugblik || bezig}
          onClick={bewaar}
        >
          {bezig ? "Bezig..." : "Bewaren"}
        </button>
      </div>
    </div>
  );
}

export default function Ik() {
  const {
    naam, functie, gebruiker, kenmerken, actiefTeam, handleiding, ikBegeleid,
    experimenten, blikTerug, sessies, reflecties, bewaarReflectie,
  } = useApp();
  const rij = sorteerExperimenten(experimenten);

  const teBespreken = openstaandeSessie({ sessies, reflecties });
  const teBesprekenLabel = teBespreken ? (situatie(teBespreken.situatieId) || {}).label : "";
  const gemaakt = sorteerReflecties(reflecties);
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding, ikBegeleid });
  const handleidingKlaar = voortgang.handleidingSecties >= voortgang.handleidingVan;

  return (
    <div className="tk-inhoud">
      <header className="tk-ikkop">
        <span className="tk-bol tk-bol-groot">{initialen(naam)}</span>
        <div style={{ minWidth: 0 }}>
          <h1 className="tk-kop" style={{ marginBottom: 2 }}>{naam || "Ik"}</h1>
          <p className="tk-onderkop" style={{ margin: 0 }}>
            {functie ? `${functie} · ` : ""}
            {gebruiker && gebruiker.email}
          </p>
        </div>
      </header>

      {/* De uitsplitsing in ingevuld, nagelopen en gedeeld helpt zolang er iets
          te doen is. Staat alles op honderd procent, dan is het een uitleg van
          werk dat al gedaan is. */}
      {ikBegeleid ? (
        <p className="tk-fijn">
          Je begeleidt {actiefTeam ? actiefTeam.teamNaam || "dit team" : "dit team"} en doet er zelf
          niet aan mee, dus je deelt er niets mee. Je profiel is en blijft van jou; in teams waar je
          wél aan meedoet, bepaal je per punt wat je deelt.
        </p>
      ) : voortgang.compleet ? (
        <p className="tk-af">
          <span aria-hidden="true">✓</span> Je profiel is compleet en gedeeld met je team.
        </p>
      ) : (
        <Voortgang variant="groot" />
      )}

      <section className="tk-groep">
        <h2 className="tk-groep-kop">Over mij</h2>
        <div className="tk-groep-lijst">
          <Regel
            naar="/app/profiel"
            titel="Mijn profiel"
            uitleg={
              ikBegeleid
                ? "Twaalf punten over hoe jij werkt. Privé zolang je alleen teams begeleidt."
                : "Twaalf punten over hoe jij werkt, gedeeld met je team."
            }
            stand={
              ikBegeleid
                ? `${voortgang.ingevuld} van ${voortgang.van} ingevuld`
                : `${voortgang.gedeeld} van ${voortgang.van}`
            }
            klaar={voortgang.compleet}
          />
          <Regel
            naar="/app/handleiding"
            titel="Mijn handleiding"
            uitleg="In je eigen woorden. Optioneel, maar het maakt het advies persoonlijker."
            stand={`${voortgang.handleidingSecties} van ${voortgang.handleidingVan}`}
            klaar={handleidingKlaar}
          />
          <Regel
            naar="/app/gegevens"
            titel="Mijn gegevens"
            uitleg="Je naam, je functie, je teams, en alles wat er van je is opgeslagen."
          />
        </div>
      </section>

      {rij.length > 0 && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Wat ik probeer</h2>
          <p className="tk-fijn" style={{ margin: "0 0 12px" }}>
            Kleine acties uit een advies die je {LOOPTIJD_DAGEN} dagen vasthoudt. Ze staan niet in
            je team en er wordt niets bijgehouden behalve wat je zelf schrijft.
          </p>
          {rij.map((e) => (
            <Experiment key={e.id} experiment={e} opTerugblik={blikTerug} />
          ))}
        </section>
      )}

      {(teBespreken || gemaakt.length > 0) && (
        <section className="tk-groep">
          <h2 className="tk-groep-kop">Terugkijken</h2>
          <p className="tk-fijn" style={{ margin: "0 0 12px" }}>
            Na een gesprek waar je advies bij vroeg, vraagt de app één keer hoe het ging. Wat je
            antwoordt is van jou; je team ziet het niet.
          </p>

          {teBespreken && (
            <Terugkijken
              sessie={teBespreken}
              label={teBesprekenLabel}
              opBewaren={bewaarReflectie}
            />
          )}

          {gemaakt.map((r) => (
            <div className="tk-kaart" key={r.id}>
              <div className="tk-label">{r.situatieLabel || "Een gesprek"}</div>
              <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.6 }}>
                {terugblikLabel(r.terugblik)}
              </p>
              {r.tekst && <p style={{ marginBottom: 0 }}>{r.tekst}</p>}
            </div>
          ))}
        </section>
      )}

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Je teamgenoten zien alleen wat je zelf hebt gedeeld. Wat je invult maar niet deelt, blijft
        van jou.
      </p>
    </div>
  );
}
