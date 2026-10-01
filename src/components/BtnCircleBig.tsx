import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BtnCircleBigProps {
  onPress: () => void;
  size?: number;
  accentRgb?: string; // Color de acento en formato "R, G, B" (por defecto morado)
}

const BtnCircleBig: React.FC<BtnCircleBigProps> = ({
  onPress,
  size = 120,
  accentRgb = "133, 58, 207",
}) => {
  const borderRadius = size / 2;
  const borderWidth = 1.5;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.shadowContainer,
        {
          width: size,
          height: size,
          borderRadius,
          shadowColor: `rgb(${accentRgb})`,
        },
      ]}
    >
      {/* 1. Degradado para el borde (Simula el bisel brillante superior) */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.7)",
          `rgba(${accentRgb}, 0.3)`,
          "rgba(255, 255, 255, 0.1)",
        ]}
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
              backgroundColor: `rgba(${accentRgb}, 0.40)`,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  gradientBorder: {
    flex: 1,
    padding: 1.5, // Ancho del borde
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "300",
    marginTop: -2, // Ajuste óptico de centrado
  },
});
