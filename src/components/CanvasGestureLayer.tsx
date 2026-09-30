import React, {
  useRef,
} from 'react';

import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  GestureResponderEvent,
} from 'react-native';

interface CanvasGestureLayerProps {
  pan: Animated.ValueXY;

  zoom: Animated.Value;

  minZoom: number;

  maxZoom: number;

  worldLeft: number;

  worldTop: number;

  onCanvasPress?: () => void;
}

interface Point {
  x: number;
  y: number;
}

const CanvasGestureLayer: React.FC<
  CanvasGestureLayerProps
> = ({
  pan,
  zoom,
  minZoom,
  maxZoom,
  worldLeft,
  worldTop,
  onCanvasPress,
}) => {
  // =====================================================
  // ESTADO DEL PAN
  // =====================================================

  const lastPan = useRef({
    x: 0,
    y: 0,
  });

  // =====================================================
  // ESTADO DEL PINCH
  // =====================================================

  const initialDistance =
    useRef<number | null>(null);

  const initialZoom =
    useRef(1);

  const initialPan =
    useRef({
      x: 0,
      y: 0,
    });

  const pinchCenter =
    useRef<Point | null>(null);

  // =====================================================
  // OBTENER DISTANCIA ENTRE DOS DEDOS
  // =====================================================

  const getDistance = (
    touches: readonly any[]
  ): number | null => {
    if (touches.length < 2) {
      return null;
    }

    const dx =
      touches[1].locationX -
      touches[0].locationX;

    const dy =
      touches[1].locationY -
      touches[0].locationY;

    return Math.sqrt(
      dx * dx + dy * dy
    );
  };

  // =====================================================
  // OBTENER CENTRO DEL PINCH
  // =====================================================

  const getPinchCenter = (
    touches: readonly any[]
  ): Point | null => {
    if (touches.length < 2) {
      return null;
    }

    return {
      x:
        (touches[0].locationX +
          touches[1].locationX) /
        2,

      y:
        (touches[0].locationY +
          touches[1].locationY) /
        2,
    };
  };

  // =====================================================
  // PAN RESPONDER
  // =====================================================

  const panResponder = useRef(
    PanResponder.create({
      // -------------------------------------------------
      // TOQUE INICIAL
      // -------------------------------------------------
      //
      // Esta capa está detrás del mundo.
      // Como el world usa pointerEvents="box-none",
      // los toques sobre los chunks siguen llegando
      // a los propios chunks.
      //
      // Un toque sobre espacio vacío sí llega aquí.
      // -------------------------------------------------

      onStartShouldSetPanResponder: () =>
        true,

      // -------------------------------------------------
      // DETECTAR MOVIMIENTO
      // -------------------------------------------------

      onMoveShouldSetPanResponder: (
        _event,
        gestureState
      ) => {
        const touches =
          _event.nativeEvent.touches;

        // Dos dedos = pinch
        if (touches.length >= 2) {
          return true;
        }

        const movedEnough =
          Math.abs(gestureState.dx) > 8 ||
          Math.abs(gestureState.dy) > 8;

        return movedEnough;
      },

      // =================================================
      // INICIO DEL GESTO
      // =================================================

      onPanResponderGrant: (
        event: GestureResponderEvent
      ) => {
        const currentPanX =
          (pan.x as any).__getValue();

        const currentPanY =
          (pan.y as any).__getValue();

        // Guardar posición actual del pan
        lastPan.current = {
          x: currentPanX,
          y: currentPanY,
        };

        // Guardar posición inicial
        initialPan.current = {
          x: currentPanX,
          y: currentPanY,
        };

        // Guardar zoom inicial
        initialZoom.current =
          (zoom as any).__getValue();

        const touches =
          event.nativeEvent.touches;

        // ---------------------------------------------
        // Si comienza con dos dedos
        // ---------------------------------------------

        if (touches.length >= 2) {
          const distance =
            getDistance(touches);

          const center =
            getPinchCenter(touches);

          if (
            distance !== null &&
            center !== null
          ) {
            initialDistance.current =
              distance;

            pinchCenter.current =
              center;
          }
        }
      },

      // =================================================
      // MOVIMIENTO
      // =================================================

      onPanResponderMove: (
        event: GestureResponderEvent,
        gestureState
      ) => {
        const touches =
          event.nativeEvent.touches;

        // =================================================
        // PINCH ZOOM
        // =================================================

        if (touches.length >= 2) {
          const distance =
            getDistance(touches);

          const currentCenter =
            getPinchCenter(touches);

          if (
            distance === null ||
            currentCenter === null
          ) {
            return;
          }

          // ---------------------------------------------
          // Inicializar pinch si todavía no existe
          // ---------------------------------------------

          if (
            initialDistance.current ===
              null ||
            pinchCenter.current === null
          ) {
            initialDistance.current =
              distance;

            pinchCenter.current =
              currentCenter;

            initialZoom.current =
              (zoom as any).__getValue();

            initialPan.current = {
              x: (pan.x as any).__getValue(),
              y: (pan.y as any).__getValue(),
            };

            return;
          }

          // ---------------------------------------------
          // Calcular nuevo zoom
          // ---------------------------------------------

          const scaleFactor =
            distance /
            initialDistance.current;

          let newZoom =
            initialZoom.current *
            scaleFactor;

          newZoom = Math.max(
            minZoom,
            Math.min(
              maxZoom,
              newZoom
            )
          );

          // ---------------------------------------------
          // Punto focal
          // ---------------------------------------------

          const focalX =
            pinchCenter.current.x;

          const focalY =
            pinchCenter.current.y;

          const startPanX =
            initialPan.current.x;

          const startPanY =
            initialPan.current.y;

          const startZoom =
            initialZoom.current;

          // ---------------------------------------------
          // Punto del mundo bajo los dedos
          // ---------------------------------------------

          const worldPointX =
            (focalX - startPanX) /
              startZoom -
            worldLeft;

          const worldPointY =
            (focalY - startPanY) /
              startZoom -
            worldTop;

          // ---------------------------------------------
          // Nuevo pan para mantener ese punto fijo
          // ---------------------------------------------

          const newPanX =
            focalX -
            (worldPointX + worldLeft) *
              newZoom;

          const newPanY =
            focalY -
            (worldPointY + worldTop) *
              newZoom;

          // ---------------------------------------------
          // Aplicar
          // ---------------------------------------------

          zoom.setValue(newZoom);

          pan.setValue({
            x: newPanX,
            y: newPanY,
          });

          return;
        }

        // =================================================
        // PAN NORMAL
        // =================================================

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

      // =================================================
      // FIN DEL GESTO
      // =================================================

      onPanResponderRelease: (
        _event,
        gestureState
      ) => {
        const moved =
          Math.abs(gestureState.dx) > 8 ||
          Math.abs(gestureState.dy) > 8;

        const wasPinching =
          initialDistance.current !== null;

        // ---------------------------------------------
        // TOQUE SIMPLE EN CANVAS
        // ---------------------------------------------

        if (
          !moved &&
          !wasPinching
        ) {
          onCanvasPress?.();
        }

        // ---------------------------------------------
        // Limpiar pinch
        // ---------------------------------------------

        initialDistance.current =
          null;

        pinchCenter.current =
          null;

        // ---------------------------------------------
        // Actualizar referencias
        // ---------------------------------------------

        initialZoom.current =
          (zoom as any).__getValue();

        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },

      // =================================================
      // TERMINACIÓN DEL GESTO
      // =================================================

      onPanResponderTerminate: () => {
        initialDistance.current =
          null;

        pinchCenter.current =
          null;

        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },
    })
  ).current;

  // =====================================================
  // RENDER
  // =====================================================

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