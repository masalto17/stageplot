/**
 * Genera dist/sw.js despues del build de Astro.
 *
 * Se usa workbox-build directo en vez de @vite-pwa/astro (peer astro <= 5, y
 * Astro 5 arrastra CVEs abiertos) y en vez de vite-plugin-pwa (en el build
 * estatico de Astro no llega a emitir el Service Worker).
 */
import { generateSW } from 'workbox-build';

const BASE = '/stageplot/';

const { count, size, warnings } = await generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,webp,png,svg,ico,webmanifest,woff2}'],
  swDest: 'dist/sw.js',
  modifyURLPrefix: { '': BASE },
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  // El editor debe abrir offline; el resto del sitio es contenido estatico.
  navigateFallback: `${BASE}crear/index.html`,
  navigateFallbackAllowlist: [/^\/stageplot\/crear/],
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        url.origin === 'https://fonts.googleapis.com' ||
        url.origin === 'https://fonts.gstatic.com',
      handler: 'CacheFirst',
      options: {
        cacheName: 'fuentes-google',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

for (const warning of warnings) console.warn(warning);
console.log(`sw.js: ${count} archivos precacheados, ${(size / 1024).toFixed(1)} kB`);
