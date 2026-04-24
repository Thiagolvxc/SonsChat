# Pruebas

Este archivo documenta las pruebas unitarias y la cobertura

## Estructura de pruebas

- `tests/services/firebase.test.js`
  - Verifica la normalización de la configuración de Firebase.
- `tests/services/authService.test.js`
  - Verifica la traducción de códigos de error de Firebase Auth y el manejo de errores desconocidos.
- `tests/services/chatService.test.js`
  - Verifica que el identificador de chat directo sea determinista.
- `tests/screens/homeScreen.test.js`
  - Prueba la lógica de título de chat y el formato de vista previa.
- `tests/screens/chatScreen.test.js`
  - Prueba el formateo de la hora de mensajes.

### Notificaciones Push

Se ha implementado un sistema de notificaciones push usando Firebase Cloud Messaging (FCM):

- **Inicialización**: Solicita permisos y configura listeners para mensajes entrantes.
- **Tokens FCM**: Obtiene y guarda tokens de dispositivos en Firestore.
- **Envío de notificaciones**: Envía notificaciones cuando se recibe un nuevo mensaje.
- **Recepción**: Maneja mensajes en foreground y background, mostrando alertas.

#### Archivos relacionados:
- `src/services/notificationService.js` — Servicio principal para manejar notificaciones.
- `App.js` — Inicialización de notificaciones al inicio de la app.
- `src/services/chatService.js` — Integración para enviar notificaciones al enviar mensajes.

#### Configuración:
- `app.json` — Configuración de permisos para notificaciones en iOS y Android.
- `package.json` — Dependencias `@react-native-firebase/messaging` y `@react-native-firebase/app`.

### Multimedia: Imágenes y Mensajes de Voz

Se han agregado funcionalidades para enviar imágenes y mensajes de voz:

- **Imágenes**: Seleccionar desde galería, subir a Firebase Storage, mostrar en chat.
- **Voz**: Grabar audio, subir a Storage, reproducir en chat.
- **UI**: Botones en la barra de entrada para acceder a estas funciones.

#### Archivos relacionados:
- `src/services/mediaService.js` — Servicio para manejo de multimedia (upload, grabación, reproducción).
- `src/services/chatService.js` — Funciones `sendImageMessage` y `sendVoiceMessage`.
- `src/screens/ChatScreen.js` — UI actualizada para mostrar multimedia y botones.

#### Configuración:
- `app.json` — Permisos para cámara, galería y micrófono.
- `package.json` — Dependencias `expo-image-picker`, `expo-av`, `cloudinary`.

## Comandos de prueba

- `npm test` — ejecuta todas las pruebas y genera un reporte de cobertura.
- `npm run test:watch` — ejecuta las pruebas en modo observador.

## Cobertura

Las pruebas están diseñadas para cubrir:

- Utilidades de servicio (`firebase`, `authService`, `chatService`).
- Helpers de pantalla (`HomeScreen`, `ChatScreen`).
- La configuración base de pruebas con `vitest`.