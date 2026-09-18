import { useProyecto } from '@/store/proyecto';
import { EQUIPOS_POR_ID } from '@/icons/catalog';
import { UI } from '@/i18n/idioma';

/**
 * Panel de edicion del instrumento seleccionado. Se renderiza siempre; sin
 * seleccion muestra un tip breve para no dejar un hueco visual.
 */
export function PanelSeleccion() {
  const seleccionadoId = useProyecto((s) => s.seleccionadoId);
  const instrumento = useProyecto((s) =>
    s.proyecto.instrumentos.find((i) => i.id === s.seleccionadoId),
  );
  const idioma = useProyecto((s) => s.idioma);
  const rotar = useProyecto((s) => s.rotarInstrumento);
  const duplicar = useProyecto((s) => s.duplicarInstrumento);
  const etiquetar = useProyecto((s) => s.etiquetarInstrumento);
  const eliminar = useProyecto((s) => s.eliminarInstrumento);
  const traerAlFrente = useProyecto((s) => s.traerAlFrente);
  const enviarAlFondo = useProyecto((s) => s.enviarAlFondo);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const t = UI[idioma];

  if (!seleccionadoId || !instrumento) {
    return (
      <aside className="ma-panel-sel ma-panel-sel--vacio">
        <p>{t.seleccionarTip}</p>
      </aside>
    );
  }

  const equipo = EQUIPOS_POR_ID.get(instrumento.equipoId);
  if (!equipo) return null;
  const nombre = equipo.nombre[idioma];

  return (
    <aside className="ma-panel-sel">
      <header>
        <strong>{nombre}</strong>
        <button
          type="button"
          className="ma-boton-icono"
          onClick={() => seleccionar(null)}
          aria-label={t.cerrarPanel}
        >
          x
        </button>
      </header>

      <label className="ma-campo">
        <span>{t.etiqueta}</span>
        <input
          type="text"
          value={instrumento.etiqueta ?? ''}
          placeholder={nombre}
          onChange={(e) => etiquetar(instrumento.id, e.target.value)}
          maxLength={40}
        />
      </label>

      <div className="ma-panel-sel__acciones">
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => rotar(instrumento.id, -15)}
        >
          {t.girarIzquierda}
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => rotar(instrumento.id, 15)}
        >
          {t.girarDerecha}
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => duplicar(instrumento.id)}
          title="Cmd/Ctrl + D"
        >
          {t.duplicar}
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => traerAlFrente(instrumento.id)}
        >
          {t.alFrente}
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => enviarAlFondo(instrumento.id)}
        >
          {t.alFondo}
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario ma-boton--peligro"
          onClick={() => eliminar(instrumento.id)}
          title="Supr / Del"
        >
          {t.eliminar}
        </button>
      </div>
    </aside>
  );
}
