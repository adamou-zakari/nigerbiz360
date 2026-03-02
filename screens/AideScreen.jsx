import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const FAQ = [
  {
    question: 'Comment ajouter un produit ?',
    reponse: 'Allez dans Mon Stock, cliquez sur + en haut à droite, remplissez le nom, prix d\'achat, prix de vente et stock puis confirmez.',
  },
  {
    question: 'Comment faire une vente ?',
    reponse: 'Cliquez sur le bouton Vendre en bas, sélectionnez vos produits, ouvrez le panier, choisissez le mode de paiement et cliquez sur Enregistrer la vente.',
  },
  {
    question: 'Comment partager une facture ?',
    reponse: 'Après une vente, cliquez sur Partager pour envoyer la facture par WhatsApp, Email ou autre application.',
  },
  {
    question: 'Comment réapprovisionner un produit ?',
    reponse: 'Allez dans Mon Stock, cliquez sur le bouton vert + à côté du produit, entrez la quantité reçue et confirmez.',
  },
  {
    question: 'Qu\'est-ce que le stock faible ?',
    reponse: 'Quand un produit a moins de 5 unités, une alerte rouge apparaît sur l\'Accueil et dans Notifications.',
  },
  {
    question: 'Comment modifier mon profil ?',
    reponse: 'Allez dans Mon Compte, cliquez sur Modifier le profil, mettez à jour vos informations et sauvegardez.',
  },
];

const AideScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [faqOuverte, setFaqOuverte] = useState(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.titrePage}>Aide & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contactCarte}>
          <View style={styles.contactIcone}>
            <Ionicons name="headset-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.contactTitre}>Besoin d'aide ?</Text>
          <Text style={styles.contactDesc}>Notre équipe est disponible pour vous aider</Text>
          <View style={styles.contactBoutons}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('https://wa.me/22790919103')}
            >
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
              <Text style={styles.contactBtnTexte}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => Linking.openURL('mailto:Zadamou32@gmail.com')}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.white} />
              <Text style={styles.contactBtnTexte}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitre}>Questions fréquentes</Text>
          <View style={styles.carte}>
            {FAQ.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqItem,
                  index < FAQ.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }
                ]}
                onPress={() => setFaqOuverte(faqOuverte === index ? null : index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={faqOuverte === index ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                {faqOuverte === index && (
                  <Text style={styles.faqReponse}>{item.reponse}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.version}>NIGERBIZ 360 · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  boutonRetour: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  titrePage: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  contactCarte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.medium },
  contactIcone: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  contactTitre: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  contactDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  contactBoutons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm, width: '100%' },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.success, borderRadius: BORDER_RADIUS.md, height: 48 },
  contactBtnTexte: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  sectionTitre: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  carte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.small },
  faqItem: { padding: SPACING.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.sm },
  faqQuestion: { flex: 1, fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  faqReponse: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, lineHeight: 22 },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: FONTS.sizes.xs },
});

export default AideScreen;