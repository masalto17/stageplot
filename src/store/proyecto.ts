/**
 * Store del proyecto (Zustand + zundo).
 *
 * Modelo de dominio:
 *
 *  - Un "proyecto" es un stage plot: nombre, escenario y lista de instrumentos.
 *  - Un "instrumento" es una instancia de un `Equipo` del catalogo, ubicada
 *    en el lienzo. La lista de canales se DERIVA a partir de los instrumentos
 *    presentes; no se persiste aparte.
 *
 * Coordenadas del lienzo:
 *
 *  - `x` e `y` estan en el sistema del `viewBox` del lienzo, 0-1000 x 0-625.
 *  - Se persisten esos numeros y se re-escalan por CSS al renderizar. Asi el
 *    plan es portable entre pantallas y no depende del tamano del contenedor.
 *
 * Undo/redo (zundo):
 *
 *  - Solo se trackea `instrumentos` y `nombre`. La seleccion visual no entra al
 *    historial: hacer undo no cambia que icono esta seleccionado.
 *  - Limite de 100 pasos. Un rider real no llega ni cerca.
 */
import { create } from 'zustand';
import { temporal } from 'zundo';
import type { TemporalState } from 'zundo';
import { useStore } from 'zustand';
import { EQUIPOS_POR_ID, type CanalPlantilla } from '@/icons/catalog';
import type { Idioma } from '@/i18n/idioma';
import { idiomaInicial, guardarIdioma } from '@/i18n/idioma';

export interface Instrumento {
  /** id de instancia (uuid). No confundir con `equipoId` del catalogo. */
  id: string;
  equipoId: string;
  x: number;
  y: number;
  /** Rotacion en grados. 0 = orientacion base del icono. */
  rotacion: number;
  /** Nombre custom que sobreescribe al del catalogo. Opcional. */
  etiqueta?: string;
}

/**
 * Imagen de fondo del venue (plano, foto de la sala, boceto). Se guarda
 * embebida como dataURL para simplificar la persistencia y viajar con el
 * proyecto. La compresion la hace `importarImagen()` antes de llegar aca.
 */
export interface Fondo {
  dataUrl: string;
  ancho: number;
  alto: number;
  /** 0.05 - 1. Un plano tecnico se ve mejor bajito (~0.35). */
  opacidad: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  creado: number;
  modificado: number;
  instrumentos: Instrumento[];
  fondo?: Fondo;
}

/** Dimensiones del lienzo en unidades internas. */
export const LIENZO = { ancho: 1000, alto: 625 } as const;

/** Resolucion de la grilla de ajuste (en unidades del viewBox). */
export type ResolucionGrilla = 'off' | 'fina' | 'media' | 'gruesa';
export const PASO_GRILLA: Record<ResolucionGrilla, number> = {
  off: 0,
  fina: 5,
  media: 10,
  gruesa: 25,
};

interface EstadoUI {
  seleccionadoId: string | null;
  idioma: Idioma;
  grilla: ResolucionGrilla;
  /** Zoom del lienzo (1 = 100%). */
  zoom: number;
}

export interface EstadoProyecto extends EstadoUI {
  proyecto: Proyecto;
  agregarInstrumento: (equipoId: string, x: number, y: number) => string;
  moverInstrumento: (id: string, x: number, y: number) => void;
  rotarInstrumento: (id: string, delta: number) => void;
  etiquetarInstrumento: (id: string, etiqueta: string) => void;
  duplicarInstrumento: (id: string) => string | null;
  eliminarInstrumento: (id: string) => void;
  traerAlFrente: (id: string) => void;
  enviarAlFondo: (id: string) => void;
  seleccionar: (id: string | null) => void;
  cargarProyecto: (proyecto: Proyecto) => void;
  renombrar: (nombre: string) => void;
  reiniciar: () => void;
  setIdioma: (idioma: Idioma) => void;
  setGrilla: (v: ResolucionGrilla) => void;
  setZoom: (v: number) => void;
  setFondo: (fondo: Fondo | null) => void;
  setOpacidadFondo: (opacidad: number) => void;
}

