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
  const [error, setError] = useState<string | null>(null);
  const t = UI[idioma];

  /**
   * html2canvas no mide un panel con `display: none` (tab Canales). Lo
   * estacionamos fuera de pantalla un instante para que el raster tenga
   * dimensiones reales y el PDF no salga en blanco.
   */
  const mostrarLienzoParaExport = () => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return null;
    const panel = lienzo.closest('.ma-editor__panel');
    if (!(panel instanceof HTMLElement)) return { lienzo, panel: null, oculto: false };
    const oculto = getComputedStyle(panel).display === 'none';
    if (oculto) {
      panel.dataset.exportando = '1';
      panel.style.display = 'block';
      panel.style.position = 'absolute';
      panel.style.left = '-10000px';
      panel.style.top = '0';
      const ancho = panel.parentElement?.clientWidth || 800;
      panel.style.width = `${ancho}px`;
    }
    return { lienzo, panel, oculto };
  };

  const restaurarLienzo = (ctx: ReturnType<typeof mostrarLienzoParaExport>) => {
    if (!ctx?.oculto || !ctx.panel) return;
    ctx.panel.style.display = 'none';
    ctx.panel.style.position = '';
    ctx.panel.style.left = '';
    ctx.panel.style.top = '';
    ctx.panel.style.width = '';
    delete ctx.panel.dataset.exportando;
  };

  const generar = async () => {
    const ctx = mostrarLienzoParaExport();
    if (!ctx) return null;
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const estado = useProyecto.getState();
      const canales = derivarCanales(estado.proyecto.instrumentos, estado.idioma);
      const { generarPdf } = await import('@/lib/exportarPdf');
      return await generarPdf({
        proyecto: estado.proyecto,
        canales,
        lienzo: ctx.lienzo as HTMLElement,
        idioma: estado.idioma,
      });
    } finally {
      restaurarLienzo(ctx);
    }
  };

  const exportar = async () => {
    setOcupado('pdf');
    setError(null);
    try {
      const blob = await generar();
      if (blob) {
        const { descargar } = await import('@/lib/exportarPdf');
        descargar(blob, nombre);
      } else {
        setError(t.pdfError);
      }
    } catch (e) {
      console.warn('PDF fallido:', e);
      setError(t.pdfError);
    } finally {
      setOcupado(null);
    }
  };

  const compartirPdf = async () => {
    setOcupado('share');
    setError(null);
    try {
      const blob = await generar();
      if (!blob) {
        setError(t.pdfError);
        return;
      }
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
    } catch (e) {
      console.warn('Compartir fallido:', e);
      setError(t.pdfError);
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
            aria-busy={ocupado === 'pdf'}
          >
            {ocupado === 'pdf' ? t.generando : t.pdf}
          </button>
          <button
            type="button"
            className="ma-boton"
            onClick={compartirPdf}
            disabled={ocupado !== null}
            aria-busy={ocupado === 'share'}
          >
            {ocupado === 'share' ? t.compartiendo : t.compartir}
          </button>
        </div>

        {error && (
          <p className="ma-barra__error" role="alert">
            {error}
          </p>
        )}
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
