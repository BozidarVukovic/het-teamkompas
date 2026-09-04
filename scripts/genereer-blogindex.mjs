// scripts/genereer-blogindex.mjs
//
// Schrijft src/content/blogIndex.json: van elk artikel de gegevens die de
// overzichten nodig hebben, zonder de tekst zelf.
//
// Waarom dit bestaat. blogData.js haalde alle markdown binnen met een eager
// glob. Daardoor stond de volledige tekst van elk artikel in de hoofdbundel en
// downloadde iedere bezoeker alle artikelen, ook wie er één kwam lezen. Bij 65
// artikelen was dat ruim een halve megabyte aan bronbestanden, en het groeit
// met elk artikel mee.
//
// Nu staat hier alleen wat een lijst nodig heeft: titel, datum, categorie, het
// beeld en een woordental voor de leestijd. De tekst van een artikel wordt pas
// opgehaald wanneer iemand dat artikel opent.
//
// Draait mee met `npm run build`. Het resultaat staat in git, zodat `npm run
// dev` werkt zonder eerst een build te doen.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "../src/content/blog");
const doelPad = path.join(__dirname, "../src/content/blogIndex.json");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, content: raw };
  const data = {};
  let huidigeSleutel = "";
  match[1].split(/\r?\n/).forEach((regel) => {
    const veld = regel.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (veld) {
      huidigeSleutel = veld[1];
      data[huidigeSleutel] = veld[2].replace(/^(["'])(.*)\1$/, "$2").trim();
    } else if (/^\s+/.test(regel) && huidigeSleutel) {
      data[huidigeSleutel] = `${data[huidigeSleutel]} ${regel.trim()}`.trim();
    }
  });
  return { data, content: raw.slice(match[0].length).trim() };
}

const lijst = (waarde = "") =>
  waarde.split(",").map((item) => item.trim()).filter(Boolean);

const tijd = (datum) => {
  const ms = Date.parse(datum);
  return Number.isNaN(ms) ? 0 : ms;
};

const artikelen = fs
  .readdirSync(blogDir)
  .filter((naam) => naam.endsWith(".md"))
  .map((naam) => {
    const slug = naam.replace(/\.md$/, "");
    const { data, content } = parseFrontmatter(fs.readFileSync(path.join(blogDir, naam), "utf-8"));
    return {
      slug,
      title: data.title || "Artikel",
      excerpt: data.description || data.lead || "",
      publishDate: data.date || "",
      modifiedDate: data.modified || data.date || "",
      image: data.image || "",
      imageAlt: data.imageAlt || `Beeld bij ${data.title || "artikel"}`,
      category: data.category || "Samenwerking",
      tags: lijst(data.tags),
      featured: data.featured === "true",
      relatedKnowledgePages: lijst(data.relatedKnowledgePages),
      relatedServices: lijst(data.relatedServices),
      lead: data.lead || data.description || "",
      author: data.author || "Mijn Teamkompas",
      readtime: data.readtime || "",
      // De leestijd werd uit de tekst berekend. Die tekst is er straks niet
      // meer op het moment dat een lijst wordt getoond, dus tellen we de
      // woorden hier één keer.
      woorden: content.split(/\s+/).filter(Boolean).length,
    };
  })
  .sort((a, b) => tijd(b.publishDate) - tijd(a.publishDate) || a.title.localeCompare(b.title, "nl"));

fs.writeFileSync(doelPad, `${JSON.stringify(artikelen, null, 2)}\n`, "utf-8");
console.log(`Blogindex bijgewerkt: ${artikelen.length} artikelen, zonder tekst.`);
