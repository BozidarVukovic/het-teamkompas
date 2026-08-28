// Het uitlezen van een Insights Discovery-profiel.
//
// Dit bestand kent geen PDF en geen browser: het krijgt platte tekst binnen en
// geeft terug wat het daarin herkend heeft. Daardoor is het te testen zonder
// bestand en zonder netwerk.
//
// De patronen zijn gemaakt op echte Nederlandse profielen (Personal Profile
// 2021 en Insights Discovery Profiel 2024). Beide zetten de kleurendynamica op
// dezelfde manier neer:
//
//   BLAUW GROEN GEEL ROOD BLAUW GROEN GEEL ROOD   <- kopregel, tweemaal vier
//   6 100 6                                        <- assen, hooguit drie getallen
//   1.28 4.28 4.40 4.68 1.60 1.32 4.72 1.72        <- acht waarden
//   21% 71% 73% 78% 27% 22% 79% 29%                <- acht percentages
//
// De eerste vier horen bij de bewuste persona; dat is waar we mee werken. De
// volgorde van de kleuren lezen we uit de kopregel, zodat een andere vololgorde
// in een toekomstige versie vanzelf goed gaat.
//
// Uitgangspunten: er wordt niets geraden, wat we niet zeker weten melden we als
// niet gevonden, en de uitkomst is altijd een voorstel dat de persoon zelf
// bevestigt. Geen taalmodel; vaste patronen, volledig deterministisch.

export const KLEUR_VOLGORDE = ["blauw", "groen", "geel", "rood"];

const KLEURNAMEN = {
  blauw: "blauw",
  blue: "blauw",
  groen: "groen",
  green: "groen",
  geel: "geel",
  yellow: "geel",
  rood: "rood",
  red: "rood",
};

/* ------------------------------------------------------- de acht wieltypen */

/**
 * De acht hoofdtypen van het Insightswiel, met hun kleurvoorkeur.
 * `kleuren` staat op volgorde van gewicht.
 */
export const BASISTYPEN = [
  { id: "hervormer", naam: "Hervormer", bijvoeglijk: ["hervormende"], kleuren: ["blauw", "rood"] },
  { id: "beslisser", naam: "Beslisser", bijvoeglijk: ["directieve", "besluitvaardige"], kleuren: ["rood"] },
  { id: "motivator", naam: "Motivator", bijvoeglijk: ["motiverende"], kleuren: ["rood", "geel"] },
  { id: "inspirator", naam: "Inspirator", bijvoeglijk: ["inspirerende"], kleuren: ["geel"] },
  { id: "bemiddelaar", naam: "Bemiddelaar", bijvoeglijk: ["bemiddelende"], kleuren: ["geel", "groen"] },
  { id: "supporter", naam: "Supporter", bijvoeglijk: ["ondersteunende", "supportende"], kleuren: ["groen"] },
  { id: "coordinator", naam: "Coördinator", bijvoeglijk: ["coördinerende", "coordinerende"], kleuren: ["groen", "blauw"] },
  { id: "observator", naam: "Observator", bijvoeglijk: ["observerende"], kleuren: ["blauw"] },
];

