// Tipos de "index.js" (TODAS las funciones combinadas en un solo
// <script>), generados automáticamente — no editar a mano. Sin ningún
// import/export a propósito: TypeScript trata este archivo como un
// script ambiental, así que sus declaraciones quedan disponibles
// globalmente con solo incluirlo (ej. en "include"/"files" del
// tsconfig del libro), sin necesidad de "import".

// Tipos compartidos por TODAS las funciones del catálogo — generado
// automáticamente, no editar a mano.
//
// Igual que los .d.ts de cada función, este archivo NO tiene ningún
// import/export: es un script ambiental, así que basta con incluirlo (ej.
// en "include"/"files" del tsconfig del libro) para que quede disponible
// en todo el proyecto sin necesidad de "import".

/** Identifica una actividad ya existente en el HTML del libro (ver utilidades/contenedor.ts del proyecto de funciones). */
type IdentificadorActividad = number | string | HTMLElement;

// --- coevaluacion ---
/**
 * ============================================================================
 *  Coevaluación
 * ============================================================================
 *
 * ¿Qué hace?
 * La típica tabla de autoevaluación/coevaluación: una lista de criterios y,
 * por cada uno, tres columnas — "Sí", "No" y "DM" (Debo Mejorar) — de las
 * que el estudiante marca UNA sola por fila (como un radio button).
 *
 * Estándar de calificación (no es ni Sistema A ni Sistema B — aquí no hay
 * una respuesta "correcta": las 3 opciones son válidas, pero valen distinto
 * según qué tan bien se cumplió el criterio): cada criterio vale 1/total.
 * Marcar "Sí" da el valor COMPLETO de ese criterio; marcar "No" da un valor
 * REDUCIDO (por defecto la mitad); marcar "DM" da un valor todavía más
 * chico (por defecto un cuarto) — pero NUNCA 0. Dejar una fila sin marcar
 * sí da 0 en esa fila (es la única forma de no sumar nada).
 *   nota = Σ(peso de lo marcado en cada fila) / total, sin bajar de 0
 * Ejemplo con 5 criterios (cada uno vale 0.2): 4 en "Sí" (0.2 cada uno) y 1
 * en "No" (0.1, la mitad de 0.2) → (4×0.2 + 0.1) / 5 = 0.18.
 *
 * `pesos` (opcional) cambia esas fracciones por defecto ({ si: 1, no: 0.5,
 * dm: 0.25 }) — son fracciones del valor completo de un criterio, no
 * valores absolutos.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p><strong>Evalúa</strong> tu trabajo según los criterios y <strong>completa</strong> la tabla.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCoevaluacion(1, {
 *       criterios: [
 *         'El modelo representa correctamente la propuesta atómica asignada.',
 *         'La exposición evidencia la evolución histórica de los modelos atómicos.',
 *         'Los materiales fueron utilizados con creatividad, seguridad y responsabilidad.',
 *         'Todos los integrantes participaron activamente en la elaboración y presentación.',
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearCoevaluacion` devuelve una instancia con:
 *   - revisar(): califica, escribe la nota en el input (si aplica) y
 *     devuelve el resultado. "correctas" es cuántos criterios se marcaron
 *     en "Sí" (no hay "incorrectas" como tal, ver arriba).
 *   - obtenerResultado(): igual que revisar() pero sin escribir nada.
 *   - reiniciar(): borra todas las marcas, deja la tabla en blanco.
 * ============================================================================
 */
type RespuestaCoevaluacion = 'si' | 'no' | 'dm';
interface PesosCoevaluacion {
    /** Fracción del valor del criterio al marcar "Sí". Por defecto 1 (completo). */
    si?: number;
    /** Fracción del valor del criterio al marcar "No". Por defecto 0.5. */
    no?: number;
    /** Fracción del valor del criterio al marcar "DM". Por defecto 0.25. Nunca debería ser 0. */
    dm?: number;
}
interface CoevaluacionDatos {
    /** Cada criterio admite HTML (se inserta con innerHTML, no como texto plano). */
    criterios: string[];
    pesos?: PesosCoevaluacion;
}
interface CoevaluacionResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CoevaluacionInstancia {
    revisar(): CoevaluacionResultado;
    obtenerResultado(): CoevaluacionResultado;
    reiniciar(): void;
}
declare function crearCoevaluacion(id: IdentificadorActividad, datos: CoevaluacionDatos, puntaje?: number): CoevaluacionInstancia;

// --- completarTabla ---
/**
 * ============================================================================
 *  Completar tabla
 * ============================================================================
 *
 * ¿Qué hace?
 * Arma una tabla real (columnas con encabezado, celdas divididas por
 * líneas) donde algunas celdas son campos de texto que el estudiante llena
 * y otras son etiquetas fijas (no editables) que solo dan estructura —
 * por ejemplo una fila de "Total" al final de una columna de números.
 *
 * Cada columna es `{ titulo?, celdas, ancho?, alineacionHorizontal?,
 * alineacionVertical? }`. Cada celda de `celdas` es:
 *   - un string o número -> un campo de texto cuya respuesta correcta es
 *     ese valor.
 *   - `{ etiqueta: 'texto' }` -> una celda fija, no editable, que no se
 *     califica (sirve para nombres de fila, un "Total", etc.).
 *
 * `columna.alineacionHorizontal` ('izquierda' | 'centro' | 'derecha', por
 * defecto 'centro') y `columna.alineacionVertical` ('arriba' | 'centro' |
 * 'abajo', por defecto 'centro') controlan dónde queda el texto dentro de
 * cada celda de esa columna (etiquetas y campos) — el reemplazo de lo que
 * antes se hacía a mano con un objeto "styles". La vertical no tiene efecto
 * en columnas "multilinea" (el <textarea> siempre llena el alto disponible
 * para poder crecer con el texto).
 *
 * `datos.aleatorio` (por defecto true) baraja el ORDEN DE LAS FILAS (todas
 * las columnas a la vez, para no romper la alineación) — las filas que
 * tienen una etiqueta en cualquier columna se quedan fijas en su lugar
 * (para que un "Total" no termine flotando en medio de la tabla) y solo se
 * reordenan entre sí las filas de puro campo de texto. La calificación
 * nunca depende del orden.
 *
 * `datos.multilinea` (por defecto false) usa `<textarea>` en vez de
 * `<input>` y ajusta automáticamente el alto de toda la fila (en todas las
 * columnas a la vez) al contenido más alto, para que ninguna celda se vea
 * cortada. Ese alto se vuelve a calcular cada vez que cambia el ANCHO real
 * de la tabla (un `ResizeObserver` sobre el contenedor) y también justo
 * antes de imprimir (`beforeprint`) — el ancho de la página impresa casi
 * nunca es igual al del navegador, así que el mismo texto puede envolver en
 * más líneas y el alto guardado en pantalla se queda corto. El
 * `ResizeObserver` es la defensa principal: reacciona a CUALQUIER cambio de
 * ancho sin importar la causa, así que también cubre exportadores a PDF que
 * arman la página con un navegador de verdad pero sin pasar por
 * `window.print()` (donde `beforeprint` nunca se dispara).
 *
 * Estándar de calificación (Sistema A — cada celda ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada campo de texto vale 1/total. Acertarlo (texto
 * normalizado: sin importar mayúsculas, tildes ni espacios, estén donde
 * estén) suma 1/total; escribir algo distinto resta solo la MITAD de eso
 * ((1/total)/2); dejarlo en blanco no suma ni resta (pero sigue pintándose como
 * incorrecto). `nota = (correctas − incorrectas/2) / total`, sin bajar de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * La tabla siempre ocupa el 100% del ancho disponible: la función le fuerza
 * `width: 100%` al propio contenedor (el div del "id"), y cada columna se
 * dimensiona en PORCENTAJE del total (nunca en px con scroll horizontal) —
 * si no le das `ancho`, reparte el espacio parejo con las demás columnas
 * sin `ancho`. Esto es a propósito: un scroll horizontal se ve bien en
 * pantalla, pero al imprimir el libro no hay forma de "deslizar" y el
 * contenido que no cabe en el ancho de la página se corta — por eso esta
 * tabla nunca depende de scroll, ni siquiera en mobile (el texto largo se
 * envuelve dentro de su celda en vez de ensanchar la columna).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa el símbolo químico de cada elemento.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCompletarTabla(1, {
 *       columnas: [
 *         { titulo: 'Elemento', celdas: [{ etiqueta: 'Hidrógeno' }, { etiqueta: 'Oxígeno' }, { etiqueta: 'Carbono' }] },
 *         { titulo: 'Símbolo', celdas: ['H', 'O', 'C'] },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearCompletarTabla` devuelve una instancia con:
 *   - revisar(): califica, pinta cada campo (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito y el feedback, deja todo en blanco.
 * ============================================================================
 */
/**
 * Una celda es un string/número (campo de texto, respuesta correcta) o
 * `{ etiqueta }` (celda fija). "etiqueta" admite HTML (se inserta con
 * innerHTML, no como texto plano).
 */
