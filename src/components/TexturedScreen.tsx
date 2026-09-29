// TexturedScreen.tsx: Fondo o background con textura para las pantallas de la aplicación

import React from 'react';
import { StyleSheet, View, ImageBackground, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TexturedScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const TexturedScreen: React.FC<TexturedScreenProps> = ({
  children,
  backgroundColor = '#0D0C14', // Color base por defecto
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ImageBackground
        source={require('../../assets/textures/dot.png')} 
        resizeMode="repeat" // O "cover" según el tipo de textura
        imageStyle={styles.textureStyle}
        style={styles.background}
      >
        <SafeAreaView style={[styles.safeArea, style]}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textureStyle: {
    opacity: 0.15, // Ajusta la intensidad de la textura sobre el color base
  },
  safeArea: {
    flex: 1,
  },
});

export default TexturedScreen;