// De paginatitel in de balk, zodra hij zelf uit beeld is.
//
// Op elke pagina kost de bovenkant ruimte aan de app: logobalk, menubalk,
// kruimelpad, titel. Scroll je naar de inhoud, dan blijven de twee balken
// staan en verdwijnt juist het enige dat zegt waar je bent. Wat er dan in beeld
// staat is meer app dan onderwerp.
//
// Dit onderdeel zoekt de <h1> van de pagina op en houdt in de gaten of hij nog
// zichtbaar is. Zakt hij onder de balken, dan verschijnt zijn tekst in de balk;
// scroll je terug, dan verdwijnt hij weer.
//
// Waarom het de kop opzoekt in plaats van dat elke pagina zich aanmeldt: er
// zijn vijftien koppen verdeeld over twaalf bestanden, en een pagina die
// vergeet zich aan te melden geeft geen foutmelding maar een balk die stil
// leeg blijft. Zo werkt het overal, ook op een pagina die er nog niet is. Is er
// geen kop, dan gebeurt er niets -- dat is de juiste uitkomst, geen storing.
//
// De MutationObserver is er omdat de kop er niet altijd meteen staat: de
// teamomgeving haalt zijn titel uit Firestore en toont tot die tijd "Even
// laden...". Zonder zou de balk op precies die pagina leeg blijven.
//
// aria-hidden, want de echte kop staat gewoon in de pagina. Een schermlezer
// die hier de titel nog een keer voorleest, leest iets voor wat er visueel bij
// hoort en inhoudelijk niet.

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { titelTekst, kortTitel, chroomHoogte } from "../../lib/app/balktitel";

export default function Balktitel() {
  const { pathname } = useLocation();
  const [titel, setTitel] = useState("");

  useEffect(() => {
    setTitel("");
    const wortel = document.querySelector(".tk-app");
    if (!wortel || typeof IntersectionObserver !== "function") return undefined;

    let kop = null;
    let kijker = null;
    let gepland = 0;

    function kijk() {
      if (kijker) kijker.disconnect();
      if (!kop) return;
      const hoog = chroomHoogte(
        document.querySelector(".tk-balk"),
        document.querySelector(".tk-menu"),
      );
      kijker = new IntersectionObserver(
        ([regel]) => setTitel(regel && regel.isIntersecting ? "" : titelTekst(kop)),
        { rootMargin: `-${hoog}px 0px 0px 0px`, threshold: 0 },
      );
      kijker.observe(kop);
    }

    function volg() {
      const gevonden = wortel.querySelector("h1");
      if (gevonden === kop) return;
      kop = gevonden;
      if (!kop) {
        if (kijker) kijker.disconnect();
        setTitel("");
        return;
      }
      kijk();
    }

    // Bij het draaien van een telefoon verandert de hoogte van de balken, en
    // daarmee het punt waarop de kop eronder verdwijnt.
    function bijMaat() {
      if (gepland) return;
      gepland = window.requestAnimationFrame(() => {
        gepland = 0;
        kijk();
      });
    }

    volg();
    const muteer = new MutationObserver(volg);
    muteer.observe(wortel, { childList: true, subtree: true });
    window.addEventListener("resize", bijMaat);

    return () => {
      muteer.disconnect();
      if (kijker) kijker.disconnect();
      if (gepland) window.cancelAnimationFrame(gepland);
      window.removeEventListener("resize", bijMaat);
    };
  }, [pathname]);

  if (!titel) return null;
  return <span className="tk-balktitel" aria-hidden="true">{kortTitel(titel)}</span>;
}
