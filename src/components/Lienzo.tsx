import { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import { EQUIPOS_POR_ID } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import {
  useProyecto,
  LIENZO,
  ajustarAGrilla,
  GRILLA,
  type Instrumento,
} from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

/**
 * Lienzo del stage plot.
 *
 * Ratio fijo 1000x625. El SVG de fondo mantiene proporciones via CSS. Los
 * instrumentos se posicionan en % del contenedor: el mismo proyecto se ve
 * identico en cualquier pantalla y el zoom del container los escala en bloque.
 *
 * Interaccion:
 *  - Un click/tap sobre un instrumento lo selecciona (via onClick del div, que
 *    no dispara si hubo movimiento del puntero).
 *  - Drag sobre un instrumento lo mueve. interact.js delega escuchando en el
 *    contenedor (`context: raiz`), asi que NO hay que llamar stopPropagation
 *    en el div del instrumento - eso mataba la delegacion en la version B2.
 *  - Al soltar (`end`) se ajusta a la grilla si el modo esta activo.
 */
export function Lienzo() {
  const contenedor = useRef<HTMLDivElement>(null);
  const proyecto = useProyecto((s) => s.proyecto);
  const seleccionadoId = useProyecto((s) => s.seleccionadoId);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const mover = useProyecto((s) => s.moverInstrumento);
  const idioma = useProyecto((s) => s.idioma);

  const zoom = useProyecto((s) => s.zoom);

  // Estado local por drag: bandera que evita seleccionar al final del drag
  // (el click sintetico despues del pointerup, si no lo suprimimos, salta).
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
          // px del contenedor -> unidades de viewBox.
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
            const grilla = useProyecto.getState().ajusteGrilla;
            const x = ajustarAGrilla(inst.x, grilla);
            const y = ajustarAGrilla(inst.y, grilla);
            if (x !== inst.x || y !== inst.y) mover(id, x, y);
          }
          // Damos un tick antes de bajar la bandera para que el click sintetico
          // que sigue al pointerup no dispare seleccionar por accidente.
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
        <FondoEscenario idioma={idioma} />

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

/** Fondo del escenario: grilla suave, guias, wings y frente marcado. */
function FondoEscenario({ idioma }: { idioma: 'es' | 'en' }) {
  const activo = useProyecto((s) => s.ajusteGrilla);
  const dots = [];
  if (activo) {
    for (let x = GRILLA; x < LIENZO.ancho; x += GRILLA * 2) {
      for (let y = GRILLA; y < LIENZO.alto; y += GRILLA * 2) {
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={0.6} fill="rgba(0,0,0,0.16)" />);
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
      {/* Wings (laterales) suaves. */}
      <rect x={0} y={0} width={80} height={LIENZO.alto} fill="rgba(0,0,0,0.03)" />
      <rect x={LIENZO.ancho - 80} y={0} width={80} height={LIENZO.alto} fill="rgba(0,0,0,0.03)" />
      {/* Grilla de puntos si el modo esta activo. */}
      {dots}
      {/* Guias tercios. */}
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
      {/* Frente del escenario. */}
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
