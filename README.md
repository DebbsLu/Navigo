# Navigo


**Navigo** es una aplicación móvil desarrollada con React Native y Expo, orientada a la navegación interactiva y renderizado de canvas basándose en nodos o fragmentos (*chunk nodes*)[cite: 10]. Permite interactuar mediante gestos táctiles con capas de lienzo, gestionar menús flotantes e inspeccionar proximidades e información detallada de nodos.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React Native (Expo SDK 52)
- **Enrutamiento:** Expo Router
- **Lenguaje:** TypeScript
- **Gestión de Gestos & Animaciones:** `react-native-gesture-handler` y `react-native-reanimated`
- **Plataformas Soporte:** Android / iOS / Web

---

## 📁 Estructura del Proyecto

```text
Navigo/
├── assets/
│   ├── textures/
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── src/
│   ├── components/
│   │   ├── BtnCircleBig.tsx
│   │   ├── BtnCircleSmall.tsx
│   │   ├── BtnClose.tsx
│   │   ├── BtnLargeModal.tsx
│   │   ├── CanvasGestureLayer.tsx
│   │   ├── CanvasGestureLayerWithMenu.tsx
│   │   ├── CanvasMenu.tsx
│   │   ├── ChunkNode.tsx
│   │   ├── CustomModal.tsx
│   │   ├── TexturedScreen.tsx
│   │   ├── ViewBtnsMenu.tsx
│   │   ├── ViewEncabezado.tsx
│   │   ├── ViewInfoProxima.tsx
│   │   └── ViewLista.tsx
│   └── screens/
│       ├── Blocks.tsx
│       ├── Infinity_canvas copy.tsx
│       ├── Infinity_canvas.tsx
│       ├── Reminders.tsx
│       └── Task_home.tsx
├── .gitignore
├── AGENTS.md
├── app.json
├── App.tsx
├── index.ts
├── LICENSE

## 🚀 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu entorno de desarrollo:

- **Node.js** (versión 18.0 o superior recomendada)
- **npm** o **yarn**
- Aplicación **Expo Go** en tu dispositivo físico (iOS o Android) o un emulador/simulador configurado.

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/DebbsLu/Navigo.git](https://github.com/DebbsLu/Navigo.git)
   cd Navigo
2. **Instalar las dependencias:**
   ```bash
   npm install
3. **Iniciar el servidor de desarrollo de Expo:**
   ```bash
   npx expo start

## 📱 Ejecución de la Aplicación

Una vez iniciado el servidor de Expo, puedes interactuar con la app mediante los siguientes comandos en la terminal:

- **Dispositivo Físico:** Escanea el código QR generado en la terminal con la cámara (iOS) o la app **Expo Go** (Android).
- **Emulador de Android:** Presiona `a` en la terminal.
- **Simulador de iOS:** Presiona `i` en la terminal.
- **Modo Web:** Presiona `w` para abrir la versión en el navegador.
├── package-lock.json
├── package.json
└── tsconfig.json
