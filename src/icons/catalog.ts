/**
 * Catalogo de equipos. Cada equipo trae:
 *  - `viewBox` y `paths` para el SVG inline (sin dependencias externas);
 *  - la lista de canales por defecto que se agregan a la lista automatica
 *    cuando el equipo entra al lienzo.
 *
 * Los canales por defecto se ajustan a la practica normal de riders locales:
 * un kick manda un canal ("Kick"), un ampli de guitarra manda uno ("Gtr"),
 * un teclado stereo manda dos ("Kbd L", "Kbd R"), etc. El usuario puede
 * editar el nombre desde la lista.
 *
 * viewBox: siempre `0 0 100 100`. Trazo en negro, `stroke-width` 4, lineal.
 * `fill` transparente por defecto; los "cuerpos" solidos se marcan con
 * `fill: 'currentColor'` en el path.
 */
export type CategoriaEquipo =
  | 'bateria'
  | 'percusion'
  | 'guitarra'
  | 'bajo'
  | 'teclado'
  | 'voz'
  | 'viento'
  | 'monitor'
  | 'backline'
  | 'utilidad';

export interface CanalPlantilla {
  nombre: string;
  /** Tipo de senal, para ordenar la lista de canales. */
  senal: 'linea' | 'micro' | 'inalambrico' | 'monitor';
  /** Requiere phantom power (+48V). */
  phantom?: boolean;
}

export interface Equipo {
  /** Id estable, usado en la persistencia. Nunca renombrar. */
  id: string;
  nombre: string;
  categoria: CategoriaEquipo;
  /** Path o paths del SVG. `d` en un `viewBox` 0 0 100 100. */
  paths: readonly {
    d: string;
    /** Rellenar con currentColor en vez de solo trazo. */
    solido?: boolean;
  }[];
  canales: readonly CanalPlantilla[];
}

/**
 * ~30 equipos. El id nunca cambia (persistimos por id).
 * Al agregar equipos nuevos, elegir un id nuevo y no reciclar uno viejo.
 */
