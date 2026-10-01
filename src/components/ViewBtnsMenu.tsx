import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface ViewBtnsMenuProps {
  initialSelectIndex?: number; // Índice seleccionado por defecto (0: Home, 1: Campana, 2: Mira)
  onSelectTab?: (index: number) => void; // Evento al cambiar de pestaña
}

const ViewBtnsMenu: React.FC<ViewBtnsMenuProps> = ({
  initialSelectIndex = 0,
  onSelectTab,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectIndex);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    if (onSelectTab) {
      onSelectTab(index);
    }
  };

  // Configuración de los botones según la especificación:
  // 0: Home | 1: Campana | 2: Mira (Target/Crosshair)
  const buttons = [
    { id: 0, iconFamily: 'Feather', name: 'home' },
    { id: 1, iconFamily: 'Feather', name: 'bell' },
    { id: 2, iconFamily: 'MaterialCommunityIcons', name: 'crosshairs-gps' }, // O 'target' en Feather
  ];

  return (
    <View style={styles.container}>
      {buttons.map((btn) => {
        const isSelected = selectedIndex === btn.id;

        // Borde según especificación:
        // Si está seleccionado: #C694EB al 50% de opacidad ('rgba(198, 148, 235, 0.5)')
        // Si no está seleccionado: #1E1D29
        const borderColor = isSelected
          ? 'rgba(198, 148, 235, 0.5)'
          : '#1E1D29';

        return (
          <TouchableOpacity
            key={btn.id}
            activeOpacity={0.7}
            onPress={() => handlePress(btn.id)}
            style={[styles.button, { borderColor }]}
          >
            {btn.iconFamily === 'Feather' ? (
              <Feather name={btn.name as any} size={28} color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name={btn.name as any} size={28} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13111C', // Fondo del contenedor principal
    borderColor: '#1E1D29',     // Borde del contenedor principal
    borderWidth: 1.5,
    borderRadius: 24,          // Bordes muy redondeados como en la imagen
    padding: 12,
    width: '100%',
  },
  button: {
    width: 80,
    height: 80,
    backgroundColor: '#181622', // Fondo de cada botón
    borderWidth: 1.5,
    borderRadius: 20,          // Esquinas redondeadas internas
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ViewBtnsMenu;