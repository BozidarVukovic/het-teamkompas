// Inloggen met een inloglink per e-mail. Geen wachtwoord, dus ook niets te lekken.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import KompasDot from "../../components/shared/KompasDot";

/**
 * Vertaalt een Firebase-foutcode naar iets waar iemand wat aan heeft.
 *
 * Belangrijk onderscheid: een verlopen of al gebruikte inloglink is iets heel
 * anders dan een verkeerd e-mailadres. Beide dezelfde melding geven stuurt
 * mensen de verkeerde kant op — dan gaan ze hun adres controleren terwijl ze
 * een nieuwe link nodig hebben.
 */
function foutmelding(err) {
  const code = (err && err.code) || "";
  if (code === "auth/invalid-email") {
    return { tekst: "Dat lijkt geen geldig e-mailadres.", nieuweLink: false };
  }
  if (code === "auth/invalid-action-code" || code === "auth/expired-action-code") {
    return {
      tekst:
        "Deze inloglink is niet meer geldig. Een inloglink werkt één keer en verloopt na korte tijd. Vraag hieronder een nieuwe aan.",
      nieuweLink: true,
    };
  }
  if (code === "auth/user-disabled") {
    return { tekst: "Dit account is geblokkeerd.", nieuweLink: false };
  }
  if (code === "auth/network-request-failed") {
    return { tekst: "Er is even geen verbinding. Probeer het zo nog eens.", nieuweLink: false };
  }
  return {
    tekst: "Inloggen is niet gelukt. Vraag hieronder een nieuwe inloglink aan.",
    nieuweLink: true,
  };
}

