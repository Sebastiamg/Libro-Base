# Guía general — digitalizar una unidad de un folleto (plantilla reutilizable)

Contexto para pegar en un chat nuevo de Claude Code cuando se vaya a digitalizar
otro folleto (ej. Física 2) siguiendo el mismo framework de "Folleto base"
(Física 1). Da el PDF de la unidad + este archivo y pide que construya las
actividades "al pie de la letra" según lo de acá.

## Qué es este proyecto

Proyecto Vite + TypeScript + Tailwind, sin backend. Cada actividad de una
página/unidad del libro impreso es un HTML standalone autocalificable:

```
src/actividades/uniXactY.html    <- HTML de la actividad (Tailwind)
src/contenido/uniXactY.ts        <- lógica: crea widgets, arma onCalificar/total()
src/entries/uniXactY.entry.ts    <- entrypoint que importa estilos/vendor/contenido
```

`vite.config.ts` descubre las entradas automáticamente por glob de
`src/actividades/*.html` (ver `scripts/entradas.mjs`) — no hay que registrar
la actividad en ningún manifiesto central.

`npm run dev` sirve un índice en `/` con enlaces a todas las actividades.
`npm run build` compila cada actividad como UN solo archivo HTML
(`vite-plugin-singlefile`) dentro de `dist/`.

## Flujo de trabajo (seguir en orden)

1. **Estudiar el PDF de la unidad nueva** (renderizar páginas a PNG con
   PyMuPDF y leerlas con el tool de lectura de imágenes — ver sección
   "Extraer contenido del PDF" abajo). El PDF suele ser la edición CON
   respuestas (edición docente): el texto de las respuestas aparece ya
   escrito/resaltado en un color distinto — eso es la clave de calificación,
   no contenido a ocultar ni a copiar tal cual en el HTML.
2. **Estudiar 1-2 actividades YA construidas del mismo tipo** (ideal:
   `uni6act3`/`uni6act4`/`uni6act5`/`uni6act6` de este mismo repo, o las
   equivalentes más parecidas al contenido nuevo) — leer tanto el `.html`
   como el `.ts` completos, no solo fragmentos. Replicar esa estructura "al
   pie de la letra": mismas clases Tailwind, misma convención de ids, mismo
   patrón de `crearMenu`/`onCalificar`/`total()`.
3. **Resolver de una vez cualquier ambigüedad de nombres de archivo** con
   `AskUserQuestion` en vez de adivinar — en especial si el usuario menciona
   un nombre de actividad que ya existe con contenido real (no crear un
   archivo "de referencia" encima sin confirmar).
4. **Elegir el widget correcto** para cada pregunta del PDF (ver catálogo
   abajo) y armar el plan de contenido completo ANTES de escribir código.
5. **Extraer imágenes reales embebidas en el PDF** (fotos, diagramas) que
   la actividad digitalizada deba mostrar — no inventar ni omitir si el
   original las trae. Ver convención de nombres abajo.
6. Escribir el triplete de archivos (`.html`, `.ts`, `.entry.ts`).
7. Verificar: `npx tsc --noEmit`, luego probar en el navegador de verdad
   (ver sección "Verificación" — el dev-server normal de este entorno puede
   apuntar al proyecto equivocado, hay una salida alternativa documentada).
8. `npm run build` para confirmar que compila como actividad standalone.
9. Limpiar: borrar `dist/`, detener cualquier servidor de desarrollo que se
   haya levantado a mano, borrar PNGs temporales del scratchpad.

## La estructura "PROPUESTA 4" (HTML) — copiar exactamente esta forma

