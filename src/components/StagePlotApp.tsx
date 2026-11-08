import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
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
  const [aviso, setAviso] = useState<string | null>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const tabPlanoRef = useRef<HTMLButtonElement>(null);
  const tabCanalesRef = useRef<HTMLButtonElement>(null);
  const cargar = useProyecto((s) => s.cargarProyecto);
  const idioma = useProyecto((s) => s.idioma);
  const t = UI[idioma];

  useEffect(() => {
    document.documentElement.lang = idioma === 'es' ? 'es-AR' : 'en';
  }, [idioma]);

  useEffect(() => {
    let desuscribir: (() => void) | undefined;
    let cancelado = false;

    const mostrarAvisoPendiente = () => {
      const avisoSesion = leerAvisoSesion();
      const copy = UI[useProyecto.getState().idioma];
      if (avisoSesion === 'importado') setAviso(copy.proyectoImportado);
      else if (avisoSesion === 'invalido') setAviso(copy.linkInvalido);
    };

    /** Aplica `#e=` / `#p=` si el hash cambio con el editor ya montado. */
    const aplicarHash = async () => {
      const hashTieneLink = hashTieneParametro('e');
      const proyectoDelLink = leerProyectoDelLink();
      const hashPlantilla = leerHashPlantilla();
      if (!hashTieneLink && !hashPlantilla) return;

      if (proyectoDelLink) {
        await guardarProyectoNuevo(reidentificar(proyectoDelLink));
        history.replaceState(null, '', location.pathname);
        marcarAvisoSesion('importado');
      } else if (hashTieneLink) {
        history.replaceState(null, '', location.pathname);
        marcarAvisoSesion('invalido');
      } else if (hashPlantilla) {
        const proyecto = plantillaPorSlug(hashPlantilla);
        if (proyecto) cargar(proyecto);
        history.replaceState(null, '', location.pathname);
      }
      if (!cancelado) mostrarAvisoPendiente();
    };

    (async () => {
      // Prioridad: link compartido > slug plantilla > proyecto persistido.
      // El link se importa como PROYECTO NUEVO, con ids frescos: no
      // sobreescribe lo que el receptor tenia guardado.
      const hashTieneLink = hashTieneParametro('e');
      const proyectoDelLink = leerProyectoDelLink();
      if (proyectoDelLink) {
        await guardarProyectoNuevo(reidentificar(proyectoDelLink));
        history.replaceState(null, '', location.pathname);
        marcarAvisoSesion('importado');
      } else if (hashTieneLink) {
        history.replaceState(null, '', location.pathname);
        const habia = await hidratarProyecto();
        if (!habia) cargar(plantillaBanda());
        marcarAvisoSesion('invalido');
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
      if (cancelado) return;
      desuscribir = iniciarAutoguardado();
      mostrarAvisoPendiente();
      setListo(true);
    })();

    window.addEventListener('hashchange', aplicarHash);
    return () => {
      cancelado = true;
      desuscribir?.();
      window.removeEventListener('hashchange', aplicarHash);
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

  const cambiarTab = (siguiente: 'plano' | 'canales') => {
    setTab(siguiente);
    const destino = siguiente === 'plano' ? tabPlanoRef : tabCanalesRef;
    requestAnimationFrame(() => destino.current?.focus());
  };

  const onTabKey = (evento: KeyboardEvent, cual: 'plano' | 'canales') => {
    if (evento.key === 'ArrowRight' || evento.key === 'ArrowLeft') {
      evento.preventDefault();
      cambiarTab(cual === 'plano' ? 'canales' : 'plano');
    }
  };

  return (
    <div className="ma-editor">
      <BarraSuperior lienzoRef={lienzoRef} />

      {aviso && (
        <p className="ma-editor__aviso" role="status">
          <span>{aviso}</span>
          <button
            type="button"
            className="ma-boton-icono"
            onClick={() => {
              limpiarAvisoSesion();
              setAviso(null);
            }}
            aria-label={t.cerrarPanel}
          >
            x
          </button>
        </p>
      )}

      <div className="ma-editor__cuerpo">
        <Paleta />

        <div className="ma-editor__centro">
          <div className="ma-tabs">
            <div className="ma-tabs__list" role="tablist" aria-label={t.plano}>
              <button
                ref={tabPlanoRef}
                type="button"
                role="tab"
                id="tab-plano"
                aria-controls="panel-plano"
                aria-selected={tab === 'plano'}
                tabIndex={tab === 'plano' ? 0 : -1}
                className={`ma-tabs__item${tab === 'plano' ? ' ma-tabs__item--activo' : ''}`}
                onClick={() => setTab('plano')}
                onKeyDown={(e) => onTabKey(e, 'plano')}
              >
                {t.plano}
              </button>
              <button
                ref={tabCanalesRef}
                type="button"
                role="tab"
                id="tab-canales"
                aria-controls="panel-canales"
                aria-selected={tab === 'canales'}
                tabIndex={tab === 'canales' ? 0 : -1}
                className={`ma-tabs__item${tab === 'canales' ? ' ma-tabs__item--activo' : ''}`}
                onClick={() => setTab('canales')}
                onKeyDown={(e) => onTabKey(e, 'canales')}
              >
                {t.canales}
              </button>
            </div>
            <ControlesLienzo />
          </div>

          {/*
            El lienzo se mantiene montado siempre; se oculta con `display` para
            no interferir con la tab de canales. El export PDF lo muestra
            fuera de pantalla un instante porque html2canvas no mide display:none.
          */}
          <div
            className="ma-editor__panel"
            id="panel-plano"
            role="tabpanel"
            aria-labelledby="tab-plano"
            aria-hidden={tab !== 'plano'}
            style={{ display: tab === 'plano' ? 'block' : 'none' }}
          >
            <div ref={lienzoRef}>
              <Lienzo />
            </div>
          </div>

          {tab === 'canales' && (
            <div
              className="ma-editor__panel ma-editor__panel--canales"
              id="panel-canales"
              role="tabpanel"
              aria-labelledby="tab-canales"
            >
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

function hashTieneParametro(clave: string): boolean {
  if (typeof location === 'undefined') return false;
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return false;
  return new URLSearchParams(hash).has(clave);
}

const CLAVE_AVISO = 'stageplot:aviso-url';
type AvisoUrl = 'importado' | 'invalido';

function marcarAvisoSesion(tipo: AvisoUrl): void {
  try {
    sessionStorage.setItem(CLAVE_AVISO, tipo);
  } catch { /* no-op */ }
}

function leerAvisoSesion(): AvisoUrl | null {
  try {
    const v = sessionStorage.getItem(CLAVE_AVISO);
    if (v === 'importado' || v === 'invalido') return v;
  } catch { /* no-op */ }
  return null;
}

function limpiarAvisoSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE_AVISO);
  } catch { /* no-op */ }
}

/** Decodifica un proyecto de `#e=<base64>` si existe. */
function leerProyectoDelLink() {
  if (typeof location === 'undefined') return null;
  return decodificarProyecto(location.hash);
}
