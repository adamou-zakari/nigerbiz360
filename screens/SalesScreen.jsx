import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, ScrollView, Alert, StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { observerProduits } from '../services/productService';
import { enregistrerVente } from '../services/ventesService';
import { MODES_PAIEMENT } from '../services/paiementService';
import useStore from '../store/useStore';
import { formatMontant, isStockFaible } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const MODES = [
  {
    mode: MODES_PAIEMENT.ESPECES,
    label: 'Espèces',
    desc: 'Le client paye en billets',
    couleur: COLORS.success,
    icone: 'cash-outline',
  },
  {
    mode: MODES_PAIEMENT.MOBILE,
    label: 'Paiement mobile',
    desc: 'Le client paye depuis son téléphone',
    couleur: COLORS.nita,
    icone: 'phone-portrait-outline',
  },
];

const SalesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    user, profil, produits, setProduits, panier,
    ajouterAuPanier, retirerDuPanier, supprimerDuPanier,
    viderPanier, getTotalPanier, getNombreArticlesPanier,
  } = useStore();
  const [recherche, setRecherche] = useState('');
  const [modalPanier, setModalPanier] = useState(false);
  const [modalPaiement, setModalPaiement] = useState(false);
  const [modePaiement, setModePaiement] = useState(MODES_PAIEMENT.ESPECES);
  const [nomClient, setNomClient] = useState('');
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const panierAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = observerProduits(user.uid, setProduits);
    return () => unsubscribe();
  }, [user?.uid]);

  const produitsFiltres = produits.filter((p) =>
    p.stock > 0 && p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const animerPanier = () => {
    Animated.sequence([
      Animated.spring(panierAnimation, { toValue: 1.3, useNativeDriver: true, speed: 20 }),
      Animated.spring(panierAnimation, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const handleAjouter = (produit) => {
    ajouterAuPanier(produit);
    animerPanier();
  };

  const validerPaiement = async () => {
    if (panier.length === 0) return;
    setPaiementEnCours(true);
    try {
      const result = await enregistrerVente(user.uid, {
        panier,
        modePaiement,
        totalAmount: getTotalPanier(),
        clientNom: nomClient,
      });
      if (result.success) {
        viderPanier();
        setModalPaiement(false);
        setModalPanier(false);
        setNomClient('');
        setModePaiement(MODES_PAIEMENT.ESPECES);
        navigation.navigate('Facture', {
          vente: result.vente,
          boutique: profil?.boutique,
        });
      } else {
        Alert.alert('Erreur', result.error || 'Vente non enregistrée. Réessayez.');
      }
    } finally {
      setPaiementEnCours(false);
    }
  };

  const renderProduit = ({ item }) => {
    const qteInPanier = panier.find((p) => p.id === item.id)?.quantite || 0;
    const stockFaible = isStockFaible(item.stock, item.seuilAlerte);
    return (
      <View style={[styles.produitCard, qteInPanier > 0 && styles.produitCardActif]}>
        <View style={styles.produitAvatarZone}>
          <Text style={styles.produitAvatarTexte}>{item.nom.charAt(0).toUpperCase()}</Text>
          {stockFaible && <View style={styles.stockAlerteDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.produitNom} numberOfLines={2}>{item.nom}</Text>
          <Text style={styles.produitPrix}>{formatMontant(item.prix)}</Text>
          <Text style={[styles.produitStock, {
            color: stockFaible ? COLORS.error : COLORS.textSecondary
          }]}>
            {item.stock} en stock
          </Text>
        </View>
        <View style={styles.qteControls}>
          {qteInPanier > 0 && (
            <>
              <TouchableOpacity
                onPress={() => retirerDuPanier(item.id)}
                style={styles.qteBtn}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qteTexte}>{qteInPanier}</Text>
            </>
          )}
          <TouchableOpacity
            onPress={() => handleAjouter(item)}
            style={[styles.qteBtn, styles.qteBtnAjouter]}
            disabled={qteInPanier >= item.stock}
          >
            <Ionicons
              name="add"
              size={18}
              color={qteInPanier >= item.stock ? COLORS.textLight : COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const nombreArticles = getNombreArticlesPanier();
  const total = getTotalPanier();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* EN-TÊTE */}
      <View style={styles.entete}>
        <View>
          <Text style={styles.titrePage}>Nouvelle Vente</Text>
          <Text style={styles.sousTitre}>
            {produits.filter(p => p.stock > 0).length} produits disponibles
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalPanier(true)}
          style={styles.boutonPanier}
          activeOpacity={0.85}
        >
          <Animated.View style={{ transform: [{ scale: panierAnimation }] }}>
            <Ionicons name="cart" size={24} color={COLORS.white} />
          </Animated.View>
          {nombreArticles > 0 && (
            <View style={styles.badgePanier}>
              <Text style={styles.badgePanierTexte}>{nombreArticles}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* RECHERCHE */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un produit..."
          value={recherche}
          onChangeText={setRecherche}
          placeholderTextColor={COLORS.textLight}
        />
        {recherche ? (
          <TouchableOpacity onPress={() => setRecherche('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* LISTE PRODUITS */}
      <FlatList
        data={produitsFiltres}
        keyExtractor={(item) => item.id}
        renderItem={renderProduit}
        contentContainerStyle={{
          padding: SPACING.lg,
          gap: SPACING.sm,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.videTexte}>Aucun produit disponible</Text>
            <Text style={styles.videDesc}>
              Ajoutez des produits dans l'onglet Produits
            </Text>
          </View>
        }
      />

      {/* BARRE TOTAL */}
      {nombreArticles > 0 && (
        <View style={[styles.totalBar, { paddingBottom: insets.bottom + SPACING.md }]}>
          <View>
            <Text style={styles.totalBarLabel}>
              {nombreArticles} article{nombreArticles > 1 ? 's' : ''}
            </Text>
            <Text style={styles.totalBarMontant}>{formatMontant(total)}</Text>
          </View>
          <TouchableOpacity
            style={styles.boutonValider}
            onPress={() => setModalPanier(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.boutonValiderTexte}>Voir panier</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL PANIER */}
      <Modal visible={modalPanier} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.modalEntete}>
            <Text style={styles.modalTitre}>Mon Panier</Text>
            <TouchableOpacity onPress={() => setModalPanier(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {panier.length === 0 ? (
            <View style={styles.vide}>
              <Ionicons name="cart-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.videTexte}>Panier vide</Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm }}
              >
                {panier.map((item) => (
                  <View key={item.id} style={styles.panierItem}>
                    <Text style={styles.panierItemNom} numberOfLines={1}>
                      {item.nom}
                    </Text>
                    <View style={styles.panierItemControls}>
                      <TouchableOpacity
                        onPress={() => retirerDuPanier(item.id)}
                        style={styles.ctrlBtn}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.panierItemQte}>{item.quantite}</Text>
                      <TouchableOpacity
                        onPress={() => ajouterAuPanier(item)}
                        style={styles.ctrlBtn}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.panierItemSousTotal}>
                      {formatMontant(item.prix * item.quantite)}
                    </Text>
                    <TouchableOpacity onPress={() => supprimerDuPanier(item.id)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TextInput
                  style={styles.champClient}
                  placeholder="Nom du client (optionnel)"
                  value={nomClient}
                  onChangeText={setNomClient}
                  placeholderTextColor={COLORS.textLight}
                />
              </ScrollView>

              <View style={[styles.panierFooter, { paddingBottom: insets.bottom + SPACING.md }]}>
                <View style={styles.panierTotal}>
                  <Text style={styles.panierTotalLabel}>TOTAL</Text>
                  <Text style={styles.panierTotalMontant}>{formatMontant(total)}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <TouchableOpacity
                    style={styles.boutonVider}
                    onPress={() => { viderPanier(); setModalPanier(false); }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    <Text style={{ color: COLORS.error, fontWeight: '700' }}>Vider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.boutonPayer, { flex: 1 }]}
                    onPress={() => { setModalPanier(false); setModalPaiement(true); }}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="card-outline" size={20} color={COLORS.white} />
                    <Text style={styles.boutonPayerTexte}>Choisir paiement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* MODAL PAIEMENT */}
      <Modal visible={modalPaiement} animationType="slide" presentationStyle="pageSheet">
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          contentContainerStyle={{ padding: SPACING.xl, paddingTop: SPACING.xxxl }}
        >
          <View style={styles.modalEntete}>
            <Text style={styles.modalTitre}>Mode de paiement</Text>
            <TouchableOpacity onPress={() => { setModalPaiement(false); setModalPanier(true); }}>
              <Ionicons name="arrow-back" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.totalRecap}>
            Total : <Text style={{ color: COLORS.primary }}>{formatMontant(total)}</Text>
          </Text>

          <View style={{ gap: SPACING.sm, marginBottom: SPACING.xl }}>
            {MODES.map(({ mode, label, desc, couleur, icone }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modePaiementOption,
                  modePaiement === mode && { borderColor: couleur, borderWidth: 2 },
                ]}
                onPress={() => setModePaiement(mode)}
                activeOpacity={0.8}
              >
                <View style={[styles.modeLogo, { backgroundColor: `${couleur}10` }]}>
                  <Ionicons name={icone} size={28} color={couleur} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeLabel, modePaiement === mode && { color: couleur }]}>
                    {label}
                  </Text>
                  <Text style={styles.modeDesc}>{desc}</Text>
                </View>
                {modePaiement === mode && (
                  <Ionicons name="checkmark-circle" size={24} color={couleur} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.boutonConfirmer, paiementEnCours && { opacity: 0.7 }]}
            onPress={validerPaiement}
            disabled={paiementEnCours}
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
            <Text style={styles.boutonConfirmerTexte}>
              {paiementEnCours ? 'Traitement...' : 'Confirmer la vente'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  titrePage: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  sousTitre: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  boutonPanier: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
  badgePanier: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.error, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  badgePanierTexte: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, marginHorizontal: SPACING.lg, paddingHorizontal: SPACING.md, height: 46, gap: SPACING.sm, marginBottom: SPACING.sm, ...SHADOWS.small },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  produitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.md, ...SHADOWS.small, borderWidth: 1.5, borderColor: 'transparent' },
  produitCardActif: { borderColor: COLORS.primary, backgroundColor: '#FFF8F0' },
  produitAvatarZone: { width: 52, height: 52, borderRadius: BORDER_RADIUS.md, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  produitAvatarTexte: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  stockAlerteDot: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.white },
  produitNom: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  produitPrix: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  produitStock: { fontSize: FONTS.sizes.xs, marginTop: 2 },
  qteControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  qteBtnAjouter: { backgroundColor: COLORS.primary },
  qteTexte: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  totalBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
  totalBarLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  totalBarMontant: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  boutonValider: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  boutonValiderTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  modalEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl, padding: SPACING.lg },
  modalTitre: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  vide: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  videTexte: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  videDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  panierItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, ...SHADOWS.small },
  panierItemNom: { flex: 1, fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  panierItemControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  ctrlBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  panierItemQte: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  panierItemSousTotal: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  champClient: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, height: 50, fontSize: FONTS.sizes.md, color: COLORS.text, backgroundColor: COLORS.surface, marginTop: SPACING.sm },
  panierFooter: { padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  panierTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  panierTotalLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  panierTotalMontant: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.primary },
  boutonVider: { height: 52, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, borderWidth: 2, borderColor: COLORS.error, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.sm },
  boutonPayer: { height: 52, backgroundColor: COLORS.secondary, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.sm },
  boutonPayerTexte: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  totalRecap: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl },
  modePaiementOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small, gap: SPACING.md },
  modeLogo: { width: 56, height: 56, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  modeDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  boutonConfirmer: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, height: 58, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium, flexDirection: 'row', gap: SPACING.sm },
  boutonConfirmerTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default SalesScreen;