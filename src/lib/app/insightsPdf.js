// Het inlezen van een Insights Discovery-PDF, in de browser.
//
// Het bestand verlaat het apparaat niet. Er gaat niets naar een server, niets
// naar een taalmodel en niets naar Firebase: de PDF wordt hier gelezen, de
// tekst wordt geregeld uitgeplozen door insightsParser.js, en zodra dat klaar
// is verdwijnt het bestand uit het geheugen. Wat er bewaard wordt, zijn
// uitsluitend de kenmerken die de gebruiker daarna zelf bevestigt.
//
// pdf.js wordt pas geladen wanneer iemand echt een profiel uploadt. Dat scheelt
// ruim een megabyte voor iedereen die dat niet doet.

import { diagnoseregels, leesInsightsTekst } from "./insightsParser";

export const MAX_BESTANDSGROOTTE = 20 * 1024 * 1024;

let pdfjs = null;

async function laadPdfjs() {
  if (pdfjs) return pdfjs;
  const [lib, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  lib.GlobalWorkerOptions.workerSrc = worker.default;
  pdfjs = lib;
  return pdfjs;
}

/**
 * Haalt de tekstlaag uit een PDF.
 *
 * Regels worden hersteld op basis van de verticale positie van de stukjes
 * tekst: pdf.js levert losse fragmenten aan, en juist het regelverband maakt
 * het verschil tussen "Vurig Rood 82" en een los getal ergens op de pagina.
 */
export async function tekstUitPdf(bestand, { maxPaginas = 40 } = {}) {
  const lib = await laadPdfjs();
  const buffer = await bestand.arrayBuffer();
  const document = await lib.getDocument({ data: buffer, isEvalSupported: false }).promise;

  const paginas = [];
  const aantal = Math.min(document.numPages, maxPaginas);

  for (let nummer = 1; nummer <= aantal; nummer += 1) {
    const pagina = await document.getPage(nummer);
    const inhoud = await pagina.getTextContent();

    const regels = new Map();
    inhoud.items.forEach((item) => {
      if (!item.str || !item.transform) return;
      // Afronden op hele punten voegt fragmenten samen die op dezelfde regel
      // staan maar minimaal verschillen in hoogte.
      const hoogte = Math.round(item.transform[5]);
      const bestaand = regels.get(hoogte) || [];
      bestaand.push({ x: item.transform[4], tekst: item.str });
      regels.set(hoogte, bestaand);
    });

    const geordend = [...regels.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, stukken]) =>
        stukken
          .sort((a, b) => a.x - b.x)
          .map((s) => s.tekst)
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim()
      )
      .filter(Boolean);

    paginas.push(geordend.join("\n"));
    pagina.cleanup();
  }

  await document.destroy();
  return paginas.join("\n");
}

/**
 * Leest een PDF en geeft terug wat eruit te halen viel.
 *
 * Gooit een leesbare foutmelding wanneer het bestand niet deugt; de PDF zelf
 * wordt nergens bewaard.
 */
export async function leesInsightsPdf(bestand) {
  if (!bestand) throw new Error("Kies eerst een bestand.");
  if (bestand.size > MAX_BESTANDSGROOTTE) {
    throw new Error("Dit bestand is groter dan 20 MB. Een Insights-profiel is normaal veel kleiner.");
  }
  const isPdf =
    bestand.type === "application/pdf" || /\.pdf$/i.test(bestand.name || "");
  if (!isPdf) throw new Error("Kies een PDF-bestand.");

  let tekst = "";
  try {
    tekst = await tekstUitPdf(bestand);
  } catch {
    throw new Error("Deze PDF kon niet geopend worden. Is het bestand misschien beveiligd met een wachtwoord?");
  }

  if (tekst.trim().length < 200) {
    throw new Error(
      "In deze PDF zit geen leesbare tekst. Waarschijnlijk is het een scan of een afbeelding; vraag dan om het oorspronkelijke bestand."
    );
  }

  return { ...leesInsightsTekst(tekst), diagnose: diagnoseregels(tekst) };
}
