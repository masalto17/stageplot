import { useMemo, useRef, useState } from 'react';
import { EQUIPOS, type CategoriaEquipo } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import { useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';
import { iniciarArrastrePaleta } from '@/lib/arrastrarDesdePaleta';

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
  // Se comparte una flag entre los items para suprimir el click sintetico
  // que salta despues del pointerup cuando hubo drag real.
  const suprimirClickRef = useRef({ suprimir: false });

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
                <ItemPaleta
                  key={eq.id}
                  equipo={eq}
                  idioma={idioma}
                  agregar={agregar}
                  suprimirClickRef={suprimirClickRef}
                />
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );
}


interface PropsItem {
  equipo: import('@/icons/catalog').Equipo;
  idioma: import('@/i18n/idioma').Idioma;
  agregar: (equipoId: string, x: number, y: number) => string;
  suprimirClickRef: React.RefObject<{ suprimir: boolean }>;
}

function ItemPaleta({ equipo, idioma, agregar, suprimirClickRef }: PropsItem) {
  const svgRef = useRef<HTMLSpanElement>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Solo mouse principal / touch primario. Ignoramos click derecho.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const svgHtml = svgRef.current?.querySelector('svg')?.outerHTML ?? '';
    iniciarArrastrePaleta(e.nativeEvent, {
      equipoId: equipo.id,
      svgHtml,
      onDropEnLienzo: (id, x, y) => {
        agregar(id, x, y);
        // Marca la flag para que el click que sigue al pointerup no vuelva
        // a agregar el equipo (una vez es un item + otra al centro).
        suprimirClickRef.current.suprimir = true;
      },
      anchoViewbox: 1000,
      altoViewbox: 625,
    });
  };

  const onClick = () => {
    if (suprimirClickRef.current.suprimir) {
      suprimirClickRef.current.suprimir = false;
      return;
    }
    // Sin drag: click clasico agrega al centro.
    agregar(equipo.id, 500, 312);
  };

  return (
    <button
      type="button"
      className="ma-paleta__item"
      onPointerDown={onPointerDown}
      onClick={onClick}
      aria-label={`${equipo.nombre[idioma]} (${equipo.nombre[idioma === 'es' ? 'en' : 'es']})`}
      title={`${equipo.nombre.es} / ${equipo.nombre.en}`}
    >
      <span ref={svgRef}>
        <IconoEquipo equipo={equipo} size={40} idioma={idioma} />
      </span>
      <span className="ma-paleta__nombre">{equipo.nombre[idioma]}</span>
      <span className="ma-paleta__nombre-alt">
        {equipo.nombre[idioma === 'es' ? 'en' : 'es']}
      </span>
    </button>
  );
}
