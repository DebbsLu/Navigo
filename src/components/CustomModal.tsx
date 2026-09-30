import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BtnClose from './BtnClose';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { actividad: string; fecha: string }) => void;
  onDelete?: () => void; // Prop para manejar la eliminación
  initialData?: { actividad: string; fecha: string } | null;
  children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  children,
}) => {
  const [actividad, setActividad] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaFormateada, setFechaFormateada] = useState('');

  // Cargar datos cuando se abre para editar o limpiar cuando es nueva
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setActividad(initialData.actividad || '');
        setFechaFormateada(initialData.fecha || '');
      } else {
        setActividad('');
        setFechaFormateada('');
        setSelectedDate(new Date());
      }
    }
  }, [visible, initialData]);

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
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <BtnClose absolute onPress={onClose} right={16} top={16} />
          {children ? (
            children
          ) : (
            <>
              <Text style={styles.label}>Escribe la actividad que debes realizar</Text>
              <TextInput
                onChangeText={setActividad}
                placeholder="Nombre de la actividad"
                placeholderTextColor="#7A7799"
                style={styles.input}
                value={actividad}
              />

              <Text style={styles.label}>Define la fecha que finaliza (*Si aplica):</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text style={{ color: fechaFormateada ? '#FFFFFF' : '#7A7799', fontSize: 14 }}>
                  {fechaFormateada || 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  display="default"
                  mode="date"
                  value={selectedDate}
                  onChange={handleValueChange}
                  minimumDate={new Date()}
                />
              )}

              {/* Contenedor de botones de acción */}
              <View style={styles.buttonsRow}>
                <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} style={styles.submitButton}>
                  <Text style={styles.submitText}>
                    {initialData ? 'Guardar cambios' : '+ añadir actividad'}
                  </Text>
                </TouchableOpacity>

                {/* Botón Eliminar solo visible si estamos editando */}
                {initialData && onDelete && (
                  <TouchableOpacity activeOpacity={0.8} onPress={onDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
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
    paddingTop: 36,
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
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#853ACF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
<<<<<<< HEAD
});
=======
  deleteButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  deleteText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
>>>>>>> 19fe629dd8b5a3ee713ec721f3c9a9b42f80b377
