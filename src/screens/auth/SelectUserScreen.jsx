import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import BackgroundTop from '../../assets/image_1.svg';
import BackgroundBottom from '../../assets/image_2.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonCustom from '../../components/ButtonCustom';

const SelectUserScreen = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState('');

  const handleContinue = () => {
    if (selectedType === 'Médecin') {
      navigation.navigate('SignUpDoctor');
    } else if (selectedType === 'Donneur de sang') {
      navigation.navigate('SignUpUser');
    } else if (selectedType === 'Banque de sang') {
      navigation.navigate('SignUpBank');
    }
  };

  const userTypes = [
    { id: 'Médecin', label: 'Médecin' },
    { id: 'Donneur de sang', label: 'Donneur de sang' },
    { id: 'Banque de sang', label: 'Banque de sang' },
  ];

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

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.formWrapper}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
                source={require('../../assets/logo_bloodlink_sfond.png')}
                style={styles.logo}
                resizeMode="contain"
              />
          </View>

          {/* Titre de bienvenue */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Bienvennue sur</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.titleRed}>Blood</Text>
              <Text style={styles.titleBlack}>Link !</Text>
            </View>
          </View>

          {/* Question et options */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>Quel type de personnel êtes vous ?</Text>
            
            <View style={styles.optionsContainer}>
              {userTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionButton,
                    selectedType === type.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <View style={styles.radioOuter}>
                    {selectedType === type.id && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      selectedType === type.id && styles.optionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bouton continuer */}
        <View style={styles.buttonContainer}>
          <ButtonCustom 
            title="Continuer" 
            onPress={handleContinue} 
            color={COLORS.PRIMARY_RED}
            disabled={!selectedType}
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
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoSvg: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.BLACK,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 8,
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
  questionText: {
    fontSize: 16,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
  },
  optionButtonSelected: {
    borderColor: COLORS.PRIMARY_RED,
    backgroundColor: COLORS.WHITE,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default SelectUserScreen;