```html
<!doctype html>
<html>
  <head>
    <title>Folleto base — Unidad N</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body class="bg-stone-50">
    <div class="book-page">
      <div class="book-card">
        <div class="book-card__body">
          <div id="encabezado" class="mb-8"></div>

          <!-- --- inicio --- -->

          <div class="mb-6 rounded-2xl border-2 border-violet-200 bg-linear-to-r from-violet-50 via-white to-violet-50 px-6 py-4 text-center">
            <strong class="text-lg font-black uppercase tracking-wide text-violet-700 sm:text-xl">
              Título de la sub-actividad 1
            </strong>
          </div>

          <!-- Pregunta 1 -->
          <div class="py-4 sm:py-5 print:py-3 flow-root">
            <!-- P1 punto# c-d -->
            <div class="p1 punto5"></div>
            <!-- Enunciado -->
            <div class="text-slate-800 text-base leading-relaxed mt-5 sm:mt-5">
              <span class="text-blue-600 font-bold text-lg mr-1.5">1.</span>
              <b>Verbo</b> el resto del enunciado tal como aparece en el libro.
            </div>
            <div id="p1act" class="w-full"></div>
          </div>

          <div class="mb-6 rounded-2xl border-2 border-orange-200 bg-linear-to-r from-orange-50 via-white to-orange-50 px-6 py-4 text-center">
            <strong class="text-lg font-black uppercase tracking-wide text-orange-700 sm:text-xl">
              Título de la sub-actividad 2
            </strong>
          </div>

          <!-- Pregunta 2 -->
          <div class="py-4 sm:py-5 print:py-3 flow-root">
            <!-- P2 punto# c-d -->
            <div class="p2 punto5"></div>
            <div class="text-slate-800 text-base leading-relaxed mt-5 sm:mt-5">
              <span class="text-blue-600 font-bold text-lg mr-1.5">2.</span>
              <b>Verbo</b> enunciado…
            </div>
            <div id="p2act" class="w-full"></div>
          </div>

          <!-- --- fin --- -->
        </div>
      </div>
    </div>

    <script type="module" src="/src/entries/uniXactY.entry.ts"></script>
  </body>
</html>
```

Reglas de esta estructura:

- Cada "Pregunta N" es un `div.py-4.sm:py-5.print:py-3.flow-root` que
  contiene, EN ESTE ORDEN: el badge de puntaje (`pN puntoX [c-d]`), el
  enunciado (con el número en `<span class="text-blue-600 font-bold
  text-lg mr-1.5">N.</span>` seguido de texto con `<b>` en el/los verbos
  de instrucción), cualquier imagen/tabla de apoyo, y el/los `div` de
  montaje del widget (`id="pNact"`, o `pN_Mact` si hay más de un widget
  bajo la misma pregunta).
- Cada sub-actividad distinta dentro del mismo archivo lleva su propia
  tarjeta de título ANTES de su "Pregunta", alternando el color de acento
  (violeta, naranja, y seguir con otros tonos de Tailwind si hay una
  tercera/cuarta sub-actividad: ámbar, esmeralda, etc.).
- El badge `pN puntoX [c-d]` lo genera `etiquetas.ts` en tiempo de
  ejecución a partir de esa clase — `X` es el puntaje total de ESA
  pregunta (puede cubrir más de un widget si van agrupados), `c-d` es
  opcional y marca "corrección docente" (no autocalificable, p.ej. un
  dibujo libre): si está presente, ese widget NUNCA se llama dentro de
  `total()`.
- Toda imagen de apoyo centrada usa:
  ```html
  <div class="w-full flex justify-center">
    <img src="/img/iN_pPP_actQ.png" style="border-radius: 10px; width: 60%" />
  </div>
  ```
- El contenedor de widget SIEMPRE es `<div id="pNact" class="w-full"></div>`
  — nunca lo crea la función del catálogo, solo lo busca por id.

## Convención de imágenes extraídas del PDF

`public/img/i{n}_p{página impresa}_act{N}.png`, donde:
- `n` = índice de la imagen dentro de esa página (1, 2, 3…).
- `página impresa` = número de página tal como aparece impreso en el PDF
  (no el índice de página del PDF ni el nombre del archivo).
- `act{N}` = a qué "Pregunta" de la actividad pertenece esa imagen.

Extraer SIEMPRE la imagen real embebida en el PDF (no un placeholder, no
una versión reescalada a mano) usando PyMuPDF (ver sección siguiente),
ignorando imágenes puramente decorativas de fondo de página (texturas,
iconos repetidos del layout editorial) — solo fotos/diagramas que la
actividad digitalizada necesita mostrar.

## Extraer contenido del PDF (Python + PyMuPDF)

Renderizar cada página a PNG para poder leerla con el tool de lectura de
imágenes:

```bash
python -c "
import fitz
doc = fitz.open(r'RUTA_AL_PDF.pdf')
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5))
    pix.save(f'pagina_{i+1}.png')
"
```

Extraer imágenes embebidas reales (fotos/diagramas) de una página:

```bash
python -c "
import fitz
doc = fitz.open(r'RUTA_AL_PDF.pdf')
page = doc[0]  # página 0-indexed
for img in page.get_images(full=True):
    xref = img[0]
    pix = fitz.Pixmap(doc, xref)
    print(xref, pix.width, pix.height)
    if pix.n - pix.alpha >= 4:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    pix.save(f'img_{xref}.png')
"
```

