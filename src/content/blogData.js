// De artikelen, in twee delen.
//
// De gegevens die een lijst nodig heeft (titel, datum, beeld, categorie) staan
// in blogIndex.json, een bestand dat bij het bouwen wordt gemaakt uit de
// markdown. De tekst van een artikel wordt pas opgehaald wanneer iemand dat
// artikel opent; zie laadArtikelTekst hieronder.
//
// Dat was eerst anders. Alle markdown kwam binnen met een eager glob, dus stond
// de volledige tekst van elk artikel in de hoofdbundel. Iedere bezoeker
// downloadde daarmee alle artikelen, ook wie er één kwam lezen, en dat werd bij
// elk nieuw artikel erger.

import index from "./blogIndex.json";

// Niet eager: Vite maakt hier per artikel een los bestand van en haalt het pas
// op wanneer de functie wordt aangeroepen.
const teksten = import.meta.glob("./blog/*.md", { query: "?raw", import: "default" });

function validTime(date) {
  const time = Date.parse(date);
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Is dit artikel al gepubliceerd?
 *
 * Een artikel met een datum in de toekomst is ingepland: het staat wel in de
 * codebase, maar verschijnt pas op zijn publicatiedatum in de overzichten.
 * We vergelijken op kalenderdag, zodat een artikel van vandaag meteen zichtbaar
 * is en niet pas om middernacht.
 */
function isGepubliceerd(date) {
  const tijd = Date.parse(date);
  if (Number.isNaN(tijd)) return true; // geen of ongeldige datum: gewoon tonen
  const vandaag = new Date();
  vandaag.setHours(23, 59, 59, 999);
  return tijd <= vandaag.getTime();
}

/**
 * Haalt de tekst van één artikel op.
 *
 * Geeft de markdown zonder frontmatter terug, of een lege tekst wanneer het
 * artikel niet bestaat. De aanroeper hoeft dus niets af te vangen.
 */
export async function laadArtikelTekst(slug) {
  const laad = teksten[`./blog/${slug}.md`];
  if (!laad) return "";
  const raw = await laad();
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---/);
  return match ? raw.slice(match[0].length).trim() : raw.trim();
}

/** Leestijd in minuten, uit het woordental dat bij het bouwen is geteld. */
export function leestijdVan(woorden = 0) {
  return Math.max(1, Math.round(woorden / 200));
}

// Alle artikelen, inclusief ingeplande. Gebruikt door de detailpagina, zodat een
// gedeelde link naar een gepland artikel blijft werken en niet op een 404 uitkomt.
export const allBlogPosts = index;

// Wat bezoekers in de overzichten zien: alleen wat al gepubliceerd is.
export const blogPosts = allBlogPosts.filter((post) => isGepubliceerd(post.publishDate));

// Handig voor beheer: wat staat er nog in de wachtrij, en wanneer verschijnt het?
export const geplandeBlogPosts = allBlogPosts.filter((post) => !isGepubliceerd(post.publishDate));

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
