// types/blocks.ts
// Tipos compartidos por toda la funcionalidad de "Bloqueos".

/** Tipos de bloqueo disponibles. 'pasos' está reservado para una fase futura. */
export type BlockTypeId = 'regular' | 'uso' | 'pasos';

/** Unidad en la que el usuario escribe el tiempo de uso. */
export type UsageUnit = 'min' | 'h';

/**
 * Misión (tarea) creada en la pantalla Task_home.
 * Es un subconjunto de la interfaz `Task` de esa pantalla, por eso solo
 * pedimos lo que necesitamos: id, título y fecha opcional.
 */
export interface Mission {
  id: string;
  title: string;
  date?: string;
}

/** Aplicación instalada que el usuario eligió bloquear. */
export interface BlockedApp {
  /** Identificador único en Android, ej. "com.whatsapp". */
  packageName: string;
  /** Nombre visible, ej. "WhatsApp". */
  appName: string;
}

/** Bloqueo ya guardado en el almacenamiento del teléfono. */
export interface Block {
  id: string;
  name: string;
  /** Interruptor On/Off del formulario. */
  enabled: boolean;
  /** Días activos como índices: 0 = Lunes ... 6 = Domingo. Ordenados. */
  days: number[];
  missionId: string;
  /** Copia del título de la misión al momento de crear el bloqueo
   *  (así la lista sigue mostrando algo aunque la misión se borre). */
  missionTitle: string;
  type: BlockTypeId;
  /** Solo bloqueo regular. Formato 24 h "HH:mm", ej. "09:30". */
  startTime?: string;
  endTime?: string;
  /** Solo bloqueo por uso. Siempre en minutos, sin importar la unidad elegida. */
  usageMinutes?: number;
  apps: BlockedApp[];
  /** Dominios normalizados, ej. "instagram.com". */
  websites: string[];
  /** Checkboxes inferiores (su lógica se implementará después). */
  options: Record<string, boolean>;
  /** Fecha de creación en formato ISO. */
  createdAt: string;
}

/** Estado crudo del formulario tal como lo maneja la pantalla. */
export interface BlockFormData {
  enabled: boolean;
  name: string;
  /** 7 posiciones (L..D) con true/false. */
  days: boolean[];
  missionId: string | null;
  typeId: BlockTypeId | null;
  startTime: Date | null;
  endTime: Date | null;
  /** Texto tal cual lo escribió el usuario (solo dígitos). */
  usageValue: string;
  usageUnit: UsageUnit;
  apps: BlockedApp[];
  /** Una entrada por campo de página web (puede haber vacías). */
  websites: string[];
  options: Record<string, boolean>;
}
