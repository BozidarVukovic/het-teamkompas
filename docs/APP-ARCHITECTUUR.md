# Teamkompas app — architectuur van versie 0.1

De besloten samenwerkingsomgeving draait onder `/app` binnen de bestaande
website. Deze notitie legt vast waarom het datamodel eruitziet zoals het eruitziet.

## Waarom brondata en gedeelde data fysiek gescheiden zijn

Firestore-regels kunnen bij het lezen geen velden filteren: een gebruiker krijgt
een document in zijn geheel of helemaal niet. "Per onderdeel delen" is daarom
niet af te dwingen met één profieldocument waarin een `gedeeld`-vlag per veld
staat — wie het document mag lezen, leest ook wat privé is.

Daarom bestaan er twee soorten opslag:

- **Brondata** staat in `profielen/{uid}` en `handleidingen/{uid}`. Alleen de
  eigenaar kan die lezen en schrijven. Hier staat het volledige beeld: alle
  Insights-kenmerken, alle concepten, ook wat nooit gedeeld wordt.
- **Gedeelde data** staat in `organisaties/{orgId}/teams/{teamId}/gedeeld/{uid}`.
  Dit document bevat uitsluitend wat de gebruiker bewust deelt met dat team, en
  is leesbaar voor de leden van dat team. Alleen de eigenaar mag het schrijven.

Delen is dus een schrijfactie: de app kopieert de gekozen onderdelen naar het
gedeelde document. Intrekken is een verwijderactie, geen vlaggetje. Wat is
ingetrokken, staat niet langer in de database en is dus ook niet meer op te
vragen.

Deze duplicatie is bewust. Zij kost wat opslag en vraagt om zorgvuldig
bijwerken, maar zij is de enige manier om het onderscheid technisch af te
dwingen in plaats van in de interface.

## Waarom een gebruiker per team een eigen gedeeld document heeft

Een gebruiker kan later lid zijn van meerdere teams en per team iets anders
willen delen. Het gedeelde document hangt daarom onder het team, niet onder de
gebruiker. Wie in team A iets deelt, deelt daarmee niets in team B.

## Waarom lidmaatschappen twee keer worden vastgelegd

Het lidmaatschap staat zowel in `organisaties/{orgId}/teams/{teamId}/leden/{uid}`
als in `gebruikers/{uid}.lidmaatschappen`.

De eerste is de bron voor de regels: zij bepaalt wie een team mag lezen, en is
met één `exists()` te controleren. De tweede is er zodat de app kan tonen bij
welke teams iemand hoort zonder alle organisaties te doorzoeken — dat zou met
regels niet af te schermen zijn.

De regels staan alleen toe dat een gebruiker zijn eigen `lidmaatschappen`
schrijft, en de teamlijst is daarmee nooit een bron van waarheid over toegang.

## Waarom teamcodes een eigen collectie zijn

Toetreden gebeurt met een teamcode. `teamcodes/{code}` bevat alleen een verwijzing
naar organisatie en team. Een ingelogde gebruiker mag zo'n document opvragen,
maar niet doorzoeken: `get` is toegestaan, `list` niet. De code is lang en
willekeurig, zodat raden geen begaanbare weg is.

## Structuur

```
gebruikers/{uid}
organisaties/{orgId}
organisaties/{orgId}/teams/{teamId}
organisaties/{orgId}/teams/{teamId}/leden/{uid}
organisaties/{orgId}/teams/{teamId}/gedeeld/{uid}
profielen/{uid}
profielen/{uid}/kenmerken/{kenmerkId}
handleidingen/{uid}
teamcodes/{code}
```

## Wat een beheerder niet kan

Een teambeheerder beheert het team: naam, leden, code. Hij krijgt daarmee geen
enkel extra leesrecht op profielen of handleidingen. In de regels bestaat geen
pad waarlangs een beheerder `profielen/{uid}` van een ander kan lezen. Dat is
opzet: beheer gaat over het team, niet over de mensen erin.

## Voorbereiding op groei

De organisatielaag zit er vanaf het begin in, ook al is er nu één testorganisatie
met één team. Een organisatiebeheerder is later toe te voegen als extra rol in
`organisaties/{orgId}` zonder het model te wijzigen. Meerdere teams per
organisatie en meerdere organisaties per gebruiker werken nu al.

## Advieslogica

De advieslogica is regelgebaseerd en staat volledig los van de interface:

```
profielkenmerken → regels → adviesblokken → adviesService → interface
```

