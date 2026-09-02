// Advies over twee anderen: hoe landen zij op elkaar?
//
// Het advies ging tot nu toe altijd over jou en één ander. Voor wie een team
// begeleidt of leidt is dat net niet de vraag. Je ziet twee mensen schuren en
// je wilt weten waar dat vandaan komt — niet hoe jíj met een van beiden werkt.
//
// Wat hier met opzet niet gebeurt:
//
//   - Geen oordeel over wie zich moet aanpassen. Er staat waar ze iets anders
//     nodig hebben, niet wie er naast zit.
//   - Geen nieuwe interpretatie van hun profielen. Wat je leest is wat zij zelf
//     hebben opgeschreven en met dit team hebben gedeeld, letterlijk, naast
//     elkaar. Precies dezelfde zinnen die iedereen in het team al kan zien.
//   - Geen advies aan hen. Het advies is aan jou, en het gaat over het gesprek
//     dat je met ze kunt voeren — niet over wat zij zouden moeten doen.
//
// Bij drie of meer mensen mag er geen naam bij een voorkeur staan: dan ontstaat
// er een meerderheid en dus een afwijkende. Bij precies twee bestaat die
// meerderheid niet — het is symmetrisch, en beide namen staan er even hard bij.
//
// Volledig deterministisch, net als de rest. Geen taalmodel.

import { deelzin, kenmerk } from "../../../data/app/kenmerken.js";
import { situatie } from "../../../data/app/situaties.js";
import { ADVIESKADER } from "../../../data/app/adviesblokken.js";
import { vraagtVan } from "../../../data/app/groepsblokken.js";
import { bepaalWaarden, MAX_BLOKKEN } from "./regels.js";

/**
 * @param {object} gegevens
 * @param {object} gegevens.eerste     { naam, kenmerken }
 * @param {object} gegevens.tweede     { naam, kenmerken }
 * @param {string} gegevens.situatieId
 */
export function steltDuoadviesSamen({ eerste, tweede, situatieId } = {}) {
  const s = situatie(situatieId);
  const namen = [(eerste && eerste.naam) || "de een", (tweede && tweede.naam) || "de ander"];

  const waardenA = bepaalWaarden((eerste && eerste.kenmerken) || []);
  const waardenB = bepaalWaarden((tweede && tweede.kenmerken) || []);

  // Alleen kenmerken waar van allebei iets bekend is. Zonder de tweede kant valt
  // er niets te zeggen over hoe ze op elkaar landen.
  const samen = Object.keys(waardenA).filter((id) => waardenB[id]);

  const volgorde = s ? s.kenmerken : [];
  const positie = (id) => {
    const i = volgorde.indexOf(id);
    return i === -1 ? volgorde.length + 5 : i;
  };

  const kant = (naam, kenmerkId, waarde) => ({
    naam,
    deelt: deelzin(kenmerkId, waarde),
    vraagt: vraagtVan(kenmerkId, waarde),
  });

  const rij = (kenmerkId) => ({
    kenmerkId,
    label: (kenmerk(kenmerkId) || {}).label || kenmerkId,
    positie: positie(kenmerkId),
    kanten: [
      kant(namen[0], kenmerkId, waardenA[kenmerkId].waarde),
      kant(namen[1], kenmerkId, waardenB[kenmerkId].waarde),
    ],
  });

  // Een kant zonder deelzin zegt niets; dan is er niets om naast elkaar te
  // zetten en valt het kenmerk weg.
  const bruikbaar = (r) => r.kanten.every((k) => Boolean(k.deelt));

  const verschillen = samen
    .filter((id) => waardenA[id].waarde !== waardenB[id].waarde)
    .map(rij)
    .filter(bruikbaar)
    .sort((a, b) => a.positie - b.positie || a.kenmerkId.localeCompare(b.kenmerkId));

  const gelijk = samen
    .filter((id) => waardenA[id].waarde === waardenB[id].waarde)
    .map(rij)
    .filter(bruikbaar)
    .sort((a, b) => a.positie - b.positie || a.kenmerkId.localeCompare(b.kenmerkId));

  const opmerkingen = [];
  if (samen.length === 0) {
    opmerkingen.push(
      `${namen[0]} en ${namen[1]} hebben nog geen punten gedeeld die over hetzelfde gaan. Er valt daardoor nog niets te zeggen over hoe ze op elkaar landen.`
    );
  } else if (verschillen.length === 0) {
    opmerkingen.push(
      `Op de punten die van allebei bekend zijn, willen ${namen[0]} en ${namen[1]} ongeveer hetzelfde. Wat er tussen hen speelt komt dan waarschijnlijk ergens anders vandaan dan uit een verschil in werkwijze.`
    );
  }

  return {
    soort: "duo",
    situatie: s ? { id: s.id, label: s.label, opening: s.opening } : null,
    namen,
    verschillen: verschillen.slice(0, MAX_BLOKKEN),
    gelijk: gelijk.slice(0, MAX_BLOKKEN),
    aantalBeschikbaar: verschillen.length,
    opmerkingen,
    // Aan jou, niet aan hen: het advies gaat over het gesprek dat jij kunt
    // voeren, niet over wat zij zouden moeten doen.
    afsluiter: `Dit is wat ${namen[0]} en ${namen[1]} zelf met dit team hebben gedeeld, naast elkaar gezet. Het zegt niet wie er gelijk heeft — het laat zien waar ze iets anders nodig hebben. Het bruikbaarst is het als je het aan hen allebei voorlegt in plaats van er zelf een conclusie uit te trekken.`,
    transparantie: ADVIESKADER.transparantie,
  };
}
