import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from '../constants/colors';

const BankNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Récupère le nom de l'écran actuellement affiché dans le BankStack
  const currentRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;

  const isActive = (name) => currentRouteName === name;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BankStack', { screen: 'Bank' })}>
        <Ionicons
          name="home"
          size={24}
          color={isActive('Bank') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BankStack', { screen: 'BankInventory' })}>
        <Ionicons
          name="flask"
          size={24}
          color={isActive('BankInventory') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BankStack', { screen: 'BankProfile' })}>
        <Ionicons
          name="person"
          size={24}
          color={isActive('BankProfile') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default BankNavBar;

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
