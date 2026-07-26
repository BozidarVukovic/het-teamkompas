import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { knowledgeNavigation } from "../../components/shared/navigationData";

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
      <Helmet>
        <title>Kennis over teamontwikkeling | Mijn Teamkompas</title>
        <meta name="description" content="Lees kennis en blogs over teamontwikkeling, psychologische veiligheid, boven- en onderstroom, neuromanagement en kleine experimenten." />
      </Helmet>
      {/* Hero */}
      <div style={{ background: "#0D1B2A", padding: "112px 32px 48px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 700, margin: "0 0 12px" }}>Kennis over teamontwikkeling</h1>
        <p style={{ color: "#8fa3bb", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
          Verdiep je in een hoofdthema of ontdek onze nieuwste artikelen over teams en samenwerking.
        </p>
      </div>

      <main>
      <section aria-labelledby="kennispaginas-heading" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 12px" }}>
        <p style={{ color: "#008f80", fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 8px" }}>Centrale kennispagina’s</p>
        <h2 id="kennispaginas-heading" style={{ color: "#0D1B2A", fontSize: 28, margin: "0 0 8px" }}>Kies een thema</h2>
        <p style={{ color: "#4a5568", lineHeight: 1.6, margin: "0 0 24px" }}>Deze pagina’s leggen de belangrijkste thema’s uit en wijzen je door naar verdiepende kennis.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {knowledgeNavigation.featured.map((item) => <Link key={item.href} to={item.href} style={{ padding: "20px", background: "#fff", border: "1px solid #dce5e8", borderRadius: 12, color: "#0D1B2A", textDecoration: "none", fontWeight: 750, boxShadow: "0 2px 10px rgba(13,27,42,.05)" }}>{item.label}<span aria-hidden="true" style={{ display: "block", marginTop: 12, color: "#008f80" }}>Bekijk thema →</span></Link>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24, marginTop: 36 }}>
          {knowledgeNavigation.groups.map((group) => <section key={group.label} aria-labelledby={`group-${group.label.replaceAll(" ", "-")}`}>
            <h3 id={`group-${group.label.replaceAll(" ", "-")}`} style={{ color: "#0D1B2A", fontSize: 17, margin: "0 0 8px" }}>{group.label}</h3>
            {group.links.map((item) => <Link key={item.href} to={item.href} style={{ display: "block", minHeight: 44, padding: "10px 0", color: "#176b67", fontWeight: 650, textDecoration: "none", borderBottom: "1px solid #e3e8e9" }}>{item.label}</Link>)}
          </section>)}
        </div>
      </section>

      {/* Posts grid */}
      <section aria-labelledby="artikelen-heading" style={{ maxWidth: 900, margin: "0 auto", padding: "52px 24px" }}>
        <p style={{ color: "#008f80", fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 8px" }}>Blog en actualiteit</p>
        <h2 id="artikelen-heading" style={{ color: "#0D1B2A", fontSize: 28, margin: "0 0 24px" }}>Artikelen en inzichten</h2>
        {posts.length === 0 && (
          <p style={{ color: "#666", textAlign: "center" }}>Nog geen artikelen gepubliceerd.</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              style={{ textDecoration: "none", color: "inherit", display: "flex" }}
            >
              <article style={{
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
              >
                <div style={{ height: 180, overflow: "hidden", flexShrink: 0 }}>
                  {post.image
                    ? <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0D1B2A 0%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40 }}>🧭</span></div>
                  }
                </div>
                <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {post.date && (
                    <p style={{ color: "#8fa3bb", fontSize: 13, margin: "0 0 8px" }}>
                      {new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <h2 style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  {post.description && (
                    <p style={{ color: "#4a5568", fontSize: 14, lineHeight: 1.6, margin: "0 0 auto" }}>
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
      </section>
      </main>

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
