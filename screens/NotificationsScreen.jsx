import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProduitsStockFaible } from '../services/productService';
import useStore from '../store/useStore';
import { formatMontant } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, produits } = useStore();
  const [stockFaible, setStockFaible] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    getProduitsStockFaible(user.uid).then(setStockFaible);
  }, [user?.uid, produits]);

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
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.stockItem,
                    index < stockFaible.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }
                  ]}
                  onPress={() => navigation.navigate('Produits')}
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
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.boutonGerer}
              onPress={() => navigation.navigate('Produits')}
            >
              <Ionicons name="cube-outline" size={20} color={COLORS.white} />
              <Text style={styles.boutonGererTexte}>Réapprovisionner le stock</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  boutonGerer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, height: 54, ...SHADOWS.medium },
  boutonGererTexte: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
});

export default NotificationsScreen;