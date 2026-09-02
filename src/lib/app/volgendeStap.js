// Wat is er nu aan de beurt?
//
// Eén plek waar bepaald wordt waar iemand in de opbouw staat, zodat elk scherm
// hetzelfde zegt. Zonder dit gaf het startscherm netjes richting en eindigde
// elke andere pagina in het niets — je bent klaar met invullen en dan houdt het
// gewoon op.
//
// De volgorde volgt wat er nodig is voordat de app iets kan betekenen:
//   1. je eigen profiel invullen
//   2. het delen met je team
//   3. je team erbij halen
//   4. klaar — vanaf hier is advies vragen het werk
//
// Pure functie, geen React: te testen zonder browser en zonder database.

import { telKenmerken } from "./telling.js";
import { doetMee } from "./teamrollen.js";

export const AANTAL_STAPPEN = 3;

/**
 * @param {object} gegevens
 * @param {Array}  gegevens.kenmerken      eigen kenmerken uit de opslag
 * @param {object} gegevens.actiefTeam     { orgId, teamId, teamNaam } of null
 * @param {Array}  gegevens.leden          teamleden, inclusief jezelf
 * @param {object} gegevens.gedeeldPerUid  wat er per teamgenoot gedeeld is
 * @param {string} gegevens.eigenUid
 * @param {number} gegevens.extraProfielen  profielen die de beheerder zelf toevoegde
 * @param {string} gegevens.teamcode
 * @param {boolean} gegevens.ikBegeleid    je beheert dit team maar doet niet mee
 */
