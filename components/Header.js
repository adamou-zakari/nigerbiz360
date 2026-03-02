import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../utils/theme';

const Header = ({
  titre,
  sousTitre,
  onRetour,
  actionDroite,
  iconeDroite,
  onActionDroite,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + SPACING.sm },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.contenu}>
        {onRetour ? (
          <TouchableOpacity onPress={onRetour} style={styles.boutonRetour} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoZone}>
            <Text style={styles.logoText}>
              NIGER<Text style={styles.logoAccent}>BIZ</Text>
            </Text>
            <Text style={styles.logo360}>360</Text>
          </View>
        )}
        <View style={styles.titreZone}>
          <Text style={styles.titre} numberOfLines={1}>{titre}</Text>
          {sousTitre && <Text style={styles.sousTitre}>{sousTitre}</Text>}
        </View>
        {actionDroite ? (
          <TouchableOpacity onPress={onActionDroite} style={styles.boutonAction} activeOpacity={0.7}>
            {iconeDroite || <Text style={styles.actionText}>{actionDroite}</Text>}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  contenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  logoZone: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: COLORS.secondary,
  },
  logo360: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  titreZone: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  titre: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  sousTitre: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boutonRetour: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  boutonAction: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
});

export default Header;