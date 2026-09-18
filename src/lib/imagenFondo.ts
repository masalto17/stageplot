/**
 * Utilidades para el fondo importable del lienzo.
 *
 * Al importar una foto/plano del venue, se re-escala a un ancho maximo y se
 * comprime a JPEG 0.8. Un plano de sala tipico entra en ~200 kB, comodo para
 * la persistencia en IndexedDB y para el PDF exportado.
 *
 * Se guarda como dataURL: viaja pegado al proyecto, funciona offline y no
 * ensucia el schema con blobs binarios que compliquen las migraciones.
 */

/** Ancho maximo del fondo antes de re-escalar. */
const ANCHO_MAX = 1600;
/** Calidad JPEG. */
const CALIDAD = 0.82;
/** Peso maximo aceptado despues de comprimir. Un fondo mas pesado avisa. */
export const PESO_MAX_KB = 800;

export interface ResultadoImportar {
  dataUrl: string;
  ancho: number;
  alto: number;
  pesoKb: number;
}

/**
 * Carga el `File` como imagen, la baja de resolucion si supera `ANCHO_MAX`
 * y devuelve el dataURL comprimido. No aplica recortes ni rotaciones: el
 * ajuste fino se hace despues via opacidad / offset.
 */
export async function importarImagen(file: File): Promise<ResultadoImportar> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen.');
  }
  const url = URL.createObjectURL(file);
  try {
    const bitmap = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('No se pudo leer la imagen.'));
      img.src = url;
    });
    const escala = bitmap.width > ANCHO_MAX ? ANCHO_MAX / bitmap.width : 1;
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Sin contexto 2D en el canvas.');
    // Fondo blanco por si la fuente traia transparencia y JPEG se lo comeria.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    const dataUrl = canvas.toDataURL('image/jpeg', CALIDAD);
    const pesoKb = Math.round((dataUrl.length * 0.75) / 1024);
    return { dataUrl, ancho, alto, pesoKb };
  } finally {
    URL.revokeObjectURL(url);
  }
}
