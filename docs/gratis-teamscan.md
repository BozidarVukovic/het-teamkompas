# Gratis individuele teamscan — analyse en implementatie

## Fase 1: bestaande situatie

De applicatie is een React 18/Vite single-page application met React Router. Firebase levert Authentication, Firestore, Hosting en callable Cloud Functions. De productiebuild wordt met `npm run build` gemaakt; Firebase Hosting herschrijft routes naar `index.html`. Vercel Analytics is eveneens aanwezig. De beheeromgeving is onderdeel van `App.jsx` en laat alleen de twee beheerdersaccounts toe die ook in Firestore Rules en Cloud Functions zijn vastgelegd.

De bestaande `/teamscan` is een aanvraagfunnel, niet de vragenlijst zelf. Een beheerder maakt in **Scans** een medewerkers- en managementvragenlijst aan. Deelnemers openen `/deelnemen/:id`; antwoorden komen in `antwoorden`. Vragen staan versieerbaar als `stellingen` op een document in `vragenlijsten` en komen standaard uit `src/data/scanData.js`. De bestaande schaal loopt van 1 tot 5. De primaire domeinen zijn veiligheid en leiderschap, beleving van verandering, energie en motivatie, verbeteren en leren, aangevuld met samenwerking/communicatie en richting/betrokkenheid. Resultaten, CSV-export, HTML-/printrapporten, verdiepingsrapporten en een klantportaal bestaan al. Teamrapportage vergelijkt medewerkers en management en bewaart geen naam of e-mail bij reguliere antwoorden.

Herbruikbaar zijn de Firebase-infrastructuur, beheerautorisatie, design tokens, vragenbank, schaal, scorebalken, rapportstijl, routing en analytics. Uitbreiding was nodig voor openbare sessies, expliciete toestemming, persoonsgebonden rapporten, veilige tokens, e-maillogging, individuele scoring en een apart beheeroverzicht. Een browser-only EmailJS-verzending was voor gevoelige rapportdata ongeschikt; de gratis scan verzendt daarom server-side via de EmailJS REST API.

Belangrijkste bestaande risico's: publieke collecties voor aanvragen staan breed open voor `create`, bestaande funnel-events bevatten organisatiegegevens, adminaccounts zijn als e-mailallowlist vastgelegd en de privacyverklaring noemt de nieuwe persoonsgebonden scan nog niet expliciet. De juridische tekst is daarom niet stilzwijgend aangepast. Voeg vóór productie toe: doel en grondslag, rapportbewaartermijn (standaard 90 dagen voor de link; 365 dagen voor beheer), ontvanger/e-mailprovider, rechten en scheiding tussen noodzakelijke verwerking en marketing.

## Gekozen oplossing

Route `/gratis-teamscan` start zonder persoonsgegevens. De 24 vragen worden lokaal tussentijds bewaard; alleen een niet-persoonlijke serversessie wordt bij de start gemaakt. Naam, e-mail en afzonderlijke toestemmingen volgen pas na de laatste vraag. Cloud Functions valideren en berekenen alles opnieuw, schrijven één versieerbare `freeScanInstances`-record, genereren een willekeurige 256-bit rapporttoken en verzenden de e-mail. `/gratis-teamscan/rapport/:token` is noindex en toont via een callable alleen geminimaliseerde rapportdata. De token verloopt na 90 dagen.

De zes thema's zijn afgeleid uit bestaande vragen (bron-id staat bij iedere vraag): psychologische veiligheid, communicatie en luisteren, eigenaarschap en duidelijkheid, samenwerking en verbinding, energie en motivatie, leiderschap en beweging. Vier vragen per thema geven 24 vragen. Score: gemiddelde 1–5 wordt `(gemiddelde - 1) × 25`. Ontbrekend/n.v.t. telt niet mee in de gedeelde scoremodule; server-side afronding vereist alle 24 antwoorden. Zones: 75–100 sterke basis, 55–74 aandacht en verdieping, 0–54 mogelijk belemmerend patroon. De server is de gezaghebbende berekening.

Configureerbare patroonregels staan centraal in `freeScanConfig.js` en gespiegeld in de serverconfiguratie: betrokkenheid/lage energie, veiligheid/laag eigenaarschap, steun/lage communicatie, leiderschap/lage veiligheid en communicatie/laag eigenaarschap. Maximaal drie worden geselecteerd. Rapport, reflecties en experimenten zijn deterministisch en reproduceerbaar.

## Beheer, privacy en beveiliging

**Gratis teamscan** toont aantallen, conversie, mailstatus, zoeken, statusfilter, CSV-export, detail, antwoorden, modelversies, rapportlink, anonimiseren en definitief verwijderen. Firestore weigert publieke directe toegang; publieke acties lopen via gevalideerde callable functions. Er zijn honeypot-, invoer-, versie-, token- en eenvoudige instance-rate-limitcontroles. De complete-call is idempotent. Analytics-events bevatten alleen eventnaam en voortgang, nooit antwoorden of persoonsgegevens.

Eventnamen: `free_scan_page_view`, `free_scan_started`, `free_scan_progress` (25/50/75), `free_scan_completed`, `free_scan_result_full_scan_click`, `free_scan_report_full_scan_click`. Provider-success-events worden als status in Firestore bewaard; voor centrale analytics kan een server-side koppeling later worden toegevoegd.

## Configuratie, lokaal testen en deployment

Cloud Functions vereisen `EMAILJS_SERVICE_ID`, `EMAILJS_FREE_SCAN_TEMPLATE_ID` en `EMAILJS_PUBLIC_KEY`. De template ontvangt: `to_email`, `to_name`, `subject`, `strength`, `opportunity`, `reflection`, `experiment`, `report_url`, `reply_to`. Configureer afzender **Mijn Teamkompas** en reply-to `info@mijnteamkompas.nl`. Commit geen waarden in de repository.

Lokaal: `npm install`, `npm run dev`; unit tests met `npm run test:free-scan`; productiecontrole met `npm run build`. Deploy na het zetten van function environment variables met `firebase deploy --only functions,firestore:rules,hosting`. Firestore maakt mogelijk een single-field index voor `reportToken` en `startedAt` automatisch aan.

## Bekende beperkingen en vervolg

- De huidige e-mailprovider ondersteunt een HTML-template buiten de repository; configureer en test die handmatig in EmailJS.
- Herverzenden/regenereren is als vervolgstap wenselijk; foutstatus, rapport bekijken, export, anonimiseren en verwijderen zijn nu beschikbaar.
- De in-memory rate limit is per function-instance. Zet voor productie App Check en/of een persistente limiter/API Gateway voor sterkere botbescherming aan.
- Klikmeting vanuit e-mail vraagt een privacyvriendelijke redirect endpoint; de rapport- en uitslag-CTA's worden al gemeten zonder persoonsgegevens.
- Voeg integratie- en Playwright-E2E-tests toe zodra een Firebase Emulator-configuratie en testproject beschikbaar zijn.
- Laat privacytekst, bewaartermijnen en verwerkersafspraken juridisch toetsen vóór publicatie.
