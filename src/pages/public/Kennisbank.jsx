import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ALLE_ITEMS } from "../../data/kennisbank";
import { beveelAan, pasFiltersToe, samenvattingKeuze } from "../../lib/kennisbank/scoring";
import { heeftFilters, heeftKeuze, leesUrl, schrijfUrl } from "../../lib/kennisbank/urlState";
import { zoek } from "../../lib/kennisbank/zoeken";
import { leesFavorieten, wisAlles, wisselFavoriet } from "../../lib/kennisbank/favorieten";
import { SNELLE_INGANGEN } from "../../lib/kennisbank/snelleIngangen";
import { trackEvent } from "../../lib/analytics";
import Kenniswijzer, { STAPPEN } from "../../components/kennisbank/Kenniswijzer";
import ResultaatKaart from "../../components/kennisbank/ResultaatKaart";
import Filters from "../../components/kennisbank/Filters";
import "../../styles/kennisbank.css";

const CANONICAL = "https://www.mijnteamkompas.nl/kennisbank";
const RESULTAAT_ANKER = "#resultaten";

/**
 * De kennisbank met de kenniswijzer.
 *
 * Twee soorten toestand, bewust gescheiden:
 *
 *  1. Wat de bezoeker aan het invullen is, staat in gewone React-state. Tijdens
 *     het invullen verandert de url dus niet. Dat scheelt een geschiedenisregel
 *     per aangevinkte optie, en het voorkomt dat ScrollManager de pagina bij
 *     elke klik naar boven springt.
 *  2. Het resultaat staat wél in de url. Daardoor is een resultatenpagina te
 *     delen, te bookmarken en opnieuw te openen.
 */
