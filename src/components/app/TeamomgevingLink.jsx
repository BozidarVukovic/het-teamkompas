import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { heeftOmgeving } from "../../lib/app/teamomgevingOpslag";

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
  return <Link className="tk-kaart" style={{ display: "block", marginBottom: 20 }} to="/app/teamomgeving"><strong>Onze teamomgeving →</strong><p>Teamdagen, documenten, werkvormen en de verbinding met onze afspraken.</p></Link>;
}
