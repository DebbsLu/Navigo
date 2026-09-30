import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  GestureResponderEvent,
} from 'react-native';

interface CanvasGestureLayerProps {
  pan: Animated.ValueXY;
}

const CanvasGestureLayer: React.FC<
  CanvasGestureLayerProps
> = ({ pan }) => {

  const lastPan = useRef({
    x: 0,
    y: 0,
  });

  const panResponder = useRef(
    PanResponder.create({

      // Un toque simple no debe ser capturado
      // inmediatamente.
      onStartShouldSetPanResponder: () => false,

      // Solo tomamos el gesto cuando realmente
      // existe movimiento.
      onMoveShouldSetPanResponder: (
        _event,
        gestureState
      ) => {
        const movedEnough =
          Math.abs(gestureState.dx) > 8 ||
          Math.abs(gestureState.dy) > 8;

        return movedEnough;
      },

      onPanResponderGrant: () => {
        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },

      onPanResponderMove: (
        _event: GestureResponderEvent,
        gestureState
      ) => {
        const newX =
          lastPan.current.x +
          gestureState.dx;

        const newY =
          lastPan.current.y +
          gestureState.dy;

        pan.setValue({
          x: newX,
          y: newY,
        });
      },

      onPanResponderRelease: () => {
        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },

      onPanResponderTerminate: () => {
        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },
    })
  ).current;

  return (
    <View
      style={styles.layer}
      {...panResponder.panHandlers}
    />
  );
};

export default CanvasGestureLayer;

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
});