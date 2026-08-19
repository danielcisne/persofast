import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Explicación: Aquí agregamos el plugin oficial de Tailwind directamente a los "motores" de Vite
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})