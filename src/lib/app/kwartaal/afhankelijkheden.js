// Wat waarop wacht.
//
// "De introductiegids heeft de eerste versie van de instroomwerkwijze nodig."
// Dat is iets anders dan "de gids wacht tot de instroomwerkwijze af is": je
// wacht meestal op een tussenresultaat, niet op een heel project. Daarom hoort
// er bij elke afhankelijkheid een mijlpaal, en is die mijlpaal gewoon tekst --
// het team weet wat "de eerste versie" is, de app niet.
//
// Twee dingen die deze module met opzet níét doet.
//
// Ze rekent geen vertraging uit. Wie weet dat A twee weken opschuift, weet
// daarmee nog niet wanneer B klaar is: daar horen doorlooptijd, beschikbaarheid
// en afspraken bij. Wat er hier uitkomt is "dit raakt B, ga erover praten".
//
// En ze maakt geen uren vrij. Als A gepauzeerd wordt, loopt B misschien
// vertraging op, maar de uren van B staan nog steeds op B. Dat is de fout die
// een capaciteitstool het makkelijkst maakt en die het duurst is: ruimte zien
// die er niet is.

/** Een vermoeden is geen afhankelijkheid tot iemand het bevestigt. */
export function isBevestigd(afhankelijkheid) {
  return Boolean(afhankelijkheid && afhankelijkheid.bevestigd === true);
}

function schoon(lijst) {
  return (Array.isArray(lijst) ? lijst : []).filter(
    (a) => a && typeof a.doelId === "string" && typeof a.wachtOp === "string" && a.doelId && a.wachtOp
  );
}

/**
 * Wie wacht er rechtstreeks op dit doel?
 *
 * @param alleenBevestigd laat vermoedens weg; standaard tellen ze mee, met
 *                        hun eigen vlag, zodat het scherm ze apart kan tonen.
 */
export function wachtendOp(afhankelijkheden, doelId, { alleenBevestigd = false } = {}) {
  return schoon(afhankelijkheden)
    .filter((a) => a.wachtOp === doelId && (!alleenBevestigd || isBevestigd(a)))
    .map((a) => ({ doelId: a.doelId, mijlpaal: a.mijlpaal || "", bevestigd: isBevestigd(a) }));
}

/**
 * Alles wat direct of indirect op dit doel wacht.
 *
 * Elke uitkomst draagt het pad mee waarlangs hij geraakt wordt, zodat er op
 * het scherm "via de introductiegids" kan staan in plaats van alleen een naam.
 * Een keten die via een vermoeden loopt, is zelf ook een vermoeden -- anders
 * wordt een niet-gecontroleerde aanname onderweg hard.
 */
export function geraaktDoor(afhankelijkheden, doelId, { alleenBevestigd = false } = {}) {
  const alles = schoon(afhankelijkheden);
  const uit = [];
  const gezien = new Set([doelId]);
  let rand = [{ doelId, via: [], bevestigd: true }];

  // Breedte-eerst, zodat het kortste pad naar een doel het pad is dat je ziet.
  // De grens op de diepte is er voor een graaf die ondanks alles toch een
  // lus bevat; cirkels() hoort dat eerder te vangen.
  for (let diepte = 0; diepte < 24 && rand.length > 0; diepte += 1) {
    const volgende = [];
    for (const huidig of rand) {
      for (const a of alles) {
        if (a.wachtOp !== huidig.doelId) continue;
        if (alleenBevestigd && !isBevestigd(a)) continue;
        if (gezien.has(a.doelId)) continue;
        gezien.add(a.doelId);
        const stap = {
          doelId: a.doelId,
          mijlpaal: a.mijlpaal || "",
          via: [...huidig.via, huidig.doelId],
          afstand: diepte + 1,
          bevestigd: huidig.bevestigd && isBevestigd(a),
        };
        uit.push(stap);
        volgende.push(stap);
      }
    }
    rand = volgende;
  }

  return uit;
}

/**
 * De cirkels in de graaf.
 *
 * Een cirkel is geen zeldzaamheid als mensen hun eigen afhankelijkheden
 * invoeren: A wacht op B, B wacht op C, C wacht op A, en niemand ziet het
 * omdat iedereen maar één regel heeft ingevoerd. Elke cirkel komt er één keer
 * uit, beginnend bij zijn alfabetisch eerste lid, zodat twee runs hetzelfde
 * opleveren.
 */
