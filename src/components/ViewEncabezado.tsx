import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewEncabezado = ({ 
  title = "Lista de tareas", 
  textColor = "#C694EB", 
  lineColor = "#853ACF" 
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  title: {
    fontSize: 28,          // Tamaño grande para destacar sobre otros títulos
    fontWeight: 'bold',    // Negrita
    marginRight: 10,       // Espaciado entre el texto y la línea
  },
  line: {
    flex: 1,               // Ocupa todo el espacio restante disponible
    height: 2,             // Grosor de la línea horizontal
    borderRadius: 1,
  },
});

export default ViewEncabezado;