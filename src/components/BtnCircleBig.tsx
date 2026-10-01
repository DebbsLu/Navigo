import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';

interface BtnCircleBigProps {
  onPress: () => void;
  size?: number;
}

const BtnCircleBig: React.FC<BtnCircleBigProps> = ({
  onPress,
  size = 86,
}) => {
  const borderRadius = size / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
};

export default BtnCircleBig;

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(198, 148, 235, 0.20)',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#853ACF',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  icon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -1,
  },
});