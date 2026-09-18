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

interface Opciones {
  proyecto: Proyecto;
  canales: readonly CanalDerivado[];
  /** Elemento DOM del lienzo a rasterizar. */
  lienzo: HTMLElement;
}

/** Devuelve el Blob del PDF listo para descarga o Web Share. */
export async function generarPdf({ proyecto, canales, lienzo }: Opciones): Promise<Blob> {
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
  const fecha = new Date(proyecto.modificado).toLocaleDateString('es-AR');
  pdf.text(`Stage plot - actualizado ${fecha}`, margen, margen + 10);
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

  // ---- Pagina 2: tabla de canales ----
  if (canales.length > 0) {
    pdf.addPage('a4', 'portrait');
    const anchoP = pdf.internal.pageSize.getWidth();
    const altoP = pdf.internal.pageSize.getHeight();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Lista de canales', margen, margen + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const cabezal = margen + 16;
    // Columnas: numero (14mm) | nombre (85mm) | senal (40mm) | +48V (marca).
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margen, cabezal, anchoP - margen * 2, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.text('#', margen + 2, cabezal + 6);
    pdf.text('Canal', margen + 18, cabezal + 6);
    pdf.text('Senal', margen + 105, cabezal + 6);
    pdf.text('+48V', margen + 150, cabezal + 6);
    pdf.setFont('helvetica', 'normal');

    let y = cabezal + 14;
    for (const canal of canales) {
      if (y > altoP - margen - 6) {
        pdf.addPage('a4', 'portrait');
        y = margen + 6;
      }
      pdf.text(String(canal.numero), margen + 2, y);
      pdf.text(canal.nombre, margen + 18, y);
      pdf.text(traducirSenal(canal.senal), margen + 105, y);
      if (canal.phantom) pdf.text('Si', margen + 150, y);
      y += 7;
      pdf.setDrawColor(230);
      pdf.line(margen, y - 3, anchoP - margen, y - 3);
    }
  }

  return pdf.output('blob');
}

function traducirSenal(s: CanalDerivado['senal']): string {
  switch (s) {
    case 'linea':
      return 'Linea';
    case 'micro':
      return 'Microfono';
    case 'inalambrico':
      return 'Inalambrico';
    case 'monitor':
      return 'Monitor';
  }
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
