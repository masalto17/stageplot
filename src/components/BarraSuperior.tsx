import { useState } from 'react';
import {
  useProyecto,
  useTemporal,
  derivarCanales,
} from '@/store/proyecto';
import { compartir, abrirWhatsApp } from '@/lib/compartir';
import { UI, type Idioma } from '@/i18n/idioma';
import { ModalProyectos } from './ModalProyectos';

interface Props {
  lienzoRef: React.RefObject<HTMLElement | null>;
}

/**
 * Barra superior:
 *  - Toggle bilingue ES/EN (persiste en localStorage).
 *  - Nombre editable del proyecto activo.
 *  - Undo / Redo.
 *  - Proyectos: abre la biblioteca (lista guardada + nuevo + compartir link).
 *  - PDF y Compartir (Web Share con fallback WhatsApp) del proyecto activo.
 */
export function BarraSuperior({ lienzoRef }: Props) {
  const nombre = useProyecto((s) => s.proyecto.nombre);
  const renombrar = useProyecto((s) => s.renombrar);
  const idioma = useProyecto((s) => s.idioma);
  const setIdioma = useProyecto((s) => s.setIdioma);

  const undo = useTemporal((t) => t.undo);
  const redo = useTemporal((t) => t.redo);
  const puedeUndo = useTemporal((t) => t.pastStates.length > 0);
  const puedeRedo = useTemporal((t) => t.futureStates.length > 0);

  const [ocupado, setOcupado] = useState<null | 'pdf' | 'share'>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
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
            onClick={() => setModalAbierto(true)}
          >
            {t.proyectos}
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

      {modalAbierto && (
        <ModalProyectos idioma={idioma} onCerrar={() => setModalAbierto(false)} />
      )}
    </>
  );
}

function slugify(s: string): string {
  return (s || 'stageplot').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'stageplot';
}
