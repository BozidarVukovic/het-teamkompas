import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'

const rootElement = document.getElementById('root')

// react-snap genereert statische HTML. Bij de eerste load in de browser
// moeten we die HTML hydrateren in plaats van een nieuwe DOM te renderen,
// anders krijgt de gebruiker een flash van lege content.
if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
