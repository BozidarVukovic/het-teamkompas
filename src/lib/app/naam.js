// Kleine bewerkingen op een naam, op één plek.
//
// Initialen en voornamen worden op drie schermen gebruikt. Stonden ze daar los,
// dan gingen ze na verloop van tijd uiteenlopen: "Anne-Marie de Vries" wordt op
// het ene scherm AD en op het andere AM.

/** De eerste letters van maximaal twee naamdelen, in hoofdletters. */
export function initialen(naam) {
  const delen = String(naam || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0])
    .filter(Boolean);

  return delen.length === 0 ? "?" : delen.join("").toUpperCase();
}

/** Het eerste naamdeel, of een terugvaloptie als er geen naam is. */
export function voornaam(naam, terugval = "") {
  const eerste = String(naam || "").trim().split(/\s+/)[0];
  return eerste || terugval;
}
