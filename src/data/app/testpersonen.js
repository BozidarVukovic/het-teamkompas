// Verzonnen testprofielen.
//
// Uitsluitend fictief. Er staat bewust geen enkel echt profiel in dit
// bestand — geen namen, geen kenmerken, geen handleidingteksten van echte
// personen. Echte gegevens horen alleen thuis in de beveiligde app en worden
// nooit in de broncode of in tests gezet.
//
// Deze personen bestaan om de advieslogica te kunnen testen zonder database.

export const TESTPERSONEN = [
  {
    id: "testpersoon-a",
    naam: "Testpersoon A",
    omschrijving: "Werkt snel, wil door, zegt het direct.",
    kenmerken: [
      { kenmerkId: "tempo", waarde: "snel", bron: "user_confirmation" },
      { kenmerkId: "context", waarde: "kort", bron: "insights_discovery" },
      { kenmerkId: "structuur", waarde: "gemengd", bron: "insights_discovery" },
      { kenmerkId: "denken", waarde: "hardop", bron: "user_confirmation" },
      { kenmerkId: "contact", waarde: "taak", bron: "manual" },
      { kenmerkId: "feedback", waarde: "direct", bron: "user_confirmation" },
      { kenmerkId: "spanning", waarde: "sneller", bron: "user_confirmation" },
      { kenmerkId: "besluitvorming", waarde: "knoop", bron: "manual" },
      { kenmerkId: "energie", waarde: "afronden", bron: "insights_discovery" },
      { kenmerkId: "energieverlies", waarde: "langoverleg", bron: "manual" },
      { kenmerkId: "aanspreken", waarde: "tempo", bron: "user_confirmation" },
      { kenmerkId: "misverstand", waarde: "kortaf", bron: "user_confirmation" },
    ],
  },
  {
    id: "testpersoon-b",
    naam: "Testpersoon B",
    omschrijving: "Denkt eerst zelf na, wil het grotere geheel kennen.",
    kenmerken: [
      { kenmerkId: "tempo", waarde: "bedachtzaam", bron: "user_confirmation" },
      { kenmerkId: "context", waarde: "veel", bron: "user_confirmation" },
      { kenmerkId: "structuur", waarde: "structuur", bron: "insights_discovery" },
      { kenmerkId: "denken", waarde: "alleen", bron: "user_confirmation" },
      { kenmerkId: "contact", waarde: "taak", bron: "insights_discovery" },
      { kenmerkId: "feedback", waarde: "voorbeeld", bron: "hand_in_handleiding" },
      { kenmerkId: "spanning", waarde: "stiller", bron: "user_confirmation" },
      { kenmerkId: "besluitvorming", waarde: "waarom", bron: "manual" },
      { kenmerkId: "energie", waarde: "verdieping", bron: "insights_discovery" },
      { kenmerkId: "energieverlies", waarde: "onduidelijk", bron: "manual" },
      { kenmerkId: "aanspreken", waarde: "detail", bron: "manual" },
      { kenmerkId: "misverstand", waarde: "twijfel", bron: "hand_in_handleiding" },
    ],
  },
  {
    id: "testpersoon-c",
    naam: "Testpersoon C",
    omschrijving: "Begint bij de mensen, heeft rust nodig bij spanning.",
    kenmerken: [
      { kenmerkId: "tempo", waarde: "gemiddeld", bron: "manual" },
      { kenmerkId: "context", waarde: "veel", bron: "insights_discovery" },
      { kenmerkId: "structuur", waarde: "ruimte", bron: "manual" },
      { kenmerkId: "denken", waarde: "hardop", bron: "insights_discovery" },
      { kenmerkId: "contact", waarde: "relatie", bron: "user_confirmation" },
      { kenmerkId: "feedback", waarde: "rustig", bron: "user_confirmation" },
      { kenmerkId: "spanning", waarde: "terugtrekken", bron: "hand_in_handleiding" },
      { kenmerkId: "besluitvorming", waarde: "meepraten", bron: "manual" },
      { kenmerkId: "energie", waarde: "samen", bron: "insights_discovery" },
      { kenmerkId: "energieverlies", waarde: "conflict", bron: "user_confirmation" },
      { kenmerkId: "aanspreken", waarde: "stil", bron: "manual" },
      { kenmerkId: "misverstand", waarde: "stilte", bron: "user_confirmation" },
    ],
  },
];

export function testpersoon(id) {
  return TESTPERSONEN.find((p) => p.id === id) || null;
}
