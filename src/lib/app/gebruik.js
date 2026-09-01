// Wat er met de app gebeurt, opgeteld.
//
// Dit is productfeedback, geen personeelsinformatie. Van elke adviessessie
// weten we alleen dát er advies is gevraagd, bij welke situatie, of het
// bruikbaar was en — als het dat niet was — wat er miste. Nooit over wie het
// ging of wat er stond.
//
// Er wordt hier bewust niets per persoon of per team teruggegeven, ook al staat
// er een uid op de sessies. Die uid is er om iemand zijn eigen sessies te laten
// beoordelen en te laten verwijderen, niet om te kunnen zien wie wat vroeg. Wie
// dat wél zou tonen, maakt het instrument onbruikbaar: mensen vragen geen
// advies meer over wat er echt speelt als hun leidinggevende meekijkt.
//
// De enige uitzondering is `mensen`: hoeveel verschillende mensen de app
// gebruikten. Een aantal, geen lijst.

/** Zet een Firestore-timestamp, Date of getal om naar een Date, of null. */
function alsDatum(waarde) {
  if (!waarde) return null;
  if (waarde instanceof Date) return Number.isNaN(waarde.getTime()) ? null : waarde;
  if (typeof waarde.toDate === "function") {
    try {
      return waarde.toDate();
    } catch {
      return null;
    }
  }
  const d = new Date(waarde);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** De maandad van een datum als "2026-08", zodat sorteren op tekst klopt. */
export function maandVan(datum) {
  const d = alsDatum(datum);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export function maandLabel(maand) {
  const [jaar, nr] = String(maand || "").split("-");
  const index = Number(nr) - 1;
  if (!jaar || index < 0 || index > 11) return maand || "";
  return `${MAANDEN[index]} ${jaar}`;
}

/** Van hoeveel beoordeelde sessies was het advies bruikbaar? Null als er nog niets beoordeeld is. */
export function percentageBruikbaar(beoordeeld, bruikbaar) {
  if (!beoordeeld) return null;
  return Math.round((bruikbaar / beoordeeld) * 100);
}

/**
 * @param sessies  [{ uid, situatieId, bruikbaar, toelichting, opgevraagdOp }]
 * @param labelVan (situatieId) => leesbare naam
 */
export function vatGebruikSamen(sessies = [], labelVan = (id) => id) {
  const lijst = (sessies || []).filter(Boolean);

  const perSituatie = new Map();
  const perMaand = new Map();
  const mensen = new Set();
  const toelichtingen = [];

  let beoordeeld = 0;
  let bruikbaar = 0;

  lijst.forEach((s) => {
    if (s.uid) mensen.add(s.uid);

    const id = s.situatieId || "onbekend";
    if (!perSituatie.has(id)) {
      perSituatie.set(id, { situatieId: id, label: labelVan(id) || id, aantal: 0, beoordeeld: 0, bruikbaar: 0 });
    }
    const rij = perSituatie.get(id);
    rij.aantal += 1;

    if (typeof s.bruikbaar === "boolean") {
      beoordeeld += 1;
      rij.beoordeeld += 1;
      if (s.bruikbaar) {
        bruikbaar += 1;
        rij.bruikbaar += 1;
      }
    }

    const maand = maandVan(s.opgevraagdOp);
    if (maand) perMaand.set(maand, (perMaand.get(maand) || 0) + 1);

    const tekst = String(s.toelichting || "").trim();
    if (tekst) {
      toelichtingen.push({
        tekst,
        situatie: labelVan(id) || id,
        maand,
        op: alsDatum(s.opgevraagdOp),
      });
    }
  });

  const situaties = [...perSituatie.values()]
    .map((r) => ({ ...r, percentage: percentageBruikbaar(r.beoordeeld, r.bruikbaar) }))
    // Vaakst gekozen bovenaan; bij gelijk aantal op naam, zodat de volgorde
    // niet wisselt tussen twee keer laden.
    .sort((a, b) => b.aantal - a.aantal || String(a.label).localeCompare(String(b.label), "nl"));

  const maanden = [...perMaand.entries()]
    .map(([maand, aantal]) => ({ maand, label: maandLabel(maand), aantal }))
    .sort((a, b) => a.maand.localeCompare(b.maand));

  toelichtingen.sort((a, b) => (b.op ? b.op.getTime() : 0) - (a.op ? a.op.getTime() : 0));

  return {
    totaal: lijst.length,
    mensen: mensen.size,
    beoordeeld,
    bruikbaar,
    percentage: percentageBruikbaar(beoordeeld, bruikbaar),
    situaties,
    maanden,
    toelichtingen,
  };
}
