// services/installedApps.ts
// Obtiene las aplicaciones instaladas en el teléfono.

import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

/** App lista para mostrar en pantalla. */
export interface InstalledAppInfo {
  packageName: string;
  appName: string;
  /** Icono como data URI (base64). Puede no existir. */
  icon?: string;
}

export interface InstalledAppsResult {
  apps: InstalledAppInfo[];
  /** true cuando la lista es de ejemplo y NO son las apps reales del teléfono. */
  isDemo: boolean;
  /** Mensaje explicando por qué se usa la lista de demostración. */
  warning?: string;
}

/** Apps de ejemplo (solo para Expo Go / iOS / errores). */
const DEMO_APPS: InstalledAppInfo[] = [
  { packageName: 'com.whatsapp', appName: 'WhatsApp' },
  { packageName: 'com.instagram.android', appName: 'Instagram' },
  { packageName: 'com.facebook.katana', appName: 'Facebook' },
  { packageName: 'com.facebook.orca', appName: 'Messenger' },
  { packageName: 'org.telegram.messenger', appName: 'Telegram' },
  { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
  { packageName: 'com.twitter.android', appName: 'X' },
  { packageName: 'com.snapchat.android', appName: 'Snapchat' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube' },
  { packageName: 'com.netflix.mediaclient', appName: 'Netflix' },
  { packageName: 'com.spotify.music', appName: 'Spotify' },
  { packageName: 'com.android.chrome', appName: 'Chrome' },
];

/** Resultado en caché para no volver a escanear el teléfono en cada apertura. */
let cache: InstalledAppsResult | null = null;

const demo = (warning: string): InstalledAppsResult => ({
  apps: DEMO_APPS,
  isDemo: true,
  warning,
});

/**
 * Devuelve las apps instaladas (ordenadas por nombre, sin repetidos).
 * @param forceRefresh ignora la caché y vuelve a escanear.
 */
export const getInstalledApps = async (forceRefresh = false): Promise<InstalledAppsResult> => {
  if (cache && !forceRefresh) return cache;

  if (Platform.OS !== 'android') {
    return demo('iOS no permite listar las apps instaladas. Se muestra una lista de ejemplo.');
  }

  try {
    // Revisamos PRIMERO si el módulo nativo existe en esta app. En Expo Go no
    // existe; si lo importáramos igual, Expo mostraría una pantalla roja de
    // error en desarrollo. Con esta revisión simplemente usamos la lista de ejemplo.
    if (!requireOptionalNativeModule('ExpoAndroidAppList')) {
      return demo(
        'Estás en Expo Go, que no puede leer tus apps. Se muestra una lista de ejemplo. Usa un development build para ver las reales.',
      );
    }

    // Import dinámico: si el módulo nativo no existe (Expo Go) falla AQUÍ,
    // dentro del try/catch, y no tumba toda la aplicación al arrancar.
    const mod = await import('expo-android-app-list');
    // getAll() devuelve un arreglo de { packageName, appName, versionName, ... }.
    const raw: unknown = await mod.ExpoAndroidAppList.getAll();
    if (!Array.isArray(raw)) throw new Error('getAll() no devolvió una lista.');

    // Quitamos repetidos por packageName y entradas sin datos.
    const byPackage = new Map<string, InstalledAppInfo>();
    for (const item of raw) {
      const a = item as { packageName?: unknown; appName?: unknown };
      if (typeof a?.packageName !== 'string' || a.packageName === '') continue;
      if (byPackage.has(a.packageName)) continue;
      byPackage.set(a.packageName, {
        packageName: a.packageName,
        appName: typeof a.appName === 'string' && a.appName !== '' ? a.appName : a.packageName,
        // Este módulo no entrega iconos en la lista; se muestra un icono genérico.
      });
    }

    const apps = Array.from(byPackage.values()).sort((a, b) =>
      a.appName.localeCompare(b.appName, 'es', { sensitivity: 'base' }),
    );

    // Si el escaneo devolvió vacío algo falló (p. ej. falta el permiso).
    if (apps.length === 0) {
      return demo('No se encontraron apps. Revisa el permiso QUERY_ALL_PACKAGES. Se muestra una lista de ejemplo.');
    }

    cache = { apps, isDemo: false };
    return cache;
  } catch (e) {
    console.warn('[installedApps] No se pudo leer la lista real de apps:', e);
    return demo(
      'Para ver tus apps reales necesitas un development build (no Expo Go). Se muestra una lista de ejemplo.',
    );
  }
};
