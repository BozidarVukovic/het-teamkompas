# Archief

Deze map bevat oude bestanden die niet meer worden gebruikt in de applicatie.
Ze staan hier alleen om terug te kunnen kijken. Ze worden **niet** meegenomen in de
build en mogen niet opnieuw worden geïmporteerd.

De extensie is bewust `.bak` in plaats van `.jsx`, zodat editors, linters en
zoekacties door de codebase deze bestanden niet meer als actieve React-componenten
behandelen.

## Inhoud

| Bestand | Herkomst | Gearchiveerd | Waarom |
|---|---|---|---|
| `App-copy.jsx.bak` | voorheen `src/App copy.jsx` | 2026-07-26 | Handmatige kopie van `App.jsx` uit juni 2026. Werd nergens geïmporteerd, maar dook wel op in zoekresultaten en bevatte verouderde teksten. |
| `het-teamkompas-volledig.jsx.bak` | voorheen `src/het-teamkompas-volledig.jsx` | 2026-07-26 | Oude monoliet van de hele site, voordat pagina's naar `src/pages/` zijn opgesplitst. Werd nergens geïmporteerd. |

## Let op

Beide bestanden bevatten teksten die inmiddels zijn herschreven, onder andere over
anonimiteit van de teamscan. Gebruik ze niet als bron voor nieuwe copy; de actuele
teksten staan in `src/App.jsx`, `src/TeamscanDigitaal.jsx` en `src/pages/`.
