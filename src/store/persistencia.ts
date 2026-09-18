/**
 * Autoguardado local en IndexedDB (via Dexie).
 *
 * Un solo proyecto activo por ahora (MVP: no hay lista de proyectos).
 * Al arrancar, se hidrata el store desde IndexedDB. Cada cambio se escribe
 * con debounce de 400ms; sobrevive al cierre del navegador y funciona offline.
 *
 * Version del schema:
 *  - v1: tabla `proyectos` con clave primaria `id` y un solo registro con
 *    id fijo `activo`.
 */
import Dexie, { type Table } from 'dexie';
import type { Proyecto } from './proyecto';
import { useProyecto } from './proyecto';

const ID_ACTIVO = 'activo';

interface Registro {
  id: string;
  proyecto: Proyecto;
  guardado: number;
}

class BaseStagePlot extends Dexie {
  proyectos!: Table<Registro, string>;

  constructor() {
    super('masalto-stageplot');
    this.version(1).stores({ proyectos: 'id' });
  }
}

const db = new BaseStagePlot();

async function guardar(proyecto: Proyecto): Promise<void> {
  await db.proyectos.put({ id: ID_ACTIVO, proyecto, guardado: Date.now() });
}

/** Intenta hidratar el store desde IndexedDB. Devuelve true si habia algo. */
export async function hidratarProyecto(): Promise<boolean> {
  try {
    const registro = await db.proyectos.get(ID_ACTIVO);
    if (registro) {
      useProyecto.getState().cargarProyecto(registro.proyecto);
      return true;
    }
  } catch (error) {
    // Modo privado o cuota agotada: seguimos con proyecto en memoria.
    console.warn('IndexedDB no disponible:', error);
  }
  return false;
}

/**
 * Suscribe el autoguardado. Devuelve el unsubscribe.
 *
 * Debounce: 400ms. Un rider tipico se edita a rafagas (arrastre continuo),
 * no vale la pena escribir a cada frame.
 */
export function iniciarAutoguardado(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const desuscribir = useProyecto.subscribe((estado, anterior) => {
    if (estado.proyecto === anterior.proyecto) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      guardar(estado.proyecto).catch((error) =>
        console.warn('Fallo el autoguardado:', error),
      );
    }, 400);
  });

  return () => {
    if (timer) clearTimeout(timer);
    desuscribir();
  };
}

/** Borra el proyecto local. Usado al reiniciar. */
export async function limpiarPersistencia(): Promise<void> {
  try {
    await db.proyectos.delete(ID_ACTIVO);
  } catch (error) {
    console.warn('No se pudo limpiar la persistencia:', error);
  }
}
