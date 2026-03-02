import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDD5HhL92-k7l9wdu4CQVbLCNlkzmyWCBg",
  authDomain: "nigerbiz360.firebaseapp.com",
  projectId: "nigerbiz360",
  storageBucket: "nigerbiz360.firebasestorage.app",
  messagingSenderId: "604834116082",
  appId: "1:604834116082:web:e3dd4b3990039caa997b6b"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;