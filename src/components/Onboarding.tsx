import { useEffect, useState } from 'react';
import { useProyecto } from '@/store/proyecto';
import { UI } from '@/i18n/idioma';
import { useDialogo } from '@/hooks/useDialogo';

const CLAVE = 'stageplot:onboarding-visto';

/**
 * Onboarding de 3 pasos, bilingue via el store. Se marca como visto en
 * localStorage; sin captura de email por decision del kickoff (captura
 * tardia y opcional; hoy no hay adonde llevarla).
 */
export function Onboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CLAVE)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, '1');
    } catch { /* no-op */ }
    setVisible(false);
  };

  if (!visible) return null;
  return <CajaOnboarding onCerrar={cerrar} />;
}

function CajaOnboarding({ onCerrar }: { onCerrar: () => void }) {
  const idioma = useProyecto((s) => s.idioma);
  const [paso, setPaso] = useState(0);
  const t = UI[idioma];
  const cajaRef = useDialogo(onCerrar);

  const PASOS = [
    { titulo: t.agregarEquipos, texto: t.agregarEquiposDesc },
    { titulo: t.listaSeArma, texto: t.listaSeArmaDesc },
    { titulo: t.compartilo, texto: t.compartiloDesc },
  ];

  const actual = PASOS[paso]!;
  const ultimo = paso === PASOS.length - 1;

  return (
    <div className="ma-modal" role="dialog" aria-modal="true" aria-labelledby="ma-onboarding-titulo">
      <div className="ma-modal__caja" ref={cajaRef} tabIndex={-1}>
        <p className="ma-modal__contador ma-dato">
          {paso + 1} / {PASOS.length}
        </p>
        <h2 id="ma-onboarding-titulo">{actual.titulo}</h2>
        <p>{actual.texto}</p>
        <div className="ma-modal__acciones">
          <button type="button" className="ma-boton ma-boton--secundario" onClick={onCerrar}>
            {t.saltar}
          </button>
          <button
            type="button"
            className="ma-boton"
            onClick={() => (ultimo ? onCerrar() : setPaso(paso + 1))}
          >
            {ultimo ? t.empezar : t.siguiente}
          </button>
        </div>
      </div>
    </div>
  );
}
