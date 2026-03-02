import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLLECTIONS = { USERS: 'utilisateurs' };

export const connexion = async (email, motDePasse) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, motDePasse);
    const user = userCredential.user;
    const profil = await getProfilComercant(user.uid);
    await AsyncStorage.setItem('userId', user.uid);
    return { success: true, user, profil };
  } catch (error) {
    return { success: false, error: traduireErreurAuth(error.code) };
  }
};

export const inscription = async ({ nom, boutique, email, telephone, motDePasse }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
    const user = userCredential.user;
    await updateProfile(user, { displayName: nom });
    const profilData = {
      uid: user.uid,
      nom,
      boutique,
      email,
      telephone,
      createdAt: new Date().toISOString(),
      plan: 'gratuit',
      produitsMax: 20,
    };
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profilData);
    await AsyncStorage.setItem('userId', user.uid);
    return { success: true, user, profil: profilData };
  } catch (error) {
    return { success: false, error: traduireErreurAuth(error.code) };
  }
};

export const deconnexion = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('userId');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProfilComercant = async (uid) => {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const observerAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};

const traduireErreurAuth = (code) => {
  const erreurs = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/weak-password': 'Mot de passe trop faible (6 caractères minimum).',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
    'auth/network-request-failed': 'Vérifiez votre connexion internet.',
  };
  return erreurs[code] || 'Une erreur est survenue. Réessayez.';
};