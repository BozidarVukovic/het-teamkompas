// Het accountmenu in de balk.
//
// De balk had drie dingen naast elkaar: het kompas met de merknaam, een
// keuzemenu voor je team en een uitlogknop. Op een telefoon paste dat niet, dus
// viel de merknaam weg -- en wat overbleef was een uitlogknop die even groot in
// beeld stond als de weg naar huis. Uitloggen doe je een paar keer per jaar.
//
// Nu staat er één bol met je initialen. Daarachter zit wat erbij hoort: wie je
// bent, in welk team je werkt, je gegevens, en uitloggen. De balk heeft weer
// ruimte voor de merknaam en voor de paginatitel.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { voornaam } from "../../lib/app/naam";
import Bol from "./Bol";

export default function Accountmenu() {
  const { gebruiker, naam, foto, lidmaatschappen, actiefTeam, kiesTeam, logUit } = useApp();
  const [open, zetOpen] = useState(false);
  const doos = useRef(null);

  // Een menu dat alleen sluit via zijn eigen knop blijft openstaan zodra je
  // ergens anders klikt, en dekt dan de halve pagina af. Buiten klikken en
  // Escape horen het te sluiten -- dat verwacht iedereen van een menu.
  useEffect(() => {
    if (!open) return undefined;

    const buiten = (e) => {
      if (doos.current && !doos.current.contains(e.target)) zetOpen(false);
    };
    const toets = (e) => {
      if (e.key === "Escape") zetOpen(false);
    };

    document.addEventListener("mousedown", buiten);
    document.addEventListener("keydown", toets);
    return () => {
      document.removeEventListener("mousedown", buiten);
      document.removeEventListener("keydown", toets);
    };
  }, [open]);

  const email = (gebruiker && gebruiker.email) || "";
  const kort = voornaam(naam, "Account");
  const teamnaam = (actiefTeam && actiefTeam.teamNaam) || "";

  return (
    <div className="tk-account" ref={doos}>
      <button
        type="button"
        className="tk-accountknop"
        aria-expanded={open}
        aria-label={open ? "Accountmenu sluiten" : "Accountmenu openen"}
        onClick={() => zetOpen((v) => !v)}
      >
        <Bol naam={naam || email} foto={foto} />
        <span className="tk-accountnaam" aria-hidden="true">{kort}</span>
        <svg
          className="tk-accountpijl"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="tk-accountmenu">
          <div className="tk-accountkop">
            <strong>{naam || "Je account"}</strong>
            {email && <span className="tk-fijn">{email}</span>}
          </div>

          {/* Eén team: dan is er niets te kiezen, maar wel iets te weten.
              Meer teams: dan hoort de keuze hier, niet in de balk zelf. */}
          {lidmaatschappen.length > 1 ? (
            <label className="tk-accountveld">
              <span className="tk-label">Je werkt in</span>
              <select
                className="tk-teamkiezer"
                value={actiefTeam ? `${actiefTeam.orgId}/${actiefTeam.teamId}` : ""}
                onChange={(e) => kiesTeam(e.target.value)}
              >
                {lidmaatschappen.map((l) => (
                  <option key={`${l.orgId}/${l.teamId}`} value={`${l.orgId}/${l.teamId}`}>
                    {l.teamNaam || "Team"}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            teamnaam && <p className="tk-accountteam">Je werkt in {teamnaam}</p>
          )}

          <Link className="tk-accountlink" to="/app/gegevens" onClick={() => zetOpen(false)}>
            Mijn gegevens
          </Link>
          <button type="button" className="tk-accountlink" onClick={logUit}>
            Uitloggen
          </button>
        </div>
      )}
    </div>
  );
}
