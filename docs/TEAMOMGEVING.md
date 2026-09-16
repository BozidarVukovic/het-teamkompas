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
toestand. `eersteOpen: true` laat daarbij het eerste blok openstaan -- passend
voor een overzicht dat meteen iets moet zeggen, niet voor een naslagwerk waar de
lijst zelf de keuze is. Die afweging hoort bij het pakket; het scherm kan niet
zien wat voor soort onderdeel het is. Alle velden zijn leeg toegestaan en
veranderen niets aan de tekst.

## Adressen

Het onderdeel staat in het pad (`/app/teamomgeving/afspraken`) en de sectie in
de hash (`#verwachtingen-van-de-leidinggevende`). De slak wordt gemaakt in
`teamomgevingAdres.js` en op twee plekken gebruikt: het scherm zet hem als `id`
op elke kop en op elke inklapbare sectie, en het zoeken geeft hem terug bij een
treffer. Wie er een verzint moet dus dezelfde functie gebruiken, anders komt een
link ergens anders uit dan de treffer beloofde.

## Documenten toevoegen

Na het inrichten lag de documentenlijst vast. Dat was met opzet -- wie hem mag
herschrijven, kan een download naar andere inhoud laten wijzen dan er is
gecontroleerd -- maar een team maakt na een teamdag nieuwe documenten.

Er mag daarom precies één document bij, achteraan, via `voegDocumentToe`. De
regel in `firestore.rules` vergelijkt letterlijk: de oude lijst met het nieuwe
element erachter moet gelijk zijn aan de nieuwe lijst. Een andere titel bij een
bestaand document, een andere sha256, een andere volgorde -- het maakt die
vergelijking onwaar en er gaat niets door.

Weghalen kan ook, met een tweede regel die spiegelbeeldig werkt: er mag er
precies één uit, en twee `removeAll`-controles bewijzen samen dat er niets
bijkomt en niets verandert aan wat blijft staan. De volgorde van wat overblijft
staat daarmee niet vast; dat is bewust, want die bepaalt alleen hoe de lijst op
het scherm staat en niet naar welk bestand een download wijst.

De client haalt het document eerst uit de lijst en ruimt daarna de pdf-delen op
(`allow delete` op `teamomgevingBestanden`). In die volgorde, want zo kan niemand
klikken op een download die er niet meer is. Lukt het opruimen niet, dan zegt het
scherm dat: er liggen dan delen in de opslag waar geen lijst meer naar wijst.

Vervangen kan nog steeds niet, en dat hoeft ook niet — weghalen en opnieuw
toevoegen doet hetzelfde, en laat geen ruimte om een bestaande regel te
herschrijven.

De sha256 komt hier uit de browser en niet uit een pakket. Dat is geen controle
op een derde partij maar een vingerafdruk, en die belooft precies één ding: wat
je downloadt is byte voor byte wat er is geüpload.

## Teksten bewerken

Twee routes, met opzet allebei door dezelfde poort:

- **Tekst bewerken** op het onderdeel zelf (alleen voor de twee begeleiders).
  Een invoerveld met het scherm ernaast, zodat je ziet wat de markdown wordt
  voordat je opslaat. Slaat op via `werkTekstenBij`, dat de inhoud eerst opnieuw
  leest en de wijziging daar bovenop zet -- zo overschrijft de ene begeleider
  niet het werk van de andere.
- **Brontekst terugzetten** in Beheer, voor een grote wijziging in één keer of
  om een onderdeel toe te voegen. Dat kan het bewerkscherm niet: het wijzigt
  alleen de tekst van een onderdeel dat er al is.

Beide gaan door `valideerOmgeving` en door dezelfde regel in `firestore.rules`.
Voeg geen derde schrijfroute toe; dat is een derde plek waar iets langs de
controle kan glippen.

## Zoeken

`teamomgevingZoek.js` bouwt de index uit dezelfde inhoud die het scherm toont --
in de browser, zonder netwerk. De beheerinhoud en de bespreeknotities zitten er
niet in en horen er niet in: die zijn van de twee begeleiders.

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