type CompletarTablaCelda = string | number | {
    etiqueta: string;
};
type AlineacionHorizontal = 'izquierda' | 'centro' | 'derecha';
type AlineacionVertical = 'arriba' | 'centro' | 'abajo';
interface CompletarTablaColumna {
    /** Texto del encabezado de la columna. Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    celdas: CompletarTablaCelda[];
    /** Ancho fijo en porcentaje; si se omite, la columna crece pareja con las demás. */
    ancho?: number;
    /** Alineación horizontal del texto de la columna (etiquetas y campos). Por defecto 'centro'. */
    alineacionHorizontal?: AlineacionHorizontal;
    /**
     * Alineación vertical de la columna. Por defecto 'centro'. Sin efecto en
     * celdas de <textarea> (columnas con "multilinea"), que siempre llenan
     * el alto disponible para poder crecer con el texto.
     */
    alineacionVertical?: AlineacionVertical;
}
interface CompletarTablaDatos {
    columnas: CompletarTablaColumna[];
    /** Título general de toda la tabla (opcional). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Baraja el orden de las filas (sin mover las que tienen etiqueta). Por defecto true. */
    aleatorio?: boolean;
    /** Usa <textarea> con autoajuste de alto en vez de <input>. Por defecto false. */
    multilinea?: boolean;
}
interface CompletarTablaResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CompletarTablaInstancia {
    revisar(): CompletarTablaResultado;
    obtenerResultado(): CompletarTablaResultado;
    reiniciar(): void;
}
declare function crearCompletarTabla(id: IdentificadorActividad, datos: CompletarTablaDatos, puntaje?: number): CompletarTablaInstancia;

// --- crucigrama ---
/**
 * ============================================================================
 *  Crucigrama
 * ============================================================================
 *
 * ¿Qué hace?
 * A partir de una lista plana de `{ respuesta, pista }` (sin fila/columna/
 * dirección — nada de eso se arma a mano), el motor de auto-diagramación
 * intenta cruzar las palabras por letras compartidas hasta lograr un
 * crucigrama válido donde todas encajan, y arma el tablero (una celda por
 * letra) con un campo de una sola letra por casilla. Cada celda donde
 * arranca una palabra lleva una etiqueta (1, 2, 3… o a, b, c…) que la
 * conecta con su pista en el listado de abajo — un solo listado, sin
 * separar Horizontales/Verticales (esa dirección es un detalle interno del
 * motor, no algo que el estudiante necesite ver). Si DOS palabras arrancan
 * en la misma celda (ej. una horizontal y una vertical que cruzan justo en
 * su primera letra), esa celda muestra las dos etiquetas juntas separadas
 * por coma (ej. "7,10"), nunca se pierde ninguna. La etiqueta lleva la
 * clase compartida `no-print` (ver style.css): al imprimir o exportar a
 * PDF desaparece sola.
 *
 * Respuestas de más de una palabra (ej. "LINEA EQUINOCCIONAL") funcionan
 * igual: el espacio también ocupa una celda en el tablero, pero esa celda
 * se pinta como separador (sin campo) — no se muestra ni se califica.
 *
 * El armado (qué palabra cruza con cuál, y en qué posición exacta del
 * tablero) es responsabilidad del motor y depende de un candidato al azar
 * entre los cruces válidos posibles — por eso el layout nunca es
 * exactamente igual dos veces, sin que eso sea configurable (no tendría
 * sentido un crucigrama "no aleatorio": sin azar en el cruce, muchas listas
 * de palabras simplemente no lograrían encajar). Lo que SÍ es configurable
 * con `datos.aleatorio` (por defecto true) es el orden en que se reparten
 * las ETIQUETAS (1/2/3… o a/b/c…) entre las pistas — no afecta dónde queda
 * cada palabra en el tablero, la calificación tampoco depende de esto.
 *
 * `datos.numeracion` (por defecto 'numeros') es 'numeros' (1., 2., 3.…) o
 * 'letras' (a., b., c.…) para las etiquetas de las pistas.
 *
 * Si la lista de palabras no comparte suficientes letras entre sí, el motor
 * reintenta armar el tablero completo varias veces y, si aun así no logra
 * ubicar todas las palabras, la función pinta un mensaje de error legible
 * en vez de un tablero roto — revisa que las palabras tengan letras en
 * común.
 *
 * Estándar de calificación (Sistema A — cada celda ya trae su propia letra
 * correcta fija, no es una lista de opciones marcables como en Selección
 * Múltiple): cada celda con letra vale 1/total. Acertarla (sin importar
 * mayúsculas ni tildes) suma 1/total; escribir otra letra resta solo la
 * MITAD de eso ((1/total)/2); dejarla en blanco no suma ni resta (pero
 * sigue pintándose como incorrecta). `nota = (correctas − incorrectas/2) /
 * total`, sin bajar de 0. Las celdas separadoras (espacio entre palabras de
 * una misma respuesta) nunca cuentan para el total.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa el crucigrama con las pistas.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearCrucigrama(1, {
 *       palabras: [
 *         { respuesta: 'SOL', pista: 'Estrella del sistema solar.' },
 *         { respuesta: 'LUNA', pista: 'Satélite natural de la Tierra.' },
 *         { respuesta: 'TIERRA', pista: 'Planeta donde vivimos.' },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearCrucigrama` devuelve una instancia con:
 *   - revisar(): califica, pinta cada celda (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito y el feedback, deja todo en blanco (el
 *     tablero armado se conserva, no se vuelve a generar).
 * ============================================================================
 */
type NumeracionCrucigrama = 'numeros' | 'letras';
interface CrucigramaPalabra {
    /** Se compara sin mayúsculas ni tildes. Un espacio (respuesta de más de una palabra) ocupa una celda separadora, nunca se muestra como campo ni se califica. */
    respuesta: string;
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    pista: string;
}
interface CrucigramaDatos {
    palabras: CrucigramaPalabra[];
    /** Baraja el orden en que se reparten las etiquetas (1/2/3.../a/b/c...) entre las pistas. Por defecto true. No afecta el armado del tablero ni la calificación. */
    aleatorio?: boolean;
    /** 'numeros' (1., 2., 3.… — por defecto) o 'letras' (a., b., c.…). */
    numeracion?: NumeracionCrucigrama;
}
interface CrucigramaResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface CrucigramaInstancia {
    revisar(): CrucigramaResultado;
    obtenerResultado(): CrucigramaResultado;
    reiniciar(): void;
}
declare function crearCrucigrama(id: IdentificadorActividad, datos: CrucigramaDatos, puntaje?: number): CrucigramaInstancia;

// --- etiquetarImagen ---
/**
 * ============================================================================
 *  Etiquetar imagen
 * ============================================================================
 *
 * ¿Qué hace?
 * Cualquier imagen (submarino, mapa, célula, máquina, ilustración...) con
 * "zonas" invisibles que vos posicionás a mano sobre ella (`x`, `y`, en % del
 * ancho/alto de la imagen) y un banco de opciones — el estudiante asigna cada
 * opción a la zona que le corresponde. Completamente genérica: no sabe nada
 * de qué representa la imagen ni las zonas, solo dónde están y cuál es la
 * respuesta correcta de cada una.
 *
 * Dos modos de asignar la opción a una zona (`datos.modo`):
 *   - 'arrastrar' (por defecto): el estudiante ARRASTRA una opción (una
 *     "ficha") desde el banco de opciones hasta la zona sobre la imagen.
 *     Funciona con mouse, dedo y lápiz óptico (Pointer Events, igual que
 *     Lienzo) — no depende de drag-and-drop nativo del navegador. Una ficha
 *     ya colocada se puede volver a arrastrar a otra zona (o de vuelta al
 *     banco); soltarla sobre una zona que ya tenía otra ficha reemplaza esa
 *     ficha (vuelve sola al banco), igual que Relacionar reemplaza una
 *     conexión existente al tocar una tarjeta de nuevo.
 *   - 'select': cada zona es un `<select>` (banco cerrado) posicionado
 *     directamente sobre la imagen en su `x`/`y` — sin arrastrar nada, más
 *     simple en pantallas chicas o si preferís que responda con teclado. El
 *     banco de cada `<select>` SIEMPRE se muestra en el mismo orden barajado
 *     (uno solo para toda la actividad, más fácil de escanear) y SIEMPRE es
 *     aleatorio, sin excepción — igual regla que el banco de palabras de
 *     Rellenar espacios en modo 'select'.
 *
 * `datos.zonas` es la lista de zonas: cada una es `{ x, y, ancho?, alto?,
 * respuesta }`. `x`/`y` son el CENTRO de la zona, en % del ancho/alto de la
 * imagen (0-100) — nunca en píxeles, así la posición escala sola sin
 * importar el tamaño real en pantalla (celular, tablet, PC) ni la
 * proporción de la imagen. `ancho`/`alto` (también en %, opcionales) fijan
 * el tamaño de la caja de destino en modo 'arrastrar'; en modo 'select',
 * "ancho" en cambio es el ancho del propio `<select>` (si se omite, se
 * calcula solo según la opción más larga del banco, igual que Rellenar
 * espacios). Las zonas NUNCA cambian de posición ni de orden — las ubicás
 * vos a mano, la función jamás las reordena.
 *
 * `datos.opciones` es el banco de opciones que ve el estudiante; si se
 * omite, se arma solo con las `respuesta` de todas las zonas (sin
 * duplicados) — igual que Rellenar espacios, podés mandar un banco más
 * grande con distractores sin que se desordene qué respuesta es la correcta
 * de cada zona.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden del banco de
 * opciones — SOLO tiene efecto en modo 'arrastrar' (el orden en que
 * aparecen las fichas en el banco). En modo 'select' no aplica: ahí el
 * banco de cada `<select>` siempre es aleatorio, sin importar este valor
 * (misma excepción que el modo 'select' de Rellenar espacios).
 *
 * Estándar de calificación (Sistema A — cada zona ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada zona vale 1/total. Acertarla (comparación
 * flexible: sin mayúsculas, tildes ni espacios) suma 1/total; colocar la
 * opción equivocada resta solo la MITAD de eso ((1/total)/2); dejarla vacía
 * no suma ni resta (pero sigue pintándose como incorrecta). `nota =
 * (correctas − incorrectas/2) / total`, sin bajar de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Arrastra cada nombre hasta la parte del submarino que le corresponde.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearEtiquetarImagen(1, {
 *       imagen: 'submarino.png',
 *       imagenAlt: 'Ilustración de un submarino',
 *       zonas: [
 *         { x: 20, y: 12, respuesta: 'Periscopio' },
 *         { x: 62, y: 20, respuesta: 'Antena' },
 *         { x: 82, y: 46, respuesta: 'Timón' },
 *         { x: 90, y: 78, respuesta: 'Hélice' },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearEtiquetarImagen` devuelve una instancia con:
 *   - revisar(): califica, pinta cada zona (verde/rojo), escribe la nota en
 *     el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): en 'arrastrar', devuelve todas las fichas al banco (en su
 *     orden original); en 'select', vacía cada `<select>`. Deja todo en
 *     blanco y borra el feedback visual.
 * ============================================================================
 */
