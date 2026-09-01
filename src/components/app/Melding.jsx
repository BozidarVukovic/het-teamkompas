// Een melding boven het scherm: gelukt of niet gelukt.
//
// Hoort bij useActie(). Eén vorm voor de hele app, zodat een mislukte actie er
// overal hetzelfde uitziet en je hem overal op dezelfde plek verwacht.

export default function Melding({ melding, onSluiten = null }) {
  if (!melding || !melding.tekst) return null;

  const fout = melding.soort === "fout";

  return (
    <div
      className={`tk-melding ${fout ? "tk-melding-fout" : "tk-melding-goed"}`}
      role={fout ? "alert" : "status"}
    >
      <span>{melding.tekst}</span>
      {onSluiten && (
        <button type="button" className="tk-melding-sluiten" onClick={onSluiten} aria-label="Melding sluiten">
          ×
        </button>
      )}
    </div>
  );
}
