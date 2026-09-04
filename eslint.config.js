// De bewaker die dit project miste.
//
// Twee keer is hier een variabele gebruikt die nergens gedeclareerd stond. De
// eerste keer viel het op doordat een scherm crashte; de tweede keer viel het
// helemaal niet op — het overnemen van een profielvoorstel wérkte, maar de
// bevestiging erna gooide stilletjes een ReferenceError en niemand zag ooit de
// melding. Vite bouwt zulke code gewoon: een onbekende naam is pas een fout op
// het moment dat die regel draait.
//
// Deze configuratie is met opzet klein. Hij gaat niet over stijl — dat regelt
// de code zelf al, en een linter die over komma's klaagt leert je hem negeren.
// Hij gaat over de dingen die anders pas bij een gebruiker aan het licht komen.

import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "dist/**",
      "dist-check-WEG/**",
      "dist-check-WEG2/**",
      "archief/**",
      "node_modules/**",
      "functions/node_modules/**",
      "public/**",
    ],
  },

  /* ------------------------------------------------------------- de app */
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,

      // Waar het allemaal om begonnen is.
      "no-undef": "error",

      // Een lege catch mag: op de publieke site staat een handvol
      // "lukt het niet, dan niet"-acties (iets naar het klembord kopiëren,
      // uitloggen) waar een foutmelding meer kwaad dan goed doet. Voor de
      // app-schermen is valideer-foutafhandeling.mjs strenger: daar mag een
      // try helemaal geen catch missen.
      "no-empty": ["error", { allowEmptyCatch: true }],

      // Een variabele die je aanmaakt maar niet gebruikt is meestal een
      // half afgemaakte gedachte. Argumenten en catch-bindingen mogen wel
      // blijven staan als ze de vorm van een functie verklaren.
      "no-unused-vars": [
        "warn",
        { args: "none", caughtErrors: "none", ignoreRestSiblings: true },
      ],

      // Hooks na een early return. Dat is precies de fout die React pas laat
      // klappen wanneer een scherm net één keer een andere weg neemt.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Deze app geeft bewust geen propTypes op; de componenten staan naast
      // hun gebruik en de props staan in de JSDoc erboven.
      "react/prop-types": "off",

      // Losse tekens in JSX zijn hier vaak Nederlands leesteken-werk
      // (aanhalingstekens in een zin), niet per ongeluk.
      "react/no-unescaped-entities": "off",
    },
  },

  /* ------------------------------------- scripts, tests en Cloud Functions */
  {
    files: ["scripts/**/*.mjs", "tests/**/*.mjs", "functions/**/*.js", "api/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
    },
  },
];
