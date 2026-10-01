
// ------------------------------------
// IMPORTACIONES
// ------------------------------------

import React, { useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import BtnClose from './BtnClose';

// ------------------------------------
// TIPOS
// ------------------------------------

// Define los lados disponibles para los puntos de conexión
// del nodo de audio.
export type ConnectionSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

// Indica qué puntos de conexión del nodo están activos.
export interface ConnectionPointState {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

// ------------------------------------
// PROPIEDADES DEL COMPONENTE
// ------------------------------------

export interface AudioNodeProps {
  // Dirección del archivo de audio.
  uri: string;

  // Posición inicial del nodo dentro del canvas.
  position?: {
    x: number;
    y: number;
  };

  // Indica si el nodo está seleccionado.
  selected?: boolean;

  // Se ejecuta cuando el usuario selecciona el nodo.
  onSelect?: () => void;

  // Se ejecuta mientras el usuario mueve el nodo.
  onMove?: (
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => void;

  // Estado de los puntos de conexión.
  connections?: ConnectionPointState;

  // Se ejecuta cuando se presiona el botón de cerrar.
  onClose?: () => void;

  // Se ejecuta cuando se presiona un punto de conexión.
  onConnectPointPress?: (
    side: ConnectionSide
  ) => void;
}

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

const AudioNode: React.FC<AudioNodeProps> = ({
  uri,
  position = { x: 0, y: 0 },
  selected = false,
  onSelect,
  onMove,
  connections,
  onClose,
  onConnectPointPress,
}) => {

  // ------------------------------------
  // REPRODUCTOR DE AUDIO
  // ------------------------------------

  // Crea el reproductor utilizando la dirección
  // del archivo de audio recibida por el componente.
  const player = useAudioPlayer(uri);

  // Obtiene el estado actual del reproductor,
  // por ejemplo, si el audio está reproduciéndose.
  const playerStatus = useAudioPlayerStatus(player);

  // ------------------------------------
  // CONTROL DEL MOVIMIENTO
  // ------------------------------------

  // Guarda la posición del nodo en el momento
  // en que comienza el movimiento.
  const startPosition = useRef({
    x: position.x,
    y: position.y,
  });

  // Configura los gestos necesarios para poder
  // seleccionar y mover el nodo dentro del canvas.
  const panResponder = useRef(
    PanResponder.create({

      // Permite que este componente responda
      // al inicio de un gesto.
      onStartShouldSetPanResponder: () => true,

      // Guarda la posición inicial cuando comienza
      // el movimiento y selecciona el nodo.
      onPanResponderGrant: () => {
        startPosition.current = {
          x: position.x,
          y: position.y,
        };

        onSelect?.();
      },

      // Envía al componente padre la posición inicial
      // y el desplazamiento realizado por el usuario.
      onPanResponderMove: (_, gestureState) => {
        onMove?.(
          startPosition.current.x,
          startPosition.current.y,
          gestureState.dx,
          gestureState.dy
        );
      },

      // No se necesita realizar ninguna acción
      // adicional al finalizar el movimiento.
      onPanResponderRelease: () => {},
    })
  ).current;

  // ------------------------------------
  // CONTROL DE REPRODUCCIÓN
  // ------------------------------------

  // Alterna entre reproducir y pausar el audio.
  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  // ------------------------------------
  // RENDERIZADO
  // ------------------------------------

  return (
    <View
      style={[
        styles.container,
        selected && styles.selected,
      ]}
      {...panResponder.panHandlers}
    >

      {/* ------------------------------------
          ENCABEZADO
          ------------------------------------ */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Audio
        </Text>

        {/* Botón para cerrar/eliminar el nodo */}
        {onClose && (
          <BtnClose
            onPress={onClose}
            absolute
            top={10}
            right={10}
            color="#808088"
            size={14}
          />
        )}
      </View>

      {/* ------------------------------------
          REPRODUCTOR DE AUDIO
          ------------------------------------ */}

      <View style={styles.playerContainer}>

        {/* Botón para reproducir o pausar */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          <Text style={styles.playButtonText}>
            {playerStatus.playing ? 'Ⅱ' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Texto que indica el estado actual del audio */}
        <Text style={styles.audioText}>
          {playerStatus.playing
            ? 'Reproduciendo...'
            : 'Reproducir audio'}
        </Text>

      </View>

      {/* ------------------------------------
          PUNTOS DE CONEXIÓN
          ------------------------------------ */}

      {/* Punto de conexión superior */}
      <TouchableOpacity
        style={[
          styles.connectionPoint,
          styles.topPoint,
          connections?.top &&
            styles.activeConnectionPoint,
        ]}
        onPress={() =>
          onConnectPointPress?.('top')
        }
      />

      {/* Punto de conexión inferior */}
      <TouchableOpacity
        style={[
          styles.connectionPoint,
          styles.bottomPoint,
          connections?.bottom &&
            styles.activeConnectionPoint,
        ]}
        onPress={() =>
          onConnectPointPress?.('bottom')
        }
      />

      {/* Punto de conexión izquierdo */}
      <TouchableOpacity
        style={[
          styles.connectionPoint,
          styles.leftPoint,
          connections?.left &&
            styles.activeConnectionPoint,
        ]}
        onPress={() =>
          onConnectPointPress?.('left')
        }
      />

      {/* Punto de conexión derecho */}
      <TouchableOpacity
        style={[
          styles.connectionPoint,
          styles.rightPoint,
          connections?.right &&
            styles.activeConnectionPoint,
        ]}
        onPress={() =>
          onConnectPointPress?.('right')
        }
      />

    </View>
  );
};

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({

  // Contenedor principal del nodo.
  //
  // IMPORTANTE:
  // No se utilizan left ni top aquí.
  // InfinityCanvas se encarga de posicionar
  // el nodo mediante nodeItemWrapper.
  container: {
    position: 'absolute',

    width: 280,
    minHeight: 150,

    backgroundColor: '#181622',

    borderWidth: 1,
    borderColor: '#1E1D29',
    borderRadius: 16,

    padding: 16,
  },

  // Estilo aplicado cuando el nodo está seleccionado.
  selected: {
    borderColor: '#853ACF',
  },

  // Área superior donde se muestra el título
  // y el botón para cerrar el nodo.
  header: {
    height: 30,
    justifyContent: 'center',
  },

  // Texto del título del nodo.
  title: {
    color: '#DED1EB',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Contenedor del reproductor.
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  // Botón circular para reproducir o pausar.
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#853ACF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  // Símbolo mostrado dentro del botón
  // de reproducción/pausa.
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Texto que indica el estado del audio.
  audioText: {
    color: '#808088',
    fontSize: 14,
    marginLeft: 12,
  },

  // Estilo base de los puntos de conexión.
  connectionPoint: {
    position: 'absolute',

    width: 12,
    height: 12,

    borderRadius: 6,

    backgroundColor: '#D0BCFF',
  },

  // Color utilizado cuando un punto de conexión
  // se encuentra activo.
  activeConnectionPoint: {
    backgroundColor: '#853ACF',
  },

  // Posición del punto de conexión superior.
  topPoint: {
    top: -6,
    left: 134,
  },

  // Posición del punto de conexión inferior.
  bottomPoint: {
    bottom: -6,
    left: 134,
  },

  // Posición del punto de conexión izquierdo.
  leftPoint: {
    left: -6,
    top: 69,
  },

  // Posición del punto de conexión derecho.
  rightPoint: {
    right: -6,
    top: 69,
  },
});

// ------------------------------------
// EXPORTACIÓN
// ------------------------------------

export default AudioNode;
