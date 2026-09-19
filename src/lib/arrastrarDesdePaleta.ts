/**
 * Arrastre desde la paleta hasta el lienzo.
 *
 * Estrategia: al `pointerdown` sobre un item de la paleta enganchamos
 * listeners globales para trackear el pointer. Si se mueve mas del umbral,
 * asumimos que es un DRAG (no un click de "agregar al centro") y mostramos
 * un ghost SVG que sigue al cursor. Al soltar:
 *  - si estamos dentro del lienzo, agregamos el instrumento en las
 *    coordenadas exactas del drop;
 *  - si estamos fuera, cancelamos.
 *
 * Debajo del umbral, el pointerup se convierte en un click y el flujo
 * cae en el onClick del boton (agregar al centro, comportamiento original).
 */

const UMBRAL_DRAG_PX = 6;

interface Opciones {
  equipoId: string;
  svgHtml: string;
  onDropEnLienzo: (equipoId: string, x: number, y: number) => void;
  selectorLienzo?: string;
  anchoViewbox: number;
  altoViewbox: number;
}

export function iniciarArrastrePaleta(
  arranque: PointerEvent,
  {
    equipoId,
    svgHtml,
    onDropEnLienzo,
    selectorLienzo = '.ma-lienzo',
    anchoViewbox,
    altoViewbox,
  }: Opciones,
): void {
  const startX = arranque.clientX;
  const startY = arranque.clientY;

  let ghost: HTMLDivElement | null = null;
  let iniciado = false;

  const armarGhost = () => {
    const g = document.createElement('div');
    g.className = 'ma-paleta__ghost';
    g.innerHTML = svgHtml;
    g.style.position = 'fixed';
    g.style.pointerEvents = 'none';
    g.style.zIndex = '9999';
    g.style.left = arranque.clientX + 'px';
    g.style.top = arranque.clientY + 'px';
    document.body.appendChild(g);
    return g;
  };

  const onMove = (e: PointerEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!iniciado && Math.hypot(dx, dy) > UMBRAL_DRAG_PX) {
      iniciado = true;
      ghost = armarGhost();
      document.body.style.cursor = 'grabbing';
    }
    if (ghost) {
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
    }
  };

  const onUp = (e: PointerEvent) => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    document.body.style.cursor = '';
    if (!ghost) return; // fue un click puro, dejamos que el click normal actue
    ghost.remove();
    // Chequear si el drop cayo dentro del lienzo.
    const lienzo = document.querySelector<HTMLElement>(selectorLienzo);
    if (!lienzo) return;
    const rect = lienzo.getBoundingClientRect();
    const dentro =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (dentro) {
      const x = ((e.clientX - rect.left) / rect.width) * anchoViewbox;
      const y = ((e.clientY - rect.top) / rect.height) * altoViewbox;
      onDropEnLienzo(equipoId, x, y);
    }
  };

  const onCancel = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    document.body.style.cursor = '';
    if (ghost) ghost.remove();
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
}
