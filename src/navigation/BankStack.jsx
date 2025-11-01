import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BankHome from '../screens/BankScreens/BankHome';
import BankInventory from '../screens/BankScreens/BankInventory';
import BankProfile from '../screens/BankScreens/BankProfile';
import BankLayout from './BankLayout';

const Stack = createNativeStackNavigator();

const BankStack = () => {
  return (
    <BankLayout>
      <Stack.Navigator screenOptions={{ headerShown: false}}>
        <Stack.Screen name="Bank" component={BankHome} />
        <Stack.Screen name="BankInventory" component={BankInventory} />
        <Stack.Screen name="BankProfile" component={BankProfile} />
      </Stack.Navigator>
    </BankLayout>
  );
};

export default BankStack;
