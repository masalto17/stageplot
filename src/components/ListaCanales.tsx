import { useMemo } from 'react';
import { derivarCanales, useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

export function ListaCanales() {
  const instrumentos = useProyecto((s) => s.proyecto.instrumentos);
  const idioma = useProyecto((s) => s.idioma);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const canales = useMemo(() => derivarCanales(instrumentos, idioma), [instrumentos, idioma]);
  const t = UI[idioma];

  if (canales.length === 0) {
    return <div className="ma-canales ma-canales--vacio">{t.sinCanales}</div>;
  }

  return (
    <table className="ma-canales">
      <thead>
        <tr>
          <th>#</th>
          <th>{t.canales}</th>
          <th>{t.senal}</th>
          <th>{t.phantom}</th>
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
            <td>{t.senales[c.senal]}</td>
            <td>{c.phantom ? (idioma === 'es' ? 'Si' : 'Yes') : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
