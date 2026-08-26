// Tijdsberekening van de teamdag-generator.
//
// Uitgangspunt uit de opdracht: de totale programmaduur past exact binnen de
// gekozen tijd. Er blijft altijd buffer over — minimaal tien minuten bij een
// dagdeel en twintig bij een volledige dag — en die buffer wordt nooit
// volgezet met een extra werkvorm.

export const STAP = 5;

/** Rondt af op hele stappen van vijf minuten. */
export function afronden(minuten) {
  return Math.max(STAP, Math.round(minuten / STAP) * STAP);
}

/** Zet minuten om naar een kloktijd, uitgaande van een starttijd in minuten. */
export function klok(minutenVanafMiddernacht) {
  const totaal = ((Math.round(minutenVanafMiddernacht) % 1440) + 1440) % 1440;
  const u = Math.floor(totaal / 60);
  const m = totaal % 60;
  return `${String(u).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Leest een tijd als "09:30" en geeft het aantal minuten vanaf middernacht. */
export function naarMinuten(tijd) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(tijd || "").trim());
  if (!m) return 9 * 60;
  const u = Math.min(23, Math.max(0, Number(m[1])));
  const mi = Math.min(59, Math.max(0, Number(m[2])));
  return u * 60 + mi;
}

/**
 * Past de duur van de onderdelen aan zodat het geheel exact binnen de
 * beschikbare tijd valt.
 *
 * `onderdelen` is een lijst met { blok, duur, vast, vastgezet }. Een vast
 * onderdeel wordt niet ingekort onder zijn minimum en niet verwijderd. Een
 * vastgezet onderdeel heeft een duur die de gebruiker zelf koos; die wordt niet
 * opgerekt.
 *
 * `magUitbreiden` staat uit zodra de gebruiker zelf een duur heeft aangepast.
 * De onderdelen houden dan precies de lengte die er staat en de tijd die
 * daardoor vrijkomt wordt buffer, in plaats van dat een ander blok hem opsnoept.
 *
 * Geeft terug: { onderdelen, buffer, past, verwijderd }
 */
export function pasDurenAan(onderdelen, beschikbaar, minBuffer = 10, magUitbreiden = true) {
  let werk = onderdelen.map((o) => ({ ...o }));
  const verwijderd = [];
  const ruimte = beschikbaar - minBuffer;

  const som = (lijst) => lijst.reduce((t, o) => t + o.duur, 0);

  // Te lang: eerst inkorten tot het minimum, daarna onderdelen laten vervallen.
  //
  // Inkorten gebeurt stap voor stap: telkens gaat er vijf minuten af bij het
  // onderdeel met de meeste speling. Zo blijft de verdeling evenwichtig en
  // eindigt het altijd, ook wanneer een onderdeel op zijn minimum staat.
  const kortIn = () => {
    let veiligheidsrem = 0;
    while (som(werk) > ruimte && veiligheidsrem < 500) {
      veiligheidsrem += 1;
      const speling = (o) => o.duur - (o.blok.minDuur || STAP);
      const rekbaar = werk.filter((o) => speling(o) >= STAP);
      if (!rekbaar.length) return false;
      rekbaar.sort((a, b) => speling(b) - speling(a));
      rekbaar[0].duur -= STAP;
    }
    return som(werk) <= ruimte;
  };

  if (som(werk) > ruimte && !kortIn()) {
    // Nog steeds te lang: laat niet-vaste onderdelen vervallen, achteraan eerst,
    // en probeer daarna opnieuw in te korten.
    while (som(werk) > ruimte) {
      const omgekeerd = [...werk].reverse().findIndex((o) => !o.vast);
      if (omgekeerd === -1) break;
      const index = werk.length - 1 - omgekeerd;
      verwijderd.push(werk[index]);
      werk.splice(index, 1);
      if (kortIn()) break;
    }
  }

  // Te kort: uitbreiden tot het maximum van elk onderdeel. Wat overblijft is
  // buffer. Onderdelen waarvan de gebruiker de duur zelf heeft gezet, blijven
  // ongemoeid.
  let over = magUitbreiden ? ruimte - som(werk) : 0;
  for (let ronde = 0; ronde < 8 && over >= STAP; ronde += 1) {
    const rekbaar = werk.filter((o) => !o.vastgezet && o.duur < (o.blok.maxDuur || o.duur));
    if (!rekbaar.length) break;
    let uitgedeeld = 0;
    rekbaar.forEach((o) => {
      if (over - uitgedeeld < STAP) return;
      const max = o.blok.maxDuur || o.duur;
      const kan = max - o.duur;
      if (kan < STAP) return;
      const bij = Math.min(kan, STAP);
      o.duur += bij;
      uitgedeeld += bij;
    });
    if (uitgedeeld === 0) break;
    over -= uitgedeeld;
  }

  const gebruikt = som(werk);
  const buffer = beschikbaar - gebruikt;

  return {
    onderdelen: werk,
    buffer,
    past: buffer >= minBuffer && gebruikt > 0,
    verwijderd,
  };
}

/**
 * Zet de onderdelen om in een programma met begin- en eindtijden. Ieder
 * onderdeel krijgt een eigen sleutel, zodat twee pauzes op één dag uit elkaar
 * te houden zijn.
 */
export function zetTijden(onderdelen, startTijd = "09:00") {
  let cursor = naarMinuten(startTijd);
  return onderdelen.map((o, i) => {
    const start = cursor;
    cursor += o.duur;
    return {
      ...o,
      sleutel: `${o.blok.id}-${i}`,
      start: klok(start),
      eind: klok(cursor),
      startMinuten: start,
    };
  });
}

/** Totale duur van een lijst onderdelen. */
export function totaleDuur(onderdelen) {
  return onderdelen.reduce((t, o) => t + o.duur, 0);
}

/** Leesbare weergave van een aantal minuten. */
export function duurLabel(minuten) {
  const u = Math.floor(minuten / 60);
  const m = minuten % 60;
  if (u === 0) return `${m} minuten`;
  if (m === 0) return u === 1 ? "1 uur" : `${u} uur`;
  return `${u} uur en ${m} minuten`;
}
