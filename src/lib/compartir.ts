/**
 * Compartir por Web Share API cuando existe (Android + iOS lo tienen).
 * Fallback: WhatsApp Web con un mensaje que apunta al PDF descargado.
 *
 * La API `navigator.share` con archivos solo funciona en contexto seguro
 * (https o localhost) y solo con dispositivos que la soportan; siempre chequear
 * `canShare({ files })` antes de intentar.
 */
export interface Compartible {
  archivo: File;
  titulo: string;
  texto: string;
}

export type ResultadoCompartir =
  | { tipo: 'compartido' }
  | { tipo: 'cancelado' }
  | { tipo: 'sin-soporte'; alternativa: 'whatsapp' | 'descarga' };

export async function compartir({
  archivo,
  titulo,
  texto,
}: Compartible): Promise<ResultadoCompartir> {
  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator &&
    navigator.canShare?.({ files: [archivo] })
  ) {
    try {
      await navigator.share({ files: [archivo], title: titulo, text: texto });
      return { tipo: 'compartido' };
    } catch (error) {
      // AbortError = usuario cerro la hoja. No es un fallo real.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { tipo: 'cancelado' };
      }
      throw error;
    }
  }

  // Sin Web Share con archivos: dejamos al caller decidir la alternativa.
  return { tipo: 'sin-soporte', alternativa: 'descarga' };
}

/** Abre WhatsApp con un texto prellenado (sin archivo adjunto). */
export function abrirWhatsApp(texto: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
