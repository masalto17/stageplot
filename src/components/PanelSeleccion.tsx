import { useMemo } from 'react';
import { useProyecto } from '@/store/proyecto';
import { EQUIPOS_POR_ID } from '@/icons/catalog';
import { UI } from '@/i18n/idioma';

/**
 * Panel de edicion.
 *  - 0 seleccionados: tip.
 *  - 1 seleccionado: editor completo (etiqueta, rotacion, z-order, duplicar, borrar).
 *  - >1 seleccionados: acciones grupales (rotar, duplicar, borrar).
 *
 * El z-order no aplica en modo grupal para no cambiar el orden relativo
 * dentro del grupo (fuera del alcance de esta iteracion).
 */
export function PanelSeleccion() {
  const idioma = useProyecto((s) => s.idioma);
  const seleccionadosIds = useProyecto((s) => s.seleccionadosIds);
  const todos = useProyecto((s) => s.proyecto.instrumentos);
  const instrumentos = useMemo(
    () => todos.filter((i) => seleccionadosIds.includes(i.id)),
    [todos, seleccionadosIds],
  );
  const rotar = useProyecto((s) => s.rotarInstrumento);
  const duplicar = useProyecto((s) => s.duplicarInstrumento);
  const etiquetar = useProyecto((s) => s.etiquetarInstrumento);
  const eliminar = useProyecto((s) => s.eliminarInstrumento);
  const traerAlFrente = useProyecto((s) => s.traerAlFrente);
  const enviarAlFondo = useProyecto((s) => s.enviarAlFondo);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const t = UI[idioma];

  if (seleccionadosIds.length === 0) {
    return (
      <aside className="ma-panel-sel ma-panel-sel--vacio">
        <p>{t.seleccionarTip}</p>
      </aside>
    );
  }

  // Modo grupal.
  if (seleccionadosIds.length > 1) {
    return (
      <aside className="ma-panel-sel">
        <header>
          <strong>
            {seleccionadosIds.length} {idioma === 'es' ? 'seleccionados' : 'selected'}
          </strong>
          <button
            type="button"
            className="ma-boton-icono"
            onClick={() => seleccionar(null)}
            aria-label={t.cerrarPanel}
          >
            x
          </button>
        </header>
        <p className="ma-panel-sel__pista">
          {idioma === 'es'
            ? 'Arrastra uno cualquiera y se mueven todos.'
            : 'Drag any of them, they all move.'}
        </p>
        <div className="ma-panel-sel__acciones">
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => seleccionadosIds.forEach((id) => rotar(id, -15))}
          >
            {t.girarIzquierda}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => seleccionadosIds.forEach((id) => rotar(id, 15))}
          >
            {t.girarDerecha}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={() => seleccionadosIds.forEach((id) => duplicar(id))}
          >
            {t.duplicar}
          </button>
          <button
            type="button"
            className="ma-boton ma-boton--secundario ma-boton--peligro"
            onClick={() => seleccionadosIds.forEach((id) => eliminar(id))}
          >
            {t.eliminar}
          </button>
        </div>
      </aside>
    );
  }

  const instrumento = instrumentos[0]!;
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
