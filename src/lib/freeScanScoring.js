import { FREE_SCAN_QUESTIONS, FREE_SCAN_THEMES, PATTERN_RULES, SCORE_ZONES, SCORE_MODEL_VERSION } from "../data/freeScanConfig.js";

export function zoneFor(score) { return SCORE_ZONES.find((zone) => score >= zone.min) || SCORE_ZONES.at(-1); }

export function calculateFreeScanResults(answers = {}) {
  const themeScores = FREE_SCAN_THEMES.map((theme) => {
    const questions = FREE_SCAN_QUESTIONS.filter((item) => item.theme === theme.id);
    const values = questions.map((item) => {
      const raw = answers[item.id];
      if (raw === null || raw === "nvt" || raw === undefined || raw === "") return null;
      const numeric = Number(raw);
      if (!Number.isFinite(numeric) || numeric < 1 || numeric > 5) return null;
      return item.reverse ? 6 - numeric : numeric;
    }).filter((value) => value !== null);
    const score = values.length ? Math.round(((values.reduce((a,b)=>a+b,0) / values.length) - 1) * 25) : null;
    return { ...theme, score, answered: values.length, zone: score === null ? null : zoneFor(score) };
  });
  const ranked = themeScores.filter(t=>t.score !== null).sort((a,b)=>b.score-a.score);
  const patterns = PATTERN_RULES.filter(rule => {
    const high = themeScores.find(t=>t.id===rule.when.high)?.score;
    const low = themeScores.find(t=>t.id===rule.when.low)?.score;
    return high >= 75 && low < 55;
  }).slice(0,3);
  const strengths = ranked.slice(0,2);
  const opportunities = [...ranked].reverse().slice(0,2);
  return { themeScores, strengths, opportunities, patterns, reflections: opportunities.slice(0,3).map(t=>t.reflection), experiments: opportunities.slice(0,3).map(t=>t.experiment), scoreModelVersion: SCORE_MODEL_VERSION };
}
