import { useEffect, useRef } from 'react';

const SELECTOR_FOCABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad minima de un dialog modal:
 *  - enfoca el primer control al abrir;
 *  - Escape cierra;
 *  - Tab cicla dentro del dialog;
 *  - restaura el foco al cerrar.
 */
export function useDialogo(onCerrar: () => void) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const onCerrarRef = useRef(onCerrar);
  onCerrarRef.current = onCerrar;

  useEffect(() => {
    const previo = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const caja = cajaRef.current;
    const primero = caja?.querySelector<HTMLElement>(SELECTOR_FOCABLE);
    (primero ?? caja)?.focus();

    const onKey = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopPropagation();
        onCerrarRef.current();
        return;
      }
      if (evento.key !== 'Tab' || !caja) return;
      const focables = [...caja.querySelectorAll<HTMLElement>(SELECTOR_FOCABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focables.length === 0) return;
      const inicio = focables[0]!;
      const fin = focables[focables.length - 1]!;
      if (evento.shiftKey && document.activeElement === inicio) {
        evento.preventDefault();
        fin.focus();
      } else if (!evento.shiftKey && document.activeElement === fin) {
        evento.preventDefault();
        inicio.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previo?.focus?.();
    };
  }, []);

  return cajaRef;
}
