/**
 * Compartir un proyecto por link. El proyecto se serializa a JSON, se
 * comprime con LZ-string a un formato URL-safe y viaja en el hash del URL.
 *
 * El fondo importado se DESCARTA del share por peso: un plano puede llegar a
 * cientos de kilobytes en dataURL y hace estallar el URL en varios navegadores.
 * El resto del proyecto pesa cientos de bytes hasta pocos kilobytes.
 */
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Proyecto } from '@/store/proyecto';

/** Marca de version. Sube cuando el shape cambie y no sea compatible. */
const VERSION = 1;

interface Sobre {
  v: number;
  p: Proyecto;
}

export interface ResultadoCodificar {
  hash: string;
  incluyeFondo: false;
  advertencia: 'sin-fondo' | null;
}

/** Devuelve el hash `#e=<datos>` para usar en la URL. */
export function codificarProyecto(proyecto: Proyecto): ResultadoCodificar {
  // Strip fondo para que el link quede compartible.
  const { fondo: _, ...proyectoSinFondo } = proyecto;
  const sobre: Sobre = { v: VERSION, p: proyectoSinFondo as Proyecto };
  const encoded = compressToEncodedURIComponent(JSON.stringify(sobre));
  return {
    hash: `#e=${encoded}`,
    incluyeFondo: false,
    advertencia: proyecto.fondo ? 'sin-fondo' : null,
  };
}

/** Extrae el proyecto de un hash `#e=...`. Devuelve null si no aplica o falla. */
export function decodificarProyecto(hash: string): Proyecto | null {
  const limpio = hash.replace(/^#/, '');
  const params = new URLSearchParams(limpio);
  const dato = params.get('e');
  if (!dato) return null;
  try {
    const json = decompressFromEncodedURIComponent(dato);
    if (!json) return null;
    const sobre = JSON.parse(json) as Sobre;
    if (sobre.v !== VERSION) return null;
    return sobre.p;
  } catch {
    return null;
  }
}

/** Regenera ids del proyecto importado para que no colisione con los guardados. */
export function reidentificar(proyecto: Proyecto): Proyecto {
  return {
    ...proyecto,
    id: crypto.randomUUID(),
    creado: Date.now(),
    modificado: Date.now(),
    instrumentos: proyecto.instrumentos.map((i) => ({
      ...i,
      id: crypto.randomUUID(),
    })),
  };
}

/** Construye el URL completo compartible (base actual + hash). */
export function armarUrlCompartir(hash: string): string {
  if (typeof location === 'undefined') return hash;
  return `${location.origin}${location.pathname}${hash}`;
}

/**
 * Copia texto al portapapeles. Devuelve true si funciono, false si el
 * navegador lo rechazo (Safari sin gesto de usuario, permisos denegados).
 */
export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch { /* fallback abajo */ }
  try {
    // Fallback antiguo, sirve en iOS < 13 y algunos WebView.
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}
