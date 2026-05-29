import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // In Produktion läuft die App unter https://team16.wi1cm.uni-trier.de/public/.
  // Im Dev-Server (vite serve) bleibt sie unter / erreichbar.
  const base = command === 'build' ? '/public/' : '/'

  return {
    base,
    plugins: [
      react(),
    ],
    // Build direkt in das CodeIgniter public/-Verzeichnis, ohne index.php zu löschen.
    build: {
      outDir: '../public',
      emptyOutDir: false,
    },
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
        '/media': 'http://localhost:8080',
      },
    },
  }
})
