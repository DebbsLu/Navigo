import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BtnClose from '../components/BtnClose';

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

  const handleValueChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
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
      {/* Fondo semitransparente al presionar fuera */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Botón de cierre absoluto posicionado automáticamente arriba a la derecha */}
          <BtnClose absolute top={16} right={16} onPress={onClose} />

          {children ? (
            children
          ) : (
            <>
              {/* Campo 1: Actividad */}
              <Text style={styles.label}>Escribe la actividad que debes realizar</Text>
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor="#7A7799"
                value={actividad}
                onChangeText={setActividad}
              />

              {/* Campo 2: Fecha */}
              <Text style={styles.label}>Define la fecha que finaliza(*Si aplica):</Text>
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
                  {fechaFormateada || ''}
                </Text>
              </TouchableOpacity>

              {/* DateTimePicker para Android */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onValueChange={handleValueChange}
                  onDismiss={() => setShowDatePicker(false)}
                  minimumDate={new Date()}
                />
              )}

              {/* Botón de Enviar */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <Text style={styles.submitText}>+ añadir actividad</Text>
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
    backgroundColor: '#13111C',
    borderRadius: 16,
    padding: 24,
    paddingTop: 36, // Espacio superior extra para no encimar el texto con el BtnClose absoluto
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#181622',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    height: 48,
  },
  submitButton: {
    backgroundColor: '#853ACF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
