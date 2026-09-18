import { useMemo, useState } from 'react';
import { EQUIPOS, type CategoriaEquipo } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import { useProyecto, LIENZO } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

const ORDEN: readonly CategoriaEquipo[] = [
  'bateria', 'percusion', 'bajo', 'guitarra', 'teclado',
  'voz', 'viento', 'monitor', 'backline', 'utilidad',
];

/**
 * Biblioteca de equipos. Un tap agrega el equipo al centro del lienzo (la
 * interaccion mas robusta para movil; el usuario lo reposiciona con drag
 * despues). Cada tarjeta muestra el nombre en ambos idiomas, un pequeno
 * detalle bilingue que ayuda a lectores internacionales.
 *
 * Hay busqueda para filtrar (utilidad cuando la lista crezca).
 */
export function Paleta() {
  const agregar = useProyecto((s) => s.agregarInstrumento);
  const idioma = useProyecto((s) => s.idioma);
  const [busqueda, setBusqueda] = useState('');

  const grupos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrar = (nombre: { es: string; en: string }) =>
      !q || nombre.es.toLowerCase().includes(q) || nombre.en.toLowerCase().includes(q);
    const map = new Map<CategoriaEquipo, typeof EQUIPOS[number][]>();
    for (const eq of EQUIPOS) {
      if (!filtrar(eq.nombre)) continue;
      const lista = map.get(eq.categoria) ?? [];
      lista.push(eq);
      map.set(eq.categoria, lista);
    }
    return map;
  }, [busqueda]);

  const totalVisible = [...grupos.values()].reduce((s, l) => s + l.length, 0);

  return (
    <aside className="ma-paleta" aria-label="Biblioteca de equipos">
      <div className="ma-paleta__buscar">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={UI[idioma].buscarPaleta}
          aria-label={UI[idioma].buscarPaleta}
        />
      </div>

      {totalVisible === 0 && (
        <p className="ma-paleta__vacio">—</p>
      )}

      {ORDEN.map((cat) => {
        const equipos = grupos.get(cat);
        if (!equipos?.length) return null;
        return (
          <section key={cat} className="ma-paleta__grupo">
            <h3>
              {UI[idioma].categorias[cat]}
              <span className="ma-paleta__contador">{equipos.length}</span>
            </h3>
            <div className="ma-paleta__grilla">
              {equipos.map((eq) => (
                <button
                  type="button"
                  key={eq.id}
                  className="ma-paleta__item"
                  onClick={() =>
                    agregar(eq.id, LIENZO.ancho / 2, LIENZO.alto / 2)
                  }
                  aria-label={`${eq.nombre[idioma]} (${eq.nombre[idioma === 'es' ? 'en' : 'es']})`}
                  title={`${eq.nombre.es} / ${eq.nombre.en}`}
                >
                  <IconoEquipo equipo={eq} size={40} idioma={idioma} />
                  <span className="ma-paleta__nombre">{eq.nombre[idioma]}</span>
                  <span className="ma-paleta__nombre-alt">
                    {eq.nombre[idioma === 'es' ? 'en' : 'es']}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );
}
