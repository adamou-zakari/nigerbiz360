import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ─── AUTH ───────────────────────────────────────────
  user: null,
  profil: null,
  setUser: (user) => set({ user }),
  setProfil: (profil) => set({ profil }),
  logout: () => set({ user: null, profil: null, produits: [], ventes: [] }),

  // ─── PRODUITS ───────────────────────────────────────
  produits: [],
  setProduits: (produits) => set({ produits }),
  addProduit: (produit) => set((state) => ({ produits: [...state.produits, produit] })),
  updateProduit: (id, updates) =>
    set((state) => ({
      produits: state.produits.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProduit: (id) =>
    set((state) => ({ produits: state.produits.filter((p) => p.id !== id) })),

  // ─── PANIER ─────────────────────────────────────────
  panier: [],

  ajouterAuPanier: (produit) => {
    const panier = get().panier;
    const existant = panier.find((item) => item.id === produit.id);
    if (existant) {
      if (existant.quantite >= produit.stock) return;
      set({
        panier: panier.map((item) =>
          item.id === produit.id ? { ...item, quantite: item.quantite + 1 } : item
        ),
      });
    } else {
      if (produit.stock <= 0) return;
      set({ panier: [...panier, { ...produit, quantite: 1 }] });
    }
  },

  retirerDuPanier: (productId) => {
    const panier = get().panier;
    const item = panier.find((i) => i.id === productId);
    if (!item) return;
    if (item.quantite > 1) {
      set({
        panier: panier.map((i) =>
          i.id === productId ? { ...i, quantite: i.quantite - 1 } : i
        ),
      });
    } else {
      set({ panier: panier.filter((i) => i.id !== productId) });
    }
  },

  supprimerDuPanier: (productId) => {
    set({ panier: get().panier.filter((i) => i.id !== productId) });
  },

  viderPanier: () => set({ panier: [] }),

  // ─── VENTES ─────────────────────────────────────────
  ventes: [],
  setVentes: (ventes) => set({ ventes }),
  addVente: (vente) => set((state) => ({ ventes: [vente, ...state.ventes] })),

  // ─── STATS DASHBOARD ────────────────────────────────
  statsJour: null,
  setStatsJour: (stats) => set({ statsJour: stats }),
  statsSemaine: [],
  setStatsSemaine: (stats) => set({ statsSemaine: stats }),

  // ─── UI ─────────────────────────────────────────────
  loading: false,
  setLoading: (loading) => set({ loading }),

  // ─── GETTERS ────────────────────────────────────────
  getTotalPanier: () => {
    return get().panier.reduce((total, item) => total + item.prix * item.quantite, 0);
  },

  getNombreArticlesPanier: () => {
    return get().panier.reduce((total, item) => total + item.quantite, 0);
  },

  getProduitsStockFaible: () => {
    return get().produits.filter((p) => p.stock <= (p.seuilAlerte || 5));
  },
}));

export default useStore;