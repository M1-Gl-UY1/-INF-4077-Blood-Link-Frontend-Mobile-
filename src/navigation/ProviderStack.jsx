import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderHome from '../screens/ProviderHome';
import ProviderGift from '../screens/ProviderGift';
import ProviderProfile from '../screens/ProviderProfile';
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
