import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  PanResponder,
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

interface ProblemNodeProps {
  title: string;
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
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  solutionButtonText?: string;
  connections?: ConnectionPointState;
  onClose?: () => void;
  onPressAddSolution?: () => void;
  onConnectPointPress?: (side: ConnectionSide) => void;
}

// =======================================================
// CONSTANTES
// =======================================================

const DOT_SIZE = 14;

// =======================================================
// COMPONENTE
// =======================================================

const ProblemNode: React.FC<ProblemNodeProps> = ({
  title,
  description,
  position,
  selected = false,
  onSelect,
  onMove,
  onTitleChange,
  onDescriptionChange,
  solutionButtonText = '+ Añadir solución',
  connections = {},
  onClose,
  onPressAddSolution,
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
      {/* TARJETA DEGRADADA */}
      {/* =============================================== */}
      <LinearGradient
        colors={['#0E1C36', '#28519C']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.cardContainer,
          selected && styles.cardContainerSelected,
        ]}
      >
        {/* ============================================= */}
        {/* HEADER & DRAG AREA */}
        {/* ============================================= */}
        <View style={styles.header}>
          <View style={styles.dragHandle} {...dragResponder.panHandlers} />
          <BtnClose onPress={() => onClose?.()} color="#FFFFFF" size={14} />
        </View>

        {/* ============================================= */}
        {/* TÍTULO DEL PROBLEMA */}
        {/* ============================================= */}
        <View style={styles.titleContainer}>
          <Text style={styles.titlePrefix}>Problema: </Text>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            placeholder="Energía"
            placeholderTextColor="#808088"
            style={styles.titleInput}
            multiline={false}
          />
        </View>

        {/* ============================================= */}
        {/* DESCRIPCIÓN DEL PROBLEMA */}
        {/* ============================================= */}
        <View style={styles.descriptionBox}>
          <TextInput
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Descripción del problema"
            placeholderTextColor="#A39FB8"
            style={styles.descriptionInput}
            multiline
            textAlignVertical="center"
          />
        </View>

        {/* ============================================= */}
        {/* AÑADIR SOLUCIÓN */}
        {/* ============================================= */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.solutionButton}
          onPress={() => onPressAddSolution?.()}
        >
          <Text style={styles.solutionButtonText}>
            {solutionButtonText}
          </Text>
        </TouchableOpacity>

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
                : 'rgba(92, 119, 183, 0.20)',
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
                : 'rgba(92, 119, 183, 0.20)',
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
                : 'rgba(92, 119, 183, 0.20)',
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
                : 'rgba(92, 119, 183, 0.20)',
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
};

export default ProblemNode;

// =======================================================
// ESTILOS
// =======================================================

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 12,
  },

  cardContainer: {
    width: 280,
    borderColor: '#1F386A',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
  },

  cardContainerSelected: {
    borderColor: '#5C77B7',
    borderWidth: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  dragHandle: {
    flex: 1,
    height: 24,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  titlePrefix: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  titleInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 0,
  },

  descriptionBox: {
    backgroundColor: '#1E1B2E',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },

  descriptionInput: {
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 40,
    padding: 0,
  },

  solutionButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },

  solutionButtonText: {
    color: '#4B485A',
    fontSize: 15,
    fontWeight: '500',
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