type ModoEtiquetarImagen = 'arrastrar' | 'select';
interface EtiquetarImagenZona {
    /** Comparación flexible: sin mayúsculas, tildes ni espacios. */
    respuesta: string;
    /** Centro de la zona, en % del ancho de la imagen (0-100). */
    x: number;
    /** Centro de la zona, en % del alto de la imagen (0-100). */
    y: number;
    /** 'arrastrar': ancho de la caja de destino, en % del ancho de la imagen. 'select': ancho del propio <select> (px); si se omite, se calcula según la opción más larga del banco. */
    ancho?: number;
    /** Alto de la caja de destino, en % del alto de la imagen. Solo aplica en modo 'arrastrar'. */
    alto?: number;
}
interface EtiquetarImagenDatos {
    /** URL de la imagen de fondo. */
    imagen: string;
    /** Texto alternativo de la imagen (accesibilidad). */
    imagenAlt?: string;
    zonas: EtiquetarImagenZona[];
    /** Banco de opciones; si se omite, se arma solo con las "respuesta" de "zonas" (sin duplicados). */
    opciones?: string[];
    /** 'arrastrar' (por defecto, arrastra fichas desde un banco) o 'select' (un <select> por zona). */
    modo?: ModoEtiquetarImagen;
    /** Baraja el orden del banco de opciones. Por defecto true. Solo aplica en modo 'arrastrar' — en 'select' el banco de cada <select> SIEMPRE es aleatorio, sin excepción. */
    aleatorio?: boolean;
}
interface EtiquetarImagenResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface EtiquetarImagenInstancia {
    revisar(): EtiquetarImagenResultado;
    obtenerResultado(): EtiquetarImagenResultado;
    reiniciar(): void;
}
declare function crearEtiquetarImagen(id: IdentificadorActividad, datos: EtiquetarImagenDatos, puntaje?: number): EtiquetarImagenInstancia;

// --- lienzo ---
/**
 * ============================================================================
 *  Lienzo
 * ============================================================================
 *
 * ¿Qué hace?
 * Uno o varios mini "Paint" para dibujar o pintar libremente: lápiz,
 * borrador, balde de pintura (rellena el área conectada de un solo clic,
 * igual que en Paint), 4 formas básicas (rectángulo, círculo, triángulo y
 * línea — arrastrando desde donde empieza hasta donde termina la forma, con
 * vista previa en vivo), una paleta de colores (+ color personalizado), 3
 * grosores de trazo, deshacer, limpiar todo y descargar el dibujo como
 * imagen. Funciona con mouse y con dedo/lápiz táctil (Pointer Events).
 *
 * BALDE DE PINTURA: rellena TODA el área conectada al punto donde se hace
 * clic (mismo color de partida, con una tolerancia chica para no dejar
 * bordes sin pintar por el antialiasing) — si esa área tiene una abertura
 * (ej. un círculo mal cerrado con el lápiz), el relleno se escapa por ahí y
 * termina pintando tanto el interior como el exterior, exactamente como en
 * Paint (no hay nada raro ahí, es el comportamiento esperado de un
 * flood-fill real). El relleno SIEMPRE considera lo que se ve en pantalla,
 * incluida la imagen de fondo si la hay (las líneas de un dibujo para
 * colorear actúan como pared del relleno) — pero la imagen de fondo en sí
 * nunca se "hornea" dentro del lienzo: sigue siendo una capa aparte, así que
 * borrar encima de un área rellenada sigue revelando la imagen original.
 *
 * `datos` es un ARREGLO de configuraciones — uno por cada lienzo que
 * quieras en esa misma actividad (lo normal es solo uno, pero puedes pedir
 * varios, ej. "Dibuja el inicio" / "Dibuja el final" del cuento, cada uno
 * con su propio tamaño e imagen de fondo).
 *
 * Esta actividad NO SE CALIFICA — no hay una respuesta "correcta". Por eso
 * revisar()/obtenerResultado() solo existen para cumplir el mismo contrato
 * que el resto de funciones (por si el libro llama instancia.revisar() en
 * bloque junto con actividades que sí califican); siempre devuelven un
 * resultado neutro y NUNCA escriben nada en un input de nota — de hecho,
 * esta función ni siquiera necesita que exista un input "preXa" en tu HTML.
 *
 * `imagenFondo` (opcional, por lienzo) es solo el SRC de una imagen (una
 * URL, nada más) que se pone detrás de ESE lienzo — para calcar o colorear
 * encima, como un libro para colorear; si no la mandas, el lienzo empieza
 * en blanco. El lápiz, el borrador, las formas y el balde dibujan en una
 * capa transparente por encima — borrar revela la imagen de nuevo en vez de
 * dejar un hueco blanco, y el balde la respeta como límite de relleno (ver
 * arriba) sin modificarla nunca.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor — debe existir ya en tu
 * HTML. La función solo lo busca (con document.getElementById).
 *
 * La barra de herramientas (colores, lápiz/borrador/formas, grosor,
 * deshacer/limpiar/descargar) lleva la clase compartida "no-print" (ver
 * style.css) — al imprimir o exportar a PDF desaparece sola (nadie puede
 * tocar un botón en papel) y solo queda el lienzo con el dibujo.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Dibuja lo que más te gustó del cuento.</p>
 *   <div id="p1act"></div>
 *
 *   <script>
 *     const instancia = crearLienzo(1, [
 *       { ancho: 700, alto: 450 },
 *       // { titulo: 'Otra escena', ancho: 700, alto: 450, imagenFondo: 'https://.../dibujo.png' },
 *     ]);
 *   </script>
 *
 * El primer parámetro (id) funciona igual que en el resto de funciones —
 * ver utilidades/contenedor.ts. El tercer parámetro (puntaje) se acepta por
 * consistencia con el contrato general, pero esta función lo ignora por
 * completo (no se califica).
 *
 * `crearLienzo` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): borra TODOS los lienzos de la actividad, uno por uno.
 * ============================================================================
 */
interface LienzoDatos {
    /** Título opcional de este lienzo (útil cuando hay varios en la misma actividad). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Ancho lógico del lienzo en px. Por defecto 700. */
    ancho?: number;
    /** Alto lógico del lienzo en px. Por defecto 450. */
    alto?: number;
    /** Imagen de fondo opcional (para calcar o colorear encima); si se omite, el lienzo queda en blanco. */
    imagenFondo?: string;
    /** Paleta de colores disponible; si se omite, se usa una paleta por defecto. */
    colores?: string[];
    /** Color seleccionado al iniciar. Por defecto el primero de la paleta. */
    colorInicial?: string;
    /** Grosor de trazo inicial en px. Por defecto 8. */
    grosorInicial?: number;
}
interface LienzoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface LienzoInstancia {
    revisar(): LienzoResultado;
    obtenerResultado(): LienzoResultado;
    reiniciar(): void;
}
declare function crearLienzo(id: IdentificadorActividad, datos?: LienzoDatos[], _puntaje?: number): LienzoInstancia;

