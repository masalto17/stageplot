/**
 * Mientras el sitio vive en la URL de staging (`*.github.io/stageplot/`) no se
 * indexa: evita que Google guarde una copia duplicada antes de la mudanza a
 * masalto.com.ar. Se prende con `PUBLIC_SITIO_INDEXABLE=true` en el deploy.
 */
export const SITIO_INDEXABLE = import.meta.env.PUBLIC_SITIO_INDEXABLE === 'true';
