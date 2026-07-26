import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollManager
 *
 * Centrale scrollafhandeling voor de hele site. Hangt één keer in main.jsx
 * binnen de BrowserRouter en regelt drie situaties:
 *
 *  1. Normale navigatie (PUSH / REPLACE) zonder hash  -> pagina opent bovenaan.
 *  2. Navigatie naar een anker, bijvoorbeeld /pagina#faq -> scrollt naar dat onderdeel.
 *  3. Terug- en vooruitknop (POP) -> herstelt de positie waar de bezoeker was.
 *
 * React Router zet de scrollpositie zelf niet terug bij client-side navigatie.
 * Zonder deze component blijft de bezoeker dus op dezelfde hoogte staan.
 *
 * Voeg geen losse window.scrollTo(0, 0) toe in paginacomponenten; dat vecht
 * met de logica hieronder.
 */

// De vaste header is 64px hoog (zie OrganizedNavigation). Extra lucht erbij,
// zodat een ankertitel niet tegen de balk aan plakt.
const HEADER_OFFSET = 80;

// Sleutel waaronder we scrollposities per history-entry bewaren.
const STORAGE_KEY = "tk-scrollposities";

// Content kan vertraagd binnenkomen (markdown-glob, afbeeldingen, Firestore).
// We blijven daarom een aantal frames proberen in plaats van één keer.
const MAX_FRAMES = 20;

function leesPosities() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function schrijfPositie(key, y) {
  if (!key) return;
  try {
    const posities = leesPosities();
    posities[key] = y;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(posities));
  } catch {
    // sessionStorage kan geblokkeerd zijn (privémodus). Dan vervalt alleen
    // het herstellen bij terug/vooruit; de rest blijft werken.
  }
}

/**
 * Springt naar een positie zonder animatie.
 *
 * global.css zet `html { scroll-behavior: smooth }`. Zonder deze override
 * zou elke routewissel een zichtbare scrollanimatie geven. We zetten het
 * gedrag daarom tijdelijk op `auto` in plaats van `behavior: "instant"` mee
 * te geven, omdat oudere Safari-versies die waarde niet accepteren.
 */
function springNaar(y) {
  const root = document.documentElement;
  const vorig = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, y);
  root.style.scrollBehavior = vorig;
}

function zoekAnker(hash) {
  if (!hash || hash.length < 2) return null;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Laat de ruwe waarde staan als decoderen mislukt.
  }
  return (
    document.getElementById(id) ||
    document.querySelector(`[name="${id.replace(/"/g, '\\"')}"]`)
  );
}

// Modals en dialogen mogen hun focus houden.
function dialoogOpen() {
  return Boolean(
    document.querySelector('[aria-modal="true"], [role="dialog"], dialog[open]')
  );
}

/**
 * Verplaatst de focus naar de kop van de nieuwe pagina, zodat schermlezers
 * en toetsenbordgebruikers ook echt bovenaan beginnen. preventScroll voorkomt
 * dat de browser er zelf nog een keer naartoe springt.
 */
function herstelFocus() {
  if (dialoogOpen()) return;

  const doel =
    document.querySelector("main h1, h1") ||
    document.querySelector("main") ||
    document.body;

  if (!doel) return;

  const hadTabIndex = doel.hasAttribute("tabindex");
  if (!hadTabIndex) doel.setAttribute("tabindex", "-1");

  try {
    doel.focus({ preventScroll: true });
  } catch {
    // Sommige browsers ondersteunen preventScroll niet; focus is dan niet
    // kritiek genoeg om er iets voor te forceren.
  }

  if (!hadTabIndex) {
    // Weer weghalen, zodat de kop niet in de reguliere taborder blijft staan.
    doel.addEventListener("blur", () => doel.removeAttribute("tabindex"), {
      once: true,
    });
  }
}

export default function ScrollManager() {
  const { pathname, search, hash, key } = useLocation();
  const navigationType = useNavigationType();

  const frameRef = useRef(null);
  const huidigeYRef = useRef(0);
  const huidigeKeyRef = useRef(key);
  const vorigePadRef = useRef(null);

  /**
   * De positie die we willen bewaren.
   *
   * window.scrollY is doorgaans de waarheid, maar wordt door de browser
   * afgekapt zodra de nieuwe pagina korter is dan de vorige. De meegelezen
   * waarde uit de scroll-listener is dan nauwkeuriger. De hoogste van de twee
   * is daarom de veiligste keuze: bij gewoon omhoog scrollen zijn ze gelijk.
   */
  const huidigePositie = () => Math.max(window.scrollY || 0, huidigeYRef.current || 0);

  // Native scroll-restoration uitzetten: we doen het zelf, omdat de browser
  // bij een SPA probeert te herstellen voordat de nieuwe content bestaat.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return undefined;
    const vorig = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = vorig;
    };
  }, []);

  // Live de scrollpositie bijhouden. We lezen window.scrollY niet pas bij het
  // verlaten van de pagina, omdat de browser die waarde dan al kan hebben
  // afgekapt op de hoogte van de nieuwe pagina.
  useEffect(() => {
    let wachtendFrame = null;

    const onScroll = () => {
      if (wachtendFrame !== null) return;
      wachtendFrame = window.requestAnimationFrame(() => {
        wachtendFrame = null;
        huidigeYRef.current = window.scrollY;
      });
    };

    const bewaar = () => schrijfPositie(huidigeKeyRef.current, huidigePositie());

    huidigeYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", bewaar);

    return () => {
      if (wachtendFrame !== null) window.cancelAnimationFrame(wachtendFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", bewaar);
    };
  }, []);

  useEffect(() => {
    // Positie van de history-entry die we verlaten vastleggen.
    if (huidigeKeyRef.current !== key) {
      schrijfPositie(huidigeKeyRef.current, huidigePositie());
      huidigeKeyRef.current = key;
      huidigeYRef.current = 0;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const pad = `${pathname}${search}`;
    const zelfdePagina = vorigePadRef.current === pad;
    vorigePadRef.current = pad;

    const probeer = (stap) => {
      let pogingen = 0;
      const loop = () => {
        if (stap()) return;
        pogingen += 1;
        if (pogingen < MAX_FRAMES) {
          frameRef.current = window.requestAnimationFrame(loop);
        }
      };
      frameRef.current = window.requestAnimationFrame(loop);
    };

    // 1. Anker heeft altijd voorrang: de bezoeker vroeg om een specifiek deel.
    if (hash) {
      probeer(() => {
        const el = zoekAnker(hash);
        if (!el) return false;

        const top = Math.max(
          el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
          0
        );

        if (zelfdePagina) {
          // Binnen dezelfde pagina voelt meescrollen natuurlijker.
          window.scrollTo({ top, behavior: "smooth" });
        } else {
          springNaar(top);
        }
        return true;
      });
      return undefined;
    }

    // 2. Terug of vooruit: breng de bezoeker terug waar hij was.
    if (navigationType === "POP") {
      const bewaardeY = leesPosities()[key];
      if (typeof bewaardeY === "number" && bewaardeY > 0) {
        probeer(() => {
          springNaar(bewaardeY);
          // De pagina kan nog groeien terwijl content inlaadt. Pas als de
          // gewenste hoogte echt haalbaar is, zijn we klaar.
          return Math.abs(window.scrollY - bewaardeY) <= 2;
        });
        return undefined;
      }
      springNaar(0);
      return undefined;
    }

    // 3. Normale navigatie: bovenaan beginnen.
    springNaar(0);
    if (!zelfdePagina) herstelFocus();
    return undefined;
  }, [pathname, search, hash, key, navigationType]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    },
    []
  );

  return null;
}
