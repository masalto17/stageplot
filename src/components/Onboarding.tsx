import { useEffect, useState } from 'react';

const CLAVE = 'stageplot:onboarding-visto';

interface Paso {
  titulo: string;
  texto: string;
}

const PASOS: readonly Paso[] = [
  {
    titulo: 'Agrega equipos',
    texto:
      'Toca un icono de la biblioteca para sumarlo al escenario. Arrastra para moverlo.',
  },
  {
    titulo: 'La lista se arma sola',
    texto:
      'Cada equipo agrega sus canales automaticamente. Editas el nombre desde el panel de seleccion.',
  },
  {
    titulo: 'Compartilo',
    texto:
      'Cuando termines, exporta el PDF y mandalo por WhatsApp o mail al sonidista.',
  },
];

/**
 * Onboarding de tres pasos. Se muestra la primera vez y se marca como visto en
 * localStorage. No captura email ni datos: fue una decision explicita del
 * kickoff (captura tardia y opcional).
 */
export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CLAVE)) setVisible(true);
    } catch {
      // localStorage bloqueado (Safari privado): mostramos igual, sin persistir.
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, '1');
    } catch { /* no-op */ }
    setVisible(false);
  };

  const actual = PASOS[paso]!;
  const ultimo = paso === PASOS.length - 1;

  return (
    <div className="ma-onboarding" role="dialog" aria-modal="true" aria-label={actual.titulo}>
      <div className="ma-onboarding__caja">
        <p className="ma-onboarding__contador ma-dato">
          {paso + 1} / {PASOS.length}
        </p>
        <h2>{actual.titulo}</h2>
        <p>{actual.texto}</p>
        <div className="ma-onboarding__acciones">
          <button type="button" className="ma-boton ma-boton--secundario" onClick={cerrar}>
            Saltar
          </button>
          <button
            type="button"
            className="ma-boton"
            onClick={() => (ultimo ? cerrar() : setPaso(paso + 1))}
          >
            {ultimo ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
