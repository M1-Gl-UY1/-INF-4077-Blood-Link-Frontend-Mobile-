import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import BackgroundTop from '../../assets/image_1.svg';
import BackgroundBottom from '../../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../../components/ButtonCustom';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { firestoreService } from '../../services/firestoreService';
import { DOCTOR_GRADES, DOCTOR_SPECIALTIES } from '../../constants/enums';

const { width, height } = Dimensions.get('window');

const SignUpDoctorScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    grade: 'INT',
    speciality: 'GP',
    bloodBankId: '',
    password: '',
    confirmPassword: '',
  });

  const [bloodBanks, setBloodBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la liste des banques de sang au montage
  useEffect(() => {
    loadBloodBanks();
  }, []);

  const loadBloodBanks = async () => {
    try {
      setLoadingBanks(true);
      const banks = await firestoreService.getAllBloodBanks();
      setBloodBanks(banks);

      // Sélectionner la première banque par défaut
      if (banks.length > 0) {
        setFormData(prev => ({ ...prev, bloodBankId: banks[0].id }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des banques:', err);
      setError('Impossible de charger la liste des banques de sang');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!formData.bloodBankId) {
      setError('Veuillez sélectionner une banque de sang');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Étape 1: Inscription via Firebase Auth + création profil Firestore
      await register({
        username: formData.nom.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'doctor',
      });

      // Étape 2: Mettre à jour le profil avec les informations supplémentaires
      const { default: auth } = await import('@react-native-firebase/auth');
      const currentUser = auth().currentUser;

      if (currentUser) {
        // Mettre à jour le profil Doctor avec toutes les informations
        await firestoreService.updateDoctor(currentUser.uid, {
          name: formData.nom.trim(),
          grade: formData.grade,
          speciality: formData.speciality,
          bloodBankId: formData.bloodBankId,
        });
      }

      // La navigation sera gérée automatiquement par AppNavigator
    } catch (err) {
      console.error('Erreur d\'inscription:', err);

      const errorMessage = err.message || '';
      if (errorMessage.includes('email-already-in-use') || errorMessage.includes('déjà utilisé')) {
        setError('Cet email est déjà utilisé');
      } else if (errorMessage.includes('weak-password')) {
        setError('Le mot de passe est trop faible');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Email invalide');
      } else {
        setError(errorMessage || 'Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGradeLabel = (value) => {
    const grade = DOCTOR_GRADES.find(g => g.value === value);
    return grade ? grade.label : value;
  };

  const getSpecialityLabel = (value) => {
    const spec = DOCTOR_SPECIALTIES.find(s => s.value === value);
    return spec ? spec.label : value;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* Background SVG */}
      <View style={styles.topBackground}>
        <BackgroundTop width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      <View style={styles.bottomBackground}>
        <BackgroundBottom width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription Médecin</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo et titre */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo_bloodlink_sfond.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Bienvenue sur</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.titleRed}>Blood</Text>
            <Text style={styles.titleBlack}>Link !</Text>
          </View>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Message d'erreur */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.PRIMARY_RED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Loading des banques */}
          {loadingBanks && (
            <View style={styles.loadingBanksContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY_RED} />
              <Text style={styles.loadingBanksText}>Chargement des banques de sang...</Text>
            </View>
          )}

          {/* Nom utilisateur */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dr. Jean Dupont"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.nom}
              onChangeText={(value) => handleInputChange('nom', value)}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="docteur@hopital.com"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Grade et Spécialité en ligne */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Grade *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.grade}
                  onValueChange={(value) => handleInputChange('grade', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!loading}
                >
                  {DOCTOR_GRADES.map((grade) => (
                    <Picker.Item key={grade.value} label={grade.label} value={grade.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Spécialité *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.speciality}
                  onValueChange={(value) => handleInputChange('speciality', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!loading}
                >
                  {DOCTOR_SPECIALTIES.map((spec) => (
                    <Picker.Item key={spec.value} label={spec.label} value={spec.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Banque de sang */}
          {!loadingBanks && bloodBanks.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banque de sang affiliée *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bloodBankId}
                  onValueChange={(value) => handleInputChange('bloodBankId', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                  enabled={!loading}
                >
                  {bloodBanks.map((bank) => (
                    <Picker.Item key={bank.id} label={bank.name || 'Banque sans nom'} value={bank.id} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.helperText}>
                Sélectionnez l'hôpital/banque où vous exercez
              </Text>
            </View>
          )}

          {!loadingBanks && bloodBanks.length === 0 && (
            <View style={styles.noBanksContainer}>
              <Icon name="alert-circle-outline" size={24} color={COLORS.GRAY_DARK} />
              <Text style={styles.noBanksText}>
                Aucune banque de sang disponible. Veuillez réessayer plus tard.
              </Text>
            </View>
          )}

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Conditions */}
          <View style={styles.conditionsContainer}>
            <Text style={styles.conditionsText}>
              En continuant vous acceptez nos{' '}
              <Text style={styles.conditionsLink}>conditions d'utilisation</Text> et{' '}
              <Text style={styles.conditionsLink}>politique de confidentialité</Text>.
            </Text>
          </View>
        </View>

        {/* Bouton continuer */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          ) : (
            <ButtonCustom
              title="S'inscrire"
              onPress={handleContinue}
              color={COLORS.PRIMARY_RED}
              disabled={loading || loadingBanks || bloodBanks.length === 0}
            />
          )}
        </View>

        {/* Lien connexion */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    width: '100%',
    overflow: 'hidden',
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    zIndex: 2,
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.BLACK,
  },
  formContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
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
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingBanksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingBanksText: {
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.BLACK,
  },
  noBanksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  noBanksText: {
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  conditionsContainer: {
    marginTop: 8,
  },
  conditionsText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 18,
  },
  conditionsLink: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.PRIMARY_BLUE,
    fontWeight: '600',
  },
});

export default SignUpDoctorScreen;
