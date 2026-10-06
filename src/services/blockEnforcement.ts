// ============================================================
// IMPORTACIONES
// ============================================================

// NativeModules permite acceder a módulos nativos de Android
// registrados en React Native.
//
// En nuestro caso accederemos a:
//
// NativeModules.BlockEnforcement
//
import { NativeModules } from 'react-native';


// ============================================================
// DEFINICIÓN DEL MÓDULO NATIVO
// ============================================================

// Le indicamos a TypeScript qué funciones esperamos encontrar
// dentro de nuestro módulo nativo.
//
// Estas funciones corresponden a los métodos que creamos en:
//
// BlockEnforcementModule.kt
//
interface BlockEnforcementNativeModule {

  /**
   * Envía la lista de bloqueos desde React Native hacia Android.
   *
   * Android los almacenará en SharedPreferences para que el
   * AccessibilityService pueda consultarlos aunque Navigo
   * no esté abierto.
   */
  syncBlocks(blocks: unknown[]): void;

  /**
   * Abre la configuración de Accesibilidad de Android.
   *
   * El usuario podrá activar manualmente el servicio de Navigo.
   */
  openAccessibilitySettings(): void;

  /**
   * Comprueba si el AccessibilityService de Navigo está
   * actualmente activado.
   */
  isAccessibilityServiceEnabled(): Promise<boolean>;
}


// ============================================================
// OBTENER EL MÓDULO NATIVO
// ============================================================

// NativeModules contiene los módulos nativos registrados
// en React Native.
//
// Nuestro módulo se llamará:
//     BlockEnforcement
//
// Usamos una conversión de tipo porque TypeScript no conoce
// automáticamente los módulos nativos personalizados que
// agregamos al proyecto.
//
const BlockEnforcement =
  NativeModules.BlockEnforcement as BlockEnforcementNativeModule;


// ============================================================
// COMPROBACIÓN DEL MÓDULO
// ============================================================

// Si el módulo no está disponible, normalmente significa que:
//
// - todavía no se registró en MainApplication.kt,
// - no se recompiló la aplicación Android,
// - o existe algún problema con el registro del módulo.
//
// Esta comprobación nos ayuda a detectar el problema rápidamente.
//
function ensureNativeModule(): BlockEnforcementNativeModule {

  if (!BlockEnforcement) {

    throw new Error(
      'BlockEnforcementModule no está disponible. ' +
      'Comprueba que BlockEnforcementPackage esté registrado ' +
      'en MainApplication.kt y vuelve a compilar la aplicación.'
    );
  }

  return BlockEnforcement;
}


// ============================================================
// SINCRONIZAR BLOQUEOS
// ============================================================

/**
 * Envía los bloqueos guardados por React Native hacia Android.
 *
 * Uso posterior desde Blocks.tsx:
 *
 *     await syncBlocksWithAndroid(blocks);
 *
 * De esta manera tendremos dos lugares:
 *
 * React Native:
 *     AsyncStorage
 *
 * Android:
 *     SharedPreferences
 */
export function syncBlocksWithAndroid(
  blocks: unknown[]
): void {

  const nativeModule = ensureNativeModule();

  nativeModule.syncBlocks(blocks);
}


// ============================================================
// ABRIR CONFIGURACIÓN DE ACCESIBILIDAD
// ============================================================

/**
 * Abre directamente la pantalla de configuración de
 * Accesibilidad de Android.
 *
 * Posteriormente podremos colocar un botón en Navigo como:
 *
 *     "Activar bloqueo de aplicaciones"
 */
export function openAccessibilitySettings(): void {

  const nativeModule = ensureNativeModule();

  nativeModule.openAccessibilitySettings();
}


// ============================================================
// COMPROBAR PERMISO DE ACCESIBILIDAD
// ============================================================

/**
 * Comprueba si el servicio de accesibilidad de Navigo
 * está activado.
 *
 * Devuelve:
 *
 *     true  → servicio activado
 *     false → servicio desactivado
 */
export function isAccessibilityServiceEnabled(): Promise<boolean> {

  const nativeModule = ensureNativeModule();

  return nativeModule.isAccessibilityServiceEnabled();
}