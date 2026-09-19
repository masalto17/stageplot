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
 * Ratio fijo 1000x625. Los instrumentos se posicionan en % del contenedor: el
 * mismo proyecto se ve identico en cualquier pantalla y el zoom del contenedor
 * los escala en bloque.
 *
 * Interaccion:
 *  - Click sobre un instrumento lo selecciona. Con Shift o Cmd/Ctrl se agrega
 *    o quita de la seleccion.
 *  - Drag sobre un instrumento mueve TODOS los seleccionados con el mismo
 *    delta (multi-drag estilo Figma / Sketch).
 *  - Si el arrastrado NO estaba en la seleccion previa, la seleccion pasa a
 *    ser solo ese (comportamiento "empezar arrastre y descartar").
 *  - Al soltar, los instrumentos ajustan a la grilla configurada.
 *  - Durante el arrastre se dibujan lineas guia cuando el centro / los bordes
 *    del arrastrado se alinean con OTROS instrumentos (smart guides).
 *
 * Capas (atras -> adelante):
 *  1. Fondo importado por el usuario.
 *  2. SVG del escenario: wings, guias tercios, grilla, guias de alineacion,
 *     "FRENTE DEL ESCENARIO".
 *  3. Instrumentos.
 */

/** Umbral de snap para las guias, en unidades del viewBox. */
const UMBRAL_SNAP = 8;

interface GuiaAlineacion {
  eje: 'x' | 'y';
  valor: number;
}

