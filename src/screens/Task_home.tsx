import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Importación de componentes reutilizables
import TexturedScreen from '../components/TexturedScreen';
import BtnCircleBig from '../components/BtnCircleBig';
import CustomModal from '../components/CustomModal';
import ViewLista from '../components/ViewLista';

// Clave para guardar en AsyncStorage
const STORAGE_KEY = '@tasks_list_key';

// Interfaz para la estructura de la tarea
export interface Task {
  id: string;
  title: string;
  date?: string;
}

const Task_home: React.FC = () => {
  // Hook de navegación de React Navigation
  const navigation = useNavigation<any>();

  // Estado para controlar la visibilidad del Modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Estado para almacenar la lista de tareas
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1. CARGAR TAREAS: Al montar el componente
  useEffect(() => {
    loadTasks();
  }, []);

  // 2. GUARDAR TAREAS: Cada vez que el estado `tasks` cambie
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error al cargar las tareas:', e);
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error al guardar las tareas:', e);
    }
  };

  // Funciones de control del modal
  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  // Función CREATE: Agrega una nueva tarea y cierra el modal
  const handleAddTask = (data: { actividad: string; fecha: string }) => {
    if (!data.actividad.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: data.actividad.trim(),
      date: data.fecha ? data.fecha.trim() : undefined,
    };

    setTasks((prevTasks) => [newTask, ...prevTasks]);
    handleCloseModal();
  };

  // Función NAVEGACIÓN: Redirige a la pantalla Infinity Canvas
  const handleNavigateToCanvas = (task: Task) => {
    // Puedes pasar la tarea o su ID como parámetro a la pantalla de Canvas si lo necesitas
    navigation.navigate('InfinityCanvas', { taskId: task.id, title: task.title });
  };

  return (
    <TexturedScreen style={styles.container}>
      {/* Botón circular principal para abrir el modal */}
      <View style={styles.buttonContainer}>
        <BtnCircleBig
          onPress={() => {
            console.log('BOTÓN PRESIONADO');
            setIsModalVisible(true);
          }}
        />
      </View>

      {/* Sección READ: Muestra la lista o el mensaje cuando está vacía */}
      <View style={styles.listContainer}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay tareas</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ViewLista
                title1={item.title}
                title2={item.date}
                isFirst={index === 0}
                onPressButton={() => handleNavigateToCanvas(item)}
              />
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal para ingresar/crear nueva tarea */}
      { <CustomModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleAddTask}
      /> }
    </TexturedScreen>
  );
};

export default Task_home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: '#A192B4',
    fontSize: 18,
    fontWeight: '500',
  },
  flatListContent: {
    paddingBottom: 30,
    gap: 12,
  },
});