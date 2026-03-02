import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getStatsJour } from '../services/ventesService';
import { getProduitsStockFaible } from '../services/productService';
import useStore from '../store/useStore';
import { formatMontant, formatDate } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profil, produits, statsJour, setStatsJour } = useStore();
  const [alertesStock, setAlertesStock] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const chargerStats = useCallback(async () => {
    if (!user?.uid) return;
    const [stats, stockFaible] = await Promise.all([
      getStatsJour(user.uid),
      getProduitsStockFaible(user.uid),
    ]);
    setStatsJour(stats);
    setAlertesStock(stockFaible);
  }, [user?.uid]);

  useEffect(() => { chargerStats(); }, [chargerStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerStats();
    setRefreshing(false);
  };

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* EN-TÊTE */}
      <View style={styles.entete}>
        <View>
          <Text style={styles.salutation}>{salutation}</Text>
          <Text style={styles.nomBoutique}>{profil?.boutique || 'Ma Boutique'}</Text>
          <Text style={styles.date}>{formatDate(new Date(), 'EEEE dd MMMM yyyy')}</Text>
        </View>
      </View>

      {/* CARTE VENTES DU JOUR */}
      <View style={styles.carteVentes}>
        <Text style={styles.carteLabel}>Ventes du jour</Text>
        <Text style={styles.carteMontant}>
          {formatMontant(statsJour?.totalVentes || 0)}
        </Text>
        <View style={styles.carteRow}>
          <View style={styles.carteStat}>
            <Ionicons name="cart-outline" size={16} color={COLORS.white} />
            <Text style={styles.carteStatTexte}>
              {statsJour?.nombreVentes || 0} vente{statsJour?.nombreVentes > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.carteDivider} />
          <View style={styles.carteStat}>
            <Ionicons name="trending-up-outline" size={16} color={COLORS.white} />
            <Text style={styles.carteStatTexte}>
              {formatMontant(statsJour?.beneficeEstime || 0)} bénéfice
            </Text>
          </View>
        </View>
      </View>

      {/* RÉSUMÉ STOCK */}
      <View style={styles.resumeGrid}>
        <View style={styles.resumeCarte}>
          <Ionicons name="cube-outline" size={22} color={COLORS.secondary} />
          <Text style={styles.resumeValeur}>{produits.length}</Text>
          <Text style={styles.resumeLabel}>Produits</Text>
        </View>
        <View style={styles.resumeCarte}>
          <Ionicons name="layers-outline" size={22} color={COLORS.primary} />
          <Text style={styles.resumeValeur}>
            {produits.reduce((s, p) => s + p.stock, 0)}
          </Text>
          <Text style={styles.resumeLabel}>Total stock</Text>
        </View>
        <View style={styles.resumeCarte}>
          <Ionicons name="warning-outline" size={22} color={COLORS.error} />
          <Text style={[styles.resumeValeur, alertesStock.length > 0 && { color: COLORS.error }]}>
            {alertesStock.length}
          </Text>
          <Text style={styles.resumeLabel}>Stock faible</Text>
        </View>
      </View>

      {/* ALERTES STOCK FAIBLE */}
      {alertesStock.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={18} color={COLORS.error} />
            <Text style={[styles.sectionTitre, { color: COLORS.error }]}>Stock faible</Text>
          </View>
          <View style={styles.alertesCarte}>
            {alertesStock.slice(0, 3).map((p, index) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.alerteItem,
                  index < alertesStock.slice(0, 3).length - 1 && {
                    borderBottomWidth: 1, borderBottomColor: COLORS.border,
                  },
                ]}
                onPress={() => navigation.navigate('Produits')}
              >
                <View style={styles.alerteIcone}>
                  <Ionicons name="cube-outline" size={20} color={COLORS.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alerteNom}>{p.nom}</Text>
                  <Text style={styles.alerteStock}>
                    <Text style={{ color: COLORS.error, fontWeight: '700' }}>{p.stock} unités</Text> restantes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { padding: SPACING.lg },
  salutation: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  nomBoutique: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  date: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  carteVentes: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, ...SHADOWS.medium, marginBottom: SPACING.lg },
  carteLabel: { fontSize: FONTS.sizes.sm, color: `${COLORS.white}CC`, fontWeight: '600', marginBottom: SPACING.sm },
  carteMontant: { fontSize: 38, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.lg },
  carteRow: { flexDirection: 'row', alignItems: 'center' },
  carteStat: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  carteStatTexte: { color: `${COLORS.white}CC`, fontSize: FONTS.sizes.sm },
  carteDivider: { width: 1, height: 20, backgroundColor: `${COLORS.white}30`, marginHorizontal: SPACING.md },
  resumeGrid: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  resumeCarte: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.small },
  resumeValeur: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  resumeLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectionTitre: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  alertesCarte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.small, borderLeftWidth: 4, borderLeftColor: COLORS.error },
  alerteItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  alerteIcone: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.error}15`, alignItems: 'center', justifyContent: 'center' },
  alerteNom: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  alerteStock: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
});

export default DashboardScreen;