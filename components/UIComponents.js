import React from 'react';
import {
  TouchableOpacity, View, Text, ActivityIndicator, StyleSheet,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../utils/theme';

export const Bouton = ({
  titre, onPress, variante = 'primaire', taille = 'md',
  loading = false, desactive = false, icone, style,
}) => {
  const styles = getBoutonStyles(variante, taille, desactive);
  return (
    <TouchableOpacity
      style={[styles.bouton, style]}
      onPress={onPress}
      disabled={desactive || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={styles.texte.color} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icone}
          <Text style={styles.texte}>{titre}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getBoutonStyles = (variante, taille, desactive) => {
  const hauteurs = { sm: 36, md: 48, lg: 56 };
  const taillesFonts = { sm: FONTS.sizes.sm, md: FONTS.sizes.md, lg: FONTS.sizes.lg };
  const paddingsH = { sm: 14, md: 20, lg: 28 };
  const variantStyles = {
    primaire: { bg: COLORS.primary, texte: COLORS.white, border: 'transparent' },
    secondaire: { bg: COLORS.secondary, texte: COLORS.white, border: 'transparent' },
    outline: { bg: 'transparent', texte: COLORS.primary, border: COLORS.primary },
    danger: { bg: COLORS.error, texte: COLORS.white, border: 'transparent' },
    ghost: { bg: 'transparent', texte: COLORS.primary, border: 'transparent' },
  };
  const v = variantStyles[variante] || variantStyles.primaire;
  return {
    bouton: {
      height: hauteurs[taille],
      paddingHorizontal: paddingsH[taille],
      backgroundColor: desactive ? '#ccc' : v.bg,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: v.border !== 'transparent' ? 2 : 0,
      borderColor: v.border,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: desactive ? 0.6 : 1,
      ...SHADOWS.small,
    },
    texte: {
      color: desactive ? '#888' : v.texte,
      fontSize: taillesFonts[taille],
      fontWeight: '600',
    },
  };
};

export const Carte = ({ children, style, padding = SPACING.lg }) => (
  <View style={[{
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding,
    ...SHADOWS.small,
  }, style]}>
    {children}
  </View>
);

export const Badge = ({ texte, couleur = COLORS.primary, style }) => (
  <View style={[{
    backgroundColor: `${couleur}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  }, style]}>
    <Text style={{ color: couleur, fontSize: FONTS.sizes.xs, fontWeight: '700' }}>
      {texte}
    </Text>
  </View>
);

export const Separateur = ({ couleur = COLORS.border, style }) => (
  <View style={{ height: 1, backgroundColor: couleur, ...style }} />
);

export const StatCard = ({ titre, valeur, icone, couleur = COLORS.primary, style }) => (
  <Carte style={{ flex: 1, ...style }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View>
        <Text style={{ fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: 4 }}>
          {titre}
        </Text>
        <Text style={{ fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text }}>
          {valeur}
        </Text>
      </View>
      <View style={{
        width: 44, height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: `${couleur}15`,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{icone}</Text>
      </View>
    </View>
  </Carte>
);

export const Chargement = ({ message = 'Chargement...' }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>{message}</Text>
  </View>
);

export const EtatVide = ({ icone = '📦', titre, description, children }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl }}>
    <Text style={{ fontSize: 56, marginBottom: SPACING.lg }}>{icone}</Text>
    <Text style={{ fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' }}>
      {titre}
    </Text>
    {description && (
      <Text style={{ fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 }}>
        {description}
      </Text>
    )}
    {children && <View style={{ marginTop: SPACING.xl }}>{children}</View>}
  </View>
);