// Mijn gegevens: zien wat er van je bewaard wordt, het meenemen, en het weghalen.
//
// Geen uitzonderingen en geen kleine lettertjes: wat hier staat, is alles.

import { useState } from "react";
import { useApp } from "../../lib/app/AppContext";
import { exporteerEigenGegevens } from "../../lib/app/opslag";

export default function MijnGegevens() {
  const { gebruiker, naam, functie, zetProfielgegevens, lidmaatschappen, kenmerken, handleiding, verwijderAlles } =
    useApp();

  const [nieuweNaam, setNieuweNaam] = useState(naam || "");
  const [nieuweFunctie, setNieuweFunctie] = useState(functie || "");
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState("");
  const [bevestig, setBevestig] = useState("");

  // Bewaren mag pas als er echt iets veranderd is, en een naam is verplicht.
  const naamKlaar = nieuweNaam.trim().length >= 2;
  const ietsGewijzigd =
    naamKlaar && (nieuweNaam.trim() !== naam || nieuweFunctie.trim() !== functie);

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
        <h2>Naam en functie</h2>
        <p>Dit is wat je teamgenoten van je zien.</p>

        <label className="tk-label" htmlFor="tk-naam">Je naam</label>
        <input
          id="tk-naam"
          className="tk-invoer"
          value={nieuweNaam}
          onChange={(e) => setNieuweNaam(e.target.value)}
          placeholder="Voornaam"
        />

        <label className="tk-label" htmlFor="tk-functie" style={{ marginTop: 14 }}>
          Je functie <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optioneel)</span>
        </label>
        <input
          id="tk-functie"
          className="tk-invoer"
          value={nieuweFunctie}
          onChange={(e) => setNieuweFunctie(e.target.value)}
          placeholder="Bijvoorbeeld: teamleider, adviseur, projectleider"
          maxLength={60}
        />
        <p className="tk-fijn" style={{ marginTop: 8 }}>
          Je functie helpt teamgenoten plaatsen vanuit welke rol je meedoet. Hij speelt geen rol in
          het advies: dat gaat over hoe jullie samenwerken, niet over wie boven wie staat. Laat hem
          leeg als je liever niets invult, en haal hem later gerust weer weg.
        </p>

        <div className="tk-knoppen" style={{ marginTop: 14 }}>
          <button
            type="button"
            className="tk-knop tk-knop-klein"
            disabled={bezig || !ietsGewijzigd}
            onClick={async () => {
              setBezig(true);
              try {
                await zetProfielgegevens({
                  naam: nieuweNaam.trim(),
                  functie: nieuweFunctie.trim(),
                });
                setMelding("Je gegevens zijn bijgewerkt. Je teamgenoten zien dit meteen.");
              } finally {
                setBezig(false);
              }
            }}
          >
            Bewaren
          </button>
        </div>
      </div>

      <div className="tk-kaart">
        <h2>Wat we van je bewaren</h2>
        <div className="tk-rij">
          <span>Je naam{functie ? ", functie" : ""} en e-mailadres</span>
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
        <div className="tk-rij">
          <span>Je adviessessies</span>
          <span className="tk-fijn">Welke situatie, en of het hielp</span>
        </div>
        <p className="tk-fijn" style={{ marginTop: 12 }}>
          Van een adviessessie bewaren we dát je advies hebt opgevraagd, bij welke situatie, en of
          je het bruikbaar vond — nooit over wie het ging of wat er stond. Vond je een advies niet
          bruikbaar, dan kun je er één zin bij schrijven; die lezen de makers van de app om het
          advies te verbeteren. Je teamgenoten en je beheerder zien daar niets van. Er is geen
          scoring, geen ranglijst en geen profilering.
        </p>
        <p className="tk-fijn">
          Staat er een profielvoorstel voor je klaar dat een facilitator heeft neergezet, dan hoort
          dat er ook bij. Het zit in je download en verdwijnt mee als je alles verwijdert.
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
