import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { observerVentes } from '../services/ventesService';
import useStore from '../store/useStore';
import { formatMontant, formatDateTime } from '../utils/helpers';
import { getCouleurPaiement, getLibellePaiement } from '../services/paiementService';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const HistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, ventes, setVentes } = useStore();
  const [expandedVente, setExpandedVente] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = observerVentes(user.uid, setVentes);
    return () => unsubscribe();
  }, [user?.uid]);

  const totalJour = ventes.filter((v) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(v.createdAt) >= today;
  }).reduce((s, v) => s + v.totalAmount, 0);

  const renderVente = ({ item }) => {
    const couleur = getCouleurPaiement(item.modePaiement);
    const libelle = getLibellePaiement(item.modePaiement);
    const isExpanded = expandedVente === item.id;

    return (
      <TouchableOpacity
        style={styles.venteCard}
        onPress={() => setExpandedVente(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.venteHeader}>
          <View style={[styles.venteDot, { backgroundColor: couleur }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.venteNumero}>{item.numeroFacture}</Text>
            <Text style={styles.venteDate}>{formatDateTime(item.createdAt)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={styles.venteMontant}>{formatMontant(item.totalAmount)}</Text>
            <View style={[styles.modeBadge, { backgroundColor: `${couleur}15` }]}>
              <Text style={[styles.modeTexte, { color: couleur }]}>{libelle}</Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textSecondary}
            style={{ marginLeft: SPACING.sm }}
          />
        </View>

        {isExpanded && (
          <View style={styles.venteDetails}>
            <View style={styles.detailsDivider} />
            {item.clientNom ? (
              <View style={styles.clientRow}>
                <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.clientNom}>{item.clientNom}</Text>
              </View>
            ) : null}
            {item.articles.map((a, i) => (
              <View key={i} style={styles.articleRow}>
                <Text style={styles.articleNom}>{a.nom} × {a.quantite}</Text>
                <Text style={styles.articleSousTotal}>{formatMontant(a.sousTotal)}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.boutonFacture}
              onPress={() => navigation.navigate('Facture', { vente: item })}
            >
              <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
              <Text style={styles.boutonFactureTexte}>Voir la facture</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* EN-TÊTE */}
      <View style={styles.entete}>
        <View>
          <Text style={styles.titrePage}>Historique</Text>
          <Text style={styles.sousTitre}>{ventes.length} ventes enregistrées</Text>
        </View>
        <View style={styles.totalJourZone}>
          <Text style={styles.totalJourLabel}>Aujourd'hui</Text>
          <Text style={styles.totalJourMontant}>{formatMontant(totalJour)}</Text>
        </View>
      </View>

      {/* LISTE */}
      <FlatList
        data={ventes}
        keyExtractor={(item) => item.id}
        renderItem={renderVente}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.videTexte}>Aucune vente</Text>
            <Text style={styles.videDesc}>Les ventes apparaîtront ici après confirmation</Text>
            <TouchableOpacity
              style={styles.boutonNouvelleVente}
              onPress={() => navigation.navigate('Ventes')}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.boutonNouvelleVenteTexte}>Faire une vente</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.lg },
  titrePage: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  sousTitre: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  totalJourZone: { alignItems: 'flex-end', backgroundColor: `${COLORS.primary}10`, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: `${COLORS.primary}20` },
  totalJourLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  totalJourMontant: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.primary },
  venteCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.small },
  venteHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  venteDot: { width: 10, height: 10, borderRadius: 5 },
  venteNumero: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  venteDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  venteMontant: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
  modeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  modeTexte: { fontSize: 10, fontWeight: '700' },
  venteDetails: { marginTop: SPACING.md },
  detailsDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  clientNom: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  articleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  articleNom: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  articleSousTotal: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  boutonFacture: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, alignSelf: 'flex-end', backgroundColor: `${COLORS.primary}10`, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round },
  boutonFactureTexte: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  vide: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  videTexte: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  videDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  boutonNouvelleVente: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.sm },
  boutonNouvelleVenteTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});

export default HistoryScreen;