import { useEffect } from 'react';
import { useProyecto } from '@/store/proyecto';

/**
 * Atajos de teclado del editor.
 *  - Cmd/Ctrl + Z:         deshacer
 *  - Cmd/Ctrl + Shift + Z: rehacer
 *  - Cmd/Ctrl + Y:         rehacer (Windows habit)
 *  - Delete/Backspace:     borrar el instrumento seleccionado
 *  - Cmd/Ctrl + D:         duplicar el instrumento seleccionado
 *  - Escape:               deseleccionar
 *
 * No se disparan mientras el foco esta en un input o textarea, para no comer
 * teclas mientras el usuario renombra un canal o un proyecto.
 */
export function useAtajos() {
  const eliminar = useProyecto((s) => s.eliminarInstrumento);
  const duplicar = useProyecto((s) => s.duplicarInstrumento);
  const seleccionar = useProyecto((s) => s.seleccionar);

  useEffect(() => {
    function esEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    function onKeyDown(evento: KeyboardEvent) {
      if (esEditable(evento.target)) return;
      const meta = evento.metaKey || evento.ctrlKey;
      const seleccionado = useProyecto.getState().seleccionadoId;

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
      if (meta && evento.key.toLowerCase() === 'd') {
        if (!seleccionado) return;
        evento.preventDefault();
        duplicar(seleccionado);
        return;
      }
      if ((evento.key === 'Delete' || evento.key === 'Backspace') && seleccionado) {
        evento.preventDefault();
        eliminar(seleccionado);
        return;
      }
      if (evento.key === 'Escape') {
        seleccionar(null);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [eliminar, duplicar, seleccionar]);
}
