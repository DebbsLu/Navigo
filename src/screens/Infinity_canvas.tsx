import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useRoute,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';

import TexturedScreen from '../components/TexturedScreen';

import CanvasMenu from '../components/CanvasMenu';

import CanvasGestureLayer from '../components/CanvasGestureLayer';

import ChunkNode, {
  ChunkStatus,
  ConnectionSide,
} from '../components/ChunkNode';


// =======================================================
// NAVEGACIÓN
// =======================================================

type RootStackParamList = {
  InfinityCanvas: {
    taskId: string;
    title: string;
  };
};

type InfinityCanvasRouteProp =
  RouteProp<
    RootStackParamList,
    'InfinityCanvas'
  >;


// =======================================================
// STORAGE
// =======================================================

const GET_CANVAS_KEY = (
  taskId: string
) =>
  `@canvas_chunks_${taskId}`;


// =======================================================
// DATOS DE CHUNK
// =======================================================

interface ChunkData {
  id: string;

  title: string;

  description: string;

  status: ChunkStatus;

  // Permite saber quién es el padre
  // de un subpaso.
  parentId?: string;

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


// =======================================================
// CONFIGURACIÓN DEL CANVAS
// =======================================================

const INITIAL_ZOOM = 1;

const MIN_ZOOM = 0.35;

const MAX_ZOOM = 3;

const WORLD_SIZE = 5000;

const WORLD_CENTER =
  WORLD_SIZE / 2;


// =======================================================
// COMPONENTE
// =======================================================

const InfinityCanvas: React.FC =
  () => {

    // ===================================================
    // ROUTE
    // ===================================================

    const route =
      useRoute<InfinityCanvasRouteProp>();

    const {
      taskId,
      title,
    } = route.params;

    // Navegación hacia otras pantallas
    const navigation = useNavigation<any>();

    // Abre Blocks mandando la misión actual (taskId) para que
    // "Selecciona la misión" venga preseleccionada
    const handleOpenBlocks = () => {
      navigation.navigate('Blocks', { missionId: taskId });
    };


    // ===================================================
    // ESTADO DE CHUNKS
    // ===================================================

    const [chunks, setChunks] =
      useState<ChunkData[]>([]);

    const [
      isLoaded,
      setIsLoaded,
    ] = useState(false);

    const [
      selectedChunkId,
      setSelectedChunkId,
    ] = useState<string | null>(
      null
    );


    // ===================================================
    // PAN
    // ===================================================

    const pan = useRef(
      new Animated.ValueXY({
        x: 0,
        y: 0,
      })
    ).current;


    // ===================================================
    // ZOOM
    // ===================================================

    const zoom = useRef(
      new Animated.Value(
        INITIAL_ZOOM
      )
    ).current;


    // ===================================================
    // CARGAR CANVAS
    // ===================================================

    useEffect(() => {
      loadCanvasChunks();
    }, [taskId]);


    // ===================================================
    // GUARDAR CANVAS
    // ===================================================

    useEffect(() => {
      if (isLoaded) {
        saveCanvasChunks(chunks);
      }
    }, [
      chunks,
      isLoaded,
    ]);


    // ===================================================
    // LOAD
    // ===================================================

    const loadCanvasChunks =
      async () => {
        try {
          const jsonValue =
            await AsyncStorage.getItem(
              GET_CANVAS_KEY(taskId)
            );

          if (
            jsonValue !== null
          ) {
            const savedChunks =
              JSON.parse(
                jsonValue
              );

            setChunks(
              savedChunks
            );
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


    // ===================================================
    // SAVE
    // ===================================================

    const saveCanvasChunks =
      async (
        chunksToSave: ChunkData[]
      ) => {
        try {
          const jsonValue =
            JSON.stringify(
              chunksToSave
            );

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


    // ===================================================
    // CREAR CHUNK NORMAL
    // ===================================================

    const handleAddChunk =
      () => {

        const index =
          chunks.length;

        const newChunk: ChunkData =
          {
            id:
              Date.now().toString(),

            title:
              `Paso ${
                index + 1
              }: Subactividad`,

            description:
              'Escribe aquí los detalles del paso...',

            status:
              'no_iniciado',

            position: {
              x:
                WORLD_CENTER -
                140 +
                (index % 3) *
                  340,

              y:
                WORLD_CENTER -
                120 +
                Math.floor(
                  index / 3
                ) *
                  300,
            },

            connections: {},
          };

        setChunks(
          prev => [
            ...prev,
            newChunk,
          ]
        );

        setSelectedChunkId(
          newChunk.id
        );
      };


    // ===================================================
    // CREAR SUBPASO
    // ===================================================

    const handleAddSubStep =
      (
        parentId: string
      ) => {

        const parent =
          chunks.find(
            chunk =>
              chunk.id ===
              parentId
          );

        if (!parent) {
          return;
        }

        const newChunk: ChunkData =
          {
            id:
              Date.now().toString(),

            title:
              `Paso ${
                chunks.length + 1
              }: Subactividad`,

            description:
              'Escribe aquí los detalles del subpaso...',

            status:
              'no_iniciado',

            parentId:

              parentId,

            position: {
              x:
                parent.position.x +
                340,

              y:
                parent.position.y,
            },

            connections: {},
          };

        setChunks(
          prev => [
            ...prev,
            newChunk,
          ]
        );

        setSelectedChunkId(
          newChunk.id
        );
      };


    // ===================================================
    // CAMBIAR TÍTULO
    // ===================================================

    const handleChangeChunkTitle =
      (
        id: string,
        newTitle: string
      ) => {

        setChunks(
          prev =>
            prev.map(
              chunk =>
                chunk.id === id
                  ? {
                      ...chunk,
                      title:
                        newTitle,
                    }
                  : chunk
            )
        );
      };


    // ===================================================
    // CAMBIAR DESCRIPCIÓN
    // ===================================================

    const handleChangeChunkDescription =
      (
        id: string,
        newDescription: string
      ) => {

        setChunks(
          prev =>
            prev.map(
              chunk =>
                chunk.id === id
                  ? {
                      ...chunk,
                      description:
                        newDescription,
                    }
                  : chunk
            )
        );
      };


    // ===================================================
    // CAMBIAR ESTADO
    // ===================================================

    const handleChangeChunkStatus =
      (
        id: string,
        newStatus: ChunkStatus
      ) => {

        setChunks(
          prev =>
            prev.map(
              chunk =>
                chunk.id === id
                  ? {
                      ...chunk,
                      status:
                        newStatus,
                    }
                  : chunk
            )
        );
      };


    // ===================================================
    // MOVER CHUNK
    // ===================================================
    //
    // startX/startY:
    // posición del chunk cuando comenzó
    // el gesto.
    //
    // dx/dy:
    // desplazamiento del dedo desde
    // el inicio del gesto.
    //
    // Esto evita acumular dx/dy varias
    // veces durante el mismo gesto.
    // ===================================================

    const handleMoveChunk =
      (
        id: string,
        startX: number,
        startY: number,
        dx: number,
        dy: number
      ) => {

        const currentZoom =
          (zoom as any)
            .__getValue();

        const worldDx =
          dx / currentZoom;

        const worldDy =
          dy / currentZoom;

        setChunks(
          prev =>
            prev.map(
              chunk =>
                chunk.id === id
                  ? {
                      ...chunk,

                      position: {
                        x:
                          startX +
                          worldDx,

                        y:
                          startY +
                          worldDy,
                      },
                    }
                  : chunk
            )
        );
      };


    // ===================================================
    // ELIMINAR CHUNK
    // ===================================================

    const handleRemoveChunk =
      (
        id: string
      ) => {

        setChunks(
          prev =>
            prev.filter(
              chunk =>
                chunk.id !== id
            )
        );

        if (
          selectedChunkId === id
        ) {
          setSelectedChunkId(
            null
          );
        }
      };


    // ===================================================
    // SELECCIONAR
    // ===================================================

    const handleSelectChunk =
      (
        id: string
      ) => {
        setSelectedChunkId(id);
      };


    // ===================================================
    // DESELECCIONAR
    // ===================================================

    const handleDeselectChunk =
      () => {
        setSelectedChunkId(
          null
        );
      };


    // ===================================================
    // CONEXIONES
    // ===================================================

    const handleToggleConnection =
      (
        id: string,
        side: ConnectionSide
      ) => {

        setChunks(
          prev =>
            prev.map(
              chunk => {

                if (
                  chunk.id !== id
                ) {
                  return chunk;
                }

                return {
                  ...chunk,

                  connections: {
                    ...chunk.connections,

                    [side]:
                      !chunk
                        .connections[
                        side
                      ],
                  },
                };
              }
            )
        );
      };


    // ===================================================
    // RENDER
    // ===================================================

    return (
      <TexturedScreen>

        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <View
          style={styles.container}
        >

          <View
            style={styles.header}
          >
            <Text
              style={
                styles.taskTitleText
              }
            >
              {title}
            </Text>
          </View>


          {/* =========================================== */}
          {/* CANVAS */}
          {/* =========================================== */}

          <View
            style={styles.viewport}
          >

            {/* ========================================= */}
            {/* GESTOS DEL CANVAS */}
            {/* ========================================= */}

            <CanvasGestureLayer
              pan={pan}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              worldLeft={-2500}
              worldTop={-2500}
              onCanvasPress={
                handleDeselectChunk
              }
            />


            {/* ========================================= */}
            {/* MUNDO */}
            {/* ========================================= */}

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
                      translateX:
                        pan.x,
                    },

                    {
                      translateY:
                        pan.y,
                    },
                  ],
                },
              ]}
            >

              {/* ======================================= */}
              {/* SIN CHUNKS */}
              {/* ======================================= */}

              {chunks.length ===
              0 ? (

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
                    Aún no hay pasos
                    creados en este
                    lienzo
                  </Text>
                </View>

              ) : (

                /* ===================================== */
                /* CHUNKS */
                /* ===================================== */

                chunks.map(
                  item => (

                    <View
                      key={item.id}
                      style={[
                        styles.chunkItemWrapper,

                        {
                          left:
                            item
                              .position
                              .x,

                          top:
                            item
                              .position
                              .y,
                        },
                      ]}
                    >

                      <ChunkNode

                        title={
                          item.title
                        }

                        description={
                          item.description
                        }

                        position={
                          item.position
                        }

                        status={
                          item.status
                        }

                        selected={
                          selectedChunkId ===
                          item.id
                        }

                        onSelect={() =>
                          handleSelectChunk(
                            item.id
                          )
                        }

                        onMove={(
                          startX,
                          startY,
                          dx,
                          dy
                        ) =>
                          handleMoveChunk(
                            item.id,
                            startX,
                            startY,
                            dx,
                            dy
                          )
                        }

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
                          handleAddSubStep(
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
                  )
                )
              )}

            </Animated.View>

          </View>


          {/* =========================================== */}
          {/* MENÚ */}
          {/* =========================================== */}

          <View
            style={
              styles.menuContainer
            }
          >
            <CanvasMenu
              onAddChunk={
                handleAddChunk
              }

              onPressBloqueo={handleOpenBlocks} // bloqueo
            />
          </View>

        </View>

      </TexturedScreen>
    );
  };


// =======================================================
// ESTILOS
// =======================================================

const styles =
  StyleSheet.create({

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

    viewport: {
      flex: 1,
      overflow: 'hidden',
    },

    world: {
      position: 'absolute',
      width: WORLD_SIZE,
      height: WORLD_SIZE,
      left: -2500,
      top: -2500,
    },

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

export default InfinityCanvas;