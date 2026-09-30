//Menú para añadir problemas, audios y recordatorio
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

interface FloatingMenuProps {
  onSelectOption?: (option: string) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onSelectOption }) => {
  const [isMinimized, setIsMinimized] = useState(false);
const [selectedOption, setSelectedOption] =
  useState<string | null>(null);

  const options = [
    'Algo te detiene: Problemas, Dist...',
    'Grabar audio para expresarse',
    'Definir recordatorio',
  ];

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  // Estado Minimizado (Círculo Flotante)
  if (isMinimized) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.minimizedCircle}
        onPress={() => setIsMinimized(false)}
      >
        <Text style={styles.minimizedIcon}>?</Text>
      </TouchableOpacity>
    );
  }

  // Estado Expandido (Menú Completo)
  return (
    <View style={styles.cardContainer}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>¿Qué quieres representar?</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => setIsMinimized(true)}
        >
          <Text style={styles.minimizeBtn}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Línea divisoria */}
      <View style={styles.divider} />

      {/* Lista de opciones */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedOption === option;
          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(option)}
              style={({ pressed }) => [
                styles.optionItem,
                (isSelected || pressed) && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionText} numberOfLines={1}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Tarjeta Completa
  cardContainer: {
    backgroundColor: '#181622',
    borderColor: '#1E1D29',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    // Sombra suave para dar profundidad si flota
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#A39FB8',
    fontSize: 18,
    fontWeight: '400',
  },
  minimizeBtn: {
    color: '#A39FB8',
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#3B3947',
    marginVertical: 4,
  },
  optionsContainer: {
    marginTop: 8,
    gap: 6,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#433F5D',
  },
  optionText: {
    color: '#A39FB8',
    fontSize: 16,
    fontWeight: '400',
  },

  // Círculo flotante minimizado
  minimizedCircle: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#181622',
    borderColor: '#1E1D29',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
  },
  minimizedIcon: {
    color: '#A39FB8',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FloatingMenu;