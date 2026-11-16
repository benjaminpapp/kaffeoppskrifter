import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base må matche repo-navnet på GitHub Pages: https://benjaminpapp.github.io/kaffeoppskrifter/
export default defineConfig({
  base: '/kaffeoppskrifter/',
  plugins: [react()],
})
