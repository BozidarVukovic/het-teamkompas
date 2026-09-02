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
//
// Wie het team begeleidt staat er niet bij. Die is er om het team op te zetten,
// niet om erin samen te werken — en hij deelt met dit team ook niets. Zonder
// deze uitzondering staat de facilitator tussen de mensen van zijn klant.

import { doetMee } from "./teamrollen.js";

export function collegasVan({ leden = [], gedeeld = {}, profielleden = [], eigenUid = null } = {}) {
  const echt = (leden || [])
    .filter((l) => l && l.uid && l.uid !== eigenUid && doetMee(l))
    .map((l) => ({
      ...l,
      sleutel: l.uid,
      doorBeheerder: false,
      kenmerken: ((gedeeld || {})[l.uid] || {}).kenmerken || [],
      // Wat iemand in eigen woorden schreef en met dit team deelde. Het advies
      // citeert daaruit; zie regels.js.
      handleiding: ((gedeeld || {})[l.uid] || {}).handleiding || [],
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
      // Een toegevoegd profiel komt uit een Insights-rapport; er zijn geen
      // eigen woorden, want die persoon heeft niets geschreven.
      handleiding: [],
    }));

  return [...echt, ...toegevoegd]
    .map((c) => ({ ...c, punten: (c.kenmerken || []).length }))
    .sort((a, b) => String(a.naam || "").localeCompare(String(b.naam || ""), "nl"));
}

/**
 * Eén regel onder een naam: wie het is en wat er van diegene bekend is.
 *
 * De functie staat vooraan als iemand er een heeft ingevuld. Hij zegt vanuit
 * welke rol iemand meedoet, en dat is bruikbaarder dan een aantal.
 */
export function collegaInEenZin(collega) {
  if (!collega) return "";

  const delen = [];
  if (collega.functie) delen.push(collega.functie);

  if (collega.punten === 0) {
    delen.push("Heeft nog niets gedeeld");
  } else {
    const punten = `${collega.punten} ${collega.punten === 1 ? "punt" : "punten"}`;
    delen.push(
      collega.doorBeheerder
        ? `${punten} · toegevoegd door ${collega.toegevoegdDoorNaam || "een beheerder"}`
        : `${punten} gedeeld`
    );
  }

  return delen.join(" · ");
}
