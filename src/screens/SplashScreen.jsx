import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('First');
    }, 2000); // Redirige vers FirstScreen après 3 secondes

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require('../assets/logo_bloodlink_sfond.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
            <View style={styles.title}>
                <Text style={styles.titleRed}>Blood</Text>
                <Text style={styles.titleBlack}>Link</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flexDirection: 'row',
  },
  titleRed: {
    fontSize: 35,
    fontWeight: 900,
    color: COLORS.PRIMARY_RED,
  },
  titleBlack: {
    fontSize: 35,
    fontWeight: 900,
    color: COLORS.BLACK,
  },
});

export default SplashScreen;