Filtrar por dimensiones/xref para descartar texturas de fondo de página
(suelen ser una imagen enorme cubriendo toda la página, presente en TODAS
las páginas con el mismo tamaño) — las fotos/diagramas de contenido son
las que cambian de una pregunta a otra.

Guardar los renders/extracciones en el directorio de scratchpad de la
sesión (nunca en el repo), y borrarlos al terminar.

## Catálogo de widgets (`src/types/funciones/*.d.ts`) — leer el `.d.ts`
## exacto antes de usarlo, esto es solo un resumen para elegir cuál sirve

Todas las funciones `crear*` siguen la firma
`crear*(id, datos, puntaje?)` y devuelven una instancia con `revisar()`,
`obtenerResultado()` y `reiniciar()`. Ninguna crea su propio contenedor:
buscan el `div#p{id}act` que ya debe existir en el HTML.

| Función | Para qué sirve | `.revisar()` expone `.nota`? |
|---|---|---|
| `crearRellenarEspacios` | Párrafo(s) con espacios en blanco, banco de palabras (`modo:'select'`) o texto libre (`modo:'input'`). | Sí |
| `crearRelacionarLiteral` | Relacionar término (columna izq., se le asigna letra sola) con enunciado (columna der.), sin dibujar líneas. | Sí |
| `crearRelacionar` | Igual pero dibujando cuerdas/líneas entre las dos columnas. | revisar según su propio `.d.ts` — comprobar antes de usar |
| `crearCompletarTabla` | Tabla real con columnas, celdas fijas (`{etiqueta}`) y celdas editables (string/number). | **No** — solo `{correctas, total, porcentaje}` |
| `crearSeleccionMultipleSinEnunciado` | Marcar VARIAS opciones de una lista (checkbox), sin enunciado propio — para usar como "fila" repetida bajo un enunciado/tabla común. | **No** — solo `{correctas, total, porcentaje}` |
| `crearSeleccionSimpleSinEnunciado` / `ConEnunciado` | Igual pero una sola opción correcta (excluyente). | comprobar `.d.ts` |
| `crearVerdaderoFalso` | Lista de enunciados con Verdadero/Falso. | comprobar `.d.ts` |
| `crearResaltarPalabras` | Marcar palabras dentro de un texto corrido. | comprobar `.d.ts` |
| `crearLienzo` | Uno o más `<canvas>` de dibujo libre. NUNCA autocalificable — siempre `c-d` en el badge, nunca se llama en `total()`. | n/a |
| `crearCoevaluacion` | Rúbrica de coevaluación entre estudiantes. | n/a — no aporta a `total()` |
| `crearPanelInformativo` / `crearRenglones` | Contenido informativo o de apoyo, sin calificación (aportan `total=0`, no distorsionan la nota si igual se registran). | n/a |

**IMPORTANTE — no asumir que todo trae `.nota`:** `crearRellenarEspacios`
y `crearRelacionarLiteral` sí exponen `.nota` (ya ponderada 0–puntaje)
directamente en el resultado de `.revisar()`. `crearCompletarTabla` y
`crearSeleccionMultipleSinEnunciado` (y posiblemente otras — VERIFICAR el
`.d.ts` de cada una antes de escribir `total()`) **no** tienen `.nota`,
solo `{correctas, total, porcentaje}` — en esos casos hay que multiplicar
a mano: `resultado.porcentaje * puntajeDeEsaPregunta`.

### Patrón para una matriz/tabla de checkboxes (sin widget nativo de grilla)

Si el PDF trae una tabla "Situación × Tipo, marca con X" y no hay un
widget que soporte una grilla completa: usar UNA instancia de
`crearSeleccionMultipleSinEnunciado` POR FILA (una por situación),
`columna:false`, con su propio enunciado como texto plano justo antes del
`div` de montaje (`id="pN_Mact"`), y sumar el promedio de sus
`.porcentaje` en `total()`. No hace falta una fila de encabezado manual
con los nombres de las columnas — cada instancia ya muestra sus propias
opciones (`opciones: [...]`) como etiquetas visibles junto a cada
casilla, así que un encabezado aparte casi siempre queda desalineado con
las cajas reales del widget.

## Patrón de `src/contenido/uniXactY.ts`

