import test from "node:test";
import assert from "node:assert/strict";
import { calculateFreeScanResults, zoneFor } from "../src/lib/freeScanScoring.js";
import { FREE_SCAN_QUESTIONS, FREE_SCAN_VERSION } from "../src/data/freeScanConfig.js";

const answers=(value)=>Object.fromEntries(FREE_SCAN_QUESTIONS.map(q=>[q.id,value]));
// Consistent positief: bij omgekeerde vragen hoort dan juist "helemaal oneens".
const consistentPositief=()=>Object.fromEntries(FREE_SCAN_QUESTIONS.map(q=>[q.id,q.reverse?1:5]));

test("normaliseert een vijfpuntsschaal naar 0–100",()=>{const r=calculateFreeScanResults(consistentPositief());assert.ok(r.themeScores.every(t=>t.score===100));assert.equal(r.scoreModelVersion,FREE_SCAN_VERSION)});

test("draait omgekeerde vragen om, zodat klakkeloos instemmen geen maximale score geeft",()=>{
  const omgekeerd=FREE_SCAN_QUESTIONS.filter(q=>q.reverse);
  assert.ok(omgekeerd.length>0,"er moet minstens één omgekeerde vraag zijn");
  const r=calculateFreeScanResults(answers(5));
  // Thema's met een omgekeerde vraag kunnen niet meer op 100 uitkomen.
  for(const thema of new Set(omgekeerd.map(q=>q.theme))){
    assert.ok(r.themeScores.find(t=>t.id===thema).score<100,`thema ${thema} zou onder 100 moeten blijven`);
  }
});
test("kent ontwikkelzones toe op configureerbare grenzen",()=>{assert.equal(zoneFor(75).id,"strong");assert.equal(zoneFor(55).id,"attention");assert.equal(zoneFor(54).id,"pattern")});
test("negeert ontbrekende en n.v.t.-antwoorden",()=>{const a=answers(3);a.v1="nvt";delete a.v2;const r=calculateFreeScanResults(a);assert.equal(r.themeScores.find(t=>t.id==="veiligheid").answered,2);assert.equal(r.themeScores.find(t=>t.id==="veiligheid").score,50)});
test("selecteert maximaal drie patronen en adviezen deterministisch",()=>{const a=answers(3);for(const q of FREE_SCAN_QUESTIONS.filter(q=>q.theme==="verbinding"))a[q.id]=5;for(const q of FREE_SCAN_QUESTIONS.filter(q=>q.theme==="energie"||q.theme==="communicatie"))a[q.id]=1;const r=calculateFreeScanResults(a);assert.ok(r.patterns.some(p=>p.id==="betrokken_lage_energie"));assert.ok(r.patterns.length<=3);assert.equal(r.reflections.length,2)});
