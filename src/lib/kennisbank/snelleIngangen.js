// Snelle ingangen: veelvoorkomende vragen die direct een vooraf ingestelde
// kenniswijzer-uitkomst tonen, zonder dat de bezoeker vijf vragen doorloopt.

export const SNELLE_INGANGEN = [
  {
    id: "niet-aanspreken",
    label: "We spreken elkaar niet aan",
    icoon: "🗣️",
    keuze: { situaties: ["niet-aanspreken"], rol: "", doelen: ["bespreekbaar-maken"], tijd: "", werkwijzen: ["bespreken", "voorbereiden"] },
  },
  {
    id: "rollen-onduidelijk",
    label: "Onze rollen zijn onduidelijk",
    icoon: "🧭",
    keuze: { situaties: ["rollen-onduidelijk"], rol: "", doelen: ["rollen-verduidelijken"], tijd: "", werkwijzen: ["bespreken", "voorbereiden"] },
  },
  {
    id: "veel-overleg",
    label: "We overleggen veel, maar besluiten weinig",
    icoon: "🔁",
    keuze: { situaties: ["veel-overleg-weinig-besluit"], rol: "", doelen: ["overleg-verbeteren"], tijd: "", werkwijzen: ["bespreken", "verbeteren"] },
  },
  {
    id: "weerstand",
    label: "De verandering roept weerstand op",
    icoon: "🌊",
    keuze: { situaties: ["weerstand-verandering"], rol: "", doelen: ["verandering-begeleiden"], tijd: "", werkwijzen: ["lezen", "bespreken"] },
  },
  {
    id: "energie",
    label: "De samenwerking kost te veel energie",
    icoon: "🔋",
    keuze: { situaties: ["samenwerking-kost-energie", "hoge-werkdruk"], rol: "", doelen: ["begrijpen"], tijd: "", werkwijzen: ["reflecteren", "bespreken"] },
  },
  {
    id: "teamdag",
    label: "We willen een betere teamdag organiseren",
    icoon: "📅",
    keuze: { situaties: ["groeien-vanuit-goed"], rol: "teamleider", doelen: ["teamdag-voorbereiden"], tijd: "", werkwijzen: ["voorbereiden"] },
  },
];

export function snelleIngang(id) {
  return SNELLE_INGANGEN.find((ingang) => ingang.id === id) || null;
}

export default SNELLE_INGANGEN;
