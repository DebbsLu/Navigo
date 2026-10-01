
// ------------------------------------
// IMPORTACIONES
// ------------------------------------

import React, { useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  PanResponder,
} from 'react-native';

import BtnClose from './BtnClose';

// ------------------------------------
// TIPOS
// ------------------------------------

// Estados posibles de un chunk.
export type ChunkStatus =
  | 'avanzando'
  | 'completado'
  | 'no_iniciado';

// Lados disponibles para los puntos de conexión.
export type ConnectionSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

// Indica qué puntos de conexión están activos.
interface ConnectionPointState {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

// Representa la posición del chunk dentro del canvas.
interface ChunkPosition {
  x: number;
  y: number;
}

// ------------------------------------
// PROPIEDADES DEL COMPONENTE
// ------------------------------------

interface ChunkNodeProps {
  // Título principal del chunk.
  title: string;

  // Descripción o detalles del chunk.
  description: string;

  // Posición del chunk dentro del canvas.
  position?: ChunkPosition;

  // Estado actual del chunk.
  status?: ChunkStatus;

  // Indica si el chunk está seleccionado.
  selected?: boolean;

  // Se ejecuta cuando el chunk es seleccionado.
  onSelect?: () => void;

  // Se ejecuta mientras el chunk se está desplazando.
  onMove?: (
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => void;

  // Se ejecuta cuando cambia el título.
  onTitleChange?: (
    title: string
  ) => void;

  // Se ejecuta cuando cambia la descripción.
  onDescriptionChange?: (
    description: string
  ) => void;

  // Se ejecuta cuando cambia el estado.
  onStatusChange?: (
    status: ChunkStatus
  ) => void;

  // Texto mostrado en el botón para añadir
  // un nuevo subpaso.
  subStepButtonText?: string;

  // Estado de los puntos de conexión.
  connections?: ConnectionPointState;

  // Se ejecuta al cerrar/eliminar el chunk.
  onClose?: () => void;

  // Se ejecuta al presionar el botón de subpaso.
  onPressSubStep?: () => void;

  // Se ejecuta al presionar un punto de conexión.
  onConnectPointPress?: (
    side: ConnectionSide
  ) => void;
}

// ------------------------------------
// CONSTANTES
// ------------------------------------

// Tamaño de los puntos de conexión.
const DOT_SIZE = 14;

// ------------------------------------
// CONFIGURACIÓN DE ESTADOS
// ------------------------------------

// Define el texto y color correspondiente
// a cada estado del chunk.
const STATUS_CONFIG: Record<
  ChunkStatus,
  {
    label: string;
    color: string;
  }
> = {
  avanzando: {
    label: 'Avanzando',
    color: '#853ACF',
  },

  completado: {
    label: 'Completado',
    color: '#C694EB',
  },

  no_iniciado: {
    label: 'No iniciado',
    color: '#DED1EB',
  },
};

// ------------------------------------
// OBTENER SIGUIENTE ESTADO
// ------------------------------------

// Cambia el estado del chunk siguiendo
// un ciclo definido.
const getNextStatus = (
  status: ChunkStatus
): ChunkStatus => {

  switch (status) {

    case 'no_iniciado':
      return 'avanzando';

    case 'avanzando':
      return 'completado';

    case 'completado':
      return 'no_iniciado';

    default:
      return 'no_iniciado';
  }
};

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

const ChunkNode: React.FC<
  ChunkNodeProps
> = ({
  title,
  description,
  position,
  status = 'no_iniciado',
  selected = false,
  onSelect,
  onMove,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  subStepButtonText = '+ Añadir subpaso',
  connections = {},
  onClose,
  onPressSubStep,
  onConnectPointPress,
}) => {

  // Obtiene la configuración visual
  // correspondiente al estado actual.
  const currentStatus =
    STATUS_CONFIG[status];

  // ------------------------------------
  // CONTROL DEL ARRASTRE
  // ------------------------------------

  // Configura los gestos utilizados para
  // desplazar el chunk dentro del canvas.
  const dragResponder = useRef(
    PanResponder.create({

      // ------------------------------------
      // TOQUE INICIAL
      // ------------------------------------

      // Un toque simple no debe activar
      // inmediatamente el arrastre.
      onStartShouldSetPanResponder:
        () => false,

      // ------------------------------------
      // DETECTAR ARRASTRE
      // ------------------------------------

      // El movimiento debe superar cierto umbral
      // para considerarse un arrastre.
      onMoveShouldSetPanResponder: (
        _event,
        gestureState
      ) => {

        return (
          Math.abs(
            gestureState.dx
          ) > 8 ||

          Math.abs(
            gestureState.dy
          ) > 8
        );
      },

      // ------------------------------------
      // INICIO DEL ARRASTRE
      // ------------------------------------

      // Selecciona el chunk cuando comienza
      // un movimiento válido.
      onPanResponderGrant: () => {
        onSelect?.();
      },

      // ------------------------------------
      // MOVIMIENTO
      // ------------------------------------

      onPanResponderMove: (
        _event,
        gestureState
      ) => {

        // Si el chunk no tiene posición,
        // no se puede calcular su desplazamiento.
        if (!position) {
          return;
        }

        // Envía al componente padre la posición
        // inicial y el desplazamiento realizado.
        onMove?.(
          position.x,
          position.y,
          gestureState.dx,
          gestureState.dy
        );
      },

      // ------------------------------------
      // FIN DEL ARRASTRE
      // ------------------------------------

      onPanResponderRelease: () => {},

      // Se ejecuta si React Native termina
      // el gesto antes de finalizar normalmente.
      onPanResponderTerminate: () => {},
    })
  ).current;

  // ------------------------------------
  // RENDERIZADO
  // ------------------------------------

  return (
    <View
      style={styles.wrapper}
      onTouchStart={onSelect}
    >

      {/* ------------------------------------
          ESTADO DEL CHUNK
          ------------------------------------ */}

      <Text
        style={[
          styles.statusText,
          {
            color:
              currentStatus.color,
          },
        ]}
      >
        {currentStatus.label}
      </Text>

      {/* ------------------------------------
          TARJETA PRINCIPAL
          ------------------------------------ */}

      <View
        style={[
          styles.cardContainer,
          selected &&
            styles.cardContainerSelected,
        ]}
      >

        {/* ------------------------------------
            ENCABEZADO
            ------------------------------------ */}

        <View style={styles.header}>

          {/* ------------------------------------
              INDICADOR DE ESTADO
              ------------------------------------ */}

          {/* Al presionar el punto se cambia
              al siguiente estado. */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              onStatusChange?.(
                getNextStatus(status)
              )
            }
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    currentStatus.color,
                },
              ]}
            />
          </TouchableOpacity>

