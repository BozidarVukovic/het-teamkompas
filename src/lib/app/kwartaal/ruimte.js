// Beschikbare ruimte, belasting, en wat er per week overblijft.
//
// De vraag die deze module beantwoordt is "past dit erbij", en het eerlijke
// antwoord daarop is vaak "dat weten we niet". Die uitkomst is hier net zo
// goed uitgewerkt als een getal, want een tool die bij ontbrekende gegevens
// nul invult, rekent een team rijk.
//
// Vier regels die door alles heen lopen:
//
//   1. Vergelijken gebeurt per persoon en per week. Een teamtotaal zegt of het
//      rekenkundig uitkomt, niet of de juiste persoon tijd heeft.
//   2. Onbekend is niet nul. Een bijdrage zonder urenschatting telt niet mee
//      in het totaal en komt wél in de aannames te staan.
//   3. Niets wordt dubbel geteld. Een project heeft zelf geen uren; de uren
//      zitten in de bijdragen van de mensen die eraan werken.
//   4. Geschatte ruimte is geen toezegging. Wat hier uitkomt is wat mensen
//      zelf hebben opgeschreven, met de datum erbij.

import { gedeeldeWeken, geldigeWeek, inPeriode, omspannendePeriode, wekenIn } from "./periode.js";

/**
 * Welke status van een bijdrage telt waarin mee.
 *
 * Een concept is privé en bestaat voor het team niet -- het mag dus ook niet
 * meetellen in een teamtotaal dat anderen zien. "Ter afstemming" telt apart:
 * het is voorgesteld, niet afgesproken, en het verschil tussen die twee is
 * precies waar het gesprek over gaat. Gepauzeerd, gestopt en afgerond vragen
 * geen uren meer in de weken die nog komen.
 */
export const TELT_ALS = {
  concept: null,
  "ter-afstemming": "voorgesteld",
  afgesproken: "afgesproken",
  gepauzeerd: null,
  afgerond: null,
  gestopt: null,
};

export const STATUSSEN = Object.keys(TELT_ALS);

export function telsoortVan(status) {
  return Object.prototype.hasOwnProperty.call(TELT_ALS, status) ? TELT_ALS[status] : null;
}

/** Is dit een bruikbaar urenaantal, of is het onbekend? */
export function bekendeUren(waarde) {
  return typeof waarde === "number" && Number.isFinite(waarde) && waarde >= 0;
}

/* ═══════════════════════════════════════════════ de ruimte van één persoon

   Iemand schrijft zelf op hoeveel uur per week hij voor kwartaaldoelen heeft,
   voor een reeks weken. Niet zijn contracturen: wat er overblijft naast het
   reguliere werk, andere verplichtingen, afwezigheid en de buffer die hij
   zelf wil houden. Waarom hij minder ruimte heeft, staat er niet bij en hoort
   er niet bij te staan.

   Meerdere regels mogen elkaar niet overlappen. Doen ze dat toch, dan wint de
   laatste en komt de botsing in de aannames terecht -- stil kiezen zou
   betekenen dat iemands vakantieweek ongemerkt weer vol komt te staan. */

export function ruimteInWeek(regels = [], week) {
  if (!geldigeWeek(week)) return { uren: null, regels: 0 };
  const raak = (Array.isArray(regels) ? regels : []).filter(
    (r) => r && inPeriode(r, week) && bekendeUren(r.urenPerWeek)
  );
  if (raak.length === 0) return { uren: null, regels: 0 };
  return { uren: raak[raak.length - 1].urenPerWeek, regels: raak.length };
}

/* ══════════════════════════════════════════════════════ belasting per week */

/**
 * Wat er in één week op één persoon staat.
 *
 * @returns {{afgesproken: number, voorgesteld: number, onbekend: string[]}}
 */
export function belastingInWeek(bijdragen = [], week) {
  const uit = { afgesproken: 0, voorgesteld: 0, onbekend: [] };
  for (const b of Array.isArray(bijdragen) ? bijdragen : []) {
    if (!b || !inPeriode(b, week)) continue;
    const soort = telsoortVan(b.status);
    if (!soort) continue;
    if (!bekendeUren(b.urenPerWeek)) {
      uit.onbekend.push(b.id);
      continue;
    }
    uit[soort] += b.urenPerWeek;
  }
  return uit;
}

/* ═══════════════════════════════════════════════════════════ het hele beeld */

function rond(getal) {
  // Uren worden in kwartieren ingevoerd; drijvende komma maakt er anders
  // 6.999999999999999 van zodra je drie keer 2,33 optelt.
  return Math.round(getal * 100) / 100;
}

/**
 * Het beeld van een team over een reeks weken.
 *
 * @param personen  [{uid, naam, ruimte: [{van, tot, urenPerWeek}], bijgewerktOp}]
 * @param bijdragen [{id, doelId, uid, urenPerWeek, van, tot, status}]
 * @param periode   de weken waarover gekeken wordt; standaard de weken waarin
 *                  er iets staat
 */
