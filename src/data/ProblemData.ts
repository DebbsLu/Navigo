// src/data/ProblemData.ts

export type ProblemCategoryId =
  | 'avance'
  | 'direccion'
  | 'atencion'
  | 'emocion';

export interface ProblemSolution {
  id: string;
  title: string;
  description: string;
}

export interface ProblemType {
  id: string;
  title: string;
  description: string;
  solutions: ProblemSolution[];
}

export interface ProblemCategory {
  id: ProblemCategoryId;
  title: string;
  subtitle: string;
  problems: ProblemType[];
}

export const PROBLEM_DATA: ProblemCategory[] = [
  {
    id: 'avance',
    title: 'Avance',
    subtitle: 'Esfuerzo, dificultad',
    problems: [
      {
        id: 'me_cuesta_empezar',
        title: 'Me cuesta empezar',
        description:
          'Sé que debo hacerlo, pero me cuesta dar el primer paso.',
        solutions: [
          {
            id: 'regla_2_minutos',
            title: 'Aplica la regla de los 2 minutos',
            description:
              'Comprométete a trabajar solo 120 segundos sin obligación de continuar.',
          },
          {
            id: 'micro_accion',
            title: 'Define una micro-acción',
            description:
              'Reduce el primer paso a algo ridículamente pequeño, como abrir el archivo o escribir una palabra.',
          },
        ],
      },
      {
        id: 'tarea_demasiado_grande',
        title: 'La tarea se siente demasiado grande',
        description:
          'Veo todo lo que tengo que hacer y me cuesta empezar.',
        solutions: [
          {
            id: 'aislar_chunk',
            title: 'Aísla un solo chunk',
            description:
              'Oculta el resto del proyecto y enfócate únicamente en una sub-tarea inmediata.',
          },
          {
            id: 'primer_borrador',
            title: 'Aplica el principio de "primer borrador"',
            description:
              'Haz una versión rápida e imperfecta sin juzgar el resultado.',
          },
        ],
      },
      {
        id: 'sin_energia_motivacion',
        title: 'No tengo la energía o motivación',
        description:
          'Siento que necesito estar en otro estado para poder hacerlo.',
        solutions: [
          {
            id: 'bajar_intensidad',
            title: 'Baja la intensidad',
            description:
              'Realiza la versión más fácil o mecánica de la tarea para generar impulso.',
          },
          {
            id: 'reset_fisico',
            title: 'Haz un reset físico',
            description:
              'Camina 3 minutos, toma agua o cambia de postura antes de reintentar.',
          },
        ],
      },
    ],
  },

  {
    id: 'direccion',
    title: 'Falta de dirección',
    subtitle: 'Confusión, saturación',
    problems: [
      {
        id: 'demasiadas_cosas',
        title: 'Tengo demasiadas cosas en la cabeza',
        description:
          'Estoy intentando pensar en muchas cosas y no sé por dónde seguir.',
        solutions: [
          {
            id: 'vaciado_mental',
            title: 'Vaciado mental rápido',
            description:
              'Escribe todo en una lista externa para liberar memoria de trabajo.',
          },
          {
            id: 'seleccion_unica',
            title: 'Selección única',
            description:
              'Elige una sola cosa de la lista y posterga conscientemente todas las demás.',
          },
        ],
      },
      {
        id: 'siguiente_paso',
        title: 'No sé cuál es el siguiente paso',
        description:
          'No tengo claro qué debo hacer ahora.',
        solutions: [
          {
            id: 'order_technique',
            title: 'Aplica el Order Technique',
            description:
              'Revisa la estructura general de tu proyecto para ubicar la etapa actual.',
          },
          {
            id: 'pregunta_accion',
            title: 'Hazte la pregunta de acción',
            description:
              'Pregúntate: "¿Cuál es la acción física concreta que debo hacer ahora?".',
          },
        ],
      },
      {
        id: 'perdi_el_hilo',
        title: 'Perdí el hilo',
        description:
          'Retomé la tarea y ya no recuerdo exactamente dónde o cómo continuar.',
        solutions: [
          {
            id: 'leer_notas',
            title: 'Lee las últimas notas',
            description:
              'Revisa lo último que escribiste o creaste para reactivar el contexto.',
          },
          {
            id: 'reconstruir_mapa',
            title: 'Reconstruye el mapa mental',
            description:
              'Haz un dibujo rápido del punto en el que te quedaste antes de pausar.',
          },
        ],
      },
    ],
  },

  {
    id: 'atencion',
    title: 'Atención',
    subtitle: 'Distracción, impulsos',
    problems: [
      {
        id: 'quiero_otra_cosa',
        title: 'Me dieron ganas de hacer otra cosa',
        description:
          'Quiero revisar el teléfono, abrir otra pestaña o hacer algo rápido.',
        solutions: [
          {
            id: 'anotar_distraccion',
            title: 'Anota la distracción',
            description:
              'Escribe la idea en un papel para revisarla cuando termines la sesión.',
          },
          {
            id: 'barrera_friccion',
            title: 'Crea una barrera de fricción',
            description:
              'Aleja el teléfono o cierra las pestañas secundarias inmediatamente.',
          },
        ],
      },
      {
        id: 'otra_cosa_urgente',
        title: 'Siento que otra cosa es más urgente',
        description:
          'De repente, otra tarea parece más importante que la que estoy haciendo.',
        solutions: [
          {
            id: 'prueba_despues',
            title: 'Aplica la prueba del "después"',
            description:
              'Pregúntate si pasará algo grave si lo resuelves en 30 minutos.',
          },
          {
            id: 'bloque_posterior',
            title: 'Agéndalo para el bloque posterior',
            description:
              'Anota la tarea urgente en tu lista y vuelve a tu bloque actual.',
          },
        ],
      },
      {
        id: 'escapar_incomodidad',
        title: 'Quiero escapar de la incomodidad',
        description:
          'Algo se me está haciendo difícil y quiero distraerme para dejar de sentirlo.',
        solutions: [
          {
            id: 'confusion_technique',
            title: 'Aplica la Confusion Technique',
            description:
              'Acepta la confusión como una señal de aprendizaje y describe dónde te trabaste.',
          },
          {
            id: 'temporizador_tolerancia',
            title: 'Temporizador de tolerancia',
            description:
              'Quédate con la molestia solo 5 minutos antes de decidir si tomas un descanso.',
          },
        ],
      },
    ],
  },

  {
    id: 'emocion',
    title: 'Emoción',
    subtitle: 'Frustración, aburrimiento',
    problems: [
      {
        id: 'miedo_hacerlo_mal',
        title: 'Tengo miedo de hacerlo mal',
        description:
          'Quiero que salga bien y me preocupa equivocarme.',
        solutions: [
          {
            id: 'mentalidad_borrador',
            title: 'Adopta la mentalidad de borrador',
            description:
              'Hazlo mal a propósito primero para tener una base que corregir.',
          },
          {
            id: 'separar_ejecucion_evaluacion',
            title: 'Separa ejecución de evaluación',
            description:
              'Enfócate en avanzar ahora; la revisión crítica vendrá después.',
          },
        ],
      },
      {
        id: 'frustrado',
        title: 'Estoy frustrado/a',
        description:
          'Algo no está funcionando y me está costando continuar.',
        solutions: [
          {
            id: 'cambiar_perspectiva',
            title: 'Cambia de perspectiva',
            description:
              'Explica el problema en voz alta como si se lo enseñaras a alguien más.',
          },
          {
            id: 'pausa_estrategica',
            title: 'Pausa estratégica',
            description:
              'Detén la tarea por 5 minutos para calmarte antes de reintentar.',
          },
        ],
      },
      {
        id: 'aburrido_desconectado',
        title: 'Estoy aburrido/a o desconectado/a',
        description:
          'La tarea es repetitiva y me cuesta mantener el interés.',
        solutions: [
          {
            id: 'gamificar_tiempo',
            title: 'Gamifica el tiempo',
            description:
              'Desafíate a completar la sub-tarea en un tiempo límite corto.',
          },
          {
            id: 'conectar_meta',
            title: 'Conecta con la meta final',
            description:
              'Visualiza qué objetivo mayor se destraba al completar este trámite.',
          },
        ],
      },
      {
        id: 'arrepentimiento_procrastinacion',
        title: 'No dejo de pensar que debí empezar antes',
        description:
          'Me preocupa haberlo dejado para después y eso me distrae.',
        solutions: [
          {
            id: 'perdon_procrastinacion',
            title: 'Perdón de procrastinación',
            description:
              'Acepta el tiempo transcurrido y enfócate únicamente en los próximos 10 minutos.',
          },
          {
            id: 'enfoque_presente',
            title: 'Enfoque en el presente',
            description:
              'Recuerda que avanzar un 1% hoy es mejor que dejarlo en 0%.',
          },
        ],
      },
    ],
  },
];