import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import BackgroundTop from '../../assets/image_1.svg';
import BackgroundBottom from '../../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../../components/ButtonCustom';

const SignUpDoctorScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    grade: 'Generaliste',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    console.log('Inscription médecin:', formData);
    // Navigation ou logique d'inscription
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

          {/* Grade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{formData.grade}</Text>
              <Icon name="chevron-down" size={20} color={COLORS.BLACK} />
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
    marginTop: 20,
    marginBottom: 15,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 30,
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
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.BLACK,
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

export default SignUpDoctorScreen;