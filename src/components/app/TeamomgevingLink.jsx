import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { heeftOmgeving } from "../../lib/app/teamomgevingOpslag";

// De ingang naar de teamomgeving.
//
// Dit was een onderstreepte tekstlink in een kaart. Daarmee zag de enige plek
// waar het werk van een heel team samenkomt eruit als een voetnoot -- en op een
// scherm waar verder alleen bollen met voornamen staan, is een blauwe streep
// niet het ding waar je oog naartoe gaat.
//
// De hele kaart is nu de knop. De pil rechts was teal-op-teal-waas, met de
// redenering dat oranje in deze app "hier verandert iets" betekent en dit
// navigeren is. Die regel hield de app zelf niet: .tk-knop is oranje en staat
// tien keer op een <Link> die alleen maar naar een andere pagina gaat. Een
// regel die nergens wordt gevolgd is geen regel, en deze pil las als een
// labeltje in plaats van als de belangrijkste knop op het scherm. Nu dezelfde
// oranje als elke andere hoofdknop, met dezelfde donkere tekst erop (6,3:1).
function Team({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15.5 19.5v-1.6a3.6 3.6 0 0 0-3.6-3.6H6.1a3.6 3.6 0 0 0-3.6 3.6v1.6" />
      <circle cx="9" cy="7.4" r="3.3" />
      <path d="M21.5 19.5v-1.6a3.6 3.6 0 0 0-2.7-3.5" />
      <path d="M15.2 4.3a3.3 3.3 0 0 1 0 6.2" />
    </svg>
  );
}

export default function TeamomgevingLink() {
  const { actiefTeam, gebruiker } = useApp();
  const [zichtbaarVoor, setZichtbaarVoor] = useState("");
  const sleutel = actiefTeam && gebruiker ? `${gebruiker.uid}/${actiefTeam.orgId}/${actiefTeam.teamId}` : "";
  useEffect(() => {
    let geldig = true;
    if (sleutel) heeftOmgeving(actiefTeam).then((ja) => {
      if (geldig) setZichtbaarVoor(ja ? sleutel : "");
    }).catch(() => {
      // Optionele ingang: geen onjuiste teamlink tonen bij ontbrekende toegang.
      if (geldig) setZichtbaarVoor("");
    });
    return () => { geldig = false; };
  }, [sleutel]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!sleutel || zichtbaarVoor !== sleutel) return null;
  const team = actiefTeam.teamNaam ? ` van ${actiefTeam.teamNaam}` : "";
  return (
    <Link className="tk-kaart tk-toegang" to="/app/teamomgeving">
      <span className="tk-toegang-icoon" aria-hidden="true"><Team /></span>
      <span className="tk-toegang-tekst">
        <strong className="tk-toegang-titel">Onze teamomgeving</strong>
        <span className="tk-toegang-uitleg">Afspraken, teamdagen, werkvormen en documenten{team}.</span>
      </span>
      <span className="tk-toegang-actie" aria-hidden="true">
        Openen
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8h10M9 4.2 12.8 8 9 11.8" /></svg>
      </span>
    </Link>
  );
}