// --- panelInformativo ---
/**
 * ============================================================================
 *  Panel informativo
 * ============================================================================
 *
 * ¿Qué hace?
 * Arma un bloque de contenido (no una actividad): un título, un fondo de
 * color pastel aleatorio, un texto explicativo, opcionalmente una imagen
 * (a la izquierda, derecha, arriba o abajo del texto — las de los lados
 * quedan centradas verticalmente, las de arriba/abajo centradas y
 * apiladas), y opcionalmente una cita/fuente pequeña abajo a la derecha
 * (como una referencia bibliográfica). Es puro "generación de DOM" para
 * introducir un tema — piensa en la típica caja de "¿Sabías que...?" o la
 * introducción de una unidad.
 *
 * `datos.ajusteImagen` controla cómo se acomoda una imagen que NO es
 * cuadrada: `'cubrir'` (por defecto) la rellena en una caja de alto fijo,
 * recortando lo que sobre por los lados (como antes); `'original'` NUNCA
 * recorta — respeta su relación de aspecto real (una foto muy alta o muy
 * ancha se ve completa) y solo la reduce si no cabe en el bloque.
 *
 * `datos.titulo` y `datos.texto` admiten HTML (se insertan con `innerHTML`,
 * no como texto plano) — muchas preguntas de libro necesitan negritas,
 * cursivas, `<sub>`/`<sup>` (fórmulas químicas/matemáticas), saltos de
 * línea, etc.
 *
 * Con la imagen a un lado ('izquierda'/'derecha'), el paso a fila usa un
 * CONTAINER QUERY (mide el ancho real de ESTE bloque) en vez del breakpoint
 * de viewport de Tailwind — un libro digital suele mostrar este panel
 * dentro de una columna angosta (un lector/iframe embebido, no la pantalla
 * completa), así que el viewport puede ser de escritorio aunque el panel
 * tenga poco espacio real; con un breakpoint de viewport eso mantenía la
 * imagen y el texto lado a lado con el texto aplastado a una palabra por
 * línea. Con el container query, la imagen baja a apilarse automáticamente
 * en cuanto el BLOQUE (no la pantalla) se queda sin espacio.
 *
 * Esta actividad NO SE CALIFICA — no hay nada que responder. Por eso
 * revisar()/obtenerResultado() solo existen para cumplir el mismo contrato
 * que el resto de funciones (por si el libro llama instancia.revisar() en
 * bloque junto con actividades que sí califican); siempre devuelven un
 * resultado neutro y NUNCA escriben nada en un input de nota — de hecho,
 * esta función ni siquiera necesita que exista un input "preXa" en tu HTML.
 * reiniciar() tampoco hace nada (no hay ninguna selección que borrar).
 *
 * IMPORTANTE: la función NUNCA crea el contenedor — debe existir ya en tu
 * HTML. La función solo lo busca (con document.getElementById).
 *
 * El panel siempre ocupa el 100% del ancho disponible: la función le fuerza
 * `width: 100%` al propio contenedor (el div del "id"), así no importa si
 * el HTML del libro no le dio un ancho explícito (ej. dentro de un
 * contenedor flex/grid que dejaría un div vacío en su ancho mínimo de
 * "fit-content", angostando todo el panel).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *
 *   <script>
 *     const instancia = crearPanelInformativo(1, {
 *       titulo: '¿Cómo ha cambiado nuestra comprensión del átomo?',
 *       texto: 'A lo largo de la historia, distintos científicos propusieron modelos para explicar la estructura del átomo...',
 *       imagen: 'https://.../atomo.jpg',
 *       posicionImagen: 'derecha',
 *       cita: 'Hird, 2026.',
 *     });
 *   </script>
 *
 * El primer parámetro (id) funciona igual que en el resto de funciones —
 * ver utilidades/contenedor.ts. El tercer parámetro (puntaje) se acepta por
 * consistencia con el contrato general, pero esta función lo ignora por
 * completo (no se califica).
 *
 * `crearPanelInformativo` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): no hace nada (no hay ningún estado que borrar).
 * ============================================================================
 */
type PosicionImagenPanel = 'izquierda' | 'derecha' | 'arriba' | 'abajo';
type AjusteImagenPanel = 'cubrir' | 'original';
interface PanelInformativoDatos {
    /**
     * Título del panel (se muestra en negrita, centrado si no hay imagen).
     * Admite HTML (se inserta con innerHTML, no como texto plano).
     */
    titulo: string;
    /**
     * Texto explicativo del panel. Admite HTML (se inserta con innerHTML, no
     * como texto plano) — útil para negritas, cursivas, <sub>/<sup>
     * (fórmulas), saltos de línea, etc.
     */
    texto: string;
    /** URL de una imagen opcional. */
    imagen?: string;
    /** Texto alternativo de la imagen (accesibilidad). Por defecto usa "titulo". */
    imagenAlt?: string;
    /** Dónde va la imagen si se manda: a los lados ('izquierda'/'derecha', centrada verticalmente) o apilada ('arriba'/'abajo', centrada horizontalmente). Por defecto 'derecha'. */
    posicionImagen?: PosicionImagenPanel;
    /**
     * Cómo se acomoda una imagen que no es cuadrada. 'cubrir' (por defecto)
     * la rellena en una caja de alto fijo, recortando lo que sobre por los
     * lados — se ve prolijo con fotos "normales", pero una foto muy alta o
     * muy ancha puede perder parte del contenido. 'original' respeta su
     * relación de aspecto real (nunca recorta) y solo la reduce de tamaño si
     * no cabe en el bloque.
     */
    ajusteImagen?: AjusteImagenPanel;
    /** Cita/fuente pequeña, abajo a la derecha (ej. "Hird, 2026."). Opcional. Admite HTML (innerHTML, no texto plano). */
    cita?: string;
    /** Fondo del panel; si se omite, se usa un color pastel aleatorio (como el resto del catálogo). */
    color?: string;
}
interface PanelInformativoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface PanelInformativoInstancia {
    revisar(): PanelInformativoResultado;
    obtenerResultado(): PanelInformativoResultado;
    reiniciar(): void;
}
declare function crearPanelInformativo(id: IdentificadorActividad, datos: PanelInformativoDatos, _puntaje?: number): PanelInformativoInstancia;

