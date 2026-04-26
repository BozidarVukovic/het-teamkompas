export function berekenScanScoresVoorMeting(stellingen = [], antwoorden = {}) {
  const pijlerMap = {};
  stellingen
    .filter((s) => s.type === "schaal")
    .forEach((s) => {
      const raw = antwoorden?.[s.id];
      const val = raw === undefined || raw === null || raw === "" ? null : parseFloat(raw);
      if (val === null || Number.isNaN(val)) return;
      if (!pijlerMap[s.pijler]) pijlerMap[s.pijler] = [];
      pijlerMap[s.pijler].push(val);
    });

  const avg = (arr) => arr && arr.length ? Math.round((arr.reduce((a,b)=>a+b,0)/arr.length) * 10) / 10 : null;

  return {
    "Veiligheid & Leiderschap": avg(pijlerMap[0]),
    "Beleving van Verandering": avg(pijlerMap[1]),
    "Energie & Motivatie": avg(pijlerMap[2]),
    "Verbeteren & Leren": avg(pijlerMap[3]),
    "Gedrag (centraal)": avg(pijlerMap[4]),
  };
}