import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import KompasDot from "../../components/shared/KompasDot";
import NieuwsbriefFormulier from "../../components/shared/NieuwsbriefFormulier";
import RelatedArticles from "../../components/shared/RelatedArticles";
import { allBlogPosts, blogPosts, formatPublishDate } from "../../content/blogData";

function calcReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`, "_self");
  };

  const downloadPdf = () => {
    window.print();
  };

  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#f0f4f8", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "8px 14px", fontSize: 13,
    fontWeight: 600, color: "#0D1B2A", cursor: "pointer",
    textDecoration: "none",
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 36px" }}>
      <button onClick={shareLinkedIn} style={btnStyle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
        LinkedIn
      </button>
      <button onClick={shareEmail} style={btnStyle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
        E-mail
      </button>
      <button onClick={copyLink} style={{ ...btnStyle, background: copied ? "#e6f9f5" : "#f0f4f8", color: copied ? "#0F766E" : "#0D1B2A" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        {copied ? "Gekopieerd!" : "Kopieer link"}
      </button>
      <button onClick={downloadPdf} style={{ ...btnStyle, background: "#0D1B2A", color: "#fff", border: "1px solid #0D1B2A" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download
      </button>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  // Zoek in álle artikelen, ook de ingeplande. Zo blijft een gedeelde link naar
  // een gepland artikel werken in plaats van op een foutpagina uit te komen.
  const post = allBlogPosts.find((item) => item.slug === slug);
  const isGepland = post ? !blogPosts.some((item) => item.slug === post.slug) : false;
  const notFound = !post;

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: 16 }}>Artikel niet gevonden.</p>
          <Link to="/inspiratie" style={{ color: "#4FC3F7" }}>← Terug naar Inspiratie</Link>
        </div>
      </div>
    );
  }


  const readTime = post.readtime || calcReadTime(post.content);
  const author = post.author || "Mijn Teamkompas";

  return (
    <div style={{ minHeight: "100vh", background: "#f9f7f4" }}>
      {/* SEO */}
      <Helmet>
        <title>{`${post.title} | Mijn Teamkompas`}</title>
        <meta name="description" content={post.excerpt} />
        {/* Een gepland artikel mag nog niet in Google verschijnen. */}
        {isGepland && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={`https://www.mijnteamkompas.nl/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, image: post.image ? `https://www.mijnteamkompas.nl${post.image}` : undefined, datePublished: post.publishDate, dateModified: post.modifiedDate, author: { "@type": "Organization", name: post.author }, publisher: { "@type": "Organization", name: "Mijn Teamkompas" }, mainEntityOfPage: `https://www.mijnteamkompas.nl/blog/${post.slug}` })}</script>
      </Helmet>

      {isGepland && (
        <div style={{ background: "#fdf1e0", color: "#97591a", padding: "12px 24px", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
          Dit artikel staat ingepland en verschijnt op {formatPublishDate(post.publishDate)}. Je bekijkt nu een voorvertoning.
        </div>
      )}

      {/* Hero image — 3:2 verhouding zodat de hele foto zichtbaar blijft (de meeste
          blogbeelden zijn 3:2). Een vaste hoogte croppte het beeld voorheen sterk. */}
      {post.image && (
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", aspectRatio: "3 / 2", overflow: "hidden", background: "#1a2a3a" }}>
          <img
            src={post.image}
            alt={post.imageAlt}
            width="1200"
            height="800"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          />
        </div>
      )}

      {/* Article */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 96px" }}>

        {/* Back link */}
        <Link to="/inspiratie" style={{ color: "#8fa3bb", textDecoration: "none", fontSize: 13, display: "inline-block", marginBottom: 32, letterSpacing: "0.02em" }}>
          ← Alle artikelen
        </Link>

        <p className="article-category">{post.category}</p>

        {/* Title */}
        <h1 style={{
          color: "#0D1B2A",
          fontSize: "clamp(26px, 5vw, 36px)",
          fontWeight: 800,
          lineHeight: 1.2,
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
        }}>
          {post.title}
        </h1>

        {/* Lead paragraph */}
        {post.lead && (
          <p style={{
            fontSize: 19,
            color: "#1a2a3a",
            fontStyle: "italic",
            lineHeight: 1.75,
            margin: "0 0 28px",
            paddingLeft: 18,
            borderLeft: "3px solid #4FC3F7",
          }}>
            {post.lead}
          </p>
        )}

        {/* Delen + Download */}
        <ShareButtons title={post.title} />

        {/* Author / date / readtime */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 44,
          paddingBottom: 28,
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#0D1B2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4FC3F7",
            fontWeight: 800,
            fontSize: 12,
            flexShrink: 0,
            letterSpacing: "0.05em",
          }}>
            MT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0D1B2A" }}>{author}</span>
            {post.publishDate && (
              <>
                <span style={{ color: "#c8d8e8", fontSize: 13 }}>·</span>
                <span style={{ fontSize: 13, color: "#8fa3bb" }}>
                  {formatPublishDate(post.publishDate)}
                </span>
              </>
            )}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "#8fa3bb", whiteSpace: "nowrap" }}>
            {readTime} min lezen
          </div>
        </div>

        {/* Markdown content */}
        <div style={{ color: "#2d3748", fontSize: 17, lineHeight: 1.85 }}>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 style={{
                  color: "#0D1B2A",
                  fontSize: 22,
                  fontWeight: 700,
                  margin: "52px 0 18px",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 style={{
                  color: "#0D1B2A",
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "36px 0 14px",
                }}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p style={{ margin: "0 0 22px", lineHeight: 1.85 }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: "0 0 22px", paddingLeft: 24 }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: "0 0 22px", paddingLeft: 24 }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ margin: "0 0 10px", lineHeight: 1.75 }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ color: "#0D1B2A", fontWeight: 700 }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ color: "#3a4a5a", fontStyle: "italic" }}>{children}</em>
              ),
              a: ({ href, children }) => (
                <a href={href} style={{ color: "#4FC3F7", textDecoration: "underline" }}>{children}</a>
              ),
              hr: () => (
                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "44px 0" }} />
              ),
              blockquote: ({ children }) => (
                <blockquote style={{
                  margin: "36px 0",
                  padding: "20px 24px",
                  background: "#eef6fb",
                  borderLeft: "4px solid #4FC3F7",
                  borderRadius: "0 8px 8px 0",
                  fontStyle: "italic",
                  color: "#2d3748",
                  fontSize: 16,
                  lineHeight: 1.75,
                }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Nieuwsbrief */}
        <div style={{ margin: "48px 0 0" }}>
          <NieuwsbriefFormulier variant="blog" />
        </div>

        {/* CTA */}
        <div style={{
          background: "#0D1B2A",
          borderRadius: 12,
          padding: "36px 32px",
          marginTop: 56,
          textAlign: "center",
        }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>
            Wil je dit onderwerp binnen jouw team bespreekbaar maken?
          </h2>
          <p style={{ color: "#8fa3bb", marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
            Ontdek hoe onze begeleiding aansluit bij wat jouw team nodig heeft.
          </p>
          <Link to={post.relatedServices[0] || "/verkennen"} style={{
            background: "#4FC3F7",
            color: "#0D1B2A",
            padding: "12px 28px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            display: "inline-block",
          }}>
            Bekijk passende begeleiding
          </Link>
        </div>
      </article>
      <RelatedArticles tags={post.tags} category={post.category} excludeSlug={post.slug} />
    </div>
  );
}