export function maakBeeld({ personen = [], bijdragen = [], periode = null } = {}) {
  const alles = (Array.isArray(bijdragen) ? bijdragen : []).filter((b) => b && b.uid && telsoortVan(b.status));
  const grenzen = periode
    ? [periode]
    : [...alles.map((b) => ({ van: b.van, tot: b.tot })), ...personen.flatMap((p) => p.ruimte || [])];
  const venster = periode || omspannendePeriode(grenzen);
  const weken = wekenIn(venster);

  const aannames = [];
  const perPersoon = personen.map((p) => {
    const eigen = alles.filter((b) => b.uid === p.uid);
    const rijen = weken.map((week) => {
      const ruimte = ruimteInWeek(p.ruimte, week);
      const belasting = belastingInWeek(eigen, week);
      const gepland = rond(belasting.afgesproken + belasting.voorgesteld);
      const bekend = ruimte.uren !== null;
      return {
        week,
        ruimte: ruimte.uren,
        afgesproken: rond(belasting.afgesproken),
        voorgesteld: rond(belasting.voorgesteld),
        onbekend: belasting.onbekend,
        // Zonder ruimte is er geen vrij en geen tekort -- alleen een
        // onbeantwoorde vraag. null is hier het antwoord, niet nul.
        vrij: bekend ? rond(ruimte.uren - gepland) : null,
        tekort: bekend ? rond(Math.max(0, gepland - ruimte.uren)) : null,
      };
    });

    const zonderRuimte = rijen.filter((r) => r.ruimte === null).length;
    if (zonderRuimte === rijen.length && rijen.length > 0) {
      aannames.push(`${p.naam || p.uid} heeft nog geen beschikbare ruimte ingevuld.`);
    } else if (zonderRuimte > 0) {
      aannames.push(`${p.naam || p.uid} heeft voor ${zonderRuimte} van de ${rijen.length} weken geen ruimte ingevuld.`);
    }
    if ((p.ruimte || []).some((r, i) => (p.ruimte || []).slice(i + 1).some((ander) => gedeeldeWeken(r, ander).length > 0))) {
      aannames.push(`De ingevulde ruimte van ${p.naam || p.uid} overlapt zichzelf; de laatste regel telt.`);
    }

    return {
      uid: p.uid,
      naam: p.naam || "",
      bijgewerktOp: p.bijgewerktOp || null,
      weken: rijen,
      overbelast: rijen.filter((r) => r.tekort > 0).map((r) => ({ week: r.week, tekort: r.tekort })),
    };
  });

  const zonderSchatting = [...new Set(alles.filter((b) => !bekendeUren(b.urenPerWeek)).map((b) => b.id))];
  if (zonderSchatting.length > 0) {
    aannames.push(
      zonderSchatting.length === 1
        ? "Eén bijdrage heeft nog geen urenschatting en telt daarom niet mee."
        : `${zonderSchatting.length} bijdragen hebben nog geen urenschatting en tellen daarom niet mee.`
    );
  }

  const buitenBeeld = alles.filter((b) => b.uid && !personen.some((p) => p.uid === b.uid));
  if (buitenBeeld.length > 0) {
    aannames.push(`${buitenBeeld.length} bijdragen horen bij iemand die niet in dit overzicht staat.`);
  }

  // Het teamtotaal is de optelling van de personen en nooit een eigen
  // boekhouding: anders kan het van de personen gaan afwijken zonder dat
  // iemand ziet waar.
  const team = weken.map((week, i) => {
    const rijen = perPersoon.map((p) => p.weken[i]).filter(Boolean);
    const metRuimte = rijen.filter((r) => r.ruimte !== null);
    const volledig = metRuimte.length === rijen.length && rijen.length > 0;
    const ruimte = metRuimte.reduce((s, r) => s + r.ruimte, 0);
    const afgesproken = rijen.reduce((s, r) => s + r.afgesproken, 0);
    const voorgesteld = rijen.reduce((s, r) => s + r.voorgesteld, 0);
    return {
      week,
      ruimte: metRuimte.length > 0 ? rond(ruimte) : null,
      ruimteVolledig: volledig,
      afgesproken: rond(afgesproken),
      voorgesteld: rond(voorgesteld),
      vrij: metRuimte.length > 0 ? rond(ruimte - afgesproken - voorgesteld) : null,
      tekort: metRuimte.length > 0 ? rond(Math.max(0, afgesproken + voorgesteld - ruimte)) : null,
    };
  });

  const bijgewerkt = personen
    .map((p) => p.bijgewerktOp)
    .filter(Boolean)
    .sort();

  return {
    periode: venster,
    weken,
    perPersoon,
    team,
    aannames,
    // Niet "beschikbaar" maar "zoals ingevuld": dit is wat mensen zelf hebben
    // opgeschreven en geen toezegging die iemand aan ze kan ophangen.
    oudsteInvoer: bijgewerkt[0] || null,
    nieuwsteInvoer: bijgewerkt[bijgewerkt.length - 1] || null,
  };
}

/** De weken waarin iemand meer op zich heeft staan dan hij ruimte heeft. */
export function overbelasting(beeld) {
  if (!beeld) return [];
  return beeld.perPersoon
    .filter((p) => p.overbelast.length > 0)
    .map((p) => ({ uid: p.uid, naam: p.naam, weken: p.overbelast }));
}

/** Het grootste tekort op teamniveau, met de week erbij. */
export function grootsteTekort(beeld) {
  if (!beeld) return null;
  const met = beeld.team.filter((w) => w.tekort !== null && w.tekort > 0);
  if (met.length === 0) return null;
  return met.reduce((a, b) => (b.tekort > a.tekort ? b : a));
}
