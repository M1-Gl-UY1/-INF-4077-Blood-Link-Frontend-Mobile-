import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ButtonCustom from '../components/ButtonCustom';
import { COLORS } from '../constants/colors';
import BackgroundTop from '../assets/image_1.svg';
import BackgroundBottom from '../assets/image_2.svg';

const FirstScreen = ({navigation}) => {

    const handleSelectLogin = () => {
    navigation.navigate('Login', { 
      
    });
  };

  const handleSelectRegister = () => {
    navigation.navigate('SelectUser', { 
      
    });
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
      
      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.logoTitleContainer}>
          <Image
            source={require('../assets/logo_bloodlink_sfond.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <View style={styles.titleContainer}>
            <Text style={styles.titleRed}>Blood</Text>
            <Text style={styles.titleBlack}>Link</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <ButtonCustom 
            title="Se connecter" 
            onPress={handleSelectLogin} 
            color={COLORS.PRIMARY_RED} 
          />
          <ButtonCustom 
            title="S'inscrire" 
            onPress={handleSelectRegister} 
            color={COLORS.PRIMARY_BLUE} 
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 48,
    zIndex: 1,
  },
  logoTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 40,
    fontWeight: 900,
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 40,
    fontWeight: 900,
    color: COLORS.BLACK,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
});

export default FirstScreen;