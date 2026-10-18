// Scenario's voor nieuw werk.
//
// Een scenario is een vraag, geen handeling: "wat gebeurt er als we dit zo
// doen". Daarom werkt alles hier op kopieën en raakt niets de echte planning.
// Pas een besluit verandert iets, en dat is een aparte stap met een eigen
// bevestiging.
//
// Twee rekenregels die hier makkelijk misgaan en daarom met zoveel woorden in
// de uitkomst staan:
//
//   Verplaatsen maakt ruimte vrij in de weken waarin het werk weggaat, en legt
//   beslag op de weken waar het naartoe gaat. Niet in het kwartaal als geheel.
//
//   Herverdelen maakt geen capaciteit. De uren verhuizen naar iemand anders;
//   het teamtotaal blijft gelijk. Wie dat als winst presenteert, verkoopt een
//   collega als oplossing.

import { totVoor, verschoven, wekenIn } from "./periode.js";
import { bekendeUren, maakBeeld, overbelasting } from "./ruimte.js";
import { gevolgenVan } from "./afhankelijkheden.js";

export const OPTIES = [
  "aannemen",
  "pauzeren",
  "verschuiven",
  "faseren",
  "later-starten",
  "niet-aannemen",
  "herverdelen",
];

export const OPTIELABELS = {
  aannemen: "Aannemen binnen de beschikbare ruimte",
  pauzeren: "Aannemen en ander werk pauzeren",
  verschuiven: "Aannemen en ander werk verschuiven",
  faseren: "Kleiner uitvoeren of faseren",
  "later-starten": "Later starten",
  "niet-aannemen": "Niet aannemen",
  herverdelen: "Werk herverdelen",
};

/* De bijdragen die een verzoek vraagt, als bijdragen die je kunt doorrekenen.
   Een gevraagde bijdrage zonder naam is geen nul: het is werk waarvoor nog
   niemand is gevonden, en dat hoort als onzekerheid terug te komen. */
function bijdragenUitVerzoek(verzoek, { van, tot } = {}) {
  const gevraagd = Array.isArray(verzoek && verzoek.bijdragen) ? verzoek.bijdragen : [];
  return gevraagd.map((b, i) => ({
    id: `${verzoek.id || "verzoek"}-${i + 1}`,
    doelId: verzoek.id || "verzoek",
    uid: b.uid || "",
    urenPerWeek: b.urenPerWeek,
    expertise: b.expertise || "",
    status: "ter-afstemming",
    van: van || b.van || verzoek.van,
    tot: tot || b.tot || verzoek.tot,
    uitVerzoek: true,
  }));
}

function zonderToewijzing(bijdragen) {
  return bijdragen.filter((b) => b.uitVerzoek && !b.uid);
}

function verschilPerPersoon(voor, na) {
  return na.perPersoon.map((p) => {
    const oud = voor.perPersoon.find((o) => o.uid === p.uid);
    const weken = p.weken.map((w, i) => {
      const o = oud ? oud.weken[i] : null;
      const gepland = (n) => (n ? n.afgesproken + n.voorgesteld : 0);
      return {
        week: w.week,
        ruimte: w.ruimte,
        vrijVoor: o ? o.vrij : null,
        vrijNa: w.vrij,
        geplandVoor: o ? Math.round(gepland(o) * 100) / 100 : 0,
        geplandNa: Math.round(gepland(w) * 100) / 100,
        tekortVoor: o ? o.tekort : null,
        tekortNa: w.tekort,
      };
    });
    return {
      uid: p.uid,
      naam: p.naam,
      weken,
      wordtOverbelast: weken.some((w) => w.tekortNa > 0 && !(w.tekortVoor > 0)),
      blijftOverbelast: weken.some((w) => w.tekortNa > 0 && w.tekortVoor > 0),
    };
  });
}

/**
 * Een scenario doorrekenen.
 *
 * @param personen         zoals in maakBeeld
 * @param bijdragen        de huidige planning; wordt niet gewijzigd
 * @param afhankelijkheden [{doelId, wachtOp, mijlpaal, bevestigd}]
 * @param verzoek          het nieuwe werk
 * @param optie            een van OPTIES
 * @param instelling       wat de optie nodig heeft (zie hieronder)
 */
