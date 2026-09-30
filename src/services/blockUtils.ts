// services/blockUtils.ts
// Funciones PURAS (sin React ni almacenamiento) para:
// Normalizar datos (hora, páginas web, minutos de uso).
// Validar el formulario.
// Construir el objeto `Block` final.
// Dar formato de texto para la lista.

import {
  Block,
  BlockFormData,
  BlockTypeId,
  Mission,
  MissionStep,
  UsageUnit,
} from '../types/blocks';

/** Máximo de tiempo de uso permitido: 24 horas. */
export const MAX_USAGE_MINUTES = 24 * 60;
/** Máximo de campos de página web que se pueden agregar. */
export const MAX_WEBSITES = 10;
/** Largo máximo del nombre del bloqueo. */
export const MAX_NAME_LENGTH = 60;

/** Etiqueta corta del tipo, usada en la lista. */
export const BLOCK_TYPE_SHORT: Record<BlockTypeId, string> = {
  regular: 'Regular',
  uso: 'Uso',
  pasos: 'Pasos',
};

/* ───────────────────────── Normalización ───────────────────────── */

/** Convierte un Date a "HH:mm" (24 h). Ej.: 9:05 -> "09:05". */
export const toHHmm = (d: Date): string => {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Limpia lo que escribió el usuario y devuelve solo el dominio.
 *   "https://www.Instagram.com/reels?x=1"  ->  "instagram.com"
 *   "tiktok.com"                           ->  "tiktok.com"
 *   "hola"                                 ->  null (no es un dominio válido)
 * Devuelve null si el texto está vacío o no parece un dominio.
 */
export const normalizeWebsite = (raw: string): string | null => {
  let v = raw.trim().toLowerCase();
  if (!v) return null;

  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // quita "https://"
  v = v.split(/[/?#]/)[0]; //                      quita ruta, query y hash
  v = v.replace(/^[^@]*@/, ''); //                 quita "usuario:clave@"
  v = v.replace(/:\d+$/, ''); //                   quita ":8080"
  v = v.replace(/^www\./, ''); //                  quita "www."

  // Dominio con al menos un punto y extensión de 2+ letras.
  const domainRegex =
    /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  return domainRegex.test(v) ? v : null;
};

/**
 * Convierte lo escrito (valor + unidad) a minutos.
 * Devuelve null si el valor no es un entero mayor a 0.
 */
export const parseUsageMinutes = (value: string, unit: UsageUnit): number | null => {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return unit === 'h' ? n * 60 : n;
};

/* ───────────────────────── Validación ───────────────────────── */

/**
 * Campos del formulario que pueden tener error. Cada uno se muestra justo
 * debajo de su campo en la pantalla.
 *   schedule -> horas del bloqueo regular
 *   usage    -> tiempo del bloqueo por uso
 *   step     -> paso del bloqueo por pasos
 *   target   -> "falta al menos una app o página web"
 *   websites -> alguna página web no es válida (se resalta en rojo cada campo)
 */
export type FormField =
  | 'name'
  | 'days'
  | 'mission'
  | 'type'
  | 'schedule'
  | 'usage'
  | 'step'
  | 'target'
  | 'websites';

/** Un mensaje por campo con error. Objeto vacío = formulario válido. */
export type FormErrors = Partial<Record<FormField, string>>;

/**
 * Revisa el formulario completo y devuelve los errores POR CAMPO.
 * @param steps pasos cargados de la misión elegida (para el bloqueo por pasos).
 */
export const validateBlockForm = (
  form: BlockFormData,
  missions: Mission[],
  steps: MissionStep[],
): FormErrors => {
  const errors: FormErrors = {};

  // 1. Nombre
  const name = form.name.trim();
  if (!name) errors.name = 'Escribe un nombre para el bloqueo.';
  else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`;
  }

  // 2. Días
  if (!form.days.some(Boolean)) errors.days = 'Selecciona al menos un día.';

  // 3. Misión (debe existir aún en la lista de tareas)
  if (missions.length === 0) {
    errors.mission = 'No tienes misiones. Crea una primero en la pantalla de tareas.';
  } else if (!form.missionId) {
    errors.mission = 'Selecciona una misión.';
  } else if (!missions.some((m) => m.id === form.missionId)) {
    errors.mission = 'La misión elegida ya no existe. Elige otra.';
  }

  // 4. Tipo de bloqueo y sus campos propios
  if (!form.typeId) {
    errors.type = 'Selecciona el tipo de bloqueo.';
  } else if (form.typeId === 'regular') {
    if (!form.startTime || !form.endTime) {
      errors.schedule = 'Selecciona la hora de inicio y la hora de fin.';
    } else if (toHHmm(form.startTime) === toHHmm(form.endTime)) {
      errors.schedule = 'La hora de inicio y la de fin no pueden ser iguales.';
    }
  } else if (form.typeId === 'uso') {
    const minutes = parseUsageMinutes(form.usageValue, form.usageUnit);
    if (minutes === null) errors.usage = 'Escribe un tiempo de uso mayor a 0.';
    else if (minutes > MAX_USAGE_MINUTES) errors.usage = 'El tiempo de uso no puede superar 24 horas.';
  } else if (form.typeId === 'pasos') {
    // Si no hay misión válida, ese error ya se muestra en el campo de misión.
    if (!errors.mission) {
      if (steps.length === 0) {
        errors.step = 'Esta misión aún no tiene pasos. Créalos en su lienzo.';
      } else if (!form.stepId) {
        errors.step = 'Selecciona un paso.';
      } else if (!steps.some((s) => s.id === form.stepId)) {
        errors.step = 'El paso elegido ya no existe. Elige otro.';
      }
    } else {
      errors.step = 'Primero elige una misión para ver sus pasos.';
    }
  }

  // 5. Apps o páginas web (al menos una de las dos)
  const filledSites = form.websites.filter((w) => w.trim() !== '');
  const hasInvalidSite = filledSites.some((w) => normalizeWebsite(w) === null);
  if (hasInvalidSite) {
    // Cada campo inválido muestra su propio mensaje (ver WebsiteInputs).
    errors.websites = 'Hay páginas web no válidas.';
  }
  if (form.apps.length === 0 && filledSites.length === 0) {
    errors.target = 'Selecciona al menos una aplicación o escribe una página web.';
  }

  return errors;
};

/* ───────────────────────── Construcción ───────────────────────── */

/**
 * Crea el objeto `Block` listo para guardar.
 * IMPORTANTE: llamar solo después de que `validateBlockForm` devolvió [].
 * Si algo no cuadra lanza un Error (así nunca se guarda un bloqueo roto).
 */
export const buildBlock = (
  form: BlockFormData,
  missions: Mission[],
  steps: MissionStep[],
): Block => {
  const mission = missions.find((m) => m.id === form.missionId);
  if (!mission || !form.typeId) {
    throw new Error('Formulario incompleto: falta misión o tipo de bloqueo.');
  }

  const block: Block = {
    // Fecha + número aleatorio para evitar ids repetidos si se crean 2 en el mismo ms.
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: form.name.trim(),
    enabled: form.enabled,
    days: form.days.map((on, i) => (on ? i : -1)).filter((i) => i >= 0),
    missionId: mission.id,
    missionTitle: mission.title,
    type: form.typeId,
    apps: form.apps,
    // normalizeWebsite + Set => sin vacíos ni repetidos
    websites: Array.from(
      new Set(
        form.websites
          .map(normalizeWebsite)
          .filter((w): w is string => w !== null),
      ),
    ),
    options: { ...form.options },
    createdAt: new Date().toISOString(),
  };

  if (form.typeId === 'regular') {
    if (!form.startTime || !form.endTime) throw new Error('Faltan las horas del bloqueo regular.');
    block.startTime = toHHmm(form.startTime);
    block.endTime = toHHmm(form.endTime);
  } else if (form.typeId === 'uso') {
    const minutes = parseUsageMinutes(form.usageValue, form.usageUnit);
    if (minutes === null) throw new Error('Tiempo de uso inválido.');
    block.usageMinutes = minutes;
  } else {
    // 'pasos': guardamos el id y una copia del título del paso.
    const step = steps.find((x) => x.id === form.stepId);
    if (!step) throw new Error('Falta elegir un paso válido.');
    block.stepId = step.id;
    block.stepTitle = step.title;
  }

  return block;
};

/* ───────────────────────── Formato para la lista ───────────────────────── */

/** 90 -> "1 h 30 min", 120 -> "2 h", 45 -> "45 min". */
export const formatMinutes = (total: number): string => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
};

/** Texto corto para la "píldora" morada de cada tarjeta. */
export const blockSummary = (b: Block): string => {
  if (b.type === 'regular' && b.startTime && b.endTime) return `${b.startTime} - ${b.endTime}`;
  if (b.type === 'uso' && b.usageMinutes) return `Tras ${formatMinutes(b.usageMinutes)}`;
  if (b.type === 'pasos' && b.stepTitle) return b.stepTitle;
  return '—';
};
