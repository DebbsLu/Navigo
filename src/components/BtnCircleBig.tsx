import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BtnCircleBigProps {
  onPress: () => void;
  size?: number;
}

const BtnCircleBig: React.FC<BtnCircleBigProps> = ({ onPress, size = 120 }) => {
  const borderRadius = size / 2;
  const borderWidth = 1.5;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.shadowContainer,
        { width: size, height: size, borderRadius },
      ]}
    >
      {/* 1. Degradado para el borde (Simula el bisel brillante superior) */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.7)', 'rgba(133, 58, 207, 0.3)', 'rgba(255, 255, 255, 0.1)']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={[styles.gradientBorder, { borderRadius }]}
      >
        {/* 2. Contenedor interior que cubre el centro y deja visible solo el borde */}
        <View
          style={[
            styles.innerContainer,
            {
              borderRadius: borderRadius - borderWidth,
              margin: borderWidth,
            },
          ]}
        >
          <Text style={styles.icon}>+</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default BtnCircleBig;

const styles = StyleSheet.create({
  shadowContainer: {

    // Glow/Sombra exterior violeta
    shadowColor: '#853ACF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    width: 44,       
    height: 44,      
    borderRadius: 22,

  },
  gradientBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 1.2, // Ancho del borde
  },
  innerContainer: {
    flex: 1,
    // #853ACF al 20% de opacidad -> rgba(133, 58, 207, 0.20)
    backgroundColor: 'rgba(133, 58, 207, 0.20)', 
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20.5,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    marginTop: -1, // Ajuste óptico de centrado
  },

});