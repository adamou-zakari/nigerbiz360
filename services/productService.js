import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'produits';

export const observerProduits = (userId, callback) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('nom', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const produits = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(produits);
  });
};

export const getProduits = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('nom', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur getProduits:', error);
    return [];
  }
};

export const ajouterProduit = async (userId, produit) => {
  try {
    const data = {
      ...produit,
      userId,
      prix: Number(produit.prix),
      stock: Number(produit.stock),
      seuilAlerte: Number(produit.seuilAlerte || 5),
      actif: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, COLLECTION), data);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const modifierProduit = async (productId, updates) => {
  try {
    const docRef = doc(db, COLLECTION, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const supprimerProduit = async (productId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProduitsStockFaible = async (userId) => {
  try {
    const produits = await getProduits(userId);
    return produits.filter((p) => p.stock <= p.seuilAlerte);
  } catch (error) {
    return [];
  }
};