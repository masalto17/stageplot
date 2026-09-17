/**
 * Isla React del editor. En B1 solo monta y confirma que el runtime arranca
 * sin errores de consola; la logica (Zustand, canvas, canales) llega en B2.
 */
export default function StagePlotApp() {
  return (
    <section className="ma-contenedor" style={{ padding: '40px 20px' }}>
      <h1>Editor</h1>
      <p className="ma-dato">Setup B1 OK. Lienzo y canales: B2.</p>
    </section>
  );
}
