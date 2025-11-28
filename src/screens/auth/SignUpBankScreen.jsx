import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import BackgroundTop from '../../assets/image_1.svg';
import BackgroundBottom from '../../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../../components/ButtonCustom';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { firestoreService } from '../../services/firestoreService';

const SignUpBankScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    localisation: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom de la banque est requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return false;
    }

    if (!formData.localisation.trim()) {
      setError('La localisation est requise');
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

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Étape 1 : Inscription Firebase (crée le compte Auth + profil Firestore)
      await register({
        username: formData.nom.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'bank',
      });

      // Étape 2 : Mettre à jour le profil avec les informations supplémentaires
      // Récupérer l'utilisateur connecté depuis Firebase Auth
      const { default: auth } = await import('@react-native-firebase/auth');
      const currentUser = auth().currentUser;

      if (currentUser) {
        // Mettre à jour le profil BloodBank avec name et location
        await firestoreService.updateBloodBank(currentUser.uid, {
          name: formData.nom.trim(),
          location: formData.localisation.trim(),
        });
      }

      // La navigation sera gérée automatiquement par AppNavigator
      // car isAuthenticated passera à true
    } catch (err) {
      console.error('Erreur d\'inscription:', err);

      const errorMessage = err.message || '';
      const errorCode = err.code || '';

      // Gestion des erreurs Firebase Auth
      if (errorCode.includes('email-already-in-use') || errorMessage.includes('email-already-in-use') || errorMessage.includes('déjà utilisé')) {
        Alert.alert(
          'Email déjà utilisé',
          'Un compte existe déjà avec cet email. Voulez-vous vous connecter ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Se connecter',
              onPress: () => navigation.navigate('Login')
            },
          ]
        );
        setError('Cet email appartient déjà à un compte existant');
      } else if (errorCode.includes('weak-password') || errorMessage.includes('weak-password')) {
        setError('Le mot de passe est trop faible. Utilisez au moins 6 caractères.');
      } else if (errorCode.includes('invalid-email') || errorMessage.includes('invalid-email')) {
        setError('Format d\'email invalide');
      } else if (errorCode.includes('network') || errorMessage.includes('network')) {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      } else if (errorCode.includes('too-many-requests') || errorMessage.includes('too-many-requests')) {
        setError('Trop de tentatives. Veuillez réessayer plus tard.');
      } else {
        setError(errorMessage || 'Impossible de s\'inscrire. Vérifiez votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY_RED} />

      {/* Image de fond supérieure SVG */}
      <View style={styles.topBackground}>
        <BackgroundTop width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Image de fond inférieure SVG */}
      <View style={styles.bottomBackground}>
        <BackgroundBottom width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription Banque</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          {/* Nom de la banque */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de la banque *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de la banque de sang"
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
              placeholder="Email"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Localisation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ville, Quartier, Adresse"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.localisation}
              onChangeText={(value) => handleInputChange('localisation', value)}
              editable={!loading}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Confirmer */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
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
              title="Continuer"
              onPress={handleContinue}
              color={COLORS.PRIMARY_RED}
              disabled={loading}
            />
          )}
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
    height: '50%',
    width: '100%',
    overflow: 'hidden',
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.BLACK,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    textAlignVertical: 'top',
  },
  conditionsContainer: {
    marginTop: 16,
  },
  conditionsText: {
    fontSize: 11,
    color: COLORS.BLACK,
    textAlign: 'center',
    lineHeight: 16,
  },
  conditionsLink: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
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
});

export default SignUpBankScreen;
