// De navigatie van de app — één lijst, twee verschijningsvormen.
//
// Op een breed scherm staat het menu boven aan de pagina. Op een telefoon staat
// het onderaan, binnen duimbereik, en blijft het staan tijdens het scrollen.
// Beide komen uit dezelfde ONDERDELEN-lijst, zodat er nooit twee menu's kunnen
// ontstaan die iets anders zeggen.
//
// Welke onderdelen er zijn en wanneer er één oplicht, staat in navigatie.js.
// Hier staat alleen hoe ze eruitzien.

import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../../lib/app/AppContext";
import { bepaalVoortgang } from "../../lib/app/voortgang";
import { ONDERDELEN, isActief } from "../../lib/app/navigatie";

const streep = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function Doos({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" {...streep}>
      {children}
    </svg>
  );
}

const ICONEN = {
  start: (
    <Doos>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M15.8 8.2 13.9 14 8.2 15.8 10.1 10z" />
    </Doos>
  ),
  samenwerken: (
    <Doos>
      <path d="M13.5 9.2a1.8 1.8 0 0 1-1.8 1.8H6.2L2.6 14.5V4.4a1.8 1.8 0 0 1 1.8-1.8h7.3a1.8 1.8 0 0 1 1.8 1.8z" />
      <path d="M17.4 9.2h2.2a1.8 1.8 0 0 1 1.8 1.8v10.1l-3.6-3.5h-5.5a1.8 1.8 0 0 1-1.8-1.8v-1" />
    </Doos>
  ),
  team: (
    <Doos>
      <path d="M15.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.3a3.7 3.7 0 0 0-3.7 3.7v1.8" />
      <circle cx="9" cy="7.3" r="3.7" />
      <path d="M21.4 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.6" />
      <path d="M15.8 3.8a3.7 3.7 0 0 1 0 7.1" />
    </Doos>
  ),
  ik: (
    <Doos>
      <path d="M18.5 20.5v-1.9a3.8 3.8 0 0 0-3.8-3.8H9.3a3.8 3.8 0 0 0-3.8 3.8v1.9" />
      <circle cx="12" cy="7.2" r="3.8" />
    </Doos>
  ),
};

export default function Navigatie() {
  const locatie = useLocation();
  const { kenmerken, actiefTeam, handleiding, ikBegeleid } = useApp();
  const voortgang = bepaalVoortgang({ kenmerken, actiefTeam, handleiding, ikBegeleid });

  // Eén stipje bij "Ik" zolang je profiel nog niet af is. Geen getal, geen
  // uitroepteken: het wijst waar nog iets ligt zonder erop te hameren.
  const stip = !voortgang.compleet;

  const items = ONDERDELEN.map((o) => {
    const actief = isActief(o, locatie.pathname);
    return (
      <NavLink
        key={o.id}
        to={o.pad}
        end={o.exact}
        className={actief ? "actief" : undefined}
        aria-current={actief ? "page" : undefined}
      >
        <span className="tk-nav-icoon">
          {ICONEN[o.id]}
          {o.id === "ik" && stip && <i className="tk-nav-stip" aria-hidden="true" />}
        </span>
        <span className="tk-nav-tekst">{o.label}</span>
      </NavLink>
    );
  });

  return (
    <>
      <nav className="tk-menu" aria-label="Onderdelen">
        {items}
      </nav>
      <nav className="tk-onderbalk" aria-label="Onderdelen">
        {items}
      </nav>
    </>
  );
}
