/**
 * Plantillas precargadas.
 *
 * `plantillaBanda()` es la que se muestra al abrir /crear sin proyecto previo.
 * El resto se cargan desde /plantillas/[genero] pasando `?plantilla=<slug>`.
 * Coordenadas en el sistema del lienzo (1000 x 625). Origen en la esquina
 * superior izquierda; el frente del escenario esta en `y >= alto`.
 */
import type { Proyecto } from '@/store/proyecto';

type SlugPlantilla = 'rock' | 'solista' | 'dj' | 'folklore';

interface EntradaInstrumento {
  equipoId: string;
  x: number;
  y: number;
  etiqueta?: string;
}

function armar(nombre: string, entradas: readonly EntradaInstrumento[]): Proyecto {
  const ahora = Date.now();
  return {
    id: crypto.randomUUID(),
    nombre,
    creado: ahora,
    modificado: ahora,
    instrumentos: entradas.map((e) => ({
      id: crypto.randomUUID(),
      equipoId: e.equipoId,
      x: e.x,
      y: e.y,
      rotacion: 0,
      etiqueta: e.etiqueta,
    })),
  };
}

const BANDA: readonly EntradaInstrumento[] = [
  // Bateria centrada al fondo.
  { equipoId: 'kick', x: 500, y: 400 },
  { equipoId: 'snare', x: 460, y: 360 },
  { equipoId: 'hihat', x: 420, y: 340 },
  { equipoId: 'tom', x: 500, y: 340 },
  { equipoId: 'floor', x: 550, y: 380 },
  { equipoId: 'ride', x: 570, y: 350 },
  { equipoId: 'overhead', x: 500, y: 300 },
  // Bajo al fondo derecha.
  { equipoId: 'bajo-amp', x: 720, y: 420 },
  { equipoId: 'bajo-di', x: 720, y: 350 },
  // Guitarra al fondo izquierda.
  { equipoId: 'gtr-amp', x: 280, y: 420 },
  { equipoId: 'gtr-pedal', x: 280, y: 480 },
  // Teclado a la derecha.
  { equipoId: 'teclado', x: 780, y: 250 },
  // Voces al frente.
  { equipoId: 'mic-vocal', x: 500, y: 150, etiqueta: 'Cantante' },
  { equipoId: 'mic-coros', x: 380, y: 180, etiqueta: 'Coro 1' },
  { equipoId: 'mic-coros', x: 620, y: 180, etiqueta: 'Coro 2' },
  // Monitores al frente.
  { equipoId: 'monitor', x: 380, y: 110 },
  { equipoId: 'monitor', x: 500, y: 110 },
  { equipoId: 'monitor', x: 620, y: 110 },
];

const SOLISTA: readonly EntradaInstrumento[] = [
  { equipoId: 'mic-vocal', x: 500, y: 200, etiqueta: 'Solista' },
  { equipoId: 'gtr-acu', x: 500, y: 320 },
  { equipoId: 'monitor', x: 500, y: 110 },
];

const DJ: readonly EntradaInstrumento[] = [
  // Cabina centrada, salidas por DI en L/R.
  { equipoId: 'teclado', x: 500, y: 300, etiqueta: 'Cabina DJ' },
  { equipoId: 'mic-vocal', x: 500, y: 200, etiqueta: 'MC' },
  { equipoId: 'monitor', x: 380, y: 110 },
  { equipoId: 'monitor', x: 620, y: 110 },
  { equipoId: 'inear', x: 720, y: 300 },
];

const FOLKLORE: readonly EntradaInstrumento[] = [
  // Guitarras acusticas al frente, percusion al fondo.
  { equipoId: 'mic-vocal', x: 400, y: 220, etiqueta: 'Voz 1' },
  { equipoId: 'mic-vocal', x: 600, y: 220, etiqueta: 'Voz 2' },
  { equipoId: 'gtr-acu', x: 400, y: 330 },
  { equipoId: 'gtr-acu', x: 600, y: 330 },
  { equipoId: 'bongo', x: 300, y: 400 },
  { equipoId: 'cajon', x: 700, y: 400 },
  { equipoId: 'monitor', x: 400, y: 110 },
  { equipoId: 'monitor', x: 600, y: 110 },
];

const PLANTILLAS: Record<SlugPlantilla, () => Proyecto> = {
  rock: () => armar('Banda de rock', BANDA),
  solista: () => armar('Solista con guitarra', SOLISTA),
  dj: () => armar('Set de DJ', DJ),
  folklore: () => armar('Folklore', FOLKLORE),
};

export function plantillaBanda(): Proyecto {
  return PLANTILLAS.rock();
}

export function plantillaPorSlug(slug: string): Proyecto | null {
  return slug in PLANTILLAS ? PLANTILLAS[slug as SlugPlantilla]() : null;
}

/** Slugs validos, para el getStaticPaths de /plantillas/[genero]. */
export const SLUGS_PLANTILLA: readonly SlugPlantilla[] = ['rock', 'solista', 'dj', 'folklore'];
