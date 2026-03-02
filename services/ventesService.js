import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateNumeroFacture } from '../utils/helpers';

const VENTES_COLLECTION = 'ventes';
const PRODUITS_COLLECTION = 'produits';

export const enregistrerVente = async (userId, { panier, modePaiement, totalAmount, clientNom = '' }) => {
  try {
    const batch = writeBatch(db);
    const numeroFacture = generateNumeroFacture();

    const articles = panier.map((item) => ({
      productId: item.id,
      nom: item.nom,
      prix: item.prixVente || item.prix,
      prixAchat: item.prixAchat || 0,
      quantite: item.quantite,
      sousTotal: (item.prixVente || item.prix) * item.quantite,
    }));

    panier.forEach((item) => {
      const produitRef = doc(db, PRODUITS_COLLECTION, item.id);
      batch.update(produitRef, {
        stock: increment(-item.quantite),
        updatedAt: new Date().toISOString(),
      });
    });

    const venteRef = doc(collection(db, VENTES_COLLECTION));
    const venteData = {
      id: venteRef.id,
      userId,
      numeroFacture,
      articles,
      totalAmount,
      modePaiement,
      statut: 'confirmee',
      clientNom,
      createdAt: new Date().toISOString(),
    };
    batch.set(venteRef, venteData);
    await batch.commit();

    return { success: true, vente: venteData, numeroFacture };
  } catch (error) {
    console.error('Erreur enregistrerVente:', error);
    return { success: false, error: error.message };
  }
};

export const observerVentes = (userId, callback) => {
  const q = query(
    collection(db, VENTES_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const ventes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(ventes);
  });
};

export const getVentes = async (userId, { debut, fin } = {}) => {
  try {
    const q = query(
      collection(db, VENTES_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    let ventes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (debut) ventes = ventes.filter((v) => new Date(v.createdAt) >= new Date(debut));
    if (fin) ventes = ventes.filter((v) => new Date(v.createdAt) <= new Date(fin));
    return ventes;
  } catch (error) {
    console.error('Erreur getVentes:', error);
    return [];
  }
};

export const getVentesJour = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await getVentes(userId, { debut: today });
  } catch (error) {
    console.error('Erreur getVentesJour:', error);
    return [];
  }
};

export const getStatsJour = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ventes = await getVentes(userId, { debut: today });

    const totalVentes = ventes.reduce((sum, v) => sum + v.totalAmount, 0);
    const nombreVentes = ventes.length;

    const venteParMode = {
      especes: ventes
        .filter((v) => v.modePaiement === 'especes')
        .reduce((s, v) => s + v.totalAmount, 0),
      mobile: ventes
        .filter((v) => ['mobile', 'nita', 'amana'].includes(v.modePaiement))
        .reduce((s, v) => s + v.totalAmount, 0),
    };

    // Calcul du vrai bénéfice basé sur prixAchat
    let beneficeEstime = 0;
    ventes.forEach((v) => {
      v.articles.forEach((a) => {
        if (a.prixAchat && a.prixAchat > 0) {
          beneficeEstime += (a.prix - a.prixAchat) * a.quantite;
        }
      });
    });

    const produitsStats = {};
    ventes.forEach((v) => {
      v.articles.forEach((a) => {
        if (!produitsStats[a.productId]) {
          produitsStats[a.productId] = { nom: a.nom, quantite: 0, revenu: 0 };
        }
        produitsStats[a.productId].quantite += a.quantite;
        produitsStats[a.productId].revenu += a.sousTotal;
      });
    });

    const topProduits = Object.values(produitsStats)
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);

    return { totalVentes, nombreVentes, venteParMode, topProduits, beneficeEstime };
  } catch (error) {
    console.error('Erreur getStatsJour:', error);
    return { totalVentes: 0, nombreVentes: 0, venteParMode: {}, topProduits: [], beneficeEstime: 0 };
  }
};

export const getStatsSemaine = async (userId) => {
  try {
    const sept = new Date();
    sept.setDate(sept.getDate() - 6);
    sept.setHours(0, 0, 0, 0);
    const ventes = await getVentes(userId, { debut: sept });
    const jours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const total = ventes
        .filter((v) => {
          const vd = new Date(v.createdAt);
          return vd.getDate() === d.getDate() && vd.getMonth() === d.getMonth();
        })
        .reduce((sum, v) => sum + v.totalAmount, 0);
      jours.push({ label, total });
    }
    return jours;
  } catch (error) {
    return [];
  }
};