// --- relacionar ---
/**
 * ============================================================================
 *  Relacionar — Unir con líneas
 * ============================================================================
 *
 * ¿Qué hace?
 * Dos columnas de tarjetas (izquierda = "respuesta", derecha = "item"). El
 * estudiante traza "cuerdas" (curvas SVG con caída tipo gravedad) tocando
 * una tarjeta de un lado y luego una del otro para conectarlas — cada
 * cuerda nace/muere escondida detrás de su tarjeta (el SVG va detrás) y
 * solo se ve el tramo que cruza el hueco entre columnas.
 *
 * Cada tarjeta se ajusta al ancho de la más ancha DENTRO DE SU MISMA
 * COLUMNA (nunca al ancho completo de la columna del grid) — una palabra
 * corta ("Aves") no termina angosta ni al lado de una caja enorme y vacía:
 * queda del mismo tamaño que sus vecinas de ese lado. Ambas columnas quedan
 * pegadas hacia el hueco central (la izquierda por su borde derecho, la
 * derecha por su borde izquierdo), así el punto de donde nace/muere cada
 * cuerda queda siempre en el mismo lugar sin importar qué tan angosta sea
 * una tarjeta puntual.
 *
 * Los datos se dan como una lista plana de pares correctos ("datos.pares"):
 * cada objeto es { item, respuesta }. Las columnas (izquierda/derecha) se
 * derivan solas quitando duplicados, en el orden en que aparecen. Repetir
 * el mismo "item" o la misma "respuesta" en varios pares es lo que da
 * uno-a-muchos/muchos-a-muchos — no hay que armar índices a mano.
 *
 * "datos.aleatorio" (por defecto true) baraja el orden de las tarjetas de
 * cada columna; pon false para mantener el orden de "datos.pares". Las
 * relaciones se califican sobre el par correcto, nunca sobre el orden
 * visual, así que desactivarlo no afecta la calificación.
 *
 * "datos.tipo" (por defecto 'uno_a_uno') define cómo se corrige un error
 * al conectar, para que el estudiante pueda arreglarse solo sin un botón
 * de reiniciar:
 *   - 'uno_a_uno': cada tarjeta (de cualquier lado) admite máximo UNA
 *     conexión — conectar una tarjeta que ya tenía otra conexión borra la
 *     anterior sola.
 *   - 'uno_a_muchos': cada tarjeta de la IZQUIERDA ("respuesta") admite
 *     máximo una conexión (conectarla de nuevo borra la anterior), pero
 *     una tarjeta de la DERECHA ("item") puede recibir varias.
 *   - 'muchos_a_muchos': sin restricciones, cualquier tarjeta puede tener
 *     varias conexiones a la vez.
 * En los tres casos, tocar una cuerda ya trazada la borra, y tocar la
 * misma pareja ya conectada también la borra (toggle).
 *
 * Estándar de calificación (Sistema B aplicado a pares): cada combinación
 * POSIBLE izquierda×derecha es un "ítem" marcable de forma independiente
 * (como una casilla de Selección Múltiple) — las que aparecen en
 * "datos.pares" son las correctas.
 *   totalCorrectas = cantidad de pares correctos definidos
 *   totalOpciones  = izquierda.length * derecha.length (todas las parejas posibles)
 *   cada cuerda que coincide con un par correcto (acierto) -> suma 1/totalCorrectas
 *   cada cuerda que NO coincide con ningún par (error) -> resta 1/totalOpciones
 *   nota = aciertos/totalCorrectas − errores/totalOpciones, sin bajar de 0
 * No trazar ninguna cuerda da 0 de forma natural; trazar absolutamente
 * todas las combinaciones posibles también se fuerza a 0 (igual que en
 * Selección Múltiple).
 *
 * Al calificar, las cuerdas SIEMPRE se pintan (verde/roja) — el color de
 * marca (violeta, ámbar, etc.) es exclusivo de mientras se está
 * conectando, nunca se usa verde/rojo antes de calificar. Además, SOLO en
 * 'uno_a_uno' (donde cada tarjeta tiene una sola conexión posible, así que
 * el veredicto no es ambiguo) también se pinta la tarjeta completa y su
 * círculo, de los dos lados; en 'uno_a_muchos'/'muchos_a_muchos' una
 * tarjeta puede tener varias conexiones con veredictos distintos a la vez,
 * así que ahí solo se pintan las cuerdas.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Las cuerdas ya trazadas se ven bien sin importar el ancho/alto real que
 * tenga el bloque al momento de imprimir, exportar a PDF, hacer zoom,
 * redimensionar la ventana o rotar el celular — INCLUSO si JavaScript no
 * llega a correr en ese momento (el caso real de imprimir: el motor de
 * impresión de un navegador arma su propia versión del layout en un paso
 * que la página no puede observar ni interceptar a tiempo). La solución de
 * raíz es que el SVG tiene un "viewBox" fijado al tamaño que el bloque
 * tenía al montarse — el propio motor de renderizado (el mismo en pantalla
 * o al imprimir) estira ese sistema de coordenadas para llenar el tamaño
 * real en cada momento, sin que ninguna cuerda necesite recalcularse por
 * JS. Además, tres mecanismos (requestAnimationFrame en bucle,
 * ResizeObserver y "beforeprint") afinan la posición con las coordenadas
 * EXACTAS cuando JS sí alcanza a correr (uso normal en pantalla).
 *
 * El alto de TODAS las tarjetas (de las dos columnas) se iguala al montar
 * la actividad, a la altura máxima que necesita cualquiera de ellas — así
 * el alto total del bloque NUNCA cambia aunque el texto envuelva distinto
 * a un ancho de página distinto al de la pantalla (ej. al imprimir). Esto
 * es clave para que el "viewBox" de arriba estire las cuerdas de forma
 * proporcional y correcta: si el alto cambiara junto con el ancho, un
 * estiramiento no uniforme (ancho y alto en proporciones distintas)
 * exageraría o aplanaría la curva de cada cuerda.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Relaciona cada figura literaria con su ejemplo.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRelacionar(1, {
 *       tipo: 'uno_a_uno',
 *       pares: [
 *         { item: 'Personificación', respuesta: 'El viento susurraba secretos entre los árboles.' },
 *         { item: 'Anáfora', respuesta: 'Nunca, nunca olvidaré ese día.' },
 *         { item: 'Hipérbole', respuesta: 'Lloré un océano de lágrimas por su partida.' },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearRelacionar` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra todas las cuerdas y el feedback, deja todo en blanco.
 * ============================================================================
 */
type TipoRelacion = 'uno_a_uno' | 'uno_a_muchos' | 'muchos_a_muchos';
interface RelacionarPar {
    /** Columna derecha. Admite HTML (se inserta con innerHTML, no como texto plano). */
    item: string;
    /** Columna izquierda. Admite HTML (se inserta con innerHTML, no como texto plano). */
    respuesta: string;
}
interface RelacionarDatos {
    pares: RelacionarPar[];
    /** Por defecto 'uno_a_uno'. */
    tipo?: TipoRelacion;
    /** Baraja el orden de las tarjetas de cada columna. Por defecto true. */
    aleatorio?: boolean;
}
interface RelacionarResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RelacionarInstancia {
    revisar(): RelacionarResultado;
    obtenerResultado(): RelacionarResultado;
    reiniciar(): void;
}
declare function crearRelacionar(id: IdentificadorActividad, datos: RelacionarDatos, puntaje?: number): RelacionarInstancia;

// --- relacionarLiteral ---
/**
 * ============================================================================
 *  Relacionar literal–enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * La clásica "relación de literales": una columna izquierda con términos
 * etiquetados con una letra (a, b, c…) y una columna derecha con
 * enunciados, cada uno con un campo para escribir o elegir la letra del
 * término que le corresponde. Es la versión "con letras" de Relacionar
 * (que usa cuerdas dibujadas) — misma idea, sin trazar líneas.
 *
 * `datos.literales` es la columna izquierda (los términos); la letra de
 * cada uno se asigna sola según su posición en pantalla (que es aleatoria
 * en cada carga, igual que el resto del catálogo). `datos.items` es la
 * columna derecha: cada uno es `{ enunciado, correcta }`, donde "correcta"
 * es el TEXTO EXACTO de uno de los elementos de "literales" (no un índice
 * — así no hay que llevar la cuenta de posiciones a mano).
 *
 * `datos.modo` ('select', por defecto, o 'input') define si el estudiante
 * ELIGE la letra de un banco cerrado o la ESCRIBE libremente — igual que en
 * Rellenar espacios.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de presentación de
 * ambas columnas; pon false para mantener el orden de "literales"/"items".
 * La calificación se resuelve por texto, nunca por posición, así que
 * desactivarlo no la afecta.
 *
 * Las tarjetas de la fila N a la izquierda y a la derecha quedan siempre a
 * la misma altura (la del contenido más alto de las dos), para que las dos
 * columnas se vean parejas aunque un enunciado ocupe dos líneas y su
 * literal solo una. Esto solo aplica de "sm" para arriba — en mobile las
 * columnas se apilan una encima de la otra.
 *
 * Estándar de calificación (Sistema A — cada enunciado ya trae su propia
 * letra correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada enunciado vale 1/total. Acertar la letra
 * (comparación flexible: sin importar mayúsculas, tildes ni espacios) suma
 * 1/total; escribir/elegir otra letra resta solo la MITAD de eso
 * ((1/total)/2); dejarlo en blanco no suma ni resta (pero sigue pintándose
 * como incorrecto). `nota = (correctas − incorrectas/2) / total`, sin bajar
 * de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Relaciona cada proceso con su definición.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRelacionarLiteral(1, {
 *       literales: ['Nitrificación', 'Fijación del nitrógeno', 'Amonificación', 'Desnitrificación'],
 *       items: [
 *         { enunciado: 'La materia orgánica se descompone y se libera amonio.', correcta: 'Amonificación' },
 *         { enunciado: 'Transformación de nitritos en nitratos.', correcta: 'Nitrificación' },
 *         { enunciado: 'Los nitratos se convierten en nitrógeno gaseoso.', correcta: 'Desnitrificación' },
 *         { enunciado: 'El nitrógeno se fija en el suelo.', correcta: 'Fijación del nitrógeno' },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearRelacionarLiteral` devuelve una instancia con:
 *   - revisar(): califica, pinta cada campo (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito/elegido y el feedback, deja todo en blanco.
 * ============================================================================
 */
type ModoRelacionarLiteral = 'select' | 'input';
interface RelacionarLiteralItem {
    /** Enunciado de la columna derecha. Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    /** Texto EXACTO de uno de los elementos de "literales" — es la respuesta correcta de este enunciado. */
    correcta: string;
}
interface RelacionarLiteralDatos {
    /** Columna izquierda: términos/definiciones; cada uno se etiqueta solo con una letra según su posición en pantalla. Cada literal admite HTML (se inserta con innerHTML, no como texto plano). */
    literales: string[];
    /** Columna derecha: enunciados a los que hay que ponerles la letra correcta. */
    items: RelacionarLiteralItem[];
    /** 'select' (banco cerrado con las letras disponibles, por defecto) o 'input' (escribe la letra). */
    modo?: ModoRelacionarLiteral;
    /** Baraja el orden de presentación de ambas columnas (literales e ítems). Por defecto true. */
    aleatorio?: boolean;
}
interface RelacionarLiteralResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RelacionarLiteralInstancia {
    revisar(): RelacionarLiteralResultado;
    obtenerResultado(): RelacionarLiteralResultado;
    reiniciar(): void;
}
declare function crearRelacionarLiteral(id: IdentificadorActividad, datos: RelacionarLiteralDatos, puntaje?: number): RelacionarLiteralInstancia;

