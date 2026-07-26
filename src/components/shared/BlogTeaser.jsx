import { Link } from "react-router-dom";
import ArticleCard from "./ArticleCard";
import { blogPosts } from "../../content/blogData";

export default function BlogTeaser() {
  return <section className="home-inspiration" aria-labelledby="home-inspiration-heading">
    <div className="inspiration-container">
      <p className="inspiration-eyebrow">Nieuwe inzichten uit de praktijk</p>
      <div className="inspiration-heading"><h2 id="home-inspiration-heading">Inspiratie voor betere samenwerking</h2><Link to="/inspiratie">Bekijk alle artikelen →</Link></div>
      <div className="inspiration-grid">{blogPosts.slice(0, 3).map((post) => <ArticleCard key={post.slug} post={post} compact />)}</div>
      <Link className="inspiration-all-button" to="/inspiratie">Bekijk alle artikelen</Link>
    </div>
  </section>;
}
