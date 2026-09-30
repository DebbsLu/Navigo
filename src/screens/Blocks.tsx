// Pantalla "Bloqueos"
// Muestra la lista de bloqueos guardados (AsyncStorage).
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import AppSelector from '../components/AppSelector';
import WebsiteInputs from '../components/WebsiteInputs';

import {
  Block,
  BlockedApp,
  BlockFormData,
  BlockTypeId,
  Mission,
  UsageUnit,
} from '../types/blocks';
import {
  BLOCK_TYPE_SHORT,
  MAX_NAME_LENGTH,
  blockSummary,
  buildBlock,
  validateBlockForm,
} from '../services/blockUtils';
import { StorageError, addBlock, deleteBlock, loadBlocks, loadMissions } from '../services/blocksStorage';

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

/* Constantes de la interfaz */
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const BLOCK_TYPES: { id: BlockTypeId; label: string; desc: string }[] = [
  { id: 'regular', label: 'Bloqueo Regular', desc: 'Está bloqueado por x periodos de tiempo' },
  { id: 'uso', label: 'Bloqueo por uso', desc: 'Si lo usas más de x tiempo, se bloquea' },
  { id: 'pasos', label: 'Bloqueo por pasos', desc: 'Debes terminar este paso para desbloquear' },
];

// Pasos de ejemplo (el bloqueo por pasos aún no tiene lógica)
const MOCK_STEPS = [
  { id: 's1', title: 'Paso 1: Tomar agua' },
  { id: 's2', title: 'Paso 2: Estirarse 5 minutos' },
  { id: 's3', title: 'Paso 3: Escribir una nota' },
];

const OPTIONS = [
  { key: 'descanso', label: 'Permitir tomar descanso', extra: '(X minutos)' },
  { key: 'desinstalar', label: 'No permitir desinstalar' },
  { key: 'segundoPlano', label: 'Bloquear aplicaciones en 2do plano' },
  { key: 'editarModelo', label: 'No permitir editar el modelo durante las horas de bloqueo' },
];

/** Hora legible para mostrar en los campos del formulario. */
const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

