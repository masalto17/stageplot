import { useEffect, useState } from 'react';
import { useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';

const CLAVE = 'stageplot:onboarding-visto';

/**
 * Onboarding de 3 pasos, bilingue via el store. Se marca como visto en
 * localStorage; sin captura de email por decision del kickoff (captura
 * tardia y opcional; hoy no hay adonde llevarla).
 */
export function Onboarding() {
  const idioma = useProyecto((s) => s.idioma);
  const [visible, setVisible] = useState(false);
  const [paso, setPaso] = useState(0);
  const t = UI[idioma];

  const PASOS = [
    { titulo: t.agregarEquipos, texto: t.agregarEquiposDesc },
    { titulo: t.listaSeArma, texto: t.listaSeArmaDesc },
    { titulo: t.compartilo, texto: t.compartiloDesc },
  ];

  useEffect(() => {
    try {
      if (!localStorage.getItem(CLAVE)) setVisible(true);
    } catch {
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
    <div className="ma-modal" role="dialog" aria-modal="true" aria-label={actual.titulo}>
      <div className="ma-modal__caja">
        <p className="ma-modal__contador ma-dato">
          {paso + 1} / {PASOS.length}
        </p>
        <h2>{actual.titulo}</h2>
        <p>{actual.texto}</p>
        <div className="ma-modal__acciones">
          <button type="button" className="ma-boton ma-boton--secundario" onClick={cerrar}>
            {t.saltar}
          </button>
          <button
            type="button"
            className="ma-boton"
            onClick={() => (ultimo ? cerrar() : setPaso(paso + 1))}
          >
            {ultimo ? t.empezar : t.siguiente}
          </button>
        </div>
      </div>
    </div>
  );
}
