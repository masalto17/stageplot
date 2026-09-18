/**
 * Autoguardado local en IndexedDB via Dexie.
 *
 * v2: multi-proyecto.
 *  - Cada proyecto vive en la tabla `proyectos`, clave primaria = proyecto.id.
 *  - El id del proyecto activo se guarda en localStorage (`stageplot:activoId`).
 *  - Al arrancar, hidratamos el ultimo activo. Cada cambio en el store escribe
 *    al proyecto activo con debounce de 400 ms.
 *
 * Migracion desde v1:
 *  - v1 tenia un unico registro con id fijo "activo". La migracion mueve ese
 *    contenido al proyecto real (usa `proyecto.id` como clave) y setea
 *    `activoId` en localStorage.
 */
import Dexie, { type Table } from 'dexie';
import type { Proyecto } from './proyecto';
import { useProyecto } from './proyecto';

const CLAVE_ACTIVO = 'stageplot:activoId';

interface Registro {
  id: string;
  proyecto: Proyecto;
  guardado: number;
}

class BaseStagePlot extends Dexie {
  proyectos!: Table<Registro, string>;

  constructor() {
    super('masalto-stageplot');
    // v1: un solo registro con id fijo "activo".
    this.version(1).stores({ proyectos: 'id' });
    // v2: mismo schema pero convencion nueva de ids (id = proyecto.id).
    this.version(2)
      .stores({ proyectos: 'id, guardado' })
      .upgrade(async (tx) => {
        const tabla = tx.table<Registro>('proyectos');
        const viejo = await tabla.get('activo');
        if (viejo) {
          const nuevo: Registro = { ...viejo, id: viejo.proyecto.id };
          await tabla.put(nuevo);
          await tabla.delete('activo');
          try {
            localStorage.setItem(CLAVE_ACTIVO, nuevo.id);
          } catch { /* localStorage bloqueado */ }
        }
      });
  }
}

const db = new BaseStagePlot();

function activoIdGuardado(): string | null {
  try { return localStorage.getItem(CLAVE_ACTIVO); } catch { return null; }
}

function setActivoId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CLAVE_ACTIVO, id);
    else localStorage.removeItem(CLAVE_ACTIVO);
  } catch { /* no-op */ }
}

async function guardar(proyecto: Proyecto): Promise<void> {
  await db.proyectos.put({ id: proyecto.id, proyecto, guardado: Date.now() });
}

/**
 * Hidrata el store con el proyecto activo (o el ultimo modificado si no hay
 * uno marcado). Devuelve true si cargo algo.
 */
export async function hidratarProyecto(): Promise<boolean> {
  try {
    let registro: Registro | undefined;
    const id = activoIdGuardado();
    if (id) registro = await db.proyectos.get(id);
    if (!registro) {
      // Fallback: el mas reciente. Sirve tanto para la primera carga tras la
      // migracion v1->v2 como para navegadores que perdieron el localStorage.
      registro = await db.proyectos.orderBy('guardado').last();
    }
    if (registro) {
      useProyecto.getState().cargarProyecto(registro.proyecto);
      setActivoId(registro.proyecto.id);
      return true;
    }
  } catch (error) {
    console.warn('IndexedDB no disponible:', error);
  }
  return false;
}

/**
 * Suscribe el autoguardado. Devuelve el unsubscribe. Debounce de 400 ms para
 * no escribir a cada frame durante un drag continuo.
 */
export function iniciarAutoguardado(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Escribimos la foto inicial: sin esto, el primer proyecto de la sesion
  // (la plantilla banda al primer arranque) queda en memoria y no aparece
  // en la biblioteca hasta que el usuario haga alguna edicion.
  const primerProyecto = useProyecto.getState().proyecto;
  setActivoId(primerProyecto.id);
  guardar(primerProyecto).catch((e) => console.warn('Primer guardado fallo:', e));
  const desuscribir = useProyecto.subscribe((estado, anterior) => {
    if (estado.proyecto === anterior.proyecto) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const p = useProyecto.getState().proyecto;
      setActivoId(p.id);
      guardar(p).catch((error) =>
        console.warn('Fallo el autoguardado:', error),
      );
    }, 400);
  });
  return () => {
    if (timer) clearTimeout(timer);
    desuscribir();
  };
}

/**
 * Guarda el proyecto activo antes de cambiar. Sirve para el flujo "abrir otro
 * proyecto" sin perder lo que estaba editandose.
 */
export async function flushear(): Promise<void> {
  try {
    await guardar(useProyecto.getState().proyecto);
  } catch (error) {
    console.warn('Flush fallido:', error);
  }
}

export async function listarProyectos(): Promise<
  Array<{ id: string; nombre: string; modificado: number; instrumentos: number }>
> {
  try {
    const registros = await db.proyectos.orderBy('guardado').reverse().toArray();
    return registros.map((r) => ({
      id: r.id,
      nombre: r.proyecto.nombre,
      modificado: r.proyecto.modificado,
      instrumentos: r.proyecto.instrumentos.length,
    }));
  } catch {
    return [];
  }
}

export async function abrirProyecto(id: string): Promise<boolean> {
  try {
    // Antes de cambiar, aseguramos que lo actual quede grabado.
    await flushear();
    const registro = await db.proyectos.get(id);
    if (!registro) return false;
    useProyecto.getState().cargarProyecto(registro.proyecto);
    setActivoId(id);
    // Reset del historial temporal: hacer undo hacia el proyecto anterior
    // seria un pie roto para el usuario.
    useProyecto.temporal.getState().clear();
    return true;
  } catch (error) {
    console.warn('No se pudo abrir el proyecto:', error);
    return false;
  }
}

export async function guardarProyectoNuevo(proyecto: Proyecto): Promise<void> {
  await flushear();
  await guardar(proyecto);
  useProyecto.getState().cargarProyecto(proyecto);
  setActivoId(proyecto.id);
  useProyecto.temporal.getState().clear();
}

export async function borrarProyecto(id: string): Promise<void> {
  try {
    await db.proyectos.delete(id);
    // Si borramos el activo, hidratamos el mas reciente o dejamos vacio.
    if (activoIdGuardado() === id) {
      const registro = await db.proyectos.orderBy('guardado').last();
      if (registro) {
        useProyecto.getState().cargarProyecto(registro.proyecto);
        setActivoId(registro.proyecto.id);
      } else {
        setActivoId(null);
      }
      useProyecto.temporal.getState().clear();
    }
  } catch (error) {
    console.warn('No se pudo borrar:', error);
  }
}

export async function duplicarProyecto(id: string): Promise<string | null> {
  const registro = await db.proyectos.get(id);
  if (!registro) return null;
  const copia: Proyecto = {
    ...registro.proyecto,
    id: crypto.randomUUID(),
    nombre: registro.proyecto.nombre + ' (copia)',
    creado: Date.now(),
    modificado: Date.now(),
    instrumentos: registro.proyecto.instrumentos.map((i) => ({
      ...i,
      id: crypto.randomUUID(),
    })),
  };
  await guardar(copia);
  return copia.id;
}

/** Compat con el flujo v1 del boton "Nuevo" del modal. */
export async function limpiarPersistencia(): Promise<void> {
  try {
    await db.proyectos.clear();
    setActivoId(null);
  } catch (error) {
    console.warn('No se pudo limpiar la persistencia:', error);
  }
}
