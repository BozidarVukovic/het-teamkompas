// De keuzes en filters van de kennisbank worden in leesbare URL-parameters
// bewaard. Daardoor is een resultatenpagina te delen, opnieuw te openen en te
// bookmarken. Er staat nooit een vrij tekstveld met persoonsgegevens in: alleen
// ids uit de taxonomie en, als de bezoeker die gebruikt, de zoekterm.

import {
  DOEL_IDS, DOMEIN_IDS, ROL_IDS, SITUATIE_IDS, TAG_IDS, TIJD_IDS,
  CONTENTTYPE_IDS, WERKWIJZE_IDS, MAX_SITUATIES, MAX_DOELEN,
} from "../../data/kennisbank/taxonomie.js";
import { LEGE_KEUZE } from "./scoring.js";

const LIJST_SCHEIDER = ",";

function leesLijst(waarde, toegestaan, maximum) {
  if (!waarde) return [];
  const gevonden = waarde.split(LIJST_SCHEIDER).map((deel) => deel.trim()).filter((deel) => toegestaan.includes(deel));
  return maximum ? [...new Set(gevonden)].slice(0, maximum) : [...new Set(gevonden)];
}

function leesWaarde(waarde, toegestaan) {
  return waarde && toegestaan.includes(waarde) ? waarde : "";
}

/** Zet zoekparameters om in keuzes en filters. Onbekende waarden worden stil
 *  genegeerd, zodat een verminkte of verouderde link nooit een foutpagina geeft. */
export function leesUrl(params) {
  const haal = (sleutel) => (typeof params.get === "function" ? params.get(sleutel) : params[sleutel]) || "";
  return {
    keuze: {
      situaties: leesLijst(haal("situatie"), SITUATIE_IDS, MAX_SITUATIES),
      rol: leesWaarde(haal("rol"), ROL_IDS),
      doelen: leesLijst(haal("doel"), DOEL_IDS, MAX_DOELEN),
      tijd: leesWaarde(haal("tijd"), TIJD_IDS),
      werkwijzen: leesLijst(haal("doen"), WERKWIJZE_IDS),
    },
    filters: {
      type: leesWaarde(haal("type"), CONTENTTYPE_IDS),
      domein: leesWaarde(haal("domein"), DOMEIN_IDS),
      tag: leesWaarde(haal("onderwerp"), TAG_IDS),
      rol: leesWaarde(haal("filterrol"), ROL_IDS),
      werkwijze: leesWaarde(haal("werkwijze"), WERKWIJZE_IDS),
      vorm: leesWaarde(haal("vorm"), ["individueel", "samen"]),
      tijd: leesWaarde(haal("filtertijd"), TIJD_IDS),
    },
    zoekterm: (haal("q") || "").slice(0, 80),
    stap: Number(haal("stap")) || 0,
  };
}

/** Bouwt de zoekparameters op uit keuzes, filters en zoekterm. */
export function schrijfUrl({ keuze = LEGE_KEUZE, filters = {}, zoekterm = "" } = {}) {
  const params = {};
  if (keuze.situaties && keuze.situaties.length) params.situatie = keuze.situaties.join(LIJST_SCHEIDER);
  if (keuze.rol) params.rol = keuze.rol;
  if (keuze.doelen && keuze.doelen.length) params.doel = keuze.doelen.join(LIJST_SCHEIDER);
  if (keuze.tijd) params.tijd = keuze.tijd;
  if (keuze.werkwijzen && keuze.werkwijzen.length) params.doen = keuze.werkwijzen.join(LIJST_SCHEIDER);
  if (filters.type) params.type = filters.type;
  if (filters.domein) params.domein = filters.domein;
  if (filters.tag) params.onderwerp = filters.tag;
  if (filters.rol) params.filterrol = filters.rol;
  if (filters.werkwijze) params.werkwijze = filters.werkwijze;
  if (filters.vorm) params.vorm = filters.vorm;
  if (filters.tijd) params.filtertijd = filters.tijd;
  if (zoekterm) params.q = zoekterm.slice(0, 80);
  return params;
}

/** Heeft de bezoeker genoeg ingevuld om resultaten te tonen? */
export function heeftKeuze(keuze = LEGE_KEUZE) {
  return Boolean(
    (keuze.situaties && keuze.situaties.length)
    || keuze.rol
    || (keuze.doelen && keuze.doelen.length)
    || keuze.tijd
    || (keuze.werkwijzen && keuze.werkwijzen.length)
  );
}

export function heeftFilters(filters = {}) {
  return Object.values(filters).some(Boolean);
}
