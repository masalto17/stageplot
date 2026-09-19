import { useEffect } from 'react';
import { useProyecto } from '@/store/proyecto';

/**
 * Atajos de teclado del editor.
 *  - Cmd/Ctrl + Z:         deshacer
 *  - Cmd/Ctrl + Shift + Z: rehacer
 *  - Cmd/Ctrl + Y:         rehacer (habito Windows)
 *  - Cmd/Ctrl + A:         seleccionar todos los instrumentos
 *  - Delete/Backspace:     borrar la seleccion (uno o muchos)
 *  - Cmd/Ctrl + D:         duplicar la seleccion
 *  - Escape:               deseleccionar
 *
 * No se disparan mientras el foco esta en un input o textarea, para no comer
 * teclas mientras el usuario renombra un canal o un proyecto.
 */
export function useAtajos() {
  const eliminar = useProyecto((s) => s.eliminarInstrumento);
  const duplicar = useProyecto((s) => s.duplicarInstrumento);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const seleccionarTodos = useProyecto((s) => s.seleccionarTodos);

  useEffect(() => {
    function esEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    function onKeyDown(evento: KeyboardEvent) {
      if (esEditable(evento.target)) return;
      const meta = evento.metaKey || evento.ctrlKey;
      const seleccionados = useProyecto.getState().seleccionadosIds;

      if (meta && evento.key.toLowerCase() === 'z') {
        evento.preventDefault();
        if (evento.shiftKey) useProyecto.temporal.getState().redo();
        else useProyecto.temporal.getState().undo();
        return;
      }
      if (meta && evento.key.toLowerCase() === 'y') {
        evento.preventDefault();
        useProyecto.temporal.getState().redo();
        return;
      }
      if (meta && evento.key.toLowerCase() === 'a') {
        evento.preventDefault();
        seleccionarTodos();
        return;
      }
      if (meta && evento.key.toLowerCase() === 'd') {
        if (seleccionados.length === 0) return;
        evento.preventDefault();
        for (const id of seleccionados) duplicar(id);
        return;
      }
      if ((evento.key === 'Delete' || evento.key === 'Backspace') && seleccionados.length > 0) {
        evento.preventDefault();
        for (const id of seleccionados) eliminar(id);
        return;
      }
      if (evento.key === 'Escape') {
        seleccionar(null);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [eliminar, duplicar, seleccionar, seleccionarTodos]);
}
