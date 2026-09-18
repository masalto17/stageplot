import { useProyecto } from '@/store/proyecto';
import { EQUIPOS_POR_ID } from '@/icons/catalog';

/**
 * Panel de edicion del instrumento seleccionado: etiqueta, rotacion, borrar.
 * Se renderiza siempre; oculto sin seleccion para reservar el layout (evita
 * salto al hacer click en un icono).
 */
export function PanelSeleccion() {
  const seleccionadoId = useProyecto((s) => s.seleccionadoId);
  const instrumento = useProyecto((s) =>
    s.proyecto.instrumentos.find((i) => i.id === s.seleccionadoId),
  );
  const rotar = useProyecto((s) => s.rotarInstrumento);
  const etiquetar = useProyecto((s) => s.etiquetarInstrumento);
  const eliminar = useProyecto((s) => s.eliminarInstrumento);
  const seleccionar = useProyecto((s) => s.seleccionar);

  if (!seleccionadoId || !instrumento) {
    return (
      <div className="ma-panel-sel ma-panel-sel--vacio">
        <p>Toca un equipo del lienzo para editarlo.</p>
      </div>
    );
  }

  const equipo = EQUIPOS_POR_ID.get(instrumento.equipoId);
  if (!equipo) return null;

  return (
    <div className="ma-panel-sel">
      <header>
        <strong>{equipo.nombre}</strong>
        <button
          type="button"
          className="ma-boton-icono"
          onClick={() => seleccionar(null)}
          aria-label="Cerrar panel"
        >
          x
        </button>
      </header>

      <label className="ma-campo">
        <span>Etiqueta</span>
        <input
          type="text"
          value={instrumento.etiqueta ?? ''}
          placeholder={equipo.nombre}
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
          Girar -15
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => rotar(instrumento.id, 15)}
        >
          Girar +15
        </button>
        <button
          type="button"
          className="ma-boton ma-boton--secundario"
          onClick={() => eliminar(instrumento.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
