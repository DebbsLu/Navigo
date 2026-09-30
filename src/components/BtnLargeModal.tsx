// BtnLargeModal.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BtnLargeModalProps {
  title?: string;               // Texto que lleva dentro (dinámico)
  backgroundColor?: string;     // Color de fondo (por defecto #853ACF)
  onPress?: () => void;         // Función que se ejecuta al presionar
  style?: ViewStyle;            // Estilos adicionales para el contenedor si se requieren
  textStyle?: TextStyle;        // Estilos adicionales para el texto si se requieren
}

const BtnLargeModal: React.FC<BtnLargeModalProps> = ({
  title = '+ añadir actividad',
  backgroundColor = '#853ACF',
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,          // Bordes bastante redondeados como en la imagen
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',          // Color blanco fijo
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BtnLargeModal; 