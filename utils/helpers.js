import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatMontant = (montant) => {
  if (montant === null || montant === undefined) return '0 FCFA';
  return `${Number(montant).toLocaleString('fr-FR')} FCFA`;
};

export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  try {
    return format(new Date(date), formatStr, { locale: fr });
  } catch {
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy à HH:mm');
};

export const generateNumeroFacture = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-5);
  return `NB-${year}${month}${day}-${time}`;
};

export const calculerTotalPanier = (panier) => {
  return panier.reduce((total, item) => total + item.prix * item.quantite, 0);
};

export const calculerNombreArticles = (panier) => {
  return panier.reduce((total, item) => total + item.quantite, 0);
};

export const isStockFaible = (quantite, seuil = 5) => {
  return quantite <= seuil;
};

export const truncateText = (text, maxLength = 25) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const validateTelephone = (tel) => {
  const cleaned = tel.replace(/\s/g, '');
  return /^[0-9]{8}$/.test(cleaned);
};

export const calculerBenefice = (totalVentes, marge = 0.2) => {
  return totalVentes * marge;
};

export const groupVentesParProduit = (ventes) => {
  const stats = {};
  ventes.forEach((vente) => {
    vente.articles.forEach((article) => {
      if (!stats[article.productId]) {
        stats[article.productId] = {
          nom: article.nom,
          quantiteVendue: 0,
          totalRevenu: 0,
        };
      }
      stats[article.productId].quantiteVendue += article.quantite;
      stats[article.productId].totalRevenu += article.prix * article.quantite;
    });
  });
  return Object.values(stats).sort((a, b) => b.quantiteVendue - a.quantiteVendue);
};

export const filtrerVentesAujourdhui = (ventes) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ventes.filter((v) => new Date(v.createdAt) >= today);
};