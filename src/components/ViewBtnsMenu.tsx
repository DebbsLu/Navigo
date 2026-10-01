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
    justifyContent: 'center',

    backgroundColor: '#13111C',
    borderColor: '#1E1D29',
    borderWidth: 1.5,

    borderRadius: 20,

    padding: 7,
    gap: 8,

    alignSelf: 'center',
  },

  button: {
    width: 60,
    height: 60,

    backgroundColor: '#181622',

    borderWidth: 1.5,
    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default ViewBtnsMenu;