```ts
import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: X,
  tema: '',
  pagina: PP, // número de página IMPRESO del libro
  imagenUnidad: '/img/icono_aprendo_y_me_divierto.png', // o el ícono que corresponda a esa sección del libro
  anchoImagenUnidad: { movil: 370, desktop: 370 },
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">En la pregunta 1</b>, instrucción breve.',
    '<b class="text-blue-600">En la pregunta 2</b>, instrucción breve.',
  ],
  onCalificar: () => {
    const notaTotal = total();
    return notaTotal;
  },
  mostrarNota: nota => encabezado.mostrarNota(nota),
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

const p1 = crearAlgunWidget(1, { /* datos */ }, 5);
const p2 = crearOtroWidget(2, { /* datos */ }, 5);

function total() {
  const total1 = p1.revisar().nota; // o `.porcentaje * puntaje` si el widget no trae `.nota`
  const total2 = p2.revisar().nota;
  return total1 + total2;
}
```

Notas de este patrón:

- `crearMenu(...)` se llama ANTES de declarar `const p1 = ...` etc. Esto
  funciona porque `onCalificar`/`total()` solo se EJECUTAN al pulsar
  "Calificar" (mucho después de que el script terminó de correr
  top-to-bottom y ya asignó todas las `const`) — el closure sobre
  variables `const` declaradas más abajo en el archivo es válido en JS
  siempre que no se invoquen antes de esa línea.
- `total()` debe devolver un número 0–10 (la suma de los puntajes de
  cada pregunta, normalmente 5+5). Ese retorno es lo único que hace falta
  para que "Nota __ / 10" en el encabezado se actualice solo — no hay que
  llamar a `encabezado.mostrarNota(...)` a mano dentro de `total()`
  (`crearMenu` ya lo hace por medio de `mostrarNota` si `onCalificar`
  devuelve un `number`).
- Si una pregunta es de corrección docente (dibujo libre, ensayo, etc.):
  el badge lleva `c-d` en el HTML y esa pregunta simplemente NO se
  incluye dentro de `total()` — no se registra ni se suma su resultado.

## `src/entries/uniXactY.entry.ts` (siempre igual, cambiar solo el import)

```ts
import '../styles/tailwind.css';
import '../vendor/funciones/funciones.css';
import '../vendor/funciones/index.js';
import '../contenido/uniXactY';
```

## Verificación

1. `npx tsc --noEmit` — debe pasar sin errores.
2. Prueba visual real en navegador. **Cuidado**: el dev-server preconfigurado
   en `.claude/launch.json` (`vite-dev`) puede quedar apuntando al cwd de
   una sesión/proyecto vieja si hay procesos vite huérfanos corriendo en
   otros puertos — si el preview muestra el proyecto equivocado o un
   listado de actividades que no incluye las nuevas, NO asumas que el
   archivo está mal: levantá un servidor vite manual desde la carpeta
   correcta del proyecto y navegá a ese puerto:
   ```bash
   npx vite --port 5599 --strictPort
   ```
   y abrir `http://localhost:5599/src/actividades/uniXactY.html` — abrir
   el archivo directo como `file://` no sirve porque los `<script
   type="module">` no cargan por CORS.
3. En el navegador: revisar consola (sin errores), completar al menos un
   campo de cada widget, pulsar "Calificar" (vía el menú hamburguesa,
   ícono verde ✓) y confirmar que la "Nota __ / 10" del encabezado
   coincide con la suma esperada de cada sub-pregunta.
4. `npm run build` — debe compilar la actividad nueva como parte del
   listado de "N actividad(es) compiladas en dist/".
5. Limpieza: `rm -rf dist`, matar el proceso de `npx vite --port 5599`
   levantado a mano, borrar PNGs temporales usados para leer el PDF.

## Errores ya conocidos a evitar

- **No asumir `.nota` en todos los widgets** — ver tabla del catálogo.
  `crearCompletarTabla` y `crearSeleccionMultipleSinEnunciado` solo traen
  `.porcentaje`.
- **No usar `position:absolute` para el badge de puntaje** — el badge de
  `etiquetas.ts` usa `float-right` a propósito para que el enunciado lo
  rodee como texto normal; si hace falta blindar el ancho de un widget
  contra el efecto lateral de ese float, la solución ya existe en
  `tailwind.css` (`[id$='act'] { clear: both; }`) — no hay que tocarla ni
  reinventarla.
- **Los `<canvas>` no sobreviven el clonado para imprimir por su cuenta**
  — ya está resuelto en `print.ts` (captura `toDataURL()` antes de
  clonar); no hay que replicar esa lógica al crear una nueva actividad,
  solo saber que existe si aparece un bug de "el dibujo no se imprime".
- **No inventar ambigüedades de nombres de archivo** — si el nombre de
  actividad que pide el usuario para el contenido NUEVO coincide con uno
  que ya tiene contenido real (posible referencia a estudiar), preguntar
  con `AskUserQuestion` antes de sobrescribir nada.
