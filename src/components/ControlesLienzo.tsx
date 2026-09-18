import { useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

/**
 * Barra flotante sobre el lienzo: zoom in/out/reset y toggle de grilla.
 * Se ubica pegada al borde superior derecho del panel del lienzo.
 */
export function ControlesLienzo() {
  const idioma = useProyecto((s) => s.idioma);
  const zoom = useProyecto((s) => s.zoom);
  const setZoom = useProyecto((s) => s.setZoom);
  const grilla = useProyecto((s) => s.ajusteGrilla);
  const setGrilla = useProyecto((s) => s.setAjusteGrilla);
  const t = UI[idioma];

  return (
    <div className="ma-controles" role="toolbar" aria-label="Controles del lienzo">
      <button
        type="button"
        className={`ma-controles__opc${grilla ? ' ma-controles__opc--activo' : ''}`}
        onClick={() => setGrilla(!grilla)}
        aria-pressed={grilla}
        title={grilla ? t.grillaOn : t.grillaOff}
      >
        {grilla ? '#' : '#'}
      </button>
      <div className="ma-controles__zoom">
        <button
          type="button"
          className="ma-controles__opc"
          onClick={() => setZoom(zoom - 0.1)}
          aria-label={t.zoomOut}
          title={t.zoomOut}
        >
          -
        </button>
        <button
          type="button"
          className="ma-controles__opc ma-controles__opc--reset"
          onClick={() => setZoom(1)}
          title={t.zoomReset}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="ma-controles__opc"
          onClick={() => setZoom(zoom + 0.1)}
          aria-label={t.zoomIn}
          title={t.zoomIn}
        >
          +
        </button>
      </div>
    </div>
  );
}
