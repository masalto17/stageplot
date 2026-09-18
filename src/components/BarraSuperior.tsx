import { useState } from 'react';
import { useProyecto, useTemporal, derivarCanales } from '@/store/proyecto';
// jsPDF + html2canvas se cargan dinamicamente al primer export: ~600kB
// que no queremos en el bundle inicial del editor.
import { compartir, abrirWhatsApp } from '@/lib/compartir';
import { limpiarPersistencia } from '@/store/persistencia';
import { plantillaBanda } from '@/lib/plantilla';

/**
 * Barra superior: nombre editable, undo/redo, exportar, compartir, reiniciar.
 * Todo lo destructivo pide confirmacion.
 */
export function BarraSuperior({ lienzoRef }: { lienzoRef: React.RefObject<HTMLElement | null> }) {
  const nombre = useProyecto((s) => s.proyecto.nombre);
  const renombrar = useProyecto((s) => s.renombrar);
  const cargar = useProyecto((s) => s.cargarProyecto);

  const undo = useTemporal((t) => t.undo);
  const redo = useTemporal((t) => t.redo);
  const puedeUndo = useTemporal((t) => t.pastStates.length > 0);
  const puedeRedo = useTemporal((t) => t.futureStates.length > 0);

  const [ocupado, setOcupado] = useState<null | 'pdf' | 'share'>(null);

  const generar = async () => {
    if (!lienzoRef.current) return null;
    const estado = useProyecto.getState();
    const canales = derivarCanales(estado.proyecto.instrumentos);
    const { generarPdf } = await import('@/lib/exportarPdf');
    return generarPdf({
      proyecto: estado.proyecto,
      canales,
      lienzo: lienzoRef.current as HTMLElement,
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
        // Fallback: bajamos el PDF y abrimos WhatsApp con el nombre.
        const { descargar } = await import('@/lib/exportarPdf');
        descargar(blob, nombre);
        abrirWhatsApp(`${texto} - adjunto el PDF.`);
      }
    } finally {
      setOcupado(null);
    }
  };

  const reiniciar = async () => {
    if (!confirm('Se va a borrar el proyecto actual. Seguro?')) return;
    await limpiarPersistencia();
    cargar(plantillaBanda());
  };

  return (
    <div className="ma-barra">
      <input
        type="text"
        value={nombre}
        onChange={(e) => renombrar(e.target.value)}
        className="ma-barra__nombre"
        aria-label="Nombre del proyecto"
        maxLength={80}
      />
      <div className="ma-barra__acciones">
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => undo()}
          disabled={!puedeUndo}
        >
          Deshacer
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => redo()}
          disabled={!puedeRedo}
        >
          Rehacer
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={reiniciar}
        >
          Nuevo
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={exportar}
          disabled={ocupado !== null}
        >
          {ocupado === 'pdf' ? 'Generando...' : 'PDF'}
        </button>
        <button
          type="button"
          className="ma-boton"
          onClick={compartirPdf}
          disabled={ocupado !== null}
        >
          {ocupado === 'share' ? 'Compartiendo...' : 'Compartir'}
        </button>
      </div>
    </div>
  );
}

function slugify(s: string): string {
  return (s || 'stageplot').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'stageplot';
}
