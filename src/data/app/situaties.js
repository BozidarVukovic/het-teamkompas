// De situaties waarvoor iemand advies kan vragen bij "Samenwerken met...".
//
// Elke situatie noemt welke kenmerken er het meest toe doen. De advieslogica
// gebruikt die volgorde om te bepalen welk verschil tussen twee mensen het
// eerst wordt besproken — zodat een advies over feedback geven niet begint bij
// een verschil in werkritme.

export const SITUATIES = [
  {
    id: "feedback-geven",
    label: "Ik wil feedback geven",
    uitleg: "Je hebt iets gezien of gehoord dat je wilt bespreken.",
    kenmerken: ["feedback", "spanning", "contact", "misverstand"],
    opening: "Bij feedback bepaalt de vorm vaak of het aankomt.",
  },
  {
    id: "verschil-van-mening",
    label: "We verschillen van mening",
    uitleg: "Jullie kijken anders naar hetzelfde onderwerp.",
    kenmerken: ["denken", "besluitvorming", "tempo", "context"],
    opening: "Een verschil van mening loopt vaker vast op tempo dan op inhoud.",
  },
  {
    id: "iets-moeilijks",
    label: "Ik wil iets moeilijks bespreken",
    uitleg: "Er is een onderwerp dat je liever niet uitstelt, maar dat spannend voelt.",
    kenmerken: ["spanning", "feedback", "contact", "energieverlies"],
    opening: "Bij een moeilijk gesprek helpt het om te weten wat de ander nodig heeft om te kunnen luisteren.",
  },
  {
    id: "iets-nodig",
    label: "Ik heb iets van deze persoon nodig",
    uitleg: "Je wacht op iets, of je hebt hulp of een besluit nodig.",
    kenmerken: ["context", "structuur", "tempo", "energieverlies"],
    opening: "Wat je vraagt komt beter aan wanneer het aansluit bij hoe de ander werkt.",
  },
  {
    id: "irritatie",
    label: "Ik merk irritatie",
    uitleg: "Er zit iets tussen dat je nog niet hebt uitgesproken.",
    kenmerken: ["misverstand", "spanning", "contact", "aanspreken"],
    opening: "Irritatie komt vaak voort uit een verschil in stijl dat niet is besproken.",
  },
  {
    id: "besluit-nemen",
    label: "We moeten samen een besluit nemen",
    uitleg: "Er ligt een keuze waar jullie allebei achter moeten staan.",
    kenmerken: ["besluitvorming", "tempo", "context", "denken"],
    opening: "Een besluit houdt stand wanneer allebei duidelijk is wat er nodig was om erachter te staan.",
  },
  {
    id: "benaderen",
    label: "Ik wil begrijpen hoe ik deze persoon kan benaderen",
    uitleg: "Je wilt weten wat wel en niet werkt voordat je iets aankaart.",
    kenmerken: ["contact", "denken", "feedback", "misverstand"],
    opening: "Hoe je iemand benadert, bepaalt vaak meer dan wat je zegt.",
  },
  {
    id: "bespreekbaar-maken",
    label: "Ik wil iets bespreekbaar maken",
    uitleg: "Er speelt iets dat nog niet op tafel ligt.",
    kenmerken: ["spanning", "contact", "energieverlies", "aanspreken"],
    opening: "Iets bespreekbaar maken begint bij het moment en de vorm, niet bij het argument.",
  },
  {
    id: "aanvullen",
    label: "Ik wil weten hoe we elkaar beter kunnen aanvullen",
    uitleg: "Het gaat goed, en je wilt er meer uit halen.",
    kenmerken: ["energie", "structuur", "denken", "besluitvorming"],
    opening: "Elkaar aanvullen werkt het best wanneer je benoemt waar je verschilt.",
  },
];

export function situatie(id) {
  return SITUATIES.find((s) => s.id === id) || null;
}

export const SITUATIE_IDS = SITUATIES.map((s) => s.id);