export function cirkels(afhankelijkheden) {
  const alles = schoon(afhankelijkheden);
  const buren = new Map();
  for (const a of alles) {
    if (!buren.has(a.wachtOp)) buren.set(a.wachtOp, []);
    buren.get(a.wachtOp).push(a.doelId);
  }

  const gevonden = new Map();
  const bezig = new Set();
  const klaar = new Set();

  function loop(knoop, pad) {
    if (bezig.has(knoop)) {
      const start = pad.indexOf(knoop);
      if (start < 0) return;
      const cirkel = pad.slice(start);
      // Draai de cirkel zo dat hij bij zijn kleinste lid begint: dan is
      // A→B→C dezelfde cirkel als B→C→A en staat hij er één keer in.
      const laagste = cirkel.indexOf([...cirkel].sort()[0]);
      const genormaliseerd = [...cirkel.slice(laagste), ...cirkel.slice(0, laagste)];
      gevonden.set(genormaliseerd.join(">"), genormaliseerd);
      return;
    }
    if (klaar.has(knoop)) return;
    bezig.add(knoop);
    for (const volgend of buren.get(knoop) || []) loop(volgend, [...pad, knoop]);
    bezig.delete(knoop);
    klaar.add(knoop);
  }

  [...new Set(alles.flatMap((a) => [a.doelId, a.wachtOp]))].sort().forEach((k) => loop(k, []));
  return [...gevonden.values()];
}

/**
 * Mag deze afhankelijkheid erbij?
 *
 * Tegenhouden vóór het opslaan, niet achteraf melden: een cirkel die er
 * eenmaal in zit, maakt elk overzicht erboven onbetrouwbaar.
 */
export function magToevoegen(afhankelijkheden, nieuw) {
  if (!nieuw || !nieuw.doelId || !nieuw.wachtOp) {
    return { mag: false, reden: "Een afhankelijkheid heeft een doel en iets om op te wachten." };
  }
  if (nieuw.doelId === nieuw.wachtOp) {
    return { mag: false, reden: "Een doel kan niet op zichzelf wachten." };
  }
  const bestaat = schoon(afhankelijkheden).some((a) => a.doelId === nieuw.doelId && a.wachtOp === nieuw.wachtOp);
  if (bestaat) {
    return { mag: false, reden: "Deze afhankelijkheid staat er al." };
  }
  const nieuweCirkels = cirkels([...schoon(afhankelijkheden), nieuw]);
  if (nieuweCirkels.length > cirkels(afhankelijkheden).length) {
    return {
      mag: false,
      reden: "Hiermee zou een kring ontstaan: deze doelen gaan dan op elkaar wachten.",
      cirkel: nieuweCirkels[nieuweCirkels.length - 1],
    };
  }
  return { mag: true, reden: "" };
}

/**
 * Wat er te bespreken valt als deze doelen verschuiven of stilvallen.
 *
 * Nadrukkelijk geen datum en geen urenwinst: een lijst van wat geraakt wordt
 * en hoe zeker dat is.
 */
export function gevolgenVan(afhankelijkheden, doelIds = []) {
  const geraakt = new Map();
  for (const doelId of doelIds) {
    for (const stap of geraaktDoor(afhankelijkheden, doelId)) {
      const eerder = geraakt.get(stap.doelId);
      if (!eerder || stap.afstand < eerder.afstand) geraakt.set(stap.doelId, { ...stap, door: doelId });
    }
  }
  // Wat zelf verschuift is niet "geraakt door" zichzelf.
  for (const doelId of doelIds) geraakt.delete(doelId);

  const lijst = [...geraakt.values()].sort((a, b) => a.afstand - b.afstand || a.doelId.localeCompare(b.doelId));
  return {
    geraakt: lijst,
    bevestigd: lijst.filter((g) => g.bevestigd),
    vermoed: lijst.filter((g) => !g.bevestigd),
    // De app rekent geen nieuwe datum uit. Dat staat hier zodat het scherm het
    // kan overnemen in plaats van zelf iets te verzinnen.
    nieuweDatum: null,
    datumStatus: lijst.length > 0 ? "af te stemmen" : "ongewijzigd",
  };
}
