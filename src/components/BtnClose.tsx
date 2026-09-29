// BtnClose.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BtnCloseProps {
  onPress: () => void;
  color?: string;               // Color del texto/ícono (por defecto blanco o levemente translúcido)
  size?: number;                // Tamaño de la letra / ícono
  absolute?: boolean;           // Si es true, se ubica automáticamente en la esquina superior derecha
  top?: number;                 // Distancia desde arriba si absolute es true
  right?: number;               // Distancia desde la derecha si absolute es true
  style?: ViewStyle;            // Estilos extra para el botón
}

const BtnClose: React.FC<BtnCloseProps> = ({
  onPress,
  color = '#FFFFFF',
  size = 16,
  absolute = false,
  top = 12,
  right = 16,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      // Aumenta el área táctil para que sea fácil de presionar en celulares
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[
        styles.button,
        absolute && { position: 'absolute', top, right, zIndex: 10 },
        style,
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size }]}>X</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  text: {
    fontWeight: 'bold',
    fontFamily: 'System', // O la fuente que uses en tu proyecto
  },
});

export default BtnClose;