import { useMemo, useState, useEffect } from 'react';
import { derivarCanales, useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';
import { EQUIPOS_POR_ID, type TipoStand } from '@/icons/catalog';

const STANDS: readonly TipoStand[] = ['recto', 'boom', 'corto', 'clip', 'suelo', 'otro'];

/**
 * Input list editable. Cada fila es un canal derivado; los cambios se guardan
 * en `instrumento.overrides[indiceCanal]`. Las sugerencias por señal alimentan
 * el datalist del campo Mic/DI para autocompletar sin obligar.
 *
 * En pantallas anchas: tabla con columnas. En pantallas angostas: cards con
 * grid interno. La logica esta compartida en `EditorCanal`.
 */
export function ListaCanales() {
  const instrumentos = useProyecto((s) => s.proyecto.instrumentos);
  const idioma = useProyecto((s) => s.idioma);
  const seleccionar = useProyecto((s) => s.seleccionar);
  const [modoDetalle, setModoDetalle] = useState(true);
  const canales = useMemo(
    () => derivarCanales(instrumentos, idioma),
    [instrumentos, idioma],
  );
  const t = UI[idioma];

  if (canales.length === 0) {
    return <div className="ma-canales ma-canales--vacio">{t.sinCanales}</div>;
  }

  return (
    <div className={`ma-canales__contenedor${modoDetalle ? ' ma-canales--detalle' : ''}`}>
      <div className="ma-canales__barra">
        <label className="ma-canales__toggle">
          <input
            type="checkbox"
            checked={modoDetalle}
            onChange={(e) => setModoDetalle(e.target.checked)}
          />
          {t.toggleDetalles}
        </label>
      </div>

      <table className="ma-canales">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.canales}</th>
            <th>{t.senal}</th>
            <th>{t.phantom}</th>
            {modoDetalle && (
              <>
                <th>{t.fuente}</th>
                <th>{t.stand}</th>
                <th>{t.fase}</th>
                <th>{t.nota}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {canales.map((c) => (
            <FilaCanal
              key={`${c.instrumentoId}-${c.indiceCanal}`}
              canal={c}
              idioma={idioma}
              detalle={modoDetalle}
              onSeleccionar={() => seleccionar(c.instrumentoId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PropsFila {
  canal: ReturnType<typeof derivarCanales>[number];
  idioma: 'es' | 'en';
  detalle: boolean;
  onSeleccionar: () => void;
}

/**
 * Sugerencias de mic/DI segun la senal. Se ofrecen via `<datalist>`: el
 * usuario puede escribir cualquier cosa, pero encuentra los modelos comunes
 * tipeando "sm5" o "beta". Modelos de marca no se traducen.
 */
function sugerenciasMic(senal: string): string[] {
  switch (senal) {
    case 'micro':
      return [
        'SM57', 'SM58', 'Beta 52', 'Beta 58', 'Beta 91', 'e604', 'e906',
        'D6', 'D2', 'MD421', 'KM184', 'SM81', 'C414', 'DPA 4099',
      ];
    case 'linea':
      return ['DI activa', 'DI pasiva', 'Countryman Type 85', 'Radial J48'];
    case 'inalambrico':
      return ['SLX + SM58', 'QLX + Beta 58', 'ULX + Beta 87', 'Sennheiser EW'];
    case 'monitor':
      return [];
    default:
      return [];
  }
}

function FilaCanal({ canal, idioma, detalle, onSeleccionar }: PropsFila) {
  const setOverride = useProyecto((s) => s.setCanalOverride);
  const t = UI[idioma];
  const sugerencias = sugerenciasMic(canal.senal);
  const listaId = `mic-${canal.senal}`;
  const equipo = EQUIPOS_POR_ID.get(
    useProyecto
      .getState()
      .proyecto.instrumentos.find((i) => i.id === canal.instrumentoId)?.equipoId ?? '',
  );
  const template = equipo?.canales[canal.indiceCanal];

  // Nombre editable: se ancla al override; si vacio, el store lo interpreta
  // como "volver al sugerido" (que puede ser el nombre del template o el
  // prefijado con la etiqueta del instrumento).
  const [nombre, setNombre] = useState(canal.nombre);
  useEffect(() => setNombre(canal.nombre), [canal.nombre]);

  const patch = (parcial: Partial<{
    nombre: string; mic: string; stand: TipoStand | ''; phantom: boolean; fase: boolean; nota: string;
  }>) => {
    setOverride(canal.instrumentoId, canal.indiceCanal, {
      nombre: parcial.nombre,
      mic: parcial.mic,
      stand: parcial.stand === '' ? undefined : parcial.stand,
      phantom: parcial.phantom,
      fase: parcial.fase,
      nota: parcial.nota,
    });
  };

  return (
    <tr>
      <td className="ma-dato">{canal.numero}</td>
      <td>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => patch({ nombre })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          onClick={onSeleccionar}
          className="ma-canales__input"
          placeholder={template?.nombre[idioma] ?? ''}
        />
      </td>
      <td className="ma-dato">{t.senales[canal.senal]}</td>
      <td>
        <input
          type="checkbox"
          checked={canal.phantom}
          onChange={(e) => patch({ phantom: e.target.checked })}
          aria-label={t.phantom}
        />
      </td>
      {detalle && (
        <>
          <td>
            <input
              type="text"
              list={listaId}
              value={canal.mic}
              onChange={(e) => patch({ mic: e.target.value })}
              className="ma-canales__input"
              placeholder={template?.micDefault ?? ''}
            />
            {sugerencias.length > 0 && (
              <datalist id={listaId}>
                {sugerencias.map((s) => <option key={s} value={s} />)}
              </datalist>
            )}
          </td>
          <td>
            <select
              value={canal.stand}
              onChange={(e) => patch({ stand: (e.target.value as TipoStand | '') })}
              className="ma-canales__input"
            >
              <option value="">—</option>
              {STANDS.map((s) => (
                <option key={s} value={s}>{t.stands[s]}</option>
              ))}
            </select>
          </td>
          <td>
            <input
              type="checkbox"
              checked={canal.fase}
              onChange={(e) => patch({ fase: e.target.checked })}
              aria-label="Ø"
            />
          </td>
          <td>
            <input
              type="text"
              value={canal.nota}
              onChange={(e) => patch({ nota: e.target.value })}
              className="ma-canales__input ma-canales__input--nota"
              placeholder="—"
            />
          </td>
        </>
      )}
    </tr>
  );
}
