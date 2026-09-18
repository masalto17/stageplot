import { useState } from 'react';
import {
  useProyecto,
  useTemporal,
  derivarCanales,
  type Proyecto,
} from '@/store/proyecto';
import { compartir, abrirWhatsApp } from '@/lib/compartir';
import { limpiarPersistencia } from '@/store/persistencia';
import { plantillaBanda, plantillaPorSlug, SLUGS_PLANTILLA } from '@/lib/plantilla';
import { UI, type Idioma } from '@/i18n/idioma';

interface Props {
  lienzoRef: React.RefObject<HTMLElement | null>;
}

/**
 * Barra superior:
 *  - Toggle bilingue ES/EN (persiste en localStorage).
 *  - Nombre editable del proyecto.
 *  - Undo / Redo.
 *  - Nuevo: abre modal para elegir en blanco o una plantilla (el bug B3 era
 *    que "Nuevo" cargaba siempre la plantilla banda; ahora es una eleccion
 *    explicita, con vacio como opcion natural).
 *  - PDF (descarga) y Compartir (Web Share con fallback WhatsApp).
 */
export function BarraSuperior({ lienzoRef }: Props) {
  const nombre = useProyecto((s) => s.proyecto.nombre);
  const renombrar = useProyecto((s) => s.renombrar);
  const cargar = useProyecto((s) => s.cargarProyecto);
  const reiniciar = useProyecto((s) => s.reiniciar);
  const idioma = useProyecto((s) => s.idioma);
  const setIdioma = useProyecto((s) => s.setIdioma);

  const undo = useTemporal((t) => t.undo);
  const redo = useTemporal((t) => t.redo);
  const puedeUndo = useTemporal((t) => t.pastStates.length > 0);
  const puedeRedo = useTemporal((t) => t.futureStates.length > 0);

  const [ocupado, setOcupado] = useState<null | 'pdf' | 'share'>(null);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const t = UI[idioma];

  const generar = async () => {
    if (!lienzoRef.current) return null;
    const estado = useProyecto.getState();
    const canales = derivarCanales(estado.proyecto.instrumentos, estado.idioma);
    const { generarPdf } = await import('@/lib/exportarPdf');
    return generarPdf({
      proyecto: estado.proyecto,
      canales,
      lienzo: lienzoRef.current as HTMLElement,
      idioma: estado.idioma,
    });
  };

  const exportar = async () => {
    setOcupado('pdf');
    try {
      const blob = await generar();
      if (blob) {
        const { descargar } = await import('@/lib/exportarPdf');
        descargar(blob, nombre);
      }
    } finally {
      setOcupado(null);
    }
  };

  const compartirPdf = async () => {
    setOcupado('share');
    try {
      const blob = await generar();
      if (!blob) return;
      const archivo = new File([blob], `${slugify(nombre)}.pdf`, {
        type: 'application/pdf',
      });
      const texto = `Stage plot: ${nombre}`;
      const res = await compartir({ archivo, titulo: nombre, texto });
      if (res.tipo === 'sin-soporte') {
        const { descargar } = await import('@/lib/exportarPdf');
        descargar(blob, nombre);
        abrirWhatsApp(`${texto}`);
      }
    } finally {
      setOcupado(null);
    }
  };

  const empezarNuevo = async (proyecto: Proyecto | null) => {
    await limpiarPersistencia();
    if (proyecto) cargar(proyecto);
    else reiniciar();
    setNuevoAbierto(false);
  };

  return (
    <>
      <div className="ma-barra">
        <input
          type="text"
          value={nombre}
          onChange={(e) => renombrar(e.target.value)}
          className="ma-barra__nombre"
          aria-label={t.nombreProyecto}
          maxLength={80}
        />

        <div className="ma-barra__acciones">
          <div className="ma-idioma" role="group" aria-label="Idioma">
            {(['es', 'en'] as Idioma[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`ma-idioma__opc${idioma === l ? ' ma-idioma__opc--activo' : ''}`}
                onClick={() => setIdioma(l)}
                aria-pressed={idioma === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => undo()}
            disabled={!puedeUndo}
            title="Cmd/Ctrl + Z"
          >
            {t.deshacer}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => redo()}
            disabled={!puedeRedo}
            title="Shift + Cmd/Ctrl + Z"
          >
            {t.rehacer}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => setNuevoAbierto(true)}
          >
            {t.nuevo}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={exportar}
            disabled={ocupado !== null}
          >
            {ocupado === 'pdf' ? t.generando : t.pdf}
          </button>
          <button
            type="button"
            className="ma-boton"
            onClick={compartirPdf}
            disabled={ocupado !== null}
          >
            {ocupado === 'share' ? t.compartiendo : t.compartir}
          </button>
        </div>
      </div>

      {nuevoAbierto && (
        <ModalNuevo
          idioma={idioma}
          onCerrar={() => setNuevoAbierto(false)}
          onElegir={empezarNuevo}
        />
      )}
    </>
  );
}

function slugify(s: string): string {
  return (s || 'stageplot').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'stageplot';
}

const NOMBRES_PLANTILLA: Record<string, { es: string; en: string }> = {
  rock: { es: 'Banda de rock', en: 'Rock band' },
  solista: { es: 'Solista con guitarra', en: 'Solo w/ guitar' },
  dj: { es: 'Set de DJ', en: 'DJ set' },
  folklore: { es: 'Folklore', en: 'Folk' },
};

interface PropsModal {
  idioma: Idioma;
  onCerrar: () => void;
  onElegir: (p: Proyecto | null) => void;
}

/**
 * Modal "Nuevo": lienzo vacio o una de las plantillas por genero. Antes,
 * "Nuevo" cargaba silenciosamente la plantilla banda (bug: quedaba igual).
 */
function ModalNuevo({ idioma, onCerrar, onElegir }: PropsModal) {
  const t = UI[idioma];
  return (
    <div
      className="ma-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t.nuevoTitulo}
      onClick={onCerrar}
    >
      <div className="ma-modal__caja" onClick={(e) => e.stopPropagation()}>
        <h2>{t.nuevoTitulo}</h2>
        <div className="ma-modal__opciones">
          <button
            type="button"
            className="ma-modal__opc"
            onClick={() => onElegir(null)}
          >
            <strong>{t.nuevoVacio}</strong>
            <span>{t.nuevoDescripcionVacio}</span>
          </button>
          {SLUGS_PLANTILLA.map((slug) => {
            const proyecto = slug === 'rock' ? plantillaBanda() : plantillaPorSlug(slug);
            if (!proyecto) return null;
            const nombres = NOMBRES_PLANTILLA[slug] ?? { es: slug, en: slug };
            return (
              <button
                key={slug}
                type="button"
                className="ma-modal__opc"
                onClick={() => onElegir(proyecto)}
              >
                <strong>{nombres[idioma]}</strong>
                <span>{proyecto.instrumentos.length} equipos</span>
              </button>
            );
          })}
        </div>
        <div className="ma-modal__acciones">
          <button type="button" className="ma-boton ma-boton--secundario" onClick={onCerrar}>
            {t.cancelar}
          </button>
        </div>
      </div>
    </div>
  );
}
