import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRoute, RouteProp } from '@react-navigation/native';

import TexturedScreen from '../components/TexturedScreen';
import CanvasMenu from '../components/CanvasMenu';
import CanvasGestureLayer from '../components/CanvasGestureLayer';
import ChunkNode, {
  ChunkStatus,
  ConnectionSide,
} from '../components/ChunkNode';


// ---------------------------------------------------------
// TIPOS DE NAVEGACIÓN
// ---------------------------------------------------------

type RootStackParamList = {
  InfinityCanvas: {
    taskId: string;
    title: string;
  };
};

type InfinityCanvasRouteProp = RouteProp<
  RootStackParamList,
  'InfinityCanvas'
>;


// ---------------------------------------------------------
// STORAGE
// ---------------------------------------------------------

const GET_CANVAS_KEY = (taskId: string) =>
  `@canvas_chunks_${taskId}`;


// ---------------------------------------------------------
// DATOS DE CADA CHUNK
// ---------------------------------------------------------

interface ChunkData {
  id: string;
  title: string;
  description: string;
  status: ChunkStatus;

  position: {
    x: number;
    y: number;
  };

  connections: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}


// ---------------------------------------------------------
// CONFIGURACIÓN DEL CANVAS
// ---------------------------------------------------------

const INITIAL_ZOOM = 1;

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;


// ---------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------

const Infinity_canvas: React.FC = () => {

  const route = useRoute<InfinityCanvasRouteProp>();

  const {
    taskId,
    title: taskTitle,
  } = route.params;


  // -------------------------------------------------------
  // CHUNKS
  // -------------------------------------------------------

  const [chunks, setChunks] = useState<ChunkData[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);


  // -------------------------------------------------------
  // POSICIÓN DEL CANVAS
  // -------------------------------------------------------

  const pan = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0,
    })
  ).current;


  // -------------------------------------------------------
  // ZOOM
  // -------------------------------------------------------

  const zoom = useRef(
    new Animated.Value(INITIAL_ZOOM)
  ).current;


  const zoomValue = useRef(INITIAL_ZOOM);

  

  // -------------------------------------------------------
  // CARGAR CHUNKS
  // -------------------------------------------------------

  useEffect(() => {
    loadCanvasChunks();
  }, [taskId]);


  // -------------------------------------------------------
  // GUARDAR CHUNKS
  // -------------------------------------------------------

  useEffect(() => {

    if (isLoaded) {
      saveCanvasChunks(chunks);
    }

  }, [chunks, isLoaded]);


  // -------------------------------------------------------
  // LOAD
  // -------------------------------------------------------

  const loadCanvasChunks = async () => {

    try {

      const jsonValue =
        await AsyncStorage.getItem(
          GET_CANVAS_KEY(taskId)
        );

      if (jsonValue !== null) {

        const savedChunks =
          JSON.parse(jsonValue);

        setChunks(savedChunks);

      } else {

        setChunks([]);

      }

    } catch (e) {

      console.error(
        'Error al cargar chunks:',
        e
      );

    } finally {

      setIsLoaded(true);

    }
  };


  // -------------------------------------------------------
  // SAVE
  // -------------------------------------------------------

  const saveCanvasChunks = async (
    chunksToSave: ChunkData[]
  ) => {

    try {

      const jsonValue =
        JSON.stringify(chunksToSave);

      await AsyncStorage.setItem(
        GET_CANVAS_KEY(taskId),
        jsonValue
      );

    } catch (e) {

      console.error(
        'Error al guardar chunks:',
        e
      );

    }
  };


  // -------------------------------------------------------
  // CALCULAR DISTANCIA ENTRE DOS DEDOS
  // -------------------------------------------------------

  const getDistance = (
    touches: readonly any[]
  ) => {

    if (touches.length < 2) {
      return null;
    }

    const x1 = touches[0].pageX;
    const y1 = touches[0].pageY;

    const x2 = touches[1].pageX;
    const y2 = touches[1].pageY;

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
      dx * dx + dy * dy
    );
  };



  
  // -------------------------------------------------------
  // AGREGAR CHUNK
  // -------------------------------------------------------

const WORLD_SIZE = 5000;
const WORLD_CENTER = WORLD_SIZE / 2;

const handleAddChunk = () => {
  const index = chunks.length;

  const newChunk: ChunkData = {
    id: Date.now().toString(),

    title: `Paso ${index + 1}: Subactividad`,

    description: 'Escribe aquí los detalles del paso...',

    status: 'no_iniciado',

    position: {
      x: WORLD_CENTER - 140 + (index % 3) * 340,
      y:
        WORLD_CENTER -
        120 +
        Math.floor(index / 3) * 300,
    },

    connections: {},
  };

  setChunks(prev => [...prev, newChunk]);
};



