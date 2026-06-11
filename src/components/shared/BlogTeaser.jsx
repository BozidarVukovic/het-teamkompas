import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const rawPosts = import.meta.glob("../../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {} };
  const fm = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(": ");
    if (key) fm[key.trim()] = rest.join(": ").trim();
  });
  return { data: fm };
}

function getSlug(filePath) {
  return filePath.replace(/.*\//, "").replace(/\.md$/, "");
}

export default function BlogTeaser({ isMobile }) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = Object.entries(rawPosts)
      .map(([filePath, raw]) => {
        const { data } = parseFrontmatter(raw);
        return {
          slug: getSlug(filePath),
          title: data.title || "Artikel",
          date: data.date || "",
          description: data.description || "",
          lead: data.lead || data.description || "",
          image: data.image || null,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
    setPosts(parsed);
  }, []);

  if (posts.length === 0) return null;

  return (
    <section style={{
      padding: isMobile ? "56px 20px" : "80px 60px",
      background: "#f9f7f4",
    }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <p style={{ color: "#00A896", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Van de blog
            </p>
            <h2 style={{ color: "#0D1B2A", fontSize: isMobile ? 24 : 30, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Inzichten over teams en samenwerking
            </h2>
          </div>
          <span
            onClick={() => navigate("/blog")}
            style={{ color: "#00A896", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Alle artikelen →
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 24,
        }}>
          {posts.map((post) => (
            <article
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              style={{
                background: "#fff",
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #e8eff5",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(13,27,42,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {post.image && (
                <div style={{ height: 200, overflow: "hidden", background: "#1a2a3a" }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              )}
              {!post.image && (
                <div style={{ height: 120, background: "linear-gradient(135deg, #0D1B2A 0%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 36 }}>🧭</span>
                </div>
              )}
              <div style={{ padding: "22px 24px 26px" }}>
                {post.date && (
                  <p style={{ color: "#8fa3bb", fontSize: 12, margin: "0 0 8px" }}>
                    {new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                <h3 style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>
                  {post.title}
                </h3>
                <p style={{ color: "#4a5568", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px" }}>
                  {post.lead.length > 120 ? post.lead.slice(0, 120) + "…" : post.lead}
                </p>
                <span style={{ color: "#00A896", fontSize: 14, fontWeight: 600 }}>
                  Lees artikel →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