export function ajustarAGrilla(v: number, resolucion: ResolucionGrilla): number {
  const paso = PASO_GRILLA[resolucion];
  return paso > 0 ? Math.round(v / paso) * paso : v;
}

/** id estable para instrumentos. `crypto.randomUUID` esta en toda navegador PWA. */
function nuevoId(): string {
  return crypto.randomUUID();
}

/** Trunca el punto al viewBox para que un drag afuera no lo pierda. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function proyectoVacio(): Proyecto {
  const ahora = Date.now();
  return {
    id: nuevoId(),
    nombre: 'Sin titulo',
    creado: ahora,
    modificado: ahora,
    instrumentos: [],
  };
}

export const useProyecto = create<EstadoProyecto>()(
  temporal(
    (set) => ({
      proyecto: proyectoVacio(),
      seleccionadoId: null,
      idioma: typeof window === 'undefined' ? 'es' : idiomaInicial(),
      grilla: 'media',
      zoom: 1,

      agregarInstrumento(equipoId, x, y) {
        // Falla temprano: un id de equipo caido es un bug, no dato de usuario.
        if (!EQUIPOS_POR_ID.has(equipoId)) {
          throw new Error(`Equipo desconocido: ${equipoId}`);
        }
        const id = nuevoId();
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            modificado: Date.now(),
            instrumentos: [
              ...s.proyecto.instrumentos,
              {
                id,
                equipoId,
                x: clamp(x, 0, LIENZO.ancho),
                y: clamp(y, 0, LIENZO.alto),
                rotacion: 0,
              },
            ],
          },
          seleccionadoId: id,
        }));
        return id;
      },

      moverInstrumento(id, x, y) {
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            modificado: Date.now(),
            instrumentos: s.proyecto.instrumentos.map((i) =>
              i.id === id
                ? { ...i, x: clamp(x, 0, LIENZO.ancho), y: clamp(y, 0, LIENZO.alto) }
                : i,
            ),
          },
        }));
      },

      rotarInstrumento(id, delta) {
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            modificado: Date.now(),
            instrumentos: s.proyecto.instrumentos.map((i) =>
              i.id === id ? { ...i, rotacion: (i.rotacion + delta) % 360 } : i,
            ),
          },
        }));
      },

      duplicarInstrumento(id) {
        const s = useProyecto.getState();
        const src = s.proyecto.instrumentos.find((i) => i.id === id);
        if (!src) return null;
        // Offset chico para que no quede tapado por el original.
        const nid = nuevoId();
        set((state) => ({
          proyecto: {
            ...state.proyecto,
            modificado: Date.now(),
            instrumentos: [
              ...state.proyecto.instrumentos,
              {
                ...src,
                id: nid,
                x: clamp(src.x + 40, 0, LIENZO.ancho),
                y: clamp(src.y + 40, 0, LIENZO.alto),
              },
            ],
          },
          seleccionadoId: nid,
        }));
        return nid;
      },

      etiquetarInstrumento(id, etiqueta) {
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            modificado: Date.now(),
            instrumentos: s.proyecto.instrumentos.map((i) =>
              i.id === id ? { ...i, etiqueta: etiqueta || undefined } : i,
            ),
          },
        }));
      },

      eliminarInstrumento(id) {
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            modificado: Date.now(),
            instrumentos: s.proyecto.instrumentos.filter((i) => i.id !== id),
          },
          seleccionadoId: s.seleccionadoId === id ? null : s.seleccionadoId,
        }));
      },

      traerAlFrente(id) {
        set((state) => {
          const inst = state.proyecto.instrumentos.find((i) => i.id === id);
          if (!inst) return state;
          return {
            proyecto: {
              ...state.proyecto,
              modificado: Date.now(),
              instrumentos: [
                ...state.proyecto.instrumentos.filter((i) => i.id !== id),
                inst,
              ],
            },
          };
        });
      },

      enviarAlFondo(id) {
        set((state) => {
          const inst = state.proyecto.instrumentos.find((i) => i.id === id);
          if (!inst) return state;
          return {
            proyecto: {
              ...state.proyecto,
              modificado: Date.now(),
              instrumentos: [
                inst,
                ...state.proyecto.instrumentos.filter((i) => i.id !== id),
              ],
            },
          };
        });
      },

      seleccionar(id) {
        set({ seleccionadoId: id });
      },

      cargarProyecto(proyecto) {
        set({ proyecto, seleccionadoId: null });
      },

      renombrar(nombre) {
        set((s) => ({
          proyecto: { ...s.proyecto, nombre, modificado: Date.now() },
        }));
      },

      reiniciar() {
        set({ proyecto: proyectoVacio(), seleccionadoId: null });
      },

      setIdioma(idioma) {
        guardarIdioma(idioma);
        set({ idioma });
      },

      setGrilla(v) {
        set({ grilla: v });
      },

      setZoom(v) {
        // Clamp del zoom: 40% - 200%.
        set({ zoom: Math.max(0.4, Math.min(2, v)) });
      },

      setFondo(fondo) {
        set((s) => ({
          proyecto: {
            ...s.proyecto,
            fondo: fondo ?? undefined,
            modificado: Date.now(),
          },
        }));
      },

      setOpacidadFondo(opacidad) {
        set((s) => {
          if (!s.proyecto.fondo) return s;
          return {
            proyecto: {
              ...s.proyecto,
              fondo: {
                ...s.proyecto.fondo,
                opacidad: Math.max(0.05, Math.min(1, opacidad)),
              },
              modificado: Date.now(),
            },
          };
        });
      },
    }),
    {
      // Undo solo del proyecto: la seleccion es UI transitoria.
      partialize: (estado) => ({ proyecto: estado.proyecto }),
      limit: 100,
      // Colapsar ediciones seguidas del mismo drag en un solo paso de undo.
      handleSet: (handleSet) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        return (estado) => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => handleSet(estado), 200);
        };
      },
    },
  ),
);

/** Hook para consumir el store temporal de zundo. */
export function useTemporal<T>(
  selector: (state: TemporalState<{ proyecto: Proyecto }>) => T,
): T {
  return useStore(useProyecto.temporal, selector);
}