// --- rellenarEspacios ---
/**
 * ============================================================================
 *  Rellenar espacios
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra uno o varios enunciados con espacios en blanco incrustados en
 * medio del texto (no en tarjetas aparte) — el estudiante los llena
 * eligiendo de un banco de palabras (`modo: 'select'`, un <select> por
 * espacio) o escribiendo la respuesta libremente (`modo: 'input'`).
 *
 * Cada ítem es `{ texto, respuestas }`: "texto" trae el marcador (por
 * defecto "___") una vez por cada espacio que necesite, y "respuestas" es
 * la respuesta correcta de cada espacio EN EL MISMO ORDEN en que aparece el
 * marcador dentro de ese texto — un enunciado puede tener más de un espacio.
 *
 * En `modo: 'select'`, el banco de palabras (`datos.opciones`) es
 * independiente de las respuestas correctas: si no se manda, se arma solo
 * con las respuestas correctas de todos los ítems (sin duplicados), pero se
 * puede mandar un banco más grande con palabras de más (distractores) sin
 * que eso rompa nada — a diferencia de la versión vieja de esta función,
 * donde el banco de opciones y la respuesta correcta de cada espacio eran
 * la MISMA lista (la posición en "options" definía la respuesta correcta),
 * así que no se podían agregar distractores sin desordenar las respuestas.
 * El orden de las opciones dentro de cada <select> es aleatorio, pero el
 * mismo para todos los selects de la actividad (más fácil de escanear).
 *
 * El orden de los ítems (párrafos) es aleatorio por defecto (`datos.aleatorio`,
 * por defecto true) — cada espacio se lleva su propia respuesta correcta
 * consigo, así que la calificación nunca depende del orden. Pon
 * `aleatorio: false` para mantener el orden en que los escribiste.
 *
 * El banco de palabras del modo 'select' (`datos.opciones`) SIEMPRE se
 * mezcla, sin excepción — no tiene opción de desactivarse.
 *
 * Si hay más de un ítem, cada uno se numera con `datos.numeracion`:
 * `'letras'` (a., b., c.… — por defecto), `'numeros'` (1., 2., 3.…) o
 * `'ninguna'` (sin numerar).
 *
 * Estándar de calificación (Sistema A — cada espacio ya trae su propia
 * respuesta correcta fija, no es una lista de opciones marcables como en
 * Selección Múltiple): cada espacio vale 1/total. Acertarlo (texto
 * normalizado: sin importar mayúsculas, tildes ni espacios, estén donde
 * estén) suma 1/total; escribir/elegir algo distinto resta solo la MITAD de eso
 * ((1/total)/2); dejarlo en blanco no suma ni resta (pero sigue pintándose
 * como incorrecto). `nota = (correctas − incorrectas/2) / total`, sin bajar
 * de 0.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Completa los espacios en blanco.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearRellenarEspacios(1, {
 *       items: [
 *         { texto: 'El proceso de convertir agua líquida en vapor se llama ___.', respuestas: ['evaporación'] },
 *         { texto: 'El paso de vapor a líquido se llama ___ y el de sólido a líquido se llama ___.', respuestas: ['condensación', 'fusión'] },
 *       ],
 *       opciones: ['evaporación', 'condensación', 'fusión', 'sublimación'],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearRellenarEspacios` devuelve una instancia con:
 *   - revisar(): califica, pinta cada espacio (verde/rojo), escribe la nota
 *     en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra lo escrito/elegido y el feedback, deja todo en blanco.
 * ============================================================================
 */
type ModoRellenarEspacios = 'select' | 'input';
type NumeracionRellenarEspacios = 'letras' | 'numeros' | 'ninguna';
interface RellenarEspaciosItem {
    /** Texto del enunciado; incluye el marcador una vez por cada espacio a llenar. Admite HTML (se inserta con innerHTML, no como texto plano) — evita usar el "marcador" dentro de una etiqueta HTML. */
    texto: string;
    /** Respuesta correcta de cada espacio, en el mismo orden en que aparece el marcador dentro de "texto". */
    respuestas: string[];
}
interface RellenarEspaciosDatos {
    items: RellenarEspaciosItem[];
    /** 'select' (banco de palabras cerrado) o 'input' (respuesta libre). Por defecto 'select'. */
    modo?: ModoRellenarEspacios;
    /** Texto que marca un espacio dentro de "texto". Por defecto '___'. */
    marcador?: string;
    /** Banco de palabras para modo 'select'; si se omite, se arma con las respuestas correctas (sin duplicados). */
    opciones?: string[];
    /** Cómo numerar los ítems (solo si hay más de uno): 'letras' (a., b., c.…), 'numeros' (1., 2., 3.…) o 'ninguna'. Por defecto 'letras'. */
    numeracion?: NumeracionRellenarEspacios;
    /** Baraja el orden de los ítems (párrafos). Por defecto true. El banco de palabras del modo 'select' SIEMPRE se baraja, sin importar este valor. */
    aleatorio?: boolean;
}
interface RellenarEspaciosResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface RellenarEspaciosInstancia {
    revisar(): RellenarEspaciosResultado;
    obtenerResultado(): RellenarEspaciosResultado;
    reiniciar(): void;
}
declare function crearRellenarEspacios(id: IdentificadorActividad, datos: RellenarEspaciosDatos, puntaje?: number): RellenarEspaciosInstancia;

// --- renglones ---
/**
 * ============================================================================
 *  Renglones
 * ============================================================================
 *
 * ¿Qué hace?
 * Crea campos de texto "de cuaderno": renglones dibujados con líneas
 * horizontales que empiezan con una cantidad mínima de líneas y crecen
 * solos a medida que el estudiante escribe más — y si borra todo, vuelven
 * a encogerse a su tamaño mínimo (nunca más chico que eso). Es pura
 * "maquetación" — no se califica, no hay respuesta correcta.
 *
 * Tiene DOS modos, según cómo la llames:
 *
 * 1) SIN NINGÚN PARÁMETRO — `crearRenglones()` — modo automático: busca en
 *    TODO el documento los `<div>` que tengan la clase `bookText` MÁS una
 *    clase `lnN` (ej. `ln3`) — "N" es cuántos renglones tiene ese campo al
 *    empezar — y convierte cada uno en un campo de renglones. Útil para
 *    maquetar un libro donde ya dejaste los `<div class="bookText ln3">`
 *    marcando dónde va cada espacio de escritura, sin tener que llamar la
 *    función una por una.
 *
 * 2) CON `id` Y `config` — `crearRenglones(1, { preguntas: [...] })` —
 *    arma una lista de preguntas numeradas (a, b, c… o con puntos simples,
 *    según `config.numeracion`) dentro de `#p1act`, cada una con su propio
 *    campo de renglones debajo (1 renglón inicial por defecto). La
 *    pregunta se muestra en cursiva para distinguirla claramente del
 *    espacio de respuesta. Cada `pregunta` admite HTML (se inserta con
 *    `innerHTML`, no como texto plano) — útil para negritas, cursivas,
 *    `<sub>`/`<sup>` (fórmulas químicas/matemáticas), saltos de línea, etc.
 *
 * Esta función NO SE CALIFICA — no hay nada que responder "bien" o "mal".
 * Por eso revisar()/obtenerResultado() solo existen para cumplir el mismo
 * contrato que el resto de funciones; siempre devuelven un resultado
 * neutro y NUNCA escriben nada en un input de nota. reiniciar() sí hace
 * algo útil aquí: borra lo escrito en todos los campos que esta llamada
 * creó (o encontró, en modo automático) y los regresa a su tamaño mínimo.
 *
 * IMPORTANTE: en el modo con `id`, la función NUNCA crea el contenedor —
 * debe existir ya en tu HTML. En el modo automático no hace falta ningún
 * contenedor propio: los `<div class="bookText lnN">` ya son el contenedor
 * de cada campo.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   Modo automático:
 *     <div class="bookText ln2"></div>
 *     <div class="bookText ln4"></div>
 *     <script>crearRenglones();</script>
 *
 *   Modo con preguntas:
 *     <div id="p1act"></div>
 *     <script>
 *       const instancia = crearRenglones(1, {
 *         preguntas: [
 *           '¿Qué descubrimientos permitieron modificar los modelos atómicos?',
 *           '¿Cuáles fueron los principales aportes y limitaciones de cada modelo?',
 *         ],
 *         numeracion: 'letras',
 *       });
 *     </script>
 *
 * `crearRenglones` devuelve una instancia con:
 *   - revisar() / obtenerResultado(): no califican nada, devuelven siempre
 *     { correctas: 0, total: 0, porcentaje: 0, nota: 0 } y no escriben
 *     ninguna nota (el campo "nota" existe solo por consistencia de forma
 *     con el resto del catálogo, nunca se usa de verdad aquí).
 *   - reiniciar(): borra lo escrito en todos los campos y los regresa a su
 *     tamaño mínimo.
 * ============================================================================
 */
