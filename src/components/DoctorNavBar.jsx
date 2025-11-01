import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from '../constants/colors';

const DoctorNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Récupère le nom de l'écran actuellement affiché dans le DoctorStack
  const currentRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;

  const isActive = (name) => currentRouteName === name;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DoctorStack', { screen: 'Doctor' })}>
        <Ionicons
          name="home"
          size={24}
          color={isActive('Doctor') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DoctorStack', { screen: 'DoctorAppointments' })}>
        <Ionicons
          name="calendar"
          size={24}
          color={isActive('DoctorAppointments') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DoctorStack', { screen: 'DoctorProfile' })}>
        <Ionicons
          name="person"
          size={24}
          color={isActive('DoctorProfile') ? COLORS.PRIMARY_RED : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DoctorNavBar;

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
