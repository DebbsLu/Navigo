import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import BtnClose from './BtnClose';

export type ChunkStatus =
  | 'avanzando'
  | 'completado'
  | 'no_iniciado';

export type ConnectionSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

interface ConnectionPointState {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

interface ChunkNodeProps {
  title: string;
  description: string;

  status?: ChunkStatus;

  selected?: boolean;

  onSelect?: () => void;

  onTitleChange?: (title: string) => void;

  onDescriptionChange?: (
    description: string
  ) => void;

  onStatusChange?: (
    status: ChunkStatus
  ) => void;

  subStepButtonText?: string;

  connections?: ConnectionPointState;

  onClose?: () => void;

  onPressSubStep?: () => void;

  onConnectPointPress?: (
    side: ConnectionSide
  ) => void;
}

const DOT_SIZE = 14;

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

const ChunkNode: React.FC<ChunkNodeProps> = ({
  title,
  description,

  status = 'no_iniciado',

  selected = false,

  onSelect,

  onTitleChange,

  onDescriptionChange,

  onStatusChange,

  subStepButtonText = '+ Añadir subpaso',

  connections = {},

  onClose,

  onPressSubStep,

  onConnectPointPress,
}) => {
  const currentStatus =
    STATUS_CONFIG[status];

  return (
    <View
      style={styles.wrapper}
      onTouchStart={onSelect}
    >
      {/* ESTADO */}
      <Text
        style={[
          styles.statusText,
          {
            color: currentStatus.color,
          },
        ]}
      >
        {currentStatus.label}
      </Text>

      {/* TARJETA */}
      <View
        style={[
          styles.cardContainer,
          selected &&
            styles.cardContainerSelected,
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          {/* BOTÓN DE ESTADO */}
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

          {/* CERRAR */}
          <BtnClose
            onPress={() => onClose?.()}
          />
        </View>

        {/* TÍTULO */}
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          placeholder="Título del paso"
          placeholderTextColor="#777380"
          style={styles.titleInput}
          multiline
        />

        {/* DESCRIPCIÓN */}
        <View style={styles.descriptionBox}>
          <TextInput
            value={description}
            onChangeText={
              onDescriptionChange
            }
            placeholder="Escribe aquí los detalles..."
            placeholderTextColor="#777380"
            style={styles.descriptionInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* AÑADIR SUBPASO */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.subStepButton}
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

        {/* PUNTO SUPERIOR */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.('top')
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

        {/* PUNTO INFERIOR */}
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

        {/* PUNTO IZQUIERDO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.('left')
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

        {/* PUNTO DERECHO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onConnectPointPress?.('right')
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

export default ChunkNode;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 12,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 16,
  },

  cardContainer: {
    width: 280,
    backgroundColor: '#181622',
    borderColor: '#1E1D29',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
  },

  cardContainerSelected: {
    borderColor: '#853ACF',
    borderWidth: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  titleInput: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    paddingRight: 10,
  },

  descriptionBox: {
    backgroundColor: '#1F1D2C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  descriptionInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },

  subStepButton: {
    backgroundColor: '#181622',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },

  subStepButtonText: {
    color: '#3B3947',
    fontSize: 15,
    fontWeight: '600',
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
    alignSelf: 'center',
    left: '50%',
    transform: [
      {
        translateX: -(DOT_SIZE / 2),
      },
    ],
  },

  dotBottom: {
    bottom: -DOT_SIZE / 2,
    alignSelf: 'center',
    left: '50%',
    transform: [
      {
        translateX: -(DOT_SIZE / 2),
      },
    ],
  },

  dotLeft: {
    left: -DOT_SIZE / 2,
    top: '50%',
    transform: [
      {
        translateY: -(DOT_SIZE / 2),
      },
    ],
  },

  dotRight: {
    right: -DOT_SIZE / 2,
    top: '50%',
    transform: [
      {
        translateY: -(DOT_SIZE / 2),
      },
    ],
  },
});