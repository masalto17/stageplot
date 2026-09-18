import { useEffect, useState } from 'react';
import { useProyecto } from '@/store/proyecto';
import {
  listarProyectos,
  abrirProyecto,
  duplicarProyecto,
  borrarProyecto,
  guardarProyectoNuevo,
} from '@/store/persistencia';
import { plantillaBanda, plantillaPorSlug, SLUGS_PLANTILLA } from '@/lib/plantilla';
import { UI, type Idioma } from '@/i18n/idioma';
import {
  codificarProyecto,
  armarUrlCompartir,
  copiarAlPortapapeles,
} from '@/lib/compartirLink';

interface Props {
  idioma: Idioma;
  onCerrar: () => void;
}

const NOMBRES_PLANTILLA: Record<string, { es: string; en: string }> = {
  rock: { es: 'Banda de rock', en: 'Rock band' },
  solista: { es: 'Solista con guitarra', en: 'Solo w/ guitar' },
  dj: { es: 'Set de DJ', en: 'DJ set' },
  folklore: { es: 'Folklore', en: 'Folk' },
};

/**
 * Biblioteca de proyectos + creacion nueva + compartir link del actual.
 * Reemplaza al modal "Nuevo" viejo, que era solo lienzo vacio o plantilla.
 */
export function ModalProyectos({ idioma, onCerrar }: Props) {
  const t = UI[idioma];
  const proyectoActual = useProyecto((s) => s.proyecto);
  const [proyectos, setProyectos] = useState<
    Awaited<ReturnType<typeof listarProyectos>>
  >([]);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    listarProyectos().then(setProyectos);
  }, []);

  const refrescar = async () => setProyectos(await listarProyectos());

  const abrir = async (id: string) => {
    if (id === proyectoActual.id) { onCerrar(); return; }
    await abrirProyecto(id);
    onCerrar();
  };

  const duplicar = async (id: string) => {
    await duplicarProyecto(id);
    await refrescar();
  };

  const borrar = async (id: string) => {
    if (!confirm(t.borrarConfirm)) return;
    await borrarProyecto(id);
    await refrescar();
  };

  const crear = async (proyecto: ReturnType<typeof plantillaBanda> | null) => {
    if (proyecto) {
      await guardarProyectoNuevo(proyecto);
    } else {
      const ahora = Date.now();
      await guardarProyectoNuevo({
        id: crypto.randomUUID(),
        nombre: idioma === 'es' ? 'Sin titulo' : 'Untitled',
        creado: ahora,
        modificado: ahora,
        instrumentos: [],
      });
    }
    onCerrar();
  };

  const compartir = async () => {
    const { hash, advertencia } = codificarProyecto(proyectoActual);
    const url = armarUrlCompartir(hash);
    const ok = await copiarAlPortapapeles(url);
    if (ok) {
      setAviso(
        (t.linkCopiado) +
          (advertencia === 'sin-fondo' ? '\n' + t.linkAdvertenciaFondo : ''),
      );
    } else {
      setAviso(t.linkNoCopio + '\n' + url);
    }
  };

  return (
    <div className="ma-modal" role="dialog" aria-modal="true" onClick={onCerrar}>
      <div
        className="ma-modal__caja ma-modal__caja--ancho"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ma-modal__header">
          <h2>{t.proyectosTitulo}</h2>
          <button
            type="button"
            className="ma-boton-icono"
            onClick={onCerrar}
            aria-label={t.cerrarPanel}
          >
            x
          </button>
        </header>

        <section className="ma-proyectos__actual">
          <div>
            <p className="ma-proyectos__hint ma-dato">{t.proyectoActual}</p>
            <strong>{proyectoActual.nombre}</strong>
          </div>
          <button
            type="button"
            className="ma-boton ma-boton--secundario"
            onClick={compartir}
          >
            {t.copiarLink}
          </button>
        </section>

        {aviso && (
          <p className="ma-proyectos__aviso" role="status">{aviso}</p>
        )}

        <section className="ma-proyectos__seccion">
          <h3>{t.proyectos}</h3>
          {proyectos.length === 0 ? (
            <p className="ma-proyectos__vacio">{t.sinProyectos}</p>
          ) : (
            <ul className="ma-proyectos__lista">
              {proyectos.map((p) => (
                <li key={p.id} className={p.id === proyectoActual.id ? 'ma-proyectos__item ma-proyectos__item--actual' : 'ma-proyectos__item'}>
                  <div className="ma-proyectos__info">
                    <strong>{p.nombre}</strong>
                    <span className="ma-dato">
                      {p.instrumentos} · {formatearFecha(p.modificado, idioma)}
                    </span>
                  </div>
                  <div className="ma-proyectos__acciones">
                    <button
                      type="button"
                      className="ma-boton ma-boton--secundario"
                      onClick={() => abrir(p.id)}
                      disabled={p.id === proyectoActual.id}
                    >
                      {p.id === proyectoActual.id ? '✓' : t.abrirProyecto}
                    </button>
                    <button
                      type="button"
                      className="ma-boton ma-boton--secundario"
                      onClick={() => duplicar(p.id)}
                    >
                      {t.duplicarProyecto}
                    </button>
                    <button
                      type="button"
                      className="ma-boton ma-boton--secundario ma-boton--peligro"
                      onClick={() => borrar(p.id)}
                    >
                      {t.borrarProyecto}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ma-proyectos__seccion">
          <h3>{t.nuevoTitulo}</h3>
          <div className="ma-modal__opciones">
            <button
              type="button"
              className="ma-modal__opc"
              onClick={() => crear(null)}
            >
              <strong>{t.nuevoVacio}</strong>
              <span>{t.nuevoDescripcionVacio}</span>
            </button>
            {SLUGS_PLANTILLA.map((slug) => {
              const proyecto = slug === 'rock' ? plantillaBanda() : plantillaPorSlug(slug);
              if (!proyecto) return null;
              const nombres = NOMBRES_PLANTILLA[slug] ?? { es: slug, en: slug };
              return (
                <button
                  key={slug}
                  type="button"
                  className="ma-modal__opc"
                  onClick={() => crear(proyecto)}
                >
                  <strong>{nombres[idioma]}</strong>
                  <span>{proyecto.instrumentos.length} {idioma === 'es' ? 'equipos' : 'items'}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatearFecha(ts: number, idioma: Idioma): string {
  const locale = idioma === 'es' ? 'es-AR' : 'en-US';
  return new Date(ts).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
