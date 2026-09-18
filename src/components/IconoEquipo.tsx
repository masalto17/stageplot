import type { Equipo } from '@/icons/catalog';

interface Props {
  equipo: Equipo;
  /** Ancho del svg en px. Alto queda igual (viewBox cuadrado). */
  size?: number;
  seleccionado?: boolean;
}

/**
 * Renderiza el SVG inline de un equipo. Se usa tanto en la paleta (pequeno,
 * negro sobre blanco) como en el lienzo (mas grande, sobre chip blanco).
 * Todos los paths viven en viewBox 100x100.
 */
export function IconoEquipo({ equipo, size = 44, seleccionado = false }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={equipo.nombre}
      style={{
        color: seleccionado ? 'var(--ma-rojo)' : 'var(--ma-negro)',
        display: 'block',
      }}
    >
      {equipo.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.solido ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
