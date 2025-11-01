import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderHome from '../screens/ProviderScreens/ProviderHome';
import ProviderGift from '../screens/ProviderScreens/ProviderGift';
import ProviderProfile from '../screens/ProviderScreens/ProviderProfile';
import ProviderLayout from './ProviderLayout';

const Stack = createNativeStackNavigator();

const ProviderStack = () => {
  return (
    <ProviderLayout>
      <Stack.Navigator screenOptions={{ headerShown: false}}>
        <Stack.Screen name="Provider" component={ProviderHome} />
        <Stack.Screen name="ProviderGift" component={ProviderGift} />
        <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
      </Stack.Navigator>
    </ProviderLayout>
  );
};

export default ProviderStack;