type NumeracionRenglones = 'letras' | 'puntos';
interface RenglonesConfig {
    /**
     * Preguntas a mostrar, cada una con su propio campo de renglones debajo.
     * Admite HTML (se inserta con innerHTML, no como texto plano) — útil
     * para negritas, cursivas, `<sub>`/`<sup>` (fórmulas), etc.
     */
    preguntas: string[];
    /** 'letras' (a, b, c… — por defecto) o 'puntos' (marcador simple, como un <ul>). */
    numeracion?: NumeracionRenglones;
    /** Renglones iniciales de cada campo. Por defecto 1. */
    lineasIniciales?: number;
}
interface RenglonesResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Siempre 0 — esta actividad no se califica, "nota" existe solo por consistencia de forma con el resto del catálogo. */
    nota: number;
}
interface RenglonesInstancia {
    revisar(): RenglonesResultado;
    obtenerResultado(): RenglonesResultado;
    reiniciar(): void;
}
declare function crearRenglones(id?: IdentificadorActividad, config?: RenglonesConfig, _puntaje?: number): RenglonesInstancia;

// --- resaltarPalabras ---
/**
 * ============================================================================
 *  Resaltar palabras
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra un pasaje de lectura donde ciertas palabras o frases son
 * "marcables" — el estudiante hace clic en las que considera correctas
 * (ej. "resalta los sustantivos", "subraya las palabras relacionadas con el
 * cambio climático") y cada clic prende/apaga esa palabra sola, sin afectar
 * a las demás (igual mecánica que Selección Múltiple, pero incrustada
 * dentro del flujo normal del texto en vez de tarjetas sueltas).
 *
 * `datos.texto` es el pasaje completo; cada palabra o frase marcable va
 * envuelta en `datos.marcador` (por defecto `**`, como en Markdown), ej.:
 * `'El **agua** es un recurso natural, aunque a veces se desperdicia.'`.
 * Solo lo que está DENTRO del marcador se vuelve clicable — el resto del
 * pasaje es texto normal, no interactivo. `datos.correctas` son los índices
 * (empiezan en 0, en el orden en que aparecen dentro de "texto") de las
 * palabras/frases marcables que son la respuesta correcta — las demás son
 * distractores.
 *
 * A diferencia del resto del catálogo, el orden de las palabras NUNCA se
 * mezcla — es un pasaje de lectura real, reordenarlo lo volvería
 * incoherente.
 *
 * `datos.variante` es `'resaltar'` (fondo de color, como un marcador de
 * texto real — por defecto) o `'subrayar'` (una línea debajo, que se
 * dibuja más gruesa al marcar).
 *
 * Estándar de calificación (Sistema B — igual que Selección Múltiple: una
 * lista de opciones marcables independientemente, con correctas e
 * incorrectas a la vez en pantalla):
 *   - Cada ACIERTO (palabra correcta que sí marcó) suma 1/totalCorrectas.
 *   - Cada ERROR (palabra incorrecta marcada de más) resta 1/totalPalabras.
 *   nota = aciertos/totalCorrectas − errores/totalPalabras, sin bajar de 0.
 * No marcar nada da 0 de forma natural. Marcar absolutamente todas las
 * palabras marcables no es una respuesta real (nunca hay un pasaje donde
 * todas las palabras marcables sean correctas), así que esa se fuerza a 0
 * aparte — igual que en Selección Múltiple.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Resalta las palabras relacionadas con el ciclo del agua.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearResaltarPalabras(1, {
 *       texto: 'El **agua** se **evapora** con el calor del sol, sube y forma las **nubes**, que luego producen la lluvia.',
 *       correctas: [0, 1, 2],
 *       variante: 'resaltar',
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "total" es la cantidad de palabras correctas que existen,
 *     // "correctas" es cuántas de esas SÍ marcó el estudiante.
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `crearResaltarPalabras` devuelve una instancia con:
 *   - revisar(): califica, pinta cada palabra marcada (verde/rojo), escribe
 *     la nota en el input (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra las marcas y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteResaltado = 'resaltar' | 'subrayar';
interface ResaltarPalabrasDatos {
    /**
     * Pasaje de lectura; cada palabra o frase marcable va envuelta en
     * "marcador". Admite HTML (se inserta con innerHTML, no como texto
     * plano) tanto dentro como fuera de las palabras marcables.
     */
    texto: string;
    /** Índices (empiezan en 0, en el orden en que aparecen en "texto") de las palabras/frases marcables que son la respuesta correcta. */
    correctas: number[];
    /** Instrucción o consigna que se muestra arriba del pasaje (opcional). Admite HTML (innerHTML, no texto plano). */
    titulo?: string;
    /** Texto que envuelve cada palabra/frase marcable dentro de "texto". Por defecto '**'. */
    marcador?: string;
    /** 'resaltar' (fondo de color, por defecto) o 'subrayar' (línea debajo). */
    variante?: VarianteResaltado;
}
interface ResaltarPalabrasResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface ResaltarPalabrasInstancia {
    revisar(): ResaltarPalabrasResultado;
    obtenerResultado(): ResaltarPalabrasResultado;
    reiniciar(): void;
}
declare function crearResaltarPalabras(id: IdentificadorActividad, datos: ResaltarPalabrasDatos, puntaje?: number): ResaltarPalabrasInstancia;

// --- seleccionMultipleSinEnunciado ---
/**
 * ============================================================================
 *  Selección múltiple — sin enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Es exactamente lo mismo que crearSeleccionSimpleSinEnunciado (mismas 5
 * variantes visuales, mismos colores, mismo modo de selección/cuadrícula),
 * con una sola diferencia: aquí el estudiante puede marcar VARIAS opciones
 * en vez de una sola — cada clic prende/apaga esa opción, no es exclusivo.
 *
 * Es un componente con 5 variantes visuales — la lógica de selección y
 * calificación es siempre la misma, lo que cambia es cómo se representa
 * visualmente que una opción está marcada:
 *   - 'pintar'    -> la caja se rellena de color (como si el color apareciera).
 *   - 'subrayar'  -> aparece una línea debajo del texto, dibujándose.
 *   - 'check'     -> aparece un ✓ dibujándose dentro de una casilla.
 *   - 'cruz'      -> aparece una ✗ dibujándose dentro de una casilla.
 *   - 'circulo'   -> aparece un círculo dibujándose alrededor de la opción.
 * Por defecto es 'check' si no se indica.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las opciones; pon
 * false para mantener el orden de "opciones". La calificación se resuelve
 * por el índice original, nunca por el orden visual.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Marca los animales que son mamíferos.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionMultipleSinEnunciado(1, {
 *       opciones: ['Delfín', 'Tiburón', 'Ballena', 'Medusa'],
 *       correctas: [0, 2],
 *       variante: 'circulo',
 *       columna: false,
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "total" es la cantidad de opciones correctas que existen (aquí 2),
 *     // "correctas" es cuántas de esas SÍ marcó el estudiante.
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts. Calificación (dos
 * denominadores distintos):
 *   - Cada ACIERTO (opción correcta que sí marcó) suma 1/totalCorrectas.
 *   - Cada ERROR (opción incorrecta que marcó de más) resta 1/totalOpciones.
 *   nota = aciertos/totalCorrectas − errores/totalOpciones, sin bajar de 0.
 *   Ej.: 1 acierto de 2 correctas (+0.5) y 1 error de 4 opciones (−0.25) = 0.25.
 * No marcar nada da 0 de forma natural (0 − 0). Marcar absolutamente todas
 * las opciones no es una respuesta real (nunca hay una actividad donde
 * todas sean correctas), así que esa sí se fuerza a 0 aparte.
 *
 * `crearSeleccionMultipleSinEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra las selecciones y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteSeleccionMultiple = 'pintar' | 'subrayar' | 'check' | 'cruz' | 'circulo';
interface SeleccionMultipleSinEnunciadoDatos {
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correctas: number[];
    variante?: VarianteSeleccionMultiple;
    columna?: boolean;
    /** Baraja el orden de las opciones. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionMultipleSinEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionMultipleSinEnunciadoInstancia {
    revisar(): SeleccionMultipleSinEnunciadoResultado;
    obtenerResultado(): SeleccionMultipleSinEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionMultipleSinEnunciado(id: IdentificadorActividad, datos: SeleccionMultipleSinEnunciadoDatos, puntaje?: number): SeleccionMultipleSinEnunciadoInstancia;

// --- seleccionSimpleConEnunciado ---
/**
 * ============================================================================
 *  Selección simple — con enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra una lista de enunciados, cada uno con varias opciones (A, B, C…)
 * de las que el estudiante elige una sola. Incluye revisión con puntaje:
 * pinta la opción elegida en verde o rojo según si acertó, calcula el
 * puntaje y lo escribe en el input de nota del libro.
 *
 * (Existe también crearSeleccionSimpleSinEnunciado, para cuando no hay una
 * pregunta visible y el estudiante solo elige entre varias opciones sueltas.)
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionSimpleConEnunciado(1, {
 *       items: [
 *         {
 *           enunciado: '¿Cuál es la capital de Ecuador?',
 *           opciones: ['Guayaquil', 'Quito', 'Cuenca'],
 *           correcta: 1,
 *         },
 *       ],
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * `correcta` es el índice (empieza en 0) de la opción correcta dentro de
 * `opciones`. El primer parámetro (id) y el tercero (puntaje) funcionan
 * igual que en el resto de funciones — ver utilidades/contenedor.ts.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las preguntas;
 * pon false para mantener el orden de "items". No afecta la calificación.
 *
 * `crearSeleccionSimpleConEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta cada tarjeta, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra selecciones y colores, deja todo en blanco.
 * ============================================================================
 */