`adviesService.js` is het enige aanknopingspunt voor de interface. Wil je later
een taalmodel toevoegen, dan komt dat achter die service en niet in de
componenten. Componenten weten niet waar een advies vandaan komt.

## De lagen van de applicatie

De opdracht schrijft één richting voor: `profieldata → advieslogica → servicelaag →
gebruikersinterface`. Zo is het gebouwd, en de lagen kennen elkaar alleen in die volgorde.

| Laag | Waar | Wat het doet |
| --- | --- | --- |
| Profieldata | `src/data/app/` | Kenmerken, situaties, adviesteksten, handleidingsecties. Alleen gegevens, geen logica. |
| Advieslogica | `src/lib/app/advies/regels.js` | Bepaalt per kenmerk welke bron wint en welke twee punten er in het advies komen. Volledig deterministisch. |
| Servicelaag | `src/lib/app/advies/adviesService.js` | Het enige aanknopingspunt voor de interface. Strategieën zijn registreerbaar. |
| Interface | `src/pages/app/`, `src/lib/app/AppContext.jsx` | Schermen en gedeelde toestand. Praat nooit rechtstreeks met de advieslogica of met Firestore. |

Er zit in versie 0.1 geen generatieve AI in. De adviezen komen uit vaste beslisregels en vooraf
geschreven teksten. Wil je later een taalmodel toevoegen, dan registreer je een extra strategie in
`adviesService.js`; geen enkel component hoeft dan te veranderen en er ontstaat geen afhankelijkheid
van één leverancier.

## Volgorde van gewicht

Spreken bronnen elkaar tegen, dan geldt: expliciet bevestigde gebruikersvoorkeur (4) boven zelf
ingevuld (3), boven het Insights Discovery-profiel (2), boven algemene regelgebaseerde logica. Bij
gelijk gewicht wint de meest recente bevestiging. Een kenmerk dat iemand met "nee, dat klopt niet"
heeft weggestreept, telt niet mee en wordt niet gedeeld.

Het Insights-profiel is optioneel. Zonder profiel vult iemand de punten zelf in en werkt alles
hetzelfde.

### Wat de hand-in-handleiding doet, en wat niet

Hier stond lang dat de handleiding als bron met gewicht 3 meewoog. Dat klopte niet. De bron bestaat
in `BRONNEN`, maar er is geen weg waarlangs geschreven tekst een kenmerkwaarde wordt — dat zou
interpretatie van vrije tekst vragen, en versie 0.1 heeft daar bewust geen taalmodel voor. In de
praktijk kon iemand tien secties over zichzelf schrijven zonder dat er één letter aan het advies
veranderde.

Wat de handleiding wél doet: elke sectie hoort bij een of meer kenmerken (`SECTIES[].kenmerken` in
`src/data/app/handleiding.js`). Gaat een adviespunt over hetzelfde kenmerk als een sectie die die
persoon met dit team heeft gedeeld, dan komt die sectie er letterlijk bij te staan onder "Wat
[naam] er zelf over schreef". Hooguit twee per advies. Geen gewicht, geen afleiding, geen
samenvatting — hun eigen woorden naast de regel die erover gaat.

Bij een groepsadvies gebeurt dit niet: één iemand citeren wijst iemand aan, en dat is precies wat
`groepsregels.js` moet voorkomen.

De handleiding blijft optioneel; de app is er nergens van afhankelijk.

## Wat er niet gebeurt

- Geen scoring, ranglijst of profilering. Er wordt niets over iemand berekend dat die persoon zelf
  niet ziet.
- Geen harde psychologische labels. Kenmerken beschrijven een voorkeur in samenwerking, nooit wie
  iemand is. De teksten zijn getoetst in `tests/adviesApp.test.mjs`.
- Beheerders zien niets extra's. Beheerder zijn gaat over teamgegevens, niet over mensen.
- Van adviessessies leggen we alleen vast dát er advies is gevraagd, bij welke situatie, en of het
  bruikbaar was. Nooit over wie het ging of wat er stond.

## Gegevens in versiebeheer

In de broncode staat uitsluitend verzonnen profieldata: `src/data/app/testpersonen.js` bevat
Testpersoon A, B en C. Echte profielinformatie hoort daar nooit in en gaat uitsluitend via de
beveiligde applicatie naar Firebase. De Firebase-webconfiguratie in `src/lib/firebase.js` is
publiek van aard — dat hoort zo; de beveiliging zit volledig in `firestore.rules`. Server-side
sleutels staan niet in de clientcode.
