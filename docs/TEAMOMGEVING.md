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
