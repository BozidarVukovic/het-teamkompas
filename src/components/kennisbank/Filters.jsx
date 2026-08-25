import {
  CONTENTTYPES, DOMEINEN, ROLLEN, TAGS, TIJDEN, VORMEN, WERKWIJZEN, tagLabel,
} from "../../data/kennisbank/taxonomie";

const VELDEN = [
  { sleutel: "type", label: "Soort content", opties: CONTENTTYPES.map((t) => ({ id: t.id, label: t.meervoud })) },
  { sleutel: "domein", label: "Domein", opties: DOMEINEN.map((d) => ({ id: d.id, label: d.label })) },
  { sleutel: "tag", label: "Onderwerp", opties: TAGS.map((t) => ({ id: t.id, label: t.label })) },
  { sleutel: "rol", label: "Bedoeld voor", opties: ROLLEN.map((r) => ({ id: r.id, label: r.label })) },
  { sleutel: "tijd", label: "Duurt maximaal", opties: TIJDEN.filter((t) => t.minuten !== null).map((t) => ({ id: t.id, label: t.label })) },
  { sleutel: "vorm", label: "Individueel of samen", opties: VORMEN.filter((v) => v.id !== "beide").map((v) => ({ id: v.id, label: v.label })) },
  { sleutel: "werkwijze", label: "Manier van werken", opties: WERKWIJZEN.map((w) => ({ id: w.id, label: w.label })) },
];

function chipLabel(sleutel, waarde) {
  if (sleutel === "tag") return tagLabel(waarde);
  const veld = VELDEN.find((v) => v.sleutel === sleutel);
  const optie = veld && veld.opties.find((o) => o.id === waarde);
  return optie ? optie.label : waarde;
}

/**
 * Verfijning van de resultaten. De filters staan los van de kenniswijzer:
 * ze halen resultaten weg, ze veranderen de scores niet.
 */
export default function Filters({ filters, onFilter, onWisFilters, onAanpassen, onOpnieuw, aantal }) {
  const actief = VELDEN.filter((veld) => filters[veld.sleutel]);

  return (
    <section className="kb-filters" aria-labelledby="kb-filters-kop">
      <h3 id="kb-filters-kop">Verfijn de resultaten <span style={{ fontWeight: 500, color: "var(--tk-color-muted)" }}>({aantal} {aantal === 1 ? "resultaat" : "resultaten"})</span></h3>
      <div className="kb-filter-rij">
        {VELDEN.map((veld) => (
          <label key={veld.sleutel}>
            {veld.label}
            <select
              value={filters[veld.sleutel] || ""}
              onChange={(event) => onFilter(veld.sleutel, event.target.value)}
            >
              <option value="">Alles</option>
              {veld.opties.map((optie) => <option key={optie.id} value={optie.id}>{optie.label}</option>)}
            </select>
          </label>
        ))}
      </div>

      {actief.length > 0 && (
        <ul className="kb-actieve-filters" aria-label="Actieve filters">
          {actief.map((veld) => (
            <li key={veld.sleutel}>
              <span className="kb-chip">
                {veld.label}: {chipLabel(veld.sleutel, filters[veld.sleutel])}
                <button type="button" onClick={() => onFilter(veld.sleutel, "")} aria-label={"Filter " + veld.label + " verwijderen"}>×</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="kb-filter-acties">
        <button type="button" className="kb-knop kb-knop--secundair kb-knop--klein" onClick={onAanpassen}>Keuzes aanpassen</button>
        <button type="button" className="kb-knop kb-knop--secundair kb-knop--klein" onClick={onWisFilters} disabled={!actief.length}>Filters wissen</button>
        <button type="button" className="kb-knop kb-knop--secundair kb-knop--klein" onClick={onOpnieuw}>Opnieuw beginnen</button>
      </div>
    </section>
  );
}
