import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,

} from 'react-native';
import BtnClose from './BtnClose'; // Tu componente existente de cerrar

// Tipos de estado posibles para el chunk
export type ChunkStatus = 'avanzando' | 'completado' | 'no_iniciado';

// Posición de los puntos de conexión
export type ConnectionSide = 'top' | 'bottom' | 'left' | 'right';

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

  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onStatusChange?: (status: ChunkStatus) => void;

  subStepButtonText?: string;
  connections?: ConnectionPointState;
  onClose?: () => void;
  onPressSubStep?: () => void;
  onConnectPointPress?: (
    side: ConnectionSide
  ) => void;
}

// Configuración de colores según el estado
const STATUS_CONFIG: Record<
  ChunkStatus,
  { label: string; color: string }
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
  status = 'avanzando',
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  subStepButtonText = '+ Añadir subpaso',
  connections = {},
  onClose,
  onPressSubStep,
  onConnectPointPress,
}) => {
  const currentStatus = STATUS_CONFIG[status];

  // Helper para obtener el color del punto de conexión (100% o 10% opacidad)
  const getConnectionPointStyle = (isConnected?: boolean) => ({
    backgroundColor: isConnected ? '#9793C7' : 'rgba(151, 147, 199, 0.10)',
  });

  return (
    <View style={styles.wrapper}>
      {/* Texto de Estado externo en la parte superior */}
      <Text style={[styles.statusText, { color: currentStatus.color }]}>
        {currentStatus.label}
      </Text>

      {/* Contenedor principal del Chunk */}
      <View style={styles.cardContainer}>
        {/* Encabezado: Estado (Círculo) + Botón Cerrar */}
        <View style={styles.header}>
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
          <BtnClose onPress={() => onClose?.()} />
        </View> 

        {/* Título del paso */}
        <TextInput
        value={title}
        onChangeText={onTitleChange}
        style={styles.titleInput}
        placeholder="Nombre del paso..."
        placeholderTextColor="#5E596B"
        multiline
      />

        {/* Caja contenedora de la descripción */}
      <View style={styles.descriptionBox}>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          style={styles.descriptionInput}
          placeholder="Escribe aquí los detalles del paso..."
          placeholderTextColor="#5E596B"
          multiline
          textAlignVertical="top"
        />
      </View>

        {/* Botón inferior para Subpaso */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.subStepButton}
          onPress={onPressSubStep}
        >
          <Text style={styles.subStepButtonText}>{subStepButtonText}</Text>
        </TouchableOpacity>

        {/* ---- 4 Botones / Puntos de conexión en los costados ---- */}

        {/* Punto Superior */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.connectionDot,
            styles.dotTop,
            getConnectionPointStyle(connections.top),
          ]}
          onPress={() => onConnectPointPress?.('top')}
        />

        {/* Punto Inferior */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.connectionDot,
            styles.dotBottom,
            getConnectionPointStyle(connections.bottom),
          ]}
          onPress={() => onConnectPointPress?.('bottom')}
        />

        {/* Punto Izquierdo */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.connectionDot,
            styles.dotLeft,
            getConnectionPointStyle(connections.left),
          ]}
          onPress={() => onConnectPointPress?.('left')}
        />

        {/* Punto Derecho */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.connectionDot,
            styles.dotRight,
            getConnectionPointStyle(connections.right),
          ]}
          onPress={() => onConnectPointPress?.('right')}
        />
      </View>
    </View>
  );
};

export default ChunkNode;

const DOT_SIZE = 16; // Tamaño de los círculos de conexión

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    paddingTop: 24, // Espacio para el texto superior y el botón top
    paddingHorizontal: 12, // Espacio para los botones laterales
  },
  titleInput: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 14,
  paddingRight: 10,
},

descriptionInput: {
  color: '#FFFFFF',
  fontSize: 14,
  lineHeight: 20,
  minHeight: 80,
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
  header: {
    flexDirection: 'row',
    //justifyContent: 'flex-end',
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
  titleText: {
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
  descriptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
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

  /* Estilos para los 4 puntos de conexión */
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
    transform: [{ translateX: -(DOT_SIZE / 2) }],
  },
  dotBottom: {
    bottom: -DOT_SIZE / 2,
    alignSelf: 'center',
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
