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
      // Bij een toegevoegd profiel kan een beheerder tekst hebben overgenomen
      // uit een teamsessie: woorden die die persoon zelf schreef, maar niet in
      // de app heeft bevestigd. Staat er niets, dan blijft het leeg.
      handleiding: pl.handleiding || [],
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

/**
 * Dezelfde regels, maar leeg gemaakt zodra ze voor iedereen hetzelfde zijn.
 *
 * Op het scherm waar je kiest over wie het gaat, hoort onder een naam te staan
 * wat die persoon van de anderen onderscheidt. Komen alle profielen uit
 * hetzelfde Insights-rapport en zijn ze door dezelfde beheerder toegevoegd, dan
 * staat er negen keer "12 punten · toegevoegd door Bozidar" en heb je er niets
 * aan. Doet er één echt teamlid mee, dan verschilt de regel weer en komt hij
 * vanzelf terug.
 *
 * Uitzondering: "Heeft nog niets gedeeld" blijft altijd staan. Dat is geen
 * onderscheid maar een waarschuwing -- het zegt dat er weinig advies uit gaat
 * komen. Die weglaten omdat hij voor iedereen geldt, verbergt precies het geval
 * waarin je hem het hardst nodig hebt.
 *
 * @param {object[]} collegas
 * @returns {string[]} even lang als de invoer, in dezelfde volgorde
 */
export function onderscheidendeZinnen(collegas = []) {
  const zinnen = collegas.map((c) => collegaInEenZin(c));

  const iemandDeeltNiets = collegas.some((c) => c && c.punten === 0);
  if (iemandDeeltNiets) return zinnen;

  return new Set(zinnen).size <= 1 ? zinnen.map(() => "") : zinnen;
}
