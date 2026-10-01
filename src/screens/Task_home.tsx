
// ------------------------------------
// IMPORTACIONES
// ------------------------------------

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useNavigation,
} from '@react-navigation/native';

// ------------------------------------
// COMPONENTES REUTILIZABLES
// ------------------------------------

import TexturedScreen from '../components/TexturedScreen';
import { ViewInfoProxima } from '../components/ViewInfoProxima';
import BtnCircleBig from '../components/BtnCircleBig';
import ViewEncabezado from '../components/ViewEncabezado';
import ViewLista from '../components/ViewLista';
import ViewBtnsMenu from '../components/ViewBtnsMenu';
import CustomModal from '../components/CustomModal';

// ------------------------------------
// CONFIGURACIÓN DE STORAGE
// ------------------------------------

/**
 * Clave utilizada para almacenar la lista de tareas
 * en AsyncStorage.
 */
const STORAGE_KEY = '@tasks_list_key';

// ------------------------------------
// TIPOS
// ------------------------------------

/**
 Representa una tarea dentro de la aplicación.
 
 La fecha es opcional porque una tarea puede crearse
 sin una fecha definida.
 */
export interface Task {
  id: string;
  title: string;
  date?: string;
}

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

const Task_home: React.FC = () => {

  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  const navigation =
    useNavigation<any>();

  // =====================================================
  // ESTADO DEL MODAL
  // =====================================================

  /**
   * Controla si el modal de crear/editar tarea
   * está visible.
   */
  const [
    isModalVisible,
    setIsModalVisible,
  ] = useState<boolean>(false);

  /**
   * Guarda la tarea que se está editando.
   *
   * Si es null, significa que el usuario está creando
   * una tarea nueva.
   */
  const [
    editingTask,
    setEditingTask,
  ] = useState<Task | null>(null);

  // =====================================================
  // LISTA DE TAREAS
  // =====================================================

  /**
   * Lista principal de tareas.
   */
  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([]);

  // =====================================================
  // CONTROL DE CARGA INICIAL
  // =====================================================

  /**
   * Permite evitar que el primer render provoque
   * inmediatamente un guardado de las tareas.
   *
   * Primero se cargan los datos existentes y después
   * se habilita el guardado automático.
   */
  const isInitialRender =
    useRef(true);

  // =====================================================
  // EFECTOS
  // =====================================================

  /**
   * Carga las tareas almacenadas cuando se monta
   * la pantalla por primera vez.
   */
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Guarda automáticamente las tareas cada vez
   * que la lista cambia.
   *
   * El primer render se ignora porque en ese momento
   * todavía se están cargando los datos almacenados.
   */
  useEffect(() => {

    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    saveTasks(tasks);

  }, [tasks]);

  // =====================================================
  // CARGAR TAREAS
  // =====================================================

  /**
   * Recupera las tareas guardadas en AsyncStorage.
   */
  const loadTasks = async () => {

    try {

      const jsonValue =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (jsonValue != null) {

        const loadedTasks: Task[] =
          JSON.parse(jsonValue);

        // Las tareas se cargan ordenadas por fecha.
        setTasks(
          sortTasksByDate(
            loadedTasks
          )
        );
      }

    } catch (e) {

      console.error(
        'Error al cargar las tareas:',
        e
      );
    }
  };

  // =====================================================
  // GUARDAR TAREAS
  // =====================================================

  /**
   * Guarda la lista actual de tareas en AsyncStorage.
   */
  const saveTasks = async (
    tasksToSave: Task[]
  ) => {

    try {

      const jsonValue =
        JSON.stringify(
          tasksToSave
        );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        jsonValue
      );

    } catch (e) {

      console.error(
        'Error al guardar las tareas:',
        e
      );
    }
  };

  // =====================================================
  // PROCESAMIENTO DE FECHAS
  // =====================================================

  /**
   * Convierte una fecha almacenada como texto
   * en un objeto Date.
   *
   * Admite:
   * - DD/MM/YYYY
   * - DD-MM-YYYY
   * - YYYY/MM/DD
   * - YYYY-MM-DD
   * - Otros formatos que Date.parse pueda interpretar.
   *
   * Si la fecha no existe o no puede interpretarse,
   * devuelve null.
   */
  const parseTaskDate = (
    dateStr?: string
  ): Date | null => {

    // No existe fecha.
    if (!dateStr) {
      return null;
    }

    // Detectar si utiliza "/" o "-".
    const parts =
      dateStr.includes('/')
        ? dateStr.split('/')
        : dateStr.split('-');

    // Intentar interpretar fechas con tres partes.
    if (parts.length === 3) {

      // Formato YYYY-MM-DD / YYYY/MM/DD.
      if (parts[0].length === 4) {

        return new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );

      }

      // Formato DD-MM-YYYY / DD/MM/YYYY.
      return new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    }

    // Intentar interpretar otros formatos de fecha.
    const timestamp =
      Date.parse(dateStr);

    return isNaN(timestamp)
      ? null
      : new Date(timestamp);
  };

  // =====================================================
  // ORDENAR TAREAS
  // =====================================================

  /**
   * Ordena las tareas desde la fecha más próxima
   * hasta la más lejana.
   *
   * Las tareas sin fecha se colocan al final.
   */
  const sortTasksByDate = (
    taskList: Task[]
  ): Task[] => {

    return [...taskList].sort(
      (a, b) => {

        const dateA =
          parseTaskDate(a.date);

        const dateB =
          parseTaskDate(b.date);

        // Ninguna tarea tiene fecha.
        if (!dateA && !dateB) {
          return 0;
        }

        // La tarea A no tiene fecha:
        // se coloca después de B.
        if (!dateA) {
          return 1;
        }

        // La tarea B no tiene fecha:
        // se coloca después de A.
        if (!dateB) {
          return -1;
        }

        // Comparar fechas.
        return (
          dateA.getTime() -
          dateB.getTime()
        );
      }
    );
  };

  // =====================================================
  // MODAL: CREAR TAREA
  // =====================================================

  /**
   * Abre el modal preparado para crear una nueva tarea.
   */
  const handleOpenCreateModal = () => {

    // Al crear no existe una tarea seleccionada.
    setEditingTask(null);

    setIsModalVisible(true);
  };

  // =====================================================
  // MODAL: EDITAR TAREA
  // =====================================================

  /**
   * Abre el modal con los datos de la tarea
   * seleccionada para editarla.
   */
  const handleOpenEditModal = (
    task: Task
  ) => {

    setEditingTask(task);

    setIsModalVisible(true);
  };

  // =====================================================
  // CERRAR MODAL
  // =====================================================

  /**
   * Cierra el modal y limpia la tarea que estaba
   * seleccionada para edición.
   */
  const handleCloseModal = () => {

    setIsModalVisible(false);

    setEditingTask(null);
  };

  // =====================================================
  // CREAR / EDITAR TAREA
  // =====================================================

  /**
   * Guarda los datos recibidos desde CustomModal.
   *
   * Si editingTask existe, se actualiza una tarea.
   * Si no existe, se crea una nueva.
   */
  const handleSaveTask = (
    data: {
      actividad: string;
      fecha: string;
    }
  ) => {

    // No permitir tareas sin nombre.
    if (!data.actividad.trim()) {
      return;
    }

    // ---------------------------------------------------
    // EDITAR TAREA EXISTENTE
    // ---------------------------------------------------

    if (editingTask) {

      const updatedTasks =
        tasks.map(t =>
          t.id === editingTask.id
            ? {
                ...t,

                title:
                  data.actividad.trim(),

                date:
                  data.fecha
                    ? data.fecha.trim()
                    : undefined,
              }
            : t
        );

      setTasks(
        sortTasksByDate(
          updatedTasks
        )
      );

    } else {

      // -------------------------------------------------
      // CREAR NUEVA TAREA
      // -------------------------------------------------

      const newTask: Task = {
        id:
          Date.now().toString(),

        title:
          data.actividad.trim(),

        date:
          data.fecha
            ? data.fecha.trim()
            : undefined,
      };

      setTasks(
        sortTasksByDate([
          newTask,
          ...tasks,
        ])
      );
    }

    // Cerrar el modal después de guardar.
    handleCloseModal();
  };

  // =====================================================
  // ELIMINAR TAREA
  // =====================================================

  /**
   * Solicita confirmación antes de eliminar
   * la tarea actualmente seleccionada.
   */
  const handleDeleteTask = () => {

    // No hay tarea seleccionada.
    if (!editingTask) {
      return;
    }

    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que deseas eliminar esta tarea?',
      [
        // -----------------------------------------------
        // CANCELAR
        // -----------------------------------------------

        {
          text: 'Cancelar',
          style: 'cancel',
        },

        // -----------------------------------------------
        // ELIMINAR
        // -----------------------------------------------

        {
          text: 'Eliminar',
          style: 'destructive',

          onPress: () => {

            const filteredTasks =
              tasks.filter(
                t =>
                  t.id !==
                  editingTask.id
              );

            setTasks(
              filteredTasks
            );

            handleCloseModal();
          },
        },
      ]
    );
  };

  // =====================================================
  // NAVEGAR AL CANVAS
  // =====================================================

  /**
   * Abre el canvas correspondiente a una tarea.
   */
  const handleNavigateToCanvas = (
    task: Task
  ) => {

    navigation.navigate(
      'InfinityCanvas',
      {
        taskId: task.id,
        title: task.title,
      }
    );
  };

  // =====================================================
  // MENÚ INFERIOR
  // =====================================================

  /**
   * Gestiona la navegación entre las opciones
   * del menú inferior.
   *
   * Índices:
   * 0 → Home
   * 1 → Recordatorios
   * 2 → Bloqueos
   */
  const handleSelectTab = (
    index: number
  ) => {

    if (index === 0) {

      // El usuario ya se encuentra en Home.

    } else if (index === 1) {

      navigation.navigate(
        'Reminders'
      );

    } else if (index === 2) {

      navigation.navigate(
        'Blocks'
      );
    }
  };

  // =====================================================
  // PRÓXIMA TAREA
  // =====================================================

  /**
   * Selecciona la primera tarea que tenga una fecha.
   *
   * Si ninguna tiene fecha, utiliza la primera tarea
   * disponible de la lista.
   */
  const upcomingTask =
    tasks.find(
      t =>
        parseTaskDate(t.date) !== null
    ) || tasks[0];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <TexturedScreen
      style={styles.container}
    >

      {/* =================================================
          ACTIVIDAD MÁS PRÓXIMA
      ================================================= */}

      <View
        style={
          styles.topCardContainer
        }
      >

        {upcomingTask ? (

          <ViewInfoProxima

            title={
              upcomingTask.title
            }

            tagText={
              upcomingTask.date ||
              'Sin fecha'
            }

            onPressBtn={() =>
              handleNavigateToCanvas(
                upcomingTask
              )
            }

          />

        ) : (

          <ViewInfoProxima

            title="Sin tareas pendientes"

            subtitle="¡Estás al día!"

            tagText="---"

          />

        )}

      </View>

      {/* =================================================
          BOTÓN PRINCIPAL
      ================================================= */}

      <View
        style={
          styles.buttonContainer
        }
      >

        <BtnCircleBig
          onPress={
            handleOpenCreateModal
          }
        />

      </View>

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <ViewEncabezado
        title="Lista de tareas"
      />

      {/* =================================================
          LISTA DE TAREAS
      ================================================= */}

      <View
        style={
          styles.listContainer
        }
      >

        {tasks.length === 0 ? (

          // ------------------------------------------------
          // ESTADO VACÍO
          // ------------------------------------------------

          <View
            style={
              styles.emptyContainer
            }
          >

            <Text
              style={
                styles.emptyText
              }
            >
              No hay tareas agregadas
            </Text>

          </View>

        ) : (

          // ------------------------------------------------
          // LISTA
          // ------------------------------------------------

          <FlatList

            data={tasks}

            keyExtractor={
              item => item.id
            }

            renderItem={({
              item,
              index,
            }) => (

              <ViewLista

                title1={
                  item.title
                }

                title2={
                  item.date || ''
                }

                isFirst={
                  index === 0
                }

                // Pulsar la tarea abre
                // el modal de edición.
                onPressItem={() =>
                  handleOpenEditModal(
                    item
                  )
                }

                // Pulsar el botón abre
                // el canvas de la tarea.
                onPressButton={() =>
                  handleNavigateToCanvas(
                    item
                  )
                }

              />

            )}

            contentContainerStyle={
              styles.flatListContent
            }

            showsVerticalScrollIndicator={
              false
            }

          />

        )}

      </View>

      {/* =================================================
          MENÚ INFERIOR
      ================================================= */}

      <View
        style={
          styles.menuContainer
        }
      >

        <ViewBtnsMenu

          initialSelectIndex={0}

          onSelectTab={
            handleSelectTab
          }

        />

      </View>

      {/* =================================================
          MODAL DE TAREAS
      ================================================= */}

      <CustomModal

        visible={
          isModalVisible
        }

        onClose={
          handleCloseModal
        }

        onSubmit={
          handleSaveTask
        }

        onDelete={
          handleDeleteTask
        }

        initialData={
          editingTask
            ? {
                actividad:
                  editingTask.title,

                fecha:
                  editingTask.date ||
                  '',
              }
            : null
        }

      />

    </TexturedScreen>
  );
};

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({

  // =====================================================
  // CONTENEDOR PRINCIPAL
  // =====================================================

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // =====================================================
  // TARJETA DE PRÓXIMA ACTIVIDAD
  // =====================================================

  topCardContainer: {
    marginTop: 10,
    marginBottom: 10,
  },

  // =====================================================
  // BOTÓN PRINCIPAL
  // =====================================================

  buttonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },

  // =====================================================
  // LISTA
  // =====================================================

  listContainer: {
    flex: 1,
    marginTop: 4,
  },

  // =====================================================
  // ESTADO VACÍO
  // =====================================================

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

  // =====================================================
  // CONTENIDO DE FLATLIST
  // =====================================================

  flatListContent: {
    paddingBottom: 20,
  },

  // =====================================================
  // MENÚ INFERIOR
  // =====================================================

  menuContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});

// ------------------------------------
// EXPORTACIÓN
// ------------------------------------

export default Task_home;