const zonderAccenten = (tekst) =>
  String(tekst || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

function basistypeUitWoord(woord) {
  const schoon = zonderAccenten(woord);
  return (
    BASISTYPEN.find((t) => zonderAccenten(t.naam) === schoon) ||
    BASISTYPEN.find((t) => t.bijvoeglijk.some((b) => zonderAccenten(b) === schoon)) ||
    null
  );
}

/**
 * Leidt de kleurvoorkeur af uit een typenaam als "Directieve Motivator".
 *
 * Het zelfstandig naamwoord is het hoofdtype; het bijvoeglijk naamwoord zegt
 * welke kant het op leunt. Bij "Directieve Motivator" is Motivator rood/geel en
 * wijst "directieve" naar de Beslisser (rood); rood wordt dan de voorkeur en
 * geel de tweede. Bij "Coördinerende Observator" is Observator blauw en voegt
 * "coördinerende" groen toe als tweede kleur.
 */
export function kleurenUitTypenaam(typenaam) {
  const woorden = String(typenaam || "")
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let hoofd = null;
  let bijvoeglijk = null;

  woorden.forEach((woord) => {
    const type = basistypeUitWoord(woord);
    if (!type) return;
    const isBijvoeglijk = type.bijvoeglijk.some((b) => zonderAccenten(b) === zonderAccenten(woord));
    if (isBijvoeglijk) bijvoeglijk = type;
    else hoofd = type;
  });

  if (!hoofd && bijvoeglijk) hoofd = bijvoeglijk;
  if (!hoofd) return null;

  const hoofdKleuren = hoofd.kleuren;
  const leunt = bijvoeglijk && bijvoeglijk.id !== hoofd.id ? bijvoeglijk.kleuren : [];

  let voorkeurskleur = hoofdKleuren[0];
  let tweedeKleur = hoofdKleuren[1] || null;

  if (hoofdKleuren.length === 2) {
    const gedeeld = hoofdKleuren.find((k) => leunt.includes(k));
    if (gedeeld) {
      voorkeurskleur = gedeeld;
      tweedeKleur = hoofdKleuren.find((k) => k !== gedeeld) || null;
    }
  } else {
    const extra = leunt.find((k) => k !== voorkeurskleur);
    if (extra) tweedeKleur = extra;
  }

  return {
    hoofdtype: hoofd.id,
    leunt: bijvoeglijk ? bijvoeglijk.id : null,
    voorkeurskleur,
    tweedeKleur,
  };
}

/* -------------------------------------------------------------- hulpstukken */

export function naarRegels(tekst) {
  return String(tekst || "")
    .replace(/ /g, " ")
    .split(/\r?\n/)
    .map((r) => r.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'))
    .map((r) => r.replace(/\s{2,}/g, " ").trim())
    .filter((r) => r.length > 0);
}

function getallenIn(regel) {
  const treffers = regel.match(/\d+(?:[.,]\d+)?/g);
  if (!treffers) return [];
  return treffers.map((t) => Number(t.replace(",", ".")));
}

/* ----------------------------------------------------------- kleurendynamica */

/**
 * Leest de kleurenergieën van de bewuste persona.
 *
 * Geeft { waarden, eenheid, volgorde, bronregel } terug, of null.
 */
export function leesKleurenergieen(tekst) {
  const regels = naarRegels(tekst);

  for (let i = 0; i < regels.length; i += 1) {
    const woorden = regels[i].split(/[\s|]+/).map((w) => zonderAccenten(w).replace(/[^a-z]/g, ""));
    const kleuren = woorden.map((w) => KLEURNAMEN[w]).filter(Boolean);

    // Een kopregel bestaat volledig uit kleurnamen en bevat er minstens vier.
    if (kleuren.length < 4 || kleuren.length !== woorden.filter(Boolean).length) continue;

    const volgorde = kleuren.slice(0, 4);
    if (new Set(volgorde).size !== 4) continue;

    for (let j = i + 1; j < Math.min(i + 16, regels.length); j += 1) {
      const getallen = getallenIn(regels[j]);
      // De aslabels van de grafiek leveren hooguit drie getallen op; de
      // waarderegel altijd vier of acht.
      if (getallen.length !== 4 && getallen.length !== 8) continue;

      const bewust = getallen.slice(0, 4);
      if (bewust.some((g) => g < 0 || g > 100)) continue;

      const waarden = {};
      volgorde.forEach((kleur, positie) => {
        waarden[kleur] = bewust[positie];
      });

      return {
        waarden,
        volgorde,
        eenheid: Math.max(...bewust) > 6 || /%/.test(regels[j]) ? "procent" : "schaal",
        bronregel: regels[j].slice(0, 120),
      };
    }
  }

  return null;
}

/* --------------------------------------------------------------- wielpositie */

/**
 * Leest de bewuste wielpositie: "44: Directieve Motivator (Accommoderend)".
 */
export function leesWielpositie(tekst) {
  const regels = naarRegels(tekst);
  const kop = /bewuste wielpositie/i;
  const minderKop = /minder bewuste wielpositie/i;

  for (let i = 0; i < regels.length; i += 1) {
    if (!kop.test(regels[i]) || minderKop.test(regels[i])) continue;

    for (let j = i + 1; j < Math.min(i + 4, regels.length); j += 1) {
      const treffer = regels[j].match(/^(\d{1,2})\s*[:.]\s*(.+?)\s*(?:\(([^)]+)\))?$/);
      if (!treffer) continue;
      const typenaam = treffer[2].trim();
      const kleuren = kleurenUitTypenaam(typenaam);
      if (!kleuren) continue;
      return {
        positie: Number(treffer[1]),
        typenaam,
        stijl: treffer[3] ? treffer[3].trim() : null,
        ...kleuren,
      };
    }
  }

  // Sommige profielen noemen het type alleen in de kop of de bestandsnaam.
  for (const regel of regels) {
    const treffer = regel.match(/(\d{1,2})\s*[:.]\s*([A-Za-zÀ-ÿ]+e\s+[A-Za-zÀ-ÿ]+)/);
    if (!treffer) continue;
    const kleuren = kleurenUitTypenaam(treffer[2]);
    if (kleuren) {
      return { positie: Number(treffer[1]), typenaam: treffer[2].trim(), stijl: null, ...kleuren };
    }
  }

  return null;
}

/* ------------------------------------------------------------ profielteksten */

/**
 * De kopjes in een Insights-profiel en het stukje hand-in-handleiding waar de
 * inhoud bij hoort. Kopjes zonder doel dienen alleen om te weten waar de
 * vorige sectie ophoudt.
 */
const PROFIELKOPPEN = [
  { kop: "persoonlijke stijl", sectie: "hoe-ik-werk" },
  { kop: "omgang met anderen", sectie: "bereiken" },
  { kop: "interactie met anderen", sectie: "bereiken" },
  { kop: "besluitvorming", sectie: "besluiten" },
  { kop: "sterke punten", sectie: null },
  { kop: "mogelijke zwakke punten", sectie: null },
  { kop: "waarde voor het team", sectie: "energie" },
  { kop: "effectieve communicatie", sectie: "bereiken" },
  { kop: "barrieres voor effectieve communicatie", sectie: "van-jou" },
  { kop: "mogelijke \"blinde vlekken\"", sectie: "misverstand" },
  { kop: "mogelijke blinde vlekken", sectie: "misverstand" },
  { kop: "tegengestelde type", sectie: null },
  { kop: "suggesties voor ontwikkeling", sectie: "aanspreken" },
  { kop: "management", sectie: null },
  { kop: "managementstijl", sectie: null },
  { kop: "communicatie", sectie: null },
  { kop: "overzicht", sectie: null },
  { kop: "inleiding", sectie: null },
  { kop: "het insightswiel", sectie: null },
  { kop: "kleurendynamica", sectie: null },
  { kop: "persoonlijke aantekeningen", sectie: null },
];

// Het ene profiel zet het opsommingsteken op een eigen regel met de tekst
// eronder, het andere zet teken en tekst op dezelfde regel. Allebei komen voor.
const ALLEEN_TEKEN = /^[●•▪◦‣]\s*$/;
const TEKEN_MET_TEKST = /^[●•▪◦‣]\s+(.+)$/;
const MAX_PUNTEN = 8;

/**
 * Haalt de opsommingspunten per sectie op.
 *
 * In deze profielen staat het opsommingsteken op een eigen regel en de tekst op
 * de regel erna. We nemen alleen die punten: het zijn korte, complete zinnen,
 * terwijl de inleidende alinea's uitleg over de methodiek bevatten die hier
 * niets toevoegt.
 */
export function leesProfielteksten(tekst) {
  const regels = naarRegels(tekst);

  // Elk kopje staat twee keer in het document: in de inhoudsopgave en boven de
  // sectie zelf. We nemen het voorkomen met de meeste opsommingspunten erachter.
  const posities = [];
  regels.forEach((regel, i) => {
    const schoon = zonderAccenten(regel).replace(/\s+/g, " ").trim();
    const kop = PROFIELKOPPEN.find((k) => zonderAccenten(k.kop) === schoon);
    if (kop) posities.push({ ...kop, regel: i });
  });

  if (posities.length === 0) return {};

  const uit = {};
  posities.forEach((kop, index) => {
    if (!kop.sectie) return;
    const eind = index + 1 < posities.length ? posities[index + 1].regel : regels.length;

    const punten = [];
    for (let i = kop.regel + 1; i < eind && punten.length < MAX_PUNTEN; i += 1) {
      let tekstregel = null;

      const opEigenRegel = TEKEN_MET_TEKST.exec(regels[i]);
      if (opEigenRegel) tekstregel = opEigenRegel[1];
      else if (ALLEEN_TEKEN.test(regels[i]) && regels[i + 1] && !ALLEEN_TEKEN.test(regels[i + 1])) {
        tekstregel = regels[i + 1];
      }

      if (!tekstregel) continue;
      const schoon = tekstregel.replace(/\s+/g, " ").trim();
      if (schoon.length < 12 || schoon.length > 220) continue;
      punten.push(schoon);
    }

    // Het rijkste voorkomen wint; de inhoudsopgave levert er nul op.
    if (punten.length > (uit[kop.sectie] || []).length) uit[kop.sectie] = punten;
  });

  Object.keys(uit).forEach((sectie) => {
    if (uit[sectie].length === 0) delete uit[sectie];
  });

  return uit;
}

/* --------------------------------------------------------- alles bij elkaar */

/**
 * Leest een volledig profiel uit platte tekst.
 *
 * `zekerheid` zegt hoe stevig de uitkomst is:
 *   "hoog"  — de kleurenergieën van de bewuste persona zijn met waarden gevonden
 *   "matig" — geen waarden, maar wel een herkenbare wielpositie
 *   "geen"  — niets bruikbaars; de gebruiker vult zelf in
 */
export function leesInsightsTekst(tekst) {
  const energieen = leesKleurenergieen(tekst);
  const wiel = leesWielpositie(tekst);
  const teksten = leesProfielteksten(tekst);

  let voorkeurskleur = null;
  let tweedeKleur = null;
  let zekerheid = "geen";
  const gevonden = [];
  const gemist = [];

  if (energieen) {
    const rangorde = Object.keys(energieen.waarden).sort(
      (a, b) => energieen.waarden[b] - energieen.waarden[a] || a.localeCompare(b)
    );
    voorkeurskleur = rangorde[0];
    tweedeKleur = rangorde[1] || null;
    zekerheid = "hoog";
    gevonden.push("hoe de vier kleuren bij jou verdeeld zijn");
  } else if (wiel) {
    voorkeurskleur = wiel.voorkeurskleur;
    tweedeKleur = wiel.tweedeKleur;
    zekerheid = "matig";
    gemist.push("de precieze verdeling van de vier kleuren");
  } else {
    gemist.push("de verdeling van de vier kleuren");
  }

  if (wiel) gevonden.push(`het type dat je profiel noemt (${wiel.positie}: ${wiel.typenaam})`);
  else gemist.push("het type dat je profiel noemt");

  const aantalSecties = Object.keys(teksten).length;
  const aantalPunten = Object.values(teksten).reduce((som, lijst) => som + lijst.length, 0);
  if (aantalSecties > 0) gevonden.push(`${aantalPunten} punten uit de tekst van je profiel`);
  else gemist.push("de tekst van je profiel");

  return {
    voorkeurskleur,
    tweedeKleur,
    zekerheid,
    wiel,
    energieen: energieen ? energieen.waarden : null,
    eenheid: energieen ? energieen.eenheid : null,
    bronregel: energieen ? energieen.bronregel : null,
    teksten,
    gevonden,
    gemist,
  };
}

/**
 * De regels waarin een kleurnaam of "wielpositie" voorkomt. Bedoeld voor het
 * geval dat het uitlezen mislukt: dan kan iemand deze paar regels doorsturen
 * zodat we het patroon kunnen bijstellen, zonder het profiel te hoeven delen.
 */
export function diagnoseregels(tekst, maximum = 14) {
  const woorden = Object.keys(KLEURNAMEN);
  return naarRegels(tekst)
    .filter((r) => r.length > 2 && r.length < 160)
    .filter((r) => {
      const laag = zonderAccenten(r);
      return woorden.some((w) => laag.includes(w)) || laag.includes("wielpositie");
    })
    .slice(0, maximum);
}
