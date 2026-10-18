// Hoe kwartaalgegevens op het scherm komen te staan.
//
// Alles hier is tekst maken uit wat er is, en nooit iets invullen wat er niet
// is. "Nog niet ingevuld" is een antwoord; nul is dat niet.

import { geldigeWeek, weekAfstand, weekBegin, weekSleutel } from "./periode.js";
import { STATUSLABELS, geldigKwartaal, kwartaalPlus } from "./model.js";

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

/** "2027-K1" wordt "januari–maart 2027". Een cijfer zegt niemand iets. */
export function kwartaalLabel(sleutel) {
  if (!geldigKwartaal(sleutel)) return "";
  const [jaar, k] = sleutel.split("-K");
  const eerste = (Number(k) - 1) * 3;
  return `${MAANDEN[eerste]}–${MAANDEN[eerste + 2]} ${jaar}`;
}

/**
 * De kwartalen waaruit je kunt kiezen.
 *
 * Een terug en twee vooruit. Terug omdat je wilt kunnen terugkijken op wat er
 * is besloten; twee vooruit omdat je in december het kwartaal erna plant en in
 * maart alvast het jaar erop ziet liggen. Verder dan dat is geen planning meer.
 */
export function kwartaalOpties(huidig) {
  if (!geldigKwartaal(huidig)) return [];
  return [-1, 0, 1, 2].map((n) => {
    const sleutel = kwartaalPlus(huidig, n);
    return {
      sleutel,
      label: kwartaalLabel(sleutel),
      nu: n === 0,
      voorbij: n < 0,
    };
  });
}

/** De maandag van een week, als datum voor een datumveld. */
export function datumVanWeek(sleutel) {
  const begin = weekBegin(sleutel);
  return begin ? begin.toISOString().slice(0, 10) : "";
}

/** De week waarin een gekozen datum valt. */
export function weekVanDatum(waarde) {
  if (!waarde) return "";
  const d = new Date(`${waarde}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : weekSleutel(d);
}

/**
 * "week 2 t/m 9 van 2027", of over de jaargrens heen met beide jaren erbij.
 *
 * Een omgedraaide periode levert niets op, net als overal elders in de kern.
 * "Week 9 t/m 2" las als een geldige periode terwijl het een invoerfout is, en
 * een tekst die dat verbergt is erger dan een lege plek.
 */
export function periodeLabel(periode) {
  if (!periode || !geldigeWeek(periode.van) || !geldigeWeek(periode.tot)) return "";
  if (weekAfstand(periode.van, periode.tot) < 0) return "";
  const [vanJaar, vanWeek] = periode.van.split("-W");
  const [totJaar, totWeek] = periode.tot.split("-W");
  if (periode.van === periode.tot) return `week ${Number(vanWeek)} van ${vanJaar}`;
  if (vanJaar === totJaar) return `week ${Number(vanWeek)} t/m ${Number(totWeek)} van ${vanJaar}`;
  return `week ${Number(vanWeek)} ${vanJaar} t/m week ${Number(totWeek)} ${totJaar}`;
}

/** Hoeveel weken een periode beslaat, als leesbare tekst. */
export function duurLabel(periode) {
  if (!periode || !geldigeWeek(periode.van) || !geldigeWeek(periode.tot)) return "";
  const n = weekAfstand(periode.van, periode.tot);
  if (n === null || n < 0) return "";
  return n === 0 ? "1 week" : `${n + 1} weken`;
}

/** Uren zoals je ze uitspreekt: 2,5 en niet 2.5 of 2,50. */
export function urenLabel(uren) {
  if (typeof uren !== "number" || !Number.isFinite(uren)) return "niet ingevuld";
  const schoon = Math.round(uren * 100) / 100;
  return `${String(schoon).replace(".", ",")} uur per week`;
}

/**
 * Wie dit kan zien.
 *
 * Met zoveel woorden op de kaart, want het verschil tussen een concept en een
 * gedeeld doel is op het scherm verder niet te zien -- en juist dat verschil
 * bepaalt of je collega's het lezen.
 */
export function zichtbaarVoor(doel) {
  if (!doel) return "";
  return doel.status === "concept" ? "Alleen jij ziet dit" : "Je team kan dit zien";
}

/** Wat de knop doet die een doel een stap verder brengt. */
export function volgendeStap(doel) {
  if (!doel) return null;
  if (doel.status === "concept") {
    return { naar: "ter-afstemming", label: "Delen met het team", uitleg: "Je team kan het lezen. Er is nog niets afgesproken." };
  }
  if (doel.status === "ter-afstemming") {
    return { naar: "afgesproken", label: "Vastleggen als afgesproken", uitleg: "Doe dit pas als het team erover heeft gesproken." };
  }
  if (doel.status === "gepauzeerd") {
    return { naar: "afgesproken", label: "Weer oppakken", uitleg: "" };
  }
  return null;
}

/**
 * De volgorde van de lijst.
 *
 * Wat loopt bovenaan, wat nog van jou alleen is eronder, en wat klaar of
 * gestopt is onderaan. Binnen een groep op titel, zodat de lijst niet
 * verspringt tussen twee keer kijken. Geen score en geen rangorde: dit is de
 * volgorde van de status en die staat ook op het scherm.
 */
const VOLGORDE = ["afgesproken", "ter-afstemming", "concept", "gepauzeerd", "afgerond", "gestopt"];

export function sorteerDoelen(doelen = []) {
  return [...doelen].sort(
    (a, b) =>
      VOLGORDE.indexOf(a.status) - VOLGORDE.indexOf(b.status) ||
      String(a.titel || "").localeCompare(String(b.titel || ""))
  );
}

/** De statuslabels, voor het scherm. */
export { STATUSLABELS };

/**
 * Wat er van een doel op de kaart komt te staan.
 *
 * Alleen regels waar iets in staat. Een lege regel "Gewenst: —" vertelt niets
 * en maakt de kaart alleen langer.
 */
export function kaartregels(doel, bijdragen = []) {
  const eigen = bijdragen.filter((b) => b && b.doelId === doel.id);
  const regels = [];

  if (doel.gewenstVan && doel.gewenstTot) {
    regels.push({ wat: "Gewenst", tekst: periodeLabel({ van: doel.gewenstVan, tot: doel.gewenstTot }) });
  }
  if (eigen.length > 0) {
    const metUren = eigen.filter((b) => typeof b.urenPerWeek === "number");
    regels.push({
      wat: "Mijn inzet",
      tekst:
        metUren.length === 0
          ? "nog geen urenschatting"
          : metUren.map((b) => `${urenLabel(b.urenPerWeek)} (${periodeLabel({ van: b.van, tot: b.tot })})`).join(" · "),
    });
  }
  if (doel.teamdoel) regels.push({ wat: "Hoort bij", tekst: doel.teamdoel });
  return regels;
}
