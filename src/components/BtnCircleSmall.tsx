// BtnCircleSmall.tsx
// Botón circular pequeño, simple y estable

import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

interface BtnCircleSmallProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  iconColor?: string;
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BtnCircleSmall: React.FC<BtnCircleSmallProps> = ({
  iconName = 'arrow-forward',
  backgroundColor = 'rgba(133, 58, 207, 0.2)',
  iconColor = '#FFFFFF',
  size = 36,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.outerContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={size * 0.42}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    // Borde brillante
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',

    // Sombra
    shadowColor: '#853ACF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 4,
  },
});

export default BtnCircleSmall;