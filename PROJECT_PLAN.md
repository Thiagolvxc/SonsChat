# SonsChat — Plan de 4 entregables

Aplicación móvil de mensajería para Android desarrollada con React Native.

---

## Entregable 1: Fundación y estructura

**Objetivo:** Configurar el proyecto y definir la base de la aplicación.

| Tarea | Tecnologías |
|-------|-------------|
| Inicializar proyecto con Expo (React Native) | Expo, React Native |
| Configurar React Navigation (stack, tabs) | React Navigation |
| Definir estructura de carpetas (`/screens`, `/components`, `/services`, `/stores`) | — |
| Implementar pantallas base (Splash, Login placeholder, Home placeholder) | — |
| Configurar Zustand para estado global | Zustand |
| Configurar tema, estilos base y componentes UI reutilizables | React Native Paper |

**Entregable:** App navegable con pantallas base y estructura lista para iterar.

---

## Entregable 2: Autenticación

**Objetivo:** Permitir registro e inicio de sesión de usuarios.

| Tarea | Tecnologías |
|-------|-------------|
| Configurar Firebase en el proyecto | Firebase |
| Implementar Firebase Auth (email/contraseña) | Firebase Auth |
| Pantallas: Registro y Login | — |
| Persistencia de sesión (AsyncStorage o similar) | AsyncStorage |
| Protección de rutas (usuarios no autenticados) | React Navigation |
| Pantalla de perfil básico | — |

**Entregable:** Usuarios pueden registrarse, iniciar sesión y cerrar sesión.

---

## Entregable 3: Mensajería en tiempo real

**Objetivo:** Funcionalidad central de chat entre usuarios.

| Tarea | Tecnologías |
|-------|-------------|
| Configurar Firestore (estructura: users, chats, messages) | Firestore |
| Pantalla de lista de conversaciones | React Query, Firestore |
| Pantalla de chat individual con mensajes en tiempo real | Firestore listeners |
| Enviar y recibir mensajes de texto | Firestore |
| Búsqueda/creación de conversaciones con otros usuarios | Firestore |
| Indicadores de mensaje leído/enviado | Firestore |

**Entregable:** Chat funcional en tiempo real entre usuarios.

---

## Entregable 4: Notificaciones y pulido

**Objetivo:** Notificaciones push, multimedia y mejoras finales.

| Tarea | Tecnologías |
|-------|-------------|
| Configurar Firebase Cloud Messaging (FCM) | FCM |
| Push notifications cuando llega un mensaje nuevo | FCM, Firebase Functions |
| Envío de imágenes en el chat | react-native-image-picker, Firestore Storage |
| Mensajes de voz (grabar/reproducir) | expo-av |
| Soporte offline básico | WatermelonDB o cache con React Query |
| Refactor y optimización de estado | Zustand, React Query |
| Pruebas en dispositivo real y ajustes finales | — |

**Entregable:** App con notificaciones, multimedia y experiencia de uso pulida.

---

## Resumen de dependencias por entregable

| Entregable | Dependencias principales |
|------------|--------------------------|
| 1 | expo, react-navigation, zustand, react-native-paper |
| 2 | @react-native-firebase/app, @react-native-firebase/auth, @react-native-async-storage/async-storage |
| 3 | @react-native-firebase/firestore, @tanstack/react-query |
| 4 | @react-native-firebase/messaging, react-native-image-picker, expo-av |