export default function Inloggen() {
  const { stuurInloglink, isInloglink, voltooiInloggen, gebruiker, uitnodigingscode } = useApp();
  const navigeer = useNavigate();

  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState("");
  const [vraagEmail, setVraagEmail] = useState(false);
  const [afhandelen, setAfhandelen] = useState(false);
  const [toonUitleg, setToonUitleg] = useState(false);
  const alGeprobeerd = useRef(false);

  useEffect(() => {
    if (!isInloglink() || alGeprobeerd.current) return;
    alGeprobeerd.current = true;
    setAfhandelen(true);
    voltooiInloggen()
      .then((uitkomst) => {
        if (uitkomst.nodig === "email") {
          setVraagEmail(true);
          setAfhandelen(false);
          return;
        }
        navigeer("/app", { replace: true });
      })
      .catch((err) => {
        // Een inloglink is eenmalig. Ben je al ingelogd, dan is dit geen fout
        // maar een herhaalde klik of een verversing van de pagina.
        if (gebruiker) {
          navigeer("/app", { replace: true });
          return;
        }
        setFout(foutmelding(err).tekst);
        setAfhandelen(false);
      });
  }, [isInloglink, voltooiInloggen, navigeer, gebruiker]);

  useEffect(() => {
    if (gebruiker && !afhandelen) navigeer("/app", { replace: true });
  }, [gebruiker, afhandelen, navigeer]);

  // Een aanmeldscherm mag nooit eindeloos blijven draaien. Duurt het te lang,
  // dan zeggen we dat gewoon en bieden we een nieuwe inloglink aan.
  useEffect(() => {
    if (!afhandelen) return undefined;
    const teLang = setTimeout(() => {
      setAfhandelen(false);
      setFout("Inloggen duurde te lang. Vraag hieronder een nieuwe inloglink aan.");
    }, 15000);
    return () => clearTimeout(teLang);
  }, [afhandelen]);

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
    } catch (err) {
      setFout(foutmelding(err).tekst);
      if (foutmelding(err).nieuweLink) setVraagEmail(false);
    } finally {
      setBezig(false);
    }
  };

  if (afhandelen) {
    return (
      <div className="tk-inhoud tk-smal" style={{ paddingTop: 70, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <KompasDot size={30} />
        </div>
        <p className="tk-onderkop">Je wordt aangemeld...</p>
      </div>
    );
  }

  if (vraagEmail) {
    return (
      <div className="tk-inhoud tk-smal" style={{ paddingTop: 60 }}>
        <h1 className="tk-kop">Nog even je e-mailadres</h1>
        <p className="tk-onderkop">
          Je opent de inloglink op een ander apparaat dan waar je hem hebt aangevraagd. Vul je
          e-mailadres in, dan controleren we of de link bij jou hoort.
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
            <button
              type="button"
              className="tk-knop tk-knop-rand tk-knop-klein"
              onClick={() => {
                setVraagEmail(false);
                setFout("");
                alGeprobeerd.current = true;
                window.history.replaceState({}, "", "/app/inloggen");
              }}
            >
              Nieuwe inloglink aanvragen
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
      {/* Eén regel, en die verandert mee met wat we van iemand weten. Kwam hij
          via een uitnodiging, dan hoeft er niets uitgelegd te worden. */}
      <p className="tk-onderkop">
        {uitnodigingscode
          ? "Je bent uitgenodigd voor een team. Vul je e-mailadres in, dan ontvang je een inloglink. Een wachtwoord heb je niet nodig."
          : "Vul je e-mailadres in, dan ontvang je een inloglink. Een wachtwoord heb je niet nodig."}
      </p>

      {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}

      {verstuurd ? (
        <div className="tk-kaart">
          <h2>Kijk in je mail</h2>
          <p>
            We hebben een inloglink gestuurd naar <strong>{email}</strong>. Open die op dit
            apparaat, dan ben je meteen ingelogd.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>Niets ontvangen?</strong> Kijk bij ongewenste berichten of spam — de eerste mail
            komt daar vaak terecht. Markeer hem als "geen ongewenste e-mail", dan gaat het de
            volgende keer vanzelf goed.
          </p>
          {!uitnodigingscode && (
            <p className="tk-fijn" style={{ marginBottom: 12 }}>
              Blijft het stil en heb je hier nog nooit ingelogd? Dan is dit adres nog niet
              uitgenodigd. Open de link uit de uitnodiging van je team, of vraag die op bij degene
              die het team beheert.
            </p>
          )}
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
              {bezig ? "Versturen..." : "Stuur mij een inloglink"}
            </button>
          </div>
        </form>
      )}

      {/* De uitleg staat ná het formulier en ingeklapt. Wie terugkomt zoekt het
          invulveld en niets anders; wie hier voor het eerst is, klapt open. Zo
          hoeft de belangrijkste knop niet onder de vouw te verdwijnen. */}
      <button
        type="button"
        className="tk-uitklap"
        aria-expanded={toonUitleg}
        onClick={() => setToonUitleg((t) => !t)}
      >
        <span className="tk-optie-pijl" aria-hidden="true">›</span> Wat kun je hier doen?
      </button>

      {toonUitleg && (
        <ul className="tk-uitleg-lijst" style={{ marginTop: 10 }}>
          <li>Vastleggen hoe jij werkt en waar anderen je mee helpen.</li>
          <li>Advies vragen over de samenwerking met een collega.</li>
          <li>Zelf bepalen wat je met je team deelt, en dat weer intrekken.</li>
          <li>Eén kleine actie een maand vasthouden.</li>
          {/* Zelf een team beginnen kan alleen vanaf de begeleiderslijst, dus
              dat staat hier niet meer. Voor wie dit scherm leest is de teamcode
              de enige weg naar binnen. */}
          <li>Je hebt een teamcode nodig van iemand uit je team.</li>
        </ul>
      )}

      <p className="tk-fijn" style={{ marginTop: 18 }}>
        Deze omgeving is besloten en werkt op uitnodiging. Wat je invult is van jou.{" "}
        {/* De inlogknop op de site wijst hierheen, want dit is waar de meeste
            mensen moeten zijn. Beheerders zijn met een paar en klikken één keer
            extra. */}
        Beheer je een organisatie? Log dan in via de <a href="/beheer">beheeromgeving</a>.
      </p>
    </div>
  );
}
