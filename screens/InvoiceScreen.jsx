import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { partagerFacture, imprimerFacture } from '../services/factureService';
import { getCouleurPaiement, getLibellePaiement } from '../services/paiementService';
import { formatMontant, formatDateTime } from '../utils/helpers';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const InvoiceScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { vente, boutique } = route.params || {};
  const [partageEnCours, setPartageEnCours] = useState(false);
  const [impressionEnCours, setImpressionEnCours] = useState(false);

  if (!vente) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 16, fontSize: FONTS.sizes.md }}>
          Aucune facture à afficher.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.lg }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePartager = async () => {
    setPartageEnCours(true);
    const result = await partagerFacture(vente, boutique);
    setPartageEnCours(false);
    if (!result.success) Alert.alert('Erreur', 'Impossible de partager la facture.');
  };

  const handleImprimer = async () => {
    setImpressionEnCours(true);
    const result = await imprimerFacture(vente, boutique);
    setImpressionEnCours(false);
    if (!result.success) Alert.alert('Erreur', "Impossible d'imprimer la facture.");
  };

  const couleurMode = getCouleurPaiement(vente.modePaiement);
  const libelleMode = getLibellePaiement(vente.modePaiement);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* EN-TÊTE */}
      <View style={styles.entete}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          style={styles.boutonFermer}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.titrePage}>Facture</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUCCÈS */}
        <View style={styles.succesZone}>
          <View style={styles.succesIcone}>
            <Ionicons name="checkmark" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.succesTitre}>Vente confirmée !</Text>
          <Text style={styles.succesDesc}>La vente a été enregistrée avec succès</Text>
        </View>

        {/* FACTURE */}
        <View style={styles.factureCard}>

          {/* EN-TÊTE FACTURE */}
          <View style={styles.factureEntete}>
            <View>
              <Text style={styles.factureLogoTexte}>
                NIGER<Text style={{ color: COLORS.secondary }}>BIZ</Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}> 360</Text>
              </Text>
              <Text style={styles.factureBoutique}>{boutique || 'Ma Boutique'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.factureNumero}>{vente.numeroFacture}</Text>
              <Text style={styles.factureDate}>{formatDateTime(vente.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* MODE PAIEMENT */}
          <View style={styles.modePaiementZone}>
            <View style={[styles.modeBadge, { backgroundColor: `${couleurMode}15`, borderColor: couleurMode }]}>
              <Ionicons
                name={vente.modePaiement === 'especes' ? 'cash-outline' : 'phone-portrait-outline'}
                size={14}
                color={couleurMode}
              />
              <Text style={[styles.modeTexte, { color: couleurMode }]}>{libelleMode}</Text>
            </View>
            {vente.clientNom ? (
              <View style={styles.clientZone}>
                <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.clientNom}>{vente.clientNom}</Text>
              </View>
            ) : null}
          </View>

          {/* ARTICLES */}
          <Text style={styles.articlesLabel}>Articles</Text>
          <View style={styles.articlesListe}>
            {vente.articles.map((article, index) => (
              <View
                key={index}
                style={[
                  styles.articleItem,
                  index < vente.articles.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.articleNom}>{article.nom}</Text>
                  <Text style={styles.articleDetail}>
                    {formatMontant(article.prix)} × {article.quantite}
                  </Text>
                </View>
                <Text style={styles.articleSousTotal}>{formatMontant(article.sousTotal)}</Text>
              </View>
            ))}
          </View>

          {/* TOTAL */}
          <View style={styles.totalZone}>
            <Text style={styles.totalLabel}>TOTAL PAYÉ</Text>
            <Text style={styles.totalMontant}>{formatMontant(vente.totalAmount)}</Text>
          </View>

          {/* PIED */}
          <View style={styles.facturePied}>
            <Text style={styles.facturePiedTexte}>Merci pour votre achat !</Text>
            <Text style={styles.facturePiedSub}>NIGERBIZ 360 · Niamey, Niger</Text>
          </View>
        </View>
      </ScrollView>

      {/* ACTIONS */}
      <View style={[styles.actionsBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={styles.boutonAction}
          onPress={handleImprimer}
          disabled={impressionEnCours}
          activeOpacity={0.8}
        >
          <Ionicons name="print-outline" size={20} color={COLORS.primary} />
          <Text style={styles.boutonActionTexte}>
            {impressionEnCours ? '...' : 'Imprimer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boutonAction}
          onPress={handlePartager}
          disabled={partageEnCours}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          <Text style={styles.boutonActionTexte}>
            {partageEnCours ? '...' : 'Partager'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boutonNouvelleVente}
          onPress={() => navigation.navigate('Ventes')}
          activeOpacity={0.9}
        >
          <Ionicons name="add-outline" size={20} color={COLORS.white} />
          <Text style={styles.boutonNouvelleVenteTexte}>Nouvelle vente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  boutonFermer: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  titrePage: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  succesZone: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  succesIcone: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, ...SHADOWS.medium },
  succesTitre: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  succesDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  factureCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.medium },
  factureEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.xl },
  factureLogoTexte: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  factureBoutique: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
  factureNumero: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
  factureDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
  divider: { height: 2, backgroundColor: COLORS.primary, marginHorizontal: SPACING.xl },
  modePaiementZone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingTop: SPACING.md },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5 },
  modeTexte: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  clientZone: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientNom: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  articlesLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: SPACING.xl, marginTop: SPACING.lg, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  articlesListe: { marginHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  articleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  articleNom: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  articleDetail: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  articleSousTotal: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  totalZone: { margin: SPACING.xl, backgroundColor: `${COLORS.primary}10`, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 2, borderColor: `${COLORS.primary}25` },
  totalLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1.5, marginBottom: 4 },
  totalMontant: { fontSize: 34, fontWeight: '900', color: COLORS.primary },
  facturePied: { backgroundColor: COLORS.background, padding: SPACING.lg, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border },
  facturePiedTexte: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  facturePiedSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
  actionsBar: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
  boutonAction: { flex: 1, height: 52, borderRadius: BORDER_RADIUS.md, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.sm },
  boutonActionTexte: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  boutonNouvelleVente: { flex: 2, height: 52, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.sm, ...SHADOWS.small },
  boutonNouvelleVenteTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
});

export default InvoiceScreen;