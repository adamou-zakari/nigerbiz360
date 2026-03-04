import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProduitsStockFaible, modifierProduit } from '../services/productService';
import useStore from '../store/useStore';
import { formatMontant } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, produits } = useStore();
  const [stockFaible, setStockFaible] = useState([]);
  const [modalReappro, setModalReappro] = useState(false);
  const [produitSelectionne, setProduitSelectionne] = useState(null);
  const [quantite, setQuantite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getProduitsStockFaible(user.uid).then(setStockFaible);
  }, [user?.uid, produits]);

  const ouvrirReappro = (produit) => {
    setProduitSelectionne(produit);
    setQuantite('');
    setModalReappro(true);
  };

  const confirmerReappro = async () => {
    if (!quantite || isNaN(quantite) || Number(quantite) <= 0) {
      Alert.alert('Erreur', 'Entrez une quantité valide.');
      return;
    }
    setLoading(true);
    await modifierProduit(produitSelectionne.id, {
      ...produitSelectionne,
      stock: produitSelectionne.stock + Number(quantite),
    });
    setLoading(false);
    setModalReappro(false);
    Alert.alert('Succès', `+${quantite} unités ajoutées pour "${produitSelectionne.nom}"`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.titrePage}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {stockFaible.length === 0 ? (
          <View style={styles.vide}>
            <View style={styles.videIcone}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
            </View>
            <Text style={styles.videTitre}>Tout est en ordre</Text>
            <Text style={styles.videDesc}>Aucun produit en stock faible pour le moment</Text>
          </View>
        ) : (
          <>
            <View style={styles.alerteBanniere}>
              <Ionicons name="warning-outline" size={20} color={COLORS.error} />
              <Text style={styles.alerteBanniereTexte}>
                {stockFaible.length} produit{stockFaible.length > 1 ? 's' : ''} à réapprovisionner
              </Text>
            </View>
            <View style={styles.carte}>
              {stockFaible.map((p, index) => (
                <View
                  key={p.id}
                  style={[
                    styles.stockItem,
                    index < stockFaible.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }
                  ]}
                >
                  <View style={styles.stockAvatar}>
                    <Text style={styles.stockAvatarTexte}>{p.nom.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockNom}>{p.nom}</Text>
                    <Text style={styles.stockPrix}>{formatMontant(p.prixVente || p.prix)}</Text>
                  </View>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeTexte}>{p.stock} restants</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.boutonReappro}
                    onPress={() => ouvrirReappro(p)}
                  >
                    <Ionicons name="add" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* MODAL RÉAPPROVISIONNEMENT */}
      <Modal visible={modalReappro} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView
            contentContainerStyle={{ padding: SPACING.xl, paddingTop: SPACING.xxxl, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalEntete}>
              <Text style={styles.modalTitre}>Réapprovisionner</Text>
              <TouchableOpacity onPress={() => setModalReappro(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {produitSelectionne && (
              <View style={styles.reapproInfo}>
                <View style={styles.stockAvatar}>
                  <Text style={styles.stockAvatarTexte}>
                    {produitSelectionne.nom.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.reapproNom}>{produitSelectionne.nom}</Text>
                  <Text style={styles.reapproStock}>
                    Stock actuel :{' '}
                    <Text style={{ fontWeight: '800', color: COLORS.error }}>
                      {produitSelectionne.stock} unités
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.champLabel}>Combien d'unités avez-vous reçu ?</Text>
            <View style={styles.champWrapper}>
              <Ionicons name="add-circle-outline" size={18} color={COLORS.textSecondary} style={{ paddingHorizontal: SPACING.md }} />
              <TextInput
                style={styles.champInput}
                placeholder="Ex: 50"
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmerReappro}
              />
            </View>

            {quantite && !isNaN(quantite) && Number(quantite) > 0 && produitSelectionne && (
              <View style={styles.apercu}>
                <Ionicons name="trending-up-outline" size={20} color={COLORS.success} />
                <Text style={styles.apercuTexte}>
                  Nouveau stock : {produitSelectionne.stock + Number(quantite)} unités
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.boutonConfirmer, loading && { opacity: 0.7 }]}
              onPress={confirmerReappro}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
              <Text style={styles.boutonConfirmerTexte}>
                {loading ? 'Mise à jour...' : 'Confirmer le réapprovisionnement'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  boutonRetour: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  titrePage: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  vide: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  videIcone: { width: 90, height: 90, borderRadius: 45, backgroundColor: `${COLORS.success}15`, alignItems: 'center', justifyContent: 'center' },
  videTitre: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  videDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  alerteBanniere: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.error}10`, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 4, borderLeftColor: COLORS.error },
  alerteBanniereTexte: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.error },
  carte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.small },
  stockItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  stockAvatar: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: `${COLORS.error}15`, alignItems: 'center', justifyContent: 'center' },
  stockAvatarTexte: { fontSize: 20, fontWeight: '800', color: COLORS.error },
  stockNom: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  stockPrix: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  stockBadge: { backgroundColor: `${COLORS.error}15`, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.round },
  stockBadgeTexte: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.error },
  boutonReappro: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  modalEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  modalTitre: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  reapproInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl, ...SHADOWS.small },
  reapproNom: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  reapproStock: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  champLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  champWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface, height: 52 },
  champInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, height: '100%' },
  apercu: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.success}10`, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.success, marginTop: SPACING.md },
  apercuTexte: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.success },
  boutonConfirmer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.success, borderRadius: BORDER_RADIUS.md, height: 56, marginTop: SPACING.xl, ...SHADOWS.medium },
  boutonConfirmerTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default NotificationsScreen;