import ArticleCard from "./ArticleCard";
import { getRelatedPosts } from "../../content/blogData";

export default function RelatedArticles({ title = "Verder lezen", tags = [], category = "", excludeSlug = "", paths = [], posts: suppliedPosts }) {
  const posts = suppliedPosts || getRelatedPosts({ tags, category, excludeSlug, paths, limit: 3 });
  if (!posts.length) return null;
  return <section className="related-articles" aria-labelledby={`related-${title.replace(/\W+/g, "-").toLowerCase()}`}>
    <div className="inspiration-container">
      <p className="inspiration-eyebrow">Inspiratie</p>
      <h2 id={`related-${title.replace(/\W+/g, "-").toLowerCase()}`}>{title}</h2>
      <div className="inspiration-grid">{posts.map((post) => <ArticleCard key={post.slug} post={post} compact />)}</div>
    </div>
  </section>;
}
