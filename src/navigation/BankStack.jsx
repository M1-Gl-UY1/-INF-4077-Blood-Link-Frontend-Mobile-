import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BankHome from '../screens/BankScreens/BankHome';
import BankInventory from '../screens/BankScreens/BankInventory';
import BankProfile from '../screens/BankScreens/BankProfile';
import BankNavBar from '../components/BankNavBar';

const Tab = createBottomTabNavigator();

const BankStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BankNavBar {...props} />}
    >
      <Tab.Screen name="Bank" component={BankHome} />
      <Tab.Screen name="BankInventory" component={BankInventory} />
      <Tab.Screen name="BankProfile" component={BankProfile} />
    </Tab.Navigator>
  );
};

export default BankStack;
