import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import BackgroundTop from '../../assets/image_1.svg';
import BackgroundBottom from '../../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../../components/ButtonCustom';

const SignUpUserScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sexe: 'Masculin',
    groupeSanguin: 'A',
    rhesus: 'Positif',
    naissance: '',
    telephone: '',
    localisation: '',
    password: '',
    confirmPassword: '',
    dossierMedical: null,
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    console.log('Inscription donneur:', formData);
    // Navigation vers le menu Provider
    navigation.navigate('ProviderStack');
  };

  return (
    <View style={styles.container}>
      {/* Image de fond supérieure SVG */}
      <View style={styles.topBackground}>
        <BackgroundTop 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid slice"
        />
      </View>
      
      {/* Image de fond inférieure SVG */}
      <View style={styles.bottomBackground}>
        <BackgroundBottom 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid slice"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription</Text>
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
          <Text style={styles.welcomeText}>Bienvennue sur</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.titleRed}>Blood</Text>
            <Text style={styles.titleBlack}>Link !</Text>
          </View>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Nom utilisateur */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom utilisateur *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.nom}
              onChangeText={(value) => handleInputChange('nom', value)}
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
            />
          </View>

          {/* Ligne: Sexe, Groupe sanguin, Rhésus */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.smallInput]}>
              <Text style={styles.label}>Sexe</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{formData.sexe}</Text>
                <Icon name="chevron-down" size={20} color={COLORS.BLACK} />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.smallInput]}>
              <Text style={styles.label}>Groupe sanguin</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{formData.groupeSanguin}</Text>
                <Icon name="chevron-down" size={20} color={COLORS.BLACK} />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.smallInput]}>
              <Text style={styles.label}>Rhésus</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{formData.rhesus}</Text>
                <Icon name="chevron-down" size={20} color={COLORS.BLACK} />
              </View>
            </View>
          </View>

          {/* Ligne: Naissance et Téléphone */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Naissance *</Text>
              <TextInput
                style={styles.input}
                placeholder="mm/dd/yyyy"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={formData.naissance}
                onChangeText={(value) => handleInputChange('naissance', value)}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Téléphone *</Text>
              <View style={styles.phoneContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Téléphone"
                  placeholderTextColor={COLORS.GRAY_LIGHT}
                  value={formData.telephone}
                  onChangeText={(value) => handleInputChange('telephone', value)}
                  keyboardType="phone-pad"
                />
                <View style={styles.flagContainer}>
                  <Text style={styles.flag}>🇨🇲</Text>
                </View>
              </View>
            </View>
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
            />
          </View>

          {/* Dossier médical */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dossier médical</Text>
            <TouchableOpacity style={styles.uploadContainer}>
              <Icon name="document" size={40} color={COLORS.PRIMARY_RED} />
            </TouchableOpacity>
          </View>

          {/* Conditions */}
          <View style={styles.conditionsContainer}>
            <Text style={styles.conditionsText}>
              En continuant vous acceptez nos{' '}
              <Text style={styles.conditionsLink}>conditions d'utilisation</Text>
              {' '}et{' '}
              <Text style={styles.conditionsLink}>politique de confidentialité</Text>.
            </Text>
          </View>
        </View>

        {/* Bouton continuer */}
        <View style={styles.buttonContainer}>
          <ButtonCustom 
            title="Continuer" 
            onPress={handleContinue} 
            color={COLORS.PRIMARY_RED}
          />
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
    fontSize: 20,
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
    marginTop: 10,
    marginBottom: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 28,
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
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  smallInput: {
    flex: 1,
  },
  pickerContainer: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  phoneContainer: {
    position: 'relative',
  },
  phoneInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  flagContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS.PRIMARY_RED,
    alignSelf: 'center',
    marginTop: 6,
  },
  flag: {
    fontSize: 18,
  },
  uploadContainer: {
    height: 80,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  conditionsContainer: {
    marginTop: 10,
  },
  conditionsText: {
    fontSize: 12,
    color: COLORS.BLACK,
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
  },
});

export default SignUpUserScreen;