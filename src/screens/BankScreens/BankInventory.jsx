import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { COLORS } from '../../constants/colors';
import ActiveAlertsScreen from './ActiveAlertsScreen';
import AlertRequestsScreen from './AlertRequestsScreen';

const Tab = createMaterialTopTabNavigator();

const BankInventory = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.BLACK,
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarIndicatorStyle: {
            backgroundColor: COLORS.BLACK,
            height: 2,
          },
          tabBarStyle: {
            backgroundColor: COLORS.WHITE,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          },
        }}
      >
        <Tab.Screen 
          name="ActiveAlerts" 
          component={ActiveAlertsScreen}
          options={{
            tabBarLabel: 'Alertes en cours',
          }}
        />
        <Tab.Screen 
          name="AlertRequests" 
          component={AlertRequestsScreen}
          options={{
            tabBarLabel: 'requête d\'alerte',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
});

export default BankInventory;