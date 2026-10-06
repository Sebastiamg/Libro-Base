export interface ControlDeVoz {
  /** true si el navegador soporta lectura en voz alta (SpeechSynthesis). */
  soportado: boolean;
  iniciar(): void;
  detener(): void;
}

/** Lector de voz para el panel de Ayudas (botones Escuchar/Detener). */
export function crearControlDeVoz(texto: string): ControlDeVoz {
  const synth = window.speechSynthesis as SpeechSynthesis | undefined;
  if (!synth) {
    return { soportado: false, iniciar() {}, detener() {} };
  }

  let utterance: SpeechSynthesisUtterance | null = null;

  return {
    soportado: true,
    iniciar() {
      utterance = new SpeechSynthesisUtterance(texto);
      synth.speak(utterance);
    },
    detener() {
      synth.cancel();
    },
  };
}
