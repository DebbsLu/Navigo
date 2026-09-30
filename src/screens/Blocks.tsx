import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TexturedScreen from '../components/TexturedScreen';
import ViewEncabezado from '../components/ViewEncabezado';
import ViewBtnsMenu from '../components/ViewBtnsMenu';
import BtnCircleBig from '../components/BtnCircleBig';
import BtnCircleSmall from '../components/BtnCircleSmall';
import BtnClose from '../components/BtnClose';

/* Paleta */
const C = {
  purple: '#853ACF',
  purpleLight: '#C694EB',
  panel: '#13111C',
  panelBorder: '#1E1D29',
  field: '#181622',
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.65)',
};

/* Datos de ejemplo (solo visual) */
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const MOCK_BLOCKS = [
  { id: '1', date: 'Jue May 30, 09:20 am', name: 'Nombre del bloqueo', type: 'Regular' },
  { id: '2', date: 'Jue May 30, 09:20 am', name: 'Nombre del bloqueo', type: 'Uso' },
  { id: '3', date: 'Jue May 30, 09:20 am', name: 'Nombre del bloqueo', type: 'Pasos' },
];

const MOCK_MISSIONS = [
  { id: 'm1', title: 'llorar', date: '24/10/2026' },
  { id: 'm2', title: 'I mena hello', date: '30/09/2026' },
  { id: 'm3', title: 'Llorar ha...', date: '01/11/2026' },
];

const BLOCK_TYPES = [
  { id: 'regular', label: 'Bloqueo Regular', desc: 'Está bloqueado por x periodos de tiempo' },
  { id: 'uso', label: 'Bloqueo por uso', desc: 'Si lo usas más de x tiempo, se bloquea' },
  { id: 'pasos', label: 'Bloqueo por pasos', desc: 'Debes terminar este paso para desbloquear' },
];

const MOCK_STEPS = [
  { id: 's1', title: 'Paso 1: Tomar agua' },
  { id: 's2', title: 'Paso 2: Estirarse 5 minutos' },
  { id: 's3', title: 'Paso 3: Escribir una nota' },
];

const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

const OPTIONS = [
  { key: 'descanso', label: 'Permitir tomar descanso', extra: '(X minutos)' },
  { key: 'desinstalar', label: 'No permitir desinstalar' },
  { key: 'segundoPlano', label: 'Bloquear aplicaciones en 2do plano' },
  { key: 'editarModelo', label: 'No permitir editar el modelo durante las horas de bloqueo' },
];

/* Sub-componentes */
const Label: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);

const Checkbox: React.FC<{ checked: boolean; onPress: () => void; label: string; extra?: string }> = ({
  checked,
  onPress,
  label,
  extra,
}) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.checkRow}>
    <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
      {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
    </View>
    <Text style={styles.checkText}>
      {label}
      {extra ? <Text style={{ color: C.purpleLight }}> {extra}</Text> : null}
    </Text>
  </TouchableOpacity>
);

const SelectField: React.FC<{
  value?: string;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}> = ({ value, placeholder, open, onToggle, children }) => (
  <View>
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.field}>
      <Text style={[styles.fieldText, !value && { color: 'rgba(255,255,255,0.35)' }]} numberOfLines={1}>
        {value ?? placeholder}
      </Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.textSoft} />
    </TouchableOpacity>
    {open && <View style={styles.dropdown}>{children}</View>}
  </View>
);

