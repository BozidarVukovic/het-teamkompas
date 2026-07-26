const rawPosts = import.meta.glob("./blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseList(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, content: raw };
  const data = {};
  let currentKey = "";
  match[1].split(/\r?\n/).forEach((line) => {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (field) {
      currentKey = field[1];
      data[currentKey] = field[2].replace(/^(["'])(.*)\1$/, "$2").trim();
    } else if (/^\s+/.test(line) && currentKey) {
      data[currentKey] = `${data[currentKey]} ${line.trim()}`.trim();
    }
  });
  return { data, content: raw.slice(match[0].length).trim() };
}

function validTime(date) {
  const time = Date.parse(date);
  return Number.isNaN(time) ? 0 : time;
}

export const blogPosts = Object.entries(rawPosts)
  .map(([filePath, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = filePath.replace(/.*\//, "").replace(/\.md$/, "");
    return {
      slug,
      title: data.title || "Artikel",
      excerpt: data.description || data.lead || "",
      publishDate: data.date || "",
      modifiedDate: data.modified || data.date || "",
      image: data.image || "",
      imageAlt: data.imageAlt || `Beeld bij ${data.title || "artikel"}`,
      category: data.category || "Samenwerking",
      tags: parseList(data.tags),
      featured: data.featured === "true",
      relatedKnowledgePages: parseList(data.relatedKnowledgePages),
      relatedServices: parseList(data.relatedServices),
      lead: data.lead || data.description || "",
      author: data.author || "Mijn Teamkompas",
      readtime: data.readtime || "",
      content,
    };
  })
  .sort((a, b) => validTime(b.publishDate) - validTime(a.publishDate) || a.title.localeCompare(b.title, "nl"));

export const blogCategories = [...new Set(blogPosts.map((post) => post.category))]
  .filter((category) => blogPosts.filter((post) => post.category === category).length > 1)
  .sort((a, b) => a.localeCompare(b, "nl"));

export function getRelatedPosts({ tags = [], category = "", excludeSlug = "", limit = 3, paths = [] } = {}) {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  return blogPosts
    .filter((post) => post.slug !== excludeSlug)
    .map((post) => ({
      post,
      score: (post.category === category ? 3 : 0)
        + post.tags.filter((tag) => normalizedTags.includes(tag.toLowerCase())).length * 2
        + paths.filter((path) => post.relatedKnowledgePages.includes(path) || post.relatedServices.includes(path)).length * 4,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || validTime(b.post.publishDate) - validTime(a.post.publishDate))
    .slice(0, limit)
    .map(({ post }) => post);
}

export function formatPublishDate(date) {
  if (!validTime(date)) return "Datum onbekend";
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}