export function verkenScenario({
  personen = [],
  bijdragen = [],
  afhankelijkheden = [],
  verzoek = null,
  optie = "aannemen",
  instelling = {},
} = {}) {
  if (!OPTIES.includes(optie)) {
    throw new Error(`Onbekende optie: ${optie}`);
  }

  // Kopieën. De echte planning blijft de echte planning.
  const huidig = bijdragen.map((b) => ({ ...b }));
  const voor = maakBeeld({ personen, bijdragen: huidig });

  const aannames = [];
  const onzekerheden = [];
  const wijzigingen = [];
  const geraakteDoelen = new Set();

  let na = huidig.map((b) => ({ ...b }));
  let nieuw = [];

  switch (optie) {
    case "niet-aannemen": {
      if (verzoek && verzoek.gevolgenNietDoen) onzekerheden.push(verzoek.gevolgenNietDoen);
      else onzekerheden.push("Er staat nog niet opgeschreven wat er gebeurt als dit niet wordt opgepakt.");
      break;
    }

    case "aannemen": {
      nieuw = bijdragenUitVerzoek(verzoek);
      break;
    }

    case "later-starten": {
      const weken = Number(instelling.weken);
      if (!Number.isInteger(weken) || weken <= 0) {
        aannames.push("Er is niet opgegeven hoeveel weken later gestart wordt.");
        break;
      }
      const periode = verschoven({ van: verzoek.van, tot: verzoek.tot }, weken);
      if (!periode) {
        aannames.push("De gevraagde periode is onvolledig, dus later starten is niet door te rekenen.");
        break;
      }
      nieuw = bijdragenUitVerzoek(verzoek, periode);
      // De huidige planning verandert hier niet: alleen de nieuwe weken
      // moeten opnieuw beoordeeld worden.
      onzekerheden.push(
        `De huidige planning verandert hier niet. De weken ${periode.van} tot en met ${periode.tot} moeten opnieuw worden beoordeeld.`
      );
      break;
    }

    case "faseren": {
      const deel = instelling.deel;
      if (!deel || !bekendeUren(deel.urenPerWeek) || !deel.van || !deel.tot) {
        aannames.push("Er is nog geen kleiner deel beschreven met eigen uren en periode.");
        break;
      }
      nieuw = bijdragenUitVerzoek(
        { ...verzoek, bijdragen: [{ uid: deel.uid || "", expertise: deel.expertise || "", urenPerWeek: deel.urenPerWeek }] },
        { van: deel.van, tot: deel.tot }
      );
      onzekerheden.push("Wat er in de eerste fase niet in past, is nog niet ingepland.");
      break;
    }

    case "pauzeren": {
      const vanaf = instelling.vanafWeek;
      const ids = Array.isArray(instelling.pauzeer) ? instelling.pauzeer : [];
      if (!vanaf || ids.length === 0) {
        aannames.push("Er is nog niet gekozen wat vanaf welke week gepauzeerd wordt.");
      }
      na = na.map((b) => {
        if (!ids.includes(b.id)) return b;
        geraakteDoelen.add(b.doelId);
        // Pauzeren gaat over de nog geplande inzet. Wat al achter de rug is,
        // blijft staan: dat zijn uren die al besteed zijn.
        const rest = totVoor({ van: b.van, tot: b.tot }, vanaf);
        if (!rest) {
          wijzigingen.push({ soort: "pauzeren", bijdrageId: b.id, doelId: b.doelId, uid: b.uid, naar: "gepauzeerd" });
          return { ...b, status: "gepauzeerd" };
        }
        wijzigingen.push({ soort: "inkorten", bijdrageId: b.id, doelId: b.doelId, uid: b.uid, van: b.van, tot: rest.tot, was: b.tot });
        return { ...b, tot: rest.tot };
      });
      nieuw = bijdragenUitVerzoek(verzoek);
      break;
    }

    case "verschuiven": {
      const lijst = Array.isArray(instelling.verschuif) ? instelling.verschuif : [];
      if (lijst.length === 0) aannames.push("Er is nog niet gekozen welk werk hoeveel weken opschuift.");
      na = na.map((b) => {
        const opdracht = lijst.find((v) => v.bijdrageId === b.id);
        if (!opdracht || !Number.isInteger(opdracht.weken)) return b;
        const periode = verschoven({ van: b.van, tot: b.tot }, opdracht.weken);
        if (!periode) return b;
        geraakteDoelen.add(b.doelId);
        wijzigingen.push({ soort: "verschuiven", bijdrageId: b.id, doelId: b.doelId, uid: b.uid, weken: opdracht.weken, van: periode.van, tot: periode.tot, was: { van: b.van, tot: b.tot } });
        return { ...b, ...periode };
      });
      nieuw = bijdragenUitVerzoek(verzoek);
      onzekerheden.push(
        "Verplaatst werk legt beslag op zijn nieuwe weken. Daar is alleen ruimte vrijgekomen waar het werk daadwerkelijk weg is."
      );
      break;
    }

    case "herverdelen": {
      const lijst = Array.isArray(instelling.herverdeel) ? instelling.herverdeel : [];
      if (lijst.length === 0) aannames.push("Er is nog niet gekozen welk werk naar wie verhuist.");
      na = na.map((b) => {
        const opdracht = lijst.find((v) => v.bijdrageId === b.id);
        if (!opdracht || !opdracht.naar) return b;
        geraakteDoelen.add(b.doelId);
        wijzigingen.push({ soort: "herverdelen", bijdrageId: b.id, doelId: b.doelId, van: b.uid, naar: opdracht.naar });
        return { ...b, uid: opdracht.naar };
      });
      nieuw = bijdragenUitVerzoek(verzoek);
      onzekerheden.push(
        "Herverdelen maakt geen capaciteit bij: dezelfde uren komen op een andere collega terecht. Of dat kan, hangt af van zijn ruimte en of hij het werk kan en wil doen."
      );
      break;
    }

    default:
      break;
  }

  for (const b of nieuw) {
    wijzigingen.push({ soort: "toevoegen", bijdrageId: b.id, doelId: b.doelId, uid: b.uid, urenPerWeek: b.urenPerWeek, van: b.van, tot: b.tot });
  }

  const naBeeld = maakBeeld({ personen, bijdragen: [...na, ...nieuw] });

  const open = zonderToewijzing(nieuw);
  if (open.length > 0) {
    onzekerheden.push(
      open.length === 1
        ? `Voor één gevraagde bijdrage${open[0].expertise ? ` (${open[0].expertise})` : ""} is nog geen collega gevonden; die uren staan nog nergens op.`
        : `Voor ${open.length} gevraagde bijdragen is nog geen collega gevonden; die uren staan nog nergens op.`
    );
  }
  const zonderUren = nieuw.filter((b) => !bekendeUren(b.urenPerWeek));
  if (zonderUren.length > 0) {
    aannames.push(`${zonderUren.length} gevraagde bijdragen hebben geen urenschatting; die zijn niet meegerekend.`);
  }

  const gevolgen = gevolgenVan(afhankelijkheden, [...geraakteDoelen]);
  if (gevolgen.vermoed.length > 0) {
    onzekerheden.push(
      `${gevolgen.vermoed.length} van de geraakte afhankelijkheden is nog een vermoeden en niet bevestigd.`
    );
  }
  if (gevolgen.geraakt.length > 0) {
    onzekerheden.push(
      "Een afhankelijkheid die vertraagt maakt geen uren vrij: het werk dat erop wacht staat nog steeds ingepland."
    );
  }

  const afsprakenOpnieuw = [];
  if (verzoek && verzoek.hardeVerplichting) {
    afsprakenOpnieuw.push(`Er ligt een harde verplichting op het nieuwe werk: ${verzoek.hardeVerplichting}`);
  }
  for (const w of wijzigingen) {
    if (w.soort === "verschuiven" || w.soort === "pauzeren" || w.soort === "inkorten") {
      afsprakenOpnieuw.push(`De afspraak over ${w.doelId} verandert en moet met de eigenaar besproken worden.`);
    }
  }

  return {
    optie,
    label: OPTIELABELS[optie],
    verzoek,
    voor,
    na: naBeeld,
    perPersoon: verschilPerPersoon(voor, naBeeld),
    overbelastVoor: overbelasting(voor),
    overbelastNa: overbelasting(naBeeld),
    geraakteDoelen: [...geraakteDoelen],
    afhankelijkheden: gevolgen,
    afsprakenOpnieuw: [...new Set(afsprakenOpnieuw)],
    wijzigingen,
    aannames: [...new Set([...voor.aannames, ...naBeeld.aannames, ...aannames])],
    onzekerheden: [...new Set(onzekerheden)],
    // Een scenario is een verkenning. Dat staat hier als veld, zodat een
    // scherm het niet hoeft te onthouden en een besluit het moet overschrijven.
    toegepast: false,
    weken: wekenIn(naBeeld.periode),
  };
}