/** Saca un mensaje legible de cualquier error. */
const errorMessage = (e: unknown, fallback: string): string =>
  e instanceof StorageError || e instanceof Error ? e.message : fallback;

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

   /* ── Lista de bloqueos ── */
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  /* ── Modal y guardado ── */
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false); // evita doble toque en "añadir bloqueo"

  /* ── Misiones disponibles (vienen de Task_home) ── */
  const [missions, setMissions] = useState<Mission[]>([]);

  // Formulario 
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState('');
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false));
  const [missionId, setMissionId] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<BlockTypeId | null>(null);
  const [websites, setWebsites] = useState<string[]>(['']); // siempre al menos un campo
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [apps, setApps] = useState<BlockedApp[]>([]);
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

  const mission = missions.find((m) => m.id === missionId);
  const type = BLOCK_TYPES.find((t) => t.id === typeId);
  const step = MOCK_STEPS.find((x) => x.id === stepId);

  /** Se ejecuta cuando el usuario elige una hora en el reloj. */
  const onPickTime = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setPickerFor(null); // en Android el reloj se cierra solo
    if (!date) return;
    if (pickerFor === 'start') setStartTime(date);
    if (pickerFor === 'end') setEndTime(date);
  };

   /* ───────────── Carga de la lista ───────────── */

  /** Lee los bloqueos guardados. Si falla, muestra el error con opción de reintentar. */
  const refreshBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    setListError(null);
    try {
      setBlocks(await loadBlocks());
    } catch (e) {
      console.error('[Blocks] Error al cargar bloqueos:', e);
      setListError(errorMessage(e, 'No se pudieron cargar los bloqueos.'));
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  // Al entrar a la pantalla por primera vez.
  useEffect(() => {
    refreshBlocks();
  }, [refreshBlocks]);

  /* ───────────── Formulario ───────────── */

  /** Deja el formulario en blanco (se llama cada vez que se abre el modal). */
  const resetForm = () => {
    setEnabled(true);
    setName('');
    setDays(Array(7).fill(false));
    setMissionId(null);
    setTypeId(null);
    setApps([]);
    setWebsites(['']);
    setOpts({});
    setOpenField(null);
    setStartTime(null);
    setEndTime(null);
    setPickerFor(null);
    setUsageValue('');
    setUsageUnit('min');
    setStepId(null);
  };

  /** Abre el formulario: lo limpia y recarga las misiones de Task_home. */
  const openModal = async () => {
    resetForm();
    try {
      setMissions(await loadMissions());
    } catch (e) {
      console.error('[Blocks] Error al cargar misiones:', e);
      setMissions([]);
      Alert.alert('Misiones', errorMessage(e, 'No se pudieron cargar las misiones.'));
    }
    setModalVisible(true);
  };

  /** Junta el estado del formulario en un solo objeto para validarlo/guardarlo. */
  const buildFormData = (): BlockFormData => ({
    enabled,
    name,
    days,
    missionId,
    typeId,
    startTime,
    endTime,
    usageValue,
    usageUnit,
    apps,
    websites,
    options: opts,
  });

  /** Botón "+ añadir bloqueo": valida, guarda y cierra el modal. */
  const handleSubmit = async () => {
    if (saving) return; // ya hay un guardado en curso

    const form = buildFormData();

    // Validar. Si hay errores, se muestran todos juntos y NO se guarda.
    const errors = validateBlockForm(form, missions);
    if (errors.length > 0) {
      Alert.alert('Revisa el formulario', errors.map((e) => `• ${e}`).join('\n'));
      return;
    }

    //  Construir y guardar.
    setSaving(true);
    try {
      const block = buildBlock(form, missions);
      const updated = await addBlock(block);
      setBlocks(updated); // la lista ya muestra el bloqueo nuevo
      setListError(null);
      setModalVisible(false); // redirige a la lista de bloqueos
    } catch (e) {
      console.error('[Blocks] Error al guardar el bloqueo:', e);
      Alert.alert('No se pudo guardar', errorMessage(e, 'Ocurrió un error inesperado. Inténtalo de nuevo.'));
    } finally {
      setSaving(false);
    }
  };

  /** Mantener presionada una tarjeta: pide confirmación y borra el bloqueo. */
  const confirmDelete = (block: Block) => {
    Alert.alert('Eliminar bloqueo', `¿Eliminar "${block.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setBlocks(await deleteBlock(block.id));
          } catch (e) {
            console.error('[Blocks] Error al borrar:', e);
            Alert.alert('No se pudo eliminar', errorMessage(e, 'Inténtalo de nuevo.'));
          }
        },
      },
    ]);
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
          {loadingBlocks && <ActivityIndicator color={C.purpleLight} style={{ marginTop: 24 }} />}

          {!loadingBlocks && listError && (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{listError}</Text>
              <TouchableOpacity onPress={refreshBlocks} style={styles.retryBtn}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loadingBlocks && !listError && blocks.length === 0 && (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>No hay bloqueos</Text>
            </View>
          )}

          {!loadingBlocks &&
            blocks.map((b) => (
              <Pressable key={b.id} onLongPress={() => confirmDelete(b)} delayLongPress={500}>
                <View style={[styles.card, !b.enabled && { opacity: 0.55 }]}>
                  <View style={styles.datePill}>
                    <Text style={styles.datePillText}>{blockSummary(b)}</Text>
                  </View>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {b.name} - <Text style={{ color: C.purpleLight, fontWeight: '700' }}>{BLOCK_TYPE_SHORT[b.type]}</Text>
                  </Text>
                  <BtnCircleSmall size={40} />
                </View>
              </Pressable>
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
                maxLength={MAX_NAME_LENGTH}
                style={styles.field}
                placeholder="Ej. Bloqueo de apps de mensajería"
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
                {missions.length === 0 && (
                  <Text style={styles.emptyDropdown}>
                    Aún no tienes misiones. Créalas en la pantalla de tareas.
                  </Text>
                )}
                {missions.map((m) => (
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
                    {m.date ? <Text style={styles.missionDate}>{m.date}</Text> : null}
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
                      setPickerFor(null); // cierra el reloj si estaba abierto
                    }}
                  >
                    <Text style={styles.typeText}>
                      <Text style={{ fontWeight: '700' }}>{t.label}:</Text> {t.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </SelectField>

              <Label>Selecciona las aplicaciones</Label>
              <AppSelector selected={apps} onChange={setApps} />

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
                      onDismiss={() => setPickerFor(null)} // cerrar sin elegir hora
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
                      maxLength={4}
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
              <WebsiteInputs values={websites} onChange={setWebsites} />

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

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.addBtn, saving && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.addBtnText}>{saving ? 'Guardando...' : '+ añadir bloqueo'}</Text>
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

  /* Estados de la lista */
  stateBox: { alignItems: 'center', marginTop: 32, gap: 12 },
  stateText: { color: '#A192B4', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(133,58,207,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(198,148,235,0.45)',
  },
  retryText: { color: C.text, fontSize: 13, fontWeight: '600' },

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
  emptyDropdown: { color: C.textSoft, fontSize: 12, padding: 8, textAlign: 'center' },
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
