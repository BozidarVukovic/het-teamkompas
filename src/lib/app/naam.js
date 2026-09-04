// Kleine bewerkingen op een naam, op één plek.
//
// Initialen en voornamen worden op drie schermen gebruikt. Stonden ze daar los,
// dan gingen ze na verloop van tijd uiteenlopen: "Anne-Marie de Vries" wordt op
// het ene scherm AD en op het andere AM.

/**
 * De eerste letters van maximaal twee naamdelen, in hoofdletters.
 *
 * Alleen delen die met een letter beginnen tellen mee. Achter een naam staat in
 * de app soms iets tussen haakjes — "Bozidar (jij)" — en dat leverde anders een
 * bol op met "B(" erin.
 */
export function initialen(naam) {
  const delen = String(naam || "")
    .trim()
    .split(/\s+/)
    .filter((d) => /^\p{L}/u.test(d))
    .slice(0, 2)
    .map((d) => d[0]);

  return delen.length === 0 ? "?" : delen.join("").toUpperCase();
}

/** Het eerste naamdeel, of een terugvaloptie als er geen naam is. */
export function voornaam(naam, terugval = "") {
  const eerste = String(naam || "").trim().split(/\s+/)[0];
  return eerste || terugval;
}

/** De langste naam die de app bewaart. */
export const MAX_NAAM = 60;

/**
 * Een naam zoals hij de opslag in gaat: zonder spaties aan de randen, zonder
 * dubbele spaties ertussen, en niet langer dan MAX_NAAM.
 *
 * Geeft een lege string terug als er niets overblijft. De aanroeper hoort daar
 * niets mee te doen -- een profiel zonder naam is nergens meer terug te vinden.
 */
export function schoneNaam(naam) {
  return String(naam || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAAM);
}

/** De naamdelen die met een letter beginnen. */
function delenVan(naam) {
  return String(naam || "")
    .trim()
    .split(/\s+/)
    .filter((d) => /^\p{L}/u.test(d));
}

/**
 * Labels voor een lijst mensen: de voornaam waar dat kan, en anders net genoeg
 * meer om ze uit elkaar te houden.
 *
 * Op het startscherm staat van iedereen alleen de voornaam onder zijn bol. In
 * een team met twee Jacquelines stonden daar twee keer dezelfde vier lettergrepen,
 * en tik je op de verkeerde, dan krijg je advies over de verkeerde persoon.
 *
 * Botst een voornaam, dan komt de eerste letter van het láátste naamdeel erachter
 * -- het laatste, want "Anne-Marie de Vries" hoort "Anne-Marie V." te worden.
 * Heeft iemand geen tweede naamdeel, dan blijft de kale voornaam staan; die
 * verschilt dan alsnog van de versie mét letter. Twee mensen met exact dezelfde
 * volledige naam blijven gelijk -- daar helpt geen afkorting tegen.
 *
 * @param {string[]} namen
 * @param {string} terugval label voor wie helemaal geen naam heeft
 * @returns {string[]} even lang als de invoer, in dezelfde volgorde
 */
export function korteNamen(namen = [], terugval = "") {
  const voornamen = namen.map((n) => voornaam(n, terugval));

  const aantal = new Map();
  voornamen.forEach((v) => aantal.set(v, (aantal.get(v) || 0) + 1));

  return namen.map((naam, i) => {
    const kort = voornamen[i];
    if (aantal.get(kort) === 1) return kort;

    const delen = delenVan(naam);
    if (delen.length < 2) return kort;

    return `${kort} ${delen[delen.length - 1][0].toUpperCase()}.`;
  });
}
