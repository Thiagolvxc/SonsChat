const fs = require('fs');
const path = require('path');

/** Carga variables desde el archivo .env en el directorio raíz si no están en process.env. */
function loadDotEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (!value) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

// loadDotEnv();

loadDotEnv();

/** Quita BOM, espacios y comillas envolventes del .env (p. ej. KEY="valor" → valor). */
function envStr(name) {
  let v = process.env[name];
  if (v == null || v === '') return undefined;
  v = String(v).replace(/^\uFEFF/, '').trim();
  for (let i = 0; i < 4; i += 1) {
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1).trim();
    } else break;
  }
  return v || undefined;
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    firebase: {
      apiKey: envStr('EXPO_PUBLIC_FIREBASE_API_KEY'),
      authDomain: envStr('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: envStr('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: envStr('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: envStr('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: envStr('EXPO_PUBLIC_FIREBASE_APP_ID'),
      measurementId: envStr('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
    },
    cloudinary: {
      cloudName: envStr('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'),
      uploadPreset: envStr('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET'),
    },
  },
});
