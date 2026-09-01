// De mensen in je team over wie je advies kunt vragen.
//
// Twee soorten door elkaar: teamgenoten met een eigen account, en profielen die
// een beheerder heeft toegevoegd op basis van een Insights-rapport. Voor de
// advieslogica maakt dat niets uit — over allebei valt evengoed iets te zeggen
// — maar in beeld moet het verschil wel te zien zijn, dus staat het erbij.
//
// Eén plek, zodat het startscherm en "Samenwerken met..." dezelfde mensen in
// dezelfde volgorde tonen. Stonden ze los, dan kon je op het ene scherm iemand
// zien die op het andere ontbrak.

export function collegasVan({ leden = [], gedeeld = {}, profielleden = [], eigenUid = null } = {}) {
  const echt = (leden || [])
    .filter((l) => l && l.uid && l.uid !== eigenUid)
    .map((l) => ({
      ...l,
      sleutel: l.uid,
      doorBeheerder: false,
      kenmerken: ((gedeeld || {})[l.uid] || {}).kenmerken || [],
    }));

  const toegevoegd = (profielleden || [])
    .filter((pl) => pl && pl.id)
    .map((pl) => ({
      uid: pl.id,
      sleutel: pl.id,
      naam: pl.naam,
      doorBeheerder: true,
      toegevoegdDoorNaam: pl.toegevoegdDoorNaam,
      kenmerken: pl.kenmerken || [],
    }));

  return [...echt, ...toegevoegd]
    .map((c) => ({ ...c, punten: (c.kenmerken || []).length }))
    .sort((a, b) => String(a.naam || "").localeCompare(String(b.naam || ""), "nl"));
}

/** Eén regel onder een naam: wat deze persoon heeft gedeeld, en van wie het komt. */
export function collegaInEenZin(collega) {
  if (!collega) return "";
  if (collega.punten === 0) return "Heeft nog niets gedeeld";

  const punten = `${collega.punten} ${collega.punten === 1 ? "punt" : "punten"}`;
  if (collega.doorBeheerder) {
    return `${punten} · toegevoegd door ${collega.toegevoegdDoorNaam || "een beheerder"}`;
  }
  return `${punten} gedeeld`;
}
