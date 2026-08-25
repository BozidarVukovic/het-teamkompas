import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ALLE_ITEMS, itemVia, itemViaPad } from "../../data/kennisbank";
import { DOMEINEN, NIVEAUS, contenttype, tagLabel, tijdLabel } from "../../data/kennisbank/taxonomie";
import { gerelateerdeItems } from "../../lib/kennisbank/gerelateerd";
import { leesFavorieten, wisselFavoriet } from "../../lib/kennisbank/favorieten";
import { trackEvent } from "../../lib/analytics";
import ResultaatKaart from "../../components/kennisbank/ResultaatKaart";
import "../../styles/kennisbank.css";

const SITE = "https://www.mijnteamkompas.nl";
const VORM_LABEL = { individueel: "Individueel te doen", samen: "Met het team", beide: "Alleen of samen" };

function Blok({ kop, children }) {
  if (!children) return null;
  return <section className="kb-blok">{kop && <h2>{kop}</h2>}{children}</section>;
}

function domeinKleur(item) {
  const domein = DOMEINEN.find((d) => d.id === item.domeinen[0]);
  return domein ? domein.kleur : "var(--tk-color-teal)";
}

export default function KennisbankItem() {
  const { type, slug } = useParams();
  const item = useMemo(() => itemViaPad(type, slug), [type, slug]);
  const [favorieten, setFavorieten] = useState(() => leesFavorieten());

  useEffect(() => {
    if (item) trackEvent("kennisbank_item_bekeken", { soort: item.type, id: item.id });
  }, [item]);

  const gerelateerd = useMemo(
    () => (item ? gerelateerdeItems(item, ALLE_ITEMS, itemVia, 3) : []),
    [item]
  );

  if (!item) {
    return (
      <div className="kb-page">
        <Helmet>
          <title>Pagina niet gevonden | Mijn Teamkompas</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <header className="kb-detail-hero">
          <div className="kb-container">
            <h1>Deze pagina bestaat niet meer</h1>
            <p>Mogelijk is de link verouderd. In de kennisbank vind je alle werkvormen, reflectievragen en artikelen bij elkaar.</p>
          </div>
        </header>
        <main className="kb-detail">
          <div className="kb-container">
            <Link className="kb-knop kb-knop--primair" to="/kennisbank">Naar de kennisbank</Link>
          </div>
        </main>
      </div>
    );
  }

  const soort = contenttype(item.type);
  const inhoud = item.inhoud || {};
  const niveau = NIVEAUS.find((n) => n.id === item.niveau);
  const url = SITE + item.href;
  const bewaard = favorieten.includes(item.id);

  return (
    <div className="kb-page" style={{ "--kb-accent": domeinKleur(item) }}>
      <Helmet>
        <title>{item.titel} | {soort.label} | Mijn Teamkompas</title>
        <meta name="description" content={item.samenvatting} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="nl_NL" />
        <meta property="og:site_name" content="Mijn Teamkompas" />
        <meta property="og:title" content={item.titel + " | Mijn Teamkompas"} />
        <meta property="og:description" content={item.samenvatting} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={SITE + "/teamkompas-workshop-hero.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": inhoud.stappen ? "HowTo" : "Article",
          name: item.titel,
          headline: item.titel,
          description: item.samenvatting,
          url,
          inLanguage: "nl-NL",
          author: { "@type": "Organization", name: "Mijn Teamkompas" },
          publisher: { "@type": "Organization", name: "Mijn Teamkompas" },
          ...(inhoud.stappen ? {
            totalTime: item.tijdMinuten ? "PT" + item.tijdMinuten + "M" : undefined,
            step: inhoud.stappen.map((stap, index) => ({
              "@type": "HowToStep", position: index + 1, name: stap.titel, text: stap.tekst,
            })),
          } : {}),
        })}</script>
      </Helmet>

      <header className="kb-detail-hero">
        <div className="kb-container">
          <nav aria-label="Kruimelpad">
            <ol className="kb-kruimels">
              <li><Link to="/kennisbank">Kennisbank</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link to={"/kennisbank?type=" + item.type}>{soort.meervoud}</Link></li>
            </ol>
          </nav>
          <span className="kb-type"><span aria-hidden="true">{soort.icoon}</span>{soort.label}</span>
          <h1>{item.titel}</h1>
          <p>{item.samenvatting}</p>
          <ul className="kb-detail-meta">
            <li><span aria-hidden="true">⏱</span>{tijdLabel(item.tijdMinuten)}</li>
            <li><span aria-hidden="true">👥</span>{VORM_LABEL[item.vorm] || VORM_LABEL.beide}</li>
            {niveau && <li><span aria-hidden="true">📈</span>{niveau.label}</li>}
            {item.voorbereiding && <li><span aria-hidden="true">🧾</span>Voorbereiding: {item.voorbereiding}</li>}
          </ul>
        </div>
      </header>

      <main className="kb-detail">
        <div className="kb-smal">
          <Blok kop="Waarvoor je dit gebruikt">
            {inhoud.waarvoor ? <p>{inhoud.waarvoor}</p> : null}
          </Blok>

          {inhoud.hypothese && (
            <Blok kop="Wat je onderzoekt">
              <p>{inhoud.hypothese}</p>
              {item.meetpunt && <p><strong>Waaraan je het afmeet:</strong> {item.meetpunt}</p>}
            </Blok>
          )}

          {inhoud.hoe && <Blok kop="Hoe je het gebruikt"><p>{inhoud.hoe}</p></Blok>}

          {inhoud.benodigdheden && (
            <Blok kop="Wat je nodig hebt">
              <ul>{inhoud.benodigdheden.map((regel) => <li key={regel}>{regel}</li>)}</ul>
            </Blok>
          )}

          {inhoud.stappen && (
            <Blok kop="Stap voor stap">
              <ol className="kb-stappen">
                {inhoud.stappen.map((stap) => (
                  <li key={stap.titel}>
                    <h3>{stap.titel}</h3>
                    <p>{stap.tekst}</p>
                  </li>
                ))}
              </ol>
            </Blok>
          )}

          {inhoud.vragen && (
            <Blok kop="De vragen">
              <ol className="kb-vragen">
                {inhoud.vragen.map((vraag) => <li key={vraag}>{vraag}</li>)}
              </ol>
            </Blok>
          )}

          {inhoud.zinnen && (
            <Blok kop="Zinnen die je kunt gebruiken">
              <ul className="kb-zinnen">
                {inhoud.zinnen.map((zin) => <li key={zin}>{zin}</li>)}
              </ul>
            </Blok>
          )}

          {inhoud.velden && (
            <Blok kop="Het canvas">
              <div className="kb-canvas">
                {inhoud.velden.map((veld) => (
                  <div className="kb-canvas-veld" key={veld.label}>
                    <h3>{veld.label}</h3>
                    <p>{veld.uitleg}</p>
                    <div className="kb-canvas-lijn" aria-hidden="true" />
                    <div className="kb-canvas-lijn" aria-hidden="true" />
                    <div className="kb-canvas-lijn" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className="kb-filter-acties kb-geenprint">
                {item.bestand
                  ? <a className="kb-knop kb-knop--primair" href={item.bestand} target="_blank" rel="noopener" onClick={() => trackEvent("kennisbank_download_geopend", { id: item.id })}>Download de pdf</a>
                  : <button type="button" className="kb-knop kb-knop--primair" onClick={() => { trackEvent("kennisbank_download_geopend", { id: item.id }); window.print(); }}>Print of bewaar als pdf</button>}
              </div>
            </Blok>
          )}

          {inhoud.waaraanMerkJeHet && (
            <Blok kop="Waaraan je merkt dat het werkt"><p>{inhoud.waaraanMerkJeHet}</p></Blok>
          )}

          {inhoud.varianten && (
            <Blok kop="Varianten">
              <ul>{inhoud.varianten.map((variant) => <li key={variant}>{variant}</li>)}</ul>
            </Blok>
          )}

          {inhoud.letOp && (
            <Blok>
              <div className="kb-letop"><strong>Let op</strong>{inhoud.letOp}</div>
            </Blok>
          )}

          {item.bestand && !inhoud.velden && (
            <Blok>
              <div className="kb-filter-acties kb-geenprint">
                <a className="kb-knop kb-knop--primair" href={item.bestand} target="_blank" rel="noopener" onClick={() => trackEvent("kennisbank_download_geopend", { id: item.id })}>Download de pdf</a>
              </div>
            </Blok>
          )}

          {item.tags.length > 0 && (
            <Blok kop="Onderwerpen">
              <ul className="kb-tags">
                {item.tags.map((tag) => (
                  <li key={tag}><Link className="kb-chip" to={"/kennisbank?onderwerp=" + tag}>{tagLabel(tag)}</Link></li>
                ))}
              </ul>
            </Blok>
          )}

          <div className="kb-filter-acties kb-geenprint" style={{ marginBottom: 34 }}>
            <button
              type="button"
              className="kb-icoonknop"
              aria-pressed={bewaard}
              onClick={() => setFavorieten(wisselFavoriet(item.id))}
            >
              <span aria-hidden="true">{bewaard ? "★" : "☆"}</span>{bewaard ? "Bewaard" : "Bewaar dit item"}
            </button>
            <button type="button" className="kb-icoonknop" onClick={() => window.print()}>
              <span aria-hidden="true">🖨</span>Afdrukken
            </button>
            <Link className="kb-icoonknop" to="/kennisbank">Naar de kenniswijzer</Link>
          </div>

          {item.vervolgstap && (
            <div className="kb-vervolg kb-geenprint">
              <h2>Een mogelijke volgende stap</h2>
              <p>Op basis van waar je nu bent, kan dit een passende volgende stap zijn.</p>
              <a className="kb-knop kb-knop--primair" href={item.vervolgstap.href}>{item.vervolgstap.label}</a>
            </div>
          )}
        </div>
      </main>

      {gerelateerd.length > 0 && (
        <section className="kb-gerelateerd kb-geenprint" aria-labelledby="kb-gerelateerd-kop">
          <div className="kb-container">
            <h2 id="kb-gerelateerd-kop">Hier gaat het verder</h2>
            <div className="kb-resultaten">
              {gerelateerd.map((ander) => (
                <ResultaatKaart key={ander.id} resultaat={ander} toonReden={false} favoriet={favorieten.includes(ander.id)} onFavoriet={(id) => setFavorieten(wisselFavoriet(id))} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