export function Lienzo() {
  const contenedor = useRef<HTMLDivElement>(null);
  const proyecto = useProyecto((s) => s.proyecto);
  const seleccionadosIds = useProyecto((s) => s.seleccionadosIds);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const alternarSeleccion = useProyecto((s) => s.alternarSeleccion);
  const seleccionarVarios = useProyecto((s) => s.seleccionarVarios);
  const mover = useProyecto((s) => s.moverInstrumento);
  const idioma = useProyecto((s) => s.idioma);
  const zoom = useProyecto((s) => s.zoom);
  const grilla = useProyecto((s) => s.grilla);

  const [dragging, setDragging] = useState(false);
  const [guias, setGuias] = useState<GuiaAlineacion[]>([]);
  const seleccionEsRef = useRef<Set<string>>(new Set(seleccionadosIds));
  seleccionEsRef.current = new Set(seleccionadosIds);

  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;

    let arranco = false;
    let idsMovidos: string[] = [];
    // Posiciones al inicio del drag, para snap absoluto.
    let posicionesIniciales: Map<string, { x: number; y: number }> = new Map();
    let ancla: { x: number; y: number } | null = null;
    let dxAcum = 0;
    let dyAcum = 0;

    const interactable = interact('.ma-lienzo__item', { context: raiz }).draggable({
      inertia: false,
      listeners: {
        start(event) {
          arranco = false;
          const el = event.target as HTMLElement;
          const id = el.dataset.id;
          if (!id) return;

          const yaSel = seleccionEsRef.current;
          // Si el arrastrado no estaba seleccionado, pasa a ser el unico.
          // Si ya estaba, mantenemos toda la seleccion existente.
          if (!yaSel.has(id)) {
            seleccionar(id);
            idsMovidos = [id];
          } else {
            idsMovidos = [...yaSel];
          }
          // Fotografia de posiciones al inicio del drag.
          const estado = useProyecto.getState().proyecto.instrumentos;
          posicionesIniciales = new Map();
          for (const inst of estado) {
            if (idsMovidos.includes(inst.id)) {
              posicionesIniciales.set(inst.id, { x: inst.x, y: inst.y });
            }
          }
          const anclaInst = estado.find((i) => i.id === id);
          ancla = anclaInst ? { x: anclaInst.x, y: anclaInst.y } : null;
          dxAcum = 0;
          dyAcum = 0;
        },
        move(event) {
          const el = event.target as HTMLElement;
          const id = el.dataset.id;
          if (!id || !ancla) return;
          arranco = true;
          setDragging(true);

          const escalaX = LIENZO.ancho / raiz.clientWidth;
          const escalaY = LIENZO.alto / raiz.clientHeight;
          dxAcum += event.dx * escalaX;
          dyAcum += event.dy * escalaY;

          // Objetivos crudos para el ancla.
          let ancaX = ancla.x + dxAcum;
          let ancaY = ancla.y + dyAcum;

          // Snap por guias de alineacion: si el ancla esta cerca del centro
          // de otro instrumento en X o Y, se pega y se registra la guia.
          const otros = useProyecto
            .getState()
            .proyecto.instrumentos.filter((i) => !idsMovidos.includes(i.id));
          const guiasFrescas: GuiaAlineacion[] = [];

          let mejorX = { dist: UMBRAL_SNAP + 1, valor: ancaX };
          let mejorY = { dist: UMBRAL_SNAP + 1, valor: ancaY };
          for (const o of otros) {
            const dx = Math.abs(o.x - ancaX);
            const dy = Math.abs(o.y - ancaY);
            if (dx <= UMBRAL_SNAP && dx < mejorX.dist) mejorX = { dist: dx, valor: o.x };
            if (dy <= UMBRAL_SNAP && dy < mejorY.dist) mejorY = { dist: dy, valor: o.y };
          }
          if (mejorX.dist <= UMBRAL_SNAP) {
            ancaX = mejorX.valor;
            guiasFrescas.push({ eje: 'x', valor: mejorX.valor });
          }
          if (mejorY.dist <= UMBRAL_SNAP) {
            ancaY = mejorY.valor;
            guiasFrescas.push({ eje: 'y', valor: mejorY.valor });
          }
          setGuias(guiasFrescas);

          // Aplicamos el delta final a TODOS los seleccionados, preservando
          // sus offsets relativos.
          const dx = ancaX - ancla.x;
          const dy = ancaY - ancla.y;
          for (const iid of idsMovidos) {
            const p0 = posicionesIniciales.get(iid);
            if (!p0) continue;
            mover(iid, p0.x + dx, p0.y + dy);
          }
        },
        end() {
          setGuias([]);
          if (!arranco) {
            setDragging(false);
            return;
          }
          const resolucion = useProyecto.getState().grilla;
          for (const iid of idsMovidos) {
            const inst = useProyecto
              .getState()
              .proyecto.instrumentos.find((i) => i.id === iid);
            if (!inst) continue;
            const x = ajustarAGrilla(inst.x, resolucion);
            const y = ajustarAGrilla(inst.y, resolucion);
            if (x !== inst.x || y !== inst.y) mover(iid, x, y);
          }
          setTimeout(() => setDragging(false), 0);
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, [mover, seleccionar]);

  const enSel = new Set(seleccionadosIds);

  const abrirEnFondo: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) seleccionar(null);
  };

  return (
    <div className="ma-lienzo-wrap" style={{ ['--zoom' as string]: zoom }}>
      <div
        ref={contenedor}
        className="ma-lienzo"
        role="application"
        aria-label="Lienzo del stage plot"
        onPointerDown={abrirEnFondo}
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

        <FondoEscenario idioma={idioma} grilla={grilla} guias={guias} />

        {proyecto.instrumentos.map((inst) => (
          <InstrumentoLienzo
            key={inst.id}
            instrumento={inst}
            seleccionado={enSel.has(inst.id)}
            idioma={idioma}
            onClickInstrumento={(e) => {
              if (dragging) return;
              const multi = e.shiftKey || e.metaKey || e.ctrlKey;
              if (multi) {
                alternarSeleccion(inst.id);
              } else if (enSel.has(inst.id) && enSel.size > 1) {
                // Click simple sobre un item ya en un grupo lo deja solo a el.
                seleccionarVarios([inst.id]);
              } else {
                seleccionar(inst.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Grilla + wings + guias tercios + frente + guias smart de alineacion. */
function FondoEscenario({
  idioma,
  grilla,
  guias,
}: {
  idioma: 'es' | 'en';
  grilla: ResolucionGrilla;
  guias: GuiaAlineacion[];
}) {
  const paso = PASO_GRILLA[grilla];
  const dots: ReactElement[] = [];
  if (paso > 0) {
    const step = Math.max(paso * 4, 20);
    for (let x = step; x < LIENZO.ancho; x += step) {
      for (let y = step; y < LIENZO.alto; y += step) {
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={0.6} fill="rgba(0,0,0,0.18)" />);
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
      {/* Guias smart de alineacion. Rojo brillante, muy delgadas. */}
      {guias.map((g, i) =>
        g.eje === 'x' ? (
          <line
            key={i}
            x1={g.valor} y1={0}
            x2={g.valor} y2={LIENZO.alto}
            stroke="var(--ma-rojo)" strokeWidth={1.2}
            strokeDasharray="4 4"
          />
        ) : (
          <line
            key={i}
            x1={0} y1={g.valor}
            x2={LIENZO.ancho} y2={g.valor}
            stroke="var(--ma-rojo)" strokeWidth={1.2}
            strokeDasharray="4 4"
          />
        ),
      )}
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
  onClickInstrumento: (evento: React.MouseEvent) => void;
}

function InstrumentoLienzo({
  instrumento,
  seleccionado,
  idioma,
  onClickInstrumento,
}: PropsInstrumento) {
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
      onClick={onClickInstrumento}
      role="button"
      aria-label={etiqueta}
      tabIndex={0}
    >
      <IconoEquipo equipo={equipo} size={60} seleccionado={seleccionado} idioma={idioma} />
      <span className="ma-lienzo__etiqueta">{etiqueta}</span>
    </div>
  );
}
