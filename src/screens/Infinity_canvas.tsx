
// ------------------------------------
// IMPORTACIONES
// ------------------------------------

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ------------------------------------
// COMPONENTES
// ------------------------------------

import TexturedScreen from '../components/TexturedScreen';
import CanvasMenu from '../components/CanvasMenu';
import CanvasGestureLayer from '../components/CanvasGestureLayer';
import FloatingMenu from '../components/FloatingMenu';
import ModalProblemas from '../components/modal_problemas';
import AudioNode from '../components/AudioNode';
import ModalGrabarAudio from '../components/ModalGrabarAudio';
import InfoCard from '../components/InfoCard';
import { ModeToggle } from '../components/ModeToggle';

import ChunkNode, {
  ChunkStatus,
  ConnectionSide,
} from '../components/ChunkNode';

import ProblemNode from '../components/ChunkProblem';

import SolutionNode, {
  SolutionStatus,
} from '../components/SolutionNode';

// ------------------------------------
// DATOS
// ------------------------------------

import {
  ProblemType,
  ProblemSolution,
} from '../data/ProblemData';

import {
  HELP_NOTIFICATIONS,
  HelpNotificationId,
} from '../data/helpNotificationsData';

// ------------------------------------
// NAVEGACIÓN
// ------------------------------------

/**
  Parámetros disponibles para las pantallas
  utilizadas desde InfinityCanvas.
 */
type RootStackParamList = {
  InfinityCanvas: {
    taskId: string;
    title: string;
  };

  Reminders: {
    taskId: string;
    title: string;
  };

  Blocks: {
    missionId: string;
  };
};

type InfinityCanvasRouteProp = RouteProp<
  RootStackParamList,
  'InfinityCanvas'
>;

type InfinityCanvasNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'InfinityCanvas'
  >;

// ------------------------------------
// STORAGE
// ------------------------------------

/**
 * Genera la key de almacenamiento de los chunks
 * correspondientes a una tarea para poder usarse en otras pantallas.
 */
const GET_CANVAS_KEY = (taskId: string) =>
  `@canvas_chunks_${taskId}`;

/**
 * Genera la key de almacenamiento de los problemas.
 */
const GET_PROBLEMS_KEY = (taskId: string) =>
  `@canvas_problems_${taskId}`;

/**
 * Genera la key de almacenamiento de las soluciones.
 */
const GET_SOLUTIONS_KEY = (taskId: string) =>
  `@canvas_solutions_${taskId}`;

/**
 * Genera la key de almacenamiento de las conexiones.
 */
const GET_CONNECTIONS_KEY = (taskId: string) =>
  `@canvas_connections_${taskId}`;

// ------------------------------------
// TIPOS DE POSICIÓN
// ------------------------------------

/**
 * Coordenadas de un elemento dentro del mundo del canvas.
 */
interface NodePosition {
  x: number;
  y: number;
}

// ------------------------------------
// CONEXIONES VISUALES
// ------------------------------------

/**
 Indica qué puntos de conexión están activos
  en un nodo.
 */
interface NodeConnections {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

// ------------------------------------
// CHUNK
// ------------------------------------

/**
 * Información necesaria para representar un chunk
 * dentro del canvas.
 */
interface ChunkData {
  id: string;
  title: string;
  description: string;
  status: ChunkStatus;
  parentId?: string;
  position: NodePosition;
  connections: NodeConnections;
}

// ------------------------------------
// PROBLEM NODE
// ------------------------------------

/**
 * Información de un nodo que representa un problema.
 */
interface ProblemNodeData {
  id: string;
  title: string;
  description: string;
  position: NodePosition;
  connections: NodeConnections;
}

// ------------------------------------
// SOLUTION NODE
// ------------------------------------

/**
 * Información de un nodo que representa una solución.
 */
interface SolutionNodeData {
  id: string;
  title?: string;
  description: string;
  status?: SolutionStatus;
  position: NodePosition;
  connections: NodeConnections;
}

// ------------------------------------
// AUDIO NODE
// ------------------------------------

/**
 * Información de un nodo de audio.
 */
interface AudioNodeData {
  id: string;
  uri: string;
  position: NodePosition;
  connections: NodeConnections;
}

// ------------------------------------
// CONEXIÓN
// ------------------------------------

/**
 * Representa una conexión entre dos nodos.
 */
interface CanvasConnection {
  id: string;

  fromNodeId: string;
  fromSide: ConnectionSide;

