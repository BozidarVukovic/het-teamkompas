import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { SITUATIES, situatie as zoekSituatie, stappenVoor } from "../../data/gespreksvoorbereider/situaties";
import { stap as stapDefinitie } from "../../data/gespreksvoorbereider/stappen";
import { INTRO_UITLEG, PRIVACY_UITLEG, VEILIGHEID_DISCLAIMER } from "../../data/gespreksvoorbereider/teksten";
import { stelFormatSamen } from "../../lib/gespreksvoorbereider/format";
import { valideerStap } from "../../lib/gespreksvoorbereider/validatie";
import { beoordeelVeiligheid } from "../../lib/gespreksvoorbereider/veiligheid";
import {
  bewaarAntwoorden, bewaarReflectie, heeftOpslag, leesAntwoorden, leesReflectie, wisAlles,
} from "../../lib/gespreksvoorbereider/opslag";
import { trackEvent } from "../../lib/analytics";
import StapVeld from "../../components/gespreksvoorbereider/StapVeld";
import Veiligheidscheck from "../../components/gespreksvoorbereider/Veiligheidscheck";
import Resultaat from "../../components/gespreksvoorbereider/Resultaat";
import Reflectie from "../../components/gespreksvoorbereider/Reflectie";
import "../../styles/gespreksvoorbereider.css";

const CANONICAL = "https://www.mijnteamkompas.nl/gespreksvoorbereider";
const LEEG = { situatie: "", veiligheid: {} };

/** Is er nog niets ingevuld? Dan valt er ook niets te bewaren. */
export function isLeeg(antwoorden = {}) {
  if (antwoorden.situatie) return false;
  return Object.entries(antwoorden).every(([sleutel, waarde]) => {
    if (sleutel === "situatie") return true;
    if (waarde === null || waarde === undefined || waarde === "") return true;
    if (Array.isArray(waarde)) return waarde.length === 0;
    if (typeof waarde === "object") return Object.keys(waarde).length === 0;
    return false;
  });
}

/**
 * De gespreksvoorbereider.
 *
 * Alle antwoorden blijven in de browser: in React-state tijdens het invullen en
 * in localStorage om terug te kunnen komen. Er gaat niets naar een server en
 * niets naar analytics. De url blijft leeg, zodat er nooit per ongeluk
 * gespreksinhoud in een gedeelde link belandt.
 */
