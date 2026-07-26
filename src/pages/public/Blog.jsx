import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import ArticleCard from "../../components/shared/ArticleCard";
import { blogCategories, blogPosts } from "../../content/blogData";

const CANONICAL = "https://www.mijnteamkompas.nl/inspiratie";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("thema") || "";
  const activeCategory = blogCategories.includes(requested) ? requested : "";
  const posts = useMemo(() => activeCategory ? blogPosts.filter((post) => post.category === activeCategory) : blogPosts, [activeCategory]);
  const selectCategory = (category) => setSearchParams(category ? { thema: category } : {}, { replace: true });
  const itemList = blogPosts.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: `https://www.mijnteamkompas.nl/blog/${post.slug}`, name: post.title }));

  return <div className="inspiration-page">
    <Helmet>
      <title>Inspiratie over teams, leiderschap en samenwerking | Mijn Teamkompas</title>
      <meta name="description" content="Lees artikelen over teamcultuur, leiderschap, eigenaarschap, psychologische veiligheid, verandering en samenwerken in teams." />
      <link rel="canonical" href={CANONICAL} />
      {activeCategory && <meta name="robots" content="noindex,follow" />}
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Inspiratie", url: CANONICAL, mainEntity: { "@type": "ItemList", itemListElement: itemList } })}</script>
    </Helmet>
    <header className="inspiration-hero">
      <div className="inspiration-container">
        <p className="inspiration-eyebrow">Artikelen en inzichten</p>
        <h1>Inspiratie voor teams die willen blijven groeien</h1>
        <p>Samenwerken lijkt vanzelfsprekend, maar in de dagelijkse praktijk lopen teams regelmatig vast in oude patronen, onuitgesproken verwachtingen en goede voornemens die weer verdwijnen.</p>
        <p>In onze artikelen onderzoeken we herkenbare situaties uit teams en organisaties. We verbinden alledaagse observaties aan gedragswetenschap, teamdynamiek en praktische manieren om beweging te creëren.</p>
      </div>
    </header>
    <main className="inspiration-container inspiration-main">
      <section aria-labelledby="article-heading">
        <div className="inspiration-heading"><div><p className="inspiration-eyebrow">Ontdek en verdiep</p><h2 id="article-heading">Alle artikelen</h2></div><p>{posts.length} artikelen</p></div>
        <div className="inspiration-filters" aria-label="Filter artikelen op thema">
          <button type="button" aria-pressed={!activeCategory} onClick={() => selectCategory("")}>Alle artikelen</button>
          {blogCategories.map((category) => <button type="button" key={category} aria-pressed={activeCategory === category} onClick={() => selectCategory(category)}>{category}</button>)}
        </div>
        <div className="inspiration-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      </section>
    </main>
  </div>;
}
