// De twee ingangen van de samenwerkingstool.
//
// De eerste begint bij een collega: je kiest iemand en krijgt advies over het
// samenwerken met die persoon. De tweede begint bij een taak: je beschrijft
// waar je vastloopt en de app kijkt wie daarbij zou kunnen helpen.
//
// Staat op allebei de schermen, zodat je altijd ziet welke ingang je gebruikt
// en met één tik naar de andere kunt. Geen nieuw menu-item: in de balk staat
// "Samenwerken", en dit zijn twee manieren om daaraan te beginnen.

import { NavLink } from "react-router-dom";

export default function IngangKeuze() {
  return (
    <nav className="tk-ingangen" aria-label="Hoe wil je beginnen?">
      <NavLink to="/app/samenwerken" end className={({ isActive }) => (isActive ? "tk-ingang actief" : "tk-ingang")}>
        <span className="tk-ingang-kop">Ik wil samenwerken met een collega</span>
        <span className="tk-ingang-uitleg">Kies iemand, krijg advies over jullie samenwerking.</span>
      </NavLink>
      <NavLink to="/app/hulp" className={({ isActive }) => (isActive ? "tk-ingang actief" : "tk-ingang")}>
        <span className="tk-ingang-kop">Ik zoek hulp bij een taak</span>
        <span className="tk-ingang-uitleg">Beschrijf waar je vastloopt, zie wie kan helpen.</span>
      </NavLink>
    </nav>
  );
}
