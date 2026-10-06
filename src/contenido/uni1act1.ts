import { crearMenu } from '../app/menu';
import { crearEncabezado } from '../app/header';
import { calificarActividad } from '../app/grading';
import { registrar } from '../app/registry';

const encabezado = crearEncabezado(document.getElementById('encabezado')!, {
  unidad: 1,
  tema: 'Actividad de prueba',
  pagina: 1,
  imagenUnidad: '/img/icono_aprendo_y_me_divierto.png',
  anchoImagenUnidad: {
    movil: 370,
    desktop: 370,
  },
});

crearMenu({
  ayudas: [
    '<b class="text-blue-600">Preguntas 1 a 3</b>, elige o marca las respuestas correctas.',
    '<b class="text-blue-600">Preguntas 4 y 5</b>, indica verdadero o falso y completa las oraciones.',
    '<b class="text-blue-600">Preguntas 6 y 7</b>, relaciona cada concepto con su pareja.',
    '<b class="text-blue-600">Preguntas 8 a 10</b>, completa la tabla, resalta los términos y resuelve el crucigrama.',
  ],
  onCalificar: () => calificarActividad(document, encabezado),
  onNombreEstudiante: nombre => encabezado.mostrarAlumno(nombre),
});

// 1. Selección simple con enunciado
registrar(
  crearSeleccionSimpleConEnunciado(
    1,
    {
      items: [
        {
          enunciado: '¿Cuál es la unidad de fuerza en el Sistema Internacional?',
          opciones: ['Newton (N)', 'Joule (J)', 'Watt (W)', 'Pascal (Pa)'],
          correcta: 0,
        },
      ],
    },
    1,
  ),
);

// 2. Selección simple sin enunciado
registrar(
  crearSeleccionSimpleSinEnunciado(
    2,
    {
      opciones: ['Velocidad', 'Masa', 'Temperatura', 'Tiempo'],
      correcta: 0,
      variante: 'circulo',
      columna: false,
    },
    1,
  ),
);

// 3. Selección múltiple sin enunciado
registrar(
  crearSeleccionMultipleSinEnunciado(
    3,
    {
      opciones: ['Fuerza', 'Masa', 'Velocidad', 'Tiempo', 'Desplazamiento'],
      correctas: [0, 2, 4],
      variante: 'check',
      columna: false,
    },
    1,
  ),
);

// 4. Verdadero o falso
registrar(
  crearVerdaderoFalso(
    4,
    {
      items: [
        {
          enunciado: 'La rapidez y la velocidad son siempre lo mismo.',
          correcta: 'F',
        },
        {
          enunciado: 'Un cuerpo en reposo tiene velocidad igual a cero.',
          correcta: 'V',
        },
        {
          enunciado:
            'En la Tierra, la aceleración de la gravedad es aproximadamente 9,8 m/s².',
          correcta: 'V',
        },
      ],
    },
    1,
  ),
);

// 5. Rellenar espacios
registrar(
  crearRellenarEspacios(
    5,
    {
      items: [
        {
          texto: 'La energía no se crea ni se destruye, solo se ___.',
          respuestas: ['transforma'],
        },
        {
          texto: 'La energía asociada al movimiento se llama energía ___.',
          respuestas: ['cinética'],
        },
        {
          texto: 'Un objeto en lo alto de una pendiente tiene energía ___.',
          respuestas: ['potencial'],
        },
      ],
      modo: 'select',
      opciones: ['transforma', 'cinética', 'potencial', 'térmica'],
      numeracion: 'letras',
    },
    1,
  ),
);

// 6. Relacionar literal
registrar(
  crearRelacionarLiteral(
    6,
    {
      literales: ['Aceleración', 'Inercia', 'Trabajo', 'Potencia'],
      items: [
        {
          enunciado: 'Rapidez con la que cambia la velocidad de un cuerpo.',
          correcta: 'Aceleración',
        },
        {
          enunciado:
            'Tendencia de un cuerpo a mantener su estado de reposo o movimiento.',
          correcta: 'Inercia',
        },
        {
          enunciado: 'Fuerza aplicada a lo largo de una distancia.',
          correcta: 'Trabajo',
        },
        {
          enunciado: 'Trabajo realizado en cada unidad de tiempo.',
          correcta: 'Potencia',
        },
      ],
    },
    1,
  ),
);

// 7. Relacionar con cuerdas
registrar(
  crearRelacionar(
    7,
    {
      pares: [
        { item: 'Fuerza', respuesta: 'Newton (N)' },
        { item: 'Energía', respuesta: 'Joule (J)' },
        { item: 'Velocidad', respuesta: 'Metro por segundo (m/s)' },
        { item: 'Masa', respuesta: 'Kilogramo (kg)' },
      ],
    },
    1,
  ),
);

// 8. Completar tabla
registrar(
  crearCompletarTabla(
    8,
    {
      columnas: [
        {
          titulo: 'Recorrido',
          celdas: [
            { etiqueta: 'Ciclista' },
            { etiqueta: 'Corredor' },
            { etiqueta: 'Caminante' },
          ],
        },
        { titulo: 'Distancia', celdas: ['100 m', '200 m', '300 m'] },
        { titulo: 'Tiempo', celdas: ['10 s', '20 s', '50 s'] },
        { titulo: 'Rapidez', celdas: ['10 m/s', '10 m/s', '6 m/s'] },
      ],
    },
    1,
  ),
);

// 9. Resaltar palabras
registrar(
  crearResaltarPalabras(
    9,
    {
      texto:
        'El **auto** avanza por la **carretera**. Al frenar, la fuerza de **rozamiento** entre las llantas y el suelo lo detiene, mientras que la **inercia** hace que los **pasajeros** se inclinen hacia adelante.',
      correctas: [2, 3],
      variante: 'resaltar',
    },
    1,
  ),
);

// 10. Crucigrama
registrar(
  crearCrucigrama(
    10,
    {
      palabras: [
        {
          respuesta: 'FUERZA',
          pista: 'Interacción que puede cambiar el movimiento de un cuerpo.',
        },
        {
          respuesta: 'ENERGIA',
          pista: 'Capacidad de un sistema para realizar trabajo.',
        },
        {
          respuesta: 'MASA',
          pista: 'Cantidad de materia de un cuerpo; se mide en kilogramos.',
        },
        {
          respuesta: 'VELOCIDAD',
          pista: 'Rapidez con dirección y sentido.',
        },
        {
          respuesta: 'INERCIA',
          pista: 'Resistencia de un cuerpo a cambiar su estado de movimiento.',
        },
      ],
    },
    1,
  ),
);