interface SeleccionSimpleConEnunciadoItem {
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correcta: number;
}
interface SeleccionSimpleConEnunciadoDatos {
    items: SeleccionSimpleConEnunciadoItem[];
    /** Baraja el orden de las preguntas. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionSimpleConEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionSimpleConEnunciadoInstancia {
    revisar(): SeleccionSimpleConEnunciadoResultado;
    obtenerResultado(): SeleccionSimpleConEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionSimpleConEnunciado(id: IdentificadorActividad, datos: SeleccionSimpleConEnunciadoDatos, puntaje?: number): SeleccionSimpleConEnunciadoInstancia;

// --- seleccionSimpleSinEnunciado ---
/**
 * ============================================================================
 *  Selección simple — sin enunciado
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra un grupo de opciones sueltas (sin una pregunta visible propia —
 * el enunciado, si existe, va en el HTML del libro, fuera de esta función)
 * de las que el estudiante elige una sola. La cantidad de opciones puede
 * variar bastante (2, 3, 5, 10...), así que por defecto se acomodan en una
 * cuadrícula flexible en vez de una lista vertical fija — si prefieres una
 * sola columna, manda `columna: true`.
 *
 * Es un componente con 5 variantes visuales — la lógica de selección y
 * calificación es siempre la misma, lo que cambia es cómo se representa
 * visualmente que una opción está seleccionada:
 *   - 'pintar'    -> la caja se rellena de color (como si el color apareciera).
 *   - 'subrayar'  -> aparece una línea debajo del texto, dibujándose.
 *   - 'check'     -> aparece un ✓ dibujándose dentro de una casilla.
 *   - 'cruz'      -> aparece una ✗ dibujándose dentro de una casilla.
 *   - 'circulo'   -> aparece un círculo dibujándose alrededor de la opción.
 * Por defecto es 'check' si no se indica.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las opciones; pon
 * false para mantener el orden de "opciones". La calificación se resuelve
 * por el índice original, nunca por el orden visual.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById).
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <p>Encierra la palabra que corresponde a un mamífero.</p>
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     const instancia = crearSeleccionSimpleSinEnunciado(1, {
 *       opciones: ['Delfín', 'Tiburón', 'Pulpo', 'Medusa'],
 *       correcta: 0,
 *       variante: 'circulo',
 *       columna: false,
 *     }, 2);
 *
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota } (total siempre es 1)
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro (id) y el tercero (puntaje) funcionan igual que en
 * el resto de funciones — ver utilidades/contenedor.ts. Si no se selecciona
 * ninguna opción, la actividad cuenta como incorrecta al revisar.
 *
 * `crearSeleccionSimpleSinEnunciado` devuelve una instancia con:
 *   - revisar(): califica, pinta el feedback, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra la selección y el feedback, deja todo en blanco.
 * ============================================================================
 */
type VarianteSeleccionSinEnunciado = 'pintar' | 'subrayar' | 'check' | 'cruz' | 'circulo';
interface SeleccionSimpleSinEnunciadoDatos {
    /** Cada opción admite HTML (se inserta con innerHTML, no como texto plano). */
    opciones: string[];
    correcta: number;
    variante?: VarianteSeleccionSinEnunciado;
    columna?: boolean;
    /** Baraja el orden de las opciones. Por defecto true. */
    aleatorio?: boolean;
}
interface SeleccionSimpleSinEnunciadoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface SeleccionSimpleSinEnunciadoInstancia {
    revisar(): SeleccionSimpleSinEnunciadoResultado;
    obtenerResultado(): SeleccionSimpleSinEnunciadoResultado;
    reiniciar(): void;
}
declare function crearSeleccionSimpleSinEnunciado(id: IdentificadorActividad, datos: SeleccionSimpleSinEnunciadoDatos, puntaje?: number): SeleccionSimpleSinEnunciadoInstancia;

// --- verdaderoFalso ---
/**
 * ============================================================================
 *  Verdadero / Falso
 * ============================================================================
 *
 * ¿Qué hace?
 * Muestra una lista de enunciados, cada uno con dos botones tipo píldora
 * ("V" y "F") para que el estudiante marque su respuesta. Incluye un botón
 * "Revisar respuestas" que pinta cada tarjeta en verde o rojo, calcula el
 * puntaje y lo escribe en el input de nota del libro.
 *
 * IMPORTANTE: la función NUNCA crea el contenedor ni el input de nota —
 * los dos deben existir ya en tu HTML. La función solo los busca (con
 * document.getElementById) y usa el contenedor para pintar las tarjetas y
 * el input para escribirle el valor calculado.
 *
 * Cómo se manda a llamar (en el HTML/JS de un libro):
 *
 *   <div id="p1act"></div>
 *   <input type="text" id="pre1a" />
 *
 *   <script>
 *     // "1" -> busca el contenedor #p1act y, al revisar, el input #pre1a.
 *     // Ambos deben existir ya en el HTML de arriba. Vale 2 puntos.
 *     const instancia = crearVerdaderoFalso(1, {
 *       items: [
 *         { enunciado: 'El sol es una estrella.', correcta: 'V' },
 *         { enunciado: 'La Luna emite luz propia.', correcta: 'F' },
 *       ],
 *     }, 2);
 *
 *     // cuando quieras calificar (ej. dentro de tu función total()):
 *     const resultado = instancia.revisar();
 *     // resultado = { correctas, total, porcentaje, nota }
 *     // "nota" es un NÚMERO (resultado.porcentaje * 2, redondeado a 2
 *     // decimales) — el mismo valor que ya quedó escrito (como texto) en
 *     // #pre1a.value, por si lo necesitas sin leer el input.
 *   </script>
 *
 * El primer parámetro identifica la actividad, con 3 formas posibles:
 *   - número (ej. 1)      -> busca "#p1act",   y al revisar "#pre1a"
 *   - string (ej. "2_2")  -> busca "#p2_2act", y al revisar "#pre2_2a"
 *   - un HTMLElement ya existente -> se usa tal cual como contenedor, y
 *     NO se busca ningún input de nota (útil para demos o casos donde no
 *     hay un input "preXa" real).
 *
 * El tercer parámetro (`puntaje`, opcional) es cuántos puntos vale la
 * pregunta completa — si no se manda, vale 1. La nota que se escribe en
 * el input es siempre `resultado.porcentaje * puntaje`.
 *
 * `datos.aleatorio` (por defecto true) baraja el orden de las preguntas;
 * pon false para mantener el orden de "items". No afecta la calificación —
 * cada tarjeta sigue sabiendo cuál es su propia respuesta.
 *
 * Calificación: cada pregunta ya trae su propia respuesta correcta fija
 * (V o F) — no es una lista de opciones independientes como en Selección
 * Múltiple, así que cada pregunta vale 1/total. Acertarla suma 1/total;
 * marcarla mal resta solo la MITAD de eso ((1/total)/2), para que una sola
 * respuesta mala no sea tan drástica; dejarla en blanco no suma ni resta
 * (pero sigue contando como incorrecta al pintar). El resultado nunca baja
 * de 0.
 *
 * `crearVerdaderoFalso` devuelve una instancia con:
 *   - revisar(): califica, pinta cada tarjeta, escribe la nota en el input
 *     (si aplica) y devuelve el resultado.
 *   - obtenerResultado(): igual que revisar() pero sin pintar ni escribir nada.
 *   - reiniciar(): borra selecciones y colores, deja todo en blanco.
 * ============================================================================
 */
interface VerdaderoFalsoItem {
    /** Admite HTML (se inserta con innerHTML, no como texto plano). */
    enunciado: string;
    correcta: 'V' | 'F';
}
interface VerdaderoFalsoDatos {
    items: VerdaderoFalsoItem[];
    /** Baraja el orden de las preguntas. Por defecto true. */
    aleatorio?: boolean;
}
interface VerdaderoFalsoResultado {
    correctas: number;
    total: number;
    porcentaje: number;
    /** Nota final ya multiplicada por "puntaje" y redondeada a 2 decimales (el mismo valor que revisar() escribe en el input de nota, ahí como texto). */
    nota: number;
}
interface VerdaderoFalsoInstancia {
    revisar(): VerdaderoFalsoResultado;
    obtenerResultado(): VerdaderoFalsoResultado;
    reiniciar(): void;
}
declare function crearVerdaderoFalso(id: IdentificadorActividad, datos: VerdaderoFalsoDatos, puntaje?: number): VerdaderoFalsoInstancia;