/**
 * Deriva la lista de canales del proyecto:
 *  - Se recorre `instrumentos` en el orden en que estan en el store.
 *  - Cada instrumento aporta sus canales del catalogo.
 *  - La etiqueta del canal se prefija con la etiqueta manual del instrumento
 *    cuando existe (por ej. "Kick 1", "Kick 2").
 */
export interface CanalDerivado {
  numero: number;
  nombre: string;
  senal: CanalPlantilla['senal'];
  phantom: boolean;
  /** id del instrumento del que salio, para saltar al lienzo desde la tabla. */
  instrumentoId: string;
}

export function derivarCanales(
  instrumentos: readonly Instrumento[],
  idioma: Idioma = 'es',
): CanalDerivado[] {
  const canales: CanalDerivado[] = [];
  for (const inst of instrumentos) {
    const equipo = EQUIPOS_POR_ID.get(inst.equipoId);
    if (!equipo) continue;
    // Equipo con un solo canal + etiqueta manual: la etiqueta reemplaza al
    // nombre por defecto ("Cantante" en vez de "Cantante Voz"). Con varios
    // canales, la etiqueta prefija ("Kbd L", "Kbd R" -> "Rhodes L", "Rhodes R").
    const soloUno = equipo.canales.length === 1;
    for (const canal of equipo.canales) {
      const nombreBase = canal.nombre[idioma];
      let nombre = nombreBase;
      if (inst.etiqueta) {
        nombre = soloUno ? inst.etiqueta : `${inst.etiqueta} ${nombreBase}`;
      }
      canales.push({
        numero: canales.length + 1,
        nombre,
        senal: canal.senal,
        phantom: canal.phantom ?? false,
        instrumentoId: inst.id,
      });
    }
  }
  return canales;
}