const handleChangeChunkTitle = (
  id: string,
  title: string
) => {
  setChunks(prev =>
    prev.map(chunk =>
      chunk.id === id
        ? {
            ...chunk,
            title,
          }
        : chunk
    )
  );
};


const handleChangeChunkDescription = (
  id: string,
  description: string
) => {
  setChunks(prev =>
    prev.map(chunk =>
      chunk.id === id
        ? {
            ...chunk,
            description,
          }
        : chunk
    )
  );
};

const handleChangeChunkStatus = (
  id: string,
  status: ChunkStatus
) => {
  setChunks(prev =>
    prev.map(chunk =>
      chunk.id === id
        ? {
            ...chunk,
            status,
          }
        : chunk
    )
  );
};

  // -------------------------------------------------------
  // ELIMINAR CHUNK
  // -------------------------------------------------------

  const handleRemoveChunk = (
    id: string
  ) => {

    setChunks(prev =>
      prev.filter(
        chunk => chunk.id !== id
      )
    );
  };


  // -------------------------------------------------------
  // CONEXIONES
  // -------------------------------------------------------

  const handleToggleConnection = (
    id: string,
    side: ConnectionSide
  ) => {

    setChunks(prev =>

      prev.map(chunk => {

        if (chunk.id !== id) {
          return chunk;
        }

        return {

          ...chunk,

          connections: {

            ...chunk.connections,

            [side]:
              !chunk.connections[side],

          },

        };

      })

    );

  };


  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
  <TexturedScreen
    style={styles.container}
  >

    {/* HEADER */}
    <View style={styles.header}>
      <Text style={styles.taskTitleText}>
        {taskTitle}
      </Text>
    </View>

    {/* VIEWPORT */}
    <View style={styles.viewport}>

      {/* CAPA DE GESTOS */}
<CanvasGestureLayer
  pan={pan}
  zoom={zoom}
  minZoom={MIN_ZOOM}
  maxZoom={MAX_ZOOM}
  worldLeft={-2500}
  worldTop={-2500}
/>

      {/* WORLD */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.world,
          {
transform: [
  {
    scale: zoom,
  },
  {
    translateX: pan.x,
  },
  {
    translateY: pan.y,
  },
],
          },
        ]}
      >

        {chunks.length === 0 ? (
          <View
            style={
              styles.emptyCanvasContainer
            }
          >
            <Text
              style={
                styles.emptyCanvasText
              }
            >
              Aún no hay pasos creados
              en este lienzo
            </Text>
          </View>
        ) : (
          chunks.map(item => (
            <View
              key={item.id}
              style={[
                styles.chunkItemWrapper,
                {
                  left:
                    item.position.x,
                  top:
                    item.position.y,
                },
              ]}
            >

              <ChunkNode
                title={item.title}
                description={
                  item.description
                }
                status={item.status}
                connections={
                  item.connections
                }

                onTitleChange={
                  newTitle =>
                    handleChangeChunkTitle(
                      item.id,
                      newTitle
                    )
                }

                onDescriptionChange={
                  newDescription =>
                    handleChangeChunkDescription(
                      item.id,
                      newDescription
                    )
                }

                onStatusChange={
                  newStatus =>
                    handleChangeChunkStatus(
                      item.id,
                      newStatus
                    )
                }

                onClose={() =>
                  handleRemoveChunk(
                    item.id
                  )
                }

                onPressSubStep={() =>
                  console.log(
                    'Añadir subpaso a:',
                    item.id
                  )
                }

                onConnectPointPress={
                  side =>
                    handleToggleConnection(
                      item.id,
                      side
                    )
                }
              />

            </View>
          ))
        )}

      </Animated.View>

    </View>

    {/* MENÚ */}
    <View
      style={styles.menuContainer}
    >
      <CanvasMenu
        onAddChunk={
          handleAddChunk
        }
      />
    </View>

  </TexturedScreen>

  );
};


export default Infinity_canvas;


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },


  taskTitleText: {
    color: '#DED1EB',
    fontSize: 20,
    fontWeight: 'bold',
  },


  // Área visible del canvas
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },


  // El mundo que se mueve y escala
  world: {
    position: 'absolute',

    width: 5000,
    height: 5000,

    left: -2500,
    top: -2500,
  },


  // Cada nodo tiene una posición absoluta
  chunkItemWrapper: {
    position: 'absolute',
  },


  emptyCanvasContainer: {
    position: 'absolute',

    left: 2300,
    top: 2300,

    alignItems: 'center',
  },


  emptyCanvasText: {
    color: '#3B3947',
    fontSize: 16,
    fontWeight: '500',
  },


  menuContainer: {
    position: 'absolute',

    bottom: 30,
    left: 0,
    right: 0,

    alignItems: 'center',

    zIndex: 100,
  },

});
