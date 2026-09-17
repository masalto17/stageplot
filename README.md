# MasAlto StagePlot

Herramienta gratuita para armar el stage plot de un show, obtener la lista de
canales automatica y compartirla en PDF. Primera app de la seccion de apps del
ecosistema MasAlto.

Marca primaria: **MasAlto Producciones**.

## Estado

Etapa **B1 (setup)** terminada. La logica del editor (Zustand + zundo + Dexie,
lienzo con interact.js, export con jsPDF + html2canvas) llega en **B2**.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo
npm run typecheck  # astro check (gate obligatorio antes del deploy)
npm run build      # build + generacion del Service Worker
npm run preview    # sirve dist/ en http://localhost:4321/stageplot/
```

## Stack

- Astro 7 + islas React (`/crear` es `client:only="react"`).
- TypeScript estricto (`strict`, `noUncheckedIndexedAccess`), alias `@/` a `src/`.
- PWA: `manifest.webmanifest` estatico + Service Worker generado con
  `workbox-build` (`scripts/build-sw.mjs`).
- Deploy: GitHub Pages via GitHub Actions, con `typecheck` + `build` como gate.

### Por que no `@vite-pwa/astro`

El kickoff pedia `@vite-pwa/astro`, pero su peer dependency llega hasta Astro 5
y esa linea arrastra CVEs abiertos (XSS, RCE en optimizacion AVIF). Con
`vite-plugin-pwa` sobre Astro 7 el Service Worker no se emitia en el build
estatico. La solucion es `workbox-build` como paso posterior al build: mismo
resultado, sin dependencias en conflicto y con `npm audit` en 0.

## Subruta y Service Worker

El sitio vive en `https://masalto.com.ar/stageplot/`. `base` y `scope` estan
fijados a `/stageplot/` en `astro.config.mjs`, el manifest y `scripts/build-sw.mjs`.
Si cambia la subruta, hay que cambiarla en esos tres lugares y en
`public/robots.txt`.

## Marca

- Activos AUTORIZADOS en `src/assets/brand/`, copiados sin modificar desde el
  Brand Master (`MasAlto_Producciones_Color_Fondo_Claro.png` y
  `MasAlto_Producciones_Negativo_Fondo_Oscuro.png`).
- Colores: rojo `#E30613`, negro `#000000`, blanco `#FFFFFF`. Los grises de la
  interfaz son opacidades del negro; no hay HEX de apoyo inventados.
- Tipografia: `Nunito Sans` para interfaz, `IBM Plex Mono` para datos tecnicos.
- Tamano minimo del logo con descriptor: 220 px de ancho.
- Los iconos PWA se generan con `python3 scripts/generate-icons.py`: el logo se
  escala de forma uniforme y se centra sobre lienzo blanco, sin recortes ni
  recoloreo.

**TODO:** reemplazar el icono cuando exista el activo monocromo autorizado de
MasAlto Producciones (hoy `BLOQUEADO` en el manifiesto del Brand Master).

## Indexacion

`/crear` queda fuera del sitemap y lleva `noindex, nofollow` en el HTML, que es
el control que realmente aplica. `public/robots.txt` se publica en
`/stageplot/robots.txt`: los crawlers solo leen el `robots.txt` de la raiz del
dominio, asi que la regla `Disallow` hay que replicarla en el `robots.txt` de
`masalto.com.ar`.
