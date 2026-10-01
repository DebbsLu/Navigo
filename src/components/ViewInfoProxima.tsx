import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BtnCircleSmall } from './BtnCircleSmall';

interface ViewInfoProximaProps {
  gradientColors?: readonly [string, string, ...string[]]; // Permite cambiar el degradado de fondo
  subtitle?: string;                                       // Texto superior (Title2)
  title?: string;                                          // Texto principal (Title1)
  tagText?: string;                                        // Texto de la etiqueta
  tagBackgroundColor?: string;                             // Color de fondo de la etiqueta
  btnIconName?: any;                                       // Icono para el botón circular
  btnBackgroundColor?: string;                             // Color de fondo del botón
  onPressBtn?: () => void;                                 // Acción al presionar el botón
  style?: StyleProp<ViewStyle>;                            // Estilos extras para el contenedor
}

export const ViewInfoProxima: React.FC<ViewInfoProximaProps> = ({
  gradientColors = ['#7142A0', '#C694EB'],
  subtitle = 'Actividad más próxima a cumplir:',
  title = 'Entregar el proyecto de INS',
  tagText = 'Jue May 30, 09:20 am',
  tagBackgroundColor = '#392A47',
  btnIconName = 'arrow-forward',
  btnBackgroundColor = 'rgba(255, 255, 255, 0.2)',
  onPressBtn,
  style,
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0.5 }} // Degradado de izquierda a derecha
      end={{ x: 1, y: 0.5 }}
      style={[styles.container, style]}
    >
      {/* Contenido principal (textos y etiqueta) */}
      <View style={styles.contentContainer}>
        <Text style={styles.title2}>{subtitle}</Text>
        <Text style={styles.title1}>{title}</Text>

        {/* View_etiqueta */}
        <View style={[styles.tag, { backgroundColor: tagBackgroundColor }]}>
          <Text style={styles.title2}>{tagText}</Text>
        </View>
      </View>

      {/* Botón circular reutilizable */}
      <BtnCircleSmall
        iconName={btnIconName}
        backgroundColor={btnBackgroundColor}
        onPress={onPressBtn || (() => {})}
        size={46}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, // 20 × 0.8
    padding: 14.4,    // 18 × 0.8
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },

  contentContainer: {
    flex: 1,
    marginRight: 9.6, // 12 × 0.8
  },

  title2: {
    fontSize: 12,     // 15 × 0.8
    fontWeight: '400',
    color: '#DED1EB',
  },

  title1: {
    fontSize: 12,     // 15 × 0.8
    fontWeight: '700',
    color: '#DED1EB',
    marginTop: 9.6,   // 12 × 0.8
    marginBottom: 11.2, // 14 × 0.8
  },

  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12.8, // 16 × 0.8
    paddingVertical: 6.4,    // 8 × 0.8
    borderRadius: 16,        // 20 × 0.8
  },
});