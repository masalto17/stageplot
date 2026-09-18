import { useEffect, useRef, useState } from 'react';
import { BarraSuperior } from './BarraSuperior';
import { Paleta } from './Paleta';
import { Lienzo } from './Lienzo';
import { PanelSeleccion } from './PanelSeleccion';
import { ListaCanales } from './ListaCanales';
import { Onboarding } from './Onboarding';
import { ControlesLienzo } from './ControlesLienzo';
import { hidratarProyecto, iniciarAutoguardado } from '@/store/persistencia';
import { useProyecto } from '@/store/proyecto';
import { plantillaBanda, plantillaPorSlug } from '@/lib/plantilla';
import { decodificarProyecto, reidentificar } from '@/lib/compartirLink';
import { guardarProyectoNuevo } from '@/store/persistencia';
import { useAtajos } from '@/hooks/useAtajos';
import { UI } from '@/i18n/idioma';

/**
 * Root del editor. Cicla:
 *  1. Si el URL tiene `#p=<slug>`, carga esa plantilla (gana sobre lo persistido).
 *  2. Sino, hidrata de IndexedDB.
 *  3. Si tampoco hay nada persistido, precarga la plantilla banda.
 *  4. Arranca el autoguardado.
 */
export default function StagePlotApp() {
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState<'plano' | 'canales'>('plano');
  const lienzoRef = useRef<HTMLDivElement>(null);
  const cargar = useProyecto((s) => s.cargarProyecto);
  const idioma = useProyecto((s) => s.idioma);
  const t = UI[idioma];

  useEffect(() => {
    let desuscribir: (() => void) | undefined;
    (async () => {
      // Prioridad: link compartido > slug plantilla > proyecto persistido.
      // El link se importa como PROYECTO NUEVO, con ids frescos: no
      // sobreescribe lo que el receptor tenia guardado.
      const proyectoDelLink = leerProyectoDelLink();
      if (proyectoDelLink) {
        await guardarProyectoNuevo(reidentificar(proyectoDelLink));
        history.replaceState(null, '', location.pathname);
      } else {
        const hashPlantilla = leerHashPlantilla();
        if (hashPlantilla) {
          const proyecto = plantillaPorSlug(hashPlantilla);
          if (proyecto) cargar(proyecto);
          else {
            const habia = await hidratarProyecto();
            if (!habia) cargar(plantillaBanda());
          }
          history.replaceState(null, '', location.pathname);
        } else {
          const habia = await hidratarProyecto();
          if (!habia) cargar(plantillaBanda());
        }
      }
      desuscribir = iniciarAutoguardado();
      setListo(true);
    })();
    return () => {
      desuscribir?.();
    };
  }, [cargar]);

  useAtajos();

  if (!listo) {
    return (
      <div className="ma-editor__cargando">
        <p className="ma-dato">{t.cargando}</p>
      </div>
    );
  }

  return (
    <div className="ma-editor">
      <BarraSuperior lienzoRef={lienzoRef} />

      <div className="ma-editor__cuerpo">
        <Paleta />

        <div className="ma-editor__centro">
          <nav className="ma-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'plano'}
              className={`ma-tabs__item${tab === 'plano' ? ' ma-tabs__item--activo' : ''}`}
              onClick={() => setTab('plano')}
            >
              {t.plano}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'canales'}
              className={`ma-tabs__item${tab === 'canales' ? ' ma-tabs__item--activo' : ''}`}
              onClick={() => setTab('canales')}
            >
              {t.canales}
            </button>
            <ControlesLienzo />
          </nav>

          {/*
            El lienzo se mantiene montado siempre; se oculta con `display` para
            no interferir con la tab de canales, pero html2canvas necesita
            medirlo, asi que se apoya en un elemento DIV separado que se
            imprime al PDF.
          */}
          <div
            className="ma-editor__panel"
            style={{ display: tab === 'plano' ? 'block' : 'none' }}
          >
            <div ref={lienzoRef}>
              <Lienzo />
            </div>
          </div>

          {tab === 'canales' && (
            <div className="ma-editor__panel ma-editor__panel--canales">
              <ListaCanales />
            </div>
          )}
        </div>

        <PanelSeleccion />
      </div>

      <Onboarding />
    </div>
  );
}

/** Extrae `p=<slug>` del hash del URL, si existe. */
function leerHashPlantilla(): string | null {
  if (typeof location === 'undefined') return null;
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get('p');
}

/** Decodifica un proyecto de `#e=<base64>` si existe. */
function leerProyectoDelLink() {
  if (typeof location === 'undefined') return null;
  return decodificarProyecto(location.hash);
}
