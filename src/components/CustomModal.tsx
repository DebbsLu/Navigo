import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { actividad: string; fecha: string }) => void;
  children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onSubmit,
  children,
}) => {
  const [actividad, setActividad] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaFormateada, setFechaFormateada] = useState('');

  if (!visible) return null;

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // En iOS se mantiene abierto, en Android se cierra solo
    if (date) {
      setSelectedDate(date);
      // Formato legible: DD/MM/YYYY
      const formatted = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      setFechaFormateada(formatted);
    }
  };

  const handleSubmit = () => {
    onSubmit({ actividad, fecha: fechaFormateada });
    setActividad('');
    setFechaFormateada('');
    setSelectedDate(new Date());
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fondo semitransparente */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Contenido del modal */}
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {children ? (
            children
          ) : (
            <>
              <Text style={styles.title}>Nueva Tarea</Text>

              {/* Input de Actividad */}
              <TextInput
                style={styles.input}
                placeholder="Nombre de la actividad"
                placeholderTextColor="#7A7799"
                value={actividad}
                onChangeText={setActividad}
              />

              {/* Campo para la Fecha (Estilizado como input, pero abre el Picker) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text
                  style={{
                    color: fechaFormateada ? '#FFFFFF' : '#7A7799',
                    fontSize: 14,
                  }}
                >
                  {fechaFormateada || 'Seleccionar fecha (opcional)'}
                </Text>
              </TouchableOpacity>

              {/* Picker Nativo */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()} // Evita fechas pasadas
                />
              )}

              {/* Botón de Enviar */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <Text style={styles.submitText}>Crear Tarea</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalView: {
    width: '100%',
    backgroundColor: '#181622',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#13111C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#853ACF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});