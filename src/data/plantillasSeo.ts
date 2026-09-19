/**
 * Contenido SEO por plantilla de genero. Cada entrada alimenta la landing
 * `/plantillas/[genero]/`: resumen, descripcion larga, instrumentos, canales,
 * FAQ y palabras clave. Las FAQ pasan de 40 palabras por respuesta a proposito:
 * respuestas cortas no rankean como snippet.
 */
export interface EntradaFaq {
  pregunta: string;
  respuesta: string;
}

export interface EntradaPlantillaSeo {
  slug: 'rock' | 'solista' | 'dj' | 'folklore';
  nombre: string;
  h1: string;
  descripcion: string;
  lead: string;
  parrafos: readonly string[];
  cubre: readonly string[];
  incluye: readonly string[];
  canales: number;
  faq: readonly EntradaFaq[];
}

export const PLANTILLAS_SEO: Record<string, EntradaPlantillaSeo> = {
  rock: {
    slug: 'rock',
    nombre: 'Banda de rock',
    h1: 'Stage plot para banda de rock',
    descripcion:
      'Plantilla de stage plot para banda de rock argentina: bateria, bajo con DI, dos guitarras, teclado, voz y coros. Editas y exportas PDF en 5 minutos.',
    lead:
      'Setup clasico de banda de rock argentina, con los 18 instrumentos y 21 canales que un sonidista espera ver en un rider serio.',
    parrafos: [
      'Esta plantilla arma el escenario tipo de una banda de rock de 5 integrantes: bateria completa con overheads, bajo con DI y microfoneo del ampli, dos guitarras (una a cada lado del cantante), teclado stereo, cantante al centro al frente, dos coros a los lados y tres monitores de piso al frente. Cae bien para rock clasico, pop rock, indie, blues, punk y garage.',
      'El input list derivado suma 21 canales con el orden que un sonidista experimentado espera: bateria de abajo hacia arriba (kick, snares, hi-hat, toms, overheads, ride), luego bajo (DI + ampli), luego guitarras, luego teclado, luego voz y coros al final. Los overheads, hi-hat y ride vienen con +48V marcado; snare con dos canales para top y bottom; bajo con DI activa y ampli con Beta 52.',
      'La plantilla no es una imposicion. Es un punto de partida. Si vas con power trio saca los coros y una guitarra. Si tenes vientos o percusion adicional los agregas arrastrando desde la paleta. Los canales se re-numeran solos.',
    ],
    cubre: ['Rock clasico', 'Pop rock', 'Indie / alternativo', 'Blues rock', 'Punk / garage'],
    incluye: [
      'Bateria completa (bombo, redoblante, hi-hat, dos toms, tom de piso, overheads, ride)',
      'Bajo: DI + microfoneo del ampli (2 canales)',
      'Dos guitarras electricas (izquierda y derecha del cantante)',
      'Teclado stereo (2 canales)',
      'Voz principal + dos coros',
      'Tres monitores de piso al frente',
    ],
    canales: 21,
    faq: [
      {
        pregunta: '¿Sirve para power trio (bateria, bajo y una guitarra)?',
        respuesta:
          'Si. Abris la plantilla, seleccionas la segunda guitarra, el teclado y los dos coros con Shift+click y les das Eliminar. Queda un stage plot de power trio con 13 canales aproximados. El input list se ajusta solo. No hace falta empezar de cero.',
      },
      {
        pregunta: '¿Y si tengo dos teclados o un sintetizador extra?',
        respuesta:
          'Duplicas el icono de Teclado (Cmd/Ctrl + D o el boton Duplicar del panel de seleccion) y lo moves a la posicion del segundo teclado. Cada uno agrega sus dos canales (L y R) automaticamente. Si es un synth mono, arrastras "Synth mono" desde la paleta que suma un canal en vez de dos.',
      },
      {
        pregunta: '¿Como cambio los monitores de piso por in-ear?',
        respuesta:
          'Seleccionas los tres monitores en el lienzo (uno por uno con Shift+click o rodeandolos con un marquee), les das Eliminar, y despues arrastras el icono "In-ear" desde la seccion Monitores de la paleta al frente de cada musico. Los canales se ajustan de "Monitor" a "IEM" en el input list.',
      },
      {
        pregunta: '¿Que microfonos van con cada cosa?',
        respuesta:
          'La plantilla trae sugerencias por defecto: kick Beta 52 / D6, snare SM57, hi-hat y overheads SM81 o KM184, toms e604, amp de bajo Beta 52, amps de guitarra SM57, voz SM58 o Beta 58. Podes editarlos en la vista Canales del editor. Para entender el criterio, mira la guia sobre input lists.',
      },
      {
        pregunta: '¿Puedo agregar vientos o cuerdas si mi banda los tiene?',
        respuesta:
          'Si. La paleta tiene iconos para Trompeta, Saxo y Cuerdas (violin, cello). Los arrastras a la posicion del musico y cada uno agrega su canal con phantom power ya marcado. Si el musico usa mic de solapa DPA, editas el modelo en la columna Mic/DI.',
      },
    ],
  },
  solista: {
    slug: 'solista',
    nombre: 'Solista con guitarra',
    h1: 'Stage plot para solista con guitarra',
    descripcion:
      'Plantilla minima para singer-songwriter: voz + guitarra acustica + un monitor. 3 canales, PDF listo. Ideal para acustico en bares y peñas.',
    lead:
      'El setup mas simple posible: voz principal, guitarra acustica y un monitor de piso. Tres canales que el sonidista arma en 60 segundos.',
    parrafos: [
      'Esta plantilla cubre al 90% de los solistas acusticos: singer-songwriter, folk, boliches acusticos, unplugged en radios, presentaciones en peñas cortas. El planteo es mic vocal centrado al frente, guitarra acustica con DI activa (o mic si el show lo pide asi) y un monitor de piso al frente del musico.',
      'La plantilla en blanco es tentadora para un solista, pero no siempre gana. Una guitarra acustica sin DI dedicada tiende a colgarse porque el sonidista la termina buscando en el ampli inexistente. Marcar DI + fuente reconocida (Countryman, Fishman, DPA) desde el rider evita 10 minutos de confusion en el soundcheck.',
      'Si vas acompañado (cajon, percusion, otra voz), duplicas la plantilla desde la biblioteca de proyectos y le agregas los elementos por drag desde la paleta.',
    ],
    cubre: ['Singer-songwriter', 'Folk acustico', 'Boliches acusticos', 'Radios en vivo', 'Peñas cortas'],
    incluye: [
      'Voz principal (Microfono SM58 / Beta 58)',
      'Guitarra acustica (DI activa)',
      'Un monitor de piso',
    ],
    canales: 3,
    faq: [
      {
        pregunta: '¿Y si voy con guitarra electrica en vez de acustica?',
        respuesta:
          'Seleccionas la Guitarra acustica y le das Eliminar; despues arrastras "Ampli guitarra" desde la paleta a la posicion del musico. El canal cambia de linea a microfono (SM57 corto sugerido) y el input list se re-numera solo. Si vas con pedalera + DI, tambien esta como icono aparte.',
      },
      {
        pregunta: '¿Sumo cajon o percusion?',
        respuesta:
          'Arrastras "Cajon" o "Bongo" desde la seccion Percusion de la paleta hasta la posicion del percusionista. Cada uno agrega su canal con el mic sugerido (Beta 52 + SM57 para cajon, SM57 para bongo). El monitor lo duplicas o lo compartis segun el arreglo del escenario.',
      },
      {
        pregunta: '¿Sirve para un show con banda de acompañamiento chica?',
        respuesta:
          'Para dos personas mas si; para cuatro o mas conviene arrancar desde la plantilla Folklore o Banda de rock. Para un dueto (voz + guitarra + otra voz), duplicas el mic vocal, lo etiquetas como "Coro" o "Voz 2" y agregas un monitor mas. El input list queda en 5 canales.',
      },
      {
        pregunta: '¿Necesito phantom power para mi guitarra acustica?',
        respuesta:
          'Depende del pickup. Los pickups piezo activos y los microfonos internos (Fishman Matrix, LR Baggs, DPA 4099) piden phantom porque son activos. Los pasivos no. Si dudas, marca +48V en la columna del canal: enviarselo a un pasivo no rompe nada, pero no darselo a uno activo lo deja sin señal.',
      },
    ],
  },
  dj: {
    slug: 'dj',
    nombre: 'Set de DJ',
    h1: 'Stage plot para set de DJ',
    descripcion:
      'Plantilla para set de DJ + MC: cabina, mic de MC, L/R a FOH, dos monitores y un in-ear. Rider listo para festivales electronicos y boliches.',
    lead:
      'Cabina + microfono de MC + monitoreo. Cinco canales que cubren el 90% de los sets de DJ en boliches y festivales medianos.',
    parrafos: [
      'Esta plantilla arma un stage plot tipico para un DJ set con MC. La cabina va centrada al fondo del escenario. Salidas L/R del mixer del DJ (no de cada CDJ individual) van por DI o directo a FOH. El MC va al frente con un mic vocal. Al musico le tiras dos monitores al frente y un in-ear atras por si prefiere IEM.',
      'Sirve para: electronica en boliches, sets de house, techno o dnb en festivales medianos, hip hop con MC, presentaciones en clubes. En festivales grandes, la produccion suele tener un patch dedicado para cada CDJ, pero para el 80% de los shows en Argentina esta plantilla es el punto de partida correcto.',
      'Si trabajas back-to-back con otro DJ, duplicas la cabina. Si el show es solo instrumental (sin MC), borras el mic vocal. Los canales se re-numeran solos.',
    ],
    cubre: ['DJ set en boliches', 'Festivales electronicos', 'Sets de house / techno', 'Sets con MC de hip hop', 'B2B'],
    incluye: [
      'Cabina DJ (L y R por linea, DI activa)',
      'Microfono de MC (SM58 / Beta 58)',
      'Dos monitores de piso al frente de la cabina',
      'Un in-ear opcional',
    ],
    canales: 5,
    faq: [
      {
        pregunta: '¿Como conecto los CDJ o el vinilo?',
        respuesta:
          'La salida al PA sale del mixer del DJ (Pioneer DJM, Allen & Heath Xone, Rane, etc.), no de cada CDJ individual. Vos podes tener 2, 3 o 4 fuentes conectadas al mixer, pero al sonidista le entran dos canales: L y R del mixer. En rider profesional no se lista cada CDJ.',
      },
      {
        pregunta: '¿Y si tengo un B2B (back-to-back con otro DJ)?',
        respuesta:
          'Duplicas la cabina desde la paleta o desde el panel de seleccion. Dos cabinas, cada una con su L y su R. Total 4 canales de linea a FOH mas el mic del MC si hay. Si comparten mixer, no duplicas: sigue siendo un solo par L/R.',
      },
      {
        pregunta: '¿Necesito el in-ear si ya tengo monitores?',
        respuesta:
          'Depende del DJ. Muchos productores prefieren los monitores de piso para "sentir" el bombo; otros prefieren solo in-ear para tener un mix limpio sin contaminacion. Dejar los dos permitidos en el stage plot da flexibilidad; el sonidista te pone lo que uses en el momento.',
      },
      {
        pregunta: '¿Que pasa con el phantom power en la cabina?',
        respuesta:
          'Las salidas de un mixer de DJ son de linea (no de micro), asi que NO necesitan phantom. Si mandas por DI activa, la DI si lo pide. Marcalo con criterio en el input list: la mayoria de los DJ mixers salen a linea directo y no hay DI de por medio.',
      },
      {
        pregunta: '¿Como agrego un cantante en vivo sobre el set?',
        respuesta:
          'Arrastras "Microfono vocal" o "Microfono inalambrico" desde la paleta a la posicion del cantante. Si vas por wireless (mas comun en electronica), edita el canal como Inalambrico y suma la nota "SLX + SM58" o el sistema que uses.',
      },
    ],
  },
  folklore: {
    slug: 'folklore',
    nombre: 'Folklore',
    h1: 'Stage plot para folklore argentino',
    descripcion:
      'Plantilla para folklore argentino: dos voces, dos guitarras acusticas, bongo y cajon con dos monitores. Cubre chacarera, zamba y peña.',
    lead:
      'Formacion tipica de peña: dos voces, dos guitarras acusticas y percusion (bongo, cajon). Ocho canales que cubren el 80% del folklore argentino que se toca en vivo.',
    parrafos: [
      'Esta plantilla arma un stage plot para el formato mas comun de folklore argentino que se ve en peñas, festivales chicos y programas de radio: dos voces principales al frente, dos guitarras acusticas atras de las voces (una a cada lado), un bongo al fondo izquierdo, un cajon al fondo derecho, y dos monitores al frente. Sirve para chacarera, zamba, carnavalito, huayno, milonga, malambo y todo el repertorio de peña.',
      'Las guitarras acusticas van por linea con DI activa. Las voces por SM58 con boom, para no invadir el espacio de las guitarras. Cajon con dos capsulas (Beta 52 para el golpe grave, SM57 para el ataque agudo). Bongo con SM57. Total 8 canales, dos monitores, y podes armar el PDF para el sonidista en 3 minutos.',
      'Para formaciones mas grandes (con bombo legüero, quena, charango, violin, contrabajo), la plantilla es el andamio: agregas los instrumentos por drag desde la paleta y la lista de canales crece sola.',
    ],
    cubre: ['Chacarera y zamba', 'Peña folklorica', 'Carnavalito y huayno', 'Milonga y malambo', 'Folklore fusion'],
    incluye: [
      'Dos voces (SM58 boom, Voz 1 y Voz 2)',
      'Dos guitarras acusticas (DI activa)',
      'Bongo (SM57 boom)',
      'Cajon (Beta 52 + SM57 en el suelo)',
      'Dos monitores al frente',
    ],
    canales: 8,
    faq: [
      {
        pregunta: '¿Como sumo el bombo legüero?',
        respuesta:
          'Arrastras "Bombo" de la paleta (esta en la seccion Bateria) a la posicion del bombista y editas el mic sugerido de Beta 52 a e604 o Beta 91A segun preferencia. Un bombo legüero en un rider profesional va con clip mic (e604) para que el musico se mueva sin problema.',
      },
      {
        pregunta: '¿Y si mi grupo tiene charango, quena o vientos?',
        respuesta:
          'Para charango podes usar el icono de guitarra acustica y renombrarlo en el input list (etiqueta "Charango", DI activa). Para quena, siku o zampoña, arrastra "Trompeta" y edita el modelo del mic a un condensador tipo DPA 4099 con clip. Los vientos folkloricos van con phantom.',
      },
      {
        pregunta: '¿Que microfonos son estandar para cajon?',
        respuesta:
          'El cajon tipico va con dos capsulas: una en el hueco de atras (Beta 52, D6 o SM7B) para captar el golpe grave del parche frontal, y una en el frente (SM57 o Beta 91A) para el ataque agudo. En bandas chicas usan solo un Beta 52 al fondo. La plantilla trae el setup de dos por defecto.',
      },
      {
        pregunta: '¿Como se ordena un stage plot con violin?',
        respuesta:
          'Arrastras "Cuerdas" desde la seccion Vientos y cuerdas de la paleta. El violin va cerca del cantante principal para que el mixer los balancee juntos. El mic sugerido es DPA 4099 con clip; si el violinista trae su propio contact mic, edita la nota en el canal.',
      },
      {
        pregunta: '¿Sirve para grupos grandes (murga, comparsa)?',
        respuesta:
          'Como base si, pero probablemente termines con 15 a 20 canales. Duplicas el proyecto desde la biblioteca y agregas percusion (bombo, redoblante, platillos), mas voces (dos o tres coros mas) y un tercer monitor. La plantilla te ahorra 10 minutos de setup base.',
      },
    ],
  },
};

export const SLUGS_PLANTILLA_SEO: readonly string[] = Object.keys(PLANTILLAS_SEO);
