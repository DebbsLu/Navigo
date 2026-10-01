import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Task_home from './src/screens/Task_home';
import Infinity_canvas from './src/screens/Infinity_canvas';
import Blocks from './src/screens/Blocks';
import Reminders from './src/screens/Reminders';

export type RootStackParamList = {
  TaskHome: undefined;
  InfinityCanvas: { taskId: string; title: string };
Blocks: {
    missionId: string;
  };

  Reminders:
    | undefined
    | {
        taskId: string;
        title: string;
      };

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TaskHome"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="TaskHome" component={Task_home} />
          <Stack.Screen name="InfinityCanvas" component={Infinity_canvas} />
          <Stack.Screen name="Blocks" component={Blocks} />
          <Stack.Screen name="Reminders" component={Reminders} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
