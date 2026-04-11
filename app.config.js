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
  },
});
