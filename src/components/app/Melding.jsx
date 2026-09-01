// Een melding boven het scherm: gelukt of niet gelukt.
//
// Hoort bij useActie(). Eén vorm voor de hele app, zodat een mislukte actie er
// overal hetzelfde uitziet en je hem overal op dezelfde plek verwacht.

export default function Melding({ melding, onSluiten = null }) {
  if (!melding) return null;

  // Een losse zin telt als een geslaagde melding. Zonder dit verdween er één
  // stil van het scherm doordat er ergens nog een tekst werd doorgegeven waar
  // een object werd verwacht — precies het soort fout dat je pas maanden later
  // opmerkt, want er komt geen waarschuwing en het scherm blijft werken.
  const inhoud = typeof melding === "string" ? { soort: "goed", tekst: melding } : melding;
  if (!inhoud.tekst) return null;

  const fout = inhoud.soort === "fout";

  return (
    <div
      className={`tk-melding ${fout ? "tk-melding-fout" : "tk-melding-goed"}`}
      role={fout ? "alert" : "status"}
    >
      <span>{inhoud.tekst}</span>
      {onSluiten && (
        <button type="button" className="tk-melding-sluiten" onClick={onSluiten} aria-label="Melding sluiten">
          ×
        </button>
      )}
    </div>
  );
}