/*  Pantalla */
const Blocks: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);

  // Formulario (solo estado visual por ahora)
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState('');
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false));
  const [missionId, setMissionId] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [web, setWeb] = useState('');
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [openField, setOpenField] = useState<'mision' | 'tipo' | 'paso' | null>(null);

  // Campos según el tipo de bloqueo (solo visual)
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [pickerFor, setPickerFor] = useState<'start' | 'end' | null>(null);
  const [usageValue, setUsageValue] = useState('');
  const [usageUnit, setUsageUnit] = useState<'min' | 'h'>('min');
  const [stepId, setStepId] = useState<string | null>(null);

  const toggleDay = (i: number) => setDays((d) => d.map((v, idx) => (idx === i ? !v : v)));
  const toggleOpt = (k: string) => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const toggleField = (f: 'mision' | 'tipo' | 'paso') => setOpenField((cur) => (cur === f ? null : f));

  const mission = MOCK_MISSIONS.find((m) => m.id === missionId);
  const type = BLOCK_TYPES.find((t) => t.id === typeId);
  const step = MOCK_STEPS.find((x) => x.id === stepId);

  const onPickTime = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setPickerFor(null); // en Android el reloj se cierra solo
    if (!date) return;
    if (pickerFor === 'start') setStartTime(date);
    if (pickerFor === 'end') setEndTime(date);
  };

  return (
    <TexturedScreen style={styles.container}>
      <View style={styles.content}>
        <ViewEncabezado title="Bloqueos" />

        <View style={styles.addWrap}>
          <BtnCircleBig size={96} onPress={() => setModalVisible(true)} />
        </View>

        {/* Lista de bloqueos */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          {MOCK_BLOCKS.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{b.date}</Text>
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {b.name} - <Text style={{ color: C.purpleLight, fontWeight: '700' }}>{b.type}</Text>
              </Text>
              <BtnCircleSmall size={40} />
            </View>
          ))}
        </ScrollView>

        <ViewBtnsMenu initialSelectIndex={2} />
      </View>

      {/* Modal: nuevo bloqueo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.overlay, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.sheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContent}
            >
              {/* On / Off y cerrar */}
              <View style={styles.topRow}>
                <Pressable onPress={() => setEnabled((e) => !e)} style={styles.switch}>
                  <View style={[styles.switchHalf, enabled && styles.switchHalfOn]}>
                    <Text style={styles.switchText}>On</Text>
                  </View>
                  <View style={[styles.switchHalf, !enabled && styles.switchHalfOn]}>
                    <Text style={styles.switchText}>Off</Text>
                  </View>
                </Pressable>
                <BtnClose onPress={() => setModalVisible(false)} size={14} />
              </View>

              <Label>Nombre del bloqueo:</Label>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.field}
                placeholderTextColor="rgba(255,255,255,0.35)"
                selectionColor={C.purpleLight}
              />

              <Label>Selecciona los días en los que se aplica:</Label>
              <View style={styles.daysRow}>
                {DAYS.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    onPress={() => toggleDay(i)}
                    style={[styles.dayBox, days[i] && styles.dayBoxOn]}
                  >
                    <Text style={styles.dayText}>{d}</Text>
                    {days[i] && (
                      <View style={styles.dayCheck}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Selecciona la misión</Label>
              <SelectField
                value={mission?.title}
                placeholder="Elige una misión"
                open={openField === 'mision'}
                onToggle={() => toggleField('mision')}
              >
                {MOCK_MISSIONS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    activeOpacity={0.8}
                    style={[styles.missionCard, m.id === missionId && styles.missionCardOn]}
                    onPress={() => {
                      setMissionId(m.id);
                      setOpenField(null);
                    }}
                  >
                    <Text style={styles.missionTitle} numberOfLines={1}>{m.title}</Text>
                    <Text style={styles.missionDate}>{m.date}</Text>
                  </TouchableOpacity>
                ))}
              </SelectField>

              <Label>Selecciona el tipo de bloqueo:</Label>
              <SelectField
                value={type?.label}
                placeholder="Elige un tipo"
                open={openField === 'tipo'}
                onToggle={() => toggleField('tipo')}
              >
                {BLOCK_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.8}
                    style={[styles.typeItem, t.id === typeId && styles.typeItemOn]}
                    onPress={() => {
                      setTypeId(t.id);
                      setOpenField(null);
                    }}
                  >
                    <Text style={styles.typeText}>
                      <Text style={{ fontWeight: '700' }}>{t.label}:</Text> {t.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </SelectField>

              <Label>Selecciona las aplicaciones</Label>
              <TouchableOpacity activeOpacity={0.8} style={styles.field}>
                <Text style={[styles.fieldText, { color: 'rgba(255,255,255,0.35)' }]}>Toca para elegir apps</Text>
                <Ionicons name="apps-outline" size={18} color={C.textSoft} />
              </TouchableOpacity>

              {/* ── Sección que cambia según el tipo de bloqueo ── */}
              {typeId === 'regular' && (
                <>
                  <Label>Selecciona hora de inicio y hora de finalización</Label>
                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.field, styles.timeField]}
                      onPress={() => setPickerFor(pickerFor === 'start' ? null : 'start')}
                    >
                      <Text style={[styles.fieldText, !startTime && styles.placeholder]}>
                        {formatTime(startTime) ?? 'Inicio'}
                      </Text>
                      <Ionicons name="time-outline" size={18} color={C.textSoft} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.field, styles.timeField]}
                      onPress={() => setPickerFor(pickerFor === 'end' ? null : 'end')}
                    >
                      <Text style={[styles.fieldText, !endTime && styles.placeholder]}>
                        {formatTime(endTime) ?? 'Fin'}
                      </Text>
                      <Ionicons name="time-outline" size={18} color={C.textSoft} />
                    </TouchableOpacity>
                  </View>
                  {pickerFor && (
                    <DateTimePicker
                      value={(pickerFor === 'start' ? startTime : endTime) ?? new Date()}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      themeVariant="dark"
                      onValueChange={onPickTime}
                    />
                  )}
                </>
              )}

              {typeId === 'uso' && (
                <>
                  <Label>Selecciona después de cuánto tiempo se debe bloquear</Label>
                  <View style={styles.timeRow}>
                    <TextInput
                      value={usageValue}
                      onChangeText={(t) => setUsageValue(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      selectionColor={C.purpleLight}
                      style={[styles.field, styles.timeField]}
                    />
                    <View style={styles.unitSwitch}>
                      {(['min', 'h'] as const).map((u) => (
                        <TouchableOpacity
                          key={u}
                          activeOpacity={0.8}
                          onPress={() => setUsageUnit(u)}
                          style={[styles.unitBtn, usageUnit === u && styles.unitBtnOn]}
                        >
                          <Text style={styles.unitText}>{u === 'min' ? 'Minutos' : 'Horas'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {typeId === 'pasos' && (
                <>
                  <Label>Selecciona el paso</Label>
                  <SelectField
                    value={step?.title}
                    placeholder="Elige un paso"
                    open={openField === 'paso'}
                    onToggle={() => toggleField('paso')}
                  >
                    {MOCK_STEPS.map((x) => (
                      <TouchableOpacity
                        key={x.id}
                        activeOpacity={0.8}
                        style={[styles.typeItem, x.id === stepId && styles.typeItemOn]}
                        onPress={() => {
                          setStepId(x.id);
                          setOpenField(null);
                        }}
                      >
                        <Text style={styles.typeText}>{x.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </SelectField>
                </>
              )}

              <Label>Escribe las páginas web</Label>
              <TextInput
                value={web}
                onChangeText={setWeb}
                style={styles.field}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="ejemplo.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                selectionColor={C.purpleLight}
              />

              <View style={styles.optionsWrap}>
                {OPTIONS.map((o) => (
                  <Checkbox
                    key={o.key}
                    label={o.label}
                    extra={o.extra}
                    checked={!!opts[o.key]}
                    onPress={() => toggleOpt(o.key)}
                  />
                ))}
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.addBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.addBtnText}>+ añadir bloqueo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TexturedScreen>
  );
};

export default Blocks;

/*  Estilos */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  addWrap: { alignItems: 'center', marginVertical: 20 },

  /* Tarjeta de la lista */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderWidth: 1.5,
    borderColor: 'rgba(198,148,235,0.35)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 10,
  },
  datePill: {
    backgroundColor: C.purple,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  datePillText: { color: C.text, fontSize: 11, fontWeight: '600' },
  cardName: { flex: 1, color: C.textSoft, fontSize: 12 },

  /* Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14 },
  sheet: {
    flex: 1,
    backgroundColor: C.panel,
    borderColor: C.panelBorder,
    borderWidth: 1.5,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sheetContent: { padding: 18, paddingBottom: 28 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

  switch: {
    flexDirection: 'row',
    backgroundColor: C.field,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: C.panelBorder,
  },
  switchHalf: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  switchHalfOn: { backgroundColor: C.purple },
  switchText: { color: C.text, fontSize: 12, fontWeight: '600' },

  label: { color: C.text, fontSize: 14, fontWeight: '500', marginTop: 16, marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.field,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 14,
  },
  fieldText: { color: C.text, fontSize: 14, flex: 1, marginRight: 8 },

  /* Días */
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBox: {
    width: 40,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.field,
    borderWidth: 1.5,
    borderColor: C.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxOn: { backgroundColor: 'rgba(133,58,207,0.25)', borderColor: 'rgba(198,148,235,0.6)' },
  dayText: { color: C.text, fontSize: 15, fontWeight: '700' },
  dayCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Desplegables */
  dropdown: {
    marginTop: 6,
    backgroundColor: '#1B1928',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.panelBorder,
    padding: 8,
    gap: 8,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.panel,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(198,148,235,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  missionCardOn: { borderColor: C.purpleLight, backgroundColor: 'rgba(133,58,207,0.2)' },
  missionTitle: { color: C.text, fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  missionDate: { color: C.purpleLight, fontSize: 13, fontWeight: '700' },

  typeItem: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10 },
  typeItemOn: { backgroundColor: 'rgba(133,58,207,0.25)' },
  typeText: { color: C.text, fontSize: 12, lineHeight: 17 },

 /* Campos por tipo de bloqueo */
  placeholder: { color: 'rgba(255,255,255,0.35)' },
  timeRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  timeField: { flex: 1 },
  unitSwitch: {
    flexDirection: 'row',
    backgroundColor: C.field,
    borderRadius: 12,
    padding: 3,
    height: 46,
  },
  unitBtn: { paddingHorizontal: 12, borderRadius: 10, justifyContent: 'center' },
  unitBtnOn: { backgroundColor: C.purple },
  unitText: { color: C.text, fontSize: 12, fontWeight: '600' },

  /* Opciones */
  optionsWrap: { marginTop: 20, gap: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: C.field,
    borderWidth: 1.5,
    borderColor: '#2E2C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: C.purple, borderColor: C.purpleLight },
  checkText: { color: C.text, fontSize: 12, flex: 1 },

  /* Botón final */
  addBtn: {
    alignSelf: 'flex-start',
    marginTop: 24,
    backgroundColor: C.purple,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  addBtnText: { color: C.text, fontSize: 13, fontWeight: '700' },
});