export default function Kennisbank() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const gelezen = useMemo(() => leesUrl(params), [params]);
  const { keuze, filters, zoekterm } = gelezen;

  const [wijzerStap, setWijzerStap] = useState(() => (gelezen.stap >= 1 && gelezen.stap <= STAPPEN.length ? gelezen.stap : 0));
  const [concept, setConcept] = useState(gelezen.keuze);
  const [favorieten, setFavorieten] = useState(() => leesFavorieten());
  const [zoekveld, setZoekveld] = useState(zoekterm);
  const [deelMeldingen, setDeelMeldingen] = useState({});

  /** Navigeert naar dezelfde pagina met nieuwe keuzes in de url. Met anker
   *  landt de bezoeker meteen bij de resultaten; ScrollManager regelt dat. */
  const gaNaar = (volgende, metAnker = false) => {
    const zoekdeel = new URLSearchParams(schrijfUrl(volgende)).toString();
    navigate({ pathname: "/kennisbank", search: zoekdeel ? "?" + zoekdeel : "", hash: metAnker ? RESULTAAT_ANKER : "" });
  };

  const huidig = { keuze, filters, zoekterm };

  const startWijzer = (vanaf = 1) => {
    trackEvent("kennisbank_gestart");
    setConcept(keuze);
    setWijzerStap(vanaf);
  };

  const wisselConcept = (stapConfig, id) => {
    const veld = stapConfig.veld;
    setConcept((vorig) => {
      if (!stapConfig.meervoud) return { ...vorig, [veld]: vorig[veld] === id ? "" : id };
      const lijst = vorig[veld] || [];
      if (lijst.includes(id)) return { ...vorig, [veld]: lijst.filter((bestaand) => bestaand !== id) };
      if (stapConfig.max && lijst.length >= stapConfig.max) return vorig;
      return { ...vorig, [veld]: [...lijst, id] };
    });
  };

  const rondAf = () => {
    trackEvent("kennisbank_afgerond", { situaties: concept.situaties.length, tijd: concept.tijd || "geen" });
    setWijzerStap(0);
    gaNaar({ keuze: concept, filters, zoekterm: "" }, true);
  };

  const kiesSnelleIngang = (ingang) => {
    trackEvent("kennisbank_snelle_ingang", { ingang: ingang.id });
    setConcept(ingang.keuze);
    gaNaar({ keuze: ingang.keuze, filters: {}, zoekterm: "" }, true);
  };

  const zetFilter = (sleutel, waarde) => {
    if (waarde) trackEvent("kennisbank_filter_toegepast", { filter: sleutel });
    gaNaar({ ...huidig, filters: { ...filters, [sleutel]: waarde } }, true);
  };

  const opnieuw = () => {
    setZoekveld("");
    setConcept({ situaties: [], rol: "", doelen: [], tijd: "", werkwijzen: [] });
    setWijzerStap(0);
    navigate("/kennisbank");
  };

  const verstuurZoek = (event) => {
    event.preventDefault();
    const term = zoekveld.trim();
    if (term) trackEvent("kennisbank_zoekopdracht");
    // De zoekterm zelf gaat bewust niet mee naar analytics: die kan een naam of
    // een andere persoonlijke omschrijving bevatten.
    gaNaar({ ...huidig, zoekterm: term }, true);
  };

  const wisselBewaard = (id) => setFavorieten(wisselFavoriet(id));

  const wisOpslag = () => {
    wisAlles();
    setFavorieten([]);
  };

  const meldDelen = (id, uitkomst) => setDeelMeldingen((vorige) => ({ ...vorige, [id]: uitkomst }));

  // Filters halen content weg voordat er wordt gescoord. Zo blijft de
  // diversiteitsregel gelden binnen wat de bezoeker heeft overgehouden.
  const pool = useMemo(() => (heeftFilters(filters) ? pasFiltersToe(ALLE_ITEMS, filters) : ALLE_ITEMS), [filters]);
  const aanbeveling = useMemo(() => (heeftKeuze(keuze) ? beveelAan(pool, keuze) : null), [pool, keuze]);
  const zoekresultaten = useMemo(() => (zoekterm ? zoek(pool, zoekterm) : []), [pool, zoekterm]);
  const bewaardeItems = useMemo(
    () => favorieten.map((id) => ALLE_ITEMS.find((item) => item.id === id)).filter(Boolean),
    [favorieten]
  );

  const inWijzer = wijzerStap >= 1 && wijzerStap <= STAPPEN.length;
  const toonResultaten = Boolean(aanbeveling) || Boolean(zoekterm);
  const persoonlijkeWeergave = heeftKeuze(keuze) || heeftFilters(filters) || Boolean(zoekterm);

  return (
    <div className="kb-page">
      <Helmet>
        <title>Kennisbank en kenniswijzer voor teams | Mijn Teamkompas</title>
        <meta name="description" content="Beantwoord vijf korte vragen en vind passende artikelen, werkvormen, reflectievragen, experimenten en downloads voor jouw teamsituatie." />
        <link rel="canonical" href={CANONICAL} />
        {/* Een ingevulde kenniswijzer is een tijdelijke, persoonlijke weergave
            van bestaande content. Die laten we niet apart indexeren, zodat de
            artikelen zelf hun vindbaarheid houden. */}
        {persoonlijkeWeergave && <meta name="robots" content="noindex,follow" />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Kennisbank Mijn Teamkompas",
          url: CANONICAL,
          description: "Artikelen, werkvormen, reflectievragen, teaminterventies, experimenten en downloads voor teams.",
          isPartOf: { "@type": "WebSite", name: "Mijn Teamkompas", url: "https://www.mijnteamkompas.nl/" },
        })}</script>
      </Helmet>

      <header className="kb-hero">
        <div className="kb-container">
          <p className="kb-eyebrow">Kennisbank</p>
          <h1>Vind wat jouw team nu nodig heeft</h1>
          <p>Beantwoord vijf korte vragen en ontdek passende artikelen, werkvormen, reflectievragen en kleine interventies voor jouw teamsituatie. Geen algemeen advies, maar een praktische route naar een volgende stap.</p>
          {!inWijzer && (
            <div className="kb-hero-acties">
              <button type="button" className="kb-knop kb-knop--primair" onClick={() => startWijzer(1)}>Start de kenniswijzer</button>
              <span className="kb-duur">Invullen duurt ongeveer één minuut.</span>
            </div>
          )}
        </div>
      </header>

      {inWijzer ? (
        <main className="kb-sectie">
          <div className="kb-smal">
            <Kenniswijzer
              stap={wijzerStap}
              keuze={concept}
              onWissel={wisselConcept}
              onStap={setWijzerStap}
              onKlaar={rondAf}
              onStoppen={() => setWijzerStap(0)}
            />
          </div>
        </main>
      ) : (
        <main>
          <section className="kb-sectie kb-sectie--wit" aria-labelledby="kb-snel-kop">
            <div className="kb-container">
              <h2 id="kb-snel-kop">Herken je dit direct?</h2>
              <p>Kies een veelvoorkomende situatie en ga meteen naar passende content. De kenniswijzer levert een preciezere uitkomst.</p>
              <ul className="kb-snel">
                {SNELLE_INGANGEN.map((ingang) => (
                  <li key={ingang.id}>
                    <button type="button" onClick={() => kiesSnelleIngang(ingang)}>
                      <span aria-hidden="true">{ingang.icoon}</span>{ingang.label}
                    </button>
                  </li>
                ))}
              </ul>

              <form className="kb-zoek" onSubmit={verstuurZoek} role="search">
                <label>
                  <span>Of zoek zelf op een onderwerp</span>
                  <input
                    type="search"
                    name="q"
                    value={zoekveld}
                    onChange={(event) => setZoekveld(event.target.value)}
                    placeholder="Bijvoorbeeld: aanspreken, vergaderen, werkdruk"
                    maxLength={80}
                  />
                </label>
                <button type="submit" className="kb-knop kb-knop--secundair">Zoeken</button>
              </form>
            </div>
          </section>

          <div id="resultaten" />

          {zoekterm && (
            <section className="kb-sectie" aria-labelledby="kb-zoek-kop">
              <div className="kb-container">
                <h2 id="kb-zoek-kop">Zoekresultaten</h2>
                <p>{zoekresultaten.length} {zoekresultaten.length === 1 ? "resultaat" : "resultaten"} voor jouw zoekopdracht.</p>
                {zoekresultaten.length === 0 ? (
                  <div className="kb-leeg" style={{ marginTop: 20 }}>
                    <h3>Hier vonden we niets op</h3>
                    <p>Probeer een ander woord, of laat de kenniswijzer zoeken op basis van wat er in je team speelt.</p>
                    <button type="button" className="kb-knop kb-knop--primair" onClick={() => startWijzer(1)}>Start de kenniswijzer</button>
                  </div>
                ) : (
                  <div className="kb-resultaten" id="kb-zoek-resultaten">
                    {zoekresultaten.slice(0, 12).map((resultaat) => (
                      <ResultaatKaart
                        key={resultaat.item.id}
                        resultaat={resultaat.item}
                        toonReden={false}
                        favoriet={favorieten.includes(resultaat.item.id)}
                        onFavoriet={wisselBewaard}
                        onTag={(tag) => zetFilter("tag", tag)}
                        deelMelding={deelMeldingen[resultaat.item.id]}
                        onDeelMelding={meldDelen}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {aanbeveling && (
            <section className="kb-sectie" aria-labelledby="kb-resultaat-kop">
              <div className="kb-container">
                <div className="kb-samenvatting">
                  <p>{samenvattingKeuze(keuze)}</p>
                </div>

                {aanbeveling.tijdVerruimd && (
                  <p className="kb-melding">Binnen de tijd die je aangaf vonden we te weinig passende content. Hieronder staat ook iets dat net wat langer duurt; dat is per resultaat vermeld.</p>
                )}
                {aanbeveling.terugvalOpHoofdonderwerp && (
                  <p className="kb-melding">We hebben geen resultaat gevonden dat precies bij alle keuzes past. Hieronder staan enkele mogelijkheden die aansluiten bij het belangrijkste onderwerp dat je hebt gekozen.</p>
                )}

                <h2 id="kb-resultaat-kop" style={{ marginTop: 28 }}>Dit kan je nu helpen</h2>

                {aanbeveling.primair.length === 0 ? (
                  <div className="kb-leeg">
                    <h3>We hebben geen resultaat gevonden dat precies bij alle keuzes past</h3>
                    <p>Dat kan aan de combinatie van filters liggen. Deze stappen leveren meestal wel iets op:</p>
                    <ul>
                      <li>Verruim de beschikbare tijd, of kies bij tijd voor geen voorkeur.</li>
                      <li>Gebruik minder filters op deze pagina.</li>
                      <li>Kies bij stap 1 alleen de situatie die het zwaarst weegt.</li>
                    </ul>
                    <div className="kb-filter-acties">
                      <button type="button" className="kb-knop kb-knop--primair" onClick={() => startWijzer(1)}>Keuzes aanpassen</button>
                      <Link className="kb-knop kb-knop--secundair" to="/gratis-teamscan">Start de gratis teamscan</Link>
                      <Link className="kb-knop kb-knop--secundair" to="/verkennen">Bespreek het vrijblijvend</Link>
                    </div>
                  </div>
                ) : (
                  <div className="kb-resultaten" id="kb-primaire-resultaten" aria-labelledby="kb-resultaat-kop">
                    {aanbeveling.primair.map((resultaat) => (
                      <ResultaatKaart
                        key={resultaat.item.id}
                        resultaat={resultaat}
                        favoriet={favorieten.includes(resultaat.item.id)}
                        onFavoriet={wisselBewaard}
                        onTag={(tag) => zetFilter("tag", tag)}
                        deelMelding={deelMeldingen[resultaat.item.id]}
                        onDeelMelding={meldDelen}
                      />
                    ))}
                  </div>
                )}

                <Filters
                  filters={filters}
                  onFilter={zetFilter}
                  onWisFilters={() => gaNaar({ ...huidig, filters: {} }, true)}
                  onAanpassen={() => startWijzer(1)}
                  onOpnieuw={opnieuw}
                  aantal={aanbeveling.primair.length + aanbeveling.secundair.length}
                />

                {aanbeveling.secundair.length > 0 && (
                  <>
                    <h2 id="kb-secundair-kop" style={{ marginTop: 44 }}>Ook mogelijk interessant</h2>
                    <div className="kb-resultaten" id="kb-secundaire-resultaten" aria-labelledby="kb-secundair-kop">
                      {aanbeveling.secundair.map((resultaat) => (
                        <ResultaatKaart
                          key={resultaat.item.id}
                          resultaat={resultaat}
                          favoriet={favorieten.includes(resultaat.item.id)}
                          onFavoriet={wisselBewaard}
                          onTag={(tag) => zetFilter("tag", tag)}
                          deelMelding={deelMeldingen[resultaat.item.id]}
                          onDeelMelding={meldDelen}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {!toonResultaten && (
            <section className="kb-sectie" aria-labelledby="kb-uitleg-kop">
              <div className="kb-container">
                <h2 id="kb-uitleg-kop">Hoe de kenniswijzer werkt</h2>
                <p>Je beantwoordt vijf korte vragen: wat er speelt, vanuit welke rol je zoekt, wat je wilt bereiken, hoeveel tijd je hebt en hoe je aan de slag wilt. Op basis daarvan combineren we vaste kenmerken van onze content tot maximaal zes suggesties, met bij elke suggestie de reden waarom die past.</p>
                <p>Er komt geen chatbot of taalmodel aan te pas. De uitkomst is een selectie uit bestaande content, geen oordeel over jouw team.</p>
                <div className="kb-hero-acties">
                  <button type="button" className="kb-knop kb-knop--primair" onClick={() => startWijzer(1)}>Start de kenniswijzer</button>
                  <Link className="kb-knop kb-knop--secundair" to="/inspiratie">Bekijk alle artikelen</Link>
                </div>
              </div>
            </section>
          )}

          {bewaardeItems.length > 0 && (
            <section className="kb-sectie kb-sectie--wit" aria-labelledby="kb-bewaard-kop">
              <div className="kb-container">
                <h2 id="kb-bewaard-kop">Wat je hebt bewaard</h2>
                <p>Deze lijst staat alleen in deze browser en verdwijnt zodra je hem wist.</p>
                <div className="kb-resultaten">
                  {bewaardeItems.map((item) => (
                    <ResultaatKaart
                      key={item.id}
                      resultaat={item}
                      toonReden={false}
                      favoriet
                      onFavoriet={wisselBewaard}
                      deelMelding={deelMeldingen[item.id]}
                      onDeelMelding={meldDelen}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="kb-sectie" aria-labelledby="kb-privacy-kop">
            <div className="kb-container">
              <div className="kb-privacy">
                <h3 id="kb-privacy-kop">Wat we van deze pagina bewaren</h3>
                <p>
                  We vragen geen persoonsgegevens en gebruiken geen externe AI-dienst. Je keuzes staan in de adresbalk, zodat je de pagina kunt delen of later terug kunt openen. Bewaarde items staan in de lokale opslag van deze browser en gaan nooit naar een server. We gebruiken je keuzes niet voor profielen of advertenties.
                </p>
                <button type="button" className="kb-knop kb-knop--secundair kb-knop--klein" onClick={wisOpslag}>Bewaarde items en keuzes wissen</button>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
