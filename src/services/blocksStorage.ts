// services/blocksStorage.ts
// -----------------------------------------------------------------------------
// Capa de almacenamiento (AsyncStorage) para bloqueos y lectura de misiones.
//
// Reglas de esta capa:
//   - NUNCA devuelve datos corruptos: filtra lo inválido.
//   - NUNCA sobreescribe datos si no pudo leerlos bien (evita perder bloqueos).
//   - Todos los errores se convierten en `StorageError` con mensaje en español
//     listo para mostrarle al usuario.
// -----------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, BlockedApp, Mission } from '../types/blocks';

/** Clave donde se guardan los bloqueos. */
export const BLOCKS_STORAGE_KEY = '@blocks_list_key';
/**
 * Clave donde Task_home guarda las tareas/misiones.
 * DEBE coincidir con `STORAGE_KEY` de Task_home.tsx.
 */
export const TASKS_STORAGE_KEY = '@tasks_list_key';

/** Error con mensaje amigable + el error original para depurar. */
export class StorageError extends Error {
  original?: unknown;
  constructor(message: string, original?: unknown) {
    super(message);
    this.name = 'StorageError';
    this.original = original;
  }
}

/** Lee una clave y la convierte de JSON. Devuelve null si no existe. */
const readJson = async (key: string, what: string): Promise<unknown | null> => {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (e) {
    throw new StorageError(`No se pudo leer ${what} del teléfono.`, e);
  }
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new StorageError(`Los datos de ${what} están dañados.`, e);
  }
};

/** Escribe un valor como JSON. */
const writeJson = async (key: string, value: unknown, what: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    throw new StorageError(`No se pudo guardar ${what}. Revisa el espacio del teléfono.`, e);
  }
};

/**
 * Cola de escrituras: si el usuario toca "añadir" y "borrar" casi a la vez,
 * las operaciones leer→modificar→guardar se ejecutan una tras otra y no se
 * pisan entre sí.
 */
let writeQueue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined); // la cola sigue viva aunque una tarea falle
  return run;
};

/* ───────────────────────── Validadores de forma ───────────────────────── */

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Acepta solo apps con packageName y appName de texto. */
const toBlockedApps = (v: unknown): BlockedApp[] =>
  Array.isArray(v)
    ? v
        .filter(isObject)
        .filter((a) => typeof a.packageName === 'string' && typeof a.appName === 'string')
        .map((a) => ({ packageName: a.packageName as string, appName: a.appName as string }))
    : [];

/**
 * Convierte un valor leído del disco en un `Block` seguro, o null si le faltan
 * los datos mínimos. Rellena con valores por defecto lo que falte (por si en
 * el futuro se agregan campos nuevos).
 */
const toBlock = (v: unknown): Block | null => {
  if (!isObject(v)) return null;
  if (typeof v.id !== 'string' || typeof v.name !== 'string') return null;
  if (v.type !== 'regular' && v.type !== 'uso' && v.type !== 'pasos') return null;

  return {
    id: v.id,
    name: v.name,
    enabled: v.enabled !== false,
    days: Array.isArray(v.days)
      ? v.days.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6)
      : [],
    missionId: typeof v.missionId === 'string' ? v.missionId : '',
    missionTitle: typeof v.missionTitle === 'string' ? v.missionTitle : '',
    type: v.type,
    startTime: typeof v.startTime === 'string' ? v.startTime : undefined,
    endTime: typeof v.endTime === 'string' ? v.endTime : undefined,
    usageMinutes: typeof v.usageMinutes === 'number' ? v.usageMinutes : undefined,
    apps: toBlockedApps(v.apps),
    websites: Array.isArray(v.websites)
      ? v.websites.filter((w): w is string => typeof w === 'string')
      : [],
    options: isObject(v.options) ? (v.options as Record<string, boolean>) : {},
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : new Date(0).toISOString(),
  };
};

/* ───────────────────────── API pública ───────────────────────── */

/** Devuelve todos los bloqueos guardados (más nuevo primero). */
export const loadBlocks = async (): Promise<Block[]> => {
  const data = await readJson(BLOCKS_STORAGE_KEY, 'los bloqueos');
  if (data === null) return []; // aún no hay bloqueos
  if (!Array.isArray(data)) throw new StorageError('Los datos de los bloqueos están dañados.');
  return data.map(toBlock).filter((b): b is Block => b !== null);
};

/** Agrega un bloqueo al inicio de la lista y devuelve la lista actualizada. */
export const addBlock = (block: Block): Promise<Block[]> =>
  enqueue(async () => {
    const current = await loadBlocks(); // si falla, lanza y NO se sobreescribe nada
    const next = [block, ...current];
    await writeJson(BLOCKS_STORAGE_KEY, next, 'el bloqueo');
    return next;
  });

/** Elimina un bloqueo por id y devuelve la lista actualizada. */
export const deleteBlock = (id: string): Promise<Block[]> =>
  enqueue(async () => {
    const current = await loadBlocks();
    const next = current.filter((b) => b.id !== id);
    await writeJson(BLOCKS_STORAGE_KEY, next, 'los cambios');
    return next;
  });

/**
 * Lee las misiones que el usuario creó en Task_home.
 * Task_home guarda un arreglo de { id, title, date? }.
 */
export const loadMissions = async (): Promise<Mission[]> => {
  const data = await readJson(TASKS_STORAGE_KEY, 'las misiones');
  if (data === null) return [];
  if (!Array.isArray(data)) throw new StorageError('Los datos de las misiones están dañados.');

  return data
    .filter(isObject)
    .filter((t) => typeof t.id === 'string' && typeof t.title === 'string' && t.title.trim() !== '')
    .map((t) => ({
      id: t.id as string,
      title: t.title as string,
      date: typeof t.date === 'string' ? t.date : undefined,
    }));
};
