import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from '../constants/colors';

const NavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Récupère le nom de l'écran actuellement affiché dans le ProviderStack
  const currentRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;

  const isActive = (name) => currentRouteName === name;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProviderStack', { screen: 'Provider' })}>
        <Ionicons
          name="home"
          size={24}
          color={isActive('Provider') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProviderStack', { screen: 'ProviderGift' })}>
        <Ionicons
          name="trophy"
          size={24}
          color={isActive('ProviderGift') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProviderStack', { screen: 'ProviderProfile' })}>
        <Ionicons
          name="person"
          size={24}
          color={isActive('ProviderProfile') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
});