  toNodeId: string;
  toSide: ConnectionSide;
}

// ------------------------------------
// CONEXIÓN PENDIENTE
// ------------------------------------

/**
 * Guarda temporalmente el primer punto seleccionado
 * mientras el usuario crea una conexión.
 */
interface PendingConnection {
  nodeId: string;
  side: ConnectionSide;
}

// ------------------------------------
// CONFIGURACIÓN DEL CANVAS
// ------------------------------------

const INITIAL_ZOOM = 1;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;

const WORLD_SIZE = 5000;
const WORLD_CENTER = WORLD_SIZE / 2;

// ------------------------------------
// DIMENSIONES DE LOS NODOS
// ------------------------------------

const NODE_WIDTH = 280;
const NODE_HEIGHT = 250;

const NODE_LEFT_OFFSET = 12;
const NODE_TOP_OFFSET = 24;

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

const InfinityCanvas: React.FC = () => {

  // =====================================================
  // ROUTE Y NAVEGACIÓN
  // =====================================================

  const route =
    useRoute<InfinityCanvasRouteProp>();

  const navigation =
    useNavigation<InfinityCanvasNavigationProp>();

  const {
    taskId,
    title,
  } = route.params;

  // =====================================================
  // MODO DEL CANVAS
  // =====================================================

  const AUDIO_STORAGE_KEY =
    `@canvas_audio_${taskId}`;

  const [mode, setMode] = useState<
    'planeacion' | 'ejecucion'
  >('planeacion');

  /**
   * Controla la apertura del modal para grabar audio.
   */
  const [showAudioModal, setShowAudioModal] =
    useState(false);

  // =====================================================
  // NOTIFICACIONES DE AYUDA
  // =====================================================

  const [
    activeHelpNotification,
    setActiveHelpNotification,
  ] = useState<HelpNotificationId | null>(null);

  /**
   * Evita mostrar varias veces la ayuda inicial
   * cuando el canvas está vacío.
   */
  const hasShownEmptyCanvasHelp =
    useRef(false);

  /**
   * Muestra una notificación de ayuda.
   */
  const showHelpNotification = (
    notificationId: HelpNotificationId
  ) => {
    setActiveHelpNotification(
      notificationId
    );
  };

  /**
   * Cierra la notificación de ayuda actual.
   */
  const closeHelpNotification = () => {
    setActiveHelpNotification(null);
  };

  /**
   * Obtiene la información de la notificación
   * actualmente activa.
   */
  const activeHelp =
    activeHelpNotification
      ? HELP_NOTIFICATIONS[
          activeHelpNotification
        ]
      : null;

  /**
   * Cambia entre modo planificación y ejecución.
   */
  const handleModeChange = (
    newMode:
      | 'planeacion'
      | 'ejecucion'
  ) => {

    // No hacemos nada si el modo seleccionado
    // ya es el modo actual.
    if (newMode === mode) {
      return;
    }

    setMode(newMode);

    // Aviso al entrar en modo ejecución.
    if (
      mode === 'planeacion' &&
      newMode === 'ejecucion'
    ) {
      showHelpNotification(
        'entrar_ejecucion'
      );
    }

    // Aviso al regresar al modo planificación.
    if (
      mode === 'ejecucion' &&
      newMode === 'planeacion'
    ) {
      showHelpNotification(
        'volver_planeacion'
      );
    }
  };

  // =====================================================
  // CHUNKS
  // =====================================================

  const [
    chunks,
    setChunks,
  ] = useState<ChunkData[]>([]);

  // =====================================================
  // NODOS DE AUDIO
  // =====================================================

  const [
    audioNodes,
    setAudioNodes,
  ] = useState<AudioNodeData[]>([]);

  // =====================================================
  // PROBLEMAS
  // =====================================================

  const [
    problemNodes,
    setProblemNodes,
  ] = useState<ProblemNodeData[]>([]);

  // =====================================================
  // SOLUCIONES
  // =====================================================

  const [
    solutionNodes,
    setSolutionNodes,
  ] = useState<SolutionNodeData[]>([]);

  // =====================================================
  // ESTADO DE CARGA
  // =====================================================

  /**
   * Permite evitar guardar información antes de que
   * el canvas termine de cargar los datos existentes.
   */
  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  // =====================================================
  // MODAL DE PROBLEMAS
  // =====================================================

  const [
    showProblemsModal,
    setShowProblemsModal,
  ] = useState(false);

  // =====================================================
  // SELECCIÓN DE NODOS
  // =====================================================

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState<string | null>(null);

  const [
    selectedConnectionId,
    setSelectedConnectionId,
  ] = useState<string | null>(null);

  // =====================================================
  // CONEXIONES
  // =====================================================

  const [
    connections,
    setConnections,
  ] = useState<CanvasConnection[]>([]);

  // =====================================================
  // CONEXIÓN PENDIENTE
  // =====================================================

  /**
   * Guarda el primer punto seleccionado al crear
   * una conexión entre nodos.
   */
  const [
    pendingConnection,
    setPendingConnection,
  ] = useState<PendingConnection | null>(
    null
  );

  // =====================================================
  // PAN
  // =====================================================

  /**
   * Desplazamiento del mundo dentro del viewport.
   */
  const pan =
    useRef(
      new Animated.ValueXY({
        x: 0,
        y: 0,
      })
    ).current;

  // =====================================================
  // ZOOM
  // =====================================================

  /**
   * Escala actual del canvas.
   */
  const zoom =
    useRef(
      new Animated.Value(
        INITIAL_ZOOM
      )
    ).current;

  // =====================================================
  // EFECTOS
  // =====================================================

  /**
   * Carga la información almacenada cada vez que
   * cambia la tarea.
   */
  useEffect(() => {
    loadCanvas();
  }, [taskId]);

  /**
   * Muestra una ayuda cuando el canvas está vacío
   * por primera vez.
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const isCanvasEmpty =
      chunks.length === 0 &&
      problemNodes.length === 0 &&
      solutionNodes.length === 0;

    if (
      isCanvasEmpty &&
      !hasShownEmptyCanvasHelp.current
    ) {
      hasShownEmptyCanvasHelp.current = true;

      showHelpNotification(
        'canvas_vacio_descomponer'
      );
    }
  }, [
    isLoaded,
    chunks.length,
    problemNodes.length,
    solutionNodes.length,
  ]);

  /**
   * Guarda los nodos de audio cuando cambian.
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(
      AUDIO_STORAGE_KEY,
      JSON.stringify(audioNodes)
    );
  }, [
    audioNodes,
    isLoaded,
  ]);

  /**
   * Guarda los chunks automáticamente.
   */
  useEffect(() => {
    if (isLoaded) {
      saveCanvasChunks(chunks);
    }
  }, [
    chunks,
    isLoaded,
  ]);

  /**
   * Guarda los problemas automáticamente.
   */
  useEffect(() => {
    if (isLoaded) {
      saveProblemNodes(problemNodes);
    }
  }, [
    problemNodes,
    isLoaded,
  ]);

  /**
   * Guarda las soluciones automáticamente.
   */
  useEffect(() => {
    if (isLoaded) {
      saveSolutionNodes(solutionNodes);
    }
  }, [
    solutionNodes,
    isLoaded,
  ]);

  /**
   * Guarda las conexiones automáticamente.
   */
  useEffect(() => {
    if (isLoaded) {
      saveConnections(connections);
    }
  }, [
    connections,
    isLoaded,
  ]);

  // =====================================================
  // MENÚ FLOTANTE
  // =====================================================

  /**
   * Procesa las opciones seleccionadas desde el
   * menú flotante.
   */
  const handleFloatingMenuOption = (
    option: string
  ) => {

    // Abrir menú de problemas.
    if (
      option ===
      'Algo te detiene: Problemas, Dist...'
    ) {
      setShowProblemsModal(true);
      return;
    }

    // Abrir grabadora de audio.
    if (
      option ===
      'Grabar audio para expresarse'
    ) {
      setShowAudioModal(true);
      return;
    }

    // Abrir recordatorios.
    if (
      option === 'Definir recordatorio'
    ) {
      navigation.navigate(
        'Reminders',
        {
          taskId,
          title,
        }
      );

      return;
    }
  };

  // =====================================================
  // AUDIO
  // =====================================================

  /**
   * Guarda un nuevo audio como nodo dentro del canvas.
   */
  const handleSaveAudio = (
    uri: string
  ) => {

    const audioId =
      `audio-${Date.now()}`;

    const audioPosition = {
      x:
        WORLD_CENTER -
        NODE_WIDTH / 2,

      y:
        WORLD_CENTER -
        NODE_HEIGHT / 2,
    };

    const newAudio: AudioNodeData = {
      id: audioId,
      uri,
      position: audioPosition,
      connections: {},
    };

    setAudioNodes(prev => [
      ...prev,
      newAudio,
    ]);

    setShowAudioModal(false);
  };

  // =====================================================
  // MENÚ DE BLOQUEOS
  // =====================================================

  /**
   * Abre la pantalla de bloqueos.
   */
  const handleOpenBlocks = () => {
    navigation.navigate(
      'Blocks',
      {
        missionId: taskId,
      }
    );
  };

  // =====================================================
  // CREAR PROBLEMA + SOLUCIÓN
  // =====================================================

  /**
   * Crea simultáneamente un nodo de problema,
   * un nodo de solución y su conexión.
   */
  const createProblemAndSolution = (
    problem: ProblemType,
    solutionTitle: string,
    solutionDescription: string
  ) => {

    // ---------------------------------------------------
    // Generar IDs
    // ---------------------------------------------------

    const problemId =
      `problem_${Date.now()}`;

    const solutionId =
      `solution_${Date.now()}_${Math.random()}`;

    // ---------------------------------------------------
    // Calcular posiciones
    // ---------------------------------------------------

    const baseX =
      WORLD_CENTER - 140;

    const baseY =
      WORLD_CENTER - 125;

    const problemPosition = {
      x: baseX,
      y: baseY,
    };

    const solutionPosition = {
      x: baseX + 360,
      y: baseY,
    };

    // ---------------------------------------------------
    // Crear problema
    // ---------------------------------------------------

    const newProblem: ProblemNodeData = {
      id: problemId,

      title:
        problem.title,

      description:
        problem.description,

      position:
        problemPosition,

      connections: {
        right: true,
      },
    };

    // ---------------------------------------------------
    // Crear solución
    // ---------------------------------------------------

    const newSolution: SolutionNodeData = {
      id: solutionId,

      title:
        solutionTitle,

      description:
        solutionDescription,

      status:
        'no_iniciado',

      position:
        solutionPosition,

      connections: {
        left: true,
      },
    };

    // ---------------------------------------------------
    // Crear conexión
    // ---------------------------------------------------

    const newConnection:
      CanvasConnection = {
        id:
          `problem_solution_${Date.now()}_${Math.random()}`,

        fromNodeId:
          problemId,

        fromSide:
          'right',

        toNodeId:
          solutionId,

        toSide:
          'left',
      };

    // ---------------------------------------------------
    // Agregar elementos al canvas
    // ---------------------------------------------------

    setProblemNodes(prev => [
      ...prev,
      newProblem,
    ]);

    setSolutionNodes(prev => [
      ...prev,
      newSolution,
    ]);

    setConnections(prev => [
      ...prev,
      newConnection,
    ]);

    // Seleccionar el problema recién creado.
    setSelectedNodeId(problemId);

    // Cerrar el modal.
    setShowProblemsModal(false);
  };

  // =====================================================
  // SOLUCIÓN PREDEFINIDA
  // =====================================================

  /**
   * Crea una solución utilizando una opción
   * previamente definida.
   */
  const handleSelectSolution = (
    problem: ProblemType,
    solution: ProblemSolution
  ) => {
    createProblemAndSolution(
      problem,
      solution.title,
      solution.description
    );
  };

  // =====================================================
  // SOLUCIÓN PERSONALIZADA
  // =====================================================

  /**
   * Crea una solución escrita manualmente por el usuario.
   */
  const handleAddCustomSolution = (
    text: string,
    problem: ProblemType
  ) => {
    createProblemAndSolution(
      problem,
      text,
      'Solución personalizada por el usuario.'
    );
  };

  // =====================================================
  // CAMBIAR ESTADO DE SOLUCIÓN
  // =====================================================

  /**
   * Actualiza el estado de una solución.
   */
  const handleChangeSolutionStatus = (
    id: string,
    newStatus: SolutionStatus
  ) => {
    setSolutionNodes(prev =>
      prev.map(node =>
        node.id === id
          ? {
              ...node,
              status: newStatus,
            }
          : node
      )
    );
  };

  // =====================================================
  // CREAR CHUNK
  // =====================================================

  /**
   * Agrega un nuevo paso principal al canvas.
   */
  const handleAddChunk = () => {

    const index =
      chunks.length;

    const newChunk: ChunkData = {
      id:
        Date.now().toString(),

      title:
        `Paso ${index + 1}: Subactividad`,

      description:
        'Escribe aquí los detalles del paso...',

      status:
        'no_iniciado',

      position: {
        x:
          WORLD_CENTER -
          140 +
          (index % 3) * 340,

        y:
          WORLD_CENTER -
          120 +
          Math.floor(index / 3) * 300,
      },

      connections: {},
    };

    setChunks(prev => [
      ...prev,
      newChunk,
    ]);

    setSelectedNodeId(
      newChunk.id
    );
  };

  // =====================================================
  // CREAR SUBPASO
  // =====================================================

  /**
   * Agrega un subpaso tomando como referencia
   * la posición del chunk padre.
   */
  const handleAddSubStep = (
    parentId: string
  ) => {

    const parent =
      chunks.find(
        chunk =>
          chunk.id === parentId
      );

    if (!parent) {
      return;
    }

    const newChunk: ChunkData = {
      id:
        Date.now().toString(),

      title:
        `Paso ${chunks.length + 1}: Subactividad`,

      description:
        'Escribe aquí los detalles del subpaso...',

      status:
        'no_iniciado',

      parentId,

      position: {
        x:
          parent.position.x + 340,

        y:
          parent.position.y,
      },

      connections: {},
    };

    setChunks(prev => [
      ...prev,
      newChunk,
    ]);

    setSelectedNodeId(
      newChunk.id
    );
  };

  // =====================================================
  // EDITAR CHUNK
  // =====================================================

  /**
   * Cambia el título de un chunk.
   */
  const handleChangeChunkTitle = (
    id: string,
    newTitle: string
  ) => {
    setChunks(prev =>
      prev.map(chunk =>
        chunk.id === id
          ? {
              ...chunk,
              title: newTitle,
            }
          : chunk
      )
    );
  };

  /**
   * Cambia la descripción de un chunk.
   */
  const handleChangeChunkDescription = (
    id: string,
    newDescription: string
  ) => {
    setChunks(prev =>
      prev.map(chunk =>
        chunk.id === id
          ? {
              ...chunk,
              description: newDescription,
            }
          : chunk
      )
    );
  };

  /**
   * Cambia el estado de un chunk.
   */
  const handleChangeChunkStatus = (
    id: string,
    newStatus: ChunkStatus
  ) => {
    setChunks(prev =>
      prev.map(chunk =>
        chunk.id === id
          ? {
              ...chunk,
              status: newStatus,
            }
          : chunk
      )
    );
  };

  // =====================================================
  // MOVIMIENTO DE NODOS
  // =====================================================

  /**
   * Mueve un nodo de audio teniendo en cuenta
   * el zoom actual del canvas.
   */
  const handleMoveAudio = (
    id: string,
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => {

    const currentZoom =
      (zoom as any).__getValue();

    const worldDx =
      dx / currentZoom;

    const worldDy =
      dy / currentZoom;

    setAudioNodes(prev =>
      prev.map(node =>
        node.id === id
          ? {
              ...node,

              position: {
                x:
                  startX + worldDx,

                y:
                  startY + worldDy,
              },
            }
          : node
      )
    );
  };

  /**
   * Mueve un chunk dentro del mundo del canvas.
   */
  const handleMoveChunk = (
    id: string,
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => {

    const currentZoom =
      (zoom as any).__getValue();

    const worldDx =
      dx / currentZoom;

    const worldDy =
      dy / currentZoom;

    setChunks(prev =>
      prev.map(chunk =>
        chunk.id === id
          ? {
              ...chunk,

              position: {
                x:
                  startX + worldDx,

                y:
                  startY + worldDy,
              },
            }
          : chunk
      )
    );
  };

  /**
   * Mueve un nodo de problema.
   */
  const handleMoveProblem = (
    id: string,
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => {

    const currentZoom =
      (zoom as any).__getValue();

    const worldDx =
      dx / currentZoom;

    const worldDy =
      dy / currentZoom;

    setProblemNodes(prev =>
      prev.map(node =>
        node.id === id
          ? {
              ...node,

              position: {
                x:
                  startX + worldDx,

                y:
                  startY + worldDy,
              },
            }
          : node
      )
    );
  };

  /**
   * Mueve un nodo de solución.
   */
  const handleMoveSolution = (
    id: string,
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => {

    const currentZoom =
      (zoom as any).__getValue();

    const worldDx =
      dx / currentZoom;

    const worldDy =
      dy / currentZoom;

    setSolutionNodes(prev =>
      prev.map(node =>
        node.id === id
          ? {
              ...node,

              position: {
                x:
                  startX + worldDx,

                y:
                  startY + worldDy,
              },
            }
          : node
      )
    );
  };

  // =====================================================
  // OBTENER NODO POR ID
  // =====================================================

  /**
   * Busca un nodo independientemente de su tipo.
   */
  const getNodeById = (
    id: string
  ) => {

    const chunk =
      chunks.find(
        node => node.id === id
      );

    if (chunk) {
      return {
        type: 'chunk' as const,
        node: chunk,
      };
    }

    const audio =
      audioNodes.find(
        node => node.id === id
      );

    if (audio) {
      return {
        type: 'audio' as const,
        node: audio,
      };
    }

    const problem =
      problemNodes.find(
        node => node.id === id
      );

    if (problem) {
      return {
        type: 'problem' as const,
        node: problem,
      };
    }

    const solution =
      solutionNodes.find(
        node => node.id === id
      );

    if (solution) {
      return {
        type: 'solution' as const,
        node: solution,
      };
    }

    return null;
  };

  // =====================================================
  // ACTIVAR PUNTO DE CONEXIÓN
  // =====================================================

  /**
   * Marca visualmente un punto de conexión como activo.
   */
  const activateConnectionPoint = (
    nodeId: string,
    side: ConnectionSide
  ) => {

    setChunks(prev =>
      prev.map(node =>
        node.id === nodeId
          ? {
              ...node,

              connections: {
                ...node.connections,
                [side]: true,
              },
            }
          : node
      )
    );

    setProblemNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? {
              ...node,

              connections: {
                ...node.connections,
                [side]: true,
              },
            }
          : node
      )
    );

    setAudioNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? {
              ...node,

              connections: {
                ...node.connections,
                [side]: true,
              },
            }
          : node
      )
    );

    setSolutionNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? {
              ...node,

              connections: {
                ...node.connections,
                [side]: true,
              },
            }
          : node
      )
    );
  };

  // =====================================================
  // ELIMINAR CONEXIÓN
  // =====================================================

  const handleRemoveConnection = (
    connectionId: string
  ) => {

    setConnections(prev =>
      prev.filter(
        connection =>
          connection.id !== connectionId
      )
    );

    setSelectedConnectionId(null);
  };

  // =====================================================
  // CREAR CONEXIÓN
  // =====================================================

  /**
   * Gestiona la selección de dos puntos de conexión
   * para crear una línea entre nodos.
   */
  const handleConnectionPointPress = (
    nodeId: string,
    side: ConnectionSide
  ) => {

    // ---------------------------------------------------
    // Primer punto
    // ---------------------------------------------------

    if (pendingConnection === null) {

      setPendingConnection({
        nodeId,
        side,
      });

      return;
    }

    // ---------------------------------------------------
    // Se seleccionó exactamente el mismo punto
    // ---------------------------------------------------

    if (
      pendingConnection.nodeId === nodeId &&
      pendingConnection.side === side
    ) {
      setPendingConnection(null);
      return;
    }

    // ---------------------------------------------------
    // Se seleccionó otro punto del mismo nodo
    // ---------------------------------------------------

    if (
      pendingConnection.nodeId === nodeId
    ) {
      setPendingConnection({
        nodeId,
        side,
      });

      return;
    }

    // ---------------------------------------------------
    // Comprobar si la conexión ya existe
    // ---------------------------------------------------

    const alreadyExists =
      connections.some(connection =>
        (
          connection.fromNodeId ===
            pendingConnection.nodeId &&
          connection.fromSide ===
            pendingConnection.side &&
          connection.toNodeId ===
            nodeId &&
          connection.toSide ===
            side
        ) ||
        (
          connection.fromNodeId ===
            nodeId &&
          connection.fromSide ===
            side &&
          connection.toNodeId ===
            pendingConnection.nodeId &&
          connection.toSide ===
            pendingConnection.side
        )
      );

    if (alreadyExists) {
      setPendingConnection(null);
      return;
    }

    // ---------------------------------------------------
    // Crear nueva conexión
    // ---------------------------------------------------

    const newConnection:
      CanvasConnection = {
        id:
          `${Date.now()}-${Math.random()}`,

        fromNodeId:
          pendingConnection.nodeId,

        fromSide:
          pendingConnection.side,

        toNodeId:
          nodeId,

        toSide:
          side,
      };

    setConnections(prev => [
      ...prev,
      newConnection,
    ]);

    // Activar visualmente ambos puntos.
    activateConnectionPoint(
      pendingConnection.nodeId,
      pendingConnection.side
    );

    activateConnectionPoint(
      nodeId,
      side
    );

    // Finalizar selección.
    setPendingConnection(null);
  };

  // =====================================================
  // ELIMINAR NODO
  // =====================================================

  /**
   * Elimina un nodo y todas las conexiones asociadas
   * a él.
   */
  const handleRemoveNode = (
    id: string
  ) => {

    // Eliminar chunk.
    setChunks(prev =>
      prev.filter(
        node => node.id !== id
      )
    );

    // Eliminar problema.
    setProblemNodes(prev =>
      prev.filter(
        node => node.id !== id
      )
    );

    // Eliminar solución.
    setSolutionNodes(prev =>
      prev.filter(
        node => node.id !== id
      )
    );

    // Eliminar audio.
    setAudioNodes(prev =>
      prev.filter(
        node => node.id !== id
      )
    );

    // Eliminar conexiones asociadas.
    setConnections(prev =>
      prev.filter(
        connection =>
          connection.fromNodeId !== id &&
          connection.toNodeId !== id
      )
    );

    // Cancelar conexión pendiente si corresponde.
    if (
      pendingConnection?.nodeId === id
    ) {
      setPendingConnection(null);
    }

    // Quitar selección.
    if (
      selectedNodeId === id
    ) {
      setSelectedNodeId(null);
    }
  };

  // =====================================================
  // SELECCIONAR NODO
  // =====================================================

  const handleSelectNode = (
    id: string
  ) => {
    setSelectedNodeId(id);
  };

  // =====================================================
  // DESELECCIONAR
  // =====================================================

  /**
   * Limpia la selección actual y cualquier conexión
   * que se encuentre en proceso de creación.
   */
  const handleDeselectNode = () => {

    setSelectedNodeId(null);
    setSelectedConnectionId(null);

    if (
      pendingConnection !== null
    ) {
      setPendingConnection(null);
    }
  };

  // =====================================================
  // POSICIÓN DE PUNTO DE CONEXIÓN
  // =====================================================

  /**
   * Calcula las coordenadas de un punto de conexión
   * según el lado del nodo.
   */
  const getConnectionPointPosition = (
    node: {
      position: NodePosition;
    },
    side: ConnectionSide
  ) => {

    const cardLeft =
      node.position.x +
      NODE_LEFT_OFFSET;

    const cardTop =
      node.position.y +
      NODE_TOP_OFFSET;

    if (side === 'top') {
      return {
        x:
          cardLeft +
          NODE_WIDTH / 2,

        y:
          cardTop,
      };
    }

    if (side === 'bottom') {
      return {
        x:
          cardLeft +
          NODE_WIDTH / 2,

        y:
          cardTop +
          NODE_HEIGHT,
      };
    }

    if (side === 'left') {
      return {
        x:
          cardLeft,

        y:
          cardTop +
          NODE_HEIGHT / 2,
      };
    }

    // Por defecto, el punto corresponde al lado derecho.
    return {
      x:
        cardLeft +
        NODE_WIDTH,

      y:
        cardTop +
        NODE_HEIGHT / 2,
    };
  };

  // =====================================================
  // RENDERIZAR CONEXIÓN
  // =====================================================

  /**
   * Dibuja una línea entre dos puntos del canvas.
   */
  const renderConnection = (
    connection: CanvasConnection
  ) => {

    const fromNode =
      getNodeById(
        connection.fromNodeId
      );

    const toNode =
      getNodeById(
        connection.toNodeId
      );

    // Si alguno de los nodos ya no existe,
    // no se puede renderizar la conexión.
    if (!fromNode || !toNode) {
      return null;
    }

    const start =
      getConnectionPointPosition(
        fromNode.node,
        connection.fromSide
      );

    const end =
      getConnectionPointPosition(
        toNode.node,
        connection.toSide
      );

    // Distancia horizontal y vertical.
    const dx =
      end.x - start.x;

    const dy =
      end.y - start.y;

    // Longitud de la línea.
    const length =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    // Ángulo de rotación de la línea.
    const angle =
      Math.atan2(dy, dx) *
      (180 / Math.PI);

    return (
      <View
        key={connection.id}
        pointerEvents="none"
        style={[
          styles.connectionLine,
          {
            left: start.x,
            top: start.y,
            width: length,

            transform: [
              {
                rotate: `${angle}deg`,
              },
            ],
          },
        ]}
      />
    );
  };

  // =====================================================
  // CARGAR CANVAS
  // =====================================================

  /**
   * Recupera del almacenamiento local todos los elementos
   * asociados a la tarea actual.
   */
  const loadCanvas = async () => {

    try {

      // -------------------------------------------------
      // AUDIO
      // -------------------------------------------------

      const storedAudios =
        await AsyncStorage.getItem(
          AUDIO_STORAGE_KEY
        );

      if (storedAudios) {
        setAudioNodes(
          JSON.parse(storedAudios)
        );
      } else {
        setAudioNodes([]);
      }

      // -------------------------------------------------
      // CHUNKS
      // -------------------------------------------------

      const chunksJson =
        await AsyncStorage.getItem(
          GET_CANVAS_KEY(taskId)
        );

      if (chunksJson !== null) {

        const savedChunks =
          JSON.parse(chunksJson);

        setChunks(savedChunks);

      } else {
        setChunks([]);
      }

      // -------------------------------------------------
      // PROBLEMAS
      // -------------------------------------------------

      const problemsJson =
        await AsyncStorage.getItem(
          GET_PROBLEMS_KEY(taskId)
        );

      if (problemsJson !== null) {

        const savedProblems =
          JSON.parse(problemsJson);

        setProblemNodes(
          savedProblems
        );

      } else {
        setProblemNodes([]);
      }

      // -------------------------------------------------
      // SOLUCIONES
      // -------------------------------------------------

      const solutionsJson =
        await AsyncStorage.getItem(
          GET_SOLUTIONS_KEY(taskId)
        );

      if (solutionsJson !== null) {

        const savedSolutions =
          JSON.parse(solutionsJson);

        setSolutionNodes(
          savedSolutions
        );

      } else {
        setSolutionNodes([]);
      }

      // -------------------------------------------------
      // CONEXIONES
      // -------------------------------------------------

      const connectionsJson =
        await AsyncStorage.getItem(
          GET_CONNECTIONS_KEY(taskId)
        );

      if (connectionsJson !== null) {

        const savedConnections =
          JSON.parse(
            connectionsJson
          );

        /**
         * Compatibilidad con conexiones antiguas
         * que utilizaban:
         *
         * fromChunkId
         * toChunkId
         *
         * En la versión actual se utilizan:
         *
         * fromNodeId
         * toNodeId
         */
        const normalizedConnections =
          savedConnections.map(
            (connection: any) => ({
              id:
                connection.id,

              fromNodeId:
                connection.fromNodeId ??
                connection.fromChunkId,

              fromSide:
                connection.fromSide,

              toNodeId:
                connection.toNodeId ??
                connection.toChunkId,

              toSide:
                connection.toSide,
            })
          );

        setConnections(
          normalizedConnections
        );

      } else {
        setConnections([]);
      }

    } catch (e) {

      console.error(
        'Error al cargar canvas:',
        e
      );

    } finally {

      // Permite que los efectos de guardado comiencen
      // solamente después de terminar la carga.
      setIsLoaded(true);
    }
  };

  // =====================================================
  // GUARDAR CHUNKS
  // =====================================================

  /**
   * Guarda los chunks en AsyncStorage.
   */
  const saveCanvasChunks = async (
    chunksToSave: ChunkData[]
  ) => {

    try {

      const jsonValue =
        JSON.stringify(
          chunksToSave
        );

      await AsyncStorage.setItem(
        GET_CANVAS_KEY(taskId),
        jsonValue
      );

    } catch (e) {

      console.error(
        'Error al guardar chunks:',
        e
      );
    }
  };

  // =====================================================
  // GUARDAR PROBLEMAS
  // =====================================================

  /**
   * Guarda los nodos de problemas.
   */
  const saveProblemNodes = async (
    nodesToSave: ProblemNodeData[]
  ) => {

    try {

      await AsyncStorage.setItem(
        GET_PROBLEMS_KEY(taskId),
        JSON.stringify(
          nodesToSave
        )
      );

    } catch (e) {

      console.error(
        'Error al guardar problemas:',
        e
      );
    }
  };

  // =====================================================
  // GUARDAR SOLUCIONES
  // =====================================================

  /**
   * Guarda los nodos de soluciones.
   */
  const saveSolutionNodes = async (
    nodesToSave: SolutionNodeData[]
  ) => {

    try {

      await AsyncStorage.setItem(
        GET_SOLUTIONS_KEY(taskId),
        JSON.stringify(
          nodesToSave
        )
      );

    } catch (e) {

      console.error(
        'Error al guardar soluciones:',
        e
      );
    }
  };

  // =====================================================
  // GUARDAR CONEXIONES
  // =====================================================

  /**
   * Guarda las conexiones entre nodos.
   */
  const saveConnections = async (
    connectionsToSave: CanvasConnection[]
  ) => {

    try {

      await AsyncStorage.setItem(
        GET_CONNECTIONS_KEY(taskId),
        JSON.stringify(
          connectionsToSave
        )
      );

    } catch (e) {

      console.error(
        'Error al guardar conexiones:',
        e
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <TexturedScreen>

      {/* =================================================
          CONTENEDOR PRINCIPAL
      ================================================= */}

      <View style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <Text
            style={styles.taskTitleText}
          >
            {title}
          </Text>

          <ModeToggle
            value={mode}
            onChange={handleModeChange}
          />

        </View>

        {/* =================================================
            NOTIFICACIÓN DE AYUDA
        ================================================= */}

        {activeHelp && (
          <InfoCard
            title={activeHelp.title}
            description={
              activeHelp.description
            }
            onClose={
              closeHelpNotification
            }
          />
        )}

        {/* =================================================
            CANVAS / VIEWPORT
        ================================================= */}

        <View style={styles.viewport}>

          {/* =================================================
              GESTOS
          ================================================= */}

          <CanvasGestureLayer
            pan={pan}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            worldLeft={-2500}
            worldTop={-2500}
            onCanvasPress={
              handleDeselectNode
            }
          />

          {/* =================================================
              MUNDO DEL CANVAS
          ================================================= */}

          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.world,
              {
                transform: [
                  {
                    scale: zoom,
                  },
                  {
                    translateX:
                      pan.x,
                  },
                  {
                    translateY:
                      pan.y,
                  },
                ],
              },
            ]}
          >

            {/* =================================================
                CONEXIONES
            ================================================= */}

            <View
              pointerEvents="none"
              style={
                styles.connectionsLayer
              }
            >
              {connections.map(
                connection =>
                  renderConnection(
                    connection
                  )
              )}
            </View>

            {/* =================================================
                CHUNKS
            ================================================= */}

            {chunks.map(item => (

              <View
                key={item.id}
                style={[
                  styles.nodeItemWrapper,
                  {
                    left:
                      item.position.x,

                    top:
                      item.position.y,
                  },
                ]}
              >

                <ChunkNode

                  title={
                    item.title
                  }

                  description={
                    item.description
                  }

                  position={
                    item.position
                  }

                  status={
                    item.status
                  }

                  selected={
                    selectedNodeId ===
                    item.id
                  }

                  onSelect={() =>
                    handleSelectNode(
                      item.id
                    )
                  }

                  onMove={(
                    startX,
                    startY,
                    dx,
                    dy
                  ) =>
                    handleMoveChunk(
                      item.id,
                      startX,
                      startY,
                      dx,
                      dy
                    )
                  }

                  connections={
                    item.connections
                  }

                  onTitleChange={
                    newTitle =>
                      handleChangeChunkTitle(
                        item.id,
                        newTitle
                      )
                  }

                  onDescriptionChange={
                    newDescription =>
                      handleChangeChunkDescription(
                        item.id,
                        newDescription
                      )
                  }

                  onStatusChange={
                    newStatus =>
                      handleChangeChunkStatus(
                        item.id,
                        newStatus
                      )
                  }

                  onClose={() =>
                    handleRemoveNode(
                      item.id
                    )
                  }

                  onPressSubStep={() =>
                    handleAddSubStep(
                      item.id
                    )
                  }

                  onConnectPointPress={
                    side =>
                      handleConnectionPointPress(
                        item.id,
                        side
                      )
                  }

                />

              </View>
            ))}

            {/* =================================================
                AUDIO
            ================================================= */}

            {audioNodes.map(item => (

              <View
                key={item.id}
                style={[
                  styles.nodeItemWrapper,
                  {
                    left:
                      item.position.x,

                    top:
                      item.position.y,
                  },
                ]}
              >

                <AudioNode

                  uri={item.uri}

                  position={
                    item.position
                  }

                  selected={
                    selectedNodeId ===
                    item.id
                  }

                  onSelect={() =>
                    handleSelectNode(
                      item.id
                    )
                  }

                  onMove={(
                    startX,
                    startY,
                    dx,
                    dy
                  ) =>
                    handleMoveAudio(
                      item.id,
                      startX,
                      startY,
                      dx,
                      dy
                    )
                  }

                  connections={
                    item.connections
                  }

                  onClose={() =>
                    handleRemoveNode(
                      item.id
                    )
                  }

                  onConnectPointPress={
                    side =>
                      handleConnectionPointPress(
                        item.id,
                        side
                      )
                  }

                />

              </View>
            ))}

            {/* =================================================
                PROBLEM NODES
            ================================================= */}

            {problemNodes.map(item => (

              <View
                key={item.id}
                style={[
                  styles.nodeItemWrapper,
                  {
                    left:
                      item.position.x,

                    top:
                      item.position.y,
                  },
                ]}
              >

                <ProblemNode

                  title={
                    item.title
                  }

                  description={
                    item.description
                  }

                  position={
                    item.position
                  }

                  selected={
                    selectedNodeId ===
                    item.id
                  }

                  onSelect={() =>
                    handleSelectNode(
                      item.id
                    )
                  }

                  onMove={(
                    startX,
                    startY,
                    dx,
                    dy
                  ) =>
                    handleMoveProblem(
                      item.id,
                      startX,
                      startY,
                      dx,
                      dy
                    )
                  }

                  connections={
                    item.connections
                  }

                  onClose={() =>
                    handleRemoveNode(
                      item.id
                    )
                  }

                  onPressAddSolution={() => {
                    setSelectedNodeId(
                      item.id
                    );

                    setShowProblemsModal(
                      true
                    );
                  }}

                  onConnectPointPress={
                    side =>
                      handleConnectionPointPress(
                        item.id,
                        side
                      )
                  }

                />

              </View>
            ))}

            {/* =================================================
                SOLUTION NODES
            ================================================= */}

            {solutionNodes.map(item => (

              <View
                key={item.id}
                style={[
                  styles.nodeItemWrapper,
                  {
                    left:
                      item.position.x,

                    top:
                      item.position.y,
                  },
                ]}
              >

                <SolutionNode

                  title={
                    item.title
                  }

                  description={
                    item.description
                  }

                  position={
                    item.position
                  }

                  status={
                    item.status
                  }

                  onStatusChange={
                    newStatus =>
                      handleChangeSolutionStatus(
                        item.id,
                        newStatus
                      )
                  }

                  selected={
                    selectedNodeId ===
                    item.id
                  }

                  onSelect={() =>
                    handleSelectNode(
                      item.id
                    )
                  }

                  onMove={(
                    startX,
                    startY,
                    dx,
                    dy
                  ) =>
                    handleMoveSolution(
                      item.id,
                      startX,
                      startY,
                      dx,
                      dy
                    )
                  }

                  connections={
                    item.connections
                  }

                  onClose={() =>
                    handleRemoveNode(
                      item.id
                    )
                  }

                  onConnectPointPress={
                    side =>
                      handleConnectionPointPress(
                        item.id,
                        side
                      )
                  }

                />

              </View>
            ))}

            {/* =================================================
                CANVAS VACÍO
            ================================================= */}

            {chunks.length === 0 &&
              problemNodes.length === 0 &&
              solutionNodes.length === 0 && (

                <View
                  style={
                    styles.emptyCanvasContainer
                  }
                >

                  <Text
                    style={
                      styles.emptyCanvasText
                    }
                  >
                    Aún no hay pasos
                    creados en este
                    lienzo
                  </Text>

                </View>
              )}

          </Animated.View>
        </View>

        {/* =================================================
            MENÚ INFERIOR
        ================================================= */}

        {mode === 'planeacion' && (
          <View
            style={
              styles.menuContainer
            }
          >

            <CanvasMenu
              onAddChunk={
                handleAddChunk
              }

              onPressBloqueo={
                handleOpenBlocks
              }
            />

          </View>
        )}

        {/* =================================================
            MENÚ FLOTANTE
        ================================================= */}

        <View
          style={
            styles.floatingMenuContainer
          }
        >

          <FloatingMenu
            onSelectOption={
              handleFloatingMenuOption
            }
          />

        </View>

        {/* =================================================
            MODAL DE AUDIO
        ================================================= */}

        {showAudioModal && (
          <ModalGrabarAudio
            visible={
              showAudioModal
            }

            onClose={() =>
              setShowAudioModal(
                false
              )
            }

            onSave={
              handleSaveAudio
            }
          />
        )}

        {/* =================================================
            MODAL DE PROBLEMAS
        ================================================= */}

        {showProblemsModal && (

          <View
            style={
              styles.problemModalContainer
            }
          >

            <ModalProblemas

              onSelectSolution={
                handleSelectSolution
              }

              onAddCustomSolution={
                handleAddCustomSolution
              }

            />

          </View>
        )}

      </View>

    </TexturedScreen>
  );
};

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({

  // =====================================================
  // CONTENEDOR
  // =====================================================

  container: {
    flex: 1,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },

  taskTitleText: {
    color: '#DED1EB',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // =====================================================
  // VIEWPORT
  // =====================================================

  viewport: {
    flex: 1,
    overflow: 'hidden',
  },

  // =====================================================
  // MUNDO
  // =====================================================

  world: {
    position: 'absolute',
    width: WORLD_SIZE,
    height: WORLD_SIZE,
    left: -2500,
    top: -2500,
  },

  // =====================================================
  // CAPA DE CONEXIONES
  // =====================================================

  connectionsLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WORLD_SIZE,
    height: WORLD_SIZE,
    zIndex: 0,
  },

  connectionLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#9793C7',
    transformOrigin: 'left center',
    borderRadius: 2,
    zIndex: 0,
  },

  // =====================================================
  // NODOS
  // =====================================================

  nodeItemWrapper: {
    position: 'absolute',
    zIndex: 2,
  },

  // =====================================================
  // CANVAS VACÍO
  // =====================================================

  emptyCanvasContainer: {
    position: 'absolute',
    left: 2300,
    top: 2300,
    alignItems: 'center',
  },

  emptyCanvasText: {
    color: '#3B3947',
    fontSize: 16,
    fontWeight: '500',
  },

  // =====================================================
  // MENÚ INFERIOR
  // =====================================================

  menuContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },

  // =====================================================
  // CONEXIONES SELECCIONADAS
  // =====================================================

  connectionLineTouchable: {
    position: 'absolute',
    height: 20,
    justifyContent: 'center',
  },

  selectedConnectionLine: {
    height: 5,
    backgroundColor: '#853ACF',
  },

  deleteConnectionButton: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2A2535',
    borderWidth: 1,
    borderColor: '#853ACF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteConnectionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // =====================================================
  // MENÚ FLOTANTE
  // =====================================================

  floatingMenuContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 200,
  },

  // =====================================================
  // MODAL DE PROBLEMAS
  // =====================================================

  problemModalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    zIndex: 300,
  },
});

// ------------------------------------
// EXPORTACIÓN
// ------------------------------------

export default InfinityCanvas;
