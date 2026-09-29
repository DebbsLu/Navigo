// BtnCircleBig.tsx

import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';

interface BtnCircleBigProps {
  icon?: string;
  backgroundColor?: string;
  iconColor?: string;
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const BtnCircleBig: React.FC<BtnCircleBigProps> = ({
  icon = '+',
  backgroundColor = 'rgba(133, 58, 207, 0.2)',
  iconColor = '#FFFFFF',
  size = 140,
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
      <Text
        style={[
          styles.icon,
          {
            color: iconColor,
            fontSize: size * 0.28,
          },
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',

    shadowColor: '#853ACF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 6,
  },

  icon: {
    fontWeight: '300',
  },
});

export default BtnCircleBig;