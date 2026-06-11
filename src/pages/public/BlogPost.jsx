import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const rawPosts = import.meta.glob("../../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, content: raw };
  const frontmatter = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(": ");
    if (key) frontmatter[key.trim()] = rest.join(": ").trim();
  });
  return { data: frontmatter, content: raw.slice(match[0].length).trim() };
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const entry = Object.entries(rawPosts).find(([path]) =>
      path.endsWith(`/${slug}.md`)
    );
    if (!entry) {
      setNotFound(true);
      return;
    }
    const { data, content } = parseFrontmatter(entry[1]);
    setPost({ ...data, content });
  }, [slug]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: 16 }}>Artikel niet gevonden.</p>
          <Link to="/blog" style={{ color: "#4FC3F7" }}>← Terug naar blog</Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8fa3bb" }}>Laden...</div>
      </div>
    );
  }

  const canonicalUrl = `https://www.mijnteamkompas.nl/blog/${slug}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f9f7f4" }}>
      {/* SEO */}
      <title>{post.title ? `${post.title} | Mijn Teamkompas` : "Mijn Teamkompas Blog"}</title>
      {post.description && <meta name="description" content={post.description} />}

      {/* Nav */}
      <nav style={{
        background: "#0D1B2A",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          🧭 Mijn Teamkompas
        </Link>
        <div style={{ display: "flex", gap: 24 }}>
          <Link to="/blog" style={{ color: "#c8d8e8", textDecoration: "none", fontSize: 14 }}>Blog</Link>
          <Link to="/teamscan" style={{ color: "#c8d8e8", textDecoration: "none", fontSize: 14 }}>Teamscan</Link>
          <Link to="/verkennen" style={{ color: "#4FC3F7", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Gesprek aanvragen</Link>
        </div>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/blog" style={{ color: "#8fa3bb", textDecoration: "none", fontSize: 14, display: "inline-block", marginBottom: 32 }}>
          ← Terug naar blog
        </Link>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            style={{ width: "100%", borderRadius: 12, marginBottom: 32, maxHeight: 400, objectFit: "cover" }}
          />
        )}

        {post.date && (
          <p style={{ color: "#8fa3bb", fontSize: 14, margin: "0 0 12px" }}>
            {new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        <h1 style={{ color: "#0D1B2A", fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: "0 0 32px" }}>
          {post.title}
        </h1>

        {/* Markdown content */}
        <div style={{
          color: "#2d3748",
          fontSize: 17,
          lineHeight: 1.8,
        }}>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 style={{ color: "#0D1B2A", fontSize: 22, fontWeight: 700, margin: "40px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, margin: "28px 0 12px" }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p style={{ margin: "0 0 20px", lineHeight: 1.8 }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: "0 0 20px", paddingLeft: 24 }}>{children}</ul>
              ),
              li: ({ children }) => (
                <li style={{ margin: "0 0 8px", lineHeight: 1.7 }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ color: "#0D1B2A", fontWeight: 700 }}>{children}</strong>
              ),
              a: ({ href, children }) => (
                <a href={href} style={{ color: "#4FC3F7", textDecoration: "underline" }}>{children}</a>
              ),
              hr: () => <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "32px 0" }} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* CTA */}
        <div style={{
          background: "#0D1B2A",
          borderRadius: 12,
          padding: "32px",
          marginTop: 48,
          textAlign: "center",
        }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>
            Hoe staat het met jouw team?
          </h2>
          <p style={{ color: "#8fa3bb", marginBottom: 20, fontSize: 15 }}>
            Maak inzichtelijk wat er speelt met een teamscan.
          </p>
          <Link to="/verkennen" style={{
            background: "#4FC3F7",
            color: "#0D1B2A",
            padding: "10px 24px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            display: "inline-block",
          }}>
            Gesprek aanvragen
          </Link>
        </div>
      </article>
    </div>
  );
}
