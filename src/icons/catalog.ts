/**
 * Catalogo de equipos - iconografia y canales.
 *
 * Cada equipo tiene:
 *  - `nombre.es` y `nombre.en`: bilingue por diseno (la UI y la etiqueta del
 *    canvas siguen el idioma elegido; la paleta muestra ambos para riders
 *    internacionales);
 *  - `paths`: SVG inline en viewBox 0 0 100 100. Cada path elige `modo`:
 *    - `linea` (default): solo trazo;
 *    - `suave`: fill translucido + trazo (da cuerpo sin pisar el fondo);
 *    - `solido`: fill full (acentos duros);
 *  - `canales`: lista de canales por defecto que se agregan al proyecto
 *    cuando el equipo cae en el lienzo. Cada canal es bilingue tambien.
 *
 * Al agregar equipos nuevos, elegir un id nuevo y nunca reciclar uno viejo:
 * los proyectos guardados en IndexedDB persisten por id.
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

export interface TextoBilingue {
  es: string;
  en: string;
}

export interface CanalPlantilla {
  nombre: TextoBilingue;
  senal: 'linea' | 'micro' | 'inalambrico' | 'monitor';
  phantom?: boolean;
}

export interface PathEquipo {
  d: string;
  modo?: 'linea' | 'suave' | 'solido';
}

export interface Equipo {
  id: string;
  nombre: TextoBilingue;
  categoria: CategoriaEquipo;
  paths: readonly PathEquipo[];
  canales: readonly CanalPlantilla[];
}

// Helpers cortos para reducir ruido visual en el catalogo.
const es_en = (es: string, en: string): TextoBilingue => ({ es, en });
const suave = (d: string): PathEquipo => ({ d, modo: 'suave' });
const solido = (d: string): PathEquipo => ({ d, modo: 'solido' });
const linea = (d: string): PathEquipo => ({ d, modo: 'linea' });

// Utilidades de path: circulo cerrado, rect redondo.
const circ = (cx: number, cy: number, r: number): string =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
const rectR = (x: number, y: number, w: number, h: number, r = 3): string => {
  const rr = Math.min(r, w / 2, h / 2);
  return (
    `M ${x + rr} ${y} h ${w - 2 * rr} a ${rr} ${rr} 0 0 1 ${rr} ${rr} ` +
    `v ${h - 2 * rr} a ${rr} ${rr} 0 0 1 ${-rr} ${rr} ` +
    `h ${-(w - 2 * rr)} a ${rr} ${rr} 0 0 1 ${-rr} ${-rr} ` +
    `v ${-(h - 2 * rr)} a ${rr} ${rr} 0 0 1 ${rr} ${-rr} z`
  );
};

export const EQUIPOS: readonly Equipo[] = [
  // ---------- Bateria ----------
  {
    id: 'kick',
    nombre: es_en('Bombo', 'Kick'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 50, 32)),
      linea(circ(50, 50, 32)),
      linea(circ(50, 50, 27)),
      solido(circ(50, 50, 5)),
    ],
    canales: [{ nombre: es_en('Bombo', 'Kick'), senal: 'micro' }],
  },
  {
    id: 'snare',
    nombre: es_en('Redoblante', 'Snare'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 45, 22)),
      linea(circ(50, 45, 22)),
      linea(circ(50, 45, 18)),
      solido(circ(50, 45, 2)),
      // Snare wires: tres lineas oblicuas debajo.
      linea('M 34 72 L 66 78 M 34 78 L 66 84 M 34 84 L 66 90'),
    ],
    canales: [
      { nombre: es_en('Redoblante arriba', 'Snare top'), senal: 'micro' },
      { nombre: es_en('Redoblante abajo', 'Snare bot'), senal: 'micro' },
    ],
  },
  {
    id: 'hihat',
    nombre: es_en('Hi-hat', 'Hi-hat'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 50, 24)),
      linea(circ(50, 50, 24)),
      linea(circ(50, 50, 20)),
      solido(circ(50, 50, 4)),
      // Simbolo de "cerrado/abierto": pequenio arco encima.
      linea('M 30 32 Q 50 22 70 32'),
    ],
    canales: [
      { nombre: es_en('Hi-hat', 'Hi-hat'), senal: 'micro', phantom: true },
    ],
  },
  {
    id: 'tom',
    nombre: es_en('Tom', 'Tom'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 50, 20)),
      linea(circ(50, 50, 20)),
      linea(circ(50, 50, 16)),
      solido(circ(50, 50, 2)),
    ],
    canales: [{ nombre: es_en('Tom', 'Tom'), senal: 'micro' }],
  },
  {
    id: 'floor',
    nombre: es_en('Tom de piso', 'Floor tom'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 48, 26)),
      linea(circ(50, 48, 26)),
      linea(circ(50, 48, 22)),
      solido(circ(50, 48, 2)),
      // Tres patas.
      linea('M 30 68 L 22 82 M 50 74 L 50 88 M 70 68 L 78 82'),
    ],
    canales: [{ nombre: es_en('Tom de piso', 'Floor tom'), senal: 'micro' }],
  },
  {
    id: 'overhead',
    nombre: es_en('Overhead', 'Overhead'),
    categoria: 'bateria',
    paths: [
      // Pie recto + brazo + mic (capsula) apuntando hacia abajo.
      linea('M 50 90 V 40'),
      linea('M 50 40 L 28 26'),
      suave(rectR(19, 20, 18, 14, 3)),
      linea(rectR(19, 20, 18, 14, 3)),
      solido(circ(28, 27, 2)),
      // Base tripode.
      linea('M 42 92 L 58 92'),
    ],
    canales: [
      { nombre: es_en('OH L', 'OH L'), senal: 'micro', phantom: true },
      { nombre: es_en('OH R', 'OH R'), senal: 'micro', phantom: true },
    ],
  },
  {
    id: 'ride',
    nombre: es_en('Ride', 'Ride'),
    categoria: 'bateria',
    paths: [
      suave(circ(50, 50, 30)),
      linea(circ(50, 50, 30)),
      linea(circ(50, 50, 22)),
      linea(circ(50, 50, 14)),
      solido(circ(50, 50, 5)),
    ],
    canales: [{ nombre: es_en('Ride', 'Ride'), senal: 'micro', phantom: true }],
  },
  // ---------- Percusion ----------
  {
    id: 'conga',
    nombre: es_en('Conga', 'Conga'),
    categoria: 'percusion',
    paths: [
      suave(rectR(35, 18, 30, 60, 6)),
      linea(rectR(35, 18, 30, 60, 6)),
      linea('M 35 30 h 30 M 35 66 h 30'),
      solido(circ(50, 48, 2)),
    ],
    canales: [{ nombre: es_en('Conga', 'Conga'), senal: 'micro' }],
  },
  {
    id: 'bongo',
    nombre: es_en('Bongo', 'Bongo'),
    categoria: 'percusion',
    paths: [
      suave(circ(35, 50, 15)),
      linea(circ(35, 50, 15)),
      suave(circ(65, 50, 12)),
      linea(circ(65, 50, 12)),
      solido(circ(35, 50, 2)),
      solido(circ(65, 50, 2)),
    ],
    canales: [{ nombre: es_en('Bongo', 'Bongo'), senal: 'micro' }],
  },
  {
    id: 'cajon',
    nombre: es_en('Cajon', 'Cajon'),
    categoria: 'percusion',
    paths: [
      suave(rectR(25, 18, 50, 64, 4)),
      linea(rectR(25, 18, 50, 64, 4)),
      linea(circ(50, 60, 8)),
      // Marca de golpe superior.
      linea('M 34 30 h 32'),
    ],
    canales: [{ nombre: es_en('Cajon', 'Cajon'), senal: 'micro' }],
  },
  {
    id: 'timbal',
    nombre: es_en('Timbal', 'Timbales'),
    categoria: 'percusion',
    paths: [
      suave(circ(35, 50, 16)),
      linea(circ(35, 50, 16)),
      suave(circ(65, 50, 16)),
      linea(circ(65, 50, 16)),
      linea('M 35 66 v 12 M 65 66 v 12'),
    ],
    canales: [
      { nombre: es_en('Timbal L', 'Timbales L'), senal: 'micro' },
      { nombre: es_en('Timbal R', 'Timbales R'), senal: 'micro' },
    ],
  },
  // ---------- Bajo ----------
  {
    id: 'bajo-di',
    nombre: es_en('DI de bajo', 'Bass DI'),
    categoria: 'bajo',
    paths: [
      suave(rectR(28, 28, 44, 44, 4)),
      linea(rectR(28, 28, 44, 44, 4)),
      // Jack 1/4"
      linea(circ(40, 44, 4)),
      solido(circ(40, 44, 2)),
      // XLR.
      linea(circ(60, 44, 4)),
      solido(circ(60, 42, 1)),
      solido(circ(58, 46, 1)),
      solido(circ(62, 46, 1)),
      // LED.
      solido(circ(50, 60, 2)),
    ],
    canales: [{ nombre: es_en('Bajo DI', 'Bass DI'), senal: 'linea' }],
  },
  {
    id: 'bajo-amp',
    nombre: es_en('Ampli de bajo', 'Bass amp'),
    categoria: 'bajo',
    paths: [
      suave(rectR(18, 22, 64, 60, 4)),
      linea(rectR(18, 22, 64, 60, 4)),
      // Cabezal control.
      linea('M 18 34 h 64'),
      solido(circ(28, 28, 2)),
      solido(circ(38, 28, 2)),
      solido(circ(48, 28, 2)),
      solido(circ(58, 28, 2)),
      solido(circ(68, 28, 2)),
      // Cono del bafle.
      linea(circ(50, 58, 18)),
      suave(circ(50, 58, 13)),
      solido(circ(50, 58, 4)),
    ],
    canales: [{ nombre: es_en('Ampli bajo', 'Bass amp'), senal: 'micro' }],
  },
  // ---------- Guitarra ----------
  {
    id: 'gtr-amp',
    nombre: es_en('Ampli de guitarra', 'Guitar amp'),
    categoria: 'guitarra',
    paths: [
      suave(rectR(20, 22, 60, 60, 4)),
      linea(rectR(20, 22, 60, 60, 4)),
      linea('M 20 34 h 60'),
      // Perillas.
      solido(circ(30, 28, 2)),
      solido(circ(42, 28, 2)),
      solido(circ(54, 28, 2)),
      solido(circ(66, 28, 2)),
      // Speaker cone.
      linea(circ(50, 58, 16)),
      suave(circ(50, 58, 12)),
      solido(circ(50, 58, 4)),
    ],
    canales: [{ nombre: es_en('Guitarra', 'Guitar'), senal: 'micro' }],
  },
  {
    id: 'gtr-acu',
    nombre: es_en('Guitarra acustica', 'Acoustic guitar'),
    categoria: 'guitarra',
    paths: [
      // Cuerpo estilo dreadnought.
      suave('M 50 18 C 32 18 24 34 28 50 C 22 66 30 86 50 86 C 70 86 78 66 72 50 C 76 34 68 18 50 18 Z'),
      linea('M 50 18 C 32 18 24 34 28 50 C 22 66 30 86 50 86 C 70 86 78 66 72 50 C 76 34 68 18 50 18 Z'),
      // Boca.
      linea(circ(50, 55, 8)),
      // Puente.
      linea('M 42 70 h 16'),
      // Trastes en el mastil.
      linea('M 48 20 h 4'),
    ],
    canales: [{ nombre: es_en('Acustica', 'Acoustic'), senal: 'linea' }],
  },
  {
    id: 'gtr-pedal',
    nombre: es_en('Pedalera', 'Pedalboard'),
    categoria: 'guitarra',
    paths: [
      suave(rectR(14, 38, 72, 28, 3)),
      linea(rectR(14, 38, 72, 28, 3)),
      // Pedales.
      linea(circ(28, 52, 5)),
      solido(circ(28, 52, 2)),
      linea(circ(42, 52, 5)),
      solido(circ(42, 52, 2)),
      linea(circ(58, 52, 5)),
      solido(circ(58, 52, 2)),
      linea(circ(72, 52, 5)),
      solido(circ(72, 52, 2)),
    ],
    canales: [{ nombre: es_en('Guitarra', 'Guitar'), senal: 'linea' }],
  },
  // ---------- Teclados ----------
  {
    id: 'teclado',
    nombre: es_en('Teclado', 'Keyboard'),
    categoria: 'teclado',
    paths: [
      suave(rectR(10, 38, 80, 30, 3)),
      linea(rectR(10, 38, 80, 30, 3)),
      // Teclas blancas.
      linea('M 20 38 v 30 M 30 38 v 30 M 40 38 v 30 M 50 38 v 30 M 60 38 v 30 M 70 38 v 30 M 80 38 v 30'),
      // Teclas negras.
      solido(rectR(22, 38, 6, 16, 1)),
      solido(rectR(32, 38, 6, 16, 1)),
      solido(rectR(52, 38, 6, 16, 1)),
      solido(rectR(62, 38, 6, 16, 1)),
      solido(rectR(72, 38, 6, 16, 1)),
    ],
    canales: [
      { nombre: es_en('Teclado L', 'Keys L'), senal: 'linea' },
      { nombre: es_en('Teclado R', 'Keys R'), senal: 'linea' },
    ],
  },
  {
    id: 'teclado-mono',
    nombre: es_en('Synth mono', 'Mono synth'),
    categoria: 'teclado',
    paths: [
      suave(rectR(18, 42, 64, 28, 3)),
      linea(rectR(18, 42, 64, 28, 3)),
      // Perillas + mod strip.
      solido(circ(26, 32, 2)),
      solido(circ(34, 32, 2)),
      solido(circ(42, 32, 2)),
      linea('M 28 42 v 28 M 38 42 v 28 M 48 42 v 28 M 58 42 v 28 M 68 42 v 28 M 78 42 v 28'),
      solido(rectR(30, 42, 5, 14, 1)),
      solido(rectR(50, 42, 5, 14, 1)),
      solido(rectR(60, 42, 5, 14, 1)),
    ],
    canales: [{ nombre: es_en('Synth', 'Synth'), senal: 'linea' }],
  },
  // ---------- Voz ----------
  {
    id: 'mic-vocal',
    nombre: es_en('Microfono vocal', 'Vocal mic'),
    categoria: 'voz',
    paths: [
      // Capsula (esfera).
      suave(circ(50, 28, 14)),
      linea(circ(50, 28, 14)),
      // Grilla cruzada.
      linea('M 40 22 h 20 M 40 28 h 20 M 40 34 h 20 M 44 15 v 26 M 50 14 v 28 M 56 15 v 26'),
      // Cuerpo del mango.
      suave(rectR(46, 42, 8, 40, 3)),
      linea(rectR(46, 42, 8, 40, 3)),
      // Boton.
      solido(circ(50, 74, 2)),
    ],
    canales: [{ nombre: es_en('Voz', 'Vocal'), senal: 'micro' }],
  },
  {
    id: 'mic-coros',
    nombre: es_en('Microfono coros', 'Choir mic'),
    categoria: 'voz',
    paths: [
      suave(circ(50, 28, 12)),
      linea(circ(50, 28, 12)),
      linea('M 40 24 h 20 M 40 30 h 20 M 45 18 v 20 M 50 17 v 22 M 55 18 v 20'),
      suave(rectR(47, 40, 6, 32, 2)),
      linea(rectR(47, 40, 6, 32, 2)),
      // Cable curvo.
      linea('M 50 72 C 46 78 40 82 34 82'),
    ],
    canales: [{ nombre: es_en('Coros', 'BGV'), senal: 'micro' }],
  },
  {
    id: 'mic-inal',
    nombre: es_en('Micro inalambrico', 'Wireless mic'),
    categoria: 'voz',
    paths: [
      suave(circ(50, 28, 13)),
      linea(circ(50, 28, 13)),
      linea('M 40 24 h 20 M 40 30 h 20 M 44 16 v 24 M 50 15 v 26 M 56 16 v 24'),
      suave(rectR(46, 42, 8, 34, 3)),
      linea(rectR(46, 42, 8, 34, 3)),
      // Antena.
      linea('M 50 76 v 12'),
      solido(circ(50, 90, 2)),
      // Ondas.
      linea('M 26 30 q -6 -6 0 -14 M 34 26 q -3 -3 0 -8'),
      linea('M 74 30 q 6 -6 0 -14 M 66 26 q 3 -3 0 -8'),
    ],
    canales: [
      { nombre: es_en('Voz inalambrica', 'Wireless vox'), senal: 'inalambrico' },
    ],
  },
  // ---------- Vientos ----------
  {
    id: 'mic-trompeta',
    nombre: es_en('Trompeta', 'Trumpet'),
    categoria: 'viento',
    paths: [
      // Tubo curvo.
      linea('M 14 56 C 30 56 46 52 60 50'),
      // Pistones (bulge).
      suave('M 40 44 h 12 v 24 h -12 z'),
      linea('M 40 44 h 12 v 24 h -12 z'),
      solido(circ(46, 50, 1.5)),
      solido(circ(46, 58, 1.5)),
      solido(circ(46, 66, 1.5)),
      // Campana.
      suave('M 62 32 L 88 20 L 88 80 L 62 68 Z'),
      linea('M 62 32 L 88 20 L 88 80 L 62 68 Z'),
    ],
    canales: [{ nombre: es_en('Trompeta', 'Trumpet'), senal: 'micro', phantom: true }],
  },
  {
    id: 'mic-saxo',
    nombre: es_en('Saxo', 'Sax'),
    categoria: 'viento',
    paths: [
      // Boquilla + cuello + cuerpo.
      linea('M 38 12 v 10 L 42 30 v 30 C 42 76 60 80 72 76'),
      // Campana.
      suave('M 60 60 Q 82 60 82 82 Q 62 82 60 60 Z'),
      linea('M 60 60 Q 82 60 82 82 Q 62 82 60 60'),
      // Botones.
      solido(circ(44, 40, 1.5)),
      solido(circ(46, 50, 1.5)),
      solido(circ(48, 60, 1.5)),
      solido(circ(52, 70, 1.5)),
    ],
    canales: [{ nombre: es_en('Saxo', 'Sax'), senal: 'micro', phantom: true }],
  },
  {
    id: 'mic-cuerdas',
    nombre: es_en('Cuerdas', 'Strings'),
    categoria: 'viento',
    paths: [
      // Cuerpo violin/viola (ff-holes stylised).
      suave('M 50 15 C 34 15 30 30 34 45 C 28 55 30 78 50 88 C 70 78 72 55 66 45 C 70 30 66 15 50 15 Z'),
      linea('M 50 15 C 34 15 30 30 34 45 C 28 55 30 78 50 88 C 70 78 72 55 66 45 C 70 30 66 15 50 15 Z'),
      // Puente.
      linea('M 42 55 h 16'),
      // Cuerdas.
      linea('M 46 20 v 60 M 50 20 v 60 M 54 20 v 60'),
    ],
    canales: [{ nombre: es_en('Cuerdas', 'Strings'), senal: 'micro', phantom: true }],
  },
  // ---------- Monitores ----------
  {
    id: 'monitor',
    nombre: es_en('Monitor de piso', 'Floor wedge'),
    categoria: 'monitor',
    paths: [
      // Cuna trapezoidal.
      suave('M 14 76 L 30 34 L 70 34 L 86 76 Z'),
      linea('M 14 76 L 30 34 L 70 34 L 86 76 Z'),
      // Grille.
      linea('M 30 40 h 40 M 30 46 h 40 M 30 52 h 40 M 30 58 h 40 M 30 64 h 40 M 30 70 h 40'),
      // Speaker circle center.
      linea(circ(50, 55, 12)),
      solido(circ(50, 55, 4)),
    ],
    canales: [{ nombre: es_en('Monitor', 'Wedge'), senal: 'monitor' }],
  },
  {
    id: 'sidefill',
    nombre: es_en('Sidefill', 'Sidefill'),
    categoria: 'monitor',
    paths: [
      suave(rectR(28, 14, 44, 72, 4)),
      linea(rectR(28, 14, 44, 72, 4)),
      // Tweeter + woofer.
      linea(circ(50, 30, 6)),
      solido(circ(50, 30, 3)),
      linea(circ(50, 62, 14)),
      suave(circ(50, 62, 11)),
      solido(circ(50, 62, 4)),
    ],
    canales: [{ nombre: es_en('Sidefill', 'Sidefill'), senal: 'monitor' }],
  },
  {
    id: 'inear',
    nombre: es_en('In-ear', 'In-ear'),
    categoria: 'monitor',
    paths: [
      // Auricular de forma anatomica.
      suave('M 38 22 C 26 26 24 40 30 52 C 34 62 40 70 50 68 C 60 70 66 60 66 48 C 66 32 54 20 38 22 Z'),
      linea('M 38 22 C 26 26 24 40 30 52 C 34 62 40 70 50 68 C 60 70 66 60 66 48 C 66 32 54 20 38 22 Z'),
      // Punta.
      solido(circ(50, 76, 4)),
      // Cable.
      linea('M 50 80 C 50 88 60 88 62 92'),
    ],
    canales: [{ nombre: es_en('In-ear', 'IEM'), senal: 'monitor' }],
  },
  // ---------- Backline ----------
  {
    id: 'sub',
    nombre: es_en('Subwoofer', 'Subwoofer'),
    categoria: 'backline',
    paths: [
      suave(rectR(14, 20, 72, 60, 4)),
      linea(rectR(14, 20, 72, 60, 4)),
      linea(circ(50, 50, 22)),
      suave(circ(50, 50, 18)),
      solido(circ(50, 50, 8)),
      linea(circ(50, 50, 4)),
    ],
    canales: [],
  },
  {
    id: 'foh',
    nombre: es_en('Consola FOH', 'FOH console'),
    categoria: 'backline',
    paths: [
      suave(rectR(12, 30, 76, 48, 3)),
      linea(rectR(12, 30, 76, 48, 3)),
      // Faders 6 canales.
      linea('M 22 34 v 40 M 32 34 v 40 M 42 34 v 40 M 52 34 v 40 M 62 34 v 40 M 72 34 v 40'),
      solido(rectR(19, 50, 6, 8, 1)),
      solido(rectR(29, 46, 6, 8, 1)),
      solido(rectR(39, 54, 6, 8, 1)),
      solido(rectR(49, 44, 6, 8, 1)),
      solido(rectR(59, 52, 6, 8, 1)),
      solido(rectR(69, 48, 6, 8, 1)),
    ],
    canales: [],
  },
  // ---------- Utilidad ----------
  {
    id: 'di',
    nombre: es_en('Caja directa (DI)', 'Direct box (DI)'),
    categoria: 'utilidad',
    paths: [
      suave(rectR(30, 30, 40, 40, 3)),
      linea(rectR(30, 30, 40, 40, 3)),
      linea('M 50 42 v 12'),
      solido(circ(50, 60, 2)),
    ],
    canales: [{ nombre: es_en('DI', 'DI'), senal: 'linea' }],
  },
  {
    id: 'pedestal',
    nombre: es_en('Pedestal', 'Mic stand'),
    categoria: 'utilidad',
    paths: [
      // Mastil + boom + capsula.
      linea('M 50 84 V 30'),
      linea('M 50 30 h 24'),
      suave(circ(78, 30, 5)),
      linea(circ(78, 30, 5)),
      // Tripode.
      linea('M 30 90 L 50 84 L 70 90'),
      linea('M 50 84 v 8'),
    ],
    canales: [],
  },
];

/** Mapa por id (para lookups y fallar temprano en instrumentos con id caido). */
export const EQUIPOS_POR_ID: ReadonlyMap<string, Equipo> = new Map(
  EQUIPOS.map((eq) => [eq.id, eq]),
);
