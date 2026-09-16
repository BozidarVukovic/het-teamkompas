# Besloten teamomgeving

Route: `/app/teamomgeving`, onder de bestaande AppProvider en inlogpoort.
De ingang op Start verschijnt alleen als het actieve team een inrichting heeft.
Bij een team- of accountwissel wordt de volledige pagina opnieuw opgebouwd;
oude asynchrone laadresultaten worden genegeerd.

## Gegevens en toegang

Onder `organisaties/{orgId}/teams/{teamId}`:

- `teamomgeving/toegang`: twee expliciete account-UIDs, eenmalig vastgelegd door
  een bestaande teambeheerder. Beide accounts moeten teamlid zijn. Clientwijziging
  en verwijdering zijn verboden, ook voor andere teambeheerders.
- `teamomgeving/inhoud`: teamonderdelen in Markdown en pdfmetadata; leesbaar voor
  de bestaande teamleden.
- `teamomgeving/beheer`: afzonderlijke brontekst en bespreeknotities; uitsluitend
  leesbaar door de twee aangewezen accounts zolang hun teamlidmaatschap bestaat.
- `teamomgevingBestanden/{id}/delen/{index}`: pdf in delen van maximaal 600.000
  base64-tekens. Alleen teamleden lezen; geen publieke assets of downloadtokens.
  SHA-256 wordt vóór import én vóór downloaden gecontroleerd.

Een onderdeel mag drie optionele velden hebben die alleen over de vorm gaan:
`groep` zet het in een groep in de navigatie, en `tijdlijn` is een rij haltes
(`wanneer`, `wat`, `stand`, optioneel `gedaan`) die als lijn wordt getoond. Een
regel `[tijdlijn]` in de tekst bepaalt waar die lijn staat; zonder die regel komt
hij bovenaan. En `inklapbaar: true` maakt van elke `###` een sectie die open- en
dichtklapt, één tegelijk, met de korte regel erboven als ondertitel in gesloten
toestand. Die keuze hoort bij het pakket: een overzicht met vier koppen moet
juist openstaan, een naslagwerk met vier werkvormen niet, en dat verschil kan
het scherm niet zien. Alle drie de velden zijn leeg toegestaan en veranderen
niets aan de tekst.

Een gedownloade brontekst en een nieuw pakket horen in `omgevingspakketten/`.
Die map staat in .gitignore en `scripts/valideer-klantinhoud.mjs` laat de build
mislukken zodra zo'n bestand toch wordt bijgehouden of de negeerregel verdwijnt.
Zo kan er in de werkmap aan klantinhoud worden gewerkt zonder dat die ooit in
versiebeheer belandt.

Op het beheertabblad kunnen de twee begeleiders de brontekst downloaden: een
pakketbestand met de teksten van alle onderdelen, zonder de bespreeknotities en
zonder de pdf's. Het bestand wordt in de browser zelf gemaakt. Zo blijft een
correctie op de brontekst mogelijk zonder dat iemand in de opslag hoeft te
kijken. Het bevat echte teaminhoud en hoort dus niet in versiebeheer.

De twee begeleiders kunnen de teksten later bijwerken met een verbeterd pakket
(`werkOmgevingBij`). Dat raakt alleen `titel`, `intro`, `onderdelen` en
`documentContext`; `documenten` blijft ongemoeid, want die metadata hoort bij de
pdf's in de aparte collectie en een losse titelwijziging zou een download iets
anders kunnen laten heten dan wat is gecontroleerd. Komt de documentenlijst niet
overeen, dan gaat er niets door. De toegang blijft onveranderlijk. Elke
bijwerking laat `bijgewerktOp` en `bijgewerktDoor` achter.

De import is één batch met onveranderlijke toegang en inhoud: herhaalde import
kan niets overschrijven. Alleen de bespreeknotities kunnen daarna in de app worden
bijgewerkt. Een latere broninhoudwijziging of wisseling van begeleider vereist een
bewuste beheermigratie. Het pakket bevat geen echte cliëntinhoud in versiebeheer.

HTML, afbeeldingen en hyperlinks uit Markdown worden niet uitgevoerd/getoond.
De oorspronkelijke pdfs worden alleen op aanvraag geladen. Na downloaden blijft
de gebruiker verantwoordelijk voor het lokaal opgeslagen document.

## Afbakening van de proefsite

De vier acties blijven broninformatie met onbevestigde voortgang. Nieuwe
vastgestelde afspraken gebruiken de bestaande gedeelde teamafspraken. Persoonlijke
experimenten verwijzen naar Ik en blijven privé. De 30–60–90-vragen blijven een
voorstel: er worden nog geen antwoorden of gebruikstellers verzameld. Geen lokale
testinvoer wordt als werkelijk teamresultaat geïmporteerd.

## Controle

`npm run build`, `npm test` en `npm run test:regels`.
De securitysuite test mede gasten, andere teams, gewone teambeheerders, beide
aangewezen begeleiders, manipulatie van toegang en een vertrokken begeleider.
