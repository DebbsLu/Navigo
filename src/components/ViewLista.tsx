import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BtnCircleSmall } from './BtnCircleSmall';

interface ViewListaProps {
  title1: string;               // Texto principal (Texto 1)
  title2?: string;               // Texto secundario / fecha (Texto 2)
  isFirst?: boolean;            // Indica si es el primer elemento de la lista
  borderColor?: string;         // Color del borde (por defecto #9A96CC)
  title2Color?: string;         // Color del Texto 2 (por defecto #C694EB)
  btnBackgroundColor?: string;  // Color de fondo del botón circular (opcional)
  onPressButton?: () => void;   // Evento al presionar el botón circular
  onPressItem?: () => void;     // Evento al presionar toda la tarjeta (opcional)
}

const ViewLista: React.FC<ViewListaProps> = ({
  title1,
  title2,
  isFirst = false,
  borderColor = '#9A96CC',
  title2Color = '#C694EB',
  btnBackgroundColor,
  onPressButton,
  onPressItem,
}) => {
  // Si es el primero: #1E1D29 al 30% de opacidad. Para los demás: transparente
  const backgroundColor = isFirst ? 'rgba(30, 29, 41, 0.3)' : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPressItem}
      disabled={!onPressItem}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {/* Texto 1 (Principal) */}
      <Text numberOfLines={1} style={styles.text1}>
        {title1}
      </Text>

      {/* Contenedor derecho: Texto 2 + Botón Circular */}
      <View style={styles.rightContainer}>
        <Text numberOfLines={1} style={[styles.text2, { color: title2Color }]}>
          {title2}
        </Text>

        {/* Componente del botón circular */}
        <BtnCircleSmall
          onPress={onPressButton}
          {...(btnBackgroundColor ? { backgroundColor: btnBackgroundColor } : {})}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 6,
  },
  text1: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DED1EB', // Color fijo que no cambia
    marginRight: 12,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
});

export default ViewLista;
