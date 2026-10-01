import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

interface CanvasMenuProps {
  onAddChunk?: () => void; // Función para añadir el componente Chunk al lienzo
  onPressBloqueo?: () => void; // Evento personalizado opcional
}

// Ícono SVG para Chunks (Cubo con conexión/lápiz)
const ChunksIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    {/* Trazo / Línea superior */}
    <Path
      d="M5 10C5 7.79086 6.79086 6 9 6H13C14.1046 6 15 5.10457 15 4V4"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Pila o marcador */}
    <Path
      d="M17 3L20 6"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {/* Cubo isometrico */}
    <Path
      d="M12 14L16 12L20 14L16 16L12 14Z"
      stroke="#FFFFFF"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M12 14V18.5L16 20.5V16"
      stroke="#FFFFFF"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M20 14V18.5L16 20.5"
      stroke="#FFFFFF"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono SVG para Bloqueo (Mira / Diana / Target)
const BloqueoIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    {/* Círculo externo */}
    <Circle cx={12} cy={12} r={8} stroke="#FFFFFF" strokeWidth={1.8} />
    {/* Cruz central */}
    <Path
      d="M12 8V16M8 12H16"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const CanvasMenu: React.FC<CanvasMenuProps> = ({
  onAddChunk,
  onPressBloqueo,
}) => {
  const navigation = useNavigation<any>();

  const handleBloqueoPress = () => {
    if (onPressBloqueo) {
      onPressBloqueo();
    } else {
      // Redirige a la pantalla Blocks con React Navigation
      navigation.navigate('Blocks');
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Tarjeta del Menú con los 2 botones */}
      <View style={styles.cardContainer}>
        {/* Botón Chunks */}
        <View style={styles.itemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={onAddChunk}
          >
            <ChunksIcon />
          </TouchableOpacity>
        </View>

        {/* Botón Bloqueo */}
        <View style={styles.itemWrapper}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={handleBloqueoPress}
          >
            <BloqueoIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Textos descriptivos debajo del menú */}
      <View style={styles.labelsContainer}>
        <Text style={styles.labelText}>Chunks</Text>
        <Text style={styles.labelText}>Bloqueo</Text>
      </View>
    </View>
  );
};

export default CanvasMenu;

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    alignSelf: 'center',
  },

  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#13111C',
    borderColor: '#1E1D29',
    borderWidth: 1.5,

    borderRadius: 20,

    padding: 7,
    gap: 8,
  },

  itemWrapper: {
    alignItems: 'center',
  },

  button: {
    width: 60,
    height: 60,

    backgroundColor: '#181622',
    borderColor: '#1E1D29',
    borderWidth: 1.5,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',
  },

  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',

    width: '100%',

    paddingHorizontal: 8,
    marginTop: 5,
  },

  labelText: {
    color: '#A192B4',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});