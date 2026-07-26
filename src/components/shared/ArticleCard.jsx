import { Link } from "react-router-dom";
import { formatPublishDate } from "../../content/blogData";

export default function ArticleCard({ post, compact = false }) {
  return <article className={`inspiration-card${compact ? " inspiration-card--compact" : ""}`}>
    <Link className="inspiration-card__image" to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
      {post.image ? <img src={post.image} alt={post.imageAlt} loading="lazy" width="640" height="360" /> : <span aria-hidden="true">🧭</span>}
    </Link>
    <div className="inspiration-card__body">
      <p className="inspiration-card__meta"><span>{post.category}</span><time dateTime={post.publishDate}>{formatPublishDate(post.publishDate)}</time></p>
      <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
      <p>{post.excerpt}</p>
      <Link className="inspiration-card__more" to={`/blog/${post.slug}`} aria-label={`Lees artikel: ${post.title}`}>Lees artikel →</Link>
    </div>
  </article>;
}
