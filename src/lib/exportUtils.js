export function exporteerScanAlsCsv(lijst, antwoorden) {
  const stellingen = lijst.stellingen || DEFAULT_STELLINGEN;
  const nu = new Date();
  const datumLabel = nu.toLocaleDateString("nl-NL").replace(/\//g, "-");

  // Helper: bereken domeinscores per respondent op basis van schaalvragen
  const berekenRespondentScores = (respondent) => {
    const pijlerMap = {};
    stellingen.filter(s => s.type === "schaal").forEach(s => {
      const val = respondent.antwoorden?.[s.id];
      if (val === undefined || val === null || val === "") return;
      const num = parseFloat(val);
      if (Number.isNaN(num)) return;
      const pijler = s.pijler !== undefined ? s.pijler : (s.dimensieCode || "overig");
      if (!pijlerMap[pijler]) pijlerMap[pijler] = [];
      pijlerMap[pijler].push(num);
    });
    const avg = arr => arr && arr.length ? Math.round((arr.reduce((a,b)=>a+b,0) / arr.length) * 100) / 100 : null;
    const pijlerLabels = {
      0: "Veiligheid & Leiderschap",
      1: "Beleving van Verandering",
      2: "Energie & Motivatie",
      3: "Verbeteren & Leren",
      4: "Gedrag (centraal)",
    };
    const result = {};
    Object.keys(pijlerMap).forEach(k => {
      const label = pijlerLabels[k] !== undefined ? pijlerLabels[k] : `Dimensie ${k}`;
      result[label] = avg(pijlerMap[k]);
    });
    return result;
  };

  // Escape helper voor CSV-waarden
  const esc = (val) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes(";")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Haal alle unieke domeinlabels op over alle respondenten heen voor kolomkoppen
  const alleDomeinen = new Set();
  antwoorden.forEach(a => {
    const scores = berekenRespondentScores(a);
    Object.keys(scores).forEach(d => alleDomeinen.add(d));
  });
  const domeinKolommen = Array.from(alleDomeinen).sort();

  // Sorteer stellingen op id voor consistente kolomvolgorde
  const stellingenGesorteerd = [...stellingen].sort((a,b) => (a.id || 0) - (b.id || 0));

  // Bouw header
  const header = [
    "respondent_id",
    "klant",
    "vragenlijst_naam",
    "vragenlijst_id",
    "scan_type",
    "rol",
    "ingediend_op",
    ...domeinKolommen.map(d => `score_${d}`),
    ...stellingenGesorteerd.map(s => {
      const prefix = s.type === "open" ? "open" : "schaal";
      const dim = s.dimensie ? ` [${s.dimensie}]` : (s.pijler !== undefined ? ` [pijler_${s.pijler}]` : "");
      return `${prefix}_${s.id}${dim}: ${s.tekst || ""}`;
    }),
  ];

  // Bouw rijen
  const rijen = antwoorden.map(a => {
    const ts = a.ingediend_op?.seconds
      ? new Date(a.ingediend_op.seconds * 1000).toISOString()
      : (a.ingediend_op || "");
    const scores = berekenRespondentScores(a);
    return [
      a.id || "",
      lijst.klant || "",
      lijst.naam || "",
      lijst.id || "",
      lijst.type || "basisscan",
      a.rol || "",
      ts,
      ...domeinKolommen.map(d => scores[d] !== null && scores[d] !== undefined ? scores[d] : ""),
      ...stellingenGesorteerd.map(s => {
        const val = a.antwoorden?.[s.id];
        return val === undefined || val === null ? "" : val;
      }),
    ].map(esc).join(",");
  });

  const csv = [header.map(esc).join(","), ...rijen].join("\n");

  // UTF-8 BOM zodat Excel het correct opent met speciale tekens
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const klantSlug = (lijst.klant || "onbekend").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  const naamSlug = (lijst.naam || "scan").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  a.href = url;
  a.download = `scan-export-${klantSlug}-${naamSlug}-${datumLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}