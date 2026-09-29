import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TexturedScreen from '../components/TexturedScreen';

const Blocks: React.FC = () => {
  return (
    <TexturedScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Pantalla de Bloqueo</Text>
      </View>
    </TexturedScreen>
  );
};

export default Blocks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});