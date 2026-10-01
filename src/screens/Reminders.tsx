import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  TextInput,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import TexturedScreen from "../components/TexturedScreen";
import { ViewInfoProxima } from "../components/ViewInfoProxima";
import BtnCircleBig from "../components/BtnCircleBig";
import ViewEncabezado from "../components/ViewEncabezado";
import ViewLista from "../components/ViewLista";
import ViewBtnsMenu from "../components/ViewBtnsMenu";
import CustomModal from "../components/CustomModal";
import type { Task } from "./Task_home";

const REMINDERS_KEY = "@reminders_list_key";
const TASKS_KEY = "@tasks_list_key"; // misma clave que usa Task_home

// Paleta roja de esta pantalla
const RED = {
  gradient: ["#8B2520", "#3A1214"] as const,
  tag: "#1B0F11",
  glowRgb: "80, 0, 0",
  headerText: "#EF7B74",
  headerLine: "#C0392B",
  rowBorder: "#5A3B3D",
  rowDate: "#E0554F",
  rowBtn: "#44191b",
};

export interface Reminder {
  id: string;
  title: string;
  date?: string;
  activityId?: string;
  activityTitle?: string;
}

/*   Utilidades   */

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const pad = (n: number) => String(n).padStart(2, "0");

// "Jue Mayo 30, 09:20 am"
const formatPill = (d: Date) => {
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${WEEKDAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${pad(h12)}:${pad(
    d.getMinutes(),
  )} ${h >= 12 ? "pm" : "am"}`;
};

// "Jue 1/10"
const formatShort = (d: Date) =>
  `${WEEKDAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

const sortReminders = (list: Reminder[]): Reminder[] =>
  [...list].sort((a, b) => {
    if (a.date && b.date)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

/*    Fila deslizable (editar / eliminar)    */

const ACTIONS_WIDTH = 150;

type SwipeableItemProps = {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

const SwipeableItem = ({ children, onEdit, onDelete }: SwipeableItemProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const animateTo = (to: number) => {
    isOpen.current = to !== 0;
    Animated.spring(translateX, {
      toValue: to,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      // "Capture" para quitarle el gesto horizontal al botón hijo
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const base = isOpen.current ? -ACTIONS_WIDTH : 0;
        translateX.setValue(Math.min(0, Math.max(-ACTIONS_WIDTH, base + g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        const base = isOpen.current ? -ACTIONS_WIDTH : 0;
        animateTo(base + g.dx < -ACTIONS_WIDTH / 2 ? -ACTIONS_WIDTH : 0);
      },
      onPanResponderTerminate: () =>
        animateTo(isOpen.current ? -ACTIONS_WIDTH : 0),
    }),
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
        {/* Las acciones están pegadas a la derecha de la fila y se revelan al deslizar */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => {
              animateTo(0);
              onEdit();
            }}
          >
            <Text style={styles.actionText}>Editar</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => {
              animateTo(0);
              onDelete();
            }}
          >
            <Text style={styles.actionText}>Eliminar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

/*   Pantalla  */

const Reminders: React.FC = () => {
  const navigation = useNavigation<any>();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activities, setActivities] = useState<Task[]>([]); // actividades de Task_home

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);

  // Formulario
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [activity, setActivity] = useState<Task | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [error, setError] = useState("");

  // Cargar recordatorios y actividades cada vez que se entra a la pantalla
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const [r, t] = await Promise.all([
            AsyncStorage.getItem(REMINDERS_KEY),
            AsyncStorage.getItem(TASKS_KEY),
          ]);
          if (r) setReminders(sortReminders(JSON.parse(r)));
          setActivities(t ? JSON.parse(t) : []);
        } catch (e) {
          console.error("Error al cargar los recordatorios:", e);
        }
      })();
    }, []),
  );

  const persist = (next: Reminder[]) => {
    const sorted = sortReminders(next);
    setReminders(sorted);
    AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(sorted)).catch((e) =>
      console.error("Error al guardar los recordatorios:", e),
    );
  };

  // Recordatorio más próximo = fecha futura más cercana
  const next = useMemo(() => {
    const now = Date.now();
    return (
      reminders.find((r) => r.date && new Date(r.date).getTime() >= now) ?? null
    );
  }, [reminders]);

  /*   Modal   */

  const openForm = (r: Reminder | null) => {
    setEditing(r);
    setTitle(r?.title ?? "");
    setDate(r?.date ? new Date(r.date) : null);
    setActivity(
      r?.activityId
        ? (activities.find((a) => a.id === r.activityId) ?? null)
        : null,
    );
    setDropdownOpen(false);
    setPickerMode(null);
    setError("");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setPickerMode(null);
    setIsModalVisible(false);
    setEditing(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError("Escribe el nombre del recordatorio.");
      return;
    }
    const data = {
      title: title.trim(),
      date: date ? date.toISOString() : undefined,
      activityId: activity?.id,
      activityTitle: activity?.title,
    };
    if (editing) {
      persist(
        reminders.map((r) => (r.id === editing.id ? { ...r, ...data } : r)),
      );
    } else {
      persist([{ id: Date.now().toString(), ...data }, ...reminders]);
    }
    closeModal();
  };

  const handleDelete = (r: Reminder) => {
    Alert.alert(
      "Eliminar recordatorio",
      "¿Estás seguro de que deseas eliminar este recordatorio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => persist(reminders.filter((x) => x.id !== r.id)),
        },
      ],
    );
  };

  const onPickerChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed" || !picked) {
        setPickerMode(null);
        return;
      }
      setDate(picked);
      setPickerMode(pickerMode === "date" ? "time" : null); // Android: fecha y luego hora
    } else if (picked) {
      setDate(picked);
    }
  };

  /*   Navegación   */

  const goToActivity = (r: Reminder) => {
    if (r.activityId) {
      navigation.navigate("InfinityCanvas", {
        taskId: r.activityId,
        title: r.activityTitle ?? r.title,
      });
    } else {
      openForm(r);
    }
  };

  const handleSelectTab = (index: number) => {
    if (index === 0) navigation.navigate("TaskHome");
    else if (index === 2) navigation.navigate("Blocks");
  };

  /*    Render    */

  return (
    <TexturedScreen style={styles.container}>
      {/* Recordatorio más próximo */}
      <View style={styles.topCardContainer}>
        <ViewInfoProxima
          subtitle="Recordatorio más próximo a mostrar:"
          title={next ? next.title : "Sin recordatorios próximos"}
          tagText={next ? formatPill(new Date(next.date as string)) : "---"}
          gradientColors={RED.gradient}
          tagBackgroundColor={RED.tag}
          onPressBtn={next ? () => goToActivity(next) : undefined}
        />
      </View>

      {/* Botón + central */}
      <View style={styles.buttonContainer}>
        <BtnCircleBig onPress={() => openForm(null)} accentRgb={RED.glowRgb} />
      </View>

      <ViewEncabezado
        title="Recordatorios"
        textColor={RED.headerText}
        lineColor={RED.headerLine}
      />

      {/* Lista */}
      <View style={styles.listContainer}>
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay recordatorios agregados</Text>
          </View>
        ) : (
          <FlatList
            data={reminders}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SwipeableItem
                onEdit={() => openForm(item)}
                onDelete={() => handleDelete(item)}
              >
                <ViewLista
                  title1={item.title}
                  title2={item.date ? formatShort(new Date(item.date)) : ""}
                  isFirst={index === 0}
                  borderColor={RED.rowBorder}
                  title2Color={RED.rowDate}
                  btnBackgroundColor={RED.rowBtn}
                  onPressItem={() => openForm(item)}
                  onPressButton={() => goToActivity(item)}
                />
              </SwipeableItem>
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Menú inferior */}
      <View style={styles.menuContainer}>
        <ViewBtnsMenu initialSelectIndex={1} onSelectTab={handleSelectTab} />
      </View>

      {/* Modal crear / editar */}
      <CustomModal
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={() => {}}
      >
        <Text style={styles.label}>Escribe el nombre de tu recordatorio</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nombre del recordatorio"
          placeholderTextColor="#7A7799"
        />

        <Text style={styles.label}>
          Define la fecha que finaliza (*Si aplica):
        </Text>
        <Pressable style={styles.input} onPress={() => setPickerMode("date")}>
          <Text style={date ? styles.inputText : styles.placeholder}>
            {date ? formatPill(date) : "Seleccionar fecha"}
          </Text>
        </Pressable>
        {date && (
          <Pressable onPress={() => setDate(null)} style={styles.clearDate}>
            <Text style={styles.clearDateText}>Quitar fecha</Text>
          </Pressable>
        )}

        {pickerMode && (
          <>
            <DateTimePicker
              value={date ?? new Date()}
              mode={Platform.OS === "ios" ? "datetime" : pickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              themeVariant="dark"
              minimumDate={new Date()}
              onChange={onPickerChange}
            />
            {Platform.OS === "ios" && (
              <Pressable
                style={styles.doneBtn}
                onPress={() => {
                  if (!date) setDate(new Date());
                  setPickerMode(null);
                }}
              >
                <Text style={styles.doneText}>Listo</Text>
              </Pressable>
            )}
          </>
        )}

        <Text style={styles.label}>Selecciona la actividad</Text>
        <Pressable
          style={styles.input}
          onPress={() => setDropdownOpen((v) => !v)}
        >
          <Text style={activity ? styles.inputText : styles.placeholder}>
            {activity?.title ?? "Elegir actividad"}
          </Text>
        </Pressable>
        {dropdownOpen && (
          <View style={styles.dropdown}>
            {activities.length === 0 && (
              <Text style={styles.dropdownEmpty}>
                No hay actividades creadas.
              </Text>
            )}
            {activities.map((a) => (
              <Pressable
                key={a.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setActivity(a);
                  setDropdownOpen(false);
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.inputText,
                    a.id === activity?.id && { color: "#ff6b63" },
                  ]}
                >
                  {a.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>
            {editing ? "Guardar cambios" : "+ añadir recordatorio"}
          </Text>
        </Pressable>
      </CustomModal>
    </TexturedScreen>
  );
};

export default Reminders;

/*  Estilos   */

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  topCardContainer: { marginTop: 10, marginBottom: 10 },
  buttonContainer: { alignItems: "center", marginVertical: 12 },
  listContainer: { flex: 1, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#A192B4", fontSize: 16, fontWeight: "500" },
  flatListContent: { paddingBottom: 20 },
  menuContainer: { paddingVertical: 10, alignItems: "center" },

  // Swipe
  swipeContainer: { overflow: "hidden", borderRadius: 12 },
  actions: {
    position: "absolute",
    left: "100%",
    top: 0,
    bottom: 0,
    width: ACTIONS_WIDTH,
    flexDirection: "row",
  },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  editBtn: { backgroundColor: "#2f4a7a" },
  deleteBtn: { backgroundColor: "#8a1f1b" },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Formulario (mismo estilo que CustomModal)
  label: { color: "#FFFFFF", fontSize: 14, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: "#181622",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    height: 48,
  },
  inputText: { color: "#FFFFFF", fontSize: 14 },
  placeholder: { color: "#7A7799", fontSize: 14 },
  clearDate: { alignSelf: "flex-start", marginTop: -8, marginBottom: 12 },
  clearDateText: { color: "#ff6b63", fontSize: 12 },
  doneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  doneText: { color: "#ff6b63", fontWeight: "700" },
  dropdown: {
    backgroundColor: "#1b1926",
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    maxHeight: 160,
    overflow: "hidden",
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownEmpty: { color: "#777", padding: 14 },
  error: { color: "#ff7b73", fontSize: 12, marginBottom: 8 },
  saveBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#7a1f1c",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  saveText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
