//Elemento de notificación
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BtnClose from './BtnClose';

interface InfoCardProps {
  title: string;
  description: string;
  onClose: () => void;
  style?: ViewStyle;
  topOffset?: number; // Permite personalizar la distancia superior si se desea
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  onClose,
  style,
  topOffset = 12,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { top: insets.top + topOffset }, // Adapta la posición considerando el notch/Status Bar
        style,
      ]}
    >
      <BtnClose
        onPress={onClose}
        absolute
        top={14}
        right={14}
        color="#808088"
        size={14}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999, // Asegura que quede por encima de otros componentes
    backgroundColor: '#181622',
    borderColor: '#1E1D29',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
  },
  content: {
    paddingRight: 20,
  },
  title: {
    color: '#DED1EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: '#808088',
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
});

export default InfoCard;