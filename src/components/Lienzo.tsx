import { useEffect, useRef } from 'react';
import interact from 'interactjs';
import { EQUIPOS_POR_ID } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import {
  useProyecto,
  LIENZO,
  type Instrumento,
} from '@/store/proyecto';

/**
 * Lienzo del stage plot.
 *
 * Ratio fijo 1000x625. El SVG de fondo mantiene proporciones via CSS. Los
 * instrumentos se posicionan en % del contenedor (que a su vez respeta el
 * aspect-ratio), asi el mismo proyecto se ve identico en cualquier pantalla.
 *
 * interact.js maneja el drag. Convertimos deltas de pixeles a unidades del
 * viewBox multiplicando por la escala actual del contenedor.
 */
export function Lienzo() {
  const contenedor = useRef<HTMLDivElement>(null);
  const proyecto = useProyecto((s) => s.proyecto);
  const seleccionadoId = useProyecto((s) => s.seleccionadoId);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const mover = useProyecto((s) => s.moverInstrumento);

  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;

    const interactable = interact('.ma-lienzo__item', { context: raiz }).draggable({
      inertia: false,
      listeners: {
        start(event) {
          const id = (event.target as HTMLElement).dataset.id;
          if (id) seleccionar(id);
        },
        move(event) {
          const el = event.target as HTMLElement;
          const id = el.dataset.id;
          if (!id) return;
          // px del contenedor -> unidades de viewBox (1000 de ancho).
          const escalaX = LIENZO.ancho / raiz.clientWidth;
          const escalaY = LIENZO.alto / raiz.clientHeight;
          const inst = useProyecto
            .getState()
            .proyecto.instrumentos.find((i) => i.id === id);
          if (!inst) return;
          mover(id, inst.x + event.dx * escalaX, inst.y + event.dy * escalaY);
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, [mover, seleccionar]);

  return (
    <div
      ref={contenedor}
      className="ma-lienzo"
      role="application"
      aria-label="Lienzo del stage plot"
      onPointerDown={(e) => {
        // Click en el fondo deselecciona.
        if (e.target === e.currentTarget) seleccionar(null);
      }}
    >
      <FondoEscenario />

      {proyecto.instrumentos.map((inst) => (
        <InstrumentoLienzo
          key={inst.id}
          instrumento={inst}
          seleccionado={inst.id === seleccionadoId}
          onSeleccionar={() => seleccionar(inst.id)}
        />
      ))}
    </div>
  );
}

/** SVG de fondo: linea de borde de escenario y guias suaves. */
function FondoEscenario() {
  return (
    <svg
      className="ma-lienzo__fondo"
      viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Guias tercios. */}
      <line
        x1={LIENZO.ancho / 3} y1={0}
        x2={LIENZO.ancho / 3} y2={LIENZO.alto}
        stroke="rgba(0,0,0,0.05)" strokeWidth={1}
      />
      <line
        x1={(LIENZO.ancho * 2) / 3} y1={0}
        x2={(LIENZO.ancho * 2) / 3} y2={LIENZO.alto}
        stroke="rgba(0,0,0,0.05)" strokeWidth={1}
      />
      {/* Frente del escenario. */}
      <line
        x1={0} y1={LIENZO.alto - 4}
        x2={LIENZO.ancho} y2={LIENZO.alto - 4}
        stroke="var(--ma-rojo)" strokeWidth={3}
      />
      <text
        x={LIENZO.ancho / 2} y={LIENZO.alto - 14}
        fontFamily="Nunito Sans, sans-serif"
        fontSize={16}
        fontWeight={700}
        fill="var(--ma-rojo)"
        textAnchor="middle"
      >
        FRENTE DEL ESCENARIO
      </text>
    </svg>
  );
}

interface PropsInstrumento {
  instrumento: Instrumento;
  seleccionado: boolean;
  onSeleccionar: () => void;
}

function InstrumentoLienzo({ instrumento, seleccionado, onSeleccionar }: PropsInstrumento) {
  const equipo = EQUIPOS_POR_ID.get(instrumento.equipoId);
  if (!equipo) return null;

  const izq = (instrumento.x / LIENZO.ancho) * 100;
  const arriba = (instrumento.y / LIENZO.alto) * 100;
  const etiqueta = instrumento.etiqueta || equipo.nombre;

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
      onPointerDown={(e) => {
        e.stopPropagation();
        onSeleccionar();
      }}
      role="button"
      aria-label={etiqueta}
      tabIndex={0}
    >
      <IconoEquipo equipo={equipo} size={56} seleccionado={seleccionado} />
      <span className="ma-lienzo__etiqueta">{etiqueta}</span>
    </div>
  );
}
