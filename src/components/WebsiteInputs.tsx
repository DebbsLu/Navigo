// components/WebsiteInputs.tsx
// -----------------------------------------------------------------------------
// Lista de campos para escribir páginas web a bloquear.
//   - El último campo tiene un "+" que agrega un campo nuevo (hasta `max`).
//   - Los demás tienen un "−" que elimina su campo.
//   - Si lo escrito no parece un dominio (ej. "hola") el borde se pone rojo
//     después de salir del campo.
// Componente "controlado": el arreglo de textos vive en la pantalla padre.
// -----------------------------------------------------------------------------

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MAX_WEBSITES, normalizeWebsite } from '../services/blockUtils';

interface WebsiteInputsProps {
  /** Un texto por campo. Siempre debe haber al menos uno (puede estar vacío). */
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
  /** Si es true, marca en rojo TODOS los campos inválidos (se usa al intentar guardar). */
  showAllErrors?: boolean;
}

const WebsiteInputs: React.FC<WebsiteInputsProps> = ({ values, onChange, max = MAX_WEBSITES, showAllErrors = false }) => {
  // Índices de campos que el usuario ya tocó y abandonó (para no marcar error mientras escribe).
  const [touched, setTouched] = useState<Set<number>>(new Set());

  /** Cambia el texto de un campo. */
  const updateAt = (index: number, text: string) => {
    onChange(values.map((v, i) => (i === index ? text : v)));
  };

  /** Agrega un campo vacío al final (si no se llegó al máximo). */
  const addField = () => {
    if (values.length >= max) return;
    onChange([...values, '']);
  };

  /** Elimina un campo. Siempre deja al menos uno. */
  const removeAt = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : ['']);
    setTouched(new Set()); // los índices cambiaron, reiniciamos
  };

  return (
    <View style={styles.wrap}>
      {values.map((value, index) => {
        const isLast = index === values.length - 1;
        const invalid = (touched.has(index) || showAllErrors) && value.trim() !== '' && normalizeWebsite(value) === null;

        return (
          <View key={index}>
            <View style={styles.row}>
              <TextInput
                value={value}
                onChangeText={(t) => updateAt(index, t)}
                onBlur={() => setTouched((prev) => new Set(prev).add(index))}
                placeholder="ejemplo.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                selectionColor="#C694EB"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, invalid && styles.inputInvalid]}
              />

              {isLast ? (
                // "+" solo en el último campo; se desactiva al llegar al máximo.
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={addField}
                  disabled={values.length >= max}
                  style={[styles.iconBtn, values.length >= max && { opacity: 0.35 }]}
                >
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.7} onPress={() => removeAt(index)} style={styles.iconBtn}>
                  <Ionicons name="remove" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {invalid && <Text style={styles.error}>Escribe un dominio válido, ej. instagram.com</Text>}
          </View>
        );
      })}
    </View>
  );
};

export default WebsiteInputs;

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#181622',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputInvalid: { borderColor: '#FF6B81' },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(133,58,207,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(198,148,235,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: '#FF6B81', fontSize: 11, marginTop: 4 },
});