/**
 * Een scenario omzetten naar een bewerkbaar besluitvoorstel.
 *
 * Het voorstel is tekst plus de lijst wijzigingen; het verandert nog niets.
 * Wie het vastlegt doet dat met een aparte handeling, en die controleert
 * rechten en of de planning sinds het voorstel is veranderd.
 */
export function maakBesluitvoorstel(scenario, { afweging = "", beslisser = "", heroverwegenOp = "" } = {}) {
  if (!scenario) return null;
  const eigenaren = [...new Set(scenario.wijzigingen.map((w) => w.uid || w.van).filter(Boolean))];
  return {
    verzoekId: (scenario.verzoek && scenario.verzoek.id) || "",
    optie: scenario.optie,
    label: scenario.label,
    afweging,
    wijzigingen: scenario.wijzigingen,
    geraakteDoelen: scenario.geraakteDoelen,
    gevolgen: scenario.afhankelijkheden.geraakt,
    onzekerheden: scenario.onzekerheden,
    aannames: scenario.aannames,
    betrokkenEigenaren: eigenaren,
    beslisser,
    heroverwegenOp,
    // De app wijst niemand aan als bevoegd. Dat hoort bij de rollen van het
    // team, en technisch beheer is geen inhoudelijk mandaat.
    mandaatBevestigd: false,
    status: "voorstel",
  };
}
