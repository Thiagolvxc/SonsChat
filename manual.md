# Manual del Proyecto SonsChat

## Descripción General

SonsChat es una aplicación móvil de mensajería en tiempo real para Android, desarrollada utilizando React Native y Expo. La aplicación permite a los usuarios registrarse, iniciar sesión, crear chats y enviar mensajes en tiempo real. Está integrada con Firebase para autenticación, base de datos (Firestore) y notificaciones push.

El proyecto está dividido en 4 entregables principales:
1. **Fundación y estructura**: Configuración de Expo, navegación, pantallas base y gestión de estado con Zustand.
2. **Autenticación**: Implementación de Firebase Auth para registro, login y sesión persistente.
3. **Mensajería en tiempo real**: Uso de Firestore para chats y mensajes en vivo.
4. **Notificaciones y pulido**: Integración de FCM para notificaciones, soporte multimedia (imágenes/voz) y optimizaciones finales.

## Tecnologías Utilizadas

- **React Native**: Framework principal para desarrollo móvil.
- **Expo**: Plataforma para desarrollo, construcción y despliegue de aplicaciones React Native.
- **Firebase**: 
  - Authentication: Para gestión de usuarios.
  - Firestore: Base de datos NoSQL en tiempo real.
  - Cloud Messaging (FCM): Para notificaciones push.
- **React Navigation**: Para navegación entre pantallas.
- **Zustand**: Para gestión de estado global.
- **TanStack Query (React Query)**: Para gestión de datos y caching.
- **AsyncStorage**: Para almacenamiento local persistente.
- **Expo AV**: Para manejo de audio/video.
- **Expo Image Picker**: Para selección de imágenes.
- **Vitest**: Para pruebas unitarias con cobertura.

## Estructura del Proyecto

```
sonschat/
├── app.config.js          # Configuración de Expo
├── App.js                 # Componente principal de la aplicación
├── app.json               # Configuración de la aplicación Expo
├── eas.json               # Configuración de Expo Application Services
├── firebase.json          # Configuración de Firebase
├── firestore.indexes.json # Índices de Firestore
├── firestore.rules        # Reglas de seguridad de Firestore
├── index.js               # Punto de entrada de la aplicación
├── package.json           # Dependencias y scripts del proyecto
├── README.md              # Documentación básica del proyecto
├── android/               # Configuración específica de Android
├── assets/                # Recursos estáticos (iconos, imágenes)
├── coverage/              # Reportes de cobertura de pruebas
├── src/                   # Código fuente principal
│   ├── components/        # Componentes reutilizables
│   │   ├── AppTextField.js
│   │   ├── Button.js
│   │   └── index.js
│   ├── constants/         # Constantes de la aplicación
│   │   ├── routes.js
│   │   └── index.js
│   ├── hooks/             # Hooks personalizados
│   │   ├── useChatsList.js
│   │   ├── useMessagesList.js
│   │   └── index.js
│   ├── navigation/        # Configuración de navegación
│   │   ├── AppNavigator.js
│   │   ├── navigationRef.js
│   │   └── index.js
│   ├── query/             # Configuración de React Query
│   │   ├── queryClient.js
│   │   └── index.js
│   ├── screens/           # Pantallas de la aplicación
│   │   ├── ChatScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── NewChatScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── SplashScreen.js
│   │   └── index.js
│   ├── services/          # Servicios y APIs
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   ├── firebase.js
│   │   ├── mediaService.js
│   │   ├── notificationService.js
│   │   └── index.js
│   ├── stores/            # Stores de Zustand
│   │   ├── useAppStore.js
│   │   ├── useAuthStore.js
│   │   └── index.js
│   ├── theme/             # Tema y estilos
│   │   ├── colors.js
│   │   ├── index.js
│   │   └── (otros archivos de tema)
│   └── utils/             # Utilidades
│       ├── authHelpers.js
│       ├── chatHelpers.js
│       ├── firebaseHelpers.js
│       ├── uiHelpers.js
│       └── index.js
└── tests/                 # Pruebas
    ├── screens/
    └── services/
```

## Configuración del Entorno de Desarrollo

