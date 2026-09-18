import { EQUIPOS, type CategoriaEquipo } from '@/icons/catalog';
import { IconoEquipo } from './IconoEquipo';
import { useProyecto, LIENZO } from '@/store/proyecto';

const NOMBRE_CATEGORIA: Record<CategoriaEquipo, string> = {
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
};

const ORDEN: readonly CategoriaEquipo[] = [
  'bateria', 'percusion', 'bajo', 'guitarra', 'teclado',
  'voz', 'viento', 'monitor', 'backline', 'utilidad',
];

/**
 * Paleta lateral con la biblioteca de equipos. Un tap agrega al centro del
 * lienzo (el usuario lo arrastra despues). Es la interaccion mas robusta para
 * mobile: en pantalla chica un drag entre paleta y lienzo se corta demasiado.
 */
export function Paleta() {
  const agregar = useProyecto((s) => s.agregarInstrumento);

  const agruparPorCategoria = () => {
    const grupos = new Map<CategoriaEquipo, typeof EQUIPOS[number][]>();
    for (const eq of EQUIPOS) {
      const g = grupos.get(eq.categoria) ?? [];
      g.push(eq);
      grupos.set(eq.categoria, g);
    }
    return grupos;
  };

  const grupos = agruparPorCategoria();

  return (
    <aside className="ma-paleta" aria-label="Biblioteca de equipos">
      {ORDEN.map((cat) => {
        const equipos = grupos.get(cat);
        if (!equipos?.length) return null;
        return (
          <section key={cat} className="ma-paleta__grupo">
            <h3>{NOMBRE_CATEGORIA[cat]}</h3>
            <div className="ma-paleta__grilla">
              {equipos.map((eq) => (
                <button
                  type="button"
                  key={eq.id}
                  className="ma-paleta__item"
                  onClick={() =>
                    agregar(eq.id, LIENZO.ancho / 2, LIENZO.alto / 2)
                  }
                  aria-label={`Agregar ${eq.nombre}`}
                  title={eq.nombre}
                >
                  <IconoEquipo equipo={eq} size={40} />
                  <span>{eq.nombre}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </aside>
  );
}
