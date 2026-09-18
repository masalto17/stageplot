import { useEffect, useRef, useState, type ReactElement } from 'react';
import interact from 'interactjs';
import { EQUIPOS_POR_ID } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import {
  useProyecto,
  LIENZO,
  ajustarAGrilla,
  PASO_GRILLA,
  type Instrumento,
  type ResolucionGrilla,
} from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

/**
 * Lienzo del stage plot.
 *
 * Ratio fijo 1000x625. Los instrumentos se posicionan en % del contenedor:
 * el mismo proyecto se ve identico en cualquier pantalla y el zoom del
 * contenedor los escala en bloque.
 *
 * Interaccion:
 *  - Click/tap sobre un instrumento lo selecciona (via `onClick`).
 *  - Drag lo mueve. interact.js delega en el contenedor (`context: raiz`),
 *    asi que NO se llama `stopPropagation` en el div del instrumento.
 *  - Al soltar (`end`) se ajusta a la grilla configurada si esta activa.
 *
 * Capas (de atras hacia adelante):
 *  1. Fondo importado por el usuario (imagen del venue).
 *  2. SVG con grilla, guias, wings y "FRENTE DEL ESCENARIO".
 *  3. Instrumentos.
 */
export function Lienzo() {
  const contenedor = useRef<HTMLDivElement>(null);
  const proyecto = useProyecto((s) => s.proyecto);
  const seleccionadoId = useProyecto((s) => s.seleccionadoId);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const mover = useProyecto((s) => s.moverInstrumento);
  const idioma = useProyecto((s) => s.idioma);
  const zoom = useProyecto((s) => s.zoom);
  const grilla = useProyecto((s) => s.grilla);

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;
    let arranco = false;

    const interactable = interact('.ma-lienzo__item', { context: raiz }).draggable({
      inertia: false,
      listeners: {
        start(event) {
          arranco = false;
          const id = (event.target as HTMLElement).dataset.id;
          if (id) seleccionar(id);
        },
        move(event) {
          const el = event.target as HTMLElement;
          const id = el.dataset.id;
          if (!id) return;
          arranco = true;
          setDragging(true);
          const escalaX = LIENZO.ancho / raiz.clientWidth;
          const escalaY = LIENZO.alto / raiz.clientHeight;
          const inst = useProyecto
            .getState()
            .proyecto.instrumentos.find((i) => i.id === id);
          if (!inst) return;
          mover(id, inst.x + event.dx * escalaX, inst.y + event.dy * escalaY);
        },
        end(event) {
          if (!arranco) {
            setDragging(false);
            return;
          }
          const id = (event.target as HTMLElement).dataset.id;
          if (!id) { setDragging(false); return; }
          const inst = useProyecto
            .getState()
            .proyecto.instrumentos.find((i) => i.id === id);
          if (inst) {
            const resolucion = useProyecto.getState().grilla;
            const x = ajustarAGrilla(inst.x, resolucion);
            const y = ajustarAGrilla(inst.y, resolucion);
            if (x !== inst.x || y !== inst.y) mover(id, x, y);
          }
          setTimeout(() => setDragging(false), 0);
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, [mover, seleccionar]);

  return (
    <div
      className="ma-lienzo-wrap"
      style={{ ['--zoom' as string]: zoom }}
    >
      <div
        ref={contenedor}
        className="ma-lienzo"
        role="application"
        aria-label="Lienzo del stage plot"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) seleccionar(null);
        }}
      >
        {proyecto.fondo && (
          <img
            className="ma-lienzo__fondo-imagen"
            src={proyecto.fondo.dataUrl}
            alt=""
            style={{ opacity: proyecto.fondo.opacidad }}
            draggable={false}
          />
        )}

        <FondoEscenario idioma={idioma} grilla={grilla} />

        {proyecto.instrumentos.map((inst) => (
          <InstrumentoLienzo
            key={inst.id}
            instrumento={inst}
            seleccionado={inst.id === seleccionadoId}
            idioma={idioma}
            onSeleccionar={() => {
              if (!dragging) seleccionar(inst.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Grilla de puntos + wings + guias + frente marcado. */
function FondoEscenario({ idioma, grilla }: { idioma: 'es' | 'en'; grilla: ResolucionGrilla }) {
  const paso = PASO_GRILLA[grilla];
  const dots: ReactElement[] = [];
  if (paso > 0) {
    // Los puntos son un indicio visual, no la resolucion real (que ya la
    // marca `PASO_GRILLA` en el snap). Un punto cada 4 pasos evita que el
    // lienzo se satura y deja los instrumentos como protagonistas.
    const step = Math.max(paso * 4, 20);
    for (let x = step; x < LIENZO.ancho; x += step) {
      for (let y = step; y < LIENZO.alto; y += step) {
        dots.push(
          <circle key={`${x}-${y}`} cx={x} cy={y} r={0.6} fill="rgba(0,0,0,0.18)" />,
        );
      }
    }
  }
  return (
    <svg
      className="ma-lienzo__fondo"
      viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect x={0} y={0} width={80} height={LIENZO.alto} fill="rgba(0,0,0,0.03)" />
      <rect x={LIENZO.ancho - 80} y={0} width={80} height={LIENZO.alto} fill="rgba(0,0,0,0.03)" />
      {dots}
      <line
        x1={LIENZO.ancho / 3} y1={0}
        x2={LIENZO.ancho / 3} y2={LIENZO.alto}
        stroke="rgba(0,0,0,0.06)" strokeWidth={1}
      />
      <line
        x1={(LIENZO.ancho * 2) / 3} y1={0}
        x2={(LIENZO.ancho * 2) / 3} y2={LIENZO.alto}
        stroke="rgba(0,0,0,0.06)" strokeWidth={1}
      />
      <line
        x1={40} y1={LIENZO.alto - 6}
        x2={LIENZO.ancho - 40} y2={LIENZO.alto - 6}
        stroke="var(--ma-rojo)" strokeWidth={3}
      />
      <text
        x={LIENZO.ancho / 2} y={LIENZO.alto - 18}
        fontFamily="Nunito Sans, sans-serif"
        fontSize={14}
        fontWeight={800}
        letterSpacing={2}
        fill="var(--ma-rojo)"
        textAnchor="middle"
      >
        {UI[idioma].frenteEscenario}
      </text>
    </svg>
  );
}

interface PropsInstrumento {
  instrumento: Instrumento;
  seleccionado: boolean;
  idioma: 'es' | 'en';
  onSeleccionar: () => void;
}

function InstrumentoLienzo({ instrumento, seleccionado, idioma, onSeleccionar }: PropsInstrumento) {
  const equipo = EQUIPOS_POR_ID.get(instrumento.equipoId);
  if (!equipo) return null;

  const izq = (instrumento.x / LIENZO.ancho) * 100;
  const arriba = (instrumento.y / LIENZO.alto) * 100;
  const etiqueta = instrumento.etiqueta || equipo.nombre[idioma];

  return (
    <div
      className={`ma-lienzo__item${seleccionado ? ' ma-lienzo__item--sel' : ''}`}
      data-id={instrumento.id}
      style={{
        left: `${izq}%`,
        top: `${arriba}%`,
        transform: `translate(-50%, -50%) rotate(${instrumento.rotacion}deg)`,
        touchAction: 'none',
      }}
      onClick={onSeleccionar}
      role="button"
      aria-label={etiqueta}
      tabIndex={0}
    >
      <IconoEquipo equipo={equipo} size={60} seleccionado={seleccionado} idioma={idioma} />
      <span className="ma-lienzo__etiqueta">{etiqueta}</span>
    </div>
  );
}
