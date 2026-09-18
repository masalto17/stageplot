import { useRef, useState } from 'react';
import { useProyecto, type ResolucionGrilla } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';
import { importarImagen, PESO_MAX_KB } from '@/lib/imagenFondo';

/**
 * Barra flotante sobre el lienzo:
 *  - selector de grilla (off / fina / media / gruesa);
 *  - zoom in / reset / out;
 *  - importar imagen de fondo del venue;
 *  - control de opacidad del fondo cuando esta activo, con boton para quitar.
 *
 * El fondo se guarda dentro del proyecto (`proyecto.fondo`) y persiste con
 * Dexie: al volver a abrir la app el fondo esta ahi.
 */
export function ControlesLienzo() {
  const idioma = useProyecto((s) => s.idioma);
  const zoom = useProyecto((s) => s.zoom);
  const setZoom = useProyecto((s) => s.setZoom);
  const grilla = useProyecto((s) => s.grilla);
  const setGrilla = useProyecto((s) => s.setGrilla);
  const fondo = useProyecto((s) => s.proyecto.fondo);
  const setFondo = useProyecto((s) => s.setFondo);
  const setOpacidadFondo = useProyecto((s) => s.setOpacidadFondo);

  const inputArchivo = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const t = UI[idioma];

  const cambiarArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permitir re-importar el mismo archivo.
    if (!file) return;
    setError(null);
    setSubiendo(true);
    try {
      const { dataUrl, ancho, alto, pesoKb } = await importarImagen(file);
      if (pesoKb > PESO_MAX_KB) {
        setError(
          idioma === 'es'
            ? `Imagen pesada (${pesoKb} kB). Se cargo, pero puede lentificar la app.`
            : `Heavy image (${pesoKb} kB). Loaded, but the app may slow down.`,
        );
      }
      setFondo({ dataUrl, ancho, alto, opacidad: 0.4 });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubiendo(false);
    }
  };

  const OPCIONES_GRILLA: readonly { valor: ResolucionGrilla; etiqueta: string }[] = [
    { valor: 'off', etiqueta: idioma === 'es' ? 'Off' : 'Off' },
    { valor: 'fina', etiqueta: idioma === 'es' ? 'Fina' : 'Fine' },
    { valor: 'media', etiqueta: idioma === 'es' ? 'Media' : 'Medium' },
    { valor: 'gruesa', etiqueta: idioma === 'es' ? 'Gruesa' : 'Coarse' },
  ];

  return (
    <div className="ma-controles" role="toolbar" aria-label="Controles del lienzo">
      <div className="ma-controles__grupo">
        <span className="ma-controles__label">{t.grillaOn}</span>
        <select
          className="ma-controles__select"
          value={grilla}
          onChange={(e) => setGrilla(e.target.value as ResolucionGrilla)}
          aria-label={t.grillaOn}
        >
          {OPCIONES_GRILLA.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-controles__grupo">
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

      <div className="ma-controles__grupo">
        <input
          ref={inputArchivo}
          type="file"
          accept="image/*"
          onChange={cambiarArchivo}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className={`ma-controles__opc${fondo ? ' ma-controles__opc--activo' : ''}`}
          onClick={() => inputArchivo.current?.click()}
          disabled={subiendo}
          title={idioma === 'es' ? 'Importar fondo del venue' : 'Import venue background'}
        >
          {subiendo
            ? (idioma === 'es' ? 'Cargando...' : 'Loading...')
            : (idioma === 'es' ? 'Fondo' : 'Background')}
        </button>
        {fondo && (
          <>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(fondo.opacidad * 100)}
              onChange={(e) => setOpacidadFondo(Number(e.target.value) / 100)}
              className="ma-controles__slider"
              aria-label={idioma === 'es' ? 'Opacidad del fondo' : 'Background opacity'}
              title={`${Math.round(fondo.opacidad * 100)}%`}
            />
            <button
              type="button"
              className="ma-controles__opc"
              onClick={() => setFondo(null)}
              title={idioma === 'es' ? 'Quitar fondo' : 'Remove background'}
              aria-label={idioma === 'es' ? 'Quitar fondo' : 'Remove background'}
            >
              x
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="ma-controles__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