export const EQUIPOS: readonly Equipo[] = [
  // ---------- Bateria ----------
  {
    id: 'kick',
    nombre: 'Bombo',
    categoria: 'bateria',
    paths: [
      { d: 'M50 20 A30 30 0 1 0 50 80 A30 30 0 1 0 50 20' },
      { d: 'M50 40 A10 10 0 1 0 50 60 A10 10 0 1 0 50 40', solido: true },
    ],
    canales: [{ nombre: 'Kick', senal: 'micro' }],
  },
  {
    id: 'snare',
    nombre: 'Snare',
    categoria: 'bateria',
    paths: [
      { d: 'M20 45 h60 v10 h-60 z' },
      { d: 'M22 55 l3 6 M32 55 l3 6 M42 55 l3 6 M52 55 l3 6 M62 55 l3 6 M72 55 l3 6' },
    ],
    canales: [
      { nombre: 'Snare top', senal: 'micro' },
      { nombre: 'Snare bot', senal: 'micro' },
    ],
  },
  {
    id: 'hihat',
    nombre: 'Hi-hat',
    categoria: 'bateria',
    paths: [
      { d: 'M25 55 h50' },
      { d: 'M25 45 h50' },
      { d: 'M48 55 v20' },
    ],
    canales: [{ nombre: 'Hi-hat', senal: 'micro', phantom: true }],
  },
  {
    id: 'tom',
    nombre: 'Tom',
    categoria: 'bateria',
    paths: [{ d: 'M50 25 A22 22 0 1 0 50 75 A22 22 0 1 0 50 25' }],
    canales: [{ nombre: 'Tom', senal: 'micro' }],
  },
  {
    id: 'floor',
    nombre: 'Floor tom',
    categoria: 'bateria',
    paths: [
      { d: 'M50 20 A28 28 0 1 0 50 80 A28 28 0 1 0 50 20' },
      { d: 'M25 80 v10 M75 80 v10' },
    ],
    canales: [{ nombre: 'Floor', senal: 'micro' }],
  },
  {
    id: 'overhead',
    nombre: 'Overhead',
    categoria: 'bateria',
    paths: [
      { d: 'M20 30 h60' },
      { d: 'M50 30 v50' },
      { d: 'M40 75 h20 v10 h-20 z', solido: true },
    ],
    canales: [
      { nombre: 'OH L', senal: 'micro', phantom: true },
      { nombre: 'OH R', senal: 'micro', phantom: true },
    ],
  },
  {
    id: 'ride',
    nombre: 'Ride',
    categoria: 'bateria',
    paths: [
      { d: 'M50 30 A25 25 0 1 0 50 70 A25 25 0 1 0 50 30' },
      { d: 'M35 50 h30 M40 40 h20 M40 60 h20' },
    ],
    canales: [{ nombre: 'Ride', senal: 'micro', phantom: true }],
  },
  // ---------- Percusion ----------
  {
    id: 'conga',
    nombre: 'Conga',
    categoria: 'percusion',
    paths: [
      { d: 'M35 20 h30 v60 h-30 z' },
      { d: 'M35 30 h30' },
    ],
    canales: [{ nombre: 'Conga', senal: 'micro' }],
  },
  {
    id: 'bongo',
    nombre: 'Bongo',
    categoria: 'percusion',
    paths: [
      { d: 'M20 30 h25 v40 h-25 z' },
      { d: 'M55 35 h25 v30 h-25 z' },
    ],
    canales: [{ nombre: 'Bongo', senal: 'micro' }],
  },
  {
    id: 'cajon',
    nombre: 'Cajon',
    categoria: 'percusion',
    paths: [
      { d: 'M25 20 h50 v60 h-50 z' },
      { d: 'M50 55 A6 6 0 1 0 50 65 A6 6 0 1 0 50 55' },
    ],
    canales: [{ nombre: 'Cajon', senal: 'micro' }],
  },
  {
    id: 'timbal',
    nombre: 'Timbal',
    categoria: 'percusion',
    paths: [
      { d: 'M20 40 h25 v25 h-25 z' },
      { d: 'M55 40 h25 v25 h-25 z' },
      { d: 'M32 65 v15 M67 65 v15' },
    ],
    canales: [
      { nombre: 'Timbal L', senal: 'micro' },
      { nombre: 'Timbal R', senal: 'micro' },
    ],
  },
  // ---------- Bajo ----------
  {
    id: 'bajo-di',
    nombre: 'Bajo DI',
    categoria: 'bajo',
    paths: [
      { d: 'M25 25 h50 v50 h-50 z' },
      { d: 'M35 40 l30 20 M65 40 l-30 20' },
    ],
    canales: [{ nombre: 'Bass DI', senal: 'linea' }],
  },
  {
    id: 'bajo-amp',
    nombre: 'Ampli bajo',
    categoria: 'bajo',
    paths: [
      { d: 'M20 20 h60 v60 h-60 z' },
      { d: 'M50 50 A20 20 0 1 0 50 51 z' },
    ],
    canales: [{ nombre: 'Bass amp', senal: 'micro' }],
  },
  // ---------- Guitarra ----------
  {
    id: 'gtr-amp',
    nombre: 'Ampli guitarra',
    categoria: 'guitarra',
    paths: [
      { d: 'M20 25 h60 v55 h-60 z' },
      { d: 'M50 55 A15 15 0 1 0 50 56 z' },
    ],
    canales: [{ nombre: 'Gtr', senal: 'micro' }],
  },
  {
    id: 'gtr-acu',
    nombre: 'Guitarra acustica',
    categoria: 'guitarra',
    paths: [
      { d: 'M50 15 A30 35 0 1 0 50 85 A30 35 0 1 0 50 15' },
      { d: 'M50 50 A6 6 0 1 0 50 51 z' },
    ],
    canales: [{ nombre: 'Acustica', senal: 'linea' }],
  },
  {
    id: 'gtr-pedal',
    nombre: 'Pedalera',
    categoria: 'guitarra',
    paths: [
      { d: 'M15 40 h70 v25 h-70 z' },
      { d: 'M28 52 A4 4 0 1 0 28 53 z M50 52 A4 4 0 1 0 50 53 z M72 52 A4 4 0 1 0 72 53 z' },
    ],
    canales: [{ nombre: 'Gtr', senal: 'linea' }],
  },
  // ---------- Teclados ----------
  {
    id: 'teclado',
    nombre: 'Teclado',
    categoria: 'teclado',
    paths: [
      { d: 'M15 40 h70 v30 h-70 z' },
      { d: 'M25 40 v30 M35 40 v30 M45 40 v30 M55 40 v30 M65 40 v30 M75 40 v30' },
    ],
    canales: [
      { nombre: 'Kbd L', senal: 'linea' },
      { nombre: 'Kbd R', senal: 'linea' },
    ],
  },
  {
    id: 'teclado-mono',
    nombre: 'Teclado mono',
    categoria: 'teclado',
    paths: [
      { d: 'M20 45 h60 v25 h-60 z' },
      { d: 'M30 45 v25 M40 45 v25 M50 45 v25 M60 45 v25 M70 45 v25' },
    ],
    canales: [{ nombre: 'Kbd', senal: 'linea' }],
  },
  // ---------- Voz ----------
  {
    id: 'mic-vocal',
    nombre: 'Microfono vocal',
    categoria: 'voz',
    paths: [
      { d: 'M50 15 A12 12 0 1 0 50 45 A12 12 0 1 0 50 15' },
      { d: 'M50 45 v25' },
      { d: 'M40 70 h20' },
    ],
    canales: [{ nombre: 'Voz', senal: 'micro' }],
  },
  {
    id: 'mic-coros',
    nombre: 'Microfono coros',
    categoria: 'voz',
    paths: [
      { d: 'M50 15 A10 10 0 1 0 50 40 A10 10 0 1 0 50 15' },
      { d: 'M50 40 v30' },
      { d: 'M40 70 h20' },
    ],
    canales: [{ nombre: 'Coros', senal: 'micro' }],
  },
  {
    id: 'mic-inal',
    nombre: 'Microfono inalambrico',
    categoria: 'voz',
    paths: [
      { d: 'M45 15 h10 v25 h-10 z' },
      { d: 'M45 40 h10 v35 h-10 z' },
      { d: 'M40 20 l-10 -10 M60 20 l10 -10' },
    ],
    canales: [{ nombre: 'Voz inal', senal: 'inalambrico' }],
  },
  // ---------- Vientos ----------
  {
    id: 'mic-trompeta',
    nombre: 'Trompeta',
    categoria: 'viento',
    paths: [
      { d: 'M15 55 h55' },
      { d: 'M70 40 h20 v30 h-20 z' },
    ],
    canales: [{ nombre: 'Trompeta', senal: 'micro', phantom: true }],
  },
  {
    id: 'mic-saxo',
    nombre: 'Saxo',
    categoria: 'viento',
    paths: [
      { d: 'M35 15 v40 A15 15 0 0 0 65 55 v-5' },
      { d: 'M65 45 A8 8 0 0 0 65 60 A8 8 0 0 0 65 45' },
    ],
    canales: [{ nombre: 'Saxo', senal: 'micro', phantom: true }],
  },
  {
    id: 'mic-cuerdas',
    nombre: 'Cuerdas',
    categoria: 'viento',
    paths: [
      { d: 'M40 15 A10 10 0 0 0 50 25 v40 A15 15 0 0 1 35 80' },
    ],
    canales: [{ nombre: 'Cuerdas', senal: 'micro', phantom: true }],
  },
  // ---------- Monitores ----------
  {
    id: 'monitor',
    nombre: 'Monitor de piso',
    categoria: 'monitor',
    paths: [
      { d: 'M20 70 l15 -30 h30 l15 30 z' },
      { d: 'M40 55 A8 8 0 1 0 40 56 z M60 55 A8 8 0 1 0 60 56 z' },
    ],
    canales: [{ nombre: 'Monitor', senal: 'monitor' }],
  },
  {
    id: 'sidefill',
    nombre: 'Sidefill',
    categoria: 'monitor',
    paths: [
      { d: 'M25 20 h50 v60 h-50 z' },
      { d: 'M50 35 A8 8 0 1 0 50 36 z' },
      { d: 'M50 60 A12 12 0 1 0 50 61 z' },
    ],
    canales: [{ nombre: 'Sidefill', senal: 'monitor' }],
  },
  {
    id: 'inear',
    nombre: 'In-ear',
    categoria: 'monitor',
    paths: [
      { d: 'M35 30 A15 15 0 0 1 65 30 v30 A15 15 0 0 1 35 60 z' },
      { d: 'M45 70 A5 5 0 1 0 55 70 A5 5 0 1 0 45 70', solido: true },
    ],
    canales: [{ nombre: 'IEM', senal: 'monitor' }],
  },
  // ---------- Backline ----------
  {
    id: 'sub',
    nombre: 'Subwoofer',
    categoria: 'backline',
    paths: [
      { d: 'M15 20 h70 v60 h-70 z' },
      { d: 'M50 50 A18 18 0 1 0 50 51 z' },
    ],
    canales: [],
  },
  {
    id: 'foh',
    nombre: 'FOH',
    categoria: 'backline',
    paths: [
      { d: 'M15 30 h70 v45 h-70 z' },
      { d: 'M25 40 v25 M35 40 v25 M45 40 v25 M55 40 v25 M65 40 v25 M75 40 v25' },
    ],
    canales: [],
  },
  // ---------- Utilidad ----------
  {
    id: 'di',
    nombre: 'Caja directa (DI)',
    categoria: 'utilidad',
    paths: [
      { d: 'M30 30 h40 v40 h-40 z' },
      { d: 'M50 40 v20' },
    ],
    canales: [{ nombre: 'DI', senal: 'linea' }],
  },
  {
    id: 'pedestal',
    nombre: 'Pedestal',
    categoria: 'utilidad',
    paths: [
      { d: 'M50 15 v65' },
      { d: 'M30 80 h40' },
    ],
    canales: [],
  },
];

/** Mapa por id. Fallar temprano si un instrumento persistido usa un id caido. */
export const EQUIPOS_POR_ID: ReadonlyMap<string, Equipo> = new Map(
  EQUIPOS.map((eq) => [eq.id, eq]),
);
