import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Modal, Alert, StyleSheet, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { observerProduits, ajouterProduit, modifierProduit, supprimerProduit } from '../services/productService';
import useStore from '../store/useStore';
import { formatMontant } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const formVide = () => ({ nom: '', prixAchat: '', prixVente: '', stock: '' });

const ProductsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, produits, setProduits } = useStore();
  const [recherche, setRecherche] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReappro, setModalReappro] = useState(false);
  const [produitReappro, setProduitReappro] = useState(null);
  const [quantiteReappro, setQuantiteReappro] = useState('');
  const [produitEdit, setProduitEdit] = useState(null);
  const [form, setForm] = useState(formVide());
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = observerProduits(user.uid, setProduits);
    return () => unsubscribe();
  }, [user?.uid]);

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const ouvrirModal = (produit = null) => {
    setProduitEdit(produit);
    setForm(produit ? {
      nom: produit.nom,
      prixAchat: String(produit.prixAchat || ''),
      prixVente: String(produit.prixVente || produit.prix || ''),
      stock: String(produit.stock),
    } : formVide());
    setErreurs({});
    setModalVisible(true);
  };

  const ouvrirReappro = (produit) => {
    setProduitReappro(produit);
    setQuantiteReappro('');
    setModalReappro(true);
  };

  const validerForm = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.prixVente || isNaN(form.prixVente) || Number(form.prixVente) <= 0) e.prixVente = 'Prix de vente invalide';
    if (form.prixAchat && (isNaN(form.prixAchat) || Number(form.prixAchat) < 0)) e.prixAchat = 'Prix d\'achat invalide';
    if (form.prixAchat && Number(form.prixAchat) >= Number(form.prixVente)) e.prixAchat = 'Doit être inférieur au prix de vente';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Stock invalide';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const sauvegarder = async () => {
    if (!validerForm()) return;
    setLoading(true);
    const data = {
      nom: form.nom,
      prix: Number(form.prixVente),
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : 0,
      stock: Number(form.stock),
      seuilAlerte: 5,
      categorie: 'Autre',
    };
    const result = produitEdit
      ? await modifierProduit(produitEdit.id, data)
      : await ajouterProduit(user.uid, data);
    setLoading(false);
    if (result.success) {
      setModalVisible(false);
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  const confirmerReappro = async () => {
    if (!quantiteReappro || isNaN(quantiteReappro) || Number(quantiteReappro) <= 0) {
      Alert.alert('Erreur', 'Entrez une quantité valide.');
      return;
    }
    setLoading(true);
    await modifierProduit(produitReappro.id, {
      ...produitReappro,
      stock: produitReappro.stock + Number(quantiteReappro),
    });
    setLoading(false);
    setModalReappro(false);
    Alert.alert('Succès', `+${quantiteReappro} unités ajoutées pour ${produitReappro.nom}`);
  };

  const confirmerSuppression = (produit) => {
    Alert.alert(
      'Supprimer ce produit ?',
      `"${produit.nom}" sera définitivement supprimé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => supprimerProduit(produit.id) },
      ]
    );
  };

  const stockFaible = (p) => p.stock <= (p.seuilAlerte || 5);

  const getBenefice = (p) => {
    if (!p.prixAchat || p.prixAchat === 0) return null;
    return (p.prixVente || p.prix) - p.prixAchat;
  };

  const renderProduit = ({ item }) => {
    const faible = stockFaible(item);
    const benefice = getBenefice(item);
    return (
      <View style={[styles.produitItem, faible && styles.produitStockFaible]}>
        <View style={styles.produitAvatar}>
          <Text style={styles.produitAvatarTexte}>{item.nom.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.produitNom} numberOfLines={1}>{item.nom}</Text>
          <View style={styles.produitInfos}>
            <Text style={styles.produitPrix}>{formatMontant(item.prixVente || item.prix)}</Text>
            {benefice !== null && (
              <View style={styles.beneficeBadge}>
                <Ionicons name="trending-up-outline" size={11} color={COLORS.success} />
                <Text style={styles.beneficeTexte}>+{formatMontant(benefice)}</Text>
              </View>
            )}
          </View>
          <View style={[styles.stockBadge, {
            backgroundColor: faible ? `${COLORS.error}15` : `${COLORS.success}15`
          }]}>
            <Ionicons
              name={faible ? 'warning-outline' : 'cube-outline'}
              size={12}
              color={faible ? COLORS.error : COLORS.success}
            />
            <Text style={[styles.stockTexte, {
              color: faible ? COLORS.error : COLORS.success
            }]}>
              {item.stock} en stock
            </Text>
          </View>
        </View>
        <View style={styles.produitActions}>
          <TouchableOpacity onPress={() => ouvrirModal(item)} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => ouvrirReappro(item)}
            style={[styles.actionBtn, { backgroundColor: `${COLORS.success}10` }]}
          >
            <Ionicons name="add-circle-outline" size={16} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => confirmerSuppression(item)}
            style={[styles.actionBtn, { backgroundColor: `${COLORS.error}10` }]}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* EN-TÊTE */}
      <View style={styles.entete}>
        <View>
          <Text style={styles.titrePage}>Mon Stock</Text>
          <Text style={styles.sousTitre}>{produits.length} produits au total</Text>
        </View>
        <TouchableOpacity style={styles.boutonAjouter} onPress={() => ouvrirModal()} activeOpacity={0.85}>
          <Ionicons name="add" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* RECHERCHE */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
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

      {/* LISTE */}
      <FlatList
        data={produitsFiltres}
        keyExtractor={(item) => item.id}
        renderItem={renderProduit}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.videTitre}>Aucun produit</Text>
            <Text style={styles.videDesc}>Ajoutez votre premier produit en cliquant sur +</Text>
            <TouchableOpacity style={styles.boutonVideAjouter} onPress={() => ouvrirModal()}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.boutonVideAjouterTexte}>Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL AJOUTER / MODIFIER */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          contentContainerStyle={{ padding: SPACING.xl, paddingTop: SPACING.xxxl, gap: SPACING.md }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalEntete}>
            <Text style={styles.modalTitre}>
              {produitEdit ? 'Modifier le produit' : 'Nouveau produit'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ChampModal
            label="Nom du produit"
            placeholder="Ex: Riz basmati 5kg"
            icone="cube-outline"
            value={form.nom}
            onChangeText={(v) => setForm({ ...form, nom: v })}
            erreur={erreurs.nom}
          />
          <ChampModal
            label="Prix d'achat (FCFA) — optionnel"
            placeholder="Ex: 8000 — ce que vous avez payé"
            icone="arrow-down-circle-outline"
            value={form.prixAchat}
            onChangeText={(v) => setForm({ ...form, prixAchat: v })}
            keyboardType="numeric"
            erreur={erreurs.prixAchat}
          />
          <ChampModal
            label="Prix de vente (FCFA)"
            placeholder="Ex: 10000 — ce que le client paye"
            icone="arrow-up-circle-outline"
            value={form.prixVente}
            onChangeText={(v) => setForm({ ...form, prixVente: v })}
            keyboardType="numeric"
            erreur={erreurs.prixVente}
          />

          {form.prixAchat && form.prixVente && Number(form.prixVente) > Number(form.prixAchat) && (
            <View style={styles.beneficeApercu}>
              <Ionicons name="trending-up-outline" size={20} color={COLORS.success} />
              <Text style={styles.beneficeApercuTexte}>
                Bénéfice par unité : {formatMontant(Number(form.prixVente) - Number(form.prixAchat))}
              </Text>
            </View>
          )}

          <ChampModal
            label="Quantité en stock"
            placeholder="Ex: 50"
            icone="layers-outline"
            value={form.stock}
            onChangeText={(v) => setForm({ ...form, stock: v })}
            keyboardType="numeric"
            erreur={erreurs.stock}
          />

          <TouchableOpacity
            style={[styles.boutonSauvegarder, loading && { opacity: 0.7 }]}
            onPress={sauvegarder}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
            <Text style={styles.boutonSauvegarderTexte}>
              {loading ? 'Sauvegarde...' : produitEdit ? 'Mettre à jour' : 'Ajouter le produit'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* MODAL RÉAPPROVISIONNEMENT */}
      <Modal visible={modalReappro} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, paddingTop: SPACING.xxxl }}>
          <View style={styles.modalEntete}>
            <Text style={styles.modalTitre}>Réapprovisionner</Text>
            <TouchableOpacity onPress={() => setModalReappro(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {produitReappro && (
            <View style={styles.reapproInfo}>
              <View style={styles.produitAvatar}>
                <Text style={styles.produitAvatarTexte}>
                  {produitReappro.nom.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.reapproNom}>{produitReappro.nom}</Text>
                <Text style={styles.reapproStock}>
                  Stock actuel : <Text style={{ fontWeight: '800', color: COLORS.primary }}>{produitReappro.stock} unités</Text>
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.champLabel}>Combien d'unités avez-vous reçu ?</Text>
          <View style={styles.champWrapper}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.textSecondary} style={{ paddingHorizontal: SPACING.md }} />
            <TextInput
              style={styles.champInput}
              placeholder="Ex: 20"
              value={quantiteReappro}
              onChangeText={setQuantiteReappro}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textLight}
              autoFocus
            />
          </View>

          {quantiteReappro && !isNaN(quantiteReappro) && Number(quantiteReappro) > 0 && produitReappro && (
            <View style={styles.reapproApercu}>
              <Ionicons name="trending-up-outline" size={20} color={COLORS.success} />
              <Text style={styles.reapproApercuTexte}>
                Nouveau stock : {produitReappro.stock + Number(quantiteReappro)} unités
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.boutonSauvegarder, { marginTop: SPACING.xl }, loading && { opacity: 0.7 }]}
            onPress={confirmerReappro}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
            <Text style={styles.boutonSauvegarderTexte}>
              {loading ? 'Mise à jour...' : 'Confirmer le réapprovisionnement'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const ChampModal = ({ label, icone, erreur, ...props }) => (
  <View>
    <Text style={styles.champLabel}>{label}</Text>
    <View style={[styles.champWrapper, erreur && { borderColor: COLORS.error }]}>
      <Ionicons name={icone} size={18} color={COLORS.textSecondary} style={{ paddingHorizontal: SPACING.md }} />
      <TextInput
        style={styles.champInput}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
    </View>
    {erreur && <Text style={styles.champErreur}>{erreur}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  titrePage: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  sousTitre: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  boutonAjouter: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, marginHorizontal: SPACING.lg, paddingHorizontal: SPACING.md, height: 48, gap: SPACING.sm, marginBottom: SPACING.sm, ...SHADOWS.small },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  produitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.md, ...SHADOWS.small },
  produitStockFaible: { borderLeftWidth: 3, borderLeftColor: COLORS.error },
  produitAvatar: { width: 50, height: 50, borderRadius: BORDER_RADIUS.md, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  produitAvatarTexte: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  produitNom: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  produitInfos: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  produitPrix: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  beneficeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${COLORS.success}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  beneficeTexte: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.round, alignSelf: 'flex-start' },
  stockTexte: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  produitActions: { gap: SPACING.sm },
  actionBtn: { width: 36, height: 36, borderRadius: BORDER_RADIUS.sm, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' },
  vide: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  videTitre: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  videDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  boutonVideAjouter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.sm },
  boutonVideAjouterTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  modalEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitre: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  champLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  champWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface, height: 52 },
  champInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, height: '100%' },
  champErreur: { color: COLORS.error, fontSize: FONTS.sizes.xs, marginTop: 4 },
  beneficeApercu: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.success}10`, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.success },
  beneficeApercuTexte: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.success },
  reapproInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl, ...SHADOWS.small },
  reapproNom: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  reapproStock: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  reapproApercu: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.success}10`, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.success, marginTop: SPACING.md },
  reapproApercuTexte: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.success },
  boutonSauvegarder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, height: 56, marginTop: SPACING.md, ...SHADOWS.medium },
  boutonSauvegarderTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default ProductsScreen;