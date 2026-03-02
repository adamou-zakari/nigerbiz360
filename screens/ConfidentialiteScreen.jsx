import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const SECTIONS = [
  {
    icone: 'server-outline',
    titre: 'Données collectées',
    contenu: 'Nous collectons uniquement les données nécessaires : nom, email, boutique, téléphone, produits et ventes. Aucune donnée supplémentaire n\'est collectée.',
  },
  {
    icone: 'lock-closed-outline',
    titre: 'Sécurité',
    contenu: 'Vos données sont stockées sur Firebase (Google Cloud) avec chiffrement complet. Seul vous pouvez accéder à vos données.',
  },
  {
    icone: 'hand-left-outline',
    titre: 'Partage des données',
    contenu: 'Nous ne vendons jamais vos données. Vos informations restent strictement confidentielles et accessibles uniquement par vous.',
  },
  {
    icone: 'phone-portrait-outline',
    titre: 'Paiements mobiles',
    contenu: 'Lorsqu\'une vente est enregistrée avec paiement mobile, seul le mode de paiement est conservé. Aucun numéro de téléphone n\'est stocké.',
  },
  {
    icone: 'trash-outline',
    titre: 'Suppression des données',
    contenu: 'Vous pouvez demander la suppression de votre compte et toutes vos données en contactant notre support. Délai : 30 jours.',
  },
];

const ConfidentialiteScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.titrePage}>Confidentialité</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banniere}>
          <View style={styles.banniereIcone}>
            <Ionicons name="shield-checkmark" size={36} color={COLORS.success} />
          </View>
          <Text style={styles.banniereTitre}>Vos données sont protégées</Text>
          <Text style={styles.banniereDesc}>Dernière mise à jour : 01 Mars 2026</Text>
        </View>

        <View style={styles.carte}>
          {SECTIONS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.sectionItem,
                index < SECTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }
              ]}
            >
              <View style={styles.sectionIcone}>
                <Ionicons name={item.icone} size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitre}>{item.titre}</Text>
                <Text style={styles.sectionContenu}>{item.contenu}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.boutonContact}
          onPress={() => Linking.openURL('mailto:Zadamou32@gmail.com')}
          activeOpacity={0.85}
        >
          <Ionicons name="mail-outline" size={20} color={COLORS.white} />
          <Text style={styles.boutonContactTexte}>Contacter le support</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Zadamou32@gmail.com · Niamey, Niger</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  boutonRetour: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  titrePage: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  banniere: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.small },
  banniereIcone: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${COLORS.success}15`, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  banniereTitre: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  banniereDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  carte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.small },
  sectionItem: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, alignItems: 'flex-start' },
  sectionIcone: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  sectionTitre: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionContenu: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  boutonContact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, height: 54, ...SHADOWS.medium },
  boutonContactTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: FONTS.sizes.xs },
});

export default ConfidentialiteScreen;