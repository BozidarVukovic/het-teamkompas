import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Vite glob import: alle markdown-bestanden in src/content/blog als raw tekst
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

function getSlug(filePath) {
  return filePath.replace(/.*\//, "").replace(/\.md$/, "");
}

export default function Blog({ onLoginClick }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const parsed = Object.entries(rawPosts)
      .map(([filePath, raw]) => {
        const { data } = parseFrontmatter(raw);
        return {
          slug: getSlug(filePath),
          title: data.title || "Artikel",
          date: data.date || "",
          description: data.description || "",
          image: data.image || null,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setPosts(parsed);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9f7f4" }}>
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
          <Link to="/teamscan" style={{ color: "#c8d8e8", textDecoration: "none", fontSize: 14 }}>Teamscan</Link>
          <Link to="/teamcoaching" style={{ color: "#c8d8e8", textDecoration: "none", fontSize: 14 }}>Teamcoaching</Link>
          <Link to="/verkennen" style={{ color: "#4FC3F7", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Gesprek aanvragen</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "#0D1B2A", padding: "64px 32px 48px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 700, margin: "0 0 12px" }}>Blog</h1>
        <p style={{ color: "#8fa3bb", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
          Inzichten over teamontwikkeling, psychologische veiligheid en samenwerking.
        </p>
      </div>

      {/* Posts grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {posts.length === 0 && (
          <p style={{ color: "#666", textAlign: "center" }}>Nog geen artikelen gepubliceerd.</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article style={{
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
              >
                {post.image && (
                  <img src={post.image} alt={post.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                )}
                {!post.image && (
                  <div style={{ height: 120, background: "linear-gradient(135deg, #0D1B2A 0%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 40 }}>🧭</span>
                  </div>
                )}
                <div style={{ padding: "20px 24px 24px" }}>
                  {post.date && (
                    <p style={{ color: "#8fa3bb", fontSize: 13, margin: "0 0 8px" }}>
                      {new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <h2 style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  {post.description && (
                    <p style={{ color: "#4a5568", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {post.description}
                    </p>
                  )}
                  <p style={{ color: "#4FC3F7", fontSize: 14, fontWeight: 600, margin: "16px 0 0" }}>
                    Lees artikel →
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ background: "#0D1B2A", padding: "48px 32px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>
          Hoe staat het met jouw team?
        </h2>
        <p style={{ color: "#8fa3bb", marginBottom: 24 }}>
          Maak inzichtelijk wat er speelt met een teamscan.
        </p>
        <Link to="/verkennen" style={{
          background: "#4FC3F7",
          color: "#0D1B2A",
          padding: "12px 28px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 16,
        }}>
          Gesprek aanvragen
        </Link>
      </div>
    </div>
  );
}
