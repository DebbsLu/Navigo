
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

  // Punto que está actualmente seleccionado
  // como origen de una conexión.
  pendingConnectionSide?: ConnectionSide | null;

  // Se ejecuta al cerrar/eliminar el chunk.
  onClose?: () => void;

  onLayout?: (width: number, height: number) => void;

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

//Tamaño del tactil
const DOT_TOUCH_SIZE = 44;

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
  onLayout,
  onClose,
  onPressSubStep,
  onConnectPointPress,
  pendingConnectionSide,
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
        onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        onLayout?.(width, height);
        }}
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
  style={[
    styles.connectionHitArea,
    styles.connectionTop,
  ]}
  onPress={() => onConnectPointPress?.('top')}
  activeOpacity={0.7}
>
  <View
    style={[
      styles.connectionDot,
      {
        backgroundColor: connections?.top
          ? '#A855F7'
          : '#5B5268',
      },
    ]}
  />
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.connectionHitArea,
    styles.connectionBottom,
  ]}
  onPress={() => onConnectPointPress?.('bottom')}
  activeOpacity={0.7}
>
  <View
    style={[
      styles.connectionDot,
      {
        backgroundColor: connections?.bottom
          ? '#A855F7'
          : '#5B5268',
      },
    ]}
  />
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.connectionHitArea,
    styles.connectionLeft,
  ]}
  onPress={() => onConnectPointPress?.('left')}
  activeOpacity={0.7}
>
  <View
    style={[
      styles.connectionDot,
      {
        backgroundColor: connections?.left
          ? '#A855F7'
          : '#5B5268',
      },
    ]}
  />
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.connectionHitArea,
    styles.connectionRight,
  ]}
  onPress={() => onConnectPointPress?.('right')}
  activeOpacity={0.7}
>
  <View
    style={[
      styles.connectionDot,
      {
        backgroundColor: connections?.right
          ? '#A855F7'
          : '#5B5268',
      },
    ]}
  />
</TouchableOpacity>

        {/* ------------------------------------
            PUNTO DE CONEXIÓN DERECHO
            ------------------------------------ */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.('right')
          }
          style={[
            styles.connectionHitArea,
            styles.hitRight,
          ]}
        >
          <View
            style={[
              styles.connectionDot,
              {
                backgroundColor:
                  connections.right
                    ? '#9793C7'
                    : 'rgba(151, 147, 199, 0.18)',

                borderWidth:
                  pendingConnectionSide === 'right'
                    ? 2
                    : 0,

                borderColor:
                  pendingConnectionSide === 'right'
                    ? '#C694EB'
                    : 'transparent',

                transform:
                  pendingConnectionSide === 'right'
                    ? [{ scale: 1.35 }]
                    : [{ scale: 1 }],
              },
            ]}
          />
        </TouchableOpacity>

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
  /*
  subStepButton: {
    backgroundColor: '#181622',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },*/

  subStepButton: {
  backgroundColor: '#181622',
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'flex-start',
  paddingLeft: 4,

  // Deja espacio físico antes del punto inferior.
  marginBottom: 12,
},

  // Texto del botón de subpaso.
  subStepButtonText: {
    color: '#3B3947',
    fontSize: 15,
    fontWeight: '600',
  },


  // ------------------------------------
  // POSICIÓN DE LOS PUNTOS DE CONEXIÓN
  // ------------------------------------

// ------------------------------------
// ÁREA TÁCTIL DE CONEXIONES
// ------------------------------------

connectionHitArea: {
  position: 'absolute',
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  elevation: 10,
},

connectionDot: {
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: DOT_SIZE / 2,
},

connectionTop: {
  top: -20,
  left: '50%',
  transform: [{ translateX: -20 }],
},

connectionBottom: {
  bottom: -20,
  left: '50%',
  transform: [{ translateX: -20 }],
},

connectionLeft: {
  left: -20,
  top: '50%',
  transform: [{ translateY: -20 }],
},

connectionRight: {
  right: -20,
  top: '50%',
  transform: [{ translateY: -20 }],
},

// ------------------------------------
// POSICIONES
// ------------------------------------

hitTop: {
  top: -(DOT_TOUCH_SIZE / 2),
  left: '50%',

  marginLeft:
    -(DOT_TOUCH_SIZE / 2),
},

hitBottom: {
  bottom: -(DOT_TOUCH_SIZE / 2),
  left: '50%',

  marginLeft:
    -(DOT_TOUCH_SIZE / 2),
},

hitLeft: {
  left: -(DOT_TOUCH_SIZE / 2),
  top: '50%',

  marginTop:
    -(DOT_TOUCH_SIZE / 2),
},

hitRight: {
  right: -(DOT_TOUCH_SIZE / 2),
  top: '50%',

  marginTop:
    -(DOT_TOUCH_SIZE / 2),
},
  

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
