import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import ButtonCustom from '../../components/ButtonCustom';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProviderProfile } from '../../hooks/useProviderData';
import dayjs from 'dayjs';

const UpdateProviderProfile = () => {
  const navigation = useNavigation();
  const { profile, loading: profileLoading, updateProfile } = useProviderProfile();
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sexe: 'M',
    bloodGroup: 'O',
    rhesus: '+',
    dateBirth: new Date(),
    phoneNumber: '',
    historiqueMedical: '',
  });

  // Charger les données du profil existant
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        sexe: profile.sexe || 'M',
        bloodGroup: profile.bloodGroup || 'O',
        rhesus: profile.rhesus || '+',
        dateBirth: profile.dateBirth
          ? (profile.dateBirth.toDate ? profile.dateBirth.toDate() : new Date(profile.dateBirth))
          : new Date(),
        phoneNumber: profile.phoneNumber || '',
        historiqueMedical: profile.historiqueMedical || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, dateBirth: selectedDate });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      await updateProfile({
        name: formData.name.trim(),
        sexe: formData.sexe,
        bloodGroup: formData.bloodGroup,
        rhesus: formData.rhesus,
        dateBirth: formData.dateBirth,
        phoneNumber: formData.phoneNumber.trim(),
        historiqueMedical: formData.historiqueMedical.trim() || null,
      });

      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerRight}>
          <Icon name="person" size={24} color={COLORS.PRIMARY_RED} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={50} color={COLORS.WHITE} />
          </View>
          <Text style={styles.avatarLabel}>
            {profile?.email}
          </Text>
        </View>

        {/* Nom complet */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet *</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={COLORS.GRAY_DARK} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre nom complet"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>
        </View>

        {/* Téléphone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numéro de téléphone *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+237</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="6XX XXX XXX"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
        </View>

        {/* Date de naissance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date de naissance *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={20} color={COLORS.GRAY_DARK} style={styles.inputIcon} />
            <Text style={styles.dateText}>
              {dayjs(formData.dateBirth).format('DD/MM/YYYY')}
            </Text>
            <Icon name="chevron-down" size={20} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dateBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}

        {/* Row: Sexe, Groupe sanguin, Rhésus */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.smallInput]}>
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.sexe}
                onValueChange={(value) => handleInputChange('sexe', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="Masculin" value="M" />
                <Picker.Item label="Féminin" value="F" />
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.smallInput]}>
            <Text style={styles.label}>Groupe</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bloodGroup}
                onValueChange={(value) => handleInputChange('bloodGroup', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="O" value="O" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="AB" value="AB" />
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.smallInput]}>
            <Text style={styles.label}>Rhésus</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.rhesus}
                onValueChange={(value) => handleInputChange('rhesus', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="+" value="+" />
                <Picker.Item label="-" value="-" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Blood Group Preview */}
        <View style={styles.bloodPreviewContainer}>
          <Text style={styles.bloodPreviewLabel}>Votre groupe sanguin</Text>
          <View style={styles.bloodPreview}>
            <Icon name="water" size={30} color={COLORS.PRIMARY_RED} />
            <Text style={styles.bloodPreviewText}>
              {formData.bloodGroup}{formData.rhesus}
            </Text>
          </View>
        </View>

        {/* Historique médical */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Historique médical (optionnel)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={styles.textArea}
              placeholder="Indiquez toute information médicale pertinente (allergies, maladies, traitements...)"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.historiqueMedical}
              onChangeText={(value) => handleInputChange('historiqueMedical', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color="#1976D2" />
          <Text style={styles.infoText}>
            Vos informations de groupe sanguin sont utilisées pour vous envoyer des alertes pertinentes lorsqu'un patient a besoin de sang compatible.
          </Text>
        </View>

        {/* Bouton de mise à jour */}
        <View style={styles.buttonContainer}>
          {saving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY_RED} />
              <Text style={styles.savingText}>Mise à jour en cours...</Text>
            </View>
          ) : (
            <ButtonCustom
              color={COLORS.PRIMARY_RED}
              title="Enregistrer les modifications"
              onPress={handleUpdate}
            />
          )}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.PRIMARY_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarLabel: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.WHITE,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.BLACK,
  },
  phonePrefix: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 10,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  phoneInput: {
    flex: 1,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.BLACK,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  smallInput: {
    flex: 1,
    marginBottom: 0,
  },
  pickerContainer: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.BLACK,
    fontSize: 14,
  },
  bloodPreviewContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  bloodPreviewLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  bloodPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodPreviewText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  textAreaContainer: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    width: '100%',
    fontSize: 14,
    color: COLORS.BLACK,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  savingText: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
    fontWeight: '600',
  },
});

export default UpdateProviderProfile;
