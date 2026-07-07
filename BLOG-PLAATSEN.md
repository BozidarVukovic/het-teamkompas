# Blog artikel plaatsen op mijnteamkompas.nl

## Hoe werkt het
Artikelen staan als markdown-bestanden in `src/content/blog/`.
GitHub triggert automatisch een Firebase-deploy zodra je pusht naar `main`.
Geen `npm run build` of `firebase deploy` nodig — alleen git push.

## Stap voor stap

### 1. Maak een nieuw bestand aan
Maak een `.md` bestand in `src/content/blog/` met de slug als bestandsnaam.
Voorbeeld: `src/content/blog/mijn-nieuwe-artikel.md`

### 2. Frontmatter invullen (bovenaan het bestand)
```
---
title: Jouw titel hier
date: 2026-07-01
description: Korte samenvatting voor Google (max 160 tekens)
image: /blog/images/jouw-afbeelding.jpg
lead: De eerste alinea die cursief verschijnt boven het artikel.
author: Mijn Teamkompas
---
```

### 3. Afbeelding toevoegen
Zet de afbeelding in: `public/blog/images/`

### 4. Artikel schrijven (onder de frontmatter)
Gebruik standaard markdown:
- `## Kopje` voor tussenkopjes
- `*cursief*` voor cursieve tekst
- `**vet**` voor vette tekst
- `> tekst` voor een blockquote (grijs kader links)
- `- - -` voor een horizontale lijn

### 5. Pushen naar GitHub
```bash
cd ~/Desktop/het-teamkompas
git add src/content/blog/mijn-nieuwe-artikel.md
git add public/blog/images/jouw-afbeelding.jpg
git commit -m "Blog: titel van het artikel"
git push origin main
```

Na 1-2 minuten staat het artikel live op mijnteamkompas.nl/blog.

## CMS-alternatief
Je kunt ook via het CMS schrijven: mijnteamkompas.nl/admin
Log in met je GitHub-account — dan hoef je geen code aan te raken.

## Sitemap bijwerken (voor Google)
Voeg na elk nieuw artikel een regel toe aan `public/sitemap.xml`:
```xml
<url>
  <loc>https://www.mijnteamkompas.nl/blog/mijn-nieuwe-artikel</loc>
  <lastmod>2026-07-01</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.75</priority>
</url>
```
