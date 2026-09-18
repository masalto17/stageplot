/**
 * Plantilla precargada. Se muestra la primera vez que el usuario abre `/crear`
 * y todavia no hay proyecto guardado. Un stage plot vacio es la peor primera
 * impresion posible; una plantilla arrancable rompe el hielo.
 *
 * Formato: banda basica (bateria, bajo, guitarra, teclado, voz principal +
 * coros, monitores). Coordenadas en el sistema del lienzo (1000 x 625).
 */
import type { Proyecto } from '@/store/proyecto';

export function plantillaBanda(): Proyecto {
  const ahora = Date.now();
  const id = crypto.randomUUID();

  const inst = (equipoId: string, x: number, y: number, etiqueta?: string) => ({
    id: crypto.randomUUID(),
    equipoId,
    x,
    y,
    rotacion: 0,
    etiqueta,
  });

  return {
    id,
    nombre: 'Banda de rock',
    creado: ahora,
    modificado: ahora,
    instrumentos: [
      // Bateria centrada al fondo.
      inst('kick', 500, 400),
      inst('snare', 460, 360),
      inst('hihat', 420, 340),
      inst('tom', 500, 340),
      inst('floor', 550, 380),
      inst('ride', 570, 350),
      inst('overhead', 500, 300),
      // Bajo al fondo derecha.
      inst('bajo-amp', 720, 420),
      inst('bajo-di', 720, 350),
      // Guitarra al fondo izquierda.
      inst('gtr-amp', 280, 420),
      inst('gtr-pedal', 280, 480),
      // Teclado a la derecha.
      inst('teclado', 780, 250),
      // Voces al frente.
      inst('mic-vocal', 500, 150, 'Cantante'),
      inst('mic-coros', 380, 180, 'Coro 1'),
      inst('mic-coros', 620, 180, 'Coro 2'),
      // Monitores al frente.
      inst('monitor', 380, 110),
      inst('monitor', 500, 110),
      inst('monitor', 620, 110),
    ],
  };
}
