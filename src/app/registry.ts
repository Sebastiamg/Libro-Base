/**
 * Todas las funciones del catálogo de "Funciones" (crearPanelInformativo,
 * crearRenglones, crearCoevaluacion, etc.) devuelven una instancia con la
 * misma forma: revisar()/obtenerResultado() -> {correctas,total,porcentaje},
 * reiniciar(). Los widgets de puro contenido (panel informativo, renglones)
 * siempre devuelven total=0, así que sumarlos aquí no diluye la nota final
 * — participan del registro (para poder reiniciarlos todos juntos) sin
 * afectar la calificación.
 */
export interface ResultadoActividad {
  correctas: number;
  total: number;
  porcentaje: number;
  nota: number;
}

export interface ActividadInstancia {
  revisar(): ResultadoActividad;
  obtenerResultado(): ResultadoActividad;
  reiniciar(): void;
}

const instancias: ActividadInstancia[] = [];

/** Registra una instancia creada por crearXxx(...) para que "Calificar" la incluya. */
export function registrar<T extends ActividadInstancia>(instancia: T): T {
  instancias.push(instancia);
  return instancia;
}

/** Llama revisar() en todas las instancias registradas y devuelve el total acumulado. */
export function calificarTodo(): ResultadoActividad {
  let correctas = 0;
  let total = 0;
  for (const instancia of instancias) {
    const resultado = instancia.revisar();
    console.log(resultado);
    total += resultado.nota;
  }
  return { correctas, total, nota: total, porcentaje: total > 0 ? correctas / total : 0 };
}

/** Reinicia todas las instancias registradas (usado por "Recargar" si no se prefiere un reload completo). */
export function reiniciarTodo(): void {
  for (const instancia of instancias) instancia.reiniciar();
}
