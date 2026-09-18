import { useMemo } from 'react';
import { derivarCanales, useProyecto } from '@/store/proyecto';

/**
 * Tabla de canales derivada del proyecto. Se actualiza sola con cada cambio
 * en `instrumentos`. Un click en una fila selecciona el instrumento en el
 * lienzo, para editar la etiqueta desde ahi.
 */
export function ListaCanales() {
  const instrumentos = useProyecto((s) => s.proyecto.instrumentos);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const canales = useMemo(() => derivarCanales(instrumentos), [instrumentos]);

  if (canales.length === 0) {
    return (
      <div className="ma-canales ma-canales--vacio">
        Todavia no hay canales. Agrega equipos al lienzo.
      </div>
    );
  }

  return (
    <table className="ma-canales">
      <thead>
        <tr>
          <th>#</th>
          <th>Canal</th>
          <th>Senal</th>
          <th>+48V</th>
        </tr>
      </thead>
      <tbody>
        {canales.map((c) => (
          <tr
            key={`${c.instrumentoId}-${c.numero}`}
            onClick={() => seleccionar(c.instrumentoId)}
          >
            <td className="ma-dato">{c.numero}</td>
            <td>{c.nombre}</td>
            <td>{traducir(c.senal)}</td>
            <td>{c.phantom ? 'Si' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function traducir(s: 'linea' | 'micro' | 'inalambrico' | 'monitor'): string {
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
