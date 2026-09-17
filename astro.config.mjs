// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://masalto.com.ar';
// La app vive en una subruta de masalto.com.ar: assets, manifest y scope del
// Service Worker tienen que colgar de esta base o el SW no controla las paginas.
const BASE = '/stageplot/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
      // /crear es una herramienta, no contenido indexable.
      filter: (page) => !page.includes('/crear'),
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src/', import.meta.url).pathname,
      },
    },
  },
});