          {/* ------------------------------------
              ZONA DE ARRASTRE
              ------------------------------------ */}

          {/* Esta zona recibe los gestos
              utilizados para mover el chunk. */}
          <View
            style={styles.dragHandle}
            {...dragResponder.panHandlers}
          />

          {/* ------------------------------------
              BOTÓN DE CERRAR
              ------------------------------------ */}

          <BtnClose
            onPress={() =>
              onClose?.()
            }
          />

        </View>

        {/* ------------------------------------
            TÍTULO
            ------------------------------------ */}

        <TextInput
          value={title}
          onChangeText={
            onTitleChange
          }
          placeholder="Título del paso"
          placeholderTextColor="#777380"
          style={styles.titleInput}
          multiline
        />

        {/* ------------------------------------
            DESCRIPCIÓN
            ------------------------------------ */}

        <View
          style={
            styles.descriptionBox
          }
        >
          <TextInput
            value={description}
            onChangeText={
              onDescriptionChange
            }
            placeholder="Escribe aquí los detalles..."
            placeholderTextColor="#777380"
            style={
              styles.descriptionInput
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ------------------------------------
            AÑADIR SUBPASO
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={
            styles.subStepButton
          }
          onPress={() =>
            onPressSubStep?.()
          }
        >
          <Text
            style={
              styles.subStepButtonText
            }
          >
            {subStepButtonText}
          </Text>
        </TouchableOpacity>

        {/* ------------------------------------
            PUNTO DE CONEXIÓN SUPERIOR
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.(
              'top'
            )
          }
          style={[
            styles.connectionDot,
            styles.dotTop,
            {
              backgroundColor:
                connections.top
                  ? '#9793C7'
                  : 'rgba(151, 147, 199, 0.10)',
            },
          ]}
        />

        {/* ------------------------------------
            PUNTO DE CONEXIÓN INFERIOR
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.(
              'bottom'
            )
          }
          style={[
            styles.connectionDot,
            styles.dotBottom,
            {
              backgroundColor:
                connections.bottom
                  ? '#9793C7'
                  : 'rgba(151, 147, 199, 0.10)',
            },
          ]}
        />

        {/* ------------------------------------
            PUNTO DE CONEXIÓN IZQUIERDO
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.(
              'left'
            )
          }
          style={[
            styles.connectionDot,
            styles.dotLeft,
            {
              backgroundColor:
                connections.left
                  ? '#9793C7'
                  : 'rgba(151, 147, 199, 0.10)',
            },
          ]}
        />

        {/* ------------------------------------
            PUNTO DE CONEXIÓN DERECHO
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.(
              'right'
            )
          }
          style={[
            styles.connectionDot,
            styles.dotRight,
            {
              backgroundColor:
                connections.right
                  ? '#9793C7'
                  : 'rgba(151, 147, 199, 0.10)',
            },
          ]}
        />

      </View>
    </View>
  );
};

// ------------------------------------
// EXPORTACIÓN
// ------------------------------------

export default ChunkNode;

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({

  // Contenedor externo del chunk.
  wrapper: {
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 12,
  },

  // Texto que muestra el estado actual.
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 16,
  },

  // Tarjeta principal del chunk.
  cardContainer: {
    width: 280,

    backgroundColor: '#181622',

    borderColor: '#1E1D29',
    borderWidth: 1.5,
    borderRadius: 20,

    padding: 16,

    position: 'relative',
  },

  // Borde aplicado cuando el chunk
  // está seleccionado.
  cardContainerSelected: {
    borderColor: '#853ACF',
    borderWidth: 2,
  },

  // Contenedor del encabezado.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  // Área que funciona como zona de arrastre.
  dragHandle: {
    flex: 1,
    height: 32,
  },

  // Punto que representa el estado del chunk.
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  // Campo de texto del título.
  titleInput: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    paddingRight: 10,
  },

  // Contenedor visual de la descripción.
  descriptionBox: {
    backgroundColor: '#1F1D2C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  // Campo de texto de la descripción.
  descriptionInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },

  // Botón para añadir un subpaso.
  subStepButton: {
    backgroundColor: '#181622',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },

  // Texto del botón de subpaso.
  subStepButtonText: {
    color: '#3B3947',
    fontSize: 15,
    fontWeight: '600',
  },

  // Estilo base de los puntos de conexión.
  connectionDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,

    position: 'absolute',

    zIndex: 10,
  },

  // ------------------------------------
  // POSICIÓN DE LOS PUNTOS DE CONEXIÓN
  // ------------------------------------

  // Punto superior.
  dotTop: {
    top: -DOT_SIZE / 2,
    alignSelf: 'center',
    left: '50%',

    transform: [
      {
        translateX:
          -(DOT_SIZE / 2),
      },
    ],
  },

  // Punto inferior.
  dotBottom: {
    bottom: -DOT_SIZE / 2,
    alignSelf: 'center',
    left: '50%',

    transform: [
      {
        translateX:
          -(DOT_SIZE / 2),
      },
    ],
  },

  // Punto izquierdo.
  dotLeft: {
    left: -DOT_SIZE / 2,
    top: '50%',

    transform: [
      {
        translateY:
          -(DOT_SIZE / 2),
      },
    ],
  },

  // Punto derecho.
  dotRight: {
    right: -DOT_SIZE / 2,
    top: '50%',

    transform: [
      {
        translateY:
          -(DOT_SIZE / 2),
      },
    ],
  },
});
