import { useEffect, useRef, useState } from 'react';
import { BarraSuperior } from './BarraSuperior';
import { Paleta } from './Paleta';
import { Lienzo } from './Lienzo';
import { PanelSeleccion } from './PanelSeleccion';
import { ListaCanales } from './ListaCanales';
import { Onboarding } from './Onboarding';
import { hidratarProyecto, iniciarAutoguardado } from '@/store/persistencia';
import { useProyecto } from '@/store/proyecto';
import { plantillaBanda, plantillaPorSlug } from '@/lib/plantilla';
import { useAtajos } from '@/hooks/useAtajos';

/**
 * Root del editor. Se encarga del ciclo de vida:
 *  1. Intenta hidratar el proyecto desde IndexedDB.
 *  2. Si no habia nada, precarga la plantilla banda.
 *  3. Arranca el autoguardado.
 */
export default function StagePlotApp() {
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState<'plano' | 'canales'>('plano');
  const lienzoRef = useRef<HTMLDivElement>(null);
  const cargar = useProyecto((s) => s.cargarProyecto);

  useEffect(() => {
    let desuscribir: (() => void) | undefined;
    (async () => {
      // Plantilla venida del hash gana sobre lo persistido: la landing por
      // genero acaba de mandar al usuario aca justamente para partir de esa.
      const hashPlantilla = leerHashPlantilla();
      if (hashPlantilla) {
        const proyecto = plantillaPorSlug(hashPlantilla);
        if (proyecto) cargar(proyecto);
        else {
          const habia = await hidratarProyecto();
          if (!habia) cargar(plantillaBanda());
        }
        // Limpiamos el hash: un F5 no debe reimponer la plantilla.
        history.replaceState(null, '', location.pathname);
      } else {
        const habia = await hidratarProyecto();
        if (!habia) cargar(plantillaBanda());
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
        <p className="ma-dato">Cargando...</p>
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
              Plano
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'canales'}
              className={`ma-tabs__item${tab === 'canales' ? ' ma-tabs__item--activo' : ''}`}
              onClick={() => setTab('canales')}
            >
              Canales
            </button>
          </nav>

          {/*
            El lienzo se mantiene montado siempre (aunque este oculto) porque
            html2canvas necesita medir su tamano real para el PDF. Se oculta
            con visibility, no con display, para conservar layout.
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
            <div className="ma-editor__panel">
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
