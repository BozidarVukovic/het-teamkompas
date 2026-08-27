// Inloggen met een e-mailkoppeling. Geen wachtwoord, dus ook niets te lekken.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";

export default function Inloggen() {
  const { stuurInloglink, isInloglink, voltooiInloggen, gebruiker } = useApp();
  const navigeer = useNavigate();

  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState("");
  const [vraagEmail, setVraagEmail] = useState(false);
  const [afhandelen, setAfhandelen] = useState(false);

  useEffect(() => {
    if (!isInloglink()) return;
    setAfhandelen(true);
    voltooiInloggen()
      .then((uitkomst) => {
        if (uitkomst.nodig === "email") {
          setVraagEmail(true);
          setAfhandelen(false);
        }
      })
      .catch(() => {
        setFout(
          "Deze koppeling werkt niet meer. Vraag hieronder een nieuwe aan; een koppeling is maar korte tijd geldig."
        );
        setAfhandelen(false);
      });
  }, [isInloglink, voltooiInloggen]);

  useEffect(() => {
    if (gebruiker && !isInloglink()) navigeer("/app", { replace: true });
  }, [gebruiker, isInloglink, navigeer]);

  const versturen = async (e) => {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      await stuurInloglink(email);
      setVerstuurd(true);
    } catch (err) {
      setFout(
        err && err.code === "auth/invalid-email"
          ? "Dat lijkt geen geldig e-mailadres."
          : "Versturen lukte niet. Probeer het zo nog eens."
      );
    } finally {
      setBezig(false);
    }
  };

  const bevestigEmail = async (e) => {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      await voltooiInloggen(email);
    } catch {
      setFout("Dit adres hoort niet bij de koppeling. Controleer het en probeer het opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  if (afhandelen) {
    return (
      <div className="tk-inhoud tk-smal" style={{ paddingTop: 70, textAlign: "center" }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>🧭</div>
        <p className="tk-onderkop">Je wordt aangemeld...</p>
      </div>
    );
  }

  if (vraagEmail) {
    return (
      <div className="tk-inhoud tk-smal" style={{ paddingTop: 60 }}>
        <h1 className="tk-kop">Nog even je e-mailadres</h1>
        <p className="tk-onderkop">
          Je opent de koppeling op een ander apparaat dan waar je hem hebt aangevraagd. Vul je
          e-mailadres in, dan controleren we of de koppeling bij jou hoort.
        </p>
        {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}
        <form onSubmit={bevestigEmail} className="tk-kaart">
          <label className="tk-label" htmlFor="tk-email-bevestig">E-mailadres</label>
          <input
            id="tk-email-bevestig"
            className="tk-invoer"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="tk-knoppen" style={{ marginTop: 14 }}>
            <button className="tk-knop" type="submit" disabled={bezig}>
              {bezig ? "Bezig..." : "Aanmelden"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="tk-inhoud tk-smal" style={{ paddingTop: 60 }}>
      <div className="tk-stap">Mijn Teamkompas</div>
      <h1 className="tk-kop">Inloggen</h1>
      <p className="tk-onderkop">
        Je krijgt een koppeling per e-mail waarmee je direct binnen bent. Geen wachtwoord om te
        onthouden en niets om kwijt te raken.
      </p>

      {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}

      {verstuurd ? (
        <div className="tk-kaart">
          <h2>Kijk in je mail</h2>
          <p>
            We hebben een koppeling gestuurd naar <strong>{email}</strong>. Open die op dit
            apparaat, dan ben je meteen ingelogd. Niets ontvangen? Kijk ook even in je ongewenste
            berichten.
          </p>
          <button
            type="button"
            className="tk-knop tk-knop-rand tk-knop-klein"
            onClick={() => setVerstuurd(false)}
          >
            Ander adres gebruiken
          </button>
        </div>
      ) : (
        <form onSubmit={versturen} className="tk-kaart">
          <label className="tk-label" htmlFor="tk-email">E-mailadres</label>
          <input
            id="tk-email"
            className="tk-invoer"
            type="email"
            autoComplete="email"
            placeholder="jij@voorbeeld.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="tk-knoppen" style={{ marginTop: 14 }}>
            <button className="tk-knop" type="submit" disabled={bezig || !email}>
              {bezig ? "Versturen..." : "Stuur mij een koppeling"}
            </button>
          </div>
        </form>
      )}

      <p className="tk-fijn">
        Deze omgeving is besloten. Wat je hier invult, is van jou: je bepaalt zelf per onderdeel of
        je het met je team deelt, en je kunt dat op elk moment weer intrekken.
      </p>
    </div>
  );
}
