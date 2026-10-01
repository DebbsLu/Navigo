
// ------------------------------------
// IMPORTACIONES
// ------------------------------------

import React, { useRef } from 'react';

import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  GestureResponderEvent,
} from 'react-native';

// ------------------------------------
// PROPIEDADES DEL COMPONENTE
// ------------------------------------

interface CanvasGestureLayerProps {
  // Valor que controla el desplazamiento del canvas.
  pan: Animated.ValueXY;

  // Valor que controla el nivel de zoom.
  zoom: Animated.Value;

  // Límites mínimo y máximo del zoom.
  minZoom: number;
  maxZoom: number;

  // Posición del mundo dentro del canvas.
  worldLeft: number;
  worldTop: number;

  // Se ejecuta cuando se realiza un toque
  // sobre un espacio vacío del canvas.
  onCanvasPress?: () => void;
}

// ------------------------------------
// TIPOS AUXILIARES
// ------------------------------------

// Representa un punto dentro del canvas.
interface Point {
  x: number;
  y: number;
}

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

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

  // ------------------------------------
  // ESTADO DEL PAN
  // ------------------------------------

  // Guarda la posición del canvas antes de comenzar
  // un nuevo movimiento.
  const lastPan = useRef({
    x: 0,
    y: 0,
  });

  // ------------------------------------
  // ESTADO DEL PINCH
  // ------------------------------------

  // Distancia entre los dos dedos al comenzar
  // el gesto de zoom.
  const initialDistance = useRef<number | null>(
    null
  );

  // Zoom existente cuando comienza el pinch.
  const initialZoom = useRef(1);

  // Posición del pan cuando comienza el pinch.
  const initialPan = useRef({
    x: 0,
    y: 0,
  });

  // Punto central entre los dos dedos.
  const pinchCenter = useRef<Point | null>(null);

  // ------------------------------------
  // OBTENER DISTANCIA ENTRE DOS DEDOS
  // ------------------------------------

  // Calcula la distancia entre los dos primeros
  // puntos de contacto.
  const getDistance = (
    touches: readonly any[]
  ): number | null => {

    // Se necesitan al menos dos dedos.
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

  // ------------------------------------
  // OBTENER CENTRO DEL PINCH
  // ------------------------------------

  // Calcula el punto medio entre los dos dedos.
  // Este punto se utiliza como referencia para
  // mantener fijo el contenido mientras se hace zoom.
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

  // ------------------------------------
  // CONFIGURACIÓN DEL PAN RESPONDER
  // ------------------------------------

  const panResponder = useRef(
    PanResponder.create({

      // ------------------------------------
      // TOQUE INICIAL
      // ------------------------------------

      // Esta capa se encuentra detrás del mundo.
      //
      // El world utiliza pointerEvents="box-none",
      // por lo que los toques sobre los chunks
      // pueden seguir siendo recibidos por ellos.
      //
      // Los toques realizados sobre espacios vacíos
      // llegan a esta capa.
      onStartShouldSetPanResponder: () =>
        true,

      // ------------------------------------
      // DETECTAR MOVIMIENTO
      // ------------------------------------

      // Determina cuándo el gesto debe comenzar
      // a ser tratado como movimiento.
      onMoveShouldSetPanResponder: (
        _event,
        gestureState
      ) => {

        const touches =
          _event.nativeEvent.touches;

        // Dos dedos indican un gesto de pinch.
        if (touches.length >= 2) {
          return true;
        }

        // Para un solo dedo, se requiere un
        // desplazamiento mínimo para evitar
        // interpretar un toque como movimiento.
        const movedEnough =
          Math.abs(gestureState.dx) > 8 ||
          Math.abs(gestureState.dy) > 8;

        return movedEnough;
      },

      // ------------------------------------
      // INICIO DEL GESTO
      // ------------------------------------

      onPanResponderGrant: (
        event: GestureResponderEvent
      ) => {

        // Obtener la posición actual del canvas.
        const currentPanX =
          (pan.x as any).__getValue();

        const currentPanY =
          (pan.y as any).__getValue();

        // Guardar la posición actual del pan.
        lastPan.current = {
          x: currentPanX,
          y: currentPanY,
        };

        // Guardar la posición inicial del gesto.
        initialPan.current = {
          x: currentPanX,
          y: currentPanY,
        };

        // Guardar el nivel de zoom inicial.
        initialZoom.current =
          (zoom as any).__getValue();

        const touches =
          event.nativeEvent.touches;

        // ------------------------------------
        // INICIO CON DOS DEDOS
        // ------------------------------------

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

      // ------------------------------------
      // MOVIMIENTO
      // ------------------------------------

      onPanResponderMove: (
        event: GestureResponderEvent,
        gestureState
      ) => {

        const touches =
          event.nativeEvent.touches;

        // ------------------------------------
        // PINCH ZOOM
        // ------------------------------------

        // Cuando hay dos dedos, el movimiento
        // se interpreta como un gesto de zoom.
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

          // ------------------------------------
          // INICIALIZAR PINCH
          // ------------------------------------

          // Si el pinch todavía no tiene valores
          // iniciales, se establecen en este momento.
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

          // ------------------------------------
          // CALCULAR NUEVO ZOOM
          // ------------------------------------

          // Compara la distancia actual entre los
          // dedos con la distancia inicial.
          const scaleFactor =
            distance /
            initialDistance.current;

          let newZoom =
            initialZoom.current *
            scaleFactor;

          // Mantener el zoom dentro de los
          // límites establecidos.
          newZoom = Math.max(
            minZoom,
            Math.min(
              maxZoom,
              newZoom
            )
          );

          // ------------------------------------
          // DETERMINAR PUNTO FOCAL
          // ------------------------------------

          // El punto focal es el centro del pinch.
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

          // ------------------------------------
          // OBTENER PUNTO DEL MUNDO
          // ------------------------------------

          // Determina qué punto del mundo se
          // encuentra debajo de los dedos.
          const worldPointX =
            (focalX - startPanX) /
              startZoom -
            worldLeft;

          const worldPointY =
            (focalY - startPanY) /
              startZoom -
            worldTop;

          // ------------------------------------
          // CALCULAR NUEVO PAN
          // ------------------------------------

          // Ajusta la posición del canvas para que
          // el mismo punto del mundo permanezca
          // debajo del centro de los dedos.
          const newPanX =
            focalX -
            (worldPointX + worldLeft) *
              newZoom;

          const newPanY =
            focalY -
            (worldPointY + worldTop) *
              newZoom;

          // ------------------------------------
          // APLICAR CAMBIOS
          // ------------------------------------

          zoom.setValue(newZoom);

          pan.setValue({
            x: newPanX,
            y: newPanY,
          });

          return;
        }

        // ------------------------------------
        // PAN NORMAL
        // ------------------------------------

        // Cuando solamente hay un dedo,
        // se desplaza el canvas según el
        // movimiento realizado.
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

      // ------------------------------------
      // FIN DEL GESTO
      // ------------------------------------

      onPanResponderRelease: (
        _event,
        gestureState
      ) => {

        // Determina si hubo un desplazamiento
        // suficiente para considerarlo movimiento.
        const moved =
          Math.abs(gestureState.dx) > 8 ||
          Math.abs(gestureState.dy) > 8;

        // Si existe una distancia inicial,
        // significa que se realizó un pinch.
        const wasPinching =
          initialDistance.current !== null;

        // ------------------------------------
        // TOQUE SIMPLE EN EL CANVAS
        // ------------------------------------

        // Si no hubo movimiento ni pinch,
        // se considera un toque sobre espacio vacío.
        if (
          !moved &&
          !wasPinching
        ) {
          onCanvasPress?.();
        }

        // ------------------------------------
        // LIMPIAR ESTADO DEL PINCH
        // ------------------------------------

        initialDistance.current =
          null;

        pinchCenter.current =
          null;

        // ------------------------------------
        // ACTUALIZAR REFERENCIAS
        // ------------------------------------

        // Guardar los valores actuales para
        // utilizarlos en el siguiente gesto.
        initialZoom.current =
          (zoom as any).__getValue();

        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },

      // ------------------------------------
      // TERMINACIÓN DEL GESTO
      // ------------------------------------

      // Se ejecuta cuando React Native termina
      // el gesto de manera externa.
      onPanResponderTerminate: () => {

        // Limpiar el estado del pinch.
        initialDistance.current =
          null;

        pinchCenter.current =
          null;

        // Actualizar la última posición conocida.
        lastPan.current = {
          x: (pan.x as any).__getValue(),
          y: (pan.y as any).__getValue(),
        };
      },
    })
  ).current;

  // ------------------------------------
  // RENDERIZADO
  // ------------------------------------

  return (
    <View
      style={styles.layer}
      {...panResponder.panHandlers}
    />
  );
};

// ------------------------------------
// EXPORTACIÓN
// ------------------------------------

export default CanvasGestureLayer;

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({

  // Capa que ocupa todo el canvas.
  //
  // Se coloca en el nivel inferior mediante
  // zIndex para recibir los gestos del fondo
  // sin interferir con los elementos superiores.
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
});
