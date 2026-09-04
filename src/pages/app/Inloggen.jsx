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
  const { stuurInloglink, isInloglink, voltooiInloggen, gebruiker } = useApp();
  const navigeer = useNavigate();

  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState("");
  const [vraagEmail, setVraagEmail] = useState(false);
  const [afhandelen, setAfhandelen] = useState(false);
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
      <p className="tk-onderkop">
        Inloggen gaat zonder wachtwoord. Vul je e-mailadres in, dan ontvang je een e-mail met een
        inloglink.
      </p>

      {fout && <div className="tk-melding tk-melding-fout">{fout}</div>}

      {/* Wie hier voor het eerst komt, ziet anders alleen een invoerveld en
          moet maar raden waarvoor hij zich aanmeldt. Dit blok staat vóór het
          formulier, want die vraag komt eerder dan het e-mailadres. */}
      <div className="tk-kaart">
        <h2>Wat je hier kunt doen</h2>
        <ul className="tk-uitleg-lijst">
          <li>
            <strong>Vastleggen hoe jij werkt.</strong> Waar je energie van krijgt, hoe je het liefst
            informatie ontvangt en waar anderen je mee helpen.
          </li>
          <li>
            <strong>Advies vragen over een samenwerking.</strong> Kies een collega en wat er speelt,
            en je ziet waar jullie voorkeuren uiteenlopen en wat daarbij helpt.
          </li>
          <li>
            <strong>Zelf bepalen wat je deelt.</strong> Per onderdeel kies je of je team het ziet,
            en je kunt dat op elk moment weer intrekken.
          </li>
          <li>
            <strong>Eén kleine actie vasthouden.</strong> Je spreekt met jezelf af iets te proberen;
            een maand later vraagt de app er één keer naar.
          </li>
        </ul>
        <p className="tk-fijn" style={{ marginBottom: 0 }}>
          Je hebt een teamcode nodig van iemand uit je team, of je maakt zelf een team aan.
          Aanmelden en de eerste stappen kosten ongeveer tien minuten.
        </p>
      </div>

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

      <p className="tk-fijn">
        Deze omgeving is besloten. Wat je hier invult, is van jou: je bepaalt zelf per onderdeel of
        je het met je team deelt, en je kunt dat op elk moment weer intrekken.
      </p>

      {/* De inlogknop op de site wijst hierheen, want dit is waar de meeste
          mensen moeten zijn. Beheerders zijn met een paar en klikken één keer
          extra. */}
      <p className="tk-fijn">
        Beheer je hier een organisatie? Dan log je in via de{" "}
        <a href="/beheer">beheeromgeving</a>.
      </p>
    </div>
  );
}