### Prerrequisitos

- Node.js (versión recomendada: 18.x o superior)
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (para desarrollo Android)
- Cuenta de Firebase

### Instalación

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd sonschat
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno de Firebase:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id
   ```

4. Configura Firebase:
   - Crea un proyecto en Firebase Console
   - Habilita Authentication, Firestore y Cloud Messaging
   - Descarga el archivo de configuración y actualiza `app.json` si es necesario

## Ejecución de la Aplicación

### Desarrollo Local

- Inicia el servidor de desarrollo:
  ```
  npm start
  ```

- Para Android:
  ```
  npm run android
  ```

- Para iOS (si aplica):
  ```
  npm run ios
  ```

- Para web:
  ```
  npm run web
  ```

### Pruebas

- Ejecuta todas las pruebas:
  ```
  npm test
  ```

- Ejecuta pruebas en modo watch:
  ```
  npm run test:watch
  ```

## Arquitectura de la Aplicación

### Navegación

La aplicación utiliza React Navigation con un stack navigator. La navegación se configura en `src/navigation/AppNavigator.js`. Las rutas están definidas en `src/constants/routes.js`.

### Gestión de Estado

Se utiliza Zustand para la gestión de estado global. Los stores principales son:
- `useAuthStore`: Gestiona el estado de autenticación del usuario
- `useAppStore`: Gestiona el estado general de la aplicación

### Servicios

Los servicios principales incluyen:
- `authService.js`: Funciones de autenticación
- `chatService.js`: Funciones para gestión de chats y mensajes
- `firebase.js`: Configuración e inicialización de Firebase
- `mediaService.js`: Manejo de multimedia (imágenes, audio)
- `notificationService.js`: Gestión de notificaciones push

### Pantallas Principales

- **SplashScreen**: Pantalla de carga inicial
- **LoginScreen**: Inicio de sesión
- **RegisterScreen**: Registro de nuevos usuarios
- **HomeScreen**: Lista de chats
- **ChatScreen**: Conversación individual
- **NewChatScreen**: Crear nuevo chat
- **ProfileScreen**: Perfil del usuario

### Componentes Reutilizables

- **AppTextField**: Campo de texto personalizado
- **Button**: Botón personalizado

### Hooks Personalizados

- `useChatsList`: Hook para obtener la lista de chats
- `useMessagesList`: Hook para obtener mensajes de un chat

## Integración con Firebase

### Authentication

Utiliza Firebase Auth para:
- Registro con email/contraseña
- Inicio de sesión
- Sesión persistente con AsyncStorage

### Firestore

Base de datos NoSQL para:
- Almacenamiento de usuarios
- Chats y mensajes
- Datos en tiempo real

### Cloud Messaging

Para notificaciones push en dispositivos móviles.

## Despliegue

### Expo Application Services (EAS)

La aplicación está configurada para despliegue con EAS:

- Archivo de configuración: `eas.json`
- Proyecto ID: c6771708-3dc9-4067-b6cb-22d620760b33

### Construcción para Producción

- Construye para Android:
  ```
  eas build -p android --profile production
  ```

- Actualización OTA:
  ```
  npm run eas:update
  ```

## Pruebas

El proyecto utiliza Vitest para pruebas unitarias. Los archivos de prueba están en la carpeta `tests/`.

- Cobertura de pruebas generada en `coverage/`

## Configuración de Android

- Package: `com.sonschat.app`
- Versión: 2.0.0
- Icono adaptativo configurado
- Splash screen personalizado

## Variables de Entorno

Las configuraciones sensibles se manejan a través de variables de entorno de Expo:
- Todas las claves de Firebase se configuran como `EXPO_PUBLIC_FIREBASE_*`

## Notas Adicionales

- La aplicación está optimizada para Android
- Soporte para tabletas en iOS (configurado en `app.json`)
- Runtime version policy: appVersion para actualizaciones OTA
- Tema claro por defecto

## Contribución

Para contribuir al proyecto:
1. Crea una rama para tu feature
2. Implementa los cambios
3. Ejecuta las pruebas
4. Crea un pull request