export function bepaalVolgendeStap({
  kenmerken = [],
  actiefTeam = null,
  leden = [],
  gedeeldPerUid = {},
  eigenUid = null,
  teamcode = null,
  extraProfielen = 0,
  ikBegeleid = false,
} = {}) {
  // Zelfde telling als de voortgangsbalk en het profielscherm; zie telling.js.
  // Elk scherm zelf laten tellen gaf hetzelfde antwoord, maar niet omdat ze
  // hetzelfde deden.
  const geteld = telKenmerken({ kenmerken, actiefTeam });
  const bruikbaar = geteld.bruikbaar;
  const gedeeld = geteld.aantalGedeeld;
  const teamNaam = (actiefTeam && actiefTeam.teamNaam) || "je team";
  // Profielen die een beheerder zelf toevoegde tellen gewoon mee: daar valt
  // net zo goed advies over te vragen.
  // Een begeleider hoort niet bij de teamgenoten: hij is er om het team op te
  // zetten, niet om erin samen te werken. Zonder deze filter telt de
  // facilitator mee als collega van zijn eigen klant.
  const anderen = leden.filter((l) => l.uid !== eigenUid && doetMee(l));
  const aantalAnderen = anderen.length + extraProfielen;
  const anderenMetGedeeld = anderen.filter((l) => gedeeldPerUid[l.uid]).length + extraProfielen;

  // Begeleid je dit team, dan gaan de eerste twee stappen niet over jou. Je
  // eigen profiel hoort niet in dit team thuis en delen doe je hier niet; wat
  // telt is of het team klaarstaat.
  if (ikBegeleid) {
    if (aantalAnderen === 0) {
      return {
        id: "team-klaarzetten",
        nummer: 1,
        klaar: false,
        kop: `Zet ${teamNaam} klaar`,
        uitleg:
          "Je begeleidt dit team en doet er zelf niet aan mee. Nodig de mensen uit met de teamcode, of voeg hun profiel alvast toe op basis van hun Insights-rapport.",
        kort: "Je begeleidt dit team. Nodig de mensen uit of voeg hun profielen toe.",
        knop: "Naar dit team",
        naar: "/app/team",
        code: teamcode,
      };
    }

    if (anderenMetGedeeld === 0) {
      return {
        id: "wachten",
        nummer: 2,
        klaar: false,
        kop: "Er is nog niets gedeeld",
        uitleg: `${
          aantalAnderen === 1 ? "Er staat één persoon" : `Er staan ${aantalAnderen} mensen`
        } in dit team, maar nog niemand heeft iets gedeeld. Vraag ze hun profiel in te vullen en te delen — of zet hun profiel zelf klaar vanuit hun Insights-rapport.`,
        kort: "Er is in dit team nog niets gedeeld. Vraag erom, of zet de profielen zelf klaar.",
        knop: "Naar dit team",
        naar: "/app/team",
        code: teamcode,
      };
    }

    return {
      id: "klaar",
      nummer: AANTAL_STAPPEN + 1,
      klaar: true,
      kop: "Waar wil je je op voorbereiden?",
      uitleg:
        "Kies om wie het gaat en wat er speelt. Je krijgt een kort advies dat je kunt gebruiken in de begeleiding.",
      kort: `Je begeleidt ${teamNaam}. Kies om wie het gaat en waar je je op wilt voorbereiden.`,
      knop: "Samenwerken met...",
      naar: "/app/samenwerken",
    };
  }

  if (bruikbaar.length === 0) {
    return {
      id: "profiel",
      nummer: 1,
      klaar: false,
      kop: "Begin bij jezelf",
      uitleg:
        "Vul in hoe jij werkt en samenwerkt. Twaalf korte vragen — of upload je Insights Discovery-profiel, dan staat het er in een minuut op. Zonder dit weet de app nog niets over jou.",
      kort: "Vul je profiel in, dan kan de app iets over de samenwerking met jou zeggen.",
      knop: "Mijn profiel invullen",
      naar: "/app/profiel",
    };
  }

  if (gedeeld === 0) {
    return {
      id: "delen",
      nummer: 2,
      klaar: false,
      kop: "Deel het met je team",
      uitleg: `Je hebt ${bruikbaar.length} ${
        bruikbaar.length === 1 ? "punt" : "punten"
      } ingevuld. Zolang je niets deelt, ziet niemand er iets van — en kan niemand er rekening mee houden. Je bepaalt zelf wat je deelt en kunt het altijd weer intrekken.`,
      kort: `Je hebt ${bruikbaar.length} punten ingevuld, maar deelt er nog geen. Zolang je niets deelt, kan niemand er rekening mee houden.`,
      knop: `Alles delen met ${teamNaam}`,
      actie: "deelAlles",
      tweede: { naar: "/app/profiel", label: "Liever per punt kiezen" },
    };
  }

  if (aantalAnderen === 0) {
    return {
      id: "uitnodigen",
      nummer: 3,
      klaar: false,
      kop: "Nu je team nog",
      uitleg:
        "Jij staat klaar. Geef deze code aan de mensen met wie je samenwerkt; zodra zij meedoen en hun profiel delen, kun je advies vragen over de samenwerking met hen.",
      kort: "Jij staat klaar. Nodig je teamgenoten uit met de teamcode, dan kun je advies vragen.",
      knop: "Naar mijn team",
      naar: "/app/team",
      code: teamcode,
    };
  }

  if (anderenMetGedeeld === 0) {
    return {
      id: "wachten",
      nummer: 3,
      klaar: false,
      kop: "Je teamgenoten moeten nog delen",
      uitleg: `${
        aantalAnderen === 1 ? "Er is één teamgenoot" : `Er zijn ${aantalAnderen} teamgenoten`
      }, maar nog niemand heeft iets gedeeld. Vraag ze hun profiel in te vullen en te delen — dan kan de app pas iets zeggen over de samenwerking met hen.`,
      kort: "Je teamgenoten hebben nog niets gedeeld. Vraag ze hun profiel in te vullen en te delen.",
      knop: "Naar mijn team",
      naar: "/app/team",
      code: teamcode,
    };
  }

  return {
    id: "klaar",
    nummer: AANTAL_STAPPEN + 1,
    klaar: true,
    kop: "Loop je ergens tegenaan?",
    uitleg:
      "Kies met wie het speelt en wat er aan de hand is. Je krijgt een kort advies dat je meteen kunt gebruiken in het gesprek.",
    kort: "Alles staat klaar. Loop je ergens tegenaan in de samenwerking, vraag dan advies.",
    knop: "Samenwerken met...",
    naar: "/app/samenwerken",
  };
}