export default function Gespreksvoorbereider() {
  const [params] = useSearchParams();
  const [antwoorden, setAntwoorden] = useState(() => {
    const bewaard = leesAntwoorden();
    return { ...LEEG, ...bewaard };
  });
  const [reflectie, setReflectie] = useState(() => leesReflectie());
  const [fase, setFase] = useState(() => (leesAntwoorden().situatie ? "hervat" : "start"));
  const [stapIndex, setStapIndex] = useState(0);
  const [fouten, setFouten] = useState({});
  const [doorgaanNaRisico, setDoorgaanNaRisico] = useState(false);
  const [opslagAanwezig, setOpslagAanwezig] = useState(() => heeftOpslag());
  const kopRef = useRef(null);
  const eersteRender = useRef(true);

  const route = useMemo(() => stappenVoor(antwoorden.situatie), [antwoorden.situatie]);
  const huidigeSituatie = zoekSituatie(antwoorden.situatie);
  const huidigeStapId = route[stapIndex];
  const huidigeStap = huidigeStapId ? stapDefinitie(huidigeStapId, antwoorden.situatie) : null;
  const format = useMemo(() => stelFormatSamen(antwoorden), [antwoorden]);
  const accent = huidigeSituatie ? huidigeSituatie.kleur : "var(--tk-color-teal)";

  // Tussentijds bewaren, zodat een gesloten tabblad geen werk kost. Een lege
  // voorbereiding schrijven we niet weg: anders zou de wisknop meteen weer een
  // nieuwe, lege regel in de opslag zetten.
  useEffect(() => {
    if (!isLeeg(antwoorden)) bewaarAntwoorden(antwoorden);
    setOpslagAanwezig(heeftOpslag());
  }, [antwoorden]);

  useEffect(() => {
    if (Object.keys(reflectie).length > 0) bewaarReflectie(reflectie);
    setOpslagAanwezig(heeftOpslag());
  }, [reflectie]);

  // Een situatie in de link vult alleen de keuze voor. Er staat nooit
  // gespreksinhoud in de url.
  useEffect(() => {
    const gevraagd = params.get("situatie");
    if (gevraagd && zoekSituatie(gevraagd) && !leesAntwoorden().situatie) kiesSituatie(gevraagd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bij een nieuwe stap gaat de focus naar de vraag, zodat schermlezers en
  // toetsenbordgebruikers meelopen met de route.
  useEffect(() => {
    if (eersteRender.current) {
      eersteRender.current = false;
      return;
    }
    kopRef.current?.focus();
  }, [fase, stapIndex]);

  function wijzig(veld, waarde) {
    setAntwoorden((vorig) => ({ ...vorig, [veld]: waarde }));
    setFouten((vorige) => {
      if (!Object.keys(vorige).length) return vorige;
      const bij = { ...vorige };
      delete bij[veld];
      Object.keys(bij).forEach((sleutel) => {
        if (sleutel.startsWith(veld + ".")) delete bij[sleutel];
      });
      return bij;
    });
  }

  function wijzigVeiligheid(veld, waarde) {
    setAntwoorden((vorig) => ({ ...vorig, veiligheid: { ...(vorig.veiligheid || {}), [veld]: waarde } }));
  }

  function kiesSituatie(id) {
    const gekozen = zoekSituatie(id);
    if (!gekozen) return;
    trackEvent("gespreksvoorbereider_gestart");
    // Bij onveilig gedrag sturen we bewust geen kenmerk mee. Dat is een
    // gevoelige keuze en die hoort niet in een meetsysteem thuis.
    trackEvent("gespreksvoorbereider_situatie_gekozen", gekozen.veiligheidscheck ? {} : { situatie: id });
    setAntwoorden((vorig) => ({ ...vorig, situatie: id }));
    setStapIndex(0);
    setFouten({});
    setDoorgaanNaRisico(false);
    setFase(gekozen.veiligheidscheck ? "veiligheid" : "stappen");
  }

  function volgende() {
    const uitkomst = valideerStap(huidigeStapId, antwoorden, antwoorden.situatie);
    if (!uitkomst.geldig) {
      setFouten(uitkomst.fouten);
      kopRef.current?.focus();
      return;
    }
    setFouten({});
    if (stapIndex < route.length - 1) {
      setStapIndex(stapIndex + 1);
    } else {
      trackEvent("gespreksvoorbereider_afgerond");
      setFase("resultaat");
    }
  }

  function vorige() {
    setFouten({});
    if (stapIndex > 0) setStapIndex(stapIndex - 1);
    else if (huidigeSituatie && huidigeSituatie.veiligheidscheck) setFase("veiligheid");
    else setFase("start");
  }

  function opnieuw() {
    setAntwoorden({ ...LEEG });
    setReflectie({});
    setStapIndex(0);
    setFouten({});
    setDoorgaanNaRisico(false);
    setFase("start");
  }

  function wissen() {
    wisAlles();
    setOpslagAanwezig(false);
    opnieuw();
  }

  function afdrukken() {
    trackEvent("gespreksvoorbereider_afdrukken");
    window.print();
  }

  const kop = (tekst) => <h2 tabIndex={-1} ref={kopRef}>{tekst}</h2>;

  return (
    <div className="gv-page" style={{ "--gv-accent": accent }}>
      <Helmet>
        <title>Gespreksvoorbereider: een lastig gesprek voorbereiden | Mijn Teamkompas</title>
        <meta name="description" content="Bereid een lastig of belangrijk gesprek stap voor stap voor. Je schrijft zelf, de website zet je antwoorden in een vast gespreksformat. Zonder AI, alles blijft op je eigen apparaat." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="nl_NL" />
        <meta property="og:site_name" content="Mijn Teamkompas" />
        <meta property="og:title" content="Gespreksvoorbereider | Mijn Teamkompas" />
        <meta property="og:description" content="Bereid een lastig of belangrijk gesprek stap voor stap voor, met een vast gespreksformat en zonder AI." />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content="https://www.mijnteamkompas.nl/teamkompas-samen-richting.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Gespreksvoorbereider",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: CANONICAL,
          inLanguage: "nl-NL",
          description: "Bereid een lastig of belangrijk gesprek voor via een vaste route: waarneming, effect, perspectief van de ander, gezamenlijk belang en een concrete afspraak.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          publisher: { "@type": "Organization", name: "Mijn Teamkompas" },
        })}</script>
      </Helmet>

      <header className="gv-hero">
        <div className="gv-container">
          <p className="gv-eyebrow">Gespreksvoorbereider</p>
          <h1>Een lastig gesprek begint bij een goede voorbereiding</h1>
          <p>{INTRO_UITLEG}</p>
        </div>
      </header>

      <main className="gv-sectie">
        <div className="gv-smal">

          {/* ── Hervatten ───────────────────────────────────────────────── */}
          {fase === "hervat" && (
            <div className="gv-kaart">
              {kop("Je hebt hier eerder aan gewerkt")}
              <p className="gv-uitleg">
                Er staat nog een voorbereiding op dit apparaat
                {huidigeSituatie ? " voor: " + huidigeSituatie.label.toLowerCase() + "." : "."}
                {" "}Je kunt verder waar je gebleven was, of opnieuw beginnen.
              </p>
              <div className="gv-acties">
                <button type="button" className="gv-knop gv-knop--primair" onClick={() => setFase("resultaat")}>Bekijk mijn voorbereiding</button>
                <button type="button" className="gv-knop gv-knop--secundair" onClick={() => { setStapIndex(0); setFase("stappen"); }}>Verder invullen</button>
                <span className="gv-spacer" />
                <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={opnieuw}>Opnieuw beginnen</button>
              </div>
            </div>
          )}

          {/* ── Situatie kiezen ─────────────────────────────────────────── */}
          {fase === "start" && (
            <>
              <div className="gv-kaart">
                {kop("Welk gesprek wil je voorbereiden?")}
                <p className="gv-uitleg">
                  Kies de situatie die het dichtst bij komt. Elke route stelt andere vragen, omdat een
                  teamafspraak evalueren iets anders vraagt dan feedback vragen.
                </p>
                <ul className="gv-situaties">
                  {SITUATIES.map((optie) => (
                    <li key={optie.id}>
                      <button
                        type="button"
                        className="gv-situatie"
                        style={{ "--gv-accent": optie.kleur }}
                        onClick={() => kiesSituatie(optie.id)}
                      >
                        <span className="gv-situatie-icoon" aria-hidden="true">{optie.icoon}</span>
                        <span>
                          <strong>{optie.label}</strong>
                          <span>{optie.uitleg}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="gv-opslag">
                <h3>Wat er met je antwoorden gebeurt</h3>
                <p>{PRIVACY_UITLEG}</p>
                <p style={{ marginTop: 10 }}>{VEILIGHEID_DISCLAIMER}</p>
                {opslagAanwezig && (
                  <div className="gv-opslag-acties">
                    <button type="button" className="gv-knop gv-knop--secundair gv-knop--klein" onClick={wissen}>Alles op dit apparaat wissen</button>
                  </div>
                )}
                <div className="gv-opslag-acties">
                  <Link className="gv-knop gv-knop--secundair gv-knop--klein" to="/kennisbank?type=gespreksvoorbereider">Leesvoorbereidingen in de kennisbank</Link>
                </div>
              </div>
            </>
          )}

          {/* ── Veiligheidscheck ────────────────────────────────────────── */}
          {fase === "veiligheid" && (
            <Veiligheidscheck
              antwoorden={antwoorden.veiligheid || {}}
              onWijzig={wijzigVeiligheid}
              onTerug={() => setFase("start")}
              onDoorgaan={() => {
                const oordeel = beoordeelVeiligheid(antwoorden.veiligheid || {});
                if (oordeel.risico) setDoorgaanNaRisico(true);
                setStapIndex(0);
                setFase("stappen");
              }}
            />
          )}

          {/* ── De stappen ──────────────────────────────────────────────── */}
          {fase === "stappen" && huidigeStap && (
            <div className="gv-kaart">
              <div className="gv-voortgang">
                <p>
                  <span>Stap <b>{stapIndex + 1}</b> van <b>{route.length}</b></span>
                  {huidigeSituatie && <span>{huidigeSituatie.label}</span>}
                </p>
                <div
                  className="gv-voortgang-balk"
                  role="progressbar"
                  aria-valuenow={stapIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={route.length}
                  aria-label={"Stap " + (stapIndex + 1) + " van " + route.length}
                >
                  <i style={{ width: Math.round(((stapIndex + 1) / route.length) * 100) + "%" }} />
                </div>
              </div>

              {kop(huidigeStap.vraag)}
              <p className="gv-uitleg">{huidigeStap.uitleg}</p>

              {doorgaanNaRisico && stapIndex === 0 && (
                <div className="gv-melding" role="status">
                  <p style={{ margin: 0 }}>
                    Je gaf aan dat hier ondersteuning bij past. Deze voorbereiding kun je ook gebruiken voor het
                    gesprek met een leidinggevende, HR-adviseur of vertrouwenspersoon.
                  </p>
                </div>
              )}

              <StapVeld stapDef={huidigeStap} antwoorden={antwoorden} fouten={fouten} onWijzig={wijzig} />

              <div className="gv-acties">
                <button type="button" className="gv-knop gv-knop--secundair" onClick={vorige}>
                  {stapIndex > 0 ? "← Vorige stap" : "← Andere situatie"}
                </button>
                <span className="gv-spacer" />
                <button type="button" className="gv-knop gv-knop--primair" onClick={volgende}>
                  {stapIndex < route.length - 1 ? "Volgende stap →" : "Toon mijn voorbereiding"}
                </button>
              </div>
              <p className="gv-limiet">Je antwoorden blijven bewaard als je teruggaat of dit tabblad sluit.</p>
            </div>
          )}

          {/* ── Resultaat ───────────────────────────────────────────────── */}
          {fase === "resultaat" && (
            <>
              <span className="gv-verborgen" tabIndex={-1} ref={kopRef}>Jouw voorbereiding</span>
              <Resultaat
                format={format}
                situatie={huidigeSituatie}
                onAanpassen={() => { setStapIndex(0); setFase("stappen"); }}
                onOpnieuw={opnieuw}
                onWissen={wissen}
                onAfdrukken={afdrukken}
                onReflectie={() => { trackEvent("gespreksvoorbereider_reflectie_geopend"); setFase("reflectie"); }}
              />
            </>
          )}

          {/* ── Reflectie ───────────────────────────────────────────────── */}
          {fase === "reflectie" && (
            <>
              <span className="gv-verborgen" tabIndex={-1} ref={kopRef}>Terugkijken op het gesprek</span>
              <Reflectie
                reflectie={reflectie}
                onWijzig={(veld, waarde) => setReflectie((vorige) => ({ ...vorige, [veld]: waarde }))}
                onTerug={() => setFase("resultaat")}
                onAfdrukken={afdrukken}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
