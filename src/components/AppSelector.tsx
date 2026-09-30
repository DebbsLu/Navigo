// components/AppSelector.tsx
// -----------------------------------------------------------------------------
// Selector de aplicaciones a bloquear.
//   - Carga las apps instaladas (ver services/installedApps.ts).
//   - Un campo de texto sirve de BUSCADOR (ignora mayúsculas y acentos).
//   - Cada app tiene un "chequecito" para marcarla o desmarcarla.
//   - El componente es "controlado": la lista de apps elegidas vive en la
//     pantalla padre (`selected`) y se avisa de los cambios con `onChange`.
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BlockedApp } from '../types/blocks';
import { getInstalledApps, InstalledAppsResult } from '../services/installedApps';

interface AppSelectorProps {
  /** Apps actualmente marcadas. */
  selected: BlockedApp[];
  /** Se llama con la nueva lista cada vez que se marca/desmarca una app. */
  onChange: (next: BlockedApp[]) => void;
}

/** Quita acentos y mayúsculas: "Cámara" -> "camara". Sirve para buscar sin fallos. */
const normalizeText = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const AppSelector: React.FC<AppSelectorProps> = ({ selected, onChange }) => {
  const [result, setResult] = useState<InstalledAppsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Carga la lista al montarse. `cancelled` evita actualizar el estado si el
  // componente se cerró antes de terminar (modal cerrado).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getInstalledApps();
        if (!cancelled) setResult(res);
      } catch (e) {
        // getInstalledApps no debería lanzar, pero por seguridad lo controlamos.
        console.error('[AppSelector] Error inesperado al cargar apps:', e);
        if (!cancelled) setLoadError('No se pudieron cargar las aplicaciones.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Conjunto de packageName marcados, para saber rápido si una fila está activa.
  const selectedSet = useMemo(() => new Set(selected.map((a) => a.packageName)), [selected]);

  // Lista filtrada por lo que se escribe en el buscador.
  const filtered = useMemo(() => {
    const apps = result?.apps ?? [];
    const q = normalizeText(query);
    if (!q) return apps;
    return apps.filter(
      (a) => normalizeText(a.appName).includes(q) || a.packageName.toLowerCase().includes(q),
    );
  }, [result, query]);

  /** Marca o desmarca una app. */
  const toggleApp = (packageName: string, appName: string) => {
    if (selectedSet.has(packageName)) {
      onChange(selected.filter((a) => a.packageName !== packageName));
    } else {
      onChange([...selected, { packageName, appName }]);
    }
  };

  return (
    <View>
      {/* Campo buscador + flecha para abrir/cerrar la lista */}
      <View style={styles.field}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.65)" />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setExpanded(true); // al escribir se abre la lista
          }}
          onFocus={() => setExpanded(true)}
          placeholder="Busca una aplicación"
          placeholderTextColor="rgba(255,255,255,0.35)"
          selectionColor="#C694EB"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setExpanded((e) => !e)}
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="rgba(255,255,255,0.65)"
          />
        </TouchableOpacity>
      </View>

      {/* Resumen de lo elegido (siempre visible) */}
      {selected.length > 0 && (
        <Text style={styles.summary} numberOfLines={2}>
          {selected.length} {selected.length === 1 ? 'app seleccionada' : 'apps seleccionadas'}:{' '}
          {selected.map((a) => a.appName).join(', ')}
        </Text>
      )}

      {/* Lista desplegable */}
      {expanded && (
        <View style={styles.dropdown}>
          {loading && <ActivityIndicator color="#C694EB" style={{ marginVertical: 16 }} />}

          {!loading && loadError && <Text style={styles.warning}>{loadError}</Text>}

          {!loading && result?.warning && <Text style={styles.warning}>{result.warning}</Text>}

          {!loading && !loadError && filtered.length === 0 && (
            <Text style={styles.empty}>Sin resultados para "{query.trim()}"</Text>
          )}

          {!loading && filtered.length > 0 && (
            <ScrollView
              style={styles.list}
              nestedScrollEnabled // necesario en Android: lista dentro de otro ScrollView
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((app) => {
                const checked = selectedSet.has(app.packageName);
                return (
                  <TouchableOpacity
                    key={app.packageName}
                    activeOpacity={0.7}
                    onPress={() => toggleApp(app.packageName, app.appName)}
                    style={styles.row}
                  >
                    {app.icon ? (
                      <Image source={{ uri: app.icon }} style={styles.icon} />
                    ) : (
                      <View style={[styles.icon, styles.iconFallback]}>
                        <Ionicons name="cube-outline" size={16} color="rgba(255,255,255,0.65)" />
                      </View>
                    )}
                    <Text style={styles.appName} numberOfLines={1}>
                      {app.appName}
                    </Text>
                    <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
                      {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

export default AppSelector;

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181622',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14, paddingVertical: 0 },
  summary: { color: '#C694EB', fontSize: 12, marginTop: 8 },
  dropdown: {
    marginTop: 6,
    backgroundColor: '#1B1928',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1D29',
    padding: 8,
  },
  list: { maxHeight: 240 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  icon: { width: 30, height: 30, borderRadius: 8 },
  iconFallback: { backgroundColor: '#181622', alignItems: 'center', justifyContent: 'center' },
  appName: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#181622',
    borderWidth: 1.5,
    borderColor: '#2E2C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: '#853ACF', borderColor: '#C694EB' },
  warning: { color: '#E9B872', fontSize: 11, lineHeight: 16, paddingHorizontal: 4, paddingBottom: 6 },
  empty: { color: 'rgba(255,255,255,0.65)', fontSize: 12, padding: 10, textAlign: 'center' },
});
