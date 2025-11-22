import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDoctorProfile, useBloodBanks } from '../../hooks/useDoctorData';
import { doctorService } from '../../services/doctorService';
import { DOCTOR_GRADES, DOCTOR_SPECIALTIES } from '../../constants/enums';

const EditDoctorProfile = () => {
  const navigation = useNavigation();
  const { profile, loading: profileLoading, refreshProfile } = useDoctorProfile();
  const { bloodBanks, loading: banksLoading } = useBloodBanks();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    speciality: '',
    bloodBankId: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || profile.username || '',
        grade: profile.grade || 'INT',
        speciality: profile.speciality || 'GP',
        bloodBankId: profile.bloodBankId || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return false;
    }

    if (!formData.bloodBankId) {
      setError('Veuillez sélectionner une banque de sang');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirmer les modifications',
      'Voulez-vous enregistrer ces modifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Enregistrer',
          onPress: async () => {
            try {
              setSaving(true);
              setError('');

              await doctorService.updateDoctorProfile(profile.id, {
                name: formData.name.trim(),
                grade: formData.grade,
                speciality: formData.speciality,
                bloodBankId: formData.bloodBankId,
              });

              await refreshProfile();

              Alert.alert(
                'Succès',
                'Votre profil a été mis à jour avec succès',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              console.error('Erreur mise à jour profil:', err);
              setError(err.message || 'Impossible de mettre à jour le profil');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (profileLoading || banksLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement...</Text>
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
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Icon name="medical" size={40} color={COLORS.WHITE} />
            </View>
            <Text style={styles.avatarHint}>Dr. {formData.name || 'Médecin'}</Text>
          </View>

          {/* Message d'erreur */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.PRIMARY_RED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Formulaire */}
          <View style={styles.formCard}>
            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom complet"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                editable={!saving}
              />
            </View>

            {/* Email (lecture seule) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{profile?.email || 'Non défini'}</Text>
                <Icon name="lock-closed" size={16} color={COLORS.GRAY_LIGHT} />
              </View>
              <Text style={styles.helperText}>L'email ne peut pas être modifié</Text>
            </View>

            {/* Grade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grade *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.grade}
                  onValueChange={(value) => handleInputChange('grade', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!saving}
                >
                  {DOCTOR_GRADES.map((grade) => (
                    <Picker.Item key={grade.value} label={grade.label} value={grade.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Spécialité */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spécialité *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.speciality}
                  onValueChange={(value) => handleInputChange('speciality', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!saving}
                >
                  {DOCTOR_SPECIALTIES.map((spec) => (
                    <Picker.Item key={spec.value} label={spec.label} value={spec.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Banque de sang */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banque de sang affiliée *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bloodBankId}
                  onValueChange={(value) => handleInputChange('bloodBankId', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!saving}
                >
                  {bloodBanks.map((bank) => (
                    <Picker.Item
                      key={bank.id}
                      label={bank.name || 'Banque sans nom'}
                      value={bank.id}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.helperText}>
                Changer de banque peut affecter vos demandes en cours
              </Text>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <>
                  <Icon name="checkmark" size={20} color={COLORS.WHITE} />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
    backgroundColor: COLORS.PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarHint: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorText: {
    color: COLORS.PRIMARY_RED,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  formCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.BLACK,
    backgroundColor: '#FAFAFA',
  },
  readOnlyInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyText: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.BLACK,
    marginLeft: -8,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.WHITE,
  },
  cancelButtonText: {
    color: COLORS.GRAY_DARK,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditDoctorProfile;
