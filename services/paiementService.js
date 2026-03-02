export const MODES_PAIEMENT = {
  ESPECES: 'especes',
  MOBILE: 'mobile',
};

export const getLibellePaiement = (mode) => {
  const libelles = {
    especes: 'Espèces',
    mobile: 'Paiement mobile',
  };
  return libelles[mode] || 'Paiement mobile';
};

export const getCouleurPaiement = (mode) => {
  const couleurs = {
    especes: '#2E8B57',
    mobile: '#1565C0',
  };
  return couleurs[mode] || '#1565C0';
};