import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { connexion, inscription } from '../services/authService';
import useStore from '../store/useStore';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser, setProfil } = useStore();
  const [mode, setMode] = useState('connexion');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nom: '', boutique: '', email: '', telephone: '', motDePasse: '',
  });
  const [erreurs, setErreurs] = useState({});

  const updateForm = (champ, valeur) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((prev) => ({ ...prev, [champ]: '' }));
  };

  const validerForm = () => {
    const e = {};
    if (!form.email) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.motDePasse || form.motDePasse.length < 6) e.motDePasse = 'Min. 6 caractères';
    if (mode === 'inscription') {
      if (!form.nom) e.nom = 'Nom requis';
      if (!form.boutique) e.boutique = 'Nom de boutique requis';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleSoumettre = async () => {
    if (!validerForm()) return;
    setLoading(true);
    const result = mode === 'connexion'
      ? await connexion(form.email, form.motDePasse)
      : await inscription(form);
    setLoading(false);
    if (result.success) {
      setUser(result.user);
      setProfil(result.profil);
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[styles.content, {
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
        }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoZone}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.logoTexte}>
            NIGER<Text style={{ color: COLORS.secondary }}>BIZ</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 22 }}> 360</Text>
          </Text>
          <Text style={styles.logoSousTitre}>Gérez votre commerce simplement</Text>
        </View>

        {/* CARTE */}
        <View style={styles.carte}>
          {/* ONGLETS */}
          <View style={styles.onglets}>
            <TouchableOpacity
              style={[styles.onglet, mode === 'connexion' && styles.ongletActif]}
              onPress={() => setMode('connexion')}
            >
              <Text style={[styles.ongletTexte, mode === 'connexion' && styles.ongletTexteActif]}>
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.onglet, mode === 'inscription' && styles.ongletActif]}
              onPress={() => setMode('inscription')}
            >
              <Text style={[styles.ongletTexte, mode === 'inscription' && styles.ongletTexteActif]}>
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* CHAMPS */}
          <View style={{ gap: SPACING.md }}>
            {mode === 'inscription' && (
              <>
                <Champ
                  label="Votre nom"
                  placeholder="Ex: Moussa Mahamane"
                  icone="person-outline"
                  value={form.nom}
                  onChangeText={(v) => updateForm('nom', v)}
                  erreur={erreurs.nom}
                  returnKeyType="next"
                />
                <Champ
                  label="Nom de votre boutique"
                  placeholder="Ex: Boutique Al Baraka"
                  icone="storefront-outline"
                  value={form.boutique}
                  onChangeText={(v) => updateForm('boutique', v)}
                  erreur={erreurs.boutique}
                  returnKeyType="next"
                />
                <Champ
                  label="Téléphone (optionnel)"
                  placeholder="Ex: 90123456"
                  icone="call-outline"
                  value={form.telephone}
                  onChangeText={(v) => updateForm('telephone', v)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </>
            )}

            <Champ
              label="Adresse email"
              placeholder="email@exemple.com"
              icone="mail-outline"
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              erreur={erreurs.email}
              returnKeyType="next"
            />

            <Champ
              label="Mot de passe"
              placeholder="••••••••"
              icone="lock-closed-outline"
              value={form.motDePasse}
              onChangeText={(v) => updateForm('motDePasse', v)}
              secureTextEntry={!showPassword}
              erreur={erreurs.motDePasse}
              returnKeyType="done"
              onSubmitEditing={handleSoumettre}
              suffixe={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ paddingRight: SPACING.md }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {/* BOUTON */}
          <TouchableOpacity
            style={[styles.bouton, loading && { opacity: 0.7 }]}
            onPress={handleSoumettre}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.boutonTexte}>Chargement...</Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Ionicons
                  name={mode === 'connexion' ? 'log-in-outline' : 'person-add-outline'}
                  size={22}
                  color={COLORS.white}
                />
                <Text style={styles.boutonTexte}>
                  {mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {mode === 'inscription' && (
            <View style={styles.noteGratuite}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.noteGratuiteTexte}>
                Gratuit jusqu'à 20 produits · Premium à 5 000 FCFA/mois
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Champ = ({ label, icone, erreur, suffixe, ...props }) => (
  <View>
    <Text style={styles.champLabel}>{label}</Text>
    <View style={[styles.champWrapper, erreur && { borderColor: COLORS.error }]}>
      <Ionicons name={icone} size={18} color={COLORS.textSecondary} style={{ paddingHorizontal: SPACING.md }} />
      <TextInput
        style={styles.champInput}
        placeholderTextColor={COLORS.textLight}
        autoCorrect={false}
        {...props}
      />
      {suffixe}
    </View>
    {erreur && <Text style={styles.champErreur}>{erreur}</Text>}
  </View>
);

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.xl },
  logoZone: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, ...SHADOWS.medium },
  logoTexte: { fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  logoSousTitre: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 6 },
  carte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, gap: SPACING.lg, ...SHADOWS.medium },
  onglets: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, padding: 4 },
  onglet: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  ongletActif: { backgroundColor: COLORS.surface, ...SHADOWS.small },
  ongletTexte: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  ongletTexteActif: { color: COLORS.primary },
  champLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  champWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface, height: 52 },
  champInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, height: '100%' },
  champErreur: { color: COLORS.error, fontSize: FONTS.sizes.xs, marginTop: 4 },
  bouton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, height: 56, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
  boutonTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  noteGratuite: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.secondary}10`, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.secondary },
  noteGratuiteTexte: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.secondary, lineHeight: 18 },
});

export default LoginScreen;