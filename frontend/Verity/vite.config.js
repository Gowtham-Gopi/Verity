import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { authApiPlugin } from './src/server/authPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
})

