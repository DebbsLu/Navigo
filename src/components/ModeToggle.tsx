import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModeToggleProps {
  value: 'planeacion' | 'ejecucion';
  onChange: (mode: 'planeacion' | 'ejecucion') => void;
}

const CONTAINER_WIDTH = 280;
const CONTAINER_HEIGHT = 48;
const PADDING = 4;
const TOGGLE_WIDTH = (CONTAINER_WIDTH - PADDING * 2) / 2;

export const ModeToggle: React.FC<ModeToggleProps> = ({ value, onChange }) => {
  const animatedValue = useRef(
    new Animated.Value(value === 'planeacion' ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value === 'planeacion' ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_WIDTH],
  });

  return (
    <LinearGradient
      colors={['#7142A0', '#C694EB']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.container}
    >
      {/* Indicador con borde blanco de la opción activa */}
      <Animated.View
        style={[
          styles.selectionIndicator,
          {
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Opción 1: Planeación */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.optionButton}
        onPress={() => onChange('planeacion')}
      >
        <Text style={styles.optionText}>Planeación</Text>
      </TouchableOpacity>

      {/* Opción 2: Ejecución */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.optionButton}
        onPress={() => onChange('ejecucion')}
      >
        <Text style={styles.optionText}>Ejecución</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    borderRadius: CONTAINER_HEIGHT / 2,
    padding: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    left: PADDING,
    width: TOGGLE_WIDTH,
    height: CONTAINER_HEIGHT - PADDING * 2,
    borderRadius: (CONTAINER_HEIGHT - PADDING * 2) / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  optionButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});