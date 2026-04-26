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
export function isVeiligheidLeiderschapVerdieping(lijst) {
  return lijst?.type === "verdieping_veiligheid_leiderschap";
}

export function getVeiligheidLeiderschapDimensies(stellingen = []) {
  const seen = new Map();

  stellingen.forEach((s) => {
    if (!seen.has(s.dimensieCode)) {
      seen.set(s.dimensieCode, {
        code: s.dimensieCode,
        naam: s.dimensie,
        vragen: [],
      });
    }

    seen.get(s.dimensieCode).vragen.push(s);
  });

  return Array.from(seen.values());
}

export function getLaagsteVeiligheidLeiderschapScore(scores = {}) {
  const entries = Object.entries(scores || {}).filter(
    ([_, value]) => typeof value === "number" && Number.isFinite(value)
  );

  if (!entries.length) return null;

  return entries.sort((a, b) => a[1] - b[1])[0];
}

export function interpretVeiligheidLeiderschapScore(score, interpretatie = []) {
  return interpretatie.find((r) => score >= r.min && score <= r.max) || null;
}

export function isBelevingVeranderingVerdieping(lijst) {
  return lijst?.type === "verdieping_beleving_verandering";
}

export function isEnergieMotivatieVerdieping(lijst) {
  return lijst?.type === "verdieping_energie_motivatie";
}

export function isVerbeterenLerenVerdieping(lijst) {
  return lijst?.type === "verdieping_verbeteren_leren";
}

export function isGecombineerdeVerdieping(lijst) {
  return lijst?.type === "verdieping_gecombineerd";
}