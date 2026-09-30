import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  PanResponder,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BtnClose from './BtnClose';

// =======================================================
// TIPOS
// =======================================================

export type ConnectionSide = 'top' | 'bottom' | 'left' | 'right';

interface ConnectionPointState {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

interface ChunkPosition {
  x: number;
  y: number;
}

interface SolutionNodeProps {
  title?: string;
  description: string;
  position?: ChunkPosition;
  selected?: boolean;
  onSelect?: () => void;
  onMove?: (
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) => void;
  onDescriptionChange?: (description: string) => void;
  connections?: ConnectionPointState;
  onClose?: () => void;
  onConnectPointPress?: (side: ConnectionSide) => void;
}

// =======================================================
// CONSTANTES
// =======================================================

const DOT_SIZE = 14;

// Imagen de textura (ruta relativa recomendada desde este componente)
const DOT_TEXTURE = require('../../assets/textures/dot.png');

// =======================================================
// COMPONENTE
// =======================================================

const SolutionNode: React.FC<SolutionNodeProps> = ({
  title = 'Pasos para solventar',
  description,
  position,
  selected = false,
  onSelect,
  onMove,
  onDescriptionChange,
  connections = {},
  onClose,
  onConnectPointPress,
}) => {
  // =====================================================
  // DRAG DEL NODO
  // =====================================================

  const dragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gestureState) => {
        return Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8;
      },
      onPanResponderGrant: () => {
        onSelect?.();
      },
      onPanResponderMove: (_event, gestureState) => {
        if (!position) return;
        onMove?.(position.x, position.y, gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.wrapper} onTouchStart={onSelect}>
      {/* =============================================== */}
      {/* BORDE DEGRADADO (Contenedor externo) */}
      {/* =============================================== */}
      <LinearGradient
        colors={selected ? ['#5C77B7', '#28519C'] : ['#1E3B70', '#0E1C36']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorderContainer}
      >
        {/* =============================================== */}
        {/* FONDO DEGRADADO INTERNO */}
        {/* =============================================== */}
        <LinearGradient
          colors={['#0E1C36', '#28519C']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardInnerContainer}
        >
          {/* ============================================= */}
          {/* TEXTURA DE PUNTOS SOBREPUESTA */}
          {/* ============================================= */}
          <ImageBackground
            source={DOT_TEXTURE}
            resizeMode="repeat"
            style={styles.textureOverlay}
            imageStyle={{ opacity: 0.25 }}
          >
            {/* =========================================== */}
            {/* HEADER & DRAG AREA */}
            {/* =========================================== */}
            <View style={styles.header}>
              <View style={styles.dragHandle} {...dragResponder.panHandlers}>
                <Text style={styles.fixedTitle}>{title}</Text>
              </View>

              <View style={styles.headerRightControls}>
                {/* Punto indicador de estado lila */}
                <View style={styles.statusDot} />
                <BtnClose onPress={() => onClose?.()} color="#FFFFFF" size={14} />
              </View>
            </View>

            {/* =========================================== */}
            {/* DESCRIPCIÓN DEL PROBLEMA / PASOS */}
            {/* =========================================== */}
            <View style={styles.descriptionBox}>
              <TextInput
                value={description}
                onChangeText={onDescriptionChange}
                placeholder="Lo que haré para lidiar o solventar mi problema"
                placeholderTextColor="#8F8CA8"
                style={styles.descriptionInput}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ImageBackground>

          {/* ============================================= */}
          {/* PUNTOS DE CONEXIÓN */}
          {/* ============================================= */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onConnectPointPress?.('top')}
            style={[
              styles.connectionDot,
              styles.dotTop,
              {
                backgroundColor: connections.top
                  ? '#5C77B7'
                  : 'rgba(92, 119, 183, 0.30)',
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onConnectPointPress?.('bottom')}
            style={[
              styles.connectionDot,
              styles.dotBottom,
              {
                backgroundColor: connections.bottom
                  ? '#5C77B7'
                  : 'rgba(92, 119, 183, 0.30)',
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onConnectPointPress?.('left')}
            style={[
              styles.connectionDot,
              styles.dotLeft,
              {
                backgroundColor: connections.left
                  ? '#5C77B7'
                  : 'rgba(92, 119, 183, 0.30)',
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onConnectPointPress?.('right')}
            style={[
              styles.connectionDot,
              styles.dotRight,
              {
                backgroundColor: connections.right
                  ? '#5C77B7'
                  : 'rgba(92, 119, 183, 0.30)',
              },
            ]}
          />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default SolutionNode;

// =======================================================
// ESTILOS
// =======================================================

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 12,
  },

  gradientBorderContainer: {
    width: 300,
    borderRadius: 22,
    padding: 1.5, // Simula el grosor del borde degradado
  },

  cardInnerContainer: {
    borderRadius: 20.5,
    overflow: 'hidden',
    position: 'relative',
  },

  textureOverlay: {
    padding: 16,
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  dragHandle: {
    flex: 1,
    justifyContent: 'center',
  },

  fixedTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D0BCFF',
  },

  descriptionBox: {
    backgroundColor: 'rgba(25, 23, 41, 0.75)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
  },

  descriptionInput: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    padding: 0,
  },

  connectionDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    position: 'absolute',
    zIndex: 10,
  },

  dotTop: {
    top: -DOT_SIZE / 2,
    left: '50%',
    transform: [{ translateX: -(DOT_SIZE / 2) }],
  },

  dotBottom: {
    bottom: -DOT_SIZE / 2,
    left: '50%',
    transform: [{ translateX: -(DOT_SIZE / 2) }],
  },

  dotLeft: {
    left: -DOT_SIZE / 2,
    top: '50%',
    transform: [{ translateY: -(DOT_SIZE / 2) }],
  },

  dotRight: {
    right: -DOT_SIZE / 2,
    top: '50%',
    transform: [{ translateY: -(DOT_SIZE / 2) }],
  },
});