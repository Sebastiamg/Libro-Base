# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes de educación básica/bachillerato en Ecuador, que resuelven actividades interactivas de un libro de texto directamente en el navegador (en clase o en casa). Cada actividad muestra el nombre del estudiante y permite autocalificación con retroalimentación inmediata.

## Product Purpose

Digitalizar fielmente unidades de libros de texto impresos ya publicados (Física/Funciones, y potencialmente Química, Matemática, Sociales, Naturales, Lengua, Ciudadanía, etc.) como actividades HTML/JS interactivas y autocalificables, preservando el contenido, la numeración de página y la estructura pedagógica del libro original. Cada archivo `src/entries/*.entry.ts` + `src/contenido/*.ts` corresponde a una actividad de una página/unidad específica del libro impreso.

## Positioning

No es una plataforma de autoría de actividades nuevas ni un rediseño pedagógico: es una digitalización fiel de material impreso existente, actividad por actividad, que convierte cada página del libro en una experiencia interactiva autocalificable sin depender de un backend. El framework común (`registry.ts`, `menu.ts`, `header.ts`, `grading.ts`, plantillas Sumérgete/Entraña/Da forma/Prueba, Aprendo con ciencia, STEAMission) existe para reproducir consistentemente el diseño editorial del libro impreso, no para inventar nuevas dinámicas pedagógicas.

## Operating Context

- Unidades organizadas por materia/libro; este repo actualmente contiene actividades de una unidad de Física/Funciones (recorrido, dirección, desplazamiento) con más unidades (uni1–uni6) ya construidas.
- El proceso de digitalización parte del PDF de una unidad del libro impreso y se construye siguiendo un framework común documentado (ver agente `crear-unidad` en `.claude/agents/`); ese framework fija las fases pedagógicas de cada plantilla.
- Tres plantillas base conviven en el repo: plantilla simple (Sumérgete/Entraña/Imaginación/Da forma/Paso a paso/Prueba), Aprendo con ciencia (freeform + Necesitas + Procedimiento), y STEAMission (6 fases: Identificar…Difundir).
- Build de un solo archivo HTML por actividad (Vite + `vite-plugin-singlefile`), sin backend; pensado para distribuirse como archivo suelto o incrustarse en un LMS/entorno escolar.
- Cada actividad muestra un encabezado con unidad, tema, número de página e imagen de unidad, replicando el layout del libro impreso.
- Incluye soporte de texto a voz (`speech.ts`) y diálogo de guardado de progreso (`save-dialog.ts`).

## Capabilities and Constraints

- Autocalificación y feedback inmediato: cada actividad debe poder calificarse por sí sola (`grading.ts`) y mostrar retroalimentación al estudiante sin backend.
- Todo el procesamiento ocurre en el navegador; no hay servidor ni persistencia remota.
- La estructura pedagógica de cada plantilla (nombre y orden de sus fases) es fija por plantilla y no debe alterarse al rediseñar visualmente — el rediseño puede cambiar la presentación visual, no la secuencia pedagógica ni el contenido del libro digitalizado.
- Accesibilidad de uso escolar: lectura en voz alta (texto a voz) y tamaños de letra apropiados para el entorno educativo.
- Terminología en español (Ecuador): "Sumérgete en el mundo", "Entraña el problema", "Da forma a tus ideas", "Prueba y evoluciona", "Aprendo con ciencia", "STEAMission", "coevaluación", "renglones", "panel informativo".
- El contenido (texto, preguntas, criterios de coevaluación) proviene del libro impreso original y no debe alterarse en su significado al hacer trabajo de diseño.

## Accessibility & Inclusion

Debe soportar lectura en voz alta (texto a voz) y tamaños de letra legibles para estudiantes de básica/bachillerato en un entorno escolar ecuatoriano.

## Product Principles

- Fidelidad al libro impreso: el contenido, la estructura pedagógica y la numeración de página del material original se preservan siempre.
- Autonomía total en el navegador: ninguna actividad depende de un backend para calificar o dar retroalimentación.
- Consistencia entre plantillas: Sumérgete/Entraña/Da forma/Prueba, Aprendo con ciencia y STEAMission comparten un mismo lenguaje visual y componentes base (menú, encabezado, calificación).
- Accesibilidad escolar ante todo: texto a voz y tipografía legible no son opcionales.
- El diseño visual puede evolucionar; el contenido y la secuencia pedagógica del libro digitalizado, no.
