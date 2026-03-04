import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { deconnexion } from '../services/authService';
import useStore from '../store/useStore';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profil, setProfil, logout } = useStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nom: profil?.nom || '',
    boutique: profil?.boutique || '',
    telephone: profil?.telephone || '',
  });

  const sauvegarderProfil = async () => {
    if (!form.nom.trim() || !form.boutique.trim()) {
      Alert.alert('Erreur', 'Nom et boutique sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        uid: user.uid,
        nom: form.nom,
        boutique: form.boutique,
        telephone: form.telephone,
        email: user.email,
        plan: profil?.plan || 'gratuit',
        produitsMax: profil?.produitsMax || 20,
        updatedAt: new Date().toISOString(),
        createdAt: profil?.createdAt || new Date().toISOString(),
      };
      await setDoc(doc(db, 'utilisateurs', user.uid), data, { merge: true });
      setProfil(data);
      setModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeconnexion = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await deconnexion();
            setLoading(false);
            if (result.success) logout();
            else Alert.alert('Erreur', 'Impossible de se déconnecter.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* EN-TÊTE PROFIL */}
      <View style={styles.entete}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>
            {profil?.nom?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.nomUtilisateur}>{profil?.nom || 'Mon Profil'}</Text>
        <Text style={styles.nomBoutique}>{profil?.boutique || 'Ma Boutique'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <TouchableOpacity
          style={styles.boutonModifier}
          onPress={() => {
            setForm({
              nom: profil?.nom || '',
              boutique: profil?.boutique || '',
              telephone: profil?.telephone || '',
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
          <Text style={styles.boutonModifierTexte}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* INFORMATIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Informations</Text>
        <View style={styles.carte}>
          <LigneInfo icone="person-outline" label="Nom" valeur={profil?.nom || '-'} />
          <LigneInfo icone="storefront-outline" label="Boutique" valeur={profil?.boutique || '-'} />
          <LigneInfo icone="call-outline" label="Téléphone" valeur={profil?.telephone || '-'} />
          <LigneInfo icone="mail-outline" label="Email" valeur={user?.email || '-'} derniere />
        </View>
      </View>

      {/* PARAMÈTRES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Paramètres</Text>
        <View style={styles.carte}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={[styles.menuIcone, { backgroundColor: `${COLORS.primary}15` }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTexte}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Aide')}>
            <View style={[styles.menuIcone, { backgroundColor: `${COLORS.nita}15` }]}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.nita} />
            </View>
            <Text style={styles.menuTexte}>Aide & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Confidentialite')}>
            <View style={[styles.menuIcone, { backgroundColor: `${COLORS.secondary}15` }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuTexte}>Confidentialité</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* DÉCONNEXION */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.boutonDeconnexion}
          onPress={handleDeconnexion}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
          <Text style={styles.boutonDeconnexionTexte}>
            {loading ? 'Chargement...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>NIGERBIZ 360 · Version 1.0.0</Text>

      {/* MODAL MODIFIER */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView
            contentContainerStyle={{ padding: SPACING.xl, paddingTop: SPACING.xxxl, gap: SPACING.md, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalEntete}>
              <Text style={styles.modalTitre}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ChampModal
              label="Votre nom"
              placeholder="Ex: Moussa Mahamane"
              icone="person-outline"
              value={form.nom}
              onChangeText={(v) => setForm({ ...form, nom: v })}
              returnKeyType="next"
            />
            <ChampModal
              label="Nom de la boutique"
              placeholder="Ex: Boutique Al Baraka"
              icone="storefront-outline"
              value={form.boutique}
              onChangeText={(v) => setForm({ ...form, boutique: v })}
              returnKeyType="next"
            />
            <ChampModal
              label="Téléphone"
              placeholder="Ex: 90123456"
              icone="call-outline"
              value={form.telephone}
              onChangeText={(v) => setForm({ ...form, telephone: v })}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={sauvegarderProfil}
            />

            <TouchableOpacity
              style={[styles.boutonSauvegarder, loading && { opacity: 0.7 }]}
              onPress={sauvegarderProfil}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
              <Text style={styles.boutonSauvegarderTexte}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const LigneInfo = ({ icone, label, valeur, derniere }) => (
  <View style={[styles.ligneInfo, !derniere && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
    <Ionicons name={icone} size={18} color={COLORS.primary} style={{ width: 28 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.ligneLabel}>{label}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  </View>
);

const ChampModal = ({ label, icone, ...props }) => (
  <View>
    <Text style={styles.champLabel}>{label}</Text>
    <View style={styles.champWrapper}>
      <Ionicons name={icone} size={18} color={COLORS.textSecondary} style={{ paddingHorizontal: SPACING.md }} />
      <TextInput
        style={styles.champInput}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  entete: { alignItems: 'center', padding: SPACING.xl, paddingBottom: SPACING.xxl },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, ...SHADOWS.medium },
  avatarTexte: { fontSize: 40, fontWeight: '800', color: COLORS.white },
  nomUtilisateur: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  nomBoutique: { fontSize: FONTS.sizes.md, color: COLORS.secondary, fontWeight: '600', marginBottom: 4 },
  email: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  boutonModifier: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: `${COLORS.primary}15`, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1.5, borderColor: COLORS.primary },
  boutonModifierTexte: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitre: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  carte: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.small },
  ligneInfo: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  ligneLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  ligneValeur: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcone: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  menuTexte: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
  boutonDeconnexion: { backgroundColor: COLORS.error, borderRadius: BORDER_RADIUS.lg, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, ...SHADOWS.medium },
  boutonDeconnexionTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: FONTS.sizes.xs, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  modalEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitre: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  champLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  champWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surface, height: 52 },
  champInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, height: '100%' },
  boutonSauvegarder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, height: 56, marginTop: SPACING.md, ...SHADOWS.medium },
  boutonSauvegarderTexte: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default ProfileScreen;