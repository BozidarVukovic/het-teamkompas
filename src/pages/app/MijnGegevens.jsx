// Mijn gegevens: zien wat er van je bewaard wordt, het meenemen, en het weghalen.
//
// Geen uitzonderingen en geen kleine lettertjes: wat hier staat, is alles.

import { useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import { exporteerEigenGegevens } from "../../lib/app/opslag";

export default function MijnGegevens() {
  const { gebruiker, naam, zetNaam, lidmaatschappen, kenmerken, handleiding, verwijderAlles } = useApp();

  const [nieuweNaam, setNieuweNaam] = useState(naam || "");
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const [bevestig, setBevestig] = useState("");

  const gedeeldeKenmerken = kenmerken.filter((k) => (k.gedeeldMet || []).length > 0).length;
  const geschrevenSecties = Object.values(handleiding).filter((s) => s && s.tekst).length;

  const exporteer = async () => {
    setBezig(true);
    setMelding("");
    try {
      const gegevens = await exporteerEigenGegevens(gebruiker.uid);
      const blob = new Blob([JSON.stringify(gegevens, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mijn-teamkompas-gegevens.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMelding("Je gegevens zijn gedownload.");
    } catch {
      setMelding("Exporteren lukte niet. Probeer het zo nog eens.");
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="tk-inhoud">
      <h1 className="tk-kop">Mijn gegevens</h1>
      <p className="tk-onderkop">
        Je bent ingelogd als {gebruiker && gebruiker.email}. Hieronder staat precies wat er van je
        bewaard wordt.
      </p>

      {melding && <div className="tk-melding tk-melding-goed">{melding}</div>}

      <div className="tk-kaart">
        <h2>Je naam</h2>
        <p>Dit is wat je teamgenoten van je zien.</p>
        <input
          className="tk-invoer"
          value={nieuweNaam}
          onChange={(e) => setNieuweNaam(e.target.value)}
          aria-label="Je naam"
        />
        <div className="tk-knoppen" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="tk-knop tk-knop-klein"
            disabled={bezig || nieuweNaam.trim().length < 2 || nieuweNaam.trim() === naam}
            onClick={async () => {
              setBezig(true);
              try {
                await zetNaam(nieuweNaam.trim());
                setMelding("Je naam is bijgewerkt. Deel je iets, dan gaat de nieuwe naam mee bij de eerstvolgende wijziging.");
              } finally {
                setBezig(false);
              }
            }}
          >
            Naam bewaren
          </button>
        </div>
      </div>

      <div className="tk-kaart">
        <h2>Wat we van je bewaren</h2>
        <div className="tk-rij">
          <span>Je naam en e-mailadres</span>
          <span className="tk-fijn">Voor inloggen en herkenning in je team</span>
        </div>
        <div className="tk-rij">
          <span>{kenmerken.length} ingevulde kenmerken</span>
          <span className="tk-fijn">Privé, tenzij je ze deelt</span>
        </div>
        <div className="tk-rij">
          <span>{geschrevenSecties} stukjes handleiding</span>
          <span className="tk-fijn">Privé, tenzij je ze deelt</span>
        </div>
        <div className="tk-rij">
          <span>{gedeeldeKenmerken} kenmerken gedeeld</span>
          <span className="tk-fijn">Zichtbaar voor de teams die je hebt aangevinkt</span>
        </div>
        <div className="tk-rij">
          <span>{lidmaatschappen.length} {lidmaatschappen.length === 1 ? "team" : "teams"}</span>
          <span className="tk-fijn">Teams zien niets van elkaar</span>
        </div>
        <p className="tk-fijn" style={{ marginTop: 12 }}>
          We bewaren daarnaast dát je advies hebt opgevraagd en of je het bruikbaar vond — nooit
          over wie het ging of wat er stond. Er is geen scoring, geen ranglijst en geen profilering.
        </p>
      </div>

      <div className="tk-kaart">
        <h2>Meenemen</h2>
        <p>Download alles wat er van je bewaard wordt als één bestand.</p>
        <button type="button" className="tk-knop tk-knop-rand tk-knop-klein" onClick={exporteer} disabled={bezig}>
          Mijn gegevens downloaden
        </button>
      </div>

      <div className="tk-kaart">
        <h2>Alles verwijderen</h2>
        <p>
          Hiermee verdwijnt je profiel, je handleiding, alles wat je hebt gedeeld en je
          lidmaatschap van elk team. Dit kan niet ongedaan gemaakt worden.
        </p>
        <label className="tk-label" htmlFor="tk-bevestig">Typ VERWIJDEREN om te bevestigen</label>
        <input
          id="tk-bevestig"
          className="tk-invoer"
          value={bevestig}
          onChange={(e) => setBevestig(e.target.value.toUpperCase())}
          placeholder="VERWIJDEREN"
        />
        <div className="tk-knoppen" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="tk-knop tk-knop-klein tk-knop-gevaar"
            disabled={bevestig !== "VERWIJDEREN" || bezig}
            onClick={async () => {
              setBezig(true);
              try {
                await verwijderAlles();
              } finally {
                setBezig(false);
              }
            }}
          >
            Definitief verwijderen
          </button>
        </div>
      </div>

      <p className="tk-fijn" style={{ marginBottom: 40 }}>
        Vragen over je gegevens? Mail naar info@mijnteamkompas.nl.
      </p>
    </div>
  );
}
