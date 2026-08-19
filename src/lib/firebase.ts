// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Invocamos las variables desde el .env.local de forma segura
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializamos la aplicación
const app = initializeApp(firebaseConfig);

// Exportamos los 3 motores que usaremos en tu PWA
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// --- MAGIA DEL ENTORNO LOCAL ---
// Si estamos en "npm run dev", nos conectamos al Emulador
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log("🔥 Conectado al Emulador Local");
  } catch (e) {
    console.error("Error conectando al emulador:", e);
  }
}