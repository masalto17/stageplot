/**
 * Idioma del editor. Se elige al primer arranque desde `navigator.language`
 * y se persiste en localStorage. La UI y las etiquetas del canvas siguen el
 * idioma elegido; la paleta muestra ambos nombres para reforzar la lectura
 * bilingue de riders internacionales.
 */
export type Idioma = 'es' | 'en';

const CLAVE = 'stageplot:idioma';

export function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'es' || guardado === 'en') return guardado;
  } catch { /* localStorage bloqueado */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  return nav.startsWith('es') ? 'es' : 'en';
}

export function guardarIdioma(idioma: Idioma): void {
  try {
    localStorage.setItem(CLAVE, idioma);
  } catch { /* no-op */ }
}

/** Copy de UI que si o si necesita traduccion. */
interface Copy {
  fuente: string;
  stand: string;
  fase: string;
  nota: string;
  stands: Record<'recto' | 'boom' | 'corto' | 'clip' | 'suelo' | 'otro', string>;
  detalleCanal: string;
  volverASugerido: string;
  toggleDetalles: string;
  nuevo: string;
  nuevoTitulo: string;
  nuevoVacio: string;
  nuevoDescripcionVacio: string;
  descartarConfirmacion: string;
  cancelar: string;
  aceptar: string;
  deshacer: string;
  rehacer: string;
  pdf: string;
  compartir: string;
  generando: string;
  compartiendo: string;
  plano: string;
  canales: string;
  etiqueta: string;
  girarIzquierda: string;
  girarDerecha: string;
  duplicar: string;
  alFrente: string;
  alFondo: string;
  eliminar: string;
  cerrarPanel: string;
  seleccionarTip: string;
  nombreProyecto: string;
  senal: string;
  phantom: string;
  sinCanales: string;
  cargando: string;
  agregarEquipos: string;
  agregarEquiposDesc: string;
  listaSeArma: string;
  listaSeArmaDesc: string;
  compartilo: string;
  compartiloDesc: string;
  saltar: string;
  siguiente: string;
  empezar: string;
  frenteEscenario: string;
  ajustar: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  grillaOn: string;
  grillaOff: string;
  buscarPaleta: string;
  categorias: Record<string, string>;
  senales: Record<'linea' | 'micro' | 'inalambrico' | 'monitor', string>;
}

