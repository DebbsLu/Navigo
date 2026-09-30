import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Importación de componentes reutilizables
import TexturedScreen from '../components/TexturedScreen';
import {ViewInfoProxima} from '../components/ViewInfoProxima';
import BtnCircleBig from '../components/BtnCircleBig';
import ViewEncabezado from '../components/ViewEncabezado';
import ViewLista from '../components/ViewLista';
import ViewBtnsMenu from '../components/ViewBtnsMenu';
import CustomModal from '../components/CustomModal';

// Clave para guardar en AsyncStorage
const STORAGE_KEY = '@tasks_list_key';

export interface Task {
  id: string;
  title: string;
  date?: string;
}

const Task_home: React.FC = () => {
  const navigation = useNavigation<any>();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const isInitialRender = useRef(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    saveTasks(tasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedTasks: Task[] = JSON.parse(jsonValue);
        setTasks(sortTasksByDate(loadedTasks));
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

  const parseTaskDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? null : new Date(timestamp);
  };

  const sortTasksByDate = (taskList: Task[]): Task[] => {
    return [...taskList].sort((a, b) => {
      const dateA = parseTaskDate(a.date);
      const dateB = parseTaskDate(b.date);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateA.getTime() - dateB.getTime();
    });
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const handleSaveTask = (data: { actividad: string; fecha: string }) => {
    if (!data.actividad.trim()) return;

    if (editingTask) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: data.actividad.trim(), date: data.fecha ? data.fecha.trim() : undefined }
          : t
      );
      setTasks(sortTasksByDate(updatedTasks));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: data.actividad.trim(),
        date: data.fecha ? data.fecha.trim() : undefined,
      };
      setTasks(sortTasksByDate([newTask, ...tasks]));
    }
    handleCloseModal();
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;

    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que deseas eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const filteredTasks = tasks.filter((t) => t.id !== editingTask.id);
            setTasks(filteredTasks);
            handleCloseModal();
          },
        },
      ]
    );
  };

  const handleNavigateToCanvas = (task: Task) => {
    navigation.navigate('InfinityCanvas', { taskId: task.id, title: task.title });
  };

  const handleSelectTab = (index: number) => {
    if (index === 0) {
      // Home
    } else if (index === 1) {
      navigation.navigate('Reminders');
    } else if (index === 2) {
      navigation.navigate('Blocks');
    }
  };

  const upcomingTask = tasks.find((t) => parseTaskDate(t.date) !== null) || tasks[0];

  return (
    <TexturedScreen style={styles.container}>
      {/* Actividad más próxima */}
      <View style={styles.topCardContainer}>
        {upcomingTask ? (
          <ViewInfoProxima
            title={upcomingTask.title}
            tagText={upcomingTask.date || 'Sin fecha'}
            onPressBtn={() => handleNavigateToCanvas(upcomingTask)}
          />
        ) : (
          <ViewInfoProxima
            title="Sin tareas pendientes"
            subtitle="¡Estás al día!"
            tagText="---"
          />
        )}
      </View>

      {/* Botón circular principal */}
      <View style={styles.buttonContainer}>
        <BtnCircleBig onPress={handleOpenCreateModal} />
      </View>

      {/* Encabezado */}
      <ViewEncabezado title="Lista de tareas" />

      {/* Lista de Tareas */}
      <View style={styles.listContainer}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay tareas agregadas</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ViewLista
                title1={item.title}
                title2={item.date || ''}
                isFirst={index === 0}
                onPressItem={() => handleOpenEditModal(item)}
                onPressButton={() => handleNavigateToCanvas(item)}
              />
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Menú inferior */}
      <View style={styles.menuContainer}>
        <ViewBtnsMenu initialSelectIndex={0} onSelectTab={handleSelectTab} />
      </View>

      {/* Modal para Crear / Editar / Eliminar */}
      <CustomModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={
          editingTask
            ? { actividad: editingTask.title, fecha: editingTask.date || '' }
            : null
        }
      />
    </TexturedScreen>
  );
};

export default Task_home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topCardContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  listContainer: {
    flex: 1,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#A192B4',
    fontSize: 16,
    fontWeight: '500',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  menuContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});