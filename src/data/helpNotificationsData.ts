export type HelpNotificationId =
  | 'canvas_vacio_descomponer'
  | 'canvas_vacio_investigar'
  | 'entrar_ejecucion'
  | 'primer_paso_ejecucion'
  | 'paso_completado'
  | 'volver_planeacion';

export interface HelpNotification {
  id: HelpNotificationId;
  title: string;
  description: string;
}

export const HELP_NOTIFICATIONS: Record<
  HelpNotificationId,
  HelpNotification
> = {
  canvas_vacio_descomponer: {
    id: 'canvas_vacio_descomponer',
    title: 'Descompón la tarea en grandes chunks, bloques o fases',
    description:
      'Estos chunks deben ser grandes bloques lógicos que describan la tarea.',
  },

  canvas_vacio_investigar: {
    id: 'canvas_vacio_investigar',
    title: '¿Nunca has hecho una tarea como esta?',
    description:
      'Y realmente no sabes cómo empezar. El primer chunk debería ser: ¡Investigar cómo hacerlo! Y luego volver acá a planear.',
  },

  entrar_ejecucion: {
    id: 'entrar_ejecucion',
    title: 'Recuerda dejarlo lo más ridículamente sencillo y claro',
    description:
      'Pon la regla de 2 minutos: solo harás la tarea por 2 minutos.',
  },

  primer_paso_ejecucion: {
    id: 'primer_paso_ejecucion',
    title: 'Empieza por lo más sencillo',
    description:
      'Recuerda dejar el primer paso lo más ridículamente sencillo y claro.',
  },

  paso_completado: {
    id: 'paso_completado',
    title: 'Cuando termines un paso, analiza',
    description:
      '¿Me acercó a mi meta, a finalizarla? Si te acercó, ¿qué tanto? ¿Pude haber cambiado algo?',
  },

  volver_planeacion: {
    id: 'volver_planeacion',
    title: 'Acá estamos como en un GPS',
    description:
      'Si te equivocas, no juzgamos, solo cambiamos de ruta y vemos cómo solucionamos.',
  },
};