export const UI: Record<Idioma, Copy> = {
  es: {
    fuente: 'Mic / DI',
    stand: 'Pedestal',
    fase: 'Fase',
    nota: 'Nota',
    stands: {
      recto: 'Recto', boom: 'Boom', corto: 'Corto', clip: 'Clip', suelo: 'Suelo', otro: 'Otro',
    },
    detalleCanal: 'Detalle',
    volverASugerido: 'Volver al sugerido',
    toggleDetalles: 'Detalle input list',
    nuevo: 'Nuevo',
    nuevoTitulo: 'Empezar de nuevo',
    nuevoVacio: 'En blanco',
    nuevoDescripcionVacio: 'Sin instrumentos. Ideal si ya sabes que armar.',
    descartarConfirmacion: 'Se va a borrar el proyecto actual. Continuar?',
    cancelar: 'Cancelar',
    aceptar: 'Aceptar',
    deshacer: 'Deshacer',
    rehacer: 'Rehacer',
    pdf: 'PDF',
    compartir: 'Compartir',
    generando: 'Generando...',
    compartiendo: 'Compartiendo...',
    plano: 'Plano',
    canales: 'Canales',
    etiqueta: 'Etiqueta',
    girarIzquierda: 'Girar -15°',
    girarDerecha: 'Girar +15°',
    duplicar: 'Duplicar',
    alFrente: 'Al frente',
    alFondo: 'Al fondo',
    eliminar: 'Eliminar',
    cerrarPanel: 'Cerrar',
    seleccionarTip: 'Toca un equipo del lienzo para editarlo.',
    nombreProyecto: 'Nombre del proyecto',
    senal: 'Senal',
    phantom: '+48V',
    sinCanales: 'Todavia no hay canales. Agrega equipos al lienzo.',
    cargando: 'Cargando...',
    agregarEquipos: 'Agrega equipos',
    agregarEquiposDesc:
      'Arrastra un icono desde la biblioteca al escenario. Movelo con el dedo o el mouse.',
    listaSeArma: 'La lista se arma sola',
    listaSeArmaDesc:
      'Cada equipo agrega sus canales automaticamente. Editas el nombre desde el panel de seleccion.',
    compartilo: 'Compartilo',
    compartiloDesc:
      'Exporta el PDF y mandalo por WhatsApp o mail al sonidista.',
    saltar: 'Saltar',
    siguiente: 'Siguiente',
    empezar: 'Empezar',
    frenteEscenario: 'FRENTE DEL ESCENARIO',
    ajustar: 'Ajustar',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    zoomReset: '100%',
    grillaOn: 'Grilla',
    grillaOff: 'Grilla',
    buscarPaleta: 'Buscar equipo...',
    categorias: {
      bateria: 'Bateria',
      percusion: 'Percusion',
      guitarra: 'Guitarra',
      bajo: 'Bajo',
      teclado: 'Teclados',
      voz: 'Voces',
      viento: 'Vientos y cuerdas',
      monitor: 'Monitores',
      backline: 'Backline',
      utilidad: 'Utilidad',
    },
    senales: {
      linea: 'Linea',
      micro: 'Microfono',
      inalambrico: 'Inalambrico',
      monitor: 'Monitor',
    },
  },
  en: {
    fuente: 'Mic / DI',
    stand: 'Stand',
    fase: 'Ø',
    nota: 'Note',
    stands: {
      recto: 'Straight', boom: 'Boom', corto: 'Short', clip: 'Clip', suelo: 'Floor', otro: 'Other',
    },
    detalleCanal: 'Detail',
    volverASugerido: 'Reset to suggested',
    toggleDetalles: 'Input list details',
    nuevo: 'New',
    nuevoTitulo: 'Start something new',
    nuevoVacio: 'Blank canvas',
    nuevoDescripcionVacio: 'No instruments. Best if you already know what you need.',
    descartarConfirmacion: 'This will erase the current project. Continue?',
    cancelar: 'Cancel',
    aceptar: 'OK',
    deshacer: 'Undo',
    rehacer: 'Redo',
    pdf: 'PDF',
    compartir: 'Share',
    generando: 'Generating...',
    compartiendo: 'Sharing...',
    plano: 'Plot',
    canales: 'Channels',
    etiqueta: 'Label',
    girarIzquierda: 'Rotate -15°',
    girarDerecha: 'Rotate +15°',
    duplicar: 'Duplicate',
    alFrente: 'Bring forward',
    alFondo: 'Send back',
    eliminar: 'Delete',
    cerrarPanel: 'Close',
    seleccionarTip: 'Tap any item on the canvas to edit it.',
    nombreProyecto: 'Project name',
    senal: 'Signal',
    phantom: '+48V',
    sinCanales: 'No channels yet. Add gear to the canvas.',
    cargando: 'Loading...',
    agregarEquipos: 'Add gear',
    agregarEquiposDesc:
      'Drag any icon from the library onto the stage. Move it with touch or mouse.',
    listaSeArma: 'Channels update automatically',
    listaSeArmaDesc:
      'Every item adds its channels. Rename from the selection panel.',
    compartilo: 'Share it',
    compartiloDesc:
      'Export a PDF and send it to the engineer via WhatsApp or email.',
    saltar: 'Skip',
    siguiente: 'Next',
    empezar: 'Get started',
    frenteEscenario: 'STAGE FRONT',
    ajustar: 'Fit',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: '100%',
    grillaOn: 'Grid',
    grillaOff: 'Grid',
    buscarPaleta: 'Search gear...',
    categorias: {
      bateria: 'Drums',
      percusion: 'Percussion',
      guitarra: 'Guitar',
      bajo: 'Bass',
      teclado: 'Keys',
      voz: 'Vocals',
      viento: 'Winds & strings',
      monitor: 'Monitors',
      backline: 'Backline',
      utilidad: 'Utility',
    },
    senales: {
      linea: 'Line',
      micro: 'Microphone',
      inalambrico: 'Wireless',
      monitor: 'Monitor',
    },
  },
};
