import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import BackgroundTop from '../assets/image_1.svg';
import BackgroundBottom from '../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../components/ButtonCustom';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Logique de connexion ici
    console.log('Login avec:', email, password);
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
        <Text style={styles.headerTitle}>Connexion</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.formWrapper}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo_bloodlink_sfond.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Titre de bienvenue */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Bon retour chez</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.titleRed}>Blood</Text>
              <Text style={styles.titleBlack}>Link !</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre email"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Bouton de connexion */}
        <View style={styles.buttonContainer}>
          <ButtonCustom 
            title="Se connecter" 
            onPress={handleLogin} 
            color={COLORS.PRIMARY_RED} 
          />
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 48,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  formWrapper: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.BLACK,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_RED,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default LoginScreen;