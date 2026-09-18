import type { Equipo } from '@/icons/catalog';
import type { Idioma } from '@/i18n/idioma';

interface Props {
  equipo: Equipo;
  size?: number;
  seleccionado?: boolean;
  idioma?: Idioma;
}

/**
 * Renderiza el SVG inline de un equipo. Se usa en la paleta (pequenio) y en
 * el lienzo (mas grande). Todos los paths viven en viewBox 0 0 100 100.
 *
 * Cada path elige un `modo`:
 *   - `linea` (default): solo trazo;
 *   - `suave`: fill translucido + trazo (da cuerpo sin dominar);
 *   - `solido`: fill full (acentos duros).
 */
export function IconoEquipo({ equipo, size = 44, seleccionado = false, idioma = 'es' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={equipo.nombre[idioma]}
      style={{
        color: seleccionado ? 'var(--ma-rojo)' : 'var(--ma-negro)',
        display: 'block',
      }}
    >
      {equipo.paths.map((p, i) => {
        const modo = p.modo ?? 'linea';
        const fill = modo === 'solido' ? 'currentColor' : modo === 'suave' ? 'currentColor' : 'none';
        const fillOpacity = modo === 'suave' ? 0.12 : 1;
        const stroke = modo === 'solido' ? 'none' : 'currentColor';
        return (
          <path
            key={i}
            d={p.d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={stroke}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
