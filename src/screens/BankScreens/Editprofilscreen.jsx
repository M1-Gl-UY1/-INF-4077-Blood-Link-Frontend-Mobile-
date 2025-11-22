import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import ButtonCustom from '../../components/ButtonCustom';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { firestoreService } from '../../services/firestoreService';

const EditProfilScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  // Charger les données du profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const profile = await firestoreService.getBloodBankByUid(user.uid);

        if (profile) {
          setFormData({
            name: profile.name || profile.username || '',
            email: profile.email || '',
            location: profile.location || '',
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger le profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdating(true);

      await firestoreService.updateBloodBank(user.uid, {
        name: formData.name.trim(),
        location: formData.location.trim(),
      });

      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.headerRight}>
            <Icon name="fitness" size={24} color={COLORS.PRIMARY_RED} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerRight}>
          <Icon name="fitness" size={24} color={COLORS.PRIMARY_RED} />
        </View>
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
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Icon name="business" size={40} color={COLORS.WHITE} />
            </View>
            <Text style={styles.avatarHint}>Banque de sang</Text>
          </View>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de la banque *</Text>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Icon name="business-outline" size={20} color={COLORS.GRAY_DARK} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom de la banque de sang"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Icon name="mail-outline" size={20} color={COLORS.GRAY_LIGHT} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputTextDisabled]}
                placeholder="Email"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={formData.email}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Icon name="lock-closed-outline" size={16} color={COLORS.GRAY_LIGHT} />
            </View>
            <Text style={styles.hintText}>L'email ne peut pas être modifié</Text>
          </View>

          {/* Localisation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <View style={[styles.inputContainer, errors.location && styles.inputError]}>
              <Icon name="location-outline" size={20} color={COLORS.GRAY_DARK} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Yaoundé, Cameroun"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Bouton de mise à jour */}
          <View style={styles.buttonContainer}>
            <ButtonCustom
              color={COLORS.PRIMARY_RED}
              title={isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
              onPress={handleUpdate}
              disabled={isUpdating}
            />
          </View>

          {/* Bouton annuler */}
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelLinkText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarHint: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.BLACK,
  },
  inputError: {
    borderColor: COLORS.PRIMARY_RED,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e8e8e8',
  },
  inputTextDisabled: {
    color: COLORS.GRAY_DARK,
  },
  errorText: {
    color: COLORS.PRIMARY_RED,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    color: COLORS.GRAY_DARK,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  cancelLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelLinkText: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
    textDecorationLine: 'underline',
  },
});

export default EditProfilScreen;
