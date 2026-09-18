/**
 * Export a PDF: plano (rasterizado desde el lienzo) + tabla de canales.
 *
 * html2canvas rasteriza el DOM del lienzo respetando el sistema de coordenadas
 * interno (es un SVG con viewBox 0 0 1000 625). Luego jsPDF acomoda:
 *  - pagina 1 apaisada: encabezado + imagen del lienzo;
 *  - pagina 2 portrait: tabla de canales.
 *
 * Se genera un PDF A4 estandar (210x297mm). No metemos el logo directamente en
 * el header como imagen recortada porque el activo autorizado tiene un lienzo
 * transparente que hay que respetar (regla del Brand Master).
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CanalDerivado, Proyecto } from '@/store/proyecto';
import type { Idioma } from '@/i18n/idioma';
import { UI } from '@/i18n/idioma';

interface Opciones {
  proyecto: Proyecto;
  canales: readonly CanalDerivado[];
  /** Elemento DOM del lienzo a rasterizar. */
  lienzo: HTMLElement;
  idioma: Idioma;
}

/**
 * Trunca un string para que no salga del ancho de la columna. Corta con `...`
 * si no entra completo. Un rider tipico tiene notas de 8 palabras.
 */
function recorte(pdf: import('jspdf').default, texto: string, anchoMm: number): string {
  if (!texto) return '';
  const anchoActual = pdf.getStringUnitWidth(texto) * pdf.getFontSize() / pdf.internal.scaleFactor;
  if (anchoActual <= anchoMm - 1) return texto;
  let corte = texto;
  while (corte.length > 3 && pdf.getStringUnitWidth(corte + '...') * pdf.getFontSize() / pdf.internal.scaleFactor > anchoMm - 1) {
    corte = corte.slice(0, -1);
  }
  return corte + '...';
}

/** Devuelve el Blob del PDF listo para descarga o Web Share. */
export async function generarPdf({
  proyecto,
  canales,
  lienzo,
  idioma,
}: Opciones): Promise<Blob> {
  const t = UI[idioma];
  const canvas = await html2canvas(lienzo, {
    backgroundColor: '#ffffff',
    // scale 1.5 en JPEG rinde ~300 dpi efectivos sobre A4 apaisado y baja el
    // peso final del PDF de ~3.5 MB (PNG scale 2) a ~500 kB, dentro del limite
    // comodo de WhatsApp incluso en 3G.
    scale: 1.5,
    useCORS: true,
    logging: false,
  });
  const imagen = canvas.toDataURL('image/jpeg', 0.85);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ---- Portada / plano ----
  const anchoPagina = pdf.internal.pageSize.getWidth();
  const altoPagina = pdf.internal.pageSize.getHeight();
  const margen = 12;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(proyecto.nombre || 'Stage plot', margen, margen + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(90);
  const localeFecha = idioma === 'es' ? 'es-AR' : 'en-US';
  const fecha = new Date(proyecto.modificado).toLocaleDateString(localeFecha);
  const etiqueta = idioma === 'es' ? 'Stage plot - actualizado' : 'Stage plot - updated';
  pdf.text(`${etiqueta} ${fecha}`, margen, margen + 10);
  pdf.setTextColor(0);

  // El lienzo tiene ratio 1000/625 = 1.6, mantener proporciones.
  const anchoImg = anchoPagina - margen * 2;
  const altoImg = anchoImg * (625 / 1000);
  const yImg = margen + 16;
  pdf.addImage(imagen, 'JPEG', margen, yImg, anchoImg, altoImg);

  // Marca al pie: nombre de la marca, no el logo (evita usar el activo
  // sin respetar el espacio de seguridad en un footer chico).
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(
    'Generado con MasAlto StagePlot - masalto.com.ar/stageplot',
    margen,
    altoPagina - 6,
  );
  pdf.setTextColor(0);

  // ---- Pagina 2+: input list ----
  if (canales.length > 0) {
    pdf.addPage('a4', 'landscape');
    const anchoP = pdf.internal.pageSize.getWidth();
    const altoP = pdf.internal.pageSize.getHeight();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    const titulo = idioma === 'es' ? 'Input list' : 'Input list';
    pdf.text(titulo, margen, margen + 4);
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(proyecto.nombre || 'Stage plot', anchoP - margen, margen + 4, { align: 'right' });
    pdf.setTextColor(0);

    // Columnas (mm): # | Canal | Senal | +48V | O | Mic/DI | Stand | Nota.
    const cols = [
      { x: margen + 2,  w: 10, label: '#' },
      { x: margen + 14, w: 52, label: t.canales },
      { x: margen + 68, w: 22, label: t.senal },
      { x: margen + 92, w: 14, label: '+48V' },
      { x: margen + 108, w: 12, label: idioma === 'es' ? 'Ø' : 'Ø' },
      { x: margen + 122, w: 55, label: t.fuente },
      { x: margen + 179, w: 22, label: t.stand },
      { x: margen + 203, w: anchoP - margen * 2 - 205, label: t.nota },
    ];

    const cabezal = margen + 14;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margen, cabezal, anchoP - margen * 2, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    for (const c of cols) pdf.text(c.label, c.x, cabezal + 5.5);
    pdf.setFont('helvetica', 'normal');

    let y = cabezal + 12;
    for (const canal of canales) {
      if (y > altoP - margen - 4) {
        pdf.addPage('a4', 'landscape');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margen, margen, anchoP - margen * 2, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        for (const c of cols) pdf.text(c.label, c.x, margen + 5.5);
        pdf.setFont('helvetica', 'normal');
        y = margen + 12;
      }
      pdf.text(String(canal.numero), cols[0]!.x, y);
      pdf.text(recorte(pdf, canal.nombre, cols[1]!.w), cols[1]!.x, y);
      pdf.text(t.senales[canal.senal], cols[2]!.x, y);
      if (canal.phantom) pdf.text(idioma === 'es' ? 'Si' : 'Yes', cols[3]!.x, y);
      if (canal.fase) pdf.text(idioma === 'es' ? 'Si' : 'Yes', cols[4]!.x, y);
      if (canal.mic) pdf.text(recorte(pdf, canal.mic, cols[5]!.w), cols[5]!.x, y);
      if (canal.stand) pdf.text(t.stands[canal.stand], cols[6]!.x, y);
      if (canal.nota) pdf.text(recorte(pdf, canal.nota, cols[7]!.w), cols[7]!.x, y);
      y += 6;
      pdf.setDrawColor(235);
      pdf.line(margen, y - 2.5, anchoP - margen, y - 2.5);
    }
  }

  return pdf.output('blob');
}

/** Descarga el Blob con un nombre razonable. */
export function descargar(blob: Blob, nombreProyecto: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = (nombreProyecto || 'stageplot').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.download = `${slug || 'stageplot'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
