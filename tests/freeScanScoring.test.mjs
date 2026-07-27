import test from "node:test";
import assert from "node:assert/strict";
import { calculateFreeScanResults, zoneFor } from "../src/lib/freeScanScoring.js";
import { FREE_SCAN_QUESTIONS, FREE_SCAN_VERSION } from "../src/data/freeScanConfig.js";

const answers=(value)=>Object.fromEntries(FREE_SCAN_QUESTIONS.map(q=>[q.id,value]));
test("normaliseert een vijfpuntsschaal naar 0–100",()=>{const r=calculateFreeScanResults(answers(5));assert.equal(r.themeScores[0].score,100);assert.equal(r.scoreModelVersion,FREE_SCAN_VERSION)});
test("kent ontwikkelzones toe op configureerbare grenzen",()=>{assert.equal(zoneFor(75).id,"strong");assert.equal(zoneFor(55).id,"attention");assert.equal(zoneFor(54).id,"pattern")});
test("negeert ontbrekende en n.v.t.-antwoorden",()=>{const a=answers(3);a.v1="nvt";delete a.v2;const r=calculateFreeScanResults(a);assert.equal(r.themeScores.find(t=>t.id==="veiligheid").answered,2);assert.equal(r.themeScores.find(t=>t.id==="veiligheid").score,50)});
test("selecteert maximaal drie patronen en adviezen deterministisch",()=>{const a=answers(3);for(const q of FREE_SCAN_QUESTIONS.filter(q=>q.theme==="verbinding"))a[q.id]=5;for(const q of FREE_SCAN_QUESTIONS.filter(q=>q.theme==="energie"||q.theme==="communicatie"))a[q.id]=1;const r=calculateFreeScanResults(a);assert.ok(r.patterns.some(p=>p.id==="betrokken_lage_energie"));assert.ok(r.patterns.length<=3);assert.equal(r.reflections.length,2)});
