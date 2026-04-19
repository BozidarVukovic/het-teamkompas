import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // react-snap werkt beter zonder inline assets
    assetsInlineLimit: 0,
  },
})
