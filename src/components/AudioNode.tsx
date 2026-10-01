// src/components/AudioNode.tsx

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

export type ConnectionSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface ConnectionPointState {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export interface AudioNodeProps {
  uri: string;

  position?: {
    x: number;
    y: number;
  };

  selected?: boolean;

  onSelect?: () => void;

  onMove?: (
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => void;

  connections?: ConnectionPointState;

  onClose?: () => void;

  onConnectPointPress?: (
    side: ConnectionSide
  ) => void;
}

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
  const player = useAudioPlayer(uri);
  const playerStatus = useAudioPlayerStatus(player);

  /*
   * Guardamos la posición inicial del nodo
   * cuando comienza el movimiento.
   */
  const startPosition = useRef({
    x: position.x,
    y: position.y,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        startPosition.current = {
          x: position.x,
          y: position.y,
        };

        onSelect?.();
      },

      onPanResponderMove: (_, gestureState) => {
        onMove?.(
          startPosition.current.x,
          startPosition.current.y,
          gestureState.dx,
          gestureState.dy
        );
      },

      onPanResponderRelease: () => {},
    })
  ).current;

  const handlePlayPause = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View
      style={[
        styles.container,
        selected && styles.selected,
      ]}
      {...panResponder.panHandlers}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Audio
        </Text>

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

      {/* REPRODUCTOR */}

      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          <Text style={styles.playButtonText}>
            {playerStatus.playing ? 'Ⅱ' : '▶'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.audioText}>
          {playerStatus.playing
            ? 'Reproduciendo...'
            : 'Reproducir audio'}
        </Text>
      </View>

      {/* PUNTOS DE CONEXIÓN */}

      <TouchableOpacity
        style={[
          styles.connectionPoint,
          styles.topPoint,
          connections?.top && styles.activeConnectionPoint,
        ]}
        onPress={() =>
          onConnectPointPress?.('top')
        }
      />

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

const styles = StyleSheet.create({
  container: {
    /*
     * IMPORTANTE:
     * Ya NO ponemos left/top aquí.
     *
     * InfinityCanvas se encarga de posicionar
     * el nodo mediante nodeItemWrapper.
     */
    position: 'absolute',

    width: 280,
    minHeight: 150,

    backgroundColor: '#181622',

    borderWidth: 1,
    borderColor: '#1E1D29',
    borderRadius: 16,

    padding: 16,
  },

  selected: {
    borderColor: '#853ACF',
  },

  header: {
    height: 30,
    justifyContent: 'center',
  },

  title: {
    color: '#DED1EB',
    fontSize: 15,
    fontWeight: 'bold',
  },

  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#853ACF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  audioText: {
    color: '#808088',
    fontSize: 14,
    marginLeft: 12,
  },

  connectionPoint: {
    position: 'absolute',

    width: 12,
    height: 12,

    borderRadius: 6,

    backgroundColor: '#D0BCFF',
  },

  activeConnectionPoint: {
    backgroundColor: '#853ACF',
  },

  topPoint: {
    top: -6,
    left: 134,
  },

  bottomPoint: {
    bottom: -6,
    left: 134,
  },

  leftPoint: {
    left: -6,
    top: 69,
  },

  rightPoint: {
    right: -6,
    top: 69,
  },
});

export default AudioNode;