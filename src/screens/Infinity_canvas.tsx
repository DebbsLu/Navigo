import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';

// Importación de componentes
import TexturedScreen from '../components/TexturedScreen';
import CanvasMenu from '../components/CanvasMenu';
import ChunkNode, { ChunkStatus, ConnectionSide } from '../components/ChunkNode';

// Definición del tipo de parámetros recibidos desde React Navigation
type RootStackParamList = {
  InfinityCanvas: { taskId: string; title: string };
};

type InfinityCanvasRouteProp = RouteProp<RootStackParamList, 'InfinityCanvas'>;

// Estrategia de clave dinámica para cada tarea
const GET_CANVAS_KEY = (taskId: string) => `@canvas_chunks_${taskId}`;

interface ChunkData {
  id: string;
  title: string;
  description: string;
  status: ChunkStatus;
  connections: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

const Infinity_canvas: React.FC = () => {
  // 1. Obtener parámetros de la ruta (taskId y title de la tarea)
  const route = useRoute<InfinityCanvasRouteProp>();
  const { taskId, title: taskTitle } = route.params;

  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 2. CARGAR CHUNKS: Se ejecuta al entrar a la pantalla o si cambia el taskId
  useEffect(() => {
    loadCanvasChunks();
  }, [taskId]);

  // 3. GUARDAR CHUNKS: Se ejecuta cada vez que el estado 'chunks' cambia (solo si ya se cargó previamente)
  useEffect(() => {
    if (isLoaded) {
      saveCanvasChunks(chunks);
    }
  }, [chunks, isLoaded]);

  const loadCanvasChunks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(GET_CANVAS_KEY(taskId));
      if (jsonValue != null) {
        setChunks(JSON.parse(jsonValue));
      } else {
        // Si no existen chunks guardados para esta tarea, inicia vacía
        setChunks([]);
      }
    } catch (e) {
      console.error('Error al cargar chunks de la tarea:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCanvasChunks = async (chunksToSave: ChunkData[]) => {
    try {
      const jsonValue = JSON.stringify(chunksToSave);
      await AsyncStorage.setItem(GET_CANVAS_KEY(taskId), jsonValue);
    } catch (e) {
      console.error('Error al guardar chunks de la tarea:', e);
    }
  };

  // Función CREATE: Agrega un nuevo Chunk al lienzo de la tarea actual
  const handleAddChunk = () => {
    const newChunk: ChunkData = {
      id: Date.now().toString(),
      title: `Paso ${chunks.length + 1}: Subactividad`,
      description: 'Escribe aquí los detalles del paso...',
      status: 'no_iniciado',
      connections: {},
    };

    setChunks((prev) => [...prev, newChunk]);
  };

  // Función DELETE: Elimina un Chunk por su ID dentro de este lienzo
  const handleRemoveChunk = (id: string) => {
    setChunks((prev) => prev.filter((chunk) => chunk.id !== id));
  };

  // Manejo alternar conexiones entre nodos
  const handleToggleConnection = (id: string, side: ConnectionSide) => {
    setChunks((prev) =>
      prev.map((chunk) => {
        if (chunk.id === id) {
          return {
            ...chunk,
            connections: {
              ...chunk.connections,
              [side]: !chunk.connections[side],
            },
          };
        }
        return chunk;
      })
    );
  };

  return (
    <TexturedScreen style={styles.container}>
      {/* Encabezado opcional con el título de la tarea actual */}
      <View style={styles.header}>
        <Text style={styles.taskTitleText}>{taskTitle}</Text>
      </View>

      {/* Área del lienzo desplazable */}
      <ScrollView
        contentContainerStyle={styles.canvasContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {chunks.length === 0 ? (
          <View style={styles.emptyCanvasContainer}>
            <Text style={styles.emptyCanvasText}>
              Aún no hay pasos creados en este lienzo
            </Text>
          </View>
        ) : (
          chunks.map((item) => (
            <View key={item.id} style={styles.chunkItemWrapper}>
              <ChunkNode
                title={item.title}
                description={item.description}
                status={item.status}
                connections={item.connections}
                onClose={() => handleRemoveChunk(item.id)}
                onPressSubStep={() => console.log('Añadir subpaso a:', item.id)}
                onConnectPointPress={(side) =>
                  handleToggleConnection(item.id, side)
                }
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Menú inferior flotante */}
      <View style={styles.menuContainer}>
        <CanvasMenu onAddChunk={handleAddChunk} />
      </View>
    </TexturedScreen>
  );
};

export default Infinity_canvas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  taskTitleText: {
    color: '#DED1EB',
    fontSize: 20,
    fontWeight: 'bold',
  },
  canvasContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
    alignItems: 'center',
    gap: 24,
  },
  emptyCanvasContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyCanvasText: {
    color: '#3B3947',
    fontSize: 16,
    fontWeight: '500',
  },
  chunkItemWrapper: {
    marginVertical: 8,
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