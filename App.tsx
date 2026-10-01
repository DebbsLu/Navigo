
// ------------------------------------
// IMPORTACIONES
// ------------------------------------
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

// ------------------------------------
// PANTALLAS DE LA APLICACIÓN
// ------------------------------------

import Task_home from './src/screens/Task_home';
import Infinity_canvas from './src/screens/Infinity_canvas';
import Blocks from './src/screens/Blocks';
import Reminders from './src/screens/Reminders';

// ------------------------------------
// TIPOS DE NAVEGACIÓN
// ------------------------------------

// Define las rutas disponibles en la aplicación
// y los parámetros que puede recibir cada pantalla.
export type RootStackParamList = {
  // Pantalla principal
  TaskHome: undefined;

  // Pantalla del lienzo de planificación.
  // Recibe el ID y título de la tarea seleccionada.
  InfinityCanvas: {
    taskId: string;
    title: string;
  };

  // Pantalla de bloques.
  // Recibe el ID de la misión correspondiente.
  Blocks: {
    missionId: string;
  };

  // Pantalla de recordatorios.
  // Puede abrirse sin parámetros o con información de una tarea.
  Reminders:
    | undefined
    | {
        taskId: string;
        title: string;
      };
};

// ------------------------------------
// CONFIGURACIÓN DEL NAVEGADOR
// ------------------------------------

// Crea el navegador de tipo Stack utilizando
// los parámetros definidos en RootStackParamList.
const Stack = createNativeStackNavigator<RootStackParamList>();

// ------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------

export default function App() {
  return (
    // GestureHandlerRootView permite utilizar correctamente
    // los gestos proporcionados por react-native-gesture-handler.
    <GestureHandlerRootView style={styles.container}>

      {/* Contenedor principal de navegación */}
      <NavigationContainer>

        {/* Configuración de las pantallas de la aplicación */}
        <Stack.Navigator
          initialRouteName="TaskHome"
          screenOptions={{
            // Se ocultan los encabezados predeterminados
            // para utilizar los diseños personalizados.
            headerShown: false,
          }}
        >

          {/* Pantalla principal de tareas */}
          <Stack.Screen
            name="TaskHome"
            component={Task_home}
          />

          {/* Pantalla del lienzo de planificación */}
          <Stack.Screen
            name="InfinityCanvas"
            component={Infinity_canvas}
          />

          {/* Pantalla de bloques */}
          <Stack.Screen
            name="Blocks"
            component={Blocks}
          />

          {/* Pantalla de recordatorios */}
          <Stack.Screen
            name="Reminders"
            component={Reminders}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// ------------------------------------
// ESTILOS
// ------------------------------------

const styles = StyleSheet.create({
  // Hace que el contenedor ocupe todo el espacio disponible.
  container: {
    flex: 1,
  },
});
